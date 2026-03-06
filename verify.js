import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getAuth,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

/* Firebase Config */

const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.firebasestorage.app",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* Elements */

const continueBtn = document.getElementById("continue-btn");
const resendBtn = document.getElementById("resend-btn");
const message = document.getElementById("message");

/* Continue Button */

continueBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) {
    message.textContent = "You are not logged in.";
    return;
  }

  await user.reload();

  if (user.emailVerified) {

    location.replace("info.html");

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
