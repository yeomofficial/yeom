// -------------------- FIREBASE SETUP --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ensureUserProgress } from "./userProgress.js";
import { logEvent } from "./analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.firebasestorage.app",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// -------------------- STATE --------------------
let CURRENT_UID = null;
let USER_PROGRESS = null;

// -------------------- AUTH --------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // no user — redirect to login, Home requires auth now
    window.location.replace("login.html");
    return;
  }

  CURRENT_UID = user.uid;
  USER_PROGRESS = await ensureUserProgress(db, CURRENT_UID);

  renderHome(USER_PROGRESS);
});

// -------------------- RENDER HOME --------------------
function renderHome(progress) {
  console.log("Rendering home with:", progress);
  // TODO: render streak, Style Plan checklist, Continue Learning card
  // using progress.streak, progress.progress, progress.xp, progress.level
}
