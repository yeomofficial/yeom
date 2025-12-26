// Test if JS is running
document.body.style.backgroundColor = "#ffcccc"; // light red/pink
setTimeout(() => {
  document.body.style.backgroundColor = "white"; // revert after 2s
}, 2000);
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get("uid") || user.uid;

  const currentUserRef = doc(db, "users", user.uid);
  const profileUserRef = doc(db, "users", profileUserId);

  const [currentUserSnap, profileSnap] = await Promise.all([
    getDoc(currentUserRef),
    getDoc(profileUserRef)
  ]);

  if (!profileSnap.exists()) return;

  const profileData = profileSnap.data();
  const currentUserData = currentUserSnap.exists()
    ? currentUserSnap.data()
    : {};

  // USERNAME
  document.getElementById("loggedInUsername").innerText =
    "@" + profileData.username;

  // PROFILE IMAGE
  document.getElementById("profileImage").src =
    profileData.profile || "person.png";

  const isMyProfile = profileUserId === user.uid;

  if (!isMyProfile) {
    document.getElementById("editProfileBtn").style.display = "none";

    const spotBtn = document.createElement("button");
    spotBtn.className = "spot-button";

    const spottingIds = currentUserData.spottingIds || [];
    const isSpotting = spottingIds.includes(profileUserId);

    spotBtn.textContent = isSpotting ? "Unspot" : "Spot";

    spotBtn.onclick = async () => {
      let updatedIds = [...spottingIds];

      if (isSpotting) {
        updatedIds = updatedIds.filter(id => id !== profileUserId);

        await updateDoc(currentUserRef, {
          spottingIds: updatedIds,
          spotting: increment(-1),
        });

        await updateDoc(profileUserRef, {
          spotters: increment(-1),
        });

        spotBtn.textContent = "Spot";
      } else {
        updatedIds.push(profileUserId);

        await updateDoc(currentUserRef, {
          spottingIds: updatedIds,
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
    };

    document.querySelector(".profile-header").appendChild(spotBtn);
  }

  document.getElementById("spottersCount").innerText =
    profileData.spotters || 0;

  document.getElementById("spottingCount").innerText =
    profileData.spotting || 0;
});


