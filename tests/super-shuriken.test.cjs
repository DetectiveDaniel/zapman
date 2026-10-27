const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

function loadGame(nativeCanvas) {
  const nodes = new Map(), events = new Map();
  const context = new Proxy({}, { get: (obj,key) => obj[key] || (()=>{}), set: (obj,key,value)=>(obj[key]=value,true) });
  context.createLinearGradient = context.createRadialGradient = ()=>({addColorStop(){}});
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {
      textContent:'',style:{setProperty(){}},classList:{add(){},remove(){}},
      setAttribute(){},appendChild(){},replaceChildren(){},
      addEventListener(type,fn){events.set(id+':'+type,fn);}
    });
    return nodes.get(id);
  };
  const canvas = nativeCanvas || {width:960,height:540,getContext:()=>context};
  canvas.addEventListener = (type,fn)=>events.set('canvas:'+type,fn);
  canvas.getBoundingClientRect = ()=>({left:0,top:0,width:960,height:540});
  nodes.set('#game',canvas);
  const window = {addEventListener:(type,fn)=>events.set('window:'+type,fn)};
  const document = {hidden:false,querySelector:node,querySelectorAll:()=>[],
    createElement:()=>node(Symbol()),createDocumentFragment:()=>({appendChild(){}}),
    addEventListener:(type,fn)=>events.set('document:'+type,fn)};
  const world = vm.createContext({window,document,performance:{now:()=>0},requestAnimationFrame(){},localStorage:{getItem:()=>null,setItem(){}}});
  const source = fs.readFileSync(path.join(__dirname,'../games/super-shuriken/game.js'),'utf8');
  const expose = `globalThis.Q={startGame,throwShuriken,switchPower,killRobot,robotShoot,update,render,togglePause,player,keys,
    get data(){return {state,score,wave,elapsed,powers,powersUnlocked,selectedPower,nextEnergyScore,robots,shurikens,lasers,fallouts,blasts,clearedWave};},
    addRobot(props={}){spawnRobot();const robot=robots[robots.length-1];Object.assign(robot,{x:450,speed:0,shootTimer:999},props);return robot;},
    quiet(){spawnTimer=999;},forceSpawn(){spawnTimer=0;},setScore(value){score=value;},setElapsed(value){elapsed=value;}};`;
  vm.runInContext(source.replace(/\}\)\(\);\s*$/,expose+'})();'),world);
  return {q:world.Q,world,nodes,events,canvas};
}

