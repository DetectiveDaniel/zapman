const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const ui = {
  launchPanel: document.querySelector("#launchPanel"),
  launchButton: document.querySelector("#launchButton"),
  planeCards: [...document.querySelectorAll("[data-plane]")],
  missileCards: [...document.querySelectorAll("[data-missile]")],
  statusBanner: document.querySelector("#statusBanner"),
  damage: document.querySelector("#damageReadout"),
  mission: document.querySelector("#missionReadout"),
  gun: document.querySelector("#gunReadout"),
  missiles: document.querySelector("#missileReadout"),
  target: document.querySelector("#targetReadout")
};

const keys = new Set();
const W = canvas.width;
const H = canvas.height;

const missions = [
  { name: "SKY TRIAL", goal: "DESTROY 4 DRONES", killsNeeded: 4, enemyRate: 1.25, enemies: ["drone"], missileRate: 0.18 },
  { name: "BOMBER BREAK", goal: "STOP 3 BOMBERS", killsNeeded: 3, enemyRate: 1.7, enemies: ["bomber", "drone"], missileRate: 0.28 },
  { name: "ACE STORM", goal: "SURVIVE THE ACE", killsNeeded: 1, enemyRate: 2.3, enemies: ["ace", "drone"], missileRate: 0.42 }
];

const aircraft = {
  mustang: { name: "P-51 Mustang", body: "#b2ad93", wing: "rgba(210, 202, 165, 0.5)", nose: "#d9482e", canopy: "#182126", stripe: "#e2c94b", guns: 320, missiles: 3, weapon: "gun", missileMode: "single" },
  hurricane: { name: "Hawker Hurricane", body: "#586d4f", wing: "rgba(129, 142, 101, 0.52)", nose: "#1b1d18", canopy: "#101819", stripe: "#b23b31", guns: 185, missiles: 3, weapon: "gun", missileMode: "dual-small" },
  spitfire: { name: "Supermarine Spitfire", body: "#7b806f", wing: "rgba(160, 164, 132, 0.5)", nose: "#d7d9d3", canopy: "#11191d", stripe: "#405e95", guns: 190, missiles: 3, weapon: "gun", missileMode: "bomb" },
  bf109: { name: "Messerschmitt Bf 109", body: "#9fb1a1", wing: "rgba(199, 214, 203, 0.48)", nose: "#1e2325", canopy: "#151d1f", stripe: "#2b2f30", guns: 200, missiles: 5, weapon: "gun", missileMode: "single" },
  zero: { name: "Mitsubishi A6M Zero", body: "#42b86f", wing: "rgba(99, 214, 138, 0.5)", nose: "#102116", canopy: "#0f2b21", stripe: "#d83e3a", guns: 420, missiles: 3, weapon: "laser", missileMode: "single" }
};

const missileTypes = {
  speed: { name: "Speed", body: "#dff7ff", nose: "#48d7ff", flame: "#48d7ff", smoke: "#d9fbff", damage: 52, radius: 30, turn: 760, maxSpeed: 680, cooldown: 0.55, life: 3.4 },
  explosion: { name: "Explosion", body: "#282923", nose: "#ff7a1f", flame: "#ff7a1f", smoke: "#6b665f", damage: 92, radius: 96, turn: 360, maxSpeed: 390, cooldown: 0.95, life: 4.6 }
};

