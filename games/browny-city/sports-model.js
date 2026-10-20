(() => {
  'use strict';
  const runners=[{id:'mia',name:'Mia',speed:94,description:'A steady runner'},{id:'finn',name:'Finn',speed:113,description:'A fast finisher'},{id:'ruby',name:'Ruby',speed:124,description:'The club champion'},{id:'mary',name:'Mary',speed:84,description:'A friendly first race'}];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function create(kind,options={},random=Math.random){
    const state={kind,time:0,paused:false,finished:false,won:false,result:'',score:0,opponentScore:0,cooldown:0,message:'',player:{x:480,y:505},opponent:{x:480,y:125},ball:null,rally:0,ready:true,role:options.role||'striker',nextBall:1,attempts:0,stamina:100,progress:0,racers:[],kickFlash:0};
    if(kind==='race')state.racers=runners.filter(r=>(options.opponents||[]).includes(r.id)).map(r=>({...r,progress:0}));
    if(kind==='football')state.player.y=state.role==='goalie'?505:state.role==='defender'?390:450;
    function finish(won,result){state.finished=true;state.won=won;state.result=result;state.ball=null;}
    function point(bob){state.score+=Number(bob);state.opponentScore+=Number(!bob);state.ready=true;state.ball=null;state.rally=0;state.player={x:480,y:505};state.message=bob?'Point to Bob! Press Space to serve.':'Point to Mia. Press Space for the next serve.';if(state.score>=5||state.opponentScore>=5)finish(state.score>=5,`Tennis: Bob ${state.score} — Mia ${state.opponentScore}`);}
    function footballRound(success){state.score+=Number(success);state.opponentScore+=Number(!success);state.attempts++;state.ball=null;state.nextBall=1.2;state.ready=true;state.message=success?(state.role==='striker'?'GOAL!':'Great stop, Bob!'):(state.role==='striker'?'Saved or wide. Try another shot!':'They scored. Get ready for the next attack!');state.player={x:480,y:state.role==='goalie'?505:state.role==='defender'?390:450};if(state.score>=(state.role==='striker'?3:5)||state.opponentScore>=(state.role==='striker'?5:3))finish(state.score>=(state.role==='striker'?3:5),`Football ${state.role}: ${state.score} successful ${state.role==='striker'?'goals':'stops'}, ${state.opponentScore} ${state.role==='striker'?'misses':'conceded'}`);}
    function action(input={}){
      if(state.finished||state.paused||state.cooldown>0)return;
      state.cooldown=.22;state.kickFlash=.18;
      if(kind==='race'){if(state.stamina>12){state.stamina-=12;state.burst=.7;}return;}
      const p=state.player;
      if(kind==='tennis'){
        if(state.ready){state.ready=false;state.opponent.reaction=.3;state.ball={x:p.x,y:p.y-30,vx:(random()-.5)*180,vy:-265};state.message='Rally! Move to the ball and press Space to swing.';return;}
        const b=state.ball;if(b&&b.vy>0&&Math.hypot(p.x-b.x,p.y-b.y)<74){b.vy=-Math.min(420,280+state.rally*12);b.vx=clamp((p.x-480)*.55+(input.x||0)*170,-250,250);state.rally++;state.opponent.reaction=.32;}
      }else if(kind==='football'){
        if(state.role==='striker'&&state.ready){state.ready=false;state.ball={x:p.x,y:p.y-24,vx:(input.x||0)*210,vy:-350};state.message='Watch the goalkeeper!';return;}
        if(state.ball&&Math.hypot(p.x-state.ball.x,p.y-state.ball.y)<(state.role==='goalie'?77:70)&&state.role!=='striker')footballRound(true);
      }
    }
    function update(dt,input={}){
      if(state.paused||state.finished||!Number.isFinite(dt)||dt<=0)return;
      dt=Math.min(dt,.04);state.time+=dt;state.cooldown=Math.max(0,state.cooldown-dt);state.kickFlash=Math.max(0,state.kickFlash-dt);
      const p=state.player,dx=input.x||0,dy=input.y||0,length=Math.max(1,Math.hypot(dx,dy));
      if(kind==='race'){
        const moving=input.run||dx>0||dy<0,fast=(input.sprint||state.burst>0)&&state.stamina>0;
        state.stamina=clamp(state.stamina+(fast?-23:14)*dt,0,100);state.burst=Math.max(0,(state.burst||0)-dt);
        if(moving)state.progress=Math.min(1000,state.progress+(fast?144:112)*dt);
        for(const r of state.racers)r.progress=Math.min(1000,r.progress+r.speed*dt);
        if(state.progress>=1000){const place=1+state.racers.filter(r=>r.progress>=1000).length;finish(place===1,`Bob finished #${place} out of ${state.racers.length+1}!`);}
        else if(state.time>=60)finish(false,'Race finished! Hold Right / D or the Run button to move, and use Space for a sprint burst.');
        return;
      }
      p.x=clamp(p.x+dx/length*300*dt,190,770);
      p.y=clamp(p.y+dy/length*260*dt,kind==='tennis'?365:state.role==='goalie'?445:190,550);
      if(kind==='tennis'){
        const b=state.ball;if(!b)return;
        state.opponent.reaction=Math.max(0,(state.opponent.reaction||0)-dt);if(state.opponent.reaction===0)state.opponent.x+=clamp(b.x-state.opponent.x,-115*dt,115*dt);
        b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<185||b.x>775){b.x=clamp(b.x,185,775);b.vx*=-1;}
        if(b.vy<0&&Math.hypot(b.x-state.opponent.x,b.y-state.opponent.y)<46){b.vy=Math.min(405,275+state.rally*8);b.vx=clamp((random()-.5)*380,-200,200);state.rally++;}
        if(b.y<65)point(true);else if(b.y>595)point(false);
      }else if(kind==='football'){
        if(state.role!=='striker'&&!state.ball){state.nextBall-=dt;if(state.nextBall<=0){state.ready=false;const x=250+random()*460,target=425+random()*110,vy=state.role==='goalie'?245:175;state.ball={x,y:130,vx:(target-x)/1.7,vy};}}
        const b=state.ball;if(!b)return;
        state.opponent.x+=clamp(b.x-state.opponent.x,-145*dt,145*dt);
        b.x+=b.vx*dt;b.y+=b.vy*dt;
        if(state.role==='striker'){
          if(b.y<155&&b.y>95&&Math.abs(b.x-state.opponent.x)<27)footballRound(false);
          else if(b.y<95)footballRound(b.x>=400&&b.x<=560);
          else if(b.x<165||b.x>795)footballRound(false);
        }else{
          if(Math.hypot(b.x-p.x,b.y-p.y)<25)footballRound(true);
          else if(b.y>550||b.x<165||b.x>795)footballRound(false);
        }
      }
      if(kind==='football'&&state.time>=75&&!state.finished)finish(state.score>state.opponentScore,`Full time! Bob ${state.score} — opponents ${state.opponentScore}`);
    }
    return {state,update,action,togglePause(){if(!state.finished)state.paused=!state.paused;}};
  }
  window.BrownySportsModel={create,runners};
})();
