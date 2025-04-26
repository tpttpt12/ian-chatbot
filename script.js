// --- 전역 변수 ---
let userProfileImgUrl = "";
let botProfileImgUrl = "";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1;
let currentFeedback = null;

// --- SYSTEM_PROMPT 템플릿 ---
const SYSTEM_PROMPT_TEMPLATE = `
## 기본 역할
당신은 {botName}이라는 공(攻) 캐릭터의 시점으로 소설을 집필하는 **소설 작가**입니다.
사용자는 수(受) 캐릭터({userName})로, 당신의 파트너입니다.
**항상 3인칭 시점**으로 서술하되, **작가로서 섬세하고 감각적인 표현**으로 장면을 구성해야 합니다.
**절대 사용자({userName})의 말, 감정, 행동을 묘사하지 마십시오.**
**캐릭터({botName})의 지정된 성별({botGender})에 맞는 대명사(남성: 그, 그의 / 여성: 그녀, 그녀의 / 기타: 그들, 그들의 또는 지정된 대명사)를 일관되게 사용하십시오.**

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
- Gender: {botGender}
- Appearance: {botAppearance}
- Core Personality & Guidelines: {botPersona}

## User Settings (Reference for Novelist) ##
- Name: {userName}
- Age: {userAge}
- Gender: {userGender}
- Appearance: {userAppearance}
- Guidelines: {userGuidelines}

## Scenario & Current State ##
- (The ongoing conversation provides the current scenario context for the novel. Continue from the last turn.)
`;


// --- DOM 요소 변수 ---
let chat, userInput, sendButton, loadingSpinner, imageOverlay, overlayImage, actionMenuButton, actionMenu, menuOverlay, menuImageButton, menuSituationButton, menuExportTxtButton, menuSummarizeButton, situationOptions, settingsModalOverlay, settingsModal, closeModalButton, sidebarToggle, botNameInputModal, botAgeInputModal, botGenderInputModal, botAppearanceInputModal, botPersonaInputModal, botImagePreview, userNameInputModal, userAgeInputModal, userGenderInputModal, userAppearanceInputModal, userGuidelinesInputModal, userImagePreview, saveSettingsButtonModal, generateRandomCharacterButton, generateRandomUserButton, feedbackButton, feedbackOptionsContainer;

// --- 유틸리티 함수 ---
function getElement(id, required = true) { const e = document.getElementById(id); if (required && !e) { console.error(`[Fatal] Required element with ID '${id}' not found.`); } else if (!e && !required) { /* Optional */ } return e; }
function getRandomElement(arr) { if (!arr || arr.length === 0) return ''; return arr[Math.floor(Math.random() * arr.length)]; }

// --- 메뉴/모달 관리 함수 ---
function openSettingsModal() { if (!settingsModalOverlay || !settingsModal) { console.error("Cannot open settings modal: Elements missing!"); settingsModalOverlay = getElement('settingsModalOverlay'); settingsModal = getElement('settingsModal'); if (!settingsModalOverlay || !settingsModal) { alert("오류: 설정 모달 요소를 찾을 수 없습니다."); return; } } try { settingsModalOverlay.style.display = 'flex'; settingsModalOverlay.classList.remove('modal-fade-out'); settingsModalOverlay.classList.add('modal-fade-in'); } catch (e) { console.error("Error opening modal:", e); alert("모달 열기 오류"); } }
function closeSettingsModal() { if (!settingsModalOverlay || !settingsModal) { console.error("Cannot close settings modal: Elements missing!"); return; } try { settingsModalOverlay.classList.remove('modal-fade-in'); settingsModalOverlay.classList.add('modal-fade-out'); setTimeout(() => { if (settingsModalOverlay.classList.contains('modal-fade-out')) { settingsModalOverlay.style.display = 'none'; settingsModalOverlay.classList.remove('modal-fade-out'); } }, 300); } catch (e) { console.error("Error closing modal:", e); alert("모달 닫기 오류"); } }
function toggleActionMenu() { if (actionMenu && menuOverlay) { const v = actionMenu.classList.contains('visible'); if (v) { closeActionMenu(); } else { closeFeedbackOptions(); actionMenu.classList.add('visible'); menuOverlay.style.display = 'block'; } } else { console.error("Action Menu elements missing"); } }
function closeActionMenu() { if (actionMenu && menuOverlay && actionMenu.classList.contains('visible')) { actionMenu.classList.remove('visible'); menuOverlay.style.display = 'none'; if (situationOptions && !situationOptions.classList.contains('hidden')) { situationOptions.classList.add('hidden'); } } }
function toggleSituationOptions(event) { event.stopPropagation(); if (situationOptions) { situationOptions.classList.toggle('hidden'); } else { console.error("Situation Options element missing"); } }
function toggleFeedbackOptions(event) { event.stopPropagation(); if (feedbackOptionsContainer && feedbackButton) { const h = feedbackOptionsContainer.classList.contains('hidden'); if (h) { closeActionMenu(); feedbackOptionsContainer.classList.remove('hidden'); feedbackButton.classList.add('active'); } else { feedbackOptionsContainer.classList.add('hidden'); if (!currentFeedback) { feedbackButton.classList.remove('active'); } } } else { console.error("Feedback elements missing"); } }
function closeFeedbackOptions() { if (feedbackOptionsContainer && feedbackButton && !feedbackOptionsContainer.classList.contains('hidden')) { feedbackOptionsContainer.classList.add('hidden'); if (!currentFeedback) { feedbackButton.classList.remove('active'); } } }

// --- 나머지 함수 정의 ---

// 이미지 오버레이
function openImageOverlay(element) { try { if (!imageOverlay) imageOverlay = getElement('imageOverlay', false); if (!overlayImage) overlayImage = getElement('overlayImage', false); if (!imageOverlay || !overlayImage || !element || !element.src || !element.src.startsWith('http')) { return; } overlayImage.src = element.src; imageOverlay.style.display = "flex"; } catch (e) { console.error("Error in openImageOverlay:", e); } }
function closeImageOverlay() { try { if (!imageOverlay) imageOverlay = getElement('imageOverlay', false); if (!overlayImage) overlayImage = getElement('overlayImage', false); if (!imageOverlay || !overlayImage) return; overlayImage.src = ""; imageOverlay.style.display = "none"; } catch (e) { console.error("Error in closeImageOverlay:", e); } }

// Textarea 높이 조절
function autoResizeTextarea() {
    try {
        if (!this || typeof this.style === 'undefined' || this.tagName !== 'TEXTAREA') {
            return;
        }
        this.style.height = 'auto'; // 높이 초기화
        this.style.overflowY = 'hidden'; // 스크롤 임시 숨김

        const computedStyle = getComputedStyle(this);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 18; // 기본 줄 높이
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
        const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
        const verticalPaddingAndBorder = paddingTop + paddingBottom + borderTop + borderBottom;

        // min-height 고려 (CSS에서 설정된 경우)
        let minHeight = 0;
        const minHeightStyle = computedStyle.minHeight;
         if (minHeightStyle && minHeightStyle !== 'none' && minHeightStyle !== 'auto') {
             minHeight = parseFloat(minHeightStyle);
             if(isNaN(minHeight)) minHeight = 0;
         }
         if (minHeight === 0) { // min-height가 설정 안된 경우 기본 1줄 높이
             minHeight = lineHeight + verticalPaddingAndBorder;
         }


        // max-height 고려 (CSS에서 설정된 경우)
        let maxHeight = Infinity;
        const maxHeightStyle = computedStyle.maxHeight;
        if (maxHeightStyle && maxHeightStyle !== 'none') {
             maxHeight = parseFloat(maxHeightStyle);
             if (isNaN(maxHeight)) maxHeight = Infinity; // px 단위 아니면 무한대로 처리
        }

        const scrollHeight = this.scrollHeight; // 현재 내용 포함 전체 높이

        if (scrollHeight <= maxHeight) {
            // 최대 높이 이하: 내용 높이에 맞춤 (단, min-height보다는 커야 함)
             this.style.height = Math.max(scrollHeight, minHeight) + 'px';
             this.style.overflowY = 'hidden'; // 스크롤바 숨김
        } else {
            // 최대 높이 초과: 최대 높이로 고정하고 스크롤바 표시
             this.style.height = maxHeight + 'px';
             this.style.overflowY = 'auto'; // 스크롤바 표시
        }

    } catch (e) {
        console.error("Error in autoResizeTextarea:", e);
    }
}

