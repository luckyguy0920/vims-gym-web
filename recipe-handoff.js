
(function(){
'use strict';
const food=window.VimsNutrition?.foods||{};
const labels={b:'아침',l:'점심',d:'저녁',s:'간식'};
const refMap={
 b:[6,4,23,20,10,4,6],
 l:[2,3,17,21,8,18,11],
 d:[23,8,5,3,23,2,18],
 s:[6,6,6,6,6,6,6]
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Math.round(n).toLocaleString('ko-KR');
function refId(day,type){
 const offset=(day-1+Math.floor((day-1)/7)*2)%7;
 return refMap[type]?.[offset]||null;
}
function daily(day){if(!window.VimsPlan28||!state.body?.weight||!state.goal?.kind)return null;return window.VimsPlan28.daily(day,window.VimsPlan28.nutrition());}
function ingredientRows(m){
 return m.items.map(x=>{
  const f=food[x.k];
  return `<div><span>${esc(f?.[0]||x.k)}</span><b>${fmt(x.g)}g</b></div>`;
 }).join('');
}
function recipeWindow(day,type){
 const info=daily(day);if(!info)return;
 const m=info.meals.find(x=>x.type===type);if(!m)return;
 const id=refId(day,type);
 const example=recipes.find(r=>r.id===id);
 document.getElementById('vr-modal')?.remove();
 const shadow=document.createElement('div');shadow.id='vr-modal';shadow.className='vr-overlay';
 const source=example?`<section class="vr-reference"><h3>참고 조리법 · ${esc(example.name)}</h3>
 <img src="${example.img}" alt="${esc(example.name)} 참고 레시피 사진" loading="lazy">
 <p class="vr-caution"><b>참고 조리법</b> · 비슷한 메뉴의 조리 예시입니다. 식재료와 중량은 위 계획을 우선하세요.</p>
 <h4>조리 순서</h4><ol>${example.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
 ${example.tips?.length?`<h4>조리 팁</h4><ul>${example.tips.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</section>`:
 `<p>기존 레시피가 없어 재료·중량만 제공합니다. 충분히 익혀 조리하세요.</p>`;
 shadow.innerHTML=`<div class="vr-dialog" role="dialog" aria-modal="true" aria-label="${day}일차 ${labels[type]} 레시피">
 <header><div><span>DAY ${String(day).padStart(2,'0')} · ${labels[type]}</span><h2>${esc(m.title)}</h2></div><button type="button" data-recipe-close="1">닫기 ×</button></header>
 <p class="vr-headline">재료와 중량 · 약 ${fmt(m.kcal)}킬로칼로리 · 단백질 ${fmt(m.p)}g</p>
 <h3>식재료 · 중량</h3><div class="vr-ingredients">${ingredientRows(m)}</div>${source}</div>`;
 document.body.appendChild(shadow);
 document.body.style.overflow='hidden';
}
function closeRecipe(){
 document.querySelector('#vr-modal')?.remove();
 if(!document.querySelector('#vims-kiosk-modal'))document.body.style.overflow='';
}
function handoffData(){
 if(!window.VimsPlan28||!state.body?.weight||!state.goal?.kind)return null;
 const n=window.VimsPlan28.nutrition();
 const days=[];
 for(let d=1;d<=28;d++){
  const info=window.VimsPlan28.daily(d,n);
  days.push({
   day:d,
   training:Boolean(info.s.training),
   aerobic:Math.round(info.s.cardio),
   exercises:info.s.machines.map(ex=>({name:String(ex.name),sets:String(info.s.wt.sets),reps:String(info.s.wt.reps)})),
   rest:info.s.training?'훈련 후 정리운동 5~10분, 수면 '+(Number(state.profile?.age)>=65?'7~8시간':'7~9시간')+', 통증과 피로 점검':'무리하지 않는 걷기와 스트레칭, 수면 '+(Number(state.profile?.age)>=65?'7~8시간':'7~9시간'),
   meals:info.meals.map(m=>({
    type:m.type,title:m.title,
    kcal:Math.round(m.kcal*10)/10,protein:Math.round(m.p*10)/10,
    items:m.items.map(x=>({name:food[x.k]?.[0]||x.k,g:x.g})),
    recipeId:refId(d,m.type)
   }))
  });
 }
 // No name, height, weight, fat mass, skeletal-muscle mass or personal contact details.
 return {version:1,kind:state.goal.kind,goal:goalLabel(),kcal:n.kcal,protein:n.protein,days};
}
function shareBanner(){
 return `<section class="vr-share" aria-label="28일 맞춤 계획표 이미지 저장">
  <div class="vr-text"><span>VIMS GYM · 28일 관리</span><h2>내 계획표 저장하기</h2>
  <p>오늘 계획 1장과 1~4주차 계획 4장, 총 5장의 사진을 한 번에 저장합니다.</p>
  <small>PNG 5장을 ZIP 파일 하나로 · 이름·전화번호·원본 인바디 수치 제외</small>
  </div><button type="button" class="vr-sharebtn" data-vims-save-all="1">28일 맞춤 계획표 저장하기 <span>↓</span></button>
  </section>`;
}
function enhanceMeals(){
 if(route!=='plan')return;
 const cards=document.querySelectorAll('#view .v28card');
 if(cards.length!==28)return;
 cards.forEach((card,index)=>{
  const day=index+1,info=daily(day);if(!info)return;
  const firstLine=card.querySelector('.v28line');
  const content=firstLine?.querySelector('div');
  if(!content||content.dataset.recipeEnhanced)return;
  content.dataset.recipeEnhanced='1';
  content.innerHTML=info.meals.map(m=>{
   const id=refId(day,m.type),example=recipes.find(r=>r.id===id);
   return `<div class="vr-menurow">
    ${example?`<img src="/api/recipe/${id}/image" alt="${esc(example.name)} 참고 음식 사진" loading="lazy">`:'<span class="vr-emptyphoto">♨</span>'}
    <span class="vr-menutext"><small>${labels[m.type]}</small><b>${esc(m.title)}</b><em>약 ${fmt(m.kcal)}킬로칼로리 · ${example?'참고 사진':'조리법 확인'}</em></span>
    <button type="button" data-vr-meal="${day}:${m.type}">조리법</button>
   </div>`;
  }).join('');
 });
}
function attach(){
 const view=document.querySelector('#view');
 if(!view||!state.body?.weight||!state.goal?.kind)return;
 if(!['plan','home','nutrition','course'].includes(route))return;
 if(route==='plan')enhanceMeals();
 if(view.querySelector('.vr-share'))return;
 const c=document.createElement('div');c.className='vr-shareholder';c.innerHTML=shareBanner();
 const consultation=view.querySelector('.vk-sales');
 if(consultation)consultation.before(c);
 else view.appendChild(c);
}
const styles=`
.vr-share{margin:23px 0 16px;border-radius:19px;padding:22px;background:linear-gradient(125deg,#e6f0ff,#f5f9ff);border:1px solid #d5e4f8;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}
.vr-text{flex:1;min-width:220px}.vr-text>span{font-size:11px;font-weight:900;letter-spacing:.08em;color:#2b5eb3}.vr-text h2{font-size:22px;margin:8px 0;color:#1a3862}.vr-text p{font-size:13px;color:#4b6487;line-height:1.8;margin:0 0 9px;max-width:660px}.vr-text small{font-size:11px;color:#7186a0;line-height:1.7}
.vr-sharebtn{padding:13px 17px;border-radius:12px;background:#255ebc;color:#fff;border:0;font-weight:900;font-size:14px;display:flex;justify-content:space-between;gap:15px;align-items:center}
.vr-sharebtn span{font-size:19px}.vr-menurow{display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px dashed #e9eef6;min-width:0}
.vr-menurow img,.vr-emptyphoto{width:43px;height:43px;object-fit:cover;border-radius:8px;flex-shrink:0;background:#eef4ff;display:grid;place-items:center}
.vr-menutext{flex:1;min-width:0;font-size:11px}.vr-menutext small,.vr-menutext b,.vr-menutext em{display:block}.vr-menutext small{font-size:10px;color:#3762a3;font-weight:900}.vr-menutext b{font-size:12px;line-height:1.5;color:#374d68}.vr-menutext em{font-size:10px;color:#7186a0;font-style:normal}
.vr-menurow button{font-size:11px;font-weight:900;color:#265dab;background:#edf4ff;border:1px solid #d7e5fa;border-radius:8px;padding:8px 9px;white-space:nowrap}
.vr-overlay{position:fixed;inset:0;z-index:50000;padding:14px;background:#081527c9;display:flex;justify-content:center;align-items:center;overflow-y:auto}
.vr-dialog{background:#fff;border-radius:18px;width:min(100%,640px);max-height:91vh;overflow-y:auto;padding:21px}
.vr-dialog header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.vr-dialog header span{color:#2b60b7;font-weight:900;font-size:11px}
.vr-dialog h2{font-size:23px;margin:7px 0 10px;color:#1a3760}.vr-dialog h3{font-size:16px;margin:21px 0 11px}.vr-dialog h4{font-size:14px;margin:14px 0 6px}
.vr-dialog header button{border:1px solid #dae4f0;background:#f2f6fb;color:#3a587d;padding:9px 12px;border-radius:9px;white-space:nowrap;font-weight:900}
.vr-dialog p,.vr-dialog li{font-size:13px;line-height:1.85;color:#526984}.vr-ingredients{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.vr-ingredients>div{padding:10px;background:#f1f6fc;border-radius:9px;display:flex;gap:10px;justify-content:space-between;font-size:12px;color:#526a86}.vr-ingredients b{white-space:nowrap}
.vr-reference img{width:100%;height:220px;object-fit:cover;border-radius:12px;margin:7px 0}.vr-reference ol,.vr-reference ul{padding-left:22px}
.vr-dialog .vr-caution{background:#fff8e9;border-radius:10px;padding:10px;color:#82683c}
.vr-qr-dialog{max-width:445px}.vr-qrimage{width:260px;height:260px;margin:12px auto;background:#fff;padding:7px;border:1px solid #dfe6ef;border-radius:10px}
.vr-qrimage img{width:100%;height:100%;display:block}.vr-qrsteps{display:grid;gap:7px;background:#f2f7ff;border-radius:12px;padding:13px}
.vr-qrsteps div{font-size:12px;color:#44638d;display:flex;gap:10px;align-items:center}.vr-qrsteps b{display:grid;place-items:center;background:#dbe9ff;color:#2861c6;border-radius:50%;width:23px;height:23px}
.vr-qrcontent .vr-qrwarning{font-size:11px;color:#846640;line-height:1.8}.vr-error{color:#a34c3b!important}
@media(max-width:720px){.vr-dialog{padding:15px}.vr-ingredients{grid-template-columns:1fr}.vr-share{padding:17px}.vr-sharebtn{width:100%}.vr-share h2{font-size:19px}}
`;
const style=document.createElement('style');style.textContent=styles;document.head.appendChild(style);
const renderBefore=render;
render=function(){renderBefore();attach();};
document.addEventListener('click',function(e){
 const r=e.target.closest('[data-vr-meal]');
 if(r){e.preventDefault();e.stopPropagation();const [day,type]=r.dataset.vrMeal.split(':');recipeWindow(Number(day),type);return;}
 const x=e.target.closest('[data-recipe-close]');
 if(x){e.preventDefault();closeRecipe();return;}

},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeRecipe();});
window.VimsRecipeHandoff={refId,daily,package:handoffData,attach,show:recipeWindow};
render();
})();
