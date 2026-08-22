/* ════════════════════════════════════════════════════════════════════════
   SHARED DATA & STORAGE
   Used by: Home (index.html) and My Account (account.html)
   — the list of all Lost/Found posts, and basic helpers.
   ════════════════════════════════════════════════════════════════════════ */
const ICONS={Phone:'📱',Wallet:'👜',Keys:'🔑','ID Card':'🪪',Books:'📚',Others:'📦','':'📦'};
let items=JSON.parse(localStorage.getItem('findit2')||'[]');
function save(){localStorage.setItem('findit2',JSON.stringify(items))}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// Fills in 5 sample posts the very first time the app runs (empty storage).
function seedIfEmpty(){
  if(items.length) return;
  items=[
    {id:'d1',type:'lost',name:'Black iPhone 14',cat:'Phone',date:'2025-06-01',loc:'Library 2nd Floor',desc:'Black phone, cracked back glass, blue case sticker',contact:'09123456789',photo:'',status:'active',created:new Date().toISOString()},
    {id:'d2',type:'found',name:'Blue Leather Wallet',cat:'Wallet',date:'2025-06-02',loc:'Cafeteria entrance',desc:'Blue wallet with some cash and cards inside',contact:'09987654321',photo:'',status:'active',created:new Date().toISOString()},
    {id:'d3',type:'lost',name:'Student ID Card',cat:'ID Card',date:'2025-06-03',loc:'Gym entrance',desc:'2nd year student ID, name visible on front',contact:'student@example.com',photo:'',status:'recovered',created:new Date().toISOString()},
    {id:'d4',type:'found',name:'Key Bunch (3 keys)',cat:'Keys',date:'2025-06-04',loc:'Parking Lot B',desc:'3 keys on a red keyring, found near lot entrance',contact:'09111222333',photo:'',status:'active',created:new Date().toISOString()},
    {id:'d5',type:'lost',name:'Calculus Textbook',cat:'Books',date:'2025-06-05',loc:'Room 204, Building A',desc:'Yellow cover, name written inside front cover',contact:'09444555666',photo:'',status:'active',created:new Date().toISOString()},
  ];
  save();
}

/* ════════════════════════════════════════════════════════════════════════
   LOGIN / SIGN UP PAGE  (login.html)
   Session + account storage, used here to log in/sign up, and also on
   every other page as a route guard (to check who's currently logged in).
   ════════════════════════════════════════════════════════════════════════ */
function getSession(){return JSON.parse(localStorage.getItem('findit2_session')||'null')}
function setSession(s){localStorage.setItem('findit2_session',JSON.stringify(s))}
function clearSession(){localStorage.removeItem('findit2_session')}
function getUsers(){return JSON.parse(localStorage.getItem('findit2_users')||'[]')}
function saveUsers(u){localStorage.setItem('findit2_users',JSON.stringify(u))}

// Call at the top of any page that requires login. Redirects to login.html
// and returns null if nobody is logged in; otherwise returns the session.
function requireLogin(){
  const s=getSession();
  if(!s){window.location.href='login.html';return null}
  return s;
}
function logout(){clearSession();window.location.href='login.html'}

// Use on pages that need a real account (Report Item, My Account).
// Guests get redirected to login.html with an explanatory toast.
function requireFullAccount(){
  const s=requireLogin();
  if(!s) return null;
  if(s.guest){
    toast('⚠️ Please sign up or log in to continue');
    window.location.href='login.html';
    return null;
  }
  return s;
}

// ---- LOGIN / SIGN UP PAGE: form behaviour (tabs, submit, guest button) ----
function setAuthTab(t){
  document.getElementById('tab-login').className='type-tab'+(t==='login'?' active is-auth':'');
  document.getElementById('tab-signup').className='type-tab'+(t==='signup'?' active is-auth':'');
  document.getElementById('login-fields').style.display=t==='login'?'block':'none';
  document.getElementById('signup-fields').style.display=t==='signup'?'block':'none';
}

function doLogin(){
  const contact=document.getElementById('li-contact').value.trim();
  const pw=document.getElementById('li-pw').value;
  if(!contact||!pw){toast('⚠️ Please fill in all fields');return}
  const u=getUsers().find(x=>x.contact.toLowerCase()===contact.toLowerCase()&&x.password===pw);
  if(!u){toast('❌ Incorrect phone/email or password');return}
  setSession({name:u.name,contact:u.contact});
  window.location.href='index.html';
}

