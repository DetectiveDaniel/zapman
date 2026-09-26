"use strict";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const heartsEl = document.querySelector("#hearts");
const scoreEl = document.querySelector("#score");
const distanceEl = document.querySelector("#distance");
const messageEl = document.querySelector("#message");
const messageTitleEl = document.querySelector("#messageTitle");
const messageTextEl = document.querySelector("#messageText");
const startButton = document.querySelector("#startButton");
const levelEl = document.querySelector("#level");
const soundToggle = document.querySelector("#soundToggle");

const W = canvas.width;
const H = canvas.height;
const GROUND = 438;
const WORLD_END = 8200;
const keys = Object.create(null);

const state = {
  mode: "title",
  time: 0,
  cameraX: 0,
  score: 0,
  level: 1,
  shake: 0,
  flash: 0,
  powerupBanner: 0,
  audioEnabled: true,
  lastTime: performance.now(),
  gameTime: 0
};

let player;
let enemies = [];
let lasers = [];
let particles = [];
let pickups = [];
let obstacles = [];
let weaponPickup = null;
let audioContext = null;
let musicTimer = null;
let musicStep = 0;

const levelOneObstacles = [
  { x: 780, w: 90, h: 68, type: "crate" },
  { x: 1380, w: 125, h: 35, type: "goo" },
  { x: 1960, w: 115, h: 94, type: "crate" },
  { x: 2580, w: 150, h: 40, type: "spikes" },
  { x: 3270, w: 80, h: 58, type: "crate" },
  { x: 3720, w: 80, h: 58, type: "crate" },
  { x: 3810, w: 80, h: 95, type: "crate" },
  { x: 4450, w: 175, h: 38, type: "goo" },
  { x: 5240, w: 135, h: 110, type: "crate" },
  { x: 5960, w: 170, h: 40, type: "spikes" },
  { x: 6800, w: 92, h: 78, type: "crate" },
  { x: 7230, w: 130, h: 40, type: "goo" }
];

const enemyPlan = [
  [980, "monster"], [1570, "robot"], [2200, "monster"], [2380, "monster"],
  [2880, "robot"], [3500, "monster"], [4100, "robot"], [4720, "monster"],
  [4930, "robot"], [5510, "monster"], [5740, "monster"], [6320, "robot"],
  [7040, "monster"], [7540, "robot"], [7750, "monster"]
];

const levelTwoObstacles = [
  { x: 640, w: 105, h: 76, type: "crate" },
  { x: 1120, w: 155, h: 40, type: "spikes" },
  { x: 1740, w: 130, h: 38, type: "goo" },
  { x: 2290, w: 88, h: 65, type: "crate" },
  { x: 2390, w: 88, h: 105, type: "crate" },
  { x: 3060, w: 190, h: 40, type: "spikes" },
  { x: 3710, w: 100, h: 84, type: "crate" },
  { x: 4320, w: 185, h: 38, type: "goo" },
  { x: 4980, w: 120, h: 105, type: "crate" },
  { x: 5550, w: 190, h: 40, type: "spikes" },
  { x: 6280, w: 100, h: 65, type: "crate" },
  { x: 7480, w: 145, h: 38, type: "goo" }
];

