const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const startButton = document.querySelector('#startButton');
const meowButton = document.querySelector('#meowButton');
const speedButton = document.querySelector('#speedButton');
const pillowButton = document.querySelector('#pillowButton');
const distanceEl = document.querySelector('#distance');
const fishEl = document.querySelector('#fish');
const livesEl = document.querySelector('#lives');
const speedCostEl = document.querySelector('#speedCost');
const pillowCostEl = document.querySelector('#pillowCost');
const shopMessageEl = document.querySelector('#shopMessage');

const W = canvas.width;
const H = canvas.height;
const groundY = 418;
const keys = new Set();

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let running = false;
let gameOver = false;
let distance = 0;
let fish = 0;
let lives = 3;
let speed = 4.4;
let speedLevel = 0;
let pillowLevel = 0;
let lastTime = 0;
let messageTimer = 0;
let hitTimer = 0;
let spawnTimer = 0;
let worldOffset = 0;

const chi = {
  x: 170,
  y: groundY - 78,
  w: 92,
  h: 78,
  vy: 0,
  grounded: true,
  meow: 0,
};

const vet = {
  x: 36,
  y: groundY - 86,
  w: 76,
  h: 86,
  bob: 0,
};

let obstacles = [];
let treats = [];
let puffs = [];

function softRect(x, y, w, h, r, fill, stroke = '#20212a', line = 3) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = line;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  if (line > 0) ctx.stroke();
}

function ellipseFill(x, y, rx, ry, fill, stroke = '#20212a', line = 3, rot = 0) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = line;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
  if (line > 0) ctx.stroke();
}

