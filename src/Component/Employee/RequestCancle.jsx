import React, { useEffect, useState } from "react";
import axios from "axios";
import RequestCancelNavbar from "../NavBar/RequestCancelNavbar";
import { useLocation, useNavigate } from "react-router-dom";
import "../../App.css";

const RequestCancel = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const location = useLocation();
    const navigate = useNavigate();
    const { travelerName, phoneNumber } = location.state || {};

    const [requests, setRequests] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!travelerName || !phoneNumber) {
            navigate("/EmployeeLogin");
            return;
        }
        fetchMyRequests();
    }, [travelerName, phoneNumber, navigate]);

    const fetchMyRequests = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/my-requests?travelerName=${travelerName}&phoneNumber=${phoneNumber}`
            );
            setRequests(res.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Failed to fetch your requests.");
        }
    };

    const handleCancel = async (reqId) => {
        const reason = prompt("Enter a reason for cancellation (optional):") || "No reason provided";
        if (!window.confirm(`Are you sure you want to cancel Request ${reqId}?`)) return;

        try {
            const res = await axios.put(`${API_BASE_URL}/${reqId}/cancel`, {
                travelerName,
                phoneNumber,
                reason,
            });
            alert(res.data);
            await fetchMyRequests();
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
        <>
            <RequestCancelNavbar />
            <div className="request-dashboard">
                <h2>Your Vehicle Requests</h2>

                {error && <div className="error-alert">{error}</div>}

                {requests.length === 0 ? (
                    <p>No vehicle requests found for your credentials.</p>
                ) : (
                    <table className="vehicle-requests-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Request Name</th>
                                <th>Request Position</th>
                                <th>Traveler Name</th>
                                <th>Traveler Position</th>
                                <th>Department</th>
                                <th>Phone Number</th>
                                <th>Duty Nature</th>
                                <th>TravelDateTime</th>
                                <th>Distance Km</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td>{req.requestId}</td>
                                    <td>{req.requesterName}</td>
                                    <td>{req.requesterPosition}</td>
                                    <td>{req.travelerName}</td>
                                    <td>{req.travelerPosition}</td>
                                    <td>{req.department}</td>
                                    <td>{req.phoneNumber}</td>
                                    <td>{req.dutyNature}</td>
                                    <td>{req.travelDateTime}</td>
                                    <td>{req.distanceKm}</td>
                                    <td>{req.reason}</td>
                                    <td style={{ color: getStatusColor(req.status), fontWeight: "bold", }}> {req.status}</td>
                                    <td className="actions-col">
                                        <div className="action-buttons">
                                            <button
                                                className="icon-btn"
                                                onClick={() => handleCancel(req.requestId)}
                                                disabled={
                                                    ["CANCELLED", "COMPLETED", "REJECTED"].includes(
                                                        req.status?.toUpperCase()
                                                    )
                                                }
                                            >
                                                ⛔
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default RequestCancel;