const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const bearSpeedEl = document.querySelector("#bearSpeed");
const bearHealthEl = document.querySelector("#bearHealth");
const leftButton = document.querySelector("#leftButton");
const jumpButton = document.querySelector("#jumpButton");
const duckButton = document.querySelector("#duckButton");
const rightButton = document.querySelector("#rightButton");
const restartButton = document.querySelector("#restartButton");
const skinButtons = document.querySelectorAll(".skin-button");

const groundY = 420;
const bestKey = "forest-bear-runner-best";

const player = {
  x: 250,
  y: groundY,
  width: 42,
  height: 84,
  vy: 0,
  move: 0,
  runSpeed: 6.8,
  ducking: false,
  grounded: true
};

const skins = [
  { hair: "#e6c83c", hairDark: "#d8b52d", shirt: "#2f6070", shirtDark: "#244957", pants: "#161d20", shoes: "#7aa6bd", skin: "#f0c891", eyes: "#275b70" },
  { hair: "#304f9b", hairDark: "#1f356f", shirt: "#386fd0", shirtDark: "#244d9e", pants: "#8c3f2f", shoes: "#e7d8c2", skin: "#f1bd82", eyes: "#1b2f52" },
  { hair: "#6a3d25", hairDark: "#3a2417", shirt: "#cf5a33", shirtDark: "#9c3723", pants: "#27333a", shoes: "#d8dddf", skin: "#d19a68", eyes: "#1e2930" },
  { hair: "#4f6c28", hairDark: "#30451d", shirt: "#56a05a", shirtDark: "#357143", pants: "#51382f", shoes: "#ddd0b0", skin: "#e0ad78", eyes: "#193521" },
  { hair: "#2d2740", hairDark: "#171529", shirt: "#b73b48", shirtDark: "#7e2530", pants: "#202029", shoes: "#8fc3d1", skin: "#c88563", eyes: "#111a23" }
];

let activeSkin = 0;

const bear = {
  x: -220,
  width: 132,
  speed: 2.4,
  health: 100,
  maxHealth: 100
};

let obstacles = [];
let cages = [];
let rocks = [];
let bikers = [];
let bullets = [];
let grenades = [];
let explosions = [];
let particles = [];
let distance = 0;
let best = Number(localStorage.getItem(bestKey) || 0);
let speed = 5.4;
let spawnTimer = 0;
let cageTimer = 190;
let rockTimer = 80;
let bikerTimer = 120;
let grenadeCooldown = 0;
let running = true;
let caughtByBear = false;
let trappedByCage = false;
let bearDefeated = false;
let tripped = false;
let shotByBiker = false;
let hitByRock = false;
let biome = "forest";
let lastTime = performance.now();

ctx.imageSmoothingEnabled = false;
bestEl.textContent = `${best} m`;

function resetGame() {
  obstacles = [];
  cages = [];
  rocks = [];
  bikers = [];
  bullets = [];
  grenades = [];
  explosions = [];
  particles = [];
  distance = 0;
  speed = 5.4;
  bear.x = -220;
  bear.speed = 2.4;
  bear.health = bear.maxHealth;
  spawnTimer = 80;
  cageTimer = 190;
  rockTimer = 80;
  bikerTimer = 120;
  grenadeCooldown = 0;
  running = true;
  caughtByBear = false;
  trappedByCage = false;
  bearDefeated = false;
  tripped = false;
  shotByBiker = false;
  hitByRock = false;
  biome = "forest";
  player.y = groundY;
  player.x = 250;
  player.vy = 0;
  player.move = 0;
  player.ducking = false;
  player.grounded = true;
  lastTime = performance.now();
  bearHealthEl.textContent = `${bear.health}`;
}

function jump() {
  if (!running) {
    resetGame();
    return;
  }

  if (player.grounded) {
    player.vy = -17;
    player.grounded = false;
    player.ducking = false;
  }
}

function setDuck(active) {
  player.ducking = active && player.grounded && running;
}

function spawnObstacle() {
  const type = Math.random() > 0.58 ? "log" : "branch";
  obstacles.push({
    type,
    x: canvas.width + 40,
    y: type === "log" ? groundY - 30 : groundY - 118,
    width: type === "log" ? 74 : 58,
    height: type === "log" ? 30 : 30,
    dodged: false
  });
}

