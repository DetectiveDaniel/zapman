const shell = document.querySelector('#shell');
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const rosterEl = document.querySelector('#roster');
const spleefButton = document.querySelector('#spleefButton');
const selectEl = document.querySelector('#select');
const mapScreen = document.querySelector('#mapScreen');
const mapStage = document.querySelector('#mapStage');
const mapMarker = document.querySelector('#mapMarker');
const mapRacer = document.querySelector('#mapRacer');
const confirmBar = document.querySelector('#confirmBar');
const confirmYes = document.querySelector('#confirmYes');
const confirmCancel = document.querySelector('#confirmCancel');
const backToSelect = document.querySelector('#backToSelect');
const raceEl = document.querySelector('#race');
const subtitleEl = document.querySelector('#subtitle');
const lapEl = document.querySelector('#lap');
const placeEl = document.querySelector('#place');
const itemEl = document.querySelector('#item');
const raceLap = document.querySelector('#raceLap');
const racePlace = document.querySelector('#racePlace');
const raceSpeed = document.querySelector('#raceSpeed');
const slotEls = [document.querySelector('#slotA'), document.querySelector('#slotB')];
const slotCanvases = slotEls.map(el => el.querySelector('canvas'));
const slotCtx = slotCanvases.map(c => c.getContext('2d'));
const finishSequence = document.querySelector('#finishSequence');
const finishAnnouncement = document.querySelector('#finishAnnouncement');
const finishResult = document.querySelector('#finishResult');
const podiumScreen = document.querySelector('#podiumScreen');
const podiumThird = document.querySelector('#podiumThird');
const podiumSecond = document.querySelector('#podiumSecond');
const podiumFirst = document.querySelector('#podiumFirst');
const finishGoBack = document.querySelector('#finishGoBack');

const W = canvas.width;
const H = canvas.height;
const horizon = 242;
const roadBottom = 1000;
const laneWidth = 180;
const trackLength = 6200;
const lapsToWin = 3;

const racers = [
  ['Kiff', 'assets/kiff.png', '#ffd800'],
  ['Jim', 'assets/jim.png', '#9bef16'],
  ['Bobby Three', 'assets/bobby.png', '#bf6c38'],
  ['Four', 'assets/four.png', '#ffffff'],
  ['Julius Five', 'assets/julius.png', '#d92eea'],
  ['Micheal Six', 'assets/micheal.png', '#f39b49'],
  ['Sam Seven', 'assets/sam.png', '#81dcff'],
  ['Todd Eight', 'assets/todd.png', '#be43e7'],
  ['Phil Nine', 'assets/phil.png', '#f22222'],
  ['Tom Ten', 'assets/tom.png', '#d0d0d0'],
  ['Boom Boom Ball Eleven', 'assets/boom-boom-ball.png', '#8d8d8d'],
  ['Glitches Twelve', 'assets/glitches.png', '#b4ef12']
];

const kartStyles = [
  { id: 'kiff', accent: '#ff8218', drive: 'turbine' },
  { id: 'jim', accent: '#087d35', drive: 'scooter' },
  { id: 'bobby', accent: '#6f321b', drive: 'rocket' },
  { id: 'four', accent: '#cfd7df', drive: 'bubble' },
  { id: 'julius', accent: '#6c167d', drive: 'scooter' },
  { id: 'micheal', accent: '#ee202d', drive: 'spikes' },
  { id: 'sam', accent: '#1528df', drive: 'jet' },
  { id: 'todd', accent: '#87e9ff', drive: 'rings' },
  { id: 'phil', accent: '#e65cff', drive: 'ribbon' },
  { id: 'tom', accent: '#f5222d', drive: 'spider' },
  { id: 'boom', accent: '#24b8ff', drive: 'rocket' },
  { id: 'glitches', accent: '#e851ef', drive: 'hover' }
];

const powers = [
  { id: 'flower', label: 'Fireballs', color: '#ff5025' },
  { id: 'bee', label: 'Bee Wings', color: '#ffd83c' },
  { id: 'star', label: 'Star', color: '#fff15b' },
  { id: 'leaf', label: 'Leaf Spin', color: '#f59b38' },
  { id: 'red', label: 'Big Red', color: '#f73730' },
  { id: 'silver', label: 'Spring', color: '#dce6ef' },
  { id: 'blue', label: 'Small Blue', color: '#2b91ff' },
  { id: 'purple', label: 'Purple Slow', color: '#a12df5' },
  { id: 'doom', label: 'Rotten Doom', color: '#ff46bd' }
];

const courses = [
  { id: 'ramps', name: 'THE RAMPS', x: .41, y: .62, sky: true, road: '#2a332f', ground: '#9ce75a' },
  { id: 'kitty', name: 'KITTY CASTLE', x: .63, y: .50, road: '#69406d', ground: '#78d957' },
  { id: 'bouncy', name: 'BOUNCY BED', x: .50, y: .16, road: '#7acb33', ground: '#b7f04b' },
  { id: 'hollows', name: 'SANDY HOLLOWS', x: .18, y: .85, road: '#d87a35', ground: '#cc241e' },
  { id: 'snake', name: 'THE SNAKE', x: .15, y: .58, road: '#392d1b', ground: '#cc241e' },
  { id: 'boomsday', name: 'BOOMSDAY CASTLE', x: .14, y: .20, road: '#373737', ground: '#c91f20' },
  { id: 'tunnels', name: 'THE SANDY TUNNELS', x: .86, y: .23, road: '#5da64d', ground: '#ffc522' },
  { id: 'mountains', name: 'CACTUSVILLE MOUNTAINS', x: .90, y: .78, road: '#7d7d74', ground: '#ffc522' },
  { id: 'spiky', name: 'SPIKY ROCKS', x: .91, y: .43, road: '#d6ac39', ground: '#ffc522' }
];

