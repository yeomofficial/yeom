import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Firebase config for Lumi
const firebaseConfig = {
  apiKey: "AIzaSyDk0OxSzdvJEEk67IBKk8jSc3tcoRPEcJM",
  authDomain: "lumi-9d549.firebaseapp.com",
  projectId: "lumi-9d549",
  storageBucket: "lumi-9d549.firebasestorage.app",
  messagingSenderId: "433691735405",
  appId: "1:433691735405:web:1b6040c1d10957ad4a9664",
  measurementId: "G-5FVHDX5X59"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendButton = document.getElementById("sendButton");

// Typing animation
function showTyping() {
  const typingEl = document.createElement("div");
  typingEl.className = "typing";
  typingEl.innerHTML = `<span>.</span><span>.</span><span>.</span>`;
  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return typingEl;
}

function addMessage(content, sender = "user") {
  const messageEl = document.createElement("div");
  messageEl.className = sender === "lumi" ? "message lumi" : "message user";
  messageEl.textContent = content;
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate reply
async function generateReply(input) {
  const lowerInput = input.toLowerCase();

  // Greetings
  if (["hi", "hello", "hey"].includes(lowerInput)) {
    return "Hey lovely! 🌸 I’m Lumi — your personal fashion BFF. Ready to glam up your vibe? 💄✨";
  }

  // Analyze input using compromise
  const docResult = window.nlp(input);
  const text = docResult.text();

  if (text.includes("color")) {
    let season = "general";

    if (text.includes("summer")) {
      season = "summer";
    } else if (text.includes("winter")) {
      season = "winter";
    }

    try {
      const tipSnap = await getDoc(doc(db, "tips", "colors"));
      const data = tipSnap.data();

      if (data && data[season]) {
        return `✨ Here is the best style tip for  ${season} you ${data[season]} 💖`;
      } else {
        return "Oopsie! 😢 I couldn't find the perfect color tip for that. Try rephrasing it, cutie 💕";
      }
    } catch (err) {
      console.error("Error fetching tip:", err);
      return "Eek! Something went wrong fetching that tip 💔 Give me a sec and try again!";
    }
  }

  return "Mmm, fashion is all about YOU! 💁‍♀️ Wear what makes your soul sparkle ✨💃";
}

// Send message handler
async function handleSend() {
  const input = chatInput.value.trim();
  if (!input) return;

  addMessage(input, "user");
  chatInput.value = "";

  const typingIndicator = showTyping();

  setTimeout(async () => {
    typingIndicator.remove();

    const reply = await generateReply(input);
    addMessage(reply, "lumi");

    await addDoc(collection(db, "conversations"), {
      message: input,
      reply: reply,
      timestamp: serverTimestamp()
    });

  }, 1000);
}

// Handle Send button click
sendButton.addEventListener("click", handleSend);

// Handle Enter key press
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSend();
  }
});

// Handle suggestion bubbles
document.querySelectorAll(".suggestion-bubble").forEach((bubble) => {
  bubble.addEventListener("click", () => {
    chatInput.value = bubble.textContent;
  });
});
