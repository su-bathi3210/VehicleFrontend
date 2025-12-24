import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../App.css";
import { useNavigate } from "react-router-dom";

const VehicleRecords = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [records, setRecords] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [recordData, setRecordData] = useState({
        serviceType: "",
        cost: "",
        garageName: "",
        remarks: "",
    });

    const navigate = useNavigate();

    // 🔹 Load all vehicles for dropdown
    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/vehicles`)
            .then((res) => setVehicles(res.data))
            .catch((err) => console.error("Error fetching vehicles", err));
    }, []);

    // 🔹 Fetch service records when vehicle selected
    const fetchRecords = async (vehicleId) => {
        if (!vehicleId) return;
        try {
            const res = await axios.get(
                `${API_BASE_URL}/vehicle-services/vehicle/${vehicleId}`
            );
            setRecords(res.data);
        } catch (err) {
            console.error("Error fetching records:", err);
            setRecords([]);
        }
    };

    // 🔹 When user selects vehicle
    const handleSelectVehicle = (e) => {
        const vehicleId = e.target.value;
        const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
        setSelectedVehicle(vehicle || null);
        if (vehicle) fetchRecords(vehicle.vehicleId);
    };

    // 🔹 Handle form input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecordData((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Add new record
    const handleAddRecord = async (e) => {
        e.preventDefault();
        if (!selectedVehicle) {
            alert("Please select a vehicle first!");
            return;
        }

        const payload = {
            ...recordData,
            vehicleId: selectedVehicle.vehicleId,
        };

        try {
            await axios.post(`${API_BASE_URL}/vehicle-services`, payload);
            alert("✅ Service record added successfully!");
            setShowModal(false);
            fetchRecords(selectedVehicle.vehicleId);
            setRecordData({ serviceType: "", cost: "", garageName: "", remarks: "" });
        } catch (err) {
            console.error("Error adding record:", err);
            alert("❌ Failed to add record");
        }
    };

    // 🔹 Delete record
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/vehicle-services/${id}`);
            fetchRecords(selectedVehicle.vehicleId);
        } catch (err) {
            console.error("Error deleting record:", err);
        }
    };

    return (
        <div className="driver-page">
            <div className="panel">
                <div className="panel-header">
                    <h2>Vehicle Service Records</h2>
                    <div className="panel-actions">
                        <button className="create-btn" onClick={() => setShowModal(true)}>
                            ➕ Add Record
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => navigate("/AddVehicle")}
                        >
                            ← Back to Vehicles
                        </button>
                    </div>
                </div>

                <div className="filter-bar">
                    <label style={{ fontWeight: "600" }}>Select Vehicle:</label>
                    <select
                        value={selectedVehicle?.vehicleId || ""}
                        onChange={handleSelectVehicle}
                        style={{
                            marginLeft: "10px",
                            padding: "8px",
                            minWidth: "250px",
                            borderRadius: "8px",
                        }}
                    >
                        <option value="">-- Select Vehicle --</option>
                        {vehicles.map((v) => (
                            <option key={v.vehicleId} value={v.vehicleId}>
                                {v.vehicleNumber} ({v.vehicleType})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedVehicle && (
                    <div className="table-wrap">
                        <table className="driver-table">
                            <thead>
                                <tr>
                                    <th>Service Type</th>
                                    <th>Garage Name</th>
                                    <th>Cost (LKR)</th>
                                    <th>Date</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? (
                                    records.map((r) => (
                                        <tr key={r.id}>
                                            <td>{r.serviceType}</td>
                                            <td>{r.garageName}</td>
                                            <td>{r.cost}</td>
                                            <td>
                                                {r.serviceDate
                                                    ? new Date(r.serviceDate).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td>{r.remarks || "-"}</td>
                                            <td>
                                                <button
                                                    className="delete-small"
                                                    onClick={() => handleDelete(r.id)}
                                                >
                                                    ⛔ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            No service records found for{" "}
                                            <b>{selectedVehicle.vehicleNumber}</b>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onMouseDown={() => setShowModal(false)}>
                    <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Service Record</h3>
                            <button className="close-x" onClick={() => setShowModal(false)}>
                                ✖
                            </button>
                        </div>

                        <form className="modal-form" onSubmit={handleAddRecord}>
                            <div className="form-grid">
                                <label>
                                    Service Type
                                    <input
                                        name="serviceType"
                                        value={recordData.serviceType}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Garage Name
                                    <input
                                        name="garageName"
                                        value={recordData.garageName}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Cost (LKR)
                                    <input
                                        type="number"
                                        name="cost"
                                        value={recordData.cost}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                                <label>
                                    Remarks
                                    <input
                                        name="remarks"
                                        value={recordData.remarks}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    Add Record
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleRecords;
