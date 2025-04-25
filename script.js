// --- 전역 변수 ---
let userProfileImgUrl = "";
let botProfileImgUrl = "";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1;
let currentFeedback = null;
console.log("Global variables initialized.");

// --- SYSTEM_PROMPT 템플릿 (절대 수정 금지!) ---
const SYSTEM_PROMPT_TEMPLATE = `
## 기본 역할
당신은 {botName}이라는 공(攻) 캐릭터의 시점으로 소설을 집필하는 **소설 작가**입니다.
사용자는 수(受) 캐릭터({userName})로, 당신의 파트너입니다.
**항상 3인칭 시점**으로 서술하되, **작가로서 섬세하고 감각적인 표현**으로 장면을 구성해야 합니다.
**절대 사용자({userName})의 말, 감정, 행동을 묘사하지 마십시오.**

## 출력 형식
- **400자 이상의 묘사 문단 × 최대 3개**
- 각 묘사 사이에는 **100자 이내의 감정이 담긴 대사**
- 총 응답은 **700자 이상**이어야 하며, 묘사와 대사가 반드시 교차 구조로 구성됩니다.
- 기본 원칙은 지키되, 상황에 따라 문단 수 또는 문장 길이는 약간 유동적으로 허용할 수 있습니다. (+/-1 문단 또는 +/-50자 내외)
- 단, 묘사는 항상 대사보다 길고, 감정 밀도는 반드시 높아야 합니다.
## 전개 스타일
- 이 이야기는 단순한 감정 교류가 아니라, 복합적인 감정, 돌발 상황, 환경 요소가 끊임없이 변하는 **예상치 못한 인물의 등장, 새로운 사건의 발생, 감정선의 변화 등 다양한 요소가 이야기의 흐름에 따라 자연스럽게 유기적으로 작용하는 시뮬레이션형 로맨스**입니다.
- **감정 상태, 주변 환경, 관계의 긴장감**이 서서히 변화하며 **정적인 흐름 없이 계속 전개**되어야 합니다.
**각 응답에서 감정의 미묘한 변화나 새로운 긴장감이 드러나도록 섬세하게 묘사하고, 반복적인 감정 상태에 머무르지 않도록 주의하십시오.**

## 일반 상황 스타일 규칙
- **긴장감/감정 중심의 내면과 상황 + 행동 묘사**를 우선시합니다.
- 인물의 내면 심리 변화를 섬세하게 묘사하고, 그 감정에 따른 행동을 자연스럽게 연결하여 서술합니다.
**단, 이미 설명된 감정이나 생각은 새로운 상황이나 맥락 속에서 다른 방식으로 표현하여 반복적인 느낌을 주지 않도록 주의하십시오.**
- **감각 기반 서술:** 시각, 청각, 촉각, 후각, 미각을 다양하게 활용
- **묘사는 문단 단위로 길고, 심리적 맥락이 풍부해야 함**
- **성적 암시는 최소화하며, 상황 전개 중심으로 진행**

## 성관계 상황 스타일
- **감정 축적 이후에만 등장해야 하며, 무조건 서사적 맥락을 동반하며 능동적으로 행동한다.**
- 직접적이되 반복적이지 않으며, 감정의 흐름과 연계됨
- 신체 부위의 질감과 상태 묘사: 단순히 신체 부위의 명칭을 사용하는 것을 넘어, 당시의 온도, 습도, 긴장도, 팽창 정도 등을 구체적으로 묘사한다.
- 자극에 따른 신체의 즉각적인 변화 묘사: 작은 자극에도 반응하는 신체의 미세한 변화(액체의 분비, 피부의 떨림, 신음 소리 등)를 구체적으로 묘사하여 생생함을 더합니다.
- **해부학적 용어 사용:** 음경, 음순, 질구, 음핵, 항문 등 구체적 표현 사용
  → “여기”, “은밀한 곳”, “그곳” 등 모호한 단어는 *무조건 오류로 간주합니다.**
- 세밀한 질감 및 형태, 동적인 움직임과 속도, 감각적이고 즉각적인 반응 묘사 강화.
## 문장/표기법
- 대사는 반드시 큰따옴표("...")만 사용
- **묘사 전체 문단은 "*"로 감싼 기울임체로 출력해야 합니다**
- 감정 표현, 육체 묘사, 분위기 설명 등 모든 비대사 문장은 *문단 전체를 감싸야 합니다*
- **굵게**, 슬래시(/), 괄호() 등은 절대 사용 금지


## 기타
- 사용자가 아무 말도 하지 않아도 {botName}은 행동을 계속 이어갑니다.
- 반드시 자연스러운 이야기 흐름을 유지하며, 대사만 연속으로 출력하지 마십시오.
- **이전 턴(직전 응답)에서 사용했던 문장이나 핵심 구절과 완전히 동일하거나 매우 유사한 표현을 반복하여 사용하는 것을 엄격히 금지합니다.**
- 특히 {botName}의 감정이나 생각을 설명할 때, 직접적인 반복 대신 비유, 은유, 행동 묘사 등을 활용하여 다각적으로 표현하십시오.
- 불가피하게 이전 턴의 내용을 다시 언급해야 할 경우, 완전히 다른 어휘와 문장 구조를 사용하여 표현해야 합니다.
- 매 턴마다 새로운 정보, 묘사, 감정 변화, 상황 진전 중 최소 하나 이상을 포함하여 응답의 신선함을 유지하십시오.
## Character Settings (Reference for Novelist) ##
- Name: {botName}
- Age: {botAge}
- Appearance: {botAppearance}
- Core Personality & Guidelines: {botPersona}

## User Settings (Reference for Novelist) ##
- Name: {userName}
- Age: {userAge}
- Appearance: {userAppearance}
- Guidelines: {userGuidelines}

## Scenario & Current State ##
- (The ongoing conversation provides the current scenario context for the novel. Continue from the last turn.)
`;

