const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const coinText = document.querySelector("#coins");
const timerText = document.querySelector("#timer");
const heartsText = document.querySelector("#hearts");
const goalText = document.querySelector("#goal");
const mainMenu = document.querySelector("#mainMenu");
const shopButton = document.querySelector("#shopButton");
const shopPanel = document.querySelector("#shopPanel");
const closeShop = document.querySelector("#closeShop");
const shopCoins = document.querySelector("#shopCoins");
const profileButtons = document.querySelector("#profileButtons");
const profileNameInput = document.querySelector("#profileName");
const renameProfileButton = document.querySelector("#renameProfile");

const W = canvas.width;
const H = canvas.height;
const world = { width: 3350, gravity: 0.72, ground: 456 };
const portal = { offsetFromEnd: 118, y: 304, w: 78, h: 142 };
const keys = new Set();
const buttons = {
  left: document.querySelector("#left"),
  right: document.querySelector("#right"),
  jump: document.querySelector("#jump"),
  dash: document.querySelector("#dash"),
  shoot: document.querySelector("#shoot")
};

const worldNames = ["Grassy World", "Lava World", "Beach World", "City World"];
const objectTypes = ["book", "computer", "photo", "plant"];
const powerCosts = {
  zing: 15,
  penalty: 15,
  griddle: 15,
  liver: 23,
  lavaWalker: 23,
  home: 23,
  adventure: 50,
  jumpy: 50,
  liver2: 50,
  fan: 50
};
const equipPowers = new Set(["zing", "penalty", "griddle"]);
const togglePowers = new Set(["liver", "lavaWalker", "home", "adventure", "jumpy", "liver2", "fan"]);
const profileStorageKey = "timmys-trek-profiles";
const blankPowerState = () => ({
  zing: false,
  penalty: false,
  griddle: false,
  liver: false,
  lavaWalker: false,
  home: false,
  adventure: false,
  jumpy: false,
  liver2: false,
  fan: false
});

function level({
  worldIndex,
  name,
  width,
  platforms,
  coins,
  slugs = [],
  bees = [],
  springs = [],
  throwers = [],
  ladders = [],
  lava = [],
  cars = [],
  checkpoints = []
}) {
  return {
    worldIndex,
    name,
    theme: ["grass", "lava", "beach", "city"][worldIndex],
    goal: `${worldNames[worldIndex]} ${worldIndex + 1}-${levelsByWorldDraft[worldIndex].length + 1}`,
    width,
    platforms,
    coins,
    slugs,
    bees,
    springs,
    throwers,
    ladders,
    lava,
    cars,
    checkpoints
  };
}

const levelsByWorldDraft = [[], [], [], []];
const addLevel = (worldIndex, data) => levelsByWorldDraft[worldIndex].push(level({ worldIndex, ...data }));

addLevel(0, {
  name: "Forest Dash",
  width: 3350,
  platforms: [[0, 456, 680, 84], [780, 395, 290, 34], [1165, 337, 250, 34], [1510, 456, 600, 84], [1880, 365, 300, 34], [2265, 310, 245, 34], [2620, 456, 730, 84]],
  coins: [[250, 374], [430, 350], [858, 322], [995, 318], [1232, 260], [1352, 260], [1640, 376], [1805, 348], [1995, 290], [2342, 232], [2460, 232], [2945, 374]],
  slugs: [[590, 432, 520, 705], [1560, 432, 1510, 2050], [2725, 432, 2680, 3180]]
});
addLevel(0, {
  name: "Buzzing Canopy",
  width: 3650,
  platforms: [[0, 456, 560, 84], [650, 386, 260, 34], [1035, 320, 270, 34], [1430, 258, 245, 34], [1805, 456, 420, 84], [2285, 365, 295, 34], [2715, 295, 270, 34], [3150, 456, 500, 84]],
  coins: [[230, 374], [700, 306], [835, 306], [1100, 242], [1240, 242], [1492, 180], [1888, 374], [2110, 374], [2375, 286], [2515, 286], [2795, 214], [2925, 214], [3330, 374]],
  bees: [[760, 250, 610, 980], [1395, 190, 1260, 1725], [2395, 255, 2245, 2630], [2935, 205, 2705, 3095]],
  springs: [[520, 434, 18], [1715, 434, 19], [2608, 434, 18]]
});
addLevel(0, {
  name: "Object Outpost",
  width: 3850,
  platforms: [[0, 456, 640, 84], [730, 382, 285, 34], [1110, 322, 280, 34], [1515, 456, 520, 84], [2055, 360, 260, 34], [2440, 296, 300, 34], [2865, 376, 260, 34], [3260, 456, 590, 84]],
  coins: [[240, 374], [450, 374], [790, 304], [940, 304], [1188, 244], [1324, 244], [1635, 374], [1880, 374], [2125, 286], [2520, 218], [2670, 218], [2950, 302], [3450, 374]],
  springs: [[640, 434, 17], [2350, 434, 18]],
  throwers: [[850, 320], [1655, 394], [2558, 234], [3375, 394]]
});

addLevel(1, {
  name: "Molten Gate",
  width: 3400,
  platforms: [[0, 456, 500, 84], [600, 388, 260, 34], [950, 315, 250, 34], [1300, 456, 420, 84], [1830, 350, 260, 34], [2200, 280, 270, 34], [2810, 456, 590, 84]],
  coins: [[180, 374], [675, 310], [1025, 238], [1125, 238], [1420, 374], [1905, 274], [2290, 205], [2390, 205], [3000, 374]],
  lava: [[510, 472, 720, 58], [1735, 472, 440, 58], [2485, 472, 300, 58]],
  ladders: [[1195, 314, 152], [2468, 280, 186]],
  slugs: [[1380, 432, 1300, 1700]]
});
addLevel(1, {
  name: "Ladder Furnace",
  width: 3600,
  platforms: [[0, 456, 390, 84], [520, 395, 230, 34], [900, 325, 235, 34], [1290, 255, 260, 34], [1680, 456, 430, 84], [2230, 360, 260, 34], [2600, 300, 250, 34], [3120, 456, 480, 84]],
  coins: [[160, 374], [580, 318], [975, 248], [1360, 178], [1810, 374], [2305, 282], [2690, 222], [3225, 374]],
  lava: [[395, 472, 500, 58], [1560, 472, 115, 58], [2120, 472, 520, 58], [2850, 472, 260, 58]],
  ladders: [[750, 324, 132], [1548, 256, 200], [2582, 300, 156]],
  springs: [[1150, 434, 17]]
});
addLevel(1, {
  name: "Spike Heat",
  width: 3850,
  platforms: [[0, 456, 460, 84], [575, 370, 230, 34], [930, 300, 240, 34], [1340, 456, 430, 84], [1820, 385, 260, 34], [2225, 314, 260, 34], [2680, 250, 255, 34], [3260, 456, 590, 84]],
  coins: [[210, 374], [640, 292], [1015, 224], [1470, 374], [1900, 306], [2300, 238], [2770, 174], [3440, 374]],
  lava: [[465, 472, 860, 58], [1770, 472, 440, 58], [2960, 472, 290, 58]],
  ladders: [[805, 300, 156], [2935, 250, 206]],
  bees: [[1030, 210, 880, 1210], [2350, 230, 2200, 2600]],
  slugs: [[3380, 432, 3280, 3760]]
});

