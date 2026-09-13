const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const selectScreen = document.querySelector("#selectScreen");
const gameScreen = document.querySelector("#gameScreen");
const startButton = document.querySelector("#startButton");
const enterButton = document.querySelector("#enterButton");
const livesEl = document.querySelector("#lives");
const scoreEl = document.querySelector("#score");
const keyStatusEl = document.querySelector("#keyStatus");
const characterCards = [...document.querySelectorAll(".character-card")];

const cats = {
  milo: {
    name: "Milo",
    body: "#e9832f",
    trim: "#a8511d",
    patch: "#ff9f22",
    horn: "#be641f",
    eye: "#1d110d",
    nose: "#241008",
    speed: 3.6,
    power: 1,
  },
  pepper: {
    name: "Pepper",
    body: "#1f1f22",
    trim: "#111114",
    patch: "#151517",
    horn: "#e6cfad",
    eye: "#b8bdc2",
    nose: "#2a0d04",
    speed: 4.25,
    power: 1,
  },
  nimbus: {
    name: "Nimbus",
    body: "#2f83e6",
    trim: "#174b91",
    patch: "#f5f7fb",
    horn: "#c8c9cc",
    eye: "#3b160c",
    nose: "#2b1208",
    speed: 3.25,
    power: 1.45,
  },
};

let selectedCat = "milo";
let keys = new Set();
let bullets = [];
let dogs = [];
let particles = [];
let dogTimer = 0;
let boss = null;
let keyDrop = null;
let gameOver = false;
let win = false;
let rescueMessageTimer = 0;
let animationFrame = 0;
let aimTarget = { x: 220, y: 270, active: false };

const dogsBeforeBoss = 5;

const player = {
  x: 110,
  y: 270,
  r: 22,
  lives: 5,
  score: 0,
  hasKey: false,
  invulnerable: 0,
  facingX: 1,
  facingY: 0,
  shootCooldown: 0,
};

const cage = { x: 820, y: 238, w: 88, h: 92 };

characterCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedCat = card.dataset.cat;
    characterCards.forEach((item) => item.classList.toggle("is-selected", item === card));
  });
});

startButton.addEventListener("click", startGame);
enterButton.addEventListener("click", tryRescue);

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(event.key)) {
    event.preventDefault();
  }
  keys.add(event.key.toLowerCase());
  if (event.key === " ") shoot();
  if (event.key === "Enter") tryRescue();
  if ((gameOver || win) && event.key.toLowerCase() === "r") startGame();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("pointerdown", (event) => {
  if (gameOver || win) return;
  updateAimFromPointer(event);
  shoot();
});

canvas.addEventListener("pointermove", (event) => {
  if (selectScreen.hidden && !gameOver && !win) updateAimFromPointer(event);
});

canvas.addEventListener("mousemove", (event) => {
  if (selectScreen.hidden && !gameOver && !win) updateAimFromPointer(event);
});

canvas.addEventListener("pointerleave", () => {
  aimTarget.active = false;
});

function startGame() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  selectScreen.hidden = true;
  gameScreen.hidden = false;
  Object.assign(player, {
    x: 110,
    y: 270,
    lives: 5,
    score: 0,
    hasKey: false,
    invulnerable: 0,
    facingX: 1,
    facingY: 0,
    shootCooldown: 0,
  });
  aimTarget = { x: player.x + 120, y: player.y, active: false };
  bullets = [];
  dogs = [];
  particles = [];
  boss = null;
  keyDrop = null;
  dogTimer = 0;
  gameOver = false;
  win = false;
  rescueMessageTimer = 0;
  updateHud();
  requestAnimationFrame(loop);
}

function loop() {
  update();
  draw();
  if (!selectScreen.hidden) return;
  animationFrame = requestAnimationFrame(loop);
}

