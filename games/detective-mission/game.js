(() => {
  'use strict';
  const {Mission,characters}=window.DetectiveMission;
  const art=window.DetectiveArt;
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  const $=id=>document.querySelector('#'+id);
  let selected=0;try{selected=Math.max(0,Math.min(4,Math.trunc(Number(localStorage.getItem('detective-mission-character')))||0));}catch{}
  const mission=new Mission(selected),keys=new Set(),touch=new Set();
  const motion=window.DetectiveMotion,camera=motion.create(mission.player);
  const pointer={x:W/2,y:H/2,active:false,held:false};
  const images={},cardCanvases=[];
  const poseCanvas=document.createElement('canvas');poseCanvas.width=512;poseCanvas.height=768;
  const poseContext=poseCanvas.getContext('2d');
  let loaded=false,last=performance.now(),dashQueued=false,toastTime=0,displayedState='',damageFlash=0,drawTime=0;

  function clearInput(){keys.clear();touch.clear();pointer.held=false;dashQueued=false;}
  function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(src));image.src=src;});}
  function selectCharacter(index){
    selected=index;mission.character=index;
    try{localStorage.setItem('detective-mission-character',String(index));}catch{}
    for(const [i,button]of Array.from($('characterGrid').children).entries())button.setAttribute('aria-pressed',String(i===index));
    $('selectedName').textContent=characters[index].name.toUpperCase();$('characterDetail').textContent=characters[index].detail;
    if(loaded)$('startButton').textContent=`START AS ${characters[index].name.toUpperCase()} →`;
    window.ZapmanArcadeAudio?.effect('select');
  }
  characters.forEach((character,index)=>{
    const button=document.createElement('button');button.type='button';button.className='character-card';button.setAttribute('aria-pressed',String(selected===index));button.setAttribute('aria-label',`Choose ${character.name}`);
    const id=document.createElement('span');id.className='agent-id';id.textContent=`AGENT / 0${index+1}`;
    const portrait=document.createElement('canvas');portrait.width=220;portrait.height=260;portrait.setAttribute('aria-hidden','true');cardCanvases.push(portrait);
    const name=document.createElement('strong');name.textContent=character.name;
    button.append(id,portrait,name);button.addEventListener('click',()=>selectCharacter(index));$('characterGrid').append(button);
  });
  function showToast(text){$('messageToast').textContent=text;$('messageToast').classList.remove('hidden');toastTime=3.2;}
  function start(){if(!loaded)return;clearInput();mission.character=selected;mission.start();motion.reset(camera,mission.player);displayedState='';last=performance.now();updateHud();syncScreens();canvas.focus({preventScroll:true});}
  function showPicker(){clearInput();mission.reset(selected);motion.reset(camera,mission.player);displayedState='';$('messageToast').classList.add('hidden');toastTime=0;syncScreens();}
  function pause(){clearInput();mission.pause();syncScreens();last=performance.now();}
  function formatTime(seconds){const n=Math.floor(seconds);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
  function syncScreens(){
    const state=mission.state,ready=state==='ready',paused=state==='paused',result=state==='won'||state==='lost';
    document.body.classList.toggle('picker-active',ready);
    $('picker').classList.toggle('hidden',!ready);$('missionHud').classList.toggle('hidden',ready);
    $('gameFooter').classList.toggle('hidden',ready||result);$('touchControls').classList.toggle('hidden',state!=='playing');
    $('pauseScreen').classList.toggle('hidden',!paused);$('resultScreen').classList.toggle('hidden',!result);
    $('pauseButton').textContent=paused?'▶':'Ⅱ';$('pauseButton').setAttribute('aria-label',paused?'Resume mission':'Pause mission');
    if(result&&displayedState!==state){
      clearInput();const won=state==='won';
      $('resultEyebrow').textContent=won?'THREE FILES. ONE CASE CLOSED.':'YOUR SIGNAL WENT QUIET';
      $('resultTitle').textContent=won?'MISSION COMPLETE':'MISSION FAILED';
      $('resultText').textContent=won?`${characters[selected].name} recovered the stolen signal and secured every case file. The meadow is safe again.`:'The big guards overwhelmed your detective. Watch their purple hands, then move sideways or dash before the zap arrives.';
      $('resultStats').textContent=`${mission.files}/3 FILES · ${mission.score} POINTS · ${formatTime(mission.time)}`;
      $('retryButton').textContent=won?'PLAY AGAIN →':'RETRY MISSION →';
      if(won)try{const best=Number(localStorage.getItem('detective-mission-best'))||0;localStorage.setItem('detective-mission-best',String(Math.max(best,mission.score)));}catch{}
      $('retryButton').focus({preventScroll:true});
    }
    displayedState=state;
  }
  function updateHud(){
    $('agentName').textContent=characters[selected].name;
    $('healthFill').style.width=mission.player.health+'%';$('healthFill').style.background=mission.player.health<30?'#ff8679':'#aef28a';
    $('healthBar').setAttribute('aria-valuenow',String(mission.player.health));$('healthNumber').textContent=mission.player.health+'% HEALTH';
    const remaining=mission.guards.filter(g=>g.alive).length;
    $('guardCount').textContent=`${remaining} ${remaining===1?'GUARD':'GUARDS'} · WAVE ${mission.wave}/3`;
    $('objective').textContent=mission.clue?'Collect the glowing case file':`Recover file ${Math.min(3,mission.files+1)} of 3`;
    Array.from($('fileProgress').children).forEach((dot,i)=>dot.classList.toggle('found',i<mission.files));
    $('fileProgress').setAttribute('aria-label',`${mission.files} of 3 case files recovered`);
    $('dashStatus').textContent=mission.player.dashCooldown>0?`DASH · ${mission.player.dashCooldown.toFixed(1)}s`:'SHIFT · DASH READY';
  }
  function project(x,z,height=0){
    const depth=z-camera.z+5.8;if(depth<=1.25)return null;
    const scale=690/depth;
    return {x:W/2+(x-camera.x)*scale,y:motion.horizon(camera,H)+(3.25-height)*scale,scale,depth};
  }
  function sprite(context,image,rect,x,y,height,alpha=1){
    context.save();context.globalAlpha=alpha;
    context.drawImage(image,...rect,x-height*rect[2]/rect[3]/2,y-height,height*rect[2]/rect[3],height);
    context.restore();
  }
  function glow(x,y,radius,color){
    const gradient=ctx.createRadialGradient(x,y,0,x,y,radius);gradient.addColorStop(0,color);gradient.addColorStop(1,color.slice(0,7)+'00');
    ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
  }
  function shadow(point,size,alpha=.3){ctx.save();ctx.fillStyle=`rgba(4,24,13,${alpha})`;ctx.beginPath();ctx.ellipse(point.x,point.y+2,size,size*.2,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  function bolt(x1,y1,x2,y2,color,width,seed=0){
    ctx.save();ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=14;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';
    const len=Math.hypot(x2-x1,y2-y1),segments=Math.max(5,Math.min(24,Math.ceil(len/22)));
    ctx.beginPath();ctx.moveTo(x1,y1);
    for(let i=1;i<segments;i++){
      const t=i/segments,jitter=Math.sin(i*2.39+seed+drawTime*48)*11*Math.sin(t*Math.PI);
      ctx.lineTo(x1+(x2-x1)*t-(y2-y1)/(len||1)*jitter,y1+(y2-y1)*t+(x2-x1)/(len||1)*jitter);
    }
    ctx.lineTo(x2,y2);ctx.stroke();ctx.shadowBlur=4;ctx.strokeStyle='#efffff';ctx.lineWidth=width*.28;ctx.stroke();ctx.restore();
  }
  function drawGuard(guard){
    const point=project(guard.x,guard.z);if(!point||point.x<-180||point.x>W+180)return;
    const height=guard.height*point.scale;
    if(!guard.alive&&guard.down===0)return;
    const opacity=guard.alive?1:guard.down/.65;
    shadow(point,height*.26,.27*opacity);
    if(guard.charge>0){
      ctx.save();ctx.strokeStyle='#e08cff';ctx.lineWidth=2;ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(point.x,point.y,height*.42,height*.1,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    ctx.save();if(guard.hit>0)ctx.filter='brightness(1.7)';
    sprite(ctx,images.guards,art.guards[guard.charge>0?1:0][guard.kind],point.x,point.y+Math.sin(drawTime*4+guard.phase)*1.5,height,opacity);ctx.restore();
    if(guard.alive){
      const barWidth=Math.max(35,height*.5);ctx.fillStyle='#08221dcc';ctx.fillRect(point.x-barWidth/2,point.y-height-14,barWidth,4);
      ctx.fillStyle=guard.kind===2?'#e19fff':'#ffc974';ctx.fillRect(point.x-barWidth/2,point.y-height-14,barWidth*guard.hp/guard.maxHp,4);
      if(guard.charge>0){
        for(const side of [-1,1])glow(point.x+side*height*.2,point.y-height*.8,Math.max(12,height*.17),'#d18affbb');
        ctx.fillStyle='#fff0ff';ctx.font=`800 ${Math.max(10,Math.min(13,height*.1))}px Segoe UI`;ctx.textAlign='center';ctx.fillText('CHARGING',point.x,point.y-height-20);
      }
    }
  }
  function drawClue(){
    if(!mission.clue)return;const p=project(mission.clue.x,mission.clue.z);if(!p)return;
    const width=Math.min(108,p.scale*1.45),height=width*art.caseFile[3]/art.caseFile[2];
    const hover=6+Math.sin(drawTime*2)*2;
    glow(p.x,p.y-height*.4,width*1.1,'#ffe6a344');shadow(p,width*.4,.22);
    sprite(ctx,images.caseFile,art.caseFile,p.x,p.y-hover,height);
    ctx.fillStyle='#fff2b4';ctx.textAlign='center';ctx.font='800 13px Segoe UI';ctx.fillText('CASE FILE · WALK TO COLLECT',p.x,p.y-hover-height-15);
  }
  function composeHero(){
    const pc=poseContext,h=720,base=756,center=256;
    const walk=Math.max(0,Math.min(1,camera.walking)),casting=Math.max(0,Math.min(1,camera.casting));
    const frames=motion.walkingFrames(mission.player);
    pc.clearRect(0,0,512,768);pc.save();pc.globalCompositeOperation='lighter';
    const locomotion=1-casting;
    sprite(pc,images.heroes,art.heroes[0][selected],center,base,h,(1-walk)*locomotion);
    sprite(pc,images.walkCycles[selected],art.cycles[selected][frames.a],center,base,h,walk*(1-frames.mix)*locomotion);
    sprite(pc,images.walkCycles[selected],art.cycles[selected][frames.b],center,base,h,walk*frames.mix*locomotion);
    sprite(pc,images.heroes,art.heroes[1][selected],center,base,h,casting);
    pc.restore();
  }
  function drawHero(){
    const point=project(mission.player.x,mission.player.z),height=point.scale*2.22;
    const bob=Math.sin(mission.player.step*3.5)*.6*camera.walking;
    shadow(point,height*.26,.25);composeHero();
    const scale=height/720,alpha=mission.player.invulnerable>0?.7+.3*Math.sin(drawTime*35):1;
    ctx.save();ctx.translate(point.x,point.y);ctx.rotate(Math.max(-.018,Math.min(.018,mission.player.moveX*.002)));
    ctx.globalAlpha=alpha;ctx.drawImage(poseCanvas,-256*scale,-756*scale-bob,512*scale,768*scale);ctx.restore();
    if(mission.player.dashTime>0)glow(point.x,point.y-height*.3,height*.5,'#9bfff333');
  }
  function drawZaps(){
    const playerPoint=project(mission.player.x,mission.player.z),height=playerPoint.scale*2.22;
    for(const zap of mission.zaps){
      const target=project(zap.x,zap.z,zap.height);if(!target)continue;
      const handsWidth=height*art.heroes[1][selected][2]/art.heroes[1][selected][3]*.39;
      for(const side of [-1,1]){
        const x=playerPoint.x+side*handsWidth,y=playerPoint.y-height*.81;
        glow(x,y,22,'#a4fbffcc');bolt(x,y,target.x,target.y,'#73efff',4,zap.seed+side);
      }
    }
    for(const shot of mission.projectiles){
      const head=project(shot.x,shot.z,shot.height),tail=project(shot.x-shot.vx*.17,shot.z-shot.vz*.17,shot.height);
      if(!head||!tail)continue;
      bolt(tail.x,tail.y,head.x,head.y,'#ce79ff',Math.max(2,Math.min(6,head.scale*.065)),shot.life);
      glow(head.x,head.y,Math.max(8,Math.min(25,head.scale*.25)),'#e3a3ffbb');
    }
    for(const spark of mission.sparks){
      const point=project(spark.x,spark.z,spark.height);if(!point)continue;
      ctx.save();ctx.globalAlpha=spark.life/spark.max;ctx.strokeStyle=spark.kind==='hurt'?'#ffb794':'#bdf9ff';ctx.lineWidth=2;
      for(let i=0;i<9;i++){const angle=i*Math.PI*2/9,radius=(1-spark.life/spark.max)*45;ctx.beginPath();ctx.moveTo(point.x+Math.cos(angle)*radius,point.y+Math.sin(angle)*radius);ctx.lineTo(point.x+Math.cos(angle)*(radius+9),point.y+Math.sin(angle)*(radius+9));ctx.stroke();}
      ctx.restore();
    }
  }
  function render(){
    ctx.clearRect(0,0,W,H);
    if(images.field){
      const frame=motion.background(camera,W,H,images.field.width,images.field.height);
      ctx.drawImage(images.field,frame.x,frame.y,frame.width,frame.height);
    }else{ctx.fillStyle='#153c2b';ctx.fillRect(0,0,W,H);}
    if(!loaded)return;
    if(mission.state==='ready'){
      const rect=art.heroes[0][selected];shadow({x:W*.8,y:H*.53},80,.2);sprite(ctx,images.heroes,rect,W*.8,H*.53,H*.44);return;
    }
    drawClue();
    const objects=mission.guards.map(g=>({z:g.z,type:'guard',object:g}));objects.push({z:mission.player.z,type:'hero'});
    objects.sort((a,b)=>b.z-a.z);
    for(const object of objects)if(object.type==='hero')drawHero();else drawGuard(object.object);
    drawZaps();
    if(mission.state==='playing'&&pointer.active){ctx.save();ctx.strokeStyle='#ecfff8aa';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(pointer.x,pointer.y,10,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(pointer.x-15,pointer.y);ctx.lineTo(pointer.x-7,pointer.y);ctx.moveTo(pointer.x+7,pointer.y);ctx.lineTo(pointer.x+15,pointer.y);ctx.stroke();ctx.restore();}
    if(damageFlash>0){ctx.fillStyle=`rgba(185,42,49,${damageFlash*.5})`;ctx.fillRect(0,0,W,H);}
  }
  function aimedGuard(){
    if(!pointer.active)return undefined;
    let best=null,distance=120;
    for(const guard of mission.guards){if(!guard.alive)continue;const p=project(guard.x,guard.z,guard.height*.6);if(!p)continue;const d=Math.hypot(p.x-pointer.x,p.y-pointer.y);if(d<distance){distance=d;best=guard;}}
    return best?.id;
  }
  function simulate(dt){
    drawTime+=dt;
    if(mission.state==='playing'){
      mission.update(dt,{left:keys.has('KeyA')||keys.has('ArrowLeft')||touch.has('left'),right:keys.has('KeyD')||keys.has('ArrowRight')||touch.has('right'),
        forward:keys.has('KeyW')||keys.has('ArrowUp')||touch.has('forward'),backward:keys.has('KeyS')||keys.has('ArrowDown')||touch.has('backward'),
        fire:keys.has('Space')||pointer.held||touch.has('fire'),dash:dashQueued,targetId:aimedGuard()});dashQueued=false;
      motion.update(camera,mission.player,dt);
      for(const event of mission.drainEvents()){
        const audio=window.ZapmanArcadeAudio;
        if(event.type==='fire')audio?.effect('shoot');
        if(event.type==='dash')audio?.effect('jump');
        if(event.type==='hurt'){damageFlash=.18;audio?.effect('hurt');}
        if(event.type==='wave')showToast(`WAVE ${event.wave} · The big guards are guarding a case file`);
        if(event.type==='clueReady')showToast('Guards cleared! Walk to the glowing case file.');
        if(event.type==='collect'){audio?.effect('collect');showToast(`CASE FILE ${event.files}/3 RECOVERED · +20 HEALTH`);}
      }
      updateHud();if(mission.state!==displayedState)syncScreens();
      toastTime=Math.max(0,toastTime-dt);if(toastTime===0)$('messageToast').classList.add('hidden');
    }
    damageFlash=Math.max(0,damageFlash-dt);
  }
  function step(dt){
    let remaining=Math.min(.1,Math.max(0,dt));
    while(remaining>1e-7){const slice=Math.min(1/120,remaining);simulate(slice);remaining-=slice;}
    render();
  }
  function frame(now){const dt=Math.min(.1,Math.max(0,(now-last)/1000));last=now;step(dt);requestAnimationFrame(frame);}
  function canvasPointer(event){const r=canvas.getBoundingClientRect(),scale=Math.max(r.width/W,r.height/H);pointer.x=(event.clientX-r.left+(W*scale-r.width)/2)/scale;pointer.y=(event.clientY-r.top+(H*scale-r.height)/2)/scale;pointer.active=true;}
  canvas.addEventListener('pointermove',canvasPointer);
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0||mission.state!=='playing')return;event.preventDefault();canvasPointer(event);pointer.held=true;mission.fire(aimedGuard());canvas.setPointerCapture?.(event.pointerId);canvas.focus({preventScroll:true});});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{pointer.held=false;});
  canvas.addEventListener('pointerleave',()=>{if(!pointer.held)pointer.active=false;});
  window.addEventListener('pointerup',()=>{pointer.held=false;});
  window.addEventListener('keydown',event=>{
    if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.code)&&mission.state==='playing')event.preventDefault();
    if((event.code==='KeyP'||event.code==='Escape')&&!event.repeat){pause();return;}
    if(mission.state!=='playing')return;
    keys.add(event.code);if(event.code==='Space'&&!event.repeat)mission.fire(aimedGuard());if((event.code==='ShiftLeft'||event.code==='ShiftRight')&&!event.repeat)dashQueued=true;
  });
  window.addEventListener('keyup',event=>keys.delete(event.code));
  window.addEventListener('blur',()=>{clearInput();if(mission.state==='playing')pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(mission.state==='playing')pause();}});
  for(const button of document.querySelectorAll('[data-move]')){
    const action=button.dataset.move;
    button.addEventListener('pointerdown',event=>{event.preventDefault();touch.add(action);button.setPointerCapture?.(event.pointerId);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>touch.delete(action));
  }
  $('touchZap').addEventListener('pointerdown',event=>{event.preventDefault();touch.add('fire');mission.fire();$('touchZap').setPointerCapture?.(event.pointerId);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])$('touchZap').addEventListener(type,()=>touch.delete('fire'));
  $('touchDash').addEventListener('pointerdown',event=>{event.preventDefault();dashQueued=true;});
  $('startButton').addEventListener('click',start);$('retryButton').addEventListener('click',start);
  $('menuButton').addEventListener('click',showPicker);$('chooseButton').addEventListener('click',showPicker);
  $('pauseButton').addEventListener('click',pause);$('resumeButton').addEventListener('click',pause);
  $('reloadButton').addEventListener('click',()=>location.reload());
  window.ZapmanArcadeAudio?.register(()=>({active:mission.state==='playing',paused:mission.state==='paused',lost:mission.state==='lost',won:mission.state==='won',health:mission.player.health,reward:mission.score,level:mission.wave,mood:mission.clue?'stealth':'combat'}));
  window.ZapmanEducation?.register({lost:()=>mission.state==='lost',restore:start,release:clearInput});
  window.__detectiveMissionDebug=()=>({state:mission.state,character:characters[selected].name,files:mission.files,wave:mission.wave,health:mission.player.health,guards:mission.guards.filter(g=>g.alive).length,loaded});
  selectCharacter(selected);syncScreens();
  const cycleFiles=characters.map(character=>'assets/walk-'+character.name.toLowerCase()+'.png');
  Promise.all([loadImage('assets/detectives.png'),loadImage('assets/guards.png'),loadImage('assets/meadow.png'),loadImage('assets/case-file.png'),...cycleFiles.map(loadImage)]).then(([heroes,guards,field,caseFile,...walkCycles])=>{
    Object.assign(images,{heroes,guards,field,caseFile,walkCycles});loaded=true;
    cardCanvases.forEach((portrait,i)=>{const pc=portrait.getContext('2d');sprite(pc,heroes,art.heroes[0][i],portrait.width/2,portrait.height-10,portrait.height-22);});
    $('startButton').disabled=false;selectCharacter(selected);render();
  }).catch(()=>{$('startButton').textContent='ARTWORK UNAVAILABLE';$('loadError').classList.remove('hidden');});
  requestAnimationFrame(frame);
})();
