/* Scroll-controlled product artwork; no scroll interception or animation library. */
(() => {
 'use strict';
 const scene=document.getElementById('heroSec'), home=document.getElementById('v-home');
 if(!scene||!home)return;
 const stage=scene.querySelector('.spotlight-stage'),art=scene.querySelector('.spotlight-art');
 const intro=scene.querySelector('.spotlight-intro'),rest=scene.querySelector('.spotlight-rest');
 const lift=scene.querySelector('.spotlight-lift'),dripper=scene.querySelector('.spotlight-dripper');
 const water=scene.querySelector('.spotlight-water'),cue=scene.querySelector('.spotlight-scroll');
 const one=scene.querySelector('.chapter-lift'),two=scene.querySelector('.chapter-pour');
 const bar=scene.querySelector('.spotlight-progress i'),toggle=document.getElementById('scene-motion-toggle');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),short=matchMedia('(max-height:649px)');
 let userStatic=false,broken=false,raf=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const range=(p,a,b)=>clamp((p-a)/(b-a));
 const smooth=x=>x*x*(3-2*x);
 const ar=()=>document.documentElement.dir==='rtl';
 const cueLabels={
  en:{lift:'Lift the kettle ↓',pour:'Watch the pour ↓',tools:'Explore the tools ↓'},
  ar:{lift:'ارفع الإبريق ↓',pour:'شاهد السكب ↓',tools:'اكتشف الأدوات ↓'}
 };
 function updateMode(){
  const unavailable=reduced.matches||short.matches||broken;
  const off=unavailable||userStatic;
  scene.dataset.static=String(off);
  toggle.hidden=unavailable;
  toggle.setAttribute('aria-pressed',String(off));
  toggle.textContent=ar()?(off?'تفعيل الحركة':'تقليل الحركة'):(off?'Enable motion':'Reduce motion');
  cue.hidden=off;
  const description=off
   ? (ar()?'إبريق أورفي على قاعدته':'ORPHE kettle on its base')
   : (ar()?'إبريق أورفي، من القاعدة إلى اليد ثم السكب برفق':'ORPHE kettle: from its base to the hand, then a gentle pour');
  scene.querySelector('[data-scene-art]').setAttribute('aria-label',description);
  if(!off && home.classList.contains('live')){
   art.querySelectorAll('img[data-src]:not([src])').forEach(img=>{img.src=img.dataset.src;});
  }
  schedule();
 }
 function paint(){
  raf=0;
  if(!home.classList.contains('live'))return;
  const p=scene.dataset.static==='true'?0:clamp(-scene.getBoundingClientRect().top/Math.max(1,scene.offsetHeight-stage.offsetHeight));
  scene.dataset.progress=p.toFixed(3);
  const next=p<.38?'lift':p<.82?'pour':'tools';
  const label=cueLabels[ar()?'ar':'en'][next];
  if(cue.textContent!==label)cue.textContent=label;
  cue.dataset.next=next;
  const enter=smooth(range(p,.2,.38)),pour=smooth(range(p,.52,.83));
  const introOut=smooth(range(p,.05,.25));
  intro.style.opacity=1-introOut;intro.style.transform=`translateY(${-introOut*70}px)`;
  rest.style.opacity=1-enter;rest.style.transform=`translateY(${-enter*24}px) scale(${1+enter*.06})`;
  lift.style.opacity=enter;
  if(scene.dataset.static==='true')return;
  const w=art.clientWidth,h=art.clientHeight,mobile=innerWidth<=760;
  const fit=Math.min(w/1536,h/1024),ox=(w-1536*fit)/2+510*fit,oy=(h-1024*fit)/2+475*fit;
  const tx=((1-enter)*-9+(mobile?-4-pour*8:-pour*6))*w/100,ty=((1-enter)*5-pour*12)*h/100;
  const angle=pour*22*Math.PI/180,scale=mobile?.75-pour*.1:1-pour*.2;
  lift.style.transformOrigin=`${ox}px ${oy}px`;
  lift.style.transform=`translate(${tx}px,${ty}px) rotate(${pour*22}deg) scale(${scale})`;
  const sx=(1480-510)*fit,sy=(254-475)*fit;
  const sourceX=ox+tx+scale*(sx*Math.cos(angle)-sy*Math.sin(angle));
  const sourceY=oy+ty+scale*(sx*Math.sin(angle)+sy*Math.cos(angle));
  const dfit=Math.min(dripper.clientWidth/1164,dripper.clientHeight/1351);
  const targetX=dripper.offsetLeft+(dripper.clientWidth-1164*dfit)/2+552*dfit;
  const targetY=dripper.offsetTop+(dripper.clientHeight-1351*dfit)/2+267*dfit;
  water.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const drop=Math.max(20,targetY-sourceY);
  const stream=`M ${sourceX} ${sourceY} C ${sourceX+6} ${sourceY+drop*.32} ${targetX} ${targetY-drop*.22} ${targetX} ${targetY}`;
  water.querySelectorAll('path').forEach(path=>path.setAttribute('d',stream));
  dripper.style.opacity=smooth(range(p,.47,.64));dripper.style.transform=`translateY(${(1-smooth(range(p,.47,.64)))*65}px)`;
  const flow=smooth(range(p,.78,.88))*(1-smooth(range(p,.95,1)));
  water.style.opacity=flow;
  water.querySelectorAll('path').forEach(path=>path.style.strokeDashoffset=400*(1-flow));
  const chapter1=smooth(range(p,.24,.37))*(1-smooth(range(p,.48,.59)));
  const chapter2=smooth(range(p,.57,.72));
  one.style.opacity=chapter1;one.style.transform=`translateY(${(1-chapter1)*20}px)`;
  two.style.opacity=chapter2;two.style.transform=`translateY(${(1-chapter2)*20}px)`;
  bar.style.transform=`scaleX(${p})`;
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(paint);}
 function route(){document.body.classList.toggle('spotlight-home',home.classList.contains('live'));updateMode();}
 new MutationObserver(route).observe(home,{attributes:true,attributeFilter:['class']});
 new MutationObserver(updateMode).observe(document.documentElement,{attributes:true,attributeFilter:['dir']});
 new ResizeObserver(schedule).observe(stage);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 addEventListener('pageshow',schedule);reduced.addEventListener('change',updateMode);short.addEventListener('change',updateMode);
 toggle.addEventListener('click',()=>{userStatic=!userStatic;updateMode();scene.scrollIntoView({behavior:'instant',block:'start'});});
 cue.addEventListener('click',()=>{
  if(cue.dataset.next==='tools'){
   const toolsSection=document.getElementById('home-tools');
   toolsSection.tabIndex=-1;
   toolsSection.focus({preventScroll:true});
   toolsSection.scrollIntoView({behavior:'smooth'});
   return;
  }
  const nextProgress=cue.dataset.next==='pour'?.9:.44;
  const start=scrollY+scene.getBoundingClientRect().top;
  const distance=scene.offsetHeight-stage.offsetHeight;
  window.scrollTo({top:start+distance*nextProgress,behavior:'smooth'});
 });
 scene.querySelectorAll('.spotlight-still img,.spotlight-art img').forEach(img=>{
  img.addEventListener('load',schedule,{once:true});
  const fail=()=>{broken=true;if(img===rest&&!rest.src.endsWith('orphe-navy-front-base.jpg')){rest.src='assets/orphe-navy-front-base.jpg';rest.style.background='var(--cream)';rest.style.borderRadius='5px';}updateMode();};
  img.addEventListener('error',fail,{once:true});
  if(img.hasAttribute('src')&&img.complete&&!img.naturalWidth)fail();
 });
 route();
})();
