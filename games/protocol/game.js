const canvas = document.querySelector("#game"), ctx = canvas.getContext("2d");
const title = document.querySelector("#titleScreen"), mapEl = document.querySelector("#map"), hud = document.querySelector("#hud");
const missionEl = document.querySelector("#mission"), objectiveEl = document.querySelector("#objective"), healthEl = document.querySelector("#health");
const keys = {}, stars = [];
const completedProtocols = new Set();
let scene = "title", time = 0, portal = 0, portalTrip = 0, transition = 0, enemies = [], projectiles = [], lasers = [], platforms = [], waves = [], missionTime = 0, waveNo = 0, spawnTimer = 0, laserCooldown = 0;
const player = {x:160,y:560,w:32,h:54,vx:0,vy:0,onGround:false,crouch:false,health:3,attack:0,dir:1};
const boat = {x:130,y:478,vx:0,tilt:0,tip:0};

function resetPlayer(x=140,y=560){ Object.assign(player,{x,y,vx:0,vy:0,health:3,attack:0}); updateHealth(); }
function setScene(next){
  scene=next; missionTime=0; enemies=[]; projectiles=[]; lasers=[]; platforms=[]; waves=[]; waveNo=0; spawnTimer=0; transition=28; mapEl.classList.add("hidden");
  if(next==="meadow"){portal=0;portalTrip=0;}
  const names={meadow:"SUNNY MEADOW",battle:"PORTAL BATTLEFIELD",hub:"THE HUB",water:"WATER CROSSING",waterHard:"STORM CROSSING",guards:"GUARD FIELDS",parkour:"SHADOW PARKOUR",parkourHard:"NIGHT PROTOCOL"};
  missionEl.textContent=names[next]||"PROTOCOL";
  if(next==="hub"){resetPlayer(590,560); updateMapButtons(); objectiveEl.textContent="Press SPACE to open the star map";}
  if(next==="battle"){resetPlayer(150,566);player.health=5;updateHealth();waveNo=1;spawnTimer=35;objectiveEl.textContent="Wave 1: Cyber Drones • X to strike";}
  if(next==="water"||next==="waterHard"){resetPlayer(130,430); boat.x=130;boat.y=485;boat.vx=0;boat.tilt=0; objectiveEl.textContent="Board the boat • tap X to row";}
  if(next==="guards"){resetPlayer(150,560);objectiveEl.textContent="Wave 1 of 5 • X to attack";waveNo=1;}
  if(next==="parkour"||next==="parkourHard"){resetPlayer(80,570); objectiveEl.textContent=next==="parkourHard"?"Power boost active • run faster and jump higher":"Reach the portal at the summit"; buildParkour(next==="parkourHard");}
}
function updateHealth(){ healthEl.textContent="♥ ".repeat(Math.max(0,player.health)).trim(); }
function die(reason="Protocol failed"){
  objectiveEl.textContent=reason+" • restarting";
  setTimeout(()=>setScene(scene),650);
}
function updateMapButtons(){
  document.querySelectorAll("[data-mission]").forEach(b=>{
    const id=b.dataset.mission;
    b.classList.toggle("completed",completedProtocols.has(id));
    const locked=id==="parkourHard"&&!["water","guards","parkour","waterHard"].every(p=>completedProtocols.has(p));
    b.disabled=locked;b.classList.toggle("locked",locked);
  });
}
function completeProtocol(id,message){completedProtocols.add(id);setScene("hub");objectiveEl.textContent=message+" • SPACE for map";}
function openMap(){ if(scene==="hub"){updateMapButtons();mapEl.classList.toggle("hidden");} }
document.querySelector("#playButton").onclick=()=>{title.classList.add("hidden");hud.classList.remove("hidden");setScene("meadow")};
document.querySelector("#closeMap").onclick=()=>mapEl.classList.add("hidden");
document.querySelectorAll("[data-mission]").forEach(b=>b.onclick=()=>{if(!b.disabled)setScene(b.dataset.mission);});
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))e.preventDefault();if(e.key===" "&&!e.repeat)openMap();});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

