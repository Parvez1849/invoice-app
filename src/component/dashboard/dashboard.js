import React, { useState } from "react";
import "./dashboard.css";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [isSideNavVisible, setSideNavVisible] = useState(false); // Mobile toggle state

  const logout = () => {
    setLoading(true);
    signOut(auth)
      .then(() => {
        localStorage.clear();
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const profileImage = localStorage.getItem("photoURL") || "/default-avatar.png"; // Fallback to a default image if not found
  const companyName = localStorage.getItem("cName") || "Your Company Name";

  // Toggle sidebar visibility for mobile devices
  const toggleSideNav = () => {
    setSideNavVisible(!isSideNavVisible);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger menu for mobile */}
      <button className="hamburger" onClick={toggleSideNav}>
        About us ☰
      </button>

      {/* Side Navigation */}
      <div className={`side-nav ${isSideNavVisible ? "active" : ""}`}>
        <div className="profile-info">
          <img
            src={profileImage}
            alt="Profile"
            className="profile-image"
            onError={(e) => (e.target.src = "/default-avatar.png")} // Fallback if image fails to load
          />
          <div>
            <p>{companyName}</p>
            <button onClick={logout} disabled={isLoading}>
              {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : "Logout"}
            </button>
          </div>
        </div>
        <hr />
        <div className="menu">
          <Link to="/dashboard/home" className="menu-link" onClick={toggleSideNav}>
            <i className="fa-solid fa-house"></i> Home
          </Link>
          <Link to="/dashboard/invoices" className="menu-link" onClick={toggleSideNav}>
            <i className="fa-solid fa-file-invoice"></i> Invoices
          </Link>
          <Link to="/dashboard/newinvoice" className="menu-link" onClick={toggleSideNav}>
            <i className="fa-solid fa-file-circle-plus"></i> New Invoice
          </Link>
          <Link to="/dashboard/setting" className="menu-link" onClick={toggleSideNav}>
            <i className="fa-solid fa-gear"></i> Setting
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
