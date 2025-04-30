// Cloudinary configuration
const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dwauleaof/image/upload';  // Replace with your Cloud Name
const uploadPreset = 'yeom_unsigned';  // Replace with your upload preset name

// Firebase setup (for Firestore)
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js';

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

// Get HTML elements
const imagePreview = document.getElementById('image-preview');
const sectionDropdown = document.getElementById('section');
const uploadBtn = document.getElementById('upload-btn');
const uploadContainer = document.getElementById('upload-container');

// Progress bar setup
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

// Load selected image from localStorage
const selectedImageUrl = localStorage.getItem('selectedImage');
if (selectedImageUrl && imagePreview) {
  imagePreview.src = selectedImageUrl;
  imagePreview.style.display = 'block';
  imagePreview.style.width = 'auto';
  imagePreview.style.height = 'auto';
} else {
  console.error('No selected image found.');
  uploadContainer.innerHTML = '<p>No image selected. Please go back and select an image.</p>';
}

// Enable upload button only if a section is selected
sectionDropdown.addEventListener('change', () => {
  uploadBtn.disabled = !sectionDropdown.value;
});

// Handle upload button click
uploadBtn.addEventListener('click', async () => {
  const selectedSection = sectionDropdown.value;

  if (!selectedSection) {
    alert('Please select a section.');
    return;
  }

  if (!selectedImageUrl) {
    alert('No image to upload. Please go back and select an image.');
    return;
  }

  try {
    const file = dataURLtoFile(selectedImageUrl, 'upload.jpg');

    // Set the Cloudinary public ID to simulate folder structure
    const publicId = `${selectedSection}/image_${Date.now()}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('public_id', publicId);  // This sets the "folder" structure

    progressBar.style.display = 'block';
    progressPercentage.style.display = 'block';
    const startTime = Date.now();

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    const endTime = Date.now();
    console.log(`Upload completed in ${(endTime - startTime) / 1000} seconds.`);

    const downloadURL = data.secure_url;  // Cloudinary URL

    console.log('Download URL:', downloadURL);

    const username = localStorage.getItem('username');

    // Add post info to Firestore
    await addDoc(collection(db, 'posts'), {
      section: selectedSection,
      imageUrl: downloadURL,
      timestamp: serverTimestamp(),
      username: username,
    });

    console.log('Post added to Firestore.');

    localStorage.removeItem('selectedImage');
    window.location.href = 'home.html';
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Upload failed. Try again.');
    progressBar.style.display = 'none';
    progressPercentage.style.display = 'none';
  }
});

// Convert Data URL to File (helper function)
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
