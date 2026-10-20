
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
.mp-wrap{max-width:1050px;margin:0 auto;padding:20px 16px 138px}
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
.mp-footer{background:#142f52;color:white;border-radius:19px;padding:23px;margin-top:26px}.mp-footer h2{font-size:22px;margin:0 0 9px}.mp-footer p{color:#d8e7f7;font-size:13px;line-height:1.8}.mp-footer a{margin-top:10px;background:#FF7A00;color:#fff;display:inline-flex;align-items:center;padding:13px 17px;border-radius:11px;text-decoration:none;font-weight:900}
.mp-micro{font-size:11px;line-height:1.8;color:#8290a2;margin:13px 0}
.mp-modalshade{position:fixed;inset:0;background:#0b182cce;z-index:9000;display:flex;justify-content:center;align-items:center;padding:15px}
.mp-modal{max-width:610px;width:100%;max-height:90vh;overflow-y:auto;background:#fff;border-radius:17px;padding:19px}
.mp-modal header{display:flex;justify-content:space-between;align-items:center;gap:10px}.mp-modal h2{font-size:20px;margin:7px 0}
.mp-modalclose{font-weight:900;color:#4e6486;background:#eef3f8;border:0;border-radius:10px;padding:8px 11px}
.mp-coverphoto{width:100%;height:200px;object-fit:cover;border-radius:12px;margin:9px 0}.mp-modal h3{font-size:15px;margin:20px 0 8px}
.mp-ingredients{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.mp-ingredients div{display:flex;justify-content:space-between;gap:8px;background:#f4f8fd;padding:9px;border-radius:8px;font-size:12px}
.mp-modal ol,.mp-modal ul{padding-left:21px;color:#536b85;font-size:13px;line-height:1.95}.mp-modal p{font-size:12px;color:#6d7e92;line-height:1.8}
@media(max-width:680px){.mp-metrics{grid-template-columns:1fr 1fr}.mp-days{grid-template-columns:1fr}.mp-ingredients{grid-template-columns:1fr}.mp-wrap{padding:10px 10px 140px}.mp-hero{padding:20px}}
.mp-official-logo{width:min(250px,80%);height:auto;aspect-ratio:1410/185;display:block;object-fit:contain;object-position:left center;margin:2px 0 17px}
.mp-fixed-consult{position:fixed;z-index:100;bottom:calc(16px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);
 width:min(calc(100% - 32px),420px);padding:0;box-shadow:none;background:transparent}
.mp-fixed-consult a{display:flex;align-items:center;justify-content:center;width:100%;min-height:52px;padding:12px 16px;
 border-radius:14px;background:#FF7A00;color:#fff;text-decoration:none;font-weight:900;font-size:16px;
 box-shadow:0 10px 24px rgba(255,122,0,.28);transition:background-color .2s}
.mp-fixed-consult a:hover{background:#F06D00}
.mp-fixed-consult a:focus-visible{outline:3px solid #174b8f;outline-offset:3px}
@media print{.mp-fixed-consult{display:none!important}}
`;
const phoneModernStyles=`
:root{--ink:#192B40;--blue:#285281;--pale:#F5F7FA;--line:#E5EBF1}
body{background:#F6F8FB;color:#192B40;font-family:-apple-system,BlinkMacSystemFont,"Pretendard","Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;letter-spacing:-.02em;-webkit-font-smoothing:antialiased}
.mp-wrap{max-width:980px}
.mp-hero{background:#182E4A;border:1px solid #25415E;border-radius:18px;padding:26px;box-shadow:none}
.mp-hero span{color:#B7CDE5;font-weight:700;letter-spacing:.07em}
.mp-hero h1{font-size:clamp(24px,3.4vw,32px);font-weight:770;letter-spacing:-.045em}
.mp-hero p{font-size:12px;line-height:1.7;color:#C9D6E5}
.mp-status{background:#F1F5FA;border:1px solid #E2EAF3;border-radius:12px;color:#59728E;font-size:12px;line-height:1.7}
.mp-status b{color:#304E70;font-size:13px;font-weight:730}
.mp-status.warn{background:#FDF8EF;color:#756B5B;border:1px solid #EEE7D9}
.mp-check{font-size:12px;color:#586D84}
.mp-primary,.mp-sub{font-size:13px;font-weight:720;border-radius:10px}
.mp-primary{background:#285281}
.mp-sub{background:#FFF;border-color:#E0E8F1;color:#3F5D7C}
.mp-heading h2{font-size:20px;font-weight:770;letter-spacing:-.035em}
.mp-heading p{font-size:12px;color:#8293A6}
.mp-metrics{gap:10px}
.mp-metric{border-radius:13px;border:1px solid #E4EBF1;padding:17px}
.mp-metric span{font-size:11px;color:#8696A7;font-weight:660}
.mp-metric b{color:#254567;font-size:20px;font-weight:750;letter-spacing:-.03em}
.mp-week{border-radius:15px;border:1px solid #E3EAF1;padding:17px}
.mp-weekhead span{color:#6482A4;font-weight:700}
.mp-weekhead h3{font-size:18px;font-weight:760;letter-spacing:-.02em}
.mp-day{border-radius:13px;border:1px solid #E6ECF2;padding:15px}
.mp-day.train{border-left:3px solid #517FB4}
.mp-day.rest{border-left:3px solid #CDD5DF}
.mp-dayhead b,.mp-dayhead strong{font-weight:740}
.mp-dayhead span{color:#748FAC}
.mp-dayhead small{color:#8798AA}
.mp-meal{border-top:1px solid #EEF2F6}
.mp-meal small{color:#7190B0;font-size:10px;font-weight:690}
.mp-meal strong{color:#354C66;font-size:12px;font-weight:680}
.mp-meal em{color:#8C9DB0}
.mp-recipe-btn{background:#F4F7FB;border-color:#E0E8F2;color:#315C8D;font-weight:700;border-radius:9px;min-height:33px}
.mp-rest{color:#75879A;font-size:11px}
.mp-footer{background:#F1F5F9;border:1px solid #E1E8F0;border-radius:16px;color:#26415D;padding:23px}
.mp-footer h2{font-size:21px;font-weight:770;letter-spacing:-.035em}
.mp-footer p{color:#657A91;font-size:12px}
.mp-footer a{background:#FF7A00;color:#FFF;border-radius:10px;font-weight:760}
.mp-micro{font-size:11px;line-height:1.75;color:#8998AA}
.mp-modal{border-radius:16px}
.mp-modal h2{font-size:20px;font-weight:760}
.mp-modal h3{font-size:15px;font-weight:740}
.mp-ingredients div{background:#F6F8FB;border-radius:9px;color:#536B83}
@media(max-width:680px){
.mp-wrap{padding:12px 12px 142px}
.mp-hero{padding:21px;border-radius:16px}
.mp-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
.mp-week{padding:14px}
.mp-day{padding:13px}
.mp-hero h1{font-size:25px}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
const phoneDarkStyles="\n:root{color-scheme:dark;--ink:#F2F4F7;--blue:#8AA9CE;--pale:#24282F;--line:#353B45}\nhtml,body{background:#08090B!important;color:#E7ECF3}\n.mp-wrap{background:#08090B}\n.mp-hero{background:#171A20!important;border:1px solid #373D47;color:#FFF}\n.mp-hero h1{color:#F5F7F9}.mp-hero span{color:#B9CBDD}.mp-hero p{color:#B4C1D1}\n.mp-status,.mp-status.warn{background:#20242B;border:1px solid #3A434D;color:#C1CDDA}\n.mp-status b,.mp-status.warn b{color:#E5EDF6}\n.mp-status.warn{background:#242119;border-color:#534838}\n.mp-check{color:#C0CBD8}.mp-check input{accent-color:#698FC3}\n.mp-primary{background:#344C6B;color:#FFF}\n.mp-primary:disabled{background:#292E36;color:#86929F}\n.mp-sub{background:#252A32;border:1px solid #404853;color:#E1E9F3}\n.mp-heading h2{color:#F3F6FA}.mp-heading p{color:#A6B5C5}\n.mp-metric,.mp-week,.mp-day{background:#15181D!important;border:1px solid #343B45!important;color:#E1E8F0}\n.mp-metric span,.mp-weekhead span,.mp-dayhead span{color:#B7C6DA}\n.mp-metric b,.mp-weekhead h3,.mp-dayhead strong{color:#F1F5F9}\n.mp-weekhead{border-color:#39414B}.mp-day.train{border-left:3px solid #7294BB!important}.mp-day.rest{border-left:3px solid #505B6A!important}\n.mp-meal{border-color:#383F48}\n.mp-meal figure{background:#272D36;color:#AFC4D8}\n.mp-meal small{color:#AEC5E2}.mp-meal strong{color:#DFE7F0}.mp-meal em{color:#A7B5C5}\n.mp-recipe-btn{background:#292F38;border:1px solid #414C5B;color:#D8E8FB}\n.mp-rest,.mp-rest b{color:#B1BFCF}\n.mp-footer{background:#1D2128;border:1px solid #3B444D;color:#EDF2F7}\n.mp-footer h2{color:#F5F6F8}.mp-footer p{color:#BAC7D5}\n.mp-footer a{background:#FF7A00;color:#FFF}\n.mp-micro{color:#A7B2BF}\n.mp-modal{background:#1A1E25!important;border:1px solid #424A55;color:#EAF0F5}\n.mp-modal h2,.mp-modal h3{color:#F4F7F9}\n.mp-modal p,.mp-modal ol,.mp-modal ul{color:#BECBD9}\n.mp-modalclose{background:#2B3039;color:#E5ECF4}\n.mp-ingredients div{background:#272D36;color:#E0E9F3}\n.mp-fixed-consult a{background:#FF7A00!important;color:#FFF!important}\n.mp-fixed-consult a:hover{background:#F06D00!important}\n.mp-loading{color:#CFDBE8}\n@media print{:root{color-scheme:light}html,body{background:#FFF!important;color:#111!important}}\n";
const phoneLayoutStyles="\n:root{--mp-gap:14px}\n.mp-wrap{max-width:1060px;padding:19px 17px 148px}\n.mp-hero{padding:27px 29px;margin-bottom:16px}\n.mp-official-logo{max-width:240px;margin-bottom:16px}\n.mp-hero h1{font-size:clamp(25px,3vw,31px);line-height:1.26}\n.mp-hero p{font-size:13px}\n.mp-heading{align-items:flex-end;gap:10px;margin:25px 0 12px}\n.mp-heading h2{font-size:21px}\n.mp-heading p{font-size:13px;line-height:1.5}\n.mp-status{font-size:13px;padding:16px}\n.mp-status b{font-size:14px;margin-bottom:5px}\n.mp-check{font-size:13px;gap:11px}\n.mp-actions{gap:10px;margin:14px 0}\n.mp-primary,.mp-sub{min-height:44px;padding:11px 16px;font-size:13px;line-height:1.4}\n.mp-metrics{gap:11px}\n.mp-metric{padding:17px;min-width:0}\n.mp-metric span{font-size:12px}\n.mp-metric b{font-size:21px;line-height:1.3;overflow-wrap:anywhere}\n.mp-week{display:block;margin-top:13px;border:1px solid #343B46;border-radius:15px;padding:0;background:#13161B}\n.mp-weekhead{display:flex;align-items:center;justify-content:space-between;min-height:73px;padding:15px 17px;gap:12px;list-style:none;cursor:pointer;margin:0;border-bottom:0}\n.mp-weekhead::-webkit-details-marker{display:none}\n.mp-weekhead::marker{content:''}\n.mp-weekhead:focus-visible{outline:2px solid #89AACA;outline-offset:-3px}\n.mp-weekhead:hover{background:#1B2027}\n.mp-weekhead>div{min-width:0}\n.mp-weekhead span{font-size:11px;color:#B4C6D9}\n.mp-weekhead h3{font-size:18px;margin:4px 0 0;color:#F0F3F7}\n.mp-weekchevron{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex:none;background:#2A3039;color:#E2EBF6;border-radius:9px;font-size:25px;transition:transform .2s}\n.mp-week[open] .mp-weekchevron{transform:rotate(180deg)}\n.mp-week[open] .mp-weekhead{border-bottom:1px solid #343C46}\n.mp-days{padding:13px;gap:11px;margin:0}\n.mp-day{padding:16px}\n.mp-dayhead{gap:11px;align-items:center}\n.mp-dayhead strong{font-size:14px}\n.mp-dayhead small{color:#B4C1D1;font-size:11px}\n.mp-meal{gap:10px;padding:11px 0}\n.mp-meal figure{width:46px;height:46px}\n.mp-meal small{font-size:11px}\n.mp-meal strong{font-size:13px;line-height:1.5;overflow-wrap:anywhere}\n.mp-meal em{font-size:11px}\n.mp-recipe-btn{min-height:44px;min-width:58px;padding:10px 11px;font-size:12px;line-height:1.3;flex:none}\n.mp-rest{font-size:12px;line-height:1.65}\n.mp-footer{padding:21px;margin-top:22px}\n.mp-footer h2{font-size:21px}\n.mp-footer p{font-size:13px}\n.mp-footer a{min-height:44px;display:inline-flex;align-items:center;justify-content:center;font-size:13px}\n.mp-modal{padding:22px;max-width:640px}\n.mp-modalclose{min-height:44px;padding:10px 13px}\n.mp-modal h2{font-size:22px;line-height:1.35}\n.mp-modal h3{font-size:16px}\n.mp-modal ol,.mp-modal ul,.mp-modal p{font-size:13px}\n.mp-ingredients div{padding:11px;font-size:13px}\n.mp-fixed-consult{width:min(calc(100% - 30px),520px)}\n.mp-fixed-consult a{min-height:51px;font-size:15px}\n@media(min-width:900px){\n .mp-days{grid-template-columns:repeat(2,minmax(0,1fr))}\n}\n@media(max-width:680px){\n .mp-wrap{padding:12px 12px 142px}\n .mp-hero{padding:20px}\n .mp-official-logo{max-width:190px}\n .mp-hero h1{font-size:25px}\n .mp-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}\n .mp-metric{padding:13px}\n .mp-metric b{font-size:19px}\n .mp-heading{align-items:flex-start}\n .mp-heading h2{font-size:20px}\n .mp-heading p{font-size:12px}\n .mp-weekhead{padding:14px}\n .mp-days{grid-template-columns:1fr;padding:10px}\n .mp-day{padding:13px}\n .mp-meal figure{width:42px;height:42px}\n .mp-meal strong{font-size:12px}\n .mp-recipe-btn{min-height:42px;padding:9px 10px;font-size:12px}\n .mp-footer{padding:18px}\n .mp-modal{padding:17px}\n}\n@media(max-width:340px){\n .mp-day{padding:11px}\n .mp-meal{gap:7px}\n .mp-meal figure{width:37px;height:39px}\n .mp-recipe-btn{min-width:52px;padding:7px}\n .mp-metric b{font-size:17px}\n}\n@media(prefers-reduced-motion:reduce){.mp-weekchevron{transition:none}}\n";
const style=document.createElement('style');style.textContent=styles+phoneModernStyles+phoneDarkStyles+phoneLayoutStyles;document.head.appendChild(style);
const footerAction=document.createElement('aside');
footerAction.className='mp-fixed-consult';
footerAction.setAttribute('aria-label','언제나 이용할 수 있는 빔스짐 네이버 톡톡 상담');
footerAction.innerHTML='<a target="_blank" rel="noopener noreferrer" href="'+TALK+'" aria-label="네이버 톡톡으로 상담 시작, 새 창 열림">상담 시작</a>';
document.body.appendChild(footerAction);
function readStored(){
 try{
 const value=JSON.parse(localStorage.getItem(KEY)||'null');
 if(value&&value.version===1&&Array.isArray(value.days)&&value.days.length===28)return value;
 }catch{}
 return null;
}
function renderError(msg){
 root.innerHTML=hero()+'<div class="mp-status warn"><b>계획을 열 수 없어요</b>'+safe(msg)+'</div>'+
 '<div class="mp-actions"><a href="/receive" class="mp-sub">저장된 계획 확인</a></div>'+
 '<p class="mp-micro">일회용 코드는 10분 후 만료됩니다. 새 코드는 빔스짐 웹에서 발급받으세요.</p>';
}
function hero(){return '<header class="mp-hero"><img class="mp-official-logo" src="/vims-logo.svg?v=1" alt="VG VIMS GYM 공식 로고" width="250" height="33"><span>VIMS GYM · 28일 관리</span><h1>나의 28일 플랜</h1><p>식사 · 운동 · 휴식 · 레시피를 한눈에</p></header>';}
function weekCards(){
 let sections='';
 for(let w=0;w<4;w++){
  sections+='<details class="mp-week"'+(w===0?' open':'')+'><summary class="mp-weekhead"><div><span>WEEK '+(w+1)+'</span><h3>'+(w+1)+'주차</h3></div><span class="mp-weekchevron" aria-hidden="true">⌄</span></summary><div class="mp-days">';
  for(let d=w*7;d<w*7+7;d++){
    const x=current.days[d],kind=x.training?'운동일':'회복일';
    sections+='<article class="mp-day '+(x.training?'train':'rest')+'"><div class="mp-dayhead"><div><span>DAY '+String(x.day).padStart(2,'0')+'</span><strong> · '+kind+'</strong></div><small>유산소 '+fmt(x.aerobic)+'분</small></div>';
    for(const m of x.meals){
      const img=m.recipeId?'<img loading="lazy" alt="참고 레시피 사진" src="'+photo(m.recipeId)+'">':'♨';
      sections+='<div class="mp-meal"><figure>'+img+'</figure><div class="mp-mealtext"><small>'+LABEL[m.type]+'</small><strong>'+safe(m.title)+'</strong><em>'+fmt(m.kcal)+'kcal · 참고 사진</em></div><button type="button" class="mp-recipe-btn" data-phone-recipe="'+d+':'+m.type+'">조리법</button></div>';
    }
    sections+='<div class="mp-rest"><b>운동</b> · '+(x.training?x.exercises.map(e=>safe(e.name)).join(' · '):'가벼운 활동과 회복')+'<br><b>휴식</b> · '+safe(x.rest)+'</div></article>';
  }
  sections+='</div></details>';
 }
 return sections;
}
function render(){
 if(!current){renderError('저장된 계획이 없습니다. 빔스짐에서 큐알코드를 스캔해 주세요.');return;}
 const status=permanent?
 '<div class="mp-status"><b>내 기기에 저장됨</b>이 브라우저에서 다시 열 수 있습니다. 레시피 사진은 인터넷 연결이 필요합니다.</div>'+
 '<div class="mp-actions"><button type="button" class="mp-sub" data-phone-action="delete">저장된 계획 삭제</button></div>':
 '<div class="mp-status warn"><b>계획을 가져왔어요</b>내 휴대전화라면 저장할 수 있습니다. 공용 기기에는 저장하지 마세요.</div>'+
 '<label class="mp-check"><input type="checkbox" id="mpPersonal"><span>내 휴대전화에 계획을 저장하는 데 동의합니다.</span></label>'+
 '<div class="mp-actions"><button type="button" class="mp-primary" id="mpSave" data-phone-action="save" disabled>내 휴대전화에 저장</button><button type="button" class="mp-sub" data-phone-action="temporary">이번에만 보기</button></div>';
 const summary='<div class="mp-metrics"><div class="mp-metric"><span>관리 목표</span><b>'+safe(current.goal)+'</b></div>'+
 '<div class="mp-metric"><span>하루 열량</span><b>'+(current.kcal==null?'산출 보류':fmt(current.kcal)+'kcal')+'</b></div>'+
 '<div class="mp-metric"><span>하루 단백질</span><b>'+(current.protein==null?'—':fmt(current.protein)+'g')+'</b></div></div>';
 root.innerHTML=hero()+status+summary+'<div class="mp-heading"><h2>28일 전체 일정</h2><p>메뉴를 누르면 조리법을 볼 수 있습니다.</p></div>'+weekCards()+
 '<div class="mp-footer"><h2>다음 단계도 함께하세요.</h2><p>운동 · 식단 · 회원 등록까지, 빔스짐에서 상담하세요.</p>'+
 '<a href="'+TALK+'" target="_blank" rel="noopener noreferrer">상담 시작</a></div>'+
 '<p class="mp-micro">열량은 참고 추정치입니다. 사진은 비슷한 메뉴일 수 있으며, 식재료 중량은 계획표를 우선하세요. 공용 기기에는 저장하지 마세요.</p>';
}
async function showRecipe(dayIdx,type){
 if(!current)return;
 const entry=current.days?.[dayIdx]?.meals?.find(m=>m.type===type);
 if(!entry)return;
 const modal=document.createElement('div');modal.className='mp-modalshade';modal.id='mpModal';
 const products=entry.items.map(x=>'<div><span>'+safe(x.name)+'</span><b>'+fmt(x.g)+'g</b></div>').join('');
 modal.innerHTML='<div class="mp-modal" role="dialog" aria-modal="true"><header><b>'+LABEL[type]+' · DAY '+(dayIdx+1)+'</b><button type="button" data-phone-action="close" class="mp-modalclose">닫기 ×</button></header>'+
 '<h2>'+safe(entry.title)+'</h2><p>식재료 중량 · 약 '+fmt(entry.kcal)+'킬로칼로리, 단백질 '+fmt(entry.protein)+'g.</p>'+
 '<h3>식재료 · 중량</h3><div class="mp-ingredients">'+products+'</div>'+
 '<div id="mpRecipeSource"><p>조리법을 불러오는 중…</p></div></div>';
 document.body.appendChild(modal);document.body.style.overflow='hidden';
 const target=modal.querySelector('#mpRecipeSource');
 if(!entry.recipeId){target.innerHTML='<p>연결된 레시피가 없습니다. 위 재료·중량을 기준으로 충분히 익혀 조리하세요.</p>';return;}
 try{
 const resp=await fetch('/api/recipe/'+Number(entry.recipeId),{cache:'force-cache'});
 if(!resp.ok)throw Error('레시피 정보 수신 실패');
 const ref=await resp.json();
 if(!target.isConnected)return;
 target.innerHTML='<h3>비슷한 참고 레시피 · '+safe(ref.name)+'</h3>'+
 '<img class="mp-coverphoto" loading="lazy" alt="'+safe(ref.name)+' 참고 요리 사진" src="'+photo(entry.recipeId)+'">'+
 '<p><b>참고 안내</b> · 비슷한 조리 예시입니다. 재료·중량은 위 계획을 우선하세요.</p>'+
 '<h3>조리 순서</h3><ol>'+(ref.steps||[]).map(x=>'<li>'+safe(x)+'</li>').join('')+'</ol>'+
 ((ref.tips||[]).length?'<h3>조리 팁</h3><ul>'+ref.tips.map(x=>'<li>'+safe(x)+'</li>').join('')+'</ul>':'');
 }catch(e){if(target.isConnected)target.innerHTML='<p>참고 레시피를 일시적으로 불러올 수 없습니다. 위의 식재료와 중량은 그대로 확인하실 수 있습니다.</p>';}
}
async function redeem(code){
 if(busy)return;busy=true;
 root.innerHTML=hero()+'<div class="mp-status"><b>계획을 불러오는 중…</b>가져온 후 저장 여부를 선택하세요.</div>';
 try{
 const response=await fetch('/api/handoff/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code}),cache:'no-store'});
 const result=await response.json();
 if(!response.ok)throw Error(result.detail||'전달 코드가 만료됐습니다.');
 if(result.version!==1||!Array.isArray(result.days)||result.days.length!==28)throw Error('계획을 확인할 수 없습니다.');
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
