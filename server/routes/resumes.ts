import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { r2 } from "../lib/storage/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { upload } from "../lib/storage/multer";
import { requireFirebaseAuth } from "../lib/firebase/middleware";
import { randomUUID } from "crypto";
import { logger } from "../lib/monitoring/logger";
import logAudit from "../lib/monitoring/audit";
import parsePDF from "../lib/storage/parse";

const resumeRouter = express.Router();

/**
 * @route GET /resumes
 * @desc Retrieve URL of user's resume
 * @access Private
 *
 * @returns {200} { url }
 * @returns {401} Unauthorized
 * @returns {404} Resume URL not found
 * @returns {500} Internal server error
 */
resumeRouter.get(
  "/",
  requireFirebaseAuth(),
  async (req: Request, res: Response) => {
    const { userId } = req.auth;

    if (!userId) {
      logger.warn("Unauthorised access attempt", { route: "/your-resume" });
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const resume = await prisma.resume.findUnique({
        where: {
          userId: userId,
        },
        select: {
          key: true,
        },
      });

      if (!resume) {
        logger.warn("Resume URL not found", { userId });
        return res.status(404).json({ message: "Resume URL not found" });
      }

      // Retrieve URL from R2 bucket
      const url = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: resume.key,
        }),
        { expiresIn: 300 },
      );

      res.json({ url });
    } catch (error) {
      logger.error("Failed to retrieve resume", { userId, error });
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

/**
 * @route GET /resumes/tailored
 * @desc Retrieve all user's tailored resumes
 * @access Private
 *
 * @returns {200} { id, name, applicationId, selectedAt }[]
 * @returns {401} Unauthorized
 * @returns {500} Internal server error
 */
resumeRouter.get(
  "/tailored",
  requireFirebaseAuth(),
  async (req: Request, res: Response) => {
    const { userId } = req.auth;

    if (!userId) {
      logger.warn("Unauthorised access attempt", {
        route: "/resumes/tailored",
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const resumes = await prisma.tailoredResume.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          name: true,
          applicationId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({ resumes });
    } catch (error) {
      logger.error("Failed to retrieve resume", { userId, error });
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

/**
 * @route GET /resumes/tailored/:tailoredResumeId
 * @desc Retrieve URL of individual tailored resume
 * @access Private
 *
 * @param {string} tailoredResumeId - Tailored resume ID
 *
 * @returns {200} { url }
 * @returns {401} Unauthorized
 * @returns {404} Tailored resume not found
 * @returns {500} Internal server error
 */
resumeRouter.get(
  "/tailored/:tailoredResumeId",
  requireFirebaseAuth(),
  async (req: Request<{ tailoredResumeId: string }>, res: Response) => {
    const { tailoredResumeId } = req.params;
    const { userId } = req.auth;

    if (!userId) {
      logger.warn("Unauthorised access attempt", {
        route: "/resumes/tailored",
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Retrieve PDF key
      const tailoredResume = await prisma.tailoredResume.findUnique({
        where: {
          id: tailoredResumeId,
          userId,
        },
        select: {
          key: true,
        },
      });

      if (!tailoredResume) {
        return res.status(404).json({ message: "Tailored resume not found" });
      }

      // Retrieve URL from R2 bucket
      const url = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: tailoredResume.key,
        }),
        { expiresIn: 300 },
      );

      res.json({ url });
    } catch (error) {
      logger.error("Failed to retrieve tailored resume", { userId, error });
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

/**
 * @route POST /resumes/upload
 * @desc Upload or update resume
 * @access Private
 *
 * @returns {201} { id, message: "File sent successfully" }
 * @returns {400} No file uploaded | File must be a valid PDF | Failed to parse resume
 * @returns {401} Unauthorized
 * @returns {500} Internal server error
 */
resumeRouter.post(
  "/upload",
  requireFirebaseAuth(),
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { userId } = req.auth;
    const { file } = req;

    if (!userId) {
      logger.warn("Unauthorised access attempt", { route: "/your-resume" });
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!file) {
      logger.warn("No file uploaded", { userId, route: "your-resume" });
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file contents
    const isPDF = file.buffer.slice(0, 4).toString() === "%PDF";
    if (!isPDF) {
      return res.status(400).json({ message: "File must be a valid PDF" });
    }

    const ext = file.originalname.split(".").pop();
    const key = `uploads/${randomUUID()}.${ext}`;
    let uploadedKey: string | null = null;

    try {
      const existing = await prisma.resume.findUnique({
        where: {
          userId: userId,
        },
        select: {
          key: true,
        },
      });

      const text = await parsePDF(file.buffer);
      if (!text) {
        logger.error("Failed to parse PDF", { userId });
        return res.status(400).json({ message: "Failed to parse resume" });
      }

      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      uploadedKey = key;

      const resume = await prisma.resume.upsert({
        where: {
          userId: userId,
        },
        update: {
          key,
          text,
        },
        create: {
          key: key!,
          userId: userId!,
          text,
        },
      });

      await logAudit(
        userId!,
        "RESUME_UPLOADED",
        existing ? "Resume replaced" : "Initial upload",
        "Resume",
        resume.id,
      );

      res
        .status(201)
        .json({ id: resume.id, message: "File sent successfully" });

      // Delete old file separately (best-effort, won't cascade on failure)
      if (existing) {
        try {
          await r2.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME!,
              Key: existing.key,
            }),
          );
        } catch (deleteError) {
          logger.warn("Failed to delete old resume", {
            userId,
            key: existing.key,
            error: deleteError,
          });
        }
      }
    } catch (error) {
      if (uploadedKey) {
        try {
          await r2.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME!,
              Key: uploadedKey,
            }),
          );
        } catch (cleanupError) {
          logger.error("Failed to cleanup uploaded resume", {
            userId,
            key: uploadedKey,
            error: cleanupError,
          });
        }
      }
      logger.error("Failed to upload file", { userId, error });
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export { resumeRouter };
