
(function(){
'use strict';
const N_FOOD={
  oat:['귀리(마른 것)',13,67,7,10,'grain'], brown:['현미밥(지은 것)',2.6,23,0.9,1.8,'grain'],
  bread:['통밀빵',11,45,4,7,'grain'], sweet:['고구마(찐 것)',1.6,20,0.1,3,'grain'],
  potato:['감자(삶은 것)',2,19,0.1,1.8,'grain'],
  greek:['그릭요거트(무가당)',10,4,3.5,0,'dairy'], milk:['우유',3.4,5,3.5,0,'dairy'],
  egg:['달걀(조리한 것)',13,1.1,10,0,'protein'], tofu:['두부',8,2,4.5,0.6,'protein'],
  chicken:['닭가슴살(익힌 것)',31,0,3.6,0,'protein'],
  beef:['소고기 살코기(익힌 것)',26,0,8,0,'protein'],
  salmon:['연어(익힌 것)',22,0,12,0,'fish'],
  mackerel:['고등어(익힌 것)',20,0,14,0,'fish'],
  lentil:['렌틸콩(삶은 것)',9,20,0.4,8,'legume'],
  chickpea:['병아리콩(삶은 것)',8.8,27,2.6,7.6,'legume'],
  berries:['베리류',1,12,0.4,5,'fruit'], banana:['바나나',1.1,23,0.3,2.6,'fruit'],
  apple:['사과',0.3,14,0.2,2.4,'fruit'], orange:['오렌지',0.9,12,0.1,2.4,'fruit'],
  broccoli:['브로콜리(익힌 것)',2.8,7,0.4,2.6,'veg'],
  spinach:['시금치(익힌 것)',3,4,0.4,2.2,'veg'],
  mixed:['혼합채소(익힌 것)',1.4,7,0.3,2.6,'veg'],
  tomato:['토마토',0.9,3.9,0.2,1.2,'veg'],
  mushroom:['버섯',3,3.3,0.3,1,'veg'],
  kimchi:['김치',1.1,3.5,0.5,1.6,'veg'],
  olive:['올리브유',0,0,100,0,'fat'], almond:['아몬드',21,22,50,12.5,'fat'],
  walnut:['호두',15,14,65,6.7,'fat']
};
const N_TEMPLATES={
 breakfast:[
 ['귀리·요거트·베리볼',[['oat',55],['greek',190],['berries',120],['almond',15],['milk',70]],'greek','oat','almond'],
 ['달걀·통밀토스트',[['egg',120],['bread',90],['tomato',130],['apple',140],['olive',6],['greek',75]],'egg','bread','olive'],
 ['두부·현미 아침상',[['tofu',180],['brown',135],['spinach',100],['egg',50],['orange',150],['olive',5]],'tofu','brown','olive'],
 ['바나나·귀리 요구르트볼',[['greek',200],['oat',55],['banana',120],['walnut',14],['milk',70]],'greek','oat','walnut'],
 ['두부·달걀 통밀샌드위치',[['tofu',150],['bread',90],['egg',50],['tomato',160],['orange',120],['olive',5]],'tofu','bread','olive'],
 ['베리·귀리·견과볼',[['greek',210],['oat',55],['berries',150],['walnut',14],['milk',60]],'greek','oat','walnut'],
 ['달걀·시금치 현미식사',[['egg',110],['brown',160],['spinach',100],['tofu',110],['apple',140],['olive',6]],'egg','brown','olive']
 ],
 lunch:[
 ['닭가슴살 현미채소볼',[['chicken',145],['brown',190],['broccoli',170],['kimchi',35],['olive',9]],'chicken','brown','olive'],
 ['연어·현미·구운채소',[['salmon',145],['brown',185],['mixed',220],['olive',7]],'salmon','brown','olive'],
 ['두부·병아리콩 현미볼',[['tofu',220],['chickpea',110],['brown',130],['mixed',210],['olive',10]],'tofu','brown','olive'],
 ['소고기·버섯 현미덮밥',[['beef',135],['brown',175],['mushroom',130],['mixed',160],['olive',7]],'beef','brown','olive'],
 ['닭가슴살·고구마 식사',[['chicken',145],['sweet',235],['mixed',210],['olive',9]],'chicken','sweet','olive'],
 ['고등어·현미·브로콜리',[['mackerel',135],['brown',175],['broccoli',190],['kimchi',35],['olive',5]],'mackerel','brown','olive'],
 ['렌틸콩·닭고기 채소볼',[['chicken',115],['lentil',140],['brown',120],['mixed',210],['olive',8]],'chicken','brown','olive']
 ],
 dinner:[
 ['두부·채소·현미 한상',[['tofu',240],['brown',155],['broccoli',150],['mushroom',100],['olive',9]],'tofu','brown','olive'],
 ['닭고기·감자·샐러드',[['chicken',145],['potato',235],['mixed',200],['olive',10]],'chicken','potato','olive'],
 ['소고기·시금치 덮밥',[['beef',130],['brown',160],['spinach',140],['mushroom',120],['olive',8]],'beef','brown','olive'],
 ['연어·고구마·채소',[['salmon',145],['sweet',225],['mixed',200],['olive',6]],'salmon','sweet','olive'],
 ['두부·렌틸콩 현미볼',[['tofu',235],['lentil',120],['brown',120],['broccoli',185],['olive',8]],'tofu','brown','olive'],
 ['닭가슴살·브로콜리 현미밥',[['chicken',130],['brown',180],['broccoli',210],['kimchi',35],['olive',8]],'chicken','brown','olive'],
 ['고등어·감자·채소',[['mackerel',130],['potato',230],['mixed',200],['olive',6]],'mackerel','potato','olive']
 ],
 snack:[
 ['그릭요거트·사과·아몬드',[['greek',180],['apple',150],['almond',15]],'greek','apple','almond'],
 ['그릭요거트·베리·호두',[['greek',180],['berries',120],['walnut',16]],'greek','berries','walnut'],
 ['그릭요거트·바나나·아몬드',[['greek',175],['banana',120],['almond',15]],'greek','banana','almond'],
 ['우유·베리·그릭요거트',[['greek',150],['berries',110],['almond',16],['milk',150]],'greek','berries','almond'],
 ['그릭요거트·오렌지·호두',[['greek',190],['orange',150],['walnut',15]],'greek','orange','walnut'],
 ['그릭요거트·사과·호두',[['greek',180],['apple',140],['walnut',16]],'greek','apple','walnut'],
 ['그릭요거트·베리·아몬드',[['greek',180],['berries',135],['almond',16]],'greek','berries','almond']
 ]
};
const N_LABELS={breakfast:'아침',lunch:'점심',dinner:'저녁',snack:'간식'};
const N_SHARES={breakfast:.25,lunch:.35,dinner:.30,snack:.10};
let nDay=0;
let nOffset=0;
const nFmt=(n)=>Math.round(n).toLocaleString('ko-KR');
const nRound=(n)=>Math.round(n*10)/10;
const nLimit=(x,a,b)=>Math.min(b,Math.max(a,x));
const nEscape=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nKey=(k)=>N_FOOD[k];
function nItem(k,g){return {key:k,grams:Math.round(g/5)*5}}
function nStats(items){
 const v={kcal:0,p:0,c:0,f:0,fiber:0,veg:0,fruit:0,whole:0,calcium:0,fish:0};
 for(const it of items){
  const f=nKey(it.key);if(!f)continue;
  const t=it.grams/100,p=f[1]*t,c=f[2]*t,fat=f[3]*t;
  v.p+=p;v.c+=c;v.f+=fat;v.fiber+=f[4]*t;
  v.kcal+=p*4+c*4+fat*9;
  if(f[5]==='veg')v.veg+=it.grams;
  if(f[5]==='fruit')v.fruit+=it.grams;
  if(f[5]==='grain' && ['oat','brown','bread'].includes(it.key))v.whole+=it.grams;
  if(f[5]==='dairy')v.calcium+=it.grams;
  if(f[5]==='fish')v.fish+=it.grams;
 }
 return v;
}
function nReplacements(k,preference){
 if(preference==='noFish' && ['mackerel','salmon'].includes(k))return 'chicken';
 if(preference==='vegetarian' && ['mackerel','salmon','chicken','beef'].includes(k))return 'tofu';
 return k;
}
function nOptimize(template, kcalAim, proteinAim, preference){
 const [title,raw,proteinFood,carbFood,fatFood]=template;
 const items=raw.map(([k,g])=>nItem(nReplacements(k,preference),g));
 const pName=nReplacements(proteinFood,preference),cName=nReplacements(carbFood,preference),fName=nReplacements(fatFood,preference);
 const ixP=items.findIndex(x=>x.key===pName),ixC=items.findIndex(x=>x.key===cName),ixF=items.findIndex(x=>x.key===fName);
 const ix=[ixP,ixC,ixF];
 const count=items.length;
 const targetFat=kcalAim*.29/9;
 function amount(key,measure){const z=nKey(key);return measure==='p'?z[1]/100:measure==='f'?z[3]/100:(z[1]*4+z[2]*4+z[3]*9)/100}
 const metrics=['p','f','kcal'], target=[proteinAim,targetFat,kcalAim];
 const fixed=items.filter((_,i)=>!ix.includes(i));
 const baseline=nStats(fixed);
 const residual=[proteinAim-baseline.p,targetFat-baseline.f,kcalAim-baseline.kcal];
 const A=metrics.map(m=>ix.map(i=>amount(items[i].key,m)));
 const aug=A.map((row,i)=>[...row,residual[i]]);
 let valid=true;
 for(let j=0;j<3;j++){
  let pivot=j;
  for(let i=j+1;i<3;i++)if(Math.abs(aug[i][j])>Math.abs(aug[pivot][j]))pivot=i;
  [aug[pivot],aug[j]]=[aug[j],aug[pivot]];
  if(Math.abs(aug[j][j])<1e-7){valid=false;break}
  const d=aug[j][j];for(let col=j;col<4;col++)aug[j][col]/=d;
  for(let i=0;i<3;i++)if(i!==j){const mul=aug[i][j];for(let col=j;col<4;col++)aug[i][col]-=mul*aug[j][col]}
 }
 if(valid){
  const solution=aug.map(row=>row[3]);
  for(let j=0;j<3;j++){
   let k=items[ix[j]].key,max=j===0?(k==='tofu'?480:k==='greek'?430:k==='egg'?240:270)
   :j===1?(['oat'].includes(k)?150:k==='bread'?230:460)
   :(k==='olive'?35:48);
   const min=j===0?([ 'egg','chicken','beef','tofu','greek','salmon','mackerel'].includes(k)?70:40):j===1?20:(k==='olive'?1:8);
   items[ix[j]].grams=Math.round(nLimit(solution[j],min,max)/5)*5;
  }
 }
 // Dietary portions and food-group coverage are retained rather than chasing an exact number.
 for(let times=0;times<4;times++){
  let stat=nStats(items);
  const pI=items[ixP],cI=items[ixC],fI=items[ixF];
  const pd=amount(pI.key,'p'),cd=amount(cI.key,'kcal'),fd=amount(fI.key,'f');
  const pCap=pI.key==='tofu'?480:pI.key==='greek'?430:pI.key==='egg'?240:270;
  if(pd>0.02)pI.grams=nLimit(Math.round((pI.grams+(proteinAim-stat.p)/pd)/5)*5,60,pCap);
  stat=nStats(items);
  if(fd>0.05)fI.grams=nLimit(Math.round((fI.grams+(targetFat-stat.f)/fd)/5)*5,fI.key==='olive'?0:5,fI.key==='olive'?35:48);
  stat=nStats(items);
  if(cd>0.4)cI.grams=nLimit(Math.round((cI.grams+(kcalAim-stat.kcal)/cd)/5)*5,20,cI.key==='oat'?150:cI.key==='bread'?230:460);
 }
 return {title,items,...nStats(items)};
}
function nBuild(prefs,body,kind,day=0,offset=0){
 const weight=Number(body?.weight),height=Number(body?.height),age=Number(prefs?.age),sex=prefs?.sex,activity=prefs?.activity;
 const bmi=weight/Math.pow(height/100,2);
 const errors=[];
 if(!(weight>=35&&weight<=220&&height>=135&&height<=215))errors.push('인바디 신장·체중을 먼저 입력하고 원본과 대조해 주세요.');
 if(!(age>=18&&age<=64))errors.push('이 자동 계산은 만 18~64세 성인만 대상으로 합니다.');
 if(!['female','male'].includes(sex))errors.push('계산식을 선택하기 위한 성별 입력이 필요합니다.');
 if(!['sedentary','light','moderate','high'].includes(activity))errors.push('평소 활동량을 선택해 주세요.');
 if(prefs?.risk)errors.push('임신·수유, 의료적 식단 관리, 식품 알레르기 또는 섭식 문제가 있는 경우 영양사·의료진의 개별 평가가 필요합니다.');
 if(Number.isFinite(bmi)&&(bmi<18.5||bmi>=40))errors.push('현재 체중 상태에서는 자동 열량 계획보다 개별 영양 평가가 우선입니다.');
 if(kind==='fat'&&Number.isFinite(bmi)&&bmi<20.5)errors.push('체질량지수가 낮은 범위에서는 자동 감량 열량을 제안하지 않습니다.');
 if(!['fat','muscle','recomp','fitness'].includes(kind))errors.push('먼저 운동 목표를 선택해 주세요.');
 if(errors.length)return {errors};
 const bmr=10*weight+6.25*height-5*age+(sex==='male'?5:-161);
 const activityIndex={sedentary:1.2,light:1.375,moderate:1.55,high:1.725}[activity];
 const maintenance=Math.round(bmr*activityIndex);
 let change=kind==='fat'?-Math.min(350,maintenance*.14):kind==='muscle'?Math.min(220,maintenance*.08):0;
 const target=Math.round((maintenance+change)/50)*50;
 if(target<(sex==='female'?1400:1600)||target<1.08*bmr||target>3500)return {errors:['현재 추정 열량에서는 자동 목표가 과도하게 낮거나 높을 수 있어 영양 전문가와 조정해야 합니다.']};
 const referenceWeight=Math.min(weight,25*Math.pow(height/100,2));
 const proRate={fat:1.6,muscle:1.8,recomp:1.6,fitness:1.4}[kind];
 const protein=Math.round(referenceWeight*proRate);
 const fat=Math.round(target*.29/9);
 const carbs=Math.round((target-protein*4-fat*9)/4);
 const keys=['breakfast','lunch','dinner','snack'];
 const meals=keys.map((key,i)=>{
  const list=N_TEMPLATES[key];
  const idx=(day*(i+1)+offset)%list.length;
  return {key,...nOptimize(list[idx],target*N_SHARES[key],protein*N_SHARES[key],prefs.preference||'regular')}
 });
 const totals={kcal:0,p:0,c:0,f:0,fiber:0,veg:0,fruit:0,whole:0,calcium:0,fish:0};
 for(const meal of meals)for(const k of Object.keys(totals))totals[k]+=meal[k]||0;
 return {errors:[],target,maintenance,bmr,protein,fat,carbs,meals,totals,bmi,prefs};
}
function nNotice(){
 return `<div class="np-banner"><div><b>내 몸에 맞는 식단까지</b><p>인바디 수치와 선택한 운동 목표로 하루 열량과 끼니별 식재료 중량을 계산합니다.</p></div><button class="btn primary" data-nutrition="go">맞춤 식단 만들기 →</button></div>`;
}
function nOptions(){
 const prefs=state.nutritionPrefs||{};
 const opts=(vals,v)=>vals.map(([id,l])=>`<option value="${id}" ${v===id?'selected':''}>${l}</option>`).join('');
 const body=state.body||{};
 return `${title('나만의 맞춤 식단','인바디 측정값 + 운동 목표 + 생활 활동량으로 7일 식단을 구성합니다.')}
 <div class="np-note"><b>현재 인바디 · ${nEscape(goalLabel())}</b><p>체중 ${Number(body.weight)?nFmt(body.weight)+' kg':'미입력'} · 신장 ${Number(body.height)?nFmt(body.height)+' cm':'미입력'} · 골격근량 ${Number(body.smm)?nFmt(body.smm)+' kg':'미입력'} · 체지방률 ${Number(body.pbf)?nFmt(body.pbf)+' %':'미입력'}</p><button class="btn ghost small" data-nutrition="body">인바디·운동 목표 수정</button></div>
 <div class="card np-form"><div class="np-head"><h2>계산에 필요한 정보</h2><span>모든 값은 이 기기에만 저장됩니다.</span></div>
 <div class="np-fields">
 <label>만 나이<input class="input" type="number" id="nAge" min="18" max="64" step="1" value="${nEscape(prefs.age||'')}" placeholder="예: 35"/></label>
 <label>성별 계수 선택<select class="input" id="nSex">${opts([['','선택하세요'],['female','여성 계수'],['male','남성 계수']],prefs.sex)}</select></label>
 <label>평소 활동량<select class="input" id="nActivity">${opts([['','선택하세요'],['sedentary','주로 앉아서 생활'],['light','가벼운 활동·운동 주 1~3회'],['moderate','보통 활동·운동 주 3~5회'],['high','활동량 많음·운동 주 6~7회']],prefs.activity)}</select></label>
 <label>식사 유형<select class="input" id="nPreference">${opts([['regular','일반식'],['noFish','생선 제외'],['vegetarian','육류·생선 제외 (달걀·유제품 포함)']],prefs.preference||'regular')}</select></label>
 </div>
 <label class="np-risk"><input type="checkbox" id="nRisk" ${prefs.risk?'checked':''}/><span>임신·수유, 식품 알레르기, 섭식 문제, 신장질환·당뇨 등 의료적 식단 관리가 필요한 경우에 해당합니다.</span></label>
 <div class="np-help">열량 계산은 성별 계수를 사용하는 일반적인 성인 추정식입니다. 개인의 대사량이나 실제 소비 열량을 측정하는 검사가 아니며, 계산식이 모든 성별 특성을 반영하지는 못합니다.</div>
 <button class="btn primary" data-nutrition="calculate">7일 식단 계산하기</button></div>`;
}
function nPage(){
 const prefs=state.nutritionPrefs||{};
 let html=nOptions();
 if(!prefs.created)return html+`<div class="np-empty">위 항목을 입력하고 계산 버튼을 누르면 하루 총열량과 7일 식사 구성이 표시됩니다.</div>`;
 const current=nBuild(prefs,state.body,state.goal.kind,nDay,nOffset);
 if(current.errors.length)return html+`<div class="np-error"><b>자동 식단 생성을 보류했습니다.</b>${current.errors.map(x=>`<p>• ${nEscape(x)}</p>`).join('')}<p>단순 체성분 측정치만으로는 영양 처방을 확정할 수 없습니다.</p></div>`;
 const t=current,tot=t.totals;
 const difference=Math.round(tot.kcal-t.target);
 const servings=[['채소',tot.veg,350,'g'],['과일',tot.fruit,150,'g'],['통곡류',tot.whole,100,'g'],['우유·요거트 등 칼슘 급원',tot.calcium,180,'g']];
 html+=`<div class="np-results">
 <div class="np-main"><div><span class="np-eyebrow">하루 열량 · 참고용 추정</span><div class="np-energy">${nFmt(t.target)}<small>킬로칼로리</small></div><p>현재 추정 유지 열량 ${nFmt(t.maintenance)}킬로칼로리 · ${nEscape(goalLabel())}</p></div><div class="np-macros">${[['단백질',t.protein,'g'],['탄수화물',t.carbs,'g'],['지방',t.fat,'g']].map(([k,v,u])=>`<div><span>${k}</span><strong>${nFmt(v)}${u}</strong></div>`).join('')}</div></div>
 <div class="np-note"><b>계산 근거</b><p>기초대사량 추정 ${nFmt(t.bmr)}킬로칼로리 × 생활 활동 계수 → 유지 열량 ${nFmt(t.maintenance)}킬로칼로리. 체지방 감량은 완만한 열량 감소, 근육량 향상은 소폭 증가, 체성분·습관 개선은 유지 수준으로 계산합니다. 수치는 개인별 의학적 처방이 아닙니다.</p></div>
 <div class="np-section"><h2>7일 식단 예시</h2><button class="btn ghost small" data-nutrition="change">↻ 다른 구성 보기</button></div>
 <div class="np-tabs">${Array.from({length:7},(_,i)=>`<button class="${nDay===i?'selected':''}" data-nutrition="day" data-day="${i}">${i+1}일차</button>`).join('')}</div>
 <div class="np-daily"><div><b>${nDay+1}일차 음식별 예상 합계</b><p>${nFmt(tot.kcal)}킬로칼로리 (계산 목표 대비 ${difference>0?'+':''}${nFmt(difference)}) · 단백질 ${nFmt(tot.p)}g · 탄수화물 ${nFmt(tot.c)}g · 지방 ${nFmt(tot.f)}g · 식이섬유 약 ${nFmt(tot.fiber)}g</p></div><div class="np-bars"><span style="width:${nLimit(tot.kcal/t.target*100,0,100)}%"></span></div></div>
 <div class="np-meals">${t.meals.map(m=>`<article class="np-meal"><div class="np-mealhead"><div><span>${N_LABELS[m.key]}</span><h3>${nEscape(m.title)}</h3></div><strong>${nFmt(m.kcal)}<small>킬로칼로리</small></strong></div><div class="np-ingredients">${m.items.map(it=>`<div><span>${nEscape(nKey(it.key)[0])}</span><b>${nFmt(it.grams)}g</b></div>`).join('')}</div><p>단백질 ${nFmt(m.p)}g · 탄수화물 ${nFmt(m.c)}g · 지방 ${nFmt(m.f)}g · 식이섬유 약 ${nFmt(m.fiber)}g</p></article>`).join('')}</div>
 <div class="np-check"><h3>영양밀도 점검</h3><div class="np-quality">${servings.map(([label,num,base,unit])=>`<div><span>${num>=base?'✓':'△'} ${label}</span><b>${nFmt(num)}${unit} ${num<base?'/ 권장 구성에 못 미침':''}</b></div>`).join('')}</div><p>단백질·전체 열량은 표시된 재료의 일반적인 식품 성분을 기준으로 추정한 값입니다. 채소·과일·통곡·칼슘 공급 식품을 다양하게 배치했지만, 실제 비타민·무기질의 충분량과 나트륨, 포화지방, 알레르기 교차 접촉 여부까지 검증한 식단은 아닙니다. 식이섬유는 하루 약 25g 이상을 점검 기준으로 참고하세요.</p>${tot.fiber<25?'<p class="np-warning">식이섬유가 부족할 수 있어 채소·콩·통곡류를 추가하고 실제 식품 포장지 정보를 확인하세요.</p>':''}${Math.abs(difference)>t.target*.08?'<p class="np-warning">표시된 재료 합계와 열량 목표 차이가 큽니다. 분량을 확인하고 전문가와 조정하세요.</p>':''}</div>
 <div class="np-actions"><button class="btn primary" data-nutrition="record">이 식단을 오늘의 식사 기록에 복사</button><button class="btn ghost" data-nutrition="download">7일 식단표 인쇄·PDF 저장</button></div>
 <div class="np-note"><b>중요 안내</b><p>현재는 건강한 성인 대상의 참고용 자동 계산입니다. 체성분 수치만으로 치료식, 알레르기 대체식, 완전한 미량영양소 충족 여부를 판단할 수 없습니다. 실제 섭취량·상품마다 성분이 다르며, 인바디 입력값과 체중 추세를 확인하면서 영양사와 조정해 주세요. 입력값은 현재 브라우저에만 저장되며, 기기가 바뀌면 자동으로 이동하지 않습니다.</p></div>
 </div>`;
 return html;
}
const nCSS=`
.np-banner{padding:15px 18px;border:1px solid #c5d5f9;background:#f3f7ff;border-radius:15px;display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 16px}.np-banner b{font-size:16px}.np-banner p{margin:4px 0 0;font-size:12px;color:#5b6c84}.np-banner .btn{flex-shrink:0}
.np-note,.np-error,.np-empty{background:#eff4ff;border-radius:15px;padding:18px;margin:16px 0;font-size:13px;line-height:1.65;color:#435672}.np-note p{margin:7px 0}.np-error{background:#fff1f0;color:#7a3636}.np-error p{margin:6px 0}.np-form{margin:18px 0}.np-head{display:flex;align-items:baseline;gap:15px;flex-wrap:wrap;justify-content:space-between}.np-head h2{margin:0 0 17px;font-size:20px}.np-head span{font-size:12px;color:#697a90}.np-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:14px}.np-fields label{font-weight:700;font-size:13px;color:#485d78;display:flex;flex-direction:column;gap:7px}.np-fields .input{width:100%;box-sizing:border-box}.np-risk{display:flex;align-items:flex-start;gap:10px;padding:13px;background:#f8fafc;border-radius:10px;font-size:13px;line-height:1.6;margin:12px 0}.np-risk input{width:18px;height:18px;flex-shrink:0;margin-top:2px}.np-help{color:#6e7b8d;font-size:12px;line-height:1.6;margin:12px 0 18px}
.np-main{border-radius:20px;background:linear-gradient(120deg,#142f5b,#255cba);padding:24px;color:white;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}.np-eyebrow{font-size:13px;opacity:.86}.np-energy{font-size:44px;line-height:1.25;font-weight:900;letter-spacing:-.04em}.np-energy small{font-size:15px;margin-left:8px;font-weight:600}.np-main p{margin:9px 0 0;font-size:12px;opacity:.9}.np-macros{display:flex;gap:13px;flex-wrap:wrap}.np-macros div{border:1px solid #ffffff50;border-radius:12px;padding:12px 14px;min-width:78px}.np-macros span,.np-macros strong{display:block}.np-macros span{font-size:12px;opacity:.8}.np-macros strong{font-size:19px;margin-top:7px}.np-section{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:25px 0 12px}.np-section h2{margin:0;font-size:20px}
.np-tabs{display:flex;gap:7px;overflow-x:auto;padding-bottom:9px}.np-tabs button{background:white;border:1px solid #d6dfea;border-radius:10px;padding:11px 14px;font-size:13px;font-weight:800;color:#586780;white-space:nowrap;cursor:pointer}.np-tabs button.selected{background:#2865d9;border-color:#2865d9;color:white}.np-daily{background:#fff;border:1px solid #dde5f0;border-radius:14px;padding:16px;margin:10px 0 15px}.np-daily b{font-size:15px}.np-daily p{font-size:12px;line-height:1.7;margin:6px 0 9px;color:#637389}.np-bars{height:8px;background:#e2e9f4;border-radius:9px;overflow:hidden}.np-bars span{display:block;height:100%;background:#2e69e2;border-radius:9px}
.np-meals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.np-meal{background:#fff;border:1px solid #dee6f0;border-radius:15px;padding:17px}.np-mealhead{display:flex;justify-content:space-between;gap:10px}.np-mealhead span{font-size:12px;color:#2862c5;font-weight:800}.np-mealhead h3{font-size:16px;margin:6px 0 13px}.np-mealhead strong{font-size:22px;white-space:nowrap;color:#233e66}.np-mealhead small{font-size:10px;margin-left:4px}.np-ingredients{border-top:1px solid #ecf0f5}.np-ingredients div{display:flex;justify-content:space-between;gap:9px;padding:9px 0;border-bottom:1px solid #f0f3f7;font-size:13px}.np-ingredients b{white-space:nowrap}.np-meal>p{font-size:12px;color:#718099;line-height:1.6}.np-check{background:#fff;border:1px solid #dce6f1;border-radius:16px;padding:18px;margin-top:16px}.np-check h3{margin:0 0 12px;font-size:17px}.np-quality{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.np-quality div{background:#f5f8fc;padding:11px 12px;border-radius:9px;display:flex;justify-content:space-between;gap:8px;font-size:12px}.np-quality span{color:#536b90;font-weight:800}.np-quality b{text-align:right}.np-check>p{font-size:12px;line-height:1.8;color:#708099}.np-warning{color:#a9512b!important}.np-actions{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}
@media(max-width:680px){.np-banner{flex-direction:column;align-items:stretch}.np-fields,.np-meals,.np-quality{grid-template-columns:1fr}.np-energy{font-size:35px}.np-main{padding:19px}.np-macros{width:100%}.np-macros div{flex:1}.np-section h2{font-size:18px}}
@media print{body *{visibility:hidden!important}#view,#view *{visibility:visible!important}#view{position:absolute;top:0;left:0;width:100%}.np-form,.np-actions,.np-tabs,.np-banner,button{display:none!important}.np-main{color:black!important;background:white!important;border:1px solid #ccc}.np-meals{grid-template-columns:1fr 1fr}}
`;
const style=document.createElement('style');style.textContent=nCSS;document.head.appendChild(style);
if(!paths.some(p=>p[0]==='nutrition')){
 const i=paths.findIndex(p=>p[0]==='diet');
 paths.splice(i<0?paths.length:i,0,['nutrition','▤','맞춤 식단']);
}
const nOriginalRender=render;
render=function(){
 if(route==='nutrition'){navRender();document.querySelector('#view').innerHTML=nPage();}
 else{
  nOriginalRender();
  if(['home','course','diet','body'].includes(route)){
   const root=document.querySelector('#view');
   if(root)root.insertAdjacentHTML('afterbegin',nNotice());
  }
 }
 const mobile=document.querySelector('#mobileNav');
 if(mobile&&!mobile.querySelector('[data-value="nutrition"]')){
  const b=document.createElement('button');
  b.type='button';b.dataset.action='route';b.dataset.value='nutrition';
  b.className=route==='nutrition'?'active':'';
  b.innerHTML='<span>▤</span><span>식단</span>';
  const d=mobile.querySelector('[data-value="diet"]');
  if(d)d.replaceWith(b);else mobile.appendChild(b);
 }
 if(route==='nutrition'){
  const crumb=document.querySelector('#crumb');if(crumb)crumb.textContent='맞춤 식단';
 }
};
document.addEventListener('click',function(e){
 const el=e.target.closest('[data-nutrition]');
 if(!el)return;
 e.preventDefault();e.stopPropagation();
 const act=el.dataset.nutrition;
 if(act==='go'){setRoute('nutrition');return;}
 if(act==='body'){setRoute('body');return;}
 if(act==='day'){nDay=Number(el.dataset.day);render();return;}
 if(act==='change'){nOffset=(nOffset+1)%7;render();return;}
 if(act==='calculate'){
  const prefs={
   age:document.querySelector('#nAge')?.value,
   sex:document.querySelector('#nSex')?.value,
   activity:document.querySelector('#nActivity')?.value,
   preference:document.querySelector('#nPreference')?.value||'regular',
   risk:!!document.querySelector('#nRisk')?.checked,
   created:true
  };
  state.nutritionPrefs=prefs;nDay=0;nOffset=0;save();render();return;
 }
 if(act==='record'){
  const x=nBuild(state.nutritionPrefs,state.body,state.goal.kind,nDay,nOffset);
  if(x.errors.length)return;
  const d=getDay();
  for(const m of x.meals)d.meals[m.key]=m.title+' ('+m.items.map(it=>nKey(it.key)[0]+' '+it.grams+'g').join(', ')+')';
  save();toast('선택한 1일 식단을 식사 기록에 복사했습니다. 실제로 먹은 양은 직접 수정해 주세요.');setRoute('diet');return;
 }
 if(act==='download'){window.print();return;}
},true);
window.VimsNutrition={build:nBuild,foods:N_FOOD};
render();
})();
