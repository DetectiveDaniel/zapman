const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const levelEl = document.querySelector("#level");
const restartBtn = document.querySelector("#restart");
const gameShell = document.querySelector(".game-shell");
const startBtn = document.querySelector("#start");

const colors = [
  { name: "red", base: "#ff231d", dark: "#a20b06", glow: "rgba(255, 60, 44, 0.8)" },
  { name: "blue", base: "#24a8ff", dark: "#0759a4", glow: "rgba(72, 188, 255, 0.8)" },
  { name: "yellow", base: "#ffdf22", dark: "#c88600", glow: "rgba(255, 228, 38, 0.8)" },
  { name: "green", base: "#19e436", dark: "#07891c", glow: "rgba(37, 255, 63, 0.72)" },
  { name: "orange", base: "#ff9a26", dark: "#b94f04", glow: "rgba(255, 161, 54, 0.74)" },
  { name: "pink", base: "#ff8dca", dark: "#b92b78", glow: "rgba(255, 153, 211, 0.74)" }
];

const state = {
  bubbles: [],
  particles: [],
  shots: [],
  nextColor: randomColor(),
  aim: { x: 470, y: 335, active: false },
  score: 0,
  flow: 0,
  level: 1,
  levelBannerTimer: 0,
  dropTimer: 0,
  gameOver: false,
  playing: false,
  gameOverPulse: 0,
  lastTime: 0
};

const sling = { x: 474, y: 560, forkY: 486, pocketY: 514 };
const hole = { x: 318, y: 584, rx: 72, ry: 24 };
const bubbleRadius = 27;
const bubbleGap = 51;
const snakeSpeed = 19;
const loopBoost = 1.55;
const path = buildPath();

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function buildPath() {
  const points = [];

  addCubic(points, { x: 980, y: 88 }, { x: 885, y: 50 }, { x: 858, y: 202 }, { x: 756, y: 180 }, 44);
  addLoop(points, { x: 704, y: 132 }, 38, 82, 0.75, 0.75 + Math.PI * 1.9, 72);
  addCubic(points, last(points), { x: 638, y: 214 }, { x: 540, y: 202 }, { x: 474, y: 171 }, 38);
  addLoop(points, { x: 414, y: 153 }, 30, 60, 0.45, 0.45 + Math.PI * 1.9, 58);
  addCubic(points, last(points), { x: 360, y: 218 }, { x: 276, y: 228 }, { x: 226, y: 190 }, 36);
  addLoop(points, { x: 172, y: 184 }, 28, 48, 0.25, 0.25 + Math.PI * 1.9, 50);
  addCubic(points, last(points), { x: 132, y: 248 }, { x: 214, y: 405 }, { x: hole.x, y: hole.y }, 70);

  let length = 0;
  const loopRanges = [];
  let activeLoop = null;

  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const point = points[i];
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    point.distance = length;

    if (point.loop && !activeLoop) {
      activeLoop = { start: previous.distance ?? 0, end: length };
    } else if (point.loop && activeLoop) {
      activeLoop.end = length;
    } else if (!point.loop && activeLoop) {
      loopRanges.push(activeLoop);
      activeLoop = null;
    }
  }
  points[0].distance = 0;
  if (activeLoop) {
    loopRanges.push(activeLoop);
  }

  return { points, length, loopRanges };
}

function addCubic(points, p0, p1, p2, p3, steps) {
  if (!points.length) {
    points.push({ ...p0 });
  }

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const mt = 1 - t;
    points.push({
      x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
      y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y
    });
  }
}

function addLoop(points, center, rx, ry, startAngle, endAngle, steps) {
  const start = last(points);
  const loopStart = {
    x: center.x + Math.cos(startAngle) * rx,
    y: center.y + Math.sin(startAngle) * ry
  };
  addCubic(points, start, midpoint(start, loopStart, 0.35), midpoint(start, loopStart, 0.68), loopStart, 16);

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const angle = startAngle + (endAngle - startAngle) * t;
    points.push({
      x: center.x + Math.cos(angle) * rx,
      y: center.y + Math.sin(angle) * ry,
      loop: true
    });
  }
}

