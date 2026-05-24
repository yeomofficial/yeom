import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.appspot.com",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const SUPPORT_EMAIL = "yeomapp@gmail.com";

async function sendEmailToSupport(subject, body) {
  try {
    await fetch(`https://formsubmit.co/ajax/${SUPPORT_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: subject,
        message: body,
        _template: "box",
      }),
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

/* ── View Navigation ── */

window.showView = function (viewId) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");


};

document.getElementById("faqRow").addEventListener("click", () => showView("faqView"));

document.getElementById("reportRow").addEventListener("click", () => showView("reportView"));
document.getElementById("feedbackRow").addEventListener("click", () => showView("feedbackView"));

/* ── FAQ Toggle ── */

window.toggleFaq = function (btn) {
  const item = btn.closest(".faq-item");
  item.classList.toggle("open");
};


/* ── Custom Category Dropdown ── */

const categorySelect = document.getElementById("categorySelect");
const categoryTrigger = document.getElementById("categoryTrigger");
const categoryDropdown = document.getElementById("categoryDropdown");
const categoryValue = document.getElementById("categoryValue");
const categoryHidden = document.getElementById("issueCategory");
const categoryOptions = document.querySelectorAll(".custom-select-option");

categoryValue.classList.add("placeholder");

categoryTrigger.addEventListener("click", () => {
  const isOpen = categorySelect.classList.toggle("open");
  if (isOpen) {
    let backdrop = document.querySelector(".custom-select-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "custom-select-backdrop";
      document.body.appendChild(backdrop);
    }
    backdrop.addEventListener("click", closeDropdown);
  } else {
    closeDropdown();
  }
});

function closeDropdown() {
  categorySelect.classList.remove("open");
  const backdrop = document.querySelector(".custom-select-backdrop");
  if (backdrop) backdrop.remove();
}

categoryOptions.forEach((opt) => {
  opt.addEventListener("click", () => {
    categoryOptions.forEach((o) => o.classList.remove("selected"));
    opt.classList.add("selected");
    categoryHidden.value = opt.dataset.value;
    categoryValue.textContent = opt.querySelector("span").textContent;
    categoryValue.classList.remove("placeholder");
    closeDropdown();
  });
});

/* ── Report Issue ── */

const reportForm = document.getElementById("reportForm");
const reportSuccess = document.getElementById("reportSuccess");

reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!categoryHidden.value) {
    categorySelect.classList.add("open");
    return;
  }

  const submitBtn = document.getElementById("reportSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const uid = auth.currentUser ? auth.currentUser.uid : "anonymous";
  const data = {
    uid,
    category: categoryHidden.value,
    subject: document.getElementById("issueSubject").value,
    description: document.getElementById("issueDesc").value,
    status: "open",
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "support_reports"), data);

    const emailBody = [
      `Category: ${categoryValue.textContent}`,
      `Subject: ${data.subject}`,
      `Description: ${data.description}`,
      `User ID: ${uid}`,
      `Time: ${new Date().toLocaleString()}`,
    ].join("\n");
    await sendEmailToSupport(`[YEOM Issue] ${data.subject}`, emailBody);

    reportForm.style.display = "none";
    reportSuccess.classList.add("show");
  } catch (err) {
    console.error("Failed to submit report:", err);
    alert("Something went wrong. Please try again.");
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "Submit Report";
});

window.resetReport = function () {
  reportForm.reset();
  reportForm.style.display = "flex";
  reportSuccess.classList.remove("show");
  categoryHidden.value = "";
  categoryValue.textContent = "Select a category";
  categoryValue.classList.add("placeholder");
  categoryOptions.forEach((o) => o.classList.remove("selected"));
};

/* ── Feedback ── */

const feedbackForm = document.getElementById("feedbackForm");
const feedbackSuccess = document.getElementById("feedbackSuccess");
let selectedRating = 0;

document.querySelectorAll(".rating-card").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".rating-card").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedRating = parseInt(btn.dataset.rating);
  });
});

feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (selectedRating === 0) {
    alert("Please select a rating first.");
    return;
  }

  const submitBtn = document.getElementById("feedbackSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  const uid = auth.currentUser ? auth.currentUser.uid : "anonymous";
  const data = {
    uid,
    rating: selectedRating,
    feedback: document.getElementById("feedbackText").value,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "support_feedback"), data);

    const ratingEmojis = ["😞", "😕", "😐", "😊", "🤩"];
    const emailBody = [
      `Rating: ${ratingEmojis[selectedRating - 1]} (${selectedRating}/5)`,
      `Feedback: ${data.feedback}`,
      `User ID: ${uid}`,
      `Time: ${new Date().toLocaleString()}`,
    ].join("\n");
    await sendEmailToSupport("[YEOM Feedback] New user feedback", emailBody);

    feedbackForm.style.display = "none";
    feedbackSuccess.classList.add("show");
  } catch (err) {
    console.error("Failed to submit feedback:", err);
    alert("Something went wrong. Please try again.");
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "Send Feedback";
});

window.resetFeedback = function () {
  feedbackForm.reset();
  feedbackForm.style.display = "flex";
  feedbackSuccess.classList.remove("show");
  selectedRating = 0;
  document.querySelectorAll(".rating-card").forEach((b) => b.classList.remove("selected"));
};
