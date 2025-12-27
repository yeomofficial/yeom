alert("profile.js is running");
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/* ---------- DOM READY SAFETY ---------- */
window.addEventListener("DOMContentLoaded", () => {

  /* ---------- UPLOAD TRIGGER ---------- */
  const uploadIcon = document.querySelector(".upload-img");
  const fileInput = document.getElementById("fileInput");

  if (uploadIcon && fileInput) {
    uploadIcon.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem("selectedImage", e.target.result);
        window.location.href = "upload.html";
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- AUTH + PROFILE ---------- */
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.replace("index.html");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const profileUserId = params.get("uid") || user.uid;

    const currentUserRef = doc(db, "users", user.uid);
    const profileUserRef = doc(db, "users", profileUserId);

    const [currentSnap, profileSnap] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(profileUserRef),
    ]);

    if (!profileSnap.exists()) return;

    const profileData = profileSnap.data();
    const currentUserData = currentSnap.exists()
      ? currentSnap.data()
      : {};

    /* USERNAME */
    document.getElementById("loggedInUsername").innerText =
      "@" + profileData.username;

    /* PROFILE IMAGE */
    document.getElementById("profileImage").src =
      profileData.profile || "person.png";

    /* COUNTS */
    document.getElementById("spottersCount").innerText =
      profileData.spotters || 0;

    document.getElementById("spottingCount").innerText =
      profileData.spotting || 0;

    const isMyProfile = profileUserId === user.uid;

    if (!isMyProfile) {
      document.getElementById("editProfileBtn").style.display = "none";

      const spotBtn = document.createElement("button");
      spotBtn.className = "spot-button";

      let spottingIds = currentUserData.spottingIds || [];
      let isSpotting = spottingIds.includes(profileUserId);

      spotBtn.textContent = isSpotting ? "Unspot" : "Spot";

      spotBtn.onclick = async () => {
        if (isSpotting) {
          spottingIds = spottingIds.filter(id => id !== profileUserId);

          await updateDoc(currentUserRef, {
            spottingIds,
            spotting: increment(-1),
          });

          await updateDoc(profileUserRef, {
            spotters: increment(-1),
          });

          spotBtn.textContent = "Spot";
        } else {
          spottingIds.push(profileUserId);

          await updateDoc(currentUserRef, {
            spottingIds,
            spotting: increment(1),
          });

          await updateDoc(profileUserRef, {
            spotters: increment(1),
          });

          await addDoc(collection(db, "notifications"), {
            userId: profileUserId,
            type: "new_spotter",
            message: "You got a new spotter!",
            timestamp: serverTimestamp(),
            seen: false,
          });

          spotBtn.textContent = "Unspot";
        }

        isSpotting = !isSpotting;
      };

      document.querySelector(".profile-header").appendChild(spotBtn);
    }
  });
});

