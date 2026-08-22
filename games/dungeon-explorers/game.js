const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#startButton");
const scoreEl = document.querySelector("#score");
const coinsEl = document.querySelector("#coins");
const waveEl = document.querySelector("#wave");
const healthEl = document.querySelector("#health");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const keys = new Set();

let state;
let lastTime = 0;
let animationId = 0;
let nextEnemyId = 1;
let nextMissileId = 1;

function resetGame() {
  state = {
    running: true,
    paused: false,
    gameOver: false,
    level: 1,
    score: 0,
    coins: 0,
    wave: 1,
    waveTimer: 0,
    spawnTimer: 0,
    hitCooldown: 0,
    player: {
      x: WIDTH / 2,
      y: HEIGHT / 2 + 85,
      size: 34,
      speed: 235,
      health: 5,
      facingX: 1,
      facingY: 0,
      attackTimer: 0,
      attackCooldown: 0,
      hitIds: new Set(),
    },
    coinsList: [],
    enemies: [],
    cars: [],
    missiles: [],
    sparks: [],
    levelMessage: "",
    levelMessageTimer: 0,
  };

  nextEnemyId = 1;
  nextMissileId = 1;
  for (let i = 0; i < 7; i += 1) spawnCoin();
  overlay.classList.add("hidden");
  updateHud();
  lastTime = performance.now();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
}

