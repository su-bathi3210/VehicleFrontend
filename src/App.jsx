import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import EmployeeDashboard from "./Component/Employee/EmployeeDashboard";
import AdminDashboard from "./Component/Admin/AdminDashboard";
import ApprovalDashboard from "./Component/ApprovalDashboard";
import Login from "./Component/Logins/Login";
import VehicleRequestForm from "./Component/Employee/VehicleRequestForm";
import AdminNavBar from "./Component/NavBar/AdminNavBar";
import AdminSideBar from "./Component/NavBar/AdminSideBar";
import Assign from "./Component/Admin/Assign";
import RequestHistory from "./Component/Admin/RequestHistory";
import AddVehicle from "./Component/Admin/AddVehicle";
import AddDrivers from "./Component/Admin/AddDrivers";
import VehicleRecords from "./Component/Admin/VehicleRecords";
import EmployeeLogin from "./Component/Logins/EmployeeLogin";
import RequestCancel from "./Component/Employee/RequestCancle";

const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return token != null;
};

const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const AdminLayout = () => {
    return (
        <div> <AdminNavBar /> <div style={{ display: "flex", flex: 1 }}> <AdminSideBar /> <div> <Outlet /> </div> </div> </div>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<EmployeeDashboard />} />
                <Route path="/VehicleRequestForm" element={<VehicleRequestForm />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/ApprovalOfficer" element={<ApprovalDashboard />} />
                <Route path="/EmployeeLogin" element={<EmployeeLogin />} />
                <Route path="/RequestCancel" element={<RequestCancel />} />


                <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                    <Route path="/Admin" element={<AdminDashboard />} />
                    <Route path="/Assign" element={<Assign />} />
                    <Route path="/RequestHistory" element={<RequestHistory />} />
                    <Route path="/AddVehicle" element={<AddVehicle />} />
                    <Route path="/AddDrivers" element={<AddDrivers />} />
                    <Route path="/VehicleRecords" element={<VehicleRecords />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
