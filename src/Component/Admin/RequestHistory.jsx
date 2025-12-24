import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../../App.css";

export default function RequestHistory() {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedYear, setSelectedYear] = useState("All");
    const [selectedMonth, setSelectedMonth] = useState("All");
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [expandedRequestId, setExpandedRequestId] = useState(null);
    const [assignedDetails, setAssignedDetails] = useState({});
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/vehicle-requests/admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let data = res.data;

            data.sort((a, b) => {
                const numA = parseInt(a.requestId.split("-").pop(), 10);
                const numB = parseInt(b.requestId.split("-").pop(), 10);
                return numB - numA;
            });

            setRequests(data);

            const yearSet = new Set(data.map((r) => new Date(r.travelDateTime).getFullYear()));
            setYears(["All", ...Array.from(yearSet).sort((a, b) => b - a)]);
            setFilteredRequests(data);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const handleYearChange = (e) => {
        const year = e.target.value;
        setSelectedYear(year);
        setSelectedMonth("All");

        if (year === "All") {
            setMonths([]);
            setFilteredRequests(requests);
        } else {
            const monthSet = new Set(
                requests
                    .filter((r) => new Date(r.travelDateTime).getFullYear().toString() === year)
                    .map((r) => new Date(r.travelDateTime).getMonth() + 1)
            );
            setMonths(["All", ...Array.from(monthSet).sort((a, b) => a - b)]);
            setFilteredRequests(
                requests.filter((r) => new Date(r.travelDateTime).getFullYear().toString() === year)
            );
        }
    };

    const handleMonthChange = (e) => {
        const month = e.target.value;
        setSelectedMonth(month);

        if (month === "All") {
            setFilteredRequests(
                requests.filter(
                    (r) =>
                        selectedYear === "All" ||
                        new Date(r.travelDateTime).getFullYear().toString() === selectedYear
                )
            );
        } else {
            setFilteredRequests(
                requests.filter((r) => {
                    const d = new Date(r.travelDateTime);
                    return (
                        (selectedYear === "All" || d.getFullYear().toString() === selectedYear) &&
                        (d.getMonth() + 1).toString() === month
                    );
                })
            );
        }
    };

    const toggleExpand = async (id) => {
        if (expandedRequestId === id) {
            setExpandedRequestId(null);
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/vehicle-requests/${id}/assigned-details`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAssignedDetails((prev) => ({
                ...prev,
                [id]: res.data,
            }));
            setExpandedRequestId(id);
        } catch (err) {
            console.error("Error fetching assigned details:", err);
        }
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const exportPDF = () => {
        if (filteredRequests.length === 0) {
            alert("No data to export!");
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Vehicle Requests Report", 14, 15);

        const headers = [
            "Request ID",
            "Requester",
            "Traveler",
            "Department",
            "Destination",
            "Travel Date & Time",
            "Status"
        ];

        const rows = filteredRequests.map((r) => [
            r.requestId,
            r.requesterName,
            r.travelerName,
            r.department,
            r.destination,
            new Date(r.travelDateTime).toLocaleString(),
            r.status,
        ]);

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 25,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        });

        doc.save(`Vehicle_Requests_${selectedYear}_${selectedMonth}.pdf`);
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            filteredRequests.map((r) => ({
                "Request ID": r.requestId,
                Requester: r.requesterName,
                Traveler: r.travelerName,
                Department: r.department,
                Destination: r.destination,
                "Travel Date": new Date(r.travelDateTime).toLocaleString(),
                Status: r.status,
            }))
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Requests");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `Vehicle_Requests_${selectedYear}_${selectedMonth}.xlsx`);
    };

    return (
        <div className="vehicle-assign-history-container">
            <h2>Vehicle Request Full History</h2>

            <div className="vehicle-history">
                <label>Filter by Year:</label>
                <select value={selectedYear} onChange={handleYearChange}>
                    {years.map((y, i) => (
                        <option key={i} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                {months.length > 0 && (
                    <>
                        <label>Filter by Month:</label>
                        <select value={selectedMonth} onChange={handleMonthChange}>
                            {months.map((m, i) => (
                                <option key={i} value={m}>
                                    {m === "All" ? "All" : monthNames[m - 1]}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                <button className="btn-pdf" onClick={exportPDF}>Export PDF</button>
                <button className="btn-excel" onClick={exportExcel}>Export Excel</button>

            </div>


            {filteredRequests.length === 0 ? (
                <p>No requests found.</p>
            ) : (
                <div className="grid-container">
                    {filteredRequests.map((r) => (
                        <div key={r.requestId} className="grid-card">
                            <table className="info-table">
                                <tbody>
                                    <tr> <th>Request ID</th>  <td>{r.requestId}</td> </tr>
                                    <tr> <th>Requester</th>  <td>{r.requesterName}</td> </tr>
                                    <tr> <th>Request Position</th>  <td>{r.requesterPosition}</td> </tr>
                                    <tr> <th>Traveler</th>  <td>{r.travelerName}</td> </tr>
                                    <tr> <th>Traveler Position</th>  <td>{r.travelerPosition}</td> </tr>
                                    <tr> <th>Department</th>  <td>{r.department}</td> </tr>
                                    <tr> <th>Phone Number</th>  <td>{r.phoneNumber}</td> </tr>
                                    <tr> <th>Duty Nature</th>  <td>{r.dutyNature}</td> </tr>
                                    <tr> <th>Destination</th>  <td>{r.destination}</td> </tr>
                                    <tr>
                                        <th>Travel Date & Time</th>
                                        <td>{new Date(r.travelDateTime).toLocaleString()}</td>
                                    </tr>

                                    <tr> <th>Reason</th>  <td>{r.reason}</td> </tr>
                                    <tr> <th>Status</th>  <td>{r.status}</td> </tr>

                                    <tr>
                                        <th colSpan={2} style={{ textAlign: "center" }}>
                                            <button
                                                className="btn-toggle-details"
                                                onClick={() => toggleExpand(r.requestId)}
                                            >
                                                {expandedRequestId === r.requestId ? "Hide Details" : "Show Assigned Driver & Vehicle"}
                                            </button>
                                        </th>
                                    </tr>


                                    {expandedRequestId === r.requestId &&
                                        assignedDetails[r.requestId] && (
                                            <>
                                                {assignedDetails[r.requestId].assignedVehicle && (
                                                    <>
                                                        <tr>
                                                            <th colSpan={2} style={{ textAlign: "center", backgroundColor: "#185a9d" }}>
                                                                Vehicle Details
                                                            </th>
                                                        </tr>

                                                        <tr> <th>Vehicle Number</th>  <td> {assignedDetails[r.requestId].assignedVehicle.vehicleNumber} </td> </tr>
                                                        <tr> <th>Type</th>  <td> {assignedDetails[r.requestId].assignedVehicle.vehicleType} </td> </tr>
                                                        <tr> <th>Manufacturer</th>  <td> {assignedDetails[r.requestId].assignedVehicle.manufacturer} </td> </tr>
                                                        <tr> <th>Model</th>  <td> {assignedDetails[r.requestId].assignedVehicle.model} </td> </tr>
                                                        <tr> <th>License Number</th>  <td> {assignedDetails[r.requestId].assignedVehicle.licenseNumber} </td> </tr>
                                                        <tr> <th>License IssueDate</th>  <td> {assignedDetails[r.requestId].assignedVehicle.licenseIssueDate} </td> </tr>
                                                        <tr> <th>License ExpiryDate</th>  <td> {assignedDetails[r.requestId].assignedVehicle.licenseExpiryDate} </td> </tr>
                                                        <tr> <th>Status</th>  <td> {assignedDetails[r.requestId].assignedVehicle.status} </td> </tr>
                                                    </>
                                                )}

                                                {assignedDetails[r.requestId].assignedDriver && (
                                                    <>
                                                        <tr>
                                                            <th colSpan={2} style={{ textAlign: "center", backgroundColor: "#59ba9b" }}>
                                                                Driver Details
                                                            </th>
                                                        </tr>

                                                        <tr> <th>Driver name</th>  <td> {assignedDetails[r.requestId].assignedDriver.name} </td> </tr>
                                                        <tr> <th>Phone Number</th>  <td> {assignedDetails[r.requestId].assignedDriver.phoneNumber} </td> </tr>
                                                        <tr> <th>License Number</th>  <td> {assignedDetails[r.requestId].assignedDriver.licenseNumber} </td> </tr>
                                                        <tr> <th>NIC</th>  <td> {assignedDetails[r.requestId].assignedDriver.nic} </td> </tr>
                                                        <tr> <th>Address</th>  <td> {assignedDetails[r.requestId].assignedDriver.address} </td> </tr>
                                                        <tr> <th>Status</th>  <td> {assignedDetails[r.requestId].assignedDriver.status} </td> </tr>
                                                    </>
                                                )}
                                            </>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}