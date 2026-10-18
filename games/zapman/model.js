/* The adventure's rules are independent of drawing and browser controls. */
(() => {
  "use strict";
  const palettes = ["#51d8ff", "#ff685e", "#bb85ff", "#5aea97", "#ffca5c", "#f27cc6"];
  const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const bounds = (actor) => ({ x: actor.x - actor.w / 2, y: actor.y - actor.h, w: actor.w, h: actor.h });
  const playingStages = ["city", "wardrobe", "field", "mind", "contestants", "arena", "thoughtExit", "volcano", "colosseum", "romanExit", "sea", "powerless", "repairedHome", "rainforest", "shadow"];
  function create({ random = Math.random, storage = null } = {}) {
    const keys = new Set();
    const state = { stage: "watch", level: 1, time: 0, elapsed: 0, paused: false, health: 5, tiny: false, hurt: 0, portalColor: palettes[0], portalIndex: -1, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [], width: 4400, height: 900, finishX: 4160, player: { x: 170, y: 424, w: 28, h: 46, dir: 1, moving: false }, obstacles: [] };
    function choosePortal() {
      let previous = state.portalIndex;
      try { const saved = storage?.getItem("zapman-last-portal"); if (saved !== null && saved !== undefined && /^[0-5]$/.test(saved)) previous = Number(saved); } catch { /* Still changes within this session. */ }
      const choices = palettes.map((_, i) => i).filter(i => i !== previous);
      state.portalIndex = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
      state.portalColor = palettes[state.portalIndex];
      try { storage?.setItem("zapman-last-portal", String(state.portalIndex)); } catch { /* Storage is optional. */ }
    }
    function stage(value) {
      state.stage = value; state.elapsed = 0; keys.clear();
      if (!playingStages.includes(value)) { state.notice = ""; state.noticeTime = 0; }
      if (value === "won" || value === "lost") state.player.moving = false;
      if ((value === "won" || value === "lost") && state.level === 8) { state.inkShots = []; state.inkBlind = 0; }
    }
    function clearNewHazards() {
      Object.assign(state, { shadows: [], beacons: [], shadowTime: 0 });
      Object.assign(state, { eagles: [], rainforestTime: 0 });
      Object.assign(state, { betterworlders: [], powerlessTime: 0, jamDiscovered: false, jamSpeechTime: 0, barrierBump: 0, powerlessVialCollected: false, watchRepaired: false });
      Object.assign(state, { scorpions: [], townTime: 0, antidote: null, antidoteCollected: false, playerPeopleRobot: false });
      Object.assign(state, { soldiers: [], romanTime: 0, romanWon: false, romanVial: false });
      Object.assign(state, { octopuses: [], seaClock: 0, inkShots: [], inkBlind: 0 });
      Object.assign(state, { lizards: [], people: [], machine: null, effect: null, mindGuard: 0, vial: null, thoughtVialCollected: false, guardians: [], zaps: [], zapCooldown: 0, happy: 0, happyDrain: 0, converted: false, computer: null, battleCheckpoint: false, portalOpen: false, secondVialCollected: false, vialDelivered: false, vents: [], volcanoTime: 0 });
    }
    function restart() {
      clearNewHazards();
      Object.assign(state, { level: 1, time: 0, elapsed: 0, paused: false, health: 5, tiny: false, hurt: 0, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [], obstacles: [] });
      Object.assign(state.player, { x: 170, y: 424, w: 28, h: 46, dir: 1, moving: false });
      stage("watch");
    }
    function buildCity() {
      clearNewHazards();
      state.level = 1; state.width = 4400; state.finishX = 4160; state.shadows = []; state.beacons = [];
      state.health = 5; state.tiny = false; state.hurt = 0; state.paused = false; state.notice = ""; state.noticeTime = 0; state.lasers = [];
      Object.assign(state.player, { x: 140, y: 515, w: 28, h: 46, dir: 1, moving: false });
      state.obstacles = [
        { x: 1100, y: 355, w: 120, h: 90 }, { x: 1710, y: 560, w: 130, h: 80 },
        { x: 2290, y: 320, w: 140, h: 100 }, { x: 2810, y: 560, w: 150, h: 90 }, { x: 3420, y: 340, w: 120, h: 100 }
      ];
      state.robots = [[900, 465], [1400, 600], [1920, 415], [2480, 595], [3060, 430], [3550, 585], [3900, 425]].map(([x, y], i) => ({ x, y, homeX: x, homeY: y, w: 38, h: 48, dir: i % 2 ? -1 : 1, cooldown: 1.3 + i * .13, alert: false, aimX: 0, aimY: 0 }));
    }
    function buildWardrobeDimension() {
      clearNewHazards();
      Object.assign(state, { level: 2, width: 3800, finishX: 3580, health: 5, tiny: false, hurt: 2, paused: false, notice: "", noticeTime: 0, lasers: [], shadows: [], beacons: [] });
      Object.assign(state.player, { x: 160, y: 535, w: 28, h: 46, dir: 1, moving: false });
      choosePortal();
      state.obstacles = [{ x: 1080, y: 350, w: 100, h: 90 }, { x: 1770, y: 580, w: 95, h: 90 }, { x: 2450, y: 350, w: 90, h: 90 }, { x: 3020, y: 590, w: 90, h: 75 }];
      state.robots = [[650, 415], [1260, 640], [1930, 410], [2600, 635], [3130, 420]].map(([x, y], i) => ({ x, y, homeX: x, homeY: y, w: 38, h: 48, dir: -1, alert: false, cooldown: 1.1 + i * .3 }));
      state.people = Array.from({ length: 30 }, (_, i) => ({ x: 360 + Math.floor(i / 3) * 315 + i % 3 * 48, y: [420, 540, 670][i % 3], w: 22, h: 37, alive: true, dir: 1, phase: i * 1.7, color: ["#d28f75", "#72a8b3", "#d1b369", "#8e8fbd"][i % 4], peopleRobot: false, changeTime: 0 }));
      state.people.forEach(person => { if (!validPosition(person)) person.y = 520; });
      state.antidote = { x: state.finishX, y: 535 };
    }
    function updateWardrobeTown(dt) {
      const p = state.player;
      state.townTime += dt;
      for (const person of state.people) {
        person.changeTime = Math.max(0, person.changeTime - dt);
        const dx = p.x - person.x, dy = p.y - person.y, distance = Math.hypot(dx, dy) || 1;
        if (person.peopleRobot) {
          const notices = distance < (state.tiny ? 95 : 650);
          if (notices) { person.dir = dx >= 0 ? 1 : -1; moveHunter(person, dx / distance * 82 * dt, dy / distance * 82 * dt); }
          if (overlaps(bounds(p), bounds(person))) damage();
        } else {
          const threat = state.scorpions.find(scorpion => Math.hypot(person.x - scorpion.x, person.y - scorpion.y) < 125);
          const angle = state.townTime * .45 + person.phase, tx = threat ? person.x - threat.x : Math.cos(angle), ty = threat ? person.y - threat.y : Math.sin(angle), length = Math.hypot(tx, ty) || 1;
          person.fleeing = Boolean(threat); person.dir = tx >= 0 ? 1 : -1;
          moveHunter(person, tx / length * (threat ? 48 : 15) * dt, ty / length * (threat ? 48 : 15) * dt);
        }
        if (state.stage === "lost") return;
      }
      for (const bot of state.robots) {
        bot.x = bot.homeX + Math.sin(state.townTime * .7 + bot.homeX) * 36;
        const target = state.people.filter(person => !person.peopleRobot && Math.hypot(person.x - bot.x, person.y - bot.y) < 650).sort((a, b) => Math.hypot(a.x - bot.x, a.y - bot.y) - Math.hypot(b.x - bot.x, b.y - bot.y))[0];
        bot.alert = Boolean(target); bot.cooldown -= dt;
        if (target && bot.cooldown <= 0 && state.scorpions.length < 24) {
          const dx = target.x - bot.x, dy = target.y - 12 - (bot.y - 20), length = Math.hypot(dx, dy) || 1;
          bot.dir = dx >= 0 ? 1 : -1; bot.cooldown = 3.8;
          state.scorpions.push({ x: bot.x, y: bot.y - 20, w: 24, h: 14, vx: dx / length * 280, vy: dy / length * 280, flight: .4, life: 14, dir: bot.dir });
        }
        if (overlaps(bounds(p), bounds(bot))) damage();
        if (state.stage === "lost") return;
      }
      for (const scorpion of state.scorpions) {
        const healthy = state.people.filter(person => !person.peopleRobot);
        const target = healthy.sort((a, b) => Math.hypot(a.x - scorpion.x, a.y - scorpion.y) - Math.hypot(b.x - scorpion.x, b.y - scorpion.y))[0] || p;
        const dx = target.x - scorpion.x, dy = target.y - 8 - scorpion.y, distance = Math.hypot(dx, dy) || 1;
        const steps = Math.max(1, Math.ceil((scorpion.flight > 0 ? 280 : 108) * dt / 4));
        for (let i = 0; i < steps && scorpion.life > 0; i++) {
          const sx = scorpion.flight > 0 ? scorpion.vx : dx / distance * 108, sy = scorpion.flight > 0 ? scorpion.vy : dy / distance * 108;
          scorpion.dir = sx >= 0 ? 1 : -1;
          moveHunter(scorpion, sx * dt / steps, sy * dt / steps);
          if (overlaps(bounds(p), bounds(scorpion))) {
            state.playerPeopleRobot = true; state.health = 0; state.scorpions = [];
            stage("lost"); return;
          }
          const caught = state.people.find(person => !person.peopleRobot && overlaps(bounds(person), bounds(scorpion)));
          if (caught) { caught.peopleRobot = true; caught.fleeing = false; caught.changeTime = 1.8; scorpion.life = 0; say("A scorpion changed someone into a people-robot! Find the antidote at the end of town!"); }
        }
        scorpion.flight = Math.max(0, scorpion.flight - dt); scorpion.life -= dt;
        if (state.stage === "lost") return;
      }
      state.scorpions = state.scorpions.filter(scorpion => scorpion.life > 0);
      if (Math.hypot(p.x - state.antidote.x, p.y - state.antidote.y) < 42) {
        state.antidoteCollected = true; state.scorpions = []; state.people.forEach(person => { person.peopleRobot = false; person.changeTime = 0; });
        stage("wardrobeCured");
      }
    }
    function buildField() {
      clearNewHazards();
      Object.assign(state, { level: 3, width: 3600, finishX: 3310, health: 5, tiny: false, hurt: 2, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [] });
      Object.assign(state.player, { x: 140, y: 515, w: 28, h: 46, dir: 1, moving: false });
      state.obstacles = [{ x: 650, y: 305, w: 45, h: 265 }, { x: 1210, y: 475, w: 45, h: 250 }, { x: 1780, y: 305, w: 45, h: 265 }, { x: 2350, y: 475, w: 45, h: 250 }, { x: 2820, y: 350, w: 50, h: 220 }];
      state.lizards = [[900, 625], [1460, 395], [1660, 675], [2040, 645], [2610, 395], [3050, 615]].map(([x, y], i) => ({ x, y, w: 58, h: 28, homeX: x, homeY: y, speed: 74 + i % 3 * 6, dir: -1, bite: 0, eating: 0, hunting: false }));
      state.people = [[970, 655], [1520, 430], [2130, 655], [2670, 430]].map(([x, y], i) => ({ x, y, w: 22, h: 37, alive: true, dir: 1, color: i % 2 ? "#c77667" : "#788ec5" }));
      state.people.push(...[[220, 465], [275, 585], [350, 420], [460, 660], [1040, 650], [1590, 395], [2180, 650], [2730, 420]].map(([x, y], i) => ({ x, y, w: 22, h: 37, alive: true, dir: 1, follow: true, recruited: false, phase: i, color: ["#8d85b6", "#c77667", "#6d9daa", "#c6a163"][i % 4] })));
      state.people.forEach((person, i) => { person.follow = true; person.recruited = false; person.phase = i; });
    }
    function arriveHome() {
      clearNewHazards();
      Object.assign(state, { tiny: false, paused: false, health: 5, hurt: 0, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], lizards: [], people: [], obstacles: [], beacons: [] });
      Object.assign(state.player, { x: 350, y: 440, w: 28, h: 46, dir: 1, moving: false });
      choosePortal(); stage("homeArrival");
    }
    function buildMindDimension() {
      clearNewHazards();
      Object.assign(state, { level: 4, width: 3200, finishX: 3020, health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [] });
      Object.assign(state.player, { x: 140, y: 515, w: 28, h: 46, dir: 1, moving: false });
      state.machine = { x: 1600, y: 515, cooldown: 1.2, angle: 0 };
      state.vial = { x: 3020, y: 515 };
      state.obstacles = [{ x: 1540, y: 385, w: 120, h: 190, kind: "machine" }, { x: 950, y: 540, w: 100, h: 95 }, { x: 1950, y: 320, w: 80, h: 135 }, { x: 2380, y: 550, w: 100, h: 110 }];
    }
    function returnWithVial() {
      clearNewHazards();
      Object.assign(state, { health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, thoughtVialCollected: true, lasers: [], robots: [], shadows: [], lizards: [], people: [], obstacles: [], beacons: [] });
      Object.assign(state.player, { x: 350, y: 440, w: 28, h: 46, dir: 1, moving: false });
      choosePortal(); stage("vialReturn");
    }
    function buildContestants(arena = false) {
      clearNewHazards();
      Object.assign(state, { level: 5, width: 3850, finishX: 3510, health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [], vialDelivered: true, battleCheckpoint: arena });
      Object.assign(state.player, { x: arena ? 3130 : 140, y: 545, w: 28, h: 46, dir: 1, moving: false });
      state.computer = { x: 3510, y: 395, destroyed: false };
      state.obstacles = [{ x: 1100, y: 545, w: 90, h: 80 }, { x: 2100, y: 330, w: 90, h: 85 }, { x: 2690, y: 560, w: 80, h: 90 }, { x: 3400, y: 305, w: 220, h: 100 }];
      const spawns = arena ? [[3650, 445, "probe"], [3650, 665, "tablet"], [3480, 675, "probe"], [3290, 365, "tablet"]] : [[820, 425, "tablet"], [1350, 655, "tablet"], [1850, 425, "tablet"], [2390, 645, "tablet"], [2860, 450, "tablet"]];
      state.guardians = spawns.map(([x, y, kind], i) => ({ x, y, w: 30, h: 48, hp: arena ? 2 : 3, alive: true, kind, dir: -1, cooldown: 2 + i * .4, hit: 0, defeated: 0, aim: 0 }));
      state.people = Array.from({ length: 8 }, (_, i) => ({ x: arena ? 3040 + i % 3 * 25 : 220 + i * 80, y: 420 + i % 3 * 95, w: 22, h: 37, alive: true, follow: true, recruited: arena, phase: i, dir: 1, color: ["#8d85b6", "#c77667", "#6d9daa", "#c6a163"][i % 4] }));
    }
    function buildVolcano() {
      clearNewHazards();
      Object.assign(state, { level: 6, width: 3600, finishX: 3400, health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [], secondVialCollected: true, thoughtVialCollected: true, vialDelivered: true });
      Object.assign(state.player, { x: 140, y: 535, w: 28, h: 46, dir: 1, moving: false });
      state.obstacles = [{ x: 1100, y: 340, w: 90, h: 100 }, { x: 1700, y: 560, w: 90, h: 95 }, { x: 2360, y: 325, w: 100, h: 110 }, { x: 2940, y: 540, w: 80, h: 100 }];
      state.vents = [[600, 400, 0], [900, 620, .9], [1250, 480, 1.8], [1580, 370, 2.7], [1880, 650, 3.6], [2220, 500, 4.5], [2530, 405, .7], [2870, 630, 2.1], [3120, 500, 3.4]].map(([x, y, offset]) => ({ x, y, w: 70, h: 32, offset, phase: offset, warning: false, erupting: false }));
      state.robots = [[820, 480], [1450, 620], [2070, 410], [2700, 630], [3090, 365]].map(([x, y], i) => ({ x, y, w: 38, h: 48, homeX: x, homeY: y, hp: 3, alive: true, dir: i % 2 ? -1 : 1, cooldown: 1.7 + i * .2, alert: false, aim: 0, hit: 0, defeated: 0 }));
      updateVolcanoVents(0);
    }
    function updateVolcanoVents(dt) {
      state.volcanoTime += dt;
      state.vents.forEach(vent => {
        vent.phase = (Math.round((state.volcanoTime + vent.offset) * 1e9) / 1e9) % 6;
        vent.warning = vent.phase >= 3.6 && vent.phase < 4.6;
        vent.erupting = vent.phase >= 4.6;
      });
    }
    function shootZap() {
      if (state.stage === "repairedHome" && state.watchRepaired && !state.paused && state.zapCooldown <= 0) {
        state.zaps.push({ x: state.player.x, y: state.player.y - state.player.h / 2, vx: state.player.dir * 470, vy: 0, life: 1.4 });
        state.zapCooldown = .28; return true;
      }
      if (!["contestants", "arena", "volcano", "colosseum"].includes(state.stage) || state.paused || state.zapCooldown > 0) return false;
      const p = state.player;
      const enemies = state.stage === "colosseum" ? state.soldiers : state.stage === "volcano" ? state.robots : state.guardians;
      const target = enemies.filter(g => g.alive && Math.hypot(g.x - p.x, g.y - p.y) < 650).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      if (!target) { say(state.stage === "colosseum" ? "Move closer to a Roman soldier, then fire your watch with J or Space." : state.stage === "volcano" ? "Move closer to a robot, then fire your watch with J or Space." : "Move closer to a Guardian, then fire your watch with J or Space."); return false; }
      const x = target.x - p.x, y = target.y - target.h / 2 - (p.y - p.h / 2), length = Math.hypot(x, y) || 1;
      state.zaps.push({ x: p.x, y: p.y - p.h / 2, vx: x / length * 470, vy: y / length * 470, life: 1.7 });
      state.zapCooldown = .28;
      return true;
    }
    function updateWatchBolts(dt, enemies) {
      for (const zap of state.zaps) {
        const steps = Math.max(1, Math.ceil(470 * dt / 5));
        for (let i = 0; i < steps && zap.life > 0; i++) {
          zap.x += zap.vx * dt / steps; zap.y += zap.vy * dt / steps;
          const box = { x: zap.x - 4, y: zap.y - 4, w: 8, h: 8 };
          if (state.obstacles.some(wall => overlaps(box, wall))) { zap.life = 0; break; }
          const enemy = enemies.find(g => g.alive && overlaps(box, bounds(g)));
          if (enemy) { enemy.hp--; enemy.hit = .18; zap.life = 0; if (enemy.hp <= 0) { enemy.alive = false; enemy.defeated = .6; } }
        }
        zap.life -= dt;
      }
      state.zaps = state.zaps.filter(zap => zap.life > 0);
    }
    function updateVolcano(dt) {
      const p = state.player;
      updateVolcanoVents(dt);
      state.zapCooldown = Math.max(0, state.zapCooldown - dt);
      if (keys.has("j") || keys.has(" ")) shootZap();
      for (const vent of state.vents) {
        const jet = { x: vent.x - 10, y: vent.y - 75, w: vent.w + 20, h: vent.h + 98 };
        if (vent.erupting && overlaps(bounds(p), jet)) damage();
      }
      for (const bot of state.robots) {
        bot.hit = Math.max(0, bot.hit - dt); bot.defeated = Math.max(0, bot.defeated - dt);
        if (!bot.alive) continue;
        const dx = p.x - bot.x, dy = p.y - p.h / 2 - (bot.y - 24), distance = Math.hypot(dx, dy) || 1;
        bot.alert = !state.tiny && distance < 520; bot.aim = Math.atan2(dy, dx);
        if (bot.alert) {
          bot.cooldown -= dt;
          if (bot.cooldown <= 0) { state.lasers.push({ x: bot.x, y: bot.y - 24, vx: dx / distance * 245, vy: dy / distance * 245, life: 3 }); bot.cooldown = 2; }
        } else {
          if (bot.x <= bot.homeX - 65) bot.dir = 1;
          if (bot.x >= bot.homeX + 65) bot.dir = -1;
          const previous = bot.x; move(bot, bot.dir * 28 * dt, 0); if (bot.x === previous) bot.dir *= -1;
          bot.cooldown = Math.max(.6, bot.cooldown);
        }
        if (overlaps(bounds(p), bounds(bot))) damage();
      }
      updateWatchBolts(dt, state.robots);
      for (const ray of state.lasers) {
        const steps = Math.max(1, Math.ceil(Math.hypot(ray.vx, ray.vy) * dt / 4));
        for (let i = 0; i < steps && ray.life > 0; i++) {
          ray.x += ray.vx * dt / steps; ray.y += ray.vy * dt / steps;
          const box = { x: ray.x - 3, y: ray.y - 3, w: 6, h: 6 };
          if (state.obstacles.some(rock => overlaps(box, rock))) { ray.life = 0; break; }
          if (overlaps(box, bounds(p))) { damage(); ray.life = 0; }
        }
        ray.life -= dt;
      }
      state.lasers = state.lasers.filter(ray => ray.life > 0);
      if (state.stage === "volcano" && Math.hypot(p.x - state.finishX, p.y - 535) < 55) { buildColosseum(); stage("colosseumGate"); }
    }
    function buildColosseum() {
      clearNewHazards();
      Object.assign(state, { level: 7, width: 1900, finishX: 1740, health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [], obstacles: [] });
      Object.assign(state.player, { x: 210, y: 535, w: 28, h: 46, dir: 1, moving: false });
      const positions = [[650, 390], [750, 650], [900, 480], [1010, 680], [1120, 370], [1240, 560], [1360, 680], [1460, 410], [1580, 570], [1700, 390]];
      state.soldiers = positions.map(([x, y], i) => ({ x, y, w: 30, h: 46, hp: 2, alive: true, hit: 0, defeated: 0, dir: -1, phase: i, cooldown: .8 + i * .16, windup: 0 }));
    }
    function romanVictory() {
      state.soldiers.forEach((soldier, i) => { soldier.alive = false; soldier.hp = 0; soldier.windup = 0; soldier.x = 1410 + i % 5 * 62; soldier.y = i < 5 ? 420 : 655; soldier.dir = -1; });
      Object.assign(state.player, { x: 1300, y: 535, w: 28, h: 46, dir: 1, moving: false });
      state.tiny = false; state.zaps = []; state.lasers = []; state.hurt = 0; state.romanWon = true;
      stage("romanReward");
    }
    function updateColosseum(dt) {
      const p = state.player;
      state.romanTime += dt; state.zapCooldown = Math.max(0, state.zapCooldown - dt);
      if (keys.has("j") || keys.has(" ")) shootZap();
      for (const soldier of state.soldiers) {
        soldier.hit = Math.max(0, soldier.hit - dt); soldier.defeated = Math.max(0, soldier.defeated - dt);
        if (!soldier.alive) continue;
        const dx = p.x - soldier.x, dy = p.y - soldier.y, distance = Math.hypot(dx, dy) || 1;
        soldier.dir = dx >= 0 ? 1 : -1;
        if (soldier.windup > 0) {
          soldier.windup = Math.max(0, soldier.windup - dt);
          if (soldier.windup <= 1e-9) { soldier.windup = 0; soldier.cooldown = 1.6; if (distance < 76) damage(); }
        } else {
          soldier.cooldown = Math.max(0, soldier.cooldown - dt);
          if (distance > 55) moveHunter(soldier, dx / distance * 58 * dt, dy / distance * 58 * dt);
          if (distance < 88 && soldier.cooldown <= 0) soldier.windup = .7;
        }
        if (state.stage === "lost") return;
      }
      updateWatchBolts(dt, state.soldiers);
      if (state.soldiers.every(soldier => !soldier.alive)) romanVictory();
    }
    function buildSeaOfMemories() {
      clearNewHazards();
      Object.assign(state, { level: 8, width: 3600, finishX: 3400, health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [], thoughtVialCollected: true });
      Object.assign(state.player, { x: 160, y: 535, w: 28, h: 46, dir: 1, moving: false });
      state.obstacles = [{ x: 1060, y: 350, w: 90, h: 85 }, { x: 1720, y: 580, w: 85, h: 90 }, { x: 2400, y: 350, w: 90, h: 85 }, { x: 2910, y: 580, w: 80, h: 80 }];
      state.octopuses = [[820, 470], [1330, 620], [1830, 420], [2220, 620], [2690, 455], [3070, 610]].map(([x, y], i) => ({ x, y, homeX: x, homeY: y, w: 68, h: 64, phase: i * 1.3, dir: 1, inkCooldown: 1.2 + i * .2, color: ["#c17bda", "#ef9ba8", "#e9ad71"][i % 3] }));
      updateSeaOfMemories(0);
    }
    function updateSeaOfMemories(dt) {
      state.seaClock += dt;
      state.inkBlind = Math.max(0, state.inkBlind - dt);
      if (state.inkBlind < 1e-9) state.inkBlind = 0;
      for (const octopus of state.octopuses) {
        const phase = state.seaClock * .65 + octopus.phase;
        octopus.x = octopus.homeX + Math.sin(phase) * 90;
        octopus.y = octopus.homeY + Math.sin(phase * .8) * 38;
        octopus.dir = Math.cos(phase) >= 0 ? 1 : -1;
        if (state.stage === "sea" && dt > 0) {
          const dx = state.player.x - octopus.x, dy = state.player.y - state.player.h / 2 - (octopus.y - 31), distance = Math.hypot(dx, dy) || 1;
          octopus.inkCooldown = Math.max(0, octopus.inkCooldown - dt);
          if (distance < 520 && octopus.inkCooldown <= 0) {
            state.inkShots.push({ x: octopus.x, y: octopus.y - 31, vx: dx / distance * 210, vy: dy / distance * 210, life: 3 });
            octopus.inkCooldown = 3.2;
          }
        }
        if (state.stage === "sea" && overlaps(bounds(state.player), bounds(octopus))) {
          damage();
          if (state.stage === "lost") return;
        }
      }
      for (const shot of state.inkShots) {
        const steps = Math.max(1, Math.ceil(Math.hypot(shot.vx, shot.vy) * dt / 4));
        for (let i = 0; i < steps && shot.life > 0; i++) {
          shot.x += shot.vx * dt / steps; shot.y += shot.vy * dt / steps;
          const box = { x: shot.x - 7, y: shot.y - 7, w: 14, h: 14 };
          if (state.obstacles.some(rock => overlaps(box, rock))) { shot.life = 0; break; }
          if (overlaps(box, bounds(state.player))) {
            shot.life = 0; state.inkBlind = 2;
            say("Ink! Your view is dark for 2 seconds. Keep moving — it will clear!");
          }
        }
        shot.life -= dt;
      }
      state.inkShots = state.inkShots.filter(shot => shot.life > 0);
      if (state.stage === "sea" && Math.hypot(state.player.x - state.finishX, state.player.y - 535) < 55) { buildPowerless(); stage("powerlessGate"); }
    }
    function buildPowerless() {
      clearNewHazards();
      Object.assign(state, { level: 9, width: 3700, finishX: 3500, health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [] });
      Object.assign(state.player, { x: 160, y: 535, w: 28, h: 46, dir: 1, moving: false });
      state.obstacles = [{ x: 680, y: 305, w: 50, h: 260 }, { x: 1260, y: 480, w: 50, h: 245 }, { x: 1860, y: 305, w: 50, h: 265 }, { x: 2470, y: 480, w: 55, h: 245 }, { x: 2940, y: 330, w: 50, h: 240 }];
      state.betterworlders = [[940, 660], [1460, 395], [1630, 660], [2080, 630], [2680, 400], [3220, 640]].map(([x, y], i) => ({ x, y, homeX: x, homeY: y, w: 30, h: 46, dir: -1, phase: i, alert: false }));
      state.vial = { x: state.finishX, y: 535 };
    }
    function updatePowerless(dt) {
      const p = state.player;
      state.powerlessTime += dt; state.jamSpeechTime = Math.max(0, state.jamSpeechTime - dt); state.barrierBump = Math.max(0, state.barrierBump - dt);
      for (const enemy of state.betterworlders) {
        const dx = p.x - enemy.x, dy = p.y - enemy.y, distance = Math.hypot(dx, dy) || 1;
        enemy.alert = distance < 450;
        if (enemy.alert) { enemy.dir = dx >= 0 ? 1 : -1; moveHunter(enemy, dx / distance * 80 * dt, dy / distance * 80 * dt); }
        else {
          const targetX = enemy.homeX + Math.sin(state.powerlessTime * .6 + enemy.phase) * 40;
          enemy.dir = targetX >= enemy.x ? 1 : -1; moveHunter(enemy, Math.sign(targetX - enemy.x) * Math.min(Math.abs(targetX - enemy.x), 20 * dt), 0);
        }
        if (overlaps(bounds(p), bounds(enemy)) && state.hurt <= 0) {
          damage(); moveHunter(enemy, -dx / distance * 65, -dy / distance * 65);
          if (state.stage === "lost") return;
        }
      }
      if (Math.hypot(p.x - state.vial.x, p.y - state.vial.y) < 40) {
        returnToSapphire();
      }
    }
    function returnToSapphire() {
      Object.assign(state, { powerlessVialCollected: true, thoughtVialCollected: true, width: 1000, health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, betterworlders: [], obstacles: [], robots: [], lasers: [], zaps: [], vial: null, jamSpeechTime: 0, barrierBump: 0, watchRepaired: false, zapCooldown: 0 });
      Object.assign(state.player, { x: 350, y: 440, w: 28, h: 46, dir: 1, moving: false });
      choosePortal(); stage("powerlessReturn");
    }
    function updateRepairedWatch(dt) {
      state.zapCooldown = Math.max(0, state.zapCooldown - dt);
      if (keys.has("j") || keys.has(" ")) shootZap();
      for (const zap of state.zaps) { zap.x += zap.vx * dt; zap.life -= dt; }
      state.zaps = state.zaps.filter(zap => zap.life > 0 && zap.x >= 40 && zap.x <= 960);
    }
    function buildRainforest() {
      clearNewHazards();
      Object.assign(state, { level: 10, width: 4000, finishX: 3760, health: 5, tiny: false, hurt: 0, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], shadows: [], beacons: [], watchRepaired: true });
      Object.assign(state.player, { x: 160, y: 535, w: 28, h: 46, dir: 1, moving: false });
      state.obstacles = [{ x: 1100, y: 350, w: 105, h: 100 }, { x: 1850, y: 560, w: 100, h: 95 }, { x: 2640, y: 350, w: 110, h: 110 }, { x: 3200, y: 570, w: 90, h: 90 }];
      state.eagles = [[800, 390], [1300, 650], [1850, 395], [2400, 650], [2880, 385], [3400, 650]].map(([x, y], i) => ({ x, y, homeX: x, homeY: y, w: 52, h: 26, phase: i * 1.3, mode: "patrol", cooldown: 1.4 + i * .2, remaining: 0, dir: -1, targetX: x, targetY: y, vx: 0, vy: 0 }));
    }
    function reachRainforestExit() {
      state.tiny = false; state.hurt = 0; state.zaps = []; state.lasers = [];
      Object.assign(state.player, { x: state.finishX - 170, y: 535, w: 28, h: 46, dir: 1, moving: false });
      choosePortal(); stage("darknessWarning");
    }
    function updateRainforest(dt) {
      const p = state.player;
      state.rainforestTime += dt;
      for (const eagle of state.eagles) {
        if (eagle.mode === "patrol") {
          const phase = state.rainforestTime * 2.4 + eagle.phase;
          eagle.x = eagle.homeX + Math.sin(phase) * 120;
          eagle.y = eagle.homeY + Math.sin(state.rainforestTime * 1.6 + eagle.phase) * 22;
          eagle.dir = Math.cos(phase) >= 0 ? 1 : -1;
          eagle.cooldown = Math.max(0, eagle.cooldown - dt);
          if (!state.tiny && Math.hypot(p.x - eagle.x, p.y - eagle.y) < 480 && eagle.cooldown <= 0) {
            eagle.mode = "warning"; eagle.remaining = .8; eagle.targetX = p.x; eagle.targetY = p.y - 8;
          }
        } else if (eagle.mode === "warning") {
          eagle.remaining = Math.max(0, eagle.remaining - dt);
          if (eagle.remaining <= 1e-9) {
            const dx = eagle.targetX - eagle.x, dy = eagle.targetY - eagle.y, length = Math.hypot(dx, dy) || 1;
            eagle.vx = dx / length * 310; eagle.vy = dy / length * 310; eagle.dir = dx >= 0 ? 1 : -1;
            eagle.mode = "dive"; eagle.remaining = 1.5;
          }
        } else if (eagle.mode === "dive") {
          eagle.x = Math.max(60, Math.min(state.width - 60, eagle.x + eagle.vx * dt));
          eagle.y = Math.max(335, Math.min(710, eagle.y + eagle.vy * dt));
          eagle.remaining = Math.max(0, eagle.remaining - dt);
          if (eagle.remaining <= 0) eagle.mode = "recover";
        } else {
          const dx = eagle.homeX - eagle.x, dy = eagle.homeY - eagle.y, length = Math.hypot(dx, dy) || 1;
          const step = Math.min(260 * dt, length);
          eagle.x += dx / length * step; eagle.y += dy / length * step; eagle.dir = dx >= 0 ? 1 : -1;
          // Rejoin the patrol where it currently is, without jumping across the forest.
          const targetX = eagle.homeX + Math.sin(state.rainforestTime * 2.4 + eagle.phase) * 120;
          const targetY = eagle.homeY + Math.sin(state.rainforestTime * 1.6 + eagle.phase) * 22;
          if (Math.hypot(targetX - eagle.x, targetY - eagle.y) < 28) { eagle.mode = "patrol"; eagle.cooldown = 4; }
        }
        if (overlaps(bounds(p), bounds(eagle)) && state.hurt <= 0) {
          damage(); eagle.mode = "recover"; eagle.cooldown = 4;
          if (state.stage === "lost") return;
        }
      }
      if (Math.hypot(p.x - state.finishX, p.y - 535) < 55) reachRainforestExit();
    }
    function buildShadowDimension() {
      clearNewHazards();
      Object.assign(state, { level: 11, width: 4000, finishX: 3760, health: 5, tiny: false, hurt: 2, paused: false, notice: "", noticeTime: 0, lasers: [], robots: [], obstacles: [], watchRepaired: true });
      Object.assign(state.player, { x: 200, y: 535, w: 28, h: 46, dir: 1, moving: false });
      state.shadows = [{ x: 80, y: 535, w: 28, h: 46, speed: 112, own: true, dir: 1 }];
      for (let i = 0; i < 23; i++) {
        state.shadows.push({ x: 650 + Math.floor(i / 3) * 390, y: [375, 535, 700][i % 3], w: 28, h: 46, speed: 60 + i % 4 * 6, own: false, dir: -1 });
      }
      state.beacons = [1050, 2050, 3050].map(x => ({ x, y: 535, collected: false }));
      choosePortal();
    }
    function updateShadowDimension(dt) {
      const p = state.player;
      state.shadowTime += dt;
      for (const shade of state.shadows) {
        const dx = p.x - shade.x, dy = p.y - shade.y, distance = Math.hypot(dx, dy) || 1;
        shade.dir = dx >= 0 ? 1 : -1;
        moveHunter(shade, dx / distance * Math.min(shade.speed * dt, distance), dy / distance * Math.min(shade.speed * dt, distance));
        // Shadows follow even tiny travellers. A hit pushes the shade back so you can escape.
        if (overlaps(bounds(p), bounds(shade)) && state.hurt <= 0) {
          damage();
          shade.x = Math.max(55, Math.min(state.width - 55, shade.x - (distance > 1 ? dx / distance : 1) * 120));
          shade.y = Math.max(351, Math.min(725, shade.y - dy / distance * 120));
          if (state.stage === "lost") return;
        }
      }
      for (const beacon of state.beacons) {
        if (!beacon.collected && Math.hypot(p.x - beacon.x, p.y - beacon.y) < 48) {
          beacon.collected = true; state.health = Math.min(5, state.health + 3); state.hurt = Math.max(state.hurt, 1.5);
          state.shadows.forEach(shade => {
            const dx = shade.x - beacon.x, dy = shade.y - beacon.y, distance = Math.hypot(dx, dy) || 1;
            if (distance < 200) { shade.x = Math.max(55, Math.min(state.width - 55, beacon.x + (distance > 1 ? dx / distance : -1) * 220)); shade.y = Math.max(351, Math.min(725, beacon.y + dy / distance * 220)); }
          });
          say("A light in the fog! Three hearts restored, and nearby shadows pushed away.");
        }
      }
      if (Math.hypot(p.x - state.finishX, p.y - 535) < 55) {
        state.shadows = []; state.tiny = false;
        Object.assign(p, { w: 28, h: 46, moving: false }); stage("won");
      }
    }
    function convertPlayer() {
      state.converted = true; state.health = 0; state.happy = 0; state.happyDrain = 0; state.lasers = []; state.zaps = [];
      stage("lost");
    }
    function updateGuardians(dt) {
      const p = state.player, arena = state.stage === "arena";
      state.zapCooldown = Math.max(0, state.zapCooldown - dt);
      if (keys.has("j") || keys.has(" ")) shootZap();
      if (state.happy > 0) {
        const active = Math.min(dt, state.happy);
        state.happy = Math.max(0, state.happy - dt); state.happyDrain += active * .5;
        while (state.happyDrain >= 1 - 1e-9) { state.happyDrain = Math.max(0, state.happyDrain - 1); state.health = Math.max(0, state.health - 1); }
        if (state.health === 0) { stage("lost"); return; }
        if (state.happy <= 1e-9) { state.happy = 0; state.happyDrain = 0; }
      }
      for (const guardian of state.guardians) {
        guardian.hit = Math.max(0, guardian.hit - dt); guardian.defeated = Math.max(0, guardian.defeated - dt);
        if (!guardian.alive) continue;
        const dx = p.x - guardian.x, dy = p.y - p.h / 2 - (guardian.y - guardian.h / 2), distance = Math.hypot(dx, dy) || 1;
        guardian.dir = dx >= 0 ? 1 : -1; guardian.aim = Math.atan2(dy, dx);
        if (distance < 700) {
          if (arena && guardian.kind === "probe" && distance > 165) moveHunter(guardian, dx / distance * 48 * dt, dy / distance * 48 * dt);
          guardian.cooldown -= dt;
          if (guardian.cooldown <= 0) {
            state.lasers.push({ x: guardian.x, y: guardian.y - 24, vx: dx / distance * (arena ? 190 : 225), vy: dy / distance * (arena ? 190 : 225), life: 4, guardian: true, conversion: arena });
            guardian.cooldown = arena ? 2.2 : 2.6;
          }
        }
        if (overlaps(bounds(p), bounds(guardian))) {
          if (arena) { convertPlayer(); return; }
          if (state.happy <= 0) say("Overjoyed! You're super quick, but the happiness rays slowly drain your hearts.");
          state.happy = 4;
        }
      }
      updateWatchBolts(dt, state.guardians);
      for (const ray of state.lasers) {
        const steps = Math.max(1, Math.ceil(Math.hypot(ray.vx, ray.vy) * dt / 4));
        for (let i = 0; i < steps && ray.life > 0; i++) {
          ray.x += ray.vx * dt / steps; ray.y += ray.vy * dt / steps;
          const box = { x: ray.x - 3, y: ray.y - 3, w: 6, h: 6 };
          if (state.obstacles.some(wall => overlaps(box, wall))) { ray.life = 0; break; }
          if (overlaps(box, bounds(p))) {
            ray.life = 0;
            if (ray.conversion) { convertPlayer(); return; }
            state.happy = 4;
            say("Overjoyed! You're super quick, but the happiness rays slowly drain your hearts.");
          }
        }
        ray.life -= dt;
      }
      state.lasers = state.lasers.filter(ray => ray.life > 0);
      const remaining = state.guardians.filter(g => g.alive).length;
      if (!arena && Math.hypot(p.x - state.computer.x, p.y - 515) < 240) {
        if (remaining) say(`Defeat the ${remaining} remaining MBS Guardians before approaching the computer.`);
        else { state.happy = 0; state.happyDrain = 0; state.lasers = []; state.zaps = []; stage("computerSpeech"); }
      }
      if (arena && remaining === 0) { state.lasers = []; state.zaps = []; state.happy = 0; stage("computerExplosion"); }
    }
    function advance() {
      if (state.paused) return;
      if (state.stage === "watch") stage("bag");
      else if (state.stage === "bag") { choosePortal(); stage("portal"); }
      else if (state.stage === "homeDialogue") stage("homeReply");
      else if (state.stage === "vialReturn") { state.thoughtVialCollected = false; state.vialDelivered = true; stage("contestReveal"); }
      else if (state.stage === "contestReveal") { buildContestants(); stage("contestGate"); }
      else if (state.stage === "computerSpeech") stage("defiance");
      else if (state.stage === "romanAccusation") stage("colosseum");
      else if (state.stage === "romanReward") { state.romanVial = true; state.thoughtVialCollected = true; stage("romanThanks"); }
      else if (state.stage === "repairOffer") stage("watchRepair");
      else if (state.stage === "repairedHome") { state.zaps = []; stage("rainforestMission"); }
      else if (state.stage === "rainforestMission") { state.tiny = false; Object.assign(state.player, { w: 28, h: 46 }); choosePortal(); stage("rainforestPortal"); }
      else if (state.stage === "darknessWarning") { buildShadowDimension(); stage("shadowGate"); }
    }
    function acceptQuest() { if (state.stage !== "sapphire") return; buildCity(); stage("title"); }
    function declineQuest() { if (state.stage === "sapphire") { state.notice = "Take your time. Your dimension needs you when you are ready."; state.noticeTime = 99; } }
    function retryCity() { buildCity(); stage("city"); }
    function retryLevel() {
      if (state.level === 11) { buildShadowDimension(); stage("shadow"); }
      else if (state.level === 10) { buildRainforest(); stage("rainforest"); }
      else if (state.level === 9) { buildPowerless(); stage("powerless"); }
      else if (state.level === 8) { buildSeaOfMemories(); stage("sea"); }
      else if (state.level === 7) { buildColosseum(); stage("romanAccusation"); }
      else if (state.level === 6) { buildVolcano(); stage("volcano"); }
      else if (state.level === 5) { const arena = state.battleCheckpoint; buildContestants(arena); stage(arena ? "arena" : "contestants"); }
      else if (state.level === 4) { buildMindDimension(); stage("mind"); }
      else if (state.level === 3) { buildField(); stage("field"); }
      else if (state.level === 2) { buildWardrobeDimension(); stage("wardrobeHome"); }
      else retryCity();
    }
    function skipLevel() {
      if (!playingStages.includes(state.stage) && state.stage !== "lost") return;
      state.paused = false; state.converted = false; state.happy = 0; state.happyDrain = 0; state.health = 5; state.lasers = []; state.zaps = [];
      if (state.level === 1) { buildWardrobeDimension(); stage("wardrobeHome"); }
      else if (state.level === 2) { buildField(); stage("fieldGate"); }
      else if (state.level === 3) arriveHome();
      else if (state.level === 4) returnWithVial();
      else if (state.level === 6) { buildColosseum(); stage("colosseumGate"); }
      else if (state.level === 7) { if (state.stage === "romanExit") { choosePortal(); stage("romanPortal"); } else romanVictory(); }
      else if (state.level === 8) { buildPowerless(); stage("powerlessGate"); }
      else if (state.level === 9) { if (state.stage === "repairedHome") stage("rainforestMission"); else returnToSapphire(); }
      else if (state.level === 10) reachRainforestExit();
      else if (state.level === 11) { state.shadows = []; state.tiny = false; Object.assign(state.player, { x: state.finishX, y: 535, w: 28, h: 46 }); stage("won"); }
      else if (state.stage === "thoughtExit") { buildVolcano(); stage("volcanoGate"); }
      else {
        state.guardians.forEach(g => { g.alive = false; g.hp = 0; });
        if (!state.battleCheckpoint) { state.tiny = false; Object.assign(state.player, { x: 3300, y: 515, w: 28, h: 46, dir: 1, moving: false }); }
        stage(state.battleCheckpoint ? "computerExplosion" : "computerSpeech");
      }
    }
    function say(text) { state.notice = text; state.noticeTime = 3.5; }
    function validPosition(actor, city = true) {
      const box = bounds(actor);
      if (!city) return box.x >= 55 && box.x + box.w <= 945 && box.y >= 300 && box.y + box.h <= 545;
      if (state.level === 5 && state.battleCheckpoint && box.x < 3000) return false;
      return box.x >= 40 && box.x + box.w <= state.width - 40 && box.y >= 305 && box.y + box.h <= 725 && !state.obstacles.some(obstacle => overlaps(box, obstacle));
    }
    function move(actor, dx, dy, city = true) {
      const noteBarrier = () => { if (actor === state.player && state.stage === "powerless" && state.obstacles.some(wall => overlaps(bounds(actor), wall))) state.barrierBump = .4; };
      actor.x += dx; if (!validPosition(actor, city)) { noteBarrier(); actor.x -= dx; }
      actor.y += dy; if (!validPosition(actor, city)) { noteBarrier(); actor.y -= dy; }
    }
    function toggleShrink() {
      if (!playingStages.includes(state.stage) || state.paused ) return;
      if (state.stage === "powerless") {
        if (!state.jamDiscovered) { state.jamDiscovered = true; state.jamSpeechTime = 3; say("My watch is jammed!"); }
        else say("My watch is still jammed. I'll have to find a way around the barriers.");
        return;
      }
      const nextTiny = !state.tiny;
      const grown = { ...state.player, w: 28, h: 46 };
      if (!nextTiny && !validPosition(grown, state.stage !== "repairedHome")) { say("Find a little more space to grow."); return; }
      state.tiny = nextTiny;
      Object.assign(state.player, { w: nextTiny ? 10 : 28, h: nextTiny ? 16 : 46 });
      if (nextTiny) state.robots.forEach(robot => { robot.alert = false; });
      const messages = { 1: ["Normal size. Keep moving and watch for lasers!", "Tiny! Robots cannot notice you. Their bodies and existing lasers can still hurt."], 2: ["Full size. A scorpion catch means people-robot GAME OVER! Find the antidote!", "Tiny! Distant people-robots overlook you, but a scorpion still transforms you: GAME OVER!"], 3: ["Full size. Dodge the walls and keep away from hungry Practiri!", "Tiny! Distant Practiri overlook you, but nearby mouths can still bite."], 4: ["Full size. Dodge the machine's thought rays!", "Tiny… but the thought machine can still target you. Dodge its rays!"], 5: ["Full size. J or Space fires your watch. Dodge the Guardians' beams!", "Tiny! Tablets can still find you, and conversion beams still change you. Use your watch!"], 6: ["Full size. Watch the lava warnings and zap the robots!", "Tiny! Robots overlook you, but lava jets, robot bodies and existing lasers still hurt."] };
      say(state.level === 11 ? "The shadows can follow you at either size. Keep moving through the fog towards the lights!" : state.level === 10 ? (nextTiny ? "Tiny! Eagles won't start a dive at you, but flying birds and dives already in progress can still hurt." : "Full size. My fixed watch works! Dodge the eagles — no lasers in this rainforest.") : state.stage === "repairedHome" ? (nextTiny ? "It works! Sapphire fixed my watch — I can shrink again!" : "Back to normal size. My watch works again!") : state.level === 8 ? "The sea slows you a little at either size. Dodge the octopuses and head for the glowing exit!" : state.level === 7 ? "The Romans can fight you at either size. Dodge their spear warnings and fire your watch!" : messages[state.level][Number(nextTiny)]);
    }
    function togglePause() { if (![...playingStages, "portal", "homePortal", "wardrobeHome", "wardrobeBreach", "wardrobeCured", "colosseumGate", "romanAccusation", "romanReward", "romanThanks", "romanPortal", "powerlessReturn", "repairOffer", "watchRepair", "rainforestMission", "rainforestPortal", "darknessWarning", "shadowGate"].includes(state.stage)) return; state.paused = !state.paused; keys.clear(); }
    function damage() {
      if (!playingStages.includes(state.stage) || state.hurt > 0) return;
      state.health = Math.max(0, state.health - 1); state.hurt = 1.2;
      say(state.level === 11 ? "A shadow caught you! Find the glowing lights to restore hearts, then reach the exit portal." : state.level === 10 ? "An eagle caught you! Keep moving, dodge its dive marker, or shrink before the next dive." : state.level === 9 ? "A Betterworlder caught you! Keep moving and find a way around the invisible barriers." : state.level === 7 ? "A Roman spear caught you! Dodge the red warning rings and fight back with your watch." : state.level === 8 ? "An octopus caught you! Swim around its tentacles and keep going towards the exit." : state.level === 6 ? "Ouch! Stay out of erupting lava and dodge the volcanic robots." : state.level === 3 ? "A Practiri tried to eat you! Get away from its jaws and head home." : (state.level === 2 ? "A robot caught you! Keep moving towards the antidote." : (state.tiny ? "Even tiny travellers can get hurt. Dodge the lasers and robot feet!" : "You've been hit! Try shrinking with C to escape their attention.")));
      if (state.health === 0) stage("lost");
    }
    function applyMindEffect() {
      if (state.mindGuard > 0 || state.stage !== "mind") return;
      const effects = [["wander", "RANDOM WALK"], ["reverse", "REVERSED CONTROLS"], ["dance", "DANCE STEPS"], ["freeze", "FROZEN FEET"]];
      const [kind, label] = effects[Math.min(3, Math.floor(random() * effects.length))];
      state.effect = { kind, label, remaining: 2, elapsed: 0, angle: random() * Math.PI * 2 };
      state.mindGuard = 3; // Two seconds of effect, then one second to regain control.
      say(`Thought ray! ${label.toLowerCase()} for 2 seconds. Your controls will return automatically.`);
    }
    function moveHunter(actor, dx, dy) {
      const beforeX = actor.x;
      move(actor, dx, dy);
      if (Math.abs(dx) > .01 && Math.abs(actor.x - beforeX) < .001) {
        const box = bounds(actor), wall = state.obstacles.find(w => box.y < w.y + w.h && box.y + box.h > w.y && Math.abs(actor.x - (dx > 0 ? w.x : w.x + w.w)) < actor.w + 12);
        if (wall) {
          const above = wall.y - actor.y, below = wall.y + wall.h + actor.h + 3 - actor.y;
          const canAbove = wall.y - actor.h >= 305, canBelow = wall.y + wall.h + actor.h + 3 <= 725;
          const direction = !canAbove ? 1 : !canBelow ? -1 : Math.abs(above) < Math.abs(below) ? -1 : 1;
          move(actor, 0, direction * Math.hypot(dx, dy));
        }
      }
    }
    function updatePeople(dt) {
      const p = state.player;
      state.people.forEach((person, index) => {
        if (!person.alive) return;
        const predator = state.stage === "field" ? state.lizards.find(lizard => Math.hypot(person.x - lizard.x, person.y - lizard.y) < 180 && Math.abs(lizard.x - p.x) < 650) : null;
        person.fleeing = Boolean(predator);
        let dx, dy, speed;
        if (predator) { dx = person.x - predator.x; dy = person.y - predator.y; speed = 48; }
        else {
          if (Math.hypot(p.x - person.x, p.y - person.y) < 430) person.recruited = true;
          if (person.recruited) {
            const offset = 55 + index % 4 * 27, tx = p.x - p.dir * offset, ty = Math.max(360, Math.min(710, p.y + (index % 3 - 1) * 48));
            dx = tx - person.x; dy = ty - person.y; speed = Math.hypot(dx, dy) < 18 ? 0 : Math.min(235, 135 + Math.hypot(dx, dy) * .16);
          } else { const angle = state.time * .4 + person.phase; dx = Math.cos(angle); dy = Math.sin(angle); speed = 16; }
        }
        const length = Math.hypot(dx, dy) || 1;
        person.dir = dx >= 0 ? 1 : -1; moveHunter(person, dx / length * Math.min(speed * dt, length), dy / length * Math.min(speed * dt, length));
      });
    }
    function update(dt) {
      if (state.paused || !Number.isFinite(dt) || dt <= 0) return;
      dt = Math.min(dt, .05);
      state.time += dt; state.elapsed += dt; state.noticeTime = Math.max(0, state.noticeTime - dt);
      if (state.stage === "title") { if (state.elapsed >= 6) stage("city"); return; }
      if (state.stage === "wardrobeHome") { if (state.elapsed >= 3) stage("wardrobeBreach"); return; }
      if (state.stage === "wardrobeBreach") { if (state.elapsed >= 3) stage("wardrobe"); return; }
      if (state.stage === "wardrobeCured") { if (state.elapsed >= 2.8) { buildField(); stage("fieldGate"); } return; }
      if (state.stage === "fieldGate") { if (state.elapsed >= 2.8) stage("field"); return; }
      if (state.stage === "mindGate") { if (state.elapsed >= 2.8) stage("mind"); return; }
      if (state.stage === "contestGate") { if (state.elapsed >= 2.8) stage("contestants"); return; }
      if (state.stage === "volcanoGate") { if (state.elapsed >= 2.8) stage("volcano"); return; }
      if (state.stage === "colosseumGate") { if (state.elapsed >= 2.8) stage("romanAccusation"); return; }
      if (state.stage === "romanThanks") { if (state.elapsed >= 2.2) stage("romanExit"); return; }
      if (state.stage === "romanPortal") { if (state.elapsed >= 2.5) { buildSeaOfMemories(); stage("seaGate"); } return; }
      if (state.stage === "seaGate") { if (state.elapsed >= 2.8) stage("sea"); return; }
      if (state.stage === "powerlessGate") { if (state.elapsed >= 2.8) stage("powerless"); return; }
      if (state.stage === "rainforestGate") { if (state.elapsed >= 2.8) stage("rainforest"); return; }
      if (state.stage === "shadowGate") { if (state.elapsed >= 2.8) stage("shadow"); return; }
      if (state.stage === "powerlessReturn") { if (state.elapsed >= 2) stage("repairOffer"); return; }
      if (state.stage === "watchRepair") { if (state.elapsed >= 3) { state.watchRepaired = true; state.jamDiscovered = false; stage("repairedHome"); } return; }
      if (state.stage === "defiance") { if (state.elapsed >= 1.5) { buildContestants(true); stage("guardianDoor"); } return; }
      if (state.stage === "guardianDoor") { if (state.elapsed >= 2) stage("arena"); return; }
      if (state.stage === "computerExplosion") {
        if (state.elapsed >= 2.8) { state.computer.destroyed = true; state.portalOpen = true; state.vial = { x: 3510, y: 625 }; stage("thoughtExit"); }
        return;
      }
      if (state.stage === "homeArrival") { if (state.elapsed >= 2.4) stage("homeDialogue"); return; }
      if (state.stage === "homeReply") { if (state.elapsed >= 1.2) stage("homePortal"); return; }
      if (!["portal", "homePortal", "rainforestPortal", ...playingStages].includes(state.stage)) return;
      const p = state.player, city = playingStages.includes(state.stage) && state.stage !== "repairedHome";
      let dx = Number(keys.has("ArrowRight") || keys.has("d")) - Number(keys.has("ArrowLeft") || keys.has("a"));
      let dy = Number(keys.has("ArrowDown") || keys.has("s")) - Number(keys.has("ArrowUp") || keys.has("w"));
      const effect = state.stage === "mind" ? state.effect : null;
      if (effect) {
        effect.elapsed += Math.min(dt, effect.remaining);
        if (effect.kind === "reverse") { dx *= -1; dy *= -1; }
        if (effect.kind === "freeze") { dx = 0; dy = 0; }
        if (effect.kind === "wander" || effect.kind === "dance") {
          const angle = effect.angle + (effect.kind === "dance" ? effect.elapsed * 7 : Math.floor(effect.elapsed / .5) * Math.PI / 2);
          dx = Math.cos(angle); dy = Math.sin(angle);
        }
      }
      const magnitude = Math.hypot(dx, dy); if (magnitude) { dx /= magnitude; dy /= magnitude; }
      p.moving = magnitude > 0; if (dx) p.dir = Math.sign(dx);
      const speed = (state.happy > 0 ? (state.tiny ? 270 : 360) : state.tiny ? 130 : 195) * (state.stage === "sea" ? .85 : 1);
      move(p, dx * speed * dt, dy * speed * dt, city);
      if (effect) { effect.remaining = Math.max(0, effect.remaining - dt); if (effect.remaining < 1e-9) state.effect = null; }
      if (state.stage === "repairedHome") { updateRepairedWatch(dt); return; }
      if (!city) {
        if (Math.hypot(p.x - 785, p.y - 425) < 60) {
          if (state.stage === "rainforestPortal") { buildRainforest(); stage("rainforestGate"); }
          else if (state.stage === "homePortal") { buildMindDimension(); stage("mindGate"); }
          else { stage("sapphire"); state.notice = ""; state.noticeTime = 0; }
        }
        return;
      }
      state.hurt = Math.max(0, state.hurt - dt);
      if (state.stage === "shadow") { updateShadowDimension(dt); return; }
      if (state.stage === "rainforest") { updateRainforest(dt); return; }
      if (state.stage === "powerless") { updatePowerless(dt); return; }
      if (state.stage === "colosseum") { updateColosseum(dt); return; }
      if (state.stage === "romanExit") { if (Math.hypot(p.x - state.finishX, p.y - 535) < 55) { choosePortal(); stage("romanPortal"); } return; }
      if (state.stage === "sea") { updateSeaOfMemories(dt); return; }
      if (state.stage === "volcano") { updateVolcano(dt); return; }
      if (state.stage === "contestants" || state.stage === "arena") { updatePeople(dt); updateGuardians(dt); return; }
      if (state.stage === "thoughtExit") {
        updatePeople(dt);
        if (!state.secondVialCollected && Math.hypot(p.x - state.vial.x, p.y - state.vial.y) < 38) {
          state.secondVialCollected = true; state.thoughtVialCollected = true; say("Another thought vial! Now step into the thought portal.");
        }
        if (Math.hypot(p.x - 3650, p.y - 535) < 55) {
          if (state.secondVialCollected) { buildVolcano(); stage("volcanoGate"); } else say("Pick up the thought vial on the plinth before entering the thought portal.");
        }
        return;
      }
      if (state.stage === "wardrobe") { updateWardrobeTown(dt); return; }
      if (state.stage === "field") {
        updatePeople(dt);
        for (const lizard of state.lizards) {
          lizard.bite = Math.max(0, lizard.bite - dt); lizard.eating = Math.max(0, lizard.eating - dt);
          if (Math.abs(lizard.x - p.x) > 650) continue;
          const targets = state.people.filter(person => person.alive);
          if (!state.tiny || Math.hypot(p.x - lizard.x, p.y - lizard.y) < 85) targets.push(p);
          const target = targets.filter(actor => Math.hypot(actor.x - lizard.x, actor.y - lizard.y) < 420).sort((a, b) => Math.hypot(a.x - lizard.x, a.y - lizard.y) - Math.hypot(b.x - lizard.x, b.y - lizard.y))[0];
          lizard.hunting = Boolean(target);
          if (target && lizard.eating <= 0) {
            const dx = target.x - lizard.x, dy = target.y - lizard.y, length = Math.hypot(dx, dy) || 1;
            lizard.dir = dx >= 0 ? 1 : -1;
            moveHunter(lizard, dx / length * lizard.speed * dt, dy / length * lizard.speed * dt);
          }
          for (const person of state.people) if (person.alive && overlaps(bounds(lizard), bounds(person))) { person.alive = false; lizard.eating = 1.3; }
          if (overlaps(bounds(lizard), bounds(p)) && lizard.bite <= 0 && state.hurt <= 0) {
            damage(); lizard.bite = 1.5; lizard.eating = .6;
            moveHunter(lizard, p.x >= lizard.x ? -50 : 50, 0);
          }
        }
        if (state.stage === "field" && p.x >= state.finishX && p.y >= 440 && p.y <= 655) arriveHome();
        return;
      }
      if (state.stage === "mind") {
        state.mindGuard = Math.max(0, state.mindGuard - dt);
        const machine = state.machine, dx = p.x - machine.x, dy = p.y - p.h / 2 - (machine.y - 60), distance = Math.hypot(dx, dy) || 1;
        machine.angle = Math.atan2(dy, dx);
        if (distance < 1100) {
          machine.cooldown -= dt;
          if (machine.cooldown <= 0) {
            state.lasers.push({ x: machine.x, y: machine.y - 60, vx: dx / distance * 270, vy: dy / distance * 270, life: 5, thought: true });
            machine.cooldown = 1.5;
          }
        }
      }
      for (const robot of state.robots) {
        const distance = Math.hypot(p.x - robot.x, p.y - 20 - robot.y);
        robot.alert = !state.tiny && distance < 350;
        if (robot.alert) {
          const targetX = Math.max(robot.homeX - 145, Math.min(robot.homeX + 145, p.x));
          move(robot, Math.sign(targetX - robot.x) * Math.min(Math.abs(targetX - robot.x), 65 * dt), 0);
          robot.cooldown -= dt;
          const length = Math.max(1, distance);
          robot.aimX = (p.x - robot.x) / length; robot.aimY = (p.y - p.h / 2 - (robot.y - 22)) / length;
          if (robot.cooldown <= 0) {
            const aimLength = Math.hypot(robot.aimX, robot.aimY) || 1;
            state.lasers.push({ x: robot.x, y: robot.y - 22, vx: robot.aimX / aimLength * 310, vy: robot.aimY / aimLength * 310, life: 2.2 });
            robot.cooldown = 1.5;
          }
        } else {
          if (robot.x <= robot.homeX - 80) robot.dir = 1;
          if (robot.x >= robot.homeX + 80) robot.dir = -1;
          const before = robot.x;
          move(robot, robot.dir * 35 * dt, 0);
          if (before === robot.x) robot.dir *= -1;
          robot.cooldown = Math.max(robot.cooldown, .6);
        }
        if (overlaps(bounds(p), bounds(robot))) damage();
      }
      for (const laser of state.lasers) {
        // Small substeps prevent fast beams from skipping a tiny player's hitbox.
        const steps = Math.ceil(Math.hypot(laser.vx, laser.vy) * dt / 4);
        for (let step = 0; step < steps && laser.life > 0; step++) {
          laser.x += laser.vx * dt / steps; laser.y += laser.vy * dt / steps;
          const box = { x: laser.x - 4, y: laser.y - 4, w: 8, h: 8 };
          if (state.obstacles.some(obstacle => !(laser.thought && obstacle.kind === "machine") && overlaps(box, obstacle))) laser.life = 0;
          else if (overlaps(box, bounds(p))) { if (laser.thought) applyMindEffect(); else damage(); laser.life = 0; }
        }
        laser.life -= dt;
      }
      state.lasers = state.lasers.filter(laser => laser.life > 0);
      if (state.stage === "city" && p.x >= state.finishX) { buildWardrobeDimension(); stage("wardrobeHome"); }
      if (state.stage === "mind" && Math.hypot(p.x - state.vial.x, p.y - state.vial.y) < 42) {
        returnWithVial();
      }
    }
    restart();
    return { state, keys, advance, acceptQuest, declineQuest, restart, retryCity, retryLevel, skipLevel, shootZap, toggleShrink, togglePause, update };
  }
  globalThis.ZapmanAdventure = { create, palettes };
})();
