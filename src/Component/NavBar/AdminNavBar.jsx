import React, { useState, useEffect } from "react";
import "../../App.css";
import Logo from "../../Assets/DCDLogo.png";
import { FaBell } from "react-icons/fa";

export default function AdminNavBar() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const ADMIN_EMAIL = "ksuba3210@gmail.com";
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const getInitials = (name) => {
        if (!name) return "A";
        return name
            .split(" ")
            .map((n) => n[0].toUpperCase())
            .join("")
            .slice(0, 2);
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/notifications/${ADMIN_EMAIL}`);
            if (res.ok) {
                const data = await res.json();
                console.log("📩 Notifications:", data);
                setNotifications(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("❌ Error fetching notifications", err);
            setNotifications([]);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) setUser(storedUser);
        }

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) fetchNotifications();
    };

    const getNotificationId = (n) => n.id;

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/notifications/read/${id}`, { method: "PUT" });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("❌ Error marking notification as read", err);
        }
    };

    return (
        <div className="header">
            <div className="header-left">
                <img src={Logo} alt="Left Logo" className="logo" />
                <div>
                    <h1>Department of Cooperative Development - Sri Lanka</h1>
                    <p>Central Province</p>
                </div>
            </div>

            <div className="header-right-notification">
                <div className="notification-wrapper">
                    <FaBell
                        size={23}
                        onClick={handleBellClick}
                        className="notification-bell"
                    />
                    {notifications.length > 0 && (
                        <span className="notification-badge">
                            {notifications.length > 99 ? "99+" : notifications.length}
                        </span>
                    )}

                    {showNotifications && (
                        <div className="notification-dropdown">
                            {notifications.length === 0 ? (
                                <p className="no-notifications">No new notifications</p>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={getNotificationId(n)}
                                        className="notification-item"
                                        onClick={() => markAsRead(getNotificationId(n))}
                                    >
                                        <p>{n.message}</p>
                                        <span className="timestamp">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div
                    className="user-profile"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    <div className="avatar-circle">
                        {getInitials(user?.username || user?.email || "Admin")}
                    </div>
                    <span className="username">
                        {user?.username || "Admin"}
                    </span>
                </div>
            </div>
        </div>
    );
}
