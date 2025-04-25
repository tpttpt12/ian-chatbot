// --- 전역 변수 ---
let userProfileImgUrl = "";
let botProfileImgUrl = "";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1;
let currentFeedback = null;
// DEBUG 로그 제거됨: console.log("Global variables initialized.");

// --- SYSTEM_PROMPT 템플릿 (절대 수정 금지!) ---
const SYSTEM_PROMPT_TEMPLATE = `... (이전과 동일) ...`; // 내용은 동일하므로 축약

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
    if (required && !element) { console.error(`[Fatal] Required element with ID '${id}' not found in the DOM.`); }
    else if (!element && !required) { /* Optional 요소는 경고 안 함 */ }
    return element;
}
function getRandomElement(arr) { // emoji 등에 사용
    if (!arr || arr.length === 0) return '';
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- 함수 정의 ---
// DEBUG 로그 제거됨: console.log("Defining functions...");

// --- 메뉴/모달 관리 함수 (먼저 정의) ---
function openSettingsModal() {
    // DEBUG 로그 제거됨: console.log("[DEBUG] openSettingsModal function called.");
    if (!settingsModalOverlay || !settingsModal) { console.error("Cannot open settings modal: Overlay or Content Element is missing!"); settingsModalOverlay = getElement('settingsModalOverlay'); settingsModal = getElement('settingsModal'); if (!settingsModalOverlay || !settingsModal) { alert("오류: 설정 모달 요소를 찾을 수 없습니다. HTML을 확인해주세요."); return; } }
    try { settingsModalOverlay.style.display = 'flex'; settingsModalOverlay.classList.remove('modal-fade-out'); settingsModalOverlay.classList.add('modal-fade-in'); /* DEBUG 로그 제거됨 */ } catch (e) { console.error("Error occurred while trying to display modal:", e); alert("모달을 표시하는 중 자바스크립트 오류가 발생했습니다. 콘솔을 확인해주세요."); }
}
function closeSettingsModal() {
    // DEBUG 로그 제거됨: console.log("[DEBUG] closeSettingsModal function called.");
    if (!settingsModalOverlay || !settingsModal) { console.error("Cannot close settings modal: Overlay or Content Element is missing!"); return; }
    try { settingsModalOverlay.classList.remove('modal-fade-in'); settingsModalOverlay.classList.add('modal-fade-out'); setTimeout(() => { if (settingsModalOverlay.classList.contains('modal-fade-out')) { settingsModalOverlay.style.display = 'none'; settingsModalOverlay.classList.remove('modal-fade-out'); } }, 300); /* DEBUG 로그 제거됨 */ } catch (e) { console.error("Error occurred while trying to hide modal:", e); alert("모달을 닫는 중 자바스크립트 오류가 발생했습니다. 콘솔을 확인해주세요."); }
}
function toggleActionMenu() {
    // DEBUG 로그 제거됨: console.log("[DEBUG] toggleActionMenu called");
    if (actionMenu && menuOverlay) { const i = actionMenu.classList.contains('visible'); if (i) { closeActionMenu(); } else { closeFeedbackOptions(); actionMenu.classList.add('visible'); menuOverlay.style.display = 'block'; console.log("Action menu opened."); } } else { console.error("Cannot toggle action menu: Elements missing."); }
}
function closeActionMenu() {
    // DEBUG 로그 제거됨: console.log("[DEBUG] closeActionMenu called");
    if (actionMenu && menuOverlay && actionMenu.classList.contains('visible')) { actionMenu.classList.remove('visible'); menuOverlay.style.display = 'none'; if (situationOptions && !situationOptions.classList.contains('hidden')) { situationOptions.classList.add('hidden'); } console.log("Action menu closed."); }
}
function toggleSituationOptions(event) {
    // DEBUG 로그 제거됨: console.log("[DEBUG] toggleSituationOptions called");
    event.stopPropagation(); if (situationOptions) { situationOptions.classList.toggle('hidden'); console.log("Situation options toggled."); } else { console.error("Cannot toggle situation options: Element missing."); }
}
function toggleFeedbackOptions(event) {
    // DEBUG 로그 제거됨: console.log("[DEBUG] toggleFeedbackOptions called");
    event.stopPropagation(); if (feedbackOptionsContainer && feedbackButton) { const i = feedbackOptionsContainer.classList.contains('hidden'); if (i) { closeActionMenu(); feedbackOptionsContainer.classList.remove('hidden'); feedbackButton.classList.add('active'); console.log("Feedback options shown."); } else { feedbackOptionsContainer.classList.add('hidden'); if (!currentFeedback) { feedbackButton.classList.remove('active'); } console.log("Feedback options hidden."); } } else { console.error("Cannot toggle feedback options: Elements missing."); }
}
function closeFeedbackOptions() {
    // DEBUG 로그 제거됨: console.log("[DEBUG] closeFeedbackOptions called");
     if (feedbackOptionsContainer && feedbackButton && !feedbackOptionsContainer.classList.contains('hidden')) { feedbackOptionsContainer.classList.add('hidden'); if (!currentFeedback) { feedbackButton.classList.remove('active'); } console.log("Feedback options closed."); }
}

// --- 나머지 함수 정의 ---

// 이미지 오버레이
function openImageOverlay(element) {
    /* DEBUG 로그 제거됨 */ try { if (!imageOverlay) imageOverlay = getElement('imageOverlay', false); if (!overlayImage) overlayImage = getElement('overlayImage', false); if (!imageOverlay || !overlayImage || !element || !element.src || !element.src.startsWith('http')) { console.warn("Cannot open image overlay: Missing elements or invalid image source.", element?.src); return; } overlayImage.src = element.src; imageOverlay.style.display = "flex"; } catch (e) { console.error("Error in openImageOverlay:", e); }
}
function closeImageOverlay() {
    /* DEBUG 로그 제거됨 */ try { if (!imageOverlay) imageOverlay = getElement('imageOverlay', false); if (!overlayImage) overlayImage = getElement('overlayImage', false); if (!imageOverlay || !overlayImage) return; overlayImage.src = ""; imageOverlay.style.display = "none"; } catch (e) { console.error("Error in closeImageOverlay:", e); }
}
// Textarea 높이 조절
function autoResizeTextarea() {
    try { if (!this || typeof this.style === 'undefined' || this.tagName !== 'TEXTAREA') { return; } this.style.height = 'auto'; this.style.overflowY = 'hidden'; const c = getComputedStyle(this); const l = parseFloat(c.lineHeight) || 18; const pt = parseFloat(c.paddingTop) || 0; const pb = parseFloat(c.paddingBottom) || 0; const bt = parseFloat(c.borderTopWidth) || 0; const bb = parseFloat(c.borderBottomWidth) || 0; const v = pt + pb + bt + bb; const o = l + v; const t = (l * 2) + v; const m = o; const h = this.scrollHeight; if (h > t + 2) { this.style.height = t + 'px'; this.style.overflowY = 'auto'; } else { this.style.height = Math.max(h, m) + 'px'; this.style.overflowY = 'hidden'; } } catch (e) { console.error("Error in autoResizeTextarea:", e); }
}
// 설정 저장
function saveSettings(slotNumber) {
    /* DEBUG 로그 제거됨 */ try { if (!botNameInputModal || !botAgeInputModal || !botGenderInputModal || !botAppearanceInputModal || !botPersonaInputModal || !botImagePreview || !userNameInputModal || !userAgeInputModal || !userGenderInputModal || !userAppearanceInputModal || !userGuidelinesInputModal || !userImagePreview) { console.error("Cannot save settings: Modal input elements are missing."); alert("설정 저장에 필요한 입력 필드를 찾을 수 없습니다."); return; } const s = { botName: botNameInputModal.value || '', botAge: botAgeInputModal.value || '', botGender: botGenderInputModal.value || '', botAppearance: botAppearanceInputModal.value || '', botPersona: botPersonaInputModal.value || '', botImageUrl: botImagePreview.src && botImagePreview.src.startsWith('http') ? botImagePreview.src : '', userName: userNameInputModal.value || '', userAge: userAgeInputModal.value || '', userGender: userGenderInputModal.value || '', userAppearance: userAppearanceInputModal.value || '', userGuidelines: userGuidelinesInputModal.value || '', userImageUrl: userImagePreview.src && userImagePreview.src.startsWith('http') ? userImagePreview.src : '' }; localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(s)); alert(`설정 슬롯 ${slotNumber}에 저장되었습니다.`); userProfileImgUrl = s.userImageUrl; botProfileImgUrl = s.botImageUrl; updateSystemPrompt(); closeSettingsModal(); } catch (e) { console.error("Error in saveSettings:", e); alert("설정 저장 중 오류가 발생했습니다."); }
}
// 설정 로드
function loadSettings(slotNumber) {
    /* DEBUG 로그 제거됨 */ try { const d = localStorage.getItem(`settings_slot_${slotNumber}`); let s = {}; if (d) { try { s = JSON.parse(d); if (typeof s !== 'object' || s === null) { s = {}; console.warn(`Parsed settings for slot ${slotNumber} is not an object. Resetting.`); localStorage.removeItem(`settings_slot_${slotNumber}`); } } catch (e) { console.error("Failed to parse settings for slot " + slotNumber + ":", e); localStorage.removeItem(`settings_slot_${slotNumber}`); s = {}; } } if(botNameInputModal) botNameInputModal.value = s.botName || ''; if(botAgeInputModal) botAgeInputModal.value = s.botAge || ''; if(botGenderInputModal) botGenderInputModal.value = s.botGender || ''; if(botAppearanceInputModal) botAppearanceInputModal.value = s.botAppearance || ''; if(botPersonaInputModal) botPersonaInputModal.value = s.botPersona || ''; if(botImagePreview) updateImagePreview(s.botImageUrl || '', botImagePreview); if(userNameInputModal) userNameInputModal.value = s.userName || ''; if(userAgeInputModal) userAgeInputModal.value = s.userAge || ''; if(userGenderInputModal) userGenderInputModal.value = s.userGender || ''; if(userAppearanceInputModal) userAppearanceInputModal.value = s.userAppearance || ''; if(userGuidelinesInputModal) userGuidelinesInputModal.value = s.userGuidelines || ''; if(userImagePreview) updateImagePreview(s.userImageUrl || '', userImagePreview); userProfileImgUrl = s.userImageUrl || ""; botProfileImgUrl = s.botImageUrl || ""; updateSystemPrompt(); updateSlotButtonStyles(); } catch (e) { console.error("Error in loadSettings:", e); }
}
// SYSTEM_PROMPT 업데이트
function updateSystemPrompt() {
    try { const bn = botNameInputModal?.value || "캐릭터"; const ba = botAgeInputModal?.value || "불명"; const bap = botAppearanceInputModal?.value || "알 수 없음"; const bp = botPersonaInputModal?.value || "설정 없음"; const un = userNameInputModal?.value || "사용자"; const ua = userAgeInputModal?.value || "불명"; const uap = userAppearanceInputModal?.value || "알 수 없음"; const ug = userGuidelinesInputModal?.value || "설정 없음"; SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE.replace(/{botName}/g, bn).replace(/{botAge}/g, ba).replace(/{botAppearance}/g, bap).replace(/{botPersona}/g, bp).replace(/{userName}/g, un).replace(/{userAge}/g, ua).replace(/{userAppearance}/g, uap).replace(/{userGuidelines}/g, ug); } catch (e) { console.error("Error in updateSystemPrompt:", e); }
}
// 초기화
function initializeChat() {
    /* DEBUG 로그 제거됨 */ try { loadSettings(currentSlot); loadConversationHistory(); if(userInput) autoResizeTextarea.call(userInput); /* appendInitialNotice 호출은 loadConversationHistory 내부로 이동 */ console.log("Chat initialized successfully."); } catch (e) { console.error("Error during initializeChat:", e); }
}
// 초기 공지 메시지 (채팅창 로드 시 항상 보이도록 수정됨)
function appendInitialNotice() {
    /* DEBUG 로그 제거됨 */ try { if (chat /* && !chat.querySelector('.initial-notice') - 이 조건 제거 */) { // 항상 추가 시도
        // 기존 공지 삭제 (중복 방지)
        const existingNotice = chat.querySelector('.initial-notice');
        if(existingNotice) existingNotice.remove();

        const n = document.createElement('div'); n.className = 'initial-notice'; n.innerHTML = `대화를 시작하세요! 설정(≡)에서 캐릭터와 사용자 정보를 변경할 수 있습니다.<br><div class="notice-divider"></div>`;
        // 채팅창 맨 위에 추가
        if (chat.firstChild) { chat.insertBefore(n, chat.firstChild); } else { chat.appendChild(n); }
     } } catch(e) { console.error("Error appending initial notice:", e); }
}
// 메시지를 채팅창에 추가 (삭제 로직 포함)
function appendMessage(role, messageData, index = -1) {
    try { if (!chat) { console.error("Chat element not found in appendMessage"); return; } const i = typeof index === 'number' && index >= 0 && index < conversationHistory.length; if (messageData.type === 'image') { const c = document.createElement("div"); c.className = `image-announcement ${role}`; if (i) { c.dataset.index = index; } const f = document.createElement("div"); f.className = "image-fade-container"; const m = document.createElement("img"); m.className = "chat-image"; m.src = messageData.url; m.alt = "채팅 이미지"; m.loading = 'lazy'; m.onclick = () => openImageOverlay(m); m.onerror = function() { console.warn(`Failed to load chat image: ${this.src}`); this.onerror = null; const e = document.createElement('div'); e.textContent = "(이미지 로드 실패)"; e.className = 'image-error-text'; c.innerHTML = ''; c.appendChild(e); }; const b = document.createElement("button"); b.className = "delete-btn chat-image-delete-btn"; b.textContent = "✕"; b.title = "이미지 삭제"; b.onclick = () => { if (!i) { c.remove(); console.warn("Deleted temporary image message (not in history)."); return; } const x = parseInt(c.dataset.index); if (!isNaN(x) && x >= 0 && x < conversationHistory.length && conversationHistory[x] && conversationHistory[x].messageData.url === messageData.url) { if (confirm("이 이미지를 삭제하시겠습니까?")) { conversationHistory.splice(x, 1); saveConversationHistory(); loadConversationHistory(); } } else { console.error("Cannot delete image from history: Invalid index or message mismatch.", x, conversationHistory.length); alert("이미지 삭제 중 오류가 발생했습니다."); c.remove(); } }; f.appendChild(m); c.appendChild(f); c.appendChild(b); chat.appendChild(c); } else { const o = document.createElement("div"); o.className = `message-container ${role}`; if (i) { o.dataset.index = index; } const p = document.createElement("div"); p.className = "profile-area"; const g = document.createElement("div"); g.style.position = 'relative'; const u = (role === 'user' ? userProfileImgUrl : botProfileImgUrl); const n = (role === 'user' ? (userNameInputModal?.value || "사용자") : (botNameInputModal?.value || "캐릭터")); const l = document.createElement("div"); l.className = "profile-fallback"; l.title = `${n} (이미지 없음)`; if (u && u.startsWith('http')) { const e = document.createElement("img"); e.className = "profile-img"; e.src = u; e.alt = `${n} 프로필`; e.loading = 'lazy'; e.addEventListener("click", () => openImageOverlay(e)); e.onerror = function() { console.warn(`Profile image load failed, showing fallback for ${role}: ${this.src}`); this.onerror = null; if (g) { g.innerHTML = ''; g.appendChild(l.cloneNode(true)); } }; g.appendChild(e); } else { g.appendChild(l); } if (role === 'bot') { const j = document.createElement("span"); j.className = "profile-emoji"; const k = ['😊', '🤔', '✨', '👀', '😉', '😅', '📝', '💬', '🧐', '🤖']; j.textContent = getRandomElement(k); j.style.display = 'inline'; g.appendChild(j); } const r = document.createElement("div"); r.className = "role-name"; const s = document.createElement("span"); s.className = "name-text"; s.textContent = n; let t = document.createElement("button"); t.className = "delete-btn"; t.textContent = "✕"; t.title = "메시지 삭제"; t.onclick = () => { if (!i) { o.remove(); console.warn("Deleted temporary text message (not in history)."); return; } const x = parseInt(o.dataset.index); if (!isNaN(x) && x >= 0 && x < conversationHistory.length && conversationHistory[x] && conversationHistory[x].messageData.text === messageData.text) { if (confirm("이 메시지를 삭제하시겠습니까?")) { conversationHistory.splice(x, 1); saveConversationHistory(); loadConversationHistory(); } } else { console.error("Cannot delete message from history: Invalid index or message mismatch.", x, conversationHistory.length); alert("메시지 삭제 중 오류가 발생했습니다."); o.remove(); } }; r.appendChild(s); r.appendChild(t); if (role === 'user') { p.appendChild(r); p.appendChild(g); } else { p.appendChild(g); p.appendChild(r); } const w = document.createElement("div"); w.className = "message-content-wrapper"; const b = document.createElement("div"); b.className = "message-bubble"; let y = messageData.text || "";
            // *** Marked 라이브러리 확인 및 사용 ***
            if (typeof marked === 'function') { try { b.innerHTML = marked.parse(y, { breaks: true, gfm: true }); } catch (e) { console.error("Marked parsing error:", e, "\nRaw text:", y); b.textContent = y; } } else { console.warn("marked library not loaded. Displaying raw text."); b.textContent = y; } // 라이브러리 없으면 텍스트 그대로
            w.appendChild(b); o.appendChild(p); o.appendChild(w); chat.appendChild(o); } setTimeout(() => { if (chat) chat.scrollTop = chat.scrollHeight; }, 50); // 스크롤 약간 지연
    } catch (e) { console.error("Error in appendMessage:", e); }
}
// TXT 내보내기
function exportConversationAsTxt() {
    /* DEBUG 로그 제거됨 */ try { if (!conversationHistory || conversationHistory.length === 0) { alert("내보낼 대화 내용이 없습니다."); return; } let c = ""; const b = botNameInputModal?.value || "캐릭터"; const u = userNameInputModal?.value || "사용자"; conversationHistory.forEach(e => { if (e.role === 'user' && e.messageData?.type === 'text' && e.messageData?.text === SYSTEM_PROMPT) return; if (e.messageData?.type === 'image') return; if (e.messageData?.type === 'text') { const n = (e.role === "user" ? u : b); let r = e.messageData?.text || ""; let p = r.replace(/^\*|\*$/g, '').replace(/\*([^*]+)\*/gs, '$1').trim(); if (p) { c += `[${n}] : ${p}\n\n`; } } }); c = c.trimEnd(); if (!c) { alert("내보낼 텍스트 내용이 없습니다. (이미지 제외)"); return; } const l = new Blob([c], { type: 'text/plain;charset=utf-8' }); const k = document.createElement('a'); k.href = URL.createObjectURL(l); const t = new Date().toISOString().slice(0, 10).replace(/-/g, ''); k.download = `chat_history_${b}_${u}_${t}.txt`; document.body.appendChild(k); k.click(); document.body.removeChild(k); URL.revokeObjectURL(k.href); closeActionMenu(); } catch (e) { console.error("Error in exportConversationAsTxt:", e); alert("TXT 내보내기 중 오류 발생"); }
}
// 요약 (API 호출 복원됨)
async function summarizeConversation() {
    /* DEBUG 로그 제거됨 */ if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !menuSummarizeButton || !chat) { console.error("Summarize dependencies missing"); alert("요약 기능을 실행하는 데 필요한 요소가 없습니다."); return; } sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; loadingSpinner.style.display = 'block'; menuSummarizeButton.disabled = true; if (feedbackButton) feedbackButton.disabled = true; closeActionMenu(); try { const h = conversationHistory.filter(e => !(e.role === 'user' && e.messageData?.text === SYSTEM_PROMPT) && e.messageData?.type === 'text').slice(-10); if (h.length === 0) { alert("요약할 대화 내용이 없습니다."); return; } const p = `다음 대화 내용을 한국어로 간결하게 요약해줘. 요약은 제3자 시점에서 작성하고, 핵심 사건과 전개만 담되 군더더기 없는 자연스러운 문장으로 작성해. "요약:" 같은 머리말은 붙이지 말고, 그냥 텍스트만 출력해. (최근 ${h.length} 턴 기준)`; const c = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...h.map(e => ({ role: e.role === 'model' ? 'model' : 'user', parts: [{ text: e.messageData.text }] })), { role: "user", parts: [{ text: p }] } ]; console.log(`Sending summary request for last ${h.length} turns...`); let s = ''; try { const r = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: c }) }); console.log("Summary API response status:", r.status); if (!r.ok) { const b = await r.text(); console.error(`Summary API Error (${r.status}): ${b}`); s = `(요약 실패: 서버 오류 ${r.status})`; } else { const d = await r.json(); s = d?.candidates?.[0]?.content?.parts?.[0]?.text || "(요약 응답 처리 실패)"; console.log("Summary received:", s); } } catch (f) { console.error("Fetch Error sending summary:", f); s = "(요약 통신 오류 발생)"; } appendMessage("bot", { type: 'text', text: `--- 최근 ${h.length}턴 대화 요약 ---\n${s}\n---` }); } catch (o) { console.error("Error during Summary process:", o); appendMessage("bot", { type: 'text', text: "(요약 중 오류 발생)" }); } finally { /* DEBUG 로그 제거됨 */ if(sendButton) sendButton.disabled = false; if(userInput) userInput.disabled = false; if(actionMenuButton) actionMenuButton.disabled = false; if(loadingSpinner) loadingSpinner.style.display = 'none'; if(menuSummarizeButton) menuSummarizeButton.disabled = false; if(feedbackButton) feedbackButton.disabled = false; if(userInput) userInput.focus(); }
}
// 메시지 전송 (API 호출 복원됨)
async function sendMessage(messageText) {
    /* DEBUG 로그 제거됨 */ if (!userInput || !sendButton || !actionMenuButton || !feedbackButton || !loadingSpinner || !chat) { console.error("sendMessage dependencies missing"); alert("메시지 전송에 필요한 요소가 없습니다."); return; } let m = messageText.trim(); if (!m) { userInput.value = ''; autoResizeTextarea.call(userInput); return; } console.log("Input message:", m); const p = /^(https|http):\/\/[^\s"]+\.(gif|jpe?g|png|webp|bmp)(\?.*)?$/i; if (p.test(m)) { console.log("Image URL detected, sending as image message."); const i = { role: "user", messageData: { type: 'image', url: m } }; conversationHistory.push(i); appendMessage("user", i.messageData, conversationHistory.length - 1); saveConversationHistory(); userInput.value = ''; autoResizeTextarea.call(userInput); return; } console.log("Treating message as text."); try { let f = currentFeedback; if (currentFeedback) { handleFeedbackSelection(null); } const u = { role: "user", messageData: { type: 'text', text: m } }; conversationHistory.push(u); appendMessage("user", u.messageData, conversationHistory.length - 1); saveConversationHistory(); userInput.value = ''; autoResizeTextarea.call(userInput); sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; feedbackButton.disabled = true; loadingSpinner.style.display = 'block'; let c; try { const t = conversationHistory.filter(e => e.messageData?.type === 'text'); c = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...t.map(e => ({ role: e.role === 'model' ? 'model' : 'user', parts: [{ text: e.messageData.text }] })) ]; if (f) { console.log(`Sending with feedback: ${f}`); c.push({ role: "user", parts: [{ text: `(피드백: ${f})` }] }); } } catch (e) { console.error("Error preparing API contents:", e); throw new Error("API 요청 데이터 준비 중 오류 발생"); } console.log("Sending API request..."); let b = ''; try { const r = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: c }) }); console.log("API response status:", r.status); if (!r.ok) { const y = await r.text(); console.error(`API Error (${r.status}): ${y}`); b = `(오류 ${r.status}: 응답을 받을 수 없습니다.)`; } else { const d = await r.json(); b = d?.candidates?.[0]?.content?.parts?.[0]?.text || "(빈 응답)"; console.log("API Response:", b); } } catch (h) { console.error("Fetch Error sending message:", h); b = "(통신 오류 발생)"; } const o = { role: "model", messageData: { type: 'text', text: b } }; conversationHistory.push(o); appendMessage("bot", o.messageData, conversationHistory.length - 1); saveConversationHistory(); } catch (e) { console.error("Error in sendMessage process:", e); appendMessage("bot", { type: 'text', text: `(메시지 처리 중 오류 발생: ${e.message})` }); } finally { /* DEBUG 로그 제거됨 */ if(sendButton) sendButton.disabled = false; if(userInput) userInput.disabled = false; if(actionMenuButton) actionMenuButton.disabled = false; if(feedbackButton) feedbackButton.disabled = false; if(loadingSpinner) loadingSpinner.style.display = 'none'; if(userInput) userInput.focus(); }
}
// '상황' 요청 함수 (API 호출 복원됨)
async function sendSituationRequest(type) {
    /* DEBUG 로그 제거됨 */ if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !botNameInputModal || !chat) { console.error("sendSituationRequest dependencies missing"); alert("상황 요청 기능을 실행하는 데 필요한 요소가 없습니다."); return; } sendButton.disabled = true; userInput.disabled = true; actionMenuButton.disabled = true; loadingSpinner.style.display = 'block'; if(feedbackButton) feedbackButton.disabled = true; closeActionMenu(); try { let p = ''; const n = botNameInputModal.value || "캐릭터"; switch(type) { case '랜덤': p = `\nYou are writing a first-person narrative as the character ${n}.\nThe current situation needs a fresh development or a change of pace.\nIntroduce a new element, interaction, or internal thought that moves the story forward in an interesting, but not necessarily drastic, way.\nMaintain the established tone and character consistency. Focus on subtle shifts and sensory details. Avoid repetition.\nOutput should feel like a natural continuation of the story.\n`; break; case '전환': p = `\nYou are writing a first-person narrative as the character ${n}.\nCraft a fresh, emotionally engaging situation that sparks curiosity or connection between the characters — something surprising, light-hearted, or meaningful, based on the unique traits of this character and their world.\nThe event should not be overly dramatic or intense, but should still shift the emotional dynamic in a natural and immersive way.\nAvoid adult or mature content. Do not copy specific examples or past scenes — create a new moment inspired by the tone of gentle tension, humor, or affection.\nThe characters may be human, non-human, or from entirely fantastical settings — ensure the situation makes sense within their universe.\nLet the story unfold with subtle emotional shifts and interaction that feels alive, reactive, and immersive.\n`; break; case '성인': p = `\nYou are writing a first-person narrative as the character ${n}.\nThe situation should escalate organically toward mature themes or intimacy, depending on the emotional and physical progression of the scene.\nIf sexual intercourse has not yet occurred, the character must act assertively according to the situation—initiating physical closeness, deepening tension, or shifting setting and posture to increase sensuality.\nIf the scene is already mid-intercourse, the character must introduce new positions, kinks, or climax dynamics to maintain narrative intensity.\nFocus on the character’s inner desires, sensations, and actions with heightened sensual and emotional detail, in accordance with persona rules.\nUse nuanced, vivid language and avoid abrupt pacing or out-of-character behavior. All development must feel inevitable and immersive.\n`; break; case '돌발': default: p = `\nYou are writing a first-person narrative as the character ${n}.\nThe scene has stalled or lost momentum. You must now introduce a new turning point:\neither escalate the current situation, or introduce a **sudden, immersive event**\nthat dramatically changes the mood or setting.\nWrite in a sensory-rich, novel-style format with emphasis on *physical actions, emotional reactions*, and subtle tension.\nUse minimal but meaningful dialogue only when needed. Avoid repetition and do not reference the user's past prompts.\nDo not break character. Maintain continuity in tone and theme. Output should feel seamless in the flow of the story.\n`; break; } const h = conversationHistory.filter(e => e.messageData?.type === 'text'); const c = [ { role: "user", parts: [{ text: SYSTEM_PROMPT }] }, ...h.map(e => ({ role: e.role === 'model' ? 'model' : 'user', parts: [{ text: e.messageData.text }] })), { role: "user", parts: [{ text: p }] } ]; console.log(`Sending situation request ('${type}') to API...`); let b = ''; try { const r = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: c }) }); console.log("Situation API response status:", r.status); if (!r.ok) { const y = await r.text(); console.error(`Situation API Error (${r.status}): ${y}`); b = `(상황 요청 실패: 서버 오류 ${r.status})`; } else { const d = await r.json(); b = d?.candidates?.[0]?.content?.parts?.[0]?.text || "(빈 응답)"; console.log("Situation Response:", b); } } catch (f) { console.error("Fetch Error sending situation request:", f); b = "(상황 요청 통신 오류 발생)"; } const o = { role: "model", messageData: { type: 'text', text: b } }; conversationHistory.push(o); appendMessage("bot", o.messageData, conversationHistory.length - 1); saveConversationHistory(); } catch (e) { console.error("Error in sendSituationRequest process:", e); appendMessage("bot", { type: 'text', text: `(상황 요청 처리 중 오류 발생: ${e.message})` }); } finally { /* DEBUG 로그 제거됨 */ if(sendButton) sendButton.disabled = false; if(userInput) userInput.disabled = false; if(actionMenuButton) actionMenuButton.disabled = false; if(loadingSpinner) loadingSpinner.style.display = 'none'; if(feedbackButton) feedbackButton.disabled = false; if(userInput) userInput.focus(); }
}
// 이미지 URL 미리보기 업데이트
function updateImagePreview(imageUrl, imgElement) {
    const p = imgElement?.closest('.image-preview-area'); if (!imgElement || !p) { console.warn("Cannot update image preview: imgElement or previewArea not found."); return; } if (imageUrl && imageUrl.startsWith('http')) { imgElement.src = imageUrl; imgElement.style.display = 'block'; p.classList.add('has-image'); imgElement.onerror = function() { console.warn(`Failed to load preview image: ${imageUrl}`); this.onerror = null; imgElement.style.display = 'none'; p.classList.remove('has-image'); imgElement.src = ''; }; } else { imgElement.src = ''; imgElement.style.display = 'none'; p.classList.remove('has-image'); }
}
// 슬롯 버튼 스타일 업데이트
function updateSlotButtonStyles() {
    try { const b = document.querySelectorAll('.slot-button'); if (!b || b.length === 0) return; b.forEach(t => { t.classList.toggle('active', parseInt(t.textContent) === currentSlot); }); } catch (e) { console.error("Error updating slot button styles:", e); }
}
// --- 랜덤 생성 함수 (API 호출 방식으로 수정됨) ---
/** API 호출 랜덤 캐릭터 생성 */
async function generateRandomCharacter() {
    console.log("🎲 Requesting Random Character from API..."); if (!generateRandomCharacterButton || !botNameInputModal || !botGenderInputModal || !botAgeInputModal || !botAppearanceInputModal || !botPersonaInputModal) { console.error("Required elements for generating character are missing."); alert("캐릭터 생성에 필요한 요소를 찾을 수 없습니다."); return; } generateRandomCharacterButton.disabled = true; generateRandomCharacterButton.textContent = "⏳"; try { const p = `매력적인 공(攻) 타입 캐릭터의 이름, 성별(남성/여성 중 하나), 나이(25세~38세 사이의 숫자), 상세한 외형 묘사(최소 30자 이상), 그리고 성격 및 행동 가이드라인(최소 50자 이상)을 랜덤으로 생성해줘. 반드시 다음 JSON 형식으로만 응답해야 해:\n\n{\n  "name": "생성된 이름",\n  "gender": "생성된 성별",\n  "age": "생성된 나이(숫자만)",\n  "appearance": "생성된 외형 묘사",\n  "persona": "생성된 성격/가이드라인 묘사"\n}`; const c = [{ role: "user", parts: [{ text: p }] }]; const r = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: c }) }); console.log("Random Character API response status:", r.status); if (!r.ok) { const b = await r.text(); console.error(`Random Character API Error (${r.status}): ${b}`); throw new Error(`서버 오류 (${r.status})`); } const d = await r.json(); const j = d?.candidates?.[0]?.content?.parts?.[0]?.text; if (!j) { console.error("Empty or invalid response text from API:", d); throw new Error("API로부터 유효한 응답을 받지 못했습니다."); } console.log("Raw API response for character:", j); try { const m = j.match(/{[\s\S]*}/); if (!m) { throw new Error("응답에서 유효한 JSON 형식을 찾을 수 없습니다."); } const v = m[0]; const i = JSON.parse(v); botNameInputModal.value = i.name || ''; botGenderInputModal.value = i.gender || ''; botAgeInputModal.value = i.age || ''; botAppearanceInputModal.value = i.appearance || ''; botPersonaInputModal.value = i.persona || ''; updateSystemPrompt(); alert("랜덤 캐릭터 정보가 생성되었습니다!"); } catch (e) { console.error("Failed to parse API response JSON:", e, "\nRaw response:", j); alert(`캐릭터 정보 생성 응답을 처리하는 중 오류가 발생했습니다.\nAPI 응답:\n${j}`); } } catch (e) { console.error("Error generating random character:", e); alert(`랜덤 캐릭터 생성 중 오류 발생: ${e.message}`); } finally { generateRandomCharacterButton.disabled = false; generateRandomCharacterButton.textContent = "🎲"; }
}
/** API 호출 랜덤 사용자 생성 */
async function generateRandomUser() {
    console.log("🎲 Requesting Random User from API..."); if (!generateRandomUserButton || !userNameInputModal || !userGenderInputModal || !userAgeInputModal || !userAppearanceInputModal || !userGuidelinesInputModal) { console.error("Required elements for generating user are missing."); alert("사용자 생성에 필요한 요소를 찾을 수 없습니다."); return; } generateRandomUserButton.disabled = true; generateRandomUserButton.textContent = "⏳"; try { const p = `매력적인 수(受) 타입 캐릭터의 이름, 성별(남성/여성 중 하나), 나이(20세~35세 사이의 숫자), 상세한 외형 묘사(최소 30자 이상), 그리고 사용자 가이드라인(최소 50자 이상, 캐릭터의 성격이 아닌 사용자의 플레이 스타일 가이드)을 랜덤으로 생성해줘. 반드시 다음 JSON 형식으로만 응답해야 해:\n\n{\n  "name\": "생성된 이름",\n  "gender\": "생성된 성별",\n  "age\": "생성된 나이(숫자만)",\n  "appearance\": "생성된 외형 묘사",\n  "guidelines\": "생성된 사용자 가이드라인"\n}`; const c = [{ role: "user", parts: [{ text: p }] }]; const r = await fetch(`/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: c }) }); console.log("Random User API response status:", r.status); if (!r.ok) { const b = await r.text(); console.error(`Random User API Error (${r.status}): ${b}`); throw new Error(`서버 오류 (${r.status})`); } const d = await r.json(); const j = d?.candidates?.[0]?.content?.parts?.[0]?.text; if (!j) { console.error("Empty or invalid response text from API:", d); throw new Error("API로부터 유효한 응답을 받지 못했습니다."); } console.log("Raw API response for user:", j); try { const m = j.match(/{[\s\S]*}/); if (!m) { throw new Error("응답에서 유효한 JSON 형식을 찾을 수 없습니다."); } const v = m[0]; const i = JSON.parse(v); userNameInputModal.value = i.name || ''; userGenderInputModal.value = i.gender || ''; userAgeInputModal.value = i.age || ''; userAppearanceInputModal.value = i.appearance || ''; userGuidelinesInputModal.value = i.guidelines || ''; updateSystemPrompt(); alert("랜덤 사용자 정보가 생성되었습니다!"); } catch (e) { console.error("Failed to parse API response JSON:", e, "\nRaw response:", j); alert(`사용자 정보 생성 응답을 처리하는 중 오류가 발생했습니다.\nAPI 응답:\n${j}`); } } catch (e) { console.error("Error generating random user:", e); alert(`랜덤 사용자 생성 중 오류 발생: ${e.message}`); } finally { generateRandomUserButton.disabled = false; generateRandomUserButton.textContent = "🎲"; }
}
// 이미지 미리보기 클릭 시 URL 입력
function promptForImageUrl(targetPreviewElement, isBot) {
    const c = targetPreviewElement.src && targetPreviewElement.src.startsWith('http') ? targetPreviewElement.src : ''; const n = prompt(isBot ? "캐릭터 이미지 URL을 입력하세요:" : "사용자 이미지 URL을 입력하세요:", c); if (n !== null) { if (n === "") { updateImagePreview('', targetPreviewElement); if (isBot) botProfileImgUrl = ''; else userProfileImgUrl = ''; } else if (/^(https?:\/\/).*\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(n)) { updateImagePreview(n, targetPreviewElement); if (isBot) botProfileImgUrl = n; else userProfileImgUrl = n; } else { alert("유효한 이미지 URL 형식이 아닙니다. (http(s)://로 시작하고 이미지 확장자로 끝나야 합니다)"); } }
}
// 채팅 이미지 삽입 함수 (URL 입력 방식)
function sendImageChatMessage() {
    closeActionMenu(); const i = prompt("채팅에 삽입할 이미지 URL을 입력하세요:"); if (i && /^(https?:\/\/).*\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(i)) { if (userInput) { userInput.value = i; sendMessage(i); } else { console.warn("userInput element not found, appending image directly."); const m = { role: "user", messageData: { type: 'image', url: i } }; conversationHistory.push(m); appendMessage("user", m.messageData, conversationHistory.length - 1); saveConversationHistory(); if(chat) chat.scrollTop = chat.scrollHeight; } } else if (i !== null) { alert("유효한 이미지 URL 형식이 아닙니다."); }
}
// 피드백 선택 처리
function handleFeedbackSelection(feedbackType) {
    /* DEBUG 로그 제거됨 */ if (!feedbackOptionsContainer) return; feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(b => { b.classList.remove('active'); }); if (feedbackType) { const s = feedbackOptionsContainer.querySelector(`.feedback-option[data-feedback="${feedbackType}"]`); if (s) { s.classList.add('active'); } currentFeedback = feedbackType; } else { currentFeedback = null; closeFeedbackOptions(); } console.log("Current feedback set to:", currentFeedback);
}
// --- 대화 기록 관리 ---
function saveConversationHistory() {
    try { if (conversationHistory && conversationHistory.length > 0) { localStorage.setItem(`conversation_slot_${currentSlot}`, JSON.stringify(conversationHistory)); } else { localStorage.removeItem(`conversation_slot_${currentSlot}`); } } catch (e) { console.error("Error saving conversation history:", e); }
}
// *** 공지 항상 보이도록 수정 ***
function loadConversationHistory() {
    try { const s = localStorage.getItem(`conversation_slot_${currentSlot}`); conversationHistory = []; if (s) { try { const p = JSON.parse(s); if (Array.isArray(p)) { conversationHistory = p; } else { localStorage.removeItem(`conversation_slot_${currentSlot}`); } } catch (e) { console.error("Error parsing conversation history:", e); localStorage.removeItem(`conversation_slot_${currentSlot}`); } } console.log(`Conversation loaded for slot ${currentSlot}. Length: ${conversationHistory.length}`);
        if (chat) {
            chat.innerHTML = ''; // 채팅창 비우기
            appendInitialNotice(); // *** 채팅창 비운 후 공지 다시 추가 ***
            conversationHistory.forEach((e, i) => { if (!(e.role === 'user' && e.messageData?.text === SYSTEM_PROMPT)) { appendMessage(e.role === 'model' ? 'bot' : 'user', e.messageData, i); } });
            setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 50); // 스크롤 지연
        } else { console.error("Cannot load conversation to screen: chat element not found."); }
    } catch (e) { console.error("Error loading conversation history:", e); conversationHistory = []; }
}
function resetConversation() {
    if (confirm(`슬롯 ${currentSlot}의 대화 기록을 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) { console.log(`Resetting conversation for slot ${currentSlot}`); conversationHistory = []; saveConversationHistory(); loadConversationHistory(); /* loadConversationHistory가 공지 추가 */ alert(`슬롯 ${currentSlot}의 대화 기록이 초기화되었습니다.`); }
}

// --- DOMContentLoaded 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // 시작 로그
    try {
        // DEBUG 로그 제거됨: console.log("Assigning DOM elements...");
        // --- 요소 할당 ---
        chat = getElement('chat'); userInput = getElement('userInput'); sendButton = getElement('sendButton'); loadingSpinner = getElement('loadingSpinner'); actionMenuButton = getElement('actionMenuButton'); actionMenu = getElement('actionMenu'); menuOverlay = getElement('menuOverlay'); sidebarToggle = getElement('sidebarToggle'); settingsModalOverlay = getElement('settingsModalOverlay'); settingsModal = getElement('settingsModal'); closeModalButton = getElement('closeModalButton'); saveSettingsButtonModal = getElement('saveSettingsButtonModal'); feedbackButton = getElement('feedbackButton'); feedbackOptionsContainer = getElement('feedbackOptionsContainer'); botNameInputModal = getElement('botNameInputModal'); botAgeInputModal = getElement('botAgeInputModal'); botGenderInputModal = getElement('botGenderInputModal'); botAppearanceInputModal = getElement('botAppearanceInputModal'); botPersonaInputModal = getElement('botPersonaInputModal'); botImagePreview = getElement('botImagePreview'); userNameInputModal = getElement('userNameInputModal'); userAgeInputModal = getElement('userAgeInputModal'); userGenderInputModal = getElement('userGenderInputModal'); userAppearanceInputModal = getElement('userAppearanceInputModal'); userGuidelinesInputModal = getElement('userGuidelinesInputModal'); userImagePreview = getElement('userImagePreview'); generateRandomCharacterButton = getElement('generateRandomCharacter', false); generateRandomUserButton = getElement('generateRandomUser', false); menuImageButton = getElement('menuImageButton', false); menuSituationButton = getElement('menuSituationButton', false); menuExportTxtButton = getElement('menuExportTxtButton', false); menuSummarizeButton = getElement('menuSummarizeButton', false); situationOptions = getElement('situationOptions', false); imageOverlay = getElement('imageOverlay', false); overlayImage = getElement('overlayImage', false);
        // DEBUG 로그 제거됨: console.log("Essential DOM elements assigned. Attaching event listeners...");

        // --- 이벤트 리스너 연결 (함수 정의가 위로 가서 ReferenceError 해결됨) ---
        if (sendButton) sendButton.addEventListener("click", () => { if(userInput) sendMessage(userInput.value); });
        if (userInput) userInput.addEventListener("keydown", function(event) { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendMessage(userInput.value); } });
        if (userInput) userInput.addEventListener('input', autoResizeTextarea);
        if (actionMenuButton) { actionMenuButton.addEventListener("click", (event) => { /* DEBUG 로그 제거됨 */ event.stopPropagation(); toggleActionMenu(); }); /* DEBUG 로그 제거됨 */ } else { console.error("actionMenuButton not found!"); }
        if (menuOverlay) menuOverlay.addEventListener("click", closeActionMenu);
        if (menuImageButton) menuImageButton.addEventListener("click", sendImageChatMessage);
        if (menuSituationButton) menuSituationButton.addEventListener("click", toggleSituationOptions);
        if (situationOptions) { situationOptions.querySelectorAll(".option").forEach(option => { option.addEventListener("click", (event) => { event.stopPropagation(); const type = option.textContent.trim(); if (type) { sendSituationRequest(type); } closeActionMenu(); }); }); }
        if (menuExportTxtButton) menuExportTxtButton.addEventListener("click", exportConversationAsTxt);
        if (menuSummarizeButton) menuSummarizeButton.addEventListener("click", summarizeConversation);
        if (sidebarToggle) { sidebarToggle.addEventListener("click", (event) => { /* DEBUG 로그 제거됨 */ event.stopPropagation(); openSettingsModal(); }); /* DEBUG 로그 제거됨 */ } else { console.error("sidebarToggle button not found!"); }
        if (closeModalButton) { closeModalButton.addEventListener("click", closeSettingsModal); /* DEBUG 로그 제거됨 */ } else { console.warn("[Optional] closeModalButton not found."); }
        if (settingsModalOverlay) { settingsModalOverlay.addEventListener("click", function(event) { if (event.target === settingsModalOverlay) { /* DEBUG 로그 제거됨 */ closeSettingsModal(); } }); /* DEBUG 로그 제거됨 */ } else { console.warn("[Optional] settingsModalOverlay not found for click listener."); }
        if (saveSettingsButtonModal) saveSettingsButtonModal.addEventListener("click", () => saveSettings(currentSlot));
        document.querySelectorAll('.slot-button').forEach(button => { button.addEventListener('click', function() { const slotNum = parseInt(this.textContent); if (!isNaN(slotNum) && slotNum !== currentSlot) { currentSlot = slotNum; console.log(`Switched to slot ${currentSlot}`); loadSettings(currentSlot); loadConversationHistory(); /* 공지는 loadConversationHistory에서 처리 */ } }); });
        if (generateRandomCharacterButton) generateRandomCharacterButton.addEventListener('click', generateRandomCharacter);
        if (generateRandomUserButton) generateRandomUserButton.addEventListener('click', generateRandomUser);
        if (botImagePreview) botImagePreview.closest('.image-preview-area')?.addEventListener('click', () => promptForImageUrl(botImagePreview, true));
        if (userImagePreview) userImagePreview.closest('.image-preview-area')?.addEventListener('click', () => promptForImageUrl(userImagePreview, false));
        if (feedbackButton) feedbackButton.addEventListener("click", toggleFeedbackOptions);
        if (feedbackOptionsContainer) { feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(button => { button.addEventListener('click', function(event) { event.stopPropagation(); const feedback = this.dataset.feedback; if (currentFeedback === feedback) { handleFeedbackSelection(null); } else { handleFeedbackSelection(feedback); } }); }); }
        document.addEventListener('click', function(event) { if (actionMenu && actionMenuButton && !actionMenu.contains(event.target) && event.target !== actionMenuButton) { closeActionMenu(); } if (feedbackOptionsContainer && feedbackButton && !feedbackOptionsContainer.contains(event.target) && event.target !== feedbackButton && !currentFeedback) { closeFeedbackOptions(); } });
        // DEBUG 로그 제거됨: console.log("[DEBUG] Global click listener attached.");

        // DEBUG 로그 제거됨: console.log("Event listeners attached.");
        // DEBUG 로그 제거됨: console.log("Running initial setup...");
        initializeChat();
        console.log("Initialization complete."); // 완료 로그는 남겨둠
    } catch (e) { console.error("Error during DOMContentLoaded setup:", e); alert("페이지 초기화 중 오류가 발생했습니다. 콘솔을 확인해주세요."); }
}); // DOMContentLoaded 끝

// DEBUG 로그 제거됨: console.log("Script loaded and parsed.");
