import time

import managers

from managers import  check_pan_exists_in_db
from typing import Optional
from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
import requests
from models import KYCStatistics, KYCRecord
from managers import get_db
from sqlalchemy import and_


HEADERS = {
	"x-client-id": "5e717a41-fd89-45a0-b489-30269ca65832",
	"x-client-secret": "W05NL0SeTru0Tsk8CmHGetcFWWr1DIPr",
	"x-product-instance-id": "ef199a0b-4124-4cee-a58c-ac54cc767ee9"
}


def check_pan_exists_in_db(pan_no, db: Session):
    return managers.check_pan_exists_in_db(pan_no, db)


def update_kyc_stats(db: Session, attempted=0, successful=0, failed=0, failed_pan=0):
    """Helper function to update KYC statistics."""
    stats = db.query(KYCStatistics).first()
    if not stats:
        statss =KYCStatistics(
            total_KYC_attempted=0,
            total_KYC_successful=0,
            total_KYC_failed=0,
            total_KYC_failed_due_to_PAN=0

        )

        db.add(statss)
        db.commit()

    stats = db.query(KYCStatistics).first()
    if not stats:
        stats = KYCStatistics()
        db.add(stats)

    stats.total_KYC_attempted += attempted
    stats.total_KYC_successful += successful
    stats.total_KYC_failed += failed
    stats.total_KYC_failed_due_to_PAN += failed_pan

    db.commit()
    db.refresh(stats)


def verify_pan(
        pan_no: str,
        consent: bool,
        reason: str,
        db: Session = Depends(get_db),
):
    """Verifies the PAN number and updates KYC statistics."""

    # Track every attempt
    update_kyc_stats(db, attempted=1)


    # Validate input
    if not consent:
        update_kyc_stats(db, failed=1, failed_pan=1)
        raise HTTPException(status_code=400, detail="Consent is required")

    if len(reason) < 20:
        update_kyc_stats(db, failed=1, failed_pan=1)
        raise HTTPException(status_code=400, detail="Reason must be at least 20 characters long")

    # Check if PAN already exists
    record = db.query(KYCRecord).filter(KYCRecord.pan == pan_no).first()
    if record:
        record.pan_creation_reason = reason

    if not record:
        record = KYCRecord(
            pan=pan_no,
            pan_status="Initiated",
            created_at=datetime.utcnow(),
            kyc_status="Pending",
            pan_creation_reason=reason
        )
        db.add(record)
        db.commit()
        db.refresh(record)
	
    # API Call to verify PAN

    payload = {
        "pan": pan_no,
        "consent": 'Y' if consent else 'N',
        "reason": reason
    }
    response = requests.post("https://dg-sandbox.setu.co/api/verify/pan", headers=HEADERS, json=payload)
    response_data={}
    print(response)
    if response.status_code == 200:
        if response.text:  # Check if response is not empty
            response_data = response.json()
        else:
            raise HTTPException(status_code=500, detail="Empty response from external API")

        if response_data.get("verification") == "SUCCESS":
            update_kyc_stats(db, successful=1)
            status = "Success"
            message = response_data.get("message", "Verification successful")
        else:
            status = "Failed"
            print(1,response.text)
            message = response_data.get("message", "Verification failed")
    else:
        record.pan_status = 'Failed'
        print(2, response.text)
        update_kyc_stats(db, failed=1, failed_pan=1)
        message = response_data.get("message", "Verification failed")
        raise HTTPException(status_code=400, detail=message)



    # Update record with final verification status
    record.pan_status = status
    record.pan_verification_failure_reason = message
    db.commit()

    return {"status": status, "record_id": record.id, "message": message}