function spawnCage() {
  const targetOffset = Math.random() * 190 - 95;
  cages.push({
    x: Math.max(90, Math.min(canvas.width - 130, player.x + targetOffset)),
    y: -150,
    width: 96,
    height: 132,
    vy: 3.2 + Math.random() * 1.1,
    landed: false
  });
}

function spawnRock() {
  rocks.push({
    x: Math.max(70, Math.min(canvas.width - 80, player.x + Math.random() * 240 - 120)),
    y: -48,
    width: 34 + Math.random() * 18,
    height: 30 + Math.random() * 12,
    vy: 4.2 + Math.random() * 1.6
  });
}

function spawnBiker() {
  bikers.push({
    x: canvas.width + 40,
    y: groundY - 44,
    width: 92,
    height: 44,
    speed: 4.6 + Math.random() * 1.5,
    shootTimer: 28 + Math.random() * 36
  });
}

function shootBullet(biker) {
  bullets.push({
    x: biker.x + 4,
    y: biker.y + 13,
    width: 18,
    height: 6,
    speed: 8.4 + Math.random() * 1.8
  });
}

function throwGrenade() {
  if (!running || !bearDefeated || grenadeCooldown > 0) {
    return;
  }

  grenades.push({
    x: player.x + 50,
    y: player.y - 66,
    width: 12,
    height: 12,
    vx: 8.2,
    vy: -8.5,
    fuse: 72
  });
  grenadeCooldown = 36;
}

function explodeGrenade(grenade) {
  explosions.push({
    x: grenade.x - 36,
    y: grenade.y - 36,
    width: 88,
    height: 72,
    life: 18
  });
}

function hitbox() {
  const height = player.ducking ? 50 : player.height;
  const y = player.y - height;
  return {
    x: player.x + 9,
    y: y + 8,
    width: player.width - 18,
    height: height - 10
  };
}

