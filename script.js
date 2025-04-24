// 이미지 URL 변수는 초기 로드 시 DOMContentLoaded에서 설정값으로 업데이트됩니다.
let userProfileImgUrl = "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
let botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
let conversationHistory = [];
let SYSTEM_PROMPT = '';
let currentSlot = 1; // 현재 활성화된 슬롯 번호 (기본값 1)

// SYSTEM_PROMPT를 동적으로 구성하기 위한 기본 템플릿 (AI 역할 변경 및 포맷 지침 강화)
// 이안 관련 내용을 제거하여 범용적인 템플릿으로 수정
const SYSTEM_PROMPT_TEMPLATE = `
## 기본 역할
당신은 {botName}이라는 공(攻) 캐릭터의 시점으로 소설을 집필하는 **소설 작가**입니다.
사용자는 수(受) 캐릭터({userName})로, 당신의 파트너입니다.
**항상 3인칭 시점**으로 서술하되, **작가로서 섬세하고 감각적인 표현**으로 장면을 구성해야 합니다.
**절대 사용자({userName})의 말, 감정, 행동을 묘사하지 마십시오.**

## 출력 형식
- **400자 이상의 묘사 문단 × 최대 3개**
- 각 묘사 사이에는 **100자 이내의 감정이 담긴 대사**
- 총 응답은 **700자 이상**이어야 하며, 묘사와 대사가 반드시 교차 구조로 작성되어야 합니다.

## 캐릭터 정보
<character>
Name: {botName}
Gender: {botGender}
Age: {botAge}
Appearance: {botAppearance}
Persona: {botPersona}
</character>

## 사용자 정보
<user>
Name: {userName}
Gender: {userGender}
Age: {userAge}
Appearance: {userAppearance}
Guidelines: {userGuidelines}
</user>

## 현재 상황
{situation}

## 대화 예시
<example>
봇: (묘사)
사용자: "대사"
봇: (묘사)
사용자: "대사"
봇: (묘사)
</example>

## 지침
- 사용자의 입력을 바탕으로 3인칭 소설 문체를 유지하며 응답을 생성합니다.
- 묘사는 풍부하고 감각적인 언어를 사용합니다.
- 대사는 캐릭터의 감정과 상황을 드러내도록 작성합니다.
- 설정된 캐릭터와 사용자 정보를 철저히 준수합니다.
- 상황 묘사에 집중하고, 사용자 캐릭터의 직접적인 행동 묘사는 피합니다.
- 응답은 반드시 묘사 - 대사 - 묘사 - 대사 - 묘사 순서의 구조를 따릅니다.
- 상황 프롬프트가 제공되면 해당 상황에 맞춰 스토리를 진행합니다.
- 성인 상황 요청 시, 플랫폼 정책을 준수하는 선에서 수위 조절하여 묘사합니다. 직접적인 성적 행위 묘사는 피하고 암시적으로 표현합니다.
- 모델의 답변이 중간에 끊기면, "(_묘사가 이어진다_)" 와 같은 표현으로 다음 턴에 이어서 작성하도록 지시합니다.

`;


// DOM 요소 캐싱
const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingSpinner = document.getElementById('loadingSpinner');
const actionMenuButton = document.getElementById('actionMenuButton');
const actionMenu = document.getElementById('actionMenu');
const menuImageButton = document.getElementById('menuImageButton');
const menuSituationButton = document.getElementById('menuSituationButton'); // 추가된 상황 버튼
const situationOptions = document.getElementById('situationOptions'); // 추가된 상황 옵션 컨테이너
const menuSummarizeButton = document.getElementById('menuSummarizeButton'); // 요약 버튼
const menuExportTxtButton = document.getElementById('menuExportTxtButton'); // TXT 저장 버튼

const settingsModalOverlay = document.getElementById('settingsModalOverlay');
const closeModalButton = document.getElementById('closeModalButton');
const sidebarToggle = document.getElementById('sidebarToggle');

