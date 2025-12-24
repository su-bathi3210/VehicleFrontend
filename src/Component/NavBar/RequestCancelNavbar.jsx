import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";
import Logo from "../../Assets/DCDLogo.png";

export default function RequestCancelNavbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const { travelerName } =
        location.state || JSON.parse(localStorage.getItem("employeeData")) || {};

    useEffect(() => {
        if (travelerName) {
            localStorage.setItem(
                "employeeData",
                JSON.stringify({ travelerName })
            );
        }
    }, [travelerName]);

    const getInitials = (name) => {
        if (!name) return "E";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem("employeeData");
        navigate("/EmployeeLogin");
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

            <div className="user-profile" onClick={handleLogout}>
                <div className="avatar-circle">{getInitials(travelerName)}</div>
                <span className="username">{travelerName || "Employee"}</span>
            </div>
        </div>
    );
}