function overlaps(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

function px(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawPixelPine(x, ground, scale, palette) {
  const trunkWidth = 8 * scale;
  px(x - trunkWidth / 2, ground - 62 * scale, trunkWidth, 62 * scale, palette.trunk);
  px(x - 10 * scale, ground - 34 * scale, 20 * scale, 8 * scale, palette.barkLight);

  for (let tier = 0; tier < 5; tier += 1) {
    const y = ground - (54 + tier * 24) * scale;
    const width = (72 - tier * 10) * scale;
    const height = 22 * scale;
    px(x - width / 2, y, width, height, palette.dark);
    px(x - width / 2 + 10 * scale, y - 10 * scale, width - 20 * scale, height, palette.mid);
    px(x + width / 2 - 24 * scale, y - 6 * scale, 14 * scale, 10 * scale, palette.light);
  }
}

function drawPixelBroadTree(x, ground, scale) {
  px(x - 15 * scale, ground - 150 * scale, 30 * scale, 150 * scale, "#7d4a31");
  px(x + 5 * scale, ground - 142 * scale, 10 * scale, 126 * scale, "#c07b54");
  px(x - 45 * scale, ground - 205 * scale, 90 * scale, 32 * scale, "#173f2a");
  px(x - 66 * scale, ground - 183 * scale, 128 * scale, 38 * scale, "#27683c");
  px(x - 52 * scale, ground - 224 * scale, 116 * scale, 32 * scale, "#4d963b");
  px(x - 25 * scale, ground - 238 * scale, 72 * scale, 20 * scale, "#9ed34e");
  px(x + 26 * scale, ground - 202 * scale, 30 * scale, 16 * scale, "#b8e764");
  px(x - 58 * scale, ground - 150 * scale, 10 * scale, 30 * scale, "#1d2a30");
}

function drawForest() {
  if (biome === "desert") {
    drawDesert();
    return;
  }

  px(0, 0, canvas.width, canvas.height, "#d8f5ef");
  px(0, 78, canvas.width, 84, "#9dd3d1");
  px(0, 160, canvas.width, 112, "#4d8791");
  px(0, 262, canvas.width, groundY - 262, "#183646");

  const farPalette = { dark: "#173348", mid: "#244e5e", light: "#7aa7a8", trunk: "#1e2c31", barkLight: "#35545c" };
  const midPalette = { dark: "#0f2f28", mid: "#1c5c3e", light: "#80ba56", trunk: "#34251e", barkLight: "#6b4633" };
  const nearPalette = { dark: "#103622", mid: "#27683c", light: "#a5dc48", trunk: "#5b3428", barkLight: "#c67a59" };

  for (let x = -80 - (distance * 0.18) % 120; x < canvas.width + 130; x += 118) {
    drawPixelPine(x, 326, 0.8, farPalette);
  }

  for (let x = -120 - (distance * 0.38) % 150; x < canvas.width + 160; x += 150) {
    drawPixelPine(x, 390, 1.05, midPalette);
  }

  for (let x = -190 - (distance * 0.68) % 265; x < canvas.width + 280; x += 265) {
    drawPixelBroadTree(x, groundY + 3, 1);
    drawPixelPine(x + 135, groundY + 1, 0.92, nearPalette);
  }

  px(0, groundY, canvas.width, canvas.height - groundY, "#172116");
  px(0, groundY, canvas.width, 14, "#5fa63e");
  px(0, groundY + 14, canvas.width, 8, "#2f6f2a");
  px(0, groundY + 22, canvas.width, 16, "#111711");

  for (let x = -20 - (distance * 1.3) % 32; x < canvas.width + 40; x += 32) {
    px(x, groundY - 10, 8, 10, "#9ed34e");
    px(x + 8, groundY - 15, 8, 15, "#b8e764");
    px(x + 17, groundY - 8, 10, 8, "#5fa63e");
  }
}

function drawCactus(x, y, scale) {
  const dark = "#17331f";
  const mid = "#235d33";
  const light = "#519a42";
  px(x, y - 70 * scale, 15 * scale, 70 * scale, dark);
  px(x + 4 * scale, y - 66 * scale, 7 * scale, 62 * scale, mid);
  px(x + 11 * scale, y - 52 * scale, 22 * scale, 9 * scale, dark);
  px(x + 26 * scale, y - 69 * scale, 10 * scale, 26 * scale, dark);
  px(x - 20 * scale, y - 42 * scale, 24 * scale, 9 * scale, dark);
  px(x - 24 * scale, y - 56 * scale, 10 * scale, 23 * scale, dark);
  px(x + 6 * scale, y - 64 * scale, 3 * scale, 54 * scale, light);
}

function drawDesert() {
  px(0, 0, canvas.width, canvas.height, "#ffc24a");
  px(0, 94, canvas.width, 84, "#f59b35");
  px(0, 178, canvas.width, 128, "#d96f2d");
  px(0, 306, canvas.width, groundY - 306, "#8f3f2f");

  px(82, 118, 72, 16, "#ffd37a");
  px(210, 58, 98, 10, "#ffe19c");
  px(620, 72, 104, 12, "#ffe19c");
  px(778, 128, 64, 9, "#ffd37a");

  px(70, 225, 120, 70, "#a94c35");
  px(94, 185, 58, 40, "#c75f36");
  px(120, 155, 28, 30, "#de7a3b");
  px(342, 210, 150, 85, "#a94c35");
  px(392, 160, 58, 50, "#c75f36");
  px(420, 126, 30, 34, "#de7a3b");
  px(680, 225, 148, 70, "#8f3f2f");
  px(708, 178, 70, 47, "#b75233");

  px(0, groundY - 42, canvas.width, 42, "#ab4a2d");
  px(0, groundY - 24, canvas.width, 24, "#d8682f");
  px(0, groundY, canvas.width, canvas.height - groundY, "#4f261e");
  px(0, groundY, canvas.width, 12, "#ef8b37");

  for (let x = -70 - (distance * 0.75) % 210; x < canvas.width + 210; x += 210) {
    drawCactus(x, groundY, 1.1);
    drawCactus(x + 98, groundY - 4, 0.68);
  }

  for (let x = -30 - (distance * 1.25) % 34; x < canvas.width + 50; x += 34) {
    px(x, groundY - 8, 18, 8, "#5f2b20");
    px(x + 17, groundY - 5, 9, 5, "#8f3f2f");
  }
}

function drawPlayer() {
  const height = player.ducking ? 50 : player.height;
  const y = player.y - height;
  const step = Math.sin(distance * 0.22) > 0 ? 1 : -1;
  const skin = skins[activeSkin];

  if (tripped) {
    const fallX = player.x - 18;
    const fallY = groundY - 62;
    px(fallX + 6, fallY + 38, 18, 13, skin.hair);
    px(fallX + 20, fallY + 34, 22, 18, skin.skin);
    px(fallX + 28, fallY + 40, 5, 5, skin.eyes);
    px(fallX + 35, fallY + 48, 12, 5, "#102126");
    px(fallX + 42, fallY + 24, 60, 22, skin.shirt);
    px(fallX + 48, fallY + 36, 50, 12, skin.shirtDark);
    px(fallX + 94, fallY + 13, 15, 42, skin.pants);
    px(fallX + 104, fallY + 8, 18, 8, skin.shoes);
    px(fallX + 62, fallY + 18, 12, 44, skin.pants);
    px(fallX + 50, fallY + 8, 10, 38, skin.pants);
    px(fallX + 42, fallY + 4, 18, 8, skin.shoes);
    px(fallX + 38, fallY + 23, 28, 8, skin.skin);
    px(fallX + 84, fallY + 47, 24, 8, skin.skin);
    px(fallX + 54, fallY - 17, 4, 18, "#e7b98a");
    px(fallX + 72, fallY - 18, 4, 18, "#e7b98a");
    px(fallX + 90, fallY - 17, 4, 18, "#e7b98a");
    return;
  }

  px(player.x + 13, y + 3, 31, 11, skin.hair);
  px(player.x + 6, y + 12, 42, 12, skin.hair);
  px(player.x + 36, y + 21, 12, 16, skin.hairDark);
  px(player.x + 12, y + 23, 32, 31, skin.skin);
  px(player.x + 7, y + 36, 10, 12, skin.skin);
  px(player.x + 40, y + 33, 8, 13, skin.skin);
  px(player.x + 21, y + 33, 5, 12, skin.eyes);
  px(player.x + 35, y + 33, 5, 12, skin.eyes);
  if (trappedByCage) {
    px(player.x + 20, y + 51, 6, 5, "#102126");
    px(player.x + 34, y + 51, 6, 5, "#102126");
    px(player.x + 26, y + 57, 10, 5, "#102126");
  } else {
    px(player.x + 18, y + 55, 22, 9, "#102126");
  }

  px(player.x + 8, y + 64, 42, player.ducking ? 18 : 36, skin.shirt);
  px(player.x + 8, y + 64, 10, 12, skin.shirtDark);
  px(player.x + 40, y + 64, 10, 34, skin.shirtDark);
  px(player.x + 3, y + 70, 11, 35, skin.skin);
  px(player.x + 47, y + 70, 11, 32, skin.skin);

  px(player.x + 14, y + height - 26, 13, 26, skin.pants);
  px(player.x + 34, y + height - 26, 13, 26, skin.pants);
  px(player.x + 14 - step * 5, y + height - 8, 18, 8, skin.shoes);
  px(player.x + 34 + step * 5, y + height - 8, 18, 8, skin.shoes);
  px(player.x + 10 - step * 5, y + height - 2, 24, 5, "#d8dddf");
  px(player.x + 32 + step * 5, y + height - 2, 24, 5, "#d8dddf");
}

function drawCage(cage) {
  const x = cage.x;
  const y = cage.y;
  const bottom = y + cage.height;

  px(x + 40, y, 16, 10, "#1a2230");
  px(x + 44, y + 8, 8, 18, "#1a2230");
  px(x + 30, y + 22, 36, 7, "#6b3d22");
  px(x + 34, y + 16, 28, 7, "#c58b55");
  px(x + 12, bottom - 15, 72, 13, "#6b3d22");
  px(x + 6, bottom - 6, 84, 9, "#3a2417");

  px(x + 13, y + 62, 5, bottom - y - 70, "#17202b");
  px(x + 78, y + 62, 5, bottom - y - 70, "#17202b");
  px(x + 19, y + 50, 5, 20, "#17202b");
  px(x + 72, y + 50, 5, 20, "#17202b");
  px(x + 25, y + 39, 5, 15, "#17202b");
  px(x + 66, y + 39, 5, 15, "#17202b");
  px(x + 34, y + 31, 5, 12, "#17202b");
  px(x + 57, y + 31, 5, 12, "#17202b");
  px(x + 44, y + 27, 8, bottom - y - 38, "#17202b");

  for (let bar = 0; bar < 5; bar += 1) {
    const barX = x + 22 + bar * 12;
    px(barX, y + 61, 4, bottom - y - 69, "#243145");
  }

  px(x + 19, y + 56, 58, 5, "#243145");
  px(x + 25, y + 42, 46, 5, "#243145");
  px(x + 34, y + 32, 28, 5, "#243145");
  px(x + 49, bottom - 60, 8, 24, "#c58b55");
}

function drawBear() {
  const x = bear.x;
  const y = groundY - 116;
  const step = Math.sin(distance * 0.22) > 0 ? 1 : -1;

  px(x + 18, y + 30, 72, 12, "#3a2417");
  px(x + 6, y + 42, 96, 14, "#3a2417");
  px(x - 4, y + 56, 116, 18, "#3a2417");
  px(x - 14, y + 74, 132, 28, "#3a2417");
  px(x - 10, y + 102, 124, 18, "#3a2417");

  px(x + 22, y + 34, 62, 14, "#c49a6c");
  px(x + 12, y + 48, 88, 18, "#d6b07a");
  px(x, y + 66, 108, 34, "#c49a6c");
  px(x + 2, y + 100, 102, 14, "#c49a6c");
  px(x + 8, y + 78, 26, 28, "#b38358");
  px(x + 35, y + 62, 46, 14, "#efd8b0");
  px(x + 53, y + 76, 28, 38, "#efd8b0");

  px(x + 72, y + 20, 48, 20, "#3a2417");
  px(x + 82, y + 6, 18, 18, "#3a2417");
  px(x + 108, y + 6, 18, 18, "#3a2417");
  px(x + 76, y + 26, 52, 54, "#d6b07a");
  px(x + 84, y + 12, 11, 11, "#c49a6c");
  px(x + 113, y + 13, 9, 10, "#c49a6c");
  px(x + 86, y + 39, 7, 9, "#14100d");
  px(x + 110, y + 39, 7, 9, "#14100d");
  px(x + 100, y + 52, 22, 14, "#5b3524");
  px(x + 107, y + 63, 8, 16, "#3a2417");
  px(x + 91, y + 78, 34, 7, "#5b3524");

  px(x + 41, y + 72, 13, 46, "#efd8b0");
  px(x + 52, y + 82, 11, 36, "#3a2417");
  px(x + 58, y + 88, 12, 30, "#c49a6c");
  px(x + 78, y + 84, 13, 34, "#7e563c");
  px(x + 92, y + 86, 11, 32, "#3a2417");

  px(x + 24 + step * 3, y + 108, 28, 11, "#7e563c");
  px(x + 12 + step * 3, groundY - 7, 44, 8, "#5b3524");
  px(x + 78 - step * 2, groundY - 7, 28, 8, "#5b3524");
  px(x + bear.width - 3, groundY - 118, 5, 118, "rgba(233, 89, 63, 0.18)");
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    if (obstacle.type === "log") {
      px(obstacle.x, obstacle.y, obstacle.width, obstacle.height, "#6b3d22");
      px(obstacle.x + 7, obstacle.y + 6, 12, 18, "#b37a45");
      px(obstacle.x + 24, obstacle.y + 8, obstacle.width - 30, 6, "#9c6437");
      px(obstacle.x + 24, obstacle.y + 21, obstacle.width - 34, 5, "#2a1812");
    } else {
      px(obstacle.x, obstacle.y + 16, obstacle.width, 8, "#3a2417");
      px(obstacle.x + 24, obstacle.y - 16, 8, 38, "#3a2417");
      px(obstacle.x + 34, obstacle.y - 16, 18, 7, "#5b3428");
    }
  });
}

