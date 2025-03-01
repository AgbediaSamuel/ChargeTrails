import base64
import requests
import os
import uuid
import json
import time
from decimal import Decimal
import boto3
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user, UserData

load_dotenv()
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this to match your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API Key
api_key = os.getenv("OPENAI_API_KEY")

# DynamoDB setup
access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
dynamodb = boto3.resource('dynamodb', region_name='us-west-2', 
                         aws_access_key_id=access_key, 
                         aws_secret_access_key=secret_key)
receipt_table = dynamodb.Table('receipts')

# Function to encode the image
@app.post("/encode_image")
async def encode_image_upload(
    file: UploadFile = File(...),
    current_user: UserData = Depends(get_current_user)
):
    try:
        # Read the file contents
        file_content = await file.read()
        
        # Encode the file to Base64
        encoded_string = base64.b64encode(file_content).decode('utf-8')
        
        # Call the function to get receipt text
        result = get_receipt_text(encoded_string)
        
        # Store the receipt in DynamoDB
        receipt_id = store_receipt_in_dynamo(result, current_user.email)
        
        # Return the processed result along with the receipt ID
        return {"receipt_id": receipt_id, "receipt_data": result}
    except Exception as e:
        return {"error": str(e)}

# Function to get the text from the receipt
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
        
        # Convert the string result to structured data
        # This assumes GPT returns a valid JSON string or dictionary-like format
        # You might need to adjust this based on actual response format
        try:
            # Try to parse as JSON if it's a string
            if isinstance(result, str):
                parsed_result = json.loads(result)
            else:
                parsed_result = result
            return parsed_result
        except json.JSONDecodeError:
            # If parsing fails, return the raw text
            return {"raw_text": result}
    
    except Exception as e:
        return {"error": f"Error calling OpenAI API: {str(e)}"}

def store_receipt_in_dynamo(receipt_data, user_email):
    try:
        # Generate a unique ID for this receipt
        receipt_id = str(uuid.uuid4())
        
        # Extract the relevant data
        products = receipt_data.get("products", [])
        metadata = receipt_data.get("metadata", {})
        
        # Convert float values to Decimal for DynamoDB
        for product in products:
            if "Price" in product:
                product["Price"] = Decimal(str(product["Price"]))
        
        total_amount = metadata.get("total amount", 0)
        if isinstance(total_amount, (int, float)):
            total_amount = Decimal(str(total_amount))
        
        # Format date if needed (assuming date is in format MM/DD/YYYY)
        purchase_date = metadata.get("date of purchase", "")
        
        # Store in DynamoDB
        receipt_table.put_item(
            Item={
                'user_email': user_email,
                'receipt_id': receipt_id,
                'date': purchase_date,
                'shop_name': metadata.get("shop name", ""),
                'location': metadata.get("location", ""),
                'total_amount': total_amount,
                'products': products,
                'timestamp': Decimal(str(int(time.time())))  # Add current timestamp
            }
        )
        
        return receipt_id
    except Exception as e:
        print(f"Error storing receipt in DynamoDB: {str(e)}")
        raise

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)