(function () {
  const WEBHOOK_URL = "https://n8n.opalsea.site/webhook/opalsea-chat";
  const WELCOME_MESSAGE = "Bonjour ! Je suis Loïc, l'assistant d'Opalsea. Je peux vous renseigner sur nos services. Comment puis-je vous aider ?";
  const PRIMARY_COLOR = "#00f5ff";
  const PRIMARY_DARK = "#00c2c9";
  const BG_DARK = "#0a0e17";
  const SURFACE = "#131a24";
  const BORDER = "#1f2b3a";
  const TEXT_LIGHT = "#e8f9fa";
  const TEXT_MUTED = "#7d93a3";
  const AVATAR_URL = "https://res.cloudinary.com/dnefts1oc/image/upload/v1783890713/Loic_chatbot_avatar_brt0sb.png";

  const style = document.createElement("style");
  style.textContent = `
    @keyframes opalsea-float {
      0%   { transform: translate(0,0) scale(1); }
      25%  { transform: translate(1px,-6px) scale(1.02); }
      50%  { transform: translate(-1px,-3px) scale(0.99); }
      75%  { transform: translate(2px,-7px) scale(1.01); }
      100% { transform: translate(0,0) scale(1); }
    }
    @keyframes opalsea-turn {
      0%   { transform: rotateY(0deg); }
      25%  { transform: rotateY(-1deg); }
      50%  { transform: rotateY(0deg); }
      75%  { transform: rotateY(1deg); }
      100% { transform: rotateY(0deg); }
    }

    #opalsea-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: transparent;
      border: none;
      cursor: pointer;
      z-index: 9999;
      padding: 0;
    }
    #opalsea-avatar-perspective {
      width: 100%;
      height: 100%;
      perspective: 600px;
    }
    #opalsea-avatar-turn {
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      animation: opalsea-turn 7s ease-in-out infinite;
    }
    #opalsea-avatar-wrap {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 0 2px ${PRIMARY_COLOR}, 0 4px 20px rgba(0,245,255,0.35);
      background: ${SURFACE};
      animation: opalsea-float 5s cubic-bezier(0.45,0.05,0.55,0.95) infinite;
    }
    #opalsea-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    #opalsea-chat-window {
      position: fixed;
      bottom: 108px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 48px);
      height: 480px;
      max-height: calc(100vh - 120px);
      background: ${BG_DARK};
      border: 1px solid ${BORDER};
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,245,255,0.12);
      z-index: 9998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #opalsea-chat-window.open { display: flex; }

    #opalsea-chat-header {
      background: ${SURFACE};
      border-bottom: 1px solid ${BORDER};
      color: ${TEXT_LIGHT};
      padding: 12px 16px;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #opalsea-chat-header img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      box-shadow: 0 0 0 1px ${PRIMARY_COLOR};
    }
    #opalsea-chat-header span { flex: 1; }
    #opalsea-chat-close {
      background: none;
      border: none;
      color: ${TEXT_MUTED};
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 0;
    }
    #opalsea-chat-close:hover { color: ${PRIMARY_COLOR}; }

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
      background: ${SURFACE};
      color: ${TEXT_LIGHT};
      border: 1px solid ${BORDER};
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .opalsea-msg.user {
      background: ${PRIMARY_COLOR};
      color: #06181a;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .opalsea-msg.typing {
      background: ${SURFACE};
      border: 1px solid ${BORDER};
      align-self: flex-start;
      color: ${TEXT_MUTED};
      font-style: italic;
    }

    #opalsea-chat-footer {
      padding: 12px;
      border-top: 1px solid ${BORDER};
      background: ${SURFACE};
      display: flex;
      gap: 8px;
    }
    #opalsea-chat-input {
      flex: 1;
      background: ${BG_DARK};
      border: 1px solid ${BORDER};
      color: ${TEXT_LIGHT};
      border-radius: 8px;
      padding: 9px 12px;
      font-size: 14px;
      outline: none;
      resize: none;
      font-family: inherit;
      max-height: 80px;
      line-height: 1.4;
    }
    #opalsea-chat-input::placeholder { color: ${TEXT_MUTED}; }
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
    #opalsea-chat-send svg { width: 18px; height: 18px; fill: #06181a; }
    #opalsea-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.id = "opalsea-chat-btn";
  btn.setAttribute("aria-label", "Ouvrir le chat");
  btn.innerHTML = `
    <div id="opalsea-avatar-perspective">
      <div id="opalsea-avatar-turn">
        <div id="opalsea-avatar-wrap">
          <img id="opalsea-avatar-img" src="${AVATAR_URL}" alt="Loïc" />
        </div>
      </div>
    </div>
  `;

  const win = document.createElement("div");
  win.id = "opalsea-chat-window";
  win.innerHTML = `
    <div id="opalsea-chat-header">
      <img src="${AVATAR_URL}" alt="Loïc" />
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

  let messages = [];
  let isOpen = false;
  let isLoading = false;

  const messagesEl = document.getElementById("opalsea-chat-messages");
  const inputEl = document.getElementById("opalsea-chat-input");
  const sendBtn = document.getElementById("opalsea-chat-send");

  function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = "opalsea-msg " + role;
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

  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + "px";
  });

})();