function physics(ground=620){
  const left=Number(Boolean(keys.a||keys.arrowleft)),right=Number(Boolean(keys.d||keys.arrowright)),down=Boolean(keys.s||keys.arrowdown);
  player.crouch=!!down;
  const finalBoost=scene==="parkourHard";
  const speed=player.crouch?2.1:(keys.shift?(finalBoost?9:6):(finalBoost?5.5:4));
  player.vx+=(right-left)*.7; player.vx*=.78; player.vx=Math.max(-speed,Math.min(speed,player.vx)); if(player.vx)player.dir=Math.sign(player.vx);
  if((keys.w||keys.arrowup)&&player.onGround){player.vy=finalBoost?-16:-12;player.onGround=false;}
  player.vy+=.65; player.x+=player.vx; player.y+=player.vy; player.x=Math.max(10,Math.min(1238,player.x));
  player.onGround=false;
  const ph=player.crouch?34:54, oldBottom=player.y+ph-player.vy, bottom=player.y+ph;
  if(bottom>=ground){player.y=ground-ph;player.vy=0;player.onGround=true;}
  for(const p of platforms) if(player.vy>=0&&player.x+player.w>p.x&&player.x<p.x+p.w&&oldBottom<=p.y&&bottom>=p.y){player.y=p.y-ph;player.vy=0;player.onGround=true;}
  player.h=ph;
  if(player.y>750)die("You fell");
}
function fireLaser(){
  if(laserCooldown>0||scene==="title")return;
  laserCooldown=14;
  lasers.push({x:player.x+player.w/2+player.dir*34,y:player.y+24,vx:player.dir*13,life:55,dir:player.dir});
}
function updateLasers(){
  if(laserCooldown>0)laserCooldown--;
  if(keys["1"]||keys.digit1)fireLaser();
  for(const l of lasers){
    l.x+=l.vx;l.life--;
    for(const e of enemies){
      if(e.hp>0&&Math.abs(l.x-e.x)<92&&Math.abs(l.y-e.y)<92){
        e.hp--;e.hit=12;l.life=0;
        e.x+=Math.sign(l.vx)*24;
        break;
      }
    }
  }
  lasers=lasers.filter(l=>l.life>0&&l.x>-40&&l.x<1320);
}
function update(){
  time++;missionTime++; if(transition>0)transition--;
  if(scene==="meadow"){
    if(!portalTrip)physics();
    if(!portalTrip&&player.x+player.w>604&&player.x<624&&player.y+player.h>505){
      portalTrip=1;player.vx=0;player.vy=0;objectiveEl.textContent="Bibble babble activated! Portal jump engaged";
    }
    if(portalTrip){
      portal=Math.min(1,portal+.045);
      player.x+=(930-player.x)*.055;
      player.y+=(500-player.y)*.04;
      if(portal>=1&&player.x>875)setScene("battle");
    }
  } else if(scene==="battle") updateBattle();
  else if(scene==="hub") physics();
  else if(scene==="water"||scene==="waterHard") updateWater(scene==="waterHard");
  else if(scene==="guards") updateGuards();
  else if(scene==="parkour"||scene==="parkourHard") updateParkour();
  updateLasers();
}
const battleTypes=["drone","hacker","brute","wraith","sniper"];
const battleNames=["Cyber Drones","Shadow Hackers","Mech Brutes","Portal Wraiths","Neon Snipers"];
function spawnBattleWave(){
  const type=battleTypes[waveNo-1],count=type==="brute"?2:type==="sniper"?3:3+waveNo;
  platforms=type==="sniper"?[{x:430,y:420,w:150},{x:760,y:330,w:150},{x:1030,y:440,w:150}]:[];
  for(let i=0;i<count;i++){
    const flying=type==="drone"||type==="wraith"||type==="sniper";
    const flyingY=type==="drone"?470+(i%2)*42:350+(i%3)*65;
    enemies.push({type,x:type==="sniper"?platforms[i].x+55:820+i*85,y:type==="sniper"?platforms[i].y-42:flying?flyingY:566,hp:type==="brute"?6:type==="sniper"?3:2+Math.floor(waveNo/3),vx:type==="drone"?-2.4:-.8,hit:0,cool:40+i*17,baseY:flying?flyingY:566});
  }
}
function hurtBattle(){
  player.health--;updateHealth();player.x=Math.max(20,player.x-45);if(player.health<=0)die("The battlefield overwhelmed you");
}
function updateBattle(){
  physics();if(keys.x&&player.attack<=0)player.attack=18;if(player.attack>0)player.attack--;
  if(spawnTimer>0)spawnTimer--;if(spawnTimer===0&&enemies.length===0){spawnBattleWave();spawnTimer=-1;}
  for(const e of enemies){
    e.hit=Math.max(0,e.hit-1);e.cool--;
    if(e.type==="drone"){e.x+=e.vx;e.y=e.baseY+Math.sin(time*.09+e.x)*28;if(e.x<420)e.vx=Math.abs(e.vx);if(e.x>1180)e.vx=-Math.abs(e.vx);}
    if(e.type==="hacker"){e.x+=Math.sign(player.x-e.x)*1.35;if(time%9===0)e.x+=(Math.random()-.5)*34;}
    if(e.type==="brute")e.x+=Math.sign(player.x-e.x)*.55;
    if(e.type==="wraith"){e.x+=Math.sign(player.x-e.x)*1.05;e.y=e.baseY+Math.sin(time*.06+e.x)*55;}
    if(e.type==="sniper"&&e.cool<=0){const dx=player.x-e.x,dy=player.y-e.y,len=Math.hypot(dx,dy)||1;projectiles.push({x:e.x,y:e.y+15,vx:dx/len*7,vy:dy/len*7,life:150,color:"#ff2b88"});e.cool=85;}
    if((e.type==="drone"||e.type==="wraith")&&e.cool<=0){projectiles.push({x:e.x,y:e.y,vx:-5,vy:Math.sin(time*.05),life:130,color:"#32eaff"});e.cool=70;}
    if(Math.abs(e.x-player.x)<62&&Math.abs(e.y-player.y)<70&&player.attack>7&&e.hit===0){e.hp--;e.hit=12;e.x+=player.dir*32;}
    if(Math.abs(e.x-player.x)<28&&Math.abs(e.y-player.y)<55&&e.hit===0){e.hit=55;hurtBattle();}
  }
  for(const p of projectiles){p.x+=p.vx;p.y+=p.vy;p.life--;if(Math.abs(p.x-player.x)<22&&Math.abs(p.y-player.y)<38){p.life=0;hurtBattle();}}
  projectiles=projectiles.filter(p=>p.life>0&&p.x>-20&&p.x<1300&&p.y>-20&&p.y<730);
  enemies=enemies.filter(e=>e.hp>0);
  if(enemies.length===0&&spawnTimer<0){waveNo++;projectiles=[];if(waveNo>5){setScene("hub");objectiveEl.textContent="Battlefield cleared • SPACE for map";}else{spawnTimer=95;objectiveEl.textContent=`Incoming: ${battleNames[waveNo-1]}`;}}
  if(waveNo<=5&&enemies.length)objectiveEl.textContent=`Wave ${waveNo}/5: ${battleNames[waveNo-1]} • ${enemies.length} remain`;
}
function updateWater(hard){
  const strength=Math.min(hard?4.5:3.4,.7+missionTime/700), row=keys.x;
  if(row&&time%7===0)boat.vx+=hard?.12:.15; boat.vx*=.992; boat.x+=boat.vx;
  const wave=Math.sin(time*.045+boat.x*.01)*strength;boat.y=487+wave*7;boat.tilt=wave*.07+Math.sin(time*.021)*strength*.035;
  if(Math.abs(boat.tilt)>.32)boat.tip++;else boat.tip=Math.max(0,boat.tip-2);
  player.x=boat.x+42;player.y=boat.y-55; objectiveEl.textContent=`Row with X • waves ${Math.round(strength*28)}% • ${Math.round(boat.x/10)}m`;
  if(boat.tip>65)die("The boat tipped over");
  if(boat.x>1090){const finished=scene;completeProtocol(finished,finished==="waterHard"?"Storm Crossing complete":"Water Protocol complete");}
}
function updateGuards(){
  physics(); if(keys.x&&player.attack<=0)player.attack=18;if(player.attack>0)player.attack--;
  spawnTimer--; if(spawnTimer<=0&&waveNo<=5){ const count=waveNo+1;if(enemies.length===0){for(let i=0;i<count;i++)enemies.push({x:1100+i*70,y:570,hp:2,vx:-1-waveNo*.12,hit:0});spawnTimer=999;}}
  for(const e of enemies){e.x+=e.vx;e.hit=Math.max(0,e.hit-1);if(Math.abs(e.x-player.x)<58&&player.attack>7&&e.hit===0){e.hp--;e.hit=12;e.x+=player.dir*28;}if(Math.abs(e.x-player.x)<28&&e.hit===0){player.health--;e.hit=45;player.x-=player.dir*35;updateHealth();if(player.health<=0)die("The guards won");}}
  enemies=enemies.filter(e=>e.hp>0&&e.x>-50);
  if(enemies.length===0&&spawnTimer>100){waveNo++;spawnTimer=90;if(waveNo>5)completeProtocol("guards","Five guard waves defeated");}
  objectiveEl.textContent=waveNo<=5?`Wave ${waveNo} of 5 • ${enemies.length} guards remain`:"Field cleared!";
}
function buildParkour(hard){
  const gap=hard?150:120;
  platforms=[{x:0,y:635,w:220},{x:270,y:565,w:130},{x:470,y:485,w:140},{x:680,y:410,w:120},{x:860,y:330,w:150},{x:1060,y:245,w:180}];
  if(hard)platforms=platforms.map((p,i)=>i===0?p:{...p,y:p.y+65});
  enemies=platforms.slice(2).map((p,i)=>({x:p.x+p.w/2,y:p.y-46,hp:2,vx:(i%2?1:-1)*(hard?1.5:1),min:p.x,max:p.x+p.w-28,hit:0}));
}
function updateParkour(){
  physics(635);if(keys.x&&player.attack<=0)player.attack=18;if(player.attack>0)player.attack--;
  for(const e of enemies){e.x+=e.vx;if(e.x<e.min||e.x>e.max)e.vx*=-1;e.hit=Math.max(0,e.hit-1);if(Math.abs(e.x-player.x)<50&&Math.abs(e.y-player.y)<55&&player.attack>7){e.hp--;e.hit=12;}else if(Math.abs(e.x-player.x)<25&&Math.abs(e.y-player.y)<48&&e.hit===0){player.health--;e.hit=45;updateHealth();if(player.health<=0)die("A shadow guard caught you");}}
  enemies=enemies.filter(e=>e.hp>0);if(player.x>1120&&player.y<(scene==="parkourHard"?360:270)){const finished=scene;completeProtocol(finished,finished==="parkourHard"?"Night Protocol complete":"Shadow Parkour complete");}
}

