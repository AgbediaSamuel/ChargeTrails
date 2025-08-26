import json
import os
from typing import List


def get_cors_origins() -> List[str]:
    raw = os.getenv("CORS_ORIGINS")
    if not raw:
        return ["http://localhost:3000"]
    s = raw.strip()
    if not s:
        return ["http://localhost:3000"]
    if s.startswith("["):
        try:
            arr = json.loads(s)
            if isinstance(arr, list):
                return [str(item).strip() for item in arr if str(item).strip()]
        except Exception:
            pass
    return [item.strip() for item in s.split(",") if item.strip()]