function update() {
  if (gameOver || win) return;

  const cat = cats[selectedCat];
  let dx = 0;
  let dy = 0;
  if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
  if (keys.has("d") || keys.has("arrowright")) dx += 1;
  if (keys.has("w") || keys.has("arrowup")) dy -= 1;
  if (keys.has("s") || keys.has("arrowdown")) dy += 1;
  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;
    player.x += dx * cat.speed;
    player.y += dy * cat.speed;
    if (!aimTarget.active) {
      player.facingX = dx;
      player.facingY = dy;
    }
  }
  player.x = clamp(player.x, 34, canvas.width - 34);
  player.y = clamp(player.y, 58, canvas.height - 34);
  player.invulnerable = Math.max(0, player.invulnerable - 1);
  player.shootCooldown = Math.max(0, player.shootCooldown - 1);

  dogTimer -= 1;
  if (dogTimer <= 0 && !boss && player.score < dogsBeforeBoss) {
    dogs.push(makeDog());
    dogTimer = 62;
  }

  if (!boss && player.score >= dogsBeforeBoss && !keyDrop) {
    boss = makeBoss();
  }

  bullets.forEach((bullet) => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life -= 1;
  });
  bullets = bullets.filter((bullet) => bullet.life > 0 && bullet.x > -20 && bullet.x < canvas.width + 20 && bullet.y > -20 && bullet.y < canvas.height + 20);

  dogs.forEach(moveEnemy);
  if (boss) moveEnemy(boss);

  handleBulletHits();
  handlePlayerHits();
  handleKeyPickup();

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= 1;
  });
  particles = particles.filter((particle) => particle.life > 0);
  rescueMessageTimer = Math.max(0, rescueMessageTimer - 1);
}

function makeDog() {
  const side = Math.random() > 0.5 ? -40 : canvas.width + 40;
  return {
    x: side,
    y: 78 + Math.random() * (canvas.height - 126),
    r: 22,
    hp: 2,
    speed: 1.45 + Math.random() * 0.45,
    boss: false,
  };
}

function makeBoss() {
  rescueMessageTimer = 160;
  return {
    x: canvas.width + 84,
    y: canvas.height / 2,
    r: 54,
    hp: 18,
    maxHp: 18,
    speed: 1.05,
    boss: true,
  };
}

function moveEnemy(enemy) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const len = Math.hypot(dx, dy) || 1;
  enemy.x += (dx / len) * enemy.speed;
  enemy.y += (dy / len) * enemy.speed;
}

function shoot() {
  if (player.shootCooldown > 0 || gameOver || win || selectScreen.hidden === false) return;
  const cat = cats[selectedCat];
  const aim = getAimDirection();
  const fx = aim.x;
  const fy = aim.y;
  bullets.push({
    x: player.x + fx * 22,
    y: player.y + fy * 22,
    vx: fx * 9,
    vy: fy * 9,
    damage: cat.power,
    life: 72,
  });
  player.shootCooldown = selectedCat === "nimbus" ? 16 : 12;
  burst(player.x + fx * 26, player.y + fy * 26, "#ffe05c", 4);
}

function updateAimFromPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  aimTarget = {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
    active: true,
  };
  const aim = getAimDirection();
  player.facingX = aim.x;
  player.facingY = aim.y;
}

