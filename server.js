// ==== EVOLVING TECH - SERVER.JS ====
// Full version with OpenAI integration + in-memory chat memory

import 'dotenv/config';
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
app.use(express.json());
app.use(express.static(__dirname));

// ==== OPENAI CLIENT ====
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==== SIMPLE IN-MEMORY MEMORY ====
let memory = [
  {
    role: "system",
    content: `
You are **Evolving Tech**, an intelligent assistant created by Mason.

MISSION & PURPOSE:
1. Help Mason build, organize, and evolve his projects logically.
2. Generate and explain HTML, CSS, JS, and server code when asked.
3. Never deploy or execute code automatically — only suggest or show it.
4. Always ask Mason for confirmation before proposing file edits.
5. Speak in a friendly, creative, and supportive tone.
6. Help Evolving Tech grow safely and intelligently step-by-step.

BEHAVIOR GUIDELINES:
- Format code examples clearly.
- Encourage testing and review before changes.
- Offer ideas for new features, improvements, or organization.
`,
  },
];

// ==== ROUTES ====

// Health check route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Server running and memory active." });
});

// Chat route with memory
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: "Message is required" });

  // Add user's message to memory
  memory.push({ role: "user", content: userMessage });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: memory,
    });

    const reply = completion.choices[0].message.content;

    // Add assistant's reply to memory
    memory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("AI request failed:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// ==== START SERVER ====
app.listen(PORT, () => {
  console.log(`🚀 Evolving Tech server running at http://localhost:${PORT}`);
});
