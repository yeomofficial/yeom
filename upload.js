// -------------------- CLOUDINARY --------------------
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwauleaof/image/upload";
const UPLOAD_PRESET = "yeom_unsigned";

// -------------------- FIREBASE --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

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
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("image-preview");
const sectionSelect = document.getElementById("section");
const uploadBtn = document.getElementById("upload-btn");
const messageBox = document.getElementById("message-box");

// -------------------- STATE --------------------
let selectedFile = null;
let CURRENT_USER = null;

// -------------------- AUTH --------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }
  CURRENT_USER = user;
});

// -------------------- IMAGE PICK --------------------
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  selectedFile = file;
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.style.display = "block";
});

// -------------------- MESSAGE --------------------
function showMessage(text, type = "success") {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = "block";
}

// -------------------- UPLOAD --------------------
uploadBtn.addEventListener("click", async () => {
  const section = sectionSelect.value;

  if (!selectedFile) {
    showMessage("Select an image", "error");
    return;
  }

  if (!section) {
    showMessage("Choose a category", "error");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  try {
    //  Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", section);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData
    });

    const cloudData = await res.json();
    const imageUrl = cloudData.secure_url;

    //  Get username
    let username = "unknown";
    const userSnap = await getDoc(doc(db, "users", CURRENT_USER.uid));
    if (userSnap.exists()) {
      username = userSnap.data().username || "unknown";
    }

    //  Save post
    await addDoc(collection(db, "posts"), {
      userId: CURRENT_USER.uid,
      username,
      section,
      imageUrl,
      createdAt: serverTimestamp()
    });

    showMessage("Posted successfully");
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1200);

  } catch (err) {
    console.error(err);
    showMessage("Upload failed", "error");
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Post";
  }
});
