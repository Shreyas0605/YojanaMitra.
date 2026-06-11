import re
import json

HTML_PATH = r"C:\yojanamitra_complete\static\index.html"
OUT_DIR = r"C:\yojanamitra_complete\static\src"

with open(HTML_PATH, "r", encoding="utf-8") as f:
    html = f.read()

def extract_tag_contents(html, tag):
    """Extract content of all <tag>...</tag> blocks, returns list of (full_match, inner_content)."""
    pattern = re.compile(
        rf'<{tag}[^>]*>(.*?)</{tag}>', re.DOTALL
    )
    return pattern.findall(html)

def extract_tag_contents_in_region(html, tag, start, end):
    """Same as extract_tag_contents but limited to html[start:end]."""
    region = html[start:end]
    pattern = re.compile(
        rf'<{tag}[^>]*>(.*?)</{tag}>', re.DOTALL
    )
    return pattern.findall(region)

def strip_all_script_tags(html):
    """Remove all <script...>...</script> blocks from html."""
    return re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)

def find_body_bounds(html):
    """Find start and end of <body> inner content."""
    m_start = re.search(r'<body[^>]*>', html, re.DOTALL)
    m_end = re.search(r'</body>', html, re.DOTALL)
    if not m_start or not m_end:
        raise ValueError("Could not find <body> tags")
    return m_start.end(), m_end.start()

# ── Find head bounds ──
m_head_start = re.search(r'<head[^>]*>', html, re.DOTALL)
m_head_end = re.search(r'</head>', html, re.DOTALL)
if not m_head_start or not m_head_end:
    raise ValueError("Could not find <head> tags")
head_start, head_end = m_head_start.end(), m_head_end.start()

# ── 1. headCSS.js — extract all <style> contents from <head> ──
style_contents = extract_tag_contents_in_region(html, "style", head_start, head_end)
head_css = "\n\n".join(style_contents)

# ── 2. bodyHTML.js — extract <body> inner HTML, strip <script> tags ──
body_start, body_end = find_body_bounds(html)
body_inner = html[body_start:body_end]
body_inner_clean = strip_all_script_tags(body_inner)

# ── 3. inlineScripts.js — extract inline <script> contents from <body> ──
# Find all script tags in body, but only those WITHOUT src attribute
body_script_pattern = re.compile(
    r'<script\b([^>]*)>(.*?)</script>', re.DOTALL
)
inline_scripts = []
for attrs, content in body_script_pattern.findall(body_inner):
    content = content.strip()
    if not content:
        continue
    # Only include if there's NO src attribute
    if not re.search(r'\bsrc\s*=', attrs):
        inline_scripts.append(content)

# ── Write the three JS modules ──
import os
os.makedirs(OUT_DIR, exist_ok=True)

# bodyHTML.js
with open(os.path.join(OUT_DIR, "bodyHTML.js"), "w", encoding="utf-8") as f:
    f.write("const bodyHTML = ")
    f.write(json.dumps(body_inner_clean, ensure_ascii=False))
    f.write(";\n\nexport default bodyHTML;\n")

# headCSS.js
with open(os.path.join(OUT_DIR, "headCSS.js"), "w", encoding="utf-8") as f:
    f.write("const headCSS = ")
    f.write(json.dumps(head_css, ensure_ascii=False))
    f.write(";\n\nexport default headCSS;\n")

# inlineScripts.js
with open(os.path.join(OUT_DIR, "inlineScripts.js"), "w", encoding="utf-8") as f:
    f.write("const inlineScripts = ")
    f.write(json.dumps(inline_scripts, ensure_ascii=False))
    f.write(";\n\nexport default inlineScripts;\n")

print(f"Generated {len(style_contents)} style block(s) in headCSS.js")
print(f"Generated bodyHTML.js ({len(body_inner_clean)} chars)")
print(f"Generated inlineScripts.js ({len(inline_scripts)} entries)")
print("Done.")