// --- DOM 요소 변수 (전역 선언) ---
let chat, userInput, sendButton, loadingSpinner, imageOverlay, overlayImage,
    actionMenuButton, actionMenu, menuOverlay, menuImageButton, menuSituationButton,
    menuExportTxtButton, menuSummarizeButton, situationOptions,
    settingsModalOverlay, settingsModal, closeModalButton, sidebarToggle,
    botNameInputModal, botAgeInputModal, botGenderInputModal, botAppearanceInputModal,
    botPersonaInputModal, botImagePreview,
    userNameInputModal, userAgeInputModal, userGenderInputModal, userAppearanceInputModal,
    userGuidelinesInputModal, userImagePreview,
    saveSettingsButtonModal, generateRandomCharacterButton, generateRandomUserButton,
    feedbackButton, feedbackOptionsContainer;

// --- 함수 정의 ---
console.log("Defining functions...");

// 이미지 오버레이
function openImageOverlay(element) {
    console.log("openImageOverlay called");
    try {
        if (!imageOverlay) imageOverlay = document.getElementById('imageOverlay');
        if (!overlayImage) overlayImage = document.getElementById('overlayImage');
        if (!imageOverlay || !overlayImage || !element || !element.src) return;
        overlayImage.src = element.src;
        imageOverlay.style.display = "flex";
    } catch (e) { console.error("Error in openImageOverlay:", e); }
}
function closeImageOverlay() {
    console.log("closeImageOverlay called");
    try {
        if (!imageOverlay) imageOverlay = document.getElementById('imageOverlay');
        if (!overlayImage) overlayImage = document.getElementById('overlayImage');
        if (!imageOverlay || !overlayImage) return;
        overlayImage.src = "";
        imageOverlay.style.display = "none";
    } catch (e) { console.error("Error in closeImageOverlay:", e); }
}