const state = {
  running: false,
  over: false,
  won: false,
  time: 0,
  last: 0,
  spawnTimer: 0,
  missionIndex: 0,
  missionKills: 0,
  shake: 0,
  messageTimer: 0,
  message: "MISSION READY",
  lockTarget: null,
  cameraMode: "cockpit",
  selectedPlane: "mustang",
  selectedMissile: "speed",
  stars: [],
  clouds: [],
  bullets: [],
  missiles: [],
  enemyShots: [],
  enemyMissiles: [],
  enemies: [],
  sparks: [],
  muzzleFlash: 0,
  player: {
    x: W * 0.5,
    y: H * 0.44,
    vx: 0,
    vy: 0,
    angle: 0,
    damage: 0,
    guns: 320,
    missiles: 3,
    gunCooldown: 0,
    missileCooldown: 0,
    invuln: 0
  }
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetWorld() {
  const plane = selectedAircraft();
  state.time = 0;
  state.last = performance.now();
  state.spawnTimer = 0.4;
  state.missionIndex = 0;
  state.missionKills = 0;
  state.shake = 0;
  state.messageTimer = 3;
  state.message = `${missions[0].name}: ${missions[0].goal}`;
  state.lockTarget = null;
  state.cameraMode = "cockpit";
  state.bullets = [];
  state.missiles = [];
  state.enemyShots = [];
  state.enemyMissiles = [];
  state.enemies = [];
  state.sparks = [];
  state.muzzleFlash = 0;
  state.stars = Array.from({ length: 95 }, () => ({ x: rand(0, W), y: rand(0, H * 0.8), z: rand(0.25, 1) }));
  state.clouds = Array.from({ length: 13 }, () => ({ x: rand(-120, W), y: rand(35, H * 0.45), s: rand(0.7, 1.8), v: rand(8, 24) }));
  Object.assign(state.player, {
    x: W * 0.5,
    y: H * 0.44,
    vx: 0,
    vy: 0,
    angle: 0,
    damage: 0,
    guns: plane.guns,
    missiles: plane.missiles,
    gunCooldown: 0,
    missileCooldown: 0,
    invuln: 0
  });
  spawnEnemy("drone");
  spawnEnemy("drone");
  updateHud();
}

function startGame() {
  ui.launchPanel.querySelector("h1").textContent = "SPEEDING PLANES!";
  ui.launchPanel.querySelector(".menu-kicker").textContent = "TAKE YOUR PICK";
  ui.launchButton.textContent = "Launch";
  resetWorld();
  state.running = true;
  state.over = false;
  state.won = false;
  ui.launchPanel.classList.add("hidden");
  requestAnimationFrame(loop);
}

function setMessage(text, seconds = 2) {
  state.message = text;
  state.messageTimer = seconds;
}

function currentMission() {
  return missions[state.missionIndex];
}

function selectedAircraft() {
  return aircraft[state.selectedPlane];
}

function selectedMissileType() {
  return missileTypes[state.selectedMissile];
}

function choosePlane(id) {
  state.selectedPlane = id;
  for (const card of ui.planeCards) {
    card.classList.toggle("selected", card.dataset.plane === id);
  }
  setMessage(`${aircraft[id].name.toUpperCase()} READY`, 1.5);
}

function chooseMissile(id) {
  state.selectedMissile = id;
  for (const card of ui.missileCards) {
    card.classList.toggle("selected", card.dataset.missile === id);
  }
  setMessage(`${missileTypes[id].name.toUpperCase()} MISSILES`, 1.5);
}

function spawnEnemy(forcedType) {
  const mission = currentMission();
  const type = forcedType || mission.enemies[Math.floor(rand(0, mission.enemies.length))];
  const health = type === "bomber" ? 52 : type === "ace" ? 96 : 24;
  const speed = type === "bomber" ? rand(22, 36) : type === "ace" ? rand(54, 72) : rand(44, 66);
  state.enemies.push({
    type,
    x: rand(100, W - 100),
    y: rand(72, 210),
    vx: rand(-1, 1) * speed,
    vy: rand(10, 28),
    health,
    maxHealth: health,
    shotTimer: rand(0.7, 1.8),
    missileTimer: rand(2.2, 4.8),
    phase: rand(0, Math.PI * 2),
    lock: 0
  });
}

function lockTarget() {
  let best = null;
  let bestScore = Infinity;
  for (const enemy of state.enemies) {
    const dx = enemy.x - state.player.x;
    const dy = enemy.y - state.player.y;
    const score = Math.hypot(dx, dy) + Math.abs(dx) * 0.6;
    if (score < bestScore) {
      best = enemy;
      bestScore = score;
    }
  }
  state.lockTarget = best;
  setMessage(best ? "TARGET LOCK" : "NO TARGET", 1.2);
}

function togglePerspective() {
  state.cameraMode = state.cameraMode === "cockpit" ? "chase" : "cockpit";
  setMessage(state.cameraMode === "chase" ? "CHASE VIEW" : "COCKPIT VIEW", 1.4);
}

function fireGun() {
  const p = state.player;
  const plane = selectedAircraft();
  if (p.gunCooldown > 0 || p.guns <= 0) return;
  p.gunCooldown = plane.weapon === "laser" ? 0.09 : 0.055;
  p.guns -= plane.weapon === "laser" ? 2 : 1;
  state.muzzleFlash = 0.08;
  const leftGun = state.cameraMode === "chase" ? W * 0.47 : W * 0.37;
  const rightGun = state.cameraMode === "chase" ? W * 0.53 : W * 0.63;
  if (plane.weapon === "laser") {
    state.bullets.push({ x: leftGun, y: H - 72, tx: p.x - 7, ty: p.y, life: 0.16, maxLife: 0.16, kind: "laser", damage: 16 });
    state.bullets.push({ x: rightGun, y: H - 72, tx: p.x + 7, ty: p.y, life: 0.16, maxLife: 0.16, kind: "laser", damage: 16 });
    return;
  }
  state.bullets.push({ x: leftGun, y: H - 72, tx: p.x - 10, ty: p.y, life: 0.42, maxLife: 0.42, kind: "bullet", damage: 8 });
  state.bullets.push({ x: rightGun, y: H - 72, tx: p.x + 10, ty: p.y, life: 0.42, maxLife: 0.42, kind: "bullet", damage: 8 });
}

function fireMissile() {
  const p = state.player;
  const type = selectedMissileType();
  const plane = selectedAircraft();
  if (p.missileCooldown > 0 || p.missiles <= 0) return;
  if (!state.lockTarget || !state.enemies.includes(state.lockTarget)) {
    setMessage("LOCK REQUIRED", 1.1);
    return;
  }
  p.missileCooldown = plane.missileMode === "bomb" ? 1.15 : type.cooldown;
  p.missiles -= 1;
  if (plane.missileMode === "dual-small") {
    state.missiles.push({ x: W * 0.44, y: H - 92, vx: -55, vy: -260, target: state.lockTarget, type: state.selectedMissile, size: "small", life: type.life, smoke: 0 });
    state.missiles.push({ x: W * 0.56, y: H - 92, vx: 55, vy: -260, target: state.lockTarget, type: state.selectedMissile, size: "small", life: type.life, smoke: 0 });
    setMessage("TWIN MISSILES AWAY", 1.1);
    return;
  }
  if (plane.missileMode === "bomb") {
    state.missiles.push({ x: W * 0.5, y: H - 70, vx: 0, vy: -120, target: state.lockTarget, type: "bomb", size: "heavy", life: 4.8, smoke: 0 });
    setMessage("SPITFIRE BOMB AWAY", 1.1);
    return;
  }
  state.missiles.push({ x: W * 0.5, y: H - 92, vx: 0, vy: -240, target: state.lockTarget, type: state.selectedMissile, size: "normal", life: type.life, smoke: 0 });
  setMessage(`${type.name.toUpperCase()} MISSILE AWAY`, 1.1);
}

function damagePlayer(amount, text) {
  const p = state.player;
  if (p.invuln > 0) return;
  p.damage = clamp(p.damage + amount, 0, 100);
  p.invuln = 0.34;
  state.shake = Math.max(state.shake, amount * 0.8);
  burst(p.x, p.y, amount > 12 ? "#ff3d3d" : "#ffbd3b", 16);
  setMessage(text, 1.5);
  if (p.damage >= 100) endGame(false);
}

function burst(x, y, color, count = 12) {
  for (let i = 0; i < count; i++) {
    state.sparks.push({
      x,
      y,
      vx: rand(-140, 140),
      vy: rand(-130, 90),
      life: rand(0.3, 0.9),
      color,
      size: rand(1.5, 4.5)
    });
  }
}

function burnEnemy(enemy, seconds = 3.8) {
  enemy.burning = Math.max(enemy.burning || 0, seconds);
}

function destroyEnemy(enemy) {
  const index = state.enemies.indexOf(enemy);
  if (index !== -1) state.enemies.splice(index, 1);
  if (state.lockTarget === enemy) state.lockTarget = null;
  burst(enemy.x, enemy.y, "#ff6a2a", enemy.type === "bomber" ? 34 : 22);
  state.missionKills += 1;
  const mission = currentMission();
  if (state.missionKills >= mission.killsNeeded) advanceMission();
}

function advanceMission() {
  state.missionIndex += 1;
  state.missionKills = 0;
  state.player.missiles = Math.min(6, state.player.missiles + 2);
  state.player.guns = Math.min(420, state.player.guns + 80);
  state.enemies = [];
  state.enemyShots = [];
  state.enemyMissiles = [];
  state.lockTarget = null;
  if (state.missionIndex >= missions.length) {
    endGame(true);
    return;
  }
  const mission = currentMission();
  setMessage(`${mission.name}: ${mission.goal}`, 3);
  spawnEnemy(mission.enemies[0]);
  spawnEnemy("drone");
}

function endGame(won) {
  state.running = false;
  state.over = true;
  state.won = won;
  ui.launchPanel.classList.remove("hidden");
  ui.launchPanel.querySelector("h1").textContent = won ? "SKIES SECURED" : "PLANE DOWN";
  ui.launchPanel.querySelector(".menu-kicker").textContent = won ? "ALL MISSIONS COMPLETE" : "DAMAGE REACHED 100%";
  ui.launchButton.textContent = "Fly Again";
  setMessage(won ? "VICTORY" : "EJECT", 99);
}

function update(dt) {
  const p = state.player;
  state.time += dt;
  state.spawnTimer -= dt;
  state.shake = Math.max(0, state.shake - 28 * dt);
  state.muzzleFlash = Math.max(0, state.muzzleFlash - dt);
  state.messageTimer = Math.max(0, state.messageTimer - dt);
  p.gunCooldown = Math.max(0, p.gunCooldown - dt);
  p.missileCooldown = Math.max(0, p.missileCooldown - dt);
  p.invuln = Math.max(0, p.invuln - dt);

  const ax = (keys.has("arrowright") || keys.has("d") ? 1 : 0) - (keys.has("arrowleft") || keys.has("a") ? 1 : 0);
  const ay = (keys.has("arrowdown") || keys.has("s") ? 1 : 0) - (keys.has("arrowup") || keys.has("w") ? 1 : 0);
  if (state.cameraMode === "chase") {
    const spinInput = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
    const arrowAim = (keys.has("arrowright") ? 1 : 0) - (keys.has("arrowleft") ? 1 : 0);
    p.angle += spinInput * 3.2 * dt;
    p.vx += arrowAim * 760 * dt;
  } else {
    p.vx += ax * 760 * dt;
  }
  p.vy += ay * 640 * dt;
  p.vx *= Math.pow(0.0008, dt);
  p.vy *= Math.pow(0.0012, dt);
  p.x = clamp(p.x + p.vx * dt, 70, W - 70);
  p.y = clamp(p.y + p.vy * dt, 34, H * 0.76);

  if (keys.has(" ")) fireGun();

  const mission = currentMission();
  if (state.spawnTimer <= 0) {
    spawnEnemy();
    state.spawnTimer = mission.enemyRate + rand(-0.25, 0.55);
  }

  for (const cloud of state.clouds) {
    cloud.x -= cloud.v * dt;
    if (cloud.x < -180) {
      cloud.x = W + rand(10, 200);
      cloud.y = rand(35, H * 0.46);
      cloud.s = rand(0.7, 1.8);
    }
  }

  updateProjectiles(dt);
  updateEnemies(dt);
  updateSparks(dt);
  updateHud();
}

function updateProjectiles(dt) {
  for (const bullet of state.bullets) {
    const t = 1 - bullet.life / bullet.maxLife;
    const oldX = bullet.x;
    const oldY = bullet.y;
    bullet.x = oldX + (bullet.tx - oldX) * Math.min(1, 9 * dt);
    bullet.y = oldY + (bullet.ty - oldY) * Math.min(1, 9 * dt);
    bullet.life -= dt;
    for (const enemy of state.enemies) {
      if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < (enemy.type === "bomber" ? 34 : 24)) {
        enemy.health -= bullet.damage || 8;
        bullet.life = 0;
        burst(bullet.x, bullet.y, bullet.kind === "laser" ? "#65f8ff" : "#ffe77a", bullet.kind === "laser" ? 5 : 3);
        if (enemy.health <= 0) destroyEnemy(enemy);
        break;
      }
    }
  }
  state.bullets = state.bullets.filter(b => b.life > 0 && b.y > -20);

  for (const missile of state.missiles) {
    const type = missile.type === "bomb"
      ? { name: "Bomb", body: "#1f2020", nose: "#ff3d20", flame: "#ff8a1f", smoke: "#4a4742", damage: 150, radius: 138, turn: 240, maxSpeed: 330, cooldown: 1.15, life: 4.8 }
      : missileTypes[missile.type] || missileTypes.speed;
    const smallScale = missile.size === "small" ? 0.62 : 1;
    missile.life -= dt;
    missile.smoke -= dt;
    if (missile.smoke <= 0) {
      missile.smoke = missile.type === "explosion" ? 0.025 : 0.045;
      burst(missile.x, missile.y + 12, type.smoke, missile.type === "explosion" ? 4 : 2);
    }
    if (missile.target && state.enemies.includes(missile.target)) {
      const angle = Math.atan2(missile.target.y - missile.y, missile.target.x - missile.x);
      missile.vx += Math.cos(angle) * type.turn * dt;
      missile.vy += Math.sin(angle) * type.turn * dt;
    }
    const speed = Math.hypot(missile.vx, missile.vy) || 1;
    missile.vx = missile.vx / speed * Math.min(speed, type.maxSpeed);
    missile.vy = missile.vy / speed * Math.min(speed, type.maxSpeed);
    missile.x += missile.vx * dt;
    missile.y += missile.vy * dt;
    for (const enemy of state.enemies) {
      if (Math.hypot(enemy.x - missile.x, enemy.y - missile.y) < type.radius * smallScale) {
        enemy.health -= type.damage * smallScale;
        missile.life = 0;
        burst(enemy.x, enemy.y, type.nose, missile.type === "explosion" || missile.type === "bomb" ? 60 : 26);
        if (missile.type === "bomb") burnEnemy(enemy, 4.8);
        if (missile.type === "explosion" || missile.type === "bomb") {
          for (const nearby of state.enemies) {
            if (nearby !== enemy && Math.hypot(nearby.x - enemy.x, nearby.y - enemy.y) < (missile.type === "bomb" ? 170 : 125)) {
              nearby.health -= missile.type === "bomb" ? 82 : 54;
              if (missile.type === "bomb") burnEnemy(nearby, 3.6);
              burst(nearby.x, nearby.y, "#ffbd3b", 18);
              if (nearby.health <= 0) destroyEnemy(nearby);
            }
          }
        }
        if (enemy.health <= 0) destroyEnemy(enemy);
        break;
      }
    }
  }
  state.missiles = state.missiles.filter(m => m.life > 0 && m.y > -50 && m.x > -50 && m.x < W + 50);

  for (const shot of state.enemyShots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;
    if (Math.hypot(shot.x - state.player.x, shot.y - state.player.y) < 30) {
      shot.life = 0;
      damagePlayer(7, "HIT");
    }
  }
  state.enemyShots = state.enemyShots.filter(s => s.life > 0 && s.y < H + 30);

  for (const missile of state.enemyMissiles) {
    missile.life -= dt;
    const angle = Math.atan2(state.player.y - missile.y, state.player.x - missile.x);
    missile.vx += Math.cos(angle) * 260 * dt;
    missile.vy += Math.sin(angle) * 260 * dt;
    const speed = Math.hypot(missile.vx, missile.vy) || 1;
    missile.vx = missile.vx / speed * Math.min(speed, 310);
    missile.vy = missile.vy / speed * Math.min(speed, 310);
    missile.x += missile.vx * dt;
    missile.y += missile.vy * dt;
    if (Math.hypot(missile.x - state.player.x, missile.y - state.player.y) < 34) {
      missile.life = 0;
      damagePlayer(19, "MISSILE HIT");
    }
  }
  state.enemyMissiles = state.enemyMissiles.filter(m => m.life > 0 && m.y < H + 60 && m.x > -80 && m.x < W + 80);
}

