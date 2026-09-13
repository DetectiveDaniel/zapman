const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const heartsEl = document.querySelector("#hearts");
const soldiersEl = document.querySelector("#soldiers");
const distanceEl = document.querySelector("#distance");
const messageEl = document.querySelector("#message");
const restartBtn = document.querySelector("#restart");

const keys = new Set();
const world = { width: 3200, height: 760 };
const player = { x: 90, y: 420, w: 34, h: 48, speed: 235, hearts: 5, fireCooldown: 0, grenadeCooldown: 0, facing: 1 };
let soldiers = [];
let helicopters = [];
let fireballs = [];
let grenades = [];
let missiles = [];
let explosions = [];
let craters = [];
let camera = { x: 0, y: 0 };
let defeated = 0;
let gameOver = false;
let won = false;
let last = performance.now();

function reset() {
  Object.assign(player, { x: 90, y: 420, w: 34, h: 48, speed: 235, hearts: 5, fireCooldown: 0, grenadeCooldown: 0, facing: 1 });
  soldiers = Array.from({ length: 16 }, (_, i) => ({ x: 420 + i * 165 + Math.random() * 70, y: 350 + Math.random() * 280, w: 32, h: 42, hp: 2, speed: 45 + Math.random() * 30 }));
  helicopters = Array.from({ length: 5 }, (_, i) => ({ x: 620 + i * 520, y: 80 + Math.random() * 80, w: 96, h: 44, hp: 4, fire: 1 + Math.random() * 1.5, dir: Math.random() > 0.5 ? 1 : -1 }));
  fireballs = [];
  grenades = [];
  missiles = [];
  explosions = [];
  craters = [];
  defeated = 0;
  gameOver = false;
  won = false;
  messageEl.textContent = "Reach the finish line!";
  updateHud();
}

function updateHud() {
  heartsEl.textContent = player.hearts;
  soldiersEl.textContent = defeated;
  distanceEl.textContent = `${Math.min(100, Math.floor((player.x / 3020) * 100))}%`;
}

function rects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function hitPlayer(amount) {
  if (gameOver) return;
  player.hearts -= amount;
  explosions.push({ x: player.x, y: player.y, r: 8, life: 0.3 });
  if (player.hearts <= 0) {
    gameOver = true;
    messageEl.textContent = "You got blasted! Press Restart.";
  }
}

function shootFireball() {
  if (player.fireCooldown > 0 || gameOver) return;
  fireballs.push({ x: player.x + player.facing * 24, y: player.y - 8, vx: player.facing * 520, r: 8, life: 1.35 });
  player.fireCooldown = 0.18;
}

function throwGrenade() {
  if (player.grenadeCooldown > 0 || gameOver) return;
  grenades.push({ x: player.x + player.facing * 20, y: player.y - 8, vx: player.facing * 290, vy: -230, timer: 0.82, r: 8 });
  player.grenadeCooldown = 0.72;
}

function boom(x, y, radius) {
  explosions.push({ x, y, r: radius, life: 0.4 });
  craters.push({ x, y, r: radius * 0.55 });
  for (const soldier of soldiers) {
    if (!soldier.dead && Math.hypot(soldier.x - x, soldier.y - y) < radius) {
      soldier.dead = true;
      defeated += 1;
    }
  }
  for (const heli of helicopters) {
    if (!heli.dead && Math.hypot(heli.x - x, heli.y - y) < radius + 20) {
      heli.hp -= 2;
      if (heli.hp <= 0) {
        heli.dead = true;
        defeated += 2;
      }
    }
  }
}

