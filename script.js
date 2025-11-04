// ==== EVOLVING TECH - SCRIPT.JS ====

// Select all the menu buttons
const menuButtons = document.querySelectorAll(".menu-item");
// Select all the content sections
const sections = document.querySelectorAll(".section");

// Function to switch between sections
menuButtons.forEach(button => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-section");

    // Remove active class from all sections
    sections.forEach(section => section.classList.remove("active"));

    // Add active class to the clicked section
    const activeSection = document.getElementById(target);
    if (activeSection) activeSection.classList.add("active");

    // Optional: Add visual feedback for selected button
    menuButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

// Optional: small startup animation
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
});
async function sendMessageToServer(message) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  alert(data.reply);
}
const chatButton = document.getElementById('chatButton');
const chatBox = document.getElementById('chatBox');
const closeChat = document.getElementById('closeChat');
const sendMessage = document.getElementById('sendMessage');
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');

// Toggle chat box
chatButton.addEventListener('click', () => chatBox.classList.toggle('hidden'));
closeChat.addEventListener('click', () => chatBox.classList.add('hidden'));

// Send message
sendMessage.addEventListener('click', () => {
  const message = userInput.value.trim();
  if (message === '') return;

  const userMsg = document.createElement('p');
  userMsg.classList.add('user');
  userMsg.textContent = `You: ${message}`;
  chatMessages.appendChild(userMsg);
  userInput.value = '';

  // Temporary assistant reply (we can connect to AI later)
  const reply = document.createElement('p');
  reply.classList.add('system');
  reply.textContent = "Assistant: That's a great idea! Let's expand on it soon.";
  chatMessages.appendChild(reply);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});
