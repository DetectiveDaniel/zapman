const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const heartsEl = document.querySelector("#hearts");
const statusEl = document.querySelector("#status");
const weaponEl = document.querySelector("#weapon");
const skipLevelBtn = document.querySelector("#skipLevel");
const tntDialog = document.querySelector("#tntDialog");
const lightTntBtn = document.querySelector("#lightTnt");
const skipTntBtn = document.querySelector("#skipTnt");

const W = canvas.width;
const H = canvas.height;
const gravity = 0.72;
const pixelFont = '"Courier New", Consolas, monospace';
const lavaY = 585;
const keys = new Set();
const solids = [];
const spikes = [];
const springs = [];
const stones = [];
const particles = [];
const bullets = [];
const bombs = [];
const sprays = [];
const enemies = [];
const tnts = [];
const warningSigns = [];
let platforms = [];
let finish;
let gun;
let paused = false;
let pendingTnt = null;
let won = false;
let gameOver = false;
let lastTime = 0;
let cameraX = 0;
let currentLevel = 1;

const player = {
  x: 70,
  y: 500,
  w: 32,
  h: 52,
  vx: 0,
  vy: 0,
  dir: 1,
  lives: 3,
  hurtCooldown: 0,
  owTimer: 0,
  punchCooldown: 0,
  hasGun: false,
  onGround: false
};

function rect(x, y, w, h, type = "platform") {
  const item = { x, y, w, h, type, alive: true, baseX: x, baseY: y, angle: 0 };
  solids.push(item);
  return item;
}

function setupLevelOne() {
  rect(0, 560, 300, 70, "start");
  rect(340, 520, 130, 24);
  rect(530, 530, 180, 24);
  rect(770, 515, 190, 24);
  rect(1030, 470, 170, 24);
  rect(1260, 420, 120, 24);
  rect(1460, 370, 150, 24);
  rect(1660, 330, 120, 24);
  rect(1840, 300, 120, 24);
  rect(2090, 455, 210, 24);
  rect(2380, 515, 210, 24);
  rect(2690, 475, 160, 24);
  rect(2980, 430, 150, 24);
  rect(3260, 382, 140, 24);
  platforms = [
    rect(3500, 380, 145, 18, "tilt"),
    rect(3710, 345, 145, 18, "tilt"),
    rect(3920, 310, 145, 18, "tilt")
  ];
  finish = { x: 4210, y: 220, w: 44, h: 140 };

  spikes.push({ x: 980, y: 488, w: 90, h: 28 }, { x: 2140, y: 428, w: 110, h: 28 });
  springs.push({ x: 1110, y: 410, w: 34, h: 60 }, { x: 3120, y: 330, w: 34, h: 60 });
  warningSigns.push({ x: 1340, y: 338, timer: 0 }, { x: 2540, y: 433, timer: 1.8 });
  tnts.push({ x: 560, y: 472, w: 56, h: 58, lit: false, alive: true, dismissed: false }, { x: 2450, y: 457, w: 56, h: 58, lit: false, alive: true, dismissed: false });
  enemies.push({ x: 890, y: 462, w: 34, h: 53, type: "knife", hp: 10, maxHp: 10, hitNeed: 20, hits: 0, alive: true, hurt: 0, attack: 0 });
  enemies.push({ x: 1740, y: 247, w: 38, h: 53, type: "bomber", hp: 13, maxHp: 13, alive: true, hurt: 0, throwTimer: 1.5 });
  enemies.push({ x: 2790, y: 422, w: 38, h: 53, type: "bomber", hp: 13, maxHp: 13, alive: true, hurt: 0, throwTimer: 2.6 });
  gun = { x: 2925, y: 385, w: 46, h: 22, picked: false };
}

function setupLevelTwo() {
  rect(0, 560, 260, 70, "start");
  rect(330, 510, 140, 24);
  rect(560, 455, 130, 24);
  rect(790, 505, 170, 24);
  rect(1100, 430, 150, 24);
  rect(1340, 365, 130, 24);
  rect(1580, 510, 190, 24);
  rect(1880, 455, 150, 24);
  rect(2160, 390, 140, 24);
  rect(2440, 480, 160, 24);
  rect(2720, 415, 150, 24);
  platforms = [
    rect(3040, 380, 140, 18, "tilt"),
    rect(3250, 340, 140, 18, "tilt")
  ];
  finish = { x: 3500, y: 230, w: 44, h: 140 };

  spikes.push(
    { x: 475, y: 482, w: 92, h: 28 },
    { x: 970, y: 532, w: 120, h: 28 },
    { x: 1770, y: 532, w: 120, h: 28 },
    { x: 2300, y: 532, w: 120, h: 28 },
    { x: 2860, y: 532, w: 110, h: 28 }
  );
  springs.push({ x: 1220, y: 370, w: 34, h: 60 }, { x: 2540, y: 420, w: 34, h: 60 });
  warningSigns.push({ x: 1450, y: 285, timer: 0.8 }, { x: 2660, y: 338, timer: 1.6 });
  tnts.push({ x: 610, y: 397, w: 56, h: 58, lit: false, alive: true, dismissed: false });
  enemies.push({ x: 870, y: 452, w: 38, h: 53, type: "doctor", hp: 12, maxHp: 12, alive: true, hurt: 0, sprayTimer: 1.2 });
  enemies.push({ x: 1690, y: 457, w: 38, h: 53, type: "doctor", hp: 12, maxHp: 12, alive: true, hurt: 0, sprayTimer: 2.1 });
  enemies.push({ x: 2360, y: 427, w: 38, h: 53, type: "doctor", hp: 12, maxHp: 12, alive: true, hurt: 0, sprayTimer: 1.8 });
  enemies.push({ x: 3150, y: 287, w: 38, h: 53, type: "bomber", hp: 13, maxHp: 13, alive: true, hurt: 0, throwTimer: 2.6 });
  gun = { x: 1960, y: 415, w: 46, h: 22, picked: false };
}

