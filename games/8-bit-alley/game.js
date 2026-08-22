const games = [
  {
    name: "Starforge Drift",
    description: "Fast hover-car racing through asteroid tunnels and glowing space lanes.",
    fun: "Fun because every turn feels like threading a needle at rocket speed.",
    play: "Grip the hover wheel, count down from three, and drift through a tunnel of sparkling asteroid gates.",
    palette: ["#130f2e", "#5d7dff", "#21d7d9", "#ffd45a"],
    scene: drawStarforge
  },
  {
    name: "Meadowbound",
    description: "A cozy nature adventure about restoring paths, ponds, and secret gardens.",
    fun: "Fun because it gives you little discoveries, gentle quests, and a world that feels kind.",
    play: "Pack a tiny map, follow the mossy trail, and choose one forgotten garden to bring back to life.",
    palette: ["#21442b", "#6ee16b", "#ffd45a", "#70c8ff"],
    scene: drawMeadow
  },
  {
    name: "Circuitfall",
    description: "Cyberpunk puzzle stealth inside a city where every camera has a rhythm.",
    fun: "Fun because you outsmart the level instead of overpowering it.",
    play: "Slip into the rain-lit alley, watch the camera pattern, and sneak past when the neon signs flicker.",
    palette: ["#141418", "#ff4f9a", "#21d7d9", "#6842c2"],
    scene: drawCircuit
  },
  {
    name: "Emberfall Arena",
    description: "Lava battlefield strategy with shifting islands, shields, and molten traps.",
    fun: "Fun because each move can flip the arena from brilliant plan to chaos.",
    play: "Choose your first island, raise a shield, and plan three moves before the lava bridge sinks.",
    palette: ["#2b1420", "#ff4f31", "#ff8a4b", "#ffd45a"],
    scene: drawEmber
  },
  {
    name: "Skyloom Tales",
    description: "Floating island fantasy where airships stitch lost kingdoms back together.",
    fun: "Fun because it feels like starting a storybook and steering the clouds yourself.",
    play: "Climb aboard the patchwork airship, pick a floating island, and discover what story is hiding there.",
    palette: ["#243a73", "#70c8ff", "#fff9e8", "#6ee16b"],
    scene: drawSkyloom
  },
  {
    name: "Neon Tides",
    description: "A neon ocean rhythm game about surfing beats under electric moonlight.",
    fun: "Fun because the whole ocean becomes a dance floor you can ride.",
    play: "Wait for the bass wave, tap with the glowing tide, and surf the brightest line across the moonlit water.",
    palette: ["#0d1b33", "#21d7d9", "#ff4f9a", "#9dff6e"],
    scene: drawNeon
  }
];

