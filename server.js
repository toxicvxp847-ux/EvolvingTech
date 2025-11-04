// ==== EVOLVING TECH - SERVER.JS ====
// A simple local server that serves your website and can handle API connections later.

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve all files from your EvolvingTech folder
app.use(express.static(__dirname));

// Basic test route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Server is running and ready for expansion!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Evolving Tech server running at http://localhost:${PORT}`);
});
