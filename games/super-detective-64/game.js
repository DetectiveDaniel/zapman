const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const rosterEl = document.querySelector("#roster");
const startButton = document.querySelector("#startButton");
const skipLevelButton = document.querySelector("#skipLevelButton");
const statusEl = document.querySelector("#status");
const heroNameEl = document.querySelector("#heroName");
const powerNameEl = document.querySelector("#powerName");
const levelTextEl = document.querySelector("#levelText");
const healthFillEl = document.querySelector("#healthFill");
const agentsTextEl = document.querySelector("#agentsText");
const cameraTextEl = document.querySelector("#cameraText");

const TAU = Math.PI * 2;
const W = 2600;
const H = 1800;
const TABLE_TOP_Z = 46;
const keys = new Set();
const images = {};

const heroes = [
  { id: "daniel", name: "Detective Daniel", power: "Fast run", asset: "detective-daniel.png", color: "#ff8a22", cooldown: 1, crop: { x: 465, y: 84, w: 520, h: 700 } },
  { id: "matisse", name: "Ninja Matisse", power: "Stretchy arms", asset: "ninja-matisse.png", color: "#ffdc00", cooldown: 1, crop: { x: 350, y: 104, w: 710, h: 690 } },
  { id: "wj", name: "Pirate WJ", power: "Recharge pistol", asset: "pirate-wj.png", color: "#e9322b", cooldown: 4, crop: { x: 240, y: 24, w: 710, h: 780 } },
  { id: "rose", name: "Rose", power: "Kiss of death", asset: "rose.png", color: "#ff4c68", cooldown: 1, crop: { x: 386, y: 46, w: 674, h: 748 } },
  { id: "henry", name: "Henry", power: "Lightning sword", asset: "henry.png", color: "#1db7ff", cooldown: 1, crop: { x: 348, y: 6, w: 574, h: 706 } }
];

const agentCrop = { x: 500, y: 38, w: 390, h: 762 };

const cameraModes = [
  "First Person",
  "Second Person",
  "Third Person",
  "Birds Eye",
  "Map View"
];

const rooms = [
  { x: 140, y: 120, w: 720, h: 520, name: "Library" },
  { x: 940, y: 120, w: 620, h: 520, name: "Gallery" },
  { x: 1660, y: 120, w: 760, h: 520, name: "Study" },
  { x: 140, y: 760, w: 620, h: 470, name: "Kitchen" },
  { x: 840, y: 720, w: 860, h: 560, name: "Grand Hall" },
  { x: 1800, y: 760, w: 620, h: 470, name: "Ballroom" },
  { x: 360, y: 1360, w: 620, h: 320, name: "Cellar Door" },
  { x: 1080, y: 1360, w: 560, h: 320, name: "Vault" },
  { x: 1740, y: 1360, w: 520, h: 320, name: "Exit Wing" }
];

const obstacles = [
  { x: 500, y: 330, w: 160, h: 70 },
  { x: 1090, y: 315, w: 230, h: 55 },
  { x: 1890, y: 310, w: 260, h: 70 },
  { x: 375, y: 930, w: 150, h: 80 },
  { x: 1130, y: 920, w: 220, h: 110 },
  { x: 1430, y: 1010, w: 90, h: 190 },
  { x: 1970, y: 920, w: 190, h: 90 },
  { x: 630, y: 1460, w: 120, h: 90 },
  { x: 1240, y: 1450, w: 220, h: 80 },
  { x: 1950, y: 1465, w: 140, h: 90 }
];

const chairs = obstacles.flatMap((table, index) => {
  const tall = table.h > table.w;
  const group = [];
  if (!tall) {
    group.push({ x: table.x + 22, y: table.y - 44, w: 46, h: 42, angle: Math.PI / 2 });
    group.push({ x: table.x + table.w - 68, y: table.y + table.h + 8, w: 46, h: 42, angle: -Math.PI / 2 });
  } else {
    group.push({ x: table.x - 50, y: table.y + 22, w: 42, h: 46, angle: 0 });
    group.push({ x: table.x + table.w + 8, y: table.y + table.h - 72, w: 42, h: 46, angle: Math.PI });
  }
  if (index % 2 === 0) {
    group.push({ x: table.x + table.w / 2 - 22, y: table.y + table.h + 10, w: 44, h: 40, angle: -Math.PI / 2 });
  }
  return group;
});