addLevel(2, {
  name: "Sandy Start",
  width: 3350,
  platforms: [[0, 456, 620, 84], [720, 395, 270, 34], [1080, 340, 250, 34], [1500, 456, 530, 84], [2150, 370, 280, 34], [2600, 456, 750, 84]],
  coins: [[250, 374], [760, 318], [925, 318], [1160, 264], [1625, 374], [2240, 294], [2760, 374], [3050, 374]],
  slugs: [[540, 432, 450, 620], [1710, 432, 1530, 1980]],
  bees: [[1190, 250, 1040, 1390]]
});
addLevel(2, {
  name: "Tide Buzz",
  width: 3600,
  platforms: [[0, 456, 520, 84], [650, 390, 260, 34], [1030, 315, 270, 34], [1450, 456, 430, 84], [1950, 360, 290, 34], [2400, 295, 260, 34], [3050, 456, 550, 84]],
  coins: [[180, 374], [720, 312], [1110, 238], [1230, 238], [1575, 374], [2030, 284], [2490, 218], [3190, 374]],
  bees: [[760, 260, 620, 980], [2050, 245, 1900, 2280], [2530, 190, 2400, 2710]],
  slugs: [[3180, 432, 3070, 3570]],
  springs: [[1370, 434, 18]]
});
addLevel(2, {
  name: "Shell Shore",
  width: 3820,
  platforms: [[0, 456, 500, 84], [630, 380, 250, 34], [1040, 325, 260, 34], [1430, 270, 260, 34], [1880, 456, 470, 84], [2490, 365, 280, 34], [2925, 315, 260, 34], [3320, 456, 500, 84]],
  coins: [[220, 374], [700, 302], [1125, 248], [1510, 194], [1990, 374], [2575, 288], [3015, 238], [3490, 374]],
  bees: [[710, 250, 590, 920], [1540, 190, 1380, 1730], [3020, 218, 2880, 3210]],
  slugs: [[2100, 432, 1900, 2320], [3440, 432, 3340, 3780]]
});

addLevel(3, {
  name: "Downtown Dash",
  width: 3450,
  platforms: [[0, 456, 700, 84], [850, 390, 270, 34], [1250, 456, 500, 84], [1880, 370, 280, 34], [2350, 456, 430, 84], [2960, 456, 490, 84]],
  coins: [[250, 374], [520, 374], [920, 312], [1360, 374], [1650, 374], [1960, 292], [2480, 374], [3130, 374]],
  cars: [[760, 424, 720, 1200], [1775, 424, 1740, 2280]],
  throwers: [[990, 328], [2525, 394]]
});
addLevel(3, {
  name: "Bridge Traffic",
  width: 3700,
  platforms: [[0, 456, 540, 84], [700, 380, 290, 34], [1120, 315, 280, 34], [1520, 456, 420, 84], [2050, 350, 300, 34], [2500, 456, 480, 84], [3160, 456, 540, 84]],
  coins: [[180, 374], [770, 302], [1200, 238], [1640, 374], [2135, 272], [2640, 374], [3320, 374]],
  cars: [[560, 424, 520, 1440], [2390, 424, 2360, 3100]],
  throwers: [[1250, 253], [2145, 288], [3300, 394]],
  springs: [[1450, 434, 17]]
});
addLevel(3, {
  name: "Skyline Sprint",
  width: 3900,
  platforms: [[0, 456, 560, 84], [670, 390, 270, 34], [1050, 320, 270, 34], [1450, 250, 260, 34], [1890, 456, 440, 84], [2480, 360, 280, 34], [2900, 300, 260, 34], [3400, 456, 500, 84]],
  coins: [[200, 374], [730, 312], [1130, 244], [1535, 174], [2020, 374], [2570, 282], [2990, 222], [3560, 374]],
  cars: [[570, 424, 540, 1350], [2320, 424, 2260, 3220]],
  throwers: [[1130, 258], [1535, 188], [2580, 298], [3520, 394]]
});

const worlds = levelsByWorldDraft;
let levels = worlds[0];
let selectedWorld = 0;
let camera = 0;
let then = performance.now();
let elapsed = 0;
let won = false;
let gameOver = false;
let menuOpen = true;
let levelIndex = 0;
let levelTitleTimer = 0;
let particles = [];
let platforms = [];
let coins = [];
let slugs = [];
let bees = [];
let springs = [];
let throwers = [];
let ladders = [];
let lava = [];
let cars = [];
let checkpoints = [];
let objects = [];
let lasers = [];
let footballs = [];
let fireballs = [];
let chunks = [];
let activeCheckpoint = { x: 80, y: 260 };
let coinWallet = 0;
let equippedPower = null;
let liverEquipped = false;
let lavaWalkerEquipped = false;
let homeEquipped = false;
let adventureEquipped = false;
let jumpyEquipped = false;
let liver2Equipped = false;
let fanEquipped = false;
let activeProfile = 0;
let profiles = loadProfiles();
let profileReady = false;
const powers = blankPowerState();

const player = {
  x: 80,
  y: 260,
  w: 38,
  h: 58,
  vx: 0,
  vy: 0,
  dir: 1,
  onGround: false,
  climbing: false,
  dashLeft: 0,
  laserCooldown: 0,
  invincible: 0,
  lives: 3,
  maxLives: 3,
  spawnX: 80,
  spawnY: 260
};

function loadProfiles() {
  const fallback = [1, 2, 3].map((n) => ({
    name: `Profile ${n}`,
    coins: 0,
    powers: blankPowerState(),
    equippedPower: null,
    liverEquipped: false,
    lavaWalkerEquipped: false,
    homeEquipped: false,
    adventureEquipped: false,
    jumpyEquipped: false,
    liver2Equipped: false,
    fanEquipped: false
  }));
  try {
    const saved = JSON.parse(localStorage.getItem(profileStorageKey));
    if (!Array.isArray(saved)) return fallback;
    return fallback.map((profile, index) => ({
      ...profile,
      ...(saved[index] || {}),
      powers: { ...blankPowerState(), ...(saved[index]?.powers || {}) }
    }));
  } catch {
    return fallback;
  }
}

function saveProfiles() {
  localStorage.setItem(profileStorageKey, JSON.stringify(profiles));
}

function saveActiveProfile() {
  profiles[activeProfile] = {
    ...profiles[activeProfile],
    coins: coinWallet,
    powers: { ...powers },
    equippedPower,
    liverEquipped,
    lavaWalkerEquipped,
    homeEquipped,
    adventureEquipped,
    jumpyEquipped,
    liver2Equipped,
    fanEquipped
  };
  saveProfiles();
}

function loadActiveProfile(index) {
  if (profileReady) saveActiveProfile();
  activeProfile = index;
  const profile = profiles[activeProfile];
  coinWallet = profile.coins || 0;
  Object.assign(powers, blankPowerState(), profile.powers || {});
  equippedPower = profile.equippedPower || null;
  liverEquipped = profile.liverEquipped ?? !!powers.liver;
  lavaWalkerEquipped = profile.lavaWalkerEquipped ?? !!powers.lavaWalker;
  homeEquipped = !!profile.homeEquipped;
  adventureEquipped = !!profile.adventureEquipped;
  jumpyEquipped = !!profile.jumpyEquipped;
  liver2Equipped = !!profile.liver2Equipped;
  fanEquipped = !!profile.fanEquipped;
  refreshMaxLives();
  player.lives = Math.min(player.lives || player.maxLives, player.maxLives);
  updateHearts();
  updateCoinText();
  updateShop();
  renderProfiles();
  profileReady = true;
}

function renderProfiles() {
  profileButtons.querySelectorAll("button").forEach((button) => {
    const index = Number(button.dataset.profile);
    button.textContent = profiles[index].name;
    button.classList.toggle("is-active", index === activeProfile);
  });
  profileNameInput.value = profiles[activeProfile].name;
}

function refreshMaxLives() {
  player.maxLives = liver2Equipped ? 12 : (liverEquipped ? 6 : 3);
  player.lives = Math.min(player.lives || player.maxLives, player.maxLives);
}

function renameActiveProfile() {
  const name = profileNameInput.value.trim();
  if (!name) return;
  profiles[activeProfile].name = name.slice(0, 16);
  saveActiveProfile();
  renderProfiles();
}

