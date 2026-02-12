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

function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";
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

