import { auth, db } from "./fbase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


function showMessage(text, type) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.className = type === "success" ? "success" : "error";
  msg.style.display = "block";
}

document.getElementById("submit").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const gender = document.getElementById("gender").value;
  const dob = document.getElementById("dob").value;
  const fashion = document.getElementById("fashion").value;

  if (!username || !gender || !dob || !fashion) {
    showMessage("Please fill in all fields.", "error");
    return;
  }

  const usernameRegex = /^[a-z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    showMessage("Username can only contain lowercase letters, numbers, and underscores (no capital letters, spaces, or symbols).", "error");
    return;
  }

  try {
    showMessage("Checking username availability...", "success");

    const usernameQuery = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(usernameQuery);

    if (!querySnapshot.empty) {
      showMessage("Username already taken. Please choose another.", "error");
      return;
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.setItem("loggedInUserId", user.uid);
        localStorage.setItem("username", username);

        await setDoc(doc(db, "users", user.uid), {
          username,
          gender,
          dob,
          fashion,
          createdAt: new Date()
        }, { merge: true });

        showMessage("Profile added successfully! Redirecting...", "success");

        document.getElementById("username").value = "";
        document.getElementById("gender").value = "";
        document.getElementById("dob").value = "";
        document.getElementById("fashion").value = "";

        setTimeout(() => {
          window.location.replace("signup-wardrobe.html");
        }, 1500);
      } else {
        showMessage("User is not logged in. Please log in and try again.", "error");
      }
    });
  } catch (error) {
    showMessage("There was an error saving your profile. Please try again.", "error");
  }
});






