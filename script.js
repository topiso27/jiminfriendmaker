import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDg2uDWWqO3AxB5wMHjV7BTm3Ilziej_3k",
    authDomain: "yunrangdd-homepage.firebaseapp.com",
    projectId: "yunrangdd-homepage",
    storageBucket: "yunrangdd-homepage.appspot.com",
    messagingSenderId: "346061065933",
    appId: "1:346061065933:web:3e93b1267647f8e794e384"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 방명록 메시지 보내기
document.getElementById('guestbook-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // 버튼 비활성화
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = true; // 전송 중 버튼 비활성화

    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;

    if (name && message) {
        try {
            // Firestore에 메시지 전송
            await addDoc(collection(db, "guestbook"), {
                name: name,
                message: message,
                timestamp: serverTimestamp()
            });

            // 입력 필드 초기화
            document.getElementById('name').value = '';
            document.getElementById('message').value = '';

            loadMessages(); // 메시지 새로고침
        } catch (e) {
            console.error("문서 추가 실패: ", e.message);
        } finally {
            // 버튼 다시 활성화
            submitButton.disabled = false; // 전송 완료 후 버튼 활성화
        }
    }
});

// 방명록 메시지 불러오기
async function loadMessages() {
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '';  // 기존 메시지 삭제

    console.log("loadMessages 호출됨"); // 로그 추가 (중복 호출 확인용)

    const q = query(collection(db, "guestbook"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const messageId = docSnapshot.id; // 문서 ID

        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `
            <div class="author">${data.name}</div>
            <div class="content">${data.message}</div>
            <button class="delete-btn" data-id="${messageId}">삭제</button>
        `;

        // 삭제 버튼 클릭 시 처리
        messageElement.querySelector('.delete-btn').addEventListener('click', async () => {
            try {
                await deleteDoc(doc(db, "guestbook", messageId)); // 해당 메시지 삭제
                loadMessages(); // 삭제 후 메시지 새로고침
            } catch (e) {
                console.error("메시지 삭제 실패: ", e.message);
            }
        });

        messagesContainer.appendChild(messageElement);
    });
}

// 페이지 로드 시 메시지 불러오기 (한 번만 실행)
document.addEventListener('DOMContentLoaded', () => {
    console.log("페이지 로드 완료");
    loadMessages(); // 한 번만 실행되어야 함
});