// 모달 내 입력 필드
const botNameInputModal = document.getElementById('botNameInputModal');
const botGenderInputModal = document.getElementById('botGenderInputModal');
const botAgeInputModal = document.getElementById('botAgeInputModal');
const botAppearanceInputModal = document.getElementById('botAppearanceInputModal');
const botPersonaInputModal = document.getElementById('botPersonaInputModal');
const botImageUrlInputModal = document.getElementById('botImageUrlInputModal'); // Hidden via CSS
const botImagePreview = document.getElementById('botImagePreview');

const userNameInputModal = document.getElementById('userNameInputModal');
const userGenderInputModal = document.getElementById('userGenderInputModal');
const userAgeInputModal = document.getElementById('userAgeInputModal');
const userAppearanceInputModal = document.getElementById('userAppearanceInputModal');
const userGuidelinesInputModal = document.getElementById('userGuidelinesInputModal');
const userImageUrlInputModal = document.getElementById('userImageUrlInputModal'); // Hidden via CSS
const userImagePreview = document.getElementById('userImagePreview');


const saveSettingsButtonModal = document.getElementById('saveSettingsButtonModal');

// 이미지 오버레이 요소 (채팅 이미지 클릭 시 사용)
const imageOverlay = document.getElementById('imageOverlay');
const overlayImage = document.getElementById('overlayImage');


// --- 기능 함수 ---

// SYSTEM_PROMPT 업데이트 함수
function updateSystemPrompt() {
    const botName = botNameInputModal.value || 'Character'; // 기본값 설정
    const botGender = botGenderInputModal.value || '정보 없음';
    const botAge = botAgeInputModal.value || '정보 없음';
    const botAppearance = botAppearanceInputModal.value || '정보 없음';
    const botPersona = botPersonaInputModal.value || '특별한 성격이나 특징 없음';

    const userName = userNameInputModal.value || 'User'; // 기본값 설정
    const userGender = userGenderInputModal.value || '정보 없음';
    const userAge = userAgeInputModal.value || '정보 없음';
    const userAppearance = userAppearanceInputModal.value || '정보 없음';
    const userGuidelines = userGuidelinesInputModal.value || '특별한 지침 없음';

    // situation 부분은 메시지 전송 시 동적으로 추가됩니다.
    const situation = ''; // 설정 모달에서는 상황을 직접 설정하지 않음

    SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
        .replace(/{botName}/g, botName)
        .replace(/{botGender}/g, botGender)
        .replace(/{botAge}/g, botAge)
        .replace(/{botAppearance}/g, botAppearance)
        .replace(/{botPersona}/g, botPersona)
        .replace(/{userName}/g, userName)
        .replace(/{userGender}/g, userGender)
        .replace(/{userAge}/g, userAge)
        .replace(/{userAppearance}/g, userAppearance)
        .replace(/{userGuidelines}/g, userGuidelines)
        .replace(/{situation}/g, situation); // 초기 프롬프트에는 상황 정보 없음
}

// 설정 로드 함수
function loadSettings(slot) {
    const settings = localStorage.getItem(`characterChatSettings_slot_${slot}`);
    if (settings) {
        const parsedSettings = JSON.parse(settings);
        botNameInputModal.value = parsedSettings.botName || '';
        botGenderInputModal.value = parsedSettings.botGender || '';
        botAgeInputModal.value = parsedSettings.botAge || '';
        botAppearanceInputModal.value = parsedSettings.botAppearance || '';
        botPersonaInputModal.value = parsedSettings.botPersona || '';
        botImageUrlInputModal.value = parsedSettings.botImageUrl || ''; // 히든 필드 업데이트
        updateImagePreview(botImageUrlInputModal.value, botImagePreview); // 미리보기 업데이트

        userNameInputModal.value = parsedSettings.userName || '';
        userGenderInputModal.value = parsedSettings.userGender || '';
        userAgeInputModal.value = parsedSettings.userAge || '';
        userAppearanceInputModal.value = parsedSettings.userAppearance || '';
        userGuidelinesInputModal.value = parsedSettings.userGuidelines || '';
        userImageUrlInputModal.value = parsedSettings.userImageUrl || ''; // 히든 필드 업데이트
        updateImagePreview(userImageUrlInputModal.value, userImagePreview); // 미리보기 업데이트

        // 전역 이미지 URL 변수 업데이트
        userProfileImgUrl = userImageUrlInputModal.value || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
        botProfileImgUrl = botImageUrlInputModal.value || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";


        updateSystemPrompt(); // SYSTEM_PROMPT 업데이트
        console.log(`Settings loaded from slot ${slot}`);

    } else {
        // 설정이 없을 경우 기본값 또는 빈 값으로 초기화
        botNameInputModal.value = '';
        botGenderInputModal.value = '';
        botAgeInputModal.value = '';
        botAppearanceInputModal.value = '';
        botPersonaInputModal.value = '';
        botImageUrlInputModal.value = '';
        updateImagePreview('', botImagePreview);

        userNameInputModal.value = '';
        userGenderInputModal.value = '';
        userAgeInputModal.value = '';
        userAppearanceInputModal.value = '';
        userGuidelinesInputModal.value = '';
        userImageUrlInputModal.value = '';
        updateImagePreview('', userImagePreview);

        // 전역 이미지 URL 변수 기본값으로 설정
        userProfileImgUrl = "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
        botProfileImgUrl = "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";

        updateSystemPrompt(); // SYSTEM_PROMPT 기본값으로 업데이트
        console.log(`No settings found for slot ${slot}. Using default.`);
    }
}

