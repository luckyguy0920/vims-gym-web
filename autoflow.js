
(function(){
'use strict';
const AF_GOALS=[['fat','체지방 감량'],['muscle','근육량 향상'],['recomp','체성분 개선'],['fitness','건강·운동 습관']];
const AF_LABELS={b:'아침',l:'점심',d:'저녁',s:'간식'};
const afFmt=x=>Number.isFinite(Number(x))?Math.round(Number(x)).toLocaleString('ko-KR'):'—';
const afEsc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const afMetric=(label,value,unit,caption)=>`<div class="af-stat"><span>${label}</span><strong>${value==null?'—':afFmt(value)}${value==null?'':`<small> ${unit}</small>`}</strong><em>${caption||''}</em></div>`;
const afNavigation=[
 ['home','⌂','내 계획'],['body','▣','인바디 등록'],['plan','▦','28일 전체'],['nutrition','◫','맞춤 식단'],
 ['workout','◉','오늘 운동'],['diet','✎','식사·생활 기록'],['recipes','♨','건강 레시피'],['stats','▥','변화 기록']
];
paths.splice(0,paths.length,...afNavigation);
function afReady(){return Boolean(state.goal?.kind&&state.body?.weight&&validateScan(state.body).length===0)}
function afCalc(){
 if(!afReady()||!window.VimsPlan28)return null;
 const c=window.VimsPlan28.nutrition();
 const day=Math.min(28,Math.max(1,initDay()));
 return {calc:c,day,plan:window.VimsPlan28.daily(day,c)};
}
function afGoalButtons(){
 return `<div class="af-goals" role="group" aria-label="원하는 운동 목표 변경">${AF_GOALS.map(([id,label])=>`<button type="button" class="${state.goal?.kind===id?'on':''}" data-action="choose-goal" data-value="${id}" aria-pressed="${String(state.goal?.kind===id)}">${label}</button>`).join('')}</div>`;
}
function afStepHeading(k,txt){return `<div class="af-smallheading"><span>${k}</span><strong>${txt}</strong></div>`;}
function afIntro(){
 const h=title('인바디 하나로 시작하는 28일 맞춤 관리','인바디 사진을 등록하면 내 몸의 시작 수치를 확인하고 식사·운동·휴식 계획을 한 번에 연결합니다.');
 return h+`<div class="af-cover"><div><div class="af-tag">VIMS GYM · PERSONAL 28</div><h2>사진 한 장으로<br/>28일 관리 계획을 시작하세요.</h2><p>사진 판독이 정상적으로 끝나면 기본 목표를 자동 설정합니다. 그다음 목표 변경은 한 번의 선택만으로 식단·운동·회복 계획에 함께 반영됩니다.</p><div class="af-actions"><label class="af-bigupload" for="afInbodyImage"><span>▣</span> 인바디 사진 등록하기<input id="afInbodyImage" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"/></label><button class="btn ghost" data-action="route" data-value="body">직접 수치 입력 / 판독 확인</button></div><div class="af-info">측정 결과지의 이름·연락처 등 개인정보를 가린 시험용 사진으로 먼저 확인하세요. 사진은 판독을 위해 서버로 전송됩니다.</div></div><div class="af-flow"><div><b>01</b><span>인바디 등록</span></div><div><b>02</b><span>수치 검증·기본 목표 설정</span></div><div><b>03</b><span>28일 식사·운동·휴식 연동</span></div></div></div>
  <div class="af-grid af-3">
    <div class="af-feature"><span>▦</span><h3>28일 전체 계획</h3><p>4주 동안 매일 무엇을 먹고 운동하고 회복할지 확인</p></div>
    <div class="af-feature"><span>◫</span><h3>끼니별 식단</h3><p>하루 추정 열량과 단백질, 아침부터 간식까지 재료 중량</p></div>
    <div class="af-feature"><span>◉</span><h3>오늘 할 운동</h3><p>빔스짐 기구 중심 운동 4종, 유산소 및 휴식 일정을 연결</p></div>
  </div><div class="af-safety">인바디만으로는 질환·알레르기·임신 여부·개인의 실제 소비열량을 알 수 없습니다. 열량은 검토용 추정치이며, 판독 결과가 불확실하면 자동 생성을 멈춥니다.</div>`;
}
function afWeekProgress(day){return `<div class="af-progress"><div><span>DAY ${String(day).padStart(2,'0')} / 28</span><b>${Math.round(day/28*100)}%</b></div><div class="af-track"><i style="width:${Math.round(day/28*100)}%"></i></div></div>`;}
function afHome(){
 if(!afReady())return afIntro();
 const a=afCalc();if(!a)return afIntro();
 const {calc:c,day,plan:p}=a;
 const w=state.body,warning=c.notes.length;
 let mealInfo=p.meals.map(m=>`<div class="af-meal"><span>${AF_LABELS[m.type]}</span><b>${afEsc(m.title)}</b><em>${Math.round(m.kcal)}킬로칼로리</em></div>`).join('');
 const ex=p.s.training?p.s.machines.map((m,i)=>`<div class="af-ex"><span>${String(i+1).padStart(2,'0')}</span><b>${afEsc(m.name)}</b><small>${p.s.wt.sets}세트 · ${p.s.wt.reps}</small></div>`).join(''):'<div class="af-recoveryday">오늘은 근력운동 쉬는 날입니다. 가벼운 걷기와 스트레칭으로 회복에 집중하세요.</div>';
 return `${title('나의 28일 통합 관리','한 번 등록한 인바디 측정값으로 식단·운동·휴식 화면이 자동으로 연결됩니다.')}
  <div class="af-dashboard">
  <div class="af-top"><div><span class="af-tag">내 인바디에서 생성한 관리 계획</span><h2>${afEsc(goalLabel())}</h2><p>운동 목표를 변경하면 28일 식단과 근력·유산소 배치가 즉시 다시 계산됩니다.</p></div><div class="af-topright">${afWeekProgress(day)}<button class="af-ghostlight" data-action="route" data-value="body">인바디 다시 등록</button></div></div>
  <div class="af-mid"><div class="af-minititle">나의 목표 방향 <small>기본값 자동 설정 · 언제든 변경 가능</small></div>${afGoalButtons()}</div>
  <div class="af-metrics">
    ${afMetric('체중',w.weight,'kg','인바디 현재값')}
    ${afMetric('골격근량',w.smm,'kg','근력운동 기준')}
    ${afMetric('체지방량',w.fatMass,'kg','제지방량 산출')}
    ${afMetric('체지방률',w.pbf,'%','체성분 변화 비교')}
  </div>
  ${warning?`<div class="af-safety"><b>영양 목표 검토 필요</b>${c.notes.map(t=>`<p>${afEsc(t)}</p>`).join('')}</div>`:''}
  <div class="af-metrics af-nutrients">
    ${afMetric('하루 참고 열량',c.kcal,'kcal','측정 제지방량과 활동량 가정')}
    ${afMetric('하루 단백질',c.protein,'g','운동 목표에 따라 조정')}
    ${afMetric('탄수화물',c.carbs,'g','기초 열량 배분')}
    ${afMetric('지방',c.fats,'g','기초 열량 배분')}
  </div>
  <div class="af-today"><div class="af-today-header"><div><span>DAY ${day} · 오늘의 실행</span><h3>식사 · 운동 · 회복</h3></div><button class="btn primary" data-action="route" data-value="plan">28일 전체 보기 →</button></div>
  <div class="af-columns">
   <section class="af-dcard"><div class="af-cardtitle"><span>01</span><h4>오늘의 식사</h4></div>${mealInfo}<div class="af-dfoot">총 ${afFmt(p.sum.kcal)}킬로칼로리 · 단백질 ${afFmt(p.sum.p)}g</div><button class="af-textbutton" data-action="route" data-value="nutrition">재료별 중량 보기 →</button></section>
   <section class="af-dcard"><div class="af-cardtitle"><span>02</span><h4>오늘의 운동</h4></div>${ex}<div class="af-dfoot">유산소 ${p.s.cardio}분 · ${p.s.training?`세트간 ${p.s.wt.rest} 휴식`:'회복 중심 활동'}</div><button class="af-textbutton" data-action="route" data-value="workout">운동 자세·상세 보기 →</button></section>
   <section class="af-dcard"><div class="af-cardtitle"><span>03</span><h4>오늘의 휴식·기록</h4></div><div class="af-rest"><b>${p.s.training?'훈련 후 회복':'회복일'}</b><p>수면 7~9시간 확보, 충분한 수분과 무리하지 않는 활동을 기본으로 합니다.</p><p>몸의 통증과 피로 수준을 확인해 운동 강도를 조정하세요.</p></div><div class="af-dfoot">현재 실천 체크 ${countHabits(day)} / 4</div><button class="af-textbutton" data-action="route" data-value="diet">오늘의 실천 기록 →</button></section>
  </div></div>
  <div class="af-shortcuts"><button data-action="route" data-value="plan"><b>▦</b><span>28일 전체 계획</span></button><button data-action="route" data-value="nutrition"><b>◫</b><span>끼니별 식단</span></button><button data-action="route" data-value="workout"><b>◉</b><span>운동 기구 4종</span></button><button data-action="route" data-value="stats"><b>▥</b><span>체성분 변화 기록</span></button></div>
  <div class="af-safety">표시된 열량·운동량은 진단이나 치료 처방이 아닌 성인 일반 참고용입니다. 연령, 질환, 임신·수유, 알레르기 및 실제 운동 경력이 인바디에 모두 나타나지는 않습니다.</div>
  </div>`;
}
function afNutrition(){
 if(!afReady())return afIntro();
 const a=afCalc(),day=a.day,c=a.calc,p=a.plan;
 const inputInfo=`<div class="af-nutbar"><div><span>인바디 연동</span><h2>${afEsc(goalLabel())}</h2><p>열량 ${c.kcal==null?'자동 산출 보류':afFmt(c.kcal)+'킬로칼로리'} · 하루 단백질 ${afFmt(c.protein)}g · 인바디 수치 기준</p></div><button class="btn ghost" data-action="route" data-value="body">인바디 변경</button></div>`;
 const cards=p.meals.map(m=>`<article class="af-nmeal"><header><div><span>${AF_LABELS[m.type]}</span><h3>${afEsc(m.title)}</h3></div><b>${afFmt(m.kcal)}<small>킬로칼로리</small></b></header><div class="af-nitems">${m.items.map(it=>`<div><span>${afEsc(window.VimsNutrition.foods[it.k]?.[0]||it.k)}</span><b>${afFmt(it.g)}g</b></div>`).join('')}</div><div class="af-nfooter">단백질 ${afFmt(m.p)}g · 탄수화물 ${afFmt(m.c)}g · 지방 ${afFmt(m.f)}g · 식이섬유 ${afFmt(m.fiber)}g</div></article>`).join('');
 return `${title('인바디 연동 맞춤 식단','다시 입력할 필요 없이 인바디와 목표 설정에서 식단을 자동 계산합니다.')}${inputInfo}
  <div class="af-daytitle"><div><b>DAY ${String(day).padStart(2,'0')} · 끼니별 식사 구성</b><p>실제 먹은 재료·브랜드에 따라 열량이 달라질 수 있습니다.</p></div><button class="btn soft" data-action="route" data-value="plan">28일 식사 일정 보기</button></div><div class="af-nmeals">${cards}</div>
  <div class="af-safety">음식 열량과 다량영양소는 일반적인 식품 성분에 대한 추정입니다. 비타민·무기질 전체, 나트륨, 알레르기 교차 접촉을 검증한 식단은 아닙니다. 저체중이나 측정값 충돌 등에서는 열량 목표가 보류됩니다.</div><div class="af-actions"><button class="btn primary" data-autoflow="copyMeals">오늘의 식단을 기록으로 복사</button><button class="btn ghost" data-action="route" data-value="home">내 계획으로</button></div>`;
}
function afWorkout(){
 if(!afReady())return afIntro();
 const a=afCalc(),p=a.plan;
 return `${title('인바디 연동 오늘의 운동','목표와 현재 운동 경험을 반영한 기본 4종 기구 운동입니다. 같은 기구를 중복 사용하지 않습니다.')}
  <div class="af-workhead"><div><span>DAY ${a.day} · ${p.s.training?'근력운동일':'회복일'}</span><h2>${afEsc(goalLabel())}</h2><p>주당 중강도 유산소 ${p.s.wt.mins}분 목표 · 오늘 ${p.s.cardio}분</p></div><button class="btn soft" data-action="route" data-value="plan">28일 계획 보기</button></div>
  ${p.s.training?`<div class="af-worklist">${p.s.machines.map((e,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><div><b>${afEsc(e.name)}</b><p>${afEsc(e.tip||'무리하지 않는 가동범위에서 시행하세요.')}</p></div><strong>${p.s.wt.sets}세트<br/>${p.s.wt.reps}</strong></div>`).join('')}</div><div class="af-safety">운동기구는 안전한 중량과 가동범위를 먼저 확인하세요. 세트 사이 ${afEsc(p.s.wt.rest)} 휴식이 기본 제안이며 통증이 있다면 중단하고 전문가 확인을 받으세요.</div>`:`<div class="af-recovery"><h3>오늘은 회복과 활동을 위한 날입니다.</h3><p>다음 근력운동을 위해 수면 7~9시간을 확보하고, 무리 없는 걷기와 관절 가동성 운동을 진행하세요.</p></div>`}
  <div class="af-actions"><button class="btn primary" data-action="route" data-value="diet">실행 기록하기</button><button class="btn ghost" data-action="route" data-value="home">내 계획으로</button></div>`;
}
const STYLES=`
.af-cover{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(220px,.65fr);gap:24px;padding:32px;border-radius:24px;background:linear-gradient(125deg,#0b1f3a,#1a3f73);color:#fff;overflow:hidden}
.af-cover h2{font-size:clamp(28px,3.5vw,42px);line-height:1.24;letter-spacing:-.045em;margin:15px 0}.af-cover p{color:#d6e6ff;line-height:1.9;font-size:14px;max-width:520px}
.af-tag{display:inline-flex;background:rgba(255,255,255,.16);padding:8px 12px;font-size:11px;font-weight:900;letter-spacing:.04em;border-radius:99px}
.af-actions{display:flex;gap:11px;flex-wrap:wrap;align-items:center;margin:20px 0 6px}.af-actions .btn{min-height:46px}
.af-bigupload{position:relative;background:#b6ed78;color:#1d3424;border-radius:11px;font-size:15px;font-weight:900;min-height:48px;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:10px 17px;cursor:pointer}.af-bigupload input{position:absolute;opacity:0;width:100%;height:100%;inset:0;cursor:pointer}
.af-info{margin-top:13px;font-size:11px;color:#bbcae1;line-height:1.7}.af-flow{display:flex;flex-direction:column;justify-content:center;gap:13px}.af-flow>div{padding:15px 17px;background:#ffffff12;border:1px solid #ffffff26;border-radius:14px;display:flex;align-items:center;gap:17px}.af-flow b{font-size:24px;color:#c9f193}.af-flow span{font-weight:800;font-size:13px}
.af-grid{display:grid;gap:12px;margin:15px 0}.af-3{grid-template-columns:repeat(3,minmax(0,1fr))}.af-feature{background:white;border:1px solid #e4ebf4;border-radius:16px;padding:20px}.af-feature>span{font-size:27px;color:#2956ac}.af-feature h3{font-size:17px;margin:8px 0}.af-feature p{font-size:12px;color:#74869a;line-height:1.8;margin:0}
.af-safety{margin:14px 0;background:#fff8eb;border:1px solid #ecdebf;color:#775f35;font-size:12px;border-radius:12px;padding:14px;line-height:1.75}.af-safety p{margin:5px 0}
.af-top{background:linear-gradient(115deg,#122947,#234f98);color:#fff;border-radius:22px;padding:24px;display:flex;align-items:center;justify-content:space-between;gap:25px;flex-wrap:wrap}.af-top h2{font-size:29px;margin:12px 0 5px}.af-top p{color:#d4e3fa;font-size:12px;line-height:1.8;max-width:430px}.af-topright{min-width:205px}.af-ghostlight{border:1px solid #ffffff8a;color:#fff;background:transparent;padding:9px 13px;border-radius:9px;font-size:12px;font-weight:800;margin-top:12px}
.af-progress>div:first-child{display:flex;justify-content:space-between;gap:9px;color:#dbe6f8;font-size:12px}.af-progress b{color:white}.af-track{margin-top:10px;height:8px;border-radius:8px;background:#ffffff46;overflow:hidden}.af-track i{display:block;height:100%;background:#bced8c;border-radius:8px}
.af-mid{margin:17px 0}.af-minititle{font-weight:900;font-size:15px}.af-minititle small{font-size:11px;color:#7a8ba1;margin-left:8px;font-weight:500}.af-goals{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.af-goals button{border:1px solid #d5e0ee;border-radius:10px;background:#fff;color:#445e82;font-weight:800;padding:11px 14px;font-size:13px}.af-goals button.on{background:#2558b9;border-color:#2558b9;color:#fff}
.af-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:11px 0}.af-stat{background:#fff;border:1px solid #e2e9f2;border-radius:14px;padding:15px;min-width:0}.af-stat span,.af-stat strong,.af-stat em{display:block}.af-stat span{font-size:12px;font-weight:800;color:#647a95}.af-stat strong{font-size:24px;color:#1a3760;margin:7px 0;letter-spacing:-.025em}.af-stat small{font-size:12px}.af-stat em{font-style:normal;font-size:10px;color:#8390a3;line-height:1.7}.af-nutrients .af-stat{background:#eef5ff}
.af-today{margin-top:20px}.af-today-header,.af-daytitle{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0;flex-wrap:wrap}.af-today-header span{color:#3368b8;font-weight:800;font-size:12px}.af-today-header h3{font-size:22px;margin:4px 0}.af-columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.af-dcard{background:#fff;border:1px solid #e2eaf2;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:7px}.af-cardtitle{display:flex;align-items:center;gap:8px;margin-bottom:3px}.af-cardtitle span{color:#3367c3;font-size:13px;font-weight:900}.af-cardtitle h4{font-size:17px;margin:0}.af-meal,.af-ex{display:flex;align-items:flex-start;gap:6px;padding:9px 0;border-bottom:1px solid #edf1f7;font-size:12px}.af-meal span,.af-ex span{width:31px;flex-shrink:0;color:#416bb4;font-weight:800}.af-meal b,.af-ex b{flex:1;line-height:1.5;color:#324761}.af-meal em{font-size:10px;white-space:nowrap;font-style:normal;color:#8390a4}.af-ex small{color:#8794a4;white-space:nowrap}.af-dfoot{margin-top:auto;font-size:12px;padding-top:12px;color:#496280}.af-textbutton{font-weight:900;color:#2b62c3;border:0;background:transparent;padding:6px 0;text-align:left;font-size:12px}
.af-recoveryday,.af-rest{font-size:12px;color:#526d8b;line-height:1.85}.af-rest p{margin:9px 0}
.af-shortcuts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:17px 0}.af-shortcuts button{background:#fff;border:1px solid #dfe7f1;border-radius:12px;padding:15px;text-align:left;display:flex;gap:10px;align-items:center;font-weight:800;color:#355078}.af-shortcuts b{font-size:20px;color:#2c5fbc}
.af-nutbar,.af-workhead{display:flex;gap:13px;align-items:center;justify-content:space-between;flex-wrap:wrap;border-radius:15px;background:#eff5ff;padding:20px;margin:15px 0}.af-nutbar span,.af-workhead span{font-size:12px;color:#376abc;font-weight:900}.af-nutbar h2,.af-workhead h2{margin:6px 0;font-size:23px}.af-nutbar p,.af-workhead p{margin:0;font-size:13px;color:#617792}.af-daytitle b{font-size:19px}.af-daytitle p{font-size:12px;color:#788aa0;margin:3px 0}
.af-nmeals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.af-nmeal{background:#fff;border-radius:15px;border:1px solid #e1e9f2;padding:17px}.af-nmeal header{display:flex;align-items:center;justify-content:space-between;gap:12px}.af-nmeal header span{font-size:11px;color:#3266bd;font-weight:900}.af-nmeal h3{font-size:17px;margin:5px 0 14px}.af-nmeal header>b{font-size:21px;white-space:nowrap;color:#234778}.af-nmeal header small{font-size:10px;margin-left:4px}
.af-nitems div{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid #edf2f8;font-size:13px}.af-nitems b{white-space:nowrap}.af-nfooter{font-size:11px;color:#6f8298;line-height:1.7;margin-top:8px}
.af-worklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.af-worklist>div{display:flex;align-items:flex-start;gap:12px;background:#fff;border:1px solid #dfe8f1;border-radius:14px;padding:17px}.af-worklist span{font-weight:900;color:#3465bc}.af-worklist>div>div{flex:1}.af-worklist b{font-size:15px}.af-worklist p{font-size:12px;line-height:1.7;color:#68809c}.af-worklist strong{font-size:12px;text-align:right;white-space:nowrap;color:#295bad}.af-recovery{background:#f2f7ff;border:1px solid #dae5f6;border-radius:15px;padding:25px}.af-recovery h3{margin:0 0 12px}.af-recovery p{font-size:13px;color:#607897;line-height:1.8}
@media(max-width:1080px){.af-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.af-columns,.af-3{grid-template-columns:1fr 1fr}.af-cover{grid-template-columns:1fr}}
@media(max-width:700px){.af-columns,.af-3,.af-nmeals,.af-worklist{grid-template-columns:1fr}.af-shortcuts{grid-template-columns:1fr 1fr}.af-cover{padding:23px}.af-cover h2{font-size:28px}.af-top{padding:20px}.af-top h2{font-size:24px}.af-stat strong{font-size:20px}.af-nutbar h2{font-size:20px}}
`;
const styles=document.createElement('style');styles.textContent=STYLES;document.head.appendChild(styles);
const baseNavRender=navRender;
navRender=function(){
 baseNavRender();
 const mobile=document.querySelector('#mobileNav');
 if(mobile){
  const list=[['home','⌂','홈'],['body','▣','인바디'],['plan','▦','28일'],['nutrition','◫','식단'],['diet','✎','기록']];
  mobile.innerHTML=list.map(([id,ico,label])=>`<button type="button" data-action="route" data-value="${id}" class="${route===id?'active':''}"><span>${ico}</span><span>${label}</span></button>`).join('');
 }
};
// Existing goal confirmation remains available. After confirmation, direct users to their integrated home.
const baseChooseGoal=chooseGoal;
chooseGoal=function(kind){
 const before=state.goal?.kind;
 baseChooseGoal(kind);
 if(state.goal?.kind===kind&&afReady()){
  state.autoPlanEnabled=true;
  state.planSource='inbody';
  save();
  setRoute('home');
 }
};
function autoGoalFromMeasurement(data) {
 const height=Number(data.height),weight=Number(data.weight);
 const bmi=weight/(height/100)**2;
 // Conservative default; never infer a treatment-oriented fat-loss goal automatically.
 return bmi<18.5?'fitness':'recomp';
}
// OCR has to finish successfully before it is stored or propagated.
const baseRecognize=recognizePhoto;
recognizePhoto=async function(file){
 await baseRecognize(file);
 if(scanSession.status!=='ready')return;
 const measured=scanData();
 const issues=[...(scanSession.uncertain||[]),...validateScan(measured)];
 if(issues.length){
  if(route!=='body')setRoute('body');
  toast('인바디 인식값을 확인해 주세요. 불확실한 수치는 자동 적용하지 않습니다.');
  return;
 }
 const kind=state.goal?.kind||autoGoalFromMeasurement(measured);
 chooseGoal(kind);
 if(afReady())toast('인바디가 연결됐습니다. 28일 식사·운동·휴식이 자동으로 준비됐습니다.');
};
// Manual correction can update the same unified source after validating all values.
const baseApplyCorrections=applyCorrections;
applyCorrections=function(){
 baseApplyCorrections();
 if(scanSession.status==='ready'&&!(scanSession.uncertain||[]).length&&validateScan(scanData()).length===0){
  chooseGoal(state.goal?.kind||autoGoalFromMeasurement(scanData()));
 }
};
const baseRender=render;
render=function(){
 baseRender();
 if(route==='home'){
  const view=document.querySelector('#view');if(view)view.innerHTML=afHome();
 }
 if(route==='nutrition'){
  const view=document.querySelector('#view');if(view)view.innerHTML=afNutrition();
 }
 if(route==='workout'){
  const view=document.querySelector('#view');if(view)view.innerHTML=afWorkout();
 }
 if(route==='course'){
  const view=document.querySelector('#view');
  if(view)view.innerHTML=window.VimsPlan28?.page()||afHome();
 }
 if(route==='body'){
  const view=document.querySelector('#view');
  if(view){
   const prompt=view.querySelector('.page-desc');
   if(prompt)prompt.textContent='인바디 사진 한 번으로 전 메뉴를 연결합니다. 판독이 불확실할 때만 수치를 수정해 주세요.';
   const advice=document.createElement('div');advice.className='af-safety';advice.innerHTML='<b>자동 연동 안내</b><p>판독값 5개 항목이 유효하면 기존 목표를 유지하거나 기본 목표를 자동 설정하고, 28일 계획 및 식사·운동 화면으로 연동합니다. 목표는 이후 변경할 수 있습니다.</p>';
   const grid=view.querySelector('.ocr-steps');
   if(grid)grid.after(advice);
  }
 }
 if(route==='diet'&&afReady()){
  const a=afCalc(),v=document.querySelector('#view');
  if(a&&v){
   const div=document.createElement('div');div.className='af-nutbar';
   div.innerHTML=`<div><span>인바디 연동 식단</span><h2>DAY ${a.day} · 오늘 추천 식단</h2><p>${a.plan.meals.map(m=>AF_LABELS[m.type]+' '+afEsc(m.title)).join(' · ')}</p></div><button class="btn primary" data-autoflow="copyMeals">오늘 추천을 기록으로 복사</button>`;
   v.insertBefore(div,v.firstChild);
  }
 }
};
// Update home upload and record copy using existing local state; no photos are persisted.
document.addEventListener('change',function(e){
 if(e.target?.id==='afInbodyImage'&&e.target.files?.[0]){
  const file=e.target.files[0];
  if(bodyPhotoURL)URL.revokeObjectURL(bodyPhotoURL);
  bodyPhotoURL=URL.createObjectURL(file);
  setRoute('body');
  recognizePhoto(file);
 }
},true);
document.addEventListener('click',function(e){
 const b=e.target.closest('[data-autoflow]');
 if(!b)return;
 e.preventDefault();e.stopPropagation();
 if(b.dataset.autoflow==='copyMeals'&&afReady()){
  const a=afCalc();if(!a)return;
  const d=getDay(a.day);
  for(const m of a.plan.meals){
   const name={b:'breakfast',l:'lunch',d:'dinner',s:'snack'}[m.type];
   // Only copy by direct user action, never overwrite actual consumption automatically.
   d.meals[name]=m.title+' ('+m.items.map(x=>window.VimsNutrition.foods[x.k][0]+' '+x.g+'g').join(', ')+')';
  }
  save();toast('권장 식단을 기록에 복사했습니다. 실제 먹은 양은 수정해 주세요.');setRoute('diet');
 }
},true);
// Old saved InBody without a goal can be connected without requiring another upload.
if(!state.goal?.kind&&state.body&&validateScan(state.body).length===0){
 chooseGoal(autoGoalFromMeasurement(state.body));
}
window.VimsAutoFlow={ready:afReady,overview:afHome,nutrition:afNutrition,workout:afWorkout};
render();
})();
