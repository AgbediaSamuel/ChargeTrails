from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from testdb import Base

class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True)
    product_name = Column(String(50))
    category_id = Column(Integer, ForeignKey('categories.id'))

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    category_name = Column(String(50))

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50))
    password = Column(String(50))
    email = Column(String(50))
    created_at = Column(String(50))

class Receipt(Base):
    __tablename__ = 'receipts'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    date = Column(String(50))
    total_amount = Column(Integer)
    location_id = Column(Integer, ForeignKey('locations.id'))
    created_at = Column(String(50))

class Location(Base):
    __tablename__ = 'locations'
    id = Column(Integer, primary_key=True)
    store_name = Column(String(50))
    address = Column(String(50))
    city = Column(String(50))
    state = Column(String(50))

class ProductReceipt(Base):
    __tablename__ = 'product_receipt'
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'))
    receipt_id = Column(Integer, ForeignKey('receipts.id'))
    quantity = Column(Integer)
    price_per_unit = Column(Integer)
    total_price = price_per_unit * quantity