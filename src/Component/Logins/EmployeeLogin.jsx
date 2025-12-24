import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../App.css";

const EmployeeLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [requestId, setRequestId] = useState("");
    const [travelerName, setTravelerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/employee-login`, {
                requestId,
                travelerName,
                phoneNumber,
            });

            if (response.status === 200) {
                navigate("/RequestCancel", {
                    state: { travelerName, phoneNumber },
                });
            }
        } catch (err) {
            console.error(err);
            setError("❌ Invalid credentials or request not found.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-container login-fade-in">
                <div className="floating-shapes">
                    <div className="shape shape1"></div>
                    <div className="shape shape2"></div>
                    <div className="shape shape3"></div>
                </div>

                <div className="login-card">
                    <div className="login-header">
                        <img src="/logo.png" alt="Logo" className="login-logo" />
                        <h1 className="login-title1">Employee Vehicle Request Access</h1>
                        <h2 className="login-title">Welcome Back !</h2>
                        <p className="login-subtitle">
                            Sign In To Continue To Your Account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter Request ID"
                                value={requestId}
                                onChange={(e) => setRequestId(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter Traveler Name"
                                value={travelerName}
                                onChange={(e) => setTravelerName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>

                        {error && <div className="error-alert">{error}</div>}

                        <button type="submit" disabled={loading} className="gradient-btn">
                            {loading ? "Verifying..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployeeLogin;
