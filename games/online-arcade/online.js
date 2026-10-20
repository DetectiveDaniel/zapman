(() => {
  const frame = document.querySelector("#online-game"), url = "https://catboozle-arcade.cgesurrey.chatgpt.site/";
  function launch() { frame.src = url; }
  // An online site owns its own lives; the replay button restarts it after questions.
  document.querySelector("#edu-replay").addEventListener("click", () => { if (!window.ZapmanEducation.recover(launch)) launch(); });
  function ready() { if (window.ZapmanEducation.blocked) requestAnimationFrame(ready); else launch(); }
  requestAnimationFrame(ready);
})();
