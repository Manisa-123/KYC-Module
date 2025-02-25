from fastapi import Depends, HTTPException, FastAPI
from pydantic import Field
from sqlalchemy.orm import Session
import requests
from datetime import datetime
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from managers import get_db
from database import SessionLocal, engine, Base
from models import KYCRecord
import service

app = FastAPI()
Base.metadata.create_all(bind=engine)

# Dependency to get the database session


@app.post("/kyc/verify-pan")
def verify_pan(pan_no: str, consent: bool, reason: str, db: Session = Depends(get_db)):
    response = service.verify_pan(pan_no, consent, reason, db)
    return response


@app.post("/kyc/bank-account")
def verify_account( pan_no: str,account_no: str, bank_account_name: str=None, ifsc_code: str=None,  db: Session = Depends(get_db)):
    response = service.verify_bank(db=db, pan_no=pan_no, account_name=bank_account_name, ifsc_code=ifsc_code, account_no=account_no)
    return response


#     }
@app.get("/kyc/get-statistics")
def get_statistics(db: Session = Depends(get_db)):
    response = service.get_kyc_statistics(db=db)
    return response


@app.get("/kyc/get_all")
def get_statistics(db: Session = Depends(get_db),
    pan: Optional[str] = None,
    pan_status: Optional[str] = None,
    bank_account_number: Optional[str] = None,
    ifsc_code: Optional[str] = None,
    bank_status: Optional[str] = None,
    kyc_status: Optional[str] = None,
    bank_account_name: Optional[str] = None,
    ):
    response = service.get_all_data(db=db,
                                    pan=pan,
    pan_status=pan_status,
    bank_account_number=bank_account_number,
    ifsc=ifsc_code,
    bank_status=bank_status,
    kyc_status=kyc_status,
    bank_account_name=bank_account_name,

                                    )
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
