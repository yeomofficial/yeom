import { clothes } from "./clothesdata.js";

// ================= FIREBASE ==============
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

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";

// ================= FIREBASE CONFIG =================
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

// ================= FILTER STATES =================
let currentSearch = "";
let currentGenderFilter = "all";
let currentCategoryFilter = "all";
let currentColorFilter = "all";
let currentSort = "default";

// ================= DOM ELEMENTS =================
const container = document.getElementById("clothesContainer");
const searchInput = document.getElementById("searchInput");
const itemCount = document.getElementById("itemCount");

const sortBtn = document.getElementById("sortBtn");
const filterBtnInside = document.getElementById("filterBtnInside");
const sortOverlay = document.getElementById("sortOverlay");
const filterOverlay = document.getElementById("filterOverlay");

// ================= AUTH & WARDROBE =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    loadClothes();
    return;
  }
  currentUser = user;
  await loadUserWardrobeFromDB();
  loadClothes();
});

async function loadUserWardrobeFromDB() {
  if (!currentUser) return;
  try {
    const snapshot = await getDocs(collection(db, "users", currentUser.uid, "wardrobe"));
    userWardrobe = [];
    snapshot.forEach(doc => {
      userWardrobe.push(doc.data());
    });
  } catch (e) {
    console.error("Error loading wardrobe:", e);
  }
}

// ================= OVERLAY HELPERS =================
function toggleOverlay(overlay, show) {
  if (!overlay) return;
  if (show) {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  } else {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

if (sortBtn) sortBtn.onclick = () => toggleOverlay(sortOverlay, true);
if (filterBtnInside) filterBtnInside.onclick = () => toggleOverlay(filterOverlay, true);

document.querySelectorAll(".close-overlay").forEach(btn => {
  btn.onclick = (e) => {
    const overlay = e.target.closest(".overlay");
    toggleOverlay(overlay, false);
  };
});

document.querySelectorAll(".overlay").forEach(overlay => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      toggleOverlay(overlay, false);
    }
  });
});

// ================= SEARCH =================
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase();
    loadClothes();
  });
}

// ================= GENDER FILTERS =================
document.querySelectorAll(".filter-pill").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentGenderFilter = btn.dataset.gender;
    loadClothes();
  });
});

// ================= CATEGORY CHIPS =================
function setupCategoryChips(selector) {
  document.querySelectorAll(selector).forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(selector).forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      currentCategoryFilter = chip.dataset.category;

      loadClothes(); 
    });
  });
}

// ================= COLOR SWATCHES =================

function setupColorSwatches(selector) {
  document.querySelectorAll(selector).forEach(swatch => {
    if (swatch.id === "colorPickerTrigger") return;
    swatch.addEventListener("click", () => {
      document.querySelectorAll(selector).forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      currentColorFilter = swatch.dataset.color;
    });
  });
}

setupCategoryChips("#categoryFilters .filter-chip");
setupColorSwatches("#colorFilters .color-swatch");

// ================= CUSTOM COLOR PICKER =================
const colorPickerTrigger = document.getElementById("colorPickerTrigger");
const realColorPicker = document.getElementById("realColorPicker");

if (colorPickerTrigger) {
  colorPickerTrigger.addEventListener("click", () => realColorPicker?.click());
}

if (realColorPicker) {
  realColorPicker.addEventListener("input", (e) => {
    const hex = e.target.value;
    currentColorFilter = hex;

    // Remove previous active states
    document.querySelectorAll("#colorFilters .color-swatch").forEach(s => s.classList.remove("active"));

    // Remove old custom swatch
    const oldCustom = document.querySelector("#colorFilters .custom-color-swatch");
    if (oldCustom) oldCustom.remove();

    // Create new custom swatch
    const colorRow = document.getElementById("colorFilters");
    const customSwatch = document.createElement("button");
    customSwatch.className = "color-swatch custom-color-swatch active";
    customSwatch.dataset.color = hex;
    customSwatch.style.backgroundColor = hex;
    if (hex === "#ffffff" || hex === "#FFFFFF") {
      customSwatch.style.border = "2px solid #e0e0e0";
    }
    customSwatch.addEventListener("click", () => {
      document.querySelectorAll("#colorFilters .color-swatch").forEach(s => s.classList.remove("active"));
      customSwatch.classList.add("active");
      currentColorFilter = hex;
    });
    colorRow.appendChild(customSwatch);
  });
}

