// Import Firebase (only if you're using modules, otherwise skip this part and use the global firebase object)
// import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// import { getApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC1O-WVb95Z77o2JelptaZ8ljRPdNVDIeY",
  authDomain: "yeom-official.firebaseapp.com",
  projectId: "yeom-official",
  storageBucket: "yeom-official.firebasestorage.app",
  messagingSenderId: "285438640273",
  appId: "1:285438640273:web:7d91f4ddc24536a3c5ff30",
  measurementId: "G-EBXHHN5WFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- PART 1: Upload Icon Logic ---
const uploadIcon = document.querySelector('.upload-img');
const fileInput = document.getElementById('fileInput');

uploadIcon.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageUrl = e.target.result;
      localStorage.setItem('selectedImage', imageUrl);

      console.log('Image saved to localStorage:', imageUrl);
      window.location.href = 'upload.html'; // Redirect to upload page
    };

    reader.readAsDataURL(file);
  } else {
    console.error('No file selected.');
  }
});

// --- PART 2: Fetch and Display Posts ---
const postsContainer = document.getElementById('feed');

async function loadPosts() {
  const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(postsQuery);

  // Clear the feed container before adding posts
  postsContainer.innerHTML = '';

  // Add user-uploaded posts
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data(); // { section, imageUrl, username, timestamp }

    // Create Post Structure
    const postDiv = document.createElement('div');
    postDiv.className = 'post';

    // Image container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'post-img-container';

    const img = document.createElement('img');
    img.className = 'post-img';
    img.src = data.imageUrl;
    img.alt = `${data.username || "Unknown"}'s image`;

    // Username overlay
    const usernameLabel = document.createElement('label');
    usernameLabel.className = 'username-overlay';
    usernameLabel.textContent = data.username || "Unknown";

    imgContainer.appendChild(img);
    imgContainer.appendChild(usernameLabel);

    // Actions buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';

    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    likeBtn.innerHTML = `<img class="heart-img" src="like-btn.png" /> <span>Likes 0</span>`;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.innerHTML = `<img class="bookmark-img" src="save-btn.png" /> <span>Save</span>`;

    actionsDiv.appendChild(likeBtn);
    actionsDiv.appendChild(saveBtn);

    // Build the post
    postDiv.appendChild(imgContainer);
    postDiv.appendChild(actionsDiv);

    postsContainer.appendChild(postDiv); // Add user-uploaded posts
  });

  // Add the dummy post dynamically at the end
  addDummyPost();
}

// Function to add the dummy post
function addDummyPost() {
  const dummyPost = document.createElement('div');
  dummyPost.className = 'post';

  const dummyImgContainer = document.createElement('div');
  dummyImgContainer.className = 'post-img-container';

  const dummyImg = document.createElement('img');
  dummyImg.className = 'post-img';
  dummyImg.src = 'women-pintrest.png';
  dummyImg.alt = 'Dummy Image';

  const dummyUsernameLabel = document.createElement('label');
  dummyUsernameLabel.className = 'username-overlay';
  dummyUsernameLabel.textContent = 'Dummy User';

  dummyImgContainer.appendChild(dummyImg);
  dummyImgContainer.appendChild(dummyUsernameLabel);

  const dummyActionsDiv = document.createElement('div');
  dummyActionsDiv.className = 'actions';

  const dummyLikeBtn = document.createElement('button');
  dummyLikeBtn.className = 'like-btn';
  dummyLikeBtn.innerHTML = `<img class="heart-img" src="like-btn.png" /> <span>Likes 0</span>`;

  const dummySaveBtn = document.createElement('button');
  dummySaveBtn.className = 'save-btn';
  dummySaveBtn.innerHTML = `<img class="bookmark-img" src="save-btn.png" /> <span>Save</span>`;

  dummyActionsDiv.appendChild(dummyLikeBtn);
  dummyActionsDiv.appendChild(dummySaveBtn);

  dummyPost.appendChild(dummyImgContainer);
  dummyPost.appendChild(dummyActionsDiv);

  postsContainer.appendChild(dummyPost); // Add dummy post at the end
}

// Call the function to load posts
loadPosts();