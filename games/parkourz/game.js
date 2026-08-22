const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;
ctx.lineJoin = "round";
ctx.lineCap = "round";
const heartsEl = document.querySelector("#hearts");
const powerLabel = document.querySelector("#powerLabel");
const messageEl = document.querySelector("#message");
const restartBtn = document.querySelector("#restart");
const skipLevelBtn = document.querySelector("#skipLevel");
const mainMenuBtn = document.querySelector("#mainMenu");
const menuEl = document.querySelector("#menu");
const builderToolsEl = document.querySelector("#builderTools");
const arenaToolsEl = document.querySelector("#arenaTools");
const mainMenuButtonsEl = document.querySelector("#mainMenuButtons");
const miniGamesMenuEl = document.querySelector("#miniGamesMenu");
const storyModeBtn = document.querySelector("#storyMode");
const miniGamesBtn = document.querySelector("#miniGames");
const movingMayhemBtn = document.querySelector("#movingMayhem");
const fogapocoBtn = document.querySelector("#fogapoco");
const timeTwistBtn = document.querySelector("#timeTwist");
const nightNinjasBtn = document.querySelector("#nightNinjas");
const meInvadersBtn = document.querySelector("#meInvaders");
const enemyPickerEl = document.querySelector("#enemyPicker");
const survivalModeBtn = document.querySelector("#survivalMode");
const tankyTownBtn = document.querySelector("#tankyTown");
const arenaModeBtn = document.querySelector("#arenaMode");
const builderModeBtn = document.querySelector("#builderMode");
const backToMainMenuBtn = document.querySelector("#backToMainMenu");
const playCustomBtn = document.querySelector("#playCustom");
const arenaFightBtn = document.querySelector("#arenaFight");
const moveOnBtn = document.querySelector("#moveOn");

const W = canvas.width;
const H = canvas.height;
const gravity = 0.62;
const keys = new Set();
const powers = ["big", "fire", "ice", "laser"];

let player;
let camera;
let blocks;
let luckyBlocks;
let pipes;
let enemies;
let shots;
let particles;
let powerups;
let spikyBoxes;
let movingPlatforms;
let flag;
let won;
let currentLevel;
let worldWidth;
let spawnPoint;
let messageTimer;
let pipeCooldown;
let screen = "menu";
let editorTool = "block";
let customCourse;
let invader;
let runner;
let survivalWave = 0;
let survivalTimer = 0;
let survivalSpawnTimer = 0;
let bossHitsTotal = 0;
let bossHitsNeeded = 0;
let rescueFriend = null;
let campfires = [];
let tankyShops = [];
let paradePeople = [];
let storyParadeUnlocked = false;
let paradeFirstPerson = false;
let allyPlayers = [];
let arenaFighters = [];
let arenaSummonCount = 0;
let arenaSelectedType = "enemy";
let arenaFightStarted = false;
let dungeonIntroTimer = 0;
let dungeonFade = 0;
let magicCrystals = [];
let crystalsCollected = 0;
let gearState = {
  flashlightOwned: false,
  flashlightEquipped: false,
  hoverboardOwned: false,
  hoverboardEquipped: false
};
let tankyPlayer;
let tankyTanks;
let tankyShots;
let tankyBuildings;
let tankyWanted = false;
let tankyPoliceTimer = 0;
let tankyLastFire = 0;

function resetGame() {
  screen = "story";
  showGameUi();
  moveOnBtn.classList.add("hidden");
  player = {
    x: 80,
    y: 320,
    w: 26,
    h: 42,
    vx: 0,
    vy: 0,
    dir: 1,
    onGround: false,
    hearts: 5,
    invincible: 0,
    kickTimer: 0,
    crawling: false,
    power: "tiny",
    ammo: 0,
    bigTimer: 0,
    giantTimer: 0,
    slowTimer: 0,
    knockedTimer: 0,
    thrownDamage: 0,
    thrownBy: 0
  };

  camera = { x: 0 };
  currentLevel = 1;
  won = false;
  loadLevel(currentLevel, "GET TO THE FLAG");
}

function ensurePlayer() {
  if (player) return;
  player = {
    x: 80,
    y: 320,
    w: 26,
    h: 42,
    vx: 0,
    vy: 0,
    dir: 1,
    onGround: false,
    hearts: 5,
    invincible: 0,
    kickTimer: 0,
    crawling: false,
    power: "tiny",
    ammo: 0,
    bigTimer: 0,
    giantTimer: 0,
    slowTimer: 0,
    knockedTimer: 0,
    thrownDamage: 0,
    thrownBy: 0
  };
  camera = { x: 0 };
}

function isNinjaCrystalLevel() {
  return currentLevel === 12 || currentLevel === 13 || currentLevel === 14;
}

function crystalGoal() {
  return isNinjaCrystalLevel() ? 1 : 0;
}

function crystalHud() {
  return `CRYSTAL ${crystalsCollected}/${crystalGoal() || 1}`;
}

function loadLevel(level, message) {
  ensurePlayer();
  currentLevel = level;
  blocks = [];
  luckyBlocks = [];
  pipes = [];
  enemies = [];
  shots = [];
  particles = [];
  powerups = [];
  spikyBoxes = [];
  movingPlatforms = [];
  rescueFriend = null;
  campfires = [];
  tankyShops = [];
  paradePeople = [];
  paradeFirstPerson = false;
  allyPlayers = [];
  dungeonIntroTimer = 0;
  dungeonFade = 0;
  magicCrystals = [];
  crystalsCollected = 0;
  moveOnBtn.classList.add("hidden");
  invader = null;
  runner = null;
  messageTimer = 0;
  pipeCooldown = 0;
  player.vx = 0;
  player.vy = 0;
  player.crawling = false;
  player.power = "tiny";
  player.ammo = 0;
  player.bigTimer = 0;
  player.giantTimer = 0;
  player.slowTimer = 0;
  player.knockedTimer = 0;
  player.thrownDamage = 0;
  player.thrownBy = 0;

  if (level === 1) {
    worldWidth = 3100;
    spawnPoint = { x: 80, y: 320 };
    flag = { x: 2800, y: 270, w: 38, h: 150 };
    addGround(worldWidth);
    addBlocks();
    addLuckyBlocks();
    addPipes();
    addEnemies();
  } else if (level === 2) {
    worldWidth = 2700;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2450, y: 270, w: 38, h: 150 };
    addLevelTwo();
  } else if (level === 3) {
    worldWidth = 2800;
    spawnPoint = { x: 90, y: 330 };
    flag = { x: 2520, y: 240, w: 38, h: 150 };
    addLevelThree();
  } else if (level === 4) {
    worldWidth = 3200;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2960, y: 270, w: 38, h: 150 };
    addTankBossLevel();
  } else if (level === 5) {
    worldWidth = 3000;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2760, y: 250, w: 38, h: 150 };
    addLevelFive();
  } else if (level === 8) {
    worldWidth = 3400;
    spawnPoint = { x: 110, y: 326 };
    flag = { x: 3050, y: 120, w: 38, h: 150 };
    addLevelSix();
  } else if (level === 9) {
    worldWidth = 2800;
    spawnPoint = { x: 100, y: 320 };
    flag = { x: 2580, y: 250, w: 38, h: 150 };
    addLevelSeven();
  } else if (level === 10) {
    worldWidth = 3600;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 3360, y: 220, w: 38, h: 150 };
    addLevelEight();
  } else if (level === 11) {
    worldWidth = 960;
    spawnPoint = { x: 160, y: 360 };
    flag = { x: 9999, y: 9999, w: 38, h: 150 };
    addDungeonIntro();
  } else if (level === 12) {
    worldWidth = 2200;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 1980, y: 250, w: 38, h: 150 };
    addNinjaCrystalLevel(0);
  } else if (level === 13) {
    worldWidth = 2500;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2280, y: 214, w: 38, h: 150 };
    addNinjaCrystalLevel(1);
  } else if (level === 14) {
    worldWidth = 2900;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2660, y: 200, w: 38, h: 150 };
    addNinjaCrystalLevel(2);
  } else if (level === 15) {
    worldWidth = 960;
    spawnPoint = { x: 160, y: 360 };
    flag = { x: 9999, y: 9999, w: 38, h: 150 };
    addGuideFarewellRoom();
  } else if (level === 16) {
    worldWidth = 2500;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2280, y: 250, w: 38, h: 150 };
    addSlimRivalLevel();
  } else if (level === 17) {
    worldWidth = 2800;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2580, y: 250, w: 38, h: 150 };
    addPotionGiantLevel();
  } else if (level === 18) {
    worldWidth = 3000;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2760, y: 230, w: 38, h: 150 };
    addRainChallengerLevel();
  } else if (level === 40) {
    worldWidth = 2500;
    spawnPoint = { x: 80, y: 320 };
    flag = { x: 2300, y: 240, w: 38, h: 150 };
    addMovingMayhem();
  } else if (level === 50) {
    addCustomPlayLevel();
  } else if (level === 60) {
    worldWidth = 2600;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2380, y: 260, w: 38, h: 150 };
    addFogapocoLevel();
  } else if (level === 70) {
    worldWidth = 3000;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2760, y: 250, w: 38, h: 150 };
    addTimeTwistLevel();
  } else if (level === 90) {
    worldWidth = 3200;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2960, y: 230, w: 38, h: 150 };
    addNightNinjasLevel();
  } else if (level === 19) {
    worldWidth = 2800;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 2560, y: 250, w: 38, h: 150 };
    addEvokerDungeonLevel();
  } else if (level === 6) {
    worldWidth = 2300;
    spawnPoint = { x: 90, y: 320 };
    flag = { x: 9999, y: 9999, w: 38, h: 150 };
    addSurvivalArena();
  } else {
    addCustomPlayLevel();
  }

  player.x = spawnPoint.x;
  player.y = spawnPoint.y;
  setPlayerSize(26, 42);
  camera.x = 0;
  updateHud(message);
}

function startMovingMayhem() {
  screen = "mayhem";
  showGameUi();
  ensurePlayer();
  player.hearts = 5;
  won = false;
  loadLevel(40, "MOVING MAYHEM!");
}

function startFogapoco() {
  screen = "fogapoco";
  showGameUi();
  ensurePlayer();
  player.hearts = 5;
  won = false;
  loadLevel(60, "FOGAPOCO");
}

function startTimeTwist() {
  screen = "timetwist";
  showGameUi();
  ensurePlayer();
  player.hearts = 5;
  won = false;
  loadLevel(70, "TIME TWIST");
}

function startNightNinjas() {
  screen = "nightninjas";
  showGameUi();
  ensurePlayer();
  player.hearts = 5;
  won = false;
  loadLevel(90, "NIGHT OF THE NINJAS!");
}

function startArena() {
  screen = "arena";
  showGameUi();
  arenaToolsEl.classList.remove("hidden");
  ensurePlayer();
  won = false;
  currentLevel = 80;
  worldWidth = W;
  camera.x = 0;
  blocks = [];
  luckyBlocks = [];
  pipes = [];
  enemies = [];
  arenaFighters = [];
  arenaSummonCount = 0;
  arenaSelectedType = "enemy";
  arenaFightStarted = false;
  shots = [];
  particles = [];
  powerups = [];
  spikyBoxes = [];
  movingPlatforms = [];
  flag = { x: 9999, y: 9999, w: 38, h: 150 };
  blocks.push({ x: 0, y: 468, w: W, h: 72, type: "metal" });
  blocks.push({ x: 210, y: 360, w: 160, h: 24, type: "metal" });
  blocks.push({ x: 590, y: 360, w: 160, h: 24, type: "metal" });
  setActiveArenaTool("enemy");
  updateHud("ARENA: CHOOSE, PLACE, FIGHT!");
}

function startMeInvaders(kind) {
  screen = "invaders";
  showGameUi();
  ensurePlayer();
  won = false;
  currentLevel = 7;
  worldWidth = 2300;
  camera.x = 0;
  blocks = [];
  luckyBlocks = [];
  pipes = [];
  enemies = [];
  shots = [];
  particles = [];
  powerups = [];
  spikyBoxes = [];
  movingPlatforms = [];
  flag = { x: 2100, y: 290, w: 38, h: 150 };
  addGround(worldWidth);
  [
    [360, 390, 160, 28],
    [760, 330, 160, 28],
    [1160, 390, 160, 28],
    [1540, 330, 160, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "brick" }));

  runner = {
    x: 80,
    y: 426,
    w: 26,
    h: 42,
    vx: 2.2,
    vy: 0,
    onGround: false,
    jumpCooldown: 0,
    hearts: 3
  };

  invader = makeInvader(kind);
  updateHud(`ME INVADERS: ${kind.toUpperCase()}`);
}

function makeInvader(kind) {
  if (kind === "skeleton") return { x: 720, y: 426, w: 30, h: 42, vx: 0, vy: 0, dir: -1, onGround: false, kind: "skeleton" };
  if (kind === "spiky") return { x: 720, y: 416, w: 52, h: 52, vx: 0, vy: 0, dir: -1, onGround: false, kind: "spiky" };
  if (kind === "miniBoss") return { x: 720, y: 420, w: 36, h: 48, vx: 0, vy: 0, dir: -1, onGround: false, kind: "miniBoss" };
  return { x: 720, y: 426, w: 32, h: 42, vx: 0, vy: 0, dir: -1, onGround: false, kind: "boss" };
}

function makeMiniBoss(x, y, vx = 1, left = x - 100, right = x + 120) {
  return {
    x,
    y,
    w: 36,
    h: 48,
    vx,
    left,
    right,
    frozen: 0,
    alive: true,
    kind: "miniBoss"
  };
}

function addMovingMayhem() {
  addGround(worldWidth);
  [
    [260, 385, 118, 24, 280, 410, 0.07],
    [520, 315, 118, 24, 230, 420, 0.06],
    [780, 385, 118, 24, 270, 430, 0.08],
    [1060, 300, 118, 24, 220, 410, 0.065],
    [1360, 370, 118, 24, 260, 430, 0.075],
    [1680, 320, 118, 24, 220, 420, 0.07],
    [2000, 380, 118, 24, 250, 430, 0.08]
  ].forEach(([x, y, w, h, topY, bottomY, speed]) => movingPlatforms.push({
    x,
    y,
    previousY: y,
    w,
    h,
    topY,
    bottomY,
    speed,
    phase: Math.random() * Math.PI * 2
  }));

  [
    [420, 380, 380, 300, 430, 0.05],
    [1220, 350, 350, 245, 420, 0.055],
    [1900, 370, 370, 260, 430, 0.06]
  ].forEach(([x, y, baseY, topY, bottomY, speed]) => spikyBoxes.push({
    x,
    y,
    w: 52,
    h: 52,
    baseY,
    topY,
    bottomY,
    speed,
    phase: Math.random() * Math.PI * 2
  }));
}

function addFogapocoLevel() {
  addGround(worldWidth);
  [
    [300, 388, 180, 28],
    [640, 322, 180, 28],
    [1000, 388, 180, 28],
    [1370, 322, 180, 28],
    [1740, 388, 180, 28],
    [2100, 322, 180, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "brick" }));

  [
    [520, 280, -1],
    [1140, 280, 1],
    [1850, 280, -1]
  ].forEach(([x, y, dir]) => enemies.push(makeCaster(x, y, dir)));
}

function addTimeTwistLevel() {
  addGround(worldWidth);
  [
    [260, 394, 180, 28],
    [600, 330, 180, 28],
    [940, 394, 180, 28],
    [1280, 330, 180, 28],
    [1700, 394, 190, 28],
    [2060, 326, 190, 28],
    [2440, 394, 190, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: x < 1500 ? "sandstone" : "future" }));

  [
    [380, 426, 0.65, 300, 520],
    [760, 362, 0.7, 620, 860],
    [1160, 426, 0.68, 1040, 1260]
  ].forEach(([x, y, vx, left, right]) => enemies.push(makeMummy(x, y, vx, left, right)));

  [
    [1810, 352, 1950, 2180],
    [2260, 284, 2200, 2460],
    [2580, 352, 2480, 2700]
  ].forEach(([x, y, left, right]) => enemies.push(makeFutureSkeleton(x, y, left, right)));
}

function makeMummy(x, y, vx, left, right) {
  return {
    x, y, w: 28, h: 42, vx, left, right,
    frozen: 0, alive: true, kind: "mummy"
  };
}

function makeFutureSkeleton(x, y, left, right) {
  return {
    x, y, w: 30, h: 42, vx: 0.95, left, right,
    frozen: 0, alive: true, kind: "futureSkeleton", laserCooldown: 180
  };
}

function startSurvival() {
  screen = "survival";
  showGameUi();
  ensurePlayer();
  player.hearts = 5;
  won = false;
  survivalWave = 0;
  survivalTimer = 0;
  survivalSpawnTimer = 30;
  loadLevel(6, "SURVIVAL WAVE 1");
}

function startTankyTown(paradeMode = storyParadeUnlocked) {
  screen = "tankytown";
  showGameUi();
  enemyPickerEl.classList.add("hidden");
  particles = [];
  tankyWanted = false;
  tankyPoliceTimer = 0;
  tankyLastFire = 0;
  tankyBuildings = [
    { x: 140, y: 110, w: 180, h: 140, color: "#5a7aa6" },
    { x: 430, y: 80, w: 150, h: 120, color: "#7c5fa4" },
    { x: 700, y: 130, w: 160, h: 150, color: "#4d7a66" },
    { x: 130, y: 330, w: 220, h: 120, color: "#8a6655" },
    { x: 470, y: 320, w: 140, h: 150, color: "#688b9a" },
    { x: 720, y: 350, w: 170, h: 110, color: "#84618d" }
  ];
  tankyPlayer = { x: 480, y: 270, w: 42, h: 42, dirX: 1, dirY: 0, speed: 3.1, hp: 5, color: "#5f767f" };
  tankyTanks = [
    makeTownTank(96, 90, false),
    makeTownTank(856, 110, false),
    makeTownTank(120, 462, false),
    makeTownTank(824, 468, false)
  ];
  tankyShots = [];
  paradeFirstPerson = paradeMode;
  tankyShops = [
    { x: 58, y: 34, w: 78, h: 60, item: "flashlight", label: "FLASHLIGHT" },
    { x: 822, y: 34, w: 78, h: 60, item: "hoverboard", label: "HOVERBOARD" }
  ];
  paradePeople = paradeMode ? makeParadePeople() : [];
  won = false;
  updateHud(paradeMode ? "PARADE PARTY! SHOPS OPEN" : "TANKY TOWN");
}

function makeParadePeople() {
  return [
    { x: 210, y: 220, shirt: "#244fa8", accent: "#ffd028", skin: "#f2c39d" },
    { x: 260, y: 226, shirt: "#ba2d2d", accent: "#ffffff", skin: "#d89a73" },
    { x: 308, y: 222, shirt: "#244fa8", accent: "#ff9d00", skin: "#8a5b3b" },
    { x: 356, y: 228, shirt: "#2f9f68", accent: "#ffffff", skin: "#f5d4bc" },
    { x: 404, y: 224, shirt: "#ba2d2d", accent: "#ffd028", skin: "#b87755" },
    { x: 552, y: 220, shirt: "#244fa8", accent: "#ffd028", skin: "#6c452e" },
    { x: 602, y: 226, shirt: "#8f3bb7", accent: "#ffffff", skin: "#e0b389" },
    { x: 650, y: 222, shirt: "#244fa8", accent: "#ff9d00", skin: "#a66c48" },
    { x: 698, y: 228, shirt: "#ff5a3a", accent: "#ffffff", skin: "#f3cdaa" }
  ].map((person, index) => ({
    ...person,
    vx: index % 2 === 0 ? 0.55 : -0.5,
    vy: index % 3 === 0 ? 0.22 : -0.18,
    inside: false,
    insideTimer: 0,
    design: index % 4
  }));
}

function paradeEntrances() {
  return tankyBuildings.map(building => ({
    x: building.x + building.w / 2,
    y: building.y + building.h - 12
  }));
}

function tickParadePeople() {
  const entrances = paradeEntrances();
  for (const person of paradePeople) {
    if (person.inside) {
      person.insideTimer--;
      if (person.insideTimer <= 0) {
        person.inside = false;
        const entry = entrances[Math.floor(Math.random() * entrances.length)];
        person.x = entry.x + (Math.random() - 0.5) * 40;
        person.y = entry.y + 10 + Math.random() * 30;
      }
      continue;
    }
    person.x += person.vx;
    person.y += person.vy;
    if (person.x < 120 || person.x > 820) person.vx *= -1;
    if (person.y < 185 || person.y > 452) person.vy *= -1;
    for (const entry of entrances) {
      if (Math.abs(person.x - entry.x) < 16 && Math.abs(person.y - entry.y) < 20 && Math.random() < 0.015) {
        person.inside = true;
        person.insideTimer = 100 + Math.random() * 150;
        break;
      }
    }
  }
}

function projectParadePerson(person) {
  const depth = clamp((person.y - 150) / 320, 0.18, 1);
  return {
    depth,
    screenX: 480 + (person.x - tankyPlayer.x) * (0.72 + depth * 0.45),
    scale: 0.55 + depth * 1.1,
    baseline: 170 + depth * 250
  };
}

function drawParadeFirstPerson() {
  ctx.clearRect(0, 0, W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#64b5ff");
  sky.addColorStop(0.58, "#dff4ff");
  sky.addColorStop(1, "#b98d69");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  drawCloud(90, 68);
  drawCloud(700, 82);

  const buildings = [
    { x: 56, y: 86, w: 156, h: 230, edge: "#5a677f" },
    { x: 228, y: 128, w: 104, h: 188, edge: "#5d6984" },
    { x: 620, y: 102, w: 122, h: 214, edge: "#5b6880" },
    { x: 756, y: 136, w: 108, h: 180, edge: "#606d88" }
  ];
  for (const building of buildings) {
    ctx.fillStyle = "#8c9ab2";
    pixelRect(building.x, building.y, building.w, building.h);
    ctx.strokeStyle = building.edge;
    ctx.lineWidth = 4;
    ctx.strokeRect(building.x, building.y, building.w, building.h);
    ctx.fillStyle = "#d4dde8";
    for (let x = building.x + 16; x < building.x + building.w - 12; x += 22) {
      for (let y = building.y + 18; y < building.y + building.h - 18; y += 28) {
        pixelRect(x, y, 10, 16);
      }
    }
  }

  ctx.fillStyle = "#495463";
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(280, 258);
  ctx.lineTo(680, 258);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6b7688";
  ctx.lineWidth = 3;
  line(0, H, 280, 258);
  line(W, H, 680, 258);
  line(280, 258, 680, 258);
  ctx.strokeStyle = "#f3cb5a";
  ctx.lineWidth = 8;
  line(462, H, 445, 320);
  line(498, H, 515, 320);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const leftX = 100 + i * 40;
    const rightX = 860 - i * 40;
    line(leftX, H, 360 + i * 18, 280);
    line(rightX, H, 600 - i * 18, 280);
  }

  tankyShops.forEach(drawTankyShop3D);
  drawParadeTank(176, 340, false);
  drawParadeTank(740, 340, true);
  paradePeople.filter(person => !person.inside)
    .sort((a, b) => a.y - b.y)
    .forEach(drawParadePersonFirstPerson);

  ctx.fillStyle = "rgba(24, 30, 42, 0.18)";
  pixelRect(0, H - 64, W, 64);
  ctx.fillStyle = "#f5d9c6";
  pixelRect(84, H - 52, 94, 52);
  pixelRect(W - 178, H - 52, 94, 52);
}

function makeTownTank(x, y, police) {
  return {
    x,
    y,
    w: 38,
    h: 38,
    dirX: 1,
    dirY: 0,
    speed: police ? 2.55 : 1.6,
    hp: police ? 3 : 2,
    fireCooldown: police ? 50 : 95,
    police,
    wanderTimer: 40 + Math.random() * 80,
    color: police ? "#1f3f8f" : "#6a7a54"
  };
}

function addSurvivalArena() {
  addGround(worldWidth);
  [
    [320, 386, 190, 28],
    [700, 318, 190, 28],
    [1120, 386, 190, 28],
    [1510, 318, 190, 28],
    [1900, 386, 190, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "brick" }));
  luckyBlocks.push({ x: 520, y: 250, w: 42, h: 42, used: false, bump: 0, forcedPower: "fire" });
  luckyBlocks.push({ x: 1360, y: 250, w: 42, h: 42, used: false, bump: 0, forcedPower: "ice" });
}

