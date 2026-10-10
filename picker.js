const pickerRoot = document.querySelector("#gamePicker");
const vipButton = document.querySelector("#vipButton");
const vipDialog = document.querySelector("#vipDialog");
const vipContent = document.querySelector("#vipContent");

const vipAccounts = {
  daniel1989: "Daniel",
  max1989: "Max",
  leopold1989: "Leopold",
};
const vipMessageKey = "zapman-vip-messages";
const vipSessionKey = "zapman-vip-user";
const vipRoomKey = "zapman-vip-room";
const vipRooms = [
  { id: "lounge", name: "VIP Lounge", empty: "No messages yet. Say hello to the VIP team!" },
  { id: "games", name: "Game Chat", empty: "No game messages yet. What should everyone play?" },
  { id: "ideas", name: "Ideas Chat", empty: "No ideas yet. Start a new VIP plan!" },
];
const vipChannel = "BroadcastChannel" in window ? new BroadcastChannel("zapman-vip-chat") : null;
let vipUser = sessionStorage.getItem(vipSessionKey) || "";
let vipRoom = vipRooms.some((room) => room.id === sessionStorage.getItem(vipRoomKey))
  ? sessionStorage.getItem(vipRoomKey)
  : "lounge";

const gameLibrary = [
  {
    folder: "fighters",
    title: "FIGHTERS!",
    preview: "assets/game-previews/fighters.png",
    theme: "#8c0018",
    accent: "#ffcc3d",
    summary: "Battlefield Run: play as a boy who throws grenades, shoots exploding fireballs, battles soldiers, dodges helicopter missiles, and races to the finish line.",
  },
  {
    folder: "8-bit-alley",
    title: "8-bit Alley",
    preview: "assets/game-previews/8-bit-alley.png",
    theme: "#151128",
    accent: "#66f6ff",
    summary: "Browse a tiny pixel arcade shelf containing six fictional game ideas, then let the picker choose what to play.",
  },
  {
    folder: "parkourz",
    title: "PARKOURZ!",
    preview: "assets/game-previews/parkourz.png",
    theme: "#ff7a22",
    accent: "#fff000",
    summary: "A pixel parkour browser game with jumping, running, kicking, lucky blocks, tunnels, random powers, enemies, hearts, flags, lava, tanks, potions, bosses, and a rainy final challenge.",
  },
  {
    folder: "hide-n-seek",
    title: "Hide 'n' Seek!",
    preview: "assets/game-previews/hide-n-seek.png",
    theme: "#284421",
    accent: "#f7d66b",
    summary: "Play as Tim, choose sketch-map missions, find hidden people, survive dangers, unlock regions, enter the maze, visit Heaven, and travel to a different map.",
  },
  {
    folder: "bubble-blast",
    title: "Bubble Blast",
    preview: "assets/game-previews/bubble-blast.png",
    theme: "#13223f",
    accent: "#ff6ab7",
    summary: "Aim the loaded bubble at falling bubbles of the same color. Matching shots pop connected bubbles for points, while wrong hits can fall into the hole.",
  },
  {
    folder: "cat-rescue",
    title: "Cat Rescue",
    preview: "assets/game-previews/cat-rescue.png",
    versions: [
      { id: "three-level", label: "Three-Level", path: "games/cat-rescue/index.html" },
      { id: "character", label: "Character", path: "games/cat-rescue/versions/character/index.html" },
      { id: "classic", label: "Classic", path: "games/cat-rescue/versions/classic/index.html" },
    ],
    theme: "#633f82",
    accent: "#ffcf4a",
    summary: "Choose a rescue cat, fight the dog patrol, defeat the big dog, collect the key, and free the captured cats.",
  },
  {
    folder: "chis-on-the-loose",
    title: "Chi's on the Loose",
    preview: "assets/game-previews/chis-on-the-loose.png",
    theme: "#6347a8",
    accent: "#ffd84a",
    summary: "A local browser game from your collection.",
  },
  {
    folder: "dungeon-explorers",
    title: "DUNGEON EXPLORERS",
    preview: "assets/game-previews/dungeon-explorers.png",
    theme: "#1c1828",
    accent: "#d6a34a",
    summary: "Collect coins in a dungeon, survive Wave One, then battle missile-firing cars in Level Two.",
  },
  {
    folder: "forest-bear-runner",
    title: "Forest Bear Runner",
    preview: "assets/game-previews/forest-bear-runner.png",
    theme: "#183646",
    accent: "#f8ce64",
    summary: "Run through a pixel forest, defeat the bear by dodging logs and sticks, then survive desert bikers, bullets, grenades, and falling rocks.",
  },
  {
    folder: "flight-master",
    title: "Flight Master",
    preview: "assets/game-previews/flight-master.png",
    theme: "#153d63",
    accent: "#70c8ff",
    summary: "Fly a jet, fire blue lasers, shoot enemy planes, dodge helicopter bombs, and avoid buildings while damage rises.",
  },
  {
    folder: "jump-jump",
    title: "JUMP JUMP",
    preview: "assets/game-previews/jump-jump.png",
    theme: "#8f3333",
    accent: "#ffe05d",
    summary: "Launch a pixel jumper from a slingshot, smash towers, and knock out every angry enemy.",
  },
  {
    folder: "kiff-o-kart",
    title: "Kiff-o-Kart",
    preview: "assets/game-previews/kiff-o-kart.png",
    theme: "#2547a3",
    accent: "#ffcf3f",
    summary: "Choose a racer, click a place on the map, confirm the race, and drive in a local browser kart game.",
  },
  {
    folder: "manhunt",
    title: "Manhunt",
    preview: "assets/game-previews/manhunt.png",
    theme: "#1d3325",
    accent: "#e44d40",
    summary: "A local browser game from your collection.",
  },
  {
    folder: "math-game",
    title: "Math Game",
    preview: "assets/game-previews/math-game.png",
    theme: "#26345f",
    accent: "#9ee493",
    summary: "A local browser game from your collection.",
  },
  {
    folder: "math-jumper",
    title: "Math Jumper",
    preview: "assets/game-previews/math-jumper.png",
    theme: "#294d8f",
    accent: "#ff5a5a",
    summary: "Jump across red blocks, solve each maths question, and clear every level in this parkour challenge.",
  },
  {
    folder: "minedaft",
    title: "Minedaft",
    preview: "assets/game-previews/minedaft.png",
    theme: "#3b6130",
    accent: "#b68d66",
    summary: "A local browser game from your collection.",
  },
  {
    folder: "shardbreakers-echoes-of-the-fallen-realm",
    title: "Shardbreakers",
    preview: "assets/game-previews/shardbreakers.png",
    theme: "#2d1f42",
    accent: "#8ef0ff",
    summary: "An action RPG prototype set across shattered floating islands.",
  },
  {
    folder: "silly-billies",
    title: "Silly Billies",
    preview: "assets/game-previews/silly-billies.png",
    theme: "#5b39d1",
    accent: "#ffd84d",
    summary: "Run through Silly City as Billie, leap over ridiculous hazards, fire lasers at chasing monsters and robots, and reach the golden door with your ten hearts intact.",
  },
  {
    folder: "snake-clash",
    title: "Snake Clash",
    preview: "assets/game-previews/snake-clash.png",
    theme: "#0a6c4b",
    accent: "#b9f23c",
    summary: "Hunt colorful rival snakes, grow to 36 circles, transform into an armored dragon, and survive as every snake turns to hunt you.",
  },
  {
    folder: "smooth-rooftop-jumper",
    title: "Smooth Rooftop Jumper",
    preview: "assets/game-previews/smooth-rooftop-jumper.png",
    theme: "#222a38",
    accent: "#ff9d4d",
    summary: "A local browser game from your collection.",
  },
  {
    folder: "protocol",
    title: "Protocol",
    preview: "assets/game-previews/protocol.png",
    theme: "#111a2f",
    accent: "#68e3ff",
    summary: "Explore a self-contained pixel-art adventure with running, jumping, a star map, rowing, and combat.",
  },
  {
    folder: "speeding-planes",
    title: "SPEEDING PLANES!",
    preview: "assets/game-previews/speeding-planes.png",
    theme: "#0d2748",
    accent: "#ff4f48",
    summary: "Fly through three missions, lock targets, fire guns, launch missiles, and survive before damage reaches 100%.",
  },
  {
    folder: "subway-surfers",
    title: "Subway Surfers",
    preview: "assets/game-previews/subway-surfers.png",
    theme: "#f2b72f",
    accent: "#49d6ff",
    summary: "A canvas runner inspired by Subway Surfers. Switch lanes and jump over things.",
  },
  {
    folder: "super-detective-64",
    title: "Super Detective 64",
    preview: "assets/game-previews/super-detective-64.png",
    theme: "#38251c",
    accent: "#f2d17a",
    summary: "A mansion game starring Detective Daniel, Ninja Matisse, Pirate WJ, Rose, and Henry.",
  },
  {
    folder: "super-shuriken",
    title: "Super Shuriken",
    preview: "assets/game-previews/super-shuriken.png",
    theme: "#0b2e47",
    accent: "#ffd63d",
    summary: "Defend a bright meadow as a ninja, throw spinning shurikens at incoming robots, and survive increasingly dangerous waves of laser fire.",
  },
  {
    folder: "timmys-trek",
    title: "Timmy's Trek",
    preview: "assets/game-previews/timmys-trek.png",
    theme: "#236f68",
    accent: "#f7d66b",
    summary: "Choose a world, dash across three levels, grab coins, stomp enemies into smoke, and enter portals.",
  },
  {
    folder: "tnt-parkour",
    title: "TNT Parkour",
    preview: "assets/game-previews/tnt-parkour.png",
    theme: "#2f2f2f",
    accent: "#ff5a1f",
    summary: "A hand-drawn style parkour game based on the sketch.",
  },
  {
    folder: "turbo-lane",
    title: "Turbo Lane",
    preview: "assets/game-previews/turbo-lane.png",
    theme: "#1b3d4f",
    accent: "#ffcc4d",
    summary: "A local browser game from your collection.",
  },
];

