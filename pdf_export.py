"""Create a privacy-conscious 28-day VIMS GYM PDF entirely in memory.

Only an already-sanitized plan with no identity or raw InBody measurements is
accepted. The resulting document is returned to the browser; it is not stored.
"""
from io import BytesIO
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
    Spacer, Table, TableStyle,
)


_DARK = colors.HexColor("#161A20")
_INK = colors.HexColor("#202936")
_MUTED = colors.HexColor("#617082")
_LINE = colors.HexColor("#DDE4EB")
_PALE = colors.HexColor("#F4F6F9")
_ORANGE = colors.HexColor("#FF7A00")
_WHITE = colors.white


def _register_fonts():
    locations = [
        (Path("/usr/share/fonts/truetype/nanum/NanumGothic.ttf"),
         Path("/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf")),
        (Path("/usr/share/fonts/truetype/nanum/NanumBarunGothic.ttf"),
         Path("/usr/share/fonts/truetype/nanum/NanumBarunGothicBold.ttf")),
    ]
    for regular, bold in locations:
        if regular.is_file() and bold.is_file():
            pdfmetrics.registerFont(TTFont("VimsKorean", str(regular)))
            pdfmetrics.registerFont(TTFont("VimsKorean-Bold", str(bold)))
            pdfmetrics.registerFontFamily("VimsKorean",
                                          normal="VimsKorean",
                                          bold="VimsKorean-Bold")
            return
    raise RuntimeError("PDF에 필요한 한국어 글꼴을 찾을 수 없습니다.")


_register_fonts()


def _pstyles():
    def style(name, size, leading=None, font="VimsKorean",
              color=_INK, space_after=0, alignment=TA_LEFT):
        return ParagraphStyle(
            name=name, fontName=font, fontSize=size,
            leading=leading or (size * 1.52),
            textColor=color, spaceAfter=space_after, alignment=alignment,
            allowWidows=0, allowOrphans=0,
        )
    return {
        "brand": style("brand", 25, 34, "VimsKorean-Bold", _WHITE),
        "hero": style("hero", 15, 24, "VimsKorean-Bold", _WHITE),
        "heroBody": style("heroBody", 9.2, 15, color=colors.HexColor("#E0E7EF")),
        "title": style("title", 22, 30, "VimsKorean-Bold", _INK, 9),
        "h1": style("h1", 17, 24, "VimsKorean-Bold", _INK, 8),
        "h2": style("h2", 11.5, 18, "VimsKorean-Bold", _INK, 6),
        "h3": style("h3", 10.2, 16, "VimsKorean-Bold", _INK, 3),
        "body": style("body", 9.3, 15, color=_INK),
        "small": style("small", 8.2, 13, color=_MUTED),
        "tiny": style("tiny", 7.6, 12, color=_MUTED),
        "table": style("table", 8.2, 12.5, color=_INK),
        "tableSmall": style("tableSmall", 7.7, 12, color=_MUTED),
        "tableHead": style("tableHead", 8.4, 13, "VimsKorean-Bold", _INK),
        "metricNumber": style("metricNumber", 12, 19, "VimsKorean-Bold", _INK),
        "metricLabel": style("metricLabel", 8, 12, color=_MUTED),
        "pageRight": style("pageRight", 8.2, 13, alignment=TA_RIGHT),
    }


def _safe(value):
    return escape(str(value if value is not None else "—"), quote=True)


def _number(value, unit=""):
    if value is None:
        return "산출 보류"
    n = float(value)
    text = f"{int(n):,}" if n.is_integer() else f"{n:,.1f}"
    return text + unit


def _format_ingredients(items):
    return " · ".join(f"{_safe(x['name'])} {_number(x['g'], 'g')}" for x in items)


