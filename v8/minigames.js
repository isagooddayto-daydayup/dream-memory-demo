// 回忆与梦境 v5 · 童年小游戏（90 年代闽西校园怀旧）
// 道具全部用 three.js 程序化几何体 + 程序化贴图（0 外部素材）；对手/伙伴用场景里已有的 Rocketbox(MIT) 写实少女 NPC。
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from './lib/addons/meshopt_decoder.module.js';
THREE.Cache.enabled=true;

const NPCF={xy:'npc/real/c04_fa11_npc.glb',xw:'npc/real/c05_fa03_npc.glb',lena:'npc/real/d03_fp01_npc.glb',xq:'npc/real/d01_fa12_npc.glb',yue:'npc/real/d02_fa15_npc.glb',vivi:'npc/real/d04_fp02_npc.glb'};
const NAME={xy:'晓雨',xw:'小雯',lena:'Lena',xq:'小晴',yue:'小悦',vivi:'Vivi'};
const ME='yue'; // 小游戏里“你”的身体
const R=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// ---------------- DOM ----------------
const css=document.createElement('style');css.textContent=`
#mg{position:fixed;inset:0;z-index:70;display:none;background:#000;touch-action:none;user-select:none;-webkit-user-select:none;font-family:"Microsoft YaHei","PingFang SC",sans-serif}
#mg canvas{display:block;width:100%;height:100%}
#mgtop{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:8px 12px;color:#fff;text-shadow:0 0 4px #000,0 0 2px #000;pointer-events:none;font-size:15px}
#mgtop b{color:#ffd9a0;font-size:17px}
#mgmsg{position:absolute;left:0;right:0;top:22%;text-align:center;color:#fff;font-size:34px;font-weight:bold;text-shadow:0 0 10px #000,0 0 3px #000;pointer-events:none;letter-spacing:4px}
#mgpanel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(18,14,30,.9);color:#f3ecff;padding:18px 24px;border-radius:14px;max-width:min(520px,88vw);font-size:15px;line-height:1.75;box-shadow:0 0 30px rgba(255,190,120,.3)}
#mgpanel h2{margin:0 0 6px;color:#ffd28a;font-size:22px}
#mgpanel .bt{display:inline-block;margin:10px 10px 0 0;padding:8px 20px;border-radius:20px;background:#e8a35a;color:#211;cursor:pointer;font-weight:bold}
#mgpanel .bt.g{background:#5a5470;color:#eee}
#mgquit{position:absolute;left:50%;transform:translateX(-50%);top:8px;padding:5px 12px;border-radius:14px;background:rgba(0,0,0,.5);color:#ddd;font-size:13px;cursor:pointer;border:1px solid #777}
#mgbtns .mb{position:absolute;width:74px;height:74px;min-height:74px;min-width:74px;border-radius:50%;background:rgba(20,14,40,.55);border:2px solid rgba(255,220,170,.7);color:#ffe9c4;font-size:16px;display:flex;align-items:center;justify-content:center;font-weight:bold;touch-action:none;-webkit-user-select:none;user-select:none}
#mgbtns .mb.dn{background:rgba(255,190,120,.6)}
#mgjoy{position:absolute;left:24px;bottom:24px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.4);display:none}
#mgknob{position:absolute;left:40px;top:40px;width:50px;height:50px;border-radius:50%;background:rgba(255,220,170,.6)}
#mgbar{position:absolute;left:50%;bottom:120px;width:min(360px,70vw);height:22px;transform:translateX(-50%);background:rgba(0,0,0,.5);border:2px solid #fff;border-radius:11px;display:none;overflow:hidden}
#mgbar i{position:absolute;top:0;bottom:0;width:6px;background:#fff;margin-left:-3px}
#mgbar s{position:absolute;top:0;bottom:0;background:rgba(120,230,120,.7)}
#mgblind{position:absolute;inset:0;pointer-events:none;display:none;background:radial-gradient(ellipse at 50% 55%,rgba(20,12,4,.15) 0,rgba(10,6,2,.72) 42%,rgba(0,0,0,.92) 78%)}
#mgarrow{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none;display:none}
#mgarrow div{position:absolute;left:-30px;top:-170px;width:60px;text-align:center;color:#ffd28a;font-size:30px;text-shadow:0 0 8px #000}
#mgprompt{position:fixed;left:50%;bottom:21%;transform:translateX(-50%);z-index:36;background:rgba(18,12,30,.78);color:#ffe9c4;padding:9px 18px;border-radius:22px;font-size:16px;border:2px solid rgba(255,210,150,.7);display:none;cursor:pointer;white-space:nowrap;font-family:"Microsoft YaHei","PingFang SC",sans-serif}
`;document.head.appendChild(css);
const root=document.createElement('div');root.id='mg';root.innerHTML='<div id="mgtop"><div id="mgl"></div><div id="mgr" style="text-align:right"></div></div><div id="mgmsg"></div><div id="mgblind"></div><div id="mgarrow"><div>▲</div></div><div id="mgbar"><s></s><i></i></div><div id="mgjoy"><div id="mgknob"></div></div><div id="mgbtns"></div><div id="mgquit">退出 ✕</div><div id="mgpanel"></div>';
document.body.appendChild(root);
const $=id=>document.getElementById(id);
const prompt=document.createElement('div');prompt.id='mgprompt';document.body.appendChild(prompt);

// ---------------- 渲染器 ----------------
let renderer,scene,camera,clock=new THREE.Clock();
const MG={active:false,game:null,state:'off',k:{},joy:{x:0,y:0,m:0},score:0,t:0,errors:[]};
window.__MG=MG;
function ensureRenderer(lowq){if(renderer)return;
 renderer=new THREE.WebGLRenderer({antialias:!lowq,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,lowq?1:1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 renderer.shadowMap.enabled=!lowq;renderer.shadowMap.type=THREE.PCFSoftShadowMap;root.prepend(renderer.domElement);
 camera=new THREE.PerspectiveCamera(55,1,0.05,300);
 addEventListener('resize',resize);}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}

// ---------------- 程序化贴图 ----------------
function ctex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
 if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;}
function noise(g,w,h,base,amp,n){g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=Math.random();g.fillStyle=`rgba(${v>0.5?255:0},${v>0.5?255:0},${v>0.5?255:0},${Math.random()*amp})`;const s=Math.random()*3+0.5;g.fillRect(Math.random()*w,Math.random()*h,s,s);}}
const TEX={};
function tex(name){if(TEX[name])return TEX[name];let t;
 if(name==='concrete')t=ctex(512,512,(g,w,h)=>{noise(g,w,h,'#a49d92',0.18,26000);g.strokeStyle='rgba(60,50,40,.25)';for(let i=0;i<6;i++){g.beginPath();let x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);for(let k=0;k<8;k++){x+=R(-30,30);y+=R(-30,30);g.lineTo(x,y);}g.stroke();}},[8,8]);
 if(name==='dirt')t=ctex(512,512,(g,w,h)=>{noise(g,w,h,'#8a7258',0.22,30000);for(let i=0;i<300;i++){g.fillStyle=`rgba(${R(90,150)|0},${R(80,120)|0},${R(60,90)|0},.6)`;g.beginPath();g.arc(Math.random()*w,Math.random()*h,R(1,4),0,7);g.fill();}},[10,10]);
 if(name==='brick')t=ctex(512,256,(g,w,h)=>{g.fillStyle='#d8d2c4';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=-(y/16%2)*24;x<w;x+=48){g.fillStyle=`rgb(${R(150,185)|0},${R(70,95)|0},${R(55,70)|0})`;g.fillRect(x+2,y+2,44,12);}noise(g,0,0,'#000',0,0);},[6,2]);
 if(name==='whitewall')t=ctex(512,512,(g,w,h)=>{noise(g,w,h,'#e6e0d2',0.12,15000);const gr=g.createLinearGradient(0,h*0.7,0,h);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(90,110,80,.45)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#4d6b56';g.fillRect(0,h*0.86,w,h*0.14);});
 if(name==='wood')t=ctex(512,512,(g,w,h)=>{g.fillStyle='#a0703f';g.fillRect(0,0,w,h);for(let i=0;i<120;i++){g.strokeStyle=`rgba(${R(60,110)|0},${R(35,60)|0},20,.35)`;g.lineWidth=R(1,3);g.beginPath();const y=Math.random()*h;g.moveTo(0,y);for(let x=0;x<=w;x+=32)g.lineTo(x,y+Math.sin(x/60+i)*4);g.stroke();}});
 if(name==='board')t=ctex(1024,1024,(g,w,h)=>{g.fillStyle='#d9b06c';g.fillRect(0,0,w,h);for(let i=0;i<90;i++){g.strokeStyle=`rgba(140,90,40,.18)`;g.lineWidth=R(1,4);g.beginPath();const y=Math.random()*h;g.moveTo(0,y);g.bezierCurveTo(w/3,y+R(-20,20),w*2/3,y+R(-20,20),w,y);g.stroke();}
   g.strokeStyle='#2a1a0a';g.lineWidth=3;const m=w/16;for(let i=0;i<15;i++){g.beginPath();g.moveTo(m+i*m,m);g.lineTo(m+i*m,m*15);g.stroke();g.beginPath();g.moveTo(m,m+i*m);g.lineTo(m*15,m+i*m);g.stroke();}
   g.fillStyle='#2a1a0a';for(const [a,b] of [[3,3],[11,3],[7,7],[3,11],[11,11]]){g.beginPath();g.arc(m+a*m,m+b*m,7,0,7);g.fill();}});
 if(name==='paperR')t=ctex(256,256,(g,w,h)=>paper(g,w,h,'#c8463c','#e9d9b0'));
 if(name==='paperB')t=ctex(256,256,(g,w,h)=>paper(g,w,h,'#3f66a8','#efe6cf'));
 if(name==='track')t=ctex(512,512,(g,w,h)=>{noise(g,w,h,'#9e5a43',0.2,25000);g.fillStyle='rgba(255,255,255,.85)';g.fillRect(w*0.02,0,8,h);g.fillRect(w*0.5-4,0,8,h);g.fillRect(w*0.98-8,0,8,h);},[1,12]);
 if(name==='cloth')t=ctex(128,128,(g,w,h)=>{g.fillStyle='#b8322e';g.fillRect(0,0,w,h);g.fillStyle='#e9c46a';for(let y=0;y<h;y+=16)for(let x=(y/16%2)*8;x<w;x+=16){g.beginPath();g.arc(x,y,3,0,7);g.fill();}noise(g,0,0,'#000',0,0);});
 TEX[name]=t;return t;}
function paper(g,w,h,a,b){g.fillStyle=a;g.fillRect(0,0,w,h);g.fillStyle=b;g.beginPath();g.moveTo(w/2,0);g.lineTo(w,h/2);g.lineTo(w/2,h);g.lineTo(0,h/2);g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.lineTo(w,h);g.moveTo(w,0);g.lineTo(0,h);g.stroke();g.fillStyle='rgba(30,20,10,.75)';g.font='bold 40px serif';g.textAlign='center';g.fillText('福',w/2,h/2+14);}
const std=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:0.85,metalness:0},o));

// ---------------- 场景环境 ----------------
function skyTex(top,bot){return ctex(4,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,top);gr.addColorStop(1,bot);g.fillStyle=gr;g.fillRect(0,0,w,h);});}
function tree(x,z,s=1){const g=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.12*s,0.18*s,2.4*s,8),std({color:0x5b4330,roughness:1}));tr.position.y=1.2*s;g.add(tr);
 const lm=std({color:0x3f6a35,roughness:0.95});for(let i=0;i<5;i++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(R(0.8,1.2)*s,1),lm);b.position.set(R(-0.6,0.6)*s,R(2.4,3.4)*s,R(-0.6,0.6)*s);g.add(b);}
 g.position.set(x,0,z);g.traverse(o=>{if(o.isMesh){o.castShadow=true;}});return g;}
