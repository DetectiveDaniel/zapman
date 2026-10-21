const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const speedEl = document.getElementById("speed");
const levelEl = document.getElementById("level");
const restartButton = document.getElementById("restart");

const bestKey = "turbo-lane-best";
const lanes = [300, 420, 540, 660];
const levelTargets = { 1: 20, 2: 25, 3: 30, 4: 18 };
const levelBaseSpeeds = { 1: 260, 2: 300, 3: 330, 4: 300 };
const keys = new Set();

const car = {
  lane: 1,
  targetX: lanes[1],
  x: lanes[1],
  y: 430,
  width: 58,
  height: 88
};

let traffic = [];
let missiles = [];
let stripes = [];
let level = 1;
let dodged = 0;
let totalDodged = 0;
let spawned = 0;
let speed = 260;
let spawnTimer = 0;
let finishLine = null;
let phase = "playing";
let transitionTimer = 0;
let gameOver = false;
let won = false;
let lastTime = performance.now();

ctx.imageSmoothingEnabled = false;

function best() {
  return Number(localStorage.getItem(bestKey) || 0);
}

function saveBest() {
  if (totalDodged > best()) localStorage.setItem(bestKey, String(totalDodged));
}

function startLevel(nextLevel) {
  level = nextLevel;
  dodged = 0;
  spawned = 0;
  traffic = [];
  missiles = [];
  finishLine = null;
  spawnTimer = 0.55;
  speed = levelBaseSpeeds[level];
  phase = "playing";
  transitionTimer = 0;
  updateHud();
}

function reset() {
  car.lane = 1;
  car.targetX = lanes[1];
  car.x = lanes[1];
  stripes = Array.from({ length: 13 }, (_, i) => ({ y: i * 72 - 80 }));
  totalDodged = 0;
  gameOver = false;
  won = false;
  startLevel(1);
}

function updateHud() {
  const target = levelTargets[level];
  levelEl.textContent = String(level);
  scoreEl.textContent = `${dodged} / ${target}`;
  bestEl.textContent = Math.max(best(), totalDodged);
  speedEl.textContent = `${(speed / 260).toFixed(1)}x`;
}

