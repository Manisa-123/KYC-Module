# KYC Verification

## Description
This project verifies the PAN number of the customer and make a reverse drop penny and very the BANK account.

## Tech Used

* Backend: FastAPI, Alembic, PostgreSQL
* Frontend: React (Vite)
* Database: PostgreSQL
* Containerization: Docker
* Migrations: Alembic

## SetUP

### 1. Clone the Repository

git clone <repo-url>
cd <project-directory>

### 2.  Backend Setup

`cd backend`

`python -m venv venv`

`source venv/bin/activate`  # For Linux/Mac

`venv\Scripts\activate`  # For Windows

`pip install -r requirements.txt`

### 3. Database Setup

`alembic upgrade head`

### 4. Start FastAPI Server

`uvicorn main:app --reload`
### 5. Frontend Setup

`cd frontend`
`npm install`
`npm run dev`


### 6. Running with Docker

`docker-compose up --build`

## API Endpoints

1. GET	/kyc/get-statistics	Fetch KYC statistics
2. GET	/kyc/get_all	Fetch all KYC data
3. POST	/kyc/verify-pan	Submit KYC details
4. POST /kyc/verify-bank


