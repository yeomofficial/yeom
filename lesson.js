import { auth, db } from "./fbase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { clothes } from "./clothesdata.js";

const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id") || "lesson_01";

let CURRENT_UID = null;
let LESSON = null;
let CLOTHING_MAP = {};
let blockIndex = 0;
let correctCount = 0;
let totalGradableBlocks = 0;

buildClothingMap();

function buildClothingMap() {
  CLOTHING_MAP = Object.fromEntries(clothes.map(item => [item.id, item]));
}

// -------------------- TYPEWRITER EFFECT --------------------
function typeText(el, text, speed = 22) {
  el.textContent = "";
  let i = 0;
  return new Promise(resolve => {
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

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
    document.getElementById("blockContainer").innerHTML = "<p>Lesson not found.</p>";
    return;
  }

  LESSON = snap.data();
  totalGradableBlocks = LESSON.blocks.filter(b => b.type !== "teach").length || 1;

  renderBlock();
});

// -------------------- BLOCK ROUTER --------------------
function renderBlock() {
  const block = LESSON.blocks[blockIndex];

  if (!block) {
    completeLesson();
    return;
  }

  updateProgress(Math.round((blockIndex / LESSON.blocks.length) * 100));

  if (block.type === "teach") renderTeachBlock(block);
  else if (block.type === "question") renderQuestionBlock(block);
  else if (block.type === "outfit_challenge") renderOutfitChallengeBlock(block);
  else if (block.type === "image_choice") renderImageChoiceBlock(block);
}

function advanceBlock() {
  blockIndex++;
  renderBlock();
}

// -------------------- TEACH BLOCK --------------------
function renderTeachBlock(block) {
  const container = document.getElementById("blockContainer");

  container.innerHTML = `
    ${block.imageUrl ? `
      <div class="outfit-hero-wrap">
        <img class="outfit-hero" src="${block.imageUrl}" alt="Lesson visual" />
      </div>
    ` : ""}
    <div class="narrator-bar">
      <img class="lumi-avatar-mini" src="lumi/lumi.png" alt="Lumi" />
      <div class="chat-bubble-wrap">
        <div class="chat-bubble" id="teachBubbleText"></div>
      </div>
      <button class="bubble-next-btn" id="teachNextBtn" aria-label="Next">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
    </div>
  `;

  typeText(document.getElementById("teachBubbleText"), block.text);
  document.getElementById("teachNextBtn").addEventListener("click", advanceBlock);
}

// -------------------- QUESTION BLOCK --------------------
function renderQuestionBlock(block) {
  const container = document.getElementById("blockContainer");

  container.innerHTML = `
    <img class="lumi-avatar" src="lumi/lumi.png" alt="Lumi" />
    <h2 class="block-question">${block.question}</h2>
    <div class="quiz-options" id="quizOptionsWrap"></div>
  `;

  const optionsWrap = document.getElementById("quizOptionsWrap");
  let answered = false;

  block.options.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = optionText;

    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;

      const allBtns = optionsWrap.querySelectorAll(".quiz-option");
      allBtns.forEach(b => b.disabled = true);

      const isCorrect = index === block.correctIndex;
      btn.classList.add(isCorrect ? "correct" : "incorrect");
      if (!isCorrect) allBtns[block.correctIndex].classList.add("correct");
      if (isCorrect) correctCount++;

      setTimeout(advanceBlock, 900);
    });

    optionsWrap.appendChild(btn);
  });
}

