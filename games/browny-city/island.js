(() => {
  'use strict';
  const M=window.BrownyCityModel,E=window.BrownyCityExpansion;
  const sections=[3,2,1],roadY=1000;
  function arrive(town,section,x,y,message){
    y=Math.max(48,Math.min(M.H-48,y));
    for(let i=0;i<5;i++){const b=M.buildings.find(b=>(b.section||1)===section&&x>b.x-18&&x<b.x+b.w+18&&y>b.y-18&&y<b.y+b.h+18);if(!b)break;y=b.y+b.h+32<M.H-32?b.y+b.h+32:b.y-32;}
    town.section=section;town.player={x,y};town.travelCooldown=town.time+1;town.travelNotice=message;E.resetPet(town);return true;
  }
  E.travel=(town,dx,dy)=>{
    if(town.time<town.travelCooldown)return false;
    const x=town.player.x+dx,west=x<22,east=x>M.W-22;
    if(!west&&!east)return false; // Top and bottom edges never change sections.
    if(town.atSea){if(!west)return false;town.atSea=false;return arrive(town,3,800,1180,'Back at the beach. Head left to Spocco Square.');}
    if(town.section===3){
      if(west)return arrive(town,2,48,town.player.y,'Welcome to Section Two · Spocco Square!');
      town.atSea=true;return arrive(town,3,550,650,'Splash! Open sea. Swim left off this area to return to the beach.');
    }
    const column=sections.indexOf(town.section),next=column+(east?1:-1);
    if(next>=sections.length)return false;
    const section=sections[next];return arrive(town,section,section===3?48:east?48:M.W-48,town.player.y,`Welcome to Section ${section} · ${section===1?'Town centre':section===2?'Spocco Square':'The coast and beach'}!`);
  };
  function roads(ctx,section){
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(0,roadY);ctx.lineTo(M.W,roadY);
    if(section===1){ctx.moveTo(60,roadY);ctx.lineTo(60,1090);ctx.moveTo(75,725);ctx.lineTo(75,roadY);}else if(section===2){ctx.moveTo(550,940);ctx.lineTo(550,roadY);}else{ctx.moveTo(255,810);ctx.lineTo(255,roadY);}
    ctx.strokeStyle='#e5dcc3';ctx.lineWidth=94;ctx.stroke();ctx.strokeStyle='#68746e';ctx.lineWidth=64;ctx.stroke();ctx.setLineDash([28,25]);ctx.strokeStyle='#f6edcc';ctx.lineWidth=3;ctx.stroke();ctx.restore();
  }
  function sign(ctx,x,y,width,label,direction=1){
    ctx.save();ctx.translate(x,y);const h=42;
    ctx.fillStyle='#523b2a';ctx.fillRect(width/2-7,h-4,15,32);ctx.fillStyle='#ad7646';ctx.fillRect(width/2-3,h,7,25);
    ctx.beginPath();if(direction<0){ctx.moveTo(0,h/2);ctx.lineTo(18,0);ctx.lineTo(width,0);ctx.lineTo(width,h);ctx.lineTo(18,h);}else{ctx.moveTo(0,0);ctx.lineTo(width-18,0);ctx.lineTo(width,h/2);ctx.lineTo(width-18,h);ctx.lineTo(0,h);}ctx.closePath();ctx.fillStyle='#e3a45d';ctx.fill();ctx.strokeStyle='#503b2c';ctx.lineWidth=4;ctx.stroke();
    ctx.fillStyle='#f5c17c';ctx.fillRect(direction<0?22:6,5,width-30,5);ctx.fillStyle='#b57a43';for(let i=0;i<4;i++)ctx.fillRect(25+i*32,31-(i%2)*12,18,2);
    ctx.font='bold 13px Arial, sans-serif';ctx.textAlign='center';ctx.fillStyle='#382c20';ctx.fillText(label,width/2+(direction<0?5:-5),27,width-25);ctx.restore();
  }
  function signs(ctx,section){
    if(section===1)sign(ctx,18,885,170,'SPOCCO SQUARE',-1);
    if(section===2){sign(ctx,18,845,170,'THE COAST',-1);sign(ctx,912,845,170,'TOWN CENTRE',1);}
    if(section===3){sign(ctx,18,885,180,'SPOCCO SQUARE',-1);sign(ctx,927,885,155,'OPEN SEA',1);}
  }
  function outline(ctx){ctx.beginPath();ctx.moveTo(85,182);ctx.bezierCurveTo(95,104,210,86,355,103);ctx.bezierCurveTo(490,71,666,88,770,105);ctx.bezierCurveTo(907,91,1004,120,1034,193);ctx.bezierCurveTo(1085,315,1075,463,1015,548);ctx.bezierCurveTo(955,639,840,644,717,628);ctx.bezierCurveTo(571,662,425,629,321,637);ctx.bezierCurveTo(201,646,91,620,57,532);ctx.bezierCurveTo(14,432,34,264,85,182);ctx.closePath();}
  window.BrownyIsland={sections,roadY,roads,sign,signs,outline};
})();
