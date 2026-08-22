const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const ui = {
  score: document.querySelector("#score"),
  coins: document.querySelector("#coins"),
  tokens: document.querySelector("#tokens"),
  mission: document.querySelector("#mission"),
  multiplier: document.querySelector("#multiplier"),
  board: document.querySelector("#board"),
  message: document.querySelector("#message"),
  start: document.querySelector("#start"),
  pause: document.querySelector("#pause"),
};

const W = canvas.width;
const H = canvas.height;
const lanes = [-180, 0, 180];
const keys = new Set();
let lastTime = 0;
let spawnTimer = 0;
let coinTimer = 0;
let paused = true;
let gameOver = false;
let started = false;

const state = {
  speed: 360,
  distance: 0,
  score: 0,
  coins: 0,
  tokens: 0,
  tokenBoost: 0,
  nitro: false,
  nitroCount: 0,
  missionCoins: 0,
  multiplier: 1,
  hoverboard: false,
  hoverboardCooldown: 0,
  boardFlash: 0,
  caughtTimer: 0,
  fallTimer: 0,
};

const player = {
  lane: 1,
  targetLane: 1,
  x: 0,
  y: 514,
  z: 0,
  vz: 0,
  ground: 0,
  duck: 0,
  invuln: 0,
};

const policeman = { y: 614, panic: 0 };
const obstacles = [];
const coins = [];
const tokens = [];
const nitros = [];
const particles = [];

function reset() {
  state.speed = 360;
  state.distance = 0;
  state.score = 0;
  state.coins = 0;
  state.tokens = 0;
  state.tokenBoost = 0;
  state.nitro = false;
  state.nitroCount = 0;
  state.missionCoins = 0;
  state.multiplier = 1;
  state.hoverboard = false;
  state.hoverboardCooldown = 0;
  state.boardFlash = 0;
  state.caughtTimer = 0;
  state.fallTimer = 0;
  player.lane = 1;
  player.targetLane = 1;
  player.x = 0;
  player.z = 0;
  player.vz = 0;
  player.ground = 0;
  player.duck = 0;
  player.invuln = 0;
  policeman.y = 614;
  policeman.panic = 0;
  obstacles.length = 0;
  coins.length = 0;
  tokens.length = 0;
  nitros.length = 0;
  particles.length = 0;
  spawnTimer = 0;
  coinTimer = 0;
  gameOver = false;
  paused = false;
  started = true;
  ui.message.classList.add("hidden");
  ui.pause.textContent = "II";
}

function laneX(lane, z) {
  const t = perspective(z);
  return W / 2 + lanes[lane] * t;
}

function perspective(z) {
  return Math.max(0.08, 0.32 + (1 - z) * 0.78);
}

function screenY(z) {
  return 138 + (1 - z) * 432;
}

function widthAt(z, base) {
  return base * perspective(z);
}

function addObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const roll = Math.random();
  let type = "stop";
  if (roll > 0.52) type = "bus";
  if (roll > 0.68) type = "box";
  if (roll > 0.82) type = "train";
  if (roll > 0.92) type = "barrier";
  obstacles.push({ lane, z: 1.08, type, hit: false });
}

function platformHeight(type) {
  if (type === "bus") return 116;
  if (type === "box") return 86;
  return 0;
}

function addCoinLine() {
  const lane = Math.floor(Math.random() * 3);
  for (let i = 0; i < 6; i++) coins.push({ lane, z: 1.05 + i * 0.075, taken: false });
  if (Math.random() < 0.32) {
    const tokenLane = Math.floor(Math.random() * 3);
    tokens.push({ lane: tokenLane, z: 1.2, taken: false, spin: Math.random() * Math.PI * 2 });
  }
  if (Math.random() < 0.18) {
    const nitroLane = Math.floor(Math.random() * 3);
    nitros.push({ lane: nitroLane, z: 1.28, taken: false, bob: Math.random() * Math.PI * 2 });
  }
}

function pop(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 160;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      life: 0.55 + Math.random() * 0.25,
      maxLife: 0.75,
      size: 4 + Math.random() * 10,
      spin: Math.random() * Math.PI,
      color,
    });
  }
}

function useHoverboard() {
  if (!started || paused || gameOver) return;
  if (!state.hoverboard && state.hoverboardCooldown <= 0) {
    state.hoverboard = true;
    state.hoverboardCooldown = 8;
    state.boardFlash = 0.45;
    pop(player.x + W / 2, player.y + 20, "#3ad7ff", 18);
  }
}

function useNitro() {
  if (!started || paused || gameOver) return;
  if (state.nitro || state.nitroCount <= 0 || (!state.hoverboard && state.hoverboardCooldown > 0)) return;
  state.nitroCount--;
  state.nitro = true;
  state.hoverboard = true;
  state.hoverboardCooldown = Math.max(state.hoverboardCooldown, 8);
  state.boardFlash = 0.65;
  pop(player.x + W / 2 - 35, player.y + 70, "#ff4d2e", 18);
  pop(player.x + W / 2 + 35, player.y + 70, "#ffd64a", 18);
  updateHud();
}

