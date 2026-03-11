import { auth } from "./fbase.js";

import {
  sendEmailVerification,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

/* Elements */

const continueBtn = document.getElementById("continue-btn");
const resendBtn = document.getElementById("resend-btn");
const message = document.getElementById("message");

/* Check user state */

onAuthStateChanged(auth, (user) => {

  if (!user) {
    location.replace("login.html");
  }

});
/* Continue Button */

continueBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) {
    message.textContent = "You are not logged in.";
    return;
  }

  await user.reload();

  if (user.emailVerified) {

    window.location.replace("info-gathering/info.html");

  } else {

    message.textContent = "Your email is not verified yet.";

  }

});

/* Resend Verification */

resendBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) {
    message.textContent = "Please login again.";
    return;
  }

  try {

    await sendEmailVerification(user);
    message.textContent = "Verification email sent again.";

  } catch (error) {

    message.textContent = "Failed to resend email.";

  }

});
