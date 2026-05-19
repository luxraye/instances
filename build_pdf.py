from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import Flowable

# ── Brand colours ─────────────────────────────────────────────────────────────
NAVY   = HexColor("#213976")
BLUE   = HexColor("#006bb7")
GREEN  = HexColor("#72bf40")
AMBER  = HexColor("#f5a623")
ORANGE = HexColor("#e07b39")
LIGHT  = HexColor("#f4f6f9")
MUTED  = HexColor("#6c757d")
BORDER = HexColor("#d9dde3")
WHITE  = white

W, H = A4
MARGIN = 20 * mm

# ── Styles ────────────────────────────────────────────────────────────────────
def styles():
    return {
        "cover_title": ParagraphStyle("cover_title",
            fontName="Helvetica-Bold", fontSize=30, leading=36,
            textColor=WHITE, alignment=TA_LEFT, spaceAfter=6),
        "cover_sub": ParagraphStyle("cover_sub",
            fontName="Helvetica", fontSize=13, leading=18,
            textColor=HexColor("#c8d9f0"), alignment=TA_LEFT, spaceAfter=4),
        "cover_tag": ParagraphStyle("cover_tag",
            fontName="Helvetica-Bold", fontSize=9, leading=12,
            textColor=GREEN, alignment=TA_LEFT),
        "section_label": ParagraphStyle("section_label",
            fontName="Helvetica-Bold", fontSize=8, leading=10,
            textColor=BLUE, alignment=TA_LEFT, spaceAfter=4,
            spaceBefore=16, letterSpacing=1.5),
        "h2": ParagraphStyle("h2",
            fontName="Helvetica-Bold", fontSize=18, leading=22,
            textColor=NAVY, spaceAfter=6, spaceBefore=4),
        "h3": ParagraphStyle("h3",
            fontName="Helvetica-Bold", fontSize=12, leading=15,
            textColor=NAVY, spaceAfter=4, spaceBefore=8),
        "body": ParagraphStyle("body",
            fontName="Helvetica", fontSize=10, leading=15,
            textColor=HexColor("#333333"), spaceAfter=6),
        "body_white": ParagraphStyle("body_white",
            fontName="Helvetica", fontSize=10, leading=15,
            textColor=WHITE, spaceAfter=4),
        "bullet": ParagraphStyle("bullet",
            fontName="Helvetica", fontSize=10, leading=15,
            textColor=HexColor("#333333"), leftIndent=14, spaceAfter=3,
            firstLineIndent=-14),
        "bullet_green": ParagraphStyle("bullet_green",
            fontName="Helvetica", fontSize=10, leading=15,
            textColor=HexColor("#166534"), leftIndent=14, spaceAfter=3,
            firstLineIndent=-14),
        "bullet_red": ParagraphStyle("bullet_red",
            fontName="Helvetica", fontSize=10, leading=15,
            textColor=HexColor("#991b1b"), leftIndent=14, spaceAfter=3,
            firstLineIndent=-14),
        "caption": ParagraphStyle("caption",
            fontName="Helvetica-Oblique", fontSize=8.5, leading=12,
            textColor=MUTED, spaceAfter=4),
        "code": ParagraphStyle("code",
            fontName="Courier", fontSize=9, leading=13,
            textColor=BLUE, spaceAfter=4),
        "footer": ParagraphStyle("footer",
            fontName="Helvetica", fontSize=8, leading=10,
            textColor=MUTED, alignment=TA_CENTER),
        "page_num": ParagraphStyle("page_num",
            fontName="Helvetica", fontSize=8, leading=10,
            textColor=MUTED, alignment=TA_RIGHT),
        "callout_title": ParagraphStyle("callout_title",
            fontName="Helvetica-Bold", fontSize=11, leading=14,
            textColor=NAVY, spaceAfter=3),
        "callout_body": ParagraphStyle("callout_body",
            fontName="Helvetica", fontSize=9.5, leading=14,
            textColor=HexColor("#333333"), spaceAfter=0),
        "tag": ParagraphStyle("tag",
            fontName="Helvetica-Bold", fontSize=8, leading=10,
            textColor=BLUE),
    }

