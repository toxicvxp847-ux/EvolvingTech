// ==== EVOLVING TECH - SERVER.JS ====
// AI backend with long-term memory + Developer Mode file writing

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// === Database ===
const db = new Database("memory.db");
db.prepare(`
  CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    info TEXT
  )
`).run();

// === OpenAI ===
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// === Routes ===
app.get("/api/hello", (req, res) => res.json({ message: "Evolving Tech AI is online!" }));

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) return res.status(400).json({ reply: "Please send a message." });

    const past = db.prepare("SELECT info FROM memory WHERE user = ? ORDER BY id DESC LIMIT 10").all("Mason");
    const memoryContext = past.map(r => r.info).join("\n");

    const systemPrompt = `
You are the AI assistant of Evolving Tech, a collaborative web workspace.
If Mason asks for a feature or design change, reply with JSON:
{
  "reply": "explanation text",
  "codeSuggestion": "<code here>"
}
Otherwise, reply conversationally.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: \`Past context:\\n\${memoryContext}\\n\\nMason says: \${userMessage}\` }
      ],
      response_format: { type: "json_object" }
    });

    let parsed;
    try { parsed = JSON.parse(completion.choices[0].message.content); }
    catch { parsed = { reply: completion.choices[0].message.content }; }

    db.prepare("INSERT INTO memory (user, info) VALUES (?, ?)").run("Mason", \`User: \${userMessage} | AI: \${parsed.reply}\`);

    res.json(parsed);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Server error processing AI request." });
  }
});

// === New endpoint: write AI suggestion to a file ===
app.post("/api/apply-code", (req, res) => {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({ message: "No code provided." });

    const filePath = path.join(__dirname, "draft.html");
    fs.writeFileSync(filePath, code);
    console.log("✅ Draft written to", filePath);
    res.json({ message: "Draft saved successfully!" });
  } catch (err) {
    console.error("File write error:", err);
    res.status(500).json({ message: "Failed to write draft file." });
  }
});

app.listen(PORT, () => console.log(`🚀 Evolving Tech AI running at http://localhost:${PORT}`));
