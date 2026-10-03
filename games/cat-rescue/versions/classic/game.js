const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const playButton = document.getElementById("play");
const restartButton = document.getElementById("restart");
const swatchesEl = document.getElementById("swatches");
const levelEl = document.getElementById("level");
const healthEl = document.getElementById("health");
const keyEl = document.getElementById("key");
const catsEl = document.getElementById("cats");
const dogsEl = document.getElementById("dogs");

const keys = new Set();
const colours = [
  { name: "Grey", fur: "#787878", light: "#a6a6a6" },
  { name: "White", fur: "#eeeeee", light: "#ffffff" },
  { name: "Silver", fur: "#aab7c8", light: "#dce6f2" },
  { name: "Black", fur: "#171717", light: "#3a3a3a" }
];

const world = { width: 2200, rescueX: 1940 };
const player = { x: 90, y: 360, w: 34, h: 58, speed: 230, health: 15, facing: 1, cooldown: 0, hurt: 0, key: false };

let chosen = 0;
let level = 1;
let cameraX = 0;
let running = false;
let won = false;
let lastTime = 0;
let animationId = 0;
let pointer = null;
let message = "Pick a colour and press Play";
let messageTimer = 99;
let dogs = [];
let lasers = [];
let spits = [];
let barks = [];
let cats = [];
let spikes = [];
let baths = [];
let particles = [];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function rect(x, y, w, h, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x - cameraX), Math.round(y), Math.round(w), Math.round(h));
}

function uiRect(x, y, w, h, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function makeDog(type, x, y, guard = false) {
  const big = type === "big";
  const bark = type === "bark";
  return {
    type,
    x,
    y,
    w: big ? 72 : bark ? 54 : 44,
    h: big ? 54 : bark ? 46 : 34,
    speed: big ? 54 : bark ? 34 : type === "green" ? 48 : 72,
    guard,
    attack: 0,
    spit: rand(0.4, 1.2),
    bark: rand(0.7, 1.5),
    alive: true
  };
}

function playerBox() {
  return { x: player.x - player.w / 2, y: player.y - player.h, w: player.w, h: player.h };
}

function sparkle(x, y, colour, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({ x, y, vx: rand(-120, 120), vy: rand(-120, 60), life: rand(0.25, 0.7), size: rand(3, 7), colour });
  }
}

function buildCats() {
  cats = Array.from({ length: 8 }, (_, i) => ({
    x: world.rescueX + (i % 4) * 44,
    y: 182 + Math.floor(i / 4) * 54,
    rescued: false,
    blink: Math.random() * 3
  }));
}

function setupLevel(nextLevel) {
  level = nextLevel;
  player.x = 90;
  player.y = 360;
  player.facing = 1;
  player.cooldown = 0;
  player.hurt = 0;
  player.key = false;
  lasers = [];
  spits = [];
  barks = [];
  spikes = [];
  baths = [];
  particles = [];
  pointer = null;
  cameraX = 0;
  running = true;
  won = false;

  if (level === 1) {
    dogs = [
      makeDog("brown", 430, 380),
      makeDog("green", 710, 325),
      makeDog("brown", 970, 405),
      makeDog("green", 1240, 350),
      makeDog("brown", 1490, 392),
      makeDog("green", 1830, 324, true),
      makeDog("green", 1910, 405, true),
      makeDog("green", 2040, 358, true)
    ];
    message = "Level 1: rescue the caged cats!";
  } else if (level === 2) {
    dogs = [
      makeDog("big", 450, 380),
      makeDog("big", 780, 315),
      makeDog("green", 1040, 384),
      makeDog("big", 1320, 410),
      makeDog("big", 1800, 324, true),
      makeDog("big", 1935, 405, true),
      makeDog("green", 2065, 358, true)
    ];
    spikes = [
      { x: 350, y: 498, w: 70, h: 34, armed: 0 },
      { x: 640, y: 498, w: 90, h: 34, armed: 0 },
      { x: 930, y: 498, w: 76, h: 34, armed: 0 },
      { x: 1160, y: 498, w: 96, h: 34, armed: 0 },
      { x: 1520, y: 498, w: 86, h: 34, armed: 0 },
      { x: 1700, y: 498, w: 72, h: 34, armed: 0 }
    ];
    message = "Level 2: big dogs and spikes!";
  } else {
    dogs = [
      makeDog("bark", 470, 365),
      makeDog("bark", 790, 420),
      makeDog("green", 1080, 342),
      makeDog("bark", 1350, 390),
      makeDog("bark", 1790, 324, true),
      makeDog("bark", 1935, 410, true),
      makeDog("bark", 2070, 360, true)
    ];
    baths = [
      { x: 330, y: 482, w: 96, h: 62, bubbles: [1, 6, 3, 8, 2] },
      { x: 665, y: 482, w: 112, h: 62, bubbles: [5, 0, 7, 2, 6, 3] },
      { x: 990, y: 482, w: 96, h: 62, bubbles: [8, 4, 1, 6, 0] },
      { x: 1430, y: 482, w: 122, h: 62, bubbles: [2, 7, 4, 0, 8, 5] },
      { x: 1655, y: 482, w: 96, h: 62, bubbles: [6, 1, 8, 3, 5] }
    ];
    message = "Level 3: baths and bark waves!";
  }

  buildCats();
  messageTimer = 2.6;
  updateHud();
}

