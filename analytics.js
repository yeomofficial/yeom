// analytics.js
import { db } from "./fbase.js";
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function logEvent(eventName, uid = null, meta = {}) {
  try {
    await addDoc(collection(db, "events"), {
      event: eventName,
      userId: uid,
      meta,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    // analytics must never break UX
  }
}
