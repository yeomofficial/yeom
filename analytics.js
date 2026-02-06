// analytics.js
import { db } from "./firebase.js";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth } from "./firebase.js";

export async function logEvent(eventName, meta = {}) {
  try {
    const user = auth.currentUser;

    await addDoc(collection(db, "events"), {
      event: eventName,
      userId: user ? user.uid : null,
      meta,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    // analytics must NEVER break the app
    // fail silently
  }
}
