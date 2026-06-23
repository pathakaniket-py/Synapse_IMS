import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdCurrencyRupee,
  MdAnalytics,
} from "react-icons/md";
import { RiShieldFlashLine } from "react-icons/ri";

function MainLayout({ children }) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeSidebarOnMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="layout">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-toggle-trigger"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? "✕ Menu" : "☰ Menu"}
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          isMobileOpen ? "mobile-expanded" : "mobile-collapsed"
        }`}
      >
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-icon-glow">
            <RiShieldFlashLine size={24} color="#818cf8" />
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <Link
            to="/"
            className={`nav-link ${
              location.pathname === "/" ? "active" : ""
            }`}
            onClick={closeSidebarOnMobile}
          >
            <MdDashboard />
            <span className="nav-text">Dashboard</span>
          </Link>

          <Link
            to="/students"
            className={`nav-link ${
              location.pathname.startsWith("/students") ? "active" : ""
            }`}
            onClick={closeSidebarOnMobile}
          >
            <MdPeople />
            <span className="nav-text">Students</span>
          </Link>

          <Link
            to="/teachers"
            className={`nav-link ${
              location.pathname === "/teachers" ? "active" : ""
            }`}
            onClick={closeSidebarOnMobile}
          >
            <MdSchool />
            <span className="nav-text">Teachers</span>
          </Link>

          <Link
            to="/fees"
            className={`nav-link ${
              location.pathname === "/fees" ? "active" : ""
            }`}
            onClick={closeSidebarOnMobile}
          >
            <MdCurrencyRupee />
            <span className="nav-text">Fees</span>
          </Link>

          <Link
            to="/reports"
            className={`nav-link ${
              location.pathname === "/reports" ? "active" : ""
            }`}
            onClick={closeSidebarOnMobile}
          >
            <MdAnalytics />
            <span className="nav-text">Billing</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;