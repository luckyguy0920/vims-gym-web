(function(){
'use strict';

// The public Vercel guide remains isolated from the temporary InBody session.
// Only the member's explicit choice opens it. Body measurements are never
// transferred, appended to its URL, or sent via postMessage.
const GUIDE_URL='https://vims-gym-public-guide-v11.vercel.app/';
let selectedMode=null;
const ready=()=>Boolean(window.VimsAutoFlow?.ready?.());

const css=String.raw`
.vims-exercise-tabs{
 display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;
 padding:6px;margin:0 0 18px;
 border:1px solid #333C48;background:#171B20;border-radius:15px;
 max-width:620px
}
.vims-exercise-tabs button{
 display:flex;align-items:center;justify-content:center;gap:8px;
 min-height:47px;padding:12px 15px;line-height:1.35;
 border:1px solid transparent;border-radius:10px;background:transparent;
 color:#ACBACB;font-size:14px;font-weight:720;cursor:pointer
}
.vims-exercise-tabs button[aria-selected="true"]{
 background:#303A48;color:#FFF;border-color:#52647A
}
.vims-exercise-tabs button:hover{color:#FFF}
.vims-exercise-tabs button:focus-visible,.vims-guide-open:focus-visible{
 outline:3px solid #90B4DD;outline-offset:2px
}
.vims-exercise-tabs svg{width:18px;height:18px;flex-shrink:0}
.vims-exercise-personal{min-width:0}
.vims-guide-head{padding:3px 1px 15px}
.vims-guide-head h2{font-size:clamp(23px,2.7vw,29px);font-weight:780;line-height:1.35;margin:0 0 7px;color:#F7F8FA;letter-spacing:-.038em}
.vims-guide-head p{font-size:13px;line-height:1.7;margin:0;color:#ADBACA}
.vims-guide-panel{border:1px solid #343C46;background:#15181D;border-radius:17px;overflow:hidden;max-width:980px}
.vims-guide-toolbar{padding:13px 15px;display:flex;gap:12px;align-items:center;justify-content:space-between;border-bottom:1px solid #343B45}
.vims-guide-toolbar strong{color:#E9EEF5;font-size:13px;font-weight:760}
.vims-guide-open{display:inline-flex;gap:5px;justify-content:center;align-items:center;min-height:43px;padding:10px 12px;border-radius:10px;
 background:#252D39;border:1px solid #404C5B;color:#E5EDF8;text-decoration:none;font-weight:700;font-size:12px;white-space:nowrap}
.vims-guide-open:hover{background:#313D4F;color:#FFF}
.vims-guide-framebox{width:100%;background:#FFF;display:flex;justify-content:center;overflow:hidden}
.vims-guide-iframe{display:block;width:100%;max-width:980px;height:clamp(550px,calc(100dvh - 215px),930px);
 border:0;background:#FFF;color-scheme:light}
.vims-guide-note{color:#9DAAB9;font-size:12px;line-height:1.75;max-width:880px;margin:12px 1px 0}
.vims-guide-note b{font-weight:760;color:#DDE6F1}
.vims-guide-shortcut{display:flex;align-items:center;justify-content:space-between;gap:14px;
 border:1px solid #343D47;background:#191D23;border-radius:14px;padding:15px 17px;margin:15px 0 18px}
.vims-guide-shortcut>div{flex:1;min-width:0}
.vims-guide-shortcut strong{display:block;font-weight:760;font-size:14px;line-height:1.45;color:#F1F4F8}
.vims-guide-shortcut p{margin:4px 0 0;font-size:12px;line-height:1.6;color:#A8B6C7}
.vims-guide-shortcut button{flex:none;min-height:44px;border-radius:10px;border:1px solid #4D637B;background:#2C405A;
 color:#FFF;font-size:12px;font-weight:740;padding:11px 15px;cursor:pointer}
.vims-guide-shortcut button:hover{background:#385371}
@media(max-width:750px){
 .vims-exercise-tabs{max-width:none;margin-bottom:13px}
 .vims-exercise-tabs button{font-size:13px;min-height:46px;padding:10px 7px}
 .vims-guide-head{padding:3px 1px 12px}
 .vims-guide-head h2{font-size:23px}
 .vims-guide-head p{font-size:12px}
 .vims-guide-panel{margin:0 -3px;border-radius:13px}
 .vims-guide-toolbar{padding:10px;gap:9px}
 .vims-guide-toolbar strong{font-size:12px}
 .vims-guide-open{font-size:11px;min-height:42px;padding:9px}
 .vims-guide-iframe{height:clamp(445px,calc(100dvh - 285px),790px)}
 .vims-guide-note{font-size:11px}
 .vims-guide-shortcut{padding:13px;gap:9px}
 .vims-guide-shortcut strong{font-size:13px}
 .vims-guide-shortcut p{font-size:11px}
 .vims-guide-shortcut button{font-size:11px;padding:10px;min-height:43px}
}
@media(max-width:345px){
 .vims-exercise-tabs button{font-size:12px;gap:4px}
 .vims-exercise-tabs svg{width:16px;height:16px}
 .vims-guide-toolbar strong{font-size:11px}
 .vims-guide-shortcut{flex-wrap:wrap}
 .vims-guide-shortcut button{width:100%}
}
@media print{.vims-exercise-tabs,.vims-guide-shortcut,.vims-guide-toolbar,.vims-guide-iframe{display:none!important}}
`;
const style=document.createElement('style');
style.id='vims-guide-bridge-css';
style.textContent=css;
document.head.appendChild(style);

function guideContent(){
 return '<div class="vims-guide-head"><h2>빔스짐 운동기구 가이드</h2>'+
 '<p>인바디 없이도 부위 · 운동 경험 · 목표에 따라 운동을 선택할 수 있습니다.</p></div>'+
 '<section class="vims-guide-panel" aria-label="빔스짐 운동기구 추천 가이드">'+
 '<div class="vims-guide-toolbar"><strong>운동기구 · 추천 루틴</strong>'+
 '<a class="vims-guide-open" href="'+GUIDE_URL+'" target="_blank" rel="noopener noreferrer">전체 화면으로 열기 ↗</a></div>'+
 '<div class="vims-guide-framebox">'+
 '<iframe class="vims-guide-iframe" src="'+GUIDE_URL+'" title="빔스짐 운동기구 추천 가이드 — 부위별 추천과 사용법"'+
 ' loading="eager" referrerpolicy="no-referrer"'+
 ' sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe></div></section>'+
 '<p class="vims-guide-note"><b>개인정보 안내</b> · 운동 가이드는 별도 서비스 화면입니다. 인바디 수치는 자동으로 전달되지 않습니다.'+
 ' 화면이 보이지 않으면 위의 ‘전체 화면으로 열기’를 눌러주세요.</p>';
}
const icon=(name)=>name==='plan'?
 '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h16M8 5v14"/></svg>':
 '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9v6M6 6v12M9 10h6M15 6v12M18 9v6M1 11v2M21 11v2"/></svg>';
function exercisePage(){
 const view=document.querySelector('#view');
 if(!view)return;
 const loggedIn=ready();
 const mode=selectedMode||(loggedIn?'personal':'guide');
 const content=document.createElement('section');
 content.className='vims-exercise-personal';
 // Preserve previously rendered auto-plan elements and event delegation.
 while(view.firstChild)content.appendChild(view.firstChild);
 const shell=document.createElement('div');
 shell.className='vims-exercise-shell';
 const tabs=document.createElement('div');
 tabs.className='vims-exercise-tabs';
 tabs.setAttribute('role','tablist');
 tabs.setAttribute('aria-label','운동 메뉴');
 tabs.innerHTML='<button type="button" role="tab" id="vims-tab-plan" data-vims-exercise-tab="personal"'+
 ' aria-selected="'+String(mode==='personal')+'" aria-controls="vims-exercise-panel">'+icon('plan')+' 내 운동 계획</button>'+
 '<button type="button" role="tab" id="vims-tab-guide" data-vims-exercise-tab="guide"'+
 ' aria-selected="'+String(mode==='guide')+'" aria-controls="vims-exercise-panel">'+icon('guide')+' 운동기구 가이드</button>';
 const region=document.createElement('div');
 region.id='vims-exercise-panel';
 region.setAttribute('role','tabpanel');
 region.setAttribute('aria-labelledby',mode==='guide'?'vims-tab-guide':'vims-tab-plan');
 if(mode==='personal')region.appendChild(content);
 else region.innerHTML=guideContent();
 shell.appendChild(tabs);
 shell.appendChild(region);
 view.appendChild(shell);
}
function addShortcut(view,message,description){
 if(view.querySelector('[data-vims-guide-open]'))return;
 const section=document.createElement('section');
 section.className='vims-guide-shortcut';
 section.innerHTML='<div><strong>'+message+'</strong><p>'+description+'</p></div>'+
 '<button type="button" data-vims-guide-open="1">기구 가이드 보기 →</button>';
 if(route==='home'){
   const intro=view.querySelector('.af-cover');
   const dashboard=view.querySelector('.af-shortcuts');
   if(intro)intro.after(section);
   else if(dashboard)dashboard.after(section);
   else view.appendChild(section);
 }else{
   const banner=view.querySelector('.v28banner');
   if(banner)banner.after(section);
   else view.insertBefore(section,view.firstChild);
 }
}
function enhance(){
 const view=document.querySelector('#view');
 if(!view)return;
 if(route==='workout'){exercisePage();return;}
 if(route==='home'){
  if(ready())addShortcut(view,'운동기구가 궁금하신가요?','부위별 기구 사용법과 새 운동 4종 추천');
  else addShortcut(view,'인바디 없이 바로 운동하기','부위와 목표만 선택해 운동 4종 추천');
 }
 if(route==='plan'||route==='course'){
  if(ready())addShortcut(view,'운동 자세도 확인하세요','운동기구별 사용법과 추천 루틴');
 }
}
const originalRender=render;
render=function(){
 const output=originalRender.apply(this,arguments);
 enhance();
 return output;
};
document.addEventListener('click',function(event){
 const tab=event.target.closest('[data-vims-exercise-tab]');
 if(tab){
   event.preventDefault();event.stopPropagation();
   const next=tab.dataset.vimsExerciseTab;
   if(next==='guide'||next==='personal'){
     selectedMode=next;
     if(route==='workout')render();
     else setRoute('workout');
   }
   return;
 }
 const open=event.target.closest('[data-vims-guide-open]');
 if(open){
   event.preventDefault();event.stopPropagation();
   selectedMode='guide';
   if(route==='workout')render();
   else setRoute('workout');
 }
},true);
window.VimsExerciseGuide={openGuide:function(){selectedMode='guide';setRoute('workout');},source:GUIDE_URL,version:1};
render();
})();
