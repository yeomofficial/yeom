// -------------------- FIREBASE SETUP --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const auth = getAuth(app);

// -------------------- DOM REFERENCES --------------------
const feed = document.getElementById("feed");
const uploadIcon = document.querySelector(".upload-img");
const fileInput = document.getElementById("fileInput");

// Bottom sheet
const postSheet = document.getElementById("postSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const deleteBtn = document.getElementById("sheetDelete");
const reportBtn = document.getElementById("sheetReport");
const cancelBtn = document.getElementById("sheetCancel");

// Sheet states
const sheetActions = document.getElementById("sheetActions");
const sheetReportReasons = document.getElementById("sheetReportReasons");
const sheetBackBtn = document.getElementById("sheetBack");

// -------------------- STATE --------------------
let CURRENT_UID = null;
let activePost = null;
let activePostOwner = null;

// -------------------- AUTH --------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  CURRENT_UID = user.uid;
  loadPosts();
});

// -------------------- POST COMPONENT --------------------
function createPost({ username, imageUrl, ownerId }) {
  const post = document.createElement("article");
  post.className = "post";
  post.dataset.ownerId = ownerId;

  post.innerHTML = `
    <div class="post-header">
      <span class="username">${username}</span>
      <button class="post-menu" aria-label="Post options">
        <img src="three-dots-128px.png" class="post-menu-icon" />
      </button>
    </div>

    <div class="post-img-container">
      <img class="post-img" src="${imageUrl}" />
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

  const postsQuery = query(
    collection(db, "posts"),
    orderBy("timestamp", "desc")
  );

  const snapshot = await getDocs(postsQuery);

  snapshot.forEach((doc) => {
    const data = doc.data();

    feed.appendChild(
      createPost({
        username: data.username || "Unknown",
        imageUrl: data.imageUrl,
        ownerId: data.userId
      })
    );
  });
}

// -------------------- BOTTOM SHEET --------------------
function openSheet(post) {
  activePost = post;
  activePostOwner = post.dataset.ownerId;

  // Reset state
  sheetActions.classList.remove("hidden");
  sheetReportReasons.classList.add("hidden");

  // Owner logic
  deleteBtn.classList.toggle(
    "hidden",
    activePostOwner !== CURRENT_UID
  );

  reportBtn.classList.toggle(
    "hidden",
    activePostOwner === CURRENT_UID
  );

  sheetBackdrop.classList.remove("hidden");
  postSheet.classList.remove("hidden");

  requestAnimationFrame(() => {
    postSheet.classList.add("show");
  });
}

function closeSheet() {
  sheetBackdrop.classList.add("hidden");
  postSheet.classList.remove("show");

  // Reset content
  sheetActions.classList.remove("hidden");
  sheetReportReasons.classList.add("hidden");

  activePost = null;
  activePostOwner = null;
}

// -------------------- INTERACTIONS --------------------
feed.addEventListener("click", (e) => {
  const likeBtn = e.target.closest(".like-btn");
  const saveBtn = e.target.closest(".save-btn");
  const menuBtn = e.target.closest(".post-menu");

  if (likeBtn) {
    likeBtn.classList.toggle("liked");
    const span = likeBtn.querySelector("span");
    const count = Number(span.textContent);
    span.textContent = likeBtn.classList.contains("liked")
      ? count + 1
      : Math.max(count - 1, 0);
  }

  if (saveBtn) {
    saveBtn.classList.toggle("saved");
  }

  if (menuBtn) {
    openSheet(menuBtn.closest(".post"));
  }
});

// -------------------- SHEET BUTTONS --------------------
sheetBackdrop.addEventListener("click", closeSheet);
cancelBtn.addEventListener("click", closeSheet);

deleteBtn.addEventListener("click", () => {
  if (!activePost) return;
  activePost.remove();
  closeSheet();
});

reportBtn.addEventListener("click", () => {
  sheetActions.classList.add("hidden");
  sheetReportReasons.classList.remove("hidden");
});

sheetBackBtn.addEventListener("click", () => {
  sheetReportReasons.classList.add("hidden");
  sheetActions.classList.remove("hidden");
});

sheetReportReasons.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-reason]");
  if (!btn || !activePost) return;

  const reason = btn.dataset.reason;

  console.log("Reported:", {
    postOwner: activePostOwner,
    reportedBy: CURRENT_UID,
    reason
  });

  closeSheet();
});

// -------------------- UPLOAD --------------------
uploadIcon.addEventListener("click", () => fileInput.click());

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