const levelTwoEnemyPlan = [
  [820, "robot", 3], [1430, "monster", 2], [2050, "robot", 4],
  [2700, "monster", 2], [2870, "monster", 2], [3460, "robot", 4],
  [4010, "monster", 3], [4680, "robot", 4], [5280, "monster", 3],
  [5850, "robot", 5], [6520, "monster", 3], [7160, "robot", 6],
  [7350, "monster", 5], [7700, "robot", 7]

];
function ensureAudio() {
  if (!state.audioEnabled) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function tone(frequency, duration = .12, type = "square", volume = .035, delay = 0, endFrequency = frequency) {
  const audio = ensureAudio();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  gain.gain.setValueAtTime(Math.max(.0001, volume), start);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function sfx(name) {
  if (!state.audioEnabled) return;
  if (name === "jump") tone(220, .18, "sine", .06, 0, 470);
  if (name === "fire") tone(740, .08, "square", .035, 0, 1280);
  if (name === "powerShot") {
    tone(180, .13, "sawtooth", .07, 0, 760);
    tone(920, .1, "square", .04, .035, 1380);
  }
  if (name === "enemyShot") tone(180, .09, "square", .018, 0, 120);
  if (name === "hurt") tone(260, .28, "sawtooth", .07, 0, 70);
  if (name === "star") {
    tone(660, .1, "triangle", .05);
    tone(990, .16, "triangle", .05, .08);
  }
  if (name === "enemyDown") tone(310, .2, "square", .045, 0, 75);
  if (name === "level") [392, 523, 659, 784].forEach((note, i) => tone(note, .18, "triangle", .055, i * .11));
  if (name === "powerUp") [220, 330, 440, 660, 880].forEach((note, i) => tone(note, .24, i % 2 ? "square" : "sawtooth", .065, i * .09));
  if (name === "win") [523, 659, 784, 1047].forEach((note, i) => tone(note, .3, "triangle", .06, i * .14));
}

function startMusic() {
  ensureAudio();
  if (musicTimer) return;
  const tunes = {
    1: [523, 659, 784, 659, 587, 698, 880, 698],
    2: [587, 740, 880, 988, 880, 740, 659, 784]
  };
  musicTimer = setInterval(() => {
    if (state.mode !== "playing" || !state.audioEnabled) return;
    const tune = tunes[state.level] || tunes[1];
    const note = tune[musicStep % tune.length];
    tone(note, .14, "triangle", .018);
    if (musicStep % 4 === 0) tone(note / 2, .22, "sine", .025);
    musicStep++;
  }, 185);
}

function toggleSound() {
  state.audioEnabled = !state.audioEnabled;
  soundToggle.textContent = state.audioEnabled ? "SOUND ON" : "SOUND OFF";
  soundToggle.setAttribute("aria-pressed", String(!state.audioEnabled));
  soundToggle.setAttribute("aria-label", state.audioEnabled ? "Mute sound" : "Turn sound on");
  if (state.audioEnabled) {
    ensureAudio();
    sfx("star");
  } else if (audioContext) {
    audioContext.suspend();
  }
}
function initHearts() {
  heartsEl.replaceChildren();
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heartsEl.append(heart);
  }
}

function makeEnemies(plan) {
  return plan.map(([x, type, hp], i) => ({
    x, y: GROUND - (type === "monster" ? 52 : 62),
    w: type === "monster" ? 56 : 50,
    h: type === "monster" ? 52 : 62,
    type,
    hp: hp || (type === "monster" ? 2 : 3),
    vx: (i % 2 ? -1 : 1) * (type === "monster" ? 65 : 45),
    home: x,
    hurt: 0,
    dead: false,
    shootTimer: 1.2 + (i % 3) * .5,
    walkCycle: i
  }));
}

function loadLevel(level) {
  const levelTwo = level === 2;
  state.level = level;
  state.cameraX = 0;
  state.powerupBanner = 0;
  obstacles = (levelTwo ? levelTwoObstacles : levelOneObstacles).map(item => ({ ...item }));
  enemies = makeEnemies(levelTwo ? levelTwoEnemyPlan : enemyPlan);
  lasers = [];
  particles = [];
  pickups = (levelTwo ? [950, 2520, 4540, 6150] : [1700, 3400, 5100, 6650])
    .map((x, i) => ({ x, y: 330 - i % 2 * 35, taken: false, phase: i }));
  weaponPickup = levelTwo ? { x: 6870, y: 346, w: 70, h: 48, taken: false, phase: 0 } : null;
  player.x = 140;
  player.y = GROUND - player.h;
  player.vx = 0;
  player.vy = 0;
  player.grounded = true;
  player.invincible = 0;
  player.fireCooldown = 0;
  player.facing = 1;
  player.superBlaster = false;
  if (levelTwo) player.hearts = Math.min(10, player.hearts + 2);
  updateHud();
}

function resetGame() {
  player = {
    x: 140, y: GROUND - 66, w: 42, h: 66,
    vx: 0, vy: 0, facing: 1, hearts: 10,
    grounded: true, invincible: 0, fireCooldown: 0,
    walkCycle: 0, squash: 0, superBlaster: false
  };
  state.time = 0;
  state.gameTime = 0;
  state.score = 0;
  state.shake = 0;
  state.flash = 0;
  musicStep = 0;
  loadLevel(1);
}
function beginPlaying() {
  state.mode = "playing";
  messageEl.classList.add("hidden");
  ensureAudio();
  startMusic();
  canvas.focus();
}

function startGame() {
  resetGame();
  beginPlaying();
}

function showLevelTwo() {
  state.mode = "between";
  messageEl.classList.remove("hidden");
  messageTitleEl.textContent = "LEVEL 2: ROBOT RUCKUS!";
  messageTextEl.textContent = "The night shift is even sillier. Find the grey Super Silly Blaster near the end—its giant shots defeat anything in one hit!";
  startButton.textContent = "START LEVEL 2!";
  sfx("level");
}

function handleStartButton() {
  if (state.mode === "between") {
    loadLevel(2);
    beginPlaying();
    return;
  }
  startGame();
}

function endGame(won) {
  state.mode = won ? "won" : "lost";
  messageEl.classList.remove("hidden");
  messageTitleEl.textContent = won ? "BOTH LEVELS SAVED!" : "BILLIE GOT BONKED!";
  messageTextEl.textContent = won
    ? `You cleared both levels with ${player.hearts} hearts left and scored ${state.score.toLocaleString()} points! The Super Silly Blaster is officially too powerful.`
    : "Those silly villains got you this time. Dust off your trainers and give it another go!";
  startButton.textContent = won ? "RUN IT AGAIN!" : "TRY AGAIN!";
  if (won) sfx("win");
}

function updateHud() {
  [...heartsEl.children].forEach((heart, i) => heart.classList.toggle("empty", i >= player.hearts));
  heartsEl.setAttribute("aria-label", `${player.hearts} of 10 hearts`);
  levelEl.textContent = String(state.level);
  scoreEl.textContent = String(state.score).padStart(6, "0");
  distanceEl.textContent = `${Math.min(100, Math.floor(player.x / (WORLD_END - 200) * 100))}%`;
}
function isDown(...names) { return names.some(name => keys[name]); }

function jump() {
  if (state.mode !== "playing" || !player.grounded) return;
  player.vy = -650;
  player.grounded = false;
  player.squash = -.12;
  burst(player.x + player.w / 2, GROUND - 2, "#f8e4b8", 7, 130);
  sfx("jump");
}

function fire() {
  if (state.mode !== "playing" || player.fireCooldown > 0) return;
  const powered = player.superBlaster;
  player.fireCooldown = powered ? .15 : .22;
  const muzzleX = player.x + player.w / 2 + player.facing * (powered ? 39 : 29);
  const muzzleY = player.y + 27;
  lasers.push({
    x: muzzleX, y: muzzleY,
    vx: player.facing * (powered ? 1120 : 850),
    owner: "player", power: powered,
    life: 1.4, w: powered ? 38 : 22, h: powered ? 10 : 6
  });
  burst(muzzleX, muzzleY, powered ? "#e5f6ff" : "#fff66d", powered ? 9 : 5, powered ? 150 : 90);
  sfx(powered ? "powerShot" : "fire");
}

function enemyFire(enemy) {
  const direction = Math.sign((player.x + player.w / 2) - enemy.x) || -1;
  lasers.push({ x: enemy.x + enemy.w / 2, y: enemy.y + 24, vx: direction * 390, owner: "enemy", power: false, life: 2.2, w: 17, h: 7 });
  sfx("enemyShot");
}
function burst(x, y, color, count = 8, speed = 180) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = speed * (.3 + Math.random() * .7);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .35 + Math.random() * .35, color, size: 3 + Math.random() * 6 });
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function solidObstacleAt(rect) {
  return obstacles.find(o => o.type === "crate" && rectsOverlap(rect, { x: o.x, y: GROUND - o.h, w: o.w, h: o.h }));
}

