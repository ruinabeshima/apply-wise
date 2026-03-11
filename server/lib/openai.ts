import OpenAI from "openai";
import { logger } from "./logger";
import { prisma } from "../lib/prisma";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getApplicationInfo(
  applicationId: string,
  userId: string,
): Promise<string[] | null> {
  try {
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: {
        company: true,
        role: true,
        status: true,
        appliedDate: true,
        notes: true,
        jobUrl: true,
      },
    });

    if (!application) {
      logger.error("Application not found", { userId });
      return null;
    }

    const parts: string[] = [
      `Company: ${application.company}`,
      `Role: ${application.role}`,
      `Status: ${application.status}`,
      `Applied Date: ${application.appliedDate}`,
    ];

    if (application.notes) {
      parts.push(`Notes: ${application.notes}`);
    }

    if (application.jobUrl) {
      parts.push(`Job Link: ${application.jobUrl}`);
    }

    return parts;
  } catch (error) {
    logger.error("Failed to get application details", { userId, error });
    return null;
  }
}

export async function getResumeText(userId: string): Promise<string | null> {
  try {
    const resume = await prisma.resume.findUnique({
      where: {
        userId: userId,
      },
      select: {
        text: true,
      },
    });

    if (!resume) {
      logger.error("Could not retreive resume text", { userId });
      return null;
    }

    return resume.text;
  } catch (error) {
    logger.error("Failed to get resume details", { userId, error });
    return null;
  }
}

export async function getTailoring(application: string[], resumeText: string) {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: "",
  });
}
