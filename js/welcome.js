(function(){
"use strict";

/* =====================================================================
   VARIABLES + SITE DATA - coordinates + landing dates only. Verify each against NASA,
   then fill the [CONFIRM] fields (add travel/operated/cost/status/source).
   Example of a fully filled site:
   { ..., travel:"x days", operated:"y days", cost:"$z (year dollars)",
     status:"Inactive since YYYY", source:"https://..." }
   ===================================================================== */
var TODO = "[CONFIRM: add NASA source]";
var SITES = [
 {id:"apollo11",planet:"moon",name:"Tranquility Base",mission:"Apollo 11",lat:0.67,lon:23.47,landed:"20 July 1969",
  left:["Eagle lander descent stage","Laser ranging retroreflector","Passive seismic experiment"]},
 {id:"apollo12",planet:"moon",name:"Ocean of Storms",mission:"Apollo 12",lat:-3.01,lon:-23.42,landed:"19 November 1969",
  left:["Lander descent stage","Surface science package (ALSEP)"]},
 {id:"apollo15",planet:"moon",name:"Hadley-Apennine",mission:"Apollo 15",lat:26.13,lon:3.63,landed:"30 July 1971",
  left:["Lunar roving vehicle","Surface science package (ALSEP)","Lander descent stage"]},
 {id:"apollo17",planet:"moon",name:"Taurus-Littrow",mission:"Apollo 17",lat:20.19,lon:30.77,landed:"11 December 1972",
  left:["Lunar roving vehicle","Surface science package (ALSEP)","Lander descent stage"]},
 {id:"viking1",planet:"mars",name:"Chryse Planitia",mission:"Viking 1",lat:22.27,lon:-47.95,landed:"20 July 1976",
  left:["Viking 1 lander"]},
 {id:"insight",planet:"mars",name:"Elysium Planitia",mission:"InSight",lat:4.5,lon:135.62,landed:"26 November 2018",
  left:["InSight lander","Seismometer instrument"]},
 {id:"curiosity",planet:"mars",name:"Gale Crater",mission:"Curiosity (MSL)",lat:-4.59,lon:137.44,landed:"6 August 2012",
  left:["Curiosity rover","Entry and descent hardware (verify)"]},
 {id:"perseverance",planet:"mars",name:"Jezero Crater",mission:"Perseverance",lat:18.44,lon:77.45,landed:"18 February 2021",
  left:["Perseverance rover","Ingenuity helicopter (verify)"]}
];
var STATS=[["Travel time (launch to landing)","travel"],["Days operated","operated"],["Cost","cost"],["Working today?","status"]];
function val(s,k){return s[k]||TODO}
function $(id){return document.getElementById(id)}

/* =====================================================================
   PROCEDURAL SURFACE TEXTURES (seamless 3D noise + craters)
   ===================================================================== */
function hash3(x,y,z){var h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,1274126177);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function sm(t){return t*t*(3-2*t)}
function lerp(a,b,t){return a+(b-a)*t}
function noise3(x,y,z){
  var xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=sm(x-xi),yf=sm(y-yi),zf=sm(z-zi);
  var c000=hash3(xi,yi,zi),c100=hash3(xi+1,yi,zi),c010=hash3(xi,yi+1,zi),c110=hash3(xi+1,yi+1,zi),
      c001=hash3(xi,yi,zi+1),c101=hash3(xi+1,yi,zi+1),c011=hash3(xi,yi+1,zi+1),c111=hash3(xi+1,yi+1,zi+1);
  return lerp(lerp(lerp(c000,c100,xf),lerp(c010,c110,xf),yf),lerp(lerp(c001,c101,xf),lerp(c011,c111,xf),yf),zf);
}
function fbm(x,y,z,o){var s=0,a=.5,n=0;for(var i=0;i<o;i++){s+=a*noise3(x,y,z);n+=a;x*=2.03;y*=2.03;z*=2.03;a*=.5}return s/n}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function mix(a,b,t){return a+(b-a)*t}
function clamp(v){return v<0?0:v>255?255:v}
function sstep(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}

function bowl(ctx,x,y,r,sx,bump,k){
  ctx.save();ctx.translate(x,y);ctx.scale(sx,1);
  var g=ctx.createRadialGradient(0,0,r*.05,0,0,r*1.25);
  if(bump){g.addColorStop(0,"rgba(0,0,0,"+(.6*k)+")");g.addColorStop(.7,"rgba(0,0,0,"+(.35*k)+")");g.addColorStop(.83,"rgba(255,255,255,"+(.65*k)+")");g.addColorStop(1,"rgba(255,255,255,0)")}
  else{g.addColorStop(0,"rgba(0,0,0,"+(.3*k)+")");g.addColorStop(.74,"rgba(0,0,0,"+(.12*k)+")");g.addColorStop(.85,"rgba(255,255,255,"+(.24*k)+")");g.addColorStop(1,"rgba(255,255,255,0)")}
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.25,0,6.2832);ctx.fill();ctx.restore();
}

function buildSurface(kind){
  var W=1024,H=512,seed=kind==="moon"?11:57,rand=mulberry(seed*97);
  var cc=document.createElement("canvas"),bc=document.createElement("canvas");
  cc.width=bc.width=W;cc.height=bc.height=H;
  var cx=cc.getContext("2d"),bx=bc.getContext("2d");
  var ci=cx.createImageData(W,H),bi=bx.createImageData(W,H),d=ci.data,b=bi.data;
  for(var y=0;y<H;y++){
    var lat=(.5-y/H)*Math.PI,cl=Math.cos(lat),py=Math.sin(lat);
    for(var x=0;x<W;x++){
      var lon=x/W*6.28318,px=cl*Math.cos(lon),pz=cl*Math.sin(lon),i=(y*W+x)*4;
      var f=fbm(px*2.2+seed,py*2.2+seed,pz*2.2+seed,5);
      var big=fbm(px*.9+seed*3,py*.9+seed*3,pz*.9+seed*3,3);
      var grain=(noise3(px*60+seed,py*60,pz*60)-.5);
      var r,g,bl,h;
      if(kind==="moon"){
        var maria=sstep(.5,.6,big);
        var base=(120+f*85)*(1-.42*maria)+grain*14;
        r=base;g=base*.995;bl=base*1.03;h=f*.55+grain*.15+.2;
      }else{
        var dark=sstep(.46,.58,big), t=f;
        r=mix(mix(205,150,t),88,dark*.75);
        g=mix(mix(128,78,t),52,dark*.75);
        bl=mix(mix(88,52,t),38,dark*.75);
        r+=grain*18;g+=grain*12;bl+=grain*9;
        var cap=sstep(1.3,1.42,Math.abs(lat)+(noise3(px*6,py*6,pz*6)-.5)*.18);
        r=mix(r,238,cap);g=mix(g,240,cap);bl=mix(bl,245,cap);
        h=f*.5+grain*.1+.25;
      }
      d[i]=clamp(r);d[i+1]=clamp(g);d[i+2]=clamp(bl);d[i+3]=255;
      var hv=clamp(h*255);b[i]=b[i+1]=b[i+2]=hv;b[i+3]=255;
    }
  }
  cx.putImageData(ci,0,0);bx.putImageData(bi,0,0);
  var n=kind==="moon"?900:320,rmax=kind==="moon"?46:30,k=kind==="moon"?1:.6;
  for(var c=0;c<n;c++){
    var r0=rmax*Math.pow(rand(),3.2)+2,cx0=rand()*W,cy0=(.08+.84*rand())*H;
    var la=(.5-cy0/H)*Math.PI,sx=1/Math.max(.35,Math.cos(la));
    [-W,0,W].forEach(function(o){
      if(cx0+o+r0*sx*1.25<0||cx0+o-r0*sx*1.25>W)return;
      bowl(cx,cx0+o,cy0,r0,sx,false,k);bowl(bx,cx0+o,cy0,r0,sx,true,k);
    });
  }
  return {map:cc,bump:bc};
}

/* =====================================================================
   THREE.JS SCENE
   ===================================================================== */
var canvas=$("c"),renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputEncoding=THREE.sRGBEncoding;
var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(42,1,.1,200);
scene.add(new THREE.AmbientLight(0x8fa0c0,.22));
var sun=new THREE.DirectionalLight(0xfff4e6,1.35);sun.position.set(5,2.5,6);scene.add(sun);
var rim=new THREE.DirectionalLight(0x4a7bd0,.35);rim.position.set(-6,-1,-4);scene.add(rim);

// starfield: two layers with varied size and tint
function stars(count,size,spread){
  var g=new THREE.BufferGeometry(),p=[],c=[],col=new THREE.Color();
  for(var i=0;i<count;i++){
    var r=spread+Math.random()*40,t=Math.random()*6.2832,u=Math.acos(2*Math.random()-1);
    p.push(r*Math.sin(u)*Math.cos(t),r*Math.cos(u),r*Math.sin(u)*Math.sin(t));
    col.setHSL(Math.random()<.7?.6:.08,.35,.7+Math.random()*.3);c.push(col.r,col.g,col.b);
  }
  g.setAttribute("position",new THREE.Float32BufferAttribute(p,3));
  g.setAttribute("color",new THREE.Float32BufferAttribute(c,3));
  var s=new THREE.Points(g,new THREE.PointsMaterial({size:size,vertexColors:true,sizeAttenuation:false}));
  scene.add(s);return s;
}
var starsA=stars(1400,1.4,60),starsB=stars(500,2.4,70);

function glow(color,scale,power){
  return new THREE.Mesh(new THREE.SphereGeometry(1,48,32),new THREE.ShaderMaterial({
    uniforms:{c:{value:new THREE.Color(color)},p:{value:power}},
    vertexShader:"varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:"uniform vec3 c;uniform float p;varying vec3 n;void main(){float i=pow(max(0.0,0.72-dot(n,vec3(0.0,0.0,1.0))),p);gl_FragColor=vec4(c*i,i);}",
    side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false
  })).scale.setScalar(scale);
}

var P={};
function makePlanet(kind,tint,glowColor){
  var surf=buildSurface(kind);
  var map=new THREE.CanvasTexture(surf.map),bump=new THREE.CanvasTexture(surf.bump);
  map.encoding=THREE.sRGBEncoding;
  map.anisotropy=bump.anisotropy=renderer.capabilities.getMaxAnisotropy();
  var mat=new THREE.MeshStandardMaterial({map:map,bumpMap:bump,bumpScale:kind==="moon"?2.4:1.2,roughness:1,metalness:0});
  // Optional real NASA texture: put textures/moon.jpg or textures/mars.jpg (with credit) and it replaces the procedural one.
  new THREE.TextureLoader().load("textures/"+kind+".jpg",function(t){
    t.encoding=THREE.sRGBEncoding;t.anisotropy=map.anisotropy;mat.map=t;mat.bumpMap=null;mat.needsUpdate=true;
  },undefined,function(){});
  var mesh=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),mat);
  var group=new THREE.Group();group.add(mesh);
  if(glowColor){var gm=glow(glowColor,1.14,3);var ring=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),gm.material);ring.scale.setScalar(1.14);group.add(ring)}
  group.userData={mesh:mesh,kind:kind};scene.add(group);return group;
}

