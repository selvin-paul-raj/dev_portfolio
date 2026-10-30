// PokeFace engine: interactive, stretchy portrait (WebGL with 2D fallback). No audio.
// mountPokeFace(rootEl, { base: '/poke-face/faces' }) -> returns a cleanup function.
/* eslint-disable */
// @ts-nocheck
export function mountPokeFace(root, opts = {}) {
const base = (opts.base || '/poke-face/faces').replace(/\/$/, '');
const $ = id => { const sel = '[data-pf="' + id + '"]'; return root.matches && root.matches(sel) ? root : root.querySelector(sel); };
let dead = false; const offs = [];
// Guards: pause the loop off-screen or in a hidden tab; reduced motion skips the ghost-hand demo.
const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let visible = true, running = false;
const on = (t, f, o) => { window.addEventListener(t, f, o); offs.push(() => window.removeEventListener(t, f, o, o && o.capture)); };

const NAMES=["idle","look_left","look_right","look_up","look_down","ouch","squeeze","laugh","angry","wink","blink","sleep","dizzy","whistle","suspicious","grimace","whistle_l","whistle_r"];const texs={};
const stage=$('stage'),cv=$('cv');
let gl=null;try{gl=cv.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:true})||cv.getContext('experimental-webgl')}catch(e){}
const ctx=gl?null:cv.getContext('2d');
const bubble=$('bubble'),ghost=$('ghost'),hit=$('hit'),countEl={textContent:0};
// layout in units (stage width = 1)
const CX=.5,CY=.56,R=.38, IW=.92, IH=IW*869/900, IX=(1-IW)/2, IY=(CY+R)-IH;
const COLS=40, ROWS=38;
let W=0,dpr=1,tex=null,verts=[],nb=[],idx=null,posBuf,nrmBuf,posArr,nrmArr;
let nextBlink=performance.now()+2500,blinkUntil=0;
function mask(im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');
  x.drawImage(im,0,0);x.globalCompositeOperation='destination-in';
  const s=im.width/IW, cx=(CX-IX)*s, cy=(CY-IY)*s, r=R*s;
  x.beginPath();x.arc(cx,cy,r,0,Math.PI*2);x.rect(0,0,c.width,cy);x.fill();return c}
const gtex={};
function upload(c){if(!gl)return c;const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
  for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t}
const img=new Image();img.src=base+'/idle.webp';img.onload=()=>{if(dead)return;init();NAMES.slice(1).forEach(n=>{const i=new Image();i.onload=()=>{texs[n]=mask(i);gtex[n]=upload(texs[n])};i.src=base+'/'+n+'.webp'})};
// ---- GL program
const VS=`attribute vec2 aP;attribute vec2 aU;attribute vec3 aN;varying vec2 vU;varying vec3 vN;
void main(){vU=aU;vN=aN;gl_Position=vec4(aP.x*2.-1.,1.-aP.y*2.,0.,1.);}`;
const FS=`precision mediump float;uniform sampler2D uA,uB;uniform float uMix;varying vec2 vU;varying vec3 vN;
void main(){vec4 c=mix(texture2D(uA,vU),texture2D(uB,vU),uMix);
 vec3 n=normalize(vN);float tilt=clamp((1.-n.z)*7.,0.,1.);
 vec3 L=normalize(vec3(-.45,-.6,.66));float dif=max(dot(n,L),0.);
 vec3 H=normalize(L+vec3(0.,0.,1.));float sp=pow(max(dot(n,H),0.),36.);
 c.rgb*=mix(1.,.62+.55*dif,tilt);
 c.rgb+=vec3(1.,.97,.94)*sp*c.a*tilt*.85;
 gl_FragColor=c;}`;
