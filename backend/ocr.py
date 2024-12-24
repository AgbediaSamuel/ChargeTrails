import base64
import requests
import os
import uvicorn
import cv2
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

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

# Function to encode the image
@app.post("/encode_image")
async def encode_image_upload(file: UploadFile = File(...)):
    try:
        # Read the file contents
        file_content = await file.read()
        
        # Encode the file to Base64
        encoded_string = base64.b64encode(file_content).decode('utf-8')
        
        # Call the function and return its result
        result = get_receipt_text(encoded_string)
        print(result)
        print(type(result))
        return result
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
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload).json()
        # response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)

        result = response
        return {"receipt_details": result["choices"][0]["message"]["content"]}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}
    except KeyError:
        return {"error": "Unexpected response format from OpenAI API"}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
#     b64_image = encode_image("receipt_testing.jpeg")
#     result = get_receipt_text(b64_image)
#     print(result)