function doSignup(){
  const name=document.getElementById('su-name').value.trim();
  const contact=document.getElementById('su-contact').value.trim();
  const pw=document.getElementById('su-pw').value;
  const pw2=document.getElementById('su-pw2').value;
  if(!name||!contact||!pw||!pw2){toast('⚠️ Please fill in all fields');return}
  if(pw!==pw2){toast('⚠️ Passwords do not match');return}
  const users=getUsers();
  if(users.some(x=>x.contact.toLowerCase()===contact.toLowerCase())){toast('⚠️ An account with this phone/email already exists');return}
  users.push({name,contact,password:pw});
  saveUsers(users);
  setSession({name,contact});
  window.location.href='index.html';
}

// Continue without an account — can browse Home, but Report Item and
// My Account still require a real signed-up account (see requireFullAccount).
function continueAsGuest(){
  setSession({name:'Guest',contact:'',guest:true});
  window.location.href='index.html';
}

// Toggle a password field between hidden/visible text, flipping the eye icon.
function togglePw(inputId,btn){
  const el=document.getElementById(inputId);
  const hidden=el.type==='password';
  el.type=hidden?'text':'password';
  btn.textContent=hidden?'🙈':'👁️';
}
// Pressing Enter in a field moves focus to the next field instead of submitting.
function focusNext(e,nextId){
  if(e.key==='Enter'){e.preventDefault();const nxt=document.getElementById(nextId);if(nxt)nxt.focus();}
}
// Pressing Enter on the last field of a form triggers its submit function.
function submitOnEnter(e,fn){
  if(e.key==='Enter'){e.preventDefault();fn();}
}

/* ════════════════════════════════════════════════════════════════════════
   DARK / LIGHT MODE
   The theme toggle switch itself only appears on My Account (account.html),
   but the "which theme is active" check runs via a tiny inline <script> in
   the <head> of every page, before this file even loads (avoids flashing).
   ════════════════════════════════════════════════════════════════════════ */
function getTheme(){return localStorage.getItem('findit2_theme')||'light'}
function applyStoredTheme(){document.documentElement.classList.toggle('dark',getTheme()==='dark')}
function setTheme(t){
  localStorage.setItem('findit2_theme',t);
  document.documentElement.classList.toggle('dark',t==='dark');
  updateThemeToggleUI();
}
function toggleTheme(){setTheme(getTheme()==='dark'?'light':'dark')}
// Updates the sun/moon icon on the switch — only exists on My Account page.
function updateThemeToggleUI(){
  const knob=document.getElementById('theme-knob');
  if(knob) knob.textContent=getTheme()==='dark'?'🌙':'☀️';
}

/* ════════════════════════════════════════════════════════════════════════
   REPORT ITEM PAGE  (report.html)
   The Lost/Found submission form: tab switching, photo preview, submit.
   ════════════════════════════════════════════════════════════════════════ */
let curType='lost';

function setType(t){
  curType=t;
  document.getElementById('tab-lost').className='type-tab'+(t==='lost'?' active is-lost':'');
  document.getElementById('tab-found').className='type-tab'+(t==='found'?' active is-found':'');
  document.getElementById('lbl-date').innerHTML=(t==='lost'?'Date Lost':'Date Found')+' <span class="req">*</span>';
  document.getElementById('lbl-loc').innerHTML=(t==='lost'?'Location Lost':'Location Found')+' <span class="req">*</span>';
  document.getElementById('f-loc').placeholder=t==='lost'?'e.g. Library 2nd Floor':'e.g. Cafeteria entrance';
}

// Reads ?type=lost or ?type=found from the URL so links from other pages
// land on the correct tab.
function initReportPageFromQuery(){
  const params=new URLSearchParams(window.location.search);
  const t=params.get('type');
  setType(t==='found'?'found':'lost');
}

// Live-preview a selected photo in the report form's upload box.
function previewPhoto(input){
  const file=input.files[0];
  const img=document.getElementById('photo-preview-img');
  const empty=document.getElementById('photo-upload-empty');
  if(!file){img.style.display='none';img.src='';empty.style.display='flex';return}
  const r=new FileReader();
  r.onload=e=>{img.src=e.target.result;img.style.display='block';empty.style.display='none';};
  r.readAsDataURL(file);
}

