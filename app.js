(function(){
'use strict';
const $=s=>document.querySelector(s);
const deg=d=>d*Math.PI/180;
const V3=THREE.Vector3;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lin=hex=>new THREE.Color(hex).convertSRGBToLinear();

/* ------------------------------------------------------------------ catalogue */
const FORMS={
  classic:{name:'Classic',sub:'Candy bar',w:72,h:150,d:8.2,R:9,base:172,desc:'One rigid slab. The most room for hardware on every edge.'},
  flip:{name:'Flip',sub:'Clamshell',w:72,h:75,d:7.4,R:8,base:188,desc:'Folds top-over-bottom on a horizontal hinge. Outer cover screen on the lid.'},
  fold:{name:'Fold',sub:'Book-style',w:66,h:152,d:6.0,R:6,base:239,desc:'Opens like a book into a near-square tablet. Thin 6 mm halves.'}
};
const HW={
  camera:{label:'Camera array',opts:[
    {v:'single',name:'Single lens',spec:'1 × 48 MP · Ø13 mm ring',g:4},
    {v:'dual',name:'Dual vertical',spec:'Wide + ultra-wide · pill island',g:6},
    {v:'triple',name:'Triple square',spec:'Wide, ultra-wide, 3× tele · LED flash',g:9},
    {v:'quad',name:'Quad ring',spec:'4 lenses in a Ø38 mm disc',g:11},
    {v:'periscope',name:'Periscope bar',spec:'Full-width visor · 5× folded tele',g:10}]},
  speaker:{label:'Speakers',opts:[
    {v:'bottom',name:'Bottom grille',spec:'Mono · 6-hole array',g:2},
    {v:'stereo',name:'Stereo',spec:'Bottom + top-edge grilles',g:3},
    {v:'front',name:'Front-firing',spec:'Twin slots in the bezels',g:3},
    {v:'side',name:'Side-firing',spec:'Left-edge array',g:2}]},
  power:{label:'Power key',opts:[
    {v:'right',name:'Right edge',spec:'12 mm key · thumb height',g:1},
    {v:'left',name:'Left edge',spec:'12 mm key · index height',g:1},
    {v:'top',name:'Top edge',spec:'10 mm key · classic placement',g:1}]},
  volume:{label:'Volume',opts:[
    {v:'rocker',name:'Rocker',spec:'22 mm single bar',g:1},
    {v:'split',name:'Split keys',spec:'Two 10 mm keys',g:1},
    {v:'slider',name:'Alert slider',spec:'3-position switch',g:1}]},
  jack:{label:'Headphone jack',opts:[
    {v:'none',name:'None',spec:'Wireless audio only',g:0},
    {v:'top',name:'Top edge',spec:'3.5 mm TRRS',g:1},
    {v:'bottom',name:'Bottom edge',spec:'3.5 mm TRRS',g:1}]},
  port:{label:'Charging port',opts:[
    {v:'usbc',name:'USB-C',spec:'24-pin · 8.4 × 2.6 mm',g:1},
    {v:'lightning',name:'Lightning',spec:'8-pin · 7.7 × 1.5 mm',g:1},
    {v:'micro',name:'Micro-USB',spec:'5-pin · 6.9 × 1.8 mm',g:1},
    {v:'pins',name:'Magnetic pins',spec:'4 pogo contacts',g:1}]}
};
const HW_TABS=[['camera','Camera',['camera']],['speaker','Speakers',['speaker']],['buttons','Buttons',['power','volume']],['jack','Jack',['jack']],['port','Port',['port']]];
const FINISHES=[['#2f5d7c','Harbour'],['#1c1f24','Graphite'],['#e9e4d8','Bone'],['#8fa98b','Sage'],['#d9705b','Coral'],['#a99bd1','Lilac'],['#e6bf4a','Sunflower'],['#3f6e5a','Fern'],['#b7323c','Signal red'],['#9fb8cf','Glacier']];
const ACCENTS=[['#c9a46a','Brass'],['#cfd3d8','Silver'],['#2b2e33','Black chrome'],['#d8a090','Rose gold'],['#6e8fb0','Anodized blue']];
const CASES={none:{name:'No case',spec:'Bare chassis',g:0},slim:{name:'Slim shell',spec:'1.4 mm TPU · cutouts follow your hardware',g:22},rugged:{name:'Rugged',spec:'2.4 mm · corner air-bumpers',g:48},clear:{name:'Clear',spec:'1.2 mm polycarbonate',g:20}};
const CASE_COLORS=['#2a2d33','#e8e3d6','#c45a3c','#3d5a73','#6b7d4f','#d6b45a'];
const STANDS={none:{name:'None',spec:'Phone floats on the bench'},easel:{name:'Easel',spec:'Oak A-frame · 15° lean'},dock:{name:'Charging dock',spec:'Aluminium pedestal · status LED'},tripod:{name:'Mini tripod',spec:'Edge clamp · 3 legs'}};
const CHARMS={star:{name:'Star',col:'#f1c94b'},heart:{name:'Heart',col:'#e2564f'},cherry:{name:'Cherries',col:'#c3203a'},die:{name:'Die',col:'#f3f0e8'},bell:{name:'Bell',col:'#d7ae47'},bolt:{name:'Bolt',col:'#7fc4ef'}};
const STK={
  grip:{name:'Pop grip',r:11,tint:true,col:'#e8604c',g:8},
  ring:{name:'Ring holder',r:10.5,tint:true,col:'#c9a46a',g:12},
  bolt:{name:'Bolt sticker',r:9,g:1},
  star:{name:'Star sticker',r:9,g:1},
  smile:{name:'Smile sticker',r:9,g:1},
  word:{name:'Wordmark decal',r:14,g:1}
};
const OPTICS={none:{name:'None',spec:'No lens attachment',g:0},telescope:{name:'Telescope',spec:'Clip-on refractor · 1–40× · snaps to main lens',g:64},macro:{name:'Macro clip',spec:'15× close-up lens · snaps to main lens',g:9}};

const DEFAULT={form:'classic',open:165,color:'#2f5d7c',material:'gloss',accent:'#c9a46a',camera:'triple',speaker:'stereo',power:'right',volume:'rocker',jack:'none',port:'usbc',
  case:'none',caseColor:'#2a2d33',stand:'easel',optic:'none',charms:[{id:'c1',kind:'star',slot:0}],
  stickers:[{id:'s1',kind:'bolt',panel:'main',x:-14,y:-34,rot:.35}],offsets:{}};

function blocked(key,v,s){
  s=s||S;
  if(key==='camera'&&v==='quad'&&s.form==='flip')return 'Too wide for the Flip lid’s camera zone';
  if(key==='jack'&&v!=='none'&&s.form==='fold')return 'Fold halves are 6 mm thin; a 3.5 mm jack needs 7 mm';
  if(key==='speaker'&&v==='side'&&s.power==='left')return 'The left edge already carries the power key';
  if(key==='power'&&v==='left'&&s.speaker==='side')return 'Side-firing speakers occupy the left edge';
  return null;
}

/* ------------------------------------------------------------------ state */
let S=JSON.parse(JSON.stringify(DEFAULT));
try{const saved=localStorage.getItem('phonesmith.build.v1');if(saved){const o=JSON.parse(saved);if(o&&FORMS[o.form])S=Object.assign({},S,o);}}catch(e){}
if(!S.offsets)S.offsets={};
const ui={step:0,hwTab:'camera',accTab:'cases',backdrop:'workshop',res:'1920x1080',card:true,placing:null,ghostRot:0,selected:null,pip:false,zoom:8,yaw:0,pitch:0,spin:false};
let hist=[JSON.stringify(S)],hi=0;
function commit(){
  const j=JSON.stringify(S);
  if(j===hist[hi])return;
  hist=hist.slice(0,hi+1);hist.push(j);if(hist.length>80)hist.shift();hi=hist.length-1;
  try{localStorage.setItem('phonesmith.build.v1',j);}catch(e){}
  updateUndo();
}
function updateUndo(){$('#undo').disabled=hi<=0;$('#redo').disabled=hi>=hist.length-1;}
function restore(i){hi=i;S=JSON.parse(hist[hi]);ui.selected=null;cancelPlace();rebuild();renderUI();updateUndo();try{localStorage.setItem('phonesmith.build.v1',hist[hi]);}catch(e){}}

/* ------------------------------------------------------------------ renderer */
const vp=$('#viewport');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}
catch(e){vp.insertAdjacentHTML('beforeend','<div class="err">PhoneSmith needs WebGL to draw the workshop. Turn on hardware acceleration in your browser, then reload.</div>');return;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
vp.prepend(renderer.domElement);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,1,9000);
camera.position.set(190,70,340);
const controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=110;controls.maxDistance=500;
controls.maxPolarAngle=Math.PI*.62;controls.autoRotateSpeed=1.4;controls.target.set(0,0,0);

// environment reflections
(function(){
  const pm=new THREE.PMREMGenerator(renderer);const es=new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.BoxGeometry(100,100,100),new THREE.MeshBasicMaterial({color:0x2c3037,side:THREE.BackSide})));
  const lp=(c,x,y,z,w,h,ry,rx)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);es.add(m);};
  lp(0xffffff,0,48,0,60,26,0,Math.PI/2);lp(0xffdcae,-48,8,0,26,40,Math.PI/2);lp(0xb8ccff,48,4,10,18,50,-Math.PI/2);lp(0xeeeeee,0,12,-48,44,18,0);lp(0x8899aa,0,-10,48,60,10,0);
  scene.environment=pm.fromScene(es,.03).texture;
})();

// lights
scene.add(new THREE.HemisphereLight(0xcfd8e6,0x2a2018,.5));
const key=new THREE.DirectionalLight(0xfff1dc,1.15);key.position.set(170,330,260);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-280,right:280,top:280,bottom:-280,near:50,far:1000});key.shadow.bias=-.0004;key.shadow.radius=4;
scene.add(key);
const rim=new THREE.DirectionalLight(0xa9c2ff,.55);rim.position.set(-260,160,-280);scene.add(rim);
const fill=new THREE.DirectionalLight(0xffffff,.25);fill.position.set(-200,40,220);scene.add(fill);

/* ------------------------------------------------------------------ materials */
const M={
  body:new THREE.MeshPhysicalMaterial({roughness:.3,metalness:.05,clearcoat:1}),
  island:new THREE.MeshPhysicalMaterial({roughness:.2,metalness:.2,clearcoat:1}),
  accent:new THREE.MeshStandardMaterial({metalness:.9,roughness:.28}),
  hole:new THREE.MeshStandardMaterial({color:0x050506,roughness:.9}),
  glass:new THREE.MeshPhysicalMaterial({color:0x06080b,roughness:.04,metalness:.3,clearcoat:1}),
  core:new THREE.MeshStandardMaterial({color:0x0a1830,emissive:0x10284f,emissiveIntensity:.5,roughness:.1,metalness:.5}),
  flash:new THREE.MeshStandardMaterial({color:0xfff2d6,emissive:0x6b5320,roughness:.4}),
  gold:new THREE.MeshStandardMaterial({color:0xd8b14a,metalness:1,roughness:.25}),
  steel:new THREE.MeshStandardMaterial({color:0xbfc4cb,metalness:.9,roughness:.32}),
  tongue:new THREE.MeshStandardMaterial({color:0x7b8088,metalness:.6,roughness:.4}),
  caseM:new THREE.MeshPhysicalMaterial({roughness:.6}),
  ghostOk:new THREE.MeshBasicMaterial({color:0x63c08a,transparent:true,opacity:.6,depthWrite:false}),
  ghostBad:new THREE.MeshBasicMaterial({color:0xe46a5e,transparent:true,opacity:.6,depthWrite:false}),
  glow:new THREE.MeshBasicMaterial({color:0xf0b450,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide}),
  sel:new THREE.MeshBasicMaterial({color:0xf0b450,depthTest:false,transparent:true}),
  oak:new THREE.MeshStandardMaterial({color:lin('#b88a59'),roughness:.62}),
  alu:new THREE.MeshStandardMaterial({color:lin('#c9ccd1'),metalness:.85,roughness:.3}),
  dark:new THREE.MeshStandardMaterial({color:0x1a1c20,roughness:.5,metalness:.3}),
  tube:new THREE.MeshStandardMaterial({color:lin('#ebe6dc'),roughness:.45}),
  led:new THREE.MeshStandardMaterial({color:0x63c08a,emissive:0x63c08a,emissiveIntensity:1.4}),
  objective:new THREE.MeshPhysicalMaterial({color:0x14263f,roughness:.02,metalness:.4,clearcoat:1,emissive:0x0c1e36,emissiveIntensity:.5})
};
const MATS={
  matte:{roughness:.78,metalness:0,clearcoat:0,clearcoatRoughness:.5},
  gloss:{roughness:.32,metalness:.05,clearcoat:1,clearcoatRoughness:.06},
  metal:{roughness:.3,metalness:.92,clearcoat:.2,clearcoatRoughness:.2},
  glass:{roughness:.06,metalness:.18,clearcoat:1,clearcoatRoughness:.02}
};
function applyFinish(){
  Object.assign(M.body,MATS[S.material]);M.body.color.copy(lin(S.color));
  const c=lin(S.color).multiplyScalar(.72);M.island.color.copy(c);
  M.accent.color.copy(lin(S.accent));
  const cm=M.caseM;
  if(S.case==='clear'){Object.assign(cm,{transparent:true,opacity:.3,roughness:.05,clearcoat:1,metalness:0,depthWrite:false});cm.color.set(0xffffff);}
  else{Object.assign(cm,{transparent:false,opacity:1,roughness:S.case==='rugged'?.88:.6,clearcoat:S.case==='rugged'?0:.3,metalness:0,depthWrite:true});cm.color.copy(lin(S.caseColor));}
  [M.body,M.island,M.accent,cm].forEach(m=>m.needsUpdate=true);
}

/* ------------------------------------------------------------------ geometry helpers */
function rrShape(w,h,r,cx,cy,Ctor){
  cx=cx||0;cy=cy||0;const s=new (Ctor||THREE.Shape)();const x=cx-w/2,y=cy-h/2;r=Math.max(.05,Math.min(r,w/2,h/2));
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}
function slab(w,h,d,r,b){
  b=b==null?Math.min(.8,d/3):b;
  const g=new THREE.ExtrudeGeometry(rrShape(w-2*b,h-2*b,Math.max(r-b,.3)),{depth:Math.max(d-2*b,.05),bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:10});
  g.translate(0,0,-Math.max(d-2*b,.05)/2);return g;
}
function cylZ(r,h,seg){const g=new THREE.CylinderGeometry(r,r,h,seg||32);g.rotateX(Math.PI/2);return g;}
function mesh(g,m,ud){const o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;if(ud)o.userData=ud;return o;}
function cylBetween(a,b,r,m){const d=new V3().subVectors(b,a);const o=mesh(new THREE.CylinderGeometry(r,r,d.length(),14),m);o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new V3(0,1,0),d.normalize());return o;}
function screenGeo(w,h,r,u0,u1,v0,v1){
  const g=new THREE.ShapeGeometry(rrShape(w,h,r),8);const p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,u0+(p.getX(i)+w/2)/w*(u1-u0),v0+(p.getY(i)+h/2)/h*(v1-v0));return g;
}
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;}

