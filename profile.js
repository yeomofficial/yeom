onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get("uid") || user.uid;

  const currentUserRef = doc(db, "users", user.uid);
  const profileUserRef = doc(db, "users", profileUserId);

  const currentUserSnap = await getDoc(currentUserRef);
  const profileSnap = await getDoc(profileUserRef);

  if (!profileSnap.exists()) return;

  const profileData = profileSnap.data();

  document.getElementById("loggedInUsername").innerText =
    "@" + profileData.username;

  const profileImg = document.getElementById("profileImage");
  profileImg.src = profileData.profile || "person.png";

  const isMyProfile = profileUserId === user.uid;

  if (!isMyProfile) {
    document.getElementById("editProfileBtn").style.display = "none";

    const spotBtn = document.createElement("button");
    spotBtn.id = "spotBtn";
    spotBtn.classList.add("spot-button");

    const isSpotting =
      currentUserSnap.data()?.spottingIds?.includes(profileUserId);

    spotBtn.textContent = isSpotting ? "Unspot" : "Spot";

    spotBtn.addEventListener("click", async () => {
      const currentData = (await getDoc(currentUserRef)).data();
      let updatedSpottingIds = currentData.spottingIds || [];

      if (updatedSpottingIds.includes(profileUserId)) {
        updatedSpottingIds = updatedSpottingIds.filter(id => id !== profileUserId);

        await updateDoc(currentUserRef, {
          spottingIds: updatedSpottingIds,
          spotting: increment(-1),
        });

        await updateDoc(profileUserRef, {
          spotters: increment(-1),
        });

        spotBtn.textContent = "Spot";
      } else {
        updatedSpottingIds.push(profileUserId);

        await updateDoc(currentUserRef, {
          spottingIds: updatedSpottingIds,
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

      const updatedProfile = (await getDoc(profileUserRef)).data();

      document.querySelector(".counts div:nth-child(2) strong").innerText =
        updatedProfile.spotters || 0;
      document.querySelector(".counts div:nth-child(3) strong").innerText =
        updatedProfile.spotting || 0;
    });

    document.querySelector(".profile-header").appendChild(spotBtn);
  }

  document.querySelector(".counts div:nth-child(2) strong").innerText =
    profileData.spotters || 0;
  document.querySelector(".counts div:nth-child(3) strong").innerText =
    profileData.spotting || 0;
});