function openBuilder() {
  screen = "builder";
  hideMenu();
  builderToolsEl.classList.remove("hidden");
  arenaToolsEl.classList.add("hidden");
  ensurePlayer();
  currentLevel = 0;
  worldWidth = 2400;
  camera.x = 0;
  won = false;
  customCourse = {
    start: { x: 80, y: 410 },
    flag: { x: 2100, y: 300 },
    blocks: [
      { x: 0, y: 468, w: 2400, h: 72, type: "brick" },
      { x: 360, y: 390, w: 150, h: 28, type: "brick" },
      { x: 720, y: 330, w: 150, h: 28, type: "brick" }
    ],
    lucky: [],
    spikes: [],
    platforms: [],
    skeletons: [],
    miniBosses: [],
    bosses: [],
    tanks: []
  };
  updateHud("BUILD YOUR PARKOURZ");
  setActiveTool("block");
}

function addCustomPlayLevel() {
  worldWidth = 2400;
  spawnPoint = { x: customCourse.start.x, y: customCourse.start.y - 42 };
  flag = { x: customCourse.flag.x, y: customCourse.flag.y, w: 38, h: 150 };
  customCourse.blocks.forEach(b => blocks.push({ ...b }));
  customCourse.lucky.forEach(b => luckyBlocks.push({ ...b, w: 42, h: 42, used: false, bump: 0, forcedPower: "big" }));
  customCourse.spikes.forEach(s => spikyBoxes.push({ ...s, w: 52, h: 52, baseY: s.y, topY: s.y - 80, bottomY: s.y + 80, speed: 0.045, phase: 0 }));
  customCourse.platforms.forEach(p => movingPlatforms.push({ ...p, previousY: p.y, w: 118, h: 24, topY: p.y - 90, bottomY: p.y + 90, speed: 0.05, phase: 0 }));
  customCourse.skeletons.forEach(s => enemies.push(makeSkeleton(s.x, s.y, 1.1, s.x - 70, s.x + 110)));
  customCourse.miniBosses.forEach(m => enemies.push(makeMiniBoss(m.x, m.y, m.vx ?? 1, m.x - 90, m.x + 120)));
  customCourse.bosses.forEach(b => enemies.push(makeBoss(b.x, b.y, b.vx ?? 0.85)));
  customCourse.tanks.forEach((t, index) => enemies.push(makeTank(t.x, t.y, index)));
}

function playCustomCourse() {
  screen = "custom";
  showGameUi();
  builderToolsEl.classList.add("hidden");
  arenaToolsEl.classList.add("hidden");
  ensurePlayer();
  player.hearts = 5;
  won = false;
  loadLevel(50, "YOUR PARKOURZ!");
}

function setActiveTool(tool) {
  editorTool = tool;
  builderToolsEl.querySelectorAll("[data-tool]").forEach(button => {
    button.classList.toggle("active", button.dataset.tool === tool);
  });
}

function handleBuilderClick(event) {
  if (screen !== "builder") return;
  const point = canvasPoint(event);
  const x = Math.floor((point.x + camera.x) / 42) * 42;
  const y = Math.floor(point.y / 42) * 42;

  if (editorTool === "erase") {
    eraseCustomAt(x, y);
    return;
  }
  if (editorTool === "block") customCourse.blocks.push({ x, y, w: 84, h: 42, type: currentLevel === 3 ? "basalt" : "brick" });
  if (editorTool === "lucky") customCourse.lucky.push({ x, y });
  if (editorTool === "spike") customCourse.spikes.push({ x, y });
  if (editorTool === "platform") customCourse.platforms.push({ x, y });
  if (editorTool === "skeleton") customCourse.skeletons.push({ x, y });
  if (editorTool === "miniBoss") customCourse.miniBosses.push({ x, y, vx: 1 });
  if (editorTool === "boss") customCourse.bosses.push({ x, y, vx: 0.85 });
  if (editorTool === "tank") customCourse.tanks.push({ x, y });
  if (editorTool === "flag") customCourse.flag = { x, y: Math.max(120, y - 82) };
  if (editorTool === "player") customCourse.start = { x, y };
}

function eraseCustomAt(x, y) {
  const near = item => Math.abs(item.x - x) < 50 && Math.abs(item.y - y) < 50;
  customCourse.blocks = customCourse.blocks.filter(item => !near(item) || item.y === 468);
  customCourse.lucky = customCourse.lucky.filter(item => !near(item));
  customCourse.spikes = customCourse.spikes.filter(item => !near(item));
  customCourse.platforms = customCourse.platforms.filter(item => !near(item));
  customCourse.skeletons = customCourse.skeletons.filter(item => !near(item));
  customCourse.miniBosses = customCourse.miniBosses.filter(item => !near(item));
  customCourse.bosses = customCourse.bosses.filter(item => !near(item));
  customCourse.tanks = customCourse.tanks.filter(item => !near(item));
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function addGround(width) {
  for (let x = 0; x < width; x += 48) {
    blocks.push({ x, y: 468, w: 48, h: 72, type: "brick" });
  }
  [
    [420, 390, 130, 28],
    [690, 338, 150, 28],
    [1040, 382, 160, 28],
    [1320, 314, 170, 28],
    [1680, 378, 190, 28],
    [2050, 330, 170, 28],
    [2340, 390, 170, 28],
    [2580, 332, 190, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "brick" }));
}

function addLevelTwo() {
  addGround(worldWidth);
  [
    [330, 382, 150, 28],
    [620, 316, 160, 28],
    [920, 390, 150, 28],
    [1210, 326, 170, 28],
    [1540, 378, 170, 28],
    [1880, 310, 170, 28],
    [2180, 388, 160, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "brick" }));

  [
    [520, 236, "ice"],
    [1460, 248, "laser"],
    [2040, 220, "fire"]
  ].forEach(([x, y, power]) => luckyBlocks.push({ x, y, w: 42, h: 42, used: false, bump: 0, forcedPower: power }));

  [
    [690, 392, 392, 300, 430, 0.035],
    [1110, 350, 392, 270, 420, 0.045],
    [1710, 388, 388, 285, 430, 0.04],
    [2260, 390, 390, 305, 430, 0.05]
  ].forEach(([x, y, baseY, topY, bottomY, speed]) => spikyBoxes.push({
    x,
    y,
    w: 52,
    h: 52,
    baseY,
    topY,
    bottomY,
    speed,
    phase: Math.random() * Math.PI * 2
  }));

  enemies.push({ x: 1300, y: 426, w: 32, h: 42, vx: 1.25, left: 1200, right: 1460, frozen: 0, alive: true });
  enemies.push({ x: 1970, y: 426, w: 32, h: 42, vx: 1.35, left: 1870, right: 2140, frozen: 0, alive: true });
}

function addLevelThree() {
  [
    [0, 452, 260, 34],
    [370, 390, 150, 28],
    [720, 330, 150, 28],
    [1120, 382, 170, 28],
    [1540, 320, 160, 28],
    [1980, 374, 170, 28],
    [2390, 390, 260, 34]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "basalt" }));

  [
    [300, 360, 360, 275, 410, 0.045],
    [600, 300, 300, 230, 395, 0.04],
    [930, 380, 380, 280, 430, 0.05],
    [1360, 335, 335, 245, 420, 0.042],
    [1760, 370, 370, 255, 430, 0.048],
    [2200, 320, 320, 230, 410, 0.044]
  ].forEach(([x, y, baseY, topY, bottomY, speed]) => movingPlatforms.push({
    x,
    y,
    previousY: y,
    w: 118,
    h: 24,
    baseY,
    topY,
    bottomY,
    speed,
    phase: Math.random() * Math.PI * 2
  }));

  [
    [520, 252, "fire"],
    [1240, 260, "ice"],
    [1880, 242, "laser"]
  ].forEach(([x, y, power]) => luckyBlocks.push({ x, y, w: 42, h: 42, used: false, bump: 0, forcedPower: power }));

  enemies.push(makeSkeleton(430, 348, 1, 370, 520));
  enemies.push(makeSkeleton(1180, 340, 1.2, 1120, 1290));
  enemies.push(makeSkeleton(2050, 332, 1.3, 1980, 2150));
}

function addTankBossLevel() {
  addGround(worldWidth);
  [
    [360, 382, 180, 28],
    [760, 318, 170, 28],
    [1180, 384, 180, 28],
    [1600, 318, 170, 28],
    [2020, 384, 180, 28],
    [2460, 324, 190, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "metal" }));

  [
    [690, 416],
    [1500, 416],
    [2260, 416]
  ].forEach(([x, y], index) => enemies.push(makeTank(x, y, index)));

  luckyBlocks.push({ x: 520, y: 245, w: 42, h: 42, used: false, bump: 0, forcedPower: "big" });
  luckyBlocks.push({ x: 1780, y: 245, w: 42, h: 42, used: false, bump: 0, forcedPower: "ice" });
  bossHitsTotal = 0;
  bossHitsNeeded = 0;
}

function addLevelFive() {
  addGround(worldWidth);
  [
    [300, 388, 170, 28],
    [640, 324, 180, 28],
    [980, 388, 170, 28],
    [1320, 320, 180, 28],
    [1680, 384, 180, 28],
    [2060, 316, 190, 28],
    [2440, 380, 190, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "brick" }));

  [
    [520, 240, "fire"],
    [1480, 242, "ice"],
    [2280, 232, "big"]
  ].forEach(([x, y, power]) => luckyBlocks.push({ x, y, w: 42, h: 42, used: false, bump: 0, forcedPower: power }));

  [
    [420, 346, -1],
    [770, 282, 1],
    [1130, 346, -1],
    [1480, 278, 1],
    [1860, 342, -1],
    [2260, 274, 1],
    [2620, 338, -1]
  ].forEach(([x, y, dir]) => enemies.push(makeCaster(x, y, dir)));
}

function addLevelSix() {
  addGround(worldWidth);
  [
    [230, 404, 150, 28],
    [470, 348, 150, 28],
    [720, 294, 150, 28],
    [970, 240, 150, 28],
    [1260, 390, 170, 28],
    [1510, 332, 170, 28],
    [1760, 274, 170, 28],
    [2010, 216, 170, 28],
    [2260, 306, 180, 28],
    [2510, 248, 180, 28],
    [2760, 190, 180, 28],
    [2980, 132, 160, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "metal" }));

  [
    [390, 438, 140, 30],
    [1150, 438, 150, 30],
    [2080, 438, 150, 30],
    [2860, 438, 160, 30]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "basalt" }));

  luckyBlocks.push({ x: 560, y: 224, w: 42, h: 42, used: false, bump: 0, forcedPower: "fire" });
  luckyBlocks.push({ x: 1690, y: 166, w: 42, h: 42, used: false, bump: 0, forcedPower: "ice" });
  luckyBlocks.push({ x: 2660, y: 110, w: 42, h: 42, used: false, bump: 0, forcedPower: "laser" });

  movingPlatforms.push({ x: 860, y: 360, previousY: 360, w: 118, h: 24, topY: 250, bottomY: 410, speed: 0.055, phase: 0.6 });
  movingPlatforms.push({ x: 2140, y: 258, previousY: 258, w: 118, h: 24, topY: 170, bottomY: 360, speed: 0.05, phase: 1.7 });

  spikyBoxes.push({ x: 1080, y: 382, w: 52, h: 52, baseY: 382, topY: 272, bottomY: 430, speed: 0.05, phase: 0.4 });
  spikyBoxes.push({ x: 2400, y: 370, w: 52, h: 52, baseY: 370, topY: 250, bottomY: 430, speed: 0.055, phase: 1.1 });

  pipes.push({ x: 90, y: 372, w: 70, h: 96, target: 1860 });
  pipes.push({ x: 1860, y: 372, w: 70, h: 96, target: 90 });

  enemies.push({ x: 320, y: 426, w: 32, h: 42, vx: 1.2, left: 250, right: 430, frozen: 0, alive: true });
  enemies.push(makeSkeleton(690, 252, 0.95, 660, 860));
  enemies.push(makeMummy(1320, 348, 0.58, 1240, 1450));
  enemies.push(makeMiniBoss(1600, 284, 0.95, 1490, 1710));
  enemies.push(makeFutureSkeleton(2320, 264, 2220, 2470));
  enemies.push(makeCaster(2590, 206, -1));
  enemies.push(makeTank(2820, 386, 0));
  enemies.push(makeGorillaBoss(420, 168));
  rescueFriend = { x: flag.x + 62, y: flag.y + 42 };
}

function addLevelSeven() {
  addGround(worldWidth);
  [
    [360, 392, 180, 28],
    [720, 328, 180, 28],
    [1100, 392, 180, 28],
    [1470, 328, 180, 28],
    [1830, 392, 180, 28],
    [2210, 328, 180, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "metal" }));

  luckyBlocks.push({ x: 540, y: 248, w: 42, h: 42, used: false, bump: 0, forcedPower: "fire" });
  luckyBlocks.push({ x: 1650, y: 248, w: 42, h: 42, used: false, bump: 0, forcedPower: "ice" });
  luckyBlocks.push({ x: 2350, y: 248, w: 42, h: 42, used: false, bump: 0, forcedPower: "laser" });

  campfires = [
    { x: 280, y: 442, size: 1 },
    { x: 955, y: 442, size: 1.08 },
    { x: 1710, y: 442, size: 1.04 },
    { x: 2480, y: 442, size: 1.12 }
  ];

  enemies.push(makeRivalPlayer(2020, 284));
}

function addLevelEight() {
  addGround(worldWidth);
  [
    [300, 390, 170, 28],
    [620, 322, 170, 28],
    [980, 390, 170, 28],
    [1340, 322, 170, 28],
    [1700, 390, 170, 28],
    [2080, 322, 170, 28],
    [2440, 390, 170, 28],
    [2800, 322, 170, 28],
    [3140, 256, 180, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "metal" }));

  luckyBlocks.push({ x: 720, y: 248, w: 42, h: 42, used: false, bump: 0, forcedPower: "fire" });
  luckyBlocks.push({ x: 1820, y: 248, w: 42, h: 42, used: false, bump: 0, forcedPower: "ice" });
  luckyBlocks.push({ x: 2890, y: 180, w: 42, h: 42, used: false, bump: 0, forcedPower: "laser" });
  movingPlatforms.push({ x: 1150, y: 344, previousY: 344, w: 118, h: 24, topY: 250, bottomY: 410, speed: 0.055, phase: 0.3 });
  movingPlatforms.push({ x: 2260, y: 344, previousY: 344, w: 118, h: 24, topY: 250, bottomY: 410, speed: 0.05, phase: 1.1 });
  spikyBoxes.push({ x: 1540, y: 380, w: 52, h: 52, baseY: 380, topY: 280, bottomY: 430, speed: 0.05, phase: 0.5 });

  allyPlayers = [
    makeAllyPlayer(130, 426, "#c22d24", "#f0f0f0"),
    makeAllyPlayer(170, 426, "#244fa8", "#ffd028"),
    makeAllyPlayer(210, 426, "#2f9f68", "#7fd0ff"),
    makeAllyPlayer(250, 426, "#8f3bb7", "#ffb27d")
  ];

  enemies.push(makeBigGrabber(900, 378, 800, 1060));
  enemies.push(makeBigGrabber(1960, 378, 1860, 2140));
  enemies.push(makeBigGrabber(2920, 310, 2840, 3140));
}

function addDungeonIntro() {
  blocks.push({ x: 0, y: 468, w: worldWidth, h: 72, type: "basalt" });
  blocks.push({ x: 360, y: 392, w: 240, h: 28, type: "basalt" });
  dungeonIntroTimer = 0;
  dungeonFade = 0;
  updateHud("DUNGEON HELP NEEDED");
}

function addNinjaCrystalLevel(stage) {
  addGround(worldWidth);
  const stageData = [
    {
      name: "FROST CRYSTAL",
      crystal: { x: 1160, y: 276, color: "#7fd0ff" },
      platforms: [[320, 390, 170, 28], [660, 322, 170, 28], [1020, 390, 170, 28], [1400, 322, 180, 28], [1760, 390, 170, 28]],
      lucky: [[520, 248, "ice"], [1520, 248, "laser"]],
      ninjas: [
        [560, 426, "float", 460, 760],
        [1320, 426, "tiny", 1220, 1540],
        [1840, 426, "fist", 1740, 2020]
      ]
    },
    {
      name: "SHADOW CRYSTAL",
      crystal: { x: 1480, y: 276, color: "#d8a0ff" },
      platforms: [[300, 390, 160, 28], [620, 322, 170, 28], [960, 382, 150, 28], [1280, 306, 170, 28], [1660, 390, 170, 28], [2020, 286, 190, 28]],
      lucky: [[740, 248, "fire"], [1760, 316, "ice"], [2120, 212, "laser"]],
      ninjas: [
        [520, 426, "tiny", 430, 700],
        [1120, 426, "oneHeart", 1020, 1320],
        [1860, 426, "float", 1740, 2040],
        [2200, 426, "fist", 2100, 2360]
      ]
    },
    {
      name: "SUN CRYSTAL",
      crystal: { x: 2180, y: 260, color: "#ffe94c" },
      platforms: [[300, 390, 170, 28], [660, 322, 170, 28], [1040, 390, 170, 28], [1420, 322, 170, 28], [1800, 390, 170, 28], [2160, 306, 180, 28], [2500, 360, 190, 28]],
      lucky: [[500, 248, "fire"], [1260, 248, "laser"], [2020, 316, "ice"], [2440, 286, "big"]],
      ninjas: [
        [560, 426, "float", 460, 760],
        [1180, 426, "oneHeart", 1060, 1360],
        [1740, 426, "tiny", 1620, 1920],
        [2280, 426, "fist", 2140, 2480],
        [2580, 426, "fist", 2460, 2780, true]
      ]
    }
  ];
  const data = stageData[stage] || stageData[0];
  data.platforms.forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "basalt" }));
  data.lucky.forEach(([x, y, forcedPower]) => luckyBlocks.push({ x, y, w: 42, h: 42, used: false, bump: 0, forcedPower }));
  magicCrystals = [
    { x: data.crystal.x, y: data.crystal.y, w: 30, h: 38, color: data.crystal.color, collected: false }
  ];
  crystalsCollected = 0;
  player.power = "ninja";
  player.ammo = 999;

  data.ninjas.forEach(([x, y, ability, left, right, boss]) => enemies.push(makeEnemyNinja(x, y, ability, left, right, boss)));
  updateHud(`${data.name}: GET 1 CRYSTAL`);
}

function addGuideFarewellRoom() {
  blocks.push({ x: 0, y: 468, w: worldWidth, h: 72, type: "basalt" });
  blocks.push({ x: 320, y: 392, w: 300, h: 28, type: "basalt" });
  dungeonIntroTimer = 0;
  dungeonFade = 0;
  updateHud("GUIDE FAREWELL");
}

function addSlimRivalLevel() {
  addGround(worldWidth);
  [
    [280, 392, 160, 28],
    [610, 332, 180, 28],
    [980, 392, 160, 28],
    [1340, 332, 190, 28],
    [1720, 392, 170, 28],
    [2050, 326, 180, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "basalt" }));
  luckyBlocks.push({ x: 520, y: 258, w: 42, h: 42, used: false, bump: 0, forcedPower: "fire" });
  luckyBlocks.push({ x: 1160, y: 318, w: 42, h: 42, used: false, bump: 0, forcedPower: "ice" });
  luckyBlocks.push({ x: 1840, y: 318, w: 42, h: 42, used: false, bump: 0, forcedPower: "laser" });
  enemies.push(makeSlimRival(1760, 420));
  updateHud("SLIM RIVAL REMATCH!");
}

function addPotionGiantLevel() {
  addGround(worldWidth);
  [
    [280, 386, 170, 28],
    [620, 318, 180, 28],
    [960, 390, 170, 28],
    [1320, 318, 180, 28],
    [1680, 390, 170, 28],
    [2040, 318, 180, 28],
    [2380, 382, 170, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "brick" }));

  luckyBlocks.push({ x: 520, y: 244, w: 42, h: 42, used: false, bump: 0, forcedPower: "ice" });
  luckyBlocks.push({ x: 1180, y: 244, w: 42, h: 42, used: false, bump: 0, forcedPower: "laser" });
  luckyBlocks.push({ x: 1860, y: 316, w: 42, h: 42, used: false, bump: 0, forcedPower: "fire" });

  enemies.push(makeCaster(760, 426, -1));
  enemies.push(makeCaster(1500, 426, 1));
  enemies.push(makeCaster(2240, 426, -1));
  enemies.push(makeBigGrabber(1080, 392, 960, 1240));
  enemies.push(makeBigGrabber(1900, 392, 1780, 2100));
  updateHud("POTION GIANT GAUNTLET!");
}

function addRainChallengerLevel() {
  addGround(worldWidth);
  [
    [260, 390, 170, 28],
    [560, 322, 180, 28],
    [900, 390, 170, 28],
    [1240, 322, 180, 28],
    [1580, 390, 170, 28],
    [1940, 322, 180, 28],
    [2300, 378, 190, 28],
    [2640, 302, 180, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "metal" }));

  const powerCycle = ["fire", "ice", "laser", "big"];
  for (let x = 360, i = 0; x < 2520; x += 260, i++) {
    luckyBlocks.push({ x, y: i % 2 === 0 ? 248 : 316, w: 42, h: 42, used: false, bump: 0, forcedPower: powerCycle[i % powerCycle.length] });
  }

  enemies.push(makeChallenger(820, 420, "cyan"));
  enemies.push(makeChallenger(1540, 420, "blue"));
  enemies.push(makeChallenger(2220, 420, "purple"));
  updateHud("RAINY CHALLENGERS!");
}

function addNightNinjasLevel() {
  addGround(worldWidth);
  [
    [260, 392, 160, 28],
    [560, 322, 170, 28],
    [860, 250, 170, 28],
    [1160, 392, 160, 28],
    [1460, 322, 170, 28],
    [1760, 250, 170, 28],
    [2060, 392, 160, 28],
    [2360, 322, 170, 28],
    [2660, 250, 170, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: "basalt" }));

  const powerCycle = ["fire", "ice", "laser", "big"];
  for (let x = 260, i = 0; x < 2860; x += 160, i++) {
    luckyBlocks.push({ x, y: i % 3 === 0 ? 184 : i % 3 === 1 ? 254 : 324, w: 42, h: 42, used: false, bump: 0, forcedPower: powerCycle[i % powerCycle.length] });
  }

  const abilities = ["float", "tiny", "oneHeart", "fist"];
  for (let x = 420, i = 0; x < 2840; x += 260, i++) {
    const boss = i % 5 === 4;
    enemies.push(makeEnemyNinja(x, boss ? 412 : 424, abilities[i % abilities.length], Math.max(40, x - 120), Math.min(worldWidth - 40, x + 180), boss));
  }
  player.power = "ninja";
  player.ammo = 999;
  updateHud("NIGHT OF THE NINJAS!");
}

function addEvokerDungeonLevel() {
  addGround(worldWidth);
  [
    [280, 390, 170, 28],
    [620, 322, 180, 28],
    [980, 390, 170, 28],
    [1340, 322, 180, 28],
    [1700, 390, 170, 28],
    [2060, 322, 180, 28],
    [2380, 390, 170, 28]
  ].forEach(([x, y, w, h]) => blocks.push({ x, y, w, h, type: 'basalt' }));

  luckyBlocks.push({ x: 520, y: 248, w: 42, h: 42, used: false, bump: 0, forcedPower: 'ice' });
  luckyBlocks.push({ x: 1120, y: 316, w: 42, h: 42, used: false, bump: 0, forcedPower: 'laser' });
  luckyBlocks.push({ x: 1780, y: 316, w: 42, h: 42, used: false, bump: 0, forcedPower: 'fire' });
  luckyBlocks.push({ x: 2260, y: 248, w: 42, h: 42, used: false, bump: 0, forcedPower: 'big' });

  enemies.push(makeEvoker(760, 426, 620, 900));
  enemies.push(makeEvoker(1480, 426, 1320, 1640));
  enemies.push(makeEvoker(2200, 426, 2040, 2380));
  updateHud('DUNGEON EVOKERS!');
}