function scatterTexture(color, count, minY, maxY, speedFactor, alpha = .12) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    const x = (i * 83 - worldOffset * speedFactor) % (W + 120) - 60;
    const y = minY + ((i * 47) % (maxY - minY));
    ctx.beginPath();
    ctx.ellipse(x, y, 1 + (i % 3), .7 + (i % 2), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function resetGame() {
  running = true;
  gameOver = false;
  distance = 0;
  lives = 3;
  speed = baseSpeed();
  messageTimer = 120;
  hitTimer = 0;
  spawnTimer = 25;
  worldOffset = 0;
  obstacles = [];
  treats = [];
  puffs = [];
  chi.y = groundY - chi.h;
  chi.vy = 0;
  chi.grounded = true;
  startButton.textContent = 'Restart';
  updateHud();
}

function updateHud() {
  distanceEl.textContent = `${Math.floor(distance)} m`;
  fishEl.textContent = `${fish} fish`;
  livesEl.textContent = `${lives} hearts`;
  updateShop();
}

function jump() {
  if (chi.grounded && running && !gameOver) {
    chi.vy = jumpPower();
    chi.grounded = false;
    addPuff(chi.x + 28, groundY - 10, 8 + pillowLevel * 2);
  }
}

function baseSpeed() {
  return 4.4 + speedLevel * .55;
}

function jumpPower() {
  return -14.5 - pillowLevel * 1.9;
}

function speedCost() {
  return 3 + speedLevel * 3;
}

function pillowCost() {
  return 4 + pillowLevel * 4;
}

function updateShop(message) {
  const nextSpeedCost = speedCost();
  const nextPillowCost = pillowCost();
  speedCostEl.textContent = speedLevel >= 5 ? 'Max' : `${nextSpeedCost} fish`;
  pillowCostEl.textContent = pillowLevel >= 4 ? 'Max' : `${nextPillowCost} fish`;
  speedButton.disabled = speedLevel >= 5 || fish < nextSpeedCost;
  pillowButton.disabled = pillowLevel >= 4 || fish < nextPillowCost;
  speedButton.querySelector('span').textContent = `Speed fish Lv ${speedLevel}`;
  pillowButton.querySelector('span').textContent = `Pillow bounce Lv ${pillowLevel}`;
  if (message) shopMessageEl.textContent = message;
}

function buySpeed() {
  const cost = speedCost();
  if (speedLevel >= 5) return updateShop('Chi is already zooming at top speed.');
  if (fish < cost) return updateShop(`Need ${cost - fish} more fish for speed.`);
  fish -= cost;
  speedLevel += 1;
  speed += .55;
  updateShop('Chi ate a speed fish and feels quicker.');
  updateHud();
}

function buyPillow() {
  const cost = pillowCost();
  if (pillowLevel >= 4) return updateShop('The pillow is already super springy.');
  if (fish < cost) return updateShop(`Need ${cost - fish} more fish for the pillow.`);
  fish -= cost;
  pillowLevel += 1;
  updateShop('The pillow got softer. Chi can jump higher.');
  updateHud();
}

function meow() {
  if (!running || gameOver) return;
  chi.meow = 70;
  messageTimer = 40;
  for (let i = 0; i < 8; i++) addPuff(chi.x + chi.w, chi.y + 28, 4 + Math.random() * 5);
}

function addPuff(x, y, size) {
  puffs.push({ x, y, size, life: 38, vx: -1 - Math.random() * 1.5, vy: -Math.random() * 1.5 });
}

function spawnThing() {
  const playgroundZone = Math.floor(distance / 260) % 2 === 1;
  const type = Math.random() < .58 ? 'obstacle' : 'treat';
  if (type === 'obstacle') {
    const obstacleTypes = playgroundZone ? ['slide', 'cone', 'sandbox'] : ['cone', 'trash', 'hydrant'];
    const kind = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const size = kind === 'slide' ? { w: 96, h: 76 } : kind === 'sandbox' ? { w: 88, h: 38 } : { w: 48, h: 62 };
    obstacles.push({ x: W + 40, y: groundY - size.h, ...size, kind });
  } else {
    treats.push({ x: W + 40, y: groundY - 118 - Math.random() * 80, w: 34, h: 24, spin: 0 });
  }
}

function rectsOverlap(a, b, pad = 0) {
  return a.x + pad < b.x + b.w && a.x + a.w - pad > b.x && a.y + pad < b.y + b.h && a.y + a.h - pad > b.y;
}

function update(dt) {
  if (!running || gameOver) return;

  const step = dt / 16.67;
  distance += speed * step * .5;
  speed = Math.min(8.4, speed + .0025 * step);
  worldOffset += speed * step;
  vet.bob += .16 * step;
  spawnTimer -= step;
  messageTimer = Math.max(0, messageTimer - step);
  chi.meow = Math.max(0, chi.meow - step);
  hitTimer = Math.max(0, hitTimer - step);

  if ((keys.has(' ') || keys.has('w') || keys.has('arrowup')) && chi.grounded) jump();

  chi.vy += .72 * step;
  chi.y += chi.vy * step;
  if (chi.y >= groundY - chi.h) {
    chi.y = groundY - chi.h;
    chi.vy = 0;
    chi.grounded = true;
  }

  if (spawnTimer <= 0) {
    spawnThing();
    spawnTimer = 52 + Math.random() * 56 - speed * 3;
  }

  obstacles.forEach(o => o.x -= speed * step);
  treats.forEach(t => {
    t.x -= speed * step;
    t.spin += .15 * step;
  });
  puffs.forEach(p => {
    p.x += p.vx * step;
    p.y += p.vy * step;
    p.life -= step;
  });

  obstacles = obstacles.filter(o => o.x + o.w > -80);
  treats = treats.filter(t => t.x + t.w > -40);
  puffs = puffs.filter(p => p.life > 0);

  for (const obstacle of obstacles) {
    if (!obstacle.hit && hitTimer <= 0 && rectsOverlap(chi, obstacle, 18)) {
      obstacle.hit = true;
      lives -= 1;
      hitTimer = 80;
      addPuff(chi.x + 20, chi.y + 54, 14);
      if (lives <= 0) {
        running = false;
        gameOver = true;
        startButton.textContent = 'Try again';
      }
    }
  }

  for (const treat of treats) {
    if (!treat.collected && rectsOverlap(chi, treat, 4)) {
      treat.collected = true;
      fish += 1;
      addPuff(treat.x, treat.y, 9);
    }
  }
  treats = treats.filter(t => !t.collected);

  updateHud();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawSky();
  drawTown();
  drawRoad();
  drawPlayground();
  obstacles.forEach(drawObstacle);
  treats.forEach(drawFishTreat);
  drawVet();
  drawChi();
  puffs.forEach(drawPuff);
  drawSpeech();
  if (!running && !gameOver) drawCenterText('Press Start to help Chi escape!');
  if (gameOver) drawCenterText('The vet caught Chi! Try again!');
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, groundY);
  g.addColorStop(0, '#8fdfff');
  g.addColorStop(.65, '#d8f3df');
  g.addColorStop(1, '#fff0a2');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, groundY);
  scatterTexture('#ffffff', 40, 20, groundY - 80, .05, .16);
  const sun = ctx.createRadialGradient(820, 76, 6, 820, 76, 74);
  sun.addColorStop(0, '#fff8ba');
  sun.addColorStop(1, 'rgba(255, 214, 87, 0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(820, 76, 74, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff6aa';
  ctx.beginPath();
  ctx.arc(820, 76, 39, 0, Math.PI * 2);
  ctx.fill();
}