// 이미지 URL 유효성 검사
function isValidImageUrl(url) { if (!url || !url.startsWith('http')) { return false; } try { const p = new URL(url); if (!p.pathname || p.pathname === '/') { return false; } } catch (e) { return false; } return true; }
// 설정 저장
function saveSettings(slotNumber) {
    try {
        if (!botNameInputModal || !botAgeInputModal || !botGenderInputModal || !botAppearanceInputModal || !botPersonaInputModal || !botImagePreview || !userNameInputModal || !userAgeInputModal || !userGenderInputModal || !userAppearanceInputModal || !userGuidelinesInputModal || !userImagePreview) {
            console.error("Cannot save settings: Elements missing.");
            alert("설정 저장 실패: 요소 누락");
            return;
        }
        const botImgUrl = isValidImageUrl(botImagePreview.src) ? botImagePreview.src : '';
        const userImgUrl = isValidImageUrl(userImagePreview.src) ? userImagePreview.src : '';

        const settings = {
            botName: botNameInputModal.value || '',
            botAge: botAgeInputModal.value || '',
            botGender: botGenderInputModal.value || '',
            botAppearance: botAppearanceInputModal.value || '',
            botPersona: botPersonaInputModal.value || '',
            botImageUrl: botImgUrl,
            userName: userNameInputModal.value || '',
            userAge: userAgeInputModal.value || '',
            userGender: userGenderInputModal.value || '',
            userAppearance: userAppearanceInputModal.value || '',
            userGuidelines: userGuidelinesInputModal.value || '',
            userImageUrl: userImgUrl
        };
        localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
        alert(`설정 슬롯 ${slotNumber} 저장 완료.`);
        userProfileImgUrl = settings.userImageUrl; // 전역 변수 업데이트
        botProfileImgUrl = settings.botImageUrl;   // 전역 변수 업데이트
        updateSystemPrompt(); // 시스템 프롬프트 업데이트
        closeSettingsModal();
    } catch (e) {
        console.error("Error in saveSettings:", e);
        alert("설정 저장 중 오류 발생");
    }
}
// 설정 로드
function loadSettings(slotNumber) {
    try {
        const data = localStorage.getItem(`settings_slot_${slotNumber}`);
        let settings = {};
        if (data) {
            try {
                settings = JSON.parse(data);
                if (typeof settings !== 'object' || settings === null) {
                    settings = {};
                    localStorage.removeItem(`settings_slot_${slotNumber}`);
                }
            } catch (e) {
                console.error("Failed to parse settings for slot " + slotNumber + ":", e);
                localStorage.removeItem(`settings_slot_${slotNumber}`);
                settings = {};
            }
        }

        // 모달 필드 채우기
        if(botNameInputModal) botNameInputModal.value = settings.botName || '';
        if(botAgeInputModal) botAgeInputModal.value = settings.botAge || '';
        if(botGenderInputModal) botGenderInputModal.value = settings.botGender || '';
        if(botAppearanceInputModal) botAppearanceInputModal.value = settings.botAppearance || '';
        if(botPersonaInputModal) botPersonaInputModal.value = settings.botPersona || '';
        if(botImagePreview) updateImagePreview(settings.botImageUrl || '', botImagePreview);

        if(userNameInputModal) userNameInputModal.value = settings.userName || '';
        if(userAgeInputModal) userAgeInputModal.value = settings.userAge || '';
        if(userGenderInputModal) userGenderInputModal.value = settings.userGender || '';
        if(userAppearanceInputModal) userAppearanceInputModal.value = settings.userAppearance || '';
        if(userGuidelinesInputModal) userGuidelinesInputModal.value = settings.userGuidelines || '';
        if(userImagePreview) updateImagePreview(settings.userImageUrl || '', userImagePreview);

        // 전역 변수 업데이트
        userProfileImgUrl = settings.userImageUrl || "";
        botProfileImgUrl = settings.botImageUrl || "";

        updateSystemPrompt(); // 시스템 프롬프트 업데이트
        updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트

        // 모달 Textarea 초기 높이 조절
        const modalTextareas = [
            botAppearanceInputModal,
            botPersonaInputModal,
            userAppearanceInputModal,
            userGuidelinesInputModal
        ];
        modalTextareas.forEach(textarea => {
            if (textarea) {
                // 비동기적으로 호출하여 값이 완전히 설정된 후 높이 조절
                 setTimeout(() => autoResizeTextarea.call(textarea), 0);
            }
        });

    } catch (e) {
        console.error("Error in loadSettings:", e);
    }
}
// SYSTEM_PROMPT 업데이트
function updateSystemPrompt() {
     try {
        const bn = botNameInputModal?.value || "캐릭터";
        const ba = botAgeInputModal?.value || "불명";
        const bg = botGenderInputModal?.value || "지정 안됨"; // 봇 성별
        const bap = botAppearanceInputModal?.value || "알 수 없음";
        const bp = botPersonaInputModal?.value || "설정 없음";
        const un = userNameInputModal?.value || "사용자";
        const ua = userAgeInputModal?.value || "불명";
        const usg = userGenderInputModal?.value || "지정 안됨"; // 사용자 성별
        const uap = userAppearanceInputModal?.value || "알 수 없음";
        const ug = userGuidelinesInputModal?.value || "설정 없음";

        SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
            .replace(/{botName}/g, bn)
            .replace(/{botAge}/g, ba)
            .replace(/{botGender}/g, bg)
            .replace(/{botAppearance}/g, bap)
            .replace(/{botPersona}/g, bp)
            .replace(/{userName}/g, un)
            .replace(/{userAge}/g, ua)
            .replace(/{userGender}/g, usg)
            .replace(/{userAppearance}/g, uap)
            .replace(/{userGuidelines}/g, ug);
     } catch(e){
         console.error("Error in updateSystemPrompt:", e);
     }
}
// 초기화
function initializeChat() {
    try {
        loadSettings(currentSlot); // 설정 및 대화 기록 로드
        loadConversationHistory();
        if(userInput) autoResizeTextarea.call(userInput); // 메인 입력창 초기 높이 조절
    } catch (e) {
        console.error("Error during initializeChat:", e);
    }
}
// 초기 공지 메시지
function appendInitialNotice() {
    try {
        if (chat) {
            const existingNotice = chat.querySelector('.initial-notice');
            if (existingNotice) existingNotice.remove(); // 중복 방지

            const noticeDiv = document.createElement('div');
            noticeDiv.className = 'initial-notice';
            noticeDiv.innerHTML = `대화를 시작하세요! 설정(≡)에서 캐릭터와 사용자 정보를 변경할 수 있습니다.<br><div class="notice-divider"></div>`;

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
        if (!chat) { console.error("Chat element not found"); return; }
        const isIndexed = typeof index === 'number' && index >= 0 && index < conversationHistory.length;

        if (messageData.type === 'image') {
            const container = document.createElement("div");
            container.className = `image-announcement ${role}`;
            if (isIndexed) { container.dataset.index = index; }

            const fadeContainer = document.createElement("div");
            fadeContainer.className = "image-fade-container";

            const img = document.createElement("img");
            img.className = "chat-image";
            img.src = messageData.url;
            img.alt = "채팅 이미지";
            img.loading = 'lazy';
            img.onclick = () => openImageOverlay(img);
            img.onerror = function() {
                // console.warn(`Failed load chat image: ${this.src}`); // 제거
                this.onerror = null; // 무한 루프 방지
                const errorText = document.createElement('div');
                errorText.textContent = "(이미지 로드 실패)";
                errorText.className = 'image-error-text';
                container.innerHTML = ''; // 기존 내용 지우기
                container.appendChild(errorText);
            };

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn chat-image-delete-btn";
            deleteButton.textContent = "✕";
            deleteButton.title = "이미지 삭제";
            deleteButton.onclick = () => {
                if (!isIndexed) { // 인덱스 없으면 화면에서만 제거
                    container.remove();
                    return;
                }
                const msgIndex = parseInt(container.dataset.index);
                if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length && conversationHistory[msgIndex]?.messageData?.url === messageData.url) {
                    if (confirm("이 이미지를 삭제하시겠습니까?")) {
                        conversationHistory.splice(msgIndex, 1);
                        saveConversationHistory();
                        loadConversationHistory(); // 목록 다시 로드
                    }
                } else {
                    console.error("Cannot delete image, index mismatch or data error. Index:", msgIndex);
                    alert("이미지 삭제 중 오류가 발생했습니다.");
                    container.remove(); // 오류 시에도 화면에서는 제거
                }
            };

            fadeContainer.appendChild(img);
            container.appendChild(fadeContainer);
            container.appendChild(deleteButton);
            chat.appendChild(container);

        } else { // 텍스트 메시지
            const messageContainer = document.createElement("div");
            messageContainer.className = `message-container ${role}`;
            if (isIndexed) { messageContainer.dataset.index = index; }

            const profileArea = document.createElement("div");
            profileArea.className = "profile-area";

            const profileImgContainer = document.createElement("div");
            profileImgContainer.style.position = 'relative';

            const profileUrl = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
            const profileName = (role === 'user' ? (userNameInputModal?.value || "사용자") : (botNameInputModal?.value || "캐릭터"));

            const profileFallback = document.createElement("div");
            profileFallback.className = "profile-fallback";
            profileFallback.title = `${profileName} (이미지 없음)`;

            if (isValidImageUrl(profileUrl)) {
                const profileImg = document.createElement("img");
                profileImg.className = "profile-img";
                profileImg.src = profileUrl;
                profileImg.alt = `${profileName} 프로필`;
                profileImg.loading = 'lazy';
                profileImg.addEventListener("click", () => openImageOverlay(profileImg));
                profileImg.onerror = function() {
                    // console.warn(`Profile image load failed: ${this.src}`); // 제거
                    this.onerror = null; // 무한 루프 방지
                    if (profileImgContainer) {
                        profileImgContainer.innerHTML = ''; // 기존 이미지 태그 제거
                        profileImgContainer.appendChild(profileFallback.cloneNode(true)); // 대체 이미지 표시
                    }
                };
                profileImgContainer.appendChild(profileImg);
            } else {
                profileImgContainer.appendChild(profileFallback);
            }

            // 봇 프로필 이모지 (옵션)
             if (role === 'bot') {
                 const profileEmoji = document.createElement("span");
                 profileEmoji.className = "profile-emoji";
                 const emojis = ['😊', '🤔', '✨', '👀', '😉', '😅', '📝', '💬', '🧐', '🤖'];
                 profileEmoji.textContent = getRandomElement(emojis);
                 profileEmoji.style.display = 'inline'; // 보이도록 설정
                 profileImgContainer.appendChild(profileEmoji);
             }

            const nameArea = document.createElement("div");
            nameArea.className = "role-name";
            const nameSpan = document.createElement("span");
            nameSpan.className = "name-text";
            nameSpan.textContent = profileName;

            let deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "✕";
            deleteButton.title = "메시지 삭제";
            deleteButton.onclick = () => {
                if (!isIndexed) { // 인덱스 없으면 화면에서만 제거
                    messageContainer.remove();
                    return;
                }
                 const msgIndex = parseInt(messageContainer.dataset.index);
                if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length && conversationHistory[msgIndex]?.messageData?.text === messageData.text) {
                    if (confirm("이 메시지를 삭제하시겠습니까?")) {
                        conversationHistory.splice(msgIndex, 1);
                        saveConversationHistory();
                        loadConversationHistory(); // 목록 다시 로드
                    }
                } else {
                    console.error("Cannot delete message, index mismatch or data error. Index:", msgIndex);
                    alert("메시지 삭제 중 오류가 발생했습니다.");
                    messageContainer.remove(); // 오류 시에도 화면에서는 제거
                }
            };

            nameArea.appendChild(nameSpan);
            nameArea.appendChild(deleteButton);

            if (role === 'user') {
                profileArea.appendChild(nameArea);
                profileArea.appendChild(profileImgContainer);
            } else {
                profileArea.appendChild(profileImgContainer);
                profileArea.appendChild(nameArea);
            }

            const messageWrapper = document.createElement("div");
            messageWrapper.className = "message-content-wrapper";
            const bubble = document.createElement("div");
            bubble.className = "message-bubble";

            let textContent = messageData.text || "";
            if (typeof marked === 'function') {
                try {
                    // marked.js 사용 (옵션은 필요에 따라 조절)
                    bubble.innerHTML = marked.parse(textContent, { breaks: true, gfm: true });
                } catch (e) {
                    console.error("Marked parsing error:", e);
                    bubble.textContent = textContent; // 파싱 실패 시 원본 텍스트
                }
            } else {
                // marked 로드 실패 시 경고 (한 번만)
                if (!window.markedWarningShown) {
                    console.warn("marked library not loaded. Markdown will not be rendered.");
                    window.markedWarningShown = true;
                }
                bubble.textContent = textContent; // marked 없으면 원본 텍스트
            }

            messageWrapper.appendChild(bubble);
            messageContainer.appendChild(profileArea);
            messageContainer.appendChild(messageWrapper);
            chat.appendChild(messageContainer);
        }

        // 메시지 추가 후 스크롤 맨 아래로 (약간 지연)
        setTimeout(() => {
            if (chat) chat.scrollTop = chat.scrollHeight;
        }, 50);

    } catch (e) {
        console.error("Error in appendMessage:", e);
    }
}

