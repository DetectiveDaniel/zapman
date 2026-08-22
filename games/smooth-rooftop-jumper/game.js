const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const distanceEl = document.getElementById("distance");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const restartButton = document.getElementById("restart");
const menuButton = document.getElementById("menu-button");
const playButton = document.getElementById("play");
const playFromDressingButton = document.getElementById("play-from-dressing");
const dressingButton = document.getElementById("dressing-button");
const backMenuButton = document.getElementById("back-menu");
const gameShell = document.querySelector(".game-shell");
const mainMenuPanel = document.getElementById("main-menu-panel");
const dressingRoom = document.getElementById("dressing-room");
const preview = document.getElementById("avatar-preview");
const pctx = preview.getContext("2d");

const optionEls = {
  skin: document.getElementById("skin-options"),
  suit: document.getElementById("suit-options"),
  hair: document.getElementById("hair-options"),
  trousers: document.getElementById("trouser-options"),
  shoes: document.getElementById("shoe-options")
};

const keys = new Set();
const bestKey = "smooth-rooftop-best";
const avatarKey = "smooth-rooftop-avatar";
const gravity = 2100;
const jumpVelocity = -760;
const holdLift = -1120;
const groundBase = 430;
const powerNames = { shield: "Force Field", saber: "Sabersword", star: "Super Star" };

const palettes = {
  skin: ["#f0c090", "#d6a072", "#9b6546", "#7bc8d8", "#f2f2f2"],
  suit: ["#2f7bff", "#1ca66a", "#c93535", "#50cfe8", "#6c6f76", "#222832"],
  hair: ["#f1d56b", "#6b3f22", "#d86b2a", "#1d1410", "#1166ff"],
  trousers: ["#17243a", "#222832", "#ffffff", "#263f2f", "#772626"],
  shoes: ["#151a24", "#74462d", "#e8e8e8", "#0d0f14", "#4b5668"]
};

const presets = {
  cyborg: { skin: "#f2f2f2", suit: "#50cfe8", hair: "#1166ff", trousers: "#ffffff", shoes: "#151a24" },
  split: { skin: "#f2f2f2", suit: "#c93535", hair: "#1d1410", trousers: "#17243a", shoes: "#0d0f14" },
  knight: { skin: "#f0c090", suit: "#222832", hair: "#1166ff", trousers: "#222832", shoes: "#4b5668" }
};

const runner = {
  x: 190,
  y: 0,
  width: 34,
  height: 52,
  vy: 0,
  grounded: false,
  hold: 0
};

let rooftops = [];
let clouds = [];
let skyline = [];
let luckyBlocks = [];
let snipers = [];
let bullets = [];
let particles = [];
let distance = 0;
let speed = 280;
let gameOver = false;
let gameStarted = false;
let lastTime = performance.now();
let lastSafeTop = groundBase;
let shieldActive = false;
let saberActive = false;
let starJumps = 0;
let powerMessageTimer = 0;
let avatarStyle = loadAvatarStyle();

function random(min, max) {
  return min + Math.random() * (max - min);
}

function roundedRect(x, y, width, height, radius, target = ctx) {
  const r = Math.min(radius, width / 2, height / 2);
  target.beginPath();
  target.moveTo(x + r, y);
  target.arcTo(x + width, y, x + width, y + height, r);
  target.arcTo(x + width, y + height, x, y + height, r);
  target.arcTo(x, y + height, x, y, r);
  target.arcTo(x, y, x + width, y, r);
  target.closePath();
}

function loadAvatarStyle() {
  try {
    return { ...presets.knight, ...(JSON.parse(localStorage.getItem(avatarKey)) || {}) };
  } catch {
    return { ...presets.knight };
  }
}

function saveAvatarStyle() {
  localStorage.setItem(avatarKey, JSON.stringify(avatarStyle));
}

function createBuilding(x, width, top, color, index) {
  return {
    x,
    width,
    top,
    color,
    id: index + Math.random(),
    accent: Math.random() > 0.55 ? "#9fb5c8" : "#d8e4ee",
    panelGap: random(17, 24),
    panelHeight: random(20, 29),
    shine: random(0.14, 0.3),
    sideShade: random(0.12, 0.22),
    crown: index % 3 === 0 ? random(6, 14) : 0,
    cuts: []
  };
}