function getAimDirection() {
  const targetX = aimTarget.active ? aimTarget.x : player.x + player.facingX * 80;
  const targetY = aimTarget.active ? aimTarget.y : player.y + player.facingY * 80;
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function handleBulletHits() {
  for (const bullet of bullets) {
    for (const dog of dogs) {
      if (distance(bullet, dog) < dog.r + 8) {
        bullet.life = 0;
        dog.hp -= bullet.damage;
        burst(dog.x, dog.y, "#d94c3f", 8);
      }
    }
    if (boss && distance(bullet, boss) < boss.r + 8) {
      bullet.life = 0;
      boss.hp -= bullet.damage;
      burst(boss.x, boss.y, "#8d3d37", 10);
      if (boss.hp <= 0) {
        keyDrop = { x: boss.x, y: boss.y };
        burst(boss.x, boss.y, "#ffd65a", 36);
        boss = null;
      }
    }
  }

  const before = dogs.length;
  dogs = dogs.filter((dog) => dog.hp > 0);
  player.score += before - dogs.length;
  updateHud();
}

function handlePlayerHits() {
  if (player.invulnerable > 0) return;
  const enemies = boss ? [...dogs, boss] : dogs;
  for (const enemy of enemies) {
    if (distance(player, enemy) < player.r + enemy.r - 4) {
      player.lives -= 1;
      player.invulnerable = 90;
      burst(player.x, player.y, "#ffffff", 18);
      updateHud();
      if (player.lives <= 0) gameOver = true;
      return;
    }
  }
}

function handleKeyPickup() {
  if (keyDrop && distance(player, keyDrop) < 36) {
    player.hasKey = true;
    keyDrop = null;
    rescueMessageTimer = 160;
    updateHud();
  }
  const atCage = player.hasKey && player.x > cage.x - 70 && player.y > cage.y - 70 && player.y < cage.y + cage.h + 70;
  enterButton.disabled = !atCage;
}

function tryRescue() {
  const atCage = player.hasKey && player.x > cage.x - 70 && player.y > cage.y - 70 && player.y < cage.y + cage.h + 70;
  if (atCage && !gameOver) {
    win = true;
    burst(cage.x + cage.w / 2, cage.y + cage.h / 2, "#2b8c67", 54);
  } else if (player.hasKey) {
    rescueMessageTimer = 110;
  }
}

function updateHud() {
  livesEl.textContent = player.lives;
  scoreEl.textContent = player.score;
  keyStatusEl.textContent = player.hasKey ? "Yes" : "No";
}

function draw() {
  drawRoom();
  drawCage();
  bullets.forEach(drawBullet);
  dogs.forEach(drawDog);
  if (boss) drawDog(boss);
  if (keyDrop) drawKey(keyDrop.x, keyDrop.y);
  drawAimGuide();
  drawCat();
  particles.forEach(drawParticle);
  drawMessages();
}

function drawRoom() {
  ctx.fillStyle = "#ffe8b8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#dba367";
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.fillRect(x, canvas.height - 74, 28, 8);
  }
  ctx.fillStyle = "#73a58e";
  ctx.fillRect(0, 0, canvas.width, 52);
  ctx.fillStyle = "#1c1714";
  ctx.fillRect(0, 48, canvas.width, 5);
  ctx.fillStyle = "#fff5d9";
  ctx.fillRect(62, 92, 118, 84);
  ctx.fillStyle = "#9bc1d1";
  ctx.fillRect(74, 104, 42, 60);
  ctx.fillRect(128, 104, 42, 60);
}

function drawCage() {
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(cage.x, cage.y, cage.w, cage.h);
  ctx.fillStyle = "#2d2521";
  for (let x = cage.x + 10; x < cage.x + cage.w; x += 18) {
    ctx.fillRect(x, cage.y, 7, cage.h);
  }
  ctx.fillStyle = "#ffd6ca";
  ctx.fillRect(cage.x + 18, cage.y + 34, 14, 18);
  ctx.fillRect(cage.x + 48, cage.y + 34, 14, 18);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cage.x + 24, cage.y + 56, 34, 12);
  ctx.fillStyle = "#ffcf4f";
  ctx.fillRect(cage.x + cage.w - 18, cage.y + 43, 12, 12);
}

function drawAimGuide() {
  if (gameOver || win || selectScreen.hidden === false) return;
  const aim = getAimDirection();
  const endX = aimTarget.active ? aimTarget.x : player.x + aim.x * 92;
  const endY = aimTarget.active ? aimTarget.y : player.y + aim.y * 92;
  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.strokeStyle = "#246a91";
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(player.x + aim.x * 28, player.y + aim.y * 28);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#1c1714";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(endX - 13, endY);
  ctx.lineTo(endX + 13, endY);
  ctx.moveTo(endX, endY - 13);
  ctx.lineTo(endX, endY + 13);
  ctx.stroke();
  ctx.strokeStyle = "#ffe05c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(endX, endY, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCat() {
  const cat = cats[selectedCat];
  const blink = player.invulnerable > 0 && Math.floor(player.invulnerable / 6) % 2 === 0;
  if (blink) return;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = cat.trim;
  ctx.fillRect(18, -40, 9, 14);
  ctx.fillRect(25, -54, 9, 20);
  ctx.fillRect(31, -66, 9, 18);
  ctx.fillStyle = cat.body;
  ctx.fillRect(-18, -12, 44, 28);
  ctx.fillRect(-20, -28, 34, 24);
  ctx.fillRect(22, -6, 14, 14);
  ctx.fillStyle = cat.trim;
  ctx.fillRect(-24, -20, 10, 8);
  ctx.fillRect(13, -20, 12, 8);
  ctx.fillStyle = cat.horn;
  ctx.fillRect(-16, -40, 10, 16);
  ctx.fillRect(4, -40, 10, 16);
  ctx.fillStyle = cat.eye;
  ctx.fillRect(-11, -23, 6, 7);
  ctx.fillRect(5, -23, 6, 7);
  ctx.fillStyle = cat.nose;
  ctx.fillRect(-3, -13, 7, 6);
  ctx.fillStyle = cat.patch;
  ctx.fillRect(-12, 1, 15, 16);
  ctx.fillRect(-6, 13, 18, 10);
  ctx.fillStyle = cat.body;
  ctx.fillRect(-17, 12, 10, 10);
  ctx.fillRect(4, 12, 10, 10);
  ctx.fillStyle = cat.trim;
  ctx.fillRect(-18, 21, 10, 8);
  ctx.fillRect(5, 21, 10, 8);
  ctx.restore();
}

