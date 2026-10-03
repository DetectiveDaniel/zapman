const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const damageEl = document.querySelector("#damage");
const scoreEl = document.querySelector("#score");
const waveEl = document.querySelector("#wave");
const missionEl = document.querySelector("#mission");
const restartButton = document.querySelector("#restart");
const soundToggle = document.querySelector("#soundToggle");

const W = canvas.width;
const H = canvas.height;
const keys = new Set();
const lasers = [];
const enemies = [];
const bombs = [];
const enemyBullets = [];
const buildings = [];
const bursts = [];
const stars = Array.from({ length: 54 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H * 0.65,
  s: 0.4 + Math.random() * 1.8,
  speed: 0.25 + Math.random() * 0.7
}));

let player;
let score;
let damage;
let wave;
let gameOver;
let enemyTimer;
let buildingTimer;
let lastTime;
let laserCooldown;
let audioContext;
let flightMusicTimer = 0;
let flightMusicStep = 0;
let soundEnabled = true;

const FLIGHT_MELODY = [
  659.25, 783.99, 880, 987.77,
  880, 783.99, 659.25, 554.37,
  659.25, 739.99, 830.61, 987.77,
  880, 830.61, 739.99, 554.37,
];
const FLIGHT_BASS = [110, 130.81, 98, 146.83];
const FLIGHT_ARPEGGIOS = [
  [220, 261.63, 329.63, 440],
  [261.63, 329.63, 392, 523.25],
  [196, 246.94, 293.66, 392],
  [146.83, 220, 293.66, 440],
];

function getFlightAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playFlightNote(frequency, duration, type, volume, delay = 0) {
  const context = getFlightAudioContext();
  if (!soundEnabled || !context || context.state !== "running") return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function scheduleFlightBeat() {
  if (!soundEnabled || audioContext?.state !== "running") return;
  const step = flightMusicStep % FLIGHT_MELODY.length;
  const bar = Math.floor(step / 4);
  const waveLift = 2 ** (Math.min(3, Math.max(0, wave - 1)) / 12);
  const arpeggio = FLIGHT_ARPEGGIOS[bar][step % 4];

  playFlightNote(FLIGHT_MELODY[step] * waveLift, 0.11, "square", 0.027);
  playFlightNote(arpeggio, 0.2, "triangle", 0.018, 0.025);
  if (step % 4 === 0) {
    playFlightNote(FLIGHT_BASS[bar], 0.52, "sawtooth", 0.038);
    playFlightNote(FLIGHT_BASS[bar] * 2, 0.34, "triangle", 0.016, 0.04);
  }
  if (step % 4 === 2) {
    playFlightNote(92, 0.09, "square", 0.022);
  }
  if (step % 2 === 1) {
    playFlightNote(step % 4 === 3 ? 1760 : 1320, 0.035, "sine", 0.014, 0.03);
  }
  flightMusicStep += 1;
}

async function startFlightMusic() {
  if (!soundEnabled) return;
  const context = getFlightAudioContext();
  if (!context) return;
  try {
    if (context.state === "suspended") await context.resume();
    if (!flightMusicTimer) {
      scheduleFlightBeat();
      flightMusicTimer = window.setInterval(scheduleFlightBeat, 170);
    }
  } catch {
    // Playback starts on the next player gesture if the browser blocks this one.
  }
}

function updateFlightSoundButton() {
  soundToggle.textContent = soundEnabled ? "Sound On" : "Sound Off";
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
}

async function toggleFlightSound() {
  soundEnabled = !soundEnabled;
  updateFlightSoundButton();
  if (!soundEnabled) {
    if (audioContext?.state === "running") await audioContext.suspend();
    return;
  }
  await startFlightMusic();
}

window.__flightAudio = {
  get enabled() { return soundEnabled; },
  get contextState() { return audioContext?.state ?? "not-started"; },
  get timerActive() { return Boolean(flightMusicTimer); },
  get step() { return flightMusicStep; },
};

soundToggle.addEventListener("click", toggleFlightSound);
updateFlightSoundButton();

function resetGame() {
  player = {
    x: 110,
    y: H * 0.48,
    w: 54,
    h: 34,
    speed: 280,
    invincible: 0
  };
  score = 0;
  damage = 0;
  wave = 1;
  gameOver = false;
  enemyTimer = 0;
  buildingTimer = 1.2;
  lastTime = performance.now();
  laserCooldown = 0;
  lasers.length = 0;
  enemies.length = 0;
  bombs.length = 0;
  enemyBullets.length = 0;
  buildings.length = 0;
  bursts.length = 0;
  missionEl.textContent = "Shoot planes, dodge bombs, and stay clear of the skyline.";
  updateHud();
}

function updateHud() {
  damageEl.textContent = Math.floor(damage);
  scoreEl.textContent = score;
  waveEl.textContent = wave;
}

function rectsHit(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function addBurst(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    bursts.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 150,
      vy: (Math.random() - 0.5) * 150,
      life: 0.35 + Math.random() * 0.35,
      color
    });
  }
}

