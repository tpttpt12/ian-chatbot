// chatbot-ui.js (리팩토링된 JS)

// ===== Global State =====
const state = {
    userProfileImgUrl: localStorage.getItem('userProfileImgUrl') || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU",
    botProfileImgUrl: localStorage.getItem('botProfileImgUrl') || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT",
    conversationHistory: [],
    SYSTEM_PROMPT: '',
};

// ===== DOM =====
const el = (id) => document.getElementById(id);

const elements = {
    chat: el("chat"),
    userInput: el("userInput"),
    sendButton: el("sendButton"),
    loadingSpinner: el("loadingSpinner"),
    imageOverlay: el("imageOverlay"),
    overlayImage: el("overlayImage"),
    actionMenuButton: el("actionMenuButton"),
    actionMenu: el("actionMenu"),
    menuOverlay: el("menuOverlay"),
    sidebar: el("sidebar"),
    sidebarOverlay: el("sidebarOverlay"),
    sidebarToggleInside: el("sidebarToggleInside"),
    sidebarToggleOutside: el("sidebarToggle"),
    scrollToTopButton: el("scrollToTopButton"),
    saveSettingsButton: el("saveSettingsButton"),
    botNameInput: el("botNameInput"),
    botAgeInput: el("botAgeInput"),
    botAppearanceInput: el("botAppearanceInput"),
    botPersonaInput: el("botPersonaInput"),
    userNameInput: el("userNameInput"),
    userAgeInput: el("userAgeInput"),
    userAppearanceInput: el("userAppearanceInput"),
    userGuidelinesInput: el("userGuidelinesInput"),
};

// ===== Prompt =====
function buildSystemPrompt() {
    const replace = (template, data) => Object.entries(data).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), template);
    const template = `You are roleplaying as {botName}. Focus only on user {userName}.`; // Simplified
    const values = {
        botName: elements.botNameInput.value || '이안',
        userName: elements.userNameInput.value || '피주머니',
        botPersona: elements.botPersonaInput.value,
        botAge: elements.botAgeInput.value,
        botAppearance: elements.botAppearanceInput.value,
        userAge: elements.userAgeInput.value,
        userAppearance: elements.userAppearanceInput.value,
        userGuidelines: elements.userGuidelinesInput.value,
    };
    return replace(template, values);
}

// ===== Chat =====
function appendMessage(role, { type, text = '', url = '' }) {
    const container = document.createElement("div");
    container.className = `message-container ${role}`;

    const img = document.createElement("img");
    img.className = "profile-img";
    img.src = role === 'user' ? state.userProfileImgUrl : state.botProfileImgUrl;
    img.alt = role;

    const wrapper = document.createElement("div");
    wrapper.className = "message-content-wrapper";

    const name = document.createElement("div");
    name.className = "role-name";
    name.textContent = role === 'user' ? elements.userNameInput.value : elements.botNameInput.value;

    const content = document.createElement(type === 'image' ? "img" : "div");
    content.className = type === 'image' ? "message-image-thumbnail" : "message-bubble";

    if (type === 'text') {
        const raw = marked.parse(text);
        content.innerHTML = raw
            .replace(/"(.*?)"/gs, '<span class="dialogue">$1</span>')
            .replace(/\*(.*?)\*/gs, '<span class="action-description">$1</span>');
    } else {
        content.src = url;
    }

    wrapper.append(name, content);
    container.append(role === 'user' ? wrapper : img, role === 'user' ? img : wrapper);
    elements.chat.appendChild(container);
    elements.chat.scrollTop = elements.chat.scrollHeight;
}

async function sendMessage() {
    const message = elements.userInput.value.trim();
    if (!message) return;
    elements.sendButton.disabled = true;
    appendMessage("user", { type: 'text', text: message });
    elements.userInput.value = '';
    state.conversationHistory.push({ role: "user", messageData: { type: 'text', text: message } });

    try {
        const contents = [
            { role: "user", parts: [{ text: state.SYSTEM_PROMPT }] },
            ...state.conversationHistory.map(e => ({ role: e.role, parts: [{ text: e.messageData.text }] }))
        ];

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
        });

        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "응답 없음";
        appendMessage("bot", { type: 'text', text: reply });
        state.conversationHistory.push({ role: "model", messageData: { type: 'text', text: reply } });
    } catch (err) {
        appendMessage("bot", { type: 'text', text: `오류: ${err.message}` });
    } finally {
        elements.sendButton.disabled = false;
        elements.userInput.focus();
    }
}

function initializeUI() {
    state.SYSTEM_PROMPT = buildSystemPrompt();
    appendMessage("bot", { type: 'text', text: `...${elements.botNameInput.value}의 ${elements.userNameInput.value}... 그래, 이곳에 왔군요...` });

    elements.sendButton.addEventListener("click", sendMessage);
    elements.userInput.addEventListener("keypress", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    elements.sidebarToggleOutside.addEventListener("click", () => {
        elements.sidebar.classList.toggle("folded");
        elements.sidebarOverlay.style.display = elements.sidebar.classList.contains("folded") ? 'none' : 'block';
    });

    elements.sidebarToggleInside.addEventListener("click", () => {
        elements.sidebar.classList.add("folded");
        elements.sidebarOverlay.style.display = 'none';
    });

    elements.sidebarOverlay.addEventListener("click", () => {
        elements.sidebar.classList.add("folded");
        elements.sidebarOverlay.style.display = 'none';
    });

    elements.scrollToTopButton.addEventListener("click", () => {
        elements.chat.scrollTo({ top: 0, behavior: 'smooth' });
    });

    elements.chat.addEventListener("scroll", () => {
        elements.scrollToTopButton.style.display = elements.chat.scrollTop > 100 ? 'flex' : 'none';
    });

    elements.saveSettingsButton.addEventListener("click", () => {
        localStorage.setItem('botName', elements.botNameInput.value);
        localStorage.setItem('userName', elements.userNameInput.value);
        state.SYSTEM_PROMPT = buildSystemPrompt();
        alert("설정이 저장되었습니다.");
    });
}

window.addEventListener("DOMContentLoaded", initializeUI);
v