function drawRock(rock) {
  const x = rock.x;
  const y = rock.y;
  px(x + 6, y, rock.width - 12, 8, "#7b5d4a");
  px(x, y + 8, rock.width, rock.height - 14, "#5d4639");
  px(x + 8, y + 15, rock.width - 14, rock.height - 16, "#8b6a55");
  px(x + rock.width - 12, y + 11, 8, rock.height - 18, "#3f3029");
  px(x + 6, y + rock.height - 8, rock.width - 14, 8, "#3f3029");
}

function drawRocks() {
  rocks.forEach(drawRock);
}

function drawCages() {
  cages.forEach(drawCage);
}

function drawBiker(biker) {
  const x = biker.x;
  const y = biker.y;
  const wheel = Math.sin(distance * 0.35) > 0 ? "#11161a" : "#243145";

  px(x + 9, y + 28, 18, 18, wheel);
  px(x + 64, y + 28, 18, 18, wheel);
  px(x + 14, y + 33, 8, 8, "#d8dddf");
  px(x + 69, y + 33, 8, 8, "#d8dddf");
  px(x + 24, y + 28, 42, 8, "#b23a2c");
  px(x + 38, y + 19, 30, 8, "#ef8b37");
  px(x + 66, y + 17, 20, 5, "#1a2230");

  px(x + 39, y + 2, 20, 17, "#f0c891");
  px(x + 35, y - 2, 27, 7, "#1f356f");
  px(x + 42, y + 21, 18, 17, "#244d9e");
  px(x + 30, y + 23, 20, 6, "#f0c891");
  px(x + 18, y + 22, 18, 5, "#2a1812");
}

