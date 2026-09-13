const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const biomeEl = document.getElementById("biome");
const levelEl = document.getElementById("level");
const powerEl = document.getElementById("power");
const bullsEl = document.getElementById("bulls");
const viewEl = document.getElementById("view");
const bestEl = document.getElementById("best");
const restartButton = document.getElementById("restart");
const menu = document.getElementById("menu");
const playButton = document.getElementById("play");
const menuButton = document.getElementById("main-menu");
const clearLeaderboardButton = document.getElementById("clear-leaderboard");
const leaderboardEl = document.getElementById("leaderboard");
const gameShell = document.querySelector(".game-shell");

const leaderboardKey = "minedaft-leaderboard";
const keys = new Set();
const finishX = 842;
const maxLevels = 50;
const tile = 24;

const player = {
  x: 92,
  y: 288,
  size: 28,
  speed: 150,
  invincible: 0,
  power: "None",
  powerTimer: 0,
  moving: false,
  facing: 1,
  runTime: 0
};

const biomes = [
  { name: "Grassland", sky: "#82cfff", grass: "#6fbd48", darkGrass: "#4f9b35", flower: "#fff56e", trunk: "#7a4a26", leaves: "#238b3a" },
  { name: "Sunny Desert", sky: "#f4c36b", grass: "#d9b45d", darkGrass: "#bd9442", flower: "#ffffff", trunk: "#936236", leaves: "#6fa33c" },
  { name: "Snow Field", sky: "#bde6ff", grass: "#dbefff", darkGrass: "#a9d2e5", flower: "#6bc5ff", trunk: "#6c4b3a", leaves: "#dff7ff" },
  { name: "Mushroom Moor", sky: "#b68aff", grass: "#62a66a", darkGrass: "#3f7f4d", flower: "#ff7ab9", trunk: "#76513a", leaves: "#b8325d" }
];

let biomeIndex = 0;
let crossings = 0;
let trees = [];
let bulls = [];
let blocks = [];
let particles = [];
let message = "Reach the finish line!";
let messageTimer = 2.5;
let gameOver = false;
let victory = false;
let pointerTarget = null;
let lastTime = 0;
let animationId = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function angleDifference(target, current) {
  return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function currentLevel() {
  return Math.min(crossings + 1, maxLevels);
}

function readLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(leaderboardKey)) || [];
  } catch {
    return [];
  }
}

function saveScore() {
  if (crossings <= 0) return;
  const entry = { crossings, date: new Date().toLocaleDateString() };
  const scores = readLeaderboard()
    .concat(entry)
    .sort((a, b) => b.crossings - a.crossings)
    .slice(0, 50);
  localStorage.setItem(leaderboardKey, JSON.stringify(scores));
  renderLeaderboard();
}

function renderLeaderboard() {
  const scores = readLeaderboard();
  bestEl.textContent = String(Math.max(scores[0]?.crossings || 0, crossings));
  leaderboardEl.innerHTML = scores.length
    ? scores.map((score) => `<li><strong>${score.crossings}</strong> levels <span>${score.date}</span></li>`).join("")
    : "<li>No levels yet</li>";
}

function makeTree(x, y, scale = 1) {
  return { x, y, width: 34 * scale, height: 72 * scale, scale, fallen: false, fall: 0, direction: Math.random() < 0.5 ? -1 : 1 };
}

function makeBull(x, y) {
  return {
    x,
    y,
    angle: Math.random() * Math.PI * 2,
    width: 44,
    height: 30,
    speed: (randomBetween(92, 122) + Math.min(crossings, maxLevels - 1) * 4.5) * 0.5,
    turnSpeed: randomBetween(1.45, 2.05),
    wobble: Math.random() * Math.PI * 2,
    facing: 1,
    charging: false,
    chargePulse: 0
  };
}

function makeBlock(x, y) {
  return { x, y, width: 32, height: 32, bob: Math.random() * Math.PI * 2, taken: false };
}

