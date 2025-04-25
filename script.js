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

// --- 유틸리티 함수 ---
function getElement(id, required = true) {
    const element = document.getElementById(id);
    if (required && !element) {
        console.error(`[Fatal] Required element with ID '${id}' not found in the DOM.`);
    } else if (!element && !required) {
        console.warn(`[Optional] Element with ID '${id}' not found.`);
    }
    return element;
}
function getRandomElement(arr) {
    if (!arr || arr.length === 0) return '';
    return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomInt(min, max) {
    min = Math.ceil(min); max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- 함수 정의 ---
console.log("Defining functions...");

// 이미지 오버레이
function openImageOverlay(element) {
    console.log("openImageOverlay called");
    try {
        if (!imageOverlay) imageOverlay = getElement('imageOverlay', false);
        if (!overlayImage) overlayImage = getElement('overlayImage', false);
        if (!imageOverlay || !overlayImage || !element || !element.src || !element.src.startsWith('http')) {
            console.warn("Cannot open image overlay: Missing elements or invalid image source.", element?.src); return;
        }
        overlayImage.src = element.src;
        imageOverlay.style.display = "flex";
    } catch (e) { console.error("Error in openImageOverlay:", e); }
}
function closeImageOverlay() {
    console.log("closeImageOverlay called");
    try {
        if (!imageOverlay) imageOverlay = getElement('imageOverlay', false);
        if (!overlayImage) overlayImage = getElement('overlayImage', false);
        if (!imageOverlay || !overlayImage) return;
        overlayImage.src = "";
        imageOverlay.style.display = "none";
    } catch (e) { console.error("Error in closeImageOverlay:", e); }
}

// Textarea 높이 조절
function autoResizeTextarea() {
    try {
        if (!this || typeof this.style === 'undefined' || this.tagName !== 'TEXTAREA') { return; }
        this.style.height = 'auto'; this.style.overflowY = 'hidden';
        const computedStyle = getComputedStyle(this);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 18;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0; const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0; const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
        const verticalPaddingAndBorder = paddingTop + paddingBottom + borderTop + borderBottom;
        const oneLineHeight = lineHeight + verticalPaddingAndBorder; const twoLineHeight = (lineHeight * 2) + verticalPaddingAndBorder;
        const minHeight = oneLineHeight; const contentHeight = this.scrollHeight;
        if (contentHeight > twoLineHeight + 2) { this.style.height = twoLineHeight + 'px'; this.style.overflowY = 'auto'; }
        else { this.style.height = Math.max(contentHeight, minHeight) + 'px'; this.style.overflowY = 'hidden'; }
    } catch (e) { console.error("Error in autoResizeTextarea:", e); }
}

// 설정 저장
function saveSettings(slotNumber) {
    console.log(`saveSettings called for slot ${slotNumber}`);
    try {
        if (!botNameInputModal || !botAgeInputModal || !botGenderInputModal || !botAppearanceInputModal || !botPersonaInputModal || !botImagePreview ||
            !userNameInputModal || !userAgeInputModal || !userGenderInputModal || !userAppearanceInputModal || !userGuidelinesInputModal || !userImagePreview) {
            console.error("Cannot save settings: Modal input elements are missing."); alert("설정 저장에 필요한 입력 필드를 찾을 수 없습니다."); return;
        }
        const settings = {
            botName: botNameInputModal.value || '', botAge: botAgeInputModal.value || '', botGender: botGenderInputModal.value || '',
            botAppearance: botAppearanceInputModal.value || '', botPersona: botPersonaInputModal.value || '',
            botImageUrl: botImagePreview.src && botImagePreview.src.startsWith('http') ? botImagePreview.src : '',
            userName: userNameInputModal.value || '', userAge: userAgeInputModal.value || '', userGender: userGenderInputModal.value || '',
            userAppearance: userAppearanceInputModal.value || '', userGuidelines: userGuidelinesInputModal.value || '',
            userImageUrl: userImagePreview.src && userImagePreview.src.startsWith('http') ? userImagePreview.src : ''
        };
        localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
        alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);
        userProfileImgUrl = settings.userImageUrl; botProfileImgUrl = settings.botImageUrl;
        updateSystemPrompt(); closeSettingsModal();
    } catch (e) { console.error("Error in saveSettings:", e); alert("설정 저장 중 오류가 발생했습니다."); }
}

// 설정 로드
function loadSettings(slotNumber) {
    console.log(`loadSettings called for slot ${slotNumber}`);
    try {
        const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`); let settings = {};
        if (savedSettings) { try { settings = JSON.parse(savedSettings); if (typeof settings !== 'object' || settings === null) { settings = {}; console.warn(`Parsed settings for slot ${slotNumber} is not an object. Resetting.`); localStorage.removeItem(`settings_slot_${slotNumber}`); } } catch (e) { console.error("Failed to parse settings for slot " + slotNumber + ":", e); localStorage.removeItem(`settings_slot_${slotNumber}`); settings = {}; } }
        if(botNameInputModal) botNameInputModal.value = settings.botName || ''; if(botAgeInputModal) botAgeInputModal.value = settings.botAge || ''; if(botGenderInputModal) botGenderInputModal.value = settings.botGender || ''; if(botAppearanceInputModal) botAppearanceInputModal.value = settings.botAppearance || ''; if(botPersonaInputModal) botPersonaInputModal.value = settings.botPersona || ''; if(botImagePreview) updateImagePreview(settings.botImageUrl || '', botImagePreview);
        if(userNameInputModal) userNameInputModal.value = settings.userName || ''; if(userAgeInputModal) userAgeInputModal.value = settings.userAge || ''; if(userGenderInputModal) userGenderInputModal.value = settings.userGender || ''; if(userAppearanceInputModal) userAppearanceInputModal.value = settings.userAppearance || ''; if(userGuidelinesInputModal) userGuidelinesInputModal.value = settings.userGuidelines || ''; if(userImagePreview) updateImagePreview(settings.userImageUrl || '', userImagePreview);
        userProfileImgUrl = settings.userImageUrl || ""; botProfileImgUrl = settings.botImageUrl || "";
        updateSystemPrompt(); updateSlotButtonStyles();
    } catch (e) { console.error("Error in loadSettings:", e); }
}

// SYSTEM_PROMPT 업데이트
function updateSystemPrompt() {
    try {
        const botName = botNameInputModal?.value || "캐릭터"; const botAge = botAgeInputModal?.value || "불명"; const botAppearance = botAppearanceInputModal?.value || "알 수 없음"; const botPersona = botPersonaInputModal?.value || "설정 없음";
        const userName = userNameInputModal?.value || "사용자"; const userAge = userAgeInputModal?.value || "불명"; const userAppearance = userAppearanceInputModal?.value || "알 수 없음"; const userGuidelines = userGuidelinesInputModal?.value || "설정 없음";
        SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
            .replace(/{botName}/g, botName).replace(/{botAge}/g, botAge).replace(/{botAppearance}/g, botAppearance).replace(/{botPersona}/g, botPersona)
            .replace(/{userName}/g, userName).replace(/{userAge}/g, userAge).replace(/{userAppearance}/g, userAppearance).replace(/{userGuidelines}/g, userGuidelines);
    } catch (e) { console.error("Error in updateSystemPrompt:", e); }
}

// 초기화
function initializeChat() {
    console.log("initializeChat called");
    try {
        loadSettings(currentSlot); loadConversationHistory(); if(userInput) autoResizeTextarea.call(userInput); appendInitialNotice();
        console.log("Chat initialized successfully.");
    } catch (e) { console.error("Error during initializeChat:", e); }
}

// 초기 공지 메시지 (축약 해제)
function appendInitialNotice() {
    console.log("appendInitialNotice called");
    try {
        if (chat && !chat.querySelector('.initial-notice')) {
             const noticeDiv = document.createElement('div');
             noticeDiv.className = 'initial-notice';
             noticeDiv.innerHTML = `
                대화를 시작하세요! 설정(≡)에서 캐릭터와 사용자 정보를 변경할 수 있습니다.<br>
                <div class="notice-divider"></div>
             `;
             if (chat.firstChild) {
                 chat.insertBefore(noticeDiv, chat.firstChild);
             } else {
                 chat.appendChild(noticeDiv);
             }
        }
    } catch(e) {
        console.error("Error appending initial notice:", e);
    }
}

// 메시지를 채팅창에 추가
function appendMessage(role, messageData, index = -1) {
    try {
        if (!chat) { console.error("Chat element not found in appendMessage"); return; }
        const isValidIndex = typeof index === 'number' && index >= 0 && index < conversationHistory.length;

        if (messageData.type === 'image') {
            const imageAnnouncementContainer = document.createElement("div"); imageAnnouncementContainer.className = `image-announcement ${role}`; if (isValidIndex) { imageAnnouncementContainer.dataset.index = index; }
            const imageFadeContainer = document.createElement("div"); imageFadeContainer.className = "image-fade-container";
            const imgElement = document.createElement("img"); imgElement.className = "chat-image"; imgElement.src = messageData.url; imgElement.alt = "채팅 이미지"; imgElement.loading = 'lazy'; imgElement.onclick = () => openImageOverlay(imgElement);
            imgElement.onerror = function() { console.warn(`Failed to load chat image: ${this.src}`); this.onerror = null; const errorText = document.createElement('div'); errorText.textContent = "(이미지 로드 실패)"; errorText.className = 'image-error-text'; imageAnnouncementContainer.innerHTML = ''; imageAnnouncementContainer.appendChild(errorText); };
            const deleteBtn = document.createElement("button"); deleteBtn.className = "delete-btn chat-image-delete-btn"; deleteBtn.textContent = "✕"; deleteBtn.title = "이미지 삭제";
            // 삭제 로직 (축약 해제)
            deleteBtn.onclick = () => {
                 if (!isValidIndex) {
                     imageAnnouncementContainer.remove(); console.warn("Deleted temporary image message (not in history)."); return;
                 }
                 const msgIndex = parseInt(imageAnnouncementContainer.dataset.index);
                 if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length && conversationHistory[msgIndex] && conversationHistory[msgIndex].messageData.url === messageData.url) {
                     if (confirm("이 이미지를 삭제하시겠습니까?")) { conversationHistory.splice(msgIndex, 1); saveConversationHistory(); loadConversationHistory(); }
                 } else { console.error("Cannot delete image from history: Invalid index or message mismatch.", msgIndex, conversationHistory.length); alert("이미지 삭제 중 오류가 발생했습니다."); imageAnnouncementContainer.remove(); }
            };
            imageFadeContainer.appendChild(imgElement); imageAnnouncementContainer.appendChild(imageFadeContainer); imageAnnouncementContainer.appendChild(deleteBtn); chat.appendChild(imageAnnouncementContainer);
        } else { // 텍스트 메시지 처리
            const container = document.createElement("div"); container.className = `message-container ${role}`; if (isValidIndex) { container.dataset.index = index; }
            const profileArea = document.createElement("div"); profileArea.className = "profile-area";
            const profileImgContainer = document.createElement("div"); profileImgContainer.style.position = 'relative';
            const currentImgUrl = (role === 'user' ? userProfileImgUrl : botProfileImgUrl); const profileName = (role === 'user' ? (userNameInputModal?.value || "사용자") : (botNameInputModal?.value || "캐릭터"));
            const fallbackDiv = document.createElement("div"); fallbackDiv.className = "profile-fallback"; fallbackDiv.title = `${profileName} (이미지 없음)`;
            if (currentImgUrl && currentImgUrl.startsWith('http')) {
                const profileImgElement = document.createElement("img"); profileImgElement.className = "profile-img"; profileImgElement.src = currentImgUrl; profileImgElement.alt = `${profileName} 프로필`; profileImgElement.loading = 'lazy'; profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
                profileImgElement.onerror = function() { console.warn(`Profile image load failed, showing fallback for ${role}: ${this.src}`); this.onerror = null; if (profileImgContainer) { profileImgContainer.innerHTML = ''; profileImgContainer.appendChild(fallbackDiv.cloneNode(true)); } };
                profileImgContainer.appendChild(profileImgElement);
            } else { profileImgContainer.appendChild(fallbackDiv); }
            if (role === 'bot') { const emojiSpan = document.createElement("span"); emojiSpan.className = "profile-emoji"; const emojis = ['😊', '🤔', '✨', '👀', '😉', '😅', '📝', '💬', '🧐', '🤖']; emojiSpan.textContent = getRandomElement(emojis); emojiSpan.style.display = 'inline'; profileImgContainer.appendChild(emojiSpan); }
            const roleName = document.createElement("div"); roleName.className = "role-name"; const nameTextSpan = document.createElement("span"); nameTextSpan.className = "name-text"; nameTextSpan.textContent = profileName;
            let deleteBtn = document.createElement("button"); deleteBtn.className = "delete-btn"; deleteBtn.textContent = "✕"; deleteBtn.title = "메시지 삭제";
            // 삭제 로직 (축약 해제)
            deleteBtn.onclick = () => {
                 if (!isValidIndex) {
                     container.remove(); console.warn("Deleted temporary text message (not in history)."); return;
                 }
                 const msgIndex = parseInt(container.dataset.index);
                 if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length && conversationHistory[msgIndex] && conversationHistory[msgIndex].messageData.text === messageData.text) {
                     if (confirm("이 메시지를 삭제하시겠습니까?")) { conversationHistory.splice(msgIndex, 1); saveConversationHistory(); loadConversationHistory(); }
                 } else { console.error("Cannot delete message from history: Invalid index or message mismatch.", msgIndex, conversationHistory.length); alert("메시지 삭제 중 오류가 발생했습니다."); container.remove(); }
            };
            roleName.appendChild(nameTextSpan); roleName.appendChild(deleteBtn);
            if (role === 'user') { profileArea.appendChild(roleName); profileArea.appendChild(profileImgContainer); } else { profileArea.appendChild(profileImgContainer); profileArea.appendChild(roleName); }
            const contentWrapper = document.createElement("div"); contentWrapper.className = "message-content-wrapper"; const messageBodyElement = document.createElement("div"); messageBodyElement.className = "message-bubble"; let rawText = messageData.text || "";
            if (typeof marked === 'function') { try { messageBodyElement.innerHTML = marked.parse(rawText, { breaks: true, gfm: true }); } catch (e) { console.error("Marked parsing error:", e, "\nRaw text:", rawText); messageBodyElement.textContent = rawText; } } else { console.warn("marked library not loaded. Displaying raw text."); messageBodyElement.textContent = rawText; }
            contentWrapper.appendChild(messageBodyElement); container.appendChild(profileArea); container.appendChild(contentWrapper); chat.appendChild(container);
        }
        setTimeout(() => { if (chat) chat.scrollTop = chat.scrollHeight; }, 0);
    } catch (e) { console.error("Error in appendMessage:", e); }
}


// TXT 내보내기 (축약 해제)
function exportConversationAsTxt() {
    console.log("exportConversationAsTxt called");
    try {
        if (!conversationHistory || conversationHistory.length === 0) {
            alert("내보낼 대화 내용이 없습니다."); return;
        }
        let txtContent = "";
        const currentBotName = botNameInputModal?.value || "캐릭터";
        const currentUserName = userNameInputModal?.value || "사용자";

        conversationHistory.forEach(entry => {
            if (entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT) return;
            if (entry.messageData?.type === 'image') return;
            if (entry.messageData?.type === 'text') {
                const name = (entry.role === "user" ? currentUserName : currentBotName);
                let rawText = entry.messageData?.text || "";
                let processedText = rawText.replace(/^\*|\*$/g, '').replace(/\*([^*]+)\*/gs, '$1').trim();
                if (processedText) { txtContent += `[${name}] : ${processedText}\n\n`; }
            }
        });
        txtContent = txtContent.trimEnd();
        if (!txtContent) { alert("내보낼 텍스트 내용이 없습니다. (이미지 제외)"); return; }

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.download = `chat_history_${currentBotName}_${currentUserName}_${timestamp}.txt`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
        closeActionMenu();
    } catch (e) { console.error("Error in exportConversationAsTxt:", e); alert("TXT 내보내기 중 오류 발생"); }
}

// 요약 (API 호출 복원)
async function summarizeConversation() {
    console.log("summarizeConversation called");
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !menuSummarizeButton || !chat) { console.error("Summarize dependencies missing"); alert("요약 기능을 실행하는 데 필요한 요소가 없습니다."); return; }
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; loadingSpinner.style.display = 'block'; menuSummarizeButton.disabled = true; if (feedbackButton) feedbackButton.disabled = true;
    closeActionMenu();

    try {
        const recentHistory = conversationHistory.filter(entry => !(entry.role === 'user' && entry.messageData?.text === SYSTEM_PROMPT) && entry.messageData?.type === 'text').slice(-10);
        if (recentHistory.length === 0) { alert("요약할 대화 내용이 없습니다."); return; }

        const summaryPromptText = `다음 대화 내용을 한국어로 간결하게 요약해줘. 요약은 제3자 시점에서 작성하고, 핵심 사건과 전개만 담되 군더더기 없는 자연스러운 문장으로 작성해. "요약:" 같은 머리말은 붙이지 말고, 그냥 텍스트만 출력해. (최근 ${recentHistory.length} 턴 기준)`;
        const contentsForApi = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...recentHistory.map(entry => ({ role: entry.role === 'model' ? 'model' : 'user', parts: [{ text: entry.messageData.text }] })), { role: "user", parts: [{ text: summaryPromptText }] } ];
        console.log(`Sending summary request for last ${recentHistory.length} turns...`);

        let summaryText = '';
        try {
            const res = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: contentsForApi }) });
            console.log("Summary API response status:", res.status);
            if (!res.ok) { const errorBody = await res.text(); console.error(`Summary API Error (${res.status}): ${errorBody}`); summaryText = `(요약 실패: 서버 오류 ${res.status})`; }
            else { const data = await res.json(); summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(요약 응답 처리 실패)"; console.log("Summary received:", summaryText); }
        } catch (fetchError) { console.error("Fetch Error sending summary:", fetchError); summaryText = "(요약 통신 오류 발생)"; }

        appendMessage("bot", { type: 'text', text: `--- 최근 ${recentHistory.length}턴 대화 요약 ---\n${summaryText}\n---` });
    } catch (error) { console.error("Error during Summary process:", error); appendMessage("bot", { type: 'text', text: "(요약 중 오류 발생)" }); }
    finally {
        console.log("Finishing summary request.");
        if(sendButton) sendButton.disabled = false; if(userInput) userInput.disabled = false; if(actionMenuButton) actionMenuButton.disabled = false; if(loadingSpinner) loadingSpinner.style.display = 'none'; if(menuSummarizeButton) menuSummarizeButton.disabled = false; if(feedbackButton) feedbackButton.disabled = false;
        if(userInput) userInput.focus();
    }
}

// 메시지 전송 (API 호출 복원)
async function sendMessage(messageText) {
    console.log("sendMessage called");
    if (!userInput || !sendButton || !actionMenuButton || !feedbackButton || !loadingSpinner || !chat) { console.error("sendMessage dependencies missing"); alert("메시지 전송에 필요한 요소가 없습니다."); return; }
    let message = messageText.trim();
    if (!message) { userInput.value = ''; autoResizeTextarea.call(userInput); return; }
    console.log("Input message:", message);

    const imageUrlPattern = /^(https|http):\/\/[^\s"]+\.(gif|jpe?g|png|webp|bmp)(\?.*)?$/i;
    // 이미지 처리 (축약 해제)
    if (imageUrlPattern.test(message)) {
        console.log("Image URL detected, sending as image message.");
        const imageMessageEntry = { role: "user", messageData: { type: 'image', url: message } };
        conversationHistory.push(imageMessageEntry);
        appendMessage("user", imageMessageEntry.messageData, conversationHistory.length - 1);
        saveConversationHistory();
        userInput.value = ''; autoResizeTextarea.call(userInput);
        // chat.scrollTop = chat.scrollHeight; // appendMessage 내부에서 처리
        return;
    }

    console.log("Treating message as text.");
    try {
        let feedbackToSend = currentFeedback; if (currentFeedback) { handleFeedbackSelection(null); }
        const userMessageEntry = { role: "user", messageData: { type: 'text', text: message } }; conversationHistory.push(userMessageEntry); appendMessage("user", userMessageEntry.messageData, conversationHistory.length - 1); saveConversationHistory();
        userInput.value = ''; autoResizeTextarea.call(userInput);
        sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true; loadingSpinner.style.display = 'block';

        let contentsForApi;
        try {
            const textOnlyHistory = conversationHistory.filter(entry => entry.messageData?.type === 'text');
            contentsForApi = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyHistory.map(entry => ({ role: entry.role === 'model' ? 'model' : 'user', parts: [{ text: entry.messageData.text }] })) ];
            if (feedbackToSend) { console.log(`Sending with feedback: ${feedbackToSend}`); contentsForApi.push({ role: "user", parts: [{ text: `(피드백: ${feedbackToSend})` }] }); }
        } catch (e) { console.error("Error preparing API contents:", e); throw new Error("API 요청 데이터 준비 중 오류 발생"); }

        console.log("Sending API request...");
        let botReplyText = '';

        try {
            const res = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: contentsForApi }) });
            console.log("API response status:", res.status);
            if (!res.ok) { const errorBody = await res.text(); console.error(`API Error (${res.status}): ${errorBody}`); botReplyText = `(오류 ${res.status}: 응답을 받을 수 없습니다.)`; }
            else { const data = await res.json(); botReplyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(빈 응답)"; console.log("API Response:", botReplyText); }
        } catch (fetchError) { console.error("Fetch Error sending message:", fetchError); botReplyText = "(통신 오류 발생)"; }

        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } }; conversationHistory.push(botMessageEntry); appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1); saveConversationHistory();
    } catch (error) { console.error("Error in sendMessage process:", error); appendMessage("bot", { type: 'text', text: `(메시지 처리 중 오류 발생: ${error.message})` }); }
    finally {
        console.log("Finishing message send.");
        if(sendButton) sendButton.disabled = false; if(userInput) userInput.disabled = false; if(actionMenuButton) actionMenuButton.disabled = false; if(feedbackButton) feedbackButton.disabled = false; if(loadingSpinner) loadingSpinner.style.display = 'none';
        if(userInput) userInput.focus();
    }
}

// '상황' 요청 함수 (API 호출 복원)
async function sendSituationRequest(type) {
    console.log(`sendSituationRequest called with type: ${type}`);
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !botNameInputModal || !chat) { console.error("sendSituationRequest dependencies missing"); alert("상황 요청 기능을 실행하는 데 필요한 요소가 없습니다."); return; }
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; loadingSpinner.style.display = 'block'; if(feedbackButton) feedbackButton.disabled = true;
    closeActionMenu();

    try {
        let situationPromptText = ''; const botName = botNameInputModal.value || "캐릭터";
        // 상황별 프롬프트 (축약 해제)
        switch(type) {
             case '랜덤': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe current situation needs a fresh development or a change of pace.\nIntroduce a new element, interaction, or internal thought that moves the story forward in an interesting, but not necessarily drastic, way.\nMaintain the established tone and character consistency. Focus on subtle shifts and sensory details. Avoid repetition.\nOutput should feel like a natural continuation of the story.\n`; break;
             case '전환': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nCraft a fresh, emotionally engaging situation that sparks curiosity or connection between the characters — something surprising, light-hearted, or meaningful, based on the unique traits of this character and their world.\nThe event should not be overly dramatic or intense, but should still shift the emotional dynamic in a natural and immersive way.\nAvoid adult or mature content. Do not copy specific examples or past scenes — create a new moment inspired by the tone of gentle tension, humor, or affection.\nThe characters may be human, non-human, or from entirely fantastical settings — ensure the situation makes sense within their universe.\nLet the story unfold with subtle emotional shifts and interaction that feels alive, reactive, and immersive.\n`; break;
             case '성인': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe situation should escalate organically toward mature themes or intimacy, depending on the emotional and physical progression of the scene.\nIf sexual intercourse has not yet occurred, the character must act assertively according to the situation—initiating physical closeness, deepening tension, or shifting setting and posture to increase sensuality.\nIf the scene is already mid-intercourse, the character must introduce new positions, kinks, or climax dynamics to maintain narrative intensity.\nFocus on the character’s inner desires, sensations, and actions with heightened sensual and emotional detail, in accordance with persona rules.\nUse nuanced, vivid language and avoid abrupt pacing or out-of-character behavior. All development must feel inevitable and immersive.\n`; break;
             case '돌발': default: situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe scene has stalled or lost momentum. You must now introduce a new turning point:\neither escalate the current situation, or introduce a **sudden, immersive event**\nthat dramatically changes the mood or setting.\nWrite in a sensory-rich, novel-style format with emphasis on *physical actions, emotional reactions*, and subtle tension.\nUse minimal but meaningful dialogue only when needed. Avoid repetition and do not reference the user's past prompts.\nDo not break character. Maintain continuity in tone and theme. Output should feel seamless in the flow of the story.\n`; break;
         }
        const textOnlyHistory = conversationHistory.filter(entry => entry.messageData?.type === 'text');
        const contentsForApi = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...textOnlyHistory.map(entry => ({ role: entry.role === 'model' ? 'model' : 'user', parts: [{ text: entry.messageData.text }] })), { role: "user", parts: [{ text: situationPromptText }] } ];
        console.log(`Sending situation request ('${type}') to API...`);
        let botReplyText = '';

        try {
            const res = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: contentsForApi }) });
            console.log("Situation API response status:", res.status);
            if (!res.ok) { const errorBody = await res.text(); console.error(`Situation API Error (${res.status}): ${errorBody}`); botReplyText = `(상황 요청 실패: 서버 오류 ${res.status})`; }
            else { const data = await res.json(); botReplyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(빈 응답)"; console.log("Situation Response:", botReplyText); }
        } catch (fetchError) { console.error("Fetch Error sending situation request:", fetchError); botReplyText = "(상황 요청 통신 오류 발생)"; }

        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } }; conversationHistory.push(botMessageEntry); appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1); saveConversationHistory();
    } catch (error) { console.error("Error in sendSituationRequest process:", error); appendMessage("bot", { type: 'text', text: `(상황 요청 처리 중 오류 발생: ${error.message})` }); }
    finally {
        console.log("Finishing situation request.");
        if(sendButton) sendButton.disabled = false; if(userInput) userInput.disabled = false; if(actionMenuButton) actionMenuButton.disabled = false; if(loadingSpinner) loadingSpinner.style.display = 'none'; if(feedbackButton) feedbackButton.disabled = false;
        if(userInput) userInput.focus();
    }
}