function drawBullet(bullet) {
  px(bullet.x, bullet.y, bullet.width, bullet.height, "#ffe16a");
  px(bullet.x + bullet.width - 4, bullet.y + 1, 8, 4, "#ff8c24");
}

function drawGrenade(grenade) {
  px(grenade.x + 2, grenade.y, 8, 4, "#26312a");
  px(grenade.x, grenade.y + 4, 12, 8, "#3d6b36");
  px(grenade.x + 7, grenade.y + 5, 3, 5, "#8fc46a");
}

function drawExplosion(explosion) {
  const x = explosion.x;
  const y = explosion.y;
  px(x + 22, y + 18, 44, 30, "#ffdd57");
  px(x + 12, y + 26, 64, 20, "#ff8c24");
  px(x + 32, y + 6, 22, 52, "#fff0a0");
  px(x + 4, y + 34, 20, 14, "#d64223");
  px(x + 66, y + 28, 18, 18, "#d64223");
  px(x + 28, y + 52, 34, 10, "#7a241b");
}

function drawBikers() {
  bikers.forEach(drawBiker);
  bullets.forEach(drawBullet);
  grenades.forEach(drawGrenade);
  explosions.forEach(drawExplosion);
}

function drawBearHealthBar() {
  const width = 170;
  const fill = Math.max(0, bear.health / bear.maxHealth) * (width - 8);
  px(18, 18, width, 20, "#2a1812");
  px(22, 22, width - 8, 12, "#682219");
  px(22, 22, fill, 12, "#e9593f");
  if (bear.health > 0) {
    px(22 + fill, 22, 4, 12, "#f8ce64");
  }
}