function scatterWorld() {
  const level = currentLevel();
  const bullCount = Math.min(1 + level, 50);
  const treeCount = Math.min(9 + level, 64);
  const blockCount = Math.min(3 + Math.floor(level / 6), 11);

  trees = [];
  bulls = [];
  blocks = [];
  particles = [];

  for (let i = 0; i < treeCount; i += 1) {
    const x = randomBetween(150, 760);
    const y = randomBetween(105, 448);
    if (Math.abs(x - finishX) > 70 && Math.hypot(x - player.x, y - player.y) > 120) {
      trees.push(makeTree(x, y, randomBetween(0.82, 1.16)));
    }
  }

  for (let i = 0; i < bullCount; i += 1) {
    bulls.push(makeBull(randomBetween(520, 780), randomBetween(115, 432)));
  }

  for (let i = 0; i < blockCount; i += 1) {
    blocks.push(makeBlock(randomBetween(220, 700), randomBetween(112, 410)));
  }
}

function resetRun() {
  biomeIndex = 0;
  crossings = 0;
  player.x = 92;
  player.y = 288;
  player.invincible = 1.2;
  player.power = "None";
  player.powerTimer = 0;
  message = "Reach the finish line!";
  messageTimer = 2.5;
  gameOver = false;
  victory = false;
  pointerTarget = null;
  scatterWorld();
  updateHud();
}

function startGame() {
  menu.classList.add("hidden");
  gameShell.classList.remove("menu-open");
  cancelAnimationFrame(animationId);
  resetRun();
  lastTime = performance.now();
  animationId = requestAnimationFrame(loop);
}

function showMainMenu() {
  cancelAnimationFrame(animationId);
  animationId = 0;
  gameOver = true;
  gameShell.classList.add("menu-open");
  menu.classList.remove("hidden");
  renderLeaderboard();
}

function playerRect() {
  return { x: player.x - player.size / 2, y: player.y - player.size / 2, width: player.size, height: player.size };
}

function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({ x, y, vx: randomBetween(-90, 90), vy: randomBetween(-90, 90), size: randomBetween(4, 8), life: randomBetween(0.28, 0.62), color });
  }
}

function activateBlock(block) {
  block.taken = true;
  if (Math.random() < 0.5) {
    player.power = "Fly";
    player.powerTimer = 7;
    message = "Fly power!";
    addParticles(block.x + 16, block.y + 16, "#ffffff", 18);
  } else {
    player.power = "Speedy";
    player.powerTimer = 7;
    message = "Speedy power!";
    addParticles(block.x + 16, block.y + 16, "#ffe15c", 18);
  }
  messageTimer = 1.8;
}

function crossFinish() {
  crossings += 1;
  if (crossings >= maxLevels) {
    winGame();
    return;
  }

  biomeIndex = (biomeIndex + 1) % biomes.length;
  player.x = 92;
  player.y = 288;
  player.invincible = 1.4;
  player.power = "None";
  player.powerTimer = 0;
  message = `Level ${currentLevel()}: ${biomes[biomeIndex].name}!`;
  messageTimer = 2.2;
  scatterWorld();
  renderLeaderboard();
}

function winGame() {
  gameOver = true;
  victory = true;
  player.power = "None";
  player.powerTimer = 0;
  saveScore();
  message = "You beat all 50 levels!";
  messageTimer = 999;
}

function loseToBull() {
  if (player.invincible > 0 || player.power === "Fly") return;
  gameOver = true;
  saveScore();
  message = "A bull caught you!";
  messageTimer = 999;
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys.has("ArrowLeft") || keys.has("KeyA")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) dx += 1;
  if (keys.has("ArrowUp") || keys.has("KeyW")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("KeyS")) dy += 1;
  if (pointerTarget) {
    const pointerDx = pointerTarget.x - player.x;
    const pointerDy = pointerTarget.y - player.y;
    if (Math.abs(pointerDx) > 12) dx += Math.sign(pointerDx);
    if (Math.abs(pointerDy) > 12) dy += Math.sign(pointerDy);
  }

  const length = Math.hypot(dx, dy) || 1;
  const boost = player.power === "Speedy" ? 1.85 : 1;
  const flyBoost = player.power === "Fly" ? 1.22 : 1;
  const speed = player.speed * boost * flyBoost;
  player.moving = Math.hypot(dx, dy) > 0.05;
  if (Math.abs(dx) > 0.05) player.facing = Math.sign(dx);
  if (player.moving) player.runTime += dt * speed * 0.085;

  player.x = clamp(player.x + (dx / length) * speed * dt, 28, canvas.width - 28);
  player.y = clamp(player.y + (dy / length) * speed * dt, 72, canvas.height - 34);

  if (player.x > finishX + 22) crossFinish();

  player.invincible = Math.max(0, player.invincible - dt);
  if (player.powerTimer > 0) {
    player.powerTimer -= dt;
    if (player.powerTimer <= 0) player.power = "None";
  }
}