S = styles()

# ── Custom flowables ──────────────────────────────────────────────────────────
class ColorRect(Flowable):
    """Solid background rectangle."""
    def __init__(self, w, h, color, radius=4):
        super().__init__()
        self.w, self.h, self.color, self.radius = w, h, color, radius
        self.width, self.height = w, h

    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.roundRect(0, 0, self.w, self.h, self.radius, stroke=0, fill=1)


class StepCard(Flowable):
    """Numbered step card with coloured dot."""
    def __init__(self, number, title, body, accent, total_w):
        super().__init__()
        self.number, self.title, self.body = number, title, body
        self.accent, self.total_w = accent, total_w
        self.height = 72

    def draw(self):
        c = self.canv
        # card bg
        c.setFillColor(LIGHT)
        c.roundRect(0, 0, self.total_w, self.height, 4, stroke=0, fill=1)
        # accent strip
        c.setFillColor(self.accent)
        c.roundRect(0, 0, 4, self.height, 2, stroke=0, fill=1)
        # number
        c.setFillColor(self.accent)
        c.setFont("Helvetica-Bold", 20)
        c.drawString(12, self.height - 26, self.number)
        # title
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(12, self.height - 40, self.title)
        # body — wrap manually
        c.setFillColor(HexColor("#555555"))
        c.setFont("Helvetica", 8)
        words = self.body.split()
        line, lines = [], []
        for w in words:
            test = " ".join(line + [w])
            if c.stringWidth(test, "Helvetica", 8) < self.total_w - 20:
                line.append(w)
            else:
                lines.append(" ".join(line))
                line = [w]
        if line:
            lines.append(" ".join(line))
        y = self.height - 54
        for ln in lines[:3]:
            c.drawString(12, y, ln)
            y -= 11


class StatBox(Flowable):
    """Single stat highlight box."""
    def __init__(self, number, label, w=45*mm, h=28*mm, accent=BLUE):
        super().__init__()
        self.number, self.label = number, label
        self.width, self.height = w, h
        self.accent = accent

    def draw(self):
        c = self.canv
        c.setFillColor(LIGHT)
        c.roundRect(0, 0, self.width, self.height, 4, stroke=0, fill=1)
        c.setFillColor(self.accent)
        c.setFont("Helvetica-Bold", 20)
        tw = c.stringWidth(self.number, "Helvetica-Bold", 20)
        c.drawString((self.width - tw) / 2, self.height - 20, self.number)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        tw2 = c.stringWidth(self.label, "Helvetica", 8)
        c.drawString((self.width - tw2) / 2, 8, self.label)


class Divider(Flowable):
    def __init__(self, w, color=BORDER, thickness=0.5):
        super().__init__()
        self.width, self.height = w, thickness + 4
        self.color, self.thickness = color, thickness

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 2, self.width, 2)


# ── Page template callbacks ───────────────────────────────────────────────────
page_number = [0]

def on_page(canvas, doc):
    page_number[0] += 1
    pn = page_number[0]
    canvas.saveState()
    # Footer bar
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, W, 9 * mm, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(MARGIN, 3.2 * mm, "BOBS Instances Platform  ·  Confidential Briefing Document  ·  2025")
    if pn > 1:
        canvas.drawRightString(W - MARGIN, 3.2 * mm, f"Page {pn}")
    canvas.restoreState()


def on_cover_page(canvas, doc):
    page_number[0] += 1
    canvas.saveState()
    # Full navy background
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, W, H, stroke=0, fill=1)
    # Green accent bar top
    canvas.setFillColor(GREEN)
    canvas.rect(0, H - 5 * mm, W, 5 * mm, stroke=0, fill=1)
    # Decorative circle
    canvas.setFillColor(HexColor("#1a3a8f"))
    canvas.circle(W - 30 * mm, H - 60 * mm, 55 * mm, stroke=0, fill=1)
    canvas.restoreState()