function moveLane(dir) {
  if (gameOver || won) {
    reset();
    return;
  }
  if (phase !== "playing") return;
  car.lane = Math.max(0, Math.min(lanes.length - 1, car.lane + dir));
  car.targetX = lanes[car.lane];
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function spawnTraffic() {
  if (level === 4) {
    // A truck owns its wave until it has left the road. This guarantees two
    // clear lanes and gives time to cross between waves, even at top speed.
    if (traffic.length) return false;
    const startLane = Math.floor(Math.random() * 3);
    traffic.push({x:(lanes[startLane]+lanes[startLane+1])/2,y:-155,width:208,height:144,kind:'monster',startLane,speedBoost:0,hasFired:false,wheelFrame:0});
    spawned += 1;
    return true;
  }
  const lane = Math.floor(Math.random() * lanes.length);
  const fastBrownCar = level === 3;
  const missileCar = level === 2 && Math.random() < 0.62;
  traffic.push({
    x: lanes[lane],
    y: fastBrownCar ? -82 : -112,
    width: fastBrownCar ? 40 : 58,
    height: fastBrownCar ? 62 : 88,
    kind: fastBrownCar ? "brown" : missileCar ? "blue" : "green",
    speedBoost: fastBrownCar ? 165 + Math.random() * 55 : 0,
    hasFired: false,
    wheelFrame: Math.random() * Math.PI * 2
  });
  spawned += 1;
}

function spawnMissile(other) {
  missiles.push({
    x: other.x,
    y: other.y + 58,
    width: 14,
    height: 42,
    speed: 230
  });
}

function showFinishLine() {
  finishLine = { y: -72, height: 58 };
  missiles = [];
}

function finishLevel() {
  finishLine = null;
  saveBest();
  if (level < 4) {
    phase = "between";
    transitionTimer = 2;
  } else {
    won = true;
    phase = "won";
  }
}

function crash() {
  gameOver = true;
  phase = "crashed";
  saveBest();
}

function updateRoad(dt) {
  for (const stripe of stripes) {
    stripe.y += speed * dt;
    if (stripe.y > canvas.height + 80) stripe.y = -80;
  }
}

function update(dt) {
  if (gameOver || won) return;

  car.x += (car.targetX - car.x) * Math.min(1, dt * 12);
  updateRoad(dt);

  if (phase === "between") {
    transitionTimer -= dt;
    if (transitionTimer <= 0) startLevel(level + 1);
    return;
  }

  const speedCap = level === 4 ? 90 : level === 1 ? 85 : level === 2 ? 105 : 125;
  speed = levelBaseSpeeds[level] + Math.min(dodged * 5, speedCap);

  if (!finishLine && spawned < levelTargets[level]) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTraffic();
      const baseDelay = level === 4 ? 0.8 : level === 1 ? 0.82 : level === 2 ? 0.7 : 0.62;
      const minimumDelay = level === 4 ? 0.7 : level === 3 ? 0.4 : 0.46;
      spawnTimer = Math.max(minimumDelay, baseDelay - dodged * 0.008);
    }
  }

  for (const other of traffic) {
    other.y += (speed + other.speedBoost) * dt;
    other.wheelFrame += dt * (other.kind === "brown" ? 25 : 16);
    if (level === 2 && other.kind === "blue" && !other.hasFired && other.y > 35 && other.y < car.y - 145) {
      spawnMissile(other);
      other.hasFired = true;
    }
  }

  for (const missile of missiles) missile.y += (speed + missile.speed) * dt;

  const activeTraffic = [];
  for (const other of traffic) {
    if (other.y < canvas.height + 100) {
      activeTraffic.push(other);
    } else {
      dodged += 1;
      totalDodged += 1;
    }
  }
  traffic = activeTraffic;
  missiles = missiles.filter((missile) => missile.y < canvas.height + 70);

  if (!finishLine && dodged >= levelTargets[level] && traffic.length === 0) showFinishLine();

  if (finishLine) {
    finishLine.y += speed * dt;
    if (finishLine.y > car.y + car.height) finishLevel();
  }

  const carBox = { x: car.x - car.width / 2 + 8, y: car.y + 6, width: car.width - 16, height: car.height - 12 };
  for (const other of traffic) {
    const box = { x: other.x - other.width / 2 + 8, y: other.y + 6, width: other.width - 16, height: other.height - 12 };
    if (rectsOverlap(carBox, box)) crash();
  }
  for (const missile of missiles) {
    const box = { x: missile.x - missile.width / 2, y: missile.y, width: missile.width, height: missile.height };
    if (rectsOverlap(carBox, box)) crash();
  }
  updateHud();
}

function pixelRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), width, height);
}

