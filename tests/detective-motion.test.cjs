const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {Mission}=require('../games/detective-mission/mission-core.js');
const motion=require('../games/detective-mission/view-motion.js');
const make=()=>{const mission=new Mission(0,()=>.5);mission.start();mission.guards.forEach(g=>{g.cooldown=999;g.speed=0});return {mission,camera:motion.create(mission.player)}};
const tick=(pair,seconds,input={})=>{for(let left=seconds;left>1e-8;left-=1/120){const dt=Math.min(left,1/120);if(pair.mission.state==='playing'){pair.mission.update(dt,input);motion.update(pair.camera,pair.mission.player,dt);}}};
const photo=(camera)=>motion.background(camera,1200,700,1808,870);
let pair;
for(const input of [{right:true},{left:true},{forward:true},{backward:true}]){
 pair=make();const start=photo(pair.camera);tick(pair,1,input);
 assert.deepEqual(photo(pair.camera),start,'The field stays fixed in every walking direction.');
 assert(pair.mission.player.step>0,'Walking animation still advances.');
}
pair=make();tick(pair,1,{right:true});
assert(pair.camera.x>0&&pair.camera.x<pair.mission.player.x,'Character camera still follows smoothly.');
// Every legal player position stays covered, including a future portrait canvas.
for(const [width,height]of [[1200,700],[1600,900],[390,730]])for(const x of [-12,0,12])for(const z of [-3,0,70,145]){
 const camera={x,z,gait:1,walking:1},frame=motion.background(camera,width,height,1808,870);
 assert.deepEqual(frame,motion.background({x:0,z:0,gait:0,walking:0},width,height,1808,870),'Position, zoom and gait cannot move the backdrop.');
 assert(frame.x<=0&&frame.y<=0);assert(frame.x+frame.width>=width-.0001);assert(frame.y+frame.height>=height-.0001);
}
const player={speed:6,moveZ:6,step:0};
assert.deepEqual([.1,1,2,3].map(step=>motion.walkingPose({...player,step})),[0,-1,1,-1]);
assert.equal(motion.walkingPose({...player,speed:0}),null);
// Real movement drives the gait. Holding a key into a boundary must not moonwalk.
pair=make();tick(pair,.5,{forward:true});assert(pair.mission.player.step>2.9);assert(pair.mission.player.speed>5.9);
const walked=pair.mission.player.step;tick(pair,.5);assert.equal(pair.mission.player.step,walked);assert.equal(pair.mission.player.speed,0);assert.equal(motion.walkingPose(pair.mission.player),null);
pair.mission.player.x=12;const edgeStep=pair.mission.player.step;tick(pair,.2,{right:true});assert.equal(pair.mission.player.step,edgeStep);assert.equal(pair.mission.player.speed,0);
pair=make();tick(pair,.4,{forward:true});pair.mission.pause();const frozen=JSON.stringify(pair.camera),gait=pair.mission.player.step;tick(pair,1,{forward:true});assert.equal(JSON.stringify(pair.camera),frozen);assert.equal(pair.mission.player.step,gait);
pair.mission.start();motion.reset(pair.camera,pair.mission.player);assert.equal(pair.camera.x,0);assert.equal(pair.camera.z,0);assert.equal(pair.camera.walking,0);assert.equal(pair.mission.player.step,0);
const root=path.resolve(__dirname,'../games/detective-mission'),scope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'art-data.js'),'utf8'),scope);
const art=scope.window.DetectiveArt.walking,buffer=fs.readFileSync(path.join(root,'assets/walking.png'));
assert.equal(art.length,2);assert.equal(buffer[25],6,'Walking art has a genuine PNG alpha channel.');
const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20);
for(const row of art){assert.equal(row.length,5);for(const [x,y,w,h]of row){assert(x>=0&&y>=0&&w>100&&h>300);assert(x+w<=width&&y+h<=height);}}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.indexOf('view-motion.js')<html.indexOf('src="game.js"'));
console.log('Passed fixed landscape in all four directions, smooth character follow, covered camera bounds, alternating footsteps for five detectives, idle/boundary stopping, pause/restart and transparent complete-body walking assets.');
