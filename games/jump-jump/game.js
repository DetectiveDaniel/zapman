const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const ui = {
  level: document.querySelector("#level"),
  score: document.querySelector("#score"),
  shots: document.querySelector("#shots"),
  gems: document.querySelector("#gems"),
  hat: document.querySelector("#hat"),
  message: document.querySelector("#message"),
  restart: document.querySelector("#restart"),
  next: document.querySelector("#next"),
  towerStart: document.querySelector("#towerStart"),
  towerStatus: document.querySelector("#towerStatus"),
  fortuneCards: [...document.querySelectorAll(".fortune-card")],
  heroButtons: [...document.querySelectorAll(".hero-card")],
};

const W = canvas.width;
const H = canvas.height;
const groundY = 542;
const sling = { x: 132, y: 420 };
const gravity = 0.56;
const drag = 0.992;
const bounce = 0.45;
const maxPull = 118;

const HEROES = {
  bonk: {
    name: "Bonk",
    color: "#d46d1c",
    trail: "#f7bf3a",
    launch: 1,
    message: "Bonk zaps the nearest angry face after launch.",
  },
  drill: {
    name: "Drill",
    color: "#8b6339",
    trail: "#f1d193",
    launch: 1.05,
    message: "Drill zings through blocks instead of bouncing off.",
  },
  spin: {
    name: "Spin",
    color: "#137ed3",
    trail: "#7fe6ff",
    launch: 1.28,
    message: "Spin is fast and breaks through three layers.",
  },
  frozo: {
    name: "Frozo",
    color: "#24314f",
    trail: "#9bdfff",
    launch: 0.98,
    message: "Frozo freezes towers and angry faces nearby.",
  },
};

const HERO_ORDER = Object.keys(HEROES);
const MATERIALS = {
  red: { health: 2, color: "#c54824", alt: "#a33a22", stroke: "#682414", score: 120, breakImpact: 16 },
  wood: { health: 1, color: "#b06a2e", alt: "#8f4f22", stroke: "#5f3418", score: 90, breakImpact: 11 },
  stone: { health: 3, color: "#8f9291", alt: "#707675", stroke: "#4b5050", score: 150, breakImpact: 22 },
  iron: { health: 4, color: "#b8c2c7", alt: "#85949b", stroke: "#4d5c63", score: 190, breakImpact: 28 },
};

const HATS = {
  none: "None",
  cowboy: "Cowboy",
  space: "Space Helmet",
};

const WEATHER_TYPES = [
  {
    name: "clear",
    label: "Crystal Sun",
    sky: ["#64d2ff", "#ffd36a", "#78c579"],
    tint: "rgba(255, 217, 106, 0.16)",
    count: 10,
  },
  {
    name: "rain",
    label: "Neon Rain",
    sky: ["#293d74", "#4987b8", "#354b5e"],
    tint: "rgba(80, 180, 255, 0.18)",
    count: 72,
  },
  {
    name: "snow",
    label: "Moon Snow",
    sky: ["#9ccfff", "#e9f8ff", "#8bb1c5"],
    tint: "rgba(220, 248, 255, 0.2)",
    count: 58,
  },
  {
    name: "embers",
    label: "Ember Wind",
    sky: ["#4d2048", "#df6f3a", "#68522d"],
    tint: "rgba(255, 93, 45, 0.17)",
    count: 46,
  },
  {
    name: "aurora",
    label: "Aurora Glow",
    sky: ["#172f58", "#4bd6a6", "#394a91"],
    tint: "rgba(117, 255, 205, 0.18)",
    count: 34,
  },
];

