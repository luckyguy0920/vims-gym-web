"""VIMS GYM lightweight browser-local InBody entry and planning frontend."""
from pathlib import Path
import base64, io, json, secrets, threading, time
import qrcode
import qrcode.image.svg
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.responses import HTMLResponse, FileResponse, Response

ROOT = Path(__file__).resolve().parent
app = FastAPI(title="VIMS GYM Manual InBody")

@app.get("/")
def index():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = html.replace(
        "VIMS GYM | 통합 관리 웹 v8 · 인바디 자동판독 · 레시피 24종",
        "VIMS GYM | 나의 28일 맞춤 관리",
    ).replace(
        "VIMS GYM 인바디270 수치 영역 판독 및 목표 선택 28일 커리큘럼",
        "인바디부터 식사·운동·휴식까지. 빔스짐 28일 맞춤 관리.",
    )
    # The public kiosk must never read or write previous visitors' body measurements.
    replacements = [
        ("localStorage.getItem(STORE)", "null"),
        ("localStorage.setItem(STORE,JSON.stringify(state))", "void 0"),
        ("localStorage.getItem(REC_KEY)", "null"),
        ("localStorage.setItem(REC_KEY,JSON.stringify(recProgress))", "void 0"),
        ("기록 수치는 이 기기 브라우저에만 저장됩니다. 인바디 사진은 저장하지 않습니다. 공용 기기 사용을 피하세요.",
         "공용 일회성 이용: 측정값은 서버·브라우저 저장소에 별도로 기록하지 않으며 이용 종료 시 초기화됩니다."),
        ("인바디270 양식 보정 실험판 (v2)", "인바디 수기 입력 · 일회성 이용"),
        ("입력한 내용은 이 브라우저에서만 저장됩니다.", "입력한 정보는 이번 이용 중에만 표시되고 이용 종료 시 삭제됩니다."),
        ("하나씩 실천할 때마다 자동 저장됩니다.", "체크 내용은 이번 이용 동안에만 유지됩니다."),
        ("운동 후 체크하면 ${d}일차에 완료 여부가 저장됩니다.", "운동 후 체크하면 이번 이용 화면에만 기록됩니다."),
        ("데이터를 파일로 내보낼 수 있습니다.", "이번 이용에서 확인할 수 있는 임시 기록입니다.")
    ]
    for old, new in replacements:
        if old in html:
            html = html.replace(old, new)
    # Clear data left behind by prior prototype versions *before* the original main script loads.
    bootstrap = (
        '<script>try{["vims28_member_preview_1","vims_integrated_recipe_v7",'
        '"vims28_manual_measurements_v1"].forEach(function(k){'
        'localStorage.removeItem(k);sessionStorage.removeItem(k)})}catch(e){}</script>'
    )
    html = html.replace("<script>\n'use strict';", bootstrap + "<script>\n'use strict';", 1)
    html = html.replace("</head>", '<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2"/></head>', 1)
    scripts = (
        '<script src="/nutrition.js?v=2"></script>'
        '<script src="/plan28.js?v=3"></script>'
        '<script src="/autoflow.js?v=3"></script>'
        '<script src="/quickinbody.js?v=3"></script>'
        '<script src="/kiosk.js?v=4"></script>'
        '<script src="/recipe-handoff.js?v=3"></script>'
        '<script src="/branding.js?v=2"></script>'
        '<script src="/modern-ui.js?v=1"></script>'
    )
    return HTMLResponse(
        html.replace("</body>", scripts + "</body>"),
        headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
                 "X-Content-Type-Options": "nosniff"}
    )

@app.get("/nutrition.js")
def nutrition_script():
    return FileResponse(ROOT / "nutrition.js", media_type="application/javascript")

@app.get("/plan28.js")
def plan28_script():
    return FileResponse(ROOT / "plan28.js", media_type="application/javascript")

@app.get("/autoflow.js")
def autoflow_script():
    return FileResponse(ROOT / "autoflow.js", media_type="application/javascript")

@app.get("/quickinbody.js")
def quick_inbody_script():
    return FileResponse(ROOT / "quickinbody.js", media_type="application/javascript")

@app.get("/kiosk.js")
def kiosk_script():
    return FileResponse(ROOT / "kiosk.js", media_type="application/javascript")


# Public kiosk handoff. No names, phone numbers or original InBody measurements.
# Tokens and calculated plans are held only in process memory, for ten minutes.
_TRANSFER_LIFETIME = 600
_TRANSFER_LIMIT = 40
_TRANSFERS = {}
_TRANSFER_LOCK = threading.Lock()
_RECIPE_CACHE = None
_RECIPE_LOCK = threading.Lock()

