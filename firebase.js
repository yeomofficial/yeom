// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.firebasestorage.app",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}
const signUp = document.getElementById("signup-btn");
signUp.addEventListener("click", (event) => {
  event.preventDefault();

  const email = document.getElementById("rEmail").value;
  const password = document.getElementById("rPassword").value;
  const termsCheckbox = document.getElementById("terms-checkbox"); // <-- updated id
  const termsError = document.getElementById("terms-error");

  // Clear previous errors
  clearInputError("emailInput");
  clearInputError("passwordInput");
  termsError.innerText = "";

  // Validate Terms and Conditions
  if (!termsCheckbox.checked) {
    termsError.innerText = "Please read and accept our Terms and Conditions.";
    return; // Stop signup if terms are not accepted
  }

  const auth = getAuth();
  const db = getFirestore();

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        email: email,
        spotters: 0,
        spotting: 0
      };
      showMessage("Account created successfully", "signUpMessage");
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
        .then(() => {
          window.location.href = "info.html";
        })
        .catch((error) => {
          console.error("error writing document", error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      console.error("Signup error:", errorCode);

      switch (errorCode) {
        case "auth/email-already-in-use":
          showInputError("emailInput", "This email is already registered.");
          break;
        case "auth/invalid-email":
          showInputError("emailInput", "Please enter a valid email address.");
          break;
        case "auth/missing-email":
          showInputError("emailInput", "Email cannot be empty.");
          break;
        case "auth/weak-password":
          showInputError(
            "passwordInput",
            "Password must be at least 6 characters."
          );
          break;
        case "auth/missing-password":
          showInputError("passwordInput", "Password cannot be empty.");
          break;
        default:
          showInputError("emailInput", "Signup failed. Please try again.");
          break;
      }
    });
});



const signIn = document.getElementById("loginBtn");
signIn.addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const auth = getAuth();

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      showMessage("Login successful", "signInMessage");
      const user = userCredential.user;
      localStorage.setItem("loggedInUserId", user.uid);
      window.location.href = "home.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/invalid-credential") {
        showMessage("Incorrect Email or password", "signInMessage");
      } else {
        showMessage("Account does not exist", "signInMessage");
      }
    });
});
