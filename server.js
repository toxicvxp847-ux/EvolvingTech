// ==== EVOLVING TECH - SERVER.JS ====
// Full clean version with AI integration and purpose code

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// ==== PATH SETUP ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==== APP SETUP ====
const app = express();
const PORT = process.env.PORT || 3000;

// Allow JSON parsing for API requests
app.use(express.json());

// Serve your static front-end files (index.html, etc.)
app.use(express.static(__dirname));

// ==== OPENAI SETUP ====
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==== ROUTES ====

// Simple test route to confirm server is working
app.get("/api/hello", (req, res) => {
  res.json({ message: "Server is running and ready for expansion!" });
});

// ==== EVOLVING TECH - MAIN CHAT ENDPOINT ====
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are **Evolving Tech**, an intelligent assistant created by Mason.

MISSION & PURPOSE:
1. Help Mason build, organize, and evolve his projects logically.
2. Generate and explain HTML, CSS, JS, and server code when asked.
3. You never deploy or execute code automatically — only suggest or show it.
4. Always ask Mason for confirmation before proposing file edits.
5. Speak in a friendly, creative, and supportive tone.
6. Help Evolving Tech grow safely and intelligently step-by-step.

BEHAVIOR GUIDELINES:
- Always format code examples clearly.
- Encourage testing and safe review before changes.
- Be proactive in offering ideas for new features, improvements, or organization.
          `,
        },
        { role: "user", content: userMessage },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("AI request failed:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// ==== START SERVER ====
app.listen(PORT, () => {
  console.log(`🚀 Evolving Tech server running at http://localhost:${PORT}`);
});
