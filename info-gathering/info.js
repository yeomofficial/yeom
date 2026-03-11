import { auth, db } from "../fbase.js";

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

let currentUser = null;
let imageUrl = "";

/* ---------------- AUTH ---------------- */

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    window.location.href = "login.html";
  }
});

/* ---------------- IMAGE PREVIEW + CLOUDINARY ---------------- */

const fileInput = document.getElementById("fileInput");
const profileImage = document.getElementById("profileImage");
const avatarWrapper = document.querySelector(".avatar-wrapper");

avatarWrapper.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async function () {

  const file = this.files[0];
  if (!file) return;

  /* preview */
  const reader = new FileReader();

  reader.onload = function (e) {
    profileImage.src = e.target.result;
    profileImage.style.display = "block";
    document.querySelector(".avatar-placeholder").style.display = "none";
  };

  reader.readAsDataURL(file);

  /* upload to Cloudinary */

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "yeom_unsigned");

  try {

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dwauleaof/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    imageUrl = data.secure_url;

  } catch (error) {

    showMessage("Image upload failed.", "error");

  }

});


/* ---------------- DOB LIMIT ---------------- */

const dobInput = document.getElementById("dob");

let today = new Date();
today.setDate(today.getDate() - 1);

dobInput.max = today.toISOString().split("T")[0];


/* ---------------- MESSAGE ---------------- */

function showMessage(text, type) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.className = type === "success" ? "success" : "error";
  msg.style.display = "block";
}


/* ---------------- FORM SUBMIT ---------------- */

const form = document.getElementById("infoForm");

form.addEventListener("submit", async function (e) {

  e.preventDefault();

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
    showMessage("Username must contain only lowercase letters, numbers, and underscores.", "error");
    return;
  }

  try {

    showMessage("Checking username availability...", "success");

    const usernameQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );

    const querySnapshot = await getDocs(usernameQuery);

    if (!querySnapshot.empty) {
      showMessage("Username already taken.", "error");
      return;
    }

    if (!currentUser) {
      showMessage("User not logged in.", "error");
      return;
    }

    /* save profile */

    await setDoc(doc(db, "users", currentUser.uid), {
      username,
      gender,
      dob,
      fashion,
      profile: imageUrl || "",
      createdAt: new Date()
    }, { merge: true });

    localStorage.setItem("loggedInUserId", currentUser.uid);
    localStorage.setItem("username", username);

    showMessage("Profile created! Redirecting...", "success");

    setTimeout(() => {
      window.location.replace("signup-wardrobe.html");
    }, 1500);

  } catch (error) {

    console.error(error);
    showMessage("Error saving profile.", "error");

  }

});