function building(w,h,d,texn,roof){const g=new THREE.Group();const wt=tex(texn).clone();wt.needsUpdate=true;wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(w/4,h/3);
 const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),std({map:wt}));b.position.y=h/2;b.castShadow=b.receiveShadow=true;g.add(b);
 const wm=std({color:0x2b3540,roughness:0.3,metalness:0.2});const fm=std({color:0x6e8a7a});
 for(let y=1.4;y<h-0.6;y+=2.8)for(let x=-w/2+1.2;x<w/2-0.8;x+=2.2){const f=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.45,0.08),fm);f.position.set(x,y,d/2+0.02);g.add(f);const wi=new THREE.Mesh(new THREE.BoxGeometry(1.05,1.25,0.06),wm);wi.position.set(x,y,d/2+0.06);g.add(wi);}
 if(roof){const r=new THREE.Mesh(new THREE.BoxGeometry(w+0.6,0.25,d+0.9),std({color:0x5a3c32}));r.position.y=h+0.1;g.add(r);}return g;}
function buildEnv(kind){scene=new THREE.Scene();
 const school=kind==='school';
 scene.background=skyTex(school?'#7fa6d8':'#b9b3a6',school?'#e8eef2':'#efdcc0');scene.fog=new THREE.Fog(school?0xdfe6ec:0xe6d6bd,25,90);
 scene.add(new THREE.HemisphereLight(school?0xdfe9ff:0xfff0dc,0x6b5a48,0.7));
 const sun=new THREE.DirectionalLight(school?0xfff6e8:0xffe1b8,2.6);sun.position.set(8,14,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:50});sun.shadow.bias=-0.0005;sun.shadow.normalBias=0.03;scene.add(sun);scene.add(sun.target);
 const gt=tex(school?'concrete':'dirt');const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),std({map:gt,roughness:0.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 if(school){const b=building(30,9,8,'whitewall',true);b.position.set(0,0,-22);scene.add(b);
  const b2=building(14,6,7,'brick',true);b2.position.set(-20,0,-10);b2.rotation.y=Math.PI/2;scene.add(b2);
  // 红旗杆 + 标语
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,9,8),std({color:0xc0c4c8,metalness:0.8,roughness:0.3}));pole.position.set(9,4.5,-14);scene.add(pole);
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.2),std({color:0xd8261c,side:THREE.DoubleSide}));flag.position.set(9.95,8.2,-14);scene.add(flag);
  const sl=new THREE.Mesh(new THREE.PlaneGeometry(14,1.1),std({map:ctex(1024,80,(g,w,h)=>{g.fillStyle='#b8231c';g.fillRect(0,0,w,h);g.fillStyle='#fff3d0';g.font='bold 56px "Microsoft YaHei",sans-serif';g.textAlign='center';g.fillText('好好学习  天天向上',w/2,60);})}));sl.position.set(0,7.6,-17.9);scene.add(sl);
  for(const [x,z] of [[-12,-6],[13,-4],[-10,12],[12,10],[0,16]])scene.add(tree(x,z,1.1));}
 else{for(const [x,z,ry,w] of [[-14,-14,0.3,12],[12,-16,-0.2,14],[-18,6,1.4,10],[17,4,-1.5,10]]){const b=building(w,6,6,Math.random()<0.5?'brick':'whitewall',true);b.position.set(x,0,z);b.rotation.y=ry;scene.add(b);}
  for(const [x,z] of [[-7,-9],[8,-8],[-9,8],[9,9]])scene.add(tree(x,z,1.25));
  // 远处矿山
  const hm=std({color:0x6f6a55,roughness:1});for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(R(10,18),R(8,16),7),hm);m.position.set(-60+i*20,0,-70+R(-6,6));scene.add(m);}}
 MG.sun=sun;return scene;}

// ---------------- 角色 ----------------
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
async function char(key,h=1.6){const g=await loader.loadAsync(NPCF[key]);const m=g.scene;m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;const ms=Array.isArray(o.material)?o.material:[o.material];for(const mt of ms){if(mt&&/hair/i.test(mt.name)){mt.alphaTest=Math.max(mt.alphaTest||0,0.35);mt.transparent=false;}if(mt)mt.envMapIntensity=0.8;}}});
 const mixer=new THREE.AnimationMixer(m);const act={};for(const c of g.animations){if(/Idle_Loop|Walk_Loop/.test(c.name)){act[c.name]=mixer.clipAction(c);act[c.name].play();}}
 if(act.Walk_Loop)act.Walk_Loop.setEffectiveWeight(0);mixer.update(0);m.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(m,true);m.scale.multiplyScalar(h/(bb.max.y-bb.min.y));m.updateMatrixWorld(true);const b2=new THREE.Box3().setFromObject(m,true);m.position.y=-b2.min.y;
 const r=new THREE.Group();r.add(m);
 const blob=new THREE.Mesh(new THREE.CircleGeometry(0.35,20).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:0.25,depthWrite:false}));blob.position.y=0.01;r.add(blob);
 const C={root:r,mixer,act,name:NAME[key],w:0,
  walk(w,ts=1){this.w+=(w-this.w)*0.2;if(act.Walk_Loop){act.Walk_Loop.setEffectiveWeight(this.w);act.Walk_Loop.timeScale=ts;}if(act.Idle_Loop)act.Idle_Loop.setEffectiveWeight(1-this.w);},
  update(dt){mixer.update(dt);}};
 if(act.Idle_Loop)act.Idle_Loop.time=Math.random()*2;scene.add(r);MG.chars.push(C);return C;}
function face(c,x,z){c.root.rotation.y=Math.atan2(x-c.root.position.x,z-c.root.position.z);}

// ---------------- 声音（WebAudio 合成，0 素材）----------------
let AC=null;function snd(type,pan=0){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime;const g=AC.createGain();const p=AC.createStereoPanner?AC.createStereoPanner():null;
 if(p){p.pan.value=clamp(pan,-1,1);g.connect(p);p.connect(AC.destination);}else g.connect(AC.destination);
 if(type==='clap'||type==='pop'||type==='slap'){const b=AC.createBuffer(1,AC.sampleRate*0.15,AC.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(type==='pop'?400:900));const s=AC.createBufferSource();s.buffer=b;s.connect(g);g.gain.value=type==='pop'?0.9:0.6;s.start(t);return;}
 const o=AC.createOscillator();o.type='triangle';o.frequency.value={ok:880,bad:180,win:660,tick:520}[type]||440;o.connect(g);g.gain.setValueAtTime(0.25,t);g.gain.exponentialRampToValueAtTime(0.001,t+(type==='win'?0.6:0.18));o.start(t);o.stop(t+0.6);}catch(e){}}

// ---------------- 输入 ----------------
const KM={KeyA:'L',ArrowLeft:'L',KeyD:'R',ArrowRight:'R',KeyW:'U',ArrowUp:'U',KeyS:'D',ArrowDown:'D',Space:'A',Enter:'A',KeyJ:'A',KeyE:'B',KeyK:'B',ShiftLeft:'S',ShiftRight:'S'};
addEventListener('keydown',e=>{if(!MG.active)return;e.stopImmediatePropagation();e.preventDefault();
 if(e.code==='Escape'){quit();return;}
 if(MG.state!=='play'){if(e.code==='Space'||e.code==='Enter'){if(MG.state==='intro')start();else if(MG.state==='end')start();}return;}
 const k=KM[e.code];if(k){if(!MG.k[k])MG.press(k);MG.k[k]=true;}},true);
addEventListener('keyup',e=>{if(!MG.active)return;e.stopImmediatePropagation();const k=KM[e.code];if(k)MG.k[k]=false;},true);
MG.press=k=>{if(MG.state==='play'&&MG.game.press)MG.game.press(k);};
const btns=$('mgbtns');
function setButtons(list){btns.innerHTML='';if(!MG.touch)return;list.forEach(([k,lab,pos])=>{const b=document.createElement('div');b.className='mb';b.textContent=lab;b.style.cssText=pos;b.dataset.k=k;btns.appendChild(b);
 const dn=e=>{e.preventDefault();e.stopPropagation();b.classList.add('dn');if(!MG.k[k])MG.press(k);MG.k[k]=true;};const up=e=>{e.preventDefault();e.stopPropagation();b.classList.remove('dn');MG.k[k]=false;};
 b.addEventListener('touchstart',dn,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});
 b.addEventListener('mousedown',dn);b.addEventListener('mouseup',up);b.addEventListener('mouseleave',up);});}
// 摇杆
{const joy=$('mgjoy'),kn=$('mgknob');let id=null,cx=0,cy=0;
 const setK=()=>{kn.style.left=(40+MG.joy.x*42)+'px';kn.style.top=(40+MG.joy.y*42)+'px';};
 root.addEventListener('touchstart',e=>{if(joy.style.display==='none')return;for(const t of e.changedTouches){if(t.clientX<innerWidth*0.45&&id===null&&!t.target.closest('#mgpanel,#mgquit,.mb')){id=t.identifier;const r=joy.getBoundingClientRect();cx=r.left+65;cy=r.top+65;}}},{passive:true});
 root.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===id){let dx=(t.clientX-cx)/55,dy=(t.clientY-cy)/55;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}MG.joy.x=dx;MG.joy.y=dy;MG.joy.m=Math.min(1,m);setK();}},{passive:true});
 const end=e=>{for(const t of e.changedTouches)if(t.identifier===id){id=null;MG.joy.x=MG.joy.y=MG.joy.m=0;setK();}};root.addEventListener('touchend',end);root.addEventListener('touchcancel',end);}
const MG_TOUCH_DEAD=0.18;
function axis(){let x=(MG.k.R?1:0)-(MG.k.L?1:0),y=(MG.k.D?1:0)-(MG.k.U?1:0);if(MG.joy.m>MG_TOUCH_DEAD){const t=(MG.joy.m-MG_TOUCH_DEAD)/(1-MG_TOUCH_DEAD);const u=Math.max(0,Math.min(1,t));const s=u*u*(3-2*u);x+=MG.joy.x*s;y+=MG.joy.y*s;}const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}return {x,y,m:Math.min(1,m)};}
// 点击/轻触射线（下棋用）
const _ray=new THREE.Raycaster(),_ndc=new THREE.Vector2();
root.addEventListener('pointerdown',e=>{if(!MG.active||MG.state!=='play'||!MG.game.tap)return;if(e.target!==renderer.domElement)return;_ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);_ray.setFromCamera(_ndc,camera);MG.game.tap(_ray);});


// ---- v8.15 minigame sfx/copy ----
export let MG_SFX_COPY=null;
export function setMgSfxCopy(j){MG_SFX_COPY=j||null; if(typeof window!=='undefined') window.__mgSfxCopy=MG_SFX_COPY; return !!(MG_SFX_COPY&&MG_SFX_COPY.games);}
function mgCopy(id, kind, fallback){
  try{
    const g=MG_SFX_COPY&&MG_SFX_COPY.games&&MG_SFX_COPY.games[id];
    const arr=g&&g[kind];
    if(arr&&arr.length) return arr[(Math.random()*arr.length)|0];
  }catch(_){}
  return fallback;
}
// ---------------- 通用流程 ----------------
const msg=(t,dur=1.2)=>{const m=$('mgmsg');m.textContent=t;clearTimeout(msg.h);if(dur>0)msg.h=setTimeout(()=>m.textContent='',dur*1000);};
function hud(l,r){$('mgl').innerHTML=l;$('mgr').innerHTML=r;}
function panel(html){const p=$('mgpanel');if(!html){p.style.display='none';return;}p.innerHTML=html;p.style.display='block';
 p.querySelectorAll('[data-a]').forEach(b=>b.onclick=(e)=>{e.stopPropagation();({start,quit})[b.dataset.a]();});}