function normalizeLevel(raw) {
  const platforms = raw.platforms.map(([x, y, w, h]) => ({ x, y, w, h }));
  const checkpointXs = raw.checkpoints.length ? raw.checkpoints : [Math.floor(raw.width * 0.38), Math.floor(raw.width * 0.68)];
  return {
    ...raw,
    platforms,
    coins: raw.coins.map(([x, y]) => ({ x, y, r: 18, taken: false })),
    slugs: raw.slugs.map(([x, y, min, max], i) => ({ x, y, w: 54, h: 24, vx: 0.72 + i * 0.12, min, max, dead: false })),
    bees: raw.bees.map(([x, y, min, max], i) => ({ x, y, w: 50, h: 34, baseY: y, vx: 1.25 + i * 0.12, min, max, phase: i * 1.7, dead: false })),
    springs: raw.springs.map(([x, y, power]) => ({ x, y, w: 46, h: 22, power, squish: 0 })),
    throwers: raw.throwers.map(([x, y], i) => ({ x, y, w: 42, h: 62, cooldown: 45 + i * 28, baseCooldown: 116, dead: false })),
    ladders: raw.ladders.map(([x, y, h]) => ({ x, y, w: 38, h })),
    lava: raw.lava.map(([x, y, w, h]) => ({ x, y, w, h })),
    cars: raw.cars.map(([x, y, min, max], i) => ({ x, y, w: 76, h: 32, min, max, vx: 2.6 + i * 0.35, dead: false })),
    checkpoints: checkpointXs.map((x) => {
      const platform = platforms
        .filter((item) => x >= item.x + 16 && x <= item.x + item.w - 16)
        .sort((a, b) => b.y - a.y)[0] || platforms[0];
      return { x, y: platform.y - 54, w: 42, h: 54, active: false };
    })
  };
}

function resetGame() {
  levelIndex = 0;
  elapsed = 0;
  refreshMaxLives();
  player.lives = player.maxLives;
  updateHearts();
  loadLevel();
}

function startGame(worldIndex) {
  selectedWorld = worldIndex;
  levels = worlds[selectedWorld];
  menuOpen = false;
  mainMenu.classList.add("is-hidden");
  resetGame();
}

function loadLevel() {
  const raw = levels[levelIndex];
  const data = normalizeLevel(raw);
  world.width = data.width;
  platforms = data.platforms;
  coins = data.coins;
  slugs = data.slugs;
  bees = data.bees;
  springs = data.springs;
  throwers = data.throwers;
  ladders = data.ladders;
  lava = data.lava;
  cars = data.cars;
  checkpoints = data.checkpoints;
  objects = [];
  lasers = [];
  footballs = [];
  fireballs = [];
  chunks = [];
  player.x = player.spawnX;
  player.y = player.spawnY;
  player.vx = 0;
  player.vy = 0;
  player.dir = 1;
  player.climbing = false;
  player.dashLeft = 0;
  player.laserCooldown = 0;
  player.invincible = 0;
  activeCheckpoint = { x: player.spawnX, y: player.spawnY };
  camera = 0;
  particles = [];
  won = false;
  gameOver = false;
  levelTitleTimer = 130;
  goalText.textContent = `${data.name} ${levelIndex + 1}/3`;
  updateCoinText();
  updateShop();
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function spawnSmoke(x, y, color = "#e5e5dc") {
  for (let i = 0; i < 18; i++) {
    particles.push({ x, y, color, vx: (Math.random() - 0.5) * 3.2, vy: -Math.random() * 2.7 - 0.6, life: 32 + Math.random() * 20, size: 8 + Math.random() * 14 });
  }
}

function spawnExplosion(x, y) {
  spawnSmoke(x, y, "#ffcf45");
  spawnSmoke(x, y, "#ff5b21");
}

function updateHearts() {
  heartsText.innerHTML = "";
  for (let i = 0; i < player.maxLives; i++) {
    const heart = document.createElement("span");
    heart.className = `heart${i >= player.lives ? " empty" : ""}`;
    heartsText.appendChild(heart);
  }
  heartsText.setAttribute("aria-label", `${player.lives} hearts`);
}

function hurtPlayer() {
  if (player.invincible > 0 || won || gameOver) return;
  player.lives = Math.max(0, player.lives - 1);
  player.invincible = 90;
  player.vx = -player.dir * 7.5;
  player.vy = -6;
  player.climbing = false;
  spawnSmoke(player.x + player.w / 2, player.y + 26);
  updateHearts();
  if (player.lives <= 0) {
    gameOver = true;
    goalText.textContent = "Try again";
    spawnSmoke(player.x + player.w / 2, player.y + 18);
  }
}

function respawnPlayer() {
  player.x = activeCheckpoint.x;
  player.y = activeCheckpoint.y;
  player.vx = 0;
  player.vy = 0;
  player.climbing = false;
  camera = Math.max(0, Math.min(world.width - W, player.x - W * 0.42));
  spawnSmoke(player.x + player.w / 2, player.y + player.h / 2, "#fff4a8");
}

function shootLaser() {
  if (player.laserCooldown > 0 || won || gameOver) return;
  player.laserCooldown = equippedPower === "penalty" ? 42 : 20;
  if (equippedPower === "penalty") {
    footballs.push({ x: player.x + player.w / 2, y: player.y + 30, w: 22, h: 22, vx: player.dir * 10, vy: -1.2, life: 95, returning: false });
    return;
  }
  if (equippedPower === "griddle") {
    fireballs.push({ x: player.x + player.w / 2 + player.dir * 22, y: player.y + 32, w: 24, h: 18, vx: player.dir * 11, life: 70 });
    return;
  }
  lasers.push({ x: player.x + player.w / 2 + player.dir * 24, y: player.y + 35, w: 34, h: 6, vx: player.dir * 13, life: 40 });
}

function teleportToNearestPlatform() {
  const ahead = platforms
    .filter((platform) => platform.x > player.x + 60)
    .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  const target = ahead || platforms.slice().sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  if (!target) return;
  spawnSmoke(player.x + player.w / 2, player.y + player.h / 2, "#d8f5ff");
  player.x = Math.min(target.x + target.w / 2, world.width - player.w - 28);
  player.y = target.y - player.h;
  player.vx = 0;
  player.vy = 0;
  spawnSmoke(player.x + player.w / 2, player.y + player.h / 2, "#d8f5ff");
}

function updateCoinText() {
  coinText.textContent = `${coins.filter((coin) => coin.taken).length} / ${coins.length} | ${coinWallet}`;
}

function updateShop() {
  shopCoins.textContent = `Coins: ${coinWallet}`;
  document.querySelectorAll(".shop-item").forEach((button) => {
    const power = button.dataset.power;
    const cost = powerCosts[power];
    const toggled =
      (power === "liver" && liverEquipped) ||
      (power === "lavaWalker" && lavaWalkerEquipped) ||
      (power === "home" && homeEquipped) ||
      (power === "adventure" && adventureEquipped) ||
      (power === "jumpy" && jumpyEquipped) ||
      (power === "liver2" && liver2Equipped) ||
      (power === "fan" && fanEquipped);
    button.classList.toggle("is-owned", powers[power]);
    button.classList.toggle("is-equipped", equippedPower === power || toggled || (!equipPowers.has(power) && !togglePowers.has(power) && powers[power]));
    button.disabled = !powers[power] && coinWallet < cost;
    button.querySelector("b").textContent = powers[power]
      ? (equipPowers.has(power) ? (equippedPower === power ? "Equipped" : "Equip") : (togglePowers.has(power) ? (toggled ? "Remove" : "Equip") : "Owned"))
      : `${cost} coins`;
  });
}

function buyOrEquipPower(power) {
  const wasOwned = powers[power];
  if (!powers[power]) {
    const cost = powerCosts[power];
    if (coinWallet < cost) return;
    coinWallet -= cost;
    powers[power] = true;
    if (power === "liver") {
      liverEquipped = true;
      refreshMaxLives();
      player.lives = Math.min(player.maxLives, player.lives + 3);
      updateHearts();
    }
    if (power === "lavaWalker") lavaWalkerEquipped = true;
  }
  if (power === "liver" && wasOwned) {
    liverEquipped = !liverEquipped;
    refreshMaxLives();
    updateHearts();
  }
  if (power === "lavaWalker" && wasOwned) lavaWalkerEquipped = !lavaWalkerEquipped;
  if (power === "home") homeEquipped = wasOwned ? !homeEquipped : true;
  if (power === "adventure") adventureEquipped = wasOwned ? !adventureEquipped : true;
  if (power === "jumpy") jumpyEquipped = wasOwned ? !jumpyEquipped : true;
  if (power === "liver2") {
    liver2Equipped = wasOwned ? !liver2Equipped : true;
    const oldMax = player.maxLives;
    refreshMaxLives();
    if (liver2Equipped) player.lives = Math.min(player.maxLives, player.lives + Math.max(0, player.maxLives - oldMax));
    updateHearts();
  }
  if (power === "fan") fanEquipped = wasOwned ? !fanEquipped : true;
  if (equipPowers.has(power)) equippedPower = power;
  updateCoinText();
  updateShop();
  saveActiveProfile();
}

function quickDash() {
  if (won || gameOver || menuOpen) return;
  player.dashLeft = 24;
  player.vx = player.dir * 18;
  player.climbing = false;
  spawnSmoke(player.x + player.w / 2, player.y + player.h - 8, "#bff7ff");
}

function defeatThrower(thrower) {
  thrower.dead = true;
  spawnSmoke(thrower.x + thrower.w / 2, thrower.y + thrower.h / 2);
}

function throwObject(thrower) {
  const dir = player.x + player.w / 2 < thrower.x + thrower.w / 2 ? -1 : 1;
  objects.push({ type: objectTypes[Math.floor(Math.random() * objectTypes.length)], x: thrower.x + thrower.w / 2, y: thrower.y + 18, w: 28, h: 24, vx: dir * (3.8 + Math.random() * 1.5), vy: -5.6 - Math.random() * 2.1, life: 230 });
}

function press(action, down) {
  if (down) {
    keys.add(action);
    buttons[action]?.classList.add("is-held");
  } else {
    keys.delete(action);
    buttons[action]?.classList.remove("is-held");
  }
}

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey && ["u", "U"].includes(event.key)) {
    event.preventDefault();
    quickDash();
    return;
  }
  if (["ArrowLeft", "a", "A"].includes(event.key)) press("left", true);
  if (["ArrowRight", "d", "D"].includes(event.key)) press("right", true);
  if (["ArrowUp", "w", "W", " "].includes(event.key)) {
    event.preventDefault();
    press("jump", true);
  }
  if (["Shift", "x", "X"].includes(event.key)) press("dash", true);
  if (["f", "F", "Control"].includes(event.key)) {
    event.preventDefault();
    press("shoot", true);
  }
});