function update(dt) {
  if (gameOver) return;
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  player.grenadeCooldown = Math.max(0, player.grenadeCooldown - dt);

  let mx = 0, my = 0;
  if (keys.has("arrowleft") || keys.has("a")) mx -= 1;
  if (keys.has("arrowright") || keys.has("d")) mx += 1;
  if (keys.has("arrowup") || keys.has("w")) my -= 1;
  if (keys.has("arrowdown") || keys.has("s")) my += 1;
  if (mx) player.facing = Math.sign(mx);
  const len = Math.hypot(mx, my) || 1;
  player.x = Math.max(40, Math.min(world.width - 80, player.x + (mx / len) * player.speed * dt));
  player.y = Math.max(270, Math.min(world.height - 45, player.y + (my / len) * player.speed * dt));

  for (const soldier of soldiers) {
    if (soldier.dead) continue;
    const dx = player.x - soldier.x;
    const dy = player.y - soldier.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < 310) {
      soldier.x += (dx / d) * soldier.speed * dt;
      soldier.y += (dy / d) * soldier.speed * dt;
    }
    if (rects({ x: player.x - 15, y: player.y - 35, w: 30, h: 42 }, { x: soldier.x - 14, y: soldier.y - 32, w: 28, h: 40 })) {
      soldier.dead = true;
      hitPlayer(1);
    }
  }

  for (const heli of helicopters) {
    if (heli.dead) continue;
    heli.x += heli.dir * 55 * dt;
    if (heli.x < 380 || heli.x > world.width - 260) heli.dir *= -1;
    heli.fire -= dt;
    if (heli.fire <= 0) {
      missiles.push({ x: heli.x, y: heli.y + 28, vx: (player.x - heli.x) * 0.35, vy: 270, r: 7 });
      heli.fire = 1.4 + Math.random() * 1.2;
    }
  }

  for (const f of fireballs) {
    f.x += f.vx * dt;
    f.life -= dt;
    for (const soldier of soldiers) if (!soldier.dead && Math.hypot(soldier.x - f.x, soldier.y - f.y) < 28) { soldier.dead = true; f.life = 0; defeated += 1; boom(f.x, f.y, 42); }
    for (const heli of helicopters) if (!heli.dead && Math.hypot(heli.x - f.x, heli.y - f.y) < 50) { heli.hp -= 1; f.life = 0; boom(f.x, f.y, 36); if (heli.hp <= 0) { heli.dead = true; defeated += 2; } }
  }
  fireballs = fireballs.filter(f => f.life > 0 && f.x > 0 && f.x < world.width);

  for (const g of grenades) {
    g.x += g.vx * dt;
    g.y += g.vy * dt;
    g.vy += 520 * dt;
    g.timer -= dt;
    if (g.timer <= 0) {
      g.done = true;
      boom(g.x, g.y, 92);
    }
  }
  grenades = grenades.filter(g => !g.done);

  for (const m of missiles) {
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    if (Math.hypot(player.x - m.x, player.y - m.y) < 30) { m.done = true; boom(m.x, m.y, 58); hitPlayer(1); }
    if (m.y > world.height - 40) { m.done = true; boom(m.x, m.y, 55); }
  }
  missiles = missiles.filter(m => !m.done);

  explosions.forEach(e => e.life -= dt);
  explosions = explosions.filter(e => e.life > 0);
  soldiers = soldiers.filter(s => !s.dead || Math.random() > 0.03);
  helicopters = helicopters.filter(h => !h.dead || Math.random() > 0.05);

  if (player.x > world.width - 160) {
    won = true;
    gameOver = true;
    messageEl.textContent = "Finish line reached! You win!";
  }
  updateHud();
}

function sx(x) { return Math.round(x - camera.x); }
function sy(y) { return Math.round(y - camera.y); }

function drawBoy(x, y) {
  ctx.fillStyle = "#10295c"; ctx.fillRect(sx(x - 12), sy(y + 8), 9, 22); ctx.fillRect(sx(x + 4), sy(y + 8), 9, 22);
  ctx.fillStyle = "#9b2d2d"; ctx.fillRect(sx(x - 15), sy(y - 17), 30, 27);
  ctx.fillStyle = "#f1b27a"; ctx.fillRect(sx(x - 10), sy(y - 42), 20, 23);
  ctx.fillStyle = "#3b1f16"; ctx.fillRect(sx(x - 12), sy(y - 48), 24, 10); ctx.fillRect(sx(x + 4), sy(y - 55), 13, 13);
  ctx.fillStyle = "#f1b27a"; ctx.fillRect(sx(x + player.facing * 14), sy(y - 12), player.facing * 14, 8);
}

function drawSoldier(s) {
  ctx.fillStyle = "#1f2937"; ctx.fillRect(sx(s.x - 14), sy(s.y - 26), 28, 36);
  ctx.fillStyle = "#64748b"; ctx.fillRect(sx(s.x - 16), sy(s.y - 42), 32, 16);
  ctx.fillStyle = "#d6a46d"; ctx.fillRect(sx(s.x - 10), sy(s.y - 32), 20, 16);
  ctx.fillStyle = "#111827"; ctx.fillRect(sx(s.x + 12), sy(s.y - 15), 22, 7);
}

