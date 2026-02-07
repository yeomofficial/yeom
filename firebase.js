import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { logEvent } from "./analytics.js";

/* ---------------- Firebase ---------------- */

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
const db = getFirestore(app);

/* ---------------- Elements ---------------- */

const form = document.getElementById("signup-form");
const button = document.getElementById("signup-btn");
const passwordInput = document.getElementById("rPassword");

/* ---------------- UI Helpers ---------------- */

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

  const termsError = document.getElementById("terms-error");
  termsError.textContent = "";
  termsError.classList.remove("show");
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
    .querySelectorAll("#signup-form input")
    .forEach(input => input.disabled = state);
}

/* ---------------- Password Toggle ---------------- */

const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "visibility_off" : "visibility";
});

/* ---------------- Signup Logic ---------------- */

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAllErrors();

  const email = document.getElementById("rEmail").value.trim();
  const password = passwordInput.value;
  const termsChecked = document.getElementById("terms-checkbox").checked;

  let valid = true;

  if (!email) {
    showError("rEmail", "Email is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("rEmail", "Enter a valid email address.");
    valid = false;
  }

  if (!password) {
    showError("rPassword", "Password is required.");
    valid = false;
  } else if (password.length < 6) {
    showError("rPassword", "Password must be at least 6 characters.");
    valid = false;
  }

  if (!termsChecked) {
    const termsError = document.getElementById("terms-error");
    termsError.textContent = "Please accept the Terms and Conditions.";
    termsError.classList.add("show");
    valid = false;
  }

  if (!valid) return;

  /* UX: commit moment */
  setButtonState(true);
  toggleFormDisabled(true);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    const uid = user.uid;

    await setDoc(doc(db, "users", user.uid), {
      email,
      spotters: 0,
      spotting: 0,
      createdAt: Date.now()
    });

    await logEvent("user_signed_up", uid);
    await logEvent("terms_accepted", uid);
    // Prevent back navigation
    location.replace("info.html");

  } catch (error) {
    toggleFormDisabled(false);
    setButtonState(false);

    if (error.code === "auth/email-already-in-use") {
      showError("rEmail", "This email is already registered.");
    } else if (error.code === "auth/invalid-email") {
      showError("rEmail", "Invalid email address.");
    } else if (error.code === "auth/weak-password") {
      showError("rPassword", "Password is too weak.");
    } else {
      showError("rEmail", "Signup failed. Please try again.");
    }
  }
});