function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function glowRect(x,y,w,h,c,blur=18){ctx.save();ctx.shadowColor=c;ctx.shadowBlur=blur;rect(x,y,w,h,c);ctx.restore();}
function drawStars(){
  for(let i=0;i<80;i++){const x=(i*193)%1280,y=(i*83)%390,s=i%11===0?3:1;glowRect(x,y,s,s,i%7===0?"#ff74ed":"#d9f7ff",i%11===0?12:4);}
}
function skyline(base=530){
  for(let i=0;i<22;i++){const x=i*63-20,h=70+(i*47)%190;rect(x,base-h,58,h,i%3===0?"#11184b":"#0a1235");for(let r=0;r<4;r++)for(let c=0;c<2;c++)if((r+c+i)%3!==0)glowRect(x+10+c*25,base-h+18+r*30,8,11,(i+r)%2?"#15eaff":"#ff2bd6",8);}
}
function castle(bg=false){
  const y=bg?215:155;ctx.fillStyle="#071638";ctx.beginPath();ctx.moveTo(300,620);ctx.lineTo(300,y+120);ctx.lineTo(390,y+120);ctx.lineTo(390,y);ctx.lineTo(435,y-55);ctx.lineTo(480,y);ctx.lineTo(480,y+120);ctx.lineTo(565,y+120);ctx.lineTo(565,y-90);ctx.lineTo(640,y-165);ctx.lineTo(715,y-90);ctx.lineTo(715,y+120);ctx.lineTo(800,y+120);ctx.lineTo(800,y);ctx.lineTo(845,y-55);ctx.lineTo(890,y);ctx.lineTo(890,y+120);ctx.lineTo(980,y+120);ctx.lineTo(980,620);ctx.closePath();ctx.fill();
  for(let x=405;x<900;x+=105){glowRect(x,y+145,24,62,"#25efff",20);}
  glowRect(305,y+112,670,7,"#ff2bd6",20);glowRect(565,y-94,150,8,"#28efff",24);
}
function drawPlayer(){
  ctx.save();ctx.translate(player.x+16,player.y);ctx.scale(player.dir,1);rect(-14,12,28,player.h-12,"#091431");for(let y=18;y<player.h-10;y+=9)rect(-11,y,22,3,"#20c8ff");rect(-12,0,24,22,"#d98e63");rect(-15,-4,30,10,"#07142c");glowRect(-11,player.h-14,9,14,"#22dcff",9);glowRect(3,player.h-14,9,14,"#22dcff",9);glowRect(8,23,18,6,"#25efff",12);if(player.attack>0)glowRect(10,25,38,7,"#f55cff",18);ctx.restore();
}
function background(top,bottom){const g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,top);g.addColorStop(1,bottom);ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);}
function neonGround(y=620,grass=false){
  rect(0,y,1280,720-y,grass?"#102a25":"#07122d");glowRect(0,y,1280,5,grass?"#b8ff26":"#23e9ff",18);
  for(let x=0;x<1280;x+=48){if(grass){rect(x,y-8-(x%5)*3,4,12+(x%5)*3,x%3?"#8fff25":"#20efaa");}else{ctx.strokeStyle="#184d82";ctx.strokeRect(x,y+18,40,35);}}
}
function drinkStand(){
  rect(500,430,260,175,"#10102f");glowRect(500,430,260,8,"#ff2bd6",25);glowRect(510,470,240,55,"#2a0b39",12);
  glowRect(525,447,210,7,"#ff43ea",15);ctx.fillStyle="#fff";ctx.font="bold 21px sans-serif";ctx.textAlign="center";ctx.fillText("DRINK BIBBLE BABBLE",630,474);ctx.textAlign="left";
  for(let i=0;i<7;i++){glowRect(530+i*30,512-(i%2)*10,14,35+(i%2)*10,i%2?"#21ecff":"#ff3fcf",12);}
  rect(490,525,280,16,"#090b29");glowRect(500,541,260,7,"#ff2bd6",20);
}
function drawBattleEnemies(){
  for(const e of enemies){
    if(e.type==="drone"){ctx.save();ctx.translate(e.x,e.y);glowRect(-18,-18,36,36,"#ff315f",22);glowRect(-5,-5,10,10,"#fff",12);for(let a=0;a<4;a++){ctx.rotate(Math.PI/2);rect(15,-4,18,8,"#287cff");}ctx.restore();}
    else if(e.type==="hacker"){for(let i=0;i<5;i++)rect(e.x+(i%2?4:-4),e.y+i*10,30,7,i%2?"#9d21ff":"#07122d");glowRect(e.x+7,e.y+7,16,6,"#ff31dc",14);}
    else if(e.type==="brute"){rect(e.x-15,e.y-48,58,102,"#111a35");glowRect(e.x-8,e.y-22,44,10,"#ff345b",18);glowRect(e.x+7,e.y+10,16,20,"#ff2bd6",22);rect(e.x-28,e.y-20,15,62,"#26375a");rect(e.x+45,e.y-20,15,62,"#26375a");}
    else if(e.type==="wraith"){ctx.save();ctx.globalAlpha=.75;ctx.fillStyle="#168aff";ctx.shadowColor="#20eaff";ctx.shadowBlur=25;ctx.beginPath();ctx.moveTo(e.x,e.y+50);ctx.quadraticCurveTo(e.x-28,e.y+5,e.x+12,e.y-25);ctx.quadraticCurveTo(e.x+52,e.y+5,e.x+32,e.y+50);ctx.fill();glowRect(e.x+10,e.y-5,5,5,"#fff",12);glowRect(e.x+26,e.y-5,5,5,"#fff",12);ctx.restore();}
    else if(e.type==="sniper"){rect(e.x,e.y,32,42,"#10152e");glowRect(e.x+7,e.y+8,18,6,"#ff2b88",16);glowRect(e.x-25,e.y+20,58,5,"#ff315f",12);}
  }
  for(const p of projectiles){glowRect(p.x-5,p.y-3,12,6,p.color,20);}
}
function drawLasers(){
  for(const l of lasers){
    ctx.save();
    ctx.translate(l.x,l.y);
    ctx.scale(l.dir,1);
    ctx.shadowColor="#24ecff";
    ctx.shadowBlur=18;
    rect(-20,-9,48,18,"#a8adb0");
    rect(-42,-5,24,10,"#a8adb0");
    rect(-56,-2,16,4,"#d8fbff");
    glowRect(-33,-15,68,7,"#1fdfff",18);
    glowRect(-33,8,68,7,"#1fdfff",18);
    rect(-6,-18,35,6,"#008cff");
    rect(-4,12,35,6,"#0074ff");
    rect(-46,-14,18,5,"#0a7cff");
    rect(-47,9,18,5,"#0a7cff");
    rect(-14,-2,38,4,"#e8ffff");
    ctx.shadowColor="#ff1648";
    ctx.shadowBlur=18;
    ctx.strokeStyle="#ff1648";
    ctx.lineWidth=7;
    ctx.beginPath();
    ctx.ellipse(34,0,36,30,0,0,Math.PI*2);
    ctx.stroke();
    ctx.shadowColor="#25efff";
    ctx.strokeStyle="#25efff";
    ctx.lineWidth=6;
    ctx.beginPath();
    ctx.ellipse(34,0,25,22,0,0,Math.PI*2);
    ctx.stroke();
    rect(31,-18,25,10,"#00cfff");
    rect(38,10,18,7,"#007aff");
    rect(54,-5,12,10,"#ffffff");
    rect(67,-20,7,7,"#1feaff");
    rect(50,24,8,8,"#1feaff");
    rect(22,-31,10,8,"#ff1748");
    ctx.restore();
  }
}
function draw(){
  if(scene==="title"){background("#030932","#48155e");drawStars();castle(true);neonGround();return;}
  if(scene==="meadow"){background("#050a32","#76156e");drawStars();skyline(560);neonGround(620,true);drinkStand();glowRect(604,500,20,40,"#ff43e6",20);if(portal>0){ctx.save();ctx.shadowColor="#20eaff";ctx.shadowBlur=28;ctx.strokeStyle="#52f5ff";ctx.lineWidth=12;ctx.beginPath();ctx.ellipse(930,495,50*portal,110*portal,0,0,Math.PI*2);ctx.stroke();ctx.restore();}drawPlayer();}
  else if(scene==="battle"){background("#030526","#671060");drawStars();skyline(590);ctx.save();ctx.shadowColor="#27eaff";ctx.shadowBlur=30;ctx.strokeStyle="#34eaff";ctx.lineWidth=14;ctx.beginPath();ctx.ellipse(640,310,165,230,0,0,Math.PI*2);ctx.stroke();ctx.restore();neonGround(620,true);for(const p of platforms){glowRect(p.x,p.y,p.w,9,"#ff2bd6",22);rect(p.x,p.y+9,p.w,16,"#101539");}drawBattleEnemies();drawPlayer();}
  else if(scene==="hub"){background("#020629","#35145d");drawStars();castle();neonGround();ctx.fillStyle="#9af5ff";ctx.font="bold 20px sans-serif";ctx.fillText("SPACE: STAR MAP",535,90);drawPlayer();}
  else if(scene==="water"||scene==="waterHard"){background(scene==="waterHard"?"#02051c":"#090837",scene==="waterHard"?"#60106b":"#b52d83");drawStars();skyline(520);rect(0,520,1280,200,"#06143f");for(let i=0;i<12;i++){ctx.strokeStyle=i%2?"#ff3bdd":"#40eaff";ctx.lineWidth=4;ctx.beginPath();ctx.arc(i*120-40,545+Math.sin(time*.04+i)*20,70,0,Math.PI);ctx.stroke();ctx.globalAlpha=.28;ctx.fillStyle=i%2?"#ff37d7":"#24eaff";ctx.fillRect(i*110,580,55,120);ctx.globalAlpha=1;}ctx.save();ctx.translate(boat.x+65,boat.y+20);ctx.rotate(boat.tilt);ctx.shadowColor="#1feaff";ctx.shadowBlur=20;ctx.fillStyle="#431b2d";ctx.beginPath();ctx.moveTo(-65,-18);ctx.lineTo(65,-18);ctx.lineTo(45,24);ctx.lineTo(-45,24);ctx.closePath();ctx.fill();ctx.restore();drawPlayer();rect(1130,470,150,250,"#183c33");glowRect(1130,470,10,250,"#b9ff22",18);}
  else if(scene==="guards"){background("#060830","#6b176c");drawStars();skyline(555);neonGround(620,true);for(let i=0;i<7;i++){glowRect(80+i*185,515-(i%2)*35,38,105+(i%2)*35,i%2?"#ff39e4":"#31eaff",24);rect(88+i*185,530-(i%2)*35,22,75,"#17164b");}drawEnemies();drawPlayer();}
  else {background(scene==="parkourHard"?"#010419":"#0d0a3d",scene==="parkourHard"?"#47105b":"#df4e80");drawStars();skyline(635);neonGround(635,true);for(const p of platforms){glowRect(p.x,p.y,p.w,9,scene==="parkourHard"?"#ff32df":"#26ebff",20);rect(p.x,p.y+9,p.w,12,"#141442");}drawEnemies();drawPlayer();ctx.save();ctx.shadowColor="#25eeff";ctx.shadowBlur=28;ctx.strokeStyle="#66f7ff";ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(1160,165,35,70,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  drawLasers();
  if(transition>0){ctx.fillStyle=`rgba(120,235,255,${transition/28})`;ctx.fillRect(0,0,1280,720);}
}
function drawEnemies(){for(const e of enemies){glowRect(e.x,e.y,28,46,e.hit?"#fff":"#ff285f",14);rect(e.x+5,e.y-9,18,12,"#9eeaff");glowRect(e.x-11,e.y+14,8,32,"#ffcf22",12);}}
function loop(){update();draw();requestAnimationFrame(loop)}loop();
