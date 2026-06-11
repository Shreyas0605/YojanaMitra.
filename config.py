import json
import os

CLOUDINARY_BASE = "https://res.cloudinary.com/dpnbibk6d"

_cdn_map = {}
_map_path = os.path.join(os.path.dirname(__file__), "cloudinary_map.json")
if os.path.exists(_map_path):
    with open(_map_path) as f:
        _cdn_map = json.load(f)

def cdn_url(static_path, w=None, h=None, q="auto:good"):
    if static_path in _cdn_map:
        url = _cdn_map[static_path]
        if w or h:
            transforms = []
            if w:
                transforms.append(f"w_{w}")
            if h:
                transforms.append(f"h_{h}")
            transforms += [f"q_{q}", "c_limit", "f_auto"]
            t_str = ",".join(transforms)
            url = url.replace("/upload/", f"/upload/{t_str}/")
        return url
    return f"/static/{static_path}"
