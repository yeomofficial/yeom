import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.firebasestorage.app",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get("uid") || localStorage.getItem("loggedInUserId");

  if (!profileUserId) return;

  const currentUserRef = doc(db, "users", user.uid);
  const profileUserRef = doc(db, "users", profileUserId);

  const currentUserSnap = await getDoc(currentUserRef);
  const profileSnap = await getDoc(profileUserRef);

  if (profileSnap.exists()) {
    const profileData = profileSnap.data();
    document.getElementById("loggedInUsername").innerText = "@" + profileData.username;

    const profileImg = document.getElementById("profileImage");
    profileImg.src = profileData.profile || "person.png";

    const isMyProfile = profileUserId === user.uid;

    if (!isMyProfile) {
      document.getElementById("editProfileBtn").style.display = "none";

      const spotBtn = document.createElement("button");
      spotBtn.id = "spotBtn";
      spotBtn.classList.add("spot-button");

      const isSpotting = currentUserSnap.data().spottingIds?.includes(profileUserId);
      spotBtn.textContent = isSpotting ? "Unspot" : "Spot";

      spotBtn.addEventListener("click", async () => {
        const currentData = (await getDoc(currentUserRef)).data();
        const profileData = (await getDoc(profileUserRef)).data();

        let updatedSpottingIds = currentData.spottingIds || [];

        if (updatedSpottingIds.includes(profileUserId)) {
          // Unspot
          updatedSpottingIds = updatedSpottingIds.filter(id => id !== profileUserId);
          await updateDoc(currentUserRef, {
            spottingIds: updatedSpottingIds,
            spotting: increment(-1)
          });
          await updateDoc(profileUserRef, {
            spotters: increment(-1)
          });
          spotBtn.textContent = "Spot";
        } else {
          // Spot
          updatedSpottingIds.push(profileUserId);
          await updateDoc(currentUserRef, {
            spottingIds: updatedSpottingIds,
            spotting: increment(1)
          });
          await updateDoc(profileUserRef, {
            spotters: increment(1)
          });
          spotBtn.textContent = "Unspot";

          await addDoc(collection(db, "notifications"), {
            userId: profileUserId,
            type: "new_spotter",
            message: "You got a new spotter!",
            timestamp: serverTimestamp(),
            seen: false
          });
        }

        // Refresh counts
        const updatedProfileSnap = await getDoc(profileUserRef);
        const updatedProfile = updatedProfileSnap.data();

        document.querySelector(".counts div:nth-child(2) strong").innerText = updatedProfile.spotters || 0;
        document.querySelector(".counts div:nth-child(3) strong").innerText = updatedProfile.spotting || 0;
      });

      document.querySelector(".profile-header").appendChild(spotBtn);
    }

    document.querySelector(".counts div:nth-child(2) strong").innerText = profileData.spotters || 0;
    document.querySelector(".counts div:nth-child(3) strong").innerText = profileData.spotting || 0;
  }
});