const pickButton = document.querySelector("#pickButton");
const result = document.querySelector("#result");
const resultName = document.querySelector("#resultName");
const resultDescription = document.querySelector("#resultDescription");
const resultFun = document.querySelector("#resultFun");
const resultCover = document.querySelector("#resultCover");
const playButton = document.querySelector("#playButton");
const playPanel = document.querySelector("#playPanel");
const playPrompt = document.querySelector("#playPrompt");
const cards = [...document.querySelectorAll(".game-card")];
let lastPick = -1;
let currentGame = null;

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function clear(ctx, color) {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawStars(ctx, color = "#fff9e8") {
  for (let i = 0; i < 36; i += 1) {
    const x = (i * 47) % 310;
    const y = (i * 31) % 130;
    px(ctx, x, y, i % 4 === 0 ? 4 : 2, 2, color);
  }
}

function drawStarforge(ctx, game) {
  clear(ctx, game.palette[0]);
  drawStars(ctx);
  px(ctx, 0, 150, 320, 70, "#090817");
  px(ctx, 58, 130, 204, 14, game.palette[2]);
  px(ctx, 92, 118, 136, 14, game.palette[1]);
  px(ctx, 138, 88, 44, 36, game.palette[3]);
  px(ctx, 126, 124, 68, 16, "#fff9e8");
  px(ctx, 80, 160, 160, 18, game.palette[1]);
  px(ctx, 60, 178, 200, 12, game.palette[2]);
  px(ctx, 86, 190, 34, 18, "#141418");
  px(ctx, 198, 190, 34, 18, "#141418");
}

function drawMeadow(ctx, game) {
  clear(ctx, "#70c8ff");
  px(ctx, 0, 146, 320, 74, game.palette[0]);
  px(ctx, 0, 168, 320, 52, game.palette[1]);
  px(ctx, 34, 120, 54, 50, "#3d8f45");
  px(ctx, 48, 84, 28, 44, "#7a4d32");
  px(ctx, 28, 66, 72, 34, game.palette[1]);
  px(ctx, 186, 136, 84, 30, "#4dc5cc");
  px(ctx, 198, 142, 60, 12, "#fff9e8");
  px(ctx, 118, 170, 74, 12, game.palette[2]);
  px(ctx, 130, 154, 18, 18, "#ff4f9a");
  px(ctx, 220, 92, 34, 34, game.palette[2]);
}

function drawCircuit(ctx, game) {
  clear(ctx, game.palette[0]);
  for (let x = 0; x < 320; x += 32) px(ctx, x, 0, 4, 220, "#252032");
  for (let y = 18; y < 220; y += 32) px(ctx, 0, y, 320, 4, "#252032");
  px(ctx, 46, 56, 74, 104, game.palette[3]);
  px(ctx, 58, 68, 50, 8, game.palette[2]);
  px(ctx, 184, 40, 82, 130, "#22223a");
  px(ctx, 196, 54, 58, 10, game.palette[1]);
  px(ctx, 136, 176, 52, 18, game.palette[2]);
  px(ctx, 152, 142, 20, 34, "#fff9e8");
  px(ctx, 154, 132, 16, 10, game.palette[1]);
}

function drawEmber(ctx, game) {
  clear(ctx, game.palette[0]);
  px(ctx, 0, 154, 320, 66, "#7c1e1f");
  for (let i = 0; i < 8; i += 1) {
    px(ctx, i * 44 - 10, 166 + (i % 2) * 16, 34, 54, game.palette[2]);
  }
  px(ctx, 72, 96, 82, 50, "#3f3032");
  px(ctx, 188, 74, 76, 62, "#3f3032");
  px(ctx, 92, 72, 28, 28, game.palette[3]);
  px(ctx, 210, 44, 28, 28, game.palette[1]);
  px(ctx, 146, 126, 28, 28, "#fff9e8");
  px(ctx, 140, 154, 44, 12, game.palette[3]);
}

function drawSkyloom(ctx, game) {
  clear(ctx, game.palette[0]);
  px(ctx, 0, 110, 320, 110, game.palette[1]);
  px(ctx, 42, 86, 92, 38, game.palette[2]);
  px(ctx, 58, 116, 58, 20, game.palette[3]);
  px(ctx, 188, 58, 86, 40, game.palette[2]);
  px(ctx, 204, 88, 52, 18, game.palette[3]);
  px(ctx, 124, 42, 62, 20, "#fff9e8");
  px(ctx, 138, 62, 34, 28, "#8b5d43");
  px(ctx, 112, 96, 92, 10, "#ffd45a");
  px(ctx, 210, 132, 44, 22, "#8b5d43");
}

function drawNeon(ctx, game) {
  clear(ctx, game.palette[0]);
  px(ctx, 0, 130, 320, 90, "#102f57");
  for (let i = 0; i < 7; i += 1) {
    px(ctx, i * 54 - 14, 148 + (i % 2) * 18, 44, 8, game.palette[i % 2 ? 1 : 2]);
  }
  px(ctx, 134, 54, 54, 54, "#fff9e8");
  px(ctx, 146, 66, 30, 30, game.palette[0]);
  px(ctx, 128, 144, 54, 16, game.palette[3]);
  px(ctx, 144, 116, 20, 28, "#ffcc7a");
  px(ctx, 138, 104, 32, 14, game.palette[2]);
  px(ctx, 82, 180, 150, 8, game.palette[1]);
}

function drawCover(canvas, game) {
  game.scene(canvas.getContext("2d"), game);
}

function pickGame() {
  let index = Math.floor(Math.random() * games.length);
  if (games.length > 1) {
    while (index === lastPick) index = Math.floor(Math.random() * games.length);
  }
  lastPick = index;

  const game = games[index];
  currentGame = game;
  result.classList.remove("is-hidden");
  playPanel.classList.add("is-hidden");
  playPrompt.textContent = "";
  resultName.textContent = game.name;
  resultDescription.textContent = game.description;
  resultFun.textContent = game.fun;
  drawCover(resultCover, game);

  cards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.game === game.name);
  });
}

function playGame() {
  if (!currentGame) return;
  playPanel.classList.remove("is-hidden");
  playPrompt.textContent = currentGame.play;
}

cards.forEach((card, index) => {
  drawCover(card.querySelector(".cover"), games[index]);
});

pickButton.addEventListener("click", pickGame);
playButton.addEventListener("click", playGame);
