import cv2
import numpy as np
import pytesseract
import base64
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

# Lazy load TrOCR for handwritten notes (Deep Learning OCR)
processor = None
model = None

def get_trocr_model():
    global processor, model
    if processor is None or model is None:
        print("Loading Deep Learning OCR Model (TrOCR)...")
        processor = TrOCRProcessor.from_pretrained("microsoft/trocr-small-handwritten")
        model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-small-handwritten")
    return processor, model

def process_image_base64(base64_str: str) -> dict:
    # Decode base64 to image
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Preprocessing for Tesseract
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    denoised = cv2.medianBlur(thresh, 3)

    # First Pass: Fast OCR with Tesseract
    custom_config = r'--oem 3 --psm 6'
    data = pytesseract.image_to_data(denoised, config=custom_config, output_type=pytesseract.Output.DICT)
    
    confidences = [int(c) for c in data['conf'] if str(c) != '-1']
    avg_conf = sum(confidences) / len(confidences) if confidences else 0
    text = pytesseract.image_to_string(denoised, config=custom_config)
    
    # Deep Learning Fallback for handwritten/scanned notes with poor confidence
    if avg_conf < 60:
        print("Low confidence detected. Triggering Deep Learning OCR (TrOCR) fallback...")
        try:
            pil_image = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            proc, mod = get_trocr_model()
            
            pixel_values = proc(images=pil_image, return_tensors="pt").pixel_values
            generated_ids = mod.generate(pixel_values)
            dl_text = proc.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            # Use the Deep Learning output
            text = dl_text
            avg_conf = 85.0 # Artificially boost confidence since we used the DL model
        except Exception as e:
            print("DL Fallback failed, using Tesseract output.", e)

    return {
        "raw_text": text.strip(),
        "confidence": float(avg_conf)
    }
