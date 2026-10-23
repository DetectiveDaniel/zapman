const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../games/zapman/model.js'),'utf8');const c=vm.createContext({});vm.runInContext(source,c);
const tick=(g,t)=>{for(let i=0;i<Math.ceil(t/.01);i++)g.update(.01);};
function load(){const g=c.ZapmanAdventure.create({random:()=>.25});g.state.level=12;g.retryLevel();g.skipLevel();assert.equal(g.state.level,13);assert.equal(g.state.stage,'waistlandersGate');const frozen=JSON.stringify(g.state.cockroaches);tick(g,2.7);assert.equal(JSON.stringify(g.state.cockroaches),frozen);tick(g,.11);assert.equal(g.state.stage,'waistlanders');return g;}
const g=load(),s=g.state;assert.equal(s.health,5);assert.equal(s.cockroaches.length,10);assert(s.cockroaches.every(r=>Math.hypot(r.x-s.player.x,r.y-s.player.y)>450));assert(s.watchRepaired);
g.toggleShrink();assert(s.tiny);g.toggleShrink();assert(!s.tiny);
// The first cockroach really throws all five kinds, rather than cosmetic props.
s.cockroaches=s.cockroaches.slice(0,1);s.player.x=400;s.hurt=999;s.cockroaches[0].cooldown=0;
g.update(.01);assert.equal(s.cockroaches[0].windup,.75);const aim=[s.cockroaches[0].aimX,s.cockroaches[0].aimY];s.player.y+=40;tick(g,.6);assert.equal(s.thrownJunk.length,0);assert.deepEqual([s.cockroaches[0].aimX,s.cockroaches[0].aimY],aim);
const kinds=new Set(),samples=new Map();for(let i=0;i<2000;i++){g.update(.01);for(const shot of s.thrownJunk){kinds.add(shot.kind);samples.set(shot.kind,{...shot});}}assert.deepEqual([...kinds].sort(),['book','bottle','food','toy','tv']);assert.equal(samples.get('tv').speed,155);
// Every item can hit at full or tiny size. Invulnerability prevents hit spam.
for(const tiny of [false,true])for(const shot of samples.values()){g.retryLevel();if(tiny)g.toggleShrink();s.cockroaches=[];s.hurt=0;s.thrownJunk=[{...shot,x:s.player.x,y:s.player.y-s.player.h/2,vx:0,vy:0,life:1}];g.update(.01);assert.equal(s.health,4);assert.equal(s.thrownJunk.length,0);s.thrownJunk=[{...shot,x:s.player.x,y:s.player.y-s.player.h/2,vx:0,vy:0,life:1}];g.update(.01);assert.equal(s.health,4);}
// Scrap walls stop junk and actual watch shots defeat a cockroach.
g.retryLevel();s.cockroaches=[];s.thrownJunk=[{...samples.get('tv'),x:940,y:380,vx:155,vy:0,life:2}];tick(g,.2);assert.equal(s.thrownJunk.length,0);
g.retryLevel();s.cockroaches=s.cockroaches.slice(0,1);s.player.x=400;g.keys.add('j');tick(g,2);g.keys.clear();assert(!s.cockroaches[0].alive);
g.retryLevel();s.player.x=400;g.toggleShrink();s.cockroaches[0].cooldown=0;g.update(.01);assert.equal(s.cockroaches[0].windup,0,'Distant cockroaches do not start throws at tiny players.');g.toggleShrink();g.update(.01);assert(s.cockroaches[0].windup>0);
// Pause, hearts, death, retry, skip and restart all cleanly manage new hazards.
g.togglePause();const paused=JSON.stringify(s);tick(g,1);assert.equal(JSON.stringify(s),paused);g.togglePause();
g.retryLevel();s.cockroaches=[];s.health=2;Object.assign(s.player,{x:s.scrapHearts[0].x,y:s.scrapHearts[0].y});g.update(.01);assert.equal(s.health,4);assert(s.scrapHearts[0].collected);g.update(.01);assert.equal(s.health,4);
s.health=1;s.hurt=0;s.thrownJunk=[{...samples.get('book'),x:s.player.x,y:s.player.y-20,vx:0,vy:0,life:1}];g.update(.01);assert.equal(s.stage,'lost');assert.equal(s.thrownJunk.length,0);const dead=s.wasteTime;tick(g,1);assert.equal(s.wasteTime,dead);g.retryLevel();assert.equal(s.level,13);assert.equal(s.health,5);assert.equal(s.thrownJunk.length,0);g.togglePause();g.skipLevel();assert.equal(s.stage,'won');assert(!s.paused);g.restart();assert.equal(s.cockroaches.length,0);assert.equal(s.thrownJunk.length,0);
// Finish the complete level using real movement, aiming and damage, with no
// invulnerability, health overrides or removed enemies.
const run=load(),r=run.state;for(let i=0;i<16000&&r.stage==='waistlanders';i++){run.keys.clear();run.keys.add('d');run.keys.add('j');const target=540+Math.sin(i/45)*38;if(r.player.y<target-4)run.keys.add('s');if(r.player.y>target+4)run.keys.add('w');run.update(1/60);}assert.equal(r.stage,'won','Level 13 can be completed with ordinary movement and watch fire.');assert(r.health>0);assert.equal(r.thrownJunk.length,0);
console.log('Passed Level 12→13 transition, safe entry, all five real throws, locked warnings, both-size damage/immunity, cover, watch combat, shrinking, pause, rescue packs, death/retry/skip/restart and a full winning playthrough ('+r.health+' hearts).');
