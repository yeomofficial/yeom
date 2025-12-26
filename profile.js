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

  // Username (this is correct and will now work)
  document.getElementById("loggedInUsername").innerText =
    "@" + profileData.username;

  // Profile image
  document.getElementById("profileImage").src =
    profileData.profile || "person.png";

  const isMyProfile = profileUserId === user.uid;

  if (!isMyProfile) {
    document.getElementById("editProfileBtn").style.display = "none";

    const spotBtn = document.createElement("button");
    spotBtn.id = "spotBtn";
    spotBtn.classList.add("spot-button");

    const spottingIds = currentUserData.spottingIds || [];
    const isSpotting = spottingIds.includes(profileUserId);

    spotBtn.textContent = isSpotting ? "Unspot" : "Spot";

    spotBtn.addEventListener("click", async () => {
      let updatedSpottingIds = [...spottingIds];

      if (updatedSpottingIds.includes(profileUserId)) {
        updatedSpottingIds = updatedSpottingIds.filter(
          id => id !== profileUserId
        );

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
