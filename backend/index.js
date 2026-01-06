import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===============================
// AI INGREDIENT ANALYSIS ENDPOINT
// ===============================
app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      safety: "CAUTION",
      summary: "No ingredient provided.",
      reasons: ["Empty input"],
      advice: "Please enter an ingredient or product name.",
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
You are a professional dermatology AI.

Respond ONLY in valid JSON with this structure:
{
  "safety": "SAFE | CAUTION | AVOID",
  "summary": "Short safety summary",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "advice": "Personalized advice"
}

Rules:
- Medical & evidence-based
- No emojis
- No markdown
- No extra text
          `,
        },
        {
          role: "user",
          content: `Analyze this skincare ingredient or product: ${text}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content;

    // SAFETY PARSE
    const parsed = JSON.parse(raw);

    res.json(parsed);
  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      safety: "CAUTION",
      summary: "AI analysis failed.",
      reasons: ["Service unavailable or invalid response"],
      advice: "Please try again later.",
    });
  }
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("TruthBeauty AI backend is running ✅");
});

// ===============================
app.listen(3001, () => {
  console.log("✅ Server running at http://localhost:3001");
});
