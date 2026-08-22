const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const startPanel = document.querySelector("#startPanel");
const startButton = document.querySelector("#startButton");
const levelName = document.querySelector("#levelName");
const scoreText = document.querySelector("#scoreText");
const promptText = document.querySelector("#promptText");
const feedbackText = document.querySelector("#feedbackText");
const answerForm = document.querySelector("#answerForm");
const answerInput = document.querySelector("#answerInput");

const spriteSheet = new Image();
spriteSheet.src = "assets/boy-emotes.png";

const backgrounds = [
  "assets/parkour-addition.png",
  "assets/parkour-subtraction.png",
  "assets/parkour-multiplication.png",
  "assets/parkour-division.png",
  "assets/parkour-fractions.png",
  "assets/parkour-algebra.png"
].map((src) => {
  const image = new Image();
  image.src = src;
  return image;
});

const levels = [
  {
    name: "Addition",
    banner: "#1f9f3f",
    makeBlocks: makeAdditionBlocks
  },
  {
    name: "Subtraction",
    banner: "#d92b2f",
    makeBlocks: makeSubtractionBlocks
  },
  {
    name: "Multiplication",
    banner: "#1677c7",
    makeBlocks: makeMultiplicationBlocks
  },
  {
    name: "Division",
    banner: "#6530b9",
    makeBlocks: makeDivisionBlocks
  },
  {
    name: "Fractions",
    banner: "#f06b11",
    makeBlocks: makeFractionBlocks
  },
  {
    name: "Algebra",
    banner: "#0a9e9e",
    makeBlocks: makeAlgebraBlocks,
    finish: true
  }
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uniqueQuestions(makeQuestion, count) {
  const questions = [];
  const seen = new Set();
  while (questions.length < count) {
    const question = makeQuestion();
    if (seen.has(question[0])) continue;
    seen.add(question[0]);
    questions.push(question);
  }
  return questions;
}

function makeAdditionBlocks() {
  return uniqueQuestions(() => {
    const left = rand(1, 8);
    const right = rand(1, Math.min(9, 10 - left));
    return [`${left} + ${right}`, String(left + right)];
  }, 6);
}

function makeSubtractionBlocks() {
  return uniqueQuestions(() => {
    const answer = rand(1, 8);
    const right = rand(1, 8);
    const left = answer + right;
    return [`${left} - ${right}`, String(answer)];
  }, 6);
}

function makeMultiplicationBlocks() {
  return uniqueQuestions(() => {
    const left = rand(2, 9);
    const right = rand(2, 9);
    return [`${left} x ${right}`, String(left * right)];
  }, 6);
}

function makeDivisionBlocks() {
  return uniqueQuestions(() => {
    const answer = rand(2, 9);
    const divisor = rand(2, 9);
    return [`${answer * divisor} / ${divisor}`, String(answer)];
  }, 6);
}

function makeFractionBlocks() {
  const pool = [
    ["1/2 + 1/2", "1"], ["1/4 + 1/4", "1/2"], ["2/3 - 1/3", "1/3"],
    ["1/3 + 1/3", "2/3"], ["3/5 + 1/5", "4/5"], ["7/8 - 3/8", "1/2"],
    ["1/4 x 2", "1/2"], ["5/6 - 1/6", "2/3"], ["1/5 + 3/5", "4/5"]
  ];
  return pool.sort(() => Math.random() - .5).slice(0, 6);
}

function makeAlgebraBlocks() {
  const pool = [
    ["2x - 5 = 9", "7"], ["x / 2 = 6", "12"], ["4x - 8 = 12", "5"],
    ["5x + 3 = 18", "3"], ["7x - 2 = 19", "3"], ["3x + 2 = 14", "4"],
    ["x + 8 = 15", "7"], ["6x / 3 = 10", "5"], ["x5 / 5 = 7", "7"]
  ];
  const shuffled = pool.filter(([question]) => question !== "x5 / 5 = 7").sort(() => Math.random() - .5);
  return shuffled.slice(0, 5).concat([["x5 / 5 = 7", "7"]]);
}

const keys = new Set();
let gameStarted = false;
let currentLevel = 0;
let activeBlock = null;
let messageTimer = 0;

const player = {
  x: 120,
  y: 484,
  w: 34,
  h: 48,
  vx: 0,
  vy: 0,
  grounded: false,
  face: 1,
  pose: "stand"
};

const world = {
  gravity: 0.72,
  friction: 0.78,
  speed: 0.88,
  maxSpeed: 5.1,
  jump: -13.2
};

let platforms = [];
let mathBlocks = [];

function buildLevel() {
  const level = levels[currentLevel];
  levelName.textContent = level.name;
  promptText.textContent = "Jump onto a math block.";
  feedbackText.textContent = "";
  answerInput.value = "";
  activeBlock = null;
  messageTimer = 0;
  player.x = 110;
  player.y = 478;
  player.vx = 0;
  player.vy = 0;
  player.pose = "stand";

  platforms = [
    { x: 0, y: 552, w: 1024, h: 88, kind: "ground" },
    { x: 0, y: 488, w: 90, h: 64, kind: "step" },
    { x: 90, y: 512, w: 80, h: 40, kind: "step" },
    { x: 170, y: 536, w: 84, h: 24, kind: "step" }
  ];

  const positions = [
    [58, 374], [260, 332], [448, 390], [660, 324], [250, 488], [620, 472]
  ];

  mathBlocks = level.makeBlocks().map(([question, answer], index) => ({
    x: positions[index][0],
    y: positions[index][1],
    w: question.length > 8 ? 200 : 154,
    h: 40,
    question,
    answer,
    solved: false
  }));

  scoreText.textContent = `0 / ${mathBlocks.length}`;
}

function drawBackground() {
  const bg = backgrounds[currentLevel];
  if (bg.complete && bg.naturalWidth) {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(224, 150, 184, .26)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  ctx.fillStyle = "#dfa5bb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,.13)";
  for (let x = -canvas.height; x < canvas.width; x += 48) {
    ctx.fillRect(x, 0, 24, canvas.height);
  }
}

function drawTile(x, y, w, h) {
  ctx.fillStyle = "#b96531";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#65c425";
  ctx.fillRect(x, y, w, 13);
  ctx.strokeStyle = "#231515";
  ctx.lineWidth = 3;
  for (let tx = x; tx < x + w; tx += 52) {
    ctx.strokeRect(tx, y, 52, h);
  }
  ctx.fillStyle = "#8d431d";
  for (let i = 0; i < w / 18; i += 1) {
    ctx.fillRect(x + i * 18 + 6, y + 28 + (i % 4) * 13, 8, 2);
  }
}

function drawBrickBlock(block) {
  ctx.save();
  ctx.globalAlpha = block.solved ? 0.55 : 1;
  ctx.fillStyle = block.solved ? "#4caf50" : "#df272c";
  ctx.fillRect(block.x, block.y, block.w, block.h);
  ctx.fillStyle = block.solved ? "#8de07c" : "#ff4d4d";
  for (let row = 0; row < 3; row += 1) {
    for (let x = block.x + (row % 2 ? 18 : 0); x < block.x + block.w; x += 38) {
      ctx.strokeStyle = "#5d1717";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, block.y + row * 13, 38, 13);
    }
  }
  ctx.strokeStyle = "#2a1515";
  ctx.lineWidth = 4;
  ctx.strokeRect(block.x, block.y, block.w, block.h);
  ctx.font = "900 28px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(0,0,0,.38)";
  ctx.strokeText(block.solved ? "OK!" : block.question, block.x + block.w / 2, block.y + block.h / 2 + 1);
  ctx.fillStyle = "#fff";
  ctx.fillText(block.solved ? "OK!" : block.question, block.x + block.w / 2, block.y + block.h / 2 + 1);
  ctx.restore();
}

function drawBanner() {
  const level = levels[currentLevel];
  ctx.fillStyle = level.banner;
  roundRect(322, 38, 380, 66, 12);
  ctx.fill();
  ctx.strokeStyle = "#231515";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.font = "900 38px Trebuchet MS, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#7b3713";
  ctx.strokeText(level.name.toUpperCase(), 512, 72);
  ctx.fillStyle = "#ffd84a";
  ctx.fillText(level.name.toUpperCase(), 512, 72);
}

function drawFinish() {
  if (!levels[currentLevel].finish) return;
  ctx.fillStyle = "#f6c52c";
  ctx.fillRect(830, 482, 52, 60);
  ctx.fillStyle = "#6b3d16";
  ctx.fillRect(816, 542, 80, 22);
  ctx.fillStyle = "#0a9e9e";
  ctx.fillRect(900, 494, 96, 54);
  ctx.strokeStyle = "#2a1515";
  ctx.lineWidth = 4;
  ctx.strokeRect(900, 494, 96, 54);
  ctx.font = "900 28px Trebuchet MS, Arial";
  ctx.fillStyle = "#ffd84a";
  ctx.fillText("FINISH", 948, 522);
}

function drawPlayer() {
  const sx = player.pose === "jump" ? 520 : player.pose === "duck" ? 70 : player.pose === "run" ? 70 : 520;
  const sy = player.pose === "jump" ? 550 : player.pose === "duck" ? 550 : 46;
  ctx.save();
  if (spriteSheet.complete && spriteSheet.naturalWidth) {
    if (player.face < 0) {
      ctx.translate(player.x + player.w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(spriteSheet, sx, sy, 360, 420, 0, player.y - 18, player.w, player.h + 18);
    } else {
      ctx.drawImage(spriteSheet, sx, sy, 360, 420, player.x, player.y - 18, player.w, player.h + 18);
    }
  } else {
    ctx.fillStyle = "#c41220";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updatePlayer() {
  if (keys.has("ArrowLeft")) player.vx -= world.speed;
  if (keys.has("ArrowRight")) player.vx += world.speed;
  if ((keys.has("ArrowUp") || keys.has(" ")) && player.grounded) {
    player.vy = world.jump;
    player.grounded = false;
  }

  player.vx = Math.max(-world.maxSpeed, Math.min(world.maxSpeed, player.vx));
  player.vy += world.gravity;
  player.x += player.vx;
  player.y += player.vy;
  player.grounded = false;

  const solids = platforms.concat(mathBlocks);
  for (const solid of solids) {
    if (!intersects(player, solid)) continue;
    if (player.vy >= 0 && player.y + player.h - player.vy <= solid.y + 6) {
      player.y = solid.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }

  player.vx *= world.friction;
  player.x = Math.max(4, Math.min(canvas.width - player.w - 4, player.x));
  if (player.y > canvas.height + 60) {
    player.x = 110;
    player.y = 478;
    player.vy = 0;
  }

  if (Math.abs(player.vx) > .5) player.face = Math.sign(player.vx);
  player.pose = !player.grounded ? "jump" : keys.has("ArrowDown") ? "duck" : Math.abs(player.vx) > 1 ? "run" : "stand";
  setActiveBlock();
}

function setActiveBlock() {
  const landed = mathBlocks.find((block) => {
    const nearTop = Math.abs(player.y + player.h - block.y) < 9;
    const centered = player.x + player.w > block.x + 8 && player.x < block.x + block.w - 8;
    return nearTop && centered && !block.solved;
  });

  if (landed && landed !== activeBlock) {
    activeBlock = landed;
    promptText.textContent = `Answer: ${activeBlock.question}`;
    feedbackText.textContent = "";
    answerInput.focus();
  } else if (!landed && activeBlock && messageTimer <= 0) {
    activeBlock = null;
    promptText.textContent = "Jump onto a math block.";
  }
}

function normalizeAnswer(value) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  const fraction = trimmed.match(/^(-?\d+)\/(-?\d+)$/);
  if (fraction) return String(Number(fraction[1]) / Number(fraction[2]));
  return trimmed;
}

function submitAnswer(event) {
  event.preventDefault();
  if (!activeBlock) {
    feedbackText.textContent = "Land on a block first.";
    return;
  }

  const typed = normalizeAnswer(answerInput.value);
  const expected = normalizeAnswer(activeBlock.answer);
  if (typed === expected || answerInput.value.trim().toLowerCase() === activeBlock.answer.toLowerCase()) {
    activeBlock.solved = true;
    activeBlock = null;
    answerInput.value = "";
    const solved = mathBlocks.filter((block) => block.solved).length;
    scoreText.textContent = `${solved} / ${mathBlocks.length}`;
    promptText.textContent = "Correct! Keep jumping.";
    feedbackText.textContent = "Nice";
    messageTimer = 80;
    if (solved === mathBlocks.length) {
      window.setTimeout(nextLevel, 850);
    }
  } else {
    feedbackText.textContent = "Try again";
  }
}

function nextLevel() {
  if (currentLevel === levels.length - 1) {
    promptText.textContent = "You beat MATH JUMPER!";
    feedbackText.textContent = "Champion";
    startPanel.querySelector("h2").textContent = "YOU WIN";
    startPanel.querySelector("p").textContent = "Zapman Games math parkour complete.";
    startButton.textContent = "Play Again";
    startPanel.classList.remove("is-hidden");
    gameStarted = false;
    currentLevel = 0;
    buildLevel();
    return;
  }
  currentLevel += 1;
  buildLevel();
}

function draw() {
  drawBackground();
  drawBanner();
  platforms.forEach((platform) => drawTile(platform.x, platform.y, platform.w, platform.h));
  mathBlocks.forEach(drawBrickBlock);
  drawFinish();
  drawPlayer();
}

function loop() {
  if (gameStarted) {
    updatePlayer();
    if (messageTimer > 0) messageTimer -= 1;
  }
  draw();
  requestAnimationFrame(loop);
}

function setKey(key, pressed) {
  if (pressed) keys.add(key);
  else keys.delete(key);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
    setKey(event.key, true);
  }
});

window.addEventListener("keyup", (event) => setKey(event.key, false));

document.querySelectorAll("[data-key]").forEach((button) => {
  const key = button.dataset.key;
  button.addEventListener("pointerdown", () => setKey(key, true));
  button.addEventListener("pointerup", () => setKey(key, false));
  button.addEventListener("pointerleave", () => setKey(key, false));
});

startButton.addEventListener("click", () => {
  startPanel.classList.add("is-hidden");
  gameStarted = true;
  buildLevel();
});

answerForm.addEventListener("submit", submitAnswer);

buildLevel();
loop();