function sh(t,src){const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return o}
let prog,aP,aU,aN,uA,uB,uMix;
if(gl){prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);gl.useProgram(prog);
aP=gl.getAttribLocation(prog,'aP');aU=gl.getAttribLocation(prog,'aU');aN=gl.getAttribLocation(prog,'aN');
uA=gl.getUniformLocation(prog,'uA');uB=gl.getUniformLocation(prog,'uB');uMix=gl.getUniformLocation(prog,'uMix');
gl.uniform1i(uA,0);gl.uniform1i(uB,1);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);}
// which face shows right now
let sleeping=false,hoverFace=false,whistled=false,lastMove=0;const notes=$('notes');
const zzz=$('zzz');
function wake(){if(!sleeping)return;sleeping=false;lastAct=performance.now();zzz.classList.remove('on');react('squeeze',700);say(pick(["Huh?! I'm awake! 😳","Wasn't sleeping. Just resting my eyes.","Who's there?!"]))}
let face='idle',fromFace='idle',fadeT=0,reactFace=null,reactUntil=0,lastAct=performance.now();
function react(n,ms){reactFace=n;reactUntil=performance.now()+ms;dirty=true}
function pickFace(){const now=performance.now(),moving=now-lastMove<700;
  if(now<reactUntil&&gtex[reactFace])return reactFace;
  if(grab&&grab.dx!==undefined){const m=Math.hypot(grab.dx,grab.dy);return m>.6?'ouch':m>.05?'grimace':'squeeze'}
  if(sleeping)return gtex.sleep?'sleep':'idle';
  if(now-lastAct>14000){sleeping=true;zzz.classList.add('on');notes.classList.remove('on');snore();return 'sleep'}
  const wh=now-lastAct>6000;notes.classList.toggle('on',wh);if(wh){if(!whistled){whistled=true;whistleTune()}const ph=Math.floor((now-lastAct-6000)/1300)%4;return ['whistle','whistle_r','whistle','whistle_l'][ph]}else whistled=false;
  if(now>nextBlink){blinkUntil=now+140;nextBlink=now+2500+Math.random()*3500;if(Math.random()<.2)nextBlink=now+300}
  if(now<blinkUntil&&gtex.blink)return 'blink';
  if(!moving)return 'idle';               // mouse still: back to the main face, never a side look
  if(hoverFace)return 'suspicious';
  const m=Math.hypot(look.x,look.y);if(m<.3)return 'idle';
  return Math.abs(look.x)>Math.abs(look.y)*1.2?(look.x<0?'look_left':'look_right'):(look.y<0?'look_up':'look_down')}
function init(){
  tex=texs.idle=mask(img);gtex.idle=upload(tex);
  const uv=[];
  for(let j=0;j<=ROWS;j++)for(let i=0;i<=COLS;i++){
    const u=i/COLS,v=j/ROWS,rx=IX+u*IW,ry=IY+v*IH;
    const head=Math.max(0,Math.min(1,(0.62-v)/0.35));
    verts.push({rx,ry,x:rx,y:ry,vx:0,vy:0,head,w:0,bx:0,by:0,i,j});uv.push(u,v);
  }
  const id=(i,j)=>j*(COLS+1)+i,ix=[];
  for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++)ix.push(id(i,j),id(i+1,j),id(i,j+1),id(i+1,j),id(i+1,j+1),id(i,j+1));
  verts.forEach(p=>{const n=[];if(p.i>0)n.push(id(p.i-1,p.j));if(p.i<COLS)n.push(id(p.i+1,p.j));if(p.j>0)n.push(id(p.i,p.j-1));if(p.j<ROWS)n.push(id(p.i,p.j+1));nb.push(n)});
  if(gl){
  idx=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ix),gl.STATIC_DRAW);idx.n=ix.length;
  const ub=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,ub);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uv),gl.STATIC_DRAW);gl.enableVertexAttribArray(aU);gl.vertexAttribPointer(aU,2,gl.FLOAT,false,0,0);
  posArr=new Float32Array(verts.length*2);nrmArr=new Float32Array(verts.length*3);
  posBuf=gl.createBuffer();nrmBuf=gl.createBuffer();}
  else{tris=[];for(let k=0;k<ix.length;k+=3)tris.push([ix[k],ix[k+1],ix[k+2]]);uvs=uv}
  resize();on('resize',resize);kick();
  if(!reduceMotion)ghostTimer=setTimeout(()=>{if(!touched)ghostDemo()},2500);
}
function resize(){W=stage.clientWidth;dpr=Math.min(2,devicePixelRatio||1);cv.width=W*dpr;cv.height=W*dpr;if(gl)gl.viewport(0,0,cv.width,cv.height);dirty=true}
// ---- physics
let grab=null,dirty=true,look={x:0,y:0},touched=false;
const SIG=.085;
function startGrab(px,py){
  grab={x0:px,y0:py,t:performance.now(),moved:0};
  for(const p of verts){const d2=(p.x-px)**2+(p.y-py)**2;p.w=Math.exp(-d2/(2*SIG*SIG));p.bx=p.x;p.by=p.y}
}
function moveGrab(px,py){
  if(!grab)return;let dx=px-grab.x0,dy=py-grab.y0;const m=Math.hypot(dx,dy),max=1.1;
  if(m>max){dx*=max/m;dy*=max/m}
  grab.moved=Math.max(grab.moved,m);grab.dx=dx;grab.dy=dy;squeak(Math.hypot(dx,dy));
}
function endGrab(){
  if(!grab)return;const g=grab;grab=null;
  if(g.moved<.012&&performance.now()-g.t<300)poke(g.x0,g.y0);
  else{twang(g.moved);if(g.moved>.25){react('dizzy',1900);say(pick(["Whoa… the room is spinning 😵","My face! It's still wobbling!","Was that necessary?"]))}else react('ouch',500)}
}
function poke(px,py){
  for(const p of verts){const dx=p.x-px,dy=p.y-py,d=Math.hypot(dx,dy)||1,w=Math.exp(-(d*d)/(2*.08*.08));p.vx+=dx/d*w*.03;p.vy+=dy/d*w*.03}
  pokes++;wake();lastAct=performance.now();react(pokes%10===0?'angry':(pokes%2?'ouch':'squeeze'),pokes%10===0?1400:900);boing();
  say(pokes%10===0?"Okay okay. Hire me already 😤":pick(POKE));dirty=true;
}
// water: drag the surface along with the cursor as it glides over the face
let hx=-1,hy=-1;
function flow(x,y){if(hx<0){hx=x;hy=y;return}const mx=x-hx,my=y-hy;hx=x;hy=y;if(grab||!hoverFace)return;
  const sp=Math.min(.03,Math.hypot(mx,my));if(sp<1e-4)return;const k=sp/Math.hypot(mx,my);
  for(const p of verts){const d2=(p.x-x)**2+(p.y-y)**2;if(d2>.012)continue;const w=Math.exp(-d2/(2*.042*.042));p.vx+=mx*k*w*.7;p.vy+=my*k*w*.7}}