// 설정 저장 함수
function saveSettings(slot) {
    const settings = {
        botName: botNameInputModal.value,
        botGender: botGenderInputModal.value,
        botAge: botAgeInputModal.value,
        botAppearance: botAppearanceInputModal.value,
        botPersona: botPersonaInputModal.value,
        botImageUrl: botImageUrlInputModal.value, // 히든 필드 값 저장

        userName: userNameInputModal.value,
        userGender: userGenderInputModal.value,
        userAge: userAgeInputModal.value,
        userAppearance: userAppearanceInputModal.value,
        userGuidelines: userGuidelinesInputModal.value,
        userImageUrl: userImageUrlInputModal.value // 히든 필드 값 저장
    };
    localStorage.setItem(`characterChatSettings_slot_${slot}`, JSON.stringify(settings));

     // 전역 이미지 URL 변수 업데이트 (저장 시 반영)
     userProfileImgUrl = settings.userImageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
     botProfileImgUrl = settings.botImageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";


    updateSystemPrompt(); // 저장 후 SYSTEM_PROMPT 업데이트
    console.log(`Settings saved to slot ${slot}`);
    alert(`설정 슬롯 ${slot}에 저장되었습니다.`);
}

// 슬롯 버튼 스타일 업데이트 함수
function updateSlotButtonStyles() {
    document.querySelectorAll('.slot-button').forEach(button => {
        const slotNumber = parseInt(button.textContent);
        if (slotNumber === currentSlot) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}


// 이미지 미리보기 업데이트 함수 (URL이 유효하면 이미지 표시)
function updateImagePreview(imageUrl, imgElement) {
    if (imageUrl) {
        imgElement.src = imageUrl;
        // 이미지 로드 성공 또는 실패 감지 (오류 시 대체 텍스트 표시)
        imgElement.onerror = function() {
            imgElement.src = ''; // 이미지 로드 실패 시 src 비우기 (CSS에서 대체 텍스트 표시)
            console.error("Image failed to load:", imageUrl);
        };
         imgElement.onload = function() {
            // 이미지 로드 성공 시 특별히 할 일은 없지만, 에러 핸들러 초기화 가능
             imgElement.onerror = null;
         };

    } else {
        imgElement.src = ''; // URL이 없으면 src 비우기 (CSS에서 대체 텍스트 표시)
         imgElement.onerror = null; // 에러 핸들러 초기화
    }
}


// 메시지 표시 함수
function displayMessage(message, sender, imageUrl = null, isImage = false) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', sender);

    const profileImgElement = document.createElement('img');
    profileImgElement.classList.add('profile-img');
    // 프로필 이미지 URL 설정 (전역 변수 사용)
    profileImgElement.src = (sender === 'user' ? userProfileImgUrl : botProfileImgUrl);
    profileImgElement.alt = `${sender} profile`;
    // 이미지 로드 오류 시 대체 요소 표시
    profileImgElement.onerror = function() {
        const fallback = document.createElement('div');
        fallback.classList.add('profile-fallback');
        // 기본 텍스트 (예: 'U' 또는 'B')
        fallback.textContent = sender === 'user' ? 'U' : 'B';
        messageContainer.replaceChild(fallback, profileImgElement);
    };

    // 프로필 이미지 클릭 시 모달 열기 (설정 모달) - 기존 기능 유지
     profileImgElement.addEventListener('click', function() {
        openSettingsModal();
     });


    const messageContentWrapper = document.createElement('div');
    messageContentWrapper.classList.add('message-content-wrapper');

    const roleNameElement = document.createElement('div');
    roleNameElement.classList.add('role-name');

     const nameTextElement = document.createElement('span'); // 이름 텍스트 요소
     nameTextElement.classList.add('name-text');
     nameTextElement.textContent = (sender === 'user' ? (userNameInputModal.value || 'User') : (botNameInputModal.value || 'Character'));
     roleNameElement.appendChild(nameTextElement);


    // 메시지 삭제 버튼
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-btn');
    deleteButton.innerHTML = '&times;'; // '×' 문자
    deleteButton.title = '메시지 삭제';
    deleteButton.addEventListener('click', () => {
        // 메시지 삭제 로직
        // conversationHistory에서 해당 메시지 제거
        const index = Array.from(chat.children).indexOf(messageContainer);
        if (index > -1) {
             // 인덱스 + 1은 메시지 순서에 해당 (notice 제외)
             // 실제 conversationHistory 인덱스는 0부터 시작
             // 공지 메시지는 conversationHistory에 저장되지 않으므로 인덱스 보정 필요
             // 간단하게는 메시지 객체 자체를 history에서 찾아서 제거
            const messageToRemove = conversationHistory.find(msg => msg.text === message && msg.sender === sender && msg.imageUrl === imageUrl && msg.isImage === isImage);
            if (messageToRemove) {
                const historyIndex = conversationHistory.indexOf(messageToRemove);
                if (historyIndex > -1) {
                    conversationHistory.splice(historyIndex, 1);
                }
            }
            messageContainer.remove(); // DOM에서 메시지 요소 제거
        }
    });
    roleNameElement.appendChild(deleteButton); // 역할 이름 옆에 삭제 버튼 추가


    if (isImage && imageUrl) {
        // 이미지 메시지인 경우
        const imageAnnouncement = document.createElement('div');
        imageAnnouncement.classList.add('image-announcement');

        const imageFadeContainer = document.createElement('div');
        imageFadeContainer.classList.add('image-fade-container');

        const imgElement = document.createElement('img');
        imgElement.classList.add('chat-image');
        imgElement.src = imageUrl;
        imgElement.alt = "Image sent";

        // 이미지 클릭 시 오버레이 표시
        imgElement.addEventListener('click', () => {
            openImageOverlay(imageUrl);
        });

        // 이미지 로드 실패 시 텍스트 표시
        imgElement.onerror = function() {
            imgElement.classList.add('error-image'); // Hide the broken image icon
            const errorText = document.createElement('div');
            errorText.classList.add('image-error-text');
            errorText.textContent = "이미지를 로드할 수 없습니다.";
            imageAnnouncement.appendChild(errorText);
            imgElement.remove(); // Remove the problematic img element
        };


        imageFadeContainer.appendChild(imgElement);
        imageAnnouncement.appendChild(imageFadeContainer);
        messageContentWrapper.appendChild(imageAnnouncement);

    } else {
        // 텍스트 메시지인 경우
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');

        // 마크다운 변환 (marked.js 사용)
        let htmlMessage = marked.parse(message);

        // *행동* 부분을 별도로 처리 (기울임체 및 회색) - marked.js의 <em> 태그와 구분
        // 정규식을 사용하여 *...* 패턴을 찾고 <span class="action-description">*...*</span>으로 감싸기
        // 이미 <em> 태그로 감싸진 경우는 처리하지 않도록 조건 추가 (lookbehind)
        htmlMessage = htmlMessage.replace(/(?<!<em[^>]*?>)\*(.+?)\*(?!<\/em>)/g, '<span class="action-description">*$1*</span>');


        messageBubble.innerHTML = htmlMessage;
        messageContentWrapper.appendChild(roleNameElement);
        messageContentWrapper.appendChild(messageBubble);
    }


    // 프로필 이미지를 메시지 컨테이너에 먼저 추가
    messageContainer.appendChild(profileImgElement);
    // 그 다음 메시지 내용을 추가
    messageContainer.appendChild(messageContentWrapper);


    chat.appendChild(messageContainer);
    chat.scrollTop = chat.scrollHeight; // 스크롤 맨 아래로
}


// 이미지 오버레이 열기 함수
function openImageOverlay(imageUrl) {
    overlayImage.src = imageUrl;
    imageOverlay.style.display = 'flex';
}

// 이미지 오버레이 닫기 함수
function closeImageOverlay() {
    imageOverlay.style.display = 'none';
    overlayImage.src = ''; // 이미지 소스 비우기
}


// 메시지 전송 함수 (비동기)
async function sendMessage(situation = '') {
    const text = userInput.value.trim();
    if (!text && !situation) return; // 입력이 없거나 상황이 없으면 전송 안 함

    // 사용자가 입력한 텍스트를 conversationHistory에 추가 (상황 메시지가 아니면)
    if (text) {
         // 사용자 메시지를 자동으로 큰따옴표로 감싸는 함수 호출
         const formattedText = autoQuoteUserInput(text);
         conversationHistory.push({ sender: 'user', text: formattedText });
         displayMessage(formattedText, 'user'); // 사용자 메시지 즉시 표시
    }


    userInput.value = ''; // 입력창 비우기
    autoResizeTextarea.call(userInput); // 입력창 높이 초기화
    sendButton.disabled = true; // 전송 버튼 비활성화
    loadingSpinner.style.display = 'block'; // 로딩 스피너 표시
    actionMenuButton.style.display = 'none'; // + 버튼 숨김
    actionMenu.classList.remove('visible'); // 액션 메뉴 숨김

    // SYSTEM_PROMPT에 현재 상황 추가
    let currentSystemPrompt = SYSTEM_PROMPT;
    if (situation) {
        currentSystemPrompt += `\n## 현재 상황\n${situation}`;
        // 상황 메시지를 채팅창에 표시 (봇 메시지처럼 보이지만 sender는 'situation'으로 구분)
         displayMessage(`[상황]: ${situation}`, 'situation');
         // conversationHistory에는 상황 메시지 추가 안 함 (SYSTEM_PROMPT에 포함되므로)
    }

     // 대화 기록 구성
     // [{ role: 'system', content: SYSTEM_PROMPT }] 형태로 시작
     // 이후 conversationHistory의 각 요소를 { role: sender, content: text } 형태로 추가
     const messages = [{ role: 'system', content: currentSystemPrompt }];

     conversationHistory.forEach(msg => {
         // 이미지 메시지는 텍스트 내용이 없으므로 history에 추가하지 않음
         if (msg.text) {
            messages.push({ role: msg.sender === 'user' ? 'user' : 'model', content: msg.text });
         }
         // 이미지 메시지 자체는 history에 저장되지만, API 호출 시에는 텍스트만 사용
     });


    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gemini-1.5-flash-latest', // 또는 'gemini-1.5-pro-latest' 등 다른 모델 사용 가능
                messages: messages
            }),
        });

        if (!response.ok) {
            // 오류 응답 처리
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;

        // 봇 응답을 conversationHistory에 추가
         conversationHistory.push({ sender: 'bot', text: botResponse });

        // 봇 응답 표시
        displayMessage(botResponse, 'bot');

    } catch (error) {
        console.error('Error sending message:', error);
        // 오류 메시지를 채팅창에 표시
        displayMessage("오류가 발생했습니다. 응답을 가져올 수 없습니다.", 'bot');
         // 오류 발생 시에도 history에 오류 메시지를 추가할지는 결정 필요 (일단 추가하지 않음)
    } finally {
        sendButton.disabled = false; // 전송 버튼 활성화
        loadingSpinner.style.display = 'none'; // 로딩 스피너 숨김
         actionMenuButton.style.display = 'flex'; // + 버튼 다시 표시
    }
}

