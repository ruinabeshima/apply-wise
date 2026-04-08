import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireFirebaseAuth } from "../lib/firebase/middleware";
import { logger } from "../lib/monitoring/logger";
import logAudit from "../lib/monitoring/audit";

const authRouter = express.Router();

/**
 * @route POST /auth/sync
 * @desc Create or update the authenticated user in the database
 * @access Private
 *
 * @returns {200} {ok: true}
 * @returns {400} Missing user info
 * @returns {401} Unauthorized
 * @returns {500} Internal server error
 */
authRouter.post(
  "/sync",
  requireFirebaseAuth(),
  async (req: Request, res: Response) => {
    const { userId, email, imageUrl } = req.auth;
    if (!userId || !email) {
      return res.status(400).json({ message: "Missing user info" });
    }

    try {
      await prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email,
          imageUrl: imageUrl ?? null,
        },
        update: {
          email,
          imageUrl: imageUrl ?? null,
        },
      });

      return res.status(200).json({ ok: true });
    } catch (error) {
      logger.error("Failed to sync user", { userId, error });
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

/**
 * @route GET /auth/status
 * @desc Get user's onboarding status
 * @access Private
 *
 * @returns {200} {onboardingComplete}
 * @returns {401} Unauthorized
 * @returns {404} User not found
 * @returns {500} Internal server error
 */
authRouter.get(
  "/status",
  requireFirebaseAuth(),
  async (req: Request, res: Response) => {
    const { userId } = req.auth;

    if (!userId) {
      logger.warn("Unauthorised access attempt", { for: "onboarding status" });
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const data = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          onboarding_complete: true,
        },
      });

      if (!data) {
        logger.warn("Failed to get user data", { userId });
        return res.status(404).json({ message: "User not found" });
      }

      return res
        .status(200)
        .json({ onboardingComplete: data.onboarding_complete });
    } catch (error) {
      logger.error("Failed to get onboarding status", { userId, error });
      return res.status(500).json({ message: "Failed to fetch status" });
    }
  },
);

/**
 * @route PATCH /auth/status
 * @desc Update user's onboarding status
 * @access Private
 *
 * @returns {200} { message: "Onboarding status updated successfully" }
 * @returns {401} Unauthorized
 * @returns {404} User not found
 * @returns {500} Internal server error
 */
authRouter.patch(
  "/status",
  requireFirebaseAuth(),
  async (req: Request, res: Response) => {
    const { userId } = req.auth;

    if (!userId) {
      logger.warn("Unauthorised access attempt", { for: "onboarding status" });
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          onboarding_complete: true,
        },
      });

      await logAudit(userId, "ONBOARDING_COMPLETED", undefined, "User", userId);

      return res
        .status(200)
        .json({ message: "Onboarding status updated successfully" });
    } catch (error) {
      if ((error as any).code === "P2025") {
        return res.status(404).json({ message: "User not found" });
      }
      logger.error("Failed to update onboarding status", { userId, error });
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

export { authRouter };
