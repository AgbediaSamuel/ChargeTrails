from ocr import get_receipt_text, encode_image
import json
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Annotated
import models
from sqlalchemy.orm import Session
from testdb import engine, sessionLocal
from datetime import datetime

app  = FastAPI()
models.Base.metadata.create_all(bind=engine)

class image(BaseModel):
    b64_image: str
    user_id: int

class ReceiptBase(BaseModel):
    user_id: int
    date: str
    total_amount: int
    location_id: int
    created_at: str

class LocationBase(BaseModel):
    store_name: str
    address: str
    city: str
    state: str

class ProductReceiptBase(BaseModel):
    product_id: int
    receipt_id: int
    quantity: int
    price_per_unit: int

class ProductBase(BaseModel):
    product_name: str
    category_id: int

class CategoryBase(BaseModel):
    category_name: str

class UsersBase(BaseModel):
    username: str
    password: str
    email: str
    created_at: str

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@app.post("/upload/", status=status.HTTP_201_CREATED)
async def populate_db(image: image, db: Session = db_dependency):
    # Function to get all documents from a collection
    result = get_receipt_text(image.b64_image)
    result = json.loads(result)

    try:
        assert result is not None and type(result) == dict

        # Get the metadata
        total_amount = result['total amount']
        shop_name = result['shop name']
        location = result['location']
        date = result['date of purchase']

        # Get the products
        products = result['products']

        #Insert the location into the database
        db_location = models.Location(store_name=shop_name, address=location, city=location, state=location)
        db.add(db_location)
        db.commit()
        db.refresh(db_location)

        for product in products:
            product_name = product['Name']
            category = product['Category']
            quantity = product['Quantity']
            price = product['Price']

            #Insert the category into the database
            db_category = models.Category(category_name=category)
            db.add(db_category)
            db.commit()
            db.refresh(db_category)

            #Get the necessary id
            category_id = db_category.id

            # Insert the product data into the database
            db_product = models.Product(product_name=product_name, category_id=category_id)
            db.add(db_product)
            db.commit()
            db.refresh(db_product)

            #Get the current time
            now = datetime.now.time()

            #Insert the receipt into the database
            db_receipt = models.Receipt(user_id=image.user_id, date=date, total_amount=total_amount, location_id=db_location.id, created_at=now)
            db.add(db_receipt)
            db.commit()
            db.refresh(db_receipt)

            #Insert the product_receipt into the database
            db_product_receipt = models.ProductReceipt(product_id=db_product.id, receipt_id=db_receipt.id, quantity=quantity, price_per_unit=price)
            db.add(db_product_receipt)
            db.commit()
            db.refresh(db_product_receipt)

        
    except AssertionError as e:
        return 'OCR not returning a dictionary'

@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UsersBase, db: Session = db_dependency):
    db_user = models.Users(username=user.username, password=user.password, email=user.email, created_at=user.created_at)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/categories/", status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryBase, db: Session = db_dependency):
    db_category = models.Category(category_name=category.category_name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.post("/products/", status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductBase, db: Session = db_dependency):
    db_product = models.Product(product_name=product.product_name, category_id=product.category_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.post("/locations/", status_code=status.HTTP_201_CREATED)
async def create_location(location: LocationBase, db: Session = db_dependency):
    db_location = models.Location(store_name=location.store_name, address=location.address, city=location.city, state=location.state)
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@app.post("/receipts/", status_code=status.HTTP_201_CREATED)
async def create_receipt(receipt: ReceiptBase, db: Session = db_dependency):
    db_receipt = models.Receipt(user_id=receipt.user_id, date=receipt.date, total_amount=receipt.total_amount, location_id=receipt.location_id, created_at=receipt.created_at)
    db.add(db_receipt)
    db.commit()
    db.refresh(db_receipt)
    return db_receipt

@app.post("/product_receipt/", status_code=status.HTTP_201_CREATED)
async def create_product_receipt(product_receipt: ProductReceiptBase, db: Session = db_dependency):
    db_product_receipt = models.ProductReceipt(product_id=product_receipt.product_id, receipt_id=product_receipt.receipt_id, quantity=product_receipt.quantity, price_per_unit=product_receipt.price_per_unit)
    db.add(db_product_receipt)
    db.commit()
    db.refresh(db_product_receipt)
    return db_product_receipt

if __name__ == "__main__":
    b64_image = encode_image("receipt_testing.jpeg")
    populate_db(b64_image)
        