function startLevelTwo() {
  state.level = 2;
  state.wave = 2;
  state.waveTimer = 0;
  state.spawnTimer = 1;
  state.enemies = [];
  state.missiles = [];
  state.cars = [];
  state.levelMessage = "LEVEL 2";
  state.levelMessageTimer = 2.2;
  state.player.x = WIDTH / 2;
  state.player.y = HEIGHT - 86;
  state.player.facingX = 1;
  state.player.facingY = 0;

  for (let i = 0; i < 3; i += 1) spawnCar();
  for (let i = state.coinsList.length; i < 7; i += 1) spawnCoin();
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function spawnCoin() {
  state.coinsList.push({
    x: rand(90, WIDTH - 90),
    y: rand(135, HEIGHT - 64),
    r: 15,
    bob: rand(0, Math.PI * 2),
  });
}

function spawnEnemy() {
  const edge = Math.floor(rand(0, 4));
  const enemy = {
    id: nextEnemyId,
    x: edge === 0 ? -30 : edge === 1 ? WIDTH + 30 : rand(60, WIDTH - 60),
    y: edge === 2 ? -30 : edge === 3 ? HEIGHT + 30 : rand(115, HEIGHT - 45),
    size: 31,
    speed: 82 + state.wave * 10 + rand(-5, 14),
    wobble: rand(0, Math.PI * 2),
  };
  nextEnemyId += 1;
  state.enemies.push(enemy);
}

function spawnCar() {
  const laneY = rand(145, 310);
  const fromLeft = Math.random() > 0.5;
  state.cars.push({
    x: fromLeft ? -90 : WIDTH + 90,
    y: laneY,
    speed: (fromLeft ? 1 : -1) * rand(48, 78),
    fireTimer: rand(0.6, 1.7),
  });
}

function fireMissile(car) {
  const p = state.player;
  const startX = car.x + (car.speed > 0 ? 54 : -54);
  const startY = car.y + 6;
  const angle = Math.atan2(p.y - startY, p.x - startX);
  state.missiles.push({
    id: nextMissileId,
    x: startX,
    y: startY,
    vx: Math.cos(angle) * 175,
    vy: Math.sin(angle) * 175,
    hp: 2,
    angle,
    spin: 0,
  });
  nextMissileId += 1;
}

function updateHud() {
  scoreEl.textContent = Math.floor(state.score);
  coinsEl.textContent = state.coins;
  waveEl.textContent = state.level === 1 ? "Wave 1" : "2";
  healthEl.textContent = Math.max(0, getHealth());
}

function getHealth() {
  return state.player.health ?? 5;
}

function setHealth(value) {
  state.player.health = value;
  healthEl.textContent = Math.max(0, value);
}

function loop(now) {
  const dt = Math.max(0, Math.min(0.033, (now - lastTime) / 1000));
  lastTime = now;

  if (state.running && !state.paused) update(dt);
  draw();
  animationId = requestAnimationFrame(loop);
}

function update(dt) {
  const p = state.player;
  let dx = 0;
  let dy = 0;

  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (dx || dy) {
    const length = Math.hypot(dx, dy);
    p.facingX = dx / length;
    p.facingY = dy / length;
    p.x += (dx / length) * p.speed * dt;
    p.y += (dy / length) * p.speed * dt;
  }

  p.x = Math.max(42, Math.min(WIDTH - 42, p.x));
  p.y = Math.max(124, Math.min(HEIGHT - 38, p.y));

  state.waveTimer += dt;
  state.spawnTimer -= dt;
  state.hitCooldown = Math.max(0, state.hitCooldown - dt);
  state.levelMessageTimer = Math.max(0, state.levelMessageTimer - dt);
  p.attackTimer = Math.max(0, p.attackTimer - dt);
  p.attackCooldown = Math.max(0, p.attackCooldown - dt);

  if (state.level === 1) updateWaveOne(dt);
  if (state.level === 2) updateLevelTwo(dt);

  if (p.attackTimer > 0) {
    slashEnemies(p);
    slashMissiles(p);
  }

  updateCoins(dt);

  state.score += dt * 12;
  state.sparks = state.sparks.filter((spark) => {
    spark.life -= dt;
    return spark.life > 0;
  });
  updateHud();
}

function updateWaveOne(dt) {
  if (state.waveTimer > 18) {
    state.waveTimer = 0;
    for (let i = 0; i < 3; i += 1) spawnEnemy();
  }

  if (state.spawnTimer <= 0) {
    spawnEnemy();
    state.spawnTimer = 1.55;
  }

  state.enemies.forEach((enemy) => {
    const p = state.player;
    const angle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
    enemy.wobble += dt * 8;
    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;

    if (dist(p, enemy) < 30 && state.hitCooldown <= 0) {
      damagePlayer();
    }
  });
}

function updateLevelTwo(dt) {
  const p = state.player;

  if (state.spawnTimer <= 0 && state.cars.length < 5) {
    spawnCar();
    state.spawnTimer = 4.5;
  }

  state.cars.forEach((car) => {
    car.x += car.speed * dt;
    if (car.x < -115) car.x = WIDTH + 105;
    if (car.x > WIDTH + 115) car.x = -105;
    car.fireTimer -= dt;
    if (car.fireTimer <= 0) {
      fireMissile(car);
      car.fireTimer = Math.max(0.65, 1.9 - state.coins * 0.025 + rand(-0.2, 0.35));
    }
  });

  for (let i = state.missiles.length - 1; i >= 0; i -= 1) {
    const missile = state.missiles[i];
    missile.x += missile.vx * dt;
    missile.y += missile.vy * dt;
    missile.spin += dt * 10;
    missile.angle = Math.atan2(missile.vy, missile.vx);

    if (missile.x < -70 || missile.x > WIDTH + 70 || missile.y < -70 || missile.y > HEIGHT + 70) {
      state.missiles.splice(i, 1);
      continue;
    }

    if (Math.hypot(p.x - missile.x, p.y - missile.y) < 34) {
      state.missiles.splice(i, 1);
      damagePlayer();
    }
  }
}

function damagePlayer() {
  if (state.hitCooldown > 0) return;
  setHealth(getHealth() - 1);
  state.hitCooldown = 1.05;
  state.sparks.push({ x: state.player.x, y: state.player.y, life: 0.35, color: "#ff4f4f" });
  if (getHealth() <= 0) endGame();
}

function slashEnemies(p) {
  if (state.level !== 1) return;
  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    if (p.hitIds.has(`enemy-${enemy.id}`)) continue;

    const toEnemyX = enemy.x - p.x;
    const toEnemyY = enemy.y - p.y;
    const reach = Math.hypot(toEnemyX, toEnemyY);
    const alignment = (toEnemyX * p.facingX + toEnemyY * p.facingY) / Math.max(1, reach);

    if (reach < 88 && alignment > 0.26) {
      p.hitIds.add(`enemy-${enemy.id}`);
      state.enemies.splice(i, 1);
      state.score += 45;
      state.sparks.push({ x: enemy.x, y: enemy.y, life: 0.4, color: "#d8f1ff" });
    }
  }
}