def make_mock_payment(requestId):
    headers = {
        "x-client-id": "292c6e76-dabf-49c4-8e48-90fba2916673",
        "x-client-secret": "7IZMe9zvoBBuBukLiCP7n4KLwSOy11oP",
        "x-product-instance-id": "1a0eb164-1129-46ae-b397-433f1d9ab454"
    }
    SETU_RPD_URL=f'https://dg-sandbox.setu.co/api/verify/ban/reverse/mock_payment/{requestId}'
    response = requests.post(SETU_RPD_URL, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Bank Verification Failed: Mock Payment Error")


def get_rpd_status(rpd_id):
    headers = {
        "x-client-id": "292c6e76-dabf-49c4-8e48-90fba2916673",
        "x-client-secret": "7IZMe9zvoBBuBukLiCP7n4KLwSOy11oP",
        "x-product-instance-id": "1a0eb164-1129-46ae-b397-433f1d9ab454"
    }
    SETU_GET_URL=f'https://dg-sandbox.setu.co/api/verify/ban/reverse/{rpd_id}'

    response = requests.get(SETU_GET_URL, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Bank Verification Failed: RPD Fetch Error")
    return response.json()


def update_kyc_failure(stats, reason):
    stats.total_KYC_failed += 1
    if reason == "PAN":
        stats.total_KYC_failed_due_to_PAN += 1
    elif reason == "BANK":
        stats.total_KYC_failed_due_to_Bank_Account += 1


def verify_bank(pan_no: str, account_name: str, account_no: str, ifsc_code: str, db: Session = Depends(get_db)):
    """
    Verifies the bank details using the provided PAN number.
    Fetches RPD status and updates KYCRecord in the database.
    """

    headers = {
        "x-client-id": "292c6e76-dabf-49c4-8e48-90fba2916673",
        "x-client-secret": "7IZMe9zvoBBuBukLiCP7n4KLwSOy11oP",
        "x-product-instance-id": "1a0eb164-1129-46ae-b397-433f1d9ab454"
    }
    stats = db.query(KYCStatistics).first()
    kyc_record = check_pan_exists_in_db(pan_no, db)

    kyc_record.bank_account_number=account_no
    kyc_record.bank_account_name=account_name
    kyc_record.ifsc_code=ifsc_code
    db.commit()
    print(kyc_record.bank_account_number)

    if not kyc_record or kyc_record.pan_status != "Success":
        print(kyc_record.pan_status)
        update_kyc_failure(stats, "PAN")
        db.commit()
        raise HTTPException(status_code=400, detail="Please Verify PAN number first")
    SETU_API_URL = 'https://dg-sandbox.setu.co/api/verify/ban/reverse'
    response = requests.post(SETU_API_URL, headers=headers)
    print(response)
    if response.status_code != 201:
        update_kyc_failure(stats, "BANK")
        db.commit()
        raise HTTPException(status_code=400, detail="Bank Verification API call failed")

    response_data = response.json()
    rdp_id = response_data.get("id")
    if not rdp_id:
        update_kyc_failure(stats, "BANK")
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid response from verification API")

    make_mock_payment(rdp_id)
    time.sleep(1)
    rpd_record = get_rpd_status(rdp_id)

    if not rpd_record or "status" not in rpd_record:
        update_kyc_failure(stats, "BANK")
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid RPD status response")

    if rpd_record["status"] != 'BAV_REVERSE_PENNY_DROP_PAYMENT_SUCCESSFUL':
        update_kyc_failure(stats, "BANK")
        db.commit()
        raise HTTPException(status_code=400, detail="Bank Verification Failed")

    bank_data = rpd_record.get("data", {})
    bank_account = bank_data.get("bankAccountNumber")
    ifsc = bank_data.get("bankAccountIfsc")
    bank_account_name = bank_data.get("bankAccountName")
    if not bank_account or not ifsc:
        update_kyc_failure(stats, "BANK")
        kyc_record.banK_verification_failure_reason='Missing bank account or IFSC details'
        db.commit()
        raise HTTPException(status_code=400, detail="Missing bank account or IFSC details")
    if account_no != bank_account:
        update_kyc_failure(stats, "BANK")
        kyc_record.banK_verification_failure_reason='Invalid bank account number'
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid bank account number")
    if ifsc_code and ifsc_code != ifsc:
        update_kyc_failure(stats, "BANK")
        kyc_record.banK_verification_failure_reason='Invalid IFSC code'
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid IFSC code")
    if account_name and account_name != bank_account_name:
        update_kyc_failure(stats, "BANK")
        kyc_record.banK_verification_failure_reason='Invalid bank account name'
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid bank account name")


    kyc_record.bank_status = "verified"
    kyc_record.created_at = datetime.utcnow()
    kyc_record.bank_account_number = bank_account
    kyc_record.ifsc = ifsc
    kyc_record.kyc_status = "Confirmed"
    kyc_record.bank_account_name = account_name

    stats.total_KYC_successful += 1
    db.add(stats)
    db.add(kyc_record)
    db.commit()
    db.refresh(kyc_record)

    return {"message": "Bank verification successful", "kyc_record": kyc_record.id}


def get_kyc_statistics(db: Session = Depends(get_db)):
    stats = db.query(KYCStatistics).first()
    return stats

def get_all_data(
    db: Session = Depends(get_db),
    pan: Optional[str] = Query(None),
    pan_status: Optional[str] = Query(None),
    bank_account_number: Optional[str] = Query(None),
    ifsc: Optional[str] = Query(None),
    bank_status: Optional[str] = Query(None),
    kyc_status: Optional[str] = Query(None),
    bank_account_name: Optional[str] = Query(None),

):
    query = db.query(KYCRecord)
    filters = []

    if pan is not None:
        filters.append(KYCRecord.pan == pan)
    if pan_status is not None:
        filters.append(KYCRecord.pan_status == pan_status)
    if bank_account_number is not None:
        filters.append(KYCRecord.bank_account_number == bank_account_number)
    if ifsc is not None:
        filters.append(KYCRecord.ifsc == ifsc)
    if bank_status is not None:
        filters.append(KYCRecord.bank_status == bank_status)
    if kyc_status is not None:
        filters.append(KYCRecord.kyc_status == kyc_status)
    if bank_account_name is not None:
        filters.append(KYCRecord.bank_account_name == bank_account_name)


    if filters:
        query = query.filter(and_(*filters))

    records = query.all()
    return records