function resetGame() {
  player.health = 15;
  setupLevel(1);
  cancelAnimationFrame(animationId);
  lastTime = performance.now();
  animationId = requestAnimationFrame(loop);
}

function shoot() {
  if (!running || player.cooldown > 0) return;
  player.cooldown = 0.1;
  lasers.push({ x: player.x + player.facing * 26, y: player.y - 38, vx: player.facing * 840, w: 28, h: 6, life: 1.1 });
  sparkle(player.x + player.facing * 28, player.y - 38, "#67f7ff", 5);
}

function hurt(amount, text) {
  if (player.hurt > 0 || !running) return;
  player.health -= amount;
  player.hurt = 0.9;
  message = text;
  messageTimer = 1.35;
  sparkle(player.x, player.y - 32, "#ff5e57", 14);
  if (player.health <= 0) {
    player.health = 0;
    running = false;
    won = false;
    message = "The dogs stopped the rescue!";
    messageTimer = 99;
  }
}

function crumbleDeath(text) {
  if (!running) return;
  running = false;
  won = false;
  player.health = 0;
  message = text;
  messageTimer = 99;
  const c = colours[chosen];
  const bits = [c.fur, c.light, "#ff9db5", "#101010", "#2b3138"];
  for (let i = 0; i < 58; i += 1) {
    particles.push({
      x: player.x + rand(-18, 18),
      y: player.y - rand(12, 78),
      vx: rand(-220, 220),
      vy: rand(-230, 80),
      life: rand(0.7, 1.5),
      size: rand(4, 9),
      colour: bits[i % bits.length]
    });
  }
}

function unlock() {
  if (!running) {
    resetGame();
    return;
  }
  if (!player.key) {
    message = "You need the key from the guards!";
    messageTimer = 1.5;
    return;
  }
  if (Math.abs(player.x - world.rescueX) > 210) {
    message = "Stand next to the cages.";
    messageTimer = 1.5;
    return;
  }
  cats.forEach((cat) => {
    cat.rescued = true;
  });
  sparkle(world.rescueX + 88, 230, "#ffd957", 60);
  if (level < 3) {
    setupLevel(level + 1);
    return;
  }
  running = false;
  won = true;
  message = "All cats rescued! You win!";
  messageTimer = 99;
  updateHud();
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) dx -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) dx += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) dy -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) dy += 1;
  if (pointer) {
    dx += pointer.x + cameraX > player.x ? 0.7 : -0.7;
    if (Math.abs(pointer.y - player.y) > 20) dy += pointer.y > player.y ? 0.45 : -0.45;
  }
  const length = Math.hypot(dx, dy) || 1;
  player.x = clamp(player.x + (dx / length) * player.speed * dt, 42, world.width - 50);
  player.y = clamp(player.y + (dy / length) * player.speed * dt, 170, 492);
  if (dx !== 0) player.facing = dx > 0 ? 1 : -1;
  player.cooldown = Math.max(0, player.cooldown - dt);
  player.hurt = Math.max(0, player.hurt - dt);
}