function setupLevel() {
  if (currentLevel === 1) setupLevelOne();
  else setupLevelTwo();
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function enemyLabel(enemy) {
  if (enemy.type === "doctor") return "Evil doctor";
  if (enemy.type === "bomber") return "Bomber";
  return "Knife enemy";
}

function clearLevel() {
  solids.length = 0;
  spikes.length = 0;
  springs.length = 0;
  stones.length = 0;
  particles.length = 0;
  bullets.length = 0;
  bombs.length = 0;
  sprays.length = 0;
  enemies.length = 0;
  tnts.length = 0;
  warningSigns.length = 0;
  platforms = [];
  pendingTnt = null;
  gun = null;
}

function startLevelTwo() {
  currentLevel = 2;
  clearLevel();
  Object.assign(player, { x: 70, y: 500, vx: 0, vy: 0, hurtCooldown: 0, owTimer: 0, punchCooldown: 0 });
  paused = false;
  won = false;
  gameOver = false;
  cameraX = 0;
  tntDialog.classList.add("hidden");
  setupLevel();
  setStatus("LEVEL 2: Dungeon danger! Avoid the evil doctors' death spray.");
}

function winGame() {
  won = true;
  setStatus("CONGRATULATIONS! YOU HAVE WON!");
  for (let i = 0; i < 12; i += 1) {
    burst(player.x + i * 35, 170 + Math.random() * 180, ["#fb2d5b", "#ffd166", "#06d6a0", "#4cc9f0"][i % 4], 18);
  }
}

function skipLevel() {
  if (gameOver) return;
  if (currentLevel === 1) {
    startLevelTwo();
  } else if (!won) {
    winGame();
  }
}

function damagePlayer(amount, message) {
  if ((player.hurtCooldown > 0 && amount < 99) || won || gameOver) return;
  player.lives -= amount;
  player.hurtCooldown = 1.1;
  player.owTimer = 0.9;
  bloodBurst(player.x + player.w / 2, player.y + 24);
  setStatus(message);
  if (player.lives <= 0) {
    player.lives = 0;
    gameOver = true;
    setStatus("Game over. Press R to restart.");
  }
}

function restart() {
  clearLevel();
  Object.assign(player, { x: 70, y: 500, vx: 0, vy: 0, lives: 3, hurtCooldown: 0, owTimer: 0, punchCooldown: 0, hasGun: false });
  currentLevel = 1;
  paused = false;
  won = false;
  gameOver = false;
  cameraX = 0;
  tntDialog.classList.add("hidden");
  setupLevel();
  setStatus("Reach the finish. Spikes hurt. F punches.");
}

function punch() {
  if (player.punchCooldown > 0 || paused || won || gameOver) return;
  player.punchCooldown = 0.28;
  const fist = {
    x: player.dir > 0 ? player.x + player.w : player.x - 34,
    y: player.y + 8,
    w: 34,
    h: 34
  };
  let hit = false;
  enemies.forEach((enemy) => {
    if (enemy.alive && overlaps(fist, enemy)) {
      enemy.hp -= 1;
      enemy.hurt = 0.18;
      hit = true;
      setStatus(`${enemyLabel(enemy)} hit: ${Math.max(0, enemy.hp)} left.`);
      if (enemy.hp <= 0) {
        enemy.alive = false;
        burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#222", 22);
        setStatus(`${enemyLabel(enemy)} defeated!`);
      }
    }
  });
  if (!hit) setStatus("Punch missed.");
}

function shoot() {
  if (!player.hasGun || paused || won || gameOver) return;
  bullets.push({ x: player.x + player.w / 2, y: player.y + 22, vx: player.dir * 13, w: 18, h: 5, life: 1.4 });
  setStatus("Gun fired instantly.");
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: Math.cos((Math.PI * 2 * i) / count) * (2 + Math.random() * 5),
      vy: Math.sin((Math.PI * 2 * i) / count) * (2 + Math.random() * 5),
      life: 0.8 + Math.random() * 0.7,
      color
    });
  }
}

function bloodBurst(x, y) {
  const colors = ["#d10f2f", "#9b0620", "#ff3b4f", "#6d0618"];
  for (let i = 0; i < 20; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: -3 - Math.random() * 5,
      life: 0.45 + Math.random() * 0.4,
      color: colors[i % colors.length],
      size: 4 + Math.floor(Math.random() * 4)
    });
  }
}

function lightTnt(tnt) {
  tnt.lit = true;
  tnt.timer = 1.2;
  setStatus("TNT lit. Stand back!");
}

function explodeTnt(tnt) {
  tnt.alive = false;
  burst(tnt.x + tnt.w / 2, tnt.y + tnt.h / 2, "#ff5b21", 42);
  const blast = { x: tnt.x - 128, y: tnt.y - 128, w: tnt.w + 256, h: tnt.h + 256 };
  solids.forEach((solid) => {
    if (solid.type !== "start" && overlaps(blast, solid)) solid.alive = false;
  });
  enemies.forEach((enemy) => {
    if (enemy.alive && overlaps(blast, enemy)) {
      enemy.alive = false;
      burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#202020", 18);
    }
  });
  if (overlaps(blast, player)) damagePlayer(99, "The TNT blast got you. Press R to restart.");
}

function dropStone(sign, dt) {
  sign.timer -= dt;
  if (sign.timer <= 0) {
    sign.timer = 3.2;
    stones.push({ x: sign.x + 8, y: sign.y + 34, w: 24, h: 24, vy: 1.3 });
  }
}

function resolveSolids(entity) {
  entity.onGround = false;
  solids.filter((solid) => solid.alive).forEach((solid) => {
    if (!overlaps(entity, solid)) return;
    const prevBottom = entity.y + entity.h - entity.vy;
    const prevTop = entity.y - entity.vy;
    const prevRight = entity.x + entity.w - entity.vx;
    const prevLeft = entity.x - entity.vx;
    if (prevBottom <= solid.y) {
      entity.y = solid.y - entity.h;
      entity.vy = 0;
      entity.onGround = true;
    } else if (prevTop >= solid.y + solid.h) {
      entity.y = solid.y + solid.h;
      entity.vy = 0;
    } else if (prevRight <= solid.x) {
      entity.x = solid.x - entity.w;
      entity.vx = 0;
    } else if (prevLeft >= solid.x + solid.w) {
      entity.x = solid.x + solid.w;
      entity.vx = 0;
    }
  });
}

