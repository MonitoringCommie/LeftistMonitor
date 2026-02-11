/**
 * Globe3D Preview Component
 *
 * A self-contained React artifact that renders a 3D spinning globe
 * with wars, conflicts, liberation struggles, and side visualization.
 *
 * This is the preview/demo version. The full Globe3D.jsx integrates
 * with the Zustand store and API endpoints.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

// Country centroids for globe markers
const C = {"US":[39.8,-98.5],"RU":[61.5,105.3],"CN":[35.9,104.2],"GB":[55.4,-3.4],"FR":[46.2,2.2],"DE":[51.2,10.4],"JP":[36.2,138.3],"IN":[20.6,79],"BR":[-14.2,-51.9],"AU":[-25.3,133.8],"ZA":[-30.6,22.9],"EG":[26.8,30.8],"NG":[9.1,8.7],"MX":[23.6,-102.6],"AR":[-38.4,-63.6],"CU":[21.5,-77.8],"TR":[38.9,35.2],"IR":[32.4,53.7],"IQ":[33.2,43.7],"SY":[34.8,38.9],"SA":[23.9,45.1],"IL":[31,34.9],"PS":[31.9,35.2],"LB":[33.9,35.9],"AF":[33.9,67.7],"PK":[30.4,69.3],"UA":[48.4,31.2],"PL":[51.9,19.1],"KR":[35.9,127.8],"KP":[40.3,127.5],"VN":[14.1,108.3],"MM":[21.9,96],"ID":[-0.8,113.9],"ET":[9.1,40.5],"CD":[-4,21.8],"SD":[12.9,30.2],"LY":[26.3,17.2],"YE":[15.6,48.5],"RW":[-1.9,29.9],"RS":[44,21],"BA":[43.9,17.7],"HR":[45.1,15.2],"ML":[17.6,-4],"BF":[12.2,-1.6],"NE":[17.6,8.1],"TD":[15.5,18.7],"CA":[56.1,-106.3],"NL":[52.1,5.3],"NO":[60.5,8.5],"SE":[60.1,18.6],"FI":[61.9,25.7],"ES":[40.5,-3.7],"IT":[41.9,12.6],"GR":[39.1,21.8],"CZ":[49.8,15.5],"SK":[48.7,19.7],"HU":[47.2,19.5],"RO":[45.9,25],"BG":[42.7,25.5],"DK":[56.3,9.5],"PT":[39.4,-8.2],"BE":[50.5,4.5],"ER":[15.2,39.8],"SO":[5.2,46.2],"AE":[23.4,53.8],"QA":[25.4,51.2],"KW":[29.3,47.5],"BH":[26,50.6],"UG":[1.4,32.3],"AO":[-11.2,17.9],"TH":[15.9,100.9],"PH":[12.9,121.8],"CO":[4.6,-74.3],"IS":[65,-19]};

const NAMES = {"US":"United States","RU":"Russia","CN":"China","GB":"United Kingdom","FR":"France","DE":"Germany","JP":"Japan","IN":"India","BR":"Brazil","AU":"Australia","ZA":"South Africa","EG":"Egypt","NG":"Nigeria","MX":"Mexico","AR":"Argentina","CU":"Cuba","TR":"Turkey","IR":"Iran","IQ":"Iraq","SY":"Syria","SA":"Saudi Arabia","IL":"Israel","PS":"Palestine","LB":"Lebanon","AF":"Afghanistan","PK":"Pakistan","UA":"Ukraine","PL":"Poland","KR":"South Korea","KP":"North Korea","VN":"Vietnam","MM":"Myanmar","ID":"Indonesia","ET":"Ethiopia","CD":"DR Congo","SD":"Sudan","LY":"Libya","YE":"Yemen","RW":"Rwanda","RS":"Serbia","BA":"Bosnia","HR":"Croatia","ML":"Mali","BF":"Burkina Faso","NE":"Niger","TD":"Chad","CA":"Canada","NL":"Netherlands","NO":"Norway","SE":"Sweden","FI":"Finland","ES":"Spain","IT":"Italy","GR":"Greece","CZ":"Czechia","SK":"Slovakia","HU":"Hungary","RO":"Romania","BG":"Bulgaria","DK":"Denmark","PT":"Portugal","BE":"Belgium","ER":"Eritrea","SO":"Somalia","AE":"UAE","QA":"Qatar","KW":"Kuwait","BH":"Bahrain","UG":"Uganda","AO":"Angola","TH":"Thailand","PH":"Philippines","CO":"Colombia","IS":"Iceland"};

const CONFLICTS = [
  { id:'ww2', name:'World War II', s:1939, e:1945, cas:'70-85M', type:'interstate',
    desc:'Deadliest conflict in history between Allies and Axis.',
    sides:[{n:'Allies',c:'#22c55e',ids:['US','GB','FR','RU','CN','AU','CA','IN','BR']},{n:'Axis',c:'#dc2626',ids:['DE','JP','IT','HU','RO','BG','FI']}]},
  { id:'korean', name:'Korean War', s:1950, e:1953, cas:'~3M', type:'interstate',
    desc:'Cold War proxy between North and South Korea.',
    sides:[{n:'UN Coalition',c:'#3b82f6',ids:['KR','US','GB','AU','CA','TR']},{n:'Communist',c:'#dc2626',ids:['KP','CN','RU']}]},
  { id:'vietnam', name:'Vietnam War', s:1955, e:1975, cas:'~3.5M', type:'interstate',
    desc:'Anti-imperialist liberation war against US intervention.',
    sides:[{n:'North Vietnam',c:'#dc2626',ids:['VN','CN','RU','KP','CU']},{n:'US & Allies',c:'#3b82f6',ids:['US','KR','AU','TH','PH']}]},
  { id:'coldwar', name:'Cold War', s:1947, e:1991, cas:'Proxy millions', type:'interstate',
    desc:'Global ideological confrontation between capitalism and socialism.',
    sides:[{n:'NATO / West',c:'#3b82f6',ids:['US','GB','FR','DE','IT','CA','JP','KR','TR','NL','NO','DK','ES','GR','PT','BE','IS']},{n:'Warsaw Pact',c:'#dc2626',ids:['RU','CN','CU','KP','VN','PL','CZ','SK','HU','RO','BG','ET']}]},
  { id:'palestine', name:'Israeli-Palestinian Conflict', s:1948, e:2026, cas:'Ongoing', type:'occupation',
    desc:'Ongoing occupation and settler-colonial project against Palestinian people.',
    sides:[{n:'Palestine & Solidarity',c:'#22c55e',ids:['PS','LB','SY','IR','IQ','YE','SA','EG','QA','TR']},{n:'Israel & Backers',c:'#3b82f6',ids:['IL','US','GB']}]},
  { id:'ukraine', name:'Russia-Ukraine War', s:2022, e:2026, cas:'500K+', type:'interstate',
    desc:'Russian invasion of Ukraine, largest European war since WWII.',
    sides:[{n:'Ukraine & NATO',c:'#3b82f6',ids:['UA','US','GB','FR','DE','PL','CA','NL','NO','SE','FI','DK','CZ']},{n:'Russia & Allies',c:'#dc2626',ids:['RU','KP','IR']}]},
  { id:'syria', name:'Syrian Civil War', s:2011, e:2024, cas:'600K+', type:'civil',
    desc:'Multi-faction civil war following Arab Spring.',
    sides:[{n:'Opposition',c:'#22c55e',ids:['SY','TR','SA','QA','US']},{n:'Assad & Allies',c:'#dc2626',ids:['RU','IR','LB']}]},
  { id:'yemen', name:'Yemeni Civil War', s:2014, e:2026, cas:'377K+', type:'civil',
    desc:'Houthi forces vs Saudi-backed government.',
    sides:[{n:'Houthi',c:'#22c55e',ids:['YE','IR']},{n:'Saudi Coalition',c:'#f97316',ids:['SA','AE','BH','KW','EG','SD']}]},
  { id:'tigray', name:'Tigray War', s:2020, e:2022, cas:'600K+', type:'civil',
    desc:'Ethiopian government vs Tigray forces.',
    sides:[{n:'Ethiopia',c:'#f97316',ids:['ET','ER','SO']},{n:'Tigray',c:'#a855f7',ids:['ET']}]},
  { id:'sudan', name:'Sudan Civil War', s:2023, e:2026, cas:'150K+', type:'civil',
    desc:'SAF vs RSF paramilitaries.',
    sides:[{n:'SAF',c:'#3b82f6',ids:['SD','EG']},{n:'RSF',c:'#dc2626',ids:['SD']}]},
  { id:'myanmar', name:'Myanmar Civil War', s:2021, e:2026, cas:'50K+', type:'civil',
    desc:'Resistance against military junta after 2021 coup.',
    sides:[{n:'Resistance',c:'#22c55e',ids:['MM']},{n:'Junta',c:'#dc2626',ids:['MM','CN','RU']}]},
  { id:'drc', name:'Congo Wars', s:1996, e:2026, cas:'6M+', type:'civil',
    desc:'Deadliest conflict since WWII. Ongoing resource wars.',
    sides:[{n:'DRC',c:'#3b82f6',ids:['CD','AO','ZA']},{n:'M23/Rwanda',c:'#dc2626',ids:['RW','UG']}]},
  { id:'iraq', name:'Iraq War', s:2003, e:2011, cas:'~1M', type:'interstate',
    desc:'US-led invasion based on false pretenses.',
    sides:[{n:'US Coalition',c:'#3b82f6',ids:['US','GB','AU','PL','IT','ES','DK','NL']},{n:'Iraqi Resistance',c:'#dc2626',ids:['IQ']}]},
  { id:'afghan', name:'Afghanistan War', s:2001, e:2021, cas:'176K+', type:'interstate',
    desc:'US/NATO 20-year occupation of Afghanistan.',
    sides:[{n:'NATO',c:'#3b82f6',ids:['US','GB','CA','AU','DE','FR','IT','NL','NO','DK','TR']},{n:'Taliban',c:'#dc2626',ids:['AF','PK']}]},
  { id:'rwanda', name:'Rwandan Genocide', s:1994, e:1994, cas:'800K+', type:'civil',
    desc:'Genocide against Tutsi people.',
    sides:[{n:'RPF',c:'#22c55e',ids:['RW','UG']},{n:'Interahamwe',c:'#dc2626',ids:['RW']}]},
  { id:'bosnia', name:'Bosnian War', s:1992, e:1995, cas:'100K+', type:'civil',
    desc:'Ethnic conflict and genocide in Yugoslavia.',
    sides:[{n:'Bosnia/NATO',c:'#3b82f6',ids:['BA','HR','US']},{n:'Serbs',c:'#dc2626',ids:['RS']}]},
  { id:'libya', name:'Libyan Civil Wars', s:2011, e:2020, cas:'30K+', type:'civil',
    desc:'NATO intervention and civil war post-Arab Spring.',
    sides:[{n:'GNA/NATO',c:'#3b82f6',ids:['LY','US','GB','FR','IT','TR','QA']},{n:'LNA/Haftar',c:'#dc2626',ids:['RU','EG','AE','SA']}]},
  { id:'sahel', name:'Sahel Insurgency', s:2012, e:2026, cas:'50K+', type:'civil',
    desc:'Jihadist insurgency across West Africa.',
    sides:[{n:'Sahel States',c:'#f97316',ids:['ML','BF','NE','TD','NG']},{n:'France/US',c:'#3b82f6',ids:['FR','US']}]},
];

const LIBERATION = [
  { id:'palestine', name:'Palestine', lat:31.5, lng:35, color:'#22c55e', desc:'418 Nakba villages destroyed, 500+ checkpoints, ongoing settlement expansion' },
  { id:'kurdistan', name:'Kurdistan', lat:37, lng:43, color:'#f97316', desc:'4,000+ villages destroyed by Turkish & Iraqi forces' },
  { id:'kashmir', name:'Kashmir', lat:34.1, lng:74.8, color:'#a855f7', desc:'700,000+ Indian troops occupying Kashmir' },
  { id:'tibet', name:'Tibet', lat:31.2, lng:88.8, color:'#eab308', desc:'6,000+ monasteries destroyed, 160+ self-immolations' },
  { id:'western_sahara', name:'Western Sahara', lat:24.2, lng:-12.9, color:'#06b6d4', desc:'2,700km sand berm, 7M+ landmines' },
  { id:'west_papua', name:'West Papua', lat:-4, lng:138, color:'#ec4899', desc:'500,000+ killed since 1963 Indonesian occupation' },
  { id:'ireland', name:'N. Ireland', lat:54.6, lng:-5.9, color:'#14b8a6', desc:'The Troubles: 3,500+ killed' },
  { id:'uyghur', name:'Uyghur Region', lat:41, lng:85, color:'#f43f5e', desc:'1M+ detained in concentration camps' },
];

function ll2v(lat, lng, r) {
  const p = (90 - lat) * Math.PI / 180;
  const t = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(-r*Math.sin(p)*Math.cos(t), r*Math.cos(p), r*Math.sin(p)*Math.sin(t));
}

function arc(s, e, col, h=0.2) {
  const pts = [];
  const sv = ll2v(s[0],s[1],1), ev = ll2v(e[0],e[1],1);
  const m = new THREE.Vector3().addVectors(sv,ev).multiplyScalar(0.5);
  const d = sv.distanceTo(ev);
  m.normalize().multiplyScalar(1+h*d);
  for(let i=0;i<=48;i++){
    const t=i/48;
    pts.push(new THREE.Vector3(
      (1-t)*(1-t)*sv.x+2*(1-t)*t*m.x+t*t*ev.x,
      (1-t)*(1-t)*sv.y+2*(1-t)*t*m.y+t*t*ev.y,
      (1-t)*(1-t)*sv.z+2*(1-t)*t*m.z+t*t*ev.z
    ));
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(g, new THREE.LineBasicMaterial({color:new THREE.Color(col),transparent:true,opacity:0.5}));
}

function glow(col, sz=0.04) {
  const cv = document.createElement('canvas');
  cv.width=64; cv.height=64;
  const cx = cv.getContext('2d');
  const gr = cx.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,col); gr.addColorStop(0.4,col+'aa'); gr.addColorStop(1,col+'00');
  cx.fillStyle=gr; cx.fillRect(0,0,64,64);
  const tx = new THREE.CanvasTexture(cv);
  const mat = new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false});
  const sp = new THREE.Sprite(mat);
  sp.scale.set(sz,sz,1);
  return sp;
}

function earthTex() {
  const cv = document.createElement('canvas');
  cv.width=2048; cv.height=1024;
  const cx = cv.getContext('2d');
  const g = cx.createLinearGradient(0,0,0,1024);
  g.addColorStop(0,'#0a1628'); g.addColorStop(0.5,'#0f2847'); g.addColorStop(1,'#0a1628');
  cx.fillStyle=g; cx.fillRect(0,0,2048,1024);
  cx.strokeStyle='rgba(100,150,255,0.05)'; cx.lineWidth=0.5;
  for(let i=0;i<=36;i++){cx.beginPath();cx.moveTo(i/36*2048,0);cx.lineTo(i/36*2048,1024);cx.stroke();}
  for(let i=0;i<=18;i++){cx.beginPath();cx.moveTo(0,i/18*1024);cx.lineTo(2048,i/18*1024);cx.stroke();}
  const conts = [
    [[140,180],[165,200],[200,260],[250,310],[310,360],[340,380],[310,400],[250,410],[180,380],[140,320],[120,260],[130,210]],
    [[270,400],[310,400],[350,430],[370,480],[360,540],[340,600],[310,660],[280,700],[260,680],[240,600],[230,530],[240,470],[260,420]],
    [[930,160],[980,140],[1040,150],[1100,170],[1100,220],[1070,260],[1020,280],[960,290],[920,270],[900,230],[910,190]],
    [[920,290],[980,290],[1040,310],[1080,360],[1100,430],[1080,520],[1040,600],[980,640],[940,620],[900,560],[880,480],[870,400],[880,340],[900,300]],
    [[1100,100],[1200,80],[1350,90],[1500,120],[1600,150],[1650,200],[1600,280],[1500,320],[1400,340],[1350,380],[1280,360],[1200,320],[1150,280],[1100,240],[1080,180]],
    [[1280,310],[1320,300],[1360,330],[1350,400],[1320,440],[1280,420],[1260,370]],
    [[1500,530],[1580,510],[1650,530],[1680,570],[1660,620],[1600,650],[1530,640],[1500,600],[1490,560]],
  ];
  conts.forEach(pts=>{
    cx.beginPath(); cx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++){const p=pts[i-1],c=pts[i];cx.quadraticCurveTo(p[0],p[1],(p[0]+c[0])/2,(p[1]+c[1])/2);}
    cx.closePath(); cx.fillStyle='rgba(30,58,92,0.7)'; cx.fill();
    cx.strokeStyle='rgba(80,140,220,0.15)'; cx.lineWidth=1; cx.stroke();
  });
  return new THREE.CanvasTexture(cv);
}

export default function Globe3DPreview() {
  const mt = useRef(null);
  const fr = useRef(null);
  const drag = useRef(false);
  const prev = useRef({x:0,y:0});
  const rot = useRef({x:0.3,y:0});
  const autoRot = useRef(true);
  const zm = useRef(2.8);
  const grps = useRef({arcs:null,marks:null,lib:null});

  const [year, setYear] = useState(2024);
  const [play, setPlay] = useState(false);
  const [panel, setPanel] = useState(null);
  const [showC, setShowC] = useState(true);
  const [showL, setShowL] = useState(true);

  const active = useMemo(()=>CONFLICTS.filter(c=>c.s<=year&&c.e>=year),[year]);

  useEffect(()=>{
    if(!mt.current)return;
    const m=mt.current, w=m.clientWidth, h=m.clientHeight;
    const scene=new THREE.Scene(); scene.background=new THREE.Color('#080c14');
    const cam=new THREE.PerspectiveCamera(45,w/h,0.1,100); cam.position.z=zm.current;
    const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(w,h); ren.setPixelRatio(Math.min(devicePixelRatio,2));
    m.appendChild(ren.domElement);

    scene.add(new THREE.AmbientLight(0x334466,1.5));
    const dl=new THREE.DirectionalLight(0xffffff,1.2); dl.position.set(5,3,5); scene.add(dl);

    const globe=new THREE.Mesh(new THREE.SphereGeometry(1,64,64), new THREE.MeshPhongMaterial({map:earthTex(),specular:0x222244,shininess:15}));
    scene.add(globe);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.015,64,64), new THREE.MeshBasicMaterial({color:0x3388ff,transparent:true,opacity:0.08})));
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.06,32,32), new THREE.MeshBasicMaterial({color:0x1155aa,transparent:true,opacity:0.04,side:THREE.BackSide})));

    const ag=new THREE.Group(), mg=new THREE.Group(), lg=new THREE.Group();
    scene.add(ag); scene.add(mg); scene.add(lg);
    grps.current={arcs:ag,marks:mg,lib:lg};

    const sp=new Float32Array(3000);
    for(let i=0;i<3000;i++)sp[i]=(Math.random()-0.5)*50;
    const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
    scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:0.02,transparent:true,opacity:0.8})));

    const anim=()=>{
      fr.current=requestAnimationFrame(anim);
      if(autoRot.current&&!drag.current)rot.current.y+=0.001;
      [globe,ag,mg,lg].forEach(o=>{o.rotation.x=rot.current.x;o.rotation.y=rot.current.y;});
      const t=Date.now()*0.003;
      mg.children.forEach((c,i)=>{if(c.isSprite){const s=0.04+Math.sin(t+i*0.5)*0.01;c.scale.set(s,s,1);}});
      cam.position.z=zm.current;
      ren.render(scene,cam);
    };
    anim();

    const onR=()=>{const ww=m.clientWidth,hh=m.clientHeight;cam.aspect=ww/hh;cam.updateProjectionMatrix();ren.setSize(ww,hh);};
    window.addEventListener('resize',onR);
    const onD=e=>{drag.current=true;autoRot.current=false;prev.current={x:e.clientX,y:e.clientY};};
    const onM=e=>{if(!drag.current)return;rot.current.y+=(e.clientX-prev.current.x)*0.005;rot.current.x+=(e.clientY-prev.current.y)*0.005;rot.current.x=Math.max(-Math.PI/2,Math.min(Math.PI/2,rot.current.x));prev.current={x:e.clientX,y:e.clientY};};
    const onU=()=>{drag.current=false;setTimeout(()=>autoRot.current=true,3000);};
    const onW=e=>{e.preventDefault();zm.current+=e.deltaY*0.001;zm.current=Math.max(1.5,Math.min(5,zm.current));};
    const cv=ren.domElement;
    cv.addEventListener('mousedown',onD); window.addEventListener('mousemove',onM); window.addEventListener('mouseup',onU);
    cv.addEventListener('wheel',onW,{passive:false});
    cv.addEventListener('touchstart',e=>{if(e.touches.length===1){drag.current=true;autoRot.current=false;prev.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}},{passive:true});
    cv.addEventListener('touchmove',e=>{if(!drag.current||e.touches.length!==1)return;rot.current.y+=(e.touches[0].clientX-prev.current.x)*0.005;rot.current.x+=(e.touches[0].clientY-prev.current.y)*0.005;rot.current.x=Math.max(-Math.PI/2,Math.min(Math.PI/2,rot.current.x));prev.current={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
    cv.addEventListener('touchend',()=>{drag.current=false;setTimeout(()=>autoRot.current=true,3000);});

    return()=>{cancelAnimationFrame(fr.current);window.removeEventListener('resize',onR);ren.dispose();if(m.contains(ren.domElement))m.removeChild(ren.domElement);};
  },[]);

  // Update markers
  useEffect(()=>{
    const{arcs:ag,marks:mg,lib:lg}=grps.current;
    if(!ag||!mg||!lg)return;
    while(ag.children.length)ag.remove(ag.children[0]);
    while(mg.children.length)mg.remove(mg.children[0]);
    while(lg.children.length)lg.remove(lg.children[0]);

    if(showC){
      const seen=new Set();
      active.forEach(cf=>{
        cf.sides.forEach(side=>{
          side.ids.forEach(id=>{
            if(!C[id]||seen.has(id))return; seen.add(id);
            const sp=glow(side.c,0.04); sp.position.copy(ll2v(C[id][0],C[id][1],1.01));
            mg.add(sp);
          });
          for(let i=0;i<side.ids.length-1;i++){
            if(C[side.ids[i]]&&C[side.ids[i+1]])
              ag.add(arc(C[side.ids[i]],C[side.ids[i+1]],side.c,0.15));
          }
        });
        if(cf.sides.length>=2){
          const a=C[cf.sides[0].ids[0]], b=C[cf.sides[1].ids[0]];
          if(a&&b){const l=arc(a,b,'#ff4444',0.3);l.material.opacity=0.35;ag.add(l);}
        }
      });
    }
    if(showL){
      LIBERATION.forEach(s=>{
        const sp=glow(s.color,0.06); sp.position.copy(ll2v(s.lat,s.lng,1.02)); lg.add(sp);
      });
    }
  },[active,showC,showL]);

  useEffect(()=>{
    if(!play)return;
    const iv=setInterval(()=>setYear(y=>{if(y>=2026){setPlay(false);return 2026;}return y+1;}),500);
    return()=>clearInterval(iv);
  },[play]);

  const typeLabel=t=>({interstate:'Interstate War',civil:'Civil War',occupation:'Occupation'}[t]||t);

  return (
    <div style={{position:'relative',width:'100%',height:'100vh',background:'#080c14',overflow:'hidden',fontFamily:'Arial,sans-serif'}}>
      <div ref={mt} style={{position:'absolute',inset:0}} />

      {/* Title */}
      <div style={{position:'absolute',top:16,left:16,zIndex:10,pointerEvents:'none'}}>
        <h1 style={{fontSize:28,fontWeight:'bold',color:'#fff',margin:0,textShadow:'0 2px 20px rgba(0,0,0,0.8)'}}>Leftist Monitor</h1>
        <p style={{fontSize:12,color:'#93c5fd',margin:'4px 0 0',opacity:0.8}}>3D Globe - Wars, Conflicts & Liberation Struggles</p>
      </div>

      {/* Toggle buttons */}
      <div style={{position:'absolute',top:16,right:16,zIndex:10,display:'flex',flexDirection:'column',gap:8}}>
        <button onClick={()=>setShowC(!showC)} style={{padding:'6px 12px',borderRadius:6,fontSize:11,fontWeight:600,border:'none',cursor:'pointer',background:showC?'#dc2626':'#1f2937',color:showC?'#fff':'#9ca3af'}}>{showC?'Hide':'Show'} Conflicts</button>
        <button onClick={()=>setShowL(!showL)} style={{padding:'6px 12px',borderRadius:6,fontSize:11,fontWeight:600,border:'none',cursor:'pointer',background:showL?'#16a34a':'#1f2937',color:showL?'#fff':'#9ca3af'}}>{showL?'Hide':'Show'} Liberation</button>
        <button onClick={()=>autoRot.current=true} style={{padding:'6px 12px',borderRadius:6,fontSize:11,fontWeight:600,border:'none',cursor:'pointer',background:'#1f2937',color:'#9ca3af'}}>Auto-Rotate</button>
      </div>

      {/* Time Slider */}
      <div style={{position:'absolute',bottom:80,left:'50%',transform:'translateX(-50%)',zIndex:10,width:600,maxWidth:'90vw'}}>
        <div style={{background:'rgba(17,24,39,0.9)',backdropFilter:'blur(8px)',borderRadius:12,padding:'12px 16px',border:'1px solid rgba(75,85,99,0.3)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
            <button onClick={()=>setPlay(!play)} style={{width:32,height:32,borderRadius:'50%',background:'#2563eb',border:'none',color:'#fff',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>{play?'||':'\u25B6'}</button>
            <span style={{fontSize:24,fontWeight:'bold',color:'#fff',fontVariantNumeric:'tabular-nums'}}>{year}</span>
            <div style={{flex:1}} />
            <span style={{fontSize:11,color:'#6b7280'}}>{active.length} active conflict{active.length!==1?'s':''}</span>
          </div>
          <input type="range" min={1900} max={2026} value={year} onChange={e=>setYear(+e.target.value)} style={{width:'100%',height:6,accentColor:'#3b82f6'}} />
          <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
            {['1900','1925','1950','1975','2000','2026'].map(y=><span key={y} style={{fontSize:9,color:'#4b5563'}}>{y}</span>)}
          </div>
        </div>
      </div>

      {/* Active Conflicts */}
      <div style={{position:'absolute',bottom:150,left:16,zIndex:10,maxHeight:'35vh',overflowY:'auto',width:280}}>
        <div style={{background:'rgba(17,24,39,0.9)',backdropFilter:'blur(8px)',borderRadius:12,border:'1px solid rgba(75,85,99,0.3)'}}>
          <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(75,85,99,0.3)'}}>
            <h3 style={{margin:0,fontSize:10,fontWeight:600,color:'#9ca3af',textTransform:'uppercase',letterSpacing:1}}>Active Conflicts ({year})</h3>
          </div>
          {active.length===0&&<div style={{padding:'16px 12px',textAlign:'center',color:'#6b7280',fontSize:11}}>No major conflicts</div>}
          {active.map(cf=>(
            <button key={cf.id} onClick={()=>setPanel(panel?.id===cf.id?null:cf)} style={{width:'100%',textAlign:'left',padding:'8px 12px',background:panel?.id===cf.id?'rgba(31,41,55,0.8)':'transparent',border:'none',borderBottom:'1px solid rgba(31,41,55,0.5)',cursor:'pointer',color:'#fff'}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{display:'flex',gap:2}}>{cf.sides.map((s,i)=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:s.c}} />)}</div>
                <span style={{fontSize:13,fontWeight:500}}>{cf.name}</span>
              </div>
              <div style={{fontSize:9,color:'#6b7280',marginTop:2}}>{typeLabel(cf.type)} | {cf.s}-{cf.e===2026?'Present':cf.e}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Liberation */}
      {showL&&<div style={{position:'absolute',top:72,right:16,zIndex:10,width:200}}>
        <div style={{background:'rgba(17,24,39,0.9)',backdropFilter:'blur(8px)',borderRadius:12,border:'1px solid rgba(75,85,99,0.3)'}}>
          <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(75,85,99,0.3)'}}>
            <h3 style={{margin:0,fontSize:10,fontWeight:600,color:'#9ca3af',textTransform:'uppercase',letterSpacing:1}}>Liberation Struggles</h3>
          </div>
          <div style={{padding:6}}>
            {LIBERATION.map(s=>(
              <button key={s.id} onClick={()=>setPanel(panel?.id===s.id?null:{...s,isLib:true})} style={{width:'100%',textAlign:'left',padding:'6px 8px',background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,borderRadius:4,color:'#d1d5db'}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:s.color,flexShrink:0}} />
                <span style={{fontSize:11}}>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* Detail Panel */}
      {panel&&<div style={{position:'absolute',top:'50%',transform:'translateY(-50%)',right:16,zIndex:20,width:320}}>
        <div style={{background:'rgba(17,24,39,0.95)',backdropFilter:'blur(12px)',borderRadius:16,border:'1px solid rgba(75,85,99,0.5)',boxShadow:'0 25px 50px rgba(0,0,0,0.5)'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(75,85,99,0.3)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h3 style={{margin:0,fontSize:18,fontWeight:'bold',color:'#fff'}}>{panel.name}</h3>
            <button onClick={()=>setPanel(null)} style={{background:'none',border:'none',color:'#6b7280',fontSize:20,cursor:'pointer'}}>&times;</button>
          </div>
          <div style={{padding:16}}>
            {panel.isLib?(
              <><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:panel.color}} />
                <span style={{fontSize:13,color:'#d1d5db'}}>Ongoing liberation struggle</span>
              </div>
              <p style={{fontSize:13,color:'#9ca3af',lineHeight:1.6,margin:0}}>{panel.desc}</p></>
            ):(
              <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                  {[['Type',typeLabel(panel.type)],['Casualties',panel.cas],['Period',`${panel.s}-${panel.e===2026?'Now':panel.e}`],['Duration',`${Math.min(year,panel.e)-panel.s}y`]].map(([k,v])=>
                    <div key={k} style={{background:'rgba(31,41,55,0.5)',borderRadius:8,padding:'6px 10px'}}>
                      <div style={{fontSize:10,color:'#6b7280'}}>{k}</div>
                      <div style={{fontSize:12,color:'#e5e7eb',fontWeight:500}}>{v}</div>
                    </div>
                  )}
                </div>
                <p style={{fontSize:12,color:'#9ca3af',lineHeight:1.6,margin:'0 0 12px'}}>{panel.desc}</p>
                {panel.sides?.map((side,i)=>(
                  <div key={i} style={{background:'rgba(31,41,55,0.3)',borderRadius:8,padding:8,marginBottom:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:side.c}} />
                      <span style={{fontSize:11,fontWeight:600,color:'#e5e7eb'}}>{side.n}</span>
                      <span style={{fontSize:9,color:'#6b7280',marginLeft:'auto'}}>{side.ids.length} nations</span>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      {side.ids.map(id=>NAMES[id]?<span key={id} style={{padding:'2px 6px',borderRadius:4,fontSize:9,background:'rgba(55,65,81,0.6)',color:'#d1d5db'}}>{NAMES[id]}</span>:null)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>}

      {/* Bottom hint */}
      <div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:16,fontSize:10,color:'#4b5563'}}>
          <span>Drag to rotate</span><span style={{color:'#374151'}}>|</span>
          <span>Scroll to zoom</span><span style={{color:'#374151'}}>|</span>
          <span>Click conflicts for details</span>
        </div>
      </div>
    </div>
  );
}
