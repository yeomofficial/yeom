import { auth } from "./fbase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { logEvent } from "./analytics.js";

const logoutBtn = document.getElementById("logoutBtn");

// -------------------- UI MESSAGE --------------------
function showMessage(text, isError = false) {
  const box = document.getElementById("message-box");
  if (!box) return;

  box.textContent = text;
  box.className =
    "message-box " + (isError ? "message-error" : "message-success");
  box.style.display = "block";
}

// -------------------- LOGOUT HANDLER --------------------
logoutBtn.addEventListener("click", async () => {
  try {
    const uid = auth.currentUser?.uid;

    // KPI (fire & forget)
    if (uid) {
      logEvent("user_logged_out", uid);
    }

    await signOut(auth);

    showMessage("Logged out successfully");

    setTimeout(() => {
      window.location.replace("index.html");
    }, 800);

  } catch (err) {
    console.error("Logout failed:", err);
    showMessage("Error logging out. Try again.", true);
  }
});