function updateTrees(dt) {
  const p = playerRect();
  for (const tree of trees) {
    const trunk = { x: tree.x - 10 * tree.scale, y: tree.y + 10 * tree.scale, width: 20 * tree.scale, height: 52 * tree.scale };
    if (!tree.fallen && rectsOverlap(p, trunk)) {
      tree.fallen = true;
      tree.direction = player.x < tree.x ? 1 : -1;
      message = "Timber!";
      messageTimer = 0.9;
      addParticles(tree.x, tree.y + 36, "#7a4a26", 10);
    }
    if (tree.fallen) tree.fall = clamp(tree.fall + dt * 2.6, 0, 1);
  }
}

function updateBulls(dt) {
  const p = playerRect();
  for (const bull of bulls) {
    const targetAngle = Math.atan2(player.y - bull.y, player.x - bull.x);
    const turn = clamp(angleDifference(targetAngle, bull.angle), -bull.turnSpeed * dt, bull.turnSpeed * dt);
    const distanceToPlayer = Math.hypot(player.x - bull.x, player.y - bull.y);
    const facingTarget = player.x >= bull.x ? 1 : -1;
    bull.facing = facingTarget;
    bull.charging = distanceToPlayer < 220;
    bull.chargePulse = Math.max(0, bull.chargePulse - dt);
    if (bull.charging && bull.chargePulse <= 0) {
      bull.chargePulse = 0.45;
      addParticles(bull.x + bull.facing * 24, bull.y + 12, "#d6c0a8", 2);
    }
    bull.angle += turn;
    const chargeBoost = bull.charging ? 1.55 : 1;
    bull.x += Math.cos(bull.angle) * bull.speed * chargeBoost * dt;
    bull.y += Math.sin(bull.angle) * bull.speed * chargeBoost * dt;
    bull.wobble += dt * (bull.charging ? 18 : 10);

    const b = { x: bull.x - bull.width / 2, y: bull.y - bull.height / 2, width: bull.width, height: bull.height };
    if (rectsOverlap(p, b)) loseToBull();
  }
}

function updateBlocks(dt) {
  const p = playerRect();
  for (const block of blocks) {
    block.bob += dt * 4;
    const box = { x: block.x, y: block.y + Math.sin(block.bob) * 4, width: block.width, height: block.height };
    if (!block.taken && rectsOverlap(p, box)) activateBlock(block);
  }
  blocks = blocks.filter((block) => !block.taken);
}

function updateParticles(dt) {
  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.life -= dt;
  }
  particles = particles.filter((particle) => particle.life > 0);
}

function updateHud() {
  biomeEl.textContent = biomes[biomeIndex].name;
  levelEl.textContent = `${currentLevel()}/${maxLevels}`;
  powerEl.textContent = player.power === "None" ? "None" : `${player.power} ${Math.ceil(player.powerTimer)}s`;
  bullsEl.textContent = String(bulls.length);
  viewEl.textContent = "Map";
  bestEl.textContent = String(Math.max(readLeaderboard()[0]?.crossings || 0, crossings));
}

function update(dt) {
  if (gameOver) return;
  updatePlayer(dt);
  updateTrees(dt);
  updateBulls(dt);
  updateBlocks(dt);
  updateParticles(dt);
  messageTimer = Math.max(0, messageTimer - dt);
  updateHud();
}

function drawPixelRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawBackground() {
  const biome = biomes[biomeIndex];
  drawPixelRect(0, 0, canvas.width, canvas.height, biome.sky);
  drawPixelRect(0, 68, canvas.width, 36, "rgba(255, 255, 255, 0.25)");
  drawPixelRect(0, 104, canvas.width, canvas.height - 104, biome.grass);

  for (let y = 112; y < canvas.height; y += tile) {
    for (let x = (y / tile) % 2 ? 0 : tile / 2; x < canvas.width; x += tile) {
      drawPixelRect(x, y, 6, 6, biome.darkGrass);
    }
  }

  for (let i = 0; i < 38; i += 1) {
    const x = (i * 83 + biomeIndex * 29) % canvas.width;
    const y = 132 + ((i * 47) % 366);
    drawPixelRect(x, y, 5, 5, biome.flower);
  }
}

