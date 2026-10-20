(() => {
  'use strict';
  function create({getTown,show,save,close,el,audio,playSport}) {
    const E=window.BrownyCityExpansion,body=document.querySelector('#activityBody'),buttons=document.querySelector('#activityButtons');
    function choices(rows){const list=el('div','','choice-list');for(const [label,description,fn]of rows){const button=el('button',label);button.type='button';if(description)button.append(el('small',description));button.addEventListener('click',fn);list.append(button);}body.append(list);}
    function sports(){show('Which sport will Bob play?','COACH MIA','Your £100 entry covers this visit to the clubhouse. Pick a sport. You can try all three before leaving.',[['Back inside',close]]);choices([
      ['Tennis','Move around your half of the court, serve and swing. First to five points.',()=>playSport('tennis')],
      ['Running races','Choose which local runners to race against.',raceChoices],
      ['Football','Pick your position: goalie, defender or striker.',footballChoices]
    ]);}
    function raceChoices(){const selected=new Set();show('Who will Bob race?','RUNNING TRACK','Pick one, two or three opponents. Then line up on the track.',[['Back to sports',sports]]);const list=el('div','','choice-list');const start=el('button','Start the race →');start.type='button';start.disabled=true;
      for(const runner of window.BrownySportsModel.runners){const b=el('button',runner.name);b.type='button';b.setAttribute('aria-pressed','false');b.append(el('small',runner.description));b.addEventListener('click',()=>{if(selected.has(runner.id))selected.delete(runner.id);else if(selected.size<3)selected.add(runner.id);b.setAttribute('aria-pressed',String(selected.has(runner.id)));start.disabled=selected.size===0;});list.append(b);}body.append(list);start.addEventListener('click',()=>playSport('race',{opponents:[...selected]}));buttons.prepend(start);}
    function footballChoices(){show('Choose Bob’s position','FOOTBALL CLUB','Each position has its own challenge. Move with arrows or WASD, and use Space to kick, tackle or save.',[['Back to sports',sports]]);choices([
      ['Goalie','Guard your goal. Save five shots before three goals get past you.',()=>playSport('football',{role:'goalie'})],
      ['Defender','Stop five incoming attacks with movement and tackles.',()=>playSport('football',{role:'defender'})],
      ['Striker','Dodge the goalkeeper and score three goals.',()=>playSport('football',{role:'striker'})]
    ]);}
    function pets(){const town=getTown();show('Meet the pets','POPPY · PETS AT HOME','Your £10 visit lets you meet the animals and choose one to bring along. There is no extra adoption charge. You can change companions here.',[['Back inside',close]]);choices(E.pets.map(p=>[`${p.name} · ${p.kind}${town.pet===p.id?' · With Bob':''}`,p.description,()=>{E.choosePet(town,p.id);audio?.effect('success');save();pets();}]));
      if(town.pet){const home=el('button','Let my pet rest at home');home.type='button';home.addEventListener('click',()=>{town.pet=null;save();pets();});buttons.prepend(home);}
    }
    function museum(){show('A little journey through time','DR CLAY · MUSEUM','Look closely at replicas of ancient objects and old-fashioned treasures. Pick any exhibit to view it and read about it.',[['Back inside',close]]);choices(E.exhibits.map((e,i)=>[e[0],e[1],()=>exhibit(i)]));}
    function exhibit(i){const e=E.exhibits[i];show(e[0],e[1].toUpperCase(),e[2],[['← All exhibits',museum],['Back inside',close]]);const canvas=el('canvas');canvas.width=440;canvas.height=250;canvas.className='exhibit-preview';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`Museum replica: ${e[0]}`);body.prepend(canvas);const ctx=canvas.getContext('2d');ctx.fillStyle='#d8cdb9';ctx.fillRect(0,0,440,250);window.BrownyCityExpansionView.artefact(ctx,i,220,160,1.6);}
    function castle(){const zone=getTown().room.zone||'hall',descriptions={hall:'Tall banners hang in the great hall. Imagine the footsteps and voices of a busy castle.',dungeon:'Stone walls, empty cells and wooden barrels. The dungeon is quiet today; all of its rooms are safe to explore.',dining:'Long tables are set for a feast, with plates, goblets, fruit and bread.',balcony:'What a view! The town, Spocco Square and the trees stretch out below the balcony.'};show('Explore Browny Castle','SIR ROWAN',descriptions[zone],[['Back inside',close]]);choices([['hall','The great hall'],['dungeon','The dungeon'],['dining','The dining room'],['balcony','The top balcony · What a view!']].map(([id,name])=>[`${name}${zone===id?' · You are here':''}`,'Walk around this room.',()=>{E.changeRoom(getTown(),id);close();}]));}
    function shop(){const town=getTown();show('Toys, books and food','LEILA · THE SHOP',`Cash: £${town.cash}. Entry is £15 per visit; each item has its own price. Purchases go into your bag and count towards your work receipts.`,[['Back inside',close]]);choices(E.items.map(item=>[`${item.category} · ${item.name} · £${item.price}`,`In your bag: ${town.bag[item.bag]}`,()=>{if(E.purchase(town,item.id)){audio?.effect('buy');save();shop();}else{audio?.effect('error');body.prepend(el('p',town.bag[item.bag]>=999?'Your bag is full for this type of item.':'Not enough cash for this item. Try a cheaper item, or earn more money in Section One.','shop-notice'));}}]));}
    return {handle(building){const fn={spocco:sports,pets,museum,castle,market:shop}[building.id];if(!fn)return false;fn();return true;}};
  }
  window.BrownyCityExpansionUI={create};
})();
