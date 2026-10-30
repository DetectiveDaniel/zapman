/* One touch keyboard for every game opened from the Zapman picker. */
(() => {
  'use strict';
  if(window.ZapmanMobileControls)return;
  const script=document.currentScript.src;
  const root=new URL('.',script).href===new URL('.',location.href).href;
  const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('mobile-controls.css',script).href;document.head.append(style);
  const pad=document.createElement('nav');pad.id='zapman-arrow-pad';pad.hidden=true;pad.setAttribute('aria-label','Mobile arrow controls');
  const arrows=[['ArrowUp','↑','Up'],['ArrowLeft','←','Left'],['ArrowDown','↓','Down'],['ArrowRight','→','Right']];
  const pointers=new Map(),held=new Map();let repeating=null;
  const keyNumbers={ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40};
  function send(code,type,repeat=false){
    const online=document.querySelector('#online-game');
    if(online?.contentWindow&&online.src){
      online.contentWindow.postMessage({type:'zapman-mobile-key',code,eventType:type,repeat},new URL(online.src).origin);return;
    }
    // Menu-based games use arrows to choose their cards and controls.
    if(/\/(8-bit-alley|math-game)\//.test(location.pathname||'')&&type==='keydown'){
      const controls=[...document.querySelectorAll('button,input,select')].filter(node=>!pad.contains(node)&&!node.disabled&&node.getClientRects().length&&!node.closest('[data-game-picker-back],#zapman-education'));
      const index=controls.indexOf(document.activeElement),direction=code==='ArrowLeft'||code==='ArrowUp'?-1:1;
      if(controls.length){const next=controls[(Math.max(0,index)+direction+controls.length)%controls.length];next.focus({preventScroll:true});if(next.matches('.game-card,#characters button,#difficulty button'))next.click();}return;
    }
    const target=document.querySelector('dialog[open] canvas')||document.querySelector('canvas')||document.body;
    const event=new KeyboardEvent(type,{key:code,code,bubbles:true,cancelable:true,repeat,keyCode:keyNumbers[code],which:keyNumbers[code]});
    target.dispatchEvent(event);
  }
  function release(pointerId){
    const press=pointers.get(pointerId);if(!press)return;pointers.delete(pointerId);
    const remaining=[...pointers.values()].some(p=>p.code===press.code);
    if(!remaining){held.delete(press.code);send(press.code,'keyup');press.button.setAttribute('aria-pressed','false');}
    if(!held.size){clearInterval(repeating);repeating=null;}
  }
  function releaseAll(){for(const id of [...pointers.keys()])release(id);}
  for(const [code,symbol,label]of arrows){
    const button=document.createElement('button');button.type='button';button.textContent=symbol;button.dataset.arrow=code;
    button.setAttribute('aria-label',label+' arrow');button.setAttribute('aria-pressed','false');
    button.addEventListener('pointerdown',event=>{
      event.preventDefault();event.stopPropagation();if(pad.hidden||window.ZapmanEducation?.blocked)return;
      if(event.pointerType==='mouse'&&event.button!==0)return;
      release(event.pointerId);pointers.set(event.pointerId,{code,button});button.setPointerCapture?.(event.pointerId);
      if(!held.has(code)){held.set(code,performance.now());send(code,'keydown');}
      button.setAttribute('aria-pressed','true');
      if(!repeating)repeating=setInterval(()=>{for(const [key,start]of held)if(performance.now()-start>300)send(key,'keydown',true);},75);
    });
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,event=>{event.preventDefault();event.stopPropagation();release(event.pointerId);});
    button.addEventListener('contextmenu',event=>event.preventDefault());pad.append(button);
  }
  document.body.append(pad);
  function refresh(){
    const active=root?document.body.classList.contains('mobile-mode')&&!document.body.classList.contains('picker-active'):document.documentElement.classList.contains('zapman-mobile-game');
    const visible=active&&!document.hidden&&!window.ZapmanEducation?.blocked;
    if(!visible)releaseAll();pad.hidden=!visible;
    const host=document.querySelector('dialog[open]:not(#zapman-education)')||document.body;
    if(pad.parentElement!==host)host.append(pad);
    document.documentElement.classList.toggle('zapman-shared-arrows',visible);
  }
  window.addEventListener('blur',releaseAll);window.addEventListener('pagehide',releaseAll);
  window.addEventListener('pointerup',event=>release(event.pointerId));window.addEventListener('pointercancel',event=>release(event.pointerId));
  document.addEventListener('visibilitychange',refresh);
  new MutationObserver(refresh).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','open']});
  window.addEventListener('zapman-education-change',refresh);
  window.ZapmanMobileControls={release:releaseAll,refresh};refresh();
})();