var PIN_R=1.005;
function ll(lat,lon,r){var phi=(90-lat)*Math.PI/180,th=(lon+180)*Math.PI/180;return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(th),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(th))}

/* =====================================================================
   VARIABLES + RESPONSIVE LAYOUT
   ===================================================================== */
var view="home",selected=null,drag=null,spinning=true,tween=null,panelOpen=false,hovered=null,activeSite=null;
var mouse=new THREE.Vector2(),ray=new THREE.Raycaster(),cur={},pinsEl=$("pins");
/* responsive layout */
function narrow(){return innerWidth/innerHeight<.9||innerWidth<700}

function targets(){
  var n=narrow(),t={};
  if(view==="home"){
    t.moon={x:n?0:-2.4,y:n?1.9:.1,s:n?1.15:1.35};
    t.mars={x:n?0:2.4,y:n?-1.9:.1,s:n?.95:1.05};
  }else{
    var o=selected==="moon"?"mars":"moon";
    t[selected]={x:(!n&&panelOpen)?-1.4:0,y:(n&&panelOpen)?1.15:0,s:n?1.55:1.9};
    t[o]={x:selected==="moon"?4:-4,y:0,s:.001};
  }
  return t;
}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener("resize",resize);resize();

/* welcome screen */
function setView(v,p){
  view=v;selected=p||null;spinning=true;
  $("hud").classList.toggle("hide",v!=="home");
  $("hint").style.display=v==="home"?"block":"none";
  $("back").style.display=v==="home"?"none":"block";
  var t2=$("title2");t2.style.display=v==="home"?"none":"block";
  if(p){t2.textContent=p==="moon"?"The Moon":"Mars";t2.style.color=p==="moon"?"var(--moon)":"var(--mars)"}
  SITES.forEach(function(s){s.el.style.display="none"});
  if(v==="home")closePanel();
  document.querySelectorAll(".plabel").forEach(function(l){l.style.display="none"});
}

