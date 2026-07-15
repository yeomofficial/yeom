import { auth, db } from "./fbase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id") || "lesson_01";

let CURRENT_UID = null;
let LESSON = null;
let selectedOptionIndex = null;

// -------------------- AUTH + LOAD --------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }
  CURRENT_UID = user.uid;

  const lessonRef = doc(db, "lessons", lessonId);
  const snap = await getDoc(lessonRef);

  if (!snap.exists()) {
    document.getElementById("lessonTitle").textContent = "Lesson not found.";
    return;
  }

  LESSON = snap.data();
  renderStepExplanation();
});

// -------------------- STEP RENDERING --------------------
function showStep(id) {
  document.querySelectorAll(".lesson-step").forEach(el => el.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

let chatMessages = [];
let chatIndex = 0;

function renderStepExplanation() {
  document.getElementById("outfitImage").src = LESSON.imageAssetPath;

  const greeting = `Hi! I'm Lumi. Let's learn about "${LESSON.title}"`;
  const sentences = LESSON.explanation
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0);

  chatMessages = [greeting, ...sentences];
  chatIndex = 0;

  showStep("stepExplanation");
  updateProgress(25);
  renderChatBubble();
}

function renderChatBubble() {
  const bubble = document.getElementById("chatBubble");
  bubble.textContent = chatMessages[chatIndex];
  bubble.classList.remove("bubble-in");
  void bubble.offsetWidth;
  bubble.classList.add("bubble-in");

  const nextBtn = document.getElementById("bubbleNextBtn");
  const isLast = chatIndex === chatMessages.length - 1;
  nextBtn.innerHTML = isLast
    ? `<span class="bubble-next-label">Continue →</span>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>`;
}

document.getElementById("bubbleNextBtn").addEventListener("click", () => {
  if (chatIndex < chatMessages.length - 1) {
    chatIndex++;
    renderChatBubble();
  } else {
    renderStepTakeaway();
  }
});

function renderStepTakeaway() {
  document.getElementById("lessonTakeaway").textContent = LESSON.keyTakeaway;
  showStep("stepTakeaway");
  updateProgress(50);
}

function renderStepQuiz() {
  document.getElementById("quizQuestion").textContent = LESSON.quiz.question;

  const optionsWrap = document.getElementById("quizOptions");
  optionsWrap.innerHTML = "";

  LESSON.quiz.options.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = optionText;
    btn.addEventListener("click", () => handleQuizAnswer(index, btn));
    optionsWrap.appendChild(btn);
  });

  showStep("stepQuiz");
  updateProgress(75);
}

function handleQuizAnswer(index, btnEl) {
  if (selectedOptionIndex !== null) return; // prevent double-tap
  selectedOptionIndex = index;

  const allOptions = document.querySelectorAll(".quiz-option");
  allOptions.forEach(btn => btn.disabled = true);

  const isCorrect = index === LESSON.quiz.correctIndex;
  btnEl.classList.add(isCorrect ? "correct" : "incorrect");

  if (!isCorrect) {
    allOptions[LESSON.quiz.correctIndex].classList.add("correct");
  }

  setTimeout(() => completeLesson(isCorrect), 900);
}

async function completeLesson(isCorrect) {
  const xpEarned = isCorrect ? LESSON.xpReward : Math.floor(LESSON.xpReward / 2);

  const userRef = doc(db, "users", CURRENT_UID);
  await updateDoc(userRef, {
    xp: increment(xpEarned),
    "progress.lessonCompletedToday": true
  });

  document.getElementById("resultTitle").textContent = isCorrect
    ? "Nice! You got it right."
    : "Good try — lesson complete.";
  document.getElementById("resultXp").textContent = `+${xpEarned} XP`;

  showStep("stepResult");
  updateProgress(100);
}

function updateProgress(percent) {
  document.getElementById("lessonStepFill").style.width = `${percent}%`;
}

// -------------------- NAV BUTTONS --------------------
document.getElementById("nextToQuizBtn").addEventListener("click", renderStepQuiz);
document.getElementById("closeLessonBtn").addEventListener("click", () => window.location.href = "index.html");
document.getElementById("finishLessonBtn").addEventListener("click", () => window.location.href = "index.html");
