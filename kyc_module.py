# Backend: FastAPI KYC Service

from fastapi import FastAPI, HTTPException
import requests
from pydantic import BaseModel
import os
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Load API Keys from environment variables
PAN_API_KEY = os.getenv("PAN_API_KEY")
BANK_API_KEY = os.getenv("BANK_API_KEY")

DATABASE_URL = "postgresql://user:password@db:5432/kyc_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()


class KYCRecord(Base):
    __tablename__ = "kyc_records"
    id = Column(Integer, primary_key=True, index=True)
    pan = Column(String, unique=True, index=True)
    pan_status = Column(String)
    bank_account = Column(String)
    bank_status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


class PANRequest(BaseModel):
    pan: str


class BankRequest(BaseModel):
    account_number: str
    ifsc: str


@app.post("/kyc/verify-pan")
def verify_pan(request: PANRequest):
    response = requests.post(
        "https://api.setu.co/data/pan/verify",
        headers={"Authorization": f"Bearer {PAN_API_KEY}"},
        json={"pan": request.pan}
    )

    if response.status_code == 200:
        status = response.json().get("status", "failed")
        db = SessionLocal()
        record = KYCRecord(pan=request.pan, pan_status=status)
        db.add(record)
        db.commit()
        db.close()
        return {"status": status}
    else:
        raise HTTPException(status_code=400, detail="PAN Verification Failed")


@app.post("/kyc/verify-bank")
def verify_bank(request: BankRequest):
    response = requests.post(
        "https://api.setu.co/data/bav/reverse-penny-drop",
        headers={"Authorization": f"Bearer {BANK_API_KEY}"},
        json={"accountNumber": request.account_number, "ifsc": request.ifsc}
    )

    if response.status_code == 200:
        status = response.json().get("status", "failed")
        db = SessionLocal()
        record = db.query(KYCRecord).filter(KYCRecord.pan_status == "verified").first()
        record.bank_account = request.account_number
        record.bank_status = status
        db.commit()
        db.close()
        return {"status": status}
    else:
        raise HTTPException(status_code=400, detail="Bank Verification Failed")


@app.get("/admin/analytics")
def get_analytics():
    db = SessionLocal()
    total_attempts = db.query(KYCRecord).count()
    total_success = db.query(KYCRecord).filter(KYCRecord.pan_status == "verified", KYCRecord.bank_status == "verified").count()
    total_pan_failed = db.query(KYCRecord).filter(KYCRecord.pan_status != "verified").count()
    total_bank_failed = db.query(KYCRecord).filter(KYCRecord.bank_status != "verified").count()
    db.close()
    return {
        "total_attempts": total_attempts,
        "total_success": total_success,
        "total_pan_failed": total_pan_failed,
        "total_bank_failed": total_bank_failed
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