/* ------------------------------------------------------------------ textures */
function hsl(hex){const c=new THREE.Color(hex),o={};c.getHSL(o);return o;}
function screenTex(aspect){
  const H=1024,W=Math.round(H*aspect);const {h}=hsl(S.color);const hue=Math.round(h*360);
  return canvasTex(W,H,(g)=>{
    const gr=g.createLinearGradient(0,0,W*.4,H);gr.addColorStop(0,`hsl(${hue},45%,18%)`);gr.addColorStop(.55,`hsl(${(hue+30)%360},50%,32%)`);gr.addColorStop(1,`hsl(${(hue+60)%360},55%,52%)`);
    g.fillStyle=gr;g.fillRect(0,0,W,H);
    for(let i=0;i<5;i++){const x=W*(.15+.7*((i*37)%10)/10),y=H*(.35+.12*i),r=Math.min(W,H)*(.22+.06*(i%3));
      const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,`hsla(${(hue+40+i*25)%360},70%,65%,.35)`);rg.addColorStop(1,'hsla(0,0%,0%,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);}
    const m=Math.min(W,H);g.fillStyle='rgba(255,255,255,.95)';g.textAlign='center';
    g.font=`600 ${m*.26}px Manrope, system-ui, sans-serif`;g.fillText('22:14',W/2,H*.2+m*.1);
    g.font=`500 ${m*.055}px Manrope, system-ui, sans-serif`;g.fillStyle='rgba(255,255,255,.8)';g.fillText('Monday 19 October',W/2,H*.2+m*.19);
    const n=4,s=m*.13,gap=(W-n*s)/(n+1);g.fillStyle='rgba(255,255,255,.18)';
    for(let i=0;i<n;i++){const x=gap+i*(s+gap),y=H-s-H*.05;g.beginPath();g.roundRect?g.roundRect(x,y,s,s,s*.28):g.rect(x,y,s,s);g.fill();}
  });
}
function coverTex(aspect){
  const H=512,W=Math.round(H*aspect);
  return canvasTex(W,H,(g)=>{g.fillStyle='#07080a';g.fillRect(0,0,W,H);g.fillStyle='#ece6da';g.textAlign='center';const m=Math.min(W,H);
    g.font=`600 ${m*.32}px Manrope, system-ui, sans-serif`;g.fillText('22:14',W/2,H*.52);g.font=`500 ${m*.09}px Manrope, system-ui, sans-serif`;g.fillStyle='#d8a24a';g.fillText('● 86%',W/2,H*.75);});
}
const stickerTex={};
function stickerTexture(kind){
  if(stickerTex[kind])return stickerTex[kind];
  const w=kind==='word'?384:256,h=kind==='word'?128:256;
  stickerTex[kind]=canvasTex(w,h,(g)=>{
    if(kind==='word'){g.fillStyle='#14171c';g.beginPath();g.roundRect?g.roundRect(4,4,w-8,h-8,24):g.rect(4,4,w-8,h-8);g.fill();g.strokeStyle='#d8a24a';g.lineWidth=4;g.stroke();
      g.fillStyle='#d8a24a';g.font='800 50px "Bricolage Grotesque", system-ui, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('PhoneSmith',w/2,h/2+2);return;}
    g.beginPath();g.arc(128,128,120,0,7);g.fillStyle='#fff';g.fill();
    if(kind==='bolt'){g.beginPath();g.arc(128,128,108,0,7);g.fillStyle='#1b1d22';g.fill();g.fillStyle='#f3c63f';g.beginPath();[[140,30],[70,140],[120,140],[100,226],[186,104],[134,104],[160,30]].forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.fill();}
    if(kind==='star'){g.beginPath();g.arc(128,128,108,0,7);g.fillStyle='#f06fa0';g.fill();g.fillStyle='#fff6e0';g.beginPath();for(let i=0;i<10;i++){const r=i%2?38:88,a=-Math.PI/2+i*Math.PI/5;g.lineTo(128+r*Math.cos(a),132+r*Math.sin(a));}g.fill();}
    if(kind==='smile'){g.beginPath();g.arc(128,128,108,0,7);g.fillStyle='#f5d33b';g.fill();g.fillStyle='#1b1d22';g.beginPath();g.ellipse(92,105,12,20,0,0,7);g.ellipse(164,105,12,20,0,0,7);g.fill();g.lineWidth=14;g.lineCap='round';g.strokeStyle='#1b1d22';g.beginPath();g.arc(128,135,58,.2*Math.PI,.8*Math.PI);g.stroke();}
  });
  return stickerTex[kind];
}

/* ------------------------------------------------------------------ workshop environment */
const envGroup=new THREE.Group();scene.add(envGroup);
const BENCH_Y=-110;
let moon;
(function(){
  const woodTex=canvasTex(1024,512,(g,w,h)=>{g.fillStyle='#6f4f33';g.fillRect(0,0,w,h);
    for(let i=0;i<180;i++){const y=Math.random()*h;g.strokeStyle=`rgba(${40+Math.random()*40},${25+Math.random()*25},${10+Math.random()*15},${.15+Math.random()*.25})`;g.lineWidth=1+Math.random()*3;g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=64)g.lineTo(x,y+Math.sin(x*.01+i)*4);g.stroke();}
    for(let i=1;i<6;i++){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,i*h/6,w,2);}});
  const bench=mesh(new THREE.BoxGeometry(1160,36,800),new THREE.MeshStandardMaterial({map:woodTex,roughness:.7}));bench.position.set(0,BENCH_Y-18,-150);bench.castShadow=false;envGroup.add(bench);
  // cutting mat, 10 mm grid
  const matTex=canvasTex(1260,900,(g,w,h)=>{const px=3;g.fillStyle='#2e5a4c';g.fillRect(0,0,w,h);
    for(let x=0;x<=w;x+=px*10){const major=(x/(px*10))%5===0;g.fillStyle=major?'rgba(230,240,225,.45)':'rgba(230,240,225,.16)';g.fillRect(x,0,major?2:1,h);}
    for(let y=0;y<=h;y+=px*10){const major=(y/(px*10))%5===0;g.fillStyle=major?'rgba(230,240,225,.45)':'rgba(230,240,225,.16)';g.fillRect(0,y,w,major?2:1);}
    g.fillStyle='rgba(230,240,225,.6)';g.font='500 16px "JetBrains Mono", monospace';for(let x=0;x<w;x+=px*50)g.fillText(String(x/px),x+4,18);
    g.strokeStyle='rgba(230,240,225,.35)';g.lineWidth=2;g.beginPath();g.moveTo(0,h);g.lineTo(h,0);g.stroke();
    g.font='600 18px "JetBrains Mono", monospace';g.fillText('SELF-HEALING · 420 × 300 mm',w-330,h-16);});
  const mat=mesh(new THREE.PlaneGeometry(420,300),new THREE.MeshStandardMaterial({map:matTex,roughness:.9}));mat.rotation.x=-Math.PI/2;mat.position.set(0,BENCH_Y+.3,0);mat.castShadow=false;envGroup.add(mat);
  // back wall with window
  const wallM=new THREE.MeshStandardMaterial({color:lin('#2a2f36'),roughness:.95});
  const Z=-540,wx=190,wyb=-40,wyt=190;
  const wallPart=(x1,x2,y1,y2)=>{const m=mesh(new THREE.BoxGeometry(x2-x1,y2-y1,20),wallM);m.position.set((x1+x2)/2,(y1+y2)/2,Z);m.castShadow=false;envGroup.add(m);};
  wallPart(-900,-wx,-500,700);wallPart(wx,900,-500,700);wallPart(-wx,wx,wyt,700);wallPart(-wx,wx,-500,wyb);
  const frameM=new THREE.MeshStandardMaterial({color:lin('#3a2c20'),roughness:.6});
  [[0,wyt,2*wx+16,10],[0,wyb,2*wx+16,10]].forEach(([x,y,w,h])=>{const m=mesh(new THREE.BoxGeometry(w,h,26),frameM);m.position.set(x,y,Z);envGroup.add(m);});
  [[-wx,0],[wx,0],[0,0]].forEach(([x])=>{const m=mesh(new THREE.BoxGeometry(x===0?6:10,wyt-wyb,x===0?14:26),frameM);m.position.set(x,(wyt+wyb)/2,Z);envGroup.add(m);});
  const sill=mesh(new THREE.BoxGeometry(2*wx+40,8,40),frameM);sill.position.set(0,wyb-8,Z+14);envGroup.add(sill);
  // night sky
  const skyTex=canvasTex(2048,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#05070f');gr.addColorStop(.48,'#0e1630');gr.addColorStop(.56,'#2a2346');gr.addColorStop(1,'#05060a');g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(let i=0;i<1600;i++){const y=Math.random()*h*.55;g.fillStyle=`rgba(255,${235+Math.random()*20},${215+Math.random()*40},${Math.random()*.9})`;const s=Math.random()<.04?2.2:1;g.fillRect(Math.random()*w,y,s,s);}});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(3200,48,24),new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false}));envGroup.add(sky);
  const moonTex=canvasTex(512,256,(g,w,h)=>{g.fillStyle='#d9d4c6';g.fillRect(0,0,w,h);for(let i=0;i<90;i++){const x=Math.random()*w,y=Math.random()*h,r=2+Math.random()*(i<12?26:9);
    g.fillStyle=`rgba(120,115,104,${.25+Math.random()*.35})`;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle='rgba(245,240,228,.4)';g.lineWidth=1.5;g.beginPath();g.arc(x+1,y-1,r,Math.PI,1.8*Math.PI);g.stroke();}});
  moon=new THREE.Mesh(new THREE.SphereGeometry(95,48,32),new THREE.MeshBasicMaterial({map:moonTex}));moon.position.set(330,460,-2500);moon.rotation.y=-.6;envGroup.add(moon);
  const cityTex=canvasTex(2048,256,(g,w,h)=>{g.clearRect(0,0,w,h);let x=0;while(x<w){const bw=20+Math.random()*60,bh=40+Math.random()*180;g.fillStyle='#07080d';g.fillRect(x,h-bh,bw,bh);
      for(let yy=h-bh+8;yy<h-6;yy+=10)for(let xx=x+4;xx<x+bw-4;xx+=8)if(Math.random()<.22){g.fillStyle=Math.random()<.7?'rgba(255,205,120,.9)':'rgba(170,210,255,.8)';g.fillRect(xx,yy,3,4);}x+=bw+2;}
    g.fillStyle='#07080d';g.fillRect(1500,h-240,10,240);g.fillStyle='#e46a5e';g.fillRect(1501,h-244,8,6);});
  const city=new THREE.Mesh(new THREE.PlaneGeometry(4200,520),new THREE.MeshBasicMaterial({map:cityTex,transparent:true}));city.position.set(0,-120,-1800);envGroup.add(city);
  // pegboard wall with repair tools
  const pegTex=canvasTex(1024,1024,(g,w,h)=>{g.fillStyle='#a9875e';g.fillRect(0,0,w,h);g.fillStyle='rgba(40,28,16,.75)';for(let y=16;y<h;y+=32)for(let x=16;x<w;x+=32){g.beginPath();g.arc(x,y,5,0,7);g.fill();}
    const tool=(c,f)=>{g.save();g.fillStyle=c;g.strokeStyle=c;f();g.restore();};
    tool('#2a2d33',()=>{g.fillRect(150,200,22,260);g.fillStyle='#d8a24a';g.fillRect(140,120,42,90);});
    tool('#c9ccd1',()=>{g.beginPath();g.moveTo(300,140);g.lineTo(312,460);g.lineTo(318,460);g.lineTo(306,140);g.fill();g.beginPath();g.moveTo(330,140);g.lineTo(318,460);g.lineTo(324,460);g.lineTo(336,140);g.fill();});
    tool('#e46a5e',()=>{g.fillRect(440,160,30,240);g.fillStyle='#2a2d33';g.fillRect(447,400,16,60);});
    tool('#5d7fa3',()=>{g.beginPath();g.arc(640,240,90,0,7);g.lineWidth=18;g.stroke();});
    tool('#2a2d33',()=>{g.fillRect(780,140,90,320);g.fillStyle='#63c08a';g.fillRect(795,160,60,40);});
    g.fillStyle='#2a2d33';g.font='700 34px "JetBrains Mono", monospace';g.fillText('SPUDGER · TWEEZERS · PRY · LOUPE',120,620);});
  const peg=new THREE.Mesh(new THREE.PlaneGeometry(700,700),new THREE.MeshStandardMaterial({map:pegTex,roughness:.9}));peg.position.set(-560,160,-60);peg.rotation.y=Math.PI/2;envGroup.add(peg);
  const sideWall=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),wallM);sideWall.position.set(-570,100,0);sideWall.rotation.y=Math.PI/2;envGroup.add(sideWall);
  const rWall=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),wallM);rWall.position.set(600,100,0);rWall.rotation.y=-Math.PI/2;envGroup.add(rWall);
  // parts bins on a shelf
  const shelf=mesh(new THREE.BoxGeometry(60,8,380),frameM);shelf.position.set(570,40,-40);envGroup.add(shelf);
  ['#e46a5e','#d8a24a','#5d7fa3','#63c08a','#e8e3d6'].forEach((c,i)=>{const b=mesh(new THREE.BoxGeometry(50,36,60),new THREE.MeshStandardMaterial({color:lin(c),roughness:.6}));b.position.set(565,62,-200+i*72);envGroup.add(b);});
  // desk lamp
  const lampM=new THREE.MeshStandardMaterial({color:lin('#d8a24a'),metalness:.6,roughness:.35});
  const base=mesh(new THREE.CylinderGeometry(34,40,10,32),lampM);base.position.set(300,BENCH_Y+5,-150);envGroup.add(base);
  const a=new V3(300,BENCH_Y+10,-150),b=new V3(270,140,-170),c=new V3(150,190,-120);
  envGroup.add(cylBetween(a,b,4,lampM));envGroup.add(cylBetween(b,c,4,lampM));
  const head=mesh(new THREE.ConeGeometry(30,46,32,1,true),new THREE.MeshStandardMaterial({color:lin('#d8a24a'),metalness:.6,roughness:.35,side:THREE.DoubleSide}));head.position.copy(c);head.lookAt(0,0,0);head.rotateX(-Math.PI/2);envGroup.add(head);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(10,16,12),new THREE.MeshBasicMaterial({color:0xffe8c0}));bulb.position.copy(c).lerp(new V3(0,0,0),.08);envGroup.add(bulb);
  const spot=new THREE.SpotLight(0xffd59a,.9,900,deg(32),.6,1.2);spot.position.copy(bulb.position);spot.target.position.set(0,-20,0);envGroup.add(spot);envGroup.add(spot.target);
})();
const shadowFloor=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.ShadowMaterial({opacity:.28}));shadowFloor.rotation.x=-Math.PI/2;shadowFloor.position.y=BENCH_Y+.4;shadowFloor.receiveShadow=true;shadowFloor.visible=false;scene.add(shadowFloor);