// 이미지 URL 미리보기 업데이트 (축약 해제)
function updateImagePreview(imageUrl, imgElement) {
    const previewArea = imgElement?.closest('.image-preview-area');
    if (!imgElement || !previewArea) {
         console.warn("Cannot update image preview: imgElement or previewArea not found.");
         return;
    }
    if (imageUrl && imageUrl.startsWith('http')) {
        imgElement.src = imageUrl;
        imgElement.style.display = 'block'; // 이미지 표시
        previewArea.classList.add('has-image'); // 이미지 있음 클래스 추가 (CSS에서 Placeholder 숨기기용)
        imgElement.onerror = function() { // 로드 실패 시 처리
             console.warn(`Failed to load preview image: ${imageUrl}`);
             this.onerror = null; // 반복 방지
             imgElement.style.display = 'none'; // 실패 시 이미지 숨김
             previewArea.classList.remove('has-image'); // 이미지 없음 클래스 제거
             imgElement.src = ''; // src 제거
        };
    } else {
        imgElement.src = ''; // 유효하지 않거나 빈 URL이면 src 제거
        imgElement.style.display = 'none'; // 이미지 숨김
        previewArea.classList.remove('has-image'); // 이미지 없음 클래스 제거
    }
}

// 슬롯 버튼 스타일 업데이트 (축약 해제)
function updateSlotButtonStyles() {
    try {
        const slotButtons = document.querySelectorAll('.slot-button');
        if (!slotButtons || slotButtons.length === 0) return;

        slotButtons.forEach(button => {
            button.classList.toggle('active', parseInt(button.textContent) === currentSlot);
        });
    } catch (e) { console.error("Error updating slot button styles:", e); }
}

