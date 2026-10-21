(() => {
  'use strict';
  const buildings = [
    { id: 'school', name: 'School', person: 'Miss Maple', action: 'learn at school', price: 10, x: 100, y: 100, w: 310, h: 145, color: '#c98b66', icon: 'ABC' },
    { id: 'arcade', name: 'Game Arcade', person: 'Tim', action: 'play in the game arcade', price: 5, x: 650, y: 100, w: 340, h: 165, color: '#a08dbe', icon: '★' },
    { id: 'bank', name: 'Bank', person: 'Ben', action: 'collect money at the bank', price: 0, reward: 20, x: 230, y: 315, w: 230, h: 130, color: '#b8bba0', icon: '£' },
    { id: 'jobs', name: 'Jobs', person: 'Mary', action: 'pick a building and do a job', price: 15, x: 650, y: 350, w: 340, h: 145, color: '#d7ad68', icon: 'JOBS' },
    { id: 'race', name: 'Race Cars', person: 'Mr Buck', action: 'race cars', price: 10, x: 160, y: 535, w: 320, h: 155, color: '#87a7b4', icon: '01' },
    { id: 'pizza', name: 'Pizza Factory', person: 'Paolo', action: 'make a pizza', price: 15, x: 650, y: 585, w: 340, h: 175, color: '#d68b70', icon: 'PIZZA' },
    { id: 'garden', name: 'Greenhouse Garden', person: 'Rose', action: 'plant in the greenhouse garden', price: 0, reward: 5, x: 160, y: 790, w: 320, h: 140, color: '#8ab985', icon: 'GROW' },
    { id: 'home', name: 'Home', person: 'Bob', action: '', price: 0, x: 120, y: 1230, w: 220, h: 130, color: '#d49b7b', northDoor: true, icon: 'BOB' },
    { id: 'shop', name: "Sainsbury's", person: 'Sally', action: 'buy groceries', price: 15, x: 650, y: 1230, w: 340, h: 130, color: '#e2a355', northDoor: true, icon: 'SHOP' },
  ];
  const W = 1100, H = 1400, HOME = { x: 230, y: 1203 };
  const interiors = {
    home: { floor: '#d6b693', wall: '#e6c8a7', title: "Bob's cosy home", service: 'Relax at home', props: [
      ['sofa', 175, 285, 200, 95], ['table', 205, 435, 140, 65], ['bed', 785, 260, 160, 230], ['books', 450, 225, 200, 90], ['plant', 880, 555, 60, 65]] },
    school: { floor: '#ddcfac', wall: '#b6c7a1', title: 'The Browny classroom', service: 'Take a lesson', props: [
      ['board', 390, 190, 320, 50], ['desk', 465, 270, 170, 55], ['desk', 200, 420, 150, 70], ['desk', 200, 550, 150, 70], ['desk', 750, 420, 150, 70], ['desk', 750, 550, 150, 70]] },
    arcade: { floor: '#b6a5cc', wall: '#6f668b', title: 'Lights, buttons, high scores!', service: 'Play the star game', props: [
      ['counter', 450, 245, 200, 80], ['machine', 180, 280, 100, 125], ['machine', 180, 475, 100, 125], ['machine', 820, 280, 100, 125], ['machine', 820, 475, 100, 125]] },
    bank: { floor: '#cccab0', wall: '#9faf9c', title: 'Browny Bank', service: 'Collect your allowance', props: [
      ['counter', 330, 245, 440, 80], ['safe', 160, 240, 115, 150], ['safe', 825, 240, 115, 150], ['seat', 210, 500, 170, 70], ['plant', 865, 520, 65, 70]] },
    jobs: { floor: '#ddc49b', wall: '#bbaf8b', title: 'Find your next little job', service: 'Choose a job', props: [
      ['counter', 450, 245, 200, 80], ['notices', 180, 250, 170, 170], ['books', 760, 250, 170, 100], ['seat', 200, 520, 170, 70], ['seat', 750, 520, 170, 70]] },
    race: { floor: '#a3b5b5', wall: '#768d93', title: 'Browny Motor Club garage', service: 'Start your car race', props: [
      ['counter', 450, 245, 200, 80], ['car', 195, 350, 160, 230], ['car', 745, 350, 160, 230], ['tools', 155, 195, 200, 80], ['tools', 745, 195, 200, 80]] },
    pizza: { floor: '#e3c4a7', wall: '#c28e76', title: "Paolo's pizza kitchen", service: 'Make a pizza', props: [
      ['counter', 450, 245, 200, 80], ['oven', 175, 270, 170, 175], ['prep', 760, 300, 170, 145], ['table', 200, 540, 155, 65], ['table', 750, 540, 155, 65]] },
    shop: { floor: '#e1d9b9', wall: '#d5a35e', title: "Inside Sainsbury's", service: 'Buy your groceries', props: [
      ['counter', 450, 245, 200, 80], ['shelf', 170, 280, 180, 100], ['shelf', 170, 475, 180, 100], ['shelf', 750, 280, 180, 100], ['shelf', 750, 475, 180, 100]] },
    garden: { floor: '#c5d4ac', wall: '#85ac8e', title: 'Under the greenhouse roof', service: 'Plant flowers', props: [
      ['counter', 450, 245, 200, 80], ['planter', 175, 280, 180, 100], ['planter', 175, 485, 180, 100], ['planter', 745, 280, 180, 100], ['planter', 745, 485, 180, 100]] },
  };
  const roomService = { x: 550, y: 390 };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const safeMoney = value => Number.isSafeInteger(value) && value >= 0 && value <= 1e9 ? value : 0;
  function create(saved) {
    const data = saved && typeof saved === 'object' ? saved : {};
    const town = { section: 1, cash: data.version === 1 && Number.isSafeInteger(data.cash) && data.cash >= 0 && data.cash <= 1e9 ? data.cash : 500,
      spent: Object.fromEntries(buildings.map(b => [b.id, safeMoney(data.spent?.[b.id])])),
      bag: ['pizza', 'groceries', 'stars', 'lessons', 'flowers'].reduce((bag, key) => ({ ...bag, [key]: Math.min(999, safeMoney(data.bag?.[key])) }), {}),
      time: Number.isFinite(data.time) && data.time >= 0 ? Math.min(data.time, 1e9) : 0,
      bankReady: Number.isFinite(data.bankReady) && data.bankReady >= 0 ? Math.min(data.bankReady, 1e9) : 0,
      gardenReady: Number.isFinite(data.gardenReady) && data.gardenReady >= 0 ? Math.min(data.gardenReady, 1e9) : 0,
      player: { ...HOME }, dead: false, room: null,
      cars: [0, 1].flatMap(lane => [0, 1, 2].map(i => ({ x: 70 + i * 370 + lane * 90, y: lane ? 1123 : 1055, dir: lane ? -1 : 1, speed: 126 + i * 8, color: ['#d9755f', '#5d8f9e', '#e4bc56'][i], moving: false }))),
    };
    return window.BrownyCityExpansion ? window.BrownyCityExpansion.initialise(town, data) : town;
  }
  const getBuildings = town => buildings.filter(b => (b.section || 1) === (town.section || 1));
  const getInterior = town => window.BrownyCityExpansion?.room(town) || interiors[town.room.id];
  const snapshot = town => ({ version: 1, cash: town.cash, spent: { ...town.spent }, bag: { ...town.bag }, time: town.time, bankReady: town.bankReady, gardenReady: town.gardenReady, ...(window.BrownyCityExpansion?.snapshot(town) || {}) });
  const door = b => ({ x: b.x + b.w / 2, y: b.northDoor ? b.y - 24 : b.y + b.h + 26 });
  const nearest = town => getBuildings(town).filter(b => b.id !== 'home').find(b => { const d = door(b); return Math.hypot(town.player.x - d.x, town.player.y - d.y) < 76; }) || null;
  const entrance = town => !town.room ? getBuildings(town).find(b => { const d = door(b); return Math.hypot(town.player.x - d.x, town.player.y - d.y) < 76; }) || null : null;
  const atService = town => Boolean(town.room && Math.hypot(town.player.x - roomService.x, town.player.y - roomService.y) < 80);
  const atExit = town => Boolean(town.room && Math.abs(town.player.x - 550) < 70 && town.player.y > 600);
  function enterInterior(town, id) {
    const b = buildings.find(b => b.id === id);
    if (!b || !getBuildings(town).includes(b) || town.room || town.dead) return false;
    town.room = { id, outside: door(b), used: false };
    town.player = { x: 550, y: 615 }; window.BrownyCityExpansion?.resetPet(town);
    return true;
  }
  function exitInterior(town) {
    if (!town.room) return false;
    town.player = { ...town.room.outside }; town.room = null; window.BrownyCityExpansion?.resetPet(town); return true;
  }
  function blocked(town, x, y) { return (!town.atSea && getBuildings(town).some(b => x > b.x - 12 && x < b.x + b.w + 12 && y > b.y - 12 && y < b.y + b.h + 12)); }
  function move(town, dx, dy) {
    if (town.dead) return;
    if (town.room) {
      const props = getInterior(town).props;
      const furniture = (x, y) => props.some(([, px, py, w, h]) => x > px - 14 && x < px + w + 14 && y > py - 8 && y < py + h + 18);
      const x = clamp(town.player.x + dx, 100, 1000), y = clamp(town.player.y + dy, 210, 685);
      if (!furniture(x, town.player.y)) town.player.x = x;
      if (!furniture(town.player.x, y)) town.player.y = y;
      if (Math.abs(town.player.x - 550) < 55 && town.player.y >= 670) exitInterior(town);
      return;
    }
    if (window.BrownyCityExpansion?.travel(town, dx, dy)) return;
    const x = clamp(town.player.x + dx, 22, W - 22), y = clamp(town.player.y + dy, 28, H - 24);
    if (!blocked(town, x, town.player.y)) town.player.x = x;
    if (!blocked(town, town.player.x, y)) town.player.y = y;
  }
  function lights(town) {
    const phase = town.time % 28;
    return { cars: phase < 14 ? 'green' : phase < 17 ? 'amber' : 'red', walk: phase >= 19, remaining: Math.ceil(phase >= 19 ? 28 - phase : 19 - phase) };
  }
  function step(town, dt) {
    if (town.dead) return;
    dt = clamp(dt, 0, .04); town.time += dt;
    window.BrownyCityExpansion?.stepPeople(town, dt);
    if (town.section === 3) { window.BrownyCoast.step(town, dt); return; }
    if (town.section === 2) { window.BrownyCityExpansion.stepTraffic(town, dt); return; }
    const signal = lights(town);
    for (const car of town.cars) {
      let distance = car.speed * dt;
      if (signal.cars !== 'green') {
        for (const crossing of [230, 830]) {
          const stop = crossing - car.dir * 76;
          const until = (stop - car.x) * car.dir;
          if (until >= 0) distance = Math.min(distance, until);
        }
      }
      for (const other of town.cars) {
        if (other === car || other.dir !== car.dir) continue;
        const gap = (other.x - car.x) * car.dir;
        if (gap > 0) distance = Math.min(distance, Math.max(0, gap - 100));
      }
      car.moving = distance > .01;
      car.x += distance * car.dir;
      if (car.x > W + 100) car.x = -100;
      if (car.x < -100) car.x = W + 100;
      if (!town.room && car.moving && Math.abs(town.player.x - car.x) < 45 && Math.abs(town.player.y - car.y) < 28) town.dead = true;
    }
  }
  function pay(town, id) {
    const b = buildings.find(b => b.id === id);
    if (!b || town.cash < b.price) return false;
    town.cash -= b.price; town.spent[id] += b.price; return true;
  }
  function completeJob(town, id) {
    const amount = town.spent[id];
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    town.cash += amount; town.spent[id] = 0; return amount;
  }
  function collect(town, id) {
    const bank = id === 'bank';
    if (!bank && id !== 'garden') return 0;
    const ready = bank ? 'bankReady' : 'gardenReady';
    if (town.time < town[ready]) return 0;
    const amount = bank ? 20 : 5;
    town.cash += amount; town[ready] = town.time + (bank ? 30 : 20);
    if (!bank) town.bag.flowers += 1;
    return amount;
  }
  function goHome(town) { town.player = { ...HOME }; town.dead = false; town.room = null; town.section = 1; window.BrownyCityExpansion?.resetPet(town); }
  window.BrownyCityModel = { buildings, interiors, getBuildings, getInterior, roomService, W, H, HOME, create, snapshot, door, nearest, entrance, atService, atExit, enterInterior, exitInterior, move, lights, step, pay, completeJob, collect, goHome };
})();
