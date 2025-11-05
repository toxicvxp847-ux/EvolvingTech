// ==== EVOLVING TECH - SERVER.JS ====
// Main backend for your evolving AI assistant with memory + Dev Mode

import express from "express";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());
app.use(express.static(__dirname));

// --- SQLite Setup ---
const db = new Database("memory.db");
db.prepare(`
  CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// --- OpenAI Setup ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --- Utility: Save and recall memory ---
function saveMemory(role, content) {
  db.prepare("INSERT INTO memory (role, content) VALUES (?, ?)").run(role, content);
}

function recallMemory(limit = 10) {
  return db.prepare("SELECT role, content FROM memory ORDER BY id DESC LIMIT ?").all(limit).reverse();
}

// --- Routes ---
app.get("/api/hello", (req, res) => {
  res.json({ message: "Evolving Tech AI backend is online 🚀" });
});

// --- Main Chat Route ---
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) return res.status(400).json({ error: "Empty message" });

    saveMemory("user", userMessage);

    const pastMessages = recallMemory(8);
    const context = pastMessages.map(m => `${m.role}: ${m.content}`).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are the Evolving Tech Assistant helping Mason build and improve his project logically. Remember prior chats when possible and act as a friendly, knowledgeable collaborator.`
        },
        { role: "user", content: `Previous context:\n${context}\n\nMason says: ${userMessage}` }
      ]
    });

    const aiReply = completion.choices[0].message.content;
    saveMemory("assistant", aiReply);

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// --- Developer Mode Endpoint (optional) ---
app.post("/api/devmode", async (req, res) => {
  try {
    const { idea } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a senior developer helping generate valid HTML/CSS/JS snippets for Mason’s Evolving Tech project." },
        { role: "user", content: `Generate or explain this idea: ${idea}` }
      ]
    });

    const codeSuggestion = completion.choices[0].message.content;
    fs.writeFileSync(path.join(__dirname, "draft.html"), codeSuggestion);
    res.json({ result: "Code suggestion saved to draft.html", code: codeSuggestion });
  } catch (err) {
    console.error("Dev Mode error:", err);
    res.status(500).json({ error: "Dev Mode failed" });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Evolving Tech AI running at http://localhost:${PORT}`);
});