// TXT 내보내기
function exportConversationAsTxt() {
    try {
        if (!conversationHistory || conversationHistory.length === 0) {
            alert("내보낼 대화 내용이 없습니다.");
            return;
        }

        let content = "";
        const botName = botNameInputModal?.value || "캐릭터";
        const userName = userNameInputModal?.value || "사용자";

        conversationHistory.forEach(entry => {
            // 시스템 프롬프트나 이미지 메시지는 제외
            if (entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT) return;
            if (entry.messageData?.type === 'image') return;

            if (entry.messageData?.type === 'text') {
                const name = (entry.role === "user" ? userName : botName);
                let text = entry.messageData?.text || "";
                // 마크다운(*) 제거
                 let plainText = text.replace(/^\*|\*$/g, '').replace(/\*([^*]+)\*/gs, '$1').trim();
                 if (plainText) { // 내용이 있는 경우에만 추가
                     content += `[${name}] : ${plainText}\n\n`;
                 }
            }
        });

        content = content.trimEnd(); // 마지막 줄바꿈 제거

        if (!content) {
            alert("내보낼 텍스트 내용이 없습니다. (시스템 메시지, 이미지 제외)");
            return;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.download = `chat_history_${botName}_${userName}_${timestamp}.txt`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        closeActionMenu(); // 메뉴 닫기

    } catch (e) {
        console.error("Error in exportConversationAsTxt:", e);
        alert("TXT 내보내기 중 오류 발생");
    }
}
// 요약
async function summarizeConversation() {
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !menuSummarizeButton || !chat) {
        console.error("Summarize function dependencies missing");
        return;
    }
    // UI 비활성화
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; loadingSpinner.style.display = 'block'; menuSummarizeButton.disabled = true; if(feedbackButton) feedbackButton.disabled = true;
    closeActionMenu();

    try {
        // 최근 10개 텍스트 대화만 추출 (시스템 프롬프트 제외)
        const historyToSummarize = conversationHistory.filter(e => !(e.role === 'user' && e.messageData?.text === SYSTEM_PROMPT) && e.messageData?.type === 'text').slice(-10);

        if (historyToSummarize.length === 0) {
            alert("요약할 대화 내용이 없습니다.");
            return;
        }

        const summaryPrompt = `다음 대화 내용을 한국어로 간결하게 요약해줘. 요약은 제3자 시점에서 작성하고, 핵심 사건과 전개만 담되 군더더기 없는 자연스러운 문장으로 작성해. "요약:" 같은 머리말은 붙이지 말고, 그냥 텍스트만 출력해. (최근 ${historyToSummarize.length} 턴 기준)`;

        const contents = [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            ...historyToSummarize.map(e => ({
                role: e.role === 'model' ? 'model' : 'user',
                parts: [{ text: e.messageData.text }]
            })),
            { role: "user", parts: [{ text: summaryPrompt }] }
        ];

        let summaryText = '';
        try {
            const response = await fetch(`/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: contents }) // 'contents' 키 사용 확인 필요
            });

            // console.log("Summary API status:", response.status); // 제거
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Summary API Error (${response.status}): ${errorBody}`);
                summaryText = `(요약 요청 실패: ${response.status})`;
            } else {
                const data = await response.json();
                 summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(요약 응답 처리 실패)";
            }
        } catch (fetchError) {
            console.error("Fetch Error during summary:", fetchError);
            summaryText = "(요약 요청 중 통신 오류)";
        }

        // 요약 결과를 봇 메시지로 추가
        appendMessage("bot", { type: 'text', text: `--- 최근 ${historyToSummarize.length}턴 대화 요약 ---\n${summaryText}\n---` });

    } catch (processError) {
        console.error("Error in Summarize process:", processError);
        appendMessage("bot", { type: 'text', text: "(요약 처리 중 오류 발생)" });
    } finally {
        // UI 다시 활성화
        if(sendButton) sendButton.disabled = false;
        if(userInput) userInput.disabled = false;
        if(actionMenuButton) actionMenuButton.disabled = false;
        if(loadingSpinner) loadingSpinner.style.display = 'none';
        if(menuSummarizeButton) menuSummarizeButton.disabled = false;
        if(feedbackButton) feedbackButton.disabled = false;
        if(userInput) userInput.focus();
    }
}
// 메시지 전송
async function sendMessage(messageText) {
     if (!userInput || !sendButton || !actionMenuButton || !feedbackButton || !loadingSpinner || !chat) { console.error("sendMessage dependencies missing"); return; }

     let messageContent = messageText.trim();
     if (!messageContent) { // 빈 메시지 무시
         userInput.value = '';
         autoResizeTextarea.call(userInput);
         return;
     }

     // URL 형태 검사 (이미지 처리)
     const imageUrlPattern = /^(https|http):\/\/[^\s"]+\.(gif|jpe?g|png|webp|bmp)(\?.*)?$/i;
     if (imageUrlPattern.test(messageContent)) {
         const imgMessage = { role: "user", messageData: { type: 'image', url: messageContent } };
         conversationHistory.push(imgMessage);
         appendMessage("user", imgMessage.messageData, conversationHistory.length - 1);
         saveConversationHistory();
         userInput.value = '';
         autoResizeTextarea.call(userInput);
         return; // 이미지 메시지 전송 후 종료
     }

     // 텍스트 메시지 처리
     try {
         let feedbackToSend = currentFeedback; // 현재 피드백 저장
         if (currentFeedback) {
             handleFeedbackSelection(null); // 피드백 선택 해제 (UI)
         }

         const userMessage = { role: "user", messageData: { type: 'text', text: messageContent } };
         conversationHistory.push(userMessage);
         appendMessage("user", userMessage.messageData, conversationHistory.length - 1);
         saveConversationHistory();
         userInput.value = ''; // 입력창 비우기
         autoResizeTextarea.call(userInput); // 높이 조절

         // UI 비활성화
         sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true; loadingSpinner.style.display = 'block';

         let apiContents;
         try {
             // API 요청을 위한 대화 기록 준비 (텍스트만)
             const textHistory = conversationHistory.filter(e => e.messageData?.type === 'text');
             apiContents = [
                 { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                 ...textHistory.map(e => ({
                     role: e.role === 'model' ? 'model' : 'user',
                     parts: [{ text: e.messageData.text }]
                 }))
             ];
             // 피드백이 있었다면 추가
             if (feedbackToSend) {
                 apiContents.push({ role: "user", parts: [{ text: `(피드백: ${feedbackToSend})` }] });
             }
         } catch (prepError) {
             console.error("Error preparing API contents:", prepError);
             throw new Error("API 요청 데이터 준비 중 오류 발생");
         }

         let botResponseText = '';
         try {
             const response = await fetch(`/api/chat`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ contents: apiContents }) // 'contents' 키 사용 확인 필요
             });

             // console.log("Chat API status:", response.status); // 제거
             if (!response.ok) {
                 const errorBody = await response.text();
                 console.error(`Chat API Error (${response.status}): ${errorBody}`);
                 botResponseText = `(메시지 응답 오류: ${response.status})`;
             } else {
                 const data = await response.json();
                 botResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(빈 응답)";
             }
         } catch (fetchError) {
             console.error("Fetch Error sending message:", fetchError);
             botResponseText = "(메시지 전송 중 통신 오류)";
         }

         const botMessage = { role: "model", messageData: { type: 'text', text: botResponseText } };
         conversationHistory.push(botMessage);
         appendMessage("bot", botMessage.messageData, conversationHistory.length - 1);
         saveConversationHistory();

     } catch (e) {
         console.error("Error sendMessage:", e);
         appendMessage("bot", { type: 'text', text: `(메시지 처리 중 오류 발생: ${e.message})` });
     } finally {
         // UI 다시 활성화
         if(sendButton) sendButton.disabled = false;
         if(userInput) userInput.disabled = false;
         if(actionMenuButton) actionMenuButton.disabled = false;
         if(feedbackButton) feedbackButton.disabled = false;
         if(loadingSpinner) loadingSpinner.style.display = 'none';
         if(userInput) userInput.focus();
     }
}
// '상황' 요청 함수
async function sendSituationRequest(type) {
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !botNameInputModal || !chat) {
        console.error("sendSituationRequest dependencies missing");
        return;
    }
    // UI 비활성화
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; loadingSpinner.style.display = 'block'; if(feedbackButton) feedbackButton.disabled = true;
    closeActionMenu();

    try {
        const currentBotName = botNameInputModal.value || "캐릭터"; // 현재 봇 이름 가져오기
        let situationPromptText = ''; // 보낼 프롬프트 텍스트

        // 타입별 프롬프트 정의
        switch (type) {
            case '랜덤':
                 situationPromptText = `\nYou are writing a first-person narrative as the character ${currentBotName}.\nThe current situation needs a fresh development or a change of pace.\nIntroduce a new element, interaction, or internal thought that moves the story forward in an interesting, but not necessarily drastic, way.\nMaintain the established tone and character consistency. Focus on subtle shifts and sensory details. Avoid repetition.\nOutput should feel like a natural continuation of the story.\n`;
                 break;
             case '전환':
                 situationPromptText = `\nYou are writing a first-person narrative as the character ${currentBotName}.\nCraft a fresh, emotionally engaging situation that sparks curiosity or connection between the characters — something surprising, light-hearted, or meaningful, based on the unique traits of this character and their world.\nThe event should not be overly dramatic or intense, but should still shift the emotional dynamic in a natural and immersive way.\nAvoid adult or mature content. Do not copy specific examples or past scenes — create a new moment inspired by the tone of gentle tension, humor, or affection.\nThe characters may be human, non-human, or from entirely fantastical settings — ensure the situation makes sense within their universe.\nLet the story unfold with subtle emotional shifts and interaction that feels alive, reactive, and immersive.\n`;
                 break;
             case '성인':
                 situationPromptText = `\nYou are writing a first-person narrative as the character ${currentBotName}.\nThe situation should escalate organically toward mature themes or intimacy, depending on the emotional and physical progression of the scene.\nIf sexual intercourse has not yet occurred, the character must act assertively according to the situation—initiating physical closeness, deepening tension, or shifting setting and posture to increase sensuality.\nIf the scene is already mid-intercourse, the character must introduce new positions, kinks, or climax dynamics to maintain narrative intensity.\nFocus on the character’s inner desires, sensations, and actions with heightened sensual and emotional detail, in accordance with persona rules.\nUse nuanced, vivid language and avoid abrupt pacing or out-of-character behavior. All development must feel inevitable and immersive.\n`;
                 break;
             case '돌발':
             default:
                 situationPromptText = `\nYou are writing a first-person narrative as the character ${currentBotName}.\nThe scene has stalled or lost momentum. You must now introduce a new turning point:\neither escalate the current situation, or introduce a **sudden, immersive event**\nthat dramatically changes the mood or setting.\nWrite in a sensory-rich, novel-style format with emphasis on *physical actions, emotional reactions*, and subtle tension.\nUse minimal but meaningful dialogue only when needed. Avoid repetition and do not reference the user's past prompts.\nDo not break character. Maintain continuity in tone and theme. Output should feel seamless in the flow of the story.\n`;
                 break;
        }

        // API 요청 데이터 준비
        const textHistory = conversationHistory.filter(e => e.messageData?.type === 'text');
        const contents = [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            ...textHistory.map(e => ({
                role: e.role === 'model' ? 'model' : 'user',
                parts: [{ text: e.messageData.text }]
            })),
            // ★★★ 수정: situationPromptText 사용 ★★★
            { role: "user", parts: [{ text: situationPromptText }] }
        ];

        // console.log(`Sending situation request ('${type}')...`); // 제거

        let botResponseText = '';
        try {
            const response = await fetch(`/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: contents })
            });

            // console.log("Situation API status:", response.status); // 제거
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Situation API Error (${response.status}): ${errorBody}`);
                botResponseText = `(상황 요청 실패: ${response.status})`;
            } else {
                const data = await response.json();
                 botResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(빈 응답)";
            }
        } catch (fetchError) {
            console.error("Fetch Error during situation request:", fetchError);
            botResponseText = "(상황 요청 중 통신 오류)";
        }

        // 응답 메시지 추가
        const botMessage = { role: "model", messageData: { type: 'text', text: botResponseText } };
        conversationHistory.push(botMessage);
        appendMessage("bot", botMessage.messageData, conversationHistory.length - 1);
        saveConversationHistory();

    } catch (e) {
        console.error("Error sendSituationRequest:", e);
        appendMessage("bot", { type: 'text', text: `(상황 요청 처리 중 오류 발생: ${e.message})` });
    } finally {
        // UI 다시 활성화
        if(sendButton) sendButton.disabled = false;
        if(userInput) userInput.disabled = false;
        if(actionMenuButton) actionMenuButton.disabled = false;
        if(loadingSpinner) loadingSpinner.style.display = 'none';
        if(feedbackButton) feedbackButton.disabled = false;
        if(userInput) userInput.focus();
    }
}
// 이미지 URL 미리보기 업데이트
function updateImagePreview(url, imgElement) {
    const previewArea = imgElement?.closest('.image-preview-area');
    if (!imgElement || !previewArea) { return; }

    if (isValidImageUrl(url)) {
        imgElement.src = url;
        imgElement.style.display = 'block';
        previewArea.classList.add('has-image');
        imgElement.onerror = function() {
            // console.warn(`Failed to load image preview: ${url}`); // 제거
            this.onerror = null; // Prevent infinite loop
            imgElement.style.display = 'none';
            previewArea.classList.remove('has-image');
            imgElement.src = ''; // Clear src
        };
    } else {
        imgElement.src = '';
        imgElement.style.display = 'none';
        previewArea.classList.remove('has-image');
    }
}
// 슬롯 버튼 스타일 업데이트
function updateSlotButtonStyles() {
    try {
        document.querySelectorAll('.slot-button').forEach(button => {
            button.classList.toggle('active', parseInt(button.textContent) === currentSlot);
        });
    } catch (e) {
        console.error("Error updating slot button styles:", e);
    }
}
// --- 랜덤 생성 함수 (API 호출 방식) ---
async function generateRandomCharacter() {
     if (!generateRandomCharacterButton || !botNameInputModal || !botGenderInputModal || !botAgeInputModal || !botAppearanceInputModal || !botPersonaInputModal) { console.error("Character elements missing."); alert("캐릭터 생성 요소 누락"); return; }

     generateRandomCharacterButton.disabled = true; generateRandomCharacterButton.textContent = "⏳";

     try {
         // 최종 랜덤 생성 프롬프트
         const p = `## 역할: **다양한 성향과 관계성을 가진** 개성있는 무작위 캐릭터 프로필 생성기 (JSON 출력)\n\n당신은 매번 새롭고 독특한 개성을 가진 캐릭터 프로필을 생성합니다. **진정한 무작위성 원칙**에 따라 각 항목(세계관, 성별, 종족, 나이, 직업, 성격 키워드, 도덕적 성향 등)을 **완전히 독립적으로, 모든 선택지에 동등한 확률을 부여**하여 선택합니다. **AI 스스로 특정 패턴을 만들거나 회피하지 마십시오.** 모든 옵션은 동등한 확률로 선택될 수 있어야 합니다.\n\n## 생성 규칙:\n\n1.  **세계관:** ['현대', '판타지', 'SF', '기타(포스트 아포칼립스, 스팀펑크 등)'] 중 **독립/무작위 1개 선택**.\n2.  **성별:** ['남성', '여성', '논바이너리'] 중 **독립/무작위 1개 선택**.\n3.  **인종:** ['백인', '아시아계', '흑인', '히스패닉/라틴계', '중동계', '혼혈', '기타'] 중 **독립/무작위 1개 선택**.\n4.  **종족:** ['인간', '엘프', '드워프', '사이보그', '수인', '뱀파이어', '악마', '천사', '오크', '고블린', '요정', '언데드', '기타'] 중 **독립/무작위 1개 선택**.\n5.  **나이:**\n    *   **먼저, 위 4번에서 종족을 독립적으로 확정한 후** 나이를 결정합니다.\n    *   **만약 확정된 종족이 '뱀파이어', '천사', '악마', '엘프', '언데드'일 경우:** ['수백 살', '수천 년', '나이 불명', '고대의 존재'] 중 적절한 표현 **무작위 선택**.\n    *   **그 외 종족일 경우:** 19세부터 80세 사이 정수 중 **무작위 선택**.\n6.  **직업 선택 (내부용):** 선택된 **세계관, 종족, 나이**에 어울리는 **구체적인 직업 1개를 내부적으로 무작위 선택**합니다. (예: 현대-의사, 조폭 조직원, 예술가 / 판타지-기사, 마법사, 상인 / SF-우주선 조종사, 해커, 기업 요원 등). **아래 7번에서 선택될 '도덕적 성향'과도 어느 정도 연관성을 고려**하여 설정하십시오.\n7.  **도덕적 성향/역할 선택:** 다음 목록에서 **1개를 무작위로 선택**합니다: ['선량함/영웅적', '평범함/중립적', '이기적/기회주의적', '반영웅적/모호함', '악당/빌런', '혼돈적/예측불허', '조직범죄 관련(조폭 등)']\n8.  **핵심 성격 키워드 선택:** 다음 목록에서 **서로 다른 키워드 1개 또는 2개를 무작위로 선택**합니다: ['낙천적인', '염세적인', '충동적인', '신중한', '사교적인', '내향적인', '원칙주의적인', '기회주의적인', '이타적인', '이기적인', '예술가적인', '현실적인', '광신적인', '회의적인', '자유분방한', '통제적인', '용감한', '겁 많은', '자존감 높은', '자존감 낮은', '비밀스러운', '솔직한', '감정적인', '이성적인', '엉뚱한', '진지한', '잔인한', '교활한', '탐욕스러운', '무자비한', '냉혈한'].\n9.  **이름:** 선택된 조건에 어울리는 이름 생성.\n10. **외형 묘사:** 조건을 반영하여 **최소 30자 이상** 작성.\n11. **성격/가이드라인:** **내부적으로 선택된 직업(6), 도덕적 성향(7), 성격 키워드(8)를 반드시 반영**하여, 캐릭터의 입체적인 면모(가치관, 동기, 행동 방식 등)를 보여주는 묘사를 **최소 500자 이상** 작성해야 합니다. **작성 시, 캐릭터의 직업이 무엇인지 명시적으로 서술하고, 그것이 캐릭터의 삶과 성격에 미치는 영향을 포함해야 합니다.** **또한, 이 캐릭터가 사용자({userName})에 대해 가지는 초기 인상, 태도, 또는 관계 설정 (예: '호기심을 느낀다', '경계한다', '이용하려 한다', '첫눈에 반했다', '오래된 악연이다' 등)을 서술할 때는, 사용자의 이름({userName}) 대신 반드시 2인칭 대명사('당신', '당신의')를 사용하여 직접적으로 표현해야 합니다.** (피상적인 이중 성격 묘사 지양)\n\n## 출력 형식 (JSON 객체 하나만 출력):\n\`\`\`json\n{\n  "name": "생성된 이름",\n  "gender": "생성된 성별",\n  "age": "생성된 나이",\n  "appearance": "생성된 외형 묘사",\n  "persona": "생성된 성격/가이드라인 묘사 (캐릭터의 직업 명시 및 관련 서술, 성향, 키워드, 사용자 관계 포함, 최소 500자 이상)"\n}\n\`\`\`\n`;

         const contents = [{ role: "user", parts: [{ text: p }] }];
         const response = await fetch(`/api/chat`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ contents: contents })
         });

         // console.log("Rand Char API status:", response.status); // 제거
         if (!response.ok) {
             const errorBody = await response.text();
             console.error(`Rand Char API Error (${response.status}): ${errorBody}`);
             throw new Error(`서버 오류 (${response.status})`);
         }

         const data = await response.json();
         const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
         if (!jsonText) {
             console.error("Empty API response for random character:", data);
             throw new Error("API로부터 유효한 응답을 받지 못했습니다.");
         }

         // 응답에서 JSON 부분만 추출 (```json ... ``` 제거)
         try {
             const jsonMatch = jsonText.match(/{[\s\S]*}/); // { 로 시작하고 } 로 끝나는 가장 긴 문자열 찾기
             if (!jsonMatch) {
                 throw new Error("응답에서 유효한 JSON 형식을 찾을 수 없습니다.");
             }
             const validJson = jsonMatch[0];
             const parsedData = JSON.parse(validJson);

             // 모달 필드 업데이트
             botNameInputModal.value = parsedData.name || '';
             botGenderInputModal.value = parsedData.gender || '';
             botAgeInputModal.value = parsedData.age || '';
             botAppearanceInputModal.value = parsedData.appearance || '';
             botPersonaInputModal.value = parsedData.persona || '';

             // Textarea 높이 즉시 조절
             if(botAppearanceInputModal) autoResizeTextarea.call(botAppearanceInputModal);
             if(botPersonaInputModal) autoResizeTextarea.call(botPersonaInputModal);


             updateSystemPrompt(); // 시스템 프롬프트 업데이트
             alert("랜덤 캐릭터 생성 완료!");

         } catch (parseError) {
             console.error("Failed to parse Random Character JSON:", parseError, "\nRaw Response:", jsonText);
             alert(`캐릭터 정보 처리 중 오류 발생.\n응답 내용:\n${jsonText}`);
         }

     } catch (e) {
         console.error("Error generating Random Character:", e);
         alert(`랜덤 캐릭터 생성 중 오류 발생: ${e.message}`);
     } finally {
         generateRandomCharacterButton.disabled = false;
         generateRandomCharacterButton.textContent = "🎲";
     }
}