// -------------------- IMAGE CHOICE BLOCK --------------------
function renderImageChoiceBlock(block) {
  const container = document.getElementById("blockContainer");

  container.innerHTML = `
    <img class="lumi-avatar" src="lumi/lumi.png" alt="Lumi" />
    <h2 class="block-question">${block.question}</h2>
    <div class="image-choice-grid" id="imageChoiceWrap"></div>
    <div class="narrator-bar hidden" id="imageChoiceExplainBar">
      <img class="lumi-avatar-mini" src="lumi/lumi.png" alt="Lumi" />
      <div class="chat-bubble-wrap">
        <div class="chat-bubble" id="imageChoiceExplainText"></div>
      </div>
      <button class="bubble-next-btn" id="imageChoiceNextBtn" aria-label="Next">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
    </div>
  `;

  const wrap = document.getElementById("imageChoiceWrap");
  let answered = false;

  block.options.forEach((option, index) => {
    const card = document.createElement("button");
    card.className = "image-choice-card";
    card.innerHTML = `<img src="${option.imageUrl}" alt="Option ${index + 1}" />`;

    card.addEventListener("click", () => {
      if (answered) return;
      answered = true;

      const allCards = wrap.querySelectorAll(".image-choice-card");
      allCards.forEach(c => c.disabled = true);

      const isCorrect = index === Number(block.correctIndex);
      card.classList.add(isCorrect ? "correct" : "incorrect");
      if (!isCorrect) allCards[Number(block.correctIndex)].classList.add("correct");
      if (isCorrect) correctCount++;

      typeText(document.getElementById("imageChoiceExplainText"),
  isCorrect ? block.correctExplanation : block.incorrectExplanation);
      document.getElementById("imageChoiceExplainBar").classList.remove("hidden");
    });

    wrap.appendChild(card);
  });

  document.getElementById("imageChoiceNextBtn").addEventListener("click", advanceBlock);
}

// -------------------- OUTFIT CHALLENGE BLOCK --------------------
function renderOutfitChallengeBlock(block) {
  const container = document.getElementById("blockContainer");
  const selection = {};

  container.innerHTML = `
    <img class="lumi-avatar" src="lumi/lumi.png" alt="Lumi" />
    <h2 class="block-question">${block.prompt}</h2>
    <div class="outfit-builder">
      ${["top", "bottom", "shoes"].map(cat => `
        <div class="outfit-category">
          <p class="outfit-category-label">${cat}</p>
          <div class="outfit-options" id="options-${cat}"></div>
        </div>
      `).join("")}
    </div>
    <button class="btn-primary full" id="checkOutfitBtn" disabled>Check Outfit</button>
  `;

  ["top", "bottom", "shoes"].forEach(category => {
    const wrap = document.getElementById(`options-${category}`);

    block.options[category].forEach(itemId => {
      const item = CLOTHING_MAP[itemId];
      if (!item) return;

      const card = document.createElement("button");
      card.className = "clothing-card";
      card.innerHTML = `<img src="${item.image}" alt="${item.name}" /><span>${item.name}</span>`;

      card.addEventListener("click", () => {
        wrap.querySelectorAll(".clothing-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selection[category] = itemId;

        const checkBtn = document.getElementById("checkOutfitBtn");
        checkBtn.disabled = !(selection.top && selection.bottom && selection.shoes);
      });

      wrap.appendChild(card);
    });
  });

  document.getElementById("checkOutfitBtn").addEventListener("click", () => {
    const isCorrect =
      selection.top === block.correctAnswer.top &&
      selection.bottom === block.correctAnswer.bottom &&
      selection.shoes === block.correctAnswer.shoes;

    if (isCorrect) correctCount++;

    document.getElementById("checkOutfitBtn").disabled = true;
    document.getElementById("checkOutfitBtn").textContent = isCorrect ? "Correct! ✓" : "Not quite — moving on";

    setTimeout(advanceBlock, 1000);
  });
}

// -------------------- COMPLETE LESSON --------------------
async function completeLesson() {
  const scoreRatio = correctCount / totalGradableBlocks;
  const xpEarned = scoreRatio >= 0.5 ? LESSON.xpReward : Math.floor(LESSON.xpReward / 2);

  const userRef = doc(db, "users", CURRENT_UID);
  await updateDoc(userRef, {
    xp: increment(xpEarned),
    "progress.lessonCompletedToday": true
  });

  document.getElementById("blockContainer").classList.add("hidden");
  document.getElementById("resultTitle").textContent =
    scoreRatio >= 0.5 ? "Nice! You did great." : "Good try — lesson complete.";
  document.getElementById("resultXp").textContent = `+${xpEarned} XP`;

  document.getElementById("stepResult").classList.remove("hidden");
  updateProgress(100);
}

function updateProgress(percent) {
  document.getElementById("lessonStepFill").style.width = `${percent}%`;
}

document.getElementById("closeLessonBtn").addEventListener("click", () => window.location.href = "index.html");
document.getElementById("finishLessonBtn").addEventListener("click", () => window.location.href = "index.html");
