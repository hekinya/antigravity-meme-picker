import os
import io
import base64
import json
import re
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRESETS_DIR = os.path.join(BASE_DIR, "assets", "presets", "default")
DIST_DIR = os.path.join(BASE_DIR, "dist")
SRC_CORE = os.path.join(BASE_DIR, "src", "core.js")
OUTPUT_BUNDLE = os.path.join(DIST_DIR, "antigravity-meme-picker.bundle.js")

os.makedirs(DIST_DIR, exist_ok=True)
if not os.path.exists(PRESETS_DIR):
    os.makedirs(PRESETS_DIR, exist_ok=True)

# 1. 扫描预设表情图片
valid_exts = (".png", ".jpg", ".jpeg", ".webp")
files = [f for f in os.listdir(PRESETS_DIR) if f.lower().endswith(valid_exts)]

def sort_key(fn):
    m = re.match(r"^(\d+)", fn)
    return int(m.group(1)) if m else 999

files.sort(key=sort_key)

memes = []
for fn in files:
    m = re.match(r"^(\d+)[-_](.+)\.[^.]+$", fn)
    if m:
        num, name = m.group(1), m.group(2)
    else:
        name = os.path.splitext(fn)[0]
        num = name

    filepath = os.path.join(PRESETS_DIR, fn)
    try:
        with Image.open(filepath) as img:
            img = img.convert("RGBA")
            img.thumbnail((160, 160), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="WEBP", quality=82, method=6)
            b64 = base64.b64encode(buf.getvalue()).decode("ascii")
            memes.append({
                "id": str(num),
                "name": name,
                "filename": fn,
                "tag": f"[表情: {name}]",
                "preview": f"data:image/webp;base64,{b64}"
            })
    except Exception as e:
        print(f"Skipping {fn}: {e}")

print(f"Loaded {len(memes)} preset memes.")

# 2. 读取 core.js
if os.path.exists(SRC_CORE):
    with open(SRC_CORE, "r", encoding="utf-8") as f:
        core_code = f.read()
else:
    core_code = "// core.js missing"

# 3. 合并打包
bundle_code = f"""// Antigravity Meme Picker Bundle v1.0.0
// Universal Sticker Drawer & Chat Meme Renderer for Google Antigravity
(() => {{
    window.__DEFAULT_PRESET_MEMES = {json.dumps(memes, ensure_ascii=False)};
}})();

{core_code}
"""

with open(OUTPUT_BUNDLE, "w", encoding="utf-8") as f:
    f.write(bundle_code)

print(f"Build completed: {OUTPUT_BUNDLE} ({len(bundle_code)/1024:.2f} KB)")