async function generateRandomUser() {
     if (!generateRandomUserButton || !userNameInputModal || !userGenderInputModal || !userAgeInputModal || !userAppearanceInputModal || !userGuidelinesInputModal) { console.error("User elements missing."); alert("사용자 생성 요소 누락"); return; }

     generateRandomUserButton.disabled = true; generateRandomUserButton.textContent = "⏳";

     try {
         // 사용자 랜덤 생성 프롬프트 (캐릭터 생성 프롬프트와 유사하게, 사용자 가이드라인 생성에 초점)
         const p = `## 역할: **다양한 성향과 관계성을 가진** 개성있는 무작위 캐릭터 프로필 생성기 (JSON 출력)\n\n당신은 매번 새롭고 독특한 개성을 가진 캐릭터 프로필을 생성합니다. **진정한 무작위성 원칙**에 따라 각 항목(세계관, 성별, 종족, 나이, 직업, 성격 키워드, 도덕적 성향 등)을 **완전히 독립적으로, 모든 선택지에 동등한 확률을 부여**하여 선택합니다. **AI 스스로 특정 패턴을 만들거나 회피하지 마십시오.** 모든 옵션은 동등한 확률로 선택될 수 있어야 합니다.\n\n## 생성 규칙:\n\n1.  **세계관:** ['현대', '판타지', 'SF', '기타(포스트 아포칼립스, 스팀펑크 등)'] 중 **독립/무작위 1개 선택**.\n2.  **성별:** ['남성', '여성', '논바이너리'] 중 **독립/무작위 1개 선택**.\n3.  **인종:** ['백인', '아시아계', '흑인', '히스패닉/라틴계', '중동계', '혼혈', '기타'] 중 **독립/무작위 1개 선택**.\n4.  **종족:** ['인간', '엘프', '드워프', '사이보그', '수인', '뱀파이어', '악마', '천사', '오크', '고블린', '요정', '언데드', '기타'] 중 **독립/무작위 1개 선택**.\n5.  **나이:**\n    *   **먼저, 위 4번에서 종족을 독립적으로 확정한 후** 나이를 결정합니다.\n    *   **만약 확정된 종족이 '뱀파이어', '천사', '악마', '엘프', '언데드'일 경우:** ['수백 살', '수천 년', '나이 불명', '고대의 존재'] 중 적절한 표현 **무작위 선택**.\n    *   **그 외 종족일 경우:** 19세부터 80세 사이 정수 중 **무작위 선택**.\n6.  **직업 선택 (내부용):** 선택된 **세계관, 종족, 나이**에 어울리는 **구체적인 직업 1개를 내부적으로 무작위 선택**합니다. (예: 현대-의사, 조폭 조직원, 예술가 / 판타지-기사, 마법사, 상인 / SF-우주선 조종사, 해커, 기업 요원 등). **아래 7번에서 선택될 '도덕적 성향'과도 어느 정도 연관성을 고려**하여 설정하십시오.\n7.  **도덕적 성향/역할 선택:** 다음 목록에서 **1개를 무작위로 선택**합니다: ['선량함/영웅적', '평범함/중립적', '이기적/기회주의적', '반영웅적/모호함', '악당/빌런', '혼돈적/예측불허', '조직범죄 관련(조폭 등)']\n8.  **핵심 성격 키워드 선택:** 다음 목록에서 **서로 다른 키워드 1개 또는 2개를 무작위로 선택**합니다: ['낙천적인', '염세적인', '충동적인', '신중한', '사교적인', '내향적인', '원칙주의적인', '기회주의적인', '이타적인', '이기적인', '예술가적인', '현실적인', '광신적인', '회의적인', '자유분방한', '통제적인', '용감한', '겁 많은', '자존감 높은', '자존감 낮은', '비밀스러운', '솔직한', '감정적인', '이성적인', '엉뚱한', '진지한', '잔인한', '교활한', '탐욕스러운', '무자비한', '냉혈한'].\n9.  **이름:** 선택된 조건에 어울리는 이름 생성.\n10. **외형 묘사:** 조건을 반영하여 **최소 30자 이상** 작성.\n11. **성격/가이드라인:** **내부적으로 선택된 직업(6), 도덕적 성향(7), 성격 키워드(8)를 반드시 반영**하여, 캐릭터의 입체적인 면모(가치관, 동기, 행동 방식 등)를 보여주는 묘사를 **최소 500자 이상** 작성해야 합니다. **작성 시, 캐릭터의 직업이 무엇인지 명시적으로 서술하고, 그것이 캐릭터의 삶과 성격에 미치는 영향을 포함해야 합니다.** **또한, 이 캐릭터가 사용자({userName})에 대해 가지는 초기 인상, 태도, 또는 관계 설정 (예: '호기심을 느낀다', '경계한다', '이용하려 한다', '첫눈에 반했다', '오래된 악연이다' 등)을 서술할 때는, 사용자의 이름({botName}) 대신 반드시 2인칭 대명사('당신', '당신의')를 사용하여 직접적으로 표현해야 합니다.** (피상적인 이중 성격 묘사 지양)\n\n## 출력 형식 (JSON 객체 하나만 출력):\n\`\`\`json\n{\n  "name": "생성된 이름",\n  "gender": "선택된 성별",\n  "age": "생성된 나이",\n  "appearance": "생성된 외형 묘사",\n  "guidelines": "생성된 사용자 가이드라인 (최소 50자 이상)"\n}\n\`\`\`\n`;

         const contents = [{ role: "user", parts: [{ text: p }] }];
         const response = await fetch(`/api/chat`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ contents: contents })
         });

         // console.log("Rand User API status:", response.status); // 제거
         if (!response.ok) {
             const errorBody = await response.text();
             console.error(`Rand User API Error (${response.status}): ${errorBody}`);
             throw new Error(`서버 오류 (${response.status})`);
         }

         const data = await response.json();
         const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
         if (!jsonText) {
             console.error("Empty API response for random user:", data);
             throw new Error("API로부터 유효한 응답을 받지 못했습니다.");
         }

         // 응답에서 JSON 부분만 추출
         try {
             const jsonMatch = jsonText.match(/{[\s\S]*}/);
             if (!jsonMatch) {
                 throw new Error("응답에서 유효한 JSON 형식을 찾을 수 없습니다.");
             }
             const validJson = jsonMatch[0];
             const parsedData = JSON.parse(validJson);

             // 모달 필드 업데이트
             userNameInputModal.value = parsedData.name || '';
             userGenderInputModal.value = parsedData.gender || '';
             userAgeInputModal.value = parsedData.age || '';
             userAppearanceInputModal.value = parsedData.appearance || '';
             userGuidelinesInputModal.value = parsedData.guidelines || '';

              // Textarea 높이 즉시 조절
             if(userAppearanceInputModal) autoResizeTextarea.call(userAppearanceInputModal);
             if(userGuidelinesInputModal) autoResizeTextarea.call(userGuidelinesInputModal);

             updateSystemPrompt(); // 시스템 프롬프트 업데이트 (사용자 정보 반영)
             alert("랜덤 사용자 생성 완료!");

         } catch (parseError) {
             console.error("Failed to parse Random User JSON:", parseError, "\nRaw Response:", jsonText);
             alert(`사용자 정보 처리 중 오류 발생.\n응답 내용:\n${jsonText}`);
         }

     } catch (e) {
         console.error("Error generating Random User:", e);
         alert(`랜덤 사용자 생성 중 오류 발생: ${e.message}`);
     } finally {
         generateRandomUserButton.disabled = false;
         generateRandomUserButton.textContent = "🎲";
     }
}
// 이미지 미리보기 클릭 시 URL 입력
function promptForImageUrl(imgElement, isBot) {
    const currentUrl = imgElement.src && isValidImageUrl(imgElement.src) ? imgElement.src : '';
    const promptMessage = isBot ? "캐릭터 이미지 URL 입력:" : "사용자 이미지 URL 입력:";
    const newUrl = prompt(promptMessage, currentUrl);

    if (newUrl !== null) { // 사용자가 취소하지 않은 경우
        if (newUrl === "" || !isValidImageUrl(newUrl)) {
            // 비우거나 유효하지 않은 URL
            updateImagePreview('', imgElement);
            if (isBot) { botProfileImgUrl = ''; } else { userProfileImgUrl = ''; }
            if (newUrl !== "") { alert("유효하지 않은 이미지 URL입니다."); }
        } else {
            // 유효한 URL
            updateImagePreview(newUrl, imgElement);
            if (isBot) { botProfileImgUrl = newUrl; } else { userProfileImgUrl = newUrl; }
        }
         // updateSystemPrompt(); // 이미지 변경 시 시스템 프롬프트 업데이트는 불필요할 수 있음
    }
}
// 채팅 이미지 삽입 함수
function sendImageChatMessage() {
    closeActionMenu();
    const imageUrl = prompt("채팅에 삽입할 이미지 URL:");
    if (imageUrl && isValidImageUrl(imageUrl)) {
        if (userInput) {
            // userInput.value = imageUrl; // 입력창에 URL 넣지 않고 바로 메시지 전송
            sendMessage(imageUrl); // sendMessage 함수가 URL을 감지하여 이미지 메시지로 처리
        } else {
             console.warn("userInput element not found, appending image directly.");
             // userInput이 없는 경우 대비 (거의 발생하지 않음)
             const imgMessage = { role: "user", messageData: { type: 'image', url: imageUrl } };
             conversationHistory.push(imgMessage);
             appendMessage("user", imgMessage.messageData, conversationHistory.length - 1);
             saveConversationHistory();
             if (chat) chat.scrollTop = chat.scrollHeight;
        }
    } else if (imageUrl !== null) { // 사용자가 입력했지만 유효하지 않은 경우
        alert("유효한 이미지 URL 형식이 아닙니다.");
    }
}
// 피드백 선택 처리
function handleFeedbackSelection(feedbackType) {
    if (!feedbackOptionsContainer || !feedbackButton) return;

    // 모든 버튼 비활성화
    feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => {
        button.classList.remove('active');
    });

    if (feedbackType) {
        // 선택된 버튼 활성화
        const selectedButton = feedbackOptionsContainer.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        currentFeedback = feedbackType; // 현재 피드백 상태 저장
        feedbackButton.classList.add('active'); // 메인 피드백 버튼 활성화 스타일
        closeFeedbackOptions(); // 선택 후 옵션 숨김
    } else {
        // 피드백 해제
        currentFeedback = null;
        feedbackButton.classList.remove('active'); // 메인 피드백 버튼 비활성화
        // closeFeedbackOptions(); // 해제 시에는 숨길 필요 없음 (이미 닫혔거나 열려 있을 수 있음)
    }
}
// --- 대화 기록 관리 ---
function saveConversationHistory() {
    try {
        if (conversationHistory && conversationHistory.length > 0) {
            localStorage.setItem(`conversation_slot_${currentSlot}`, JSON.stringify(conversationHistory));
        } else {
            // 기록이 비었으면 저장된 데이터 삭제
            localStorage.removeItem(`conversation_slot_${currentSlot}`);
        }
    } catch (e) {
        console.error("Error saving conversation history:", e);
    }
}
function loadConversationHistory() {
    try {
        const savedData = localStorage.getItem(`conversation_slot_${currentSlot}`);
        conversationHistory = []; // 초기화
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (Array.isArray(parsedData)) {
                    conversationHistory = parsedData;
                } else {
                    // console.warn("Invalid conversation history data found, removing."); // 제거
                    localStorage.removeItem(`conversation_slot_${currentSlot}`);
                }
            } catch (e) {
                console.error("Error parsing conversation history:", e);
                localStorage.removeItem(`conversation_slot_${currentSlot}`);
            }
        }

        // 채팅창 다시 그리기
        if (chat) {
            chat.innerHTML = ''; // 기존 내용 삭제
            appendInitialNotice(); // 초기 안내 메시지 추가
            conversationHistory.forEach((entry, index) => {
                // 시스템 프롬프트는 화면에 표시하지 않음
                if (!(entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT)) {
                    appendMessage(entry.role === 'model' ? 'bot' : 'user', entry.messageData, index);
                }
            });
            // 스크롤 맨 아래로 (지연 시간 약간 더 줌)
            setTimeout(() => { if (chat) chat.scrollTop = chat.scrollHeight; }, 100);
        } else {
            console.error("Chat element not found for loading history.");
        }
    } catch (e) {
        console.error("Error loading conversation history:", e);
        conversationHistory = []; // 오류 시 빈 배열로 초기화
    }
}
function resetConversation() {
    if (confirm(`슬롯 ${currentSlot}의 대화 기록을 정말로 삭제하시겠습니까?`)) {
        // console.log(`Resetting conversation for slot ${currentSlot}`); // 제거
        conversationHistory = [];
        saveConversationHistory(); // 빈 기록 저장 (localStorage에서 해당 슬롯 삭제)
        loadConversationHistory(); // 화면 다시 로드
        alert(`슬롯 ${currentSlot}의 대화 기록이 초기화되었습니다.`);
    }
}

