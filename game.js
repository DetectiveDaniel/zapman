const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const seekList = document.querySelector("#seekList");
const foundCount = document.querySelector("#foundCount");
const heartsDisplay = document.querySelector("#hearts");
const levelName = document.querySelector("#levelName");
const perspectiveName = document.querySelector("#perspectiveName");
const message = document.querySelector("#message");
const restart = document.querySelector("#restart");
const nextLevel = document.querySelector("#nextLevel");
const removeAbilities = document.querySelector("#removeAbilities");
const mobileControls = document.querySelector(".mobile-controls");

const world = { width: 2200, height: 1500 };
const targetNames = [
  "Max",
  "Connor",
  "Andrea",
  "Clara",
  "William",
  "Dalia",
  "Sophia",
  "Toby",
  "Evie",
  "Another Max",
  "Lorenco",
  "Frank",
  "Mrs Grove",
];

const laterLevelTargetNames = [
  "Maya",
  "Nora",
  "Glynis",
  "Daniel A",
  "Daniel G",
  "Nola",
  "Bob",
];

const decoyNames = [
  "Sam",
  "Poppy",
  "Grace",
  "Noah",
  "Mia",
  "Oliver",
  "Ava",
  "Leo",
  "Ruby",
  "Jack",
  "Lily",
  "Oscar",
  "Ella",
  "Isaac",
  "Amelia",
  "Harry",
  "Ivy",
  "Archie",
  "Sienna",
  "George",
  "Freya",
  "Theo",
  "Zara",
  "Lucas",
  "Eliza",
];

const biomes = [
  {
    name: "Baskerville Map",
    ground: "#284421",
    grid: "rgba(255, 255, 255, 0.05)",
    scenery: ["tree", "bush", "log"],
    colors: { tree: "#315f2a", bush: "#5d7e38", trunk: "#5a3420", rock: "#81745f" },
    message: "Level 1: Baskerville Map. Find everyone across the sketch lands!",
  },
  {
    name: "Snow and Runes",
    ground: "#d9edf2",
    grid: "rgba(37, 80, 96, 0.13)",
    scenery: ["pine", "snowdrift", "ice"],
    colors: { tree: "#2a6a61", bush: "#f4fbff", trunk: "#6d4d36", rock: "#a4c5cf" },
    message: "Level 2: Snowy Playground. Maya, Nora, Glynis, both Daniels, Nola, and Bob join in.",
  },
  {
    name: "Desert and Forest",
    ground: "#dcb66f",
    grid: "rgba(104, 70, 28, 0.13)",
    scenery: ["palm", "shell", "umbrella"],
    colors: { tree: "#3f8b4b", bush: "#e56d4f", trunk: "#87522f", rock: "#f8e1a1" },
    message: "Level 3: Sandy Beach. Everyone is hiding in the sunshine.",
  },
  {
    name: "Ruins and Lava Lands",
    ground: "#303846",
    grid: "rgba(226, 232, 255, 0.08)",
    scenery: ["tower", "bramble", "stone"],
    colors: { tree: "#26312c", bush: "#573b69", trunk: "#766f82", rock: "#858c9a" },
    message: "Level 4: Moonlit Castle. Mrs Grove is somewhere in the dark.",
  },
];

const mapRegions = [
  {
    name: "Snow",
    fill: "#dce8f2",
    text: [120, 240],
    points: [[0, 0], [280, 0], [245, 260], [110, 325], [0, 280]],
  },
  {
    name: "Baskerville",
    fill: "#9fb7e1",
    text: [740, 190],
    points: [[280, 0], [1260, 0], [1380, 430], [1170, 520], [740, 460], [245, 260]],
  },
  {
    name: "The Runes",
    fill: "#8ba4d1",
    text: [480, 640],
    points: [[0, 280], [245, 260], [740, 460], [720, 820], [560, 900], [0, 760]],
  },
  {
    name: "Desert",
    fill: "#d7b06d",
    text: [190, 980],
    points: [[0, 760], [560, 900], [760, 1500], [0, 1500]],
  },
  {
    name: "Forest",
    fill: "#77a969",
    text: [1030, 1180],
    points: [[560, 900], [720, 820], [1260, 1020], [1790, 1190], [1870, 1500], [760, 1500]],
  },
  {
    name: "The Ruins",
    fill: "#a4a0b0",
    text: [1300, 720],
    points: [[720, 820], [740, 460], [1170, 520], [1380, 430], [1505, 1060], [1260, 1020]],
  },
  {
    name: "Lava Lands",
    fill: "#c06a4d",
    text: [1835, 580],
    points: [[1260, 0], [2200, 0], [2200, 1500], [1870, 1500], [1790, 1190], [1505, 1060], [1380, 430]],
  },
];

const secondMapRegions = [
  {
    name: "Cheese Land",
    fill: "#f2cf58",
    text: [390, 250],
    points: [[0, 0], [1080, 0], [1020, 390], [700, 520], [0, 560]],
  },
  {
    name: "Rainforest",
    fill: "#4f9d5a",
    text: [1690, 270],
    points: [[1080, 0], [2200, 0], [2200, 615], [1745, 650], [1020, 390]],
  },
  {
    name: "Bridge Town",
    fill: "#b68d66",
    text: [525, 870],
    points: [[0, 560], [700, 520], [940, 840], [675, 1500], [0, 1500]],
  },
  {
    name: "Lightning City",
    fill: "#7488b6",
    text: [1345, 790],
    points: [[700, 520], [1020, 390], [1745, 650], [1710, 960], [1200, 1080], [940, 840]],
  },
  {
    name: "Scarve City",
    fill: "#96a76f",
    text: [1310, 1235],
    points: [[675, 1500], [940, 840], [1200, 1080], [1710, 960], [2200, 1180], [2200, 1500]],
  },
];

const adventureMaps = [
  {
    name: "Baskerville Map",
    background: "#bfd0ef",
    regions: mapRegions,
    order: ["Snow", "The Runes", "Desert", "Forest", "Lava Lands", "The Ruins"],
    landmarks: null,
  },
  {
    name: "Different Map",
    background: "#cbe4f2",
    regions: secondMapRegions,
    order: ["Cheese Land", "Bridge Town", "Rainforest", "Lightning City", "Scarve City"],
    landmarks: [
      { type: "cheese", x: 340, y: 250, size: 92 },
      { type: "cheese", x: 760, y: 325, size: 72 },
      { type: "tower", x: 1080, y: 140, size: 90 },
      { type: "tree", x: 1500, y: 255, size: 96 },
      { type: "pine", x: 1760, y: 345, size: 78 },
      { type: "pine", x: 1990, y: 280, size: 82 },
      { type: "bridge-house", x: 350, y: 965, size: 210 },
      { type: "bolt", x: 1120, y: 670, size: 85 },
      { type: "bolt", x: 1415, y: 865, size: 78 },
      { type: "bolt", x: 1645, y: 760, size: 70 },
      { type: "golf-flag", x: 1660, y: 1265, size: 120 },
      { type: "hole", x: 980, y: 1270, size: 64 },
      { type: "hole", x: 1180, y: 1375, size: 58 },
    ],
  },
];

const regionMissions = {
  Snow: ["Sophia", "Evie", "Nora"],
  Baskerville: ["Mrs Grove", "Andrea", "William"],
  "The Runes": ["Clara", "Dalia", "Frank"],
  Desert: ["Toby", "Another Max", "Bob"],
  Forest: ["Lorenco", "Max", "Daniel A", "Connor"],
  "The Ruins": ["Magic Key 1", "Magic Key 2", "Magic Key 3"],
  "Lava Lands": ["Maya", "Max", "Connor", "Mrs Grove"],
  "Cheese Land": ["Max", "Connor", "Maya"],
  "Bridge Town": ["Andrea", "Clara", "Daniel G"],
  Rainforest: ["William", "Dalia", "Nola"],
  "Lightning City": ["Sophia", "Toby", "Evie"],
  "Scarve City": ["Another Max", "Frank", "Glynis", "Bob"],
};

const fixedLandmarks = [
  { type: "castle", x: 365, y: 155, size: 72 },
  { type: "snowman", x: 125, y: 395, size: 58 },
  { type: "portal", x: 930, y: 680, size: 145 },
  { type: "pine", x: 820, y: 1010, size: 78 },
  { type: "pine", x: 1480, y: 1330, size: 82 },
  { type: "crane", x: 1815, y: 210, size: 135 },
  { type: "lava-rock", x: 1985, y: 770, size: 86 },
  { type: "waterfall", x: 1940, y: 1080, size: 104 },
  { type: "cactus", x: 365, y: 1260, size: 72 },
  { type: "cave", x: 125, y: 1215, size: 64 },
  { type: "hole", x: 940, y: 390, size: 74 },
  { type: "totem", x: 1700, y: 865, size: 60 },
  { type: "statue", x: 1180, y: 270, size: 70 },
];

const keys = new Set();
const mouse = { active: false, x: 0, y: 0 };
const perspectives = [
  { name: "Map View", zoom: 1 },
  { name: "First Person", zoom: 1 },
];
let currentLevelIndex = 0;
let currentMapIndex = 0;
let unlockedRegionIndex = 0;
let completedRegions = new Set();
let teleportTimer = 0;
let poisonTimer = 0;
let poisoned = false;
let perspectiveIndex = 0;
let gameStarted = false;
let selectedRegion = null;
let player;
let people = [];
let scenery = [];
let hazards = [];
let pickups = [];
let camera = { x: 0, y: 0 };
let gameWon;
let flashTimer;
let hearts;
let damageCooldown;
let snowDrainTimer;
let mazeMode;
let superPower;
let keysReadyAnnounced;
let firstPersonPlace = "street";
let heavenMode = false;
let heavenPlace = "clouds";
let coins = 0;
let revivers = 0;
let aiCompanions = 0;
let missionStart = null;
let screen = "menu";
let cheatsEnabled = false;
let portalCompleted = false;
let zapEffects = [];
let slashEffects = [];
let chocBoosts = 0;
let hasZapSlash = false;
const shirtPalette = [
  "#71c7ff",
  "#ff6969",
  "#9ee493",
  "#f7d66b",
  "#c084fc",
  "#ff9f43",
  "#49d6ff",
  "#f472b6",
  "#a3e635",
  "#f6f1df",
];
const defaultMultiplayerNames = [
  "Tim",
  "Jess",
  "Alex",
  "Sam",
  "Chris",
  "Amy",
  "Jay",
  "Mike",
  "Nora",
  "Max",
  "Clara",
  "Toby",
  "Evie",
  "Dalia",
  "Sophia",
  "Bob",
  "Maya",
  "Frank",
  "Nola",
  "Glynis",
  "Connor",
  "Andrea",
  "William",
  "Lorenco",
  "Daniel",
  "Rose",
  "Henry",
  "Jack",
  "Lily",
  "Oscar",
];
let multiplayerEnabled = false;
let multiplayerPlayerCount = 1;
let multiplayerCountText = "1";
let selectedShirtPlayer = 0;
let multiplayerEditMode = "count";
let multiplayerShirts = Array.from({ length: 30 }, (_, index) => shirtPalette[index % shirtPalette.length]);
let multiplayerNames = Array.from({ length: 30 }, (_, index) => defaultMultiplayerNames[index]);
let multiplayerPlayers = [];
let activeMultiplayerIndex = 0;

