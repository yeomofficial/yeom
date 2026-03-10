import { auth } from "./fbase.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// Message display function
function showMessage(text, isError = false) {
  const box = document.getElementById("message-box");
  box.textContent = text;
  box.className = "message-box " + (isError ? "message-error" : "message-success");
  box.style.display = "block";
}

document.getElementById("reset-btn").addEventListener("click", () => {
  const emailInput = document.getElementById("email").value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate email format
  if (!emailRegex.test(emailInput)) {
    showMessage("Please enter a valid email address.", true);
    return;
  }

  sendPasswordResetEmail(auth, emailInput)
    .then(() => {
      showMessage("Password reset link sent to your email.");
    })
    .catch((error) => {
      switch (error.code) {
        case "auth/too-many-requests":
          showMessage("Too many requests. Please wait a moment and try again.", true);
          break;
        case "auth/user-not-found":
          showMessage("No user found with this email.", true);
          break;
        case "auth/invalid-email":
          showMessage("Invalid email format.", true);
          break;
        default:
          showMessage("Error: " + error.message, true);
      }
    });
});

