import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://13.200.68.58:8000";

const KYCForm = () => {
    const [pan, setPan] = useState("");
    const [consent, setConsent] = useState(false);
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState(null);
    const [error, setError] = useState("");
    const [panVerified, setPanVerified] = useState(false);
    const [ifscCode, setIfscCode] = useState("");
    const [bankAccountNo, setBankAccountNo] = useState("");
    const [bankAccountHolder, setBankAccountHolder] = useState("");
    const [bankStatus, setBankStatus] = useState(null);
    const [bankMessage, setBankMessage] = useState(null); // Added bankMessage state

    const verifyPAN = async () => {
        if (reason.length < 20) {
            setError("Reason must be at least 20 characters.");
            return;
        }
        setError("");

        try {
            const response = await axios.post(
                `${API_URL}/kyc/verify-pan`,
                null,
                {
                    params: { pan_no: pan, consent, reason },
                    headers: { "Content-Type": "application/json" }
                }
            );

            const { status, message } = response.data;

            if (response.status === 200 && status === "Success") {
                setPanVerified(true);
                setStatus(status);
                setError(message); // Store message as error for display
            } else {
                setPanVerified(false);
                setStatus(status);
                setError(message); // Store message as error for display
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setStatus("Failed");
                setError(error.response.data.message || error.response.data.detail || "Bad Request");
                setPanVerified(false);
            } else {
                setStatus("PAN Verification Failed");
                setError(error.response?.data?.message || "Unknown error");
                setPanVerified(false);
            }
        }
    };

    const verifyBank = async () => {
        if (!bankAccountNo.trim()) {
            setBankStatus("Bank Account Number is required.");
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/kyc/bank-account`,
                null,
                {
                    params: {
                        pan_no: pan,
                        ifsc_code: ifscCode || null,
                        account_no: bankAccountNo,
                        bank_account_name: bankAccountHolder || null
                    }
                }
            );

            if (response.status === 200) {
                setBankStatus("Success");
                setBankMessage("Bank verified successfully");
            } else {
                setBankStatus("Failed");
                setBankMessage(response.data.status || "Bank Verification Failed");
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setBankStatus("Failed");
                setBankMessage(error.response.data.detail || error.response.data.message || "Bad Request");
            } else {
                setBankStatus("Bank Verification Failed");
                setBankMessage(error.response?.data?.message || "Unknown error");
            }
        }
    };

    const retryPANVerification = () => {
        setStatus(null);
        setError("");
        setPanVerified(false);
    };

    const retryBankVerification = () => {
        setBankStatus(null);
        setBankMessage(null);
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>KYC Verification</h2>

            <input type="text" placeholder="Enter PAN" value={pan} onChange={(e) => setPan(e.target.value)} style={styles.input} />
            <input type="text" placeholder="Enter Reason (min 20 chars)" value={reason} onChange={(e) => setReason(e.target.value)} style={styles.input} />

            <label style={styles.consentLabel}>
                <input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} style={styles.consentCheckbox} />
                I give my consent
            </label>

            {error && <p style={styles.error}>{error}</p>}

            <button
                onClick={verifyPAN}
                disabled={reason.length < 20 || !pan.trim() || !consent}
                style={{
                    ...styles.button,
                    backgroundColor: reason.length >= 20 && pan.trim() && consent ? "#4CAF50" : "#cccccc",
                    cursor: reason.length >= 20 && pan.trim() && consent ? "pointer" : "not-allowed"
                }}
            >
                Verify PAN
            </button>

            {status && (
                <>
                    <p style={styles.status}>Status: {status}</p>
                    {error && <p style={styles.status}>Reason: {error}</p>}
                </>
            )}

            {status && <button onClick={retryPANVerification} style={styles.retryButton}>Retry PAN Verification</button>}

            {panVerified && (
                <div style={styles.bankVerification}>
                    <h3 style={styles.bankTitle}>Bank Verification</h3>
                    <input type="text" placeholder="Bank Account Number (Required)" value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} style={styles.input} />
                    <input type="text" placeholder="IFSC Code (Optional)" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} style={styles.input} />
                    <input type="text" placeholder="Account Holder Name (Optional)" value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)} style={styles.input} />
                    <button onClick={verifyBank} style={styles.button}>Verify Bank</button>
                    {bankStatus && (
                        <>
                            <p style={styles.bankStatus}>Status: {bankStatus}</p>
                            {bankMessage && <p style={styles.bankStatus}>Reason: {bankMessage}</p>}
                        </>
                    )}placeholder=
                    {bankStatus && <button onClick={retryBankVerification} style={styles.retryButton}>Retry Bank Verification</button>}
                </div>
            )}
        </div>
    );
};

const styles = {
  container: {
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    width: "400px",
    maxWidth: "90%",
    boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff8e1",
    marginTop: "30px", // Added top margin
    marginBottom: "30px", // Added bottom margin
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#3f51b5",
  },
  input: {
    padding: "10px",
    width: "90%",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    backgroundColor: "#ffffff",
    color: "#333",
  },
  consentLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15px",
    fontSize: "16px",
    color: "#333",
  },
  consentCheckbox: {
    marginRight: "8px",
    transform: "scale(1.1)",
  },
  error: {
    color: "#d32f2f",
    marginBottom: "10px",
    fontSize: "14px",
  },
  button: {
    padding: "12px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "15px",
  },
  status: {
    marginTop: "15px",
    fontSize: "16px",
    color: "#2e7d32",
  },
  retryButton: {
    padding: "10px 18px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "12px",
    display: "block", // Make it a block-level element
    margin: "12px auto", // Center horizontally
  },
  bankVerification: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    backgroundColor: "#f0f8ff",
  },
  bankTitle: {
    fontSize: "20px",
    marginBottom: "15px",
    color: "#1976d2",
  },
  bankStatus: {
    marginTop: "15px",
    fontSize: "16px",
    color: "#1565c0",
  },
};
export default KYCForm;