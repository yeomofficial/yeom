import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";

import {
getFirestore,
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.appspot.com",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const container = document.getElementById("myWardrobeContainer");

let currentUser = null;

// ================= LOAD USER WARDROBE =================
async function loadMyWardrobe() {

const snapshot = await getDocs(
collection(db, "users", currentUser.uid, "wardrobe")
);

container.innerHTML = "";

if (snapshot.empty) {
container.innerHTML = `<p>Your wardrobe is empty.</p>`;
return;
}

snapshot.forEach(doc => {
const item = doc.data();
renderItem(item);
});
}

// ================= RENDER ITEM =================
function renderItem(item) {

const card = document.createElement("div");
card.className = "cloth-card";

card.innerHTML = `
  <img src="${item.image}" />
  <p>${item.name}</p>
`;

container.appendChild(card);
}

// ================= INIT =================
onAuthStateChanged(auth, async (user) => {

if (!user) {
window.location.href = "/login.html";
return;
}

currentUser = user;

await loadMyWardrobe();
});
