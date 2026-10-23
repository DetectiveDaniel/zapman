(() => {
  "use strict";
  const raceParams = new URL(window.location.href).searchParams;
  const carMode = raceParams.get("vehicle") === "car";
  const brownyMode = carMode && raceParams.get("browny") === "1";
  const bestTimesKey = carMode ? "browny-car-best-times" : "bye-cycle-best-times";
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const menu = document.querySelector("#menu");
  const overlay = document.querySelector("#overlay");
  const status = document.querySelector("#status");
  const viewButton = document.querySelector("#perspective");
  const pauseButton = document.querySelector("#pause");
  const menuButton = document.querySelector("#menuButton");
  const W = canvas.width, H = canvas.height, TAU = Math.PI * 2;
  const keys = new Set();
  const colors = ["#d8ff3e", "#ff735e", "#69d9ff", "#d79afa", "#fff2be"];
  const tracks = [
    { name: "Seaside Sprint", description: "Wide bends · coastal circuit", ground: "#5fa951", sky: "#81d5ee", road: "#687775", width: 116, laps: 3, pace: 145,
      points: [[1280, 620], [1280, 290], [1100, 160], [500, 160], [170, 280], [150, 610], [340, 850], [880, 850], [1120, 770]] },
    { name: "City Switchbacks", description: "Tight turns · technical circuit", ground: "#283437", sky: "#91bfc6", road: "#495154", width: 104, laps: 3, pace: 127,
      points: [[1340, 660], [1340, 210], [1120, 150], [230, 150], [140, 310], [210, 470], [550, 470], [640, 610], [640, 810], [840, 840], [910, 610], [1060, 610], [1090, 840], [1280, 840]] },
    { name: "Sunset Speedway", description: "Fast straights · figure-eight bends", ground: "#a08758", sky: "#f4b181", road: "#655b58", width: 118, laps: 3, pace: 155,
      points: [[1320, 600], [1280, 260], [1060, 150], [860, 250], [660, 470], [420, 730], [180, 740], [130, 520], [250, 220], [440, 190], [650, 340], [850, 650], [1080, 850], [1300, 800]] },
  ];
  let selected = 0, track, racers = [], player, state = "menu", view = "overhead";
  let countdown = 3, elapsed = 0, lastTime = 0, finishCount = 0, finishTime = 0;
  let notice = "", noticeTime = 0, bestTimes = {};
  try { bestTimes = JSON.parse(localStorage.getItem(bestTimesKey)) || {}; } catch { /* Racing works without storage. */ }
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const wrap = (n, length) => ((n % length) + length) % length;
  const angleDifference = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const timeText = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(2).padStart(5, "0")}`;

  // Smooth each closed circuit, then measure its actual length for AI and checkpoints.
  function makeTrack(definition) {
    const samples = [], points = definition.points;
    for (let i = 0; i < points.length; i++) {
      const p0 = points[wrap(i - 1, points.length)], p1 = points[i];
      const p2 = points[(i + 1) % points.length], p3 = points[(i + 2) % points.length];
      for (let j = 0; j < 40; j++) {
        const t = j / 40, t2 = t * t, t3 = t2 * t;
        const interpolate = (axis) => .5 * (2 * p1[axis] + (-p0[axis] + p2[axis]) * t + (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 + (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3);
        samples.push({ x: interpolate(0), y: interpolate(1), s: 0 });
      }
    }
    let length = 0;
    for (let i = 0; i < samples.length; i++) {
      const a = samples[i], b = samples[(i + 1) % samples.length];
      a.s = length; a.segment = Math.hypot(b.x - a.x, b.y - a.y);
      a.angle = Math.atan2(b.y - a.y, b.x - a.x); length += a.segment;
    }
    return { ...definition, samples, length };
  }
  function atDistance(distance, lane = 0) {
    const s = wrap(distance, track.length), points = track.samples;
    let low = 0, high = points.length - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (points[middle].s <= s) low = middle; else high = middle - 1;
    }
    const a = points[low], b = points[(low + 1) % points.length], t = (s - a.s) / a.segment;
    return { x: a.x + (b.x - a.x) * t - Math.sin(a.angle) * lane, y: a.y + (b.y - a.y) * t + Math.cos(a.angle) * lane, angle: a.angle };
  }
  function nearest(x, y) {
    let result = { distance: Infinity, s: 0, x: 0, y: 0, angle: 0 };
    track.samples.forEach((a, i) => {
      const b = track.samples[(i + 1) % track.samples.length];
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (a.segment * a.segment), 0, 1);
      const px = a.x + dx * t, py = a.y + dy * t, distance = Math.hypot(x - px, y - py);
      if (distance < result.distance) result = { distance, s: a.s + t * a.segment, x: px, y: py, angle: a.angle };
    });
    return result;
  }
  function renderChoices() {
    const choices = document.querySelector("#raceChoices");
    choices.innerHTML = tracks.map((circuit, i) => {
      const points = circuit.points.map(([x, y]) => `${x / 32},${y / 24}`).join(" ");
      const best = Number(bestTimes[i]);
      return `<button type="button" class="race-choice" data-race="${i}" aria-pressed="${i === selected}"><svg viewBox="0 0 48 44" aria-hidden="true"><polygon points="${points}" fill="none" stroke="${i === selected ? '#d8ff3e' : '#92aeae'}" stroke-width="3" stroke-linejoin="round"/></svg><span><strong>${circuit.name}</strong><small>${circuit.laps} LAPS · ${circuit.description}</small>${best > 0 ? `<small>BEST ${timeText(best)}</small>` : ''}</span></button>`;
    }).join("");
  }
  function startRace() {
    track = makeTrack(tracks[selected]);
    racers = colors.map((color, i) => {
      const distance = -28 - Math.floor(i / 2) * 42, position = atDistance(distance, i % 2 ? -19 : 19);
      return { ...position, color, speed: 0, distance, progress: distance, previousS: wrap(distance, track.length), checkpoint: 0, lap: 0, boost: 100, bump: 0, place: 0, ai: i > 0, lane: i % 2 ? -19 : 19, name: i === 0 ? "YOU" : ["", "RUBY", "SKY", "VIOLET", "FINN"][i] };
    });
    player = racers[0]; state = "countdown"; countdown = 3; elapsed = 0; finishCount = 0; finishTime = 0;
    notice = ""; keys.clear(); menu.hidden = true; overlay.hidden = true;
    pauseButton.disabled = false; pauseButton.textContent = "Pause"; menuButton.disabled = false;
    document.querySelector("#raceName").textContent = track.name.toUpperCase();
    status.textContent = `Follow the circuit arrows. ${carMode ? "Drive" : "Ride"} over the stripe to start your first lap.`;
    canvas.focus();
  }
  function showMenu() {
    state = "menu"; keys.clear(); menu.hidden = false; overlay.hidden = true;
    pauseButton.disabled = true; menuButton.disabled = true; pauseButton.textContent = "Pause";
    document.querySelector("#raceName").textContent = carMode ? "BROWNY MOTOR CLUB" : "BYE!CYCLE";
    status.textContent = carMode ? "Choose a circuit and race four rival cars." : "Choose a circuit and leave the cars behind."; renderChoices();
  }
  function switchView() {
    view = view === "overhead" ? "chase" : "overhead";
    viewButton.textContent = `A · ${view === "overhead" ? "Overhead" : carMode ? "Behind the car" : "Behind the bike"}`;
  }
  function pauseRace() {
    if (!["racing", "countdown", "paused"].includes(state)) return;
    if (state === "paused") {
      state = countdown > 0 ? "countdown" : "racing"; overlay.hidden = true; pauseButton.textContent = "Pause"; canvas.focus();
    } else {
      state = "paused"; keys.clear(); pauseButton.textContent = "Resume";
      showOverlay("TAKE A BREATHER", "Paused", "Your race will be right here.", true);
    }
  }
  function showOverlay(label, title, text, paused) {
    document.querySelector("#overlayLabel").textContent = label;
    document.querySelector("#overlayTitle").textContent = title;
    document.querySelector("#overlayText").textContent = text;
    document.querySelector("#resume").hidden = !paused; overlay.hidden = false;
  }
  function finishRace() {
    player.place = ++finishCount; finishTime = elapsed; state = "finished"; keys.clear();
    const oldBest = Number(bestTimes[selected]);
    const newBest = !oldBest || finishTime < oldBest;
    if (newBest) {
      bestTimes[selected] = finishTime;
      try { localStorage.setItem(bestTimesKey, JSON.stringify(bestTimes)); } catch { /* Best time remains for this visit. */ }
    }
    pauseButton.disabled = true;
    showOverlay(newBest ? "NEW PERSONAL BEST!" : "FINISH LINE CROSSED", player.place === 1 ? "You won!" : `Finished #${player.place}`, `${track.laps} laps in ${timeText(finishTime)}. ${player.place === 1 ? "Those cars never stood a chance." : "Try a boost on the next straight!"}`, false);
    status.textContent = `Finished ${player.place} of ${racers.length} · ${timeText(finishTime)}`;
    if (brownyMode && window.parent !== window) window.parent.postMessage({ type: "browny-race-finished", place: player.place, time: finishTime }, "*");
  }
  // Sequential quarter-lap gates reject backwards laps and cuts across the infield.
  function updateProgress(racer, closest) {
    let delta = closest.s - racer.previousS;
    if (delta > track.length / 2) delta -= track.length;
    if (delta < -track.length / 2) delta += track.length;
    const onRoad = closest.distance <= track.width / 2 + 8;
    const previousS = racer.previousS;
    // Keep ranking continuous, but only accept gates reached on the road.
    racer.progress += delta; racer.previousS = closest.s;
    const target = (racer.checkpoint % 4) * track.length / 4;
    const crossed = target === 0
      ? closest.s < track.length / 2 && previousS > track.length / 2
      : previousS < target && closest.s >= target;
    // A missed gate can be reached on the next circuit, without trapping the race.
    if (onRoad && crossed && delta > 0 && delta < 60) {
      racer.checkpoint++;
      if ((racer.checkpoint - 1) % 4 === 0) {
        racer.lap = (racer.checkpoint - 1) / 4;
        if (racer.lap >= track.laps && !racer.place) {
          if (racer === player) finishRace(); else racer.place = ++finishCount;
        } else if (racer === player && racer.lap > 0) {
          notice = racer.lap === track.laps - 1 ? "FINAL LAP!" : "LAP COMPLETE!"; noticeTime = 2;
        }
      }
    }
  }
  function update(dt) {
    if (state === "countdown") { countdown -= dt; if (countdown <= 0) { state = "racing"; notice = "GO!"; noticeTime = 1; } return; }
    if (state !== "racing") return;
    elapsed += dt; noticeTime = Math.max(0, noticeTime - dt);
    const closest = nearest(player.x, player.y), onRoad = closest.distance < track.width / 2 - 5;
    const pedalling = keys.has("ArrowUp"), braking = keys.has("ArrowDown");
    const boosting = pedalling && keys.has("Space") && player.boost > 1 && onRoad;
    const maxSpeed = (onRoad ? (boosting ? 255 : 184) : 62) * (carMode ? 1.22 : 1);
    if (pedalling) player.speed += (boosting ? 140 : 96) * (carMode ? 1.3 : 1) * dt;
    else if (braking) player.speed -= 155 * dt;
    else player.speed *= Math.exp(-1.05 * dt);
    player.speed = clamp(player.speed, braking ? -50 : 0, maxSpeed);
    player.boost = clamp(player.boost + (boosting ? -34 : 15) * dt, 0, 100);
    const steering = Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"));
    player.angle += steering * 2.55 * clamp(Math.abs(player.speed) / 65, 0, 1) * (player.speed < 0 ? -1 : 1) * dt;
    player.x += Math.cos(player.angle) * player.speed * dt; player.y += Math.sin(player.angle) * player.speed * dt;
    player.x = clamp(player.x, 30, 1450); player.y = clamp(player.y, 30, 980);
    player.bump = Math.max(0, player.bump - dt);
    racers.slice(1).forEach((racer, i) => {
      if (racer.place) return;
      const ahead = atDistance(racer.distance + 65), here = atDistance(racer.distance);
      const bend = Math.abs(angleDifference(ahead.angle, here.angle));
      racer.speed = track.pace * (carMode ? 1.22 : 1) * (1 - Math.min(.32, bend * .35)) + Math.sin(elapsed * .7 + i * 2) * 8;
      racer.distance += racer.speed * dt;
      Object.assign(racer, atDistance(racer.distance, racer.lane + Math.sin(elapsed + i) * 3));
      updateProgress(racer, nearest(racer.x, racer.y));
      const dx = player.x - racer.x, dy = player.y - racer.y, distance = Math.hypot(dx, dy);
      if (distance < 22 && player.bump <= 0) {
        player.speed *= .68; player.bump = .65;
        player.x += (distance > .01 ? dx / distance : -Math.sin(player.angle)) * 9;
        player.y += (distance > .01 ? dy / distance : Math.cos(player.angle)) * 9;
      }
    });
    updateProgress(player, nearest(player.x, player.y));
    if (state === "racing") status.textContent = onRoad ? (boosting ? "BOOST! Keep your wheels on the road." : `Arrow keys ${carMode ? "drive" : "ride"} · A switches perspective`) : `Grass slows your ${carMode ? "car" : "bicycle"} — steer back onto the road.`;
  }
  function poly(points, fill) {
    ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  }
  function text(label, x, y, size = 18, color = "#f8f4e7", align = "left") {
    ctx.font = `bold ${size}px 'Courier New', monospace`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(label, x, y);
  }
  function roadPath() {
    ctx.beginPath(); track.samples.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
  }
  function bicycle(x, y, angle, color, scale = 1, label = "") {
    if (carMode) { drawCar(x, y, angle, color, scale, label); return; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
    ctx.fillStyle = "#071a1c70"; ctx.fillRect(-18, -5, 39, 15);
    ctx.strokeStyle = "#0b2023"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-8, 0); ctx.moveTo(9, 0); ctx.lineTo(20, 0); ctx.stroke();
    ctx.strokeStyle = "#d3dfd9"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(20, 0); ctx.moveTo(12, -9); ctx.lineTo(12, 9); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(7, 0); ctx.stroke();
    ctx.fillStyle = "#10272b"; ctx.fillRect(-6, -11, 7, 22);
    ctx.fillStyle = color; ctx.fillRect(-7, -7, 16, 14);
    ctx.fillStyle = "#f8f4e7"; ctx.fillRect(6, -5, 9, 10); ctx.fillStyle = color; ctx.fillRect(6, -2, 9, 4);
    ctx.restore(); if (label) text(label, x, y - 23 * scale, 12, color, "center");
  }
  function drawCar(x, y, angle, color, scale, label) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
    ctx.fillStyle = "#071a1c70"; ctx.fillRect(-23, -12, 48, 29);
    ctx.fillStyle = "#10272b";
    for (const wheel of [-16, 10]) { ctx.fillRect(wheel, -16, 10, 5); ctx.fillRect(wheel, 11, 10, 5); }
    ctx.fillStyle = color; ctx.fillRect(-22, -12, 45, 24); ctx.fillRect(-16, -14, 32, 28);
    ctx.fillStyle = "#f8f4e7"; ctx.fillRect(-10, -11, 19, 22);
    ctx.fillStyle = "#3e6974"; ctx.fillRect(5, -9, 6, 18); ctx.fillRect(-12, -9, 5, 18);
    ctx.fillStyle = color; ctx.fillRect(-5, -10, 9, 20);
    ctx.fillStyle = "#fff2bd"; ctx.fillRect(19, -10, 5, 5); ctx.fillRect(19, 5, 5, 5);
    ctx.fillStyle = "#e25e4f"; ctx.fillRect(-23, -10, 3, 5); ctx.fillRect(-23, 5, 3, 5);
    ctx.restore(); if (label) text(label, x, y - 25 * scale, 12, color, "center");
  }
  function drawOverhead() {
    const scale = .59, ox = (W - 1480 * scale) / 2, oy = (H - 1000 * scale) / 2 + 20;
    ctx.fillStyle = track.ground; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(ox, oy); ctx.scale(scale, scale);
    if (selected === 0) {
      ctx.fillStyle = "#398ca9"; ctx.fillRect(10, 20, 1470, 95); ctx.fillStyle = "#a9dbc7"; ctx.fillRect(10, 104, 1470, 12);
    }
    for (let i = 0; i < 70; i++) {
      const x = (i * 239 + 70) % 1460, y = (i * 131 + 45) % 960;
      if (nearest(x, y).distance < track.width) continue;
      if (selected === 1) {
        ctx.fillStyle = "#18262b"; ctx.fillRect(x, y, 45, 38); ctx.fillStyle = "#829190"; ctx.fillRect(x - 4, y - 6, 38, 30); ctx.fillStyle = "#f4ce70"; ctx.fillRect(x + 2, y, 6, 7); ctx.fillRect(x + 17, y, 6, 7);
      } else {
        ctx.fillStyle = "#244d39"; ctx.fillRect(x, y, 16, 20); ctx.fillStyle = selected === 0 ? "#397b43" : "#635740"; ctx.fillRect(x - 10, y - 13, 36, 30);
      }
    }
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    roadPath(); ctx.strokeStyle = "#193236"; ctx.lineWidth = track.width + 21; ctx.stroke();
    roadPath(); ctx.strokeStyle = "#eee7d0"; ctx.lineWidth = track.width + 9; ctx.stroke();
    roadPath(); ctx.strokeStyle = track.road; ctx.lineWidth = track.width; ctx.stroke();
    roadPath(); ctx.strokeStyle = "#dce0cd80"; ctx.lineWidth = 2; ctx.setLineDash([20, 22]); ctx.stroke(); ctx.setLineDash([]);
    track.samples.forEach((p, i) => {
      if (i % 5) return;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.fillStyle = i % 10 === 0 ? "#f36c48" : "#f8f4e7";
      ctx.fillRect(-7, -track.width / 2 - 5, 14, 7); ctx.fillRect(-7, track.width / 2 - 2, 14, 7); ctx.restore();
    });
    for (let s = 160; s < track.length; s += 330) {
      const p = atDistance(s); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.strokeStyle = "#ffffff60"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(2, 0); ctx.lineTo(-8, 8); ctx.stroke(); ctx.restore();
    }
    const start = atDistance(0); ctx.save(); ctx.translate(start.x, start.y); ctx.rotate(start.angle);
    for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (i + j) % 2 ? "#10272b" : "#fff"; ctx.fillRect(j * 8, -track.width / 2 + i * track.width / 12, 8, track.width / 12);
    }
    ctx.restore(); racers.slice().sort((a, b) => a.y - b.y).forEach(racer => bicycle(racer.x, racer.y, racer.angle, racer.color, 1.2, racer === player ? "YOU ↓" : ""));
    ctx.restore();
  }
  function project(x, y, height = 0) {
    const dx = x - player.x, dy = y - player.y;
    const forward = dx * Math.cos(player.angle) + dy * Math.sin(player.angle) + 100;
    const side = -dx * Math.sin(player.angle) + dy * Math.cos(player.angle);
    const scale = 400 / Math.max(25, forward);
    return { x: W / 2 + side * scale, y: 215 + (95 - height) * scale, scale, forward };
  }
  function drawChaseBike(x, y, color, size, steer = 0) {
    if (carMode) { drawChaseCar(x, y, color, size, steer); return; }
    ctx.save(); ctx.translate(x, y); ctx.scale(size, size);
    ctx.fillStyle = "#0c1d2050"; ctx.fillRect(-24, 5, 48, 10);
    ctx.fillStyle = "#10272b"; ctx.fillRect(-5, -40, 10, 56); ctx.fillStyle = "#d6e3db"; ctx.fillRect(-2, -35, 4, 44);
    ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-10, -28); ctx.lineTo(0, -4); ctx.lineTo(10, -28); ctx.stroke();
    ctx.fillStyle = "#10272b"; ctx.fillRect(-16, -49, 11, 24); ctx.fillRect(5, -49, 11, 24);
    ctx.fillStyle = "#f2c796"; ctx.fillRect(-25, -59, 7, 14); ctx.fillRect(18, -59, 7, 14);
    ctx.fillStyle = color; ctx.fillRect(-18 + steer, -76, 36, 34);
    ctx.fillStyle = "#10272b"; ctx.fillRect(-11 + steer, -99, 22, 24);
    ctx.fillStyle = "#f8f4e7"; ctx.fillRect(-13 + steer, -103, 26, 18); ctx.fillStyle = color; ctx.fillRect(-4 + steer, -103, 8, 18);
    ctx.restore();
  }
  function drawChaseCar(x, y, color, size, steer) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size, size); ctx.rotate(steer * .004);
    ctx.fillStyle = "#0c1d2050"; ctx.fillRect(-42, 1, 84, 14);
    ctx.fillStyle = "#10272b"; ctx.fillRect(-39, -15, 17, 27); ctx.fillRect(22, -15, 17, 27);
    poly([{ x: -39, y: -4 }, { x: -34, y: -41 }, { x: -20, y: -72 }, { x: 20, y: -72 }, { x: 34, y: -41 }, { x: 39, y: -4 }], color);
    poly([{ x: -25, y: -42 }, { x: -17, y: -65 }, { x: 17, y: -65 }, { x: 25, y: -42 }], "#3e6974");
    ctx.fillStyle = "#f8f4e7"; ctx.fillRect(-3, -68, 6, 57);
    ctx.fillStyle = color; ctx.fillRect(-39, -29, 78, 23);
    ctx.fillStyle = "#ed6e5d"; ctx.fillRect(-34, -24, 17, 8); ctx.fillRect(17, -24, 17, 8);
    ctx.fillStyle = "#10272b"; ctx.fillRect(-43, -37, 86, 6); ctx.fillRect(-37, -7, 74, 7);
    ctx.fillStyle = "#fff2bd"; ctx.fillRect(-10, -20, 20, 8); ctx.restore();
  }
  function drawChase() {
    ctx.fillStyle = track.sky; ctx.fillRect(0, 0, W, 240);
    ctx.fillStyle = selected === 2 ? "#fff0b5" : "#f4fcff";
    for (let i = 0; i < 5; i++) { const x = wrap(i * 240 - player.angle * 90, 1100) - 70; ctx.fillRect(x, 85 + (i % 2) * 40, 85, 16); ctx.fillRect(x + 20, 70 + (i % 2) * 40, 42, 18); }
    ctx.fillStyle = selected === 0 ? "#4299bd" : selected === 1 ? "#536d77" : "#9a765c"; ctx.fillRect(0, 195, W, 40);
    ctx.fillStyle = track.ground; ctx.fillRect(0, 235, W, H - 235);
    const strips = [], nearestPoint = nearest(player.x, player.y);
    // Project the real circuit around the player's camera, including bends and other riders.
    for (let s = -100; s < 1700; s += 18) {
      const p = atDistance(nearestPoint.s + s), next = atDistance(nearestPoint.s + s + 20);
      const edge = (p, width) => [project(p.x - Math.sin(p.angle) * width, p.y + Math.cos(p.angle) * width), project(p.x + Math.sin(p.angle) * width, p.y - Math.cos(p.angle) * width)];
      const outerA = edge(p, track.width / 2 + 7), outerB = edge(next, track.width / 2 + 7);
      const a = edge(p, track.width / 2), b = edge(next, track.width / 2);
      if ([...outerA, ...outerB].some(v => v.forward <= 28)) continue;
      strips.push({ outer: [outerA[0], outerB[0], outerB[1], outerA[1]], road: [a[0], b[0], b[1], a[1]], depth: project(p.x, p.y).forward, stripe: Math.floor((nearestPoint.s + s) / 75) % 2 === 0 });
    }
    strips.sort((a, b) => b.depth - a.depth).forEach(strip => {
      poly(strip.outer, strip.stripe ? "#f8f4e7" : "#f36c48"); poly(strip.road, strip.stripe ? track.road : selected === 1 ? "#444d50" : "#63706b");
    });
    const projected = racers.slice(1).map(racer => ({ racer, point: project(racer.x, racer.y) })).filter(({ point }) => point.forward > 125 && point.forward < 1600).sort((a, b) => b.point.forward - a.point.forward);
    projected.forEach(({ racer, point }) => drawChaseBike(point.x, point.y, racer.color, clamp(point.scale * .6, .1, 2)));
    drawChaseBike(W / 2, 553, player.color, 1.65, (Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"))) * 4);
    // Handlebar view always includes a live minimap to help navigate sharp turns.
    ctx.fillStyle = "#10272bda"; ctx.fillRect(W - 190, 86, 174, 132);
    ctx.save(); ctx.translate(W - 181, 92); ctx.scale(.11, .11);
    roadPath(); ctx.strokeStyle = "#a2b6aa"; ctx.lineWidth = 24; ctx.stroke();
    racers.forEach(racer => { ctx.fillStyle = racer.color; ctx.fillRect(racer.x - 22, racer.y - 22, 44, 44); }); ctx.restore();
    text("CIRCUIT", W - 103, 208, 10, "#d8ff3e", "center");
  }
  function rank() {
    return 1 + racers.filter(racer => racer !== player && (racer.place || racer.progress > player.progress)).length;
  }
  function drawHud() {
    ctx.fillStyle = "#10272be8"; ctx.fillRect(16, 14, W - 32, 56);
    text(`${player.place || rank()} / 5`, 32, 48, 29, "#d8ff3e");
    text(timeText(state === "finished" ? finishTime : elapsed), W / 2, 48, 27, "#f8f4e7", "center");
    text(`LAP ${Math.min(track.laps, player.lap + 1)} / ${track.laps}`, W - 32, 48, 25, "#f8f4e7", "right");
    ctx.fillStyle = "#10272be8"; ctx.fillRect(16, H - 45, 260, 30);
    text("BOOST", 27, H - 24, 12, "#d8ff3e"); ctx.fillStyle = "#3d5858"; ctx.fillRect(85, H - 35, 175, 12); ctx.fillStyle = "#d8ff3e"; ctx.fillRect(85, H - 35, player.boost * 1.75, 12);
    text(`${Math.round(Math.abs(player.speed) * .21)} KM/H`, W - 23, H - 24, 16, "#fff", "right");
    if (state === "countdown" || noticeTime > 0) {
      ctx.fillStyle = "#10272bdd"; ctx.fillRect(W / 2 - 170, H / 2 - 65, 340, 100);
      text(state === "countdown" ? String(Math.ceil(countdown)) : notice, W / 2, H / 2 + 2, state === "countdown" ? 65 : 32, "#d8ff3e", "center");
    }
  }
  function draw() {
    ctx.imageSmoothingEnabled = false;
    if (state === "menu") { ctx.fillStyle = "#10272b"; ctx.fillRect(0, 0, W, H); return; }
    if (view === "overhead") drawOverhead(); else drawChase();
    drawHud();
  }
  function frame(now) {
    const dt = Math.min(.04, Math.max(0, (now - lastTime) / 1000)); lastTime = now;
    update(dt); draw(); requestAnimationFrame(frame);
  }
  document.querySelector("#raceChoices").addEventListener("click", event => {
    const choice = event.target.closest("[data-race]"); if (!choice) return;
    selected = Number(choice.dataset.race); renderChoices();
    document.querySelector(`[data-race="${selected}"]`).focus();
  });
  document.querySelector("#start").addEventListener("click", startRace);
  document.querySelector("#again").addEventListener("click", startRace);
  document.querySelector("#choose").addEventListener("click", showMenu);
  document.querySelector("#resume").addEventListener("click", pauseRace);
  viewButton.addEventListener("click", () => { switchView(); if (["racing", "countdown"].includes(state)) canvas.focus(); });
  pauseButton.addEventListener("click", pauseRace); menuButton.addEventListener("click", showMenu);
  window.addEventListener("keydown", event => {
    if (event.target.matches("input, textarea, select")) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code) && state !== "menu") {
      // Preserve keyboard activation of menu and overlay buttons.
      if (event.code === "Space" && event.target.tagName === "BUTTON") return;
      event.preventDefault(); keys.add(event.code);
    }
    if (event.repeat) return;
    if (event.code === "KeyA") switchView();
    if (event.code === "Escape") pauseRace();
    if (event.code === "KeyR" && state !== "menu") startRace();
  });
  window.addEventListener("keyup", event => keys.delete(event.code));
  window.addEventListener("blur", () => { keys.clear(); if (["racing", "countdown"].includes(state)) pauseRace(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { keys.clear(); if (["racing", "countdown"].includes(state)) pauseRace(); } });
  const activePointers = new Map();
  document.querySelectorAll("[data-key]").forEach(button => {
    button.addEventListener("pointerdown", event => {
      event.preventDefault(); if (!["racing", "countdown"].includes(state)) return;
      button.setPointerCapture(event.pointerId); activePointers.set(event.pointerId, button.dataset.key); keys.add(button.dataset.key);
    });
    const release = event => {
      const key = activePointers.get(event.pointerId); activePointers.delete(event.pointerId);
      if (![...activePointers.values()].includes(key)) keys.delete(key);
    };
    button.addEventListener("pointerup", release); button.addEventListener("pointercancel", release); button.addEventListener("lostpointercapture", release);
  });
  if (carMode) {
    document.title = "Race Cars — Browny City";
    document.querySelector(".masthead a").hidden = true;
    document.querySelector(".masthead span").textContent = "BROWNY MOTOR CLUB";
    document.querySelector(".intro .eyebrow").textContent = "BOB TAKES THE WHEEL.";
    document.querySelector(".intro h1").innerHTML = 'Race<br><span>Cars</span><i>↗</i>';
    document.querySelector(".tagline").innerHTML = 'Four wheels.<br>Five racers.<br>One finish line.';
    document.querySelector(".sticker").textContent = "YOU'RE THE CAR!";
    document.querySelector("#start").innerHTML = "LET'S DRIVE <span>→</span>";
    document.querySelector(".menu-help").innerHTML = '↑ Accelerate · ↓ Brake / reverse · ← → Steer<br><b>A</b> Switch perspective · <b>Space</b> Boost';
    document.querySelector("#resume").textContent = "KEEP DRIVING →";
    document.querySelector("[data-key='ArrowUp']").textContent = "DRIVE ↑";
    document.querySelector("[data-key='ArrowUp']").setAttribute("aria-label", "Accelerate");
    document.querySelector(".controls-note").textContent = "Arrow keys to drive · Space to boost · A to change view · Esc to pause · R to restart";
    canvas.setAttribute("aria-label", "Car race. Arrow keys drive, Space boosts, A changes perspective.");
    document.querySelector(".stage").setAttribute("aria-label", "Browny City car racing");
    document.querySelector("#raceName").textContent = "BROWNY MOTOR CLUB";
    status.textContent = "Choose a circuit and race four rival cars.";
  }
  window.ZapmanArcadeAudio?.register(()=>({active:state==='racing'||state==='countdown',paused:state==='paused',won:state==='finished',level:selected,reward:player?.lap||0,health:1,shots:0,music:!brownyMode}));
  window.ZapmanEducation?.register({ lost: () => false, restore: startRace, release: () => keys.clear() });
  renderChoices(); requestAnimationFrame(frame);
})();