function introHTML(G){return `<h2>${G.icon} ${G.name}</h2><div style="color:#cfc6e8;font-size:13px">${G.where}</div><div>${G.rule}</div>
 <div style="margin-top:6px"><b style="color:#ffd9a0">电脑：</b>${G.pc}</div><div><b style="color:#ffd9a0">手机：</b>${G.mobile}</div>
 <span class="bt" data-a="start">开始（空格）</span><span class="bt g" data-a="quit">返回场景（Esc）</span>`;}
MG.finish=(win,text)=>{if(MG.state!=='play')return;MG.state='end';snd(win?'win':'bad');MG.k={};
 const _cid=MG.game&&MG.game.id; const _ct=mgCopy(_cid,win?'win':'fail',text||'');
 const best=Math.max(MG.score,+(localStorage.getItem('mg_best_'+MG.game.id)||0));try{localStorage.setItem('mg_best_'+MG.game.id,best);}catch(e){}
 panel(`<h2>${win?'🎉 赢了！':'游戏结束'}</h2><div>${_ct||text||''}</div><div style="font-size:20px;margin-top:6px">得分 <b style="color:#ffd28a">${MG.score}</b> · 最高 ${best}</div>
 <span class="bt" data-a="start">再玩一次</span><span class="bt g" data-a="quit">回到场景</span>`);
 window.__mgEnd={id:MG.game.id,win,score:MG.score};};
let loadTok=0;
async function build(G){const tok=++loadTok;MG.chars=[];buildEnv(G.env);MG.ready=false;panel('<h2>'+G.icon+' '+G.name+'</h2>正在布置场地…');
 try{await G.setup();}catch(e){console.error(e);MG.errors.push(String(e));}
 if(tok!==loadTok)return false;MG.ready=true;return true;}
async function start(){const G=MG.game;if(MG.state==='loading'||!MG.ready)return;
 MG.score=0;MG.t=0;MG.k={};$('mgmsg').textContent='';panel(null);G.start();MG.state='play';window.__mgEnd=null;}
async function enter(id,opts={}){const G=GAMES.find(g=>g.id===id);if(!G)return;MG.touch=!!opts.touch;ensureRenderer(!!opts.lowq);resize();
 MG.active=true;MG.game=G;MG.state='intro';root.style.display='block';$('mgblind').style.display='none';$('mgarrow').style.display='none';$('mgbar').style.display='none';
 $('mgjoy').style.display=(MG.touch&&G.joy)?'block':'none';setButtons(G.buttons||[]);hud('<b>'+G.icon+' '+G.name+'</b>','');document.exitPointerLock?.();
 MG.dirty=false;const ok=await build(G);if(!ok)return;MG.state='intro';panel(introHTML(G));G.preview&&G.preview();loop();}
function quit(){MG.active=false;MG.state='off';loadTok++;root.style.display='none';cancelAnimationFrame(MG.raf);if(scene){scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});}scene=null;MG.chars=[];if(MG.onExit)MG.onExit();}
$('mgquit').onclick=e=>{e.stopPropagation();quit();};
function loop(){cancelAnimationFrame(MG.raf);const f=()=>{if(!MG.active)return;MG.raf=requestAnimationFrame(f);let dt=Math.min(0.05,clock.getDelta());MG.tick(dt);};clock.getDelta();MG.raf=requestAnimationFrame(f);}
MG.tick=(dt)=>{if(!scene)return;try{if(MG.state==='play'){MG.t+=dt;MG.game.update(dt);}else if(MG.game.idle)MG.game.idle(dt);for(const c of MG.chars)c.update(dt);}catch(e){console.error(e);MG.errors.push(String(e));}
 renderer.render(scene,camera);};
MG.step=(sec,dt=1/30)=>{for(let t=0;t<sec;t+=dt)MG.tick(dt);};

// ================= 小游戏 =================
const GAMES=[];
// ---------- 1. 一二三木头人 ----------
GAMES.push((()=>{let me,it,others=[],st,z,lives,phase,pt,chant,caughtT;const GOAL=-16;
 return {id:'mutouren',name:'一二三木头人',icon:'🧍',scene:'B',env:'school',where:'小学校园 · 操场',
 rule:'晓雨背对大家喊“一、二、三、木头人！”。她背过身时往前冲，她一回头就立刻定住，被看到在动就回起点。3 条命，90 秒内摸到她算赢，越快分越高。',
 pc:'按住 <b>W / ↑</b> 前进，按住 <b>Shift</b> 跑；松手=定住。',mobile:'按住右下 <b>走</b>（或 <b>跑</b>）按钮，松开=定住。',
 buttons:[['U','走','right:24px;bottom:24px'],['S','跑','right:110px;bottom:24px']],
 async setup(){[me,it]=await Promise.all([char(ME),char('xy')]);others=[await char('lena')];it.root.position.set(0,0,GOAL-1.2);
  const tr=tree(0,GOAL-3,1.2);scene.add(tr);const line=new THREE.Mesh(new THREE.PlaneGeometry(8,0.12),std({color:0xf4f1e8}));line.rotation.x=-Math.PI/2;line.position.set(0,0.01,0.6);scene.add(line);
  const l2=line.clone();l2.position.z=GOAL;scene.add(l2);this.reset();},
 reset(){z=0;me.root.position.set(-0.8,0,0);me.root.rotation.y=Math.PI;others[0].root.position.set(1.2,0,0);others[0].root.rotation.y=Math.PI;others[0].z=0;it.root.rotation.y=Math.PI;},
 preview(){this.cam();},
 cam(){camera.position.set(me.root.position.x+1.6,2.4,me.root.position.z+4.2);camera.lookAt(me.root.position.x*0.5,1.1,me.root.position.z-6);},
 start(){this.reset();lives=3;phase='back';pt=R(2.2,4);chant=0;caughtT=0;msg(mgCopy('mutouren','start','一、二、三……'),1.5);},
 idle(dt){this.cam();},
 update(dt){const mv=MG.k.U||axis().y<-0.3;const run=MG.k.S;const sp=(MG.k.S?3.2:(mv?1.6:0));
  if(caughtT>0){caughtT-=dt;me.walk(0);if(caughtT<=0)this.reset();this.cam();return;}
  z-=sp*dt;me.root.position.z=z;me.walk(sp>0?1:0,sp>2?1.8:1);
  // 伙伴 Lena（AI）
  const o=others[0];const oMove=phase==='back'&&pt>0.35;if(oMove)o.z-=1.4*dt;o.root.position.z=o.z;o.walk(oMove?1:0);if(o.z<GOAL+0.5)o.z=0;
  pt-=dt;
  if(phase==='back'){it.root.rotation.y+=(Math.PI-it.root.rotation.y)*0.25;const c=Math.floor((1-pt/3.5)*4);if(c>chant&&c<4){chant=c;msg(['一、','一、二、','一、二、三、'][c-1]||'',1);snd('tick');}
   if(pt<=0){phase='turn';pt=0.35;msg('木头人！',1.2);snd('ok');}}
  else if(phase==='turn'){it.root.rotation.y+=(0-it.root.rotation.y)*0.3;if(pt<=0){phase='look';pt=R(1.2,2.4);}}
  else if(phase==='look'){it.root.rotation.y+=(0-it.root.rotation.y)*0.3;if(sp>0){lives--;snd('bad');msg(lives>0?'被看到了！回起点':'出局',1.4);caughtT=1.3;if(lives<=0){MG.score=0;MG.finish(false,'被晓雨看到 3 次。');}}
   if(pt<=0){phase='back';pt=R(1.8,4.2);chant=0;}}
  if(MG.t>=90&&MG.state==='play'){MG.score=0;MG.finish(false,'90 秒内没摸到晓雨。');return;}
  if(z<GOAL+0.2){MG.score=Math.max(100,Math.round(1500-MG.t*30))+lives*200;MG.finish(true,'用时 '+MG.t.toFixed(1)+' 秒摸到晓雨，剩 '+lives+' 条命。');}
  hud('<b>🧍 一二三木头人</b><br>'+(phase==='back'?'她背着身——快走！':'<span style="color:#ff8a7a">她在看！别动！</span>'),'❤'.repeat(Math.max(0,lives))+'<br>距离 '+Math.max(0,(z-GOAL)).toFixed(1)+' m · '+MG.t.toFixed(1)+' s');
  this.cam();}};})());

// ---------- 2. 滚铁环 ----------
GAMES.push((()=>{let me,hoop,hook,road,stones=[],marbles=[],x,dist,speed,lives,lean,hitT;
 return {id:'gunlhuan',name:'滚铁环',icon:'⭕',scene:'A',env:'town',where:'矿区小镇 · 土路',
 rule:'推着铁环沿土路一直跑。躲开路上的石头，碰到铁环就倒（3 次结束）；顺路捡玻璃弹珠加分。越跑越快，60 秒后结算。',
 pc:'<b>A/D 或 ←/→</b> 左右拐，<b>W</b> 加速、<b>S</b> 减速。',mobile:'按 <b>◀ ▶</b> 左右拐，<b>快</b> 加速。',
 buttons:[['L','◀','left:24px;bottom:24px'],['R','▶','left:110px;bottom:24px'],['U','快','right:24px;bottom:24px'],['D','慢','right:110px;bottom:24px']],
 async setup(){stones=[];marbles=[];me=await char(ME);const steel=std({color:0x8a8f96,metalness:0.9,roughness:0.35});
  hoop=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.012,8,48),steel);hoop.castShadow=true;scene.add(hoop);
  hook=new THREE.Group();const rod=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.9,6),steel);rod.rotation.x=Math.PI/2.6;rod.position.set(0,0.62,0.32);hook.add(rod);
  const u=new THREE.Mesh(new THREE.TorusGeometry(0.04,0.006,6,12,Math.PI),steel);u.position.set(0,0.35,0.02);u.rotation.y=Math.PI/2;hook.add(u);scene.add(hook);
  road=new THREE.Mesh(new THREE.PlaneGeometry(5,400),std({map:(()=>{const t=tex('dirt').clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,160);return t;})(),color:0xb89a78}));road.rotation.x=-Math.PI/2;road.position.y=0.005;road.receiveShadow=true;scene.add(road);
  const sm=std({color:0x77736a,roughness:1});for(let i=0;i<14;i++){const s=new THREE.Mesh(new THREE.DodecahedronGeometry(R(0.14,0.22),0),sm);s.castShadow=true;s.scale.y=0.6;scene.add(s);stones.push(s);}
  const mm=[0x3fa7d6,0xe94f37,0x7bc950,0xf6c344].map(c=>new THREE.MeshPhysicalMaterial({color:c,roughness:0.05,transmission:0.6,thickness:0.05,clearcoat:1}));
  for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(0.07,16,12),mm[i%4]);scene.add(m);marbles.push(m);}
  for(let i=0;i<16;i++){const t=tree(i%2?-6:6,-i*14,R(0.9,1.3));scene.add(t);}
  this.layout();},
 layout(){stones.forEach((s,i)=>{s.position.set(R(-1.8,1.8),0.06,-14-i*9-R(0,4));s.visible=true;});marbles.forEach((m,i)=>{m.position.set(R(-1.8,1.8),0.07,-10-i*12-R(0,4));m.visible=true;});},
 preview(){x=0;dist=0;this.pose(0);},
 pose(dt){me.root.position.set(x,0,-dist);me.root.rotation.y=Math.PI;hoop.position.set(x+0.05,0.33,-dist-0.75);hoop.rotation.set(0,Math.PI/2+(lean||0)*0.3,(lean||0)*0.25);
  hoop.rotateOnAxis(new THREE.Vector3(0,0,1),0);hoop.userData.spin=(hoop.userData.spin||0)+(speed||0)*dt/0.32;hoop.rotateZ(hoop.userData.spin);
  hook.position.set(x+0.18,0,-dist-0.3);road.position.z=-dist+150-(dist%2);
  camera.position.set(x*0.6+1.2,2.3,-dist+3.6);camera.lookAt(x*0.6,0.6,-dist-4);MG.sun.position.set(x+8,14,-dist+6);MG.sun.target.position.set(x,0,-dist);},
 idle(dt){this.pose(dt);},
 start(){MG.bonus=0;x=0;dist=0;speed=3;lives=3;lean=0;hitT=0;this.layout();msg(mgCopy('gunlhuan','start','推起来！'),1);},
 update(dt){const a=axis();x=clamp(x+a.x*3.2*dt,-2.1,2.1);lean+=(a.x-lean)*Math.min(1,dt*5);
  const base=3+MG.t*0.07;speed+=((MG.k.U?base*1.45:MG.k.D?base*0.6:base)-speed)*Math.min(1,dt*2);
  if(hitT>0){hitT-=dt;speed=0.5;hoop.position.y=0.05;}
  dist+=speed*dt;me.walk(1,speed/2.2);
  for(const s of stones){if(s.position.z>-dist+4){s.position.z-=9*14;s.position.x=R(-1.8,1.8);s.visible=true;}
   if(s.visible&&hitT<=0&&Math.abs(s.position.z-(-dist-0.75))<0.3&&Math.abs(s.position.x-x)<0.35){lives--;hitT=1;snd('bad');s.visible=false;msg(lives>0?'铁环倒了！':'铁环摔坏了',1.2);if(lives<=0){MG.score=Math.round(dist)+MG.bonus;MG.finish(false,'跑了 '+dist.toFixed(0)+' 米。');return;}}}
  for(const m of marbles){if(m.position.z>-dist+4){m.position.z-=10*12;m.position.x=R(-1.8,1.8);m.visible=true;}
   if(m.visible&&Math.abs(m.position.z-(-dist))<0.6&&Math.abs(m.position.x-x)<0.5){m.visible=false;MG.bonus+=20;snd('ok');}}
  if(MG.t<dt*1.5)MG.bonus=0;
  this.pose(dt);if(hitT>0)hoop.position.y=0.05,hoop.rotation.set(Math.PI/2,0,0);
  MG.score=Math.round(dist)+MG.bonus;
  if(MG.t>=60){MG.finish(true,'60 秒跑了 '+dist.toFixed(0)+' 米，弹珠加分 '+MG.bonus+'。');}
  hud('<b>⭕ 滚铁环</b><br>速度 '+speed.toFixed(1)+' m/s','❤'.repeat(Math.max(0,lives))+'<br>'+dist.toFixed(0)+' m · 剩 '+Math.max(0,60-MG.t).toFixed(0)+' s · 分 '+MG.score);}};})());

