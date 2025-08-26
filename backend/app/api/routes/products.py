from __future__ import annotations

from fastapi import APIRouter, Depends

from backend.app.db.dynamo import get_receipts_table
from backend.app.deps.auth import UserData, get_current_user
from backend.app.repositories.receipts import query_product_names

router = APIRouter()


@router.get("/user_products")
async def get_user_products(
    current_user: UserData = Depends(get_current_user),
):
    try:
        table = get_receipts_table()
        products = query_product_names(table, current_user.email)
        return {"products": products}
    except Exception:
        return {"products": []}
