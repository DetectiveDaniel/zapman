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
const horizonY = 190;
const cameraProjection = 520;
const groundProjection = 17000;
const perspectives = ["first", "second", "third"];
const perspectiveLabels = { first: "First", second: "Second", third: "Third" };

const player = {
  x: 92,
  y: 288,
  angle: 0,
  size: 28,
  speed: 150,
  turnSpeed: 2.45,
  invincible: 0,
  power: "None",
  powerTimer: 0
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
let perspectiveIndex = 0;
let pointerTarget = null;
let message = "Reach the finish line!";
let messageTimer = 2.5;
let gameOver = false;
let victory = false;
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

function currentPerspective() {
  return perspectives[perspectiveIndex];
}

function cyclePerspective() {
  perspectiveIndex = (perspectiveIndex + 1) % perspectives.length;
  message = `${perspectiveLabels[currentPerspective()]} person`;
  messageTimer = 1.15;
  updateHud();
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
    .slice(0, 5);
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
    wobble: Math.random() * Math.PI * 2
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
  perspectiveIndex = 0;
  player.x = 92;
  player.y = 288;
  player.angle = 0;
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
  player.angle = 0;
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
  let forward = 0;
  let strafe = 0;
  let turn = 0;

  if (keys.has("KeyW") || keys.has("ArrowUp")) forward += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) forward -= 1;
  if (keys.has("KeyA")) strafe -= 1;
  if (keys.has("KeyD")) strafe += 1;
  if (keys.has("ArrowLeft")) turn -= 1;
  if (keys.has("ArrowRight")) turn += 1;
  if (pointerTarget) {
    const offset = (pointerTarget.x - canvas.width / 2) / (canvas.width / 2);
    turn += clamp(offset, -1, 1) * 0.8;
    forward += pointerTarget.y < canvas.height * 0.82 ? 1 : -0.35;
  }

  player.angle += turn * player.turnSpeed * dt;
  const length = Math.hypot(forward, strafe) || 1;
  const boost = player.power === "Speedy" ? 1.85 : 1;
  const flyBoost = player.power === "Fly" ? 1.22 : 1;
  const speed = player.speed * boost * flyBoost;
  const facingX = Math.cos(player.angle);
  const facingY = Math.sin(player.angle);
  const rightX = -Math.sin(player.angle);
  const rightY = Math.cos(player.angle);
  const dx = ((facingX * forward) + (rightX * strafe)) / length;
  const dy = ((facingY * forward) + (rightY * strafe)) / length;

  player.x = clamp(player.x + dx * speed * dt, 28, canvas.width - 28);
  player.y = clamp(player.y + dy * speed * dt, 72, canvas.height - 34);

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
    bull.angle += turn;
    bull.x += Math.cos(bull.angle) * bull.speed * dt;
    bull.y += Math.sin(bull.angle) * bull.speed * dt;
    bull.wobble += dt * 10;

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
  viewEl.textContent = perspectiveLabels[currentPerspective()];
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

function getCamera() {
  const facingX = Math.cos(player.angle);
  const facingY = Math.sin(player.angle);
  const mode = currentPerspective();

  if (mode === "third") {
    return { x: clamp(player.x - facingX * 105, 28, canvas.width - 28), y: clamp(player.y - facingY * 105, 72, canvas.height - 34), angle: player.angle, mode };
  }
  if (mode === "second") {
    return { x: clamp(player.x + facingX * 150, 28, canvas.width - 28), y: clamp(player.y + facingY * 150, 72, canvas.height - 34), angle: player.angle + Math.PI, mode };
  }
  return { x: player.x, y: player.y, angle: player.angle, mode };
}

function worldToView(x, y, camera = getCamera()) {
  const dx = x - camera.x;
  const dy = y - camera.y;
  return {
    depth: Math.cos(camera.angle) * dx + Math.sin(camera.angle) * dy,
    side: -Math.sin(camera.angle) * dx + Math.cos(camera.angle) * dy
  };
}

function projectWorld(x, y, camera = getCamera()) {
  const view = worldToView(x, y, camera);
  if (view.depth <= 18) return null;
  const scale = cameraProjection / view.depth;
  return { x: canvas.width / 2 + view.side * scale, y: horizonY + groundProjection / view.depth, scale, depth: view.depth, side: view.side };
}

function drawBackground() {
  const biome = biomes[biomeIndex];
  drawPixelRect(0, 0, canvas.width, horizonY, biome.sky);
  drawPixelRect(0, horizonY - 24, canvas.width, 24, "rgba(255, 255, 255, 0.22)");
  drawPixelRect(0, horizonY, canvas.width, canvas.height - horizonY, biome.grass);

  for (let row = 0; row < 18; row += 1) {
    const y = horizonY + row * row * 1.8 + 8;
    const gap = 28 + row * 10;
    ctx.strokeStyle = row % 2 ? "rgba(22, 90, 32, 0.22)" : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    for (let x = (row * 17) % gap; x < canvas.width; x += gap) {
      drawPixelRect(x, y + 12, 5 + row * 0.25, 5 + row * 0.25, biome.darkGrass);
    }
  }

  ctx.strokeStyle = "rgba(19, 88, 31, 0.28)";
  ctx.lineWidth = 2;
  for (let i = -8; i <= 8; i += 1) {
    const start = canvas.width / 2 + i * 42;
    ctx.beginPath();
    ctx.moveTo(start, horizonY);
    ctx.lineTo(canvas.width / 2 + i * 145, canvas.height);
    ctx.stroke();
  }
}

function drawFinishLine(camera) {
  for (let y = 96; y < canvas.height - 28; y += 28) {
    for (let x = finishX; x < finishX + 40; x += 20) {
      const p1 = projectWorld(x, y, camera);
      const p2 = projectWorld(x + 20, y, camera);
      const p3 = projectWorld(x + 20, y + 28, camera);
      const p4 = projectWorld(x, y + 28, camera);
      if (!p1 || !p2 || !p3 || !p4) continue;
      ctx.fillStyle = ((Math.floor((y - 96) / 28) + Math.floor((x - finishX) / 20)) % 2) === 0 ? "#ffffff" : "#101010";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawTree(tree, projected) {
  const biome = biomes[biomeIndex];
  const s = projected.scale * tree.scale;
  const baseX = projected.x;
  const baseY = projected.y;
  const trunkW = 16 * s;
  const trunkH = 60 * s;
  const leafW = 70 * s;
  const leafH = 36 * s;

  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(tree.direction * tree.fall * Math.PI * 0.5);
  ctx.translate(-baseX, -baseY);
  drawPixelRect(baseX - trunkW / 2, baseY - trunkH, trunkW, trunkH, biome.trunk);
  drawPixelRect(baseX - leafW / 2, baseY - trunkH - leafH * 0.85, leafW, leafH, biome.leaves);
  drawPixelRect(baseX - leafW * 0.35, baseY - trunkH - leafH * 1.55, leafW * 0.7, leafH, biome.leaves);
  drawPixelRect(baseX - leafW * 0.62, baseY - trunkH - leafH * 0.22, leafW * 1.24, leafH * 0.75, biome.leaves);
  drawPixelRect(baseX + leafW * 0.08, baseY - trunkH - leafH, Math.max(2, 9 * s), Math.max(2, 9 * s), "rgba(255,255,255,0.16)");
  ctx.restore();
}

function drawBlock(block, projected) {
  const size = clamp(34 * projected.scale, 12, 105);
  const y = projected.y - size * 1.15 + Math.sin(block.bob) * projected.scale * 4;
  const x = projected.x - size / 2;
  drawPixelRect(x, y, size, size, "#ffd824");
  drawPixelRect(x + size * 0.12, y + size * 0.12, size * 0.76, size * 0.76, "#ffef62");
  drawPixelRect(x + size * 0.28, y + size * 0.24, size * 0.44, size * 0.48, "#ffffff");
  ctx.fillStyle = "#6b5100";
  ctx.font = `900 ${Math.max(14, size * 0.72)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", projected.x, y + size * 0.54);
}

function drawBull(bull, projected) {
  const s = projected.scale;
  const bob = Math.sin(bull.wobble) * 2 * s;
  const bodyW = clamp(72 * s, 18, 190);
  const bodyH = clamp(44 * s, 12, 116);
  const x = projected.x - bodyW / 2;
  const y = projected.y - bodyH + bob;
  drawPixelRect(x + bodyW * 0.12, y + bodyH * 0.28, bodyW * 0.72, bodyH * 0.58, "#5b3422");
  drawPixelRect(x, y + bodyH * 0.1, bodyW * 0.34, bodyH * 0.48, "#6d412a");
  drawPixelRect(x - bodyW * 0.12, y + bodyH * 0.02, bodyW * 0.18, bodyH * 0.16, "#e9e2c8");
  drawPixelRect(x + bodyW * 0.23, y - bodyH * 0.02, bodyW * 0.18, bodyH * 0.16, "#e9e2c8");
  drawPixelRect(x + bodyW * 0.12, y + bodyH * 0.28, Math.max(2, bodyW * 0.08), Math.max(2, bodyH * 0.1), "#ffef62");
  drawPixelRect(x + bodyW * 0.26, y + bodyH * 0.8, bodyW * 0.12, bodyH * 0.38, "#23160f");
  drawPixelRect(x + bodyW * 0.62, y + bodyH * 0.8, bodyW * 0.12, bodyH * 0.38, "#23160f");
  drawPixelRect(x + bodyW * 0.82, y + bodyH * 0.42, bodyW * 0.18, bodyH * 0.12, "#3b2116");
}

function drawParticles(camera) {
  for (const particle of particles) {
    const projected = projectWorld(particle.x, particle.y, camera);
    if (!projected) continue;
    const size = clamp(particle.size * projected.scale, 2, 18);
    drawPixelRect(projected.x, projected.y - size * 2, size, size, particle.color);
  }
}

function drawPerspectivePlayer(projected, mode) {
  if (!projected) return;
  const s = projected.scale;
  const bodyW = clamp(42 * s, 18, 120);
  const bodyH = clamp(64 * s, 28, 180);
  const x = projected.x - bodyW / 2;
  const y = projected.y - bodyH;
  const face = mode === "second";

  if (player.power === "Fly") {
    drawPixelRect(x - bodyW * 0.55, y + bodyH * 0.25, bodyW * 0.45, bodyH * 0.28, "#ffffff");
    drawPixelRect(x + bodyW * 1.1, y + bodyH * 0.25, bodyW * 0.45, bodyH * 0.28, "#ffffff");
  }
  drawPixelRect(x + bodyW * 0.18, y + bodyH * 0.34, bodyW * 0.64, bodyH * 0.44, "#2f6dd1");
  drawPixelRect(x + bodyW * 0.22, y + bodyH * 0.08, bodyW * 0.56, bodyH * 0.3, "#d6a072");
  drawPixelRect(x + bodyW * 0.17, y, bodyW * 0.66, bodyH * 0.16, "#3a281e");
  drawPixelRect(x + bodyW * 0.18, y + bodyH * 0.76, bodyW * 0.2, bodyH * 0.26, "#22345f");
  drawPixelRect(x + bodyW * 0.62, y + bodyH * 0.76, bodyW * 0.2, bodyH * 0.26, "#22345f");
  if (face) {
    drawPixelRect(x + bodyW * 0.34, y + bodyH * 0.22, Math.max(2, bodyW * 0.08), Math.max(2, bodyH * 0.06), "#111111");
    drawPixelRect(x + bodyW * 0.58, y + bodyH * 0.22, Math.max(2, bodyW * 0.08), Math.max(2, bodyH * 0.06), "#111111");
  }
  if (player.power === "Speedy") {
    drawPixelRect(x - bodyW * 0.55, y + bodyH * 0.65, bodyW * 0.45, Math.max(3, bodyH * 0.08), "#ffe15c");
    drawPixelRect(x + bodyW * 1.1, y + bodyH * 0.65, bodyW * 0.45, Math.max(3, bodyH * 0.08), "#ffe15c");
  }
}

function drawFirstPersonHands() {
  const bob = (keys.has("KeyW") || keys.has("ArrowUp")) && !gameOver ? Math.sin(performance.now() * 0.014) * 5 : 0;
  drawPixelRect(188, canvas.height - 86 + bob, 78, 32, "#2f6dd1");
  drawPixelRect(704, canvas.height - 86 - bob, 78, 32, "#2f6dd1");
  drawPixelRect(212, canvas.height - 58 + bob, 58, 38, "#d6a072");
  drawPixelRect(690, canvas.height - 58 - bob, 58, 38, "#d6a072");
  if (player.power === "Fly") {
    drawPixelRect(278, canvas.height - 112 + bob, 42, 16, "#ffffff");
    drawPixelRect(640, canvas.height - 112 - bob, 42, 16, "#ffffff");
  }
  if (player.power === "Speedy") {
    drawPixelRect(326, canvas.height - 50, 58, 8, "#ffe15c");
    drawPixelRect(586, canvas.height - 50, 58, 8, "#ffe15c");
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
  const camera = getCamera();
  drawBackground();
  drawFinishLine(camera);

  const visibleThings = [
    ...trees.map((thing) => ({ kind: "tree", thing, projected: projectWorld(thing.x, thing.y + 58 * thing.scale, camera) })),
    ...blocks.map((thing) => ({ kind: "block", thing, projected: projectWorld(thing.x + 16, thing.y + 28, camera) })),
    ...bulls.map((thing) => ({ kind: "bull", thing, projected: projectWorld(thing.x, thing.y + thing.height / 2, camera) }))
  ].filter((item) => item.projected && Math.abs(item.projected.side / item.projected.depth) < 1.15 && item.projected.x > -180 && item.projected.x < canvas.width + 180);

  visibleThings
    .sort((a, b) => b.projected.depth - a.projected.depth)
    .forEach((item) => {
      if (item.kind === "tree") drawTree(item.thing, item.projected);
      if (item.kind === "block") drawBlock(item.thing, item.projected);
      if (item.kind === "bull") drawBull(item.thing, item.projected);
    });

  if (camera.mode !== "first") {
    drawPerspectivePlayer(projectWorld(player.x, player.y + player.size / 2, camera), camera.mode);
  }
  drawParticles(camera);
  if (camera.mode === "first") drawFirstPersonHands();
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
  if (event.code === "Space") {
    if (gameShell.classList.contains("menu-open") || gameOver) {
      startGame();
    } else if (!keys.has(event.code)) {
      cyclePerspective();
    }
    keys.add(event.code);
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
