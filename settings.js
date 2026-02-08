import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { auth } from "./fbase.js";
import { logEvent } from "./analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.appspot.com",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Show msg func 
function showMessage(text, isError = false) {
  const box = document.getElementById("message-box");
  if (!box) return;
  box.textContent = text;
  box.className =
    "message-box " + (isError ? "message-error" : "message-success");
  box.style.display = "block";
}

// -------------------- LOGOUT HANDLER --------------------
logoutBtn?.addEventListener("click", async () => {
  try {
    const uid = auth.currentUser?.uid;

    // KPI tracking (must never break UX)
    if (uid) {
      logEvent("user_logged_out", uid);
    }

    // Firebase sign out
    await signOut(auth);

    // UX feedback
    showMessage("Logged out successfully");

    // Allow DOM paint before redirect
    setTimeout(() => {
      window.location.replace("index.html");
    }, 800);

  } catch (err) {
    console.error("Logout failed:", err);
    showMessage("Error logging out. Try again.", true);
  }
});
