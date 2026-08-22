const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#startButton");
const healthText = document.querySelector("#healthText");
const healthBar = document.querySelector("#healthBar");
const echoText = document.querySelector("#echoText");
const echoBar = document.querySelector("#echoBar");
const riftText = document.querySelector("#riftText");
const enemyText = document.querySelector("#enemyText");
const eventText = document.querySelector("#eventText");
const shardButtons = [...document.querySelectorAll(".shard")];
const helpButton = document.querySelector("#helpButton");
const helpPanel = document.querySelector("#helpPanel");
const closeHelp = document.querySelector("#closeHelp");

const keys = new Set();
const pointer = { x: 640, y: 360, down: false };
const world = { width: 2600, height: 1600 };
const camera = { x: 0, y: 0 };

const shardData = {
  fire: { color: "#ff6b35", glow: "rgba(255, 107, 53, 0.34)", damage: 26, speed: 1, cooldown: 210 },
  storm: { color: "#4ed9ff", glow: "rgba(78, 217, 255, 0.34)", damage: 18, speed: 1.22, cooldown: 140 },
  void: { color: "#9d72ff", glow: "rgba(157, 114, 255, 0.34)", damage: 34, speed: 0.86, cooldown: 320 },
  life: { color: "#77e17f", glow: "rgba(119, 225, 127, 0.28)", damage: 15, speed: 1, cooldown: 260 }
};

const islands = [
  { x: 270, y: 310, rx: 270, ry: 125, hue: "#485a61" },
  { x: 820, y: 260, rx: 300, ry: 138, hue: "#4b684f" },
  { x: 1320, y: 510, rx: 360, ry: 152, hue: "#665a4a" },
  { x: 1910, y: 300, rx: 310, ry: 135, hue: "#3f6570" },
  { x: 2170, y: 850, rx: 325, ry: 145, hue: "#62506d" },
  { x: 1540, y: 1040, rx: 350, ry: 155, hue: "#436852" },
  { x: 870, y: 980, rx: 320, ry: 142, hue: "#68544b" },
  { x: 360, y: 1220, rx: 285, ry: 128, hue: "#3e6172" }
];

let running = false;
let last = 0;
let spawnTimer = 0;
let eventTimer = 0;
let attackTimer = 0;
let riftIntegrity = 100;
let currentEvent = "Stable";
let activeShard = "fire";
let firstPerson = false;
let message = "Attune shards. Break the rifts.";
let messageTimer = 4;

const player = {
  x: 340,
  y: 300,
  z: 0,
  r: 22,
  vx: 0,
  vy: 0,
  vz: 0,
  hp: 100,
  echo: 0,
  dash: 0,
  invuln: 0,
  pulse: 0
};

let enemies = [];
let projectiles = [];
let particles = [];
let pickups = [];
let rifts = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function dist(a, b, c, d) {
  return Math.hypot(a - c, b - d);
}

function onIsland(x, y, pad = 0) {
  return islands.some((island) => {
    const dx = (x - island.x) / (island.rx + pad);
    const dy = (y - island.y) / (island.ry + pad);
    return dx * dx + dy * dy <= 1;
  });
}

function randomIslandPoint() {
  const island = islands[Math.floor(Math.random() * islands.length)];
  const angle = rand(0, Math.PI * 2);
  const radius = Math.sqrt(Math.random()) * 0.72;
  return {
    x: island.x + Math.cos(angle) * island.rx * radius,
    y: island.y + Math.sin(angle) * island.ry * radius
  };
}

function resetGame() {
  player.x = 340;
  player.y = 300;
  player.z = 0;
  player.vx = 0;
  player.vy = 0;
  player.vz = 0;
  player.hp = 100;
  player.echo = 15;
  player.dash = 0;
  player.invuln = 0;
  player.pulse = 0;
  riftIntegrity = 100;
  activeShard = "fire";
  currentEvent = "Stable";
  eventTimer = 0;
  spawnTimer = 0;
  attackTimer = 0;
  message = "Reality fractures across Aetherion.";
  messageTimer = 3.4;
  enemies = [];
  projectiles = [];
  particles = [];
  pickups = [];
  rifts = Array.from({ length: 4 }, () => ({ ...randomIslandPoint(), hp: 80, phase: rand(0, 10) }));
  for (let i = 0; i < 7; i += 1) spawnEnemy();
  updateShardButtons();
}