function midpoint(a, b, amount) {
  return {
    x: a.x + (b.x - a.x) * amount,
    y: a.y + (b.y - a.y) * amount
  };
}

function last(items) {
  return items[items.length - 1];
}

function pointOnPath(distance) {
  const clamped = clamp(distance, 0, path.length);
  for (let i = 1; i < path.points.length; i += 1) {
    const point = path.points[i];
    if (point.distance >= clamped) {
      const previous = path.points[i - 1];
      const span = Math.max(point.distance - previous.distance, 1);
      const amount = (clamped - previous.distance) / span;
      return midpoint(previous, point, amount);
    }
  }
  return last(path.points);
}

function speedAt(distance) {
  return path.loopRanges.some((range) => distance >= range.start && distance <= range.end) ? loopBoost : 1;
}

function resetGame() {
  state.bubbles = [];
  state.particles = [];
  state.shots = [];
  state.nextColor = randomColor();
  state.aim = { x: sling.x, y: sling.pocketY - 130, active: false };
  state.score = 0;
  state.flow = 0;
  state.level = 1;
  state.levelBannerTimer = 0;
  state.dropTimer = 0;
  state.gameOver = false;
  state.playing = true;
  state.gameOverPulse = 0;
  state.lastTime = performance.now();
  gameShell.classList.add("is-playing");

  addSnake();

  updateHud();
}

function showMenu() {
  state.playing = false;
  state.gameOver = false;
  state.shots = [];
  state.particles = [];
  gameShell.classList.remove("is-playing");
}

function addSnake() {
  for (let i = 0; i < 24; i += 1) {
    state.bubbles.push({
      s: i * bubbleGap - 310,
      x: path.points[0].x,
      y: path.points[0].y,
      r: bubbleRadius,
      color: randomColor(),
      wobble: Math.random() * Math.PI * 2
    });
  }
}

function addBubbleToSnake() {
  const tail = state.bubbles.reduce((lowest, bubble) => Math.min(lowest, bubble.s), Infinity);

  state.bubbles.push({
    s: tail - bubbleGap,
    x: path.points[0].x,
    y: path.points[0].y,
    r: bubbleRadius,
    color: randomColor(),
    wobble: Math.random() * Math.PI * 2
  });
}

function updateHud() {
  scoreEl.textContent = `Score ${state.score}`;
  levelEl.textContent = `Level ${state.level}`;
}

function checkLevelUp() {
  if (state.level === 1 && state.score >= 2000) {
    state.level = 2;
    state.levelBannerTimer = 2.4;
    burst(canvas.width / 2, canvas.height / 2, colors[1], 46);
    updateHud();
  }
}

