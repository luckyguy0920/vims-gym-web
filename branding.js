
(function(){
'use strict';
const TALK_URL='https://talk.naver.com/ct/w81ur3w?frm=mnmb#nafullscreen';
const LOGO_URL='/vims-logo.svg?v=1';
function img(){
 const image=document.createElement('img');
 image.src=LOGO_URL;
 image.alt='VG VIMS GYM 공식 로고';
 image.width=205;image.height=35;
 image.className='vg-official-logo';
 image.loading='eager';image.decoding='async';
 return image;
}
function setBrand(node){
 if(!node)return;
 node.textContent='';
 const btn=document.createElement('button');
 btn.type='button';
 btn.className='vg-home-brand';
 btn.setAttribute('data-action','route');
 btn.setAttribute('data-value','home');
 btn.setAttribute('aria-label','빔스짐 첫 화면으로 이동');
 btn.appendChild(img());
 node.appendChild(btn);
}
function applyOfficialLogo(){
 setBrand(document.querySelector('.sidebar .brand'));
 setBrand(document.querySelector('.topbar .mobile-brand'));
 const fake=document.querySelector('.topbar .profile');
 if(fake)fake.style.display='none';
}
function attachPersistentConsult(){
 if(document.getElementById('vg-fixed-consult'))return;
 const el=document.createElement('aside');
 el.id='vg-fixed-consult';
 el.className='vg-fixed-consult';
 el.setAttribute('aria-label','항상 보이는 네이버 톡톡 상담');
 el.innerHTML='<div class="vg-consult-message">'+
  '<span class="vg-consult-overline">VIMS GYM · 맞춤 관리</span>'+
  '<strong>운동 · 식단, 전문가와 상담하세요</strong></div>'+
  '<a class="vg-consult-action" href="'+TALK_URL+'" target="_blank" rel="noopener noreferrer" aria-label="빔스짐 네이버 톡톡 상담 및 회원 등록 문의, 새 창 열림">'+
  '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9 8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>'+
  '<span>네이버 톡톡 상담 · 등록 문의</span>'+
  '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg></a>';
 document.body.appendChild(el);
}
const style=document.createElement('style');
style.textContent=`
.vg-official-logo{display:block;width:100%;height:auto;max-width:220px;aspect-ratio:1410/185;object-fit:contain;object-position:left center;filter:none}
.sidebar .brand{padding:0 6px 28px;min-height:66px}
.vg-home-brand{display:flex;align-items:center;justify-content:flex-start;padding:13px 5px;cursor:pointer;border:0;background:transparent;width:100%;min-width:0}
.sidebar .vg-home-brand{width:100%}
.sidebar .vg-official-logo{width:204px;max-width:100%}
.topbar .mobile-brand{background:#0b1524;border-radius:10px;padding:3px 9px;min-height:45px;align-items:center;max-width:195px}
.topbar .mobile-brand .vg-home-brand{padding:7px 2px}
.topbar .mobile-brand .vg-official-logo{width:160px;max-width:100%}
.topbar .profile{display:none!important}
.vg-fixed-consult{position:fixed;right:22px;bottom:19px;z-index:90;display:flex;gap:13px;align-items:center;
 padding:10px 11px 10px 19px;max-width:calc(100vw - 30px);border-radius:17px;
 background:#122c4c;color:#fff;border:1px solid rgba(255,255,255,.18);
 box-shadow:0 8px 32px rgba(5,25,50,.24);font-family:inherit}
.vg-consult-message{display:flex;flex-direction:column;gap:4px;min-width:0}
.vg-consult-overline{font-size:10px;color:#bfe58d;font-weight:850;letter-spacing:.04em}
.vg-consult-message strong{font-size:13px;font-weight:900;white-space:nowrap}
.vg-consult-action{display:flex;align-items:center;justify-content:center;gap:9px;padding:12px 15px;
 border-radius:11px;min-height:45px;color:#173523!important;text-decoration:none!important;
 background:#c9f28f;white-space:nowrap;font-size:13px;font-weight:900;transition:filter .2s,transform .2s}
.vg-consult-action:hover{filter:brightness(1.05);transform:translateY(-1px)}
.vg-consult-action:focus-visible{outline:3px solid #90afff;outline-offset:3px}
.work{padding-bottom:125px!important}
@media(max-width:1120px){.sidebar .vg-official-logo{width:169px}}
@media(max-width:750px){
 .topbar .mobile-brand{display:flex!important}
 .vg-fixed-consult{left:11px;right:11px;bottom:calc(74px + env(safe-area-inset-bottom));padding:9px 10px 9px 13px;gap:9px;border-radius:14px;max-width:none}
 .vg-consult-message{flex:1}
 .vg-consult-message strong{font-size:11px;white-space:normal;line-height:1.35}
 .vg-consult-overline{font-size:9px}
 .vg-consult-action{padding:11px 9px;min-height:43px;font-size:11px;gap:5px;flex:0 0 auto}
 .vg-consult-action svg:last-child{display:none}
 .vg-consult-action svg:first-child{width:16px;height:16px}
 .work{padding-bottom:200px!important}
}
@media(max-width:365px){.vg-consult-message{display:none}.vg-consult-action{flex:1;font-size:13px}}
@media print{.vg-fixed-consult{display:none!important}}
`;
document.head.appendChild(style);
applyOfficialLogo();
attachPersistentConsult();
window.VimsBranding={applyOfficialLogo,attachPersistentConsult};
})();
