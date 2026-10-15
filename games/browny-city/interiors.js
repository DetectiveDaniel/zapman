(() => {
  'use strict';
  function draw(ctx, town, { round, text, person }) {
    const M = window.BrownyCityModel, b = M.buildings.find(b => b.id === town.room.id), room = M.interiors[b.id];
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
    // Furniture is drawn from the same rectangles used for collision detection.
    for (const prop of room.props) furniture(prop);
    if (b.id !== 'home') { person(550, 353, b.color); text(b.person, 550, 297, 14, '#344d3b'); }
    const available = !town.room.used || !b.price;
    const near = M.atService(town);
    round(447, 397, 206, 34, 9, near ? '#f6cb69' : '#fff7e5c9', '#6b7560');
    text(near ? `0 · ${available ? room.service : 'Visit complete'}` : b.id === 'home' ? 'Your favourite reading spot' : 'Walk here to talk', 550, 420, near ? 14 : 13);
    // Draw Bob last so walls and furniture do not cover his face.
    person(town.player.x, town.player.y, '#cc7350', true);
    text('ARROWS / WASD · WALK INSIDE', 550, 735, 15, '#fff7e5');

    function furniture([kind, x, y, w, h]) {
      round(x + 5, y + 8, w, h, 7, '#31432f26');
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