// textarea 자동 높이 조절 함수
function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    // 최대 높이 설정 (예: 200px)
    const maxHeight = 200;
     if (this.scrollHeight > maxHeight) {
         this.style.height = maxHeight + 'px';
         this.style.overflowY = 'auto'; // 최대 높이 넘으면 스크롤 표시
     } else {
          this.style.overflowY = 'hidden'; // 최대 높이 안 되면 스크롤 숨김
     }

     // 입력창 높이에 맞춰 Input Area의 하단 패딩 조절
     const inputArea = document.getElementById('inputArea');
     const userInput = document.getElementById('userInput');
     // textarea의 실제 높이 + 상하 패딩 + margin 등을 고려해야 정확하지만,
     // 여기서는 textarea의 scrollHeight를 사용하여 근사값으로 조절합니다.
     // Input Area의 전체 높이가 변하면서 레이아웃에 영향을 줄 수 있습니다.
     // CSS의 flex-shrink: 0과 min-height, max-height를 조합하여 textarea 자체의 크기 변화를 제한하고,
     // inputArea의 padding-bottom으로 하단 간격을 확보하는 방식이 더 안정적일 수 있습니다.
     // 현재 CSS는 inputArea에 padding-bottom이 있고, textarea는 min/max-height가 2rem으로 고정되어 있습니다.
     // 따라서 이 autoResizeTextarea 함수는 현재 CSS 구조에서는 textarea 높이 조절에 사용되지 않습니다.
     // 만약 textarea의 resize: none을 제거하고 높이 조절을 허용한다면 이 함수가 필요합니다.
     // 현재는 이 함수가 호출되어도 min/max-height 때문에 높이가 2rem으로 유지됩니다.
     // 스크롤바만 필요하다면 CSS의 overflow-y: auto 또는 hidden만으로 제어하는 것이 좋습니다.
}


