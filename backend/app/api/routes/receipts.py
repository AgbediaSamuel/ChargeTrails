from __future__ import annotations

import base64
import hashlib
from typing import Tuple

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from backend.app.db.dynamo import get_receipts_table
from backend.app.deps.auth import UserData, get_current_user
from backend.app.repositories.receipts import (
    put_receipt,
    query_receipts_paginated,
    query_recent_receipts,
    get_receipt,
    delete_receipt,
    update_receipt,
)
from backend.app.services.ocr_service import call_openai_vision, parse_receipt_payload

router = APIRouter()


def _generate_receipt_id(*args) -> str:
    parameters = [str(arg).strip().lower() for arg in args if arg is not None]
    fingerprint = ("|").join(sorted(parameters))
    return hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()[:16]


@router.post("/encode_image")
async def encode_image_upload(
    file: UploadFile = File(...),
    current_user: UserData = Depends(get_current_user),
):
    try:
        file_content = await file.read()
        encoded_string = base64.b64encode(file_content).decode("utf-8")

        raw = call_openai_vision(encoded_string)
        payload = parse_receipt_payload(raw)

        metadata = payload["metadata"]
        receipt_id = _generate_receipt_id(
            metadata.get("shop_name"),
            metadata.get("location"),
            metadata.get("total_amount"),
            metadata.get("date_of_purchase"),
            current_user.email,
        )

        table = get_receipts_table()
        response, duplicate = put_receipt(
            table, current_user.email, receipt_id, payload
        )

        if duplicate:
            return {"message": "Receipt already exists!"}
        if (
            response
            and response.get("ResponseMetadata", {}).get("HTTPStatusCode") == 200
        ):
            return {"message": "Receipt stored successfully"}
        return {"message": "Failed to store receipt"}
    except HTTPException:
        raise
    except Exception as exc:
        return {"error": str(exc)}


@router.get("/retrieve_receipts")
async def retrieve_receipts(
    current_user: UserData = Depends(get_current_user),
):
    try:
        table = get_receipts_table()
        receipts = query_recent_receipts(table, current_user.email, limit=5)
        return {"receipts": receipts}
    except Exception as exc:
        return {"receipts": []}


@router.get("/receipts")
async def list_receipts(
    current_user: UserData = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None, description="Opaque pagination cursor"),
):
    try:
        table = get_receipts_table()
        from_base = None
        if cursor:
            import json

            from_base = json.loads(cursor)
        receipts, next_cursor = query_receipts_paginated(
            table, current_user.email, limit=limit, cursor=from_base
        )
        next_token = None
        if next_cursor:
            import json

            next_token = json.dumps(next_cursor)
        return {"receipts": receipts, "next_cursor": next_token}
    except Exception:
        return {"receipts": [], "next_cursor": None}


@router.get("/receipts/{receipt_id}")
async def get_receipt_detail(
    receipt_id: str,
    current_user: UserData = Depends(get_current_user),
):
    try:
        table = get_receipts_table()
        item = get_receipt(table, current_user.email, receipt_id)
        if not item:
            from fastapi import HTTPException as _HTTPException

            raise _HTTPException(status_code=404, detail="Receipt not found")
        return {"receipt": item}
    except HTTPException:
        raise
    except Exception as exc:
        return {"error": str(exc)}


@router.delete("/receipts/{receipt_id}")
async def delete_receipt_route(
    receipt_id: str,
    current_user: UserData = Depends(get_current_user),
):
    try:
        table = get_receipts_table()
        ok = delete_receipt(table, current_user.email, receipt_id)
        if not ok:
            from fastapi import HTTPException as _HTTPException

            raise _HTTPException(status_code=404, detail="Receipt not found")
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as exc:
        return {"error": str(exc)}


@router.patch("/receipts/{receipt_id}")
async def patch_receipt(
    receipt_id: str,
    payload: dict,
    current_user: UserData = Depends(get_current_user),
):
    try:
        table = get_receipts_table()
        allowed = {k: v for k, v in payload.items() if k in {"shop_name", "location", "date", "total_amount", "products"}}
        updated = update_receipt(table, current_user.email, receipt_id, allowed)
        if updated is None:
            from fastapi import HTTPException as _HTTPException

            raise _HTTPException(status_code=404, detail="Receipt not found")
        return {"receipt": updated}
    except HTTPException:
        raise
    except Exception as exc:
        return {"error": str(exc)}