let FADE=160,mouthI=-1;
// notes / Zzz anchored to his lips, following the mesh as it moves
function placeMouth(){if(!verts.length)return;if(mouthI<0){let b=1e9;verts.forEach((p,i)=>{const d=(p.rx-.5)**2+(p.ry-.5015)**2;if(d<b){b=d;mouthI=i}})}
  const p=verts[mouthI],L=(p.x*100).toFixed(2)+'%',T=(p.y*100-30).toFixed(2)+'%';
  if(notes.style.left!==L||notes.style.top!==T){notes.style.left=L;notes.style.top=T;zzz.style.left=L;zzz.style.top=T}}
function kick(){if(!running&&visible&&!dead&&verts.length){running=true;requestAnimationFrame(loop)}}
function loop(){if(dead||!visible){running=false;return}
  const now=performance.now();let energy=0;
  if(now-lastMove>700){look.x*=.9;look.y*=.9}
  const n=verts.length,dX=new Float32Array(n),dY=new Float32Array(n);
  for(let i=0;i<n;i++){dX[i]=verts[i].x-verts[i].rx;dY[i]=verts[i].y-verts[i].ry}
  for(let i=0;i<n;i++){const p=verts[i];
    if(grab&&grab.dx!==undefined){
      const tx=p.bx+p.w*grab.dx, ty=p.by+p.w*grab.dy;
      p.vx=(tx-p.x)*.6;p.vy=(ty-p.y)*.6;
    }else{
      const tx=p.rx+p.head*look.x*.012, ty=p.ry+p.head*look.y*.008;
      // neighbours pull on each other so a push travels across the face like a ripple
      let ax=0,ay=0;for(const q of nb[i]){ax+=dX[q];ay+=dY[q]}ax=ax/nb[i].length-dX[i];ay=ay/nb[i].length-dY[i];
      p.vx+=(tx-p.x)*.11+ax*.12;p.vy+=(ty-p.y)*.11+ay*.12;p.vx*=.86;p.vy*=.86;
    }
    p.x+=p.vx;p.y+=p.vy;energy+=Math.abs(p.vx)+Math.abs(p.vy);
  }
  const nf=pickFace();if(nf!==face){fromFace=face;face=nf;fadeT=now;FADE=(face.startsWith('whistle')&&fromFace.startsWith('whistle'))?420:160}
  placeMouth();
  const fading=now-fadeT<FADE;
  if(energy>1e-5||dirty||fading)draw(now);dirty=false;
  requestAnimationFrame(loop);
}
function draw(now){
  if(!gl)return draw2d(now);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);if(!tex)return;
  const cw=COLS+1,cellX=IW/COLS,cellY=IH/ROWS,HK=.9;
  const h=new Float32Array(verts.length);
  verts.forEach((p,i)=>{posArr[i*2]=p.x;posArr[i*2+1]=p.y;h[i]=Math.hypot(p.x-p.rx,p.y-p.ry)*HK});
  verts.forEach((p,i)=>{const l=p.i>0?h[i-1]:h[i],r=p.i<COLS?h[i+1]:h[i],u=p.j>0?h[i-cw]:h[i],d=p.j<ROWS?h[i+cw]:h[i];
    let nx=-(r-l)/(2*cellX),ny=-(d-u)/(2*cellY),nz=1,m=Math.hypot(nx,ny,nz);nrmArr[i*3]=nx/m;nrmArr[i*3+1]=ny/m;nrmArr[i*3+2]=nz/m});
  gl.bindBuffer(gl.ARRAY_BUFFER,posBuf);gl.bufferData(gl.ARRAY_BUFFER,posArr,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,nrmBuf);gl.bufferData(gl.ARRAY_BUFFER,nrmArr,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(aN);gl.vertexAttribPointer(aN,3,gl.FLOAT,false,0,0);
  const t=Math.min(1,(now-fadeT)/FADE);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,gtex[fromFace]||gtex.idle);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,gtex[face]||gtex.idle);
  gl.uniform1f(uMix,t*t*(3-2*t));
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idx);gl.drawElements(gl.TRIANGLES,idx.n,gl.UNSIGNED_SHORT,0);
}
let tris=[],uvs=[];
function draw2d(now){const S=W*dpr;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,S,S);if(!tex)return;
  const t=Math.min(1,(now-fadeT)/FADE),A=texs[fromFace]||tex,B=texs[face]||tex;
  if(t<1){ctx.globalAlpha=1;mesh2d(A,S);ctx.globalAlpha=t}else ctx.globalAlpha=1;mesh2d(B,S);ctx.globalAlpha=1}