function hurtPlayer(sourceX) {
  if (player.invincible > 0 || state.mode !== "playing") return;
  player.hearts--;
  player.invincible = 1.25;
  player.vx = Math.sign(player.x - sourceX || 1) * 280;
  player.vy = -340;
  state.shake = .32;
  state.flash = .12;
  burst(player.x + player.w / 2, player.y + player.h / 2, "#ff5577", 14, 230);

  updateHud();
  if (player.hearts <= 0) endGame(false);
}

function update(dt) {
  state.time += dt;
  if (state.mode !== "playing") return;
  state.gameTime += dt;
  state.shake = Math.max(0, state.shake - dt);
  state.flash = Math.max(0, state.flash - dt);
  state.powerupBanner = Math.max(0, state.powerupBanner - dt);
  player.invincible = Math.max(0, player.invincible - dt);
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.squash *= Math.pow(.001, dt);

  let move = 0;
  if (isDown("ArrowLeft", "KeyA")) move--;
  if (isDown("ArrowRight", "KeyD")) move++;
  const acceleration = player.grounded ? 1750 : 950;
  player.vx += move * acceleration * dt;
  if (!move) player.vx *= Math.pow(player.grounded ? .0008 : .12, dt);
  player.vx = Math.max(-340, Math.min(340, player.vx));
  if (move) player.facing = move;
  if (Math.abs(player.vx) > 25) player.walkCycle += dt * Math.abs(player.vx) * .038;

  const oldX = player.x;
  player.x += player.vx * dt;
  player.x = Math.max(20, Math.min(WORLD_END - player.w, player.x));
  const xBlock = solidObstacleAt(player);
  if (xBlock) {
    if (player.vx > 0) player.x = xBlock.x - player.w;
    else if (player.vx < 0) player.x = xBlock.x + xBlock.w;
    player.vx = 0;
  }

  const previousBottom = player.y + player.h;
  player.vy += 1650 * dt;
  player.y += player.vy * dt;
  player.grounded = false;

  let floorY = GROUND;
  for (const o of obstacles) {
    if (o.type !== "crate") continue;
    if (player.x + player.w > o.x + 4 && player.x < o.x + o.w - 4 && previousBottom <= GROUND - o.h + 6 && player.y + player.h >= GROUND - o.h) {
      floorY = Math.min(floorY, GROUND - o.h);
    }
  }
  if (player.y + player.h >= floorY && player.vy >= 0) {
    if (!player.grounded && player.vy > 250) player.squash = .12;
    player.y = floorY - player.h;
    player.vy = 0;
    player.grounded = true;
  }

  for (const o of obstacles) {
    if ((o.type === "spikes" || o.type === "goo") && rectsOverlap(player, { x: o.x + 8, y: GROUND - o.h + 14, w: o.w - 16, h: o.h - 10 })) {
      hurtPlayer(o.x + o.w / 2);
    }
  }

  for (const pickup of pickups) {
    pickup.phase += dt * 3;
    if (!pickup.taken && Math.hypot(player.x + player.w / 2 - pickup.x, player.y + player.h / 2 - (pickup.y + Math.sin(pickup.phase) * 9)) < 48) {
      pickup.taken = true;
      state.score += 500;
      if (player.hearts < 10) player.hearts++;
      burst(pickup.x, pickup.y, "#ffd84d", 18, 220);
      sfx("star");
      updateHud();
    }
  }

  if (weaponPickup && !weaponPickup.taken) {
    weaponPickup.phase += dt * 4;
    const pickupY = weaponPickup.y + Math.sin(weaponPickup.phase) * 8;
    if (Math.hypot(player.x + player.w / 2 - weaponPickup.x, player.y + player.h / 2 - pickupY) < 70) {
      weaponPickup.taken = true;
      player.superBlaster = true;
      state.powerupBanner = 3.5;
      state.score += 1000;
      burst(weaponPickup.x, pickupY, "#dce9ef", 35, 340);
      sfx("powerUp");
      updateHud();
    }
  }
  updateEnemies(dt);
  updateLasers(dt);
  updateParticles(dt);

  const targetCamera = Math.max(0, Math.min(WORLD_END - W, player.x - W * .32));
  state.cameraX += (targetCamera - state.cameraX) * Math.min(1, dt * 5);
  updateHud();
  if (player.x >= WORLD_END - 230) {
    if (state.level === 1) showLevelTwo();
    else endGame(true);
  }
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    enemy.hurt = Math.max(0, enemy.hurt - dt);
    enemy.walkCycle += dt * Math.abs(enemy.vx) * .045;
    const distance = player.x - enemy.x;
    if (Math.abs(distance) < (enemy.type === "monster" ? 430 : 600)) {
      const chaseSpeed = enemy.type === "monster" ? 105 : 75;
      enemy.vx += (Math.sign(distance) * chaseSpeed - enemy.vx) * Math.min(1, dt * 3);
    } else if (Math.abs(enemy.x - enemy.home) > 150) {
      enemy.vx = Math.sign(enemy.home - enemy.x) * (enemy.type === "monster" ? 65 : 45);
    }
    enemy.x += enemy.vx * dt;
    if (solidObstacleAt({ x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h })) enemy.vx *= -1;

    if (enemy.type === "robot") {
      enemy.shootTimer -= dt;
      if (Math.abs(distance) < 590 && enemy.shootTimer <= 0) {
        enemyFire(enemy);
        enemy.shootTimer = 1.7 + Math.random() * .8;
      }
    }
    if (rectsOverlap(player, enemy)) hurtPlayer(enemy.x);
  }
}

