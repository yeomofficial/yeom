// FIREBASE
import { auth, db } from "./fbase.js";
import { clothes } from "./clothesdata.js";

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

let currentUser = null;
let userWardrobe = [];

const container = document.getElementById("clothesContainer");
const continueBtn = document.getElementById("continueBtn");

// USE SAME clothes ARRAY FROM YOUR ORIGINAL FILE
const clothes = [ /* paste your clothes array here */ ];

async function loadUserWardrobeFromDB() {
  const snapshot = await getDocs(
    collection(db, "users", currentUser.uid, "wardrobe")
  );

  userWardrobe = [];
  snapshot.forEach(doc => {
    userWardrobe.push(doc.data());
  });
}

function loadClothes() {
  container.innerHTML = "";

  clothes.forEach(item => {
    const card = document.createElement("div");
    card.className = "cloth-card";

    card.innerHTML = `
      <div class="img-wrapper" style="position:relative">
        <img src="${item.image}" />

        <button class="add-btn" data-id="${item.id}">
          +
        </button>
      </div>

      <p>${item.name}</p>
    `;

    const button = card.querySelector(".add-btn");

    if (userWardrobe.find(c => c.id === item.id)) {
      button.classList.add("added");
    }

    button.onclick = () => toggleWardrobe(item, button);

    container.appendChild(card);
  });
}

async function toggleWardrobe(item, button) {

  const itemRef = doc(
    db,
    "users",
    currentUser.uid,
    "wardrobe",
    item.id
  );

  const index = userWardrobe.findIndex(c => c.id === item.id);

  if (index === -1) {

    const newItem = {
      ...item,
      createdAt: Date.now()
    };

    await setDoc(itemRef, newItem);
    userWardrobe.push(newItem);

    button.classList.add("added");

  } else {

    await deleteDoc(itemRef);
    userWardrobe.splice(index, 1);

    button.classList.remove("added");
  }

  updateContinueButton();
}

function updateContinueButton() {
  if (userWardrobe.length >= 3) {
    continueBtn.classList.add("enabled");
    continueBtn.disabled = false;
  } else {
    continueBtn.classList.remove("enabled");
    continueBtn.disabled = true;
  }
}

continueBtn.onclick = () => {
  window.location.href = "index.html"; // AI page
};

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUser = user;
  await loadUserWardrobeFromDB();
  loadClothes();
  updateContinueButton();
});
