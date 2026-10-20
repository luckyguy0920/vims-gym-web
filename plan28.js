
(function(){
'use strict';
const f=window.VimsNutrition?.foods||{};
const money=x=>Math.round(x).toLocaleString('ko-KR');
const clean=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups={b:'아침',l:'점심',d:'저녁',s:'간식'};
const shares={b:.26,l:.34,d:.30,s:.10};
const foodSets={
b:[
 ['귀리·베리 요거트',[['greek',200],['oat',60],['berries',130],['almond',12],['milk',80]],'greek','oat','almond'],
 ['통밀빵·달걀·사과',[['egg',115],['bread',95],['tomato',130],['greek',100],['apple',130],['olive',5]],'egg','bread','olive'],
 ['두부·현미·시금치',[['tofu',200],['brown',165],['spinach',100],['orange',145],['olive',8]],'tofu','brown','olive'],
 ['바나나·귀리 그릭볼',[['greek',200],['oat',65],['banana',110],['walnut',14],['milk',70]],'greek','oat','walnut'],
 ['달걀·현미·시금치',[['egg',110],['brown',175],['spinach',120],['greek',100],['olive',6]],'egg','brown','olive'],
 ['통밀달걀 토스트',[['egg',105],['bread',90],['tomato',140],['orange',150],['greek',100],['olive',7]],'egg','bread','olive'],
 ['귀리·사과·견과',[['greek',200],['oat',62],['apple',140],['almond',15],['milk',80]],'greek','oat','almond']
],
l:[
 ['닭가슴살 현미채소볼',[['chicken',140],['brown',190],['broccoli',175],['kimchi',30],['olive',9]],'chicken','brown','olive'],
 ['연어·현미·채소',[['salmon',140],['brown',190],['mixed',200],['olive',7]],'salmon','brown','olive'],
 ['두부·병아리콩 현미볼',[['tofu',210],['chickpea',130],['brown',130],['mixed',220],['olive',9]],'tofu','brown','olive'],
 ['소고기·버섯 현미밥',[['beef',140],['brown',190],['mushroom',130],['mixed',170],['olive',8]],'beef','brown','olive'],
 ['닭고기·고구마·채소',[['chicken',145],['sweet',240],['mixed',215],['olive',8]],'chicken','sweet','olive'],
 ['고등어·현미·브로콜리',[['mackerel',145],['brown',180],['broccoli',200],['kimchi',30],['olive',5]],'mackerel','brown','olive'],
 ['닭고기·렌틸콩 현미볼',[['chicken',120],['lentil',140],['brown',120],['mixed',200],['olive',9]],'chicken','brown','olive']
],
d:[
 ['두부·현미·버섯 한상',[['tofu',230],['brown',165],['broccoli',165],['mushroom',110],['olive',8]],'tofu','brown','olive'],
 ['닭고기·감자·채소',[['chicken',140],['potato',240],['mixed',210],['olive',9]],'chicken','potato','olive'],
 ['소고기·시금치 현미밥',[['beef',140],['brown',170],['spinach',140],['mushroom',105],['olive',8]],'beef','brown','olive'],
 ['연어·고구마·채소',[['salmon',145],['sweet',220],['mixed',210],['olive',7]],'salmon','sweet','olive'],
 ['두부·렌틸콩 현미볼',[['tofu',220],['lentil',135],['brown',130],['broccoli',170],['olive',9]],'tofu','brown','olive'],
 ['닭가슴살·현미·브로콜리',[['chicken',145],['brown',170],['broccoli',210],['kimchi',30],['olive',8]],'chicken','brown','olive'],
 ['고등어·감자·채소',[['mackerel',135],['potato',240],['mixed',200],['olive',7]],'mackerel','potato','olive']
],
s:[
 ['요거트·사과·아몬드',[['greek',175],['apple',145],['almond',15]],'greek','apple','almond'],
 ['요거트·베리·호두',[['greek',180],['berries',125],['walnut',14]],'greek','berries','walnut'],
 ['요거트·바나나·아몬드',[['greek',170],['banana',115],['almond',14]],'greek','banana','almond'],
 ['우유·베리·요거트',[['greek',150],['berries',130],['milk',160],['almond',10]],'greek','berries','almond'],
 ['요거트·오렌지·호두',[['greek',180],['orange',145],['walnut',14]],'greek','orange','walnut'],
 ['요거트·사과·호두',[['greek',175],['apple',150],['walnut',14]],'greek','apple','walnut'],
 ['요거트·베리·아몬드',[['greek',175],['berries',135],['almond',13]],'greek','berries','almond']
]};
const routinePool=[
 ['legpress','chest','row','abs'],
 ['v-squat','pulldown','hip','legcurl'],
 ['calf','pec','highrow','legcurl'],
 ['legpress','shoulder','row','hip'],
 ['v-squat','chest','highrow','abs'],
 ['calf','pulldown','pec','hip']
];
const exerciseById=Object.fromEntries(exercises.map(e=>[e.id,e]));
const weekText=[
 ['적응과 확인','무리하지 않고 기구 사용법·식사 기록 익히기'],
 ['규칙성 만들기','매끼 단백질과 채소, 정해진 운동 요일 유지'],
 ['꾸준한 자극','자세가 안정되면 반복수·부하를 소폭 조절'],
 ['회복과 점검','다음 28일을 준비하며 몸 상태와 실천율 확인']
];
const opts=state.nutritionPrefs||{};
function nutrition(){
 const b=state.body||{},p=state.profile||{},w=val(b.weight),h=val(b.height),s=val(b.smm),pbf=val(b.pbf),fm=val(b.fatMass);
 const bmi=w!=null&&h!=null&&h>0?w/(h*h/10000):null;
 const fat=fm!=null?fm:(w!=null&&pbf!=null?w*pbf/100:null);
 const lean=w!=null&&fat!=null&&fat>=0&&fat<w?w-fat:null;
 const age=Number(p.age),sex=p.sex,activity=p.activity;
 const notes=[],review=[];
 const kind=(state.goal||{}).kind||'fitness';
 if(w==null||h==null||w<35||w>220||h<130||h>215)review.push('인바디 신장·체중이 유효하지 않아 개인 열량 계산을 보류했습니다.');
 if(lean==null)review.push('체지방량 또는 체지방률이 없어 원본 측정 결과를 확인해야 합니다.');
 if(bmi!=null&&(bmi<18.5||bmi>=40))review.push('현재 체중 상태에서는 의료진·영양사 등 전문가의 개별 평가가 우선입니다.');
 if(fm!=null&&pbf!=null&&w!=null&&Math.abs(fm/w*100-pbf)>1.5)review.push('체지방량과 체지방률이 일치하지 않아 결과지 확인이 필요합니다.');
 if(s!=null&&w!=null&&s>=w*.65)review.push('골격근량 값이 다른 수치와 일치하는지 확인이 필요합니다.');
 if(!Number.isInteger(age)||age<18||age>79||!['male','female'].includes(sex))review.push('만 나이와 대사량 계산 기준이 필요합니다.');
 if(!['sedentary','light','moderate','high'].includes(activity))review.push('평소 활동량을 확인해 주세요.');
 if(p.special!=='none')review.push('별도 의료적 관리·알레르기·임신·수유 등 개인별 확인이 필요합니다.');
 if(kind==='fat'&&bmi!=null&&bmi<20.5)review.push('현재 체질량지수에서는 자동 감량 열량을 제시하지 않습니다.');
 if(age>=65)notes.push('65세 이상은 회복 상태와 근감소 위험을 고려해 근력·식사 계획을 트레이너 및 영양 전문가와 조정하세요.');
 const bmr=review.length?null:Math.round(10*w+6.25*h-5*age+(sex==='male'?5:-161));
 const factor={sedentary:1.2,light:1.375,moderate:1.55,high:1.725}[activity];
 const maintenance=bmr==null?null:Math.round(bmr*factor);
 let shift=0;
 if(maintenance!=null){
  if(kind==='fat'&&age<65)shift=-Math.min(350,maintenance*.14);
  else if(kind==='muscle')shift=Math.min(200,maintenance*.08);
  else if(kind==='recomp'&&age<65)shift=-Math.min(120,maintenance*.05);
  if(kind==='fat'&&age>=65)notes.push('65세 이상은 일률적인 열량 감량보다 안정적인 영양 섭취와 기능 유지부터 권장합니다.');
 }
 let kcal=maintenance==null?null:Math.round((maintenance+shift)/50)*50;
 const minimum=sex==='male'?1600:1400;
 if(kcal!=null&&(kcal<minimum||kcal<1.08*bmr||kcal>3600)){
  review.push('계산된 열량이 자동 계획 참고 범위 밖이므로 개별 조정을 권장합니다.');
  kcal=null;
 }
 const reference=w!=null&&h!=null?Math.min(w,27*(h/100)**2):null;
 const proRate=age>=65?({fat:1.5,muscle:1.6,recomp:1.5,fitness:1.4}[kind]||1.4):
  ({fat:1.7,muscle:1.8,recomp:1.6,fitness:1.4}[kind]||1.4);
 const protein=kcal!=null&&reference!=null?Math.round(reference*proRate):null;
 const fats=kcal==null?null:Math.round(kcal*.28/9);
 const carbs=kcal==null||protein==null||fats==null?null:Math.max(0,Math.round((kcal-4*protein-9*fats)/4));
 return {w,h,s,pbf,fm,lean,bmi,age,sex,activity,bmr,notes:[...review,...notes],needsReview:review.length>0,
  kcal,maintenance,protein,fats,carbs,kind};
}
function nutrient(items){
 let a={kcal:0,p:0,c:0,f:0,fiber:0};
 for(const it of items){let x=f[it.k];if(!x)continue;let z=it.g/100,p=x[1]*z,c=x[2]*z,fat=x[3]*z;a.p+=p;a.c+=c;a.f+=fat;a.kcal+=4*p+4*c+9*fat;a.fiber+=x[4]*z;}
 return a;
}
function meal(type,day,target,protein){
 const set=foodSets[type][(day-1+Math.floor((day-1)/7)*2)%7];let [title,raw,pro,carb,lipid]=set;
 const pref=(state.nutritionPrefs||{}).preference||'regular';
 const replacement=k=>pref==='vegetarian'&&['chicken','beef','salmon','mackerel'].includes(k)?'tofu':pref==='noFish'&&['salmon','mackerel'].includes(k)?'chicken':k;
 const items=raw.map(([k,g])=>({k:replacement(k),g}));
 pro=replacement(pro);
 if(pref==='vegetarian')title=title.replace(/고등어|연어|닭가슴살|닭고기|소고기/g,'두부');
 else if(pref==='noFish')title=title.replace(/고등어|연어/g,'닭고기');
 if(target!=null&&protein!=null){
  const pi=items.findIndex(x=>x.k===pro),ci=items.findIndex(x=>x.k===carb),fi=items.findIndex(x=>x.k===lipid);
  if(pi>=0&&ci>=0&&fi>=0){
   for(let z=0;z<5;z++){
    let q=nutrient(items),unitP=f[pro]?.[1]/100||0;
    if(unitP)items[pi].g=Math.round(Math.max(60,Math.min(pro==='tofu'?490:pro==='egg'?250:pro==='greek'?460:280,items[pi].g+(protein-q.p)/unitP))/5)*5;
    q=nutrient(items);const fc=f[carb];const ec=(fc[1]*4+fc[2]*4+fc[3]*9)/100;
    if(ec)items[ci].g=Math.round(Math.max(20,Math.min(carb==='oat'?180:carb==='bread'?230:470,items[ci].g+(target-q.kcal)/ec))/5)*5;
    q=nutrient(items);const oil=f[lipid];const ef=(oil[1]*4+oil[2]*4+oil[3]*9)/100;
    if(ef)items[fi].g=Math.round(Math.max(0,Math.min(lipid==='olive'?35:50,items[fi].g+(target-q.kcal)/ef))/5)*5;
   }
  }
 }
 return {type,title,items,...nutrient(items)};
}
function sessionDays(week){const count=Math.max(2,Math.min(4,Math.round(weekTargets(week).sessions||3)));return {2:[1,4],3:[1,3,5],4:[1,2,4,6]}[count];}
function session(day){
 const wk=Math.floor((day-1)/7),wd=(day-1)%7+1,slot=sessionDays(wk),index=slot.indexOf(wd),training=index>=0;
 const base=weekTargets(wk),older=Number(state.profile?.age)>=65;
 const wt=older?{...base,sets:Math.min(base.sets,2),reps:'8~12회',rest:'90~120초',mins:Math.min(base.mins,120)}:base;
 const days=slot.length;
 const types=days===4?[0,2,1,5]:days===2?[0,3]:[0,1,2];
 const indexOfRoutine=training?types[(index+wk)%days]:-1;
 const machines=training?routinePool[indexOfRoutine].map(id=>exerciseById[id]).filter(Boolean):[];
 const cardio=Math.floor(wt.mins/7)+(wd<=wt.mins%7?1:0);
 return {wk,wd,training,machines,cardio,wt};
}
function daily(day,calc){
 const s=session(day),meals=Object.keys(groups).map(k=>meal(k,day,calc.kcal==null?null:calc.kcal*shares[k],calc.protein==null?null:calc.protein*shares[k]));
 const sum=meals.reduce((a,m)=>{a.kcal+=m.kcal;a.p+=m.p;a.fiber+=m.fiber;return a;},{kcal:0,p:0,fiber:0});
 return {day,s,meals,sum};
}
const rules=`
.v28{max-width:1280px;margin:auto}.v28banner{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:23px;border-radius:20px;background:linear-gradient(120deg,#112744,#2458a9);color:white}
.v28banner h2{font-size:26px;margin:6px 0}.v28banner p{color:#dfe9ff;line-height:1.7;font-size:13px;margin:0}.v28tag{display:inline-flex;padding:6px 10px;border-radius:50px;background:#ffffff2b;font-size:11px;font-weight:800}
.v28stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:13px 0}.v28stat{padding:15px;border:1px solid #e2e8f0;background:#fff;border-radius:13px;min-width:0}.v28stat small{display:block;font-size:11px;color:#67798e;line-height:1.6}.v28stat b{display:block;font-size:22px;color:#254978;margin:7px 0}
.v28note{border-radius:12px;background:#eff5ff;border:1px solid #d9e5f9;margin:12px 0;padding:15px;color:#425d81;font-size:12px;line-height:1.8}.v28note b{display:block;font-size:14px;color:#254978}
.v28week{margin:24px 0 12px}.v28week h3{font-size:18px;margin:0 0 5px}.v28week p{font-size:12px;color:#61758f;margin:0;line-height:1.6}.v28weekbar{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 12px}.v28weekbar span{font-size:11px;border-radius:100px;background:#eaf1fe;color:#2d579e;padding:6px 11px;font-weight:800}
.v28days{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.v28card{background:#fff;border:1px solid #e1e7ef;border-radius:14px;padding:15px;min-width:0}.v28card.train{border-left:5px solid #346bdf}.v28card.rest{border-left:5px solid #9db1cc}
.v28cardhead{display:flex;justify-content:space-between;gap:9px;align-items:flex-start}.v28cardhead small{display:block;color:#3265c6;font-weight:900;font-size:11px}.v28cardhead b{font-size:16px}.v28pill{display:inline-block;background:#f0f4f9;border-radius:99px;color:#58708c;padding:6px 9px;font-size:11px;font-weight:800}
.v28line{display:grid;grid-template-columns:37px 1fr;gap:9px;padding:9px 0;border-top:1px dashed #e4ebf4;margin-top:8px;font-size:12px;line-height:1.65;color:#566c86}.v28line>b{color:#244771}.v28line strong{color:#293d55}.v28line small{display:block;color:#768ba6;font-size:11px}
.v28card details{font-size:11px;color:#506982;line-height:1.7;border-top:1px dashed #e5eaf0;padding-top:9px}.v28card summary{cursor:pointer;font-weight:800;color:#2d62c4}.v28detail{padding:5px}.v28actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}
.v28warn{border-radius:12px;padding:15px;background:#fff8e9;border:1px solid #eddcb8;color:#765f36;line-height:1.8;font-size:12px}
@media(max-width:1024px){.v28stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:700px){.v28days{grid-template-columns:1fr}.v28banner h2{font-size:23px}.v28stat b{font-size:19px}}
@media print{body *{visibility:hidden!important}#view,#view *{visibility:visible!important}#view{position:absolute;left:0;top:0;width:100%;max-width:none;padding:0}.v28actions,.v28banner button,.v28card button{display:none!important}.v28days{grid-template-columns:repeat(2,minmax(0,1fr))}.v28card{break-inside:avoid}.v28banner{background:#fff!important;color:#222!important}.v28banner p{color:#444!important}}
`;
const style=document.createElement('style');style.textContent=rules;document.head.appendChild(style);
const stat=(k,v,m)=>'<div class="v28stat"><small>'+k+'</small><b>'+v+'</b><small>'+m+'</small></div>';
function page(){
 if(!hasCourse())return title('나의 28일 계획','인바디 입력 후 나의 계획을 확인하세요.')+
 '<div class="card empty"><h2>인바디 입력이 필요해요</h2><button class="btn primary" data-action="route" data-value="body">인바디 입력 →</button></div>';
 const c=nutrition(),dname=clean(state.name||'회원');
 const kindLabel=clean(goalLabel()),bodyStats=
 stat('현재 체중',c.w==null?'—':c.w.toFixed(1)+' kg','인바디 측정값')+
 stat('체지방률',c.pbf==null?'—':c.pbf.toFixed(1)+' %','인바디 측정값')+
 stat('골격근량',c.s==null?'—':c.s.toFixed(1)+' kg','인바디')+
 stat('제지방량',c.lean==null?'—':c.lean.toFixed(1)+' kg','추정치');
 const nutritionStats=stat('하루 열량',c.kcal==null?'계산 보류':money(c.kcal)+' kcal','참고값')+
 stat('단백질',c.protein==null?'—':money(c.protein)+' g','목표 기준')+
 stat('탄수화물',c.carbs==null?'—':money(c.carbs)+' g','열량 배분')+
 stat('지방',c.fats==null?'—':money(c.fats)+' g','열량 배분');
 let html=title('나의 28일 계획','식사 · 운동 · 휴식을 한눈에')+
 '<div class="v28"><div class="v28banner"><div><span class="v28tag">VIMS GYM · 28일 플랜</span><h2>'+kindLabel+'</h2><p>28일 식단 · 운동 · 회복<br>식재료와 레시피까지 확인하세요.</p></div></div>'+
 '<div class="v28stats">'+bodyStats+'</div><div class="v28note"><b>개인 설정</b>'+clean(c.age)+'세 · '+(c.sex==='male'?'남성 계수':'여성 계수')+' · '+({sedentary:'활동 적음',light:'가벼운 활동',moderate:'보통 활동',high:'높은 활동량'}[c.activity]||'활동 미확인')+' · '+({beginner:'초보',intermediate:'중급',advanced:'숙련'}[state.profile?.experience]||'운동 경험 미확인')+'<br>기초대사량 '+(c.bmr==null?'보류':money(c.bmr)+'킬로칼로리')+' (추정)</div><div class="v28stats">'+nutritionStats+'</div>'+
 '<div class="v28note"><b>계산 안내</b>인바디 · 나이 · 활동량을 반영한 추정 계획입니다.'+
 c.notes.map(m=>'<div>• '+clean(m)+'</div>').join('')+'</div>';
 for(let w=0;w<4;w++){
  const wk=weekText[w],targets=weekTargets(w);
  html+='<details class="v28weekpanel"'+(w===0?' open':'')+'><summary class="v28weeksummary"><div class="v28week"><h3>'+(w+1)+'주차 · '+wk[0]+'</h3><p>'+wk[1]+'</p></div><span class="v28chevron" aria-hidden="true">⌄</span></summary><div class="v28weekbar"><span>근력 주 '+sessionDays(w).length+'회</span><span>유산소 '+targets.mins+'분/주</span><span>'+targets.sets+'세트 · '+targets.reps+'</span></div><div class="v28days">';
  for(let day=w*7+1;day<=w*7+7;day++){
   const v=daily(day,c),s=v.s;
   const menu=v.meals.map(m=>'<div><strong>'+groups[m.type]+'</strong> '+clean(m.title)+(c.kcal==null?'':' <small>약 '+money(m.kcal)+' kcal</small>')+'</div>').join('');
   const train=s.training?'<strong>근력 4종 · '+s.wt.sets+'세트 × '+s.wt.reps+'</strong><small>'+s.machines.map(e=>clean(e.name)).join(' · ')+'</small><small>세트 사이 '+s.wt.rest+' 휴식</small>':'<strong>회복일</strong><small>가벼운 걷기 · 스트레칭 5~10분</small>';
   const portion=v.meals.map(m=>'<div class="v28detail"><b>'+groups[m.type]+'</b> · '+m.items.map(it=>clean(f[it.k]?.[0]||it.k)+' '+money(it.g)+'g').join(', ')+'</div>').join('');
   html+='<article class="v28card '+(s.training?'train':'rest')+'"><div class="v28cardhead"><div><small>DAY '+String(day).padStart(2,'0')+'</small><b>'+(s.training?'운동일':'회복일')+'</b></div><span class="v28pill">유산소 '+s.cardio+'분</span></div>'+
   '<div class="v28line"><b>식사</b><div>'+menu+(c.kcal==null?'':'<small>총 '+money(v.sum.kcal)+' kcal · 단백질 '+money(v.sum.p)+' g</small>')+'</div></div>'+
   '<div class="v28line"><b>운동</b><div>'+train+'</div></div>'+
   '<div class="v28line"><b>휴식</b><div>'+ (s.training?'정리운동 · 통증 확인':'가벼운 활동 · 충분한 휴식') +'<small>수면 '+(Number(state.profile?.age)>=65?'7~8시간':'7~9시간')+' · 컨디션에 맞춰 조절</small></div></div>'+
   '<details><summary>식재료 보기</summary>'+portion+'<div class="v28detail">식이섬유 '+money(v.sum.fiber)+' g</div></details>'+
   '<button class="btn ghost small" style="margin-top:10px" data-action="day-diet" data-value="'+day+'">DAY '+day+' 식사·운동 기록 →</button></article>';
  }
  html+='</div></details>';
 }
 return html+'<div class="v28actions"><button class="btn primary" data-action="route" data-value="body">설정 수정</button><button class="btn ghost" data-action="route" data-value="nutrition">식단 보기</button></div>'+
 '<div class="v28warn"><b>이용 안내</b><p>성인용 참고 계획입니다. 열량은 추정치이며, 질환·알레르기·임신·부상 등은 전문가와 별도 확인이 필요합니다.</p></div></div>';
}
plan=page;
const previousRender=render;
render=function(){
 previousRender();
 if(['home','body','course','nutrition'].includes(route)){
  const v=document.querySelector('#view');
  if(v&&!v.querySelector('[data-plan28="open"]')){
   const wrap=document.createElement('div');wrap.className='v28actions';wrap.innerHTML='<button class="btn primary" type="button" data-action="route" data-value="plan" data-plan28="open">28일 계획 보기 →</button>';
   v.insertBefore(wrap,v.firstChild);
  }
 }
 const m=document.querySelector('#mobileNav');
 if(m&&!m.querySelector('[data-value="plan"]')){
  const entry=m.querySelector('[data-value="course"]')||m.querySelector('[data-value="nutrition"]');
  if(entry){entry.dataset.value='plan';entry.classList.toggle('active',route==='plan');entry.innerHTML='<span>▦</span><span>28일</span>';}
 }
};
document.addEventListener('click',function(e){if(e.target.closest('[data-plan28="print"]')){e.preventDefault();window.print();}});
window.VimsPlan28={nutrition,meal,session,daily,page};
render();
})();