function updateEnemies(dt) {
  const mission = currentMission();
  for (const enemy of [...state.enemies]) {
    enemy.phase += dt;
    if (enemy.burning > 0) {
      enemy.burning -= dt;
      enemy.health -= 14 * dt;
      enemy.vy += 58 * dt;
      enemy.vx += Math.sin(state.time * 9 + enemy.phase) * 44 * dt;
      if (Math.random() < 0.35) burst(enemy.x + rand(-18, 18), enemy.y + rand(-12, 16), "#ff6a2a", 2);
      if (enemy.health <= 0) {
        destroyEnemy(enemy);
        continue;
      }
    }
    enemy.x += (enemy.vx + Math.sin(enemy.phase * 2) * 26) * dt;
    enemy.y += enemy.vy * dt;
    if (enemy.x < 65 || enemy.x > W - 65) enemy.vx *= -1;
    if (enemy.y > H - 150) {
      enemy.y = H - 150;
      enemy.vy *= -0.45;
    }
    enemy.shotTimer -= dt;
    enemy.missileTimer -= dt;
    if (enemy.shotTimer <= 0) {
      const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
      state.enemyShots.push({ x: enemy.x, y: enemy.y + 14, vx: Math.cos(angle) * 280, vy: Math.sin(angle) * 280, life: 2.5 });
      enemy.shotTimer = enemy.type === "ace" ? rand(0.35, 0.7) : rand(0.8, 1.6);
    }
    if (enemy.missileTimer <= 0 && Math.random() < mission.missileRate) {
      state.enemyMissiles.push({ x: enemy.x, y: enemy.y + 18, vx: 0, vy: 120, life: 4.8 });
      enemy.missileTimer = rand(3.5, 6.2);
      setMessage("MISSILE INCOMING", 1.4);
    }
    if (enemy.y > H + 30) destroyEnemy(enemy);
  }
}