const levels = [
  {
    shots: 3,
    blocks: [
      [725, 486, 34, 56], [725, 430, 34, 56], [725, 374, 34, 56],
      [840, 486, 34, 56], [840, 430, 34, 56], [840, 374, 34, 56],
      [765, 352, 110, 26], [762, 460, 116, 26],
    ],
    enemies: [[782, 330], [860, 350]],
  },
  {
    shots: 4,
    blocks: [
      [680, 490, 34, 52], [680, 438, 34, 52], [680, 386, 34, 52],
      [780, 490, 34, 52], [780, 438, 34, 52], [780, 386, 34, 52],
      [880, 490, 34, 52], [880, 438, 34, 52], [880, 386, 34, 52],
      [714, 374, 100, 24], [814, 374, 100, 24], [705, 468, 210, 24],
    ],
    enemies: [[730, 350], [830, 350], [900, 464]],
  },
  {
    shots: 5,
    blocks: [
      [650, 492, 36, 50], [650, 442, 36, 50], [650, 392, 36, 50], [650, 342, 36, 50],
      [754, 492, 36, 50], [754, 442, 36, 50], [754, 392, 36, 50], [754, 342, 36, 50],
      [858, 492, 36, 50], [858, 442, 36, 50], [858, 392, 36, 50],
      [962, 492, 36, 50], [962, 442, 36, 50],
      [690, 326, 108, 24], [794, 376, 108, 24], [898, 426, 108, 24], [690, 470, 314, 24],
    ],
    enemies: [[704, 304], [820, 354], [920, 404], [976, 418]],
  },
  {
    shots: 5,
    blocks: [
      [640, 492, 36, 50], [640, 442, 36, 50], [640, 392, 36, 50],
      [750, 492, 36, 50], [750, 442, 36, 50], [750, 392, 36, 50],
      [860, 492, 36, 50], [860, 442, 36, 50], [860, 392, 36, 50],
      [680, 372, 110, 24], [790, 466, 110, 24], [676, 516, 224, 24],
    ],
    enemies: [[706, 350], [816, 444], [884, 370]],
    portals: [
      { x: 468, y: 390, targetX: 932, targetY: 260, color: "#9b5cff" },
    ],
    fans: [
      { x: 548, y: 466, w: 54, h: 76, fx: 0.34, fy: -0.34 },
    ],
  },
  {
    shots: 6,
    blocks: [
      [620, 492, 36, 50], [620, 442, 36, 50], [620, 392, 36, 50], [620, 342, 36, 50],
      [734, 492, 36, 50], [734, 442, 36, 50], [734, 392, 36, 50],
      [848, 492, 36, 50], [848, 442, 36, 50], [848, 392, 36, 50], [848, 342, 36, 50],
      [960, 492, 36, 50], [960, 442, 36, 50],
      [658, 324, 112, 24], [772, 372, 112, 24], [884, 466, 112, 24], [658, 516, 340, 24],
    ],
    enemies: [[676, 302], [788, 350], [904, 444], [976, 418]],
    portals: [
      { x: 430, y: 318, targetX: 956, targetY: 190, color: "#35d6ff" },
      { x: 548, y: 484, targetX: 742, targetY: 256, color: "#ff78dd" },
    ],
    fans: [
      { x: 490, y: 466, w: 52, h: 76, fx: 0.44, fy: -0.12 },
      { x: 1010, y: 412, w: 52, h: 96, fx: -0.34, fy: -0.28 },
    ],
  },
  {
    shots: 6,
    blocks: [
      [600, 492, 36, 50], [600, 442, 36, 50], [600, 392, 36, 50], [600, 342, 36, 50],
      [710, 492, 36, 50], [710, 442, 36, 50], [710, 392, 36, 50], [710, 342, 36, 50],
      [820, 492, 36, 50], [820, 442, 36, 50], [820, 392, 36, 50],
      [930, 492, 36, 50], [930, 442, 36, 50], [930, 392, 36, 50],
      [640, 320, 112, 24], [750, 370, 112, 24], [860, 420, 112, 24], [640, 516, 330, 24],
    ],
    enemies: [[656, 298], [768, 348], [878, 398], [946, 370], [956, 464]],
    portals: [
      { x: 390, y: 440, targetX: 932, targetY: 168, color: "#9b5cff" },
      { x: 536, y: 260, targetX: 760, targetY: 456, color: "#35d6ff" },
    ],
    fans: [
      { x: 486, y: 470, w: 54, h: 72, fx: 0.48, fy: -0.2 },
      { x: 780, y: 470, w: 54, h: 72, fx: 0.2, fy: -0.5 },
      { x: 1012, y: 374, w: 54, h: 112, fx: -0.44, fy: -0.1 },
    ],
  },
  {
    shots: 7,
    blocks: [
      [610, 492, 36, 50], [610, 442, 36, 50], [610, 392, 36, 50],
      [730, 492, 36, 50], [730, 442, 36, 50], [730, 392, 36, 50], [730, 342, 36, 50],
      [850, 492, 36, 50], [850, 442, 36, 50], [850, 392, 36, 50],
      [970, 492, 36, 50], [970, 442, 36, 50], [970, 392, 36, 50],
      [650, 370, 120, 24], [770, 320, 120, 24], [890, 420, 120, 24], [650, 516, 360, 24],
    ],
    enemies: [
      { x: 690, y: 310, type: "jetpack" },
      { x: 816, y: 258, type: "jetpack" },
      { x: 936, y: 358, type: "jetpack" },
      [972, 464],
    ],
    portals: [
      { x: 410, y: 366, targetX: 890, targetY: 214, color: "#ff78dd" },
      { x: 560, y: 494, targetX: 1010, targetY: 260, color: "#35d6ff" },
    ],
    fans: [
      { x: 500, y: 470, w: 54, h: 72, fx: 0.42, fy: -0.18 },
      { x: 760, y: 470, w: 54, h: 72, fx: 0.12, fy: -0.54 },
      { x: 1040, y: 376, w: 48, h: 118, fx: -0.42, fy: -0.18 },
    ],
  },
  {
    shots: 4,
    blocks: [
      [640, 492, 34, 50, "wood"], [640, 442, 34, 50, "wood"], [640, 392, 34, 50, "wood"],
      [760, 492, 34, 50, "wood"], [760, 442, 34, 50, "wood"], [760, 392, 34, 50, "wood"],
      [880, 492, 34, 50, "wood"], [880, 442, 34, 50, "wood"],
      [676, 370, 118, 24, "wood"], [794, 466, 118, 24, "wood"], [676, 516, 236, 24, "red"],
    ],
    enemies: [[704, 348], [822, 444], [898, 418]],
    fans: [{ x: 520, y: 470, w: 54, h: 72, fx: 0.36, fy: -0.2 }],
  },
  {
    shots: 4,
    blocks: [
      [630, 492, 38, 50, "stone"], [630, 442, 38, 50, "stone"], [630, 392, 38, 50, "stone"],
      [748, 492, 38, 50, "wood"], [748, 442, 38, 50, "wood"], [748, 392, 38, 50, "wood"],
      [866, 492, 38, 50, "stone"], [866, 442, 38, 50, "stone"], [866, 392, 38, 50, "stone"],
      [672, 370, 116, 24, "red"], [790, 466, 116, 24, "stone"], [672, 516, 232, 24, "wood"],
    ],
    enemies: [[690, 348], [808, 444], [884, 370], [928, 464]],
    portals: [{ x: 456, y: 388, targetX: 930, targetY: 250, color: "#35d6ff" }],
  },
  {
    shots: 4,
    blocks: [
      [620, 492, 38, 50, "iron"], [620, 442, 38, 50, "iron"], [620, 392, 38, 50, "stone"],
      [742, 492, 38, 50, "red"], [742, 442, 38, 50, "red"], [742, 392, 38, 50, "wood"],
      [864, 492, 38, 50, "iron"], [864, 442, 38, 50, "stone"], [864, 392, 38, 50, "iron"],
      [986, 492, 38, 50, "wood"], [986, 442, 38, 50, "wood"],
      [660, 370, 120, 24, "iron"], [782, 420, 120, 24, "stone"], [904, 516, 120, 24, "red"],
    ],
    enemies: [[682, 348], [804, 398], [926, 494], { x: 990, y: 390, type: "jetpack" }],
    fans: [
      { x: 520, y: 470, w: 54, h: 72, fx: 0.42, fy: -0.18 },
      { x: 1040, y: 380, w: 48, h: 118, fx: -0.38, fy: -0.18 },
    ],
  },
  {
    shots: 4,
    blocks: [
      [610, 492, 36, 50, "wood"], [610, 442, 36, 50, "stone"], [610, 392, 36, 50, "iron"],
      [720, 492, 36, 50, "red"], [720, 442, 36, 50, "wood"], [720, 392, 36, 50, "stone"],
      [830, 492, 36, 50, "iron"], [830, 442, 36, 50, "red"], [830, 392, 36, 50, "wood"],
      [940, 492, 36, 50, "stone"], [940, 442, 36, 50, "iron"], [940, 392, 36, 50, "red"],
      [650, 342, 110, 24, "wood"], [760, 392, 110, 24, "stone"], [870, 442, 110, 24, "iron"],
    ],
    enemies: [[670, 320], [780, 370], [890, 420], { x: 960, y: 350, type: "jetpack" }],
    portals: [
      { x: 420, y: 440, targetX: 910, targetY: 210, color: "#ff78dd" },
      { x: 548, y: 270, targetX: 760, targetY: 468, color: "#9b5cff" },
    ],
  },
  {
    shots: 4,
    blocks: [
      [600, 492, 38, 50, "iron"], [600, 442, 38, 50, "iron"], [600, 392, 38, 50, "iron"],
      [716, 492, 38, 50, "stone"], [716, 442, 38, 50, "wood"], [716, 392, 38, 50, "red"],
      [832, 492, 38, 50, "red"], [832, 442, 38, 50, "stone"], [832, 392, 38, 50, "iron"],
      [948, 492, 38, 50, "wood"], [948, 442, 38, 50, "stone"], [948, 392, 38, 50, "iron"],
      [640, 320, 112, 24, "iron"], [752, 370, 112, 24, "stone"], [864, 420, 112, 24, "wood"], [640, 516, 336, 24, "red"],
    ],
    enemies: [
      [660, 298], [772, 348], [884, 398],
      { x: 948, y: 350, type: "jetpack" },
      { x: 1000, y: 438, type: "jetpack" },
    ],
    portals: [
      { x: 390, y: 430, targetX: 940, targetY: 172, color: "#35d6ff" },
      { x: 540, y: 250, targetX: 820, targetY: 458, color: "#ff78dd" },
    ],
    fans: [
      { x: 500, y: 470, w: 54, h: 72, fx: 0.46, fy: -0.2 },
      { x: 780, y: 470, w: 54, h: 72, fx: 0.12, fy: -0.58 },
      { x: 1040, y: 376, w: 48, h: 118, fx: -0.42, fy: -0.18 },
    ],
  },
];

let levelIndex = 0;
let score = 0;
let shots = 0;
let blocks = [];
let enemies = [];
let portals = [];
let fans = [];
let particles = [];
let effects = [];
let activePlayers = [];
let usedHeroes = new Set();
let gems = 0;
let unlockedHats = new Set(["none"]);
let currentHat = "none";
let towerActive = false;
let towerFloor = 0;
let towerDeck = [];
let weather;
let weatherBits = [];
let shimmer = 0;
let player;
let state = "ready";
let mouse = { x: sling.x, y: sling.y, down: false };
let cameraShake = 0;
let selectedHero = "bonk";