/* ------------------------------------------------------------------ phone build */
const phone=new THREE.Group();scene.add(phone);
const standGroup=new THREE.Group();scene.add(standGroup);
let parts={},curPart=null,P={},F=[],roles={},pivot=null,solids=[],anchors=[],stickerObjs={},glowGroup=null,telescope=null,telTip=null,telAnim=0,mainLens=null,caseT=0;

function buildPanel(key,w,h,d,R,ins,uv,tex){
  const g=new THREE.Group();g.userData={key,w,h,d};
  const body=mesh(slab(w,h,d,R),M.body,{panel:key,surf:'body'});g.add(body);solids.push(body);
  const sw=w-ins.l-ins.r,sh=h-ins.t-ins.b;
  const scr=mesh(screenGeo(sw,sh,3.4,uv[0],uv[1],uv[2],uv[3]),new THREE.MeshStandardMaterial({color:0x000000,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.85,roughness:.16,metalness:0}),{panel:key,surf:'screen'});
  scr.position.set((ins.l-ins.r)/2,(ins.b-ins.t)/2,d/2+.04);scr.castShadow=false;g.add(scr);
  return g;
}
function feat(o){if(curPart&&o.panel===curPart.panel){o.part=curPart.id;curPart.base.push(Object.assign({},o));}F.push(o);}
function onPanel(key,obj){(curPart&&curPart.panel===key?curPart.g:P[key]).add(obj);return obj;}
/* draggable parts: each part slides on the face it is mounted to.
   back = 2D (x,y); front/top/bottom = along x; left/right = along y. */
const AXIS_X=['front','top','bottom'],AXIS_Y=['left','right'];
const PART_NAMES={camera:'Camera','spk-bottom':'Bottom speaker','spk-top':'Top speaker','spk-fb':'Lower speaker slot','spk-ft':'Upper speaker slot','spk-side':'Side speaker',power:'Power key',volume:'Volume keys',jack:'Headphone jack',port:'Charging port'};
const CAT_NAMES={camera:'camera',cover:'outer screen',speaker:'speaker grille',buttons:'keys',jack:'headphone jack',port:'charging port'};
function beginPart(id,panel,face){const g=new THREE.Group();g.userData={partId:id};P[panel].add(g);curPart={id,panel,face,g,base:[]};}
function offsetVec(face,u,v){return face==='back'?new V3(u,v,0):AXIS_Y.includes(face)?new V3(0,u,0):new V3(u,0,0);}
function clampPart(p,u,v){
  const {w,h}=dims(p.panel),R=FORMS[S.form].R,face=p.face;
  if(!p.base.length)return [0,0];
  if(face==='back'){const m=2.5;let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;p.base.forEach(f=>{x0=Math.min(x0,f.cx-f.w/2);x1=Math.max(x1,f.cx+f.w/2);y0=Math.min(y0,f.cy-f.h/2);y1=Math.max(y1,f.cy+f.h/2);});
    return [clamp(u,-w/2+m-x0,w/2-m-x1),clamp(v,-h/2+m-y0,h/2-m-y1)];}
  const L=(AXIS_Y.includes(face)?h:w)/2-(face==='front'?3:R*.8);let a=Infinity,b=-Infinity;p.base.forEach(f=>{a=Math.min(a,f.cx-f.w/2);b=Math.max(b,f.cx+f.w/2);});
  return [clamp(u,-L-a,L-b),0];
}
function shifted(f,face,u,v){return Object.assign({},f,face==='back'?{cx:f.cx+u,cy:f.cy+v}:AXIS_Y.includes(face)?{cx:f.cx+u}:face==='front'?{cx:f.cx+u}:{cx:f.cx+u});}
function endPart(){
  const p=curPart;curPart=null;if(!p)return;
  const off=S.offsets[p.id]||{u:0,v:0};const [u,v]=clampPart(p,off.u||0,off.v||0);
  p.u=u;p.v=v;p.g.position.copy(offsetVec(p.face,u,v));
  // rewrite this part's features at the shifted position
  F=F.filter(f=>f.part!==p.id).concat(p.base.map(f=>shifted(f,p.face,u,v)));
  parts[p.id]=p;
}
function partWhy(p,u,v){
  for(const b of p.base){const f=shifted(b,p.face,u,v);
    for(const o of F){if(o.part===p.id||o.panel!==p.panel||o.face!==f.face)continue;
      if(Math.abs(f.cx-o.cx)<(f.w+o.w)/2+.6&&Math.abs(f.cy-o.cy)<(f.h+o.h)/2+.6)return `Overlaps the ${CAT_NAMES[o.cat]||'part'}`;}
    if(p.face==='back')for(const s of S.stickers){if(s.panel!==p.panel)continue;const r=STK[s.kind].r*.8;if(Math.abs(f.cx-s.x)<f.w/2+r&&Math.abs(f.cy-s.y)<f.h/2+r)return 'Overlaps a grip or sticker';}
  }
  return null;
}
function dims(key){return P[key].userData;}

function buildLens(r){
  const g=new THREE.Group();
  const ring=mesh(cylZ(r,1.3),M.accent,{surf:'part'});ring.position.z=-.65;g.add(ring);
  const gl=mesh(cylZ(r*.8,1.4),M.glass,{surf:'part'});gl.position.z=-.7;g.add(gl);
  const core=new THREE.Mesh(new THREE.CircleGeometry(r*.36,24),M.core);core.rotation.y=Math.PI;core.position.z=-1.42;g.add(core);
  return g;
}
function buildCamera(){
  const key=roles.cam,{w,h,d}=dims(key),zb=-d/2;
  beginPart('camera',key,'back');
  const add=(o)=>onPanel(key,o);
  const island=(iw,ih,ir,cx,cy)=>{const m=mesh(slab(iw,ih,1.8,ir,.5),M.island,{panel:key,surf:'island'});m.position.set(cx,cy,zb-.6);add(m);feat({panel:key,face:'back',cx,cy,w:iw,h:ih,r:ir,kind:'hole',cat:'camera'});return zb-1.5;};
  const lens=(r,x,y,z)=>{const l=buildLens(r);l.position.set(x,y,z);add(l);return l;};
  const flash=(x,y,z,r)=>{const m=mesh(cylZ(r||2.2,.6),M.flash,{surf:'part'});m.position.set(x,y,z-.3);add(m);};
  let L;const m=4;
  if(S.camera==='single'){const cx=w/2-m-10,cy=h/2-m-10,z=island(20,20,10,cx,cy);lens(6.6,cx,cy,z);L=[cx,cy,z,6.6];
    const fx=cx-16;flash(fx,cy,zb,2.2);feat({panel:key,face:'back',cx:fx,cy,w:5,h:5,r:2.5,kind:'hole',cat:'camera'});}
  if(S.camera==='dual'){const cx=w/2-m-9.5,cy=h/2-m-18,z=island(19,36,9.5,cx,cy);lens(6.3,cx,cy+8.5,z);lens(6.3,cx,cy-8.5,z);L=[cx,cy+8.5,z,6.3];
    const fx=cx-15;flash(fx,cy+9,zb,2);feat({panel:key,face:'back',cx:fx,cy:cy+9,w:5,h:5,r:2.5,kind:'hole',cat:'camera'});}
  if(S.camera==='triple'){const cx=w/2-m-17,cy=h/2-m-17,z=island(34,34,8.5,cx,cy);lens(6.4,cx+7.2,cy+7.2,z);lens(6.4,cx+7.2,cy-7.2,z);lens(6.4,cx-7.2,cy,z);flash(cx-7.6,cy+10.5,z,2);
    const mic=mesh(cylZ(.7,.4),M.hole);mic.position.set(cx-7.6,cy-10.5,z-.2);add(mic);L=[cx+7.2,cy+7.2,z,6.4];}
  if(S.camera==='quad'){const cx=w/2-m-19,cy=h/2-m-19,z=island(38,38,19,cx,cy);[[7.6,7.6],[-7.6,7.6],[7.6,-7.6],[-7.6,-7.6]].forEach(([x,y])=>lens(5.4,cx+x,cy+y,z));flash(cx,cy,z,1.6);L=[cx+7.6,cy+7.6,z,5.4];}
  if(S.camera==='periscope'){const cx=0,cy=h/2-m-7.5,iw=w-6,z=island(iw,15,7.5,cx,cy);lens(5.6,cx+iw/2-12,cy,z);lens(5,cx+iw/2-26,cy,z);
    const win=mesh(new THREE.BoxGeometry(10,6.5,.8),M.glass,{surf:'part'});win.position.set(cx-iw/2+22,cy,z-.4);add(win);flash(cx-iw/2+9,cy,z,1.8);L=[cx+iw/2-12,cy,z,5.6];}
  mainLens={x:L[0],y:L[1],z:L[2]-1.4,r:L[3]};
  endPart();mainLens.x+=parts.camera.u;mainLens.y+=parts.camera.v;
}
function holeRow(key,face,n,step,r,cu,cat){
  const {w,h,d}=dims(key);const g=new THREE.CylinderGeometry(r,r,1.2,12);
  for(let i=0;i<n;i++){const u=cu+(i-(n-1)/2)*step;const m=new THREE.Mesh(g,M.hole);
    if(face==='bottom')m.position.set(u,-h/2+.45,0);if(face==='top')m.position.set(u,h/2-.45,0);
    if(face==='left'){m.rotation.z=Math.PI/2;m.position.set(-w/2+.45,u,0);}
    onPanel(key,m);}
  feat({panel:key,face,cx:cu,cy:0,w:n*step+1,h:2.6,kind:'hole',cat});
}
function frontSlit(key,y,cat){const {d}=dims(key);const m=new THREE.Mesh(new THREE.BoxGeometry(14,1.1,.3),M.hole);m.position.set(0,y,d/2+.06);onPanel(key,m);feat({panel:key,face:'front',cx:0,cy:y,w:14,h:1.1,kind:'slit',cat});}
function buildSpeaker(){
  const mk=roles.main,tk=roles.top,{h}=dims(mk),th=dims(tk).h;
  if(S.speaker==='bottom'||S.speaker==='stereo'){beginPart('spk-bottom',mk,'bottom');holeRow(mk,'bottom',6,2.3,.85,14,'speaker');endPart();}
  if(S.speaker==='stereo'){beginPart('spk-top',tk,'top');holeRow(tk,'top',5,2.3,.8,10,'speaker');endPart();}
  if(S.speaker==='front'){beginPart('spk-fb',mk,'front');frontSlit(mk,-h/2+2.3,'speaker');endPart();beginPart('spk-ft',tk,'front');frontSlit(tk,th/2-2.3,'speaker');endPart();}
  if(S.speaker==='side'){beginPart('spk-side',mk,'left');holeRow(mk,'left',6,2.3,.8,-h*.3,'speaker');endPart();}
}
function edgeKey(key,face,len,y,thick,mat,cat,prot){
  const {w,d}=dims(key);prot=prot||1.3;const t=Math.min(thick||3,d-1.6);
  const m=mesh(slab(prot,len,t,Math.min(prot,t)/2,Math.min(.3,prot/4,t/4)),mat||M.accent,{surf:'part'});
  m.position.set((face==='right'?1:-1)*(w/2+prot/2-.25),y,0);onPanel(key,m);
  feat({panel:key,face,cx:y,cy:0,w:len,h:t,kind:'button',cat});return m;
}
function buildButtons(){
  const mk=roles.main,{h}=dims(mk);
  if(S.power==='top'){const tk=roles.top,{w,h:th,d}=dims(tk);beginPart('power',tk,'top');const t=Math.min(3,d-1.6);
    const m=mesh(new THREE.BoxGeometry(10,1.3,t),M.accent,{surf:'part'});m.position.set(w/2-12,th/2+.4,0);onPanel(tk,m);feat({panel:tk,face:'top',cx:w/2-12,cy:0,w:10,h:t,kind:'button',cat:'buttons'});endPart();}
  else{beginPart('power',mk,S.power);edgeKey(mk,S.power,12,h*.17,3,M.accent,'buttons');endPart();}
  const vside=S.power==='right'?'left':'right';
  const vy=S.power==='top'?h*.2:h*.24;
  beginPart('volume',mk,vside);
  if(S.volume==='rocker')edgeKey(mk,vside,22,vy,3,M.accent,'buttons');
  if(S.volume==='split'){edgeKey(mk,vside,10,vy+6,3,M.accent,'buttons');edgeKey(mk,vside,10,vy-6,3,M.accent,'buttons');}
  if(S.volume==='slider'){const {w}=dims(mk);const slot=edgeKey(mk,vside,12,vy+4,2.6,M.hole,'buttons',.5);const k=mesh(new THREE.BoxGeometry(1.4,4.5,2.2),M.accent,{surf:'part'});k.position.set((vside==='right'?1:-1)*(w/2+.6),vy+7,0);onPanel(mk,k);}
  endPart();
}
function buildJack(){
  if(S.jack==='none')return;
  const key=S.jack==='top'?roles.top:roles.main,{w,h}=dims(key),x=-w/2+14,y=S.jack==='top'?h/2:-h/2,s=S.jack==='top'?1:-1;
  beginPart('jack',key,S.jack==='top'?'top':'bottom');
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,.4,24),M.accent);ring.position.set(x,y+s*.05,0);onPanel(key,ring);
  const hole=new THREE.Mesh(new THREE.CylinderGeometry(1.75,1.75,.6,24),M.hole);hole.position.set(x,y+s*.12,0);onPanel(key,hole);
  feat({panel:key,face:S.jack==='top'?'top':'bottom',cx:x,cy:0,w:5,h:5,kind:'hole',cat:'jack'});
  endPart();
}
function edgeSlot(shape,depth){const g=new THREE.ExtrudeGeometry(shape,{depth:depth||1,bevelEnabled:false,curveSegments:10});g.rotateX(Math.PI/2);return g;}
function buildPort(){
  const key=roles.main,{h}=dims(key),y=-h/2;
  beginPart('port',key,'bottom');
  const slot=(w,hh,r,trap)=>{let sh;if(trap){sh=new THREE.Shape();sh.moveTo(-w/2,hh/2);sh.lineTo(w/2,hh/2);sh.lineTo(w/2-.8,-hh/2);sh.lineTo(-w/2+.8,-hh/2);sh.closePath();}else sh=rrShape(w,hh,r);
    const m=new THREE.Mesh(edgeSlot(sh,1),M.hole);m.position.set(0,y+.95,0);onPanel(key,m);feat({panel:key,face:'bottom',cx:0,cy:0,w:w+1,h:hh+1,kind:'hole',cat:'port'});};
  const tongue=(w)=>{const t=new THREE.Mesh(new THREE.BoxGeometry(w,.1,.6),M.tongue);t.position.set(0,y-.08,0);onPanel(key,t);};
  if(S.port==='usbc'){slot(8.4,2.6,1.3);tongue(5.6);}
  if(S.port==='lightning'){slot(7.7,1.9,.95);tongue(5.2);}
  if(S.port==='micro'){slot(6.9,1.9,0,true);tongue(4.4);}
  if(S.port==='pins'){slot(13,2.6,1.3);for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.3,14),M.gold);p.position.set(-4.2+i*2.8,y-.08,0);onPanel(key,p);}}
  endPart();
}
function buildCover(){
  if(!roles.cover)return;const key=roles.cover,{w,h,d}=dims(key);
  let cw,ch,cy;if(S.form==='flip'){cw=50;ch=27;cy=-h/2+19;}else{cw=w-5.4;ch=h-8;cy=0;}
  const m=mesh(screenGeo(cw,ch,4,0,1,0,1),new THREE.MeshStandardMaterial({color:0,emissive:0xffffff,emissiveMap:coverTex(cw/ch),emissiveIntensity:.8,roughness:.15}),{panel:key,surf:'cover'});
  m.rotation.y=Math.PI;m.position.set(0,cy,-d/2-.04);m.castShadow=false;onPanel(key,m);
  feat({panel:key,face:'back',cx:0,cy,w:cw,h:ch,r:4,kind:'window',cat:'cover'});
}
function buildCase(){
  caseT=0;if(S.case==='none')return;
  const t={slim:1.4,rugged:2.4,clear:1.2}[S.case];caseT=t;const R=FORMS[S.form].R;
  Object.keys(P).forEach(key=>{
    const {w,h,d}=dims(key);
    const rimShape=rrShape(w+2*t,h+2*t,R+t);rimShape.holes.push(rrShape(w+.3,h+.3,R,0,0,THREE.Path));
    const rg=new THREE.ExtrudeGeometry(rimShape,{depth:d+.7,bevelEnabled:false,curveSegments:12});rg.translate(0,0,-d/2);
    const rimM=mesh(rg,M.caseM,{panel:key,surf:'case'});onPanel(key,rimM);solids.push(rimM);
    const back=rrShape(w+2*t,h+2*t,R+t);
    F.filter(f=>f.panel===key&&f.face==='back'&&(f.kind==='hole'||f.kind==='window')).forEach(f=>back.holes.push(rrShape(f.w+2,f.h+2,(f.r||2)+1,f.cx,f.cy,THREE.Path)));
    const bg=new THREE.ExtrudeGeometry(back,{depth:t,bevelEnabled:true,bevelThickness:.35,bevelSize:.35,bevelSegments:2,curveSegments:12});bg.translate(0,0,-d/2-t);
    const bm=mesh(bg,M.caseM,{panel:key,surf:'case'});onPanel(key,bm);solids.push(bm);
    if(S.case==='rugged'){[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([sx,sy])=>{const c=mesh(slab(11,11,d+2*t+1.2,5,1),M.caseM,{panel:key,surf:'case'});c.position.set(sx*(w/2+t-4.6),sy*(h/2+t-4.6),-t/2+.35);onPanel(key,c);});}
    F.filter(f=>f.panel===key&&f.face!=='back'&&f.face!=='front').forEach(f=>{
      const off=t+.12;let m;
      if(f.kind==='button'){
        if(f.face==='top'){m=mesh(new THREE.BoxGeometry(f.w+1.4,1,f.h+1),M.caseM);m.position.set(f.cx,h/2+t+.3,0);}
        else{m=mesh(new THREE.BoxGeometry(1,f.w+1.4,f.h+1),M.caseM);m.position.set((f.face==='right'?1:-1)*(w/2+t+.3),f.cx,0);}
      }else{
        if(f.face==='bottom'||f.face==='top'){m=new THREE.Mesh(new THREE.BoxGeometry(f.w+1.6,.3,Math.min(f.h+1.2,d)),M.hole);m.position.set(f.cx,(f.face==='top'?1:-1)*(h/2+off),0);}
        else{m=new THREE.Mesh(new THREE.BoxGeometry(.3,f.w+1.6,Math.min(f.h+1.2,d)),M.hole);m.position.set((f.face==='right'?1:-1)*(w/2+off),f.cx,0);}
      }
      onPanel(key,m);
    });
  });
}
function buildAnchors(){
  anchors=[];const key=roles.main,{w,h}=dims(key);
  [-w/2+5,-w/2+12,w/2-5].forEach((x,i)=>{
    const loop=new THREE.Mesh(new THREE.TorusGeometry(1.3,.38,8,18),M.steel);loop.rotation.y=Math.PI/2;loop.position.set(x,-h/2-caseT-1.1,0);onPanel(key,loop);
    const a=new THREE.Object3D();a.position.set(x,-h/2-caseT-2.2,0);onPanel(key,a);anchors[i]=a;
  });
}
function buildOptic(){
  telescope=null;telTip=null;if(S.optic==='none'||!mainLens)return;
  const key=roles.cam,{w,h,d}=dims(key),L=mainLens,z0=L.z-caseT-.2;
  const g=new THREE.Group();
  const pad=mesh(slab(26,26,3,6,.6),M.dark,{surf:'part'});pad.position.set(L.x,L.y,z0-1.5);g.add(pad);
  const top=h/2+caseT;const armLen=top-L.y+3;
  const arm=mesh(new THREE.BoxGeometry(8,armLen,2.4),M.dark);arm.position.set(L.x,L.y+armLen/2,z0-1.2);g.add(arm);
  const bridge=mesh(new THREE.BoxGeometry(8,2.4,d+2*caseT+6+(-z0-d/2)),M.dark);const zs=z0-2.4,ze=d/2+caseT+2.4;bridge.geometry=new THREE.BoxGeometry(8,2.4,ze-zs);bridge.position.set(L.x,top+1.2,(zs+ze)/2);g.add(bridge);
  const hook=mesh(new THREE.BoxGeometry(8,6,1.6),M.dark);hook.position.set(L.x,top-2,ze-.8);g.add(hook);
  if(S.optic==='telescope'){
    const len=96,zt=z0-3;
    const tube=mesh(cylZ(9,len,40),M.tube,{surf:'part'});tube.position.set(L.x,L.y,zt-len/2);g.add(tube);
    [6,len-30].forEach(o=>{const r=mesh(cylZ(9.8,3,40),M.accent);r.position.set(L.x,L.y,zt-o);g.add(r);});
    const shield=mesh(cylZ(11.6,24,40),M.dark);shield.position.set(L.x,L.y,zt-len-10);g.add(shield);
    const obj=new THREE.Mesh(new THREE.CircleGeometry(10.4,40),M.objective);obj.rotation.y=Math.PI;obj.position.set(L.x,L.y,zt-len-4);g.add(obj);
    const knob=mesh(new THREE.CylinderGeometry(3,3,7,16),M.dark);knob.rotation.z=Math.PI/2;knob.position.set(L.x+12,L.y,zt-14);g.add(knob);
    telTip=new THREE.Object3D();telTip.position.set(L.x,L.y,zt-len-26);g.add(telTip);
  }else{
    const lensM=mesh(cylZ(8,5,32),M.dark);lensM.position.set(L.x,L.y,z0-5.5);g.add(lensM);
    const gl=new THREE.Mesh(new THREE.CircleGeometry(6.4,32),M.objective);gl.rotation.y=Math.PI;gl.position.set(L.x,L.y,z0-8.1);g.add(gl);
    const r=mesh(cylZ(8.3,1.2,32),M.accent);r.position.set(L.x,L.y,z0-7.6);g.add(r);
  }
  telescope=g;onPanel(key,g);
}

