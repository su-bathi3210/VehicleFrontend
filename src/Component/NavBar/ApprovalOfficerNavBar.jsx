import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";
import Logo from "../../Assets/DCDLogo.png";

export default function ApprovalOfficerNavBar() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [user] = useState(null);

    const navigate = useNavigate();

    const getInitials = (name) => {
        if (!name) return "A";
        return name
            .split(" ")
            .map((n) => n[0].toUpperCase())
            .join("")
            .slice(0, 2);
    };

    const handleUserClick = () => {
        navigate("/Login");
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

            <div className="user-profile" onClick={handleUserClick}>
                <div className="avatar-circle">
                    {getInitials(user?.username || user?.email || "Approval")}
                </div>
                <span className="username">{user?.username || "Approval Officer"}</span>
            </div>
        </div>
    );
}
