process.env.R2_BUCKET_NAME = "test-bucket";
process.env.OPENAI_API_KEY = "test-openai-api-key";

// Mock Firebase Auth middleware requireAuth()
jest.mock("../lib/firebase/middleware", () => ({
  requireFirebaseAuth: () => (req: any, res: any, next: any) => {
    const userId = req.headers["x-test-user-id"];
    const email = req.headers["x-test-email"];
    const imageUrl = req.headers["x-test-image-url"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    req.auth = { userId, email, imageUrl };
    next();
  },
}));
