// script.cleaned.a.js — cleaned (behavior-preserving)

// helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const on = (el, ev, sel, fn) => {
  if (typeof sel === 'function') { el.addEventListener(ev, sel); return; }
  el.addEventListener(ev, e => {
    if (!(e.target instanceof Element)) return;
    const t = e.target.closest(sel);
    if (t) fn(e, t);
  });
};
const onceStyle = (id, css) => { if ($('#' + id)) return; const st = document.createElement('style'); st.id = id; st.textContent = css; document.head.appendChild(st); };

// shared styles used by JS
onceStyle('__shared_js_styles', `
@keyframes ripple{to{transform:scale(4);opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
.ripple{position:absolute;border-radius:50%;pointer-events:none;animation:ripple .6s linear;opacity:.95}
.loading-spinner{display:inline-block;width:16px;height:16px;border:2px solid #fff;border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;margin-right:8px}
`);

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Website loaded!');
  init();
  if ($('.profile-card')) { addProfileAnimations(); setupProfilePage(); }
  if ($('.hero')) { addHomepageAnimations(); setupHomepage(); }
  if ($('#contactForm')) setupContactForm();
});

/* ---------- Init & event delegation ---------- */
function init(){
  initializeWebsite();
  setupProjectGallery();
  setupGlobalListeners();
  setupStatusManagement();
  loadSavedStatus();
  setTimeout(()=> animateElements('.latihan-card, .gallery-item, .journey-card, .tech-category'), 100);
}

function setupGlobalListeners(){
  // navbar scroll (debounced)
  window.addEventListener('scroll', debounce(()=> {
    const nav = $('.navbar'); if(!nav) return;
    const on = window.scrollY > 100;
    nav.style.background = on ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)';
    nav.style.boxShadow = on ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.1)';
  }, 50));

  // active nav
  setActiveNav();

  // hover / click effects via delegation
  on(document, 'mouseenter', '.latihan-card, .journey-card, .tech-category, .gallery-item', (e, el) => el.style.transform = 'translateY(-5px)');
  on(document, 'mouseleave', '.latihan-card, .journey-card, .tech-category, .gallery-item', (e, el) => el.style.transform = 'translateY(0)');

  // button press-scale + ripple (delegated)
  on(document, 'mousedown', '.btn, .action-btn', (e, el) => el.style.transform = 'scale(.95)');
  on(document, 'mouseup', '.btn, .action-btn', (e, el) => el.style.transform = 'scale(1)');
  on(document, 'mouseleave', '.btn, .action-btn', (e, el) => el.style.transform = 'scale(1)');
  on(document, 'click', '.btn, .action-btn', (e, el) => {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    Object.assign(span.style, {
      width: size+'px', height: size+'px',
      left: (e.clientX-rect.left-size/2)+'px',
      top: (e.clientY-rect.top-size/2)+'px',
      background: 'rgba(255,255,255,0.6)', transform:'scale(0)', position:'absolute'
    });
    el.style.position = el.style.position || 'relative';
    el.appendChild(span);
    setTimeout(()=> span.remove(), 620);
  });
}

/* ---------- Notification ---------- */
function showNotification(msg, type='info'){
  const existing = document.querySelector('.custom-notification');
  if (existing) existing.remove();
  const colors = {success:'#28a745', error:'#dc3545', info:'#007bff', warning:'#ffc107'};
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-notification';
  wrapper.style.cssText = `
    position:fixed;top:20px;right:20px;background:${colors[type]||colors.info};color:#fff;padding:1rem 1.25rem;border-radius:8px;
    box-shadow:0 4px 15px rgba(0,0,0,.2);z-index:10000;transform:translateX(100%);transition:transform .3s ease;max-width:320px;font-weight:500;
  `;
  wrapper.innerHTML = `<div class="notification-content"><span class="notification-text">${msg}</span></div>`;
  document.body.appendChild(wrapper);
  requestAnimationFrame(()=> wrapper.style.transform='translateX(0)');
  setTimeout(()=> { wrapper.style.transform='translateX(100%)'; setTimeout(()=> wrapper.remove(), 300); }, 3000);
}

