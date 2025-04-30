import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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
const auth = getAuth(app);

function showMessage(text, isError = false) {
  const box = document.getElementById("message-box");
  box.textContent = text;
  box.className = "message-box " + (isError ? "message-error" : "message-success");
  box.style.display = "block";
}

window.logout = function () {
  signOut(auth)
    .then(() => {
      showMessage("Logged out successfully.");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500); // Give user a moment to read the message
    })
    .catch((error) => {
      showMessage("Error logging out. Try again.", true);
    });
};
