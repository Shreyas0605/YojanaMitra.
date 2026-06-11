import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils

# Configure Cloudinary with your credentials
cloudinary.config(
    cloud_name="dpnbibk6d",
    api_key="875317422873575",
    api_secret="hAxoQD5-NWWxH_G-ScjE169ViFg",
    secure=True
)

# --- 1. Upload a sample image ---
print("Uploading image...")
upload_result = cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    public_id="onboarding_sample"
)

secure_url = upload_result["secure_url"]
public_id = upload_result["public_id"]
print(f"Secure URL:  {secure_url}")
print(f"Public ID:   {public_id}")

# --- 2. Fetch and print image metadata ---
print("\nFetching image details...")
details = cloudinary.api.resource(public_id)
print(f"Width:       {details['width']}px")
print(f"Height:      {details['height']}px")
print(f"Format:      {details['format']}")
print(f"File size:   {details['bytes']} bytes")

# --- 3. Generate a transformed image URL ---
# f_auto: Cloudinary automatically picks the best format for the user's browser (e.g. WebP, AVIF)
# q_auto: Cloudinary automatically selects the best quality level to reduce file size without visible loss
transformed_url, _ = cloudinary.utils.cloudinary_url(
    public_id,
    fetch_format="auto",   # f_auto
    quality="auto"         # q_auto
)

print("\nDone! Click link below to see optimized version of the image. Check the size and the format.")
print(f"Transformed URL: {transformed_url}")
