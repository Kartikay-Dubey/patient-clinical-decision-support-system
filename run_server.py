import sys
import os
from pathlib import Path

# Ensure project root is in sys.path
ROOT = Path(__file__).resolve().parent
if ROOT.name == "backend":
    ROOT = ROOT.parent

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.chdir(ROOT)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    is_reload = os.environ.get("RENDER") is None and os.environ.get("ENV") != "production"
    print(f"[Backend Server] Starting CDSS API on {host}:{port} (root: {ROOT})")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=is_reload)

