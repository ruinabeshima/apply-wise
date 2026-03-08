import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../lib/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { upload } from "../lib/multer";
import { requireAuth } from "@clerk/express";
import { v4 as uuidv4 } from "uuid";

const resumeRouter = express.Router();

resumeRouter.get("/", requireAuth(), async (req: Request, res: Response) => {
  const { userId } = req.auth;

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
      res.status(404).json({ message: "Resume not found" });
      return;
    }

    const url = await getSignedUrl(
      r2,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: resume.key,
      }),
      { expiresIn: 3600 },
    );

    res.json({ url });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

resumeRouter.post(
  "/upload",
  requireAuth(),
  upload.single("file"),
  async (req: Request, res: Response) => {
    const { userId } = req.auth;
    const { file } = req;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const ext = file.originalname.split(".").pop();
    const key = `uploads/${uuidv4()}.${ext}`;

    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const resume = await prisma.resume.create({
        data: {
          key: key!,
          userId: userId!,
        },
      });

      res
        .status(201)
        .json({ id: resume.id, message: "File sent successfully" });
    } catch {
      res.status(500).json({ message: "Failed to upload file" });
    }
  },
);

export { resumeRouter };