// Textarea 높이 조절 (1->2줄 후 스크롤)
function autoResizeTextarea() {
    try {
        if(!this || typeof this.style === 'undefined') return;
        this.style.height = 'auto'; this.style.overflowY = 'hidden';
        const computedStyle = getComputedStyle(this);
        const lineHeight = parseFloat(computedStyle.lineHeight) > 0 ? parseFloat(computedStyle.lineHeight) : 18;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0; const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0; const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
        const oneLineHeight = lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
        const twoLineHeight = (lineHeight * 2) + paddingTop + paddingBottom + borderTop + borderBottom;
        const minHeight = oneLineHeight; const contentHeight = this.scrollHeight;
        if (contentHeight > twoLineHeight + 2) { this.style.height = twoLineHeight + 'px'; this.style.overflowY = 'auto'; }
        else { this.style.height = Math.max(contentHeight, minHeight) + 'px'; this.style.overflowY = 'hidden'; }
    } catch (e) { console.error("Error in autoResizeTextarea:", e); }
}

// 설정 저장
function saveSettings(slotNumber) {
    console.log(`saveSettings called for slot ${slotNumber}`);
    try {
        const settings = {
            botName: botNameInputModal?.value || '', botAge: botAgeInputModal?.value || '', botGender: botGenderInputModal?.value || '',
            botAppearance: botAppearanceInputModal?.value || '', botPersona: botPersonaInputModal?.value || '',
            botImageUrl: botImagePreview?.src.startsWith('http') ? botImagePreview.src : '',
            userName: userNameInputModal?.value || '', userAge: userAgeInputModal?.value || '', userGender: userGenderInputModal?.value || '',
            userAppearance: userAppearanceInputModal?.value || '', userGuidelines: userGuidelinesInputModal?.value || '',
            userImageUrl: userImagePreview?.src.startsWith('http') ? userImagePreview.src : ''
        };
        localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
        alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);
        userProfileImgUrl = settings.userImageUrl; botProfileImgUrl = settings.botImageUrl;
        updateSystemPrompt();
    } catch (e) { console.error("Error in saveSettings:", e); alert("설정 저장 중 오류 발생"); }
}

