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
const uploadIcon = document.querySelector(".upload-img");
const fileInput = document.getElementById("fileInput");

const postSheet = document.getElementById("postSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");

const sheetActions = document.getElementById("sheetActions");
const sheetReportReasons = document.getElementById("sheetReportReasons");

const deleteBtn = document.getElementById("sheetDelete");
const reportBtn = document.getElementById("sheetReport");
const cancelBtn = document.getElementById("sheetCancel");
const backBtn = document.getElementById("sheetBack");

// -------------------- STATE --------------------
let CURRENT_UID = null;
let activePost = null;
let SHEET_MODE = "actions"; // actions | report

// -------------------- AUTH --------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }
  CURRENT_UID = user.uid;
  loadPosts();
});

// -------------------- POSTS --------------------
function createPost({ username, imageUrl, ownerId }) {
  const post = document.createElement("article");
  post.className = "post";
  post.dataset.ownerId = ownerId;

  post.innerHTML = `
    <div class="post-header">
      <span class="username">${username}</span>
      <button class="post-menu">
        <img src="three-dots-128px.png" />
      </button>
    </div>

    <div class="post-img-container">
      <img src="${imageUrl}" class="post-img" />
    </div>
  `;
  return post;
}

async function loadPosts() {
  feed.innerHTML = "";
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

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

// -------------------- SHEET RENDER --------------------
function renderSheet() {
  if (SHEET_MODE === "actions") {
    sheetActions.classList.remove("hidden");
    sheetReportReasons.classList.add("hidden");
  }

  if (SHEET_MODE === "report") {
    sheetActions.classList.add("hidden");
    sheetReportReasons.classList.remove("hidden");
  }
}

// -------------------- OPEN / CLOSE --------------------
function openSheet(post) {
  activePost = post;
  SHEET_MODE = "actions";
  renderSheet();

  const ownerId = post.dataset.ownerId;

  deleteBtn.classList.toggle("hidden", ownerId !== CURRENT_UID);
  reportBtn.classList.toggle("hidden", ownerId === CURRENT_UID);

  sheetBackdrop.classList.remove("hidden");
  postSheet.classList.remove("hidden");

  requestAnimationFrame(() => {
    postSheet.classList.add("show");
  });
}

function closeSheet() {
  sheetBackdrop.classList.add("hidden");
  postSheet.classList.remove("show");

  SHEET_MODE = "actions";
  renderSheet();
  activePost = null;
}

// -------------------- FEED INTERACTIONS --------------------
feed.addEventListener("click", (e) => {
  const menuBtn = e.target.closest(".post-menu");
  if (menuBtn) {
    openSheet(menuBtn.closest(".post"));
  }
});

// -------------------- SHEET ACTIONS --------------------
sheetBackdrop.addEventListener("click", closeSheet);
cancelBtn.addEventListener("click", closeSheet);

deleteBtn.addEventListener("click", () => {
  if (!activePost) return;
  activePost.remove();
  closeSheet();
});

reportBtn.addEventListener("click", () => {
  SHEET_MODE = "report";
  renderSheet();
});

backBtn.addEventListener("click", () => {
  SHEET_MODE = "actions";
  renderSheet();
});

// -------------------- REPORT REASONS --------------------
sheetReportReasons.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-reason]");
  if (!btn || !activePost) return;

  const reason = btn.dataset.reason;
  console.log("Reported for:", reason);

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
