
(function(){
'use strict';
const KEY='vims_personal_28day_recipe_plan_v1';
const LABEL={b:'아침',l:'점심',d:'저녁',s:'간식'};
const TALK='https://talk.naver.com/ct/w81ur3w?frm=mnmb#nafullscreen';
const root=document.getElementById('mobilePlanRoot');
let current=null, permanent=false, busy=false;
const fmt=x=>Number.isFinite(Number(x))?Math.round(Number(x)).toLocaleString('ko-KR'):'—';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photo=id=>id?'/api/recipe/'+Number(id)+'/image':'';
const styles=`
:root{--ink:#172b44;--blue:#2659ab;--pale:#f1f5fa;--line:#e0e9f2}*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;background:#f5f7fa;color:var(--ink);padding:0;margin:0}
button,input{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid #a4c2ff;outline-offset:3px}
.mp-wrap{max-width:1050px;margin:0 auto;padding:20px 16px 70px}
.mp-hero{background:linear-gradient(130deg,#0e2544,#27599b);color:#fff;border-radius:19px;padding:24px;margin-bottom:14px}
.mp-hero span{color:#bce88f;font-size:11px;font-weight:900;letter-spacing:.12em}.mp-hero h1{font-size:clamp(23px,4vw,33px);margin:9px 0 7px}.mp-hero p{margin:0;color:#d9e8fa;font-size:13px;line-height:1.8}
.mp-status{border-radius:13px;padding:15px;margin:13px 0;background:#eef6ff;border:1px solid #d4e4f4;font-size:13px;line-height:1.7;color:#385d89}
.mp-status b{display:block;color:#163f73;margin-bottom:7px}.mp-status.warn{background:#fff6e7;border-color:#f3deba;color:#785e2f}
.mp-check{display:flex;align-items:flex-start;gap:9px;font-size:13px;margin:13px 0;color:#465c78;line-height:1.7}.mp-check input{width:18px;height:18px;margin-top:3px;flex-shrink:0}
.mp-primary,.mp-sub{display:inline-flex;justify-content:center;align-items:center;border-radius:11px;padding:12px 16px;text-decoration:none;min-height:43px;font-weight:900;font-size:13px}
.mp-primary{background:#245dbe;color:#fff;border:0}.mp-sub{background:#fff;color:#355c96;border:1px solid #d6e1ec}
.mp-actions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.mp-primary:disabled{background:#9fb4ce;cursor:not-allowed}
.mp-heading{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin:22px 0 12px}.mp-heading h2{font-size:21px;margin:0}.mp-heading p{color:#78899e;font-size:12px;margin:0}
.mp-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.mp-metric{background:#fff;border:1px solid var(--line);border-radius:13px;padding:14px}
.mp-metric span{display:block;font-size:11px;color:#6b7d93;font-weight:800}.mp-metric b{font-size:19px;color:#254a82;display:block;margin-top:8px}
.mp-week{border:1px solid #dce6f2;border-radius:16px;background:#fff;margin-top:16px;padding:15px}.mp-weekhead{padding:3px 2px 13px;border-bottom:1px solid #e4ecf4}
.mp-weekhead span{color:#2e64c1;font-weight:900;font-size:11px}.mp-weekhead h3{font-size:18px;margin:5px 0}
.mp-days{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:13px}
.mp-day{border:1px solid #dde6f0;border-radius:13px;padding:13px;min-width:0}.mp-day.train{border-left:4px solid #356fd1}.mp-day.rest{border-left:4px solid #a7b6ca}
.mp-dayhead{display:flex;justify-content:space-between;gap:8px;align-items:center}.mp-dayhead strong{font-size:13px}.mp-dayhead span{font-weight:900;font-size:11px;color:#3970cc}
.mp-meal{display:flex;align-items:center;gap:8px;border-top:1px dashed #edf1f6;padding:9px 0}.mp-meal figure{margin:0;width:48px;height:48px;flex-shrink:0;background:#eff4fb;border-radius:9px;overflow:hidden;display:grid;place-items:center;color:#5b7494}
.mp-meal img{width:100%;height:100%;object-fit:cover}.mp-meal .mp-mealtext{flex:1;min-width:0}.mp-meal small{display:block;color:#42629b;font-size:10px;font-weight:900}.mp-meal strong{display:block;font-size:12px;line-height:1.6;color:#344962}.mp-meal em{font-style:normal;font-size:10px;color:#8794a5}
.mp-recipe-btn{padding:7px 9px;background:#edf4ff;border:1px solid #c9dbf4;border-radius:8px;color:#2459aa;font-weight:900;font-size:11px}
.mp-rest{font-size:11px;color:#5d7189;line-height:1.7;padding-top:10px;border-top:1px dashed #edf1f6}.mp-rest b{color:#294b7e}
.mp-footer{background:#142f52;color:white;border-radius:19px;padding:23px;margin-top:26px}.mp-footer h2{font-size:22px;margin:0 0 9px}.mp-footer p{color:#d8e7f7;font-size:13px;line-height:1.8}.mp-footer a{margin-top:10px;background:#c8f295;color:#1d3927;display:inline-flex;align-items:center;padding:13px 17px;border-radius:11px;text-decoration:none;font-weight:900}
.mp-micro{font-size:11px;line-height:1.8;color:#8290a2;margin:13px 0}
.mp-modalshade{position:fixed;inset:0;background:#0b182cce;z-index:9000;display:flex;justify-content:center;align-items:center;padding:15px}
.mp-modal{max-width:610px;width:100%;max-height:90vh;overflow-y:auto;background:#fff;border-radius:17px;padding:19px}
.mp-modal header{display:flex;justify-content:space-between;align-items:center;gap:10px}.mp-modal h2{font-size:20px;margin:7px 0}
.mp-modalclose{font-weight:900;color:#4e6486;background:#eef3f8;border:0;border-radius:10px;padding:8px 11px}
.mp-coverphoto{width:100%;height:200px;object-fit:cover;border-radius:12px;margin:9px 0}.mp-modal h3{font-size:15px;margin:20px 0 8px}
.mp-ingredients{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.mp-ingredients div{display:flex;justify-content:space-between;gap:8px;background:#f4f8fd;padding:9px;border-radius:8px;font-size:12px}
.mp-modal ol,.mp-modal ul{padding-left:21px;color:#536b85;font-size:13px;line-height:1.95}.mp-modal p{font-size:12px;color:#6d7e92;line-height:1.8}
@media(max-width:680px){.mp-metrics{grid-template-columns:1fr 1fr}.mp-days{grid-template-columns:1fr}.mp-ingredients{grid-template-columns:1fr}.mp-wrap{padding:10px 10px 50px}.mp-hero{padding:20px}}
`;
const style=document.createElement('style');style.textContent=styles;document.head.appendChild(style);
function readStored(){
 try{
 const value=JSON.parse(localStorage.getItem(KEY)||'null');
 if(value&&value.version===1&&Array.isArray(value.days)&&value.days.length===28)return value;
 }catch{}
 return null;
}
function renderError(msg){
 root.innerHTML=hero()+'<div class="mp-status warn"><b>계획을 불러오지 못했습니다.</b>'+safe(msg)+'</div>'+
 '<div class="mp-actions"><a href="/receive" class="mp-sub">내 휴대전화에 저장한 계획 확인</a></div>'+
 '<p class="mp-micro">일회용 코드는 한 번 사용하거나 10분이 지나면 만료됩니다. 공용 웹사이트에서 새로운 코드를 생성해 주세요.</p>';
}
function hero(){return '<header class="mp-hero"><span>VIMS GYM · 나의 28일 계획</span><h1>내 휴대전화에서 이어보기</h1><p>일회성 공유 코드를 이용해 가져온 식사·운동·휴식과 참고 레시피입니다. 원본 인바디 측정값과 이름은 전송되지 않습니다.</p></header>';}
function weekCards(){
 let sections='';
 for(let w=0;w<4;w++){
  sections+='<section class="mp-week"><div class="mp-weekhead"><span>WEEK '+(w+1)+'</span><h3>'+(w+1)+'주차 계획</h3></div><div class="mp-days">';
  for(let d=w*7;d<w*7+7;d++){
    const x=current.days[d],kind=x.training?'근력운동일':'회복일';
    sections+='<article class="mp-day '+(x.training?'train':'rest')+'"><div class="mp-dayhead"><div><span>DAY '+String(x.day).padStart(2,'0')+'</span><strong> · '+kind+'</strong></div><small>유산소 '+fmt(x.aerobic)+'분</small></div>';
    for(const m of x.meals){
      const img=m.recipeId?'<img loading="lazy" alt="참고 레시피 사진" src="'+photo(m.recipeId)+'">':'♨';
      sections+='<div class="mp-meal"><figure>'+img+'</figure><div class="mp-mealtext"><small>'+LABEL[m.type]+'</small><strong>'+safe(m.title)+'</strong><em>'+fmt(m.kcal)+'킬로칼로리 · 참고 사진</em></div><button type="button" class="mp-recipe-btn" data-phone-recipe="'+d+':'+m.type+'">조리법</button></div>';
    }
    sections+='<div class="mp-rest"><b>운동</b> · '+(x.training?x.exercises.map(e=>safe(e.name)).join(' · '):'가벼운 활동과 회복')+'<br><b>휴식</b> · '+safe(x.rest)+'</div></article>';
  }
  sections+='</div></section>';
 }
 return sections;
}
function render(){
 if(!current){renderError('저장된 계획이 없습니다. 공용 기기에서 받은 큐알코드를 휴대전화로 스캔해 주세요.');return;}
 const status=permanent?
 '<div class="mp-status"><b>이 휴대전화에 28일 계획을 보관했습니다.</b>같은 휴대전화의 같은 브라우저에서 이 주소를 다시 열면 계획이 표시됩니다. 조리법 사진은 인터넷 연결이 필요합니다.</div>'+
 '<div class="mp-actions"><button type="button" class="mp-sub" data-phone-action="delete">내 휴대전화에서 계획 삭제</button></div>':
 '<div class="mp-status warn"><b>가져오기는 완료됐지만 아직 보관되지 않았습니다.</b>현재는 임시로 열려 있습니다. 개인 소유 휴대전화라면 아래 동의를 확인한 후 저장할 수 있습니다. 공용 기기라면 저장하지 마세요.</div>'+
 '<label class="mp-check"><input type="checkbox" id="mpPersonal"><span>이 기기는 개인 소유이며, 28일 계획을 이 브라우저에 보관하는 데 동의합니다.</span></label>'+
 '<div class="mp-actions"><button type="button" class="mp-primary" id="mpSave" data-phone-action="save" disabled>이 휴대전화에 28일 계획 보관하기</button><button type="button" class="mp-sub" data-phone-action="temporary">저장하지 않고 보기</button></div>';
 const summary='<div class="mp-metrics"><div class="mp-metric"><span>관리 목표</span><b>'+safe(current.goal)+'</b></div>'+
 '<div class="mp-metric"><span>하루 참고 열량</span><b>'+(current.kcal==null?'산출 보류':fmt(current.kcal)+'kcal')+'</b></div>'+
 '<div class="mp-metric"><span>하루 단백질 참고</span><b>'+(current.protein==null?'—':fmt(current.protein)+'g')+'</b></div></div>';
 root.innerHTML=hero()+status+summary+'<div class="mp-heading"><h2>28일 식사 · 운동 · 휴식</h2><p>사진과 조리법을 눌러 식재료 분량을 확인하세요.</p></div>'+weekCards()+
 '<div class="mp-footer"><h2>더 전문적인 관리가 필요하신가요?</h2><p>이 계획은 시작점입니다. 빔스짐 트레이너와 운동 자세, 개인별 식단, 회복과 회원 등록 방법을 상담해 보세요.</p>'+
 '<a href="'+TALK+'" target="_blank" rel="noopener noreferrer">네이버 톡톡 · 맞춤 상담 문의 ↗</a></div>'+
 '<p class="mp-micro">안내: 화면의 음식 사진은 별도의 비슷한 참고 레시피일 수 있고, 계획에 적힌 식재료 중량과 원본 참고 레시피의 분량은 다를 수 있습니다. 열량은 일반 식품 성분 추정치이며 의료적 식단 처방이 아닙니다. 개인 기기가 아닌 곳에는 저장하지 마세요.</p>';
}
async function showRecipe(dayIdx,type){
 if(!current)return;
 const entry=current.days?.[dayIdx]?.meals?.find(m=>m.type===type);
 if(!entry)return;
 const modal=document.createElement('div');modal.className='mp-modalshade';modal.id='mpModal';
 const products=entry.items.map(x=>'<div><span>'+safe(x.name)+'</span><b>'+fmt(x.g)+'g</b></div>').join('');
 modal.innerHTML='<div class="mp-modal" role="dialog" aria-modal="true"><header><b>'+LABEL[type]+' · DAY '+(dayIdx+1)+'</b><button type="button" data-phone-action="close" class="mp-modalclose">닫기 ×</button></header>'+
 '<h2>'+safe(entry.title)+'</h2><p>이 끼니의 개인별 식재료 분량입니다. 예상 '+fmt(entry.kcal)+'킬로칼로리, 단백질 '+fmt(entry.protein)+'g.</p>'+
 '<h3>계획표에 포함된 재료와 중량</h3><div class="mp-ingredients">'+products+'</div>'+
 '<div id="mpRecipeSource"><p>참고 레시피를 불러오고 있습니다…</p></div></div>';
 document.body.appendChild(modal);document.body.style.overflow='hidden';
 const target=modal.querySelector('#mpRecipeSource');
 if(!entry.recipeId){target.innerHTML='<p>정확히 일치하는 기존 레시피가 없어 계획표의 재료를 기준으로 조리해 주세요. 익히는 재료는 충분히 가열하고 개인 알레르기를 확인하세요.</p>';return;}
 try{
 const resp=await fetch('/api/recipe/'+Number(entry.recipeId),{cache:'force-cache'});
 if(!resp.ok)throw Error('레시피 정보 수신 실패');
 const ref=await resp.json();
 if(!target.isConnected)return;
 target.innerHTML='<h3>비슷한 참고 레시피 · '+safe(ref.name)+'</h3>'+
 '<img class="mp-coverphoto" loading="lazy" alt="'+safe(ref.name)+' 참고 요리 사진" src="'+photo(entry.recipeId)+'">'+
 '<p><b>참고 안내</b> · 이 레시피는 계획표의 음식과 완전히 같지 않을 수 있습니다. 식재료와 중량은 반드시 위의 개인별 계획을 우선하세요.</p>'+
 '<h3>원본 참고 레시피의 조리 순서</h3><ol>'+(ref.steps||[]).map(x=>'<li>'+safe(x)+'</li>').join('')+'</ol>'+
 ((ref.tips||[]).length?'<h3>조리 팁</h3><ul>'+ref.tips.map(x=>'<li>'+safe(x)+'</li>').join('')+'</ul>':'');
 }catch(e){if(target.isConnected)target.innerHTML='<p>참고 레시피를 일시적으로 불러올 수 없습니다. 위의 식재료와 중량은 그대로 확인하실 수 있습니다.</p>';}
}
async function redeem(code){
 if(busy)return;busy=true;
 root.innerHTML=hero()+'<div class="mp-status"><b>일회용 계획표를 가져오는 중입니다.</b>완료되면 휴대전화 보관 여부를 선택할 수 있습니다.</div>';
 try{
 const response=await fetch('/api/handoff/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code}),cache:'no-store'});
 const result=await response.json();
 if(!response.ok)throw Error(result.detail||'전달 코드가 만료됐습니다.');
 if(result.version!==1||!Array.isArray(result.days)||result.days.length!==28)throw Error('가져온 계획 형식이 올바르지 않습니다.');
 current=result;permanent=false;render();
 }catch(e){const stored=readStored();if(stored){current=stored;permanent=true;render();}else renderError(e.message||'잠시 후 다시 시도해 주세요.');}
 finally{busy=false;}
}
document.addEventListener('click',e=>{
 const action=e.target.closest('[data-phone-action]');
 if(action){
  const command=action.dataset.phoneAction;
  if(command==='close'){document.getElementById('mpModal')?.remove();document.body.style.overflow='';}
  if(command==='save'){
   const agree=document.getElementById('mpPersonal');
   if(!agree?.checked||!current)return;
   try{localStorage.setItem(KEY,JSON.stringify(current));permanent=true;render();window.scrollTo(0,0);}
   catch{window.alert('휴대전화 저장 공간을 사용할 수 없습니다. 인터넷 연결 상태로 임시 열람해 주세요.');}
  }
  if(command==='delete'){
   if(!window.confirm('이 휴대전화에 저장한 28일 계획을 삭제하시겠습니까?'))return;
   try{localStorage.removeItem(KEY);}catch{}
   current=null;permanent=false;render();
  }
  if(command==='temporary'){document.getElementById('mpSave')?.scrollIntoView({block:'nearest'});}
  return;
 }
 const link=e.target.closest('[data-phone-recipe]');
 if(link){const [day,type]=link.dataset.phoneRecipe.split(':');showRecipe(Number(day),type);}
});
document.addEventListener('change',e=>{if(e.target?.id==='mpPersonal'){const b=document.getElementById('mpSave');if(b)b.disabled=!e.target.checked;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.getElementById('mpModal')?.remove();document.body.style.overflow='';}});
const match=location.hash.match(/(?:^#|&)code=([A-Za-z0-9_-]{20,40})(?:&|$)/);
try{history.replaceState(null,'',location.pathname);}catch{}
if(match){redeem(match[1]);}
else{const stored=readStored();if(stored){current=stored;permanent=true;render();}else renderError('저장된 계획이 없습니다. 빔스짐 공용 화면에서 전달 큐알코드를 만들어 스캔해 주세요.');}
})();
