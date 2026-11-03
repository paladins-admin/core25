/* Six native SVG bands: pile -> lift -> full-page dance -> ribbon wreath.
   All motion is tied to scroll; no running timer, bitmap, canvas, or scroll interception. */
(() => {
 const svg=document.querySelector(".page-ribbons");
 const story=document.querySelector(".people-story");
 if(!svg||!story)return;
 const paths=[...svg.querySelectorAll("[data-ribbon]")];
 const warmth=svg.querySelector(".ribbon-warmth");
 const slots=[...document.querySelectorAll(".ribbon-slot")];
 const copyBlocks=[...document.querySelectorAll(".ribbon-copy")];
 const dock=slots[slots.length-1];
 const mask=svg.querySelector("#ribbon-copy-mask");
 const maskBase=svg.querySelector(".ribbon-mask-base");
 const exclusions=svg.querySelector(".ribbon-copy-exclusions");
 const exclusionRects=copyBlocks.map(()=>{
  const rect=document.createElementNS("http://www.w3.org/2000/svg","rect");
  exclusions.appendChild(rect);return rect;
 });
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
  const pileX=w*.5+(u-.5)*Math.min(w*.48,335)+Math.sin(u*8+phase)*30;
  const pileY=h*.65+Math.sin(u*10+phase)*15+i*5;
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
  const rects=slots.map(slot=>slot.getBoundingClientRect());
  const first=rects[0],last=rects[rects.length-1],screenY=h*.5;
  let a=first,b=first,t=0;
  if(screenY>=last.top+last.height/2){a=b=last}
  else if(screenY<=first.top+first.height/2){a=b=first}
  else for(let j=0;j<rects.length-1;j++){
   const c1=rects[j].top+rects[j].height/2,c2=rects[j+1].top+rects[j+1].height/2;
   if(screenY>=c1&&screenY<=c2){a=rects[j];b=rects[j+1];t=smooth((screenY-c1)/(c2-c1));break}
  }
  const cx=mix(a.left+a.width/2,b.left+b.width/2,t);
  const cy=mix(a.top+a.height/2,b.top+b.height/2,t);
  const boxW=Math.max(1,Math.min(a.width,b.width)-36);
  const boxH=Math.max(1,Math.min(a.height,b.height));
  svg.setAttribute("viewBox","0 0 "+w+" "+h);
  paths.forEach((path,i)=>{
   path.setAttribute("d",ribbonShape(i,p,boxW,boxH,boxW*.5,boxH*.5));
   path.setAttribute("transform","translate("+(cx-boxW*.5)+" "+(cy-boxH*.5)+")");
  });
  const settle=smooth((p-.72)/.27);
  warmth.setAttribute("cx",String(cx));
  warmth.setAttribute("cy",String(cy));
  warmth.setAttribute("r",String(Math.min(boxW*.45,180)));
  warmth.setAttribute("opacity",String(.06+.94*settle));
  // An explicit exclusion mask guarantees no vector or glow sits underneath copy,
  // including during side changes, long text, zoom and responsive reflow.
  mask.setAttribute("width",String(w));mask.setAttribute("height",String(h));
  maskBase.setAttribute("width",String(w));maskBase.setAttribute("height",String(h));
  copyBlocks.forEach((copy,i)=>{
   const r=copy.getBoundingClientRect(),pad=24,node=exclusionRects[i];
   node.setAttribute("x",String(r.left-pad));node.setAttribute("y",String(r.top-pad));
   node.setAttribute("width",String(r.width+pad*2));node.setAttribute("height",String(r.height+pad*2));
  });
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
   exclusionRects.forEach(rect=>rect.setAttribute("width","0"));
   mask.setAttribute("width","1200");mask.setAttribute("height","900");
   maskBase.setAttribute("width","1200");maskBase.setAttribute("height","900");
   paths.forEach((path,i)=>{path.removeAttribute("transform");path.setAttribute("d",ribbonShape(i,1,1200,900,300,450))});
   warmth.setAttribute("cx","300");warmth.setAttribute("cy","450");
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
