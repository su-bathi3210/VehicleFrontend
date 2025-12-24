import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaHome,
    FaPowerOff,
    FaCar,
    FaIdCard,
    FaHistory,
    FaCogs
} from "react-icons/fa";
import axios from "axios";
import "../../App.css";

const AdminSideBar = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const location = useLocation();
    const [expiredDriversCount, setExpiredDriversCount] = useState(0);
    const [expiredVehiclesCount, setExpiredVehiclesCount] = useState(0);

    const fetchCounts = async () => {
        try {
            const [driverRes, vehicleRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/drivers/count-expired`),
                axios.get(`${API_BASE_URL}/vehicles/count-expired`),
            ]);
            
            const driverCount = Number(driverRes.data) || 0;
            const vehicleCount = Number(vehicleRes.data) || 0;

            console.log("Expired driver count:", driverCount);
            console.log("Expired vehicle count:", vehicleCount);

            setExpiredDriversCount(driverCount);
            setExpiredVehiclesCount(vehicleCount);
        } catch (err) {
            console.error("Error fetching expired counts", err);
        }
    };



    useEffect(() => {
        fetchCounts();

        // Refresh counts every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { name: "Dashboard", path: "/Admin", icon: <FaHome /> },
        { name: "Assign VD", path: "/Assign", icon: <FaCogs /> },
        {
            name: "Add Vehicle",
            path: "/AddVehicle",
            icon: <FaCar />,
            badge: expiredVehiclesCount
        },
        {
            name: "Add Drivers",
            path: "/AddDrivers",
            icon: <FaIdCard />,
            badge: expiredDriversCount
        },
        { name: "Req: History", path: "/RequestHistory", icon: <FaHistory /> },
    ];

    return (
        <div className="sidebar">
            {menuItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={location.pathname === item.path ? "active" : ""}
                >
                    <span className="icon">{item.icon}</span>
                    <span className="menu-text">{item.name}</span>
                    {item.badge > 0 && (
                        <span className="badge">{item.badge}</span>
                    )}
                </Link>
            ))}

            <hr className="sidebar-divider" />
            <div className="bottom-section">
                <Link
                    to="/Login"
                    className={location.pathname === "/" ? "active" : ""}
                >
                    <span className="icon"><FaPowerOff /></span>
                    <span className="menu-text">Logout</span>
                </Link>
            </div>
        </div>
    );
};

export default AdminSideBar;