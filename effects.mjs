const featherURL = new URL('./assets/feather.webp', import.meta.url).href;
let effectRoot;
const activeBursts = new Set();

export function featherBurst(anchor, reduced) {
 if (reduced || !anchor || typeof anchor.animate !== 'function') return;
 effectRoot ||= document.querySelector('#feather-bursts');
 const box = anchor.getBoundingClientRect();
 for (let i = 0; i < 4; i++) {
  const feather = document.createElement('img');
  feather.src = featherURL; feather.alt = ''; feather.className = 'success-feather';
  feather.style.left = `${box.left + box.width / 2}px`;
  feather.style.top = `${box.top + box.height / 2}px`;
  feather.style.width = `${35 + i * 7}px`;
  effectRoot.append(feather); activeBursts.add(feather);
  const dx = [-84,-30,40,94][i];
  const animation = feather.animate([
   {opacity:0, transform:`translate(-50%,-50%) rotate(${i * 15 - 30}deg) scale(.4)`},
   {opacity:.85, offset:.2, transform:`translate(calc(-50% + ${dx * .3}px),-65px) rotate(${i * 25}deg) scale(1)`},
   {opacity:0, transform:`translate(calc(-50% + ${dx}px),-${105 + i * 15}px) rotate(${i * 35 + 28}deg) scale(.7)`}
  ], {duration:1450 + i * 90, delay:i * 50, easing:'cubic-bezier(.16,.7,.35,1)',fill:'both'});
  animation.finished.catch(()=>{}).finally(()=>{feather.remove();activeBursts.delete(feather);});
 }
}
export function completionFeathers(dialog, reduced) {
 const root = dialog.querySelector('.completion-feathers');
 root.replaceChildren();
 if (reduced || typeof dialog.animate !== 'function') return;
 for(let i=0;i<8;i++){
  const img=document.createElement('img');img.src=featherURL;img.alt='';
  const left=i<4?4+i*4:82+(i-4)*3;
  img.style.left=`${left}%`;img.style.top=`${12+(i%4)*18}%`;
  img.style.width=`${28+(i%3)*9}px`;root.append(img);
  img.animate([
   {opacity:0,transform:`translateY(28px) rotate(${i*31}deg) scale(.7)`},
   {opacity:.68,offset:.3,transform:`translateY(0) rotate(${i*31+20}deg) scale(1)`},
   {opacity:.3,transform:`translateY(-26px) rotate(${i*31+38}deg) scale(.85)`}
  ],{duration:3600+i*140,delay:i*60,easing:'ease-out',fill:'both'});
 }
}

export function initFeatherEffects(reducedMotion, finePointer) {
 const canvas=document.querySelector('#ink-trail');
 const context=canvas.getContext('2d');
 const cursor=new Image();
 cursor.onload=()=>document.documentElement.classList.add('quill-ready');
 cursor.src=new URL('./assets/quill-cursor.png',import.meta.url).href;
 if(!context)return;
 let points=[],rings=[],frame=0,width=0,height=0,dpr=1,lastPointTime=0;
 const enabled=()=>!reducedMotion.matches&&finePointer.matches&&!document.hidden;
 function resize(){
  width=window.innerWidth;height=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  context.setTransform(dpr,0,0,dpr,0,0);
 }
 function start(){if(!frame)frame=requestAnimationFrame(draw);}
 function draw(now){
  frame=0;context.clearRect(0,0,width,height);
  if(!enabled()){points=[];rings=[];return;}
  points=points.filter(p=>now-p.time<430);rings=rings.filter(r=>now-r.time<680);
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];if(b.time-a.time>80)continue;
   const opacity=(1-(now-b.time)/430)*.29;
   context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);
   context.strokeStyle=`rgba(55,139,184,${opacity})`;context.lineWidth=1.4*(1-(now-b.time)/600);context.lineCap='round';context.stroke();
  }
  for(const ring of rings){
   const age=(now-ring.time)/680;
   context.beginPath();context.arc(ring.x,ring.y,4+age*27,0,Math.PI*2);
   context.lineWidth=1-age*.6;context.strokeStyle=`rgba(67,157,194,${(1-age)*.46})`;context.stroke();
   context.beginPath();context.arc(ring.x,ring.y,3+age*17,0,Math.PI*2);
   context.strokeStyle=`rgba(135,209,228,${(1-age)*.36})`;context.stroke();
  }
  if(points.length||rings.length)start();
 }
 function clear(){
  if(frame)cancelAnimationFrame(frame);frame=0;points=[];rings=[];context.clearRect(0,0,width,height);
  document.querySelectorAll('.board-panel,.question-panel').forEach(panel=>{panel.style.removeProperty('--glow-x');panel.style.removeProperty('--glow-y');});
  activeBursts.forEach(feather=>{feather.getAnimations().forEach(a=>a.cancel());feather.remove();});activeBursts.clear();
 }
 window.addEventListener('pointermove',event=>{
  if(!enabled()||event.pointerType!=='mouse')return;
  const now=performance.now();if(now-lastPointTime<12)return;lastPointTime=now;
  points.push({x:event.clientX,y:event.clientY,time:now});if(points.length>40)points.shift();start();
  const panel=event.target.closest?.('.board-panel,.question-panel');
  if(panel){const rect=panel.getBoundingClientRect();panel.style.setProperty('--glow-x',`${event.clientX-rect.left}px`);panel.style.setProperty('--glow-y',`${event.clientY-rect.top}px`);}
 },{passive:true});
 window.addEventListener('pointerdown',event=>{
  if(!enabled()||event.pointerType!=='mouse')return;
  rings.push({x:event.clientX,y:event.clientY,time:performance.now()});if(rings.length>6)rings.shift();start();
 },{passive:true});
 window.addEventListener('resize',()=>{clear();resize();},{passive:true});
 window.addEventListener('blur',clear);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)clear();});
 finePointer.addEventListener('change',()=>{if(!finePointer.matches)clear();});
 resize();
}
