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

  }
  function people(ctx,town,h){const visible=town.residents.filter(p=>p.section===town.section);for(const p of visible){h.person(p.x,p.y,p.shirt,false,p.moving);if(Math.hypot(p.x-town.player.x,p.y-town.player.y)<180)h.text(p.name,p.x,p.y+31,11,'#4c604a');}
    const spoken=[];for(const p of visible){if(p.mode!=='chat'||!p.speech||spoken.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<160))continue;spoken.push(p);const candidate=town.residents[p.partner];const neighbour=candidate?.mode==='chat'&&candidate.partner===town.residents.indexOf(p)?candidate:null;const voice=neighbour&&Math.floor(town.time/3)%2?neighbour:p;const words=(voice.name+': '+voice.speech).split(' '),lines=[''];for(const w of words){if((lines.at(-1)+' '+w).length>32)lines.push(w);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+w;}const x=Math.max(125,Math.min(975,p.x)),y=p.y-76-lines.length*10;h.round(x-119,y,238,lines.length*17+16,9,'#fff9e8f5','#64765b');lines.forEach((line,i)=>h.text(line,x,y+19+i*17,12,'#384f3f'));}
    pet(ctx,town,h);
  }
  function map(ctx,town,{round,text,person}) {
    const M=window.BrownyCityModel;
    const I=window.BrownyIsland;
    ctx.fillStyle='#51bfd0';ctx.fillRect(0,0,1100,760);
    ctx.strokeStyle='#bcecf0';ctx.lineWidth=2;
    for(let y=35;y<760;y+=65)for(let x=20;x<1100;x+=90){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+10,y+6,x+22,y);ctx.stroke();}
    text('BROWNY ISLAND',550,39,31,'#174f60');
    ctx.save();ctx.translate(0,10);I.outline(ctx);ctx.fillStyle='#22879b55';ctx.fill();ctx.restore();
    I.outline(ctx);ctx.strokeStyle='#c8f4ed';ctx.lineWidth=60;ctx.stroke();ctx.strokeStyle='#f6dfa7';ctx.lineWidth=48;ctx.stroke();ctx.fillStyle='#b7d191';ctx.fill();
    ctx.save();I.outline(ctx);ctx.clip();
    // One continuous promenade meets all three road networks at world y=1000.
    ctx.lineCap='round';ctx.beginPath();ctx.moveTo(70,455);ctx.lineTo(1020,455);ctx.strokeStyle='#e7dcc1';ctx.lineWidth=25;ctx.stroke();ctx.strokeStyle='#68746e';ctx.lineWidth=17;ctx.stroke();
    let bobPoint;
    const order=[3,2,1];
    for (const [column,section] of order.entries()) {
      const left=70+column*310, active=town.section===section;
      I.sign(ctx,left+38,120,230,['SECTION ONE','SECTION TWO','SECTION THREE'][section-1],section===3?-1:1);
      const scale=.265,ox=left+15,oy=190;
      ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.beginPath();ctx.rect(0,0,M.W,M.H);ctx.clip();

      for(let i=0;i<180;i++){ctx.fillStyle=i%2?'#cfdfa3':'#a4c483';ctx.fillRect((i*137+25)%1100,(i*227+51)%1400,5,4);}
      ctx.strokeStyle='#e9ddbd';ctx.lineWidth=66;ctx.lineCap='round';ctx.beginPath();
      if(section===1){
        ctx.moveTo(550,45);ctx.lineTo(550,980);
        for(const b of M.buildings.filter(b=>(b.section||1)===1&&!b.northDoor)){const d=M.door(b);ctx.moveTo(d.x,d.y);ctx.lineTo(550,d.y);}
        ctx.stroke();ctx.fillStyle='#e6ddc5';ctx.fillRect(0,980,M.W,220);ctx.fillStyle='#68746f';ctx.fillRect(0,1010,M.W,160);
        ctx.strokeStyle='#f7ead1';ctx.lineWidth=5;ctx.setLineDash([58,46]);ctx.beginPath();ctx.moveTo(0,1090);ctx.lineTo(M.W,1090);ctx.stroke();ctx.setLineDash([]);
        for(const x of [230,830])for(let y=1016;y<1164;y+=19){ctx.fillStyle='#fff6df';ctx.fillRect(x-38,y,76,10);}
        ctx.lineWidth=30;ctx.strokeStyle='#68746f';ctx.beginPath();ctx.roundRect(30,530,90,195,30);ctx.stroke();
      }else if(section===3){ctx.strokeStyle='#e7dcc1';ctx.lineWidth=130;ctx.beginPath();ctx.moveTo(255,0);ctx.lineTo(255,810);ctx.lineTo(0,810);ctx.stroke();ctx.strokeStyle='#68746e';ctx.lineWidth=96;ctx.stroke();ctx.strokeStyle='#f6edcc';ctx.lineWidth=4;ctx.setLineDash([35,38]);ctx.stroke();ctx.setLineDash([]);}
      else{
        ctx.moveTo(550,250);ctx.lineTo(550,1080);ctx.moveTo(90,1030);ctx.lineTo(1040,1030);ctx.stroke();
        ctx.strokeStyle='#e7dcc0';ctx.lineWidth=136;ctx.beginPath();ctx.roundRect(200,350,700,590,75);ctx.stroke();ctx.strokeStyle='#68746e';ctx.lineWidth=96;ctx.stroke();
        ctx.strokeStyle='#f7ebcc';ctx.lineWidth=4;ctx.setLineDash([35,38]);ctx.stroke();ctx.setLineDash([]);
        for(const y of [350,940])for(let sy=y-42;sy<y+45;sy+=17){ctx.fillStyle='#fff2d2';ctx.fillRect(510,sy,80,9);}
      }
      I.roads(ctx,section);
      const scenery=section===1?[[65,75],[550,115],[1040,90],[65,360],[1030,380],[570,540],[570,810],[1030,865],[80,875],[550,1340]]:section===2?[[100,90],[275,100],[825,100],[1020,170],[80,500],[1030,520],[80,790],[1020,810],[750,1030],[380,1335],[745,1340]]:[[80,125],[360,80],[60,980],[520,1260],[770,850]];
      for(const [x,y]of scenery)mapTree(x,y);
      const buildings=M.buildings.filter(b=>(b.section||1)===section);
      for(const b of buildings){
        if(b.id==='stall'){window.BrownyCoastView.stall(ctx,b,{round,text:()=>{}});continue;}
        round(b.x+10,b.y+14,b.w,b.h,10,'#44563b38');round(b.x,b.y,b.w,b.h,8,b.color,'#596750');
        ctx.fillStyle='#ffffff25';ctx.fillRect(b.x+5,b.y+5,b.w-10,20);
        const roof=b.id==='spocco'?'#527c7c':b.id==='garden'?'#5b8c64':'#826957';
        round(b.x-7,b.y-10,b.w+14,25,5,roof,'#5b6552');
        if(b.id==='castle')for(let x=b.x;x<b.x+b.w;x+=37)round(x,b.y-27,25,25,2,'#c0bfb1','#687366');
        for(const x of [b.x+14,b.x+b.w-44]){round(x,b.y+29,30,35,3,'#d9e9d8','#789285');ctx.fillStyle='#8db2ae';ctx.fillRect(x+13,b.y+30,4,33);}
        if(b.id==='spocco'){round(b.x+b.w/2-45,b.y+24,90,85,7,'#427f79');window.BrownyCoastView.logo(ctx,b.x+b.w/2-36,b.y+30,72);}
        if(b.id==='hospital'){ctx.fillStyle='#b65f5e';ctx.fillRect(b.x+b.w/2-7,b.y+23,14,38);ctx.fillRect(b.x+b.w/2-19,b.y+35,38,14);}
        if(b.id==='police')round(b.x+b.w/2-17,b.y-28,34,15,4,'#6c9dc6');
        if(b.id==='garden')for(let i=0;i<4;i++){round(b.x+18+i*73,b.y+22,57,36,3,'#b8d7af','#699a70');}
        const d=M.door(b);round(d.x-17,b.northDoor?b.y:b.y+b.h-25,34,25,3,'#69553c');
      }
      const cars=section===1?town.cars:section===2?town.squareCars:town.coastCars;
      for(const c of cars||[]){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(Number.isFinite(c.angle)?c.angle:c.dir<0?Math.PI:0);round(-36,-21,72,42,8,c.color,'#435347');round(-13,-15,26,30,4,'#b6d2cf');ctx.fillStyle='#405951';ctx.fillRect(-28,-25,15,7);ctx.fillRect(15,19,15,7);ctx.restore();}
      // A few tiny neighbours give the guide the same life as the streets.
      for(const p of town.residents.filter(p=>p.section===section)){ctx.fillStyle='#46584433';ctx.beginPath();ctx.ellipse(p.x,p.y+9,12,5,0,0,Math.PI*2);ctx.fill();round(p.x-8,p.y-16,16,23,4,p.shirt);round(p.x-6,p.y-30,12,14,4,'#edc69f');}
      ctx.restore();
      for(const b of buildings){
        const fontSize=b.id==='stall'?10:12;
        ctx.font=`bold ${fontSize}px Arial, sans-serif`;const lines=[''];
        for(const word of b.name.split(' ')){const i=lines.length-1,next=lines[i]?lines[i]+' '+word:word;if(ctx.measureText(next).width>b.w*scale-7&&lines[i])lines.push(word);else lines[i]=next;}
        const cy=b.id==='spocco'?b.y+b.h*.69:b.y+b.h*.62;
        lines.forEach((line,i)=>text(line,ox+(b.x+b.w/2)*scale,oy+cy*scale+(i-(lines.length-1)/2)*14+3,fontSize,'#263b2d'));
      }
      if(active){
        const x=ox+(town.atSea?-110:town.player.x)*scale,y=oy+(town.atSea?1280:town.player.y)*scale;
        // Bob keeps his face, hair, orange shirt, legs and saved accessories.
        // The larger figure stays clear even when the whole city is visible.
        bobPoint={x,y};
      }

    }
    ctx.restore();
    // Palm fringe, a small jetty and a boat make the outline read as an island.
    for(const [x,y]of [[109,537],[235,603],[469,621],[746,613],[985,560],[991,185],[95,200]])palm(x,y);
    ctx.fillStyle='#7b583b';ctx.fillRect(193,620,24,62);ctx.fillStyle='#c99b64';for(let y=621;y<679;y+=9)ctx.fillRect(190,y,30,6);
    ctx.save();ctx.translate(253,662);ctx.rotate(-.4);round(-10,-27,20,54,8,'#e8be64','#775d3c');round(-6,-17,12,32,4,'#fff1ce');ctx.restore();
    if(bobPoint){ctx.save();ctx.translate(bobPoint.x,bobPoint.y);ctx.scale(.72,.72);person(0,0,'#cc7350',true);ctx.restore();}
    text('Walk left and right between sections · Roads connect across the whole island',550,713,15,'#18576a');
    text(`Bob is in Section ${['One','Two','Three'][town.section-1]}${town.atSea?' · Swimming in the sea':''} · M · Back to Bob`,550,742,16,'#174c5f');
    function palm(x,y){ctx.strokeStyle='#9a7748';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x,y+17);ctx.quadraticCurveTo(x+8,y,x+2,y-17);ctx.stroke();for(let i=0;i<6;i++){const angle=i*Math.PI/3;ctx.strokeStyle=i%2?'#3d8d56':'#5aa85b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+2,y-17);ctx.quadraticCurveTo(x+Math.cos(angle)*17,y-22+Math.sin(angle)*17,x+Math.cos(angle)*26,y-15+Math.sin(angle)*21);ctx.stroke();}}
    function mapTree(x,y){round(x-5,y-2,10,28,2,'#957046');ctx.fillStyle='#486b3b22';ctx.beginPath();ctx.ellipse(x+7,y+18,30,10,0,0,Math.PI*2);ctx.fill();for(const [dx,dy,r,c]of [[0,-25,26,'#75a452'],[-15,-12,21,'#64964b'],[16,-14,19,'#83af5d']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+dx,y+dy,r,0,Math.PI*2);ctx.fill();}}
  }
  window.BrownyCityExpansionView={ground,people,pet,artefact,map};
})();