function updateSparks(dt) {
  for (const spark of state.sparks) {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 90 * dt;
    spark.life -= dt;
  }
  state.sparks = state.sparks.filter(s => s.life > 0);
}

function updateHud() {
  const p = state.player;
  ui.damage.textContent = `${Math.round(p.damage)}%`;
  ui.mission.textContent = `${Math.min(state.missionIndex + 1, missions.length)}/${missions.length}`;
  ui.gun.textContent = p.guns;
  ui.missiles.textContent = p.missiles;
  ui.target.textContent = state.lockTarget && state.enemies.includes(state.lockTarget) ? state.lockTarget.type.toUpperCase() : "NONE";
  ui.statusBanner.textContent = state.messageTimer > 0 ? state.message : `${currentMission()?.name || "CLEAR"}: ${currentMission()?.goal || "DONE"}`;
}

function draw() {
  const ox = rand(-state.shake, state.shake);
  const oy = rand(-state.shake, state.shake);
  ctx.save();
  ctx.translate(ox, oy);
  drawSky();
  drawProjectiles();
  drawEnemies();
  if (state.cameraMode === "cockpit") {
    drawCockpit();
  } else {
    drawChaseView();
  }
  drawSparks();
  ctx.restore();
}

function drawSky() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#5eb6df");
  grad.addColorStop(0.43, "#bfe6ed");
  grad.addColorStop(0.52, "#7f9a8c");
  grad.addColorStop(1, "#1d2118");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  for (const cloud of state.clouds) drawCloud(cloud.x, cloud.y, cloud.s);

  ctx.fillStyle = "rgba(255,255,255,0.36)";
  for (const star of state.stars) {
    const x = (star.x + state.time * 18 * star.z) % W;
    ctx.fillRect(x, star.y, star.z * 2, star.z * 2);
  }

  ctx.fillStyle = "rgba(39, 66, 55, 0.52)";
  ctx.beginPath();
  ctx.moveTo(0, 410);
  for (let x = 0; x <= W; x += 80) ctx.lineTo(x, 380 + Math.sin(x * 0.02 + state.time) * 34 + rand(-4, 4));
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
}

