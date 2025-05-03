import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.firebasestorage.app",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get("uid") || localStorage.getItem("loggedInUserId");

  if (!profileUserId) {
    return; // silently fail or show a UI message if needed
  }

  const docRef = doc(db, "users", profileUserId);
  getDoc(docRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById("loggedInUsername").innerText = "@" + userData.username;

        if (profileUserId !== user.uid) {
          document.getElementById("editProfileBtn").style.display = "none";
        }
      }
    });
});

// Tab switching
const postsTab = document.getElementById("postsTab");
const savedTab = document.getElementById("savedTab");
const userPosts = document.getElementById("userPosts");

postsTab.addEventListener("click", () => {
  postsTab.classList.add("active");
  savedTab.classList.remove("active");
  userPosts.innerHTML = '<p style="margin-top: 50px;">User posts will appear here!</p>';
});

savedTab.addEventListener("click", () => {
  savedTab.classList.add("active");
  postsTab.classList.remove("active");
  userPosts.innerHTML = '<p style="margin-top: 50px;">Saved posts will appear here!</p>';
});