function update(dt) {
  if (paused) return;
  if (gameOver) {
    particles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.life -= dt; });
    return;
  }
  if (won) {
    burst(player.x + 120 + Math.random() * 300, 120 + Math.random() * 180, ["#fb2d5b", "#ffd166", "#06d6a0", "#4cc9f0"][Math.floor(Math.random() * 4)], 8);
  }

  player.hurtCooldown = Math.max(0, player.hurtCooldown - dt);
  player.owTimer = Math.max(0, player.owTimer - dt);
  player.punchCooldown = Math.max(0, player.punchCooldown - dt);
  const left = keys.has("ArrowLeft") || keys.has("a");
  const right = keys.has("ArrowRight") || keys.has("d");
  const jump = keys.has("ArrowUp") || keys.has("w") || keys.has(" ");
  player.vx = (right ? 4.6 : 0) - (left ? 4.6 : 0);
  if (player.vx !== 0) player.dir = Math.sign(player.vx);
  if (jump && player.onGround) {
    player.vy = -14.5;
    player.onGround = false;
  }
  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;
  resolveSolids(player);
  if (player.y + player.h > lavaY) damagePlayer(1, "Hot lava took one heart!");
  if (player.y > H + 140) damagePlayer(99, "You sank into the lava. Press R to restart.");

  spikes.forEach((spike) => {
    if (overlaps(player, spike)) damagePlayer(1, "Ouch! Spikes took one heart.");
  });

  springs.forEach((spring) => {
    spring.pulse = Math.max(0, (spring.pulse || 0) - dt);
    if (overlaps(player, spring)) {
      player.vy = -18;
      spring.pulse = 0.26;
      setStatus("Spring climb boost!");
    }
  });

  tnts.forEach((tnt) => {
    if (!tnt.alive) return;
    if (!overlaps(player, tnt)) tnt.dismissed = false;
    if (overlaps(player, tnt) && !tnt.lit && !tnt.dismissed && !pendingTnt) {
      pendingTnt = tnt;
      paused = true;
      tntDialog.classList.remove("hidden");
    }
    if (tnt.lit) {
      tnt.timer -= dt;
      if (tnt.timer <= 0) explodeTnt(tnt);
    }
  });

  if (gun && !gun.picked && overlaps(player, gun)) {
    gun.picked = true;
    player.hasGun = true;
    setStatus("You picked up the gun. Click or press J to fire.");
  }

  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    enemy.hurt = Math.max(0, enemy.hurt - dt);
    const distance = player.x - enemy.x;
    if (enemy.type === "knife" && Math.abs(distance) < 190) {
      enemy.x += Math.sign(distance) * 1.25;
      enemy.attack -= dt;
      if (enemy.attack <= 0 && overlaps(enemy, player)) {
        enemy.attack = 0.55;
        enemy.hits += 1;
        player.hurtCooldown = 0.35;
        player.owTimer = 0.9;
        bloodBurst(player.x + player.w / 2, player.y + 24);
        setStatus(`Knife enemy hit ${enemy.hits}/20.`);
        if (enemy.hits >= enemy.hitNeed) damagePlayer(99, "The knife enemy hit you 20 times. Press R to restart.");
      }
    }
    if (enemy.type === "bomber") {
      enemy.throwTimer -= dt;
      if (enemy.throwTimer <= 0) {
        enemy.throwTimer = 5;
        const dir = Math.sign(player.x - enemy.x) || 1;
        bombs.push({ x: enemy.x + enemy.w / 2, y: enemy.y + 14, w: 18, h: 18, vx: dir * 4.5, vy: -7, life: 3 });
        setStatus("A bomber threw a bomb!");
      }
    }
    if (enemy.type === "doctor") {
      enemy.sprayTimer -= dt;
      if (enemy.sprayTimer <= 0) {
        enemy.sprayTimer = 2.4;
        const dir = Math.sign(player.x - enemy.x) || 1;
        sprays.push({ x: enemy.x + enemy.w / 2, y: enemy.y + 24, w: 24, h: 12, vx: dir * 5.8, life: 2.2 });
        setStatus("An evil doctor sprayed infection!");
      }
    }
  });

  bullets.forEach((bullet) => {
    bullet.x += bullet.vx;
    bullet.life -= dt;
    enemies.forEach((enemy) => {
      if (enemy.alive && overlaps(bullet, enemy)) {
        enemy.hp = 0;
        enemy.alive = false;
        bullet.life = 0;
        burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, "#202020", 24);
        setStatus("Direct hit!");
      }
    });
  });

  bombs.forEach((bomb) => {
    bomb.vy += gravity * 0.45;
    bomb.x += bomb.vx;
    bomb.y += bomb.vy;
    bomb.life -= dt;
    if (overlaps(bomb, player)) damagePlayer(99, "A bomb hit you. Press R to restart.");
  });

  sprays.forEach((spray) => {
    spray.x += spray.vx;
    spray.life -= dt;
    if (overlaps(spray, player)) {
      spray.life = 0;
      damagePlayer(99, "Death spray infected you. Press R to restart.");
    }
  });

  warningSigns.forEach((sign) => dropStone(sign, dt));
  stones.forEach((stone) => {
    stone.vy += gravity * 0.12;
    stone.y += stone.vy;
    if (overlaps(stone, player)) damagePlayer(1, "A falling stone hit you.");
  });

  platforms.forEach((platform, index) => {
    platform.angle = Math.sin(performance.now() / 650 + index * 1.4) * 0.32;
    platform.y = platform.baseY;
  });

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (!p.noGravity) p.vy += 0.06;
    p.life -= dt;
  });

  if (overlaps(player, finish) && !won) {
    if (currentLevel === 1) {
      startLevelTwo();
      return;
    }
    winGame();
  }

  cameraX = Math.max(0, Math.min(player.x - 280, Math.max(0, finish.x - 890)));
  bullets.splice(0, bullets.length, ...bullets.filter((b) => b.life > 0));
  bombs.splice(0, bombs.length, ...bombs.filter((b) => b.life > 0 && b.y < H + 120));
  sprays.splice(0, sprays.length, ...sprays.filter((s) => s.life > 0));
  stones.splice(0, stones.length, ...stones.filter((s) => s.y < H + 120));
  particles.splice(0, particles.length, ...particles.filter((p) => p.life > 0));
}

function drawPlatform(solid) {
  ctx.save();
  ctx.translate(solid.x + solid.w / 2, solid.y + solid.h / 2);
  if (solid.type === "tilt") ctx.rotate(solid.angle);
  const palette = platformPalette(solid);
  const fill = ctx.createLinearGradient(0, -solid.h / 2, 0, solid.h / 2);
  fill.addColorStop(0, palette.light);
  fill.addColorStop(0.52, palette.mid);
  fill.addColorStop(1, palette.dark);
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#17202a";
  ctx.lineWidth = 3;
  ctx.fillRect(-solid.w / 2, -solid.h / 2, solid.w, solid.h);
  ctx.strokeRect(-solid.w / 2, -solid.h / 2, solid.w, solid.h);
  ctx.fillStyle = palette.spark;
  for (let x = -solid.w / 2 + 8; x < solid.w / 2 - 8; x += 28) {
    ctx.fillRect(x, -solid.h / 2 + 5, 12, 5);
    ctx.fillRect(x + 13, solid.h / 2 - 8, 9, 4);
  }
  ctx.strokeStyle = "rgb(23 32 42 / 0.5)";
  for (let x = -solid.w / 2 + 24; x < solid.w / 2; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, -solid.h / 2 + 3);
    ctx.lineTo(x, solid.h / 2 - 3);
    ctx.stroke();
  }
  if (solid.type === "start") {
    ctx.fillStyle = "#17202a";
    ctx.font = `34px ${pixelFont}`;
    ctx.fillText("START", -solid.w / 2 + 38, -8);
  }
  ctx.restore();
}

