import base64
import requests
import os
import json
import hashlib
import time
from decimal import Decimal
from datetime import datetime
import boto3
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user, UserData

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("OPENAI_API_KEY")

access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
dynamodb = boto3.resource('dynamodb', region_name='us-west-2', 
                         aws_access_key_id=access_key, 
                         aws_secret_access_key=secret_key)
receipt_table = dynamodb.Table('receipts')

@app.post("/encode_image")
async def encode_image_upload(
    file: UploadFile = File(...),
    current_user: UserData = Depends(get_current_user)
):
    try:
        file_content = await file.read()
        encoded_string = base64.b64encode(file_content).decode('utf-8')
        result = get_receipt_text(encoded_string)
        storing_response, duplicate_check = store_receipt_in_dynamo(result, current_user.email)
        
        if duplicate_check:
            return {"message": "Receipt already exists!"}
        elif storing_response and storing_response['ResponseMetadata']['HTTPStatusCode'] == 200:
            return {"message": "Receipt stored successfully"}
        else:
            return {"message": "Failed to store receipt"}
    except Exception as e:
        return {"error": str(e)}

def get_receipt_text(b64_image):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "You have been provided a receipt. Your response should return a dictionary with the following details for each product {Name, Category, Quantity, Price}. Additionally, provide {total amount, shop name, location, and date of purchase} as metadata. Don't include json or any other comments in your response."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    try:
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()['choices'][0]['message']['content']
        
        try:
            if isinstance(result, str):
                parsed_result = json.loads(result)
            else:
                parsed_result = result
            return parsed_result
        except json.JSONDecodeError:
            return {"raw_text": result}
    
    except Exception as e:
        return {"error": f"Error calling OpenAI API: {str(e)}"}

def generate_receipt_id(*args):
    parameters = [str(arg).strip().lower() for arg in args if arg is not None]
    fingerprint = ('|').join(sorted(parameters))
    receipt_id = hashlib.sha256(fingerprint.encode('utf-8')).hexdigest()[:16]
    return receipt_id


def store_receipt_in_dynamo(receipt_data, user_email):
    try:
        products = receipt_data.get("products", [])
        metadata = receipt_data.get("metadata", {})
        
        for product in products:
            if "Price" in product:
                product["Price"] = Decimal(str(product["Price"]))
        
        total_amount = metadata.get("total amount", 0)
        if isinstance(total_amount, (int, float)):
            total_amount = Decimal(str(total_amount))
        
        purchase_date = metadata.get("date of purchase", "")
        if not purchase_date:  
            purchase_date = datetime.now().strftime("%Y-%m-%d")

        shop_name = metadata.get("shop name", "")
        location = metadata.get("location", "")
        receipt_id = generate_receipt_id(shop_name, location, total_amount, purchase_date, user_email)
        
        try: 
            response = receipt_table.put_item(
                Item={
                    'user_email': user_email,
                    'receipt_id': receipt_id,
                    'date': purchase_date,
                    'shop_name': shop_name,
                    'location': location,
                    'total_amount': total_amount,
                    'products': products,
                    'timestamp': Decimal(str(int(time.time())))
                },
                ConditionExpression ='attribute_not_exists(receipt_id)'
            )
            
            return (response, False)
        except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
            response = None
            return (response, True)
    except Exception as e:
        print(f"Error storing receipt in DynamoDB: {str(e)}")
        raise

@app.get('/retrieve_receipts')
def retrieve(
    current_user: UserData = Depends(get_current_user)
):
    try:
        response = receipt_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('user_email').eq(current_user.email),
            ScanIndexForward = False,
            Limit = 5
        )    

        items = response.get('Items', [])

        for item in items:
            if 'total_amount' in item:
                item['total_amount'] = float(item['total_amount'])
            if 'products' in item:
                for product in item['products']:
                    if 'Price' in product:
                        product['Price'] = float(product['Price'])
            if 'timestamp' in item:
                item['timestamp'] = float(item['timestamp'])
                
        return {"receipts": items}
        
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)