function triggerGameOver() {
  state.gameOver = true;
  state.shots = [];
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function pointerDown(event) {
  if (!state.playing) return;

  if (state.gameOver) {
    resetGame();
    return;
  }
  const point = canvasPoint(event);
  state.aim = point;
  state.aim.active = true;
}

function pointerMove(event) {
  if (!state.aim.active || state.gameOver || !state.playing) return;
  state.aim = { ...canvasPoint(event), active: true };
}

function pointerUp() {
  if (!state.aim.active || state.gameOver || !state.playing) {
    state.aim.active = false;
    return;
  }

  const dx = state.aim.x - sling.x;
  const dy = state.aim.y - sling.pocketY;
  const len = Math.hypot(dx, dy);

  if (len < 30) {
    state.aim.active = false;
    return;
  }

  const speed = 640;
  state.shots.push({
    x: sling.x,
    y: sling.pocketY,
    r: bubbleRadius,
    color: state.nextColor,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
    wedged: false,
    wedgeTimer: 0
  });
  state.nextColor = randomColor();
  state.aim.active = false;
}

function update(dt) {
  state.gameOverPulse += dt;
  state.levelBannerTimer = Math.max(0, state.levelBannerTimer - dt);

  if (!state.playing) {
    updateParticles(dt);
    return;
  }

  if (state.gameOver) {
    updateParticles(dt);
    return;
  }

  state.dropTimer += dt;
  const feedDelay = state.level >= 2 ? 1.7 : 2.7;
  if (state.dropTimer > feedDelay) {
    state.dropTimer = 0;
    state.flow += 1;
    addBubbleToSnake();
    updateHud();
  }

  for (const bubble of state.bubbles) {
    bubble.wobble += dt * 2;
    const levelSpeed = state.level >= 2 ? 1.6 : 1;
    bubble.s += snakeSpeed * levelSpeed * speedAt(bubble.s) * dt;
  }

  keepSnakeAdvancing();

  for (const bubble of state.bubbles) {
    const point = pointOnPath(bubble.s);
    bubble.x = point.x;
    bubble.y = point.y + Math.sin(bubble.wobble) * 1.3;
  }

  if (state.bubbles.some((bubble) => bubble.s >= path.length - 10)) {
    triggerGameOver();
  }

  for (const shot of state.shots) {
    moveShot(shot, dt);
  }
  state.shots = state.shots.filter((shot) => !shot.done);

  updateParticles(dt);
}

function moveShot(shot, dt) {
  if (shot.wedged) {
    shot.wedgeTimer += dt;

    if (shot.wedgeTimer < 0.42) {
      shot.x += Math.sin(shot.wedgeTimer * 42) * 0.6;
      return;
    }

    const pull = clamp((hole.x - shot.x) * 2.1, -230, 230);
    shot.vx += pull * dt;
    shot.vx *= 0.992;
    shot.vy += 680 * dt;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;

    if (pointInHole(shot.x, shot.y + shot.r * 0.35)) {
      triggerGameOver();
      burst(shot.x, shot.y, shot.color, 30);
      shot.done = true;
    }
    return;
  }

  shot.x += shot.vx * dt;
  shot.y += shot.vy * dt;

  if (shot.x < shot.r || shot.x > canvas.width - shot.r) {
    shot.vx *= -0.92;
    shot.x = Math.max(shot.r, Math.min(canvas.width - shot.r, shot.x));
  }

  if (shot.y < 34) {
    wedgeShot(shot);
    return;
  }

  for (const bubble of state.bubbles) {
    if (Math.hypot(shot.x - bubble.x, shot.y - bubble.y) < shot.r + bubble.r - 4) {
      if (bubble.color.name === shot.color.name) {
        popMatchingCluster(bubble);
        shot.done = true;
      } else {
        wedgeShot(shot, bubble);
      }
      return;
    }
  }
}

function wedgeShot(shot, target) {
  shot.wedged = true;
  shot.wedgeTimer = 0;
  shot.x = target ? (shot.x + target.x) / 2 : shot.x;
  shot.y = target ? (shot.y + target.y) / 2 : shot.y;
  shot.vx = clamp((hole.x - shot.x) * 1.35, -210, 210);
  shot.vy = 0;
  burst(shot.x, shot.y, shot.color, 8);
}

function popMatchingCluster(startBubble) {
  const cluster = collectCluster(startBubble);
  const toRemove = new Set(cluster.map((bubble) => bubble.id));

  for (const bubble of cluster) {
    burst(bubble.x, bubble.y, bubble.color, 12);
  }

  state.bubbles = state.bubbles.filter((bubble) => !toRemove.has(bubble.id));
  closeSnakeGaps();
  state.score += cluster.length * 100;
  checkLevelUp();
  updateHud();
}

function collectCluster(startBubble) {
  state.bubbles.forEach((bubble, index) => {
    bubble.id = index;
  });

  const found = [];
  const stack = [startBubble];
  const seen = new Set();

  while (stack.length) {
    const bubble = stack.pop();
    if (seen.has(bubble.id)) continue;
    seen.add(bubble.id);
    found.push(bubble);

    for (const other of state.bubbles) {
      if (seen.has(other.id) || other.color.name !== startBubble.color.name) continue;
      if (Math.hypot(bubble.x - other.x, bubble.y - other.y) <= bubbleRadius * 2.35) {
        stack.push(other);
      }
    }
  }

  return found;
}

function closeSnakeGaps() {
  state.bubbles.sort((a, b) => a.s - b.s);
  for (let i = 1; i < state.bubbles.length; i += 1) {
    const previous = state.bubbles[i - 1];
    const current = state.bubbles[i];
    if (current.s - previous.s > bubbleGap) {
      current.s = previous.s + bubbleGap;
    }
  }
}

function keepSnakeAdvancing() {
  state.bubbles.sort((a, b) => a.s - b.s);
  for (let i = 1; i < state.bubbles.length; i += 1) {
    const previous = state.bubbles[i - 1];
    const current = state.bubbles[i];
    const minimumForwardSpot = previous.s + bubbleGap;

    if (current.s < minimumForwardSpot) {
      current.s = minimumForwardSpot;
    }
  }
}

function pointInHole(x, y) {
  const nx = (x - hole.x) / hole.rx;
  const ny = (y - hole.y) / hole.ry;
  return nx * nx + ny * ny < 1;
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 90 + Math.random() * 210;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.55,
      color
    });
  }
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.life -= dt;
    particle.vy += 190 * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackdrop();
  drawSnakeTunnel();
  drawHole();

  for (const bubble of state.bubbles) {
    drawBubble(bubble.x, bubble.y, bubble.r, bubble.color);
  }

  drawSlingshot();

  for (const shot of state.shots) {
    drawBubble(shot.x, shot.y, shot.r, shot.color);
  }
  drawLoadedBubble();

  drawParticles();
  drawLevelBanner();

  if (state.gameOver) {
    drawGameOver();
  }
}

