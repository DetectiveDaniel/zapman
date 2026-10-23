(() => {
  'use strict';
  const M = window.BrownyCityModel;
  const audio = window.BrownyAudio;
  const canvas = document.querySelector('#city'), ctx = canvas.getContext('2d');
  const activity = document.querySelector('#activity'), body = document.querySelector('#activityBody');
  const buttons = document.querySelector('#activityButtons'), raceDialog = document.querySelector('#raceDialog');
  const raceFrame = document.querySelector('#raceFrame'), keys = new Set(), pointers = new Map();
  const saveKey = 'zapman-browny-city-v1';
  const mainMenu=document.querySelector('#mainMenu');
  let saved;
  try { saved = JSON.parse(localStorage.getItem(saveKey)); } catch { /* Start at home if storage is unavailable. */ }
  let town = M.create(saved), overview = false, lastFrame = 0, arcade = null, raceEligible = false;
  let cameraY = 0, walking = 0, sports = null, expansionUI = null;
  const $ = selector => document.querySelector(selector);
  const cash = amount => `£${amount.toLocaleString('en-GB')}`;
  const el = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
  function say(text) { $('#message').textContent = text; }
  function refresh() {
    $('#cash').textContent = cash(town.cash);
    const names = { pizza: 'pizza', groceries: 'groceries', stars: 'arcade stars', lessons: 'school stickers', flowers: 'flowers', toys: 'toys', books: 'books', food: 'snacks', medals: 'sports medals' };
    $('#bag').textContent = 'Bag: ' + (Object.entries(town.bag).filter(([, n]) => n > 0).map(([key, n]) => `${n} ${names[key] || key}`).join(' · ') || 'empty') + (town.pet ? ` · Companion: ${window.BrownyCityExpansion.pets.find(p => p.id === town.pet).name}` : '');
  }
  function save() {
    refresh();
    try { localStorage.setItem(saveKey, JSON.stringify(M.snapshot(town))); } catch { say('Storage is unavailable. Your progress will last for this visit.'); }
  }
  function closeActivity() { arcade = null; activity.close(); keys.clear(); canvas.focus(); }
  function show(title, person, description, actions = []) {
    arcade = null; keys.clear();
    $('#activityTitle').textContent = title; $('#speaker').textContent = person;
    body.replaceChildren(el('p', description)); buttons.replaceChildren();
    for (const [label, fn] of actions) { const button = el('button', label); button.type = 'button'; button.addEventListener('click', fn); buttons.append(button); }
    if (!activity.open) activity.showModal();
  }
  function done(title, description) {
    audio?.effect(title === 'Time is up!' ? 'error' : 'success');
    if (town.room && M.buildings.find(b => b.id === town.room.id).price && !M.buildings.find(b => b.id === town.room.id).repeatable) town.room.used = true;
    save(); say(description);
    show(title, 'A DAY IN BROWNY CITY', description, [[town.room ? 'Back inside' : 'Back to town', closeActivity]]);
  }
  function promptBuilding() {
    if (town.dead || mainMenu.open || activity.open || raceDialog.open || sports?.isOpen) return;
    audio?.effect('talk');
    if (town.room) {
      if (M.atExit(town)) { leaveInterior(); return; }
      const building = M.buildings.find(b => b.id === town.room.id);
      if (!M.atService(town)) { say(`Walk to ${building.id === 'home' ? 'the reading spot' : building.person + "'s counter"}, then press 0. The exit is at the bottom.`); return; }
      if (town.room.used && building.price && !building.repeatable) { show('Visit complete', building.person, 'You have finished this paid visit. You can explore, or leave through the exit. A new visit costs the usual entry price.', [['Back inside', closeActivity]]); return; }
      startActivity(building); return;
    }
    const building = M.entrance(town);
    if (!building) { const neighbour = town.residents?.find(p => p.section === town.section && Math.hypot(p.x-town.player.x,p.y-town.player.y)<80); if (neighbour) { show('Hello, Bob!', neighbour.name.toUpperCase(), window.BrownyCityExpansion.greeting(town), [['Nice chatting!',closeActivity]]); return; } say('Walk near a building’s front door, then press 0 to go inside.'); return; }
    if (building.id === 'stall') { expansionUI.handle(building); return; }
    if (building.id === 'home') { enter(building); return; }
    const price = building.price ? `Entry costs ${cash(building.price)}.` : building.reward ? `You can earn ${cash(building.reward)}.` : 'Free entry.';
    show(building.name, `${building.person} SAYS…`, `Do you want to go and do: ${building.action}? ${price}`, [['YES', () => enter(building)], ['NO', closeActivity]]);
  }
  function enter(building) {
    if (town.room || town.dead) return;
    if (!M.pay(town, building.id)) { audio?.effect('error'); show('Not enough cash', building.person, `You need ${cash(building.price)}. Visit the bank or earn £5 in the greenhouse garden.`, [['Back to town', closeActivity]]); return; }
    audio?.effect(building.price ? 'buy' : 'door');
    M.enterInterior(town, building.id); overview = false; closeActivity(); syncRoom(); save();
    say(building.id === 'home' ? 'Welcome home, Bob! Explore your room, or press 0 at the reading spot to relax.' : `Inside ${building.name}. Walk to ${building.person}, then press 0. Entry paid once for this visit.`);
  }
  function syncRoom() {
    $('#leaveBuilding').hidden = !town.room;
    $('#mapButton').disabled = Boolean(town.room);
    $('#mapButton').setAttribute('aria-pressed', String(overview));
    $('#mapButton').textContent = overview ? 'M · Follow Bob' : 'M · Town map';
  }
  function leaveInterior() {
    if (!M.exitInterior(town)) return;
    audio?.effect('door');
    keys.clear(); syncRoom(); save(); canvas.focus(); say('Back outside. Where will Bob go next?');
  }
  function startActivity(building) {
    if (expansionUI?.handle(building)) return;
    if (building.id === 'home') {
      done('Home sweet home', 'Bob puts his feet up with a good book. Your cash, bag and receipts are safe.'); return;
    }
    if (building.id === 'bank') {
      const amount = M.collect(town, 'bank');
      if (amount) done('Money in your pocket!', `Ben gives Bob ${cash(amount)}. Come back after 30 seconds in town for another allowance.`);
      else show('The bank is resting', 'BEN', `Your next ${cash(20)} is ready after ${Math.ceil(town.bankReady - town.time)} more seconds of walking around.`, [['Back inside', closeActivity]]);
      return;
    }
    if (building.id === 'garden' && town.time < town.gardenReady) {
      show('Let the flowers grow', 'ROSE', `Come back after ${Math.ceil(town.gardenReady - town.time)} more seconds of walking around.`, [['Back inside', closeActivity]]); return;
    }
    switch (building.id) {
      case 'school': school(); break;
      case 'arcade': startArcade(); break;
      case 'jobs': chooseJob(); break;
      case 'race': openRace(); break;
      case 'pizza': tasks('Make a pizza', 'PAOLO', ['Knead the dough', 'Spread the tomato sauce', 'Bake the pizza'], () => { town.bag.pizza++; done('Pizza, freshly baked!', 'Bob made a pizza! It is now in your bag.'); }); break;
      case 'shop': tasks("Sainsbury's", 'SALLY', ['Put bread in the basket', 'Add apples and milk', 'Pack your groceries'], () => { town.bag.groceries++; done('Shopping sorted!', 'Your £15 grocery bag is packed. Bob is ready for the rest of his day.'); }); break;
      case 'garden': garden(); break;
    }
  }
  function school() {
    const questions = [{ text: 'Bob has 7 apples and buys 5 more. How many apples?', choices: [10, 12, 14], answer: 12 }, { text: 'What is 6 × 3?', choices: [18, 21, 9], answer: 18 }, { text: 'Bob spends £15 from £50. How much is left?', choices: [25, 40, 35], answer: 35 }];
    const question = questions[Math.floor(Math.random() * questions.length)];
    show('A little lesson', 'MISS MAPLE', question.text, question.choices.map(answer => [String(answer), () => {
      if (answer === question.answer) { town.bag.lessons++; done('Gold star, Bob!', 'Correct! Miss Maple gives you a school sticker.'); }
      else { audio?.effect('error'); body.querySelector('p').textContent = `Try again, Bob! ${question.text}`; }
    }]));
  }
  function tasks(title, person, steps, complete) {
    let step = 0;
    const render = () => {
      show(title, person, `Step ${step + 1} of ${steps.length}. ${steps[step]}.`, [[steps[step], () => { step++; if (step === steps.length) complete(); else render(); }]]);
    };
    render();
  }
  function chooseJob() {
    show('Where will Bob work?', 'MARY · JOBS DESK', 'Pick a building. Finish its three work tasks to get back the money you have spent there. Each receipt is paid once. The £15 Jobs entry is recorded at the Jobs office.');
    const list = el('div', '', 'choice-list');
    for (const building of M.buildings.filter(b => town.spent[b.id] > 0)) {
      const amount = town.spent[building.id], button = el('button', `${building.name} · Earn back ${cash(amount)}`);
      button.type = 'button'; button.append(el('small', 'Complete a three-step shift'));
      button.addEventListener('click', () => tasks(`Working at ${building.name}`, 'BOB ON THE JOB', ['Open up and get ready', 'Help the customers', 'Tidy up and finish your shift'], () => {
        const paid = M.completeJob(town, building.id);
        done('Shift complete!', `Bob earned back ${cash(paid)} spent at ${building.name}. Those receipts are now paid.`);
      })); list.append(button);
    }
    body.append(list);
  }
  function garden() {
    show('A greener Browny City', 'ROSE', 'Plant all three flower pots to earn £5.');
    const pots = el('div', '', 'pots'); let planted = 0;
    for (let i = 0; i < 3; i++) {
      const button = el('button', '♧'); button.type = 'button'; button.setAttribute('aria-label', `Plant flower pot ${i + 1}`);
      button.addEventListener('click', () => { audio?.effect('plant'); button.disabled = true; button.textContent = '✿'; planted++; if (planted === 3) { M.collect(town, 'garden'); done('Lovely planting!', 'Rose gives Bob £5 and a bunch of flowers. Let the garden grow for 20 seconds before the next visit.'); } });
      pots.append(button);
    }
    body.append(pots);
  }
  function startArcade() {
    show('Catch the city stars', 'TIM · GAME ARCADE', 'Tap 10 stars before 20 seconds are up.');
    const progress = el('p', '0 / 10 stars · 20s'), board = el('div', '', 'arcade-board'), star = el('button', '★');
    star.type = 'button'; star.setAttribute('aria-label', 'Catch star'); board.append(star); body.append(progress, board);
    const game = { hits: 0, remaining: 20, progress }; arcade = game;
    const place = () => { star.style.left = `${8 + Math.random() * 72}%`; star.style.top = `${5 + Math.random() * 65}%`; };
    star.addEventListener('click', () => { if (arcade !== game) return; audio?.effect('star'); game.hits++; if (game.hits >= 10) { town.bag.stars += 10; done('Star catcher!', 'You caught all 10 stars! They are in your bag.'); } else { progress.textContent = `${game.hits} / 10 stars · ${Math.ceil(game.remaining)}s`; place(); } });
    place();
  }
  function openRace() {
    if (town.room) town.room.used = true;
    closeActivity(); keys.clear(); raceEligible = true;
    $('#raceResult').textContent = 'Entry paid: £10. First finish this visit earns £25 for first place, or £5 for finishing. Choose a circuit!';
    const href = new URL('../bye-cycle/index.html?vehicle=car&browny=1', location.href).href;
    raceFrame.src = window.ZapmanDisplay ? window.ZapmanDisplay.withSettings(href) : href;
    raceDialog.showModal();
  }
  function leaveRace() { raceFrame.src = 'about:blank'; raceEligible = false; raceDialog.close(); keys.clear(); canvas.focus(); save(); }
  window.addEventListener('message', event => {
    if (!raceDialog.open || event.source !== raceFrame.contentWindow) return;
    if (event.origin !== new URL(raceFrame.src).origin) return;
    const result = event.data;
    if (result?.type === 'browny-race-exit') { leaveRace(); return; }
    if (!raceEligible || result?.type !== 'browny-race-finished' || !Number.isInteger(result.place) || result.place < 1 || result.place > 5 || !Number.isFinite(result.time) || result.time <= 0) return;
    raceEligible = false;
    const prize = result.place === 1 ? 25 : 5; town.cash += prize; save();
    audio?.effect('cash');
    $('#raceResult').textContent = `Bob finished #${result.place} and earned ${cash(prize)}! Return to the city whenever you are ready. Extra races this visit are just for fun.`;
  });
  function death() {
    audio?.effect('crash'); keys.clear(); window.BrownyCoast.admit(town); overview=false; syncRoom(); save();
    show('Bob is in hospital', 'NURSE MAY', 'A car hit Bob. You are safe in hospital now, and your cash, pets and belongings are safe too. Rest here, then leave through the exit. Always wait for WALK before crossing.', [['Thank you · Rest in hospital', closeActivity]]);

  }
  function mapToggle() { if(mainMenu.open)return; if (town.room) { say('Leave through the exit to open the town map.'); return; } overview = !overview; syncRoom(); canvas.focus(); }
  function round(x, y, w, h, r, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function text(value, x, y, size = 20, color = '#2e3829', align = 'center', weight = 'bold') {
    ctx.font = `${weight} ${size}px Arial, sans-serif`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(value, x, y);
  }
  function tree(x, y, small = false) {
    const s = small ? .65 : 1; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    round(-22, -4, 46, 21, 12, '#5b7d3b30'); round(-4, -12, 8, 35, 2, '#8b6b45');
    for (const [dx, dy, r] of [[0, -32, 27], [-15, -20, 20], [16, -24, 21]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fillStyle = dx > 0 ? '#64954b' : '#729e50'; ctx.fill(); }
    ctx.restore();
  }
  function person(x, y, shirt, bob = false, moving = false) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#31402b22'; ctx.beginPath(); ctx.ellipse(0, 9, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
    const stride = (bob && walking > 0 || moving) ? Math.sin(town.time * 17) * 4 : 0;
    round(-8, 0, 6, 14 + stride, 2, '#3c485b'); round(2, 0, 6, 14 - stride, 2, '#3c485b');
    round(-11, -22, 22, 27, 6, shirt, '#344331'); round(-8, -39, 16, 20, 6, '#efc499'); round(-9, -42, 18, 8, 4, bob ? '#785237' : '#615548');
    ctx.fillStyle = '#3b3329'; ctx.fillRect(-5, -31, 2, 2); ctx.fillRect(3, -31, 2, 2);
    if (bob) { round(-26, -66, 52, 20, 8, '#fff7e5', '#3b4936'); text('BOB', 0, -51, 12); }
    if (bob) window.BrownyCoastView?.accessories(ctx,town);
    ctx.restore();
  }
  function building(b) {
    round(b.x + 8, b.y + 12, b.w, b.h, 13, '#3e543129');
    round(b.x, b.y, b.w, b.h, 12, b.color, '#52614a');
    round(b.x - 7, b.y - 9, b.w + 14, 28, 7, b.id === 'garden' ? '#4f8a67' : '#795f50', '#4c5344');
    if (b.id === 'garden') {
      for (let i = 0; i < 5; i++) { round(b.x + 17 + i * 58, b.y + 26, 48, 60, 5, '#c5e7bb', '#6b9a75'); text('♧', b.x + 41 + i * 58, b.y + 67, 30, '#5a9362'); }
    } else {
      for (const x of [b.x + 22, b.x + b.w - 66]) { round(x, b.y + 40, 44, 40, 4, '#dce8d3', '#647566'); ctx.fillStyle = '#a8c5bf'; ctx.fillRect(x + 20, b.y + 41, 4, 38); ctx.fillRect(x, b.y + 58, 44, 4); }
    }
    const center = b.x + b.w / 2;
    round(center - 27, b.northDoor ? b.y + 21 : b.y + b.h - 48, 54, 48, 4, '#665444', '#41493c'); ctx.fillStyle = '#e5cb79'; ctx.fillRect(center + 15, b.northDoor ? b.y + 45 : b.y + b.h - 23, 4, 4);
    round(center - b.w * .42, b.y + 17, b.w * .84, 30, 5, '#fff7e5');
    text(b.name, center, b.y + 38, b.name.length > 15 ? (b.w < 280 ? 14 : 17) : 21);
    if (b.id === "castle") { for (let x = b.x; x < b.x + b.w; x += 37) round(x, b.y - 25, 25, 25, 2, "#b8b9ae", "#687366"); }
    if (b.id === 'hospital') { ctx.fillStyle='#c05a58'; ctx.fillRect(center-9,b.y+60,18,58);ctx.fillRect(center-29,b.y+80,58,18); }
    if (b.id === 'police') round(center-20,b.y-34,40,19,5,'#799ec8');
    if (b.id === 'spocco') { round(center-48,b.y+70,96,98,10,'#427f79','#3b6b62');window.BrownyCoastView.logo(ctx,center-40,b.y+78,80); }
    if (b.id !== 'home') {
      const price = b.price ? `−£${b.price}` : b.reward ? `+£${b.reward}` : 'FREE';
      round(b.x + b.w - 75, b.y + b.h - 38, 64, 27, 6, '#fff7e5'); text(price, b.x + b.w - 43, b.y + b.h - 18, 18, b.price ? '#84472e' : '#386344');
      const d = M.door(b); person(d.x + 35, d.y + 6, b.id === 'bank' ? '#677b8e' : b.color); text(b.person, d.x + 35, d.y + 34, 12, '#47603e');
      if (M.nearest(town)?.id === b.id) { round(d.x - 22, d.y - 17, 44, 30, 8, '#f9cf63', '#3e5431'); text('0', d.x, d.y + 5, 22); }
    } else if (M.entrance(town)?.id === 'home') {
      const d = M.door(b); round(d.x - 28, d.y - 18, 56, 28, 8, '#f9cf63', '#3e5431'); text('0 · IN', d.x, d.y + 2, 14);
    }
  }
  function road() {
    ctx.fillStyle = '#e7dcc5'; ctx.fillRect(0, 982, M.W, 216);
    ctx.fillStyle = '#6b716d'; ctx.fillRect(0, 1010, M.W, 160);
    ctx.fillStyle = '#f7ead1'; ctx.fillRect(0, 1005, M.W, 5); ctx.fillRect(0, 1170, M.W, 5);
    for (let x = -20; x < M.W; x += 104) { ctx.fillStyle = '#e3d6af'; ctx.fillRect(x, 1086, 58, 5); }
    const signal = M.lights(town);
    for (const x of [230, 830]) {
      for (let y = 1016; y < 1164; y += 19) { ctx.fillStyle = '#fff6df'; ctx.fillRect(x - 38, y, 76, 10); }
      ctx.fillStyle = '#eee5cf'; ctx.fillRect(x - 80, 1018, 4, 62); ctx.fillRect(x + 76, 1100, 4, 62);
      round(x + 60, 935, 6, 59, 2, '#51574a'); round(x + 43, 910, 40, 76, 8, '#3c473d');
      for (const [i, color] of ['red', 'amber', 'green'].entries()) { ctx.beginPath(); ctx.arc(x + 63, 925 + i * 23, 8, 0, Math.PI * 2); ctx.fillStyle = signal.cars === color ? { red: '#ee7459', amber: '#ffd15b', green: '#9ed576' }[color] : '#67715d'; ctx.fill(); }
      round(x - 65, 1180, 126, 28, 7, signal.walk ? '#38674b' : '#8f493e'); text(signal.walk ? 'WALK' : 'WAIT', x - 2, 1200, 16, '#fff7e5');
    }
  }
  function car(car) {
    ctx.save(); ctx.translate(car.x, car.y); if (Number.isFinite(car.angle)) ctx.rotate(car.angle); else if (car.dir < 0) ctx.rotate(Math.PI);
    round(-40, -18, 83, 42, 10, '#27372d40'); round(-40, -25, 80, 43, 10, car.color, '#3b453f');
    for (const x of [-25, 20]) { round(x, -28, 13, 6, 2, '#303b35'); round(x, 16, 13, 6, 2, '#303b35'); }
    round(-18, -20, 38, 33, 6, '#d5e1d9'); round(-14, -17, 25, 27, 4, '#739594');
    ctx.fillStyle = '#f6dc8e'; ctx.fillRect(34, -19, 5, 9); ctx.fillRect(34, 4, 5, 9); ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (town.room) { window.BrownyCityInteriors.draw(ctx, town, { round, text, person }); return; }
    if (overview) { window.BrownyCityExpansionView.map(ctx, town, { round, text, person }); return; }
    ctx.fillStyle = '#ece6d7'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    cameraY = Math.max(0, Math.min(M.H - canvas.height, town.player.y - canvas.height * .58)); ctx.translate(0, -cameraY);
    ctx.fillStyle = '#b9d294'; ctx.fillRect(0, 0, M.W, M.H);
    for (let i = 0; i < 150; i++) { const x = (i * 137 + 21) % M.W, y = (i * 227 + 43) % M.H; ctx.fillStyle = i % 2 ? '#a3c17f' : '#cfe0ab'; ctx.fillRect(x, y, 4, 3); }
    if (town.section === 2) window.BrownyCityExpansionView.ground(ctx,town,{round,text,tree});
    else if (town.section === 3) window.BrownyCoastView.ground(ctx,town,{round,text,tree});
    else {
    ctx.strokeStyle = '#e7d9b6'; ctx.lineWidth = 66; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(550, 50); ctx.lineTo(550, 960); ctx.moveTo(65, 978); ctx.lineTo(1035, 978); ctx.stroke();
    ctx.lineWidth = 36;
    for (const b of M.getBuildings(town).filter(b => !b.northDoor)) { const d = M.door(b); ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(550, d.y); ctx.stroke(); }
    // The little loop next to the motor club mirrors the hand-drawn map.
    ctx.lineWidth = 28; ctx.strokeStyle = '#64766c'; ctx.beginPath(); ctx.roundRect(25, 530, 90, 195, 35); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#f7ead1'; ctx.setLineDash([10, 10]); ctx.stroke(); ctx.setLineDash([]);
    road();
    for (const [x, y] of [[55, 94], [540, 118], [1050, 120], [70, 360], [1040, 365], [565, 525], [570, 820], [1034, 865], [82, 862], [74, 1330], [560, 1340], [1048, 1335]]) tree(x, y);

    }
    if(!town.atSea) window.BrownyIsland.roads(ctx,town.section);
    if (!town.atSea) for (const b of M.getBuildings(town)) { if(b.id==='stall') window.BrownyCoastView.stall(ctx,b,{round,text}); else building(b); }
    (town.section === 3 ? (town.atSea?[]:town.coastCars) : town.section === 2 ? town.squareCars : town.cars).forEach(car);
    window.BrownyCityExpansionView?.people(ctx,town,{round,text,person});
    person(town.player.x, town.player.y, '#cc7350', true);
    if (window.BrownyCoast.swimming(town)) window.BrownyCoastView.ripple(ctx,town);
    if(!town.atSea) window.BrownyIsland.signs(ctx,town.section);
    ctx.restore();

  }
  function frame(now) {
    const dt = Math.min(.04, Math.max(0, (now - lastFrame) / 1000)); lastFrame = now;
    if (!document.hidden && !mainMenu.open && !activity.open && !raceDialog.open && !sports?.isOpen && !town.dead) {
      let dx = Number(keys.has('ArrowRight') || keys.has('KeyD')) - Number(keys.has('ArrowLeft') || keys.has('KeyA'));
      let dy = Number(keys.has('ArrowDown') || keys.has('KeyS')) - Number(keys.has('ArrowUp') || keys.has('KeyW'));
      walking = Math.hypot(dx, dy); if (walking) {
        dx /= walking; dy /= walking;
        const wasInside = Boolean(town.room), before = { ...town.player }; M.move(town, dx * 188 * dt, dy * 188 * dt);
        if (town.player.x === before.x && town.player.y === before.y) walking = 0;
        if (wasInside && !town.room) { audio?.effect('door'); keys.clear(); syncRoom(); save(); say('Back outside. Where will Bob go next?'); }
      }
      M.step(town, dt); if (town.travelNotice) { say(town.travelNotice); town.travelNotice = ""; overview = false; syncRoom(); save(); } if (town.dead) death();
    } else walking = 0;
    if (arcade && !document.hidden && !mainMenu.open) { arcade.remaining -= dt; arcade.progress.textContent = `${arcade.hits} / 10 stars · ${Math.max(0, Math.ceil(arcade.remaining))}s`; if (arcade.remaining <= 0) done('Time is up!', 'Good try, Bob! Visit Tim again for another go.'); }
    const near = M.entrance(town), lights = M.lights(town);
    audio?.update(dt, { moving: walking > 0, room: town.room?.id, racing: raceDialog.open || sports?.isOpen, dead: town.dead, walk: !town.room && lights.walk, traffic: !mainMenu.open && !town.room && !activity.open && (town.section === 3 ? (town.atSea?[]:town.coastCars) : town.section === 2 ? town.squareCars : town.cars).some(car => car.moving && Math.hypot(car.x - town.player.x, car.y - town.player.y) < 125) });
    if (town.room) {
      const inside = M.buildings.find(b => b.id === town.room.id);
      $('#nearby').textContent = M.atExit(town) ? 'Walk down or press 0 to go outside' : M.atService(town) ? `0 · ${town.room.used && inside.price && !inside.repeatable ? 'Visit complete' : M.getInterior(town).service}` : 'Explore inside · Walk to the counter to interact';
      $('#locationName').textContent = `${inside.name.toUpperCase()} · ${town.room.zone || 'INSIDE'}`;
      $('#crossingStatus').textContent = 'INSIDE · Walk with arrows / WASD. Press 0 at the counter. Exit through the door at the bottom.';
    } else {
      const neighbour = town.residents?.find(p => p.section === town.section && Math.hypot(p.x-town.player.x,p.y-town.player.y)<80);
      $('#nearby').textContent = near ? `0 · Go inside ${near.name}` : neighbour ? `0 · Say hello to ${neighbour.name}` : '';
      $('#locationName').textContent = near ? near.name.toUpperCase() : town.section === 3 ? (window.BrownyCoast.swimming(town)?'BROWNY SEA · SWIMMING':'BROWNY CITY · SECTION THREE') : town.section === 2 ? 'BROWNY CITY · SECTION TWO' : town.player.y > 1195 ? 'HOME SWEET HOME' : town.player.y > 980 ? 'LOOK BOTH WAYS' : 'BROWNY CITY · TOWN CENTRE';
      $('#crossingStatus').textContent = town.section===3 && window.BrownyCoast.beach(town) ? 'BEACH & SEA · Swim with arrows / WASD. From open sea, leave left to reach the beach.' : lights.walk ? `WALK · Cars have a red light. ${lights.remaining}s to cross.` : `WAIT · Watch the traffic. Walking signal in ${lights.remaining}s.`;
    }
    draw(); requestAnimationFrame(frame);
  }
  window.addEventListener('keydown', event => {
    if (event.target.matches('input, textarea, select') || mainMenu.open || activity.open || raceDialog.open || sports?.isOpen) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Digit0', 'Numpad0', 'KeyM'].includes(event.code)) event.preventDefault();
    keys.add(event.code);
    if (!event.repeat && ['Digit0', 'Numpad0'].includes(event.code)) promptBuilding();
    if (!event.repeat && event.code === 'KeyM') mapToggle();
  });
  window.addEventListener('keyup', event => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());
  document.addEventListener('visibilitychange', () => { keys.clear(); if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
  $('#mapButton').addEventListener('click', mapToggle); $('#interact').addEventListener('click', promptBuilding);
  $('#leaveBuilding').addEventListener('click', leaveInterior);
  $('#closeActivity').addEventListener('click', () => { if (town.dead) M.goHome(town); closeActivity(); });
  activity.addEventListener('cancel', event => { event.preventDefault(); if (town.dead) M.goHome(town); closeActivity(); });
  $('#leaveRace').addEventListener('click', leaveRace); raceDialog.addEventListener('cancel', event => { event.preventDefault(); leaveRace(); });
  $('#newGame').addEventListener('click', () => show('A fresh start?', 'HOME SWEET HOME', 'Start Bob at home with £500? This replaces your saved cash, bag, pets and receipts.', [['YES · Start again', () => { town = M.create(); overview = false; syncRoom(); save(); closeActivity(); say('A new day in Browny City. Bob has £500!'); }], ['NO · Keep playing', closeActivity]]));
  document.querySelectorAll('[data-key]').forEach(button => {
    button.addEventListener('pointerdown', event => { event.preventDefault(); if (mainMenu.open || activity.open || raceDialog.open || sports?.isOpen || town.dead) return; button.setPointerCapture(event.pointerId); pointers.set(event.pointerId, button.dataset.key); keys.add(button.dataset.key); });
    const release = event => { const key = pointers.get(event.pointerId); pointers.delete(event.pointerId); if (![...pointers.values()].includes(key)) keys.delete(key); };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, release);
  });
  function playSport(kind, options = {}) {
    const launch = () => { closeActivity(); keys.clear(); sports.open(kind, options); };
    if (window.ZapmanEducation?.enabled) window.ZapmanEducation.start(launch); else launch();
  }
  if (window.BrownySports) sports = window.BrownySports.create({ onFinish: result => { if (result.won) town.bag.medals = Math.min(999, town.bag.medals + 1); save(); say(result.result + (result.won ? " Bob earned a sports medal!" : " Good try! You can play again.")); }, onExit: () => { keys.clear(); syncRoom(); canvas.focus(); say("Back in Spocco Square. Walk to Coach Mia to choose another sport."); } });
  if (window.BrownyCityExpansionUI) expansionUI = window.BrownyCityExpansionUI.create({ getTown: () => town, show, save, close: closeActivity, el, audio, playSport });
  window.ZapmanEducation?.register({ lost: () => town.dead, restore: () => { M.goHome(town); closeActivity(); syncRoom(); refresh(); say("Questions complete! Bob is safely back home."); }, release: () => { keys.clear(); pointers.clear(); } });
  function openMenu(){keys.clear();pointers.clear();save();$('#menuPlay').textContent='Continue as Bob';$('#menuMap').disabled=Boolean(town.room);if(!mainMenu.open)mainMenu.showModal();$('#menuPlay').focus();}
  function resume(){mainMenu.close();keys.clear();pointers.clear();lastFrame=performance.now();canvas.focus();}
  $('#mainMenuButton').addEventListener('click',openMenu);
  $('#menuPlay').addEventListener('click',resume);
  $('#menuMap').addEventListener('click',()=>{if(town.room)return;resume();overview=true;syncRoom();});
  mainMenu.addEventListener('cancel',event=>{event.preventDefault();resume();});
  syncRoom(); refresh(); requestAnimationFrame(frame);
  mainMenu.showModal();$('#menuPlay').textContent=saved?'Continue as Bob':'Play as Bob';$('#menuPlay').focus();

})();