function submitItem(){
  const nameEl=document.getElementById('f-name');
  const catEl=document.getElementById('f-cat');
  const dateEl=document.getElementById('f-date');
  const locEl=document.getElementById('f-loc');
  const contactEl=document.getElementById('f-contact');
  const name=nameEl.value.trim();
  const cat=catEl.value;
  const date=dateEl.value;
  const loc=locEl.value.trim();
  const desc=document.getElementById('f-desc').value.trim();
  const contact=contactEl.value.trim();
  const file=document.getElementById('f-photo').files[0];

  let ok=true;
  [[nameEl,name],[catEl,cat],[dateEl,date],[locEl,loc],[contactEl,contact]].forEach(([el,val])=>{
    if(!val){el.classList.add('input-error');ok=false}
    else el.classList.remove('input-error');
  });
  if(!ok){toast('⚠️ Please fill in the fields highlighted in red');return}

  const go=photo=>{
    const newId=Date.now()+'';
    const session=getSession();
    items.unshift({id:newId,type:curType,name,cat,date,loc,desc,contact,photo:photo||'',status:'active',created:new Date().toISOString(),reporterKey:session?session.contact:''});
    save();
    // Redirect to My Account so the user sees their new report confirmed.
    window.location.href='account.html?submitted=1';
  };
  if(file){const r=new FileReader();r.onload=e=>go(e.target.result);r.readAsDataURL(file)}else go('');
}

/* ════════════════════════════════════════════════════════════════════════
   HOME PAGE  (index.html)
   Filter tabs (All/Lost/Found/Recovered), search box, and the post feed.
   ════════════════════════════════════════════════════════════════════════ */
let dashboardFilter='all';

function renderDashboard(){
  document.getElementById('s-all').textContent=items.length;
  document.getElementById('s-lost').textContent=items.filter(i=>i.type==='lost'&&i.status!=='recovered').length;
  document.getElementById('s-found').textContent=items.filter(i=>i.type==='found'&&i.status!=='recovered').length;
  document.getElementById('s-recovered').textContent=items.filter(i=>i.status==='recovered').length;
  renderDashboardList();
}

function renderDashboardList(){
  let list;
  if(dashboardFilter==='all') list=items;
  else if(dashboardFilter==='lost') list=items.filter(i=>i.type==='lost'&&i.status!=='recovered');
  else if(dashboardFilter==='found') list=items.filter(i=>i.type==='found'&&i.status!=='recovered');
  else list=items.filter(i=>i.status==='recovered');

  const q=(document.getElementById('home-q')?.value||'').toLowerCase();
  const cat=document.getElementById('home-cat')?.value||'';
  list=list.filter(i=>
    (i.name.toLowerCase().includes(q)||i.loc.toLowerCase().includes(q)||(i.desc||'').toLowerCase().includes(q))
    &&(!cat||i.cat===cat)
  );

  const el=document.getElementById('recent-list');
  if(!list.length){
    el.innerHTML=`<div class="empty"><div class="empty-ico">🔎</div><h3>No posts found</h3><p>Try a different keyword or category.</p></div>`;
    return;
  }
  el.innerHTML=list.map(i=>{
    const cls=i.status==='recovered'?'recovered':i.type;
    const lbl=i.status==='recovered'?'✓ Recovered':i.type==='lost'?'Lost':'Found';
    return`<div class="recent-row" onclick="openModal('${i.id}')">
      <div class="recent-ico">${ICONS[i.cat]||'📦'}</div>
      <div class="recent-info">
        <div class="recent-name">${esc(i.name)}</div>
        <div class="recent-sub">📍 ${esc(i.loc)} &nbsp;·&nbsp; 📅 ${i.date}</div>
      </div>
      <div class="recent-right">
        <span class="badge ${cls}">${lbl}</span>
        <span class="cat-tag">${i.cat}</span>
      </div>
    </div>`;
  }).join('');
}

function setDashboardFilter(f){
  dashboardFilter=f;
  document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active'));
  document.querySelector(`.filter-tab[data-filter="${f}"]`).classList.add('active');
  renderDashboardList();
}

function initDashboardPage(){
  seedIfEmpty();
  renderDashboard();
}

/* ════════════════════════════════════════════════════════════════════════
   MY ACCOUNT PAGE  (account.html)
   Account info card + "My Reports" history list.
   (Dark/Light mode toggle lives here too — see the DARK / LIGHT MODE
   section above for the actual theme functions.)
   ════════════════════════════════════════════════════════════════════════ */
function renderHistory(){
  const session=getSession();
  const list=session?items.filter(i=>i.reporterKey===session.contact):[];
  const grid=document.getElementById('grid-history');
  if(!list.length){
    grid.innerHTML=`<div class="empty"><div class="empty-ico">🗂️</div><h3>No reports yet</h3><p>Items you report while logged in will show up here.</p></div>`;
    return;
  }
  grid.innerHTML=list.map(i=>{
    const cls=i.status==='recovered'?'recovered':i.type;
    const lbl=i.status==='recovered'?'✓ Recovered':i.type==='lost'?'Lost':'Found';
    return`<div class="card ${cls}" onclick="openModal('${i.id}')">
      <div class="card-thumb">${i.photo?`<img src="${esc(i.photo)}" alt=""/>`:(ICONS[i.cat]||'📦')}</div>
      <div class="card-body">
        <div class="card-top"><div class="card-name">${esc(i.name)}</div><span class="badge ${cls}">${lbl}</span></div>
        <div class="card-meta">
          <div class="meta-row"><span class="icon">📅</span>${i.date}</div>
          <div class="meta-row"><span class="icon">📍</span>${esc(i.loc)}</div>
        </div>
        <div class="card-footer"><span class="cat-tag">${ICONS[i.cat]||'📦'} ${i.cat}</span></div>
      </div>
    </div>`;
  }).join('');
}

