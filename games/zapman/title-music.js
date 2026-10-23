(() => {
  'use strict';
  const audio=document.querySelector('#titleTheme'),button=document.querySelector('#titleMusicButton');
  const key='zapman-title-music-muted';
  let enabled=true,inTitle=false,paused=false,unlocked=false,pending=false,needsGesture=false,leaving=false;
  try{enabled=localStorage.getItem(key)!=='true';}catch{/* The mute choice still works for this visit. */}
  audio.volume=.7;audio.loop=true;
  const shouldPlay=()=>inTitle&&!paused&&!document.hidden&&enabled&&unlocked&&!leaving;
  function label(){button.hidden=!inTitle;button.textContent=needsGesture&&enabled?'Play title music':`Music: ${enabled?'On':'Off'}`;button.setAttribute('aria-pressed',String(enabled));}
  function update(){
    label();
    if(!shouldPlay()){audio.pause();return;}
    if(pending||needsGesture||!audio.paused)return;
    pending=true;
    Promise.resolve(audio.play()).then(()=>{pending=false;if(!shouldPlay())audio.pause();}).catch(error=>{pending=false;needsGesture=shouldPlay()&&error?.name!=='AbortError';label();});
  }
  function unlock(event){if(event?.target===button)return;unlocked=true;needsGesture=false;update();}
  document.addEventListener('pointerdown',unlock,{capture:true});
  document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',update);
  window.addEventListener('pagehide',()=>{leaving=true;audio.pause();});
  window.addEventListener('pageshow',()=>{leaving=false;update();});
  button.addEventListener('click',()=>{if(needsGesture){enabled=true;}else enabled=!enabled;try{localStorage.setItem(key,String(!enabled));}catch{}unlock();});
  window.ZapmanTitleMusic={sync(stage,isPaused=false){const next=stage==='title';if(inTitle&&!next){audio.pause();audio.currentTime=0;}inTitle=next;paused=isPaused;update();}};
  label();
})();