function handleInput(dt) {
  if (keys.has("ArrowLeft") || keys.has("a")) {
    player.targetLane = Math.max(0, player.targetLane - 1);
    keys.delete("ArrowLeft");
    keys.delete("a");
  }
  if (keys.has("ArrowRight") || keys.has("d")) {
    player.targetLane = Math.min(2, player.targetLane + 1);
    keys.delete("ArrowRight");
    keys.delete("d");
  }
  if ((keys.has("ArrowUp") || keys.has("w")) && player.z <= player.ground + 1) {
    player.vz = 680;
    keys.delete("ArrowUp");
    keys.delete("w");
  }
  if (keys.has("ArrowDown") || keys.has("s")) {
    player.duck = 0.55;
    keys.delete("ArrowDown");
    keys.delete("s");
  }
  player.duck = Math.max(0, player.duck - dt);
}

function update(dt) {
  if (paused) return;
  if (gameOver) {
    if (state.caughtTimer > 0) {
      state.caughtTimer -= dt;
      state.fallTimer += dt;
      policeman.y = Math.max(player.y + 62, policeman.y - dt * 210);
      policeman.panic = Math.max(0.2, policeman.panic - dt * 0.3);
      if (state.caughtTimer <= 0) endGame();
    }
    updateHud();
    return;
  }
  handleInput(dt);

  state.speed += dt * 8;
  state.tokenBoost = Math.max(0, state.tokenBoost - dt);
  const speedBoost = state.nitro && state.hoverboard ? 7 : (state.tokenBoost > 0 ? 1.45 : 1);
  const runSpeed = state.speed * speedBoost;
  state.distance += runSpeed * dt;
  state.score += dt * runSpeed * 0.16 * state.multiplier;
  state.multiplier = Math.min(6, 1 + Math.floor(state.distance / 1300));
  state.hoverboardCooldown = Math.max(0, state.hoverboardCooldown - dt);
  state.boardFlash = Math.max(0, state.boardFlash - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  policeman.panic = Math.max(0, policeman.panic - dt);

  const targetX = lanes[player.targetLane];
  player.x += (targetX - player.x) * Math.min(1, dt * 13);
  if (Math.abs(player.x - targetX) < 4) player.lane = player.targetLane;

  let ground = 0;
  for (const obstacle of obstacles) {
    const top = platformHeight(obstacle.type);
    if (!top || obstacle.lane !== player.targetLane) continue;
    if (obstacle.z > -0.02 && obstacle.z < 0.15 && player.z >= top - 28) {
      ground = Math.max(ground, top);
    }
  }
  player.ground = ground;
  player.z += player.vz * dt;
  player.vz -= 2100 * dt;
  if (player.z < player.ground) { player.z = player.ground; player.vz = 0; }

  spawnTimer -= dt;
  coinTimer -= dt;
  if (spawnTimer <= 0) {
    addObstacle();
    spawnTimer = Math.max(0.42, 1.08 - state.distance / 9000) + Math.random() * 0.45;
  }
  if (coinTimer <= 0) {
    addCoinLine();
    coinTimer = 1.2 + Math.random() * 1.1;
  }

  for (const item of obstacles) item.z -= dt * runSpeed / 1180;
  for (const coin of coins) coin.z -= dt * runSpeed / 1180;
  for (const token of tokens) {
    token.z -= dt * runSpeed / 1180;
    token.spin += dt * 7.5;
  }
  for (const nitro of nitros) {
    nitro.z -= dt * runSpeed / 1180;
    nitro.bob += dt * 6;
  }
  if (state.nitro && state.hoverboard) {
    pop(W / 2 + player.x - 35, player.y + 70, "#ff512f", 2);
    pop(W / 2 + player.x + 35, player.y + 70, "#ffd64a", 2);
  }

  while (obstacles[0] && obstacles[0].z < -0.16) obstacles.shift();
  while (coins[0] && coins[0].z < -0.12) coins.shift();
  while (tokens[0] && tokens[0].z < -0.12) tokens.shift();
  while (nitros[0] && nitros[0].z < -0.12) nitros.shift();

  for (const coin of coins) {
    if (coin.taken) continue;
    const close = Math.abs(coin.z - 0.055) < 0.055;
    if (close && coin.lane === player.targetLane && player.z < 80) {
      coin.taken = true;
      state.coins++;
      state.missionCoins++;
      state.score += 120 * state.multiplier;
      pop(laneX(coin.lane, coin.z), screenY(coin.z), "#ffd83b", 5);
    }
  }

  for (const token of tokens) {
    if (token.taken) continue;
    const close = Math.abs(token.z - 0.055) < 0.06;
    if (close && token.lane === player.targetLane && player.z < 120) {
      token.taken = true;
      state.tokens++;
      state.tokenBoost = Math.max(state.tokenBoost, 4.5);
      state.score += 450 * state.multiplier;
      pop(laneX(token.lane, token.z), screenY(token.z), "#e8f7ff", 22);
      pop(laneX(token.lane, token.z), screenY(token.z), "#15191f", 8);
    }
  }

  for (const nitro of nitros) {
    if (nitro.taken) continue;
    const close = Math.abs(nitro.z - 0.055) < 0.06;
    if (close && nitro.lane === player.targetLane && player.z < 120) {
      nitro.taken = true;
      state.nitroCount++;
      state.boardFlash = 0.65;
      state.score += 700 * state.multiplier;
      pop(laneX(nitro.lane, nitro.z), screenY(nitro.z), "#ff4d2e", 24);
      pop(laneX(nitro.lane, nitro.z), screenY(nitro.z), "#ffd64a", 18);
    }
  }

  for (const obstacle of obstacles) {
    if (obstacle.hit) continue;
    const near = Math.abs(obstacle.z - 0.055) < 0.05;
    if (!near || obstacle.lane !== player.targetLane || player.invuln > 0) continue;
    const top = platformHeight(obstacle.type);
    if (top && player.z >= top - 24) {
      player.z = Math.max(player.z, top);
      player.vz = Math.max(0, player.vz);
      player.ground = top;
      continue;
    }
    const jumping = player.z > 92;
    const ducking = player.duck > 0;
    const cleared = (obstacle.type === "barrier" && ducking) || (obstacle.type === "stop" && jumping);
    if (cleared) continue;
    obstacle.hit = true;
    crash(obstacle);
  }

  for (const p of particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 460 * dt;
  }
  for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);

  updateHud();
}

