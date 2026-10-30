const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'mobile-controls.js'),'utf8');
function setup(rootPage=false,menu=false){
 const listeners=new Map(),sent=[],posts=[],timers=new Map();let time=0,iframe=null,modal=null;const menuControls=[];
 const classes=()=>{const values=new Set();return {add:n=>values.add(n),remove:n=>values.delete(n),contains:n=>values.has(n),toggle(n,on){on?values.add(n):values.delete(n)}}};
 const element=tag=>({tagName:tag.toUpperCase(),children:[],dataset:{},attrs:{},classList:classes(),hidden:false,parentElement:null,
  contains(n){return this.children.includes(n)},getClientRects:()=>[{}],closest:()=>null,matches:()=>true,focus(){document.activeElement=this;},click(){this.clicked=true;},append(n){if(n.parentElement)n.parentElement.children=n.parentElement.children.filter(c=>c!==n);this.children.push(n);n.parentElement=this;},
  setAttribute(k,v){this.attrs[k]=v},addEventListener(type,fn){(this.events??={})[type]=fn},setPointerCapture(){},dispatchEvent(e){sent.push(e);return true}});
 const head=element('head'),body=element('body'),html=element('html'),canvas=element('canvas');
 if(rootPage){body.classList.add('mobile-mode');body.classList.add('picker-active');}else html.classList.add('zapman-mobile-game');
 if(menu)for(let i=0;i<3;i++)menuControls.push(element('button'));
 const window={ZapmanEducation:{blocked:false},addEventListener:(n,f)=>listeners.set(n,f)};
 const document={currentScript:{src:'https://zapman.test/mobile-controls.js'},head,body,documentElement:html,hidden:false,createElement:element,
  querySelectorAll:()=>menuControls,activeElement:null,querySelector(s){if(s==='#online-game')return iframe;if(s.startsWith('dialog[open]'))return modal;if(s==='canvas')return canvas;return null;},addEventListener:(n,f)=>listeners.set(n,f)};
 const context=vm.createContext({window,document,location:{href:'https://zapman.test/'+(rootPage?'index.html':'games/silly-billies/index.html'),pathname:menu?'/games/math-game/index.html':'/games/silly-billies/index.html'},URL,KeyboardEvent:class{constructor(type,options){Object.assign(this,{type},options)}},MutationObserver:class{observe(){}},performance:{now:()=>time},setInterval(fn){timers.set(1,fn);return 1},clearInterval:id=>timers.delete(id)});
 vm.runInContext(source,context);const pad=body.children.find(n=>n.id==='zapman-arrow-pad');
 const button=code=>pad.children.find(n=>n.dataset.arrow===code);
 const event=id=>({pointerId:id,button:0,pointerType:'touch',preventDefault(){},stopPropagation(){}});
 return {window,document,pad,sent,posts,menuControls,button,listeners,timers,press(code,id){button(code).events.pointerdown(event(id));},release(code,id,type='pointerup'){button(code).events[type](event(id));},advance(){time=400;timers.get(1)?.();},setFrame(){iframe={src:'https://catboozle-arcade.cgesurrey.chatgpt.site/',contentWindow:{postMessage:(data,origin)=>posts.push({data,origin})}}},setModal(){modal=element('dialog');return modal;}};
}
let q=setup();assert(!q.pad.hidden);assert.equal(q.pad.children.length,4);
q.press('ArrowRight',1);q.press('ArrowUp',2);assert.deepEqual(q.sent.map(e=>e.code),['ArrowRight','ArrowUp']);
assert(q.sent.every(e=>e.type==='keydown'&&e.key===e.code&&e.bubbles));assert.equal(q.sent[0].keyCode,39);
q.advance();assert(q.sent.slice(2).every(e=>e.repeat));
q.release('ArrowRight',1,'pointercancel');assert.equal(q.sent.at(-1).type,'keyup');assert.equal(q.sent.at(-1).code,'ArrowRight');
q.release('ArrowUp',2,'lostpointercapture');assert.equal(q.timers.size,0);
// Two fingers holding the same direction do not release each other.
q=setup();q.press('ArrowLeft',1);q.press('ArrowLeft',2);assert.equal(q.sent.length,1);q.release('ArrowLeft',1);assert.equal(q.sent.length,1);q.release('ArrowLeft',2);assert.equal(q.sent.at(-1).type,'keyup');
for(const reason of ['blur','pagehide','hidden','quiz']){
 q=setup();q.press('ArrowDown',3);
 if(reason==='hidden'){q.document.hidden=true;q.listeners.get('visibilitychange')();}
 else if(reason==='quiz'){q.window.ZapmanEducation.blocked=true;q.window.ZapmanMobileControls.refresh();assert(q.pad.hidden);q.window.ZapmanEducation.blocked=false;q.window.ZapmanMobileControls.refresh();assert(!q.pad.hidden);}
 else q.listeners.get(reason)();assert.equal(q.sent.at(-1).type,'keyup');assert.equal(q.timers.size,0);
}
q=setup(true);assert(q.pad.hidden);q.document.body.classList.remove('picker-active');q.window.ZapmanMobileControls.refresh();assert(!q.pad.hidden);q.press('ArrowUp',1);q.document.body.classList.add('picker-active');q.window.ZapmanMobileControls.refresh();assert(q.pad.hidden);assert.equal(q.sent.at(-1).type,'keyup');
q=setup();const modal=q.setModal();q.window.ZapmanMobileControls.refresh();assert.equal(q.pad.parentElement,modal,'Arrows stay usable inside sports dialogs.');
q=setup();q.setFrame();q.press('ArrowRight',1);q.release('ArrowRight',1);assert.equal(q.sent.length,0);assert.equal(q.posts.length,2);assert(q.posts.every(p=>p.origin==='https://catboozle-arcade.cgesurrey.chatgpt.site'));
q=setup(false,true);q.press('ArrowRight',1);assert.equal(q.document.activeElement,q.menuControls[1]);assert(q.menuControls[1].clicked);q.release('ArrowRight',1);q.press('ArrowDown',2);assert.equal(q.document.activeElement,q.menuControls[2]);
// Catboozle accepts only arrow events from its own embedding parent.
const bridgeEvents=new Map(),received=[],parent={};const window={parent,addEventListener:(t,f)=>bridgeEvents.set(t,f),dispatchEvent:e=>received.push(e)};
vm.runInNewContext(fs.readFileSync(path.join(root,'games/online-arcade/mobile-bridge.js'),'utf8'),{window,document:{addEventListener(){}},KeyboardEvent:class{constructor(type,data){Object.assign(this,{type},data)}}});
const send=(data,from=parent)=>bridgeEvents.get('message')({source:from,data});
send({type:'zapman-mobile-key',code:'ArrowRight',eventType:'keydown'},{});send({type:'zapman-mobile-key',code:'KeyF',eventType:'keydown'});assert.equal(received.length,0);
send({type:'zapman-mobile-key',code:'ArrowRight',eventType:'keydown'});assert.equal(received[0].key,'ArrowRight');bridgeEvents.get('blur')();assert.equal(received.at(-1).type,'keyup');
for(const dir of fs.readdirSync(path.join(root,'games'))){const file=path.join(root,'games',dir,'index.html');if(fs.existsSync(file))assert(fs.readFileSync(file,'utf8').includes('game-picker-back.js'),dir+' loads the shared control entry point.');}
assert(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('game-picker-back.js'));assert(fs.readFileSync(path.join(root,'game-picker-back.js'),'utf8').includes('mobile-controls.js'));
console.log('Passed arrow forwarding, key/code compatibility, holds/repeats, two-finger directions, cancellation/blur/tab/quiz release, root-picker visibility, modal controls, Catboozle bridge and every local game entry point.');
