// ===============================
// ELEMENTS
// ===============================
const container = document.getElementById("clothesContainer");
const wardrobeDiv = document.getElementById("myWardrobe");


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
    gender: "unisex",
    style: "casual",
    color: "white",
    image: "wardrobe/white_converse.jpg"
  }
];


// ===============================
// LOCAL STORAGE HELPERS
// ===============================
function getWardrobe() {
  return JSON.parse(localStorage.getItem("wardrobe")) || [];
}

function saveWardrobe(data) {
  localStorage.setItem("wardrobe", JSON.stringify(data));
}


// ===============================
// LOAD CLOTHES GRID
// ===============================
function loadClothes() {

  container.innerHTML = "";

  clothes.forEach(item => {

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

    // restore UI state
    updateButtonState(button, item.id);

    // toggle add/remove
    button.onclick = (e) => {
      e.stopPropagation();
      toggleWardrobe(item, button);
    };

    container.appendChild(card);
  });
}


// ===============================
// ADD / REMOVE ITEM
// ===============================
function toggleWardrobe(item, button) {

  let wardrobe = getWardrobe();

  const index = wardrobe.findIndex(c => c.id === item.id);

  if (index === -1) {
    wardrobe.push(item);
    button.classList.add("added");
  } else {
    wardrobe.splice(index, 1);
    button.classList.remove("added");
  }

  saveWardrobe(wardrobe);
  renderWardrobe();
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
// RENDER MY WARDROBE PAGE
// ===============================
function renderWardrobe() {

  if (!wardrobeDiv) return; // prevents error on add page

  const wardrobe = getWardrobe();

  wardrobeDiv.innerHTML = "";

  wardrobe.forEach(item => {

    const card = document.createElement("div");
    card.className = "cloth-card added";

    card.innerHTML = `
      <img src="${item.image}">
      <p>${item.name}</p>
    `;

    wardrobeDiv.appendChild(card);
  });
}


// ===============================
// INIT
// ===============================
loadClothes();
renderWardrobe();