function makeBlock(x, y, w, h, material = "red") {
  const spec = MATERIALS[material] || MATERIALS.red;
  return {
    x, y, w, h,
    vx: 0,
    vy: 0,
    angle: 0,
    spin: 0,
    dead: false,
    material,
    health: spec.health,
    frozen: 0,
    color: Math.random() > 0.5 ? spec.alt : spec.color,
  };
}

function makeEnemy(x, y, type = "normal", weapon = null) {
  const roll = Math.random();
  const chosenWeapon = weapon || (roll < 0.18 ? "laser" : roll < 0.38 ? "umbrella" : null);
  return {
    x,
    y,
    r: 18,
    vx: 0,
    vy: 0,
    type,
    weapon: chosenWeapon,
    laserCooldown: 80 + Math.random() * 90,
    alive: true,
    frozen: 0,
    faceTime: Math.random() * 100,
  };
}

function resetLevel(keepScore = true) {
  const data = levels[levelIndex];
  shots = HERO_ORDER.length;
  blocks = data.blocks.map((b) => makeBlock(...b));
  enemies = data.enemies.map((e) => Array.isArray(e) ? makeEnemy(...e) : makeEnemy(e.x, e.y, e.type, e.weapon));
  portals = data.portals ? data.portals.map((p) => ({ ...p, r: 30, cooldown: 0 })) : [];
  fans = data.fans ? data.fans.map((f) => ({ ...f })) : [];
  particles = [];
  effects = [];
  activePlayers = [];
  usedHeroes = new Set();
  chooseWeather();
  selectedHero = firstUnusedHero() || selectedHero;
  state = "ready";
  player = makePlayer();
  mouse = { x: sling.x, y: sling.y, down: false };
  cameraShake = 0;
  if (!keepScore) score = 0;
  updateUI(`${weather.label}. Drag the jumper back, aim, and let go.`);
}

function makePlayer() {
  return {
    x: sling.x,
    y: sling.y,
    r: 18,
    vx: 0,
    vy: 0,
    launched: false,
    flying: false,
    face: 1,
    trail: [],
    hero: selectedHero,
    abilityUsed: false,
    spinBreaks: selectedHero === "spin" ? 3 : 0,
  };
}

function updateUI(message) {
  ui.level.textContent = String(levelIndex + 1);
  ui.score.textContent = String(score);
  ui.shots.textContent = String(shots);
  ui.gems.textContent = String(gems);
  ui.hat.textContent = HATS[currentHat];
  ui.message.textContent = message;
  for (const button of ui.heroButtons) {
    const used = usedHeroes.has(button.dataset.hero);
    button.classList.toggle("is-selected", button.dataset.hero === selectedHero);
    button.classList.toggle("is-used", used);
    button.disabled = used;
  }
  updateTowerUI();
}

function firstUnusedHero() {
  return HERO_ORDER.find((hero) => !usedHeroes.has(hero));
}

function chooseWeather() {
  weather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
  weatherBits = [];
  for (let i = 0; i < weather.count; i += 1) {
    weatherBits.push(makeWeatherBit(true));
  }
}

function makeWeatherBit(randomY = false) {
  return {
    x: Math.random() * W,
    y: randomY ? Math.random() * H : -30 - Math.random() * 80,
    speed: 0.6 + Math.random() * 2.6,
    drift: -0.8 + Math.random() * 1.6,
    size: 2 + Math.random() * 5,
    phase: Math.random() * Math.PI * 2,
  };
}

function updateTowerUI() {
  ui.towerStatus.textContent = towerActive
    ? `Floor ${towerFloor}: pick a card.`
    : gems > 0
      ? "Ready for another climb."
      : "Defeat faces to collect gems.";
  ui.towerStart.disabled = towerActive;
  for (const card of ui.fortuneCards) {
    card.disabled = !towerActive || card.dataset.revealed === "true";
  }
}

function startTower() {
  towerActive = true;
  towerFloor = 1;
  dealTowerCards();
  updateUI("Tower of Fortune started. Pick a card.");
}

function dealTowerCards() {
  const angryChance = Math.min(0.18 + towerFloor * 0.04, 0.42);
  towerDeck = [makeTowerReward(), makeTowerReward(), Math.random() < angryChance ? { type: "angry" } : makeTowerReward()];
  towerDeck.sort(() => Math.random() - 0.5);
  for (const card of ui.fortuneCards) {
    card.textContent = "?";
    card.dataset.revealed = "false";
    card.classList.remove("is-good", "is-bad", "is-revealed");
  }
}

function makeTowerReward() {
  const roll = Math.random();
  if (roll < 0.2 && !unlockedHats.has("cowboy")) return { type: "hat", hat: "cowboy" };
  if (roll < 0.36 && !unlockedHats.has("space")) return { type: "hat", hat: "space" };
  if (roll < 0.68) return { type: "gems", amount: 3 + Math.floor(Math.random() * 4) };
  return { type: "score", amount: 250 + towerFloor * 75 };
}

function pickTowerCard(index) {
  if (!towerActive) return;
  const card = ui.fortuneCards[index];
  const reward = towerDeck[index];
  card.dataset.revealed = "true";
  card.classList.add("is-revealed");
  if (reward.type === "angry") {
    card.innerHTML = '<span class="angry-token" aria-label="Angry face"></span>';
    card.classList.add("is-bad");
    towerActive = false;
    updateUI("Angry face card! Your Tower run stops.");
    return;
  }
  card.classList.add("is-good");
  if (reward.type === "gems") {
    gems += reward.amount;
    card.innerHTML = `<strong>+${reward.amount}</strong>`;
    updateUI(`Tower card gave ${reward.amount} gems.`);
  }
  if (reward.type === "score") {
    score += reward.amount;
    card.innerHTML = `<strong>+${reward.amount}</strong>`;
    updateUI(`Tower card gave ${reward.amount} score.`);
  }
  if (reward.type === "hat") {
    unlockedHats.add(reward.hat);
    currentHat = reward.hat;
    card.innerHTML = `<strong>${reward.hat === "cowboy" ? "Hat" : "Helm"}</strong>`;
    updateUI(`${HATS[reward.hat]} unlocked and equipped!`);
  }
  for (const otherCard of ui.fortuneCards) otherCard.disabled = true;
  towerFloor += 1;
  window.setTimeout(() => {
    if (towerActive) dealTowerCards();
    updateTowerUI();
  }, 650);
}

function screenPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches ? event.touches[0] : event;
  return {
    x: ((touch.clientX - rect.left) / rect.width) * W,
    y: ((touch.clientY - rect.top) / rect.height) * H,
  };
}

function pointerDown(event) {
  if (state !== "ready" || !player) return;
  const p = screenPoint(event);
  const nearPlayer = Math.hypot(p.x - player.x, p.y - player.y) < 70;
  if (!nearPlayer) return;
  mouse.down = true;
  mouse.x = p.x;
  mouse.y = p.y;
}