// ---------- 3. 跳大绳 ----------
GAMES.push((()=>{let me,a,b,rope,th,omega,jumps,miss,y,vy,passed;const HX=2.3,HY=0.95,RR=1.05;
 const geo=()=>{const pts=[];for(let i=0;i<=24;i++){const s=i/24;const r=RR*Math.sin(Math.PI*s);pts.push(new THREE.Vector3(-HX+2*HX*s,Math.max(0.02,HY+Math.cos(th)*r),Math.sin(th)*r));}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,0.012,6,false);};
 return {id:'tiaosheng',name:'跳大绳',icon:'🪢',scene:'B',env:'school',where:'小学校园 · 操场',
 rule:'小雯和 Lena 甩大绳，绳子快打到脚时起跳。每跳过一圈 +1，越甩越快；绊到 3 次结束。',
 pc:'<b>空格</b> 跳。',mobile:'点右下 <b>跳</b>。',buttons:[['A','跳','right:28px;bottom:28px']],
 async setup(){[me,a,b]=await Promise.all([char(ME),char('xw'),char('lena')]);a.root.position.set(-HX-0.35,0,0);a.root.rotation.y=Math.PI/2;b.root.position.set(HX+0.35,0,0);b.root.rotation.y=-Math.PI/2;
  me.root.position.set(0,0,0);me.root.rotation.y=0;th=0;rope=new THREE.Mesh(geo(),std({color:0xd9c9a3,roughness:0.9}));rope.castShadow=true;scene.add(rope);
  const hm=std({color:0x8a1e1e});for(const s of [-1,1]){const h=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.14,8),hm);h.position.set(s*HX,HY,0);scene.add(h);}
  camera.position.set(0.6,1.6,4.6);camera.lookAt(0,0.8,0);},
 setRope(){rope.geometry.dispose();rope.geometry=geo();},
 idle(dt){th+=dt*3;this.setRope();},
 start(){th=Math.PI*0.2;omega=2.55;jumps=0;miss=0;y=0;vy=0;passed=false;msg('准备…跳！',1);},
 press(k){if(k==='A'&&y<=0.001){vy=3.3;}},
 update(dt){th+=omega*dt;if(th>Math.PI*2){th-=Math.PI*2;passed=false;}
  if(y>0||vy>0){vy-=9.8*dt;y+=vy*dt;if(y<0){y=0;vy=0;}}
  me.root.position.y=y;
  // 绳子到最低点（th≈π）判定
  if(!passed&&th>Math.PI-0.22&&th<Math.PI+0.45){passed=true;if(y>0.06){jumps++;snd('ok');MG.score=jumps;if(jumps%6===0){omega*=1.06;msg('加快！',0.8);}}else{miss++;snd('bad');msg(miss<3?'绊到了！':'',1);if(miss>=3){MG.finish(jumps>=6,'连续跳过 '+jumps+' 圈。'+(jumps>=6?'厉害！':'再试试，跳过 6 圈算赢。'));}}}
  this.setRope();const hy=HY+Math.cos(th)*0.12;
  hud('<b>🪢 跳大绳</b><br>绳子到脚下时起跳','已跳 <b>'+jumps+'</b> 圈<br>绊到 '+miss+'/3');}};})());

// ---------- 4. 丢沙包 ----------
GAMES.push((()=>{let me,ta,tb,bag,px,pz,bags,lives,dodge,catches,cd,turn,catchT;
 return {id:'shabao',name:'丢沙包',icon:'🎒',scene:'A',env:'town',where:'矿区小镇 · 晒谷场',
 rule:'晓雨和小晴站两头扔沙包，你在中间躲。被打中掉一条命（3 条）；在沙包飞到面前时按“接”能接住，接住加一条命。坚持 45 秒。',
 pc:'<b>WASD / 方向键</b> 移动，<b>空格</b> 接沙包。',mobile:'左下摇杆移动，右下 <b>接</b>。',joy:true,buttons:[['A','接','right:28px;bottom:28px']],
 async setup(){[me,ta,tb]=await Promise.all([char(ME),char('xy'),char('xq')]);ta.root.position.set(0,0,-7);tb.root.position.set(0,0,7);ta.root.rotation.y=0;tb.root.rotation.y=Math.PI;
  const cm=std({map:tex('cloth'),roughness:1});bag=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.09,0.16,3,2,3),cm);bag.castShadow=true;scene.add(bag);
  const lm=std({color:0xf2efe6});for(const [w,h,x,z] of [[6.2,0.08,0,-3.1],[6.2,0.08,0,3.1],[0.08,6.2,-3.1,0],[0.08,6.2,3.1,0]]){const l=new THREE.Mesh(new THREE.PlaneGeometry(w,h),lm);l.rotation.x=-Math.PI/2;l.position.set(x,0.01,z);scene.add(l);}
  this.cam();},
 cam(){camera.position.set(7.5,5.2,0);camera.lookAt(0,0.6,0);},
 start(){px=0;pz=0;lives=3;dodge=0;catches=0;cd=1.2;turn=0;bags=null;catchT=0;bag.visible=false;msg('开始躲！',1);},
 press(k){if(k==='A')catchT=0.3;},
 update(dt){const a=axis();px=clamp(px+a.y*3.0*dt*1,-2.9,2.9);pz=clamp(pz-a.x*3.0*dt,-2.9,2.9);
  // 摄像机在 +x 侧看向 -x：屏幕上=-x… 统一：上(−y)=远离镜头(−x)，右(+x)=−z
  me.root.position.set(px,0,pz);if(a.m>0.1)me.root.rotation.y=Math.atan2(a.y,-a.x);me.walk(a.m>0.1?1:0,1.3);
  catchT-=dt;const th=turn?tb:ta;
  face(ta,px,pz);face(tb,px,pz);
  if(!bags){cd-=dt;if(cd<=0){const from=th.root.position.clone().setY(1.3);const lead=new THREE.Vector3(px+a.y*0.8*R(0,1),0.9,pz-a.x*0.8*R(0,1));lead.x+=R(-0.6,0.6);
    const T=Math.max(0.55,0.95-MG.t*0.008);bags={p:from,v:new THREE.Vector3((lead.x-from.x)/T,(lead.y-from.y+0.5*9.8*T*T)/T,(lead.z-from.z)/T),t:0,T,hit:false};bag.visible=true;snd('slap');}}
  else{bags.t+=dt;bags.v.y-=9.8*dt;bags.p.addScaledVector(bags.v,dt);bag.position.copy(bags.p);bag.rotation.x+=dt*8;bag.rotation.z+=dt*5;
   const d=Math.hypot(bags.p.x-px,bags.p.z-pz);
   if(!bags.hit&&d<0.75&&bags.p.y<1.7&&bags.p.y>0.2&&catchT>0){catches++;lives=Math.min(5,lives+1);snd('ok');msg('接住了！+1 命',1);bags=null;bag.visible=false;turn^=1;cd=R(0.6,1.2);}
   else if(!bags.hit&&d<0.36&&bags.p.y<1.6&&bags.p.y>0.1){bags.hit=true;lives--;snd('bad');msg(lives>0?'被打中！':'',1);if(lives<=0){MG.score=dodge*10+catches*30;MG.finish(false,'躲过 '+dodge+' 次，接住 '+catches+' 次。');return;}}
   if(bags&&bags.p.y<0.05){if(!bags.hit)dodge++;bags=null;bag.visible=false;turn^=1;cd=R(0.5,1.1)*Math.max(0.5,1-MG.t/80);}}
  MG.score=dodge*10+catches*30+Math.floor(MG.t)*2;
  if(MG.t>=45){MG.finish(true,'坚持了 45 秒！躲过 '+dodge+' 次，接住 '+catches+' 次。');}
  hud('<b>🎒 丢沙包</b><br>躲 '+dodge+' · 接 '+catches,'❤'.repeat(Math.max(0,lives))+'<br>剩 '+Math.max(0,45-MG.t).toFixed(0)+' s · 分 '+MG.score);}};})());

