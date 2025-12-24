import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../App.css";

const Login = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            const { token, roles } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("roles", JSON.stringify([...roles]));
            localStorage.setItem("email", email);


            if (roles.includes("ADMIN")) {
                navigate("/Admin");
            } else if (roles.includes("APPROVAL_OFFICER")) {
                navigate("/ApprovalOfficer");
            } else {
                navigate("/EmployeeDashboard");
            }
        } catch (err) {
            console.error(err);
            setError("❌ Invalid email or password");
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
                        <h1 className="login-title1">Vehicle Management System</h1>
                        <h2 className="login-title">Welcome Back !</h2>
                        <p className="login-subtitle">
                            Sign In To Continue To Your Account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter Your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter Your Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <div className="error-alert">{error}</div>}

                        <button type="submit" disabled={loading} className="gradient-btn">
                            {loading ? "Signing In..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