function runTests() {
  const env = loadGame(), {q,world,events,nodes} = env;
  const tick = seconds => { for(let left=seconds;left>1e-8;left-=1/120)q.update(Math.min(left,1/120)); };
  const select = kind => { for(let i=0;q.data.powers[q.data.selectedPower].id!==kind&&i<5;i++)q.switchPower(); assert.equal(q.data.powers[q.data.selectedPower].id,kind); };
  const unlock = () => {
    q.startGame();q.quiet();q.setScore(1450);q.player.health=60;
    q.killRobot(q.addRobot({heavy:true}));
    q.update(0);
    assert.equal(q.data.score,1700);assert(q.data.powersUnlocked);assert.equal(q.player.health,80);
  };
  q.startGame();q.quiet();q.switchPower();assert.equal(q.data.selectedPower,0);assert(!q.data.powersUnlocked);
  unlock();assert.equal(q.data.nextEnergyScore,3000);assert.equal(q.data.powers[q.data.selectedPower].id,'fire');
  events.get('window:keydown')({code:'KeyF',repeat:false,preventDefault(){}});
  assert.equal(q.data.powers[q.data.selectedPower].id,'wild');
  events.get('window:keydown')({code:'KeyF',repeat:true,preventDefault(){}});
  assert.equal(q.data.powers[q.data.selectedPower].id,'wild');
  events.get('#powerButton:click')();assert.equal(q.data.powers[q.data.selectedPower].id,'fog');
  q.togglePause();q.switchPower();assert.equal(q.data.powers[q.data.selectedPower].id,'fog');q.togglePause();
  assert.equal(new Set(Array.from(q.data.powers,p=>p.color)).size,5);

  // Existing steel still does one hit of damage, including to heavy robots.
  unlock();select('normal');let robot=q.addRobot({hp:4,maxHp:4});q.throwShuriken(false);tick(.2);assert.equal(robot.hp,3);assert(!robot.dead);
  // A fire impact burns at most two robots, and burns through heavy armour.
  unlock();select('fire');const burning=[450,515,580].map(x=>q.addRobot({x,hp:4,maxHp:4}));
  q.throwShuriken(false);tick(.2);assert.equal(burning.filter(r=>r.burn>0).length,2);tick(1.3);
  assert.equal(burning.filter(r=>r.dead).length,2);assert.equal(burning[2].hp,4);

  // Both sides of the exact 50/50 boundary: an entire lane, or the sky.
  for(const roll of [.499,.5]) {
    unlock();select('wild');vm.runInContext(`Math.random=()=>${roll}`,world);
    const lane=[450,700].map(x=>q.addRobot({x,hp:8,maxHp:8}));const otherLane=q.addRobot({x:600,y:240,h:40});
    q.throwShuriken(false);const thrown=q.data.shurikens[0];
    assert.equal(thrown.sky,roll<.5);if(thrown.sky)assert(thrown.vy < -800);
    tick(.7);assert.equal(lane.filter(r=>r.dead).length,roll<.5?0:2);assert(!otherLane.dead);
  }

  unlock();select('fog');robot=q.addRobot({x:450});q.throwShuriken(false);tick(.2);
  assert(robot.fog>4);robot.shootTimer=0;const blindedX=robot.x;
  q.robotShoot(robot);tick(4.5);assert.equal(q.data.lasers.length,0);assert.equal(robot.x,blindedX);
  tick(.7);assert.equal(robot.fog,0);assert(robot.shootTimer>0,'A robot can see and fire again after five seconds.');assert.equal(robot.hp,robot.maxHp);

  function nuclear(side=1) {
    unlock();select('nuclear');q.player.x=side>0?340:650;
    (side>0?[600,750,850]:[350,150,50]).forEach(x=>q.addRobot({x,hp:9,maxHp:9}));
    q.data.lasers.push({x:900,y:80,px:900,py:80,vx:0,vy:0,life:5,width:5});
    q.throwShuriken(false);q.throwShuriken(false);assert.equal(q.data.shurikens.length,1);
    tick(.6);assert.equal(q.data.robots.length,0);assert.equal(q.data.lasers.length,0);
    assert.equal(q.data.clearedWave,q.data.wave);assert.equal(q.data.fallouts.length,1);assert.equal(q.data.fallouts[0].side,side);
    return q.data.fallouts[0];
  }
  let fallout=nuclear();q.forceSpawn();tick(.2);assert.equal(q.data.robots.length,0,'The rest of the wave stays cleared.');
  const remaining=fallout.life;q.togglePause();q.update(1);assert.equal(fallout.life,remaining);q.togglePause();
  tick(.7);const safeHealth=q.player.health;assert.equal(safeHealth,80);
  q.player.x=fallout.x+30;q.player.invulnerable=999;tick(.4);assert(q.player.health<safeHealth-30);
  q.player.x=fallout.x-50;const retreatHealth=q.player.health;tick(.3);assert.equal(q.player.health,retreatHealth);
  q.player.x=fallout.x+30;tick(1);assert.equal(q.player.health,0);assert.equal(q.data.state,'gameover');
  fallout=nuclear(-1);tick(.7);q.player.x=fallout.x-30;tick(.25);assert(q.player.health<80);
  q.player.x=650;fallout.life=.01;tick(.02);assert.equal(q.data.fallouts.length,0);
  q.setElapsed(19);q.forceSpawn();tick(.01);assert.equal(q.data.wave,2);assert(q.data.robots.length>0);

  // Nuclear shots also detonate on expiry when thrown into an empty meadow.
  unlock();select('nuclear');q.throwShuriken(false);tick(1.1);assert.equal(q.data.fallouts.length,1);
  q.startGame();assert(!q.data.powersUnlocked);assert.equal(q.data.selectedPower,0);assert.equal(q.data.fallouts.length,0);
  assert.equal(q.data.blasts.length,0);assert.equal(q.data.shurikens.length,0);assert.equal(q.player.health,100);
  q.render();assert(nodes.get('#powerStatus').textContent.includes('1500'));
  console.log('Passed meadow-energy threshold/unlock, keyboard and touch switching, five colours, steel damage, double fire burn, both wild outcomes, fog blindness/recovery, nuclear wave clear/cooldown, fallout boundaries/damage/retreat/expiry/pause, next wave and restart cleanup.');
}
module.exports={loadGame};
if(require.main===module)runTests();
