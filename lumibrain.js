// ===============================
// LUMI BRAIN — YEOM AI CORE v2
// ===============================

// Main entry
export async function think(userMessage, wardrobe) {

  const message = userMessage.toLowerCase();

  if (isOutfitRequest(message)) {
    return generateOutfit(wardrobe, message);
  }

  if (message.includes("hello") || message.includes("hi")) {
    return "Hey 👋 I'm Lumi. Want an outfit idea today?";
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
    "suggest",
    "what should i wear"
  ];

  return keywords.some(word => msg.includes(word));
}


// ===============================
// OUTFIT GENERATION (SMART RULES)
// ===============================
function generateOutfit(wardrobe, message) {

  if (!wardrobe || wardrobe.length === 0) {
    return "Your wardrobe is empty 😭 Add some clothes first!";
  }

  const occasion = detectOccasion(message);

  // ⭐ FILTER BY OCCASION FIRST
  const filtered = wardrobe.filter(item =>
    matchOccasion(item, occasion)
  );

  const usableWardrobe =
    filtered.length >= 3 ? filtered : wardrobe;

  const tops = usableWardrobe.filter(i => i.category === "tops");
  const bottoms = usableWardrobe.filter(i => i.category === "bottoms");
  const shoes = usableWardrobe.filter(i => i.category === "shoes");

  if (!tops.length || !bottoms.length || !shoes.length) {
    return "I need at least a top, bottom, and shoes in your wardrobe 👀";
  }

  // ⭐ SMART MATCHING
  const top = pickRandom(tops);
  const bottom = matchBottom(top, bottoms);
  const shoe = matchShoes(top, shoes);

  return formatResponse(occasion, top, bottom, shoe);
}


// ===============================
// OCCASION DETECTOR
// ===============================
function detectOccasion(msg) {

  if (msg.includes("party")) return "party";
  if (msg.includes("date")) return "date";
  if (msg.includes("office") || msg.includes("formal")) return "formal";
  if (msg.includes("gym")) return "sport";

  return "casual";
}


// ===============================
// OCCASION MATCH LOGIC
// ===============================
function matchOccasion(item, occasion) {

  if (!item.style) return true;

  if (occasion === "formal")
    return item.style === "formal";

  if (occasion === "party")
    return item.style === "casual" || item.style === "formal";

  if (occasion === "sport")
    return item.style === "sport";

  return true;
}


// ===============================
// SMART MATCHERS
// ===============================
function matchBottom(top, bottoms) {

  // simple color harmony rule
  const neutral = ["black", "blue", "white"];

  const match = bottoms.find(
    b => neutral.includes(b.color)
  );

  return match || pickRandom(bottoms);
}

function matchShoes(top, shoes) {

  const match = shoes.find(
    s => s.style === top.style
  );

  return match || pickRandom(shoes);
}


// ===============================
// RESPONSE FORMAT (YEOM STYLE)
// ===============================
function formatResponse(occasion, top, bottom, shoe) {

  const title =
    occasion.charAt(0).toUpperCase() + occasion.slice(1);

  return `✨ ${title} Outfit Idea:

👕 ${top.name}
👖 ${bottom.name}
👟 ${shoe.name}

You already own these — smart choice 😉`;
}


// ===============================
// HELPERS
// ===============================
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