function updateLasers(dt) {
  for (const laser of lasers) {
    laser.x += laser.vx * dt;
    laser.life -= dt;
    const laserRect = { x: laser.x - laser.w / 2, y: laser.y - laser.h / 2, w: laser.w, h: laser.h };
    if (solidObstacleAt(laserRect)) {
      laser.life = 0;
      burst(laser.x, laser.y, laser.owner === "player" ? "#fff66d" : "#ff4f96", 5, 100);
      continue;
    }
    if (laser.owner === "player") {
      for (const enemy of enemies) {
        if (!enemy.dead && rectsOverlap(laserRect, enemy)) {
          laser.life = 0;
          enemy.hp = laser.power ? 0 : enemy.hp - 1;
          enemy.hurt = .14;
          burst(laser.x, laser.y, "#fff66d", 10, 170);
          if (enemy.hp <= 0) {
            enemy.dead = true;
            state.score += enemy.type === "robot" ? 350 : 200;
            burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.type === "robot" ? "#6ff7ff" : "#8cff64", 22, 280);
            sfx("enemyDown");
          }
          break;
        }
      }
    } else if (rectsOverlap(laserRect, player)) {
      laser.life = 0;
      hurtPlayer(laser.x);
    }
  }
  lasers = lasers.filter(l => l.life > 0 && Math.abs(l.x - player.x) < 1200);
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 480 * dt;
    p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);
}

