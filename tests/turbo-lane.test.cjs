const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'games/turbo-lane/game.js'),'utf8');
const ctx=new Proxy({}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)}),nodes=new Map(),stored=new Map();
const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',addEventListener(){},width:960,height:540,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,width:960})});return nodes.get(id);};
const world=vm.createContext({document:{getElementById:node},window:{addEventListener(){}},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},performance:{now:()=>0},requestAnimationFrame(){}});
vm.runInContext(source+`;globalThis.Q={startLevel,spawnTraffic,update,draw,finishLevel,moveLane,reset,clearTraffic:()=>{traffic=[];},get state(){return {level,traffic,spawned,car,lanes,phase,won,gameOver,dodged,finishLine};}}`,world);
const q=world.Q;
assert(!fs.readFileSync(path.join(root,'games/turbo-lane/index.html'),'utf8').includes('>Launcher<'));
// All three possible truck pairs occupy exactly two lanes. A second truck
// cannot appear beside or behind an existing wave and close the route.
for(const random of [0,.4,.99]){world.random=random;vm.runInContext('Math.random=()=>random',world);q.startLevel(4);assert(q.spawnTraffic());const t=q.state.traffic[0];assert.equal(t.kind,'monster');assert.equal(t.width,208);assert.equal(t.height,144);const blocked=Array.from(q.state.lanes,x=>x>=t.x-t.width/2&&x<=t.x+t.width/2);assert.equal(blocked.filter(Boolean).length,2);assert.equal(q.spawnTraffic(),false);assert.equal(q.state.traffic.length,1);assert.equal(q.state.spawned,1);q.draw();}
// Level three advances into level four, rather than ending the game.
q.reset();q.startLevel(3);q.finishLevel();assert(!q.state.won);assert.equal(q.state.phase,'between');for(let i=0;i<130;i++)q.update(.016);assert.equal(q.state.level,4);
// Drive the entire monster-truck level with normal lane changes and real
// timing. Repeated forced pair changes still leave a reachable clear lane.
let seed=73;world.random=()=>((seed=seed*16807%2147483647)-1)/2147483646;vm.runInContext('Math.random=()=>random()',world);
let maximumTraffic=0;
for(let i=0;i<15000&&!q.state.won&&!q.state.gameOver;i++){
  const {traffic,car,lanes}=q.state;maximumTraffic=Math.max(maximumTraffic,traffic.length);
  if(traffic.length){const t=traffic[0],free=Array.from(lanes,(x,i)=>({x,i})).filter(({x})=>x<t.x-t.width/2||x>t.x+t.width/2).sort((a,b)=>Math.abs(a.x-car.x)-Math.abs(b.x-car.x));const target=free[0].i;while(car.lane!==target)q.moveLane(Math.sign(target-car.lane));}
  q.update(.016);q.draw();
}
assert(!q.state.gameOver);assert(q.state.won,'Level four can be completed through the clear lanes.');assert.equal(q.state.dodged,18);assert.equal(maximumTraffic,1);assert.equal(q.state.phase,'won');
// Both halves of a truck are solid, and restarting returns to level one.
for(const lane of [0,1]){q.reset();q.startLevel(4);vm.runInContext('Math.random=()=>0',world);q.spawnTraffic();const t=q.state.traffic[0];q.state.car.x=q.state.car.targetX=q.state.lanes[lane];q.state.car.lane=lane;t.y=q.state.car.y;q.update(.001);assert(q.state.gameOver);}
q.reset();assert.equal(q.state.level,1);assert(!q.state.gameOver);assert(!q.state.won);assert.equal(q.state.traffic.length,0);
console.log('Passed launcher removal, all two-lane truck positions, guaranteed open waves, level 3→4 progression, a full winning Level 4 drive, collisions on both truck halves and restart.');