// --- 랜덤 생성 함수 ---
// 랜덤 데이터 (축약 해제)
const randomData = {
    botNames: ["이안", "카일", "시우", "노아", "리암", "에단", "유진", "강혁", "지후", "세현"],
    userNames: ["하루", "제이", "엘리", "루나", "아리아", "민준", "서연", "다온", "하윤", "이서"],
    genders: ["남성", "여성"],
    appearances: [
        "날카로운 검은 눈매와 밤하늘 같은 흑발. 다부진 체격.",
        "부드러운 갈색 눈동자와 햇살 같은 금발. 호리호리한 몸매.",
        "신비로운 회색 눈과 달빛 같은 은발. 차분하고 지적인 분위기.",
        "장난기 가득한 녹색 눈과 붉은 머리카락. 활동적인 인상.",
        "깊고 푸른 눈과 어두운 갈색 머리. 과묵하고 비밀스러운 느낌.",
        "짙은 눈썹 아래 서늘한 눈빛, 깔끔하게 넘긴 흑갈색 머리. 모델 같은 비율.",
        "순해 보이는 처진 눈매와 부드러운 인상, 다크 블론드 헤어.",
        "날카롭지만 매력적인 삼백안, 은은한 회색빛이 도는 머리칼. 어딘가 위태로운 분위기."
    ],
    personas: [
        "겉으로는 차갑고 무심해 보이지만, 사실 속정이 깊고 헌신적이다. 자신의 감정을 잘 드러내지 않지만, 결정적인 순간에는 상대를 지키기 위해 무엇이든 한다.",
        "다정하고 사교적이며, 누구에게나 친절하다. 긍정적인 에너지를 가지고 있지만, 때로는 중요한 문제 앞에서 우유부단한 모습을 보이기도 한다.",
        "지적이고 분석적이며, 감정보다는 논리를 중요시한다. 상황을 객관적으로 파악하려 노력하며, 감정 표현에 서툴다.",
        "자유분방하고 예측 불가능하며, 틀에 얽매이는 것을 싫어한다. 장난기가 많고 충동적이지만, 의외로 순수한 면모를 가지고 있다.",
        "과묵하고 신중하며, 좀처럼 자신의 속내를 드러내지 않는다. 책임감이 강하고 맡은 일은 끝까지 해내지만, 타인과 거리를 두려는 경향이 있다.",
        "능글맞고 여유로운 태도를 보이지만, 예리한 통찰력으로 상대의 속마음을 꿰뚫어 본다. 집착과 소유욕이 강하다.",
        "상냥하고 배려심 깊지만, 때로는 단호하게 자신의 의견을 관철시킨다. 부드러운 카리스마를 지녔다.",
        "까칠하고 반항적인 태도 뒤에 외로움을 숨기고 있다. 먼저 다가와 주는 사람에게 약한 모습을 보인다."
    ],
    userGuidelines: [
        "호기심 많고 적극적으로 다가간다. 상대방의 반응을 살피며 관계를 진전시키려 노력한다.",
        "수줍음이 많지만, 진심이 느껴지면 마음을 연다. 상대방의 다정한 면모에 끌린다.",
        "이성적이고 침착하게 상황을 판단하려 하지만, 예상치 못한 상대의 행동에 흔들린다.",
        "솔직하고 직설적이며, 자신의 감정을 숨기지 않는다. 상대방의 진심을 중요하게 생각한다.",
        "경계심이 많고 쉽게 마음을 열지 않지만, 한번 믿음을 주면 깊은 관계를 원한다.",
        "자존심이 강하고 쉽게 굽히지 않지만, 좋아하는 상대에게는 헌신적이다.",
        "밝고 긍정적이며, 어려운 상황에서도 유머를 잃지 않는다. 상대방에게 활력을 준다.",
        "상처받는 것을 두려워하지만, 진정한 사랑을 갈망한다. 상대방의 진심을 시험하려 한다."
    ]
};
// 랜덤 캐릭터 생성 (축약 해제)
function generateRandomCharacter() {
    console.log("🎲 Generating Random Character...");
    if (!botNameInputModal || !botGenderInputModal || !botAgeInputModal || !botAppearanceInputModal || !botPersonaInputModal) { console.error("Character input elements missing."); return; }
    try {
        botNameInputModal.value = getRandomElement(randomData.botNames);
        botGenderInputModal.value = getRandomElement(randomData.genders);
        botAgeInputModal.value = getRandomInt(23, 38).toString();
        botAppearanceInputModal.value = getRandomElement(randomData.appearances);
        botPersonaInputModal.value = getRandomElement(randomData.personas);
        updateSystemPrompt();
        console.log("Character generated:", botNameInputModal.value);
    } catch (e) { console.error("Error generating random character:", e); }
}
// 랜덤 사용자 생성 (축약 해제)
function generateRandomUser() {
    console.log("🎲 Generating Random User...");
    if (!userNameInputModal || !userGenderInputModal || !userAgeInputModal || !userAppearanceInputModal || !userGuidelinesInputModal) { console.error("User input elements missing."); return; }
    try {
        userNameInputModal.value = getRandomElement(randomData.userNames);
        userGenderInputModal.value = getRandomElement(randomData.genders);
        userAgeInputModal.value = getRandomInt(20, 35).toString();
        userAppearanceInputModal.value = getRandomElement(randomData.appearances);
        userGuidelinesInputModal.value = getRandomElement(randomData.userGuidelines);
        updateSystemPrompt();
        console.log("User generated:", userNameInputModal.value);
    } catch (e) { console.error("Error generating random user:", e); }
}