function drawLevelBanner() {
  if (state.levelBannerTimer <= 0) return;

  const alpha = clamp(state.levelBannerTimer / 2.4, 0, 1);

  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha * 1.25);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "950 74px Segoe UI, Arial, sans-serif";
  ctx.shadowColor = "#64f7ff";
  ctx.shadowBlur = 34;
  ctx.strokeStyle = "#072fff";
  ctx.lineWidth = 7;
  ctx.strokeText("LEVEL 2", canvas.width / 2, canvas.height / 2 - 28);
  ctx.fillStyle = "#f3ffff";
  ctx.fillText("LEVEL 2", canvas.width / 2, canvas.height / 2 - 28);

  ctx.font = "900 24px Segoe UI, Arial, sans-serif";
  ctx.shadowBlur = 18;
  ctx.fillText("Bubbles move faster", canvas.width / 2, canvas.height / 2 + 32);
  ctx.restore();
}

function drawBackdrop() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#102c3b");
  sky.addColorStop(0.5, "#10262e");
  sky.addColorStop(1, "#07101b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 42; i += 1) {
    const x = (i * 181) % canvas.width;
    const y = (i * 97) % canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSnakeTunnel() {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawPathStroke("rgba(80, 38, 7, 0.28)", 62, 0);
  drawPathStroke("rgba(255, 240, 159, 0.22)", 48, 0);
  drawPathStroke("rgba(248, 190, 53, 0.68)", 18, 18);
  drawPathStroke("rgba(255, 251, 200, 0.78)", 6, 8);
  ctx.restore();
}

function drawPathStroke(color, width, shadowBlur) {
  ctx.shadowColor = "rgba(255, 220, 94, 0.72)";
  ctx.shadowBlur = shadowBlur;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(path.points[0].x, path.points[0].y);
  for (const point of path.points) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

function drawHole() {
  const grd = ctx.createRadialGradient(hole.x, hole.y - 4, 10, hole.x, hole.y, hole.rx);
  grd.addColorStop(0, "#000000");
  grd.addColorStop(0.58, "#09070d");
  grd.addColorStop(1, "#3d3048");

  ctx.save();
  ctx.translate(hole.x, hole.y);
  ctx.scale(1, hole.ry / hole.rx);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, hole.rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(116, 255, 246, 0.45)";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
}

function drawSlingshot() {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const wood = ctx.createLinearGradient(sling.x - 18, sling.forkY, sling.x + 35, sling.y);
  wood.addColorStop(0, "#714418");
  wood.addColorStop(0.45, "#bf7a35");
  wood.addColorStop(1, "#6b3914");

  ctx.strokeStyle = wood;
  ctx.lineWidth = 17;
  ctx.beginPath();
  ctx.moveTo(sling.x, sling.y + 38);
  ctx.quadraticCurveTo(sling.x - 10, sling.y - 20, sling.x - 54, sling.forkY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sling.x, sling.y + 38);
  ctx.quadraticCurveTo(sling.x + 10, sling.y - 18, sling.x + 52, sling.forkY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(45, 22, 8, 0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sling.x - 6, sling.y + 24);
  ctx.quadraticCurveTo(sling.x - 2, sling.y - 16, sling.x - 40, sling.forkY + 8);
  ctx.moveTo(sling.x + 8, sling.y + 22);
  ctx.quadraticCurveTo(sling.x + 11, sling.y - 14, sling.x + 37, sling.forkY + 9);
  ctx.stroke();

  const pocketX = state.aim.active ? clamp(state.aim.x, sling.x - 95, sling.x + 95) : sling.x;
  const pocketY = state.aim.active ? clamp(state.aim.y, sling.pocketY - 135, sling.pocketY + 35) : sling.pocketY;

  ctx.strokeStyle = "#17110e";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(sling.x - 54, sling.forkY);
  ctx.lineTo(pocketX, pocketY);
  ctx.lineTo(sling.x + 52, sling.forkY);
  ctx.stroke();

  ctx.fillStyle = "#33251f";
  ctx.beginPath();
  ctx.ellipse(pocketX, pocketY, 24, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.aim.active) {
    drawAimLine(pocketX, pocketY);
  }

  ctx.restore();
}

function drawAimLine(x, y) {
  const dx = x - sling.x;
  const dy = y - sling.pocketY;
  const len = Math.max(Math.hypot(dx, dy), 1);
  const ux = dx / len;
  const uy = dy / len;

  ctx.save();
  ctx.strokeStyle = "rgba(111, 255, 245, 0.62)";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 9]);
  ctx.beginPath();
  ctx.moveTo(sling.x, sling.pocketY);
  ctx.lineTo(sling.x + ux * 240, sling.pocketY + uy * 240);
  ctx.stroke();
  ctx.restore();
}

function drawLoadedBubble() {
  const x = state.aim.active ? clamp(state.aim.x, sling.x - 95, sling.x + 95) : sling.x;
  const y = state.aim.active ? clamp(state.aim.y, sling.pocketY - 135, sling.pocketY + 35) : sling.pocketY;
  drawBubble(x, y, bubbleRadius, state.nextColor);
}

function drawBubble(x, y, r, color) {
  ctx.save();
  ctx.shadowColor = color.glow;
  ctx.shadowBlur = 15;

  const grad = ctx.createRadialGradient(x - r * 0.34, y - r * 0.38, r * 0.08, x, y, r);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.2, color.base);
  grad.addColorStop(0.75, color.base);
  grad.addColorStop(1, color.dark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.32, y - r * 0.35, r * 0.18, r * 0.08, -0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.3, y - r * 0.42, r * 0.16, r * 0.33, -0.58, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawParticles() {
  for (const particle of state.particles) {
    ctx.globalAlpha = Math.max(particle.life, 0);
    drawBubble(particle.x, particle.y, 4, particle.color);
  }
  ctx.globalAlpha = 1;
}

function drawGameOver() {
  const pulse = 0.55 + Math.sin(state.gameOverPulse * 7) * 0.25;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.56)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 88px Segoe UI, Arial, sans-serif";
  ctx.shadowBlur = 34 + pulse * 26;
  ctx.shadowColor = "#ff1cda";
  ctx.strokeStyle = "#1ffff1";
  ctx.lineWidth = 5;
  ctx.strokeText("GAME OVER", canvas.width / 2, canvas.height / 2 - 14);
  ctx.fillStyle = "#ff3cf3";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 14);

  ctx.font = "800 22px Segoe UI, Arial, sans-serif";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#f8ffff";
  ctx.fillText("Click or tap to blast again", canvas.width / 2, canvas.height / 2 + 68);
  ctx.restore();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loop(now) {
  const dt = Math.min((now - state.lastTime) / 1000, 0.035);
  state.lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("pointerdown", pointerDown);
canvas.addEventListener("pointermove", pointerMove);
window.addEventListener("pointerup", pointerUp);
restartBtn.addEventListener("click", resetGame);
startBtn.addEventListener("click", resetGame);

showMenu();
requestAnimationFrame(loop);