function drawFinishLine() {
  for (let y = 104; y < canvas.height; y += 28) {
    const whiteFirst = Math.floor(y / 28) % 2 === 0;
    drawPixelRect(finishX, y, 34, 14, whiteFirst ? "#ffffff" : "#111111");
    drawPixelRect(finishX, y + 14, 34, 14, whiteFirst ? "#111111" : "#ffffff");
  }
  drawPixelRect(finishX - 5, 104, 5, canvas.height - 104, "#111111");
  drawPixelRect(finishX + 34, 104, 5, canvas.height - 104, "#111111");
}

function drawTree(tree) {
  const biome = biomes[biomeIndex];
  ctx.save();
  ctx.translate(tree.x, tree.y + 58 * tree.scale);
  ctx.rotate(tree.direction * tree.fall * Math.PI * 0.47);
  ctx.translate(-tree.x, -(tree.y + 58 * tree.scale));
  drawPixelRect(tree.x - 9 * tree.scale, tree.y + 20 * tree.scale, 18 * tree.scale, 48 * tree.scale, biome.trunk);
  drawPixelRect(tree.x - 27 * tree.scale, tree.y, 54 * tree.scale, 28 * tree.scale, biome.leaves);
  drawPixelRect(tree.x - 20 * tree.scale, tree.y - 18 * tree.scale, 40 * tree.scale, 26 * tree.scale, biome.leaves);
  drawPixelRect(tree.x - 35 * tree.scale, tree.y + 18 * tree.scale, 70 * tree.scale, 24 * tree.scale, biome.leaves);
  drawPixelRect(tree.x + 8 * tree.scale, tree.y + 8 * tree.scale, 10 * tree.scale, 10 * tree.scale, "rgba(255,255,255,0.14)");
  ctx.restore();
}

function drawBlock(block) {
  const y = block.y + Math.sin(block.bob) * 4;
  drawPixelRect(block.x, y, 32, 32, "#ffd824");
  drawPixelRect(block.x + 4, y + 4, 24, 24, "#ffef62");
  drawPixelRect(block.x + 8, y + 8, 16, 16, "#ffffff");
  ctx.fillStyle = "#6b5100";
  ctx.font = "900 24px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", block.x + 16, y + 17);
}

function drawBull(bull) {
  const bob = Math.sin(bull.wobble) * (bull.charging ? 4 : 2);
  const stride = Math.floor(bull.wobble) % 2 ? 4 : -4;
  const hornTilt = bull.charging ? 5 : 0;
  const dir = bull.facing || 1;
  const x = bull.x;
  const y = bull.y + bob;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(dir, 1);
  drawPixelRect(-25, -13, 50, 25, "#b96524");
  drawPixelRect(-20, -17, 34, 12, "#e07a20");
  drawPixelRect(-25, 7, 46, 9, "#8e421f");
  drawPixelRect(-48, -17, 25, 27, "#b96524");
  drawPixelRect(-44, -25, 18, 10, "#e07a20");
  drawPixelRect(-45, 7, 24, 12, "#efe7d2");
  drawPixelRect(-41, -3, 4, 10, "#171313");
  drawPixelRect(-28, -3, 4, 10, "#171313");
  drawPixelRect(-56, -24 + hornTilt, 12, 7, "#e9e2c8");
  drawPixelRect(-38, -27 + hornTilt, 11, 7, "#e9e2c8");
  drawPixelRect(20, -4, 20, 6, "#241716");
  drawPixelRect(38, 2, 6, 16, "#241716");
  drawPixelRect(-16 + stride, 13, 7, 18, "#23160f");
  drawPixelRect(7 - stride, 13, 7, 18, "#23160f");
  drawPixelRect(-16 + stride, 28, 9, 5, "#837f76");
  drawPixelRect(7 - stride, 28, 9, 5, "#837f76");
  if (bull.charging) {
    drawPixelRect(-57, 12, 14, 4, "#ffffff");
    drawPixelRect(-62, 19, 10, 4, "#ffe15c");
  }
  ctx.restore();
}

