// ==== EVOLVING TECH - SERVER.JS ====
// AI backend with long-term memory + Developer Mode code generation

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// === Setup ===
app.use(express.json());
app.use(express.static(__dirname));

// === Database for memory ===
const db = new Database("memory.db");
db.prepare(`
  CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    info TEXT
  )
`).run();

// === OpenAI client ===
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// === Routes ===

// Quick health check
app.get("/api/hello", (req, res) => {
  res.json({ message: "Evolving Tech AI is online!" });
});

// Chat route (main AI logic)
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) {
      return res.status(400).json({ reply: "Please send a message." });
    }

    // Load previous memories for continuity
    const past = db.prepare("SELECT info FROM memory WHERE user = ? ORDER BY id DESC LIMIT 10").all("Mason");
    const memoryContext = past.map(row => row.info).join("\n");

    // === Determine if user wants code or just chat ===
    const systemPrompt = `
You are the AI assistant of Evolving Tech, a collaborative web workspace.
You help Mason build and evolve his website safely.

If Mason asks for a design or feature change (like "add a button", "make it dark mode", "add a new section"), 
generate valid, minimal HTML/CSS/JS code. Include it in JSON format like this:
{
  "reply": "Explain what you did or suggest it clearly.",
  "codeSuggestion": "<the code snippet here>"
}

If he’s just chatting, reply conversationally as normal without codeSuggestion.
Remember relevant facts about Mason and his project and store them in memory.
`;

    // === Query OpenAI ===
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Past context:\n${memoryContext}\n\nMason says: ${userMessage}` }
      ],
      response_format: { type: "json_object" }
    });

    const reply = completion.choices[0].message.content;
    let parsed = {};
    try {
      parsed = JSON.parse(reply);
    } catch {
      parsed = { reply: reply };
    }

    // Save message + memory
    db.prepare("INSERT INTO memory (user, info) VALUES (?, ?)").run("Mason", `User: ${userMessage} | AI: ${parsed.reply}`);

    res.json(parsed);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Server error processing AI request." });
  }
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Evolving Tech AI running at http://localhost:${PORT}`);
});
