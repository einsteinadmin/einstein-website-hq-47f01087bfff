/* EMC DRAFT FEEDBACK LAYER — shared across all draft pages (7/1/2026).
   Two ways to leave feedback:
   1) HIGHLIGHT any text → a 💬 button appears → add a note tied to that exact copy.
   2) 💬 pin on each section (subpages; homepage keeps its ♥ pins — both merge on export).
   One store per browser origin → review on the HQ (github.io) or localhost, NOT file://,
   so notes from all pages aggregate. "Copy ALL feedback" outputs everything for Albert. */
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
'.fbk-pin:hover{opacity:1}.fbk-pin.has{background:#EBF4FB;border-color:#88C0E4;color:#065E9A;opacity:1}';
document.head.appendChild(css);

/* ---- FAB + panel ---- */
var fab=document.createElement('button'); fab.className='fbk-fab'; fab.type='button';
var panel=document.createElement('div'); panel.className='fbk-panel';
panel.innerHTML='<h5>Draft feedback</h5><div class="fbk-count"></div>'+
  '<button class="fbk-copy" type="button">📋 Copy ALL feedback (for Albert)</button>'+
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
  var l=load(), pins=[];
  try{ pins=JSON.parse(localStorage.getItem('ws-pins-v2'))||[]; }catch(e){}
  if(!l.length && !pins.length){ this.textContent='Nothing yet'; var b=this; setTimeout(function(){b.textContent='📋 Copy ALL feedback (for Albert)';},1200); return; }
  var lines=['EINSTEIN DRAFT FEEDBACK — '+new Date().toLocaleString()+' — paste this to Albert'];
  l.forEach(function(e){ lines.push('• ['+e.page+(e.sec?' → '+e.sec:'')+'] '+(e.quote?'RE: "'+e.quote+'" — ':'')+e.note+(e.combo?'  (combo: '+e.combo+')':'')); });
  pins.forEach(function(p){ lines.push('• [homepage → '+p.sec+'] '+(p.note||'♥ loved it')+'  (combo: '+p.combo+')'); });
  var txt=lines.join('\n'), b=this;
  if(navigator.clipboard){ navigator.clipboard.writeText(txt); b.textContent='Copied ✓'; setTimeout(function(){b.textContent='📋 Copy ALL feedback (for Albert)';},1400); }
  else prompt('Copy:',txt);
});
panel.querySelector('.fbk-clear').addEventListener('click',function(){
  if(confirm('Clear ALL draft feedback on this browser (all pages)?')){ save([]); refresh(); }
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
  var note=prompt('Your note on:\n"'+selText+'"');
  if(note===null||!note.trim()) return;
  var l=load(); l.push({page:PAGE,sec:selSec,quote:selText,note:note.trim(),combo:combo(),ts:new Date().toLocaleString()}); save(l); refresh();
});

/* ---- section pins (skip sections that already have homepage ♥ pins) ---- */
document.querySelectorAll('section[id],header[id]').forEach(function(sec){
  if(sec.querySelector('.pin')) return;
  if(getComputedStyle(sec).position==='static') sec.style.position='relative';
  var p=document.createElement('button'); p.type='button'; p.className='fbk-pin'; p.dataset.sec=sec.id; p.textContent='💬';
  p.setAttribute('aria-label','Leave a note on the '+sec.id+' section');
  p.addEventListener('click',function(){
    var note=prompt('Note on the "'+sec.id+'" section:');
    if(note===null||!note.trim()) return;
    var l=load(); l.push({page:PAGE,sec:sec.id,quote:'',note:note.trim(),combo:combo(),ts:new Date().toLocaleString()}); save(l); refresh();
  });
  sec.appendChild(p);
});
refresh();
})();