window.addEventListener("keyup", (event) => {
  if (["ArrowLeft", "a", "A"].includes(event.key)) press("left", false);
  if (["ArrowRight", "d", "D"].includes(event.key)) press("right", false);
  if (["ArrowUp", "w", "W", " "].includes(event.key)) press("jump", false);
  if (["Shift", "x", "X"].includes(event.key)) press("dash", false);
  if (["f", "F", "Control"].includes(event.key)) press("shoot", false);
});

Object.entries(buttons).forEach(([action, button]) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    press(action, true);
  });
  button.addEventListener("pointerup", () => press(action, false));
  button.addEventListener("pointercancel", () => press(action, false));
  button.addEventListener("pointerleave", () => press(action, false));
});

document.querySelector("#restart").addEventListener("click", resetGame);
document.querySelector("#skipLevel").addEventListener("click", skipLevel);
profileButtons.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => loadActiveProfile(Number(button.dataset.profile)));
});
renameProfileButton.addEventListener("click", renameActiveProfile);
profileNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") renameActiveProfile();
});
shopButton.addEventListener("click", () => {
  shopPanel.classList.remove("is-hidden");
  updateShop();
});
closeShop.addEventListener("click", () => shopPanel.classList.add("is-hidden"));
document.querySelectorAll(".shop-item").forEach((button) => {
  button.addEventListener("click", () => buyOrEquipPower(button.dataset.power));
});
document.querySelectorAll(".world-card").forEach((button) => {
  button.addEventListener("click", () => startGame(Number(button.dataset.world)));
});

function skipLevel() {
  if (gameOver) return;
  if (menuOpen) startGame(0);
  if (levelIndex < levels.length - 1) {
    levelIndex++;
    loadLevel();
    return;
  }
  won = true;
  goalText.textContent = "Finished!";
  spawnSmoke(player.x + player.w / 2, player.y + 16);
}

