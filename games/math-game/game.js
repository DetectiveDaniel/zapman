const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const charactersEl = document.getElementById("characters");
const form = document.getElementById("answer-form");
const problemEl = document.getElementById("problem");
const answerInput = document.getElementById("answer");
const feedbackEl = document.getElementById("feedback");
const startGameButton = document.getElementById("start-game");
const newGameButton = document.getElementById("new-game");
const heightEl = document.getElementById("height");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const timeEl = document.getElementById("time");
const difficultyEl = document.getElementById("difficulty");

const characters = [
  { name: "Lightning bolt", icon: "ZAP", color: "#ffd35c" },
  { name: "Heart", icon: "LOVE", color: "#ff6fb1" },
  { name: "Cross", icon: "+", color: "#82ff8d" },
  { name: "Music note", icon: "NOTE", color: "#52e1ff" },
  { name: "Chip", icon: "CHIP", color: "#c9a2ff" }
];

const difficulties = [
  { name: "Easy", max: 10, seconds: 60 },
  { name: "Medium", max: 25, seconds: 50 },
  { name: "Hard", max: 50, seconds: 40 }
];

const game = {
  selected: 0,
  difficulty: 0,
  question: null,
  started: false,
  timeLeft: 0,
  height: 0,
  targetHeight: 0,
  score: 0,
  streak: 0,
  sparks: []
};

let lastTime = performance.now();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newQuestion() {
  const addition = Math.random() > 0.5;
  const max = difficulties[game.difficulty].max;
  let a = randomInt(1, max);
  let b = randomInt(1, max);
  if (!addition && b > a) [a, b] = [b, a];
  const answer = addition ? a + b : a - b;
  game.question = { text: `${a} ${addition ? "+" : "-"} ${b} = ?`, answer };
  problemEl.textContent = game.question.text;
  answerInput.value = "";
  answerInput.focus();
}

function updateHud() {
  heightEl.textContent = `${Math.round(game.height)}`;
  scoreEl.textContent = `${game.score}`;
  streakEl.textContent = `${game.streak}`;
  timeEl.textContent = game.started ? `${Math.ceil(game.timeLeft)}` : "-";
  answerInput.disabled = !game.started;
  startGameButton.disabled = game.started;
}

function renderControls() {
  charactersEl.innerHTML = characters.map((character, index) => (
    `<button type="button" data-character="${index}" data-selected="${index === game.selected}">${character.icon}</button>`
  )).join("");
  difficultyEl.innerHTML = difficulties.map((difficulty, index) => (
    `<button type="button" data-difficulty="${index}" data-selected="${index === game.difficulty}">${difficulty.name}</button>`
  )).join("");
}

function addSparks(x, y, color) {
  for (let i = 0; i < 14; i += 1) {
    game.sparks.push({
      x,
      y,
      vx: -90 + Math.random() * 180,
      vy: -130 + Math.random() * 120,
      life: 0.55,
      size: randomInt(3, 7),
      color
    });
  }
}

function startGame() {
  game.started = true;
  game.timeLeft = difficulties[game.difficulty].seconds;
  game.height = 0;
  game.targetHeight = 0;
  game.score = 0;
  game.streak = 0;
  game.sparks = [];
  feedbackEl.textContent = "Climb by solving!";
  feedbackEl.className = "feedback";
  newQuestion();
  updateHud();
}

function finishGame() {
  game.started = false;
  game.question = null;
  problemEl.textContent = "Time!";
  feedbackEl.textContent = `Final score: ${game.score}`;
  feedbackEl.className = "feedback";
  updateHud();
}

function checkAnswer(event) {
  event.preventDefault();
  if (!game.started || !game.question) return;
  const guess = Number(answerInput.value);
  if (guess === game.question.answer) {
    game.streak += 1;
    game.score += 10 + Math.min(game.streak, 5);
    game.targetHeight = Math.min(100, game.targetHeight + 8 + Math.min(game.streak, 4));
    feedbackEl.textContent = "Correct!";
    feedbackEl.className = "feedback good";
    addSparks(492, 460 - game.targetHeight * 3.5, characters[game.selected].color);
  } else {
    game.streak = 0;
    feedbackEl.textContent = `Try again. The answer was ${game.question.answer}.`;
    feedbackEl.className = "feedback try";
  }
  newQuestion();
  updateHud();
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#243b66");
  sky.addColorStop(1, "#10182b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawRect(0, 490, canvas.width, 70, "#0b101d");
  drawRect(0, 488, canvas.width, 6, "#314b68");
}

function drawGuitar() {
  drawRect(428, 92, 102, 412, "#9c5d2e");
  drawRect(442, 92, 74, 412, "#c98345");
  for (let i = 0; i < 6; i += 1) {
    drawRect(456 + i * 10, 98, 3, 392, "#f7db91");
  }
  for (let y = 130; y < 480; y += 34) {
    drawRect(430, y, 98, 4, "#65371f");
  }
}

function drawPlayer() {
  const character = characters[game.selected];
  const y = 460 - game.height * 3.5;
  drawRect(470, y - 34, 44, 44, character.color);
  ctx.fillStyle = "#10182b";
  ctx.font = "900 15px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(character.icon, 492, y - 12);
}

function drawSparks(dt) {
  for (const spark of game.sparks) {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 220 * dt;
    spark.life -= dt;
    drawRect(spark.x, spark.y, spark.size, spark.size, spark.color);
  }
  game.sparks = game.sparks.filter((spark) => spark.life > 0);
}

function drawOverlay() {
  ctx.fillStyle = "#fff8e7";
  ctx.font = "900 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${difficulties[game.difficulty].name}: up to ${difficulties[game.difficulty].max}`, canvas.width / 2, 34);
  if (!game.started) {
    ctx.font = "900 44px monospace";
    ctx.fillText("PRESS START", canvas.width / 2, 240);
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  game.height += (game.targetHeight - game.height) * Math.min(1, dt * 7);
  if (game.started) {
    game.timeLeft = Math.max(0, game.timeLeft - dt);
    if (game.timeLeft <= 0) finishGame();
    updateHud();
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawGuitar();
  drawPlayer();
  drawSparks(dt);
  drawOverlay();
  requestAnimationFrame(loop);
}

charactersEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-character]");
  if (!button) return;
  game.selected = Number(button.dataset.character);
  renderControls();
});

difficultyEl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-difficulty]");
  if (!button) return;
  game.difficulty = Number(button.dataset.difficulty);
  renderControls();
  updateHud();
});

form.addEventListener("submit", checkAnswer);
startGameButton.addEventListener("click", startGame);
newGameButton.addEventListener("click", startGame);

renderControls();
updateHud();
requestAnimationFrame(loop);
