import cloudinary
import cloudinary.uploader
import json

cloudinary.config(
    cloud_name="dpnbibk6d",
    api_key="875317422873575",
    api_secret="hAxoQD5-NWWxH_G-ScjE169ViFg"
)

filepath = r"C:\yojanamitra_complete\static\ymad.mp4"

print("Uploading ymad.mp4 (chunked upload)...")
try:
    res = cloudinary.uploader.upload(
        filepath,
        public_id="yojanamitra/ymad",
        resource_type="video",
        overwrite=True,
        timeout=600,
        chunk_size=20000000,
    )
    url = res["secure_url"]
    print(f"Uploaded: {url}")

    # Add to cloudinary_map.json
    with open("cloudinary_map.json") as f:
        m = json.load(f)
    m["ymad.mp4"] = url
    with open("cloudinary_map.json", "w") as f:
        json.dump(m, f, indent=2)
    print("Updated cloudinary_map.json")
except Exception as e:
    print(f"Failed: {e}")
