from __future__ import annotations

import os
import time
from decimal import Decimal
from typing import TYPE_CHECKING, Any, Dict, Iterable, List, Optional, Tuple

import boto3
from boto3.dynamodb.conditions import Key

try:
    from mypy_boto3_dynamodb.service_resource import Table
except Exception:
    Table = Any


def _decimalize_products(products: Iterable[dict]) -> list[dict]:
    result: list[dict] = []
    for product in products:
        item = dict(product)
        if item.get("Price") is not None:
            item["Price"] = Decimal(str(item["Price"]))
        result.append(item)
    return result


def put_receipt(
    table: Table, user_email: str, receipt_id: str, payload: Dict[str, Any]
) -> Tuple[dict, bool]:
    metadata = payload.get("metadata", {})

    products_item = _decimalize_products(payload.get("products", []))

    total_amount: Decimal | None
    if metadata.get("total_amount") is None:
        total_amount = None
    else:
        total_amount = Decimal(str(metadata.get("total_amount")))

    purchase_date = metadata.get("date_of_purchase") or time.strftime("%Y-%m-%d")
    shop_name = metadata.get("shop_name") or ""
    location = metadata.get("location") or ""

    item = {
        "user_email": user_email,
        "receipt_id": receipt_id,
        "date": purchase_date,
        "shop_name": shop_name,
        "location": location,
        "total_amount": total_amount if total_amount is not None else Decimal("0"),
        "products": products_item,
        "timestamp": Decimal(str(int(time.time()))),
    }

    try:
        response = table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(receipt_id)",
        )
        return response, False
    except table.meta.client.exceptions.ConditionalCheckFailedException:
        return {}, True


def query_recent_receipts(
    table: Table, user_email: str, limit: int = 5
) -> List[Dict[str, Any]]:

    response = table.query(
        IndexName=os.getenv("DYNAMO_DATE_INDEX", "DateIndex"),
        KeyConditionExpression=Key("user_email").eq(user_email),
        ScanIndexForward=False,
        Limit=limit,
    )

    items = response.get("Items", [])

    results: List[Dict[str, Any]] = []
    for item in items:

        if "total_amount" in item and item["total_amount"] is not None:
            item["total_amount"] = float(item["total_amount"])
        if "products" in item:
            for product in item["products"]:
                if "Price" in product and product["Price"] is not None:
                    product["Price"] = float(product["Price"])
        if "timestamp" in item:
            item["timestamp"] = float(item["timestamp"])

        results.append(item)

    return results


def query_product_names(table: Table, user_email: str) -> List[str]:
    response = table.query(KeyConditionExpression=Key("user_email").eq(user_email))
    items = response.get("Items", [])

    names = set()
    for item in items:
        for product in item.get("products", []):
            name = product.get("Name")
            if name:
                names.add(name)

    return sorted(names, key=lambda x: x.lower())


def query_receipts_paginated(
    table: Table,
    user_email: str,
    limit: int = 20,
    cursor: Optional[Dict[str, Any]] = None,
) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
    params: Dict[str, Any] = dict(
        IndexName=os.getenv("DYNAMO_DATE_INDEX", "DateIndex"),
        KeyConditionExpression=Key("user_email").eq(user_email),
        ScanIndexForward=False,
        Limit=limit,
    )
    if cursor:
        params["ExclusiveStartKey"] = cursor

    response = table.query(**params)
    items = response.get("Items", [])

    results: List[Dict[str, Any]] = []
    for item in items:
        if "total_amount" in item and item["total_amount"] is not None:
            item["total_amount"] = float(item["total_amount"])
        if "products" in item:
            for product in item["products"]:
                if "Price" in product and product["Price"] is not None:
                    product["Price"] = float(product["Price"])
        if "timestamp" in item:
            item["timestamp"] = float(item["timestamp"])
        results.append(item)

    next_cursor = response.get("LastEvaluatedKey")
    return results, next_cursor


def get_receipt(table: Table, user_email: str, receipt_id: str) -> Optional[Dict[str, Any]]:
    resp = table.get_item(
        Key={"user_email": user_email, "receipt_id": receipt_id},
        ConsistentRead=True,
    )
    item = resp.get("Item")
    if not item:
        return None
    if "total_amount" in item and item["total_amount"] is not None:
        item["total_amount"] = float(item["total_amount"])  # type: ignore[assignment]
    if "products" in item:
        for product in item["products"]:
            if "Price" in product and product["Price"] is not None:
                product["Price"] = float(product["Price"])  # type: ignore[assignment]
    if "timestamp" in item:
        item["timestamp"] = float(item["timestamp"])  # type: ignore[assignment]
    return item


def delete_receipt(table: Table, user_email: str, receipt_id: str) -> bool:
    try:
        table.delete_item(
            Key={"user_email": user_email, "receipt_id": receipt_id},
            ConditionExpression="attribute_exists(receipt_id)",
        )
        return True
    except getattr(table.meta.client.exceptions, "ConditionalCheckFailedException", Exception):
        return False


def update_receipt(
    table: Table,
    user_email: str,
    receipt_id: str,
    changes: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    resp = table.get_item(Key={"user_email": user_email, "receipt_id": receipt_id})
    item = resp.get("Item")
    if not item:
        return None

    if "shop_name" in changes:
        item["shop_name"] = changes.get("shop_name") or ""
    if "location" in changes:
        item["location"] = changes.get("location") or ""
    if "date" in changes:
        item["date"] = changes.get("date") or item.get("date")
    if "total_amount" in changes:
        val = changes.get("total_amount")
        item["total_amount"] = Decimal(str(val)) if val is not None else Decimal("0")
    if "products" in changes and isinstance(changes.get("products"), list):
        item["products"] = _decimalize_products(changes.get("products") or [])

    item["timestamp"] = Decimal(str(int(time.time())))
    table.put_item(Item=item)

    out = dict(item)
    if "total_amount" in out and out["total_amount"] is not None:
        out["total_amount"] = float(out["total_amount"])
    if "products" in out:
        for p in out["products"]:
            if "Price" in p and p["Price"] is not None:
                p["Price"] = float(p["Price"])
    if "timestamp" in out:
        out["timestamp"] = float(out["timestamp"])
    return out
