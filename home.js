// -------------------- FIREBASE SETUP --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  serverTimestamp
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

// -------------------- TOAST --------------------
let toastTimeout = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("toast-hidden");
  toast.classList.add("toast-show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hidden");
  }, 2200);
}

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
function createPost({ postId, username, imageUrl, ownerId }) {
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
      <img class="post-img" src="${imageUrl}" />
    </div>

    <div class="actions">
      <button class="like-btn">
        <img class="heart-img" src="heart.png" />
        <span>0</span>
      </button>

      <button class="save-btn">
        <img class="bookmark-img" src="bookmark.png" />
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

  snap.forEach(docSnap => {
    const data = docSnap.data();
    feed.appendChild(
      createPost({
        postId: docSnap.id,
        username: data.username || "Unknown",
        imageUrl: data.imageUrl,
        ownerId: data.userId
      })
    );
  });
}

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

// -------------------- OPEN POST ACTIONS --------------------
function openPostActions(post) {
  activePost = post;
  activePostOwner = post.dataset.ownerId;

  deleteBtn.classList.toggle("hidden", activePostOwner !== CURRENT_UID);
  reportBtn.classList.toggle("hidden", activePostOwner === CURRENT_UID);

  hideSheet(reportSheet);
  showSheet(postActionsSheet);
}

// -------------------- FEED EVENTS --------------------
feed.addEventListener("click", (e) => {
  const menuBtn = e.target.closest(".post-menu");
  if (!menuBtn) return;
  openPostActions(menuBtn.closest(".post"));
});

// -------------------- POST ACTION BUTTONS --------------------
sheetBackdrop.addEventListener("click", closeAllSheets);
cancelBtn.addEventListener("click", closeAllSheets);
reportCancelBtn.addEventListener("click", closeAllSheets);

deleteBtn.addEventListener("click", () => {
  if (!activePost) return;
  activePost.remove();
  closeAllSheets();
});

reportBtn.addEventListener("click", () => {
  hideSheet(postActionsSheet);
  showSheet(reportSheet);
});

// -------------------- REPORT REASONS --------------------
reportSheet.addEventListener("click", async (e) => {
  const btn = e.target.closest(".report-reason");
  if (!btn || !activePost) return;

  try {
    await addDoc(collection(db, "reports"), {
      postId: activePost.dataset.postId,
      postOwnerId: activePostOwner,
      reportedBy: CURRENT_UID,
      reason: btn.dataset.reason,
      createdAt: serverTimestamp()
    });

    closeAllSheets();
    showToast("Thanks for reporting");

  } catch (err) {
    console.error("Report error:", err);
    showToast("Failed to submit report");
  }
});