function makeCaster(x, y, dir) {
  return {
    x,
    y,
    w: 26,
    h: 42,
    vx: 0,
    left: x - 24,
    right: x + 24,
    dir,
    frozen: 0,
    alive: true,
    kind: "caster",
    throwCooldown: 75 + Math.random() * 80
  };
}

function makeEvoker(x, y, left, right) {
  return {
    x, y, w: 34, h: 52, vx: 0.55, left, right,
    frozen: 0, alive: true, kind: 'evoker', hp: 4, maxHp: 4,
    hitCooldown: 0, fangCooldown: 70 + Math.random() * 55, dir: -1
  };
}

function makeGorillaBoss(x, y) {
  bossHitsNeeded += 18;
  return {
    x,
    y,
    w: 230,
    h: 250,
    vx: 0,
    left: x,
    right: x + 1,
    frozen: 0,
    alive: true,
    kind: "gorillaBoss",
    hp: 18,
    maxHp: 18,
    throwCooldown: 70,
    hitCooldown: 0
  };
}

function makeRivalPlayer(x, y) {
  bossHitsNeeded += 5;
  return {
    x,
    y,
    w: 34,
    h: 48,
    vx: 0.9,
    vy: 0,
    left: x - 320,
    right: x + 320,
    frozen: 0,
    alive: true,
    kind: "rivalPlayer",
    hp: 5,
    maxHp: 5,
    hitCooldown: 0,
    onGround: false,
    dir: -1,
    power: "fire",
    powerTimer: 120,
    jumpCooldown: 55,
    growTimer: 600,
    growthStage: 0,
    ammo: 99
  };
}

function makeSlimRival(x, y) {
  bossHitsNeeded += 5;
  return {
    x,
    y,
    w: 26,
    h: 50,
    vx: -1.05,
    vy: 0,
    left: x - 360,
    right: x + 360,
    frozen: 0,
    alive: true,
    kind: "slimRival",
    hp: 5,
    maxHp: 5,
    hitCooldown: 0,
    onGround: false,
    dir: -1,
    power: "laser",
    powerTimer: 90,
    jumpCooldown: 44,
    growTimer: 999999,
    growthStage: 0,
    canGrow: false,
    ammo: 99
  };
}

function makeChallenger(x, y, style) {
  bossHitsNeeded += 7;
  return {
    x,
    y,
    w: 30,
    h: 52,
    vx: style === "purple" ? -1.2 : 1.1,
    vy: 0,
    left: x - 280,
    right: x + 280,
    frozen: 0,
    alive: true,
    kind: "challenger",
    style,
    hp: 7,
    maxHp: 7,
    hitCooldown: 0,
    onGround: false,
    dir: -1,
    power: style === "cyan" ? "laser" : style === "blue" ? "ice" : "fire",
    powerTimer: 80,
    jumpCooldown: 40,
    growTimer: 999999,
    growthStage: 0,
    canGrow: false,
    ammo: 99
  };
}

function makeAllyPlayer(x, y, shirt, accent) {
  return {
    x, y, w: 32, h: 44, vx: 1.2, vy: 0, dir: 1, onGround: false,
    power: powers[Math.floor(Math.random() * powers.length)] || "fire",
    powerTimer: 90 + Math.random() * 90,
    jumpCooldown: 30 + Math.random() * 50,
    shirt,
    accent
  };
}

function makeBigGrabber(x, y, left, right) {
  bossHitsNeeded += 6;
  return {
    x, y, w: 60, h: 76, vx: 0.65, left, right, frozen: 0, alive: true,
    kind: "bigGrabber", hp: 6, maxHp: 6, hitCooldown: 0, grabCooldown: 0
  };
}

function makeEnemyNinja(x, y, ability, left, right, boss = false) {
  return {
    x, y, w: boss ? 42 : 32, h: boss ? 56 : 44,
    vx: boss ? 0.85 : 1.1, left, right, frozen: 0, alive: true,
    kind: "enemyNinja", ability, hp: 3, maxHp: 3, hitCooldown: 0,
    throwCooldown: 55 + Math.random() * 70,
    boss
  };
}

function makeTank(x, y, index) {
  return {
    x,
    y,
    w: 86,
    h: 52,
    vx: index % 2 === 0 ? 0.8 : -0.8,
    left: x - 110,
    right: x + 160,
    frozen: 0,
    alive: true,
    kind: "tank",
    hp: 4,
    spawnCount: 3,
    missileCooldown: 90 + index * 25
  };
}

function makeBoss(x, y, vx) {
  bossHitsNeeded += 25;
  return {
    x,
    y,
    w: 44,
    h: 58,
    vx,
    left: x - 150,
    right: x + 150,
    frozen: 0,
    alive: true,
    kind: "boss",
    hp: 25,
    maxHp: 25
  };
}

function makeSkeleton(x, y, vx, left, right) {
  return {
    x,
    y,
    startX: x,
    startY: y,
    w: 30,
    h: 42,
    vx,
    startVx: vx,
    left,
    right,
    frozen: 0,
    alive: true,
    kind: "skeleton",
    reformTimer: 0,
    bones: []
  };
}

function addBlocks() {
  [
    [360, 268], [408, 268], [456, 268],
    [1120, 250], [1168, 250],
    [1780, 280], [1828, 280], [1876, 280],
    [2440, 260], [2488, 260]
  ].forEach(([x, y]) => blocks.push({ x, y, w: 42, h: 42, type: "block" }));
}

function addLuckyBlocks() {
  [
    [520, 250], [820, 220], [1260, 238], [1540, 212],
    [1960, 242], [2260, 210], [2700, 240]
  ].forEach(([x, y], index) => luckyBlocks.push({
    x,
    y,
    w: 42,
    h: 42,
    used: false,
    bump: 0,
    forcedPower: index === 0 ? "big" : null
  }));
}

function addPipes() {
  pipes.push({ x: 620, y: 394, w: 62, h: 74, target: 1720 });
  pipes.push({ x: 1720, y: 394, w: 62, h: 74, target: 620 });
  pipes.push({ x: 2140, y: 394, w: 62, h: 74, target: 2580 });
  pipes.push({ x: 2580, y: 394, w: 62, h: 74, target: 2140 });
}

function addEnemies() {
  [
    [740, 426, 670, 920],
    [1380, 426, 1280, 1530],
    [1850, 426, 1720, 1960],
    [2380, 426, 2250, 2520]
  ].forEach(([x, y, left, right]) => enemies.push({
    x, y, w: 32, h: 42, vx: 1.1, left, right, frozen: 0, alive: true
  }));
}

function update() {
  if (screen === "menu") {
    drawMenuScene();
    requestAnimationFrame(update);
    return;
  }
  if (screen === "builder") {
    drawBuilder();
    requestAnimationFrame(update);
    return;
  }
  if (screen === "tankytown") {
    updateTankyTown();
    drawTankyTown();
    requestAnimationFrame(update);
    return;
  }
  if (screen === "invaders") {
    updateInvaders();
    drawInvaders();
    requestAnimationFrame(update);
    return;
  }
  if (screen === "arena") {
    updateArena();
    drawArena();
    requestAnimationFrame(update);
    return;
  }
  if (currentLevel === 11 || currentLevel === 15) {
    tickDungeonIntro();
    draw();
    requestAnimationFrame(update);
    return;
  }
  if (!won) handleInput();
  tickMovingPlatforms();
  tickPlayer();
  tickAllies();
  tickEnemies();
  tickSpikyBoxes();
  tickShots();
  tickPowerups();
  tickMagicCrystals();
  tickParticles();
  if (screen === "survival") tickSurvival();
  checkWin();

  if (player.giantTimer > 0 && --player.giantTimer === 0) {
    const size = player.bigTimer > 0 ? { w: 38, h: 64 } : { w: 26, h: 42 };
    setPlayerSize(size.w, player.crawling ? Math.max(24, size.h - 28) : size.h);
    updateHud("GIANT WORE OFF");
  }
  if (player.bigTimer > 0 && --player.bigTimer === 0) shrinkPlayer();
  if (player.slowTimer > 0) player.slowTimer--;
  if (player.invincible > 0) player.invincible--;
  if (player.kickTimer > 0) player.kickTimer--;
  if (messageTimer > 0) messageTimer--;
  if (pipeCooldown > 0) pipeCooldown--;

  camera.x = clamp(player.x - 300, 0, worldWidth - W);
  draw();
  requestAnimationFrame(update);
}

function updateTankyTown() {
  if (!won) {
    tickTankyPlayer();
    if (paradePeople.length > 0) tickParadePeople();
    tickTownTanks();
    tickTownShots();
    if (tankyWanted) {
      tankyPoliceTimer--;
      if (tankyPoliceTimer <= 0) {
        spawnPoliceTank();
        tankyPoliceTimer = 170;
      }
    }
  }
  tankyLastFire = Math.max(0, tankyLastFire - 1);
}

function tickTankyPlayer() {
  let moveX = 0;
  let moveY = 0;
  if (keys.has("ArrowLeft") || keys.has("a")) moveX -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) moveX += 1;
  if (keys.has("ArrowUp") || keys.has("w")) moveY -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) moveY += 1;

  if (moveX || moveY) {
    const len = Math.hypot(moveX, moveY) || 1;
    tankyPlayer.dirX = moveX / len;
    tankyPlayer.dirY = moveY / len;
    moveTankEntity(tankyPlayer, tankyPlayer.dirX * tankyPlayer.speed, tankyPlayer.dirY * tankyPlayer.speed);
  }
}

function tickAllies() {
  for (const ally of allyPlayers) {
    ally.jumpCooldown--;
    ally.powerTimer--;
    ally.vy += gravity;
    ally.x += ally.vx;
    collideAllyAxis(ally, "x");
    ally.y += ally.vy;
    ally.onGround = false;
    collideAllyAxis(ally, "y");
    if (ally.x < 20) ally.vx = Math.abs(ally.vx);
    if (ally.x > worldWidth - 70) ally.vx = -Math.abs(ally.vx);

    const ahead = blocks.find(block => block.x > ally.x + ally.w && block.x < ally.x + 64 && block.y < ally.y + ally.h + 8);
    if ((ahead || Math.random() < 0.01) && ally.onGround && ally.jumpCooldown <= 0) {
      ally.vy = -12.4;
      ally.onGround = false;
      ally.jumpCooldown = 55 + Math.random() * 40;
    }
    if (ally.powerTimer <= 0) {
      fireAllyPower(ally);
      ally.powerTimer = 110 + Math.random() * 90;
    }
  }
}

function tickDungeonIntro() {
  dungeonIntroTimer++;
  if (dungeonIntroTimer > 210) {
    dungeonFade = Math.min(1, dungeonFade + 0.025);
  }
  if (dungeonIntroTimer > 270) {
    if (currentLevel === 15) {
      loadLevel(16, "SLIM RIVAL!");
      return;
    }
    loadLevel(12, "YOU ARE A NINJA!");
  }
}

function tickMagicCrystals() {
  if (!isNinjaCrystalLevel()) return;
  for (const crystal of magicCrystals) {
    if (crystal.collected || !overlap(player, crystal)) continue;
    crystal.collected = true;
    crystalsCollected++;
    burst(crystal.x + crystal.w / 2, crystal.y + crystal.h / 2, crystal.color, 30);
    updateHud(crystalHud());
  }
}

function collideAllyAxis(ally, axis) {
  for (const b of blocks.concat(luckyBlocks, movingPlatforms, pipes)) {
    if (!overlap(ally, b)) continue;
    if (axis === "x") {
      if (ally.vx > 0) ally.x = b.x - ally.w;
      if (ally.vx < 0) ally.x = b.x + b.w;
      ally.vx *= -1;
    } else {
      if (ally.vy > 0) {
        ally.y = b.y - ally.h;
        ally.onGround = true;
      }
      if (ally.vy < 0) ally.y = b.y + b.h;
      ally.vy = 0;
    }
  }
}

function fireAllyPower(ally) {
  const target = enemies.find(enemy => enemy.alive && Math.abs(enemy.x - ally.x) < 320);
  if (!target) return;
  const dir = target.x < ally.x ? -1 : 1;
  ally.dir = dir;
  const kind = ally.power;
  shots.push({
    x: ally.x + ally.w / 2 + dir * 18,
    y: ally.y + ally.h / 2 - 6,
    w: kind === "laser" ? 34 : 16,
    h: kind === "laser" ? 6 : 16,
    vx: dir * (kind === "laser" ? 12 : 8),
    kind: kind === "big" ? "fire" : kind,
    life: 80
  });
}

function interactAction() {
  if (screen === "tankytown") {
    tryTankyShop();
  }
}

function tryTankyShop() {
  const shop = paradeFirstPerson
    ? getParadeShopTarget()
    : tankyShops.find(store =>
        Math.abs((tankyPlayer.x + tankyPlayer.w / 2) - (store.x + store.w / 2)) < 72 &&
        Math.abs((tankyPlayer.y + tankyPlayer.h / 2) - (store.y + store.h / 2)) < 76
      );
  if (!shop) {
    updateHud(paradeFirstPerson ? "MOVE LEFT OR RIGHT, THEN PRESS E" : "VISIT A SHOP");
    return;
  }
  if (shop.item === "flashlight") {
    if (!gearState.flashlightOwned) {
      gearState.flashlightOwned = true;
      gearState.flashlightEquipped = true;
      updateHud("BOUGHT FLASHLIGHT!");
    } else {
      gearState.flashlightEquipped = !gearState.flashlightEquipped;
      updateHud(gearState.flashlightEquipped ? "FLASHLIGHT EQUIPPED" : "FLASHLIGHT REMOVED");
    }
    burst(shop.x + shop.w / 2, shop.y + shop.h / 2, "#fff6a6", 14);
    return;
  }
  if (!gearState.hoverboardOwned) {
    gearState.hoverboardOwned = true;
    gearState.hoverboardEquipped = true;
    updateHud("BOUGHT HOVERBOARD!");
  } else {
    gearState.hoverboardEquipped = !gearState.hoverboardEquipped;
    updateHud(gearState.hoverboardEquipped ? "HOVERBOARD EQUIPPED" : "HOVERBOARD REMOVED");
  }
  burst(shop.x + shop.w / 2, shop.y + shop.h / 2, "#7fd0ff", 14);
}

function getParadeShopTarget() {
  if (!paradeFirstPerson || tankyShops.length === 0) return null;
  const centerX = tankyPlayer.x + tankyPlayer.w / 2;
  if (centerX < W * 0.38) return tankyShops.find(shop => shop.item === "flashlight") || tankyShops[0];
  if (centerX > W * 0.62) return tankyShops.find(shop => shop.item === "hoverboard") || tankyShops[tankyShops.length - 1];
  return null;
}

function tickTownTanks() {
  for (const tank of tankyTanks) {
    if (tank.hp <= 0) continue;
    if (tank.police) {
      const dx = tankyPlayer.x - tank.x;
      const dy = tankyPlayer.y - tank.y;
      const len = Math.hypot(dx, dy) || 1;
      tank.dirX = dx / len;
      tank.dirY = dy / len;
      moveTankEntity(tank, tank.dirX * tank.speed, tank.dirY * tank.speed);
      tank.fireCooldown--;
      if (tank.fireCooldown <= 0) {
        fireTownShot(tank, true);
        tank.fireCooldown = 58;
      }
    } else {
      tank.wanderTimer--;
      if (tank.wanderTimer <= 0) {
        const options = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const next = options[Math.floor(Math.random() * options.length)];
        [tank.dirX, tank.dirY] = next;
        tank.wanderTimer = 50 + Math.random() * 90;
      }
      moveTankEntity(tank, tank.dirX * tank.speed, tank.dirY * tank.speed);
    }
  }
  tankyTanks = tankyTanks.filter(tank => tank.hp > 0);
}

function tickTownShots() {
  for (const shot of tankyShots) {
    shot.x += shot.vx;
    shot.y += shot.vy;
    shot.life--;
    if (shot.life <= 0 || hitTownBuilding(shot)) {
      shot.life = 0;
      continue;
    }
    if (shot.hostile) {
      if (overlap(shot, tankyPlayer)) {
        shot.life = 0;
        hurtTankyPlayer();
      }
      continue;
    }
    for (const tank of tankyTanks) {
      if (tank.hp <= 0 || !overlap(shot, tank)) continue;
      tank.hp--;
      shot.life = 0;
      burst(tank.x + tank.w / 2, tank.y + tank.h / 2, tank.police ? "#99c2ff" : "#ff9d00", 20);
      if (tank.hp <= 0) {
        if (!tank.police) {
          tankyWanted = true;
          tankyPoliceTimer = 35;
          updateHud("POLICE TANKS INCOMING!");
        }
      }
      break;
    }
  }
  tankyShots = tankyShots.filter(shot => shot.life > 0);
}

function moveTankEntity(entity, dx, dy) {
  const nextX = { ...entity, x: clamp(entity.x + dx, 20, W - entity.w - 20) };
  if (!hitsTownBuilding(nextX)) entity.x = nextX.x;
  const nextY = { ...entity, y: clamp(entity.y + dy, 20, H - entity.h - 20) };
  if (!hitsTownBuilding(nextY)) entity.y = nextY.y;
}

function hitsTownBuilding(entity) {
  return tankyBuildings.some(building => overlap(entity, building));
}

function hitTownBuilding(entity) {
  return entity.x < 0 || entity.y < 0 || entity.x + entity.w > W || entity.y + entity.h > H || hitsTownBuilding(entity);
}

function fireTownShot(source, hostile) {
  const dirX = source.dirX || 1;
  const dirY = source.dirY || 0;
  tankyShots.push({
    x: source.x + source.w / 2 + dirX * 18,
    y: source.y + source.h / 2 + dirY * 18,
    w: 12,
    h: 12,
    vx: dirX * 6.8,
    vy: dirY * 6.8,
    life: 90,
    hostile
  });
}

function spawnPoliceTank() {
  const spawnPoints = [
    { x: 24, y: 26, dirX: 1, dirY: 0 },
    { x: 900, y: 26, dirX: -1, dirY: 0 },
    { x: 24, y: 494, dirX: 1, dirY: 0 },
    { x: 900, y: 494, dirX: -1, dirY: 0 }
  ];
  const pick = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  const police = makeTownTank(pick.x, pick.y, true);
  police.dirX = pick.dirX;
  police.dirY = pick.dirY;
  tankyTanks.push(police);
}

function hurtTankyPlayer() {
  if (won) return;
  tankyPlayer.hp--;
  updateHud(tankyPlayer.hp > 0 ? `CITY HP ${tankyPlayer.hp}` : "BUSTED!");
  burst(tankyPlayer.x + tankyPlayer.w / 2, tankyPlayer.y + tankyPlayer.h / 2, "#ff2e42", 24);
  if (tankyPlayer.hp <= 0) won = true;
}

function updateInvaders() {
  if (!won) {
    handleInvaderInput();
    tickInvaderBody(invader);
    tickRunner();
    if (overlap(invader, runner)) {
      runner.hearts--;
      runner.x -= 90;
      burst(runner.x + runner.w / 2, runner.y + runner.h / 2, "#ff2e42", 24);
      updateHud(`RUNNER HEARTS: ${runner.hearts}`);
      if (runner.hearts <= 0) {
        won = true;
        updateHud("ENEMY WINS!");
      }
    }
    if (overlap(runner, flag)) {
      won = true;
      updateHud("PLAYER ESCAPED!");
    }
  }
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.18;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
  camera.x = clamp(((invader.x + runner.x) / 2) - 330, 0, worldWidth - W);
}

function updateArena() {
  if (arenaFightStarted) {
    tickArenaFighters();
    tickArenaShots();
  }
  tickParticles();
}

function setActiveArenaTool(type) {
  arenaSelectedType = type;
  arenaToolsEl.querySelectorAll("[data-arena]").forEach(button => {
    button.classList.toggle("active", button.dataset.arena === type);
  });
  updateHud(`ARENA: PLACE ${arenaLabel(type).toUpperCase()}`);
}

function handleArenaClick(event) {
  if (screen !== "arena" || arenaFightStarted) return;
  const point = canvasPoint(event);
  placeArenaFighter(arenaSelectedType, clamp(point.x, 20, W - 40), clamp(point.y, 70, H - 8));
}

function beginArenaFight() {
  if (screen !== "arena") return;
  if (arenaFighters.length < 2) {
    updateHud("PLACE AT LEAST 2 FIGHTERS");
    return;
  }
  arenaFightStarted = true;
  arenaFighters.forEach((fighter, index) => {
    fighter.vx = index % 2 === 0 ? 1.4 : -1.4;
    fighter.attackCooldown = 20 + index * 5;
    fighter.powerCooldown = 35 + index * 10;
  });
  updateHud("ARENA FIGHT!");
}

function placeArenaFighter(type, x, floorY) {
  const fighter = createArenaFighter(type, x, floorY);
  arenaFighters.push(fighter);
  arenaSummonCount = arenaFighters.length;
  updateHud(`PLACED ${fighter.arenaName}: ${arenaFighters.length}`);
}

function summonArenaFighter(slot) {
  if (screen !== "arena" || arenaFightStarted) return;
  const x = 80 + (arenaSummonCount % 9) * 95;
  const type = ["enemy", "miniBoss", "boss", "rivalPlayer", "slimRival"][slot - 1] || "enemy";
  placeArenaFighter(type, x, 468);
}

function createArenaFighter(type, x, floorY) {
  let fighter;
  if (type === "miniBoss") fighter = makeMiniBoss(x, floorY - 48, 0, 40, W - 40);
  else if (type === "boss") fighter = makeBoss(x, floorY - 58, 0);
  else if (type === "skeleton") fighter = makeSkeleton(x, floorY - 42, 0, 40, W - 40);
  else if (type === "spiky") fighter = { x, y: floorY - 52, w: 52, h: 52, vx: 0, vy: 0, left: 40, right: W - 40, frozen: 0, alive: true, kind: "arenaSpiky", hp: 4, maxHp: 4, hitCooldown: 0, onGround: false };
  else if (type === "tank") fighter = makeTank(x, floorY - 52, 0);
  else if (type === "bigGrabber") fighter = makeBigGrabber(x, floorY - 76, 40, W - 40);
  else if (type === "ninja") fighter = makeEnemyNinja(x, floorY - 44, "fist", 40, W - 40);
  else if (type === 'caster') fighter = makeCaster(x, floorY - 42, 1);
  else if (type === 'evoker') fighter = makeEvoker(x, floorY - 52, 40, W - 40);
  else if (type === "mummy") fighter = makeMummy(x, floorY - 42, 0, 40, W - 40);
  else if (type === "futureSkeleton") fighter = makeFutureSkeleton(x, floorY - 42, 40, W - 40);
  else if (type === "challenger") fighter = makeChallenger(x, floorY - 52, "cyan");
  else if (type === "rivalPlayer") fighter = makeRivalPlayer(x, floorY - 48);
  else if (type === "slimRival") fighter = makeSlimRival(x, floorY - 50);
  else fighter = { x, y: floorY - 42, w: 32, h: 42, vx: 0, vy: 0, left: 40, right: W - 40, frozen: 0, alive: true, kind: "arenaEnemy", hp: 3, maxHp: 3, hitCooldown: 0, onGround: false };
  fighter.arenaName = arenaLabel(type);
  fighter.hp = fighter.hp || 3;
  fighter.maxHp = fighter.maxHp || fighter.hp;
  fighter.vx = 0;
  fighter.vy = 0;
  fighter.onGround = false;
  fighter.hitCooldown = 0;
  fighter.attackCooldown = 20;
  fighter.powerCooldown = 50 + Math.random() * 80;
  fighter.arenaType = type;
  fighter.alive = true;
  fighter.left = 20;
  fighter.right = W - 20;
  return fighter;
}

function arenaLabel(type) {
  return {
    enemy: "Enemy",
    miniBoss: "Mini Boss",
    boss: "Boss",
    skeleton: "Skeleton",
    spiky: "Spiky Box",
    tank: "Tank",
    bigGrabber: "Big Guy",
    ninja: "Ninja",
    caster: 'Potion Thrower',
    evoker: 'Evoker',
    mummy: "Mummy",
    futureSkeleton: "Future Skeleton",
    challenger: "Challenger",
    rivalPlayer: "Rival",
    slimRival: "Slim Rival"
  }[type] || "Enemy";
}