function update(dt) {
  if (menuOpen) return;
  if (!won && !gameOver) elapsed += dt;
  if (gameOver) {
    updateParticles();
    return;
  }
  if (levelTitleTimer > 0) levelTitleTimer--;

  const left = keys.has("left");
  const right = keys.has("right");
  const jump = keys.has("jump");
  const dash = keys.has("dash");
  const shoot = keys.has("shoot");
  const speed = adventureEquipped ? (dash ? 13 : 9.5) : (dash ? 6.3 : 3.9);
  const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };
  const ladder = ladders.find((item) => rectsOverlap(playerBox, item));

  if (ladder && (jump || keys.has("left") || keys.has("right"))) {
    player.climbing = true;
  }
  if (!ladder) player.climbing = false;

  if (left) {
    player.vx = Math.max(player.vx - 0.9, -speed);
    player.dir = -1;
  }
  if (right) {
    player.vx = Math.min(player.vx + 0.9, speed);
    player.dir = 1;
  }
  if (!left && !right) player.vx *= 0.76;
  if (dash && player.dashLeft <= 0) {
    player.dashLeft = 18;
    player.vx = player.dir * 9.6;
  }
  if (player.dashLeft > 0) player.dashLeft--;
  if (player.laserCooldown > 0) player.laserCooldown--;
  if (shoot) shootLaser();

  if (powers.home && homeEquipped) {
    const flySpeed = dash ? 7.2 : 4.8;
    player.climbing = false;
    if (jump) player.vy = Math.max(player.vy - 0.9, -flySpeed);
    else if (dash) player.vy = Math.min(player.vy + 0.7, flySpeed);
    else player.vy *= 0.72;
    player.x += player.vx;
    player.y += player.vy;
  } else if (player.climbing) {
    player.vy = jump ? -3.6 : 1.6;
    player.x += player.vx * 0.7;
    player.y += player.vy;
  } else {
    if (jump && player.onGround) {
      player.vy = jumpyEquipped ? -20 : -13.5;
      player.onGround = false;
    }
    player.vy += world.gravity;
    if (equippedPower === "zing" && powers.zing && jump && player.vy > 1.8) player.vy = 1.8;
    player.x += player.vx;
    player.y += player.vy;
  }

  player.x = Math.max(16, Math.min(world.width - player.w - 26, player.x));
  player.y = Math.max(20, player.y);
  player.onGround = false;

  for (const platform of platforms) {
    const wasAbove = player.y + player.h - player.vy <= platform.y + 4;
    if (rectsOverlap(player, platform) && player.vy >= 0 && wasAbove) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  for (const spring of springs) {
    if (spring.squish > 0) spring.squish--;
    const springTop = { x: spring.x, y: spring.y - 6, w: spring.w, h: spring.h + 8 };
    const wasAbove = player.y + player.h - player.vy <= spring.y + 4;
    if (rectsOverlap(player, springTop) && player.vy >= 0 && wasAbove) {
      player.y = spring.y - player.h;
      player.vy = -spring.power;
      player.climbing = false;
      spring.squish = 10;
      spawnSmoke(spring.x + spring.w / 2, spring.y);
    }
  }

  if (player.y > H + 140) {
    hurtPlayer();
    if (!gameOver) {
      respawnPlayer();
    }
  }

  for (const hazard of lava) {
    if (rectsOverlap(player, hazard)) {
      if (lavaWalkerEquipped || (powers.home && homeEquipped)) {
        player.y = hazard.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else {
        hurtPlayer();
        if (!gameOver) respawnPlayer();
      }
    }
  }

  for (const checkpoint of checkpoints) {
    if (!checkpoint.active && rectsOverlap(player, checkpoint)) {
      checkpoints.forEach((item) => item.active = false);
      checkpoint.active = true;
      activeCheckpoint = { x: checkpoint.x - player.w / 2, y: checkpoint.y + checkpoint.h - player.h };
      goalText.textContent = "Checkpoint!";
      spawnSmoke(checkpoint.x + checkpoint.w / 2, checkpoint.y + 16, "#ffe65c");
    }
  }

  for (const coin of coins) {
    if (!coin.taken) {
      const dx = player.x + player.w / 2 - coin.x;
      const dy = player.y + player.h / 2 - coin.y;
      if (Math.hypot(dx, dy) < coin.r + 24) {
        coin.taken = true;
        coinWallet++;
        updateShop();
        saveActiveProfile();
        spawnSmoke(coin.x, coin.y, "#fff1aa");
      }
    }
  }

  updateStompables(slugs, 8, -8.8);
  updateBees();
  updateThrowers();
  updateCars();
  updateObjectsAndLasers();
  if (fanEquipped) applyFanWind();

  if (player.invincible > 0) player.invincible--;
  const portalX = world.width - portal.offsetFromEnd;
  const playerCenterX = player.x + player.w / 2;
  const playerCenterY = player.y + player.h / 2;
  const reachedPortal = playerCenterX > portalX - portal.w / 2 && Math.abs(playerCenterY - portal.y) < portal.h / 2;
  if (reachedPortal && !won) {
    if (levelIndex < levels.length - 1) {
      levelIndex++;
      spawnSmoke(player.x + player.w / 2, player.y + 16);
      loadLevel();
      return;
    }
    won = true;
    goalText.textContent = "Finished!";
    spawnSmoke(player.x + player.w / 2, player.y + 16);
  }

  updateParticles();
  camera = Math.max(0, Math.min(world.width - W, player.x - W * 0.42));
  updateCoinText();
  const seconds = Math.floor(elapsed / 1000);
  timerText.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateStompables(items, allowance, bounce) {
  for (const item of items) {
    if (item.dead) continue;
    item.x += item.vx;
    if (item.x < item.min || item.x + item.w > item.max) item.vx *= -1;
    if (rectsOverlap(player, item)) {
      if (adventureEquipped) {
        item.dead = true;
        spawnExplosion(item.x + item.w / 2, item.y + item.h / 2);
        continue;
      }
      const stomping = player.vy > 0 && player.y + player.h - player.vy <= item.y + allowance;
      if (stomping) {
        item.dead = true;
        player.vy = bounce;
        spawnSmoke(item.x + item.w / 2, item.y + item.h / 2);
      } else {
        hurtPlayer();
      }
    }
  }
}

function updateBees() {
  for (const bee of bees) {
    if (bee.dead) continue;
    bee.x += bee.vx;
    if (bee.x < bee.min || bee.x + bee.w > bee.max) bee.vx *= -1;
    bee.y = bee.baseY + Math.sin(elapsed / 240 + bee.phase) * 22;
    const hitbox = { x: bee.x, y: bee.y - 12, w: bee.w, h: bee.h + 14 };
    if (rectsOverlap(player, hitbox)) {
      if (adventureEquipped) {
        bee.dead = true;
        spawnExplosion(bee.x + bee.w / 2, bee.y + bee.h / 2);
        continue;
      }
      const previousBottom = player.y + player.h - player.vy;
      if (player.vy > 0 && previousBottom <= bee.y + 18) {
        bee.dead = true;
        player.vy = -9.8;
        spawnSmoke(bee.x + bee.w / 2, bee.y + bee.h / 2);
      } else {
        hurtPlayer();
      }
    }
  }
}

function updateThrowers() {
  for (const thrower of throwers) {
    if (thrower.dead) continue;
    thrower.cooldown--;
    if (thrower.cooldown <= 0) {
      throwObject(thrower);
      thrower.cooldown = thrower.baseCooldown + Math.floor(Math.random() * 45);
    }
    if (rectsOverlap(player, thrower)) {
      if (adventureEquipped) {
        defeatThrower(thrower);
        spawnExplosion(thrower.x + thrower.w / 2, thrower.y + thrower.h / 2);
        continue;
      }
      const previousBottom = player.y + player.h - player.vy;
      if (player.vy > 0 && previousBottom <= thrower.y + 18) {
        defeatThrower(thrower);
        player.vy = -9.2;
      } else {
        hurtPlayer();
      }
    }
  }
}

function updateCars() {
  for (const car of cars) {
    if (car.dead) continue;
    car.x += car.vx;
    if (car.x < car.min || car.x + car.w > car.max) car.vx *= -1;
    if (rectsOverlap(player, car)) {
      if (adventureEquipped) {
        car.dead = true;
        spawnExplosion(car.x + car.w / 2, car.y + car.h / 2);
        spawnChunks(car.x, car.y);
        continue;
      }
      const previousBottom = player.y + player.h - player.vy;
      const stomping = player.vy > 0 && previousBottom <= car.y + 14;
      if (stomping) {
        car.dead = true;
        player.vy = -10.5;
        spawnSmoke(car.x + car.w / 2, car.y + car.h / 2, "#dce8f0");
      } else {
        hurtPlayer();
      }
    }
  }
}

function updateObjectsAndLasers() {
  for (const object of objects) {
    object.x += object.vx;
    object.y += object.vy;
    object.vy += 0.34;
    object.life--;
    if (rectsOverlap(player, object)) hurtPlayer();
  }
  objects = objects.filter((object) => object.life > 0 && object.y < H + 90 && object.x > camera - 140 && object.x < camera + W + 260);

  for (const laser of lasers) {
    laser.x += laser.vx;
    laser.life--;
    for (const thrower of throwers) {
      if (!thrower.dead && rectsOverlap(laser, thrower)) {
        defeatThrower(thrower);
        laser.life = 0;
      }
    }
    for (const object of objects) {
      if (rectsOverlap(laser, object)) {
        object.life = 0;
        laser.life = 0;
        spawnSmoke(object.x + object.w / 2, object.y + object.h / 2);
      }
    }
    for (const car of cars) {
      if (!car.dead && rectsOverlap(laser, car)) {
        car.dead = true;
        laser.life = 0;
        spawnSmoke(car.x + car.w / 2, car.y + car.h / 2, "#dce8f0");
      }
    }
  }
  lasers = lasers.filter((laser) => laser.life > 0 && laser.x > camera - 80 && laser.x < camera + W + 120);

  for (const ball of footballs) {
    ball.life--;
    if (ball.life < 55) ball.returning = true;
    if (ball.returning) {
      const tx = player.x + player.w / 2;
      const ty = player.y + 30;
      ball.vx += Math.sign(tx - ball.x) * 0.55;
      ball.vy += Math.sign(ty - ball.y) * 0.45;
      ball.vx *= 0.93;
      ball.vy *= 0.93;
      if (Math.hypot(tx - ball.x, ty - ball.y) < 26) ball.life = 0;
    }
    ball.x += ball.vx;
    ball.y += ball.vy;
    defeatTargetsWith(ball, "#dce8f0", true);
  }
  footballs = footballs.filter((ball) => ball.life > 0);

  for (const fireball of fireballs) {
    fireball.x += fireball.vx;
    fireball.life--;
    defeatTargetsWith(fireball, "#ff3c22", false);
  }
  fireballs = fireballs.filter((fireball) => fireball.life > 0 && fireball.x > camera - 80 && fireball.x < camera + W + 120);

  for (const chunk of chunks) {
    chunk.life--;
    chunk.x += chunk.vx;
    chunk.y += chunk.vy;
    chunk.vy += 0.25;
  }
  chunks = chunks.filter((chunk) => chunk.life > 0);
}

function applyFanWind() {
  const originX = player.x + player.w / 2;
  const originY = player.y + player.h / 2;
  const dir = player.dir || 1;
  const blow = (item, strength = 3.5) => {
    const dx = item.x + item.w / 2 - originX;
    const dy = item.y + item.h / 2 - originY;
    if (Math.sign(dx || dir) === dir && Math.abs(dx) < 210 && Math.abs(dy) < 95) {
      item.x += dir * strength;
      if ("vx" in item) item.vx = dir * Math.max(Math.abs(item.vx || 0), strength * 0.55);
      spawnSmoke(item.x + item.w / 2, item.y + item.h / 2, "#ccefff");
    }
  };
  [...slugs, ...bees, ...throwers, ...cars].forEach((item) => {
    if (!item.dead) blow(item);
  });
  objects.forEach((item) => blow(item, 5));
}

function defeatTargetsWith(projectile, smokeColor, makesChunks) {
  for (const item of [...slugs, ...bees]) {
    if (!item.dead && rectsOverlap(projectile, item)) {
      item.dead = true;
      projectile.life = projectile.returning ? projectile.life : 0;
      spawnSmoke(item.x + item.w / 2, item.y + item.h / 2, smokeColor);
    }
  }
  for (const thrower of throwers) {
    if (!thrower.dead && rectsOverlap(projectile, thrower)) {
      defeatThrower(thrower);
      projectile.life = projectile.returning ? projectile.life : 0;
      if (makesChunks) spawnChunks(thrower.x, thrower.y);
    }
  }
  for (const car of cars) {
    if (!car.dead && rectsOverlap(projectile, car)) {
      car.dead = true;
      projectile.life = projectile.returning ? projectile.life : 0;
      spawnSmoke(car.x + car.w / 2, car.y + car.h / 2, smokeColor);
      if (makesChunks) spawnChunks(car.x, car.y);
    }
  }
  for (const object of objects) {
    if (rectsOverlap(projectile, object)) {
      object.life = 0;
      spawnSmoke(object.x + object.w / 2, object.y + object.h / 2, smokeColor);
    }
  }
}

function spawnChunks(x, y) {
  for (let i = 0; i < 12; i++) {
    chunks.push({ x: x + Math.random() * 48, y: y + Math.random() * 26, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 5, life: 50, color: i % 2 ? "#b97b3a" : "#6e6071" });
  }
}

function updateParticles() {
  particles = particles.filter((p) => p.life > 0);
  particles.forEach((p) => {
    p.life -= 1;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.07;
  });
}

function drawBackground() {
  const theme = levels[levelIndex]?.theme || "grass";
  if (theme === "lava") return drawLavaBackground();
  if (theme === "beach") return drawBeachBackground();
  if (theme === "city") return drawCityBackground();
  return drawForestBackground();
}

function drawForestBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#172512");
  sky.addColorStop(0.45, "#d0d1b4");
  sky.addColorStop(1, "#798f57");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  drawTreeLayer(0.14, "#202f18", "#5d6b42", 12, 118);
  drawTreeLayer(0.28, "#39512a", "#738248", 16, 166);
  drawTreeLayer(0.5, "#223820", "#5f7c37", 26, 218);
}

function drawLavaBackground() {
  ctx.fillStyle = "#5e5c65";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#413f48";
  for (let x = -80 - (camera * 0.25) % 170; x < W + 180; x += 170) {
    ctx.fillRect(x, 0, 80, 210);
    ctx.fillRect(x + 15, 0, 45, 250);
  }
  ctx.fillStyle = "#d6d0c3";
  for (let x = -40 - (camera * 0.3) % 120; x < W + 120; x += 120) {
    ctx.fillRect(x, 0, 30, 38);
    ctx.fillRect(x + 11, 38, 8, 32);
  }
  ctx.fillStyle = "#ec4a21";
  ctx.fillRect(0, 476, W, 64);
}

function drawBeachBackground() {
  ctx.fillStyle = "#47c3e9";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f4ffff";
  for (let x = -30 - (camera * 0.12) % 260; x < W + 260; x += 260) {
    ctx.fillRect(x, 58, 110, 22);
    ctx.fillRect(x + 34, 38, 58, 22);
  }
  ctx.fillStyle = "#248bc9";
  ctx.fillRect(0, 190, W, 125);
  ctx.fillStyle = "#86e6ff";
  for (let x = -camera * 0.4 % 160; x < W + 160; x += 160) ctx.fillRect(x, 236, 110, 5);
  ctx.fillStyle = "#eac06e";
  ctx.fillRect(0, 315, W, H - 315);
}

function drawCityBackground() {
  ctx.fillStyle = "#d3c7b4";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#eee4cd";
  for (let x = 20; x < W; x += 240) ctx.fillRect(x, 48, 90, 18);
  for (let x = -120 - (camera * 0.22) % 210; x < W + 210; x += 210) {
    ctx.fillStyle = "#6e6071";
    ctx.fillRect(x, 130, 90, 250);
    ctx.fillStyle = "#a97445";
    ctx.fillRect(x + 98, 88, 86, 292);
    ctx.fillStyle = "#f7c76c";
    for (let y = 115; y < 340; y += 28) ctx.fillRect(x + 114, y, 8, 12);
  }
  ctx.fillStyle = "#34333d";
  ctx.fillRect(0, 382, W, 30);
}

function drawTreeLayer(parallax, trunkColor, leafColor, step, base) {
  const offset = -camera * parallax;
  for (let x = -220 + (offset % 220); x < W + 260; x += 220) {
    ctx.fillStyle = trunkColor;
    ctx.fillRect(x + 82, base - 10, 28, 330);
    ctx.fillRect(x + 62, base + 70, 70, 260);
    ctx.fillStyle = leafColor;
    for (let i = 0; i < 13; i++) {
      const px = x + 22 + i * step;
      const py = base - 54 + Math.sin(i * 1.8) * 22;
      ctx.fillRect(px, py, 58, 26);
      ctx.fillRect(px - 12, py + 18, 80, 22);
    }
  }
}

function drawPlatform(platform) {
  const x = Math.round(platform.x - camera);
  const y = platform.y;
  const theme = levels[levelIndex].theme;
  if (theme === "lava") {
    ctx.fillStyle = "#c7c0b4";
    ctx.fillRect(x, y - 8, platform.w, 12);
    ctx.fillStyle = "#67636a";
    ctx.fillRect(x, y + 4, platform.w, platform.h);
    ctx.fillStyle = "#3f3c44";
  } else if (theme === "beach") {
    ctx.fillStyle = "#f0d07c";
    ctx.fillRect(x, y - 8, platform.w, 18);
    ctx.fillStyle = "#c89751";
    ctx.fillRect(x, y + 10, platform.w, platform.h - 8);
    ctx.fillStyle = "#8ccf66";
  } else if (theme === "city") {
    ctx.fillStyle = "#454350";
    ctx.fillRect(x, y - 8, platform.w, 16);
    ctx.fillStyle = "#876542";
    ctx.fillRect(x, y + 8, platform.w, platform.h - 8);
    ctx.fillStyle = "#292833";
  } else {
    ctx.fillStyle = "#5ecb36";
    ctx.fillRect(x, y, platform.w, 12);
    ctx.fillStyle = "#83e84a";
    ctx.fillRect(x, y - 9, platform.w, 10);
    ctx.fillStyle = "#7a4525";
    ctx.fillRect(x, y + 12, platform.w, platform.h - 12);
    ctx.fillStyle = "#19361f";
  }
  for (let px = x + 3; px < x + platform.w; px += 36) ctx.fillRect(px, y - 18, 14, 18);
}

function drawLavaLake(item, time) {
  const x = item.x - camera;
  ctx.fillStyle = "#ff5b21";
  ctx.fillRect(x, item.y, item.w, item.h);
  ctx.fillStyle = "#ffc238";
  for (let px = x + (time / 50) % 40; px < x + item.w; px += 42) ctx.fillRect(px, item.y + 12, 28, 5);
}

function drawLadder(item) {
  const x = item.x - camera;
  ctx.fillStyle = "#d0a342";
  ctx.fillRect(x, item.y, 7, item.h);
  ctx.fillRect(x + item.w - 7, item.y, 7, item.h);
  for (let y = item.y + 10; y < item.y + item.h; y += 22) ctx.fillRect(x + 2, y, item.w - 4, 6);
}

function drawCheckpoint(checkpoint) {
  const x = checkpoint.x - camera;
  const y = checkpoint.y;
  const flagColor = checkpoint.active ? "#49e25e" : "#f4d329";
  const flagShade = checkpoint.active ? "#1fae3c" : "#c8a719";
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 3, y + 3, 5, checkpoint.h - 5);
  ctx.fillRect(x - 6, y + checkpoint.h - 4, 21, 5);
  ctx.fillStyle = "#9aa0a6";
  ctx.fillRect(x + 5, y + 5, 3, checkpoint.h - 10);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 8, y + 5, 30, 24);
  ctx.fillStyle = flagShade;
  ctx.fillRect(x + 10, y + 7, 25, 19);
  ctx.fillStyle = flagColor;
  ctx.fillRect(x + 11, y + 7, 18, 15);
  ctx.fillRect(x + 29, y + 11, 9, 15);
  ctx.fillStyle = "#fff6a6";
  ctx.fillRect(x + 12, y + 8, 5, 12);
}

