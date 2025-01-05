import os
import boto3

access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

# Create a DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-west-2', aws_access_key_id=access_key, aws_secret_access_key=secret_key)

# Create a table
table = dynamodb.create_table(
    TableName='receipts',

    KeySchema=[
        {
            'AttributeName': 'id',
            'KeyType': 'HASH'
        }
    ],

    AttributeDefinitions=[
        {
            'AttributeName': 'id',
            'AttributeType': 'N'
        }
    ],

    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)