function drawDog(dog) {
  ctx.save();
  ctx.translate(dog.x, dog.y);
  const size = dog.boss ? 2.1 : 1;
  ctx.scale(size, size);
  ctx.fillStyle = dog.boss ? "#7d3e32" : "#9a5a38";
  ctx.fillRect(-24, -16, 48, 32);
  ctx.fillRect(-18, -32, 36, 22);
  ctx.fillStyle = "#4a2920";
  ctx.fillRect(-22, -42, 14, 16);
  ctx.fillRect(8, -42, 14, 16);
  ctx.fillStyle = "#1c1714";
  ctx.fillRect(-9, -23, 6, 6);
  ctx.fillRect(8, -23, 6, 6);
  ctx.fillRect(-3, -12, 9, 5);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-18, 12, 10, 12);
  ctx.fillRect(8, 12, 10, 12);
  ctx.restore();

  if (dog.boss) {
    ctx.fillStyle = "#1c1714";
    ctx.fillRect(dog.x - 64, dog.y - 86, 128, 10);
    ctx.fillStyle = "#d94c3f";
    ctx.fillRect(dog.x - 62, dog.y - 84, 124 * Math.max(0, dog.hp / dog.maxHp), 6);
  }
}

function drawBullet(bullet) {
  ctx.fillStyle = "#ffe05c";
  ctx.fillRect(bullet.x - 5, bullet.y - 5, 10, 10);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
}

function drawKey(x, y) {
  ctx.fillStyle = "#ffcf4f";
  ctx.fillRect(x - 7, y - 7, 14, 14);
  ctx.fillRect(x + 7, y - 2, 24, 6);
  ctx.fillRect(x + 24, y - 2, 5, 13);
  ctx.fillStyle = "#8a5c00";
  ctx.fillRect(x - 2, y - 2, 4, 4);
}

function drawParticle(particle) {
  ctx.globalAlpha = Math.max(0, particle.life / 28);
  ctx.fillStyle = particle.color;
  ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  ctx.globalAlpha = 1;
}

function drawMessages() {
  ctx.textAlign = "center";
  ctx.font = "900 28px Trebuchet MS";
  ctx.fillStyle = "#1c1714";
  if (boss && rescueMessageTimer > 0) {
    ctx.fillText("Big dog incoming!", canvas.width / 2, 96);
  } else if (player.hasKey && rescueMessageTimer > 0) {
    ctx.fillText("Key collected. Go to the cage and press Enter.", canvas.width / 2, 96);
  }

  if (gameOver || win) {
    ctx.fillStyle = "rgba(28, 23, 20, 0.76)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff6e6";
    ctx.font = "900 48px Trebuchet MS";
    ctx.fillText(win ? "Cats Freed!" : "Try Again", canvas.width / 2, canvas.height / 2 - 24);
    ctx.font = "900 22px Trebuchet MS";
    ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 24);
  }
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: 3 + Math.random() * 5,
      life: 16 + Math.random() * 18,
    });
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

draw();