def _prune_transfers():
    now = time.time()
    for code, entry in list(_TRANSFERS.items()):
        if entry["expires"] <= now:
            del _TRANSFERS[code]

def _clean_text(value, limit=140):
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise HTTPException(400, "올바르지 않은 계획 항목입니다.")
    return value.strip()

def _validate_plan(payload):
    if not isinstance(payload, dict) or set(payload) - {"version", "kind", "goal", "kcal", "protein", "days"}:
        raise HTTPException(400, "허용되지 않은 계획 정보입니다.")
    if payload.get("version") != 1 or payload.get("kind") not in ("fat","muscle","recomp","fitness"):
        raise HTTPException(400, "계획 형식을 확인해 주세요.")
    _clean_text(payload.get("goal"), 50)
    if not isinstance(payload.get("days"), list) or len(payload["days"]) != 28:
        raise HTTPException(400, "28일 계획 전체가 필요합니다.")
    for x in ("kcal","protein"):
        n=payload.get(x)
        if n is not None and (not isinstance(n,(int,float)) or isinstance(n,bool) or not (0<=n<=5000)):
            raise HTTPException(400, "열량 또는 영양소 값이 올바르지 않습니다.")
    for dayidx, day in enumerate(payload["days"], 1):
        if not isinstance(day,dict) or set(day)-{"day","training","aerobic","exercises","meals","rest"}:
            raise HTTPException(400, "일차 정보가 올바르지 않습니다.")
        if day.get("day")!=dayidx or not isinstance(day.get("training"),bool):
            raise HTTPException(400, "28일 일정 순서를 확인해 주세요.")
        if not isinstance(day.get("aerobic"),int) or not (0<=day["aerobic"]<=240):
            raise HTTPException(400, "유산소 시간 정보를 확인해 주세요.")
        if not isinstance(day.get("exercises"),list) or len(day["exercises"])>6:
            raise HTTPException(400, "운동 구성을 확인해 주세요.")
        for ex in day["exercises"]:
            if not isinstance(ex,dict) or set(ex)-{"name","sets","reps"}:
                raise HTTPException(400,"운동 정보가 올바르지 않습니다.")
            _clean_text(ex.get("name"),65);_clean_text(ex.get("sets"),25);_clean_text(ex.get("reps"),25)
        _clean_text(day.get("rest"),130)
        if not isinstance(day.get("meals"),list) or len(day["meals"])!=4:
            raise HTTPException(400, "하루 네 끼 구성이 필요합니다.")
        for meal in day["meals"]:
            if not isinstance(meal,dict) or set(meal)-{"type","title","kcal","protein","items","recipeId"}:
                raise HTTPException(400, "식단 정보가 올바르지 않습니다.")
            if meal.get("type") not in ("b","l","d","s"):
                raise HTTPException(400, "식사 유형을 확인해 주세요.")
            _clean_text(meal.get("title"),70)
            for key in ("kcal","protein"):
                n=meal.get(key)
                if not isinstance(n,(int,float)) or isinstance(n,bool) or not (0<=n<=3000):
                    raise HTTPException(400, "끼니별 영양 값을 확인해 주세요.")
            rid=meal.get("recipeId")
            if rid is not None and (not isinstance(rid,int) or isinstance(rid,bool) or not 1<=rid<=24):
                raise HTTPException(400, "참고 레시피 번호가 올바르지 않습니다.")
            items=meal.get("items")
            if not isinstance(items,list) or not (1<=len(items)<=12):
                raise HTTPException(400, "식재료를 확인해 주세요.")
            for item in items:
                if not isinstance(item,dict) or set(item)!={"name","g"}:
                    raise HTTPException(400, "식재료 형식이 올바르지 않습니다.")
                _clean_text(item.get("name"),55)
                grams=item.get("g")
                if not isinstance(grams,(int,float)) or isinstance(grams,bool) or not (0<=grams<=750):
                    raise HTTPException(400,"식재료 분량을 확인해 주세요.")
    return payload

def _get_recipes():
    global _RECIPE_CACHE
    if _RECIPE_CACHE is None:
        with _RECIPE_LOCK:
            if _RECIPE_CACHE is None:
                src=(ROOT/"index.html").read_text(encoding="utf-8")
                pos=src.index("const recipes=")+len("const recipes=")
                _RECIPE_CACHE=json.JSONDecoder().raw_decode(src[pos:])[0]
    return _RECIPE_CACHE

@app.get("/receive")
def phone_receive():
    return FileResponse(ROOT/"receive.html",media_type="text/html",headers={"Cache-Control":"no-store","Referrer-Policy":"no-referrer"})