function platformPalette(solid) {
  if (solid.type === "start") {
    return { light: "#8cff7a", mid: "#35c85a", dark: "#188647", spark: "#d5ff80" };
  }
  if (solid.type === "tilt") {
    return { light: "#ffd86e", mid: "#ff9f43", dark: "#d85a28", spark: "#fff0a3" };
  }
  const palettes = [
    { light: "#84e1ff", mid: "#3c9bff", dark: "#2a4fb7", spark: "#c7f6ff" },
    { light: "#ff9fc8", mid: "#ec4c88", dark: "#9c2d67", spark: "#ffd1e4" },
    { light: "#b89cff", mid: "#7b5cff", dark: "#4734a5", spark: "#ddd0ff" },
    { light: "#7df5c9", mid: "#22b993", dark: "#12715f", spark: "#c2ffe9" }
  ];
  return palettes[Math.abs(Math.floor(solid.baseX / 240)) % palettes.length];
}

function drawPerson(x, y, shirt, hasKnife = false, hasBomb = false) {
  ctx.strokeStyle = "#17202a";
  ctx.lineWidth = 2;
  ctx.fillStyle = "#ffd9bd";
  ctx.fillRect(x + 5, y, 24, 24);
  ctx.strokeRect(x + 5, y, 24, 24);
  ctx.fillStyle = "#17202a";
  ctx.fillRect(x + 10, y + 8, 4, 4);
  ctx.fillRect(x + 21, y + 8, 4, 4);
  ctx.fillRect(x + 13, y + 17, 9, 3);
  ctx.fillStyle = shirt;
  ctx.fillRect(x + 5, y + 26, 24, 26);
  ctx.strokeRect(x + 5, y + 26, 24, 26);
  ctx.fillStyle = "#17202a";
  ctx.fillRect(x, y + 34, 6, 18);
  ctx.fillRect(x + 29, y + 31, 6, 20);
  ctx.fillRect(x + 6, y + 52, 8, 14);
  ctx.fillRect(x + 21, y + 52, 8, 14);
  if (hasKnife) {
    drawKnifeSprite(x + 35, y + 10);
  }
  if (hasBomb) {
    ctx.fillStyle = "#222";
    ctx.fillRect(x + 42, y + 18, 18, 18);
    ctx.fillStyle = "#ffcf33";
    ctx.fillRect(x + 56, y + 14, 5, 5);
  }
}

function drawKnifeSprite(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.72);

  ctx.fillStyle = "#17202a";
  ctx.fillRect(4, 7, 34, 5);
  ctx.fillRect(9, 2, 22, 15);
  ctx.fillRect(35, 3, 6, 13);
  ctx.fillRect(40, 7, 21, 6);
  ctx.fillRect(58, 10, 8, 8);

  ctx.fillStyle = "#f8fbff";
  ctx.fillRect(7, 8, 25, 4);
  ctx.fillRect(11, 5, 17, 4);
  ctx.fillRect(11, 12, 18, 3);
  ctx.fillStyle = "#c9d8ef";
  ctx.fillRect(20, 8, 14, 4);
  ctx.fillRect(24, 12, 8, 3);
  ctx.fillStyle = "#8c79c6";
  ctx.fillRect(12, 15, 7, 3);
  ctx.fillRect(27, 4, 4, 4);

  ctx.fillStyle = "#d9dde1";
  ctx.fillRect(34, 0, 4, 20);
  ctx.fillRect(30, 8, 12, 4);
  ctx.fillStyle = "#33373d";
  ctx.fillRect(42, 7, 18, 7);
  ctx.fillStyle = "#5b6068";
  ctx.fillRect(45, 5, 12, 3);
  ctx.fillRect(48, 14, 8, 3);
  ctx.fillStyle = "#c4ccd2";
  ctx.fillRect(58, 11, 5, 5);
  ctx.restore();
}

function drawKnifeEnemySprite(x, y, phase = 0, attacking = false) {
  ctx.save();
  ctx.translate(x - 8, y - 7);
  const run = Math.floor(phase / 140) % 2;
  const armBob = run ? 4 : -3;
  const legBob = run ? 5 : -4;
  const stab = attacking ? 12 : 0;
  ctx.fillStyle = "rgb(23 32 42 / 0.25)";
  ctx.fillRect(5, 74, 58, 5);

  drawKnifeSprite(-4 - stab, 32 + armBob * 0.25);

  ctx.fillStyle = "#ffc09a";
  ctx.fillRect(20, 15, 25, 29);
  ctx.fillRect(45, 25, 6, 12);
  ctx.fillStyle = "#17202a";
  ctx.fillRect(26, 27, 4, 6);
  ctx.fillRect(39, 27, 4, 6);
  ctx.fillRect(31, 37, 9, 3);

  ctx.fillStyle = "#c9f1ff";
  ctx.fillRect(18, 5, 25, 8);
  ctx.fillRect(13, 12, 34, 9);
  ctx.fillRect(11, 21, 12, 11);
  ctx.fillRect(42, 18, 8, 8);
  ctx.fillStyle = "#7fc9e8";
  ctx.fillRect(12, 25, 9, 8);
  ctx.fillRect(38, 8, 9, 7);

  ctx.fillStyle = "#1484e3";
  ctx.fillRect(16, 43, 34, 26);
  ctx.fillStyle = "#4db7ff";
  ctx.fillRect(21, 43, 12, 8);
  ctx.fillRect(34, 47, 10, 7);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(27, 43, 9, 9);

  ctx.fillStyle = "#f28b78";
  ctx.fillRect(10 - stab, 46 + armBob, 8, 22);
  ctx.fillRect(49, 45 - armBob, 8, 23);
  ctx.fillStyle = "#111827";
  ctx.fillRect(20 + legBob, 68, 9, 23);
  ctx.fillRect(38 - legBob, 68, 9, 23);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(14 + legBob, 90, 17, 5);
  ctx.fillRect(36 - legBob, 90, 18, 5);
  ctx.fillStyle = "#e53935";
  ctx.fillRect(17 + legBob, 87, 12, 5);
  ctx.fillRect(39 - legBob, 87, 13, 5);
  ctx.fillStyle = "#1387d8";
  ctx.fillRect(12 + legBob, 94, 19, 4);
  ctx.fillRect(35 - legBob, 94, 21, 4);
  ctx.restore();
}