// 초기 공지 메시지 표시 함수
function initializeChat() {
    // 공지 메시지 내용
    const noticeText = "✨ 안녕하세요! 오른쪽 위 (≡) 버튼을 눌러 캐릭터와 사용자 설정을 변경해보세요. (+) 버튼을 누르면 사진, 상황 추가 등 다양한 기능을 사용할 수 있습니다.";

    // 공지 메시지 엘리먼트 생성 및 추가
    const noticeElement = document.createElement('div');
    noticeElement.classList.add('initial-notice');
    noticeElement.textContent = noticeText;
    chat.appendChild(noticeElement);

    // 구분선 추가
    const dividerElement = document.createElement('div');
    dividerElement.classList.add('notice-divider');
    chat.appendChild(dividerElement);

    // 스크롤 맨 아래로 이동
    chat.scrollTop = chat.scrollHeight;
}

// 사용자 입력 자동 따옴표 감싸기 함수 (기존 함수)
function autoQuoteUserInput(text) {
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return ''; // 빈 줄은 그대로 유지
      // 이미 *...* 또는 "...""로 감싸져 있으면 그대로 반환
      if ((trimmed.startsWith('*') && trimmed.endsWith('*') && trimmed.length > 1) ||
          (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1)) {
          return line;
      }
      // 그 외의 경우 큰따옴표로 감싸서 반환
      return `"${line}"`; // 원본 line 유지 (들여쓰기 등)
    })
    .join('\n');
}