function tickArenaFighters() {
  const alive = arenaFighters.filter(f => f.alive);
  for (const fighter of alive) {
    fighter.hitCooldown = Math.max(0, (fighter.hitCooldown || 0) - 1);
    fighter.attackCooldown = Math.max(0, (fighter.attackCooldown || 0) - 1);
    fighter.powerCooldown = Math.max(0, (fighter.powerCooldown || 0) - 1);
    const target = alive
      .filter(other => other !== fighter)
      .sort((a, b) => Math.abs(a.x - fighter.x) - Math.abs(b.x - fighter.x))[0];
    if (!target) continue;
    const dir = target.x < fighter.x ? -1 : 1;
    fighter.dir = dir;
    if (fighter.powerCooldown === 0) fireArenaPower(fighter, target);
    fighter.vx = clamp((fighter.vx || 0) + dir * 0.14, -3.1, 3.1);
    fighter.vy = (fighter.vy || 0) + gravity;
    fighter.x += fighter.vx;
    collideArenaFighterAxis(fighter, "x");
    fighter.y += fighter.vy;
    fighter.onGround = false;
    collideArenaFighterAxis(fighter, "y");
    fighter.vx *= 0.92;
    if (fighter.onGround && Math.random() < 0.012) fighter.vy = -11;
    if (overlap(fighter, target) && fighter.attackCooldown === 0) {
      damageArenaFighter(target, fighter.kind === "boss" ? 2 : 1);
      fighter.attackCooldown = 38;
      fighter.vx = -dir * 2.4;
    }
  }

  const stillAlive = arenaFighters.filter(f => f.alive);
  if (arenaFighters.length > 1 && stillAlive.length === 1) {
    updateHud(`ARENA WINNER: ${stillAlive[0].arenaName || "FIGHTER"}`);
  }
}

function fireArenaPower(fighter, target) {
  const dir = target.x < fighter.x ? -1 : 1;
  const cx = fighter.x + fighter.w / 2;
  const cy = fighter.y + fighter.h / 2;
  const type = fighter.arenaType || fighter.kind;
  if (type === 'tank') {
    shots.push({ x: cx, y: cy - 4, w: 24, h: 10, vx: dir * 7, kind: 'missile', life: 95, arena: true, owner: fighter, damage: 2 });
    fighter.powerCooldown = 95;
    return;
  }
  if (type === 'ninja' || fighter.kind === 'enemyNinja') {
    shots.push({ x: cx, y: cy - 8, w: 18, h: 18, vx: dir * 8, kind: 'enemyShuriken', life: 85, arena: true, owner: fighter, damage: 1 });
    fighter.powerCooldown = 70;
    return;
  }
  if (type === 'caster') {
    shots.push({ x: cx, y: cy - 10, w: 16, h: 20, vx: dir * 4.2, vy: -1.6, gravity: 0.08, kind: 'potion', effect: 'slow', life: 100, arena: true, owner: fighter, damage: 1 });
    fighter.powerCooldown = 90;
    return;
  }
  if (type === 'evoker' || fighter.kind === 'evoker') {
    shots.push({ x: target.x + target.w / 2 - 18, y: target.y + target.h - 44, w: 36, h: 44, vx: 0, kind: 'evokerFang', life: 60, armTime: 22, arena: true, owner: fighter, damage: 1 });
    fighter.powerCooldown = 105;
    return;
  }
  if (type === 'futureSkeleton' || fighter.kind === 'futureSkeleton') {
    shots.push({ x: cx, y: cy - 10, w: 34, h: 6, vx: dir * 10, kind: 'laser', life: 70, arena: true, owner: fighter, damage: 1 });
    fighter.powerCooldown = 95;
    return;
  }
  if (type === 'rivalPlayer' || type === 'slimRival' || type === 'challenger') {
    const kind = fighter.power === 'ice' ? 'ice' : fighter.power === 'laser' ? 'laser' : 'fire';
    shots.push({ x: cx, y: cy - 8, w: kind === 'laser' ? 34 : 16, h: kind === 'laser' ? 6 : 16, vx: dir * (kind === 'laser' ? 11 : 7), kind, life: 80, arena: true, owner: fighter, damage: 1 });
    fighter.power = kind === 'fire' ? 'ice' : kind === 'ice' ? 'laser' : 'fire';
    fighter.powerCooldown = 80;
    return;
  }
  if (type === 'bigGrabber' || type === 'boss' || type === 'miniBoss') {
    if (Math.abs(target.x - fighter.x) < 140) damageArenaFighter(target, type === 'boss' ? 2 : 1);
    burst(cx, cy, '#ffd028', 14);
    fighter.powerCooldown = 80;
    return;
  }
  fighter.powerCooldown = 100;
}

function tickArenaShots() {
  for (const shot of shots) {
    if (!shot.arena) continue;
    shot.x += shot.vx || 0;
    if (shot.gravity) shot.vy = (shot.vy || 0) + shot.gravity;
    if (shot.vy) shot.y += shot.vy;
    if (shot.armTime > 0) shot.armTime--;
    shot.life--;
    if (shot.armTime > 0) continue;
    for (const fighter of arenaFighters) {
      if (!fighter.alive || fighter === shot.owner || !overlap(shot, fighter)) continue;
      damageArenaFighter(fighter, shot.damage || 1);
      burst(shot.x + shot.w / 2, shot.y + shot.h / 2, shot.kind === 'ice' ? '#9be8ff' : '#ffd028', 14);
      shot.life = 0;
      break;
    }
  }
  shots = shots.filter(shot => !shot.arena || shot.life > 0);
}

function collideArenaFighterAxis(fighter, axis) {
  for (const b of blocks) {
    if (!overlap(fighter, b)) continue;
    if (axis === "x") {
      if (fighter.vx > 0) fighter.x = b.x - fighter.w;
      if (fighter.vx < 0) fighter.x = b.x + b.w;
      fighter.vx *= -0.35;
    } else {
      if (fighter.vy > 0) {
        fighter.y = b.y - fighter.h;
        fighter.onGround = true;
      }
      if (fighter.vy < 0) fighter.y = b.y + b.h;
      fighter.vy = 0;
    }
  }
  fighter.x = clamp(fighter.x, 10, W - fighter.w - 10);
}

function damageArenaFighter(fighter, amount) {
  if (fighter.hitCooldown > 0) return;
  fighter.hitCooldown = 14;
  fighter.hp = (fighter.hp || 3) - amount;
  burst(fighter.x + fighter.w / 2, fighter.y + fighter.h / 2, "#ffd028", 12);
  if (fighter.hp > 0) return;
  fighter.alive = false;
  burst(fighter.x + fighter.w / 2, fighter.y + fighter.h / 2, "#ff2e42", 30);
}

function handleInvaderInput() {
  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  const jump = keys.has("ArrowUp") || keys.has("w") || keys.has(" ");
  invader.vx *= 0.78;
  const speed = invader.kind === "spiky" ? 0.42 : 0.56;
  const maxSpeed = invader.kind === "spiky" ? 4 : 5.2;
  if (left) {
    invader.vx -= speed;
    invader.dir = -1;
  }
  if (right) {
    invader.vx += speed;
    invader.dir = 1;
  }
  invader.vx = clamp(invader.vx, -maxSpeed, maxSpeed);
  if (jump && invader.onGround) {
    invader.vy = invader.kind === "spiky" ? -10 : -13;
    invader.onGround = false;
  }
}

function tickInvaderBody(body) {
  body.vy += gravity;
  body.x += body.vx;
  collideBodyAxis(body, "x");
  body.y += body.vy;
  body.onGround = false;
  collideBodyAxis(body, "y");
  body.x = clamp(body.x, 12, worldWidth - 60);
}

function tickRunner() {
  runner.vy += gravity;
  runner.jumpCooldown--;
  runner.vx = 2.35;
  const nearGap = blocks.some(b => b.x > runner.x + runner.w && b.x < runner.x + 95 && b.y < 430);
  if ((nearGap || Math.random() < 0.012) && runner.onGround && runner.jumpCooldown <= 0) {
    runner.vy = -12.2;
    runner.jumpCooldown = 70;
  }
  runner.x += runner.vx;
  collideBodyAxis(runner, "x");
  runner.y += runner.vy;
  runner.onGround = false;
  collideBodyAxis(runner, "y");
}

function collideBodyAxis(body, axis) {
  for (const b of blocks.concat(luckyBlocks, movingPlatforms)) {
    if (!overlap(body, b)) continue;
    if (axis === "x") {
      if (body.vx > 0) body.x = b.x - body.w;
      if (body.vx < 0) body.x = b.x + b.w;
      body.vx = 0;
    } else {
      if (body.vy > 0) {
        body.y = b.y - body.h;
        body.onGround = true;
      }
      if (body.vy < 0) body.y = b.y + b.h;
      body.vy = 0;
    }
  }
}

function tickSurvival() {
  survivalTimer++;
  survivalSpawnTimer--;
  if (survivalSpawnTimer > 0) return;
  survivalWave++;
  survivalSpawnTimer = Math.max(120, 360 - survivalWave * 18);
  updateHud(`SURVIVAL WAVE ${survivalWave}`);
  const count = Math.min(2 + survivalWave, 8);
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side < 0 ? camera.x + 20 : camera.x + W - 60;
    if (survivalWave % 3 === 0 && i === 0) {
      enemies.push(makeSkeleton(x, 426, side < 0 ? 1.4 : -1.4, x - 130, x + 130));
    } else {
      enemies.push({ x, y: 426, w: 32, h: 42, vx: side < 0 ? 1.25 + survivalWave * 0.08 : -1.25 - survivalWave * 0.08, left: x - 180, right: x + 180, frozen: 0, alive: true });
    }
  }
}

function handleInput() {
  if (player.knockedTimer > 0) {
    player.vx *= 0.78;
    return;
  }
  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  const jump = keys.has("ArrowUp") || keys.has("w") || keys.has(" ");
  const down = keys.has("ArrowDown") || keys.has("s");
  const crouchJump = down && player.onGround;
  const speedFactor = player.slowTimer > 0 ? 0.45 : 1;
  const hoverBoost = gearState.hoverboardEquipped ? 1.15 : 1;
  const crawlSpeed = (player.crawling ? 0.48 : 0.68) * speedFactor * hoverBoost;
  const maxSpeed = (player.crawling ? 3.1 : 7.1) * speedFactor * hoverBoost;

  player.vx *= 0.78;
  if (left) {
    player.vx -= crawlSpeed;
    player.dir = -1;
  }
  if (right) {
    player.vx += crawlSpeed;
    player.dir = 1;
  }
  player.vx = clamp(player.vx, -maxSpeed, maxSpeed);

  if (gearState.hoverboardEquipped && !player.onGround) {
    if (jump) player.vy = Math.max(player.vy - 0.95, -7.8);
    if (down) player.vy = Math.min(player.vy + 0.55, 7.2);
  }

  if (jump && player.onGround) {
    if (player.crawling && canStand(standingSize())) {
      player.crawling = false;
      const standing = standingSize();
      setPlayerSize(standing.w, standing.h);
    }
    player.vy = crouchJump ? -18.2 : -15.2;
    player.onGround = false;
    burst(player.x + player.w / 2, player.y + player.h, "#ffffff", 8);
  }
}

function tickPlayer() {
  updateCrawl();
  player.vy += gearState.hoverboardEquipped ? 0.22 : gravity;
  player.x += player.vx;
  collideAxis("x");
  player.y += player.vy;
  player.onGround = false;
  collideAxis("y");
  player.x = clamp(player.x, 12, worldWidth - 60);

  if (player.y > H + 120 || (currentLevel === 3 && player.y + player.h > 505)) respawnPlayer();
  usePipe();
  collideEnemies();
  collideSpikyBoxes();
  if (player.thrownDamage > 0 && player.onGround) {
    applyThrownLanding();
  }
  if (player.knockedTimer > 0) player.knockedTimer--;
}

function collideAxis(axis) {
  const solids = blocks.concat(luckyBlocks, movingPlatforms);
  for (const b of solids) {
    if (!overlap(player, b)) continue;

    if (axis === "x") {
      if (player.vx > 0) player.x = b.x - player.w;
      if (player.vx < 0) player.x = b.x + b.w;
      player.vx = 0;
    } else {
      if (player.vy > 0) {
        player.y = b.y - player.h;
        player.onGround = true;
      }
      if (player.vy < 0) {
        player.y = b.y + b.h;
        if (luckyBlocks.includes(b)) hitLuckyBlock(b);
      }
      player.vy = 0;
    }
  }

  for (const p of pipes) {
    if (!overlap(player, p)) continue;
    if (axis === "x") {
      if (player.vx > 0) player.x = p.x - player.w;
      if (player.vx < 0) player.x = p.x + p.w;
      player.vx = 0;
    } else if (player.vy > 0) {
      player.y = p.y - player.h;
      player.onGround = true;
      player.vy = 0;
    }
  }
}

function hitLuckyBlock(block) {
  block.bump = 8;
  if (block.used) return;
  block.used = true;
  const power = block.forcedPower || powers[Math.floor(Math.random() * powers.length)];
  spawnPowerup(power, block.x + block.w / 2 - 13, block.y - 26);
  updateHud("POWER UP!");
  messageTimer = 120;
}

function grantPower(power, x, y) {
  player.power = power;
  player.ammo = power === "big" ? 0 : 6;
  if (power === "big") growPlayer();
  const names = { big: "LIGHTNING BIG!", fire: "FIREBALLS!", ice: "ICE CUBES!", laser: "LASER ZAP!" };
  updateHud(names[power]);
  burst(x, y, powerColor(power), 24);
  messageTimer = 120;
}

function spawnPowerup(power, x, y) {
  powerups.push({
    x,
    y,
    w: 26,
    h: 26,
    vx: 0,
    vy: -4.8,
    power,
    life: 1200
  });
  burst(x + 13, y + 13, powerColor(power), 18);
}

function tickPowerups() {
  for (const item of powerups) {
    item.vy += 0.35;
    item.y += item.vy;
    item.life--;

    for (const b of blocks.concat(movingPlatforms)) {
      if (!overlap(item, b)) continue;
      if (item.vy > 0) {
        item.y = b.y - item.h;
        item.vy = 0;
      }
    }

    if (overlap(player, item)) {
      grantPower(item.power, item.x + item.w / 2, item.y + item.h / 2);
      item.life = 0;
    }
  }
  powerups = powerups.filter(item => item.life > 0);
}

function growPlayer() {
  player.bigTimer = 900;
  player.giantTimer = 0;
  setPlayerSize(38, player.crawling ? 34 : 64);
}

function shrinkPlayer() {
  player.power = "tiny";
  player.ammo = 0;
  player.giantTimer = 0;
  setPlayerSize(26, player.crawling ? 24 : 42);
  updateHud("POWER WORE OFF");
}

function growPlayerHuge() {
  player.giantTimer = 780;
  player.bigTimer = 0;
  setPlayerSize(52, player.crawling ? 40 : 86);
  updateHud("GIANT POTION!");
}

function updateCrawl() {
  const down = keys.has("ArrowDown") || keys.has("s");
  const wantsCrawl = down && player.onGround && !standingOnPipeEntrance();
  const standing = standingSize();
  const crawlHeight = player.bigTimer > 0 ? 34 : 24;

  if (wantsCrawl && !player.crawling) {
    player.crawling = true;
    setPlayerSize(standing.w, crawlHeight);
  }

  if (!wantsCrawl && player.crawling && canStand(standing)) {
    player.crawling = false;
    setPlayerSize(standing.w, standing.h);
  }
}

function standingSize() {
  if (player.giantTimer > 0) return { w: 52, h: 86 };
  return player.bigTimer > 0 ? { w: 38, h: 64 } : { w: 26, h: 42 };
}

function setPlayerSize(w, h) {
  const feet = player.y + player.h;
  player.w = w;
  player.h = h;
  player.y = feet - h;
}

function canStand(size) {
  const feet = player.y + player.h;
  const test = { x: player.x, y: feet - size.h, w: size.w, h: size.h };
  return !blocks.concat(luckyBlocks, pipes, movingPlatforms).some(solid => overlap(test, solid));
}

function standingOnPipeEntrance() {
  return pipes.some(p => Math.abs((player.x + player.w / 2) - (p.x + p.w / 2)) < 32 && player.y + player.h <= p.y + 8);
}

function usePipe() {
  const down = keys.has("ArrowDown") || keys.has("s");
  if (!down || pipeCooldown > 0) return;
  const pipe = pipes.find(p => Math.abs((player.x + player.w / 2) - (p.x + p.w / 2)) < 32 && player.y + player.h <= p.y + 8);
  if (!pipe) return;
  const target = pipes.find(p => p.x === pipe.target);
  if (!target) return;
  player.x = target.x + target.w / 2 - player.w / 2;
  player.y = target.y - player.h;
  player.vx = 0;
  player.vy = -2;
  player.crawling = false;
  const standing = standingSize();
  setPlayerSize(standing.w, standing.h);
  pipeCooldown = 80;
  burst(player.x + player.w / 2, player.y + player.h, "#42d55d", 18);
}

function tickEnemies() {
  for (const e of enemies) {
    if (e.hitCooldown > 0) e.hitCooldown--;
    if (e.kind === "skeleton" && !e.alive) {
      tickSkeletonBones(e);
      e.reformTimer--;
      if (e.reformTimer <= 0) reformSkeleton(e);
      continue;
    }
    if (!e.alive) continue;
    if (e.frozen > 0) {
      e.frozen--;
      continue;
    }
    if (e.kind === "futureSkeleton") tickFutureSkeleton(e);
    if (e.kind === "caster") tickCaster(e);
    if (e.kind === "evoker") tickEvoker(e);
    if (e.kind === "tank") tickTank(e);
    if (e.kind === "gorillaBoss") tickGorillaBoss(e);
    if (e.kind === "bigGrabber") tickBigGrabber(e);
    if (e.kind === "enemyNinja") tickEnemyNinja(e);
    if (e.kind === "rivalPlayer" || e.kind === "slimRival" || e.kind === "challenger") {
      tickRivalPlayer(e);
      continue;
    }
    e.x += e.vx;
    if (e.x < e.left || e.x + e.w > e.right) e.vx *= -1;
  }
}

function tickFutureSkeleton(enemy) {
  enemy.laserCooldown--;
  if (enemy.laserCooldown > 0) return;
  const dir = player.x < enemy.x ? -1 : 1;
  shots.push({
    x: enemy.x + enemy.w / 2 + dir * 16,
    y: enemy.y + 14,
    w: 34,
    h: 6,
    vx: dir * 10,
    kind: "enemyLaser",
    life: 70,
    hostile: true
  });
  enemy.laserCooldown = 180;
}

function tickCaster(caster) {
  const targetDir = player.x < caster.x ? -1 : 1;
  caster.dir = targetDir;
  caster.throwCooldown--;
  if (caster.throwCooldown > 0) return;
  const fire = Math.random() < 0.55;
  if (fire) {
    shots.push({
      x: caster.x + caster.w / 2 + targetDir * 16,
      y: caster.y + 14,
      w: 16,
      h: 16,
      vx: targetDir * 5.6,
      vy: -0.6,
      gravity: 0.02,
      kind: "enemyFire",
      life: 110,
      hostile: true
    });
  } else {
    const effect = Math.random() < 0.5 ? "slow" : "giant";
    shots.push({
      x: caster.x + caster.w / 2 + targetDir * 12,
      y: caster.y + 8,
      w: 16,
      h: 20,
      vx: targetDir * 3.6,
      vy: -2.1,
      gravity: 0.12,
      kind: "potion",
      effect,
      life: 120,
      hostile: true
    });
  }
  caster.throwCooldown = 95 + Math.random() * 80;
}

function tickEvoker(evoker) {
  evoker.fangCooldown--;
  evoker.dir = player.x < evoker.x ? -1 : 1;
  if (evoker.fangCooldown > 0) return;
  shots.push({
    x: player.x + player.w / 2 - 15 + (Math.random() - 0.5) * 34,
    y: player.y + player.h - 34,
    w: 30,
    h: 34,
    vx: 0,
    kind: 'evokerFang',
    life: 64,
    armTime: 20,
    hostile: true
  });
  burst(evoker.x + evoker.w / 2, evoker.y + 16, '#b6f2d5', 12);
  updateHud('EVOKER FANGS!');
  evoker.fangCooldown = 90 + Math.random() * 65;
}

function tickTank(tank) {
  tank.missileCooldown--;
  if (tank.missileCooldown > 0) return;
  const dir = player.x < tank.x ? -1 : 1;
  shots.push({
    x: tank.x + tank.w / 2 + dir * 18,
    y: tank.y + 14,
    w: 24,
    h: 10,
    vx: dir * 7,
    kind: "missile",
    life: 110,
    hostile: true
  });
  tank.missileCooldown = 120;
}

function tickGorillaBoss(gorilla) {
  gorilla.throwCooldown--;
  if (gorilla.throwCooldown > 0) return;
  const dir = player.x < gorilla.x + gorilla.w / 2 ? -1 : 1;
  shots.push({
    x: gorilla.x + (dir > 0 ? gorilla.w - 40 : 20),
    y: gorilla.y + 86,
    w: 24,
    h: 24,
    vx: dir * 4.6,
    vy: -6.4,
    gravity: 0.18,
    kind: "barrel",
    life: 180,
    hostile: true
  });
  updateHud("GORILLA BARREL!");
  gorilla.throwCooldown = 72 + Math.random() * 34;
}

function tickBigGrabber(enemy) {
  enemy.grabCooldown = Math.max(0, enemy.grabCooldown - 1);
}

function tickEnemyNinja(ninja) {
  ninja.throwCooldown--;
  if (ninja.throwCooldown > 0) return;
  const dir = player.x < ninja.x ? -1 : 1;
  if (ninja.ability === "fist") {
    shots.push({
      x: player.x + player.w / 2 - 26,
      y: camera.x ? -80 : -80,
      w: 52,
      h: 52,
      vx: 0,
      vy: 6.8,
      kind: "skyFist",
      hostile: true,
      life: 120
    });
  } else {
    shots.push({
      x: ninja.x + ninja.w / 2 + dir * 18,
      y: ninja.y + ninja.h / 2 - 6,
      w: 18,
      h: 18,
      vx: dir * 7.8,
      kind: "enemyShuriken",
      effect: ninja.ability,
      hostile: true,
      life: 100
    });
  }
  ninja.throwCooldown = 80 + Math.random() * 80;
}

function tickRivalPlayer(rival) {
  const targetDir = player.x < rival.x ? -1 : 1;
  rival.dir = targetDir;
  rival.jumpCooldown--;
  rival.powerTimer--;
  if (rival.canGrow !== false) rival.growTimer--;

  if (rival.canGrow !== false && rival.growTimer <= 0) {
    rival.growthStage = Math.min(rival.growthStage + 1, 4);
    const feet = rival.y + rival.h;
    rival.w = 34 + rival.growthStage * 4;
    rival.h = 48 + rival.growthStage * 7;
    rival.y = feet - rival.h;
    rival.growTimer = 600;
    burst(rival.x + rival.w / 2, rival.y + rival.h / 2, "#ffd028", 26);
    updateHud("RIVAL GOT BIGGER!");
  }

  const speedBoost = rival.canGrow === false ? 0.65 : rival.growthStage * 0.25;
  rival.vx = clamp(rival.vx + targetDir * 0.12, -3.2 - speedBoost, 3.2 + speedBoost);
  rival.vy += gravity;
  rival.x += rival.vx;
  collideRivalAxis(rival, "x");
  rival.y += rival.vy;
  rival.onGround = false;
  collideRivalAxis(rival, "y");
  rival.vx *= 0.92;

  if (Math.abs(player.x - rival.x) < 120 && player.y + player.h < rival.y + 16 && rival.onGround && rival.jumpCooldown <= 0) {
    rival.vy = -13.2;
    rival.onGround = false;
    rival.jumpCooldown = 70;
  }

  if (rival.powerTimer <= 0) {
    const rivalPowers = rival.canGrow === false ? ["fire", "ice", "laser"] : powers;
    rival.power = rivalPowers[Math.floor(Math.random() * rivalPowers.length)] || "fire";
    fireRivalPower(rival);
    rival.powerTimer = 120 + Math.random() * 70;
  }
}

