(function () {
  const WEBHOOK_URL = "https://n8n.opalsea.site/webhook/86984db2-e2e8-4e1c-b57c-1ccd24b4126e";
  const WELCOME_MESSAGE = "Bonjour ! Je suis l'assistant d'Opalsea. Je peux vous renseigner sur nos services. Comment puis-je vous aider ?";
  const PRIMARY_COLOR = "#0ea5a0";
  const PRIMARY_DARK = "#0c8a86";

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    #opalsea-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${PRIMARY_COLOR};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    #opalsea-chat-btn:hover { background: ${PRIMARY_DARK}; }
    #opalsea-chat-btn svg { width: 26px; height: 26px; fill: white; }

    #opalsea-chat-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 48px);
      height: 480px;
      max-height: calc(100vh - 120px);
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      z-index: 9998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #opalsea-chat-window.open { display: flex; }

    #opalsea-chat-header {
      background: ${PRIMARY_COLOR};
      color: white;
      padding: 14px 16px;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #opalsea-chat-header span { flex: 1; }
    #opalsea-chat-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 0;
      opacity: 0.8;
    }
    #opalsea-chat-close:hover { opacity: 1; }

    #opalsea-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .opalsea-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .opalsea-msg.bot {
      background: #f0f4f8;
      color: #1a1a1a;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .opalsea-msg.user {
      background: ${PRIMARY_COLOR};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .opalsea-msg.typing {
      background: #f0f4f8;
      align-self: flex-start;
      color: #888;
      font-style: italic;
    }

    #opalsea-chat-footer {
      padding: 12px;
      border-top: 1px solid #e8e8e8;
      display: flex;
      gap: 8px;
    }
    #opalsea-chat-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 9px 12px;
      font-size: 14px;
      outline: none;
      resize: none;
      font-family: inherit;
      max-height: 80px;
      line-height: 1.4;
    }
    #opalsea-chat-input:focus { border-color: ${PRIMARY_COLOR}; }
    #opalsea-chat-send {
      background: ${PRIMARY_COLOR};
      border: none;
      border-radius: 8px;
      width: 38px;
      height: 38px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s;
    }
    #opalsea-chat-send:hover { background: ${PRIMARY_DARK}; }
    #opalsea-chat-send svg { width: 18px; height: 18px; fill: white; }
    #opalsea-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // Build HTML
  const btn = document.createElement("button");
  btn.id = "opalsea-chat-btn";
  btn.setAttribute("aria-label", "Ouvrir le chat");
  btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

  const win = document.createElement("div");
  win.id = "opalsea-chat-window";
  win.innerHTML = `
    <div id="opalsea-chat-header">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="white" style="flex-shrink:0"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      <span>Loïc | Agent IA</span>
      <button id="opalsea-chat-close" aria-label="Fermer">✕</button>
    </div>
    <div id="opalsea-chat-messages"></div>
    <div id="opalsea-chat-footer">
      <textarea id="opalsea-chat-input" placeholder="Votre message..." rows="1"></textarea>
      <button id="opalsea-chat-send" aria-label="Envoyer">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  // State
  let messages = [];
  let isOpen = false;
  let isLoading = false;

  const messagesEl = document.getElementById("opalsea-chat-messages");
  const inputEl = document.getElementById("opalsea-chat-input");
  const sendBtn = document.getElementById("opalsea-chat-send");

  function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = "opalsea-msg " + role;
    // Convert markdown bold **text** to <strong>
    div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    inputEl.disabled = state;
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    addMessage(text, "user");
    messages.push({ role: "user", content: text });
    inputEl.value = "";
    inputEl.style.height = "auto";

    setLoading(true);
    const typingEl = addMessage("...", "typing");

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });

      if (res.status === 429) {
        typingEl.remove();
        addMessage("Vous avez envoyé trop de messages. Merci de réessayer dans quelques instants.", "bot");
        return;
      }

      const data = await res.json();
      const reply = data.reply || "Je n'ai pas pu obtenir de réponse. Veuillez réessayer.";
      typingEl.remove();
      addMessage(reply, "bot");
      messages.push({ role: "assistant", content: reply });

    } catch (e) {
      typingEl.remove();
      addMessage("Une erreur est survenue. Veuillez réessayer.", "bot");
    } finally {
      setLoading(false);
    }
  }

  // Events
  btn.addEventListener("click", () => {
    isOpen = !isOpen;
    win.classList.toggle("open", isOpen);
    if (isOpen && messages.length === 0) {
      addMessage(WELCOME_MESSAGE, "bot");
      inputEl.focus();
    }
  });

  document.getElementById("opalsea-chat-close").addEventListener("click", () => {
    isOpen = false;
    win.classList.remove("open");
  });

  sendBtn.addEventListener("click", () => sendMessage(inputEl.value));

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  // Auto-resize textarea
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + "px";
  });

})();