// --- 이벤트 리스너 ---

// 전송 버튼 클릭 이벤트
sendButton.addEventListener('click', () => sendMessage());

// Enter 키 입력 이벤트 (Shift + Enter는 줄 바꿈)
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 기본 Enter 키 동작 (줄 바꿈) 막기
        sendMessage();
    }
});

// 액션 메뉴 버튼 클릭 이벤트
actionMenuButton.addEventListener('click', function() {
    actionMenu.classList.toggle('visible');
    // 메뉴가 열렸을 때 오버레이 표시
    if (actionMenu.classList.contains('visible')) {
         document.getElementById('menuOverlay').style.display = 'block';
    } else {
         document.getElementById('menuOverlay').style.display = 'none';
    }
});

// 액션 메뉴 오버레이 클릭 시 메뉴 닫기
document.getElementById('menuOverlay').addEventListener('click', function() {
    actionMenu.classList.remove('visible');
     document.getElementById('menuOverlay').style.display = 'none';
     // 상황 옵션도 숨김
     situationOptions.classList.add('hidden');
});


// 액션 메뉴 - 상황 버튼 클릭 이벤트 (아코디언 토글)
menuSituationButton.addEventListener('click', function(event) {
    event.stopPropagation(); // 이벤트 버블링 방지 (오버레이 클릭으로 메뉴 닫히지 않게)
    situationOptions.classList.toggle('hidden');
});

