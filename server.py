"""VIMS GYM InBody270 OCR prototype. Uploads are processed in memory."""
import io,os,re
from collections import Counter
from pathlib import Path
import cv2,numpy as np,pytesseract
from PIL import Image,ImageOps,ImageEnhance
from fastapi import FastAPI,UploadFile,File,HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from starlette.concurrency import run_in_threadpool
from concurrent.futures import ThreadPoolExecutor,TimeoutError as FutureTimeout
ROOT=Path(__file__).resolve().parent
app=FastAPI(title="VIMS GYM OCR")
ZONES={"height":[(390,198,435,222),(384,194,442,226)],
"weight":[(572,327,625,350),(570,324,630,356)],
"smm":[(367,443,420,470),(361,443,418,474)],
"fatMass":[(374,479,420,508),(369,480,424,510)],
"pbf":[(403,626,458,647),(398,621,467,651)]}
RANGES={"height":(110,220),"weight":(25,350),"smm":(5,80),"fatMass":(0.5,180),"pbf":(2,75)}
def parse_num(t,lo,hi):
 t=t.strip().replace(" ","").replace(",",".").strip(".:;|!")
 if not re.fullmatch(r"\d{1,3}(?:\.\d{1,2})?",t):return None
 n=float(t)
 return n if lo<=n<=hi else None
def calculate_issues(v):
 issues=[]
 for k in RANGES:
  if k not in v:issues.append(k+" 미인식")
 if "weight" in v and "height" in v and not 11<=v["weight"]/(v["height"]/100)**2<=65:issues.append("체중과 신장 불일치")
 if all(k in v for k in ("weight","fatMass","pbf")) and abs(100*v["fatMass"]/v["weight"]-v["pbf"])>1:issues.append("체지방량과 체지방률 불일치")
 if all(k in v for k in ("smm","weight")) and v["smm"]>=v["weight"]*.65:issues.append("골격근량과 체중 불일치")
 return issues
def recognize(im):
 im=im.resize((1152,1536),Image.Resampling.LANCZOS)
 vals={};confidence={};issues=[]
 for k,regions in ZONES.items():
  lo,hi=RANGES[k];found=[]
  for x1,y1,x2,y2 in regions:
   crop=ImageOps.grayscale(im.crop((x1,y1,x2,y2)))
   crop=crop.resize((crop.width*5,crop.height*5),Image.Resampling.BICUBIC)
   for c in (1,1.5,2):
    text=pytesseract.image_to_string(ImageEnhance.Contrast(crop).enhance(c),lang="eng",config="--psm 7 -c tessedit_char_whitelist=0123456789.")
    n=parse_num(text,lo,hi)
    if n is not None:found.append(n)
  if found:
   votes=Counter(found);best=sorted(votes,key=lambda n:(-votes[n],n))[0]
   vals[k]=best;confidence[k]="matched" if votes[best]>1 else "low"
 issues+=calculate_issues(vals)
 if any(v=="low" for v in confidence.values()):issues.append("낮은 판독 신뢰도")
 return vals,confidence,issues
def straighten(im):
 rgb=np.array(im.resize((1152,1536),Image.Resampling.LANCZOS))
 gray=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY)
 reference=np.float32([[220,98],[1020,118],[1151,1427],[0,1325]])
 for threshold in (120,145,100):
  _,mask=cv2.threshold(gray,threshold,255,cv2.THRESH_BINARY)
  mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_RECT,(15,15)))
  contours,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
  for c in sorted(contours,key=cv2.contourArea,reverse=True)[:3]:
   if cv2.contourArea(c)<.23*1152*1536:continue
   poly=cv2.approxPolyDP(c,.022*cv2.arcLength(c,True),True)
   if len(poly)!=4:continue
   q=poly.reshape(4,2).astype(np.float32);ss=q.sum(1);dd=q[:,0]-q[:,1]
   quad=np.float32([q[np.argmin(ss)],q[np.argmax(dd)],q[np.argmax(ss)],q[np.argmin(dd)]])
   if cv2.contourArea(quad)<.24*1152*1536:continue
   matrix=cv2.getPerspectiveTransform(quad,reference)
   return Image.fromarray(cv2.warpPerspective(rgb,matrix,(1152,1536),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_CONSTANT,borderValue=(225,225,225)))
 return None
def run_ocr(raw):
 Image.MAX_IMAGE_PIXELS=30000000
 im=ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert("RGB")
 if im.width<600 or im.height<700:raise ValueError("사진 해상도가 낮습니다.")
 if im.width>im.height:im=im.rotate(90,expand=True)
 vals,conf,issues=recognize(im)
 engine="local"
 if issues:
  aligned=straighten(im)
  if aligned is not None:
   alt,alt_conf,alt_issues=recognize(aligned)
   if len(alt_issues)<len(issues):
    vals,conf,issues=alt,alt_conf,alt_issues;engine="aligned"
 return {"ok":not issues,"measurements":vals,"warnings":issues,"mode":"local","engine":engine,"confidence":conf}
@app.get("/")
def index():
    page=(ROOT/"index.html").read_text(encoding="utf-8")
    return HTMLResponse(page.replace("</body>", '<script src="/nutrition.js?v=2"></script><script src="/plan28.js?v=1"></script></body>'))

@app.get("/nutrition.js")
def nutrition_script():
    return FileResponse(ROOT/"nutrition.js", media_type="application/javascript")

@app.get("/plan28.js")
def plan28_script():
    return FileResponse(ROOT/"plan28.js",media_type="application/javascript")
@app.get("/favicon.ico")
def favicon():return FileResponse(ROOT/"favicon.svg",media_type="image/svg+xml")
@app.get("/api/status")
def status():return {"ready":True,"mode":"local","notice":"인바디270 시제품. 수치를 반드시 원본과 비교하세요."}
@app.post("/api/scan")
async def scan(image:UploadFile=File(...)):
 if image.content_type not in ("image/jpeg","image/png","image/webp"):raise HTTPException(400,"JPG, PNG, WEBP 사진만 가능합니다.")
 raw=await image.read(12*1024*1024+1)
 if len(raw)>12*1024*1024:raise HTTPException(413,"최대 용량은 12MB입니다.")
 try:
  with Image.open(io.BytesIO(raw)) as verify:verify.verify()
 except Exception:raise HTTPException(400,"이미지 형식이 올바르지 않습니다.")
 try:return await run_in_threadpool(run_ocr,raw)
 except Exception as exc:raise HTTPException(422,str(exc)[:200])