function drawRoundedRect(x, y, w, h, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, state.level === 2 ? "#2d287d" : "#65dff4");
  sky.addColorStop(.72, state.level === 2 ? "#d152a4" : "#c6f5ef");
  sky.addColorStop(1, state.level === 2 ? "#ffad63" : "#fff0aa");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,.72)";
  for (let i = -1; i < 7; i++) {
    const x = i * 210 - (state.cameraX * .11) % 210;
    const y = 105 + (i % 3) * 48;
    ctx.beginPath();
    ctx.arc(x, y, 38, Math.PI, 0);
    ctx.arc(x + 42, y - 12, 48, Math.PI, 0);
    ctx.arc(x + 92, y, 34, Math.PI, 0);
    ctx.fill();
  }

  const hillOffset = (state.cameraX * .2) % 500;
  ctx.fillStyle = state.level === 2 ? "#604d9d" : "#85c873";
  for (let i = -1; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(i * 500 - hillOffset, 430, 220, Math.PI, 0);
    ctx.fill();
  }

  for (let i = -1; i < 13; i++) {
    const worldX = i * 180 + 50;
    const x = worldX - (state.cameraX * .48) % 2340;
    const buildingH = 95 + ((i * 47) % 110);
    ctx.fillStyle = state.level === 2 ? (i % 2 ? "#35305f" : "#4a3d78") : (i % 2 ? "#7b66c7" : "#9b7cdd");
    ctx.fillRect(x, GROUND - buildingH, 120, buildingH);
    ctx.fillStyle = "#ffe56b";
    for (let wy = GROUND - buildingH + 20; wy < GROUND - 20; wy += 30) {
      for (let wx = x + 18; wx < x + 105; wx += 34) ctx.fillRect(wx, wy, 13, 17);
    }
  }

  ctx.fillStyle = state.level === 2 ? "#29213f" : "#4e326c";
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.fillStyle = state.level === 2 ? "#514269" : "#6d4791";
  for (let x = -(state.cameraX % 90); x < W + 90; x += 90) ctx.fillRect(x, GROUND + 23, 58, 8);
  ctx.fillStyle = "#332246";
  ctx.fillRect(0, GROUND + 72, W, 30);
}