const furnitureColliders = [
  ...obstacles,
  ...chairs.map(chair => ({ x: chair.x, y: chair.y, w: chair.w, h: chair.h }))
];

let heroIndex = 0;
let cameraIndex = 2;
let running = false;
let level = 1;
let last = performance.now();
let messageTimer = 0;
let shake = 0;
let mouseLookReady = false;
let mouseLookActive = false;

const player = {
  x: 300,
  y: 320,
  z: 0,
  vz: 0,
  r: 24,
  angle: 0,
  health: 100,
  invuln: 0,
  cooldown: 0,
  kick: 0
};

let agents = [];
let projectiles = [];
let particles = [];

function loadImages() {
  for (const hero of heroes) {
    images[hero.id] = new Image();
    images[hero.id].src = `assets/${hero.asset}`;
  }
  images.agent = new Image();
  images.agent.src = "assets/jim-slattery-agent.png";
}

function buildRoster() {
  rosterEl.innerHTML = "";
  heroes.forEach((hero, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `hero-card${index === heroIndex ? " active" : ""}`;
    card.innerHTML = `<img src="assets/${hero.asset}" alt=""><strong>${index + 1}. ${hero.name}</strong><span>${hero.power}</span>`;
    card.addEventListener("click", () => chooseHero(index));
    rosterEl.append(card);
  });
}

function chooseHero(index) {
  heroIndex = index;
  player.cooldown = 0;
  buildRoster();
  updateHud();
  say(`${heroes[heroIndex].name} is ready.`);
}

function startGame(nextLevel = 1) {
  level = nextLevel;
  running = true;
  overlay.style.display = "none";
  resetPlayer();
  spawnAgents();
  projectiles = [];
  particles = [];
  say(`Level ${level}: clear the mansion wing.`);
  if (cameraModes[cameraIndex] === "First Person") say("Click the game to lock the mouse, then look where you want to go.");
}

function resetPlayer() {
  Object.assign(player, {
    x: 290,
    y: 300,
    z: 0,
    vz: 0,
    r: 24,
    angle: 0,
    health: 100,
    invuln: 0,
    cooldown: 0,
    kick: 0
  });
}

function spawnAgents() {
  const count = 5 + level * 3;
  agents = [];
  for (let i = 0; i < count; i++) {
    const room = rooms[1 + Math.floor(Math.random() * (rooms.length - 1))];
    agents.push({
      x: room.x + 90 + Math.random() * (room.w - 180),
      y: room.y + 90 + Math.random() * (room.h - 180),
      r: 25,
      hp: level > 3 ? 2 : 1,
      weapon: Math.random() < 0.48 ? "gun" : "knife",
      reload: Math.random() * 2,
      stun: 0,
      angle: Math.random() * TAU
    });
  }
}

function say(text) {
  statusEl.textContent = text;
  messageTimer = 2.6;
}