function drawSmallBrownCar(x, y, wheelFrame) {
  const left = Math.round(x - 20);
  const top = Math.round(y);
  const wheelNudge = Math.sin(wheelFrame) > 0 ? 1 : 0;

  pixelRect(left - 2, top + 10, 44, 50, "rgba(0,0,0,0.34)");
  pixelRect(left + 5, top, 30, 5, "#4b2415");
  pixelRect(left, top + 5, 40, 50, "#5f2f1c");
  pixelRect(left + 4, top + 4, 32, 54, "#92502d");
  pixelRect(left + 7, top + 11, 26, 15, "#b86d3d");
  pixelRect(left + 9, top + 13, 22, 11, "#273f49");
  pixelRect(left + 11, top + 14, 18, 4, "#78929a");
  pixelRect(left + 7, top + 31, 26, 17, "#b86d3d");
  pixelRect(left + 11, top + 33, 18, 5, "#d6925b");
  pixelRect(left + 5, top + 49, 7, 5, "#ff684d");
  pixelRect(left + 28, top + 49, 7, 5, "#ff684d");
  pixelRect(left - 3, top + 12 + wheelNudge, 6, 14, "#111722");
  pixelRect(left + 37, top + 12 + wheelNudge, 6, 14, "#111722");
  pixelRect(left - 3, top + 38 - wheelNudge, 6, 14, "#111722");
  pixelRect(left + 37, top + 38 - wheelNudge, 6, 14, "#111722");
}
function drawMonsterTruck(x,y,wheelFrame) {
  const left=x-104, nudge=Math.sin(wheelFrame)>0?2:0;
  pixelRect(left-3,y+10,214,138,'rgba(0,0,0,.3)');
  for(const dx of [0,168])for(const dy of [12,91]){
    pixelRect(left+dx,y+dy,40,50,'#111722');pixelRect(left+dx+7,y+dy+6+nudge,26,36,'#39404b');
    for(let t=0;t<3;t++)pixelRect(left+dx+3,y+dy+8+t*13,34,5,'#6c747b');
  }
  pixelRect(left+35,y+4,138,134,'#283448');pixelRect(left+43,y,122,132,'#d3812b');
  pixelRect(left+49,y+9,110,45,'#ffc25c');pixelRect(left+58,y+15,92,29,'#224657');
  pixelRect(left+63,y+18,82,8,'#8cc4cc');pixelRect(left+51,y+62,106,53,'#bd5d2d');
  pixelRect(left+66,y+68,76,9,'#edaa47');pixelRect(left+53,y+118,102,15,'#c8cdd0');
  pixelRect(left+45,y+49,18,9,'#fff3af');pixelRect(left+145,y+49,18,9,'#fff3af');
  ctx.font='bold 13px monospace';ctx.fillStyle='#fff1be';ctx.textAlign='center';ctx.fillText('MONSTER',x,y+101);
}
function drawCar(x, y, kind, wheelFrame = 0) {
  if (kind === 'monster') { drawMonsterTruck(x,y,wheelFrame); return; }
  if (kind === "brown") {
    drawSmallBrownCar(x, y, wheelFrame);
    return;
  }

  const palette = {
    red: { dark: "#730f24", body: "#dc1840", light: "#ff3158", shine: "#ff6b7f" },
    green: { dark: "#1d552f", body: "#62a947", light: "#8dcb58", shine: "#b9e16f" },
    blue: { dark: "#123c72", body: "#1762ad", light: "#2b83d5", shine: "#65b3ee" }
  }[kind];
  const left = Math.round(x - 29);
  const top = Math.round(y);
  const wheelNudge = Math.sin(wheelFrame) > 0 ? 1 : 0;

  pixelRect(left - 3, top + 15, 64, 66, "rgba(0,0,0,0.34)");
  pixelRect(left + 5, top, 48, 6, palette.dark);
  pixelRect(left, top + 6, 58, 70, palette.dark);
  pixelRect(left + 4, top + 5, 50, 75, palette.body);
  pixelRect(left + 9, top + 2, 40, 13, palette.light);
  pixelRect(left + 7, top + 16, 44, 22, palette.body);
  pixelRect(left + 10, top + 18, 38, 18, "#203a46");
  pixelRect(left + 14, top + 19, 30, 6, "#5e8491");
  pixelRect(left + 7, top + 42, 44, 25, palette.light);
  pixelRect(left + 12, top + 45, 34, 6, palette.shine);
  pixelRect(left + 9, top + 68, 40, 9, palette.body);
  pixelRect(left + 4, top + 7, 7, 7, "#fff6b0");
  pixelRect(left + 47, top + 7, 7, 7, "#fff6b0");
  pixelRect(left + 6, top + 69, 7, 6, "#ff633f");
  pixelRect(left + 45, top + 69, 7, 6, "#ff633f");
  pixelRect(left - 4, top + 16 + wheelNudge, 7, 18, "#111722");
  pixelRect(left + 55, top + 16 + wheelNudge, 7, 18, "#111722");
  pixelRect(left - 4, top + 54 - wheelNudge, 7, 18, "#111722");
  pixelRect(left + 55, top + 54 - wheelNudge, 7, 18, "#111722");

  if (kind === "blue") {
    pixelRect(left + 22, top + 35, 14, 32, "#b9c2cb");
    pixelRect(left + 19, top + 37, 20, 8, "#edf1f5");
    pixelRect(left + 18, top + 58, 22, 8, "#606a75");
    pixelRect(left + 24, top + 66, 10, 7, "#ff3c32");
  }
}

