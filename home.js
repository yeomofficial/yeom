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
import { logEvent } from "./analytics.js";

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

//  IN-MEMORY INTERACTIONS
let USER_INTERACTIONS = {
  likedPosts: {},
  savedPosts: {}
};

// -------------------- SHEET HELPERS --------------------
function showSheet(sheet) {
  sheetBackdrop.classList.remove("hidden");
  sheet.classList.remove("hidden");
  requestAnimationFrame(() => sheet.classList.add("show"));
}

function hideSheet(sheet) {
  sheet.classList.remove("show");
  setTimeout(() => sheet.classList.add("hidden"), 200);
}

function closeAllSheets() {
  sheetBackdrop.classList.add("hidden");
  hideSheet(postActionsSheet);
  hideSheet(reportSheet);
  activePost = null;
  activePostOwner = null;
}

// -------------------- AUTH --------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  CURRENT_UID = user.uid;

  // Load interaction memory ONCE
  const ref = doc(db, "userInteractions", CURRENT_UID);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { likedPosts: {}, savedPosts: {} });
    USER_INTERACTIONS = { likedPosts: {}, savedPosts: {} };
  } else {
    USER_INTERACTIONS = snap.data();
  }

  loadPosts();
});

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

  // ---- SYNC UI WITH MEMORY ----
  const likeBtn = post.querySelector(".like-btn");
  const saveBtn = post.querySelector(".save-btn");

  if (USER_INTERACTIONS.likedPosts[postId]) {
    likeBtn.classList.add("active");
  }

  if (USER_INTERACTIONS.savedPosts[postId]) {
    saveBtn.classList.add("active");
  }

  return post;
}

// -------------------- OPEN POST ACTIONS --------------------
function openPostActions(post) {
  activePost = post;
  activePostOwner = post.dataset.ownerId;

  deleteBtn.classList.toggle("hidden", activePostOwner !== CURRENT_UID);
  reportBtn.classList.toggle("hidden", activePostOwner === CURRENT_UID);

  hideSheet(reportSheet);
  showSheet(postActionsSheet);
}

// -------------------- FEED MENU EVENTS --------------------
document.addEventListener("click", (e) => {
  const menuBtn = e.target.closest(".post-menu");
  if (!menuBtn) return;

  const post = menuBtn.closest(".post");
  if (!post) return;

  openPostActions(post);
});

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
document.addEventListener("click", async (e) => {
  const likeBtn = e.target.closest(".like-btn");
  const saveBtn = e.target.closest(".save-btn");

  if (!likeBtn && !saveBtn) return;

  const post = e.target.closest(".post");
  const postId = post.dataset.postId;
  const postRef = doc(db, "posts", postId);
  const userRef = doc(db, "userInteractions", CURRENT_UID);

  //  LIKE
  if (likeBtn) {
    const countSpan = likeBtn.querySelector("span");

    if (USER_INTERACTIONS.likedPosts[postId]) {
      delete USER_INTERACTIONS.likedPosts[postId];
      likeBtn.classList.remove("active");
      countSpan.textContent--;

      await updateDoc(postRef, { likeCount: increment(-1) });
    } else {
      USER_INTERACTIONS.likedPosts[postId] = true;
      likeBtn.classList.add("active");
      countSpan.textContent++;

      await updateDoc(postRef, { likeCount: increment(1) });
    }

    await updateDoc(userRef, {
      likedPosts: USER_INTERACTIONS.likedPosts
    });
  }

  //  SAVE
  if (saveBtn) {
    if (USER_INTERACTIONS.savedPosts[postId]) {
      delete USER_INTERACTIONS.savedPosts[postId];
      saveBtn.classList.remove("active");
    } else {
      USER_INTERACTIONS.savedPosts[postId] = true;
      saveBtn.classList.add("active");
    }

    await updateDoc(userRef, {
      savedPosts: USER_INTERACTIONS.savedPosts
    });
  }
});

// -------------------- BLOCK IMAGE CONTEXT MENU --------------------
document.addEventListener("contextmenu", (e) => {
  if (e.target.closest(".post-img-container")) {
    e.preventDefault();
  }
});

// -------------------- DELETE POST --------------------
deleteBtn.addEventListener("click", async () => {
  if (!activePost) return;

  const postId = activePost.dataset.postId;
  if (!postId) return;

  try {
    await deleteDoc(doc(db, "posts", postId));
    logEvent("post_deleted", {
      postId,
      ownerId: CURRENT_UID
    });
    activePost.remove();
    closeAllSheets();
  } catch (err) {
    console.error("Delete failed:", err);
  }
});

// -------------------- SHEET CONTROLS --------------------
sheetBackdrop.addEventListener("click", closeAllSheets);
cancelBtn.addEventListener("click", closeAllSheets);
reportCancelBtn.addEventListener("click", closeAllSheets);

reportBtn.addEventListener("click", () => {
  hideSheet(postActionsSheet);
  showSheet(reportSheet);
});

// -------------------- REPORT POST --------------------
document.addEventListener("click", async (e) => {
  const reasonBtn = e.target.closest(".report-reason");
  if (!reasonBtn) return;
  if (!activePost) return;

  const reason = reasonBtn.dataset.reason;
  const postId = activePost.dataset.postId;

  try {
    await addDoc(collection(db, "reports"), {
      postId,
      reportedBy: CURRENT_UID,
      postOwner: activePostOwner,
      reason,
      createdAt: serverTimestamp()
    });

    closeAllSheets();
    showToast("Report submitted");

  } catch (err) {
    console.error("Report failed:", err);
    showToast("Failed to report");
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("toast-hidden");
  toast.classList.add("toast-show");

  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hidden");
  }, 2500);
}