function drawPlayer() {
  const x = player.x - player.size / 2;
  const y = player.y - player.size / 2;
  const blink = player.invincible > 0 && Math.floor(player.invincible * 18) % 2 === 0;
  if (blink) return;

  if (player.power === "Fly") {
    drawPixelRect(x - 10, y + 8, 10, 18, "#ffffff");
    drawPixelRect(x + player.size, y + 8, 10, 18, "#ffffff");
  }
  const frame = Math.floor(player.runTime) % 2;
  const armSwing = player.moving ? (frame ? 3 : -3) : 0;
  const legSwing = player.moving ? (frame ? 4 : -4) : 0;
  ctx.save();
  ctx.translate(Math.round(player.x), Math.round(player.y));
  ctx.scale(player.facing || 1, 1);
  drawPixelRect(-13, -6, 26, 22, "#df2525");
  drawPixelRect(-9, -20, 18, 18, "#f0b282");
  drawPixelRect(-12, -28, 22, 10, "#7b321d");
  drawPixelRect(-7, -14, 4, 5, "#111111");
  drawPixelRect(6, -14, 4, 5, "#111111");
  drawPixelRect(-2, -7, 7, 3, "#111111");
  drawPixelRect(-19, -3 - armSwing, 7, 17, "#f0b282");
  drawPixelRect(13, -2 + armSwing, 7, 16, "#f0b282");
  drawPixelRect(-10 + legSwing, 16, 8, 17, "#164b82");
  drawPixelRect(3 - legSwing, 16, 8, 17, "#164b82");
  drawPixelRect(-13 + legSwing, 30, 13, 5, "#202a3a");
  drawPixelRect(1 - legSwing, 30, 13, 5, "#202a3a");
  ctx.restore();
  if (player.power === "Speedy") {
    drawPixelRect(x - 17, y + 8, 12, 5, "#ffffff");
    drawPixelRect(x - 25, y + 18, 18, 5, "#ffe15c");
  }
}

function drawParticles() {
  for (const particle of particles) {
    drawPixelRect(particle.x, particle.y, particle.size, particle.size, particle.color);
  }
}

function drawMessage() {
  if (messageTimer <= 0 && !gameOver) return;
  drawPixelRect(245, 18, 470, 48, "rgba(12, 20, 12, 0.78)");
  ctx.fillStyle = "#fff7b8";
  ctx.font = "900 22px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, canvas.width / 2, 42);
}

function drawGameOver() {
  if (!gameOver) return;
  drawPixelRect(0, 0, canvas.width, canvas.height, "rgba(0, 0, 0, 0.55)");
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(victory ? "YOU WON!" : "BULL GOT YOU", canvas.width / 2, 220);
  ctx.font = "900 24px monospace";
  ctx.fillText(`${crossings} of ${maxLevels} levels complete`, canvas.width / 2, 268);
  ctx.fillText("Press Space or click to restart", canvas.width / 2, 312);
}

function draw() {
  ctx.imageSmoothingEnabled = false;
  drawBackground();
  drawFinishLine();

  const sorted = [...trees, ...blocks, ...bulls, { player: true, y: player.y }]
    .sort((a, b) => {
      const ay = a.player ? player.y : a.y + (a.height || 0);
      const by = b.player ? player.y : b.y + (b.height || 0);
      return ay - by;
    });

  for (const thing of sorted) {
    if (thing.player) drawPlayer();
    else if ("fall" in thing) drawTree(thing);
    else if ("bob" in thing && "taken" in thing) drawBlock(thing);
    else drawBull(thing);
  }

  drawParticles();
  drawMessage();
  drawGameOver();
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  update(dt);
  draw();
  animationId = requestAnimationFrame(loop);
}

function handleKeyDown(event) {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  if (event.code === "Space" && (gameShell.classList.contains("menu-open") || gameOver)) {
    startGame();
    return;
  }
  keys.add(event.code);
  if (event.code === "Enter" && (gameShell.classList.contains("menu-open") || gameOver)) startGame();
}

function handleKeyUp(event) {
  keys.delete(event.code);
}

function pointerToCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height };
}

function handlePointerDown(event) {
  if (gameOver || gameShell.classList.contains("menu-open")) {
    startGame();
    return;
  }
  pointerTarget = pointerToCanvas(event);
}

function handlePointerMove(event) {
  if (pointerTarget) pointerTarget = pointerToCanvas(event);
}

function handlePointerUp() {
  pointerTarget = null;
}

playButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
menuButton.addEventListener("click", showMainMenu);
clearLeaderboardButton.addEventListener("click", () => {
  localStorage.removeItem(leaderboardKey);
  renderLeaderboard();
  updateHud();
});
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointerleave", handlePointerUp);
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

renderLeaderboard();
resetRun();
draw();
