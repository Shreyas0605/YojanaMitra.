import json
import os
import re

HTML_DIR = r"C:\yojanamitra_complete\static"
MAP_FILE = "cloudinary_map.json"

with open(MAP_FILE) as f:
    cdn_map = json.load(f)

def patch_file(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        print(f"Skipped (not UTF-8): {filepath}")
        return False

    original = content
    for local_path, cdn_url in cdn_map.items():
        filename = os.path.basename(local_path)
        # Build patterns: match the exact rel_path first, then fallback to filename-only
        patterns_to_try = [local_path, filename]
        for ref in patterns_to_try:
            for quote in ['"', "'"]:
                # src="ref", src='ref'
                old_src = f"src={quote}{ref}{quote}"
                new_src = f"src={quote}{cdn_url}{quote}"
                content = content.replace(old_src, new_src)

                # data-src="ref", data-src='ref'
                old_dsrc = f"data-src={quote}{ref}{quote}"
                new_dsrc = f"data-src={quote}{cdn_url}{quote}"
                content = content.replace(old_dsrc, new_dsrc)

                # url('ref'), url("ref")
                old_url_q = f"url({quote}{ref}{quote})"
                new_url_q = f"url({quote}{cdn_url}{quote})"
                content = content.replace(old_url_q, new_url_q)

            # url(ref) without quotes
            old_url = f"url({ref})"
            new_url = f"url({cdn_url})"
            content = content.replace(old_url, new_url)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Patched: {filepath}")
        return True
    return False

count = 0
for root, dirs, files in os.walk(HTML_DIR):
    for fname in files:
        if fname.endswith(".html"):
            if patch_file(os.path.join(root, fname)):
                count += 1

print(f"\nDone. {count} HTML files patched.")
