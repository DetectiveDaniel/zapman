(() => {
  "use strict";
  const canvas = document.querySelector("#game"), ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  let storage;
  try { storage = localStorage; } catch { /* The adventure also works without saved settings. */ }
  const game = ZapmanAdventure.create({ storage }), s = game.state;
  const W = canvas.width, H = canvas.height;
  const ui = Object.fromEntries(["chapter", "mission", "speaker", "story", "actions", "cityHud", "hearts", "sizeState", "distance", "pause", "paused", "resume", "replay", "touchAction", "shrink", "zap", "skipLevel"].map(id => [id, document.querySelector(`#${id}`)]));
  const ink = "#15243b", cream = "#f7f0d5", gold = "#f8d458";
  const playingStages = ["city", "wardrobe", "field", "mind", "contestants", "arena", "thoughtExit", "volcano", "colosseum", "romanExit", "sea", "powerless", "repairedHome", "rainforest", "shadow", "lastStand", "waistlanders"];
  const dimensionCodes = ["", "0012", "0001", "3604", "0984", "3564", "6493"];
  const dimension = () => s.level === 2 ? "Dimension 0001 · Earth" : s.level === 7 ? "The Hysterics" : s.level === 8 ? "The Sea of Memories" : s.level === 9 ? "Powerless" : s.level === 10 ? "Cries of the Parasings" : s.level === 11 ? "The Shadow Dimension" : s.level === 13 ? "The Waistlanders" : s.level === 12 ? "The Last Stand" : `Dimension ${dimensionCodes[s.level]}`;
  let camera = { x: 0, y: 0 }, lastTime = null, uiKey = "";
  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  function label(text, x, y, size = 14, color = cream, align = "left") {
    ctx.fillStyle = color; ctx.font = `bold ${size}px "Courier New", monospace`; ctx.textAlign = align; ctx.fillText(text, x, y); ctx.textAlign = "left";
  }
  function shadow(x, y, w = 34) { rect(x - w / 2, y - 3, w, 7, "#101d3533"); }
  function hero(x, y, scale = 1, dir = 1, moving = false, empty = false, smiling = false) {
    const step = moving ? Math.sin(s.time * 14) * 2 : 0;
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(scale * dir, scale);
    shadow(0, 0, 32);
    // Original pixel character: brown hair, white shirt, red tie and briefcase.
    rect(-9, -46, 17, 3, "#10151c"); rect(-12, -43, 24, 14, "#10151c");
    rect(-9, -43, 18, 12, "#624734"); rect(-7, -40, 15, 16, "#ffe2ab");
    rect(-10, -40, 6, 6, "#624734"); rect(7, -38, 3, 13, "#463225");
    rect(-5, -34, 2, 3, "#10151c"); rect(3, -34, 2, 3, "#10151c"); rect(-3, -28, 7, 2, "#624734");
    if (smiling) { rect(-4, -28, 2, 2, "#624734"); rect(3, -28, 2, 2, "#624734"); rect(-2, -26, 5, 2, "#624734"); }
    if (empty) { rect(-5, -26, 2, 2, ink); rect(3, -26, 2, 2, ink); rect(-2, -28, 5, 2, ink); rect(-7, -36, 4, 1, ink); rect(3, -36, 4, 1, ink); }
    rect(-11, -24, 22, 16, "#10151c"); rect(-8, -23, 16, 12, empty ? "#985bd1" : "#faf3de");
    rect(-3, -24, 6, 4, "#ccc9bd"); rect(-1, -22, 3, 10, "#be3f4b"); rect(-2, -13, 5, 2, "#be3f4b");
    rect(-14, -23, 5, 12, "#10151c"); rect(-13, -22, 4, 9, empty ? "#985bd1" : "#faf3de"); rect(-14, -13, 5, 4, "#ffe2ab");
    rect(9, -23, 5, 13, "#10151c"); rect(9, -22, 4, 9, empty ? "#985bd1" : "#faf3de"); rect(10, -14, 5, 5, "#ffe2ab");
    rect(-8, -10, 7, 10 + step, "#232b32"); rect(2, -10, 7, 10 - step, "#232b32");
    rect(-10, -1 + step, 9, 4, "#10151c"); rect(2, -1 - step, 10, 4, "#10151c");
    rect(13, -12, 9, 3, "#10151c"); rect(11, -9, 16, 13, "#10151c"); rect(13, -7, 12, 9, "#3a484b"); rect(17, -9, 3, 3, "#cbbd8c");
    if (s.stage === "city" || s.stage === "title") rect(-15, -18, 4, 4, gold);
    ctx.restore();
  }
  function sapphire(x, y, scale = 2) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); shadow(0, 0, 35);
    rect(-9, -47, 18, 3, ink); rect(-13, -44, 26, 9, ink); rect(-16, -35, 32, 24, ink);
    rect(-9, -44, 18, 8, "#f9d38c"); rect(-13, -36, 26, 22, "#e4ac63");
    rect(-7, -38, 16, 16, "#ffe4b8"); rect(-8, -38, 6, 5, "#f9d38c"); rect(3, -38, 8, 4, "#f9d38c");
    rect(-5, -32, 3, 3, ink); rect(4, -32, 3, 3, ink); rect(0, -26, 4, 2, "#d78282");
    rect(-13, -23, 26, 16, "#171e2a"); rect(-5, -21, 11, 9, "#f4efde");
    rect(-18, -21, 6, 12, "#171e2a"); rect(12, -21, 6, 12, "#171e2a");
    rect(-17, -12, 5, 5, "#ffe4b8"); rect(13, -12, 5, 5, "#ffe4b8");
    rect(-10, -9, 9, 10, "#539cc3"); rect(2, -9, 9, 10, "#539cc3");
    rect(-12, -1, 11, 4, "#493d35"); rect(2, -1, 12, 4, "#493d35");
    rect(-10, -7, 3, 6, "#79c8db"); rect(0, -18, 4, 4, "#5edbdf");
    ctx.restore();
  }
  function watch(x, y, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    rect(-17, -62, 34, 124, "#425367"); rect(-13, -61, 26, 122, "#8d9f9e");
    for (let row = 0; row < 14; row++) for (let col = 0; col < 3; col++) rect(-12 + col * 8, -58 + row * 8, 7, 7, [gold, "#67d9c9", "#d96a72", "#6586ad"][(row + col * 2) % 4]);
    rect(-38, -38, 76, 76, ink); rect(-35, -35, 70, 70, "#91a3aa"); rect(-32, -32, 64, 5, "#e7eee5");
    rect(-29, -25, 58, 54, "#273b50");
    for (let row = 0; row < 6; row++) for (let col = 0; col < 6; col++) rect(-25 + col * 8, -21 + row * 8, 7, 7, ["#5aced2", "#3d5e79", "#e2777d", gold, "#8bbf90"][(row * 3 + col * 2) % 5]);
    rect(38, -8, 9, 16, ink); rect(39, -6, 6, 12, gold); rect(-28, 30, 57, 3, "#4b6475");
    ctx.restore();
  }
  function portal(x, y, color, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = "#0c173e"; ctx.beginPath(); ctx.ellipse(0, -76, 44, 80, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#19346a"; ctx.beginPath(); ctx.ellipse(0, -76, 29, 64, .06, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 64; i++) {
      const angle = i / 64 * Math.PI * 2, pulse = Math.sin(i * 1.6 + s.time * 5) * 3;
      const px = Math.cos(angle) * (44 + pulse), py = -76 + Math.sin(angle) * (80 + pulse);
      rect(px - 4, py - 4, 8, 8, color);
      if (i % 3 === 0) rect(px + Math.cos(angle) * 7, py + Math.sin(angle) * 7, 4, 4, "#c7f8ef");
    }
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * Math.PI * 2 + s.time * .7;
      rect(Math.cos(a) * (12 + i % 3 * 7), -76 + Math.sin(a) * (25 + i % 4 * 9), 3, 5, color);
      const drift = (i * 37 + s.time * 18) % 70;
      rect(Math.cos(a) * (54 + drift / 3), -76 + Math.sin(a) * (85 + drift / 2), 3, 3, color);
    }
    ctx.restore();
  }
  function tree(x, y, size = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size, size); shadow(0, 0, 60);
    rect(-6, -35, 12, 40, "#63524a"); rect(-23, -66, 46, 38, "#285c60"); rect(-32, -56, 64, 23, "#285c60");
    rect(-20, -70, 40, 35, "#417d70"); rect(-27, -57, 15, 18, "#5b9880"); rect(-15, -69, 25, 8, "#71ae8b");
    ctx.restore();
  }
  function bench(x, y) {
    rect(x - 31, y - 28, 62, 5, "#d7a875"); rect(x - 31, y - 20, 62, 5, "#d7a875");
    rect(x - 34, y - 10, 68, 8, "#aa794d"); rect(x - 28, y - 2, 5, 12, ink); rect(x + 23, y - 2, 5, 12, ink);
  }
  function prologue(scene = s.stage) {
    rect(0, 0, W, H, "#90b5bb"); rect(0, 310, W, 310, "#6a987f");
    rect(0, 330, W, 215, "#c4c4ae"); rect(0, 340, W, 195, "#e0d8bd");
    for (let x = 0; x < W; x += 64) { rect(x, 340, 1, 195, "#c4c4ae"); rect(x, 437, 64, 1, "#c4c4ae"); }
    for (let i = 0; i < 12; i++) { rect(i * 96 + 7, 210 - i % 3 * 24, 78, 100 + i % 3 * 24, "#759caa"); rect(i * 96 + 14, 221 - i % 3 * 24, 6, 8, "#bcd1ce"); }
    tree(105, 320, 1.65); tree(875, 315, 1.7); tree(340, 315, 1.25); bench(450, 317);
    for (let i = 0; i < 24; i++) { rect(i * 47 + 10, 569 + i % 3 * 15, 6, 5, ["#eab993", "#ecd984", "#dcd9bd"][i % 3]); }
    label("AN ORDINARY DAY.", 52, 85, 13, ink); label("UNTIL NOW.", 52, 118, 26, ink);
    if (scene === "watch") {
      hero(240, 441, 2); watch(530, 410, .7);
      rect(480, 486, 102, 24, "#273e56"); label("A STRANGE WATCH", 531, 502, 10, cream, "center");
    } else if (scene === "bag") {
      hero(255, 444, 2); watch(580, 394, 1.1);
      label("WHAT DOES THIS BUTTON DO?", 580, 510, 14, ink, "center");
      rect(637, 379, 20, 2, ink); rect(655, 360, 2, 21, ink); label("PRESS", 660, 354, 12, ink);
    } else if (scene === "sapphire") {
      rect(0, 0, W, 210, "#294a63");
      for (let i = 0; i < 36; i++) rect((i * 167 + 31) % W, 20 + i * 43 % 160, 3, 3, "#96c5c9");
      portal(170, 449, s.portalColor, 1.25); hero(385, 452, 2); sapphire(650, 452, 2);
      label("THE OTHER SIDE", 500, 107, 15, "#b6e6df", "center");
      rect(591, 320, 120, 28, ink); label("SAPPHIRE", 650, 340, 16, cream, "center");
    } else {
      portal(785, 443, s.portalColor, 1.25); hero(s.player.x, s.player.y, 1.5, s.player.dir, s.player.moving);
      label("WALK INTO THE PORTAL →", 650, 540, 14, ink, "center");
    }
  }
  function building(x, y, w, h, index, lower = false) {
    const colors = ["#506280", "#7d6d8e", "#496b7b", "#9d7a78", "#516c87"];
    rect(x + 10, y + 15, w, h, "#10223e44"); rect(x, y, w, h, ink); rect(x + 4, y + 4, w - 8, h - 8, colors[index % colors.length]);
    rect(x + 4, y + 4, w - 8, 9, "#b6b6b1"); rect(x + w - 12, y + 13, 8, h - 17, "#273e56");
    for (let wy = y + 28; wy < y + h - 40; wy += 37) for (let wx = x + 18; wx < x + w - 25; wx += 31) {
      rect(wx, wy, 16, 22, ink); rect(wx + 2, wy + 2, 12, 15, (Math.floor(wx / 31 + wy / 37) + index) % 4 ? "#79b7bd" : "#f1ca85"); rect(wx + 2, wy + 2, 3, 15, "#b6ded3");
    }
    const doorY = lower ? y + 14 : y + h - 30;
    rect(x + w / 2 - 14, doorY, 28, 26, ink); rect(x + w / 2 - 10, doorY + 3, 18, 21, "#659ba7");
    if (!lower) { rect(x + 12, y + h - 55, w - 24, 18, "#273e56"); label(["NOVA CAFE", "THE ARCADE", "WATCH REPAIR", "PIXEL PLAZA", "SAPPHIRE CO."][index % 5], x + w / 2, y + h - 42, 10, cream, "center"); }
  }
  function robot(bot) {
    const x = bot.x, y = bot.y, bob = Math.floor(Math.sin(s.time * 7 + bot.homeX) * 2), light = bot.alert ? "#ff7b6b" : "#8bd4d2";
    shadow(x, y, 42); rect(x - 14, y - 11, 10, 12, "#293e54"); rect(x + 5, y - 11, 10, 12, "#293e54");
    rect(x - 19, y - 37 + bob, 38, 28, ink); rect(x - 16, y - 35 + bob, 32, 22, "#718e9e");
    rect(x - 13, y - 32 + bob, 26, 5, "#a7c1c4"); rect(x - 8, y - 24 + bob, 16, 9, "#314b65"); rect(x - 5, y - 22 + bob, 10, 4, light);
    rect(x - 14, y - 51 + bob, 28, 19, ink); rect(x - 11, y - 48 + bob, 22, 13, "#aec0c4"); rect(x - 10, y - 43 + bob, 20, 6, "#263e58");
    rect(x - 8, y - 42 + bob, 6, 3, light); rect(x + 3, y - 42 + bob, 6, 3, light);
    rect(x - 2, y - 58 + bob, 4, 8, ink); rect(x - 4, y - 60 + bob, 8, 4, light);
    rect(x - 25, y - 32 + bob, 7, 20, "#405e76"); rect(x + 18, y - 32 + bob, 7, 20, "#405e76");
    if (bot.alert) {
      label("!", x, y - 71, 20, "#ffb083", "center");
      if (bot.cooldown < .35) {
        ctx.strokeStyle = "#ff8d7977"; ctx.lineWidth = 2; ctx.setLineDash([6, 9]); ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(s.player.x, s.player.y - s.player.h / 2); ctx.stroke(); ctx.setLineDash([]);
      }
    }
  }
  function city() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#425a70"); rect(0, 305, s.width, 420, "#b7b9ae");
    rect(0, 350, s.width, 325, "#33465c"); rect(0, 350, s.width, 6, "#f1e6b9"); rect(0, 669, s.width, 6, "#f1e6b9");
    for (let x = Math.floor(camera.x / 80) * 80; x < camera.x + W + 80; x += 80) {
      rect(x, 305, 1, 45, "#8f9c9f"); rect(x, 675, 1, 50, "#8f9c9f"); rect(x + 8, 504, 42, 4, "#e4ca86"); rect(x + 8, 514, 42, 4, "#e4ca86");
      if (x % 240 === 0) { rect(x + 12, 392, 32, 2, "#41566b"); rect(x + 25, 612, 18, 2, "#41566b"); }
    }
    for (let i = 0; i < 18; i++) {
      const x = 30 + i * 250;
      if (x + 220 < camera.x || x > camera.x + W) continue;
      building(x, 30 + i % 3 * 20, 210, 255 - i % 3 * 20, i);
      building(x + 20, 754, 200, 185, i + 2, true);
      tree(x + 230, 330, .7); tree(x + 100, 740, .65);
      rect(x + 130, 318, 4, 20, "#3e5061"); rect(x + 117, 315, 29, 4, "#e7dcb3");
    }
    // A peaceful arrival plaza, separated from the first robot by several blocks.
    rect(45, 365, 310, 280, "#839d8e"); rect(54, 374, 292, 262, "#9ab19c");
    for (let i = 0; i < 4; i++) rect(64 + i * 70, 374, 2, 262, "#88a28e");
    tree(95, 423, .75); tree(307, 620, .75); bench(282, 425); portal(105, 535, s.portalColor, .55);
    label("ARRIVAL GARDEN", 200, 604, 13, ink, "center");
    for (let x = 700; x < s.finishX; x += 950) {
      for (let y = 365; y < 655; y += 35) rect(x, y, 60, 16, "#bfceca");
      rect(x - 8, 318, 5, 26, ink); rect(x - 13, 306, 15, 22, ink); rect(x - 10, 310, 9, 7, "#87d5c3");
    }
    for (const box of s.obstacles) {
      rect(box.x + 6, box.y + 6, box.w, box.h, "#16243c55"); rect(box.x, box.y, box.w, box.h, "#5e7073"); rect(box.x + 4, box.y + 4, box.w - 8, box.h - 8, "#a6ada1");
      rect(box.x + 10, box.y + 10, box.w - 20, box.h - 20, "#3d7970");
      for (let i = 0; i < 8; i++) rect(box.x + 16 + i * 37 % (box.w - 35), box.y + 15 + i * 19 % (box.h - 30), 12, 9, i % 3 ? "#70a58b" : "#ead78a");
    }
    // Large visible chequered finish, spanning the entire walkable street.
    rect(s.finishX - 8, 305, 32, 420, cream);
    for (let row = 0; row < 28; row++) for (let col = 0; col < 2; col++) if ((row + col) % 2 === 0) rect(s.finishX - 8 + col * 16, 305 + row * 15, 16, 15, ink);
    rect(s.finishX - 92, 268, 190, 30, ink); label("SHADOW PORTAL", s.finishX + 3, 289, 15, gold, "center");
    portal(s.finishX + 145, 537, s.portalColor, 1.1);
    const actors = s.robots.map(bot => ({ y: bot.y, draw: () => robot(bot) }));
    actors.push({ y: s.player.y, draw: () => {
      if (s.tiny) { ctx.strokeStyle = "#bef2df"; ctx.lineWidth = 2; ctx.strokeRect(Math.round(s.player.x - 12), Math.round(s.player.y - 24), 25, 31); label("YOU", s.player.x, s.player.y - 31, 10, "#bef2df", "center"); }
      if (s.hurt > 0 && Math.floor(s.time * 15) % 2 === 0) return;
      hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
    } });
    actors.sort((a, b) => a.y - b.y).forEach(actor => actor.draw());
    for (const laser of s.lasers) {
      const angle = Math.atan2(laser.vy, laser.vx);
      ctx.save(); ctx.translate(laser.x, laser.y); ctx.rotate(angle);
      rect(-15, -4, 27, 8, "#ed6e6966"); rect(-12, -2, 24, 4, "#ff8c7e"); rect(-8, -1, 18, 2, "#fff2c2"); ctx.restore();
    }
    ctx.restore();
    // Small chapter marker in the scene leaves room for the HTML health controls.
    rect(22, H - 45, 300, 27, "#15243be8"); label(`${dimension().toUpperCase()} · THE CITY`, 34, H - 27, 11, "#b9ddd5");
  }
  function scorpion(actor) {
    ctx.save(); ctx.translate(actor.x, actor.y); ctx.scale(actor.dir, 1);
    const step = Math.sin(s.townTime * 18) * 2;
    for (let i = 0; i < 3; i++) { rect(-8 + i * 7, -3, 3, 6 + (i % 2 ? step : -step), "#744933"); rect(-8 + i * 7, -15, 3, 5, "#744933"); }
    rect(-11, -13, 22, 12, "#b77b3e"); rect(-7, -12, 16, 4, "#e7b354");
    rect(9, -15, 11, 4, "#c99444"); rect(17, -19, 4, 5, "#ecd17f"); rect(10, -4, 11, 4, "#c99444"); rect(18, -4, 4, 6, "#ecd17f");
    rect(-17, -17, 6, 12, "#926438"); rect(-20, -25, 6, 11, "#b77b3e"); rect(-18, -29, 12, 5, "#e7b354"); rect(-9, -26, 4, 7, "#6e397d");
    rect(6, -11, 3, 3, ink);
    if (actor.flight > 0) rect(-27, -8, 7, 3, "#e4bc7399");
    ctx.restore();
  }
  function antidote(x, y) {
    rect(x - 12, y - 46, 24, 7, ink); rect(x - 8, y - 51, 16, 6, "#e5c78a");
    rect(x - 16, y - 39, 32, 36, "#d5f3e1"); rect(x - 12, y - 32, 24, 25, "#53c991");
    rect(x - 3, y - 29, 6, 17, cream); rect(x - 8, y - 24, 16, 6, cream); rect(x - 13, y - 37, 3, 16, "#f4ffe9");
  }
  function wardrobeHome() {
    rect(0, 0, W, H, "#dfcba9"); rect(0, 320, W, 300, "#b28163");
    for (let y = 330; y < H; y += 38) { rect(0, y, W, 2, "#92684f"); for (let x = y % 76 ? 0 : 100; x < W; x += 200) rect(x, y, 2, 38, "#92684f"); }
    rect(76, 130, 190, 142, ink); rect(84, 138, 174, 126, "#9bd0d2"); rect(168, 138, 7, 126, cream); rect(84, 196, 174, 7, cream);
    rect(65, 332, 215, 74, "#658a83"); rect(80, 315, 185, 65, "#86a79a"); rect(55, 362, 30, 58, "#517568"); rect(255, 362, 30, 58, "#517568");
    rect(635, 125, 240, 330, "#503c43"); rect(643, 133, 224, 314, "#8f6755"); rect(654, 147, 201, 282, "#17253b");
    const opening = Math.min(1, Math.max(0, (s.elapsed - .25) / 1.2));
    ctx.save(); ctx.beginPath(); ctx.rect(654, 147, 201, 282); ctx.clip();
    portal(755, 427, s.portalColor, opening * 1.55);
    if (s.elapsed > 1.5) robot({ x: 755, y: 410, homeX: 755, alert: false });
    ctx.restore();
    rect(644, 138, 28, 301, "#a97f61"); rect(852, 138, 16, 301, "#a97f61"); rect(649, 431, 211, 12, "#d1aa7f");
    rect(666, 439, 15, 31, "#503c43"); rect(835, 439, 15, 31, "#503c43");
    const leaving = Math.max(0, s.elapsed - 1.7);
    hero(440 - leaving * 180, 505, 2, -1, leaving > 0);
    label(`LEVEL TWO · ${dimension().toUpperCase()}`, 500, 58, 15, ink, "center"); label("THE RIP IN THE WARDROBE", 500, 97, 27, ink, "center");
    label(s.elapsed < 1.5 ? "A portal tears open inside your wardrobe..." : "Robots! Get outside!", 500, 571, 18, cream, "center");
  }
  function wardrobeTown() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#a7d6ce"); rect(0, 300, s.width, 430, "#788d89");
    for (let x = Math.floor(camera.x / 90) * 90; x < camera.x + W + 90; x += 90) {
      rect(x + 4, 310, 82, 26, "#e3ceb0"); rect(x + 4, 690, 82, 28, "#e3ceb0"); rect(x + 18, 515, 43, 4, "#ead6a8");
    }
    house(160, 285, 1.3);
    for (let i = 0; i < 7; i++) {
      const x = 680 + i * 420;
      rect(x - 90, 115, 180, 175, ["#c69a85", "#a6b6bd", "#c3b28b"][i % 3]); rect(x - 99, 105, 198, 15, "#826d69");
      for (const side of [-1, 1]) { rect(x + side * 49 - 19, 150, 38, 48, ink); rect(x + side * 49 - 15, 154, 30, 40, "#8cc8c7"); }
      rect(x - 20, 218, 40, 72, "#596f73"); rect(x + 7, 250, 4, 4, gold);
    }
    if (s.stage === "wardrobeBreach") {
      const t = s.elapsed, progress = Math.min(1, Math.max(0, (t - 1.2) / 1.7));
      if (t < 1.3) { rect(138 + Math.sin(t * 35) * 3, 199, 44, 91, "#9b6657"); label("BANG!", 160, 173, 17, "#784245", "center"); }
      else {
        rect(132, 199, 56, 91, "#1c2b3f");
        for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(140 + i * 18 + progress * (i * 12 - 20), 290 + progress * 110 + Math.sin(i) * 18); ctx.rotate(progress * (i - 2)); rect(-4, -16, 9, 34, "#a16b55"); ctx.restore(); }
        robot({ x: 160 + progress * 490, y: 295 + progress * 120, homeX: 160, alert: false });
        robot({ x: 160 + progress * 400, y: 270 + progress * 190, homeX: 200, alert: false });
      }
    } else { rect(132, 199, 56, 91, "#233544"); rect(115, 298, 48, 9, "#a16b55"); rect(172, 316, 12, 29, "#a16b55"); }
    for (const wall of s.obstacles) {
      rect(wall.x, wall.y, wall.w, wall.h, "#526f63"); rect(wall.x + 4, wall.y + 4, wall.w - 8, wall.h - 8, "#94aa7b");
      for (let i = 0; i < 3; i++) { rect(wall.x + 14 + i * 26, wall.y + 20, 5, 22, "#527e60"); rect(wall.x + 9 + i * 26, wall.y + 14, 15, 10, "#e1a18a"); }
    }
    rect(s.finishX - 75, 180, 150, 110, "#f0e3c5"); rect(s.finishX - 13, 200, 26, 65, "#53a982"); rect(s.finishX - 32, 219, 64, 24, "#53a982");
    label("ANTIDOTE →", s.finishX, 310, 15, ink, "center");
    if (!s.antidoteCollected) { rect(s.finishX - 28, 535, 56, 14, "#445e61"); antidote(s.finishX, 530 + Math.sin(s.time * 3) * 3); }
    const actors = s.robots.map(bot => ({ y: bot.y, draw: () => { robot({ ...bot, alert: false }); rect(bot.x + bot.dir * 21 - 8, bot.y - 29, 16, 9, "#d1a05f"); } }));
    s.people.forEach(person => actors.push({ y: person.y, draw: () => drawPerson(person) }));
    s.scorpions.forEach(actor => actors.push({ y: actor.y, draw: () => scorpion(actor) }));
    actors.push({ y: s.player.y, draw: () => {
      if (s.playerPeopleRobot) drawPerson({ x: s.player.x, y: s.player.y, peopleRobot: true, changeTime: 0 });
      else if (!(s.hurt > 0 && s.stage === "wardrobe" && Math.floor(s.time * 15) % 2 === 0)) hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
    } });
    actors.sort((a, b) => a.y - b.y).forEach(actor => actor.draw());
    if (s.tiny) label("YOU", s.player.x, s.player.y - 29, 10, cream, "center");
    if (s.stage === "wardrobeCured") { ctx.strokeStyle = "#b9f4c9"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(s.player.x, s.player.y - 20, 40 + s.elapsed * 180, 0, Math.PI * 2); ctx.stroke(); label("ANTIDOTE FOUND! EVERYONE IS HUMAN AGAIN!", camera.x + 500, 370, 21, "#e3ffdb", "center"); }
    ctx.restore(); rect(22, H - 45, 520, 27, "#273d48ed"); label(`${dimension().toUpperCase()} · THE RIP IN THE WARDROBE`, 34, H - 27, 11, "#f3e8c9");
    if (s.stage === "wardrobeBreach") { rect(190, 18, 620, 34, "#233544dd"); label("THE ROBOTS BREAK DOWN YOUR FRONT DOOR!", 500, 41, 18, cream, "center"); }
  }
  function house(x, y, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    rect(-118, -115, 238, 125, "#4d635244"); rect(-112, -120, 224, 125, "#ddc59a");
    rect(-112, -120, 224, 12, "#9e6e57"); rect(-106, -108, 212, 8, "#efdfba");
    for (let i = 0; i < 8; i++) rect(-124 + i * 12, -132 - i * 9, 248 - i * 24, 10, i % 2 ? "#a56353" : "#bc7a61");
    rect(55, -194, 22, 45, "#855a50"); rect(51, -197, 30, 7, "#c18e70");
    for (const side of [-1, 1]) {
      rect(side * 68 - 22, -90, 44, 44, "#725d53"); rect(side * 68 - 18, -86, 36, 36, "#7dc1ca");
      rect(side * 68 - 3, -86, 5, 36, "#eddfbf"); rect(side * 68 - 18, -71, 36, 5, "#eddfbf");
    }
    rect(-22, -66, 44, 71, "#725d53"); rect(-17, -62, 34, 67, "#628a91"); rect(7, -27, 4, 4, gold);
    rect(-32, 2, 64, 9, "#bbac8c"); rect(-39, 10, 78, 6, "#d7c9a7");
    label("HOME", 0, -80, 13, ink, "center"); ctx.restore();
  }
  function practiri(lizard) {
    const chewing = lizard.eating > 0, stride = Math.sin(s.time * 12 + lizard.homeX) * 3;
    ctx.save(); ctx.translate(Math.round(lizard.x), Math.round(lizard.y)); ctx.scale(lizard.dir, 1); shadow(0, 1, 66);
    rect(-33, -19, 15, 6, "#385e3b"); rect(-43, -14, 18, 5, "#385e3b"); rect(-50, -10, 13, 4, "#385e3b");
    rect(-23, -28, 43, 24, ink); rect(-20, -26, 39, 20, "#628b41"); rect(-17, -25, 32, 6, "#96bb58"); rect(-18, -10, 35, 5, "#c1c878");
    rect(-18, -8, 8, 10 + stride, "#406942"); rect(9, -8, 8, 10 - stride, "#406942");
    for (let i = 0; i < 4; i++) rect(-17 + i * 9, -31 - i % 2 * 3, 6, 6, "#d4be63");
    rect(14, -35, 25, 20, ink); rect(17, -32, 21, 15, "#83a748"); rect(33, -26, 22, 11, ink); rect(35, -25, 20, 6, "#a3b961");
    rect(22, -32, 8, 7, "#eedba3"); rect(27, -31, 3, 5, ink);
    const open = chewing || lizard.hunting && Math.sin(s.time * 6) > .3;
    rect(32, -17, 23, open ? 9 : 3, "#382c33"); rect(34, open ? -7 : -13, 21, 4, "#739545");
    if (open) for (let i = 0; i < 4; i++) { rect(34 + i * 5, -17, 3, 4, "#f5e5b7"); rect(35 + i * 5, -9, 2, 3, "#f5e5b7"); }
    ctx.restore();
    if (chewing) { rect(lizard.x - 27, lizard.y - 65, 60, 23, "#f1dfb4"); label("GULP!", lizard.x + 3, lizard.y - 49, 12, ink, "center"); }
  }
  function field() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#56885d"); rect(0, 305, s.width, 420, "#8fb165");
    for (let x = Math.floor(camera.x / 45) * 45; x < camera.x + W + 45; x += 45) {
      for (let y = 310; y < 725; y += 44) {
        const n = Math.abs(x * 7 + y * 13);
        rect(x + n % 30, y + n % 25, 3, 9, "#719c51"); rect(x + n % 30 - 4, y + n % 25 + 3, 3, 5, "#719c51");
        if (n % 7 === 0) { rect(x + 14, y + 9, 5, 5, "#f2dea0"); rect(x + 15, y + 10, 2, 2, "#cba76c"); }
      }
    }
    for (let i = 0; i < 18; i++) { tree(i * 230 + 30, 285, 1 + i % 2 * .2); tree(i * 230 + 100, 820, 1.3); }
    for (const wall of s.obstacles) {
      rect(wall.x + 8, wall.y + 8, wall.w, wall.h, "#2c4b3d55"); rect(wall.x, wall.y, wall.w, wall.h, "#65766b");
      for (let y = wall.y; y < wall.y + wall.h; y += 23) {
        rect(wall.x + 2, y + 2, wall.w - 4, Math.min(20, wall.y + wall.h - y - 2), y % 2 ? "#a0aa8c" : "#8d9b82");
        rect(wall.x + (y % 2 ? 14 : 29), y + 2, 2, Math.min(20, wall.y + wall.h - y - 2), "#65766b");
      }
      rect(wall.x - 3, wall.y - 5, wall.w + 6, 7, "#bcc1a0");
    }
    house(3395, 480, 1); rect(3350, 498, 90, 225, "#c8bd91"); label("YOUR HOUSE →", 3180, 699, 15, ink);
    const actors = s.lizards.map(lizard => ({ y: lizard.y, draw: () => practiri(lizard) }));
    s.people.filter(person => person.alive).forEach(person => actors.push({ y: person.y, draw: () => drawPerson(person) }));
    actors.push({ y: s.player.y, draw: () => {
      if (s.hurt > 0 && s.stage === "field" && Math.floor(s.time * 15) % 2 === 0) return;
      hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
      if (s.tiny) label("YOU", s.player.x, s.player.y - 28, 10, ink, "center");
    } });
    actors.sort((a, b) => a.y - b.y).forEach(actor => actor.draw()); ctx.restore();
    rect(22, H - 45, 350, 27, "#244b3ce8"); label(`${dimension().toUpperCase()} · RISE OF THE PRACTIRI`, 34, H - 27, 11, "#e8e8c5");
  }
  function drawPerson(person) {
    shadow(person.x, person.y, 24); rect(person.x - 8, person.y - 37, 16, 14, "#f0c994"); rect(person.x - 9, person.y - 40, 18, 7, "#695046");
    rect(person.x - 9, person.y - 23, 18, 17, person.peopleRobot ? "#829da8" : person.color); rect(person.x - 8, person.y - 7, 6, 10, ink); rect(person.x + 2, person.y - 7, 6, 10, ink);
    rect(person.x - 5, person.y - 30, 2, 2, ink); rect(person.x + 3, person.y - 30, 2, 2, ink);
    if (person.peopleRobot) {
      rect(person.x, person.y - 36, 9, 14, "#9eb6bb"); rect(person.x + 2, person.y - 31, 6, 3, "#e65e62");
      rect(person.x - 5, person.y - 20, 10, 8, "#2b465c"); rect(person.x - 2, person.y - 18, 5, 4, "#e65e62");
      rect(person.x + 6, person.y - 46, 2, 9, ink); rect(person.x + 4, person.y - 48, 6, 3, "#e65e62");
      if (person.changeTime > 0) label("PEOPLE-ROBOT!", person.x, person.y - 57, 10, "#ffe1bc", "center");
    } else if (person.empty) {
      rect(person.x - 4, person.y - 24, 2, 2, ink); rect(person.x + 2, person.y - 24, 2, 2, ink); rect(person.x - 2, person.y - 26, 4, 2, ink);
      rect(person.x - 6, person.y - 33, 4, 1, ink); rect(person.x + 2, person.y - 33, 4, 1, ink);
      label("…", person.x, person.y - 47, 14, "#cba2ed", "center");
    } else if (person.fleeing) label("!", person.x, person.y - 48, 16, "#fff1bf", "center");
    else if (person.recruited) label("♥", person.x, person.y - 48, 11, "#cfece1", "center");
  }
  function home() {
    const standReturn = ["shadowReturn", "lastStandQuest"].includes(s.stage);
    const repairScene = ["powerlessReturn", "repairOffer", "watchRepair", "repairedHome", "rainforestMission", "rainforestPortal"].includes(s.stage) || s.stage === "won" && s.level === 9 && s.watchRepaired;
    const repairing = s.stage === "watchRepair";
    rect(0, 0, W, H, "#b9d5c2"); rect(0, 265, W, 355, "#88aa70"); rect(0, 330, W, 215, "#d7cbab");
    for (let x = 0; x < W; x += 64) rect(x, 330, 1, 215, "#b9b291");
    house(225, 325, 1.5); tree(85, 560, 1.4); tree(935, 320, 1.4); bench(525, 315);
    label(standReturn ? "BACK WITH SAPPHIRE" : repairScene ? "BACK WITH SAPPHIRE" : "HOME SWEET HOME", 500, 85, 22, ink, "center"); label(standReturn ? "A NEW QUEST: THE LAST STAND" : repairScene ? (s.watchRepaired ? "YOUR WATCH WORKS AGAIN!" : "ONE MORE VIAL. ONE JAMMED WATCH.") : "BUT YOUR ADVENTURE ISN'T OVER.", 500, 116, 12, "#41675b", "center");
    portal(785, 443, s.portalColor, 1.25);
    const emerging = s.stage === "homeArrival", progress = emerging ? Math.min(1, Math.max(0, (s.elapsed - .5) / 1.5)) : 1;
    if (progress > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, progress * 3); sapphire(repairing ? 580 : 785 - progress * 155, 440, 1.7); ctx.restore(); }
    const returning = s.stage === "powerlessReturn" || s.stage === "shadowReturn", returnProgress = Math.min(1, s.elapsed / 1.8);
    const heroX = returning ? 785 - returnProgress * 435 : repairing ? 410 : s.player.x;
    hero(heroX, s.player.y, repairScene && s.tiny ? .55 : s.stage === "homePortal" ? 1.5 : 1.7, s.player.dir, returning || s.player.moving, false, Boolean(repairScene && s.watchRepaired));
    if (repairScene) {
      if (s.stage === "powerlessReturn" || s.stage === "repairOffer") {
        ctx.save(); ctx.translate(heroX + 38, 421); ctx.scale(.65, .65); thoughtVial(0, 0); ctx.restore();
      }
      if (repairing) {
        rect(450, 439, 110, 13, "#674f44"); rect(458, 452, 9, 38, "#674f44"); rect(545, 452, 9, 38, "#674f44");
        watch(500, 417, .43);
        ctx.save(); ctx.translate(526, 393); ctx.rotate(Math.sin(s.elapsed * 9) * .4); rect(-3, -17, 6, 34, "#b5c7cd"); rect(-8, -19, 16, 7, "#728c9c"); ctx.restore();
        for (let i = 0; i < 7; i++) { const a = i * .9 + s.elapsed * 4; rect(500 + Math.cos(a) * 34, 417 + Math.sin(a) * 23, 3, 3, s.elapsed < 1.5 ? gold : "#a2edda"); }
        label("SAPPHIRE IS FIXING YOUR WATCH...", 500, 542, 15, ink, "center");
      } else if (s.watchRepaired) {
        watch(500, 245, .45); label("FIXED!", 500, 298, 13, ink, "center");
        for (const zap of s.zaps) { rect(zap.x - 10, zap.y - 3, 20, 6, "#8edfd5"); rect(zap.x - 5, zap.y - 1, 10, 2, cream); }
        if (s.stage === "repairedHome") label("TRY C TO SHRINK · J / SPACE TO ZAP", 500, 570, 14, ink, "center");
      }
    }
    if (s.stage === "homeReply") { rect(s.player.x - 44, s.player.y - 122, 100, 30, cream); label("Okay.", s.player.x + 6, s.player.y - 102, 17, ink, "center"); }
    if (s.stage === "homePortal") label("THE NEXT DIMENSION →", 710, 540, 14, ink, "center");
    if (s.stage === "rainforestPortal") label("THE RAINFOREST DIMENSION →", 710, 540, 14, ink, "center");
    if (s.stage === "vialReturn" || s.stage === "contestReveal") {
      const ownerX = s.stage === "vialReturn" ? s.player.x + 40 : 675;
      ctx.save(); ctx.translate(ownerX, 415); ctx.scale(.65, .65); thoughtVial(0, 0); ctx.restore();
      label(s.stage === "vialReturn" ? "GIVE THE VIAL TO SAPPHIRE" : "DIMENSION 3564 DISCOVERED", 500, 565, 15, ink, "center");
    }
    if (emerging && s.elapsed < .7) rect(0, 0, W, H, `rgba(12,27,26,${1 - s.elapsed / .7})`);
  }
  function mindDimension() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#28324e"); rect(0, 305, s.width, 420, "#53546f");
    for (let x = Math.floor(camera.x / 80) * 80; x < camera.x + W + 80; x += 80) {
      for (let y = 305; y < 725; y += 70) { rect(x + 2, y + 2, 76, 66, "#5a5a76"); rect(x + 8, y + 7, 60, 2, "#70738a"); }
      rect(x, 280, 60, 6, "#8bc9d0"); rect(x + 30, 746, 60, 6, "#a797cc");
    }
    for (let i = 0; i < 16; i++) {
      const x = i * 220 + 20; rect(x, 75, 120, 175, "#313b58"); rect(x + 8, 86, 104, 12, "#7486a3");
      for (let row = 0; row < 4; row++) { rect(x + 15, 120 + row * 25, 76, 10, "#212a42"); rect(x + 99, 120 + row * 25, 8, 8, row % 2 ? "#b49bd5" : "#78cbbd"); }
    }
    portal(105, 535, s.portalColor, .55);
    for (const wall of s.obstacles.filter(wall => wall.kind !== "machine")) {
      rect(wall.x + 5, wall.y + 6, wall.w, wall.h, "#18223d55"); rect(wall.x, wall.y, wall.w, wall.h, "#313b58");
      rect(wall.x + 4, wall.y + 4, wall.w - 8, wall.h - 8, "#8996ad"); rect(wall.x + 10, wall.y + 10, wall.w - 20, 8, "#cad6dc");
      for (let y = wall.y + 28; y < wall.y + wall.h - 8; y += 16) rect(wall.x + 10, y, wall.w - 20, 3, "#58647f");
    }
    const machine = s.machine;
    if (machine) {
      const x = machine.x, y = machine.y;
      rect(x - 72, y + 42, 144, 24, "#202a43"); rect(x - 60, y - 125, 120, 175, "#202a43"); rect(x - 53, y - 118, 106, 160, "#687c98");
      rect(x - 48, y - 112, 96, 10, "#aabccd"); rect(x - 42, y - 25, 84, 52, "#303e5f");
      for (let i = 0; i < 5; i++) rect(x - 30 + i * 14, y - 12, 8, 26, ["#b29de0", "#84d5cd", "#e5cf8c"][(i + Math.floor(s.time * 2)) % 3]);
      for (const side of [-1, 1]) { rect(x + side * 74 - 12, y - 115, 24, 95, "#465978"); for (let i = 0; i < 6; i++) rect(x + side * 74 - 17, y - 111 + i * 14, 34, 6, "#a3bad0"); }
      ctx.save(); ctx.translate(x, y - 60); ctx.rotate(machine.angle);
      rect(0, -10, 72, 20, "#293452"); rect(45, -6, 35, 12, "#c3b0e3"); rect(74, -8, 6, 16, "#ece6fc"); ctx.restore();
      ctx.fillStyle = "#b1e4e0"; ctx.beginPath(); ctx.arc(x, y - 60, 24, 0, Math.PI * 2); ctx.fill();
      rect(x - 9, y - 72, 18, 25, "#6c559c"); rect(x - 3, y - 68, 6, 17, "#f3eff9");
      label("THOUGHT ENGINE", x, y - 146, 14, "#e9d9f6", "center");
      if (machine.cooldown < .4 && s.stage === "mind") { ctx.strokeStyle = "#d3b6f577"; ctx.lineWidth = 2; ctx.setLineDash([5, 9]); ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(s.player.x, s.player.y - s.player.h / 2); ctx.stroke(); ctx.setLineDash([]); }
    }
    if (s.vial) {
      const x = s.vial.x, y = s.vial.y, bob = Math.sin(s.time * 3) * 4;
      rect(x - 33, y - 2, 66, 15, "#313b58"); rect(x - 26, y - 9, 52, 9, "#a7b3c7");
      if (!s.thoughtVialCollected) {
        rect(x - 7, y - 63 + bob, 14, 8, "#e8cf8c"); rect(x - 5, y - 55 + bob, 10, 13, "#c8ece5");
        rect(x - 13, y - 42 + bob, 26, 27, "#bfe4e4"); rect(x - 9, y - 35 + bob, 18, 16, "#a78fd2"); rect(x - 9, y - 40 + bob, 4, 22, "#effff1");
        rect(x - 3, y - 29 + bob, 6, 5, "#e2d4f1"); label("THOUGHT VIAL", x, y - 82, 14, "#e9d9f6", "center");
      }
    }
    if (!(s.hurt > 0 && Math.floor(s.time * 15) % 2 === 0)) hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
    if (s.tiny || s.effect) label(s.effect ? "?!" : "YOU", s.player.x, s.player.y - (s.tiny ? 30 : 60), 15, "#f4dbff", "center");
    for (const ray of s.lasers) {
      ctx.save(); ctx.translate(ray.x, ray.y); ctx.rotate(Math.atan2(ray.vy, ray.vx));
      rect(-18, -5, 36, 10, "#b392e555"); rect(-14, -3, 28, 6, "#d0b1f0"); rect(-12, -1, 24, 2, "#f1f8e5"); ctx.restore();
    }
    ctx.restore(); rect(22, H - 45, 350, 27, "#20243fe8"); label(`${dimension().toUpperCase()} · THOUGHT DIMENSION`, 34, H - 27, 11, "#e0d5f2");
  }
  function thoughtVial(x, y) {
    rect(x - 7, y - 55, 14, 8, "#e8cf8c"); rect(x - 5, y - 47, 10, 13, "#c8ece5");
    rect(x - 13, y - 34, 26, 27, "#bfe4e4"); rect(x - 9, y - 27, 18, 16, "#a78fd2"); rect(x - 9, y - 32, 4, 22, "#effff1"); rect(x - 3, y - 21, 6, 5, "#e2d4f1");
  }
  function guardian(actor) {
    if (!actor.alive && !s.converted) {
      if (actor.defeated > 0) for (let i = 0; i < 8; i++) rect(actor.x + Math.cos(i) * (1 - actor.defeated) * 40, actor.y - 24 + Math.sin(i) * (1 - actor.defeated) * 40, 4, 4, "#b8e7e8");
      return;
    }
    ctx.save(); ctx.translate(Math.round(actor.x), Math.round(actor.y)); ctx.scale(actor.dir || 1, 1); shadow(0, 0, 37);
    const uniform = actor.hit > 0 ? "#e6f0e4" : "#66899e";
    rect(-10, -48, 20, 23, "#263b54"); rect(-8, -44, 16, 17, "#e4bf9d"); rect(-10, -49, 20, 9, "#3b516c");
    rect(-6, -37, 3, 3, ink); rect(4, -37, 3, 3, ink); rect(-3, -31, 8, 2, "#78464c");
    rect(-13, -25, 26, 19, uniform); rect(-16, -23, 5, 17, "#405f79"); rect(11, -23, 6, 17, "#405f79");
    rect(-9, -6, 7, 10, "#304a66"); rect(3, -6, 7, 10, "#304a66"); rect(-11, 1, 10, 4, ink); rect(3, 1, 10, 4, ink);
    if (actor.kind === "probe") {
      rect(13, -23, 23, 5, "#b0c9cf"); rect(31, -28, 8, 15, "#ead2ab"); rect(34, -25, 7, 9, "#e7a8d7");
    } else {
      rect(10, -27, 23, 29, ink); rect(13, -24, 17, 21, "#91d3d0"); rect(15, -22, 13, 6, "#d2e9df"); rect(16, -12, 10, 5, "#da9fc8"); rect(20, -1, 4, 2, "#b2c8c7");
    }
    ctx.restore();
    label("MBS", actor.x, actor.y - 13, 7, "#ebefd9", "center");
    if (actor.alive && s.stage !== "lost") {
      rect(actor.x - 15, actor.y - 60, 30, 4, "#30465b"); rect(actor.x - 15, actor.y - 60, actor.hp * (s.battleCheckpoint ? 15 : 10), 4, "#aee2c9");
      if (actor.cooldown < .5) label("!", actor.x, actor.y - 69, 15, s.battleCheckpoint ? "#f0b3e3" : "#efcda0", "center");
    }
  }
  function contestants() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#60778f"); rect(0, 305, s.width, 420, "#c3d0ce"); rect(0, 465, s.width, 120, "#a0c7c9");
    for (let x = Math.floor(camera.x / 80) * 80; x < camera.x + W + 80; x += 80) {
      rect(x, 305, 2, 420, "#a6babd"); rect(x + 4, 508, 36, 5, "#e5deb5");
      for (let y = 305; y < 725; y += 70) rect(x, y, 80, 2, "#a6babd");
    }
    for (let i = 0; i < 15; i++) {
      const x = 30 + i * 250;
      if (x + 220 < camera.x || x > camera.x + W) continue;
      rect(x, 110, 210, 170, "#3c536e"); rect(x + 8, 118, 194, 154, "#819eac");
      rect(x + 25, 142, 160, 67, i % 2 ? "#cda2bf" : "#9bd3cc"); label(i % 2 ? "STAY HAPPY!" : "MBS", x + 105, 185, i % 2 ? 17 : 30, "#344962", "center");
      label("3564 · THE CONTESTANTS", x + 105, 239, 10, "#e7eddc", "center");
      rect(x + 70, 750, 95, 80, "#3c536e");
    }
    for (const wall of s.obstacles.filter(w => w.x < 3300)) {
      rect(wall.x + 5, wall.y + 7, wall.w, wall.h, "#263e5455"); rect(wall.x, wall.y, wall.w, wall.h, "#4b6681");
      rect(wall.x + 4, wall.y + 4, wall.w - 8, wall.h - 8, "#91aab4"); rect(wall.x + 10, wall.y + 11, wall.w - 20, 6, "#d7e4db");
    }
    const computer = s.computer, x = computer?.x || 3510, y = computer?.y || 395;
    if (computer && !computer.destroyed) {
      rect(x - 110, y - 90, 220, 100, "#31435a"); rect(x - 102, y - 82, 204, 82, "#9bb4bd"); rect(x - 95, y - 75, 190, 65, "#23384d");
      rect(x - 55, y - 60, 23, 8, "#acd6a0"); rect(x + 32, y - 60, 23, 8, "#acd6a0"); rect(x - 44, y - 33, 88, 6, "#acd6a0"); rect(x - 51, y - 42, 8, 10, "#acd6a0"); rect(x + 43, y - 42, 8, 10, "#acd6a0");
      rect(x - 25, y + 10, 50, 13, "#31435a"); rect(x - 70, y + 23, 140, 9, "#758fa2");
      label(s.stage === "computerExplosion" ? "NOOOOOO!" : "THE EVOLVED COMPUTER", x, y - 105, 12, "#f0e4cf", "center");
    } else {
      rect(x - 98, y - 20, 110, 24, "#35475d"); rect(x + 30, y - 12, 68, 17, "#738b9e"); rect(x - 33, y - 29, 28, 8, "#b3cebb");
    }
    const opening = s.stage === "guardianDoor" ? Math.min(1, s.elapsed / 1.6) : s.battleCheckpoint ? 1 : 0;
    rect(3700, 305, 60, 420, "#283c54"); rect(3708, 313, 44, 195 * (1 - opening), "#bd99b2"); rect(3708, 717 - 195 * (1 - opening), 44, 195 * (1 - opening), "#bd99b2");
    if (s.battleCheckpoint) { rect(3000, 305, 8, 420, "#9f87b3"); label("ARENA", 3110, 330, 12, "#4b5872", "center"); }
    const actors = s.guardians.map(g => ({ y: g.y, draw: () => guardian(g) }));
    s.people.filter(person => person.alive).forEach(person => actors.push({ y: person.y, draw: () => drawPerson(person) }));
    actors.push({ y: s.player.y, draw: () => {
      if (s.converted) { guardian({ ...s.player, kind: "tablet", alive: true, hp: 2, cooldown: 9 }); return; }
      hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
      if (s.tiny) label("YOU", s.player.x, s.player.y - 30, 10, ink, "center");
      if (s.happy > 0) { label(":D", s.player.x, s.player.y - (s.tiny ? 43 : 65), 19, "#84576e", "center"); rect(s.player.x - 25, s.player.y + 8, 15, 3, "#fff3bd"); rect(s.player.x + 8, s.player.y + 13, 22, 3, "#fff3bd"); }
    } });
    actors.sort((a, b) => a.y - b.y).forEach(actor => actor.draw());
    for (const ray of [...s.lasers, ...s.zaps]) {
      ctx.save(); ctx.translate(ray.x, ray.y); ctx.rotate(Math.atan2(ray.vy, ray.vx));
      const color = !ray.guardian ? "#e9d88a" : ray.conversion ? "#bb83d7" : "#ed9ec4";
      rect(-14, -5, 28, 10, `${color}55`); rect(-12, -2, 24, 4, color); rect(-8, -1, 16, 2, cream); ctx.restore();
    }
    if (s.stage === "computerExplosion") {
      const t = s.elapsed;
      for (let i = 0; i < 32; i++) {
        const angle = i / 32 * Math.PI * 2, radius = Math.min(150, t * 90) * (.5 + i % 3 * .25);
        rect(x + Math.cos(angle) * radius, y - 40 + Math.sin(angle) * radius + t * t * 12, 10 + i % 4 * 3, 9, ["#f7d28b", "#e9a17f", "#788da3"][i % 3]);
      }
    }
    if (s.portalOpen) {
      portal(3650, 550, "#b6a2ea", 1.05);
      if (s.vial && !s.secondVialCollected) { rect(s.vial.x - 25, s.vial.y, 50, 12, "#4d617c"); thoughtVial(s.vial.x, s.vial.y); label("ANOTHER THOUGHT VIAL", s.vial.x, s.vial.y - 70, 12, ink, "center"); }
      label("THOUGHT PORTAL", 3650, 584, 12, ink, "center");
    }
    if (s.stage === "defiance") { rect(s.player.x - 125, s.player.y - 125, 270, 29, cream); label("NO! I will not surrender.", s.player.x + 10, s.player.y - 105, 14, ink, "center"); }
    ctx.restore(); rect(22, H - 45, 332, 27, "#263e56e8"); label(`${dimension().toUpperCase()} · THE CONTESTANTS`, 34, H - 27, 11, "#e5e8d5");
  }
  function volcano() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#271f2b");
    for (let x = Math.floor(camera.x / 120) * 120; x < camera.x + W + 120; x += 120) {
      const height = 70 + Math.abs(x * 13) % 110;
      rect(x, 160 - height, 116, height + 145, "#3c2c36"); rect(x + 10, 210 - height, 80, height + 70, "#4a333c");
      rect(x + 30, 160 - height, 5, height, "#80433e"); rect(x + 35, 240 - height, 13, 5, "#b96643");
      rect(x + 12, 737, 96, 60, "#65353b"); rect(x + 65, 782, 5, 90, "#a4493b");
    }
    rect(camera.x, 275, W, 35, "#ae4b35"); rect(camera.x, 282, W, 17, "#ec934c");
    rect(camera.x, 720, W, 70, "#b84932"); rect(camera.x, 728, W, 18, "#f1a34c");
    for (let x = Math.floor(camera.x / 45) * 45; x < camera.x + W + 45; x += 45) {
      const wave = Math.sin(s.volcanoTime * 2 + x * .06) * 5;
      rect(x + 8, 285 + wave, 25, 4, "#f8d884"); rect(x + 10, 736 - wave, 27, 5, "#f8d884");
    }
    rect(0, 305, s.width, 420, "#54434b");
    for (let x = Math.floor(camera.x / 80) * 80; x < camera.x + W + 80; x += 80) for (let y = 305; y < 725; y += 70) {
      const pattern = Math.abs(x * 11 + y * 3) % 3;
      rect(x + 3, y + 3, 74, 64, ["#604d51", "#665058", "#58464f"][pattern]);
      rect(x + 13, y + 17, 22, 3, "#413740"); rect(x + 34, y + 17, 3, 15, "#413740"); rect(x + 58, y + 45, 9, 3, "#7a5e5d");
    }
    for (const rock of s.obstacles) {
      rect(rock.x + 9, rock.y + 10, rock.w, rock.h, "#1c1d2a55"); rect(rock.x, rock.y, rock.w, rock.h, "#302b37");
      rect(rock.x + 6, rock.y + 6, rock.w - 12, rock.h - 12, "#746069"); rect(rock.x + 8, rock.y + 6, rock.w - 16, 12, "#9b7c7b");
      rect(rock.x + 13, rock.y + 33, 21, 5, "#584651"); rect(rock.x + rock.w - 20, rock.y + 22, 5, rock.h - 35, "#584651");
    }
    for (const vent of s.vents) {
      const x = vent.x, y = vent.y, middle = x + vent.w / 2;
      rect(x - 8, y - 4, vent.w + 16, vent.h + 9, "#30232d"); rect(x, y, vent.w, vent.h, "#823c37"); rect(x + 6, y + 5, vent.w - 12, vent.h - 10, vent.erupting ? "#ffbf61" : vent.warning ? "#ed9350" : "#b25c3e");
      rect(x + 12, y + 9, vent.w - 24, 9, "#f4b65b");
      if (vent.warning) {
        ctx.strokeStyle = "#f1c37b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(middle, y + 15, 48, 30, 0, 0, Math.PI * 2); ctx.stroke();
        label("!", middle, y - 17, 24, "#ffe3a1", "center"); label("HEATING", middle, y + 62, 10, "#ffe3a1", "center");
      }
      if (vent.erupting) {
        const pulse = Math.sin(s.volcanoTime * 11 + vent.offset) * 6;
        rect(middle - 21, y - 60 - pulse, 42, 78 + pulse, "#ee743d"); rect(middle - 13, y - 68 - pulse, 26, 88 + pulse, "#ffb855"); rect(middle - 6, y - 55, 12, 70, "#ffe9a7");
        for (let i = 0; i < 7; i++) {
          const progress = (s.volcanoTime * 1.5 + i / 7) % 1;
          const dx = (i % 2 ? 1 : -1) * (12 + progress * 28);
          rect(middle + dx, y - 10 - Math.sin(progress * Math.PI) * 85, 6, 10, i % 2 ? "#ffcf73" : "#f18346");
        }
        label("LAVA!", middle, y + 62, 10, "#ffe3a1", "center");
      } else {
        const steam = (s.volcanoTime * 12 + vent.offset * 10) % 28;
        rect(middle - 6, y - 10 - steam, 8, 7, "#bc9d9333");
      }
    }
    portal(s.finishX, 550, "#a8e6ce", 1.1); label("OUT OF THE FLAMES →", s.finishX, 590, 13, "#e1ead2", "center");
    s.robots.forEach(bot => {
      if (bot.alive) { robot(bot); rect(bot.x - 15, bot.y - 67, 30, 4, "#352d39"); rect(bot.x - 15, bot.y - 67, bot.hp * 10, 4, "#bbd6b1"); }
      else if (bot.defeated > 0) for (let i = 0; i < 6; i++) rect(bot.x + Math.cos(i) * 22, bot.y - 20 + Math.sin(i + s.time) * 18, 5, 5, "#a8d9dd");
    });
    if (!(s.hurt > 0 && s.stage === "volcano" && Math.floor(s.time * 15) % 2 === 0)) hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
    if (s.tiny) label("YOU", s.player.x, s.player.y - 28, 10, "#e6dcc0", "center");
    for (const beam of [...s.lasers, ...s.zaps]) {
      const friendly = s.zaps.includes(beam);
      ctx.save(); ctx.translate(beam.x, beam.y); ctx.rotate(Math.atan2(beam.vy, beam.vx));
      rect(-15, -4, 30, 8, friendly ? "#9bdbdf55" : "#e9867155"); rect(-12, -2, 24, 4, friendly ? "#b2e8e3" : "#f6a07f"); rect(-8, -1, 16, 2, cream); ctx.restore();
    }
    ctx.restore();
    for (let i = 0; i < 30; i++) {
      const x = (i * 137 + s.volcanoTime * (4 + i % 3)) % W, y = (i * 83 + s.volcanoTime * 11) % H;
      rect(x, y, 2 + i % 2, 3, i % 5 ? "#ceb5a044" : "#f6c27899");
    }
    rect(22, H - 45, 332, 27, "#302736ed"); label(`${dimension().toUpperCase()} · OUT OF THE FLAMES`, 34, H - 27, 11, "#f1d8b4");
  }
  function romanSoldier(actor) {
    const peaceful = s.romanWon, confused = s.stage === "romanPortal", smiling = peaceful && !confused;
    ctx.save(); ctx.translate(Math.round(actor.x), Math.round(actor.y));
    if (!actor.alive && !peaceful) { ctx.translate(0, 0); ctx.scale(1, .55); }
    shadow(0, 0, 33);
    rect(-9, -45, 18, 17, "#efc494"); rect(-12, -49, 24, 9, "#acb5b3"); rect(-9, -52, 18, 4, "#e0d7c0");
    rect(-3, -62, 6, 13, "#8c3942"); rect(-9, -62, 18, 5, "#c65952");
    rect(-10, -42, 4, 14, "#788b92"); rect(7, -42, 4, 14, "#788b92");
    rect(-4, -38, 2, 3, ink); rect(3, -38, 2, 3, ink);
    if (smiling) { rect(-3, -32, 2, 2, "#955a4b"); rect(3, -32, 2, 2, "#955a4b"); rect(-1, -30, 4, 2, "#955a4b"); }
    else rect(-2, -31, 5, 2, "#955a4b");
    rect(-12, -27, 24, 16, "#b2b7ad"); rect(-9, -25, 18, 3, "#e5ddc2"); rect(-9, -19, 18, 2, "#7a8d91");
    rect(-12, -11, 24, 8, "#b84f4c"); rect(-8, -4, 6, 8, "#e9bd91"); rect(3, -4, 6, 8, "#e9bd91");
    rect(-10, 2, 10, 4, "#76533e"); rect(2, 2, 10, 4, "#76533e");
    rect(-22, -32, 13, 29, "#7b3440"); rect(-20, -30, 9, 25, "#c1644e"); rect(-17, -27, 3, 18, "#e6c778"); rect(-20, -20, 9, 3, "#e6c778");
    rect(15, -51, 3, 53, "#84674c"); rect(13, -59, 7, 11, "#c8d5cd"); rect(12, -23, 6, 7, "#efc494");
    if (s.stage === "colosseum" && actor.alive) {
      rect(-16, -76, 32, 4, "#80583e"); rect(-16, -76, actor.hp * 16, 4, "#8bc9b0");
      if (actor.windup > 0) { ctx.strokeStyle = "#e47b62"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -5, 76, 48, 0, 0, Math.PI * 2); ctx.stroke(); label("!", 0, -84, 18, "#ffdec0", "center"); }
    }
    if (!actor.alive && !peaceful) label("I YIELD", 0, -70, 10, "#f3e3c0", "center");
    if (confused) label("?", 0, -81, 28, "#ffdfa0", "center");
    ctx.restore();
  }
  function colosseum() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#efd0a0");
    rect(0, 90, s.width, 220, "#b58d64");
    for (let row = 0; row < 2; row++) {
      const y = 115 + row * 85;
      for (let x = 30; x < s.width; x += 105) {
        rect(x, y, 80, 75, "#dbbb87"); ctx.fillStyle = "#65574c"; ctx.beginPath(); ctx.arc(x + 40, y + 29, 24, Math.PI, 0); ctx.lineTo(x + 64, y + 69); ctx.lineTo(x + 16, y + 69); ctx.closePath(); ctx.fill();
        rect(x + 6, y + 4, 5, 67, "#f3d8aa");
        for (let i = 0; i < 3; i++) { rect(x + 25 + i * 12, y + 49, 6, 6, "#e2b48a"); rect(x + 24 + i * 12, y + 55, 8, 8, ["#957989", "#b87862", "#73969b"][i]); }
      }
    }
    rect(0, 288, s.width, 20, "#f3d5a2"); rect(0, 310, s.width, 420, "#d4ad75"); rect(0, 730, s.width, 70, "#b88f63");
    for (let x = 20; x < s.width; x += 170) {
      rect(x, 304, 6, 420, "#c3986222"); rect(x + 48, 360, 28, 3, "#e4bf86"); rect(x + 92, 640, 21, 3, "#b48a5a");
      rect(x + 18, 235, 32, 55, "#9e4345"); rect(x + 22, 240, 24, 4, "#ebc781"); rect(x + 31, 248, 6, 22, "#e9c575");
    }
    // Tipped bottles and spilled wine are scenery on the sandy arena floor.
    for (let i = 0; i < 18; i++) {
      const x = 260 + i * 82, y = [365, 610, 700, 460][i % 4];
      ctx.fillStyle = "#8b426655"; ctx.beginPath(); ctx.ellipse(x + 15, y + 5, 22, 8, .1, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1 : -1) * 1.35); rect(-5, -13, 10, 21, "#496658"); rect(-2, -23, 4, 11, "#365348"); rect(-3, -26, 6, 4, "#ba9b6b"); rect(-4, -7, 8, 7, "#e5d7b7"); ctx.restore();
    }
    rect(s.finishX - 52, 350, 104, 200, "#9f7c5e"); rect(s.finishX - 44, 358, 88, 187, "#4e5b65");
    if (s.stage === "romanPortal") portal(s.finishX, 550, s.portalColor, Math.min(1.1, s.elapsed * 1.5));
    else if (s.romanWon) label("OPEN YOUR PORTAL →", s.finishX, 585, 12, ink, "center");
    if (s.stage === "romanReward") { rect(1335, 526, 60, 13, "#9b7d5e"); thoughtVial(1365, 515); label("THE VIAL!", 1365, 450, 13, ink, "center"); }
    const actors = s.soldiers.map(soldier => ({ y: soldier.y, draw: () => romanSoldier(soldier) }));
    actors.push({ y: s.player.y, draw: () => {
      if (s.hurt > 0 && s.stage === "colosseum" && Math.floor(s.time * 15) % 2 === 0) return;
      ctx.save(); if (s.stage === "romanPortal") ctx.globalAlpha = Math.max(0, 1 - s.elapsed / 2.2);
      const smiling = ["romanThanks", "romanExit", "romanPortal"].includes(s.stage);
      hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving, false, smiling);
      if (s.romanVial) { ctx.save(); ctx.translate(s.player.x + 28, s.player.y - 5); ctx.scale(.5, .5); thoughtVial(0, 0); ctx.restore(); }
      ctx.restore();
    } });
    actors.sort((a, b) => a.y - b.y).forEach(actor => actor.draw());
    for (const zap of s.zaps) { rect(zap.x - 8, zap.y - 3, 16, 6, "#f8e5a3"); rect(zap.x - 3, zap.y - 2, 6, 4, "#fff6df"); }
    if (s.stage === "romanAccusation") { rect(290, 343, 510, 34, "#563b36e8"); label("You are a villain! Get him!", 545, 366, 20, cream, "center"); }
    if (s.stage === "romanThanks") { rect(s.player.x - 35, s.player.y - 90, 90, 28, cream); label("Thanks!", s.player.x + 10, s.player.y - 70, 16, ink, "center"); }
    if (s.stage === "romanPortal") label("A PORTAL?", camera.x + 500, 355, 20, ink, "center");
    if (s.tiny) label("YOU", s.player.x, s.player.y - 28, 10, ink, "center");
    ctx.restore(); rect(22, H - 45, 460, 27, "#604a3aed"); label(`THE HYSTERICS · ${s.soldiers.filter(soldier => soldier.alive).length} OF 10 SOLDIERS LEFT`, 34, H - 27, 11, "#f4e5c8");
  }
  function octopus(actor) {
    const { x, y, color } = actor, t = s.seaClock;
    shadow(x, y, 70);
    // Eight waving arms, with pale suckers, beneath a rounded pixel mantle.
    for (let i = 0; i < 8; i++) {
      const arm = -28 + i * 8, sway = Math.sin(t * 3 + i + actor.phase) * 7;
      rect(x + arm - 3, y - 29, 7, 21, color); rect(x + arm - 3 + sway, y - 15, 7, 12, color);
      rect(x + arm - 3 + sway + (i < 4 ? -4 : 4), y - 7, 9, 5, color); rect(x + arm - 1 + sway, y - 10, 2, 3, "#f9d5cf");
    }
    rect(x - 19, y - 64, 38, 7, color); rect(x - 27, y - 57, 54, 26, color); rect(x - 23, y - 31, 46, 7, color);
    rect(x - 15, y - 59, 23, 5, "#f4d0db88");
    rect(x - 18, y - 46, 12, 13, "#f9edd6"); rect(x + 6, y - 46, 12, 13, "#f9edd6");
    rect(x - 14 + actor.dir * 2, y - 42, 5, 7, ink); rect(x + 9 + actor.dir * 2, y - 42, 5, 7, ink);
    rect(x - 3, y - 31, 6, 4, "#744d80");
  }
  function seaOfMemories() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    const water = ctx.createLinearGradient(0, 100, 0, 850); water.addColorStop(0, "#54b7ca"); water.addColorStop(.45, "#276f93"); water.addColorStop(1, "#183c67");
    ctx.fillStyle = water; ctx.fillRect(camera.x, 0, W, 950);
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = "#b7eddf10"; ctx.beginPath(); const x = Math.floor(camera.x / 240) * 240 + i * 240;
      ctx.moveTo(x, 100); ctx.lineTo(x + 45, 100); ctx.lineTo(x + 190, 740); ctx.lineTo(x - 30, 740); ctx.closePath(); ctx.fill();
    }
    rect(0, 305, s.width, 420, "#4d8e9d44"); rect(0, 726, s.width, 180, "#baa886"); rect(0, 726, s.width, 12, "#dfc99d");
    for (let x = Math.floor(camera.x / 80) * 80; x < camera.x + W + 80; x += 80) {
      rect(x + 13, 750, 23, 3, "#9a916e"); rect(x + 45, 786, 18, 3, "#d8bf95");
      const sway = Math.sin(s.seaClock * 1.6 + x) * 5;
      rect(x + 58, 680, 7, 48, "#397c76"); rect(x + 58 + sway, 651, 7, 32, "#65af91"); rect(x + 50 + sway, 671, 10, 8, "#65af91");
    }
    // Familiar fragments float safely in memory bubbles above the route.
    for (let i = 0; i < 8; i++) {
      const x = 350 + i * 430, y = 240 + Math.sin(s.seaClock * .6 + i) * 13;
      if (x < camera.x - 60 || x > camera.x + W + 60) continue;
      ctx.save(); ctx.globalAlpha = .55;
      ctx.strokeStyle = "#bbeedc"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 35, 0, Math.PI * 2); ctx.stroke();
      if (i % 3 === 0) watch(x, y, .32);
      else if (i % 3 === 1) { rect(x - 19, y - 9, 38, 29, "#b7d7c5"); rect(x - 23, y - 17, 46, 9, "#8dc3c9"); rect(x - 5, y + 3, 10, 17, "#47748c"); }
      else sapphire(x, y + 20, .75);
      ctx.restore();
    }
    for (const coral of s.obstacles) {
      rect(coral.x + 4, coral.y + 8, coral.w, coral.h, "#163e6455"); rect(coral.x, coral.y, coral.w, coral.h, "#526f85");
      rect(coral.x + 5, coral.y + 6, coral.w - 10, 15, "#7999a4");
      for (let i = 0; i < 3; i++) { const x = coral.x + 14 + i * 24; rect(x, coral.y + 22, 7, 48, "#d9879c"); rect(x - 8, coral.y + 30 + i * 4, 20, 6, "#edb3b3"); }
    }
    portal(s.finishX, 550, "#b7f1db", 1.1); label("BEYOND THE MEMORIES →", s.finishX, 590, 12, "#e2f1d6", "center");
    const actors = s.octopuses.map(actor => ({ y: actor.y, draw: () => octopus(actor) }));
    actors.push({ y: s.player.y, draw: () => { if (!(s.hurt > 0 && s.stage === "sea" && Math.floor(s.time * 15) % 2 === 0)) hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving); } });
    actors.sort((a, b) => a.y - b.y).forEach(actor => actor.draw());
    if (s.tiny) label("YOU", s.player.x, s.player.y - 29, 10, cream, "center");
    for (const shot of s.inkShots) {
      ctx.fillStyle = "#ac81b5"; ctx.beginPath(); ctx.arc(shot.x, shot.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#21172f"; ctx.beginPath(); ctx.arc(shot.x, shot.y, 7, 0, Math.PI * 2); ctx.fill();
      rect(shot.x - shot.vx * .045 - 3, shot.y - shot.vy * .045 - 3, 6, 6, "#3d285388");
    }
    ctx.strokeStyle = "#b8f0df66"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 34; i++) {
      const x = Math.floor(camera.x / W) * W + i * 137 % (W + 150), y = 750 - (i * 73 + s.seaClock * (14 + i % 5 * 4)) % 660;
      ctx.beginPath(); ctx.arc(x + Math.sin(s.seaClock + i) * 5, y, 2 + i % 4, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore(); rect(22, H - 45, 432, 27, "#153e60e8"); label("THE SEA OF MEMORIES · THE WATER SLOWS YOUR STEPS", 34, H - 27, 11, "#d3f1de");
  }
  function betterworlder(actor) {
    ctx.save(); ctx.translate(Math.round(actor.x), Math.round(actor.y) - 13); ctx.scale(actor.dir * .8, .8);
    const step = actor.alert ? Math.sin(s.powerlessTime * 12 + actor.phase) * 2 : 0;
    shadow(0, 16, 36);
    // Copper hair, pale blue clothes and dark boots follow the supplied reference.
    rect(-15, -53, 30, 8, "#201b36"); rect(-20, -45, 40, 20, "#201b36"); rect(-15, -47, 30, 17, "#ba653e");
    rect(-13, -50, 21, 7, "#e6a354"); rect(-18, -42, 16, 12, "#e6a354"); rect(-10, -46, 12, 6, "#f3b969"); rect(2, -45, 15, 9, "#a86040");
    rect(-14, -36, 28, 20, "#f0d3a9"); rect(-16, -33, 5, 12, "#d6aa79"); rect(11, -33, 5, 12, "#d6aa79");
    rect(-10, -34, 7, 11, "#fff2d1"); rect(4, -34, 7, 11, "#fff2d1"); rect(-7, -34, 4, 9, "#292239"); rect(4, -34, 4, 9, "#292239");
    rect(-4, -20, 9, 2, "#a97458"); rect(-7, -17, 14, 7, "#e8d8bf");
    rect(-17, -13, 34, 17, "#28253e"); rect(-14, -12, 28, 14, "#acbacb"); rect(-11, -12, 22, 5, "#d7e0df"); rect(-2, -10, 4, 8, "#728ba5");
    rect(-21, -10, 7, 13, "#d2dcd9"); rect(14, -10, 7, 13, "#d2dcd9"); rect(-20, 0, 7, 5, "#f0d3a9"); rect(14, 0, 7, 5, "#f0d3a9");
    rect(-14, 0, 28, 5, "#7e8ba1"); rect(-13, 5, 12, 8 + step, "#29263f"); rect(2, 5, 12, 8 - step, "#29263f");
    rect(-14, 11 + step, 14, 5, "#201b36"); rect(1, 11 - step, 14, 5, "#201b36");
    // Align the boots with the collision body's feet.
    ctx.restore();
    if (actor.alert) label("!", actor.x, actor.y - 67, 18, "#f1bd8d", "center");
  }
  function powerless() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#b9cad5"); rect(0, 300, s.width, 430, "#929da9");
    for (let x = Math.floor(camera.x / 240) * 240; x < camera.x + W + 240; x += 240) {
      rect(x + 12, 132, 204, 158, "#d9dbd5"); rect(x + 5, 116, 218, 20, "#a3b7c2"); rect(x + 20, 140, 186, 5, "#f2ead5");
      for (let i = 0; i < 4; i++) { rect(x + 29 + i * 44, 168, 26, 48, "#617a91"); rect(x + 33 + i * 44, 172, 18, 29, "#8fc3ce"); }
      rect(x + 85, 228, 48, 62, "#73869b"); rect(x + 90, 233, 38, 57, "#475e78"); rect(x + 119, 258, 4, 4, "#d4ded6");
      rect(x + 8, 308, 216, 24, "#c3ccd0"); rect(x + 8, 696, 216, 24, "#c3ccd0");
    }
    for (let x = Math.floor(camera.x / 80) * 80; x < camera.x + W + 80; x += 80) for (let y = 350; y < 690; y += 68) {
      rect(x + 2, y, 76, 1, "#a7b0b8"); rect(x + 2, y, 1, 64, "#a7b0b8"); rect(x + 24, y + 36, 13, 2, "#858f9f");
    }
    rect(230, 220, 190, 31, "#58758a"); label("BETTERWORLD", 325, 241, 16, "#e3edf0", "center");
    // Invisible barriers are intentionally omitted from the scenery.
    const actors = s.betterworlders.map(actor => ({ y: actor.y, draw: () => betterworlder(actor) }));
    actors.push({ y: s.player.y, draw: () => { if (!(s.hurt > 0 && s.stage === "powerless" && Math.floor(s.time * 15) % 2 === 0)) hero(s.player.x, s.player.y, 1, s.player.dir, s.player.moving); } });
    actors.sort((a, b) => a.y - b.y).forEach(actor => actor.draw());
    if (s.vial && !s.powerlessVialCollected) {
      rect(s.vial.x - 32, s.vial.y - 4, 64, 15, "#5d728c"); rect(s.vial.x - 27, s.vial.y - 1, 54, 6, "#c1dce0");
      thoughtVial(s.vial.x, s.vial.y + Math.sin(s.powerlessTime * 3) * 3);
      label("ANOTHER THOUGHT VIAL", s.vial.x, s.vial.y - 77, 12, "#f3e7c6", "center");
    }
    if (s.barrierBump > 0) {
      ctx.strokeStyle = "#d6f1edaa"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(s.player.x, s.player.y - 20, 23, 27, 0, 0, Math.PI * 2); ctx.stroke();
      label("?", s.player.x + 24, s.player.y - 44, 14, "#eff4db", "center");
    }
    if (s.jamSpeechTime > 0) {
      rect(s.player.x - 110, s.player.y - 106, 220, 29, "#f5e9cf"); rect(s.player.x - 4, s.player.y - 77, 8, 8, "#f5e9cf");
      label("My watch is jammed!", s.player.x, s.player.y - 86, 15, ink, "center");
    }
    ctx.restore(); rect(22, H - 45, 404, 27, "#34455eed"); label("POWERLESS · GET TO THE THOUGHT VIAL", 34, H - 27, 11, "#e8eadc");
  }
  function eagle(actor) {
    const diving = actor.mode === "dive", flap = diving ? 3 : Math.sin(s.rainforestTime * 17 + actor.phase) * 11;
    shadow(actor.x, actor.y + 4, 45);
    ctx.save(); ctx.translate(Math.round(actor.x), Math.round(actor.y)); ctx.scale(actor.dir, 1);
    rect(-25, -18, 20, 11, "#5c4030"); rect(-34, -15, 15, 5, "#b39768");
    rect(-12, -27, 28, 23, "#6c4b35"); rect(-8, -23, 22, 14, "#92734b");
    rect(-15, -30 - flap, 18, 20 + flap, "#4b352c"); rect(-27, -37 - flap, 17, 12, "#684a31"); rect(-35, -39 - flap, 13, 6, "#8c6b45");
    rect(-10, -8, 22, 11 + flap, "#4b352c"); rect(-21, 2 + flap, 15, 7, "#684a31");
    rect(9, -29, 19, 18, "#efe8cb"); rect(22, -23, 12, 6, "#e9b651"); rect(20, -27, 3, 3, ink);
    rect(4, -5, 4, 9, "#d6a147"); rect(12, -5, 4, 8, "#d6a147"); ctx.restore();
    if (actor.mode === "warning") {
      ctx.strokeStyle = "#ffd68b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(actor.targetX, actor.targetY - 10, 40, 28, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([5, 8]); ctx.beginPath(); ctx.moveTo(actor.x, actor.y - 15); ctx.lineTo(actor.targetX, actor.targetY); ctx.stroke(); ctx.setLineDash([]);
      label("DIVE!", actor.targetX, actor.targetY - 47, 12, "#ffe8b5", "center");
    }
  }
  function rainforest() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#173f43");
    for (let x = Math.floor(camera.x / 160) * 160; x < camera.x + W + 160; x += 160) {
      rect(x + 36, 60, 42, 240, "#315955"); rect(x + 47, 64, 7, 230, "#446c5d");
      rect(x + 6, 120, 110, 38, "#214c42"); rect(x - 15, 157, 130, 42, "#315d43");
      rect(x + 128, 156, 5, 156, "#79a465"); rect(x + 123, 247, 13, 4, "#a2bd78");
    }
    rect(0, 305, s.width, 420, "#426e47"); rect(0, 485, s.width, 100, "#7a7950");
    for (let x = Math.floor(camera.x / 70) * 70; x < camera.x + W + 70; x += 70) {
      rect(x + 8, 353, 29, 5, "#598251"); rect(x + 23, 659, 38, 7, "#5c8050"); rect(x + 32, 539, 17, 3, "#656849");
      rect(x + 10, 709, 5, 25, "#365d37"); rect(x, 710, 28, 5, "#5d934d"); rect(x + 3, 701, 22, 5, "#76a45e");
    }
    for (const root of s.obstacles) {
      rect(root.x + 4, root.y + 5, root.w, root.h, "#1f3e3755"); rect(root.x, root.y, root.w, root.h, "#594c34");
      rect(root.x + 6, root.y + 6, root.w - 12, 15, "#75905a"); rect(root.x + 8, root.y + 20, 17, root.h - 28, "#8a7750");
      rect(root.x + 34, root.y + 29, root.w - 43, 6, "#352f2b"); rect(root.x + 42, root.y + 35, 6, root.h - 46, "#352f2b");
      rect(root.x + root.w - 23, root.y - 9, 4, 20, "#a1be70"); rect(root.x + root.w - 30, root.y - 5, 18, 5, "#a1be70");
    }
    portal(100, 548, s.portalColor, .58); portal(s.finishX + 100, 550, s.portalColor, 1);
    label("SAPPHIRE →", s.finishX, 590, 14, "#e7e9bd", "center");
    for (const bird of s.eagles) eagle(bird);
    if (!(s.hurt > 0 && s.stage === "rainforest" && Math.floor(s.time * 15) % 2 === 0)) hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
    if (s.tiny) label("YOU", s.player.x, s.player.y - 29, 10, "#e6efcb", "center");
    if (s.stage === "darknessWarning" || s.stage === "won") {
      const progress = Math.min(1, s.elapsed / 1.2);
      sapphire(s.finishX + 100 - progress * 100, 520, 1.7);
    }
    // Dense canopy and foreground ferns frame the traversable forest floor.
    for (let x = Math.floor(camera.x / 220) * 220; x < camera.x + W + 220; x += 220) {
      rect(x + 22, 74, 32, 232, "#594b36"); rect(x + 27, 82, 5, 210, "#8a784d");
      for (let i = 0; i < 3; i++) { rect(x - 38 + i * 43, 80 + i % 2 * 25, 104, 40, ["#477143", "#5d8548", "#335c3b"][i]); rect(x - 20 + i * 45, 58 + i % 2 * 25, 65, 28, "#5f8848"); }
      rect(x + 142, 737, 8, 75, "#3f613d");
      for (let i = 0; i < 4; i++) { rect(x + 116 + i * 6, 746 + i * 10, 56 - i * 10, 7, "#78a157"); rect(x + 123 + i * 5, 740 + i * 10, 43 - i * 8, 5, "#9bb76a"); }
    }
    ctx.restore();
    if (s.stage === "darknessWarning") {
      const shade = ctx.createRadialGradient(W * .7, H * .55, 180, W * .6, H * .5, 650); shade.addColorStop(0, "#141e2b00"); shade.addColorStop(1, "#101729aa"); ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);
    }
    rect(22, H - 45, 520, 27, "#244239ed"); label("CRIES OF THE PARASINGS · SHRINK / GROW · NO LASERS", 34, H - 27, 11, "#e0e7be");
  }
  function shadowDimension() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    rect(0, 0, W, H, "#151524");
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(0, 305, s.width, 420, "#353348"); rect(0, 482, s.width, 106, "#4e495d");
    for (let x = Math.floor(camera.x / 190) * 190; x < camera.x + W + 190; x += 190) {
      rect(x + 45, 155, 20, 160, "#242032"); rect(x + 22, 175, 30, 9, "#242032"); rect(x + 11, 146, 12, 38, "#242032");
      rect(x + 60, 219, 48, 10, "#242032"); rect(x + 97, 188, 11, 40, "#242032");
      rect(x + 12, 627, 35, 5, "#464052"); rect(x + 90, 419, 22, 4, "#4f465b");
      rect(x + 130, 695, 12, 37, "#242032"); rect(x + 113, 701, 27, 7, "#242032");
    }
    for (const beacon of s.beacons) {
      const glow = ctx.createRadialGradient(beacon.x, beacon.y - 25, 2, beacon.x, beacon.y - 25, 100);
      glow.addColorStop(0, beacon.collected ? "#a0a8bc55" : "#ffe6a599"); glow.addColorStop(1, "#ffe6a500");
      ctx.fillStyle = glow; ctx.fillRect(beacon.x - 105, beacon.y - 130, 210, 210);
      rect(beacon.x - 12, beacon.y - 18, 24, 18, "#6e6883"); rect(beacon.x - 4, beacon.y - 46, 8, 28, "#a4a0b4");
      rect(beacon.x - 10, beacon.y - 60, 20, 18, beacon.collected ? "#b9bdd0" : "#ffdf88");
      label(beacon.collected ? "LIGHT RESTORED" : "+3 HEARTS", beacon.x, beacon.y + 23, 11, "#f5ddae", "center");
    }
    portal(95, 548, s.portalColor, .55); portal(s.finishX, 550, s.portalColor, 1);
    label("ESCAPE THE SHADOWS →", s.finishX, 600, 13, "#e3d8f2", "center");
    for (const shade of s.shadows) {
      if (shade.x < camera.x - 60 || shade.x > camera.x + W + 60) continue;
      const step = Math.sin(s.shadowTime * 12 + shade.x * .01) * 3;
      ctx.save(); ctx.translate(Math.round(shade.x), Math.round(shade.y)); ctx.scale(shade.dir, 1);
      ctx.globalAlpha = .9;
      rect(-16, -4, 34, 9, "#15102077"); rect(-10, -46, 20, 17, "#13101d");
      rect(-12, -29, 24, 24, "#171121"); rect(-11, -8, 8, 9 + step, "#171121"); rect(4, -8, 8, 9 - step, "#171121");
      rect(-17, -26, 6, 16, "#171121"); rect(12, -26, 6, 15, "#171121");
      rect(15, -13, 16, 12, "#171121"); rect(-5, -38, 3, 3, shade.own ? "#f4d38b" : "#bf9de4"); rect(4, -38, 3, 3, shade.own ? "#f4d38b" : "#bf9de4");
      ctx.restore();
      if (shade.own && Math.hypot(shade.x - s.player.x, shade.y - s.player.y) < 240) label("YOUR SHADOW", shade.x, shade.y - 60, 10, "#e1ccf3", "center");
    }
    if (!(s.hurt > 0 && s.stage === "shadow" && Math.floor(s.time * 15) % 2 === 0)) hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
    ctx.restore();
    // Fog covers the whole dimension; a small pool of visibility keeps nearby threats readable.
    const px = s.player.x - camera.x, py = s.player.y - camera.y - 20;
    const fog = ctx.createRadialGradient(px, py, 35, px, py, 280);
    fog.addColorStop(0, "#9a8fa31a"); fog.addColorStop(.52, "#a397ac66"); fog.addColorStop(1, "#aea3b5e8");
    ctx.fillStyle = fog; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) {
      const x = (i * 197 + s.shadowTime * (i % 2 ? 12 : -9) + 1600) % 1400 - 200, y = 55 + i * 77;
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, 190);
      cloud.addColorStop(0, "#d4cadd24"); cloud.addColorStop(1, "#d4cadd00");
      ctx.fillStyle = cloud; ctx.fillRect(x - 190, y - 190, 380, 380);
    }
    if (s.tiny) label("YOU", px, py - 15, 11, "#f7efd8", "center");
    rect(22, H - 45, 465, 27, "#252033ee"); label("THE SHADOW DIMENSION · FIND THE LIGHTS →", 34, H - 27, 12, "#eee0fa");
  }
  function puncher(actor) {
    if (!actor.alive) return;
    ctx.save(); ctx.translate(Math.round(actor.x), Math.round(actor.y)); ctx.scale(actor.dir, 1);
    const step = Math.sin(s.standTime * 10 + actor.phase) * 2, fist = actor.punch > 0 ? 20 : actor.windup > 0 ? 3 : 9;
    shadow(0, 0, 35);
    rect(-10, -46, 20, 17, "#e6b58a"); rect(-12, -48, 24, 7, "#46373d");
    rect(-5, -38, 3, 3, ink); rect(4, -38, 3, 3, ink); rect(-4, -31, 9, 2, "#7e4548");
    rect(-12, -28, 24, 21, actor.hit > 0 ? cream : ["#9c4d57", "#6e658d", "#567f83"][actor.phase % 3]);
    rect(-9, -7, 8, 7 + step, "#283447"); rect(3, -7, 8, 7 - step, "#283447");
    rect(-12, -22, 7, 12, "#e6b58a"); rect(10, -24, fist, 7, "#e6b58a"); rect(8 + fist, -28, 10, 12, "#efc59d");
    rect(-16, -68, 32, 4, "#342b3d"); rect(-16, -68, actor.hp * 16, 4, "#8cddba");
    if (actor.windup > 0) {
      ctx.strokeStyle = "#ff9b80"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -5, 72, 42, 0, 0, Math.PI * 2); ctx.stroke();
      label("PUNCH!", 0, -78, 11, "#ffcfab", "center");
    }
    ctx.restore();
  }
  function lastStand() {
    camera.x = Math.max(0, Math.min(s.width - W, s.player.x - W * .34)); camera.y = 125;
    ctx.save(); ctx.translate(-Math.round(camera.x), -camera.y);
    rect(camera.x, 0, W, 950, "#3e344e"); rect(0, 305, s.width, 420, "#697078"); rect(0, 485, s.width, 100, "#81818a");
    for (let x = Math.floor(camera.x / 180) * 180; x < camera.x + W + 180; x += 180) {
      rect(x, 100, 145, 205, "#292d43"); rect(x + 5, 107, 135, 10, "#71667d");
      for (let i = 0; i < 3; i++) { rect(x + 18 + i * 39, 140, 19, 35, "#ae9b90"); rect(x + 18 + i * 39, 210, 19, 35, "#5f677f"); }
      rect(x + 35, 530, 60, 5, "#c3c4b3"); rect(x + 105, 661, 30, 4, "#535867");
    }
    for (const wall of s.obstacles.filter(w => w.kind !== "standMachine")) {
      rect(wall.x + 4, wall.y + 6, wall.w, wall.h, "#292c3b55"); rect(wall.x, wall.y, wall.w, wall.h, "#444b62");
      rect(wall.x + 5, wall.y + 5, wall.w - 10, 10, "#aeb7bb");
      for (let y = wall.y + 22; y < wall.y + wall.h; y += 23) rect(wall.x + 3, y, wall.w - 6, 3, "#71788b");
    }
    const m = s.machine, x = m.x, y = m.y;
    if (m.destroyed) {
      rect(x - 65, y - 21, 130, 28, "#343547"); rect(x - 50, y - 48, 42, 30, "#747785"); rect(x + 15, y - 35, 38, 24, "#747785");
      label("MACHINE DISABLED", x, y - 75, 14, "#9ae5c6", "center");
    } else {
      rect(x - 60, y - 160, 120, 160, "#272b41"); rect(x - 52, y - 152, 104, 142, m.hit > 0 ? "#e8d6f3" : "#77738e");
      rect(x - 42, y - 138, 84, 46, "#2c2345"); label("CONTROL", x, y - 119, 12, "#ecb7ed", "center"); label("5 SECONDS", x, y - 100, 11, "#d9bee7", "center");
      for (let i = 0; i < 5; i++) rect(x - 35 + i * 15, y - 43, 9, 27, ["#e5a3d7", "#9bcfc6", "#dcca91"][(i + Math.floor(s.standTime * 3)) % 3]);
      ctx.save(); ctx.translate(x, y - 80); ctx.rotate(m.angle); rect(0, -9, 78, 18, "#373249"); rect(57, -6, 22, 12, "#e0b6ec"); ctx.restore();
      rect(x - 60, y - 181, 120, 7, "#342c44"); rect(x - 60, y - 181, m.hp * 10, 7, "#b7d8b8");
      label("CONTROL MACHINE", x, y - 200, 14, "#f3d8ee", "center");
      if (m.windup > 0) { ctx.strokeStyle = "#edb7e8"; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(x, y - 80); ctx.lineTo(m.aimX, m.aimY); ctx.stroke(); ctx.setLineDash([]); label("RAY!", m.aimX, m.aimY - 30, 12, "#ffd7f4", "center"); }
    }
    portal(95, 548, s.portalColor, .55);
    const clear = m.destroyed && s.punchers.every(a => !a.alive);
    portal(s.finishX, 548, clear ? "#8de7c5" : "#ae90c0", clear ? 1 : .65);
    label(clear ? "LEVEL 13 →" : "DEFEAT THE ATTACKERS + MACHINE", s.finishX, 600, 12, cream, "center");
    for (const person of s.punchers) puncher(person);
    for (const ray of s.lasers) { ctx.save(); ctx.translate(ray.x, ray.y); ctx.rotate(Math.atan2(ray.vy, ray.vx)); rect(-18, -5, 36, 10, "#d993e54d"); rect(-14, -3, 28, 6, "#e9b5f0"); rect(-11, -1, 22, 2, cream); ctx.restore(); }
    for (const zap of s.zaps) { rect(zap.x - 8, zap.y - 3, 16, 6, "#a0e5d3"); rect(zap.x - 5, zap.y - 1, 10, 2, cream); }
    if (!(s.hurt > 0 && s.stage === "lastStand" && Math.floor(s.time * 15) % 2 === 0)) hero(s.player.x, s.player.y, s.tiny ? .35 : 1, s.player.dir, s.player.moving);
    if (s.effect) label(`CONTROLLED · ${s.effect.remaining.toFixed(1)}s`, s.player.x, s.player.y - (s.tiny ? 35 : 65), 13, "#ffdbf5", "center");
    else if (s.tiny) label("YOU", s.player.x, s.player.y - 30, 11, cream, "center");
    ctx.restore();
    if (s.effect) { rect(0, 0, W, 6, "#d7a0df"); rect(0, H - 6, W * s.effect.remaining / 5, 6, "#d7a0df"); }
    rect(22, H - 45, 455, 27, "#28233eea"); label("THE LAST STAND · DODGE PUNCHES + CONTROL RAYS", 34, H - 27, 12, "#ecd9ee");
  }
  function junkSprite(item,scale=1) {
    ctx.save();ctx.translate(item.x,item.y);ctx.scale(scale,scale);ctx.rotate(item.spin||0);
    if(item.kind==='tv'){
      rect(-18,-12,36,26,'#252c38');rect(-15,-10,27,20,'#89949a');rect(-12,-7,21,14,'#6cb9cc');rect(-8,-4,13,3,'#bce4df');rect(13,-6,3,4,'#dcca9b');rect(13,1,3,4,'#dcca9b');rect(-14,14,5,3,'#272b32');rect(9,14,5,3,'#272b32');rect(-8,-18,3,6,'#778088');rect(-10,-20,3,3,'#778088');rect(1,-18,3,6,'#778088');rect(4,-21,3,3,'#778088');
    }else if(item.kind==='book'){
      rect(-11,-13,23,27,'#7d344b');rect(-8,-10,18,21,'#f0dda8');rect(-8,-12,20,4,'#c55e68');rect(-11,-13,4,27,'#ac4556');for(let y=-3;y<10;y+=4)rect(-5,y,12,1,'#b3a27a');
    }else if(item.kind==='toy'){
      rect(-13,-5,27,13,'#b45887');rect(-7,-11,15,8,'#da83a2');rect(-4,-9,9,5,'#a2d7dd');rect(-12,5,7,7,'#272c37');rect(6,5,7,7,'#272c37');rect(-10,7,3,3,'#e3c477');rect(8,7,3,3,'#e3c477');
    }else if(item.kind==='food'){
      rect(-9,-10,18,4,'#dca956');rect(-12,-6,24,6,'#edbd70');rect(-12,0,24,3,'#75a252');rect(-10,3,20,5,'#74442b');rect(-9,8,18,4,'#dca956');rect(-3,-7,3,2,'#f8df9d');rect(5,-6,2,2,'#f8df9d');
    }else{
      rect(-4,-16,8,6,'#346799');rect(-5,-10,10,4,'#b6dddf');rect(-8,-6,16,20,'#88c2d0');rect(-6,-3,12,14,'#48a6c2');rect(-8,1,16,6,'#d8e5ce');rect(-4,-4,3,4,'#dff7ee');rect(-6,14,12,3,'#6ca1b5');
    }
    ctx.restore();
  }
  function waistlanders() {
    camera.x=Math.max(0,Math.min(s.width-W,s.player.x-W*.34));camera.y=125;
    ctx.save();ctx.translate(-Math.round(camera.x),-camera.y);
    rect(camera.x,0,W,950,'#777c64');rect(0,305,s.width,420,'#a89b70');rect(0,477,s.width,108,'#bfb083');
    for(let x=Math.floor(camera.x/180)*180;x<camera.x+W+180;x+=180){
      rect(x,165,148,140,'#5d6153');rect(x+7,149,127,22,'#4a5148');for(let j=0;j<4;j++)rect(x+16+j*30,205,18,32,j%2?'#a3a37a':'#3d4b48');
      rect(x+20,630,46,5,'#857d59');rect(x+100,393,24,4,'#918660');
      junkSprite({kind:['tv','book','toy','food','bottle'][Math.abs(Math.floor(x/180))%5],x:x+110,y:290,spin:.18},.9);
    }
    for(const wall of s.obstacles){rect(wall.x+5,wall.y+7,wall.w,wall.h,'#4e503b44');rect(wall.x,wall.y,wall.w,wall.h,'#656f58');rect(wall.x-5,wall.y-8,wall.w+10,14,'#394f47');for(let x=wall.x+13;x<wall.x+wall.w;x+=25)rect(x,wall.y+15,4,wall.h-25,'#88916b');label('SCRAP',wall.x+wall.w/2,wall.y+wall.h/2,12,'#d4c89a','center');}
    portal(90,548,s.portalColor,.55);portal(s.finishX,548,'#8de7c5',1);label('ESCAPE THE WAISTLANDERS →',s.finishX,605,12,cream,'center');
    for(const pack of s.scrapHearts)if(!pack.collected){rect(pack.x-16,pack.y-24,32,24,'#ece5c5');rect(pack.x-4,pack.y-21,8,18,'#bd5c59');rect(pack.x-10,pack.y-15,20,6,'#bd5c59');}
    for(const roach of s.cockroaches){
      if(!roach.alive){if(roach.defeated>0)label('ZAP!',roach.x,roach.y-25,14,'#c4f4dc','center');continue;}
      ctx.save();ctx.translate(roach.x,roach.y);ctx.scale(roach.dir,1);shadow(0,0,54);
      const step=Math.sin(s.wasteTime*14+roach.phase)*3;for(const y of [-23,-12,-2]){rect(-27,y+step,14,3,'#49362a');rect(14,y-step,14,3,'#49362a');}
      rect(-20,-29,37,27,'#453329');rect(-16,-32,28,31,roach.hit>0?'#ead8b1':'#865737');rect(-11,-29,18,26,'#b3854b');rect(-3,-29,3,26,'#60432e');
      rect(12,-31,15,16,'#67422d');rect(23,-28,4,4,'#f0cc76');rect(19,-36,3,7,'#47382c');rect(24,-42,3,9,'#47382c');rect(28,-44,7,3,'#47382c');
      if(roach.windup>0)junkSprite({kind:['tv','book','toy','food','bottle'][roach.throwCount%5],x:33,y:-43,spin:0},.85);ctx.restore();
      if(roach.windup>0){label('THROW!',roach.x,roach.y-67,12,'#ffe2a4','center');ctx.strokeStyle='#d69d62';ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(roach.x,roach.y-20);ctx.lineTo(roach.aimX,roach.aimY);ctx.stroke();ctx.setLineDash([]);}
    }
    for(const item of s.thrownJunk){shadow(item.x,item.y+8,item.w);junkSprite(item);}
    for(const zap of s.zaps){rect(zap.x-8,zap.y-3,16,6,'#a0e5d3');rect(zap.x-4,zap.y-1,8,2,cream);}
    if(!(s.hurt>0&&s.stage==='waistlanders'&&Math.floor(s.time*15)%2===0))hero(s.player.x,s.player.y,s.tiny?.35:1,s.player.dir,s.player.moving);
    ctx.restore();rect(22,H-45,510,27,'#39473de8');label('THE WAISTLANDERS · DODGE TVS, BOOKS, TOYS + MORE',34,H-27,12,'#eee3ba');
  }
  function nextEntrance(kind) {
    if (kind === "waistlanders") waistlanders(); else if (kind === "lastStand") lastStand(); else if (kind === "shadow") shadowDimension(); else if (kind === "rainforest") rainforest(); else if (kind === "powerless") powerless(); else if (kind === "sea") seaOfMemories(); else if (kind === "colosseum") colosseum(); else if (kind === "field") field(); else if (kind === "contestants") contestants(); else if (kind === "volcano") volcano(); else mindDimension();
    rect(0, 0, W, H, `rgba(15,23,31,${Math.max(.2, 1 - s.elapsed / .8)})`);
    ctx.save(); ctx.globalAlpha = Math.min(1, Math.max(0, (2.8 - s.elapsed) / .5));
    label(`LEVEL ${["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE"][s.level]} · ${dimension().toUpperCase()}`, 500, 235, 15, "#d4dfc4", "center");
    label(kind === "waistlanders" ? "THE WAISTLANDERS" : kind === "lastStand" ? "THE LAST STAND" : kind === "shadow" ? "THE SHADOW DIMENSION" : kind === "rainforest" ? "CRIES OF THE PARASINGS" : kind === "powerless" ? "POWERLESS" : kind === "sea" ? "THE SEA OF MEMORIES" : kind === "colosseum" ? "THE HYSTERICS" : kind === "field" ? "RISE OF THE PRACTIRI" : kind === "contestants" ? "THE CONTESTANTS" : kind === "volcano" ? "OUT OF THE FLAMES" : "THE THOUGHT DIMENSION", 500, 288, 32, cream, "center");
    label(kind === "waistlanders" ? "Giant cockroaches throw TVs, books, toys, food and water bottles!" : kind === "lastStand" ? "Dodge their punches. Break the machine before its rays take control." : kind === "shadow" ? "Your own shadow is chasing you. Follow the lights through the fog." : kind === "rainforest" ? "The eagles are fast. Your fixed watch can make you small." : kind === "powerless" ? "Invisible walls. Hostile Betterworlders. One more vial." : kind === "sea" ? "Slow steps. Waving tentacles. Memories in the deep." : kind === "colosseum" ? "Ten soldiers. One accusation. Prove your innocence." : kind === "field" ? "Hungry lizards. Winding walls. Find your way home." : kind === "contestants" ? "Beware a happiness that costs you your hearts." : kind === "volcano" ? "Lava is rising. The robots are waiting. Find the exit." : "Dodge the machine. Find the thought vial.", 500, 332, 16, "#dfddeb", "center"); ctx.restore();
  }
  const titleGlyphs = {
    Z: ["11111","00001","00010","00100","01000","10000","11111"],
    A: ["01110","11011","11011","11111","11011","11011","11011"],
    P: ["11110","11011","11011","11110","11000","11000","11000"],
    M: ["10001","11011","10101","10101","10001","10001","10001"],
    N: ["10001","11001","11001","10101","10011","10011","10001"]
  };
  function pixelTitle(text, x, y, unit, color) {
    [...text].forEach((char, index) => titleGlyphs[char]?.forEach((row, j) => [...row].forEach((pixel, i) => { if (pixel === "1") rect(x + (index * 6 + i) * unit, y + j * unit, unit, unit, color); })));
  }
  function bolt(x, y, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    rect(-27, -34, 54, 64, cream); rect(-23, -30, 46, 56, ink);
    ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(18, -25); ctx.lineTo(5, -4); ctx.lineTo(17, -4); ctx.lineTo(-14, 24); ctx.lineTo(-6, 3); ctx.lineTo(-19, 3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function title() {
    const t = s.elapsed;
    if (t < .8) { prologue("sapphire"); rect(0, 0, W, H, `rgba(7,13,26,${Math.min(1, t / .8)})`); return; }
    if (t > 4.8) { city(); rect(0, 0, W, H, `rgba(7,13,26,${Math.max(0, (6 - t) / 1.2)})`); return; }
    rect(0, 0, W, H, "#070d1a");
    for (let i = 0; i < 55; i++) rect(i * 157 % W, 25 + i * 83 % 570, 2, 2, "#233752");
    bolt(300, 172, .85); label("Zapman Studios presents", 345, 181, 22, cream);
    const appear = Math.min(1, Math.max(0, (t - 1.2) / .65));
    ctx.save(); ctx.globalAlpha = appear;
    pixelTitle("ZAPMAN", 159, 292, 20, "#426276"); pixelTitle("ZAPMAN", 150, 281, 20, gold); pixelTitle("ZAPMAN", 150, 275, 20, cream);
    label("THE STRANGE WATCH", 500, 482, 16, "#81cfc9", "center"); ctx.restore();
  }
  function endScreen(won) {
    if (s.level === 13) waistlanders(); else if (s.level === 12) lastStand(); else if (s.level === 11) shadowDimension(); else if (s.level === 10) rainforest(); else if (s.level === 9) { if (s.watchRepaired) home(); else powerless(); } else if (s.level === 8) seaOfMemories(); else if (s.level === 7) colosseum(); else if (s.level === 6) volcano(); else if (s.level === 5) contestants(); else if (s.level === 4) mindDimension(); else if (s.level === 3) field(); else if (s.level === 2) wardrobeTown(); else city();
    rect(0, 0, W, H, "#0b182bdc");
    if (won && s.level === 12) {
      label("THE LAST STAND", 500, 265, 40, gold, "center");
      label("The machine is broken. You are in control again.", 500, 329, 18, cream, "center");
      label("Sapphire: You did it! Our dimension is safe.", 500, 369, 18, cream, "center");
      label("QUEST COMPLETE", 500, 425, 16, "#9fe1c7", "center"); return;
    }
    if (won && s.level === 11) {
      label("OUT OF THE SHADOWS!", 500, 265, 38, gold, "center");
      label("You escaped the fog and your shadow's chase.", 500, 329, 18, cream, "center");
      label("Sapphire: Your light is stronger than the darkness.", 500, 369, 17, cream, "center");
      label("TO BE CONTINUED", 500, 425, 14, "#c4b8de", "center"); return;
    }
    if (won && s.level === 10) {
      label("THE DARKNESS AWAITS", 500, 265, 38, gold, "center");
      label("Sapphire: There is a terrible darkness...", 500, 329, 18, cream, "center");
      label("You must defeat it.", 500, 364, 22, cream, "center");
      label("TO BE CONTINUED", 500, 425, 14, "#a9d5d4", "center"); return;
    }
    if (won) {
      for (let i = 0; i < 70; i++) rect((i * 151 + s.elapsed * 12) % W, (i * 83 + s.elapsed * 40) % H, 5, 9, [gold, "#8fe2cf", "#ffad99"][i % 3]);
      bolt(500, 205, 1.3); label(s.level === 9 ? "WATCH REPAIRED!" : s.level === 8 ? "MEMORIES RESTORED!" : s.level === 7 ? "PROVED INNOCENT!" : s.level === 6 ? "OUT OF THE FLAMES!" : s.level === 5 ? "THE THOUGHT PORTAL!" : s.thoughtVialCollected ? "THOUGHT VIAL FOUND!" : "DIMENSION SAVED!", 500, 331, 38, gold, "center");
      label("Sapphire: I knew you could do it.", 500, 381, 18, cream, "center");
      label("A small watch. A very big adventure.", 500, 418, 16, "#a9d5d4", "center");
    } else {
      if (s.playerPeopleRobot) { ctx.save(); ctx.translate(500, 223); ctx.scale(3, 3); drawPerson({ x: 0, y: 0, peopleRobot: true, changeTime: 0 }); ctx.restore(); }
      label(s.playerPeopleRobot || s.converted ? "GAME OVER" : "OUT OF ZAP", 500, 287, 48, "#ffac94", "center"); label(s.playerPeopleRobot ? "You became a people-robot!" : s.converted ? "You became an MBS Guardian." : "Your story isn't over yet.", 500, 336, 20, cream, "center"); label(s.battleCheckpoint ? "Retry the arena below, or press R." : `Retry Level ${s.level} below, or press R.`, 500, 376, 16, "#a9d5d4", "center");
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (s.stage === "title") title();
    else if (s.stage === "waistlandersGate") nextEntrance("waistlanders");
    else if (s.stage === "waistlanders") waistlanders();
    else if (s.stage === "lastStandGate") nextEntrance("lastStand");
    else if (s.stage === "lastStand") lastStand();
    else if (s.stage === "shadowGate") nextEntrance("shadow");
    else if (s.stage === "shadow") shadowDimension();
    else if (s.stage === "rainforestGate") nextEntrance("rainforest");
    else if (s.stage === "rainforest" || s.stage === "darknessWarning") rainforest();
    else if (s.stage === "powerlessGate") nextEntrance("powerless");
    else if (s.stage === "powerless") powerless();
    else if (s.stage === "seaGate") nextEntrance("sea");
    else if (s.stage === "sea") seaOfMemories();
    else if (s.stage === "colosseumGate") nextEntrance("colosseum");
    else if (["romanAccusation", "colosseum", "romanReward", "romanThanks", "romanExit", "romanPortal"].includes(s.stage)) colosseum();
    else if (s.stage === "volcanoGate") nextEntrance("volcano");
    else if (s.stage === "volcano") volcano();
    else if (s.stage === "contestGate") nextEntrance("contestants");
    else if (["contestants", "computerSpeech", "defiance", "guardianDoor", "arena", "computerExplosion", "thoughtExit"].includes(s.stage)) contestants();
    else if (s.stage === "fieldGate") nextEntrance("field");
    else if (s.stage === "field") field();
    else if (s.stage === "mindGate") nextEntrance("mind");
    else if (s.stage === "mind") mindDimension();
    else if (["homeArrival", "homeDialogue", "homeReply", "homePortal", "vialReturn", "contestReveal", "powerlessReturn", "repairOffer", "watchRepair", "repairedHome", "rainforestMission", "rainforestPortal", "shadowReturn", "lastStandQuest"].includes(s.stage)) home();
    else if (s.stage === "wardrobeHome") wardrobeHome();
    else if (["wardrobeBreach", "wardrobe", "wardrobeCured"].includes(s.stage)) wardrobeTown();
    else if (s.stage === "city") city();
    else if (s.stage === "won" || s.stage === "lost") endScreen(s.stage === "won");
    else prologue();
    if (s.stage === "sea" && s.inkBlind > 0) {
      rect(0, 0, W, H, "#07050bf7");
      label(`INK! · ${s.inkBlind.toFixed(1)}s`, W / 2, H / 2 - 12, 28, "#ddc8ea", "center");
      label("Keep moving. Your view will clear...", W / 2, H / 2 + 26, 15, "#a592b9", "center");
    }
  }
  const stories = {
    watch: ["PROLOGUE", "The strange watch", "AN ORDINARY DAY", "You find a strange watch.", [["advance", "Put it in your bag →"]]],
    bag: ["PROLOGUE", "One little button", "THE STRANGE WATCH", "You put it in your bag. Then you notice a button on the side…", [["advance", "Press the button →"]]],
    portal: ["PROLOGUE", "A door to somewhere else", "IT OPENS A PORTAL!", "The watch hums. A glowing portal opens! Use the arrows or WASD to walk into it.", []],
    sapphire: ["THE OTHER SIDE", "Meet Sapphire", "SAPPHIRE", "You must go on a daring quest to save your dimension. Will you help?", [["yes", "YES · I'll help!"], ["no", "Not yet"]]],
    title: ["ZAPMAN STUDIOS", "Presents", "YOUR ADVENTURE BEGINS", "One watch. One portal. Your dimension needs you.", []],
    city: ["LEVEL 01", "The city between dimensions", "REACH THE PORTAL HOME →", "Robots fire lasers when they see you. Press C to shrink: they won't notice you, but contact and existing lasers still hurt. Reach the chequered line to enter Level 2: The Rip in the Wardrobe.", []],
    wardrobeHome: ["LEVEL 02", "The Rip in the Wardrobe", "A PORTAL IN YOUR HOUSE", "You are back in your house. A strange rip opens inside the wardrobe... it is a portal! Robots are coming through. You run outside!", []],
    wardrobeBreach: ["LEVEL 02", "The Rip in the Wardrobe", "THEY BREAK THE DOOR DOWN", "You are outside. The robots break down your front door and pour into the town. Their launchers fire scorpions that chase the people!", []],
    wardrobe: ["LEVEL 02", "The Rip in the Wardrobe", "FIND THE ANTIDOTE →", "Scorpions turn caught townspeople into people-robots. If one catches YOU, you become a people-robot too: GAME OVER, even when tiny! Dodge them and find the green antidote at the far end to cure the town. Arrows/WASD move; C shrinks or grows.", []],
    wardrobeCured: ["LEVEL 02", "The antidote", "THE TOWN IS SAVED", "You found the antidote! The scorpions disappear and the people-robots become human again. The next portal leads to Rise of the Practiri.", []],
    fieldGate: ["LEVEL 03", "Rise of the Practiri", "BEYOND THE TOWN", "The town is saved. A grassy field stretches towards your house, but the Practiri have risen: hungry lizards are eating people. Dodge the walls and get home!", []],
    field: ["LEVEL 03", "Rise of the Practiri", "GET HOME SAFELY →", "Weave around the stone walls and stay out of Practiri jaws. They swallow wandering people! C shrinks you to escape distant lizards, but close bites still hurt. Your house is at the far end.", []],
    homeArrival: ["HOME", "An unexpected visitor", "THE PORTAL OPENS", "You made it back to your house. A portal shimmers beside it… Sapphire is coming through!", []],
    homeDialogue: ["HOME", "Sapphire's next quest", "SAPPHIRE", "You need to find a thought vial at the end of the next dimension.", [["advance", "Okay →"]]],
    homeReply: ["HOME", "The next adventure", "YOU", "Okay.", []],
    homePortal: ["HOME", "The next adventure", "STEP THROUGH THE PORTAL", "Sapphire: The thought machine stands in the middle of the next dimension. Its lasers can make you do random things for two seconds. Find the vial at the far end!", []],
    mindGate: ["LEVEL 04", "The Thought Dimension", "THE THOUGHT MACHINE", "A machine waits in the middle of this dimension, firing thought rays. Dodge them and find the thought vial at the end.", []],
    mind: ["LEVEL 04", "The Thought Dimension", "FIND THE THOUGHT VIAL →", "Go around the central machine and dodge its thought lasers. A hit causes random walking, reversed controls, dancing or freezing for 2 seconds, then control returns. Collect the vial at the far end.", []],
    vialReturn: ["BACK WITH SAPPHIRE", "The thought vial", "YOU", "You return to Sapphire with the thought vial from the machine's dimension.", [["advance", "Give Sapphire the thought vial →"]]],
    contestReveal: ["A NEW DIMENSION", "Dimension 3564", "SAPPHIRE", "Aha! I have found your next dimension! It is Dimension 3564, The Contestants!", [["advance", "Enter Dimension 3564 →"]]],
    contestGate: ["LEVEL 05", "Dimension 3564: The Contestants", "MBS GUARDIANS", "The MBS Guardians carry tablets. Their rays make you really, really happy and super quick… but slowly drain your hearts. Your watch can fight back: J, Space, click, or hold WATCH ZAP.", []],
    contestants: ["LEVEL 05 · DIMENSION 3564", "The Contestants", "HAPPINESS HAS A PRICE", "Defeat the tablet-carrying MBS Guardians with J / Space / click / WATCH ZAP. Pink rays give you a huge speed boost for 4 seconds, but drain a heart every 2 seconds. Friendly people wander and follow you nearby. Reach the computer at the end.", []],
    computerSpeech: ["THE EVOLVED COMPUTER", "The trap", "COMPUTER", "Mwah ha ha! I evolved! You will do nicely for my team of Guardians!", [["advance", "NO! I will not surrender."]]],
    defiance: ["THE TRAP", "No surrender", "YOU SHOUT", "NO! I will not surrender.", []],
    guardianDoor: ["THE DOOR OPENS", "The final battle", "MORE GUARDIANS", "A door slides open. More Guardians arrive with probes and tablets. Their purple conversion beams turn you into a Guardian in one touch. Dodge and fire your watch!", []],
    arena: ["LEVEL 05 · FINAL BATTLE", "No surrender", "DODGE THE CONVERSION BEAMS", "J / Space / click / WATCH ZAP defeats the Guardians. One purple beam or touching a Guardian transforms you: GAME OVER. Defeat them all to destroy the computer. Retry starts here if you're caught.", []],
    computerExplosion: ["THE COMPUTER IS DEFEATED", "The thought portal", "COMPUTER", "Noooooo!", []],
    thoughtExit: ["THE THOUGHT PORTAL", "Another thought vial", "THE COMPUTER EXPLODES", "You defeated all the Guardians! The computer blows up and a thought portal opens. Pick up the second thought vial on the plinth, then step into the portal.", []],
    volcanoGate: ["LEVEL 06 · DIMENSION 6493", "Out of the Flames", "INSIDE THE VOLCANO", "The thought portal opens inside a volcano! Lava spurts from cracks in the rock, and hostile robots guard the way out.", []],
    volcano: ["LEVEL 06 · DIMENSION 6493", "Out of the Flames", "ESCAPE THE VOLCANO →", "Dodge lava vents: an amber ring and ! warn before each spurt. J / Space / click / WATCH ZAP defeats the robots. Shrinking hides you from their aim, but lava and existing lasers still hurt. The green exit leads to Level 7: The Hysterics.", []],
    colosseumGate: ["LEVEL 07", "The Hysterics", "THE ROMAN COLOSSEUM", "The portal opens inside a Roman colosseum. Tipped-over wine bottles lie on the sand. Ten Roman soldiers turn towards you...", []],
    romanAccusation: ["LEVEL 07", "The Hysterics", "ROMAN SOLDIERS", "You are a villain! Get him!", [["advance", "Fight the ten soldiers →"]]],
    colosseum: ["LEVEL 07", "The Hysterics", "PROVE YOUR INNOCENCE", "Defeat all ten Roman soldiers. J / Space / click / WATCH ZAP fires your watch. Each soldier yields after two hits. A red ring warns before a spear attack: keep moving! Arrows/WASD move, C shrinks. The tipped wine bottles are scattered across the arena.", []],
    romanReward: ["THE FIGHT IS OVER", "Proved innocent", "ROMAN SOLDIERS", "You are proved of innocence. Let us give you a reward. The vial!", [["advance", "Take the vial →"]]],
    romanThanks: ["THE VIAL", "A friendly farewell", "YOU", "Thanks! You smile, and the Roman soldiers smile back.", []],
    romanExit: ["LEVEL 07", "The Hysterics", "TIME TO LEAVE", "The vial is yours. Walk to the arch on the right to open your portal and leave the colosseum.", []],
    romanPortal: ["THE PORTAL OPENS", "A confused farewell", "ROMAN SOLDIERS", "A portal?! The soldiers look confused as you step through with the vial. Next stop: Level 8, The Sea of Memories.", []],
    seaGate: ["LEVEL 08", "The Sea of Memories", "BENEATH THE WAVES", "Your portal from the Roman colosseum opens into a blue sea. Familiar memories float in bubbles, and octopuses wave their tentacles below. The water makes you slightly slower.", []],
    sea: ["LEVEL 08", "The Sea of Memories", "CROSS THE SEA →", "You are 15% slower in the water. Octopuses shoot ink at you: a hit darkens your view for 2 seconds! Dodge the ink or shelter behind coral-covered rocks. Their tentacles cost a heart on contact. Arrows/WASD move, C shrinks. Find the glowing portal at the far end to enter Level 9: Powerless.", []],
    powerlessGate: ["LEVEL 09", "Powerless", "BETTERWORLD", "Beyond the sea, a thought vial waits in Betterworld. Hostile Betterworlders patrol the streets. Something is wrong with your watch...", []],
    powerless: ["LEVEL 09", "Powerless", "FIND ANOTHER THOUGHT VIAL →", "Get past the hostile Betterworlders and invisible barriers. Walk around anything that blocks you; a brief shimmer shows when you bump into a barrier. Try C or the Shrink button to use your watch. The thought vial waits at the far end.", []],
    powerlessReturn: ["BACK WITH SAPPHIRE", "The Powerless vial", "A SAFE RETURN", "With another thought vial in your hand, you return to Sapphire. Your watch is still jammed, but she is waiting to help.", []],
    repairOffer: ["BACK WITH SAPPHIRE", "A jammed watch", "SAPPHIRE", "You found the thought vial! Your watch is jammed? Give it to me — I'll fix it for you.", [["advance", "Give Sapphire the vial and watch →"]]],
    watchRepair: ["SAPPHIRE'S WORKBENCH", "Fixing your watch", "SAPPHIRE", "There is the problem! Let me unjam the mechanism... nearly done...", []],
    repairedHome: ["WATCH REPAIRED", "Your powers are back", "SAPPHIRE", "All fixed! Try shrinking with C and firing your watch with J or Space. Your powers work again. Take a moment to try them, then ask Sapphire about your next quest.", [["advance", "Thanks, Sapphire! What next? →"]]],
    rainforestMission: ["A NEW DIMENSION", "Cries of the Parasings", "SAPPHIRE", "Your watch is fixed. I need you to enter the rainforest dimension: Cries of the Parasings. The eagles there fly fast. Use shrinking and growing, but do not fire lasers in this dimension.", [["advance", "Enter the rainforest portal →"]]],
    rainforestPortal: ["SAPPHIRE'S NEXT QUEST", "Cries of the Parasings", "STEP THROUGH THE PORTAL", "Sapphire sends you to another dimension. Walk into the glowing portal on the right. Your fixed watch will let you shrink and grow in the rainforest.", []],
    rainforestGate: ["LEVEL 10", "Cries of the Parasings", "THE RAINFOREST", "Cries echo through the rainforest canopy. Eagles flash between the trees, much faster than you can run. Your watch is repaired: shrink and grow, but no lasers here.", []],
    rainforest: ["LEVEL 10", "Cries of the Parasings", "GET THROUGH THE RAINFOREST →", "Arrows/WASD move. C shrinks and grows. Fast eagles mark a dive before swooping at that spot; keep moving! Tiny travellers won't attract new dives, but birds and dives already in motion still hurt. Walk around mossy roots and reach Sapphire at the far end. Lasers are disabled.", []],
    darknessWarning: ["SAPPHIRE'S WARNING", "A terrible darkness", "SAPPHIRE", "There is a terrible darkness... You must defeat it.", [["advance", "Enter the Shadow Dimension →"]]],
    shadowGate: ["LEVEL 11", "The Shadow Dimension", "INTO THE FOG", "Sapphire sends you into the terrible darkness. Fog fills this dimension, and shadows wait everywhere. Even your own shadow has come alive. Follow the lights to the far portal.", []],
    shadow: ["LEVEL 11", "The Shadow Dimension", "ESCAPE THE SHADOWS →", "Arrows/WASD move. Your own shadow and the other shadows chase you at both sizes. Keep moving through the thick fog. Three glowing lights each restore up to three hearts and push nearby shadows away. Reach the portal at the far end. C still shrinks and grows; watch lasers are unavailable here.", []],
    shadowReturn: ["BACK WITH SAPPHIRE", "Out of the shadows", "YOU", "You escaped the fog and return through the portal to Sapphire. She has another quest for you.", []],
    lastStandQuest: ["SAPPHIRE'S NEXT QUEST", "The Last Stand", "SAPPHIRE", "You escaped the Shadow Dimension! I need you for one more quest: The Last Stand. Hostile people will try to punch you, and a machine fires rays that control you for five seconds. Use your repaired watch to stop them and break the machine. I am sending you through this portal. Are you ready?", [["advance", "Begin The Last Stand →"]]],
    lastStandGate: ["LEVEL 12", "The Last Stand", "A NEW DIMENSION", "Sapphire sends you into a city square filled with hostile people. The control machine hums in the middle. Dodge punches, avoid its rays, and make your last stand.", []],
    lastStand: ["LEVEL 12", "The Last Stand", "BREAK THE CONTROL MACHINE →", "Arrows/WASD move. C shrinks and grows. J/Space, click, or WATCH ZAP fires your repaired watch. Attackers show a PUNCH! ring before striking. The machine marks an aimed ray; a hit takes over your movement and watch for five seconds, then control returns. Use cover, defeat the attackers and break the machine, then reach the far portal to enter Level 13, The Waistlanders.", []],
    waistlandersGate: ["LEVEL 13", "The Waistlanders", "THE SCRAP DIMENSION", "Beyond the broken control machine lies a land of discarded things. Giant cockroaches lift old televisions, books, toys, food and water bottles. Watch what they are about to throw!", []],
    waistlanders: ["LEVEL 13", "The Waistlanders", "DODGE THE FLYING RUBBISH →", "Arrows/WASD move. Cockroaches show THROW! and aim before launching TVs, books, toy cars, food and water bottles. Dodge their shots or use scrap walls for cover. C shrinks and grows; tiny travellers attract fewer new throws, but flying objects still hurt. J/Space, click or WATCH ZAP fights back. Rescue packs restore two hearts. Reach the far portal to escape.", []],
    won: ["QUEST COMPLETE", "The Waistlanders", "SAPPHIRE", "You escaped The Waistlanders! The cockroaches and their flying rubbish are behind you. You made it safely through the portal.", [["restart", "Play the story again"]]],
    lost: ["TRY AGAIN", "The city between dimensions", "KEEP YOUR SPARK", "You ran out of hearts. Retry from the safe arrival garden with five new hearts.", [["retry", "Retry city →"], ["restart", "Restart story"]]]
  };
  function syncUI() {
    window.ZapmanTitleMusic?.sync(s.stage,s.paused);
    const key = [s.stage, s.paused, s.health, s.tiny, s.noticeTime > 0 ? s.notice : "", s.effect?.kind || "", s.happy > 0, s.converted, s.inkBlind > 0, s.playerPeopleRobot, s.jamDiscovered, s.watchRepaired].join("|");
    if (key !== uiKey) {
      const stageChanged = uiKey.split("|")[0] !== s.stage;
      uiKey = key;
      const [chapter, mission, speaker, text, actions] = s.stage === "lost" && s.level > 1
        ? [`TRY AGAIN · LEVEL ${String(s.level).padStart(2, "0")}`, ["", "", "The Rip in the Wardrobe", "Rise of the Practiri", "The Thought Dimension", "Dimension 3564: The Contestants", "Out of the Flames · Dimension 6493", "The Hysterics", "The Sea of Memories", "Powerless", "Cries of the Parasings", "The Shadow Dimension", "The Last Stand", "The Waistlanders"][s.level], s.playerPeopleRobot ? "GAME OVER · YOU BECAME A PEOPLE-ROBOT" : s.converted ? "GAME OVER · YOU BECAME A GUARDIAN" : "KEEP YOUR SPARK", s.playerPeopleRobot ? "A scorpion caught you and turned you into a people-robot! Retry Level 2 to return as yourself and find the antidote." : s.converted ? "A conversion beam or Guardian touched you. You became an MBS Guardian! Retry the arena to fight again." : `Retry Level ${s.level} with five hearts; you won't need to replay the earlier levels.`, [["retry", s.battleCheckpoint ? "Retry arena →" : `Retry Level ${s.level} →`], ["restart", "Restart story"]]]
        : stories[s.stage];
      const numberedScene = s.stage !== "repairedHome" && (playingStages.includes(s.stage) || ["wardrobeHome", "wardrobeBreach", "wardrobeCured", "fieldGate", "mindGate", "contestGate", "volcanoGate", "colosseumGate", "romanAccusation", "romanReward", "romanThanks", "romanPortal", "seaGate", "powerlessGate", "rainforestGate", "shadowGate", "lastStandGate", "waistlandersGate", "guardianDoor", "computerSpeech", "defiance", "computerExplosion"].includes(s.stage));
      ui.chapter.textContent = s.stage === "lost" ? `TRY AGAIN · ${dimension().toUpperCase()}` : numberedScene ? `LEVEL ${String(s.level).padStart(2, "0")} · ${dimension().toUpperCase()}` : chapter;
      ui.mission.textContent = mission; ui.speaker.textContent = speaker;
      ui.story.textContent = s.noticeTime > 0 && s.notice ? s.notice : text;
      // Rebuild action buttons only on a scene change, retaining keyboard focus after “Not yet”.
      if (stageChanged) ui.actions.innerHTML = actions.map(([action, text]) => `<button type="button" data-action="${action}">${text}</button>`).join("");
      ui.cityHud.hidden = ![...playingStages, "lost", "won"].includes(s.stage);
      ui.hearts.textContent = "♥ ".repeat(s.health).trim() + " ♡".repeat(5 - s.health); ui.hearts.setAttribute("aria-label", `${s.health} hearts`);
      ui.sizeState.textContent = s.playerPeopleRobot ? "PEOPLE-ROBOT" : s.level === 12 ? (s.tiny ? "TINY · WATCH READY" : "NORMAL SIZE · WATCH READY") : s.level === 11 ? (s.tiny ? "TINY · SHADOWS STILL FOLLOW" : "SHADOWS ARE CHASING YOU") : s.level === 10 ? (s.tiny ? "TINY · NO NEW DIVES" : "SHRINK / GROW · NO LASERS") : s.watchRepaired ? (s.tiny ? "TINY · WATCH FIXED" : "NORMAL SIZE · WATCH FIXED") : s.level === 9 ? (s.jamDiscovered ? "WATCH JAMMED · NO POWERS" : "NORMAL SIZE") : s.level === 8 ? `${s.tiny ? "TINY" : "NORMAL SIZE"} · WATER SLOWS YOU` : s.tiny ? (s.level === 7 ? "TINY · DODGE THE SPEARS" : s.level === 2 ? "TINY · SCORPIONS STILL CONVERT" : s.level === 4 || s.level === 5 ? "TINY · RAYS STILL HIT" : "TINY · UNNOTICED") : "NORMAL SIZE";
      ui.shrink.textContent = s.level === 9 && s.jamDiscovered ? "C · Watch jammed" : s.tiny ? "C · Grow" : "C · Shrink"; ui.shrink.disabled = !playingStages.includes(s.stage) || s.paused || s.stage === "lastStand" && Boolean(s.effect); ui.shrink.setAttribute("aria-pressed", String(s.tiny));
      ui.pause.disabled = ![...playingStages, "title", "portal", "homePortal", "wardrobeHome", "wardrobeBreach", "wardrobeCured", "colosseumGate", "romanAccusation", "romanReward", "romanThanks", "romanPortal", "powerlessReturn", "repairOffer", "watchRepair", "rainforestMission", "rainforestPortal", "darknessWarning", "shadowGate", "shadowReturn", "lastStandQuest", "lastStandGate", "waistlandersGate"].includes(s.stage); ui.pause.textContent = s.paused ? "Resume" : "Pause"; ui.paused.hidden = !s.paused;
      ui.touchAction.hidden = !["watch", "bag", "sapphire", "homeDialogue", "vialReturn", "contestReveal", "computerSpeech", "romanAccusation", "romanReward", "repairOffer", "repairedHome", "rainforestMission", "darknessWarning", "lastStandQuest"].includes(s.stage); ui.touchAction.textContent = s.stage === "repairedHome" ? "Thanks, Sapphire!" : s.stage === "sapphire" ? "YES · Help" : s.stage === "homeDialogue" ? "Okay" : s.stage === "computerSpeech" ? "NO!" : "E · Continue";
      ui.zap.hidden = !["contestants", "arena", "volcano", "colosseum", "repairedHome", "lastStand", "waistlanders"].includes(s.stage); ui.zap.disabled = s.paused || s.stage === "lastStand" && Boolean(s.effect);
      ui.skipLevel.disabled = !playingStages.includes(s.stage) && s.stage !== "lost";
      if (stageChanged && [...playingStages, "portal", "homePortal", "rainforestPortal"].includes(s.stage)) canvas.focus({ preventScroll: true });
      else if (stageChanged) ui.actions.querySelector("button")?.focus({ preventScroll: true });
    }
    if (s.effect) ui.sizeState.textContent = `${s.effect.label} · ${s.effect.remaining.toFixed(1)}s`;
    if (s.happy > 0) ui.sizeState.textContent = `OVERJOYED · ${s.happy.toFixed(1)}s · ♥ ↓`;
    if (s.stage === "sea" && s.inkBlind > 0) ui.sizeState.textContent = `INK · ${s.inkBlind.toFixed(1)}s`;
    ui.distance.textContent = s.level === 13 ? `EXIT · ${Math.round(Math.hypot(s.finishX-s.player.x,535-s.player.y))}m · ${s.cockroaches.filter(r=>r.alive).length} COCKROACHES` : s.level === 12 ? `${s.punchers.filter(p => p.alive).length} ATTACKERS · MACHINE ${s.machine?.destroyed ? "OFF" : `${s.machine?.hp}/12`}` : s.level === 11 ? `EXIT · ${Math.round(Math.hypot(s.finishX - s.player.x, 535 - s.player.y))}m · ${s.beacons.filter(b => !b.collected).length} LIGHTS LEFT` : s.level === 10 ? `SAPPHIRE · ${Math.round(Math.hypot(s.finishX - s.player.x, 535 - s.player.y))}m` : s.watchRepaired ? "POWERS RESTORED" : ["powerlessReturn", "repairOffer", "watchRepair"].includes(s.stage) ? "BACK WITH SAPPHIRE" : s.level === 9 && s.vial ? `VIAL · ${Math.round(Math.hypot(s.vial.x - s.player.x, s.vial.y - s.player.y))}m` : s.level === 2 ? `ANTIDOTE · ${Math.round(Math.hypot(s.finishX - s.player.x, 535 - s.player.y))}m · ${s.people.filter(person => person.peopleRobot).length} PEOPLE-ROBOTS` : s.level === 7 ? (s.romanWon ? `PORTAL · ${Math.round(Math.hypot(s.finishX - s.player.x, 535 - s.player.y))}m` : `${s.soldiers.filter(soldier => soldier.alive).length} OF 10 SOLDIERS LEFT`) : s.level === 6 || s.level === 8 ? `EXIT · ${Math.round(Math.hypot(s.finishX - s.player.x, 535 - s.player.y))}m` : s.level === 5 ? (s.portalOpen ? (s.secondVialCollected ? "ENTER THOUGHT PORTAL →" : "COLLECT THOUGHT VIAL →") : `${s.guardians.filter(g => g.alive).length} GUARDIANS LEFT`) : s.level === 4 && s.vial ? `VIAL · ${Math.round(Math.hypot(s.vial.x - s.player.x, s.vial.y - s.player.y))}m` : `${s.level === 3 ? "HOME" : "FINISH"} · ${Math.max(0, Math.round(s.finishX - s.player.x))}m`;
  }
  function action(name) {
    if (name === "advance") game.advance();
    if (name === "yes") game.acceptQuest();
    if (name === "no") game.declineQuest();
    if (name === "restart") game.restart();
    if (name === "retry") game.retryLevel();
    if (name === "skip") game.skipLevel();
    syncUI();
  }
  ui.actions.addEventListener("click", event => { const button = event.target.closest("[data-action]"); if (button) action(button.dataset.action); });
  ui.replay.addEventListener("click", () => action("restart"));
  ui.skipLevel.addEventListener("click", () => action("skip"));
  ui.zap.addEventListener("click", () => { game.shootZap(); syncUI(); });
  ui.zap.addEventListener("pointerdown", event => { event.preventDefault(); ui.zap.setPointerCapture?.(event.pointerId); game.keys.add("j"); game.shootZap(); });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => ui.zap.addEventListener(type, () => game.keys.delete("j")));
  canvas.addEventListener("pointerdown", () => { game.shootZap(); syncUI(); });
  ui.shrink.addEventListener("click", () => { game.toggleShrink(); syncUI(); canvas.focus({ preventScroll: true }); });
  ui.pause.addEventListener("click", () => { game.togglePause(); syncUI(); }); ui.resume.addEventListener("click", () => { game.togglePause(); syncUI(); canvas.focus({ preventScroll: true }); });
  ui.touchAction.addEventListener("click", () => action(s.stage === "sapphire" ? "yes" : "advance"));
  window.addEventListener("keydown", event => {
    if (event.target?.closest?.("input, textarea, select, dialog")) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) event.preventDefault();
    if (key === " " && event.target === canvas && ["contestants", "arena", "volcano", "colosseum", "repairedHome", "lastStand", "waistlanders"].includes(s.stage)) event.preventDefault();
    game.keys.add(key);
    if (event.repeat) return;
    if (key === "c") { game.toggleShrink(); syncUI(); }
    if (key === "j" || key === " " && event.target === canvas) { game.shootZap(); syncUI(); }
    if (key === "p" || key === "Escape") { game.togglePause(); syncUI(); }
    if (key === "e" || (key === "Enter" && event.target === canvas)) action("advance");
    if (key === "r" && s.stage === "lost") action("retry");
  });
  window.addEventListener("keyup", event => game.keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
  const releaseKeys = () => game.keys.clear();
  window.addEventListener("blur", releaseKeys); document.addEventListener("visibilitychange", () => { if (document.hidden) releaseKeys(); });
  document.querySelectorAll("[data-key]").forEach(button => {
    button.addEventListener("pointerdown", event => { event.preventDefault(); button.setPointerCapture(event.pointerId); game.keys.add(button.dataset.key); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => button.addEventListener(type, () => game.keys.delete(button.dataset.key)));
  });
  function frame(time) {
    const dt = lastTime === null ? 0 : Math.min(.05, Math.max(0, (time - lastTime) / 1000)); lastTime = time;
    if (!document.hidden) game.update(dt);
    window.ZapmanArcadeAudio?.register(()=>({active:playingStages.includes(s.stage),paused:s.paused,lost:s.stage==='lost',won:s.stage==='won',stage:s.stage,health:s.health,level:s.level,reward:s.beacons?.filter(b=>b.collected).length||0,shots:s.zaps?.length||0,throwCount:s.junkSerial||0,music:s.stage!=='title',mood:['shadow','powerless'].includes(s.stage)?'stealth':['arena','lastStand','volcano'].includes(s.stage)?'combat':s.stage==='sea'?'forest':'adventure'}));
  syncUI(); draw(); requestAnimationFrame(frame);
  }
  window.ZapmanEducation?.register({ lost: () => s.stage === "lost", restore: () => { game.retryLevel(); syncUI(); draw(); }, release: () => game.keys.clear() });
  syncUI(); draw(); requestAnimationFrame(frame);
})();