function drawMissile(missile) {
  const x = Math.round(missile.x);
  const y = Math.round(missile.y);
  pixelRect(x - 8, y - 8, 16, 13, "rgba(255,135,30,0.3)");
  pixelRect(x - 3, y - 8, 6, 10, "#ffd533");
  pixelRect(x - 6, y + 1, 12, 27, "#e8edf1");
  pixelRect(x - 9, y + 5, 4, 13, "#d92738");
  pixelRect(x + 5, y + 5, 4, 13, "#d92738");
  pixelRect(x - 6, y + 27, 12, 6, "#d92738");
  pixelRect(x - 3, y + 33, 6, 8, "#d92738");
}

function drawFinishLine(line) {
  const tile = 20;
  const y = Math.round(line.y);
  pixelRect(220, y - 4, 520, line.height + 8, "#ffffff");
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 26; col += 1) {
      pixelRect(220 + col * tile, y + row * 18, tile, 18, (row + col) % 2 ? "#ffffff" : "#08090c");
    }
  }
  pixelRect(418, y + 12, 124, 30, "#ffffff");
  pixelRect(422, y + 16, 116, 22, "#08090c");
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText("FINISH", 480, y + 34);
}

function drawRoad() {
  pixelRect(0, 0, 220, canvas.height, "#277b3f");
  pixelRect(740, 0, 220, canvas.height, "#277b3f");
  pixelRect(210, 0, 10, canvas.height, "#d6c64a");
  pixelRect(740, 0, 10, canvas.height, "#d6c64a");
  pixelRect(220, 0, 520, canvas.height, "#252b32");
  pixelRect(230, 0, 8, canvas.height, "#f2f2ec");
  pixelRect(722, 0, 8, canvas.height, "#f2f2ec");

  ctx.strokeStyle = "#e9edf0";
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
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 50px monospace";
  ctx.textAlign = "center";
  ctx.fillText(title, canvas.width / 2, 230);
  ctx.fillStyle = "#72ff9d";
  ctx.font = "900 22px monospace";
  ctx.fillText(subtitle, canvas.width / 2, 278);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();

  if (finishLine) drawFinishLine(finishLine);
  for (const other of traffic) drawCar(other.x, other.y, other.kind, other.wheelFrame);
  for (const missile of missiles) drawMissile(missile);
  drawCar(car.x, car.y, "red", performance.now() * 0.012);

  pixelRect(244, 14, 142, 34, "rgba(0,0,0,0.65)");
  ctx.fillStyle = level === 1 ? "#8dcb58" : level === 2 ? "#65b3ee" : "#d6925b";
  ctx.font = "900 18px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`LEVEL ${level}`, 258, 37);

  if (phase === "between") {
    const nextMessage = level === 1 ? "LEVEL 2: WATCH FOR MISSILES" : level === 2 ? "LEVEL 3: FAST BROWN CARS" : "LEVEL 4: MONSTER TRUCKS";
    drawOverlay(`LEVEL ${level} COMPLETE!`, nextMessage);
  }
  if (gameOver) drawOverlay("CRASH!", "PRESS SPACE TO RESTART");
  if (won) drawOverlay("TURBO CHAMPION!", "YOU FINISHED ALL 4 LEVELS!");
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
  if (event.code === "Space" && (gameOver || won)) reset();
});
window.addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("pointerdown", (event) => {
  if (gameOver || won) {
    reset();
    return;
  }
  const rect = canvas.getBoundingClientRect();
  moveLane(event.clientX < rect.left + rect.width / 2 ? -1 : 1);
});

reset();
requestAnimationFrame(loop);