function update(dt) {
  if (!running) return;
  messageTimer = Math.max(0, messageTimer - dt);
  shake = Math.max(0, shake - dt * 20);
  player.cooldown = Math.max(0, player.cooldown - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  player.kick = Math.max(0, player.kick - dt);

  const hero = heroes[heroIndex];
  let speed = hero.id === "daniel" && (keys.has("Shift") || keys.has("shift")) ? 380 : 230;
  if (hero.id === "daniel" && player.cooldown > 0) speed = 520;

  const forward = Number(keys.has("s") || keys.has("ArrowDown")) - Number(keys.has("w") || keys.has("ArrowUp"));
  const strafe = Number(keys.has("d") || keys.has("ArrowRight")) - Number(keys.has("a") || keys.has("ArrowLeft"));
  if (forward || strafe) {
    let mx;
    let my;
    if (cameraModes[cameraIndex] === "First Person") {
      mx = Math.cos(player.angle) * -forward + Math.cos(player.angle + Math.PI / 2) * strafe;
      my = Math.sin(player.angle) * -forward + Math.sin(player.angle + Math.PI / 2) * strafe;
    } else {
      mx = strafe;
      my = forward;
      player.angle = Math.atan2(my, mx);
    }
    const len = Math.hypot(mx, my) || 1;
    moveThing(player, (mx / len) * speed * dt, (my / len) * speed * dt);
  }

  const floorZ = getFloorZ(player);
  if (player.z > floorZ && player.vz === 0) player.vz = -1;
  if (player.z > floorZ || player.vz !== 0) {
    player.z += player.vz * dt;
    player.vz -= 900 * dt;
    const landingZ = getFloorZ(player);
    if (player.z <= landingZ) {
      player.z = landingZ;
      player.vz = 0;
    }
  }

  updateAgents(dt);
  updateProjectiles(dt);
  updateParticles(dt);
  checkExit();
  updateHud();
}

function moveThing(thing, dx, dy) {
  const ox = thing.x;
  const oy = thing.y;
  thing.x = clamp(thing.x + dx, 80, W - 80);
  if (blocked(thing)) thing.x = ox;
  thing.y = clamp(thing.y + dy, 80, H - 80);
  if (blocked(thing)) thing.y = oy;
}

function blocked(thing) {
  if (thing === player) {
    const blockedByChair = chairs.some(chair => circleRect(thing.x, thing.y, thing.r, chair.x, chair.y, chair.w, chair.h));
    const blockedByTableSide = obstacles.some(table => {
      const touching = circleRect(thing.x, thing.y, thing.r, table.x, table.y, table.w, table.h);
      return touching && thing.z < TABLE_TOP_Z - 12;
    });
    return blockedByChair || blockedByTableSide;
  }
  return furnitureColliders.some(o => circleRect(thing.x, thing.y, thing.r, o.x, o.y, o.w, o.h));
}

function getFloorZ(thing) {
  const onTable = obstacles.some(table => circleRect(thing.x, thing.y, Math.max(4, thing.r * .45), table.x, table.y, table.w, table.h));
  return onTable && thing.z >= TABLE_TOP_Z - 18 ? TABLE_TOP_Z : 0;
}

function updateAgents(dt) {
  for (const agent of agents) {
    agent.stun = Math.max(0, agent.stun - dt);
    agent.reload = Math.max(0, agent.reload - dt);
    const dx = player.x - agent.x;
    const dy = player.y - agent.y;
    const dist = Math.hypot(dx, dy) || 1;
    agent.angle = Math.atan2(dy, dx);

    if (agent.stun <= 0) {
      const chaseSpeed = agent.weapon === "knife" ? 145 + level * 8 : 105 + level * 6;
      if (dist > 95 || agent.weapon === "gun") {
        moveThing(agent, (dx / dist) * chaseSpeed * dt, (dy / dist) * chaseSpeed * dt);
      }
      if (agent.weapon === "knife" && dist < 60) hurtPlayer(6 + level);
      if (agent.weapon === "gun" && dist < 760 && agent.reload <= 0) {
        shoot(agent.x, agent.y, agent.angle, 440, "enemy", "#9bd1ff");
        agent.reload = 1.4 + Math.random() * 1.3;
      }
    }
  }
}

function updateProjectiles(dt) {
  for (const p of projectiles) {
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;
    p.life -= dt;
    p.pulse += dt * 8;
    if (p.owner === "hero") {
      for (const agent of agents) {
        if (Math.hypot(agent.x - p.x, agent.y - p.y) < agent.r + p.r) {
          damageAgent(agent, p.damage);
          p.life = 0;
          burst(p.x, p.y, p.color, 14);
          break;
        }
      }
    } else if (Math.hypot(player.x - p.x, player.y - p.y) < player.r + p.r && player.z < 28) {
      hurtPlayer(5 + level);
      p.life = 0;
      burst(p.x, p.y, "#9bd1ff", 9);
    }
    if (furnitureColliders.some(o => circleRect(p.x, p.y, p.r, o.x, o.y, o.w, o.h))) p.life = 0;
  }
  projectiles = projectiles.filter(p => p.life > 0 && p.x > 0 && p.y > 0 && p.x < W && p.y < H);
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);
}

function hurtPlayer(amount) {
  if (player.invuln > 0 || player.z > 50) return;
  player.health -= amount;
  player.invuln = 1.15;
  shake = 8;
  say("An agent landed a hit!");
  if (player.health <= 0) {
    running = false;
    overlay.style.display = "block";
    startButton.textContent = `Retry Level ${level}`;
    say("The agents took over the mansion. Try again.");
  }
}

function skipLevel() {
  if (!running) {
    startGame(level);
    return;
  }
  if (level >= 5) {
    running = false;
    overlay.style.display = "block";
    startButton.textContent = "Play Again";
    say("Skipped to the end. The mansion is safe.");
    level = 1;
    updateHud();
    return;
  }
  startGame(level + 1);
  say(`Skipped ahead to level ${level}.`);
}

