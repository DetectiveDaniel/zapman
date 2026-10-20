(() => {
  'use strict';
  function artefact(ctx,index,x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};rect(-65,4,130,14,'#746f65');rect(-52,-5,104,12,'#eee0c3');
    if(index===4){rect(-31,-94,62,89,'#8c6048');rect(-38,-103,76,12,'#9e7154');ctx.fillStyle='#f2dfae';ctx.beginPath();ctx.arc(0,-60,23,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#473f38';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-60);ctx.lineTo(0,-78);ctx.moveTo(0,-60);ctx.lineTo(13,-53);ctx.stroke();}
    else if(index===5){rect(-35,-55,65,29,'#a87e52');rect(19,-80,22,35,'#a87e52');rect(-30,-26,10,18,'#a87e52');rect(16,-26,10,18,'#a87e52');for(const dx of [-25,24]){ctx.fillStyle='#5e5b51';ctx.beginPath();ctx.arc(dx,-6,10,0,Math.PI*2);ctx.fill();}}
    else if(index===3){rect(-10,-49,20,43,'#b49b5a');rect(-33,-12,66,7,'#b49b5a');ctx.fillStyle='#d2b86d';ctx.beginPath();ctx.ellipse(0,-68,34,30,0,0,Math.PI*2);ctx.fill();rect(-34,-92,68,9,'#ead29a');}
    else {ctx.fillStyle=['#b88052','#bb7251','#b09875'][index%3];ctx.beginPath();ctx.moveTo(-14,-99);ctx.lineTo(14,-99);ctx.bezierCurveTo(13,-65,43,-73,43,-39);ctx.bezierCurveTo(43,-9,23,-4,0,-4);ctx.bezierCurveTo(-23,-4,-43,-9,-43,-39);ctx.bezierCurveTo(-43,-73,-13,-65,-14,-99);ctx.fill();ctx.strokeStyle='#714d3e';ctx.lineWidth=6;for(const side of index===1?[-1,1]:[1]){ctx.beginPath();ctx.ellipse(side*36,-65,17,26,0,0,Math.PI*2);ctx.stroke();}rect(-18,-104,36,7,'#dfba7d');rect(-31,-40,62,7,'#e3bd80');rect(-27,-25,54,5,'#765c45');}
    ctx.restore();}
  function pet(ctx,town,{text},position=town.petPosition,id=town.pet,scale=1){const p=window.BrownyCityExpansion.pets.find(p=>p.id===id);if(!p)return;ctx.save();ctx.translate(position.x,position.y);ctx.scale(scale,scale);ctx.fillStyle='#2d45372b';ctx.beginPath();ctx.ellipse(0,9,18,7,0,0,Math.PI*2);ctx.fill();const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};const step=Math.sin(town.time*13)*2;rect(-13,-8,27,16,p.color);rect(-10,4,6,7+step,p.color);rect(6,4,6,7-step,p.color);rect(9,-19,17,16,p.color);rect(20,-13,10,7,p.color);rect(18,-16,3,3,'#303d37');
    if(id==='dog'){rect(9,-19,6,15,'#78543b');rect(-22,-13,12,5,p.color);}else if(id==='cat'){ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(9,-17);ctx.lineTo(10,-28);ctx.lineTo(17,-18);ctx.lineTo(21,-28);ctx.lineTo(26,-17);ctx.fill();rect(-19,-22,6,19,p.color);}else{rect(11,-38,5,23,p.color);rect(21,-38,5,23,p.color);rect(12,-35,2,15,'#d7a49e');rect(-18,-5,9,9,'#fff3d9');}
    ctx.restore();if(id===town.pet&&Math.hypot(position.x-town.player.x,position.y-town.player.y)<100)text(p.name,position.x,position.y+28,11,'#3b5541');}
  function ground(ctx,town,{round,text,tree}){
    ctx.strokeStyle='#e5dcc5';ctx.lineWidth=140;ctx.beginPath();ctx.roundRect(200,350,700,590,75);ctx.stroke();ctx.strokeStyle='#68746e';ctx.lineWidth=96;ctx.stroke();ctx.strokeStyle='#f7ebcc';ctx.lineWidth=3;ctx.setLineDash([35,38]);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#e3d6b8';ctx.fillRect(510,260,80,210);ctx.fillRect(510,758,80,330);ctx.fillRect(80,1005,960,55);
    for(const y of [350,940])for(let sy=y-42;sy<y+45;sy+=17){ctx.fillStyle='#fff2d2';ctx.fillRect(510,sy,80,9);}
    const signal=window.BrownyCityModel.lights(town);round(956,640,8,110,2,'#455e50');round(939,615,42,80,8,'#394c43');for(const [i,color]of ['red','amber','green'].entries()){ctx.fillStyle=signal.cars===color?{red:'#ec745b',amber:'#f7d377',green:'#90c47e'}[color]:'#687b67';ctx.beginPath();ctx.arc(960,630+i*25,8,0,Math.PI*2);ctx.fill();}round(925,740,100,28,6,signal.walk?'#416d51':'#a0614b');text(signal.walk?'WALK':'WAIT',975,760,15,'#fff1cf');
    for(const [x,y]of [[90,90],[290,100],[815,105],[1020,160],[85,370],[1030,370],[80,790],[1030,820],[70,1040],[750,1030],[385,1330],[745,1330]])tree(x,y);
    text('SECTION TWO',550,44,27,'#426442');text('SPOCCO SQUARE · PETS · MUSEUM · CASTLE',550,68,13,'#607c55');
    for(const [x,y,label]of [[550,1370,'↓ SECTION ONE · HOME'],[550,28,'↑ SECTION ONE'],[75,680,'← SECTION ONE'],[1020,680,'SECTION ONE →']])text(label,x,y,12,'#476440');
  }
  function people(ctx,town,h){const visible=town.residents.filter(p=>p.section===town.section);for(const p of visible){h.person(p.x,p.y,p.shirt,false,p.moving);if(Math.hypot(p.x-town.player.x,p.y-town.player.y)<180)h.text(p.name,p.x,p.y+31,11,'#4c604a');}
    const spoken=[];for(const p of visible){if(p.mode!=='chat'||!p.speech||spoken.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<160))continue;spoken.push(p);const neighbour=visible.find(q=>q!==p&&q.mode==='chat'&&Math.hypot(q.x-p.x,q.y-p.y)<145);const voice=neighbour&&Math.floor(town.time/3)%2?neighbour:p;const words=(voice.name+': '+voice.speech).split(' '),lines=[''];for(const w of words){if((lines.at(-1)+' '+w).length>32)lines.push(w);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+w;}const x=Math.max(125,Math.min(975,p.x)),y=p.y-76-lines.length*10;h.round(x-119,y,238,lines.length*17+16,9,'#fff9e8f5','#64765b');lines.forEach((line,i)=>h.text(line,x,y+19+i*17,12,'#384f3f'));}
    pet(ctx,town,h);
  }
  window.BrownyCityExpansionView={ground,people,pet,artefact};
})();
