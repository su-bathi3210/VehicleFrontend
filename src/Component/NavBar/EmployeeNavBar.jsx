import React from "react";
import { Link } from "react-router-dom";

import "../../App.css";
import Logo from "../../Assets/DCDLogo.png";

export default function EmployeeNavBar() {
    return (
        <>
            <div className="header">
                <div className="header-left">
                    <img src={Logo} alt="Left Logo" className="logo" />
                    <div>
                        <h1>Department of Cooperative Development - Sri Lanka</h1>
                        <p>Central Province</p>
                    </div>
                </div>

                <div className="header-right">
                    <Link to="/Login">
                        <button>
                            <span className="emoji">🛡️</span> Login as Admin / Approval Officer</button>
                    </Link>
                    <p>For administrators and supervisors only</p>
                </div>
            </div>
        </>
    );
}
