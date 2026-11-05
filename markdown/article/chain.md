---
title: Chain Geometry
desc: A working model of a bicyle chain
image: /static/chain.png
template: template_page.html
---

<style>
.chain-drive { font-family: inherit; color: inherit; line-height: 1.5; }
.chain-drive p { color: inherit; }
.chain-drive .toolbar { display: flex; flex-wrap: wrap; align-items: end; gap: 13px; margin-bottom: 12px; }
.chain-drive label { display: flex; flex-direction: column; gap: 4px; font-size: 1rem; }
.chain-drive input, .chain-drive button, .chain-drive output { font: inherit; color: inherit; }
.chain-drive input[type=range] { width: 210px; max-width: 100%; accent-color: #d94f30; cursor: pointer; }
.chain-drive .slider-control { min-width: 190px; }
.chain-drive output { font-weight: 600; font-variant-numeric: tabular-nums; }
.chain-drive input:focus-visible, .chain-drive button:focus-visible { outline: 2px solid #d94f30; outline-offset: 4px; }
.chain-drive button { background: #fff8ed; border: 1px solid #6a4a2c; border-radius: 5px; padding: 9px 15px; cursor: pointer; }
.chain-drive button:hover { background: #ffdd99; }
.chain-drive .toggles { display: flex; flex-wrap: wrap; gap: 16px; margin: 10px 0 14px; }
.chain-drive .toggles label, .chain-drive .colors label { flex-direction: row; align-items: center; gap: 7px; }
.chain-drive input[type=checkbox] { accent-color: #d94f30; }
.chain-drive input[type=color] { width: 43px; height: 30px; padding: 2px; border: 1px solid #6a4a2c; border-radius: 4px; background: #fff8ed; cursor: pointer; }
.chain-drive .colors { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin: 5px 0 16px; }
.chain-drive .colors strong { font-size: 1rem; font-weight: 600; }
.chain-drive svg { display: block; width: 100%; height: auto; background: #fff; border: 1px solid rgba(0,0,0,.15); border-radius: 6px; }
.chain-drive #info { margin-top: 10px; font-size: 1rem; }
.chain-drive #error { color: #d94f30; min-height: 1.2em; font-size: 1rem; }
.chain-drive .hint { margin-top: 8px; font-size: 1rem; }
</style>

<div class="chain-drive">
<div class="toolbar"><label class="slider-control" for="t2">Left sprocket (T2): <output id="t2value" for="t2">20</output><input id="t2" type="range" min="12" max="54" step="2" value="20"></label><label class="slider-control" for="t1">Right sprocket (T1): <output id="t1value" for="t1">40</output><input id="t1" type="range" min="12" max="54" step="2" value="40"></label><label class="slider-control" for="links">Chain links: <output id="linksvalue" for="links">100</output><input id="links" type="range" min="40" max="100" step="2" value="100"></label><button id="play">▶ Play</button><button id="reset">Reset</button><button id="save">Save SVG</button></div>
<div class="toggles"><label><input id="lightPlates" type="checkbox" checked> Light plates</label><label><input id="darkPlates" type="checkbox" checked> Dark plates</label><label><input id="rollers" type="checkbox" checked> Rollers</label><label><input id="rivets" type="checkbox" checked> Rivets</label><label><input id="dimension" type="checkbox"> Show center distance C</label></div>
<div class="colors" aria-label="Component colors"><strong>Colors</strong><label>Sprockets <input id="sprocketColor" type="color" value="#a0a0a0"></label><label>Light plates <input id="lightPlateColor" type="color" value="#c6c6c6"></label><label>Dark plates <input id="darkPlateColor" type="color" value="#565656"></label><label>Rollers <input id="rollerColor" type="color" value="#e4e4e4"></label><label>Rivets <input id="rivetColor" type="color" value="#303030"></label></div>
<div id="error" role="status"></div><svg id="drawing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 360" aria-label="Animated two-sprocket chain drive"></svg>
<div id="info"></div><div class="hint">Light inner plates are drawn behind the overlapping dark outer plates, as in a real chain. Roller and plate bores are visible when rivets are hidden. Both straight runs follow the common external tangents. Tooth-pocket phases are registered to rollers on each sprocket; small residual misalignment is expected because rivets are spaced along a continuous path rather than on exact pitch-polygon vertices.</div>
<script>
(()=>{'use strict';
const ns='http://www.w3.org/2000/svg', pitch=12.7, rollerR=3.96875;
const $=id=>document.getElementById(id), svg=$('drawing');
let scene=svg;
let geom=null, running=false, travel=0, last=0, frame=0;
const make=(tag,attrs={},parent=scene)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));parent.appendChild(e);return e;};
function radius(n){return pitch/(2*Math.sin(Math.PI/n));}
function geometry(n1,n2,count){const r1=radius(n1),r2=radius(n2),target=count*pitch;
 function parts(C){const nx=(r1-r2)/C, nz=Math.sqrt(1-nx*nx), a=Math.atan2(nz,nx), L=Math.sqrt(C*C-(r2-r1)**2), len=[L,2*a*r2,L,(2*Math.PI-2*a)*r1];return {C,r1,r2,nx,nz,a,L,len,total:len.reduce((s,v)=>s+v,0)};}
 let lo=Math.abs(r2-r1)+.0001,hi=Math.max(100,target);
 if(parts(lo).total>target)throw Error('Too few links for these sprockets. Increase the link count.');
 while(parts(hi).total<target)hi*=2;
 for(let i=0;i<65;i++){const mid=(lo+hi)/2;if(parts(mid).total<target)lo=mid;else hi=mid;}
 const result={...parts((lo+hi)/2),n1,n2,count};
 // Two pitch circles must not overlap; also allow for the actual tooth-tip disks.
 if(result.C<=result.r1+result.r2+2)throw Error('Sprocket collision: too few links for this tooth-count combination. Increase the number of links.');
 return result;}
function point(s,g){const {C,r1,r2,nx,nz,a,L,len,total}=g;s=((s%total)+total)%total;
 const ux=nz,uz=-nx;
 if(s<len[0])return [r1*nx+ux*s,r1*nz+uz*s];s-=len[0];
 if(s<len[1]){const th=a-s/r2;return [C+r2*Math.cos(th),r2*Math.sin(th)];}s-=len[1];
 if(s<len[2])return [C+r2*nx-ux*s,-r2*nz-nx*s];s-=len[2];
 const th=-a-s/r1;return [r1*Math.cos(th),r1*Math.sin(th)];}
function circlePath(cx,cy,r){return `M ${cx+r} ${cy} A ${r} ${r} 0 1 0 ${cx-r} ${cy} A ${r} ${r} 0 1 0 ${cx+r} ${cy} Z`;}
function sprocket(cx,r,n,phase,id){
 const group=make('g',{'data-sprocket':id}),disk=r+1,cut=Math.max(0,r-10);
 const defs=make('defs',{},group),mask=make('mask',{id:`pocket-${id}`,maskUnits:'userSpaceOnUse',x:cx-disk-25,y:-disk-25,width:2*disk+50,height:2*disk+50},defs);
 make('circle',{cx,cy:0,r:disk+2,fill:'white'},mask);
 make('circle',{cx,cy:0,r:cut,fill:'black'},mask);
 for(let j=0;j<n;j++){
 const ang=2*Math.PI*j/n+phase,x=cx+r*Math.cos(ang),y=r*Math.sin(ang);
 make('circle',{cx:x,cy:y,r:rollerR,fill:'black'},mask);
 const length=20,A=30*Math.PI/180;
 for(const sign of [-1,1]){
 const ca=Math.cos(ang+sign*A),sa=Math.sin(ang+sign*A);
 const pts=[[0,-rollerR],[length,-rollerR],[length,rollerR],[0,rollerR]];
 make('polygon',{points:pts.map(([u,v])=>`${x+u*ca-v*sa},${y+u*sa+v*ca}`).join(' '),fill:'black'},mask);
 }
 }
 make('circle',{cx,cy:0,r:disk,fill:$('sprocketColor').value,mask:`url(#pocket-${id})`},group);
 return group;
}
function draw(){svg.replaceChildren();scene=svg;if(!geom)return;const g=geom;
 const pad=rollerR+12;
 // Fit both complete sprockets and chain runs while retaining x=C/2 as the viewport midpoint.
 const halfWidth=Math.max(g.C/2+g.r1+pad,g.C/2+g.r2+pad);
 const halfHeight=Math.max(g.r1,g.r2)+pad;
 const showDimension=$('dimension').checked;
 const left=g.C/2-halfWidth,right=g.C/2+halfWidth,top=-halfHeight,bottom=halfHeight;
 const width=right-left,height=bottom-top;svg.setAttribute('viewBox',`${left} ${top} ${width} ${height}`);
 make('rect',{x:left,y:top,width,height,fill:'white'});
 // Mirror the complete mechanism about x=C/2: T1 on the right, T2 on the left.
 scene=make('g',{transform:`translate(${g.C} 0) scale(-1 1)`},svg);
 const pins=Array.from({length:g.count},(_,i)=>point(i*pitch+travel,g));
 // Register each sprocket's tooth-pocket pattern to a nearby roller on its wrap.
 // The angular tooth pitch is exact; roller locations still use the continuous path.
 function alignedPhase(cx,r,n,desiredAngle){
   const step=2*Math.PI/n;
   let best=null,err=Infinity;
   for(const p of pins){
     const dx=p[0]-cx,dy=p[1],rad=Math.hypot(dx,dy);
     if(Math.abs(rad-r)>1e-5)continue;
     const a=Math.atan2(dy,dx);
     const d=Math.abs(Math.atan2(Math.sin(a-desiredAngle),Math.cos(a-desiredAngle)));
     if(d<err){err=d;best=a;}
   }
   return best===null?0:((best%step)+step)%step;
 }
 const a1=alignedPhase(0,g.r1,g.n1,Math.PI);
 const a2=alignedPhase(g.C,g.r2,g.n2,0);
 sprocket(0,g.r1,g.n1,a1,'front');sprocket(g.C,g.r2,g.n2,a2,'rear');

 // Approved rounded sideplate profile, rendered as fill-only geometry.
 // Coordinates are centered between rivets, which are 12.7 mm apart.
 const approvedPlatePath = 'M -4.48235,4.63809 L -4.33995,4.58180 L -4.19684,4.52734 L -4.05305,4.47470 L -3.90860,4.42390 L -3.76351,4.37495 L -3.61781,4.32786 L -3.47152,4.28263 L -3.32466,4.23926 L -3.17727,4.19778 L -3.02935,4.15818 L -2.88094,4.12047 L -2.73207,4.08466 L -2.58275,4.05075 L -2.43300,4.01875 L -2.28287,3.98866 L -2.13236,3.96049 L -1.98150,3.93424 L -1.83032,3.90992 L -1.67884,3.88753 L -1.52709,3.86708 L -1.37509,3.84856 L -1.22287,3.83198 L -1.07045,3.81735 L -0.91785,3.80467 L -0.76510,3.79393 L -0.61223,3.78514 L -0.45926,3.77830 L -0.30622,3.77342 L -0.15312,3.77049 L 0.00000,3.76951 L 0.15312,3.77049 L 0.30622,3.77342 L 0.45926,3.77830 L 0.61223,3.78514 L 0.76510,3.79393 L 0.91785,3.80467 L 1.07045,3.81735 L 1.22287,3.83198 L 1.37509,3.84856 L 1.52709,3.86708 L 1.67884,3.88753 L 1.83032,3.90992 L 1.98150,3.93424 L 2.13236,3.96049 L 2.28287,3.98866 L 2.43300,4.01875 L 2.58275,4.05075 L 2.73207,4.08466 L 2.88094,4.12047 L 3.02935,4.15818 L 3.17727,4.19778 L 3.32466,4.23926 L 3.47152,4.28263 L 3.61781,4.32786 L 3.76351,4.37495 L 3.90860,4.42390 L 4.05305,4.47470 L 4.19684,4.52734 L 4.33995,4.58180 L 4.48235,4.63809 L 4.48235,4.63809 L 4.78813,4.74980 L 5.10053,4.84137 L 5.41823,4.91241 L 5.73987,4.96264 L 6.06411,4.99182 L 6.38955,4.99984 L 6.71483,4.98667 L 7.03856,4.95236 L 7.35937,4.89706 L 7.67590,4.82099 L 7.98682,4.72449 L 8.29079,4.60796 L 8.58654,4.47190 L 8.87280,4.31688 L 9.14837,4.14356 L 9.41208,3.95268 L 9.66281,3.74504 L 9.89949,3.52152 L 10.12113,3.28308 L 10.32678,3.03072 L 10.51557,2.76551 L 10.68670,2.48857 L 10.83945,2.20109 L 10.97317,1.90428 L 11.08729,1.59939 L 11.18133,1.28773 L 11.25489,0.97060 L 11.30765,0.64936 L 11.33940,0.32537 L 11.35000,0.00000 L 11.33940,-0.32537 L 11.30765,-0.64936 L 11.25489,-0.97060 L 11.18133,-1.28773 L 11.08729,-1.59939 L 10.97317,-1.90428 L 10.83945,-2.20109 L 10.68670,-2.48857 L 10.51557,-2.76551 L 10.32678,-3.03072 L 10.12113,-3.28308 L 9.89949,-3.52152 L 9.66281,-3.74504 L 9.41208,-3.95268 L 9.14837,-4.14356 L 8.87280,-4.31688 L 8.58654,-4.47190 L 8.29079,-4.60796 L 7.98682,-4.72449 L 7.67590,-4.82099 L 7.35937,-4.89706 L 7.03856,-4.95236 L 6.71483,-4.98667 L 6.38955,-4.99984 L 6.06411,-4.99182 L 5.73987,-4.96264 L 5.41823,-4.91241 L 5.10053,-4.84137 L 4.78813,-4.74980 L 4.48235,-4.63809 L 4.48235,-4.63809 L 4.33995,-4.58180 L 4.19684,-4.52734 L 4.05305,-4.47470 L 3.90860,-4.42390 L 3.76351,-4.37495 L 3.61781,-4.32786 L 3.47152,-4.28263 L 3.32466,-4.23926 L 3.17727,-4.19778 L 3.02935,-4.15818 L 2.88094,-4.12047 L 2.73207,-4.08466 L 2.58275,-4.05075 L 2.43300,-4.01875 L 2.28287,-3.98866 L 2.13236,-3.96049 L 1.98150,-3.93424 L 1.83032,-3.90992 L 1.67884,-3.88753 L 1.52709,-3.86708 L 1.37509,-3.84856 L 1.22287,-3.83198 L 1.07045,-3.81735 L 0.91785,-3.80467 L 0.76510,-3.79393 L 0.61223,-3.78514 L 0.45926,-3.77830 L 0.30622,-3.77342 L 0.15312,-3.77049 L 0.00000,-3.76951 L -0.15312,-3.77049 L -0.30622,-3.77342 L -0.45926,-3.77830 L -0.61223,-3.78514 L -0.76510,-3.79393 L -0.91785,-3.80467 L -1.07045,-3.81735 L -1.22287,-3.83198 L -1.37509,-3.84856 L -1.52709,-3.86708 L -1.67884,-3.88753 L -1.83032,-3.90992 L -1.98150,-3.93424 L -2.13236,-3.96049 L -2.28287,-3.98866 L -2.43300,-4.01875 L -2.58275,-4.05075 L -2.73207,-4.08466 L -2.88094,-4.12047 L -3.02935,-4.15818 L -3.17727,-4.19778 L -3.32466,-4.23926 L -3.47152,-4.28263 L -3.61781,-4.32786 L -3.76351,-4.37495 L -3.90860,-4.42390 L -4.05305,-4.47470 L -4.19684,-4.52734 L -4.33995,-4.58180 L -4.48235,-4.63809 L -4.48235,-4.63809 L -4.78813,-4.74980 L -5.10053,-4.84137 L -5.41823,-4.91241 L -5.73987,-4.96264 L -6.06411,-4.99182 L -6.38955,-4.99984 L -6.71483,-4.98667 L -7.03856,-4.95236 L -7.35937,-4.89706 L -7.67590,-4.82099 L -7.98682,-4.72449 L -8.29079,-4.60796 L -8.58654,-4.47190 L -8.87280,-4.31688 L -9.14837,-4.14356 L -9.41208,-3.95268 L -9.66281,-3.74504 L -9.89949,-3.52152 L -10.12113,-3.28308 L -10.32678,-3.03072 L -10.51557,-2.76551 L -10.68670,-2.48857 L -10.83945,-2.20109 L -10.97317,-1.90428 L -11.08729,-1.59939 L -11.18133,-1.28773 L -11.25489,-0.97060 L -11.30765,-0.64936 L -11.33940,-0.32537 L -11.35000,-0.00000 L -11.33940,0.32537 L -11.30765,0.64936 L -11.25489,0.97060 L -11.18133,1.28773 L -11.08729,1.59939 L -10.97317,1.90428 L -10.83945,2.20109 L -10.68670,2.48857 L -10.51557,2.76551 L -10.32678,3.03072 L -10.12113,3.28308 L -9.89949,3.52152 L -9.66281,3.74504 L -9.41208,3.95268 L -9.14837,4.14356 L -8.87280,4.31688 L -8.58654,4.47190 L -8.29079,4.60796 L -7.98682,4.72449 L -7.67590,4.82099 L -7.35937,4.89706 L -7.03856,4.95236 L -6.71483,4.98667 L -6.38955,4.99984 L -6.06411,4.99182 L -5.73987,4.96264 L -5.41823,4.91241 L -5.10053,4.84137 L -4.78813,4.74980 L -4.48235,4.63809 Z';
 // Rollers sit beneath the sideplates in the two-dimensional assembly view.
 if($('rollers').checked)for(const p of pins){
   // A hollow roller: the center is genuinely transparent, not painted white.
   const holeR=1.8;
   make('path',{d:circlePath(p[0],p[1],rollerR)+' '+circlePath(p[0],p[1],holeR),
     'fill-rule':'evenodd',fill:$('rollerColor').value});
 }
 // Physical stacking order: inner plates (even links) first, outer plates
 // (odd links) second. This is independent of the order along the chain,
 // so every outer plate overlaps BOTH neighboring inner plates, even at
 // the closure between the last and first links.
 function drawPlate(i){
   const a=pins[i],b=pins[(i+1)%g.count];
   const dx=b[0]-a[0],dy=b[1]-a[1];
   const length=Math.hypot(dx,dy);
   if(length<1e-6)return;
   const angle=Math.atan2(dy,dx)*180/Math.PI;
   const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
   const group=make('g',{transform:`translate(${mx} ${my}) rotate(${angle}) scale(${length/pitch} 1)`});
   // The two pin holes are cut out of the approved outer profile.
   const pinHoleR=1.8;
   const holes=circlePath(-pitch/2,0,pinHoleR)+' '+circlePath(pitch/2,0,pinHoleR);
   make('path',{d:approvedPlatePath+' '+holes,'fill-rule':'evenodd',fill:i%2?$('darkPlateColor').value:$('lightPlateColor').value},group);
 }
 if($('lightPlates').checked)for(let i=0;i<g.count;i+=2)drawPlate(i); // inner, behind
 if($('darkPlates').checked)for(let i=1;i<g.count;i+=2)drawPlate(i); // outer, in front
 if($('rivets').checked)for(const p of pins)make('circle',{cx:p[0],cy:p[1],r:1.55,fill:$('rivetColor').value});
 // Dimension C lies on the centerline, between the two sprocket centers.
 // Draw last so it remains visible over the sprocket disks.
 if(showDimension){
   scene=svg;
   const y=0, arrow=4.5;
   // White-backed line and label for contrast against the mechanism.
   make('line',{x1:0,y1:y,x2:g.C,y2:y,stroke:'white','stroke-width':'3.1'});
   make('line',{x1:0,y1:y,x2:g.C,y2:y,stroke:'#333','stroke-width':'.75'});
   for(const x of [0,g.C]){
     make('line',{x1:x,y1:-5,x2:x,y2:5,stroke:'white','stroke-width':'2.4'});
     make('line',{x1:x,y1:-5,x2:x,y2:5,stroke:'#333','stroke-width':'.75'});
   }
   make('path',{d:`M 0 ${y} L ${arrow} ${y-arrow/2} L ${arrow} ${y+arrow/2} Z M ${g.C} ${y} L ${g.C-arrow} ${y-arrow/2} L ${g.C-arrow} ${y+arrow/2} Z`,fill:'#333'});
   const text=`C = ${g.C.toFixed(0)} mm`;
   const boxW=Math.max(44,text.length*5.15);
   make('rect',{x:g.C/2-boxW/2,y:-14.5,width:boxW,height:12,rx:2,fill:'white',stroke:'#ddd','stroke-width':'.35'});
   const txt=make('text',{x:g.C/2,y:-5.5,'text-anchor':'middle','font-size':'9','font-family':'Crimson Pro, Georgia, serif',fill:'#161616'});
   txt.textContent=text;
 }
 $('info').textContent=`Center distance: ${g.C.toFixed(2)} mm   ·   T1 pitch radius: ${g.r1.toFixed(2)} mm   ·   T2 pitch radius: ${g.r2.toFixed(2)} mm   ·   ${g.count} links`;
}
function update(){for(const id of ['t1','t2','links'])$(id+'value').textContent=$(id).value;const n1=Number($('t1').value),n2=Number($('t2').value),count=Number($('links').value);
 try{if(![n1,n2,count].every(Number.isInteger)||n1<12||n1>54||n2<12||n2>54||count<40||count>100||n1%2||n2%2||count%2)throw Error('Use even numbers: T1 and T2 12–54, links 40–100.');
 geom=geometry(n1,n2,count);$('error').textContent='';travel=0;draw();}
 catch(e){geom=null;$('error').textContent=e.message;svg.replaceChildren();$('info').textContent='';}}
 function tick(t){if(!running)return;if(last){const dt=Math.min((t-last)/1000,.08);travel+=dt*pitch*4;}last=t;draw();frame=requestAnimationFrame(tick);}
 $('play').addEventListener('click',()=>{running=!running;$('play').textContent=running?'❚❚ Pause':'▶ Play';if(running){last=0;frame=requestAnimationFrame(tick);}else{cancelAnimationFrame(frame);last=0;}});
 $('reset').addEventListener('click',()=>{travel=0;draw();});
 for(const id of ['t1','t2','links'])$(id).addEventListener('input',update);
 for(const id of ['lightPlates','darkPlates','rollers','rivets','dimension'])$(id).addEventListener('change',draw);
 for(const id of ['sprocketColor','lightPlateColor','darkPlateColor','rollerColor','rivetColor'])$(id).addEventListener('input',draw);
 $('save').addEventListener('click',()=>{if(!geom)return;const clone=svg.cloneNode(true);clone.setAttribute('xmlns',ns);const str=new XMLSerializer().serializeToString(clone);const url=URL.createObjectURL(new Blob([str],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download=`chain_${geom.n1}T_${geom.n2}T_${geom.count}L.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){$('play').title='Animation is paused by default in reduced-motion mode';}
 update();
})();
</script>
</div>
