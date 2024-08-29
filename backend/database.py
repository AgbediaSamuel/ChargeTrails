import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from ocr import get_receipt_text, encode_image
import json
from fastapi import FastAPI

app  = FastAPI()

@app.get("/populate")
def populate_db(b64_image):
    # Initialize Firebase Admin SDK
    app = firebase_admin.initialize_app()
    db = firestore.client()

    # Function to get all documents from a collection
    doc_ref = db.collection('receipts').document('receipt_id')
    result = get_receipt_text(b64_image)
    result = json.loads(result)

    try:
        assert result is not None and type(result) == dict
        doc_ref.set(result)

    except AssertionError as e:
        print("OCR not returning a dictionary")
        print(e)

if __name__ == "__main__":
    b64_image = encode_image("receipt_testing.jpeg")
    populate_db(b64_image)
        