function spawnEnemy() {
  const point = randomIslandPoint();
  const type = Math.random() > 0.76 ? "colossus" : Math.random() > 0.48 ? "wraith" : "beast";
  enemies.push({
    x: point.x,
    y: point.y,
    r: type === "colossus" ? 30 : type === "wraith" ? 17 : 21,
    hp: type === "colossus" ? 125 : type === "wraith" ? 48 : 68,
    maxHp: type === "colossus" ? 125 : type === "wraith" ? 48 : 68,
    speed: type === "colossus" ? 48 : type === "wraith" ? 105 : 72,
    type,
    hit: 0,
    bite: 0
  });
}

function setShard(shard) {
  activeShard = shard;
  message = `${shard[0].toUpperCase()}${shard.slice(1)} shard attuned`;
  messageTimer = 1.3;
  updateShardButtons();
}

function updateShardButtons() {
  shardButtons.forEach((button) => button.classList.toggle("active", button.dataset.shard === activeShard));
}

function createParticles(x, y, color, amount, force = 1) {
  for (let i = 0; i < amount; i += 1) {
    const angle = rand(0, Math.PI * 2);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * rand(40, 180) * force,
      vy: Math.sin(angle) * rand(40, 180) * force,
      life: rand(0.35, 0.9),
      maxLife: rand(0.45, 0.95),
      size: rand(2, 6),
      color
    });
  }
}

function pointerWorld() {
  if (!firstPerson) {
    return { x: pointer.x + camera.x, y: pointer.y + camera.y };
  }

  return {
    x: player.x + (pointer.x - canvas.width / 2) / 1.85,
    y: player.y + (pointer.y - canvas.height * 0.62) / 1.85
  };
}

function strike() {
  if (attackTimer > 0) return;
  const shard = shardData[activeShard];
  attackTimer = shard.cooldown / 1000;
  const target = pointerWorld();
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  const range = activeShard === "void" ? 135 : activeShard === "storm" ? 115 : 100;
  const damage = shard.damage + player.echo * 0.04;

  createParticles(player.x + Math.cos(angle) * 34, player.y + Math.sin(angle) * 34, shard.color, 16, 1.1);

  if (activeShard === "fire" || activeShard === "storm") {
    projectiles.push({
      x: player.x + Math.cos(angle) * 28,
      y: player.y + Math.sin(angle) * 28,
      vx: Math.cos(angle) * (activeShard === "storm" ? 680 : 520),
      vy: Math.sin(angle) * (activeShard === "storm" ? 680 : 520),
      r: activeShard === "storm" ? 8 : 12,
      life: activeShard === "storm" ? 0.42 : 0.58,
      damage,
      color: shard.color,
      shard: activeShard
    });
  }

  enemies.forEach((enemy) => {
    const d = dist(player.x, player.y, enemy.x, enemy.y);
    if (d < range + enemy.r) {
      const push = activeShard === "void" ? 260 : 150;
      enemy.hp -= damage;
      enemy.hit = 0.18;
      enemy.x += Math.cos(angle) * push * 0.08;
      enemy.y += Math.sin(angle) * push * 0.08;
      createParticles(enemy.x, enemy.y, shard.color, 12);
      if (activeShard === "life") player.hp = Math.min(100, player.hp + 3.5);
    }
  });

  rifts.forEach((rift) => {
    if (dist(player.x, player.y, rift.x, rift.y) < range + 34) {
      rift.hp -= damage * 0.74;
      createParticles(rift.x, rift.y, shard.color, 18, 1.2);
    }
  });
}