function initAccountPage(){
  seedIfEmpty();
  const session=getSession();
  if(session){
    document.getElementById('acc-name').textContent=session.name;
    document.getElementById('acc-contact').textContent=session.contact;
  }
  updateThemeToggleUI();
  renderHistory();
  const params=new URLSearchParams(window.location.search);
  if(params.get('submitted')==='1') toast('✅ Item reported successfully!');
}

/* ════════════════════════════════════════════════════════════════════════
   POST MODAL — view / edit / recover / delete
   Shared by: Home (index.html) and My Account (account.html) — both
   pages have the same modal markup and open it the same way.
   ════════════════════════════════════════════════════════════════════════ */
function openModal(id){
  const i=items.find(x=>x.id===id);
  if(!i) return;
  window._mid=id;
  renderModalView(i);
  document.getElementById('overlay').style.display='flex';
}

function renderModalView(i){
  document.getElementById('m-name').textContent=i.name;
  const img=document.getElementById('m-img');
  img.innerHTML=i.photo?`<img src="${esc(i.photo)}" alt=""/>`:(ICONS[i.cat]||'📦');
  const cls=i.status==='recovered'?'recovered':i.type;
  const lbl=i.status==='recovered'?'✓ Recovered':i.type==='lost'?'🔴 Lost':'🟢 Found';
  document.getElementById('m-details').innerHTML=`
    <div class="detail-row"><span class="d-label">Status</span><span class="d-val"><span class="badge ${cls}">${lbl}</span></span></div>
    <div class="detail-row"><span class="d-label">Category</span><span class="d-val">${ICONS[i.cat]||'📦'} ${i.cat}</span></div>
    <div class="detail-row"><span class="d-label">${i.type==='lost'?'Date Lost':'Date Found'}</span><span class="d-val">${i.date}</span></div>
    <div class="detail-row"><span class="d-label">Location</span><span class="d-val">${esc(i.loc)}</span></div>
    ${i.desc?`<div class="detail-row"><span class="d-label">Description</span><span class="d-val">${esc(i.desc)}</span></div>`:''}
  `;
  document.getElementById('m-contact').innerHTML=`
    <div class="lbl">${i.type==='lost'?'Owner Contact':'Finder Contact'}</div>
    <div class="val">📞 ${esc(i.contact)}</div>
  `;
  const session=getSession();
  const isOwner=!!(session&&!session.guest&&session.contact&&i.reporterKey===session.contact);
  const acts=document.getElementById('m-actions');
  acts.innerHTML='';
  if(isOwner){
    if(i.status!=='recovered'){
      const b=document.createElement('button');
      b.className='btn btn-green';b.textContent='✅ Mark as Recovered';
      b.onclick=()=>markRec(i.id);acts.appendChild(b);
    }
    const e=document.createElement('button');
    e.className='btn btn-outline';e.textContent='✏️ Edit';
    e.onclick=()=>renderModalEdit(i);acts.appendChild(e);
    const d=document.createElement('button');
    d.className='btn btn-red';d.textContent='🗑 Delete';
    d.onclick=()=>delItem(i.id);acts.appendChild(d);
  }else{
    const note=document.createElement('div');
    note.style.cssText='font-size:.78rem;color:var(--muted);padding:.4rem 0';
    note.textContent='This report was submitted by another user.';
    acts.appendChild(note);
  }
}

