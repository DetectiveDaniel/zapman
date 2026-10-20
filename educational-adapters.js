/* Use each game's own recovery, rather than changing its physics or difficulty. */
(() => {
  "use strict";
  const education = window.ZapmanEducation;
  if (!education) return;
  const path = location.pathname.replace(/\\/g, "/");
  const game = path.match(/\/games\/(.+)\/index\.html$/)?.[1] || "hide-n-seek";
  const adapters = {
    "hide-n-seek": { lost: () => heavenMode && hearts <= 0, restore: () => leaveHeaven() },
    "bubble-blast": { lost: () => state.gameOver, restore: () => resetGame() },
    "cat-rescue": { lost: () => player.health <= 0, restore: () => { player.health = 15; setupLevel(level); } },
    "cat-rescue/versions/classic": { lost: () => player.health <= 0, restore: () => { player.health = 15; setupLevel(level); } },
    "cat-rescue/versions/character": { lost: () => gameOver, restore: () => startGame() },
    "chis-on-the-loose": { lost: () => gameOver && lives <= 0, restore: () => resetGame() },
    "dungeon-explorers": { lost: () => state.gameOver, restore: () => { setHealth(5); state.gameOver = false; state.running = true; state.paused = false; state.hitCooldown = 2; overlay.classList.add("hidden"); } },
    fighters: { lost: () => gameOver && !won, restore: () => reset() },
    "flight-master": { lost: () => gameOver, restore: () => resetGame() },
    "forest-bear-runner": { lost: () => !running, restore: () => resetGame() },
    "jump-jump": { lost: () => state === "spent" && activePlayers.every(p => !p.flying), restore: () => resetLevel(true) },
    manhunt: { restartsLoop: true, lost: () => !running && player?.hp <= 0, restore: () => startGame(selectedCharacter) },
    minedaft: { lost: () => gameOver && !victory && !gameShell.classList.contains("menu-open"), restore: () => startGame() },
    parkourz: { lost: () => screen === "tankytown" && tankyPlayer?.hp <= 0 || screen === "invaders" && runner?.hearts <= 0, restore: () => { if (screen === "tankytown") startTankyTown(); else startMeInvaders(invader.kind); } },
    "shardbreakers-echoes-of-the-fallen-realm": { lost: () => !running && (player.hp <= 0 || riftIntegrity <= 0), restore: () => { resetGame(); running = true; overlay.classList.add("hidden"); } },
    "silly-billies": { lost: () => state.mode === "lost", restore: () => { player.hearts = 10; loadLevel(state.level); player.hearts = 10; player.invincible = 2; updateHud(); beginPlaying(); messageEl.classList.add("hidden"); } },
    "smooth-rooftop-jumper": { lost: () => gameOver, restore: () => reset() },
    "snake-clash": { lost: () => state === "lost", restore: () => startGame() },
    "speeding-planes": { restartsLoop: true, lost: () => state.over && !state.won, restore: () => startGame() },
    "subway-surfers": { lost: () => gameOver && paused, restore: () => reset() },
    "super-detective-64": { lost: () => !running && player.health <= 0, restore: () => startGame(level) },
    "timmys-trek": { lost: () => gameOver && !won, restore: () => { player.lives = player.maxLives; loadLevel(); updateHearts(); } },
    "tnt-parkour": { lost: () => gameOver, restore: () => { if (currentLevel === 1) restart(); else { player.lives = 3; startNextLevel(currentLevel); } } },
    "turbo-lane": { lost: () => gameOver && !won, restore: () => reset() }
  };
  // Racing and puzzle/creation games without finite lives only need the entry questions.
  const adapter = adapters[game] || { lost: () => false, restore: () => {} };
  if (adapter) {
    adapter.release = () => {
      if (typeof keys !== "undefined") { if (typeof keys.clear === "function") keys.clear(); else Object.keys(keys).forEach(key => { keys[key] = false; }); }
    };
    education.register(adapter);
  }
})();
