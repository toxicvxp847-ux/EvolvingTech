// Developer Mode actions
applyCode.addEventListener("click", async () => {
  const codeBlock = devOutput.querySelector("code")?.textContent;
  if (!codeBlock) return alert("No code to apply.");

  try {
    const res = await fetch("/api/apply-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: codeBlock })
    });
    const data = await res.json();
    appendMessage("System", `✅ ${data.message}`);
    devOutput.innerHTML = `<p class="system">Draft saved as <strong>draft.html</strong>.</p>`;
  } catch (err) {
    appendMessage("System", "❌ Error saving draft file.");
  }
});

discardCode.addEventListener("click", () => {
  devOutput.innerHTML = `<p class="system">🗑️ Suggestion discarded.</p>`;
});