def _page_decoration(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(_LINE)
    canvas.setLineWidth(.6)
    canvas.line(37, h - 35, w - 37, h - 35)
    canvas.setFillColor(_ORANGE)
    canvas.rect(37, h - 35, 39, 2.5, stroke=0, fill=1)
    canvas.setFont("VimsKorean-Bold", 8)
    canvas.setFillColor(_MUTED)
    canvas.drawString(38, 22, "VIMS GYM  /  28일 맞춤 계획")
    canvas.setFont("VimsKorean", 8)
    canvas.drawRightString(w - 38, 22, f"{doc.page}")
    canvas.restoreState()


def _metric(title, value, styles):
    return [
        Paragraph(_safe(title), styles["metricLabel"]),
        Spacer(1, 4),
        Paragraph(_safe(value), styles["metricNumber"]),
    ]


def _make_hero(plan, st, width):
    goal = _safe(plan.get("goal", "체성분 관리"))
    content = [
        Paragraph("VIMS GYM", st["brand"]),
        Spacer(1, 9),
        Paragraph("나의 28일 맞춤 계획", st["hero"]),
        Spacer(1, 8),
        Paragraph(f"목표  {goal}  |  식단 · 운동 · 회복 · 참고 조리법",
                  st["heroBody"]),
    ]
    hero = Table([[content]], colWidths=[width])
    hero.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), _DARK),
        ("BOX", (0, 0), (-1, -1), 0, _DARK),
        ("LEFTPADDING", (0, 0), (-1, -1), 21),
        ("RIGHTPADDING", (0, 0), (-1, -1), 21),
        ("TOPPADDING", (0, 0), (-1, -1), 24),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 23),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return hero


