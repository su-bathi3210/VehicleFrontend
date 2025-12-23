import React, { useState } from "react";
import axios from "axios";
import "../../App.css";

const API_ROOT = "https://vehiclebackend-production-5d7c.up.railway.app/vehicle-requests";

const EmployeeLogin = () => {
    const [requestId, setRequestId] = useState("");
    const [travelerName, setTravelerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [requests, setRequests] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            // verify login using backend endpoint
            const response = await axios.post(`${API_ROOT}/employee-login`, {
                requestId,
                travelerName,
                phoneNumber,
            });

            if (response.status === 200) {
                setLoggedIn(true);
                await fetchMyRequests(travelerName, phoneNumber);
            }
        } catch (err) {
            console.error(err);
            setError("❌ Invalid credentials or request not found.");
        } finally {
            setLoading(false);
        }
    };

    // fetch employee's own requests
    const fetchMyRequests = async (traveler, phone) => {
        try {
            const res = await axios.get(
                `${API_ROOT}/my-requests?travelerName=${traveler}&phoneNumber=${phone}`
            );
            setRequests(res.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Failed to fetch your requests.");
        }
    };

    // cancel a specific request
    const handleCancel = async (reqId) => {
        const reason = prompt("Enter a reason for cancellation (optional):") || "No reason provided";

        if (!window.confirm(`Are you sure you want to cancel Request ${reqId}?`)) return;

        try {
            const res = await axios.put(`${API_ROOT}/${reqId}/cancel`, {
                travelerName,
                phoneNumber,
                reason,
            });
            alert(res.data);
            await fetchMyRequests(travelerName, phoneNumber); // refresh after cancel
        } catch (err) {
            console.error(err);
            alert("❌ Unable to cancel request. Please try again.");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case "PENDING":
                return "#ff9800";
            case "APPROVED_BY_ADMIN":
            case "APPROVED_BY_OFFICER":
                return "#2196f3";
            case "DRIVER_ASSIGNED":
                return "#3f51b5";
            case "ON_GOING_TRIP":
                return "#673ab7";
            case "COMPLETED":
                return "#4caf50";
            case "CANCELLED":
            case "REJECTED":
                return "#f44336";
            default:
                return "#9e9e9e";
        }
    };

    return (
        <div className="employee-login-page">
            {!loggedIn ? (
                <div className="login-container">
                    <h2>Employee Vehicle Request Access</h2>
                    <p>Enter your Request ID, Traveler Name, and Phone Number to view your requests.</p>

                    <form onSubmit={handleLogin} className="login-form">
                        <input
                            type="text"
                            placeholder="Enter Request ID"
                            value={requestId}
                            onChange={(e) => setRequestId(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Enter Traveler Name"
                            value={travelerName}
                            onChange={(e) => setTravelerName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Enter Phone Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />

                        {error && <div className="error-alert">{error}</div>}
                        {successMsg && <div className="success-alert">{successMsg}</div>}

                        <button type="submit" disabled={loading} className="gradient-btn">
                            {loading ? "Verifying..." : "Login"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="request-dashboard">
                    <h2>Your Vehicle Requests</h2>

                    {requests.length === 0 ? (
                        <p>No vehicle requests found for your credentials.</p>
                    ) : (
                        <table className="vehicle-requests-table">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Traveler Name</th>
                                    <th>Phone Number</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.requestId}</td>
                                        <td>{req.travelerName}</td>
                                        <td>{req.phoneNumber}</td>
                                        <td style={{ color: getStatusColor(req.status), fontWeight: "bold" }}>
                                            {req.status}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleCancel(req.requestId)}
                                                className="cancel-btn"
                                                disabled={
                                                    ["CANCELLED", "COMPLETED", "REJECTED"].includes(req.status?.toUpperCase())
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <button
                        className="gradient-btn"
                        onClick={() => {
                            setLoggedIn(false);
                            setRequestId("");
                            setTravelerName("");
                            setPhoneNumber("");
                            setRequests([]);
                        }}
                    >
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmployeeLogin;