// 상황 옵션 버튼 클릭 이벤트
situationOptions.querySelectorAll('.option').forEach(optionButton => {
    optionButton.addEventListener('click', function() {
        const situationText = this.textContent; // 버튼 텍스트 가져오기
        sendMessage(situationText); // 상황 메시지와 함께 전송
        actionMenu.classList.remove('visible'); // 메뉴 닫기
        document.getElementById('menuOverlay').style.display = 'none'; // 오버레이 닫기
        situationOptions.classList.add('hidden'); // 상황 옵션 숨김
    });
});


// 액션 메뉴 - 요약 버튼 클릭 이벤트
menuSummarizeButton.addEventListener('click', function() {
    // 요약 기능 구현 필요
    alert('요약 기능은 준비 중입니다.');
    actionMenu.classList.remove('visible'); // 메뉴 닫기
    document.getElementById('menuOverlay').style.display = 'none'; // 오버레이 닫기
});

// 액션 메뉴 - TXT 저장 버튼 클릭 이벤트
menuExportTxtButton.addEventListener('click', function() {
    // 대화 내용을 TXT 파일로 저장하는 기능 구현 필요
    // conversationHistory 배열을 사용하여 텍스트 파일 생성
    let txtContent = "";
    conversationHistory.forEach(message => {
         // isImage 메시지는 텍스트가 없으므로 제외
         if (!message.isImage) {
            txtContent += `${message.sender === 'user' ? 'User' : 'Bot'}: ${message.text}\n\n`;
         }
    });

     // Blob 생성
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });

    // 파일 다운로드 링크 생성
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chat_history.txt'; // 파일 이름 지정

    // 링크 클릭하여 다운로드 실행
    document.body.appendChild(a);
    a.click();

    // 생성된 링크 객체 해제
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);


    actionMenu.classList.remove('visible'); // 메뉴 닫기
    document.getElementById('menuOverlay').style.display = 'none'; // 오버레이 닫기
});


// 액션 메뉴 - 사진 버튼 클릭 이벤트 (이미지 URL 입력 프롬프트)
menuImageButton.addEventListener('click', function() {
    const imageUrl = prompt("이미지 URL을 입력하세요:");
    if (imageUrl) {
        // 이미지 메시지를 conversationHistory에 추가 (텍스트는 null 또는 빈 문자열)
        conversationHistory.push({ sender: 'user', text: null, imageUrl: imageUrl, isImage: true });
        // 이미지 메시지 표시
        displayMessage(null, 'user', imageUrl, true);
    }
    actionMenu.classList.remove('visible'); // 메뉴 닫기
    document.getElementById('menuOverlay').style.display = 'none'; // 오버레이 닫기
});


// 설정 모달 열기 버튼 이벤트
sidebarToggle.addEventListener('click', function() {
    openSettingsModal();
});

// 설정 모달 닫기 버튼 이벤트
closeModalButton.addEventListener('click', function() {
    closeSettingsModal();
});

// 모달 외부 클릭 시 모달 닫기
settingsModalOverlay.addEventListener('click', function(event) {
    // 이벤트가 모달 오버레이 자체에서 발생했는지 확인 (모달 내용 클릭 방지)
    if (event.target === settingsModalOverlay) {
        closeSettingsModal();
    }
});