function updateDogs(dt) {
  const p = playerBox();
  let guards = 0;
  for (const dog of dogs) {
    if (!dog.alive) continue;
    if (dog.guard) guards += 1;
    const dist = Math.hypot(player.x - dog.x, player.y - dog.y);
    if (dist < (dog.guard ? 370 : 520)) {
      const dir = Math.sign(player.x - dog.x) || 1;
      if (dog.type !== "green" && dog.type !== "bark" || dist > 170) dog.x += dir * dog.speed * dt;
      if (Math.abs(player.y - dog.y) > 8) dog.y += Math.sign(player.y - dog.y) * dog.speed * 0.42 * dt;
    }
    dog.x = clamp(dog.x, 160, world.width - 70);
    dog.y = clamp(dog.y, 175, 494);
    dog.attack = Math.max(0, dog.attack - dt);
    dog.spit -= dt;
    dog.bark -= dt;

    const box = { x: dog.x - dog.w / 2, y: dog.y - dog.h, w: dog.w, h: dog.h };
    if ((dog.type === "brown" || dog.type === "big") && overlap(p, box) && dog.attack <= 0) {
      dog.attack = dog.type === "big" ? 1.15 : 1;
      hurt(dog.type === "big" ? 2 : 1, dog.type === "big" ? "Big dog bite!" : "Brown dog bite!");
    }
    if (dog.type === "green" && dog.spit <= 0 && dist < 460) {
      const angle = Math.atan2(player.y - 35 - (dog.y - 20), player.x - dog.x);
      spits.push({ x: dog.x, y: dog.y - 24, vx: Math.cos(angle) * 250, vy: Math.sin(angle) * 250, w: 14, h: 14, life: 2.2 });
      dog.spit = dog.guard ? 1 : 1.45;
    }
    if (dog.type === "bark" && dog.bark <= 0 && dist < 560) {
      const angle = Math.atan2(player.y - 38 - (dog.y - 32), player.x - dog.x);
      barks.push({
        x: dog.x + Math.cos(angle) * 24,
        y: dog.y - 32 + Math.sin(angle) * 24,
        vx: Math.cos(angle) * 310,
        vy: Math.sin(angle) * 310,
        radius: 14,
        life: 1.8,
        wobble: 0
      });
      dog.bark = dog.guard ? 1.05 : 1.35;
      sparkle(dog.x, dog.y - 34, "#f6d08d", 8);
    }
  }
  if (guards === 0 && !player.key) {
    player.key = true;
    message = "The guards dropped a key!";
    messageTimer = 2.3;
    sparkle(player.x, player.y - 54, "#ffd957", 28);
  }
  dogs = dogs.filter((dog) => dog.alive);
}

function updateSpikes(dt) {
  const p = playerBox();
  for (const spike of spikes) {
    spike.armed = Math.max(0, spike.armed - dt);
    if (overlap(p, { x: spike.x, y: spike.y - spike.h, w: spike.w, h: spike.h }) && spike.armed <= 0) {
      spike.armed = 1.3;
      hurt(3, "Spikes! -3 health!");
    }
  }
}

function updateBaths() {
  const p = playerBox();
  for (const bath of baths) {
    if (overlap(p, { x: bath.x + 10, y: bath.y - bath.h + 12, w: bath.w - 20, h: bath.h - 8 })) {
      crumbleDeath("You touched a bath!");
      break;
    }
  }
}

function updateProjectiles(dt) {
  for (const laser of lasers) {
    laser.x += laser.vx * dt;
    laser.life -= dt;
    const shot = { x: laser.x - laser.w / 2, y: laser.y - laser.h / 2, w: laser.w, h: laser.h };
    for (const dog of dogs) {
      if (!dog.alive) continue;
      if (overlap(shot, { x: dog.x - dog.w / 2, y: dog.y - dog.h, w: dog.w, h: dog.h })) {
        dog.alive = false;
        laser.life = 0;
        sparkle(dog.x, dog.y - 20, dog.type === "green" ? "#82ff61" : "#67f7ff", 20);
        break;
      }
    }
  }
  lasers = lasers.filter((laser) => laser.life > 0 && laser.x > 0 && laser.x < world.width);

  const p = playerBox();
  for (const spit of spits) {
    spit.x += spit.vx * dt;
    spit.y += spit.vy * dt;
    spit.life -= dt;
    if (overlap(p, { x: spit.x - 7, y: spit.y - 7, w: spit.w, h: spit.h })) {
      spit.life = 0;
      hurt(1, "Green dog spit!");
    }
  }
  spits = spits.filter((spit) => spit.life > 0);

  for (const bark of barks) {
    bark.x += bark.vx * dt;
    bark.y += bark.vy * dt;
    bark.radius += 42 * dt;
    bark.wobble += dt * 12;
    bark.life -= dt;
    if (overlap(p, { x: bark.x - bark.radius, y: bark.y - bark.radius, w: bark.radius * 2, h: bark.radius * 2 })) {
      bark.life = 0;
      crumbleDeath("Bark wave smashed you!");
    }
  }
  barks = barks.filter((bark) => bark.life > 0 && bark.x > 0 && bark.x < world.width && bark.y > 0 && bark.y < canvas.height);
}