function pointerMove(event) {
  if (!mouse.down || state !== "ready" || !player) return;
  event.preventDefault();
  const p = screenPoint(event);
  const dx = p.x - sling.x;
  const dy = p.y - sling.y;
  const dist = Math.min(maxPull, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  mouse.x = sling.x + Math.cos(angle) * dist;
  mouse.y = sling.y + Math.sin(angle) * dist;
  player.x = mouse.x;
  player.y = mouse.y;
}

function pointerUp() {
  if (!mouse.down || state !== "ready" || !player) return;
  mouse.down = false;
  const dx = sling.x - player.x;
  const dy = sling.y - player.y;
  const power = Math.hypot(dx, dy);
  if (power < 10) {
    player.x = sling.x;
    player.y = sling.y;
    return;
  }
  const hero = HEROES[player.hero];
  usedHeroes.add(player.hero);
  player.vx = dx * 0.24 * hero.launch;
  player.vy = dy * 0.24 * hero.launch;
  player.launched = true;
  player.flying = true;
  activePlayers.push(player);
  const nextHero = firstUnusedHero();
  shots = nextHero ? HERO_ORDER.length - usedHeroes.size : 0;
  selectedHero = nextHero || selectedHero;
  player = nextHero ? makePlayer() : null;
  state = nextHero ? "ready" : "spent";
  cameraShake = 5;
  burst(activePlayers[activePlayers.length - 1].x, activePlayers[activePlayers.length - 1].y, hero.trail, 12);
  useLaunchAbility(activePlayers[activePlayers.length - 1]);
  updateUI(nextHero ? `${hero.name} launched! Pick another human.` : `${hero.name} launched! All humans used.`);
}

function update() {
  shimmer += 0.016;
  updatePortals();
  updatePlayers();
  updateBlocks();
  updateEnemies();
  updateParticles();
  updateWeather();
  updateEffects();
  checkEndState();
  cameraShake *= 0.88;
}

function updatePortals() {
  for (const portal of portals) {
    if (portal.cooldown > 0) portal.cooldown -= 1;
  }
}

function useLaunchAbility(actor) {
  if (actor.hero === "bonk") zapNearestEnemy(actor);
  if (actor.hero === "frozo") freezeNear(actor.x, actor.y, 130);
}

function zapNearestEnemy(actor = player) {
  const living = enemies.filter((enemy) => enemy.alive);
  if (!living.length) return;
  let nearest = living[0];
  let best = Infinity;
  for (const enemy of living) {
    const dist = Math.hypot(enemy.x - actor.x, enemy.y - actor.y);
    if (dist < best) {
      nearest = enemy;
      best = dist;
    }
  }
  effects.push({ type: "zap", x1: actor.x, y1: actor.y, x2: nearest.x, y2: nearest.y, life: 18 });
  defeatEnemy(nearest, 0, -8);
}

function freezeNear(x, y, radius) {
  let frozen = 0;
  for (const block of blocks) {
    const cx = block.x + block.w / 2;
    const cy = block.y + block.h / 2;
    if (Math.hypot(cx - x, cy - y) > radius) continue;
    block.frozen = 240;
    block.vx *= 0.1;
    block.vy *= 0.1;
    block.spin = 0;
    frozen += 1;
  }
  for (const enemy of enemies) {
    if (!enemy.alive || Math.hypot(enemy.x - x, enemy.y - y) > radius) continue;
    enemy.frozen = 240;
    enemy.vx = 0;
    enemy.vy = 0;
    frozen += 1;
  }
  if (frozen) {
    effects.push({ type: "freeze", x, y, radius, life: 34 });
    burst(x, y, "#9bdfff", 22);
  }
}

function updatePlayers() {
  for (const actor of activePlayers) updatePlayerActor(actor);
  activePlayers = activePlayers.filter((actor) => actor.flying);
}

function updatePlayerActor(actor) {
  if (!actor.flying) return;
  actor.trail.unshift({ x: actor.x, y: actor.y });
  actor.trail.length = Math.min(actor.trail.length, 12);
  applyFanWind(actor);
  actor.vy += gravity;
  actor.vx *= drag;
  actor.vy *= drag;
  actor.x += actor.vx;
  actor.y += actor.vy;
  actor.face = actor.vx >= 0 ? 1 : -1;

  if (actor.y + actor.r > groundY) {
    actor.y = groundY - actor.r;
    actor.vy *= -bounce;
    actor.vx *= 0.72;
    if (Math.abs(actor.vy) < 3) actor.vy = 0;
  }
  if (actor.x - actor.r < 0 || actor.x + actor.r > W) {
    actor.vx *= -0.45;
    actor.x = Math.max(actor.r, Math.min(W - actor.r, actor.x));
  }

  usePortals(actor);

  for (const block of blocks) {
    if (block.dead || !circleRect(actor, block)) continue;
    const cx = Math.max(block.x, Math.min(actor.x, block.x + block.w));
    const cy = Math.max(block.y, Math.min(actor.y, block.y + block.h));
    const nx = actor.x - cx || 1;
    const ny = actor.y - cy || -1;
    const len = Math.hypot(nx, ny);
    const impact = Math.hypot(actor.vx, actor.vy);
    const pierce = actor.hero === "drill" || (actor.hero === "spin" && actor.spinBreaks > 0);
    const force = actor.hero === "drill" ? 0.45 : actor.hero === "spin" ? 0.62 : 0.22;
    block.vx += (nx / len) * impact * force + actor.vx * (pierce ? 0.38 : 0.15);
    block.vy += (ny / len) * impact * force + actor.vy * (pierce ? 0.24 : 0.1);
    block.spin += (actor.vx * (pierce ? 0.05 : 0.018)) + (Math.random() - 0.5) * 0.04;
    block.frozen = 0;
    if (actor.hero === "frozo") freezeNear(cx, cy, 150);
    if (actor.hero === "spin" && actor.spinBreaks > 0) {
      actor.spinBreaks -= 1;
      crackBlock(block, cx, cy, impact, actor);
    }
    if (actor.hero === "drill") crackBlock(block, cx, cy, impact * 0.7, actor);
    if (actor.hero !== "drill" && actor.hero !== "spin" && impact > (MATERIALS[block.material] || MATERIALS.red).breakImpact) {
      crackBlock(block, cx, cy, impact, actor);
    }
    if (pierce) {
      actor.vx *= 0.9;
      actor.vy *= 0.9;
    } else {
      actor.vx *= -0.22;
      actor.vy *= -0.18;
    }
    cameraShake = Math.min(10, impact * 0.4);
    burst(cx, cy, HEROES[actor.hero].trail, 10);
    score += Math.round(impact * 4);
  }

  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const d = Math.hypot(actor.x - enemy.x, actor.y - enemy.y);
    if (d < actor.r + enemy.r) {
      defeatEnemy(enemy, actor.vx * 0.8, actor.vy * 0.8);
      actor.vx *= 0.72;
      actor.vy *= 0.72;
    }
  }

  if (Math.hypot(actor.vx, actor.vy) < 0.6 && actor.y + actor.r >= groundY - 1) {
    actor.flying = false;
    if (state === "spent" && activePlayers.every((p) => !p.flying || p === actor)) {
      updateUI("All humans used. Restart or try the next level.");
    }
  }
}

function applyFanWind(actor) {
  for (const fan of fans) {
    const zoneX = fan.fx >= 0 ? fan.x : fan.x - 260;
    const zoneY = fan.y - 145;
    const zoneW = 260;
    const zoneH = fan.h + 170;
    if (
      actor.x + actor.r < zoneX ||
      actor.x - actor.r > zoneX + zoneW ||
      actor.y + actor.r < zoneY ||
      actor.y - actor.r > zoneY + zoneH
    ) {
      continue;
    }
    actor.vx += fan.fx;
    actor.vy += fan.fy;
    if (Math.random() > 0.55) {
      particles.push({
        x: fan.fx >= 0 ? fan.x + fan.w : fan.x,
        y: fan.y + 10 + Math.random() * fan.h,
        vx: fan.fx * 10 + (Math.random() - 0.5),
        vy: fan.fy * 10 + (Math.random() - 0.5),
        life: 16 + Math.random() * 12,
        color: "#d8f7ff",
        size: 2 + Math.random() * 4,
      });
    }
  }
}