function slashMissiles(p) {
  if (state.level !== 2) return;
  for (let i = state.missiles.length - 1; i >= 0; i -= 1) {
    const missile = state.missiles[i];
    if (p.hitIds.has(`missile-${missile.id}`)) continue;

    const toMissileX = missile.x - p.x;
    const toMissileY = missile.y - p.y;
    const reach = Math.hypot(toMissileX, toMissileY);
    const alignment = (toMissileX * p.facingX + toMissileY * p.facingY) / Math.max(1, reach);

    if (reach < 98 && alignment > 0.12) {
      p.hitIds.add(`missile-${missile.id}`);
      missile.hp -= 1;
      state.sparks.push({
        x: missile.x,
        y: missile.y,
        life: 0.36,
        color: missile.hp > 0 ? "#ffdf4a" : "#d8f1ff",
      });

      if (missile.hp <= 0) {
        state.missiles.splice(i, 1);
        state.score += 80;
      }
    }
  }
}

function updateCoins(dt) {
  const p = state.player;
  for (let i = state.coinsList.length - 1; i >= 0; i -= 1) {
    const coin = state.coinsList[i];
    coin.bob += dt * 4;
    if (dist(p, coin) < 34) {
      state.coinsList.splice(i, 1);
      state.coins += 1;
      state.score += 100 + state.wave * 10;
      state.sparks.push({ x: coin.x, y: coin.y, life: 0.45, color: "#ffd84a" });
      spawnCoin();
      if (state.level === 1 && state.coins >= 8) startLevelTwo();
      updateHud();
    }
  }
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  overlay.classList.remove("hidden");
  overlay.querySelector("h1").textContent = "RUN ENDED";
  overlay.querySelector("p").textContent = `Final score: ${Math.floor(state.score)} | Coins: ${state.coins} | Level: ${state.level}`;
  startButton.textContent = "Restart";
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawDungeon();
  state.coinsList.forEach(drawCoin);
  state.cars.forEach(drawCar);
  state.missiles.forEach(drawMissile);
  state.enemies.forEach(drawEnemy);
  drawPlayer(state.player);
  state.sparks.forEach(drawSpark);
  drawLevelMessage();

  if (state.paused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff1c2";
    ctx.font = "700 44px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", WIDTH / 2, HEIGHT / 2);
    ctx.textAlign = "left";
  }
}

