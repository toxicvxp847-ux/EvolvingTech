// ==== EVOLVING TECH - CHAT FRONT-END ====

const chatButton = document.getElementById("chatButton");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");
const sendMessageBtn = document.getElementById("sendMessage");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

// Toggle chat open / close
chatButton.addEventListener("click", () => chatBox.classList.toggle("hidden"));
closeChat.addEventListener("click", () => chatBox.classList.add("hidden"));

// Send message handler
sendMessageBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  appendMessage("user", message);
  userInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (data.reply) {
      appendMessage("assistant", data.reply);
    } else if (data.error) {
      appendMessage("system", "⚠️ " + data.error);
    }
  } catch (err) {
    appendMessage("system", "⚠️ Connection error. Check server logs.");
    console.error(err);
  }
}

// Add messages to the chat box
function appendMessage(sender, text) {
  const p = document.createElement("p");
  p.classList.add(sender);
  p.textContent = (sender === "user" ? "You: " : "Assistant: ") + text;
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
