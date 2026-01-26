// -------------------- FIREBASE SETUP --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
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
const sheetBackdrop = document.getElementById("sheetBackdrop");
const toast = document.getElementById("toast");

// Sheets
const postActionsSheet = document.getElementById("postActionsSheet");
const reportSheet = document.getElementById("reportSheet");

// Buttons
const deleteBtn = document.getElementById("sheetDelete");
const reportBtn = document.getElementById("sheetReport");
const cancelBtn = document.getElementById("sheetCancel");
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

// -------------------- USER INTERACTION DOC --------------------
async function getUserInteractionRef() {
  const ref = doc(db, "userInteractions", CURRENT_UID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      likedPosts: {},
      savedPosts: {}
    });
  }

  return ref;
}

// -------------------- POST UI --------------------
function createPost({ postId, username, imageUrl, ownerId, likeCount = 0 }) {
  const post = document.createElement("article");
  post.className = "post";
  post.dataset.ownerId = ownerId;
  post.dataset.postId = postId;

  post.innerHTML = `
    <div class="post-header">
      <span class="username">${username}</span>
      <button class="post-menu" aria-label="Post options">
        <img src="three-dots-128px.png" class="post-menu-icon" />
      </button>
    </div>

    <div class="post-img-container">
      <img class="post-img" src="${imageUrl}" draggable="false" />
      <div class="img-shield"></div>
    </div>

    <div class="actions">
      <button class="like-btn">
        <svg xmlns="http://www.w3.org/2000/svg"
          width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="0.75"
          stroke-linecap="round" stroke-linejoin="round"
          class="heart-img">
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>
        </svg>
        <span>${likeCount}</span>
      </button>

      <button class="save-btn">
        <svg xmlns="http://www.w3.org/2000/svg"
          width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="0.75"
          stroke-linecap="round" stroke-linejoin="round"
          class="bookmark-img">
          <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>
        </svg>
      </button>
    </div>
  `;
  // ---- SYNC UI WITH USER INTERACTIONS ----
  const likeBtn = post.querySelector(".like-btn");
  const saveBtn = post.querySelector(".save-btn");

  if (USER_INTERACTIONS?.likedPosts?.[postId]) {
    likeBtn.classList.add("active");
  }

  if (USER_INTERACTIONS?.savedPosts?.[postId]) {
    saveBtn.classList.add("active");
  }
  return post;
}

// -------------------- LOAD POSTS --------------------
async function loadPosts() {
  feed.innerHTML = "";

  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(docSnap => {
    const data = docSnap.data();
    feed.appendChild(
      createPost({
        postId: docSnap.id,
        username: data.username || "Unknown",
        imageUrl: data.imageUrl,
        ownerId: data.userId,
        likeCount: data.likeCount || 0
      })
    );
  });
}

// -------------------- LIKE & SAVE --------------------
feed.addEventListener("click", async (e) => {
  const likeBtn = e.target.closest(".like-btn");
  const saveBtn = e.target.closest(".save-btn");

  if (!likeBtn && !saveBtn) return;

  const post = e.target.closest(".post");
  const postId = post.dataset.postId;
  const userRef = await getUserInteractionRef();
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  if (likeBtn) {
    const countSpan = likeBtn.querySelector("span");
    const postRef = doc(db, "posts", postId);

    if (data.likedPosts[postId]) {
      delete data.likedPosts[postId];
      await updateDoc(userRef, { likedPosts: data.likedPosts });
      await updateDoc(postRef, { likeCount: increment(-1) });
      likeBtn.classList.remove("active");
      countSpan.textContent--;
    } else {
      data.likedPosts[postId] = true;
      await updateDoc(userRef, { likedPosts: data.likedPosts });
      await updateDoc(postRef, { likeCount: increment(1) });
      likeBtn.classList.add("active");
      countSpan.textContent++;
    }
  }

  if (saveBtn) {
    if (data.savedPosts[postId]) {
      delete data.savedPosts[postId];
      saveBtn.classList.remove("active");
    } else {
      data.savedPosts[postId] = true;
      saveBtn.classList.add("active");
    }
    await updateDoc(userRef, { savedPosts: data.savedPosts });
  }
});

// -------------------- BLOCK IMAGE CONTEXT MENU --------------------
document.addEventListener("contextmenu", (e) => {
  if (e.target.closest(".post-img-container")) {
    e.preventDefault();
  }
});

