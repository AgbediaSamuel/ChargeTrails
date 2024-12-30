# Backend for ChargeTrails

The backend of **ChargeTrails** is designed to handle data extraction, storage, and API management for the application. It processes receipt data uploaded by users and structures it into a database for further analysis and tracking.

---

## Key Components

### Current Structure
- **`database.py`**:
  - Contains Pydantic models for data validation.
  - Includes endpoints to populate the database whenever new data is uploaded.

- **`models.py`**:
  - Defines the schema of the database.
  - Originally structured for an SQL-based database.

- **`ocr.py`**:
  - Handles optical character recognition (OCR) for extracting data from uploaded receipts using OpenAI's vision model.

---

## Transition to NoSQL with DynamoDB and GraphQL

As **ChargeTrails** evolves, the need for a NoSQL database arises due to the nested and flexible nature of data extracted from receipts (e.g., hierarchical structures similar to JavaScript objects). The plan involves migrating from a traditional SQL database to **DynamoDB**, coupled with **GraphQL** for API management.

### Why NoSQL?
- **Flexible Schema**: Receipt data varies in structure, making NoSQL databases a better fit for storing nested documents.
- **Scalability**: DynamoDB provides seamless scaling for varying data loads.
- **Efficiency**: Storing data as hierarchical documents reduces the need for complex joins.

### Why GraphQL?
- **Efficient Data Fetching**: Allows clients to request exactly the data they need.
- **Nested Data Handling**: Works well with the hierarchical nature of data stored in DynamoDB.
- **Real-Time Updates**: Enhances user experience by enabling real-time synchronization between the database and the app.


This product is still being actively developed!