function collideRivalAxis(rival, axis) {
  for (const b of blocks.concat(luckyBlocks, movingPlatforms)) {
    if (!overlap(rival, b)) continue;
    if (axis === "x") {
      if (rival.vx > 0) rival.x = b.x - rival.w;
      if (rival.vx < 0) rival.x = b.x + b.w;
      rival.vx *= -0.4;
    } else {
      if (rival.vy > 0) {
        rival.y = b.y - rival.h;
        rival.onGround = true;
      }
      if (rival.vy < 0) rival.y = b.y + b.h;
      rival.vy = 0;
    }
  }
}

function fireRivalPower(rival) {
  const dir = rival.dir || -1;
  if (rival.power === "big" && rival.canGrow !== false) {
    const feet = rival.y + rival.h;
    rival.w = Math.min(rival.w + 6, 58);
    rival.h = Math.min(rival.h + 10, 86);
    rival.y = feet - rival.h;
    burst(rival.x + rival.w / 2, rival.y + rival.h / 2, "#ffe94c", 20);
    return;
  }
  if (rival.power === "fire") {
    shots.push({
      x: rival.x + rival.w / 2 + dir * 18,
      y: rival.y + rival.h / 2 - 8,
      w: 16,
      h: 16,
      vx: dir * 7.5,
      vy: -0.4,
      gravity: 0.02,
      kind: "enemyFire",
      life: 90,
      hostile: true
    });
    return;
  }
  if (rival.power === "ice") {
    shots.push({
      x: rival.x + rival.w / 2 + dir * 18,
      y: rival.y + rival.h / 2 - 8,
      w: 16,
      h: 16,
      vx: dir * 6.6,
      vy: -0.2,
      gravity: 0.01,
      kind: "enemyIce",
      life: 90,
      hostile: true
    });
    return;
  }
  shots.push({
    x: rival.x + rival.w / 2 + dir * 18,
    y: rival.y + rival.h / 2 - 8,
    w: 34,
    h: 6,
    vx: dir * 11,
    kind: "enemyLaser",
    life: 65,
    hostile: true
  });
}

function tickSpikyBoxes() {
  for (const box of spikyBoxes) {
    box.phase += box.speed;
    const travel = (box.bottomY - box.topY) / 2;
    const center = box.topY + travel;
    box.y = center + Math.sin(box.phase) * travel;
  }
}

function tickMovingPlatforms() {
  for (const platform of movingPlatforms) {
    const wasRiding = isPlayerRidingPlatform(platform);
    platform.previousY = platform.y;
    platform.phase += platform.speed;
    const travel = (platform.bottomY - platform.topY) / 2;
    const center = platform.topY + travel;
    platform.y = center + Math.sin(platform.phase) * travel;
    platform.dy = platform.y - platform.previousY;

    if (wasRiding) {
      player.y += platform.dy;
    }
  }
}

function isPlayerRidingPlatform(platform) {
  const feet = player.y + player.h;
  const horizontallyAligned = player.x + player.w > platform.x + 4 && player.x < platform.x + platform.w - 4;
  return player.onGround && horizontallyAligned && Math.abs(feet - platform.y) < 4;
}

function collideSpikyBoxes() {
  for (const box of spikyBoxes) {
    if (!overlap(player, box)) continue;
    hurtPlayer();
  }
}

function collideEnemies() {
  for (const e of enemies) {
    if (!e.alive || !overlap(player, e)) continue;

    const stomp = player.vy > 0 && player.y + player.h - e.y < 18;
    const kicking = player.kickTimer > 0 && Math.sign(e.x - player.x) === player.dir;
    if (e.kind === "bigGrabber") {
      if (player.thrownDamage === 0 && player.knockedTimer === 0 && e.grabCooldown === 0) {
        grabAndThrowPlayer(e);
      }
      continue;
    }
    if (e.kind === "boss" || e.kind === "gorillaBoss" || e.kind === "rivalPlayer" || e.kind === "slimRival" || e.kind === "challenger") {
      if (kicking) {
        if (e.kind === "gorillaBoss") {
          damageGorillaBoss(e);
        } else if (e.kind === "rivalPlayer" || e.kind === "slimRival" || e.kind === "challenger") {
          damageRivalPlayer(e);
        } else {
          damageBoss(e);
        }
        player.vx = -player.dir * 2.5;
      } else if (stomp) {
        player.vy = -9;
      } else {
        hurtPlayer();
      }
      continue;
    }
    if (stomp || kicking) {
      defeatEnemy(e, stomp ? "#ffd028" : "#ffffff");
      player.vy = -8;
    } else {
      hurtPlayer();
    }
  }
}

function hurtPlayer() {
  if (player.invincible > 0 || won) return;
  hurtPlayerAmount(1, "OUCH!");
}

function hurtPlayerAmount(amount, message = "OUCH!") {
  if (player.invincible > 0 || won) return;
  player.hearts -= amount;
  player.invincible = 90;
  player.vx = -player.dir * 5;
  player.vy = -8;
  updateHud(player.hearts > 0 ? message : "TRY AGAIN!");
  burst(player.x + player.w / 2, player.y + player.h / 2, "#ff2e42", 22 + amount * 6);

  if (player.hearts <= 0) {
    if (screen === "survival") {
      won = true;
      updateHud(`SURVIVED ${survivalWave} WAVES`);
      return;
    }
    player.hearts = 5;
    loadLevel(currentLevel, "TRY AGAIN!");
  }
}

function respawnPlayer() {
  if (player.invincible > 0 || won) return;
  hurtPlayer();
  player.x = spawnPoint.x;
  player.y = spawnPoint.y;
  player.vx = 0;
  player.vy = 0;
  player.crawling = false;
  const size = standingSize();
  setPlayerSize(size.w, size.h);
}

function grabAndThrowPlayer(enemy) {
  const dir = player.x < enemy.x ? -1 : 1;
  player.thrownBy = dir;
  player.thrownDamage = 2;
  player.invincible = 20;
  player.vx = dir * 6.2;
  player.vy = -18.5;
  player.onGround = false;
  enemy.grabCooldown = 120;
  updateHud("GRABBED!");
  burst(player.x + player.w / 2, player.y + player.h / 2, "#ffb27d", 22);
}

function applyThrownLanding() {
  player.thrownDamage = 0;
  player.knockedTimer = 55;
  player.vx = 0;
  hurtPlayerAmount(2, "HURLED!");
}

function usePower() {
  if (screen === "tankytown") {
    if (!won && tankyLastFire === 0) {
      fireTownShot(tankyPlayer, false);
      tankyLastFire = 18;
    }
    return;
  }
  if (!player || screen === "menu" || screen === "builder") return;
  if (won) return;
  if (isNinjaCrystalLevel() || player.power === "ninja") {
    shots.push({
      x: player.x + player.w / 2 + player.dir * 18,
      y: player.y + player.h / 2 - 8,
      w: 18,
      h: 18,
      vx: player.dir * 10,
      kind: "shuriken",
      life: 90
    });
    updateHud(isNinjaCrystalLevel() ? crystalHud() : "SHURIKEN!");
    return;
  }
  if (player.power === "tiny" || player.power === "big" || player.ammo <= 0) return;
  const kind = player.power;
  shots.push({
    x: player.x + player.w / 2 + player.dir * 18,
    y: player.y + player.h / 2 - 5,
    w: kind === "laser" ? 34 : 16,
    h: kind === "laser" ? 6 : 16,
    vx: player.dir * (kind === "laser" ? 12 : 8),
    kind,
    life: 80
  });
  player.ammo--;
  updateHud(`${kind.toUpperCase()} x${player.ammo}`);
}

function tickShots() {
  for (const s of shots) {
    s.x += s.vx;
    if (s.gravity) s.vy = (s.vy || 0) + s.gravity;
    if (s.vy) s.y += s.vy;
    if (s.armTime > 0) s.armTime--;
    s.life--;
    if (s.hostile) {
      if (s.armTime > 0) continue;
      if (overlap(s, player)) {
        if (s.kind === "potion") {
          applyHostilePotion(s.effect, s.x, s.y);
        } else if (s.kind === "enemyIce") {
          player.slowTimer = 220;
          burst(s.x, s.y, "#9be8ff", 18);
          updateHud("RIVAL ICE!");
        } else if (s.kind === "enemyShuriken") {
          applyNinjaShurikenEffect(s.effect, s.x, s.y);
        } else if (s.kind === 'skyFist') {
          hurtPlayerAmount(1, 'GIANT FIST!');
        } else if (s.kind === 'evokerFang') {
          burst(s.x + s.w / 2, s.y + s.h / 2, '#f8f3e8', 16);
          hurtPlayerAmount(1, 'FANGS!');
        } else {
          burst(s.x, s.y, "#ff5a1f", 16);
          hurtPlayer();
        }
        s.life = 0;
      }
      continue;
    }
    for (const e of enemies) {
      if (!e.alive || !overlap(s, e)) continue;
      if (s.kind === "shuriken") {
        damageAnyEnemyByShuriken(e);
        burst(s.x, s.y, "#dbe8ec", 12);
        s.life = 0;
        continue;
      }
      if (e.kind === "boss" || e.kind === "gorillaBoss" || e.kind === "rivalPlayer" || e.kind === "slimRival" || e.kind === "challenger") {
        if (e.kind === "gorillaBoss") {
          damageGorillaBoss(e);
        } else if (e.kind === "rivalPlayer" || e.kind === "slimRival" || e.kind === "challenger") {
          damageRivalPlayer(e);
        }
        burst(s.x, s.y, "#ffe94c", 8);
        s.life = 0;
        continue;
      }
      if (s.kind === "fire") defeatEnemy(e, "#ff6b1f");
      if (s.kind === "ice") {
        e.frozen = 600;
        burst(e.x + e.w / 2, e.y + e.h / 2, "#9be8ff", 20);
      }
      if (s.kind === "laser") defeatEnemy(e, "#ffe94c");
      s.life = 0;
    }
  }
  shots = shots.filter(s => s.life > 0 && !s.arena);
}

function applyNinjaShurikenEffect(effect, x, y) {
  burst(x, y, "#dbe8ec", 18);
  if (effect === "float") {
    player.vy = -13.5;
    updateHud("NINJA FLOAT!");
    return;
  }
  if (effect === "tiny") {
    setPlayerSize(18, 28);
    player.power = "tiny";
    updateHud("MADE TINY!");
    return;
  }
  if (effect === "oneHeart") {
    player.hearts = Math.min(player.hearts, 1);
    player.invincible = 80;
    updateHud("ONE HEART!");
    return;
  }
  hurtPlayer();
}

function damageAnyEnemyByShuriken(enemy) {
  if (enemy.hitCooldown > 0) return;
  enemy.hitCooldown = 10;
  enemy.shurikenHp = (enemy.shurikenHp ?? 3) - 1;
  if (enemy.shurikenHp > 0) {
    updateHud(`SHURIKEN HIT ${3 - enemy.shurikenHp}/3`);
    return;
  }
  enemy.alive = false;
  burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#dbe8ec", 32);
  updateHud("NINJA DOWN!");
}

function applyHostilePotion(effect, x, y) {
  if (effect === "slow") {
    player.slowTimer = 520;
    burst(x, y, "#7fd0ff", 22);
    updateHud("SLOW POTION!");
    return;
  }
  growPlayerHuge();
  burst(x, y, "#ffd028", 26);
}

function kick() {
  if (screen === "tankytown") {
    if (!won && tankyLastFire === 0) {
      fireTownShot(tankyPlayer, false);
      tankyLastFire = 18;
    }
    return;
  }
  if (!player || screen === "menu" || screen === "builder") return;
  if (won) return;
  player.kickTimer = 18;
  const hitbox = {
    x: player.dir > 0 ? player.x + player.w - 2 : player.x - 34,
    y: player.y + 8,
    w: 36,
    h: player.h - 8
  };
  enemies.forEach(enemy => {
    if (enemy.alive && overlap(hitbox, enemy)) defeatEnemy(enemy, "#ffffff");
  });
  burst(player.x + player.w / 2 + player.dir * 24, player.y + player.h / 2, "#f6c47a", 8);
}

function defeatEnemy(enemy, color) {
  if (enemy.hitCooldown > 0) return;
  if (enemy.kind === "boss") {
    damageBoss(enemy);
    return;
  }
  if (enemy.kind === "gorillaBoss") {
    damageGorillaBoss(enemy);
    return;
  }
  if (enemy.kind === "rivalPlayer" || enemy.kind === "slimRival" || enemy.kind === "challenger") {
    damageRivalPlayer(enemy);
    return;
  }
  if (enemy.kind === "tank") {
    damageTank(enemy);
    return;
  }
  if (enemy.kind === "skeleton") {
    clatterSkeleton(enemy, color);
    return;
  }
  enemy.alive = false;
  burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, color, 30);
}

function damageTank(tank) {
  tank.hitCooldown = 18;
  tank.hp--;
  burst(tank.x + tank.w / 2, tank.y + tank.h / 2, "#6f7478", 18);
  updateHud(`TANK ARMOR ${Math.max(0, tank.hp)}`);
  if (tank.hp > 0) return;
  tank.alive = false;
  burst(tank.x + tank.w / 2, tank.y + tank.h / 2, "#ff5a1f", 45);
  for (let i = 0; i < tank.spawnCount; i++) {
    enemies.push(makeBoss(tank.x + 8 + i * 34, 410, i === 1 ? 0 : (i === 0 ? -1.05 : 1.05)));
  }
  updateHud("3 BOSSES OUT!");
}

function damageBoss(boss) {
  if (boss.hitCooldown > 0) return;
  boss.hitCooldown = 14;
  boss.hp--;
  bossHitsTotal++;
  burst(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ffd028", 14);
  updateHud(`BOSS ${Math.max(0, boss.hp)}/25`);
  if (boss.hp > 0) return;
  boss.alive = false;
  burst(boss.x + boss.w / 2, boss.y + boss.h / 2, "#ff2e42", 55);
  updateHud("BOSS DOWN!");
}

function damageGorillaBoss(gorilla) {
  if (gorilla.hitCooldown > 0) return;
  gorilla.hitCooldown = 16;
  gorilla.hp--;
  bossHitsTotal++;
  burst(gorilla.x + gorilla.w / 2, gorilla.y + gorilla.h / 2, "#ff9f43", 18);
  updateHud(`GORILLA ${Math.max(0, gorilla.hp)}/18`);
  if (gorilla.hp > 0) return;
  gorilla.alive = false;
  gorilla.throwCooldown = 99999;
  burst(gorilla.x + gorilla.w / 2, gorilla.y + gorilla.h / 2, "#ff2e42", 70);
  updateHud("GORILLA DOWN!");
}

function damageRivalPlayer(rival) {
  if (rival.hitCooldown > 0) return;
  rival.hitCooldown = 18;
  rival.hp--;
  bossHitsTotal++;
  burst(rival.x + rival.w / 2, rival.y + rival.h / 2, "#7fd0ff", 16);
  updateHud(`RIVAL ${Math.max(0, rival.hp)}/5`);
  if (rival.hp > 0) return;
  rival.alive = false;
  burst(rival.x + rival.w / 2, rival.y + rival.h / 2, "#ff2e42", 60);
  updateHud("RIVAL DOWN!");
}

function clatterSkeleton(enemy, color) {
  if (!enemy.alive) return;
  enemy.alive = false;
  enemy.frozen = 0;
  enemy.reformTimer = 300;
  enemy.bones = [
    { x: enemy.x + 13, y: enemy.y + 4, w: 12, h: 10, vx: -1.2, vy: -4.4, type: "skull" },
    { x: enemy.x + 7, y: enemy.y + 18, w: 17, h: 6, vx: 1.3, vy: -3.5, type: "rib" },
    { x: enemy.x + 2, y: enemy.y + 27, w: 16, h: 5, vx: -1.8, vy: -2.8, type: "bone" },
    { x: enemy.x + 18, y: enemy.y + 30, w: 16, h: 5, vx: 1.8, vy: -3.1, type: "bone" },
    { x: enemy.x - 2, y: enemy.y + 15, w: 13, h: 4, vx: -2.2, vy: -2.2, type: "bone" },
    { x: enemy.x + 25, y: enemy.y + 16, w: 13, h: 4, vx: 2.2, vy: -2.5, type: "bone" }
  ];
  burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, color, 18);
  updateHud("BONES CLATTER!");
}

function tickSkeletonBones(enemy) {
  const floor = enemy.startY + enemy.h - 5;
  for (const bone of enemy.bones) {
    bone.x += bone.vx;
    bone.y += bone.vy;
    bone.vy += 0.24;
    if (bone.y > floor) {
      bone.y = floor;
      bone.vy *= -0.25;
      bone.vx *= 0.86;
    }
  }
}

function reformSkeleton(enemy) {
  enemy.alive = true;
  enemy.x = enemy.startX;
  enemy.y = enemy.startY;
  enemy.vx = enemy.startVx;
  enemy.frozen = 0;
  enemy.reformTimer = 0;
  enemy.bones = [];
  burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#f0eee2", 24);
}

function checkWin() {
  if (!won && overlap(player, flag)) {
    if (isNinjaCrystalLevel() && crystalsCollected < crystalGoal()) {
      updateHud(`NEED ${crystalHud()}`);
      player.x -= 45;
      return;
    }
    advanceLevel();
  }
}

function advanceLevel() {
  if (currentLevel === 1) {
    loadLevel(2, "LEVEL 2!");
    burst(player.x + 24, player.y + 24, "#ffd028", 80);
    return;
  }
  if (currentLevel === 2) {
    loadLevel(3, "LAVA LAND!");
    burst(player.x + 24, player.y + 24, "#ff6b1f", 80);
    return;
  }
  if (currentLevel === 3) {
    loadLevel(4, "TANK TROUBLE!");
    burst(player.x + 24, player.y + 24, "#6f7478", 80);
    return;
  }
  if (currentLevel === 4 && enemies.some(e => e.alive && (e.kind === "tank" || e.kind === "boss"))) {
    updateHud("BEAT THE BOSSES!");
    player.x -= 60;
    return;
  }
  if (currentLevel === 4) {
    loadLevel(5, "POTION PANIC!");
    burst(player.x + 24, player.y + 24, "#ff8d42", 80);
    return;
  }
  if (currentLevel === 5) {
    loadLevel(8, "GORILLA RESCUE!");
    burst(player.x + 24, player.y + 24, "#ff9f43", 80);
    return;
  }
  if (currentLevel === 8) {
    loadLevel(9, "RIVAL RUMBLE!");
    burst(player.x + 24, player.y + 24, "#7fd0ff", 80);
    return;
  }
  if (currentLevel === 9) {
    storyParadeUnlocked = true;
    startTankyTown(true);
    burst(player.x + 24, player.y + 24, "#ffd028", 80);
    return;
  }
  if (currentLevel === 10) {
    loadLevel(11, "DUNGEON MEETING");
    burst(player.x + 24, player.y + 24, "#7fd0ff", 80);
    return;
  }
  if (currentLevel === 12) {
    loadLevel(13, "SECOND CRYSTAL!");
    burst(player.x + 24, player.y + 24, "#d8a0ff", 80);
    return;
  }
  if (currentLevel === 13) {
    loadLevel(14, "THIRD CRYSTAL!");
    burst(player.x + 24, player.y + 24, "#ffe94c", 80);
    return;
  }
  if (currentLevel === 14) {
    loadLevel(15, "BACK TO THE GUIDE");
    burst(player.x + 24, player.y + 24, "#fff4c8", 80);
    return;
  }
  if (currentLevel === 16 && enemies.some(e => e.alive && e.kind === "slimRival")) {
    updateHud("BEAT THE SLIM RIVAL!");
    player.x -= 55;
    return;
  }
  if (currentLevel === 16) {
    loadLevel(17, "POTION GIANT GAUNTLET!");
    burst(player.x + 24, player.y + 24, "#d8a0ff", 80);
    return;
  }
  if (currentLevel === 17) {
    loadLevel(18, "RAINY CHALLENGERS!");
    burst(player.x + 24, player.y + 24, "#7fd0ff", 80);
    return;
  }
  if (currentLevel === 18 && enemies.some(e => e.alive && e.kind === 'challenger')) {
    updateHud('BEAT THE 3 CHALLENGERS!');
    player.x -= 55;
    return;
  }
  if (currentLevel === 90) {
    loadLevel(19, 'DUNGEON EVOKERS!');
    burst(player.x + 24, player.y + 24, '#b6f2d5', 80);
    return;
  }
  if (currentLevel === 19 && enemies.some(e => e.alive && e.kind === 'evoker')) {
    updateHud('BEAT THE EVOKERS!');
    player.x -= 55;
    return;
  }
  won = true;
  player.vx = 0;
  player.vy = 0;
  updateHud("YOU WON!");
  burst(flag.x + 24, flag.y + 24, "#ffd028", 80);
}

function forceAdvanceLevel() {
  if (currentLevel === 1) {
    loadLevel(2, "LEVEL 2!");
    burst(player.x + 24, player.y + 24, "#ffd028", 80);
    return;
  }
  if (currentLevel === 2) {
    loadLevel(3, "LAVA LAND!");
    burst(player.x + 24, player.y + 24, "#ff6b1f", 80);
    return;
  }
  if (currentLevel === 3) {
    loadLevel(4, "TANK TROUBLE!");
    burst(player.x + 24, player.y + 24, "#6f7478", 80);
    return;
  }
  if (currentLevel === 4) {
    loadLevel(5, "POTION PANIC!");
    burst(player.x + 24, player.y + 24, "#ff8d42", 80);
    return;
  }
  if (currentLevel === 5) {
    loadLevel(8, "GORILLA RESCUE!");
    burst(player.x + 24, player.y + 24, "#ff9f43", 80);
    return;
  }
  if (currentLevel === 8) {
    loadLevel(9, "RIVAL RUMBLE!");
    burst(player.x + 24, player.y + 24, "#7fd0ff", 80);
    return;
  }
  if (currentLevel === 9) {
    storyParadeUnlocked = true;
    startTankyTown(true);
    burst(player.x + 24, player.y + 24, "#ffd028", 80);
    return;
  }
  if (currentLevel === 10) {
    loadLevel(11, "DUNGEON MEETING");
    burst(player.x + 24, player.y + 24, "#7fd0ff", 80);
    return;
  }
  if (currentLevel === 11) {
    loadLevel(12, "YOU ARE A NINJA!");
    return;
  }
  if (currentLevel === 12) {
    loadLevel(13, "SECOND CRYSTAL!");
    burst(player.x + 24, player.y + 24, "#d8a0ff", 80);
    return;
  }
  if (currentLevel === 13) {
    loadLevel(14, "THIRD CRYSTAL!");
    burst(player.x + 24, player.y + 24, "#ffe94c", 80);
    return;
  }
  if (currentLevel === 14) {
    loadLevel(15, "BACK TO THE GUIDE");
    burst(player.x + 24, player.y + 24, "#fff4c8", 80);
    return;
  }
  if (currentLevel === 15) {
    loadLevel(16, "SLIM RIVAL!");
    return;
  }
  if (currentLevel === 16) {
    loadLevel(17, "POTION GIANT GAUNTLET!");
    burst(player.x + 24, player.y + 24, "#d8a0ff", 80);
    return;
  }
  if (currentLevel === 17) {
    loadLevel(18, 'RAINY CHALLENGERS!');
    burst(player.x + 24, player.y + 24, '#7fd0ff', 80);
    return;
  }
  if (currentLevel === 18) {
    loadLevel(90, 'NIGHT OF THE NINJAS!');
    burst(player.x + 24, player.y + 24, '#7fd0ff', 80);
    return;
  }
  if (currentLevel === 90) {
    loadLevel(19, 'DUNGEON EVOKERS!');
    burst(player.x + 24, player.y + 24, '#b6f2d5', 80);
    return;
  }
  won = true;
  player.vx = 0;
  player.vy = 0;
  updateHud("YOU WON!");
  burst(flag.x + 24, flag.y + 24, "#ffd028", 80);
}

function skipLevel() {
  if (screen === "menu" || screen === "builder") return;
  if (won) return;
  forceAdvanceLevel();
}

function showMainMenu() {
  ensurePlayer();
  screen = "menu";
  moveOnBtn.classList.add("hidden");
  menuEl.classList.remove("hidden");
  builderToolsEl.classList.add("hidden");
  arenaToolsEl.classList.add("hidden");
  mainMenuButtonsEl.classList.remove("hidden");
  miniGamesMenuEl.classList.add("hidden");
  enemyPickerEl.classList.add("hidden");
  updateHud("CHOOSE A MODE");
}