const mazeWalls = [
  [0, 0, 1024, 24],
  [0, 616, 1024, 24],
  [0, 0, 24, 640],
  [1000, 0, 24, 640],
  [24, 70, 120, 24],
  [205, 24, 24, 118],
  [300, 70, 208, 24],
  [575, 24, 24, 150],
  [650, 70, 260, 24],
  [86, 155, 210, 24],
  [86, 155, 24, 132],
  [205, 220, 24, 190],
  [300, 155, 24, 132],
  [388, 155, 230, 24],
  [388, 155, 24, 200],
  [500, 240, 24, 190],
  [650, 155, 24, 105],
  [735, 155, 210, 24],
  [735, 155, 24, 130],
  [890, 220, 24, 165],
  [24, 340, 120, 24],
  [86, 340, 24, 150],
  [270, 300, 140, 24],
  [270, 300, 24, 210],
  [365, 430, 210, 24],
  [575, 315, 24, 220],
  [650, 315, 260, 24],
  [650, 315, 24, 120],
  [735, 430, 210, 24],
  [890, 430, 24, 125],
  [145, 505, 210, 24],
  [435, 530, 210, 24],
  [725, 530, 210, 24],
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function activeBiome() {
  return biomes[currentLevelIndex];
}

function activeMap() {
  return adventureMaps[currentMapIndex];
}

function activeMapRegions() {
  return activeMap().regions;
}

function activeMapLandmarks() {
  return activeMap().landmarks || fixedLandmarks;
}

function currentUnlockOrder() {
  return activeMap().order;
}

function isRegionUnlocked(region) {
  const index = currentUnlockOrder().indexOf(region.name);
  return index >= 0 && index <= unlockedRegionIndex;
}

function isRegionCompleted(region) {
  return completedRegions.has(`${currentMapIndex}:${region.name}`);
}

function clampPlayerCount(value) {
  return clamp(Number.parseInt(value, 10) || 1, 1, 30);
}

function setMultiplayerCount(value) {
  multiplayerPlayerCount = clampPlayerCount(value);
  multiplayerCountText = String(multiplayerPlayerCount);
  if (selectedShirtPlayer >= multiplayerPlayerCount) {
    selectedShirtPlayer = multiplayerPlayerCount - 1;
  }
}

function multiplayerLabel(index) {
  const rawName = (multiplayerNames[index] || "").trim() || `Player${index + 1}`;
  return `P${index + 1}_${rawName}`;
}

function setMultiplayerName(index, name) {
  multiplayerNames[index] = name.replace(/[^a-z0-9 _-]/gi, "").slice(0, 10);
}

function startMultiplayerAdventure() {
  multiplayerEnabled = multiplayerPlayerCount > 1;
  activeMultiplayerIndex = 0;
  beginAdventure();
  showMessage(
    multiplayerEnabled
      ? `${multiplayerPlayerCount} players joined. Choose an unlocked place.`
      : "1 player mode. Choose an unlocked place.",
    2600,
  );
}

function spawnMultiplayerPlayers(start) {
  multiplayerPlayers = [];
  activeMultiplayerIndex = 0;
  const count = multiplayerEnabled ? multiplayerPlayerCount : 1;
  for (let index = 1; index < count; index += 1) {
    multiplayerPlayers.push({
      playerIndex: index,
      x: start.x - 34 - index * 10,
      y: start.y + 34 + (index % 4) * 8,
      wiggle: randomBetween(0, Math.PI * 2),
    });
  }
}

function updateMultiplayerPlayers() {
  if (!gameStarted || mazeMode || !player || multiplayerPlayers.length === 0) {
    return;
  }

  multiplayerPlayers.forEach((mate, index) => {
    const targetPoint = player.trail[(index + 2) * 14] || player;
    const offsetX = ((index % 5) - 2) * 16;
    const offsetY = 34 + Math.floor(index / 5) * 12;
    mate.x += (targetPoint.x + offsetX - mate.x) * 0.09;
    mate.y += (targetPoint.y + offsetY - mate.y) * 0.09;
    mate.wiggle += 0.08;
  });
}

function switchPlayablePlayer() {
  const count = multiplayerEnabled ? multiplayerPlayerCount : 1;
  if (!gameStarted || !player || heavenMode || mazeMode || count <= 1) {
    showMessage("Start multiplayer first, then F3 can switch players.", 1400);
    return;
  }

  const nextIndex = (activeMultiplayerIndex + 1) % count;
  const nextMateSlot = multiplayerPlayers.findIndex((mate) => mate.playerIndex === nextIndex);
  if (nextMateSlot === -1) {
    return;
  }

  const nextMate = multiplayerPlayers.splice(nextMateSlot, 1)[0];
  multiplayerPlayers.push({
    playerIndex: activeMultiplayerIndex,
    x: player.x,
    y: player.y,
    wiggle: randomBetween(0, Math.PI * 2),
  });

  activeMultiplayerIndex = nextIndex;
  player.x = clamp(nextMate.x, player.radius, world.width - player.radius);
  player.y = clamp(nextMate.y, player.radius, world.height - player.radius);
  player.trail = [];
  player.fpOffset = 0;
  player.fpDepth = 0;
  player.height = 0;
  firstPersonPlace = "street";
  updateCamera();
  showMessage(`${multiplayerLabel(activeMultiplayerIndex)} is playable.`, 1400);
}

function activePerspective() {
  return perspectives[perspectiveIndex];
}

function isFirstPerson() {
  return activePerspective().name === "First Person";
}

function viewWidth() {
  return canvas.width / activePerspective().zoom;
}

function viewHeight() {
  return canvas.height / activePerspective().zoom;
}

function activeTargetNames() {
  if (!selectedRegion) {
    return [];
  }
  return regionMissions[selectedRegion.name] || targetNames;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const crosses = yi > point.y !== yj > point.y
      && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (crosses) {
      inside = !inside;
    }
  }
  return inside;
}

function regionAt(point) {
  return activeMapRegions().find((region) => pointInPolygon(point, region.points));
}

function randomPointInRegion(region) {
  const xs = region.points.map((point) => point[0]);
  const ys = region.points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const point = {
      x: randomBetween(minX + 45, maxX - 45),
      y: randomBetween(minY + 45, maxY - 45),
    };
    if (pointInPolygon(point, region.points)) {
      return point;
    }
  }

  return { x: region.text[0], y: region.text[1] };
}

function makeHazard(type, region, index = 0) {
  let spot = randomPointInRegion(region);
  for (let attempt = 0; player && attempt < 30 && distance(player, spot) < 170; attempt += 1) {
    spot = randomPointInRegion(region);
  }
  return {
    type,
    x: spot.x,
    y: spot.y,
    radius: type === "storm" ? 76 : type === "cheese" ? 42 : type === "hole" ? 48 : type === "lightning" ? 34 : 28,
    vx: randomBetween(-1.5, 1.5) || 1,
    vy: randomBetween(-1.5, 1.5) || 1,
    cooldown: 50 + index * 35,
    timer: 0,
    fire: [],
    bullets: [],
  };
}

function setupMissionObjects(region) {
  hazards = [];
  pickups = [];

  if (region.name === "Forest") {
    hazards = [makeHazard("sniper", region, 0), makeHazard("sniper", region, 1)];
  }

  if (region.name === "Desert") {
    hazards = [makeHazard("storm", region, 0), makeHazard("storm", region, 1), makeHazard("storm", region, 2)];
  }

  if (region.name === "Lava Lands") {
    hazards = [makeHazard("lava", region, 0), makeHazard("lava", region, 1), makeHazard("lava", region, 2), makeHazard("lava", region, 3)];
  }

  if (region.name === "Baskerville") {
    hazards = [makeHazard("human", region, 0), makeHazard("human", region, 1), makeHazard("human", region, 2)];
  }

  if (region.name === "The Runes") {
    hazards = [makeHazard("dragon", region, 0), makeHazard("dragon", region, 1)];
  }

  if (region.name === "The Ruins") {
    pickups = activeTargetNames().map((name) => {
      const spot = randomPointInRegion(region);
      return { name, x: spot.x, y: spot.y, found: false, kind: "key" };
    });
    hazards = [{ type: "portal", x: region.text[0], y: region.text[1] - 120, radius: 54 }];
  }

  if (region.name === "Cheese Land") {
    hazards = [
      makeHazard("cheese", region, 0),
      makeHazard("cheese", region, 1),
      makeHazard("cheese", region, 2),
      makeHazard("cheese", region, 3),
    ];
  }

  if (region.name === "Bridge Town") {
    hazards = [
      makeHazard("hole", region, 0),
      makeHazard("hole", region, 1),
      makeHazard("hole", region, 2),
      makeHazard("friendly", region, 0),
      makeHazard("friendly", region, 1),
      makeHazard("friendly", region, 2),
    ];
  }

  if (region.name === "Rainforest") {
    hazards = [makeHazard("bear", region, 0), makeHazard("bear", region, 1), makeHazard("bear", region, 2)];
  }

  if (region.name === "Lightning City") {
    hazards = [
      makeHazard("lightning", region, 0),
      makeHazard("lightning", region, 1),
      makeHazard("lightning", region, 2),
      makeHazard("lightning", region, 3),
    ];
  }

  if (region.name === "Scarve City") {
    hazards = [makeHazard("golfer", region, 0), makeHazard("golfer", region, 1), makeHazard("golfer", region, 2)];
  }
}

function drawPixelText(text, x, y, size = 24, color = "#172033") {
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function drawWorldPolygon(points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0] - camera.x, points[0][1] - camera.y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i][0] - camera.x, points[i][1] - camera.y);
  }
  ctx.closePath();
  ctx.fill();
}

function strokeWorldPath(points, closed = false, color = "#162036", width = 5) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "miter";
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(points[0][0] - camera.x, points[0][1] - camera.y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i][0] - camera.x, points[i][1] - camera.y);
  }
  if (closed) {
    ctx.closePath();
  }
  ctx.stroke();
}

function drawPixelCircle(x, y, radius, color) {
  ctx.fillStyle = color;
  const step = Math.max(4, Math.floor(radius / 3));
  for (let yy = -radius; yy <= radius; yy += step) {
    for (let xx = -radius; xx <= radius; xx += step) {
      if (xx * xx + yy * yy <= radius * radius) {
        ctx.fillRect(x + xx, y + yy, step, step);
      }
    }
  }
}

function makePerson(name, target, index, region = selectedRegion) {
  const color = target
    ? `hsl(${(index * 47 + 40) % 360} 62% 62%)`
    : `hsl(${(index * 31 + 185) % 360} 38% 48%)`;
  const spot = region ? randomPointInRegion(region) : {
    x: randomBetween(100, world.width - 100),
    y: randomBetween(100, world.height - 100),
  };

  return {
    name,
    target,
    found: false,
    x: spot.x,
    y: spot.y,
    radius: target ? 17 : 14,
    color,
    wiggle: randomBetween(0, Math.PI * 2),
  };
}

function createScenery() {
  const mapTypes = currentMapIndex === 1
    ? ["tree", "pine", "rock", "cheese", "bolt", "hole"]
    : ["tree", "pine", "rock", "cactus", "snowdrift", "ruin", "lava-rock"];
  const items = [];
  for (let i = 0; i < 80; i += 1) {
    items.push({
      x: randomBetween(40, world.width - 40),
      y: randomBetween(40, world.height - 40),
      size: randomBetween(18, 44),
      type: mapTypes[Math.floor(randomBetween(0, mapTypes.length))],
    });
  }
  return [...items, ...activeMapLandmarks()];
}

function startLevel(index = currentMapIndex) {
  screen = "map";
  currentMapIndex = clamp(index, 0, adventureMaps.length - 1);
  currentLevelIndex = currentMapIndex;
  gameStarted = false;
  selectedRegion = null;
  player = null;
  people = [];
  scenery = createScenery();
  hazards = [];
  pickups = [];
  camera = { x: 0, y: 0 };
  gameWon = false;
  flashTimer = 0;
  hearts = 5;
  damageCooldown = 0;
  snowDrainTimer = 0;
  mazeMode = false;
  superPower = hasZapSlash;
  keysReadyAnnounced = false;
  firstPersonPlace = "street";
  heavenMode = false;
  heavenPlace = "clouds";
  missionStart = null;
  portalCompleted = false;
  poisonTimer = 0;
  poisoned = false;
  zapEffects = [];
  slashEffects = [];
  nextLevel.disabled = true;
  levelName.textContent = activeMap().name;
  perspectiveName.textContent = "Map Select";
  renderList();
  updateHearts();
  showMessage("Click an unlocked place on the map to start its mission.", 999999);
}

function beginAdventure() {
  currentMapIndex = 0;
  currentLevelIndex = 0;
  unlockedRegionIndex = 0;
  completedRegions = new Set();
  teleportTimer = 0;
  startLevel(0);
}

function startMission(region) {
  if (!isRegionUnlocked(region)) {
    const needed = currentUnlockOrder()[unlockedRegionIndex] || "the previous place";
    showMessage(`${region.name} is locked. Complete ${needed} first.`, 1800);
    return;
  }

  if (isRegionCompleted(region)) {
    showMessage(`${region.name} is already complete. Try the next unlocked place.`, 1600);
    return;
  }

  selectedRegion = region;
  gameStarted = true;
  const levelTargets = activeTargetNames();
  const start = randomPointInRegion(region);
  player = {
    x: start.x,
    y: start.y,
    radius: 18,
    speed: baseSpeedForRegion(region) + chocBoosts * 1.2,
    trail: [],
    mazeX: 70,
    mazeY: 560,
    height: 0,
    fpOffset: 0,
    fpDepth: 0,
  };
  missionStart = { x: start.x, y: start.y, region };
  spawnMultiplayerPlayers(start);

  setupMissionObjects(region);
  people = region.name === "The Ruins"
    ? decoyNames.slice(0, 5).map((name, personIndex) => makePerson(name, false, personIndex, region))
    : [
        ...levelTargets.map((name, personIndex) => makePerson(name, true, personIndex, region)),
        ...decoyNames.slice(0, 10).map((name, personIndex) => makePerson(name, false, personIndex, region)),
      ];
  gameWon = false;
  flashTimer = 0;
  hearts = 5;
  damageCooldown = 0;
  snowDrainTimer = 0;
  mazeMode = false;
  superPower = hasZapSlash;
  keysReadyAnnounced = false;
  firstPersonPlace = "street";
  heavenMode = false;
  heavenPlace = "clouds";
  portalCompleted = false;
  poisonTimer = 0;
  poisoned = false;
  zapEffects = [];
  slashEffects = [];
  nextLevel.disabled = true;
  levelName.textContent = `${region.name} Mission`;
  perspectiveName.textContent = activePerspective().name;
  renderList();
  updateCamera();
  showMessage(`${region.name} mission started. Find ${levelTargets.join(", ")}.`, 3200);
  updateHearts();
}

function resetGame() {
  startLevel(currentLevelIndex);
}

function continueAdventure() {
  if (!selectedRegion || !gameWon) {
    return;
  }

  if (currentMapIndex === 0 && selectedRegion.name === "The Ruins") {
    teleportTimer = 0;
    currentMapIndex = 1;
    currentLevelIndex = 1;
    unlockedRegionIndex = 0;
    completedRegions = new Set([...completedRegions].filter((key) => !key.startsWith("1:")));
    startLevel(1);
    showMessage("Tim has been teleported to a different map!", 3200);
    return;
  }

  if (currentMapIndex === 1 && selectedRegion.name === "Scarve City") {
    showMessage("All new levels are complete!", 999999);
    nextLevel.disabled = true;
    return;
  }

  startLevel(currentMapIndex);
  const nextName = currentUnlockOrder()[unlockedRegionIndex];
  showMessage(`${nextName} is unlocked! Click it to start.`, 2400);
}

