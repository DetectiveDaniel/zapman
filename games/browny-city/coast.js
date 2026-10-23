(() => {
  'use strict';
  const M=window.BrownyCityModel,E=window.BrownyCityExpansion;
  M.buildings.push(
    {id:'police',section:3,name:'Police Station',person:'Officer Jade',action:'visit the police station',price:0,repeatable:true,x:390,y:185,w:230,h:180,color:'#91acbd'},
    {id:'trading',section:3,name:'JUMP TRADING',person:'Jamie',action:'search for a trade on the computer and earn money',price:30,repeatable:true,x:680,y:130,w:280,h:210,color:'#a6b2c2'},
    {id:'watches',section:3,name:'Watch Shop',person:'Kit',action:'choose a red, blue, green or yellow watch',price:15,repeatable:true,x:430,y:560,w:330,h:220,color:'#c6a286'},
    {id:'hospital',section:3,name:'Hospital',person:'Nurse May',action:'rest and recover at the hospital',price:0,repeatable:true,x:140,y:1040,w:300,h:240,color:'#e2c5ba'},
    {id:'stall',section:3,name:'Beach Stall',person:'Sunny',action:'try on sunglasses for the beach',price:0,repeatable:true,x:965,y:420,w:110,h:100,color:'#dfb96b'}
  );
  for(const [id,title,service,floor,wall,props] of [
    ['police','Browny Police · Here to help','Talk to Officer Jade','#c2cfd2','#7f9aaa',[['notices',170,250,170,170],['seat',760,500,170,70]]],
    ['trading','JUMP TRADING · Search desk','Use the computer','#b7c7bc','#92aaad',[['computer',170,280,180,120],['computer',750,280,180,120]]],
    ['watches','Watch Shop · Choose your colour','Choose a watch','#e1d0ad','#bb9c83',[['watchcase',170,280,180,120],['watchcase',750,280,180,120]]],
    ['hospital','Browny Hospital · Get well soon','Talk to Nurse May','#d5e3de','#9fbfbb',[['bed',170,270,180,290],['bed',750,270,180,290]]],
    ['stall','Beach Stall · Sunny days','Try on sunglasses','#e6d4a5','#d5b978',[['seat',170,500,170,70]]]
  ])M.interiors[id]={title,service,floor,wall,props:[['counter',450,245,200,80],...props]};
  const colors={red:'#e64a43',blue:'#368ee5',green:'#4aad65',yellow:'#f6cf38'};
  const init=E.initialise,snap=E.snapshot,oldPeople=E.stepPeople;
  E.initialise=(town,data={})=>{init(town,data);town.watch=Object.hasOwn(colors,data.watch)?data.watch:null;town.sunglasses=data.sunglasses===true;town.atSea=false;town.coastCars=[0,1,2].map(i=>({x:255,y:90+i*230,angle:Math.PI/2,speed:115,color:['#d9755f','#5d8f9e','#e4bc56'][i],moving:false}));return town;};
  E.snapshot=town=>({...snap(town),watch:town.watch,sunglasses:town.sunglasses});
  const shoreX=y=>1180-y*.26;
  const swimming=town=>!town.room&&town.section===3&&(town.atSea||(Math.abs(town.player.y-1000)>46&&town.player.x>shoreX(town.player.y)));
  const beach=town=>!town.room&&town.section===3&&(town.atSea||town.player.x>shoreX(town.player.y)-180);
  E.stepPeople=(town,dt)=>{if(town.section===3){if(town.pet)E.resetPet(town);return;}oldPeople(town,dt);};
  E.greeting=((old)=>town=>town.section===3?'The sea is lovely today, Bob! Enjoy your swim.':old(town))(E.greeting);
  function step(town,dt){const green=M.lights(town).cars==='green';for(const car of town.coastCars){car.moving=green&&!town.atSea&&dt>0;if(car.moving)car.y+=car.speed*dt;if(car.y>930)car.y=-70;if(car.moving&&!town.room&&Math.abs(town.player.x-car.x)<35&&Math.abs(town.player.y-car.y)<48)town.dead=true;}}
  function admit(town){town.dead=false;town.room=null;town.atSea=false;town.section=3;M.enterInterior(town,'hospital');E.resetPet(town);}
  function watch(town,color){if(town.room?.id!=='watches'||!Object.hasOwn(colors,color))return false;town.watch=color;return true;}
  function search(town,query){if(town.room?.id!=='trading'||town.room.used||typeof query!=='string'||!query.trim()||query.trim().length>80)return 0;town.room.used=true;town.cash=Math.min(1e9,town.cash+50);return 50;}
  const move=M.move,home=M.goHome,entrance=M.entrance,nearest=M.nearest;
  M.move=(town,dx,dy)=>{const speed=swimming(town) ? .6 : 1;move(town,dx*speed,dy*speed);};
  M.entrance=town=>town.atSea?null:entrance(town);M.nearest=town=>town.atSea?null:nearest(town);
  M.goHome=town=>{home(town);town.atSea=false;};
  window.BrownyCoast={colors,shoreX,swimming,beach,step,admit,watch,search};
})();
