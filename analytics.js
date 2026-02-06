// analytics.js
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function logEvent(db, auth, eventName, meta = {}) {
  try {
    const user = auth.currentUser || null;

    await addDoc(collection(db, "events"), {
      event: eventName,
      userId: user ? user.uid : null,
      meta,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    // analytics must NEVER break UX
  }
}