function drawWorld() {
  ctx.save();
  ctx.translate(-state.cameraX, 0);

  for (let x = 350; x < WORLD_END; x += 480) drawLamp(x);
  for (const o of obstacles) drawObstacle(o);
  for (const pickup of pickups) if (!pickup.taken) drawPickup(pickup);
  if (weaponPickup && !weaponPickup.taken) drawSuperBlasterPickup(weaponPickup);
  for (const enemy of enemies) if (!enemy.dead) drawEnemy(enemy);
  for (const laser of lasers) drawLaser(laser);
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life * 3);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  drawFinish();
  drawPlayer();
  ctx.restore();
}

function drawLamp(x) {
  ctx.strokeStyle = "#342344";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(x, GROUND);
  ctx.lineTo(x, 270);
  ctx.quadraticCurveTo(x, 244, x + 30, 244);
  ctx.stroke();
  ctx.fillStyle = "#ffd84d";
  ctx.strokeStyle = "#342344";
  ctx.lineWidth = 6;
  drawRoundedRect(x + 14, 230, 42, 34, 8);
  ctx.fill(); ctx.stroke();
}

function drawObstacle(o) {
  if (o.type === "crate") {
    const y = GROUND - o.h;
    ctx.fillStyle = "#d6873b";
    ctx.strokeStyle = "#4e2b37";
    ctx.lineWidth = 6;
    drawRoundedRect(o.x, y, o.w, o.h, 7); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(o.x + 10, y + 10); ctx.lineTo(o.x + o.w - 10, y + o.h - 10);
    ctx.moveTo(o.x + o.w - 10, y + 10); ctx.lineTo(o.x + 10, y + o.h - 10);
    ctx.stroke();
  } else if (o.type === "spikes") {
    ctx.fillStyle = "#b9d2db";
    ctx.strokeStyle = "#3d4058";
    ctx.lineWidth = 4;
    const count = Math.floor(o.w / 27);
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.moveTo(o.x + i * (o.w / count), GROUND);
      ctx.lineTo(o.x + (i + .5) * (o.w / count), GROUND - o.h);
      ctx.lineTo(o.x + (i + 1) * (o.w / count), GROUND);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#b9f044";
    ctx.strokeStyle = "#4b7728";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, GROUND - 8, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e7ff80";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(o.x + 20 + i * (o.w - 40) / 3, GROUND - 14 - (i % 2) * 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPickup(p) {
  const y = p.y + Math.sin(p.phase) * 9;
  ctx.save();
  ctx.translate(p.x, y);
  ctx.rotate(Math.sin(p.phase * .7) * .15);
  ctx.fillStyle = "#ffd84d";
  ctx.strokeStyle = "#4c315d";
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? 10 : 22;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawSuperBlasterPickup(p) {
  const y = p.y + Math.sin(p.phase) * 8;
  ctx.save();
  ctx.translate(p.x, y);
  const pulse = 1 + Math.sin(p.phase * 1.7) * .08;
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "rgba(220, 243, 255, .22)";
  ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 12px Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ONE-HIT BLASTER!", 0, -48);
  ctx.fillStyle = "#20242b";
  ctx.fillRect(-39, -14, 65, 24);
  ctx.fillRect(22, -9, 20, 14);
  ctx.fillRect(-9, 8, 17, 30);
  ctx.fillStyle = "#6f7782";
  ctx.fillRect(-34, -9, 56, 14);
  ctx.fillRect(25, -5, 13, 6);
  ctx.fillRect(-5, 6, 9, 27);
  ctx.fillStyle = "#aeb6bf";
  ctx.fillRect(-28, -7, 36, 4);
  ctx.fillRect(-23, 1, 42, 3);
  ctx.fillStyle = "#3b414a";
  for (let x = -27; x < 14; x += 10) ctx.fillRect(x, -13, 6, 5);
  ctx.restore();
}
function drawPlayer() {
  const p = player;
  if (p.invincible > 0 && Math.floor(p.invincible * 14) % 2) return;
  const bob = p.grounded ? Math.sin(p.walkCycle * 2) * 2 : 0;
  const legSwing = p.grounded ? Math.sin(p.walkCycle) * 11 : -7;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2 + bob);
  ctx.scale(p.facing * (1 + p.squash), 1 - p.squash);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#29203c";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-7, 20); ctx.lineTo(-9 + legSwing, 37);
  ctx.moveTo(7, 20); ctx.lineTo(10 - legSwing, 37);
  ctx.stroke();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-12 + legSwing, 37); ctx.lineTo(-3 + legSwing, 37);
  ctx.moveTo(7 - legSwing, 37); ctx.lineTo(16 - legSwing, 37);
  ctx.stroke();
  ctx.fillStyle = "#ff4f96";
  ctx.strokeStyle = "#291d3d";
  ctx.lineWidth = 5;
  drawRoundedRect(-17, -7, 34, 34, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffe0b5";
  ctx.beginPath(); ctx.arc(0, -22, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#4b2b29";
  ctx.beginPath();
  ctx.arc(-2, -27, 20, Math.PI * 1.05, Math.PI * 1.92);
  ctx.lineTo(17, -25); ctx.quadraticCurveTo(4, -42, -17, -30); ctx.fill();
  ctx.fillStyle = "#20202d";
  ctx.beginPath(); ctx.arc(7, -22, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#812c4a"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(9, -14, 5, .2, 1.7); ctx.stroke();
  ctx.strokeStyle = "#ffe0b5"; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(28, 12); ctx.stroke();
  ctx.strokeStyle = "#291d3d";
  ctx.lineWidth = 4;
  if (p.superBlaster) {
    ctx.fillStyle = "#68717b";
    drawRoundedRect(19, 2, 40, 18, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#343a43";
    ctx.fillRect(55, 6, 13, 9);
    ctx.fillRect(30, 18, 11, 19);
    ctx.fillStyle = "#b9c1c9";
    ctx.fillRect(25, 5, 26, 4);
    ctx.fillStyle = "#e5f6ff";
    ctx.fillRect(65, 8, 8, 5);
  } else {
    ctx.fillStyle = "#8a56ff";
    drawRoundedRect(20, 6, 25, 14, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#63f6ff"; ctx.fillRect(40, 10, 10, 6);
  }
  ctx.restore();
}

function drawEnemy(e) {
  const bob = Math.sin(e.walkCycle * 2) * 2;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2 + bob);
  ctx.scale(Math.sign(e.vx || -1), 1);
  if (e.hurt > 0) ctx.globalAlpha = .5 + Math.sin(e.hurt * 80) * .35;
  if (e.type === "monster") {
    ctx.fillStyle = "#75d64b";
    ctx.strokeStyle = "#263c35";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-26, 22); ctx.quadraticCurveTo(-31, -10, -18, -19);
    ctx.lineTo(-11, -31); ctx.lineTo(-3, -21); ctx.lineTo(8, -33); ctx.lineTo(15, -19);
    ctx.quadraticCurveTo(31, -7, 26, 22); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(-9, -5, 8, 0, Math.PI * 2); ctx.arc(10, -5, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#29203c";
    ctx.beginPath(); ctx.arc(-6, -4, 3, 0, Math.PI * 2); ctx.arc(13, -4, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#522950"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(2, 8, 9, 0, Math.PI); ctx.stroke();
    ctx.strokeStyle = "#263c35"; ctx.lineWidth = 7;
    const step = Math.sin(e.walkCycle) * 8;
    ctx.beginPath(); ctx.moveTo(-12, 20); ctx.lineTo(-15 + step, 30); ctx.moveTo(13, 20); ctx.lineTo(16 - step, 30); ctx.stroke();
  } else {
    ctx.fillStyle = "#7796ae";
    ctx.strokeStyle = "#27364f";
    ctx.lineWidth = 5;
    drawRoundedRect(-23, -24, 46, 46, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#b9d2db";
    drawRoundedRect(-18, -18, 36, 20, 5); ctx.fill();
    ctx.fillStyle = "#ff496f";
    ctx.beginPath(); ctx.arc(8, -8, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2adbd1"; ctx.fillRect(-13, -12, 8, 8);
    ctx.strokeStyle = "#27364f"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-13, 22); ctx.lineTo(-15, 31); ctx.moveTo(13, 22); ctx.lineTo(15, 31); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(23, -2); ctx.lineTo(36, 6); ctx.stroke();
    ctx.fillStyle = "#4c57c7"; drawRoundedRect(28, 0, 20, 13, 4); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#27364f"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -35); ctx.stroke();
    ctx.fillStyle = "#ffd84d"; ctx.beginPath(); ctx.arc(0, -38, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawLaser(laser) {
  const color = laser.owner === "player" ? (laser.power ? "#dff8ff" : "#fff66d") : "#ff3d9e";
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = laser.power ? 26 : 14;
  ctx.strokeStyle = "white";
  ctx.lineWidth = laser.h;
  ctx.beginPath(); ctx.moveTo(laser.x - Math.sign(laser.vx) * laser.w, laser.y); ctx.lineTo(laser.x, laser.y); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawFinish() {
  const x = WORLD_END - 180;
  ctx.fillStyle = "#ffd84d";
  ctx.strokeStyle = "#4a294f";
  ctx.lineWidth = 10;
  drawRoundedRect(x, GROUND - 180, 120, 180, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ff4f96";
  drawRoundedRect(x + 24, GROUND - 145, 72, 145, 28); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "900 16px Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(state.level === 1 ? "LEVEL 2" : "SILLY CITY", x + 60, GROUND - 194);
  ctx.fillStyle = "#ffd84d";
  ctx.beginPath(); ctx.arc(x + 77, GROUND - 73, 7, 0, Math.PI * 2); ctx.fill();
}

function draw() {
  ctx.save();
  if (state.shake > 0) ctx.translate((Math.random() - .5) * 12, (Math.random() - .5) * 8);
  drawBackground();
  drawWorld();
  if (state.powerupBanner > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(25, 28, 38, .9)";
    ctx.strokeStyle = "#e5f6ff";
    ctx.lineWidth = 5;
    drawRoundedRect(W / 2 - 250, 94, 500, 74, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "900 28px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SUPER SILLY BLASTER!", W / 2, 125);
    ctx.fillStyle = "#aeeeff";
    ctx.font = "900 15px Nunito, sans-serif";
    ctx.fillText("GREY GUN + ONE-HIT SHOTS", W / 2, 150);
    ctx.restore();
  }
  if (state.mode === "title") {
    ctx.fillStyle = "rgba(67, 40, 118, .16)";
    ctx.fillRect(0, 0, W, H);
  }
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255,70,110,${state.flash * 2.5})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function loop(now) {
  const dt = Math.min(.033, (now - state.lastTime) / 1000);
  state.lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyW", "KeyA", "KeyD", "KeyF", "KeyJ"].includes(event.code)) event.preventDefault();
  keys[event.code] = true;
  if (["ArrowUp", "Space", "KeyW"].includes(event.code) && !event.repeat) jump();
  if (["KeyF", "KeyJ"].includes(event.code) && !event.repeat) fire();
  if (event.code === "KeyM" && !event.repeat) toggleSound();
  if (event.code === "Enter" && state.mode !== "playing") handleStartButton();
});

window.addEventListener("keyup", event => { keys[event.code] = false; });
window.addEventListener("blur", () => Object.keys(keys).forEach(k => { keys[k] = false; }));
startButton.addEventListener("click", handleStartButton);
soundToggle.addEventListener("click", toggleSound);

for (const button of document.querySelectorAll("[data-action]")) {
  const action = button.dataset.action;
  const code = action === "left" ? "ArrowLeft" : action === "right" ? "ArrowRight" : null;
  const press = event => {
    event.preventDefault();
    button.classList.add("active");
    if (code) keys[code] = true;
    if (action === "jump") jump();
    if (action === "fire") fire();
  };
  const release = event => {
    event.preventDefault();
    button.classList.remove("active");
    if (code) keys[code] = false;
  };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

window.__sillyBillies = {
  state,
  get player() { return player; },
  get enemies() { return enemies; },
  get lasers() { return lasers; },
  get weaponPickup() { return weaponPickup; },
  loadLevel,
  toggleSound,
  startGame,
  fire,
  jump
};

initHearts();
resetGame();
requestAnimationFrame(loop);
