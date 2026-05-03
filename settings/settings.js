// -------------------- IMPORTS --------------------
import { auth } from "../fbase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { logEvent } from "../analytics.js";

// -------------------- ELEMENTS --------------------
const logoutBtn = document.getElementById("logoutBtn");
const messageBox = document.getElementById("message-box");

// -------------------- UI MESSAGE --------------------
function showMessage(text, isError = false) {
  if (!messageBox) return;

  messageBox.textContent = text;
  messageBox.className =
    "message-box " + (isError ? "message-error" : "message-success");
  messageBox.style.display = "block";
}

// -------------------- LOGOUT HANDLER --------------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      // Prevent double clicks
      logoutBtn.disabled = true;

      const uid = auth.currentUser?.uid;

      // Log event (non-blocking mindset but awaited for consistency)
      if (uid) {
        await logEvent("user_logged_out", uid);
      }

      // Strict check (no silent failure)
      if (!auth) {
        throw new Error("Auth not initialized");
      }

      await signOut(auth);

      showMessage("Logged out successfully");

      setTimeout(() => {
        window.location.replace("../index.html");
      }, 800);

    } catch (err) {
      console.error("Logout failed:", err);
      showMessage("Error logging out. Try again.", true);
      logoutBtn.disabled = false; // re-enable if failed
    }
  });
}

// -------------------- RIPPLE EFFECT --------------------
function createRipple(e) {
  const item = e.currentTarget;

  const ripple = document.createElement("span");
  ripple.classList.add("ripple");

  const rect = item.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = x + "px";
  ripple.style.top = y + "px";

  item.appendChild(ripple);

  ripple.addEventListener("animationend", () => {
    ripple.remove();
  });
}

// Apply ripple to all items EXCEPT logout
document.querySelectorAll(".settings-item:not(.logout-item)").forEach((item) => {
  item.addEventListener("pointerdown", createRipple);
});

// -------------------- PAGE TRANSITION --------------------
function navigateWithTransition(url) {
  document.body.classList.add("page-exit");
  setTimeout(() => {
    window.location.href = url;
  }, 280);
}

// -------------------- NAVIGATION HANDLING --------------------
// Convert inline onclick → smooth navigation
document.querySelectorAll(".settings-item[onclick]").forEach((item) => {
  const onclickAttr = item.getAttribute("onclick");
  const match = onclickAttr.match(/location\.href\s*=\s*['"](.+?)['"]/);

  if (match) {
    item.removeAttribute("onclick");
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navigateWithTransition(match[1]);
    });
  }
});

// -------------------- BACK BUTTON TRANSITION --------------------
const backIcon = document.querySelector(".back-icon");

if (backIcon) {
  backIcon.removeAttribute("onclick");
  backIcon.addEventListener("click", () => {
    document.body.classList.add("page-exit");
    setTimeout(() => {
      history.back();
    }, 280);
  });
}