function takeDamage(points, label, x, y) {
  if (player.invincible > 0 || gameOver) return;
  damage += points;
  player.invincible = 0.85;
  addBurst(x, y, points >= 24 ? "#ff3d2f" : "#ffd15c", 18);
  missionEl.textContent = `${label}: +${points} damage`;
  if (damage >= 100) {
    gameOver = true;
    missionEl.textContent = "Jet down. Press Restart to fly again.";
  }
  updateHud();
}

function crashIntoBuilding(building) {
  damage = 100;
  gameOver = true;
  addBurst(player.x + player.w * 0.5, player.y + player.h * 0.5, "#ff3d2f", 34);
  addBurst(building.x + building.w * 0.5, building.y + 20, "#ffd15c", 28);
  playExplosionSound();
  missionEl.textContent = "Building explosion! Press Restart to fly again.";
  updateHud();
}

function playExplosionSound() {
  if (!soundEnabled) return;
  try {
    audioContext = getFlightAudioContext();
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const boom = audioContext.createOscillator();
    const crack = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const crackGain = audioContext.createGain();

    boom.type = "sawtooth";
    crack.type = "square";
    boom.frequency.setValueAtTime(95, now);
    boom.frequency.exponentialRampToValueAtTime(28, now + 0.45);
    crack.frequency.setValueAtTime(220, now);
    crack.frequency.exponentialRampToValueAtTime(55, now + 0.16);
    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    crackGain.gain.setValueAtTime(0.32, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    boom.connect(gain).connect(audioContext.destination);
    crack.connect(crackGain).connect(audioContext.destination);
    boom.start(now);
    crack.start(now);
    boom.stop(now + 0.55);
    crack.stop(now + 0.18);
  } catch {
    // Some browsers block sound until the player interacts.
  }
}

function fireLaser() {
  if (laserCooldown > 0 || gameOver) return;
  lasers.push({
    x: player.x + player.w - 4,
    y: player.y + player.h * 0.5 - 4,
    w: 34,
    h: 8,
    speed: 720
  });
  laserCooldown = 0.15;
}

function spawnEnemy() {
  const helicopter = Math.random() < 0.36;
  const y = 46 + Math.random() * (H - 190);
  enemies.push({
    type: helicopter ? "helicopter" : "plane",
    x: W + 70,
    y,
    w: helicopter ? 66 : 62,
    h: helicopter ? 32 : 36,
    speed: (helicopter ? 105 : 165) + wave * 12,
    hp: helicopter ? 2 : 1,
    bombTimer: helicopter ? 0.35 + Math.random() * 1.1 : 99,
    shotTimer: helicopter ? 99 : 0.45 + Math.random() * 0.8,
    bob: Math.random() * Math.PI * 2
  });
}

function spawnBuilding() {
  const width = 58 + Math.random() * 70;
  const height = 90 + Math.random() * 190;
  buildings.push({
    x: W + 40,
    y: H - height,
    w: width,
    h: height,
    speed: 170 + wave * 10,
    color: Math.random() < 0.5 ? "#b9824b" : "#6f8598"
  });
}

function update(dt) {
  if (gameOver) {
    updateBursts(dt);
    return;
  }

  const dx = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
  const dy = (keys.has("arrowdown") || keys.has("s") ? 1 : 0) - (keys.has("arrowup") || keys.has("w") ? 1 : 0);
  const len = Math.hypot(dx, dy) || 1;
  player.x = clamp(player.x + (dx / len) * player.speed * dt, 18, W - player.w - 12);
  player.y = clamp(player.y + (dy / len) * player.speed * dt, 18, H - player.h - 16);
  player.invincible = Math.max(0, player.invincible - dt);
  laserCooldown = Math.max(0, laserCooldown - dt);

  if (keys.has(" ") || keys.has("spacebar")) fireLaser();

  enemyTimer -= dt;
  buildingTimer -= dt;
  wave = 1 + Math.floor(score / 300);
  if (enemyTimer <= 0) {
    spawnEnemy();
    enemyTimer = Math.max(0.35, 1.1 - wave * 0.08);
  }
  if (buildingTimer <= 0) {
    spawnBuilding();
    buildingTimer = Math.max(0.9, 1.9 - wave * 0.05);
  }

  updateLasers(dt);
  updateEnemies(dt);
  updateBombs(dt);
  updateEnemyBullets(dt);
  updateBuildings(dt);
  updateBursts(dt);
  updateHud();
}

function updateLasers(dt) {
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];
    laser.x += laser.speed * dt;
    if (laser.x > W + 60) lasers.splice(i, 1);
  }
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.x -= enemy.speed * dt;
    enemy.bob += dt * 4;
    enemy.y += Math.sin(enemy.bob) * 16 * dt;

    if (enemy.type === "helicopter") {
      enemy.bombTimer -= dt;
      if (enemy.bombTimer <= 0) {
        bombs.push({ x: enemy.x + enemy.w * 0.45, y: enemy.y + enemy.h, w: 12, h: 18, vy: 150 + wave * 16, vx: -45 });
        enemy.bombTimer = 1.15 + Math.random() * 0.9;
      }
    } else {
      enemy.shotTimer -= dt;
      if (enemy.shotTimer <= 0) {
        enemyBullets.push({
          x: enemy.x + 4,
          y: enemy.y + enemy.h * 0.5 - 3,
          w: 8,
          h: 8,
          speed: 300 + wave * 22
        });
        enemy.shotTimer = 0.85 + Math.random() * 0.65;
      }
    }

    if (rectsHit(player, enemy)) {
      takeDamage(enemy.type === "helicopter" ? 18 : 24, enemy.type === "helicopter" ? "Helicopter crash" : "Plane collision", enemy.x, enemy.y);
      enemies.splice(i, 1);
      continue;
    }

    for (let j = lasers.length - 1; j >= 0; j--) {
      if (!rectsHit(lasers[j], enemy)) continue;
      lasers.splice(j, 1);
      enemy.hp -= 1;
      addBurst(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.5, "#55f1ff", 9);
      if (enemy.hp <= 0) {
        score += enemy.type === "helicopter" ? 90 : 55;
        addBurst(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.5, "#ffb44d", 22);
        enemies.splice(i, 1);
      }
      break;
    }

    if (enemy.x + enemy.w < -80) enemies.splice(i, 1);
  }
}

