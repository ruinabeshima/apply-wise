import express, { NextFunction, Request, Response } from "express";
import { requireFirebaseAuth } from "../lib/firebase/middleware";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/monitoring/logger";
import { AppError } from "../lib/errors/AppError";

const tailoringRouter = express.Router();

/**
 * @route GET /tailoring/status/:applicationId
 * @desc Retrieve tailoring session status for an application
 * @access Private
 *
 * @param {string} applicationId - Application ID
 *
 * @returns {200} { status: "NONE", message }
 * @returns {200} { status: "PENDING" | "REVIEWED", sessionId, suggestions }
 * @returns {200} { status: "TAILORED", sessionId, tailoredResumeId }
 * @returns {401} Unauthorized
 * @returns {404} Tailored resume not found
 * @returns {500} Internal server error
 */
tailoringRouter.get(
  "/status/:applicationId",
  requireFirebaseAuth(),
  async (
    req: Request<{ applicationId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { userId } = req.auth;
    const { applicationId } = req.params;

    try {
      if (!userId) {
        logger.warn("Unauthorized access attempt", {
          endpoint: `GET /tailoring/status/${applicationId}`,
        });
        throw new AppError(401, "Unauthorized");
      }

      const session = await prisma.tailoringSession.findFirst({
        where: { userId, applicationId },
      });
      if (!session) {
        return res
          .status(200)
          .json({ status: "NONE", message: "Resume has not been tailored" });
      }

      if (session.status === "PENDING" || session.status === "REVIEWED") {
        return res.status(200).json({
          status: session.status,
          sessionId: session.id,
          suggestions: session.suggestions,
        });
      }

      if (session.status === "TAILORED") {
        const tailoredResume = await prisma.tailoredResume.findFirst({
          where: {
            userId,
            applicationId,
          },
          select: {
            id: true,
            key: true,
          },
        });

        if (!tailoredResume) {
          logger.warn("Tailored resume key not found", {
            userId,
            applicationId,
          });
          throw new AppError(404, "Tailored resume key not found");
        }

        return res.status(200).json({
          status: session.status,
          sessionId: session.id,
          tailoredResumeId: tailoredResume.id,
        });
      }

      logger.warn("Unexpected session status", {
        userId,
        status: session.status,
      });
      throw new AppError(500, "Unexpected session status");
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error("Failed to retrieve tailored status", { userId, error });
      }
      next(error);
    }
  },
);

/**
 * @route GET /tailoring/count
 * @desc Retrieve count of user's tailoring sessions
 * @access Private
 *
 * @returns {200} { count }
 * @returns {401} Unauthorized
 * @returns {500} Internal server error
 */
tailoringRouter.get(
  "/count",
  requireFirebaseAuth(),
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.auth;

    try {
      if (!userId) {
        logger.warn("Unauthorized access attempt", {
          endpoint: `GET /tailoring/count`,
        });
        throw new AppError(401, "Unauthorized");
      }

      const count = await prisma.tailoringSession.count({
        where: { userId },
      });

      return res.status(200).json({ count });
    } catch (error) {
      if (!(error instanceof AppError)) {
        logger.error("Failed to retrieve tailoring session count", {
          userId,
          error,
        });
      }
      next(error);
    }
  },
);

export { tailoringRouter };