function usePortals(actor) {
  for (const portal of portals) {
    if (portal.cooldown > 0) continue;
    if (Math.hypot(actor.x - portal.x, actor.y - portal.y) > portal.r + actor.r) continue;
    effects.push({ type: "portal", x: portal.x, y: portal.y, color: portal.color, life: 28 });
    burst(actor.x, actor.y, portal.color, 18);
    actor.x = portal.targetX;
    actor.y = portal.targetY;
    actor.vx *= 1.04;
    actor.vy = Math.min(actor.vy, -4);
    portal.cooldown = 40;
    effects.push({ type: "portal", x: actor.x, y: actor.y, color: portal.color, life: 28 });
    burst(actor.x, actor.y, portal.color, 18);
    updateUI("Whoosh! Portal jump.");
    break;
  }
}

function updateBlocks() {
  for (const block of blocks) {
    if (block.dead) continue;
    if (block.frozen > 0) {
      block.frozen -= 1;
      block.vx = 0;
      block.vy = 0;
      block.spin = 0;
      continue;
    }
    block.vy += gravity * 0.72;
    block.vx *= 0.985;
    block.vy *= 0.99;
    block.x += block.vx;
    block.y += block.vy;
    block.angle += block.spin;
    block.spin *= 0.985;

    if (block.y + block.h > groundY) {
      block.y = groundY - block.h;
      block.vy *= -0.28;
      block.vx *= 0.78;
      block.spin *= 0.7;
      if (Math.abs(block.vy) < 1.2) block.vy = 0;
    }
    if (block.x < 0 || block.x + block.w > W) {
      block.vx *= -0.35;
      block.x = Math.max(0, Math.min(W - block.w, block.x));
    }
  }

  for (let i = 0; i < blocks.length; i += 1) {
    for (let j = i + 1; j < blocks.length; j += 1) {
      resolveBlocks(blocks[i], blocks[j]);
    }
  }
  blocks = blocks.filter((block) => !block.dead);
}

function updateEnemies() {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    enemy.faceTime += 1;
    if (enemy.frozen > 0) {
      enemy.frozen -= 1;
      continue;
    }
    if (enemy.type === "jetpack") updateJetpackEnemy(enemy);
    updateEnemyLaser(enemy);
    const umbrellaLift = enemy.weapon === "umbrella" && enemy.vy > 0 ? 0.52 : 1;
    enemy.vy += (enemy.type === "jetpack" ? gravity * 0.22 : gravity * 0.8) * umbrellaLift;
    enemy.vx *= 0.986;
    enemy.vy *= enemy.weapon === "umbrella" && enemy.vy > 0 ? 0.94 : 0.99;
    const fallImpact = enemy.vy;
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    if (enemy.y + enemy.r > groundY) {
      enemy.y = groundY - enemy.r;
      if (fallImpact > (enemy.weapon === "umbrella" ? 13 : 8.6)) {
        defeatEnemy(enemy, enemy.vx, -fallImpact, "fall");
        continue;
      }
      enemy.vy *= -0.24;
      enemy.vx *= 0.76;
      if (Math.abs(enemy.vy) < 1) enemy.vy = 0;
    }

    for (const block of blocks) {
      if (!circleRect(enemy, block)) continue;
      const speed = Math.hypot(block.vx, block.vy);
      if (speed > 3.4 && enemy.alive) {
        defeatEnemy(enemy, block.vx, block.vy);
      }
      enemy.vx += block.vx * 0.2;
      enemy.vy += block.vy * 0.12 - 1;
    }
  }
}

function updateJetpackEnemy(enemy) {
  let dangerX = 0;
  let dangerY = 0;
  let danger = 0;

  for (const actor of activePlayers) {
    const playerDist = Math.hypot(enemy.x - actor.x, enemy.y - actor.y);
    if (actor.flying && playerDist < 220) {
      const weight = (220 - playerDist) / 220;
      dangerX += (enemy.x - actor.x) * weight;
      dangerY += (enemy.y - actor.y) * weight;
      danger += weight;
    }
  }

  for (const block of blocks) {
    const speed = Math.hypot(block.vx, block.vy);
    if (speed < 2.4) continue;
    const cx = block.x + block.w / 2;
    const cy = block.y + block.h / 2;
    const dist = Math.hypot(enemy.x - cx, enemy.y - cy);
    if (dist > 185) continue;
    const weight = ((185 - dist) / 185) * speed;
    dangerX += (enemy.x - cx) * weight;
    dangerY += (enemy.y - cy) * weight;
    danger += weight;
  }

  if (danger > 0) {
    const len = Math.hypot(dangerX, dangerY) || 1;
    enemy.vx += (dangerX / len) * 0.42;
    enemy.vy += (dangerY / len) * 0.42 - 0.18;
    if (Math.random() > 0.55) burst(enemy.x, enemy.y + enemy.r + 4, "#f7bf3a", 2);
  } else {
    enemy.vx += Math.sin(enemy.faceTime / 34) * 0.035;
    enemy.vy += Math.cos(enemy.faceTime / 28) * 0.035 - 0.18;
  }

  enemy.vx = Math.max(-5.8, Math.min(5.8, enemy.vx));
  enemy.vy = Math.max(-5.4, Math.min(4.2, enemy.vy));
  if (enemy.x < 520) enemy.vx += 0.22;
  if (enemy.x > 1030) enemy.vx -= 0.22;
  if (enemy.y < 110) enemy.vy += 0.24;
  if (enemy.y > 455) enemy.vy -= 0.34;
}

function updateEnemyLaser(enemy) {
  if (enemy.weapon !== "laser") return;
  enemy.laserCooldown -= 1;
  if (enemy.laserCooldown > 0) return;
  const targets = activePlayers.filter((actor) => actor.flying);
  if (!targets.length) {
    enemy.laserCooldown = 35;
    return;
  }
  let target = targets[0];
  let best = Infinity;
  for (const actor of targets) {
    const dist = Math.hypot(actor.x - enemy.x, actor.y - enemy.y);
    if (dist < best) {
      target = actor;
      best = dist;
    }
  }
  if (best > 360) {
    enemy.laserCooldown = 30;
    return;
  }
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const len = Math.hypot(dx, dy) || 1;
  target.vx += (dx / len) * 3.2;
  target.vy += (dy / len) * 2.2 - 1.4;
  effects.push({ type: "laser", x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, life: 18 });
  burst(target.x, target.y, "#ff3b62", 9);
  enemy.laserCooldown = 110 + Math.random() * 80;
}

function crackBlock(block, x, y, impact, actor = player) {
  const spec = MATERIALS[block.material] || MATERIALS.red;
  block.health -= 1;
  block.vx += actor.vx * 0.24;
  block.vy += actor.vy * 0.18;
  if (block.health <= 0 || impact > spec.breakImpact) {
    block.dead = true;
    score += spec.score;
    burst(x, y, spec.color, 16);
  }
}

function updateParticles() {
  particles = particles.filter((p) => p.life > 0);
  for (const p of particles) {
    p.life -= 1;
    p.vy += 0.18;
    p.x += p.vx;
    p.y += p.vy;
  }
}

function updateEffects() {
  effects = effects.filter((effect) => effect.life > 0);
  for (const effect of effects) {
    effect.life -= 1;
  }
}

