// ==== EVOLVING TECH - SERVER.JS ====
// Local + Render-friendly server that serves your site and handles chat requests

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Parse incoming JSON (fixes the "undefined message" error)
app.use(express.json());

// ✅ Serve all static files from your project directory
app.use(express.static(__dirname));

// Basic test route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Server is running and ready for expansion!" });
});

// ✅ Chat endpoint
app.post("/api/chat", (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  res.json({
    reply: `You said: "${userMessage}". The system is evolving...`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Evolving Tech server running at http://localhost:${PORT}`);
});
``