function drawPlayerSprite(x, y, isHurt = false, pose = "idle", dir = 1) {
  ctx.save();
  ctx.translate(x - 7, y - 2);
  const walkFrame = Math.floor(performance.now() / 140) % 2;
  const armSwing = pose === "walk" ? (walkFrame ? 4 : -4) : 0;
  const legSwing = pose === "walk" ? (walkFrame ? 6 : -6) : 0;
  const jumpLift = pose === "jump" ? -8 : 0;
  ctx.fillStyle = "rgb(23 32 42 / 0.3)";
  ctx.fillRect(7, 66, 48, 5);

  ctx.fillStyle = "#070707";
  ctx.fillRect(9, 4, 35, 8);
  ctx.fillRect(3, 12, 47, 8);
  ctx.fillRect(7, 20, 50, 8);
  ctx.fillRect(8, 28, 50, 8);
  ctx.fillRect(8, 36, 42, 8);
  ctx.fillRect(8, 44, 28, 8);
  ctx.fillRect(42, 36, 14, 8);

  ctx.fillStyle = isHurt ? "#ffb1a0" : "#f2b38b";
  ctx.fillRect(24, 26, 25, 24);
  ctx.fillRect(18, 36, 8, 14);
  ctx.fillStyle = "#ffd0ad";
  ctx.fillRect(28, 28, 6, 10);

  ctx.fillStyle = "#17202a";
  ctx.fillRect(28, 35, 4, 5);
  ctx.fillRect(43, 35, 4, 5);
  ctx.fillRect(35, 45, 8, 3);

  ctx.fillStyle = "#e53a2f";
  ctx.fillRect(18, 50, 34, 17);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(31, 50, 8, 17);
  ctx.fillStyle = "#8b3d22";
  if (pose === "jump") {
    ctx.fillRect(9, 43, 10, 9);
    ctx.fillRect(50, 43, 10, 9);
  } else {
    ctx.fillRect(10, 53 + armSwing, 10, 9);
    ctx.fillRect(50, 53 - armSwing, 10, 9);
  }

  ctx.fillStyle = "#111";
  if (pose === "jump") {
    ctx.fillRect(22, 67, 10, 12);
    ctx.fillRect(43, 65, 10, 12);
  } else {
    ctx.fillRect(24 + legSwing, 67, 10, 17);
    ctx.fillRect(40 - legSwing, 67, 10, 17);
  }
  ctx.fillStyle = "#caffb6";
  if (pose === "jump") {
    ctx.fillRect(16, 77, 16, 7);
    ctx.fillRect(42, 75, 16, 7);
  } else {
    ctx.fillRect(18 + legSwing, 81, 16, 7);
    ctx.fillRect(40 - legSwing, 81, 16, 7);
  }
  if (pose === "jump") {
    ctx.fillStyle = "#f8fbff";
    ctx.fillRect(dir > 0 ? 55 : 5, 34 + jumpLift, 6, 6);
  }
  ctx.restore();
}

function drawOwBubble(x, y) {
  const bob = Math.sin(performance.now() / 90) * 2;
  const bx = x - 7;
  const by = y - 42 + bob;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#17202a";
  ctx.lineWidth = 3;
  ctx.fillRect(bx, by, 54, 28);
  ctx.strokeRect(bx, by, 54, 28);
  ctx.fillRect(bx + 15, by + 25, 10, 9);
  ctx.strokeRect(bx + 15, by + 25, 10, 9);
  ctx.fillStyle = "#17202a";
  ctx.font = `20px ${pixelFont}`;
  ctx.fillText("OW!", bx + 8, by + 21);
}

function drawBomberSprite(x, y, phase = 0, throwing = false) {
  ctx.save();
  ctx.translate(x - 9, y - 5);
  const step = Math.floor(phase / 170) % 2;
  const bob = step ? 3 : -2;
  const throwLift = throwing ? -12 : 0;
  ctx.fillStyle = "rgb(23 32 42 / 0.28)";
  ctx.fillRect(5, 67, 58, 5);

  ctx.fillStyle = "#ff4c50";
  ctx.fillRect(11, 5, 27, 7);
  ctx.fillRect(7, 12, 35, 8);
  ctx.fillRect(6, 20, 31, 8);
  ctx.fillStyle = "#b7192e";
  ctx.fillRect(5, 28, 20, 9);
  ctx.fillRect(8, 37, 13, 7);

  ctx.fillStyle = "#ffc09a";
  ctx.fillRect(24, 18, 22, 23);
  ctx.fillRect(12, 43, 13, 8);
  ctx.fillRect(48, 41, 18, 8);
  ctx.fillStyle = "#17202a";
  ctx.fillRect(36, 22, 13, 8);
  ctx.fillStyle = "#f4fbff";
  ctx.fillRect(39, 23, 5, 5);
  ctx.fillStyle = "#7a2f1c";
  ctx.fillRect(30, 35, 11, 3);

  ctx.fillStyle = "#15151a";
  ctx.fillRect(19, 41, 31, 17);
  ctx.fillStyle = "#ffd05d";
  ctx.fillRect(17, 56, 35, 8);
  ctx.fillStyle = "#ff3d1f";
  ctx.fillRect(21, 56, 7, 8);
  ctx.fillRect(38, 56, 8, 8);

  ctx.fillStyle = "#ffc09a";
  ctx.fillRect(15 + bob, 64, 8, 17);
  ctx.fillRect(42 - bob, 64, 8, 17);
  ctx.fillStyle = "#15151a";
  ctx.fillRect(9 + bob, 80, 16, 7);
  ctx.fillRect(39 - bob, 80, 17, 7);

  ctx.fillStyle = "#1b1f26";
  ctx.fillRect(55, 38 + throwLift, 31, 10);
  ctx.fillStyle = "#dbe7f0";
  ctx.fillRect(67, 34 + throwLift, 29, 10);
  ctx.fillStyle = "#8fa1ad";
  ctx.fillRect(74, 44 + throwLift, 15, 5);
  ctx.fillStyle = "#17202a";
  ctx.fillRect(53, 48 + throwLift, 11, 9);
  if (throwing) {
    ctx.fillStyle = "#ffcf33";
    ctx.fillRect(89, 28, 8, 8);
    ctx.fillStyle = "#ff6b1a";
    ctx.fillRect(97, 31, 5, 5);
  }
  ctx.restore();
}

