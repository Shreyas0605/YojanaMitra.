import cloudinary
import cloudinary.uploader
import os

# Configure Cloudinary with your credentials
cloudinary.config(
    cloud_name="dpnbibk6d",
    api_key="875317422873575",
    api_secret="hAxoQD5-NWWxH_G-ScjE169ViFg",
    secure=True
)

# Folders to upload from
FOLDERS = [
    r"C:\yojanamitra_complete\static\img",
    r"C:\yojanamitra_complete\static\frames",
]

# Supported image extensions
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".tiff"}

def upload_folder(folder_path):
    if not os.path.exists(folder_path):
        print(f"\n[SKIP] Folder not found: {folder_path}")
        return

    # Use folder name as the Cloudinary subfolder (e.g. "img" or "frames")
    cloudinary_folder = os.path.basename(folder_path)
    files = [f for f in os.listdir(folder_path)
             if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS]

    if not files:
        print(f"\n[SKIP] No images found in: {folder_path}")
        return

    print(f"\nUploading {len(files)} image(s) from '{folder_path}' → Cloudinary folder '{cloudinary_folder}/'")
    print("-" * 60)

    success, failed = 0, 0

    for filename in files:
        file_path = os.path.join(folder_path, filename)
        # public_id = folder/filename_without_extension
        public_id = f"{cloudinary_folder}/{os.path.splitext(filename)[0]}"

        try:
            result = cloudinary.uploader.upload(
                file_path,
                public_id=public_id,
                overwrite=True,           # re-upload if already exists
                resource_type="image"
            )
            print(f"  ✓ {filename}")
            print(f"    URL: {result['secure_url']}")
            success += 1
        except Exception as e:
            print(f"  ✗ {filename} — ERROR: {e}")
            failed += 1

    print(f"\n  Done: {success} uploaded, {failed} failed")

# --- Run ---
print("=" * 60)
print("Cloudinary Bulk Image Upload")
print("=" * 60)

for folder in FOLDERS:
    upload_folder(folder)

print("\n" + "=" * 60)
print("All folders processed.")
print("View your images at: https://console.cloudinary.com/app/assets/images")
print("=" * 60)
