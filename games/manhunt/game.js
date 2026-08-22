const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const characterScreen = document.querySelector("#characterScreen");
const gameScreen = document.querySelector("#gameScreen");
const playerNameEl = document.querySelector("#playerName");
const healthText = document.querySelector("#healthText");
const heartFill = document.querySelector("#heartFill");
const phaseText = document.querySelector("#phaseText");
const aliveText = document.querySelector("#aliveText");
const feed = document.querySelector("#feed");
const gameOver = document.querySelector("#gameOver");
const gameOverText = document.querySelector("#gameOverText");
const restartButton = document.querySelector("#restartButton");

const WORLD = { w: 4200, h: 2600 };
const PEOPLE_COUNT = 1000;
const TREE_COUNT = 185;
const CAVE_COUNT = 34;
const PLAYER_MAX_HEALTH = 40;

const phases = [
  { number: 1, name: "Wood", color: "#9b6a35", accent: "#d2aa62", damage: 1, score: 0 },
  { number: 2, name: "Copper", color: "#c8773b", accent: "#ffb06d", damage: 3, score: 16 },
  { number: 3, name: "Iron", color: "#bcc4c7", accent: "#eef6f7", damage: 6, score: 36 },
  { number: 5, name: "Diamond", color: "#47ecff", accent: "#d9ffff", damage: 11, score: 64 },
  { number: 6, name: "Bedrock", color: "#111111", accent: "#f3f3f3", damage: 16, score: 95 },
  { number: 7, name: "Jeteline", color: "#050507", accent: "#8df7ff", damage: 19, score: 132 }
];

const keys = new Set();
const mouse = { x: 0, y: 0, down: false };
const trees = [];
const caves = [];
const people = [];
const particles = [];
const messages = [];
let player;
let camera = { x: 0, y: 0 };
let lastTime = performance.now();
let selectedCharacter = "john";
let running = false;
let globalPhaseIndex = 0;
let phaseClock = 0;

const rand = (min, max) => Math.random() * (max - min) + min;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function phaseForScore(score) {
  let phase = phases[0];
  for (const option of phases) {
    if (score >= option.score) phase = option;
  }
  return phase;
}

function addFeed(text) {
  messages.unshift({ text, life: 5 });
  messages.length = Math.min(messages.length, 4);
}

