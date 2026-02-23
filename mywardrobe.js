import {
getFirestore,
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

const container = document.getElementById("myWardrobeContainer");

let currentUser = null;

// ================= LOAD USER WARDROBE =================
async function loadMyWardrobe() {

const snapshot = await getDocs(
collection(db, "users", currentUser.uid, "wardrobe")
);

container.innerHTML = "";

if (snapshot.empty) {
container.innerHTML = "<p>Your wardrobe is empty.</p>";
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

card.innerHTML = "<img src="${item.image}" /> <p>${item.name}</p>";

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
