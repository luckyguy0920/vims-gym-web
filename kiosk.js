
(function(){
'use strict';
const PHONE='050713668163';
const PHONE_TEXT='0507-1366-8163';
const ADDRESS='울산광역시 울주군 범서읍 구영로 94, 5층';
const CLOSED_KEYS=['vims28_member_preview_1','vims_integrated_recipe_v7','vims28_manual_measurements_v1'];
const IDLE_TIME=8*60*1000;
const WARN_TIME=45*1000;
let idleTimer=null;
let warnTimer=null;
let visibleWarning=false;
function clearPrevious(){
  for(const key of CLOSED_KEYS){
    try{localStorage.removeItem(key);}catch(e){}
    try{sessionStorage.removeItem(key);}catch(e){}
  }
}
function wipeRuntime(){
  state.body={};state.goal={};state.days={};state.recheck={};
  state.name='';state.routine=[];state.routineDone={};
  state.purpose='기초체력';state.area='전신';state.selectedDay=1;
  state.start=localDate(new Date());
  state.nutritionPrefs={};
  try{if(bodyPhotoURL)URL.revokeObjectURL(bodyPhotoURL);}catch(e){}
  bodyPhotoURL='';
  clearPrevious();
}
function finish(){
  visibleWarning=false;
  closeModal();
  clearTimeout(idleTimer);clearTimeout(warnTimer);
  wipeRuntime();
  // Replace the current history entry so previous-user results cannot be reached via Back.
  try{history.replaceState(null,'',location.pathname);}catch(e){}
  location.replace(location.pathname+'?new=1');
}
function closeModal(){
  document.querySelector('#vims-kiosk-modal')?.remove();
  document.body.classList.remove('kiosk-modal-open');
}
function modalBox({title,message,body='',actions=''}) {
  closeModal();
  const wrap=document.createElement('div');
  wrap.id='vims-kiosk-modal';
  wrap.className='vk-modalshade';
  wrap.innerHTML='<div class="vk-modal" role="dialog" aria-modal="true" aria-label="'+title+'">'+
     '<div class="vk-modalkicker">VIMS GYM · 구영리점</div>'+
     '<h2>'+title+'</h2>'+
     '<p>'+message+'</p>'+body+
     '<div class="vk-modalactions">'+actions+'</div></div>';
  document.body.appendChild(wrap);
  document.body.classList.add('kiosk-modal-open');
  return wrap;
}
function consult(){
  if(visibleWarning)return;
  modalBox({
    title:'내 몸에 맞는 관리, 전문가와 함께 시작하세요',
    message:'자동 계획은 시작점입니다. 빔스짐에서 운동 목표와 기구 사용, 체형·움직임 상태를 상담하고 회원 등록 방법도 안내받으실 수 있습니다.',
    body:'<div class="vk-contactdetails">'+
      '<div><span>상담 문의</span><strong>'+PHONE_TEXT+'</strong><small>공개 업체정보에 기재된 번호 · 센터 확인 권장</small></div>'+
      '<div><span>현장 상담·회원 등록</span><strong>'+ADDRESS+'</strong><small>인바디 원본 결과지를 가져오시면 상담에 도움이 됩니다.</small></div>'+
      '<div class="vk-privacy">입력하신 측정값은 상담 요청과 함께 자동 전송되지 않습니다. 현장에서 필요할 때 직접 보여주세요.</div>'+
      '</div>',
    actions:'<a class="vk-action-main" href="tel:'+PHONE+'">전화로 상담 문의하기 ↗</a>'+
      '<button type="button" class="vk-action-sub" data-kiosk="close">계획으로 돌아가기</button>'+
      '<button type="button" class="vk-action-end" data-kiosk="finish">이용 종료 · 정보 지우기</button>'
  });
}
function cta(){
  return `<section class="vk-sales" aria-label="전문 상담 및 회원 등록">
   <div class="vk-salesheader"><span>VIMS GYM · 맞춤 운동 관리</span><h2>계획을 세웠다면, 이제 나에게 맞게 실행할 차례입니다.</h2><p>회원님의 현재 몸 상태와 움직임, 운동 경험은 숫자만으로 모두 알 수 없습니다. 빔스짐 트레이너와 함께 운동·식사·회복 방법을 구체적으로 조정해 보세요.</p></div>
   <div class="vk-sellingpoints"><div><b>01</b> 운동 자세·기구 사용 상담</div><div><b>02</b> 체성분 목표에 따른 관리 방향</div><div><b>03</b> 개인지도 및 회원권 등록 안내</div></div>
   <div class="vk-ctabuttons"><button type="button" class="vk-primary" data-kiosk="consult">1:1 전문 상담 · 회원 등록 문의 <span>→</span></button><button type="button" class="vk-secondary" data-kiosk="finish">이용 종료 · 정보 지우기</button></div>
   <p class="vk-safe">이 결과는 이번 이용 중에만 표시됩니다. 공용 기기에 파일을 내려받거나 인쇄할 경우 개인 정보가 남을 수 있으니 주의하세요.</p>
  </section>`;
}
function banner(){
  return '<div class="vk-persistent" role="note"><span><b>공용 일회성 이용</b> · 개인 측정값은 저장하지 않습니다</span>'+
    '<button type="button" data-kiosk="finish">이용 종료 · 초기화</button></div>';
}
function attach(){
  const root=document.querySelector('#view');
  if(!root)return;
  if(!document.querySelector('#vk-banner-slot')){
    const slot=document.createElement('div');slot.id='vk-banner-slot';
    const main=document.querySelector('.main')||document.querySelector('main')||root.parentElement;
    if(main&&main!==root)main.insertBefore(slot,root);else root.insertAdjacentElement('beforebegin',slot);
  }
  const slot=document.querySelector('#vk-banner-slot');
  if(slot)slot.innerHTML=banner();
  // Results only: no sales appeal while the member is typing measurements.
  if(state.body?.weight&&state.goal?.kind&&!['body'].includes(route)){
    if(!root.querySelector('.vk-sales'))root.insertAdjacentHTML('beforeend',cta());
  }
  // Common terminals should not invite long-term measurement diary use.
  const recipes=Array.from(document.querySelectorAll('#desktopNav [data-value="stats"],#mobileNav [data-value="stats"]'));
  for(const item of recipes)item.remove();
  // Do not encourage downloading sensitive values onto a shared terminal.
  for(const b of document.querySelectorAll('button[data-action="export"],button[data-action="export-course"],button[data-action="course-csv"],button[data-plan28="print"]'))b.remove();
}
function warn(){
  visibleWarning=true;
  const box=modalBox({
   title:'이용을 계속하시겠습니까?',
   message:'공용 기기에서 다음 사용자가 회원님의 결과를 볼 수 없도록 잠시 후 화면이 자동 초기화됩니다.',
   body:'<div class="vk-warningcount"><b>45초 후 자동 종료</b><span>계속 보려면 아래 버튼을 눌러 주세요.</span></div>',
   actions:'<button type="button" class="vk-action-main" data-kiosk="continue">결과 계속 보기</button>'+
           '<button type="button" class="vk-action-end" data-kiosk="finish">지금 종료 · 정보 지우기</button>'
  });
  warnTimer=setTimeout(finish,WARN_TIME);
}
function activity(){
  if(visibleWarning)return;
  clearTimeout(idleTimer);
  idleTimer=setTimeout(warn,IDLE_TIME);
}
function resume(){
  clearTimeout(warnTimer);
  visibleWarning=false;
  closeModal();
  activity();
}
const css=`
.vk-persistent{border:1px solid #d8e7eb;background:#f4f9fb;border-radius:12px;padding:11px 14px;margin:0 0 13px;display:flex;justify-content:space-between;align-items:center;gap:10px;color:#456472;font-size:12px}
.vk-persistent b{font-weight:900;color:#285366}.vk-persistent button{border:1px solid #b7cdda;background:#fff;border-radius:9px;padding:8px 11px;color:#28556e;font-weight:900;font-size:12px;white-space:nowrap}
.vk-sales{margin:32px 0 22px;padding:26px;background:linear-gradient(135deg,#132c50,#204c83);border-radius:21px;color:#fff;box-shadow:0 12px 32px #16365a21}
.vk-salesheader>span{display:block;font-weight:900;font-size:11px;letter-spacing:.08em;color:#bfe39a}
.vk-sales h2{font-size:clamp(20px,2.4vw,29px);line-height:1.35;margin:10px 0 11px;letter-spacing:-.035em}
.vk-sales p{font-size:13px;line-height:1.9;margin:0;color:#d4e2f3;max-width:740px}
.vk-sellingpoints{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:20px 0}
.vk-sellingpoints>div{background:#ffffff12;border:1px solid #ffffff23;padding:12px;border-radius:11px;font-size:12px;color:#e4edff;line-height:1.6}
.vk-sellingpoints b{color:#c9ee93;margin-right:8px}
.vk-ctabuttons{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.vk-primary,.vk-secondary{border-radius:11px;padding:13px 16px;font-size:14px;font-weight:900;min-height:46px}
.vk-primary{background:#c9f191;border:0;color:#21392a;display:flex;justify-content:space-between;gap:15px;align-items:center;flex:1;min-width:230px}
.vk-primary span{font-size:20px}.vk-secondary{color:#fff;border:1px solid #ffffff74;background:transparent}
.vk-sales .vk-safe{font-size:11px;color:#b2c7df;margin-top:16px}
.vk-modalshade{position:fixed;z-index:100000;inset:0;background:rgba(7,17,31,.73);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto}
.vk-modal{width:min(100%,500px);max-height:90vh;overflow-y:auto;border-radius:20px;background:#fff;box-shadow:0 20px 80px #0004;padding:25px;color:#163250}
.vk-modalkicker{font-size:11px;font-weight:900;color:#2d64bc;letter-spacing:.06em}
.vk-modal h2{font-size:23px;line-height:1.45;margin:10px 0 11px}.vk-modal>p{font-size:13px;line-height:1.9;color:#5a718c}
.vk-contactdetails{display:flex;flex-direction:column;gap:10px;margin:15px 0}
.vk-contactdetails>div{background:#f3f7fc;border-radius:12px;padding:13px}
.vk-contactdetails span,.vk-contactdetails strong,.vk-contactdetails small{display:block}
.vk-contactdetails span{color:#66809d;font-size:11px;font-weight:800}
.vk-contactdetails strong{font-size:17px;color:#183960;margin-top:5px}
.vk-contactdetails small{font-size:11px;color:#75869c;margin-top:4px;line-height:1.7}
.vk-contactdetails .vk-privacy{background:#f7f9ec;font-size:12px;color:#65714a;line-height:1.7}
.vk-modalactions{display:flex;flex-direction:column;gap:8px;margin-top:17px}
.vk-action-main,.vk-action-sub,.vk-action-end{text-align:center;border-radius:10px;display:block;padding:12px 14px;font-size:14px;font-weight:900;cursor:pointer;text-decoration:none}
.vk-action-main{background:#2561bf;color:#fff;border:1px solid #2561bf}.vk-action-sub{background:#f2f6fb;color:#376090;border:1px solid #dce5f0}
.vk-action-end{background:#fff;color:#955337;border:1px solid #efddd0}
.vk-warningcount{background:#fff6e8;padding:13px;border-radius:10px;margin-top:13px}
.vk-warningcount b,.vk-warningcount span{display:block;font-size:12px;color:#916630;line-height:1.8}
body.kiosk-modal-open{overflow:hidden}
@media(max-width:690px){.vk-sales{padding:20px}.vk-sellingpoints{grid-template-columns:1fr}.vk-persistent{flex-wrap:wrap}}
@media print{.vk-persistent,.vk-ctabuttons,.vk-modalshade{display:none!important}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
// The original plan displays long-term charts that are not meaningful for one-time use.
const idx=paths.findIndex(p=>p[0]==='stats');if(idx>=0)paths.splice(idx,1);
const priorRender=render;
render=function(){
  priorRender();
  attach();
};
document.addEventListener('click',function(e){
 const b=e.target.closest('[data-kiosk]');
 if(!b)return;
 e.preventDefault();
 e.stopImmediatePropagation();
 const action=b.dataset.kiosk;
 if(action==='consult')consult();
 if(action==='close'&&!visibleWarning)closeModal();
 if(action==='finish')finish();
 if(action==='continue')resume();
},true);
for(const ev of ['pointerdown','touchstart','keydown','wheel','scroll']){
 window.addEventListener(ev,activity,{passive:true});
}
window.addEventListener('pageshow',function(e){if(e.persisted){wipeRuntime();location.reload();}});
window.addEventListener('pagehide',function(){clearTimeout(idleTimer);clearTimeout(warnTimer);wipeRuntime();});
window.addEventListener('keydown',function(e){if(e.key==='Escape'&&!visibleWarning)closeModal();});
window.VimsKiosk={clearPrevious,finish,consult,cta,attach};
clearPrevious();
activity();
render();
})();