/* ---------- Status / Modal ---------- */
let currentModule = null;
function setupStatusManagement(){
  on(document, 'click', '.module-badge', (e, el) => { e.preventDefault(); openStatusModal(el); });

  if ($('#statusModal')) {
    on(document, 'click', '.status-option', (e, el) => {
      $$('.status-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
    });
    on(document, 'click', '.close-modal, #cancelStatus', closeStatusModal);
    on(document, 'click', '#confirmStatus', confirmStatusChange);
    on(document, 'click', '#statusModal', (e, el) => { if(e.target === el) closeStatusModal(); });
  }
}

function openStatusModal(badge){
  currentModule = badge.getAttribute('data-module');
  $$('.status-option').forEach(opt => opt.classList.remove('selected'));
  const cur = getCurrentStatus(badge);
  if (cur) { const sel = document.querySelector(`.status-option[data-status="${cur}"]`); if (sel) sel.classList.add('selected'); }
  const modal = $('#statusModal'); if (modal){ modal.style.display='block'; document.body.style.overflow='hidden'; }
}
function closeStatusModal(){ const m = $('#statusModal'); if(m){ m.style.display='none'; document.body.style.overflow='auto'; } currentModule = null; }

function confirmStatusChange(){
  const sel = document.querySelector('.status-option.selected');
  if (!sel || !currentModule) { showNotification('Pilih status terlebih dahulu!', 'error'); return; }
  const newStatus = sel.getAttribute('data-status');
  const badge = document.querySelector(`.module-badge[data-module="${currentModule}"]`);
  if (badge) {
    badge.className = 'module-badge ' + newStatus;
    badge.textContent = {completed:'Completed', 'in-progress':'In Progress', 'coming-soon':'Coming Soon'}[newStatus] || newStatus;
    saveStatus(currentModule, newStatus);
    showNotification({completed:'Modul telah diselesaikan! 🎉','in-progress':'Sedang mengerjakan modul! 🔄','coming-soon':'Modul akan datang! ⏳'}[newStatus], 'success');
  }
  closeStatusModal();
}
function getCurrentStatus(b){ if(!b) return null; if (b.classList.contains('completed')) return 'completed'; if (b.classList.contains('in-progress')) return 'in-progress'; if (b.classList.contains('coming-soon')) return 'coming-soon'; return null; }
function saveStatus(id, s){ const d = JSON.parse(localStorage.getItem('moduleStatus')||'{}'); d[id]=s; localStorage.setItem('moduleStatus', JSON.stringify(d)); }
function loadSavedStatus(){ const d = JSON.parse(localStorage.getItem('moduleStatus')||'{}'); Object.keys(d).forEach(id=>{ const b = document.querySelector(`.module-badge[data-module="${id}"]`); if(b){ b.className='module-badge '+d[id]; b.textContent = {completed:'Completed','in-progress':'In Progress','coming-soon':'Coming Soon'}[d[id]]||d[id]; } }); }

/* ---------- Contact form ---------- */
function setupContactForm(){
  const form = $('#contactForm'); if(!form) return;
  const iframe = $('#hidden_iframe');

  on(form, 'input', 'input,textarea', (e, el) => { el.classList.remove('input-error'); clearFieldError(el); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('input, textarea').forEach(f => { if(!f.value.trim()){ f.classList.add('input-error'); valid = false; } });
    if (!valid) { alert('Form belum lengkap!'); return; }

    const btn = form.querySelector("button[type='submit']");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Mengirim...';

    const onLoad = () => {
      const status = $('#contactStatus'); if(status) status.style.display = 'block';
      form.reset(); btn.disabled = false; btn.innerHTML = original;
      if (iframe) iframe.removeEventListener('load', onLoad);
    };

    if (iframe) {
      iframe.addEventListener('load', onLoad);
      form.submit();
    } else {
      setTimeout(() => {
        showNotification('Pesan berhasil dikirim! Saya akan membalas secepatnya 📩', 'success');
        const success = document.createElement('div');
        success.className = 'success-message';
        success.style.cssText = 'background:#d4edda;color:#155724;padding:1rem;border-radius:8px;margin-bottom:1rem;border:1px solid #c3e6cb';
        success.innerHTML = '<strong>✅ Pesan Terkirim!</strong><p style="margin:0.5rem 0 0 0;">Terima kasih. Saya akan membalas dalam 1x24 jam.</p>';
        form.parentNode.insertBefore(success, form);
        form.reset(); btn.innerHTML = original; btn.disabled = false;
        setTimeout(()=> success.remove(), 5000);
      }, 1200);
    }
  });
}

/* validation helpers */
function validateField(field){
  const v = field.value.trim();
  let ok = true, msg = '';
  clearFieldError(field);
  if (field.hasAttribute('required') && !v){ ok=false; msg='Field ini wajib diisi'; }
  if (field.type === 'email' && v){ const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if(!r.test(v)){ ok=false; msg='Format email tidak valid'; } }
  if (field.id==='name' && v && v.length < 2){ ok=false; msg='Nama minimal 2 karakter'; }
  if (field.id==='subject' && v && v.length < 5){ ok=false; msg='Subjek minimal 5 karakter'; }
  if (field.id==='message' && v && v.length < 10){ ok=false; msg='Pesan minimal 10 karakter'; }
  if (!ok) showFieldError(field, msg); else field.style.borderColor = '#28a745';
  return ok;
}
function showFieldError(field, message){
  field.style.borderColor = '#dc3545';
  const ex = field.parentNode.querySelector('.field-error'); if (ex) ex.remove();
  const div = document.createElement('div'); div.className='field-error';
  div.style.cssText = 'color:#dc3545;font-size:.875rem;margin-top:.25rem;'; div.textContent = message;
  field.parentNode.appendChild(div);
}
function clearFieldError(field){ field.style.borderColor = '#e9ecef'; const ex = field.parentNode.querySelector('.field-error'); if(ex) ex.remove(); }
function validateContactForm(form){ return Array.from(form.querySelectorAll('input[required],textarea[required]')).every(f => validateField(f)); }

/* ---------- Profile page functions ---------- */
function setupProfilePage(){
  animateProgressBars();
  setupTechTags();
  setupTargetItems();
  animateStatsCounter();
}
function animateProgressBars(){
  $$('.progress-fill').forEach(bar => {
    const w = bar.style.width || bar.getAttribute('data-width') || '0%';
    bar.style.width = '0%';
    setTimeout(()=> { bar.style.transition='width 1.5s ease-in-out'; bar.style.width = w; }, 400);
  });
}
function setupTechTags(){ on(document, 'click', '.tech-tag', (e, el) => { showNotification('Teknologi: '+el.textContent+' 🚀','info'); el.style.animation='pulse .5s'; setTimeout(()=> el.style.animation='',500); }); }
function setupTargetItems(){ on(document, 'click', '.target-item:not(.completed)', (e, el) => {
  const txt = (el.querySelector('span:last-child')||{textContent:''}).textContent;
  if (confirm(`Tandai "${txt}" sebagai selesai?`)){
    el.classList.add('completed'); const ic = el.querySelector('.target-icon'); if(ic) ic.textContent='✅';
    const span = el.querySelector('span:last-child'); if(span) span.style.color='white';
    showNotification(`Target "${txt}" berhasil diselesaikan! 🎉`,'success'); updateStatsCounter();
  }
}); }
function animateStatsCounter(){
  $$('.stat-number').forEach(stat => {
    const target = parseInt(stat.textContent)||0, dur=2000, steps=60, step=target/steps; let cur=0;
    const t = setInterval(()=> { cur+=step; if(cur>=target){ stat.textContent = target; clearInterval(t); } else stat.textContent = Math.floor(cur); }, dur/steps);
  });
}
function updateStatsCounter(){
  const done = $$('.target-item.completed').length, total = $$('.target-item').length || 1;
  const pct = Math.round((done/total)*100);
  const completedStat = $('.stat-number'); if (completedStat) completedStat.textContent = done;
  const progressFill = $('.progress-fill'); if (progressFill) progressFill.style.width = pct+'%';
  const pctEl = $('.progress-percentage'); if (pctEl) pctEl.textContent = pct+'%';
}
function addProfileAnimations(){
  onceStyle('__profile_anim', `
    @keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
    @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    .profile-card{animation:fadeInUp .8s ease-out}.detail-section{animation:fadeInUp .6s ease-out}
  `);
}

/* ---------- Homepage functions ---------- */
function setupHomepage(){
  setupTypingAnimation(); setupHomepageStatsCounter(); setupScrollAnimations(); setupParticleEffect();
}
function setupTypingAnimation(){
  const el = $('.typing-text'); if(!el) return;
  const txt = el.textContent; el.textContent=''; el.style.borderRight='3px solid #667eea';
  let i=0; const t = setInterval(()=> { if(i<txt.length) el.textContent+=txt.charAt(i++); else { clearInterval(t); setInterval(()=> el.style.borderRight = el.style.borderRight==='3px solid #667eea' ? '3px solid transparent' : '3px solid #667eea', 500); } }, 100);
}
function setupHomepageStatsCounter(){
  $$('.stat-number[data-target]').forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'))||0, dur=2000, steps=60, step=target/steps; let cur=0;
    const t = setInterval(()=> { cur+=step; if(cur>=target){ stat.textContent=target; clearInterval(t);} else stat.textContent=Math.floor(cur); }, dur/steps);
  });
}
function setupScrollAnimations(){
  const opts={threshold:.1, rootMargin:'0px 0px -50px 0px'};
  const obs = new IntersectionObserver((entries)=> entries.forEach(en => { if(en.isIntersecting){ en.target.style.opacity='1'; en.target.style.transform='translateY(0)'; } }), opts);
  $$('.stat-card, .feature-card').forEach(el => { el.style.opacity='0'; el.style.transform='translateY(30px)'; el.style.transition='all .6s ease'; obs.observe(el); });
}
function setupParticleEffect(){
  const hero = $('.hero'); if(!hero) return;
  const cont = document.createElement('div'); cont.className='__particles'; Object.assign(cont.style,{position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:'-1'});
  for(let i=0;i<15;i++){ const p=document.createElement('div'); Object.assign(p.style,{position:'absolute',width:'4px',height:'4px',background:'#667eea',borderRadius:'50%',opacity:'.3',left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animation:`float ${3+Math.random()*4}s ease-in-out infinite`,animationDelay:`${Math.random()*2}s`}); cont.appendChild(p); }
  hero.appendChild(cont);
}
function addHomepageAnimations(){
  onceStyle('__home_anim', `
    @keyframes ripple{to{transform:scale(4);opacity:0}}
    .hero h1{animation:fadeInUp .8s ease-out}.hero p{animation:fadeInUp .8s ease-out .2s both}.hero-actions{animation:fadeInUp .8s ease-out .4s both}
  `);
}

