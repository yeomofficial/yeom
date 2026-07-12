import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

export async function ensureUserProgress(db, uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Shouldn't normally hit this since signup creates the doc,
  // but acts as a safety net (e.g. auth account exists without a Firestore doc)
  if (!snap.exists()) {
    const fresh = {
      xp: 0,
      level: 1,
      streak: { count: 0, lastActiveDate: null },
      progress: {
        lessonCompletedToday: false,
        usedLumiToday: false,
        lastResetDate: todayStr
      },
      currentCourseId: null,
      currentLessonId: null,
      completedLessons: []
    };
    await setDoc(ref, fresh, { merge: true });
    return fresh;
  }

  const data = snap.data();

  // MIGRATION: old user doc missing new fields (pre-pivot accounts)
  if (!data.progress) {
    const patch = {
      xp: data.xp ?? 0,
      level: data.level ?? 1,
      streak: data.streak ?? { count: 0, lastActiveDate: null },
      progress: {
        lessonCompletedToday: false,
        usedLumiToday: false,
        lastResetDate: todayStr
      },
      currentCourseId: null,
      currentLessonId: null,
      completedLessons: []
    };
    await updateDoc(ref, patch);
    return { ...data, ...patch };
  }

  // Normal daily reset check for already-migrated users
  if (data.progress.lastResetDate !== todayStr) {
    const resetProgress = {
      lessonCompletedToday: false,
      usedLumiToday: false,
      lastResetDate: todayStr
    };
    await updateDoc(ref, { progress: resetProgress });
    data.progress = resetProgress;
  }

  return data;
}