function damageAgent(agent, amount = 1) {
  agent.hp -= amount;
  agent.stun = .35;
  if (agent.hp <= 0) {
    burst(agent.x, agent.y, "#84ef75", 18);
    agents = agents.filter(a => a !== agent);
    if (agents.length === 0) say("The way out is open. Reach the gold exit rug.");
  }
}

function kick() {
  if (!running || player.kick > 0) return;
  player.kick = .38;
  const range = 72;
  let hit = false;
  for (const agent of agents) {
    const d = Math.hypot(agent.x - player.x, agent.y - player.y);
    const facing = Math.cos(player.angle) * (agent.x - player.x) + Math.sin(player.angle) * (agent.y - player.y);
    if (d < range && facing > 0) {
      damageAgent(agent, 1);
      hit = true;
    }
  }
  say(hit ? "Kick connected." : "Kick missed.");
}

function usePower() {
  if (!running) return;
  const hero = heroes[heroIndex];
  if (player.cooldown > 0) {
    say(`${hero.power} recharging: ${player.cooldown.toFixed(1)}s`);
    return;
  }
  player.cooldown = hero.cooldown;
  if (hero.id === "daniel") {
    player.cooldown = hero.cooldown;
    say("Detective Daniel bursts into super speed.");
    burst(player.x, player.y, hero.color, 20);
  }
  if (hero.id === "matisse") {
    lineStrike(280, 1, "#ffe04d", "Ninja Matisse stretches his arms.");
  }
  if (hero.id === "wj") {
    shoot(player.x, player.y, player.angle, 760, "hero", "#ff4a34", 2);
    say("Pirate WJ fires his four-second pistol.");
  }
  if (hero.id === "rose") {
    shoot(player.x, player.y, player.angle, 310, "hero", "#ff5a87", 3, 19, "heart");
    say("Rose sends out the kiss of death.");
  }
  if (hero.id === "henry") {
    lineStrike(150, 5, "#58d5ff", "Henry swings the lightning sword.");
    burst(player.x + Math.cos(player.angle) * 80, player.y + Math.sin(player.angle) * 80, "#58d5ff", 24);
  }
}

function lineStrike(range, damage, color, text) {
  let hit = false;
  for (const agent of agents) {
    const ax = agent.x - player.x;
    const ay = agent.y - player.y;
    const forward = Math.cos(player.angle) * ax + Math.sin(player.angle) * ay;
    const side = Math.abs(-Math.sin(player.angle) * ax + Math.cos(player.angle) * ay);
    if (forward > 0 && forward < range && side < 45) {
      damageAgent(agent, damage);
      hit = true;
    }
  }
  particles.push({
    beam: true,
    x: player.x,
    y: player.y,
    angle: player.angle,
    range,
    color,
    life: .18,
    vx: 0,
    vy: 0
  });
  say(hit ? text : `${text} No agent was close enough.`);
}

function shoot(x, y, angle, speed, owner, color, damage = 1, r = 8, kind = "bolt") {
  projectiles.push({ x, y, angle, speed, owner, color, damage, r, kind, life: 2.4, pulse: 0 });
}

function checkExit() {
  if (agents.length > 0) return;
  if (player.x > 2190 && player.y > 1500) {
    if (level >= 5) {
      running = false;
      overlay.style.display = "block";
      startButton.textContent = "Play Again";
      say("Victory! The mansion is safe through all five levels.");
      level = 1;
    } else {
      startGame(level + 1);
    }
  }
}

function draw() {
  const mode = cameraModes[cameraIndex];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  if (shake) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);

  if (mode === "First Person") drawFirstPerson();
  else if (mode === "Second Person") drawSecondPerson();
  else if (mode === "Third Person") drawWorldView(1.05, player.x, player.y, true);
  else if (mode === "Birds Eye") drawWorldView(.5, W / 2, H / 2, true);
  else drawMap();

  ctx.restore();
}

