// ---------------- RESET SESSION ----------------
window.onload = function () {
  localStorage.removeItem("lumiPrompt");
  loadQuestion();
};

// ---------------- QUESTIONS ----------------
const questions = [
  {
    question: "Where are you going today?",
    options: [
      "Date",
      "Casual hangout",
      "College",
      "Party",
      "Just going out"
    ]
  },
  {
    id: "place",
    question: "What kind of place is it?",
    options: [
      "Café",
      "Mall",
      "Outdoor walking",
      "Restaurant",
      "Mostly indoors"
    ]
  },
  {
    question: "What time of day is this for?",
    options: [
      "Morning plans",
      "Afternoon outing",
      "Evening plans",
      "Night out",
      "All day wear"
    ]
  },
  {
    question: "What’s the weather like?",
    options: [
      "Hot",
      "Warm",
      "Cold",
      "Rainy"
    ]
  },
  {
    question: "What matters more today?",
    options: [
      "Comfort",
      "Looking attractive",
      "Standing out",
      "Looking mature"
    ]
  }
];


// ---------------- STATE ----------------
let currentQuestion = 0;
let answers = {};

const questionText = document.getElementById("questionText");
const optionsDiv = document.getElementById("options");
const backBtn = document.getElementById("backBtn");
const finalBtn = document.getElementById("finalBtn");

// ---------------- LOAD QUESTION ----------------
function loadQuestion() {

  finalBtn.style.display = "none";

  const q = questions[currentQuestion];
  questionText.innerText = q.question;
  optionsDiv.innerHTML = "";

  q.options.forEach(option => {

    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = option;

    btn.onclick = () => {
      answers[currentQuestion] = option;
      nextQuestion();
    };


    optionsDiv.appendChild(btn);
  });

  backBtn.style.display =
    currentQuestion === 0 ? "none" : "block";
}

// ---------------- AUTO NEXT ----------------
function nextQuestion() {

  currentQuestion++;

  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showFinalButton();
  }
}

// ---------------- BACK BUTTON ----------------
backBtn.onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
};

// ---------------- FINAL STEP ----------------
function showFinalButton() {
  optionsDiv.innerHTML = "";
  questionText.innerText = "Ready for your perfect outfit?";
  finalBtn.style.display = "block";
}

// ---------------- GENERATE PROMPT ----------------
finalBtn.onclick = () => {

  const prompt =
  `Give me an outfit recommendation.

  Plan : ${answers[0]}
  Place : ${answers[1]}
  Time : ${answers[2]}
  Weather: ${answers[3]}
  Impression: ${answers[4]}

  Suggest outfit, colors, and styling tips for me.`;

  localStorage.setItem("lumiPrompt", prompt);

  window.location.href = "lumi.html";
};

