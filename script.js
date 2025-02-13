import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// **🔥 중복 실행 방지용 전역 변수**
let isSnapshotActive = false;

// **📌 메시지 보내기 (중복 입력 방지)**
document.getElementById('guestbook-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = true; // 전송 중 버튼 비활성화

    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name && message) {
        try {
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
            submitButton.disabled = false; // 전송 완료 후 버튼 활성화
        }
    } else {
        alert("이름과 메시지를 입력하세요!");
        submitButton.disabled = false;
    }
});

// **📌 메시지 불러오기 (중복 로딩 방지)**
function listenForChanges() {
    if (isSnapshotActive) return; // 이미 실행 중이면 또 실행하지 않음
    isSnapshotActive = true; // 한 번만 실행되도록 설정

    const q = query(collection(db, "guestbook"), orderBy("timestamp", "desc"));

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

            // 삭제 버튼 이벤트 추가
            messageElement.querySelector('.delete-btn').addEventListener('click', async () => {
                try {
                    await deleteDoc(doc(db, "guestbook", messageId));
                } catch (e) {
                    console.error("메시지 삭제 실패: ", e.message);
                }
            });

            messagesContainer.appendChild(messageElement);
        });
    });
}

// **📌 페이지 로딩 시 메시지 불러오기 (한 번만 실행)**
document.addEventListener('DOMContentLoaded', () => {
    listenForChanges();
});