function crash(obstacle) {
  const x = laneX(obstacle.lane, obstacle.z);
  const y = screenY(obstacle.z);
  pop(x, y, state.hoverboard ? "#3ad7ff" : "#ff4d38", 24);
  if (state.hoverboard) {
    state.hoverboard = false;
    state.nitro = false;
    state.hoverboardCooldown = 4.5;
    player.invuln = 1.2;
    policeman.panic = 0.55;
    state.score = Math.max(0, state.score - 250);
    updateHud();
    return;
  }
  state.caughtTimer = 1.35;
  state.fallTimer = 0.01;
  policeman.y = player.y + 146;
  paused = false;
  gameOver = true;
  policeman.panic = 1;
}

function endGame() {
  paused = true;
  ui.message.classList.remove("hidden");
  ui.message.querySelector("h1").textContent = "Caught!";
  ui.message.querySelector("p").textContent = `Score ${Math.floor(state.score).toString().padStart(6, "0")} - ${state.coins} coins collected.`;
  ui.start.textContent = "Run Again";
}

function updateHud() {
  ui.score.textContent = Math.floor(state.score).toString().padStart(6, "0");
  ui.coins.textContent = `${state.coins} coins`;
  ui.tokens.textContent = state.tokenBoost > 0 ? `${state.tokens} tokens  Speed ${state.tokenBoost.toFixed(1)}s` : `${state.tokens} tokens`;
  ui.mission.textContent = `${Math.min(20, state.missionCoins)} / 20`;
  ui.multiplier.textContent = state.nitro && state.hoverboard ? "NITRO x7" : `x${state.multiplier}`;
  if (state.nitro && state.hoverboard) ui.board.textContent = `NITRO x7  Rockets on`;
  else if (state.hoverboard) ui.board.textContent = "Hoverboard on";
  else if (state.nitroCount > 0) ui.board.textContent = `NITRO ${state.nitroCount}  Press F`;
  else if (state.hoverboardCooldown > 0) ui.board.textContent = `Board ${state.hoverboardCooldown.toFixed(1)}s`;
  else ui.board.textContent = "Hoverboard ready";
}

function project(x, z, height = 0) {
  const t = perspective(z);
  return {
    x: W / 2 + x * t,
    y: screenY(z) - height * t,
    t,
  };
}

