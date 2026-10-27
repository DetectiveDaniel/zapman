const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'games/turbo-lane/game.js'),'utf8');
const ctx=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),nodes=new Map(),stored=new Map();
const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',addEventListener(){},width:960,height:540,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,width:960})});return nodes.get(id);};
const world=vm.createContext({document:{getElementById:node},window:{addEventListener(){}},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},performance:{now:()=>0},requestAnimationFrame(){}});
vm.runInContext(source+`;globalThis.Q={startLevel,spawnTraffic,update,draw,finishLevel,moveLane,reset,clearTraffic:()=>{traffic=[];},get state(){return {level,traffic,spawned,car,lanes,phase,won,gameOver,dodged,finishLine};}}`,world);
const q=world.Q;
assert(!fs.readFileSync(path.join(root,'games/turbo-lane/index.html'),'utf8').includes('>Launcher<'));
// Every possible truck/escort team leaves exactly one full lane free.
const freeLanes = state => Array.from(state.lanes, (x,i)=>({x,i})).filter(({x})=>state.traffic.every(t=>x<t.x-t.width/2||x>t.x+t.width/2));
for(const truckRandom of [0,.4,.99]) for(const escortRandom of [0,.99]) {
  world.rolls=[truckRandom,escortRandom];vm.runInContext('Math.random=()=>rolls.shift()',world);
  q.reset();q.startLevel(4);assert(q.spawnTraffic());
  const [truck,escort]=q.state.traffic;
  assert.equal(truck.kind,'monster');assert.equal(truck.width,208);assert.equal(truck.height,144);
  assert.equal(escort.kind,'green');assert.equal(escort.y,truck.y);assert.equal(escort.speedBoost,truck.speedBoost);
  assert.equal(freeLanes(q.state).length,1);
  assert.equal(q.spawnTraffic(),false);assert.equal(q.state.traffic.length,2);assert.equal(q.state.spawned,2);
  q.update(.1);assert.equal(escort.y,truck.y);q.draw();
  // The next team waits even after the first teammate has left the road.
  escort.y=650;q.update(0);assert.equal(q.state.traffic.length,1);assert.equal(q.spawnTraffic(),false);
}
// Level three advances into level four, rather than ending the game.
q.reset();q.startLevel(3);q.finishLevel();assert(!q.state.won);assert.equal(q.state.phase,'between');for(let i=0;i<130;i++)q.update(.016);assert.equal(q.state.level,4);
// Drive the entire monster-truck level with normal lane changes and real
// timing. Repeated forced pair changes still leave a reachable clear lane.
let seed=73;world.random=()=>((seed=seed*16807%2147483647)-1)/2147483646;vm.runInContext('Math.random=()=>random()',world);
let maximumTraffic=0;
for(let i=0;i<15000&&!q.state.won&&!q.state.gameOver;i++){
  const {traffic,car,lanes}=q.state;maximumTraffic=Math.max(maximumTraffic,traffic.length);
  if(traffic.length){const free=freeLanes(q.state).sort((a,b)=>Math.abs(a.x-car.x)-Math.abs(b.x-car.x));const target=free[0].i;while(car.lane!==target)q.moveLane(Math.sign(target-car.lane));}
  q.update(.016);q.draw();
}
assert(!q.state.gameOver);assert(q.state.won,'Level four can be completed through the clear lanes.');assert.equal(q.state.dodged,36);assert.equal(q.state.spawned,36);assert.equal(maximumTraffic,2);assert.equal(q.state.phase,'won');
// Both halves of a truck are solid, and restarting returns to level one.
for(const lane of [0,1]){q.reset();q.startLevel(4);vm.runInContext('Math.random=()=>0',world);q.spawnTraffic();const t=q.state.traffic[0];q.state.car.x=q.state.car.targetX=q.state.lanes[lane];q.state.car.lane=lane;t.y=q.state.car.y;q.update(.001);assert(q.state.gameOver);}
// Green teammates also collide normally.
q.reset();q.startLevel(4);vm.runInContext('Math.random=()=>0',world);q.spawnTraffic();
const escort=q.state.traffic[1];q.state.car.x=q.state.car.targetX=escort.x;escort.y=q.state.car.y;q.update(.001);assert(q.state.gameOver);
q.reset();assert.equal(q.state.level,1);assert(!q.state.gameOver);assert(!q.state.won);assert.equal(q.state.traffic.length,0);
console.log('Passed launcher removal, all six truck/green-car teams, guaranteed open waves, level 3→4 progression, a full winning Level 4 drive, collisions on both truck halves and green teammates, and restart.');