function showMiniGamesMenu() {
  mainMenuButtonsEl.classList.add("hidden");
  miniGamesMenuEl.classList.remove("hidden");
  enemyPickerEl.classList.add("hidden");
  updateHud("PICK A MINI GAME");
}

function hideMenu() {
  menuEl.classList.add("hidden");
  moveOnBtn.classList.add("hidden");
}

function showGameUi() {
  hideMenu();
  builderToolsEl.classList.add("hidden");
  arenaToolsEl.classList.add("hidden");
}

function tickParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.18;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
  luckyBlocks.forEach(b => {
    if (b.bump > 0) b.bump--;
  });
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y, color,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.8) * 6,
      life: 30 + Math.random() * 25
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(-camera.x, 0);
  drawSky();
  blocks.forEach(drawBlock);
  movingPlatforms.forEach(drawMovingPlatform);
  pipes.forEach(drawPipe);
  luckyBlocks.forEach(drawLuckyBlock);
  powerups.forEach(drawPowerup);
  magicCrystals.forEach(drawMagicCrystal);
  campfires.forEach(drawCampfire);
  spikyBoxes.forEach(drawSpikyBox);
  drawFlag();
  allyPlayers.forEach(drawAllyPlayer);
  enemies.forEach(drawEnemy);
  if (rescueFriend) drawRescueFriend(rescueFriend);
  if (currentLevel === 11 || currentLevel === 15) drawDungeonGuide();
  drawPlayer();
  if (currentLevel === 11) drawDungeonDialogue();
  if (currentLevel === 15) drawFarewellDialogue();
  if (currentLevel === 60) {
    drawFogOverlay();
  }
  if (currentLevel === 8 || currentLevel === 18) {
    drawRainOverlay();
  }
  shots.forEach(drawShot);
  shots.forEach(drawShot);
  particles.forEach(drawParticle);
  ctx.restore();

  if (currentLevel === 4 || currentLevel === 8 || currentLevel === 9 || currentLevel === 16 || currentLevel === 18) drawBossBars();
  if (won) drawWinText();
}

function drawFogOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(35, 39, 53, 0.94)";
  ctx.fillRect(camera.x, 0, W, H);
  if (gearState.flashlightOwned && gearState.flashlightEquipped) {
    ctx.globalCompositeOperation = "destination-out";
    const glow = ctx.createRadialGradient(player.x + player.w / 2, player.y + player.h / 2, 30, player.x + player.w / 2, player.y + player.h / 2, 170);
    glow.addColorStop(0, "rgba(0,0,0,1)");
    glow.addColorStop(0.6, "rgba(0,0,0,0.65)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.fillStyle = "rgba(80, 88, 108, 0.18)";
  for (let x = camera.x - 40; x < camera.x + W + 80; x += 120) {
    pixelRect(x, 60 + (x % 80), 170, 36);
    pixelRect(x + 30, 160 + (x % 60), 150, 30);
    pixelRect(x - 20, 270 + (x % 50), 180, 34);
  }
  ctx.restore();
}

function drawRainOverlay() {
  ctx.save();
  ctx.strokeStyle = "rgba(190, 225, 255, 0.5)";
  ctx.lineWidth = 2;
  for (let x = Math.floor(camera.x / 42) * 42 - 60; x < camera.x + W + 80; x += 26) {
    const sway = ((x / 11) % 5) * 3;
    const top = (x * 0.35) % H;
    line(x + sway, top, x - 10 + sway, top + 24);
    line(x + 12 + sway, (top + 180) % H, x + 2 + sway, ((top + 180) % H) + 24);
  }
  ctx.fillStyle = "rgba(28, 45, 78, 0.2)";
  ctx.fillRect(camera.x, 0, W, H);
  ctx.restore();
}

function drawInvaders() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(-camera.x, 0);
  drawSky();
  blocks.forEach(drawBlock);
  drawFlag();
  drawRunner();
  drawInvader();
  shots.forEach(drawShot);
  particles.forEach(drawParticle);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#fff4c8";
  ctx.strokeStyle = "#1d1731";
  ctx.lineWidth = 3;
  ctx.fillRect(16, 16, 330, 42);
  ctx.strokeRect(16, 16, 330, 42);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 18px Trebuchet MS";
  ctx.fillText(`RUNNER HEARTS: ${runner.hearts}`, 30, 43);
  ctx.restore();

  if (won) drawWinText();
}

function drawArena() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.fillStyle = "#283448";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#3a455c";
  for (let x = 0; x < W; x += 120) {
    pixelRect(x, 86, 70, 18);
    pixelRect(x + 40, 204, 90, 18);
  }
  blocks.forEach(drawBlock);
  arenaFighters.forEach(fighter => {
    drawArenaFighter(fighter);
    if (!fighter.alive) return;
    ctx.fillStyle = "#fff4c8";
    pixelRect(fighter.x - 4, fighter.y - 16, fighter.w + 8, 8);
    ctx.fillStyle = "#ff2e42";
    pixelRect(fighter.x - 3, fighter.y - 15, (fighter.w + 6) * Math.max(0, fighter.hp / fighter.maxHp), 6);
  });
  shots.forEach(drawShot);
  particles.forEach(drawParticle);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#fff4c8";
  ctx.strokeStyle = "#1d1731";
  ctx.lineWidth = 4;
  ctx.fillRect(18, 18, 585, 84);
  ctx.strokeRect(18, 18, 585, 84);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 16px Trebuchet MS";
  ctx.fillText("ARENA: choose a button, click the floor, then press Fight", 34, 45);
  ctx.fillText(`Placed ${arenaFighters.length}   ${arenaFightStarted ? "FIGHTING!" : "Selected: " + arenaLabel(arenaSelectedType)}   Infinite enemies!`, 34, 72);
  ctx.restore();
}

function drawArenaFighter(fighter) {
  if (fighter.kind === "arenaSpiky") {
    if (!fighter.alive) return;
    drawSpikyBox(fighter);
    return;
  }
  drawEnemy(fighter);
}

function drawRunner() {
  const saved = player;
  player = { ...runner, dir: 1, invincible: 0, kickTimer: 0, crawling: false, bigTimer: 0 };
  drawPlayer();
  player = saved;
}

function drawInvader() {
  if (invader.kind === "skeleton") {
    drawSkeleton({ ...invader, alive: true });
    return;
  }
  if (invader.kind === "spiky") {
    drawSpikyBox(invader);
    return;
  }
  drawEnemy({ ...invader, alive: true, frozen: 0 });
}

function drawMenuScene() {
  ensurePlayer();
  ctx.clearRect(0, 0, W, H);
  drawLavaLand();
}

function drawTankyTown() {
  if (paradeFirstPerson) {
    moveOnBtn.classList.remove("hidden");
    drawParadeFirstPerson();
    ctx.save();
    ctx.fillStyle = "#fff4c8";
    ctx.strokeStyle = "#1d1731";
    ctx.lineWidth = 4;
    ctx.fillRect(18, 18, 370, 96);
    ctx.strokeRect(18, 18, 370, 96);
    ctx.fillStyle = "#1d1731";
    ctx.font = "700 16px Trebuchet MS";
    ctx.fillText("PARADE READY", 34, 44);
    ctx.fillText("PEOPLE ARE CELEBRATING", 34, 70);
    ctx.fillText("PRESS E NEAR SHOPS", 34, 96);
    ctx.restore();
    if (won) drawWinText();
    return;
  }
  moveOnBtn.classList.add("hidden");
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#8dbbff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#535861";
  ctx.fillRect(0, 206, W, 128);
  ctx.fillRect(382, 0, 196, H);
  ctx.strokeStyle = "#fff3a6";
  ctx.lineWidth = 6;
  for (let x = 24; x < W; x += 70) line(x, 270, x + 34, 270);
  for (let y = 18; y < H; y += 70) line(480, y, 480, y + 34);

  tankyBuildings.forEach(building => drawTownBuilding(building));
  tankyShops.forEach(drawTankyShop);
  paradePeople.forEach(drawParadePerson);
  tankyTanks.forEach(tank => drawTownTank(tank));
  drawTownTank(tankyPlayer, true);
  tankyShots.forEach(drawTownShot);

  ctx.save();
  ctx.fillStyle = "#fff4c8";
  ctx.strokeStyle = "#1d1731";
  ctx.lineWidth = 4;
  ctx.fillRect(18, 18, 296, 78);
  ctx.strokeRect(18, 18, 296, 78);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 16px Trebuchet MS";
  ctx.fillText(`CITY HP ${tankyPlayer.hp}`, 34, 45);
  ctx.fillText(tankyWanted ? "WANTED: ACTIVE" : "WANTED: LOW", 34, 72);
  if (gearState.flashlightOwned || gearState.hoverboardOwned) {
    const gearText = [
      gearState.flashlightOwned ? `FLASHLIGHT ${gearState.flashlightEquipped ? "ON" : "OFF"}` : null,
      gearState.hoverboardOwned ? `HOVERBOARD ${gearState.hoverboardEquipped ? "ON" : "OFF"}` : null
    ].filter(Boolean).join("  ");
    ctx.fillText(gearText, 34, 99);
  }
  ctx.restore();

  if (won) drawWinText();
}

function drawTownBuilding(building) {
  ctx.fillStyle = building.color;
  pixelRect(building.x, building.y, building.w, building.h);
  ctx.fillStyle = "#d9e7ff";
  for (let x = building.x + 16; x < building.x + building.w - 8; x += 30) {
    for (let y = building.y + 14; y < building.y + building.h - 8; y += 28) {
      pixelRect(x, y, 12, 12);
    }
  }
  ctx.strokeStyle = "#1d1731";
  ctx.lineWidth = 3;
  ctx.strokeRect(building.x, building.y, building.w, building.h);
}

function drawTankyShop(shop) {
  ctx.fillStyle = "#cda56a";
  pixelRect(shop.x + 8, shop.y + 14, shop.w, shop.h - 14);
  ctx.fillStyle = "#f0d8ad";
  pixelRect(shop.x, shop.y, shop.w, shop.h - 12);
  ctx.fillStyle = "#7ec7e8";
  pixelRect(shop.x + 10, shop.y + 10, shop.w - 20, 18);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 10px Trebuchet MS";
  ctx.fillText("SHOP", shop.x + 20, shop.y + 23);
  ctx.font = "700 11px Trebuchet MS";
  ctx.fillText("PRESS E", shop.x + 10, shop.y + 47);
}

function drawTankyShop3D(shop) {
  const isLeft = shop.x < W / 2;
  const x = isLeft ? 74 : 760;
  const y = 178;
  ctx.fillStyle = "#b98752";
  ctx.beginPath();
  if (isLeft) {
    ctx.moveTo(x, y + 130);
    ctx.lineTo(x + 70, y + 96);
    ctx.lineTo(x + 70, y + 8);
    ctx.lineTo(x, y + 32);
  } else {
    ctx.moveTo(x + 120, y + 130);
    ctx.lineTo(x + 50, y + 96);
    ctx.lineTo(x + 50, y + 8);
    ctx.lineTo(x + 120, y + 32);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f0d8ad";
  pixelRect(x, y, 120, 130);
  ctx.fillStyle = "#7ec7e8";
  pixelRect(x + 16, y + 18, 88, 24);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 13px Trebuchet MS";
  ctx.fillText("SHOP", x + 34, y + 35);
  ctx.font = "700 12px Trebuchet MS";
  ctx.fillText(shop.item === "flashlight" ? "FLASHLIGHT" : "HOVERBOARD", x + 12, y + 67);
  ctx.fillText("PRESS E", x + 28, y + 95);
}

function drawParadeTank(x, y, facingRight) {
  ctx.fillStyle = "#2b3036";
  pixelRect(x, y + 30, 92, 18);
  ctx.fillStyle = "#60796b";
  pixelRect(x + 6, y + 14, 78, 22);
  ctx.fillStyle = "#8ca58f";
  pixelRect(x + 24, y + 2, 34, 16);
  ctx.fillStyle = "#1b1e22";
  pixelRect(facingRight ? x + 54 : x - 8, y + 8, 34, 6);
  ctx.fillStyle = "#151515";
  for (let tread = x + 12; tread < x + 76; tread += 18) {
    pixelRect(tread, y + 34, 10, 8);
  }
}

function drawParadePerson(person) {
  ctx.fillStyle = person.skin;
  pixelRect(person.x + 8, person.y, 12, 12);
  ctx.fillStyle = person.shirt;
  pixelRect(person.x + 4, person.y + 12, 20, 18);
  ctx.fillStyle = "#1d1731";
  pixelRect(person.x + 7, person.y + 30, 5, 12);
  pixelRect(person.x + 16, person.y + 30, 5, 12);
  ctx.fillStyle = person.accent;
  if (person.design === 0) pixelRect(person.x + 2, person.y + 17, 24, 6);
  if (person.design === 1) {
    pixelRect(person.x + 6, person.y + 12, 4, 18);
    pixelRect(person.x + 18, person.y + 12, 4, 18);
  }
  if (person.design === 2) {
    pixelRect(person.x + 4, person.y + 16, 20, 4);
    pixelRect(person.x + 10, person.y + 12, 8, 18);
  }
  if (person.design === 3) {
    pixelRect(person.x + 5, person.y + 14, 18, 12);
  }
}

function drawParadePersonFirstPerson(person) {
  const view = projectParadePerson(person);
  const x = view.screenX;
  const scale = view.scale;
  const base = view.baseline;
  ctx.fillStyle = person.skin;
  pixelRect(x - 12 * scale, base - 62 * scale, 24 * scale, 18 * scale);
  ctx.fillStyle = "#111827";
  pixelRect(x - 14 * scale, base - 70 * scale, 28 * scale, 8 * scale);
  ctx.fillStyle = person.shirt;
  pixelRect(x - 20 * scale, base - 44 * scale, 40 * scale, 30 * scale);
  ctx.fillStyle = "#1d1731";
  pixelRect(x - 14 * scale, base - 14 * scale, 10 * scale, 24 * scale);
  pixelRect(x + 4 * scale, base - 14 * scale, 10 * scale, 24 * scale);
  ctx.fillStyle = person.accent;
  if (person.design === 0) pixelRect(x - 18 * scale, base - 35 * scale, 36 * scale, 8 * scale);
  if (person.design === 1) {
    pixelRect(x - 12 * scale, base - 44 * scale, 6 * scale, 30 * scale);
    pixelRect(x + 6 * scale, base - 44 * scale, 6 * scale, 30 * scale);
  }
  if (person.design === 2) {
    pixelRect(x - 16 * scale, base - 33 * scale, 32 * scale, 6 * scale);
    pixelRect(x - 6 * scale, base - 44 * scale, 12 * scale, 30 * scale);
  }
  if (person.design === 3) pixelRect(x - 15 * scale, base - 40 * scale, 30 * scale, 18 * scale);
}

function drawTownTank(tank, playerTank = false) {
  const color = playerTank ? "#6f7478" : tank.police ? "#244fa8" : tank.color;
  ctx.fillStyle = "#252a2e";
  pixelRect(tank.x + 4, tank.y + tank.h - 10, tank.w - 8, 8);
  ctx.fillStyle = color;
  pixelRect(tank.x, tank.y + 10, tank.w, tank.h - 12);
  ctx.fillStyle = playerTank ? "#9eb6c2" : tank.police ? "#7ea3ff" : "#98a678";
  pixelRect(tank.x + 9, tank.y + 4, tank.w - 18, 16);
  ctx.fillStyle = "#1b1e22";
  if (Math.abs(tank.dirX) >= Math.abs(tank.dirY)) {
    const right = tank.dirX >= 0;
    pixelRect(right ? tank.x + tank.w - 2 : tank.x - 18, tank.y + 14, 20, 6);
  } else {
    const down = tank.dirY >= 0;
    pixelRect(tank.x + 16, down ? tank.y + tank.h - 2 : tank.y - 18, 6, 20);
  }
  if (tank.police) {
    ctx.fillStyle = "#ff4a4a";
    pixelRect(tank.x + 8, tank.y + 12, 8, 4);
    ctx.fillStyle = "#9fd7ff";
    pixelRect(tank.x + tank.w - 16, tank.y + 12, 8, 4);
  }
}

function drawTownShot(shot) {
  ctx.fillStyle = shot.hostile ? "#ff5a1f" : "#ffd028";
  pixelRect(shot.x, shot.y, shot.w, shot.h);
  ctx.fillStyle = "#1d1731";
  pixelRect(shot.x + 3, shot.y + 3, shot.w - 6, shot.h - 6);
}

function drawCampfire(fire) {
  const x = fire.x;
  const y = fire.y;
  const s = fire.size || 1;
  ctx.fillStyle = "#6f5334";
  pixelRect(x - 20 * s, y + 8 * s, 18 * s, 8 * s);
  pixelRect(x + 2 * s, y + 8 * s, 18 * s, 8 * s);
  ctx.fillStyle = "#3b2415";
  pixelRect(x - 4 * s, y + 8 * s, 8 * s, 8 * s);
  ctx.fillStyle = "#ff7b24";
  pixelRect(x - 7 * s, y - 10 * s, 14 * s, 24 * s);
  ctx.fillStyle = "#ffd86a";
  pixelRect(x - 3 * s, y - 2 * s, 6 * s, 15 * s);
}

function drawBuilder() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(-camera.x, 0);
  ctx.fillStyle = "#8fd0ff";
  ctx.fillRect(camera.x, 0, W, H);
  drawCloud(180, 80);
  drawCloud(760, 105);
  customCourse.blocks.forEach(drawBlock);
  customCourse.lucky.forEach(item => drawLuckyBlock({ ...item, w: 42, h: 42, used: false, bump: 0 }));
  customCourse.platforms.forEach(item => drawMovingPlatform({ ...item, w: 118, h: 24 }));
  customCourse.spikes.forEach(item => drawSpikyBox({ ...item, w: 52, h: 52 }));
  customCourse.skeletons.forEach(item => drawSkeleton({ ...item, w: 30, h: 42 }));
  customCourse.miniBosses.forEach(item => drawMiniBoss({ ...item, w: 36, h: 48, alive: true }));
  customCourse.bosses.forEach(item => drawBoss({ ...item, w: 44, h: 58, alive: true }));
  customCourse.tanks.forEach(item => drawTank({ ...item, w: 86, h: 52 }));
  drawFlagAt(customCourse.flag.x, customCourse.flag.y);
  drawBuilderStart(customCourse.start.x, customCourse.start.y);
  ctx.restore();
}

function drawBuilderStart(x, y) {
  ctx.fillStyle = "#28c0dc";
  pixelRect(x, y - 42, 26, 42);
  ctx.fillStyle = "#ffd0a6";
  pixelRect(x + 5, y - 58, 16, 16);
  ctx.fillStyle = "#16131c";
  pixelRect(x + 3, y - 62, 20, 6);
}

function drawSky() {
  if (currentLevel === 3) {
    drawLavaLand();
    return;
  }
  if (currentLevel === 8) {
    drawGorillaSky();
    return;
  }
  if (currentLevel === 9 || currentLevel === 16 || currentLevel === 18) {
    drawRivalSky();
    return;
  }
  if (currentLevel === 11 || currentLevel === 15 || currentLevel === 19 || currentLevel === 90 || isNinjaCrystalLevel()) {
    drawDungeonSky();
    return;
  }
  if (currentLevel === 70) {
    drawTimeTwistSky();
    return;
  }
  ctx.fillStyle = "#7db4ff";
  ctx.fillRect(camera.x, 0, W, H);
  drawCloud(160, 86);
  drawCloud(620, 62);
  drawCloud(1130, 102);
  drawCloud(1840, 74);
  drawCloud(2480, 95);
  drawHill(2600, 468, 140, "#5bc95c");
  drawHill(2860, 468, 190, "#3aa84d");
}

function drawDungeonSky() {
  ctx.fillStyle = currentLevel === 11 ? "#191522" : "#111827";
  ctx.fillRect(camera.x, 0, W, H);
  ctx.fillStyle = "#2d2638";
  for (let x = Math.floor(camera.x / 160) * 160; x < camera.x + W + 180; x += 160) {
    pixelRect(x, 96, 118, 28);
    pixelRect(x + 24, 180, 130, 26);
    pixelRect(x - 12, 300, 144, 28);
  }
  ctx.fillStyle = "#4b3a2c";
  pixelRect(camera.x, 468, W, 72);
  ctx.fillStyle = "#ff9d3d";
  pixelRect(camera.x + 120, 350, 14, 44);
  pixelRect(camera.x + W - 160, 350, 14, 44);
  ctx.fillStyle = "#ffd86a";
  pixelRect(camera.x + 118, 330, 18, 24);
  pixelRect(camera.x + W - 162, 330, 18, 24);
}

function drawRivalSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#182238");
  gradient.addColorStop(0.55, "#2f4666");
  gradient.addColorStop(1, "#51433a");
  ctx.fillStyle = gradient;
  ctx.fillRect(camera.x, 0, W, H);
  ctx.fillStyle = "rgba(255, 244, 206, 0.18)";
  ctx.beginPath();
  ctx.arc(camera.x + 740, 92, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a3140";
  drawHill(380, 468, 230, "#283448");
  drawHill(980, 468, 190, "#243245");
  drawHill(1640, 468, 220, "#202d3e");
  drawHill(2340, 468, 180, "#233247");
  ctx.fillStyle = "#2f261f";
  ctx.fillRect(camera.x, 468, W, 72);
}

function drawGorillaSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#263d67");
  gradient.addColorStop(0.45, "#4f6f9b");
  gradient.addColorStop(1, "#6f756f");
  ctx.fillStyle = gradient;
  ctx.fillRect(camera.x, 0, W, H);
  drawCloud(210, 80);
  drawCloud(760, 108);
  drawCloud(1380, 72);
  drawCloud(2140, 96);

  ctx.fillStyle = "#7085a6";
  for (let x = camera.x - 100; x < camera.x + W + 180; x += 180) {
    pixelRect(x, 250 + ((x / 20) % 3) * 12, 70, 190);
    pixelRect(x + 46, 212 + ((x / 30) % 4) * 10, 92, 228);
  }

  ctx.fillStyle = "#4a4a55";
  ctx.fillRect(camera.x, 468, W, 72);
}

function drawTimeTwistSky() {
  ctx.fillStyle = "#f1d28a";
  ctx.fillRect(camera.x, 0, 1500, H);
  ctx.fillStyle = "#d0b06b";
  pixelRect(180, 110, 120, 220);
  pixelRect(780, 130, 140, 200);
  pixelRect(1120, 150, 100, 180);
  ctx.fillStyle = "#b99654";
  pixelRect(220, 86, 40, 24);
  pixelRect(828, 104, 44, 24);
  ctx.fillStyle = "#21304c";
  ctx.fillRect(1500, 0, W + 1000, H);
  ctx.fillStyle = "#6ef0ff";
  pixelRect(1680, 90, 140, 16);
  pixelRect(2000, 150, 120, 14);
  pixelRect(2320, 108, 130, 14);
  ctx.fillStyle = "#4f6cb9";
  pixelRect(1560, 260, 200, 180);
  pixelRect(1910, 220, 160, 220);
  pixelRect(2280, 250, 180, 190);
}

function drawLavaLand() {
  ctx.fillStyle = "#3c1419";
  ctx.fillRect(camera.x, 0, W, H);
  ctx.fillStyle = "#6f1f1a";
  ctx.fillRect(camera.x, 190, W, 278);
  drawVolcano(280, 468, 180);
  drawVolcano(920, 468, 230);
  drawVolcano(1720, 468, 190);
  drawVolcano(2380, 468, 230);

  for (let x = Math.floor(camera.x / 80) * 80; x < camera.x + W + 80; x += 80) {
    ctx.fillStyle = "#ff5a1f";
    pixelRect(x, 505, 80, 35);
    ctx.fillStyle = "#ffd028";
    pixelRect(x + 12, 514 + Math.sin((Date.now() / 180) + x) * 5, 28, 8);
    ctx.fillStyle = "#ffb21c";
    pixelRect(x + 50, 526 + Math.cos((Date.now() / 210) + x) * 4, 20, 6);
  }
}

