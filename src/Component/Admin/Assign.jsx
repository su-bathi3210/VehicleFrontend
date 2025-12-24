import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VehicleAssign.css";

export default function Assign() {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedByAdmin, setApprovedByAdmin] = useState([]);
    const [approvedByOfficer, setApprovedByOfficer] = useState([]);
    const [ongoingRequests, setOngoingRequests] = useState([]);
    const [cancellationRequests, setCancellationRequests] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedTab, setSelectedTab] = useState("");
    const [cancellationCount, setCancellationCount] = useState(0);

    const token = localStorage.getItem("token");

    const [selectedVehicles, setSelectedVehicles] = useState({});
    const [selectedDrivers, setSelectedDrivers] = useState({});

    useEffect(() => {
        if (selectedTab === "CANCELLATION_REQUESTS") {
            fetchCancellationRequests();
        } else {
            fetchRequests();
        }
        fetchVehicles();
        fetchDrivers();
        fetchCancellationCount();
    }, [selectedTab]);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicle-requests/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingRequests(res.data.filter(r => r.status === "PENDING"));
            setApprovedByAdmin(res.data.filter(r => r.status === "APPROVED_BY_ADMIN"));
            setApprovedByOfficer(
                res.data
                    .filter(r => r.status === "APPROVED_BY_OFFICER")
                    .sort((a, b) => {
                        const aScore = (a.assignedVehicleId ? 1 : 0) + (a.assignedDriverId ? 1 : 0);
                        const bScore = (b.assignedVehicleId ? 1 : 0) + (b.assignedDriverId ? 1 : 0);
                        return bScore - aScore;
                    })
            );
            setOngoingRequests(res.data.filter(r => r.status === "ON_GOING_TRIP"));
        } catch (err) {
            console.error("Error fetching requests:", err);
        }
    };

    const fetchCancellationRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicle-requests/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCancellationRequests(res.data.filter(r => r.status === "CANCELLATION_REQUESTED"));
        } catch (err) {
            console.error("Error fetching cancellation requests:", err);
        }
    };

    const fetchVehicles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicles/available`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(res.data);
        } catch (err) {
            console.error("Error fetching vehicles:", err);
        }
    };

    const fetchDrivers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/drivers/available`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDrivers(res.data);
        } catch (err) {
            console.error("Error fetching drivers:", err);
        }
    };

    const assignVehicle = async (requestId) => {
        const vehicleId = selectedVehicles[requestId];
        if (!vehicleId) {
            alert("⚠️ Please select a vehicle before assigning.");
            return;
        }
        try {
            await axios.put(
                `${API_BASE_URL}/vehicle-requests/assign/${requestId}/${vehicleId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Vehicle assigned and sent to Approval Officer.");
            setSelectedVehicles(prev => ({ ...prev, [requestId]: "" }));
            fetchRequests();
            fetchVehicles();
        } catch (err) {
            const backendMsg = err?.response?.data || "❌ Failed to assign vehicle.";
            alert(backendMsg);
            console.error("Error assigning vehicle:", err);
        }
    };

    const assignDriver = async (requestId) => {
        const driverId = selectedDrivers[requestId];
        if (!driverId) {
            alert("⚠️ Please select a driver before assigning.");
            return;
        }
        try {
            await axios.put(
                `${API_BASE_URL}/vehicle-requests/assign-driver/${requestId}/${driverId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Driver assigned. SMS sent to driver and employee.");
            setSelectedDrivers(prev => ({ ...prev, [requestId]: "" }));
            fetchRequests();
        } catch (err) {
            const backendMsg = err?.response?.data || "❌ Failed to assign driver.";
            alert(backendMsg);
            console.error("Error assigning driver:", err);
        }
    };

    const handleCancelRequest = async (request) => {
        const reason = prompt("Enter cancellation reason (optional):", "No reason provided");
        if (reason === null) return;

        const travelerName = request.travelerName;
        const phoneNumber = request.phoneNumber;

        if (!travelerName || !phoneNumber) {
            alert("❌ Traveler credentials are missing, cannot cancel request.");
            return;
        }

        try {
            await axios.put(
                `${API_BASE_URL}/vehicle-requests/${request.requestId}/cancel`,
                { travelerName, phoneNumber, reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Cancellation request sent successfully.");
            fetchRequests();
        } catch (err) {
            alert(err?.response?.data || "❌ Failed to cancel request.");
            console.error("Error cancelling request:", err);
        }
    };

    const approveCancellation = async (requestId) => {
        try {
            await axios.put(
                `${API_BASE_URL}/vehicle-requests/${requestId}/cancel/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Cancellation approved successfully.");
            fetchCancellationRequests();
            fetchRequests();
        } catch (err) {
            alert(err?.response?.data || "❌ Failed to approve cancellation.");
            console.error("Error approving cancellation:", err);
        }
    };

    const fetchCancellationCount = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicle-requests/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const count = res.data.filter(r => r.status === "CANCELLATION_REQUESTED").length;
            setCancellationCount(count);
        } catch (err) {
            console.error("Error fetching cancellation request count:", err);
        }
    };


    const canCancelRequest = (status) => {
        return !["COMPLETED", "CANCELLED", "CANCELLATION_REQUESTED", "REJECTED"].includes(status.toUpperCase());
    };

    const renderTable = () => {
        switch (selectedTab) {
            case "PENDING":
                return pendingRequests.length === 0 ? (
                    <p>No pending requests 🎉</p>
                ) : (
                    <div className="grid-container">
                        {pendingRequests.map(r => (
                            <div key={r.requestId} className="grid-card">
                                <table className="info-table">
                                    <tbody>
                                        <tr><th>Request ID</th><td>{r.requestId}</td></tr>
                                        <tr><th>Traveler Name</th><td>{r.travelerName}</td></tr>
                                        <tr><th>Traveler Position</th><td>{r.travelerPosition}</td></tr>
                                        <tr><th>Department</th><td>{r.department}</td></tr>
                                        <tr><th>Phone Number</th><td>{r.phoneNumber}</td></tr>
                                        <tr><th>Duty Nature</th><td>{r.dutyNature}</td></tr>
                                        <tr><th>From Location</th><td>{r.fromLocation}</td></tr>
                                        <tr><th>To Location</th><td>{r.toLocation}</td></tr>
                                        <tr><th>Distance Km</th><td>{r.distanceKm}</td></tr>
                                        <tr><th>Travel Date Time</th><td>{r.travelDateTime}</td></tr>
                                        <tr><th>Reason</th><td>{r.reason}</td></tr>
                                    </tbody>
                                </table>
                                <div className="action-section">
                                    <select
                                        value={selectedVehicles[r.requestId] || ""}
                                        onChange={(e) =>
                                            setSelectedVehicles({ ...selectedVehicles, [r.requestId]: e.target.value })
                                        }
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => (
                                            <option key={v.vehicleId} value={v.vehicleId}>
                                                {v.vehicleNumber} ({v.vehicleType})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        disabled={!selectedVehicles[r.requestId]}
                                        onClick={() => assignVehicle(r.requestId)}
                                    >
                                        Assign Vehicle
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "APPROVED_ADMIN":
                return approvedByAdmin.length === 0 ? (
                    <p>No requests waiting for officer approval.</p>
                ) : (
                    <div className="grid-container">
                        {approvedByAdmin.map(r => (
                            <div key={r.requestId} className="grid-card">
                                <table className="info-table">
                                    <tbody>
                                        <tr><th>Request ID</th><td>{r.requestId}</td></tr>
                                        <tr><th>Requester Name</th><td>{r.requesterName}</td></tr>
                                        <tr><th>Assigned Vehicle ID</th><td>{r.assignedVehicleId}</td></tr>
                                        <tr><th>Department</th><td>{r.department}</td></tr>
                                        <tr><th>Phone Number</th><td>{r.phoneNumber}</td></tr>
                                        <tr><th>Duty Nature</th><td>{r.dutyNature}</td></tr>
                                        <tr><th>From Location</th><td>{r.fromLocation}</td></tr>
                                        <tr><th>To Location</th><td>{r.toLocation}</td></tr>
                                        <tr><th>Distance Km</th><td>{r.distanceKm}</td></tr>
                                        <tr><th>Travel Date Time</th><td>{r.travelDateTime}</td></tr>
                                        <tr><th>Reason</th><td>{r.reason}</td></tr>
                                        <tr><th>Status</th><td>{r.status}</td></tr>
                                    </tbody>
                                </table>
                                <p className="grid-container-trip-approved">
                                    ⏳ Is waiting for Approval Officer’s decision
                                </p>
                                
                            </div>
                        ))}
                    </div>
                );

            case "APPROVED_OFFICER":
                return approvedByOfficer.length === 0 ? (
                    <p>No approved requests awaiting driver assignment.</p>
                ) : (
                    <div className="grid-container">
                        {approvedByOfficer.map(r => (
                            <div key={r.requestId} className="grid-card">
                                <table className="info-table">
                                    <tbody>
                                        <tr><th>Request ID</th><td>{r.requestId}</td></tr>
                                        <tr><th>Traveler Name</th><td>{r.travelerName}</td></tr>
                                        <tr><th>Traveler Position</th><td>{r.travelerPosition}</td></tr>
                                        <tr><th>Department</th><td>{r.department}</td></tr>
                                        <tr><th>From Location</th><td>{r.fromLocation}</td></tr>
                                        <tr><th>To Location</th><td>{r.toLocation}</td></tr>
                                        <tr><th>Distance Km</th><td>{r.distanceKm}</td></tr>
                                        <tr><th>Phone Number</th><td>{r.phoneNumber}</td></tr>
                                        <tr><th>Travel Date Time</th><td>{r.travelDateTime}</td></tr>
                                        <tr><th>Assigned Vehicle ID</th><td>{r.assignedVehicleId || "N/A"}</td></tr>
                                        <tr><th>Assigned Driver ID</th><td>{r.assignedDriverId || "N/A"}</td></tr>
                                        <tr><th>Status</th><td>{r.status}</td></tr>
                                    </tbody>
                                </table>
                                <p className="grid-container-trip-admin">
                                    📩 Employee will be notified at: {r.phoneNumber || "N/A"}
                                </p>
                                <div className="action-section">
                                    <select
                                        value={selectedDrivers[r.requestId] || ""}
                                        onChange={(e) =>
                                            setSelectedDrivers({ ...selectedDrivers, [r.requestId]: e.target.value })
                                        }
                                    >
                                        <option value="">Select Driver</option>
                                        {drivers.map(d => (
                                            <option key={d.driverId} value={d.driverId}>
                                                {d.name} ({d.phoneNumber})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        disabled={!selectedDrivers[r.requestId]}
                                        onClick={() => assignDriver(r.requestId)}
                                    >
                                        Assign Driver
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "CANCELLATION_REQUESTS":
                return cancellationRequests.length === 0 ? (
                    <p>No cancellation requests pending approval.</p>
                ) : (
                    <div className="grid-container">
                        {cancellationRequests.map(r => (
                            <div key={r.requestId} className="grid-card">
                                <table className="info-table">
                                    <tbody>
                                        <tr><th>Request ID</th><td>{r.requestId}</td></tr>
                                        <tr><th>Traveler Name</th><td>{r.travelerName}</td></tr>
                                        <tr><th>Cancellation Reason</th><td>{r.cancellationReason || "N/A"}</td></tr>
                                        <tr><th>Status</th><td>{r.status}</td></tr>
                                    </tbody>
                                </table>
                                <button className="approve-button" onClick={() => approveCancellation(r.requestId)}>
                                    Approve Cancellation
                                </button>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="vehicle-assign-container">
            <h1 className="vehicle-assign-heading">Assign Requests</h1>
            <p className="vehicle-assign-description">
                This page allows you to manage vehicle requests. By default, you will see all <strong>ongoing trips</strong>.
                Use the tabs above to view Pending Requests, Requests Waiting for Officer Approval, Approved Requests needing driver assignment, or Cancellation Requests awaiting admin approval.
            </p>
            <div className="tab-buttons">
                <button
                    className={selectedTab === "PENDING" ? "active" : ""}
                    onClick={() => setSelectedTab("PENDING")}
                >
                    Pending Requests <span className="request-count">{pendingRequests.length}</span>
                </button>

                <button
                    className={selectedTab === "APPROVED_ADMIN" ? "active" : ""}
                    onClick={() => setSelectedTab("APPROVED_ADMIN")}
                >
                    Waiting for Officer Approval <span className="request-count">{approvedByAdmin.length}</span>
                </button>

                <button
                    className={selectedTab === "APPROVED_OFFICER" ? "active" : ""}
                    onClick={() => setSelectedTab("APPROVED_OFFICER")}
                >
                    Approved Requests <span className="request-count">{approvedByOfficer.length}</span>
                </button>

                <button
                    className={selectedTab === "CANCELLATION_REQUESTS" ? "active" : ""}
                    onClick={() => setSelectedTab("CANCELLATION_REQUESTS")}
                >
                    Cancellation Requests <span className="request-count">{cancellationCount}</span>
                </button>
            </div>

            {renderTable()}

            {selectedTab === "" && (
                <div className="ongoing-trips-section">
                    <h2>On going Trips</h2>
                    {ongoingRequests.length === 0 ? (
                        <p>No ongoing trips 🚗</p>
                    ) : (
                        <div className="grid-container">
                            {ongoingRequests.map(r => (
                                <div key={r.requestId} className="grid-card">
                                    <table className="info-table">
                                        <tbody>
                                            <tr><th>Request ID</th><td>{r.requestId}</td></tr>
                                            <tr><th>Requester Name</th><td>{r.requesterName}</td></tr>
                                            <tr><th>From Location</th><td>{r.fromLocation}</td></tr>
                                            <tr><th>To Location</th><td>{r.toLocation}</td></tr>
                                            <tr><th>Distance Km</th><td>{r.distanceKm}</td></tr>
                                            <tr><th>Travel Date Time</th><td>{r.travelDateTime}</td></tr>
                                            <tr><th>Assigned Vehicle</th><td>{r.assignedVehicleId}</td></tr>
                                            <tr><th>Assigned Driver</th><td>{r.assignedDriverId}</td></tr>
                                            <tr><th>Status</th><td>{r.status}</td></tr>
                                        </tbody>
                                    </table>
                                    <p className="grid-container-trip-ongoing">
                                        ✅ Trip is currently ongoing
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
