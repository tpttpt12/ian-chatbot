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
/**
 * ID로 DOM 요소를 가져옵니다. 필수 요소가 없으면 오류를 기록합니다.
 * @param {string} id - 찾을 요소의 ID
 * @param {boolean} required - 요소가 필수인지 여부 (기본값: true)
 * @returns {HTMLElement|null} - 찾은 요소 또는 null
 */
function getElement(id, required = true) {
    const element = document.getElementById(id);
    if (required && !element) {
        console.error(`[Fatal] Required element with ID '${id}' not found in the DOM.`);
        // 개발 중에는 오류를 던져서 문제를 즉시 파악하는 것이 좋을 수 있습니다.
        // throw new Error(`Required element with ID '${id}' not found.`);
    } else if (!element && !required) {
        console.warn(`[Optional] Element with ID '${id}' not found.`);
    }
    return element;
}

// --- 함수 정의 ---
console.log("Defining functions...");

// 이미지 오버레이
function openImageOverlay(element) {
    console.log("openImageOverlay called");
    try {
        // 요소 재확인 (초기화 시 실패했을 경우 대비)
        if (!imageOverlay) imageOverlay = getElement('imageOverlay', false);
        if (!overlayImage) overlayImage = getElement('overlayImage', false);

        if (!imageOverlay || !overlayImage || !element || !element.src) {
            console.warn("Cannot open image overlay: Missing elements or image source.");
            return;
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
        overlayImage.src = ""; // 이미지 소스 초기화 (메모리 누수 방지)
        imageOverlay.style.display = "none";
    } catch (e) { console.error("Error in closeImageOverlay:", e); }
}

// Textarea 높이 조절 (1->2줄 후 스크롤) - this 유효성 검사 강화
function autoResizeTextarea() {
    try {
        // 'this'가 textarea 요소인지, style 속성이 있는지 확인
        if (!this || typeof this.style === 'undefined' || this.tagName !== 'TEXTAREA') {
             console.warn("autoResizeTextarea called on invalid element:", this);
             return;
        }

        this.style.height = 'auto'; // 높이 초기화 중요
        this.style.overflowY = 'hidden'; // 일단 숨김

        const computedStyle = getComputedStyle(this);
        // line-height가 0이거나 NaN일 경우 대비 기본값 설정
        const lineHeight = parseFloat(computedStyle.lineHeight) || 18;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
        const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;

        // 박스 사이징 고려 (border-box가 일반적)
        const verticalPaddingAndBorder = paddingTop + paddingBottom + borderTop + borderBottom;

        // 1줄, 2줄 기준 높이 계산
        const oneLineHeight = lineHeight + verticalPaddingAndBorder;
        const twoLineHeight = (lineHeight * 2) + verticalPaddingAndBorder;
        const minHeight = oneLineHeight; // 최소 높이는 1줄

        const contentHeight = this.scrollHeight; // border 포함한 전체 높이

        // 2줄 높이보다 약간(예: 2px) 커야 스크롤 적용 (오차 및 브라우저 차이 감안)
        if (contentHeight > twoLineHeight + 2) {
            this.style.height = twoLineHeight + 'px'; // 2줄 높이로 고정
            this.style.overflowY = 'auto'; // 스크롤 활성화
        } else { // 2줄 이하일 때
            // 내용 높이만큼 설정하되, 최소 1줄 높이 보장
            this.style.height = Math.max(contentHeight, minHeight) + 'px';
            this.style.overflowY = 'hidden'; // 스크롤 없음
        }
    } catch (e) { console.error("Error in autoResizeTextarea:", e); }
}


// 설정 저장
function saveSettings(slotNumber) {
    console.log(`saveSettings called for slot ${slotNumber}`);
    try {
        // Modal 요소들이 존재하는지 다시 한번 확인
        if (!botNameInputModal || !botAgeInputModal || !botGenderInputModal || !botAppearanceInputModal || !botPersonaInputModal || !botImagePreview ||
            !userNameInputModal || !userAgeInputModal || !userGenderInputModal || !userAppearanceInputModal || !userGuidelinesInputModal || !userImagePreview) {
            console.error("Cannot save settings: Modal input elements are missing.");
            alert("설정 저장에 필요한 입력 필드를 찾을 수 없습니다.");
            return;
        }

        const settings = {
            botName: botNameInputModal.value || '', botAge: botAgeInputModal.value || '', botGender: botGenderInputModal.value || '',
            botAppearance: botAppearanceInputModal.value || '', botPersona: botPersonaInputModal.value || '',
            botImageUrl: botImagePreview.src && botImagePreview.src.startsWith('http') ? botImagePreview.src : '', // src 존재 및 http 시작 확인
            userName: userNameInputModal.value || '', userAge: userAgeInputModal.value || '', userGender: userGenderInputModal.value || '',
            userAppearance: userAppearanceInputModal.value || '', userGuidelines: userGuidelinesInputModal.value || '',
            userImageUrl: userImagePreview.src && userImagePreview.src.startsWith('http') ? userImagePreview.src : '' // src 존재 및 http 시작 확인
        };
        localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(settings));
        alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`);

        // 전역 변수 업데이트 및 시스템 프롬프트 갱신
        userProfileImgUrl = settings.userImageUrl;
        botProfileImgUrl = settings.botImageUrl;
        updateSystemPrompt(); // 설정 저장 후 즉시 프롬프트 업데이트

        closeSettingsModal(); // 저장 후 모달 닫기 (선택 사항)

    } catch (e) { console.error("Error in saveSettings:", e); alert("설정 저장 중 오류가 발생했습니다."); }
}

// 설정 로드 - Null 체크 강화
function loadSettings(slotNumber) {
    console.log(`loadSettings called for slot ${slotNumber}`);
    try {
        const savedSettings = localStorage.getItem(`settings_slot_${slotNumber}`);
        let settings = {};
        if (savedSettings) {
             try {
                 settings = JSON.parse(savedSettings);
                 if (typeof settings !== 'object' || settings === null) { // 파싱 결과가 객체가 아니면 초기화
                     settings = {};
                     console.warn(`Parsed settings for slot ${slotNumber} is not an object. Resetting.`);
                     localStorage.removeItem(`settings_slot_${slotNumber}`);
                 }
             } catch (e) {
                 console.error("Failed to parse settings for slot " + slotNumber + ":", e);
                 localStorage.removeItem(`settings_slot_${slotNumber}`); // 파싱 실패 시 해당 슬롯 데이터 삭제
                 settings = {}; // 빈 객체로 초기화
             }
        }

        // 각 입력 필드/이미지 미리보기 업데이트 (요소 존재 여부 확인 후)
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

        updateSystemPrompt(); // 설정 로드 후 시스템 프롬프트 업데이트
        updateSlotButtonStyles(); // 활성 슬롯 버튼 스타일 업데이트

    } catch (e) { console.error("Error in loadSettings:", e); }
}

// SYSTEM_PROMPT 업데이트 - Null 체크 추가
function updateSystemPrompt() {
    try {
        // 입력 필드가 로드되지 않았을 경우를 대비하여 기본값 설정 강화
        const botName = botNameInputModal?.value || "캐릭터";
        const botAge = botAgeInputModal?.value || "불명";
        const botAppearance = botAppearanceInputModal?.value || "알 수 없음";
        const botPersona = botPersonaInputModal?.value || "설정 없음";
        const userName = userNameInputModal?.value || "사용자";
        const userAge = userAgeInputModal?.value || "불명";
        const userAppearance = userAppearanceInputModal?.value || "알 수 없음";
        const userGuidelines = userGuidelinesInputModal?.value || "설정 없음";

        SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
            .replace(/{botName}/g, botName)
            .replace(/{botAge}/g, botAge)
            .replace(/{botAppearance}/g, botAppearance)
            .replace(/{botPersona}/g, botPersona)
            .replace(/{userName}/g, userName)
            .replace(/{userAge}/g, userAge)
            .replace(/{userAppearance}/g, userAppearance)
            .replace(/{userGuidelines}/g, userGuidelines);
        // console.log("SYSTEM_PROMPT updated:", SYSTEM_PROMPT); // 필요시 확인용 로그
    } catch (e) { console.error("Error in updateSystemPrompt:", e); }
}

// 초기화
function initializeChat() {
    console.log("initializeChat called");
    try {
        loadSettings(currentSlot); // 슬롯 로드 (내부에서 updateSystemPrompt, updateSlotButtonStyles 호출됨)
        loadConversationHistory(); // 대화 기록 로드
        if(userInput) autoResizeTextarea.call(userInput); // 초기 textarea 높이 조절
        appendInitialNotice(); // 초기 안내 메시지 추가 (선택 사항)
        console.log("Chat initialized successfully.");
    } catch (e) { console.error("Error during initializeChat:", e); }
}

// 초기 공지 메시지 (선택적 기능)
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
             // 첫 번째 자식으로 삽입 (prepend)
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

// 메시지를 채팅창에 추가 - Marked 오류 처리, 삭제 로직 강화
function appendMessage(role, messageData, index = -1) {
    try {
        if (!chat) { console.error("Chat element not found in appendMessage"); return; }

        // 인덱스 유효성 검사 (삭제 기능 위함)
        const isValidIndex = typeof index === 'number' && index >= 0 && index < conversationHistory.length;

        if (messageData.type === 'image') {
            // 이미지 메시지 표시 로직
            const imageAnnouncementContainer = document.createElement("div");
            imageAnnouncementContainer.className = `image-announcement ${role}`; // user/bot 클래스 추가 가능
             if (isValidIndex) { imageAnnouncementContainer.dataset.index = index; } // 유효할 때만 인덱스 추가

            const imageFadeContainer = document.createElement("div");
            imageFadeContainer.className = "image-fade-container";

            const imgElement = document.createElement("img");
            imgElement.className = "chat-image";
            imgElement.src = messageData.url;
            imgElement.alt = "채팅 이미지";
            imgElement.loading = 'lazy'; // 이미지 지연 로딩
            imgElement.onclick = () => openImageOverlay(imgElement); // 클릭 시 확대
            imgElement.onerror = function() { // 이미지 로드 실패 시
                console.warn(`Failed to load chat image: ${this.src}`);
                this.onerror = null; // 에러 핸들러 반복 호출 방지
                const errorText = document.createElement('div');
                errorText.textContent = "(이미지 로드 실패)";
                errorText.className = 'image-error-text'; // 스타일링을 위한 클래스
                // 기존 이미지 컨테이너 내용 비우고 에러 텍스트 삽입
                imageAnnouncementContainer.innerHTML = '';
                imageAnnouncementContainer.appendChild(errorText);
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn chat-image-delete-btn";
            deleteBtn.textContent = "✕";
            deleteBtn.title = "이미지 삭제";
            // 삭제 버튼 스타일 (필요시 CSS로 이동)
            // deleteBtn.style.position = 'absolute'; deleteBtn.style.top = '2px'; deleteBtn.style.right = '2px'; /* ... */

            deleteBtn.onclick = () => {
                 if (!isValidIndex) {
                     // 히스토리에 없는 임시 메시지 (예: 미리보기) 삭제 처리
                     imageAnnouncementContainer.remove();
                     console.warn("Deleted temporary image message (not in history).");
                     return;
                 }
                 const msgIndex = parseInt(imageAnnouncementContainer.dataset.index);
                 // 삭제 전 인덱스 재확인
                 if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length && conversationHistory[msgIndex] && conversationHistory[msgIndex].messageData.url === messageData.url) {
                     if (confirm("이 이미지를 삭제하시겠습니까?")) {
                         conversationHistory.splice(msgIndex, 1);
                         saveConversationHistory();
                         loadConversationHistory(); // 채팅창 다시 로드
                     }
                 } else {
                     console.error("Cannot delete image from history: Invalid index or message mismatch.", msgIndex, conversationHistory.length);
                     alert("이미지 삭제 중 오류가 발생했습니다.");
                     imageAnnouncementContainer.remove(); // 화면에서는 일단 제거
                 }
             };

            imageFadeContainer.appendChild(imgElement);
            imageAnnouncementContainer.appendChild(imageFadeContainer);
            imageAnnouncementContainer.appendChild(deleteBtn);
            chat.appendChild(imageAnnouncementContainer);

        } else { // 텍스트 메시지 처리
            const container = document.createElement("div");
            container.className = `message-container ${role}`;
            if (isValidIndex) { container.dataset.index = index; } // 유효할 때만 인덱스 추가

            const profileArea = document.createElement("div");
            profileArea.className = "profile-area";

            const profileImgContainer = document.createElement("div");
            profileImgContainer.style.position = 'relative'; // 이모지 위치 기준

            const currentImgUrl = (role === 'user' ? userProfileImgUrl : botProfileImgUrl);
            const profileName = (role === 'user' ? (userNameInputModal?.value || "사용자") : (botNameInputModal?.value || "캐릭터"));

            const fallbackDiv = document.createElement("div");
            fallbackDiv.className = "profile-fallback";
            fallbackDiv.title = `${profileName} (이미지 없음)`;

            // 이미지 또는 Fallback 표시
            if (currentImgUrl && currentImgUrl.startsWith('http')) {
                const profileImgElement = document.createElement("img");
                profileImgElement.className = "profile-img";
                profileImgElement.src = currentImgUrl;
                profileImgElement.alt = `${profileName} 프로필`;
                profileImgElement.loading = 'lazy';
                profileImgElement.addEventListener("click", () => openImageOverlay(profileImgElement));
                profileImgElement.onerror = function() {
                    console.warn(`Profile image load failed, showing fallback for ${role}: ${this.src}`);
                    this.onerror = null;
                    if (profileImgContainer) { // 컨테이너가 아직 존재하는지 확인
                         profileImgContainer.innerHTML = ''; // 기존 이미지 제거
                         profileImgContainer.appendChild(fallbackDiv.cloneNode(true)); // 복제본 사용
                    }
                };
                profileImgContainer.appendChild(profileImgElement);
            } else {
                profileImgContainer.appendChild(fallbackDiv);
            }

            // 이모지 (봇 메시지에만)
            if (role === 'bot') {
                const emojiSpan = document.createElement("span");
                emojiSpan.className = "profile-emoji";
                // 다양한 이모지 목록
                const emojis = ['😊', '🤔', '✨', '👀', '😉', '😅', '📝', '💬', '🧐', '🤖'];
                emojiSpan.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emojiSpan.style.display = 'inline'; // CSS에서 기본 display: none 일 수 있으므로 JS로 제어
                profileImgContainer.appendChild(emojiSpan); // 이미지 또는 fallback 옆에 추가
            }

            // 이름 & 삭제 버튼
            const roleName = document.createElement("div");
            roleName.className = "role-name";

            const nameTextSpan = document.createElement("span");
            nameTextSpan.className = "name-text";
            nameTextSpan.textContent = profileName;

            let deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "✕";
            deleteBtn.title = "메시지 삭제";
            deleteBtn.onclick = () => {
                 if (!isValidIndex) {
                     container.remove();
                     console.warn("Deleted temporary text message (not in history).");
                     return;
                 }
                 const msgIndex = parseInt(container.dataset.index);
                 // 삭제 전 인덱스 재확인
                 if (!isNaN(msgIndex) && msgIndex >= 0 && msgIndex < conversationHistory.length && conversationHistory[msgIndex] && conversationHistory[msgIndex].messageData.text === messageData.text) {
                     if (confirm("이 메시지를 삭제하시겠습니까?")) {
                         conversationHistory.splice(msgIndex, 1);
                         saveConversationHistory();
                         loadConversationHistory(); // 채팅창 다시 로드
                     }
                 } else {
                     console.error("Cannot delete message from history: Invalid index or message mismatch.", msgIndex, conversationHistory.length);
                     alert("메시지 삭제 중 오류가 발생했습니다.");
                     container.remove(); // 화면에서는 일단 제거
                 }
            };

            roleName.appendChild(nameTextSpan);
            roleName.appendChild(deleteBtn);

            // 프로필 영역 조립 (User는 이름이 왼쪽, Bot은 이름이 오른쪽)
            if (role === 'user') {
                 profileArea.appendChild(roleName);
                 profileArea.appendChild(profileImgContainer);
            } else { // bot
                 profileArea.appendChild(profileImgContainer);
                 profileArea.appendChild(roleName);
            }

            // 메시지 버블 (Marked 라이브러리 사용)
            const contentWrapper = document.createElement("div");
            contentWrapper.className = "message-content-wrapper";

            const messageBodyElement = document.createElement("div");
            messageBodyElement.className = "message-bubble";

            let rawText = messageData.text || ""; // 텍스트가 없는 경우 빈 문자열 처리

            // Marked 라이브러리가 로드되었는지 확인
            if (typeof marked === 'function') {
                try {
                    // GFM 옵션과 개행문자(\n)를 <br>로 변환하는 옵션 사용
                    messageBodyElement.innerHTML = marked.parse(rawText, { breaks: true, gfm: true });
                } catch (e) {
                    console.error("Marked parsing error:", e, "\nRaw text:", rawText);
                    // 오류 발생 시 이스케이프된 텍스트 표시
                    messageBodyElement.textContent = rawText;
                }
            } else {
                console.warn("marked library not loaded. Displaying raw text.");
                // Marked가 없으면 텍스트를 그대로 표시 (HTML 태그는 렌더링되지 않음)
                messageBodyElement.textContent = rawText;
            }

            contentWrapper.appendChild(messageBodyElement);

            // 최종 조립
            container.appendChild(profileArea);
            container.appendChild(contentWrapper);
            chat.appendChild(container);

             // 새 메시지 추가 후 스크롤 맨 아래로 이동 (선택적)
            // chat.scrollTop = chat.scrollHeight;
        }
    } catch (e) { console.error("Error in appendMessage:", e); }
}


// TXT 내보내기
function exportConversationAsTxt() {
    console.log("exportConversationAsTxt called");
    try {
        if (!conversationHistory || conversationHistory.length === 0) {
            alert("내보낼 대화 내용이 없습니다.");
            return;
        }

        let txtContent = "";
        const currentBotName = botNameInputModal?.value || "캐릭터";
        const currentUserName = userNameInputModal?.value || "사용자";

        conversationHistory.forEach(entry => {
            // 시스템 프롬프트나 이미지 메시지는 건너뛰기
            if (entry.role === 'user' && entry.messageData?.type === 'text' && entry.messageData?.text === SYSTEM_PROMPT) return;
            if (entry.messageData?.type === 'image') return;

            // 텍스트 메시지만 처리
            if (entry.messageData?.type === 'text') {
                const name = (entry.role === "user" ? currentUserName : currentBotName);
                let rawText = entry.messageData?.text || "";
                // '*'로 감싸진 부분 제거 (마크다운 기울임꼴 제거)
                let processedText = rawText.replace(/^\*|\*$/g, '').replace(/\*([^*]+)\*/gs, '$1').trim(); // 시작/끝 '*' 및 내부 '*' 제거
                if (processedText) { // 내용이 있는 경우에만 추가
                    txtContent += `[${name}] : ${processedText}\n\n`;
                }
            }
        });

        txtContent = txtContent.trimEnd(); // 마지막 줄바꿈 제거

        if (!txtContent) {
            alert("내보낼 텍스트 내용이 없습니다. (이미지 제외)");
            return;
        }

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        link.download = `chat_history_${currentBotName}_${currentUserName}_${timestamp}.txt`; // 파일명에 정보 추가

        // 링크 클릭하여 다운로드 시작 (화면에 보이지 않게 처리)
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // 링크 제거
        URL.revokeObjectURL(link.href); // 메모리 해제

        // 메뉴 닫기 (성공 시)
        closeActionMenu();

    } catch (e) { console.error("Error in exportConversationAsTxt:", e); alert("TXT 내보내기 중 오류가 발생했습니다."); }
}

// 요약 - API 호출 부분은 주석 처리 (백엔드 필요)
async function summarizeConversation() {
    console.log("summarizeConversation called");
    // 필수 요소 확인
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !menuSummarizeButton || !chat) {
        console.error("Summarize dependencies missing");
        alert("요약 기능을 실행하는 데 필요한 요소가 없습니다.");
        return;
    }

    // 버튼 비활성화 및 로딩 스피너 표시
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block'; menuSummarizeButton.disabled = true;
    if (feedbackButton) feedbackButton.disabled = true; // 피드백 버튼도 비활성화

    closeActionMenu(); // 액션 메뉴 닫기

    try {
        // 최근 대화 10개 (시스템 프롬프트 제외, 텍스트만) 가져오기
        const recentHistory = conversationHistory
            .filter(entry => !(entry.role === 'user' && entry.messageData?.text === SYSTEM_PROMPT) && entry.messageData?.type === 'text')
            .slice(-10);

        if (recentHistory.length === 0) {
            alert("요약할 대화 내용이 없습니다.");
            // finally 블록이 실행되도록 return 전에 상태 복구 X
            return; // 여기서 함수 종료
        }

        const summaryPromptText = `다음 대화 내용을 한국어로 간결하게 요약해줘. 요약은 제3자 시점에서 작성하고, 핵심 사건과 전개만 담되 군더더기 없는 자연스러운 문장으로 작성해. "요약:" 같은 머리말은 붙이지 말고, 그냥 텍스트만 출력해. (최근 ${recentHistory.length} 턴 기준)`;

        // API 호출을 위한 데이터 준비 (시스템 프롬프트 + 최근 대화 + 요약 요청)
        const contentsForApi = [
             { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, // 항상 시스템 프롬프트 포함
             ...recentHistory.map(entry => ({ // role과 text만 추출
                 role: entry.role === 'model' ? 'model' : 'user', // API 형식에 맞게 role 변환
                 parts: [{ text: entry.messageData.text }]
             })),
             { role: "user", parts: [{ text: summaryPromptText }] } // 요약 요청 추가
        ];

        console.log(`Sending summary request for last ${recentHistory.length} turns...`);

        // ==================================================
        // <<< 중요: 실제 API 호출 부분 >>>
        // 백엔드 API 엔드포인트(/api/chat)가 준비되어 있어야 합니다.
        // 아래 fetch 코드는 예시이며, 실제 API 사양에 맞게 수정해야 합니다.
        // --------------------------------------------------
        let summaryText = ''; // 요약 결과 저장 변수
        /*
        const res = await fetch(`/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: contentsForApi })
        });

        console.log("Summary API response status:", res.status);

        if (!res.ok) {
            const errorBody = await res.text();
            console.error(`Summary API Error (${res.status}): ${errorBody}`);
            summaryText = `(요약 실패: 서버 오류 ${res.status})`;
        } else {
            const data = await res.json();
            // API 응답 구조에 따라 실제 요약 텍스트 추출 필요
            // 예시: data.candidates[0].content.parts[0].text
            summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(요약 응답 처리 실패)";
            console.log("Summary received:", summaryText);
        }
        */
        // --------------------------------------------------
        // <<< 임시 코드: API 호출 대신 더미 텍스트 사용 >>>
         await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 딜레이 (로딩 표시용)
         summaryText = `(임시 요약) 최근 ${recentHistory.length}개의 대화 턴에 대한 요약 내용입니다. API 연결 시 실제 요약이 표시됩니다.`;
         console.log("Using dummy summary text.");
        // ==================================================


        // 요약 결과를 봇 메시지로 채팅창에 추가
        appendMessage("bot", { type: 'text', text: `--- 최근 ${recentHistory.length}턴 대화 요약 ---\n${summaryText}\n---` });
        chat.scrollTop = chat.scrollHeight; // 스크롤 맨 아래로

    } catch (error) {
        console.error("Fetch Error or other error during Summary:", error);
        // 사용자에게 오류 알림 (채팅창에 메시지 추가)
        appendMessage("bot", { type: 'text', text: "(요약 중 오류 발생)" });
        chat.scrollTop = chat.scrollHeight;
    }
    finally {
        // finally 블록은 try 또는 catch 블록 실행 후 *항상* 실행됨 (return 전에도)
        console.log("Finishing summary request.");
        // 버튼 및 입력 필드 다시 활성화
        if(sendButton) sendButton.disabled = false;
        if(userInput) userInput.disabled = false;
        if(actionMenuButton) actionMenuButton.disabled = false;
        if(loadingSpinner) loadingSpinner.style.display = 'none';
        if(menuSummarizeButton) menuSummarizeButton.disabled = false;
        if(feedbackButton) feedbackButton.disabled = false;

        if(userInput) userInput.focus(); // 입력 필드에 포커스
    }
}