function stickerMesh(kind,color){
  const g=new THREE.Group();const c=lin(color||STK[kind].col||'#ffffff');
  if(kind==='grip'){const b=mesh(cylZ(8.5,1.4),M.dark);b.position.z=.7;g.add(b);const s=mesh(cylZ(5,2.8),M.dark);s.position.z=2.6;g.add(s);
    const cap=mesh(cylZ(11,1.8,40),new THREE.MeshPhysicalMaterial({color:c,roughness:.4,clearcoat:.6}));cap.position.z=4.8;g.add(cap);
    const ring=mesh(new THREE.TorusGeometry(8,.35,8,40),M.accent);ring.position.z=5.75;g.add(ring);}
  else if(kind==='ring'){const b=mesh(cylZ(8,1,40),new THREE.MeshStandardMaterial({color:c,metalness:.85,roughness:.3}));b.position.z=.5;g.add(b);
    const t=mesh(new THREE.TorusGeometry(9.6,1.1,12,48),new THREE.MeshStandardMaterial({color:c,metalness:.9,roughness:.25}));t.position.z=1.9;g.add(t);}
  else{const w=kind==='word'?30:18,h=kind==='word'?10:18;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:stickerTexture(kind),transparent:true,alphaTest:.4,roughness:.45,polygonOffset:true,polygonOffsetFactor:-2}));m.position.z=.12;m.receiveShadow=true;g.add(m);}
  return g;
}
function backZ(key){
  // cast a ray from behind the panel along +z (local) to find the outer back surface
  const p=P[key];if(!p)return null;
  return (x,y)=>{
    const o=p.localToWorld(new V3(x,y,-80)),dir=new V3(0,0,1).transformDirection(p.matrixWorld);
    ray.set(o,dir);const hits=ray.intersectObjects(solids.filter(m=>m.userData.panel===key),false);
    return hits.length?p.worldToLocal(hits[0].point.clone()).z:null;
  };
}
const ray=new THREE.Raycaster();
function buildStickers(){
  stickerObjs={};
  const kept=[];
  S.stickers.forEach(s=>{
    if(!P[s.panel])return;
    const {w,h}=dims(s.panel);if(Math.abs(s.x)>w/2||Math.abs(s.y)>h/2)return;
    const z=backZ(s.panel)(s.x,s.y);if(z==null)return;
    const g=stickerMesh(s.kind,s.color);g.position.set(s.x,s.y,z-.02);g.rotation.set(0,Math.PI,0);g.rotateZ(-s.rot);
    g.traverse(o=>{o.userData.stickerId=s.id;});
    onPanel(s.panel,g);stickerObjs[s.id]=g;kept.push(s);
  });
  S.stickers=kept;
}

function buildStand(){
  standGroup.clear();if(S.stand==='none')return;
  phone.updateMatrixWorld(true);
  const bb=new THREE.Box3();solids.forEach(m=>bb.expandByObject(m));
  const W=bb.max.x-bb.min.x,cx=(bb.max.x+bb.min.x)/2,minY=bb.min.y,Hh=bb.max.y-bb.min.y,zmin=bb.min.z,zmax=bb.max.z;
  const add=o=>{standGroup.add(o);return o;};
  if(S.stand==='easel'){
    const lw=Math.min(W*.55,70);
    const ledge=add(mesh(slab(lw,5,24,2,.6),M.oak));ledge.rotation.x=Math.PI/2;ledge.position.set(cx,minY-2.5,(zmin+zmax)/2-2);
    const lip=add(mesh(new THREE.BoxGeometry(lw,7,2.5),M.oak));lip.position.set(cx,minY+1,zmax+1.4);
    const topY=minY+Hh*.62;
    [-1,1].forEach(s=>{add(cylBetween(new V3(cx+s*lw*.35,BENCH_Y,zmin-75),new V3(cx+s*lw*.22,topY,zmin-3),2.6,M.oak));add(cylBetween(new V3(cx+s*lw*.46,BENCH_Y,zmax+18),new V3(cx+s*lw*.42,minY-4,zmax-2),2.4,M.oak));});
    const bar=add(mesh(new THREE.BoxGeometry(lw*.6,5,4),M.oak));bar.position.set(cx,topY-2,zmin-4);
  }
  if(S.stand==='dock'){
    const dw=Math.min(W*.5,62),hgt=minY-BENCH_Y;
    const ped=add(mesh(slab(dw,hgt,48,6,1.2),M.alu));ped.position.set(cx,BENCH_Y+hgt/2,(zmin+zmax)/2);
    const back=add(mesh(slab(dw*.8,34,5,3,.8),M.alu));back.position.set(cx,minY+14,zmin-3);
    const led=add(new THREE.Mesh(new THREE.BoxGeometry(10,1.2,.6),M.led));led.position.set(cx,BENCH_Y+hgt*.5,(zmin+zmax)/2+24.2);
  }
  if(S.stand==='tripod'){
    const cy=(minY+bb.max.y)/2,zb=zmin-7;
    const bar=add(mesh(new THREE.BoxGeometry(W+8,8,5),M.dark));bar.position.set(cx,cy,zb);
    [-1,1].forEach(s=>{const j=add(mesh(new THREE.BoxGeometry(4,12,(zmax-zb)+5),M.dark));j.position.set(cx+s*(W/2+2),cy,(zb+zmax)/2+1.5);});
    const head=add(mesh(new THREE.SphereGeometry(6,20,14),M.alu));head.position.set(cx,cy,zb-8);
    const hub=new V3(cx,minY-6,zb-14);
    add(cylBetween(head.position,hub,2.4,M.alu));
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3+Math.PI/6;add(cylBetween(hub,new V3(cx+Math.cos(a)*55,BENCH_Y,hub.z+Math.sin(a)*55),2,M.dark));}
  }
}

function disposeTree(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();});}
function rebuild(){
  disposeTree(phone);phone.clear();parts={};curPart=null;P={};F=[];solids=[];pivot=null;mainLens=null;
  applyFinish();
  const fd=FORMS[S.form],R=fd.R;
  if(S.form==='classic'){
    roles={main:'main',top:'main',cam:'main',cover:null};
    const tex=screenTex((72-4.8)/(150-9.2));
    P.main=buildPanel('main',72,150,8.2,R,{l:2.4,r:2.4,t:4.6,b:4.6},[0,1,0,1],tex);phone.add(P.main);
  }else if(S.form==='flip'){
    roles={main:'main',top:'aux',cam:'aux',cover:'aux'};
    const {w,h,d}=fd;const tex=screenTex((w-5.2)/(2*h-9.2));
    P.main=buildPanel('main',w,h,d,R,{l:2.6,r:2.6,t:.35,b:4.6},[0,1,0,(h-4.6)/(2*h-9.2)],tex);P.main.position.y=-h/2;phone.add(P.main);
    pivot=new THREE.Group();pivot.position.set(0,0,d/2);phone.add(pivot);
    P.aux=buildPanel('aux',w,h,d,R,{l:2.6,r:2.6,t:4.6,b:.35},[0,1,(h-4.6)/(2*h-9.2),1],tex);P.aux.position.set(0,h/2,-d/2);pivot.add(P.aux);
  }else{
    roles={main:'main',top:'main',cam:'main',cover:'aux'};
    const {w,h,d}=fd;const tex=screenTex((2*w-4.8)/(h-7));
    P.main=buildPanel('main',w,h,d,R,{l:.35,r:2.4,t:3.5,b:3.5},[(w-2.4)/(2*w-4.8),1,0,1],tex);P.main.position.x=w/2;phone.add(P.main);
    pivot=new THREE.Group();pivot.position.set(0,0,d/2);phone.add(pivot);
    P.aux=buildPanel('aux',w,h,d,R,{l:2.4,r:.35,t:3.5,b:3.5},[0,(w-2.4)/(2*w-4.8),0,1],tex);P.aux.position.set(-w/2,0,-d/2);pivot.add(P.aux);
  }
  setHinge();
  buildCover();buildCamera();buildSpeaker();buildButtons();buildJack();buildPort();buildCase();buildAnchors();buildOptic();
  phone.updateMatrixWorld(true);
  buildStickers();buildStand();syncCharms();refreshGlow();updateHUD();
  if(ui.selected&&!stickerObjs[ui.selected])ui.selected=null;showSelection();
}
function setHinge(){
  if(!pivot)return;const a=deg(180-S.open);
  if(S.form==='flip')pivot.rotation.set(a,0,0);else pivot.rotation.set(0,a,0);
}

