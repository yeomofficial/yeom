// filepath: c:\Users\USER\Desktop\YEOM\search.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.appspot.com",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const searchInput = document.getElementById("searchInput");
const resultsList = document.getElementById("resultsList");

searchInput.addEventListener("input", async () => {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (searchTerm === "") {
    resultsList.innerHTML = ""; // Clear results if input is empty
    return;
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", ">=", searchTerm), where("username", "<=", searchTerm + "\uf8ff"));
    const querySnapshot = await getDocs(q);

    resultsList.innerHTML = ""; // Clear previous results

    if (querySnapshot.empty) {
      resultsList.innerHTML = "<p>No users found.</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const userElement = document.createElement("div");
      userElement.classList.add("user-result");
      userElement.innerHTML = `
        <p>@${userData.username}</p>
        <button onclick="viewProfile('${doc.id}')">View Profile</button>
      `;
      resultsList.appendChild(userElement);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    resultsList.innerHTML = "<p>Error loading results. Please try again.</p>";
  }
});

window.viewProfile = (userId) => {
  window.location.href = `profile.html?uid=${userId}`;
};
