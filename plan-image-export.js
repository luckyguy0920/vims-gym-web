
(function(){
'use strict';
let busy=false,activeUrl=null;
const FONT='"Pretendard","Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
const C={bg:'#090B0F',panel:'#171C23',line:'#303B4A',white:'#F8F9FA',muted:'#BAC6D5',soft:'#9BAEC5',orange:'#FF7A00',blue:'#AFCEEF'};
const enc=new TextEncoder(),labels={b:'아침',l:'점심',d:'저녁',s:'간식'};
const fmt=n=>Number.isFinite(Number(n))?Math.round(Number(n)).toLocaleString('ko-KR'):'—';
const fnt=(size,bold)=>`${bold?'700':'400'} ${size}px ${FONT}`;
function fail(m){throw Error(m);}
function sourcePlan(){
 const p=window.VimsRecipeHandoff?.package?.();
 if(!p||!Array.isArray(p.days)||p.days.length!==28)fail('먼저 인바디와 목표를 설정해 주세요.');
 return p;
}
function wrap(ctx,value,width,size,bold){
 ctx.font=fnt(size,bold);
 const words=String(value??'').split(/\s+/).filter(Boolean);
 const out=[];let line='';
 for(const word of words){
  const next=line?line+' '+word:word;
  if(ctx.measureText(next).width<=width){line=next;continue;}
  if(line){out.push(line);line='';}
  if(ctx.measureText(word).width<=width){line=word;continue;}
  for(const ch of Array.from(word)){
   if(line&&ctx.measureText(line+ch).width>width){out.push(line);line='';}
   line+=ch;
  }
 }
 if(line)out.push(line);
 return out.length?out:[''];
}
function txt(ctx,v,x,y,size,color=C.white,bold=false){
 ctx.font=fnt(size,bold);ctx.textBaseline='top';ctx.fillStyle=color;ctx.fillText(String(v),x,y);
}
function rect(ctx,x,y,w,h,r,bg,stroke){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);
 if(bg){ctx.fillStyle=bg;ctx.fill();}
 if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke();}
}
function dayRows(day,detailed){
 const rows=[];
 for(const m of day.meals){
  rows.push({label:labels[m.type]||'식사',value:`${m.title} · ${fmt(m.kcal)}kcal`,size:23,bold:true});
  if(detailed)rows.push({label:'재료',value:(m.items||[]).map(i=>`${i.name} ${fmt(i.g)}g`).join(' · '),size:19});
 }
 if(day.training&&day.exercises.length){
  day.exercises.forEach((e,i)=>rows.push({label:i?'':'근력 운동',value:`${e.name} · ${e.sets}세트 · ${e.reps}`,size:22}));
 }else rows.push({label:'근력 운동',value:'회복 · 가벼운 활동',size:22});
 rows.push({label:'유산소',value:`${fmt(day.aerobic)}분`,size:22});
 rows.push({label:'휴식',value:day.rest||'충분한 회복',size:21});
 return rows;
}
function dayLayout(ctx,day,detailed){
 const list=dayRows(day,detailed),units=[];
 let height=78;
 for(const row of list){
  const arr=wrap(ctx,row.value,900,row.size,row.bold),rh=row.size+10;
  const hh=Math.max(32,arr.length*rh)+(row.label==='재료'?7:12);
  units.push({...row,arr,hh,rh});height+=hh;
 }
 return {units,height:height+22};
}
function drawDay(ctx,day,layout,y){
 rect(ctx,48,y,1104,layout.height,17,C.panel,C.line);
 ctx.fillStyle=day.training?C.orange:'#718AA8';ctx.fillRect(51,y+23,5,44);
 txt(ctx,`DAY ${String(day.day).padStart(2,'0')}`,76,y+20,27,C.white,true);
 txt(ctx,day.training?'운동일':'회복일',994,y+27,21,day.training?C.orange:C.blue,true);
 let yy=y+79;
 for(const row of layout.units){
  if(row.label)txt(ctx,row.label,76,yy+3,19,C.soft,true);
  for(const l of row.arr){txt(ctx,l,232,yy,row.size,row.bold?C.white:C.muted,row.bold);yy+=row.rh;}
  yy+=row.hh-row.arr.length*row.rh;
 }
}
function logoImage(){
 return new Promise(resolve=>{
  const img=new Image();let done=false;
  const finish=v=>{if(done)return;done=true;resolve(v);};
  const timer=setTimeout(()=>finish(null),2000);
  img.onload=()=>{clearTimeout(timer);finish(img);};
  img.onerror=()=>{clearTimeout(timer);finish(null);};
  img.src='/vims-logo.svg?v=1';
 });
}
function drawHeader(ctx,p,kind,first,last,brand){
 rect(ctx,48,32,1104,192,22,'#161D27',C.line);
 if(brand){try{ctx.drawImage(brand,77,59,340,45);}catch{txt(ctx,'VG VIMS GYM',77,60,35,C.white,true);}}
 else txt(ctx,'VG VIMS GYM',77,60,35,C.white,true);
 txt(ctx,kind==='today'?'오늘의 맞춤 계획':'28일 맞춤 계획',77,119,34,C.white,true);
 txt(ctx,kind==='today'?`DAY ${first}`:`${Math.ceil(first/7)}주차 · DAY ${first}~${last}`,78,174,21,C.blue);
 txt(ctx,'관리 목표',820,78,18,C.soft);
 const goal=wrap(ctx,p.goal||'체성분 개선',290,25,true);
 goal.forEach((l,i)=>txt(ctx,l,820,110+i*31,25,C.white,true));
}
function page(p,days,kind,brand){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=8;
 const ctx=canvas.getContext('2d');
 if(!ctx)fail('이 브라우저에서 사진 저장을 지원하지 않습니다.');
 const detailed=kind==='today';
 const layouts=days.map(d=>dayLayout(ctx,d,detailed));
 const top=360,space=16;
 const content=layouts.reduce((s,l)=>s+l.height+space,0);
 const total=top+content+165;
 if(total>11000)fail('사진 길이가 제한을 초과했습니다.');
 canvas.height=total;
 ctx.fillStyle=C.bg;ctx.fillRect(0,0,1200,total);
 drawHeader(ctx,p,kind,days[0].day,days[days.length-1].day,brand);
 for(let i=0;i<2;i++){
  const x=48+i*560;
  rect(ctx,x,242,542,96,13,'#202934','#3A495B');
  txt(ctx,i?'하루 단백질':'하루 열량',x+22,255,19,C.soft);
  txt(ctx,i?(p.protein==null?'—':`${fmt(p.protein)}g`):(p.kcal==null?'산출 보류':`${fmt(p.kcal)}kcal`),x+22,288,28,C.white,true);
 }
 let y=top;
 days.forEach((d,i)=>{drawDay(ctx,d,layouts[i],y);y+=layouts[i].height+space;});
 ctx.fillStyle=C.line;ctx.fillRect(65,y+7,1065,2);
 txt(ctx,'VIMS GYM · 맞춤 상담: vims-gym-web.onrender.com',70,y+25,21,C.blue,true);
 txt(ctx,'이 계획은 성인용 참고 예시이며 열량·영양소는 추정치입니다.',70,y+65,18,C.soft);
 txt(ctx,'원본 인바디·이름·전화번호 미포함 · 건강 상태에 따라 전문가와 확인하세요.',70,y+99,17,C.soft);
 return canvas;
}
async function png(canvas){
 const blob=await new Promise((resolve,reject)=>{
  try{canvas.toBlob(v=>v&&v.size?resolve(v):reject(Error('PNG 생성에 실패했습니다.')),'image/png');}
  catch(e){reject(e);}
 });
 canvas.width=0;canvas.height=0;
 return new Uint8Array(await blob.arrayBuffer());
}
const CRC=(()=>{const a=new Uint32Array(256);for(let n=0;n<256;n++){let v=n;for(let k=0;k<8;k++)v=(v&1)?0xEDB88320^(v>>>1):v>>>1;a[n]=v>>>0;}return a;})();
function checksum(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=CRC[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function zip(files){
 const locals=[],centers=[];let pos=0,sum=0;
 const now=new Date(),dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|Math.floor(now.getSeconds()/2);
 const dosDate=((Math.max(1980,now.getFullYear())-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
 for(const file of files){
  const name=enc.encode(file.name),data=file.data,crc=checksum(data);
  const local=new Uint8Array(30+name.length);let v=new DataView(local.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);
  v.setUint16(10,dosTime,true);v.setUint16(12,dosDate,true);
  v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);
  v.setUint16(26,name.length,true);local.set(name,30);
  locals.push(local,data);
  const central=new Uint8Array(46+name.length);v=new DataView(central.buffer);
  v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);
  v.setUint16(8,0x0800,true);v.setUint16(12,dosTime,true);v.setUint16(14,dosDate,true);
  v.setUint32(16,crc,true);v.setUint32(20,data.length,true);v.setUint32(24,data.length,true);
  v.setUint16(28,name.length,true);v.setUint32(42,pos,true);central.set(name,46);
  centers.push(central);pos+=local.length+data.length;sum+=central.length;
 }
 if(pos>0xFFFFFFFF||files.length>65535)fail('압축파일 용량이 너무 큽니다.');
 const end=new Uint8Array(22),v=new DataView(end.buffer);
 v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);
 v.setUint32(12,sum,true);v.setUint32(16,pos,true);
 return new Blob([...locals,...centers,end],{type:'application/zip'});
}
function close(){
 document.getElementById('vims-export')?.remove();
 if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl=null;}
 if(!document.getElementById('vr-modal')&&!document.getElementById('vims-kiosk-modal'))document.body.style.overflow='';
}
function popup(){
 close();
 const overlay=document.createElement('div');
 overlay.id='vims-export';overlay.className='vr-overlay';
 overlay.innerHTML='<div class="vr-dialog vims-export-dialog" role="dialog" aria-modal="true" aria-label="계획표 이미지 다운로드">'+
 '<header><div><span>VIMS GYM · 사진 5장</span><h2>28일 맞춤 계획표 저장하기</h2></div><button type="button" data-vims-export-close>닫기 ×</button></header>'+
 '<p class="vims-export-status" role="status" aria-live="polite">사진을 만드는 중입니다…</p><div class="vims-export-result"></div>'+
 '<p class="vims-export-warning">공용 기기에서 내려받으면 다운로드 폴더에 파일이 남습니다. 개인 휴대전화에서 저장하거나 파일을 직접 삭제해 주세요.</p></div>';
 document.body.appendChild(overlay);document.body.style.overflow='hidden';
 return overlay;
}
function status(overlay,msg){const s=overlay.querySelector('.vims-export-status');if(s)s.textContent=msg;}
function download(url){
 const a=document.createElement('a');a.href=url;a.download='VIMS_GYM_28일_맞춤계획표.zip';
 document.body.appendChild(a);a.click();a.remove();
}
async function saveAll(){
 if(busy)return;
 const p=sourcePlan();
 if(!window.confirm('오늘 계획 1장과 주차별 4장을 ZIP 파일 하나로 저장합니다. 공용 기기의 다운로드 폴더에는 파일이 남을 수 있습니다. 계속할까요?'))return;
 busy=true;const ui=popup();
 try{
  const day=Math.max(1,Math.min(28,Number(state.selectedDay)||1));
  const parts=[{name:'VIMS_오늘계획.png',days:[p.days[day-1]],kind:'today'}];
  for(let w=0;w<4;w++)parts.push({name:`VIMS_${w+1}주차.png`,days:p.days.slice(w*7,w*7+7),kind:'week'});
  const brand=await logoImage(),files=[];
  for(let i=0;i<parts.length;i++){
   status(ui,`사진 생성 중 · ${i+1} / 5`);
   await new Promise(resolve=>setTimeout(resolve,0));
   const part=parts[i],canvas=page(p,part.days,part.kind,brand);
   files.push({name:part.name,data:await png(canvas)});
  }
  status(ui,'사진 5장 압축 중…');
  const archive=zip(files);
  files.length=0;
  if(!document.getElementById('vims-export'))return;
  activeUrl=URL.createObjectURL(archive);
  status(ui,'완료 · 사진 5장');
  ui.querySelector('.vims-export-result').innerHTML=
    '<p>오늘 계획과 1~4주차 계획을 <b>한 번에 저장</b>합니다.</p>'+
    '<a class="vims-export-download" download="VIMS_GYM_28일_맞춤계획표.zip" href="'+activeUrl+'">계획표 5장 한 번에 저장 ↓</a>'+
    '<p>압축파일을 열면 PNG 이미지 5장이 있습니다. 인바디 원본과 이름은 포함하지 않습니다.</p>';
  download(activeUrl);
 }catch(e){
  if(document.getElementById('vims-export')){
   status(ui,'저장할 수 없습니다.');
   ui.querySelector('.vims-export-result').textContent=e?.message||'다시 시도해 주세요.';
  }
 }finally{busy=false;}
}
const style=document.createElement('style');style.id='vims-export-style';
style.textContent=`
.vims-export-dialog{max-width:470px;background:#191D23!important;color:#F4F6FA}
.vims-export-dialog h2{font-size:21px;color:#FFF;line-height:1.4}
.vims-export-status{font-size:14px;color:#DBE4F1;font-weight:750}
.vims-export-result p{font-size:12px;line-height:1.7;color:#B8C5D4}
.vims-export-download{display:flex;align-items:center;justify-content:center;min-height:52px;border-radius:11px;background:#FF7A00;color:#FFF!important;text-decoration:none;font-size:15px;font-weight:800;text-align:center;padding:13px}
.vims-export-download:hover{background:#F06D00}
.vims-export-download:focus-visible{outline:3px solid #A9C5E6;outline-offset:3px}
.vims-export-warning{padding:12px;background:#29231D;color:#E5CDB4;font-size:11px;line-height:1.75;border-radius:10px}
.vr-share [data-vims-save-all]{min-height:49px;font-size:14px;background:#37577B;color:#FFF}
.vr-share [data-vims-save-all]:hover{background:#466E98}
`;
document.head.appendChild(style);
document.addEventListener('click',e=>{
 const button=e.target.closest?.('[data-vims-save-all]');
 if(button){e.preventDefault();e.stopPropagation();saveAll();return;}
 if(e.target.closest?.('[data-vims-export-close]')){e.preventDefault();close();}
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
window.VimsPlanImageExport={saveAll,zip,page,dayRows,version:1};
})();
