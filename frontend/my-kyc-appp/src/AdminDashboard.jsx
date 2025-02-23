import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Legend, Tooltip, CategoryScale, LinearScale, BarElement } from 'chart.js';
import Popup from "./popup"; // Corrected import path

Chart.register(ArcElement, Legend, Tooltip, CategoryScale, LinearScale, BarElement);

const API_URL = 'http://13.200.68.58:8000';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState({});
    const [allData, setAllData] = useState([]);
    const [filters, setFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [popupData, setPopupData] = useState(null); // Use popupData to store data for the popup

    const getAnalytics = async () => {
        try {
            const response = await axios.get(`${API_URL}/kyc/get-statistics`);
            setAnalytics(response.data || {});
        } catch (error) {
            console.error("Error fetching analytics:", error);
            setAnalytics({});
        }
    };

    const getAllData = async () => {
        try {
            const params = new URLSearchParams(filters);
            const response = await axios.get(`${API_URL}/kyc/get_all?${params.toString()}`);
            setAllData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching all data:", error);
            setAllData([]);
        }
    };

    useEffect(() => {
        getAnalytics();
        getAllData();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleShowPopup = (data) => {
        setPopupData(data);
    };

    const handleClosePopup = () => {
        setPopupData(null);
    };

    const chartData = {
        labels: Object.keys(analytics),
        datasets: [{
            data: Object.values(analytics),
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)'
            ],
            borderWidth: 1,
        }]
    };

    return (
        <>
            <div style={styles.container}>
                <h2 style={styles.title}>Admin Dashboard</h2>

                <button onClick={toggleFilters} style={styles.filterButton}>
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </button>

                {showFilters && (
                    <div style={styles.filterContainer}>
                        <input type="text" name="pan" placeholder="PAN" onChange={handleFilterChange} style={styles.filterInput} />
                        <input type="text" name="pan_status" placeholder="PAN Status" onChange={handleFilterChange} style={styles.filterInput} />
                        <input type="text" name="bank_account_number" placeholder="Bank Account Number" onChange={handleFilterChange} style={styles.filterInput} />
                        <input type="text" name="ifsc" placeholder="IFSC" onChange={handleFilterChange} style={styles.filterInput} />
                        <input type="text" name="bank_status" placeholder="Bank Status" onChange={handleFilterChange} style={styles.filterInput} />
                        <input type="text" name="kyc_status" placeholder="KYC Status" onChange={handleFilterChange} style={styles.filterInput} />
                        <input type="text" name="bank_account_name" placeholder="Bank Account Name" onChange={handleFilterChange} style={styles.filterInput} />
                    </div>
                )}

                {Object.keys(analytics).length > 0 && (
                    <div style={styles.dataContainer}>
                        <h3 style={styles.sectionTitle}>Analytics</h3>
                        <div style={{ width: '400px', margin: '0 auto' }}>
                            <Pie data={chartData} />
                        </div>
                    </div>
                )}

                {allData.length > 0 && (
                    <div style={styles.dataContainer}>
                        <h3 style={styles.sectionTitle}>KYC Requests Received</h3>
                        <div style={styles.gridContainer}>
                            {allData.map((row, index) => {
                                const { id, created_at, ...rest } = row;
                                const backgroundColor = index % 2 === 0 ? '#e0f7fa' : '#f0f4c3';
                                const textColor = '#333';

                                return (
                                    <div
                                        key={index}
                                        style={{ ...styles.dataCell, backgroundColor: backgroundColor, color: textColor, cursor: 'pointer' }}
                                        onClick={() => handleShowPopup(row)} // Pass the entire row for the popup
                                    >
                                        <div style={styles.dataItem}>
                                            <strong style={styles.dataKey}>PAN No:</strong> {row.pan}
                                        </div>
                                        <div style={styles.dataItem}>
                                            <strong style={styles.dataKey}>PAN Status:</strong> {row.pan_status}
                                        </div>
                                        <div style={styles.dataItem}>
                                            <strong style={styles.dataKey}>KYC Status:</strong> {row.kyc_status}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {popupData && (
                <Popup
                    title="Data Details"
                    data={popupData}
                    onClose={handleClosePopup}
                />
            )}
        </>
    );
};

const styles = {
    container: {
        textAlign: "center",
        padding: "30px",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        width: "30000%",
        maxWidth: "1900px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.08)",
        backgroundColor: '#f9f9f9',
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    title: {
        fontSize: "28px",
        marginBottom: "20px",
        color: '#3f51b5',
    },
    sectionTitle: {
        fontSize: "24px",
        marginBottom: "15px",
        color: '#2196f3',
    },
    dataContainer: {
        marginTop: "30px",
        textAlign: "left",
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 400px)',
        gap: '20px',
        marginTop: '20px',
        justifyContent: 'center',
    },
    dataCell: {
        border: '1px solid #e0e0e0',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
    },
    dataItem: {
        marginBottom: '10px',
    },
    dataKey: {
        color: '#1976d2',
    },
    filterButton: {
        padding: "10px 15px",
        marginBottom: "20px",
        cursor: "pointer",
        backgroundColor: "#2196f3",
        color: "white",
        border: "none",
        borderRadius: "5px",
    },
    filterContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "20px",
    },
    filterInput: {
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "5px",
    },
};

export default AdminDashboard;