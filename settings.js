
import { auth } from "./fbase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { logEvent } from "./analytics.js";

function showMessage(text, isError = false) {
  const box = document.getElementById("message-box");
  if (!box) return;
  box.textContent = text;
  box.className =
    "message-box " + (isError ? "message-error" : "message-success");
  box.style.display = "block";
}

window.logout = async function () {
  try {
    const uid = auth.currentUser?.uid;

    if (uid) {
      await logEvent("user_logged_out", uid); 
    }

    await signOut(auth);

    showMessage("Logged out successfully.");
    window.location.replace("index.html");
  } catch (error) {
    console.error("Logout failed:", error);
    showMessage("Error logging out. Try again.", true);
  }
};