/* ---------- Utilities ---------- */
function initializeWebsite(){
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', function(e){
    const t = this.getAttribute('href'); if (t === '#') return;
    const el = document.querySelector(t); if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
  }));
  setTimeout(()=> animateElements('.latihan-card, .gallery-item, .journey-card, .tech-category'), 100);
}
function setActiveNav(){
  const page = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page==='' && href==='index.html') || (page==='/' && href==='index.html')) {
      link.style.color='#007bff'; link.style.background='rgba(0,123,255,0.1)'; link.style.fontWeight='600';
    } else { link.style.color=''; link.style.background=''; link.style.fontWeight=''; }
  });
}
function animateElements(sel){ $$(sel).forEach((el,i)=>{ el.style.opacity='0'; el.style.transform='translateY(20px)'; setTimeout(()=>{ el.style.transition='all .6s ease'; el.style.opacity='1'; el.style.transform='translateY(0)'; }, i*200); }); }
function debounce(fn, wait=100){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }

/* ---------- Project Gallery Enhancements ---------- */
function setupProjectGallery(){
  const items = $$('.gallery-item');
  if(!items.length) return;

  // subtle floating animation
  items.forEach((item,i)=>{
    item.style.position = 'relative';
    item.style.overflow = 'hidden';
    item.style.transition = 'transform .3s ease, box-shadow .3s ease';
    item.style.animation = `fadeInUp .6s ease ${i*0.1}s both`;
  });

  // tooltip-like detail on hover
  on(document, 'mouseenter', '.gallery-item', (e, el)=>{
    const detail = document.createElement('div');
    detail.className = 'gallery-hover';
    detail.textContent = el.getAttribute('data-detail') || 'Progress berlanjut...';
    Object.assign(detail.style,{
      position:'absolute',bottom:'10px',left:'10px',
      background:'rgba(0,0,0,0.7)',color:'#fff',
      padding:'6px 10px',borderRadius:'6px',fontSize:'0.85rem',
      opacity:'0',transform:'translateY(10px)',transition:'all .3s ease'
    });
    el.appendChild(detail);
    requestAnimationFrame(()=>{ detail.style.opacity='1'; detail.style.transform='translateY(0)'; });
  });

  on(document, 'mouseleave', '.gallery-item', (e, el)=>{
    const d = el.querySelector('.gallery-hover');
    if(d){ d.style.opacity='0'; d.style.transform='translateY(10px)'; setTimeout(()=>d.remove(),300); }
  });
}

/* expose limited API for compatibility */
window.websiteApp = { showNotification, validateContactForm, animateElements };
