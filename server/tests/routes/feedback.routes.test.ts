import request from "supertest";
import createApp from "../../app";
import { prisma } from "../../lib/prisma";
import { getApplicationInfo } from "../../lib/openai/openai";
import { getResumeSuggestions } from "../../lib/openai/openai";
import { getResumeText } from "../../lib/openai/openai";

// Mock
jest.mock("../../lib/prisma");
const mockPrisma = jest.mocked(prisma);
jest.mock("../../lib/monitoring/audit");
jest.mock("../../lib/openai/openai");
const mockApplicationInfo = jest.mocked(getApplicationInfo);
const mockResumeSuggestions = jest.mocked(getResumeSuggestions);
const mockResumeText = jest.mocked(getResumeText);

const app = createApp();

describe("POST /feedback/:applicationId", () => {
  it("returns 401 no userId", async () => {
    const res = await request(app).post("/feedback/application-1");
    expect(res.status).toBe(401);
  });

  it("returns 403 ownership mismatch", async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: "application-1",
      userId: "user-2",
    } as any);

    const res = await request(app)
      .post("/feedback/application-1")
      .set("x-test-user-id", "user-1");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Forbidden" });
  });

  it("returns 404 missing application", async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: "application-1",
      userId: "user-1",
    } as any);
    mockApplicationInfo.mockResolvedValue(null);

    const res = await request(app)
      .post("/feedback/application-1")
      .set("x-test-user-id", "user-1");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Application not found" });
  });

  it("returns 404 missing resume", async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: "application-1",
      userId: "user-1",
    } as any);
    mockApplicationInfo.mockResolvedValue([
      "Company: Company A",
      "Role: Teacher",
      "Status: APPLIED",
      "Applied Date: 31/03/26",
    ]);
    mockResumeText.mockResolvedValue(null);

    const res = await request(app)
      .post("/feedback/application-1")
      .set("x-test-user-id", "user-1");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Resume not found" });
  });

  it("returns 500 no suggesstions", async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: "application-1",
      userId: "user-1",
    } as any);
    mockApplicationInfo.mockResolvedValue([
      "Company: Company A",
      "Role: Teacher",
      "Status: APPLIED",
      "Applied Date: 31/03/26",
    ]);
    mockResumeText.mockResolvedValue("This is a test resume");
    mockResumeSuggestions.mockResolvedValue(null);

    const res = await request(app)
      .post("/feedback/application-1")
      .set("x-test-user-id", "user-1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Failed to retrieve feedback" });
  });

  it("returns 201 success", async () => {
    mockPrisma.application.findUnique.mockResolvedValue({
      id: "application-1",
      userId: "user-1",
    } as any);
    mockApplicationInfo.mockResolvedValue([
      "Company: Company A",
      "Role: Teacher",
      "Status: APPLIED",
      "Applied Date: 31/03/26",
    ]);
    mockResumeText.mockResolvedValue("This is a test resume");
    mockResumeSuggestions.mockResolvedValue({
      miss: ["missing skill A", "missing skill B"],
      improve: ["improve X"],
      add: ["add certification Y"],
      weak: ["weak point Z"],
    });
    mockPrisma.tailoringSession.create.mockResolvedValue({
      applicationId: "application-1",
      userId: "user-1",
      suggestions: "suggestions",
      status: "PENDING",
    } as any);

    const res = await request(app)
      .post("/feedback/application-1")
      .set("x-test-user-id", "user-1");
    expect(res.status).toBe(201);
  });
});
