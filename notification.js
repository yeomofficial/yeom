import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
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
const auth = getAuth();
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const notificationsContainer = document.getElementById("notificationsContainer");

  // Clear previous notifications
  notificationsContainer.innerHTML = "";

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", user.uid)
  );

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      notificationsContainer.innerHTML = "<p>No notifications yet.</p>";
      return;
    }

    querySnapshot.forEach(async (docSnap) => {
      const notif = docSnap.data();

      const div = document.createElement("div");
      div.className = `notification ${notif.seen ? "" : "unseen"}`;
      div.innerHTML = `
        <div>${notif.message}</div>
        <div class="notification-time">
          ${notif.timestamp ? new Date(notif.timestamp.toDate()).toLocaleString() : "Unknown time"}
        </div>
      `;
      notificationsContainer.appendChild(div);

      // Mark as seen
      if (!notif.seen) {
        try {
          await updateDoc(doc(db, "notifications", docSnap.id), {
            seen: true
          });
        } catch (error) {
          console.error("Error marking notification as seen:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    notificationsContainer.innerHTML = "<p>Error loading notifications. Please try again later.</p>";
  }
});