function drawWorldView(scale, cx, cy, showPlayer) {
  const ox = canvas.width / 2 - cx * scale;
  const oy = canvas.height / 2 - cy * scale;
  ctx.setTransform(scale, 0, 0, scale, ox, oy);
  drawMansion();
  for (const p of projectiles) drawProjectile(p);
  for (const agent of agents) drawAgent(agent);
  if (showPlayer) drawPlayer();
  drawParticles();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawFirstPerson() {
  drawBlockyFirstPersonBackground();
  drawFirstPersonMansion();
  drawForwardObjects();
  drawHandAndPower();
  drawCrosshair();
  drawHotbar();
}

function drawBlockyFirstPersonBackground() {
  const horizon = canvas.height * .46 - player.z * .35;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#8f91ff");
  sky.addColorStop(1, "#bfd4ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, horizon);

  ctx.fillStyle = "#d7e6ff";
  for (let i = 0; i < 9; i++) {
    const x = (i * 173 + Math.cos(player.angle + i) * 30) % canvas.width;
    const y = 40 + (i % 3) * 48;
    ctx.fillRect(x, y, 46, 10);
    ctx.fillRect(x + 18, y - 8, 34, 8);
  }

  ctx.fillStyle = "#6b5b47";
  ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);
  ctx.fillStyle = "#58744f";
  for (let y = horizon; y < canvas.height; y += 34) {
    const rowScale = (y - horizon) / canvas.height;
    for (let x = -40; x < canvas.width + 40; x += 58) {
      const offset = ((Math.floor(y / 34) % 2) * 29 + Math.sin(player.angle) * 20) % 58;
      ctx.fillRect(x + offset, y, 34 + rowScale * 24, 18 + rowScale * 20);
    }
  }

  ctx.fillStyle = "rgba(45, 30, 20, .52)";
  ctx.fillRect(0, horizon - 12, canvas.width, 24);
}

function drawSecondPerson() {
  const bx = player.x + Math.cos(player.angle) * 330;
  const by = player.y + Math.sin(player.angle) * 330;
  drawWorldView(1.18, bx, by, true);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f7f0da";
  ctx.font = "700 18px Trebuchet MS";
  ctx.fillText("Second Person: the mansion watches you back", 22, canvas.height - 24);
}

function drawForwardObjects() {
  const visible = [
    ...agents.map(a => ({ ...a, type: "agent" })),
    ...projectiles.map(p => ({ ...p, type: "projectile" }))
  ];
  visible
    .map(o => {
      const dx = o.x - player.x;
      const dy = o.y - player.y;
      const forward = Math.cos(player.angle) * dx + Math.sin(player.angle) * dy;
      const side = -Math.sin(player.angle) * dx + Math.cos(player.angle) * dy;
      return { o, forward, side };
    })
    .filter(v => v.forward > 20 && v.forward < 950 && Math.abs(v.side / v.forward) < .9)
    .sort((a, b) => b.forward - a.forward)
    .forEach(v => {
      const size = clamp(9000 / v.forward, 26, 210);
      const sx = canvas.width / 2 + (v.side / v.forward) * 650;
      const sy = canvas.height * .53 - size * .5;
      if (v.o.type === "agent") drawBillboard(images.agent, sx, sy, size * 1.15, size * 1.45, agentCrop);
      else drawScreenProjectile(v.o, sx, sy, size * .35);
    });
}

function drawFirstPersonMansion() {
  const features = [
    ...obstacles.map(o => ({
      type: "table",
      x: o.x + o.w / 2,
      y: o.y + o.h / 2,
      w: o.w,
      h: o.h,
      color: "#4a2c1e"
    })),
    ...chairs.map(chair => ({
      type: "chair",
      x: chair.x + chair.w / 2,
      y: chair.y + chair.h / 2,
      w: chair.w,
      h: chair.h,
      color: "#333236"
    })),
    ...rooms.flatMap(room => [
      { type: "door", x: room.x + room.w / 2, y: room.y, w: 92, h: 24, color: "#c68a4d" },
      { type: "door", x: room.x + room.w / 2, y: room.y + room.h, w: 92, h: 24, color: "#c68a4d" }
    ]),
    { type: "exit", x: 2270, y: 1565, w: 128, h: 96, color: agents.length === 0 ? "#f4b12f" : "#6c5134" }
  ];

  features
    .map(o => {
      const dx = o.x - player.x;
      const dy = o.y - player.y;
      const forward = Math.cos(player.angle) * dx + Math.sin(player.angle) * dy;
      const side = -Math.sin(player.angle) * dx + Math.cos(player.angle) * dy;
      return { o, forward, side };
    })
    .filter(v => v.forward > 25 && v.forward < 1100 && Math.abs(v.side / v.forward) < 1.05)
    .sort((a, b) => b.forward - a.forward)
    .forEach(v => {
      const depthScale = 850 / v.forward;
      const sx = canvas.width / 2 + (v.side / v.forward) * 660;
      const baseY = canvas.height * .66 + depthScale * 16;
      if (v.o.type === "door" || v.o.type === "exit") {
        const width = clamp(v.o.w * depthScale, 30, 220);
        const height = clamp((v.o.type === "exit" ? 150 : 115) * depthScale, 40, 260);
        ctx.fillStyle = v.o.color;
        ctx.fillRect(sx - width / 2, baseY - height, width, height);
        ctx.strokeStyle = "#1a0e09";
        ctx.lineWidth = clamp(5 * depthScale, 2, 10);
        ctx.strokeRect(sx - width / 2, baseY - height, width, height);
        ctx.fillStyle = "#1a0e09";
        ctx.beginPath();
        ctx.arc(sx + width * .28, baseY - height * .48, clamp(5 * depthScale, 2, 9), 0, TAU);
        ctx.fill();
      } else if (v.o.type === "table") {
        const width = clamp(v.o.w * depthScale, 42, 260);
        const height = clamp(62 * depthScale, 24, 130);
        ctx.fillStyle = "#2a1710";
        ctx.fillRect(sx - width / 2 + 9, baseY - height + 15, width, height);
        ctx.fillStyle = v.o.color;
        ctx.fillRect(sx - width / 2, baseY - height, width, height * .55);
        ctx.fillStyle = "#6b4328";
        ctx.fillRect(sx - width * .38, baseY - height * .45, 12, height * .68);
        ctx.fillRect(sx + width * .28, baseY - height * .45, 12, height * .68);
      } else {
        const width = clamp(58 * depthScale, 28, 120);
        const height = clamp(94 * depthScale, 42, 170);
        ctx.fillStyle = "#111";
        ctx.fillRect(sx - width / 2 + 8, baseY - height + 8, width, height);
        ctx.fillStyle = v.o.color;
        ctx.fillRect(sx - width / 2, baseY - height, width, height * .58);
        ctx.fillStyle = "#242225";
        ctx.fillRect(sx - width * .42, baseY - height * .42, width * .84, height * .28);
        ctx.strokeStyle = "#111";
        ctx.lineWidth = clamp(4 * depthScale, 2, 8);
        ctx.beginPath();
        ctx.moveTo(sx - width * .35, baseY - height * .18);
        ctx.lineTo(sx - width * .5, baseY);
        ctx.moveTo(sx + width * .35, baseY - height * .18);
        ctx.lineTo(sx + width * .5, baseY);
        ctx.stroke();
      }
    });
}

function drawHandAndPower() {
  const hero = heroes[heroIndex];
  ctx.fillStyle = hero.color;
  ctx.strokeStyle = "#1b0f0b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(canvas.width - 280, canvas.height - 180, 180, 110, 28);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f7e8b0";
  ctx.fillRect(canvas.width - 170, canvas.height - 125, 70, 35);
}

function drawCrosshair() {
  ctx.strokeStyle = "rgba(247, 240, 218, .8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 12, canvas.height / 2);
  ctx.lineTo(canvas.width / 2 + 12, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, canvas.height / 2 - 12);
  ctx.lineTo(canvas.width / 2, canvas.height / 2 + 12);
  ctx.stroke();
}

function drawHotbar() {
  const slots = 9;
  const size = 42;
  const gap = 4;
  const total = slots * size + (slots - 1) * gap;
  const startX = canvas.width / 2 - total / 2;
  const y = canvas.height - size - 16;
  for (let i = 0; i < slots; i++) {
    const x = startX + i * (size + gap);
    ctx.fillStyle = i === 0 ? "rgba(245, 245, 245, .28)" : "rgba(24, 24, 24, .62)";
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = i === 0 ? "#f7f0da" : "#545454";
    ctx.lineWidth = i === 0 ? 4 : 3;
    ctx.strokeRect(x, y, size, size);
  }
  const hero = heroes[heroIndex];
  ctx.fillStyle = hero.color;
  ctx.fillRect(startX + 10, y + 10, 22, 22);
}

function drawMap() {
  ctx.fillStyle = "#090706";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / W, canvas.height / H) * .88;
  const ox = (canvas.width - W * scale) / 2;
  const oy = (canvas.height - H * scale) / 2;
  ctx.setTransform(scale, 0, 0, scale, ox, oy);
  drawMansion(true);
  agents.forEach(a => dot(a.x, a.y, a.weapon === "gun" ? "#6cc8ff" : "#9cff5a", 18));
  dot(player.x, player.y, heroes[heroIndex].color, 28);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawMansion(map = false) {
  ctx.fillStyle = "#21150f";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#6d472f";
  ctx.fillRect(90, 80, W - 180, H - 160);
  ctx.fillStyle = "#2e2019";
  rooms.forEach(room => {
    ctx.fillRect(room.x, room.y, room.w, room.h);
    ctx.strokeStyle = "#9a6a45";
    ctx.lineWidth = 10;
    ctx.strokeRect(room.x, room.y, room.w, room.h);
    ctx.fillStyle = "#cfa36a";
    ctx.font = "700 34px Trebuchet MS";
    if (!map) ctx.fillText(room.name, room.x + 28, room.y + 48);
    ctx.fillStyle = "#2e2019";
  });
  ctx.fillStyle = "#62412a";
  ctx.fillRect(780, 350, 140, 90);
  ctx.fillRect(1560, 350, 120, 90);
  ctx.fillRect(700, 975, 160, 100);
  ctx.fillRect(1690, 975, 130, 100);
  ctx.fillRect(960, 1280, 150, 120);
  ctx.fillRect(1640, 1450, 110, 90);
  obstacles.forEach(drawTableTop);
  chairs.forEach(drawChairTop);
  ctx.fillStyle = agents.length === 0 ? "#f4b12f" : "#5f4931";
  ctx.fillRect(2210, 1520, 120, 90);
}

function drawTableTop(table) {
  ctx.fillStyle = "#7e5631";
  ctx.fillRect(table.x, table.y, table.w, table.h);
  ctx.fillStyle = "#b9884f";
  ctx.fillRect(table.x + 8, table.y + 8, table.w - 16, table.h - 16);
  ctx.strokeStyle = "#2a1710";
  ctx.lineWidth = 5;
  ctx.strokeRect(table.x, table.y, table.w, table.h);
}

function drawChairTop(chair) {
  ctx.save();
  ctx.translate(chair.x + chair.w / 2, chair.y + chair.h / 2);
  ctx.rotate(chair.angle);
  ctx.fillStyle = "#252529";
  ctx.fillRect(-chair.w / 2, -chair.h / 2, chair.w, chair.h);
  ctx.fillStyle = "#4a4b50";
  ctx.fillRect(-chair.w / 2 + 7, -chair.h / 2 + 7, chair.w - 14, chair.h - 18);
  ctx.strokeStyle = "#0f0f11";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, -chair.h / 2 + 8, chair.w * .38, Math.PI, 0);
  ctx.stroke();
  ctx.restore();
}