// ================= APPLY / RESET FILTERS =================
const applyFiltersBtn = document.getElementById("applyFilters");
if (applyFiltersBtn) {
  applyFiltersBtn.onclick = () => {
    toggleOverlay(filterOverlay, false);
    loadClothes();
  };
}

const resetFiltersBtn = document.getElementById("resetFilters");
if (resetFiltersBtn) {
  resetFiltersBtn.onclick = () => {
    currentCategoryFilter = "all";
    currentColorFilter = "all";

    document.querySelectorAll("#categoryFilters .filter-chip").forEach(c => {
      c.classList.toggle("active", c.dataset.category === "all");
    });

    document.querySelectorAll("#colorFilters .color-swatch").forEach(s => {
      s.classList.remove("active");
    });

    const oldCustom = document.querySelector("#colorFilters .custom-color-swatch");
    if (oldCustom) oldCustom.remove();

    const firstSwatch = document.querySelector("#colorFilters .color-swatch");
    if (firstSwatch) firstSwatch.classList.add("active");

    loadClothes();
  };
}

// ================= MAIN LOAD FUNCTION =================
function loadClothes() {
  if (!container) return;
  container.innerHTML = "";

  const filtered = clothes.filter(item => {
    if (!item) return false;

    const matchesSearch = !currentSearch || 
      item.name?.toLowerCase().includes(currentSearch);

    const matchesGender =
      currentGenderFilter === "all" ||
      item.gender === currentGenderFilter ||
      item.gender === "unisex";

    // FIXED: Normalize category (handle singular/plural)
    const itemCategory = (item.category || "").toLowerCase().trim();
    const filterCategory = currentCategoryFilter.toLowerCase().trim();

    let matchesCategory = currentCategoryFilter === "all";

    if (!matchesCategory) {
      // Handle both singular and plural forms
      matchesCategory = 
        itemCategory === filterCategory ||
        itemCategory + "s" === filterCategory ||      // top → tops
        itemCategory === filterCategory + "s" ||     // tops → top
        itemCategory === filterCategory.replace(/s$/, ""); // bottoms → bottom
    }

    // Color filter is disabled for now (as in original)
    const matchesColor = true;

    return matchesSearch && matchesGender && matchesCategory && matchesColor;
  });

  const sorted = sortItems(filtered);
  
  if (itemCount) {
    itemCount.innerText = `${sorted.length} Items`;
  }

  sorted.forEach(item => {
    const card = document.createElement("div");
    card.className = "cloth-card";

    const isInWardrobe = userWardrobe.some(w => w.id === item.id);

    // FIXED: Better image handling with fallback
    const imageSrc = item.image || item.img || "";
    const safeImageSrc = imageSrc ? 
      (imageSrc.startsWith('http') ? imageSrc : `./images/${imageSrc}`) : 
      'https://via.placeholder.com/300x400?text=No+Image';

    card.innerHTML = `
      <div class="img-wrapper">
        <img 
          src="${safeImageSrc}" 
          alt="${item.name || 'Clothing item'}"
          onerror="this.src='https://via.placeholder.com/300x400?text=Image+Not+Found'; this.onerror=null;"
        />
        <button class="add-btn ${isInWardrobe ? 'added' : ''}" data-id="${item.id}">
          <span class="icon plus">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
          </span>
          <span class="icon check">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </span>
        </button>
      </div>
      <p class="cloth-name">${item.name || 'Unnamed Item'}</p>
      <p class="cloth-category">${item.category || item.gender || 'Apparel'}</p>
    `;

    const button = card.querySelector(".add-btn");
    button.onclick = (e) => {
      e.stopPropagation();
      toggleWardrobe(item, button);
    };

    container.appendChild(card);
  });
}
// ================= TOGGLE WARDROBE =================
async function toggleWardrobe(item, button) {
  if (!currentUser) {
    alert("Please log in to add items to your wardrobe.");
    return;
  }

  const itemRef = doc(db, "users", currentUser.uid, "wardrobe", item.id);
  const index = userWardrobe.findIndex(c => c.id === item.id);

  try {
    if (index === -1) {
      const newItem = { ...item, createdAt: Date.now() };
      await setDoc(itemRef, newItem);
      userWardrobe.push(newItem);
      button.classList.add("added");
    } else {
      await deleteDoc(itemRef);
      userWardrobe.splice(index, 1);
      button.classList.remove("added");
    }
    loadClothes();
  } catch (e) {
    console.error("Error toggling wardrobe:", e);
  }
}