function pulse() {
  if (player.echo < 25 || player.pulse > 0) return;
  player.echo -= 25;
  player.pulse = 0.42;
  const shard = shardData[activeShard];
  createParticles(player.x, player.y, shard.color, 42, 1.8);

  enemies.forEach((enemy) => {
    const d = dist(player.x, player.y, enemy.x, enemy.y);
    if (d < 230) {
      enemy.hp -= activeShard === "void" ? 56 : 38;
      enemy.hit = 0.22;
      enemy.x += ((enemy.x - player.x) / Math.max(d, 1)) * 34;
      enemy.y += ((enemy.y - player.y) / Math.max(d, 1)) * 34;
    }
  });

  if (activeShard === "life") {
    player.hp = Math.min(100, player.hp + 22);
  }
}

function jump() {
  if (player.z > 0 || !onIsland(player.x, player.y, 18)) return;
  player.vz = 620;
  player.z = 1;
  message = "Shard leap";
  messageTimer = 0.9;
  createParticles(player.x, player.y, shardData[activeShard].color, 18, 1.15);
}

function update(dt) {
  if (!running) return;
  const shard = shardData[activeShard];
  const slow = currentEvent === "Gravity Surge" ? 0.76 : 1;
  const haste = currentEvent === "Stormglass Rain" ? 1.1 : 1;
  const airBoost = player.z > 0 ? 1.16 : 1;
  const speed = 255 * shard.speed * slow * haste * airBoost;
  let mx = 0;
  let my = 0;

  if (keys.has("w") || keys.has("arrowup")) my -= 1;
  if (keys.has("s") || keys.has("arrowdown")) my += 1;
  if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
  if (keys.has("d") || keys.has("arrowright")) mx += 1;

  const len = Math.hypot(mx, my) || 1;
  player.vx += (mx / len) * speed * dt * 8;
  player.vy += (my / len) * speed * dt * 8;
  player.vx *= Math.pow(0.001, dt);
  player.vy *= Math.pow(0.001, dt);

  if (keys.has("shift") && player.dash <= 0 && player.echo >= 10 && (mx || my)) {
    player.vx += (mx / len) * 760;
    player.vy += (my / len) * 760;
    player.dash = 0.72;
    player.echo -= 10;
    createParticles(player.x, player.y, shard.color, 24, 1.3);
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.z += player.vz * dt;
  player.vz -= 1350 * dt;

  if (player.z <= 0) {
    if (player.vz < -180) {
      createParticles(player.x, player.y, shard.color, 12, 0.8);
    }
    player.z = 0;
    player.vz = 0;
  }

  if (player.z <= 0 && !onIsland(player.x, player.y, 16)) {
    player.x -= player.vx * dt * 1.1;
    player.y -= player.vy * dt * 1.1;
    player.vx *= -0.18;
    player.vy *= -0.18;
    player.hp -= dt * 4;
  }

  player.x = Math.max(70, Math.min(world.width - 70, player.x));
  player.y = Math.max(70, Math.min(world.height - 70, player.y));
  player.dash = Math.max(0, player.dash - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  player.pulse = Math.max(0, player.pulse - dt);
  attackTimer = Math.max(0, attackTimer - dt);
  messageTimer = Math.max(0, messageTimer - dt);

  if (pointer.down) strike();

  updateEnemies(dt);
  updateProjectiles(dt);
  updateRifts(dt);
  updatePickups(dt);
  updateParticles(dt);
  updateEvents(dt);

  camera.x += (player.x - canvas.width / 2 - camera.x) * Math.min(1, dt * 6);
  camera.y += (player.y - canvas.height / 2 - camera.y) * Math.min(1, dt * 6);
  camera.x = Math.max(0, Math.min(world.width - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(world.height - canvas.height, camera.y));

  if (player.hp <= 0 || riftIntegrity <= 0) {
    running = false;
    overlay.classList.remove("hidden");
    overlay.querySelector("h2").textContent = "Realm Collapsed";
    overlay.querySelector("p").textContent = "The Echo Shards cracked beyond recovery. Begin another run and break the timeline beasts faster.";
    startButton.textContent = "Try Again";
  }

  if (rifts.length === 0) {
    running = false;
    overlay.classList.remove("hidden");
    overlay.querySelector("h2").textContent = "Realm Restored";
    overlay.querySelector("p").textContent = "The fallen shards are sealed. Aetherion holds together for one more impossible dawn.";
    startButton.textContent = "Run It Back";
  }
}

function updateEnemies(dt) {
  spawnTimer -= dt;
  if (spawnTimer <= 0 && enemies.length < 16) {
    spawnEnemy();
    spawnTimer = rand(2.6, 4.6);
  }

  enemies.forEach((enemy) => {
    const d = dist(enemy.x, enemy.y, player.x, player.y);
    const pull = currentEvent === "Echo Inversion" ? -1 : 1;
    enemy.x += ((player.x - enemy.x) / Math.max(d, 1)) * enemy.speed * dt * pull;
    enemy.y += ((player.y - enemy.y) / Math.max(d, 1)) * enemy.speed * dt * pull;
    enemy.hit = Math.max(0, enemy.hit - dt);
    enemy.bite = Math.max(0, enemy.bite - dt);

    if (!onIsland(enemy.x, enemy.y, 8)) {
      const point = randomIslandPoint();
      enemy.x += (point.x - enemy.x) * dt;
      enemy.y += (point.y - enemy.y) * dt;
    }

    if (player.z <= 12 && d < enemy.r + player.r + 4 && player.invuln <= 0 && enemy.bite <= 0) {
      player.hp -= enemy.type === "colossus" ? 18 : 10;
      player.invuln = 0.55;
      enemy.bite = 0.8;
      createParticles(player.x, player.y, "#ff4778", 16, 1.2);
    }
  });

  enemies = enemies.filter((enemy) => {
    if (enemy.hp > 0) return true;
    player.echo = Math.min(100, player.echo + (enemy.type === "colossus" ? 18 : 9));
    pickups.push({ x: enemy.x, y: enemy.y, r: 9, life: 7, kind: Math.random() > 0.65 ? "heart" : "echo" });
    createParticles(enemy.x, enemy.y, "#f7f1df", 22, 1.4);
    return false;
  });
}

function updateProjectiles(dt) {
  projectiles.forEach((shot) => {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;

    enemies.forEach((enemy) => {
      if (enemy.hp > 0 && dist(shot.x, shot.y, enemy.x, enemy.y) < shot.r + enemy.r) {
        enemy.hp -= shot.damage;
        enemy.hit = 0.16;
        shot.life = 0;
        createParticles(shot.x, shot.y, shot.color, 14, 1.2);
      }
    });

    rifts.forEach((rift) => {
      if (dist(shot.x, shot.y, rift.x, rift.y) < shot.r + 28) {
        rift.hp -= shot.damage * 0.65;
        shot.life = 0;
        createParticles(shot.x, shot.y, shot.color, 16, 1.3);
      }
    });
  });

  projectiles = projectiles.filter((shot) => shot.life > 0 && onIsland(shot.x, shot.y, 90));
}

function updateRifts(dt) {
  rifts.forEach((rift) => {
    rift.phase += dt * 2;
    riftIntegrity -= dt * 0.22;
    if (currentEvent === "Rift Bloom") riftIntegrity -= dt * 0.34;
  });

  rifts = rifts.filter((rift) => {
    if (rift.hp > 0) return true;
    player.echo = Math.min(100, player.echo + 24);
    riftIntegrity = Math.min(100, riftIntegrity + 12);
    message = "Rift sealed";
    messageTimer = 1.8;
    createParticles(rift.x, rift.y, "#ffe083", 48, 2);
    return false;
  });
}

function updatePickups(dt) {
  pickups.forEach((pickup) => {
    pickup.life -= dt;
    if (dist(player.x, player.y, pickup.x, pickup.y) < player.r + pickup.r + 8) {
      pickup.life = 0;
      if (pickup.kind === "heart") player.hp = Math.min(100, player.hp + 13);
      else player.echo = Math.min(100, player.echo + 12);
      createParticles(pickup.x, pickup.y, pickup.kind === "heart" ? "#77e17f" : "#4ed9ff", 12);
    }
  });
  pickups = pickups.filter((pickup) => pickup.life > 0);
}

function updateParticles(dt) {
  particles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.08, dt);
    p.vy *= Math.pow(0.08, dt);
    p.life -= dt;
  });
  particles = particles.filter((p) => p.life > 0);
}

