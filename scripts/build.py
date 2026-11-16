"""Assemble this browser app for a GitHub Pages project path."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent.parent
web = root / "web"
dist = root / "dist"
for required in ("index.html", "style.css", "app.mjs"):
    if not (web / required).is_file():
        raise SystemExit(f"Missing application asset: {required}")
shutil.copytree(web, dist, dirs_exist_ok=True)
print(f"Built {dist.relative_to(root)}")
