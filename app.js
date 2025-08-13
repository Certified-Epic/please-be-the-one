// Simplified interactive star chart prototype
const CONFIG = await (await fetch('config.json')).json();
let achievements = await (await fetch('achievements.json')).json();

// Basic starfield
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
function resize(){canvas.width = innerWidth; canvas.height = innerHeight}
addEventListener('resize', resize); resize();
const stars = Array.from({length:140}, () => ({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.6,alpha:0.2+Math.random()*0.8}));
function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let s of stars){
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,'+(s.alpha*0.6)+')';
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fill();
  }
}
setInterval(() => {
  // twinkle
  for(let s of stars) s.alpha = 0.1 + Math.random()*0.9;
  drawStars();
}, 900);

// Stage
const stage = document.getElementById('planets');
const center = {x:stage.clientWidth/2, y:stage.clientHeight/2};
const coreImg = document.getElementById('center-geom');

// Create 5 core planets evenly on ring
const coreCount = 5;
const orbitRadius = CONFIG.orbitRadius || 280;
const corePlanets = [];
const planetNames = achievements.planets.map(p => p.planetName);
for(let i=0;i<coreCount;i++){
  const angle = (i/coreCount) * Math.PI*2 - Math.PI/2;
  const x = center.x + Math.cos(angle)*orbitRadius;
  const y = center.y + Math.sin(angle)*orbitRadius;
  const pData = achievements.planets[i] || achievements.planets[i % achievements.planets.length];
  const el = document.createElement('div');
  el.className = 'planet';
  el.style.left = (x - CONFIG.planetSize/2) + 'px';
  el.style.top = (y - CONFIG.planetSize/2) + 'px';
  el.style.width = CONFIG.planetSize + 'px';
  el.style.height = CONFIG.planetSize + 'px';
  el.dataset.planetIndex = i;
  el.innerHTML = `
    <div class="rings">
      <div class="orb" style="transform:scale(1.06);"></div>
      <div class="orb" style="transform:scale(1.22);opacity:0.5"></div>
    </div>
    <img class="planetImg" src="${pData.icon || 'assets/planet_screenshot.png'}" />
    <div class="label">${pData.planetName}</div>
  `;
  stage.appendChild(el);
  corePlanets.push({el, data:pData, x, y});
  // hover sound
  el.addEventListener('mouseenter', () => playHover());
  el.addEventListener('click', (e) => { openPlanet(i); });
}

// Play hover / zoom audio
function playHover(){ try{ const a = new Audio('https://files.catbox.moe/kftxci.mp3'); a.volume = 0.6; a.play(); }catch(e){} }

// Open planet (zoom)
const panel = document.getElementById('panel');
const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', closePanel);
function openPlanet(idx){
  const p = corePlanets[idx];
  document.getElementById('planetTitle').textContent = p.data.planetName;
  renderAchievements(p.data);
  panel.classList.remove('hidden');
  playHover();
}
function closePanel(){
  panel.classList.add('hidden');
  document.getElementById('achievementsContainer').innerHTML = '';
}

// Render achievements on panel from achievements.json
function renderAchievements(planetData){
  const container = document.getElementById('achievementsContainer');
  container.innerHTML = '';
  for(const tier of planetData.tiers){
    for(const a of tier.achievements.slice(0,20)){ // limit display
      const node = document.createElement('div');
      node.className = 'node ' + (a.status || '');
      node.innerHTML = `
        <div class="icon">${a.status === 'locked' ? '🔒' : a.status === 'available' ? '❤' : '✓'}</div>
        <div class="meta"><strong>${a.title}</strong><div class="desc">${a.description}</div></div>
      `;
      node.addEventListener('mouseenter', ()=>{ /* projector scan effect */ node.style.boxShadow='0 0 18px rgba(255,255,255,0.06)'; });
      node.addEventListener('mouseleave', ()=>{ node.style.boxShadow='none'; });
      node.addEventListener('click', ()=>{ showDetail(a); });
      container.appendChild(node);
    }
  }
}

function showDetail(a){
  const modal = document.createElement('div');
  modal.style.position='fixed';modal.style.left='50%';modal.style.top='50%';modal.style.transform='translate(-50%,-50%)';
  modal.style.padding='18px';modal.style.background='rgba(6,6,8,0.95)';modal.style.zIndex=60;borderRadius='8px';
  modal.style.border='1px solid rgba(255,255,255,0.06)';
  modal.innerHTML = `<h3>${a.title}</h3><p>${a.description}</p>`;
  const btn = document.createElement('button'); btn.textContent = a.status === 'completed' ? 'Completed' : 'Complete';
  btn.addEventListener('click', ()=>{ a.status='completed'; // reflect to achievements object and localStorage
    saveAchievements();
    document.body.removeChild(modal);
    renderAchievements(findPlanet(a.planet));
  });
  modal.appendChild(btn);
  document.body.appendChild(modal);
}

// Helpers
function findPlanet(name){ return achievements.planets.find(p=>p.planetName===name) }
function saveAchievements(){
  try{
    localStorage.setItem('achievements_data', JSON.stringify(achievements));
    // update displayed panel if open
    const t = document.getElementById('planetTitle').textContent;
    const pd = findPlanet(t);
    if(pd) renderAchievements(pd);
  }catch(e){ console.error(e) }
}

// Load from local storage if present
const local = localStorage.getItem('achievements_data');
if(local){ achievements = JSON.parse(local); }

// ADMIN UI
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');
const adminLogin = document.getElementById('adminLogin');
const adminPass = document.getElementById('adminPass');
const editor = document.getElementById('editor');
const jsonEditor = document.getElementById('jsonEditor');
const adminBtn = document.getElementById('adminToggle');
adminToggle.addEventListener('click', ()=> adminPanel.classList.toggle('hidden'));
adminLogin.addEventListener('click', ()=>{
  const pass = adminPass.value || '';
  if(pass === 'letmein'){ // client-side password for prototype
    editor.classList.remove('hidden'); jsonEditor.value = JSON.stringify(achievements, null, 2);
  } else {
    alert('Incorrect password (prototype uses "letmein")');
  }
});
document.getElementById('saveJson').addEventListener('click', ()=>{
  try{
    achievements = JSON.parse(jsonEditor.value);
    saveAchievements();
    alert('Saved to localStorage');
  }catch(e){ alert('Invalid JSON'); }
});
document.getElementById('downloadJson').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(achievements, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download='achievements.json'; a.click();
});
document.getElementById('bulkUnlock').addEventListener('click', ()=>{
  // unlock tier 1 achievements for all planets
  for(const p of achievements.planets){
    const t1 = p.tiers.find(t=>t.tierNumber===1);
    if(t1) for(const a of t1.achievements) a.status = 'completed';
  }
  saveAchievements(); alert('Tier 1 unlocked (locally)');
});