function drawTown() {
  const base = groundY - 190;
  for (let i = -1; i < 8; i++) {
    const x = i * 170 - (worldOffset * .32 % 170);
    const y = base + (i % 3) * 18;
    const building = ctx.createLinearGradient(x, y, x + 126, y + 190);
    building.addColorStop(0, i % 2 ? '#ff8984' : '#68d1d2');
    building.addColorStop(1, i % 2 ? '#dd5e70' : '#31a7bd');
    softRect(x, y, 126, 190, 10, building, 'rgba(32,33,42,.76)', 3);
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    ctx.fillRect(x + 10, y + 10, 10, 170);
    softRect(x - 5, y - 7, 136, 18, 8, '#273040', '#20212a', 3);
    ctx.fillStyle = '#fff9dc';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 2; c++) {
        softRect(x + 22 + c * 48, y + 34 + r * 36, 22, 18, 5, '#fff8cc', 'rgba(32,33,42,.45)', 2);
      }
    }
  }
}

function drawRoad() {
  const grass = ctx.createLinearGradient(0, groundY - 42, 0, groundY + 18);
  grass.addColorStop(0, '#77cd70');
  grass.addColorStop(1, '#3f9558');
  ctx.fillStyle = grass;
  ctx.fillRect(0, groundY - 28, W, 50);
  scatterTexture('#1e6f45', 52, groundY - 26, groundY + 10, .95, .18);
  const road = ctx.createLinearGradient(0, groundY, 0, H);
  road.addColorStop(0, '#626b78');
  road.addColorStop(1, '#343946');
  ctx.fillStyle = road;
  ctx.fillRect(0, groundY, W, H - groundY);
  scatterTexture('#ffffff', 85, groundY + 8, H - 8, 1, .08);
  for (let i = -1; i < 8; i++) {
    softRect(i * 170 - (worldOffset % 170), groundY + 58, 86, 10, 5, '#f6f0d2', 'rgba(255,255,255,.18)', 1);
  }
}

function drawPlayground() {
  const showPlayground = Math.floor(distance / 260) % 2 === 1;
  if (!showPlayground) return;
  const x = 650 - (worldOffset * .2 % 180);
  ctx.save();
  ctx.shadowColor = 'rgba(32,33,42,.18)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 6;
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x, groundY - 20);
  ctx.lineTo(x + 58, groundY - 128);
  ctx.lineTo(x + 118, groundY - 20);
  ctx.stroke();
  ctx.strokeStyle = '#ffcf4a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 58, groundY - 128);
  ctx.lineTo(x + 58, groundY - 55);
  ctx.stroke();
  softRect(x + 34, groundY - 60, 48, 17, 8, '#ff6f7f', '#20212a', 3);
  ctx.restore();
}