function shade(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((value >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (value & 255) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

function polygon(points, color, stroke = "rgba(20, 17, 16, 0.22)") {
  ctx.fillStyle = color;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function roundedRect(x, y, w, h, r, color, stroke = "rgba(20, 17, 16, 0.26)") {
  ctx.fillStyle = color;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.fill();
  ctx.stroke();
}

function drawWorldBox(x, z, w, h, d, color) {
  const z2 = Math.min(1.18, z + d);
  const flb = project(x - w / 2, z, 0);
  const frb = project(x + w / 2, z, 0);
  const flt = project(x - w / 2, z, h);
  const frt = project(x + w / 2, z, h);
  const blb = project(x - w / 2, z2, 0);
  const brb = project(x + w / 2, z2, 0);
  const blt = project(x - w / 2, z2, h);
  const brt = project(x + w / 2, z2, h);

  polygon([blt, brt, frt, flt], shade(color, 28));
  polygon([frt, brt, brb, frb], shade(color, -18));
  polygon([flt, blt, blb, flb], shade(color, -8));
  roundedRect(flt.x, flt.y, frt.x - flt.x, frb.y - frt.y, Math.max(2, (frt.x - flt.x) * 0.08), color);
}

function drawScreenBox(cx, cy, w, h, d, color) {
  const x = cx - w / 2;
  const y = cy - h;
  const dx = d;
  const dy = -d * 0.55;
  polygon([
    { x: x + dx, y: y + dy },
    { x: x + w + dx, y: y + dy },
    { x: x + w, y },
    { x, y },
  ], shade(color, 24));
  polygon([
    { x: x + w, y },
    { x: x + w + dx, y: y + dy },
    { x: x + w + dx, y: y + h + dy },
    { x: x + w, y: y + h },
  ], shade(color, -20));
  roundedRect(x, y, w, h, Math.max(3, Math.min(w, h) * 0.18), color);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.roundRect(x + w * 0.1, y + h * 0.08, w * 0.48, Math.max(2, h * 0.08), Math.max(2, h * 0.04));
  ctx.fill();
}

function drawWorldQuad(points, color) {
  polygon(points.map(([x, z, h = 0]) => project(x, z, h)), color, "rgba(255,255,255,0.12)");
}

function drawSoftEllipse(x, y, rx, ry, color, glow = 0) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function capsulePath(x, y, w, h) {
  const r = Math.min(Math.abs(w), Math.abs(h)) / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGradientCapsule(x, y, w, h, topColor, bottomColor, stroke = "rgba(31, 22, 18, 0.28)") {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, topColor);
  g.addColorStop(1, bottomColor);
  ctx.fillStyle = g;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  capsulePath(x, y, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  capsulePath(x + w * 0.16, y + h * 0.1, w * 0.35, h * 0.12);
  ctx.fill();
}

function drawGradientEllipse(x, y, rx, ry, topColor, bottomColor, glow = 0) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = bottomColor;
    ctx.shadowBlur = glow;
  }
  const g = ctx.createLinearGradient(x, y - ry, x, y + ry);
  g.addColorStop(0, topColor);
  g.addColorStop(1, bottomColor);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLimb(x1, y1, x2, y2, width, topColor, bottomColor) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  ctx.save();
  ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
  ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
  drawGradientCapsule(-width / 2, -length / 2, width, length, topColor, bottomColor, "rgba(42, 25, 15, 0.26)");
  ctx.restore();
}

function drawHoverboardShape(color) {
  const glow = ctx.createRadialGradient(0, 8, 4, 0, 8, 76);
  glow.addColorStop(0, "rgba(100, 235, 255, 0.42)");
  glow.addColorStop(1, "rgba(100, 235, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 14, 92, 34, 0, 0, Math.PI * 2);
  ctx.fill();

  const deck = ctx.createLinearGradient(0, -4, 0, 24);
  deck.addColorStop(0, "#b7fbff");
  deck.addColorStop(0.45, color);
  deck.addColorStop(1, "#1696c6");
  ctx.fillStyle = deck;
  ctx.strokeStyle = "rgba(10, 72, 92, 0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-60, 10);
  ctx.quadraticCurveTo(-43, -5, -10, -2);
  ctx.lineTo(38, 1);
  ctx.quadraticCurveTo(65, 5, 56, 18);
  ctx.quadraticCurveTo(35, 30, -35, 25);
  ctx.quadraticCurveTo(-66, 22, -60, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawSoftEllipse(-35, 22, 11, 5, "#e8fdff", 8);
  drawSoftEllipse(36, 22, 11, 5, "#e8fdff", 8);
  if (state.nitro && state.hoverboard) {
    for (const bx of [-42, 42]) {
      const flame = ctx.createRadialGradient(bx, 38, 2, bx, 48, 34);
      flame.addColorStop(0, "rgba(255, 255, 210, 0.95)");
      flame.addColorStop(0.34, "rgba(255, 185, 45, 0.9)");
      flame.addColorStop(1, "rgba(255, 65, 28, 0)");
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(bx - 18, 25);
      ctx.quadraticCurveTo(bx, 86, bx + 18, 25);
      ctx.quadraticCurveTo(bx, 38, bx - 18, 25);
      ctx.fill();
    }
    ctx.fillStyle = "#5e6b78";
    capsulePath(-55, 18, 24, 14);
    ctx.fill();
    capsulePath(31, 18, 24, 14);
    ctx.fill();
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#17283d");
  sky.addColorStop(0.45, "#466b7c");
  sky.addColorStop(1, "#dc773c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#803144";
  for (let i = 0; i < 8; i++) {
    const x = i * 140 - 50;
    drawGradientCapsule(x - 4, 104, 96, 226, i % 2 ? "#9b364d" : "#a64645", i % 2 ? "#662134" : "#75302f", "rgba(45, 20, 26, 0.35)");
    ctx.fillStyle = "#ffd17a";
    capsulePath(x + 14, 116, 22, 32);
    ctx.fill();
    capsulePath(x + 52, 168, 22, 32);
    ctx.fill();
  }

  drawWorldQuad([[-520, 1.08], [520, 1.08], [820, -0.12], [-820, -0.12]], "#d17337");
  drawWorldQuad([[-520, 1.08, 95], [-340, 1.08, 95], [-720, -0.12, 24], [-980, -0.12, 24]], "#344c5f");
  drawWorldQuad([[340, 1.08, 95], [520, 1.08, 95], [980, -0.12, 24], [720, -0.12, 24]], "#344c5f");

  for (const offset of [-180, 0, 180]) drawTrack(offset);
}

function drawTrack(offset) {
  drawWorldQuad([[offset - 66, 1.05], [offset + 66, 1.05], [offset + 98, -0.1], [offset - 98, -0.1]], "rgba(72, 45, 42, 0.72)");
  ctx.strokeStyle = "#d9e3e4";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  for (const side of [-45, 45]) {
    const a = project(offset + side, 1.02, 4);
    const b = project(offset + side, -0.1, 4);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (let z = 0; z < 1.02; z += 0.1) {
    const t = perspective(z);
    const y = screenY(z);
    const x = laneX(1, z) + (offset * t);
    ctx.strokeStyle = "#5b332d";
    ctx.lineWidth = Math.max(3, 8 * t);
    ctx.beginPath();
    ctx.moveTo(W / 2 + (offset - 56) * t, y);
    ctx.lineTo(W / 2 + (offset + 56) * t, y);
    ctx.stroke();
  }
}

function drawCoin(coin) {
  if (coin.taken) return;
  const x = laneX(coin.lane, coin.z);
  const y = screenY(coin.z) - 28 * perspective(coin.z);
  const r = widthAt(coin.z, 20);
  const coinGlow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.6);
  coinGlow.addColorStop(0, "rgba(255, 244, 151, 0.5)");
  coinGlow.addColorStop(1, "rgba(255, 216, 59, 0)");
  ctx.fillStyle = coinGlow;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.15, r * 1.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6b51e";
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.65, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffe66f";
  ctx.lineWidth = Math.max(1, r * 0.14);
  ctx.stroke();
  ctx.fillStyle = "#fff0a3";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.08, y, r * 0.12, r * 0.56, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpadeToken(token) {
  if (token.taken) return;
  const x = laneX(token.lane, token.z);
  const y = screenY(token.z) - 34 * perspective(token.z);
  const r = widthAt(token.z, 28);
  const wobble = Math.sin(token.spin) * r * 0.16;
  const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.65);
  glow.addColorStop(0, "rgba(232, 247, 255, 0.6)");
  glow.addColorStop(1, "rgba(232, 247, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.45, r * 1.45, 0, 0, Math.PI * 2);
  ctx.fill();

  const chip = ctx.createRadialGradient(x - r * 0.25, y - r * 0.28, r * 0.08, x, y, r);
  chip.addColorStop(0, "#ffffff");
  chip.addColorStop(0.65, "#f2fbff");
  chip.addColorStop(1, "#a9c3cc");
  ctx.fillStyle = chip;
  ctx.strokeStyle = "#15191f";
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.ellipse(x, y, r + wobble, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < 6; i++) {
    const a = token.spin * 0.2 + i * Math.PI / 3;
    ctx.fillStyle = i % 2 === 0 ? "#15191f" : "#dff2f7";
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(a) * r * 0.78,
      y + Math.sin(a) * r * 0.78,
      r * 0.13,
      r * 0.25,
      a,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.fillStyle = "#15191f";
  ctx.beginPath();
  ctx.arc(x - r * 0.18, y - r * 0.1, r * 0.24, Math.PI * 0.72, Math.PI * 2.08);
  ctx.arc(x + r * 0.18, y - r * 0.1, r * 0.24, Math.PI * 0.92, Math.PI * 2.28);
  ctx.quadraticCurveTo(x + r * 0.38, y + r * 0.12, x, y + r * 0.48);
  ctx.quadraticCurveTo(x - r * 0.38, y + r * 0.12, x - r * 0.42, y - r * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.26);
  ctx.quadraticCurveTo(x - r * 0.07, y + r * 0.52, x - r * 0.28, y + r * 0.62);
  ctx.lineTo(x + r * 0.28, y + r * 0.62);
  ctx.quadraticCurveTo(x + r * 0.07, y + r * 0.52, x, y + r * 0.26);
  ctx.fill();

  ctx.strokeStyle = "rgba(21, 25, 31, 0.35)";
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.58, 0, Math.PI * 2);
  ctx.stroke();
}

function drawNitroCan(nitro) {
  if (nitro.taken) return;
  const x = laneX(nitro.lane, nitro.z);
  const y = screenY(nitro.z) - 34 * perspective(nitro.z) + Math.sin(nitro.bob) * 4;
  const t = perspective(nitro.z);
  const w = 34 * t;
  const h = 70 * t;
  const glow = ctx.createRadialGradient(x, y, 4 * t, x, y, 58 * t);
  glow.addColorStop(0, "rgba(255, 75, 35, 0.5)");
  glow.addColorStop(1, "rgba(255, 75, 35, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(x, y, 58 * t, 58 * t, 0, 0, Math.PI * 2);
  ctx.fill();

  drawGradientCapsule(x - w / 2, y - h / 2, w, h, "#ff6b35", "#b81f1d", "rgba(70, 15, 12, 0.45)");
  drawGradientCapsule(x - w * 0.34, y - h * 0.7, w * 0.68, h * 0.18, "#f2f6f7", "#b7c8ce", "rgba(40,40,40,0.25)");
  ctx.fillStyle = "#ffd64a";
  capsulePath(x - w * 0.42, y - h * 0.1, w * 0.84, h * 0.24);
  ctx.fill();
  ctx.fillStyle = "#15191f";
  ctx.font = `900 ${Math.max(8, 13 * t)}px Arial Black, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NITRO", x, y + h * 0.02);

  ctx.strokeStyle = "#f4f8ff";
  ctx.lineWidth = Math.max(1, 4 * t);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.48, y - h * 0.72);
  ctx.lineTo(x + w * 0.82, y - h * 0.86);
  ctx.stroke();
  drawSoftEllipse(x + w * 0.92, y - h * 0.9, w * 0.16, h * 0.05, "#f4f8ff", 3 * t);
}

function drawTrain(o) {
  const t = perspective(o.z);
  const x = laneX(o.lane, o.z);
  const y = screenY(o.z);
  const w = 122 * t;
  const h = 190 * t;
  drawGradientCapsule(x - w / 2, y - h, w, h, "#2f8ee9", "#1458a6", "rgba(5, 36, 80, 0.38)");
  const roof = ctx.createLinearGradient(x, y - h * 1.13, x, y - h * 0.82);
  roof.addColorStop(0, "#7cc5ff");
  roof.addColorStop(0.48, "#2e89df");
  roof.addColorStop(1, "#1458a6");
  ctx.fillStyle = roof;
  ctx.strokeStyle = "rgba(6, 48, 100, 0.4)";
  ctx.lineWidth = Math.max(1, 2.5 * t);
  ctx.beginPath();
  ctx.moveTo(x - w * 0.32, y - h * 0.98);
  ctx.quadraticCurveTo(x - w * 0.18, y - h * 1.13, x, y - h * 1.15);
  ctx.quadraticCurveTo(x + w * 0.18, y - h * 1.13, x + w * 0.32, y - h * 0.98);
  ctx.lineTo(x + w * 0.44, y - h * 0.76);
  ctx.quadraticCurveTo(x, y - h * 0.88, x - w * 0.44, y - h * 0.76);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawGradientEllipse(x, y - h * 0.96, w * 0.35, h * 0.08, "#9bd8ff", "#1f77c9", 0);
  ctx.fillStyle = "#f4b035";
  capsulePath(x - w * 0.38, y - h * 0.82, w * 0.76, h * 0.24);
  ctx.fill();
  ctx.fillStyle = "#1a2937";
  capsulePath(x - w * 0.32, y - h * 0.5, w * 0.64, h * 0.22);
  ctx.fill();
  ctx.fillStyle = "#e7f7ff";
  drawSoftEllipse(x - w * 0.28, y - h * 0.12, w * 0.09, h * 0.045, "#e7f7ff", 5 * t);
  drawSoftEllipse(x + w * 0.28, y - h * 0.12, w * 0.09, h * 0.045, "#e7f7ff", 5 * t);
}

function drawBus(o) {
  const t = perspective(o.z);
  const x = laneX(o.lane, o.z);
  const y = screenY(o.z);
  const w = 138 * t;
  const h = 116 * t;
  drawGradientCapsule(x - w / 2, y - h, w, h, "#ffd15c", "#d98819", "rgba(88, 55, 12, 0.34)");
  drawGradientEllipse(x, y - h + 3 * t, w * 0.45, h * 0.08, "#ffe48a", "#e8a629", 0);
  ctx.fillStyle = "#263c4e";
  ctx.beginPath();
  ctx.roundRect(x - w * 0.36, y - h * 0.77, w * 0.72, h * 0.25, Math.max(4, 14 * t));
  ctx.fill();
  ctx.fillStyle = "#f7d75f";
  ctx.beginPath();
  ctx.roundRect(x - w * 0.42, y - h * 0.38, w * 0.84, h * 0.1, Math.max(2, 5 * t));
  ctx.fill();
  ctx.fillStyle = "#f6f3e8";
  ctx.beginPath();
  ctx.roundRect(x - w * 0.38, y - h * 0.16, w * 0.18, h * 0.08, Math.max(2, 4 * t));
  ctx.roundRect(x + w * 0.2, y - h * 0.16, w * 0.18, h * 0.08, Math.max(2, 4 * t));
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.beginPath();
  ctx.roundRect(x - w * 0.44, y - h - 4 * t, w * 0.88, 9 * t, Math.max(2, 4 * t));
  ctx.fill();
}

function drawBoxStack(o) {
  const z = o.z;
  const t = perspective(z);
  const sx = laneX(o.lane, z);
  const y = screenY(z);
  drawGradientCapsule(sx - 76 * t, y - 48 * t, 58 * t, 48 * t, "#d58a46", "#a9602d", "rgba(73, 41, 18, 0.28)");
  drawGradientCapsule(sx + 1 * t, y - 50 * t, 56 * t, 46 * t, "#e29b55", "#b97231", "rgba(73, 41, 18, 0.28)");
  drawGradientCapsule(sx - 35 * t, y - 86 * t, 72 * t, 40 * t, "#c9803c", "#96572a", "rgba(73, 41, 18, 0.28)");
  ctx.strokeStyle = "rgba(70, 38, 20, 0.42)";
  ctx.lineWidth = Math.max(1, 3 * t);
  ctx.beginPath();
  ctx.moveTo(sx - 39 * t, y - 47 * t);
  ctx.quadraticCurveTo(sx, y - 55 * t, sx + 39 * t, y - 47 * t);
  ctx.moveTo(sx - 26 * t, y - 84 * t);
  ctx.quadraticCurveTo(sx + 4 * t, y - 91 * t, sx + 32 * t, y - 84 * t);
  ctx.stroke();
}

function drawStopSign(o) {
  const t = perspective(o.z);
  const x = laneX(o.lane, o.z);
  const y = screenY(o.z);
  const poleH = 108 * t;
  ctx.strokeStyle = "#262b31";
  ctx.lineWidth = Math.max(2, 7 * t);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y - poleH * 0.15);
  ctx.lineTo(x, y - poleH);
  ctx.stroke();
  const r = 42 * t;
  drawGradientEllipse(x + r * 0.08, y - poleH - 12 * t, r * 1.06, r * 1.06, "#ff5a4f", "#b32021", 4 * t);
  ctx.fillStyle = "#d8322a";
  ctx.strokeStyle = "#f6f6f6";
  ctx.lineWidth = Math.max(2, 4 * t);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + i * Math.PI / 4;
    const px = x + Math.cos(a) * r;
    const py = y - poleH - 12 * t + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(9, 25 * t)}px Arial Black, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("STOP", x, y - poleH - 12 * t);
}

function drawBarrier(o) {
  const t = perspective(o.z);
  const x = laneX(o.lane, o.z);
  const y = screenY(o.z);
  const w = 118 * t;
  const h = 64 * t;
  drawGradientCapsule(x - w / 2, y - h, w, h, "#ff6b51", "#c92f24", "rgba(84, 24, 20, 0.32)");
  ctx.strokeStyle = "#fff4c8";
  ctx.lineWidth = Math.max(2, 9 * t);
  ctx.beginPath();
  ctx.moveTo(x - w * 0.42, y - h * 0.24);
  ctx.lineTo(x + w * 0.42, y - h * 0.76);
  ctx.stroke();
}

function drawPlayer() {
  const baseY = player.y - player.z;
  const x = W / 2 + player.x;
  const duck = player.duck > 0;
  const run = Math.sin(performance.now() / 95);
  if (state.hoverboard) {
    ctx.save();
    ctx.translate(x, baseY + 40);
    drawHoverboardShape(state.boardFlash > 0 ? "#a8fbff" : "#35d2ff");
    ctx.restore();
  }
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, player.y + 58, 46, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(x, baseY);
  if (state.fallTimer > 0) {
    const fall = Math.min(1, state.fallTimer / 0.55);
    ctx.translate(18 * fall, 28 * fall);
    ctx.rotate(1.28 * fall);
    ctx.scale(1 + fall * 0.1, 1 - fall * 0.08);
  }
  ctx.scale(duck ? 1.1 : 1, duck ? 0.72 : 1);

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  drawGradientEllipse(0, -18, 35, 43, "#ffe06e", "#e7a825", 0);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.ellipse(-11, -33, 10, 23, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f04432";
  for (const by of [-39, -23, -7]) {
    ctx.beginPath();
    ctx.arc(16, by, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLimb(-26, -39, -43 + run * 9, -9, 12, "#ffd3a4", "#e6a06d");
  drawLimb(26, -39, 43 - run * 9, -12, 12, "#ffd3a4", "#e6a06d");
  drawGradientEllipse(-51 + run * 8, 2, 8, 6, "#ffd3a4", "#e6a06d", 0);
  drawGradientEllipse(51 - run * 8, -2, 8, 6, "#ffd3a4", "#e6a06d", 0);

  drawGradientEllipse(0, -72, 28, 25, "#ffd3a4", "#e6a06d", 0);

  ctx.fillStyle = "#61301e";
  ctx.beginPath();
  ctx.moveTo(-31, -89);
  ctx.lineTo(-11, -108);
  ctx.lineTo(25, -101);
  ctx.lineTo(50, -130);
  ctx.lineTo(64, -102);
  ctx.lineTo(35, -76);
  ctx.lineTo(30, -54);
  ctx.lineTo(7, -66);
  ctx.lineTo(-25, -58);
  ctx.lineTo(-34, -75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawLimb(-13, 12, -16 - run * 10, 43, 14, "#12b86e", "#05864c");
  drawLimb(-16 - run * 10, 43, -31 - run * 14, 65, 13, "#12b86e", "#05864c");
  drawLimb(13, 12, 17 + run * 10, 43, 14, "#12b86e", "#05864c");
  drawLimb(17 + run * 10, 43, 32 + run * 14, 65, 13, "#12b86e", "#05864c");

  drawGradientCapsule(-47 - run * 14, 58, 31, 13, "#ffd75f", "#d79b1b", "rgba(44, 23, 16, 0.55)");
  drawGradientCapsule(18 + run * 14, 58, 31, 13, "#ffd75f", "#d79b1b", "rgba(44, 23, 16, 0.55)");
  ctx.restore();
}

function drawPoliceman() {
  const x = W / 2 + player.x * 0.35;
  const y = policeman.y + (policeman.panic > 0 ? Math.sin(performance.now() / 45) * 6 : 0);
  const run = Math.sin(performance.now() / 120);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 30, 48, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#16191d";
  ctx.lineWidth = 5;

  drawGradientEllipse(0, -66, 24, 23, "#ffd0a0", "#df9e6c", 0);

  ctx.fillStyle = "#15191f";
  drawGradientCapsule(-29, -108, 58, 23, "#303844", "#10141a", "rgba(0,0,0,0.35)");
  drawGradientCapsule(-45, -101, 29, 12, "#303844", "#10141a", "rgba(0,0,0,0.35)");
  drawGradientCapsule(-15, -121, 34, 16, "#303844", "#10141a", "rgba(0,0,0,0.35)");
  ctx.fillStyle = "#eef3f5";
  capsulePath(9, -116, 16, 12);
  ctx.fill();

  drawGradientEllipse(0, -16, 30, 38, "#323943", "#121820", 0);

  ctx.fillStyle = "#2f3640";
  ctx.beginPath();
  ctx.ellipse(-12, -18, 6, 27, 0, 0, Math.PI * 2);
  ctx.ellipse(12, -18, 6, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d8dde2";
  capsulePath(-6, -34, 12, 10);
  ctx.fill();
  ctx.fillStyle = "#f1c64e";
  ctx.beginPath();
  ctx.arc(0, -14, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#15191f";
  ctx.fillRect(-11, -74, 6, 16);
  ctx.fillRect(10, -74, 6, 16);

  drawLimb(-25, -35, -42 - run * 9, -1, 10, "#ffd0a0", "#df9e6c");
  drawLimb(25, -35, 42 + run * 9, -2, 10, "#ffd0a0", "#df9e6c");

  drawLimb(-13, 14, -16 - run * 8, 47, 13, "#222a34", "#0d1117");
  drawLimb(-16 - run * 8, 47, -16 - run * 8, 72, 12, "#222a34", "#0d1117");
  drawLimb(13, 14, 16 + run * 8, 47, 13, "#222a34", "#0d1117");
  drawLimb(16 + run * 8, 47, 16 + run * 8, 72, 12, "#222a34", "#0d1117");

  drawGradientCapsule(-30 - run * 8, 66, 29, 11, "#5d626a", "#2b3037", "rgba(0,0,0,0.4)");
  drawGradientCapsule(1 + run * 8, 66, 29, 11, "#5d626a", "#2b3037", "rgba(0,0,0,0.4)");
  ctx.restore();
}

function drawCaughtShout() {
  if (state.fallTimer <= 0 || state.caughtTimer <= 0) return;
  const popIn = Math.min(1, state.fallTimer / 0.28);
  const x = W / 2 + player.x * 0.35;
  const y = Math.max(98, policeman.y - 122);
  ctx.save();
  ctx.translate(x + 18, y);
  ctx.scale(0.65 + popIn * 0.35, 0.65 + popIn * 0.35);
  ctx.globalAlpha = Math.min(1, popIn * 1.4);
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.strokeStyle = "#15191f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-72, -34, 144, 58, 18);
  ctx.moveTo(-18, 22);
  ctx.lineTo(-36, 45);
  ctx.lineTo(4, 22);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e63b2f";
  ctx.font = "900 28px Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Caught!", 0, -5);
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / (p.maxLife || 0.75));
    const size = p.size * (0.5 + alpha * 0.8);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = size * 1.8;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
    g.addColorStop(0, p.color);
    g.addColorStop(0.45, p.color);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, size, size * 0.72, p.spin, 0, Math.PI * 2);
    ctx.fill();
    if (alpha > 0.45) {
      ctx.globalAlpha = (alpha - 0.45) * 0.45;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 1.6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function draw() {
  drawBackground();
  if (state.fallTimer > 0 || state.caughtTimer > 0) drawPoliceman();
  const drawables = [
    ...coins.map(c => ({ z: c.z, draw: () => drawCoin(c) })),
    ...tokens.map(t => ({ z: t.z, draw: () => drawSpadeToken(t) })),
    ...nitros.map(n => ({ z: n.z, draw: () => drawNitroCan(n) })),
    ...obstacles.map(o => ({ z: o.z, draw: () => {
      if (o.type === "train") drawTrain(o);
      else if (o.type === "bus") drawBus(o);
      else if (o.type === "box") drawBoxStack(o);
      else if (o.type === "barrier") drawBarrier(o);
      else drawStopSign(o);
    }})),
  ].sort((a, b) => b.z - a.z);
  for (const item of drawables) item.draw();
  drawPlayer();
  drawParticles();
  drawCaughtShout();

  if (paused && started && !gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.font = "54px Arial Black, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Paused", W / 2, H / 2);
  }
}

function loop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "w", "a", "s", "d", "f"].includes(key)) event.preventDefault();
  if (key === " ") useHoverboard();
  else if (key === "f") useNitro();
  else keys.add(key);
});

window.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

ui.start.addEventListener("click", reset);
ui.pause.addEventListener("click", () => {
  if (!started || gameOver) return;
  paused = !paused;
  ui.pause.textContent = paused ? ">" : "II";
});

updateHud();
requestAnimationFrame(loop);

