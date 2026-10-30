// Accept only arrow keys from the page embedding this arcade.
(() => {
  const arrows=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
  const held=new Set();
  function release(){for(const key of held)window.dispatchEvent(new KeyboardEvent('keyup',{key,code:key,bubbles:true}));held.clear();}
  window.addEventListener('message',event=>{
    const message=event.data;
    if(window.parent===window||event.source!==window.parent||!message||message.type!=='zapman-mobile-key'||!arrows.has(message.code)||!['keydown','keyup'].includes(message.eventType))return;
    if(message.eventType==='keydown')held.add(message.code);else held.delete(message.code);
    window.dispatchEvent(new KeyboardEvent(message.eventType,{key:message.code,code:message.code,bubbles:true,cancelable:true,repeat:message.repeat===true}));
  });
  window.addEventListener('blur',release);window.addEventListener('pagehide',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
})();