function mesh2d(img,S){const w=img.width,h=img.height;
  for(const tr of tris){const a=verts[tr[0]],b=verts[tr[1]],c=verts[tr[2]];
    const x0=a.x*S,y0=a.y*S,x1=b.x*S,y1=b.y*S,x2=c.x*S,y2=c.y*S;
    const u0=uvs[tr[0]*2]*w,v0=uvs[tr[0]*2+1]*h,u1=uvs[tr[1]*2]*w,v1=uvs[tr[1]*2+1]*h,u2=uvs[tr[2]*2]*w,v2=uvs[tr[2]*2+1]*h;
    const den=u0*(v2-v1)-u1*v2+u2*v1+(u1-u2)*v0;if(!den)continue;
    const m11=-(v0*(x2-x1)-v1*x2+v2*x1+(v1-v2)*x0)/den,m12=(v1*y2+v0*(y1-y2)-v2*y1+(v2-v1)*y0)/den;
    const m21=(u0*(x2-x1)-u1*x2+u2*x1+(u1-u2)*x0)/den,m22=-(u1*y2+u0*(y1-y2)-u2*y1+(u2-u1)*y0)/den;
    const dx=(u0*(v2*x1-v1*x2)+v0*(u1*x2-u2*x1)+(u2*v1-u1*v2)*x0)/den,dy=(u0*(v2*y1-v1*y2)+v0*(u1*y2-u2*y1)+(u2*v1-u1*v2)*y0)/den;
    const cx=(x0+x1+x2)/3,cy=(y0+y1+y2)/3,e=(px,py)=>{const ex=px-cx,ey=py-cy,d=Math.hypot(ex,ey)||1;return[px+ex/d*.6,py+ey/d*.6]};
    const P=e(x0,y0),Q=e(x1,y1),T=e(x2,y2);
    ctx.save();ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(Q[0],Q[1]);ctx.lineTo(T[0],T[1]);ctx.closePath();ctx.clip();
    ctx.setTransform(m11,m12,m21,m22,dx,dy);ctx.drawImage(img,0,0);ctx.restore()}}
