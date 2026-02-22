// LOAD CLOTHES
const container = document.getElementById("clothesContainer");
const wardrobeDiv = document.getElementById("myWardrobe");

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
          <!-- PLUS ICON -->
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.25" stroke-linecap="round"
          stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
        </span>

        <span class="icon check">
          <!-- CHECK ICON -->
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

    card.onclick = () => addToWardrobe(item);

    container.appendChild(card);
  });
}

// ADD TO WARDROBE
function addToWardrobe(item) {

  let wardrobe =
    JSON.parse(localStorage.getItem("wardrobe")) || [];

  // prevent duplicates
  const exists = wardrobe.find(c => c.id === item.id);

  if (!exists) {
    wardrobe.push(item);
    localStorage.setItem("wardrobe", JSON.stringify(wardrobe));
    renderWardrobe();
  }
}

// RENDER USER WARDROBE

function renderWardrobe() {

  const wardrobe =
    JSON.parse(localStorage.getItem("wardrobe")) || [];

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

// WARDROBE
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

loadClothes();
renderWardrobe();