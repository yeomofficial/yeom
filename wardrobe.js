//  ================= FIREBASE ==============
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

// ================= FIREBASE APP INIT =================
import { initializeApp } from
"https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";

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

let currentUser = null;
let userWardrobe = [];

let currentSearch = "";
let currentGenderFilter = "all";

async function loadUserWardrobeFromDB() {

  const snapshot = await getDocs(
    collection(db, "users", currentUser.uid, "wardrobe")
  );

  userWardrobe = [];

  snapshot.forEach(doc => {
    userWardrobe.push(doc.data());
  });
}

//  ================= ELEMENTS ==============
const container = document.getElementById("clothesContainer");

//  ================= SEARCH & FILTERS ==============

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.toLowerCase();
  loadClothes();
});

document.querySelectorAll(".filter-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    document
      .querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    currentGenderFilter = btn.dataset.gender;

    loadClothes();
  });

});

// ===============================
// DATA (MASTER CLOTHING INDEX)
// ===============================
const clothes = [
  {
    id: "white_tshirt",
    name: "White T-Shirt",
    category: "tops",
    gender: "unisex",
    style: "casual",
    color: "white",
    image: "wardrobe/white_tshirt.jpg"
  },
  {
    id: "blue_jeans",
    name: "Blue Denim Jeans",
    category: "bottoms",
    gender: "unisex",
    style: "casual",
    color: "blue",
    image: "wardrobe/blue_denimjeans.jpg"
  },
  {
    id: "white_sneakers",
    name: "White Converse",
    category: "shoes",
    gender: "men",
    style: "casual",
    color: "white",
    image: "wardrobe/white_converse.jpg"
  },
  {
    id: "w-btn-dwn-shirt-white",
    name: "Button Down Shirt White",
    category: "tops",
    gender: "men",
    style: "formal",
    color: "white",
    image: "wardrobe/women-btndown-white.jpg"
  }
];


// ===============================
// LOCAL STORAGE HELPERS
// ===============================
function getWardrobe() {
  return userWardrobe;
}

//  ================= SORT THE LIST ==============
function sortClothesForDisplay() {

  return [...clothes].sort((a, b) => {

    const aInWardrobe = userWardrobe.find(i => i.id === a.id);
    const bInWardrobe = userWardrobe.find(i => i.id === b.id);

    // both not added → keep order
    if (!aInWardrobe && !bInWardrobe) return 0;

    // added items go LAST
    if (aInWardrobe && !bInWardrobe) return 1;
    if (!aInWardrobe && bInWardrobe) return -1;

    // both added → sort by time added
    return aInWardrobe.createdAt - bInWardrobe.createdAt;
  });

}

// ===============================
// LOAD CLOTHES GRID
// ===============================
function loadClothes() {

  container.innerHTML = "";

  // already exists — keep this
  const sortedClothes = sortClothesForDisplay();


  // ADD THIS BLOCK HERE (FILTER STEP)
  const filteredClothes = sortedClothes.filter(item => {

    // SEARCH FILTER
    const matchesSearch =
      item.name.toLowerCase().includes(currentSearch);

    // GENDER FILTER
    let matchesGender = true;

    if (currentGenderFilter !== "all") {
      matchesGender =
        item.gender === currentGenderFilter ||
        item.gender === "unisex";
    }

    return matchesSearch && matchesGender;
  });


  // CHANGE THIS LINE
  // sortedClothes.forEach(item => {
  filteredClothes.forEach(item => {

    const card = document.createElement("div");
    card.className = "cloth-card";

    card.innerHTML = `
      <div class="img-wrapper">
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

    updateButtonState(button, item.id);

    button.onclick = (e) => {
      e.stopPropagation();
      toggleWardrobe(item, button);
    };

    container.appendChild(card);
  });
}


//  ================= ADD / REMOVE ITEM ==============

async function toggleWardrobe(item, button) {

  if (!currentUser) return;

  const itemRef = doc(
    db,
    "users",
    currentUser.uid,
    "wardrobe",
    item.id
  );

  const index = userWardrobe.findIndex(c => c.id === item.id);

  // ADD ITEM
  if (index === -1) {

    const newItem = {
      ...item,
      createdAt: Date.now()
    };

    await setDoc(itemRef, newItem);

    userWardrobe.push(newItem);
    button.classList.add("added");

    loadClothes();
  } 
  // REMOVE ITEM
  else {

    await deleteDoc(itemRef);

    userWardrobe.splice(index, 1);
    button.classList.remove("added");
  }
}


// ===============================
// RESTORE BUTTON STATE
// ===============================
function updateButtonState(button, id) {

  const wardrobe = getWardrobe();

  const exists = wardrobe.find(c => c.id === id);

  if (exists) {
    button.classList.add("added");
  }
}


// ===============================
// INIT
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  currentUser = user;

  await loadUserWardrobeFromDB();

  loadClothes();
});