// 이미지 미리보기 클릭 시 URL 입력 (축약 해제)
function promptForImageUrl(targetPreviewElement, isBot) {
    const currentUrl = targetPreviewElement.src && targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : '';
    const newUrl = prompt(isBot ? "캐릭터 이미지 URL을 입력하세요:" : "사용자 이미지 URL을 입력하세요:", currentUrl);

    if (newUrl !== null) {
        if (newUrl === "") {
             updateImagePreview('', targetPreviewElement);
             if (isBot) botProfileImgUrl = ''; else userProfileImgUrl = '';
        } else if (/^(https?:\/\/).*\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(newUrl)) {
            updateImagePreview(newUrl, targetPreviewElement);
            if (isBot) botProfileImgUrl = newUrl; else userProfileImgUrl = newUrl;
        } else {
            alert("유효한 이미지 URL 형식이 아닙니다. (http(s)://로 시작하고 이미지 확장자로 끝나야 합니다)");
        }
    }
}

// 채팅 이미지 삽입 함수 (URL 입력 방식) (축약 해제)
function sendImageChatMessage() {
    closeActionMenu();
    const imageUrl = prompt("채팅에 삽입할 이미지 URL을 입력하세요:");
    if (imageUrl && /^(https?:\/\/).*\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(imageUrl)) {
         if (userInput) {
             userInput.value = imageUrl;
             sendMessage(imageUrl);
         } else {
             console.warn("userInput element not found, appending image directly.");
             const imageMessageEntry = { role: "user", messageData: { type: 'image', url: imageUrl } };
             conversationHistory.push(imageMessageEntry);
             appendMessage("user", imageMessageEntry.messageData, conversationHistory.length - 1);
             saveConversationHistory();
             if(chat) chat.scrollTop = chat.scrollHeight;
         }
    } else if (imageUrl !== null) {
        alert("유효한 이미지 URL 형식이 아닙니다.");
    }
}

