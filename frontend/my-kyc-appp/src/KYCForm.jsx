import React, { useState } from "react";
import axios from "axios";

const KYCForm = () => {
    const [pan, setPan] = useState("");
    const [consent, setConsent] = useState(false);
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState(null);
    const [error, setError] = useState("");
    const [panVerified, setPanVerified] = useState(false);
    const [bankStatus, setBankStatus] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [allData, setAllData] = useState(null);

    // PAN Verification
    const verifyPAN = async () => {
        console.log("PAN Verification Clicked!");
        if (reason.length < 20) {
            setError("Reason must be at least 20 characters.");
            return;
        }
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:8000/kyc/verify-pan",
                null,
                {
                    params: {
                        pan_no: pan,
                        consent: consent,
                        reason: reason
                    }
                }
            );
            console.log("PAN Verification Response:", response.data);

            if (response.status === 200 && response.data.status === "Success") {
                setPanVerified(true);
            } else {
                setPanVerified(false);
            }

            setStatus(response.data.status || "Failed");
        } catch (error) {
            console.error("PAN Verification Error:", error.response?.data || error.message);
            setStatus("PAN Verification Failed");
            setPanVerified(false);
        }
    };

    // Bank Verification
    const verifyBank = async () => {
        console.log("Bank Verification Clicked!");
        try {
            const response = await axios.post(
                "http://localhost:8000/kyc/bank-account",
                null,
                {
                    params: { pan_no: pan }
                }
            );
            console.log("Bank Verification Response:", response.data);
            setBankStatus(response.data.status);
        } catch (error) {
            console.error("Bank Verification Error:", error.response?.data || error.message);
            setBankStatus("Bank Verification Failed");
        }
    };

    // Retry PAN Verification
    const retryPANVerification = () => {
        setStatus(null);
        setPanVerified(false);
    };

    // Retry Bank Verification
    const retryBankVerification = () => {
        setBankStatus(null);
    };

    // Fetch Analytics
    // const getAnalytics = async () => {
    //     try {
    //         const response = await axios.get("http://localhost:8000/kyc/get-statistics");
    //         console.log("Analytics Data:", response.data);
    //         setAnalytics(response.data);
    //     } catch (error) {
    //         console.error("Error fetching analytics:", error);
    //         setAnalytics("Failed to fetch analytics");
    //     }
    // };
    //
    // // Fetch All Data
    // const getAllData = async () => {
    //     try {
    //         const response = await axios.get("http://localhost:8000/kyc/get_all");
    //         console.log("All Data Response:", response.data);
    //         setAllData(response.data);
    //     } catch (error) {
    //         console.error("Error fetching all data:", error);
    //         setAllData("Failed to fetch all data");
    //     }
    // };

    return (
        <div style={styles.container}>
            <h2>KYC Verification</h2>

            <input
                type="text"
                placeholder="Enter PAN"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                style={styles.input}
            />
            <br />

            <input
                type="text"
                placeholder="Enter Reason (min 20 chars)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={styles.input}
            />
            <br />

            <label style={styles.checkboxLabel}>
                <input
                    type="checkbox"
                    checked={consent}
                    onChange={() => setConsent(!consent)}
                />
                I give my consent
            </label>
            <br />

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button
                onClick={verifyPAN}
                disabled={reason.length < 20 || !pan.trim()}
                style={{
                    ...styles.button,
                    backgroundColor: reason.length >= 20 && pan.trim() ? "blue" : "gray",
                    cursor: reason.length >= 20 && pan.trim() ? "pointer" : "not-allowed"
                }}
            >
                Verify PAN
            </button>
            <br />

            {status && <p>Status: {status}</p>}

            {status && (
                <button onClick={retryPANVerification} style={styles.retryButton}>
                    Retry PAN Verification
                </button>
            )}

            {panVerified && (
                <>
                    <h3>Bank Verification</h3>
                    <button onClick={verifyBank} style={styles.button}>
                        Verify Bank
                    </button>
                    <br />
                    {bankStatus && <p>Bank Status: {bankStatus}</p>}
                    {bankStatus && (
                        <button onClick={retryBankVerification} style={styles.retryButton}>
                            Retry Bank Verification
                        </button>
                    )}
                </>
            )}

            {/*<button onClick={getAnalytics} style={styles.button}>Get Analytics</button>*/}
            {/*<button onClick={getAllData} style={styles.button}>Get All Data</button>*/}

            {/* Display Analytics */}
            {analytics && (
                <div style={styles.dataContainer}>
                    <h3>Analytics:</h3>
                    <table style={styles.table}>
                        <tbody>
                            {Object.entries(analytics).map(([key, value]) => (
                                <tr key={key}>
                                    <td style={styles.tableCell}>{key}</td>
                                    <td style={styles.tableCell}>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Display All Data */}
            {allData && (
                <div style={styles.dataContainer}>
                    <h3>All Data:</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {Object.keys(allData[0] || {}).map((key) => (
                                    <th key={key} style={styles.tableHeader}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allData.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, i) => (
                                        <td key={i} style={styles.tableCell}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// CSS styles
const styles = {
    container: {
        textAlign: "center",
        marginTop: "50px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        width: "400px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)"
    },
    input: {
        padding: "8px",
        width: "80%",
        marginBottom: "10px"
    },
    checkboxLabel: {
        fontSize: "14px",
        marginBottom: "10px"
    },
    button: {
        padding: "10px",
        backgroundColor: "blue",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px",
        marginRight: "5px"
    },
    retryButton: {
        padding: "10px",
        backgroundColor: "red",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        marginTop: "10px"
    },
    dataContainer: {
        marginTop: "20px",
        textAlign: "left"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    tableHeader: {
        border: "1px solid black",
        padding: "5px",
        fontWeight: "bold"
    },
    tableCell: {
        border: "1px solid black",
        padding: "5px"
    }
};

export default KYCForm;