# ── Build PDF ─────────────────────────────────────────────────────────────────
def build():
    out = "/mnt/user-data/outputs/BOBS_Instances_Pitch_Guide.pdf"
    doc = SimpleDocTemplate(
        out, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=14 * mm,
        title="BOBS Instances Platform — Pitch Guide",
        author="BOBS eServices",
    )

    content_w = W - 2 * MARGIN
    story = []

    # ── COVER ──────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 38 * mm))
    story.append(Paragraph("BOBS INSTANCES", S["cover_tag"]))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("Your pitch guide\nfor talking to\nBOBS.", S["cover_title"]))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph(
        "How to explain Instances, why they matter\nto regulators, and how to get BOBS on board.",
        S["cover_sub"]
    ))
    story.append(Spacer(1, 14 * mm))
    story.append(Paragraph("Botswana Bureau of Standards  ·  2025  ·  Confidential", S["cover_tag"]))
    story.append(PageBreak())

    # ── PAGE 2: THE ONE-SENTENCE PITCH ────────────────────────────────────────
    story.append(Paragraph("START HERE", S["section_label"]))
    story.append(Paragraph("The one sentence that opens every conversation", S["h2"]))
    story.append(Spacer(1, 3 * mm))

    # Big quote box
    quote_table = Table(
        [[Paragraph(
            '"Instances is the platform that turns BOBS compliance submissions '
            'into a structured, verifiable digital process — so your team spends '
            'less time chasing paperwork and more time making decisions."',
            ParagraphStyle("qt", fontName="Helvetica-Bold", fontSize=13, leading=19,
                           textColor=WHITE, alignment=TA_CENTER)
        )]],
        colWidths=[content_w],
        rowHeights=[None],
    )
    quote_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("ROUNDEDCORNERS", [8]),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("LEFTPADDING", (0, 0), (-1, -1), 18),
        ("RIGHTPADDING", (0, 0), (-1, -1), 18),
    ]))
    story.append(quote_table)
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph(
        "Use this sentence first, every time. It positions Instances as a tool that serves BOBS — "
        "not a system imposed on them.",
        S["caption"]
    ))

    story.append(Spacer(1, 5 * mm))
    story.append(Divider(content_w))
    story.append(Spacer(1, 4 * mm))

    story.append(Paragraph("THREE THINGS TO KNOW BEFORE THE MEETING", S["section_label"]))
    story.append(Paragraph("Know your audience", S["h2"]))

    tips = [
        ("BOBS cares about accuracy, not technology.",
         "They are a regulatory body. Their mandate is to ensure standards are upheld. "
         "Lead with how Instances reduces errors and disputes — not with features."),
        ("Paper-based compliance is a shared frustration.",
         "BOBS staff re-enter data from emailed PDFs. They know the pain. You don't need to convince "
         "them the current process is broken — you just need to show them the alternative."),
        ("Accountability is the key word.",
         "BOBS must be able to prove, if challenged, that a submission happened, when it happened, "
         "and what it contained. The cryptographic audit trail in Instances is exactly that."),
    ]
    for title, body in tips:
        tip_tbl = Table(
            [[Paragraph(title, S["callout_title"]),
              Paragraph(body, S["callout_body"])]],
            colWidths=[55 * mm, content_w - 55 * mm],
        )
        tip_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
            ("ROUNDEDCORNERS", [6]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("LINEAFTER", (0, 0), (0, -1), 1, BORDER),
        ]))
        story.append(KeepTogether([tip_tbl, Spacer(1, 4 * mm)]))

    story.append(PageBreak())

    # ── PAGE 3: WHAT IS AN INSTANCE ───────────────────────────────────────────
    story.append(Paragraph("CORE CONCEPT", S["section_label"]))
    story.append(Paragraph("What is an Instance?", S["h2"]))
    story.append(Paragraph(
        "This is the most important thing to explain clearly. Most people will map it to "
        "something familiar — use those comparisons.",
        S["body"]
    ))

    comparisons = [
        ("The tax return analogy",
         "An Instance is like a tax return that the government pre-fills with the right "
         "questions for your business type — and that locks itself once you submit so no one can "
         "change the record."),
        ("The form + delivery + receipt analogy",
         "Instead of emailing a PDF (form with no tracking), Instances gives you a structured "
         "online form (with validation), a confirmed delivery to BOBS, and a tamper-proof receipt "
         "proving exactly what you submitted and when."),
        ("The umpire analogy",
         "BOBS is the umpire of standards compliance. Instances is the scoreboard. "
         "It doesn't make the rules — it makes sure the score is recorded accurately and "
         "no one can argue about what happened."),
    ]

    for title, body in comparisons:
        cmp_tbl = Table(
            [[Paragraph(title, S["h3"]), Paragraph(body, S["body"])]],
            colWidths=[48 * mm, content_w - 48 * mm],
        )
        cmp_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("LINEAFTER", (0, 0), (0, -1), 2, GREEN),
            ("LEFTPADDING", (1, 0), (1, -1), 10),
        ]))
        story.append(cmp_tbl)
        story.append(Divider(content_w, HexColor("#eeeeee")))
        story.append(Spacer(1, 2 * mm))

    story.append(Spacer(1, 4 * mm))

    # Stats row
    stats_row = Table(
        [[
            StatBox("5", "Steps to Submit", accent=BLUE),
            StatBox("100%", "Audit Trail", accent=GREEN),
            StatBox("0", "Manual Re-entry", accent=AMBER),
            StatBox("JWT", "Signed Receipts", accent=ORANGE),
        ]],
        colWidths=[content_w / 4] * 4,
        rowHeights=[28 * mm],
    )
    stats_row.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(stats_row)
    story.append(PageBreak())

    # ── PAGE 4: THE 5-STEP LIFECYCLE ──────────────────────────────────────────
    story.append(Paragraph("THE PROCESS", S["section_label"]))
    story.append(Paragraph("Walk them through the 5 steps", S["h2"]))
    story.append(Paragraph(
        "Use this when you need to go deeper. Walk through each step slowly — "
        "BOBS staff will recognise their own pain points at steps 1, 3, and 5.",
        S["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    steps = [
        ("01", "BOBS Provisions", BLUE,
         "A BOBS administrator picks the right template for your organisation "
         "(ISO 9001, import inspection, calibration, etc.) and assigns it with a deadline. "
         "No more email threads to decide what form to use."),
        ("02", "Guided Data Entry", GREEN,
         "The licensee fills in a structured form — every required field, file, and validation rule "
         "is defined by the template. The system catches errors in real time."),
        ("03", "Integrity Check", AMBER,
         "Every uploaded file is SHA-256 hashed in the browser before upload. The server "
         "recomputes the hash on arrival. Any tampering in transit is automatically detected and rejected."),
        ("04", "Sign & Submit", ORANGE,
         "Submission generates a JWT-signed digital receipt — a cryptographic proof of what was "
         "submitted, by whom, and when. The data is locked. Neither party can alter it."),
        ("05", "BOBS Reviews", NAVY,
         "BOBS officers see the full submission, all attached documents, and automated analytics "
         "immediately. They can approve, flag for correction, or reject — with notes."),
    ]

    for num, title, color, body in steps:
        story.append(StepCard(num, title, body, color, content_w))
        story.append(Spacer(1, 3 * mm))

    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph(
        "Tip: At step 03, pause and say: \"Right now, BOBS has no way to know if a PDF was "
        "modified after it was sent. Instances solves this.\"",
        ParagraphStyle("tip", fontName="Helvetica-Oblique", fontSize=9, leading=13,
                       textColor=BLUE, leftIndent=10, borderPad=8,
                       borderColor=BLUE, borderWidth=0, backColor=HexColor("#edf3f9"))
    ))
    story.append(PageBreak())

    # ── PAGE 5: BEFORE / AFTER ────────────────────────────────────────────────
    story.append(Paragraph("THE PROBLEM WE SOLVE", S["section_label"]))
    story.append(Paragraph("Before Instances vs After Instances", S["h2"]))
    story.append(Spacer(1, 3 * mm))

    col_w = (content_w - 6 * mm) / 2

    before_items = [
        "Licensees email PDFs with no version control",
        "BOBS staff manually re-enter data — error-prone and slow",
        "Documents go missing or are submitted to the wrong inbox",
        "Weeks of back-and-forth chasing missing attachments",
        "No way to prove what was submitted if disputed",
        "No visibility for the licensee on submission status",
        "Reports arrive in different formats — hard to analyse",
    ]

    after_items = [
        "Structured, schema-validated submissions — every field enforced",
        "Data goes directly into BOBS systems — zero re-entry",
        "Every submission tracked from creation to decision",
        "Missing documents blocked before submission is allowed",
        "JWT-signed receipt is non-repudiable proof of submission",
        "Licensee dashboard shows status in real time",
        "All data in a consistent format — instant analytics",
    ]

    def col_cell(title, items, bg, text_color, bullet_color, title_color):
        paras = [Paragraph(
            f'<font color="{title_color}"><b>{title}</b></font>',
            ParagraphStyle("ct", fontName="Helvetica-Bold", fontSize=11, leading=14,
                           spaceAfter=6)
        )]
        for item in items:
            paras.append(Paragraph(
                f'<font color="{bullet_color}">{"✕" if "Before" in title else "✓"}</font>  {item}',
                ParagraphStyle("bi", fontName="Helvetica", fontSize=9, leading=13,
                               textColor=HexColor(text_color), leftIndent=12,
                               firstLineIndent=-12, spaceAfter=2)
            ))
        return paras

    before_col = col_cell("Before Instances", before_items, "#fff5f5", "#b91c1c", "#dc2626", "#991b1b")
    after_col  = col_cell("After Instances",  after_items,  "#f0fdf4", "#15803d", "#16a34a", "#166534")

    comparison_tbl = Table(
        [[before_col, after_col]],
        colWidths=[col_w, col_w],
        spaceBefore=0,
    )
    comparison_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), HexColor("#fff5f5")),
        ("BACKGROUND", (1, 0), (1, -1), HexColor("#f0fdf4")),
        ("ROUNDEDCORNERS", [6]),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEAFTER", (0, 0), (0, -1), 1, HexColor("#e5e7eb")),
    ]))
    story.append(comparison_tbl)
    story.append(PageBreak())

    # ── PAGE 6: OBJECTION HANDLING ────────────────────────────────────────────
    story.append(Paragraph("OBJECTION HANDLING", S["section_label"]))
    story.append(Paragraph("Questions they will ask — and how to answer", S["h2"]))
    story.append(Spacer(1, 2 * mm))

    objections = [
        ("\"We already have forms on our website.\"",
         "Those forms collect data — they don't validate it, track it, or guarantee integrity. "
         "A licensee can submit an incorrect PDF and neither party has a reliable audit trail. "
         "Instances closes that gap."),
        ("\"What happens to our existing certified companies?\"",
         "BOBS provisions Instances for each organisation. They log in, see their pending "
         "compliance tasks, and fill them in. Onboarding is handled on the BOBS side — the "
         "licensee just receives access."),
        ("\"We don't want to manage another system.\"",
         "Instances is managed by the eServices team. BOBS's role is to define templates (once, "
         "per service type) and review submissions. Day-to-day maintenance is handled for you."),
        ("\"Is this secure?\"",
         "Yes. Passwords are bcrypt-hashed. Sessions use signed JWTs. Files are SHA-256 verified "
         "end-to-end. All actions are recorded in an immutable audit log. The security model is "
         "designed to be explainable to an auditor."),
        ("\"What if a company disputes their submission?\"",
         "The JWT-signed receipt is the answer. It cryptographically binds the submission to "
         "their identity, the timestamp, and the exact data submitted. It's non-repudiable — "
         "like a notarised document, but automated."),
        ("\"Can we customise the forms for each service?\"",
         "Yes — that's the point of the Template system. Each BOBS service (QMS, IMPORT, CALIB, "
         "PROD) has its own template defining exactly which fields and documents are required. "
         "Templates can be updated by BOBS admins without developer involvement."),
    ]

    for q, a in objections:
        obj_tbl = Table(
            [[
                Paragraph(q, ParagraphStyle("q", fontName="Helvetica-Bold", fontSize=10,
                           leading=14, textColor=NAVY)),
                Paragraph(a, ParagraphStyle("a", fontName="Helvetica", fontSize=9.5,
                           leading=14, textColor=HexColor("#333333")))
            ]],
            colWidths=[52 * mm, content_w - 52 * mm],
        )
        obj_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING", (1, 0), (1, -1), 10),
            ("LINEAFTER", (0, 0), (0, -1), 2, AMBER),
        ]))
        story.append(KeepTogether([obj_tbl, Divider(content_w, HexColor("#eeeeee")), Spacer(1, 1 * mm)]))

    story.append(PageBreak())

    # ── PAGE 7: THE DEMO SCRIPT ────────────────────────────────────────────────
    story.append(Paragraph("THE DEMO", S["section_label"]))
    story.append(Paragraph("How to show the Instances Playground", S["h2"]))
    story.append(Paragraph(
        "The Playground is a live, sandboxed environment inside the platform that lets anyone "
        "experience the full Instance workflow without saving any data. Use it in the meeting — "
        "walk through these steps.",
        S["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    demo_steps = [
        ("Open the Playground",
         'Go to Dashboard > Instances Playground. Say: "This is what a licensee would see '
         'when they log in. Three tabs: learn, build, run."'),
        ("Show the Learn tab",
         'Click "What are Instances?" and open the lifecycle collapsible. Say: "Every step '
         'in the process is tracked. Nothing slips through."'),
        ("Build a template",
         'Click "Template Builder." Load the ISO 9001 preset or build one from scratch. '
         'Add a field, mark it required, change the type to dropdown. Say: "BOBS defines '
         'the template once. The licensee fills it every reporting period."'),
        ("Deploy and run it",
         'Click "Deploy to Sandbox." Fill in some sample data, deliberately leave a required '
         'field blank. Show the validation error. Then fill everything in and proceed.'),
        ("Show the receipt",
         'Submit the sandbox. Show the result screen — the simulated JWT receipt, the analysis '
         'panel, the file integrity note. Say: "In production, BOBS would see this the moment '
         'it\'s submitted."'),
    ]

    for i, (title, script) in enumerate(demo_steps, 1):
        demo_tbl = Table(
            [[
                Paragraph(str(i), ParagraphStyle("dn", fontName="Helvetica-Bold", fontSize=18,
                           leading=22, textColor=BLUE, alignment=TA_CENTER)),
                [
                    Paragraph(title, S["h3"]),
                    Paragraph(script, S["body"]),
                ]
            ]],
            colWidths=[16 * mm, content_w - 16 * mm],
        )
        demo_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING", (1, 0), (1, -1), 8),
        ]))
        story.append(KeepTogether([demo_tbl, Divider(content_w, HexColor("#eeeeee")), Spacer(1, 2 * mm)]))

    story.append(Spacer(1, 4 * mm))
    tip_box = Table(
        [[Paragraph(
            "<b>Closing line after the demo:</b> \"Everything you just saw — the validation, "
            "the file checks, the receipt — happens automatically. Your team's job is to "
            "review decisions, not manage paperwork.\"",
            ParagraphStyle("demo_tip", fontName="Helvetica", fontSize=10, leading=15,
                           textColor=NAVY)
        )]],
        colWidths=[content_w],
    )
    tip_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#edf3f9")),
        ("ROUNDEDCORNERS", [6]),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(tip_box)
    story.append(PageBreak())

    # ── PAGE 8: NEXT STEPS ────────────────────────────────────────────────────
    story.append(Paragraph("CLOSING THE MEETING", S["section_label"]))
    story.append(Paragraph("What to ask for before you leave", S["h2"]))
    story.append(Paragraph(
        "Don't leave without a specific next action. Here are the three asks, in order of preference.",
        S["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    asks = [
        (GREEN, "Ask 1 (best outcome)",
         "\"Can we schedule a one-hour working session with your compliance team to map "
         "your existing service types to Instance templates?\"",
         "This gets the right people in the room and produces immediate value."),
        (BLUE, "Ask 2 (acceptable outcome)",
         "\"Can you identify one service type — just one — where we can run a pilot? "
         "We'll set it up, train your team, and measure it over one reporting cycle.\"",
         "A pilot is low-risk and gives BOBS a concrete result to evaluate."),
        (AMBER, "Ask 3 (minimum outcome)",
         "\"Can we leave you with login credentials to the Instances Playground so your "
         "team can explore it at their own pace this week?\"",
         "Gets the platform in front of the decision-makers without requiring a commitment."),
    ]

    for color, title, ask, note in asks:
        ask_tbl = Table(
            [[
                ColorRect(4, 60, color),
                [
                    Paragraph(title, ParagraphStyle("at", fontName="Helvetica-Bold",
                               fontSize=10, leading=13, textColor=NAVY, spaceAfter=3)),
                    Paragraph(ask, ParagraphStyle("aq", fontName="Helvetica-Oblique",
                               fontSize=10, leading=14, textColor=HexColor("#333333"), spaceAfter=3)),
                    Paragraph(note, S["caption"]),
                ]
            ]],
            colWidths=[8 * mm, content_w - 8 * mm],
        )
        ask_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING", (1, 0), (1, -1), 10),
        ]))
        story.append(KeepTogether([ask_tbl, Spacer(1, 5 * mm)]))

    story.append(Divider(content_w))
    story.append(Spacer(1, 5 * mm))

    story.append(Paragraph("CHEAT SHEET — TERMS TO USE AND AVOID", S["section_label"]))
    story.append(Spacer(1, 2 * mm))

    cheat_data = [
        [Paragraph("<b>Say this</b>", S["h3"]), Paragraph("<b>Not this</b>", S["h3"]), Paragraph("<b>Why</b>", S["h3"])],
        ["Instance", "Form / submission / report", "\"Instance\" is a precise term that means something specific to the platform."],
        ["Template", "Configuration / schema / setup", "\"Template\" is already in BOBS's vocabulary from certification processes."],
        ["Compliance vault", "Database / storage / server", "\"Vault\" emphasises immutability and security — the words regulators trust."],
        ["Provision", "Create / set up / assign", "\"Provision\" positions BOBS as the authority who initiates the workflow."],
        ["Digital receipt", "JWT / token / hash", "Technical jargon loses non-technical stakeholders. \"Receipt\" is universal."],
        ["Audit trail", "Log / history / record", "\"Audit trail\" is standard regulatory language and resonates immediately."],
    ]

    cheat_tbl = Table(
        cheat_data,
        colWidths=[38 * mm, 48 * mm, content_w - 86 * mm],
        repeatRows=1,
    )
    cheat_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEADING", (0, 0), (-1, -1), 13),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT]),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(cheat_tbl)

    # ── Build ──────────────────────────────────────────────────────────────────
    def page_fn(canvas, doc):
        if doc.page == 1:
            on_cover_page(canvas, doc)
        else:
            on_page(canvas, doc)

    doc.build(story, onFirstPage=on_cover_page, onLaterPages=on_page)
    print(f"PDF written to {out}")

build()
