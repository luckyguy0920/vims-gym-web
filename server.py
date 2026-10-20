"""VIMS GYM lightweight browser-local InBody entry and planning frontend."""
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, FileResponse

ROOT = Path(__file__).resolve().parent
app = FastAPI(title="VIMS GYM Manual InBody")

@app.get("/")
def index():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
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
    scripts = (
        '<script src="/nutrition.js?v=2"></script>'
        '<script src="/plan28.js?v=1"></script>'
        '<script src="/autoflow.js?v=1"></script>'
        '<script src="/quickinbody.js?v=2"></script>'
        '<script src="/kiosk.js?v=2"></script>'
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
