import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../App.css";

const AddDrivers = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [drivers, setDrivers] = useState([]);
    const [filteredDrivers, setFilteredDrivers] = useState([]);
    const [filters, setFilters] = useState({
        q: "",
        status: "All",
    });

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [modalData, setModalData] = useState({
        name: "",
        phoneNumber: "",
        licenseNumber: "",
        nic: "",
        address: "",
        status: "Available",
        licenseExpiryDate: "",
        emergencyContact: "",
        driverId: "",
    });

    const [expiredDrivers, setExpiredDrivers] = useState([]);

    const [showSplash, setShowSplash] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

    const fetchDrivers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/drivers`);
            setDrivers(res.data || []);
            setFilteredDrivers(res.data || []);
        } catch (err) {
            console.error("Error fetching drivers", err);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    useEffect(() => {
        const expired = drivers.filter((driver) => {
            if (!driver.licenseExpiryDate) return false;
            const expiry = new Date(driver.licenseExpiryDate);
            const today = new Date();
            return expiry.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0);
        });
        setExpiredDrivers(expired);
    }, [drivers]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const q = filters.q.trim().toLowerCase();
        const status = filters.status;

        const filtered = drivers.filter((d) => {
            const matchesQ =
                !q ||
                (d.name && d.name.toLowerCase().includes(q)) ||
                (d.phoneNumber && d.phoneNumber.toLowerCase().includes(q)) ||
                (d.nic && d.nic.toLowerCase().includes(q));
            const matchesStatus = status === "All" || d.status === status;
            return matchesQ && matchesStatus;
        });

        setFilteredDrivers(filtered);
        setCurrentPage(1);
    };

    const resetFilters = async () => {
        setFilters({ q: "", status: "All" });
        await fetchDrivers();
    };

    const openAddModal = () => {
        setModalMode("add");
        setModalData({
            name: "",
            phoneNumber: "",
            licenseNumber: "",
            nic: "",
            address: "",
            status: "Available",
            licenseExpiryDate: "",
            emergencyContact: "",
            driverId: "",
        });
        setShowModal(true);
    };

    const openEditModal = (driver) => {
        setModalMode("edit");
        const dateVal = driver.licenseExpiryDate
            ? new Date(driver.licenseExpiryDate).toISOString().slice(0, 10)
            : "";
        setModalData({
            ...driver,
            licenseExpiryDate: dateVal,
        });
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const generateDriverId = () => {
        if (!drivers || drivers.length === 0) return "DRI-001";
        const numbers = drivers
            .map((d) => {
                if (!d.driverId) return NaN;
                const parts = d.driverId.split("-");
                return parseInt(parts[1], 10);
            })
            .filter((n) => !isNaN(n));
        const nextNumber = numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
        return `DRI-${String(nextNumber).padStart(3, "0")}`;
    };

    const handleModalChange = (e) => {
        setModalData({
            ...modalData,
            [e.target.name]: e.target.value,
        });
    };

    // ✅ Splash screen function
    const triggerSplash = () => {
        setShowSplash(true);
        setFadeOut(false);

        setTimeout(() => {
            setFadeOut(true);
        }, 1500);

        setTimeout(() => {
            setShowSplash(false);
            window.location.reload();
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...modalData,
            licenseExpiryDate: modalData.licenseExpiryDate || "",
        };

        try {
            if (modalMode === "edit" && modalData.driverId) {
                await axios.put(
                    `${API_BASE_URL}/${modalData.driverId}`,
                    payload
                );
                alert("✅ Driver updated successfully!");
            } else {
                const id = generateDriverId();
                payload.driverId = id;
                await axios.post(`${API_BASE_URL}/drivers`, payload);
                alert("✅ Driver added successfully!");
            }

            closeModal();
            triggerSplash(); // ✅ show splash after success

        } catch (err) {
            console.error("Error saving driver", err);
            alert("Error saving driver. See console.");
        }
    };

    const handleDelete = async (driver) => {
        if (!driver || !driver.driverId) return;
        if (!window.confirm("Are you sure you want to delete this driver?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/drivers/${driver.driverId}`);
            alert("✅ Driver deleted successfully!");
            fetchDrivers();
        } catch (err) {
            console.error("Error deleting driver", err);
            alert("Error deleting driver. See console.");
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDrivers = filteredDrivers.slice(startIndex, startIndex + itemsPerPage);

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
                    <h2>Driver Management</h2>
                    <div className="panel-actions">
                        <button className="create-btn" onClick={openAddModal}>
                            Create Driver
                        </button>
                    </div>
                </div>

                <div className="filter-bar">
                    <form className="filter-form" onSubmit={handleSearch}>
                        <div className="filter-row">
                            <input
                                type="text"
                                name="q"
                                placeholder="Search by name, phone, NIC..."
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
                            <button type="submit" className="btn-primary">
                                Search
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={resetFilters}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                <div className="notifications-section">
                    {expiredDrivers.length === 0 ? (
                        <p className="notifications-section-p"></p>
                    ) : (
                        expiredDrivers.map((d) => (
                            <div key={d.driverId} className="notification-card-alert">
                                <p>
                                    ⚡ Driver <strong>{d.name}</strong> has an expired license
                                </p>
                                <small>
                                    Expired on{" "}
                                    {new Date(d.licenseExpiryDate).toLocaleDateString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>

                <div className="table-wrap">
                    <table className="driver-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Dr License</th>
                                <th>Ex Date</th>
                                <th>NIC</th>
                                <th>Address</th>
                                <th>Em Contact</th>
                                <th>Status</th>
                                <th className="actions-col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDrivers.length > 0 ? (
                                paginatedDrivers.map((driver) => (
                                    <tr key={driver.driverId || Math.random()}>
                                        <td>{driver.name || "-"}</td>
                                        <td>{driver.phoneNumber || "-"}</td>
                                        <td>{driver.licenseNumber || "-"}</td>
                                        <td>
                                            {driver.licenseExpiryDate
                                                ? new Date(driver.licenseExpiryDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td>{driver.nic || "-"}</td>
                                        <td>{driver.address || "-"}</td>
                                        <td>{driver.emergencyContact || "-"}</td>
                                        <td>{driver.status || "-"}</td>
                                        <td className="actions-col">
                                            <div className="action-buttons">
                                                <button
                                                    className="icon-btn"
                                                    title="View / Edit"
                                                    onClick={() => openEditModal(driver)}
                                                >
                                                    ...
                                                </button>
                                                <button
                                                    className="delete-small"
                                                    title="Delete"
                                                    onClick={() => handleDelete(driver)}
                                                >
                                                    ⛔
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="no-data">
                                        No drivers found
                                    </td>
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
                    <div
                        className="modal-card"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>{modalMode === "add" ? "Create Driver" : "Edit Driver"}</h3>
                            <button className="close-x" onClick={closeModal}>
                                ✖
                            </button>
                        </div>

                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <label>
                                    Name
                                    <input
                                        name="name"
                                        value={modalData.name}
                                        onChange={handleModalChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Phone
                                    <input
                                        name="phoneNumber"
                                        value={modalData.phoneNumber}
                                        onChange={handleModalChange}
                                        required
                                    />
                                </label>

                                <label>
                                    License Number
                                    <input
                                        name="licenseNumber"
                                        value={modalData.licenseNumber}
                                        onChange={handleModalChange}
                                        required
                                    />
                                </label>

                                <label>
                                    License Expiry Date
                                    <input
                                        type="date"
                                        name="licenseExpiryDate"
                                        value={modalData.licenseExpiryDate || ""}
                                        onChange={handleModalChange}
                                    />
                                </label>

                                <label>
                                    NIC
                                    <input
                                        name="nic"
                                        value={modalData.nic}
                                        onChange={handleModalChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Address
                                    <input
                                        name="address"
                                        value={modalData.address}
                                        onChange={handleModalChange}
                                    />
                                </label>

                                <label>
                                    Emergency Contact
                                    <input
                                        name="emergencyContact"
                                        value={modalData.emergencyContact}
                                        onChange={handleModalChange}
                                    />
                                </label>

                                <label>
                                    Status
                                    <input type="hidden" name="status" value="Available" />
                                    <select disabled style={{ color: "black" }}>
                                        <option value="Available">Available</option>
                                    </select>
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    {modalMode === "add" ? "Add Driver" : "Update Driver"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        if (modalMode === "edit") {
                                            if (
                                                window.confirm(
                                                    "Delete this driver permanently?"
                                                )
                                            ) {
                                                handleDelete(modalData);
                                                closeModal();
                                            }
                                        } else {
                                            closeModal();
                                        }
                                    }}
                                >
                                    {modalMode === "add" ? "Cancel" : "Delete"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddDrivers;
