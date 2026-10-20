/* Run with node tests/educational-mode.test.cjs. No third-party dependencies. */
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
function environment(href='file:///zapman/games/zapman/index.html?edu=6', stored={}, blockedStorage=false) {
  const timers=new Map(),raf=new Map(), storage=new Map(Object.entries(stored));let id=0,now=0;
  class Element {
    constructor(tag='div'){this.tagName=tag;this.children=[];this.parentElement=null;this.events={};this.attrs={};this.dataset={};this.open=false;this.disabled=false;this.hidden=false;this.checked=false;this.value='';this._text='';this.style={setProperty(){}};this.classes=new Set();this.classList={add:(...s)=>s.forEach(c=>this.classes.add(c)),remove:(...s)=>s.forEach(c=>this.classes.delete(c)),contains:c=>this.classes.has(c),toggle:(c,on)=>{on??=!this.classes.has(c);on?this.classes.add(c):this.classes.delete(c);}};}
    setAttribute(k,v){this.attrs[k]=String(v);if(k==='id')this.id=v;if(k==='class'){this.classes=new Set(v.split(/\s+/));}if(k==='hidden')this.hidden=true;if(k==='disabled')this.disabled=true;if(k==='checked')this.checked=true;if(k==='value')this.value=v;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;}
    getAttribute(k){return this.attrs[k]??null;}
    append(...items){for(const x of items){if(x.parentElement)x.parentElement.children=x.parentElement.children.filter(a=>a!==x);this.children.push(x);x.parentElement=this;}}
    appendChild(x){this.append(x);return x;}
    get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
    set textContent(v){this._text=String(v);this.children=[];}
    set innerHTML(html){this._text='';this.children=[];const stack=[this];for(const part of html.match(/<[^>]*>|[^<]+/g)||[]){if(part.startsWith('</')){stack.pop();continue;}if(part.startsWith('<')){const name=part.match(/^<([\w-]+)/)?.[1];if(!name)continue;const e=new Element(name);for(const a of part.matchAll(/([\w-]+)(?:="([^"]*)")?/g)){if(a[1]!==name)e.setAttribute(a[1],a[2]??'');}stack.at(-1).append(e);if(!['input','br','link','meta'].includes(name))stack.push(e);}else stack.at(-1)._text+=part;}for(const select of this.querySelectorAll('select'))select.value=select.children.find(o=>'selected' in o.attrs)?.value||select.children[0]?.value||'';}
    get innerHTML(){return this.textContent;}
    matches(sel){if(sel.includes(' ')){const parts=sel.split(/\s+/);return this.matches(parts.pop())&&this.parentElement?.closest(parts.join(' '));}if(sel.startsWith('#'))return this.id===sel.slice(1);if(sel.startsWith('.'))return this.classes.has(sel.slice(1));if(sel.startsWith('[')){const m=sel.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);return m&&m[1] in this.attrs&&(m[2]===undefined||this.attrs[m[1]]===m[2]);}return this.tagName===sel;}
    querySelectorAll(sel){return this.children.flatMap(c=>[...(c.matches(sel)?[c]:[]),...c.querySelectorAll(sel)]);}
    querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
    closest(sel){return this.matches(sel)?this:this.parentElement?.closest(sel)||null;}
    contains(e){return this===e||this.children.some(c=>c.contains(e));}
    addEventListener(t,fn,opts){(this.events[t]??=[]).push({fn,capture:opts===true||opts?.capture});}
    focus(){document.activeElement=this;}
    showModal(){this.open=true;}
    close(){this.open=false;}
    get isConnected(){return document.contains(this);}
  }
  const window=new Element('window'),document=new Element('document');window.append(document);
  document.head=new Element('head');document.body=new Element('body');document.append(document.head,document.body);document.createElement=t=>new Element(t);document.currentScript={src:'file:///zapman/educational-mode.js'};document.activeElement=null;
  const canvas=new Element('canvas');document.body.append(canvas);if(new URL(href).pathname==='/zapman/index.html')document.body.classList.add('picker-active');
  class Event {constructor(type,opts={}){this.type=type;Object.assign(this,opts);}preventDefault(){this.defaultPrevented=true;}stopPropagation(){this.stopped=true;}stopImmediatePropagation(){this.stopped=true;this.immediate=true;}}
  function fire(target,type,opts={}){const e=new Event(type,{target,...opts});const chain=[];for(let p=target;p;p=p.parentElement)chain.push(p);for(const n of [...chain].reverse()){for(const h of n.events[type]||[])if(h.capture){h.fn(e);if(e.immediate)break;}if(e.stopped)return e;}for(const n of chain){for(const h of n.events[type]||[])if(!h.capture){h.fn(e);if(e.immediate)break;}if(e.stopped)break;}return e;}
  window.dispatchEvent=e=>fire(window,e.type,e);document.dispatchEvent=e=>fire(document,e.type,e);
  const requestAnimationFrame=fn=>{raf.set(++id,fn);return id;};const cancelAnimationFrame=id=>raf.delete(id);
  Object.assign(window,{requestAnimationFrame,cancelAnimationFrame,setTimeout:(fn)=>{timers.set(++id,fn);return id;},clearTimeout:n=>timers.delete(n)});
  const location=new URL(href),localStorage={getItem:k=>{if(blockedStorage)throw Error('storage');return storage.get(k)??null;},setItem:(k,v)=>{if(blockedStorage)throw Error('storage');storage.set(k,v);}};
  const ctx=vm.createContext({window,document,URL,location,localStorage,Event,history:{replaceState:(_,__,href)=>location.href=href},requestAnimationFrame:fn=>window.requestAnimationFrame(fn),cancelAnimationFrame:n=>window.cancelAnimationFrame(n)});
  vm.runInContext(read('educational-questions.js'),ctx);ctx.ZapmanQuestions.create=(()=>{const create=ctx.ZapmanQuestions.create;return ()=>{const q=create();return {next:y=>(ctx.lastQuestion=q.next(y))};};})();
  vm.runInContext(read('educational-mode.js'),ctx);
  function frames(n=1){for(let i=0;i<n;i++){now+=16;const old=[...raf];old.forEach(([id])=>raf.delete(id));old.forEach(([,fn])=>fn(now));}}
  const ready=()=>fire(document,'DOMContentLoaded'),click=e=>{assert(e&&!e.disabled,'A live button is required.');return fire(e,'click');};
  function answer(right=true){const q=ctx.lastQuestion,d=document.querySelector('#zapman-education');click(d.querySelectorAll('.edu-answers button').find(b=>b.textContent===(right?q.answer:q.options.find(a=>a!==q.answer))));}
  const next=()=>click(document.querySelector('[data-edu-next]'));
  function pass(){for(let i=0;i<3;i++){answer();next();}}
  return {ctx,window,document,ready,frames,fire,click,answer,next,pass,storage,location,canvas,fireTimers:()=>{const q=[...timers.values()];timers.clear();q.forEach(fn=>fn());}};
}
// All years always stay selected, have four unique choices and random subjects, and are usable offline.
{
 const c=vm.createContext({});vm.runInContext(read('educational-questions.js'),c);let seed=1523;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;const q=c.ZapmanQuestions.create(random);
 for(let year=1;year<=12;year++){const subjects=new Set(),prompts=new Set();let last='';for(let i=0;i<300;i++){const item=q.next(year);assert.equal(item.year,year);assert.notEqual(item.subject,last);last=item.subject;subjects.add(item.subject);prompts.add(item.prompt);assert.equal(item.options.length,4);assert.equal(new Set(item.options).size,4);assert(item.options.includes(item.answer));}assert.equal(subjects.size,4);assert(prompts.size>=10);}
 for(const year of [0,13,1.5,'bad'])assert.throws(()=>q.next(year));
 const low=c.ZapmanQuestions.create(()=>0).next(1),high=c.ZapmanQuestions.create(()=>0).next(12);assert.match(low.prompt,/\+/);assert.match(high.prompt,/dy\/dx/);
}
// Entry gate: gameplay remains frozen, wrong answers are harmless, subjects change but the year does not.
{
 const e=environment();let moved=0;const a=e.window.requestAnimationFrame(()=>moved++);e.window.cancelAnimationFrame(a);e.window.requestAnimationFrame(()=>moved++);e.ready();e.frames(3);assert.equal(moved,0);assert(e.window.ZapmanEducation.blocked);const first=e.ctx.lastQuestion;e.answer(false);assert.equal(e.document.querySelector('.edu-progress').textContent,'0 of 3 correct');assert.match(e.document.querySelector('.edu-feedback').textContent,/haven't lost a life/);e.next();assert.equal(e.ctx.lastQuestion.year,6);assert.notEqual(e.ctx.lastQuestion.subject,first.subject);assert(e.fire(e.document.querySelector('#zapman-education'),'cancel').defaultPrevented);e.pass();assert(!e.window.ZapmanEducation.blocked);e.frames();assert.equal(moved,1);assert.equal(e.location.searchParams.get('edu'),'6');
 // Loss is handled once, cannot be skipped with Escape, and restores only after three correct answers.
 let lost=true,restored=0;e.window.ZapmanEducation.register({lost:()=>lost,restore:()=>{lost=false;restored++;}});e.frames();assert(e.window.ZapmanEducation.blocked);assert.match(e.document.querySelector('#edu-title').textContent,/lives back/);e.frames(3);assert.equal(restored,0);e.pass();assert.equal(restored,1);e.frames(2);assert.equal(restored,1);assert.equal(e.window.ZapmanEducation.year,6);
 // Question-key presses never reach gameplay; outside game clicks are blocked.
 e.window.ZapmanEducation.recover(()=>{});let keys=0;e.window.addEventListener('keydown',()=>keys++);e.fire(e.document.querySelector('.edu-answers button'),'keydown',{key:'r'});assert.equal(keys,0);assert(e.fire(e.canvas,'click').defaultPrevented);e.pass();
}
// Timed transitions also wait, and cancellation still works after a timeout is held.
{
 const e=environment();e.ready();let count=0;e.window.setTimeout(()=>count++,1);const cancel=e.window.setTimeout(()=>count+=10,1);e.fireTimers();e.frames(2);assert.equal(count,0);e.window.clearTimeout(cancel);e.pass();e.frames();assert.equal(count,1);
}
// The picker has a settings button but no quiz until a game is launched; save/cancel/off and URL transport work.
{
 const e=environment('file:///zapman/index.html');e.ready();assert(!e.window.ZapmanEducation.blocked);e.window.ZapmanEducation.settings();let d=e.document.querySelector('#zapman-education');d.querySelector('#edu-enabled').checked=true;d.querySelector('#edu-year').value='12';e.fire(d.querySelector('form'),'submit');assert(e.window.ZapmanEducation.enabled);assert.equal(e.window.ZapmanEducation.year,12);assert.equal(new URL(e.window.ZapmanEducation.withSettings('games/cat-rescue/versions/classic/index.html')).searchParams.get('edu'),'12');let launched=0;e.window.ZapmanEducation.start(()=>launched++);assert.equal(launched,0);e.pass();assert.equal(launched,1);e.window.ZapmanEducation.settings();d.querySelector('#edu-year').value='2';e.click(d.querySelector('[data-edu-cancel]'));assert.equal(e.window.ZapmanEducation.year,12);e.window.ZapmanEducation.settings();d.querySelector('#edu-enabled').checked=false;e.fire(d.querySelector('form'),'submit');assert(!e.window.ZapmanEducation.enabled);assert.equal(new URL(e.window.ZapmanEducation.withSettings('games/zapman/index.html')).searchParams.get('edu'),'0');e.window.ZapmanEducation.start(()=>launched++);assert.equal(launched,2);
}
// No storage, nested local URLs, direct game entry, saved settings, and turning the mode on inside a game.
{
 const e=environment('file:///zapman/games/cat-rescue/versions/classic/index.html?edu=9',{},true);e.ready();assert(e.window.ZapmanEducation.blocked);assert.equal(e.ctx.lastQuestion.year,9);e.pass();assert.equal(e.window.ZapmanEducation.year,9);
 const saved={'zapman-educational-mode':JSON.stringify({enabled:true,year:4})},f=environment('file:///zapman/games/fighters/index.html',saved);f.ready();assert.equal(f.ctx.lastQuestion.year,4);f.pass();
 const off=environment('file:///zapman/games/fighters/index.html?edu=0',saved);off.ready();assert(!off.window.ZapmanEducation.blocked);let frames=0;off.window.requestAnimationFrame(()=>frames++);off.frames();assert.equal(frames,1);off.window.ZapmanEducation.settings();const d=off.document.querySelector('#zapman-education');d.querySelector('#edu-enabled').checked=true;d.querySelector('#edu-year').value='8';off.fire(d.querySelector('form'),'submit');assert(off.window.ZapmanEducation.blocked);assert.equal(off.ctx.lastQuestion.year,8);off.pass();
}
// Real game models regain lives without changing the chosen year or Bob's cash/bag.
{
 const e=environment();e.ready();e.pass();vm.runInContext(read('games/zapman/model.js'),e.ctx);const game=e.ctx.ZapmanAdventure.create();game.state.level=12;game.retryLevel();game.state.health=0;game.state.stage='lost';e.window.ZapmanEducation.register({lost:()=>game.state.stage==='lost',restore:()=>game.retryLevel()});e.frames();assert(e.window.ZapmanEducation.blocked);e.pass();assert.equal(game.state.stage,'lastStand');assert.equal(game.state.health,5);assert.equal(game.state.level,12);assert.equal(e.window.ZapmanEducation.year,6);
 vm.runInContext(read('games/browny-city/model.js'),e.ctx);const M=e.window.BrownyCityModel,town=M.create();town.cash=412;town.bag.pizza=2;town.dead=true;e.window.ZapmanEducation.register({lost:()=>town.dead,restore:()=>M.goHome(town)});e.frames();e.pass();assert(!town.dead);assert.equal(town.cash,412);assert.equal(town.bag.pizza,2);
}
// Games that stop and start a new animation loop must not accumulate an old held loop.
{
 const e=environment();e.ready();e.pass();let lost=true,calls=0;
 const loop=()=>{calls++;e.window.requestAnimationFrame(loop);};e.window.requestAnimationFrame(loop);
 e.window.ZapmanEducation.register({lost:()=>lost,restartsLoop:true,restore:()=>{lost=false;e.window.requestAnimationFrame(loop);}});e.frames();e.pass();const before=calls;e.frames(3);assert.equal(calls-before,3,'Recovery resumes exactly one animation chain.');
}
// Actual recovery bindings distinguish a loss from menus and completed games.
{
 function adapter(game, state){let result;const c=vm.createContext({location:{pathname:'/zapman/games/'+game+'/index.html'},window:{ZapmanEducation:{register:a=>result=a}},...state});vm.runInContext(read('educational-adapters.js'),c);return result;}
 for(const [menu,victory,expected] of [[true,false,false],[false,true,false],[false,false,true]])assert.equal(adapter('minedaft',{gameOver:true,victory,gameShell:{classList:{contains:()=>menu}}}).lost(),expected);
 for(const won of [true,false])assert.equal(adapter('fighters',{gameOver:true,won}).lost(),!won);
 for(const won of [true,false])assert.equal(adapter('speeding-planes',{state:{over:true,won}}).lost(),!won);
 assert(!adapter('shardbreakers-echoes-of-the-fallen-realm',{running:false,player:{hp:100},riftIntegrity:100}).lost());
 assert(adapter('shardbreakers-echoes-of-the-fallen-realm',{running:false,player:{hp:0},riftIntegrity:100}).lost());
 assert(!adapter('jump-jump',{state:'spent',activePlayers:[{flying:true}]}).lost());assert(adapter('jump-jump',{state:'spent',activePlayers:[{flying:false}]}).lost());
 assert(!adapter('subway-surfers',{gameOver:true,paused:false}).lost());assert(adapter('subway-surfers',{gameOver:true,paused:true}).lost());
}
// Every local game and both nested Cat Rescue versions load the shared gate in the head, before gameplay.
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const p of [path.join(root,'index.html'),...walk(path.join(root,'games')).filter(p=>p.endsWith('index.html'))]){
 const html=fs.readFileSync(p,'utf8');assert(html.indexOf('educational-mode.js')<html.indexOf('</head>'),p);assert(html.indexOf('educational-questions.js')<html.indexOf('educational-mode.js'),p);
 for(const script of html.matchAll(/<script[^>]*src="([^"]+)"/g))if(!script[1].includes('://'))assert(fs.existsSync(path.resolve(path.dirname(p),script[1])),script[1]);
}
console.log('Passed all 12 year groups, four subjects, question variety, wrong/correct answers, three-answer entry/recovery, held/cancelled frames, input isolation, settings/persistence/URL/offline transport, picker launch, disabled mode and all game script references.');
