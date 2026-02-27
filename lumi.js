import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

import { collection, getDocs } from "firebase/firestore";

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

// -------------------- STATE --------------------
let cachedWardrobe = null;
let conversationHistory = [];
let isThinking = false;

// -------------------- DOM --------------------
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chat = document.getElementById("chat");

// ===============================
// GET USER WARDROBE (CACHED)
// ===============================
async function getUserWardrobe() {

  // return cache if already loaded
  if (cachedWardrobe) return cachedWardrobe;

  const user = auth.currentUser;
  if (!user) return [];

  const snapshot = await getDocs(
    collection(db, "users", user.uid, "wardrobe")
  );

  cachedWardrobe = [];

  snapshot.forEach(doc => {
    cachedWardrobe.push(doc.data());
  });

  return cachedWardrobe;
}

// ===============================
// MESSAGE UI
// ===============================
function addMessage(text, sender) {
  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.textContent = text;

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

// -------------------- Typing Indicator --------------------
function showTyping() {
  const typing = document.createElement("div");
  typing.className = "message ai";
  typing.id = "typing";
  typing.textContent = "Lumi is styling...";
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  document.getElementById("typing")?.remove();
}

// ===============================
// TOAST
// ===============================
function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ===============================
// INTENT DETECTION (LIGHT AI SIGNAL)
// ===============================
function detectIntent(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("wear") || msg.includes("outfit"))
    return "outfit";

  if (msg.includes("photo") || msg.includes("pose"))
    return "photo";

  return "chat";
}

// ===============================
// SEND MESSAGE
// ===============================
async function handleSend() {

  if (!canSendMessage()) return;
  if (isThinking) return;

  const text = input.value.trim();
  if (!text) return;

  isThinking = true;

  const bubbles = document.getElementById("bubbles");
  if (bubbles) bubbles.style.display = "none";

  addMessage(text, "user");
  input.value = "";

  showTyping();

  try {

    // ⭐ Load wardrobe once
    const wardrobe = await getUserWardrobe();

    // ⭐ Save conversation memory
    conversationHistory.push({
      role: "user",
      content: text
    });

    const res = await fetch(
      "https://yeomserver.onrender.com/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          wardrobe: wardrobe,
          history: conversationHistory.slice(-6),
          intent: detectIntent(text)
        })
      }
    );

    const data = await res.json();

    removeTyping();

    addMessage(data.reply, "ai");

    // save AI reply to memory
    conversationHistory.push({
      role: "assistant",
      content: data.reply
    });

  } catch (err) {

    removeTyping();
    addMessage("Something went wrong 😭 Try again.", "ai");
    console.error(err);

  }

  isThinking = false;
}

// ===============================
// AUTO PROMPT SYSTEM
// ===============================
window.addEventListener("load", () => {

  const autoPrompt = localStorage.getItem("lumiPrompt");

  if (autoPrompt) {

    input.value = autoPrompt;

    const bubbles = document.getElementById("bubbles");
    if (bubbles) bubbles.style.display = "none";

    localStorage.removeItem("lumiPrompt");

    setTimeout(handleSend, 200);
  }
});

// ===============================
// BUTTON EVENTS
// ===============================
sendBtn.addEventListener("click", handleSend);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend();
});

// ===============================
// QUICK PROMPT BUTTONS
// ===============================
document.getElementById("photoBtn").onclick = () => {
  input.value = "How can I look confident in photos?";
};

document.getElementById("eventBtn").onclick = () => {
  input.value = "How should I dress for this event?";
};

document.getElementById("dateBtn").onclick = () => {
  input.value = "How should I dress for a date?";
};

// ===============================
// BLOCK IMAGE SAVE
// ===============================
document.addEventListener("contextmenu", (e) => {
  if (e.target.closest("input, textarea")) return;
  e.preventDefault();
});

document.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
  }
});

// ===============================
// RATE LIMIT SYSTEM
// ===============================
function canSendMessage() {

  const LIMIT = 10;
  const COOLDOWN = 5000;

  const today = new Date().toDateString();
  let usage = JSON.parse(localStorage.getItem("yeom_usage"));

  if (!usage) {
    usage = {
      count: 0,
      lastReset: today,
      lastMessageTime: 0
    };
  }

  if (usage.lastReset !== today) {
    usage.count = 0;
    usage.lastReset = today;
  }

  const now = Date.now();

  if (now - usage.lastMessageTime < COOLDOWN) {
    showToast("Wait 5 seconds — YEOM is styling");
    return false;
  }

  if (usage.count >= LIMIT) {
    showToast("You've used all 10 style requests today.");
    return false;
  }

  usage.count++;
  usage.lastMessageTime = now;

  localStorage.setItem("yeom_usage", JSON.stringify(usage));

  return true;
}





