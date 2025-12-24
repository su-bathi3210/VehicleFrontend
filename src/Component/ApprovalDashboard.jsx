import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";
import ApprovalOfficerNavBar from "./NavBar/ApprovalOfficerNavBar";

export default function ApprovalDashboard() {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [requests, setRequests] = useState([]);
    const [expandedRequestId, setExpandedRequestId] = useState(null);
    const [assignedDetails, setAssignedDetails] = useState({});
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/vehicle-requests/officer`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRequests(res.data);
        } catch (err) {
            console.error("Error fetching officer requests:", err);
        }
    };

    const toggleExpand = async (id) => {
        if (expandedRequestId === id) {
            setExpandedRequestId(null);
            return;
        }

        try {
            const res = await axios.get(
                `${API_BASE_URL}/vehicle-requests/${id}/assigned-details`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAssignedDetails((prev) => ({
                ...prev,
                [id]: res.data,
            }));
            setExpandedRequestId(id);
        } catch (err) {
            console.error("Error fetching assigned details:", err);
        }
    };

    const approve = async (id) => {
        try {
            await axios.put(
                `${API_BASE_URL}/vehicle-requests/approve/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRequests();
        } catch (err) {
            console.error("Error approving request:", err);
        }
    };

    const reject = async (id) => {
        try {
            await axios.put(
                `${API_BASE_URL}/vehicle-requests/reject/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRequests();
        } catch (err) {
            console.error("Error rejecting request:", err);
        }
    };

    return (
        <>
            <ApprovalOfficerNavBar />
            <div className="approval-container">
                <h2 className="approval-heading" >Approval Pending Requests</h2>
                {requests.length === 0 ? (
                    <p>No requests found.</p>
                ) : (
                    <div className="grid-container">
                        {requests.map((r) => (
                            <div
                                key={r.requestId}
                                className="grid-card"

                            >
                                <table className="info-table">
                                    <tbody>
                                        <tr><th>Request ID</th><td>{r.requestId}</td></tr>
                                        <tr><th>Requester</th><td>{r.requesterName}</td></tr>
                                        <tr><th>Requester Position</th><td>{r.requesterPosition}</td></tr>
                                        <tr><th>Traveler</th><td>{r.travelerName}</td></tr>
                                        <tr><th>Traveler Position</th><td>{r.travelerPosition}</td></tr>
                                        <tr><th>Department</th><td>{r.department}</td></tr>
                                        <tr><th>Phone Number</th><td>{r.phoneNumber}</td></tr>
                                        <tr><th>Duty Nature</th><td>{r.dutyNature}</td></tr>
                                        <tr><th>Destination</th><td>{r.destination}</td></tr>
                                        <tr><th>Travel Date & Time</th>
                                            <td>{new Date(r.travelDateTime).toLocaleString()}</td>
                                        </tr>
                                        <tr><th>Reason</th><td>{r.reason}</td></tr>
                                        <tr><th>Status</th><td>{r.status}</td></tr>
                                        <tr>
                                            <th colSpan={2} style={{ textAlign: "center" }}>
                                                <button
                                                    className="btn-toggle-details"
                                                    onClick={() => toggleExpand(r.requestId)}
                                                >
                                                    {expandedRequestId === r.requestId
                                                        ? "Hide Assigned Driver & Vehicle"
                                                        : "Show Assigned Driver & Vehicle"}
                                                </button>
                                            </th>
                                        </tr>

                                        {expandedRequestId === r.requestId &&
                                            assignedDetails[r.requestId] && (
                                                <>
                                                    {assignedDetails[r.requestId].assignedVehicle && (
                                                        <>
                                                            <tr>
                                                                <th colSpan={2} style={{ textAlign: "center", backgroundColor: "#185a9d", color: "#fff" }}>
                                                                    Vehicle Details
                                                                </th>
                                                            </tr>
                                                            {Object.entries(assignedDetails[r.requestId].assignedVehicle).map(([key, value]) => (
                                                                <tr key={key}>
                                                                    <th>{key.replace(/([A-Z])/g, ' $1')}</th>
                                                                    <td>{value}</td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    )}

                                                    {assignedDetails[r.requestId].assignedDriver && (
                                                        <>
                                                            <tr>
                                                                <th colSpan={2} style={{ textAlign: "center", backgroundColor: "#59ba9b", color: "#fff" }}>
                                                                    Driver Details
                                                                </th>
                                                            </tr>
                                                            {Object.entries(assignedDetails[r.requestId].assignedDriver).map(([key, value]) => (
                                                                <tr key={key}>
                                                                    <th>{key.replace(/([A-Z])/g, ' $1')}</th>
                                                                    <td>{value}</td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    )}
                                                </>
                                            )}

                                        {r.status === "APPROVED_BY_ADMIN" && (
                                            <tr>
                                                <td colSpan={2} style={{ textAlign: "center", paddingTop: "15px" }}>
                                                    <button
                                                        className="approval-btn-toggle-approve"
                                                        onClick={() => approve(r.requestId)} style={{ marginRight: "10px" }}> Approve </button>


                                                    <button
                                                        className="approval-btn-toggle-reject"
                                                        onClick={() => reject(r.requestId)}> Reject </button>

                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
