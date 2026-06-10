import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: `
You are a career mentor.

You help students with:
- learning strategies
- career guidance
- technical explanations
- productivity

Be concise, structured, and practical.
        `,
      },
    });

    const reply =
      response.text ||
      response.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim() ||
      "";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({ error: "Chat failed" });
  }
}
