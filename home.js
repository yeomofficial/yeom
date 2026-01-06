// -------------------- FIREBASE SETUP --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.appspot.com",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// -------------------- DOM REFERENCES --------------------
const feed = document.getElementById("feed");
const uploadIcon = document.querySelector(".upload-img");
const fileInput = document.getElementById("fileInput");

// -------------------- POST COMPONENT --------------------

function createPost({ username, imageUrl }) {
  const post = document.createElement("article");
  post.className = "post";

  post.innerHTML = `
    <div class="post-header">
    <span class="username">${username}</span>

    <button class="post-menu" aria-label="Post options">
  <img src="more_horiz_25dp_000000_FILL0_wght400_GRAD0_opsz24.svg" alt="" class="post-menu-icon">
</button>
  </div>

    <div class="post-img-container">
      <img class="post-img" src="${imageUrl}" alt="${username}'s post" />
    </div>

    <div class="actions">
      <button class="like-btn">
        <img class="heart-img" src="like-btn.png" />
        <span>0</span>
      </button>

      <button class="save-btn">
        <img class="bookmark-img" src="save-btn.png" />
      </button>
    </div>
  `;

  return post;
}

// -------------------- LOAD FEED --------------------
async function loadPosts() {
  feed.innerHTML = "";

  try {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(postsQuery);

    if (snapshot.empty) {
      // Fallback / placeholder post
      feed.appendChild(
        createPost({
          username: "YEOM",
          imageUrl: "women-pintrest.png"
        })
      );
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();

      feed.appendChild(
        createPost({
          username: data.username || "Unknown",
          imageUrl: data.imageUrl
        })
      );
    });
  } catch (err) {
    console.error("Error loading posts:", err);
  }
}

// -------------------- INTERACTIONS (EVENT DELEGATION) --------------------
feed.addEventListener("click", (e) => {
  const likeBtn = e.target.closest(".like-btn");
  const saveBtn = e.target.closest(".save-btn");

  if (likeBtn) {
    likeBtn.classList.toggle("liked");

    const countSpan = likeBtn.querySelector("span");
    let count = Number(countSpan.textContent);

    countSpan.textContent = likeBtn.classList.contains("liked")
      ? count + 1
      : Math.max(count - 1, 0);
  }

  if (saveBtn) {
    saveBtn.classList.toggle("saved");
  }
});

// -------------------- UPLOAD ICON LOGIC --------------------
uploadIcon.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    localStorage.setItem("selectedImage", reader.result);
    window.location.href = "upload.html";
  };

  reader.readAsDataURL(file);
});

// -------------------- INIT --------------------
loadPosts();