function renderList() {
  seekList.innerHTML = "";
  const levelTargets = activeTargetNames();
  const foundPeople = people.filter((person) => person.target && person.found).length;
  const foundPickups = pickups.filter((pickup) => pickup.found).length;
  const foundTargets = foundPeople + foundPickups;
  foundCount.textContent = selectedRegion ? `${foundTargets} / ${levelTargets.length}` : "Pick map";

  if (!selectedRegion) {
    const orderedRegions = [
      ...currentUnlockOrder()
        .map((name) => activeMapRegions().find((region) => region.name === name))
        .filter(Boolean),
      ...activeMapRegions().filter((region) => !currentUnlockOrder().includes(region.name)),
    ];
    for (const region of orderedRegions) {
      const item = document.createElement("li");
      const locked = !isRegionUnlocked(region);
      const done = isRegionCompleted(region);
      item.className = done ? "found" : "";
      item.innerHTML = `<span>${region.name}</span><strong>${done ? "done" : locked ? "locked" : "open"}</strong>`;
      seekList.append(item);
    }
    return;
  }

  for (const name of levelTargets) {
    const target = people.find((candidate) => candidate.name === name)
      || pickups.find((candidate) => candidate.name === name);
    const item = document.createElement("li");
    item.className = target?.found ? "found" : "";
    item.innerHTML = `<span>${name}</span><strong>${target?.found ? "found" : "hidden"}</strong>`;
    seekList.append(item);
  }
}

function updateHearts() {
  heartsDisplay.textContent = selectedRegion
    ? (hearts > 0 ? "♥ ".repeat(hearts).trim() : "0")
    : "♥ ♥ ♥ ♥ ♥";
}

function showMessage(text, duration = 1700) {
  message.textContent = text;
  message.classList.remove("is-hidden");
  flashTimer = duration;
}

function completeMission(text) {
  if (!selectedRegion || gameWon) {
    return;
  }

  completedRegions.add(`${currentMapIndex}:${selectedRegion.name}`);
  const regionOrderIndex = currentUnlockOrder().indexOf(selectedRegion.name);
  if (regionOrderIndex >= unlockedRegionIndex && regionOrderIndex < currentUnlockOrder().length - 1) {
    unlockedRegionIndex = regionOrderIndex + 1;
  }

  gameWon = true;
  nextLevel.disabled = false;
  renderList();

  if (currentMapIndex === 0 && selectedRegion.name === "The Ruins") {
    teleportTimer = 2600;
    showMessage(`${text} Tim is getting teleported to a different map!`, 999999);
    return;
  }

  if (currentMapIndex === 1 && selectedRegion.name === "Scarve City") {
    showMessage(`${text} Tim completed the different map!`, 999999);
    return;
  }

  showMessage(text, 999999);
}

function damagePlayer(amount, text) {
  if (!gameStarted || gameWon || superPower || cheatsEnabled || damageCooldown > 0) {
    return;
  }

  hearts = clamp(hearts - amount, 0, 5);
  damageCooldown = 70;
  updateHearts();
  showMessage(text, 1300);

  if (hearts <= 0) {
    goToHeaven("Tim is out of hearts.");
  }
}

function goToHeaven(reason) {
  heavenMode = true;
  heavenPlace = "clouds";
  gameWon = true;
  coins += 3;
  updateHearts();
  showMessage(`${reason} Tim went to heaven. You got 3 heaven coins.`, 2600);
}

function reviveFromHeaven() {
  if (revivers <= 0 || !missionStart) {
    showMessage("You need a Reviver first.", 1400);
    return;
  }

  revivers -= 1;
  heavenMode = false;
  heavenPlace = "clouds";
  gameWon = false;
  hearts = 5;
  player.x = missionStart.x;
  player.y = missionStart.y;
  player.fpOffset = 0;
  player.fpDepth = 0;
  firstPersonPlace = "street";
  spawnMultiplayerPlayers(missionStart);
  updateHearts();
  updateCamera();
  showMessage("Reviver used. Tim respawned where he started.", 1800);
}

function leaveHeaven() {
  if (!missionStart) {
    showMessage("Choose a place first.", 1200);
    return;
  }

  heavenMode = false;
  heavenPlace = "clouds";
  gameWon = false;
  hearts = 5;
  player.x = missionStart.x;
  player.y = missionStart.y;
  player.fpOffset = 0;
  player.fpDepth = 0;
  firstPersonPlace = "street";
  spawnMultiplayerPlayers(missionStart);
  updateHearts();
  updateCamera();
  showMessage("Tim came out of Heaven.", 1600);
}

function updatePlayer() {
  if (heavenMode) {
    return;
  }

  if (!gameStarted || gameWon) {
    return;
  }

  if (mazeMode) {
    updateMazePlayer();
    return;
  }

  if (isFirstPerson()) {
    updateFirstPersonPlayer();
    return;
  }

  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (mouse.active) {
    const targetX = mouse.x + camera.x;
    const targetY = mouse.y + camera.y;
    const toPointer = Math.hypot(targetX - player.x, targetY - player.y);
    if (toPointer > 12) {
      dx += (targetX - player.x) / toPointer;
      dy += (targetY - player.y) / toPointer;
    }
  }

  const length = Math.hypot(dx, dy) || 1;
  const speed = superPower ? player.speed * 1.65 : player.speed;
  player.x = clamp(player.x + (dx / length) * speed, player.radius, world.width - player.radius);
  player.y = clamp(player.y + (dy / length) * speed, player.radius, world.height - player.radius);
  player.trail.unshift({ x: player.x, y: player.y });
  player.trail.length = 420;
}

function updateFirstPersonPlayer() {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  const length = Math.hypot(dx, dy) || 1;
  const speed = superPower ? player.speed * 1.35 : player.speed;
  player.x = clamp(player.x + (dx / length) * speed, player.radius, world.width - player.radius);
  player.y = clamp(player.y + (dy / length) * speed, player.radius, world.height - player.radius);
  player.fpOffset = clamp(player.fpOffset - (dx / length) * speed * 7, -420, 420);
  player.fpDepth = clamp(player.fpDepth - (dy / length) * speed * 5, -120, 170);
  player.height = Math.max(0, player.height - 0.03);
  player.trail.unshift({ x: player.x, y: player.y });
  player.trail.length = 420;
}

function climbThing() {
  if (!gameStarted || !isFirstPerson() || !selectedRegion) {
    return;
  }

  if (selectedRegion.name === "Baskerville" || selectedRegion.name === "Forest") {
    player.height = 1;
    showMessage("Tim climbed up high.", 1200);
  }
}

function interact() {
  if (heavenMode) {
    if (heavenPlace === "items") {
      heavenPlace = "clouds";
      showMessage("Back in heaven.", 1000);
      return;
    }
    reviveFromHeaven();
    return;
  }

  if (!gameStarted || gameWon) {
    return;
  }

  if (!isFirstPerson()) {
    showMessage("Press F5 for first person interactions.", 1200);
    return;
  }

  if (firstPersonPlace !== "street") {
    firstPersonPlace = "street";
    showMessage("Tim went back outside.", 1200);
    return;
  }

  const closeTarget = people.find((person) => !person.found && person.target && distance(player, person) < 130);
  if (closeTarget) {
    closeTarget.found = true;
    renderList();
    showMessage(`${closeTarget.name} found in first person!`, 1400);
    const missionComplete = people
      .filter((candidate) => candidate.target)
      .every((candidate) => candidate.found);
    if (missionComplete) {
      completeMission(`${selectedRegion.name} mission complete!`);
    }
    return;
  }

  if (selectedRegion?.name !== "Baskerville") {
    showMessage("There is nothing to open here yet.", 1200);
    return;
  }

  firstPersonPlace = "clock";
  showMessage("Tim opened the clock building door and hid inside.", 1600);
}

function updateMazePlayer() {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;
  const length = Math.hypot(dx, dy) || 1;
  const next = {
    x: player.mazeX + (dx / length) * 4,
    y: player.mazeY + (dy / length) * 4,
  };

  if (!mazeWallAt(next.x, next.y)) {
    player.mazeX = clamp(next.x, 24, canvas.width - 24);
    player.mazeY = clamp(next.y, 24, canvas.height - 24);
  }

  if (player.mazeX > canvas.width - 78 && player.mazeY < 86) {
    mazeMode = false;
    superPower = true;
    hasZapSlash = true;
    portalCompleted = true;
    player.speed = 5.2;
    player.x = selectedRegion.text[0] - 170;
    player.y = selectedRegion.text[1] + 120;
    player.trail = [];
    updateCamera();
    completeMission("Maze complete. Tim unlocked zapping and slashing!");
  }
}

function mazeWallAt(x, y) {
  return mazeWalls.some(([wx, wy, ww, wh]) => x > wx - 10 && x < wx + ww + 10 && y > wy - 10 && y < wy + wh + 10);
}

function updateFollowers() {
  if (!gameStarted || mazeMode) {
    return;
  }
  const followers = people.filter((person) => person.found);

  followers.forEach((person, index) => {
    const targetPoint = player.trail[(index + 1) * 17] || player;
    person.x += (targetPoint.x - person.x) * 0.08;
    person.y += (targetPoint.y - person.y) * 0.08;
    person.wiggle += 0.08;
  });
}

function updateHazards() {
  if (!gameStarted || gameWon || mazeMode || !selectedRegion) {
    return;
  }

  if (damageCooldown > 0) {
    damageCooldown -= 1;
  }

  if (selectedRegion.name === "Snow") {
    snowDrainTimer += 1;
    if (snowDrainTimer > 240) {
      snowDrainTimer = 0;
      damagePlayer(1, "The cold snow drains one heart.");
    }
  }

  if (poisoned) {
    poisonTimer += 1;
    if (poisonTimer > 210) {
      poisonTimer = 0;
      damagePlayer(1, "The cheese poison slowly hurts Tim.");
    }
  }

  for (const hazard of hazards) {
    if (hazard.type === "storm") {
      hazard.x += hazard.vx;
      hazard.y += hazard.vy;
      if (!pointInPolygon(hazard, selectedRegion.points)) {
        hazard.vx *= -1;
        hazard.vy *= -1;
      }
      if (distance(player, hazard) < hazard.radius) {
        player.x = clamp(player.x - hazard.vx * 18, player.radius, world.width - player.radius);
        player.y = clamp(player.y - hazard.vy * 18, player.radius, world.height - player.radius);
      }
    }

    if (hazard.type === "lava" && distance(player, hazard) < hazard.radius + player.radius) {
      hearts = 0;
      updateHearts();
      goToHeaven("Tim fell in lava.");
    }

    if (hazard.type === "cheese" && distance(player, hazard) < hazard.radius + player.radius && !hazard.touched) {
      poisoned = true;
      hazard.touched = true;
      showMessage("Tim touched poisonous cheese and turned green!", 1200);
    }

    if (hazard.type === "hole" && distance(player, hazard) < hazard.radius + player.radius) {
      hearts = 0;
      updateHearts();
      goToHeaven("Tim fell into a hole.");
    }

    if (hazard.type === "human") {
      const toPlayer = Math.max(1, distance(hazard, player));
      hazard.x += ((player.x - hazard.x) / toPlayer) * 2.2;
      hazard.y += ((player.y - hazard.y) / toPlayer) * 2.2;
      if (toPlayer < 34) {
        hearts = 0;
        updateHearts();
        goToHeaven("The Baskerville human caught Tim.");
      }
    }

    if (hazard.type === "sniper") {
      hazard.cooldown -= 1;
      if (hazard.cooldown <= 0) {
        const toPlayer = Math.max(1, distance(hazard, player));
        hazard.bullets.push({
          x: hazard.x,
          y: hazard.y,
          vx: ((player.x - hazard.x) / toPlayer) * 5,
          vy: ((player.y - hazard.y) / toPlayer) * 5,
        });
        hazard.cooldown = 95;
      }
      updateProjectiles(hazard.bullets, 1, "A sniper shot hit Tim.");
    }

    if (hazard.type === "dragon") {
      hazard.cooldown -= 1;
      if (hazard.cooldown <= 0) {
        const toPlayer = Math.max(1, distance(hazard, player));
        hazard.fire.push({
          x: hazard.x,
          y: hazard.y,
          vx: ((player.x - hazard.x) / toPlayer) * 3.8,
          vy: ((player.y - hazard.y) / toPlayer) * 3.8,
          life: 80,
        });
        hazard.cooldown = 130;
      }
      updateProjectiles(hazard.fire, 2, "Dragon fire burns away two hearts.");
    }

    if (hazard.type === "bear") {
      const toPlayer = Math.max(1, distance(hazard, player));
      hazard.x += ((player.x - hazard.x) / toPlayer) * 1.65;
      hazard.y += ((player.y - hazard.y) / toPlayer) * 1.65;
      if (toPlayer < 42) {
        damagePlayer(1, "A rainforest bear hit Tim.");
      }
    }

    if (hazard.type === "lightning") {
      hazard.cooldown -= 1;
      if (hazard.cooldown <= 0) {
        const spot = randomPointInRegion(selectedRegion);
        hazard.x = spot.x;
        hazard.y = spot.y;
        hazard.flash = 28;
        hazard.cooldown = 70 + Math.floor(randomBetween(0, 70));
      }
      if (hazard.flash > 0) {
        hazard.flash -= 1;
        if (distance(player, hazard) < hazard.radius + player.radius + 8) {
          damagePlayer(2, "Lightning crashed onto Tim for two hearts.");
          hazard.flash = 0;
        }
      }
    }

    if (hazard.type === "golfer") {
      hazard.cooldown -= 1;
      if (hazard.cooldown <= 0) {
        const toPlayer = Math.max(1, distance(hazard, player));
        hazard.bullets.push({
          x: hazard.x,
          y: hazard.y,
          vx: ((player.x - hazard.x) / toPlayer) * 4.5,
          vy: ((player.y - hazard.y) / toPlayer) * 4.5,
          life: 130,
        });
        hazard.cooldown = 90 + Math.floor(randomBetween(0, 60));
      }
      updateProjectiles(hazard.bullets, 1, "A golf ball hit Tim on the head.");
    }

    if (hazard.type === "portal" && distance(player, hazard) < hazard.radius) {
      if (portalCompleted) {
        continue;
      }
      if (pickups.some((pickup) => !pickup.found)) {
        showMessage("Find all the magic keys before the question mark.", 1200);
        continue;
      }
      mazeMode = true;
      player.mazeX = 70;
      player.mazeY = 560;
      showMessage("Tim fell into the question-mark maze!", 1800);
    }
  }

  updateAiCompanions();
}