// ---------- 5. 踩鸡蛋（踩气球） ----------
GAMES.push((()=>{let P=[],stomp,ar=5.5;const COLS=[0xf6c344,0xe94f37,0x3fa7d6,0x7bc950];
 function balloon(c){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(0.13,20,14),new THREE.MeshPhysicalMaterial({color:c,roughness:0.25,clearcoat:0.8}));b.scale.y=1.15;b.position.y=0.14;b.castShadow=true;g.add(b);
  const s=new THREE.Mesh(new THREE.CylinderGeometry(0.003,0.003,0.3,4),std({color:0xffffff}));s.position.set(0,0.12,0.1);s.rotation.x=1.1;g.add(s);scene.add(g);return g;}
 return {id:'caijidan',name:'踩鸡蛋',icon:'🎈',scene:'B',env:'school',where:'小学校园 · 篮球场',
 rule:'每人脚踝绑两个“鸡蛋”（气球）。去踩别人的，护好自己的；鸡蛋都破了就出局。踩光三个对手的鸡蛋算赢，限时 60 秒。',
 pc:'<b>WASD</b> 跑，<b>空格</b> 踩。',mobile:'左下摇杆跑，右下 <b>踩</b>。',joy:true,buttons:[['A','踩','right:28px;bottom:28px']],
 async setup(){const ks=[ME,'xw','lena','xq'];const cs=await Promise.all(ks.map(k=>char(k)));P=cs.map((c,i)=>({c,me:i===0,bal:[balloon(COLS[i]),balloon(COLS[i])],n:2,x:0,z:0,yaw:0,cd:0,st:0,tgt:null}));
  const ring=new THREE.Mesh(new THREE.RingGeometry(ar-0.06,ar+0.06,96),std({color:0xf2efe6}));ring.rotation.x=-Math.PI/2;ring.position.y=0.01;scene.add(ring);
  const hoopP=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,3.2,8),std({color:0x3b5f8a,metalness:0.5,roughness:0.5}));hoopP.position.set(0,1.6,-ar-2.5);scene.add(hoopP);
  const bd=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.0,0.05),std({color:0xf5f5f0}));bd.position.set(0,3.1,-ar-2.3);scene.add(bd);this.reset();},
 reset(){P.forEach((p,i)=>{const a=i*Math.PI/2+Math.PI/4;p.x=Math.sin(a)*3;p.z=Math.cos(a)*3;p.n=2;p.bal.forEach(b=>b.visible=true);p.yaw=Math.atan2(-p.x,-p.z);p.cd=0;p.st=0;p.out=false;p.c.root.visible=true;});this.place(0);},
 place(dt){for(const p of P){p.c.root.position.set(p.x,p.st>0?0.08:0,p.z);p.c.root.rotation.y=p.yaw;const s=Math.sin(p.yaw),c=Math.cos(p.yaw);
   p.bal.forEach((b,k)=>{const side=k?1:-1;b.position.set(p.x-s*0.3+c*0.12*side,0,p.z-c*0.3-s*0.12*side);});}
  const me=P[0];camera.position.set(me.x*0.5,7.2,me.z*0.5+7.5);camera.lookAt(me.x*0.5,0,me.z*0.5);},
 idle(){this.place(0);},
 start(){this.reset();msg('开踩！',1);},
 press(k){if(k==='A')this.doStomp(P[0]);},
 doStomp(p){if(p.cd>0||p.out)return;p.cd=0.55;p.st=0.2;snd('slap');const fx=p.x+Math.sin(p.yaw)*0.35,fz=p.z+Math.cos(p.yaw)*0.35;
  for(const q of P){if(q===p||q.out)continue;for(const b of q.bal){if(!b.visible)continue;if(Math.hypot(b.position.x-fx,b.position.z-fz)<0.42){b.visible=false;q.n--;snd('pop');if(p.me){MG.score+=100;msg('踩破一个！',0.8);}if(q.me)msg('你的鸡蛋破了！',1);
    if(q.n<=0){q.out=true;q.c.root.visible=false;}return;}}}},
 update(dt){const a=axis();const me=P[0];
  if(!me.out&&a.m>0.1){me.x+=a.x*3.4*dt;me.z+=a.y*3.4*dt;me.yaw=Math.atan2(a.x,a.y);}me.c.walk(a.m>0.1?1:0,1.5);
  for(let i=1;i<P.length;i++){const p=P[i];if(p.out)continue;
   let best=null,bd=1e9;for(const q of P){if(q===p||q.out)continue;for(const b of q.bal){if(!b.visible)continue;const d=Math.hypot(b.position.x-p.x,b.position.z-p.z)+(q.me?-0.8:0);if(d<bd){bd=d;best=b;}}}
   if(best){const dx=best.position.x-p.x,dz=best.position.z-p.z,d=Math.hypot(dx,dz);const sp=2.1+0.3*i;
    // 躲避：玩家靠近时侧移
    const ex=me.x-p.x,ez=me.z-p.z,ed=Math.hypot(ex,ez);let vx=dx/d,vz=dz/d;if(ed<1.4&&!me.out){vx-=ex/ed*0.9;vz-=ez/ed*0.9;}
    const vm=Math.hypot(vx,vz)||1;if(d>0.3){p.x+=vx/vm*sp*dt;p.z+=vz/vm*sp*dt;p.yaw=Math.atan2(dx,dz);}
    p.c.walk(1,1.4);if(d<0.6&&Math.random()<dt*2.2)this.doStomp(p);}else p.c.walk(0);}
  for(const p of P){p.cd-=dt;p.st-=dt;const r=Math.hypot(p.x,p.z);if(r>ar){p.x*=ar/r;p.z*=ar/r;}}
  // 简单分离
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const p=P[i],q=P[j];if(p.out||q.out)continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d<0.45&&d>0){const k=(0.45-d)/2/d;p.x-=dx*k;p.z-=dz*k;q.x+=dx*k;q.z+=dz*k;}}
  this.place(dt);
  const left=P.slice(1).filter(p=>!p.out).length;
  if(me.out){MG.finish(false,'你的两个鸡蛋都被踩破了。踩破别人 '+MG.score/100+' 个。');}
  else if(left===0){MG.score+=Math.round((60-MG.t)*10);MG.finish(true,'三个对手全部出局！');}
  else if(MG.t>=60){MG.score+=me.n*50;MG.finish(MG.score>=300,'时间到！你还剩 '+me.n+' 个鸡蛋。');}
  hud('<b>🎈 踩鸡蛋</b><br>你的鸡蛋 '+'🥚'.repeat(Math.max(0,me.n)),'对手剩 '+left+' 人<br>剩 '+Math.max(0,60-MG.t).toFixed(0)+' s · 分 '+MG.score);}};})());

// ---------- 6. 五子棋 ----------
GAMES.push((()=>{let opp,board,grid,cur,stones=[],cursor,turn,aiT,last,mBlack,mWhite,ring;const N=15,SZ=0.9,STEP=SZ/16;
 const wp=(i,j)=>new THREE.Vector3(-SZ/2+STEP*(i+1),0.80,-SZ/2+STEP*(j+1));
 function line5(b,i,j,c){for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let n=1;for(const s of [1,-1]){let x=i+dx*s,y=j+dy*s;while(x>=0&&y>=0&&x<N&&y<N&&b[x][y]===c){n++;x+=dx*s;y+=dy*s;}}if(n>=5)return true;}return false;}
 function evalPt(b,i,j,c){let sc=0;for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){let n=1,open=0;for(const s of [1,-1]){let x=i+dx*s,y=j+dy*s;while(x>=0&&y>=0&&x<N&&y<N&&b[x][y]===c){n++;x+=dx*s;y+=dy*s;}if(x>=0&&y>=0&&x<N&&y<N&&b[x][y]===0)open++;}
   sc+=n>=5?1e6:n===4?(open===2?5e4:open?6e3:0):n===3?(open===2?4e3:open?500:0):n===2?(open===2?300:open?40:0):(open?5:0);}return sc;}
 function ai(b){let best=null,bs=-1;for(let i=0;i<N;i++)for(let j=0;j<N;j++){if(b[i][j])continue;let near=false;for(let x=i-2;x<=i+2&&!near;x++)for(let y=j-2;y<=j+2;y++)if(x>=0&&y>=0&&x<N&&y<N&&b[x][y]){near=true;break;}if(!near)continue;
   const s=evalPt(b,i,j,2)*1.1+evalPt(b,i,j,1)+Math.random()*3;if(s>bs){bs=s;best=[i,j];}}return best||[7,7];}
 return {id:'wuziqi',name:'下棋 · 五子棋',icon:'⚫',scene:'A',env:'town',where:'矿区小镇 · 大树下的石桌',
 rule:'和小雯在大树下下五子棋。你执黑先下，横、竖、斜先连成五子就赢。',
 pc:'<b>鼠标点击</b>棋盘落子；或 <b>方向键</b> 移动光标、<b>空格</b> 落子。',mobile:'直接<b>点棋盘</b>落子（也可点 <b>落子</b> 放在红圈处）。',buttons:[['A','落子','right:28px;bottom:28px']],
 async setup(){opp=await char('xw');opp.root.position.set(0,0,-0.95);opp.root.rotation.y=0;
  const stoneM=std({color:0x8d8a82,roughness:0.95});const top=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.75,0.08,40),stoneM);top.position.y=0.72;top.castShadow=top.receiveShadow=true;scene.add(top);
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.32,0.7,20),stoneM);leg.position.y=0.35;scene.add(leg);
  for(const [x,z] of [[0,0.95],[0,-1.5]]){const st=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.24,0.42,16),stoneM);st.position.set(x,0.21,z);scene.add(st);}
  board=new THREE.Mesh(new THREE.BoxGeometry(SZ,0.04,SZ),[std({map:tex('wood')}),std({map:tex('wood')}),std({map:tex('board'),roughness:0.6}),std({map:tex('wood')}),std({map:tex('wood')}),std({map:tex('wood')})]);board.position.y=0.78;board.castShadow=true;board.receiveShadow=true;scene.add(board);
  scene.add(tree(1.8,-2.6,1.4));
  mBlack=new THREE.MeshPhysicalMaterial({color:0x111111,roughness:0.25,clearcoat:1});mWhite=new THREE.MeshPhysicalMaterial({color:0xf3f1ea,roughness:0.3,clearcoat:1});
  cursor=new THREE.Mesh(new THREE.RingGeometry(0.018,0.026,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xff5533}));scene.add(cursor);
  ring=new THREE.Mesh(new THREE.RingGeometry(0.008,0.013,16).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xff2222}));scene.add(ring);ring.visible=false;
  camera.position.set(0,1.75,0.95);camera.lookAt(0,0.78,-0.02);},
 stone(i,j,c){const s=new THREE.Mesh(new THREE.SphereGeometry(STEP*0.45,20,10),c===1?mBlack:mWhite);s.scale.y=0.38;s.position.copy(wp(i,j));s.position.y+=0.008;s.castShadow=true;scene.add(s);stones.push(s);ring.position.copy(s.position);ring.position.y+=0.008;ring.visible=true;},
 start(){stones.forEach(s=>scene.remove(s));stones=[];grid=[...Array(N)].map(()=>Array(N).fill(0));cur=[7,7];turn=1;aiT=0;ring.visible=false;msg('你执黑先下',1.2);this.cur();
  camera.position.set(0,1.75,0.95);camera.lookAt(0,0.78,-0.02);},
 cur(){cursor.position.copy(wp(cur[0],cur[1]));cursor.position.y+=0.012;},
 place(i,j){if(turn!==1||grid[i][j])return;grid[i][j]=1;this.stone(i,j,1);snd('slap');MG.moves=(MG.moves||0)+1;
  if(line5(grid,i,j,1)){MG.score=Math.max(100,1000-stones.length*10);MG.finish(true,'你连成五子，赢了小雯！');return;}turn=2;aiT=0.7;},
 press(k){if(k==='A')this.place(cur[0],cur[1]);const d={L:[-1,0],R:[1,0],U:[0,-1],D:[0,1]}[k];if(d){cur=[clamp(cur[0]+d[0],0,N-1),clamp(cur[1]+d[1],0,N-1)];this.cur();}},
 tap(ray){const h=ray.intersectObject(board)[0];if(!h)return;const i=Math.round((h.point.x+SZ/2)/STEP-1),j=Math.round((h.point.z+SZ/2)/STEP-1);if(i<0||j<0||i>=N||j>=N)return;cur=[i,j];this.cur();this.place(i,j);},
 update(dt){if(MG.joy.m>0.6){MG.jt=(MG.jt||0)-dt;if(MG.jt<=0){MG.jt=0.18;cur=[clamp(cur[0]+Math.round(MG.joy.x),0,N-1),clamp(cur[1]+Math.round(MG.joy.y),0,N-1)];this.cur();}}
  if(turn===2){aiT-=dt;if(aiT<=0){const [i,j]=ai(grid);grid[i][j]=2;this.stone(i,j,2);snd('slap');if(line5(grid,i,j,2)){MG.score=stones.length;MG.finish(false,'小雯先连成五子。');return;}
    if(stones.length>=N*N){MG.finish(false,'和棋。');return;}turn=1;}}
  hud('<b>⚫ 五子棋</b><br>'+(turn===1?'轮到你（黑）':'小雯思考中…'),'已下 '+stones.length+' 手');}};})());