// ---- pointer
const toUnit=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
function onFace(x,y){
  if(x<IX||x>IX+IW||y<IY||y>IY+IH)return false;
  const s=tex.width/IW, d=tex.getContext('2d').getImageData(Math.floor((x-IX)*s),Math.floor((y-IY)*s),1,1).data;return d[3]>40;
}
cv.addEventListener('pointerdown',e=>{const[x,y]=toUnit(e);if(!tex||!onFace(x,y))return;stopGhost();touched=true;cv.setPointerCapture(e.pointerId);cv.classList.add('grabbing');startGrab(x,y);lastAct=performance.now()});
cv.addEventListener('pointerleave',()=>{hoverFace=false;hx=-1});
cv.addEventListener('pointermove',e=>{const[x,y]=toUnit(e);hoverFace=!!tex&&onFace(x,y);if(grab)moveGrab(x,y);else flow(x,y)});
const up=()=>{cv.classList.remove('grabbing');endGrab()};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);on('pointerup',up);on('mouseup',up);on('blur',up);cv.addEventListener('lostpointercapture',up);
on('pointermove',e=>{lastMove=performance.now();if(grab)return;const r=cv.getBoundingClientRect();look.x=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));look.y=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.4)*2))});
['mousemove','mousedown','pointerdown','touchstart','keydown','wheel','scroll'].forEach(t=>on(t,()=>{wake();lastAct=performance.now()},{passive:true,capture:true}));
let winkCd=0,overBtn=null;const BTNS=[];
on('pointermove',e=>{wake();lastAct=performance.now();
  const b=BTNS.find(b=>{const r=b.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom})||null;
  if(b&&b!==overBtn&&lastAct>winkCd){winkCd=lastAct+1500;react('wink',1100);say(b.classList.contains('b1')?'Good choice 😉':'Follow for daily AI 😉')}
  overBtn=b;BTNS.forEach(x=>x.classList.toggle('hov',x===b))},{passive:true});
hit.addEventListener('click',()=>{touched=true;stopGhost();poke(.5,.38)});
// ---- talk
let pokes=0,sayT;
const POKE=["Ouch!","Hey! I'm shipping code here.","That's my coding face.","Rude. Accurate, but rude.","Poke me again and I'll build an app about it.","Easy! This face is on camera daily.","AI did not prepare me for this.","Vanakkam to you too!"];
const STRETCH=["My faaaace!","Is this how you treat developers?","Elastic, like my deadlines.","Stretch goals, literally."];
const pick=a=>a[Math.random()*a.length|0];
function say(t){return;bubble.textContent=t;bubble.classList.add('on');clearTimeout(sayT);sayT=setTimeout(()=>bubble.classList.remove('on'),1800)}
let lastSq=0;function squeak(m){}
function boing(){}
function twang(m){}
function whistleTune(){}
function snore(){}
// ---- ghost hand demo
let ghostTimer=null,ghostOn=false;
function placeGhost(x,y){ghost.style.transform=`translate(${x*W-16}px,${y*W-14}px)`}
function ghostDemo(){if(dead||reduceMotion)return;
  if(touched)return;if(!visible){ghostTimer=setTimeout(ghostDemo,7000);return}ghostOn=true;ghost.classList.add('on');ghost.classList.remove('hold');
  const from=[.95,.95],at=[.47,.4],to=[.78,.62];const T0=performance.now();
  (function step(now){
    if(!ghostOn)return;const t=(now-T0)/1000;
    if(t<.9){const k=ease(t/.9);placeGhost(lerp(from[0],at[0],k),lerp(from[1],at[1],k))}
    else if(t<1.1){if(!grab){ghost.classList.add('hold');startGrab(at[0],at[1])}}
    else if(t<1.9){const k=ease((t-1.1)/.8),x=lerp(at[0],to[0],k),y=lerp(at[1],to[1],k);placeGhost(x,y);moveGrab(x,y)}
    else if(t<2.1){if(grab){grab.moved=0.3;grab=null;ghost.classList.remove('hold');say("Go on, grab me 👆")}}
    else if(t<2.8){const k=ease((t-2.1)/.7);placeGhost(lerp(to[0],from[0],k),lerp(to[1],from[1],k))}
    else{ghost.classList.remove('on');ghostTimer=setTimeout(ghostDemo,7000);return}
    requestAnimationFrame(step);
  })(T0);
}
function stopGhost(){ghostOn=false;clearTimeout(ghostTimer);ghost.classList.remove('on','hold');if(grab&&!touched)grab=null}
const lerp=(a,b,k)=>a+(b-a)*k,ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;

const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { try { resize(); } catch (e) {} }) : null;
if (ro) ro.observe(stage);
let onScreen = true;
const sync = () => { visible = onScreen && !document.hidden; if (visible) { dirty = true; kick(); } };
const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; sync(); }) : null;
if (io) io.observe(stage);
document.addEventListener('visibilitychange', sync);
return () => { dead = true; offs.forEach(f => f()); if (ro) ro.disconnect(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', sync); try { stopGhost(); } catch (e) {} };
}