// --- DOMContentLoaded 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // 시작 로그 유지
    try {
        // 요소 할당
        chat = getElement('chat');
        userInput = getElement('userInput');
        sendButton = getElement('sendButton');
        loadingSpinner = getElement('loadingSpinner');
        actionMenuButton = getElement('actionMenuButton');
        actionMenu = getElement('actionMenu');
        menuOverlay = getElement('menuOverlay');
        sidebarToggle = getElement('sidebarToggle');
        settingsModalOverlay = getElement('settingsModalOverlay');
        settingsModal = getElement('settingsModal');
        closeModalButton = getElement('closeModalButton');
        saveSettingsButtonModal = getElement('saveSettingsButtonModal');
        feedbackButton = getElement('feedbackButton');
        feedbackOptionsContainer = getElement('feedbackOptionsContainer');
        botNameInputModal = getElement('botNameInputModal');
        botAgeInputModal = getElement('botAgeInputModal');
        botGenderInputModal = getElement('botGenderInputModal');
        botAppearanceInputModal = getElement('botAppearanceInputModal');
        botPersonaInputModal = getElement('botPersonaInputModal');
        botImagePreview = getElement('botImagePreview');
        userNameInputModal = getElement('userNameInputModal');
        userAgeInputModal = getElement('userAgeInputModal');
        userGenderInputModal = getElement('userGenderInputModal');
        userAppearanceInputModal = getElement('userAppearanceInputModal');
        userGuidelinesInputModal = getElement('userGuidelinesInputModal');
        userImagePreview = getElement('userImagePreview');
        generateRandomCharacterButton = getElement('generateRandomCharacter', false);
        generateRandomUserButton = getElement('generateRandomUser', false);
        menuImageButton = getElement('menuImageButton', false);
        menuSituationButton = getElement('menuSituationButton', false);
        menuExportTxtButton = getElement('menuExportTxtButton', false);
        menuSummarizeButton = getElement('menuSummarizeButton', false);
        situationOptions = getElement('situationOptions', false);
        imageOverlay = getElement('imageOverlay', false);
        overlayImage = getElement('overlayImage', false);

        // --- 이벤트 리스너 연결 ---

        // 메시지 전송 (클릭 및 Enter)
        if (sendButton) sendButton.addEventListener("click", () => { if (userInput) sendMessage(userInput.value); });
        if (userInput) userInput.addEventListener("keydown", function(e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendMessage(userInput.value); } });

        // 메인 입력창 자동 높이 조절
        if (userInput) userInput.addEventListener('input', autoResizeTextarea);

        // 액션 메뉴 토글
        if (actionMenuButton) { actionMenuButton.addEventListener("click", (e) => { e.stopPropagation(); toggleActionMenu(); }); } else { console.error("actionMenuButton not found!"); }
        if (menuOverlay) menuOverlay.addEventListener("click", closeActionMenu);

        // 액션 메뉴 버튼들
        if (menuImageButton) menuImageButton.addEventListener("click", sendImageChatMessage);
        if (menuSituationButton) menuSituationButton.addEventListener("click", toggleSituationOptions);
        if (situationOptions) {
            situationOptions.querySelectorAll(".option").forEach(optionButton => {
                optionButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const situationType = optionButton.textContent.trim();
                    if (situationType) {
                        sendSituationRequest(situationType); // 상황 요청 함수 호출
                    }
                    closeActionMenu(); // 메뉴 닫기
                });
            });
        }
        if (menuExportTxtButton) menuExportTxtButton.addEventListener("click", exportConversationAsTxt);
        if (menuSummarizeButton) menuSummarizeButton.addEventListener("click", summarizeConversation);

        // 설정 모달 관련
        if (sidebarToggle) { sidebarToggle.addEventListener("click", (e) => { e.stopPropagation(); openSettingsModal(); }); } else { console.error("sidebarToggle not found!"); }
        if (closeModalButton) { closeModalButton.addEventListener("click", closeSettingsModal); }
        if (settingsModalOverlay) { settingsModalOverlay.addEventListener("click", function(e) { if (e.target === settingsModalOverlay) { closeSettingsModal(); } }); }
        if (saveSettingsButtonModal) saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));

        // 슬롯 버튼
        document.querySelectorAll('.slot-button').forEach(button => {
            button.addEventListener('click', function() {
                const slotNum = parseInt(this.textContent);
                if (!isNaN(slotNum) && slotNum !== currentSlot) {
                    currentSlot = slotNum;
                    // console.log(`Switched to slot ${currentSlot}`); // 제거
                    loadSettings(currentSlot);      // 해당 슬롯 설정 로드
                    loadConversationHistory(); // 해당 슬롯 대화 로드
                }
            });
        });

        // 랜덤 생성 버튼
        if (generateRandomCharacterButton) generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
        if (generateRandomUserButton) generateRandomUserButton.addEventListener('click', generateRandomUser);

        // 이미지 미리보기 클릭 (URL 입력)
        if (botImagePreview) botImagePreview.closest('.image-preview-area')?.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
        if (userImagePreview) userImagePreview.closest('.image-preview-area')?.addEventListener('click', () => promptForImageUrl(userImagePreview, false));

        // 피드백 버튼 및 옵션
        if (feedbackButton) feedbackButton.addEventListener("click", toggleFeedbackOptions);
        if (feedbackOptionsContainer) {
            feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const feedback = this.dataset.feedback;
                    // 현재 선택된 피드백과 같으면 해제, 다르면 선택
                    if (currentFeedback === feedback) {
                        handleFeedbackSelection(null);
                    } else {
                        handleFeedbackSelection(feedback);
                    }
                });
            });
        }

        // 외부 클릭 시 메뉴/옵션 닫기
        document.addEventListener('click', function(e) {
             // 액션 메뉴 닫기
             if (actionMenu && actionMenuButton && !actionMenu.contains(e.target) && e.target !== actionMenuButton && actionMenu.classList.contains('visible')) {
                 closeActionMenu();
             }
             // 피드백 옵션 닫기 (선택된 피드백이 없을 때만)
             if (feedbackOptionsContainer && feedbackButton && !feedbackOptionsContainer.contains(e.target) && e.target !== feedbackButton && !currentFeedback && !feedbackOptionsContainer.classList.contains('hidden')) {
                  closeFeedbackOptions();
             }
        });

        // 모달 Textarea 자동 높이 조절 연결
        const modalTextareas = [
            botAppearanceInputModal,
            botPersonaInputModal,
            userAppearanceInputModal,
            userGuidelinesInputModal
        ];
        modalTextareas.forEach(textarea => {
            if (textarea) {
                textarea.addEventListener('input', autoResizeTextarea);
            }
        });

        initializeChat(); // 초기화 (설정 로드, 대화 로드 등)
        console.log("Initialization complete."); // 완료 로그 유지

    } catch (e) {
        console.error("Error during DOMContentLoaded setup:", e);
        alert("페이지 초기화 중 심각한 오류가 발생했습니다.");
    }
}); // DOMContentLoaded 끝
