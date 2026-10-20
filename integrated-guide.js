(function(){
'use strict';
const GUIDE_URL='https://vims-gym-public-guide-v11.vercel.app/';
const KEY='guide';
const GUIDE_ICON='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8v8M6 6v12M9 10h6M15 6v12M18 8v8M1 10v4M21 10v4"/></svg>';
if(!paths.some(row=>row[0]===KEY)){
 const at=paths.findIndex(row=>row[0]==='workout');
 paths.splice(at>=0?at+1:paths.length,0,[KEY,'◈','기구 가이드']);
}
const css=`
.vg-guide-screen{display:flex;flex-direction:column;gap:16px;min-width:0}
.vg-guide-head{background:#15191F;border:1px solid #343C46;border-radius:16px;padding:20px 22px;display:flex;justify-content:space-between;align-items:center;gap:17px}
.vg-guide-eyebrow{display:block;color:#B7C5D7;font-weight:750;letter-spacing:.055em;font-size:11px}
.vg-guide-head h2{font-size:24px;font-weight:780;line-height:1.3;margin:7px 0 6px;color:#F3F5F8;letter-spacing:-.035em}
.vg-guide-head p{font-size:13px;line-height:1.65;color:#B6C2D0;margin:0;max-width:590px}
.vg-guide-actions{display:flex;align-items:center;gap:9px;flex-shrink:0}
.vg-guide-actions a,.vg-guide-actions button{border:1px solid #4C5867;background:#262D36;color:#E8EDF5;min-height:44px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;padding:10px 15px;border-radius:10px;font-size:13px;font-weight:720}
.vg-guide-actions button{background:#345174;border-color:#456791}
.vg-guide-shell{border-radius:16px;overflow:hidden;background:#FFF;border:1px solid #333B45;position:relative}
.vg-guide-frame{display:block;width:100%;height:min(85vh,1050px);min-height:650px;border:0;background:#FFF}
.vg-guide-notice{color:#9EABB9;font-size:12px;line-height:1.6;margin:0}
.vg-guide-launch{background:#191E25;border:1px solid #373F4A;border-radius:15px;display:flex;align-items:center;justify-content:space-between;padding:17px 19px;gap:15px;margin:17px 0}
.vg-guide-launch h3{font-size:16px;font-weight:750;color:#F1F3F6;margin:0 0 4px}
.vg-guide-launch p{font-size:12px;color:#B1BDCB;margin:0;line-height:1.55}
.vg-guide-launch button{border:1px solid #517298;background:#304966;color:#FFF;border-radius:10px;padding:11px 14px;min-height:44px;flex:none;font-size:13px;font-weight:730;cursor:pointer}
#desktopNav button[data-value="guide"] .nav-icon svg{width:20px;height:20px}
@media(max-width:800px){
 .vg-guide-head{padding:16px;flex-direction:column;align-items:stretch;gap:11px}
 .vg-guide-head h2{font-size:21px}
 .vg-guide-actions{justify-content:flex-start;flex-wrap:wrap}
 .vg-guide-frame{height:72vh;min-height:510px}
 .vg-guide-launch{padding:14px;align-items:flex-start}
 .vg-guide-launch h3{font-size:15px}
 .vg-guide-launch p{font-size:12px}
 .vg-guide-launch button{padding:10px 11px;font-size:12px}
}
`;
const style=document.createElement('style');style.id='vg-integrated-guide-style';style.textContent=css;document.head.appendChild(style);
function guideBody(){
 return `<section class="vg-guide-screen" aria-label="빔스짐 기구별 운동 가이드">
  <div class="vg-guide-head"><div><span class="vg-guide-eyebrow">VIMS GYM · 운동 가이드</span><h2>오늘은 어떤 운동을 할까요?</h2><p>부위 · 운동 경험 · 목표를 고르면 기구 4가지와 운동 방법을 추천받을 수 있습니다.</p></div><div class="vg-guide-actions"><button type="button" data-action="route" data-value="workout">나의 운동</button><a href="${GUIDE_URL}" target="_blank" rel="noopener noreferrer">큰 화면으로 열기 ↗</a></div></div>
  <div class="vg-guide-shell"><iframe class="vg-guide-frame" title="빔스짐 기구별 운동 추천 가이드" src="${GUIDE_URL}" loading="eager" referrerpolicy="no-referrer" allow="fullscreen"></iframe></div>
  <p class="vg-guide-notice">운동 추천은 별도 가이드에서 제공됩니다. 인바디 측정값은 가이드에 자동으로 전달되지 않습니다. 가이드 화면이 보이지 않으면 ‘큰 화면으로 열기’를 눌러 주세요.</p>
 </section>`;
}
const launchHTML='<section class="vg-guide-launch"><div><h3>운동기구 사용법 · 추천</h3><p>실제 빔스짐 기구 기준으로 오늘의 운동 4개를 추천받으세요.</p></div><button type="button" data-action="route" data-value="guide">가이드 보기 →</button></section>';
function addLaunch(view){if(!view||view.querySelector('.vg-guide-launch'))return;view.insertAdjacentHTML('beforeend',launchHTML);}
const priorRender=render;
render=function(){
 const result=priorRender.apply(this,arguments);
 const view=document.querySelector('#view');
 if(!view)return result;
 if(route===KEY){view.innerHTML=guideBody();window.scrollTo?.({top:0,behavior:'instant'});}
 else if(route==='workout'){addLaunch(view);}
 else if(route==='home' && !window.VimsAutoFlow?.ready?.()){addLaunch(view);}
 return result;
};
const prevNav=navRender;
navRender=function(){
 const result=prevNav.apply(this,arguments);
 const guideButton=document.querySelector('#desktopNav button[data-value="guide"]');
 if(guideButton){const icon=guideButton.querySelector('.nav-icon');if(icon)icon.innerHTML=GUIDE_ICON;}
 if(route===KEY){
  const workoutTab=document.querySelector('#mobileNav button[data-value="workout"]');
  if(workoutTab){workoutTab.classList.add('active');workoutTab.setAttribute('aria-current','page');}
 }
 return result;
};
window.VimsGuide={url:GUIDE_URL,route:KEY};
navRender();
render();
})();