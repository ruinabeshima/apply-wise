import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getTailoring() {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: "",
  });
}