function drawDungeon() {
  const wall = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  wall.addColorStop(0, "#111012");
  wall.addColorStop(0.5, "#272325");
  wall.addColorStop(1, "#0d0b0c");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#343034";
  for (let y = 10; y < 360; y += 28) {
    for (let x = (y / 28) % 2 ? -26 : 0; x < WIDTH; x += 52) {
      ctx.fillRect(x, y, 50, 2);
      ctx.fillRect(x, y, 2, 28);
    }
  }

  ctx.fillStyle = "#201d20";
  ctx.fillRect(310, 62, 340, 292);
  ctx.fillStyle = "#3b373a";
  ctx.fillRect(336, 42, 288, 30);
  ctx.fillRect(326, 72, 308, 18);
  ctx.fillRect(356, 94, 248, 190);
  ctx.fillStyle = "#161416";
  ctx.fillRect(387, 118, 186, 166);
  ctx.strokeStyle = "#50494b";
  ctx.lineWidth = 4;
  ctx.strokeRect(387, 118, 186, 166);

  ctx.fillStyle = "#2a1712";
  ctx.fillRect(455, 159, 50, 86);
  ctx.strokeStyle = "#7c3521";
  ctx.strokeRect(455, 159, 50, 86);
  ctx.fillStyle = "#d0672a";
  ctx.fillRect(495, 198, 6, 6);

  ctx.fillStyle = "#2b2524";
  ctx.fillRect(0, 352, WIDTH, 188);
  ctx.fillStyle = "#493325";
  for (let x = 0; x < WIDTH; x += 58) {
    ctx.fillRect(x, 380, 54, 4);
    ctx.fillRect(x + 8, 442, 54, 4);
    ctx.fillRect(x + 28, 498, 54, 4);
  }

  drawTorch(86, 238);
  drawTorch(812, 240);
  ctx.fillStyle = "rgba(240, 94, 26, 0.14)";
  ctx.fillRect(0, 338, WIDTH, 25);
}

function drawTorch(x, y) {
  ctx.fillStyle = "#3a2720";
  ctx.fillRect(x - 5, y, 10, 68);
  ctx.fillStyle = "#8c4724";
  ctx.fillRect(x - 18, y + 14, 36, 8);
  ctx.fillStyle = "rgba(255, 89, 22, 0.22)";
  ctx.beginPath();
  ctx.arc(x, y + 4, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffcf4a";
  ctx.fillRect(x - 7, y - 20, 14, 24);
  ctx.fillStyle = "#ff6b1f";
  ctx.fillRect(x - 12, y - 10, 24, 28);
}

function drawPlayer(p) {
  const x = Math.round(p.x - 18);
  const y = Math.round(p.y - 31);
  drawSword(p);
  ctx.fillStyle = state.hitCooldown > 0 ? "#ffd8d8" : "#fff4e4";
  ctx.fillRect(x + 7, y + 30, 28, 36);
  ctx.fillRect(x + 5, y + 62, 12, 24);
  ctx.fillRect(x + 25, y + 62, 12, 24);
  ctx.fillStyle = "#ffd5a5";
  ctx.fillRect(x + 4, y + 10, 34, 26);
  ctx.fillRect(x, y + 36, 6, 30);
  ctx.fillRect(x + 38, y + 36, 6, 30);
  ctx.fillStyle = "#7b4b11";
  ctx.fillRect(x + 1, y + 1, 42, 10);
  ctx.fillRect(x + 6, y - 7, 32, 8);
  ctx.fillStyle = "#111111";
  ctx.fillRect(x + 13, y + 20, 4, 9);
  ctx.fillRect(x + 27, y + 20, 4, 9);
  ctx.fillRect(x + 4, y + 85, 14, 5);
  ctx.fillRect(x + 24, y + 85, 14, 5);
  ctx.fillStyle = "#63bd4a";
  ctx.fillRect(x + 17, y + 44, 12, 10);
  ctx.strokeStyle = "#101010";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 7, y + 30, 28, 36);
}

function swingSword() {
  const p = state.player;
  if (!state.running || state.paused || p.attackCooldown > 0) return;
  p.attackTimer = 0.24;
  p.attackCooldown = 0.42;
  p.hitIds = new Set();
}