function addRoofExtras(roof, index) {
  if (index > 1 && Math.random() < 0.46) {
    luckyBlocks.push({ roof, offset: random(roof.width * 0.28, roof.width * 0.72), size: 32, angle: random(0, Math.PI * 2), taken: false });
  }
  if (index > 2 && Math.random() < 0.38) {
    snipers.push({ roof, offset: random(roof.width * 0.35, roof.width * 0.78), timer: random(0.8, 2), recoil: 0 });
  }
}

function reset() {
  keys.clear();
  distance = 0;
  speed = 280;
  gameOver = false;
  gameStarted = true;
  shieldActive = false;
  saberActive = false;
  starJumps = 0;
  powerMessageTimer = 0;
  lastTime = performance.now();
  rooftops = [];
  particles = [];
  luckyBlocks = [];
  snipers = [];
  bullets = [];
  clouds = Array.from({ length: 7 }, () => ({ x: random(0, canvas.width), y: random(40, 160), w: random(70, 150), s: random(10, 28) }));
  skyline = Array.from({ length: 18 }, (_, index) => ({
    x: index * 70 + random(-20, 18),
    width: random(38, 78),
    height: random(80, 185),
    shade: Math.random() > 0.5 ? "#182437" : "#1f3144"
  }));

  let x = -60;
  for (let i = 0; i < 8; i += 1) {
    const width = i === 0 ? 420 : random(160, 300);
    const top = i === 0 ? groundBase : random(320, 440);
    const roof = createBuilding(x, width, top, i % 2 ? "#26394d" : "#2e4e5d", i);
    rooftops.push(roof);
    addRoofExtras(roof, i);
    x += width + random(70, 130);
  }

  runner.x = 190;
  lastSafeTop = rooftops[0].top;
  runner.y = lastSafeTop - runner.height;
  runner.vy = 0;
  runner.grounded = true;
  runner.hold = 0;
  updateHud();
}

function showMainMenu() {
  gameShell.classList.add("menu-open");
  mainMenuPanel.classList.remove("hidden");
  dressingRoom.classList.add("hidden");
  gameStarted = false;
  statusEl.textContent = "Ready";
}

function startGame() {
  gameShell.classList.remove("menu-open");
  reset();
}

function best() {
  return Number(localStorage.getItem(bestKey) || 0);
}

function updateHud() {
  const meters = Math.floor(distance / 10);
  distanceEl.textContent = `${meters} m`;
  bestEl.textContent = `${Math.max(best(), meters)} m`;
  if (powerMessageTimer <= 0) {
    statusEl.textContent = gameOver ? "Fell!" : starJumps > 0 ? `Super Star ${starJumps}` : shieldActive ? "Force Field" : saberActive ? "Sabersword" : gameStarted ? "Run" : "Ready";
  }
}

function saveBest() {
  const meters = Math.floor(distance / 10);
  if (meters > best()) localStorage.setItem(bestKey, String(meters));
}