@app.get("/phone-plan.js")
def phone_script():
    return FileResponse(ROOT/"phone-plan.js",media_type="application/javascript",headers={"Cache-Control":"no-store"})

@app.get("/api/recipe/{recipe_id}")
def recipe_details(recipe_id:int):
    recipe=next((r for r in _get_recipes() if r["id"]==recipe_id),None)
    if recipe is None: raise HTTPException(404,"레시피가 없습니다.")
    return {k:recipe.get(k) for k in ("id","name","ingredients","steps","tips","time","desc","benefit")}

@app.get("/api/recipe/{recipe_id}/image")
def recipe_image(recipe_id:int):
    recipe=next((r for r in _get_recipes() if r["id"]==recipe_id),None)
    if recipe is None: raise HTTPException(404,"레시피 사진이 없습니다.")
    encoded=recipe.get("img","")
    if not encoded.startswith("data:image/webp;base64,"):raise HTTPException(404,"지원하지 않는 사진입니다.")
    raw=base64.b64decode(encoded.split(",",1)[1],validate=True)
    return Response(content=raw,media_type="image/webp",headers={"Cache-Control":"public, max-age=604800"})

@app.post("/api/handoff")
def handoff_plan(payload:dict=Body(...)):
    raw=json.dumps(payload,ensure_ascii=False,separators=(",",":")).encode("utf-8")
    if len(raw)>70000:raise HTTPException(413,"계획 데이터가 너무 큽니다.")
    plan=_validate_plan(payload)
    token=secrets.token_urlsafe(20)
    with _TRANSFER_LOCK:
        _prune_transfers()
        if len(_TRANSFERS)>=_TRANSFER_LIMIT:
            raise HTTPException(429,"현재 접속자가 많습니다. 잠시 후 다시 시도해 주세요.")
        _TRANSFERS[token]={"expires":time.time()+_TRANSFER_LIFETIME,"plan":plan}
    url="https://vims-gym-web.onrender.com/receive#code="+token
    image=qrcode.make(url,image_factory=qrcode.image.svg.SvgPathImage,box_size=7,border=3)
    stream=io.BytesIO();image.save(stream)
    svg=base64.b64encode(stream.getvalue()).decode("ascii")
    return {"qr":"data:image/svg+xml;base64,"+svg,"ttlSeconds":_TRANSFER_LIFETIME}

@app.post("/api/handoff/redeem")
def redeem_plan(request:dict=Body(...)):
    if not isinstance(request,dict) or set(request)!={"code"}:
        raise HTTPException(400,"전달 코드를 확인해 주세요.")
    code=request.get("code")
    if not isinstance(code,str) or not (20<=len(code)<=40):
        raise HTTPException(400,"전달 코드가 올바르지 않습니다.")
    with _TRANSFER_LOCK:
        _prune_transfers()
        entry=_TRANSFERS.pop(code,None)
    if not entry:raise HTTPException(410,"일회용 코드가 만료됐거나 이미 사용됐습니다. 공용 화면에서 다시 생성해 주세요.")
    return entry["plan"]

@app.get("/recipe-handoff.js")
def recipe_handoff_script():
    return FileResponse(ROOT/"recipe-handoff.js",media_type="application/javascript",headers={"Cache-Control":"no-store"})

@app.get("/vims-logo.svg")
def vims_official_logo():
    return FileResponse(ROOT / "vims-logo.svg", media_type="image/svg+xml", headers={"Cache-Control": "public, max-age=86400", "X-Content-Type-Options":"nosniff"})

@app.get("/branding.js")
def brand_script():
    return FileResponse(ROOT / "branding.js", media_type="application/javascript", headers={"Cache-Control": "no-store"})

@app.get("/favicon.svg")
def favicon_svg():
    return FileResponse(ROOT / "favicon.svg", media_type="image/svg+xml")

@app.get("/modern-ui.js")
def modern_ui_script():
    return FileResponse(ROOT / "modern-ui.js", media_type="application/javascript", headers={"Cache-Control":"no-store"})

@app.get("/favicon.ico")
def favicon():
    return FileResponse(ROOT / "favicon.svg", media_type="image/svg+xml")

@app.get("/api/status")
def status():
    return {"ready": True, "mode": "manual-kiosk", "photo_upload": False, "persistent_member_data": False,
            "notice": "InBody values are entered locally in the browser. Photo OCR is disabled."}

@app.post("/api/scan")
def scan_disabled():
    raise HTTPException(status_code=410, detail="사진 판독은 중단됐습니다. 인바디 숫자 빠른 입력을 사용하세요.")