function drawSword(p) {
  const swing = p.attackTimer > 0 ? 1 - p.attackTimer / 0.24 : 0;
  const baseAngle = Math.atan2(p.facingY, p.facingX);
  const sweep = p.attackTimer > 0 ? -1.05 + swing * 2.1 : -0.35;
  const angle = baseAngle + sweep;
  const gripX = p.x + p.facingX * 18;
  const gripY = p.y - 2 + p.facingY * 14;

  ctx.save();
  ctx.translate(gripX, gripY);
  ctx.rotate(angle);

  if (p.attackTimer > 0) {
    ctx.fillStyle = "rgba(216, 241, 255, 0.22)";
    ctx.fillRect(14, -29, 76, 58);
  }

  ctx.fillStyle = "#784514";
  ctx.fillRect(-10, -4, 24, 8);
  ctx.fillRect(-5, 3, 12, 31);
  ctx.fillStyle = "#3b2b1c";
  ctx.fillRect(-7, 12, 16, 5);
  ctx.fillRect(-7, 23, 16, 5);

  ctx.fillStyle = "#b6bec5";
  ctx.fillRect(8, -15, 12, 30);
  ctx.fillRect(15, -22, 10, 44);
  ctx.fillStyle = "#eef4f6";
  ctx.fillRect(23, -16, 52, 32);
  ctx.fillRect(71, -10, 12, 20);
  ctx.fillRect(81, -5, 7, 10);
  ctx.fillStyle = "#9ca4aa";
  ctx.fillRect(23, 12, 50, 4);
  ctx.fillRect(31, -13, 6, 26);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(38, -10, 20, 4);
  ctx.fillRect(60, -5, 12, 4);
  ctx.strokeStyle = "#6f7478";
  ctx.lineWidth = 3;
  ctx.strokeRect(22, -16, 52, 32);

  ctx.restore();
}

function drawCar(car) {
  const x = Math.round(car.x - 48);
  const y = Math.round(car.y - 22);
  const facing = car.speed >= 0 ? 1 : -1;

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.scale(facing, 1);
  ctx.translate(-car.x, -car.y);

  ctx.fillStyle = "#111111";
  ctx.fillRect(x + 6, y + 36, 18, 18);
  ctx.fillRect(x + 68, y + 36, 18, 18);
  ctx.fillStyle = "#737b80";
  ctx.fillRect(x + 11, y + 41, 8, 8);
  ctx.fillRect(x + 73, y + 41, 8, 8);

  ctx.fillStyle = "#e81736";
  ctx.fillRect(x + 4, y + 20, 82, 26);
  ctx.fillRect(x + 20, y + 4, 44, 22);
  ctx.fillRect(x + 80, y + 27, 14, 18);
  ctx.fillStyle = "#ff3350";
  ctx.fillRect(x + 12, y + 18, 42, 8);
  ctx.fillStyle = "#b6eff7";
  ctx.fillRect(x + 26, y + 8, 18, 14);
  ctx.fillRect(x + 48, y + 8, 13, 14);
  ctx.fillStyle = "#ffe757";
  ctx.fillRect(x + 1, y + 32, 8, 8);
  ctx.fillStyle = "#111111";
  ctx.fillRect(x + 46, y + 30, 4, 4);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 4, y + 20, 82, 26);
  ctx.strokeRect(x + 20, y + 4, 44, 22);

  ctx.restore();
}

function drawMissile(missile) {
  ctx.save();
  ctx.translate(missile.x, missile.y);
  ctx.rotate(missile.angle + Math.PI / 2);

  ctx.fillStyle = missile.hp === 1 ? "#ffdf4a" : "#e81736";
  ctx.fillRect(-10, -31, 20, 23);
  ctx.fillStyle = "#bd0928";
  ctx.fillRect(-7, -40, 14, 13);
  ctx.fillRect(-4, -47, 8, 8);
  ctx.fillStyle = "#333f35";
  ctx.fillRect(-12, -8, 24, 40);
  ctx.fillStyle = "#efdf7a";
  ctx.fillRect(-13, -6, 5, 31);
  ctx.fillRect(8, -6, 5, 31);
  ctx.fillStyle = "#111111";
  ctx.fillRect(-21, 24, 15, 10);
  ctx.fillRect(6, 24, 15, 10);
  ctx.fillStyle = "#ffdf31";
  ctx.fillRect(-7, 33, 14, 14);
  ctx.fillStyle = "#ff5b18";
  ctx.fillRect(-11, 43, 22, 10);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-4, -21, 4, 16);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 3;
  ctx.strokeRect(-12, -8, 24, 40);

  ctx.restore();
}

