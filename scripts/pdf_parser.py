#!/usr/bin/env python3
"""
PDF Resume Extractor
- Extracts text from a PDF using pdfplumber
- Normalizes whitespace and fixes hyphenated line breaks
- Attempts simple header/footer noise removal (short repeated lines across pages)

CLI:
    python3 scripts/pdf_parser.py /tmp/resume.pdf

Outputs JSON to stdout:
{
  "rawText": string,
  "pages": [string, ...],
  "error": string | null
}

On error, prints:
{
  "rawText": "",
  "pages": [],
  "error": "message"
}
"""

import sys
import json
import re
from typing import List

try:
    import pdfplumber  # type: ignore
except Exception as e:
    # If pdfplumber isn't installed, report error cleanly
    err = {
        "rawText": "",
        "pages": [],
        "error": f"pdfplumber import error: {e}"
    }
    print(json.dumps(err))
    sys.exit(0)


def normalize_text(text: str) -> str:
    # Standardize newlines
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Collapse tabs to spaces
    text = text.replace('\t', ' ')
    # Collapse multiple spaces
    text = re.sub(r"[ \u00A0]{2,}", " ", text)
    # Fix hyphenated line breaks: inter-\nnational -> international
    text = re.sub(r"-\s*\n\s*", "", text)
    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_lines(text: str) -> List[str]:
    return [ln.strip() for ln in text.split('\n')]


def remove_header_footer_candidates(pages_lines: List[List[str]]) -> List[List[str]]:
    # Identify short lines that repeat across >= 50% of pages -> considered header/footer noise
    freq = {}
    n_pages = len(pages_lines)
    for lines in pages_lines:
        # use a set per page to avoid counting duplicates twice
        seen = set()
        for ln in lines:
            s = ln.strip()
            if len(s) == 0:
                continue
            if len(s) <= 40:
                if s not in seen:
                    freq[s] = freq.get(s, 0) + 1
                    seen.add(s)
    threshold = max(1, n_pages // 2)  # appears on at least half the pages
    noise = {k for k, v in freq.items() if v >= threshold}

    cleaned = []
    for lines in pages_lines:
        cleaned.append([ln for ln in lines if ln.strip() not in noise])
    return cleaned


def main() -> None:
    if len(sys.argv) < 2:
        out = {"rawText": "", "pages": [], "error": "missing PDF path argument"}
        print(json.dumps(out))
        return

    pdf_path = sys.argv[1]
    try:
        pages_text: List[str] = []
        pages_lines: List[List[str]] = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                # Extract text; keep line structure
                txt = page.extract_text(x_tolerance=1.5, y_tolerance=2.0) or ""
                # Normalize per page to stabilize content before noise detection
                txt_norm = normalize_text(txt)
                lines = split_lines(txt_norm)
                pages_text.append(txt_norm)
                pages_lines.append(lines)

        # Remove obvious header/footer across pages (short repeated lines)
        cleaned_pages_lines = remove_header_footer_candidates(pages_lines)
        cleaned_pages_text: List[str] = []
        for lines in cleaned_pages_lines:
            # preserve bullets and structure; join lines with \n
            page_text = "\n".join(lines)
            # after removal, run a light normalization again to keep tidy
            page_text = normalize_text(page_text)
            cleaned_pages_text.append(page_text)

        raw_text = normalize_text("\n\n".join(cleaned_pages_text))
        out = {
            "rawText": raw_text,
            "pages": cleaned_pages_text,
            "error": None
        }
        print(json.dumps(out))
    except Exception as e:
        err = {
            "rawText": "",
            "pages": [],
            "error": f"{type(e).__name__}: {e}"
        }
        print(json.dumps(err))


if __name__ == "__main__":
    main()
