(() => {
  'use strict';
  // Rounded white Spocco emblem: an open ring around the curved S track.
  function logo(ctx,x,y,size){
    ctx.save();ctx.translate(x+size/2,y+size/2);ctx.scale(size/100,size/100);
    ctx.strokeStyle='#fff';ctx.lineWidth=8;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(28,-34);ctx.bezierCurveTo(1,-54,-42,-33,-43,2);ctx.bezierCurveTo(-44,23,-30,36,-17,44);ctx.bezierCurveTo(-5,37,8,35,19,37);ctx.bezierCurveTo(43,30,51,-7,32,-27);ctx.stroke();
    ctx.beginPath();ctx.moveTo(29,-42);ctx.lineTo(-23,-12);ctx.bezierCurveTo(-38,-3,-27,13,-13,5);ctx.lineTo(13,-10);ctx.bezierCurveTo(27,-18,37,-2,23,6);ctx.lineTo(-9,24);ctx.bezierCurveTo(-22,32,-11,46,2,38);ctx.lineTo(19,28);ctx.bezierCurveTo(34,20,40,36,25,43);ctx.lineTo(4,48);ctx.stroke();
    ctx.restore();
  }
  function ground(ctx,town,{round,text,tree},mini=false){
    const C=window.BrownyCoast;
    if(town.atSea){ctx.fillStyle='#388eaa';ctx.fillRect(0,0,1100,1400);}
    else{
      ctx.fillStyle='#b9d294';ctx.fillRect(0,0,1100,1400);
      ctx.beginPath();ctx.moveTo(1100,0);ctx.lineTo(1100,1400);ctx.lineTo(C.shoreX(1400)-180,1400);ctx.lineTo(C.shoreX(0)-180,0);ctx.closePath();ctx.fillStyle='#ead39b';ctx.fill();
      ctx.beginPath();ctx.moveTo(1100,0);ctx.lineTo(1100,1400);ctx.lineTo(C.shoreX(1400),1400);ctx.lineTo(C.shoreX(0),0);ctx.closePath();ctx.fillStyle='#388eaa';ctx.fill();
      ctx.strokeStyle='#eee5ce';ctx.lineWidth=140;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(255,0);ctx.lineTo(255,810);ctx.lineTo(0,810);ctx.stroke();ctx.strokeStyle='#68746e';ctx.lineWidth=96;ctx.stroke();ctx.strokeStyle='#f7ebcc';ctx.lineWidth=4;ctx.setLineDash([35,38]);ctx.stroke();ctx.setLineDash([]);
      for(let x=215;x<300;x+=18){ctx.fillStyle='#fff3d4';ctx.fillRect(x,455,9,100);}
      if(!mini){
        const signal=window.BrownyCityModel.lights(town);round(320,470,38,70,7,'#394b43');for(const [i,c]of ['red','amber','green'].entries()){ctx.fillStyle=signal.cars===c?{red:'#ed765d',amber:'#f7d276',green:'#8bc978'}[c]:'#62776a';ctx.beginPath();ctx.arc(339,482+i*23,8,0,Math.PI*2);ctx.fill();}text(signal.walk?'WALK':'WAIT',365,570,18);
        for(const [x,y]of [[80,120],[360,90],[60,980],[510,1250],[770,850]])tree(x,y);
        text('SECTION THREE · THE COAST',650,50,25,'#3c6444');text('← SECTION TWO · ↑ SECTION TWO',650,80,15);
        text('BEACH',920,780,22,'#8c7348');text('SEA →',1015,1050,21,'#e6f7ec');
      }
    }
    ctx.strokeStyle='#c7edf0';ctx.lineWidth=3;
    for(let y=50;y<1400;y+=75){const start=town.atSea?0:Math.max(C.shoreX(y)+22,0);for(let x=start;x<1100;x+=90){ctx.beginPath();ctx.arc(x+Math.sin(town.time*1.7+y)*5,y,14,0,Math.PI);ctx.stroke();}}
    if(town.atSea&&!mini){text('BROWNY SEA',550,70,30,'#e9f7ed');text('Swim left or up off the edge to return to the beach.',550,100,17,'#e9f7ed');}
  }
  function stall(ctx,b,{round,text}){round(b.x,b.y+35,b.w,b.h-35,5,'#b38b5d','#635b47');for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#fff2c3':'#d98663';ctx.fillRect(b.x-8+i*(b.w+16)/5,b.y,(b.w+16)/5,38);}round(b.x+12,b.y+65,b.w-24,16,4,'#704e33');ctx.fillStyle='#253b42';ctx.fillRect(b.x+22,b.y+64,20,12);ctx.fillRect(b.x+53,b.y+64,20,12);ctx.fillRect(b.x+42,b.y+67,11,3);text('SUNGLASSES',b.x+b.w/2,b.y-12,13);text('0 · Sunny',b.x+b.w/2,b.y+b.h+32,13);}
  function accessories(ctx,town){if(town.watch){ctx.fillStyle=window.BrownyCoast.colors[town.watch];ctx.fillRect(8,-10,7,9);ctx.fillStyle='#f6f0cf';ctx.fillRect(10,-8,3,4);}if(town.sunglasses&&window.BrownyCoast.beach(town)){ctx.fillStyle='#182c38';ctx.fillRect(-8,-33,7,6);ctx.fillRect(1,-33,7,6);ctx.fillRect(-2,-32,4,2);}}
  function ripple(ctx,town){const{x,y}=town.player;ctx.fillStyle='#388eaa';ctx.fillRect(x-17,y-4,34,23);ctx.strokeStyle='#c8edf0';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+4,26+Math.sin(town.time*7)*3,7,0,0,Math.PI*2);ctx.stroke();}
  window.BrownyCoastView={logo,ground,stall,accessories,ripple};
})();
