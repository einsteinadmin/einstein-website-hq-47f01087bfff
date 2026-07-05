/* EMC DRAFT FEEDBACK LAYER — shared across all draft pages (7/1/2026; keep/cut marks added 7/5/2026).
   Two ways to leave feedback:
   1) HIGHLIGHT any text → a 💬 button appears → add a note tied to that exact copy.
   2) 💬 pin on each section (subpages; homepage keeps its ♥ pins — both merge on export).
   3) ♥/✂ KEEP or CUT marks on individual workshop-panel copy variants (see window.emcCutMarks below) —
      shared schema with cut-list.html so in-page marks and the standalone ballot are ONE system.
   One store per browser origin → review on the HQ (github.io) or localhost, NOT file://,
   so notes from all pages aggregate. "Copy ALL feedback" outputs everything for Cameron, including
   the CUT LIST section built from emc-cutmarks-v1. */
(function(){
"use strict";
var KEY='emc-feedback-v1';
function load(){ try{ return JSON.parse(localStorage.getItem(KEY))||[]; }catch(e){ return []; } }
function save(l){ try{ localStorage.setItem(KEY,JSON.stringify(l)); }catch(e){} }
var PAGE=(location.pathname.split('/').pop()||'index.html').replace('.html','');
function secOf(node){
  var el = node && (node.nodeType===1 ? node : node.parentElement);
  var s = el && el.closest ? el.closest('section[id],header[id]') : null;
  return s ? s.id : '';
}
function combo(){ return document.body.getAttribute('data-combo')||''; }

/* ---- shared keep/cut marks store: emc-cutmarks-v1 ----
   { "<optionId>": { mark:"keep"|"cut", label:"<short human label>", group:"<group name>", page:"<page name>" } }
   Un-marked options are simply absent. Same option id can only be keep OR cut — setting one clears the other.
   Exposed as window.emcCutMarks so every fidelity page + cut-list.html share one API + one schema. */
var CM_KEY='emc-cutmarks-v1';
function cmLoad(){ try{ return JSON.parse(localStorage.getItem(CM_KEY))||{}; }catch(e){ return {}; } }
function cmSave(o){ try{ localStorage.setItem(CM_KEY,JSON.stringify(o)); }catch(e){} }
function cmGet(id){ var all=cmLoad(); return all[id] || null; }
/* toggle(id, mark, meta) — meta = {label,group,page}. Clicking the active mark again un-marks (toggle off). */
function cmToggle(id, mark, meta){
  var all=cmLoad();
  var cur=all[id];
  if(cur && cur.mark===mark){ delete all[id]; }
  else { all[id] = { mark:mark, label:(meta&&meta.label)||id, group:(meta&&meta.group)||'', page:(meta&&meta.page)||PAGE }; }
  cmSave(all);
  return all[id] || null;
}
function cmAll(){ return cmLoad(); }
function cmClearAll(){ cmSave({}); }
window.emcCutMarks = { get:cmGet, toggle:cmToggle, all:cmAll, clearAll:cmClearAll, KEY:CM_KEY };

/* ---- styles ---- */
var css = document.createElement('style');
css.textContent =
'.fbk-fab{position:fixed;left:16px;bottom:74px;z-index:400;background:#0979C3;color:#fff;border:none;border-radius:999px;padding:12px 18px;font:600 13.5px Roboto,sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(11,16,20,.18)}' +
'.fbk-panel{position:fixed;left:16px;bottom:124px;z-index:401;width:270px;background:#1A2329;color:#EAEEF0;border-radius:14px;padding:16px;font:13px Roboto,sans-serif;box-shadow:0 8px 30px rgba(11,16,20,.3);display:none}' +
'.fbk-panel.open{display:block}' +
'.fbk-panel h5{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#F5A054}' +
'.fbk-panel button{width:100%;font:600 12.5px Roboto,sans-serif;border:none;border-radius:8px;padding:9px;cursor:pointer;margin-top:8px}' +
'.fbk-copy{background:#0979C3;color:#fff}.fbk-clear{background:transparent;color:#9AADB7;border:1px solid #3A4956!important}' +
'.fbk-panel .tip{font-size:10.5px;color:#8CA0AC;line-height:1.5;margin-top:8px}' +
'.fbk-bubble{position:absolute;z-index:402;background:#27343D;color:#fff;border:none;border-radius:999px;padding:7px 13px;font:600 12.5px Roboto,sans-serif;cursor:pointer;box-shadow:0 6px 20px rgba(11,16,20,.3)}' +
'.fbk-pin{position:absolute;top:14px;left:14px;z-index:5;background:#fff;border:1px solid #E2E3E4;border-radius:999px;padding:6px 10px;font:600 12.5px Roboto,sans-serif;color:#53575A;cursor:pointer;opacity:.7;box-shadow:0 2px 14px rgba(11,16,20,.05)}' +
'.fbk-pin:hover{opacity:1}.fbk-pin.has{background:#EBF4FB;border-color:#88C0E4;color:#065E9A;opacity:1}' +
'.fbk-modal{position:fixed;inset:0;z-index:600;background:rgba(11,16,20,.4);display:flex;align-items:flex-start;justify-content:center;padding:10vh 16px 0}' +
'.fbk-card{background:#1A2329;color:#EAEEF0;border-radius:14px;padding:18px;width:min(460px,100%);box-shadow:0 12px 40px rgba(11,16,20,.45);font:13px Roboto,sans-serif}' +
'.fbk-mtitle{font-size:12.5px;color:#9AADB7;line-height:1.5;margin-bottom:10px;max-height:76px;overflow:hidden}' +
'.fbk-card textarea{width:100%;box-sizing:border-box;background:#27343D;color:#fff;border:1px solid #3A4956;border-radius:8px;padding:10px 12px;font:14px/1.55 Roboto,sans-serif;resize:vertical;min-height:96px}' +
'.fbk-card textarea:focus{outline:2px solid #0979C3;outline-offset:1px}' +
'.fbk-mrow{display:flex;gap:8px;margin-top:10px}' +
'.fbk-mrow button{flex:1;font:600 12.5px Roboto,sans-serif;border:none;border-radius:8px;padding:9px;cursor:pointer}' +
'.fbk-msave{background:#0979C3;color:#fff}.fbk-mcancel{background:transparent;color:#9AADB7;border:1px solid #3A4956}' +
'.fbk-mhint{margin-top:8px;font-size:10.5px;color:#8CA0AC;text-align:center}' +
/* ---- keep/cut mini-buttons — shared across all workshop panels (7/5/2026) ---- */
'.fbk-km{display:inline-flex;gap:4px;flex:0 0 auto;margin-left:auto}' +
'.fbk-kbtn{width:24px;height:24px;min-width:24px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;font-size:12px;line-height:1;border-radius:999px;border:1px dashed #4A5866;background:transparent;color:#6B7A87;opacity:.55;cursor:pointer;padding:0;margin:0}' +
'.fbk-kbtn:hover{opacity:1;border-style:solid}' +
'.fbk-kbtn[aria-pressed="true"]{opacity:1;border-style:solid}' +
'.fbk-kbtn[aria-pressed="true"].fbk-keep{background:#3F7A33;border-color:#3F7A33;color:#fff}' +
'.fbk-kbtn[aria-pressed="true"].fbk-cut{background:#CC0100;border-color:#CC0100;color:#fff}' +
'.fbk-marked-keep{background:rgba(63,122,51,.14)!important;border-color:#3F7A33!important}' +
'.fbk-marked-cut{background:rgba(204,1,0,.10)!important;border-color:#CC0100!important;opacity:.75;text-decoration:line-through}';
document.head.appendChild(css);

/* ---- reusable keep/cut button pair builder ----
   emcCutMarks.buildButtons(id, meta, onChange, tintEl) → returns a <span class="fbk-km"> with ♥/✂ buttons wired.
   tintEl (optional) gets .fbk-marked-keep / .fbk-marked-cut toggled on it directly (green/red tint +
   strikethrough on cut, per spec) — pass the option row/button so the mark is visible without extra wiring.
   onChange(mark|null) fires after every toggle so callers can additionally re-tint their own row markup. */
window.emcCutMarks.buildButtons = function(id, meta, onChange, tintEl){
  var wrap = document.createElement('span'); wrap.className='fbk-km';
  var keep = document.createElement('button'); keep.type='button'; keep.className='fbk-kbtn fbk-keep'; keep.textContent='♡';
  keep.title='Keep as finalist'; keep.setAttribute('aria-label','Keep as finalist: '+((meta&&meta.label)||id));
  var cut = document.createElement('button'); cut.type='button'; cut.className='fbk-kbtn fbk-cut'; cut.textContent='✂';
  cut.title='Cut — won\'t use'; cut.setAttribute('aria-label','Cut, won\'t use: '+((meta&&meta.label)||id));
  function sync(){
    var cur = cmGet(id);
    var isKeep = cur && cur.mark==='keep', isCut = cur && cur.mark==='cut';
    keep.setAttribute('aria-pressed', isKeep ? 'true':'false');
    cut.setAttribute('aria-pressed', isCut ? 'true':'false');
    keep.textContent = isKeep ? '♥' : '♡'; /* 7/5 Cameron: only a marked option should read as a heart */
    if(tintEl){
      tintEl.classList.toggle('fbk-marked-keep', !!isKeep);
      tintEl.classList.toggle('fbk-marked-cut', !!isCut);
    }
  }
  keep.addEventListener('click', function(e){ e.stopPropagation(); cmToggle(id,'keep',meta); sync(); if(onChange) onChange(cmGet(id)); });
  cut.addEventListener('click', function(e){ e.stopPropagation(); cmToggle(id,'cut',meta); sync(); if(onChange) onChange(cmGet(id)); });
  wrap.appendChild(keep); wrap.appendChild(cut);
  sync();
  wrap._sync = sync;
  return wrap;
};

/* ---- note modal (replaces prompt(); multi-line, Esc cancels, Cmd/Ctrl+Enter saves) ---- */
function askNote(title, cb, opts){
  opts = opts || {};
  var old = document.querySelector('.fbk-modal'); if(old) old.remove();
  var m = document.createElement('div'); m.className='fbk-modal';
  m.innerHTML = '<div class="fbk-card" role="dialog" aria-modal="true" aria-label="Feedback note">'+
    '<div class="fbk-mtitle"></div>'+
    '<textarea rows="5" placeholder="Your note…"></textarea>'+
    '<div class="fbk-mrow"><button type="button" class="fbk-msave"></button><button type="button" class="fbk-mcancel">Cancel</button></div>'+
    '<div class="fbk-mhint">Esc to cancel · ⌘↩ to save</div></div>';
  m.querySelector('.fbk-mtitle').textContent = title;
  m.querySelector('.fbk-msave').textContent = opts.saveLabel || 'Save note';
  document.body.appendChild(m);
  var ta = m.querySelector('textarea');
  function close(){ m.remove(); document.removeEventListener('keydown', onKey, true); }
  function saveIt(){ var v = ta.value.trim(); if(!v && !opts.allowEmpty){ ta.focus(); return; } close(); cb(v); }
  function onKey(e){
    if(e.key==='Escape'){ e.stopPropagation(); close(); }
    else if((e.metaKey||e.ctrlKey) && e.key==='Enter'){ e.preventDefault(); saveIt(); }
  }
  document.addEventListener('keydown', onKey, true);
  m.querySelector('.fbk-msave').addEventListener('click', saveIt);
  m.querySelector('.fbk-mcancel').addEventListener('click', close);
  m.addEventListener('mousedown', function(e){ if(e.target===m) close(); });
  setTimeout(function(){ ta.focus(); }, 30);
}
window.emcAskNote = askNote;

/* ---- FAB + panel ---- */
var fab=document.createElement('button'); fab.className='fbk-fab'; fab.type='button';
var panel=document.createElement('div'); panel.className='fbk-panel';
panel.innerHTML='<h5>Draft feedback</h5><div class="fbk-count"></div>'+
  '<button class="fbk-copy" type="button">📋 Copy ALL feedback (for Cameron)</button>'+
  '<button class="fbk-clear" type="button">✕ Clear all</button>'+
  '<div class="tip">Highlight any text on the page → tap 💬 to comment on that exact copy. Or use the 💬 pin on a section. Notes from every page collect here (same browser).</div>';
document.body.appendChild(fab); document.body.appendChild(panel);
function refresh(){
  var l=load();
  fab.textContent='📝 Notes ('+l.length+')';
  var c=panel.querySelector('.fbk-count'); if(c) c.textContent=l.length+' note'+(l.length===1?'':'s')+' across all pages';
  document.querySelectorAll('.fbk-pin').forEach(function(p){
    var n=l.filter(function(e){return e.page===PAGE && e.sec===p.dataset.sec && !e.quote;}).length;
    p.textContent = n? '💬 '+n : '💬'; p.classList.toggle('has', n>0);
  });
}
fab.addEventListener('click',function(){ panel.classList.toggle('open'); });
panel.querySelector('.fbk-copy').addEventListener('click',function(){
  var l=load(), pins=[], marks=cmAll();
  try{ pins=JSON.parse(localStorage.getItem('ws-pins-v2'))||[]; }catch(e){}
  var markKeys=Object.keys(marks);
  if(!l.length && !pins.length && !markKeys.length){ this.textContent='Nothing yet'; var b=this; setTimeout(function(){b.textContent='📋 Copy ALL feedback (for Cameron)';},1200); return; }
  var lines=['EINSTEIN DRAFT FEEDBACK — '+new Date().toLocaleString()+' — send this to Cameron'];
  l.forEach(function(e){ lines.push('• ['+e.page+(e.sec?' → '+e.sec:'')+'] '+(e.quote?'RE: "'+e.quote+'" — ':'')+e.note+(e.combo?'  (combo: '+e.combo+')':'')); });
  pins.forEach(function(p){ lines.push('• [homepage-hybrid → '+p.sec+'] '+(p.note||'♥ loved it')+'  (combo: '+p.combo+')'); });
  if(markKeys.length){
    /* group by page then group, keeps before cuts */
    var byPage={};
    markKeys.forEach(function(id){
      var m=marks[id]; var pg=m.page||'(unknown page)';
      byPage[pg]=byPage[pg]||{}; var grp=m.group||'(ungrouped)';
      byPage[pg][grp]=byPage[pg][grp]||[]; byPage[pg][grp].push({id:id,mark:m.mark,label:m.label});
    });
    lines.push(''); lines.push('=== CUT LIST (keep/cut marks) ===');
    Object.keys(byPage).sort().forEach(function(pg){
      Object.keys(byPage[pg]).sort().forEach(function(grp){
        var entries=byPage[pg][grp];
        var keeps=entries.filter(function(e){return e.mark==='keep';});
        var cuts=entries.filter(function(e){return e.mark==='cut';});
        keeps.forEach(function(e){ lines.push('['+pg+'] '+grp+' — ♥ KEEP: '+e.label); });
        cuts.forEach(function(e){ lines.push('['+pg+'] '+grp+' — ✂ CUT: '+e.label); });
      });
    });
  }
  var txt=lines.join('\n'), b=this;
  if(navigator.clipboard){ navigator.clipboard.writeText(txt); b.textContent='Copied ✓'; setTimeout(function(){b.textContent='📋 Copy ALL feedback (for Cameron)';},1400); }
  else prompt('Copy:',txt);
});
panel.querySelector('.fbk-clear').addEventListener('click',function(){
  if(confirm('Clear ALL draft feedback on this browser (all pages, incl. homepage ♥ notes)?')){
    save([]);
    try{ localStorage.removeItem('ws-pins-v2'); }catch(e){}
    document.querySelectorAll('.pin.has').forEach(function(p){ p.classList.remove('has'); p.textContent='♡'; });
    var nb=document.getElementById('wsNotes'); if(nb) nb.textContent='📋 Copy ♥ notes only (0)';
    refresh();
  }
});

/* ---- selection commenting ---- */
var bub=document.createElement('button'); bub.className='fbk-bubble'; bub.type='button'; bub.textContent='💬 Comment on this copy';
bub.style.display='none'; document.body.appendChild(bub);
var selText='', selSec='';
function onSel(){
  setTimeout(function(){
    var s=window.getSelection();
    if(!s || s.isCollapsed || !s.toString().trim() || panel.contains(s.anchorNode)){ bub.style.display='none'; return; }
    selText=s.toString().trim().slice(0,180); selSec=secOf(s.anchorNode);
    try{
      var r=s.getRangeAt(0).getBoundingClientRect();
      bub.style.top=(window.scrollY+r.bottom+8)+'px';
      bub.style.left=Math.max(10,(window.scrollX+r.left))+'px';
      bub.style.display='block';
    }catch(e){ bub.style.display='none'; }
  },10);
}
document.addEventListener('mouseup',onSel);
document.addEventListener('touchend',onSel);
bub.addEventListener('click',function(){
  bub.style.display='none';
  var q=selText, s=selSec;
  askNote('RE: “'+q+'”', function(note){
    var l=load(); l.push({page:PAGE,sec:s,quote:q,note:note,combo:combo(),ts:new Date().toLocaleString()}); save(l); refresh();
  });
});

/* ---- section pins (skip sections that already have homepage ♥ pins) ---- */
document.querySelectorAll('section[id],header[id]').forEach(function(sec){
  if(sec.querySelector('button.pin')) return;
  if(getComputedStyle(sec).position==='static') sec.style.position='relative';
  var p=document.createElement('button'); p.type='button'; p.className='fbk-pin'; p.dataset.sec=sec.id; p.textContent='💬';
  p.setAttribute('aria-label','Leave a note on the '+sec.id+' section');
  p.addEventListener('click',function(){
    askNote('Note on the “'+sec.id+'” section', function(note){
      var l=load(); l.push({page:PAGE,sec:sec.id,quote:'',note:note,combo:combo(),ts:new Date().toLocaleString()}); save(l); refresh();
    });
  });
  sec.appendChild(p);
});
refresh();
})();
