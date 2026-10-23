/* Observe game outcomes; audio never changes game state or input. */
(() => {
  'use strict';
  const audio=window.ZapmanArcadeAudio;if(!audio||['zapman','bye-cycle','super-shuriken','browny-city','8-bit-alley'].includes(audio.game))return;
  const number=(value,fallback=0)=>typeof value==='number'&&Number.isFinite(value)?value:fallback;
  audio.register(()=>{
    const aState=typeof state!=='undefined'?state:null,aObject=aState&&typeof aState==='object'?aState:typeof game==='object'&&game?game:{};
    const aPlayer=typeof player!=='undefined'&&player?player:aObject.player||{};
    const aWon=(typeof won==='boolean'&&won)||aObject.won||aObject.mode==='won'||aState==='won'||(typeof victory==='boolean'&&victory);
    const aLost=(typeof gameOver==='boolean'&&gameOver)||aObject.gameOver||aObject.over||aObject.mode==='lost'||['lost','gameover'].includes(aState);
    const aPaused=(typeof paused==='boolean'&&paused)||aObject.paused;
    const aRunning=typeof running==='boolean'?running:typeof gameStarted==='boolean'?gameStarted:typeof started==='boolean'?started:typeof aObject.running==='boolean'?aObject.running:typeof aObject.active==='boolean'?aObject.active:typeof scene==='string'?!['title','menu','dead','ending'].includes(scene):!['intro','menu','title','select','ready','spent'].includes(aState);
    const aShots=typeof bullets!=='undefined'&&Array.isArray(bullets)?bullets:typeof projectiles!=='undefined'&&Array.isArray(projectiles)?projectiles:aObject.bullets||[];
    const aReward=typeof aObject.coins==='number'?aObject.coins:typeof aPlayer.coins==='number'?aPlayer.coins:typeof score==='number'?score:typeof dodged==='number'?dodged:number(aObject.score);
    const aLevel=typeof currentLevel==='number'?currentLevel:typeof level==='number'?level:typeof levelIndex==='number'?levelIndex:number(aObject.level||aObject.missionIndex);
    const aHealth=number(aPlayer.health??aPlayer.hearts??aPlayer.hp??aPlayer.lives??aObject.health??aObject.hearts,5);
    return {active:Boolean(aRunning),paused:Boolean(aPaused),lost:Boolean((aLost||aHealth<=0)&&!aWon),won:Boolean(aWon),health:aHealth,reward:aReward,level:aLevel,shots:aShots.length,jump:(typeof aPlayer.onGround==='boolean'||typeof aPlayer.grounded==='boolean'||audio.profiles[audio.game]?.mood==='platform')&&number(aPlayer.vy??aPlayer.vz)<-1};
  });
})();