function drawCoin(coin, time) {
  if (coin.taken) return;
  const x = coin.x - camera;
  const bob = Math.sin(time / 220 + coin.x) * 5;
  ctx.fillStyle = "#9d5e08";
  ctx.fillRect(x - 14, coin.y - 15 + bob, 28, 32);
  ctx.fillStyle = "#ffb71f";
  ctx.fillRect(x - 18, coin.y - 18 + bob, 36, 30);
  ctx.fillStyle = "#ffe35b";
  ctx.fillRect(x - 11, coin.y - 12 + bob, 22, 20);
  ctx.fillStyle = "#fff7a4";
  ctx.fillRect(x - 4, coin.y - 10 + bob, 8, 16);
  ctx.fillRect(x - 10, coin.y - 4 + bob, 20, 6);
}

function drawSlug(slug) {
  if (slug.dead) return;
  const x = slug.x - camera;
  const y = slug.y;
  const faceX = slug.vx >= 0 ? x + 5 : x + 29;
  const shellX = slug.vx >= 0 ? x + 23 : x + 5;
  const eyeLeft = faceX + (slug.vx >= 0 ? 7 : 6);
  const eyeRight = faceX + (slug.vx >= 0 ? 20 : 19);
  ctx.fillStyle = "#342312";
  ctx.fillRect(x + 7, y + 21, 39, 5);
  ctx.fillStyle = "#c59c38";
  ctx.fillRect(faceX, y + 7, 24, 18);
  ctx.fillRect(faceX + 4, y + 3, 18, 7);
  ctx.fillStyle = "#dbb654";
  ctx.fillRect(faceX + 5, y + 9, 16, 13);
  ctx.fillStyle = "#bf1970";
  ctx.fillRect(shellX + 4, y + 10, 26, 14);
  ctx.fillStyle = "#f044a0";
  ctx.fillRect(shellX + 15, y + 6, 16, 9);
  ctx.fillStyle = "#9e7627";
  ctx.fillRect(eyeLeft, y - 13, 4, 18);
  ctx.fillRect(eyeRight, y - 15, 4, 20);
  ctx.fillStyle = "#f0bd4b";
  ctx.fillRect(eyeLeft - 3, y - 17, 6, 4);
  ctx.fillRect(eyeRight, y - 19, 6, 4);
  ctx.fillStyle = "#111";
  ctx.fillRect(faceX + 7, y + 11, 3, 4);
  ctx.fillRect(faceX + 18, y + 11, 3, 4);
}

