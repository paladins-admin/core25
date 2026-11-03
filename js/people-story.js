/* Six native SVG bands: pile -> lift -> full-page dance -> ribbon wreath.
   All motion is tied to scroll; no running timer, bitmap, canvas, or scroll interception. */
(() => {
 const svg=document.querySelector(".page-ribbons");
 const story=document.querySelector(".people-story");
 if(!svg||!story)return;
 const paths=[...svg.querySelectorAll("[data-ribbon]")];
 const warmth=svg.querySelector(".ribbon-warmth");
 const dock=document.querySelector(".outcome-art");
 const bar=story.querySelector(".story-progress span");
 const caption=story.querySelector("[data-story-caption]");
 const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
 const playhead={progress:0};
 
const clamp = v => Math.max(0, Math.min(1, v));
const smooth = v => {const t=clamp(v);return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
function ribbonShape(i,p,w,h,finishX,finishY) {
 const mobile=w<701, lift=smooth((p-.025)/.22), settle=smooth((p-.72)/.27);
 const phase=i*Math.PI/3, radius=Math.min(w*(mobile?.23:.12),h*.20,125);
 const points=[], widths=[];
 for(let k=0;k<=72;k++){
  const u=k/72;
  const pileX=w*(mobile?.5:.70)+(u-.5)*Math.min(w*.48,335)+Math.sin(u*8+phase)*30;
  const pileY=h*(mobile?.29:.65)+Math.sin(u*10+phase)*15+i*5;
  const danceX=w*.5+Math.sin(u*Math.PI*2+phase+p*5)*w*.34;
  const danceY=h*.48+Math.sin(u*Math.PI*3+phase-p*7)*h*.30;
  const angle=phase-.95+u*2.0+p*.6;
  const r=radius+Math.sin(u*Math.PI*2+phase)*radius*.12;
  const wreathX=finishX+Math.cos(angle)*r;
  const wreathY=finishY+Math.sin(angle)*r*.9;
  points.push([mix(mix(pileX,danceX,lift),wreathX,settle),mix(mix(pileY,danceY,lift),wreathY,settle)]);
  // Width changes give the flat vector band the appearance of a gentle twist.
  widths.push((mobile?9:15)*( .62+.38*Math.sin(u*Math.PI))*(.45+.55*Math.abs(Math.cos(u*Math.PI*1.4+phase+p))));
 }
 const a=[],b=[];
 points.forEach((pt,k)=>{
  const prev=points[Math.max(0,k-1)],next=points[Math.min(72,k+1)];
  const dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1;
  a.push([(pt[0]-dy/len*widths[k]).toFixed(2),(pt[1]+dx/len*widths[k]).toFixed(2)]);
  b.push([(pt[0]+dy/len*widths[k]).toFixed(2),(pt[1]-dx/len*widths[k]).toFixed(2)]);
 });
 return "M"+a.map(pt=>pt.join(",")).join(" L")+" L"+b.reverse().map(pt=>pt.join(",")).join(" L")+" Z";
}

 let timeline=null,frame=0,lastCaption="";
 function render(){
  const w=window.innerWidth,h=window.innerHeight,p=clamp(playhead.progress);
  const rect=dock.getBoundingClientRect();
  const settle=smooth((p-.72)/.27);
  const finishX=mix(w*(w<701?.5:.7),rect.left+rect.width/2,settle);
  const finishY=mix(h*.5,Math.max(h*.23,Math.min(h*.77,rect.top+rect.height/2)),settle);
  svg.setAttribute("viewBox","0 0 "+w+" "+h);
  paths.forEach((path,i)=>path.setAttribute("d",ribbonShape(i,p,w,h,finishX,finishY)));
  warmth.setAttribute("cx",String(finishX));
  warmth.setAttribute("cy",String(finishY));
  warmth.setAttribute("r",String(Math.min(w*.3,220)));
  warmth.setAttribute("opacity",String(.06+.94*settle));
  bar.style.transform="scaleX("+p+")";
  const text=p<.08?"A little tension. A lot of possibility.":p<.3?"Make space for new directions.":p<.72?"Ideas in motion. Connections taking shape.":"Everything comes together.";
  if(text!==lastCaption){caption.textContent=text;lastCaption=text}
 }
 function update(){
  frame=0;
  if(motion.matches)return;
  const rect=dock.getBoundingClientRect();
  // Finish when the closing invitation is centred, rather than at the hero's end.
  const end=Math.max(1,window.scrollY+rect.top+rect.height/2-window.innerHeight*.5);
  const p=clamp(window.scrollY/end);
  if(timeline)timeline.seek(p*1000,true);else playhead.progress=p;
  render();
 }
 function requestUpdate(){if(!frame)frame=window.requestAnimationFrame(update)}
 function configure(){
  const active=!motion.matches;
  document.body.classList.toggle("ribbons-active",active);
  story.classList.toggle("is-animated",active);
  if(active)update();
  else{
   // Keep a quiet, static wreath in the original SVG coordinate system.
   svg.setAttribute("viewBox","0 0 1200 900");
   paths.forEach((path,i)=>path.setAttribute("d",ribbonShape(i,1,1200,900,840,450)));
   warmth.setAttribute("cx","840");warmth.setAttribute("cy","450");
   warmth.setAttribute("r","180");warmth.setAttribute("opacity",".5");
   bar.style.transform="scaleX(1)";
   caption.textContent="Everything comes together.";
  }
 }
 if(window.anime&&typeof window.anime.createTimeline==="function"){
  try{timeline=window.anime.createTimeline({autoplay:false}).add(playhead,{progress:[0,1],duration:1000,ease:"linear"})}catch(_){timeline=null}
 }
 window.addEventListener("scroll",requestUpdate,{passive:true});
 window.addEventListener("resize",requestUpdate,{passive:true});
 window.addEventListener("pageshow",requestUpdate);
 motion.addEventListener("change",configure);
 if(typeof ResizeObserver!=="undefined")new ResizeObserver(requestUpdate).observe(document.body);
 configure();
})();