function drawDoctorSprite(x, y, phase = 0, spraying = false) {
  ctx.save();
  ctx.translate(x - 8, y - 8);
  const step = Math.floor(phase / 180) % 2;
  const foot = step ? 3 : -3;
  const armLift = spraying ? -8 : 0;
  ctx.fillStyle = "rgb(23 32 42 / 0.28)";
  ctx.fillRect(8, 76, 54, 5);

  ctx.fillStyle = "#f2bd80";
  ctx.fillRect(20, 14, 30, 30);
  ctx.fillRect(50, 25, 6, 10);
  ctx.fillStyle = "#d99a4a";
  ctx.fillRect(16, 20, 6, 19);
  ctx.fillRect(48, 16, 6, 11);
  ctx.fillStyle = "#e6b422";
  ctx.fillRect(15, 6, 36, 9);
  ctx.fillRect(10, 14, 13, 26);
  ctx.fillRect(47, 14, 8, 22);
  ctx.fillStyle = "#17202a";
  ctx.fillRect(27, 26, 4, 4);
  ctx.fillRect(42, 26, 4, 4);
  ctx.fillRect(32, 36, 10, 3);

  ctx.fillStyle = "#f4fbff";
  ctx.fillRect(19, 43, 32, 34);
  ctx.strokeStyle = "#17202a";
  ctx.lineWidth = 2;
  ctx.strokeRect(19, 43, 32, 34);
  ctx.fillStyle = "#d7e2e8";
  ctx.fillRect(33, 45, 4, 30);
  ctx.fillStyle = "#17202a";
  ctx.fillRect(28, 51, 3, 3);
  ctx.fillRect(41, 51, 3, 3);
  ctx.fillRect(28, 62, 3, 3);
  ctx.fillRect(41, 62, 3, 3);

  ctx.fillStyle = "#f2bd80";
  ctx.fillRect(13, 47, 7, 22);
  ctx.fillRect(51, 47 + armLift, 7, 22);
  ctx.fillStyle = "#b9ff3d";
  ctx.fillRect(58, 52 + armLift, 18, 7);
  ctx.fillStyle = "#253247";
  ctx.fillRect(66, 49 + armLift, 9, 13);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(20 + foot, 77, 14, 6);
  ctx.fillRect(40 - foot, 77, 14, 6);
  ctx.fillStyle = "#5b6675";
  ctx.fillRect(23 + foot, 73, 8, 6);
  ctx.fillRect(43 - foot, 73, 8, 6);
  ctx.restore();
}

function drawPixelCloud(x, y, scale = 1) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 8 * scale, y + 18 * scale, 74 * scale, 18 * scale);
  ctx.fillRect(x + 24 * scale, y + 8 * scale, 42 * scale, 18 * scale);
  ctx.fillRect(x + 58 * scale, y + 12 * scale, 38 * scale, 20 * scale);
  ctx.fillRect(x + 2 * scale, y + 28 * scale, 96 * scale, 16 * scale);
  ctx.fillStyle = "#c9f5ff";
  ctx.fillRect(x + 16 * scale, y + 36 * scale, 66 * scale, 10 * scale);
  ctx.fillStyle = "#8ed9ef";
  ctx.fillRect(x + 30 * scale, y + 44 * scale, 42 * scale, 5 * scale);
}

function drawPixelBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, lavaY);
  sky.addColorStop(0, "#4ea2d7");
  sky.addColorStop(0.55, "#6fb9e5");
  sky.addColorStop(1, "#b9ecff");
  ctx.fillStyle = sky;
  ctx.fillRect(cameraX, 0, W, lavaY);

  ctx.fillStyle = "rgb(255 255 255 / 0.14)";
  for (let y = 74; y < 168; y += 18) ctx.fillRect(cameraX, y, W, 3);
  ctx.fillStyle = "#eaffff";
  for (let x = Math.floor(cameraX / 230) * 230; x < cameraX + W; x += 230) {
    ctx.fillRect(x + 34, 72, 4, 4);
    ctx.fillRect(x + 112, 94, 3, 3);
    ctx.fillRect(x + 178, 58, 5, 5);
  }

  for (let x = Math.floor(cameraX / 330) * 330; x < cameraX + W; x += 330) {
    drawPixelCloud(x + 20, 98, 1);
    drawPixelCloud(x + 185, 82, 0.9);
  }

  ctx.fillStyle = "#b6eb40";
  for (let x = Math.floor(cameraX / 80) * 80; x < cameraX + W; x += 80) {
    const h = 18 + ((x / 80) % 4) * 6;
    ctx.fillRect(x, 440 - h, 90, h + 36);
  }
  ctx.fillStyle = "#74bf35";
  for (let x = Math.floor(cameraX / 64) * 64; x < cameraX + W; x += 64) {
    const h = 14 + ((x / 64) % 5) * 5;
    ctx.fillRect(x, 476 - h, 76, h + 40);
  }
  ctx.fillStyle = "#4f9f35";
  ctx.fillRect(cameraX, 500, W, lavaY - 500);
  ctx.fillStyle = "#7fde3d";
  for (let x = Math.floor(cameraX / 38) * 38; x < cameraX + W; x += 38) {
    ctx.fillRect(x, 510 + ((x / 38) % 3) * 12, 24, 8);
    ctx.fillRect(x + 10, 545, 34, 7);
  }
  ctx.fillStyle = "#2f7d38";
  for (let x = Math.floor(cameraX / 54) * 54; x < cameraX + W; x += 54) {
    ctx.fillRect(x, 565, 38, 6);
  }
}

function drawDungeonBackground() {
  const wall = ctx.createLinearGradient(0, 0, 0, lavaY);
  wall.addColorStop(0, "#151927");
  wall.addColorStop(0.55, "#2e344c");
  wall.addColorStop(1, "#151927");
  ctx.fillStyle = wall;
  ctx.fillRect(cameraX, 0, W, lavaY);

  for (let y = 40; y < lavaY; y += 58) {
    for (let x = Math.floor(cameraX / 86) * 86; x < cameraX + W; x += 86) {
      ctx.fillStyle = (Math.floor((x + y) / 86) % 2) ? "#39405a" : "#30364e";
      ctx.fillRect(x, y, 82, 52);
      ctx.fillStyle = "#1c2031";
      ctx.fillRect(x, y + 48, 82, 4);
      ctx.fillRect(x + 78, y, 4, 52);
    }
  }

  ctx.fillStyle = "#1b1020";
  for (let x = Math.floor(cameraX / 300) * 300; x < cameraX + W; x += 300) {
    ctx.fillRect(x + 70, 118, 58, 140);
    ctx.fillStyle = "#090911";
    ctx.fillRect(x + 82, 138, 34, 120);
    ctx.fillStyle = "#ff8a21";
    ctx.fillRect(x + 212, 150, 16, 24);
    ctx.fillStyle = "#ffe75a";
    ctx.fillRect(x + 216, 142, 8, 18);
    ctx.fillStyle = "#30364e";
  }

  ctx.fillStyle = "#263047";
  ctx.fillRect(cameraX, 500, W, lavaY - 500);
  ctx.fillStyle = "#3c4b66";
  for (let x = Math.floor(cameraX / 54) * 54; x < cameraX + W; x += 54) {
    ctx.fillRect(x, 520, 38, 8);
    ctx.fillRect(x + 14, 560, 44, 7);
  }
}