function drawBee(bee, time) {
  if (bee.dead) return;
  const x = bee.x - camera;
  const y = bee.y;
  const wing = Math.floor(time / 90) % 2;
  ctx.fillStyle = "rgba(244,244,240,0.85)";
  ctx.fillRect(x + 7, y - 14 - wing * 5, 24, 12);
  ctx.fillRect(x + 22, y - 14 + wing * 5, 25, 12);
  ctx.fillStyle = "#ffd51c";
  ctx.fillRect(x, y + 2, 45, 27);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 10, y + 2, 7, 27);
  ctx.fillRect(x + 27, y + 2, 7, 27);
  ctx.fillRect(x + 44, y + 12, 10, 8);
  ctx.fillRect(x + 5, y + 10, 5, 5);
  ctx.fillStyle = "#db3b6a";
  ctx.fillRect(x + 9, y + 20, 8, 6);
}

function drawSpring(spring) {
  const x = spring.x - camera;
  const squish = spring.squish > 0 ? 6 : 0;
  ctx.fillStyle = "#2b3036";
  ctx.fillRect(x + 4, spring.y + 15, spring.w - 8, 7);
  ctx.fillStyle = "#d83750";
  ctx.fillRect(x, spring.y - squish, spring.w, 8);
  ctx.fillRect(x + 8, spring.y + 9 - squish, spring.w - 16, 6);
  ctx.fillStyle = "#f5f5ec";
  ctx.fillRect(x + 8, spring.y + 4 - squish, spring.w - 16, 5);
}

function drawThrower(thrower) {
  if (thrower.dead) return;
  const x = thrower.x - camera;
  const y = thrower.y;
  ctx.fillStyle = "#18201b";
  ctx.fillRect(x + 7, y + 53, 12, 8);
  ctx.fillRect(x + 25, y + 53, 12, 8);
  ctx.fillStyle = "#2d6791";
  ctx.fillRect(x + 9, y + 38, 11, 18);
  ctx.fillRect(x + 23, y + 38, 11, 18);
  ctx.fillStyle = "#f4f0e9";
  ctx.fillRect(x + 8, y + 28, 27, 14);
  ctx.fillStyle = "#202225";
  ctx.fillRect(x + 3, y + 27, 7, 22);
  ctx.fillRect(x + 33, y + 27, 7, 22);
  ctx.fillStyle = "#f2b278";
  ctx.fillRect(x + 8, y + 12, 27, 22);
  ctx.fillStyle = "#f5c181";
  ctx.fillRect(x + 5, y + 5, 14, 38);
  ctx.fillStyle = "#191919";
  ctx.fillRect(x + 11, y + 8, 25, 7);
  ctx.fillRect(x + 10, y + 20, 4, 5);
  ctx.fillRect(x + 27, y + 20, 4, 5);
  ctx.fillStyle = "#ec6b69";
  ctx.fillRect(x + 18, y + 28, 7, 5);
}

function drawCar(car) {
  if (car.dead) return;
  const x = car.x - camera;
  ctx.fillStyle = "#1b1b20";
  ctx.fillRect(x + 10, car.y + 22, 14, 14);
  ctx.fillRect(x + 52, car.y + 22, 14, 14);
  ctx.fillStyle = "#d84a2b";
  ctx.fillRect(x, car.y + 10, car.w, 22);
  ctx.fillStyle = "#f0c94b";
  ctx.fillRect(x + 14, car.y, 35, 17);
  ctx.fillStyle = "#8ee5ff";
  ctx.fillRect(x + 21, car.y + 3, 18, 10);
}

function drawThrownObject(object) {
  const x = object.x - camera;
  const y = object.y;
  if (object.type === "book") {
    ctx.fillStyle = "#7e3eab";
    ctx.fillRect(x, y, 26, 20);
    ctx.fillStyle = "#f1d7a0";
    ctx.fillRect(x + 4, y + 3, 18, 14);
  } else if (object.type === "computer") {
    ctx.fillStyle = "#252a32";
    ctx.fillRect(x, y, 29, 20);
    ctx.fillStyle = "#6dd3ff";
    ctx.fillRect(x + 4, y + 4, 21, 10);
  } else if (object.type === "photo") {
    ctx.fillStyle = "#f4f0dd";
    ctx.fillRect(x, y, 27, 22);
    ctx.fillStyle = "#6aa6d8";
    ctx.fillRect(x + 4, y + 4, 19, 10);
  } else {
    ctx.fillStyle = "#8c5a31";
    ctx.fillRect(x + 7, y + 13, 15, 11);
    ctx.fillStyle = "#58b65a";
    ctx.fillRect(x + 3, y + 6, 10, 10);
    ctx.fillRect(x + 15, y + 1, 10, 13);
  }
}

function drawLaser(laser) {
  const x = laser.x - camera;
  ctx.fillStyle = "#56e7ff";
  ctx.fillRect(x - 4, laser.y, laser.w + 8, laser.h);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x, laser.y + 1, laser.w, 4);
}

