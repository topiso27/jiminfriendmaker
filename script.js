import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
        } catch (e) {
            console.error("문서 추가 실패: ", e.message);
        } finally {
            // 버튼 다시 활성화
            submitButton.disabled = false; // 전송 완료 후 버튼 활성화
        }
    }
});

// 방명록 메시지 불러오기 (실시간 업데이트용)
function listenForChanges() {
    const q = query(collection(db, "guestbook"), orderBy("timestamp", "desc"));

    // Firestore의 실시간 업데이트 처리
    onSnapshot(q, (querySnapshot) => {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = ''; // 기존 메시지 초기화

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const messageId = docSnapshot.id;

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
                } catch (e) {
                    console.error("메시지 삭제 실패: ", e.message);
                }
            });

            messagesContainer.appendChild(messageElement);
        });
    });
}

// 페이지 로드 시 실시간 업데이트 시작
document.addEventListener('DOMContentLoaded', () => {
    listenForChanges(); // 실시간 업데이트 시작
});
