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
          <span class="icon plus">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.25" stroke-linecap="round"
            stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
          </span>

          <span class="icon check">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.25" stroke-linecap="round"
            stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </span>
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