let pickerState = "library";
let selectedGame = gameLibrary.find((game) => game.folder === "parkourz");
let dinoAnimation = null;
let loadingTimer = null;
let searchQuery = "";
let selectedCatVersion = "three-level";
const mobileModeKey = "zapman-mobile-mode";
const pickerParams = new URLSearchParams(window.location.search);
let mobileModeEnabled = pickerParams.get("mobile") === "1" || readMobileMode();

function readMobileMode() {
  try {
    return localStorage.getItem(mobileModeKey) === "true";
  } catch {
    return false;
  }
}

function applyMobileMode() {
  document.body.classList.toggle("mobile-mode", mobileModeEnabled);
  const toggle = pickerRoot?.querySelector("[data-picker-action='mobile-mode']");
  if (!toggle) return;
  toggle.setAttribute("aria-pressed", String(mobileModeEnabled));
  toggle.querySelector(".mobile-mode-state").textContent = mobileModeEnabled ? "On" : "Off";
}

function toggleMobileMode() {
  mobileModeEnabled = !mobileModeEnabled;
  try {
    localStorage.setItem(mobileModeKey, String(mobileModeEnabled));
  } catch {
    // The mode still works for this visit when storage is unavailable.
  }
  const url = new URL(window.location.href);
  if (mobileModeEnabled) url.searchParams.set("mobile", "1");
  else url.searchParams.delete("mobile");
  window.history.replaceState({}, "", url.href);
  applyMobileMode();
}

