import sys
import os
from pathlib import Path

# Ensure project root is in sys.path even when running from inside backend/
ROOT = Path(__file__).resolve().parent.parent

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.chdir(ROOT)

if __name__ == "__main__":
    import uvicorn
    print(f"[Backend Server] Starting from project root: {ROOT}")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