/* ------------------------------------------------------------------ glow on hardware zones */
function refreshGlow(){
  if(glowGroup){glowGroup.forEach(g=>{g.parent&&g.parent.remove(g);g.geometry.dispose();});}glowGroup=[];
  if(ui.step!==1)return;
  const cats=ui.hwTab==='buttons'?['buttons']:[ui.hwTab];
  F.filter(f=>cats.includes(f.cat)).forEach(f=>{
    const {w,h,d}=dims(f.panel);const pad=2.2,r=(f.r||1)+pad,o=caseT+1.2;
    const along=(f.face==='left'||f.face==='right');
    const gw=(along?f.h:f.w)+2*pad,gh=(along?f.w:f.h)+2*pad;
    const sh=rrShape(gw,gh,r);sh.holes.push(rrShape(gw-1.6,gh-1.6,Math.max(r-.8,.2),0,0,THREE.Path));
    const g=new THREE.ShapeGeometry(sh,8);const m=new THREE.Mesh(g,M.glow);m.renderOrder=5;
    if(f.face==='back'){m.rotation.y=Math.PI;m.position.set(f.cx,f.cy,-d/2-caseT-(f.cat==='camera'?3.4:.6));}
    if(f.face==='front'){m.position.set(f.cx,f.cy,d/2+.5);}
    if(f.face==='bottom'){m.rotation.x=Math.PI/2;m.position.set(f.cx,-h/2-o,0);}
    if(f.face==='top'){m.rotation.x=-Math.PI/2;m.position.set(f.cx,h/2+o,0);}
    if(f.face==='right'){m.rotation.y=Math.PI/2;m.position.set(w/2+o,f.cx,0);}
    if(f.face==='left'){m.rotation.y=-Math.PI/2;m.position.set(-w/2-o,f.cx,0);}
    m.raycast=()=>{};P[f.panel].add(m);glowGroup.push(m);
  });
}

/* ------------------------------------------------------------------ charms */
const charmSims={};
function charmMesh(kind){
  const g=new THREE.Group();const col=lin(CHARMS[kind].col);const mat=new THREE.MeshPhysicalMaterial({color:col,roughness:.35,clearcoat:.8,metalness:kind==='bell'?.9:0});
  const loop=new THREE.Mesh(new THREE.TorusGeometry(1,.3,8,16),M.steel);loop.position.y=-.6;g.add(loop);
  const ext=(shape,depth)=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:depth||2.2,bevelEnabled:true,bevelThickness:.6,bevelSize:.5,bevelSegments:2});geo.center();const m=mesh(geo,mat);return m;};
  let body;
  if(kind==='star'){const s=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?2.4:5.4,a=Math.PI/2+i*Math.PI/5;i?s.lineTo(r*Math.cos(a),r*Math.sin(a)):s.moveTo(r*Math.cos(a),r*Math.sin(a));}body=ext(s);body.position.y=-6.6;}
  if(kind==='heart'){const s=new THREE.Shape();s.moveTo(0,-4.5);s.bezierCurveTo(-6,0,-5,5,-2.5,5);s.bezierCurveTo(-1,5,0,4,0,3);s.bezierCurveTo(0,4,1,5,2.5,5);s.bezierCurveTo(5,5,6,0,0,-4.5);body=ext(s);body.position.y=-6.2;}
  if(kind==='bolt'){const s=new THREE.Shape();[[1.5,5.5],[-3,-.5],[0,-.5],[-1.5,-5.5],[3.5,.8],[.4,.8],[2.8,5.5]].forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));body=ext(s);body.position.y=-6.4;}
  if(kind==='die'){const tex=canvasTex(128,128,(c)=>{c.fillStyle='#f3f0e8';c.fillRect(0,0,128,128);c.fillStyle='#1b1d22';[[34,34],[94,34],[34,94],[94,94]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,12,0,7);c.fill();});});
    body=mesh(new THREE.BoxGeometry(7,7,7),new THREE.MeshStandardMaterial({map:tex,roughness:.4}));body.position.y=-5.4;body.rotation.set(.4,.6,0);}
  if(kind==='cherry'){body=new THREE.Group();[[-2.6,-8.2],[2.4,-7.4]].forEach(([x,y])=>{const b=mesh(new THREE.SphereGeometry(2.9,20,14),mat);b.position.set(x,y,0);body.add(b);body.add(cylBetween(new V3(0,-1.2,0),new V3(x,y+2.4,0),.35,new THREE.MeshStandardMaterial({color:0x3d6b2f})));});}
  if(kind==='bell'){const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new THREE.Vector2(1+4.2*Math.pow(t,1.6)+(t>.9?.6:0),-t*8));}body=mesh(new THREE.LatheGeometry(pts,28),new THREE.MeshStandardMaterial({color:col,metalness:.9,roughness:.25,side:THREE.DoubleSide}));body.position.y=-1.4;
    const clap=mesh(new THREE.SphereGeometry(1.2,12,10),M.steel);clap.position.y=-9;body.add(clap);}
  g.add(body);g.traverse(o=>{o.userData.charm=true;});
  return g;
}
const strMat=new THREE.LineBasicMaterial({color:0x2b2b2b});
function syncCharms(){
  const live=new Set(S.charms.map(c=>c.id));
  Object.keys(charmSims).forEach(id=>{if(!live.has(id)){const c=charmSims[id];scene.remove(c.obj);scene.remove(c.line);delete charmSims[id];}});
  S.charms.forEach(c=>{
    let sim=charmSims[c.id];
    if(sim&&sim.kind!==c.kind){scene.remove(sim.obj);scene.remove(sim.line);sim=null;}
    if(!sim){const obj=charmMesh(c.kind);obj.traverse(o=>o.userData.charmId=c.id);scene.add(obj);
      const lg=new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]);const line=new THREE.Line(lg,strMat);scene.add(line);
      const a=anchors[c.slot]?anchors[c.slot].getWorldPosition(new V3()):new V3();
      sim={kind:c.kind,obj,line,x:a.clone().add(new V3(6,-14,4)),px:a.clone().add(new V3(6,-14,4)),L:16};charmSims[c.id]=sim;}
    sim.slot=c.slot;
  });
}
const GRAV=new V3(0,-.16,0);let tClock=0;
function stepCharms(){
  tClock+=.016;
  Object.values(charmSims).forEach((c,i)=>{
    const a=anchors[c.slot];if(!a)return;const A=a.getWorldPosition(new V3());
    if(c.drag){c.px.copy(c.x);c.x.lerp(c.drag,.45);}else{const v=c.x.clone().sub(c.px).multiplyScalar(.975);c.px.copy(c.x);
    c.x.add(v).add(GRAV).add(new V3(Math.sin(tClock*.9+i*2)*.004,0,Math.cos(tClock*.7+i)*.004));}
    const dvec=c.x.clone().sub(A);const len=dvec.length()||1;c.x.copy(A).addScaledVector(dvec,c.L/len);
    if(c.x.y<BENCH_Y+5){c.x.y=BENCH_Y+5;}
    c.obj.position.copy(c.x);
    const up=A.clone().sub(c.x).normalize();c.obj.quaternion.setFromUnitVectors(new V3(0,1,0),up);
    const pos=c.line.geometry.attributes.position;pos.setXYZ(0,A.x,A.y,A.z);pos.setXYZ(1,c.x.x,c.x.y,c.x.z);pos.needsUpdate=true;
  });
}
function flick(id){const c=charmSims[id];if(!c)return;c.px.add(new V3((Math.random()-.5)*5,-1,(Math.random()-.5)*5));}

/* ------------------------------------------------------------------ HUD, camera */
function phoneBox(){const bb=new THREE.Box3();solids.forEach(m=>bb.expandByObject(m));return bb;}
function updateHUD(){
  const fd=FORMS[S.form];let dim;
  const bump=1.6+(caseT?caseT:0);
  if(S.form==='classic')dim=`${(72+2*caseT).toFixed(1)} × ${(150+2*caseT).toFixed(1)} × ${(8.2+2*caseT).toFixed(1)} mm`;
  else{const closed=S.open<25;const w=S.form==='fold'?(closed?66:132):72,h=S.form==='flip'?(closed?75:150):152,d=closed?2*fd.d:fd.d;dim=`${(w+2*caseT).toFixed(1)} × ${(h+2*caseT).toFixed(1)} × ${(d+2*caseT).toFixed(1)} mm`;}
  $('#hud-t').textContent=`${fd.name}${S.form!=='classic'?` · hinge ${S.open}°`:''}`;
  $('#hud-d').textContent=dim+` · bump +${bump.toFixed(1)}`;
  $('#hud-w').textContent=`Est. ${weight()} g`;
}
function weight(){
  let g=FORMS[S.form].base;
  ['camera','speaker','power','volume','jack','port'].forEach(k=>{const o=HW[k].opts.find(x=>x.v===S[k]);g+=o?o.g:0;});
  g+=CASES[S.case].g+OPTICS[S.optic].g+S.charms.length*4;S.stickers.forEach(s=>g+=STK[s.kind].g);return Math.round(g);
}
let tween=null;
function flyTo(view){
  phone.updateMatrixWorld(true);const bb=phoneBox(),c=bb.getCenter(new V3()),sz=bb.getSize(new V3());
  const D=Math.min(Math.max(sz.x,sz.y)*2.05+90,470);let pos,tgt=c.clone();
  const V={front:[0,.12,1],back:[0,.12,-1],left:[-1,.08,.05],right:[1,.08,.05],top:[0,1,.15],bottom:[0,-.25,.9],hero:[.5,.18,.85]}[view]||[.5,.18,.85];
  if(view==='bottom'){tgt=new V3(c.x,bb.min.y+10,c.z);pos=new V3(c.x,BENCH_Y+14,c.z+D*.62);}
  else pos=c.clone().add(new V3(...V).normalize().multiplyScalar(D));
  tween={p0:camera.position.clone(),t0:controls.target.clone(),p1:pos,t1:tgt,s:performance.now(),d:750};
  document.querySelectorAll('#viewbar [data-view]').forEach(b=>{if(b.dataset.view!=='spin')b.setAttribute('aria-pressed',String(b.dataset.view===view));});
}
function stepTween(now){
  if(!tween)return;let k=clamp((now-tween.s)/tween.d,0,1);k=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
  camera.position.lerpVectors(tween.p0,tween.p1,k);controls.target.lerpVectors(tween.t0,tween.t1,k);if(k>=1)tween=null;
}