// ---------- 7. 拍纸片（打元宝） ----------
GAMES.push((()=>{let opp,me,mine,theirs,turn,ph,pv,dir,anim,my,their,round,cardM,cardO,zone;
 function card(t){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.012,0.16),[std({color:0xcfc4a8}),std({color:0xcfc4a8}),std({map:t,roughness:0.8}),std({map:t,roughness:0.8,color:0xbbbbbb}),std({color:0xcfc4a8}),std({color:0xcfc4a8})]);m.castShadow=true;g.add(m);scene.add(g);return g;}
 return {id:'paizhipian',name:'打纸片（打元宝）',icon:'🟥',scene:'A',env:'town',where:'矿区小镇 · 屋檐下',
 rule:'用自己的“元宝”往地上一拍，把对方的元宝掀翻就赢走它。两人轮流拍，各有 5 张，谁先输光谁输（最多 12 回合）。',
 pc:'看下方力度条，绿色区按 <b>空格</b> 拍。',mobile:'绿色区点右下 <b>拍</b>。',buttons:[['A','拍','right:28px;bottom:28px']],
 async setup(){[me,opp]=await Promise.all([char(ME),char('vivi')]);me.root.position.set(0,0,1.0);me.root.rotation.y=Math.PI;opp.root.position.set(0,0,-1.0);opp.root.rotation.y=0;
  cardM=card(tex('paperR'));cardO=card(tex('paperB'));
  const st=new THREE.Mesh(new THREE.BoxGeometry(6,0.12,1.2),std({color:0x8b8478}));st.position.set(0,0.06,-3);scene.add(st);
  camera.position.set(1.4,2.1,2.6);camera.lookAt(0,0.2,-0.2);},
 start(){my=5;their=5;round=0;turn=1;this.setupTurn();},
 setupTurn(){ph=0;pv=0;dir=1;anim=null;round++;zone=[0.42,0.58].map(v=>v+(turn===1?0:0));const w=Math.max(0.08,0.2-round*0.008);zone=[0.5-w/2,0.5+w/2];
  cardO.position.set(0,0.006,0);cardO.rotation.set(0,0.3,0);cardM.position.set(0,0.006,0);cardM.rotation.set(0,-0.2,0);
  // 被拍的放地上，拍的人举在手上
  if(turn===1){cardM.position.set(0.15,0.9,0.75);cardO.position.set(0,0.006,0);}else{cardO.position.set(-0.15,0.9,-0.75);cardM.position.set(0,0.006,0);}
  $('mgbar').style.display=turn===1?'block':'none';const s=$('mgbar').querySelector('s');s.style.left=(zone[0]*100)+'%';s.style.width=((zone[1]-zone[0])*100)+'%';
  msg(turn===1?'轮到你拍':'Vivi 拍',1);this.ait=turn===2?R(0.8,1.4):8;},
 press(k){if(k!=='A'||turn!==1||anim)return;const q=pv>=zone[0]&&pv<=zone[1]?0.85:Math.abs(pv-0.5)<0.25?0.3:0.06;this.slap(Math.random()<q);},
 slap(ok){anim={t:0,ok};snd('slap');},
 update(dt){if(!anim){if(turn===1){pv+=dir*dt*(0.9+round*0.05);if(pv>1){pv=1;dir=-1;}if(pv<0){pv=0;dir=1;}$('mgbar').querySelector('i').style.left=(pv*100)+'%';this.ait-=dt;if(this.ait<=0){msg('太慢了，算没拍翻',1);this.slap(false);}}
   else{this.ait-=dt;if(this.ait<=0)this.slap(Math.random()<0.42);}}
  else{anim.t+=dt;const hit=turn===1?cardM:cardO,tgt=turn===1?cardO:cardM;const k=Math.min(1,anim.t/0.18);
   hit.position.y=0.9-(0.9-0.02)*k;hit.position.x*=0.8;hit.position.z*=0.8;
   if(anim.t>0.18&&anim.ok){const f=Math.min(1,(anim.t-0.18)/0.4);tgt.position.y=0.006+Math.sin(f*Math.PI)*0.25;tgt.rotation.z=f*Math.PI;tgt.position.x=f*0.25;}
   if(anim.t>1.0){if(anim.ok){if(turn===1){their--;my++;msg('翻了！赢一张',1);snd('ok');}else{my--;their++;msg('被翻了…',1);snd('bad');}}else msg(turn===1?'没翻动':'Vivi 没拍翻',0.9);
    MG.score=my*100;
    if(their<=0){$('mgbar').style.display='none';MG.finish(true,'Vivi 的元宝全被你赢光了！');return;}
    if(my<=0){$('mgbar').style.display='none';MG.finish(false,'你的元宝输光了。');return;}
    if(round>=12){$('mgbar').style.display='none';MG.finish(my>their,'12 回合结束：你 '+my+' 张，Vivi '+their+' 张。');return;}
    turn=turn===1?2:1;this.setupTurn();}}
  hud('<b>🟥 打纸片</b><br>第 '+round+' 回合','你 <b>'+my+'</b> 张 · Vivi '+their+' 张');}};})());

// ---------- 8. 摸瞎子 ----------
GAMES.push((()=>{let ps=[],x,z,yaw,caught,clapT,arT,arA,grabT;
 return {id:'moxiazi',name:'摸瞎子',icon:'🙈',scene:'B',env:'school',where:'小学校园 · 教学楼前',
 rule:'你蒙着眼当“瞎子”，只能看见脚边一点点。小伙伴会不时拍手喊“我在这！”，屏幕上的箭头和左右声道会告诉你方向。60 秒内摸到 3 个人算赢。',
 pc:'<b>W/S</b> 前后走，<b>A/D</b> 或鼠标拖动转身，<b>空格</b> 摸。',mobile:'左下摇杆走/转，右下 <b>摸</b>。',joy:true,buttons:[['A','摸','right:28px;bottom:28px']],
 async setup(){const ks=['xw','lena','xq','vivi'];const cs=await Promise.all(ks.map(k=>char(k)));ps=cs.map((c,i)=>({c,x:0,z:0,vx:0,vz:0,t:0,got:false}));
  const ring=new THREE.Mesh(new THREE.RingGeometry(6.9,7.05,96),std({color:0xf2efe6}));ring.rotation.x=-Math.PI/2;ring.position.y=0.01;scene.add(ring);
  camera.position.set(0,6,9);camera.lookAt(0,0,0);this.fog=scene.fog;this.bg=scene.background;},
 preview(){this.reset();},
 reset(){x=0;z=0;yaw=0;ps.forEach((p,i)=>{const a=i*1.57+0.6;p.x=Math.sin(a)*4;p.z=Math.cos(a)*4;p.got=false;p.c.root.visible=true;p.t=0;});},
 idle(){this.place();camera.position.set(0,6,9);camera.lookAt(0,0,0);},
 place(){for(const p of ps){p.c.root.position.set(p.x,0,p.z);}},
 start(){this.reset();caught=0;clapT=1.0;arT=0;grabT=0;$('mgblind').style.display='block';scene.fog=new THREE.Fog(0x1a1208,0.8,5.8);scene.background=new THREE.Color(0x140e08);msg('蒙上眼睛…',1.2);},
 press(k){if(k!=='A')return;grabT=0.35;snd('slap');const fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  for(const p of ps){if(p.got)continue;const dx=p.x-x,dz=p.z-z,d=Math.hypot(dx,dz);if(d<1.55&&(dx*fx+dz*fz)/Math.max(d,1e-3)>0.15){p.got=true;p.c.root.visible=false;caught++;snd('ok');msg('摸到 '+p.c.name+'！',1.2);MG.score+=Math.round(300-MG.t*2);break;}}},
 update(dt){const a=axis();yaw-=a.x*2.0*dt;if(MG.drag){yaw-=MG.drag;MG.drag=0;}
  const fx=-Math.sin(yaw),fz=-Math.cos(yaw);x+=fx*(-a.y)*2.0*dt;z+=fz*(-a.y)*2.0*dt;const r=Math.hypot(x,z);if(r>6.8){x*=6.8/r;z*=6.8/r;}
  for(const p of ps){if(p.got)continue;p.t-=dt;const dx=p.x-x,dz=p.z-z,d=Math.hypot(dx,dz);
   if(p.t<=0){p.t=R(1,2.5);const ang=Math.random()*6.28;p.vx=Math.sin(ang)*0.9;p.vz=Math.cos(ang)*0.9;}
   let vx=p.vx,vz=p.vz;if(d<1.6){vx+=dx/d*0.7;vz+=dz/d*0.7;} // 你靠近会躲（v6 放缓）
   p.x+=vx*dt;p.z+=vz*dt;const rr=Math.hypot(p.x,p.z);if(rr>6.6){p.x*=6.6/rr;p.z*=6.6/rr;p.vx*=-1;p.vz*=-1;}
   p.c.root.rotation.y=Math.atan2(vx,vz);p.c.walk(1,0.9);}
  clapT-=dt;if(clapT<=0){const live=ps.filter(p=>!p.got);if(live.length){const p=live[(Math.random()*live.length)|0];clapT=R(1.0,1.9);
    const ang=Math.atan2(p.x-x,p.z-z);arA=ang;arT=1.4;const rel=-Math.atan2(Math.sin(ang-Math.atan2(fx,fz)),Math.cos(ang-Math.atan2(fx,fz)));snd('clap',Math.sin(rel));msg('“'+p.c.name+'：我在这！”',1.0);}}
  arT-=dt;const ar=$('mgarrow');if(arT>0){const rel=Math.atan2(fx,fz)-arA;ar.style.display='block';ar.style.transform='rotate('+(rel*180/Math.PI)+'deg)';ar.style.opacity=Math.min(1,arT);}else ar.style.display='none';
  this.place();camera.position.set(x,1.5,z);camera.lookAt(x+fx,1.35-(grabT>0?0.2:0),z+fz);grabT-=dt;
  if(caught>=3){this.unblind();MG.score+=Math.round((60-MG.t)*5);MG.finish(true,'摸到 3 个小伙伴！用时 '+MG.t.toFixed(1)+' 秒。');}
  else if(MG.t>=60){this.unblind();MG.finish(caught>=1,'时间到，摸到 '+caught+' 个。');}
  hud('<b>🙈 摸瞎子</b><br>听拍手声找人','摸到 '+caught+'/3<br>剩 '+Math.max(0,60-MG.t).toFixed(0)+' s');},
 unblind(){scene.fog=this.fog;scene.background=this.bg;$('mgblind').style.display='none';$('mgarrow').style.display='none';}};})());
// 摸瞎子：鼠标/手指右侧拖动转身
{let lx=null;root.addEventListener('pointerdown',e=>{if(e.clientX>innerWidth*0.45)lx=e.clientX;});root.addEventListener('pointermove',e=>{if(lx!==null&&MG.active&&MG.game&&MG.game.id==='moxiazi'){MG.drag=(MG.drag||0)+(e.clientX-lx)*0.006;lx=e.clientX;}});addEventListener('pointerup',()=>lx=null);}

// ---- v8.14 childhood: 跳房子 + 踢毽子 ----
// =============================================================================
// 草稿 · 跳房子（tiaofangzi）· v8.14 候选
// 用法：粘贴进 minigames.js 的 GAMES.push(...) 区域；SPOTS 加挂点后 makeMarker 自动认 id。
// 约束：程序化几何 + Canvas 粉笔格；零外部素材；复用 char()/axis()/MG.finish 等既有 API。
// 生成：2026-10-29 旁路额度任务 · 未进 public
// =============================================================================