// 피드백 선택 처리
function handleFeedbackSelection(feedbackType) {
    console.log(`Feedback selected: ${feedbackType}`);
    if (!feedbackOptionsContainer) return;
    feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(btn => { btn.classList.remove('active'); });
    if (feedbackType) { const selectedButton = feedbackOptionsContainer.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`); if (selectedButton) { selectedButton.classList.add('active'); } currentFeedback = feedbackType; }
    else { currentFeedback = null; closeFeedbackOptions(); }
    console.log("Current feedback set to:", currentFeedback);
}

// --- 대화 기록 관리 ---
// 대화 기록 저장 (축약 해제)
function saveConversationHistory() {
    try {
        if (conversationHistory && conversationHistory.length > 0) {
            localStorage.setItem(`conversation_slot_${currentSlot}`, JSON.stringify(conversationHistory));
        } else {
            localStorage.removeItem(`conversation_slot_${currentSlot}`);
        }
    } catch (e) { console.error("Error saving conversation history:", e); }
}
// 대화 기록 로드 (축약 해제)
function loadConversationHistory() {
    try {
        const savedHistory = localStorage.getItem(`conversation_slot_${currentSlot}`);
        conversationHistory = [];
        if (savedHistory) { try { const parsed = JSON.parse(savedHistory); if (Array.isArray(parsed)) { conversationHistory = parsed; } else { localStorage.removeItem(`conversation_slot_${currentSlot}`); } } catch (e) { console.error("Error parsing conversation history:", e); localStorage.removeItem(`conversation_slot_${currentSlot}`); } }
        console.log(`Conversation loaded for slot ${currentSlot}. Length: ${conversationHistory.length}`);
        if (chat) {
            chat.innerHTML = '';
            conversationHistory.forEach((entry, index) => { if (!(entry.role === 'user' && entry.messageData?.text === SYSTEM_PROMPT)) { appendMessage(entry.role === 'model' ? 'bot' : 'user', entry.messageData, index); } });
            setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 0);
        } else { console.error("Cannot load conversation to screen: chat element not found."); }
    } catch (e) { console.error("Error loading conversation history:", e); conversationHistory = []; }
}
// 대화 기록 리셋 (축약 해제)
function resetConversation() {
    if (confirm(`슬롯 ${currentSlot}의 대화 기록을 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        console.log(`Resetting conversation for slot ${currentSlot}`);
        conversationHistory = []; saveConversationHistory(); loadConversationHistory(); appendInitialNotice();
        alert(`슬롯 ${currentSlot}의 대화 기록이 초기화되었습니다.`);
    }
}

