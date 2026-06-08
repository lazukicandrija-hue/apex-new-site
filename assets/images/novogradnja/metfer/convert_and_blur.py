#!/usr/bin/env python3
"""Convert PDF floor plans to PNG and blur investor info."""

import fitz  # PyMuPDF
from PIL import Image, ImageFilter
import os
import glob

PDF_DIR = "/Users/andrijalazukic/Desktop/KATALOG SKICA final pdf"
OUT_DIR = "/Users/andrijalazukic/Desktop/aAPEX/najnovi sajt/assets/images/novogradnja/metfer/skice"

os.makedirs(OUT_DIR, exist_ok=True)

# Regions to blur (in pixel coordinates at 200 DPI)
# Based on the preview: image is 3308 x 2339
# Top-left text block: "Stambena zgrada / Su+P+2+(3) / Ulica Novosadska 7a, Sr. Kamenica / www.metfer.rs"
# Approximately: x=0, y=0, w=600, h=200
BLUR_REGIONS_TOP = [(0, 0, 700, 200)]

# Bottom-left logo + text: "METFER PROJEKT" — cover with white
WHITE_REGIONS = [(0, 2050, 700, 2339)]

# Also the "Ulica Novosadska" text on the side of the building plan (vertical text)
# Approximately: x=480, y=900, w=560, h=1350
BLUR_REGIONS_SIDE = [(480, 900, 570, 1400)]


def blur_region(img, region, blur_radius=30):
    """Apply heavy blur to a specific region of the image."""
    x1, y1, x2, y2 = region
    x2 = min(x2, img.width)
    y2 = min(y2, img.height)
    cropped = img.crop((x1, y1, x2, y2))
    blurred = cropped.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    img.paste(blurred, (x1, y1))
    return img


def white_region(img, region):
    """Cover a region with solid white."""
    from PIL import ImageDraw
    x1, y1, x2, y2 = region
    x2 = min(x2, img.width)
    y2 = min(y2, img.height)
    draw = ImageDraw.Draw(img)
    draw.rectangle([x1, y1, x2, y2], fill=(255, 255, 255))
    return img


def process_pdf(pdf_path, output_name):
    """Convert PDF to PNG and blur sensitive areas."""
    try:
        doc = fitz.open(pdf_path)
        page = doc[0]
        pix = page.get_pixmap(dpi=200)
        
        # Save as temp PNG first
        temp_path = os.path.join(OUT_DIR, f"_temp_{output_name}.png")
        pix.save(temp_path)
        
        # Open with PIL for blurring
        img = Image.open(temp_path)
        
        # Apply blur regions (top header + side text)
        for region in BLUR_REGIONS_TOP + BLUR_REGIONS_SIDE:
            img = blur_region(img, region, blur_radius=40)
        
        # Cover METFER PROJEKT logo with white
        for region in WHITE_REGIONS:
            img = white_region(img, region)
        
        # Save final
        final_path = os.path.join(OUT_DIR, f"stan-{output_name}.png")
        img.save(final_path, optimize=True)
        
        # Cleanup temp
        os.remove(temp_path)
        
        doc.close()
        print(f"✓ {os.path.basename(pdf_path)} → stan-{output_name}.png ({img.width}x{img.height})")
        return True
    except Exception as e:
        print(f"✗ {os.path.basename(pdf_path)}: {e}")
        return False


# Process all PDFs
pdf_files = sorted(glob.glob(os.path.join(PDF_DIR, "*.pdf")))

# Map PDF names to output names
name_map = {}
for pdf_path in pdf_files:
    basename = os.path.splitext(os.path.basename(pdf_path))[0]
    # Clean up name for output
    clean = basename.replace(" i ", "-").replace(" ", "_").lower()
    if clean == "osnova_suterna":
        continue  # Skip basement plan
    name_map[pdf_path] = clean

print(f"Processing {len(name_map)} floor plans...\n")

success = 0
for pdf_path, output_name in sorted(name_map.items()):
    if process_pdf(pdf_path, output_name):
        success += 1

print(f"\nDone! {success}/{len(name_map)} converted successfully.")
print(f"Output: {OUT_DIR}")
