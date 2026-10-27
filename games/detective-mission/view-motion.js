/* Smooth rear camera and distance-driven walking poses. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.DetectiveMotion=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function reset(camera,player){Object.assign(camera,{x:player.x,z:player.z,gait:player.step,walking:0});return camera;}
  function create(player){return reset({},player);}
  function update(camera,player,dt){
    const follow=1-Math.exp(-9*dt),blend=1-Math.exp(-12*dt);
    camera.x+=(player.x-camera.x)*follow;camera.z+=(player.z-camera.z)*follow;
    camera.walking+=((player.speed>.05?1:0)-camera.walking)*blend;
    camera.gait=player.step;
  }
  function horizon(camera,height){return height*.35+Math.sin(camera.gait*3.5)*1.1*camera.walking;}
  function background(_camera,width,height,imageWidth,imageHeight){
    // The field is a fixed backdrop; only characters and effects follow the camera.
    const scale=Math.max(width/imageWidth,height/imageHeight)*1.2;
    const w=imageWidth*scale,h=imageHeight*scale;
    return {x:(width-w)/2,y:clamp(height*.35-h*.35,height-h,0),width:w,height:h};
  }
  function walkingPose(player){
    if(player.speed<=.05)return null;
    const phase=Math.floor(player.step*1.1)%4;
    return [0,-1,1,-1][player.moveZ<-.05?(4-phase)%4:phase];
  }
  return {create,reset,update,horizon,background,walkingPose};
});
