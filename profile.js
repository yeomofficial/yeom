import { auth, db } from "./fbase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/* ---------- DOM READY ---------- */
window.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.replace("index.html");
      return;
    }

    /* ---------- PAGE CONTEXT ---------- */
    const params = new URLSearchParams(window.location.search);
    const profileUserId = params.get("uid") || user.uid;
    const isMyProfile = profileUserId === user.uid;

    const currentUserRef = doc(db, "users", user.uid);
    const profileUserRef = doc(db, "users", profileUserId);

    const [currentSnap, profileSnap] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(profileUserRef),
    ]);

    if (!profileSnap.exists()) return;

    const profileData = profileSnap.data();
    const currentUserData = currentSnap.exists() ? currentSnap.data() : {};

    /* ---------- PROFILE UI ---------- */
    document.getElementById("loggedInUsername").innerText =
      "@" + profileData.username;

    document.getElementById("profileImage").src =
      profileData.profile || "person.png";

    document.getElementById("spottersCount").innerText =
      profileData.spotters || 0;

    document.getElementById("spottingCount").innerText =
      profileData.spotting || 0;

    /* ---------- SPOT BUTTON ---------- */
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

    /* ---------- USER POSTS ---------- */
    const postsContainer = document.getElementById("userPosts");

    // default empty state
    postsContainer.innerHTML = `<p class="no-posts">No fits yet</p>`;

    const postsQuery = query(
      collection(db, "posts"),
      where("userId", "==", profileUserId),
      orderBy("createdAt", "desc")
    );

    const postsSnap = await getDocs(postsQuery);

    // THIS is the only correct post count
    const postCount = postsSnap.size;

    // optional: show post count in UI if you have an element
    const postCountEl = document.getElementById("postCount");
    if (postCountEl) postCountEl.innerText = postCount;

    if (postCount === 0) return;

    // remove empty state
    postsContainer.innerHTML = "";

    postsSnap.forEach((docSnap) => {
      const post = docSnap.data();
      if (!post.imageUrl) return;

      const postDiv = document.createElement("div");
      postDiv.className = "post-card";

      postDiv.innerHTML = `
        <img src="${post.imageUrl}" alt="Post">
      `;

      postsContainer.appendChild(postDiv);
    });
  });
});