function drawCloud(x, y, s) {
  ctx.beginPath();
  ctx.ellipse(x, y, 42 * s, 18 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 42 * s, y + 6 * s, 58 * s, 21 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 38 * s, y + 8 * s, 50 * s, 18 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlaneShape(x, y, scale, color, noseColor, enemy = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, enemy ? 28 : -32);
  ctx.lineTo(enemy ? -14 : -48, enemy ? -18 : 18);
  ctx.lineTo(enemy ? -7 : -12, enemy ? -10 : 10);
  ctx.lineTo(enemy ? -36 : -24, enemy ? -34 : 36);
  ctx.lineTo(0, enemy ? -22 : 16);
  ctx.lineTo(enemy ? 36 : 24, enemy ? -34 : 36);
  ctx.lineTo(enemy ? 7 : 12, enemy ? -10 : 10);
  ctx.lineTo(enemy ? 14 : 48, enemy ? -18 : 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = noseColor;
  ctx.beginPath();
  ctx.arc(0, enemy ? 22 : -25, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    const scale = enemy.type === "bomber" ? 1.2 : enemy.type === "ace" ? 1.08 : 0.82;
    const color = enemy.type === "bomber" ? "#37424a" : enemy.type === "ace" ? "#4a1111" : "#2f3d49";
    drawPlaneShape(enemy.x, enemy.y, scale, color, "#ff3d3d", true);
    const barW = enemy.type === "bomber" ? 62 : 44;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(enemy.x - barW / 2, enemy.y - 44, barW, 5);
    ctx.fillStyle = enemy === state.lockTarget ? "#ff3d3d" : "#8cff5a";
    ctx.fillRect(enemy.x - barW / 2, enemy.y - 44, barW * enemy.health / enemy.maxHealth, 5);
    if (enemy === state.lockTarget) drawLock(enemy.x, enemy.y, 42 + Math.sin(state.time * 8) * 4);
    if (enemy.burning > 0) {
      ctx.fillStyle = "rgba(255, 96, 26, 0.82)";
      ctx.beginPath();
      ctx.ellipse(enemy.x + Math.sin(state.time * 20) * 10, enemy.y + 18, 11, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(35, 30, 28, 0.55)";
      ctx.beginPath();
      ctx.ellipse(enemy.x - 8, enemy.y + 36, 24, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawLock(x, y, r) {
  ctx.strokeStyle = "#8cff5a";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x - r - 12, y);
  ctx.lineTo(x - r + 8, y);
  ctx.moveTo(x + r - 8, y);
  ctx.lineTo(x + r + 12, y);
  ctx.moveTo(x, y - r - 12);
  ctx.lineTo(x, y - r + 8);
  ctx.moveTo(x, y + r - 8);
  ctx.lineTo(x, y + r + 12);
  ctx.stroke();
}

function drawProjectiles() {
  ctx.lineCap = "round";
  for (const bullet of state.bullets) {
    const t = clamp(1 - bullet.life / bullet.maxLife, 0, 1);
    ctx.strokeStyle = bullet.kind === "laser" ? "#65f8ff" : "#fff07a";
    ctx.lineWidth = bullet.kind === "laser" ? 5 : 2 + t * 3;
    if (bullet.kind === "laser") ctx.shadowColor = "#65f8ff";
    if (bullet.kind === "laser") ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x + (bullet.tx - bullet.x) * 0.34, bullet.y + (bullet.ty - bullet.y) * 0.34);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  for (const missile of state.missiles) {
    const type = missile.type === "bomb"
      ? { body: "#1f2020", flame: "#ff8a1f" }
      : missileTypes[missile.type] || missileTypes.speed;
    drawMissile(missile.x, missile.y, type.body, type.flame, missile.vx, missile.vy, missile.type, missile.size);
  }
  for (const shot of state.enemyShots) {
    ctx.strokeStyle = "#ff673d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(shot.x, shot.y);
    ctx.lineTo(shot.x - shot.vx * 0.03, shot.y - shot.vy * 0.03);
    ctx.stroke();
  }
  for (const missile of state.enemyMissiles) drawMissile(missile.x, missile.y, "#222", "#ff3d3d", missile.vx, missile.vy);
}

function drawMissile(x, y, body, flame, vx, vy, style = "speed", size = "normal") {
  const angle = Math.atan2(vy, vx) + Math.PI / 2;
  const scale = size === "small" ? 0.68 : style === "bomb" ? 1.45 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(0, style === "explosion" ? 18 : 14);
  ctx.lineTo(style === "explosion" ? -10 : -5, style === "explosion" ? 34 : 25);
  ctx.lineTo(style === "explosion" ? 10 : 5, style === "explosion" ? 34 : 25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = body;
  if (style === "bomb") {
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.fillStyle = "#ff3d20";
    ctx.fillRect(-10, -2, 20, 7);
  } else if (style === "explosion") {
    ctx.fillRect(-8, -13, 16, 30);
    ctx.fillStyle = "rgba(255, 189, 59, 0.9)";
    ctx.fillRect(-10, 0, 20, 8);
  } else {
    ctx.fillRect(-3, -18, 6, 32);
    ctx.fillStyle = "#48d7ff";
    ctx.fillRect(-11, 4, 22, 3);
  }
  ctx.fillStyle = style === "explosion" ? "#ff7a1f" : "#e8fbff";
  ctx.beginPath();
  ctx.moveTo(0, style === "explosion" ? -24 : -25);
  ctx.lineTo(style === "explosion" ? -9 : -5, style === "explosion" ? -12 : -17);
  ctx.lineTo(style === "explosion" ? 9 : 5, style === "explosion" ? -12 : -17);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCockpit() {
  const p = state.player;
  const glass = ctx.createLinearGradient(0, 0, 0, H);
  glass.addColorStop(0, "rgba(180, 255, 235, 0.08)");
  glass.addColorStop(0.58, "rgba(18, 60, 52, 0.05)");
  glass.addColorStop(1, "rgba(0, 0, 0, 0.3)");
  ctx.fillStyle = glass;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(6, 8, 9, 0.92)";
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.moveTo(40, H);
  ctx.quadraticCurveTo(135, 135, W * 0.38, 18);
  ctx.moveTo(W - 40, H);
  ctx.quadraticCurveTo(W - 135, 135, W * 0.62, 18);
  ctx.moveTo(W * 0.5, H);
  ctx.lineTo(W * 0.5, 30);
  ctx.stroke();

  ctx.strokeStyle = "rgba(104, 115, 112, 0.72)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(54, H);
  ctx.quadraticCurveTo(148, 146, W * 0.39, 24);
  ctx.moveTo(W - 54, H);
  ctx.quadraticCurveTo(W - 148, 146, W * 0.61, 24);
  ctx.stroke();

  if (state.player.invuln > 0) {
    ctx.fillStyle = `rgba(255, 32, 32, ${0.12 + Math.sin(state.time * 48) * 0.05})`;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.strokeStyle = "rgba(140,255,90,0.88)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 42, 0, Math.PI * 2);
  ctx.moveTo(p.x - 78, p.y);
  ctx.lineTo(p.x - 18, p.y);
  ctx.moveTo(p.x + 18, p.y);
  ctx.lineTo(p.x + 78, p.y);
  ctx.moveTo(p.x, p.y - 78);
  ctx.lineTo(p.x, p.y - 18);
  ctx.moveTo(p.x, p.y + 18);
  ctx.lineTo(p.x, p.y + 78);
  ctx.stroke();

  drawFirstPersonGuns();

  ctx.fillStyle = "rgba(5, 7, 8, 0.9)";
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(165, H);
  ctx.quadraticCurveTo(245, 405, 335, 382);
  ctx.lineTo(625, 382);
  ctx.quadraticCurveTo(720, 405, 795, H);
  ctx.lineTo(W, H);
  ctx.lineTo(W, H + 50);
  ctx.lineTo(0, H + 50);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(140,255,90,0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.48, 72, 0, Math.PI * 2);
  ctx.moveTo(W / 2 - 100, H * 0.48);
  ctx.lineTo(W / 2 + 100, H * 0.48);
  ctx.moveTo(W / 2, H * 0.48 - 100);
  ctx.lineTo(W / 2, H * 0.48 + 100);
  ctx.stroke();

  ctx.fillStyle = "rgba(140,255,90,0.92)";
  ctx.font = "20px Share Tech Mono";
  ctx.fillText(`ALT ${Math.round(4800 + Math.sin(state.time) * 280)}`, 650, 468);
  ctx.fillText(`SPD ${Math.round(640 + Math.hypot(state.player.vx, state.player.vy) * 0.3)}`, 650, 497);
  ctx.fillText(`DMG ${Math.round(state.player.damage)}%`, 184, 468);
  ctx.fillText(`KILL ${state.missionKills}/${currentMission()?.killsNeeded || 0}`, 184, 497);
}

function drawChaseView() {
  drawChaseHud();
  drawChasePlane(state.player.angle);
}

function drawChaseHud() {
  const p = state.player;
  const plane = selectedAircraft();
  const roll = Math.sin(p.angle) * 46;
  ctx.strokeStyle = "rgba(140,255,90,0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.5 - 170, H * 0.34 + roll);
  ctx.lineTo(W * 0.5 - 54, H * 0.34 - roll * 0.25);
  ctx.moveTo(W * 0.5 + 54, H * 0.34 + roll * 0.25);
  ctx.lineTo(W * 0.5 + 170, H * 0.34 - roll);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(p.x, p.y, 34, 0, Math.PI * 2);
  ctx.moveTo(p.x - 64, p.y);
  ctx.lineTo(p.x - 18, p.y);
  ctx.moveTo(p.x + 18, p.y);
  ctx.lineTo(p.x + 64, p.y);
  ctx.moveTo(p.x, p.y - 64);
  ctx.lineTo(p.x, p.y - 18);
  ctx.moveTo(p.x, p.y + 18);
  ctx.lineTo(p.x, p.y + 64);
  ctx.stroke();

  ctx.fillStyle = "rgba(8, 12, 11, 0.68)";
  ctx.fillRect(20, 20, 210, 34);
  ctx.fillStyle = "rgba(140,255,90,0.9)";
  ctx.font = "20px Share Tech Mono";
  ctx.fillText(plane.name.toUpperCase(), 34, 44);
}

function drawChasePlane(angle) {
  const plane = selectedAircraft();
  const cx = W * 0.5 + (state.player.x - W * 0.5) * 0.34;
  const cy = H + 76 + (state.player.y - H * 0.44) * 0.82;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(angle) * 0.9);

  const flamePulse = 1 + Math.sin(state.time * 34) * 0.18;
  const flame = ctx.createRadialGradient(0, -42, 6, 0, -26, 92 * flamePulse);
  flame.addColorStop(0, "rgba(255,255,210,0.96)");
  flame.addColorStop(0.26, "rgba(255,130,22,0.9)");
  flame.addColorStop(1, "rgba(255,80,0,0)");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.ellipse(0, -36, 66, 122 * flamePulse, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = plane.wing;
  ctx.beginPath();
  ctx.moveTo(-26, -60);
  ctx.bezierCurveTo(-190, -15, -310, 46, -410, 118);
  ctx.lineTo(-86, 92);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(26, -60);
  ctx.bezierCurveTo(190, -15, 310, 46, 410, 118);
  ctx.lineTo(86, 92);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#394144";
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -62, 56, 120, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const metal = ctx.createLinearGradient(-52, -170, 52, 64);
  metal.addColorStop(0, "#f0f2e8");
  metal.addColorStop(0.3, plane.body);
  metal.addColorStop(0.64, "#252b2e");
  metal.addColorStop(1, "#d8ded7");
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.moveTo(0, -260);
  ctx.bezierCurveTo(-58, -194, -68, -82, -44, 24);
  ctx.bezierCurveTo(-24, 54, 24, 54, 44, 24);
  ctx.bezierCurveTo(68, -82, 58, -194, 0, -260);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = plane.canopy;
  ctx.beginPath();
  ctx.ellipse(0, -206, 34, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = plane.nose;
  ctx.fillRect(-13, -104, 26, 92);
  ctx.fillStyle = plane.stripe;
  ctx.fillRect(-35, -154, 70, 10);
  ctx.fillStyle = "rgba(255, 189, 59, 0.86)";
  ctx.beginPath();
  ctx.ellipse(0, -32, 25, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.muzzleFlash > 0) {
    ctx.fillStyle = "rgba(255, 224, 92, 0.88)";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 132, -78);
      ctx.lineTo(side * 113, -127);
      ctx.lineTo(side * 151, -114);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawFirstPersonGuns() {
  const flash = state.muzzleFlash > 0;
  ctx.fillStyle = "#111719";
  ctx.strokeStyle = "#566167";
  ctx.lineWidth = 3;

  for (const side of [-1, 1]) {
    const baseX = W * 0.5 + side * 210;
    ctx.beginPath();
    ctx.moveTo(baseX + side * 28, H);
    ctx.lineTo(baseX + side * 10, H - 105);
    ctx.lineTo(baseX - side * 22, H - 108);
    ctx.lineTo(baseX - side * 44, H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#050707";
    ctx.fillRect(baseX - 13, H - 134, 26, 62);
    ctx.strokeRect(baseX - 13, H - 134, 26, 62);

    if (flash) {
      ctx.fillStyle = "rgba(255, 189, 59, 0.9)";
      ctx.beginPath();
      ctx.moveTo(baseX, H - 154);
      ctx.lineTo(baseX - 19, H - 118);
      ctx.lineTo(baseX + 19, H - 118);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#111719";
  }
}

function drawSparks() {
  for (const spark of state.sparks) {
    ctx.globalAlpha = clamp(spark.life * 2, 0, 1);
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function loop(now) {
  if (!state.running) {
    draw();
    updateHud();
    return;
  }
  const dt = Math.min(0.033, (now - state.last) / 1000 || 0.016);
  state.last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "v", "g", "f5"].includes(key)) {
    event.preventDefault();
  }
  keys.add(key);
  if (key === "f5" && !event.repeat) togglePerspective();
  if (!state.running && (key === "enter" || key === " ")) startGame();
  if (state.running && key === "v") lockTarget();
  if (state.running && key === "g") fireMissile();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

for (const card of ui.planeCards) {
  card.addEventListener("click", () => choosePlane(card.dataset.plane));
}

for (const card of ui.missileCards) {
  card.addEventListener("click", () => chooseMissile(card.dataset.missile));
}

ui.launchButton.addEventListener("click", startGame);

resetWorld();
draw();
