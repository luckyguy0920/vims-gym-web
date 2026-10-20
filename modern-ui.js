
(function(){
'use strict';
const css=`
:root{
 --ink:#192A3E;--ink2:#405167;--muted:#7C8C9F;--bg:#F6F8FB;--white:#fff;
 --line:#E5EAF1;--blue:#285281;--light:#F2F5F9;--lime:#BCD5EA;
 --radius:15px;--shadow:0 3px 18px rgba(30,44,65,.035)
}
body{background:#F6F8FB;color:#192A3E;font-family:-apple-system,BlinkMacSystemFont,"Pretendard","Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;letter-spacing:-.02em;-webkit-font-smoothing:antialiased}
button,input,select,textarea{font:inherit}
button,a{-webkit-tap-highlight-color:transparent}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #5B86BE;outline-offset:3px}
.shell{grid-template-columns:236px minmax(0,1fr)}
.sidebar{background:#111E30;padding:31px 17px 22px;border-right:1px solid #29384A}
.sidebar .brand{padding:0 7px 23px;min-height:57px}
.navtitle{font-size:10px;font-weight:650;letter-spacing:.13em;color:#7D90AC;margin:19px 10px 9px}
.nav button{border-radius:10px;padding:11px 12px;font-size:13px;font-weight:600;letter-spacing:-.012em;color:#AAB8CD;gap:10px}
.nav button.active{background:#FFFFFF16;color:#FFF;font-weight:750}
.nav button:hover{background:#FFFFFF11}
.sidebar-bottom{display:none!important}
.work{max-width:1320px;padding:31px 41px 132px}
.topbar{margin-bottom:27px}
.topbar .bread{font-size:12px;font-weight:500;color:#8795A8;letter-spacing:0}
.topbar .bread b{color:#40546E;font-weight:680}
.top-pill{font-size:12px;color:#60758D;background:#FFF;border:1px solid #E4EAF1;border-radius:999px;box-shadow:none;font-weight:700;padding:8px 13px}
.page-title{font-size:clamp(24px,2.7vw,33px);font-weight:780;line-height:1.24;letter-spacing:-.048em;color:#192A40;margin:0}
.page-desc{color:#8190A2;font-size:13px;line-height:1.7;margin:7px 0 22px;max-width:680px}
.sectionhead{margin:28px 0 13px;gap:12px}
.sectionhead h2{font-size:18px;font-weight:750;letter-spacing:-.035em}
.sectionhead .hint{color:#8E9CAF;font-size:12px;font-weight:450}
.card{border-radius:15px;border:1px solid #E5EBF2;box-shadow:0 3px 14px rgba(19,38,57,.025);padding:20px}
.btn{border-radius:10px;font-weight:710;font-size:13px;min-height:41px;letter-spacing:-.01em;padding:10px 16px;background:#1D3654;box-shadow:none}
.btn.primary{background:#285281;color:#FFF}
.btn.primary:hover{background:#1E406B}
.btn.ghost,.btn.soft{border:1px solid #DFE7F0;color:#344F77;background:#FFF}
.btn.ghost:hover,.btn.soft:hover{background:#F4F7FB}
.btn.light{border:1px solid #DDE5F0;background:#FFF;color:#1B3858}
.badge{font-size:11px;font-weight:640;border-radius:999px}
.footer{border-top:1px solid #E9EDF3;padding:20px 0;margin-top:34px;color:#92A0B1;font-size:11px;line-height:1.6}
#view>.v28actions:has([data-plan28="open"]){display:none!important}
.qf-intro{background:#172D4B;border:1px solid #223C5D;border-radius:18px;box-shadow:none;padding:27px 29px}
.qf-intro h2{font-size:clamp(23px,3vw,32px);font-weight:760;line-height:1.3;letter-spacing:-.044em;margin:10px 0 9px}
.qf-intro p{color:#C8D6E7;font-size:13px;line-height:1.7}
.qf-eyebrow{font-size:10px;font-weight:680;color:#B4CAE4;letter-spacing:.08em}
.qf-step{width:70px;height:70px;background:#FFFFFF16;color:#FFF;font-size:27px;border:1px solid #FFFFFF2D;font-weight:750}
.qf-step small{font-weight:550;color:#D4E1EF}
.qf-card{border-radius:18px;padding:24px;background:#FFF;border:1px solid #E5EBF2;box-shadow:none}
.qf-header h3{font-size:19px;letter-spacing:-.03em;font-weight:750;color:#1F3148;margin-top:4px}
.qf-kicker{font-size:10px;letter-spacing:.07em;color:#6382A8;font-weight:680}
.qf-chip{background:#F3F6FA;color:#76869A;padding:7px 10px;font-size:10px;font-weight:640}
.qf-formgrid,.qf-profilegrid{gap:13px}
.qf-field>span,.qf-profilefield>span{font-size:13px;font-weight:700;color:#34485F}
.qf-field>span small{font-size:11px;color:#98A6B5}
.qf-inputrow input,.qf-profilefield input,.qf-profilefield select{border:1px solid #DDE5EE;background:#FAFBFD;color:#22344B;border-radius:11px}
.qf-inputrow input{padding:13px 42px 13px 13px;min-height:54px;font-size:22px;font-weight:760;letter-spacing:-.03em}
.qf-inputrow input:focus,.qf-profilefield input:focus,.qf-profilefield select:focus{border-color:#7598C9;background:#FFF;box-shadow:0 0 0 3px #DCE8F8}
.qf-unit,.qf-hint,.qf-profilefield small{color:#8C9AAD;font-size:11px}
.qf-modes{background:#F0F3F7}
.qf-modes button{font-weight:650;font-size:11px;color:#6F8094}
.qf-modes button.active{color:#1E3A63}
.qf-tiny{background:#F7F9FC;padding:10px 12px;border:1px solid #EDF1F6;border-radius:9px;font-size:11px;color:#7C8BA0}
.qf-gap{margin-top:30px}
.qf-preview{gap:10px}
.qf-preview>div{background:#F7F9FB;border:1px solid #EEF1F5;border-radius:12px;padding:15px}
.qf-preview span{font-size:11px;color:#72849D}
.qf-preview strong{font-size:22px;letter-spacing:-.025em;font-weight:750;color:#203D61}
.qf-goals{gap:9px}
.qf-goals button{font-weight:650;background:#FFF;border-color:#E0E7F0;color:#526782;font-size:13px;min-height:46px;border-radius:10px}
.qf-goals button.active{background:#1D385A;border-color:#1D385A;color:#FFF}
.qf-caution,.qf-privacy{color:#8898AA;line-height:1.7}
.qf-submit{background:#285281;border:0;border-radius:12px;min-height:53px;font-size:15px;font-weight:740;box-shadow:none;padding:14px 18px}
.qf-submit:hover{background:#1E406B}
.qf-care{background:#F7F9FB;border:1px solid #E8EDF3;border-radius:10px;color:#6D8199}
.qf-care a{color:#285281}
.af-top{background:#172D4B;border:1px solid #233C5B;border-radius:18px;padding:25px 26px;box-shadow:none}
.af-top h2{font-size:clamp(24px,2.7vw,29px);font-weight:750;letter-spacing:-.04em}
.af-top p{font-size:12px;color:#C5D2E1;line-height:1.65;margin:8px 0 0}
.af-tag{background:#FFFFFF15;color:#DDE9F7;border:1px solid #FFFFFF22;font-size:10px;font-weight:650;letter-spacing:.06em}
.af-top .af-ghostlight{background:#FFFFFF0A;color:#ECF4FC;border:1px solid #FFFFFF55;border-radius:9px;font-weight:660}
.af-track{height:6px;background:#FFFFFF34}
.af-track i{background:#A9C0DC}
.af-minititle{font-size:14px;font-weight:740;color:#293D56}
.af-minititle small{font-weight:450;color:#91A0B2}
.af-profile-summary{font-size:11px;color:#8494A6;line-height:1.75}
.af-goals{gap:7px}
.af-goals button{border-radius:10px;font-size:12px;font-weight:650;min-height:39px;padding:9px 13px;background:#FFF;color:#61738A;border:1px solid #E2E7ED}
.af-goals button.on{background:#1D385A;border-color:#1D385A;color:#FFF}
.af-metrics{gap:11px;margin:13px 0}
.af-stat{background:#FFF;border:1px solid #E6ECF1;border-radius:14px;padding:16px;box-shadow:none}
.af-stat span{font-size:11px;color:#788BA0;font-weight:630}
.af-stat strong{font-size:24px;letter-spacing:-.04em;color:#203A59;font-weight:760;margin:6px 0}
.af-stat em{font-size:10px;color:#94A1B0}
.af-nutrients .af-stat{background:#F9FBFD;border:1px solid #E7ECF3}
.af-today{margin-top:26px}
.af-today-header span{color:#6D83A0;font-size:11px}
.af-today-header h3{font-size:21px;font-weight:780;letter-spacing:-.035em}
.af-columns{gap:12px}
.af-dcard{border:1px solid #E4EAF1;border-radius:15px;padding:18px;box-shadow:none;gap:8px}
.af-cardtitle h4{font-size:16px;font-weight:750}
.af-cardtitle span{color:#7590B0;font-weight:700;font-size:12px}
.af-meal,.af-ex{padding:10px 0;border-bottom:1px solid #EEF2F6}
.af-meal b,.af-ex b{font-weight:650;color:#344960}
.af-meal span,.af-ex span{font-weight:700;color:#758DA7}
.af-meal em{font-size:10px;color:#99A5B5}
.af-dfoot{color:#75889C;font-size:11px;padding-top:9px}
.af-textbutton{color:#2E5A95;font-size:12px;font-weight:720}
.af-shortcuts{gap:10px}
.af-shortcuts button{border-radius:12px;padding:14px;border:1px solid #E5EBF2;color:#405773;font-weight:650}
.af-shortcuts b{color:#6F87A3}
.af-nutbar,.af-workhead{background:#F4F7FB;border:1px solid #E6EBF1;border-radius:14px;padding:19px}
.af-nutbar span,.af-workhead span{font-weight:670;color:#6683A4}
.af-nutbar h2,.af-workhead h2{font-size:20px;font-weight:760;color:#233B57}
.af-nutbar p,.af-workhead p{font-size:12px;color:#73869C}
.af-nmeal{border:1px solid #E5EBF1;border-radius:14px;padding:19px}
.af-nmeal h3{font-size:16px;font-weight:740}
.af-nmeal header>b{font-size:20px;font-weight:760;color:#29496F}
.af-nfooter{font-size:11px;color:#7B8B9E}
.af-worklist>div{border:1px solid #E4EBF2;border-radius:14px}
.af-worklist b{font-weight:710}
.af-recovery{background:#F4F7FA;border-color:#E3EAF2}
.v28banner{background:#182D49;border:1px solid #203B5B;border-radius:18px;padding:23px 25px;box-shadow:none}
.v28banner h2{font-size:clamp(21px,2.5vw,28px);font-weight:760;letter-spacing:-.043em;margin-top:9px}
.v28banner p{font-size:12px;color:#D3DFEF;line-height:1.7}
.v28tag{font-size:10px;letter-spacing:.07em;font-weight:680;background:#FFFFFF16}
.v28stats{gap:11px;margin:12px 0}
.v28stat{border:1px solid #E5EBF1;border-radius:13px;padding:15px}
.v28stat small{font-size:11px;color:#8696A9}
.v28stat b{font-size:22px;letter-spacing:-.04em;font-weight:750;color:#203A59}
.v28note{background:#F7F9FC;border:1px solid #E7EDF3;border-radius:12px;color:#62758A;font-size:12px;line-height:1.75;padding:14px 16px}
.v28note b{font-size:12px;font-weight:750;color:#405D80}
.v28week{margin:27px 0 10px}
.v28week h3{font-size:18px;font-weight:750;color:#293F59;letter-spacing:-.03em}
.v28week p{font-size:12px;color:#8796AA}
.v28weekbar{gap:7px;margin:10px 0 12px}
.v28weekbar span{background:#F0F4F9;border:1px solid #E5EBF3;color:#5C7495;font-weight:640;font-size:11px;padding:7px 10px}
.v28days{gap:13px}
.v28card{border:1px solid #E4EAF0;border-radius:14px;padding:15px;background:#FFF;box-shadow:none}
.v28card.train{border-left:3px solid #517EB9}
.v28card.rest{border-left:3px solid #C7D0DA}
.v28cardhead small{font-size:10px;color:#758EAE}
.v28cardhead b{font-size:15px;font-weight:740;color:#273B53}
.v28pill{background:#F2F5F9;color:#70849C;font-size:11px;font-weight:650}
.v28line{font-size:12px;color:#526A82;border-color:#EFF2F7;line-height:1.65}
.v28line>b{color:#375477;font-weight:740}
.v28line strong{font-weight:680;color:#29415B}
.v28line small{color:#8B9AAC}
.v28card details{font-size:11px}
.v28card summary{color:#345F93;font-weight:690}
.v28warn{background:#FCF9F3;border:1px solid #ECE6D8;border-radius:12px;color:#7C7467;font-size:11px;line-height:1.7}
.v28actions{gap:9px}
.vr-share{background:#F1F5FA;border:1px solid #E0E7F0;border-radius:15px;padding:22px;box-shadow:none}
.vr-text>span{color:#6B86A5;font-size:10px;font-weight:680;letter-spacing:.06em}
.vr-text h2{color:#223A56;font-size:21px;font-weight:750;letter-spacing:-.03em}
.vr-text p{color:#617790;font-size:12px;line-height:1.65}
.vr-text small{color:#8E9BAA;font-size:11px}
.vr-sharebtn{background:#284F84;border-radius:11px;font-weight:720;font-size:13px;padding:12px 15px}
.vr-sharebtn:hover{background:#1D406F}
.vr-menurow{border-bottom:1px solid #EEF2F6;gap:9px}
.vr-menurow img,.vr-emptyphoto{border-radius:9px}
.vr-menutext small{color:#6E8CAC;font-size:10px}
.vr-menutext b{color:#354A65;font-weight:670}
.vr-menutext em{font-size:10px;color:#91A0B1}
.vr-menurow button{background:#F1F5FA;border:1px solid #E0E9F4;color:#395E8E;font-weight:700}
.vr-dialog{border-radius:17px;padding:23px}
.vr-dialog h2{color:#233A57;font-weight:750;font-size:22px}
.vr-dialog h3,.vr-dialog h4{font-weight:740;color:#243D5B}
.vr-dialog p,.vr-dialog li{color:#617389;line-height:1.7}
.vr-ingredients>div{background:#F7F9FC;color:#4B6480}
.vr-qrsteps{background:#F5F8FC}
.vr-qrsteps b{color:#3E6594;background:#E4EDF8}
.vr-reference .vr-caution{background:#FAF7F1;color:#786D59}
.vk-persistent{background:#F2F6FA;border:1px solid #E5EBF2;color:#73859B;border-radius:11px;box-shadow:none}
.vk-persistent b{color:#385777;font-weight:700}
.vk-persistent button{font-weight:700;border:1px solid #DBE3EC;color:#47627E;border-radius:8px}
.vk-sales{background:#EEF3F8;border:1px solid #E0E8F1;color:#203954;border-radius:17px;box-shadow:none;padding:23px;margin:25px 0}
.vk-salesheader>span{font-size:10px;color:#6885A5;font-weight:720;letter-spacing:.07em}
.vk-sales h2{font-weight:750;color:#203954;font-size:clamp(19px,2.4vw,24px);letter-spacing:-.034em;margin:8px 0}
.vk-sales p{font-size:12px;color:#62778F;line-height:1.7}
.vk-ctabuttons{margin-top:15px}
.vk-primary{background:#FF7A00;border-radius:10px;color:#FFF!important;box-shadow:none;font-weight:760;font-size:13px;max-width:250px}
.vk-primary:hover{background:#EF6D00}
.vk-secondary{border:1px solid #D7E2ED;background:#FFF;color:#45607C;font-weight:680}
.vk-sales .vk-safe{font-size:11px;color:#8B9AAB;margin-top:10px}
.vk-modal{border-radius:18px}
.vk-modal h2{font-weight:760;color:#24405E}
.recipe-photo-card{border-radius:14px}
.recipe-photo-card h3{font-weight:710;letter-spacing:-.02em}
.recipe-photo-card .rp-body p{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
@media(min-width:751px){
 .mobile-nav{display:none}
 .work{padding-bottom:130px}
}
@media(max-width:1120px) and (min-width:751px){
 .shell{grid-template-columns:208px minmax(0,1fr)}
 .work{padding:28px 25px 140px}
}
@media(max-width:750px){
 body{background:#F6F8FB}
 .shell{display:block}
 .sidebar{display:none}
 .work{padding:19px 15px 190px}
 .topbar{margin-bottom:22px;min-height:43px}
 .topbar .top-pill{font-size:11px;padding:8px 10px}
 .page-title{font-size:26px;letter-spacing:-.045em}
 .page-desc{font-size:12px;margin-bottom:19px}
 .card{padding:17px;border-radius:13px}
 .qf-intro{padding:20px;border-radius:15px}
 .qf-intro h2{font-size:23px}
 .qf-intro p{font-size:12px}
 .qf-step{width:58px;height:58px;font-size:23px}
 .qf-card{padding:17px}
 .qf-header h3{font-size:17px}
 .qf-chip{font-size:10px;padding:6px 9px}
 .qf-preview{gap:7px}
 .qf-preview>div{padding:12px}
 .qf-preview strong{font-size:20px}
 .qf-goals button{font-size:12px;min-height:44px}
 .af-top{padding:21px}
 .af-top h2{font-size:25px}
 .af-stat{padding:13px}
 .af-stat strong{font-size:20px}
 .af-nmeals{grid-template-columns:1fr}
 .af-today-header h3{font-size:19px}
 .af-shortcuts{grid-template-columns:repeat(2,minmax(0,1fr))}
 .af-shortcuts button{font-size:12px;gap:7px}
 .v28banner{padding:21px}
 .v28stats{grid-template-columns:repeat(2,minmax(0,1fr))}
 .v28stat{padding:12px}
 .v28stat b{font-size:19px}
 .v28days{grid-template-columns:1fr}
 .v28card{padding:14px}
 .vr-share{padding:17px}
 .vr-text h2{font-size:19px}
 .vr-dialog{padding:18px}
 .vk-sales{padding:19px}
 .vk-primary{max-width:none}
 .mobile-nav{grid-template-columns:repeat(5,minmax(0,1fr));padding:8px 4px calc(8px + env(safe-area-inset-bottom));border-top:1px solid #E6EBF1;box-shadow:0 -4px 20px rgba(30,49,70,.04);background:#FFF}
 .mobile-nav button{font-size:10px;font-weight:650;color:#7D8DA0}
 .mobile-nav button.active{color:#1F4F85}
}
@media(max-width:370px){
 .qf-intro h2{font-size:20px}
 .qf-intro p{font-size:11px}
 .qf-step{width:52px;height:52px}
 .af-metrics{gap:7px}
 .af-stat{padding:11px}
 .mobile-nav button{font-size:9px}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
`;
const el=document.createElement('style');el.id='vims-modern-styles';el.textContent=css;
document.head.appendChild(el);
function updateChrome(){
 const nav=document.querySelector('.navtitle');if(nav)nav.textContent='메뉴';
 const footer=document.querySelector('.footer');
 if(footer)footer.innerHTML='<span>© VIMS GYM</span><span>일회성 이용 · 종료 시 정보 초기화</span>';
 const crumb=document.querySelector('#crumb');
 if(crumb){const item=paths.find(x=>x[0]===route);if(item)crumb.textContent=item[2];}
 const pill=document.querySelector('#topDay');
 if(pill&&typeof initDay==='function')pill.textContent=String(initDay()).padStart(2,'0')+' / 28일';
 const view=document.querySelector('#view');
 const extra=view?.querySelector(':scope > .v28actions:has([data-plan28="open"])');
 if(extra)extra.remove();
}
const renderBefore=render;
render=function(){const out=renderBefore.apply(this,arguments);updateChrome();return out;};
updateChrome();
window.VimsModern={refresh:updateChrome};
})();