/* ------------------------------------------------------------------ placement & picking */
const pointer=new THREE.Vector2();let ghost=null,ghostState=null,downAt=null;
function setPointer(e){const r=renderer.domElement.getBoundingClientRect();pointer.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);}
function startPlace(kind){
  cancelPlace();ui.selected=null;showSelection();ui.placing=kind;ui.ghostRot=0;
  ghost=stickerMesh(kind,STK[kind].col);ghost.traverse(o=>{if(o.isMesh){o.material=M.ghostOk;o.castShadow=false;}});ghost.visible=false;scene.add(ghost);
  flyTo('back');showHint();renderUI();
}
function cancelPlace(){if(ghost){scene.remove(ghost);ghost=null;}ui.placing=null;ghostState=null;$('#hint').hidden=true;}
function evaluate(){
  ray.setFromCamera(pointer,camera);
  const targets=[];phone.traverse(o=>{if(o.isMesh&&o.userData.surf)targets.push(o);});
  const hit=ray.intersectObjects(targets,false)[0];
  if(!hit)return null;
  const ud=hit.object.userData,key=ud.panel||findPanel(hit.object);if(!key)return null;
  const panel=P[key],loc=panel.worldToLocal(hit.point.clone());
  const n=hit.face.normal.clone().transformDirection(hit.object.matrixWorld).transformDirection(new THREE.Matrix4().copy(panel.matrixWorld).invert());
  const r=STK[ui.placing].r;let why=null;
  if(ud.surf==='screen')why='That’s the display. Add-ons go on the back';
  else if(ud.surf==='cover')why='That would cover the outer screen';
  else if(ud.surf==='island'||ud.surf==='part')why='That spot is taken by hardware';
  else if(n.z>-.85)why='Add-ons go on the flat back panel';
  if(!why)why=stickerWhy(key,loc.x,loc.y,ui.placing,null);
  return {key,loc,hit,why};
}
function stickerWhy(key,x,y,kind,excl){
  const r=STK[kind].r,{w,h}=dims(key);
  if(Math.abs(x)>w/2-r*.55||Math.abs(y)>h/2-r*.55)return 'Too close to the edge';
  for(const f of F){if(f.panel!==key||f.face!=='back')continue;if(Math.abs(x-f.cx)<f.w/2+r*.7&&Math.abs(y-f.cy)<f.h/2+r*.7)return f.cat==='cover'?'That would cover the outer screen':'Too close to the camera';}
  if(S.optic!=='none'&&key===roles.cam&&mainLens&&Math.abs(x-mainLens.x)<13+r&&Math.abs(y-mainLens.y)<13+r)return 'The lens clip needs that space';
  for(const s of S.stickers){if(s.id===excl||s.panel!==key)continue;if(Math.hypot(s.x-x,s.y-y)<(STK[s.kind].r+r)*.8)return 'Overlaps another add-on';}
  return null;
}
function findPanel(o){while(o){if(o.userData&&o.userData.key&&P[o.userData.key]===o)return o.userData.key;o=o.parent;}return null;}
function updateGhost(){
  if(!ghost)return;const ev=evaluate();ghostState=ev;
  if(!ev){ghost.visible=false;showHint();return;}
  ghost.visible=true;const panel=P[ev.key];
  const wp=ev.hit.point.clone();const qn=new THREE.Quaternion();panel.getWorldQuaternion(qn);
  ghost.position.copy(wp);ghost.quaternion.copy(qn);ghost.rotateY(Math.PI);ghost.rotateZ(-ui.ghostRot);
  const mat=ev.why?M.ghostBad:M.ghostOk;ghost.traverse(o=>{if(o.isMesh)o.material=mat;});
  showHint();
}
function showHint(){
  const h=$('#hint');if(!ui.placing){h.hidden=true;return;}
  const st=ghostState;h.hidden=false;h.className='hint'+(st&&st.why?' bad':'');
  const msg=!st?`Point at the back of the phone to place the ${STK[ui.placing].name.toLowerCase()}.`:st.why?st.why+'.':'Click to place.';
  h.innerHTML=`<span class="dot"></span><span>${msg}</span><button id="h-rot" type="button">Rotate 15°</button><button id="h-x" type="button">Cancel</button>`;
}
function placeAt(ev){
  if(!ev||ev.why){toast(ev?ev.why:'Aim at the back of the phone');return;}
  const id='s'+Date.now().toString(36);
  S.stickers.push({id,kind:ui.placing,panel:ev.key,x:+ev.loc.x.toFixed(2),y:+ev.loc.y.toFixed(2),rot:ui.ghostRot,color:STK[ui.placing].tint?STK[ui.placing].col:undefined});
  const name=STK[ui.placing].name;cancelPlace();rebuild();commit();ui.selected=id;showSelection();renderUI();toast(`${name} placed. Select it to rotate or remove.`);
}
/* ---- drag & move ---- */
let drag=null,dragBox=null,hoverQ=false;
function dragInfo(o){while(o){const u=o.userData||{};if(u.partId)return {type:'part',id:u.partId};if(u.stickerId)return {type:'sticker',id:u.stickerId};if(u.charmId)return {type:'charm',id:u.charmId};if(o===phone)return null;o=o.parent;}return null;}
function pickDraggable(){
  ray.setFromCamera(pointer,camera);
  const list=[phone];Object.values(charmSims).forEach(c=>list.push(c.obj));
  const hit=ray.intersectObjects(list,true).find(h=>h.object.visible&&h.object.isMesh);
  if(!hit)return null;const info=dragInfo(hit.object);return info?Object.assign(info,{point:hit.point.clone()}):null;
}
function facePlanePoint(panel,face,point){
  ray.setFromCamera(pointer,camera);const q=panel.getWorldQuaternion(new THREE.Quaternion());const rd=ray.ray.direction;let n;
  if(face==='back'||face==='front')n=new V3(0,0,1).applyQuaternion(q);
  else{const ax=(AXIS_Y.includes(face)?new V3(0,1,0):new V3(1,0,0)).applyQuaternion(q);n=rd.clone().sub(ax.clone().multiplyScalar(rd.dot(ax)));if(n.lengthSq()<1e-6)return null;n.normalize();}
  if(Math.abs(n.dot(rd))<.08)return null;
  const out=new V3();return ray.ray.intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(n,point),out)?panel.worldToLocal(out):null;
}
function dragHint(text,bad){const h=$('#hint');h.hidden=false;h.className='hint'+(bad?' bad':'');h.innerHTML=`<span class="dot"></span><span>${text}</span>`;}
vp.addEventListener('pointerdown',e=>{
  if(e.target!==renderer.domElement||ui.placing||e.button>0)return;
  setPointer(e);const info=pickDraggable();if(!info)return;
  const d={...info,sx:e.clientX,sy:e.clientY,moved:false,why:null};
  if(info.type==='part'){const p=parts[info.id];if(!p)return;d.p=p;d.panel=P[p.panel];d.start=d.panel.worldToLocal(info.point.clone());d.u=p.u;d.v=p.v;}
  else if(info.type==='sticker'){const s=S.stickers.find(x=>x.id===info.id);if(!s)return;d.s=s;d.panel=P[s.panel];d.start=d.panel.worldToLocal(info.point.clone());d.x=s.x;d.y=s.y;}
  else{d.c=charmSims[info.id];if(!d.c)return;}
  drag=d;controls.enabled=false;controls.autoRotate=false;$('#spin').setAttribute('aria-pressed','false');
  try{renderer.domElement.setPointerCapture(e.pointerId);}catch(err){}
},true);
function moveDrag(e){
  const d=drag;if(!d.moved&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<5)return;
  if(!d.moved){d.moved=true;renderer.domElement.style.cursor='grabbing';
    const tgt=d.type==='part'?d.p.g:d.type==='sticker'?stickerObjs[d.s.id]:null;
    if(tgt){dragBox=new THREE.BoxHelper(tgt,0x63c08a);dragBox.material.depthTest=false;dragBox.renderOrder=20;scene.add(dragBox);}
    if(d.type==='charm')d.c.drag=d.c.x.clone();}
  if(d.type==='charm'){ray.setFromCamera(pointer,camera);const n=camera.getWorldDirection(new V3());const out=new V3();
    if(ray.ray.intersectPlane(new THREE.Plane().setFromNormalAndCoplanarPoint(n,d.c.x),out))d.c.drag=out;dragHint('Let go to watch it swing.');return;}
  if(d.type==='part'){
    const p=d.p,L=facePlanePoint(d.panel,p.face,d.point);if(!L)return;
    let u=p.u,v=p.v;if(p.face==='back'){u+=L.x-d.start.x;v+=L.y-d.start.y;}else if(AXIS_Y.includes(p.face))u+=L.y-d.start.y;else u+=L.x-d.start.x;
    [u,v]=clampPart(p,u,v);d.u=u;d.v=v;p.g.position.copy(offsetVec(p.face,u,v));
    if(p.id==='camera'&&telescope)telescope.position.set(u-p.u,v-p.v,telescope.position.z);
    d.why=partWhy(p,u,v);
    const pos=p.face==='back'?`x ${(u).toFixed(1)} · y ${(v).toFixed(1)} mm`:`${u>=0?'+':''}${u.toFixed(1)} mm along the edge`;
    dragHint(`${PART_NAMES[p.id]} · ${pos}${d.why?' · '+d.why:''}`,!!d.why);
  }
  if(d.type==='sticker'){
    const s=d.s,L=facePlanePoint(d.panel,'back',d.point);if(!L)return;
    const x=s.x+L.x-d.start.x,y=s.y+L.y-d.start.y;d.x=x;d.y=y;const g=stickerObjs[s.id];g.position.x=x;g.position.y=y;
    d.why=stickerWhy(s.panel,x,y,s.kind,s.id);dragHint(`${STK[s.kind].name} · x ${x.toFixed(1)} · y ${y.toFixed(1)} mm${d.why?' · '+d.why:''}`,!!d.why);
  }
  if(dragBox){dragBox.update();dragBox.material.color.set(d.why?0xe46a5e:0x63c08a);}
}
function endDrag(){
  const d=drag;drag=null;controls.enabled=true;renderer.domElement.style.cursor='';
  if(dragBox){scene.remove(dragBox);dragBox.geometry.dispose();dragBox=null;}
  if(!d||!d.moved){return;}
  $('#hint').hidden=true;
  if(d.type==='charm'){d.c.drag=null;return;}
  if(d.why){toast(d.why+'. Moved back.');rebuild();return;}
  if(d.type==='part'){S.offsets[d.p.id]={u:+d.u.toFixed(1),v:+d.v.toFixed(1)};rebuild();commit();renderUI();toast(`${PART_NAMES[d.p.id]} moved.`);}
  if(d.type==='sticker'){d.s.x=+d.x.toFixed(2);d.s.y=+d.y.toFixed(2);rebuild();commit();renderUI();}
}
renderer.domElement.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointermove',e=>{setPointer(e);
  if(drag){moveDrag(e);return;}
  if(ui.placing&&e.pointerType==='mouse'){updateGhost();return;}
  if(e.pointerType==='mouse'&&!hoverQ){hoverQ=true;requestAnimationFrame(()=>{hoverQ=false;if(drag||ui.placing)return;renderer.domElement.style.cursor=pickDraggable()?'grab':'';});}
});
renderer.domElement.addEventListener('pointercancel',()=>{if(drag)endDrag();});
renderer.domElement.addEventListener('pointerup',e=>{
  const wasDrag=drag&&drag.moved;if(drag)endDrag();if(wasDrag){downAt=null;return;}
  if(!downAt)return;const moved=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(moved>6)return;
  setPointer(e);
  if(ui.placing){const ev=evaluate();ghostState=ev;if(e.pointerType!=='mouse'){updateGhost();}placeAt(ev);return;}
  ray.setFromCamera(pointer,camera);
  const charmTargets=[];Object.values(charmSims).forEach(c=>c.obj.traverse(o=>{if(o.isMesh)charmTargets.push(o);}));
  const objs=[];Object.values(stickerObjs).forEach(g=>g.traverse(o=>{if(o.isMesh)objs.push(o);}));
  const hits=ray.intersectObjects(charmTargets.concat(objs,solids),false);
  const h=hits[0];
  if(h&&h.object.userData.charmId){flick(h.object.userData.charmId);return;}
  if(h&&h.object.userData.stickerId){ui.selected=h.object.userData.stickerId;}else ui.selected=null;
  showSelection();
});
let selRing=null;
function showSelection(){
  if(selRing){selRing.parent&&selRing.parent.remove(selRing);selRing=null;}
  const insp=$('#insp');const s=S.stickers.find(x=>x.id===ui.selected);
  if(!s||!stickerObjs[s.id]){insp.hidden=true;return;}
  const r=STK[s.kind].r+2;selRing=new THREE.Mesh(new THREE.RingGeometry(r,r+.8,48),M.sel);selRing.position.z=.6;selRing.renderOrder=10;stickerObjs[s.id].add(selRing);
  const k=STK[s.kind];
  insp.hidden=false;
  insp.innerHTML=`<div class="row"><strong>${k.name}</strong><button class="icon-btn" id="i-done" type="button">Done</button></div>
  <div class="range"><label for="i-rot">Rotation <output id="i-rot-o">${Math.round(s.rot*180/Math.PI)}°</output></label><input id="i-rot" type="range" min="0" max="360" step="1" value="${Math.round(((s.rot*180/Math.PI)%360+360)%360)}"></div>
  ${k.tint?`<div class="row"><label for="i-col" style="font-size:12.5px;font-weight:600">Colour</label><input id="i-col" type="color" value="${s.color||k.col}"></div>`:''}
  <button class="btn wide" id="i-del" type="button" style="color:var(--bad)">Remove from phone</button>`;
}
$('#insp').addEventListener('input',e=>{
  const s=S.stickers.find(x=>x.id===ui.selected);if(!s)return;
  if(e.target.id==='i-rot'){s.rot=deg(+e.target.value);$('#i-rot-o').textContent=e.target.value+'°';const g=stickerObjs[s.id];g.rotation.set(0,Math.PI,0);g.rotateZ(-s.rot);}
  if(e.target.id==='i-col'){s.color=e.target.value;const sel=ui.selected;rebuild();ui.selected=sel;showSelection();}
});
$('#insp').addEventListener('change',()=>commit());
$('#insp').addEventListener('click',e=>{
  if(e.target.id==='i-done'){ui.selected=null;showSelection();}
  if(e.target.id==='i-del'){S.stickers=S.stickers.filter(x=>x.id!==ui.selected);ui.selected=null;rebuild();commit();renderUI();toast('Removed.');}
});
$('#hint').addEventListener('click',e=>{if(e.target.id==='h-x'){cancelPlace();renderUI();}if(e.target.id==='h-rot'){ui.ghostRot+=deg(15);updateGhost();}});
addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea'))return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey){if(hi<hist.length-1)restore(hi+1);}else if(hi>0)restore(hi-1);return;}
  if(e.key==='Escape'){if(ui.placing){cancelPlace();renderUI();}else{ui.selected=null;showSelection();}}
  if(ui.placing&&(e.key==='q'||e.key==='e')){ui.ghostRot+=deg(e.key==='q'?-15:15);updateGhost();}
  if(!ui.placing&&ui.selected&&(e.key==='Delete'||e.key==='Backspace')){S.stickers=S.stickers.filter(x=>x.id!==ui.selected);ui.selected=null;rebuild();commit();renderUI();}
});

/* ------------------------------------------------------------------ telescope view */
const telCam=new THREE.PerspectiveCamera(5,1,40,9000);
function baseDir(){return new V3(0,0,-1).transformDirection(P[roles.cam].matrixWorld);}
function aimTelescope(){
  if(!telTip)return false;const pos=telTip.getWorldPosition(new V3());const b=baseDir();
  const yaw=Math.atan2(b.x,-b.z)+deg(ui.yaw),pitch=Math.asin(clamp(b.y,-1,1))+deg(ui.pitch);
  const dir=new V3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  telCam.position.copy(pos);telCam.lookAt(pos.clone().add(dir));telCam.fov=40/ui.zoom;telCam.near=2;telCam.updateProjectionMatrix();return true;
}
function findMoon(){
  if(!telTip)return;const pos=telTip.getWorldPosition(new V3());const b=baseDir();const m=moon.position.clone().sub(pos).normalize();
  ui.yaw=clamp(Math.round((Math.atan2(m.x,-m.z)-Math.atan2(b.x,-b.z))*180/Math.PI),-45,45);
  ui.pitch=clamp(Math.round((Math.asin(m.y)-Math.asin(clamp(b.y,-1,1)))*180/Math.PI),-45,45);
  ui.zoom=Math.max(ui.zoom,12);renderUI();
}

/* ------------------------------------------------------------------ backdrops */
function setBackdrop(b){
  ui.backdrop=b;envGroup.visible=b==='workshop';shadowFloor.visible=b!=='workshop';
  scene.background=b==='studio'?new THREE.Color(0xe7e3db):b==='midnight'?new THREE.Color(0x0d1324):null;
  renderer.setClearColor(0x000000,b==='transparent'?0:1);
  vp.classList.toggle('checker',b==='transparent');
  shadowFloor.material.opacity=b==='studio'?.22:.4;
}

