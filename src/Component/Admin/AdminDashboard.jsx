import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "../../App.css";

const AdminDashboard = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [counts, setCounts] = useState({
        requests: 0,
        assignedRequests: 0,
        availableDrivers: 0,
        availableVehicles: 0,
        expiredVehicles: 0
    });

    const [requestsPerYear, setRequestsPerYear] = useState([]);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [
                    reqRes,
                    assignedRes,
                    driverRes,
                    vehicleRes,
                    expiredRes,
                    requestsYearRes
                ] = await Promise.all([
                    axios.get(`${API_BASE_URL}/vehicle-requests/count`),
                    axios.get(`${API_BASE_URL}/vehicle-requests/count-assigned`),
                    axios.get(`${API_BASE_URL}/drivers/count-available`),
                    axios.get(`${API_BASE_URL}/vehicles/count-available`),
                    axios.get(`${API_BASE_URL}/vehicles/count-expired`),
                    axios.get(`${API_BASE_URL}/vehicle-requests/count-per-year`)
                ]);

                // Update dashboard counts
                setCounts({
                    requests: reqRes.data,
                    assignedRequests: assignedRes.data,
                    availableDrivers: driverRes.data,
                    availableVehicles: vehicleRes.data,
                    expiredVehicles: expiredRes.data
                });


                const backendData = Object.entries(requestsYearRes.data).map(([year, value]) => ({
                    name: year,
                    value
                }));


                const sampleData = [
                    { name: "2020", value: 10 },
                    { name: "2021", value: 30 },
                    { name: "2022", value: 40 },
                    { name: "2023", value: 50 },
                    { name: "2024", value: 65 }
                ];

                const mergedData = [...backendData];
                sampleData.forEach(sample => {
                    if (!mergedData.some(item => item.name === sample.name)) {
                        mergedData.push(sample);
                    }
                });

                // Sort by year ascending
                mergedData.sort((a, b) => a.name.localeCompare(b.name));

                setRequestsPerYear(mergedData);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchCounts();
    }, []);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

    return (
        <div className="admin-dashboard-container">

            <h1 className="admin-dashboard-heading">Dashboard</h1>
            <div className="admin-dashboard-layout">

                <div className="admin-dashboard-left">
                    <h3>Requests Per Year</h3>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={requestsPerYear}
                            dataKey="value"
                            nameKey="name"
                            cx="40%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={0}
                            stroke="none"
                            label={({ name }) => name}
                        >
                            {requestsPerYear.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} Contracts`} />
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                        />
                    </PieChart>
                </div>

                {/* Right Side – Info Cards */}
                <div className="admin-dashboard-right">
                    <div className="admin-dashboard-tag1">
                        <span className="label">Total Requests</span>
                        <span className="value">{counts.requests}</span>
                    </div>

                    <div className="admin-dashboard-tag2">
                        <span className="label">Assigned Requests</span>
                        <span className="value">{counts.assignedRequests}</span>
                    </div>

                    <div className="admin-dashboard-tag3">
                        <span className="label">Available Drivers</span>
                        <span className="value">{counts.availableDrivers}</span>
                    </div>

                    <div className="admin-dashboard-tag4">
                        <span className="label">Available Vehicles</span>
                        <span className="value">{counts.availableVehicles}</span>
                    </div>

                    <div className="admin-dashboard-tag5">
                        <span className="label">Expired Vehicles</span>
                        <span className="value">{counts.expiredVehicles}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