const images = {};
let selected = 0;
let routePoint = null;
let screen = 'select';
let running = false;
let last = 0;
let keys = new Set();
let player;
let rivals = [];
let blocks = [];
let courseObjects = [];
let particles = [];
let fireballs = [];
let coins = [];
let doom = null;
let slotState;
let currentCourse = courses[0];
let spleefMode = false;
let spleefLevel = 1;
let finishState = null;
let finishTimers = [];
const spleefLimits = [9, 5, 3];

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function suffix(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][Math.min(n % 10, 4)] || 'th'}`;
}

function randPower() {
  return powers[Math.floor(Math.random() * powers.length)];
}

function wrap(n, max) {
  return ((n % max) + max) % max;
}

function curveAt(z) {
  return Math.sin(z * .0017) * 260 + Math.sin(z * .00063 + 1.8) * 145;
}

function roadCenter(depth, cameraZ) {
  return W / 2 + curveAt(cameraZ + depth) - curveAt(cameraZ);
}

function project(depth, xOffset, cameraZ) {
  const t = Math.max(.04, Math.min(1, depth / 1500));
  const y = horizon + (1 - t) * (roadBottom - horizon);
  const scale = 1 - t;
  const roadHalf = 70 + scale * 600;
  const center = roadCenter(depth, cameraZ);
  return { x: center + xOffset * roadHalf, y, scale, roadHalf };
}

function nearestCourse(x, y) {
  let best = courses[0];
  let bestD = Infinity;
  for (const course of courses) {
    const dx = x - course.x;
    const dy = y - course.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) { best = course; bestD = d; }
  }
  return best;
}

function makeCourseObjects(id) {
  const objects = [];
  const addSeries = (type, count, start, gap, lanes) => {
    for (let i = 0; i < count; i++) objects.push({ type, z: start + i * gap, x: lanes[i % lanes.length], phase: Math.random() * 10, hit: 0 });
  };
  if (id === 'ramps') {
    addSeries('skyRamp', 9, 720, 650, [-.42, .08, .46]);
    addSeries('movingBlock', 12, 980, 430, [-.6, 0, .6]);
  } else if (id === 'kitty') {
    addSeries('loop', 6, 780, 820, [0]);
    addSeries('boost', 12, 530, 410, [-.36, .02, .38]);
  } else if (id === 'bouncy') {
    addSeries('bouncyTunnel', 12, 520, 380, [0]);
  } else if (id === 'hollows') {
    addSeries('wreckingBall', 13, 560, 410, [-.5, .5]);
  } else if (id === 'snake') {
    addSeries('snakeWall', 18, 420, 300, [-1.03, 1.03]);
  } else if (id === 'boomsday') {
    addSeries('lava', 12, 530, 390, [-.35, .35, 0]);
    addSeries('spikes', 10, 760, 470, [-.55, .02, .52]);
  } else if (id === 'tunnels') {
    addSeries('greenTunnel', 18, 410, 280, [0]);
  } else if (id === 'mountains') {
    addSeries('weaveWall', 20, 450, 280, [-.55, .55, 0]);
  } else if (id === 'spiky') {
    addSeries('cactus', 24, 420, 240, [-.62, -.18, .25, .66]);
  }
  return objects;
}

function updateCourseObjects(dt) {
  for (const o of courseObjects) {
    o.phase += dt;
    if (o.hit > 0) o.hit -= dt;
    const dz = wrappedAhead(o.z, player.z);
    if (dz > 95 || o.hit > 0 || player.fallen > 0) continue;
    const movingX = objectLane(o);
    const gap = Math.abs(movingX - player.x);
    if (o.type === 'skyRamp' && gap < .42) {
      player.air = 1.9;
      player.jumpPose = 1.25;
      player.jumpPower = 1;
      player.speed = Math.min(860, player.speed + 330);
      o.hit = 2;
      burst(W / 2 + player.x * 360, H - 180, '#7cff6c', 20);
    }
    if (o.type === 'boost' && gap < .34) {
      player.speed = Math.min(850, player.speed + 310);
      player.blur = .75;
      o.hit = 1.5;
      burst(W / 2 + player.x * 360, H - 160, '#53e4ff', 26);
    }
    if (o.type === 'bouncyTunnel' && gap < .8) {
      player.tunnelSpin = 1.1;
      player.air = Math.max(player.air, .55);
      player.speed = Math.min(630, player.speed + 90);
      o.hit = 1;
    }
    if (o.type === 'wreckingBall' && gap < .35 + Math.abs(Math.sin(o.phase * 1.7)) * .18) knockPlayerDown();
    if (o.type === 'movingBlock' && gap < .32) knockPlayerDown();
    if ((o.type === 'lava' || o.type === 'spikes' || o.type === 'cactus') && gap < .32) knockPlayerDown();
    if ((o.type === 'weaveWall' || o.type === 'snakeWall') && gap < .3) {
      player.x += Math.sign(player.x - movingX || .2) * .18;
      player.speed *= .74;
      burst(W / 2 + player.x * 360, H - 145, '#eeeeee', 10);
      o.hit = .7;
    }
  }
}

function objectLane(o) {
  if (o.type === 'movingBlock') return Math.sin(o.phase * 1.8) * .72;
  if (o.type === 'wreckingBall') return o.x + Math.sin(o.phase * 1.7) * .42;
  return o.x;
}
function makePlayer() {
  return {
    index: selected,
    x: 0,
    z: trackLength - 600,
    lap: 1,
    speed: 0,
    maxSpeed: 510,
    spin: 0,
    scale: 1,
    targetScale: 1,
    invincible: 0,
    effect: null,
    effectTime: 0,
    fallen: 0,
    breakdown: 0,
    smokeTimer: 0,
    jumpPose: 0,
    jumpPower: 0,
    fireAmmo: 0,
    wing: 0,
    bounce: 0,
    name: racers[selected][0],
    color: racers[selected][2],
    img: images[racers[selected][1]]
  };
}

function resetRace() {
  currentCourse = currentCourse || courses[0];
  clearFinishSequence();
  player = makePlayer();
  rivals = racers
    .map((r, i) => i)
    .filter(i => i !== selected)
    .slice(0, 11)
    .map((idx, i) => ({
      index: idx,
      name: racers[idx][0],
      color: racers[idx][2],
      img: images[racers[idx][1]],
      x: [-.72, -.38, .38, .72][i % 4],
      z: wrap(trackLength - 540 + Math.floor(i / 4) * 120, trackLength),
      speed: 355 + i * 11,
      wobble: Math.random() * 7,
      fallen: 0,
      lap: 1,
      effect: null,
      effectTime: 0,
      scale: 1,
      targetScale: 1,
      invincible: 0,
      bounce: 0,
      spin: 0,
      wing: 0,
      baseSpeed: 355 + i * 11,
      heldPower: null,
      useTimer: 2.5 + Math.random() * 3,
      itemFlash: 0,
      powerLabel: ''
    }));
  blocks = Array.from({ length: 20 }, (_, i) => ({
    x: [-.42, 0, .42][i % 3],
    z: 560 + i * 360,
    alive: true,
    respawn: 0,
    bob: Math.random() * 10
  }));
  courseObjects = makeCourseObjects(currentCourse.id);
  particles = [];
  fireballs = [];
  coins = [];
  doom = null;
  slotState = {
    spinning: false,
    timer: 0,
    slots: [null, null],
    active: null,
    bob: [0, Math.PI]
  };
  drawSlots();
  updateHud();
}

function showSelect() {
  screen = 'select';
  shell.classList.remove('racing');
  selectEl.hidden = false;
  mapScreen.hidden = true;
  raceEl.hidden = true;
  subtitleEl.textContent = 'Choose a character, then click the map where you want to race.';
}

function showMap() {
  screen = 'map';
  shell.classList.remove('racing');
  selectEl.hidden = true;
  mapScreen.hidden = false;
  raceEl.hidden = true;
  confirmBar.hidden = true;
  mapMarker.hidden = true;
  mapRacer.style.backgroundImage = `url("${racers[selected][1]}")`;
  subtitleEl.textContent = `${racers[selected][0]} is ready. Click a place on the map.`;
  lapEl.textContent = `Lap 1/${lapsToWin}`;
  placeEl.textContent = 'Place --';
  itemEl.textContent = 'Power: none';
}

function spleefLimit() {
  return spleefLimits[Math.min(spleefLevel - 1, spleefLimits.length - 1)];
}

function randomCourse() {
  return courses[Math.floor(Math.random() * courses.length)];
}

function startSpleef() {
  spleefMode = true;
  spleefLevel = 1;
  currentCourse = randomCourse();
  screen = 'race';
  selectEl.hidden = true;
  mapScreen.hidden = true;
  raceEl.hidden = false;
  shell.classList.add('racing');
  resetRace();
  running = true;
  last = performance.now();
  itemEl.textContent = `SPLEEF ${spleefLevel}: cannot be ${suffix(spleefLimit())}!`;
  document.querySelector('.race-help').textContent = `SPLEEF ${spleefLevel}: cannot be ${suffix(spleefLimit())}. Keep racing forever.`;
  if (raceEl.requestFullscreen) raceEl.requestFullscreen().catch(() => {});
}

function getFinalStandings() {
  const standings = [{
    index: player.index,
    name: player.name,
    image: racers[player.index][1],
    total: (player.lap - 1) * trackLength + player.z
  }];
  for (const rival of rivals) {
    standings.push({
      index: rival.index,
      name: rival.name,
      image: racers[rival.index][1],
      total: (rival.lap - 1) * trackLength + rival.z
    });
  }
  return standings.sort((a, b) => b.total - a.total);
}

function fillPodiumCard(card, winner) {
  const image = card.querySelector('img');
  const name = card.querySelector('strong');
  image.src = winner.image;
  image.alt = winner.name;
  name.textContent = winner.name;
}

function clearFinishSequence() {
  for (const timer of finishTimers) clearTimeout(timer);
  finishTimers = [];
  finishState = null;
  finishSequence.hidden = true;
  finishSequence.classList.remove('show-podium');
  finishAnnouncement.hidden = false;
  podiumScreen.hidden = true;
  for (const card of [podiumThird, podiumSecond, podiumFirst]) card.classList.remove('revealed');
  finishGoBack.classList.remove('ready');
}

function startFinishSequence(place) {
  const winners = getFinalStandings().slice(0, 3);
  finishState = { time: 0, phase: 'jump', winners };
  running = false;
  keys.clear();
  player.speed = 0;
  player.jumpPose = 4;
  player.jumpPower = 1.25;
  finishResult.textContent = `You finished ${suffix(place)}!`;
  fillPodiumCard(podiumThird, winners[2]);
  fillPodiumCard(podiumSecond, winners[1]);
  fillPodiumCard(podiumFirst, winners[0]);
  finishSequence.hidden = false;
  finishSequence.classList.remove('show-podium');
  finishAnnouncement.hidden = false;
  podiumScreen.hidden = true;
  itemEl.textContent = 'The race is over!';
  burst(W / 2, H - 210, '#fff36a', 70);
  const schedule = (delay, action) => {
    finishTimers.push(setTimeout(() => {
      if (finishState) action();
    }, delay));
  };
  schedule(2800, () => {
    finishState.phase = 'podium';
    finishSequence.classList.add('show-podium');
    podiumScreen.hidden = false;
  });
  schedule(3500, () => podiumThird.classList.add('revealed'));
  schedule(4500, () => podiumSecond.classList.add('revealed'));
  schedule(5500, () => podiumFirst.classList.add('revealed'));
  schedule(6500, () => {
    finishGoBack.classList.add('ready');
    finishGoBack.focus();
  });
}

function updateFinishSequence(dt) {
  finishState.time += dt;
}

function finishRace() {
  const place = getPlace();
  if (!spleefMode) {
    startFinishSequence(place);
    return;
  }
  const limit = spleefLimit();
  if (place >= limit) {
    running = false;
    itemEl.textContent = `SPLEEF OUT! You cannot be ${suffix(limit)}!`;
    document.querySelector('.race-help').textContent = `SPLEEF OUT! You finished ${suffix(place)} and cannot be ${suffix(limit)}.`;
    return;
  }
  spleefLevel++;
  currentCourse = randomCourse();
  resetRace();
  running = true;
  itemEl.textContent = `SPLEEF ${spleefLevel}: cannot be ${suffix(spleefLimit())}!`;
  document.querySelector('.race-help').textContent = `SPLEEF ${spleefLevel}: cannot be ${suffix(spleefLimit())}. Next course: ${currentCourse.name}.`;
}
function startRace() {
  spleefMode = false;
  screen = 'race';
  selectEl.hidden = true;
  mapScreen.hidden = true;
  raceEl.hidden = false;
  shell.classList.add('racing');
  resetRace();
  running = true;
  last = performance.now();
  if (raceEl.requestFullscreen) raceEl.requestFullscreen().catch(() => {});
}

function buildRoster() {
  racers.forEach((racer, i) => {
    const button = document.createElement('button');
    button.className = 'racer-card';
    button.type = 'button';
    button.innerHTML = `<img alt="" src="${racer[1]}"><strong>${racer[0]}</strong><span>Racer ${i + 1}</span>`;
    button.addEventListener('click', () => {
      selected = i;
      showMap();
    });
    rosterEl.appendChild(button);
  });
}

function mapChoose(event) {
  const rect = mapStage.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  routePoint = { x: x / rect.width, y: y / rect.height };
  currentCourse = nearestCourse(routePoint.x, routePoint.y);
  mapMarker.style.left = `${x}px`;
  mapMarker.style.top = `${y}px`;
  mapMarker.hidden = false;
  confirmBar.hidden = false;
  subtitleEl.textContent = `${currentCourse.name} chosen. Confirm at the bottom.`;
}

function applyPower(power) {
  if (!power) return;
  player.effect = power.id;
  player.effectTime = power.id === 'doom' ? 11 : 7;
  player.wing = 0;
  itemEl.textContent = `Power: ${power.label}`;
  if (power.id === 'flower') player.fireAmmo = 6;
  if (power.id === 'bee') player.wing = 7;
  if (power.id === 'star') player.invincible = 7;
  if (power.id === 'leaf') player.spin = 7;
  if (power.id === 'red') player.targetScale = 1.45;
  if (power.id === 'silver') player.bounce = 7;
  if (power.id === 'blue') player.targetScale = .55;
  if (power.id === 'purple') player.targetScale = .55;
  if (power.id === 'doom') spawnDoom();
  burst(640, 525, power.color, 26);
}

function clearPower() {
  player.effect = null;
  player.effectTime = 0;
  player.targetScale = 1;
  player.bounce = 0;
  player.wing = 0;
  player.spin = 0;
  itemEl.textContent = 'Power: none';
}

function startSlots() {
  if (slotState.spinning) return;
  slotState.spinning = true;
  slotState.timer = 1.25 + Math.random() * .7;
  slotState.active = null;
  slotState.slots = [randPower(), randPower()];
  itemEl.textContent = 'Power: choosing...';
}

function useSpace() {
  if (screen !== 'race' || !running || !player) return;
  if (slotState.active) {
    const power = slotState.active;
    slotState.active = null;
    slotState.slots = [null, null];
    drawSlots();
    applyPower(power);
    return;
  }
  if (player.effect === 'flower') shootFireball();
  if (player.effect === 'bee') {
    player.speed = Math.min(player.maxSpeed + 150, player.speed + 145);
    player.wing = Math.max(player.wing, .45);
  }
  if (player.effect === 'silver') player.speed = Math.min(player.maxSpeed + 80, player.speed + 110);
}

function rivalPowerTarget(sourceIndex = -1) {
  const choices = rivals.filter(r => r.index !== sourceIndex && r.fallen <= 0);
  if (!choices.length) return null;
  return choices[Math.floor(Math.random() * choices.length)];
}

function spawnDoom(sourceRival = null) {
  const target = rivalPowerTarget(sourceRival?.index ?? -1);
  if (!target) return;
  doom = {
    z: wrap(target.z - 720, trackLength),
    x: target.x,
    pulse: 0,
    targetIndex: target.index,
    ownerIndex: sourceRival?.index ?? -1
  };
}

function shootFireball() {
  if (player.fireAmmo <= 0) return;
  player.fireAmmo--;
  fireballs.push({ z: player.z + 60, x: player.x, vx: 0, life: 3.6, side: Math.random() < .5 ? -1 : 1 });
  burst(640, 500, '#ff7b1a', 14);
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({ x, y, vx: (Math.random() - .5) * 340, vy: (Math.random() - .5) * 260, life: .4 + Math.random() * .65, color, size: 3 + Math.random() * 6, kind: 'spark' });
  }
}

function makeSmoke(x, y, scale = 1) {
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: x + (Math.random() - .5) * 8 * scale,
      y: y + (Math.random() - .5) * 5 * scale,
      vx: (Math.random() - .5) * 26 * scale,
      vy: 18 + Math.random() * 35,
      life: .38 + Math.random() * .28,
      color: 'rgba(72, 78, 84, .82)',
      size: (10 + Math.random() * 13) * scale,
      kind: 'smoke'
    });
  }
}

function knockPlayerDown() {
  if (player.invincible > 0 || player.breakdown > 0) return;
  player.fallen = 0;
  player.breakdown = 2.6;
  player.smokeTimer = 0;
  player.speed = 0;
  burst(640, 520, '#444', 18);
  itemEl.textContent = 'Car broke down!';
}

function doomCatch(target) {
  if (!target || target.invincible > 0) {
    doom = null;
    return;
  }
  target.fallen = 3;
  target.speed = Math.max(180, target.speed * .35);
  target.targetScale = .48;
  target.effect = 'doom-hit';
  target.effectTime = 3;
  target.itemFlash = 2;
  target.powerLabel = 'ROTTEN HIT!';
  doom = null;
}

function update(dt) {
  if (finishState) {
    updateFinishSequence(dt);
    updateParticles(dt);
    return;
  }
  if (!running) return;
  if (slotState.spinning) updateSlots(dt);
  updatePlayer(dt);
  updateRivals(dt);
  updateBlocks(dt);
  updateCourseObjects(dt);
  updateFireballs(dt);
  updateDoom(dt);
  updateParticles(dt);
  updateHud();
}

function updatePlayer(dt) {
  if (player.breakdown > 0) {
    player.breakdown -= dt;
    player.smokeTimer -= dt;
    player.speed *= Math.pow(.82, dt * 60);
    if (player.smokeTimer <= 0) {
      player.smokeTimer = .16;
      if (particles.filter(p => p.kind === 'smoke').length < 18) {
        const kartX = W / 2 + player.x * 360;
        const kartY = H - 88;
        const kartScale = player.scale * 2.15;
        makeSmoke(kartX - 35 * kartScale, kartY + 31 * kartScale, kartScale * .68);
        makeSmoke(kartX + 35 * kartScale, kartY + 31 * kartScale, kartScale * .68);
      }
    }
    if (player.breakdown <= 0) itemEl.textContent = player.effect ? itemEl.textContent : 'Power: none';
    return;
  }
  if (player.fallen > 0) {
    player.fallen -= dt;
    player.speed *= Math.pow(.88, dt * 60);
    return;
  }

  let max = player.maxSpeed;
  let accel = 420;
  if (player.effect === 'star') max = 760;
  if (player.effect === 'leaf') max = 620;
  if (player.effect === 'red') max = 455;
  if (player.effect === 'silver') max = 520;
  if (player.effect === 'purple') max = 225;
  if (Math.abs(player.x) > 1.08) max *= .45;
  if (currentCourse.id === 'snake') max *= 1.03;

  if (keys.has('arrowup') || keys.has('w')) player.speed += accel * dt;
  else player.speed -= 165 * dt;
  if (keys.has('arrowdown') || keys.has('s')) player.speed -= 430 * dt;

  player.speed = Math.max(0, Math.min(max, player.speed));
  const steerPower = .82 + player.speed / 820;
  if (keys.has('arrowleft') || keys.has('a')) player.x -= steerPower * dt;
  if (keys.has('arrowright') || keys.has('d')) player.x += steerPower * dt;
  player.x = Math.max(-1.32, Math.min(1.32, player.x));

  const oldZ = player.z;
  player.z += player.speed * dt;
  if (player.z >= trackLength) {
    player.z -= trackLength;
    player.lap++;
    burst(640, 520, '#ffd23b', 42);
    if (player.lap > lapsToWin) {
      finishRace();
      return;
    }
  }

  if (player.air > 0) player.air = Math.max(0, player.air - dt * .62);
  if (player.jumpPose > 0) player.jumpPose = Math.max(0, player.jumpPose - dt);
  if (player.blur > 0) player.blur = Math.max(0, player.blur - dt);
  if (player.tunnelSpin > 0) {
    player.tunnelSpin -= dt;
    player.x += Math.sin(performance.now() / 120) * dt * .95;
  }
  canvas.style.filter = player.blur > 0 ? 'blur(1.2px) saturate(1.45)' : '';

  if (player.effectTime > 0) {
    player.effectTime -= dt;
    if (player.effect === 'star') {
      player.invincible = Math.max(player.invincible, .2);
      coins.push({ z: oldZ - 30, x: player.x, life: 1, hue: performance.now() / 8 % 360 });
    }
    if (player.effect === 'leaf') player.spin = Math.max(0, player.spin - dt);
    if (player.effect === 'blue') player.targetScale = Math.max(.34, player.targetScale - dt * .05);
    if (player.effectTime <= 0) clearPower();
  }
  if (player.invincible > 0) player.invincible -= dt;
  player.scale += (player.targetScale - player.scale) * Math.min(1, dt * 4);
}

function applyRivalPower(r, power) {
  if (!power) return;
  r.effect = power.id;
  r.effectTime = power.id === 'doom' ? 1 : 5.5;
  r.itemFlash = 1.8;
  r.powerLabel = power.label.toUpperCase();
  r.targetScale = 1;
  r.bounce = 0;
  r.spin = 0;
  r.wing = 0;

  if (power.id === 'flower') {
    fireballs.push({
      z: r.z + 60,
      x: r.x,
      vx: 0,
      life: 3.2,
      side: Math.random() < .5 ? -1 : 1,
      ownerIndex: r.index
    });
  }
  if (power.id === 'bee') { r.wing = 5.5; r.speed += 95; }
  if (power.id === 'star') { r.invincible = 5.5; r.speed += 125; }
  if (power.id === 'leaf') { r.spin = 5.5; r.speed += 75; }
  if (power.id === 'red') r.targetScale = 1.38;
  if (power.id === 'silver') r.bounce = 5.5;
  if (power.id === 'blue') r.targetScale = .62;
  if (power.id === 'purple') {
    r.targetScale = .58;
    r.speed *= .58;
  }
  if (power.id === 'doom') spawnDoom(r);
}

function clearRivalPower(r) {
  r.effect = null;
  r.effectTime = 0;
  r.targetScale = 1;
  r.bounce = 0;
  r.spin = 0;
  r.wing = 0;
  r.powerLabel = '';
}

function updateRivals(dt) {
  for (const r of rivals) {
    r.itemFlash = Math.max(0, r.itemFlash - dt);
    r.useTimer -= dt;
    if (r.heldPower && r.useTimer <= 0) {
      const power = r.heldPower;
      r.heldPower = null;
      r.useTimer = 5 + Math.random() * 4;
      applyRivalPower(r, power);
    } else if (!r.heldPower && r.useTimer <= 0) {
      r.heldPower = randPower();
      r.useTimer = .45 + Math.random() * .8;
    }

    if (r.fallen > 0) {
      r.fallen -= dt;
      if (r.fallen <= 0 && r.effect === 'doom-hit') clearRivalPower(r);
      continue;
    }
    if (r.effectTime > 0) {
      r.effectTime -= dt;
      if (r.effect === 'star') r.invincible = Math.max(r.invincible, .2);
      if (r.effect === 'bee') r.wing = Math.max(r.wing - dt, 0);
      if (r.effect === 'leaf') r.spin = Math.max(r.spin - dt, 0);
      if (r.effectTime <= 0) clearRivalPower(r);
    }
    r.invincible = Math.max(0, r.invincible - dt);
    r.scale += (r.targetScale - r.scale) * Math.min(1, dt * 4);
    const boosted = r.effect === 'star' ? 120 : r.effect === 'leaf' ? 65 : r.effect === 'bee' ? 80 : 0;
    const targetSpeed = r.effect === 'purple' ? r.baseSpeed * .58 : r.baseSpeed + boosted;
    r.speed += (targetSpeed - r.speed) * Math.min(1, dt * 1.7);
    r.z += r.speed * dt;
    r.x += Math.sin(performance.now() / 900 + r.wobble) * dt * .16;
    r.x = Math.max(-.95, Math.min(.95, r.x));
    if (r.z >= trackLength) { r.z -= trackLength; r.lap++; }
  }
}

function updateBlocks(dt) {
  for (const b of blocks) {
    b.bob += dt * 5;
    if (!b.alive) {
      b.respawn -= dt;
      if (b.respawn <= 0) b.alive = true;
      continue;
    }
    const dz = wrappedAhead(b.z, player.z);
    if (dz < 80 && Math.abs(b.x - player.x) < .25) {
      b.alive = false;
      b.respawn = 7;
      startSlots();
      burst(640, 430, '#bd5d22', 20);
      continue;
    }
    for (const r of rivals) {
      const rivalDz = wrappedAhead(b.z, r.z);
      if (rivalDz < 70 && Math.abs(b.x - r.x) < .25) {
        b.alive = false;
        b.respawn = 7;
        r.heldPower = randPower();
        r.useTimer = .5 + Math.random() * 1.1;
        r.itemFlash = .8;
        r.powerLabel = 'ITEM!';
        break;
      }
    }
  }
}

function updateSlots(dt) {
  slotState.timer -= dt;
  slotState.bob[0] += dt * 8;
  slotState.bob[1] += dt * 8.8;
  if (Math.random() < .38) slotState.slots[0] = randPower();
  if (Math.random() < .38) slotState.slots[1] = randPower();
  if (slotState.timer <= 0) {
    slotState.spinning = false;
    slotState.active = Math.random() < .5 ? slotState.slots[0] : slotState.slots[1];
    itemEl.textContent = `Power ready: ${slotState.active.label}`;
  }
}

function updateFireballs(dt) {
  for (const f of fireballs) {
    f.z += 760 * dt;
    f.x += f.vx * dt;
    f.vx += f.side * .18 * dt;
    if (Math.abs(f.x) > 1.05) {
      f.x = Math.sign(f.x) * 1.05;
      f.side *= -1;
      f.vx *= -.8;
    }
    f.life -= dt;
    for (const r of rivals) {
      if (r.index === f.ownerIndex || r.invincible > 0) continue;
      const dz = Math.abs(wrappedAhead(r.z, f.z));
      if (dz < 80 && Math.abs(r.x - f.x) < .22 && r.fallen <= 0) {
        r.fallen = 2.4;
        f.life = 0;
      }
    }
    if (f.ownerIndex != null && f.life > 0 && player.invincible <= 0) {
      const playerDz = Math.min(wrappedAhead(player.z, f.z), wrappedAhead(f.z, player.z));
      if (playerDz < 58 && Math.abs(player.x - f.x) < .2) {
        knockPlayerDown();
        f.life = 0;
      }
    }
  }
  fireballs = fireballs.filter(f => f.life > 0);
}

function updateDoom(dt) {
  if (!doom) return;
  const target = rivals.find(r => r.index === doom.targetIndex);
  if (!target) { doom = null; return; }
  doom.pulse += dt * 8;
  doom.z += 620 * dt;
  if (doom.z >= trackLength) doom.z -= trackLength;
  doom.x += (target.x - doom.x) * dt * 1.8;
  const dz = Math.min(wrappedAhead(target.z, doom.z), wrappedAhead(doom.z, target.z));
  if (dz < 45 && Math.abs(target.x - doom.x) < .25) doomCatch(target);
}

function updateParticles(dt) {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= .94;
    p.vy *= .94;
    p.life -= dt;
  }
  particles = particles.filter(p => p.life > 0);
  for (const c of coins) c.life -= dt;
  coins = coins.filter(c => c.life > 0);
}

function wrappedAhead(z, cameraZ) {
  return wrap(z - cameraZ, trackLength);
}

function getPlace() {
  const playerTotal = (player.lap - 1) * trackLength + player.z;
  let place = 1;
  for (const r of rivals) {
    const total = (r.lap - 1) * trackLength + r.z;
    if (total > playerTotal) place++;
  }
  return place;
}

function updateHud() {
  if (!player) return;
  const place = getPlace();
  const lapText = `${Math.min(player.lap, lapsToWin)}/${lapsToWin}`;
  lapEl.textContent = `Lap ${lapText}`;
  placeEl.textContent = screen === 'race' ? `Place ${suffix(place)}` : 'Place --';
  raceLap.textContent = lapText;
  racePlace.textContent = suffix(place);
  raceSpeed.textContent = `${Math.round(player.speed)}`;
}

function draw() {
  if (screen === 'race') {
    drawRace();
    drawSlots();
  }
}

function drawRace() {
  drawSky();
  drawRoad();
  drawWorldObjects();
  drawPlayerKart();
  drawParticles();
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, horizon + 120);
  g.addColorStop(0, '#2f8ee8');
  g.addColorStop(.48, '#9fe1ff');
  g.addColorStop(.64, '#e8f8ff');
  g.addColorStop(.65, currentCourse.ground || '#68c860');
  g.addColorStop(1, shade(currentCourse.ground || '#2c8b44', -.28));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const sun = ctx.createRadialGradient(1050, 82, 8, 1050, 82, 90);
  sun.addColorStop(0, 'rgba(255,250,188,.96)');
  sun.addColorStop(.35, 'rgba(255,224,96,.5)');
  sun.addColorStop(1, 'rgba(255,224,96,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(940, 0, 220, 190);

  ctx.fillStyle = 'rgba(255,255,255,.78)';
  for (const cloud of [[125, 82, 1], [920, 142, .7], [1110, 54, .55]]) {
    ctx.beginPath();
    ctx.ellipse(cloud[0], cloud[1], 72 * cloud[2], 19 * cloud[2], 0, 0, Math.PI * 2);
    ctx.ellipse(cloud[0] - 30 * cloud[2], cloud[1] + 4, 34 * cloud[2], 22 * cloud[2], 0, 0, Math.PI * 2);
    ctx.ellipse(cloud[0] + 26 * cloud[2], cloud[1] - 4, 40 * cloud[2], 28 * cloud[2], 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#d9e7f4';
  ctx.fillRect(0, 150, W, 58);
  ctx.fillStyle = '#8da5bb';
  for (let i = 0; i < 28; i++) {
    ctx.fillRect(i * 50, 159 + (i % 3) * 11, 35, 12);
    ctx.fillStyle = i % 2 ? '#f95c5c' : '#56a8ff';
    ctx.fillRect(i * 50 + 5, 181, 7, 7);
    ctx.fillStyle = '#8da5bb';
  }

  ctx.fillStyle = '#2f2e6f';
  ctx.fillRect(350, 96, 520, 76);
  ctx.fillStyle = '#f12528';
  ctx.font = '900 54px Trebuchet MS';
  ctx.fillText('KIFF-O-KART', 430, 152);
  ctx.fillStyle = '#fff';
  ctx.font = '900 18px Trebuchet MS';
  ctx.fillText(currentCourse.name, 525, 116);
}

function drawRoad() {
  for (let i = 70; i >= 1; i--) {
    const d1 = i * 24;
    const d2 = (i - 1) * 24;
    const p1 = project(d1, 0, player.z);
    const p2 = project(d2, 0, player.z);
    const baseRoad = currentCourse.road || '#46515b';
    const roadColor = Math.floor((player.z + d1) / 180) % 2 ? shade(baseRoad, .1) : baseRoad;
    drawQuad(p1.x - p1.roadHalf, p1.y, p1.x + p1.roadHalf, p1.y, p2.x + p2.roadHalf, p2.y, p2.x - p2.roadHalf, p2.y, roadColor);

    const shoulder = Math.floor((player.z + d1) / 120) % 2 ? '#efedf0' : '#3bb8e4';
    drawQuad(p1.x - p1.roadHalf - 46 * p1.scale, p1.y, p1.x - p1.roadHalf, p1.y, p2.x - p2.roadHalf, p2.y, p2.x - p2.roadHalf - 46 * p2.scale, p2.y, shoulder);
    drawQuad(p1.x + p1.roadHalf, p1.y, p1.x + p1.roadHalf + 46 * p1.scale, p1.y, p2.x + p2.roadHalf + 46 * p2.scale, p2.y, p2.x + p2.roadHalf, p2.y, shoulder);

    if (i % 6 === 0) {
      ctx.strokeStyle = 'rgba(255,255,255,.78)';
      ctx.lineWidth = Math.max(2, 12 * p2.scale);
      ctx.beginPath();
      ctx.moveTo(p1.x - p1.roadHalf * .34, p1.y);
      ctx.lineTo(p2.x - p2.roadHalf * .34, p2.y);
      ctx.moveTo(p1.x + p1.roadHalf * .34, p1.y);
      ctx.lineTo(p2.x + p2.roadHalf * .34, p2.y);
      ctx.stroke();
    }
    if (i % 4 === 0) {
      ctx.fillStyle = 'rgba(20,26,30,.17)';
      ctx.fillRect(p2.x - p2.roadHalf * .72, p2.y, p2.roadHalf * 1.44, Math.max(1, p2.scale * 3));
    }
  }

}

function drawQuad(x1, y1, x2, y2, x3, y3, x4, y4, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.closePath();
  ctx.fill();
}

function drawWorldObjects() {
  const objects = [];
  objects.push({ type: 'finish', z: wrappedAhead(0, player.z), x: 0, data: null });
  for (const b of blocks) if (b.alive) objects.push({ type: 'block', z: wrappedAhead(b.z, player.z), x: b.x, data: b });
  for (const o of courseObjects) objects.push({ type: o.type, z: wrappedAhead(o.z, player.z), x: o.x, data: o });
  for (const r of rivals) objects.push({ type: 'rival', z: wrappedAhead(r.z, player.z), x: r.x, data: r });
  for (const f of fireballs) objects.push({ type: 'fire', z: wrappedAhead(f.z, player.z), x: f.x, data: f });
  for (const c of coins) objects.push({ type: 'coin', z: wrappedAhead(c.z, player.z), x: c.x, data: c });
  if (doom) objects.push({ type: 'doom', z: wrappedAhead(doom.z, player.z), x: doom.x, data: doom });
  objects.sort((a, b) => b.z - a.z);

  for (const obj of objects) {
    if (obj.z <= 10 || obj.z > 1500) continue;
    const p = project(obj.z, obj.x, player.z);
    if (obj.type === 'finish') drawFinishLine(p);
    if (obj.type === 'block') drawLuckyBlock(p, obj.data);
    if (obj.type !== 'finish' && obj.type !== 'block' && obj.type !== 'rival' && obj.type !== 'fire' && obj.type !== 'coin' && obj.type !== 'doom') drawCourseObject(obj, p);
    if (obj.type === 'rival') drawKart3D(p.x, p.y, p.scale * obj.data.scale * 1.15, obj.data, false);
    if (obj.type === 'fire') drawFireball(p.x, p.y, p.scale);
    if (obj.type === 'coin') drawCoin(p.x, p.y, p.scale, obj.data.hue);
    if (obj.type === 'doom') drawRottenMushroom(p.x, p.y, p.scale * 1.3);
  }
}

function drawFinishLine(p) {
  const s = Math.max(.16, p.scale);
  const cells = 12;
  const stripeWidth = p.roadHalf * 1.88;
  const cellWidth = stripeWidth / cells;
  const cellHeight = Math.max(5, 16 * s);
  const left = p.x - stripeWidth / 2;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < cells; col++) {
      ctx.fillStyle = (row + col) % 2 ? '#11151a' : '#f7f7f2';
      ctx.fillRect(left + col * cellWidth, p.y - row * cellHeight, cellWidth + 1, cellHeight + 1);
    }
  }

  const poleX = p.roadHalf * .9;
  const poleHeight = 205 * s;
  const poleWidth = Math.max(7, 18 * s);
  for (const side of [-1, 1]) {
    const x = p.x + side * poleX;
    ctx.fillStyle = '#202a33';
    ctx.fillRect(x - poleWidth / 2, p.y - poleHeight, poleWidth, poleHeight);
    ctx.fillStyle = '#eff4f7';
    for (let y = p.y - poleHeight + 8 * s; y < p.y; y += 30 * s) {
      ctx.fillRect(x - poleWidth / 2, y, poleWidth, 15 * s);
    }
  }

  const bannerY = p.y - poleHeight;
  const bannerWidth = poleX * 2 + poleWidth;
  const bannerHeight = 58 * s;
  const bannerCols = 14;
  const bannerRows = 2;
  const bannerCellW = bannerWidth / bannerCols;
  const bannerCellH = bannerHeight / bannerRows;
  for (let row = 0; row < bannerRows; row++) {
    for (let col = 0; col < bannerCols; col++) {
      ctx.fillStyle = (row + col) % 2 ? '#101317' : '#f2f3f4';
      ctx.fillRect(p.x - bannerWidth / 2 + col * bannerCellW, bannerY + row * bannerCellH, bannerCellW + 1, bannerCellH + 1);
    }
  }
  ctx.strokeStyle = '#15191d';
  ctx.lineWidth = Math.max(2, 5 * s);
  ctx.strokeRect(p.x - bannerWidth / 2, bannerY, bannerWidth, bannerHeight);

  ctx.fillStyle = '#9299a0';
  ctx.strokeStyle = '#252a2f';
  ctx.lineWidth = Math.max(2, 4 * s);
  ctx.font = `900 ${Math.max(12, 34 * s)}px Trebuchet MS`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText('FINISH', p.x, bannerY + bannerHeight * .52);
  ctx.fillText('FINISH', p.x, bannerY + bannerHeight * .52);
  ctx.textBaseline = 'alphabetic';
}

function drawLuckyBlock(p, b) {
  const size = Math.max(14, p.scale * 118);
  const y = p.y - size * .9 + Math.sin(b.bob) * 7;
  const img = images['assets/lucky-block.png'];
  if (img) ctx.drawImage(img, p.x - size / 2, y - size / 2, size, size);
  else {
    ctx.fillStyle = '#a94618';
    ctx.fillRect(p.x - size / 2, y - size / 2, size, size);
  }
}

function drawCourseObject(obj, p) {
  const o = obj.data;
  const x = p.x + (objectLane(o) - o.x) * p.roadHalf;
  const y = p.y;
  const isWall = o.type === 'snakeWall' || o.type === 'weaveWall';
  const visualScale = p.scale * (isWall ? 1.7 : 1.4);
  if (o.type === 'skyRamp') drawSkyRamp(x, y, visualScale);
  if (o.type === 'movingBlock') drawMovingBlock(x, y, visualScale);
  if (o.type === 'loop') drawLoop(x, y, visualScale);
  if (o.type === 'boost') drawBoostPad(x, y, visualScale);
  if (o.type === 'bouncyTunnel') drawBouncyTunnel(x, y, visualScale, o.phase);
  if (o.type === 'wreckingBall') drawWreckingBall(x, y, visualScale, o.phase);
  if (o.type === 'snakeWall') drawSnakeWall(x, y, visualScale);
  if (o.type === 'lava') drawLavaPool(x, y, visualScale, o.phase);
  if (o.type === 'spikes') drawSpikes(x, y, visualScale);
  if (o.type === 'greenTunnel') drawGreenTunnel(x, y, visualScale);
  if (o.type === 'weaveWall') drawWeaveWall(x, y, visualScale);
  if (o.type === 'cactus') drawCactus(x, y, visualScale);
}

function drawPrism(x, y, w, h, d, front, side, top) {
  ctx.fillStyle = side;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - h);
  ctx.lineTo(x + w / 2 + d, y - h - d * .55);
  ctx.lineTo(x + w / 2 + d, y - d * .55);
  ctx.lineTo(x + w / 2, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h);
  ctx.lineTo(x - w / 2 + d, y - h - d * .55);
  ctx.lineTo(x + w / 2 + d, y - h - d * .55);
  ctx.lineTo(x + w / 2, y - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = front;
  ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = Math.max(2, Math.min(8, w * .05));
  ctx.strokeRect(x - w / 2, y - h, w, h);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - h);
  ctx.lineTo(x + w / 2 + d, y - h - d * .55);
  ctx.lineTo(x + w / 2 + d, y - d * .55);
  ctx.lineTo(x + w / 2, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h);
  ctx.lineTo(x - w / 2 + d, y - h - d * .55);
  ctx.lineTo(x + w / 2 + d, y - h - d * .55);
  ctx.stroke();
}
function drawSkyRamp(x, y, s) {
  const w = 155 * s;
  const h = 118 * s;
  ctx.fillStyle = '#18361f';
  ctx.strokeStyle = '#0d2411';
  ctx.lineWidth = Math.max(2, 5 * s);
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y + 6 * s);
  ctx.lineTo(x + w / 2, y + 6 * s);
  ctx.lineTo(x + w * .22, y - h);
  ctx.lineTo(x - w * .44, y - h * .72);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#52c33c';
  ctx.beginPath();
  ctx.moveTo(x - w * .36, y - h * .68);
  ctx.lineTo(x + w * .18, y - h * .9);
  ctx.lineTo(x + w * .34, y - h * .62);
  ctx.lineTo(x - w * .18, y - h * .42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#75ee58';
  ctx.lineWidth = Math.max(2, 11 * s);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - w * .34, y - h * (.12 + i * .22));
    ctx.lineTo(x + w * .18, y - h * (.35 + i * .22));
    ctx.stroke();
  }
  ctx.strokeStyle = '#234f28';
  ctx.lineWidth = Math.max(1, 4 * s);
  for (const px of [-.62, .58]) {
    ctx.beginPath();
    ctx.moveTo(x + w * px, y - h * .86);
    ctx.lineTo(x + w * px, y - h * 1.55);
    ctx.stroke();
  }
}

function drawMovingBlock(x, y, s) {
  const size = Math.max(18, 88 * s);
  drawPrism(x, y, size, size, size * .34, '#38463f', '#1d2924', '#5e756a');
  ctx.fillStyle = '#72f05b';
  ctx.fillRect(x - size * .34, y - size * .72, size * .68, size * .16);
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.fillRect(x - size * .42, y - size * .95, size * .26, size * .86);
}

function drawLoop(x, y, s) {
  ctx.strokeStyle = '#c44cff';
  ctx.lineWidth = Math.max(5, 34 * s);
  ctx.beginPath();
  ctx.arc(x, y - 92 * s, 92 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#341042';
  ctx.lineWidth = Math.max(2, 8 * s);
  ctx.stroke();
}

function drawBoostPad(x, y, s) {
  const w = 150 * s;
  const h = 58 * s;
  drawQuad(x - w / 2, y, x + w / 2, y, x + w * .28, y - h, x - w * .28, y - h, '#31e9ff');
  ctx.fillStyle = '#fff45c';
  ctx.beginPath();
  ctx.moveTo(x - 20 * s, y - 11 * s);
  ctx.lineTo(x + 10 * s, y - 28 * s);
  ctx.lineTo(x - 4 * s, y - 32 * s);
  ctx.lineTo(x + 30 * s, y - 48 * s);
  ctx.lineTo(x + 4 * s, y - 17 * s);
  ctx.closePath();
  ctx.fill();
}

function drawBouncyTunnel(x, y, s, phase) {
  ctx.strokeStyle = '#9dff39';
  ctx.lineWidth = Math.max(5, 24 * s);
  ctx.beginPath();
  ctx.ellipse(x, y - 74 * s + Math.sin(phase * 5) * 8 * s, 125 * s, 78 * s, 0, Math.PI, 0);
  ctx.stroke();
  ctx.strokeStyle = '#5e2d19';
  ctx.lineWidth = Math.max(3, 10 * s);
  ctx.beginPath();
  ctx.moveTo(x - 86 * s, y - 68 * s);
  ctx.lineTo(x + 86 * s, y - 68 * s);
  ctx.stroke();
}

function drawWreckingBall(x, y, s, phase) {
  const topY = y - 210 * s;
  const ballX = x + Math.sin(phase * 1.7) * 120 * s;
  const ballY = y - 56 * s;
  ctx.strokeStyle = '#d8dce2';
  ctx.lineWidth = Math.max(2, 5 * s);
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(ballX, ballY);
  ctx.stroke();
  ctx.fillStyle = '#60656d';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = Math.max(2, 4 * s);
  ctx.beginPath();
  ctx.arc(ballX, ballY, 42 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#3d4148';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(ballX, ballY, (22 + i * 6) * s, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSnakeWall(x, y, s) {
  const w = 88 * s;
  const h = 118 * s;
  drawPrism(x, y, w, h, 34 * s, '#a6f133', '#648f22', '#d0ff72');
  ctx.strokeStyle = '#5b8f1b';
  ctx.lineWidth = Math.max(2, 6 * s);
  ctx.beginPath();
  ctx.moveTo(x - w * .35, y - h * .78);
  ctx.lineTo(x + w * .35, y - h * .5);
  ctx.lineTo(x - w * .2, y - h * .22);
  ctx.stroke();
}

function drawLavaPool(x, y, s, phase) {
  ctx.fillStyle = '#220b09';
  ctx.beginPath();
  ctx.ellipse(x, y - 16 * s, 88 * s, 35 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff3b14';
  ctx.beginPath();
  ctx.ellipse(x + Math.sin(phase * 4) * 8 * s, y - 18 * s, 66 * s, 24 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd34a';
  ctx.beginPath();
  ctx.ellipse(x - 16 * s, y - 24 * s, 24 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpikes(x, y, s) {
  for (let i = -2; i <= 2; i++) {
    const px = x + i * 28 * s;
    ctx.fillStyle = '#f0f5ff';
    ctx.beginPath();
    ctx.moveTo(px, y - 96 * s);
    ctx.lineTo(px + 14 * s, y - 8 * s);
    ctx.lineTo(px - 14 * s, y - 8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8792a0';
    ctx.beginPath();
    ctx.moveTo(px, y - 96 * s);
    ctx.lineTo(px + 14 * s, y - 8 * s);
    ctx.lineTo(px + 2 * s, y - 16 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = Math.max(1, 3 * s);
    ctx.stroke();
  }
}

function drawGreenTunnel(x, y, s) {
  ctx.strokeStyle = '#35c64b';
  ctx.lineWidth = Math.max(6, 28 * s);
  ctx.beginPath();
  ctx.ellipse(x, y - 88 * s, 145 * s, 92 * s, 0, Math.PI, 0);
  ctx.stroke();
  ctx.strokeStyle = '#127c25';
  ctx.lineWidth = Math.max(2, 7 * s);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 42 * s, y - 15 * s);
    ctx.lineTo(x + i * 24 * s, y - 162 * s);
    ctx.stroke();
  }
}

function drawWeaveWall(x, y, s) {
  const w = 76 * s;
  const h = 150 * s;
  drawPrism(x, y, w, h, 42 * s, '#5f5c55', '#37342f', '#8a867c');
  ctx.fillStyle = '#3f3c37';
  for (let i = 0; i < 4; i++) ctx.fillRect(x - w * .35, y - h + (22 + i * 28) * s, w * .7, 7 * s);
}

function drawCactus(x, y, s) {
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath();
  ctx.ellipse(x + 12 * s, y - 5 * s, 58 * s, 14 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  drawPrism(x, y - 8 * s, 44 * s, 112 * s, 18 * s, '#17a852', '#0d6d35', '#61e48b');
  drawPrism(x - 45 * s, y - 20 * s, 30 * s, 58 * s, 13 * s, '#17a852', '#0d6d35', '#61e48b');
  drawPrism(x + 45 * s, y - 22 * s, 30 * s, 70 * s, 13 * s, '#17a852', '#0d6d35', '#61e48b');
  ctx.strokeStyle = '#0b5128';
  ctx.lineWidth = Math.max(1, 3 * s);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 8 * s, y - 108 * s);
    ctx.lineTo(x + i * 8 * s, y - 24 * s);
    ctx.stroke();
  }
}
function drawPlayerKart() {
  const jumpArc = player.air > 0 ? Math.sin(Math.min(1, player.air / 1.9) * Math.PI) : 0;
  const celebrationJump = finishState?.phase === 'jump' ? Math.abs(Math.sin(finishState.time * 5.2)) * 220 : 0;
  const lift = Math.max(jumpArc * (250 + 70 * player.jumpPower), celebrationJump);
  const kartX = W / 2 + player.x * 360;
  const kartY = H - 88 - lift;
  drawKart3D(kartX, kartY, player.scale * 2.15, player, true);
  if ((player.jumpPose > 0 || finishState?.phase === 'jump') && player.img) drawDriverPose(kartX, kartY - 120 * player.scale, player.scale * 1.35);
  if (player.breakdown > 0) drawBreakdownSputter(kartX, kartY, player.scale);
  if (player.effect === 'star') {
    ctx.globalAlpha = .42;
    ctx.fillStyle = `hsl(${performance.now() / 4 % 360}, 95%, 65%)`;
    ctx.beginPath();
    ctx.ellipse(kartX, kartY - 8, 130 * player.scale, 42 * player.scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawDriverPose(x, y, s) {
  ctx.save();
  ctx.translate(x, y + Math.sin(performance.now() / 80) * 10);
  ctx.rotate(Math.sin(performance.now() / 130) * .12);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 6 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-18 * s, 8 * s);
  ctx.lineTo(-58 * s, -34 * s);
  ctx.moveTo(18 * s, 8 * s);
  ctx.lineTo(58 * s, -34 * s);
  ctx.moveTo(-12 * s, 45 * s);
  ctx.lineTo(-42 * s, 78 * s);
  ctx.moveTo(12 * s, 45 * s);
  ctx.lineTo(42 * s, 78 * s);
  ctx.stroke();
  ctx.fillStyle = player.color;
  roundRect(-30 * s, -2 * s, 60 * s, 58 * s, 13 * s, true, true);
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, -44 * s, 34 * s, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(player.img, -49 * s, -82 * s, 98 * s, 82 * s);
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.max(12, 18 * s)}px Trebuchet MS`;
  ctx.textAlign = 'center';
  ctx.fillText('POSE!', 0, -90 * s);
  ctx.restore();
}