function updateEnemyBullets(dt) {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.x -= bullet.speed * dt;
    if (rectsHit(player, bullet)) {
      takeDamage(10, "Red dot hit", bullet.x, bullet.y);
      enemyBullets.splice(i, 1);
      continue;
    }
    if (bullet.x + bullet.w < -20) enemyBullets.splice(i, 1);
  }
}

function updateBombs(dt) {
  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    bomb.x += bomb.vx * dt;
    bomb.y += bomb.vy * dt;
    bomb.vy += 130 * dt;
    if (rectsHit(player, bomb)) {
      takeDamage(14, "Bomb hit", bomb.x, bomb.y);
      bombs.splice(i, 1);
      continue;
    }
    if (bomb.y > H + 40) bombs.splice(i, 1);
  }
}

function updateBuildings(dt) {
  for (let i = buildings.length - 1; i >= 0; i--) {
    const building = buildings[i];
    building.x -= building.speed * dt;
    if (rectsHit(player, building)) {
      crashIntoBuilding(building);
      continue;
    }
    if (building.x + building.w < -30) {
      score += 10;
      buildings.splice(i, 1);
    }
  }
}

function updateBursts(dt) {
  for (let i = bursts.length - 1; i >= 0; i--) {
    const p = bursts[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) bursts.splice(i, 1);
  }
}

