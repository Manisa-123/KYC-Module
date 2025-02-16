import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = 'http://0.0.0.0:8000';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState({});
    const [allData, setAllData] = useState([]);

    // Fetch Analytics
    const getAnalytics = async () => {
        try {
            const response = await axios.get(`${API_URL}/kyc/get-statistics`);
            console.log("Analytics Data:", response.data);
            setAnalytics(response.data || {});
        } catch (error) {
            console.error("Error fetching analytics:", error);
            setAnalytics({});
        }
    };

    // Fetch All Data
    const getAllData = async () => {
        try {
            const response = await axios.get(`${API_URL}/kyc/get_all`);
            console.log("All Data Response:", response.data);
            // Ensure the response is an array
            setAllData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching all data:", error);
            setAllData([]);
        }
    };

    useEffect(() => {
        getAnalytics();
        getAllData();
    }, []);

    return (
        <div style={styles.container}>
            <h2>Admin Dashboard</h2>

            {/* Analytics Section */}
            {Object.keys(analytics).length > 0 && (
                <div style={styles.dataContainer}>
                    <h3>Analytics</h3>
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

            {/* All Data Section */}
            {allData.length > 0 && (
                <div style={styles.dataContainer}>
                    <h3>All Data</h3>
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
        padding: "150px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        width: "80%",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)"
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

export default AdminDashboard;
