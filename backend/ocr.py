import base64
import requests
import os
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()
app = FastAPI()

# OpenAI API Key
api_key = os.getenv("OPENAI_API_KEY")

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


@app.get("/receipt")
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
            "text": "You have been provided a receipt. Your response should return a dictionary with the following details for each product {Name, Category, Quantity, Price}. Additionally, provide the total amount, shop name, location, and date of purchase as metadata. Don't include json or any other comments in your response."
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

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload).json()
    result = response['choices'][0]['message']['content']
    return {'result' : result}