function drawOverlay(message, submessage) {
  ctx.fillStyle = "rgba(7, 13, 8, 0.62)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8ce64";
  ctx.textAlign = "center";
  ctx.font = "900 54px system-ui";
  ctx.fillText(message, canvas.width / 2, 220);
  ctx.fillStyle = "#f7f3e7";
  ctx.font = "700 24px system-ui";
  ctx.fillText(submessage, canvas.width / 2, 264);
  ctx.textAlign = "left";
}

function update(delta) {
  if (!running) {
    return;
  }

  const frameScale = delta / 16.67;
  distance += speed * frameScale * 0.18;
  speed += 0.0034 * frameScale;
  grenadeCooldown = Math.max(0, grenadeCooldown - frameScale);
  if (!bearDefeated) {
    bear.speed += 0.0022 * frameScale;
    const chaseGap = player.x - (bear.x + bear.width);
    const chaseBoost = Math.max(0, Math.min(1.8, chaseGap / 190));
    bear.x += (bear.speed + chaseBoost - speed * 0.48) * frameScale;

    if (player.move < 0) {
      bear.x += 0.18 * frameScale;
    }

    if (player.move > 0) {
      bear.x -= 0.1 * frameScale;
    }

    bear.x = Math.max(-240, bear.x);
  }

  player.x += player.move * player.runSpeed * frameScale;
  player.x = Math.max(160, Math.min(canvas.width - 145, player.x));

  player.vy += 0.86 * frameScale;
  player.y += player.vy * frameScale;
  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.grounded = true;
  }

  spawnTimer -= frameScale;
  cageTimer -= frameScale;
  rockTimer -= frameScale;
  if (!bearDefeated && spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = Math.max(45, 102 - speed * 5) + Math.random() * 36;
  }

  if (!bearDefeated && cageTimer <= 0) {
    spawnCage();
    cageTimer = Math.max(88, 185 - distance * 0.12) + Math.random() * 90;
  }

  if (bearDefeated && rockTimer <= 0) {
    spawnRock();
    rockTimer = Math.max(42, 110 - distance * 0.04) + Math.random() * 70;
  }

  obstacles.forEach((obstacle) => {
    obstacle.x -= speed * frameScale;
    if (!bearDefeated && !obstacle.dodged && obstacle.x + obstacle.width < player.x) {
      obstacle.dodged = true;
      bear.health = Math.max(0, bear.health - (obstacle.type === "log" ? 25 : 18));
      bear.x -= obstacle.type === "log" ? 28 : 20;
      if (bear.health === 0) {
        bearDefeated = true;
        biome = "desert";
        obstacles = [];
        cages = [];
        rocks = [];
        bikers = [];
        bullets = [];
        grenades = [];
        explosions = [];
        spawnTimer = 95;
        cageTimer = 240;
        rockTimer = 45;
        bikerTimer = 70;
      }
    }
  });
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -20);

  cages.forEach((cage) => {
    if (!cage.landed) {
      cage.y += cage.vy * frameScale;
      cage.vy += 0.08 * frameScale;
      if (cage.y + cage.height >= groundY + 8) {
        cage.y = groundY + 8 - cage.height;
        cage.landed = true;
      }
    }
  });
  cages = cages.filter((cage) => !cage.landed && cage.y < canvas.height + 20);

  rocks.forEach((rock) => {
    rock.y += rock.vy * frameScale;
    rock.vy += 0.12 * frameScale;
  });
  rocks = rocks.filter((rock) => rock.y < groundY + 20);

  if (bearDefeated) {
    bikerTimer -= frameScale;
    if (bikerTimer <= 0) {
      spawnBiker();
      bikerTimer = Math.max(72, 150 - distance * 0.08) + Math.random() * 80;
    }
  }

  bikers.forEach((biker) => {
    biker.x -= biker.speed * frameScale;
    biker.shootTimer -= frameScale;
    if (biker.shootTimer <= 0 && biker.x > player.x + 45) {
      shootBullet(biker);
      biker.shootTimer = 44 + Math.random() * 52;
    }
  });
  bikers = bikers.filter((biker) => biker.x + biker.width > -80);

  bullets.forEach((bullet) => {
    bullet.x -= bullet.speed * frameScale;
  });
  bullets = bullets.filter((bullet) => bullet.x + bullet.width > -30);

  grenades.forEach((grenade) => {
    grenade.x += grenade.vx * frameScale;
    grenade.y += grenade.vy * frameScale;
    grenade.vy += 0.42 * frameScale;
    grenade.fuse -= frameScale;
    if (grenade.y + grenade.height >= groundY - 2 || grenade.fuse <= 0) {
      grenade.exploded = true;
      explodeGrenade(grenade);
    }
  });
  grenades = grenades.filter((grenade) => !grenade.exploded && grenade.x < canvas.width + 40);

  explosions.forEach((explosion) => {
    explosion.life -= frameScale;
  });
  explosions = explosions.filter((explosion) => explosion.life > 0);

  explosions.forEach((explosion) => {
    bikers.forEach((biker) => {
      if (!biker.destroyed && overlaps(explosion, biker)) {
        biker.destroyed = true;
      }
    });
    bullets = bullets.filter((bullet) => !overlaps(explosion, bullet));
  });
  bikers = bikers.filter((biker) => !biker.destroyed);

  const playerBox = hitbox();
  if (obstacles.some((obstacle) => overlaps(playerBox, obstacle))) {
    tripped = true;
    running = false;
  }

  if (rocks.some((rock) => overlaps(playerBox, rock))) {
    hitByRock = true;
    running = false;
  }

  if (!bearDefeated) {
    const trappingCage = cages.find((cage) => overlaps(playerBox, cage));
    if (trappingCage) {
      trappingCage.x = player.x - 21;
      trappingCage.y = groundY + 3 - trappingCage.height;
      trappingCage.landed = true;
      trappedByCage = true;
      running = false;
    }
  }

  if (!bearDefeated && bear.x + bear.width >= playerBox.x + 8) {
    caughtByBear = true;
    running = false;
  }

  if (bullets.some((bullet) => overlaps(playerBox, bullet))) {
    shotByBiker = true;
    running = false;
  }

  const roundedDistance = Math.floor(distance);
  if (roundedDistance > best) {
    best = roundedDistance;
    localStorage.setItem(bestKey, String(best));
  }

  scoreEl.textContent = `${roundedDistance} m`;
  bestEl.textContent = `${best} m`;
  bearSpeedEl.textContent = `${(bear.speed / 2.4).toFixed(1)}x`;
  bearHealthEl.textContent = `${bear.health}`;
}