function queueJump() {
  if (!gameStarted || gameShell.classList.contains("menu-open")) return;
  if (gameOver) {
    reset();
    return;
  }
  if (!runner.grounded) return;
  runner.vy = starJumps > 0 ? -960 : jumpVelocity;
  if (starJumps > 0) starJumps -= 1;
  runner.grounded = false;
  runner.hold = 0.16;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function nearestRoof() {
  return rooftops
    .filter((roof) => roof.x + roof.width > runner.x - 80)
    .sort((a, b) => Math.abs((a.x + a.width / 2) - runner.x) - Math.abs((b.x + b.width / 2) - runner.x))[0] || rooftops[0];
}

function breakShieldToRoof() {
  shieldActive = false;
  bullets = [];
  const roof = nearestRoof();
  runner.y = roof.top - runner.height;
  runner.vy = 0;
  runner.grounded = true;
  runner.hold = 0;
  lastSafeTop = roof.top;
  statusEl.textContent = "Shield broke!";
  powerMessageTimer = 1.3;
  for (let i = 0; i < 22; i += 1) {
    particles.push({ x: runner.x + runner.width / 2, y: runner.y + runner.height / 2, vx: random(-180, 180), vy: random(-190, 120), life: random(0.35, 0.8), color: i % 2 ? "#6f7cff" : "#ff4dff" });
  }
}

function saberBox() {
  return { x: runner.x + runner.width - 1, y: runner.y + 14, width: 54, height: 20 };
}

function grantPower(type) {
  statusEl.textContent = powerNames[type];
  powerMessageTimer = 1.6;
  if (type === "shield") shieldActive = true;
  if (type === "saber") saberActive = true;
  if (type === "star") starJumps = 20;
}

function shootSniper(sniper) {
  const sx = sniper.roof.x + sniper.offset - 18;
  const sy = sniper.roof.top - 31;
  const tx = runner.x + runner.width / 2;
  const ty = runner.y + runner.height / 2;
  const angle = Math.atan2(ty - sy, tx - sx);
  const bulletSpeed = 520;
  bullets.push({ x: sx, y: sy, vx: Math.cos(angle) * bulletSpeed, vy: Math.sin(angle) * bulletSpeed, radius: 4, life: 2.2 });
  sniper.recoil = 0.14;
}

function collectLucky(block) {
  block.taken = true;
  const powers = ["shield", "saber", "star"];
  grantPower(powers[Math.floor(Math.random() * powers.length)]);
  for (let i = 0; i < 18; i += 1) {
    particles.push({ x: block.roof.x + block.offset, y: block.roof.top - 30, vx: random(-160, 120), vy: random(-180, 80), life: random(0.35, 0.7), color: i % 2 ? "#ffd35c" : "#ff9f1c" });
  }
}

function update(dt) {
  if (!gameStarted || gameOver) return;

  if (powerMessageTimer > 0) powerMessageTimer -= dt;
  speed = (280 + Math.min(distance * 0.02, 180)) * (starJumps > 0 ? 1.55 : 1);
  const dx = speed * dt;
  distance += dx;

  for (const roof of rooftops) roof.x -= dx;
  for (const cloud of clouds) {
    cloud.x -= cloud.s * dt;
    if (cloud.x + cloud.w < 0) cloud.x = canvas.width + random(20, 120);
  }

  if (rooftops[0].x + rooftops[0].width < -80) {
    rooftops.shift();
    luckyBlocks = luckyBlocks.filter((block) => !block.taken && block.roof.x + block.roof.width > -100);
    snipers = snipers.filter((sniper) => sniper.roof.x + sniper.roof.width > -100);
    const last = rooftops[rooftops.length - 1];
    const nextIndex = Math.floor(distance / 120) + rooftops.length;
    const roof = createBuilding(
      last.x + last.width + random(72, 145),
      random(150, 295),
      Math.max(300, Math.min(445, last.top + random(-85, 85))),
      Math.random() > 0.5 ? "#26394d" : "#2e4e5d",
      nextIndex
    );
    rooftops.push(roof);
    addRoofExtras(roof, nextIndex);
  }

  for (const block of luckyBlocks) block.angle += dt * 2.8;

  for (const sniper of snipers) {
    const sx = sniper.roof.x + sniper.offset;
    sniper.timer -= dt;
    sniper.recoil = Math.max(0, sniper.recoil - dt);
    if (sx > runner.x + 70 && sx < canvas.width + 80 && sniper.timer <= 0) {
      shootSniper(sniper);
      sniper.timer = 2;
    }
  }

  for (const bullet of bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
  }
  bullets = bullets.filter((bullet) => bullet.life > 0 && bullet.x > -80 && bullet.x < canvas.width + 90 && bullet.y > -80 && bullet.y < canvas.height + 80);

  if ((keys.has("Space") || keys.has("KeyW") || keys.has("ArrowUp")) && runner.hold > 0 && runner.vy < 0) {
    runner.vy += (starJumps > 0 ? -1450 : holdLift) * dt;
    runner.hold -= dt;
  }

  const previousBottom = runner.y + runner.height;
  runner.vy += gravity * dt;
  if (keys.has("KeyS") && !runner.grounded) runner.vy += gravity * 1.25 * dt;
  runner.y += runner.vy * dt;
  runner.grounded = false;

  const feet = { x: runner.x + 4, y: runner.y + runner.height - 2, width: runner.width - 8, height: 8 };
  for (const roof of rooftops) {
    if (rectsOverlap(feet, { x: roof.x, y: roof.top, width: roof.width, height: 18 }) && previousBottom <= roof.top + 12 && runner.vy >= 0) {
      runner.y = roof.top - runner.height;
      runner.vy = 0;
      runner.grounded = true;
      lastSafeTop = roof.top;
    }
  }

  const runnerBox = { x: runner.x + 4, y: runner.y + 3, width: runner.width - 8, height: runner.height - 4 };
  for (const block of luckyBlocks) {
    const bx = block.roof.x + block.offset - block.size / 2;
    const by = block.roof.top - block.size - 10;
    if (!block.taken && rectsOverlap(runnerBox, { x: bx, y: by, width: block.size, height: block.size })) collectLucky(block);
  }
  luckyBlocks = luckyBlocks.filter((block) => !block.taken);

  if (saberActive) {
    const sword = saberBox();
    for (const sniper of snipers) {
      const box = { x: sniper.roof.x + sniper.offset - 22, y: sniper.roof.top - 48, width: 44, height: 52 };
      if (rectsOverlap(sword, box)) sniper.destroyed = true;
    }
    snipers = snipers.filter((sniper) => !sniper.destroyed);
    for (const bullet of bullets) {
      if (rectsOverlap(sword, { x: bullet.x - bullet.radius, y: bullet.y - bullet.radius, width: bullet.radius * 2, height: bullet.radius * 2 })) bullet.life = 0;
    }
    for (const roof of rooftops) {
      if (rectsOverlap(sword, { x: roof.x, y: roof.top, width: roof.width, height: canvas.height - roof.top })) {
        const offset = sword.x + sword.width / 2 - roof.x;
        if (!roof.cuts.some((cut) => Math.abs(cut.offset - offset) < 22)) roof.cuts.push({ offset, y: sword.y - roof.top - 28, height: 96 });
      }
    }
  }

  for (const bullet of bullets) {
    const nearestX = Math.max(runnerBox.x, Math.min(bullet.x, runnerBox.x + runnerBox.width));
    const nearestY = Math.max(runnerBox.y, Math.min(bullet.y, runnerBox.y + runnerBox.height));
    if ((bullet.x - nearestX) ** 2 + (bullet.y - nearestY) ** 2 <= bullet.radius ** 2) {
      bullet.life = 0;
      if (shieldActive || starJumps > 0) continue;
      gameOver = true;
      runner.y = lastSafeTop - runner.height;
      runner.vy = 0;
      runner.grounded = true;
      saveBest();
    }
  }

  if (runner.y > canvas.height + 100) {
    if (shieldActive) {
      breakShieldToRoof();
      updateHud();
      return;
    }
    gameOver = true;
    runner.y = lastSafeTop - runner.height;
    runner.vy = 0;
    runner.grounded = true;
    runner.hold = 0;
    saveBest();
  }

  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 420 * dt;
    particle.life -= dt;
  }
  particles = particles.filter((particle) => particle.life > 0);
  updateHud();
}

