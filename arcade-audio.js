/* Offline original music and event sounds for the Zapman collection. */
(() => {
  'use strict';
  if(window.ZapmanArcadeAudio)return;
  const profiles={"hide-n-seek":{"title":"Sneaky footsteps","mood":"stealth","bpm":96,"root":48,"native":true,"seed":0},"zapman":{"title":"Across dimensions","mood":"adventure","bpm":112,"root":48,"native":false,"seed":1},"browny-city":{"title":"A day in town","mood":"cozy","bpm":100,"root":48,"native":true,"seed":2},"bye-cycle":{"title":"Pedal to the finish","mood":"race","bpm":138,"root":45,"native":false,"seed":3},"fighters":{"title":"Firestorm","mood":"combat","bpm":140,"root":40,"native":true,"seed":4},"8-bit-alley":{"title":"Imagined worlds","mood":"arcade","bpm":112,"root":48,"native":true,"seed":5,"extraEffects":true},"parkourz":{"title":"Keep moving","mood":"platform","bpm":132,"root":45,"native":true,"seed":6},"bubble-blast":{"title":"Bubbly bounce","mood":"arcade","bpm":124,"root":60,"native":true,"seed":7},"online-arcade":{"title":"Catboozle capers","mood":"arcade","bpm":118,"root":53,"native":false,"seed":8},"cat-rescue":{"title":"Whisker waltz","mood":"cozy","bpm":104,"root":55,"native":true,"seed":9},"cat-rescue/versions/classic":{"title":"Classic whiskers","mood":"cozy","bpm":104,"root":55,"native":true,"seed":10},"cat-rescue/versions/character":{"title":"Rescue adventure","mood":"adventure","bpm":112,"root":53,"native":false,"seed":11},"chis-on-the-loose":{"title":"Curious cat","mood":"cozy","bpm":110,"root":55,"native":true,"seed":12},"dungeon-explorers":{"title":"Torchlight depths","mood":"fantasy","bpm":88,"root":38,"native":false,"seed":13},"forest-bear-runner":{"title":"Woodland dash","mood":"forest","bpm":126,"root":48,"native":true,"seed":14},"flight-master":{"title":"Above the clouds","mood":"flight","bpm":116,"root":50,"native":true,"seed":15},"jump-jump":{"title":"Leap for the sky","mood":"platform","bpm":132,"root":55,"native":true,"seed":16},"kiff-o-kart":{"title":"Kart carnival","mood":"race","bpm":144,"root":48,"native":false,"seed":17},"manhunt":{"title":"Night pursuit","mood":"stealth","bpm":118,"root":38,"native":false,"seed":18},"math-game":{"title":"Thinking time","mood":"puzzle","bpm":82,"root":60,"native":false,"seed":19},"math-jumper":{"title":"Numbers in the sky","mood":"platform","bpm":116,"root":53,"native":false,"seed":20},"minedaft":{"title":"Building horizons","mood":"forest","bpm":84,"root":48,"native":false,"seed":21},"shardbreakers-echoes-of-the-fallen-realm":{"title":"Echoes of the realm","mood":"fantasy","bpm":106,"root":40,"native":false,"seed":22},"silly-billies":{"title":"Laser laughs","mood":"arcade","bpm":132,"root":53,"native":true,"seed":23},"snake-clash":{"title":"Coiling rivals","mood":"arcade","bpm":126,"root":45,"native":false,"seed":24},"smooth-rooftop-jumper":{"title":"Rooftop rhythm","mood":"platform","bpm":136,"root":48,"native":false,"seed":25},"protocol":{"title":"Hidden signal","mood":"stealth","bpm":102,"root":40,"native":false,"seed":26},"speeding-planes":{"title":"Sky battle","mood":"flight","bpm":140,"root":43,"native":false,"seed":27},"subway-surfers":{"title":"Railway rush","mood":"race","bpm":142,"root":48,"native":false,"seed":28},"super-detective-64":{"title":"Case of the missing beat","mood":"stealth","bpm":110,"root":45,"native":false,"seed":29},"super-shuriken":{"title":"Steel petals","mood":"ninja","bpm":132,"root":50,"native":false,"seed":30,"nativeEffects":true},"timmys-trek":{"title":"Timmy on the trail","mood":"adventure","bpm":120,"root":53,"native":false,"seed":31},"tnt-parkour":{"title":"Fuse runner","mood":"platform","bpm":138,"root":43,"native":false,"seed":32},"turbo-lane":{"title":"Monster motorway","mood":"race","bpm":146,"root":40,"native":false,"seed":33}};
  const relative=location.pathname.replace(/\\/g,'/').match(/\/games\/(.+)\/index\.html$/)?.[1]||'hide-n-seek';
  const profile=profiles[relative]||profiles['online-arcade'];
  const patterns={cozy:[0,4,7,9,7,4,2,0,4,7,11,9,7,4,2,null],arcade:[0,7,4,12,9,7,4,2,0,4,7,12,11,7,2,4],platform:[0,4,7,12,7,9,4,7,2,5,9,12,11,7,4,2],race:[0,7,12,7,3,10,15,10,5,12,17,12,7,14,10,7],stealth:[0,null,3,7,null,5,3,null,0,7,10,null,7,5,3,null],fantasy:[0,3,7,null,10,7,5,3,5,8,12,null,10,7,3,null],forest:[0,null,4,7,9,null,7,4,2,null,5,9,7,null,4,2],flight:[0,7,12,14,12,7,4,7,5,12,17,16,14,12,7,4],ninja:[0,2,7,9,7,2,0,null,2,7,9,14,9,7,2,null],puzzle:[0,null,4,null,7,4,2,null,5,null,9,null,7,4,2,null],adventure:[0,7,12,4,9,7,4,2,5,9,12,16,14,7,4,2],combat:[0,0,7,3,0,10,7,3,5,5,12,8,7,10,3,7]};
  let context,bus,provider=null,previous=null,unlocked=false,enabled=true,leaving=false,wasActive=false,step=0,next=0,theme='',button;
  const voices=new Set(),lastEffect={};
  try{enabled=localStorage.getItem('zapman-arcade-sound')!=='false';}catch{}
  const external=profile.native&&!profile.extraEffects;
  const guard=()=>enabled&&unlocked&&!document.hidden&&!leaving&&!window.ZapmanEducation?.blocked&&!document.body.classList.contains('picker-active');
  function stop(kind){for(const v of [...voices])if(!kind||v.kind===kind){try{v.osc.stop();}catch{}v.osc.disconnect();v.gain.disconnect();voices.delete(v);}}
  function tone(midi,wave,at,duration,volume,kind='effect',end){
    if(!context||context.state!=='running'||!guard()||voices.size>=48)return;
    const osc=context.createOscillator(),gain=context.createGain(),entry={osc,gain,kind};osc.type=wave;osc.frequency.setValueAtTime(440*2**((midi-69)/12),at);if(end)osc.frequency.exponentialRampToValueAtTime(end,at+duration);
    gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(bus);voices.add(entry);osc.onended=()=>{osc.disconnect();gain.disconnect();voices.delete(entry);};osc.start(at);osc.stop(at+duration+.01);
  }
  function effect(name){
    if(external||relative==='8-bit-alley'&&document.querySelector('#musicButton')?.getAttribute('aria-pressed')==='false'||!guard()||!context||context.state!=='running')return;
    const now=context.currentTime;if(now-(lastEffect[name]??-100)<(name==='collect'?.18:.08))return;lastEffect[name]=now;
    const sounds={jump:[[60,.13,'triangle',700]],land:[[40,.07,'sine']],shoot:[[83,.09,'sawtooth',200]],hurt:[[45,.18,'sawtooth',70]],collect:[[76,.09,'sine'],[83,.13,'sine']],win:[[60,.12],[64,.12],[67,.12],[72,.3]],lose:[[55,.14],[50,.14],[43,.3]],start:[[60,.1],[67,.15]],level:[[64,.12],[69,.12],[76,.25]],select:[[72,.045,'sine']],throw:[[65,.12,'triangle',140]],portal:[[60,.13],[67,.13],[79,.25]],splash:[[70,.12,'triangle',110]],engine:[[35,.12,'sawtooth',70]]};
    let offset=0;for(const [note,length,wave='triangle',end]of sounds[name]||sounds.select){tone(note,wave,now+offset,length,.13,'effect',end);offset+=length*.7;}
  }
  function snapshotEffects(now){
    if(!previous||profile.nativeEffects){previous={...now};return;}
    if(now.lost&&!previous.lost)effect('lose');else if(now.won&&!previous.won)effect('win');else if(now.active){
      if(now.health<previous.health)effect('hurt');
      if(now.reward>previous.reward)effect('collect');
      if(now.level>previous.level)effect('level');
      if(now.shots>previous.shots&&!profile.nativeEffects)effect('shoot');
      if(now.throwCount>previous.throwCount)effect('throw');
      if(now.stage!==previous.stage&&now.stage)effect('portal');
      if(now.jump&&!previous.jump&&!profile.nativeEffects)effect('jump');
      if(!now.jump&&previous.jump&&profile.mood==='platform'&&!profile.nativeEffects)effect('land');
    }previous={...now};
  }
  function poll(){
    if(external)return;
    let snap;try{snap=provider?.();}catch{return;}
    if(!snap)return;
    if(guard()&&!snap.paused)snapshotEffects(snap);
    const active=guard()&&snap.active!==false&&!snap.paused&&!snap.lost&&!snap.won;
    if(!active){if(wasActive)stop(snap.lost||snap.won?'music':undefined);wasActive=false;previous={...snap};return;}
    if(!wasActive){next=(context?.currentTime||0)+.04;wasActive=true;}
    if(profile.native||snap.music===false||!context||context.state!=='running')return;
    const mood=snap.mood||profile.mood,current=relative+':'+mood+':'+(snap.stage||'');
    if(theme!==current){stop('music');theme=current;step=0;next=context.currentTime+.04;}
    const pattern=patterns[mood]||patterns.adventure,bpm=profile.bpm+(mood==='combat'?8:0),beat=60/bpm/2,minor=['stealth','fantasy','combat','ninja','race'].includes(mood),chords=minor?[0,0,5,3]:[0,5,7,0];
    while(next<context.currentTime+.15){
      const chord=chords[Math.floor(step/16)%4],note=pattern[(step+profile.seed%4)%pattern.length],wave=['cozy','forest','puzzle'].includes(mood)?'sine':mood==='stealth'?'triangle':'square';
      if(note!==null)tone(profile.root+12+note+chord,wave,next,beat*1.2,wave==='square'?.035:.075,'music');
      if(step%4===0)tone(profile.root-12+chord,'triangle',next,beat*3.2,.095,'music');
      if(step%8===0&&['race','combat','platform','ninja','flight'].includes(mood))tone(35,'sine',next,.09,.08,'music',35);
      step++;next+=beat;
    }
  }
  async function unlock(){if(external)return;unlocked=true;if(!enabled)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!context){context=new C();bus=context.createGain();bus.gain.value=.45;bus.connect(context.destination);}if(context.state==='suspended')await context.resume();poll();}catch{/* A later click can retry audio. */}}
  function label(){if(button){button.textContent=enabled?'Sound: On':'Sound: Off';button.setAttribute('aria-pressed',String(enabled));}}
  function toggle(){enabled=!enabled;try{localStorage.setItem('zapman-arcade-sound',String(enabled));}catch{}label();if(!enabled)stop();else unlock();}
  window.ZapmanArcadeAudio={profiles,game:relative,get enabled(){return enabled;},register(fn){provider=fn;previous=null;poll();},effect,toggle,poll,get voiceCount(){return voices.size;}};
  if(external)return;
  if(!profile.native){const style=document.createElement('style');style.textContent='.zapman-sound-button{position:fixed;right:12px;bottom:12px;z-index:10001;background:#ffdf74;color:#182b32;border:2px solid #263d40;border-radius:7px;padding:8px 11px;font:bold 12px Arial,sans-serif;cursor:pointer}body.picker-active>.zapman-sound-button{display:none}';document.head.append(style);button=document.createElement('button');button.type='button';button.className='zapman-sound-button';button.setAttribute('aria-label','Toggle game music and sound effects');button.addEventListener('click',toggle);document.body.append(button);label();}
  for(const event of ['pointerdown','keydown'])document.addEventListener(event,unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();context?.suspend().catch(()=>{});}else if(unlocked)unlock();});
  window.addEventListener('pagehide',()=>{leaving=true;stop();context?.suspend().catch(()=>{});});window.addEventListener('pageshow',()=>{leaving=false;if(unlocked)unlock();});
  window.setInterval(poll,80);
})();
