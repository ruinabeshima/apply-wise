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

describe("POST /feedback/update/:sessionId", () => {
  it("returns 401 no userId", async () => {
    const res = await request(app).post("/feedback/update/session-1");
    expect(res.status).toBe(401);
  });

  it("returns 400 schema invalid", async () => {
    const res = await request(app)
      .post("/feedback/update/session-1")
      .set("x-test-user-id", "user-1")
      .send({
        acceptedSuggestions: ["miss-1", "miss-2"],
        dismissedSuggestions: ["miss-1"],
      });

    expect(res.status).toBe(400);
    expect(res.body["message"]).toEqual("Invalid request");
  });

  it("returns 403 wrong session owner", async () => {
    mockPrisma.tailoringSession.findUnique.mockResolvedValue({
      userId: "user-2",
    } as any);

    const res = await request(app)
      .post("/feedback/update/session-1")
      .set("x-test-user-id", "user-1")
      .send({
        acceptedSuggestions: ["miss-1", "miss-2"],
        dismissedSuggestions: ["miss-3"],
      });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: "Forbidden" });
  });

  it("returns 200 success", async () => {
    mockPrisma.tailoringSession.findUnique.mockResolvedValue({
      userId: "user-1",
    } as any);
    mockPrisma.tailoringSession.update.mockResolvedValue({
      status: "REVIEWED",
    } as any);

    const res = await request(app)
      .post("/feedback/update/session-1")
      .set("x-test-user-id", "user-1")
      .send({
        acceptedSuggestions: ["miss-1", "miss-2"],
        dismissedSuggestions: ["miss-3"],
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Suggestions updated",
      status: "REVIEWED",
    });
  });

  it("returns 500 failure", async () => {
    mockPrisma.tailoringSession.findUnique.mockRejectedValue(
      new Error("DB down"),
    );

    const res = await request(app)
      .post("/feedback/update/session-1")
      .set("x-test-user-id", "user-1")
      .send({
        acceptedSuggestions: ["miss-1", "miss-2"],
        dismissedSuggestions: ["miss-3"],
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Internal server error" });
  });
});
