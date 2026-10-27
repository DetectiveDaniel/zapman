const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {Mission,characters,distance}=require('../games/detective-mission/mission-core.js');
const tick=(m,seconds,input={})=>{for(let left=seconds;left>1e-8;left-=1/120)m.update(Math.min(left,1/120),input);};
const create=(character=0)=>{const m=new Mission(character,()=>.5);m.start();return m;};
assert.deepEqual(characters.map(c=>c.name),['Daniel','Max','Mary','Leopold','Leila']);
for(let i=0;i<5;i++){const m=create(i);assert.equal(m.character,i);assert.equal(m.state,'playing');assert.equal(m.guards.length,3);assert(m.guards.every(g=>distance(g,m.player)>13));}
assert.equal(create(3.5).character,3);assert.equal(create(99).character,4);
let m=create();tick(m,.5,{right:true});assert(Math.abs(m.player.x-3)<.001);
let diagonal=create();tick(diagonal,.5,{right:true,forward:true});assert(Math.abs(Math.hypot(diagonal.player.x,diagonal.player.z)-3)<.001);
m=create();m.update(.01,{dash:true,right:true});assert(m.player.dashCooldown>1.7);assert(m.player.invulnerable>0);tick(m,.2,{right:true});assert(m.player.x>3);
tick(m,4,{right:true});assert.equal(m.player.x,12);
// Immediate attacks, per-shot cooldown and accurate selected targets.
m=create();const target=m.guards[0],other=m.guards[1];assert(m.fire(target.id));assert.equal(target.hp,35);assert.equal(other.hp,other.maxHp);assert(!m.fire(target.id));tick(m,.35);assert(m.fire(target.id));assert(!target.alive);assert.equal(m.score,100);assert.equal(m.zaps.length,1);
// Charged enemy attacks provide a full warning before releasing a travelling zap.
m=create();const guard=m.guards[0];guard.cooldown=0;m.guards.slice(1).forEach(g=>g.cooldown=999);
m.update(.01);assert(guard.charge>1);assert.equal(m.projectiles.length,0);tick(m,1);assert.equal(m.projectiles.length,0);tick(m,.2);assert(m.projectiles.length>0);
const zap=m.projectiles[0],oldZ=zap.z;m.update(.02);assert.notEqual(zap.z,oldZ);
// Standing in a zap hurts; moving aside or dashing avoids the same shot.
for(const evade of ['none','move','dash']) {
 m=create();m.guards.forEach(g=>{g.cooldown=999;g.speed=0;});m.projectiles.push({x:0,z:3,px:0,pz:3,vx:0,vz:-7.5,life:2,damage:26,height:1});
 if(evade==='dash'){m.update(.01,{right:true,dash:true});tick(m,.5,{right:true});}
 else tick(m,.5,evade==='move'?{right:true}:{});
 assert.equal(m.player.health,evade==='none'?74:100,evade+' evasion');
}
m=create();assert(m.hurt(26,'test'));assert(!m.hurt(26,'test'));assert.equal(m.player.health,74);
for(let i=0;i<3;i++){tick(m,.8);m.hurt(26,'test');}assert.equal(m.state,'lost');assert.equal(m.player.health,0);
const stopped=m.time;tick(m,1,{fire:true,right:true});assert.equal(m.time,stopped);
m.start();assert.equal(m.player.health,100);assert.equal(m.files,0);assert.equal(m.wave,1);assert.equal(m.projectiles.length,0);
m.pause();const paused=JSON.stringify(m);tick(m,1,{fire:true,right:true,dash:true});assert.equal(JSON.stringify(m),paused);m.pause();assert.equal(m.state,'playing');
// All three waves, heavy final guard, case-file collection, healing and victory.
m=create(2);m.player.health=70;
for(let wave=1;wave<=3;wave++) {
 assert.equal(m.wave,wave);assert.equal(m.guards.length,wave+2);
 if(wave===3)assert(m.guards.some(g=>g.kind===2&&g.maxHp===150));
 m.guards.forEach(g=>{g.cooldown=999;g.speed=0;});
 for(const g of m.guards)while(g.alive){m.fire(g.id);tick(m,.35);}
 assert(m.clue);assert.equal(m.files,wave-1);
 tick(m,.8,{forward:true});assert.equal(m.files,wave);
}
assert.equal(m.state,'won');assert.equal(m.score,2150);assert.equal(m.player.health,100);
assert.equal(m.clue,null);assert(!m.fire());m.start();assert.equal(m.score,0);assert.equal(m.files,0);
// Drive a complete mission with normal movement, automatic aim and real incoming attacks.
let seed=1337;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
m=new Mission(4,random);m.start();
for(let i=0;i<18000&&m.state==='playing';i++) {
 let input={fire:true};
 if(m.clue){input.left=m.clue.x<m.player.x-.25;input.right=m.clue.x>m.player.x+.25;input.forward=m.clue.z>m.player.z+.25;input.backward=m.clue.z<m.player.z-.25;}
 else{const desired=Math.sin(m.time*1.2)*7;input.left=desired<m.player.x-.3;input.right=desired>m.player.x+.3;input.dash=m.projectiles.some(b=>distance(b,m.player)<2)&&m.player.dashCooldown===0;}
 m.update(1/120,input);
}
assert.equal(m.state,'won','A player can complete the mission while dodging actual attacks.');
const root=path.resolve(__dirname,'../games/detective-mission');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const asset of ['assets/detectives.png','assets/guards.png','assets/meadow.png','game.js','mission-core.js','art-data.js','styles.css'])assert(fs.existsSync(path.join(root,asset)));
assert(html.includes('art-data.js'));assert(fs.readFileSync(path.resolve(__dirname,'../picker.js'),'utf8').includes('folder: "detective-mission"'));
console.log('Passed five selections, safe spawns, movement/diagonals/bounds, dash, lightning targeting/cooldown, enemy warnings and projectiles, zap damage/evasion, pause, failure/restart, all three waves/files/healing, final boss, a complete winning combat run, assets and picker registration.');