function updateAiCompanions() {
  if (aiCompanions <= 0 || !hazards.length) {
    return;
  }

  const harmful = hazards.filter((hazard) => ["sniper", "human", "dragon", "bear", "golfer"].includes(hazard.type));
  if (!harmful.length) {
    return;
  }

  for (let i = 0; i < Math.min(aiCompanions, harmful.length); i += 1) {
    const hazard = harmful[i];
    hazard.timer += 1;
    if (hazard.timer > 360) {
      hazards.splice(hazards.indexOf(hazard), 1);
      showMessage("An AI companion slowly defeated an enemy.", 1200);
    }
  }
}

function useZap() {
  if (!superPower || !gameStarted || gameWon || mazeMode) {
    return;
  }

  const target = hazards
    .filter((hazard) => ["sniper", "human", "dragon", "bear", "golfer"].includes(hazard.type))
    .sort((a, b) => distance(player, a) - distance(player, b))[0];

  if (!target || distance(player, target) > 520) {
    showMessage("No enemy close enough to zap.", 900);
    return;
  }

  zapEffects.push({ x1: player.x, y1: player.y, x2: target.x, y2: target.y, life: 18 });
  hazards.splice(hazards.indexOf(target), 1);
  showMessage("ZAP! Tim blasted an enemy.", 900);
}

function useSlash() {
  if (!superPower || !gameStarted || gameWon || mazeMode) {
    return;
  }

  let hit = false;
  for (let i = hazards.length - 1; i >= 0; i -= 1) {
    if (["sniper", "human", "dragon", "bear", "golfer"].includes(hazards[i].type) && distance(player, hazards[i]) < 150) {
      hazards.splice(i, 1);
      hit = true;
    }
  }
  slashEffects.push({ x: player.x, y: player.y, life: 18 });
  showMessage(hit ? "SLASH! Nearby enemies were cut down." : "Slash missed.", 900);
}

function updateProjectiles(projectiles, damage, text) {
  for (const projectile of projectiles) {
    projectile.x += projectile.vx;
    projectile.y += projectile.vy;
    projectile.life = (projectile.life ?? 120) - 1;
    if (distance(player, projectile) < 24) {
      projectile.life = 0;
      damagePlayer(damage, text);
    }
  }

  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    if (projectile.life <= 0 || projectile.x < 0 || projectile.x > world.width || projectile.y < 0 || projectile.y > world.height) {
      projectiles.splice(i, 1);
    }
  }
}

function checkFound() {
  if (!gameStarted || gameWon) {
    return;
  }

  if (mazeMode) {
    return;
  }

  for (const person of people) {
    if (person.found || !person.target) {
      continue;
    }

    if (distance(player, person) < 54) {
      person.found = true;
      renderList();

      if (person.name === "Mrs Grove") {
        completeMission(`Mrs Grove found. ${selectedRegion.name} mission complete!`);
      } else {
        showMessage(`${person.name} found. They are following Tim now!`);
      }

      const missionComplete = people
        .filter((candidate) => candidate.target)
        .every((candidate) => candidate.found);
      if (missionComplete) {
        completeMission(`${selectedRegion.name} mission complete!`);
      }
    }
  }

  for (const pickup of pickups) {
    if (!pickup.found && distance(player, pickup) < 48) {
      pickup.found = true;
      renderList();
      showMessage(`${pickup.name} collected.`, 1200);
    }
  }

  if (pickups.length > 0 && pickups.every((pickup) => pickup.found) && !keysReadyAnnounced) {
    keysReadyAnnounced = true;
    showMessage("All magic keys found. Go to the question mark for the maze!", 1800);
  }
}

function updateCamera() {
  if (!gameStarted || !player) {
    camera.x = 0;
    camera.y = 0;
    return;
  }
  camera.x = clamp(player.x - viewWidth() / 2, 0, world.width - viewWidth());
  camera.y = clamp(player.y - viewHeight() / 2, 0, world.height - viewHeight());
}

function drawGround() {
  ctx.fillStyle = activeMap().background;
  ctx.fillRect(0, 0, viewWidth(), viewHeight());

  for (const region of activeMapRegions()) {
    drawWorldPolygon(region.points, region.fill);
  }

  for (const region of activeMapRegions()) {
    strokeWorldPath(region.points, true, "#142033", 5);
    drawPixelText(region.name, region.text[0] - camera.x, region.text[1] - camera.y, region.name.length > 11 ? 34 : 40);
  }

  ctx.strokeStyle = "rgba(16, 30, 50, 0.08)";
  ctx.lineWidth = 1;
  const grid = 88;
  const startX = -camera.x % grid;
  const startY = -camera.y % grid;

  for (let x = startX; x < viewWidth(); x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewHeight());
    ctx.stroke();
  }

  for (let y = startY; y < viewHeight(); y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewWidth(), y);
    ctx.stroke();
  }
}

function drawSceneryItem(item, x, y) {
  const s = item.size;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#172033";

  if (item.type === "tree" || item.type === "pine") {
    ctx.fillStyle = "#6a472c";
    ctx.fillRect(x - 5, y + s * 0.15, 10, s * 0.75);
    ctx.fillStyle = item.type === "pine" ? "#2f6c45" : "#3f7b35";
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x - s * 0.55, y + s * 0.35);
    ctx.lineTo(x + s * 0.55, y + s * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  if (item.type === "castle") {
    ctx.fillStyle = "#8791b0";
    ctx.fillRect(x - s * 0.45, y - s * 0.55, s * 0.9, s * 1.1);
    ctx.fillStyle = "#172033";
    ctx.fillRect(x - s * 0.18, y + s * 0.08, s * 0.36, s * 0.45);
    ctx.fillRect(x - s * 0.27, y - s * 0.24, 9, 9);
    ctx.fillRect(x + s * 0.14, y - s * 0.24, 9, 9);
    ctx.strokeRect(x - s * 0.45, y - s * 0.55, s * 0.9, s * 1.1);
    return;
  }

  if (item.type === "snowman") {
    drawPixelCircle(x, y + s * 0.12, s * 0.45, "#f4fbff");
    drawPixelCircle(x, y - s * 0.36, s * 0.28, "#f4fbff");
    ctx.fillStyle = "#172033";
    ctx.fillRect(x - 5, y - s * 0.4, 5, 5);
    ctx.fillRect(x + 8, y - s * 0.4, 5, 5);
    return;
  }

  if (item.type === "portal") {
    ctx.strokeStyle = "#172033";
    ctx.lineWidth = 9;
    ctx.strokeRect(x - s * 0.24, y - s * 0.24, s * 0.48, s * 0.48);
    ctx.lineWidth = 5;
    ctx.strokeRect(x - s * 0.52, y - s * 0.52, s * 1.04, s * 1.04);
    drawPixelText("?", x, y, s * 0.42, "#172033");
    return;
  }

  if (item.type === "crane") {
    ctx.strokeStyle = "#172033";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y - s * 0.5);
    ctx.lineTo(x + s * 0.45, y - s * 0.45);
    ctx.lineTo(x + s * 0.35, y + s * 0.35);
    ctx.moveTo(x + s * 0.15, y - s * 0.42);
    ctx.lineTo(x - s * 0.08, y + s * 0.15);
    ctx.stroke();
    drawPixelCircle(x - s * 0.18, y + s * 0.2, s * 0.22, "#67383a");
    return;
  }

  if (item.type === "waterfall") {
    ctx.fillStyle = "#95c6dc";
    ctx.fillRect(x - s * 0.36, y - s * 0.52, s * 0.72, s * 1.04);
    ctx.strokeRect(x - s * 0.36, y - s * 0.52, s * 0.72, s * 1.04);
    ctx.fillStyle = "#f4fbff";
    ctx.fillRect(x - 10, y - s * 0.32, 8, s * 0.68);
    ctx.fillRect(x + 12, y - s * 0.24, 8, s * 0.62);
    return;
  }

  if (item.type === "cactus") {
    ctx.fillStyle = "#3f7b35";
    ctx.fillRect(x - 8, y - s * 0.55, 16, s);
    ctx.fillRect(x - s * 0.34, y - s * 0.15, s * 0.24, 12);
    ctx.fillRect(x + s * 0.12, y - s * 0.28, s * 0.24, 12);
    ctx.strokeRect(x - 8, y - s * 0.55, 16, s);
    return;
  }

  if (item.type === "cave" || item.type === "hole") {
    ctx.fillStyle = "#172033";
    ctx.fillRect(x - s * 0.45, y - s * 0.22, s * 0.9, s * 0.44);
    return;
  }

  if (item.type === "statue") {
    ctx.fillStyle = "#8791b0";
    ctx.fillRect(x - s * 0.18, y - s * 0.42, s * 0.36, s * 0.85);
    ctx.fillStyle = "#172033";
    ctx.fillRect(x - 6, y - s * 0.52, 12, 10);
    ctx.strokeRect(x - s * 0.18, y - s * 0.42, s * 0.36, s * 0.85);
    return;
  }

  if (item.type === "cheese") {
    ctx.fillStyle = "#f2c94c";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.5, y + s * 0.28);
    ctx.lineTo(x + s * 0.42, y + s * 0.28);
    ctx.lineTo(x + s * 0.18, y - s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c7931f";
    drawPixelCircle(x - s * 0.12, y + s * 0.02, s * 0.08, "#c7931f");
    drawPixelCircle(x + s * 0.18, y + s * 0.12, s * 0.07, "#c7931f");
    drawPixelCircle(x + s * 0.06, y - s * 0.18, s * 0.06, "#c7931f");
    return;
  }

  if (item.type === "bolt") {
    ctx.fillStyle = "#f7d66b";
    ctx.beginPath();
    ctx.moveTo(x + s * 0.1, y - s * 0.55);
    ctx.lineTo(x - s * 0.22, y + s * 0.03);
    ctx.lineTo(x + s * 0.02, y + s * 0.03);
    ctx.lineTo(x - s * 0.12, y + s * 0.55);
    ctx.lineTo(x + s * 0.34, y - s * 0.12);
    ctx.lineTo(x + s * 0.08, y - s * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  if (item.type === "bridge-house") {
    ctx.fillStyle = "#8f654f";
    ctx.fillRect(x - s * 0.55, y - s * 0.25, s * 1.1, s * 0.75);
    ctx.fillStyle = "#d5b287";
    ctx.fillRect(x - s * 0.42, y - s * 0.08, s * 0.38, s * 0.28);
    ctx.fillRect(x + s * 0.05, y - s * 0.08, s * 0.36, s * 0.28);
    ctx.strokeRect(x - s * 0.55, y - s * 0.25, s * 1.1, s * 0.75);
    ctx.strokeRect(x - s * 0.42, y - s * 0.08, s * 0.38, s * 0.28);
    ctx.strokeRect(x + s * 0.05, y - s * 0.08, s * 0.36, s * 0.28);
    return;
  }

  if (item.type === "golf-flag") {
    ctx.strokeStyle = "#172033";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.55);
    ctx.lineTo(x, y + s * 0.45);
    ctx.stroke();
    ctx.fillStyle = "#f6f1df";
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.55);
    ctx.lineTo(x + s * 0.48, y - s * 0.36);
    ctx.lineTo(x, y - s * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawPixelCircle(x, y + s * 0.47, s * 0.08, "#172033");
    return;
  }

  ctx.fillStyle = item.type === "lava-rock" ? "#67383a" : "#8b8896";
  ctx.fillRect(x - s * 0.45, y - s * 0.28, s * 0.9, s * 0.56);
  ctx.strokeRect(x - s * 0.45, y - s * 0.28, s * 0.9, s * 0.56);
}

function drawScenery() {
  for (const item of scenery) {
    const x = item.x - camera.x;
    const y = item.y - camera.y;
    if (x < -90 || x > viewWidth() + 90 || y < -90 || y > viewHeight() + 90) {
      continue;
    }

    drawSceneryItem(item, x, y);
  }
}

function drawPerson(person) {
  const x = person.x - camera.x;
  const y = person.y - camera.y + Math.round(Math.sin(person.wiggle) * 2);

  if (x < -60 || x > viewWidth() + 60 || y < -60 || y > viewHeight() + 60) {
    return;
  }

  const hiddenAlpha = person.target || person.found ? 1 : 0.58;
  ctx.globalAlpha = person.found ? 1 : hiddenAlpha;

  if (!person.found && person.target) {
    ctx.globalAlpha = person.name === "Mrs Grove" ? 0.82 : 0.68;
  }

  const px = Math.round(x);
  const py = Math.round(y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.fillRect(px - 18, py + 18, 36, 8);

  ctx.fillStyle = person.color;
  ctx.fillRect(px - 13, py - 8, 26, 26);
  ctx.fillRect(px - 9, py + 18, 7, 14);
  ctx.fillRect(px + 3, py + 18, 7, 14);
  ctx.fillStyle = "#f1c59a";
  ctx.fillRect(px - 10, py - 24, 20, 18);
  ctx.fillStyle = "#2a1b14";
  ctx.fillRect(px - 12, py - 28, 24, 8);
  ctx.fillStyle = "#111";
  ctx.fillRect(px - 6, py - 17, 4, 4);
  ctx.fillRect(px + 4, py - 17, 4, 4);

  if (person.found || distance(player, person) < 120 || !person.target) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = person.target ? "#fff3b5" : "#d7ddb8";
    ctx.font = "800 14px \"Courier New\", monospace";
    ctx.textAlign = "center";
    ctx.fillText(person.name, x, y - person.radius - 12);
  }

  ctx.globalAlpha = 1;
}

function drawSniper(x, y) {
  ctx.fillStyle = "#46543d";
  ctx.fillRect(x - 12, y - 22, 24, 20);
  ctx.fillRect(x - 10, y - 2, 20, 28);
  ctx.fillRect(x - 22, y + 18, 12, 18);
  ctx.fillRect(x + 8, y + 18, 12, 18);
  ctx.fillStyle = "#233024";
  ctx.fillRect(x - 16, y - 30, 32, 10);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 10, y - 12, 50, 8);
  ctx.fillRect(x + 54, y - 17, 10, 18);
  ctx.fillStyle = "#79b4d8";
  ctx.fillRect(x - 4, y - 18, 8, 5);
}

