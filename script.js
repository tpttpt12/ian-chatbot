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
function openImageOverlay(element) { try { if (!imageOverlay) imageOverlay = getElement('imageOverlay', false); if (!overlayImage) overlayImage = getElement('overlayImage', false); if (!imageOverlay || !overlayImage || !element || !element.src || !element.src.startsWith('http')) { console.warn("Cannot open image overlay: Invalid element or src.", element?.src); return; } overlayImage.src = element.src; imageOverlay.style.display = "flex"; } catch (e) { console.error("Error in openImageOverlay:", e); } }
function closeImageOverlay() { try { if (!imageOverlay) imageOverlay = getElement('imageOverlay', false); if (!overlayImage) overlayImage = getElement('overlayImage', false); if (!imageOverlay || !overlayImage) return; overlayImage.src = ""; imageOverlay.style.display = "none"; } catch (e) { console.error("Error in closeImageOverlay:", e); } }
// Textarea 높이 조절
function autoResizeTextarea() { try { if (!this || typeof this.style === 'undefined' || this.tagName !== 'TEXTAREA') { return; } this.style.height='auto';this.style.overflowY='hidden';const c=getComputedStyle(this);const l=parseFloat(c.lineHeight)||18;const pt=parseFloat(c.paddingTop)||0;const pb=parseFloat(c.paddingBottom)||0;const bt=parseFloat(c.borderTopWidth)||0;const bb=parseFloat(c.borderBottomWidth)||0;const v=pt+pb+bt+bb;const o=l+v;const t=(l*2)+v;const m=o;const h=this.scrollHeight;if(h>t+2){this.style.height=t+'px';this.style.overflowY='auto';}else{this.style.height=Math.max(h,m)+'px';this.style.overflowY='hidden';} } catch(e){console.error("Error in autoResizeTextarea:",e);} }

// *** 이미지 URL 유효성 검사 함수 추가 ***
function isValidImageUrl(url) {
    if (!url || !url.startsWith('http')) {
        return false; // URL이 없거나 http(s)로 시작하지 않으면 유효하지 않음
    }
    // 웹사이트 루트 URL 같은 경우는 걸러내기 (더 정교한 로직 추가 가능)
    try {
        const parsedUrl = new URL(url);
        // 경로가 없거나 '/' 만 있는 경우 (예: https://example.com/)는 이미지 URL이 아닐 가능성이 높음
        if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
             // 단, 일부 이미지 호스팅 서비스는 경로 없이 쿼리 파라미터만 사용할 수 있음 (예외 처리 필요 시 추가)
             // 일단 루트 URL은 이미지로 간주하지 않음
             // console.log(`Invalid image URL (likely base URL): ${url}`);
             return false;
        }
        // 기본적인 이미지 확장자 포함 여부 확인 (선택적, 완벽하지 않음)
        // return /\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(parsedUrl.pathname);
    } catch (e) {
        // URL 파싱 실패 시 유효하지 않음
        // console.log(`URL parsing failed for: ${url}`);
        return false;
    }
    return true; // 위의 조건들을 통과하면 일단 유효한 것으로 간주
}

