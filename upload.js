const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dwauleaof/image/upload';
const uploadPreset = 'yeom_unsigned';

import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';



// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.appspot.com",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// HTML elements
const imagePreview = document.getElementById('image-preview');
const sectionDropdown = document.getElementById('section');
const uploadBtn = document.getElementById('upload-btn');
const uploadContainer = document.getElementById('upload-container');
const messageBox = document.getElementById('message-box');

// Message function
function showMessage(text, type = "success") {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
  messageBox.style.display = 'block';
}

// Progress bar
const progressBar = document.createElement('progress');
progressBar.value = 0;
progressBar.max = 100;
progressBar.style.width = '100%';
progressBar.style.marginTop = '20px';
progressBar.style.display = 'none';
uploadContainer.appendChild(progressBar);

const progressPercentage = document.createElement('p');
progressPercentage.style.marginTop = '10px';
progressPercentage.style.display = 'none';
uploadContainer.appendChild(progressPercentage);

// Load image from localStorage
const selectedImageUrl = localStorage.getItem('selectedImage');
if (selectedImageUrl && imagePreview) {
  imagePreview.src = selectedImageUrl;
  imagePreview.style.display = 'block';
  imagePreview.style.width = 'auto';
  imagePreview.style.height = 'auto';
} else {
  uploadContainer.innerHTML = '<p>No image selected. Please go back and select an image.</p>';
}

// Enable/disable upload button
sectionDropdown.addEventListener('change', () => {
  uploadBtn.disabled = !sectionDropdown.value;
});

// Upload handler
uploadBtn.addEventListener('click', async () => {
  const selectedSection = sectionDropdown.value;

  if (!selectedSection) {
    showMessage('Please select a section.', 'error');
    return;
  }

  if (!selectedImageUrl) {
    showMessage('No image to upload. Please go back and select an image.', 'error');
    return;
  }

  try {
    const file = dataURLtoFile(selectedImageUrl, 'upload.jpg');
    const publicId = `${selectedSection}/image_${Date.now()}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('public_id', publicId);

    progressBar.style.display = 'block';
    progressPercentage.style.display = 'block';

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    const downloadURL = data.secure_url;

    let username = "anonymous";
    const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          username = userDoc.data().username || "anonymous";
         }
       }


    await addDoc(collection(db, 'posts'), {
     userId: user.uid,
     username: username,
     section: selectedSection,
     imageUrl: downloadURL,
     createdAt: serverTimestamp(),
    });

    localStorage.removeItem('selectedImage');
    showMessage('Upload successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1500);
  } catch (error) {
    showMessage('Upload failed. Please try again.', 'error');
    progressBar.style.display = 'none';
    progressPercentage.style.display = 'none';
  }
});

// Helper: convert data URL to file
function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