function rainbowFill(target, x, y, width, height) {
  const gradient = target.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "#ff3b3b");
  gradient.addColorStop(0.2, "#ffd93b");
  gradient.addColorStop(0.4, "#53e85d");
  gradient.addColorStop(0.6, "#36d7ff");
  gradient.addColorStop(0.8, "#6157ff");
  gradient.addColorStop(1, "#ff4dff");
  return gradient;
}

function drawPlayer(target, x, y, scale = 1) {
  target.save();
  target.translate(x, y);
  target.scale(scale, scale);

  target.fillStyle = "rgba(0,0,0,0.28)";
  target.beginPath();
  target.ellipse(0, 62, 24, 7, 0, 0, Math.PI * 2);
  target.fill();

  const suitFill = starJumps > 0 ? rainbowFill(target, -26, 20, 52, 42) : avatarStyle.suit;
  target.strokeStyle = suitFill;
  target.lineWidth = 7;
  target.lineCap = "round";
  target.beginPath();
  target.moveTo(-10, 25);
  target.lineTo(-26, 39);
  target.moveTo(10, 25);
  target.lineTo(25, 35);
  target.stroke();

  target.fillStyle = suitFill;
  roundedRect(-13, 20, 26, 30, 8, target);
  target.fill();

  target.fillStyle = starJumps > 0 ? rainbowFill(target, -12, -2, 24, 26) : avatarStyle.skin;
  target.beginPath();
  target.arc(0, 11, 12, 0, Math.PI * 2);
  target.fill();

  target.fillStyle = starJumps > 0 ? "#ffd93b" : avatarStyle.hair;
  target.beginPath();
  target.arc(0, 6, 13, Math.PI, Math.PI * 2);
  target.fill();

  target.fillStyle = "#f8fbff";
  target.beginPath();
  target.arc(-4, 12, 2.1, 0, Math.PI * 2);
  target.arc(5, 12, 2.1, 0, Math.PI * 2);
  target.fill();

  target.strokeStyle = starJumps > 0 ? suitFill : avatarStyle.trousers;
  target.lineWidth = 6;
  target.beginPath();
  target.moveTo(-7, 48);
  target.lineTo(-13, 58);
  target.moveTo(7, 48);
  target.lineTo(13, 58);
  target.stroke();

  target.fillStyle = avatarStyle.shoes;
  roundedRect(-19, 56, 13, 6, 3, target);
  target.fill();
  roundedRect(7, 56, 13, 6, 3, target);
  target.fill();

  target.restore();
}