function drawAngryHuman(x, y) {
  ctx.fillStyle = "#f1c59a";
  ctx.fillRect(x - 12, y - 26, 24, 22);
  ctx.fillStyle = "#332014";
  ctx.fillRect(x - 14, y - 31, 28, 8);
  ctx.fillStyle = "#1f3559";
  ctx.fillRect(x - 14, y - 4, 28, 32);
  ctx.fillStyle = "#aa2a2a";
  ctx.fillRect(x - 4, y - 4, 8, 32);
  ctx.fillStyle = "#111";
  ctx.fillRect(x - 7, y - 18, 4, 4);
  ctx.fillRect(x + 5, y - 18, 4, 4);
  ctx.fillRect(x - 8, y - 9, 16, 4);
}

function drawDragon(x, y) {
  ctx.fillStyle = "#e76624";
  ctx.fillRect(x - 22, y - 20, 42, 36);
  ctx.fillRect(x + 18, y - 12, 24, 20);
  ctx.fillRect(x - 28, y + 14, 11, 24);
  ctx.fillRect(x + 3, y + 14, 11, 24);
  ctx.fillStyle = "#f2bb65";
  ctx.fillRect(x - 8, y - 8, 18, 20);
  ctx.fillStyle = "#f09b45";
  ctx.fillRect(x - 44, y - 30, 24, 36);
  ctx.fillStyle = "#fff0c8";
  ctx.fillRect(x + 18, y - 25, 8, 10);
  ctx.fillRect(x + 31, y - 22, 8, 10);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 31, y - 6, 4, 4);
}

function drawFriendlyPerson(x, y) {
  ctx.fillStyle = "#f1c59a";
  ctx.fillRect(x - 12, y - 28, 24, 22);
  ctx.fillStyle = "#f0a62b";
  ctx.fillRect(x - 16, y - 34, 32, 9);
  ctx.fillStyle = "#f6f1df";
  ctx.fillRect(x - 16, y - 4, 32, 34);
  ctx.fillStyle = "#12344a";
  ctx.fillRect(x - 10, y + 30, 8, 22);
  ctx.fillRect(x + 3, y + 30, 8, 22);
  ctx.fillStyle = "#111";
  ctx.fillRect(x - 6, y - 19, 4, 4);
  ctx.fillRect(x + 5, y - 19, 4, 4);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 18, y - 28, 24, 36);
  ctx.fillStyle = "#bdeaf0";
  ctx.fillRect(x + 22, y - 24, 16, 28);
  ctx.fillStyle = "#ff6969";
  ctx.fillRect(x + 26, y - 12, 4, 4);
  ctx.fillRect(x + 33, y - 12, 4, 4);
}

function drawBear(x, y) {
  ctx.fillStyle = "#7a5a3b";
  ctx.fillRect(x - 30, y - 12, 58, 32);
  ctx.fillRect(x + 16, y - 28, 25, 24);
  ctx.fillRect(x - 26, y + 16, 11, 22);
  ctx.fillRect(x + 12, y + 16, 11, 22);
  ctx.fillStyle = "#5a3d28";
  ctx.fillRect(x + 17, y - 35, 9, 9);
  ctx.fillRect(x + 33, y - 33, 8, 8);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 33, y - 17, 5, 5);
  ctx.fillStyle = "#c9504a";
  ctx.fillRect(x + 39, y - 10, 5, 4);
}

function drawGolfer(x, y) {
  ctx.fillStyle = "#f1c59a";
  ctx.fillRect(x - 10, y - 30, 20, 20);
  ctx.fillStyle = "#3456a3";
  ctx.fillRect(x - 14, y - 38, 28, 8);
  ctx.fillStyle = "#f6f1df";
  ctx.fillRect(x - 14, y - 10, 28, 30);
  ctx.fillStyle = "#2f3541";
  ctx.fillRect(x - 12, y + 20, 9, 26);
  ctx.fillRect(x + 4, y + 20, 9, 26);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 19, y - 4);
  ctx.lineTo(x + 44, y + 42);
  ctx.stroke();
  ctx.fillStyle = "#f6f1df";
  ctx.fillRect(x + 37, y + 39, 18, 7);
}

function drawHazards() {
  if (selectedRegion?.name === "Lightning City") {
    ctx.strokeStyle = "rgba(190, 224, 255, 0.7)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 42; i += 1) {
      const x = (i * 73 + performance.now() * 0.08) % viewWidth();
      const y = (i * 41 + performance.now() * 0.22) % viewHeight();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 14, y + 26);
      ctx.stroke();
    }
  }

  for (const hazard of hazards) {
    const x = hazard.x - camera.x;
    const y = hazard.y - camera.y;

    if (hazard.type === "sniper") {
      drawSniper(x, y);
      ctx.fillStyle = "#f4e07a";
      for (const bullet of hazard.bullets) {
        ctx.fillRect(bullet.x - camera.x - 4, bullet.y - camera.y - 4, 8, 8);
      }
    }

    if (hazard.type === "storm") {
      ctx.fillStyle = "rgba(219, 189, 120, 0.68)";
      ctx.fillRect(x - hazard.radius, y - hazard.radius * 0.55, hazard.radius * 2, hazard.radius * 1.1);
      ctx.fillStyle = "#f5dc9a";
      ctx.fillRect(x - 44, y - 20, 88, 12);
      ctx.fillRect(x - 30, y + 8, 76, 12);
    }

    if (hazard.type === "lava") {
      ctx.fillStyle = "#421b18";
      ctx.fillRect(x - hazard.radius, y - hazard.radius * 0.65, hazard.radius * 2, hazard.radius * 1.3);
      ctx.fillStyle = "#ff5a1f";
      ctx.fillRect(x - hazard.radius + 10, y - 12, hazard.radius * 2 - 20, 24);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(x - 16, y - 5, 32, 10);
    }

    if (hazard.type === "cheese") {
      drawSceneryItem({ type: "cheese", size: hazard.radius * 1.4 }, x, y);
      if (poisoned) {
        drawPixelText("POISON", x, y - 54, 16, "#256d36");
      }
    }

    if (hazard.type === "hole") {
      ctx.fillStyle = "#101010";
      ctx.fillRect(x - hazard.radius, y - hazard.radius * 0.45, hazard.radius * 2, hazard.radius * 0.9);
      ctx.strokeStyle = "#4f352b";
      ctx.lineWidth = 6;
      ctx.strokeRect(x - hazard.radius, y - hazard.radius * 0.45, hazard.radius * 2, hazard.radius * 0.9);
    }

    if (hazard.type === "friendly") {
      drawFriendlyPerson(x, y);
    }

    if (hazard.type === "human") {
      drawAngryHuman(x, y);
    }

    if (hazard.type === "dragon") {
      drawDragon(x, y);
      for (const fire of hazard.fire) {
        ctx.fillStyle = "#ff5a1f";
        ctx.fillRect(fire.x - camera.x - 10, fire.y - camera.y - 10, 20, 20);
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(fire.x - camera.x - 5, fire.y - camera.y - 5, 10, 10);
      }
    }

    if (hazard.type === "bear") {
      drawBear(x, y);
    }

    if (hazard.type === "lightning") {
      ctx.globalAlpha = hazard.flash > 0 ? 1 : 0.32;
      drawSceneryItem({ type: "bolt", size: 85 }, x, y);
      ctx.globalAlpha = 1;
      if (hazard.flash > 0) {
        ctx.fillStyle = "rgba(255, 243, 181, 0.35)";
        ctx.fillRect(x - 18, 0, 36, y);
      }
    }

    if (hazard.type === "golfer") {
      drawGolfer(x, y);
      ctx.fillStyle = "#f6f1df";
      for (const ball of hazard.bullets) {
        ctx.fillRect(ball.x - camera.x - 5, ball.y - camera.y - 5, 10, 10);
      }
    }

    if (hazard.type === "portal") {
      ctx.strokeStyle = "#172033";
      ctx.lineWidth = 8;
      ctx.strokeRect(x - 44, y - 44, 88, 88);
      drawPixelText("?", x, y, 46, "#172033");
    }
  }
}

function drawSuperPowerEffects() {
  for (const effect of zapEffects) {
    ctx.strokeStyle = "#49d6ff";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(effect.x1 - camera.x, effect.y1 - camera.y);
    ctx.lineTo((effect.x1 + effect.x2) / 2 - camera.x, effect.y1 - 35 - camera.y);
    ctx.lineTo(effect.x2 - camera.x, effect.y2 - camera.y);
    ctx.stroke();
    effect.life -= 1;
  }

  for (const effect of slashEffects) {
    const x = effect.x - camera.x;
    const y = effect.y - camera.y;
    ctx.strokeStyle = "#fff3b5";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x - 70, y + 45);
    ctx.lineTo(x + 75, y - 45);
    ctx.stroke();
    effect.life -= 1;
  }

  zapEffects = zapEffects.filter((effect) => effect.life > 0);
  slashEffects = slashEffects.filter((effect) => effect.life > 0);
}

function drawPickups() {
  for (const pickup of pickups) {
    if (pickup.found) {
      continue;
    }
    const x = pickup.x - camera.x;
    const y = pickup.y - camera.y;
    drawMagicKey(x, y);
    ctx.font = "800 13px \"Courier New\", monospace";
    ctx.textAlign = "center";
    ctx.fillText(pickup.name, x, y - 26);
  }
}

function drawMagicKey(x, y) {
  const dark = "#172033";
  const gold = "#f7c83b";
  const shine = "#fff0a8";

  ctx.fillStyle = dark;
  ctx.fillRect(x - 28, y - 14, 22, 22);
  ctx.fillRect(x - 2, y - 7, 42, 14);
  ctx.fillRect(x + 30, y + 6, 7, 10);
  ctx.fillRect(x + 18, y + 6, 7, 8);

  ctx.fillStyle = gold;
  ctx.fillRect(x - 24, y - 10, 14, 14);
  ctx.fillRect(x - 14, y - 6, 12, 6);
  ctx.fillRect(x - 2, y - 4, 40, 8);
  ctx.fillRect(x + 28, y + 4, 6, 8);
  ctx.fillRect(x + 17, y + 4, 6, 6);

  ctx.fillStyle = dark;
  ctx.fillRect(x - 20, y - 6, 6, 6);
  ctx.fillStyle = shine;
  ctx.fillRect(x - 23, y - 9, 6, 3);
  ctx.fillRect(x + 2, y - 3, 18, 2);
}

function drawPlayerAvatar(x, y, shirt, name, poisonedPlayer = false) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(x - 22, y + 22, 44, 8);
  ctx.fillStyle = poisonedPlayer ? "#64c96f" : shirt;
  ctx.fillRect(x - 14, y - 7, 28, 28);
  ctx.fillRect(x - 10, y + 21, 8, 14);
  ctx.fillRect(x + 3, y + 21, 8, 14);
  ctx.fillStyle = "#f1c59a";
  ctx.fillRect(x - 11, y - 25, 22, 18);
  ctx.fillStyle = "#12344a";
  ctx.fillRect(x - 13, y - 30, 26, 8);
  ctx.fillStyle = "#10202a";
  ctx.fillRect(x - 6, y - 18, 4, 4);
  ctx.fillRect(x + 5, y - 18, 4, 4);

  ctx.fillStyle = "#f6f1df";
  ctx.font = "800 15px \"Courier New\", monospace";
  ctx.textAlign = "center";
  ctx.fillText(name, x, y - 31);
}

function drawPlayer() {
  const x = player.x - camera.x;
  const y = player.y - camera.y;
  drawPlayerAvatar(
    x,
    y,
    multiplayerShirts[activeMultiplayerIndex],
    multiplayerLabel(activeMultiplayerIndex),
    poisoned,
  );
}

