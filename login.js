
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/* ================= Firebase Config ================= */
const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.firebasestorage.app",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // not used yet, but fine

/* ================= Elements ================= */
const form = document.getElementById("login-form");
const button = document.getElementById("login-btn");
const passwordInput = document.getElementById("rPassword");

/* ================= UI Helpers ================= */
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  input.classList.add("error");
  error.textContent = message;
  error.classList.add("show");
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  input.classList.remove("error");
  error.textContent = "";
  error.classList.remove("show");
}

function clearAllErrors() {
  clearError("rEmail");
  clearError("rPassword");
}

function setButtonState(loading) {
  const text = button.querySelector(".btn-text");
  const loadingText = button.querySelector(".btn-loading");

  button.disabled = loading;
  text.style.display = loading ? "none" : "inline";
  loadingText.style.display = loading ? "inline" : "none";
}

function toggleFormDisabled(state) {
  document
    .querySelectorAll("#login-form input")
    .forEach(input => (input.disabled = state));
}

/* ================= Password Toggle ================= */
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden
    ? "visibility_off"
    : "visibility";
});

/* ================= Login Logic ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAllErrors();

  const email = document.getElementById("rEmail").value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    if (!email) showError("rEmail", "Email is required.");
    if (!password) showError("rPassword", "Password is required.");
    return;
  }

  setButtonState(true);
  toggleFormDisabled(true);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;
    window.location.replace(`profile.html?uid=${uid}`);

  } catch (error) {
    toggleFormDisabled(false);
    setButtonState(false);

    if (error.code === "auth/user-not-found") {
      showError("rEmail", "No account found with this email.");
    } else if (error.code === "auth/wrong-password") {
      showError("rPassword", "Incorrect password.");
    } else if (error.code === "auth/invalid-email") {
      showError("rEmail", "Invalid email address.");
    } else {
      showError("rEmail", "Login failed. Try again.");
    }
  }
});