function updateWeather() {
  if (!weather) return;
  for (const bit of weatherBits) {
    if (weather.name === "rain") {
      bit.x += bit.drift - 1.8;
      bit.y += bit.speed * 5;
    } else if (weather.name === "snow") {
      bit.x += Math.sin(shimmer * 2 + bit.phase) * 0.8;
      bit.y += bit.speed * 0.9;
    } else if (weather.name === "embers") {
      bit.x += bit.drift * 0.5;
      bit.y -= bit.speed * 1.2;
    } else if (weather.name === "aurora") {
      bit.x += bit.drift * 0.25;
      bit.y += Math.sin(shimmer + bit.phase) * 0.25;
    } else {
      bit.x += Math.sin(shimmer + bit.phase) * 0.18;
      bit.y += Math.cos(shimmer + bit.phase) * 0.1;
    }

    if (bit.y > H + 30 || bit.y < -120 || bit.x < -80 || bit.x > W + 80) {
      Object.assign(bit, makeWeatherBit(weather.name !== "embers"));
      if (weather.name === "embers") bit.y = H + 20;
    }
  }
}

function checkEndState() {
  if (enemies.some((enemy) => enemy.alive)) return;
  if (state === "won") return;
  state = "won";
  const bonus = (shots + 1) * 250;
  score += bonus;
  burst(W / 2, 180, "#64d46d", 42);
  updateUI(levelIndex === levels.length - 1 ? "All towers toppled. JUMP JUMP champion!" : "Level cleared. Hit Next.");
}

function defeatEnemy(enemy, vx, vy, reason = "hit") {
  if (!enemy.alive) return;
  enemy.alive = false;
  enemy.vx = vx * 0.35;
  enemy.vy = vy * 0.35 - 4;
  score += 500;
  gems += enemy.type === "jetpack" ? 2 : 1;
  cameraShake = 8;
  smokePoof(enemy.x, enemy.y);
  updateUI(reason === "fall" ? "A face fell too hard and vanished!" : "Enemy vanished in smoke!");
}

function resolveBlocks(a, b) {
  if (a.dead || b.dead) return;
  const overlapX = Math.min(a.x + a.w - b.x, b.x + b.w - a.x);
  const overlapY = Math.min(a.y + a.h - b.y, b.y + b.h - a.y);
  if (overlapX <= 0 || overlapY <= 0) return;

  if (overlapX < overlapY) {
    const push = overlapX / 2;
    if (a.x < b.x) {
      a.x -= push;
      b.x += push;
    } else {
      a.x += push;
      b.x -= push;
    }
    const av = a.vx;
    a.vx = b.vx * 0.42;
    b.vx = av * 0.42;
  } else {
    const push = overlapY / 2;
    if (a.y < b.y) {
      a.y -= push;
      b.y += push;
    } else {
      a.y += push;
      b.y -= push;
    }
    const av = a.vy;
    a.vy = b.vy * 0.32;
    b.vy = av * 0.32;
  }
}

function circleRect(circle, rect) {
  const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  return Math.hypot(circle.x - cx, circle.y - cy) < circle.r;
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 18 + Math.random() * 24,
      color,
      size: 3 + Math.random() * 5,
    });
  }
}

function smokePoof(x, y) {
  for (let i = 0; i < 30; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 4.2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.6,
      life: 30 + Math.random() * 24,
      color: Math.random() > 0.45 ? "#d7d2c6" : "#80786d",
      size: 7 + Math.random() * 12,
      smoke: true,
    });
  }
}

function draw() {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  const shakeX = (Math.random() - 0.5) * cameraShake;
  const shakeY = (Math.random() - 0.5) * cameraShake;
  ctx.translate(shakeX, shakeY);
  drawSky();
  drawWeatherBack();
  drawPortalsAndFans();
  drawSlingshot();
  drawBlocks();
  drawEnemies();
  for (const actor of activePlayers) drawPlayer(actor);
  if (player) drawPlayer(player);
  drawEffects();
  drawParticles();
  drawWeatherFront();
  drawSceneTint();
  drawOverlay();
  ctx.restore();
}

