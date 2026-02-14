// -------------------- Handles user input & message rendering --------------------
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chat = document.getElementById("chat");

function addMessage(text, sender) {
    const message = document.createElement("div");
    message.classList.add("message", sender);
    message.textContent = text;
    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}

async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    const bubbles = document.getElementById("bubbles");
    if (bubbles) bubbles.style.display = "none";
    
    addMessage(text, "user");
    input.value = "";

    // show thinking message
    addMessage("Lumi is thinking...", "ai");

    const res = await fetch("https://yeomserver.onrender.com/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    // remove thinking message
    chat.lastChild.remove();

    addMessage(data.reply, "ai");
}

sendBtn.addEventListener("click", handleSend);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSend();
    }
});

// -------------------- BUBBLE TO INPUT TEXT --------------------
document.getElementById("photoBtn").onclick = () => {
    input.value = "How can I look confident in photos?";
};

document.getElementById("eventBtn").onclick = () => {
    input.value = "How should I dress for this event?";
};

document.getElementById("dateBtn").onclick = () => {
    input.value = "How should I dress for a date?";
};

// -------------------- BLOCK IMAGE CONTEXT MENU --------------------
document.addEventListener("contextmenu", (e) => {
  if (e.target.closest("input, textarea")) return;
  e.preventDefault();
});

document.addEventListener("dragstart", (e) => {
  if (e.target.tagName === "IMG") {
    e.preventDefault();
  }
});

// -------------------- TIMER AND RATE LIMIT FOR AI-----------------

function canSendMessage() {
  const LIMIT = 10;
  const COOLDOWN = 5000;

  const today = new Date().toDateString();

  let usage = JSON.parse(localStorage.getItem("yeom_usage"));

  // First time user
  if (!usage) {
    usage = {
      count: 0,
      lastReset: today,
      lastMessageTime: 0
    };
  }

  // Daily reset check
  if (usage.lastReset !== today) {
    usage.count = 0;
    usage.lastReset = today;
  }

  const now = Date.now();

  // Cooldown check
  if (now - usage.lastMessageTime < COOLDOWN) {
    alert("Wait 5 seconds — YEOM is styling 👀");
    return false;
  }

  // Daily limit check
  if (usage.count >= LIMIT) {
    alert("You've used all 10 style requests today ✨");
    return false;
  }

  // Update usage
  usage.count++;
  usage.lastMessageTime = now;

  localStorage.setItem("yeom_usage", JSON.stringify(usage));

  return true;
}