function drawPlayer() {
  const hero = heroes[heroIndex];
  drawShadow(player.x, player.y, player.r);
  drawBillboard(images[hero.id], player.x, player.y - 45 - player.z, 118, 130, hero.crop);
  ctx.strokeStyle = hero.color;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - player.z);
  ctx.lineTo(player.x + Math.cos(player.angle) * 58, player.y + Math.sin(player.angle) * 58 - player.z);
  ctx.stroke();
  if (player.kick > 0) {
    ctx.strokeStyle = "#f7f0da";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(player.x + Math.cos(player.angle) * 48, player.y + Math.sin(player.angle) * 48 - player.z, 28, 0, TAU);
    ctx.stroke();
  }
}

function drawAgent(agent) {
  drawShadow(agent.x, agent.y, agent.r);
  drawBillboard(images.agent, agent.x, agent.y - 42, 108, 126, agentCrop);
  ctx.fillStyle = agent.weapon === "gun" ? "#9bd1ff" : "#e8e1c8";
  ctx.fillRect(agent.x + Math.cos(agent.angle) * 26 - 8, agent.y + Math.sin(agent.angle) * 26 - 46, 36, 8);
}

function drawProjectile(p) {
  if (p.kind === "heart") {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x - 7, p.y - 5, p.r * .55, 0, TAU);
    ctx.arc(p.x + 7, p.y - 5, p.r * .55, 0, TAU);
    ctx.lineTo(p.x, p.y + p.r);
    ctx.fill();
  } else {
    dot(p.x, p.y, p.color, p.r * 2);
  }
}

