(() => {
  "use strict";

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const GROUND = 442;
  const scoreEl = document.querySelector("#score");
  const waveEl = document.querySelector("#wave");
  const healthHearts = document.querySelector("#health");
  const startScreen = document.querySelector("#startScreen");
  const gameOverScreen = document.querySelector("#gameOverScreen");
  const pausedBadge = document.querySelector("#pausedBadge");
  const pauseButton = document.querySelector("#pauseButton");

  const powerButton = document.querySelector("#powerButton");
  const powerStatus = document.querySelector("#powerStatus");
  const powers = [
    { id: "normal", name: "STEEL", color: "#d6eef2", cooldown: .17 },
    { id: "fire", name: "FIRE", color: "#ff873e", cooldown: .4 },
    { id: "wild", name: "WILD", color: "#c47cff", cooldown: .7 },
    { id: "fog", name: "FOG", color: "#83e6ff", cooldown: .4 },
    { id: "nuclear", name: "NUCLEAR", color: "#a7ff38", cooldown: 3 }
  ];
  let powersUnlocked = false, selectedPower = 0, nextEnergyScore = 1500;
  let clearedWave = 0, fallouts = [], blasts = [], radiationTick = 0;

  const keys = Object.create(null);
  const pointer = { x: W * 0.75, y: GROUND - 80, active: false };
  let state = "title";
  let lastTime = performance.now();
  let elapsed = 0;
  let score = 0;
  let wave = 1;
  let previousWave = 1;
  let spawnTimer = 1.15;
  let shake = 0;
  let flash = 0;
  let bannerTimer = 0;
  let bannerText = "";
  let robotId = 0;
  let shownHealth = -1;
  let audioContext = null;

  const player = {
    x: 340, y: GROUND, vx: 0, vy: 0, w: 48, h: 92,
    facing: 1, health: 100, invulnerable: 0, throwCooldown: 0,
    throwPose: 0, step: 0, onGround: true
  };

  let robots = [];
  let shurikens = [];
  let lasers = [];
  let particles = [];
  let floaters = [];

  function tone(frequency, duration, type = "square", gain = 0.025, endFrequency = frequency) {
    if (window.ZapmanArcadeAudio?.enabled===false || document.hidden || window.ZapmanEducation?.blocked || !audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);
    volume.gain.setValueAtTime(gain, now);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(volume).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function unlockAudio() {
    if (!audioContext) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) audioContext = new AudioCtor();
    }
    if (audioContext?.state === "suspended") audioContext.resume();
  }

  function resetGame() {
    elapsed = 0;
    score = 0;
    wave = 1;
    previousWave = 1;
    spawnTimer = 0.9;
    shake = 0;
    flash = 0;
    bannerText = "WAVE 1";
    bannerTimer = 1.8;
    robotId = 0;
    powersUnlocked = false; selectedPower = 0; nextEnergyScore = 1500;
    clearedWave = 0; fallouts = []; blasts = []; radiationTick = 0;
    robots = [];
    shurikens = [];
    lasers = [];
    particles = [];
    floaters = [];
    Object.assign(player, {
      x: 340, y: GROUND, vx: 0, vy: 0, facing: 1, health: 100,
      invulnerable: 0, throwCooldown: 0, throwPose: 0, step: 0, onGround: true
    });
    updateHud();
  }

  function startGame() {
    unlockAudio();
    resetGame();
    state = "playing";
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    pausedBadge.classList.add("hidden");
    lastTime = performance.now();
    tone(260, 0.12, "square", 0.035, 520);
  }

  function endGame() {
    state = "gameover";
    const oldBest = Number(localStorage.getItem("superShurikenBest") || 0);
    const best = Math.max(oldBest, score);
    localStorage.setItem("superShurikenBest", String(best));
    document.querySelector("#finalScore").textContent = score;
    document.querySelector("#finalWave").textContent = wave;
    document.querySelector("#bestScore").textContent = best > score ? `BEST SCORE ${best}` : "NEW MEADOW RECORD!";
    gameOverScreen.classList.remove("hidden");
    pausedBadge.classList.add("hidden");
    tone(180, 0.5, "sawtooth", 0.04, 55);
  }

  function togglePause() {
    if (state === "playing") {
      state = "paused";
      pausedBadge.classList.remove("hidden");
      pauseButton.textContent = "\u25B6";
    } else if (state === "paused") {
      state = "playing";
      pausedBadge.classList.add("hidden");
      pauseButton.textContent = "II";
      lastTime = performance.now();
    }
  }

  function updateHud() {
    scoreEl.textContent = String(score).padStart(5, "0");
    waveEl.textContent = String(wave);
    const power = powers[selectedPower];
    const powerLabel = `✶ ${power.name} · F`;
    if (powerButton.textContent !== powerLabel) powerButton.textContent = powerLabel;
    powerButton.style.setProperty("--power-color", power.color);
    powerButton.setAttribute("aria-label", `${power.name} shuriken selected. Press F or click to switch.`);
    const status = powersUnlocked
      ? "F: SWITCH · Fire burns 2 · Wild: 50/50 lane or sky · Fog blinds · Nuclear: beware fallout!"
      : `MEADOW ENERGY: ${Math.max(0, nextEnergyScore - score)} points to unlock four powers`;
    if (powerStatus.textContent !== status) powerStatus.textContent = status;

    if (shownHealth !== player.health) {
      shownHealth = player.health;
      const fragment = document.createDocumentFragment();
      for (let index = 0; index < 5; index++) {
        const heart = document.createElement("span");
        const fill = Math.max(0, Math.min(1, (player.health - index * 20) / 20));
        heart.className = "heart";
        heart.style.setProperty("--fill", `${fill * 100}%`);
        fragment.appendChild(heart);
      }
      healthHearts.replaceChildren(fragment);
      healthHearts.setAttribute("aria-label", `${Math.ceil(player.health / 20)} of 5 hearts remaining`);
    }
  }

  function spawnRobot() {
    const side = Math.random() < 0.18 && wave > 2 ? -1 : 1;
    const heavyChance = Math.min(0.33, Math.max(0, wave - 2) * 0.055);
    const heavy = Math.random() < heavyChance;
    const scale = heavy ? 1.18 : 0.94 + Math.random() * 0.16;
    const hp = heavy ? 3 + Math.floor(wave / 5) : 1 + Math.floor(wave / 6);
    robots.push({
      id: ++robotId,
      x: side > 0 ? W + 60 : -60,
      y: GROUND,
      side,
      scale,
      w: 54 * scale,
      h: 94 * scale,
      hp,
      maxHp: hp,
      speed: (heavy ? 35 : 48 + Math.random() * 18) + wave * 2.1,
      shootTimer: 0.75 + Math.random() * 1.5,
      shootPose: 0,
      hit: 0,
      phase: Math.random() * Math.PI * 2,
      heavy,
      dead: false, fog: 0, burn: 0
    });
  }

  function nearestRobot() {
    let nearest = null;
    let best = Infinity;
    for (const robot of robots) {
      const dx = robot.x - player.x;
      const dy = robot.y - robot.h * 0.56 - (player.y - player.h * 0.55);
      const distance = dx * dx + dy * dy;
      if (distance < best) {
        best = distance;
        nearest = { x: robot.x, y: robot.y - robot.h * 0.56 };
      }
    }
    return nearest;
  }

  function gainMeadowEnergy() {
    player.health = Math.min(100, player.health + 20);
    const newlyUnlocked = !powersUnlocked;
    powersUnlocked = true;
    if (newlyUnlocked) selectedPower = 1;
    floaters.push({ x:player.x, y:player.y-player.h-15,
      text:newlyUnlocked ? "MEADOW ENERGY! POWERS UNLOCKED · F" : "MEADOW ENERGY +20",
      life:2.5, color:"#75ff8c" });
    updateHud();
    tone(440, .25, "triangle", .03, 880);
  }

  function switchPower() {
    if (state !== "playing") return;
    if (!powersUnlocked) {
      floaters.push({x:player.x,y:player.y-player.h-15,text:"MEADOW ENERGY UNLOCKS POWERS",life:1.2,color:"#75ff8c"});
      return;
    }
    selectedPower = (selectedPower + 1) % powers.length;
    updateHud();
    tone(300 + selectedPower * 100, .08, "triangle", .018);
  }

  function detonateNuclear(shuriken) {
    if (shuriken.detonated) return;
    shuriken.detonated = true; shuriken.life = 0;
    for (const robot of robots) if (!robot.dead) killRobot(robot);
    lasers = [];
    // The rest of this timed wave is cleared too, including unspawned robots.
    clearedWave = wave;
    const side = shuriken.x >= player.x ? 1 : -1;
    const x = Math.max(70, Math.min(W - 70, shuriken.x - side * 90));
    fallouts.push({ x, side, life:12, grace:.65 });
    blasts.push({ x:shuriken.x,y:shuriken.y,life:1.2,max:1.2,kind:"nuclear" });
    shake = 20;
    floaters.push({x:W/2,y:190,text:"WAVE CLEARED! STAY BEHIND THE GREEN LINE",life:2.5,color:"#baff58"});
    for (let i=0;i<75;i++) particles.push({x:shuriken.x,y:shuriken.y,vx:(Math.random()-.5)*850,vy:-Math.random()*600,life:1.2,max:1.2,size:5+Math.random()*14,color:i%2?"#adff45":"#fff5a0"});
    tone(110, .7, "sawtooth", .04, 40);
  }

  function hitWithPower(shuriken, robot) {
    shuriken.life = 0;
    if (shuriken.kind === "nuclear") { detonateNuclear(shuriken); return; }
    if (shuriken.kind === "wild") {
      // This meadow has one ground lane: sweep its horizontal band both ways.
      for (const target of robots) {
        if (!target.dead && target.y >= shuriken.y - 36 && target.y - target.h <= shuriken.y + 36) killRobot(target);
      }
      blasts.push({x:shuriken.x,y:shuriken.y,life:.5,max:.5,kind:"wild"});
      floaters.push({x:W/2,y:210,text:"WILD LANE SWEEP!",life:1,color:"#c47cff"});
    } else if (shuriken.kind === "fire") {
      const targets = robots.filter(r=>!r.dead && r !== robot && Math.abs(r.x-robot.x)<170)
        .sort((a,b)=>Math.abs(a.x-robot.x)-Math.abs(b.x-robot.x));
      for (const target of [robot,...targets.slice(0,1)]) target.burn = 1.2;
      floaters.push({x:robot.x,y:robot.y-robot.h,text:targets.length?"DOUBLE BURN!":"BURNING!",life:1,color:"#ff873e"});
    } else if (shuriken.kind === "fog") {
      robot.fog = 5;
      robot.shootPose = 0;
      floaters.push({x:robot.x,y:robot.y-robot.h,text:"CAN'T SEE!",life:1,color:"#b9eeff"});
    } else {
      robot.hp--;
      robot.x += Math.sign(shuriken.vx) * 12;
      if (robot.hp <= 0) killRobot(robot);
    }
    robot.hit = .12;
    for (let i=0;i<8;i++) particles.push({x:shuriken.x,y:shuriken.y,vx:(Math.random()-.5)*190,vy:(Math.random()-.5)*190,life:.26,max:.26,size:2+Math.random()*4,color:powers.find(p=>p.id===shuriken.kind).color});
    tone(310, .08, "square", .025, 120);
  }

  function throwShuriken(usePointer = true) {
    if (state !== "playing" || player.throwCooldown > 0) return;
    let target = usePointer && pointer.active ? pointer : null;
    if (!target) target = nearestRobot();
    if (!target) target = { x: player.x + player.facing * 300, y: player.y - 58 };
    const startX = player.x + player.facing * 25;
    const startY = player.y - 57;
    let dx = target.x - startX;
    let dy = target.y - startY;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) dx = player.facing;
    const length = Math.hypot(dx, dy) || 1;
    const speed = 750;
    player.facing = dx >= 0 ? 1 : -1;
    const power = powers[selectedPower];
    player.throwCooldown = power.cooldown;
    player.throwPose = 0.2;
    shurikens.push({
      x: startX, y: startY,
      vx: dx / length * speed,
      vy: dy / length * speed,
      rotation: 0,
      life: power.id === "nuclear" ? 1 : 1.55,
      kind: power.id, sky: power.id === "wild" && Math.random() < .5,
      trail: []
    });
    const thrown = shurikens[shurikens.length - 1];
    if (thrown.sky) {
      thrown.vx = player.facing * 90; thrown.vy = -850;
      floaters.push({x:player.x,y:player.y-player.h-20,text:"WILD... INTO THE SKY!",life:1.1,color:power.color});
    }
    tone(620, 0.07, "triangle", 0.018, 260);
  }

  function robotShoot(robot) {
    if (robot.dead || robot.fog > 0) return;
    const muzzleX = robot.x + (player.x < robot.x ? -1 : 1) * robot.w * 0.48;
    const muzzleY = robot.y - robot.h * 0.56;
    const targetX = player.x + player.vx * 0.16;
    const targetY = player.y - player.h * 0.5 + player.vy * 0.08;
    const dx = targetX - muzzleX;
    const dy = targetY - muzzleY;
    const length = Math.hypot(dx, dy) || 1;
    const speed = 410 + wave * 11;
    lasers.push({
      x: muzzleX, y: muzzleY,
      px: muzzleX, py: muzzleY,
      vx: dx / length * speed,
      vy: dy / length * speed,
      life: 2.5,
      width: robot.heavy ? 7 : 5
    });
    robot.shootPose = 0.22;
    for (let i = 0; i < 6; i++) {
      particles.push({ x:muzzleX, y:muzzleY, vx:(Math.random()-.5)*110, vy:(Math.random()-.5)*110, life:.22, max:.22, size:3+Math.random()*4, color:"#57f5ff" });
    }
    tone(150, 0.15, "sawtooth", 0.025, 80);
  }

  function hurtPlayer(amount, sourceX) {
    if (player.invulnerable > 0 || state !== "playing") return;
    player.health = Math.max(0, player.health - amount);
    player.invulnerable = 0.62;
    player.vx += player.x < sourceX ? -170 : 170;
    player.vy = -170;
    shake = Math.max(shake, 9);
    flash = 0.16;
    floaters.push({ x:player.x, y:player.y-player.h, text:`-${amount}`, life:.75, color:"#ff4355" });
    for (let i = 0; i < 12; i++) {
      particles.push({ x:player.x, y:player.y-player.h*.5, vx:(Math.random()-.5)*210, vy:-30-Math.random()*150, life:.45, max:.45, size:3+Math.random()*5, color:i%2?"#ff4355":"#ffd53b" });
    }
    updateHud();
    tone(95, 0.28, "square", 0.04, 48);
    if (player.health <= 0) endGame();
  }

  function killRobot(robot) {
    if (robot.dead) return;
    robot.dead = true;
    const points = robot.heavy ? 250 : 100;
    score += points;
    shake = Math.max(shake, robot.heavy ? 8 : 4);
    floaters.push({ x:robot.x, y:robot.y-robot.h, text:`+${points}`, life:.8, color:"#fff36c" });
    for (let i = 0; i < (robot.heavy ? 24 : 15); i++) {
      const palette = ["#50f4ff", "#ff5252", "#475c6c", "#ffca3a"];
      particles.push({ x:robot.x+(Math.random()-.5)*robot.w, y:robot.y-Math.random()*robot.h, vx:(Math.random()-.5)*260, vy:-50-Math.random()*210, life:.5+Math.random()*.35, max:.85, size:3+Math.random()*6, color:palette[i%palette.length] });
    }
    while (score >= nextEnergyScore) {
      nextEnergyScore += 1500;
      gainMeadowEnergy();
    }
    updateHud();
    tone(robot.heavy ? 78 : 105, robot.heavy ? 0.28 : 0.16, "square", 0.035, 45);
  }

  function circleRect(cx, cy, radius, x, y, w, h) {
    const closestX = Math.max(x, Math.min(cx, x + w));
    const closestY = Math.max(y, Math.min(cy, y + h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function update(dt) {
    if (state !== "playing") return;
    elapsed += dt;
    wave = 1 + Math.floor(elapsed / 19);
    if (wave !== previousWave) {
      previousWave = wave;
      bannerText = `WAVE ${wave}`;
      bannerTimer = 2.0;
      tone(330, 0.2, "square", 0.03, 660);
    }

    const left = keys.ArrowLeft || keys.KeyA || keys.touchLeft;
    const right = keys.ArrowRight || keys.KeyD || keys.touchRight;
    const move = (right ? 1 : 0) - (left ? 1 : 0);
    const acceleration = player.onGround ? 1500 : 800;
    player.vx += move * acceleration * dt;
    player.vx *= Math.pow(player.onGround ? 0.0009 : 0.045, dt);
    player.vx = Math.max(-310, Math.min(310, player.vx));
    if (move) player.facing = move;

    if ((keys.jumpQueued || keys.touchJump) && player.onGround) {
      player.vy = -505;
      player.onGround = false;
      keys.jumpQueued = false;
      keys.touchJump = false;
      tone(230, 0.08, "square", 0.018, 390);
    }

    player.vy += 1370 * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    if (player.y >= GROUND) {
      player.y = GROUND;
      player.vy = 0;
      player.onGround = true;
    }
    player.x = Math.max(40, Math.min(W - 40, player.x));
    player.step += Math.abs(player.vx) * dt * 0.045;
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.throwCooldown = Math.max(0, player.throwCooldown - dt);
    player.throwPose = Math.max(0, player.throwPose - dt);
    bannerTimer = Math.max(0, bannerTimer - dt);
    flash = Math.max(0, flash - dt);
    shake *= Math.pow(0.025, dt);

    spawnTimer -= dt;
    if (spawnTimer <= 0 && clearedWave !== wave) {
      spawnRobot();
      if (wave >= 4 && Math.random() < Math.min(0.55, (wave - 3) * 0.09)) spawnRobot();
      spawnTimer = Math.max(0.46, 1.72 - wave * 0.105) * (0.82 + Math.random() * 0.38);
    }

    for (const shuriken of shurikens) {
      shuriken.trail.push({ x:shuriken.x, y:shuriken.y, life:.13 });
      if (shuriken.trail.length > 5) shuriken.trail.shift();
      for (const point of shuriken.trail) point.life -= dt;
      shuriken.x += shuriken.vx * dt;
      shuriken.y += shuriken.vy * dt;
      shuriken.rotation += dt * 24;
      shuriken.life -= dt;
      if (!shuriken.sky) for (const robot of robots) {
        if (robot.dead || shuriken.life <= 0) continue;
        if (circleRect(shuriken.x, shuriken.y, 13, robot.x-robot.w*.5, robot.y-robot.h, robot.w, robot.h)) hitWithPower(shuriken, robot);
      }
      if (shuriken.kind === "nuclear" && !shuriken.detonated && (shuriken.life <= 0 || shuriken.x < 0 || shuriken.x > W || shuriken.y < 0 || shuriken.y > H)) detonateNuclear(shuriken);
    }
    shurikens = shurikens.filter(s => s.life > 0 && s.x > -80 && s.x < W + 80 && s.y > -80 && s.y < H + 80);

    for (const robot of robots) {
      if (robot.dead) continue;
      robot.hit = Math.max(0, robot.hit - dt);
      robot.shootPose = Math.max(0, robot.shootPose - dt);
      if (robot.burn > 0) {
        robot.burn = Math.max(0, robot.burn - dt);
        if (robot.burn === 0) { killRobot(robot); continue; }
      }
      const blinded = robot.fog > 0;
      robot.fog = Math.max(0, robot.fog - dt);
      const distance = player.x - robot.x;
      if (!blinded) {
        const desiredRange = robot.heavy ? 290 : 235;
        if (Math.abs(distance) > desiredRange) robot.x += Math.sign(distance) * robot.speed * dt;
        else robot.x -= Math.sign(distance) * Math.sin(elapsed * 2 + robot.phase) * 8 * dt;
        robot.shootTimer -= dt;
        if (robot.shootTimer <= 0 && Math.abs(distance) < 570) {
          robotShoot(robot);
          const baseRate = robot.heavy ? 1.45 : 1.95;
          robot.shootTimer = Math.max(0.55, baseRate - wave * 0.065) * (0.72 + Math.random() * 0.7);
        }
      }
      if (Math.abs(distance) < (player.w + robot.w) * 0.42 && Math.abs((player.y-player.h*.5) - (robot.y-robot.h*.5)) < 60) {
        hurtPlayer(robot.heavy ? 22 : 15, robot.x);
        robot.x -= Math.sign(distance) * 28;
      }
    }
    robots = robots.filter(robot => !robot.dead && robot.x > -130 && robot.x < W + 130);

    for (const laser of lasers) {
      laser.px = laser.x;
      laser.py = laser.y;
      laser.x += laser.vx * dt;
      laser.y += laser.vy * dt;
      laser.life -= dt;
      if (circleRect(laser.x, laser.y, laser.width + 3, player.x-player.w*.42, player.y-player.h, player.w*.84, player.h)) {
        laser.life = 0;
        hurtPlayer(12 + Math.min(8, Math.floor(wave / 3)), laser.x);
      }
    }
    lasers = lasers.filter(laser => laser.life > 0 && laser.x > -100 && laser.x < W + 100 && laser.y > -100 && laser.y < H + 100);

    for (const blast of blasts) blast.life -= dt;
    blasts = blasts.filter(b=>b.life>0);
    for (const fallout of fallouts) { fallout.life -= dt; fallout.grace = Math.max(0,fallout.grace-dt); }
    fallouts = fallouts.filter(f=>f.life>0);
    radiationTick = Math.max(0,radiationTick-dt);
    if (fallouts.some(f=>f.grace===0 && (f.side>0 ? player.x+player.w*.35>f.x : player.x-player.w*.35<f.x))) {
      // Radiation drains quickly even during ordinary hit invulnerability.
      player.health = Math.max(0,player.health-85*dt);
      flash = Math.max(flash,.045);
      if (radiationTick===0) {
        radiationTick = .3;
        floaters.push({x:player.x,y:player.y-player.h,text:"FALLOUT! GET BACK!",life:.45,color:"#baff58"});
        tone(75,.12,"sawtooth",.025,45);
      }
      if (player.health<=0) { updateHud(); endGame(); return; }
    }

    for (const particle of particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 420 * dt;
      particle.vx *= Math.pow(0.12, dt);
      particle.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);
    for (const floater of floaters) {
      floater.y -= 38 * dt;
      floater.life -= dt;
    }
    floaters = floaters.filter(f => f.life > 0);
    updateHud();
  }

  function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  function drawMeadow(time) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "#42d7f0");
    sky.addColorStop(0.58, "#8becf0");
    sky.addColorStop(1, "#d8f4c0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fffbd6bb";
    ctx.beginPath(); ctx.arc(790, 82, 43, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#fff7a788";
    ctx.beginPath(); ctx.arc(790, 82, 62, 0, Math.PI*2); ctx.fill();

    for (let i = 0; i < 5; i++) {
      const x = ((i * 230 - time * (3 + i % 2)) % 1200) - 100;
      const y = 70 + (i % 3) * 44;
      ctx.fillStyle = "#ffffffb8";
      ctx.beginPath();
      ctx.arc(x, y, 25, Math.PI, 0); ctx.arc(x+30, y-12, 34, Math.PI, 0); ctx.arc(x+68, y, 26, Math.PI, 0);
      ctx.lineTo(x+68,y+18); ctx.lineTo(x,y+18); ctx.closePath(); ctx.fill();
    }

    ctx.fillStyle = "#75c960";
    ctx.beginPath(); ctx.moveTo(0, 335);
    for (let x = 0; x <= W; x += 80) ctx.quadraticCurveTo(x+40, 270 + Math.sin(x*.014)*24, x+80, 326);
    ctx.lineTo(W, GROUND); ctx.lineTo(0, GROUND); ctx.fill();
    ctx.fillStyle = "#3da84c";
    ctx.beginPath(); ctx.moveTo(0, 376);
    for (let x = 0; x <= W; x += 64) ctx.quadraticCurveTo(x+32, 320 + Math.sin(x*.021+1)*18, x+64, 370);
    ctx.lineTo(W, GROUND); ctx.lineTo(0, GROUND); ctx.fill();

    for (let i = 0; i < 8; i++) drawTree(70 + i * 132, 354 + (i%2)*18, 0.7 + (i%3)*.08);

    const grass = ctx.createLinearGradient(0, GROUND-30, 0, H);
    grass.addColorStop(0, "#69cd35"); grass.addColorStop(.35, "#3b9f27"); grass.addColorStop(1, "#17651f");
    ctx.fillStyle = grass; ctx.fillRect(0, GROUND-30, W, H-GROUND+30);
    ctx.fillStyle = "#9ae848"; ctx.fillRect(0, GROUND-30, W, 9);
    ctx.fillStyle = "#225e1f"; ctx.fillRect(0, GROUND+5, W, 6);

    for (let i = 0; i < 70; i++) {
      const x = (i * 83 + 17) % W;
      const y = GROUND + 12 + ((i * 47) % 85);
      const sway = Math.sin(time * 2 + i) * 3;
      ctx.strokeStyle = i%3 ? "#2b8125" : "#75ce38";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x,y+10); ctx.lineTo(x+sway,y); ctx.stroke();
      if (i % 11 === 0) {
        ctx.fillStyle = i%22 ? "#fff06a" : "#ff7295";
        ctx.beginPath(); ctx.arc(x+sway,y,3,0,Math.PI*2); ctx.fill();
      }
    }
  }

  function drawTree(x, y, scale) {
    ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
    ctx.fillStyle="#73502d"; ctx.fillRect(-8,-58,16,65);
    ctx.fillStyle="#9b6a36"; ctx.fillRect(-8,-58,5,65);
    ctx.fillStyle="#2a832c";
    for (const [ox,oy,r] of [[-25,-62,30],[8,-76,36],[35,-59,26],[-4,-99,28]]) { ctx.beginPath();ctx.arc(ox,oy,r,0,Math.PI*2);ctx.fill(); }
    ctx.fillStyle="#65bb35";
    for (const [ox,oy,r] of [[-31,-72,16],[0,-94,19],[30,-67,14]]) { ctx.beginPath();ctx.arc(ox,oy,r,0,Math.PI*2);ctx.fill(); }
    ctx.restore();
  }

  function drawNinja() {
    const bob = player.onGround && Math.abs(player.vx) > 20 ? Math.abs(Math.sin(player.step)) * 3 : 0;
    const blink = player.invulnerable > 0 && Math.floor(player.invulnerable * 18) % 2 === 0;
    if (blink) ctx.globalAlpha = .42;
    ctx.save(); ctx.translate(player.x, player.y - bob);
    ctx.fillStyle="#123b48aa"; ctx.beginPath(); ctx.ellipse(0,3,33,9,0,0,Math.PI*2); ctx.fill();

    const legSwing = player.onGround ? Math.sin(player.step) * Math.min(8,Math.abs(player.vx)*.025) : 5;
    ctx.fillStyle="#091d35";
    roundedRect(-21+legSwing,-39,18,40,5);ctx.fill(); roundedRect(3-legSwing,-39,18,40,5);ctx.fill();
    ctx.fillStyle="#142d45"; roundedRect(-28+legSwing,-8,29,11,4);ctx.fill(); roundedRect(-1-legSwing,-8,29,11,4);ctx.fill();
    ctx.fillStyle="#47708b"; ctx.fillRect(-25+legSwing,-7,14,4);ctx.fillRect(11-legSwing,-7,14,4);

    ctx.fillStyle="#0c2947"; roundedRect(-28,-92,56,58,9);ctx.fill();
    ctx.fillStyle="#173f65"; ctx.beginPath();ctx.moveTo(-28,-83);ctx.lineTo(-18,-91);ctx.lineTo(-18,-40);ctx.lineTo(-28,-35);ctx.closePath();ctx.fill();
    ctx.fillStyle="#071a31"; ctx.beginPath();ctx.moveTo(28,-84);ctx.lineTo(17,-91);ctx.lineTo(17,-39);ctx.lineTo(28,-34);ctx.closePath();ctx.fill();
    ctx.fillStyle="#e63e42";ctx.fillRect(-28,-51,56,8);ctx.fillStyle="#ff5a4f";ctx.fillRect(-22,-51,20,3);
    ctx.fillStyle="#ba2735";ctx.beginPath();ctx.moveTo(21,-45);ctx.lineTo(42,-36);ctx.lineTo(25,-32);ctx.closePath();ctx.fill();

    const throwLift = player.throwPose > 0 ? 17 : 0;
    ctx.fillStyle="#0a233d";
    roundedRect(-40,-84,17,45,6);ctx.fill(); roundedRect(23,-84-throwLift,17,45,6);ctx.fill();
    ctx.fillStyle="#e33e43";ctx.fillRect(-39,-54,16,6);ctx.fillRect(24,-54-throwLift,16,6);
    ctx.fillStyle="#f1b94f";roundedRect(-39,-42,15,13,4);ctx.fill(); roundedRect(25,-42-throwLift,15,13,4);ctx.fill();

    ctx.fillStyle="#102f50";roundedRect(-31,-139,62,55,12);ctx.fill();
    ctx.fillStyle="#1b486d";ctx.beginPath();ctx.moveTo(-31,-128);ctx.lineTo(-18,-139);ctx.lineTo(10,-139);ctx.lineTo(-6,-129);ctx.lineTo(-6,-87);ctx.lineTo(-31,-92);ctx.closePath();ctx.fill();
    ctx.fillStyle="#071b33";ctx.beginPath();ctx.moveTo(31,-127);ctx.lineTo(18,-139);ctx.lineTo(5,-139);ctx.lineTo(11,-128);ctx.lineTo(11,-86);ctx.lineTo(31,-92);ctx.closePath();ctx.fill();
    ctx.fillStyle="#d8323b";ctx.fillRect(-31,-117,62,7);ctx.fillStyle="#ff5750";ctx.fillRect(-21,-117,20,3);
    ctx.fillStyle="#f2bd55";roundedRect(-21,-108,42,20,4);ctx.fill();
    ctx.fillStyle="#111c27";ctx.fillRect(-15,-103,10,5);ctx.fillRect(5,-103,10,5);
    ctx.fillStyle="#fff3b1";ctx.fillRect(-12,-102,5,2);ctx.fillRect(7,-102,5,2);
    ctx.restore();
    ctx.globalAlpha=1;
  }

  function drawRobot(robot) {
    const walk = Math.sin(elapsed*5+robot.phase)*4;
    ctx.save(); ctx.translate(robot.x,robot.y); ctx.scale(robot.scale,robot.scale);
    if (robot.hit > 0) ctx.filter="brightness(2.2)";
    ctx.fillStyle="#16363e99";ctx.beginPath();ctx.ellipse(0,3,34,9,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#29323c";roundedRect(-26+walk,-36,20,38,4);ctx.fill();roundedRect(6-walk,-36,20,38,4);ctx.fill();
    ctx.fillStyle="#111820";roundedRect(-31+walk,-8,28,10,3);ctx.fill();roundedRect(3-walk,-8,28,10,3);ctx.fill();
    ctx.fillStyle="#73818b";ctx.fillRect(-27+walk,-7,12,3);ctx.fillRect(15-walk,-7,12,3);

    ctx.fillStyle=robot.heavy?"#78313b":"#384a55";roundedRect(-31,-91,62,58,7);ctx.fill();
    ctx.fillStyle=robot.heavy?"#b94a48":"#617580";ctx.beginPath();ctx.moveTo(-31,-84);ctx.lineTo(-20,-91);ctx.lineTo(-20,-39);ctx.lineTo(-31,-34);ctx.closePath();ctx.fill();
    ctx.fillStyle="#1a252d";ctx.beginPath();ctx.moveTo(31,-84);ctx.lineTo(20,-91);ctx.lineTo(20,-39);ctx.lineTo(31,-34);ctx.closePath();ctx.fill();
    ctx.fillStyle="#182731";roundedRect(-21,-76,42,25,4);ctx.fill();
    ctx.fillStyle=robot.heavy?"#ffb33b":"#27eaff";ctx.fillRect(-15,-70,30,8);
    ctx.fillStyle="#e7fbff";ctx.fillRect(-9,-69,8,3);
    ctx.fillStyle="#d94a47";ctx.fillRect(-31,-46,62,7);

    ctx.fillStyle="#2a3640";roundedRect(-48,-85,18,43,5);ctx.fill();roundedRect(30,-85,18,43,5);ctx.fill();
    ctx.fillStyle="#87949b";ctx.fillRect(-45,-81,5,30);ctx.fillRect(33,-81,5,30);
    const gunSide=player.x<robot.x?-1:1;
    ctx.save();ctx.translate(gunSide*38,-62);ctx.scale(gunSide,1);
    ctx.fillStyle="#070d12";roundedRect(0,-10,47,22,3);ctx.fill();
    ctx.fillStyle="#48555d";ctx.fillRect(7,-7,27,5);
    ctx.fillStyle="#19dcf5";ctx.fillRect(10,2,24,4);
    ctx.fillStyle="#7dfff8";ctx.fillRect(40,-4,8,9);
    ctx.restore();

    ctx.fillStyle=robot.heavy?"#682a36":"#43545e";roundedRect(-34,-133,68,44,9);ctx.fill();
    ctx.fillStyle=robot.heavy?"#a54848":"#73858e";ctx.beginPath();ctx.moveTo(-34,-123);ctx.lineTo(-22,-133);ctx.lineTo(7,-133);ctx.lineTo(-6,-124);ctx.lineTo(-6,-92);ctx.lineTo(-34,-97);ctx.closePath();ctx.fill();
    ctx.fillStyle="#17232a";roundedRect(-27,-119,54,21,4);ctx.fill();
    ctx.fillStyle="#24e9ff";ctx.fillRect(-19,-112,13,7);ctx.fillRect(6,-112,13,7);
    ctx.fillStyle="#c9ffff";ctx.fillRect(-16,-111,5,2);ctx.fillRect(9,-111,5,2);
    if(robot.maxHp>1){ctx.fillStyle="#101a20";ctx.fillRect(-24,-144,48,5);ctx.fillStyle="#ffdc42";ctx.fillRect(-24,-144,48*(robot.hp/robot.maxHp),5);}
    ctx.restore();
  }

  function drawShuriken(x,y,rotation,alpha=1,scale=1,kind="normal") {
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);ctx.globalAlpha*=alpha;
    const color = powers.find(p=>p.id===kind).color;
    ctx.fillStyle=kind==="normal"?"#0d161c":color;ctx.strokeStyle=kind==="normal"?color:"#172536";ctx.lineWidth=2;
    ctx.beginPath();
    for(let i=0;i<8;i++){
      const angle=-Math.PI/2+i*Math.PI/4;
      const radius=i%2===0?17:6;
      const px=Math.cos(angle)*radius,py=Math.sin(angle)*radius;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=kind==="normal"?color:"#fff3c6";ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function drawFallout() {
    ctx.save();
    for (const f of fallouts) {
      const left=f.side>0?f.x:0, width=f.side>0?W-f.x:f.x;
      ctx.fillStyle="#7cff2826";ctx.fillRect(left,0,width,H);
      ctx.fillStyle="#8fff3c66";ctx.fillRect(left,GROUND-20,width,H-GROUND+20);
      ctx.strokeStyle="#b5ff43";ctx.lineWidth=5;ctx.shadowColor="#a7ff38";ctx.shadowBlur=13;
      ctx.setLineDash([12,7]);ctx.beginPath();ctx.moveTo(f.x,0);ctx.lineTo(f.x,H);ctx.stroke();ctx.setLineDash([]);ctx.shadowBlur=0;
      ctx.fillStyle="#11251be6";ctx.fillRect(Math.max(4,Math.min(W-202,f.x+(f.side>0?10:-200))),H-64,198,48);
      ctx.fillStyle="#baff58";ctx.font="900 16px Arial";ctx.textAlign="center";
      const labelX=Math.max(103,Math.min(W-103,f.x+(f.side>0?109:-101)));
      ctx.fillText("FALLOUT · KEEP OUT",labelX,H-43);
      ctx.font="700 12px Arial";ctx.fillText(`${Math.ceil(f.life)}s · rapid health drain`,labelX,H-26);
    }
    ctx.restore();
  }

  function render() {
    ctx.save();
    const sx = state === "playing" ? (Math.random()-.5)*shake : 0;
    const sy = state === "playing" ? (Math.random()-.5)*shake : 0;
    ctx.translate(sx,sy);
    drawMeadow(elapsed);
    drawFallout();

    for (const shuriken of shurikens) {
      for (let i=0;i<shuriken.trail.length;i++) { const p=shuriken.trail[i]; drawShuriken(p.x,p.y,shuriken.rotation-i*.7,Math.max(0,p.life/.13)*.22,.5,shuriken.kind); }
    }
    for (const robot of robots) {
      drawRobot(robot);
      if (robot.burn>0) {
        for (let i=0;i<7;i++) {
          ctx.fillStyle=i%2?"#ffe75c":"#ff702e";
          ctx.beginPath();ctx.ellipse(robot.x-robot.w*.45+i*robot.w*.15,robot.y-20-Math.sin(elapsed*15+i)*10,7,20+i%3*5,0,0,Math.PI*2);ctx.fill();
        }
      }
      if (robot.fog>0) {
        ctx.fillStyle="#d7f5ffee";
        for (let i=0;i<4;i++) {ctx.beginPath();ctx.arc(robot.x-30+i*20,robot.y-robot.h-15+Math.sin(elapsed*3+i)*6,22,0,Math.PI*2);ctx.fill();}
        ctx.fillStyle="#395c73";ctx.font="900 22px Arial";ctx.textAlign="center";ctx.fillText("??",robot.x,robot.y-robot.h-8);
      }
    }
    drawNinja();
    for (const shuriken of shurikens) drawShuriken(shuriken.x,shuriken.y,shuriken.rotation,1,1,shuriken.kind);

    for (const blast of blasts) {
      const progress=1-blast.life/blast.max;
      ctx.save();ctx.globalAlpha=1-progress;
      if (blast.kind==="nuclear") {
        const radius=60+progress*W;
        const glow=ctx.createRadialGradient(blast.x,blast.y,0,blast.x,blast.y,radius);
        glow.addColorStop(0,"#fffadf");glow.addColorStop(.3,"#d4ff7b");glow.addColorStop(1,"#80f13200");
        ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
        ctx.strokeStyle="#efffb8";ctx.lineWidth=12;ctx.beginPath();ctx.arc(blast.x,blast.y,radius*.65,0,Math.PI*2);ctx.stroke();
      } else {ctx.fillStyle="#c47cff";ctx.fillRect(0,blast.y-25,W,50);}
      ctx.restore();
    }

    ctx.save();ctx.lineCap="round";
    for (const laser of lasers) {
      const tailX=laser.x-laser.vx*.09,tailY=laser.y-laser.vy*.09;
      ctx.shadowColor="#08cfff";ctx.shadowBlur=18;ctx.strokeStyle="#159cff";ctx.lineWidth=laser.width+8;ctx.globalAlpha=.4;
      ctx.beginPath();ctx.moveTo(tailX,tailY);ctx.lineTo(laser.x,laser.y);ctx.stroke();
      ctx.globalAlpha=1;ctx.shadowBlur=8;ctx.strokeStyle="#ecffff";ctx.lineWidth=laser.width;
      ctx.beginPath();ctx.moveTo(tailX,tailY);ctx.lineTo(laser.x,laser.y);ctx.stroke();
    }
    ctx.restore();

    for (const particle of particles) {
      ctx.globalAlpha=Math.max(0,particle.life/(particle.max||particle.life));ctx.fillStyle=particle.color;
      ctx.fillRect(particle.x-particle.size/2,particle.y-particle.size/2,particle.size,particle.size);
    }
    ctx.globalAlpha=1;
    ctx.textAlign="center";ctx.font="900 17px Arial";ctx.lineWidth=4;ctx.strokeStyle="#0a1b24";
    for (const floater of floaters) {ctx.globalAlpha=Math.min(1,floater.life*2);ctx.strokeText(floater.text,floater.x,floater.y);ctx.fillStyle=floater.color;ctx.fillText(floater.text,floater.x,floater.y);}
    ctx.globalAlpha=1;

    if (bannerTimer > 0) {
      const alpha=Math.min(1,bannerTimer*2, (2-bannerTimer)*2);
      ctx.globalAlpha=Math.max(0,alpha);ctx.textAlign="center";ctx.font="italic 900 64px Impact";ctx.lineWidth=9;ctx.strokeStyle="#0a2638";ctx.strokeText(bannerText,W/2,118);ctx.fillStyle="#fff064";ctx.fillText(bannerText,W/2,118);ctx.globalAlpha=1;
    }
    if (flash > 0) {ctx.fillStyle=`rgba(255,50,70,${flash*1.7})`;ctx.fillRect(-20,-20,W+40,H+40);}
    ctx.restore();
  }

  function loop(now) {
    const dt=Math.min(.034,(now-lastTime)/1000||0);
    lastTime=now;
    if(state==="playing") update(dt);
    else if(state==="title") elapsed+=dt*.2;
    render();
    requestAnimationFrame(loop);
  }

  function canvasPoint(event) {
    const rect=canvas.getBoundingClientRect();
    return {x:(event.clientX-rect.left)*W/rect.width,y:(event.clientY-rect.top)*H/rect.height};
  }

  window.addEventListener("keydown",event=>{
    keys[event.code]=true;
    if(["ArrowLeft","ArrowRight","ArrowUp","Space"].includes(event.code)) event.preventDefault();
    if((event.code==="ArrowUp"||event.code==="KeyW")&&!event.repeat) keys.jumpQueued=true;
    if(event.code==="Space"&&!event.repeat) throwShuriken(false);
    if(event.code==="KeyF"&&!event.repeat) {event.preventDefault();switchPower();}
    if((event.code==="KeyP"||event.code==="Escape")&&!event.repeat) togglePause();
    if(event.code==="Enter"&&(state==="title"||state==="gameover")) startGame();
  });
  window.addEventListener("keyup",event=>{keys[event.code]=false;});
  canvas.addEventListener("pointermove",event=>{Object.assign(pointer,canvasPoint(event),{active:true});});
  canvas.addEventListener("pointerdown",event=>{event.preventDefault();unlockAudio();Object.assign(pointer,canvasPoint(event),{active:true});throwShuriken(true);});
  canvas.addEventListener("contextmenu",event=>event.preventDefault());
  document.querySelector("#startButton").addEventListener("click",startGame);
  document.querySelector("#restartButton").addEventListener("click",startGame);
  pauseButton.addEventListener("click",togglePause);
  powerButton.addEventListener("click",switchPower);

  for(const button of document.querySelectorAll("[data-action]")){
    const action=button.dataset.action;
    const down=event=>{
      event.preventDefault();unlockAudio();
      if(action==="left")keys.touchLeft=true;
      if(action==="right")keys.touchRight=true;
      if(action==="jump"){keys.touchJump=true;keys.jumpQueued=true;}
      if(action==="throw")throwShuriken(false);
    };
    const up=event=>{event.preventDefault();if(action==="left")keys.touchLeft=false;if(action==="right")keys.touchRight=false;if(action==="jump")keys.touchJump=false;};
    button.addEventListener("pointerdown",down);
    button.addEventListener("pointerup",up);
    button.addEventListener("pointercancel",up);
    button.addEventListener("pointerleave",up);
  }

  document.addEventListener("visibilitychange",()=>{if(document.hidden&&state==="playing")togglePause();});
  window.startSuperShuriken=startGame;
  window.ZapmanArcadeAudio?.register(()=>({active:state==='playing',paused:state==='paused',lost:state==='gameover',health:player.health,reward:score,level:wave,shots:shurikens.length}));
  window.ZapmanEducation?.register({ lost: () => state === "gameover", restore: startGame, release: () => Object.keys(keys).forEach(key => { keys[key] = false; }) });
  window.__superShurikenDebug=()=>({state,score,wave,elapsed,health:player.health,power:powers[selectedPower].id,powersUnlocked,fallouts:fallouts.length,robots:robots.length,shurikens:shurikens.length,lasers:lasers.length,player:{x:player.x,y:player.y}});
  updateHud();
  requestAnimationFrame(loop);
})();
