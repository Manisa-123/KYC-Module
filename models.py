from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from database import Base


class KYCRecord(Base):
    __tablename__ = "kyc_records"

    id = Column(Integer, primary_key=True, index=True)
    pan = Column(String, index=True, nullable=True)
    pan_status = Column(String, nullable=False)
    bank_account_number = Column(String, nullable=True)
    ifsc = Column(String, nullable=True)
    bank_status = Column(String, nullable=True)
    kyc_status = Column(String, nullable=False)
    pan_verification_failure_reason = Column(String, nullable=True)
    banK_verification_failure_reason = Column(String, nullable=True)
    pan_creation_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    bank_account_name = Column(String, nullable=True)


class KYCStatistics(Base):
    __tablename__ = "kyc_statistics"

    id = Column(Integer, primary_key=True, index=True)
    total_KYC_attempted = Column(Integer, default=0)
    total_KYC_successful = Column(Integer, default=0)
    total_KYC_failed = Column(Integer, default=0)
    total_KYC_failed_due_to_PAN = Column(Integer, default=0)
    total_KYC_failed_due_to_Bank_Account = Column(Integer, default=0)
    total_KYC_failed_due_to_PAN_and_Bank_Account = Column(Integer, default=0)
