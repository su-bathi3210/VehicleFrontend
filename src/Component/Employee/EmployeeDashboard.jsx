import React, { useState, useEffect } from "react";
import EmployeeNavBar from "../NavBar/EmployeeNavBar";
import VehicleRequestForm from "./VehicleRequestForm";
import { Link } from "react-router-dom";
import "../../App.css";

const EmployeeDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => setFadeOut(true), 2500);

        const timer = setTimeout(() => setLoading(false), 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(fadeTimer);
        };
    }, []);

    if (loading) {
        return (
            <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
                <img src="/logo.png" alt="Logo" className="splash-logo" />
            </div>
        );
    }

    return (
        <>
            <EmployeeNavBar />
            <div className="dashboard-container">
                <h1 className="dashboard-title">Vehicle Management Information System</h1>
                <p className="dashboard-subtitle">
                    Welcome to the Vehicle Management Information System. As an employee, you can easily submit and manage
                    vehicle requests for official duties. This system helps streamline the process
                    of allocating vehicles, ensuring transparency, efficiency, and timely approvals
                    within your department. <Link to="/EmployeeLogin" className="request-link"> You can also view or cancel your submitted requests here <span className="arrow-up"></span></Link>
                </p>
                <VehicleRequestForm />
            </div>
        </>
    );
};

export default EmployeeDashboard;
