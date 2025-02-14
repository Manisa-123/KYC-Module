import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import KYCForm from "./KYCForm";
import AdminDashboard from "./AdminDashboard.jsx";

const App = () => {
    return (
        <Router>
            <nav style={styles.navbar}>
                <Link to="/" style={styles.link}>KYC Form</Link>
                <Link to="/admin" style={styles.link}>Admin Dashboard</Link>
            </nav>
            <Routes>
                <Route path="/" element={<KYCForm />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
};

const styles = {
    navbar: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        padding: "10px",
        backgroundColor: "#333",
    },
    link: {
        color: "white",
        textDecoration: "none",
        fontSize: "18px"
    }
};

export default App;