function drawSky() {
  const mood = weather || WEATHER_TYPES[0];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, mood.sky[0]);
  grad.addColorStop(0.48, mood.sky[1]);
  grad.addColorStop(1, mood.sky[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.18, H * 0.15, 20, W * 0.18, H * 0.15, 420);
  glow.addColorStop(0, "rgba(255,255,255,0.38)");
  glow.addColorStop(0.42, "rgba(255,210,105,0.16)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  if (mood.name === "aurora") {
    for (let i = 0; i < 5; i += 1) {
      const x = 100 + i * 210 + Math.sin(shimmer + i) * 28;
      const aurora = ctx.createLinearGradient(x, 0, x + 80, groundY);
      aurora.addColorStop(0, "rgba(117,255,205,0)");
      aurora.addColorStop(0.42, "rgba(117,255,205,0.22)");
      aurora.addColorStop(1, "rgba(95,112,255,0)");
      ctx.fillStyle = aurora;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 80, 130, x - 80, 280, x + 70, groundY);
      ctx.lineTo(x + 150, groundY);
      ctx.bezierCurveTo(x + 10, 280, x + 170, 130, x + 90, 0);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.fillStyle = "#5f7e58";
  for (let i = 0; i < 12; i += 1) {
    const x = i * 102 - 20;
    ctx.beginPath();
    ctx.ellipse(x + 36, groundY - 12 - (i % 3) * 8, 48, 26, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
  groundGrad.addColorStop(0, "#5e8d46");
  groundGrad.addColorStop(1, "#203b2a");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = "#2c472d";
  for (let x = 0; x < W; x += 34) {
    roundedRect(x, groundY + 8 + (x % 3) * 3, 18, 4, 2);
    ctx.fill();
  }
}

function drawWeatherBack() {
  if (!weather) return;
  ctx.save();
  if (weather.name === "clear" || weather.name === "aurora") {
    for (const bit of weatherBits) {
      ctx.globalAlpha = weather.name === "aurora" ? 0.38 : 0.28;
      ctx.fillStyle = weather.name === "aurora" ? "#86ffd4" : "#fff2a6";
      ctx.beginPath();
      ctx.arc(bit.x, bit.y, bit.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (weather.name === "embers") {
    ctx.globalAlpha = 0.35;
    for (const bit of weatherBits) {
      ctx.fillStyle = "#ffb14a";
      ctx.fillRect(bit.x, bit.y, bit.size, bit.size * 1.6);
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawWeatherFront() {
  if (!weather) return;
  ctx.save();
  if (weather.name === "rain") {
    ctx.strokeStyle = "rgba(198,236,255,0.58)";
    ctx.lineWidth = 2;
    for (const bit of weatherBits) {
      ctx.beginPath();
      ctx.moveTo(bit.x, bit.y);
      ctx.lineTo(bit.x - 16, bit.y + 28);
      ctx.stroke();
    }
  }
  if (weather.name === "snow") {
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    for (const bit of weatherBits) {
      ctx.beginPath();
      ctx.arc(bit.x, bit.y, bit.size * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (weather.name === "embers") {
    for (const bit of weatherBits) {
      const ember = ctx.createRadialGradient(bit.x, bit.y, 0, bit.x, bit.y, bit.size * 3);
      ember.addColorStop(0, "rgba(255,226,112,0.8)");
      ember.addColorStop(1, "rgba(255,78,34,0)");
      ctx.fillStyle = ember;
      ctx.fillRect(bit.x - bit.size * 3, bit.y - bit.size * 3, bit.size * 6, bit.size * 6);
    }
  }
  ctx.restore();
}

function drawSceneTint() {
  if (!weather) return;
  ctx.save();
  ctx.fillStyle = weather.tint;
  ctx.fillRect(0, 0, W, H);
  const vignette = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 720);
  vignette.addColorStop(0, "rgba(255,255,255,0)");
  vignette.addColorStop(1, "rgba(10,12,28,0.25)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawSlingshot() {
  ctx.lineCap = "round";
  ctx.lineWidth = 17;
  ctx.strokeStyle = "#6d3f1d";
  ctx.beginPath();
  ctx.moveTo(sling.x, groundY);
  ctx.lineTo(sling.x, sling.y - 8);
  ctx.moveTo(sling.x, sling.y + 8);
  ctx.lineTo(sling.x - 45, sling.y - 70);
  ctx.moveTo(sling.x, sling.y + 8);
  ctx.lineTo(sling.x + 44, sling.y - 70);
  ctx.stroke();

  ctx.lineWidth = 7;
  ctx.strokeStyle = "#2b1a0d";
  ctx.stroke();

  if (state === "ready") {
    ctx.lineWidth = 9;
    ctx.strokeStyle = "#9d1117";
    ctx.beginPath();
    ctx.moveTo(sling.x - 45, sling.y - 70);
    ctx.lineTo(player.x, player.y);
    ctx.lineTo(sling.x + 44, sling.y - 70);
    ctx.stroke();
  }
}

function drawPortalsAndFans() {
  for (const portal of portals) {
    ctx.save();
    ctx.translate(portal.x, portal.y);
    const pulse = Math.sin(Date.now() / 120) * 4;
    const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, portal.r * 2.3);
    aura.addColorStop(0, `${portal.color}66`);
    aura.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = aura;
    ctx.fillRect(-portal.r * 3, -portal.r * 3, portal.r * 6, portal.r * 6);
    ctx.strokeStyle = portal.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, portal.r * 0.72 + pulse, portal.r + pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, portal.r * 0.42, portal.r * 0.72, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (const fan of fans) {
    const blowingRight = fan.fx >= 0;
    ctx.save();
    ctx.translate(fan.x, fan.y);
    ctx.fillStyle = "#233944";
    roundedRect(0, 0, fan.w, fan.h, 12);
    ctx.fill();
    ctx.strokeStyle = "#0a1318";
    ctx.lineWidth = 4;
    roundedRect(0, 0, fan.w, fan.h, 12);
    ctx.stroke();
    ctx.fillStyle = "#9fb5bf";
    ctx.beginPath();
    ctx.arc(fan.w / 2, fan.h / 2, Math.min(fan.w, fan.h) * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d8f7ff";
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i += 1) {
      const y = 8 + i * (fan.h - 16) / 3;
      ctx.beginPath();
      ctx.moveTo(blowingRight ? fan.w + 12 : -12, y);
      ctx.lineTo(blowingRight ? fan.w + 72 : -72, y + fan.fy * 28);
      ctx.stroke();
    }
    ctx.fillStyle = "#f7bf3a";
    ctx.beginPath();
    if (blowingRight) {
      ctx.moveTo(fan.w + 76, fan.h / 2);
      ctx.lineTo(fan.w + 58, fan.h / 2 - 10);
      ctx.lineTo(fan.w + 58, fan.h / 2 + 10);
    } else {
      ctx.moveTo(-76, fan.h / 2);
      ctx.lineTo(-58, fan.h / 2 - 10);
      ctx.lineTo(-58, fan.h / 2 + 10);
    }
    ctx.fill();
    ctx.restore();
  }
}

function drawBlocks() {
  for (const block of blocks) {
    const spec = MATERIALS[block.material] || MATERIALS.red;
    ctx.save();
    ctx.translate(block.x + block.w / 2, block.y + block.h / 2);
    ctx.rotate(block.angle);
    const blockGrad = ctx.createLinearGradient(-block.w / 2, -block.h / 2, block.w / 2, block.h / 2);
    blockGrad.addColorStop(0, block.frozen > 0 ? "#e8fbff" : "rgba(255,255,255,0.38)");
    blockGrad.addColorStop(0.28, block.frozen > 0 ? "#a8e8ff" : block.color);
    blockGrad.addColorStop(1, block.frozen > 0 ? "#4b9fba" : spec.stroke);
    ctx.shadowColor = block.frozen > 0 ? "#9bdfff" : "rgba(255,220,150,0.22)";
    ctx.shadowBlur = block.frozen > 0 ? 14 : 5;
    ctx.fillStyle = blockGrad;
    roundedRect(-block.w / 2, -block.h / 2, block.w, block.h, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = block.frozen > 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.15)";
    roundedRect(-block.w / 2 + 5, -block.h / 2 + 5, block.w - 10, 6, 3);
    ctx.fill();
    if (block.material === "wood") {
      ctx.fillStyle = "rgba(58,31,13,0.34)";
      roundedRect(-block.w / 2 + 5, -block.h / 2 + 15, block.w - 10, 4, 2);
      ctx.fill();
      roundedRect(-block.w / 2 + 5, block.h / 2 - 12, block.w - 10, 3, 2);
      ctx.fill();
    }
    if (block.material === "stone") {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      roundedRect(-block.w / 2 + 8, -block.h / 2 + 18, 10, 5, 3);
      ctx.fill();
      roundedRect(block.w / 2 - 20, block.h / 2 - 18, 12, 5, 3);
      ctx.fill();
    }
    if (block.material === "iron") {
      ctx.fillStyle = "rgba(255,255,255,0.42)";
      roundedRect(-block.w / 2 + 6, -block.h / 2 + 8, block.w - 12, 5, 3);
      ctx.fill();
      ctx.fillStyle = "#56666d";
      ctx.beginPath();
      ctx.arc(-block.w / 2 + 10, block.h / 2 - 9, 3.5, 0, Math.PI * 2);
      ctx.arc(block.w / 2 - 10, block.h / 2 - 9, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = block.frozen > 0 ? "#417f9b" : spec.stroke;
    ctx.lineWidth = 3;
    roundedRect(-block.w / 2, -block.h / 2, block.w, block.h, 7);
    ctx.stroke();
    ctx.restore();
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (enemy.weapon === "umbrella") {
      ctx.fillStyle = "#6ed0ff";
      ctx.strokeStyle = "#225c75";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-28, -24);
      ctx.quadraticCurveTo(0, -56, 28, -24);
      ctx.quadraticCurveTo(14, -31, 0, -24);
      ctx.quadraticCurveTo(-14, -31, -28, -24);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#225c75";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(0, -2);
      ctx.stroke();
    }
    if (enemy.type === "jetpack") {
      ctx.fillStyle = "#37444d";
      roundedRect(-25, -2, 9, 26, 5);
      ctx.fill();
      roundedRect(16, -2, 9, 26, 5);
      ctx.fill();
      ctx.fillStyle = "#ff8a24";
      ctx.beginPath();
      ctx.ellipse(-20, 28, 5, 10 + Math.sin(enemy.faceTime / 3) * 3, 0, 0, Math.PI * 2);
      ctx.ellipse(20, 28, 5, 10 + Math.cos(enemy.faceTime / 3) * 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f7d84a";
    } else {
      ctx.fillStyle = enemy.frozen > 0 ? "#9bdfff" : "#cf5432";
    }
    ctx.shadowColor = enemy.type === "jetpack" ? "#ffe45c" : enemy.frozen > 0 ? "#9bdfff" : "#ff6d42";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = enemy.type === "jetpack" ? "#8f6c16" : enemy.frozen > 0 ? "#417f9b" : "#78301d";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#401510";
    ctx.beginPath();
    ctx.arc(-7, -5, 3.5, 0, Math.PI * 2);
    ctx.arc(7, -5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#401510";
    ctx.beginPath();
    ctx.arc(0, 12, 9, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-13, -13);
    ctx.lineTo(-2, -9);
    ctx.moveTo(13, -13);
    ctx.lineTo(2, -9);
    ctx.stroke();
    if (enemy.weapon === "laser") {
      ctx.fillStyle = "#2b1420";
      roundedRect(-19, 1, 10, 12, 4);
      ctx.fill();
      roundedRect(9, 1, 10, 12, 4);
      ctx.fill();
      ctx.fillStyle = "#ff3b62";
      ctx.beginPath();
      ctx.arc(-14, 7, 3, 0, Math.PI * 2);
      ctx.arc(14, 7, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawPlayer(actor) {
  const hero = HEROES[actor.hero];
  if (actor.trail.length) {
    for (let i = actor.trail.length - 1; i >= 0; i -= 1) {
      const t = actor.trail[i];
      ctx.globalAlpha = (actor.trail.length - i) / actor.trail.length * 0.18;
      ctx.fillStyle = hero.trail;
      ctx.beginPath();
      ctx.arc(t.x, t.y, actor.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.translate(actor.x, actor.y);
  ctx.scale(actor.face, 1);
  ctx.shadowColor = hero.trail;
  ctx.shadowBlur = actor.flying ? 14 : 7;
  ctx.fillStyle = "#f0b17f";
  ctx.beginPath();
  ctx.ellipse(0, -20, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = actor.hero === "spin" ? "#dbeeff" : actor.hero === "frozo" ? "#ed9b5a" : "#a84322";
  ctx.beginPath();
  ctx.ellipse(0, -32, 15, 8, -0.1, Math.PI, Math.PI * 2);
  ctx.ellipse(2, -39, 11, 7, -0.1, Math.PI, Math.PI * 2);
  ctx.fill();
  drawHat(currentHat);
  ctx.fillStyle = hero.color;
  roundedRect(-11, -12, 22, 24, 8);
  ctx.fill();
  ctx.fillStyle = actor.hero === "frozo" ? "#9bdfff" : actor.hero === "drill" ? "#f1d193" : "#d46d1c";
  roundedRect(-19, actor.hero === "drill" ? -20 : -13, actor.hero === "drill" ? 25 : 8, 8, 5);
  ctx.fill();
  roundedRect(10, actor.hero === "drill" ? -20 : -13, actor.hero === "drill" ? 25 : 8, 8, 5);
  ctx.fill();
  ctx.fillStyle = "#26336d";
  roundedRect(-11, 9, 8, 18, 4);
  ctx.fill();
  roundedRect(3, 9, 8, 18, 4);
  ctx.fill();
  ctx.fillStyle = "#f0c64d";
  roundedRect(-15, 26, 14, 6, 3);
  ctx.fill();
  roundedRect(2, 26, 14, 6, 3);
  ctx.fill();
  ctx.fillStyle = "#332015";
  ctx.beginPath();
  ctx.arc(-4, -22, 2, 0, Math.PI * 2);
  ctx.arc(5, -22, 2, 0, Math.PI * 2);
  ctx.fill();
  if (actor.hero === "drill") {
    ctx.fillStyle = "#c87520";
    ctx.beginPath();
    ctx.moveTo(18, -16);
    ctx.lineTo(34, -9);
    ctx.lineTo(18, -2);
    ctx.fill();
  }
  if (actor.hero === "spin") {
    ctx.strokeStyle = "#7fe6ff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -6, 28, 0, Math.PI * 1.6);
    ctx.stroke();
  }
  if (actor.hero === "frozo") {
    ctx.strokeStyle = "#d8f7ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -7, 24, 0.3, Math.PI * 1.4);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawHat(hat) {
  if (hat === "cowboy") {
    ctx.fillStyle = "#7b4b20";
    roundedRect(-18, -42, 36, 6, 3);
    ctx.fill();
    roundedRect(-10, -52, 20, 12, 5);
    ctx.fill();
    ctx.fillStyle = "#d5a456";
    roundedRect(-9, -43, 18, 3, 2);
    ctx.fill();
  }
  if (hat === "space") {
    ctx.strokeStyle = "#d8f7ff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -27, 19, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(155,223,255,0.25)";
    roundedRect(-14, -34, 28, 11, 5);
    ctx.fill();
  }
}

function drawEffects() {
  for (const effect of effects) {
    const alpha = Math.max(0, effect.life / 34);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (effect.type === "zap") {
      ctx.strokeStyle = "#fff064";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(effect.x1, effect.y1);
      const mx = (effect.x1 + effect.x2) / 2 + (Math.random() - 0.5) * 32;
      const my = (effect.y1 + effect.y2) / 2 + (Math.random() - 0.5) * 32;
      ctx.lineTo(mx, my);
      ctx.lineTo(effect.x2, effect.y2);
      ctx.stroke();
    }
    if (effect.type === "freeze") {
      ctx.strokeStyle = "#d8f7ff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * (1.1 - alpha * 0.25), 0, Math.PI * 2);
      ctx.stroke();
    }
    if (effect.type === "portal") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 46 * (1.1 - alpha * 0.35), 0, Math.PI * 2);
      ctx.stroke();
    }
    if (effect.type === "laser") {
      ctx.strokeStyle = "#ff3b62";
      ctx.lineWidth = 5;
      ctx.shadowColor = "#ff3b62";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(effect.x1, effect.y1);
      ctx.lineTo(effect.x2, effect.y2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.78)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(effect.x1, effect.y1);
      ctx.lineTo(effect.x2, effect.y2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 42);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.smoke ? 0 : 8;
    if (p.smoke) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawOverlay() {
  if (state === "ready" && player) {
    const dx = sling.x - player.x;
    const dy = sling.y - player.y;
    const pull = Math.hypot(dx, dy);
    if (pull > 8) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x + dx * 2.2, player.y + dy * 2.2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  if (state === "won") {
    ctx.fillStyle = "rgba(17, 25, 31, 0.72)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#f7bf3a";
    ctx.font = "700 62px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL CLEARED", W / 2, 240);
    ctx.fillStyle = "#f8f1de";
    ctx.font = "24px Trebuchet MS";
    ctx.fillText(levelIndex === levels.length - 1 ? "Restart for another run." : "Press Next for a bigger tower.", W / 2, 286);
    ctx.textAlign = "start";
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("mousedown", pointerDown);
canvas.addEventListener("mousemove", pointerMove);
window.addEventListener("mouseup", pointerUp);
canvas.addEventListener("touchstart", pointerDown, { passive: false });
canvas.addEventListener("touchmove", pointerMove, { passive: false });
window.addEventListener("touchend", pointerUp);

for (const button of ui.heroButtons) {
  button.addEventListener("click", () => {
    if (usedHeroes.has(button.dataset.hero)) return;
    selectedHero = button.dataset.hero;
    if (state === "ready" || state === "spent") {
      player = makePlayer();
      state = shots > 0 ? "ready" : state;
    }
    updateUI(`${HEROES[selectedHero].name} selected. ${HEROES[selectedHero].message}`);
  });
}

ui.restart.addEventListener("click", () => resetLevel(false));
ui.next.addEventListener("click", () => {
  levelIndex = (levelIndex + 1) % levels.length;
  resetLevel(true);
});
ui.towerStart.addEventListener("click", startTower);
for (const card of ui.fortuneCards) {
  card.addEventListener("click", () => pickTowerCard(Number(card.dataset.card)));
}

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") resetLevel(false);
  if (event.key.toLowerCase() === "n") {
    levelIndex = (levelIndex + 1) % levels.length;
    resetLevel(true);
  }
});

resetLevel(false);
loop();