function draw() {
  drawSky();
  buildings.forEach(drawBuilding);
  lasers.forEach(drawLaser);
  enemyBullets.forEach(drawEnemyBullet);
  bombs.forEach(drawBomb);
  enemies.forEach(drawEnemy);
  drawPlayer();
  drawBursts();
  if (gameOver) drawGameOver();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#bceeff");
  gradient.addColorStop(0.66, "#7ec3e2");
  gradient.addColorStop(1, "#4f7894");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  for (const star of stars) {
    star.x -= star.speed;
    if (star.x < -5) star.x = W + Math.random() * 40;
    ctx.fillRect(star.x, star.y, star.s, star.s * 4);
  }

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(0, H - 18, W, 18);
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.invincible > 0 && Math.floor(player.invincible * 16) % 2 === 0) ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#4e5a5e";
  ctx.fillRect(14, 4, 28, 25);
  ctx.fillStyle = "#354146";
  ctx.fillRect(25, 0, 8, 34);
  ctx.fillStyle = "#767f83";
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(26, 8);
  ctx.lineTo(45, 19);
  ctx.lineTo(26, 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1ebbd1";
  ctx.fillRect(27, 5, 7, 10);
  ctx.fillStyle = "#ff4e40";
  ctx.fillRect(7, 17, 6, 4);
  ctx.fillRect(43, 17, 6, 4);
  ctx.fillStyle = "#ffb13d";
  ctx.fillRect(8, 28, 8, 9);
  ctx.fillRect(37, 28, 8, 9);
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  if (enemy.type === "helicopter") {
    ctx.fillStyle = "#3c5d2c";
    ctx.fillRect(13, 11, 37, 15);
    ctx.fillRect(48, 15, 14, 4);
    ctx.fillRect(5, 17, 10, 4);
    ctx.fillStyle = "#203318";
    ctx.fillRect(25, 7, 9, 5);
    ctx.fillRect(18, 27, 34, 3);
    ctx.fillRect(6, 5, 54, 3);
    ctx.fillStyle = "#dbe8b0";
    ctx.fillRect(16, 8, 8, 6);
  } else {
    ctx.fillStyle = "#6b757a";
    ctx.fillRect(18, 12, 30, 12);
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(24, 6);
    ctx.lineTo(62, 18);
    ctx.lineTo(24, 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#222b30";
    ctx.fillRect(34, 4, 8, 28);
    ctx.fillStyle = "#ff3d2f";
    ctx.fillRect(8, 17, 5, 4);
  }
  ctx.restore();
}

function drawLaser(laser) {
  ctx.fillStyle = "#e9ffff";
  ctx.fillRect(laser.x, laser.y + 2, laser.w, 3);
  ctx.fillStyle = "#42e7ff";
  ctx.fillRect(laser.x - 6, laser.y, laser.w + 8, laser.h);
}

function drawBomb(bomb) {
  ctx.fillStyle = "#1f2428";
  ctx.fillRect(bomb.x + 3, bomb.y, 6, 14);
  ctx.fillStyle = "#ff654d";
  ctx.fillRect(bomb.x + 2, bomb.y + 13, 8, 5);
}

function drawEnemyBullet(bullet) {
  ctx.fillStyle = "#ff1e1e";
  ctx.beginPath();
  ctx.arc(bullet.x + bullet.w * 0.5, bullet.y + bullet.h * 0.5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 236, 84, 0.75)";
  ctx.beginPath();
  ctx.arc(bullet.x + bullet.w * 0.5, bullet.y + bullet.h * 0.5, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuilding(building) {
  ctx.fillStyle = building.color;
  ctx.fillRect(building.x, building.y, building.w, building.h);
  ctx.fillStyle = "#4c2f2a";
  ctx.fillRect(building.x - 5, building.y - 16, building.w + 10, 16);
  ctx.fillStyle = "#ffe08a";
  for (let y = building.y + 18; y < H - 22; y += 28) {
    for (let x = building.x + 11; x < building.x + building.w - 12; x += 24) {
      if ((x + y) % 3 > 0.7) ctx.fillRect(x, y, 9, 12);
    }
  }
}

function drawBursts() {
  for (const p of bursts) {
    ctx.globalAlpha = Math.max(0, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
  }
  ctx.globalAlpha = 1;
}

function drawGameOver() {
  ctx.fillStyle = "rgba(10, 18, 26, 0.72)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f4fbff";
  ctx.textAlign = "center";
  ctx.font = "700 48px Segoe UI, Arial";
  ctx.fillText("Flight Master Down", W / 2, H / 2 - 22);
  ctx.font = "22px Segoe UI, Arial";
  ctx.fillText(`Final score: ${score}   Damage: ${Math.floor(damage)}`, W / 2, H / 2 + 20);
  ctx.fillText("Press R or Restart", W / 2, H / 2 + 56);
  ctx.textAlign = "left";
}

function frame(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  startFlightMusic();
  if (key === "m") {
    toggleFlightSound();
    return;
  }
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "spacebar"].includes(key)) {
    event.preventDefault();
  }
  if (key === "r") resetGame();
  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("pointerdown", () => {
  startFlightMusic();
  fireLaser();
  canvas.focus();
});

restartButton.addEventListener("click", () => {
  startFlightMusic();
  resetGame();
});

resetGame();
requestAnimationFrame(frame);