function drawMultiplayerPlayers() {
  for (const mate of multiplayerPlayers) {
    const x = mate.x - camera.x;
    const y = mate.y - camera.y + Math.round(Math.sin(mate.wiggle) * 2);
    if (x < -60 || x > viewWidth() + 60 || y < -60 || y > viewHeight() + 60) {
      continue;
    }
    drawPlayerAvatar(x, y, multiplayerShirts[mate.playerIndex], multiplayerLabel(mate.playerIndex));
  }
}

function drawAiRobot(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.fillRect(-24, 54, 48, 8);

  ctx.fillStyle = "#5c8796";
  ctx.fillRect(-24, -58, 48, 42);
  ctx.fillStyle = "#bdeaf0";
  ctx.fillRect(-18, -52, 36, 30);
  ctx.fillStyle = "#12344a";
  ctx.fillRect(-12, -46, 24, 18);
  ctx.fillStyle = "#49d6ff";
  ctx.fillRect(-7, -40, 4, 4);
  ctx.fillRect(5, -40, 4, 4);
  ctx.fillRect(-5, -32, 10, 3);

  ctx.fillStyle = "#bdeaf0";
  ctx.fillRect(-30, -10, 60, 38);
  ctx.fillStyle = "#7daab4";
  ctx.fillRect(-36, -6, 8, 34);
  ctx.fillRect(28, -6, 8, 34);
  ctx.fillRect(-48, 8, 14, 28);
  ctx.fillRect(34, 8, 14, 28);
  ctx.fillStyle = "#333";
  ctx.fillRect(-44, 36, 7, 14);
  ctx.fillRect(37, 36, 7, 14);

  ctx.fillStyle = "#263a45";
  ctx.fillRect(-18, 28, 10, 34);
  ctx.fillRect(8, 28, 10, 34);
  ctx.fillStyle = "#8fc7d0";
  ctx.fillRect(-28, 58, 24, 18);
  ctx.fillRect(4, 58, 24, 18);
  ctx.fillStyle = "#5c8796";
  ctx.fillRect(-25, -68, 50, 8);
  ctx.fillRect(-38, -38, 9, 5);
  ctx.fillRect(29, -38, 9, 5);
  ctx.restore();
}

function drawAiCompanions() {
  if (!gameStarted || !player || aiCompanions <= 0) {
    return;
  }

  const baseX = player.x - camera.x;
  const baseY = player.y - camera.y;
  for (let i = 0; i < aiCompanions; i += 1) {
    drawAiRobot(baseX - 44 - i * 34, baseY + 18 + (i % 2) * 10, 0.42);
  }
}

function drawMiniMap() {
  if (!gameStarted || !player) {
    return;
  }
  const scale = 0.085;
  const mapWidth = world.width * scale;
  const mapHeight = world.height * scale;
  const x = canvas.width - mapWidth - 18;
  const y = 18;

  ctx.fillStyle = "rgba(14, 20, 10, 0.78)";
  ctx.fillRect(x, y, mapWidth, mapHeight);
  for (const region of activeMapRegions()) {
    ctx.fillStyle = region.fill;
    ctx.beginPath();
    ctx.moveTo(x + region.points[0][0] * scale, y + region.points[0][1] * scale);
    for (let i = 1; i < region.points.length; i += 1) {
      ctx.lineTo(x + region.points[i][0] * scale, y + region.points[i][1] * scale);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = "#f7d66b";
  ctx.strokeRect(x, y, mapWidth, mapHeight);

  ctx.fillStyle = "#71c7ff";
  ctx.beginPath();
  ctx.arc(x + player.x * scale, y + player.y * scale, 4, 0, Math.PI * 2);
  ctx.fill();

  for (const person of people) {
    if (!person.target || person.found) continue;
    ctx.fillStyle = person.name === "Mrs Grove" ? "#ffef6b" : "#f38f6b";
    ctx.fillRect(x + person.x * scale - 2, y + person.y * scale - 2, 4, 4);
  }
}

function drawSelectionMap() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#101621";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / world.width, canvas.height / world.height) * 0.94;
  const offsetX = (canvas.width - world.width * scale) / 2;
  const offsetY = (canvas.height - world.height * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = activeMap().background;
  ctx.fillRect(0, 0, world.width, world.height);
  for (const region of activeMapRegions()) {
    const locked = !isRegionUnlocked(region);
    const done = isRegionCompleted(region);
    ctx.fillStyle = region.fill;
    ctx.beginPath();
    ctx.moveTo(region.points[0][0], region.points[0][1]);
    for (let i = 1; i < region.points.length; i += 1) {
      ctx.lineTo(region.points[i][0], region.points[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#142033";
    ctx.lineWidth = 8;
    ctx.stroke();
    if (locked) {
      ctx.fillStyle = "rgba(210, 230, 255, 0.52)";
      ctx.fill();
      drawPixelText("LOCK", region.text[0], region.text[1] + 82, 44, "#172033");
    }
    if (done) {
      drawPixelText("DONE", region.text[0], region.text[1] + 82, 38, "#256d36");
    }
    drawPixelText(region.name, region.text[0], region.text[1], region.name.length > 11 ? 72 : 82);
  }

  for (const item of activeMapLandmarks()) {
    drawSceneryItem(item, item.x, item.y);
  }
  ctx.restore();

  ctx.fillStyle = "#fff3b5";
  ctx.font = "800 24px \"Courier New\", monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${activeMap().name.toUpperCase()} - CLICK AN OPEN PLACE`, canvas.width / 2, canvas.height - 28);
}

function drawMenuButton(x, y, width, height, label) {
  ctx.fillStyle = "#f6f1df";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, width, height);
  drawPixelText(label, x + width / 2, y + height / 2, 30, "#172033");
}

function drawMainMenu() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#101621";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCloud(100, 96, 0.75);
  drawCloud(760, 110, 0.65);
  drawPixelText("HIDE 'N' SEEK!", canvas.width / 2, 135, 52, "#fff3b5");
  drawMenuButton(362, 205, 300, 62, "START");
  drawMenuButton(362, 285, 300, 62, "MULTIPLAYER");
  drawMenuButton(362, 365, 300, 62, "SETTINGS");
  drawMenuButton(362, 445, 300, 62, "HOW TO PLAY");
}

function drawSetupAvatar(x, y, shirt, index) {
  const skin = index % 2 === 0 ? "#f1c59a" : "#d99661";
  const hair = ["#172033", "#7a341a", "#f7d66b", "#4a2a18"][index % 4];
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(x - 24, y + 40, 48, 8);
  ctx.fillStyle = shirt;
  ctx.fillRect(x - 18, y - 8, 36, 44);
  ctx.fillStyle = skin;
  ctx.fillRect(x - 15, y - 36, 30, 26);
  ctx.fillStyle = hair;
  ctx.fillRect(x - 18, y - 43, 36, 10);
  if (index % 2 === 1) {
    ctx.fillRect(x - 24, y - 30, 8, 22);
    ctx.fillRect(x + 16, y - 30, 8, 22);
  }
  ctx.fillStyle = "#111";
  ctx.fillRect(x - 8, y - 24, 5, 5);
  ctx.fillRect(x + 6, y - 24, 5, 5);
  ctx.fillStyle = "#263a45";
  ctx.fillRect(x - 15, y + 36, 12, 16);
  ctx.fillRect(x + 4, y + 36, 12, 16);
}

function drawPlayerSetupCard(index, x, y) {
  const width = 142;
  const height = 62;
  const active = index < multiplayerPlayerCount;
  ctx.globalAlpha = active ? 1 : 0.42;
  ctx.fillStyle = "#9eb8dd";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = index === selectedShirtPlayer ? "#2f78bd" : "#244b78";
  ctx.fillRect(x, y, width, 24);
  ctx.strokeStyle = index === selectedShirtPlayer ? "#fff3b5" : "#102033";
  ctx.lineWidth = index === selectedShirtPlayer ? 6 : 4;
  ctx.strokeRect(x, y, width, height);
  drawPixelText(multiplayerLabel(index), x + width / 2, y + 13, 17, "#f6f1df");
  drawSetupAvatar(x + width / 2, y + 46, multiplayerShirts[index], index);
  if (multiplayerEditMode === "name" && index === selectedShirtPlayer) {
    ctx.fillStyle = "#fff3b5";
    ctx.fillRect(x + width - 16, y + 6, 8, 8);
  }
  ctx.globalAlpha = 1;
}

function drawShirtChooser() {
  const x = 560;
  const y = 342;
  ctx.fillStyle = "#263449";
  ctx.fillRect(x, y, 365, 205);
  ctx.strokeStyle = "#071421";
  ctx.lineWidth = 6;
  ctx.strokeRect(x, y, 365, 205);
  ctx.fillStyle = "#d8edf9";
  ctx.beginPath();
  ctx.moveTo(x + 160, y);
  ctx.lineTo(x + 190, y - 24);
  ctx.lineTo(x + 220, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawPixelText("CHOOSE SHIRT COLOR:", x + 182, y + 30, 22, "#f6f1df");

  shirtPalette.forEach((color, index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    const sx = x + 34 + col * 56;
    const sy = y + 60 + row * 54;
    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, 36, 36);
    ctx.strokeStyle = multiplayerShirts[selectedShirtPlayer] === color ? "#fff3b5" : "#050505";
    ctx.lineWidth = multiplayerShirts[selectedShirtPlayer] === color ? 5 : 4;
    ctx.strokeRect(sx, sy, 36, 36);
  });

  drawMenuButton(x + 18, y + 148, 142, 42, "OK");
  drawMenuButton(x + 178, y + 148, 162, 42, "CANCEL");
}

function drawMultiplayerSetup() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#102033";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#c7d7ed";
  ctx.beginPath();
  ctx.moveTo(30, 22);
  ctx.lineTo(198, 22);
  ctx.lineTo(198, 126);
  ctx.lineTo(30, 162);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#071421";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#d1b7a8";
  ctx.beginPath();
  ctx.moveTo(198, 22);
  ctx.lineTo(994, 22);
  ctx.lineTo(994, 146);
  ctx.lineTo(690, 190);
  ctx.lineTo(330, 190);
  ctx.lineTo(198, 126);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#9fc39f";
  ctx.beginPath();
  ctx.moveTo(30, 162);
  ctx.lineTo(330, 190);
  ctx.lineTo(520, 618);
  ctx.lineTo(30, 618);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#d8c79b";
  ctx.beginPath();
  ctx.moveTo(330, 190);
  ctx.lineTo(994, 146);
  ctx.lineTo(994, 618);
  ctx.lineTo(520, 618);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#073f82";
  ctx.fillRect(260, 32, 505, 74);
  ctx.fillStyle = "#2f84d8";
  ctx.fillRect(270, 42, 485, 15);
  ctx.strokeStyle = "#06172a";
  ctx.lineWidth = 7;
  ctx.strokeRect(260, 32, 505, 74);
  drawPixelText("TYPE PLAYERS", 512, 70, 48, "#fff3b5");

  ctx.fillStyle = multiplayerEditMode === "count" ? "#fff3b5" : "#f6f1df";
  ctx.fillRect(36, 102, 170, 46);
  ctx.strokeStyle = "#071421";
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 102, 170, 46);
  drawPixelText(`${multiplayerCountText || "_"} / 30`, 121, 125, 24, "#172033");

  for (let i = 0; i < 30; i += 1) {
    const col = i % 6;
    const row = Math.floor(i / 6);
    drawPlayerSetupCard(i, 96 + col * 150, 150 + row * 75);
  }

  drawShirtChooser();
  drawMenuButton(256, 572, 190, 48, "START");
  drawMenuButton(468, 572, 170, 48, "BACK");
}

function drawSettings() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#202616";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelText("SETTINGS", canvas.width / 2, 105, 44, "#fff3b5");
  ctx.fillStyle = "#f6f1df";
  ctx.fillRect(250, 215, 220, 80);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 5;
  ctx.strokeRect(250, 215, 220, 80);
  drawPixelText("Cheats", 360, 255, 28, "#172033");
  drawMenuButton(510, 215, 110, 80, "YES");
  drawMenuButton(645, 215, 110, 80, "NO");
  drawPixelText(`Cheats are ${cheatsEnabled ? "ON" : "OFF"}`, canvas.width / 2, 345, 25, "#fff3b5");
  drawMenuButton(362, 470, 300, 62, "BACK");
}

function drawHowToPlay() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#101621";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelText("HOW TO PLAY", canvas.width / 2, 84, 42, "#fff3b5");
  drawPixelText("Click a place on the map to start a mission.", canvas.width / 2, 170, 22, "#f6f1df");
  drawPixelText("WASD or arrows move Tim.", canvas.width / 2, 215, 22, "#f6f1df");
  drawPixelText("F5 switches to first person.", canvas.width / 2, 260, 22, "#f6f1df");
  drawPixelText("Space interacts with doors, people, and shops.", canvas.width / 2, 305, 22, "#f6f1df");
  drawPixelText("Find the mission targets and survive the dangers.", canvas.width / 2, 350, 22, "#f6f1df");
  drawMenuButton(362, 470, 300, 62, "BACK");
}

function drawMaze() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f2a04a";
  for (let y = 35; y < canvas.height - 18; y += 26) {
    for (let x = 38; x < canvas.width - 18; x += 32) {
      ctx.fillRect(x, y, 5, 5);
    }
  }

  for (const wall of mazeWalls) {
    drawMazeWall(...wall);
  }

  ctx.fillStyle = "#59d46f";
  ctx.fillRect(canvas.width - 86, 28, 56, 44);
  ctx.fillStyle = "#137a34";
  ctx.fillRect(canvas.width - 78, 36, 40, 28);
  ctx.fillStyle = "#71c7ff";
  ctx.fillRect(player.mazeX - 13, player.mazeY - 13, 26, 26);
  ctx.fillStyle = "#f1c59a";
  ctx.fillRect(player.mazeX - 8, player.mazeY - 28, 16, 15);
  ctx.fillStyle = "#fff3b5";
  ctx.font = "800 20px \"Courier New\", monospace";
  ctx.textAlign = "center";
  ctx.fillText("EXIT", canvas.width - 58, 94);
}

