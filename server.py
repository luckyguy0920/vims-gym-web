"""VIMS GYM lightweight browser-local InBody entry and planning frontend."""
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, FileResponse

ROOT = Path(__file__).resolve().parent
app = FastAPI(title="VIMS GYM Manual InBody")

@app.get("/")
def index():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    scripts = (
        '<script src="/nutrition.js?v=2"></script>'
        '<script src="/plan28.js?v=1"></script>'
        '<script src="/autoflow.js?v=1"></script>'
        '<script src="/quickinbody.js?v=1"></script>'
    )
    return HTMLResponse(html.replace("</body>", scripts + "</body>"), headers={"Cache-Control": "no-store"})

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

@app.get("/favicon.ico")
def favicon():
    return FileResponse(ROOT / "favicon.svg", media_type="image/svg+xml")

@app.get("/api/status")
def status():
    return {"ready": True, "mode": "manual", "photo_upload": False,
            "notice": "InBody values are entered locally in the browser. Photo OCR is disabled."}

@app.post("/api/scan")
def scan_disabled():
    raise HTTPException(status_code=410, detail="사진 판독은 중단됐습니다. 인바디 숫자 빠른 입력을 사용하세요.")