function updateParticles(dt) {
  for (const particle of particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 180 * dt;
    particle.life -= dt;
  }
  particles = particles.filter((particle) => particle.life > 0);
}

function updateHud() {
  levelEl.textContent = String(level);
  healthEl.textContent = String(player.health);
  keyEl.textContent = player.key ? "Yes" : "No";
  catsEl.textContent = `${cats.filter((cat) => cat.rescued).length}/${cats.length || 8}`;
  dogsEl.textContent = String(dogs.filter((dog) => dog.alive).length);
}

function update(dt) {
  if (running) {
    updatePlayer(dt);
    updateDogs(dt);
    updateSpikes(dt);
    updateBaths();
    updateProjectiles(dt);
  }
  updateParticles(dt);
  cats.forEach((cat) => {
    cat.blink += dt;
  });
  messageTimer = Math.max(0, messageTimer - dt);
  cameraX = clamp(player.x - canvas.width * 0.38, 0, world.width - canvas.width);
  updateHud();
}

function drawBackground() {
  uiRect(0, 0, canvas.width, 138, "#8fd6ff");
  uiRect(0, 138, canvas.width, canvas.height - 138, "#75bf58");
  for (let x = -((cameraX * 0.18) % 120); x < canvas.width + 120; x += 120) {
    uiRect(x, 76, 70, 18, "#ffffff66");
    uiRect(x + 22, 60, 42, 18, "#ffffff66");
  }
  for (let x = -((cameraX * 0.55) % 48); x < canvas.width + 48; x += 48) uiRect(x, 138, 24, 4, "#477f36");
  for (let x = 0; x < world.width; x += 96) {
    rect(x, 500, 44, 12, "#4b8838");
    rect(x + 16, 488, 8, 16, "#39702c");
  }
  rect(0, 498, world.width, 42, "#4e8b3b");
}

function drawCages() {
  for (let x = 1810; x < 2160; x += 30) rect(x, 120, 10, 238, "#744a2a");
  rect(1792, 166, 390, 10, "#8d6039");
  rect(1792, 292, 390, 10, "#8d6039");
  rect(world.rescueX - 34, 150, 248, 168, "#3d444c");
  rect(world.rescueX - 22, 162, 224, 144, "#a3b1bd");
  for (let x = world.rescueX - 8; x < world.rescueX + 196; x += 28) rect(x, 162, 8, 144, "#31363d");
  rect(world.rescueX - 22, 218, 224, 8, "#31363d");
  rect(world.rescueX - 22, 272, 224, 8, "#31363d");
  if (!player.key && !won) {
    rect(world.rescueX + 80, 230, 40, 38, "#8a551f");
    rect(world.rescueX + 91, 242, 18, 15, "#1a1410");
  }
}

function drawCat(x, y, scale, colour, free = false) {
  const c = colour || colours[chosen];
  rect(x - 9 * scale, y - 34 * scale, 18 * scale, 28 * scale, c.fur);
  rect(x - 13 * scale, y - 52 * scale, 26 * scale, 22 * scale, c.fur);
  rect(x - 12 * scale, y - 60 * scale, 9 * scale, 10 * scale, c.fur);
  rect(x + 3 * scale, y - 60 * scale, 9 * scale, 10 * scale, c.fur);
  rect(x - 7 * scale, y - 45 * scale, 4 * scale, 4 * scale, "#111111");
  rect(x + 4 * scale, y - 45 * scale, 4 * scale, 4 * scale, "#111111");
  rect(x - 3 * scale, y - 37 * scale, 6 * scale, 4 * scale, "#ff9db5");
  if (free) {
    rect(x - 18 * scale, y - 30 * scale, 8 * scale, 6 * scale, c.light);
    rect(x + 10 * scale, y - 30 * scale, 8 * scale, 6 * scale, c.light);
  }
}

