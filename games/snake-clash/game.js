"use strict";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const introPanel = document.querySelector("#introPanel");
const resultPanel = document.querySelector("#resultPanel");
const startButton = document.querySelector("#startButton");
const againButton = document.querySelector("#againButton");
const lengthValue = document.querySelector("#lengthValue");
const scoreValue = document.querySelector("#scoreValue");
const growthBar = document.querySelector("#growthBar");
const boostFill = document.querySelector("#boostMeter i");
const resultTitle = document.querySelector("#resultTitle");
const resultCopy = document.querySelector("#resultCopy");

const WORLD = { width: 2200, height: 1400 };
const DRAGON_LENGTH = 36;
const DRAGON_SEGMENTS = 12;
const DRAGON_MIN_SEGMENTS = 3;
const TAU = Math.PI * 2;
const rivalColors = ["#ff6b4a", "#ffd23f", "#5c9dff", "#f267c8", "#a96cff", "#ff9f38", "#55d6d2"];
const keys = new Set();
const pointer = { active: false, x: 0, y: 0, lastTap: 0 };

let dpr = 1;
let viewWidth = 1280;
let viewHeight = 720;
let state = "intro";
let player;
let rivals = [];
let particles = [];
let floaters = [];
let camera = { x: WORLD.width / 2, y: WORLD.height / 2 };
let score = 0;
let boost = 100;
let elapsed = 0;
let lastTime = performance.now();
let shake = 0;
let transformationTimer = 0;

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  viewWidth = rect.width;
  viewHeight = rect.height;
  canvas.width = Math.round(viewWidth * dpr);
  canvas.height = Math.round(viewHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function angleDifference(target, current) {
  return Math.atan2(Math.sin(target - current), Math.cos(target - current));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomPoint(margin = 160) {
  return {
    x: margin + Math.random() * (WORLD.width - margin * 2),
    y: margin + Math.random() * (WORLD.height - margin * 2)
  };
}

function makeSnake(options) {
  const spacing = options.isPlayer ? 25 : 22;
  const points = [];
  for (let i = 0; i < options.length; i += 1) {
    points.push({
      x: options.x - Math.cos(options.angle) * i * spacing,
      y: options.y - Math.sin(options.angle) * i * spacing
    });
  }
  return {
    ...options,
    points,
    spacing,
    targetAngle: options.angle,
    speed: options.isPlayer ? 205 : 118 + Math.random() * 34,
    baseSpeed: options.isPlayer ? 205 : 118 + Math.random() * 34,
    radius: options.isPlayer ? 18 : 15,
    turnSpeed: options.isPlayer ? 4.2 : 1.8 + Math.random() * .8,
    wander: Math.random() * 8,
    thinkTimer: 0,
    biteCooldown: 0,
    flash: 0,
    dead: false,
    dragon: false,
    invulnerable: 0
  };
}

function spawnRival(index) {
  let spot = randomPoint(190);
  if (player && distance(spot, player.points[0]) < 450) spot = randomPoint(190);
  return makeSnake({
    x: spot.x,
    y: spot.y,
    angle: Math.random() * TAU,
    length: 7 + Math.floor(Math.random() * 7),
    color: rivalColors[index % rivalColors.length],
    accent: index % 2 ? "#fff2a8" : "#ffe9dc",
    isPlayer: false,
    id: index
  });
}

function resetGame() {
  player = makeSnake({
    x: WORLD.width / 2,
    y: WORLD.height / 2,
    angle: 0,
    length: 8,
    color: "#42d35f",
    accent: "#baf044",
    isPlayer: true,
    id: "player"
  });
  rivals = rivalColors.map((_, index) => spawnRival(index));
  particles = [];
  floaters = [];
  score = 0;
  boost = 100;
  elapsed = 0;
  shake = 0;
  transformationTimer = 0;
  camera.x = player.points[0].x;
  camera.y = player.points[0].y;
  updateHud();
}

function startGame() {
  resetGame();
  state = "playing";
  introPanel.classList.add("hidden");
  resultPanel.classList.add("hidden");
}

function finishGame() {
  state = "lost";
  resultTitle.innerHTML = "DRAGON<br>DEFEATED";
  resultCopy.textContent = `The snakes ate your last armor section. Final score: ${score.toLocaleString()}.`;
  setTimeout(() => resultPanel.classList.remove("hidden"), 600);
}

function addSegment(snake) {
  const tail = snake.points[snake.points.length - 1];
  const before = snake.points[snake.points.length - 2] || tail;
  const angle = Math.atan2(tail.y - before.y, tail.x - before.x);
  snake.points.push({
    x: tail.x + Math.cos(angle) * snake.spacing,
    y: tail.y + Math.sin(angle) * snake.spacing
  });
}

function transformPlayer() {
  player.dragon = true;
  player.points = player.points.slice(0, DRAGON_SEGMENTS);
  player.radius = 22;
  player.spacing = 27;
  player.speed = 235;
  player.baseSpeed = 235;
  player.invulnerable = 2.5;
  transformationTimer = 3;
  shake = 22;
  for (let i = 0; i < 90; i += 1) {
    const angle = Math.random() * TAU;
    const speed = 60 + Math.random() * 250;
    particles.push({
      x: player.points[0].x,
      y: player.points[0].y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.3 + Math.random(),
      maxLife: 2,
      radius: 3 + Math.random() * 7,
      color: Math.random() > .5 ? "#35c7e8" : "#ffbf44",
      spark: true
    });
  }
  floaters.push({
    x: player.points[0].x,
    y: player.points[0].y + 65,
    text: "SURVIVE THE HUNT!",
    life: 2.4
  });
}

function updateHud() {
  const length = Math.min(player?.points.length || 8, DRAGON_LENGTH);
  const armor = Math.max(0, (player?.points.length || 0) - DRAGON_MIN_SEGMENTS);
  lengthValue.textContent = player?.dragon ? `DRAGON • ${armor} ARMOR` : `${length} / ${DRAGON_LENGTH}`;
  scoreValue.textContent = score.toLocaleString();
  growthBar.style.width = player?.dragon
    ? `${(armor / (DRAGON_SEGMENTS - DRAGON_MIN_SEGMENTS)) * 100}%`
    : `${(length / DRAGON_LENGTH) * 100}%`;
  boostFill.style.width = `${boost}%`;
}

function steerPlayer(dt) {
  const head = player.points[0];
  let dx = 0;
  let dy = 0;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) dx += 1;
  if (keys.has("ArrowUp") || keys.has("KeyW")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("KeyS")) dy += 1;

  if (dx || dy) {
    player.targetAngle = Math.atan2(dy, dx);
  } else if (pointer.active) {
    player.targetAngle = Math.atan2(pointer.y - viewHeight / 2, pointer.x - viewWidth / 2);
  }

  const isBoosting = (keys.has("Space") || pointer.boost) && boost > 1;
  const speed = player.baseSpeed * (isBoosting ? 1.65 : 1);
  boost = clamp(boost + (isBoosting ? -36 : 16) * dt, 0, 100);
  player.angle += angleDifference(player.targetAngle, player.angle) * Math.min(1, player.turnSpeed * dt);
  head.x += Math.cos(player.angle) * speed * dt;
  head.y += Math.sin(player.angle) * speed * dt;
  keepInWorld(player);
  followBody(player, dt);
}

function updateRival(rival, dt) {
  rival.thinkTimer -= dt;
  rival.biteCooldown -= dt;
  rival.flash = Math.max(0, rival.flash - dt * 4);
  const head = rival.points[0];
  const playerHead = player.points[0];
  const playerDist = distance(head, playerHead);

  if (rival.thinkTimer <= 0) {
    rival.thinkTimer = .35 + Math.random() * .55;
    if (player.dragon) {
      rival.targetAngle = Math.atan2(playerHead.y - head.y, playerHead.x - head.x);
      rival.targetAngle += (Math.random() - .5) * .25;
    } else if (playerDist < 330) {
      const away = player.points.length > rival.points.length;
      rival.targetAngle = Math.atan2(playerHead.y - head.y, playerHead.x - head.x) + (away ? Math.PI : 0);
      rival.targetAngle += (Math.random() - .5) * .8;
    } else {
      rival.wander += (Math.random() - .5) * 1.4;
      rival.targetAngle = rival.wander;
    }
    if (head.x < 180) rival.targetAngle = 0;
    if (head.x > WORLD.width - 180) rival.targetAngle = Math.PI;
    if (head.y < 180) rival.targetAngle = Math.PI / 2;
    if (head.y > WORLD.height - 180) rival.targetAngle = -Math.PI / 2;
  }

  rival.angle += angleDifference(rival.targetAngle, rival.angle) * Math.min(1, rival.turnSpeed * dt);
  const panic = player.dragon ? 1.42 : (playerDist < 260 ? 1.28 : 1);
  head.x += Math.cos(rival.angle) * rival.baseSpeed * panic * dt;
  head.y += Math.sin(rival.angle) * rival.baseSpeed * panic * dt;
  keepInWorld(rival);
  followBody(rival, dt);
}

function keepInWorld(snake) {
  const head = snake.points[0];
  const margin = 55;
  if (head.x < margin) { head.x = margin; snake.angle = snake.targetAngle = 0; }
  if (head.x > WORLD.width - margin) { head.x = WORLD.width - margin; snake.angle = snake.targetAngle = Math.PI; }
  if (head.y < margin) { head.y = margin; snake.angle = snake.targetAngle = Math.PI / 2; }
  if (head.y > WORLD.height - margin) { head.y = WORLD.height - margin; snake.angle = snake.targetAngle = -Math.PI / 2; }
}

function followBody(snake, dt) {
  for (let i = 1; i < snake.points.length; i += 1) {
    const leader = snake.points[i - 1];
    const point = snake.points[i];
    const dx = leader.x - point.x;
    const dy = leader.y - point.y;
    const dist = Math.hypot(dx, dy) || 1;
    const difference = dist - snake.spacing;
    const pull = Math.min(1, dt * 20);
    point.x += (dx / dist) * difference * pull;
    point.y += (dy / dist) * difference * pull;
  }
}

function checkBites() {
  if (player.biteCooldown > 0) return;
  const head = player.points[0];
  for (const rival of rivals) {
    if (rival.dead) continue;
    let hitIndex = -1;
    for (let i = 0; i < rival.points.length; i += 1) {
      if (distance(head, rival.points[i]) < player.radius + rival.radius + 4) {
        hitIndex = i;
        break;
      }
    }
    if (hitIndex < 0) continue;

    player.biteCooldown = .28;
    rival.flash = 1;
    shake = 8;
    const eaten = rival.points.splice(Math.max(0, rival.points.length - 1), 1)[0];
    if (!player.dragon) addSegment(player);
    score += player.dragon ? 200 : 125;
    burst(eaten.x, eaten.y, rival.color, 12);
    floaters.push({ x: eaten.x, y: eaten.y, text: player.dragon ? "CRUNCH!" : "+1 CIRCLE", life: 1 });

    if (rival.points.length <= 2) {
      rival.dead = true;
      score += 500;
      burst(rival.points[0].x, rival.points[0].y, rival.color, 28);
      setTimeout(() => {
        const index = rivals.indexOf(rival);
        if (index >= 0 && state === "playing") rivals[index] = spawnRival(rival.id);
      }, 1200);
    }

    if (!player.dragon && player.points.length >= DRAGON_LENGTH) transformPlayer();
    updateHud();
    break;
  }
}

function checkRivalBites() {
  if (!player.dragon || player.invulnerable > 0) return;

  for (const rival of rivals) {
    if (rival.dead || rival.biteCooldown > 0) continue;
    const rivalHead = rival.points[0];
    const hit = player.points.some(point => (
      distance(rivalHead, point) < player.radius + rival.radius + 2
    ));
    if (!hit) continue;

    const eaten = player.points.pop();
    player.invulnerable = .75;
    rival.biteCooldown = 1.25;
    rival.targetAngle += Math.PI;
    shake = 12;
    burst(eaten.x, eaten.y, "#35c7e8", 18);
    floaters.push({ x: eaten.x, y: eaten.y, text: "-1 ARMOR", life: 1.2 });
    updateHud();

    if (player.points.length <= DRAGON_MIN_SEGMENTS) finishGame();
    return;
  }
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * TAU;
    const speed = 45 + Math.random() * 140;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: .45 + Math.random() * .65,
      maxLife: 1.1,
      radius: 2 + Math.random() * 5,
      color,
      spark: false
    });
  }
}

