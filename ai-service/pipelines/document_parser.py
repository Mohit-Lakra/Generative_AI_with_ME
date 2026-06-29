import base64
import fitz  # PyMuPDF
import io
from docx import Document

def parse_pdf(base64_str: str) -> str:
    pdf_bytes = base64.b64decode(base64_str)
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text.strip()

def parse_docx(base64_str: str) -> str:
    docx_bytes = base64.b64decode(base64_str)
    doc = Document(io.BytesIO(docx_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text.strip()