function updateEvents(dt) {
  eventTimer -= dt;
  if (eventTimer > 0) return;
  const events = ["Stable", "Gravity Surge", "Stormglass Rain", "Echo Inversion", "Rift Bloom"];
  currentEvent = events[Math.floor(Math.random() * events.length)];
  eventTimer = rand(7, 12);
  message = currentEvent === "Stable" ? "The realm steadies" : currentEvent;
  messageTimer = 2.3;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSky();
  ctx.save();
  if (firstPerson) {
    ctx.translate(canvas.width / 2, canvas.height * 0.62);
    ctx.scale(1.85, 1.85);
    ctx.translate(-player.x, -player.y);
  } else {
    ctx.translate(-camera.x, -camera.y);
  }
  drawWorld();
  drawRifts();
  drawPickups();
  drawProjectiles();
  drawEnemies();
  drawPlayer();
  drawParticles();
  ctx.restore();
  if (firstPerson) drawFirstPersonOverlay();
  drawMessage();
  updateHud();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#10141b");
  gradient.addColorStop(0.45, "#252337");
  gradient.addColorStop(1, "#162522");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 70; i += 1) {
    const x = (i * 173 + performance.now() * 0.012) % canvas.width;
    const y = (i * 89) % canvas.height;
    ctx.fillStyle = i % 3 ? "#f7f1df" : "#4ed9ff";
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawWorld() {
  islands.forEach((island, index) => {
    ctx.save();
    ctx.translate(island.x, island.y + Math.sin(performance.now() / 900 + index) * 6);
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(20, 34, island.rx * 0.95, island.ry * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(-island.rx * 0.2, -island.ry * 0.4, 20, 0, 0, island.rx);
    grad.addColorStop(0, "#8a947d");
    grad.addColorStop(0.45, island.hue);
    grad.addColorStop(1, "#1f2427");
    ctx.fillStyle = grad;
    ctx.strokeStyle = "rgba(247, 241, 223, 0.22)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, island.rx, island.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 224, 131, 0.2)";
    ctx.lineWidth = 1;
    for (let j = 0; j < 5; j += 1) {
      ctx.beginPath();
      ctx.moveTo(-island.rx * 0.7 + j * island.rx * 0.33, -island.ry * 0.18);
      ctx.lineTo(-island.rx * 0.45 + j * island.rx * 0.23, island.ry * 0.42);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawRifts() {
  rifts.forEach((rift) => {
    const pulseSize = 1 + Math.sin(rift.phase) * 0.08;
    ctx.save();
    ctx.translate(rift.x, rift.y);
    ctx.rotate(rift.phase * 0.45);
    ctx.shadowBlur = 28;
    ctx.shadowColor = "#9d72ff";
    ctx.strokeStyle = "#9d72ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -34 * pulseSize);
    ctx.lineTo(26 * pulseSize, 0);
    ctx.lineTo(0, 34 * pulseSize);
    ctx.lineTo(-26 * pulseSize, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(157, 114, 255, 0.18)";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#10141b";
    ctx.fillRect(-28, 42, 56, 6);
    ctx.fillStyle = "#ffe083";
    ctx.fillRect(-28, 42, 56 * Math.max(0, rift.hp / 80), 6);
    ctx.restore();
  });
}

function drawPickups() {
  pickups.forEach((pickup) => {
    ctx.fillStyle = pickup.kind === "heart" ? "#77e17f" : "#4ed9ff";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, pickup.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawProjectiles() {
  projectiles.forEach((shot) => {
    ctx.strokeStyle = shot.color;
    ctx.lineWidth = shot.r;
    ctx.lineCap = "round";
    ctx.shadowColor = shot.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(shot.x, shot.y);
    ctx.lineTo(shot.x - shot.vx * 0.025, shot.y - shot.vy * 0.025);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    const color = enemy.type === "colossus" ? "#d83a2f" : enemy.type === "wraith" ? "#9d72ff" : "#b93630";
    const ember = enemy.type === "wraith" ? "#a985ff" : "#ff8a3d";
    const scale = enemy.r / 22;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.shadowColor = ember;
    ctx.shadowBlur = enemy.hit ? 26 : 14;
    ctx.scale(scale, scale);

    ctx.fillStyle = "#171215";
    ctx.beginPath();
    ctx.ellipse(0, 29, 25, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#181011";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-15, 2);
    ctx.lineTo(-31, 14);
    ctx.lineTo(-37, 27);
    ctx.moveTo(15, 2);
    ctx.lineTo(31, 14);
    ctx.lineTo(37, 27);
    ctx.moveTo(-8, 20);
    ctx.lineTo(-13, 39);
    ctx.moveTo(8, 20);
    ctx.lineTo(14, 39);
    ctx.stroke();

    ctx.fillStyle = enemy.hit ? "#f7f1df" : color;
    ctx.beginPath();
    ctx.ellipse(0, 5, 16, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#311317";
    ctx.beginPath();
    ctx.ellipse(-7, 7, 5, 10, -0.2, 0, Math.PI * 2);
    ctx.ellipse(7, 7, 5, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = enemy.hit ? "#fff7da" : ember;
    ctx.beginPath();
    ctx.ellipse(0, -18, 12, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#160d10";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-8, -26);
    ctx.lineTo(-20, -38);
    ctx.lineTo(-30, -33);
    ctx.moveTo(8, -26);
    ctx.lineTo(20, -38);
    ctx.lineTo(30, -33);
    ctx.stroke();

    ctx.fillStyle = "#ffe083";
    ctx.fillRect(-6, -20, 4, 4);
    ctx.fillRect(3, -20, 4, 4);

    ctx.strokeStyle = "#0d0a0b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-9, -10);
    ctx.lineTo(0, -7);
    ctx.lineTo(9, -10);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#10141b";
    ctx.fillRect(-22, 48, 44, 4);
    ctx.fillStyle = ember;
    ctx.fillRect(-22, 48, 44 * Math.max(0, enemy.hp / enemy.maxHp), 4);
    ctx.restore();
  });
}

function drawPlayer() {
  const shard = shardData[activeShard];
  const flash = player.invuln > 0 && Math.floor(player.invuln * 18) % 2 === 0;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = `rgba(0, 0, 0, ${player.z > 0 ? 0.14 : 0.24})`;
  ctx.beginPath();
  ctx.ellipse(0, 15, Math.max(11, player.r - player.z * 0.045), Math.max(4, 8 - player.z * 0.018), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(0, -player.z);
  ctx.shadowColor = shard.color;
  ctx.shadowBlur = 28;
  ctx.fillStyle = flash ? "#ffffff" : shard.color;
  ctx.beginPath();
  ctx.arc(0, 0, player.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#f7f1df";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, player.r + 6 + Math.sin(performance.now() / 150) * 2, 0, Math.PI * 2);
  ctx.stroke();

  const target = pointerWorld();
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  ctx.rotate(angle);
  ctx.fillStyle = "#f7f1df";
  ctx.fillRect(12, -4, 25, 8);
  ctx.restore();

  if (player.pulse > 0) {
    ctx.strokeStyle = shard.color;
    ctx.lineWidth = 5;
    ctx.globalAlpha = player.pulse / 0.42;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 230 * (1 - player.pulse / 0.42), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawFirstPersonOverlay() {
  const shard = shardData[activeShard];
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.save();
  ctx.strokeStyle = "rgba(247, 241, 223, 0.72)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy);
  ctx.lineTo(cx - 4, cy);
  ctx.moveTo(cx + 4, cy);
  ctx.lineTo(cx + 14, cy);
  ctx.moveTo(cx, cy - 14);
  ctx.lineTo(cx, cy - 4);
  ctx.moveTo(cx, cy + 4);
  ctx.lineTo(cx, cy + 14);
  ctx.stroke();

  const handY = canvas.height + 20;
  ctx.fillStyle = shard.glow;
  ctx.strokeStyle = shard.color;
  ctx.lineWidth = 4;
  ctx.shadowColor = shard.color;
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.ellipse(cx - 165, handY, 72, 122, -0.42, Math.PI, Math.PI * 1.92);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + 165, handY, 72, 122, 0.42, Math.PI * 1.08, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(16, 20, 27, 0.62)";
  ctx.fillRect(cx - 86, canvas.height - 64, 172, 34);
  ctx.strokeStyle = "rgba(247, 241, 223, 0.22)";
  ctx.strokeRect(cx - 86, canvas.height - 64, 172, 34);
  ctx.fillStyle = "#f7f1df";
  ctx.font = "800 13px Outfit";
  ctx.textAlign = "center";
  ctx.fillText("RIFT SIGHT", cx, canvas.height - 42);
  ctx.restore();
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawMessage() {
  if (messageTimer <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, messageTimer);
  ctx.fillStyle = "rgba(16, 20, 27, 0.68)";
  ctx.fillRect(canvas.width / 2 - 205, 94, 410, 44);
  ctx.strokeStyle = "rgba(247, 241, 223, 0.22)";
  ctx.strokeRect(canvas.width / 2 - 205, 94, 410, 44);
  ctx.fillStyle = "#f7f1df";
  ctx.font = "800 18px Outfit";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, 123);
  ctx.restore();
}

function updateHud() {
  healthText.textContent = `${Math.max(0, Math.round(player.hp))}`;
  healthBar.style.width = `${Math.max(0, player.hp)}%`;
  echoText.textContent = `${Math.round(player.echo)}`;
  echoBar.style.width = `${Math.max(0, player.echo)}%`;
  riftText.textContent = `${Math.max(0, Math.round(riftIntegrity))}%`;
  enemyText.textContent = `${enemies.length}`;
  eventText.textContent = currentEvent;
}

function loop(time) {
  const dt = Math.min(0.033, (time - last) / 1000 || 0);
  last = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  if (event.key === "F5") {
    event.preventDefault();
    firstPerson = !firstPerson;
    message = firstPerson ? "First-person rift sight" : "Skyward combat view";
    messageTimer = 1.6;
    return;
  }

  keys.add(event.key.toLowerCase());
  if (event.key === "1") setShard("fire");
  if (event.key === "2") setShard("storm");
  if (event.key === "3") setShard("void");
  if (event.key === "4") setShard("life");
  if (event.key.toLowerCase() === "e") pulse();
  if (event.code === "Space") {
    event.preventDefault();
    jump();
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
});
canvas.addEventListener("pointerdown", (event) => {
  pointer.down = true;
  canvas.setPointerCapture(event.pointerId);
  strike();
});
canvas.addEventListener("pointerup", () => {
  pointer.down = false;
});

shardButtons.forEach((button) => {
  button.addEventListener("click", () => setShard(button.dataset.shard));
});

function setHelpOpen(open) {
  helpPanel.hidden = !open;
  helpButton.setAttribute("aria-expanded", `${open}`);
}

helpButton.addEventListener("click", () => {
  setHelpOpen(helpPanel.hidden);
});

closeHelp.addEventListener("click", () => {
  setHelpOpen(false);
  helpButton.focus();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !helpPanel.hidden) {
    setHelpOpen(false);
    helpButton.focus();
  }
});

startButton.addEventListener("click", () => {
  overlay.classList.add("hidden");
  overlay.querySelector("h2").textContent = "Shardbreakers";
  overlay.querySelector("p").textContent = "Channel unstable Echo Shards across shattered sky continents. Break timeline beasts, seal rifts, and survive reality-warping events.";
  startButton.textContent = "Begin Riftfall";
  resetGame();
  running = true;
});

resize();
resetGame();
requestAnimationFrame(loop);
