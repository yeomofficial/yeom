import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { logEvent } from "./analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.appspot.com",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Optional: show messages to user
function showMessage(text, isError = false) {
  const box = document.getElementById("message-box");
  if (!box) return; // ignore if no message box
  box.textContent = text;
  box.className = "message-box " + (isError ? "message-error" : "message-success");
  box.style.display = "block";
}

// Logout function
window.logout = async function () {
  try {
    const uid = auth.currentUser?.uid;

    if (uid) {
      logEvent("user_logged_out", uid); //  KPI tracked
    }
    
    await signOut(auth);
    // Optional message (briefly show)
    showMessage("Logged out successfully.");
    // Immediately replace the page to login, preventing back button issues
    window.location.replace("index.html");
  } catch (error) {
    console.error("Logout failed:", error);
    showMessage("Error logging out. Try again.", true);
  }
};