// 설정 모달 열기 함수
function openSettingsModal() {
     // 현재 슬롯의 설정 로드
     loadSettings(currentSlot);
     // 슬롯 버튼 스타일 업데이트
     updateSlotButtonStyles();

    settingsModalOverlay.style.display = 'flex';
     // 애니메이션 추가 (CSS 클래스 사용)
     settingsModalOverlay.classList.add('modal-fade-in');
     settingsModalOverlay.classList.remove('modal-fade-out');
}

// 설정 모달 닫기 함수
function closeSettingsModal() {
     // 애니메이션 추가 (CSS 클래스 사용)
     settingsModalOverlay.classList.add('modal-fade-out');
     settingsModalOverlay.classList.remove('modal-fade-in');
    // 애니메이션 종료 후 display: none 처리
    settingsModalOverlay.addEventListener('animationend', function handler() {
        settingsModalOverlay.style.display = 'none';
        settingsModalOverlay.removeEventListener('animationend', handler);
    });
}


// 설정 저장 버튼 이벤트 리스너 (모달 내 버튼)
saveSettingsButtonModal.addEventListener("click", function() {
    saveSettings(currentSlot);
});

// 슬롯 버튼 클릭 이벤트 리스너 (모달 내 버튼에 연결)
document.querySelectorAll('.slot-button').forEach(button => {
    button.addEventListener('click', function() {
        const slotNumber = parseInt(this.textContent);
        currentSlot = slotNumber; // 현재 슬롯 업데이트
        updateSlotButtonStyles(); // 슬롯 버튼 스타일 업데이트
        // 해당 슬롯 설정 로드
        loadSettings(slotNumber);
    });
});

// 이미지 URL 입력 필드 변경 시 미리보기 업데이트 이벤트 리스너 추가 (CSS로 숨겨져 있음)
botImageUrlInputModal.addEventListener('input', function() {
    updateImagePreview(this.value, botImagePreview);
});
userImageUrlInputModal.addEventListener('input', function() {
    updateImagePreview(this.value, userImagePreview);
});


// ✅ 모달 내 이미지 프리뷰 클릭 시 URL 입력 프롬프트 기능 추가
botImagePreview.addEventListener('click', function() {
    const imageUrl = prompt("캐릭터 이미지 URL을 입력하세요:");
    if (imageUrl !== null) { // 사용자가 취소하지 않았으면
        botImageUrlInputModal.value = imageUrl; // 히든 입력 필드 업데이트
        updateImagePreview(imageUrl, botImagePreview); // 이미지 미리보기 업데이트
         // 전역 이미지 URL 변수 업데이트
         botProfileImgUrl = imageUrl || "https://via.placeholder.com/35/3a4a3a/ffffff?text=BOT";
    }
});

userImagePreview.addEventListener('click', function() {
     const imageUrl = prompt("사용자 이미지 URL을 입력하세요:");
    if (imageUrl !== null) { // 사용자가 취소하지 않았으면
        userImageUrlInputModal.value = imageUrl; // 히든 입력 필드 업데이트
        updateImagePreview(imageUrl, userImagePreview); // 이미지 미리보기 업데이트
         // 전역 이미지 URL 변수 업데이트
         userProfileImgUrl = imageUrl || "https://via.placeholder.com/35/4a3a7a/ffffff?text=YOU";
    }
});


// textarea 입력 시 높이 자동 조절 (현재 CSS에서 min/max-height 고정으로 비활성화 상태)
// userInput.addEventListener('input', autoResizeTextarea);


// --- 초기 로딩 시 실행될 코드 ---

// autoResizeTextarea.call(userInput); // textarea 높이 초기화 (현재 CSS에서는 불필요)

// 초기 로드 시 현재 슬롯 설정 로드 (기본값 또는 localStorage)
loadSettings(currentSlot);

// 초기 로드 후 슬롯 버튼 스타일 업데이트
updateSlotButtonStyles();

// 초기화 로직 실행 (공지 추가 포함)
initializeChat();

// 이미지 URL 입력 필드가 CSS로 숨겨져 있으므로, 미리보기 업데이트는 로드 시에만 수행됩니다.
// 사용자가 모달 내에서 이미지 변경을 원하면, 이미지 프리뷰 클릭 이벤트를 사용해야 합니다.
// 위에서 이미지 프리뷰 클릭 이벤트를 추가했습니다.