GAMES.push((()=>{
  // 经典「飞机」格：1–2 并排、3、4–5、6、7–8、9、「家」
  // cells: {i,j 格子中心 xz, w,d, label, home?}
  let me, cells=[], cur=-1, stone, stoneAt, hops, fails, phase, throwT, stoneVx, stoneVz, stoneY, stoneVy, aim;
  const chalk = ()=>std({color:0xf2efe6, roughness:1});
  const pad = (x,z,w,d,lab,home)=>{
    const g=new THREE.Group();
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),chalk());
    m.rotation.x=-Math.PI/2; m.position.y=0.012; g.add(m);
    const border=new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(w,d)),
      new THREE.LineBasicMaterial({color:0xffffff})
    ); border.rotation.x=-Math.PI/2; border.position.y=0.014; g.add(border);
    const c=document.createElement('canvas'); c.width=128; c.height=128;
    const x2=c.getContext('2d'); x2.fillStyle='#fff8e8'; x2.font='bold 64px "Microsoft YaHei",sans-serif';
    x2.textAlign='center'; x2.textBaseline='middle'; x2.fillText(lab,64,70);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:true}));
    sp.scale.set(0.45,0.45,1); sp.position.y=0.05; g.add(sp);
    g.position.set(x,0,z); scene.add(g);
    return {x,z,w,d,lab,home:!!home, mesh:g};
  };
  function layout(){
    cells=[];
    // z 向前为负（朝「家」）
    cells.push(pad(0, 0, 0.9,0.9,'1'));
    cells.push(pad(-0.5,-0.95,0.9,0.9,'2')); cells.push(pad(0.5,-0.95,0.9,0.9,'3'));
    cells.push(pad(0,-1.9,0.9,0.9,'4'));
    cells.push(pad(-0.5,-2.85,0.9,0.9,'5')); cells.push(pad(0.5,-2.85,0.9,0.9,'6'));
    cells.push(pad(0,-3.8,0.9,0.9,'7'));
    cells.push(pad(-0.5,-4.75,0.9,0.9,'8')); cells.push(pad(0.5,-4.75,0.9,0.9,'9'));
    cells.push(pad(0,-5.8,1.2,1.0,'家',true));
  }
  function inCell(i, px,pz){
    const c=cells[i]; return Math.abs(px-c.x)<=c.w*0.48 && Math.abs(pz-c.z)<=c.d*0.48;
  }
  function nearestCell(px,pz){
    let bi=-1,bd=1e9; for(let i=0;i<cells.length;i++){const c=cells[i]; const d=Math.hypot(px-c.x,pz-c.z); if(d<bd){bd=d;bi=i;}} return bi;
  }
  return {
    id:'tiaofangzi', name:'跳房子', icon:'🏠', scene:'B', env:'school', where:'小学校园 · 粉笔格子',
    rule:'先把小石子丢进目标格，再单脚（触控按「跳」连点）依次跳过各格，到「家」捡回石子再跳回来。踩线或踩错格算一次失败；3 次失败结束。丢进 1→家 全清算大胜。',
    pc:'<b>空格</b> 丢石子 / 跳；方向键微调落点瞄准。', mobile:'右下 <b>丢/跳</b>；摇杆微调瞄准。',
    joy:true, buttons:[['A','丢/跳','right:28px;bottom:28px']],
    async setup(){
      me=await char(ME); layout();
      stone=new THREE.Mesh(new THREE.DodecahedronGeometry(0.06,0),std({color:0x8a8478,roughness:1}));
      stone.castShadow=true; scene.add(stone);
      // 地面粉笔尘
      const dust=new THREE.Mesh(new THREE.CircleGeometry(4.5,48),std({color:0xb0aaa0,roughness:1}));
      dust.rotation.x=-Math.PI/2; dust.position.y=0.004; scene.add(dust);
      camera.position.set(0,6.2,4.5); camera.lookAt(0,0,-2.5);
      this.reset();
    },
    reset(){
      cur=0; hops=0; fails=0; phase='aim'; throwT=0; stoneAt=-1;
      me.root.position.set(0,0,1.1); me.root.rotation.y=Math.PI;
      stone.position.set(0.15,0.9,1.0); stone.visible=true; aim=0;
    },
    preview(){ this.reset(); },
    idle(){ camera.position.set(0,6.2,4.5); camera.lookAt(0,0,-2.5); },
    start(){ this.reset(); msg(mgCopy('tiaofangzi','start','先丢进第 1 格！'),1.2); },
    press(k){
      if(k!=='A') return;
      if(phase==='aim'){
        // 抛物丢出：力度固定，左右由摇杆/aim
        const a=axis(); const tx=(a.x||aim)*0.9;
        const target=cells[cur];
        const from=me.root.position.clone().setY(0.9);
        const to=new THREE.Vector3(target.x+tx*0.25,0.05,target.z);
        const T=0.55; stoneVx=(to.x-from.x)/T; stoneVz=(to.z-from.z)/T;
        stoneVy=(0.9+0.5*9.8*T*T)/T; stoneY=0.9; stone.position.copy(from);
        phase='fly'; throwT=0; snd('slap');
      } else if(phase==='hop' && me.root.position.y<0.02){
        // 单脚跳：给一点向上速度
        me.root.userData.vy=2.8; snd('tick');
      }
    },
    update(dt){
      const a=axis();
      if(phase==='aim'){
        aim=clamp(aim+a.x*dt*1.5,-1,1);
        stone.position.set(0.15+aim*0.05,0.9,1.0);
        me.walk(0);
        hud('<b>🏠 跳房子</b><br>瞄准第 '+(cur+1)+' 格（'+(cells[cur].lab)+'）','失败 '+fails+'/3 · 已清 '+hops);
      } else if(phase==='fly'){
        throwT+=dt; stoneVy-=9.8*dt; stoneY+=stoneVy*dt;
        stone.position.x+=stoneVx*dt; stone.position.z+=stoneVz*dt; stone.position.y=Math.max(0.05,stoneY);
        if(stoneY<=0.05){
          const land=nearestCell(stone.position.x,stone.position.z);
          if(land===cur && inCell(cur, stone.position.x, stone.position.z)){
            stoneAt=cur; phase='hop'; msg('跳！别踩线',1); snd('ok');
            me.root.position.set(0,0,1.05);
          } else {
            fails++; snd('bad'); msg(fails<3?'没丢进，重来':'出局',1.1);
            if(fails>=3){ MG.score=hops*100; MG.finish(false,'丢偏 3 次。清了 '+hops+' 格。'); return; }
            phase='aim'; stone.position.set(0.15,0.9,1.0);
          }
        }
        hud('<b>🏠 跳房子</b><br>石子飞行中…','失败 '+fails+'/3');
      } else if(phase==='hop'){
        // 简易：按跳前进一格；检测是否落在正确下一格走廊
        let vy=me.root.userData.vy||0;
        if(vy>0 || me.root.position.y>0){ vy-=9.8*dt; me.root.position.y+=vy*dt; if(me.root.position.y<=0){ me.root.position.y=0; vy=0;
          // 落地判定：前进方向最近格
          const ni=nearestCell(me.root.position.x, me.root.position.z);
          // 允许站在「已过格」或目标路径；踩到石子格=失败（除非回家捡）
          if(stoneAt>=0 && ni===stoneAt && !cells[stoneAt].home){
            fails++; snd('bad'); msg('踩到石子了！',1);
            if(fails>=3){ MG.score=hops*100; MG.finish(false,'踩石子出局。'); return; }
            phase='aim'; me.root.position.set(0,0,1.05); stone.position.set(0.15,0.9,1.0); stoneAt=-1;
          } else if(ni===cells.length-1 && stoneAt===cells.length-1){
            // 到家捡石
            hops=cells.length; MG.score=hops*120; snd('win');
            MG.finish(true,'跳到「家」并捡回石子！'); return;
          }
        } me.root.userData.vy=vy; }
        // 前进：跳起时带一点 -z
        if((me.root.userData.vy||0)>0.5){ me.root.position.z-=1.6*dt; me.root.position.x+=a.x*1.2*dt; }
        me.walk((me.root.userData.vy||0)>0.2?1:0, 1.2);
        camera.position.set(me.root.position.x*0.3, 5.5, me.root.position.z+3.8);
        camera.lookAt(me.root.position.x,0,me.root.position.z-1.5);
        // 到达当前目标格前方 → 推进 cur
        if(stoneAt===cur && me.root.position.z < cells[cur].z+0.35 && cur<cells.length-1){
          // 路过目标后继续往家
          if(cur===cells.length-2){ /* approaching home */ }
        }
        if(me.root.position.z < cells[cells.length-1].z+0.4 && stoneAt===cur){
          // 简化胜利：跳到家格附近且石子已在最终目标
          if(cur>=cells.length-1 || inCell(cells.length-1, me.root.position.x, me.root.position.z)){
            hops=Math.max(hops,cur+1); MG.score=hops*120;
            MG.finish(true,'跳完一趟房子！'); return;
          }
        }
        // 超时推进：每次成功落地靠近下一格则 cur++
        if(me.root.position.y===0 && me.root.position.z < cells[Math.min(cur,cells.length-1)].z+0.2){
          if(cur<cells.length-1 && cur===stoneAt){ /* waiting */ }
          else if(cur<stoneAt || (stoneAt>=0 && me.root.position.z < cells[Math.min(stoneAt,cells.length-1)].z)){
            // no-op keep
          }
        }
        // 简化：连续跳到石子格前一格，再一跳进家
        if(me.root.position.y===0 && nearestCell(me.root.position.x,me.root.position.z)===Math.max(0,stoneAt-1)){
          hops=Math.max(hops,stoneAt);
        }
        if(MG.t>=90){ MG.score=hops*80; MG.finish(hops>=5,'时间到，清了约 '+hops+' 格。'); return; }
        hud('<b>🏠 跳房子</b><br>单脚跳向「'+(cells[stoneAt]?.lab||'?')+'」','失败 '+fails+'/3 · 分 '+(hops*100));
      }
      // 推进 cur：本格成功后准备下一格（在 hop 胜利或重新 aim 时）
      if(phase==='aim' && hops>cur){ cur=Math.min(cells.length-1, hops); }
      // 丢进成功后，下一轮 aim 升格
      if(phase==='hop' && stoneAt===cur && me.root.position.z < cells[cur].z - 0.1){
        // 越过本格 → 视为本格完成，回起点丢下一格
        hops=Math.max(hops,cur+1); cur=Math.min(cells.length-1,cur+1);
        phase='aim'; me.root.position.set(0,0,1.05); stone.position.set(0.15,0.9,1.0);
        stoneAt=-1; msg(cur>=cells.length-1?'最后：丢进「家」！':'丢进下一格',1);
      }
    }
  };
})());

// =============================================================================
// 草稿 · 踢毽子（tijianzi）· v8.14 候选
// 用法：粘贴进 minigames.js 的 GAMES.push(...) 区域；SPOTS 加挂点后 makeMarker 认 id。
// 约束：程序化毽子（布垫+鸡毛）；零外部素材；复用 char()/axis()/MG.finish。
// 生成：2026-10-29 旁路额度任务 · 未进 public
// =============================================================================