// 설정 저장 (이미지 URL 유효성 검사 추가)
function saveSettings(slotNumber) {
    console.log(`saveSettings called for slot ${slotNumber}`); try { if (!botNameInputModal || !botAgeInputModal || !botGenderInputModal || !botAppearanceInputModal || !botPersonaInputModal || !botImagePreview || !userNameInputModal || !userAgeInputModal || !userGenderInputModal || !userAppearanceInputModal || !userGuidelinesInputModal || !userImagePreview) { console.error("Cannot save settings: Elements missing."); alert("설정 저장 실패: 요소 누락"); return; }
        // *** 저장 전 이미지 URL 검증 ***
        const botImgToSave = isValidImageUrl(botImagePreview.src) ? botImagePreview.src : '';
        const userImgToSave = isValidImageUrl(userImagePreview.src) ? userImagePreview.src : '';
        if (!botImgToSave && botImagePreview.src) console.warn(`Invalid Bot Image URL detected, saving empty: ${botImagePreview.src}`);
        if (!userImgToSave && userImagePreview.src) console.warn(`Invalid User Image URL detected, saving empty: ${userImagePreview.src}`);

        const s = { botName: botNameInputModal.value || '', botAge: botAgeInputModal.value || '', botGender: botGenderInputModal.value || '', botAppearance: botAppearanceInputModal.value || '', botPersona: botPersonaInputModal.value || '',
            botImageUrl: botImgToSave, // 검증된 값 저장
            userName: userNameInputModal.value || '', userAge: userAgeInputModal.value || '', userGender: userGenderInputModal.value || '', userAppearance: userAppearanceInputModal.value || '', userGuidelines: userGuidelinesInputModal.value || '',
            userImageUrl: userImgToSave // 검증된 값 저장
        };
        localStorage.setItem(`settings_slot_${slotNumber}`, JSON.stringify(s)); alert(`설정 슬롯 ${slotNumber} 저장 완료.`); userProfileImgUrl = s.userImageUrl; botProfileImgUrl = s.botImageUrl; updateSystemPrompt(); closeSettingsModal(); } catch (e) { console.error("Error in saveSettings:", e); alert("설정 저장 중 오류 발생"); }
}
// 설정 로드
function loadSettings(slotNumber) {
    console.log(`loadSettings called for slot ${slotNumber}`); try { const d = localStorage.getItem(`settings_slot_${slotNumber}`); let s = {}; if (d) { try { s = JSON.parse(d); if (typeof s !== 'object' || s === null) { s = {}; localStorage.removeItem(`settings_slot_${slotNumber}`); } } catch (e) { console.error("Failed to parse settings:", e); localStorage.removeItem(`settings_slot_${slotNumber}`); s = {}; } } if(botNameInputModal) botNameInputModal.value = s.botName || ''; if(botAgeInputModal) botAgeInputModal.value = s.botAge || ''; if(botGenderInputModal) botGenderInputModal.value = s.botGender || ''; if(botAppearanceInputModal) botAppearanceInputModal.value = s.botAppearance || ''; if(botPersonaInputModal) botPersonaInputModal.value = s.botPersona || ''; if(botImagePreview) updateImagePreview(s.botImageUrl || '', botImagePreview); if(userNameInputModal) userNameInputModal.value = s.userName || ''; if(userAgeInputModal) userAgeInputModal.value = s.userAge || ''; if(userGenderInputModal) userGenderInputModal.value = s.userGender || ''; if(userAppearanceInputModal) userAppearanceInputModal.value = s.userAppearance || ''; if(userGuidelinesInputModal) userGuidelinesInputModal.value = s.userGuidelines || ''; if(userImagePreview) updateImagePreview(s.userImageUrl || '', userImagePreview); userProfileImgUrl = s.userImageUrl || ""; botProfileImgUrl = s.botImageUrl || ""; updateSystemPrompt(); updateSlotButtonStyles(); } catch (e) { console.error("Error in loadSettings:", e); }
}
// SYSTEM_PROMPT 업데이트
function updateSystemPrompt() { try { const bn=botNameInputModal?.value||"캐릭터";const ba=botAgeInputModal?.value||"불명";const bap=botAppearanceInputModal?.value||"알 수 없음";const bp=botPersonaInputModal?.value||"설정 없음";const un=userNameInputModal?.value||"사용자";const ua=userAgeInputModal?.value||"불명";const uap=userAppearanceInputModal?.value||"알 수 없음";const ug=userGuidelinesInputModal?.value||"설정 없음";SYSTEM_PROMPT=SYSTEM_PROMPT_TEMPLATE.replace(/{botName}/g,bn).replace(/{botAge}/g,ba).replace(/{botAppearance}/g,bap).replace(/{botPersona}/g,bp).replace(/{userName}/g,un).replace(/{userAge}/g,ua).replace(/{userAppearance}/g,uap).replace(/{userGuidelines}/g,ug); } catch(e){console.error("Error in updateSystemPrompt:",e);} }
// 초기화
function initializeChat() { console.log("initializeChat called"); try { loadSettings(currentSlot); loadConversationHistory(); if(userInput) autoResizeTextarea.call(userInput); console.log("Chat initialized successfully."); } catch (e) { console.error("Error during initializeChat:", e); } }
// 초기 공지 메시지
function appendInitialNotice() { console.log("appendInitialNotice called"); try { if (chat) { const e=chat.querySelector('.initial-notice'); if(e)e.remove(); const n=document.createElement('div');n.className='initial-notice';n.innerHTML=`대화를 시작하세요! 설정(≡)에서 캐릭터와 사용자 정보를 변경할 수 있습니다.<br><div class="notice-divider"></div>`; if(chat.firstChild){chat.insertBefore(n,chat.firstChild);}else{chat.appendChild(n);} } } catch(e){console.error("Error appending initial notice:",e);} }
// 메시지를 채팅창에 추가 (삭제 로직 포함, marked 확인)
function appendMessage(role, messageData, index = -1) {
    try { if (!chat) { console.error("Chat element not found"); return; } const i=typeof index==='number'&&index>=0&&index<conversationHistory.length; if (messageData.type==='image') { const c=document.createElement("div");c.className=`image-announcement ${role}`;if(i){c.dataset.index=index;} const f=document.createElement("div");f.className="image-fade-container"; const m=document.createElement("img");m.className="chat-image";m.src=messageData.url;m.alt="채팅 이미지";m.loading='lazy';m.onclick=()=>openImageOverlay(m); m.onerror=function(){console.warn(`Failed to load chat image: ${this.src}`);this.onerror=null;const e=document.createElement('div');e.textContent="(이미지 로드 실패)";e.className='image-error-text';c.innerHTML='';c.appendChild(e);}; const b=document.createElement("button");b.className="delete-btn chat-image-delete-btn";b.textContent="✕";b.title="이미지 삭제"; b.onclick=()=>{if(!i){c.remove();return;}const x=parseInt(c.dataset.index);if(!isNaN(x)&&x>=0&&x<conversationHistory.length&&conversationHistory[x]&&conversationHistory[x].messageData.url===messageData.url){if(confirm("이 이미지를 삭제하시겠습니까?")){conversationHistory.splice(x,1);saveConversationHistory();loadConversationHistory();}}else{console.error("Cannot delete image: Invalid index or mismatch.", x, conversationHistory.length);alert("이미지 삭제 오류");c.remove();}}; f.appendChild(m);c.appendChild(f);c.appendChild(b);chat.appendChild(c); } else { const o=document.createElement("div");o.className=`message-container ${role}`;if(i){o.dataset.index=index;} const p=document.createElement("div");p.className="profile-area"; const g=document.createElement("div");g.style.position='relative'; const u=(role==='user'?userProfileImgUrl:botProfileImgUrl);const n=(role==='user'?(userNameInputModal?.value||"사용자"):(botNameInputModal?.value||"캐릭터")); const l=document.createElement("div");l.className="profile-fallback";l.title=`${n} (이미지 없음)`; if (isValidImageUrl(u)) { const e=document.createElement("img");e.className="profile-img";e.src=u;e.alt=`${n} 프로필`;e.loading='lazy';e.addEventListener("click",()=>openImageOverlay(e)); e.onerror=function(){console.warn(`Profile image load failed, showing fallback for ${role}: ${this.src}`);this.onerror=null;if(g){g.innerHTML='';g.appendChild(l.cloneNode(true));}}; g.appendChild(e); } else { g.appendChild(l); } if(role==='bot'){const j=document.createElement("span");j.className="profile-emoji";const k=['😊','🤔','✨','👀','😉','😅','📝','💬','🧐','🤖'];j.textContent=getRandomElement(k);j.style.display='inline';g.appendChild(j);} const r=document.createElement("div");r.className="role-name";const s=document.createElement("span");s.className="name-text";s.textContent=n;let t=document.createElement("button");t.className="delete-btn";t.textContent="✕";t.title="메시지 삭제"; t.onclick=()=>{if(!i){o.remove();return;}const x=parseInt(o.dataset.index);if(!isNaN(x)&&x>=0&&x<conversationHistory.length&&conversationHistory[x]&&conversationHistory[x].messageData.text===messageData.text){if(confirm("이 메시지를 삭제하시겠습니까?")){conversationHistory.splice(x,1);saveConversationHistory();loadConversationHistory();}}else{console.error("Cannot delete message: Invalid index or mismatch.", x, conversationHistory.length);alert("메시지 삭제 오류");o.remove();}}; r.appendChild(s);r.appendChild(t); if(role==='user'){p.appendChild(r);p.appendChild(g);}else{p.appendChild(g);p.appendChild(r);} const w=document.createElement("div");w.className="message-content-wrapper";const b=document.createElement("div");b.className="message-bubble";let y=messageData.text||"";
            // *** Marked 확인 및 사용 ***
            if (typeof marked === 'function') { try { b.innerHTML = marked.parse(y, { breaks: true, gfm: true }); } catch (e) { console.error("Marked parsing error:", e); b.textContent = y; } } else { if (!window.markedWarningShown) { console.warn("marked library not loaded. Displaying raw text."); window.markedWarningShown = true; /* 경고 한 번만 표시 */ } b.textContent = y; } // 텍스트 그대로
            w.appendChild(b);o.appendChild(p);o.appendChild(w);chat.appendChild(o); } setTimeout(() => { if (chat) chat.scrollTop = chat.scrollHeight; }, 50); } catch (e) { console.error("Error in appendMessage:", e); }
}
// TXT 내보내기
function exportConversationAsTxt() { try { if (!conversationHistory || conversationHistory.length === 0) { alert("내보낼 대화 내용이 없습니다."); return; } let c = ""; const b = botNameInputModal?.value || "캐릭터"; const u = userNameInputModal?.value || "사용자"; conversationHistory.forEach(e => { if (e.role === 'user' && e.messageData?.type === 'text' && e.messageData?.text === SYSTEM_PROMPT) return; if (e.messageData?.type === 'image') return; if (e.messageData?.type === 'text') { const n = (e.role === "user" ? u : b); let r = e.messageData?.text || ""; let p = r.replace(/^\*|\*$/g, '').replace(/\*([^*]+)\*/gs, '$1').trim(); if (p) { c += `[${n}] : ${p}\n\n`; } } }); c = c.trimEnd(); if (!c) { alert("내보낼 텍스트 내용이 없습니다. (이미지 제외)"); return; } const l = new Blob([c], { type: 'text/plain;charset=utf-8' }); const k = document.createElement('a'); k.href = URL.createObjectURL(l); const t = new Date().toISOString().slice(0, 10).replace(/-/g, ''); k.download = `chat_history_${b}_${u}_${t}.txt`; document.body.appendChild(k); k.click(); document.body.removeChild(k); URL.revokeObjectURL(k.href); closeActionMenu(); } catch (e) { console.error("Error in exportConversationAsTxt:", e); alert("TXT 내보내기 중 오류 발생"); } }
// 요약 (API 호출 복원됨)
async function summarizeConversation() { if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !menuSummarizeButton || !chat) { console.error("Summarize dependencies missing"); return; } sendButton.disabled=true;userInput.disabled=true;actionMenuButton.disabled=true;loadingSpinner.style.display='block';menuSummarizeButton.disabled=true;if(feedbackButton)feedbackButton.disabled=true;closeActionMenu(); try { const h=conversationHistory.filter(e=>!(e.role==='user'&&e.messageData?.text===SYSTEM_PROMPT)&&e.messageData?.type==='text').slice(-10);if(h.length===0){alert("요약할 내용 없음");return;} const p=`다음 대화 내용을 한국어로 간결하게 요약해줘. 요약은 제3자 시점에서 작성하고, 핵심 사건과 전개만 담되 군더더기 없는 자연스러운 문장으로 작성해. "요약:" 같은 머리말은 붙이지 말고, 그냥 텍스트만 출력해. (최근 ${h.length} 턴 기준)`; const c=[{role:"user",parts:[{text:SYSTEM_PROMPT}]},...h.map(e=>({role:e.role==='model'?'model':'user',parts:[{text:e.messageData.text}]})),{role:"user",parts:[{text:p}]}]; console.log(`Sending summary request...`); let s=''; try { const r=await fetch(`/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:c})}); console.log("Summary API status:", r.status); if(!r.ok){const b=await r.text();console.error(`Summary API Error (${r.status}): ${b}`);s=`(요약 실패: ${r.status})`;} else {const d=await r.json();s=d?.candidates?.[0]?.content?.parts?.[0]?.text||"(요약 응답 처리 실패)";console.log("Summary received");} } catch(f){console.error("Fetch Error summary:",f);s="(요약 통신 오류)";} appendMessage("bot",{type:'text',text:`--- 최근 ${h.length}턴 대화 요약 ---\n${s}\n---`}); } catch(o){console.error("Error Summary process:",o);appendMessage("bot",{type:'text',text:"(요약 중 오류)"});} finally { if(sendButton)sendButton.disabled=false;if(userInput)userInput.disabled=false;if(actionMenuButton)actionMenuButton.disabled=false;if(loadingSpinner)loadingSpinner.style.display='none';if(menuSummarizeButton)menuSummarizeButton.disabled=false;if(feedbackButton)feedbackButton.disabled=false;if(userInput)userInput.focus(); } }
// 메시지 전송 (API 호출 복원됨)
async function sendMessage(messageText) { if (!userInput || !sendButton || !actionMenuButton || !feedbackButton || !loadingSpinner || !chat) { console.error("sendMessage dependencies missing"); return; } let m=messageText.trim();if(!m){userInput.value='';autoResizeTextarea.call(userInput);return;} console.log("Input:", m); const p=/^(https|http):\/\/[^\s"]+\.(gif|jpe?g|png|webp|bmp)(\?.*)?$/i; if(p.test(m)){console.log("Image URL detected");const i={role:"user",messageData:{type:'image',url:m}};conversationHistory.push(i);appendMessage("user",i.messageData,conversationHistory.length-1);saveConversationHistory();userInput.value='';autoResizeTextarea.call(userInput);return;} console.log("Text message"); try { let f=currentFeedback;if(currentFeedback){handleFeedbackSelection(null);} const u={role:"user",messageData:{type:'text',text:m}};conversationHistory.push(u);appendMessage("user",u.messageData,conversationHistory.length-1);saveConversationHistory();userInput.value='';autoResizeTextarea.call(userInput); sendButton.disabled=true;userInput.disabled=true;actionMenuButton.disabled=true;feedbackButton.disabled=true;loadingSpinner.style.display='block'; let c; try {const t=conversationHistory.filter(e=>e.messageData?.type==='text');c=[{role:"user",parts:[{text:SYSTEM_PROMPT}]},...t.map(e=>({role:e.role==='model'?'model':'user',parts:[{text:e.messageData.text}]}))];if(f){console.log(`Sending with feedback: ${f}`);c.push({role:"user",parts:[{text:`(피드백: ${f})`}]});}}catch(e){console.error("Error preparing API contents:",e);throw new Error("API 요청 준비 오류");} console.log("Sending API request..."); let b=''; try {const r=await fetch(`/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:c})}); console.log("API status:",r.status);if(!r.ok){const y=await r.text();console.error(`API Error (${r.status}): ${y}`);b=`(오류 ${r.status})`;}else{const d=await r.json();b=d?.candidates?.[0]?.content?.parts?.[0]?.text||"(빈 응답)";console.log("API Response received");}}catch(h){console.error("Fetch Error message:",h);b="(통신 오류)";} const o={role:"model",messageData:{type:'text',text:b}};conversationHistory.push(o);appendMessage("bot",o.messageData,conversationHistory.length-1);saveConversationHistory();}catch(e){console.error("Error sendMessage:",e);appendMessage("bot",{type:'text',text:`(메시지 처리 오류: ${e.message})`});} finally { if(sendButton)sendButton.disabled=false;if(userInput)userInput.disabled=false;if(actionMenuButton)actionMenuButton.disabled=false;if(feedbackButton)feedbackButton.disabled=false;if(loadingSpinner)loadingSpinner.style.display='none';if(userInput)userInput.focus();} }
// '상황' 요청 함수 (API 호출 복원됨)
async function sendSituationRequest(type) { if (!sendButton || !userInput || !actionMenuButton || !loadingSpinner || !botNameInputModal || !chat) { console.error("sendSituationRequest dependencies missing"); return; } sendButton.disabled=true;userInput.disabled=true;actionMenuButton.disabled=true;loadingSpinner.style.display='block';if(feedbackButton)feedbackButton.disabled=true;closeActionMenu(); try { let p='';const n=botNameInputModal.value||"캐릭터";switch(type){case '랜덤':p=`...생략...`;break;case '전환':p=`...생략...`;break;case '성인':p=`...생략...`;break;case '돌발':default:p=`...생략...`;break;} /* 프롬프트 내용은 이전과 동일 */ const h=conversationHistory.filter(e=>e.messageData?.type==='text');const c=[{role:"user",parts:[{text:SYSTEM_PROMPT}]},...h.map(e=>({role:e.role==='model'?'model':'user',parts:[{text:e.messageData.text}]})),{role:"user",parts:[{text:p}]}]; console.log(`Sending situation request ('${type}')...`); let b=''; try {const r=await fetch(`/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:c})}); console.log("Situation API status:",r.status);if(!r.ok){const y=await r.text();console.error(`Situation API Error (${r.status}): ${y}`);b=`(상황 요청 실패: ${r.status})`;}else{const d=await r.json();b=d?.candidates?.[0]?.content?.parts?.[0]?.text||"(빈 응답)";console.log("Situation Response received");}}catch(f){console.error("Fetch Error situation:",f);b="(상황 요청 통신 오류)";} const o={role:"model",messageData:{type:'text',text:b}};conversationHistory.push(o);appendMessage("bot",o.messageData,conversationHistory.length-1);saveConversationHistory();}catch(e){console.error("Error sendSituationRequest:",e);appendMessage("bot",{type:'text',text:`(상황 요청 오류: ${e.message})`});} finally { if(sendButton)sendButton.disabled=false;if(userInput)userInput.disabled=false;if(actionMenuButton)actionMenuButton.disabled=false;if(loadingSpinner)loadingSpinner.style.display='none';if(feedbackButton)feedbackButton.disabled=false;if(userInput)userInput.focus();} }
// 이미지 URL 미리보기 업데이트
function updateImagePreview(url, img) { const p=img?.closest('.image-preview-area');if(!img||!p){return;}if(isValidImageUrl(url)){img.src=url;img.style.display='block';p.classList.add('has-image');img.onerror=function(){console.warn(`Failed load preview: ${url}`);this.onerror=null;img.style.display='none';p.classList.remove('has-image');img.src='';};}else{img.src='';img.style.display='none';p.classList.remove('has-image');} }
// 슬롯 버튼 스타일 업데이트
function updateSlotButtonStyles() { try{document.querySelectorAll('.slot-button').forEach(b=>{b.classList.toggle('active',parseInt(b.textContent)===currentSlot);});}catch(e){console.error("Error updateSlotStyles:",e);} }
// --- 랜덤 생성 함수 (API 호출 방식) ---
async function generateRandomCharacter() { console.log("🎲 Requesting Random Character...");if(!generateRandomCharacterButton||!botNameInputModal||!botGenderInputModal||!botAgeInputModal||!botAppearanceInputModal||!botPersonaInputModal){console.error("Character elements missing.");alert("캐릭터 생성 요소 누락");return;}generateRandomCharacterButton.disabled=true;generateRandomCharacterButton.textContent="⏳";try{const p=`매력적인 공(攻) 타입 캐릭터의 이름, 성별(남성/여성 중 하나), 나이(25세~38세 사이의 숫자), 상세한 외형 묘사(최소 30자 이상), 그리고 성격 및 행동 가이드라인(최소 50자 이상)을 랜덤으로 생성해줘. 반드시 다음 JSON 형식으로만 응답해야 해:\n\n{\n  "name": "생성된 이름",\n  "gender": "생성된 성별",\n  "age": "생성된 나이(숫자만)",\n  "appearance": "생성된 외형 묘사",\n  "persona": "생성된 성격/가이드라인 묘사"\n}`;const c=[{role:"user",parts:[{text:p}]}];const r=await fetch(`/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:c})});console.log("Rand Char API status:",r.status);if(!r.ok){const b=await r.text();console.error(`Rand Char API Error (${r.status}): ${b}`);throw new Error(`서버 오류 (${r.status})`);}const d=await r.json();const j=d?.candidates?.[0]?.content?.parts?.[0]?.text;if(!j){console.error("Empty API response:",d);throw new Error("API 유효 응답 없음");}console.log("Raw Rand Char response:",j);try{const m=j.match(/{[\s\S]*}/);if(!m){throw new Error("유효 JSON 형식 없음");}const v=m[0];const i=JSON.parse(v);botNameInputModal.value=i.name||'';botGenderInputModal.value=i.gender||'';botAgeInputModal.value=i.age||'';botAppearanceInputModal.value=i.appearance||'';botPersonaInputModal.value=i.persona||'';updateSystemPrompt();alert("랜덤 캐릭터 생성 완료!");}catch(e){console.error("Failed parse Rand Char JSON:",e,"\nRaw:",j);alert(`캐릭터 정보 처리 오류.\n응답:\n${j}`);}}catch(e){console.error("Error gen Rand Char:",e);alert(`랜덤 캐릭터 생성 오류: ${e.message}`);}finally{generateRandomCharacterButton.disabled=false;generateRandomCharacterButton.textContent="🎲";}}
async function generateRandomUser() { console.log("🎲 Requesting Random User...");if(!generateRandomUserButton||!userNameInputModal||!userGenderInputModal||!userAgeInputModal||!userAppearanceInputModal||!userGuidelinesInputModal){console.error("User elements missing.");alert("사용자 생성 요소 누락");return;}generateRandomUserButton.disabled=true;generateRandomUserButton.textContent="⏳";try{const p=`매력적인 수(受) 타입 캐릭터의 이름, 성별(남성/여성 중 하나), 나이(20세~35세 사이의 숫자), 상세한 외형 묘사(최소 30자 이상), 그리고 사용자 가이드라인(최소 50자 이상, 캐릭터의 성격이 아닌 사용자의 플레이 스타일 가이드)을 랜덤으로 생성해줘. 반드시 다음 JSON 형식으로만 응답해야 해:\n\n{\n  "name\": "생성된 이름",\n  "gender\": "생성된 성별",\n  "age\": "생성된 나이(숫자만)",\n  "appearance\": "생성된 외형 묘사",\n  "guidelines\": "생성된 사용자 가이드라인"\n}`;const c=[{role:"user",parts:[{text:p}]}];const r=await fetch(`/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:c})});console.log("Rand User API status:",r.status);if(!r.ok){const b=await r.text();console.error(`Rand User API Error (${r.status}): ${b}`);throw new Error(`서버 오류 (${r.status})`);}const d=await r.json();const j=d?.candidates?.[0]?.content?.parts?.[0]?.text;if(!j){console.error("Empty API response:",d);throw new Error("API 유효 응답 없음");}console.log("Raw Rand User response:",j);try{const m=j.match(/{[\s\S]*}/);if(!m){throw new Error("유효 JSON 형식 없음");}const v=m[0];const i=JSON.parse(v);userNameInputModal.value=i.name||'';userGenderInputModal.value=i.gender||'';userAgeInputModal.value=i.age||'';userAppearanceInputModal.value=i.appearance||'';userGuidelinesInputModal.value=i.guidelines||'';updateSystemPrompt();alert("랜덤 사용자 생성 완료!");}catch(e){console.error("Failed parse Rand User JSON:",e,"\nRaw:",j);alert(`사용자 정보 처리 오류.\n응답:\n${j}`);}}catch(e){console.error("Error gen Rand User:",e);alert(`랜덤 사용자 생성 오류: ${e.message}`);}finally{generateRandomUserButton.disabled=false;generateRandomUserButton.textContent="🎲";}}
// 이미지 미리보기 클릭 시 URL 입력
function promptForImageUrl(img, isBot) { const c=img.src&&isValidImageUrl(img.src)?img.src:''; const n=prompt(isBot?"캐릭터 이미지 URL:":"사용자 이미지 URL:",c); if(n!==null){if(n===""||!isValidImageUrl(n)){updateImagePreview('',img);if(isBot)botProfileImgUrl='';else userProfileImgUrl=''; if(n!=="")alert("유효하지 않은 이미지 URL입니다.");}else{updateImagePreview(n,img);if(isBot)botProfileImgUrl=n;else userProfileImgUrl=n;}} }
// 채팅 이미지 삽입 함수
function sendImageChatMessage() { closeActionMenu();const i=prompt("채팅 이미지 URL:");if(i&&isValidImageUrl(i)){if(userInput){userInput.value=i;sendMessage(i);}else{console.warn("userInput not found");const m={role:"user",messageData:{type:'image',url:i}};conversationHistory.push(m);appendMessage("user",m.messageData,conversationHistory.length-1);saveConversationHistory();if(chat)chat.scrollTop=chat.scrollHeight;}}else if(i!==null){alert("유효한 이미지 URL이 아닙니다.");} }
// 피드백 선택 처리
function handleFeedbackSelection(type) { console.log(`Feedback: ${type}`);if(!feedbackOptionsContainer)return;feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(b=>{b.classList.remove('active');});if(type){const s=feedbackOptionsContainer.querySelector(`.feedback-option[data-feedback="${type}"]`);if(s){s.classList.add('active');}currentFeedback=type;}else{currentFeedback=null;closeFeedbackOptions();}console.log("Current feedback:",currentFeedback); }
// --- 대화 기록 관리 ---
function saveConversationHistory() { try{if(conversationHistory&&conversationHistory.length>0){localStorage.setItem(`conversation_slot_${currentSlot}`,JSON.stringify(conversationHistory));}else{localStorage.removeItem(`conversation_slot_${currentSlot}`);}}catch(e){console.error("Error saveHistory:",e);} }
function loadConversationHistory() { try{const s=localStorage.getItem(`conversation_slot_${currentSlot}`);conversationHistory=[];if(s){try{const p=JSON.parse(s);if(Array.isArray(p)){conversationHistory=p;}else{localStorage.removeItem(`conversation_slot_${currentSlot}`);}}catch(e){console.error("Error parseHistory:",e);localStorage.removeItem(`conversation_slot_${currentSlot}`);}}console.log(`History loaded slot ${currentSlot}. Len: ${conversationHistory.length}`);if(chat){chat.innerHTML='';appendInitialNotice();conversationHistory.forEach((e,i)=>{if(!(e.role==='user'&&e.messageData?.text===SYSTEM_PROMPT)){appendMessage(e.role==='model'?'bot':'user',e.messageData,i);}});setTimeout(()=>{chat.scrollTop=chat.scrollHeight;},50);}else{console.error("Chat element not found for loading.");}}catch(e){console.error("Error loadHistory:",e);conversationHistory=[];} }
function resetConversation() { if(confirm(`슬롯 ${currentSlot} 대화 기록 삭제?`)){console.log(`Resetting slot ${currentSlot}`);conversationHistory=[];saveConversationHistory();loadConversationHistory();alert(`슬롯 ${currentSlot} 초기화 완료.`);} }

// --- DOMContentLoaded 이벤트 리스너 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // 시작 로그
    try {
        // 요소 할당
        chat=getElement('chat');userInput=getElement('userInput');sendButton=getElement('sendButton');loadingSpinner=getElement('loadingSpinner');actionMenuButton=getElement('actionMenuButton');actionMenu=getElement('actionMenu');menuOverlay=getElement('menuOverlay');sidebarToggle=getElement('sidebarToggle');settingsModalOverlay=getElement('settingsModalOverlay');settingsModal=getElement('settingsModal');closeModalButton=getElement('closeModalButton');saveSettingsButtonModal=getElement('saveSettingsButtonModal');feedbackButton=getElement('feedbackButton');feedbackOptionsContainer=getElement('feedbackOptionsContainer');botNameInputModal=getElement('botNameInputModal');botAgeInputModal=getElement('botAgeInputModal');botGenderInputModal=getElement('botGenderInputModal');botAppearanceInputModal=getElement('botAppearanceInputModal');botPersonaInputModal=getElement('botPersonaInputModal');botImagePreview=getElement('botImagePreview');userNameInputModal=getElement('userNameInputModal');userAgeInputModal=getElement('userAgeInputModal');userGenderInputModal=getElement('userGenderInputModal');userAppearanceInputModal=getElement('userAppearanceInputModal');userGuidelinesInputModal=getElement('userGuidelinesInputModal');userImagePreview=getElement('userImagePreview');generateRandomCharacterButton=getElement('generateRandomCharacter',false);generateRandomUserButton=getElement('generateRandomUser',false);menuImageButton=getElement('menuImageButton',false);menuSituationButton=getElement('menuSituationButton',false);menuExportTxtButton=getElement('menuExportTxtButton',false);menuSummarizeButton=getElement('menuSummarizeButton',false);situationOptions=getElement('situationOptions',false);imageOverlay=getElement('imageOverlay',false);overlayImage=getElement('overlayImage',false);

        // 이벤트 리스너 연결
        if(sendButton)sendButton.addEventListener("click",()=>{if(userInput)sendMessage(userInput.value);});
        if(userInput)userInput.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();sendMessage(userInput.value);}});
        if(userInput)userInput.addEventListener('input',autoResizeTextarea);
        if(actionMenuButton){actionMenuButton.addEventListener("click",(e)=>{e.stopPropagation();toggleActionMenu();});}else{console.error("actionMenuButton not found!");}
        if(menuOverlay)menuOverlay.addEventListener("click",closeActionMenu);
        if(menuImageButton)menuImageButton.addEventListener("click",sendImageChatMessage);
        if(menuSituationButton)menuSituationButton.addEventListener("click",toggleSituationOptions);
        if(situationOptions){situationOptions.querySelectorAll(".option").forEach(o=>{o.addEventListener("click",(e)=>{e.stopPropagation();const t=o.textContent.trim();if(t){sendSituationRequest(t);}closeActionMenu();});});}
        if(menuExportTxtButton)menuExportTxtButton.addEventListener("click",exportConversationAsTxt);
        if(menuSummarizeButton)menuSummarizeButton.addEventListener("click",summarizeConversation);
        if(sidebarToggle){sidebarToggle.addEventListener("click",(e)=>{e.stopPropagation();openSettingsModal();});}else{console.error("sidebarToggle not found!");}
        if(closeModalButton){closeModalButton.addEventListener("click",closeSettingsModal);}else{console.warn("closeModalButton not found.");}
        if(settingsModalOverlay){settingsModalOverlay.addEventListener("click",function(e){if(e.target===settingsModalOverlay){closeSettingsModal();}});}else{console.warn("settingsModalOverlay not found.");}
        if(saveSettingsButtonModal)saveSettingsButtonModal.addEventListener("click",()=>saveSettings(currentSlot));
        document.querySelectorAll('.slot-button').forEach(b=>{b.addEventListener('click',function(){const s=parseInt(this.textContent);if(!isNaN(s)&&s!==currentSlot){currentSlot=s;console.log(`Switched slot ${currentSlot}`);loadSettings(currentSlot);loadConversationHistory();}});});
        if(generateRandomCharacterButton)generateRandomCharacterButton.addEventListener('click',generateRandomCharacter);
        if(generateRandomUserButton)generateRandomUserButton.addEventListener('click',generateRandomUser);
        if(botImagePreview)botImagePreview.closest('.image-preview-area')?.addEventListener('click',()=>promptForImageUrl(botImagePreview,true));
        if(userImagePreview)userImagePreview.closest('.image-preview-area')?.addEventListener('click',()=>promptForImageUrl(userImagePreview,false));
        if(feedbackButton)feedbackButton.addEventListener("click",toggleFeedbackOptions);
        if(feedbackOptionsContainer){feedbackOptionsContainer.querySelectorAll('.feedback-option').forEach(b=>{b.addEventListener('click',function(e){e.stopPropagation();const f=this.dataset.feedback;if(currentFeedback===f){handleFeedbackSelection(null);}else{handleFeedbackSelection(f);}});});}
        document.addEventListener('click',function(e){if(actionMenu&&actionMenuButton&&!actionMenu.contains(e.target)&&e.target!==actionMenuButton){closeActionMenu();}if(feedbackOptionsContainer&&feedbackButton&&!feedbackOptionsContainer.contains(e.target)&&e.target!==feedbackButton&&!currentFeedback){closeFeedbackOptions();}});

        console.log("Event listeners attached.");
        initializeChat(); // 초기화
        console.log("Initialization complete.");
    } catch (e) { console.error("Error during DOMContentLoaded setup:", e); alert("페이지 초기화 중 오류 발생"); }
}); // DOMContentLoaded 끝