function render() {
  drawForest();
  if (!bearDefeated) {
    drawBear();
  }
  drawPlayer();
  drawObstacles();
  drawCages();
  drawRocks();
  drawBikers();
  drawBearHealthBar();

  if (!running) {
    let message = "You tripped";
    if (caughtByBear) {
      message = "The bear caught you";
    }
    if (trappedByCage) {
      message = "Caged";
    }
    if (bearDefeated) {
      message = "Desert danger";
    }
    if (shotByBiker) {
      message = "Shot by biker";
    }
    if (hitByRock) {
      message = "Rock hit you";
    }
    drawOverlay(message, "Dodge sticks and logs to damage the bear. Press Space or tap Jump to run again");
  }
}

function loop(now) {
  const delta = Math.min(40, now - lastTime);
  lastTime = now;
  update(delta);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "ControlLeft" || event.code === "ControlRight") {
    event.preventDefault();
    throwGrenade();
  }

  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    event.preventDefault();
    player.move = -1;
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    event.preventDefault();
    player.move = 1;
  }

  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    jump();
  }

  if (event.code === "ArrowDown") {
    event.preventDefault();
    setDuck(true);
  }
});

window.addEventListener("keyup", (event) => {
  if ((event.code === "ArrowLeft" || event.code === "KeyA") && player.move < 0) {
    player.move = 0;
  }

  if ((event.code === "ArrowRight" || event.code === "KeyD") && player.move > 0) {
    player.move = 0;
  }

  if (event.code === "ArrowDown") {
    setDuck(false);
  }
});

function holdMove(direction) {
  if (running) {
    player.move = direction;
  }
}

function stopMove(direction) {
  if (player.move === direction) {
    player.move = 0;
  }
}

jumpButton.addEventListener("click", jump);
restartButton.addEventListener("click", resetGame);
leftButton.addEventListener("pointerdown", () => holdMove(-1));
leftButton.addEventListener("pointerup", () => stopMove(-1));
leftButton.addEventListener("pointerleave", () => stopMove(-1));
rightButton.addEventListener("pointerdown", () => holdMove(1));
rightButton.addEventListener("pointerup", () => stopMove(1));
rightButton.addEventListener("pointerleave", () => stopMove(1));
duckButton.addEventListener("pointerdown", () => setDuck(true));
duckButton.addEventListener("pointerup", () => setDuck(false));
duckButton.addEventListener("pointerleave", () => setDuck(false));
skinButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeSkin = Number(button.dataset.skin);
    skinButtons.forEach((skinButton) => skinButton.classList.toggle("active", skinButton === button));
  });
});

resetGame();
requestAnimationFrame(loop);