// 메시지 전송 - 이미지 URL 처리 강화, API 호출 부분 분리
async function sendMessage(messageText) {
    console.log("sendMessage called");
    // 필수 요소 확인
    if (!userInput || !sendButton || !actionMenuButton || !feedbackButton || !loadingSpinner || !chat) {
        console.error("sendMessage dependencies missing");
        alert("메시지 전송에 필요한 요소가 없습니다.");
        return;
    }

    let message = messageText.trim(); // 앞뒤 공백 제거

    // 입력 내용이 없으면 아무 작업 안 함
    if (!message) {
        userInput.value = ''; // 입력창 비우기
        autoResizeTextarea.call(userInput); // 높이 재조정
        return;
    }
    console.log("Input message:", message);

    // --- 이미지 URL 감지 및 처리 ---
    // 정규식: http(s)://로 시작하고 이미지 확장자(gif, jpg, jpeg, png, webp, bmp)로 끝나는 URL
    // 중간에 공백이나 따옴표가 없는지 확인
    const imageUrlPattern = /^(https|http):\/\/[^\s"]+\.(gif|jpe?g|png|webp|bmp)(\?.*)?$/i;
    if (imageUrlPattern.test(message)) {
        console.log("Image URL detected, sending as image message.");
        const imageMessageEntry = { role: "user", messageData: { type: 'image', url: message } };
        conversationHistory.push(imageMessageEntry); // 이미지 메시지 기록
        appendMessage("user", imageMessageEntry.messageData, conversationHistory.length - 1);
        saveConversationHistory(); // 기록 저장
        userInput.value = ''; // 입력창 비우기
        autoResizeTextarea.call(userInput); // 높이 재조정
        chat.scrollTop = chat.scrollHeight; // 스크롤 맨 아래로
        return; // 이미지 처리 후 함수 종료
    }

    // --- 텍스트 메시지 처리 ---
    console.log("Treating message as text.");
    try {
        // 액션(*)과 대화("") 자동 변환 (선택적 기능)
        // 예: *웃으며* 안녕 -> *웃으며* "안녕"
        // 주의: 복잡한 패턴은 예상치 못한 결과를 낳을 수 있음
        // message = message.replace(/(\*.*?\*)\s*([^"\n\r*].*)/g, (match, action, dialogue) => {
        //     if (/^\s*["*]/.test(dialogue)) return match; // 이미 따옴표나 별표로 시작하면 변환 안 함
        //     return `${action} "${dialogue.trim()}"`;
        // });

        // 현재 선택된 피드백 가져오고 초기화
        let feedbackToSend = currentFeedback;
        if (currentFeedback) {
            handleFeedbackSelection(null); // 피드백 UI 초기화
        }

        // 사용자 메시지를 대화 기록에 추가하고 화면에 표시
        const userMessageEntry = { role: "user", messageData: { type: 'text', text: message } };
        conversationHistory.push(userMessageEntry);
        appendMessage("user", userMessageEntry.messageData, conversationHistory.length - 1);
        saveConversationHistory();

        // 입력창 비우고 높이 조절
        userInput.value = '';
        autoResizeTextarea.call(userInput);
        chat.scrollTop = chat.scrollHeight;

        // 로딩 시작: 버튼 비활성화 및 스피너 표시
        sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true;
        loadingSpinner.style.display = 'block';

        // API 호출을 위한 데이터 준비
        let contentsForApi;
        try {
            // 시스템 프롬프트 + 전체 대화 기록 (텍스트만, 이미지 제외)
            const textOnlyHistory = conversationHistory.filter(entry => entry.messageData?.type === 'text');
            contentsForApi = [
                 { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                 ...textOnlyHistory.map(entry => ({
                     role: entry.role === 'model' ? 'model' : 'user',
                     parts: [{ text: entry.messageData.text }]
                 }))
             ];

            // 피드백이 있으면 API 요청에 추가 (user 역할로 추가)
            if (feedbackToSend) {
                console.log(`Sending with feedback: ${feedbackToSend}`);
                contentsForApi.push({ role: "user", parts: [{ text: `(피드백: ${feedbackToSend})` }] });
                // 피드백은 일회성이므로 conversationHistory에는 저장하지 않음
            }

        } catch (e) {
            console.error("Error preparing API contents:", e);
            throw new Error("API 요청 데이터 준비 중 오류 발생"); // 에러를 다시 던져서 catch 블록에서 처리하도록 함
        }

        // API 호출 (실제 백엔드 필요)
        console.log("Sending API request...");
        let botReplyText = '';

        // ==================================================
        // <<< 중요: 실제 API 호출 부분 >>>
        /*
        try {
            const res = await fetch(`/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: contentsForApi })
            });
            console.log("API response status:", res.status);

            if (!res.ok) {
                const errorBody = await res.text();
                console.error(`API Error (${res.status}): ${errorBody}`);
                botReplyText = `(오류 ${res.status}: 응답을 받을 수 없습니다.)`;
            } else {
                const data = await res.json();
                // 응답 구조에 맞게 텍스트 추출 (예시)
                botReplyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(빈 응답)";
                console.log("API Response:", botReplyText);
            }
        } catch (fetchError) {
             console.error("Fetch Error sending message:", fetchError);
             botReplyText = "(통신 오류 발생)";
        }
        */
        // --------------------------------------------------
        // <<< 임시 코드: API 호출 대신 더미 텍스트 사용 >>>
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 딜레이
        botReplyText = `*봇 응답 시뮬레이션:* 사용자의 메시지 "${message}"에 대한 응답입니다. API 연결 시 실제 응답이 표시됩니다.`;
        if(feedbackToSend) botReplyText += `\n(피드백 "${feedbackToSend}" 반영 시도)`;
        console.log("Using dummy bot reply.");
        // ==================================================


        // 봇 응답을 대화 기록에 추가하고 화면에 표시
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);
        saveConversationHistory(); // 봇 응답까지 포함하여 저장

    } catch (error) {
        // 메시지 전송 과정 전체의 오류 처리 (API 데이터 준비 오류 등)
        console.error("Error in sendMessage process:", error);
        appendMessage("bot", { type: 'text', text: `(메시지 처리 중 오류 발생: ${error.message})` });
    }
    finally {
        // 로딩 종료: 버튼 활성화 및 스피너 숨김
        console.log("Finishing message send.");
        if(sendButton) sendButton.disabled = false;
        if(userInput) userInput.disabled = false;
        if(actionMenuButton) actionMenuButton.disabled = false;
        if(feedbackButton) feedbackButton.disabled = false;
        if(loadingSpinner) loadingSpinner.style.display = 'none';

        if(userInput) userInput.focus(); // 입력창 포커스
        if(chat) chat.scrollTop = chat.scrollHeight; // 스크롤 맨 아래로
    }
}


// '상황' 요청 함수 (절대 수정 금지!) - 프롬프트 복구 및 API 호출 구조화
async function sendSituationRequest(type) {
    console.log(`sendSituationRequest called with type: ${type}`);
    // 필수 요소 확인
    if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !botNameInputModal || !chat) {
        console.error("sendSituationRequest dependencies missing");
        alert("상황 요청 기능을 실행하는 데 필요한 요소가 없습니다.");
        return;
    }

    // 버튼 비활성화 및 로딩 스피너 표시
    sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true;
    loadingSpinner.style.display = 'block';
    if(feedbackButton) feedbackButton.disabled = true;

    closeActionMenu(); // 액션 메뉴 닫기

    try {
        let situationPromptText = '';
        const botName = botNameInputModal.value || "캐릭터"; // 현재 설정된 봇 이름 사용

        // *** 상황별 프롬프트 (원본 유지) ***
        switch(type) {
             case '랜덤': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe current situation needs a fresh development or a change of pace.\nIntroduce a new element, interaction, or internal thought that moves the story forward in an interesting, but not necessarily drastic, way.\nMaintain the established tone and character consistency. Focus on subtle shifts and sensory details. Avoid repetition.\nOutput should feel like a natural continuation of the story.\n`; break;
             case '전환': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nCraft a fresh, emotionally engaging situation that sparks curiosity or connection between the characters — something surprising, light-hearted, or meaningful, based on the unique traits of this character and their world.\nThe event should not be overly dramatic or intense, but should still shift the emotional dynamic in a natural and immersive way.\nAvoid adult or mature content. Do not copy specific examples or past scenes — create a new moment inspired by the tone of gentle tension, humor, or affection.\nThe characters may be human, non-human, or from entirely fantastical settings — ensure the situation makes sense within their universe.\nLet the story unfold with subtle emotional shifts and interaction that feels alive, reactive, and immersive.\n`; break;
             case '성인': situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe situation should escalate organically toward mature themes or intimacy, depending on the emotional and physical progression of the scene.\nIf sexual intercourse has not yet occurred, the character must act assertively according to the situation—initiating physical closeness, deepening tension, or shifting setting and posture to increase sensuality.\nIf the scene is already mid-intercourse, the character must introduce new positions, kinks, or climax dynamics to maintain narrative intensity.\nFocus on the character’s inner desires, sensations, and actions with heightened sensual and emotional detail, in accordance with persona rules.\nUse nuanced, vivid language and avoid abrupt pacing or out-of-character behavior. All development must feel inevitable and immersive.\n`; break;
             case '돌발': default: situationPromptText = `\nYou are writing a first-person narrative as the character ${botName}.\nThe scene has stalled or lost momentum. You must now introduce a new turning point:\neither escalate the current situation, or introduce a **sudden, immersive event**\nthat dramatically changes the mood or setting.\nWrite in a sensory-rich, novel-style format with emphasis on *physical actions, emotional reactions*, and subtle tension.\nUse minimal but meaningful dialogue only when needed. Avoid repetition and do not reference the user's past prompts.\nDo not break character. Maintain continuity in tone and theme. Output should feel seamless in the flow of the story.\n`; break;
         }

        // API 호출을 위한 데이터 준비 (시스템 프롬프트 + 전체 대화 + 상황 요청)
        const textOnlyHistory = conversationHistory.filter(entry => entry.messageData?.type === 'text');
        const contentsForApi = [
             { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
             ...textOnlyHistory.map(entry => ({
                 role: entry.role === 'model' ? 'model' : 'user',
                 parts: [{ text: entry.messageData.text }]
             })),
             { role: "user", parts: [{ text: situationPromptText }] } // 상황 요청 프롬프트 추가
        ];

        console.log(`Sending situation request ('${type}') to API...`);
        let botReplyText = '';

        // ==================================================
        // <<< 중요: 실제 API 호출 부분 >>>
        /*
        try {
            const res = await fetch(`/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: contentsForApi })
            });
            console.log("Situation API response status:", res.status);

            if (!res.ok) {
                 const errorBody = await res.text();
                 console.error(`Situation API Error (${res.status}): ${errorBody}`);
                 botReplyText = `(상황 요청 실패: 서버 오류 ${res.status})`;
            } else {
                 const data = await res.json();
                 botReplyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(빈 응답)";
                 console.log("Situation Response:", botReplyText);
            }
        } catch (fetchError) {
            console.error("Fetch Error sending situation request:", fetchError);
            botReplyText = "(상황 요청 통신 오류 발생)";
        }
        */
        // --------------------------------------------------
        // <<< 임시 코드: API 호출 대신 더미 텍스트 사용 >>>
         await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 딜레이
         botReplyText = `*상황(${type}) 요청에 대한 봇 응답 시뮬레이션:* ${type} 상황에 맞는 새로운 전개가 시작됩니다. API 연결 시 실제 내용이 표시됩니다.`;
         console.log("Using dummy situation reply.");
        // ==================================================


        // 봇 응답을 대화 기록에 추가하고 화면에 표시
        const botMessageEntry = { role: "model", messageData: { type: 'text', text: botReplyText } };
        conversationHistory.push(botMessageEntry);
        appendMessage("bot", botMessageEntry.messageData, conversationHistory.length - 1);
        saveConversationHistory(); // 봇 응답까지 저장

    } catch (error) {
        console.error("Error in sendSituationRequest process:", error);
        appendMessage("bot", { type: 'text', text: `(상황 요청 처리 중 오류 발생: ${error.message})` });
    } finally {
        // 로딩 종료: 버튼 활성화 및 스피너 숨김
        console.log("Finishing situation request.");
        if(sendButton) sendButton.disabled = false;
        if(userInput) userInput.disabled = false;
        if(actionMenuButton) actionMenuButton.disabled = false;
        if(loadingSpinner) loadingSpinner.style.display = 'none';
        if(feedbackButton) feedbackButton.disabled = false;

        if(userInput) userInput.focus();
        if(chat) chat.scrollTop = chat.scrollHeight;
    }
}


// 이미지 URL 미리보기 업데이트 (이미지 없을 시 Placeholder 표시 제어)
function updateImagePreview(imageUrl, imgElement) {
    const previewArea = imgElement?.closest('.image-preview-area'); // 부모 .image-preview-area 찾기
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

// 슬롯 버튼 스타일 업데이트
function updateSlotButtonStyles() {
    try {
        const slotButtons = document.querySelectorAll('.slot-button');
        if (!slotButtons || slotButtons.length === 0) return;

        slotButtons.forEach(button => {
            if (parseInt(button.textContent) === currentSlot) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    } catch (e) { console.error("Error updating slot button styles:", e); }
}

// --- 랜덤 생성 함수 (임시 Placeholder) ---
async function generateRandomCharacter() {
    alert("🎲 랜덤 캐릭터 생성 기능은 아직 구현되지 않았습니다.");
    // TODO: 여기에 랜덤 캐릭터 정보 생성 로직 추가 (예: API 호출 또는 미리 정의된 데이터 사용)
    // 예시: botNameInputModal.value = "랜덤 봇"; botAgeInputModal.value = "25"; ...
    // updateSystemPrompt(); // 정보 변경 후 프롬프트 업데이트
}
async function generateRandomUser() {
    alert("🎲 랜덤 사용자 생성 기능은 아직 구현되지 않았습니다.");
    // TODO: 여기에 랜덤 사용자 정보 생성 로직 추가
    // 예시: userNameInputModal.value = "랜덤 유저"; userAgeInputModal.value = "30"; ...
    // updateSystemPrompt(); // 정보 변경 후 프롬프트 업데이트
}

// 이미지 미리보기 클릭 시 URL 입력 (임시 Placeholder)
function promptForImageUrl(targetPreviewElement, isBot) {
    const currentUrl = targetPreviewElement.src && targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : '';
    const newUrl = prompt(isBot ? "캐릭터 이미지 URL을 입력하세요:" : "사용자 이미지 URL을 입력하세요:", currentUrl);

    if (newUrl !== null) { // 사용자가 취소하지 않은 경우
        if (newUrl === "" || /^(https?:\/\/).*\.(jpe?g|png|gif|webp|bmp)$/i.test(newUrl)) { // 비어있거나 유효한 URL 형식
            updateImagePreview(newUrl, targetPreviewElement); // 미리보기 업데이트
             // 전역 변수도 업데이트 (선택적 - 저장 시 최종 반영됨)
             if (isBot) {
                 botProfileImgUrl = newUrl;
                 if(botImagePreview) botImagePreview.src = newUrl; // 모달 내 이미지 직접 업데이트
             } else {
                 userProfileImgUrl = newUrl;
                 if(userImagePreview) userImagePreview.src = newUrl; // 모달 내 이미지 직접 업데이트
             }
             // updateSystemPrompt(); // 실시간 반영 원하면 호출
        } else {
            alert("유효한 이미지 URL 형식이 아닙니다. (http(s)://로 시작하고 이미지 확장자로 끝나야 합니다)");
        }
    }
}

// 채팅 이미지 삽입 함수 (임시 Placeholder - URL 입력 방식)
function sendImageChatMessage() {
    closeActionMenu(); // 액션 메뉴 닫기
    const imageUrl = prompt("채팅에 삽입할 이미지 URL을 입력하세요:");
    if (imageUrl && /^(https?:\/\/).*\.(jpe?g|png|gif|webp|bmp)$/i.test(imageUrl)) {
         // sendMessage 함수가 이미지 URL을 감지하도록 userInput에 넣고 전송 시뮬레이션
         if (userInput) {
             userInput.value = imageUrl; // 입력 필드에 URL 설정
             sendMessage(imageUrl); // sendMessage 함수 호출 (내부에서 처리)
         } else {
             // userInput이 없을 경우 직접 처리 (대안)
             console.warn("userInput element not found, appending image directly.");
             const imageMessageEntry = { role: "user", messageData: { type: 'image', url: imageUrl } };
             conversationHistory.push(imageMessageEntry);
             appendMessage("user", imageMessageEntry.messageData, conversationHistory.length - 1);
             saveConversationHistory();
             if(chat) chat.scrollTop = chat.scrollHeight;
         }
    } else if (imageUrl !== null) { // 사용자가 입력했지만 유효하지 않은 경우
        alert("유효한 이미지 URL 형식이 아닙니다.");
    }
}

// 피드백 선택 처리 (UI 업데이트 및 전역 변수 설정)
function handleFeedbackSelection(feedbackType) {
    console.log(`Feedback selected: ${feedbackType}`);

    // 모든 피드백 버튼에서 'active' 클래스 제거
    if (feedbackOptionsContainer) {
        feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    if (feedbackType) {
        // 선택된 피드백 버튼에 'active' 클래스 추가
        const selectedButton = feedbackOptionsContainer?.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        currentFeedback = feedbackType; // 전역 변수에 현재 피드백 저장
        // 피드백 선택 후 옵션 숨기기 (선택적)
        // if (feedbackOptionsContainer) feedbackOptionsContainer.classList.add('hidden');
        // if (feedbackButton) feedbackButton.classList.remove('active');
    } else {
        // 피드백 해제 (null 전달 시)
        currentFeedback = null;
         // 피드백 옵션 컨테이너 숨기기 및 버튼 비활성화 (선택적)
         if (feedbackOptionsContainer) feedbackOptionsContainer.classList.add('hidden');
         if (feedbackButton) feedbackButton.classList.remove('active');
    }
    console.log("Current feedback set to:", currentFeedback);
}

// --- 대화 기록 관리 ---
function saveConversationHistory() {
    try {
        if (conversationHistory && conversationHistory.length > 0) {
            localStorage.setItem(`conversation_slot_${currentSlot}`, JSON.stringify(conversationHistory));
            // console.log(`Conversation saved for slot ${currentSlot}. Length: ${conversationHistory.length}`);
        } else {
            // 대화 내용이 비었으면 저장된 기록도 삭제
            localStorage.removeItem(`conversation_slot_${currentSlot}`);
            // console.log(`Empty conversation. Removed saved history for slot ${currentSlot}.`);
        }
    } catch (e) { console.error("Error saving conversation history:", e); }
}

function loadConversationHistory() {
    try {
        const savedHistory = localStorage.getItem(`conversation_slot_${currentSlot}`);
        if (savedHistory) {
            try {
                conversationHistory = JSON.parse(savedHistory);
                // 파싱 결과가 배열이 아니면 초기화
                if (!Array.isArray(conversationHistory)) {
                     console.warn(`Loaded conversation for slot ${currentSlot} is not an array. Resetting.`);
                     conversationHistory = [];
                     localStorage.removeItem(`conversation_slot_${currentSlot}`);
                }
            } catch (e) {
                console.error("Error parsing conversation history:", e);
                conversationHistory = []; // 파싱 오류 시 초기화
                localStorage.removeItem(`conversation_slot_${currentSlot}`); // 손상된 데이터 제거
            }
        } else {
            conversationHistory = []; // 저장된 기록 없으면 초기화
        }
        console.log(`Conversation loaded for slot ${currentSlot}. Length: ${conversationHistory.length}`);

        // 채팅창 비우고 새로 로드
        if (chat) {
            chat.innerHTML = ''; // 기존 내용 모두 제거
            conversationHistory.forEach((entry, index) => {
                // 시스템 프롬프트는 화면에 표시하지 않음 (선택적)
                if (!(entry.role === 'user' && entry.messageData?.text === SYSTEM_PROMPT)) {
                    appendMessage(entry.role === 'model' ? 'bot' : 'user', entry.messageData, index);
                }
            });
            // 로드 후 스크롤 맨 아래로
            chat.scrollTop = chat.scrollHeight;
        } else {
            console.error("Cannot load conversation to screen: chat element not found.");
        }

    } catch (e) { console.error("Error loading conversation history:", e); conversationHistory = []; }
}

function resetConversation() {
    if (confirm("정말로 현재 슬롯의 대화 기록을 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
        console.log(`Resetting conversation for slot ${currentSlot}`);
        conversationHistory = [];
        saveConversationHistory(); // 빈 기록 저장 (== 삭제)
        loadConversationHistory(); // 화면 갱신
        appendInitialNotice(); // 초기 안내 메시지 다시 표시 (선택적)
        alert(`슬롯 ${currentSlot}의 대화 기록이 초기화되었습니다.`);
    }
}

// --- 메뉴/모달 관리 함수 ---
function openSettingsModal() {
    if (settingsModalOverlay && settingsModal) {
        settingsModalOverlay.style.display = 'flex';
        // 애니메이션을 위한 클래스 추가 (CSS에 정의 필요)
        settingsModal.classList.remove('modal-fade-out'); // 이전 애니메이션 제거
        settingsModal.classList.add('modal-fade-in');
        console.log("Settings modal opened.");
    } else { console.error("Cannot open settings modal: Elements missing."); }
}

function closeSettingsModal() {
    if (settingsModalOverlay && settingsModal) {
        settingsModal.classList.remove('modal-fade-in');
        // 즉시 숨기거나, fade-out 애니메이션 후 숨길 수 있음
        // settingsModal.classList.add('modal-fade-out');
        // setTimeout(() => { // 애니메이션 시간 후 숨김
        settingsModalOverlay.style.display = 'none';
        // }, 200); // CSS 애니메이션 시간과 일치
        console.log("Settings modal closed.");
    } else { console.error("Cannot close settings modal: Elements missing."); }
}

function toggleActionMenu() {
    if (actionMenu && menuOverlay) {
        const isVisible = actionMenu.classList.contains('visible');
        if (isVisible) {
            actionMenu.classList.remove('visible');
            menuOverlay.style.display = 'none';
             // 하위 메뉴(상황 옵션)도 닫기
             if (situationOptions && !situationOptions.classList.contains('hidden')) {
                 situationOptions.classList.add('hidden');
             }
            console.log("Action menu closed.");
        } else {
            actionMenu.classList.add('visible');
            menuOverlay.style.display = 'block'; // 또는 flex/grid
            console.log("Action menu opened.");
            // 다른 팝업(피드백)은 닫기 (선택적)
            closeFeedbackOptions();
        }
    } else { console.error("Cannot toggle action menu: Elements missing."); }
}

function closeActionMenu() {
    if (actionMenu && menuOverlay && actionMenu.classList.contains('visible')) {
        actionMenu.classList.remove('visible');
        menuOverlay.style.display = 'none';
         if (situationOptions && !situationOptions.classList.contains('hidden')) {
             situationOptions.classList.add('hidden');
         }
        console.log("Action menu closed by other action.");
    }
}

function toggleSituationOptions(event) {
    event.stopPropagation(); // 액션 메뉴가 닫히지 않도록 전파 중단
    if (situationOptions) {
        situationOptions.classList.toggle('hidden');
        console.log("Situation options toggled.");
    } else { console.error("Cannot toggle situation options: Element missing."); }
}

function toggleFeedbackOptions(event) {
    event.stopPropagation(); // 이벤트 전파 중단
    if (feedbackOptionsContainer && feedbackButton) {
        const willBeVisible = feedbackOptionsContainer.classList.toggle('hidden');
        feedbackButton.classList.toggle('active', !willBeVisible); // 버튼 활성 상태 토글
        console.log(`Feedback options ${willBeVisible ? 'hidden' : 'shown'}.`);
        // 액션 메뉴는 닫기 (선택적)
        if (!willBeVisible) { // 피드백 옵션이 보여질 때
             closeActionMenu();
        }
    } else { console.error("Cannot toggle feedback options: Elements missing."); }
}

function closeFeedbackOptions() {
     if (feedbackOptionsContainer && feedbackButton && !feedbackOptionsContainer.classList.contains('hidden')) {
        feedbackOptionsContainer.classList.add('hidden');
        feedbackButton.classList.remove('active');
        console.log("Feedback options closed by other action.");
     }
}

// --- DOMContentLoaded 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    try {
        console.log("Assigning DOM elements...");
        // --- 필수 DOM 요소 할당 ---
        chat = getElement('chat');
        userInput = getElement('userInput');
        sendButton = getElement('sendButton');
        loadingSpinner = getElement('loadingSpinner');
        actionMenuButton = getElement('actionMenuButton');
        actionMenu = getElement('actionMenu');
        menuOverlay = getElement('menuOverlay'); // 액션 메뉴 배경 오버레이
        sidebarToggle = getElement('sidebarToggle');
        settingsModalOverlay = getElement('settingsModalOverlay');
        settingsModal = getElement('settingsModal');
        closeModalButton = getElement('closeModalButton');
        saveSettingsButtonModal = getElement('saveSettingsButtonModal');
        feedbackButton = getElement('feedbackButton');
        feedbackOptionsContainer = getElement('feedbackOptionsContainer');

        // --- 모달 내부 요소 할당 ---
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
        generateRandomCharacterButton = getElement('generateRandomCharacter', false); // 선택적 요소
        generateRandomUserButton = getElement('generateRandomUser', false);       // 선택적 요소

        // --- 액션 메뉴 내부 버튼 할당 ---
        menuImageButton = getElement('menuImageButton', false);
        menuSituationButton = getElement('menuSituationButton', false);
        menuExportTxtButton = getElement('menuExportTxtButton', false);
        menuSummarizeButton = getElement('menuSummarizeButton', false);
        situationOptions = getElement('situationOptions', false);

        // --- 기타 요소 할당 ---
        imageOverlay = getElement('imageOverlay', false); // 이미지 확대 오버레이
        overlayImage = getElement('overlayImage', false);   // 확대될 이미지 요소

        console.log("Essential DOM elements assigned. Attaching event listeners...");

        // --- 이벤트 리스너 연결 (요소 존재 확인 후) ---

        // 메시지 전송
        if (sendButton) sendButton.addEventListener("click", () => { if(userInput) sendMessage(userInput.value); });
        if (userInput) userInput.addEventListener("keydown", function(event) {
             // 한글 입력 중 Enter 키(keyCode 229) 오류 방지 및 Shift+Enter 처리
            if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
                event.preventDefault(); // 기본 Enter 동작(줄바꿈) 방지
                sendMessage(userInput.value);
            }
        });
        if (userInput) userInput.addEventListener('input', autoResizeTextarea); // Textarea 자동 높이 조절

        // 액션 메뉴 (+) 버튼
        if (actionMenuButton) actionMenuButton.addEventListener("click", (event) => {
            event.stopPropagation(); // 중요: document 클릭 리스너에 영향 안 주도록
            toggleActionMenu();
        });
        // 액션 메뉴 배경 오버레이 클릭 시 메뉴 닫기
        if (menuOverlay) menuOverlay.addEventListener("click", closeActionMenu);

        // 액션 메뉴 내부 버튼들
        if (menuImageButton) menuImageButton.addEventListener("click", sendImageChatMessage);
        if (menuSituationButton) menuSituationButton.addEventListener("click", toggleSituationOptions);
        if (situationOptions) {
            situationOptions.querySelectorAll(".option").forEach(option => {
                option.addEventListener("click", (event) => {
                    event.stopPropagation(); // 중요
                    const type = option.textContent.trim(); // 버튼 텍스트 가져오기
                    if (type) {
                         sendSituationRequest(type); // 상황 요청 함수 호출
                    }
                    // 상황 요청 후 메뉴 닫기
                    closeActionMenu();
                });
            });
        }
        if (menuExportTxtButton) menuExportTxtButton.addEventListener("click", exportConversationAsTxt);
        if (menuSummarizeButton) menuSummarizeButton.addEventListener("click", summarizeConversation);

        // 설정 모달 (≡) 버튼
        if (sidebarToggle) sidebarToggle.addEventListener("click", openSettingsModal);
        if (closeModalButton) closeModalButton.addEventListener("click", closeSettingsModal);
        // 모달 오버레이 클릭 시 닫기 (모달 콘텐츠 클릭 시에는 닫히지 않도록)
        if (settingsModalOverlay) settingsModalOverlay.addEventListener("click", function(event) {
            if (event.target === settingsModalOverlay) { // 클릭된 요소가 오버레이 자체인지 확인
                closeSettingsModal();
            }
        });
        // 설정 저장 버튼
        if (saveSettingsButtonModal) saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));

        // 설정 슬롯 버튼들
        document.querySelectorAll('.slot-button').forEach(button => {
            button.addEventListener('click', function() {
                const slotNum = parseInt(this.textContent);
                if (!isNaN(slotNum) && slotNum !== currentSlot) {
                    if (confirm(`슬롯 ${slotNum}으로 전환하시겠습니까? 현재 슬롯 ${currentSlot}의 설정 및 대화 기록이 로드됩니다.`)) {
                         currentSlot = slotNum;
                         console.log(`Switched to slot ${currentSlot}`);
                         loadSettings(currentSlot); // 해당 슬롯 설정 로드
                         loadConversationHistory(); // 해당 슬롯 대화 기록 로드
                         appendInitialNotice(); // 필요시 초기 메시지 표시
                    }
                } else if (slotNum === currentSlot) {
                     alert(`이미 슬롯 ${currentSlot}이 활성화되어 있습니다.`);
                }
            });
        });

        // 랜덤 생성 버튼 (임시)
        if (generateRandomCharacterButton) generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
        if (generateRandomUserButton) generateRandomUserButton.addEventListener('click', generateRandomUser);

        // 이미지 미리보기 클릭 (URL 입력)
        if (botImagePreview) botImagePreview.closest('.image-preview-area')?.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
        if (userImagePreview) userImagePreview.closest('.image-preview-area')?.addEventListener('click', () => promptForImageUrl(userImagePreview, false));

        // 피드백 (O) 버튼
        if (feedbackButton) feedbackButton.addEventListener("click", toggleFeedbackOptions);
        // 피드백 옵션 버튼들
        if (feedbackOptionsContainer) {
            feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => {
                button.addEventListener('click', function(event) {
                    event.stopPropagation(); // 중요
                    const feedback = this.dataset.feedback; // data-feedback 속성 값 가져오기
                    handleFeedbackSelection(feedback); // 피드백 처리 함수 호출
                    // 피드백 선택 후 옵션 숨기기 (선택적)
                    // closeFeedbackOptions();
                });
            });
        }

        // 문서 전체 클릭 시 열려있는 메뉴/팝업 닫기 (선택적이지만 유용함)
        document.addEventListener('click', function(event) {
            // 액션 메뉴 닫기 (버튼 제외)
            if (actionMenu && actionMenuButton && !actionMenu.contains(event.target) && event.target !== actionMenuButton) {
                 closeActionMenu();
            }
            // 피드백 옵션 닫기 (버튼 제외)
            if (feedbackOptionsContainer && feedbackButton && !feedbackOptionsContainer.contains(event.target) && event.target !== feedbackButton) {
                 closeFeedbackOptions();
            }
        });


        console.log("Event listeners attached.");
        console.log("Running initial setup...");
        initializeChat(); // 초기화 함수 호출
        console.log("Initialization complete.");

    } catch (e) {
        console.error("Error during DOMContentLoaded setup:", e);
        alert("페이지 초기화 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
}); // DOMContentLoaded 끝

console.log("Script loaded and parsed.");