function drawBreakdownSputter(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  const flicker = .6 + Math.sin(performance.now() / 45) * .4;
  for (const exhaustX of [-35, 35]) {
    ctx.fillStyle = `rgba(255,190,42,${flicker})`;
    ctx.beginPath();
    ctx.moveTo((exhaustX - 5) * s, 34 * s);
    ctx.lineTo(exhaustX * s, (48 + flicker * 12) * s);
    ctx.lineTo((exhaustX + 5) * s, 34 * s);
    ctx.fill();
  }
  ctx.fillStyle = '#ffef72';
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? -1 : 1;
    ctx.fillRect((side * 35 + Math.sin(performance.now() / 80 + i) * 12) * s, (46 + i * 5) * s, 4 * s, 4 * s);
  }
  ctx.restore();
}

function drawKart3D(x, y, s, kart, isPlayer) {
  ctx.save();
  ctx.translate(x, y);
  if (kart.fallen > 0) ctx.rotate(Math.sin(performance.now() / 60) * .25);
  if (kart.spin > 0) ctx.rotate(performance.now() / 75);
  const bounce = kart.bounce > 0 ? Math.sin(performance.now() / 65) * 12 * s : 0;
  const bodyColor = kart.effect === 'star' ? `hsl(${performance.now() / 4 % 360}, 95%, 58%)` : kart.color;
  const style = kartStyles[kart.index ?? selected] || kartStyles[0];

  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath();
  ctx.ellipse(0, 29 * s, (style.id === 'tom' ? 94 : 74) * s, 18 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, bounce);
  if (kart.effect === 'bee') drawWings(s, 0);
  drawKartPropulsion(style, s);

  const bodyGradient = ctx.createLinearGradient(0, -50 * s, 0, 26 * s);
  bodyGradient.addColorStop(0, shade(bodyColor, .24));
  bodyGradient.addColorStop(.55, bodyColor);
  bodyGradient.addColorStop(1, shade(bodyColor, -.34));
  ctx.fillStyle = bodyGradient;
  drawKartBody(style, s);
  drawKartDecor(style, s, bodyColor);

  const lightSpread = ['jim', 'julius', 'boom'].includes(style.id) ? 23 : 35;
  for (const lightX of [-lightSpread, lightSpread]) {
    const light = ctx.createRadialGradient(lightX * s, -4 * s, 1, lightX * s, -4 * s, 12 * s);
    light.addColorStop(0, '#fff1d6');
    light.addColorStop(.22, '#ff4747');
    light.addColorStop(1, '#9b0909');
    ctx.fillStyle = light;
    roundRect((lightX - 10) * s, -12 * s, 20 * s, 15 * s, 6 * s, true, false);
  }

  if (!['tom', 'todd', 'glitches', 'four'].includes(style.id)) {
    ctx.fillStyle = '#e7eef2';
    roundRect(-18 * s, 8 * s, 36 * s, 13 * s, 3 * s, true, false);
    ctx.fillStyle = '#222';
    ctx.font = `900 ${Math.max(6, 8 * s)}px Trebuchet MS`;
    ctx.textAlign = 'center';
    ctx.fillText(style.id === 'boom' ? 'BALL' : 'KOK', 0, 17 * s);
  }

  const exhausts = style.id === 'boom' ? [0] : ['tom', 'todd', 'glitches', 'four'].includes(style.id) ? [] : [-35, 35];
  for (const exhaustX of exhausts) {
    ctx.fillStyle = '#aeb7c0';
    ctx.beginPath();
    ctx.ellipse(exhaustX * s, 32 * s, 9 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22282d';
    ctx.beginPath();
    ctx.ellipse(exhaustX * s, 32 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = style.id === 'tom' ? '#9fa4aa' : shade(bodyColor, -.12);
  roundRect(-32 * s, -76 * s, 64 * s, 31 * s, 13 * s, true, true);
  ctx.fillStyle = shade(kart.color, .18);
  ctx.beginPath();
  ctx.arc(0, -91 * s, 30 * s, Math.PI, Math.PI * 2);
  ctx.lineTo(30 * s, -78 * s);
  ctx.lineTo(-30 * s, -78 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = shade(kart.color, -.38);
  ctx.lineWidth = Math.max(1, 4 * s);
  ctx.beginPath();
  ctx.moveTo(-22 * s, -89 * s);
  ctx.lineTo(22 * s, -89 * s);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = `900 ${Math.max(10, 13 * s)}px Trebuchet MS`;
  ctx.textAlign = 'center';
  if (!isPlayer) {
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4 * s;
    ctx.fillText(kart.name, 0, -118 * s);
    ctx.shadowBlur = 0;
    if (kart.itemFlash > 0 && kart.powerLabel) {
      ctx.fillStyle = kart.effect === 'doom' ? '#ff69c9' : '#ffe259';
      ctx.font = `900 ${Math.max(9, 11 * s)}px Trebuchet MS`;
      ctx.fillText(kart.powerLabel, 0, -135 * s);
    }
  }
  ctx.restore();
}

function drawKartDecor(style, s, bodyColor) {
  ctx.lineWidth = Math.max(1, 5 * s);
  ctx.strokeStyle = style.accent;
  ctx.fillStyle = style.accent;
  switch (style.id) {
    case 'kiff':
      ctx.beginPath(); ctx.moveTo(-9 * s, -47 * s); ctx.lineTo(12 * s, -17 * s); ctx.lineTo(-2 * s, -17 * s);
      ctx.lineTo(9 * s, 15 * s); ctx.lineTo(-22 * s, -11 * s); ctx.lineTo(-7 * s, -11 * s); ctx.closePath(); ctx.fill();
      ctx.fillRect(-67 * s, -37 * s, 134 * s, 7 * s); break;
    case 'jim':
      ctx.fillStyle = '#087d35';
      for (let y = -35; y < 20; y += 17) {
        ctx.beginPath(); ctx.moveTo(-29 * s, y * s); ctx.lineTo(0, (y + 9) * s); ctx.lineTo(29 * s, y * s);
        ctx.lineTo(29 * s, (y + 8) * s); ctx.lineTo(0, (y + 17) * s); ctx.lineTo(-29 * s, (y + 8) * s); ctx.fill();
      }
      ctx.fillRect(-5 * s, -73 * s, 10 * s, 20 * s); break;
    case 'bobby':
      ctx.strokeStyle = '#592713'; ctx.beginPath(); ctx.moveTo(-58 * s, -7 * s); ctx.lineTo(-40 * s, 5 * s);
      ctx.lineTo(-20 * s, -7 * s); ctx.lineTo(0, 7 * s); ctx.lineTo(20 * s, -7 * s); ctx.lineTo(40 * s, 5 * s); ctx.lineTo(58 * s, -7 * s); ctx.stroke();
      ctx.fillStyle = '#f7a05d'; ctx.beginPath(); ctx.arc(-42 * s, -25 * s, 6 * s, 0, Math.PI * 2); ctx.fill(); break;
    case 'four':
      ctx.fillStyle = shade(bodyColor, -.15); ctx.beginPath(); ctx.arc(-52 * s, -7 * s, 24 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#17191b'; ctx.stroke(); ctx.strokeStyle = '#a8b5bf'; ctx.lineWidth = Math.max(2, 7 * s);
      ctx.beginPath(); ctx.arc(3 * s, -16 * s, 39 * s, .2, 2.9); ctx.stroke(); break;
    case 'julius':
      ctx.fillStyle = '#6c167d'; ctx.fillRect(-6 * s, -57 * s, 12 * s, 75 * s); ctx.fillStyle = '#ff60ee';
      ctx.beginPath(); ctx.moveTo(-31 * s, 16 * s); ctx.lineTo(0, 31 * s); ctx.lineTo(31 * s, 16 * s); ctx.fill(); break;
    case 'micheal':
      ctx.fillStyle = '#ee202d'; roundRect(-23 * s, -28 * s, 46 * s, 32 * s, 8 * s, true, true);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-9 * s, -15 * s, 4 * s, 0, Math.PI * 2); ctx.arc(9 * s, -15 * s, 4 * s, 0, Math.PI * 2); ctx.fill(); break;
    case 'sam':
      ctx.fillStyle = '#1528df'; ctx.beginPath(); ctx.moveTo(0, -43 * s); ctx.lineTo(22 * s, -9 * s); ctx.lineTo(7 * s, -9 * s);
      ctx.lineTo(18 * s, 22 * s); ctx.lineTo(-18 * s, -4 * s); ctx.lineTo(-5 * s, -4 * s); ctx.closePath(); ctx.fill(); break;
    case 'todd':
      ctx.strokeStyle = '#87e9ff'; ctx.lineWidth = Math.max(2, 6 * s);
      for (let y = -48; y <= 10; y += 20) { ctx.beginPath(); ctx.ellipse(0, y * s, (29 + (y + 48) * .35) * s, 8 * s, 0, 0, Math.PI * 2); ctx.stroke(); } break;
    case 'phil':
      ctx.fillStyle = '#e65cff'; ctx.beginPath(); ctx.moveTo(0, -7 * s); ctx.lineTo(-34 * s, 17 * s); ctx.lineTo(-24 * s, -31 * s); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -7 * s); ctx.lineTo(34 * s, 17 * s); ctx.lineTo(24 * s, -31 * s); ctx.closePath(); ctx.fill(); break;
    case 'tom':
      ctx.fillStyle = '#f5222d'; ctx.beginPath(); ctx.moveTo(-42 * s, -15 * s); ctx.lineTo(-10 * s, -5 * s); ctx.lineTo(-20 * s, 12 * s); ctx.lineTo(-44 * s, 4 * s); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(42 * s, -15 * s); ctx.lineTo(10 * s, -5 * s); ctx.lineTo(20 * s, 12 * s); ctx.lineTo(44 * s, 4 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#777'; ctx.fillRect(-9 * s, -55 * s, 18 * s, 95 * s); break;
    case 'boom':
      ctx.fillStyle = '#777'; ctx.beginPath(); ctx.arc(-22 * s, -48 * s, 19 * s, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(22 * s, -48 * s, 19 * s, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#171717';
      ctx.font = `900 ${Math.max(7, 10 * s)}px Trebuchet MS`; ctx.textAlign = 'center'; ctx.fillText('BOOM', 0, -11 * s); break;
    case 'glitches':
      ctx.fillStyle = '#ef61f1';
      for (const r of [[-27,-42,31,10],[8,-27,30,12],[-35,-9,27,10],[3,8,38,11]]) roundRect(r[0]*s,r[1]*s,r[2]*s,r[3]*s,3*s,true,true);
      ctx.fillStyle = '#ffe91f'; ctx.beginPath(); ctx.moveTo(-50*s,6*s); ctx.lineTo(-74*s,21*s); ctx.lineTo(-45*s,25*s); ctx.fill();
      ctx.beginPath(); ctx.moveTo(50*s,6*s); ctx.lineTo(74*s,21*s); ctx.lineTo(45*s,25*s); ctx.fill(); break;
  }
}

function drawKartBody(style, s) {
  ctx.strokeStyle = '#101216';
  ctx.lineWidth = Math.max(1, 4 * s);
  ctx.beginPath();
  switch (style.id) {
    case 'kiff':
      ctx.moveTo(-72 * s, -18 * s); ctx.lineTo(-52 * s, -48 * s); ctx.lineTo(48 * s, -44 * s);
      ctx.lineTo(72 * s, -17 * s); ctx.lineTo(60 * s, 27 * s); ctx.lineTo(-62 * s, 27 * s); break;
    case 'jim':
      ctx.moveTo(-38 * s, -38 * s); ctx.lineTo(-27 * s, -56 * s); ctx.lineTo(23 * s, -56 * s);
      ctx.lineTo(41 * s, -25 * s); ctx.lineTo(34 * s, 29 * s); ctx.lineTo(-35 * s, 29 * s); break;
    case 'bobby':
      ctx.moveTo(-72 * s, -28 * s); ctx.lineTo(-54 * s, -51 * s); ctx.lineTo(55 * s, -48 * s);
      ctx.lineTo(73 * s, -21 * s); ctx.lineTo(57 * s, 20 * s); ctx.lineTo(35 * s, 11 * s);
      ctx.lineTo(15 * s, 28 * s); ctx.lineTo(-11 * s, 12 * s); ctx.lineTo(-37 * s, 29 * s); ctx.lineTo(-58 * s, 12 * s); break;
    case 'four':
      ctx.ellipse(3 * s, -16 * s, 57 * s, 51 * s, 0, 0, Math.PI * 2); break;
    case 'julius':
      ctx.moveTo(-34 * s, -49 * s); ctx.lineTo(0, -61 * s); ctx.lineTo(35 * s, -45 * s);
      ctx.lineTo(47 * s, 14 * s); ctx.lineTo(0, 34 * s); ctx.lineTo(-46 * s, 14 * s); break;
    case 'micheal':
      ctx.moveTo(-70 * s, -39 * s); ctx.lineTo(70 * s, -39 * s); ctx.lineTo(51 * s, 21 * s);
      ctx.quadraticCurveTo(0, 43 * s, -51 * s, 21 * s); break;
    case 'sam':
      ctx.moveTo(-73 * s, -13 * s); ctx.lineTo(-42 * s, -49 * s); ctx.lineTo(0, -39 * s);
      ctx.lineTo(42 * s, -49 * s); ctx.lineTo(73 * s, -13 * s); ctx.lineTo(49 * s, 27 * s); ctx.lineTo(-49 * s, 27 * s); break;
    case 'todd':
      ctx.ellipse(0, -13 * s, 58 * s, 49 * s, 0, 0, Math.PI * 2); break;
    case 'phil':
      ctx.moveTo(-47 * s, -44 * s); ctx.quadraticCurveTo(0, -65 * s, 47 * s, -44 * s);
      ctx.lineTo(57 * s, 17 * s); ctx.quadraticCurveTo(0, 38 * s, -57 * s, 17 * s); break;
    case 'tom':
      ctx.ellipse(0, -14 * s, 49 * s, 55 * s, 0, 0, Math.PI * 2); break;
    case 'boom':
      ctx.moveTo(-52 * s, -43 * s); ctx.quadraticCurveTo(0, -66 * s, 52 * s, -43 * s);
      ctx.lineTo(47 * s, 24 * s); ctx.quadraticCurveTo(0, 43 * s, -47 * s, 24 * s); break;
    case 'glitches':
      ctx.moveTo(-51 * s, 26 * s); ctx.quadraticCurveTo(-70 * s, -9 * s, -42 * s, -49 * s);
      ctx.quadraticCurveTo(0, -70 * s, 42 * s, -49 * s); ctx.quadraticCurveTo(70 * s, -9 * s, 51 * s, 26 * s); break;
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawKartPropulsion(style, s) {
  const wheel = (x, y, rx = 18, ry = 30, rim = '#68727c') => {
    ctx.fillStyle = '#080a0c';
    ctx.beginPath();
    ctx.ellipse(x * s, y * s, rx * s, ry * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.ellipse(x * s, y * s, Math.max(5, rx * .44) * s, Math.max(8, ry * .52) * s, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  const ring = (x, y, rx, ry, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, 7 * s);
    ctx.beginPath();
    ctx.ellipse(x * s, y * s, rx * s, ry * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  if (style.drive === 'turbine') {
    for (const x of [-59, 59]) {
      wheel(x, 15, 21, 31, '#ffb814');
      ctx.strokeStyle = '#fff0aa';
      ctx.lineWidth = Math.max(1, 3 * s);
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.moveTo(x * s, 15 * s);
        ctx.lineTo((x + Math.cos(a) * 17) * s, (15 + Math.sin(a) * 24) * s);
        ctx.stroke();
      }
    }
  } else if (style.drive === 'scooter') {
    wheel(-38, 18, 13, 24, style.accent);
    wheel(38, 18, 13, 24, style.accent);
    wheel(0, 29, 10, 17, '#d4d9dc');
  } else if (style.drive === 'rings') {
    ring(-58, 15, 18, 29, style.accent);
    ring(58, 15, 18, 29, style.accent);
    ring(-76, -22, 16, 7, style.accent);
    ring(76, -22, 16, 7, style.accent);
  } else if (style.drive === 'hover') {
    ring(-45, 22, 19, 29, '#ee79f5');
    ring(45, 22, 19, 29, '#ee79f5');
  } else if (!['spider', 'ribbon', 'bubble'].includes(style.drive)) {
    wheel(-57, 15, 19, 31, style.id === 'sam' ? '#4050ec' : '#666d73');
    wheel(57, 15, 19, 31, style.id === 'sam' ? '#4050ec' : '#666d73');
  }

  if (style.id === 'bobby') drawRocketFlame(0, 35, s, '#ffbd18');
  if (style.id === 'boom') drawRocketFlame(0, 43, s, '#27bfff');
  if (style.id === 'micheal') {
    for (const x of [-78, -61, 61, 78]) drawTriangle(x, -8 + Math.abs(x) * .22, x < 0 ? -1 : 1, s, '#8f9297');
  }
  if (style.id === 'sam') {
    drawFin(-70, -15, -1, s, '#1c35f0');
    drawFin(70, -15, 1, s, '#1c35f0');
  }
  if (style.id === 'phil') {
    ctx.strokeStyle = '#e26af0';
    ctx.lineWidth = Math.max(3, 10 * s);
    ctx.beginPath();
    ctx.ellipse(-58 * s, -15 * s, 31 * s, 46 * s, -.55, 0, Math.PI * 2);
    ctx.ellipse(58 * s, -15 * s, 31 * s, 46 * s, .55, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (style.id === 'tom') {
    ctx.strokeStyle = '#b8bcc0';
    ctx.lineWidth = Math.max(3, 8 * s);
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const y = -35 + i * 20;
        ctx.beginPath();
        ctx.moveTo(side * 36 * s, y * s);
        ctx.lineTo(side * (69 + i * 7) * s, (y - 13 + i * 7) * s);
        ctx.lineTo(side * (91 + i * 6) * s, (y + 2 + i * 9) * s);
        ctx.stroke();
      }
    }
  }
}

function drawRocketFlame(x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo((x - 12) * s, y * s); ctx.lineTo(x * s, (y + 35) * s); ctx.lineTo((x + 12) * s, y * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff08b';
  ctx.beginPath();
  ctx.moveTo((x - 5) * s, y * s); ctx.lineTo(x * s, (y + 22) * s); ctx.lineTo((x + 5) * s, y * s); ctx.closePath(); ctx.fill();
}

function drawTriangle(x, y, dir, s, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#151515';
  ctx.lineWidth = Math.max(1, 3 * s);
  ctx.beginPath();
  ctx.moveTo(x * s, (y - 14) * s); ctx.lineTo((x + dir * 25) * s, y * s); ctx.lineTo(x * s, (y + 14) * s); ctx.closePath();
  ctx.fill(); ctx.stroke();
}

function drawFin(x, y, dir, s, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#101216';
  ctx.lineWidth = Math.max(1, 4 * s);
  ctx.beginPath();
  ctx.moveTo(x * s, (y - 21) * s); ctx.lineTo((x + dir * 34) * s, (y + 12) * s); ctx.lineTo(x * s, (y + 18) * s); ctx.closePath();
  ctx.fill(); ctx.stroke();
}

function drawWings(s, bounce) {
  const flap = Math.sin(performance.now() / 55) * 18 * s;
  ctx.fillStyle = 'rgba(255,246,156,.92)';
  ctx.beginPath();
  ctx.ellipse(-72 * s, -28 * s + bounce, 20 * s, 40 * s + flap, -.35, 0, Math.PI * 2);
  ctx.ellipse(72 * s, -28 * s + bounce, 20 * s, 40 * s - flap, .35, 0, Math.PI * 2);
  ctx.fill();
}

function drawFireball(x, y, s) {
  ctx.fillStyle = '#ff4319';
  ctx.beginPath();
  ctx.arc(x, y - 30 * s, Math.max(5, 24 * s), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe45e';
  ctx.beginPath();
  ctx.arc(x - 5 * s, y - 35 * s, Math.max(3, 10 * s), 0, Math.PI * 2);
  ctx.fill();
}

function drawCoin(x, y, s, hue) {
  ctx.fillStyle = `hsl(${hue}, 95%, 58%)`;
  ctx.beginPath();
  ctx.ellipse(x, y - 34 * s, 12 * s, 18 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRottenMushroom(x, y, s) {
  ctx.save();
  ctx.translate(x, y - 34 * s);
  ctx.scale(Math.max(.2, s), Math.max(.2, s));
  ctx.fillStyle = '#ff48bd';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-45, 2);
  ctx.bezierCurveTo(-40, -42, -10, -62, 28, -50);
  ctx.bezierCurveTo(58, -40, 60, -6, 34, 18);
  ctx.lineTo(-28, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#111';
  for (const spot of [[-18, -28, 12], [20, -30, 10], [35, -5, 8]]) {
    ctx.beginPath();
    ctx.ellipse(spot[0], spot[1], spot[2], spot[2] * .75, .4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#35b4f5';
  ctx.beginPath();
  ctx.roundRect(-24, 0, 48, 38, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff2500';
  ctx.shadowColor = '#ff2500';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(-10, 11, 5, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(10, 11, 5, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.color;
    if (p.kind === 'smoke') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.2 - p.life * .25), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }
  ctx.globalAlpha = 1;
}

function drawSlots() {
  for (let i = 0; i < 2; i++) {
    const c = slotCanvases[i];
    const g = slotCtx[i];
    const power = slotState?.slots[i];
    const bob = slotState?.spinning ? Math.sin(slotState.bob[i]) * 9 : 0;
    slotEls[i].style.setProperty('--bob', `${bob}px`);
    g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = '#eef6ff';
    g.beginPath();
    g.arc(46, 46, 42, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#172436';
    g.lineWidth = 5;
    g.stroke();
    if (power) drawPowerIcon(g, power, 46, 46, 1);
    else {
      g.fillStyle = '#172436';
      g.font = '900 34px Trebuchet MS';
      g.textAlign = 'center';
      g.fillText('?', 46, 58);
    }
  }
}

function drawPowerIcon(g, power, x, y, s) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  if (power.id === 'doom') {
    drawRottenIcon(g);
  } else if (power.id === 'flower') {
    g.fillStyle = '#35b84b';
    g.fillRect(-4, 8, 8, 27);
    g.fillStyle = '#ff402d';
    g.beginPath();
    g.arc(0, -8, 25, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffeb5f';
    g.beginPath();
    g.arc(0, -8, 15, 0, Math.PI * 2);
    g.fill();
  } else if (power.id === 'bee') {
    g.fillStyle = '#ffd83c';
    g.beginPath();
    g.ellipse(0, -2, 28, 24, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#8a4a0e';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(-16, -22); g.lineTo(-10, 20); g.moveTo(8, -23); g.lineTo(14, 20); g.stroke();
  } else if (power.id === 'star') {
    g.fillStyle = '#ffe632';
    starPath(g, 0, 0, 31, 13); g.fill();
  } else if (power.id === 'leaf') {
    g.fillStyle = '#f59b38';
    g.beginPath();
    g.ellipse(0, 0, 26, 18, -.8, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#a34d16'; g.lineWidth = 4; g.beginPath(); g.moveTo(-15, 13); g.lineTo(18, -12); g.stroke();
  } else {
    const cap = power.id === 'red' ? '#f73730' : power.id === 'silver' ? '#cfd8e2' : power.id === 'blue' ? '#2b91ff' : '#a12df5';
    g.fillStyle = cap;
    g.beginPath();
    g.ellipse(0, -8, 30, 24, 0, Math.PI, 0);
    g.lineTo(30, 0); g.lineTo(-30, 0); g.closePath(); g.fill();
    g.fillStyle = '#ffe8a8';
    g.beginPath();
    g.roundRect(-20, -2, 40, 30, 12); g.fill();
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(0, -17, 8, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

function drawRottenIcon(g) {
  g.fillStyle = '#ff48bd';
  g.strokeStyle = '#111';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(-31, -4);
  g.bezierCurveTo(-28, -34, 3, -43, 28, -25);
  g.bezierCurveTo(38, -16, 35, 4, 20, 12);
  g.lineTo(-20, 12);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = '#111';
  g.beginPath(); g.ellipse(-11, -20, 8, 6, .5, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(16, -19, 7, 6, -.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#34aef0';
  g.beginPath(); g.roundRect(-16, 1, 32, 25, 8); g.fill(); g.stroke();
  g.fillStyle = '#ff2500';
  g.beginPath(); g.ellipse(-7, 10, 4, 8, 0, 0, Math.PI * 2); g.ellipse(7, 10, 4, 8, 0, 0, Math.PI * 2); g.fill();
}

function starPath(g, x, y, outerR, innerR) {
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? innerR : outerR;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
}

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) { ctx.strokeStyle = '#101010'; ctx.lineWidth = Math.max(2, r * .2); ctx.stroke(); }
}

function shade(hex, amt) {
  if (!hex || !hex.startsWith('#')) return hex || '#888';
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + 255 * amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + 255 * amt));
  const b = Math.max(0, Math.min(255, (n & 255) + 255 * amt));
  return `rgb(${r}, ${g}, ${b})`;
}

function frame(ts) {
  const dt = Math.min(.033, (ts - last) / 1000 || .016);
  last = ts;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

mapStage.addEventListener('click', mapChoose);
mapStage.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const rect = mapStage.getBoundingClientRect();
    mapChoose({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
  }
});
confirmYes.addEventListener('click', startRace);
spleefButton.addEventListener('click', startSpleef);
confirmCancel.addEventListener('click', () => {
  routePoint = null;
  confirmBar.hidden = true;
  mapMarker.hidden = true;
  subtitleEl.textContent = 'Click another place on the map.';
});
backToSelect.addEventListener('click', showSelect);
finishGoBack.addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  clearFinishSequence();
  showMap();
});

window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'r'].includes(key)) event.preventDefault();
  keys.add(key);
  if (key === ' ') useSpace();
  if (key === 'r' && screen === 'race' && !finishState) {
    resetRace();
    running = true;
  }
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
window.kiffDebug = () => ({ course: currentCourse?.id, name: currentCourse?.name, objects: courseObjects.length, first: courseObjects[0]?.type, running, screen });

(async function init() {
  const assetList = [...racers.map(r => r[1]), 'assets/lucky-block.png'];
  const loaded = await Promise.all(assetList.map(async src => [src, await loadImage(src)]));
  for (const [src, img] of loaded) images[src] = img;
  buildRoster();
  resetRace();
  showSelect();
  requestAnimationFrame(frame);
})();
















