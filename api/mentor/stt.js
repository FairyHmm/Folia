import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { audio, mimeType } = req.body;

    if (!audio || !mimeType) {
      return res.status(400).json({ error: "Missing audio or mimeType" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: audio,
              },
            },
            {
              text: "Transcribe this audio exactly. Return only the transcript text, no commentary or formatting.",
            },
          ],
        },
      ],
    });

    const transcript =
      response.text ||
      response.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("")
        .trim() ||
      "";

    return res.status(200).json({ transcript });
  } catch (err) {
    console.error("STT ERROR:", err);
    return res.status(500).json({ error: "STT failed" });
  }
}
