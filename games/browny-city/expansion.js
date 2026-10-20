(() => {
  'use strict';
  const M = window.BrownyCityModel;
  M.buildings.push(
    { id: 'pets', section: 2, name: 'Pets at Home', person: 'Poppy', action: 'meet the pets and choose a companion', price: 10, repeatable: true, x: 350, y: 90, w: 400, h: 150, color: '#a6b987' },
    { id: 'spocco', section: 2, name: 'Spocco Square', person: 'Coach Mia', action: 'play tennis, running races and football', price: 100, repeatable: true, x: 350, y: 485, w: 400, h: 245, color: '#cf986c' },
    { id: 'museum', section: 2, name: 'Browny Museum', person: 'Dr Clay', action: 'look at ancient objects and old-fashioned treasures', price: 15, repeatable: true, x: 100, y: 1100, w: 240, h: 160, color: '#bba683' },
    { id: 'market', section: 2, name: 'The Toy & Book Shop', person: 'Leila', action: 'shop for toys, books and food', price: 15, repeatable: true, x: 430, y: 1080, w: 260, h: 170, color: '#cc9e87' },
    { id: 'castle', section: 2, name: 'Browny Castle', person: 'Sir Rowan', action: 'explore the castle rooms and balcony', price: 10, repeatable: true, x: 800, y: 1040, w: 240, h: 230, color: '#a4a5a2' }
  );
  Object.assign(M.interiors, {
    pets: { title: 'Pets at Home · Meet your new friend', service: 'Meet the pets', floor: '#dfd1aa', wall: '#b9c5a0', props: [['counter',450,245,200,80],['petBed',170,285,170,110],['petBed',760,285,170,110],['petBed',170,505,170,110],['shelf',760,505,170,100]] },
    spocco: { title: 'Spocco Square · Sports clubhouse', service: 'Choose a sport', floor: '#d5bd93', wall: '#88aaa0', props: [['counter',450,245,200,80],['trophy',170,280,170,110],['trophy',760,280,170,110],['seat',170,530,170,70],['seat',760,530,170,70]] },
    museum: { title: 'Browny Museum · Journeys through time', service: 'Explore the exhibits', floor: '#d2c4ad', wall: '#a5b3ae', props: [['counter',450,245,200,80],['artefact',170,275,170,125],['artefact',760,275,170,125],['artefact',170,505,170,125],['artefact',760,505,170,125]] },
    market: { title: 'Toys, stories and tasty things', service: 'Browse the shop', floor: '#decaa8', wall: '#cba28b', props: [['counter',450,245,200,80],['toys',170,280,170,100],['books',760,280,170,100],['shelf',170,505,170,100],['shelf',760,505,170,100]] },
    castle: { title: 'Browny Castle · The great hall', service: 'Explore castle rooms', floor: '#b9b3a3', wall: '#989d99', props: [['counter',450,245,200,80],['banner',170,240,130,150],['banner',800,240,130,150],['seat',170,530,170,70],['seat',760,530,170,70]] }
  });
  const castleRooms = {
    hall: M.interiors.castle,
    dungeon: { title: 'Browny Castle · The dungeon', service: 'Choose a castle room', floor: '#9c9d98', wall: '#707d7d', props: [['bars',150,245,220,150],['bars',730,245,220,150],['barrel',175,520,140,100],['barrel',780,520,140,100]] },
    dining: { title: 'Browny Castle · The dining room', service: 'Choose a castle room', floor: '#c5a484', wall: '#bcb09a', props: [['banquet',180,270,170,330],['banquet',750,270,170,330],['banner',470,210,160,90]] },
    balcony: { title: 'Browny Castle · What a view!', service: 'Choose a castle room', floor: '#d2cdb8', wall: '#c4ddcf', props: [['railing',140,215,820,65],['plant',175,530,60,65],['plant',865,530,60,65]] }
  };
  const pets = [
    { id: 'dog', name: 'Pippin', kind: 'Dog', color: '#b98050', description: 'A cheerful dog who loves a walk through town.' },
    { id: 'cat', name: 'Clover', kind: 'Cat', color: '#8b929b', description: 'A curious cat who likes to explore beside Bob.' },
    { id: 'rabbit', name: 'Pudding', kind: 'Rabbit', color: '#eee4d0', description: 'A gentle rabbit with long ears and a bouncy hop.' }
  ];
  const items = [
    { id: 'toyTrain', category: 'Toys', name: 'Wooden toy train', price: 8, bag: 'toys' },
    { id: 'teddy', category: 'Toys', name: 'Cuddly teddy bear', price: 6, bag: 'toys' },
    { id: 'adventure', category: 'Books', name: 'The Portal Adventure', price: 5, bag: 'books' },
    { id: 'nature', category: 'Books', name: 'Big Book of Animals', price: 7, bag: 'books' },
    { id: 'sandwich', category: 'Food', name: 'Picnic sandwich', price: 4, bag: 'food' },
    { id: 'apple', category: 'Food', name: 'Crunchy apple', price: 2, bag: 'food' }
  ];
  const exhibits = [
    ['An ancient Egyptian jar', 'Ancient Egypt', 'A museum replica of a clay storage jar. Look at its rounded body, narrow neck and painted bands. Jars held food and liquids.'],
    ['A Greek amphora', 'Ancient Greece', 'Two handles and a pointed base make this replica amphora easy to recognise. Amphorae were used for storing and transporting goods such as oil and wine.'],
    ['A Roman jug', 'Ancient Rome', 'A replica jug with a pouring lip and one handle. Imagine it standing on a table in a Roman home.'],
    ['A medieval goblet', 'The Middle Ages', 'A replica drinking cup on a tall stem. Look for the patterns around its rim and imagine a feast in the castle dining room.'],
    ['A Victorian clock', 'Victorian times', 'A model mantel clock with a decorative case. Compare it with the clocks and watches people use today.'],
    ['An old-fashioned toy', 'A toy from the past', 'A little wooden horse on wheels. Toys can help us imagine how children played before computers and electronic games.']
  ];
  const conversations = [
    ['Have you seen the castle balcony?', 'Yes! What a view over Browny City!'],
    ['I am practising my tennis serve.', 'Meet me at Spocco Square later!'],
    ['That museum vase has two handles.', 'I liked the old-fashioned clock.'],
    ['Pippin would love a walk today.', 'Pets at Home has a rabbit too!'],
    ['Shall we race around the track?', 'Only after I finish my sandwich!'],
    ['I bought a book about animals.', 'I am saving up for a toy train.'],
    ['The bank helped with my shopping.', 'I earned money doing a job.'],
    ['Are you a goalie or a striker?', 'I like defending. What about you?']
  ];
  const routes = {
    1: [[550,300],[550,490],[550,720],[550,940],[80,480],[1030,560],[100,750],[1020,810],[500,1230],[1030,1300],[70,1190]],
    2: [[550,300],[80,520],[1050,520],[550,820],[550,1020],[365,1180],[735,1200],[75,1320],[1030,1320],[280,570],[820,570]]
  };
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const available = (section,x,y) => !M.buildings.some(b => (b.section || 1) === section && x > b.x-17 && x < b.x+b.w+17 && y > b.y-17 && y < b.y+b.h+17);
  function initialise(town, saved = {}) {
    town.section = 1; town.travelCooldown = 0; town.travelNotice = '';
    for (const key of ['toys','books','food','medals']) town.bag[key] = Number.isSafeInteger(saved.bag?.[key]) ? clamp(saved.bag[key],0,999) : 0;
    town.ownedPets = Array.isArray(saved.ownedPets) ? [...new Set(saved.ownedPets.filter(id => pets.some(p => p.id === id)))] : [];
    town.pet = town.ownedPets.includes(saved.pet) ? saved.pet : null;
    town.petPosition = { x: town.player.x-30, y: town.player.y+20 };
    town.residents = Array.from({length:24},(_,i) => {
      const section = i < 12 ? 1 : 2, p = routes[section][Math.floor((i % 12) / 2)];
      return { name: ['Leila','Mary','Finn','Ruby','Theo','Mia','Alex','Nina','Sam','Jo','Arlo','Bea'][i%12], section, x:p[0]+i%2*33, y:p[1], shirt:['#748eaa','#bd846b','#9d88ad','#88a67c'][i%4], mode:'wait', timer:1+i%5, target:0, speech:'', partner:-1, moving:false };
    });
    town.squareCars = Array.from({length:5},(_,i) => ({ distance:i*465, x:0,y:0,dir:1,angle:0,speed:112,color:['#d9755f','#5d8f9e','#e4bc56'][i%3],moving:false }));
    stepTraffic(town,0); return town;
  }
  function snapshot(town) { return { ownedPets:[...town.ownedPets],pet:town.pet }; }
  function room(town) { return town.room?.id === 'castle' ? castleRooms[town.room.zone || 'hall'] : null; }
  function changeRoom(town, zone) {
    if (town.room?.id !== 'castle' || !castleRooms[zone]) return false;
    town.room.zone=zone; town.player={x:550,y:615}; resetPet(town); return true;
  }
  function resetPet(town) { town.petPosition={x:town.player.x-30,y:town.player.y+20}; }
  function travel(town, dx, dy) {
    if (town.time < town.travelCooldown) return false;
    const x=town.player.x+dx,y=town.player.y+dy;
    if (x>=22 && x<=M.W-22 && y>=28 && y<=M.H-24) return false;
    town.section=town.section===2?1:2;
    town.player={x:x<22?M.W-48:x>M.W-22?48:clamp(x,48,M.W-48),y:y<28?M.H-48:y>M.H-24?48:clamp(y,48,M.H-48)};
    town.travelCooldown=town.time+1; town.travelNotice=`Welcome to Section ${town.section}${town.section===2?' · Spocco Square and the castle!':' · Home and the town centre!'}`; resetPet(town); return true;
  }
  function roadPoint(distance) {
    const d=((distance%2580)+2580)%2580;
    if(d<700)return {x:200+d,y:350,angle:0};
    if(d<1290)return {x:900,y:350+d-700,angle:Math.PI/2};
    if(d<1990)return {x:900-(d-1290),y:940,angle:Math.PI};
    return {x:200,y:940-(d-1990),angle:-Math.PI/2};
  }
  function stepTraffic(town,dt) {
    const green=M.lights(town).cars==='green';
    for(const car of town.squareCars){car.moving=green&&dt>0;if(green)car.distance=(car.distance+car.speed*dt)%2580;Object.assign(car,roadPoint(car.distance));if(town.section===2&&!town.room&&car.moving&&Math.hypot(town.player.x-car.x,town.player.y-car.y)<43)town.dead=true;}
  }
  function stepPeople(town,dt) {
    if (town.room) { followPet(town,dt); return; }
    for(let i=0;i<town.residents.length;i++){
      const p=town.residents[i]; if(p.section!==town.section)continue;
      p.timer-=dt;p.moving=false;
      if(p.timer<=0){
        const neighbour=town.residents.find((n,j)=>j!==i&&n.section===p.section&&n.mode!=='chat'&&Math.hypot(n.x-p.x,n.y-p.y)<145);
        if(neighbour && Math.random()<.65){const lines=conversations[Math.floor(Math.random()*conversations.length)];p.mode=neighbour.mode='chat';p.speech=lines[0];neighbour.speech=lines[1];p.timer=neighbour.timer=6+Math.random()*4;}
        else{p.mode=Math.random()<.22?'wait':'walk';p.timer=4+Math.random()*5;p.speech='';p.target=Math.floor(Math.random()*routes[p.section].length);}
      }
      if(p.mode==='walk'){
        const [tx,ty]=routes[p.section][p.target],dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||1,speed=34*dt;
        let nx=p.x+dx/d*Math.min(speed,d),ny=p.y+dy/d*Math.min(speed,d);
        if(available(p.section,nx,p.y))p.x=nx;else if(available(p.section,p.x,ny))p.y=ny;
        if(available(p.section,p.x,ny))p.y=ny;
        p.moving=d>5;if(d<10)p.timer=0;
      }
    }
    followPet(town,dt);
  }
  function followPet(town,dt){if(!town.pet)return;const p=town.petPosition,dx=town.player.x-30-p.x,dy=town.player.y+20-p.y,d=Math.hypot(dx,dy)||1;if(d>180)resetPet(town);else if(d>10){p.x+=dx/d*Math.min(d,210*dt);p.y+=dy/d*Math.min(d,210*dt);}}
  function choosePet(town,id){if(town.room?.id!=='pets'||!pets.some(p=>p.id===id))return false;if(!town.ownedPets.includes(id))town.ownedPets.push(id);town.pet=id;resetPet(town);return true;}
  function purchase(town,id){const item=items.find(i=>i.id===id);if(town.room?.id!=='market'||!item||town.cash<item.price||town.bag[item.bag]>=999)return false;town.cash-=item.price;town.spent.market+=item.price;town.bag[item.bag]++;return true;}
  window.BrownyCityExpansion={initialise,snapshot,room,changeRoom,resetPet,travel,roadPoint,stepTraffic,stepPeople,pets,items,exhibits,castleRooms,choosePet,purchase};
})();