function drawSpringPad(spring) {
  const x = spring.x - 18;
  const bounce = spring.pulse || 0;
  const squash = Math.sin(bounce * Math.PI / 0.26) * 10;
  const y = spring.y - 3 + squash * 0.35;
  const w = 70;
  const plateH = 14;
  const topOffset = -squash;
  const bottomOffset = squash * 0.25;
  ctx.lineWidth = 4;

  ctx.fillStyle = "#050505";
  ctx.fillRect(x, y + topOffset, w, plateH + 4);
  ctx.fillRect(x, y + 48 + bottomOffset, w, plateH + 4);
  ctx.fillStyle = "#20e55d";
  ctx.fillRect(x + 6, y + 4 + topOffset, w - 12, plateH - 2);
  ctx.fillRect(x + 6, y + 52 + bottomOffset, w - 12, plateH - 2);
  ctx.fillStyle = "#9cffb3";
  ctx.fillRect(x + 16, y + 7 + topOffset, 12, 5);
  ctx.fillRect(x + 43, y + 6 + topOffset, 12, 6);
  ctx.fillRect(x + 15, y + 55 + bottomOffset, 13, 5);
  ctx.fillRect(x + 43, y + 55 + bottomOffset, 12, 5);

  ctx.strokeStyle = "#050505";
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 18 + topOffset);
  ctx.lineTo(x + 48, y + 48 + bottomOffset);
  ctx.moveTo(x + 50, y + 18 + topOffset);
  ctx.lineTo(x + 22, y + 48 + bottomOffset);
  ctx.moveTo(x + 31, y + 18 + topOffset);
  ctx.lineTo(x + 12, y + 34);
  ctx.moveTo(x + 39, y + 48 + bottomOffset);
  ctx.lineTo(x + 58, y + 34);
  ctx.stroke();

  ctx.strokeStyle = "#f8f8f8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 23, y + 19 + topOffset);
  ctx.lineTo(x + 47, y + 45 + bottomOffset);
  ctx.moveTo(x + 47, y + 19 + topOffset);
  ctx.lineTo(x + 23, y + 45 + bottomOffset);
  ctx.stroke();

  ctx.fillStyle = bounce > 0 ? "#fff06b" : "#ffb12a";
  ctx.fillRect(x + 2, y + 28, 12, 13);
  ctx.fillRect(x + 56, y + 28, 12, 13);
  ctx.fillStyle = "#050505";
  ctx.fillRect(x - 2, y + 30, 5, 9);
  ctx.fillRect(x + 67, y + 30, 5, 9);
}

