import axios from "axios";
import { useEffect, useState } from "react";
import "../../App.css";

const AddVehicle = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [expiredVehicles, setExpiredVehicles] = useState([]);
    const [filters, setFilters] = useState({ q: "", status: "All" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [modalData, setModalData] = useState({
        vehicleId: "",
        vehicleNumber: "",
        vehicleType: "",
        manufacturer: "",
        model: "",
        status: "Available",
        licenseNumber: "",
        licenseIssueDate: "",
        licenseExpiryDate: "",
    });

    const [showSplash, setShowSplash] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicles`);
            setVehicles(res.data || []);
            setFilteredVehicles(res.data || []);
        } catch (err) {
            console.error("Error Fetching Vehicles:", err);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expired = vehicles.filter((v) => {
            if (!v.licenseExpiryDate) return false;
            const expiry = new Date(v.licenseExpiryDate);
            expiry.setHours(0, 0, 0, 0);
            return expiry < today || v.status?.toUpperCase() === "EXPIRED";
        });
        setExpiredVehicles(expired);
    }, [vehicles]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        const q = filters.q.trim().toLowerCase();
        const status = filters.status;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = vehicles.filter((v) => {
            const matchesQ =
                !q ||
                v.vehicleNumber?.toLowerCase().includes(q) ||
                v.vehicleType?.toLowerCase().includes(q) ||
                v.manufacturer?.toLowerCase().includes(q);
            const isExpired =
                v.licenseExpiryDate &&
                new Date(v.licenseExpiryDate).setHours(0, 0, 0, 0) < today;
            let matchesStatus = true;
            if (status === "Available") matchesStatus = !isExpired;
            else if (status === "Expired") matchesStatus = isExpired;
            return matchesQ && matchesStatus;
        });

        setFilteredVehicles(filtered);
        setCurrentPage(1);
    };

    useEffect(() => {
        handleSearch();
    }, [filters, vehicles]);

    const resetFilters = () => {
        setFilters({ q: "", status: "All" });
        setFilteredVehicles(vehicles);
        setCurrentPage(1);
    };

    const openAddModal = () => {
        setModalMode("add");
        setModalData({
            vehicleId: "",
            vehicleNumber: "",
            vehicleType: "",
            manufacturer: "",
            model: "",
            status: "Available",
            licenseNumber: "",
            licenseIssueDate: "",
            licenseExpiryDate: "",
        });
        setShowModal(true);
    };

    const openEditModal = (vehicle) => {
        setModalMode("edit");
        setModalData({
            ...vehicle,
            licenseIssueDate: vehicle.licenseIssueDate
                ? new Date(vehicle.licenseIssueDate).toISOString().split("T")[0]
                : "",
            licenseExpiryDate: vehicle.licenseExpiryDate
                ? new Date(vehicle.licenseExpiryDate).toISOString().split("T")[0]
                : "",
        });
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const generateVehicleId = () => {
        if (!vehicles || vehicles.length === 0) return "VEH-001";
        const numbers = vehicles
            .map((v) => {
                if (!v.vehicleId) return NaN;
                const parts = v.vehicleId.split("-");
                return parseInt(parts[1], 10);
            })
            .filter((n) => !isNaN(n));
        const nextNumber = numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
        return `VEH-${String(nextNumber).padStart(3, "0")}`;
    };

    const handleModalChange = (e) => {
        const { name, value } = e.target;
        setModalData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...modalData,
            licenseIssueDate: modalData.licenseIssueDate
                ? new Date(modalData.licenseIssueDate).toISOString()
                : null,
            licenseExpiryDate: modalData.licenseExpiryDate
                ? new Date(modalData.licenseExpiryDate).toISOString()
                : null,
        };

        try {
            if (modalMode === "edit" && modalData.vehicleId) {
                await axios.put(
                    `${API_BASE_URL}/vehicles/${modalData.vehicleId}`,
                    payload
                );
                alert("✅ Vehicle updated successfully!");
            } else {
                payload.vehicleId = generateVehicleId();
                await axios.post(`${API_BASE_URL}/vehicles`, payload);
                alert("✅ Vehicle added successfully!");
            }

            closeModal();
            setShowSplash(true);
            setTimeout(() => setFadeOut(true), 4000);
            setTimeout(() => {
                setShowSplash(false);
                fetchVehicles();
            }, 4000);
        } catch (err) {
            console.error("Error saving vehicle:", err);
            alert("❌ Error saving vehicle. Check console for details.");
        }
    };

    const handleDelete = async (vehicle) => {
        if (!vehicle?.vehicleId) return;
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/vehicles/${vehicle.vehicleId}`);
            alert("✅ Vehicle deleted successfully!");
            fetchVehicles();
        } catch (err) {
            console.error("Error deleting vehicle:", err);
            alert("Error deleting vehicle. See console.");
        }
    };

    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

    if (showSplash) {
        return (
            <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
                <div className="splash-content">
                    <img src="/logo.png" alt="Logo" className="splash-logo" />
                </div>
            </div>
        );
    }

    return (
        <div className="driver-page">
            <div className="panel">
                <div className="panel-header">
                    <h2>Vehicle Management</h2>
                    <div className="panel-actions">
                        <button className="create-btn" onClick={openAddModal}>Add Vehicle</button>
                    </div>
                </div>

                <div className="filter-bar">
                    <form className="filter-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="filter-row">
                            <input
                                type="text"
                                name="q"
                                placeholder="Search by number, type, or manufacturer..."
                                value={filters.q}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-row">
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="All">All Status</option>
                                <option value="Available">Available</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>

                        <div className="filter-row filter-actions">
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => window.location.href = "/VehicleRecords"}
                            >
                                Vehicle Records
                            </button>
                            <button type="button" className="btn-secondary" onClick={resetFilters}>
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                <div className="notifications-section">
                    {expiredVehicles.length === 0 ? (
                        <p className="notifications-section-p">No alerts</p>
                    ) : (
                        expiredVehicles.map((v) => (
                            <div key={v.vehicleId} className="notification-card-alert">
                                <p>⚡ Vehicle <strong>{v.vehicleNumber}</strong> license expired!</p>
                                <small>Expired on {new Date(v.licenseExpiryDate).toLocaleDateString()}</small>
                            </div>
                        ))
                    )}
                </div>

                <div className="table-wrap">
                    <table className="driver-table">
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Type</th>
                                <th>Manufacturer</th>
                                <th>Model</th>
                                <th>Lic. No</th>
                                <th>Issue</th>
                                <th>Expiry</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedVehicles.length > 0 ? (
                                paginatedVehicles.map((v) => (
                                    <tr key={v.vehicleId}>
                                        <td>{v.vehicleNumber}</td>
                                        <td>{v.vehicleType}</td>
                                        <td>{v.manufacturer}</td>
                                        <td>{v.model}</td>
                                        <td>{v.licenseNumber || "-"}</td>
                                        <td>{v.licenseIssueDate || "-"}</td>
                                        <td>
                                            {v.licenseExpiryDate
                                                ? new Date(v.licenseExpiryDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td>{v.status}</td>
                                        <td className="actions-col">
                                            <div className="action-buttons">
                                                <button
                                                    className="icon-btn"
                                                    title="View / Edit"
                                                    onClick={() => openEditModal(v)}
                                                >
                                                    ...
                                                </button>
                                                <button
                                                    className="delete-small"
                                                    title="Delete"
                                                    onClick={() => handleDelete(v)}
                                                >
                                                    ⛔
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="no-data">No vehicles found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ◀ Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next ▶
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onMouseDown={closeModal}>
                    <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalMode === "add" ? "Add Vehicle" : "Edit Vehicle"}</h3>
                            <button className="close-x" onClick={closeModal}>✖</button>
                        </div>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <label>
                                    Vehicle Number
                                    <input name="vehicleNumber" value={modalData.vehicleNumber} onChange={handleModalChange} required />
                                </label>
                                <label>
                                    Vehicle Type
                                    <select
                                        name="vehicleType"
                                        value={modalData.vehicleType}
                                        onChange={handleModalChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Car">Car</option>
                                        <option value="Van">Van</option>
                                        <option value="Jeep">Jeep</option>
                                        <option value="Truck">Truck</option>
                                        <option value="Cab">Cab</option>
                                    </select>
                                </label>
                                <label>
                                    Manufacturer
                                    <input name="manufacturer" value={modalData.manufacturer} onChange={handleModalChange} required />
                                </label>
                                <label>
                                    Model
                                    <input name="model" value={modalData.model} onChange={handleModalChange} />
                                </label>
                                <label>
                                    License Number
                                    <input name="licenseNumber" value={modalData.licenseNumber} onChange={handleModalChange} />
                                </label>
                                <label>
                                    License Issue Date
                                    <input type="date" name="licenseIssueDate" value={modalData.licenseIssueDate} onChange={handleModalChange} />
                                </label>
                                <label>
                                    License Expiry Date
                                    <input type="date" name="licenseExpiryDate" value={modalData.licenseExpiryDate} onChange={handleModalChange} />
                                </label>
                                <label>
                                    Status
                                    <input type="hidden" name="status" value="Available" />
                                    <select disabled style={{ color: "#600000" }}>
                                        <option value="Available">Available</option>
                                    </select>
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    {modalMode === "add" ? "Add Vehicle" : "Update Vehicle"}
                                </button>
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddVehicle;
