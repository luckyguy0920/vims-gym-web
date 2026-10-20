
(function(){
'use strict';
const FORM_KEYS=[
 {key:'height',label:'신장',unit:'cm',min:110,max:220,example:'예: 165.0',hint:'인바디 결과지 기준'},
 {key:'weight',label:'체중',unit:'kg',min:25,max:350,example:'예: 58.5',hint:'측정 결과지'},
 {key:'smm',label:'골격근량',unit:'kg',min:5,max:120,example:'예: 22.0',hint:'근육량 항목'}
];
const QGOALS=[['recomp','체성분 개선'],['fat','체지방 감량'],['muscle','근육량 향상'],['fitness','건강·체력']];
const QN=x=>x==null||x===''?null:Number(x);
const QR=x=>Math.round(x*10)/10;
const QE=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let qGoal=state.goal?.kind||'recomp';
let qInputMode='fatMass';
const SEX_OPTIONS=[['','선택해 주세요'],['male','남성 계수'],['female','여성 계수']];
const ACTIVITY_OPTIONS=[['','선택해 주세요'],['sedentary','주로 앉아서 생활'],['light','가볍게 활동·주 1~3회 운동'],['moderate','보통 활동·주 3~5회 운동'],['high','활동량 많음·주 6회 이상 운동']];
const EXPERIENCE_OPTIONS=[['beginner','초보 · 기구 운동이 낯설어요'],['intermediate','중급 · 근력운동 경험이 있어요'],['advanced','숙련 · 주기적으로 근력운동']];
const FOOD_OPTIONS=[['regular','일반식'],['noFish','생선 제외'],['vegetarian','육류·생선 제외(달걀·유제품 가능)']];
function qSelect(id,label,options,value,note){
 return `<label class="qf-profilefield" for="${id}"><span>${label}</span><select id="${id}" required>${options.map(([v,t])=>`<option value="${v}" ${value===v?'selected':''}>${t}</option>`).join('')}</select><small>${note||''}</small></label>`;
}
function qProfileFromForm(){
 return {age:Number(document.getElementById('quick_age')?.value||0),
  sex:document.getElementById('quick_sex')?.value||'',
  activity:document.getElementById('quick_activity')?.value||'',
  experience:document.getElementById('quick_experience')?.value||'beginner',
  preference:document.getElementById('quick_preference')?.value||'regular',
  special:document.getElementById('quick_special')?.value||''};
}
function qProfileErrors(p){
 const errors=[];
 if(!Number.isInteger(p.age)||p.age<18||p.age>79)errors.push('현재 자동계산은 만 18~79세 성인만 이용할 수 있습니다.');
 if(!['male','female'].includes(p.sex))errors.push('대사량 계산 기준을 선택해 주세요.');
 if(!['sedentary','light','moderate','high'].includes(p.activity))errors.push('평소 활동량을 선택해 주세요.');
 if(!['beginner','intermediate','advanced'].includes(p.experience))errors.push('운동 경험을 선택해 주세요.');
 if(!['regular','noFish','vegetarian'].includes(p.preference))errors.push('식사 유형을 확인해 주세요.');
 if(!['none','needsReview'].includes(p.special))errors.push('개별 건강 상태 확인 항목을 선택해 주세요.');
 if(p.special==='needsReview')errors.push('임신·수유, 질환 관리, 알레르기, 섭식 문제나 운동 시 통증·부상이 있으면 자동 계획 대신 전문가의 개별 평가가 필요합니다.');
 return errors;
}
function qError(message){
 const el=document.getElementById('qf-error');
 if(el){el.textContent=message;el.scrollIntoView?.({behavior:'smooth',block:'center'});}
 toast(message);
}

// 공용 단말: 개인 측정 기록은 디스크나 브라우저 저장소에 기록하지 않는다.
function qHist(){return [];}
function qSaveHist(){}
function qLastOther(){return null;}
function qField(k,label,unit,placeholder,hint,prev){
 return `<label class="qf-field" for="quick_${k}"><span>${label} <small>${unit}</small></span><div class="qf-inputrow"><input id="quick_${k}" type="number" inputmode="decimal" enterkeyhint="next" autocomplete="off" step="0.1" min="0" placeholder="${placeholder}" value="${prev==null?'':QE(prev)}" required/><span class="qf-unit">${unit}</span></div><small class="qf-hint">${hint}</small></label>`;
}
function qModeField(body){
 const mode=qInputMode;
 const isMass=mode==='fatMass';
 const prev=isMass?body.fatMass:body.pbf;
 return `<div class="qf-last"><div class="qf-fieldtop"><b>체지방 항목</b><div class="qf-modes" role="group" aria-label="체지방 입력 방법 선택"><button type="button" data-qmode="fatMass" class="${isMass?'active':''}">체지방량</button><button type="button" data-qmode="pbf" class="${!isMass?'active':''}">체지방률</button></div></div>${qField('fat',isMass?'체지방량':'체지방률',isMass?'kg':'%',isMass?'예: 14.8':'예: 25.3','둘 중 하나만 입력하면 다른 값은 자동 계산',prev)}</div>`;
}
function qPreviewValues(){
 const field=k=>QN(document.getElementById('quick_'+k)?.value);
 const height=field('height'),weight=field('weight'),smm=field('smm'),value=field('fat');
 if([height,weight,smm,value].some(n=>n==null||!Number.isFinite(n)))return {complete:false,height,weight,smm};
 const mass=qInputMode==='fatMass'?value:weight*value/100;
 const pbf=qInputMode==='pbf'?value:100*value/weight;
 const bmi=weight/(height/100)**2,lean=weight-mass;
 const body={height:QR(height),weight:QR(weight),smm:QR(smm),fatMass:QR(mass),pbf:QR(pbf)};
 const problems=validateScan(body);
 if(body.weight<35||body.weight>220)problems.push('건강한 성인 기준 자동 계획 범위(체중 35~220kg) 밖입니다.');
 if(body.height<130||body.height>215)problems.push('건강한 성인 기준 자동 계획 범위(신장 130~215cm) 밖입니다.');
 if(body.fatMass+body.smm>body.weight*1.02)problems.push('골격근량과 체지방량의 합이 체중과 비슷하거나 더 큽니다. 측정값을 다시 확인하세요.');
 return {complete:true,body,pbf,bmi,lean,problems:[...new Set(problems)]};
}
function qPreview(){
 const p=qPreviewValues();
 const node=document.getElementById('qf-preview');
 const error=document.getElementById('qf-error');
 const submit=document.getElementById('qf-submit');
 if(!node)return;
 if(!p.complete){
  node.innerHTML='<div class="qf-wait"><b>입력과 동시에 계산</b><span>체지방률 · 체질량지수 · 제지방량</span></div>';
  if(error)error.textContent='';
  if(submit)submit.disabled=false;
  return;
 }
 const tiles=[
 ['체지방률',p.pbf.toFixed(1),'%'],['체질량지수',p.bmi.toFixed(1),''],['제지방량',p.lean.toFixed(1),'kg'],['골격근량',p.body.smm.toFixed(1),'kg']
 ];
 node.innerHTML=tiles.map(([k,v,u])=>`<div><span>${k}</span><strong>${v}<small>${u}</small></strong></div>`).join('');
 if(error)error.textContent=p.problems.join(' / ');
 if(submit)submit.disabled=false;
}
function qHistoryMarkup(){
 const x=qLastOther();
 if(!x||!state.body?.weight)return '';
 const items=[['체중','weight'],['골격근량','smm'],['체지방량','fatMass'],['체지방률','pbf']];
 const deltas=items.map(([label,k])=>{
  const now=Number(state.body[k]),old=Number(x[k]);
  const dif=now-old;
  return `<div class="qf-delta"><span>${label}</span><b>${(dif>0?'+':'')+dif.toFixed(1)}${k==='pbf'?'%p':'kg'}</b></div>`;
 }).join('');
 return `<div class="qf-history"><div><b>지난번 입력값과 변화</b><span>개인 기기의 기록을 비교한 값입니다.</span></div><div class="qf-deltas">${deltas}</div></div>`;
}
function qPage(){
 const b=state.body||{},first=!Boolean(b.height);
 const near=qHist().length;
 return `${title(first?'인바디 입력':'인바디 수정','측정값과 기본 정보로 28일 계획을 만듭니다.')}
 <div class="qf-intro"><div><div class="qf-eyebrow">VIMS GYM · 28일 맞춤 관리</div><h2>내 몸에 맞는<br/>28일의 시작</h2><p>인바디 수치 4개와 기본 정보만 입력하세요.<br/>식사 · 운동 · 휴식 계획이 자동으로 연결됩니다.</p></div><div class="qf-step">${'4'}<small>개 수치</small></div></div>
 <form id="quickInbodyForm" class="qf-card" novalidate>
  <div class="qf-header"><div><span class="qf-kicker">01 / 체성분</span><h3>인바디 수치</h3></div><span class="qf-chip">4개 항목</span></div>
  <div class="qf-formgrid">
   ${FORM_KEYS.map(v=>qField(v.key,v.label,v.unit,v.example,v.hint,b[v.key])).join('')}
   <div id="qf-fat-holder">${qModeField(b)}</div>
  </div>
  <div class="qf-tiny">신장 · 체중 · 골격근량 · 체지방량(또는 체지방률)</div>
  <div class="qf-header qf-gap"><div><span class="qf-kicker">02 / 분석</span><h3>자동 계산</h3></div><span class="qf-chip">입력 즉시 반영</span></div>
  <div class="qf-preview" id="qf-preview"><div class="qf-wait"><b>수치를 입력하면</b><span>체지방률 · 체질량지수 · 제지방량이 표시됩니다.</span></div></div>
  <div class="qf-header qf-gap"><div><span class="qf-kicker">03 / 기본 정보</span><h3>나에게 맞는 설정</h3></div><span class="qf-chip">계획에 반영</span></div>
  <div class="qf-profilegrid">
   <label class="qf-profilefield" for="quick_age"><span>만 나이</span><input id="quick_age" type="number" inputmode="numeric" min="18" max="79" step="1" placeholder="예: 35" value="${state.profile?.age??''}" required/><small>만 18~79세 자동 계획 기준</small></label>
   ${qSelect('quick_sex','성별 기준',SEX_OPTIONS,state.profile?.sex||'','기초대사량 추정식의 남성·여성 계수')}
   ${qSelect('quick_activity','평소 활동량',ACTIVITY_OPTIONS,state.profile?.activity||'','일상 움직임과 운동 빈도 선택')}
   ${qSelect('quick_experience','근력운동 경험',EXPERIENCE_OPTIONS,state.profile?.experience||'beginner','주간 운동 횟수·난이도 조정')}
   ${qSelect('quick_preference','식사 유형',FOOD_OPTIONS,state.profile?.preference||'regular','식단 구성에 반영')}
   ${qSelect('quick_special','건강 상태',[['','반드시 선택해 주세요'],['none','별도 관리가 필요한 상태 없음'],['needsReview','임신·수유/질환/알레르기/부상 등 관리 필요']],state.profile?.special||'','별도 관리 필요 시 자동 생성 대신 전문 상담')}
  </div>
  <div class="qf-header qf-gap"><div><span class="qf-kicker">04 / 목표</span><h3>목표 선택</h3></div><span class="qf-chip">언제든 변경</span></div>
  <div class="qf-goals">${QGOALS.map(([k,label])=>`<button type="button" data-qgoal="${k}" aria-pressed="${qGoal===k}" class="${qGoal===k?'active':''}">${label}</button>`).join('')}</div>
  <p class="qf-caution">나이·활동량 등을 반영한 추정치입니다. 실제 필요량과 다를 수 있습니다.</p>
  <div class="qf-error" id="qf-error" role="alert" aria-live="polite"></div>
  <button type="submit" class="qf-submit" id="qf-submit">28일 계획 만들기 <span>→</span></button>
  <p class="qf-privacy">공용 기기 · 정보는 이번 이용 중에만 표시되며, 종료 또는 새로고침 시 초기화됩니다.</p>
  <p class="qf-care">질환 · 임신 · 알레르기 · 부상 등 개별 관리가 필요하다면 <a href="https://talk.naver.com/ct/w81ur3w?frm=mnmb#nafullscreen" target="_blank" rel="noopener noreferrer">전문가 상담 →</a></p>
 </form>
 `;
}
function qSave(){
 const p=qPreviewValues();
 if(!p.complete){toast('신장, 체중, 골격근량, 체지방 항목을 모두 입력해 주세요.');return;}
 if(p.problems.length){toast('입력값을 확인해 주세요.');qPreview();document.getElementById('qf-error')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
 if(qGoal==='fat'&&p.bmi<18.5){
  toast('저체중 범위에서는 감량 계획을 자동으로 만들지 않습니다. 다른 목표를 선택해 주세요.');return;
 }
 const profile=qProfileFromForm();
 const errors=qProfileErrors(profile);
 if(errors.length){qError(errors.join(' '));return;}
 if(p.bmi<18.5||p.bmi>=40){qError('현재 체질량지수에서는 개인별 영양·운동 평가가 필요합니다. 네이버 톡톡 상담을 이용해 주세요.');return;}
 if(qGoal==='fat'&&p.bmi<20.5){qError('체질량지수가 낮은 범위에서는 자동 감량 계획을 제시하지 않습니다. 다른 목표를 선택해 주세요.');return;}
 const oldBody={...state.body};
 const oldGoal={...state.goal};
 const prevScan=scanSession;
 // Use the app's existing goals pipeline; the single measurement record powers all modules.
 scanSession={...scanSession,status:'ready',data:p.body,uncertain:[],corrected:true,fromPhoto:false,engine:'manual',valid:true,progress:100};
 chooseGoal(qGoal);
 if(state.goal?.kind!==qGoal || !state.body?.weight){
  scanSession=prevScan;
  toast('수치를 저장하지 못했습니다. 입력값을 확인해 주세요.');
  return;
 }
 // Each visitor starts with their own characteristics; do not inherit old visitors' settings.
 state.goal.experience=profile.experience;
 state.goal.activity=({sedentary:'low',light:'low',moderate:'medium',high:'high'})[profile.activity];
 state.goal.sessions=String(profile.age>=65?2:({beginner:2,intermediate:3,advanced:4})[profile.experience]);
 state.goal.sessionMins=profile.age>=65?'35':profile.experience==='beginner'?'40':'50';
 state.profile={...profile};
 state.nutritionPrefs={age:profile.age,sex:profile.sex,activity:profile.activity,
    preference:profile.preference,risk:false,created:true};

 state.body.date=new Date().toISOString().slice(0,10);
 state.body.source='manual';
 state.measurementsConfirmed=true;
 qSaveHist(state.body);
 if(JSON.stringify(oldBody)!==JSON.stringify(state.body)){
  state.latestBodyUpdate=state.body.date;
 }
 save();
 setRoute('home');
 toast('개인 특성과 인바디를 반영한 28일 계획이 연결됐습니다.');
}
const css=`
.qf-intro{background:linear-gradient(120deg,#132c50,#245bb1);color:#fff;border-radius:20px;padding:26px;display:flex;justify-content:space-between;gap:20px;align-items:center;margin:0 0 14px}.qf-eyebrow{letter-spacing:.08em;font-size:11px;color:#b9cdf3;font-weight:900}.qf-intro h2{font-size:26px;margin:9px 0;letter-spacing:-.035em}.qf-intro p{font-size:13px;line-height:1.8;color:#d5e4fa;margin:0}.qf-step{width:88px;height:88px;border-radius:100%;background:#c9f197;color:#183829;display:grid;place-content:center;font-size:32px;font-weight:950;flex-shrink:0;text-align:center}.qf-step small{font-size:11px;font-weight:800;margin-top:-4px}
.qf-card{background:#fff;border:1px solid #dee7f3;border-radius:18px;padding:24px;margin:0 0 18px}.qf-header{display:flex;gap:10px;align-items:center;justify-content:space-between}.qf-kicker{font-weight:900;font-size:11px;color:#2c69cb;letter-spacing:.08em}.qf-header h3{font-size:20px;margin:5px 0 0}.qf-chip{background:#eef5ff;border-radius:100px;padding:8px 12px;font-size:11px;font-weight:800;color:#3863a8;white-space:nowrap}
.qf-formgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;margin:19px 0 12px}.qf-field{display:flex;flex-direction:column;gap:7px;min-width:0}.qf-field>span{color:#385378;font-weight:900;font-size:14px}.qf-field>span small{color:#8390a0;font-weight:600}.qf-inputrow{position:relative}.qf-inputrow input{width:100%;box-sizing:border-box;border:1.5px solid #d8e2f0;background:#f8fbff;border-radius:12px;padding:14px 43px 14px 14px;font-size:23px;font-weight:900;color:#193658;min-height:57px}.qf-inputrow input:focus{outline:none;border-color:#2d67d0;background:white;box-shadow:0 0 0 3px #2d67d01f}.qf-unit{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:12px;color:#667c9e;font-weight:900}.qf-hint{font-size:11px;color:#8392a4;font-weight:500}
.qf-last{min-width:0}.qf-fieldtop{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.qf-fieldtop>b{font-size:12px;color:#566a86}.qf-modes{display:flex;background:#eef3fa;border-radius:9px;padding:3px;gap:3px}.qf-modes button{border:0;border-radius:7px;padding:7px 9px;background:transparent;color:#637a97;font-size:11px;font-weight:900;white-space:nowrap}.qf-modes button.active{background:#fff;box-shadow:0 2px 6px #1329471f;color:#2f61b6}
.qf-tiny{background:#f1f7ff;color:#527097;padding:10px 12px;border-radius:10px;font-size:12px;line-height:1.75}.qf-gap{margin-top:24px}.qf-preview{margin:13px 0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.qf-preview>div{background:#f3f7fc;border:1px solid #e6ecf5;border-radius:12px;padding:12px}.qf-preview span,.qf-preview strong{display:block}.qf-preview span{font-size:11px;color:#677f9a;font-weight:800}.qf-preview strong{font-size:21px;margin-top:7px;color:#234a86}.qf-preview strong small{font-size:12px;margin-left:4px}.qf-preview .qf-wait{grid-column:1/-1;padding:18px}.qf-wait b,.qf-wait span{display:block;font-size:12px}.qf-wait span{font-weight:500;margin-top:6px}
.qf-goals{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:14px 0}.qf-goals button{padding:13px 10px;background:#fff;border:1px solid #d8e2f0;color:#506787;border-radius:11px;font-size:13px;font-weight:800}.qf-goals button.active{background:#265ebe;border-color:#265ebe;color:#fff}.qf-caution{font-size:12px;color:#6a7e99;line-height:1.75}.qf-error{color:#ad3a38;font-size:12px;line-height:1.65;font-weight:800;margin-top:7px}.qf-error:empty{display:none}.qf-submit{background:#235fc7;width:100%;border:0;border-radius:12px;display:flex;justify-content:space-between;align-items:center;color:#fff;padding:17px 18px;font-size:15px;font-weight:900;margin-top:15px}.qf-submit span{font-size:20px}.qf-privacy{font-size:11px;color:#8c9baa;margin:12px 0 0;line-height:1.7}.qf-history{border:1px solid #e1eaf4;background:#fff;border-radius:15px;padding:18px}.qf-history>div:first-child{display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap}.qf-history b{font-size:14px}.qf-history span{font-size:11px;color:#7d8ca0}.qf-deltas{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:13px}.qf-delta{border-radius:8px;background:#f6f9fe;padding:11px}.qf-delta span,.qf-delta b{display:block}.qf-delta b{font-size:15px;margin-top:8px;color:#2d5eab}
@media(max-width:680px){.qf-intro{padding:20px}.qf-intro h2{font-size:22px}.qf-intro p{font-size:12px}.qf-step{width:61px;height:61px;font-size:25px}.qf-formgrid{grid-template-columns:1fr}.qf-card{padding:17px}.qf-preview{grid-template-columns:repeat(2,minmax(0,1fr))}.qf-goals{grid-template-columns:repeat(2,minmax(0,1fr))}.qf-deltas{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
const profileCss=`
.qf-profilegrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-top:16px}
.qf-profilefield{display:flex;flex-direction:column;gap:8px;min-width:0;font-size:13px;color:#385378;font-weight:900}
.qf-profilefield select,.qf-profilefield input{width:100%;min-height:50px;padding:10px 12px;background:#f7faff;border:1.5px solid #d8e2f0;color:#223e61;font-size:14px;border-radius:11px}
.qf-profilefield select:focus,.qf-profilefield input:focus{outline:none;border-color:#366ac9}
.qf-profilefield small{font-size:11px;color:#8192a5;line-height:1.6;font-weight:500}
.qf-care{font-size:12px;color:#546b87;line-height:1.8;background:#f2f7ff;border-radius:10px;padding:12px}.qf-care a{color:#245fc0;font-weight:900;text-decoration:underline}
@media(max-width:680px){.qf-profilegrid{grid-template-columns:1fr}}
`;
const style=document.createElement('style');style.textContent=css+profileCss;document.head.appendChild(style);
for(const x of paths){
 if(x[0]==='home')x[2]='내 계획';
 if(x[0]==='body')x[2]='인바디';
}
const originalRender=render;
render=function(){
 originalRender();
 if(route==='body'||(route==='home'&&!state.body?.weight)){
  const node=document.querySelector('#view');
  if(node){node.innerHTML=qPage();qPreview();}
 }else if(route==='home'){
  const node=document.querySelector('#view');
  if(node&&!node.querySelector('#quick-edit')){
   const wrap=document.createElement('div');
   wrap.className='qf-homeedit';
   wrap.innerHTML='<button id="quick-edit" type="button" class="btn soft" data-action="route" data-value="body">인바디 수정 →</button>';
   node.insertBefore(wrap,node.firstChild);
  }
 }
};
document.addEventListener('input',e=>{
 if(e.target?.id&&/^quick_(height|weight|smm|fat)$/.test(e.target.id))qPreview();
},true);
document.addEventListener('click',e=>{
 const mode=e.target.closest('[data-qmode]');
 if(mode){
  e.preventDefault();
  const previous=document.getElementById('quick_fat')?.value;
  if(previous&&Number(previous)>0){
   const w=QN(document.getElementById('quick_weight')?.value);
   if(w&&w>0){
    let converted=mode.dataset.qmode==='pbf'?(qInputMode==='fatMass'?previous/w*100:previous):(qInputMode==='pbf'?previous*w/100:previous);
    const v={...state.body};
    if(qInputMode==='fatMass')v.fatMass=Number(previous);else v.pbf=Number(previous);
    qInputMode=mode.dataset.qmode;
    document.getElementById('qf-fat-holder').innerHTML=qModeField(v);
    document.getElementById('quick_fat').value=QR(converted);
   }else{
    qInputMode=mode.dataset.qmode;
    document.getElementById('qf-fat-holder').innerHTML=qModeField({});
   }
  }else{
   qInputMode=mode.dataset.qmode;
   document.getElementById('qf-fat-holder').innerHTML=qModeField({});
  }
  qPreview();
  return;
 }
 const goal=e.target.closest('[data-qgoal]');
 if(goal){
  e.preventDefault();qGoal=goal.dataset.qgoal;
  document.querySelectorAll('[data-qgoal]').forEach(x=>{x.classList.toggle('active',x.dataset.qgoal===qGoal);x.setAttribute('aria-pressed',String(x.dataset.qgoal===qGoal));});
 }
},true);
document.addEventListener('submit',e=>{
 if(e.target?.id==='quickInbodyForm'){
  e.preventDefault();e.stopPropagation();
  qSave();
 }
},true);
document.addEventListener('keydown',e=>{
 if(e.key!=='Enter'||!e.target?.id||!/^quick_(height|weight|smm|fat)$/.test(e.target.id))return;
 e.preventDefault();
 const seq=['quick_height','quick_weight','quick_smm','quick_fat'];const i=seq.indexOf(e.target.id);
 if(i>=0&&i<seq.length-1)document.getElementById(seq[i+1])?.focus();
 else qSave();
},true);
window.VimsQuickInbody={values:qPreviewValues,render:qPage,submit:qSave,history:qHist};
render();
})();