GAMES.push((()=>{
  let me, jian, y, vy, x, z, combo, miss, cool, spin, lastKick;
  function makeJian(){
    const g=new THREE.Group();
    // 布垫底座
    const base=new THREE.Mesh(
      new THREE.CylinderGeometry(0.055,0.06,0.025,16),
      std({color:0xc8463c, roughness:0.85, map:tex('cloth')})
    ); base.position.y=0.012; base.castShadow=true; g.add(base);
    // 铜钱感
    const coin=new THREE.Mesh(
      new THREE.TorusGeometry(0.028,0.006,8,16),
      std({color:0xd4a017, metalness:0.7, roughness:0.35})
    ); coin.rotation.x=Math.PI/2; coin.position.y=0.03; g.add(coin);
    // 鸡毛束（程序化）
    const featherCols=[0xf2efe6,0xffe9c4,0xe8d28a,0xffffff];
    for(let i=0;i<7;i++){
      const a=i/7*Math.PI*2;
      const f=new THREE.Mesh(
        new THREE.ConeGeometry(0.012,0.18,5),
        std({color:featherCols[i%4], roughness:0.7, side:THREE.DoubleSide})
      );
      f.position.set(Math.sin(a)*0.02, 0.12, Math.cos(a)*0.02);
      f.rotation.z=Math.sin(a)*0.25; f.rotation.x=Math.cos(a)*0.2;
      g.add(f);
    }
    scene.add(g); return g;
  }
  return {
    id:'tijianzi', name:'踢毽子', icon:'🪶', scene:'B', env:'school', where:'小学校园 · 操场边',
    rule:'用脚把毽子踢起来，别让它落地。连续踢得越多分越高；落地 3 次结束。毽子会左右飘，用摇杆/AD 对准再踢。',
    pc:'<b>A/D</b> 左右对准，<b>空格</b> 踢。', mobile:'摇杆左右对准，右下 <b>踢</b>。',
    joy:true, buttons:[['A','踢','right:28px;bottom:28px']],
    async setup(){
      me=await char(ME);
      me.root.position.set(0,0,0.6); me.root.rotation.y=Math.PI;
      jian=makeJian();
      // 粉笔圆
      const ring=new THREE.Mesh(new THREE.RingGeometry(1.6,1.72,64),std({color:0xf2efe6}));
      ring.rotation.x=-Math.PI/2; ring.position.y=0.01; scene.add(ring);
      for(const [tx,tz] of [[-3,-2],[3,-1],[-2,3],[2.5,2.5]]) scene.add(tree(tx,tz,1.0));
      camera.position.set(0.8,1.7,3.4); camera.lookAt(0,0.8,0);
      this.reset();
    },
    reset(){
      x=0; z=0; y=0.9; vy=0; combo=0; miss=0; cool=0; spin=0; lastKick=0;
      jian.position.set(0,y,0); jian.visible=true;
    },
    preview(){ this.reset(); },
    idle(dt){ spin+=dt*2; jian.rotation.y=spin; jian.position.y=0.35+Math.sin(MG.t||0)*0.05; },
    start(){ this.reset(); msg(mgCopy('tijianzi','start','踢起来！'),1); vy=2.2; },
    press(k){
      if(k!=='A' || cool>0) return;
      // 脚下命中：毽子接近地面且水平距离近
      const dx=jian.position.x - me.root.position.x;
      const dz=jian.position.z - me.root.position.z;
      const near=Math.hypot(dx,dz)<0.55 && y<1.15 && y>0.08;
      cool=0.22;
      if(near){
        // 踢飞：高度随连击略增，带一点随机横飘
        vy=3.0+Math.min(1.2,combo*0.08)+R(0,0.25);
        x+=R(-0.35,0.35); // 横漂目标偏移累积在位置速度里用
        jian.userData.vx=(jian.userData.vx||0)+R(-0.6,0.6);
        jian.userData.vz=(jian.userData.vz||0)+R(-0.25,0.25);
        combo++; lastKick=MG.t; snd('ok'); MG.score=combo*10+Math.max(0,combo-5)*5;
        if(combo%10===0) msg('连踢 '+combo+'！',0.9);
        // 脚抬一下的反馈
        me.root.userData.kickT=0.18;
      } else {
        snd('tick'); // 空踢
      }
    },
    update(dt){
      const a=axis();
      // 人左右挪
      me.root.position.x=clamp(me.root.position.x+a.x*2.8*dt,-1.5,1.5);
      me.root.position.z=clamp(me.root.position.z+a.y*1.2*dt,0.2,1.2);
      me.walk(a.m>0.15?0.6:0,1.0);
      if(me.root.userData.kickT>0){ me.root.userData.kickT-=dt; me.root.position.y=0.06; }
      else me.root.position.y=0;

      cool-=dt;
      // 毽子物理
      let vx=jian.userData.vx||0, vz=jian.userData.vz||0;
      vx*=Math.pow(0.2,dt); vz*=Math.pow(0.2,dt); // 空气阻尼
      vy-=9.8*dt;
      y+=vy*dt; x+=vx*dt; z+=vz*dt;
      // 软边界：出圈轻轻弹回
      const rr=Math.hypot(x,z); if(rr>1.55){ x*=1.55/rr; z*=1.55/rr; jian.userData.vx=-(vx||0.2); jian.userData.vz=-(vz||0.1); }
      jian.userData.vx=vx; jian.userData.vz=vz;
      spin+=dt*(4+combo*0.15);
      jian.rotation.set(Math.sin(spin)*0.35, spin, Math.cos(spin*0.7)*0.25);
      jian.position.set(x,Math.max(0.02,y),z);

      if(y<=0.02){
        y=0.02; vy=0; miss++; combo=0; snd('bad');
        msg(miss<3?'落地了！':'毽子停了',1);
        jian.userData.vx=0; jian.userData.vz=0;
        if(miss>=3){ MG.finish(MG.score>=50,'最高连踢分 '+MG.score+'。'); return; }
        // 自动弹起一点方便再开
        y=0.35; vy=1.6; x=me.root.position.x*0.3; z=0;
      }
      // 超时奖励局
      if(MG.t>=60){ MG.finish(MG.score>=80,'60 秒结束，得分 '+MG.score+'。'); return; }

      camera.position.set(me.root.position.x*0.4+0.6, 1.65, me.root.position.z+3.0);
      camera.lookAt(jian.position.x*0.5, Math.max(0.5,y*0.5+0.4), jian.position.z*0.3);
      hud('<b>🪶 踢毽子</b><br>连踢 <b>'+combo+'</b>','落地 '+miss+'/3<br>分 '+MG.score+' · 剩 '+Math.max(0,60-MG.t).toFixed(0)+' s');
    }
  };
})());


// ================= 场景入口 =================
// spots: 相对场景出生点的 [dx,dz]；main 会用 groundW 贴地
export const SPOTS={A:[['gunlhuan',-4.5,-2.5],['shabao',4.5,-2.5],['wuziqi',-3.5,3.5],['paizhipian',3.5,3.5],['mutouren',-7.0,-4.0],['tiaosheng',6.5,-5.0],['moxiazi',-6.0,5.5],['caijidan',7.0,5.0],['tiaofangzi',-8.5,2.0],['tijianzi',8.5,-1.5]],
 B:[['mutouren',-4,-3],['tiaosheng',4,-3],['caijidan',-4,3.5],['moxiazi',4,3.5],['gunlhuan',0,-5.5],['tiaofangzi',0,5.5],['tijianzi',-6.5,0.5]],
 G:[['shabao',2.5,-3.5],['wuziqi',-3.0,2.0],['tiaofangzi',-2.5,2.0],['tijianzi',0,3.5]]};
export {GAMES,enter,quit,MG};
export function makeMarker(THREE_,id){const G=GAMES.find(g=>g.id===id);const g=new THREE_.Group();
 const ring=new THREE_.Mesh(new THREE_.RingGeometry(0.55,0.75,48).rotateX(-Math.PI/2),new THREE_.MeshBasicMaterial({color:0xffc070,transparent:true,opacity:0.75,depthWrite:false,side:THREE_.DoubleSide}));ring.position.y=0.04;g.add(ring);
 const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle='rgba(20,12,30,.72)';x.beginPath();x.roundRect(4,8,504,112,40);x.fill();x.strokeStyle='#ffc070';x.lineWidth=5;x.stroke();
 x.fillStyle='#ffe9c4';x.font='bold 54px "Microsoft YaHei","PingFang SC",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(G.icon+' '+G.name.split(' · ')[0].replace('（打元宝）',''),256,66);
 const t=new THREE_.CanvasTexture(c);t.colorSpace=THREE_.SRGBColorSpace;const sp=new THREE_.Sprite(new THREE_.SpriteMaterial({map:t,depthTest:true,transparent:true}));sp.scale.set(1.6,0.4,1);sp.position.y=2.1;g.add(sp);
 // 小道具标识
 const steel=new THREE_.MeshStandardMaterial({color:0x9aa0a8,metalness:0.8,roughness:0.35});let prop;
 if(id==='gunlhuan'){prop=new THREE_.Mesh(new THREE_.TorusGeometry(0.32,0.015,8,40),steel);prop.position.y=0.34;}
 else if(id==='wuziqi'){prop=new THREE_.Mesh(new THREE_.BoxGeometry(0.6,0.05,0.6),[0,0,0,0,0,0].map((_,i)=>new THREE_.MeshStandardMaterial(i===2?{map:tex('board')}:{map:tex('wood')})));prop.position.y=0.5;const leg=new THREE_.Mesh(new THREE_.CylinderGeometry(0.06,0.08,0.48,10),new THREE_.MeshStandardMaterial({color:0x8d8a82}));leg.position.y=0.24;g.add(leg);}
 else if(id==='paizhipian'){prop=new THREE_.Mesh(new THREE_.BoxGeometry(0.2,0.015,0.2),new THREE_.MeshStandardMaterial({map:tex('paperR')}));prop.position.y=0.03;}
 else if(id==='shabao'){prop=new THREE_.Mesh(new THREE_.BoxGeometry(0.16,0.09,0.16),new THREE_.MeshStandardMaterial({map:tex('cloth')}));prop.position.y=0.05;}
 else if(id==='tiaosheng'){prop=new THREE_.Mesh(new THREE_.TorusGeometry(0.22,0.012,6,32),new THREE_.MeshStandardMaterial({color:0xd9c9a3}));prop.rotation.x=Math.PI/2;prop.position.y=0.02;}
 else if(id==='caijidan'){prop=new THREE_.Mesh(new THREE_.SphereGeometry(0.13,16,12),new THREE_.MeshPhysicalMaterial({color:0xe94f37,clearcoat:0.8,roughness:0.3}));prop.position.y=0.15;}
 else if(id==='moxiazi'){prop=new THREE_.Mesh(new THREE_.BoxGeometry(0.5,0.06,0.02),new THREE_.MeshStandardMaterial({color:0x222222}));prop.position.y=1.0;}
 else if(id==='tiaofangzi'){prop=new THREE_.Mesh(new THREE_.PlaneGeometry(0.7,0.7),new THREE_.MeshStandardMaterial({color:0xf2efe6,roughness:1,side:THREE_.DoubleSide}));prop.rotation.x=-Math.PI/2;prop.position.y=0.03;}
 else if(id==='tijianzi'){const base=new THREE_.Mesh(new THREE_.CylinderGeometry(0.05,0.05,0.02,10),new THREE_.MeshStandardMaterial({color:0xc8463c}));base.position.y=0.02;g.add(base);prop=new THREE_.Mesh(new THREE_.ConeGeometry(0.04,0.16,6),new THREE_.MeshStandardMaterial({color:0xf2efe6}));prop.position.y=0.12;}
 else{prop=new THREE_.Mesh(new THREE_.CylinderGeometry(0.06,0.06,1.2,8),new THREE_.MeshStandardMaterial({color:0xc8b48a}));prop.position.y=0.6;}
 g.add(prop);g.userData={id,ring,sp,name:G.name,icon:G.icon};return g;}
export function setPrompt(text,onTap){if(!text){prompt.style.display='none';prompt.onclick=null;return;}prompt.textContent=text;prompt.style.display='block';prompt.onclick=e=>{e.stopPropagation();onTap&&onTap();};
 prompt.ontouchstart=e=>{e.preventDefault();e.stopPropagation();onTap&&onTap();};}