function drawPlayer() {
  if (!running && player.health <= 0) return;
  const c = colours[chosen];
  const flash = player.hurt > 0 && Math.floor(player.hurt * 18) % 2 === 0;
  const fur = flash ? "#ff5e57" : c.fur;
  const light = flash ? "#ffb5aa" : c.light;
  const x = player.x;
  const y = player.y;
  const f = player.facing;
  rect(x - 13, y - 50, 26, 36, fur);
  rect(x - 19, y - 76, 38, 30, fur);
  rect(x - 18, y - 88, 12, 16, fur);
  rect(x + 6, y - 88, 12, 16, fur);
  rect(x - 11, y - 65, 6, 6, "#101010");
  rect(x + 5, y - 65, 6, 6, "#101010");
  rect(x - 4, y - 57, 8, 5, "#ff9db5");
  rect(x - 11, y - 15, 8, 18, fur);
  rect(x + 3, y - 15, 8, 18, fur);
  rect(x - 21 * f, y - 40, 17 * f, 8, light);
  rect(x + 12 * f, y - 45, 30 * f, 12, "#2b3138");
  rect(x + 37 * f, y - 43, 12 * f, 6, "#161b20");
  if (player.key) {
    rect(x - 4, y - 96, 16, 8, "#ffd957");
    rect(x + 9, y - 92, 5, 11, "#ffd957");
  }
}

function drawDog(dog) {
  const big = dog.type === "big";
  const bark = dog.type === "bark";
  const body = dog.type === "green" ? "#2f9d49" : bark ? "#c48a54" : big ? "#6b3f25" : "#8b552f";
  const dark = dog.type === "green" ? "#1f6e32" : bark ? "#7a4729" : big ? "#332015" : "#5f341f";
  const face = player.x < dog.x ? -1 : 1;
  const s = big ? 1.55 : bark ? 1.2 : 1;
  rect(dog.x - 20 * s, dog.y - 30 * s, 40 * s, 24 * s, body);
  rect(dog.x - 24 * s * face, dog.y - 38 * s, 24 * s * face, 22 * s, body);
  rect(dog.x - 25 * s * face, dog.y - 48 * s, 9 * s * face, 12 * s, dark);
  if (bark) rect(dog.x + 10 * s * face, dog.y - 52 * s, 18 * s * face, 14 * s, dark);
  rect(dog.x - 8 * s, dog.y - 8 * s, 8 * s, 14 * s, dark);
  rect(dog.x + 10 * s, dog.y - 8 * s, 8 * s, 14 * s, dark);
  rect(dog.x - 28 * s * face, dog.y - 28 * s, 5 * s * face, 5 * s, "#101010");
  rect(dog.x - 35 * s * face, dog.y - 20 * s, 9 * s * face, 5 * s, dog.type === "green" ? "#8cff79" : "#ffffff");
  if (big) rect(dog.x - 44 * s * face, dog.y - 21 * s, 7 * s * face, 5 * s, "#ffffff");
  if (bark) {
    rect(dog.x - 42 * s * face, dog.y - 25 * s, 12 * s * face, 10 * s, "#24150d");
    rect(dog.x - 4 * s, dog.y - 18 * s, 18 * s, 7 * s, "#e84e5f");
  }
  if (dog.guard) rect(dog.x - 15 * s, dog.y - 54 * s, 30 * s, 7 * s, "#ffd957");
}

function drawBaths() {
  for (const bath of baths) {
    rect(bath.x + 12, bath.y - bath.h - 46, 8, 50, "#8d979d");
    rect(bath.x + 12, bath.y - bath.h - 46, 30, 8, "#8d979d");
    rect(bath.x + 37, bath.y - bath.h - 39, 10, 8, "#8d979d");
    rect(bath.x + 34, bath.y - bath.h - 28, 5, 5, "#b7ecff");
    rect(bath.x + 44, bath.y - bath.h - 24, 5, 5, "#b7ecff");
    rect(bath.x + 54, bath.y - bath.h - 27, 5, 5, "#b7ecff");
    rect(bath.x + 6, bath.y - bath.h + 10, bath.w - 12, bath.h - 18, "#d9dde1");
    rect(bath.x, bath.y - bath.h + 24, bath.w, 28, "#f1f3f4");
    rect(bath.x + 10, bath.y - bath.h + 12, bath.w - 20, 12, "#aee9ff");
    for (let i = 0; i < bath.bubbles.length; i += 1) {
      rect(bath.x + 14 + i * 15, bath.y - bath.h + bath.bubbles[i], 12, 8, "#d9f8ff");
    }
    rect(bath.x + 12, bath.y - 8, 12, 8, "#8d979d");
    rect(bath.x + bath.w - 24, bath.y - 8, 12, 8, "#8d979d");
  }
}