function drawTntCrate(tnt) {
  const x = tnt.x - 6;
  const y = tnt.y - 18;
  const litBoost = tnt.lit ? 5 : 0;

  ctx.fillStyle = "#7c2a16";
  ctx.fillRect(x + 8, y + 64, 48, 8);
  ctx.fillStyle = "#35160e";
  ctx.fillRect(x + 10, y + 72, 12, 7);
  ctx.fillRect(x + 42, y + 72, 12, 7);

  ctx.fillStyle = "#bf3e1d";
  ctx.fillRect(x, y + 26, 56, 42);
  ctx.fillStyle = "#e95722";
  ctx.fillRect(x + 6, y + 30, 44, 34);
  ctx.fillStyle = "#ff7b22";
  for (let sx = x + 8; sx < x + 52; sx += 14) {
    ctx.fillRect(sx, y + 31, 7, 32);
  }
  ctx.fillStyle = "#8a2718";
  ctx.fillRect(x, y + 26, 56, 7);
  ctx.fillRect(x, y + 61, 56, 7);
  ctx.fillStyle = "#ffb52a";
  ctx.fillRect(x + 5, y + 25, 48, 5);
  ctx.fillRect(x + 8, y + 58, 42, 4);

  ctx.fillStyle = "#f4efe2";
  ctx.fillRect(x + 4, y + 38, 21, 20);
  ctx.fillRect(x + 31, y + 38, 21, 20);
  ctx.fillStyle = "#17202a";
  ctx.font = `18px ${pixelFont}`;
  ctx.fillText("TN", x + 4, y + 56);
  ctx.fillText("NT", x + 31, y + 56);

  ctx.fillStyle = "#ff9a22";
  ctx.fillRect(x + 16, y + 17 - litBoost, 28, 13 + litBoost);
  ctx.fillRect(x + 21, y + 9 - litBoost, 18, 18 + litBoost);
  ctx.fillRect(x + 27, y + 1 - litBoost, 8, 20 + litBoost);
  ctx.fillStyle = "#ffe94f";
  ctx.fillRect(x + 21, y + 22 - litBoost, 18, 8 + litBoost);
  ctx.fillRect(x + 26, y + 12 - litBoost, 10, 13 + litBoost);
  ctx.fillStyle = "#fff6a8";
  ctx.fillRect(x + 28, y + 19 - litBoost, 6, 8 + litBoost);

  ctx.strokeStyle = "#17202a";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y + 26, 56, 42);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(-cameraX, 0);

  if (currentLevel === 2) drawDungeonBackground();
  else drawPixelBackground();
  const lava = ctx.createLinearGradient(0, lavaY, 0, H);
  if (currentLevel === 2) {
    lava.addColorStop(0, "#b9ff3d");
    lava.addColorStop(0.32, "#49d63a");
    lava.addColorStop(0.72, "#149943");
    lava.addColorStop(1, "#06411f");
  } else {
    lava.addColorStop(0, "#ffd35a");
    lava.addColorStop(0.32, "#ff7a1a");
    lava.addColorStop(0.72, "#e52222");
    lava.addColorStop(1, "#5a110d");
  }
  ctx.fillStyle = lava;
  ctx.fillRect(cameraX, lavaY, W, H - lavaY);
  ctx.fillStyle = "#fff06b";
  for (let x = Math.floor(cameraX / 32) * 32; x < cameraX + W; x += 32) {
    const wave = Math.sin((performance.now() / 220) + x * 0.05) * 5;
    ctx.fillRect(x, lavaY + 6 + wave, 18, 6);
    ctx.fillRect(x + 22, lavaY + 24 - wave, 10, 8);
  }
  ctx.fillStyle = "#ff3d1f";
  for (let x = Math.floor(cameraX / 48) * 48; x < cameraX + W; x += 48) {
    ctx.fillRect(x + 12, lavaY + 14, 16, 8);
  }

  solids.filter((s) => s.alive).forEach(drawPlatform);

  spikes.forEach((spike) => {
    ctx.strokeStyle = "#17202a";
    for (let x = spike.x; x < spike.x + spike.w; x += 28) {
      const spikeFill = ctx.createLinearGradient(0, spike.y, 0, spike.y + spike.h);
      spikeFill.addColorStop(0, "#f5f7fa");
      spikeFill.addColorStop(0.45, "#aeb8c0");
      spikeFill.addColorStop(1, "#59636b");
      ctx.fillStyle = spikeFill;
      ctx.beginPath();
      ctx.moveTo(x, spike.y + spike.h);
      ctx.lineTo(x + 14, spike.y);
      ctx.lineTo(x + 28, spike.y + spike.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(x + 11, spike.y + 9);
      ctx.lineTo(x + 15, spike.y + 3);
      ctx.lineTo(x + 15, spike.y + spike.h - 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#6f7a83";
      ctx.beginPath();
      ctx.moveTo(x + 17, spike.y + 8);
      ctx.lineTo(x + 25, spike.y + spike.h - 2);
      ctx.lineTo(x + 16, spike.y + spike.h - 2);
      ctx.closePath();
      ctx.fill();
    }
  });

  springs.forEach((spring) => {
    drawSpringPad(spring);
  });

  warningSigns.forEach((sign) => {
    ctx.fillStyle = "#ffe680";
    ctx.strokeStyle = "#17202a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sign.x, sign.y + 36);
    ctx.lineTo(sign.x + 24, sign.y);
    ctx.lineTo(sign.x + 48, sign.y + 36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#17202a";
    ctx.font = `24px ${pixelFont}`;
    ctx.fillText("!", sign.x + 20, sign.y + 29);
  });

  tnts.filter((t) => t.alive).forEach((tnt) => {
    drawTntCrate(tnt);
  });

  if (gun && !gun.picked) {
    ctx.fillStyle = "#202020";
    ctx.fillRect(gun.x, gun.y, gun.w, 12);
    ctx.fillRect(gun.x + 30, gun.y + 10, 12, 18);
  }

  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    if (enemy.type === "doctor") {
      drawDoctorSprite(enemy.x, enemy.y, performance.now() + enemy.x, enemy.sprayTimer > 2.05 || enemy.sprayTimer < 0.45);
    } else if (enemy.type === "bomber") {
      drawBomberSprite(enemy.x, enemy.y, performance.now() + enemy.x, enemy.throwTimer > 4.55 || enemy.throwTimer < 0.6);
    } else {
      drawKnifeEnemySprite(enemy.x, enemy.y, performance.now() + enemy.x, enemy.attack > 0.32);
    }
    ctx.fillStyle = "#e83f4f";
    ctx.fillRect(enemy.x - 4, enemy.y - 14, enemy.w + 8, 6);
    ctx.fillStyle = "#5bd36b";
    ctx.fillRect(enemy.x - 4, enemy.y - 14, (enemy.w + 8) * (enemy.hp / enemy.maxHp), 6);
  });

  bombs.forEach((bomb) => {
    ctx.fillStyle = "#202020";
    ctx.fillRect(bomb.x, bomb.y, 18, 18);
    ctx.fillStyle = "#ffcf33";
    ctx.fillRect(bomb.x + 13, bomb.y - 4, 5, 5);
  });

  sprays.forEach((spray) => {
    ctx.fillStyle = "#b9ff3d";
    ctx.fillRect(spray.x, spray.y, spray.w, spray.h);
    ctx.fillStyle = "#4af567";
    ctx.fillRect(spray.x + 5, spray.y - 5, 14, 5);
    ctx.fillRect(spray.x + 12, spray.y + 10, 18, 5);
    ctx.fillStyle = "#eaff9a";
    ctx.fillRect(spray.x + 2, spray.y + 2, 7, 4);
  });

  bullets.forEach((bullet) => {
    ctx.fillStyle = "#ffe45c";
    ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
  });

  stones.forEach((stone) => {
    ctx.fillStyle = "#8e9599";
    ctx.strokeStyle = "#17202a";
    ctx.fillRect(stone.x, stone.y, stone.w, stone.h);
    ctx.strokeRect(stone.x, stone.y, stone.w, stone.h);
  });

  ctx.fillStyle = "#f5f5f5";
  ctx.strokeStyle = "#17202a";
  ctx.lineWidth = 3;
  ctx.fillRect(finish.x, finish.y, finish.w, finish.h);
  ctx.strokeRect(finish.x, finish.y, finish.w, finish.h);
  ctx.fillStyle = "#17202a";
  ctx.font = `30px ${pixelFont}`;
  ctx.fillText("F", finish.x + 12, finish.y + 48);

  const playerPose = !player.onGround ? "jump" : Math.abs(player.vx) > 0.2 ? "walk" : "idle";
  drawPlayerSprite(player.x, player.y, player.hurtCooldown > 0, playerPose, player.dir);
  if (player.owTimer > 0) drawOwBubble(player.x + 8, player.y);
  if (player.punchCooldown > 0) {
    ctx.fillStyle = "#ffd9bd";
    ctx.strokeStyle = "#17202a";
    const fistX = player.dir > 0 ? player.x + 45 : player.x - 19;
    ctx.fillRect(fistX, player.y + 20, 18, 18);
    ctx.strokeRect(fistX, player.y + 20, 18, 18);
  }

  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillRect(p.x, p.y, p.size || 6, p.size || 6);
    ctx.globalAlpha = 1;
  });

  ctx.restore();

  if (won) {
    ctx.fillStyle = "rgb(255 255 255 / 0.78)";
    ctx.fillRect(160, 210, 800, 112);
    ctx.strokeStyle = "#17202a";
    ctx.strokeRect(160, 210, 800, 112);
    ctx.fillStyle = "#17202a";
    ctx.font = `44px ${pixelFont}`;
    ctx.fillText("CONGRATULATIONS! YOU HAVE WON!", 205, 280);
  }

  if (gameOver) {
    ctx.fillStyle = "rgb(255 255 255 / 0.82)";
    ctx.fillRect(315, 240, 490, 96);
    ctx.strokeStyle = "#17202a";
    ctx.strokeRect(315, 240, 490, 96);
    ctx.fillStyle = "#17202a";
    ctx.font = `36px ${pixelFont}`;
    ctx.fillText("GAME OVER - PRESS R", 365, 300);
  }

  heartsEl.textContent = "♥".repeat(player.lives) + "♡".repeat(3 - player.lives);
  weaponEl.textContent = player.hasGun ? "Gun ready" : "No gun";
}

function loop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (event.key === "f") punch();
  if (event.key === "j") shoot();
  if (event.key.toLowerCase() === "r") restart();
});

window.addEventListener("keyup", (event) => keys.delete(event.key));
canvas.addEventListener("pointerdown", shoot);
skipLevelBtn.addEventListener("click", skipLevel);

lightTntBtn.addEventListener("click", () => {
  if (pendingTnt) lightTnt(pendingTnt);
  pendingTnt = null;
  paused = false;
  tntDialog.classList.add("hidden");
});

skipTntBtn.addEventListener("click", () => {
  if (pendingTnt) pendingTnt.dismissed = true;
  pendingTnt = null;
  paused = false;
  tntDialog.classList.add("hidden");
  setStatus("TNT left alone.");
});

setupLevel();
requestAnimationFrame(loop);
