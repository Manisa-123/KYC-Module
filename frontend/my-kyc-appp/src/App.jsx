import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import KYCForm from "./KYCForm";
import AdminDashboard from "./AdminDashboard.jsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<KYCForm />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;