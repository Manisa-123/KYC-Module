from sqlalchemy.orm import Session
from models import KYCRecord  # Import your SQLAlchemy model
from database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
def check_pan_exists_in_db(pan: str, db: Session):
    """
    Checks if a PAN number exists in the database.

    :param pan_no: The PAN number to check.
    :param db: The database session.
    :return: True if PAN exists, otherwise False.
    """
    return db.query(KYCRecord).filter(KYCRecord.pan == pan).first()

def check_bank_account_exists_in_db(bank_account: str, db: Session):
    """
    Checks if a PAN number exists in the database.

    :param pan_no: The PAN number to check.
    :param db: The database session.
    :return: True if PAN exists, otherwise False.
    """
    return db.query(KYCRecord).filter(KYCRecord.bank_account == bank_account).first()


from sqlalchemy.orm import Session
from models import KYCRecord

def get_kyc_statistics(db: Session):
    """
    Fetch KYC statistics from the database.
    Returns a dictionary with total attempted, successful, failed, and failure reasons.
    """

    total_attempted = db.query(KYCRecord).count()
    total_successful = db.query(KYCRecord).filter(KYCRecord.kyc_status == "Comfirmed").count()
    total_failed = db.query(KYCRecord).filter(KYCRecord.kyc_status == "Pending").count()
    total_failed_due_to_pan = db.query(KYCRecord).filter(KYCRecord.kyc_status == "Pending", KYCRecord.pan_verification_failure_reason.isnot(None)).count()
    total_failed_due_to_bank = db.query(KYCRecord).filter(KYCRecord.kyc_status == "Pending", KYCRecord.banK_verification_failure_reason.isnot(None)).count()
    total_failed_due_to_both = db.query(KYCRecord).filter(
        KYCRecord.kyc_status == "Pending",
        KYCRecord.pan_verification_failure_reason.isnot(None),
        KYCRecord.banK_verification_failure_reason.isnot(None)
    ).count()

    return {
        "total_KYC_attempted": total_attempted,
        "total_KYC_successful": total_successful,
        "total_KYC_failed": total_failed,
        "total_KYC_failed_due_to_PAN": total_failed_due_to_pan,
        "total_KYC_failed_due_to_Bank_Account": total_failed_due_to_bank,
        "total_KYC_failed_due_to_PAN_and_Bank_Account": total_failed_due_to_both
    }
