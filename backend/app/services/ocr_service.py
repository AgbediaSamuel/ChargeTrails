from __future__ import annotations

import json
import os
from typing import Any, Dict

import requests

PROMPT = (
    "You will receive a receipt image. Respond with ONLY a strict JSON object in the format: "
    '{"products": [ {"Name": str, "Category": str|nullable, "Quantity": number|nullable, "Price": number|nullable }... ], '
    '"metadata": { "total amount": number|nullable, "shop name": str|nullable, "location": str|nullable, "date of purchase": YYYY-MM-DD|nullable } }. '
    "Do not include code fences, comments, or additional text."
)


def call_openai_vision(b64_image: str) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY", "")
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"},
                    },
                ],
            }
        ],
    }

    resp = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )
    resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"]

    for candidate in (raw, raw.strip().strip("`")):
        try:
            parsed = json.loads(candidate)
            return parsed
        except json.JSONDecodeError:
            continue

    return {"raw_text": raw}


def parse_receipt_payload(data: Dict[str, Any]) -> Dict[str, Any]:

    if "raw_text" in data:
        return {"products": [], "metadata": {}}

    products = data.get("products", [])
    if not isinstance(products, list):
        products = []

    metadata_in = data.get("metadata", {}) or {}
    if not isinstance(metadata_in, dict):
        metadata_in = {}

    metadata = {
        "total_amount": metadata_in.get(
            "total amount", metadata_in.get("total_amount")
        ),
        "shop_name": metadata_in.get("shop name", metadata_in.get("shop_name")),
        "location": metadata_in.get("location"),
        "date_of_purchase": metadata_in.get(
            "date of purchase", metadata_in.get("date_of_purchase")
        ),
    }

    return {"products": products, "metadata": metadata}
