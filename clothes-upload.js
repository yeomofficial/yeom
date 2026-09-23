const form = document.getElementById("clothingForm");

const categoryGrid = document.getElementById("categoryGrid");
const occasionList = document.getElementById("occasionList");

const typeSelect = document.getElementById("type");
const colourSelect = document.getElementById("colour");
const colourDot = document.getElementById("colourDot");

const photoInput = document.getElementById("photoInput");
const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");
const editPhotoBtn = document.getElementById("editPhotoBtn");

const clothingPreview = document.getElementById("clothingPreview");
const photoPlaceholder = document.getElementById("photoPlaceholder");

const status = document.getElementById("status");

let selectedCategory = "Top";
let selectedOccasion = "Casual walk";


// ==========================================
// CATEGORY
// ==========================================

categoryGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".category-option");

  if (!button) return;

  // Remove selected state
  document.querySelectorAll(".category-option").forEach((item) => {
    item.classList.remove("selected");
  });

  // Select clicked category
  button.classList.add("selected");

  selectedCategory = button.dataset.value;

  // Change available clothing types
  updateTypeOptions(selectedCategory);
});


// ==========================================
// TYPE OPTIONS
// ==========================================

const typeOptions = {
  Top: [
    "T-shirt",
    "Shirt",
    "Polo",
    "Hoodie",
    "Sweater",
    "Tank Top"
  ],

  Bottom: [
    "Jeans",
    "Trousers",
    "Cargo Pants",
    "Shorts",
    "Joggers",
    "Chinos"
  ],

  Shoes: [
    "Sneakers",
    "Loafers",
    "Boots",
    "Sandals",
    "Sports Shoes"
  ],

  Outerwear: [
    "Jacket",
    "Denim Jacket",
    "Blazer",
    "Coat",
    "Overshirt"
  ],

  "Full Set": [
    "Suit",
    "Tracksuit",
    "Traditional Wear",
    "Co-ord Set"
  ]
};


function updateTypeOptions(category) {

  const options = typeOptions[category] || [];

  // Clear current options
  typeSelect.innerHTML = "";

  // Add new options
  options.forEach((type) => {

    const option = document.createElement("option");

    option.value = type;
    option.textContent = type;

    typeSelect.appendChild(option);
  });
}


// ==========================================
// OCCASION
// ==========================================

occasionList.addEventListener("click", (event) => {

  const button = event.target.closest(".pill");

  if (!button) return;

  // Remove previous selection
  document.querySelectorAll(".pill").forEach((item) => {
    item.classList.remove("selected");
  });

  // Select clicked occasion
  button.classList.add("selected");

  selectedOccasion = button.dataset.value;
});


// ==========================================
// COLOUR
// ==========================================

function updateColourDot() {

  const selectedOption =
    colourSelect.options[colourSelect.selectedIndex];

  colourDot.style.background =
    selectedOption.dataset.colour || "#b8b8b8";
}


colourSelect.addEventListener(
  "change",
  updateColourDot
);


// Set initial colour
updateColourDot();


// ==========================================
// IMAGE UPLOAD / PREVIEW
// ==========================================

function openPhotoPicker() {
  photoInput.click();
}


// Upload button
uploadPhotoBtn.addEventListener(
  "click",
  openPhotoPicker
);


// Edit button
editPhotoBtn.addEventListener(
  "click",
  openPhotoPicker
);


// When user chooses an image
photoInput.addEventListener("change", () => {

  const file = photoInput.files[0];

  if (!file) return;


  // Make sure it's actually an image
  if (!file.type.startsWith("image/")) {

    status.textContent =
      "Please choose an image.";

    return;
  }


  // Create temporary preview URL
  const imageURL =
    URL.createObjectURL(file);


  clothingPreview.src = imageURL;

  clothingPreview.style.display =
    "block";

  photoPlaceholder.style.display =
    "none";

  status.textContent = "";
});


// ==========================================
// BACK BUTTON
// ==========================================

document
  .querySelector(".back-btn")
  .addEventListener("click", () => {

    history.back();

  });


// ==========================================
// FORM SUBMIT
// ==========================================

form.addEventListener("submit", (event) => {

  event.preventDefault();


  // Collect clothing information
  const data = {

    category: selectedCategory,

    type: typeSelect.value,

    colour: colourSelect.value,

    occasion: selectedOccasion

  };


  console.log(
    "Clothing data:",
    data
  );


  status.textContent =
    `${data.type} added — ` +
    `${data.category}, ` +
    `${data.colour}, ` +
    `${data.occasion}.`;


  /*
    Later, this is where we can connect
    Firebase + Cloudinary.

    Example:

    await addDoc(
      collection(
        db,
        "users",
        user.uid,
        "wardrobe"
      ),
      {
        ...data,
        imageUrl: cloudinaryImageUrl,
        createdAt: serverTimestamp()
      }
    );

  */
});