function drawMazeWall(x, y, width, height) {
  ctx.fillStyle = "#f28c38";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#ffd08a";
  ctx.fillRect(x, y, width, 5);
  ctx.fillStyle = "#8b3f21";
  ctx.fillRect(x, y + height - 5, width, 5);

  ctx.fillStyle = "#1b0e0a";
  const brick = 22;
  for (let rowY = y + 7; rowY < y + height - 5; rowY += 12) {
    const offset = Math.floor((rowY - y) / 12) % 2 === 0 ? 0 : brick / 2;
    for (let lineX = x + offset; lineX < x + width; lineX += brick) {
      ctx.fillRect(lineX, rowY, 3, 8);
    }
  }
  for (let lineY = y + 12; lineY < y + height - 6; lineY += 12) {
    ctx.fillRect(x, lineY, width, 3);
  }
}

function drawFirstPerson() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e6e2ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#c7c0d0";
  ctx.fillRect(0, 430, canvas.width, 210);

  if (firstPersonPlace === "gambling") {
    drawGamblingInterior();
    return;
  }

  if (firstPersonPlace === "clock") {
    drawClockInterior();
    return;
  }

  if (selectedRegion?.name === "Baskerville") {
    drawBaskervilleStreet();
  } else {
    drawGenericFirstPerson();
  }

  drawFirstPersonPeople();
  drawFirstPersonHud();
}

function drawBaskervilleStreet() {
  const ox = player.fpOffset;
  const depth = player.fpDepth;
  const scale = clamp(1 + depth / 420, 0.75, 1.38);
  const horizon = 36 - depth * 0.24 - player.height * 60;

  ctx.fillStyle = "#d5cedf";
  ctx.fillRect(0, 0, canvas.width, 430 + depth * 0.18);
  ctx.fillStyle = "#bdb5c7";
  ctx.fillRect(0, 430 + depth * 0.18, canvas.width, 210);
  ctx.fillStyle = "rgba(23, 32, 51, 0.16)";
  ctx.fillRect(0, 495 + depth * 0.25, canvas.width, 26);

  drawGamblingBuilding(80 + ox, 110 + horizon, 140 * scale, 320 * scale);
  drawBaskervilleHuman(360 + ox * 0.78, 245 + horizon + depth * 0.08, 0.9 * scale);
  drawBaskervilleHuman(545 + ox * 0.52, 235 + horizon + depth * 0.1, 1.35 * scale);
  drawBaskervilleHuman(700 + ox * 0.65, 145 + horizon + depth * 0.04, 0.7 * scale);
  drawClockBuilding(830 + ox, 88 + horizon, 150 * scale, 320 * scale);
  drawFirstPersonTree(620 + ox * 0.9, 445 + horizon + depth * 0.2, scale);

  if (player.height > 0.2) {
    drawPixelText("CLIMBING", 514, 82, 26, "#172033");
  }
  drawPixelText("WASD / arrows move in first person", canvas.width / 2, 34, 20, "#172033");
}

function drawGenericFirstPerson() {
  const ox = player.fpOffset;
  const depth = player.fpDepth;
  drawFirstPersonTree(185 + ox, 400 + depth * 0.2, 1);
  drawFirstPersonTree(780 + ox * 0.7, 390 + depth * 0.15, 1);
  drawPixelText(`${selectedRegion.name} first person`, canvas.width / 2, 130, 34, "#172033");
  drawPixelText("Space interacts. Top arrow climbs on mobile.", canvas.width / 2, 185, 22, "#172033");
}

function firstPersonProjection(entity) {
  const dx = entity.x - player.x;
  const dy = entity.y - player.y;
  const forward = clamp(260 - dy * 0.22 + player.fpDepth * 0.9, 70, 440);
  const side = canvas.width / 2 + dx * 0.28 + player.fpOffset * 0.5;
  const distanceToEntity = Math.max(60, distance(player, entity));
  const scale = clamp(2.2 - distanceToEntity / 360, 0.55, 1.8);
  return { x: side, y: forward, scale, distanceToEntity };
}

function drawFirstPersonPeople() {
  const visiblePeople = people
    .filter((person) => !person.found && distance(player, person) < 760)
    .map((person) => ({ person, view: firstPersonProjection(person) }))
    .filter(({ view }) => view.x > -120 && view.x < canvas.width + 120)
    .sort((a, b) => b.view.distanceToEntity - a.view.distanceToEntity);

  for (const { person, view } of visiblePeople) {
    drawFirstPersonPerson(person, view.x, view.y, view.scale);
  }
}

function drawFirstPersonPerson(person, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = person.target ? 1 : 0.55;
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.fillRect(-24, 60, 48, 8);
  ctx.fillStyle = person.color;
  ctx.fillRect(-18, -4, 36, 46);
  ctx.fillRect(-14, 42, 10, 28);
  ctx.fillRect(4, 42, 10, 28);
  ctx.fillStyle = "#f1c59a";
  ctx.fillRect(-15, -34, 30, 28);
  ctx.fillStyle = "#2a1b14";
  ctx.fillRect(-18, -42, 36, 10);
  ctx.fillStyle = "#111";
  ctx.fillRect(-8, -22, 5, 5);
  ctx.fillRect(6, -22, 5, 5);
  ctx.globalAlpha = 1;
  ctx.fillStyle = person.target ? "#fff3b5" : "#d7ddb8";
  ctx.font = "800 13px \"Courier New\", monospace";
  ctx.textAlign = "center";
  ctx.fillText(person.name, 0, -54);
  ctx.restore();
}

function drawGamblingBuilding(x, y, w, h) {
  ctx.fillStyle = "#d7d0c4";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
  drawPixelText("Gambling", x + w / 2, y + 45, 20, "#172033");
  ctx.fillStyle = "#b8c7dd";
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 2; col += 1) {
      ctx.fillRect(x + 28 + col * 56, y + 80 + row * 82, 42, 52);
      ctx.strokeRect(x + 28 + col * 56, y + 80 + row * 82, 42, 52);
    }
  }
  ctx.fillStyle = "#b69a7b";
  ctx.fillRect(x + 55, y + h - 72, 36, 72);
  ctx.strokeRect(x + 55, y + h - 72, 36, 72);
}

function drawClockBuilding(x, y, w, h) {
  ctx.fillStyle = "#d7d0c4";
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 55);
  ctx.lineTo(x - 18, y + 35);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w + 18, y + 35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#ede7db";
  ctx.fillRect(x + 55, y + 52, 42, 42);
  ctx.strokeRect(x + 55, y + 52, 42, 42);
  ctx.fillStyle = "#172033";
  ctx.fillRect(x + 74, y + 61, 4, 20);
  ctx.fillRect(x + 76, y + 78, 14, 4);
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      ctx.fillStyle = "#b8c7dd";
      ctx.fillRect(x + 25 + col * 42, y + 125 + row * 48, 24, 28);
      ctx.strokeRect(x + 25 + col * 42, y + 125 + row * 48, 24, 28);
    }
  }
}

function drawBaskervilleHuman(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#b8a183";
  ctx.fillRect(-16, -44, 32, 28);
  ctx.fillStyle = "#172033";
  ctx.fillRect(-18, -50, 36, 8);
  ctx.fillRect(-7, -33, 6, 6);
  ctx.fillRect(7, -33, 6, 6);
  ctx.fillRect(-8, -20, 18, 5);
  ctx.fillStyle = "#39465c";
  ctx.fillRect(-18, -16, 36, 54);
  ctx.fillStyle = "#172033";
  ctx.fillRect(-14, 38, 10, 42);
  ctx.fillRect(6, 38, 10, 42);
  ctx.restore();
}

function drawFirstPersonTree(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#6a472c";
  ctx.fillRect(-12, -80, 24, 120);
  ctx.fillStyle = "#2f6c45";
  ctx.fillRect(-55, -142, 110, 74);
  ctx.fillRect(-38, -176, 76, 52);
  ctx.restore();
}

function drawGamblingInterior() {
  ctx.fillStyle = "#6b523d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelText("Gambling", 150, 55, 32, "#fff3b5");
  ctx.fillStyle = "#9a714e";
  ctx.fillRect(390, 315, 260, 90);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 5;
  ctx.strokeRect(390, 315, 260, 90);
  ctx.fillStyle = "#fff3b5";
  ctx.fillRect(435, 340, 34, 48);
  ctx.fillRect(500, 340, 34, 48);
  ctx.fillRect(565, 340, 34, 48);
  drawSeatedCardPlayer(300, 360);
  drawSeatedCardPlayer(700, 360);
  drawPixelText("Space/click to leave", canvas.width / 2, 570, 22, "#fff3b5");
  drawFirstPersonHud();
}

function drawSeatedCardPlayer(x, y) {
  drawBaskervilleHuman(x, y, 1);
  ctx.fillStyle = "#4e3828";
  ctx.fillRect(x - 32, y + 46, 64, 18);
  ctx.fillStyle = "#fff3b5";
  ctx.fillRect(x - 50, y - 8, 22, 30);
  ctx.fillRect(x + 30, y - 8, 22, 30);
}

function drawClockInterior() {
  ctx.fillStyle = "#2b3040";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1a1e2a";
  ctx.fillRect(120, 120, 784, 365);
  ctx.fillStyle = "#f7d66b";
  ctx.fillRect(470, 70, 84, 84);
  ctx.fillStyle = "#172033";
  ctx.fillRect(508, 88, 6, 42);
  ctx.fillRect(512, 125, 28, 6);
  drawPixelText("Tim is hiding inside the clock building", canvas.width / 2, 540, 24, "#fff3b5");
  drawPixelText("Space/click to go outside", canvas.width / 2, 575, 20, "#fff3b5");
  drawFirstPersonHud();
}

function drawFirstPersonHud() {
  ctx.fillStyle = "#ff6969";
  ctx.font = "800 30px \"Courier New\", monospace";
  ctx.textAlign = "left";
  ctx.fillText("♥".repeat(Math.max(0, hearts)), 32, 600);
  ctx.fillStyle = "#f6f1df";
  ctx.fillRect(326, 540, 62, 62);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 4;
  ctx.strokeRect(326, 540, 62, 62);
  ctx.fillStyle = "#172033";
  ctx.font = "800 11px \"Courier New\", monospace";
  ctx.fillText("Interact", 338, 558);
  ctx.fillStyle = "#f7d66b";
  ctx.fillRect(350, 570, 16, 24);

  if (superPower) {
    ctx.fillStyle = "#49d6ff";
    ctx.font = "800 16px \"Courier New\", monospace";
    ctx.fillText("F: ZAP   K: SLASH", 425, 588);
  }

  for (let i = 0; i < aiCompanions; i += 1) {
    drawAiRobot(760 + i * 48, 578, 0.34);
  }
}

function drawHeaven() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#31c4ee";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 90; y < 390; y += 90) {
    for (let x = 20; x < canvas.width; x += 145) {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillRect(x, y, 18, 10);
      ctx.fillRect(x + 28, y - 14, 14, 9);
    }
  }

  for (let x = -30; x < canvas.width; x += 92) {
    drawCloud(x, 420 + Math.sin(x) * 12, 1.2);
  }
  drawCloud(120, 180, 0.9);
  drawCloud(330, 120, 0.75);
  drawCloud(690, 165, 0.85);
  drawCloud(835, 105, 0.55);

  drawHeavenHuman(155, 375);
  drawHeavenHuman(485, 350);
  drawHeavenHuman(805, 380);
  drawHeavenShop(260, 275, "Coin Shop", "#fff3b5");
  drawHeavenShop(595, 275, "Item Shop", "#f7d66b");

  if (heavenPlace === "items") {
    drawItemShopPanel();
  } else {
    drawHeavenPanel();
  }

  drawGoOutOfHeavenButton();
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 22, 120, 34);
  ctx.fillRect(20, 5, 38, 35);
  ctx.fillRect(58, -8, 48, 48);
  ctx.fillRect(95, 12, 45, 38);
  ctx.restore();
}

function drawHeavenHuman(x, y) {
  ctx.fillStyle = "#f1c59a";
  ctx.fillRect(x - 12, y - 42, 24, 22);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 24, y - 18, 48, 44);
  ctx.fillStyle = "#172033";
  ctx.fillRect(x - 6, y - 34, 4, 4);
  ctx.fillRect(x + 5, y - 34, 4, 4);
  ctx.fillStyle = "#ffeeb0";
  ctx.fillRect(x - 28, y - 56, 56, 6);
}

function drawHeavenShop(x, y, label, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 150, 135);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, 150, 135);
  drawPixelText(label, x + 75, y + 32, 18, "#172033");
  ctx.fillStyle = "#9cc8ef";
  ctx.fillRect(x + 28, y + 58, 36, 42);
  ctx.fillRect(x + 86, y + 58, 36, 42);
  ctx.fillStyle = "#8b5a3b";
  ctx.fillRect(x + 58, y + 92, 34, 43);
}

function drawHeavenPanel() {
  ctx.fillStyle = "rgba(16,22,33,0.82)";
  ctx.fillRect(24, 24, 395, 120);
  drawPixelText(`Heaven Coins: ${coins}`, 210, 55, 22, "#fff3b5");
  drawPixelText(`Revivers: ${revivers}  AI: ${aiCompanions}`, 210, 86, 18, "#fff3b5");
  drawPixelText("Click Item Shop to buy things", 210, 118, 17, "#fff3b5");
}