function showRootMobileGame() {
  pickerRoot.classList.add("is-hidden");
  document.body.classList.add("mobile-game-active");

  const toolbar = document.createElement("div");
  toolbar.className = "root-mobile-toolbar";
  toolbar.innerHTML = `
    <button type="button" data-root-mobile-action="games">Games</button>
    <button type="button" data-root-mobile-action="off">Mobile Mode Off</button>
  `;
  toolbar.addEventListener("click", (event) => {
    const action = event.target.closest("[data-root-mobile-action]")?.dataset.rootMobileAction;
    if (action === "games") {
      document.body.classList.remove("mobile-game-active");
      toolbar.remove();
      pickerState = "library";
      renderPicker();
    }
    if (action === "off") {
      mobileModeEnabled = false;
      try {
        localStorage.setItem(mobileModeKey, "false");
      } catch {
        // The current page can still leave Mobile Mode without storage.
      }
      document.body.classList.remove("mobile-mode", "mobile-game-active");
      toolbar.remove();
    }
  });
  document.body.append(toolbar);
}

function gameUrl(path) {
  if (!mobileModeEnabled) return path;
  const url = new URL(path, window.location.href);
  url.searchParams.set("mobile", "1");
  return url.href;
}

function cleanTitle(text) {
  return text.replace(/#/g, "").trim();
}

function escapeAttribute(text) {
  return text.replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function readVipMessages() {
  try {
    const messages = JSON.parse(localStorage.getItem(vipMessageKey) || "[]");
    return Array.isArray(messages)
      ? messages.slice(-300).map((message) => ({ ...message, room: message.room || "lounge" }))
      : [];
  } catch {
    return [];
  }
}

function currentVipRoom() {
  return vipRooms.find((room) => room.id === vipRoom) || vipRooms[0];
}

function renderVipLogin(errorMessage = "") {
  vipContent.innerHTML = `
    <form class="vip-panel vip-login" data-vip-form="login">
      <div class="vip-medallion" aria-hidden="true">VIP</div>
      <h2 id="vipTitle">VIP Members</h2>
      <p>Enter your VIP password to open the private chat.</p>
      <div class="vip-password-row">
        <label class="visually-hidden" for="vipPassword">VIP password</label>
        <input id="vipPassword" name="password" type="password" placeholder="VIP password" autocomplete="current-password" required>
        <button type="button" data-vip-action="show-password" aria-pressed="false">Show</button>
      </div>
      <p class="vip-error" role="alert">${escapeHtml(errorMessage)}</p>
      <button type="submit">Enter VIP Room</button>
      <button class="vip-close" type="button" data-vip-action="close">Close</button>
    </form>
  `;
  requestAnimationFrame(() => vipContent.querySelector("#vipPassword")?.focus());
}

function renderVipChat() {
  const room = currentVipRoom();
  const messages = readVipMessages().filter((message) => message.room === room.id).slice(-100);
  vipContent.innerHTML = `
    <section class="vip-panel vip-chat">
      <header class="vip-chat-header">
        <div>
          <p>${escapeHtml(room.name)}</p>
          <h2 id="vipTitle">Welcome, ${escapeHtml(vipUser)}</h2>
        </div>
        <div class="vip-chat-actions">
          <button class="vip-sign-out" type="button" data-vip-action="sign-out">Sign out</button>
          <button class="vip-close" type="button" data-vip-action="close" aria-label="Close VIP chat">Close</button>
        </div>
      </header>
      <nav class="vip-room-tabs" role="tablist" aria-label="VIP chats">
        ${vipRooms.map((chatRoom) => `
          <button type="button" role="tab" data-vip-room="${escapeAttribute(chatRoom.id)}" aria-selected="${chatRoom.id === room.id}">
            ${escapeHtml(chatRoom.name)}
          </button>
        `).join("")}
      </nav>
      <div id="vipMessages" class="vip-messages" role="log" aria-live="polite" aria-label="${escapeAttribute(room.name)} messages">
        ${messages.length ? messages.map((message) => `
          <article class="vip-message${message.author === vipUser ? " is-mine" : ""}" data-author="${escapeAttribute(message.author)}">
            <div class="vip-message-meta"><span>${escapeHtml(message.author)}</span><time>${escapeHtml(message.time)}</time></div>
            <div class="vip-message-body">${escapeHtml(message.text)}</div>
          </article>
        `).join("") : `<p class="vip-empty">${escapeHtml(room.empty)}</p>`}
      </div>
      <form class="vip-compose" data-vip-form="message">
        <label class="visually-hidden" for="vipMessage">Message</label>
        <input id="vipMessage" name="message" maxlength="240" placeholder="Message ${escapeAttribute(room.name)}..." autocomplete="off" required>
        <button type="submit">Send</button>
      </form>
    </section>
  `;
  const messageList = vipContent.querySelector("#vipMessages");
  messageList.scrollTop = messageList.scrollHeight;
  requestAnimationFrame(() => vipContent.querySelector("#vipMessage")?.focus());
}

function openVipRoom() {
  if (vipUser) {
    renderVipChat();
  } else {
    renderVipLogin();
  }
  vipDialog.showModal();
}

function saveVipMessage(text) {
  const messages = readVipMessages();
  messages.push({
    author: vipUser,
    room: vipRoom,
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });
  localStorage.setItem(vipMessageKey, JSON.stringify(messages.slice(-300)));
  vipChannel?.postMessage({ type: "new-message", room: vipRoom });
  renderVipChat();
}

function renderPicker() {
  if (!pickerRoot) {
    return;
  }

  pickerRoot.classList.remove("is-hidden");
  if (pickerState === "library") {
    renderLibrary();
  }
  if (pickerState === "detail") {
    renderDetail();
  }
  if (pickerState === "loading") {
    renderLoading(false);
  }
}

function renderLibrary() {
  pickerRoot.style.setProperty("--picker-bg", "#ffd817");
  pickerRoot.style.setProperty("--picker-accent", "#ff7a1a");
  pickerRoot.innerHTML = `
    <section class="picker-screen picker-library">
      <div class="picker-library-head">
        <div>
          <h2>Zapman Games!</h2>
          <p>Choose one of your games.</p>
        </div>
        <button class="picker-mobile-toggle" type="button" data-picker-action="mobile-mode" aria-pressed="${mobileModeEnabled}">
          <span class="mobile-mode-icon" aria-hidden="true"></span>
          <span>Mobile Mode</span>
          <strong class="mobile-mode-state">${mobileModeEnabled ? "On" : "Off"}</strong>
        </button>
      </div>
      <div class="picker-search-wrap">
        <label class="visually-hidden" for="gameSearch">Search your games</label>
        <div class="picker-search-box">
          <span class="picker-search-icon" aria-hidden="true"></span>
          <input id="gameSearch" type="search" value="${escapeAttribute(searchQuery)}" placeholder="Search games..." autocomplete="off" spellcheck="false">
          <button class="picker-search-clear" type="button" data-picker-action="clear-search" aria-label="Clear search" title="Clear search">&times;</button>
        </div>
        <p id="gameSearchStatus" class="picker-search-status" role="status" aria-live="polite"></p>
      </div>
      <div class="picker-grid">
        ${gameLibrary.map((game, index) => `
          <button class="picker-card" type="button" data-game-index="${index}" data-search-text="${escapeAttribute(`${game.title} ${game.folder} ${game.summary}`.toLowerCase())}" aria-label="Open ${game.title}">
            <span class="picker-card-art">${game.title.slice(0, 1)}</span>
            <strong>${game.title}</strong>
          </button>
        `).join("")}
        <p class="picker-no-results" hidden>No games found. Try another game name.</p>
      </div>
    </section>
  `;
  applyGameSearch();
  applyMobileMode();
}

function applyGameSearch() {
  const input = pickerRoot.querySelector("#gameSearch");
  if (!input) {
    return;
  }

  searchQuery = input.value;
  const query = searchQuery.trim().toLowerCase();
  const cards = [...pickerRoot.querySelectorAll(".picker-card")];
  let matchCount = 0;

  for (const card of cards) {
    const matches = !query || card.dataset.searchText.includes(query);
    card.hidden = !matches;
    if (matches) {
      matchCount += 1;
    }
  }

  const status = pickerRoot.querySelector("#gameSearchStatus");
  const noResults = pickerRoot.querySelector(".picker-no-results");
  const clearButton = pickerRoot.querySelector(".picker-search-clear");
  status.textContent = query
    ? `${matchCount} ${matchCount === 1 ? "game" : "games"} found`
    : `${gameLibrary.length} games to choose from`;
  noResults.hidden = matchCount !== 0;
  clearButton.hidden = !query;
}

function renderDetail() {
  const lines = buildSummaryLines(selectedGame.summary);
  const versionButtons = selectedGame.versions?.map((version) => `
    <button class="picker-version-button" type="button" data-picker-version="${version.id}" aria-pressed="${version.id === selectedCatVersion}">
      ${version.label}
    </button>
  `).join("") || "";
  pickerRoot.style.setProperty("--picker-bg", "#ffd817");
  pickerRoot.style.setProperty("--picker-accent", "#ff7a1a");
  pickerRoot.innerHTML = `
    <section class="picker-screen picker-detail">
      <button class="picker-back" type="button" data-picker-action="back">BACK</button>
      <div class="picker-preview ${versionButtons ? "has-version-switcher" : ""}">
        ${selectedGame.preview ? `<img class="picker-preview-image" src="${selectedGame.preview}" alt="${selectedGame.title} gameplay preview">` : ""}
        <button class="picker-play" type="button" data-picker-action="play" ${selectedGame.missing ? "disabled" : ""} aria-label="Play ${selectedGame.title}">
          <span></span>
        </button>
        ${versionButtons ? `
          <div class="picker-version-switcher" role="group" aria-label="Cat Rescue version">
            ${versionButtons}
          </div>
        ` : ""}
      </div>
      <button class="picker-down" type="button" data-picker-action="scroll" aria-label="Read more">↓</button>
      <h2>${cleanTitle(selectedGame.title)}</h2>
      ${selectedGame.missing ? `<p class="picker-missing">This folder needs an index.html before it can be played.</p>` : ""}
      <section class="picker-readme" aria-label="README">
        <h3>README</h3>
        <div class="picker-readme-copy">
          ${lines.map((line) => `<p>${line}</p>`).join("")}
        </div>
      </section>
    </section>
  `;
}

function buildSummaryLines(summary) {
  const words = summary.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > 74) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines.slice(0, 5);
}

function renderLoading(showDino) {
  pickerRoot.style.setProperty("--picker-bg", "#ffca16");
  pickerRoot.style.setProperty("--picker-accent", "#ff7a22");
  pickerRoot.innerHTML = `
    <section class="picker-screen picker-loading">
      <div class="picker-spinner" aria-hidden="true"></div>
      <h2>LOADING...</h2>
      <button class="picker-bored" type="button" data-picker-action="bored">Bored? Play a game!</button>
      ${showDino ? `
        <div class="dino-wrap">
          <canvas id="dinoGame" width="760" height="210"></canvas>
          <p>Press Space, W, Up, or tap to jump.</p>
        </div>
      ` : ""}
    </section>
  `;

  if (showDino) {
    startDinoGame();
  }
}

function startLoading() {
  if (selectedGame.missing) {
    return;
  }
  pickerState = "loading";
  stopDinoGame();
  renderLoading(false);
  clearTimeout(loadingTimer);
  loadingTimer = setTimeout(openSelectedGame, 1200);
}

function openSelectedGame() {
  stopDinoGame();
  clearTimeout(loadingTimer);
  if (selectedGame.folder === "hide-n-seek") {
    if (mobileModeEnabled) {
      showRootMobileGame();
    } else {
      pickerRoot.classList.add("is-hidden");
    }
    return;
  }
  const selectedVersion = selectedGame.versions?.find((version) => version.id === selectedCatVersion);
  window.location.href = gameUrl(selectedVersion?.path || `games/${selectedGame.folder}/index.html`);
}

function startDinoGame() {
  const dinoCanvas = document.querySelector("#dinoGame");
  if (!dinoCanvas) {
    return;
  }
  const dinoCtx = dinoCanvas.getContext("2d");
  const dino = { x: 90, y: 152, vy: 0, grounded: true };
  const cactus = { x: dinoCanvas.width + 60, y: 158 };
  let score = 0;
  let alive = true;

  function jump() {
    if (!alive) {
      alive = true;
      cactus.x = dinoCanvas.width + 60;
      score = 0;
    }
    if (dino.grounded) {
      dino.vy = -13;
      dino.grounded = false;
    }
  }

  function drawDinoGame() {
    dinoCtx.clearRect(0, 0, dinoCanvas.width, dinoCanvas.height);
    dinoCtx.fillStyle = "#fff7a6";
    dinoCtx.fillRect(0, 0, dinoCanvas.width, dinoCanvas.height);
    dinoCtx.fillStyle = "#111";
    dinoCtx.fillRect(0, 180, dinoCanvas.width, 6);

    if (alive) {
      dino.vy += 0.7;
      dino.y += dino.vy;
      if (dino.y >= 152) {
        dino.y = 152;
        dino.vy = 0;
        dino.grounded = true;
      }
      cactus.x -= 7;
      if (cactus.x < -30) {
        cactus.x = dinoCanvas.width + 80;
        score += 1;
      }
    }

    dinoCtx.fillStyle = "#2e9c4d";
    dinoCtx.fillRect(dino.x, dino.y - 42, 42, 42);
    dinoCtx.fillRect(dino.x + 31, dino.y - 62, 30, 25);
    dinoCtx.fillRect(dino.x + 5, dino.y, 10, 24);
    dinoCtx.fillRect(dino.x + 28, dino.y, 10, 24);
    dinoCtx.fillStyle = "#111";
    dinoCtx.fillRect(dino.x + 50, dino.y - 54, 5, 5);

    dinoCtx.fillStyle = "#207d3e";
    dinoCtx.fillRect(cactus.x, cactus.y - 54, 18, 54);
    dinoCtx.fillRect(cactus.x - 16, cactus.y - 36, 16, 10);
    dinoCtx.fillRect(cactus.x + 18, cactus.y - 28, 14, 10);

    dinoCtx.fillStyle = "#111";
    dinoCtx.font = "800 24px Courier New, monospace";
    dinoCtx.fillText(`Score ${score}`, 20, 36);

    const hit = dino.x + 55 > cactus.x && dino.x < cactus.x + 32 && dino.y > cactus.y - 48;
    if (hit) {
      alive = false;
      dinoCtx.fillText("BUMP! Jump again to retry.", 230, 108);
    }

    dinoAnimation = requestAnimationFrame(drawDinoGame);
  }

  dinoCanvas.addEventListener("pointerdown", jump);
  window.addEventListener("keydown", (event) => {
    if (pickerState === "loading" && [" ", "ArrowUp", "w", "W"].includes(event.key)) {
      event.preventDefault();
      jump();
    }
  });
  drawDinoGame();
}

function stopDinoGame() {
  if (dinoAnimation) {
    cancelAnimationFrame(dinoAnimation);
    dinoAnimation = null;
  }
}

pickerRoot.addEventListener("click", (event) => {
  const card = event.target.closest("[data-game-index]");
  if (card) {
    selectedGame = gameLibrary[Number(card.dataset.gameIndex)];
    pickerState = "detail";
    renderPicker();
    return;
  }

  const versionButton = event.target.closest("[data-picker-version]");
  if (versionButton && selectedGame.versions) {
    selectedCatVersion = versionButton.dataset.pickerVersion;
    renderDetail();
    return;
  }

  const action = event.target.closest("[data-picker-action]")?.dataset.pickerAction;
  if (action === "mobile-mode") {
    toggleMobileMode();
    return;
  }
  if (action === "back") {
    pickerState = "library";
    renderPicker();
  }
  if (action === "play") {
    startLoading();
  }
  if (action === "scroll") {
    pickerRoot.querySelector(".picker-readme")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (action === "bored") {
    clearTimeout(loadingTimer);
    renderLoading(true);
    loadingTimer = setTimeout(openSelectedGame, 6500);
  }
  if (action === "clear-search") {
    const input = pickerRoot.querySelector("#gameSearch");
    if (input) {
      input.value = "";
      applyGameSearch();
      input.focus();
    }
  }
});

pickerRoot.addEventListener("input", (event) => {
  if (event.target.matches("#gameSearch")) {
    applyGameSearch();
  }
});

vipButton.addEventListener("click", openVipRoom);

vipDialog.addEventListener("click", (event) => {
  const action = event.target.closest("[data-vip-action]")?.dataset.vipAction;
  const requestedRoom = event.target.closest("[data-vip-room]")?.dataset.vipRoom;
  if (requestedRoom && vipRooms.some((room) => room.id === requestedRoom)) {
    vipRoom = requestedRoom;
    sessionStorage.setItem(vipRoomKey, vipRoom);
    renderVipChat();
    return;
  }
  if (action === "close") {
    vipDialog.close();
  }
  if (action === "show-password") {
    const passwordInput = vipContent.querySelector("#vipPassword");
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    event.target.textContent = shouldShow ? "Hide" : "Show";
    event.target.setAttribute("aria-pressed", String(shouldShow));
    passwordInput.focus();
  }
  if (action === "sign-out") {
    vipUser = "";
    sessionStorage.removeItem(vipSessionKey);
    renderVipLogin();
  }
});

vipDialog.addEventListener("submit", (event) => {
  event.preventDefault();
  const formType = event.target.dataset.vipForm;
  if (formType === "login") {
    const password = new FormData(event.target).get("password").trim().toLowerCase();
    const accountName = vipAccounts[password];
    if (!accountName) {
      renderVipLogin("That password is not a VIP password. Please try again.");
      return;
    }
    vipUser = accountName;
    sessionStorage.setItem(vipSessionKey, vipUser);
    renderVipChat();
  }
  if (formType === "message") {
    const message = new FormData(event.target).get("message");
    if (message.trim()) {
      saveVipMessage(message);
    }
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === vipMessageKey && vipDialog.open && vipUser) {
    const newestMessage = readVipMessages().at(-1);
    if (!newestMessage || newestMessage.room === vipRoom) renderVipChat();
  }
});

vipChannel?.addEventListener("message", (event) => {
  if (vipDialog.open && vipUser && (!event.data?.room || event.data.room === vipRoom)) {
    renderVipChat();
  }
});

applyMobileMode();
renderPicker();