function drawObstacle(o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#20212a';
  ctx.shadowColor = 'rgba(32,33,42,.2)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 5;
  if (o.kind === 'slide') {
    softRect(0, 34, 48, 42, 8, '#ffd963', '#20212a', 4);
    const slide = ctx.createLinearGradient(30, 22, 96, 76);
    slide.addColorStop(0, '#7be5ed');
    slide.addColorStop(1, '#288bc1');
    ctx.fillStyle = slide;
    ctx.beginPath();
    ctx.moveTo(38, 20);
    ctx.quadraticCurveTo(68, 35, 96, 62);
    ctx.lineTo(88, 76);
    ctx.quadraticCurveTo(58, 51, 30, 34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (o.kind === 'sandbox') {
    softRect(0, 0, o.w, o.h, 10, '#d9a64c', '#20212a', 4);
    softRect(8, 8, o.w - 16, o.h - 16, 10, '#fff0a8', 'rgba(32,33,42,.18)', 1);
    ctx.fillStyle = 'rgba(184,135,49,.25)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(18 + (i * 13) % 54, 15 + (i * 7) % 15, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (o.kind === 'hydrant') {
    softRect(14, 12, 22, 46, 9, '#e64842', '#20212a', 4);
    softRect(6, 28, 38, 16, 8, '#f15a4d', '#20212a', 3);
    ellipseFill(25, 10, 14, 7, '#ff7c6c', '#20212a', 3);
  } else if (o.kind === 'trash') {
    softRect(4, 12, 40, 50, 8, '#7c8796', '#20212a', 4);
    softRect(0, 4, 48, 10, 6, '#29303b', '#20212a', 2);
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, 18);
    ctx.lineTo(11, 57);
    ctx.moveTo(29, 18);
    ctx.lineTo(32, 57);
    ctx.stroke();
  } else {
    const cone = ctx.createLinearGradient(0, 0, 48, 62);
    cone.addColorStop(0, '#ffb05a');
    cone.addColorStop(1, '#eb612d');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(48, 62);
    ctx.lineTo(0, 62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    softRect(11, 32, 26, 8, 4, '#fff9dc', 'rgba(32,33,42,.26)', 1);
  }
  ctx.restore();
}

function drawFishTreat(t) {
  ctx.save();
  ctx.translate(t.x + t.w / 2, t.y + t.h / 2);
  ctx.rotate(Math.sin(t.spin) * .25);
  ctx.fillStyle = '#ffcf4a';
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(26, -9);
  ctx.lineTo(26, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawVet() {
  const bob = Math.sin(vet.bob) * 5;
  ctx.save();
  ctx.translate(vet.x, vet.y + bob);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#20212a';
  ctx.shadowColor = 'rgba(32,33,42,.18)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 5;
  const coat = ctx.createLinearGradient(8, 28, 64, 86);
  coat.addColorStop(0, '#2f87cc');
  coat.addColorStop(1, '#154e8f');
  softRect(8, 34, 56, 46, 14, coat, '#20212a', 4);
  softRect(18, 0, 42, 42, 15, '#ffe0ad', '#20212a', 4);
  softRect(17, -8, 44, 16, 9, '#2a73b8', '#20212a', 3);
  softRect(30, 42, 16, 38, 7, '#fffaf0', 'rgba(32,33,42,.35)', 2);
  ctx.fillStyle = '#e23b3b';
  ctx.beginPath();
  ctx.moveTo(38, 42);
  ctx.lineTo(48, 80);
  ctx.lineTo(28, 80);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#20212a';
  ctx.beginPath();
  ctx.arc(30, 18, 3, 0, Math.PI * 2);
  ctx.arc(51, 18, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 30);
  ctx.quadraticCurveTo(42, 36, 55, 30);
  ctx.stroke();
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(8, 48);
  ctx.quadraticCurveTo(-7, 42, -20, 38);
  ctx.moveTo(64, 48);
  ctx.quadraticCurveTo(76, 39, 82, 30);
  ctx.moveTo(20, 80);
  ctx.quadraticCurveTo(10, 93, 0, 102);
  ctx.moveTo(55, 80);
  ctx.quadraticCurveTo(72, 91, 84, 96);
  ctx.stroke();
  ctx.fillStyle = '#20212a';
  ctx.beginPath();
  ctx.ellipse(0, 103, 12, 5, -.25, 0, Math.PI * 2);
  ctx.ellipse(86, 97, 12, 5, .2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawChi() {
  const flash = hitTimer > 0 && Math.floor(hitTimer / 6) % 2 === 0;
  if (flash) return;
  ctx.save();
  ctx.translate(chi.x, chi.y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(32,33,42,.18)';
  ctx.shadowBlur = 9;
  ctx.shadowOffsetY = 5;
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = '#20212a';

  const leg = Math.sin(worldOffset * .08) * 9;
  const bodyFur = ctx.createLinearGradient(18, 24, 112, 76);
  bodyFur.addColorStop(0, '#c9c1ae');
  bodyFur.addColorStop(.48, '#ece6d1');
  bodyFur.addColorStop(1, '#fff1d3');
  ctx.fillStyle = bodyFur;
  ctx.beginPath();
  ctx.ellipse(58, 52, 43, 27, -.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(23, 48);
  ctx.bezierCurveTo(-6, 24, -30, 29, -40, 52);
  ctx.stroke();

  const headFur = ctx.createRadialGradient(105, 25, 8, 98, 42, 48);
  headFur.addColorStop(0, '#fff8df');
  headFur.addColorStop(1, '#ded6bf');
  ctx.fillStyle = headFur;
  ctx.beginPath();
  ctx.ellipse(103, 42, 32, 29, .05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#efe8cf';
  ctx.beginPath();
  ctx.moveTo(81, 22);
  ctx.quadraticCurveTo(79, 1, 88, -13);
  ctx.quadraticCurveTo(101, 5, 106, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(112, 19);
  ctx.quadraticCurveTo(121, 0, 136, -10);
  ctx.quadraticCurveTo(137, 13, 130, 29);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f4a6ba';
  ctx.beginPath();
  ctx.moveTo(87, 15);
  ctx.quadraticCurveTo(86, 4, 90, -4);
  ctx.quadraticCurveTo(97, 6, 100, 18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(116, 17);
  ctx.quadraticCurveTo(123, 6, 132, 0);
  ctx.quadraticCurveTo(131, 14, 126, 25);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 5.2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(28 + i * 12, 31);
    ctx.quadraticCurveTo(35 + i * 9, 45, 31 + i * 12, 66);
    ctx.stroke();
  }

  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(95, 21);
  ctx.quadraticCurveTo(100, 28, 101, 36);
  ctx.moveTo(112, 20);
  ctx.quadraticCurveTo(109, 29, 108, 37);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(93, 37, 10.5, 0, Math.PI * 2);
  ctx.arc(119, 36, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#20212a';
  ctx.beginPath();
  ctx.arc(96, 37, 4.5, 0, Math.PI * 2);
  ctx.arc(122, 36, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(98, 34, 1.6, 0, Math.PI * 2);
  ctx.arc(124, 33, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e48fa2';
  ctx.beginPath();
  ctx.arc(108, 51, 4.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(108, 55);
  ctx.quadraticCurveTo(102, 59, 96, 55);
  ctx.moveTo(108, 55);
  ctx.quadraticCurveTo(114, 59, 120, 55);
  ctx.stroke();

  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(83, 49);
  ctx.lineTo(60, 43);
  ctx.moveTo(83, 55);
  ctx.lineTo(59, 58);
  ctx.moveTo(124, 49);
  ctx.lineTo(145, 42);
  ctx.moveTo(124, 55);
  ctx.lineTo(146, 58);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(42, 72);
  ctx.quadraticCurveTo(38 + leg * .2, 83, 32 + leg, 92);
  ctx.moveTo(75, 71);
  ctx.quadraticCurveTo(77 - leg * .2, 83, 86 - leg, 92);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.beginPath();
  ctx.ellipse(72, 37, 37, 10, -.05, 0, Math.PI * 2);
  ctx.fill();
  if (pillowLevel > 0) {
    ctx.globalAlpha = .9;
    ctx.fillStyle = '#fff4f8';
    ctx.strokeStyle = '#d66d9a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(34, 86, 58, 14, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d66d9a';
    ctx.font = '900 10px Trebuchet MS';
    ctx.fillText(`x${pillowLevel}`, 54, 97);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawPuff(p) {
  ctx.globalAlpha = Math.max(0, p.life / 38);
  ctx.fillStyle = '#fff9dc';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSpeech() {
  if (chi.meow <= 0 && messageTimer <= 0) return;
  const text = chi.meow > 0 ? 'Meow!' : 'Run, Chi!';
  ctx.fillStyle = '#fff9dc';
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 4;
  const x = chi.x + 68;
  const y = chi.y - 34;
  ctx.beginPath();
  ctx.roundRect(x, y, 112, 42, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#20212a';
  ctx.font = '900 24px Trebuchet MS';
  ctx.fillText(text, x + 18, y + 29);
}

function drawCenterText(text) {
  ctx.fillStyle = 'rgba(255, 249, 220, .95)';
  ctx.strokeStyle = '#20212a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(170, 182, 620, 92, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#20212a';
  ctx.font = '900 34px Trebuchet MS';
  ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, 238);
  ctx.textAlign = 'left';
}

function loop(time) {
  const dt = Math.min(32, time - lastTime || 16.67);
  lastTime = time;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if ([' ', 'arrowup', 'w', 'a', 's', 'd'].includes(key)) event.preventDefault();
  if (key === ' ' || key === 'w' || key === 'arrowup') jump();
  if (key === 'd') meow();
});

window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
startButton.addEventListener('click', resetGame);
meowButton.addEventListener('click', meow);
speedButton.addEventListener('click', buySpeed);
pillowButton.addEventListener('click', buyPillow);

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

updateHud();
draw();
requestAnimationFrame(loop);
