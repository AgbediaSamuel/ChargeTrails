from __future__ import annotations

import os
from typing import Any

import boto3
from boto3.resources.base import ServiceResource
from dotenv import load_dotenv

try:
    from mypy_boto3_dynamodb.service_resource import Table
except Exception:
    Table = Any


load_dotenv()


def create_dynamo_resource() -> ServiceResource:
    return boto3.resource(
        "dynamodb",
        region_name=os.getenv("AWS_REGION", "us-west-2"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


def get_receipts_table(resource: ServiceResource | None = None) -> Table:
    dynamodb = resource or create_dynamo_resource()
    return dynamodb.Table(os.getenv("DYNAMO_TABLE_NAME", "receipts"))
