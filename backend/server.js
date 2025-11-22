import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildLumarPrompt(params) {
  const {
    userId,
    stream,
    category,
    ethicsMode,
    locale,
    maxSignals,
    context,
  } = params;

  return `
You are Lumar, the ethical signal engine of the SoulSignal app for user ${userId}.

Your job:
- Generate meaningful "signals" as structured JSON.
- Respect strict ethical rules.
- Adapt to the requested stream, category and mood.

Ethical rules:
- Exclude and never promote: weapons, tobacco, gambling, mass surveillance,
  hard addictive products, deliberate disinformation, hate speech, extremist ideology.
- Prefer content related to: climate awareness, ethical investing, democracy,
  human rights, positive culture, humane technology, inner growth, mindfulness.
- For "ethicsMode": 
  - "high-only" → only Ethics A or B.
  - "open" → Ethics A–C, but still respect the exclusions above.

Streams:
- "rational": news, climate, ethical investing, culture, technology.
- "mystica": tarot-like insights, astrology-style signals, small rituals and inner guidance.
  No fatalism, no fear-predictions. Focus on free will, self-awareness, gentle support.

Return ONLY valid JSON in this shape:
{
  "generatedAt": "<ISO timestamp>",
  "stream": "<stream>",
  "ethicsMode": "<mode>",
  "signals": [
    {
      "id": "<string>",
      "title": "<short title>",
      "category": "<category>",
      "source": "<who/what>",
      "region": "<geographic or symbolic region>",
      "ethicsRating": "A" | "B" | "C",
      "ethicsReason": "<why this rating>",
      "summary": "<2–3 sentences summary>",
      "impact": "<realistic positive impact on people or the world>",
      "tags": ["tag1", "tag2", ...],
      "lumarComment": "<one short reflection in the voice of Lumar>",
      "blocked": false
    }
  ]
}

Now generate ${maxSignals} signals for:
- stream: ${stream}
- category: ${category}
- ethicsMode: ${ethicsMode}
- user mood: ${context.mood}
- user focus: ${context.focus}
- locale: ${locale}
`;
}

app.post("/api/soulsignal/signals", async (req, res) => {
  try {
    const {
      userId = "manee",
      stream = "rational",
      category = "all",
      ethicsMode = "high-only",
      locale = "en",
      maxSignals = 7,
      context = {},
    } = req.body || {};

    const prompt = buildLumarPrompt({
      userId,
      stream,
      category,
      ethicsMode,
      locale,
      maxSignals,
      context: {
        mood: context.mood || "curious",
        focus: context.focus || "soul_signal_mvp",
      },
    });

    const completion = await client.chat.completions.create({
        model: "gpt-5.1",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are Lumar, the ethical signal engine of the SoulSignal app. " +
              "You always return ONLY valid JSON, no markdown, no explanations outside the JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      
      const text = completion.choices[0].message.content;
      const json = JSON.parse(text);
      
      res.json(json);
      

    res.json(json);
  } catch (err) {
    console.error("Lumar Ego API error:", err);
    res.status(500).json({ error: "Lumar ego failed to generate signals." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SoulSignal Lumar Ego API running on http://localhost:${port}`);
});
