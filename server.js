// ==== EVOLVING TECH - SERVER WITH MEMORY ====
// Mason's Evolving Tech AI — remembers conversations using SQLite!

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// 🧠 Connect to SQLite database (auto-creates file)
const db = new Database(path.join(__dirname, "memory.db"));

// Create memory table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    key TEXT,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// 🌤️ Setup OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Basic status route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Evolving Tech server is alive with memory!" });
});

// 🧠 Save fact or recall memory
function rememberFact(user, key, value) {
  db.prepare("INSERT INTO memory (user, key, value) VALUES (?, ?, ?)").run(user, key, value);
}

function recallMemory(user) {
  const rows = db.prepare("SELECT key, value FROM memory WHERE user = ? ORDER BY id DESC LIMIT 20").all(user);
  return rows.map(r => `${r.key}: ${r.value}`).join("\n");
}

// 💬 Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";
    const user = "Mason";

    // Fetch memory context
    const memoryContext = recallMemory(user);

    // Detect simple memory statements like "my favorite color is black"
    const memoryMatch = userMessage.match(/my (.+?) is (.+)/i);
    if (memoryMatch) {
      const key = memoryMatch[1].trim();
      const value = memoryMatch[2].trim();
      rememberFact(user, key, value);
    }

    // Compose the system prompt with memory context
    const systemPrompt = `
You are Evolving Tech AI, Mason's collaborative assistant.
Your purpose is to help him build, code, and evolve his projects.
Always recall previous memory facts about Mason to personalize your responses.
Current known memory facts:
${memoryContext || "No memories yet."}
`;

    // Ask OpenAI for a reply
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Server error occurred." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Evolving Tech server with memory running at http://localhost:${PORT}`);
});