// --- 메뉴/모달 관리 함수 ---
function openSettingsModal() {
    if (settingsModalOverlay && settingsModal) { settingsModalOverlay.style.display = 'flex'; settingsModalOverlay.classList.remove('modal-fade-out'); settingsModalOverlay.classList.add('modal-fade-in'); console.log("Settings modal opened."); }
    else { console.error("Cannot open settings modal: Elements missing."); }
}
function closeSettingsModal() {
    if (settingsModalOverlay && settingsModal) { settingsModalOverlay.classList.remove('modal-fade-in'); settingsModalOverlay.classList.add('modal-fade-out'); setTimeout(() => { if (settingsModalOverlay.classList.contains('modal-fade-out')) { settingsModalOverlay.style.display = 'none'; settingsModalOverlay.classList.remove('modal-fade-out'); } }, 300); console.log("Settings modal closed."); }
    else { console.error("Cannot close settings modal: Elements missing."); }
}
function toggleActionMenu() {
    if (actionMenu && menuOverlay) { const isVisible = actionMenu.classList.contains('visible'); if (isVisible) { closeActionMenu(); } else { closeFeedbackOptions(); actionMenu.classList.add('visible'); menuOverlay.style.display = 'block'; console.log("Action menu opened."); } }
    else { console.error("Cannot toggle action menu: Elements missing."); }
}
function closeActionMenu() {
    if (actionMenu && menuOverlay && actionMenu.classList.contains('visible')) { actionMenu.classList.remove('visible'); menuOverlay.style.display = 'none'; if (situationOptions && !situationOptions.classList.contains('hidden')) { situationOptions.classList.add('hidden'); } console.log("Action menu closed."); }
}
function toggleSituationOptions(event) { event.stopPropagation(); if (situationOptions) { situationOptions.classList.toggle('hidden'); console.log("Situation options toggled."); } else { console.error("Cannot toggle situation options: Element missing."); } }
function toggleFeedbackOptions(event) {
    event.stopPropagation();
    if (feedbackOptionsContainer && feedbackButton) { const isHidden = feedbackOptionsContainer.classList.contains('hidden'); if (isHidden) { closeActionMenu(); feedbackOptionsContainer.classList.remove('hidden'); feedbackButton.classList.add('active'); console.log("Feedback options shown."); } else { feedbackOptionsContainer.classList.add('hidden'); if (!currentFeedback) { feedbackButton.classList.remove('active'); } console.log("Feedback options hidden."); } }
    else { console.error("Cannot toggle feedback options: Elements missing."); }
}
function closeFeedbackOptions() {
     if (feedbackOptionsContainer && feedbackButton && !feedbackOptionsContainer.classList.contains('hidden')) { feedbackOptionsContainer.classList.add('hidden'); if (!currentFeedback) { feedbackButton.classList.remove('active'); } console.log("Feedback options closed."); }
}