function drawVolcano(x, y, r) {
  ctx.fillStyle = "#24161a";
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.lineTo(x - 35, y - r);
  ctx.lineTo(x + 35, y - r);
  ctx.lineTo(x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff4a1f";
  pixelRect(x - 28, y - r + 20, 56, 15);
  pixelRect(x - 10, y - r + 35, 20, 80);
}

function drawCloud(x, y) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.beginPath();
  ctx.arc(x + 22, y + 24, 18, 0, Math.PI * 2);
  ctx.arc(x + 42, y + 14, 15, 0, Math.PI * 2);
  ctx.arc(x + 62, y + 23, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawHill(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.quadraticCurveTo(x - r * 0.4, y - r * 0.85, x, y - r);
  ctx.quadraticCurveTo(x + r * 0.42, y - r * 0.78, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#26743a";
  pixelRect(x - 20, y - 70, 10, 10);
  pixelRect(x + 18, y - 92, 10, 10);
}

function drawBlock(b) {
  if (b.type === "brick") {
    ctx.fillStyle = "#bc6338";
    pixelRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = "#73371d";
    ctx.lineWidth = 2;
    for (let y = b.y + 10; y < b.y + b.h; y += 16) line(b.x, y, b.x + b.w, y);
    for (let x = b.x + 12; x < b.x + b.w; x += 24) line(x, b.y, x, b.y + b.h);
  } else if (b.type === "basalt") {
    ctx.fillStyle = "#2f3035";
    pixelRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = "#56535a";
    for (let x = b.x + 8; x < b.x + b.w; x += 30) {
      pixelRect(x, b.y + 6, 18, 6);
      pixelRect(x + 8, b.y + 18, 18, 5);
    }
    ctx.strokeStyle = "#17171c";
    ctx.lineWidth = 3;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  } else if (b.type === "metal") {
    ctx.fillStyle = "#59636d";
    pixelRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = "#9aa7ad";
    pixelRect(b.x + 8, b.y + 6, b.w - 16, 7);
    ctx.fillStyle = "#30363c";
    for (let x = b.x + 16; x < b.x + b.w - 8; x += 34) {
      pixelRect(x, b.y + 18, 10, 8);
    }
    ctx.strokeStyle = "#1d1731";
    ctx.lineWidth = 3;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
  } else {
    ctx.fillStyle = "#d8892f";
    pixelRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = "#7a3719";
    pixelRect(b.x + 5, b.y + 5, b.w - 10, 6);
  }
}

function drawMovingPlatform(p) {
  ctx.fillStyle = "#17171c";
  pixelRect(p.x, p.y + 18, p.w, 8);
  ctx.fillStyle = "#6e6a72";
  pixelRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#a4a0a8";
  pixelRect(p.x + 8, p.y + 5, p.w - 16, 5);
  ctx.fillStyle = "#ffb21c";
  pixelRect(p.x + 12, p.y + 13, 18, 5);
  pixelRect(p.x + p.w - 30, p.y + 13, 18, 5);
  ctx.strokeStyle = "#17171c";
  ctx.lineWidth = 3;
  ctx.strokeRect(p.x, p.y, p.w, p.h);
}

function drawLuckyBlock(b) {
  const y = b.y - b.bump;
  ctx.fillStyle = b.used ? "#d08b24" : "#ffc21f";
  pixelRect(b.x, y, b.w, b.h);
  ctx.strokeStyle = "#20152d";
  ctx.lineWidth = 4;
  ctx.strokeRect(b.x, y, b.w, b.h);
  ctx.fillStyle = "#20152d";
  pixelRect(b.x + 8, y + 8, 5, 5);
  pixelRect(b.x + b.w - 13, y + 8, 5, 5);
  pixelRect(b.x + 8, y + b.h - 13, 5, 5);
  pixelRect(b.x + b.w - 13, y + b.h - 13, 5, 5);
  if (!b.used) {
    ctx.font = "700 34px Trebuchet MS";
    ctx.fillText("?", b.x + 12, y + 32);
  }
}

function drawPipe(p) {
  ctx.fillStyle = "#2cab35";
  pixelRect(p.x + 8, p.y + 18, p.w - 16, p.h - 18);
  ctx.fillStyle = "#53df5c";
  pixelRect(p.x, p.y, p.w, 24);
  ctx.fillStyle = "#137d25";
  pixelRect(p.x + 10, p.y + 5, p.w - 20, 5);
}

function drawFlag() {
  drawFlagAt(flag.x, flag.y);
}

function drawFlagAt(x, y) {
  ctx.fillStyle = "#292033";
  pixelRect(x, y, 8, 150);
  ctx.fillStyle = "#ffd028";
  pixelRect(x + 8, y, 78, 42);
  ctx.fillStyle = "#e92b2b";
  pixelRect(x + 8, y + 14, 60, 14);
}

function drawSpikyBox(box) {
  const x = box.x;
  const y = box.y;
  ctx.fillStyle = "#5c6a68";
  for (let i = 0; i < 6; i++) {
    triangle(x + 4 + i * 9, y - 14, x + 9 + i * 9, y - 1, x - 1 + i * 9, y - 1);
    triangle(x + 4 + i * 9, y + box.h + 14, x - 1 + i * 9, y + box.h + 1, x + 9 + i * 9, y + box.h + 1);
  }
  for (let i = 0; i < 5; i++) {
    triangle(x - 14, y + 5 + i * 10, x - 1, y + i * 10, x - 1, y + 12 + i * 10);
    triangle(x + box.w + 14, y + 5 + i * 10, x + box.w + 1, y + 12 + i * 10, x + box.w + 1, y + i * 10);
  }

  ctx.fillStyle = "#74817d";
  pixelRect(x, y, box.w, box.h);
  ctx.strokeStyle = "#293130";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, box.w, box.h);
  ctx.fillStyle = "#a9bbb4";
  pixelRect(x + 7, y + 8, box.w - 14, 9);
  ctx.fillStyle = "#4d5957";
  pixelRect(x + 9, y + 18, box.w - 18, 23);
  ctx.fillStyle = "#f4f7f0";
  pixelRect(x + 10, y + 31, box.w - 20, 8);
  ctx.fillStyle = "#15151b";
  pixelRect(x + 11, y + 34, box.w - 22, 3);
  ctx.fillStyle = "#e73535";
  pixelRect(x + 14, y + 20, 6, 6);
  pixelRect(x + 32, y + 20, 6, 6);
  ctx.fillStyle = "#15151b";
  pixelRect(x + 13, y + 18, 10, 3);
  pixelRect(x + 30, y + 18, 10, 3);
}

function drawEnemy(e) {
  if (!e.alive) {
    if (e.kind === "skeleton") drawBonePile(e);
    return;
  }
  if (e.frozen > 0) {
    ctx.fillStyle = "#aeeeff";
    pixelRect(e.x - 5, e.y - 5, e.w + 10, e.h + 10);
    ctx.fillStyle = "#e8fbff";
    pixelRect(e.x, e.y, e.w / 2, e.h / 2);
    return;
  }
  if (e.kind === "skeleton") {
    drawSkeleton(e);
    return;
  }
  if (e.kind === "tank") {
    drawTank(e);
    return;
  }
  if (e.kind === "boss") {
    drawBoss(e);
    return;
  }
  if (e.kind === "gorillaBoss") {
    drawGorillaBoss(e);
    return;
  }
  if (e.kind === "bigGrabber") {
    drawBigGrabber(e);
    return;
  }
  if (e.kind === "enemyNinja") {
    drawEnemyNinja(e);
    return;
  }
  if (e.kind === "rivalPlayer") {
    drawRivalPlayer(e);
    return;
  }
  if (e.kind === "slimRival") {
    drawSlimRival(e);
    return;
  }
  if (e.kind === "challenger") {
    drawChallenger(e);
    return;
  }
  if (e.kind === "miniBoss") {
    drawMiniBoss(e);
    return;
  }
  if (e.kind === 'caster') {
    drawCaster(e);
    return;
  }
  if (e.kind === 'evoker') {
    drawEvoker(e);
    return;
  }
  if (e.kind === "mummy") {
    drawMummy(e);
    return;
  }
  if (e.kind === "futureSkeleton") {
    drawFutureSkeleton(e);
    return;
  }
  ctx.fillStyle = "#202a3b";
  pixelRect(e.x + 6, e.y + 16, 20, 24);
  ctx.fillStyle = "#ffd0a6";
  pixelRect(e.x + 6, e.y, 20, 18);
  ctx.fillStyle = "#2c2017";
  pixelRect(e.x + 5, e.y - 3, 22, 6);
  ctx.fillStyle = "#c72626";
  pixelRect(e.x + 14, e.y + 18, 5, 18);
  ctx.fillStyle = "#20152d";
  pixelRect(e.x + 10, e.y + 8, 4, 4);
  pixelRect(e.x + 20, e.y + 8, 4, 4);
  pixelRect(e.x + 10, e.y + 15, 14, 3);
  ctx.fillStyle = "#dbe8ec";
  pixelRect(e.x - 8, e.y + 10, 10, 12);
  pixelRect(e.x + 30, e.y + 10, 10, 12);
}

function drawChallenger(e) {
  const x = e.x;
  const y = e.y;
  const accent = e.style === "cyan" ? "#20e8f5" : e.style === "blue" ? "#238dff" : "#da38ff";
  const shirt = e.style === "blue" ? "#125bc4" : "#111827";
  const pants = e.style === "purple" ? "#f4f0f5" : "#0f1628";
  ctx.fillStyle = "#1d120d";
  pixelRect(x + 4, y - 3, 22, 9);
  ctx.fillStyle = "#f2c291";
  pixelRect(x + 7, y + 5, 17, 16);
  ctx.fillStyle = shirt;
  pixelRect(x + 2, y + 22, 26, 23);
  ctx.fillStyle = accent;
  if (e.style === "cyan") {
    pixelRect(x + 8, y + 31, 5, 8);
    pixelRect(x + 13, y + 36, 11, 5);
  } else if (e.style === "blue") {
    pixelRect(x + 6, y + 26, 16, 5);
    pixelRect(x + 13, y + 31, 8, 8);
  } else {
    pixelRect(x + 4, y + 30, 5, 10);
    pixelRect(x + 22, y + 30, 5, 10);
  }
  ctx.fillStyle = pants;
  pixelRect(x + 5, y + 45, 8, 18);
  pixelRect(x + 17, y + 45, 8, 18);
  ctx.fillStyle = accent;
  pixelRect(x + 3, y + 61, 11, 6);
  pixelRect(x + 16, y + 61, 11, 6);
  ctx.fillStyle = "#1d1731";
  pixelRect(x + 10, y + 11, 3, 3);
  pixelRect(x + 19, y + 11, 3, 3);
}

function drawEvoker(e) {
  const x = e.x;
  const y = e.y;
  ctx.fillStyle = '#5c6468';
  pixelRect(x + 7, y, 20, 18);
  ctx.fillStyle = '#3c4346';
  pixelRect(x + 4, y + 3, 8, 14);
  pixelRect(x + 22, y + 3, 8, 14);
  ctx.fillStyle = '#151515';
  pixelRect(x + 5, y + 18, 24, 31);
  ctx.fillStyle = '#d8c26a';
  pixelRect(x + 16, y + 19, 4, 30);
  ctx.fillStyle = '#a62833';
  pixelRect(x + 11, y + 8, 3, 3);
  pixelRect(x + 21, y + 8, 3, 3);
  ctx.fillStyle = '#8a9296';
  pixelRect(x - 4, y + 22, 10, 5);
  pixelRect(x + 28, y + 22, 10, 5);
  ctx.fillStyle = '#b6f2d5';
  pixelRect(x + (e.dir > 0 ? 31 : -5), y + 15, 6, 16);
}

function drawTank(t) {
  ctx.fillStyle = "#252a2e";
  pixelRect(t.x + 6, t.y + 36, 72, 14);
  ctx.fillStyle = "#4a545b";
  pixelRect(t.x, t.y + 18, 78, 28);
  ctx.fillStyle = "#6f7a80";
  pixelRect(t.x + 18, t.y + 6, 34, 20);
  ctx.fillStyle = "#1b1e22";
  pixelRect(t.x + 50, t.y + 12, 34, 8);
  ctx.fillStyle = "#ff3d1f";
  pixelRect(t.x + 10, t.y + 25, 10, 8);
  pixelRect(t.x + 33, t.y + 25, 10, 8);
  ctx.fillStyle = "#151515";
  for (let x = t.x + 10; x < t.x + 72; x += 18) pixelRect(x, t.y + 39, 10, 8);
}

function drawBoss(e) {
  const x = e.x;
  const y = e.y;
  ctx.fillStyle = "#202a3b";
  pixelRect(x + 8, y + 20, 28, 32);
  ctx.fillStyle = "#e0ad86";
  pixelRect(x + 8, y, 27, 22);
  ctx.fillStyle = "#2c2017";
  pixelRect(x + 6, y - 4, 31, 7);
  ctx.fillStyle = "#7d1010";
  pixelRect(x + 17, y + 22, 8, 27);
  ctx.fillStyle = "#20152d";
  pixelRect(x + 13, y + 9, 5, 5);
  pixelRect(x + 25, y + 9, 5, 5);
  pixelRect(x + 12, y + 17, 18, 4);
  ctx.fillStyle = "#dbe8ec";
  pixelRect(x - 9, y + 14, 14, 16);
  pixelRect(x + 39, y + 14, 14, 16);
  ctx.fillStyle = "#ff3d1f";
  pixelRect(x + 12, y + 9, 3, 3);
  pixelRect(x + 25, y + 9, 3, 3);
}

function drawMiniBoss(e) {
  const x = e.x;
  const y = e.y;
  ctx.fillStyle = "#24314a";
  pixelRect(x + 7, y + 18, 22, 28);
  ctx.fillStyle = "#ffd0a6";
  pixelRect(x + 8, y + 1, 20, 18);
  ctx.fillStyle = "#24170f";
  pixelRect(x + 6, y - 3, 24, 6);
  ctx.fillStyle = "#b71f1f";
  pixelRect(x + 15, y + 18, 6, 24);
  ctx.fillStyle = "#1d1731";
  pixelRect(x + 12, y + 8, 3, 3);
  pixelRect(x + 21, y + 8, 3, 3);
  pixelRect(x + 12, y + 15, 12, 3);
  ctx.fillStyle = "#dbe8ec";
  pixelRect(x - 6, y + 12, 9, 12);
  pixelRect(x + 33, y + 12, 9, 12);
  ctx.fillStyle = "#ff4a4a";
  pixelRect(x + 12, y + 8, 2, 2);
  pixelRect(x + 22, y + 8, 2, 2);
}

function drawGorillaBoss(e) {
  const x = e.x;
  const y = e.y;
  ctx.fillStyle = "#20242f";
  pixelRect(x + 28, y + 52, 170, 168);
  pixelRect(x + 6, y + 92, 52, 128);
  pixelRect(x + 172, y + 70, 52, 150);
  pixelRect(x + 36, y + 204, 46, 42);
  pixelRect(x + 148, y + 204, 46, 42);
  ctx.fillStyle = "#515867";
  pixelRect(x + 56, y + 64, 112, 92);
  pixelRect(x + 78, y + 148, 70, 48);
  ctx.fillStyle = "#2f3440";
  pixelRect(x + 62, y + 16, 104, 72);
  ctx.fillStyle = "#707786";
  pixelRect(x + 86, y + 48, 56, 34);
  ctx.fillStyle = "#d0c4b6";
  pixelRect(x + 95, y + 76, 18, 13);
  pixelRect(x + 123, y + 76, 18, 13);
  ctx.fillStyle = "#ff9b2f";
  pixelRect(x + 96, y + 43, 10, 10);
  pixelRect(x + 130, y + 43, 10, 10);
  ctx.fillStyle = "#150f12";
  pixelRect(x + 86, y + 40, 22, 5);
  pixelRect(x + 128, y + 40, 22, 5);
  pixelRect(x + 97, y + 92, 48, 26);
  ctx.fillStyle = "#f8f3e8";
  pixelRect(x + 98, y + 92, 9, 20);
  pixelRect(x + 135, y + 92, 9, 20);
}

function drawRivalPlayer(e) {
  const x = e.x;
  const y = e.y;
  const scale = e.h / 48;
  ctx.fillStyle = "#0f1321";
  pixelRect(x + 7 * scale, y + 2 * scale, 20 * scale, 7 * scale);
  ctx.fillStyle = "#f7c79f";
  pixelRect(x + 9 * scale, y + 9 * scale, 16 * scale, 14 * scale);
  ctx.fillStyle = "#c22d24";
  pixelRect(x + 4 * scale, y + 24 * scale, 28 * scale, 16 * scale);
  ctx.fillStyle = "#1f4586";
  pixelRect(x + 7 * scale, y + 40 * scale, 9 * scale, 18 * scale);
  pixelRect(x + 19 * scale, y + 40 * scale, 9 * scale, 18 * scale);
  ctx.fillStyle = "#1d1731";
  pixelRect(x + 12 * scale, y + 14 * scale, 2 * scale, 2 * scale);
  pixelRect(x + 19 * scale, y + 14 * scale, 2 * scale, 2 * scale);
  pixelRect(x + 12 * scale, y + 19 * scale, 9 * scale, 2 * scale);
  ctx.fillStyle = "#10192d";
  pixelRect(x + 3 * scale, y + 56 * scale, 12 * scale, 6 * scale);
  pixelRect(x + 19 * scale, y + 56 * scale, 12 * scale, 6 * scale);
  ctx.fillStyle = e.power === "fire" ? "#ff8d42" : e.power === "ice" ? "#9be8ff" : e.power === "laser" ? "#ffe94c" : "#ffd028";
  pixelRect(x + 28 * scale, y + 28 * scale, 8 * scale, 8 * scale);
}

function drawSlimRival(e) {
  const x = e.x;
  const y = e.y;
  ctx.fillStyle = "#171927";
  pixelRect(x + 5, y + 2, 16, 7);
  ctx.fillStyle = "#f0bf91";
  pixelRect(x + 6, y + 9, 14, 14);
  ctx.fillStyle = "#22304f";
  pixelRect(x + 2, y + 24, 22, 17);
  ctx.fillStyle = "#0f182c";
  pixelRect(x + 5, y + 41, 6, 17);
  pixelRect(x + 15, y + 41, 6, 17);
  ctx.fillStyle = "#45d6ff";
  pixelRect(x + 2, y + 27, 5, 8);
  ctx.fillStyle = "#ff8d42";
  pixelRect(x + 20, y + 27, 5, 8);
  ctx.fillStyle = "#1d1731";
  pixelRect(x + 9, y + 14, 2, 2);
  pixelRect(x + 15, y + 14, 2, 2);
  pixelRect(x + 9, y + 19, 8, 2);
  ctx.fillStyle = "#111827";
  pixelRect(x + 3, y + 56, 9, 6);
  pixelRect(x + 14, y + 56, 9, 6);
  ctx.fillStyle = e.power === "fire" ? "#ff8d42" : e.power === "ice" ? "#9be8ff" : "#ffe94c";
  pixelRect(x + (e.dir > 0 ? 23 : -5), y + 30, 8, 8);
}

function drawAllyPlayer(ally) {
  const x = ally.x;
  const y = ally.y;
  ctx.fillStyle = "#ffd0a6";
  pixelRect(x + 8, y, 16, 14);
  ctx.fillStyle = "#111827";
  pixelRect(x + 6, y - 3, 20, 6);
  ctx.fillStyle = ally.shirt;
  pixelRect(x + 4, y + 14, 24, 18);
  ctx.fillStyle = "#1f57a5";
  pixelRect(x + 8, y + 32, 7, 12);
  pixelRect(x + 17, y + 32, 7, 12);
  ctx.fillStyle = ally.accent;
  pixelRect(x + 10, y + 18, 8, 8);
}

function drawBigGrabber(e) {
  const x = e.x;
  const y = e.y;
  ctx.fillStyle = "#f2d8b1";
  pixelRect(x + 16, y + 8, 28, 22);
  pixelRect(x + 11, y + 30, 38, 28);
  ctx.fillStyle = "#56392a";
  pixelRect(x + 14, y + 4, 32, 8);
  ctx.fillStyle = "#efe0ca";
  pixelRect(x + 6, y + 24, 50, 30);
  ctx.fillStyle = "#7e6b52";
  pixelRect(x + 10, y + 52, 42, 20);
  ctx.fillStyle = "#f2d8b1";
  pixelRect(x - 4, y + 28, 18, 18);
  pixelRect(x + 46, y + 28, 18, 18);
  ctx.fillStyle = "#9b2f1f";
  pixelRect(x + 9, y + 70, 16, 8);
  pixelRect(x + 35, y + 70, 16, 8);
  ctx.fillStyle = "#1d1731";
  pixelRect(x + 21, y + 15, 4, 4);
  pixelRect(x + 35, y + 15, 4, 4);
  pixelRect(x + 22, y + 23, 14, 3);
}

function drawEnemyNinja(e) {
  const x = e.x;
  const y = e.y;
  ctx.fillStyle = "#111827";
  pixelRect(x + 5, y + 14, e.w - 10, e.h - 18);
  ctx.fillStyle = "#f7c79f";
  pixelRect(x + 8, y, e.w - 16, 15);
  ctx.fillStyle = e.ability === "float" ? "#7fd0ff" : e.ability === "tiny" ? "#d8a0ff" : e.ability === "oneHeart" ? "#ff5a5a" : "#ffd028";
  pixelRect(x + 8, y + 18, e.w - 16, 5);
  ctx.fillStyle = "#1d1731";
  pixelRect(x + 11, y + 6, 4, 4);
  pixelRect(x + e.w - 16, y + 6, 4, 4);
  pixelRect(x + 11, y + e.h - 6, 8, 6);
  pixelRect(x + e.w - 19, y + e.h - 6, 8, 6);
}

function drawMagicCrystal(crystal) {
  if (crystal.collected) return;
  ctx.fillStyle = "#1d1731";
  triangle(crystal.x + 15, crystal.y - 5, crystal.x + crystal.w + 5, crystal.y + 18, crystal.x + 15, crystal.y + crystal.h + 5);
  triangle(crystal.x + 15, crystal.y - 5, crystal.x - 5, crystal.y + 18, crystal.x + 15, crystal.y + crystal.h + 5);
  ctx.fillStyle = crystal.color;
  triangle(crystal.x + 15, crystal.y, crystal.x + crystal.w, crystal.y + 18, crystal.x + 15, crystal.y + crystal.h);
  triangle(crystal.x + 15, crystal.y, crystal.x, crystal.y + 18, crystal.x + 15, crystal.y + crystal.h);
  ctx.fillStyle = "#ffffff";
  pixelRect(crystal.x + 12, crystal.y + 10, 7, 9);
}

function drawDungeonGuide() {
  const x = 470;
  const y = 348;
  ctx.fillStyle = "#f6c79f";
  pixelRect(x + 8, y, 20, 18);
  ctx.fillStyle = "#6b3b1b";
  pixelRect(x + 5, y - 4, 27, 8);
  ctx.fillStyle = "#1f64c8";
  pixelRect(x + 3, y + 18, 30, 28);
  ctx.fillStyle = "#565c66";
  pixelRect(x + 7, y + 46, 10, 22);
  pixelRect(x + 20, y + 46, 10, 22);
}

function drawDungeonDialogue() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(255, 244, 200, 0.94)";
  pixelRect(86, 58, 788, 112);
  ctx.strokeStyle = "#1d1731";
  ctx.lineWidth = 4;
  ctx.strokeRect(86, 58, 788, 112);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 18px Trebuchet MS";
  ctx.fillText("Guide: I need help getting the three magic power crystals.", 112, 98);
  ctx.fillText(dungeonIntroTimer < 125 ? "Can you help me?" : "You: Okay.", 112, 132);
  if (dungeonFade > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${dungeonFade})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawFarewellDialogue() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(255, 244, 200, 0.95)";
  pixelRect(62, 44, 836, 144);
  ctx.strokeStyle = "#1d1731";
  ctx.lineWidth = 4;
  ctx.strokeRect(62, 44, 836, 144);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 17px Trebuchet MS";
  ctx.fillText("Guide: Well done! I am now giving you a farewell.", 92, 82);
  ctx.fillText("Take these peanut Chews to remember me.", 92, 116);
  ctx.fillText(dungeonIntroTimer < 165 ? "And take the wrapper." : "A new rival is waiting...", 92, 150);

  ctx.fillStyle = "#9b5a24";
  pixelRect(650, 102, 92, 28);
  ctx.fillStyle = "#f0c76a";
  pixelRect(658, 109, 76, 14);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 12px Trebuchet MS";
  ctx.fillText("PEANUT", 666, 121);
  ctx.fillStyle = "#c8d3df";
  pixelRect(760, 98, 70, 36);
  ctx.fillStyle = "#f8f3e8";
  pixelRect(770, 106, 50, 18);
  ctx.fillStyle = "#1d1731";
  ctx.fillText("WRAP", 779, 120);

  if (dungeonFade > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${dungeonFade})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawRescueFriend(friend) {
  const x = friend.x;
  const y = friend.y;
  ctx.fillStyle = "#f5d9c6";
  pixelRect(x + 9, y - 38, 18, 18);
  ctx.fillStyle = "#1e1a1b";
  pixelRect(x + 7, y - 42, 22, 8);
  ctx.fillStyle = "#ffffff";
  pixelRect(x + 4, y - 18, 28, 24);
  ctx.fillStyle = "#f0dd7c";
  pixelRect(x + 12, y - 8, 11, 11);
  ctx.fillStyle = "#6d7179";
  pixelRect(x + 7, y + 6, 10, 20);
  pixelRect(x + 19, y + 6, 10, 20);
  ctx.fillStyle = "#3d4e73";
  pixelRect(x + 8, y - 34, 3, 3);
  pixelRect(x + 23, y - 34, 3, 3);
  pixelRect(x + 12, y - 28, 11, 2);
}

function drawBossBars() {
  const bosses = enemies.filter(e => e.alive && (e.kind === "boss" || e.kind === "gorillaBoss" || e.kind === "rivalPlayer" || e.kind === "slimRival" || e.kind === "challenger"));
  if (bosses.length === 0) return;
  const totalHp = bosses.reduce((sum, boss) => sum + boss.hp, 0);
  const maxHp = bosses.reduce((sum, boss) => sum + boss.maxHp, 0);
  const pct = maxHp ? totalHp / maxHp : 0;
  const label = bosses.some(boss => boss.kind === "challenger")
    ? "CHALLENGERS"
    : bosses.some(boss => boss.kind === "rivalPlayer" || boss.kind === "slimRival")
      ? "RIVAL HEARTS"
    : bosses.some(boss => boss.kind === "gorillaBoss")
      ? "GORILLA BAR"
      : "BOSS BAR";
  ctx.save();
  ctx.fillStyle = "#fff4c8";
  ctx.strokeStyle = "#1d1731";
  ctx.lineWidth = 4;
  ctx.fillRect(210, 18, 540, 38);
  ctx.strokeRect(210, 18, 540, 38);
  ctx.fillStyle = "#7d1010";
  ctx.fillRect(222, 30, 516, 14);
  ctx.fillStyle = "#ff2e42";
  ctx.fillRect(222, 30, Math.max(0, 516 * pct), 14);
  ctx.fillStyle = "#1d1731";
  ctx.font = "700 16px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(`${label} ${totalHp}/${maxHp}`, 480, 51);
  ctx.restore();
}

function drawCaster(e) {
  ctx.fillStyle = "#f2e8df";
  pixelRect(e.x + 7, e.y, 12, 12);
  ctx.fillStyle = "#1a1718";
  pixelRect(e.x + 6, e.y - 2, 14, 4);
  ctx.fillStyle = "#8aa6d4";
  pixelRect(e.x + 3, e.y + 12, 20, 18);
  ctx.fillStyle = "#646464";
  pixelRect(e.x + 6, e.y + 30, 6, 12);
  pixelRect(e.x + 14, e.y + 30, 6, 12);
  ctx.fillStyle = "#1d1731";
  pixelRect(e.x + 10, e.y + 5, 2, 2);
  pixelRect(e.x + 14, e.y + 5, 2, 2);
  pixelRect(e.x + (e.dir > 0 ? 18 : 0), e.y + 16, 8, 4);
}

function drawMummy(e) {
  ctx.fillStyle = "#efefeb";
  pixelRect(e.x + 6, e.y, 14, 14);
  pixelRect(e.x + 4, e.y + 14, 18, 17);
  pixelRect(e.x + 7, e.y + 31, 5, 11);
  pixelRect(e.x + 15, e.y + 31, 5, 11);
  pixelRect(e.x - 1, e.y + 16, 7, 9);
  pixelRect(e.x + 21, e.y + 16, 7, 9);
  ctx.fillStyle = "#cfcfc8";
  pixelRect(e.x + 3, e.y + 6, 20, 3);
  pixelRect(e.x + 2, e.y + 20, 22, 3);
  pixelRect(e.x + 4, e.y + 27, 18, 3);
  ctx.fillStyle = "#1d1731";
  pixelRect(e.x + 10, e.y + 6, 2, 2);
  pixelRect(e.x + 15, e.y + 6, 2, 2);
}

function drawFutureSkeleton(e) {
  ctx.fillStyle = "#d8f4ff";
  pixelRect(e.x + 8, e.y, 14, 12);
  pixelRect(e.x + 6, e.y + 12, 18, 16);
  pixelRect(e.x + 8, e.y + 28, 5, 14);
  pixelRect(e.x + 17, e.y + 28, 5, 14);
  pixelRect(e.x + 1, e.y + 15, 8, 13);
  pixelRect(e.x + 21, e.y + 15, 8, 13);
  ctx.fillStyle = "#71dfff";
  pixelRect(e.x + 7, e.y + 4, 16, 3);
  pixelRect(e.x + 4, e.y + 18, 22, 3);
  ctx.fillStyle = "#7e5cff";
  pixelRect(e.x + (e.vx >= 0 ? 22 : -6), e.y + 16, 12, 4);
}

function drawSkeleton(e) {
  ctx.fillStyle = "#f0eee2";
  pixelRect(e.x + 8, e.y, 16, 15);
  pixelRect(e.x + 5, e.y + 16, 22, 14);
  pixelRect(e.x + 7, e.y + 31, 6, 11);
  pixelRect(e.x + 19, e.y + 31, 6, 11);
  pixelRect(e.x - 1, e.y + 18, 7, 17);
  pixelRect(e.x + 26, e.y + 18, 7, 17);
  ctx.fillStyle = "#1b1b20";
  pixelRect(e.x + 11, e.y + 5, 4, 4);
  pixelRect(e.x + 19, e.y + 5, 4, 4);
  pixelRect(e.x + 14, e.y + 11, 7, 2);
  ctx.fillStyle = "#ff3d1f";
  pixelRect(e.x + 11, e.y + 5, 2, 2);
  pixelRect(e.x + 19, e.y + 5, 2, 2);
  ctx.fillStyle = "#cac7b8";
  pixelRect(e.x + 10, e.y + 20, 12, 3);
  pixelRect(e.x + 10, e.y + 26, 12, 3);
}

function drawBonePile(e) {
  ctx.fillStyle = "#f0eee2";
  for (const bone of e.bones) {
    if (bone.type === "skull") {
      pixelRect(bone.x, bone.y, bone.w, bone.h);
      ctx.fillStyle = "#1b1b20";
      pixelRect(bone.x + 3, bone.y + 3, 2, 2);
      pixelRect(bone.x + 7, bone.y + 3, 2, 2);
      ctx.fillStyle = "#f0eee2";
    } else if (bone.type === "rib") {
      pixelRect(bone.x, bone.y, bone.w, bone.h);
      ctx.fillStyle = "#cac7b8";
      pixelRect(bone.x + 2, bone.y + 2, bone.w - 4, 2);
      ctx.fillStyle = "#f0eee2";
    } else {
      pixelRect(bone.x, bone.y, bone.w, bone.h);
      pixelRect(bone.x - 2, bone.y - 1, 4, bone.h + 2);
      pixelRect(bone.x + bone.w - 2, bone.y - 1, 4, bone.h + 2);
    }
  }

  if (e.reformTimer < 90 && Math.floor(e.reformTimer / 8) % 2 === 0) {
    ctx.fillStyle = "#fff8c8";
    pixelRect(e.startX + 9, e.startY + 8, 4, 4);
    pixelRect(e.startX + 18, e.startY + 8, 4, 4);
  }
}

function drawShot(s) {
  if (s.kind === 'evokerFang') {
    ctx.fillStyle = s.armTime > 0 ? '#b6f2d5' : '#f8f3e8';
    triangle(s.x + 3, s.y + s.h, s.x + 9, s.y, s.x + 15, s.y + s.h);
    triangle(s.x + 15, s.y + s.h, s.x + 21, s.y + 4, s.x + 27, s.y + s.h);
    ctx.fillStyle = '#1d1731';
    pixelRect(s.x + 8, s.y + s.h - 7, 15, 4);
    return;
  }
  if (s.kind === "shuriken" || s.kind === "enemyShuriken") {
    ctx.fillStyle = s.hostile ? "#ff9d3d" : "#dbe8ec";
    triangle(s.x + 9, s.y, s.x + 14, s.y + 9, s.x + 9, s.y + 18);
    triangle(s.x, s.y + 9, s.x + 9, s.y + 4, s.x + 18, s.y + 9);
    ctx.fillStyle = "#1d1731";
    pixelRect(s.x + 7, s.y + 7, 4, 4);
  }
  if (s.kind === "skyFist") {
    ctx.fillStyle = "#f2d8b1";
    pixelRect(s.x + 6, s.y + 10, 40, 34);
    ctx.fillStyle = "#d5af82";
    pixelRect(s.x, s.y + 18, 12, 18);
    pixelRect(s.x + 36, s.y + 18, 12, 18);
    ctx.fillStyle = "#8a5b3b";
    pixelRect(s.x + 10, s.y + 42, 34, 8);
  }
  if (s.kind === "fire") {
    ctx.fillStyle = "#ff3d1f";
    pixelRect(s.x, s.y, 16, 16);
    ctx.fillStyle = "#ffd028";
    pixelRect(s.x + 5, s.y + 4, 7, 9);
  }
  if (s.kind === "ice") {
    ctx.fillStyle = "#9be8ff";
    pixelRect(s.x, s.y, 16, 16);
    ctx.fillStyle = "#e8fbff";
    pixelRect(s.x + 3, s.y + 3, 8, 6);
  }
  if (s.kind === "laser") {
    ctx.fillStyle = "#ffe94c";
    pixelRect(s.x, s.y, 34, 6);
    ctx.fillStyle = "#fff";
    pixelRect(s.x + 6, s.y + 2, 22, 2);
  }
  if (s.kind === "missile") {
    ctx.fillStyle = "#393d43";
    pixelRect(s.x, s.y + 2, 18, 6);
    ctx.fillStyle = "#ff5a1f";
    pixelRect(s.x + 18, s.y + 3, 6, 4);
    ctx.fillStyle = "#cfd5dc";
    pixelRect(s.x + 4, s.y, 6, 2);
  }
  if (s.kind === "enemyFire") {
    ctx.fillStyle = "#ff3d1f";
    pixelRect(s.x, s.y, 16, 16);
    ctx.fillStyle = "#ffd028";
    pixelRect(s.x + 4, s.y + 5, 8, 7);
  }
  if (s.kind === "potion") {
    ctx.fillStyle = s.effect === "slow" ? "#7fd0ff" : "#d8a0ff";
    pixelRect(s.x + 2, s.y + 2, 12, 14);
    ctx.fillStyle = "#fff";
    pixelRect(s.x + 5, s.y, 6, 3);
    ctx.fillStyle = "#1d1731";
    pixelRect(s.x + 4, s.y + 6, 8, 2);
  }
  if (s.kind === "enemyIce") {
    ctx.fillStyle = "#8ddcff";
    pixelRect(s.x, s.y, 16, 16);
    ctx.fillStyle = "#eafcff";
    pixelRect(s.x + 4, s.y + 4, 8, 8);
  }
  if (s.kind === "enemyLaser") {
    ctx.fillStyle = "#7ef7ff";
    pixelRect(s.x, s.y, 34, 6);
    ctx.fillStyle = "#ffffff";
    pixelRect(s.x + 6, s.y + 2, 22, 2);
  }
  if (s.kind === "barrel") {
    ctx.fillStyle = "#815433";
    pixelRect(s.x, s.y, 24, 24);
    ctx.fillStyle = "#4f2e18";
    pixelRect(s.x + 4, s.y + 2, 16, 4);
    pixelRect(s.x + 4, s.y + 18, 16, 4);
    ctx.fillStyle = "#c79552";
    pixelRect(s.x + 8, s.y + 6, 8, 12);
  }
}

function drawPowerup(item) {
  if (item.power === "big") {
    ctx.fillStyle = "#20152d";
    pixelRect(item.x + 2, item.y + 1, 19, 5);
    pixelRect(item.x + 7, item.y + 6, 17, 5);
    pixelRect(item.x + 3, item.y + 11, 14, 5);
    pixelRect(item.x + 8, item.y + 16, 13, 5);
    pixelRect(item.x + 6, item.y + 21, 6, 4);
    ctx.fillStyle = "#ffd028";
    pixelRect(item.x + 5, item.y + 2, 15, 5);
    pixelRect(item.x + 8, item.y + 7, 13, 5);
    pixelRect(item.x + 6, item.y + 12, 9, 5);
    pixelRect(item.x + 10, item.y + 17, 8, 5);
  }
  if (item.power === "fire") {
    ctx.fillStyle = "#ff3d1f";
    pixelRect(item.x + 4, item.y + 4, 18, 20);
    ctx.fillStyle = "#ffd028";
    pixelRect(item.x + 9, item.y + 11, 9, 12);
  }
  if (item.power === "ice") {
    ctx.fillStyle = "#88dfff";
    pixelRect(item.x + 4, item.y + 5, 19, 18);
    ctx.fillStyle = "#e8fbff";
    pixelRect(item.x + 7, item.y + 7, 10, 7);
  }
  if (item.power === "laser") {
    ctx.fillStyle = "#30323a";
    pixelRect(item.x + 4, item.y + 10, 18, 7);
    ctx.fillStyle = "#111";
    pixelRect(item.x + 18, item.y + 8, 8, 6);
    ctx.fillStyle = "#ffe94c";
    pixelRect(item.x + 2, item.y + 11, 4, 4);
  }
}

function drawPlayer() {
  if (player.invincible > 0 && Math.floor(player.invincible / 6) % 2 === 0) return;
  const x = player.x;
  const y = player.y;
  const scale = player.h > 50 ? 1.38 : 1;
  const flip = player.dir < 0 ? -1 : 1;
  ctx.save();
  ctx.translate(x + player.w / 2, y);
  ctx.scale(flip, 1);
  ctx.translate(-player.w / 2, 0);

  if (isNinjaCrystalLevel()) {
    ctx.fillStyle = "#111827";
    pixelRect(4 * scale, player.h - 48 * scale, 24 * scale, 38 * scale);
    ctx.fillStyle = "#f7c79f";
    pixelRect(7 * scale, player.h - 66 * scale, 19 * scale, 17 * scale);
    ctx.fillStyle = "#0b101a";
    pixelRect(5 * scale, player.h - 70 * scale, 23 * scale, 8 * scale);
    ctx.fillStyle = "#7fd0ff";
    pixelRect(7 * scale, player.h - 43 * scale, 22 * scale, 5 * scale);
    ctx.fillStyle = "#1d1731";
    pixelRect(12 * scale, player.h - 59 * scale, 3 * scale, 3 * scale);
    pixelRect(21 * scale, player.h - 59 * scale, 3 * scale, 3 * scale);
    pixelRect(7 * scale, player.h - 10 * scale, 9 * scale, 8 * scale);
    pixelRect(18 * scale, player.h - 10 * scale, 9 * scale, 8 * scale);
    if (player.kickTimer > 0) {
      ctx.fillStyle = "#dbe8ec";
      pixelRect(30 * scale, player.h - 27 * scale, 16 * scale, 5 * scale);
    }
    ctx.restore();
    return;
  }

  if (player.knockedTimer > 0) {
    ctx.fillStyle = "#7a3419";
    pixelRect(2 * scale, player.h - 6, 12 * scale, 6);
    pixelRect(22 * scale, player.h - 6, 12 * scale, 6);
    ctx.fillStyle = "#1f57a5";
    pixelRect(10 * scale, player.h - 10, 20 * scale, 8);
    ctx.fillStyle = "#e52929";
    pixelRect(6 * scale, player.h - 22, 26 * scale, 10);
    ctx.fillStyle = "#ffd0a6";
    pixelRect(24 * scale, player.h - 26, 12 * scale, 10);
    pixelRect(0, player.h - 18, 8 * scale, 6);
    ctx.fillStyle = "#16131c";
    pixelRect(22 * scale, player.h - 30, 15 * scale, 5);
    ctx.restore();
    return;
  }

  if (player.crawling) {
    const crawlScale = player.bigTimer > 0 ? 1.25 : 1;
    ctx.fillStyle = "#7a3419";
    pixelRect(1 * crawlScale, player.h - 8, 12 * crawlScale, 8);
    pixelRect(19 * crawlScale, player.h - 8, 12 * crawlScale, 8);
    ctx.fillStyle = "#1f57a5";
    pixelRect(9 * crawlScale, player.h - 12, 20 * crawlScale, 8);
    ctx.fillStyle = "#e52929";
    pixelRect(6 * crawlScale, player.h - 23, 24 * crawlScale, 13);
    ctx.fillStyle = "#ffd0a6";
    pixelRect(24 * crawlScale, player.h - 27, 13 * crawlScale, 12);
    pixelRect(0, player.h - 19, 8 * crawlScale, 8);
    ctx.fillStyle = "#16131c";
    pixelRect(23 * crawlScale, player.h - 31, 15 * crawlScale, 5);
    pixelRect(31 * crawlScale, player.h - 23, 3 * crawlScale, 3);
    pixelRect(28 * crawlScale, player.h - 17, 7 * crawlScale, 2);
    ctx.fillStyle = "#28c0dc";
    pixelRect(15 * crawlScale, player.h - 17, 4 * crawlScale, 4);
    if (player.kickTimer > 0) {
      ctx.fillStyle = "#ffd0a6";
      pixelRect(33 * crawlScale, player.h - 10, 16 * crawlScale, 6);
    }
    if (gearState.hoverboardOwned && gearState.hoverboardEquipped) {
      ctx.fillStyle = "#7fd0ff";
      pixelRect(6 * crawlScale, player.h - 3, 24 * crawlScale, 4);
      ctx.fillStyle = "#ffe94c";
      pixelRect(9 * crawlScale, player.h + 1, 18 * crawlScale, 2);
    }
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#7a3419";
  pixelRect(1 * scale, player.h - 8, 13 * scale, 8);
  pixelRect(18 * scale, player.h - 8, 13 * scale, 8);
  ctx.fillStyle = "#1f57a5";
  pixelRect(7 * scale, player.h - 29 * scale, 8 * scale, 21 * scale);
  pixelRect(18 * scale, player.h - 29 * scale, 8 * scale, 21 * scale);
  ctx.fillStyle = "#e52929";
  pixelRect(4 * scale, player.h - 48 * scale, 24 * scale, 22 * scale);
  ctx.fillStyle = "#ffd0a6";
  pixelRect(7 * scale, player.h - 66 * scale, 19 * scale, 17 * scale);
  pixelRect(0, player.h - 43 * scale, 6 * scale, 12 * scale);
  pixelRect(27 * scale, player.h - 45 * scale, 6 * scale, 12 * scale);
  ctx.fillStyle = "#16131c";
  pixelRect(5 * scale, player.h - 70 * scale, 23 * scale, 8 * scale);
  pixelRect(2 * scale, player.h - 62 * scale, 6 * scale, 9 * scale);
  ctx.fillStyle = "#16131c";
  pixelRect(12 * scale, player.h - 59 * scale, 3 * scale, 3 * scale);
  pixelRect(21 * scale, player.h - 59 * scale, 3 * scale, 3 * scale);
  pixelRect(15 * scale, player.h - 52 * scale, 8 * scale, 2 * scale);
  ctx.fillStyle = "#28c0dc";
  pixelRect(13 * scale, player.h - 38 * scale, 4 * scale, 5 * scale);
  pixelRect(21 * scale, player.h - 38 * scale, 4 * scale, 5 * scale);

  if (player.kickTimer > 0) {
    ctx.fillStyle = "#ffd0a6";
    pixelRect(30 * scale, player.h - 22 * scale, 18 * scale, 7 * scale);
  }
  if (gearState.hoverboardOwned && gearState.hoverboardEquipped) {
    ctx.fillStyle = "#7fd0ff";
    pixelRect(4 * scale, player.h - 3, 26 * scale, 5 * scale);
    ctx.fillStyle = "#ffe94c";
    pixelRect(8 * scale, player.h + 2, 18 * scale, 2 * scale);
  }
  ctx.restore();
}

function drawParticle(p) {
  ctx.fillStyle = p.color;
  pixelRect(p.x, p.y, 5, 5);
}

function drawWinText() {
  ctx.save();
  ctx.textAlign = "center";
  const text = messageEl.textContent || "YOU WON";
  ctx.font = text.length > 12 ? "700 42px Trebuchet MS" : "700 56px Trebuchet MS";
  ctx.shadowColor = "#ffd028";
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#ffe94c";
  ctx.fillText(text, W / 2, 160);
  ctx.strokeStyle = "#1d1731";
  ctx.lineWidth = 4;
  ctx.strokeText(text, W / 2, 160);
  ctx.restore();
}

function updateHud(message) {
  heartsEl.textContent = "♥ ".repeat(player.hearts).trim();
  const ammo = player.ammo > 0 ? ` x${player.ammo}` : "";
  powerLabel.textContent = `POWER: ${player.power.toUpperCase()}${ammo}`;
  messageEl.textContent = message;
}

function powerColor(power) {
  return { big: "#ffd028", fire: "#ff4b1f", ice: "#9be8ff", laser: "#ffe94c" }[power];
}

function pixelRect(x, y, w, h) {
  const width = Math.max(0, w);
  const height = Math.max(0, h);
  if (width <= 4 || height <= 4) {
    ctx.fillRect(x, y, width, height);
    return;
  }
  roundedRect(x, y, width, height, Math.min(8, width * 0.22, height * 0.22));
  ctx.fill();
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

window.addEventListener("keydown", event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.add(key);
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (screen === "arena" && /^[1-5]$/.test(key)) summonArenaFighter(Number(key));
  if (key === "f") usePower();
  if (key === "k") kick();
  if (key === "e") interactAction();
});

window.addEventListener("keyup", event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

restartBtn.addEventListener("click", resetGame);
skipLevelBtn.addEventListener("click", skipLevel);
mainMenuBtn.addEventListener("click", showMainMenu);
storyModeBtn.addEventListener("click", resetGame);
miniGamesBtn.addEventListener("click", showMiniGamesMenu);
movingMayhemBtn.addEventListener("click", startMovingMayhem);
fogapocoBtn.addEventListener("click", startFogapoco);
timeTwistBtn.addEventListener("click", startTimeTwist);
nightNinjasBtn.addEventListener("click", startNightNinjas);
meInvadersBtn.addEventListener("click", () => enemyPickerEl.classList.toggle("hidden"));
enemyPickerEl.querySelectorAll("[data-enemy]").forEach(button => {
  button.addEventListener("click", () => startMeInvaders(button.dataset.enemy));
});
survivalModeBtn.addEventListener("click", startSurvival);
tankyTownBtn.addEventListener("click", startTankyTown);
arenaModeBtn.addEventListener("click", startArena);
builderModeBtn.addEventListener("click", openBuilder);
backToMainMenuBtn.addEventListener("click", showMainMenu);
playCustomBtn.addEventListener("click", playCustomCourse);
moveOnBtn.addEventListener("click", () => {
  storyParadeUnlocked = false;
  screen = "story";
  showGameUi();
  loadLevel(10, "PLAYER PARADE RUN!");
});
canvas.addEventListener("click", handleBuilderClick);
canvas.addEventListener("click", handleArenaClick);
builderToolsEl.querySelectorAll("[data-tool]").forEach(button => {
  button.addEventListener("click", () => setActiveTool(button.dataset.tool));
});
arenaToolsEl.querySelectorAll("[data-arena]").forEach(button => {
  button.addEventListener("click", () => setActiveArenaTool(button.dataset.arena));
});
arenaFightBtn.addEventListener("click", beginArenaFight);

showMainMenu();
update();