function drawLevelMessage() {
  if (state.levelMessageTimer <= 0) return;
  ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.42, state.levelMessageTimer * 0.24)})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#fff1c2";
  ctx.font = "800 56px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(state.levelMessage, WIDTH / 2, HEIGHT / 2 - 18);
  ctx.fillStyle = "#ffdf4a";
  ctx.font = "700 24px Segoe UI";
  ctx.fillText("Slash each missile twice!", WIDTH / 2, HEIGHT / 2 + 28);
  ctx.textAlign = "left";
}

function drawEnemy(enemy) {
  const x = Math.round(enemy.x - 18);
  const y = Math.round(enemy.y - 29 + Math.sin(enemy.wobble) * 2);
  ctx.fillStyle = "#ffe06b";
  ctx.fillRect(x + 6, y - 5, 28, 14);
  ctx.fillStyle = "#ffd2a3";
  ctx.fillRect(x + 4, y + 8, 34, 27);
  ctx.fillStyle = "#e94d31";
  ctx.fillRect(x + 3, y + 36, 36, 26);
  ctx.fillStyle = "#19243b";
  ctx.fillRect(x + 7, y + 62, 12, 17);
  ctx.fillRect(x + 24, y + 62, 12, 17);
  ctx.fillStyle = "#111111";
  ctx.fillRect(x + 13, y + 19, 4, 8);
  ctx.fillRect(x + 27, y + 19, 4, 8);
  ctx.fillRect(x + 17, y + 32, 9, 4);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 4, y + 8, 34, 27);
}

function drawCoin(coin) {
  const bob = Math.sin(coin.bob) * 3;
  const x = Math.round(coin.x);
  const y = Math.round(coin.y + bob);
  ctx.fillStyle = "#7b3812";
  ctx.fillRect(x - 17, y - 12, 34, 24);
  ctx.fillStyle = "#ffbe18";
  ctx.fillRect(x - 20, y - 8, 40, 16);
  ctx.fillRect(x - 14, y - 18, 28, 36);
  ctx.fillStyle = "#ffdf3b";
  ctx.fillRect(x - 9, y - 13, 19, 27);
  ctx.fillStyle = "#fff6b4";
  ctx.fillRect(x - 11, y - 12, 5, 14);
  ctx.fillRect(x - 1, y - 2, 6, 18);
}

function drawSpark(spark) {
  ctx.fillStyle = spark.color;
  ctx.globalAlpha = Math.max(0, spark.life * 2.4);
  ctx.fillRect(spark.x - 18, spark.y - 18, 36, 7);
  ctx.fillRect(spark.x - 4, spark.y - 26, 8, 52);
  ctx.globalAlpha = 1;
}

startButton.addEventListener("click", () => {
  overlay.querySelector("h1").textContent = "DUNGEON EXPLORERS";
  overlay.querySelector("p").textContent = "Collect 8 coins to beat Wave One. Then survive the cars.";
  startButton.textContent = "Start Run";
  resetGame();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
    event.preventDefault();
  }
  if (key === " " && state?.running) state.paused = !state.paused;
  if (key === "f") swingSword();
  if (key === "r") resetGame();
  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

state = {
  running: false,
  paused: false,
  level: 1,
  score: 0,
  coins: 0,
  wave: 1,
  hitCooldown: 0,
  player: {
    x: WIDTH / 2,
    y: HEIGHT / 2 + 85,
    size: 34,
    speed: 235,
    health: 5,
    facingX: 1,
    facingY: 0,
    attackTimer: 0,
    attackCooldown: 0,
    hitIds: new Set(),
  },
  coinsList: [],
  enemies: [],
  cars: [],
  missiles: [],
  sparks: [],
  levelMessage: "",
  levelMessageTimer: 0,
};
draw();