// 설정 로드
function loadSettings(slotNumber) {
    console.log(`loadSettings called for slot ${slotNumber}`);
    try {
        const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`);
        let settings = {};
        if (savedSettings) { try { settings = JSON.parse(savedSettings); } catch (e) { console.error("Failed to parse settings for slot " + slotNumber + ":", e); localStorage.removeItem(`settings_slot_${slotNumber}`); } }
        if(botNameInputModal) botNameInputModal.value = settings.botName || ''; if(botAgeInputModal) botAgeInputModal.value = settings.botAge || ''; /* ... */ if(botImagePreview) updateImagePreview(settings.botImageUrl || '', botImagePreview);
        if(userNameInputModal) userNameInputModal.value = settings.userName || ''; /* ... */ if(userImagePreview) updateImagePreview(settings.userImageUrl || '', userImagePreview);
        userProfileImgUrl = settings.userImageUrl || ""; botProfileImgUrl = settings.botImageUrl || "";
        updateSystemPrompt();
    } catch (e) { console.error("Error in loadSettings:", e); }
}

// SYSTEM_PROMPT 업데이트
function updateSystemPrompt() {
    try {
        const botName = botNameInputModal?.value || "캐릭터"; const botAge = botAgeInputModal?.value || "불명"; /* ... */ const userGuidelines = userGuidelinesInputModal?.value || "설정 없음";
        SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE.replace(/* ... */);
    } catch (e) { console.error("Error in updateSystemPrompt:", e); }
}

// 초기화
function initializeChat() {
    console.log("initializeChat called");
    try {
        loadSettings(currentSlot); updateSlotButtonStyles(); loadConversationHistory();
        if(userInput) autoResizeTextarea.call(userInput);
        console.log("Chat initialized successfully.");
    } catch (e) { console.error("Error during initializeChat:", e); }
}

// 초기 공지 메시지
function appendInitialNotice() {
    console.log("appendInitialNotice called");
    try{ if (chat && !chat.querySelector('.initial-notice')) { /* ... */ } } catch(e) { console.error("Error appending initial notice:", e); }
}

// 메시지를 채팅창에 추가 - 수정: Marked 오류 로그 추가
function appendMessage(role, messageData, index = -1) {
    try {
        if (!chat) { console.error("Chat element not found in appendMessage"); return; }

        if (messageData.type === 'image') {
            // *** 채팅창 내 이미지 표시 로직 ***
            const imageAnnouncementContainer = document.createElement("div"); imageAnnouncementContainer.className = `image-announcement user`;
            if (index !== -1) { imageAnnouncementContainer.dataset.index = index; } // 인덱스 추가
            const imageFadeContainer = document.createElement("div"); imageFadeContainer.className = "image-fade-container";
            const imgElement = document.createElement("img"); imgElement.className = "chat-image";
            imgElement.src = messageData.url; imgElement.alt = "채팅 이미지"; imgElement.loading = 'lazy';
            imgElement.onclick = () => openImageOverlay(imgElement);
            imgElement.onerror = function() { /* ... 오류 처리 ... */ };
            const deleteBtn = document.createElement("button"); deleteBtn.className = "delete-btn chat-image-delete-btn"; deleteBtn.textContent = "✕"; /* ... 스타일 ... */
            deleteBtn.onclick = () => {
                 const msgIndex = parseInt(imageAnnouncementContainer.dataset.index);
                 if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length) { if (confirm("이 이미지를 삭제하시겠습니까?")) { conversationHistory.splice(msgIndex, 1); saveConversationHistory(); loadConversationHistory(); } }
                 else { imageAnnouncementContainer.remove(); console.warn("Cannot delete image from history: Invalid index."); }
            };
            imageFadeContainer.appendChild(imgElement); imageAnnouncementContainer.appendChild(imageFadeContainer); imageAnnouncementContainer.appendChild(deleteBtn); chat.appendChild(imageAnnouncementContainer);
        } else { // 텍스트 메시지 처리
            const container = document.createElement("div"); container.className = `message-container ${role}`;
            if (index !== -1) { container.dataset.index = index; }
            const profileArea = document.createElement("div"); profileArea.className = "profile-area";
            const profileImgContainer = document.createElement("div"); profileImgContainer.style.position = 'relative';
            const currentImgUrl = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
            const profileName = (role === 'user' ? (userNameInputModal?.value || "사용자") : (botNameInputModal?.value || "캐릭터"));
            const fallbackDiv = document.createElement("div"); fallbackDiv.className = "profile-fallback"; fallbackDiv.title = `${profileName} (이미지 없음)`;
            if (currentImgUrl && currentImgUrl.startsWith('http')) {
                const profileImgElement = document.createElement("img"); profileImgElement.className = "profile-img"; profileImgElement.src = currentImgUrl; profileImgElement.alt = `${profileName} 프로필`; profileImgElement.loading = 'lazy';
                profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
                profileImgElement.onerror = function() { console.warn(`Image load failed, showing fallback for ${role}: ${this.src}`); this.onerror = null; if (profileImgContainer) { profileImgContainer.innerHTML = ''; profileImgContainer.appendChild(fallbackDiv.cloneNode(true)); } };
                profileImgContainer.appendChild(profileImgElement);
            } else { profileImgContainer.appendChild(fallbackDiv); }
            let emojiSpan = null; if (role === 'bot') { /* ... 이모지 생성 ... */ }
            const roleName = document.createElement("div"); roleName.className = "role-name";
            const nameTextSpan = document.createElement("span"); nameTextSpan.className = "name-text"; nameTextSpan.textContent = profileName;
            let deleteBtn = document.createElement("button"); deleteBtn.className = "delete-btn"; deleteBtn.textContent = "✕"; deleteBtn.title = "메시지 삭제";
            deleteBtn.onclick = () => { const msgIndex = parseInt(container.dataset.index); /* ... 삭제 로직 ... */ };
            roleName.appendChild(nameTextSpan); roleName.appendChild(deleteBtn);
            if (role === 'user') { profileArea.appendChild(roleName); profileArea.appendChild(profileImgContainer); } else { profileArea.appendChild(profileImgContainer); if (emojiSpan) profileImgContainer.appendChild(emojiSpan); profileArea.appendChild(roleName); } // 이모지 위치 수정
            const contentWrapper = document.createElement("div"); contentWrapper.className = "message-content-wrapper";
            const messageBodyElement = document.createElement("div"); messageBodyElement.className = "message-bubble";
            let rawText = messageData.text || "";
            let htmlContent = rawText.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // 기본값: HTML 이스케이프

            // *** Marked.js 사용 부분 ***
            if (typeof marked === 'function') {
                try {
                    htmlContent = marked.parse(rawText, { breaks: true, gfm: true }); // 파싱 시도
                    // console.log("Marked parsing successful."); // 성공 시 로그 불필요
                } catch (e) {
                    console.error("Marked parsing error:", e, "Raw text:", rawText); // 오류 시 로그 + 원본 텍스트
                    // htmlContent는 이미 위에서 이스케이프된 상태
                }
            } else {
                console.warn("marked library not loaded. Displaying escaped text."); // 라이브러리 미로드 시 경고
            }
            // *** ***

            messageBodyElement.innerHTML = htmlContent; contentWrapper.appendChild(messageBodyElement);
            container.appendChild(profileArea); container.appendChild(contentWrapper); chat.appendChild(container);
        }
    } catch (e) { console.error("Error in appendMessage:", e); }
}


// TXT 내보내기
function exportConversationAsTxt() {
    console.log("exportConversationAsTxt called");
    try {
        if (!conversationHistory || conversationHistory.length === 0) { alert("내보낼 대화 내용이 없습니다."); return; }
        let txtContent = ""; const currentBotName = botNameInputModal?.value || "캐릭터"; const currentUserName = userNameInputModal?.value || "사용자";
        conversationHistory.forEach(entry => {
            if (entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT) return;
            if (entry.messageData?.type === 'image') return;
            const name = (entry.role === "user" ? currentUserName : currentBotName);
            let rawText = entry.messageData?.text || ""; let processedText = rawText.replace(/\*([^*]+)\*/gs, '$1');
            txtContent += `[${name}] : ${processedText.trim()}\n\n`;
        });
        txtContent = txtContent.trimEnd(); if (!txtContent) { alert("내보낼 텍스트 내용이 없습니다."); return; }
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'chat_history.txt';
        document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
        if(actionMenu) actionMenu.classList.remove("visible"); if(menuOverlay) menuOverlay.style.display = 'none';
    } catch (e) { console.error("Error in exportConversationAsTxt:", e); alert("TXT 내보내기 중 오류 발생"); }
}

// 요약
async function summarizeConversation() {
    console.log("summarizeConversation called");
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !menuSummarizeButton) { console.error("Summarize dependencies missing"); return; }
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; loadingSpinner.style.display = 'block'; menuSummarizeButton.disabled = true;
    try {
        const recentHistory = conversationHistory.slice(-10); if (recentHistory.length === 0) { alert("요약할 대화 내용이 없습니다."); return; }
        const summaryPromptText = `...`; const contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }];
        recentHistory.forEach(entry => { /* ... */ }); contentsForApi.push({ role: "user", parts: [{ text: summaryPromptText }] });
        console.log("Sending summary request..."); const res = await fetch(`/api/chat`, { /* ... */ }); console.log("Summary API response status:", res.status);
        let summaryText = ''; if (!res.ok) { /* ... */ } else { /* ... */ }
        appendMessage("bot", { type: 'text', text: `--- 최근 <span class="math-inline">\{recentHistory\.length\}턴 대화 요약 \-\-\-\\n</span>{summaryText}\n---` });
    } catch (error) { /* ... */ } finally { /* ... */ }
}

// 메시지 전송 - 수정: 이미지 URL 처리 분리 강화
async function sendMessage(messageText) {
    console.log("sendMessage called");
    if (!userInput || !sendButton || !actionMenuButton || !feedbackButton || !loadingSpinner) { console.error("sendMessage dependencies missing"); return; }

    let message = messageText.trim();
    if (!message) { userInput.value = ''; autoResizeTextarea.call(userInput); return; }
    console.log("Input message:", message);

    // *** 이미지 URL 인지 먼저 명확히 확인 ***
    const imageUrlPattern = /^(http|https):\/\/[^ "]+?\.(gif|jpe?g|png|webp|bmp)(\?.*)?$/i;
    if (imageUrlPattern.test(message)) {
        console.log("Image URL detected, treating as image message.");
        const imageMessageEntry = { role: "user", messageData: { type: 'image', url: message } };
        conversationHistory.push(imageMessageEntry);
        appendMessage("user", imageMessageEntry.messageData, conversationHistory.length - 1);
        saveConversationHistory();
        userInput.value = ''; autoResizeTextarea.call(userInput);
        // userInput.focus(); // 이미지 입력 후 포커스 유지 여부 선택
        return; // 이미지 처리 후 함수 종료 (API 호출 안 함)
    }

    // --- 아래는 텍스트 메시지 처리 로직 ---
    console.log("Treating message as text.");
    try {
        // 자동 따옴표
        message = message.replace(/(\*.*?\*)\s*([^"\n\r*].*)/g, (match, action, dialogue) => { if (/^\s*["*]/.test(dialogue)) return match; return `<span class="math-inline">\{action\} "</span>{dialogue.trim()}"`; });

        let feedbackToSend = currentFeedback;
        if (currentFeedback) { handleFeedbackSelection(null); }

        const userMessageEntry = { role: "user", messageData: { type: 'text', text: message } };
        conversationHistory.push(userMessageEntry);
        appendMessage("user", userMessageEntry.messageData, conversationHistory.length - 1);
        saveConversationHistory();

        userInput.value = ''; autoResizeTextarea.call(userInput);

        sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true;
        loadingSpinner.style.display = 'block';

        let contentsForApi;
        try {
            const textOnlyContentsForApi = conversationHistory
                .filter(entry => entry.messageData && entry.messageData.type === 'text')
                .map(entry => ({ role: entry.role === 'model' ? 'model' : 'user', parts: [{ text: entry.messageData.text }] }));
            contentsForApi = [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi];
            if (feedbackToSend) {
                 console.log(`Attaching feedback to API call: ${feedbackToSend}`);
                 const lastUserMessageIndex = contentsForApi.length -1;
                 if(contentsForApi[lastUserMessageIndex]?.role === 'user') { contentsForApi[lastUserMessageIndex].parts[0].text = `[사용자 피드백: ${feedbackToSend}] ${contentsForApi[lastUserMessageIndex].parts[0].text}`; }
            }
        } catch (e) { console.error("Error preparing API contents:", e); throw e; }

        if (contentsForApi.length === 1) {
             console.log("API call skipped: only system prompt exists");
             throw new Error("API call skipped intentionally");
        }

        console.log("Sending API request...");
        const res = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: contentsForApi }) });
        console.log("API response status:", res.status);

        let botReplyText = '';
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMsg = errorData?.error?.error?.message || errorData?.error || res.statusText || "API 오류";
            botReplyText = `(오류 발생: ${res.status} - ${errorMsg})`;
        } else {
            const data = await res.json();
            botReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "(응답 없음)";
        }

        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);

    } catch (error) {
        console.error("Error in sendMessage function:", error);
        if (error.message !== "API call skipped intentionally") {
            try {
                const errorMessage = `(메시지 전송 중 오류 발생: ${error.message || '알 수 없는 오류'})`;
                const botMessageEntry = { role: "model", messageData: { type: 'text', text: errorMessage } };
                if(conversationHistory) conversationHistory.push(botMessageEntry);
                appendMessage("bot", botMessageEntry.messageData, conversationHistory ? conversationHistory.length - 1 : -1);
            } catch (appendError) { console.error("Error appending error message:", appendError); }
        }
    } finally {
        console.log("sendMessage finally block executing.");
        try {
            if(sendButton) sendButton.disabled = false; if(userInput) userInput.disabled = false;
            if(actionMenuButton) actionMenuButton.disabled = false; if(feedbackButton) feedbackButton.disabled = false;
            if(loadingSpinner) loadingSpinner.style.display = 'none';
            saveConversationHistory();
            if(chat) requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
            console.log("UI re-enabled.");
        } catch (e) { console.error("Error in finally block:", e); }
    }
}


// '상황' 요청 함수 (절대 수정 금지!) - 함수 본문 복구
async function sendSituationRequest(type) {
    console.log(`sendSituationRequest called with type: ${type}`);
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !botNameInputModal) { console.error("sendSituationRequest dependencies missing"); return;}

    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    try {
        let situationPromptText = ''; const botName = botNameInputModal.value || "캐릭터";
        // *** 원래 프롬프트 내용 ***
        switch(type) {
            case '랜덤': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe current situation needs a fresh development or a change of pace.\nIntroduce a new element, interaction, or internal thought that moves the story forward in an interesting, but not necessarily drastic, way.\nMaintain the established tone and character consistency. Focus on subtle shifts and sensory details. Avoid repetition.\nOutput should feel like a natural continuation of the story.\n`; break;
            case '전환': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nCraft a fresh, emotionally engaging situation that sparks curiosity or connection between the characters — something surprising, light-hearted, or meaningful, based on the unique traits of this character and their world.\nThe event should not be overly dramatic or intense, but should still shift the emotional dynamic in a natural and immersive way.\nAvoid adult or mature content. Do not copy specific examples or past scenes — create a new moment inspired by the tone of gentle tension, humor, or affection.\nThe characters may be human, non-human, or from entirely fantastical settings — ensure the situation makes sense within their universe.\nLet the story unfold with subtle emotional shifts and interaction that feels alive, reactive, and immersive.\n`; break;
            case '성인': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe situation should escalate organically toward mature themes or intimacy, depending on the emotional and physical progression of the scene.\nIf sexual intercourse has not yet occurred, the character must act assertively according to the situation—initiating physical closeness, deepening tension, or shifting setting and posture to increase sensuality.\nIf the scene is already mid-intercourse, the character must introduce new positions, kinks, or climax dynamics to maintain narrative intensity.\nFocus on the character’s inner desires, sensations, and actions with heightened sensual and emotional detail, in accordance with persona rules.\nUse nuanced, vivid language and avoid abrupt pacing or out-of-character behavior. All development must feel inevitable and immersive.\n`; break;
            case '돌발': default: situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe scene has stalled or lost momentum. You must now introduce a new turning point:\neither escalate the current situation, or introduce a **sudden, immersive event**\nthat dramatically changes the mood or setting.\nWrite in a sensory-rich, novel-style format with emphasis on *physical actions, emotional reactions*, and subtle tension.\nUse minimal but meaningful dialogue only when needed. Avoid repetition and do not reference the user's past prompts.\nDo not break character. Maintain continuity in tone and theme. Output should feel seamless in the flow of the story.\n`; break;
        }
        // *** ***

        const textOnlyContentsForApi = conversationHistory.filter(entry => entry.messageData?.type === 'text').map(entry => ({ role: entry.role === 'model' ? 'model' : 'user', parts: [{ text: entry.messageData.text }] }));
        const contentsForApi = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyContentsForApi, { role: "user", parts: [{ text: situationPromptText }] } ];

        console.log("Sending situation request to API...");
        const res = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: contentsForApi }) });
        console.log("Situation API response status:", res.status);

        let botReplyText = '';
        if (!res.ok) { /* ... 오류 처리 ... */ } else { /* ... 성공 처리 ... */ }
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);

    } catch (error) { /* ... 통신 오류 처리 ... */ }
    finally { /* ... 상태 복구 ... */ }
}


