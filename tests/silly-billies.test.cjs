const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),events=new Map(),nodes=new Map();
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function node(id){if(!nodes.has(id)){const classes=new Set();nodes.set(id,{width:960,height:540,children:[],textContent:'',classList:{add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n),toggle(n,on){on?classes.add(n):classes.delete(n)}},append(n){this.children.push(n)},replaceChildren(){this.children=[]},setAttribute(){},getContext:()=>ctx,focus(){},addEventListener:(type,fn)=>events.set(id+':'+type,fn)});}return nodes.get(id);}
const scope=vm.createContext({window:{addEventListener:(type,fn)=>events.set('window:'+type,fn)},document:{querySelector:node,querySelectorAll:()=>[],createElement:()=>node('heart'+Math.random())},performance:{now:()=>0},requestAnimationFrame(){},setInterval(){return 1},clearInterval(){}});
vm.runInContext(fs.readFileSync(path.join(root,'games/silly-billies/game.js'),'utf8'),scope);
const q=scope.window.__sillyBillies,tick=(seconds)=>{for(let t=0;t<seconds;t+=1/120)q.update(1/120)};
q.startGame();assert.equal(q.state.level,1);q.player.x=8000;q.update(.01);assert.equal(q.state.mode,'between');
q.handleStartButton();assert.equal(q.state.level,2);assert.equal(q.state.mode,'playing');assert(q.weaponPickup);
q.player.x=q.weaponPickup.x;q.player.y=q.weaponPickup.y-20;q.update(.01);assert(q.player.superBlaster);
q.player.x=8000;q.update(.01);assert.equal(q.state.mode,'between');assert(node('#messageTitle').textContent.includes('UNDER THE DRAIN'));
q.handleStartButton();assert.equal(q.state.level,3);assert(q.player.superBlaster);assert.equal(q.player.x,140);assert.equal(q.lasers.length,0);
assert(q.enemies.every(e=>e.x-q.player.x>500),'Safe level-three spawn.');
assert.deepEqual([...new Set(q.enemies.map(e=>e.type))].sort(),['bat','drain','robot']);
// Bubbles precede emergence; hidden monsters cannot touch or be shot.
const monster=q.enemies.find(e=>e.type==='drain');q.enemies.forEach(e=>{if(e!==monster)e.dead=true});monster.phase=0;
q.state.gameTime=0;q.player.x=monster.x;q.player.y=372;q.update(.01);assert.equal(monster.exposure,0);assert.equal(q.player.hearts,10);
q.lasers.push({x:monster.x+10,y:400,vx:0,life:.2,w:22,h:8,owner:'player',power:true});q.update(.01);assert(!monster.dead);
q.lasers.length=0;q.state.gameTime=.8;q.update(.01);assert(monster.exposure>0&&monster.exposure<.3);
q.state.gameTime=1.4;q.update(.01);assert.equal(monster.exposure,1);assert.equal(q.player.hearts,9);
q.lasers.push({x:monster.x+10,y:400,vx:0,life:.2,w:22,h:8,owner:'player',power:true});q.update(.01);assert(monster.dead);
q.loadLevel(3);q.state.mode='playing';const bat=q.enemies.find(e=>e.type==='bat');const before={x:bat.x,y:bat.y};tick(.4);assert.notEqual(bat.y,before.y);assert.notEqual(bat.x,before.x);
// Robots retain real travelling lasers in the drain.
const robot=q.enemies.find(e=>e.type==='robot');q.player.x=robot.x-350;robot.shootTimer=0;q.update(.01);assert(q.lasers.some(l=>l.owner==='enemy'));
// A normal run can reach the end using jumping and firing, without health cheats.
q.startGame();q.loadLevel(3);events.get('window:keydown')({code:'ArrowRight',repeat:false,preventDefault(){}});
for(let i=0;i<12000&&q.state.mode==='playing';i++){
 const obstacle=q.obstacles.some(o=>o.x-q.player.x<145&&o.x+o.w>q.player.x);
 const nearby=q.enemies.some(e=>!e.dead&&e.x-q.player.x<180&&e.x+e.w>q.player.x);
 if((obstacle||nearby)&&q.player.grounded)q.jump();q.fire();q.update(1/120);
}
assert.equal(q.state.mode,'won','The drain can be completed with normal controls and health.');
assert.equal(q.state.level,3);q.draw();assert(node('#messageTitle').textContent.includes('THREE'));
q.startGame();assert.equal(q.state.level,1);assert.equal(q.player.hearts,10);assert(!q.player.superBlaster);
console.log('Passed three-level progression, safe drain spawns, blaster carry-over, hidden/emerging monster collisions, shooting, flying bats, robot lasers, a normal winning drain run, rendering and restart.');
