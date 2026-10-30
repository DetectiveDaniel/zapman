/* Detective Mission: deterministic combat and movement, independent of rendering. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DetectiveMission = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const characters = [
    { name:'Daniel', color:'#ff963c', detail:'Every mystery leaves a spark.' },
    { name:'Max', color:'#ffd54c', detail:'A bright mind. A quicker reaction.' },
    { name:'Mary', color:'#ffba54', detail:'Follow the clues. Trust your instincts.' },
    { name:'Leopold', color:'#ffdf61', detail:'No case is too big to crack.' },
    { name:'Leila', color:'#f5c32f', detail:'See the detail everyone else misses.' }
  ];
  const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  class Mission {
    constructor(character=0,random=Math.random) { this.random=random; this.reset(character); }
    reset(character=this.character) {
      this.character=clamp(Math.trunc(Number(character))||0,0,4);
      this.state='ready';this.time=0;this.wave=0;this.files=0;this.score=0;this.shots=0;this.nextId=1;
      this.player={x:0,z:0,health:100,invulnerable:0,cooldown:0,cast:0,step:0,speed:0,vx:0,vz:0,moveX:0,moveZ:0,dashTime:0,dashCooldown:0,dashX:0,dashZ:1};
      this.guards=[];this.projectiles=[];this.zaps=[];this.sparks=[];this.events=[];this.clue=null;this.waveCleared=false;
    }
    emit(type,data={}) { this.events.push({type,...data}); }
    drainEvents() { return this.events.splice(0); }
    start() { this.reset(this.character);this.state='playing';this.spawnWave();this.emit('start'); }
    spawnWave() {
      this.wave++;this.waveCleared=false;
      const count=this.wave+2;
      for(let i=0;i<count;i++) {
        const boss=this.wave===3&&i===count-1;
        this.guards.push({id:this.nextId++,x:clamp((i-(count-1)/2)*4,-10,10),z:this.player.z+14+(i%3)*3+this.random()*2,
          hp:boss?150:60+this.wave*10,maxHp:boss?150:60+this.wave*10,kind:boss?2:i%2,
          height:boss?2.8:2.45,radius:boss?1.1:.85,speed:boss?1.3:1.15,
          cooldown:1.1+i*.55,charge:0,hit:0,alive:true,down:0,phase:this.random()*6.28});
      }
      this.emit('wave',{wave:this.wave});
    }
    pause() { if(this.state==='playing')this.state='paused';else if(this.state==='paused')this.state='playing'; }
    nearest() { return this.guards.filter(g=>g.alive&&distance(g,this.player)<=27).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0]||null; }
    fire(targetId) {
      if(this.state!=='playing'||this.player.cooldown>0)return false;
      const requested=this.guards.find(g=>g.id===targetId&&g.alive&&distance(g,this.player)<=27);
      const target=requested||this.nearest();
      this.player.cooldown=.34;this.player.cast=.38;this.shots++;
      this.zaps.push({x:target?target.x:this.player.x,z:target?target.z:this.player.z+23,height:target?target.height*.58:1.3,life:.19,max:.19,seed:this.shots});
      if(target) {
        target.hp=Math.max(0,target.hp-35);target.hit=.17;
        this.sparks.push({x:target.x,z:target.z,height:target.height*.6,life:.35,max:.35,kind:'hit'});
        if(target.hp===0) {
          target.alive=false;target.down=.65;target.charge=0;this.score+=target.kind===2?300:100;
          this.emit('guardDown');
        }
      }
      this.emit('fire');return true;
    }
    hurt(amount,source) {
      if(this.state!=='playing'||this.player.invulnerable>0)return false;
      this.player.health=Math.max(0,this.player.health-amount);this.player.invulnerable=.75;
      this.sparks.push({x:this.player.x,z:this.player.z,height:1,life:.35,max:.35,kind:'hurt'});
      this.emit('hurt',{amount,source});
      if(this.player.health===0){this.state='lost';this.emit('lost');}
      return true;
    }
    update(dt,input={}) {
      if(this.state!=='playing')return;
      dt=clamp(dt,0,.05);this.time+=dt;
      const p=this.player;
      p.invulnerable=Math.max(0,p.invulnerable-dt);p.cooldown=Math.max(0,p.cooldown-dt);p.cast=Math.max(0,p.cast-dt);
      p.dashCooldown=Math.max(0,p.dashCooldown-dt);
      let dx=(input.right?1:0)-(input.left?1:0),dz=(input.forward?1:0)-(input.backward?1:0);
      const length=Math.hypot(dx,dz);if(length){dx/=length;dz/=length;}
      if(input.dash&&p.dashCooldown===0){p.dashTime=.22;p.dashCooldown=1.8;p.dashX=dx;p.dashZ=length?dz:1;p.invulnerable=Math.max(p.invulnerable,.25);this.emit('dash');}
      const dashing=p.dashTime>0;
      let travelX,travelZ;
      if(dashing){
        p.vx=p.dashX*18;p.vz=p.dashZ*18;
        travelX=p.vx*dt;travelZ=p.vz*dt;p.dashTime=Math.max(0,p.dashTime-dt);
      }else{
        // Integrate the eased velocity analytically so different frame rates agree.
        const rate=length?16:24,decay=Math.exp(-rate*dt),targetX=dx*6,targetZ=dz*6;
        travelX=targetX*dt+(p.vx-targetX)*(1-decay)/rate;
        travelZ=targetZ*dt+(p.vz-targetZ)*(1-decay)/rate;
        p.vx=targetX+(p.vx-targetX)*decay;p.vz=targetZ+(p.vz-targetZ)*decay;
        if(!length&&Math.hypot(p.vx,p.vz)<.015){p.vx=0;p.vz=0;}
      }
      const oldX=p.x,oldZ=p.z;
      p.x=clamp(p.x+travelX,-12,12);p.z=clamp(p.z+travelZ,-3,145);
      if(p.x===12&&p.vx>0||p.x===-12&&p.vx<0)p.vx=0;
      if(p.z===145&&p.vz>0||p.z===-3&&p.vz<0)p.vz=0;
      const travelled=Math.hypot(p.x-oldX,p.z-oldZ);
      p.step+=travelled;p.speed=dt>0?travelled/dt:0;p.moveX=dt>0?(p.x-oldX)/dt:0;p.moveZ=dt>0?(p.z-oldZ)/dt:0;
      if(input.fire)this.fire(input.targetId);
      for(const g of this.guards) {
        g.hit=Math.max(0,g.hit-dt);
        if(!g.alive){g.down=Math.max(0,g.down-dt);continue;}
        const dist=distance(g,p);
        if(g.charge>0) {
          g.charge=Math.max(0,g.charge-dt);
          if(g.charge===0) {
            const vx=(p.x-g.x)/(dist||1),vz=(p.z-g.z)/(dist||1);
            this.projectiles.push({x:g.x,z:g.z,px:g.x,pz:g.z,vx:vx*(g.kind===2?9:7.5),vz:vz*(g.kind===2?9:7.5),life:5,damage:g.kind===2?34:26,height:1});
            g.cooldown=g.kind===2?1.8:2.5+this.random()*.5;this.emit('enemyFire');
          }
        } else {
          if(dist>6){g.x+=(p.x-g.x)/(dist||1)*g.speed*dt;g.z+=(p.z-g.z)/(dist||1)*g.speed*dt;}
          g.cooldown-=dt;
          if(g.cooldown<=0&&dist<24){g.charge=1.1;this.emit('warning');}
        }
        if(dist<g.radius+.55&&this.hurt(18,g.id)) {
          g.x+=(g.x-p.x)/(dist||1)*1.8;g.z+=(g.z-p.z)/(dist||1)*1.8;
        }
      }
      for(const b of this.projectiles) {
        b.px=b.x;b.pz=b.z;b.x+=b.vx*dt;b.z+=b.vz*dt;b.life-=dt;
        if(distance(b,p)<.72){b.life=0;this.hurt(b.damage,'zap');}
      }
      this.projectiles=this.projectiles.filter(b=>b.life>0&&Math.abs(b.x)<45&&b.z>-30&&b.z<180);
      for(const list of [this.zaps,this.sparks])for(const effect of list)effect.life-=dt;
      this.zaps=this.zaps.filter(e=>e.life>0);this.sparks=this.sparks.filter(e=>e.life>0);
      if(this.state!=='playing')return;
      if(!this.waveCleared&&this.guards.every(g=>!g.alive)) {
        this.waveCleared=true;this.clue={x:clamp(p.x,-9,9),z:p.z+5.5};this.emit('clueReady');
      }
      if(this.clue&&distance(p,this.clue)<1.5) {
        this.files++;this.score+=250;this.clue=null;p.health=Math.min(100,p.health+20);this.emit('collect',{files:this.files});
        if(this.files===3){this.state='won';this.emit('won');}
        else {this.guards=[];this.spawnWave();}
      }
    }
  }
  return {Mission,characters,distance};
});
