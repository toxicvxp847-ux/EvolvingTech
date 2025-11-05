
// ==== EVOLVING TECH - SCRIPT.JS ====
// Handles menu, chat, and Developer Mode logic

// Navigation handling
const menuButtons = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".section");

menuButtons.forEach(button => {
  button.addEventListener("click", () => {
    sections.forEach(section => section.classList.remove("active"));
    document.getElementById(button.dataset.section).classList.add("active");
  });
});

// Chat box handling
const chatButton = document.getElementById("chatButton");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");
const sendMessage = document.getElementById("sendMessage");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

// Developer Mode handling
const devToggle = document.getElementById("devModeToggle");
const devPanel = document.getElementById("devPanel");
const closeDev = document.getElementById("closeDev");
const devOutput = document.getElementById("devOutput");
const applyCode = document.getElementById("applyCode");
const discardCode = document.getElementById("discardCode");

// Open/close chat
chatButton.addEventListener("click", () => chatBox.classList.toggle("hidden"));
closeChat.addEventListener("click", () => chatBox.classList.add("hidden"));

// Open/close dev panel
devToggle.addEventListener("click", () => devPanel.classList.toggle("hidden"));
closeDev.addEventListener("click", () => devPanel.classList.add("hidden"));

// Handle sending messages
sendMessage.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;
  appendMessage("You", message);
  userInput.value = "";

  const response = await sendMessageToServer(message);
  appendMessage("Assistant", response.reply);

  // Developer Mode: if AI sends code suggestions
  if (response.codeSuggestion) {
    showCodeSuggestion(response.codeSuggestion);
  }
});

function appendMessage(sender, text) {
  const p = document.createElement("p");
  p.classList.add(sender === "You" ? "user" : "system");
  p.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message to server AI
async function sendMessageToServer(message) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    return await res.json();
  } catch (err) {
    console.error("Server error:", err);
    return { reply: "There was an issue reaching the server." };
  }
}

// Show Developer Mode code suggestion
function showCodeSuggestion(code) {
  devPanel.classList.remove("hidden");
  devOutput.innerHTML = `
    <pre><code>${escapeHTML(code)}</code></pre>
    <p class="system">Would you like to apply this change?</p>
  `;
}

// Protect output from HTML injection
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[tag]));
}

// Developer Mode actions
applyCode.addEventListener("click", () => {
  appendMessage("System", "✅ Code applied to memory. (AI will recall this as a change proposal.)");
  devOutput.innerHTML = `<p class="system">AI code suggestion saved.</p>`;
});

discardCode.addEventListener("click", () => {
  devOutput.innerHTML = `<p class="system">🗑️ Suggestion discarded.</p>`;
});