def _overview(plan, st, width):
    labels = ["월", "화", "수", "목", "금", "토", "일"]
    rows = []
    for week in range(4):
        cells = []
        for i in range(7):
            d = plan["days"][week * 7 + i]
            status = "운동" if d["training"] else "회복"
            cells.append(Paragraph(
                f"<b>{week * 7 + i + 1}일</b><br/>{status}",
                st["tableSmall"]))
        rows.append(cells)
    table = Table([[Paragraph(label, st["tableHead"]) for label in labels]] + rows,
                  colWidths=[width / 7] * 7)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), _PALE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [_WHITE, colors.HexColor("#FAFBFC")]),
        ("GRID", (0, 0), (-1, -1), .5, _LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def _meal_table(day, st, width):
    labels = {"b": "아침", "l": "점심", "d": "저녁", "s": "간식"}
    rows = [[
        Paragraph("끼니", st["tableHead"]),
        Paragraph("메뉴와 권장 재료", st["tableHead"]),
        Paragraph("영양 추정", st["tableHead"]),
    ]]
    for meal in day["meals"]:
        mid = meal.get("recipeId")
        refs = f"<br/><font color='#68788B'>참고 조리법 {mid}번</font>" if mid else ""
        rows.append([
            Paragraph(_safe(labels[meal["type"]]), st["tableHead"]),
            [
                Paragraph(f"<b>{_safe(meal['title'])}</b>{refs}", st["table"]),
                Spacer(1, 4),
                Paragraph(_format_ingredients(meal["items"]), st["tableSmall"]),
            ],
            Paragraph(f"{_number(meal['kcal'], ' kcal')}<br/>"
                      f"단백질 {_number(meal['protein'], 'g')}", st["table"]),
        ])
    table = Table(rows, colWidths=[49, width - 165, 116],
                  repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), _PALE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [_WHITE, colors.HexColor("#FAFBFD")]),
        ("LINEBELOW", (0, 0), (-1, -1), .5, _LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return table


def _exercise_table(day, st, width):
    rows = [[
        Paragraph("동작", st["tableHead"]),
        Paragraph("세트", st["tableHead"]),
        Paragraph("반복", st["tableHead"]),
    ]]
    if day["training"] and day["exercises"]:
        for ex in day["exercises"]:
            rows.append([
                Paragraph(_safe(ex["name"]), st["table"]),
                Paragraph(_safe(ex["sets"]), st["table"]),
                Paragraph(_safe(ex["reps"]), st["table"]),
            ])
    else:
        rows.append([
            Paragraph("근력운동 휴식 · 가벼운 걷기와 스트레칭", st["table"]),
            Paragraph("—", st["table"]),
            Paragraph("—", st["table"]),
        ])
    table = Table(rows, colWidths=[width - 162, 67, 95], repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), _PALE),
        ("LINEBELOW", (0, 0), (-1, -1), .5, _LINE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [_WHITE, colors.HexColor("#FAFBFD")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def render_plan_pdf(plan, recipes=None):
    """Return PDF bytes. Input must have passed the server's strict plan schema."""
    stream = BytesIO()
    w, h = A4
    margins = 39
    width = w - 2 * margins
    st = _pstyles()
    doc = SimpleDocTemplate(
        stream, pagesize=A4,
        rightMargin=margins, leftMargin=margins,
        topMargin=53, bottomMargin=43,
        title="VIMS GYM | 28일 맞춤 계획", author="VIMS GYM",
        subject="28-day exercise, meal and recovery guidance",
        pageCompression=1,
    )
    story = [
        Spacer(1, 22),
        _make_hero(plan, st, width),
        Spacer(1, 20),
        Paragraph("한눈에 보는 내 계획", st["h1"]),
    ]
    metric_table = Table([[
        _metric("관리 목표", plan["goal"], st),
        _metric("하루 열량(추정)", _number(plan.get("kcal"), " kcal"), st),
        _metric("하루 단백질(추정)", _number(plan.get("protein"), "g"), st),
    ]], colWidths=[width / 3] * 3)
    metric_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), _PALE),
        ("BOX", (0, 0), (-1, -1), .5, _LINE),
        ("INNERGRID", (0, 0), (-1, -1), .5, _LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 13),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 15),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 15),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.extend([
        metric_table,
        Spacer(1, 23),
        Paragraph("28일 일정", st["h1"]),
        _overview(plan, st, width),
        Spacer(1, 19),
        Paragraph("이용 안내", st["h2"]),
        Paragraph(
            "이 계획은 일반적인 운동·식사 참고 자료이며 의료 진단이나 처방을 대신하지 않습니다. "
            "식재료 양과 영양 값은 추정치입니다. 질환, 임신·수유, 알레르기, 부상, "
            "섭식 관련 우려가 있으면 전문가 확인이 필요합니다.", st["small"]),
        Spacer(1, 8),
        Paragraph(
            "원본 인바디 측정값, 이름, 전화번호는 이 파일에 포함되지 않습니다. "
            "다운로드한 PDF는 저장한 기기에 남으므로 공용 기기에서는 저장을 피하세요.",
            st["small"]),
    ])

    for day in plan["days"]:
        story.extend([
            PageBreak(),
            Paragraph(
                f"DAY {day['day']:02d}"
                f"  <font color='#748295'>/  "
                f"{'근력운동일' if day['training'] else '회복일'}</font>",
                st["title"]),
            Spacer(1, 2),
            Paragraph(f"유산소 {_number(day['aerobic'], '분')}  ·  "
                      "식사 4끼  ·  회복 시간 확보", st["small"]),
            Spacer(1, 15),
            Paragraph("식사 계획", st["h2"]),
            _meal_table(day, st, width),
            Spacer(1, 17),
            Paragraph("운동 계획", st["h2"]),
            _exercise_table(day, st, width),
            Spacer(1, 15),
            Paragraph("회복 · 생활", st["h2"]),
            Paragraph(_safe(day["rest"]), st["body"]),
            Spacer(1, 15),
            Paragraph(
                "참고 조리법은 실제 메뉴와 정확히 일치하지 않을 수 있습니다. "
                "식사 분량은 위 표의 개인별 재료·중량을 우선하세요.",
                st["tiny"]),
        ])

    recipe_lookup = {
        r["id"]: r for r in (recipes or [])
        if isinstance(r, dict) and isinstance(r.get("id"), int)
    }
    referenced = sorted({
        meal["recipeId"]
        for day in plan["days"] for meal in day["meals"]
        if meal.get("recipeId") in recipe_lookup
    })
    if referenced:
        story.extend([
            PageBreak(),
            Paragraph("참고 조리법", st["title"]),
            Paragraph("실제 식단과 비슷한 레시피의 조리 예시입니다. "
                      "식사 재료와 양은 각 일차의 식사 계획이 우선입니다.",
                      st["small"]),
            Spacer(1, 11),
        ])
        for recipe_id in referenced:
            item = recipe_lookup[recipe_id]
            name = _safe(item.get("name", f"레시피 {recipe_id}번"))
            steps = item.get("steps") if isinstance(item.get("steps"), list) else []
            tips = item.get("tips") if isinstance(item.get("tips"), list) else []
            headline = Paragraph(f"{recipe_id:02d}  {name}", st["h2"])
            if steps:
                story.append(KeepTogether([
                    headline, Paragraph("조리 순서", st["small"]),
                    Paragraph(f"1. {_safe(steps[0])}", st["body"]),
                ]))
                for step_number, step in enumerate(steps[1:], 2):
                    story.append(Paragraph(f"{step_number}. {_safe(step)}", st["body"]))
            else:
                story.append(headline)
            if tips:
                story.append(Spacer(1, 4))
                for tip in tips[:5]:
                    story.append(Paragraph(f"· {_safe(tip)}", st["small"]))
            story.extend([
                Spacer(1, 9),
                HRFlowable(width="100%", thickness=.4, color=_LINE),
                Spacer(1, 12),
            ])

    doc.build(story, onFirstPage=_page_decoration,
              onLaterPages=_page_decoration)
    return stream.getvalue()