function drawRunner() {
  drawPlayer(ctx, runner.x + runner.width / 2, runner.y, 1);

  if (shieldActive) {
    const cx = runner.x + runner.width / 2;
    const cy = runner.y + runner.height / 2;
    ctx.strokeStyle = "rgba(111,124,255,0.75)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 35, 42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,77,255,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 42, 48, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (saberActive) drawSaber();

  if (starJumps > 0) {
    ctx.fillStyle = "rgba(255,230,84,0.75)";
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const radius = i % 2 === 0 ? 32 : 16;
      const x = runner.x + runner.width / 2 + Math.cos(angle) * radius;
      const y = runner.y + 24 + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    drawPlayer(ctx, runner.x + runner.width / 2, runner.y, 1);
  }
}

function drawSaber() {
  const box = saberBox();
  ctx.save();
  ctx.translate(box.x + 6, box.y + 18);
  ctx.rotate(-0.75);
  ctx.strokeStyle = "#111721";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(62, 0);
  ctx.stroke();
  ctx.strokeStyle = "#64d9ff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(62, 0);
  ctx.stroke();
  ctx.strokeStyle = "#f28c28";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(8, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBuilding(roof) {
  const height = canvas.height - roof.top + 70;

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(roof.x + roof.width * 0.5, canvas.height - 18, roof.width * 0.52, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  const gradient = ctx.createLinearGradient(roof.x, roof.top, roof.x + roof.width, canvas.height);
  gradient.addColorStop(0, "#60758a");
  gradient.addColorStop(0.42, roof.color);
  gradient.addColorStop(1, "#101722");
  ctx.fillStyle = gradient;
  roundedRect(roof.x, roof.top - roof.crown, roof.width, height + roof.crown, 8);
  ctx.fill();

  ctx.fillStyle = `rgba(255,255,255,${roof.shine})`;
  ctx.beginPath();
  ctx.moveTo(roof.x + roof.width * 0.1, roof.top + 4);
  ctx.lineTo(roof.x + roof.width * 0.43, roof.top + 4);
  ctx.lineTo(roof.x + roof.width * 0.25, canvas.height + 20);
  ctx.lineTo(roof.x + roof.width * 0.03, canvas.height + 20);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = `rgba(0,0,0,${roof.sideShade})`;
  ctx.fillRect(roof.x + roof.width * 0.76, roof.top, roof.width * 0.24, height);

  ctx.strokeStyle = "rgba(226,238,248,0.36)";
  ctx.lineWidth = 1;
  for (let x = roof.x + 12; x < roof.x + roof.width - 8; x += roof.panelGap) {
    ctx.beginPath();
    ctx.moveTo(x, roof.top + 6);
    ctx.lineTo(x, canvas.height + 8);
    ctx.stroke();
  }

  for (let y = roof.top + 14; y < canvas.height + 8; y += roof.panelHeight) {
    ctx.strokeStyle = "rgba(226,238,248,0.22)";
    ctx.beginPath();
    ctx.moveTo(roof.x + 7, y);
    ctx.lineTo(roof.x + roof.width - 7, y);
    ctx.stroke();
  }

  for (const cut of roof.cuts) {
    const x = roof.x + cut.offset - 17;
    const y = roof.top + cut.y;
    ctx.fillStyle = "rgba(3,6,11,0.72)";
    roundedRect(x, y, 34, cut.height, 13);
    ctx.fill();
    ctx.strokeStyle = "rgba(100,217,255,0.55)";
    ctx.lineWidth = 2;
    roundedRect(x, y, 34, cut.height, 13);
    ctx.stroke();
  }

  ctx.fillStyle = roof.accent;
  roundedRect(roof.x + 4, roof.top - roof.crown, roof.width - 8, 5, 3);
  ctx.fill();
}

function drawSkyline() {
  for (const tower of skyline) {
    const x = ((tower.x - distance * 0.08) % (canvas.width + 110)) - 80;
    const y = canvas.height - tower.height;
    ctx.fillStyle = tower.shade;
    roundedRect(x, y, tower.width, tower.height + 20, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(235,246,255,0.18)";
    for (let wy = y + 18; wy < canvas.height - 18; wy += 22) {
      for (let wx = x + 10; wx < x + tower.width - 10; wx += 18) {
        roundedRect(wx, wy, 6, 5, 2);
        ctx.fill();
      }
    }
  }
}

function drawLuckyBlock(block) {
  const cx = block.roof.x + block.offset;
  const cy = block.roof.top - 30;
  const size = block.size;
  const wobble = Math.sin(block.angle) * 6;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(block.angle) * 0.12);

  ctx.fillStyle = "#ffb000";
  ctx.beginPath();
  ctx.moveTo(-size / 2, -size / 4);
  ctx.lineTo(0, -size / 2 - 8 + wobble * 0.2);
  ctx.lineTo(size / 2, -size / 4);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ff9300";
  ctx.beginPath();
  ctx.moveTo(-size / 2, -size / 4);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, size / 2);
  ctx.lineTo(-size / 2, size / 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffc533";
  ctx.beginPath();
  ctx.moveTo(size / 2, -size / 4);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, size / 2);
  ctx.lineTo(size / 2, size / 4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#7d4b00";
  ctx.lineWidth = 2;
  ctx.strokeRect(-size / 2 + 5, -size / 4 + 7, size / 2 - 9, size / 2 - 8);
  ctx.strokeRect(5, -size / 4 + 7, size / 2 - 10, size / 2 - 8);

  ctx.fillStyle = "#333842";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 24px Inter, system-ui, sans-serif";
  ctx.fillText("?", -size * 0.23, size * 0.04);
  ctx.fillText("?", size * 0.23, size * 0.04);
  ctx.restore();
}

function drawSniper(sniper) {
  const x = sniper.roof.x + sniper.offset;
  const y = sniper.roof.top - 46;
  const recoil = sniper.recoil * 22;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 48, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#42513f";
  roundedRect(-12, 18, 24, 27, 7);
  ctx.fill();
  ctx.fillStyle = "#d6a072";
  ctx.beginPath();
  ctx.arc(0, 9, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#596352";
  roundedRect(-11, 0, 22, 8, 4);
  ctx.fill();

  ctx.strokeStyle = "#151a24";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 25);
  ctx.lineTo(-23 + recoil, 23);
  ctx.stroke();

  ctx.fillStyle = "#242b32";
  roundedRect(-52 + recoil, 18, 36, 7, 3);
  ctx.fill();
  ctx.fillStyle = "#111721";
  roundedRect(-25 + recoil, 25, 7, 10, 2);
  ctx.fill();

  if (sniper.recoil > 0) {
    ctx.fillStyle = "#ffd35c";
    ctx.beginPath();
    ctx.moveTo(-55 + recoil, 21);
    ctx.lineTo(-70 + recoil, 16);
    ctx.lineTo(-65 + recoil, 28);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBullets() {
  for (const bullet of bullets) {
    ctx.fillStyle = "rgba(255, 227, 105, 0.95)";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 227, 105, 0.32)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bullet.x - bullet.vx * 0.035, bullet.y - bullet.vy * 0.035);
    ctx.lineTo(bullet.x, bullet.y);
    ctx.stroke();
  }
}

function drawParticles() {
  for (const particle of particles) {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, Math.min(1, particle.life / 0.7));
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#75c9ff");
  sky.addColorStop(1, "#1c2a45");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const cloud of clouds) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    roundedRect(cloud.x, cloud.y, cloud.w, 18, 10);
    ctx.fill();
    roundedRect(cloud.x + 20, cloud.y - 12, cloud.w * 0.45, 22, 12);
    ctx.fill();
    roundedRect(cloud.x + cloud.w * 0.46, cloud.y - 8, cloud.w * 0.38, 20, 10);
    ctx.fill();
  }

  drawSkyline();
  for (const roof of rooftops) drawBuilding(roof);
  for (const block of luckyBlocks) drawLuckyBlock(block);
  for (const sniper of snipers) drawSniper(sniper);
  drawBullets();
  drawParticles();
  drawRunner();

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    roundedRect(runner.x - 28, lastSafeTop - 4, 90, 10, 5);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 50px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FELL!", canvas.width / 2, 230);
    ctx.font = "900 22px Inter, system-ui, sans-serif";
    ctx.fillText("Press Space to restart", canvas.width / 2, 278);
  }
}

function renderSwatches() {
  for (const [part, colors] of Object.entries(palettes)) {
    optionEls[part].innerHTML = colors.map((color) => `<button class="swatch${avatarStyle[part] === color ? " selected" : ""}" data-part="${part}" data-color="${color}" style="background:${color}" type="button">${part}</button>`).join("");
  }
  drawPreview();
}

function drawPreview() {
  pctx.clearRect(0, 0, preview.width, preview.height);
  pctx.fillStyle = "rgba(255,255,255,0.05)";
  roundedRect(18, 12, 144, 190, 14, pctx);
  pctx.fill();
  drawPlayer(pctx, 90, 52, 2.1);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

restartButton.addEventListener("click", reset);
menuButton.addEventListener("click", showMainMenu);
playButton.addEventListener("click", startGame);
playFromDressingButton.addEventListener("click", startGame);
dressingButton.addEventListener("click", () => {
  mainMenuPanel.classList.add("hidden");
  dressingRoom.classList.remove("hidden");
  drawPreview();
});
backMenuButton.addEventListener("click", () => {
  dressingRoom.classList.add("hidden");
  mainMenuPanel.classList.remove("hidden");
});

dressingRoom.addEventListener("click", (event) => {
  const preset = event.target.closest(".preset")?.dataset.preset;
  if (preset) {
    avatarStyle = { ...presets[preset] };
    saveAvatarStyle();
    renderSwatches();
    return;
  }
  const swatch = event.target.closest(".swatch");
  if (!swatch) return;
  avatarStyle[swatch.dataset.part] = swatch.dataset.color;
  saveAvatarStyle();
  renderSwatches();
});

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp"].includes(event.code)) event.preventDefault();
  if (!keys.has(event.code) && ["Space", "KeyW", "ArrowUp"].includes(event.code)) queueJump();
  keys.add(event.code);
});
window.addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("pointerdown", queueJump);

renderSwatches();
reset();
showMainMenu();
requestAnimationFrame(loop);
