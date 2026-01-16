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

// -------------------- DOM --------------------
const feed = document.getElementById("feed");

// Post actions sheet
const postSheet = document.getElementById("postSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const deleteBtn = document.getElementById("sheetDelete");
const reportBtn = document.getElementById("sheetReport");
const cancelBtn = document.getElementById("sheetCancel");

// Report reasons sheet
const reportSheet = document.getElementById("reportSheet");
const reportCancelBtn = document.getElementById("reportCancel");

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

// -------------------- POST UI --------------------
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

// -------------------- LOAD POSTS --------------------
async function loadPosts() {
  feed.innerHTML = "";

  const q = query(
    collection(db, "posts"),
    orderBy("timestamp", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
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

// -------------------- SHEET CONTROLS --------------------
function openPostSheet(post) {
  activePost = post;
  activePostOwner = post.dataset.ownerId;

  deleteBtn.classList.toggle("hidden", activePostOwner !== CURRENT_UID);
  reportBtn.classList.toggle("hidden", activePostOwner === CURRENT_UID);

  sheetBackdrop.classList.remove("hidden");
  postSheet.classList.add("show");
}

function closeAllSheets() {
  sheetBackdrop.classList.add("hidden");
  postSheet.classList.remove("show");
  reportSheet.classList.remove("show");

  activePost = null;
  activePostOwner = null;
}

// -------------------- FEED EVENTS --------------------
feed.addEventListener("click", (e) => {
  const menuBtn = e.target.closest(".post-menu");
  if (menuBtn) {
    openPostSheet(menuBtn.closest(".post"));
  }
});

// -------------------- POST SHEET BUTTONS --------------------
sheetBackdrop.addEventListener("click", closeAllSheets);
cancelBtn.addEventListener("click", closeAllSheets);

deleteBtn.addEventListener("click", () => {
  if (!activePost) return;
  activePost.remove();
  closeAllSheets();
});

reportBtn.addEventListener("click", () => {
  postSheet.classList.remove("show");
  reportSheet.classList.add("show");
});

// -------------------- REPORT REASONS --------------------
reportSheet.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-reason]");
  if (!btn) return;

  const reason = btn.dataset.reason;

  console.log("REPORT:", {
    postOwner: activePostOwner,
    reportedBy: CURRENT_UID,
    reason
  });

  closeAllSheets();
});

reportCancelBtn.addEventListener("click", closeAllSheets);