function drawGoOutOfHeavenButton() {
  ctx.fillStyle = "#f6f1df";
  ctx.fillRect(334, 536, 356, 62);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 5;
  ctx.strokeRect(334, 536, 356, 62);
  drawPixelText("GO OUT OF HEAVEN", 512, 568, 24, "#172033");
}

function drawItemShopPanel() {
  ctx.fillStyle = "rgba(16,22,33,0.9)";
  ctx.fillRect(100, 48, 824, 180);
  drawPixelText("ITEM SHOP", canvas.width / 2, 78, 26, "#fff3b5");
  drawShopItem(150, 112, "Choc", "5 coins", "speed");
  drawShopItem(410, 112, "AI Companion", "15 coins", "slowly fights");
  drawShopItem(700, 112, "Reviver", "10 coins", "respawn");
}

function drawShopItem(x, y, name, cost, note) {
  ctx.fillStyle = "#f6f1df";
  ctx.fillRect(x, y, 190, 86);
  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, 190, 86);
  drawPixelText(name, x + 95, y + 22, 18, "#172033");
  drawPixelText(cost, x + 95, y + 48, 15, "#172033");
  drawPixelText(note, x + 95, y + 69, 13, "#172033");
  if (name === "Choc") {
    ctx.fillStyle = "#5b321f";
    ctx.fillRect(x + 16, y + 18, 32, 44);
    ctx.fillStyle = "#7b4a2f";
    ctx.fillRect(x + 20, y + 23, 10, 12);
    ctx.fillRect(x + 32, y + 23, 10, 12);
    ctx.fillRect(x + 20, y + 38, 10, 12);
    ctx.fillRect(x + 32, y + 38, 10, 12);
  }
  if (name === "AI Companion") {
    drawAiRobot(x + 33, y + 62, 0.38);
  }
}

function draw() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (screen === "menu") {
    drawMainMenu();
    return;
  }

  if (screen === "settings") {
    drawSettings();
    return;
  }

  if (screen === "multiplayer") {
    drawMultiplayerSetup();
    return;
  }

  if (screen === "howToPlay") {
    drawHowToPlay();
    return;
  }

  if (heavenMode) {
    drawHeaven();
    return;
  }

  if (!gameStarted) {
    drawSelectionMap();
    return;
  }

  if (mazeMode) {
    drawMaze();
    return;
  }

  if (isFirstPerson()) {
    drawFirstPerson();
    return;
  }

  ctx.save();
  ctx.scale(activePerspective().zoom, activePerspective().zoom);
  drawGround();
  drawScenery();
  drawPickups();
  drawHazards();
  drawSuperPowerEffects();

  const sortedPeople = [...people].sort((a, b) => a.y - b.y);
  for (const person of sortedPeople) {
    drawPerson(person);
  }
  drawAiCompanions();
  drawMultiplayerPlayers();
  drawPlayer();
  ctx.restore();
  drawMiniMap();
}

function tick() {
  updatePlayer();
  updateFollowers();
  updateMultiplayerPlayers();
  updateHazards();
  checkFound();
  updateCamera();
  draw();

  if (teleportTimer > 0) {
    teleportTimer -= 16;
    if (teleportTimer <= 0) {
      continueAdventure();
    }
  }

  if (flashTimer > 0 && !gameWon) {
    flashTimer -= 16;
    if (flashTimer <= 0) {
      message.classList.add("is-hidden");
    }
  }

  requestAnimationFrame(tick);
}

window.addEventListener("keydown", (event) => {
  if (screen === "multiplayer") {
    if (multiplayerEditMode === "count" && /^[0-9]$/.test(event.key)) {
      multiplayerCountText = multiplayerCountText === "1" && multiplayerPlayerCount === 1
        ? event.key
        : `${multiplayerCountText}${event.key}`.slice(-2);
      setMultiplayerCount(multiplayerCountText);
      event.preventDefault();
      return;
    }
    if (multiplayerEditMode === "name" && event.key.length === 1) {
      setMultiplayerName(selectedShirtPlayer, `${multiplayerNames[selectedShirtPlayer]}${event.key}`);
      event.preventDefault();
      return;
    }
    if (event.key === "Backspace" && multiplayerEditMode === "count") {
      multiplayerCountText = multiplayerCountText.slice(0, -1);
      setMultiplayerCount(multiplayerCountText || "1");
      event.preventDefault();
      return;
    }
    if (event.key === "Backspace" && multiplayerEditMode === "name") {
      setMultiplayerName(selectedShirtPlayer, multiplayerNames[selectedShirtPlayer].slice(0, -1));
      event.preventDefault();
      return;
    }
    if (event.key === "Enter") {
      startMultiplayerAdventure();
      event.preventDefault();
      return;
    }
  }

  if (event.key === "F3") {
    event.preventDefault();
    switchPlayablePlayer();
    return;
  }

  if (event.key === "F5") {
    event.preventDefault();
    if (!gameStarted) {
      showMessage("Choose a place on the map before changing perspective.", 1200);
      return;
    }
    perspectiveIndex = (perspectiveIndex + 1) % perspectives.length;
    perspectiveName.textContent = activePerspective().name;
    updateCamera();
    showMessage(`Perspective changed to ${activePerspective().name}.`, 1200);
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    interact();
    return;
  }

  if (event.key.toLowerCase() === "f") {
    useZap();
    return;
  }

  if (event.key.toLowerCase() === "k") {
    useSlash();
    return;
  }

  keys.add(event.key.toLowerCase());
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("pointerdown", (event) => {
  if (["menu", "settings", "howToPlay", "multiplayer"].includes(screen)) {
    handleMenuClick(event);
    return;
  }

  if (heavenMode) {
    handleHeavenClick(event);
    return;
  }

  if (!gameStarted) {
    const point = selectionPointFromEvent(event);
    const region = regionAt(point);
    if (region) {
      startMission(region);
    } else {
      showMessage("Click inside one of the named places to start.", 1500);
    }
    return;
  }

  if (isFirstPerson()) {
    handleFirstPersonClick(event);
    return;
  }

  mouse.active = true;
  updatePointer(event);
});

canvas.addEventListener("pointermove", updatePointer);
canvas.addEventListener("pointerup", () => {
  mouse.active = false;
});
canvas.addEventListener("pointerleave", () => {
  mouse.active = false;
});

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (((event.clientX - rect.left) / rect.width) * canvas.width) / activePerspective().zoom;
  mouse.y = (((event.clientY - rect.top) / rect.height) * canvas.height) / activePerspective().zoom;
}

function selectionPointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const canvasX = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const canvasY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const scale = Math.min(canvas.width / world.width, canvas.height / world.height) * 0.94;
  const offsetX = (canvas.width - world.width * scale) / 2;
  const offsetY = (canvas.height - world.height * scale) / 2;

  return {
    x: (canvasX - offsetX) / scale,
    y: (canvasY - offsetY) / scale,
  };
}

function canvasPointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function pointInRect(point, x, y, width, height) {
  return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
}

function handleMenuClick(event) {
  const point = canvasPointFromEvent(event);

  if (screen === "menu") {
    if (pointInRect(point, 362, 205, 300, 62)) {
      multiplayerEnabled = false;
      multiplayerPlayerCount = 1;
      multiplayerCountText = "1";
      beginAdventure();
      return;
    }
    if (pointInRect(point, 362, 285, 300, 62)) {
      screen = "multiplayer";
      return;
    }
    if (pointInRect(point, 362, 365, 300, 62)) {
      screen = "settings";
      return;
    }
    if (pointInRect(point, 362, 445, 300, 62)) {
      screen = "howToPlay";
      return;
    }
  }

  if (screen === "multiplayer") {
    if (pointInRect(point, 36, 102, 170, 46)) {
      multiplayerEditMode = "count";
      return;
    }

    for (let i = 0; i < 30; i += 1) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = 96 + col * 150;
      const y = 150 + row * 75;
      if (pointInRect(point, x, y, 142, 62)) {
        selectedShirtPlayer = i;
        multiplayerEditMode = "name";
        if (i >= multiplayerPlayerCount) {
          setMultiplayerCount(i + 1);
        }
        return;
      }
    }

    for (let i = 0; i < shirtPalette.length; i += 1) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = 594 + col * 56;
      const y = 402 + row * 54;
      if (pointInRect(point, x, y, 36, 36)) {
        multiplayerShirts[selectedShirtPlayer] = shirtPalette[i];
        return;
      }
    }

    if (pointInRect(point, 578, 490, 142, 42)) {
      return;
    }
    if (pointInRect(point, 738, 490, 162, 42)) {
      return;
    }

    if (pointInRect(point, 256, 572, 190, 48)) {
      startMultiplayerAdventure();
      return;
    }
    if (pointInRect(point, 468, 572, 170, 48)) {
      screen = "menu";
      return;
    }
  }

  if (screen === "settings") {
    if (pointInRect(point, 510, 215, 110, 80)) {
      cheatsEnabled = true;
      showMessage("Cheats ON. Tim cannot get hurt.", 1300);
      return;
    }
    if (pointInRect(point, 645, 215, 110, 80)) {
      cheatsEnabled = false;
      showMessage("Cheats OFF. Tim can get hurt.", 1300);
      return;
    }
    if (pointInRect(point, 362, 470, 300, 62)) {
      screen = "menu";
    }
  }

  if (screen === "howToPlay" && pointInRect(point, 362, 470, 300, 62)) {
    screen = "menu";
  }
}

function handleFirstPersonClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

  if (firstPersonPlace !== "street") {
    interact();
    return;
  }

  if (selectedRegion?.name === "Baskerville" && x >= 80 && x <= 220 && y >= 110 && y <= 430) {
    firstPersonPlace = "gambling";
    showMessage("Tim opened the Gambling building.", 1500);
    return;
  }

  if (selectedRegion?.name === "Baskerville" && x >= 830 && x <= 980 && y >= 80 && y <= 410) {
    firstPersonPlace = "clock";
    showMessage("Tim opened the clock building door and hid inside.", 1500);
    return;
  }

  if (x >= 326 && x <= 388 && y >= 540 && y <= 602) {
    interact();
  }
}

function handleHeavenClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

  if (x >= 334 && x <= 690 && y >= 536 && y <= 598) {
    leaveHeaven();
    return;
  }

  if (heavenPlace === "items") {
    if (y >= 112 && y <= 198 && x >= 150 && x <= 340) {
      buyHeavenItem("choc");
      return;
    }
    if (y >= 112 && y <= 198 && x >= 410 && x <= 600) {
      buyHeavenItem("ai");
      return;
    }
    if (y >= 112 && y <= 198 && x >= 700 && x <= 890) {
      buyHeavenItem("reviver");
      return;
    }
    heavenPlace = "clouds";
    return;
  }

  if (x >= 595 && x <= 745 && y >= 275 && y <= 410) {
    heavenPlace = "items";
    showMessage("Welcome to the item shop.", 1200);
    return;
  }

  if (x >= 260 && x <= 410 && y >= 275 && y <= 410) {
    coins += 2;
    showMessage("The coin shop gave Tim 2 heaven coins.", 1200);
    return;
  }

  showMessage("Click GO OUT OF HEAVEN to come out.", 1200);
}

function buyHeavenItem(item) {
  const prices = { choc: 5, ai: 15, reviver: 10 };
  if (coins < prices[item]) {
    showMessage("Not enough heaven coins.", 1200);
    return;
  }

  coins -= prices[item];
  if (item === "choc") {
    chocBoosts += 1;
    player.speed += 1.2;
    showMessage("Bought Choc. Tim is faster!", 1400);
  }
  if (item === "ai") {
    aiCompanions += 1;
    showMessage("Bought an AI companion. It slowly fights enemies.", 1500);
  }
  if (item === "reviver") {
    revivers += 1;
    showMessage("Bought a Reviver.", 1200);
  }
}

function baseSpeedForRegion(region) {
  return region?.name === "Snow" ? 2.55 : 4;
}

function baseSpeedForCurrentRegion() {
  return baseSpeedForRegion(selectedRegion);
}

function removeAllAbilities() {
  aiCompanions = 0;
  revivers = 0;
  superPower = false;
  hasZapSlash = false;
  chocBoosts = 0;
  if (player) {
    player.speed = baseSpeedForCurrentRegion();
    player.height = 0;
  }
  showMessage("All abilities removed.", 1300);
}

removeAbilities.addEventListener("click", removeAllAbilities);

mobileControls.addEventListener("pointerdown", (event) => {
  const control = event.target.closest("[data-control]")?.dataset.control;
  if (!control) {
    return;
  }
  event.preventDefault();

  if (control === "interact") {
    interact();
    return;
  }

  if (control === "up" && isFirstPerson()) {
    climbThing();
  }

  const keyByControl = {
    up: "arrowup",
    down: "arrowdown",
    left: "arrowleft",
    right: "arrowright",
  };
  keys.add(keyByControl[control]);
});

mobileControls.addEventListener("pointerup", (event) => {
  const control = event.target.closest("[data-control]")?.dataset.control;
  const keyByControl = {
    up: "arrowup",
    down: "arrowdown",
    left: "arrowleft",
    right: "arrowright",
  };
  if (control && keyByControl[control]) {
    keys.delete(keyByControl[control]);
  }
});

restart.addEventListener("click", resetGame);
nextLevel.addEventListener("click", continueAdventure);

tick();