function renderModalEdit(i){
  document.getElementById('m-details').innerHTML=`
    <div class="field"><label>Item Name</label><input class="input" id="e-name" value="${esc(i.name)}"/></div>
    <div class="fields-2">
      <div class="field"><label>Category</label>
        <select class="input" id="e-cat">
          ${['Phone','Wallet','Keys','ID Card','Books','Others'].map(c=>`<option ${c===i.cat?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Date</label><input class="input" type="date" id="e-date" value="${i.date}"/></div>
    </div>
    <div class="field"><label>Location</label><input class="input" id="e-loc" value="${esc(i.loc)}"/></div>
    <div class="field"><label>Description</label><textarea class="input" id="e-desc">${esc(i.desc||'')}</textarea></div>
    <div class="field">
      <label>Photo <span class="opt-lbl">(optional)</span></label>
      <div class="photo-upload" onclick="document.getElementById('e-photo').click()">
        <div class="photo-upload-empty" id="e-photo-empty" style="${i.photo?'display:none':''}">
          <div class="pu-icon">📷</div><div class="pu-text">Tap to add a photo</div>
        </div>
        <img id="e-photo-preview" src="${i.photo?esc(i.photo):''}" style="${i.photo?'':'display:none'}" alt="Preview"/>
      </div>
      <input type="file" id="e-photo" accept="image/*" style="display:none" onchange="previewEditPhoto(this)"/>
    </div>
  `;
  window._editPhoto=i.photo||'';
  document.getElementById('m-contact').innerHTML=`
    <div class="field" style="margin-bottom:0"><label>Contact Info</label><input class="input" id="e-contact" value="${esc(i.contact)}"/></div>
  `;
  const acts=document.getElementById('m-actions');
  acts.innerHTML='';
  const saveBtn=document.createElement('button');
  saveBtn.className='btn btn-primary';saveBtn.textContent='💾 Save Changes';
  saveBtn.onclick=()=>saveEdit(i.id);acts.appendChild(saveBtn);
  const cancelBtn=document.createElement('button');
  cancelBtn.className='btn btn-outline';cancelBtn.textContent='Cancel';
  cancelBtn.onclick=()=>openModal(i.id);acts.appendChild(cancelBtn);
}

// Live-preview a newly selected photo while editing a post.
function previewEditPhoto(input){
  const file=input.files[0];
  if(!file) return;
  const r=new FileReader();
  r.onload=e=>{
    window._editPhoto=e.target.result;
    const img=document.getElementById('e-photo-preview');
    img.src=e.target.result;img.style.display='block';
    document.getElementById('e-photo-empty').style.display='none';
  };
  r.readAsDataURL(file);
}

function saveEdit(id){
  const i=items.find(x=>x.id===id);
  if(!i) return;
  const name=document.getElementById('e-name').value.trim();
  const cat=document.getElementById('e-cat').value;
  const date=document.getElementById('e-date').value;
  const loc=document.getElementById('e-loc').value.trim();
  const desc=document.getElementById('e-desc').value.trim();
  const contact=document.getElementById('e-contact').value.trim();
  if(!name||!cat||!date||!loc||!contact){toast('⚠️ Please fill in all required fields');return}
  i.name=name;i.cat=cat;i.date=date;i.loc=loc;i.desc=desc;i.contact=contact;
  i.photo=window._editPhoto||'';
  save();
  toast('✅ Changes saved!');
  openModal(id);
  refreshCurrentPage();
}

function closeModal(){document.getElementById('overlay').style.display='none'}
function closeOuter(e){if(e.target.id==='overlay')closeModal()}

/* ════════════════════════════════════════════════════════════════════════
   CUSTOM CONFIRM DIALOG — styled replacement for the browser's confirm()
   Shared by: Home (index.html) and My Account (account.html).
   ════════════════════════════════════════════════════════════════════════ */
function showConfirm(message,onYes){
  document.getElementById('confirm-message').textContent=message;
  window._confirmCallback=onYes;
  document.getElementById('confirm-overlay').style.display='flex';
}
function closeConfirm(){
  document.getElementById('confirm-overlay').style.display='none';
  window._confirmCallback=null;
}
function confirmYes(){
  const cb=window._confirmCallback;
  closeConfirm();
  if(cb) cb();
}

// After a change, refresh whichever render function exists on the current page.
function refreshCurrentPage(){
  if(document.getElementById('recent-list')) renderDashboard();
  if(document.getElementById('grid-history')) renderHistory();
}

function markRec(id){
  const i=items.find(x=>x.id===id);if(i){i.status='recovered';save();}
  closeModal();toast('🎉 Marked as recovered!');
  refreshCurrentPage();
}
function delItem(id){
  showConfirm('Delete this item? This cannot be undone.',()=>{
    items=items.filter(x=>x.id!==id);save();
    closeModal();toast('Deleted.');
    refreshCurrentPage();
  });
}

/* ════════════════════════════════════════════════════════════════════════
   TOAST — small popup notification
   Shared by: every page (login, Home, Report Item, My Account).
   ════════════════════════════════════════════════════════════════════════ */
function toast(msg){
  const t=document.createElement('div');t.className='toast';t.textContent=msg;
  document.body.appendChild(t);setTimeout(()=>t.remove(),3000);
}
