import cloudinary
import cloudinary.uploader
import os
import json

cloudinary.config(
    cloud_name="dpnbibk6d",
    api_key="875317422873575",
    api_secret="hAxoQD5-NWWxH_G-ScjE169ViFg"
)

STATIC_DIR = r"C:\yojanamitra_complete\static"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}
VIDEO_EXTS = {".mp4", ".webm"}

# Skip these folders / files
SKIP_DIRS = {"__pycache__", "node_modules", ".git"}
SKIP_FILES = {}

results = {}

for root, dirs, files in os.walk(STATIC_DIR):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for filename in files:
        if filename in SKIP_FILES:
            continue
        ext = os.path.splitext(filename)[1].lower()
        filepath = os.path.join(root, filename)

        rel_path = os.path.relpath(filepath, STATIC_DIR)
        public_id = "yojanamitra/" + rel_path.replace("\\", "/").rsplit(".", 1)[0]

        if ext in IMAGE_EXTS:
            print(f"Uploading image: {rel_path}")
            try:
                res = cloudinary.uploader.upload(
                    filepath,
                    public_id=public_id,
                    resource_type="image",
                    overwrite=True,
                    format="webp",
                    quality="auto:good",
                    flags="strip_profile"
                )
                results[rel_path.replace("\\", "/")] = res["secure_url"]
            except Exception as e:
                print(f"  SKIPPED ({e})")

        elif ext in VIDEO_EXTS:
            print(f"Uploading video: {rel_path}")
            try:
                res = cloudinary.uploader.upload(
                    filepath,
                    public_id=public_id,
                    resource_type="video",
                    overwrite=True,
                    quality="auto:good",
                    format="mp4"
                )
                results[rel_path.replace("\\", "/")] = res["secure_url"]
            except Exception as e:
                print(f"  SKIPPED ({e})")

with open("cloudinary_map.json", "w") as f:
    json.dump(results, f, indent=2)

print(f"\nDone. {len(results)} files uploaded.")
print("URL map saved to cloudinary_map.json")