/* ------------------------------------------------------------------ export */
async function renderExport(){
  const [W,H]=ui.res.split('x').map(Number);
  const hidden=[];const hide=o=>{if(o&&o.visible){o.visible=false;hidden.push(o);}};
  (glowGroup||[]).forEach(hide);hide(ghost);hide(selRing);
  const size=renderer.getSize(new THREE.Vector2()),pr=renderer.getPixelRatio();
  const cam=camera.clone();cam.aspect=W/H;
  if(W/H<camera.aspect){cam.fov=2*Math.atan(Math.tan(deg(camera.fov)/2)*camera.aspect/(W/H))*180/Math.PI;}
  cam.updateProjectionMatrix();
  renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);
  renderer.render(scene,cam);
  const out=document.createElement('canvas');out.width=W;out.height=H;const g=out.getContext('2d');g.drawImage(renderer.domElement,0,0);
  renderer.setPixelRatio(pr);renderer.setSize(size.x,size.y,false);hidden.forEach(o=>o.visible=true);
  if(ui.card)drawSpecCard(g,W,H);
  const blob=await new Promise(r=>out.toBlob(r,'image/png'));
  return {blob,W,H};
}
function drawSpecCard(g,W,H){
  const s=Math.min(W,H)/1080,x=48*s,pad=26*s,cw=430*s;
  const rows=[['Chassis',FORMS[S.form].name+(S.form!=='classic'?` · ${S.open}°`:'')],['Camera',HW.camera.opts.find(o=>o.v===S.camera).name],['Audio',HW.speaker.opts.find(o=>o.v===S.speaker).name+(S.jack!=='none'?' + 3.5 mm':'')],['Port',HW.port.opts.find(o=>o.v===S.port).name],['Finish',(FINISHES.find(f=>f[0]===S.color)||[0,S.color.toUpperCase()])[1]+' · '+S.material],['Case',CASES[S.case].name],['Est. weight',weight()+' g']];
  const ch=pad*2+64*s+rows.length*30*s,y=H-48*s-ch;
  g.save();g.fillStyle='rgba(17,20,24,.86)';g.beginPath();g.roundRect?g.roundRect(x,y,cw,ch,18*s):g.rect(x,y,cw,ch);g.fill();
  g.fillStyle='#d8a24a';g.font=`500 ${13*s}px "JetBrains Mono", monospace`;g.fillText('PHONESMITH · BUILD SHEET',x+pad,y+pad+12*s);
  g.fillStyle='#ece6da';g.font=`800 ${30*s}px "Bricolage Grotesque", system-ui, sans-serif`;g.fillText(`${FORMS[S.form].name} in ${(FINISHES.find(f=>f[0]===S.color)||[0,'Custom'])[1]}`,x+pad,y+pad+50*s);
  rows.forEach((r,i)=>{const yy=y+pad+64*s+(i+.7)*30*s;g.fillStyle='#939aa4';g.font=`500 ${15*s}px Manrope, system-ui, sans-serif`;g.fillText(r[0],x+pad,yy);
    g.fillStyle='#ece6da';g.font=`500 ${14*s}px "JetBrains Mono", monospace`;g.textAlign='right';g.fillText(r[1],x+cw-pad,yy);g.textAlign='left';});
  g.fillStyle=S.color;g.beginPath();g.arc(x+cw-pad-10*s,y+pad+40*s,10*s,0,7);g.fill();
  g.restore();
}
let lastExport=null;
async function openExport(){
  const modal=$('#modal');modal.hidden=false;modal.innerHTML=`<div class="modal-card"><div class="row"><strong style="font-family:var(--display);font-size:20px">Rendering…</strong></div><p class="note">Drawing ${ui.res.replace('x',' × ')} px.</p></div>`;
  await new Promise(r=>requestAnimationFrame(()=>r()));
  const {blob,W,H}=await renderExport();
  if(lastExport&&lastExport.url)URL.revokeObjectURL(lastExport.url);
  const name=`phonesmith-${S.form}-${new Date().toISOString().slice(0,10)}.png`;
  lastExport={blob,url:URL.createObjectURL(blob),name};
  modal.innerHTML=`<div class="modal-card" role="dialog" aria-label="Your render">
    <div class="row"><strong style="font-family:var(--display);font-size:20px">Your render</strong><span class="meta">${W} × ${H} px · ${(blob.size/1048576).toFixed(1)} MB · PNG</span></div>
    <img src="${lastExport.url}" alt="Rendered image of your custom phone">
    <p class="note" id="m-status">Save it as <span style="font-family:var(--mono)">${name}</span>.</p>
    <div class="row"><button class="btn" id="m-close" type="button">Back to the bench</button><button class="btn primary" id="m-save" type="button">Save PNG</button></div></div>`;
}
$('#modal').addEventListener('click',async e=>{
  if(e.target.id==='m-close'||e.target.id==='modal'){$('#modal').hidden=true;return;}
  if(e.target.id==='m-save'&&lastExport){
    const st=$('#m-status');let dl=null;
    try{dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;}catch(err){dl=null;}
    if(!dl){const a=document.createElement('a');a.href=lastExport.url;a.download=lastExport.name;document.body.appendChild(a);a.click();a.remove();st.textContent='Saved to your downloads.';return;}
    try{await dl.save({filename:lastExport.name,data:lastExport.blob});st.textContent='Saved.';}
    catch(err){const c=err&&err.code;st.textContent=c==='declined'?'Save cancelled.':c==='rate_limited'?'A save prompt is already open. Finish that one first.':'Saving isn’t available here. Right-click or long-press the image to save it.';}
  }
});

/* ------------------------------------------------------------------ UI */
const STEPS=[['chassis','Chassis'],['hardware','Hardware'],['finish','Finish'],['accessorize','Accessorize'],['showcase','Showcase']];
const ICON={
  classic:'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="4" width="16" height="32" rx="4"/><path d="M18 8h4"/></svg>',
  flip:'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="20" width="16" height="16" rx="3"/><path d="M13 19 L15 5 Q15.4 3.5 17 3.6 L27 4.4 Q28.6 4.6 28.4 6.2 L27 19"/><path d="M12 20h16" stroke-dasharray="2 2"/></svg>',
  fold:'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="20" y="6" width="14" height="28" rx="3"/><path d="M20 6 L8 9 Q6 9.6 6 11.6 V30 Q6 32 8 32.4 L20 34"/></svg>',
  star:'<svg viewBox="0 0 30 30"><path fill="#f1c94b" d="M15 3l3.5 8 8.5.6-6.5 5.6 2 8.4L15 21l-7.5 4.6 2-8.4L3 11.6l8.5-.6z"/></svg>',
  heart:'<svg viewBox="0 0 30 30"><path fill="#e2564f" d="M15 26S4 19 4 11.5A5.5 5.5 0 0 1 15 8a5.5 5.5 0 0 1 11 3.5C26 19 15 26 15 26z"/></svg>',
  cherry:'<svg viewBox="0 0 30 30"><path d="M15 4c-1 6-5 9-6 13M15 4c1 6 4 9 6 12" stroke="#4d7a3a" stroke-width="1.6" fill="none"/><circle cx="9" cy="20" r="5" fill="#c3203a"/><circle cx="21" cy="19" r="5" fill="#c3203a"/></svg>',
  die:'<svg viewBox="0 0 30 30"><rect x="5" y="5" width="20" height="20" rx="4" fill="#f3f0e8"/><g fill="#1b1d22"><circle cx="11" cy="11" r="2"/><circle cx="19" cy="11" r="2"/><circle cx="11" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></g></svg>',
  bell:'<svg viewBox="0 0 30 30"><path fill="#d7ae47" d="M15 4a2 2 0 0 1 2 2c4 1 6 5 6 10v4l2 2H5l2-2v-4c0-5 2-9 6-10a2 2 0 0 1 2-2z"/><circle cx="15" cy="25" r="2" fill="#bfc4cb"/></svg>',
  bolt:'<svg viewBox="0 0 30 30"><path fill="#7fc4ef" d="M17 3L7 17h7l-2 10 11-15h-7z"/></svg>',
  grip:'<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="#e8604c"/><circle cx="15" cy="15" r="7" fill="none" stroke="#c9a46a" stroke-width="1.5"/></svg>',
  ring:'<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="10" fill="none" stroke="#c9a46a" stroke-width="3"/><circle cx="15" cy="15" r="5" fill="#c9a46a"/></svg>',
  stbolt:'<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="12" fill="#1b1d22" stroke="#fff" stroke-width="2"/><path fill="#f3c63f" d="M16.5 5L8 16h5.5L12 25l9-12h-6z"/></svg>',
  ststar:'<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="12" fill="#f06fa0" stroke="#fff" stroke-width="2"/><path fill="#fff6e0" d="M15 6l2.6 6 6.4.4-5 4.2 1.6 6.4L15 19.5 9.4 23l1.6-6.4-5-4.2 6.4-.4z"/></svg>',
  stsmile:'<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="12" fill="#f5d33b" stroke="#fff" stroke-width="2"/><circle cx="11" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><path d="M9.5 17a6 6 0 0 0 11 0" stroke="#1b1d22" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  stword:'<svg viewBox="0 0 30 30"><rect x="2" y="10" width="26" height="10" rx="3" fill="#14171c" stroke="#d8a24a"/><path d="M6 15h18" stroke="#d8a24a" stroke-width="2"/></svg>',
  telescope:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17l18-8 2 5-18 8z"/><path d="M12 19l-3 8M14 18l4 9"/></svg>',
  macro:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><circle cx="15" cy="15" r="9"/><circle cx="15" cy="15" r="4"/></svg>',
  none:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><circle cx="15" cy="15" r="10"/><path d="M8 22L22 8"/></svg>',
  easel:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 4L7 27M15 4l8 23M8 20h14"/></svg>',
  dock:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="17" width="12" height="10" rx="2"/><rect x="11" y="4" width="8" height="14" rx="2"/></svg>',
  tripod:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="4" width="14" height="8" rx="2"/><path d="M15 12v6M15 18l-7 9M15 18l7 9M15 18v9"/></svg>',
  slim:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="3" width="14" height="24" rx="4"/></svg>',
  rugged:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2.6"><rect x="8" y="3" width="14" height="24" rx="4"/><path d="M6 6v3M24 6v3M6 21v3M24 21v3"/></svg>',
  clear:'<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"><rect x="8" y="3" width="14" height="24" rx="4"/></svg>'
};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function card(act,v,name,spec,on,ic,why){return `<button type="button" class="card${ic?'':' noic'}" data-act="${act}" data-v="${v}" aria-pressed="${on}" ${why?'disabled':''}>${ic?`<span class="ic">${ic}</span>`:''}<strong>${esc(name)}</strong><span class="spec">${esc(spec)}</span>${why?`<span class="why">${esc(why)}</span>`:''}</button>`;}
function hingeRange(){return S.form==='classic'?'':`<div class="range"><label for="hinge">Hinge angle <output id="hinge-o">${S.open}°</output></label><input id="hinge" type="range" min="0" max="180" step="1" value="${S.open}"><p class="note">0° is shut, 180° lies flat. Drag it and watch the charms swing.</p></div>`;}

