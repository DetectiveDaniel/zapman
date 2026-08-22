const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const speedEl = document.getElementById("speed");
const restartButton = document.getElementById("restart");

const bestKey = "turbo-lane-best";
const lanes = [300, 420, 540, 660];
const keys = new Set();

const car = {
  lane: 1,
  targetX: lanes[1],
  x: lanes[1],
  y: 430,
  width: 54,
  height: 92
};

let traffic = [];
let missiles = [];
let stripes = [];
let score = 0;
let speed = 260;
let spawnTimer = 0;
let gameOver = false;
let lastTime = performance.now();

function best() {
  return Number(localStorage.getItem(bestKey) || 0);
}

function reset() {
  car.lane = 1;
  car.targetX = lanes[1];
  car.x = lanes[1];
  traffic = [];
  missiles = [];
  stripes = Array.from({ length: 13 }, (_, i) => ({ y: i * 72 - 80 }));
  score = 0;
  speed = 260;
  spawnTimer = 0.5;
  gameOver = false;
  updateHud();
}

function updateHud() {
  scoreEl.textContent = Math.floor(score);
  bestEl.textContent = Math.max(best(), Math.floor(score));
  speedEl.textContent = `${(speed / 260).toFixed(1)}x`;
}

function saveBest() {
  const points = Math.floor(score);
  if (points > best()) localStorage.setItem(bestKey, String(points));
}

function moveLane(dir) {
  if (gameOver) {
    reset();
    return;
  }
  car.lane = Math.max(0, Math.min(lanes.length - 1, car.lane + dir));
  car.targetX = lanes[car.lane];
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function spawnTraffic() {
  const lane = Math.floor(Math.random() * lanes.length);
  traffic.push({
    x: lanes[lane],
    y: -120,
    width: 54,
    height: 88,
    color: ["#ff5f6d", "#ffd35c", "#52e1ff", "#c9a2ff"][Math.floor(Math.random() * 4)],
    shootTimer: 0.4 + Math.random() * 0.85
  });
}

function spawnMissile(other) {
  missiles.push({
    x: other.x,
    y: other.y + other.height - 12,
    width: 16,
    height: 42,
    speed: 170
  });
}

function update(dt) {
  if (gameOver) return;
  speed = 260 + Math.min(score * 2.2, 360);
  score += dt * 10;
  car.x += (car.targetX - car.x) * Math.min(1, dt * 12);

  for (const stripe of stripes) {
    stripe.y += speed * dt;
    if (stripe.y > canvas.height + 80) stripe.y = -80;
  }

  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnTraffic();
    spawnTimer = Math.max(0.38, 1.08 - score / 220);
  }

  for (const other of traffic) {
    other.y += speed * dt;
    other.shootTimer -= dt;
    if (other.shootTimer <= 0 && other.y > 20 && other.y < car.y - 80) {
      spawnMissile(other);
      other.shootTimer = 1.1 + Math.random() * 1.1;
    }
  }

  for (const missile of missiles) missile.y += (speed + missile.speed) * dt;
  traffic = traffic.filter((other) => other.y < canvas.height + 120);
  missiles = missiles.filter((missile) => missile.y < canvas.height + 80);

  const carBox = { x: car.x - car.width / 2 + 6, y: car.y + 6, width: car.width - 12, height: car.height - 12 };
  for (const other of traffic) {
    const box = { x: other.x - other.width / 2 + 6, y: other.y + 6, width: other.width - 12, height: other.height - 12 };
    if (rectsOverlap(carBox, box)) {
      gameOver = true;
      saveBest();
    }
  }
  for (const missile of missiles) {
    const box = { x: missile.x - missile.width / 2, y: missile.y, width: missile.width, height: missile.height };
    if (rectsOverlap(carBox, box)) {
      gameOver = true;
      saveBest();
    }
  }
  updateHud();
}

function drawCar(x, y, color) {
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x - 31, y + 8, 62, 88);
  ctx.fillStyle = color;
  ctx.fillRect(x - 27, y, 54, 86);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(x - 17, y + 10, 34, 20);
  ctx.fillStyle = "#11131a";
  ctx.fillRect(x - 22, y + 66, 10, 18);
  ctx.fillRect(x + 12, y + 66, 10, 18);
}

function drawMissile(missile) {
  ctx.fillStyle = "rgba(255,80,45,0.25)";
  ctx.fillRect(missile.x - 10, missile.y + 22, 20, 30);
  ctx.fillStyle = "#f2f4f8";
  ctx.fillRect(missile.x - 8, missile.y + 8, 16, 30);
  ctx.fillStyle = "#ff4242";
  ctx.beginPath();
  ctx.moveTo(missile.x, missile.y - 8);
  ctx.lineTo(missile.x - 10, missile.y + 10);
  ctx.lineTo(missile.x + 10, missile.y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffb236";
  ctx.fillRect(missile.x - 4, missile.y + 38, 8, 16);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1b1f29";
  ctx.fillRect(220, 0, 520, canvas.height);
  ctx.fillStyle = "#2f8c49";
  ctx.fillRect(0, 0, 220, canvas.height);
  ctx.fillRect(740, 0, 220, canvas.height);

  ctx.strokeStyle = "#f8fbff";
  ctx.lineWidth = 4;
  for (let i = 1; i < lanes.length; i += 1) {
    const x = (lanes[i - 1] + lanes[i]) / 2;
    for (const stripe of stripes) {
      ctx.beginPath();
      ctx.moveTo(x, stripe.y);
      ctx.lineTo(x, stripe.y + 38);
      ctx.stroke();
    }
  }

  for (const other of traffic) drawCar(other.x, other.y, other.color);
  for (const missile of missiles) drawMissile(missile);
  drawCar(car.x, car.y, "#72ff9d");

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 50px monospace";
    ctx.textAlign = "center";
    ctx.fillText("CRASH!", canvas.width / 2, 230);
    ctx.font = "900 22px monospace";
    ctx.fillText("Press Space to restart", canvas.width / 2, 278);
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

restartButton.addEventListener("click", reset);
window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  if (keys.has(event.code)) return;
  keys.add(event.code);
  if (event.code === "ArrowLeft" || event.code === "KeyA") moveLane(-1);
  if (event.code === "ArrowRight" || event.code === "KeyD") moveLane(1);
  if (event.code === "Space" && gameOver) reset();
});
window.addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("pointerdown", (event) => {
  if (gameOver) {
    reset();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  moveLane(event.clientX < rect.left + rect.width / 2 ? -1 : 1);
});

reset();
requestAnimationFrame(loop);