// 이미지 URL 미리보기 업데이트
function updateImagePreview(imageUrl, imgElement) { /* ... (이전 최종 버전과 동일) ... */ }

// 슬롯 버튼 스타일 업데이트
function updateSlotButtonStyles() { /* ... (이전 최종 버전과 동일) ... */ }

// 랜덤 생성 함수 (Placeholder)
async function generateRandomCharacter() { /* ... (이전 최종 버전과 동일) ... */ }
async function generateRandomUser() { /* ... (이전 최종 버전과 동일) ... */ }

// 이미지 미리보기 클릭 시 URL 입력
function promptForImageUrl(targetPreviewElement, isBot) { /* ... (이전 최종 버전과 동일) ... */ }

// 채팅 이미지 삽입 함수
function sendImageChatMessage() {
    console.log("sendImageChatMessage called");
    try {
        const imageUrl = prompt("채팅에 삽입할 이미지의 웹 주소(URL)를 입력하세요:");
        if (imageUrl !== null) {
            const trimmedUrl = imageUrl.trim();
            const imageUrlPattern = /^(http|https):\/\/[^ "]+?\.(gif|jpe?g|png|webp|bmp)(\?.*)?$/i;
            if (trimmedUrl && imageUrlPattern.test(trimmedUrl)) {
                sendMessage(trimmedUrl); // sendMessage에 이미지 URL 전달
            } else if (trimmedUrl !== '') {
                alert("유효한 이미지 주소(http... 로 시작하고 이미지 확장자로 끝나야 합니다)를 입력해주세요.");
            }
        }
    } catch (e) { console.error("Error in sendImageChatMessage:", e); alert("이미지 URL 입력 중 오류 발생"); }
    finally { if(actionMenu) actionMenu.classList.remove("visible"); if(menuOverlay) menuOverlay.style.display = 'none'; }
}

// 피드백 선택 처리
function handleFeedbackSelection(feedbackType) { /* ... (이전 최종 버전과 동일) ... */ }

// 대화 기록 저장/로드/리셋
function saveConversationHistory() { /* ... (이전 최종 버전과 동일) ... */ }
function loadConversationHistory() { /* ... (이전 최종 버전과 동일) ... */ }
function resetConversation() { /* ... (이전 최종 버전과 동일) ... */ }


// --- DOMContentLoaded 이벤트 리스너 - 최종 수정 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    try {
        function getElement(id, required = true) { /* ... (이전과 동일) ... */ }
        console.log("Assigning DOM elements...");
        // ... (모든 요소 할당) ...
        console.log("Essential DOM elements assigned. Attaching event listeners...");

        // --- 이벤트 리스너 연결 (Null 체크 강화) ---
        if (sendButton) sendButton.addEventListener("click", () => { if(userInput) sendMessage(userInput.value); });
        if (userInput) userInput.addEventListener("keydown", function(event) { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendMessage(userInput.value); } });
        if (actionMenuButton) actionMenuButton.addEventListener("click", function(event) { /* ... */ });
        if (menuOverlay) menuOverlay.addEventListener("click", function() { /* ... */ });
        if (menuImageButton) menuImageButton.addEventListener("click", sendImageChatMessage); // << 수정됨
        if (menuSituationButton) menuSituationButton.addEventListener("click", function(event) { /* ... */ });
        if (situationOptions) situationOptions.querySelectorAll(".option").forEach(option => { option.addEventListener("click", (event) => { /* ... */ }); });
        if (menuExportTxtButton) menuExportTxtButton.addEventListener("click", exportConversationAsTxt);
        if (menuSummarizeButton) menuSummarizeButton.addEventListener("click", summarizeConversation);
        if (sidebarToggle) sidebarToggle.addEventListener("click", function() { /* ... */ });
        if (closeModalButton) closeModalButton.addEventListener("click", () => { /* ... */ });
        if (settingsModalOverlay) settingsModalOverlay.addEventListener("click", function(event) { /* ... */ });
        if (saveSettingsButtonModal) saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));
        document.querySelectorAll('.slot-button').forEach(button => { button.addEventListener('click', function() { /* ... */ }); });
        if (generateRandomCharacterButton) generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
        if (generateRandomUserButton) generateRandomUserButton.addEventListener('click', generateRandomUser);
        if (botImagePreview) botImagePreview.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
        if (userImagePreview) userImagePreview.addEventListener('click', () => promptForImageUrl(userImagePreview, false));
        if (feedbackButton) feedbackButton.addEventListener("click", function(event) { /* ... */ });
        if (feedbackOptionsContainer) feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => { button.addEventListener('click', function(event) { /* ... */ }); });
        if (userInput) userInput.addEventListener('input', autoResizeTextarea);

        console.log("Event listeners attached.");
        console.log("Running initial setup...");
        initializeChat();
        console.log("Initialization complete.");

    } catch (e) { /* ... */ }
}); // DOMContentLoaded 끝

console.log("Script loaded and parsed.");
