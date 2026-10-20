
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
 el.setAttribute('aria-label','하단 고정 네이버 톡톡 상담');
 el.innerHTML='<a class="vg-consult-action" href="'+TALK_URL+'" target="_blank" rel="noopener noreferrer" aria-label="네이버 톡톡으로 상담 시작, 새 창 열림">상담 시작</a>';
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
.vg-fixed-consult{position:fixed;right:24px;bottom:24px;z-index:90;width:208px;max-width:calc(100vw - 28px);font-family:inherit}
.vg-consult-action{width:100%;min-height:52px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;
 border:0;border-radius:14px;background:#FF7A00;color:#fff!important;text-decoration:none!important;
 font-size:16px;font-weight:900;letter-spacing:-.015em;white-space:nowrap;
 box-shadow:0 10px 24px rgba(255,122,0,.28);transition:background-color .2s,transform .2s}
.vg-consult-action:hover{background:#F06D00;transform:translateY(-1px)}
.vg-consult-action:active{transform:translateY(0)}
.vg-consult-action:focus-visible{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 6px #FF7A00}
.work{padding-bottom:110px!important}
@media(max-width:1120px){.sidebar .vg-official-logo{width:169px}}
@media(max-width:750px){
 .topbar .mobile-brand{display:flex!important}
 .vg-fixed-consult{left:16px;right:16px;bottom:calc(80px + env(safe-area-inset-bottom));width:auto;max-width:none}
 .vg-consult-action{min-height:52px;font-size:16px}
 .work{padding-bottom:170px!important}
}
@media print{.vg-fixed-consult{display:none!important}}
`;
document.head.appendChild(style);
applyOfficialLogo();
attachPersistentConsult();
window.VimsBranding={applyOfficialLogo,attachPersistentConsult};
})();