function drawScreenProjectile(p, x, y, size) {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, TAU);
  ctx.fill();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life * 4);
    if (p.beam) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(p.angle) * p.range, p.y + Math.sin(p.angle) * p.range);
      ctx.stroke();
    } else {
      dot(p.x, p.y, p.color, 8);
    }
    ctx.globalAlpha = 1;
  }
}

function drawBillboard(img, x, y, w, h, crop = null) {
  if (img && img.complete) {
    const source = crop || { x: 0, y: 0, w: img.naturalWidth || w, h: img.naturalHeight || h };
    const aspect = source.w / source.h;
    let drawW = w;
    let drawH = h;
    if (aspect > drawW / drawH) {
      drawH = drawW / aspect;
    } else {
      drawW = drawH * aspect;
    }
    ctx.drawImage(img, source.x, source.y, source.w, source.h, x - drawW / 2, y - drawH / 2, drawW, drawH);
  } else {
    ctx.fillStyle = "#f4b12f";
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
  }
}

function drawShadow(x, y, r) {
  ctx.fillStyle = "rgba(0,0,0,.38)";
  ctx.beginPath();
  ctx.ellipse(x, y + 10, r * 1.15, r * .45, 0, 0, TAU);
  ctx.fill();
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * TAU;
    const s = 80 + Math.random() * 180;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: .35 + Math.random() * .35, color });
  }
}

