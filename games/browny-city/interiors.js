(() => {
  'use strict';
  function draw(ctx, town, { round, text, person }) {
    const M = window.BrownyCityModel, b = M.buildings.find(b => b.id === town.room.id), room = M.getInterior(town);
    ctx.fillStyle = '#354339'; ctx.fillRect(0, 0, 1100, 760);
    round(65, 90, 970, 625, 20, '#29352d70');
    round(75, 75, 950, 625, 14, room.wall, '#334637');
    round(88, 175, 924, 510, 3, room.floor, '#6b7560');
    ctx.save(); ctx.beginPath(); ctx.rect(90, 178, 920, 505); ctx.clip();
    ctx.strokeStyle = '#fff6de2e'; ctx.lineWidth = 2;
    for (let y = 180; y < 700; y += 54) { ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(1010, y); ctx.stroke(); }
    for (let x = 90; x < 1010; x += 92) { ctx.beginPath(); ctx.moveTo(x, 180); ctx.lineTo(x, 700); ctx.stroke(); }
    ctx.restore();
    round(285, 98, 530, 55, 10, '#fff7e5'); text(room.title, 550, 133, 25);
    for (const x of [145, 875]) {
      round(x, 103, 80, 51, 4, '#dbede1', '#526f60');
      ctx.fillStyle = '#95bdb5'; ctx.fillRect(x + 37, 104, 5, 49); ctx.fillRect(x + 1, 126, 78, 4);
    }
    round(482, 660, 136, 39, 3, '#f6cb69', '#776348'); text('EXIT ↓', 550, 686, 21);
    if (b.id === 'castle' && town.room.zone === 'balcony') {
      ctx.fillStyle='#a9d4d3';ctx.fillRect(100,180,900,115);ctx.fillStyle='#a5bd81';ctx.fillRect(100,250,900,45);
      for(let i=0;i<11;i++){const x=120+i*81,y=241+i%3*13;round(x,y,55,34,2,['#d2b37e','#c28e79','#9ea8a0'][i%3]);ctx.fillStyle='#746450';ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+27,y-18);ctx.lineTo(x+59,y);ctx.fill();}
      text('Spocco Square, the rooftops and the trees… What a view!',550,207,15,'#3a6261');
    }
    // Furniture is drawn from the same rectangles used for collision detection.
    for (const prop of room.props) furniture(prop);
    if (b.id !== 'home') { person(550, 353, b.color); text(b.person, 550, 297, 14, '#344d3b'); }
    const available = !town.room.used || !b.price || b.repeatable;
    const near = M.atService(town);
    round(447, 397, 206, 34, 9, near ? '#f6cb69' : '#fff7e5c9', '#6b7560');
    text(near ? `0 · ${available ? room.service : 'Visit complete'}` : b.id === 'home' ? 'Your favourite reading spot' : 'Walk here to talk', 550, 420, near ? 14 : 13);
    // Draw Bob last so walls and furniture do not cover his face.
    person(town.player.x, town.player.y, '#cc7350', true);
    window.BrownyCityExpansionView?.pet(ctx,town,{text});
    text('ARROWS / WASD · WALK INSIDE', 550, 735, 15, '#fff7e5');

    function furniture([kind, x, y, w, h]) {
      round(x + 5, y + 8, w, h, 7, '#31432f26');
      if (kind === 'computer') { round(x,y,w,h,6,'#947857');round(x+15,y+10,w-30,70,5,'#354f5c');round(x+22,y+17,w-44,52,2,'#b5d6d8');text('JUMP',x+w/2,y+48,19);round(x+25,y+88,w-50,18,3,'#d3d8cc');return; }
      if (kind === 'watchcase') { round(x,y,w,h,5,'#e7dfc5','#7f927e');for(const [i,color]of Object.values(window.BrownyCoast.colors).entries()){const px=x+20+i*39;round(px,y+25,18,70,5,color);round(px-4,y+43,26,30,4,'#555e62');round(px,y+47,18,21,2,'#f6f0cd');}return; }
      if (kind === 'artefact') { round(x,y,w,h,6,'#c4c8b49e','#7b8b78'); window.BrownyCityExpansionView.artefact(ctx,x<500?(y<450?0:2):(y<450?1:4),x+w/2,y+h-10,.7); return; }
      if (kind === 'petBed') { round(x,y,w,h,18,'#ae9570','#677d58');round(x+10,y+10,w-20,h-20,15,'#e0c9a3');window.BrownyCityExpansionView.pet(ctx,town,{text},{x:x+w/2,y:y+h/2},x<500?(y<450?'dog':'rabbit'):'cat',1.6);return; }
      if (kind === 'trophy') { round(x,y,w,h,7,'#ae9872','#6b7759');ctx.fillStyle='#d6ba63';ctx.beginPath();ctx.arc(x+w/2,y+40,26,0,Math.PI);ctx.fill();round(x+w/2-5,y+36,10,42,2,'#d6ba63');round(x+w/2-26,y+78,52,10,2,'#d6ba63');text(x<500?'TENNIS & RACES':'FOOTBALL',x+w/2,y+h-6,12);return; }
      if (kind === 'bars') { round(x,y,w,h,3,'#34433e','#5e7068');for(let px=x+16;px<x+w;px+=23){ctx.fillStyle='#9aa59e';ctx.fillRect(px,y,7,h);}return; }
      if (kind === 'railing') { ctx.fillStyle='#8a958a';ctx.fillRect(x,y,w,12);ctx.fillRect(x,y+h-10,w,10);for(let px=x;px<x+w;px+=36)ctx.fillRect(px,y,10,h);return; }
      if (kind === 'banquet') { round(x,y,w,h,5,'#8d6750','#58614e');round(x+8,y+8,w-16,h-16,5,'#b98665');for(let i=0;i<5;i++){const py=y+30+i*59;circle(x+40,py,15,'#eee4c7');circle(x+w-40,py,15,'#eee4c7');circle(x+w/2,py,9,i%2?'#c77b59':'#d8bb68');}return; }
      if (kind === 'banner') { round(x,y,w,h,3,'#8d565a','#7b7251');ctx.fillStyle='#e9cb7d';ctx.fillRect(x+w/2-4,y+15,8,h-30);ctx.fillRect(x+20,y+h/2-4,w-40,8);return; }
      if (kind === 'barrel') { round(x,y,w,h,16,'#a47f56','#5f5e47');for(let i=1;i<4;i++){ctx.fillStyle='#656d5b';ctx.fillRect(x+3,y+i*h/4,w-6,5);}return; }
      if (kind === 'toys') { round(x,y,w,h,6,'#bd966e','#656f53');for(let i=0;i<3;i++){round(x+15+i*48,y+24,33,28,4,['#c47b5a','#7797a9','#d6b86e'][i]);circle(x+20+i*48,y+59,7,'#535d55');circle(x+40+i*48,y+59,7,'#535d55');}text('TOYS',x+w/2,y+h-10,13);return; }
      const colors = { sofa: '#b57557', seat: '#8c9e86', bed: '#d6c3a2', board: '#3b6650', desk: '#bc9665', counter: '#b78b62', books: '#9e7957', machine: '#4f5368', safe: '#85978e', notices: '#b89463', car: x < 500 ? '#c7735c' : '#638ca0', tools: '#71887e', oven: '#7e8d89', prep: '#c0ab89', table: '#b99973', shelf: '#c4a173', planter: '#a17955', plant: '#9b795d' };
      round(x, y, w, h, kind === 'car' ? 20 : 7, colors[kind], '#52634e');
      if (['counter', 'table', 'desk', 'prep'].includes(kind)) {
        round(x + 6, y + 5, w - 12, h - 17, 5, kind === 'prep' ? '#f0dcc1' : '#dec19a');
        if (kind === 'counter') { round(x + w - 55, y + 12, 38, 29, 3, '#566f64'); round(x + 20, y + 14, 48, 26, 2, '#fff7e5'); }
        if (kind === 'desk') { round(x + 20, y + 11, 48, 26, 2, '#fff7e5'); round(x + w - 56, y + 8, 32, 32, 2, '#748f81'); }
        if (kind === 'prep') { circle(x + w / 2, y + h / 2, 40, '#dba96c'); circle(x + w / 2, y + h / 2, 32, '#c9754f'); for (let i = 0; i < 5; i++) circle(x + w / 2 + Math.cos(i * 1.25) * 19, y + h / 2 + Math.sin(i * 1.25) * 19, 5, '#f2d99d'); }
      }
      if (kind === 'board') text('ABC     1 + 2 = 3', x + w / 2, y + 32, 22, '#fff7e5');
      if (['books', 'shelf'].includes(kind)) {
        for (let row = 0; row < 2; row++) {
          const sy = y + 10 + row * (h / 2); ctx.fillStyle = '#97724f'; ctx.fillRect(x + 5, sy + h / 2 - 15, w - 10, 6);
          for (let col = 0; col < 6; col++) { round(x + 12 + col * (w - 20) / 6, sy, (w - 40) / 6, h / 2 - 18, 2, ['#d48b61', '#e5ca80', '#90aa7c', '#829ca9', '#d7b18c', '#a98da6'][col]); }
        }
        if (kind === 'shelf') text(x < 500 ? 'FRESH FOOD' : 'GROCERIES', x + w / 2, y + h - 6, 11);
      }
      if (kind === 'sofa' || kind === 'seat') { for (let i = 0; i < 3; i++) round(x + 12 + i * (w - 24) / 3, y + 18, (w - 35) / 3, h - 30, 7, '#d2ac86'); }
      if (kind === 'bed') { round(x + 10, y + 12, w - 20, h - 24, 8, '#f4e9d1'); round(x + 20, y + 21, w - 40, 45, 8, '#fff8e9'); round(x + 10, y + 81, w - 20, h - 94, 5, '#8fac9e'); }
      if (kind === 'machine') { round(x + 10, y + 10, w - 20, 65, 6, '#263c4a'); text('★', x + w / 2, y + 55, 36, '#f6cb69'); round(x + 8, y + h - 36, w - 16, 23, 3, '#798f99'); circle(x + 25, y + h - 25, 6, '#e6a06f'); circle(x + w - 25, y + h - 25, 6, '#b0d48d'); }
      if (kind === 'safe') { round(x + 10, y + 13, w - 20, h - 26, 5, '#a3b1a4', '#4a6356'); circle(x + w / 2, y + h / 2, 23, '#617c6e'); text('£', x + w / 2, y + h / 2 + 10, 29, '#fff7e5'); }
      if (kind === 'notices') { for (let i = 0; i < 4; i++) { const px = x + 15 + i % 2 * 75, py = y + 19 + Math.floor(i / 2) * 75; round(px, py, 60, 58, 2, '#fff0cd'); text('JOB', px + 30, py + 34, 14); } }
      if (kind === 'tools') { for (let i = 0; i < 5; i++) { ctx.fillStyle = '#c3d1c6'; ctx.fillRect(x + 20 + i * 35, y + 17, 8, 40); circle(x + 24 + i * 35, y + 20, 10, '#c3d1c6'); } }
      if (kind === 'car') { round(x + 26, y + 35, w - 52, h - 65, 15, '#c6d8d1'); round(x + 36, y + 51, w - 72, 52, 8, '#5b7c83'); round(x + 36, y + h - 84, w - 72, 38, 8, '#5b7c83'); ctx.fillStyle = '#e9d6a3'; ctx.fillRect(x + 10, y + 10, 23, 12); ctx.fillRect(x + w - 33, y + 10, 23, 12); }
      if (kind === 'oven') { round(x + 15, y + 35, w - 30, h - 53, 10, '#3f514c'); circle(x + 33, y + 16, 6, '#e2b169'); circle(x + w - 33, y + 16, 6, '#e2b169'); text('BAKE', x + w / 2, y + h / 2 + 20, 22, '#f5c775'); }
      if (kind === 'planter' || kind === 'plant') {
        const count = kind === 'plant' ? 1 : 4;
        for (let i = 0; i < count; i++) { const px = x + (i + .5) * w / count; round(px - 12, y + h - 35, 24, 29, 3, '#c18f61'); ctx.fillStyle = '#5b8751'; ctx.fillRect(px - 2, y + 19, 4, h - 40); circle(px - 9, y + 35, 10, '#7ca268'); circle(px + 9, y + 26, 10, '#6e985c'); circle(px, y + 18, 10, ['#e7b470', '#d59385', '#c7b4da', '#e7d28c'][i]); }
      }
    }
    function circle(x, y, r, color) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
  }
  window.BrownyCityInteriors = { draw };
})();
