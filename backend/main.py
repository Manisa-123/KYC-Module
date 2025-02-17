from fastapi import Depends, HTTPException, FastAPI
from pydantic import Field
from sqlalchemy.orm import Session
import requests
from datetime import datetime

from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, engine, Base
from models import KYCRecord
import service

app = FastAPI()
Base.metadata.create_all(bind=engine)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/kyc/verify-pan")
def verify_pan(pan_no: str, consent: bool, reason: str, db: Session = Depends(get_db)):
    response = service.verify_pan(pan_no, consent, reason, db)
    return response


@app.post("/kyc/bank-account")
def verify_account(db: Session = Depends(get_db), pan_no: str = None):
    response = service.verify_bank(db=db, pan_no=pan_no)
    return response


#     }
@app.get("/kyc/get-statistics")
def get_statistics(db: Session = Depends(get_db)):
    response = service.get_kyc_statistics(db=db)
    return response


@app.get("/kyc/get_all")
def get_statistics(db: Session = Depends(get_db)):
    response = service.get_all_data(db=db)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vite frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (POST, GET, etc.)
    allow_headers=["*"],  # Allow all headers
)



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