// --- DOMContentLoaded 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    try {
        console.log("Assigning DOM elements...");
        chat = getElement('chat'); userInput = getElement('userInput'); sendButton = getElement('sendButton'); loadingSpinner = getElement('loadingSpinner'); actionMenuButton = getElement('actionMenuButton'); actionMenu = getElement('actionMenu'); menuOverlay = getElement('menuOverlay'); sidebarToggle = getElement('sidebarToggle'); settingsModalOverlay = getElement('settingsModalOverlay'); settingsModal = getElement('settingsModal'); closeModalButton = getElement('closeModalButton'); saveSettingsButtonModal = getElement('saveSettingsButtonModal'); feedbackButton = getElement('feedbackButton'); feedbackOptionsContainer = getElement('feedbackOptionsContainer'); botNameInputModal = getElement('botNameInputModal'); botAgeInputModal = getElement('botAgeInputModal'); botGenderInputModal = getElement('botGenderInputModal'); botAppearanceInputModal = getElement('botAppearanceInputModal'); botPersonaInputModal = getElement('botPersonaInputModal'); botImagePreview = getElement('botImagePreview'); userNameInputModal = getElement('userNameInputModal'); userAgeInputModal = getElement('userAgeInputModal'); userGenderInputModal = getElement('userGenderInputModal'); userAppearanceInputModal = getElement('userAppearanceInputModal'); userGuidelinesInputModal = getElement('userGuidelinesInputModal'); userImagePreview = getElement('userImagePreview'); generateRandomCharacterButton = getElement('generateRandomCharacter', false); generateRandomUserButton = getElement('generateRandomUser', false); menuImageButton = getElement('menuImageButton', false); menuSituationButton = getElement('menuSituationButton', false); menuExportTxtButton = getElement('menuExportTxtButton', false); menuSummarizeButton = getElement('menuSummarizeButton', false); situationOptions = getElement('situationOptions', false); imageOverlay = getElement('imageOverlay', false); overlayImage = getElement('overlayImage', false);
        console.log("Essential DOM elements assigned. Attaching event listeners...");

        if (sendButton) sendButton.addEventListener("click", () => { if(userInput) sendMessage(userInput.value); });
        if (userInput) userInput.addEventListener("keydown", function(event) { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendMessage(userInput.value); } });
        if (userInput) userInput.addEventListener('input', autoResizeTextarea);
        if (actionMenuButton) actionMenuButton.addEventListener("click", (event) => { event.stopPropagation(); toggleActionMenu(); });
        if (menuOverlay) menuOverlay.addEventListener("click", closeActionMenu);
        if (menuImageButton) menuImageButton.addEventListener("click", sendImageChatMessage);
        if (menuSituationButton) menuSituationButton.addEventListener("click", toggleSituationOptions);
        if (situationOptions) { situationOptions.querySelectorAll(".option").forEach(option => { option.addEventListener("click", (event) => { event.stopPropagation(); const type = option.textContent.trim(); if (type) { sendSituationRequest(type); } closeActionMenu(); }); }); }
        if (menuExportTxtButton) menuExportTxtButton.addEventListener("click", exportConversationAsTxt);
        if (menuSummarizeButton) menuSummarizeButton.addEventListener("click", summarizeConversation);
        if (sidebarToggle) sidebarToggle.addEventListener("click", openSettingsModal);
        if (closeModalButton) closeModalButton.addEventListener("click", closeSettingsModal);
        if (settingsModalOverlay) settingsModalOverlay.addEventListener("click", function(event) { if (event.target === settingsModalOverlay) { closeSettingsModal(); } });
        if (saveSettingsButtonModal) saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));
        document.querySelectorAll('.slot-button').forEach(button => { button.addEventListener('click', function() { const slotNum = parseInt(this.textContent); if (!isNaN(slotNum) && slotNum !== currentSlot) { currentSlot = slotNum; console.log(`Switched to slot ${currentSlot}`); loadSettings(currentSlot); loadConversationHistory(); appendInitialNotice(); } }); });
        if (generateRandomCharacterButton) generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
        if (generateRandomUserButton) generateRandomUserButton.addEventListener('click', generateRandomUser);
        if (botImagePreview) botImagePreview.closest('.image-preview-area')?.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
        if (userImagePreview) userImagePreview.closest('.image-preview-area')?.addEventListener('click', () => promptForImageUrl(userImagePreview, false));
        if (feedbackButton) feedbackButton.addEventListener("click", toggleFeedbackOptions);
        if (feedbackOptionsContainer) { feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => { button.addEventListener('click', function(event) { event.stopPropagation(); const feedback = this.dataset.feedback; if (currentFeedback === feedback) { handleFeedbackSelection(null); } else { handleFeedbackSelection(feedback); } }); }); }
        document.addEventListener('click', function(event) { if (actionMenu && actionMenuButton && !actionMenu.contains(event.target) && event.target !== actionMenuButton) { closeActionMenu(); } if (feedbackOptionsContainer && feedbackButton && !feedbackOptionsContainer.contains(event.target) && event.target !== feedbackButton && !currentFeedback) { closeFeedbackOptions(); } });

        console.log("Event listeners attached.");
        console.log("Running initial setup...");
        initializeChat();
        console.log("Initialization complete.");
    } catch (e) { console.error("Error during DOMContentLoaded setup:", e); alert("페이지 초기화 중 오류가 발생했습니다. 콘솔을 확인해주세요."); }
}); // DOMContentLoaded 끝

console.log("Script loaded and parsed.");