function drawHeli(h) {
  ctx.fillStyle = "#d71920"; ctx.fillRect(sx(h.x - 42), sy(h.y - 18), 84, 36);
  ctx.fillStyle = "#d8dee6"; ctx.fillRect(sx(h.x + 5), sy(h.y - 13), 28, 24);
  ctx.fillStyle = "#111"; ctx.fillRect(sx(h.x - 78), sy(h.y - 4), 42, 8); ctx.fillRect(sx(h.x - 50), sy(h.y - 45), 100, 6);
  ctx.fillStyle = "#333"; ctx.fillRect(sx(h.x - 22), sy(h.y + 18), 48, 8);
}

function drawBattlefield() {
  ctx.fillStyle = "#ffa775"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0fa3d8"; ctx.beginPath(); ctx.moveTo(0, 0);
  for (let x = 0; x <= canvas.width; x += 70) ctx.lineTo(x, 85 + Math.sin((x + camera.x) / 170) * 55);
  ctx.lineTo(canvas.width, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#050505"; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = "#6b4a34"; ctx.fillRect(sx(2480), sy(420), 120, 150); ctx.fillStyle = "#8c0018"; ctx.fillRect(sx(2445), sy(390), 170, 160);
  ctx.fillStyle = "#5c2e17"; ctx.fillRect(sx(2490), sy(470), 48, 80);
  ctx.fillStyle = "#050505"; ctx.fillRect(sx(world.width - 120), sy(250), 12, 390);
  ctx.fillStyle = "#f7f7f7"; ctx.fillRect(sx(world.width - 108), sy(255), 70, 36);
  ctx.fillStyle = "#111"; ctx.font = "900 18px monospace"; ctx.fillText("FINISH", sx(world.width - 101), sy(280));
}

function draw() {
  camera.x = Math.max(0, Math.min(world.width - canvas.width, player.x - 360));
  camera.y = Math.max(0, Math.min(world.height - canvas.height, player.y - 360));
  drawBattlefield();
  for (const c of craters) { ctx.fillStyle = "rgba(90,90,90,0.65)"; ctx.beginPath(); ctx.ellipse(sx(c.x), sy(c.y), c.r, c.r * 0.42, 0, 0, Math.PI * 2); ctx.fill(); }
  soldiers.forEach(drawSoldier);
  helicopters.forEach(drawHeli);
  for (const f of fireballs) { ctx.fillStyle = "#ff3d1f"; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r + 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ffd43b"; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r, 0, Math.PI * 2); ctx.fill(); }
  for (const g of grenades) { ctx.fillStyle = "#24351f"; ctx.beginPath(); ctx.arc(sx(g.x), sy(g.y), g.r, 0, Math.PI * 2); ctx.fill(); }
  for (const m of missiles) { ctx.fillStyle = "#111"; ctx.fillRect(sx(m.x - 5), sy(m.y - 14), 10, 28); ctx.fillStyle = "#ff3737"; ctx.fillRect(sx(m.x - 7), sy(m.y - 18), 14, 8); }
  drawBoy(player.x, player.y);
  for (const e of explosions) { ctx.fillStyle = `rgba(255, ${120 + e.life * 180}, 20, ${Math.min(1, e.life * 3)})`; ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), e.r * (1.25 - e.life), 0, Math.PI * 2); ctx.fill(); }
  if (gameOver) { ctx.fillStyle = "rgba(0,0,0,0.62)"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "900 54px monospace"; ctx.fillText(won ? "YOU WIN!" : "GAME OVER", canvas.width / 2, 280); ctx.font = "900 22px monospace"; ctx.fillText("Press Restart", canvas.width / 2, 325); ctx.textAlign = "left"; }
}

function loop(now) { const dt = Math.min(0.033, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(loop); }

restartBtn.addEventListener("click", reset);
window.addEventListener("keydown", e => { keys.add(e.key.toLowerCase()); if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault(); if (e.key === " ") shootFireball(); if (e.key.toLowerCase() === "g") throwGrenade(); });
window.addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
canvas.addEventListener("pointerdown", shootFireball);

reset();
requestAnimationFrame(loop);