function resize() {
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(innerWidth * scale);
  canvas.height = Math.floor(innerHeight * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function createWorld() {
  trees.length = 0;
  caves.length = 0;
  people.length = 0;
  particles.length = 0;
  messages.length = 0;

  for (let i = 0; i < TREE_COUNT; i++) {
    trees.push({
      x: rand(90, WORLD.w - 90),
      y: rand(90, WORLD.h - 90),
      size: rand(14, 28),
      wood: rand(60, 130)
    });
  }

  for (let i = 0; i < CAVE_COUNT; i++) {
    caves.push({
      x: rand(160, WORLD.w - 160),
      y: rand(160, WORLD.h - 160),
      r: rand(38, 86),
      ore: rand(140, 260)
    });
  }

  for (let i = 0; i < PEOPLE_COUNT; i++) {
    people.push(createPerson(i));
  }
}

function createPerson(id) {
  const angle = rand(0, Math.PI * 2);
  const radius = rand(280, 1700);
  return {
    id,
    x: clamp(WORLD.w / 2 + Math.cos(angle) * radius, 50, WORLD.w - 50),
    y: clamp(WORLD.h / 2 + Math.sin(angle) * radius, 50, WORLD.h - 50),
    vx: 0,
    vy: 0,
    hp: 22,
    maxHp: 22,
    score: rand(0, 5),
    target: null,
    task: Math.random() < 0.5 ? "trees" : "caves",
    attackCooldown: rand(0, 2),
    alive: true,
    phase: phases[0],
    weapon: ["sword", "axe", "spear", "shield", "crystal"][id % 5],
    build: rand(0.86, 1.14),
    hair: ["#1b1009", "#3a2415", "#111111", "#6b4225"][id % 4],
    skin: ["#f1c29a", "#d99a74", "#b87956", "#f4d0ad"][id % 4],
    blink: rand(0, 1)
  };
}

function createPlayer(character) {
  const isBrad = character === "brad";
  player = {
    x: WORLD.w / 2,
    y: WORLD.h / 2,
    vx: 0,
    vy: 0,
    r: 16,
    hp: PLAYER_MAX_HEALTH,
    maxHp: PLAYER_MAX_HEALTH,
    attackCooldown: 0,
    dashCooldown: 0,
    color: isBrad ? "#19d8ff" : "#ff2c1f",
    name: isBrad ? "Brad" : "John",
    kills: 0
  };
  playerNameEl.textContent = player.name;
}

function startGame(character) {
  selectedCharacter = character;
  characterScreen.classList.remove("is-visible");
  gameScreen.classList.add("is-visible");
  gameOver.hidden = true;
  createWorld();
  createPlayer(character);
  globalPhaseIndex = 0;
  phaseClock = 0;
  running = true;
  lastTime = performance.now();
  addFeed("The manhunt begins.");
  requestAnimationFrame(loop);
}

function worldMouse() {
  return { x: mouse.x + camera.x, y: mouse.y + camera.y };
}

function updatePlayer(dt) {
  let ax = 0;
  let ay = 0;
  if (keys.has("w") || keys.has("arrowup")) ay -= 1;
  if (keys.has("s") || keys.has("arrowdown")) ay += 1;
  if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
  if (keys.has("d") || keys.has("arrowright")) ax += 1;

  const len = Math.hypot(ax, ay) || 1;
  const speed = 245;
  player.vx = (ax / len) * speed;
  player.vy = (ay / len) * speed;

  if (keys.has(" ") && player.dashCooldown <= 0 && (ax || ay)) {
    player.vx += (ax / len) * 560;
    player.vy += (ay / len) * 560;
    player.dashCooldown = 1.25;
    burst(player.x, player.y, player.color, 16);
  }

  player.x = clamp(player.x + player.vx * dt, 20, WORLD.w - 20);
  player.y = clamp(player.y + player.vy * dt, 20, WORLD.h - 20);
  player.attackCooldown -= dt;
  player.dashCooldown -= dt;

  if (keys.has("f")) attackFromPlayer();
}

function attackFromPlayer() {
  if (player.attackCooldown > 0) return;
  player.attackCooldown = 0.28;
  const aim = worldMouse();
  const angle = Math.atan2(aim.y - player.y, aim.x - player.x);
  const reachX = player.x + Math.cos(angle) * 46;
  const reachY = player.y + Math.sin(angle) * 46;
  burst(reachX, reachY, player.color, 8);

  let hit = null;
  let best = 999;
  for (const person of people) {
    if (!person.alive) continue;
    const d = Math.hypot(person.x - reachX, person.y - reachY);
    if (d < 28 && d < best) {
      hit = person;
      best = d;
    }
  }

  if (!hit) return;
  hit.hp -= 8;
  hit.vx += Math.cos(angle) * 160;
  hit.vy += Math.sin(angle) * 160;
  burst(hit.x, hit.y, player.color, 11);
  if (hit.hp <= 0) {
    hit.alive = false;
    player.kills += 1;
    addFeed(`${player.name} defeated a phase ${hit.phase.number} fighter.`);
  }
}

function findNearest(list, actor, maxDist) {
  let best = null;
  let bestDist = maxDist;
  for (const item of list) {
    const d = Math.hypot(item.x - actor.x, item.y - actor.y);
    if (d < bestDist) {
      best = item;
      bestDist = d;
    }
  }
  return best;
}

function updatePeople(dt) {
  phaseClock += dt;
  if (phaseClock > 23 && globalPhaseIndex < phases.length - 1) {
    phaseClock = 0;
    globalPhaseIndex += 1;
    addFeed(`The world reached ${phases[globalPhaseIndex].name}.`);
  }

  const sampleCombat = [];
  for (let i = 0; i < people.length; i++) {
    const p = people[i];
    if (!p.alive) continue;
    p.phase = phaseForScore(Math.max(p.score, phases[globalPhaseIndex].score * 0.5));
    p.attackCooldown -= dt;
    p.blink += dt;

    const nearPlayer = Math.hypot(player.x - p.x, player.y - p.y);
    if (nearPlayer < 360 && Math.random() < 0.035) {
      p.target = player;
      p.task = "hunt";
    } else if (!p.target || Math.random() < 0.005) {
      p.task = Math.random() < 0.54 ? "trees" : "caves";
      p.target = p.task === "trees" ? findNearest(trees, p, 760) : findNearest(caves, p, 900);
    }

    let tx = p.target?.x ?? rand(0, WORLD.w);
    let ty = p.target?.y ?? rand(0, WORLD.h);
    const dx = tx - p.x;
    const dy = ty - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const speed = p.task === "hunt" ? 112 : 66 + p.phase.number * 4;

    p.vx += (dx / d) * speed * dt * 2.6;
    p.vy += (dy / d) * speed * dt * 2.6;
    p.vx *= 0.88;
    p.vy *= 0.88;
    p.x = clamp(p.x + p.vx * dt, 15, WORLD.w - 15);
    p.y = clamp(p.y + p.vy * dt, 15, WORLD.h - 15);

    if (p.target && d < 36) {
      if (p.task === "trees" && p.target.wood > 0) {
        p.target.wood -= dt * 22;
        p.score += dt * 5.5;
        if (Math.random() < 0.04) burst(p.x, p.y, "#7fb446", 2);
      } else if (p.task === "caves" && p.target.ore > 0) {
        p.target.ore -= dt * 18;
        p.score += dt * 7;
        if (Math.random() < 0.04) burst(p.x, p.y, p.phase.accent, 2);
      } else if (p.task === "hunt") {
        hitPlayer(p, dt);
      } else {
        p.target = null;
      }
    }

    if (i % 4 === 0) sampleCombat.push(p);
  }

  for (let i = 0; i < sampleCombat.length; i++) {
    const a = sampleCombat[i];
    if (!a.alive || Math.random() > 0.015) continue;
    const b = people[(a.id + 1 + Math.floor(Math.random() * 23)) % people.length];
    if (b && b.alive && Math.hypot(a.x - b.x, a.y - b.y) < 45) {
      fightPeople(a, b);
    }
  }
}

function hitPlayer(attacker) {
  if (attacker.attackCooldown > 0) return;
  attacker.attackCooldown = 1.1;
  const damage = attacker.phase.damage;
  player.hp -= damage;
  burst(player.x, player.y, attacker.phase.accent, 12);
  addFeed(`${attacker.phase.name} ${attacker.weapon} hit ${player.name} for ${(damage / 2).toFixed(1)} hearts.`);
  if (player.hp <= 0) endGame(false);
}

function fightPeople(a, b) {
  if (a.attackCooldown > 0) return;
  a.attackCooldown = rand(0.6, 1.4);
  b.hp -= a.phase.damage * 0.5;
  b.vx += (b.x - a.x) * 2;
  b.vy += (b.y - a.y) * 2;
  if (b.hp <= 0) {
    b.alive = false;
    a.score += 18;
    if (Math.random() < 0.2) addFeed(`A ${a.phase.name} fighter won a duel.`);
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (const message of messages) message.life -= dt;
  while (messages.length && messages[messages.length - 1].life <= 0) messages.pop();
}

function burst(x, y, color, amount) {
  for (let i = 0; i < amount; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(35, 160);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: rand(0.25, 0.7)
    });
  }
}

function endGame(victory) {
  running = false;
  gameOver.hidden = false;
  gameOverText.textContent = victory
    ? `${player.name} survived the full manhunt.`
    : `${player.name} was taken down after ${player.kills} wins.`;
}

function drawWorld() {
  const w = innerWidth;
  const h = innerHeight;
  camera.x = clamp(player.x - w / 2, 0, WORLD.w - w);
  camera.y = clamp(player.y - h / 2, 0, WORLD.h - h);

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  const grd = ctx.createLinearGradient(0, 0, WORLD.w, WORLD.h);
  grd.addColorStop(0, "#172116");
  grd.addColorStop(0.45, "#2d3124");
  grd.addColorStop(1, "#111412");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  drawTerrainPattern();
  caves.forEach(drawCave);
  trees.forEach(drawTree);
  people.forEach(drawPerson);
  drawPlayer();
  particles.forEach(drawParticle);

  ctx.restore();
}

function drawTerrainPattern() {
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#e7d88a";
  ctx.lineWidth = 1;
  for (let x = 0; x < WORLD.w; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 240, WORLD.h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawCave(cave) {
  ctx.fillStyle = "#080809";
  ctx.beginPath();
  ctx.ellipse(cave.x, cave.y, cave.r * 1.25, cave.r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#414346";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "rgba(97, 233, 255, 0.15)";
  ctx.beginPath();
  ctx.arc(cave.x - cave.r * 0.2, cave.y - cave.r * 0.15, cave.r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(tree) {
  if (tree.wood <= 0) return;
  ctx.fillStyle = "#613a1e";
  ctx.fillRect(tree.x - 4, tree.y, 8, tree.size * 1.25);
  ctx.fillStyle = "#1f6f34";
  ctx.beginPath();
  ctx.arc(tree.x, tree.y - 4, tree.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7fb446";
  ctx.beginPath();
  ctx.arc(tree.x - tree.size * 0.35, tree.y - tree.size * 0.15, tree.size * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawPerson(p) {
  if (!p.alive) return;
  const visible = p.x > camera.x - 70 && p.x < camera.x + innerWidth + 70 && p.y > camera.y - 70 && p.y < camera.y + innerHeight + 70;
  if (!visible) return;

  ctx.save();
  ctx.translate(p.x, p.y);
  const facing = Math.abs(p.vx) > 4 ? Math.sign(p.vx) : 1;
  ctx.scale(facing * p.build, p.build);

  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.beginPath();
  ctx.ellipse(0, 15, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  drawMiniLeg(-4, p.phase);
  drawMiniLeg(5, p.phase);
  drawMiniArm(-12, p.phase, -1);
  drawMiniArm(12, p.phase, 1);
  drawMiniArmor(p.phase);
  drawMiniHead(p);
  drawEquipment(p.phase, p.weapon, 0, -1, 0.52);

  ctx.restore();
}

function makeArmorGradient(phase, x, y, w, h) {
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  if (phase.name === "Bedrock") {
    gradient.addColorStop(0, "#020202");
    gradient.addColorStop(0.55, "#171717");
    gradient.addColorStop(1, "#050505");
  } else if (phase.name === "Jeteline") {
    gradient.addColorStop(0, "#010103");
    gradient.addColorStop(0.45, "#151a1d");
    gradient.addColorStop(0.7, "#050507");
    gradient.addColorStop(1, "#6af7ff");
  } else {
    gradient.addColorStop(0, phase.accent);
    gradient.addColorStop(0.38, phase.color);
    gradient.addColorStop(1, "#171717");
  }
  return gradient;
}

function drawMiniArmor(phase) {
  ctx.fillStyle = makeArmorGradient(phase, -9, -9, 18, 21);
  ctx.beginPath();
  ctx.moveTo(-8, -9);
  ctx.quadraticCurveTo(0, -13, 8, -9);
  ctx.lineTo(10, 8);
  ctx.quadraticCurveTo(0, 14, -10, 8);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(-2, 9);
  ctx.moveTo(4, -8);
  ctx.lineTo(2, 9);
  ctx.stroke();

  if (phase.name === "Bedrock") {
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(-6, -4, 2, 2);
    ctx.fillRect(3, -7, 2, 2);
    ctx.fillRect(4, 4, 2, 2);
  }

  if (phase.name === "Jeteline") {
    ctx.strokeStyle = "rgba(141, 247, 255, 0.92)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, -7);
    ctx.lineTo(7, 8);
    ctx.stroke();
  }
}

function drawMiniLeg(x, phase) {
  ctx.strokeStyle = makeArmorGradient(phase, x - 3, 6, 6, 18);
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, 6);
  ctx.lineTo(x + Math.sign(x) * 2, 18);
  ctx.stroke();
  ctx.lineCap = "butt";
}

function drawMiniArm(x, phase, side) {
  ctx.strokeStyle = makeArmorGradient(phase, x - 3, -7, 7, 18);
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x * 0.7, -6);
  ctx.lineTo(x + side * 2, 7);
  ctx.stroke();
  ctx.lineCap = "butt";
}

function drawMiniHead(p) {
  ctx.fillStyle = p.skin;
  ctx.beginPath();
  ctx.ellipse(0, -18, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = p.hair;
  ctx.beginPath();
  ctx.ellipse(-1, -23, 8, 5, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-7, -23, 14, 4);

  ctx.fillStyle = "#071014";
  ctx.beginPath();
  ctx.arc(-2.7, -18.5, 1.1, 0, Math.PI * 2);
  ctx.arc(2.7, -18.5, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.phase.accent;
  ctx.fillRect(-3.1, -19, 0.8, 0.8);
  ctx.fillRect(2.3, -19, 0.8, 0.8);
}

function drawEquipment(phase, weapon, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const material = makeArmorGradient(phase, -12, -18, 44, 32);
  ctx.strokeStyle = material;
  ctx.fillStyle = material;
  ctx.lineWidth = 4;

  if (phase.name === "Jeteline") {
    ctx.shadowColor = phase.accent;
    ctx.shadowBlur = 12;
  }

  ctx.beginPath();
  if (weapon === "axe") {
    ctx.moveTo(12, -5);
    ctx.lineTo(26, -18);
    ctx.lineTo(30, -10);
    ctx.moveTo(18, -10);
    ctx.lineTo(30, 5);
  } else if (weapon === "spear") {
    ctx.moveTo(13, 8);
    ctx.lineTo(36, -18);
    ctx.moveTo(36, -18);
    ctx.lineTo(30, -15);
    ctx.moveTo(36, -18);
    ctx.lineTo(34, -11);
  } else if (weapon === "shield") {
    ctx.moveTo(15, -13);
    ctx.lineTo(31, -10);
    ctx.lineTo(29, 8);
    ctx.quadraticCurveTo(23, 15, 16, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
  } else if (weapon === "crystal") {
    ctx.moveTo(18, -18);
    ctx.lineTo(29, -7);
    ctx.lineTo(23, 5);
    ctx.lineTo(12, -6);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.moveTo(13, 6);
    ctx.lineTo(34, -17);
  }
  ctx.stroke();

  if (phase.name === "Bedrock") {
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(18, -10, 2, 2);
    ctx.fillRect(25, -3, 2, 2);
  }

  if (phase.name === "Jeteline") {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(17, -14);
    ctx.lineTo(28, -6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  const aim = worldMouse();
  const angle = Math.atan2(aim.y - player.y, aim.x - player.x);
  ctx.rotate(angle);

  ctx.fillStyle = "#030303";
  ctx.fillRect(-14, -18, 28, 36);
  ctx.fillStyle = player.color;
  ctx.fillRect(-13, -18, 5, 36);
  ctx.fillRect(8, -18, 5, 36);
  ctx.fillStyle = "#f1c29a";
  ctx.beginPath();
  ctx.arc(0, -21, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#21140d";
  ctx.fillRect(-10, -31, 20, 10);
  ctx.fillStyle = "#061018";
  ctx.beginPath();
  ctx.arc(-4, -23, 1.8, 0, Math.PI * 2);
  ctx.arc(4, -23, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = selectedCharacter === "john" ? "#ff5b4f" : "#74d7ff";
  ctx.fillRect(-4.7, -23.8, 1.1, 1.1);
  ctx.fillRect(3.3, -23.8, 1.1, 1.1);
  if (selectedCharacter === "john") {
    ctx.fillStyle = "#050505";
    ctx.fillRect(-10, -22, 20, 8);
    ctx.fillStyle = "#ff2c1f";
    ctx.fillRect(-5, -23, 10, 3);
  } else {
    ctx.strokeStyle = "#19d8ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(10, -23, 6, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  ctx.strokeStyle = player.color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(14, 2);
  ctx.lineTo(48, -12);
  ctx.stroke();
  ctx.restore();
}

function drawParticle(p) {
  ctx.globalAlpha = clamp(p.life * 2, 0, 1);
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  ctx.globalAlpha = 1;
}

function updateHud() {
  const hearts = Math.max(0, player.hp / 2);
  healthText.textContent = `${hearts.toFixed(1)} hearts`;
  heartFill.style.width = `${clamp(player.hp / player.maxHp, 0, 1) * 100}%`;
  phaseText.textContent = `World phase: ${phases[globalPhaseIndex].name}`;
  aliveText.textContent = `${people.filter((p) => p.alive).length} people alive`;
  feed.innerHTML = messages.map((m) => `<span>${m.text}</span>`).join("");
  if (people.filter((p) => p.alive).length === 0) endGame(true);
}

function loop(now) {
  if (!running) return;
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  updatePlayer(dt);
  updatePeople(dt);
  updateParticles(dt);
  drawWorld();
  updateHud();
  requestAnimationFrame(loop);
}

document.querySelectorAll("[data-character]").forEach((button) => {
  button.addEventListener("click", () => startGame(button.dataset.character));
});

restartButton.addEventListener("click", () => {
  gameOver.hidden = true;
  characterScreen.classList.add("is-visible");
  gameScreen.classList.remove("is-visible");
});

addEventListener("resize", resize);
addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
});
addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});
resize();