function dot(x, y, color, size) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, TAU);
  ctx.fill();
}

function circleRect(cx, cy, cr, rx, ry, rw, rh) {
  const nx = clamp(cx, rx, rx + rw);
  const ny = clamp(cy, ry, ry + rh);
  return Math.hypot(cx - nx, cy - ny) < cr;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateHud() {
  const hero = heroes[heroIndex];
  const health = clamp(Math.max(0, player.health), 0, 100);
  const hue = health * 1.2;
  heroNameEl.textContent = hero.name;
  powerNameEl.textContent = hero.power;
  levelTextEl.textContent = level;
  healthFillEl.style.width = `${health}%`;
  healthFillEl.style.backgroundColor = `hsl(${hue}, 72%, 48%)`;
  agentsTextEl.textContent = agents.length;
  cameraTextEl.textContent = cameraModes[cameraIndex];
}

function tick(now) {
  const dt = Math.min(.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(tick);
}

window.addEventListener("keydown", event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.add(key);
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
  if (event.key === " ") {
    if (running && player.vz === 0 && player.z === getFloorZ(player)) {
      player.vz = 430;
      say("Jump!");
    }
  }
  if (key === "c") {
    cameraIndex = (cameraIndex + 1) % cameraModes.length;
    say(`${cameraModes[cameraIndex]} camera.`);
    if (cameraModes[cameraIndex] === "First Person") say("Click the game to lock the mouse, then look where you want to go.");
  }
  if (key === "f") kick();
  if (key === "g") usePower();
  if (key === "r") startGame(level);
  const n = Number(key);
  if (n >= 1 && n <= 5) chooseHero(n - 1);
});

canvas.addEventListener("click", () => {
  if (running && cameraModes[cameraIndex] === "First Person") {
    mouseLookActive = true;
    canvas.focus();
    if (canvas.requestPointerLock) canvas.requestPointerLock();
    say("Mouse look on. Move the mouse to turn.");
  }
});

document.addEventListener("pointerlockchange", () => {
  mouseLookReady = document.pointerLockElement === canvas;
  if (mouseLookReady) say("Mouse look on. Aim where you want to go.");
});

window.addEventListener("mousemove", event => {
  if (running && cameraModes[cameraIndex] === "First Person" && (mouseLookReady || mouseLookActive)) {
    player.angle += event.movementX * 0.006;
  }
});

canvas.addEventListener("mouseenter", () => {
  if (running && cameraModes[cameraIndex] === "First Person") mouseLookActive = true;
});

canvas.addEventListener("mouseleave", () => {
  if (!mouseLookReady) mouseLookActive = false;
});

window.addEventListener("keyup", event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

startButton.addEventListener("click", () => startGame(level));
skipLevelButton.addEventListener("click", skipLevel);

loadImages();
buildRoster();
updateHud();
draw();
requestAnimationFrame(tick);