/* welcome screen interactions */
document.querySelectorAll("[data-go]").forEach(function(b){b.onclick=function(){setView("planet",b.dataset.go)}});
$("back").onclick=function(){setView("home")};
$("close").onclick=closePanel;
addEventListener("keydown",function(e){if(e.key==="Escape"){if(panelOpen)closePanel();else if(view==="planet")setView("home")}});

canvas.addEventListener("pointerdown",function(e){drag={x:e.clientX,y:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener("pointermove",function(e){
  mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);
  if(drag){
    var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;
    var g=view==="planet"?P[selected]:hovered;
    if(g&&drag.moved){g.rotation.y+=dx*.006;g.rotation.x=Math.max(-1.1,Math.min(1.1,g.rotation.x+dy*.004));tween=null;spinning=false}
    drag.x=e.clientX;drag.y=e.clientY;
  }
});
canvas.addEventListener("pointerup",function(e){
  var was=drag;drag=null;
  if(!was||was.moved||view!=="home")return;
  var h=pick();if(h)setView("planet",h.userData.kind);
});
function pick(){
  ray.setFromCamera(mouse,camera);
  var hit=ray.intersectObjects([P.moon.userData.mesh,P.mars.userData.mesh])[0];
  return hit?hit.object.parent:null;
}

/* panel */
function fillPanel(s){
  activeSite=s;
  $("phead").innerHTML="<small>"+s.planet.toUpperCase()+" &middot; "+s.name+"</small><h2>"+s.mission+"</h2><p>Landed "+s.landed+"</p>";
  var h='<div class="stats">';
  STATS.forEach(function(f){var v=val(s,f[1]);h+='<div class="stat"><small>'+f[0]+'</small><div'+(v===TODO?' class="todo"':'')+'>'+v+'</div></div>'});
  h+='</div><div class="src">Source: '+(s.source?'<a style="color:var(--accent)" target="_blank" rel="noopener noreferrer" href="'+s.source+'">'+s.source+'</a>':'<span class="todo">'+TODO+'</span>')+'</div>';
  $("p-over").innerHTML=h;

  var l='<p style="color:var(--muted);font-size:.9rem;margin:0">Hardware documented at this site:</p><ul class="left">';
  s.left.forEach(function(x){l+="<li>"+x+"</li>"});
  $("p-left").innerHTML=l+'</ul><p class="todo">Verify every item against a NASA source before presenting.</p>';

  $("p-tvn").innerHTML='<div class="ba" id="ba"><span>Add real NASA images with credit:<br>images/'+s.id+'-then.jpg and images/'+s.id+'-now.jpg</span>'
   +'<img id="imNow" alt="'+s.mission+' site today" src="images/'+s.id+'-now.jpg"><img id="imThen" alt="'+s.mission+' at landing" src="images/'+s.id+'-then.jpg">'
   +'<span class="tag t1">Then</span><span class="tag t2">Now</span></div>'
   +'<input class="sl" id="sl" type="range" min="0" max="100" value="50" aria-label="Then versus now slider">'
   +'<p class="src">Drag the slider to reveal then (left) and now (right). Put the image credit here: '+TODO+'</p>';
  var imT=$("imThen");
  ["imNow","imThen"].forEach(function(id){$(id).onerror=function(){this.style.display="none"}});
  $("sl").oninput=function(){imT.style.clipPath="inset(0 "+(100-this.value)+"% 0 0)"};
  imT.style.clipPath="inset(0 50% 0 0)";

  var c='<div class="cmpsel"><select id="cmp" aria-label="Compare with"><option value="">Compare with&hellip;</option>';
  SITES.forEach(function(o){if(o!==s)c+='<option value="'+o.id+'">'+o.mission+' ('+o.planet+')</option>'});
  $("p-cmp").innerHTML=c+'</select></div><div id="cmpOut"></div>';
  $("cmp").onchange=function(){compare(s,this.value)};
  showTab("over");
}
function compare(a,id){
  var b=SITES.filter(function(x){return x.id===id})[0],out=$("cmpOut");
  if(!b){out.innerHTML="";return}
  var h="<table><tr><th></th><th>"+a.mission+"</th><th>"+b.mission+"</th></tr>";
  h+="<tr><td>Landed</td><td>"+a.landed+"</td><td>"+b.landed+"</td></tr>";
  STATS.forEach(function(f){h+="<tr><td>"+f[0]+"</td><td>"+val(a,f[1])+"</td><td>"+val(b,f[1])+"</td></tr>"});
  out.innerHTML=h+"</table>";
}
/* tabs */
function showTab(t){
  document.querySelectorAll("#tabs button").forEach(function(b){b.classList.toggle("on",b.dataset.t===t)});
  ["over","left","tvn","cmp"].forEach(function(k){$("p-"+k).classList.toggle("on",k===t)});
}
document.querySelectorAll("#tabs button").forEach(function(b){b.onclick=function(){showTab(b.dataset.t)}});

function openSite(s){
  var g=P[s.planet];spinning=false;activeSite=s;
  var ty=Math.atan2(-s.pos.x,s.pos.z),d=ty-(g.rotation.y%6.28318);
  d=Math.atan2(Math.sin(d),Math.cos(d));
  tween={g:g,yf:g.rotation.y,yt:g.rotation.y+d,xf:g.rotation.x,xt:Math.atan2(s.pos.y,Math.hypot(s.pos.x,s.pos.z)),t:0};
  fillPanel(s);panelOpen=true;$("panel").classList.add("open");
  SITES.forEach(function(o){o.el.classList.toggle("active",o===s)});
}
function closePanel(){panelOpen=false;spinning=true;activeSite=null;$("panel").classList.remove("open");SITES.forEach(function(o){o.el.classList.remove("active")})}

/* =====================================================================
   BUILD + LOOP
   ===================================================================== */
function init(){
  P.moon=makePlanet("moon");
  P.mars=makePlanet("mars",0,0xd98a5c);
  cur={moon:{x:-2.4,y:.1,s:.001},mars:{x:2.4,y:.1,s:.001}};
  /* pins */
  SITES.forEach(function(s){
    s.pos=ll(s.lat,s.lon,PIN_R);
    var b=document.createElement("button");b.className="pin";b.setAttribute("aria-label",s.mission+" at "+s.name);
    b.innerHTML="<i></i><em>"+s.mission+"</em>";b.onclick=function(){openSite(s)};
    pinsEl.appendChild(b);s.el=b;
  });
  ["moon","mars"].forEach(function(k){
    var n=SITES.filter(function(s){return s.planet===k}).length;
    $("n-"+k).textContent=n+" landing sites";
  });
  setView("home");
  $("loader").classList.add("done");
  frame();
}

var proj=new THREE.Vector3();
function frame(){
  var t=targets(),T=performance.now()*.001;
  // gentle camera parallax
  camera.position.x+=((mouse.x*.35)-camera.position.x)*.04;
  camera.position.y+=((mouse.y*.2)-camera.position.y)*.04;
  camera.position.z=narrow()?9.5:7.6;camera.lookAt(0,0,0);
  starsA.rotation.y=T*.004;starsB.rotation.y=T*.006;

  // hover
  var hv=(view==="home"&&!drag)?pick():null;
  hovered=hv||hovered;if(!hv&&!drag)hovered=null;
  canvas.style.cursor=hv?"pointer":(view==="planet"?"grab":"default");

  ["moon","mars"].forEach(function(k){
    var c=cur[k],tg=t[k],g=P[k],boost=(hv===g?1.05:1);
    c.x+=(tg.x-c.x)*.07;c.y+=(tg.y-c.y)*.07;c.s+=(tg.s*boost-c.s)*.07;
    g.position.set(c.x,c.y,0);g.scale.setScalar(c.s);g.visible=c.s>.05;
    if(spinning&&!(drag&&drag.moved))g.rotation.y+=view==="home"?(k==="moon"?.0028:.0034):.0016;
  });
  if(tween){
    tween.t=Math.min(1,tween.t+.028);var e=1-Math.pow(1-tween.t,3);
    tween.g.rotation.y=tween.yf+(tween.yt-tween.yf)*e;
    tween.g.rotation.x=tween.xf+(tween.xt-tween.xf)*e;
    if(tween.t>=1)tween=null;
  }
  renderer.render(scene,camera);

  // home labels under each world
  document.querySelectorAll(".plabel").forEach(function(l){
    var k=l.dataset.go,c=cur[k];
    if(view!=="home"||c.s<.4){l.style.display="none";return}
    proj.set(c.x,c.y-c.s*1.22,0).project(camera);
    l.style.display="block";l.style.left=((proj.x+1)/2*innerWidth)+"px";l.style.top=((1-proj.y)/2*innerHeight)+"px";
  });
  // pins
  SITES.forEach(function(s){
    if(view!=="planet"||s.planet!==selected){s.el.style.display="none";return}
    var g=P[s.planet],w=s.pos.clone();g.localToWorld(w);
    var nrm=w.clone().sub(g.position).normalize(),toCam=camera.position.clone().sub(w).normalize();
    if(nrm.dot(toCam)<.12){s.el.style.display="none";return}
    var p=w.project(camera);
    s.el.style.display="block";s.el.style.left=((p.x+1)/2*innerWidth)+"px";s.el.style.top=((1-p.y)/2*innerHeight)+"px";
  });
  requestAnimationFrame(frame);
}

/* loader */
// Let the loader paint before generating the worlds.
setTimeout(init,60);
})();
