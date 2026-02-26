// ===============================
// LUMI BRAIN — YEOM AI CORE
// ===============================

// Main entry (called by lumi.js)
export async function think(userMessage, wardrobe) {

  const message = userMessage.toLowerCase();

  // detect intent
  if (isOutfitRequest(message)) {
    return generateOutfit(wardrobe, message);
  }

  if (message.includes("hello") || message.includes("hi")) {
    return "Hey 👋 I'm Lumi. Want an outfit suggestion today?";
  }

  return "Tell me where you're going or what vibe you want ✨";
}


// ===============================
// INTENT DETECTION
// ===============================
function isOutfitRequest(msg) {

  const keywords = [
    "outfit",
    "wear",
    "dress",
    "what should i wear",
    "suggest"
  ];

  return keywords.some(word => msg.includes(word));
}


// ===============================
// OUTFIT GENERATION (RULE BASED AI)
// ===============================
function generateOutfit(wardrobe, message) {

  if (!wardrobe || wardrobe.length === 0) {
    return "Your wardrobe is empty 😭 Add some clothes first!";
  }

  // detect occasion
  const occasion = detectOccasion(message);

  // filter items
  const tops = wardrobe.filter(i => i.category === "tops");
  const bottoms = wardrobe.filter(i => i.category === "bottoms");
  const shoes = wardrobe.filter(i => i.category === "shoes");

  if (!tops.length || !bottoms.length || !shoes.length) {
    return "I need at least a top, bottom, and shoes in your wardrobe 👀";
  }

  // simple random selection (MVP intelligence)
  const top = pickRandom(tops);
  const bottom = pickRandom(bottoms);
  const shoe = pickRandom(shoes);

  return `✨ ${occasion} Outfit Idea:

👕 ${top.name}
👖 ${bottom.name}
👟 ${shoe.name}

You already own these — smart choice 😉`;
}


// ===============================
// OCCASION DETECTOR
// ===============================
function detectOccasion(msg) {

  if (msg.includes("party")) return "Party";
  if (msg.includes("date")) return "Date";
  if (msg.includes("office") || msg.includes("formal")) return "Formal";
  if (msg.includes("gym")) return "Sport";
  
  return "Casual";
}


// ===============================
// HELPERS
// ===============================
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