function updateEffects(dt) {
  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= .98;
    particle.vy *= .98;
    particle.life -= dt;
  }
  particles = particles.filter(particle => particle.life > 0);

  for (const floater of floaters) {
    floater.y -= 42 * dt;
    floater.life -= dt;
  }
  floaters = floaters.filter(floater => floater.life > 0);
}

function update(dt) {
  elapsed += dt;
  updateEffects(dt);
  shake = Math.max(0, shake - dt * 24);
  transformationTimer = Math.max(0, transformationTimer - dt);
  if (state !== "playing") return;

  player.biteCooldown = Math.max(0, player.biteCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  steerPlayer(dt);
  for (const rival of rivals) if (!rival.dead) updateRival(rival, dt);
  checkBites();
  checkRivalBites();
  camera.x += (player.points[0].x - camera.x) * Math.min(1, dt * 4.5);
  camera.y += (player.points[0].y - camera.y) * Math.min(1, dt * 4.5);
  updateHud();
}

function worldToScreen(point) {
  return {
    x: point.x - camera.x + viewWidth / 2,
    y: point.y - camera.y + viewHeight / 2
  };
}

function drawBackground() {
  const gradient = ctx.createRadialGradient(viewWidth * .5, viewHeight * .45, 30, viewWidth * .5, viewHeight * .5, Math.max(viewWidth, viewHeight) * .8);
  gradient.addColorStop(0, "#319065");
  gradient.addColorStop(.55, "#176747");
  gradient.addColorStop(1, "#0a4438");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  ctx.save();
  ctx.translate(-camera.x + viewWidth / 2, -camera.y + viewHeight / 2);
  ctx.strokeStyle = "rgba(218, 246, 155, .09)";
  ctx.lineWidth = 2;
  const grid = 80;
  const startX = Math.floor((camera.x - viewWidth / 2) / grid) * grid;
  const endX = camera.x + viewWidth / 2 + grid;
  const startY = Math.floor((camera.y - viewHeight / 2) / grid) * grid;
  const endY = camera.y + viewHeight / 2 + grid;
  for (let x = startX; x < endX; x += grid) {
    ctx.beginPath();
    for (let y = startY; y < endY; y += 16) {
      const wobble = Math.sin(y * .025 + x) * 3;
      if (y === startY) ctx.moveTo(x + wobble, y);
      else ctx.lineTo(x + wobble, y);
    }
    ctx.stroke();
  }
  for (let y = startY; y < endY; y += grid) {
    ctx.beginPath();
    for (let x = startX; x < endX; x += 16) {
      const wobble = Math.cos(x * .025 + y) * 3;
      if (x === startX) ctx.moveTo(x, y + wobble);
      else ctx.lineTo(x, y + wobble);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(219, 255, 123, .35)";
  ctx.lineWidth = 10;
  ctx.setLineDash([18, 15]);
  ctx.strokeRect(35, 35, WORLD.width - 70, WORLD.height - 70);
  ctx.setLineDash([]);

  for (let x = 120; x < WORLD.width; x += 210) {
    for (let y = 95; y < WORLD.height; y += 190) {
      const seed = Math.sin(x * 11.7 + y * 3.1);
      const px = x + seed * 42;
      const py = y + Math.cos(seed * 9) * 34;
      ctx.fillStyle = "rgba(191, 229, 102, .13)";
      ctx.beginPath();
      ctx.arc(px, py, 5 + Math.abs(seed) * 5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(4, 65, 48, .25)";
      ctx.beginPath();
      ctx.ellipse(px + 10, py - 9, 11, 4, -.6, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(viewWidth / 2, viewHeight / 2, viewHeight * .2, viewWidth / 2, viewHeight / 2, viewWidth * .7);
  vignette.addColorStop(.55, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,26,21,.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, viewWidth, viewHeight);
}

function drawSnake(snake) {
  if (snake.dead) return;
  const points = snake.points;
  const head = worldToScreen(points[0]);
  const angle = snake.angle;

  ctx.save();
  ctx.globalAlpha = .25;
  ctx.fillStyle = "#001f18";
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const p = worldToScreen(points[i]);
    const radius = snake.radius * (i === 0 ? 1.1 : Math.max(.55, 1 - i / points.length * .35));
    ctx.beginPath();
    ctx.ellipse(p.x + 5, p.y + 9, radius * 1.05, radius * .68, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  for (let i = points.length - 1; i >= 1; i -= 1) {
    const p = worldToScreen(points[i]);
    const taper = Math.max(.58, 1 - i / points.length * .37);
    const radius = snake.radius * taper;
    if (snake.dragon) drawDragonSegment(p.x, p.y, radius, i, points.length);
    else drawBodyCircle(p.x, p.y, radius, snake, i);
  }

  if (snake.dragon) drawDragonHead(head.x, head.y, angle);
  else drawSnakeHead(head.x, head.y, angle, snake);
}

function drawBodyCircle(x, y, radius, snake, index) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#153d31";
  ctx.beginPath();
  ctx.arc(0, 0, radius + 3, 0, TAU);
  ctx.fill();

  const gradient = ctx.createRadialGradient(-radius * .35, -radius * .45, 1, 0, 0, radius);
  gradient.addColorStop(0, snake.flash ? "#ffffff" : snake.accent);
  gradient.addColorStop(.35, snake.color);
  gradient.addColorStop(1, shadeColor(snake.color, -.25));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,.27)";
  ctx.beginPath();
  ctx.ellipse(-radius * .28, -radius * .38, radius * .24, radius * .14, -.5, 0, TAU);
  ctx.fill();

  if (index % 2 === 0) {
    ctx.fillStyle = snake.accent;
    ctx.beginPath();
    ctx.moveTo(-radius * .32, 0);
    ctx.lineTo(0, -radius * .28);
    ctx.lineTo(radius * .32, 0);
    ctx.lineTo(0, radius * .28);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawSnakeHead(x, y, angle, snake) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "#153d31";
  ctx.beginPath();
  ctx.ellipse(4, 0, snake.radius * 1.42, snake.radius * 1.15, 0, 0, TAU);
  ctx.fill();

  const gradient = ctx.createLinearGradient(-15, -15, 18, 15);
  gradient.addColorStop(0, snake.accent);
  gradient.addColorStop(.45, snake.color);
  gradient.addColorStop(1, shadeColor(snake.color, -.28));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(4, 0, snake.radius * 1.2, snake.radius, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#fffbe8";
  for (const ey of [-snake.radius * .48, snake.radius * .48]) {
    ctx.beginPath();
    ctx.ellipse(10, ey, 6, 7.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#13261f";
    ctx.beginPath();
    ctx.ellipse(12, ey, 2.4, 4.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fffbe8";
  }

  ctx.strokeStyle = "#153d31";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(16, 0, 6, Math.PI * .34, Math.PI * 1.66);
  ctx.stroke();

  ctx.strokeStyle = "#f25a68";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(32, 0);
  ctx.lineTo(36, -4);
  ctx.moveTo(32, 0);
  ctx.lineTo(36, 4);
  ctx.stroke();
  ctx.restore();
}

function drawDragonSegment(x, y, radius, index) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#102e3d";
  ctx.beginPath();
  ctx.arc(0, 0, radius + 4, 0, TAU);
  ctx.fill();
  const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
  gradient.addColorStop(0, index % 2 ? "#49d9f2" : "#2b87d3");
  gradient.addColorStop(.55, "#08779e");
  gradient.addColorStop(1, "#154368");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#ffb23c";
  ctx.strokeStyle = "#753d20";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -radius - 10);
  ctx.lineTo(-6, -radius + 1);
  ctx.lineTo(7, -radius + 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(149,243,255,.65)";
  ctx.beginPath();
  ctx.moveTo(-radius * .5, 0);
  ctx.lineTo(0, -radius * .45);
  ctx.lineTo(radius * .5, 0);
  ctx.lineTo(0, radius * .45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDragonHead(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "#102e3d";
  ctx.beginPath();
  ctx.moveTo(-24, -19);
  ctx.lineTo(19, -24);
  ctx.lineTo(33, -13);
  ctx.lineTo(40, 0);
  ctx.lineTo(33, 13);
  ctx.lineTo(19, 24);
  ctx.lineTo(-24, 19);
  ctx.closePath();
  ctx.fill();

  const gradient = ctx.createLinearGradient(-20, -20, 35, 18);
  gradient.addColorStop(0, "#36d5ed");
  gradient.addColorStop(.5, "#1579bd");
  gradient.addColorStop(1, "#173858");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-20, -15);
  ctx.lineTo(18, -19);
  ctx.lineTo(34, -10);
  ctx.lineTo(38, 0);
  ctx.lineTo(34, 10);
  ctx.lineTo(18, 19);
  ctx.lineTo(-20, 15);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffbb40";
  ctx.strokeStyle = "#75421e";
  ctx.lineWidth = 2;
  for (const hy of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-8, hy * 15);
    ctx.lineTo(-18, hy * 30);
    ctx.lineTo(2, hy * 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = "#fff3a5";
  for (const ey of [-10, 10]) {
    ctx.beginPath();
    ctx.ellipse(20, ey, 7, 5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1b2634";
    ctx.beginPath();
    ctx.ellipse(23, ey, 3, 4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff3a5";
  }
  ctx.restore();
}

function shadeColor(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const r = clamp((value >> 16) + amount * 255, 0, 255);
  const g = clamp(((value >> 8) & 255) + amount * 255, 0, 255);
  const b = clamp((value & 255) + amount * 255, 0, 255);
  return `rgb(${r},${g},${b})`;
}

function drawEffects() {
  for (const particle of particles) {
    const p = worldToScreen(particle);
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    if (particle.spark) {
      ctx.moveTo(p.x, p.y - particle.radius * 2);
      ctx.lineTo(p.x + particle.radius, p.y);
      ctx.lineTo(p.x, p.y + particle.radius * 2);
      ctx.lineTo(p.x - particle.radius, p.y);
      ctx.closePath();
    } else {
      ctx.arc(p.x, p.y, particle.radius, 0, TAU);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const floater of floaters) {
    const p = worldToScreen(floater);
    ctx.globalAlpha = floater.life;
    ctx.fillStyle = "#fff5a3";
    ctx.strokeStyle = "#153d31";
    ctx.lineWidth = 5;
    ctx.font = "900 16px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(floater.text, p.x, p.y);
    ctx.fillText(floater.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

function drawMinimap() {
  if (state === "intro") return;
  const width = 150;
  const height = 92;
  const x = viewWidth - width - 24;
  const y = 70;
  ctx.save();
  ctx.globalAlpha = .78;
  ctx.fillStyle = "#073b31";
  ctx.strokeStyle = "#d6f079";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 12);
  ctx.fill();
  ctx.stroke();
  for (const rival of rivals) {
    if (rival.dead) continue;
    ctx.fillStyle = rival.color;
    ctx.beginPath();
    ctx.arc(x + rival.points[0].x / WORLD.width * width, y + rival.points[0].y / WORLD.height * height, 3, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = player.dragon ? "#44d7ed" : "#b9f23c";
  ctx.beginPath();
  ctx.arc(x + player.points[0].x / WORLD.width * width, y + player.points[0].y / WORLD.height * height, 4.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawTransformation() {
  if (transformationTimer <= 0) return;
  const alpha = Math.min(1, transformationTimer) * Math.min(1, (3 - transformationTimer) * 2);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${Math.min(76, viewWidth * .09)}px "Bowlby One SC", sans-serif`;
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#12394a";
  ctx.fillStyle = "#fff29c";
  ctx.strokeText("DRAGON AWAKENED!", viewWidth / 2, viewHeight * .72);
  ctx.fillText("DRAGON AWAKENED!", viewWidth / 2, viewHeight * .72);
  ctx.restore();
}

function draw() {
  ctx.save();
  const offsetX = shake ? (Math.random() - .5) * shake : 0;
  const offsetY = shake ? (Math.random() - .5) * shake : 0;
  ctx.translate(offsetX, offsetY);
  drawBackground();
  const ordered = [...rivals.filter(rival => !rival.dead), player].sort((a, b) => a.points[0].y - b.points[0].y);
  for (const snake of ordered) drawSnake(snake);
  drawEffects();
  ctx.restore();
  drawMinimap();
  drawTransformation();
}

function frame(now) {
  const dt = Math.min(.035, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", event => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if ((event.code === "Enter" || event.code === "Space") && state === "intro") startGame();
});
window.addEventListener("keyup", event => keys.delete(event.code));
canvas.addEventListener("pointermove", event => {
  updatePointer(event);
  pointer.active = true;
});
canvas.addEventListener("pointerdown", event => {
  updatePointer(event);
  pointer.active = true;
  const now = performance.now();
  if (now - pointer.lastTap < 320) pointer.boost = true;
  pointer.lastTap = now;
  canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointerup", event => {
  pointer.boost = false;
  canvas.releasePointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointerleave", () => { pointer.boost = false; });
startButton.addEventListener("click", startGame);
againButton.addEventListener("click", startGame);

resize();
resetGame();
requestAnimationFrame(frame);
