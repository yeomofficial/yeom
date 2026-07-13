// -------------------- FIREBASE SETUP --------------------
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { ensureUserProgress } from "./userProgress.js";
import { logEvent } from "./analytics.js";

// -------------------- STATE --------------------
let CURRENT_UID = null;
let USER_PROGRESS = null;

// -------------------- AUTH --------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }

  CURRENT_UID = user.uid;
  USER_PROGRESS = await ensureUserProgress(db, CURRENT_UID);

  renderHome(USER_PROGRESS);
});


// -------------------- RENDER HOME --------------------

async function renderHome(progress) {
  // ---- Greeting ----
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  document.getElementById("greetingText").textContent = `${greeting}, ${progress.username || ""}`;

  // ---- Streak ----
  const streakCount = progress.streak?.count || 0;
  document.getElementById("streakCount").textContent = `${streakCount} Day Streak`;
  document.getElementById("streakMsg").textContent =
    streakCount > 0 ? "Keep it up and make it a lifestyle." : "Start today and build the habit.";

  // ---- Style Plan ----
  const items = [
    { label: "Complete today's lesson", done: progress.progress.lessonCompletedToday },
    { label: "Ask Lumi for an outfit", done: progress.progress.usedLumiToday }
  ];
  const completedCount = items.filter(i => i.done).length;
  document.getElementById("stylePlanCount").textContent = `${completedCount} / ${items.length} Completed`;

  const list = document.getElementById("stylePlanList");
  list.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.className = "style-plan-item" + (item.done ? " done" : "");
    li.innerHTML = `<span>${item.label}</span> <span>${item.done ? "✅" : "☐"}</span>`;
    list.appendChild(li);
  });

  // ---- Continue Learning ----
  if (progress.progress.lessonCompletedToday) {
    document.getElementById("lessonTitle").textContent = "Come back tomorrow to level up your fashion.";
    document.getElementById("continueLessonBtn").disabled = true;
    document.getElementById("continueLessonBtn").textContent = "Locked";
  } else if (progress.currentLessonId) {
    const lessonRef = doc(db, "lessons", progress.currentLessonId);
    const lessonSnap = await getDoc(lessonRef);
    if (lessonSnap.exists()) {
      const lesson = lessonSnap.data();
      document.getElementById("lessonTitle").textContent = lesson.title;
      document.getElementById("continueLessonBtn").onclick = () =>
        window.location.href = `lesson.html?id=${progress.currentLessonId}`;
    }
  } else {
    // no lesson assigned yet — default to lesson_01
    document.getElementById("lessonTitle").textContent = "What is Casual Wear?";
    document.getElementById("continueLessonBtn").onclick = () =>
      window.location.href = `lesson.html?id=lesson_01`;
  }

  // ---- Outfit Tip (simple daily rotation, no Firestore needed yet) ----
  const tips = [
    "White sneakers go with almost any casual outfit.",
    "Roll your sleeves for an easy, relaxed look.",
    "Neutral colors are easiest to mix and match."
  ];
  const dayIndex = new Date().getDate() % tips.length;
  document.getElementById("outfitTipText").textContent = tips[dayIndex];
}
