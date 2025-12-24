import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

const VehicleRecords = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [vehicles, setVehicles] = useState([]);
    const [records, setRecords] = useState([]);
    const navigate = useNavigate();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [recordData, setRecordData] = useState({
        currentMileage: "",
        nextServiceMileage: "",
        serviceInterval: "",
        serviceType: "",
        cost: "",
        garageName: "",
        remarks: "",
        serviceDate: "",
    });
    const [editRecord, setEditRecord] = useState(null);
    const [serviceIntervals, setServiceIntervals] = useState({
        Car: 6000,
        Van: 7000,
        Jeep: 8000,
        Truck: 12000,
        Cab: 9000,
    });

    // Fetch all vehicles
    const fetchVehicles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicles`);
            setVehicles(res.data || []);
        } catch (err) {
            console.error("Error fetching vehicles:", err);
            setVehicles([]);
        }
    };

    // Fetch service interval defaults
    const fetchIntervals = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicle-services/service-intervals`);
            if (res.data) setServiceIntervals(res.data);
        } catch (err) {
            console.info("Could not fetch service intervals from backend, using defaults.");
        }
    };

    // Fetch all records
    const fetchAllRecords = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicle-services`);
            const mapped = (res.data || []).map((r) => ({
                ...r,
                serviceDate: r.serviceDate || r.date || null,
            }));
            setRecords(mapped);
        } catch (err) {
            console.error("Error fetching all service records:", err);
            setRecords([]);
        }
    };

    // Fetch records for one vehicle
    const fetchRecords = async (vehicleId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicle-services/vehicle/${vehicleId}`);
            const mapped = (res.data || []).map((r) => ({
                ...r,
                serviceDate: r.serviceDate || r.date || null,
            }));
            setRecords(mapped);
        } catch (err) {
            console.error("Error fetching service records:", err);
            setRecords([]);
        }
    };

    useEffect(() => {
        fetchVehicles();
        fetchIntervals();
        fetchAllRecords(); // ✅ Fetch all records initially
    }, []);

    // Handle vehicle select or "show all"
    const handleVehicleSelect = (e) => {
        const vehicleId = e.target.value;
        if (!vehicleId) {
            setSelectedVehicle(null);
            fetchAllRecords(); // ✅ Show all again
            return;
        }

        const vehicle = vehicles.find((v) => v.vehicleId === vehicleId) || null;
        setSelectedVehicle(vehicle);

        if (vehicle) {
            fetchRecords(vehicle.vehicleId);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMileageInput = (e) => {
        const { name, value } = e.target;
        const next = { ...recordData, [name]: value };
        const vehicleType = selectedVehicle?.vehicleType;
        const interval = serviceIntervals[vehicleType] || 6000;

        if (name === "currentMileage" && value !== "") {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
                next.nextServiceMileage = parsed + interval;
                next.serviceInterval = interval;
            }
        }
        setRecordData(next);
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        if (!selectedVehicle) {
            alert("Please select a vehicle first!");
            return;
        }

        const serviceInterval = serviceIntervals[selectedVehicle.vehicleType] || 6000;
        const payload = {
            vehicleId: selectedVehicle.vehicleId,
            serviceType: recordData.serviceType || "",
            garageName: recordData.garageName || "",
            cost: recordData.cost ? parseFloat(recordData.cost) : 0.0,
            remarks: recordData.remarks || "",
            currentMileage: recordData.currentMileage ? parseFloat(recordData.currentMileage) : 0.0,
            serviceInterval: serviceInterval,
            nextServiceMileage: recordData.nextServiceMileage
                ? parseFloat(recordData.nextServiceMileage)
                : undefined,
            serviceDate: recordData.serviceDate || undefined,
        };

        try {
            await axios.post(`${API_BASE_URL}/vehicle-services`, payload);
            alert("✅ Service record added successfully!");
            setShowAddModal(false);
            setRecordData({
                currentMileage: "",
                nextServiceMileage: "",
                serviceInterval: "",
                serviceType: "",
                cost: "",
                garageName: "",
                remarks: "",
                serviceDate: "",
            });
            fetchRecords(selectedVehicle.vehicleId);
        } catch (err) {
            console.error("Error adding record:", err.response || err);
            alert("❌ Failed to add record. See console for details.");
        }
    };

    const handleDeleteRecord = async (recordId) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/vehicle-services/${recordId}`);
            alert("✅ Record deleted successfully!");
            if (selectedVehicle) fetchRecords(selectedVehicle.vehicleId);
            else fetchAllRecords();
        } catch (err) {
            console.error("Error deleting record:", err);
            alert("❌ Failed to delete record");
        }
    };

    const openEditModal = (r) => {
        setEditRecord({
            ...r,
            editCurrentMileage: r.currentMileage ?? "",
            editServiceCount: r.serviceCount ?? 0,
        });
        setShowEditModal(true);
    };

    const handleSaveMileage = async () => {
        if (!editRecord) return;
        const id = editRecord.id;
        const newMileage = parseFloat(editRecord.editCurrentMileage);
        if (isNaN(newMileage) || newMileage < 0) {
            alert("Enter a valid mileage number");
            return;
        }

        const payload = {
            currentMileage: newMileage,
            vehicleType: selectedVehicle?.vehicleType || "Car",
        };

        try {
            await axios.put(`${API_BASE_URL}/vehicle-services/${id}/mileage`, payload);
            alert("✅ Mileage updated");
            setShowEditModal(false);
            setEditRecord(null);
            if (selectedVehicle) fetchRecords(selectedVehicle.vehicleId);
            else fetchAllRecords();
        } catch (err) {
            console.error("Error updating mileage:", err.response || err);
            alert("❌ Failed to update mileage");
        }
    };

    const handleSaveServiceCount = async () => {
        if (!editRecord) return;
        const id = editRecord.id;
        const newCount = parseInt(editRecord.editServiceCount, 10);
        if (isNaN(newCount) || newCount < 0) {
            alert("Enter a valid service count");
            return;
        }

        const payload = { serviceCount: newCount };

        try {
            await axios.put(`${API_BASE_URL}/vehicle-services/${id}/service-count`, payload);
            alert("✅ Service count updated");
            setShowEditModal(false);
            setEditRecord(null);
            if (selectedVehicle) fetchRecords(selectedVehicle.vehicleId);
            else fetchAllRecords();
        } catch (err) {
            console.error("Error updating service count:", err.response || err);
            alert("❌ Failed to update service count");
        }
    };

    const formatDate = (d) => {
        if (!d) return "-";
        try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return d?.toString();
            return dt.toLocaleDateString();
        } catch (e) {
            return d?.toString();
        }
    };

    return (
        <div className="driver-page">
            <div className="panel">
                <div className="panel-header">
                    <h2>Vehicle Service Records</h2>

                    <div className="panel-actions">
                        <button className="create-btn" onClick={() => navigate("/AddVehicle")}>
                            Back to Vehicles
                        </button>
                    </div>
                </div>

                <div className="panel-paragraph">
                    <p>
                        This section provides a detailed overview of each vehicle’s maintenance history,
                        including service dates, mileage, service type, garage information, costs, and remarks. <br />
                        It helps track regular servicing, plan future maintenance, and keep vehicles in optimal condition.
                    </p>
                </div>

                <div className="vehicle-panel">
                    {selectedVehicle && (
                        <div className="vehicle-summary">
                            <h3>
                                {selectedVehicle.vehicleNumber} - {selectedVehicle.vehicleType}
                            </h3>
                            <p>
                                Manufacturer: <strong>{selectedVehicle.manufacturer}</strong> | Model:{" "}
                                <strong>{selectedVehicle.model}</strong>
                            </p>
                        </div>
                    )}

                    {selectedVehicle && (
                        <div className="pdf-generator">
                            <button className="pdf-btn">PDF</button>
                            <button className="excel-btn">EXCEL</button>
                            <button className="csv-btn">CSV</button>
                            <button className="print-btn">PRINT</button>
                        </div>
                    )}

                    <div className="panel-actions-select-inner">
                        {selectedVehicle && (
                            <button className="record-btn" onClick={() => setShowAddModal(true)}>
                                Add Record
                            </button>
                        )}

                        <select
                            className="vehicle-select"
                            onChange={handleVehicleSelect}
                            value={selectedVehicle?.vehicleId || ""}
                        >
                            <option value="">All Vehicles</option>
                            {vehicles.map((v) => (
                                <option key={v.vehicleId} value={v.vehicleId}>
                                    {v.vehicleNumber} ({v.vehicleType})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="driver-table">
                        <thead>
                            <tr>
                                {!selectedVehicle && <th>Vehicle</th>}
                                <th>Record ID</th>
                                <th>Date</th>
                                <th>Cu:KM</th>
                                <th>Interval</th>
                                <th>Nex:KM</th>
                                <th>Service Type</th>
                                <th>Garage</th>
                                <th>Cost</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length > 0 ? (
                                records.map((r) => (
                                    <tr key={r.id}>
                                        {!selectedVehicle && (
                                            <td>{r.vehicleNumber || `${r.vehicle?.vehicleNumber || "-"}`}</td>
                                        )}
                                        <td>{r.serviceRecordId || "-"}</td>
                                        <td>{formatDate(r.serviceDate)}</td>
                                        <td>{r.currentMileage ?? "-"}</td>
                                        <td>{r.serviceInterval ?? "-"}</td>
                                        <td>{r.nextServiceMileage ?? "-"}</td>
                                        <td>{r.serviceType ?? "-"}</td>
                                        <td>{r.garageName ?? "-"}</td>
                                        <td>{r.cost ?? "-"}</td>
                                        <td>{r.remarks ?? "-"}</td>
                                        <td className="actions-col">
                                            <div className="action-buttons">
                                                <button
                                                    className="icon-btn"
                                                    title="View / Edit"
                                                    onClick={() => openEditModal(r)}
                                                >
                                                    ...
                                                </button>
                                                <button
                                                    className="delete-small"
                                                    title="Delete"
                                                    onClick={() => handleDeleteRecord(r.id)}
                                                >
                                                    ⛔
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="no-data">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD MODAL --- */}
            {showAddModal && (
                <div className="modal-overlay" onMouseDown={() => setShowAddModal(false)}>
                    <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Service Record</h3>
                            <button className="close-x" onClick={() => setShowAddModal(false)}>✖</button>
                        </div>

                        <form className="modal-form" onSubmit={handleAddRecord}>
                            <div className="form-grid">
                                <label>
                                    Service Date
                                    <input
                                        type="date"
                                        name="serviceDate"
                                        value={recordData.serviceDate}
                                        onChange={handleChange}
                                    />
                                </label>

                                <label>
                                    Current Mileage
                                    <input
                                        type="number"
                                        name="currentMileage"
                                        value={recordData.currentMileage}
                                        onChange={handleMileageInput}
                                        required
                                    />
                                </label>

                                <label>
                                    Next Service Mileage
                                    <input
                                        type="number"
                                        name="nextServiceMileage"
                                        value={recordData.nextServiceMileage}
                                        onChange={handleChange}
                                        readOnly
                                    />
                                </label>

                                <label>
                                    Service Interval (km)
                                    <input
                                        type="number"
                                        name="serviceInterval"
                                        value={recordData.serviceInterval}
                                        readOnly
                                    />
                                </label>

                                <label>
                                    Service Type
                                    <input
                                        name="serviceType"
                                        value={recordData.serviceType}
                                        onChange={handleChange}
                                        placeholder="e.g., Full Service"
                                    />
                                </label>

                                <label>
                                    Garage Name
                                    <input
                                        name="garageName"
                                        value={recordData.garageName}
                                        onChange={handleChange}
                                        placeholder="e.g., AutoFix Garage"
                                    />
                                </label>

                                <label>
                                    Cost (Rs)
                                    <input
                                        type="number"
                                        name="cost"
                                        value={recordData.cost}
                                        onChange={handleChange}
                                    />
                                </label>

                                <label>
                                    Remarks
                                    <textarea name="remarks" value={recordData.remarks} onChange={handleChange} />
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">Add Record</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- EDIT MODAL --- */}
            {showEditModal && editRecord && (
                <div className="modal-overlay" onMouseDown={() => setShowEditModal(false)}>
                    <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Record - {editRecord.vehicleNumber || ""}</h3>
                            <button className="close-x" onClick={() => setShowEditModal(false)}>✖</button>
                        </div>

                        <div className="modal-form">
                            <div className="form-grid">
                                <label>
                                    Service Date
                                    <input type="text" readOnly value={formatDate(editRecord.serviceDate)} />
                                </label>

                                <label>
                                    Current Mileage
                                    <input
                                        type="number"
                                        value={editRecord.editCurrentMileage}
                                        onChange={(e) => setEditRecord((p) => ({ ...p, editCurrentMileage: e.target.value }))}
                                    />
                                </label>

                                <label>
                                    Service Interval (km)
                                    <input
                                        type="number"
                                        name="serviceInterval"
                                        value={recordData.serviceInterval}
                                        readOnly
                                    />
                                </label>
                                <label>
                                    Next Service Mileage
                                    <input type="number" readOnly value={editRecord.nextServiceMileage ?? ""} />
                                </label>

                                <label>
                                    Service Type
                                    <input type="text" readOnly value={editRecord.serviceType ?? ""} />
                                </label>

                                <label>
                                    Garage Name
                                    <input type="text" readOnly value={editRecord.garageName ?? ""} />
                                </label>

                                <label>
                                    Cost (Rs)
                                    <input type="number" readOnly value={editRecord.cost ?? ""} />
                                </label>

                                <label>
                                    Remarks
                                    <textarea readOnly value={editRecord.remarks ?? ""} />
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-primary" onClick={handleSaveMileage}>
                                    Save Mileage
                                </button>
                                <button type="button" className="btn-primary" onClick={handleSaveServiceCount} style={{ marginLeft: 8 }}>
                                    Save Service Count
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleRecords;