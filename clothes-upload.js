const form = document.getElementById("clothingForm");

const categoryGrid = document.getElementById("categoryGrid");
const occasionList = document.getElementById("occasionList");

const typeSelect = document.getElementById("type");
const colourSelect = document.getElementById("colour");
const colourDot = document.getElementById("colourDot");

const photoCard = document.getElementById("photoCard");
const photoInput = document.getElementById("photoInput");
const clothingPreview = document.getElementById("clothingPreview");
const photoPlaceholder = document.getElementById("photoPlaceholder");
const removeBgBtn = document.getElementById("removeBgBtn");

const status = document.getElementById("status");

let selectedCategory = "Top";
let selectedOccasion = "Casual walk";


// ==========================================
// CATEGORY
// ==========================================

categoryGrid.addEventListener("click", (event) => {

  const button = event.target.closest(".category-option");

  if (!button) return;

  document
    .querySelectorAll(".category-option")
    .forEach((item) => {
      item.classList.remove("selected");
    });

  button.classList.add("selected");

  selectedCategory = button.dataset.value;

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

  typeSelect.innerHTML = "";

  options.forEach((type) => {

    const option = document.createElement("option");

    option.value = type;
    option.textContent = type;

    typeSelect.appendChild(option);
  });
}


// Set initial type options
updateTypeOptions(selectedCategory);


// ==========================================
// OCCASION
// ==========================================

occasionList.addEventListener("click", (event) => {

  const button = event.target.closest(".pill");

  if (!button) return;

  document
    .querySelectorAll(".pill")
    .forEach((item) => {
      item.classList.remove("selected");
    });

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


updateColourDot();


// ==========================================
// PHOTO UPLOAD
// ==========================================

// Clicking anywhere on the photo card
// opens the device's file picker.

photoCard.addEventListener("click", (event) => {

  // Don't open the file picker when
  // the remove-background button is clicked.
  if (event.target.closest("#removeBgBtn")) {
    return;
  }

  photoInput.click();
});


// ==========================================
// IMAGE SELECTED
// ==========================================

photoInput.addEventListener("change", () => {

  const file = photoInput.files[0];

  if (!file) return;


  // Make sure the selected file is an image
  if (!file.type.startsWith("image/")) {

    status.textContent =
      "Please choose an image.";

    return;
  }


  // Create temporary preview URL
  const imageURL =
    URL.createObjectURL(file);


  // Show image
  clothingPreview.src = imageURL;

  clothingPreview.style.display =
    "block";


  // Hide "Add a photo"
  photoPlaceholder.style.display =
    "none";


  // Show remove-background button
  removeBgBtn.style.display =
    "flex";


  status.textContent = "";
});


// ==========================================
// REMOVE BACKGROUND
// ==========================================

removeBgBtn.addEventListener("click", (event) => {

  event.stopPropagation();

  console.log("Remove background clicked");

  /*
    Later:

    1. Send image to background-removal service
    2. Receive processed image
    3. Replace clothingPreview.src
    4. Upload processed image to Cloudinary
  */
});


// ==========================================
// FORM SUBMIT
// ==========================================

form.addEventListener("submit", (event) => {

  event.preventDefault();


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
    Later, this is where we connect:

    Firebase + Cloudinary

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
