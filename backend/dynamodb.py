import os
import boto3
import time
from dotenv import load_dotenv

load_dotenv()

access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', aws_access_key_id=access_key, aws_secret_access_key=secret_key)

existing_tables = list(dynamodb.tables.all())
table_names = [table.name for table in existing_tables]

if 'receipts' not in table_names:
    print("Creating 'receipts' table...")
    table = dynamodb.create_table(
        TableName='receipts',
        KeySchema=[
            {
                'AttributeName': 'user_email',
                'KeyType': 'HASH'  # Partition key
            },
            {
                'AttributeName': 'receipt_id',
                'KeyType': 'RANGE'  # Sort key
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'user_email',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'receipt_id', 
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'date',
                'AttributeType': 'S'
            }
        ],
        GlobalSecondaryIndexes=[
            {
                'IndexName': 'DateIndex',
                'KeySchema': [
                    {
                        'AttributeName': 'user_email',
                        'KeyType': 'HASH'
                    },
                    {
                        'AttributeName': 'date',
                        'KeyType': 'RANGE'
                    }
                ],
                'Projection': {
                    'ProjectionType': 'ALL'
                },
                'ProvisionedThroughput': {
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 5,
            'WriteCapacityUnits': 5
        }
    )
    
    print("Waiting for table creation...")
    waiter = boto3.client('dynamodb', region_name='us-west-2', 
                         aws_access_key_id=access_key, 
                         aws_secret_access_key=secret_key).get_waiter('table_exists')
    waiter.wait(TableName='receipts')
    print("Table 'receipts' created successfully with new schema.")
else:
    print("Table 'receipts' already exists.")
