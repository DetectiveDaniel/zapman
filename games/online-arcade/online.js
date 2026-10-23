(() => {
  const frame = document.querySelector("#online-game"), url = "https://catboozle-arcade.cgesurrey.chatgpt.site/";
  window.ZapmanArcadeAudio?.register(()=>({active:Boolean(frame.src),health:1,reward:0,level:0,shots:0}));
  function launch() { frame.src = url; }
  // An online site owns its own lives; the replay button restarts it after questions.
  document.querySelector("#edu-replay").addEventListener("click", () => { if (!window.ZapmanEducation.recover(launch)) launch(); });
  if(!window.ZapmanEducation.enabled){document.querySelector('#edu-replay').textContent='Play again';document.querySelector('header p').textContent='Enjoy Catboozle! with its Zapman arcade soundtrack. Use Sound: On/Off to mute this page; the hosted game controls its own internal sounds.';}
  function ready() { if (window.ZapmanEducation.blocked) requestAnimationFrame(ready); else launch(); }
  requestAnimationFrame(ready);
})();
