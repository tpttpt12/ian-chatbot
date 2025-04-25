// --- 전역 변수 (최소화) ---
let currentSlot = 1;
let currentFeedback = null; // 피드백 상태 변수는 유지 (토글 로직 확인용)
console.log("Global variables initialized (Minimal).");

// --- DOM 요소 변수 ---
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

// --- 함수 정의 (단순 로그 출력용) ---
console.log("Defining placeholder functions...");

function openImageOverlay(element) { console.log(">> openImageOverlay called"); }
function closeImageOverlay() { console.log(">> closeImageOverlay called"); }
function autoResizeTextarea() { console.log(">> autoResizeTextarea called"); }
function saveSettings(slotNumber) { console.log(`>> saveSettings called for slot ${slotNumber}`); alert(`슬롯 ${slotNumber} 저장 시뮬레이션`); }
function loadSettings(slotNumber) { console.log(`>> loadSettings called for slot ${slotNumber}`); }
function updateSystemPrompt() { console.log(">> updateSystemPrompt called"); }
function initializeChat() {
    console.log(">> initializeChat called");
    try {
        updateSlotButtonStyles(); // 슬롯 스타일 업데이트는 유지
        if(chat) chat.innerHTML = '<div>채팅창 초기화됨 (테스트 모드)</div>'; // 채팅창 비우기
        console.log(">> Chat initialized (Minimal).");
    } catch(e) { console.error("Error in initializeChat (Minimal):", e); }
}
function appendMessage(role, messageData, index = -1) { console.log(`>> appendMessage called for ${role}`); }
function exportConversationAsTxt() { console.log(">> exportConversationAsTxt called"); alert("TXT 내보내기 기능 테스트"); }
async function summarizeConversation() { console.log(">> summarizeConversation called"); alert("요약 기능 테스트"); }
async function sendMessage(messageText) { console.log(`>> sendMessage called with text: ${messageText}`); alert(`메시지 전송 시뮬레이션: ${messageText}`);}
// *** sendSituationRequest 함수는 내용을 비웁니다 (호출되는지만 확인) ***
async function sendSituationRequest(type) { console.log(`>> sendSituationRequest called with type: ${type}`); alert(`상황 [${type}] 생성 시뮬레이션`); }
function updateImagePreview(imageUrl, imgElement) { console.log(`>> updateImagePreview called`); }
function updateSlotButtonStyles() { console.log(">> updateSlotButtonStyles called"); try { document.querySelectorAll('.slot-button').forEach(button => { button.classList.toggle('active', parseInt(button.textContent) === currentSlot); }); } catch(e){ console.error("Error updating slot styles", e);}}
async function generateRandomCharacter() { console.log(">> generateRandomCharacter called"); alert("랜덤 캐릭터 생성 테스트"); }
async function generateRandomUser() { console.log(">> generateRandomUser called"); alert("랜덤 사용자 생성 테스트"); }
function promptForImageUrl(targetPreviewElement, isBot) { console.log(`>> promptForImageUrl called for ${isBot ? 'Bot' : 'User'}`); alert("이미지 URL 입력 테스트"); }
function sendImageChatMessage() { console.log(">> sendImageChatMessage called"); alert("채팅 이미지 삽입 테스트"); }
function handleFeedbackSelection(feedbackType) {
    console.log(`>> handleFeedbackSelection called with type: ${feedbackType}`);
    try {
        if (!feedbackOptionsContainer || !feedbackButton || !menuOverlay) return;
        const feedbackOptions = feedbackOptionsContainer.querySelectorAll('.feedback-option');
        feedbackOptions.forEach(btn => btn.classList.remove('active'));
        if (currentFeedback === feedbackType) { currentFeedback = null; feedbackButton.classList.remove('active'); }
        else { currentFeedback = feedbackType; feedbackButton.classList.add('active'); if (feedbackType) { const selectedButton = feedbackOptionsContainer.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`); if (selectedButton) selectedButton.classList.add('active'); } }
        console.log("Current Feedback:", currentFeedback);
        feedbackOptionsContainer.classList.add('hidden');
        menuOverlay.style.display = 'none';
    } catch (e) { console.error("Error in handleFeedbackSelection:", e); }
}
function saveConversationHistory() { console.log(">> saveConversationHistory called (Simulated)"); }
function loadConversationHistory() { console.log(">> loadConversationHistory called (Simulated)"); }
function resetConversation() { console.log(">> resetConversation called"); alert("대화 리셋 테스트"); }

// --- DOMContentLoaded 이벤트 리스너 (단순화된 로깅 및 기본 토글만) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired (Simplified Test Version).");
    try {
        // DOM 요소 할당 (Null 체크는 리스너에서)
        console.log("Assigning DOM elements...");
        chat = document.getElementById("chat");
        userInput = document.getElementById("userInput");
        sendButton = document.getElementById("sendButton");
        actionMenuButton = document.getElementById("actionMenuButton");
        actionMenu = document.getElementById("actionMenu");
        menuOverlay = document.getElementById("menuOverlay");
        menuImageButton = document.getElementById("menuImageButton");
        menuSituationButton = document.getElementById("menuSituationButton");
        menuExportTxtButton = document.getElementById("menuExportTxtButton");
        menuSummarizeButton = document.getElementById("menuSummarizeButton");
        situationOptions = document.getElementById("situationOptions");
        settingsModalOverlay = document.getElementById("settingsModalOverlay");
        closeModalButton = document.getElementById("closeModalButton");
        sidebarToggle = document.getElementById("sidebarToggle");
        botImagePreview = document.getElementById("botImagePreview");
        userImagePreview = document.getElementById("userImagePreview");
        saveSettingsButtonModal = document.getElementById("saveSettingsButtonModal");
        generateRandomCharacterButton = document.getElementById("generateRandomCharacter");
        generateRandomUserButton = document.getElementById("generateRandomUser");
        feedbackButton = document.getElementById("feedbackButton");
        feedbackOptionsContainer = document.getElementById("feedbackOptionsContainer");
        // Nullable 요소는 로드 시도만
        loadingSpinner = document.getElementById("loadingSpinner");
        imageOverlay = document.getElementById("imageOverlay");
        overlayImage = document.getElementById("overlayImage");
        settingsModal = document.getElementById("settingsModal");
        botNameInputModal = document.getElementById("botNameInputModal"); botAgeInputModal = document.getElementById("botAgeInputModal"); /* ... etc ... */
        userNameInputModal = document.getElementById("userNameInputModal"); /* ... etc ... */


        console.log("Assigning DOM elements complete. Attaching simplified listeners...");

        // --- 이벤트 리스너 연결 (기능 대신 로그 출력, 기본 토글 유지) ---
        if (sendButton) sendButton.addEventListener("click", () => { console.log(">>> Send button clicked"); sendMessage("테스트 메시지"); });
        if (userInput) userInput.addEventListener("keydown", function(event) { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { console.log(">>> Enter key pressed"); event.preventDefault(); sendMessage(userInput.value || "Enter 테스트"); } });
        if (actionMenuButton) actionMenuButton.addEventListener("click", function(event) { console.log(">>> Action menu (+) button clicked"); event.stopPropagation(); if(actionMenu) actionMenu.classList.toggle("visible"); if(menuOverlay) menuOverlay.style.display = actionMenu?.classList.contains("visible") ? 'block' : 'none'; if(situationOptions) situationOptions.classList.add("hidden"); if(feedbackOptionsContainer) feedbackOptionsContainer.classList.add('hidden'); });
        if (menuOverlay) menuOverlay.addEventListener("click", function() { console.log(">>> Menu overlay clicked"); if(actionMenu) actionMenu.classList.remove("visible"); if(situationOptions) situationOptions.classList.add("hidden"); if(feedbackOptionsContainer) feedbackOptionsContainer.classList.add('hidden'); if(menuOverlay) menuOverlay.style.display = 'none'; });
        if (menuImageButton) menuImageButton.addEventListener("click", () => { console.log(">>> Image button (in + menu) clicked"); sendImageChatMessage(); });
        if (menuSituationButton) menuSituationButton.addEventListener("click", function(event) { console.log(">>> Situation button (in + menu) clicked"); event.stopPropagation(); if(situationOptions) situationOptions.classList.toggle("hidden"); if(feedbackOptionsContainer) feedbackOptionsContainer.classList.add('hidden'); });
        if (situationOptions) situationOptions.querySelectorAll(".option").forEach(option => { option.addEventListener("click", (event) => { console.log(`>>> Situation option clicked: ${option.textContent}`); event.stopPropagation(); sendSituationRequest(option.textContent); if(situationOptions) situationOptions.classList.add("hidden"); if(actionMenu) actionMenu.classList.remove("visible"); if(menuOverlay) menuOverlay.style.display = 'none'; }); });
        if (menuExportTxtButton) menuExportTxtButton.addEventListener("click", () => { console.log(">>> Export button clicked"); exportConversationAsTxt(); });
        if (menuSummarizeButton) menuSummarizeButton.addEventListener("click", () => { console.log(">>> Summarize button clicked"); summarizeConversation(); });
        if (sidebarToggle) sidebarToggle.addEventListener("click", function() { console.log(">>> Sidebar toggle (≡) clicked"); if(settingsModalOverlay) settingsModalOverlay.style.display = 'flex'; /* 다른 메뉴 닫기 생략 */ });
        if (closeModalButton) closeModalButton.addEventListener("click", () => { console.log(">>> Close modal (X) button clicked"); if(settingsModalOverlay) settingsModalOverlay.style.display = 'none'; });
        if (settingsModalOverlay) settingsModalOverlay.addEventListener("click", function(event) { if (event.target === settingsModalOverlay) { console.log(">>> Modal overlay background clicked"); settingsModalOverlay.style.display = 'none'; } });
        if (saveSettingsButtonModal) saveSettingsButtonModal.addEventListener("click", () => { console.log(">>> Save Settings button clicked"); saveSettings(currentSlot); });
        document.querySelectorAll('.slot-button').forEach(button => { button.addEventListener('click', function() { console.log(`>>> Slot button ${this.textContent} clicked`); const slotNumber = parseInt(this.textContent); if (currentSlot !== slotNumber) { currentSlot = slotNumber; updateSlotButtonStyles(); /* 기능 비활성화 */ } }); });
        if (generateRandomCharacterButton) generateRandomCharacterButton.addEventListener('click', () => { console.log(">>> Random Character (🎲) button clicked"); generateRandomCharacter(); });
        if (generateRandomUserButton) generateRandomUserButton.addEventListener('click', () => { console.log(">>> Random User (🎲) button clicked"); generateRandomUser(); });
        if (botImagePreview) botImagePreview.addEventListener('click', () => { console.log(">>> Bot image preview clicked"); promptForImageUrl(botImagePreview, true); });
        if (userImagePreview) userImagePreview.addEventListener('click', () => { console.log(">>> User image preview clicked"); promptForImageUrl(userImagePreview, false); });
        if (feedbackButton) feedbackButton.addEventListener('click', function(event) { console.log(">>> Feedback (O) button clicked"); event.stopPropagation(); if(feedbackOptionsContainer) feedbackOptionsContainer.classList.toggle('hidden'); if(actionMenu) actionMenu.classList.remove("visible"); if(situationOptions) situationOptions.classList.add("hidden"); if(menuOverlay) menuOverlay.style.display = feedbackOptionsContainer?.classList.contains('hidden') ? 'none' : 'block'; });
        if (feedbackOptionsContainer) feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => { button.addEventListener('click', function(event) { console.log(`>>> Feedback option clicked: ${this.dataset.feedback}`); event.stopPropagation(); handleFeedbackSelection(this.dataset.feedback); }); });
        // userInput input 리스너는 일단 제거 (로그 너무 많음)
        // if (userInput) userInput.addEventListener('input', autoResizeTextarea);

        console.log("Simplified event listeners attached.");

        // --- 초기 로딩 (최소화) ---
        console.log("Running minimal initial setup...");
        initializeChat(); // 채팅창 비우기 등 최소한의 초기화
        console.log("Minimal initialization complete.");

    } catch (e) {
        console.error("Error during DOMContentLoaded setup:", e);
        alert("페이지 초기화 중 심각한 오류가 발생했습니다. 콘솔 로그를 확인해주세요.");
    }
}); // DOMContentLoaded 끝

console.log("Script loaded and parsed (Simplified Test Version).");