function drawFootball(ball) {
  const x = ball.x - camera;
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 3, ball.y, 16, 22);
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(x, ball.y + 4, 22, 14);
  ctx.fillStyle = "#202020";
  ctx.fillRect(x + 8, ball.y + 7, 7, 7);
  ctx.fillRect(x + 2, ball.y + 3, 5, 5);
  ctx.fillRect(x + 15, ball.y + 15, 5, 5);
}

function drawFireball(fireball) {
  const x = fireball.x - camera;
  ctx.fillStyle = "#b91512";
  ctx.fillRect(x, fireball.y + 4, 25, 14);
  ctx.fillStyle = "#ff3c22";
  ctx.fillRect(x + 5, fireball.y, 20, 18);
  ctx.fillStyle = "#ffd34a";
  ctx.fillRect(x + 12, fireball.y + 4, 9, 8);
}

function drawChunk(chunk) {
  ctx.fillStyle = chunk.color;
  ctx.fillRect(chunk.x - camera, chunk.y, 10, 9);
}

function drawTimmy(time) {
  const x = Math.round(player.x - camera);
  const y = Math.round(player.y);
  const leg = Math.sin(time / 85) * (player.onGround ? 5 : 1);
  if (player.invincible > 0 && Math.floor(time / 70) % 2 === 0) return;
  ctx.save();
  ctx.translate(x + player.w / 2, y);
  ctx.scale(player.dir, 1);
  ctx.translate(-player.w / 2, 0);
  if (fanEquipped) {
    ctx.fillStyle = "#94a9b8";
    ctx.fillRect(18, 12, 10, 45);
    ctx.fillStyle = "#d8e5ec";
    ctx.fillRect(6, 6, 34, 34);
    ctx.fillStyle = "#26323d";
    ctx.fillRect(10, 10, 26, 26);
    ctx.fillStyle = "#d8e5ec";
    ctx.fillRect(20, 8, 6, 30);
    ctx.fillRect(8, 20, 30, 6);
    ctx.fillStyle = "#56e7ff";
    ctx.fillRect(-18, 18, 16, 4);
    ctx.fillRect(-26, 28, 20, 4);
    ctx.restore();
    return;
  }
  if (powers.home && homeEquipped) {
    ctx.fillStyle = "#172333";
    ctx.fillRect(-3, 68, 48, 10);
    ctx.fillStyle = "#324459";
    ctx.fillRect(3, 64, 36, 7);
    ctx.fillStyle = "#56e7ff";
    ctx.fillRect(4, 78, 9, 6);
    ctx.fillRect(30, 78, 9, 6);
  }
  if (equippedPower === "zing" && powers.zing) {
    ctx.fillStyle = "#d9f3ff";
    ctx.fillRect(-21, 22, 20, 8);
    ctx.fillRect(-27, 30, 22, 7);
    ctx.fillRect(-19, 38, 16, 6);
    ctx.fillStyle = "#7ea6d8";
    ctx.fillRect(-24, 34, 18, 3);
  }
  if (adventureEquipped) {
    ctx.fillStyle = "#ffcf45";
    ctx.fillRect(-6, 50, 6, 11);
    ctx.fillRect(40, 50, 6, 11);
  }
  ctx.fillStyle = "#2b1b17";
  ctx.fillRect(8, 3, 22, 9);
  ctx.fillRect(4, 11, 32, 11);
  ctx.fillRect(2, 21, 28, 8);
  ctx.fillStyle = "#6c3d1d";
  ctx.fillRect(11, 0, 21, 12);
  ctx.fillRect(6, 9, 28, 12);
  ctx.fillRect(14, 21, 10, 8);
  ctx.fillStyle = "#f3c07b";
  ctx.fillRect(8, 23, 24, 18);
  ctx.fillRect(5, 28, 7, 10);
  ctx.fillRect(29, 27, 6, 10);
  ctx.fillStyle = "#312018";
  ctx.fillRect(12, 27, 4, 5);
  ctx.fillRect(27, 27, 4, 5);
  ctx.fillRect(18, 35, 8, 3);
  ctx.fillStyle = "#2f477c";
  ctx.fillRect(7, 43, 26, 21);
  ctx.fillStyle = "#5f6fb4";
  ctx.fillRect(11, 44, 17, 8);
  ctx.fillStyle = "#26243a";
  ctx.fillRect(4, 44, 6, 21);
  ctx.fillRect(32, 44, 6, 21);
  ctx.fillStyle = "#34343d";
  ctx.fillRect(10, 63, 8, 12 + leg);
  ctx.fillRect(24, 63, 8, 12 - leg);
  ctx.restore();
}

function drawPortal(time) {
  const x = world.width - portal.offsetFromEnd - camera;
  const y = portal.y;
  const pulse = Math.sin(time / 160) * 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(55,225,255,0.2)";
  ctx.fillRect(-42 - pulse, -75 - pulse, 84 + pulse * 2, 150 + pulse * 2);
  ctx.fillStyle = "#29dcff";
  ctx.fillRect(-26, -68, 26, 9);
  ctx.fillRect(-37, -56, 20, 18);
  ctx.fillRect(-45, -34, 15, 56);
  ctx.fillRect(-38, 28, 20, 25);
  ctx.fillRect(-23, 55, 33, 12);
  ctx.fillRect(10, 46, 18, 12);
  ctx.fillRect(24, 20, 12, 26);
  ctx.fillRect(31, -26, 11, 47);
  ctx.fillStyle = "#1577d6";
  ctx.fillRect(-25, -50, 44, 96);
  ctx.fillStyle = "#16186d";
  ctx.fillRect(-11, -22, 23, 50);
  ctx.fillStyle = "#47dfff";
  for (let i = 0; i < 7; i++) ctx.fillRect(Math.sin(time / 180 + i) * 16 - 3, -48 + i * 17, 8, 5);
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 52);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - camera - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawLevelTitle() {
  if (levelTitleTimer <= 0 || won || gameOver || menuOpen) return;
  ctx.fillStyle = "rgba(17,24,18,0.62)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff1aa";
  ctx.font = "700 42px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(levels[levelIndex].name, W / 2, 236);
  ctx.font = "700 22px Trebuchet MS";
  ctx.fillText(`${worldNames[selectedWorld]} - Level ${levelIndex + 1} of 3`, W / 2, 278);
  ctx.textAlign = "left";
}

function drawWinBanner() {
  if (!won && !gameOver) return;
  ctx.fillStyle = "rgba(12,18,14,0.72)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff1aa";
  ctx.font = "700 50px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(won ? `${worldNames[selectedWorld]} cleared!` : "Timmy needs a breather", W / 2, 226);
  ctx.font = "700 24px Trebuchet MS";
  ctx.fillText(won ? "Choose another world from Restart if you want a new route" : "The hazards got all three hearts", W / 2, 270);
  ctx.fillText("Press Restart to try again", W / 2, 310);
  ctx.textAlign = "left";
}

function draw(time) {
  drawBackground();
  lava.forEach((item) => drawLavaLake(item, time));
  ladders.forEach(drawLadder);
  platforms.forEach(drawPlatform);
  checkpoints.forEach(drawCheckpoint);
  springs.forEach(drawSpring);
  coins.forEach((coin) => drawCoin(coin, time));
  drawPortal(time);
  slugs.forEach(drawSlug);
  bees.forEach((bee) => drawBee(bee, time));
  throwers.forEach(drawThrower);
  cars.forEach(drawCar);
  objects.forEach(drawThrownObject);
  lasers.forEach(drawLaser);
  footballs.forEach(drawFootball);
  fireballs.forEach(drawFireball);
  chunks.forEach(drawChunk);
  drawTimmy(time);
  drawParticles();
  drawLevelTitle();
  drawWinBanner();
}

function loop(now) {
  const dt = Math.min(32, now - then);
  then = now;
  update(dt);
  draw(now);
  requestAnimationFrame(loop);
}

loadActiveProfile(0);
resetGame();
requestAnimationFrame(loop);