function drawSpikes() {
  for (const spike of spikes) {
    const hot = spike.armed > 0;
    rect(spike.x, spike.y - 8, spike.w, 8, hot ? "#ff5e57" : "#34393f");
    for (let x = spike.x; x < spike.x + spike.w; x += 18) {
      rect(x + 4, spike.y - 30, 10, 22, hot ? "#ff9a7a" : "#c8d0d8");
      rect(x + 7, spike.y - 38, 4, 10, hot ? "#ffd0b8" : "#edf2f5");
    }
  }
}

function drawProjectiles() {
  for (const laser of lasers) {
    rect(laser.x - laser.w / 2, laser.y - 3, laser.w, 6, "#67f7ff");
    rect(laser.x - laser.w / 2, laser.y - 1, laser.w, 2, "#ffffff");
  }
  for (const spit of spits) {
    rect(spit.x - 7, spit.y - 7, 14, 14, "#8cff79");
    rect(spit.x - 3, spit.y - 3, 6, 6, "#d7ffd0");
  }
  for (const bark of barks) {
    const r = bark.radius;
    rect(bark.x - r, bark.y - r * 0.6, 5, r * 1.2, "#ffe5a8");
    rect(bark.x - r * 0.45, bark.y - r * 0.9, 5, r * 1.8, "#ffd27c");
    rect(bark.x + r * 0.1, bark.y - r * 0.7, 5, r * 1.4, "#fff2c8");
    rect(bark.x + r * 0.65, bark.y - r * 0.45, 5, r * 0.9, "#ffd27c");
  }
}

function drawMessage() {
  if (messageTimer <= 0) return;
  uiRect(230, 18, 500, 46, "rgba(12, 17, 16, 0.78)");
  ctx.fillStyle = "#fff4a4";
  ctx.font = "900 21px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, canvas.width / 2, 42);
}

function drawEndCard() {
  if (running || !message.includes("!")) return;
  uiRect(0, 0, canvas.width, canvas.height, "rgba(0, 0, 0, 0.38)");
  uiRect(260, 160, 440, 170, "rgba(16, 24, 22, 0.92)");
  ctx.fillStyle = won ? "#ffd957" : "#ff8a78";
  ctx.font = "900 46px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(won ? "RESCUED!" : "TRY AGAIN", canvas.width / 2, 218);
  ctx.fillStyle = "#fff8df";
  ctx.font = "900 22px monospace";
  ctx.fillText("Press Space or Restart", canvas.width / 2, 276);
}

function draw() {
  ctx.imageSmoothingEnabled = false;
  drawBackground();
  drawCages();
  drawBaths();
  drawSpikes();
  cats.forEach((cat, i) => drawCat(cat.x, cat.y + (cat.rescued ? Math.sin(cat.blink * 5 + i) * 8 : 0), 0.72, colours[i % colours.length], cat.rescued));
  dogs.slice().sort((a, b) => a.y - b.y).forEach(drawDog);
  drawProjectiles();
  drawPlayer();
  for (const particle of particles) rect(particle.x, particle.y, particle.size, particle.size, particle.colour);
  drawMessage();
  drawEndCard();
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  update(dt);
  draw();
  animationId = requestAnimationFrame(loop);
}

function canvasPoint(event) {
  const bounds = canvas.getBoundingClientRect();
  return { x: ((event.clientX - bounds.left) / bounds.width) * canvas.width, y: ((event.clientY - bounds.top) / bounds.height) * canvas.height };
}

function makeSwatches() {
  swatchesEl.innerHTML = "";
  colours.forEach((colour, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `swatch${index === chosen ? " selected" : ""}`;
    button.style.background = colour.fur;
    button.title = colour.name;
    button.setAttribute("aria-label", `${colour.name} cat`);
    button.addEventListener("click", () => {
      chosen = index;
      makeSwatches();
      draw();
    });
    swatchesEl.appendChild(button);
  });
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
  if (event.code === "Space") {
    unlock();
    return;
  }
  if (event.code === "KeyF") {
    shoot();
    return;
  }
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("pointerdown", (event) => {
  if (!running) {
    resetGame();
    return;
  }
  pointer = canvasPoint(event);
  player.facing = pointer.x + cameraX > player.x ? 1 : -1;
  shoot();
});
canvas.addEventListener("pointermove", (event) => {
  if (pointer) pointer = canvasPoint(event);
});
canvas.addEventListener("pointerup", () => {
  pointer = null;
});
canvas.addEventListener("pointerleave", () => {
  pointer = null;
});

playButton.addEventListener("click", () => {
  menu.classList.add("hidden");
  resetGame();
});
restartButton.addEventListener("click", resetGame);

makeSwatches();
buildCats();
updateHud();
draw();