function renderSteps(){
  $('#steps').innerHTML=STEPS.map(([k,l],i)=>`<button type="button" data-step="${i}" ${i===ui.step?'aria-current="step"':''} class="${i<ui.step?'done':''}"><b>${i+1}</b><span>${l}</span></button>`).join('');
}
function renderUI(){
  renderSteps();const d=$('#drawer');let h='';
  const step=STEPS[ui.step][0];
  if(step==='chassis'){
    h+=`<div><div class="eyebrow">Step 1 · Form factor</div><h2>Pick a chassis</h2><p class="lede">Everything else mounts to this. You can switch later; hardware that won’t fit is swapped for the nearest option.</p></div>
    <div class="cards">${Object.entries(FORMS).map(([k,f])=>`<button type="button" class="card big" data-act="form" data-v="${k}" aria-pressed="${S.form===k}"><span class="ic">${ICON[k]}</span><strong>${f.name} <span class="spec">· ${f.sub}</span></strong><span class="spec">${k==='classic'?'72 × 150 × 8.2 mm':k==='flip'?'72 × 150 × 7.4 mm open':'132 × 152 × 6.0 mm open'}</span><p>${f.desc}</p></button>`).join('')}</div>${hingeRange()}`;
  }
  if(step==='hardware'){
    h+=`<div><div class="eyebrow">Step 2 · Components</div><h2>Install hardware</h2><p class="lede">The glowing outline shows where each part mounts. Drag any part on the phone to slide it along its face; it snaps back if it would hit something.</p></div>
    <div class="tabs" role="tablist">${HW_TABS.map(([k,l])=>`<button type="button" role="tab" data-act="hwtab" data-v="${k}" aria-selected="${ui.hwTab===k}">${l}</button>`).join('')}</div>`;
    const tab=HW_TABS.find(t=>t[0]===ui.hwTab);
    tab[2].forEach(key=>{h+=`<div class="group"><h3>${HW[key].label}</h3><div class="cards">${HW[key].opts.map(o=>card('hw:'+key,o.v,o.name,o.spec,S[key]===o.v,null,blocked(key,o.v))).join('')}</div></div>`;});
    const moved=Object.keys(S.offsets||{}).filter(k=>parts[k]&&(S.offsets[k].u||S.offsets[k].v));
    h+=moved.length?`<div class="group"><h3>Moved parts</h3><ul class="list">${moved.map(k=>`<li>${PART_NAMES[k]} <span>${parts[k].face==='back'?`${S.offsets[k].u}, ${S.offsets[k].v} mm`:`${S.offsets[k].u} mm`}</span><button type="button" class="link-btn" style="color:var(--muted)" data-act="resetpart" data-v="${k}">Reset</button></li>`).join('')}</ul><button type="button" class="btn" data-act="resetpos" style="margin-top:8px">Reset all positions</button></div>`:'';
  }
  if(step==='finish'){
    const fname=(FINISHES.find(f=>f[0]===S.color)||[0,'Custom'])[1];
    h+=`<div><div class="eyebrow">Step 3 · Aesthetics</div><h2>Paint &amp; finish</h2><p class="lede">Colour goes on the chassis. Accent covers the keys and lens rings.</p></div>
    <div class="group"><h3>Chassis colour</h3><div class="color-row"><input type="color" id="col" value="${S.color}" aria-label="Pick any colour"><div><div class="hex">${S.color.toUpperCase()}</div><div class="nm">${fname}</div></div></div>
    <div class="swatches">${FINISHES.map(([c,n])=>`<button type="button" class="sw" style="background:${c}" data-act="color" data-v="${c}" aria-pressed="${S.color===c}" title="${n}" aria-label="${n}"></button>`).join('')}</div></div>
    <div class="group"><h3>Surface</h3><div class="seg">${['matte','gloss','metal','glass'].map(m=>`<button type="button" data-act="material" data-v="${m}" aria-pressed="${S.material===m}">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</div></div>
    <div class="group"><h3>Accent metal</h3><div class="swatches">${ACCENTS.map(([c,n])=>`<button type="button" class="sw" style="background:${c}" data-act="accent" data-v="${c}" aria-pressed="${S.accent===c}" title="${n}" aria-label="${n}"></button>`).join('')}</div></div>`;
  }
  if(step==='accessorize'){
    const tabs=[['cases','Cases'],['stands','Stands'],['charms','Charms'],['addons','Grips & stickers'],['optics','Optics']];
    h+=`<div><div class="eyebrow">Step 4 · Accessories</div><h2>Accessorize</h2></div>
    <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-act="acctab" data-v="${k}" aria-selected="${ui.accTab===k}">${l}</button>`).join('')}</div>`;
    if(ui.accTab==='cases'){h+=`<div class="cards">${Object.entries(CASES).map(([k,c])=>card('case',k,c.name,c.spec,S.case===k,ICON[k]||ICON.none)).join('')}</div>`;
      if(S.case!=='none'&&S.case!=='clear')h+=`<div class="group"><h3>Case colour</h3><div class="swatches">${CASE_COLORS.map(c=>`<button type="button" class="sw" style="background:${c}" data-act="caseColor" data-v="${c}" aria-pressed="${S.caseColor===c}" aria-label="Case colour ${c}"></button>`).join('')}</div></div>`;
      h+=`<p class="note">Cutouts are cut from whatever hardware you installed, so the case always fits.</p>`;}
    if(ui.accTab==='stands'){h+=`<div class="cards">${Object.entries(STANDS).map(([k,c])=>card('stand',k,c.name,c.spec,S.stand===k,ICON[k]||ICON.none)).join('')}</div><p class="note">Stands size themselves to the phone, including Fold and Flip at any hinge angle.</p>`;}
    if(ui.accTab==='charms'){
      h+=`<div class="group"><h3>Add a charm · ${S.charms.length}/3 loops used</h3><div class="grid3">${Object.entries(CHARMS).map(([k,c])=>`<button type="button" class="tile" data-act="charm" data-v="${k}" ${S.charms.length>=3?'disabled':''}>${ICON[k]}${c.name}</button>`).join('')}</div></div>`;
      h+=S.charms.length?`<ul class="list">${S.charms.map(c=>`<li>${CHARMS[c.kind].name} <span>loop ${c.slot+1}</span><button type="button" class="link-btn" data-act="uncharm" data-v="${c.id}">Remove</button></li>`).join('')}</ul><p class="note">Click a charm on the phone to flick it.</p>`:`<p class="note">Charms hang from lanyard loops on the bottom edge.</p>`;}
    if(ui.accTab==='addons'){
      h+=`<div class="grid3">${Object.entries(STK).map(([k,c])=>`<button type="button" class="tile" data-act="place" data-v="${k}" aria-pressed="${ui.placing===k}">${(k==='grip'||k==='ring')?ICON[k]:ICON['st'+k]}${c.name}</button>`).join('')}</div>
      <p class="note">Pick one, then click the back of the phone. A green ghost means it fits; red tells you why it doesn’t. Press Q or E to rotate. Drag a placed one to move it.</p>`;
      if(S.stickers.length)h+=`<ul class="list">${S.stickers.map(s=>`<li>${STK[s.kind].name} <span>${s.panel==='aux'?'lid':'back'} · ${s.x.toFixed(0)}, ${s.y.toFixed(0)} mm</span><button type="button" class="link-btn" data-act="unstick" data-v="${s.id}">Remove</button></li>`).join('')}</ul>`;
    }
    if(ui.accTab==='optics'){h+=`<div class="cards">${Object.entries(OPTICS).map(([k,c])=>card('optic',k,c.name,c.spec,S.optic===k,ICON[k])).join('')}</div>`;
      if(S.optic==='telescope')h+=telControls();}
  }
  if(step==='showcase'){
    h+=`<div><div class="eyebrow">Step 5 · Output</div><h2>Showcase &amp; render</h2><p class="lede">Frame it in the viewport, then render a high-resolution PNG from that exact angle.</p></div>${hingeRange()}
    <div class="group"><h3>Backdrop</h3><div class="seg">${[['workshop','Workshop'],['studio','Studio'],['midnight','Midnight'],['transparent','Clear']].map(([k,l])=>`<button type="button" data-act="backdrop" data-v="${k}" aria-pressed="${ui.backdrop===k}">${l}</button>`).join('')}</div></div>
    <div class="group"><h3>Resolution</h3><select id="res" aria-label="Render resolution">${[['1920x1080','1920 × 1080 · Full HD'],['2560x1440','2560 × 1440 · QHD'],['3840x2160','3840 × 2160 · 4K'],['2048x2048','2048 × 2048 · Square'],['1440x2560','1440 × 2560 · Portrait']].map(([v,l])=>`<option value="${v}" ${ui.res===v?'selected':''}>${l}</option>`).join('')}</select></div>
    <label class="check"><input type="checkbox" id="card" ${ui.card?'checked':''}> Add a build sheet to the corner</label>
    ${S.optic==='telescope'?telControls():''}
    <div class="group"><h3>Build sheet</h3><dl class="sheet">
      <dt>Chassis</dt><dd>${FORMS[S.form].name}</dd><dt>Camera</dt><dd>${HW.camera.opts.find(o=>o.v===S.camera).name}</dd><dt>Speakers</dt><dd>${HW.speaker.opts.find(o=>o.v===S.speaker).name}</dd>
      <dt>Keys</dt><dd>${S.power} · ${S.volume}</dd><dt>Jack</dt><dd>${S.jack==='none'?'—':S.jack}</dd><dt>Port</dt><dd>${HW.port.opts.find(o=>o.v===S.port).name}</dd>
      <dt>Finish</dt><dd>${S.color.toUpperCase()} ${S.material}</dd><dt>Case</dt><dd>${CASES[S.case].name}</dd><dt>Stand</dt><dd>${STANDS[S.stand].name}</dd><dt>Add-ons</dt><dd>${S.charms.length} charm · ${S.stickers.length} surface</dd><dt>Est. weight</dt><dd>${weight()} g</dd></dl></div>`;
  }
  d.innerHTML=h;
  const f=$('#foot');
  f.innerHTML=`<button type="button" class="btn" data-act="prev" ${ui.step===0?'disabled':''}>← Back</button>`+(ui.step<4?`<button type="button" class="btn primary" data-act="next">${STEPS[ui.step+1][1]} →</button>`:`<button type="button" class="btn primary" data-act="render">Render image</button>`);
}
function telControls(){
  return `<div class="group"><h3>Telescope view</h3>
  <label class="check" style="margin-bottom:10px"><input type="checkbox" id="pipon" ${ui.pip?'checked':''}> Look through the eyepiece</label>
  <div class="range"><label for="zoom">Zoom <output>${ui.zoom}×</output></label><input id="zoom" type="range" min="1" max="40" value="${ui.zoom}"></div>
  <div class="range"><label for="yaw">Aim left / right <output>${ui.yaw}°</output></label><input id="yaw" type="range" min="-45" max="45" value="${ui.yaw}"></div>
  <div class="range"><label for="pitch">Aim down / up <output>${ui.pitch}°</output></label><input id="pitch" type="range" min="-45" max="45" value="${ui.pitch}"></div>
  <button type="button" class="btn" data-act="moon" style="margin-top:8px">Find the Moon</button></div>`;
}
function sanitize(){
  let changed=[];
  ['camera','jack','speaker','power'].forEach(k=>{if(blocked(k,S[k])){const o=HW[k].opts.find(x=>!blocked(k,x.v));changed.push(`${HW[k].label}: ${o.name}`);S[k]=o.v;}});
  return changed;
}
function setStep(i){
  cancelPlace();ui.step=clamp(i,0,4);
  if(ui.step===4){ui.spin=true;controls.autoRotate=true;}else if(ui.spin&&ui.step!==4){}
  $('#spin').setAttribute('aria-pressed',String(controls.autoRotate));
  refreshGlow();renderUI();
  if(ui.step===1)flyTo(viewFor(ui.hwTab));if(ui.step===0||ui.step===2||ui.step===4)flyTo('hero');
}
function viewFor(tab){return {camera:'back',speaker:S.speaker==='front'?'front':S.speaker==='side'?'left':'bottom',buttons:S.power==='left'?'left':'right',jack:S.jack==='top'?'top':'bottom',port:'bottom'}[tab];}

$('#steps').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)setStep(+b.dataset.step);});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;
  const a=b.dataset.act,v=b.dataset.v;
  if(a==='prev')return setStep(ui.step-1);
  if(a==='next')return setStep(ui.step+1);
  if(a==='render')return openExport();
  if(a==='form'){if(S.form===v)return;S.form=v;S.open=v==='classic'?165:165;const ch=sanitize();S.stickers=S.stickers.filter(s=>s.panel==='main');rebuild();commit();renderUI();flyTo('hero');toast(ch.length?`${FORMS[v].name} chassis. Swapped ${ch.join(', ')}.`:`${FORMS[v].name} chassis on the bench.`);return;}
  if(a==='hwtab'){ui.hwTab=v;refreshGlow();renderUI();flyTo(viewFor(v));return;}
  if(a.startsWith('hw:')){const k=a.slice(3);S[k]=v;rebuild();commit();renderUI();flyTo(viewFor(ui.hwTab));return;}
  if(a==='resetpart'){delete S.offsets[v];rebuild();commit();renderUI();return;}
  if(a==='resetpos'){S.offsets={};rebuild();commit();renderUI();toast('Every part is back in its default spot.');return;}
  if(a==='color'){S.color=v;rebuild();commit();renderUI();return;}
  if(a==='material'||a==='accent'||a==='caseColor'){S[a]=v;applyFinish();if(a==='material')rebuild();commit();renderUI();return;}
  if(a==='acctab'){ui.accTab=v;cancelPlace();renderUI();if(v==='addons'||v==='optics')flyTo('back');else if(v==='charms')flyTo('front');else flyTo('hero');return;}
  if(a==='case'){S.case=v;rebuild();commit();renderUI();return;}
  if(a==='stand'){S.stand=v;rebuild();commit();renderUI();flyTo('hero');return;}
  if(a==='charm'){if(S.charms.length>=3)return;const used=S.charms.map(c=>c.slot);const slot=[0,2,1].find(s=>!used.includes(s));S.charms.push({id:'c'+Date.now().toString(36),kind:v,slot});syncCharms();commit();renderUI();updateHUD();flyTo('front');return;}
  if(a==='uncharm'){S.charms=S.charms.filter(c=>c.id!==v);syncCharms();commit();renderUI();updateHUD();return;}
  if(a==='place'){if(ui.placing===v){cancelPlace();renderUI();}else startPlace(v);return;}
  if(a==='unstick'){S.stickers=S.stickers.filter(s=>s.id!==v);if(ui.selected===v)ui.selected=null;rebuild();commit();renderUI();return;}
  if(a==='optic'){const prev=S.optic;S.optic=v;if(v!=='telescope')ui.pip=false;rebuild();commit();if(v!=='none'&&v!==prev){telAnim=1;toast(v==='telescope'?'Telescope snapped to the main lens.':'Macro clip snapped to the main lens.');}renderUI();flyTo(v==='none'?'back':'hero');return;}
  if(a==='backdrop'){setBackdrop(v);renderUI();return;}
  if(a==='moon'){ui.pip=true;findMoon();return;}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='hinge'){S.open=+t.value;$('#hinge-o').textContent=S.open+'°';setHinge();phone.updateMatrixWorld(true);buildStand();updateHUD();}
  if(t.id==='col'){S.color=t.value;applyFinish();const hx=t.parentElement.querySelector('.hex');if(hx)hx.textContent=t.value.toUpperCase();}
  if(t.id==='zoom'||t.id==='yaw'||t.id==='pitch'){ui[t.id]=+t.value;const o=t.parentElement.querySelector('output');o.textContent=t.value+(t.id==='zoom'?'×':'°');if(!ui.pip){ui.pip=true;const c=$('#pipon');if(c)c.checked=true;}}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='hinge')commit();
  if(t.id==='col'){rebuild();commit();renderUI();}
  if(t.id==='res')ui.res=t.value;
  if(t.id==='card')ui.card=t.checked;
  if(t.id==='pipon')ui.pip=t.checked;
});
$('#viewbar').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(!b)return;
  if(b.dataset.view==='spin'){controls.autoRotate=!controls.autoRotate;b.setAttribute('aria-pressed',String(controls.autoRotate));return;}
  controls.autoRotate=false;$('#spin').setAttribute('aria-pressed','false');flyTo(b.dataset.view);});
$('#undo').addEventListener('click',()=>{if(hi>0)restore(hi-1);});
$('#redo').addEventListener('click',()=>{if(hi<hist.length-1)restore(hi+1);});
$('#rand').addEventListener('click',()=>{
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  S.form=pick(Object.keys(FORMS));S.open=S.form==='classic'?165:pick([90,120,150,165,180]);
  ['camera','speaker','power','volume','jack','port'].forEach(k=>{S[k]=pick(HW[k].opts).v;});sanitize();sanitize();
  S.color=pick(FINISHES)[0];S.material=pick(Object.keys(MATS));S.accent=pick(ACCENTS)[0];S.case=pick(Object.keys(CASES));S.caseColor=pick(CASE_COLORS);S.stand=pick(Object.keys(STANDS));
  S.optic=pick(['none','none','telescope','macro']);S.charms=[];const n=Math.floor(Math.random()*3);for(let i=0;i<n;i++)S.charms.push({id:'c'+i+Date.now().toString(36),kind:pick(Object.keys(CHARMS)),slot:[0,2,1][i]});
  S.stickers=[];S.offsets={};ui.selected=null;rebuild();
  // drop one random valid add-on on the back
  const kind=pick(Object.keys(STK));const {w,h}=dims('main');
  for(let i=0;i<20;i++){const x=(Math.random()-.5)*(w-26),y=(Math.random()-.5)*(h-30);const r=STK[kind].r;
    const bad=F.some(f=>f.panel==='main'&&f.face==='back'&&Math.abs(x-f.cx)<f.w/2+r&&Math.abs(y-f.cy)<f.h/2+r)||(S.optic!=='none'&&roles.cam==='main'&&mainLens&&Math.hypot(x-mainLens.x,y-mainLens.y)<30);
    if(!bad){S.stickers.push({id:'s'+Date.now().toString(36),kind,panel:'main',x,y,rot:Math.random()*6,color:STK[kind].tint?pick(['#e8604c','#7fc4ef','#f1c94b','#a99bd1']):undefined});break;}}
  rebuild();commit();renderUI();flyTo('hero');toast('Random build: '+FORMS[S.form].name+', '+HW.camera.opts.find(o=>o.v===S.camera).name.toLowerCase()+'.');
});

let toastT;
function toast(msg){const t=$('#toast');t.textContent=msg;t.style.opacity='1';clearTimeout(toastT);toastT=setTimeout(()=>t.style.opacity='0',2600);}

/* ------------------------------------------------------------------ loop */
function resize(){const w=vp.clientWidth,h=vp.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(vp);resize();
let last=performance.now(),acc=0;
function frame(now){
  requestAnimationFrame(frame);
  stepTween(now);controls.update();
  acc+=Math.min(now-last,100);last=now;while(acc>16){stepCharms();acc-=16;}
  if(glowGroup&&glowGroup.length)M.glow.opacity=.45+.4*Math.sin(now*.005);
  if(telescope&&telAnim>0){telAnim=Math.max(0,telAnim-.035);const k=telAnim*telAnim;telescope.position.z=-60*k;}
  const w=vp.clientWidth,h=vp.clientHeight;
  renderer.setScissorTest(false);renderer.setViewport(0,0,w,h);renderer.render(scene,camera);
  const pip=$('#pip');
  if(ui.pip&&S.optic==='telescope'&&aimTelescope()){
    pip.hidden=false;const size=pip.offsetWidth,x=w-16-size,y=parseFloat(getComputedStyle(pip).bottom);
    $('#pip-l').textContent=`Telescope · ${ui.zoom}×`;
    renderer.setScissorTest(true);renderer.setScissor(x,y,size,size);renderer.setViewport(x,y,size,size);
    const bg=scene.background;if(!envGroup.visible){scene.background=new THREE.Color(0x05070f);}
    const ev=envGroup.visible;envGroup.visible=true;
    renderer.render(scene,telCam);envGroup.visible=ev;scene.background=bg;renderer.setScissorTest(false);
  }else pip.hidden=true;
}

/* ------------------------------------------------------------------ boot */
setBackdrop('workshop');rebuild();renderUI();updateUndo();
camera.position.set(200,70,330);flyTo('hero');
requestAnimationFrame(frame);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{Object.keys(stickerTex).forEach(k=>delete stickerTex[k]);rebuild();});
})();
