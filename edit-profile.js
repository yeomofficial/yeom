import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.appspot.com",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const usernameInput = document.getElementById('username');
const genderSelect = document.getElementById('gender');
const fashionSelect = document.getElementById('fashion');
const profilePic = document.getElementById('profilePic');
const fileInput = document.getElementById('fileInput');
const saveBtn = document.getElementById('saveBtn');
const messageDiv = document.getElementById('message');

let originalData = {};
let imageUrl = "";

function showMessage(msg, success = true) {
  messageDiv.textContent = msg;
  messageDiv.style.color = success ? 'green' : 'red';
  setTimeout(() => {
    messageDiv.textContent = '';
  }, 3000);
}

function updateSaveButtonState() {
  const usernameChanged = usernameInput.value !== originalData.username;
  const genderChanged = genderSelect.value !== originalData.gender;
  const fashionChanged = fashionSelect.value !== originalData.fashion;
  const imageChanged = imageUrl !== originalData.profile;

  const changed = usernameChanged || genderChanged || fashionChanged || imageChanged;

  if (changed) {
    saveBtn.classList.add('active');
    saveBtn.disabled = false;
  } else {
    saveBtn.classList.remove('active');
    saveBtn.disabled = true;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      originalData = {
        username: data.username || "",
        gender: data.gender || "",
        fashion: data.fashion || "",
        profile: data.profile || "person.png"
      };

      usernameInput.value = originalData.username;
      genderSelect.value = originalData.gender;
      fashionSelect.value = originalData.fashion;
      profilePic.src = originalData.profile || "person.png";

      imageUrl = originalData.profile;

      // track changes
      usernameInput.addEventListener("input", updateSaveButtonState);
      genderSelect.addEventListener("change", updateSaveButtonState);
      fashionSelect.addEventListener("change", updateSaveButtonState);
    }
  }
});

// Open file input on profile pic click
profilePic.addEventListener("click", () => fileInput.click());

// Upload image to Cloudinary and update preview
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "yeom_unsigned");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dwauleaof/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    imageUrl = data.secure_url; // ✅ this URL will go into Firestore
    profilePic.src = imageUrl;
    updateSaveButtonState();
  } catch (err) {
    showMessage("Cloudinary upload failed.", false);
  }
});

// Save button click → send data to Firestore
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, {
      username: usernameInput.value,
      gender: genderSelect.value,
      fashion: fashionSelect.value,
      profile: imageUrl
    });
    originalData = {
      username: usernameInput.value,
      gender: genderSelect.value,
      fashion: fashionSelect.value,
      profile: imageUrl
    };
    updateSaveButtonState();
    showMessage("Profile updated successfully.");
  } catch (err) {
    showMessage("Failed to update profile.", false);
  }
});
