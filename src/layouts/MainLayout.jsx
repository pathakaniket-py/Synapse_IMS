import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdPeople, MdSchool, MdCurrencyRupee, MdAnalytics } from "react-icons/md"; 
import { RiShieldFlashLine } from "react-icons/ri"; // Premium animated centerpiece logo icon

function MainLayout({ children }) {
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        
        {/* Centered Gemini-style Brand Emblem */}
        <div className="logo-container">
          <div className="logo-icon-glow">
            <RiShieldFlashLine size={24} color="#818cf8" />
          </div>
        </div>

        {/* Clean Icon Stack Navigation */}
        <nav>
          <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
            <MdDashboard />
            <span className="nav-text">Dashboard</span>
          </Link>
          
          <Link to="/students" className={`nav-link ${location.pathname.startsWith("/students") ? "active" : ""}`}>
            <MdPeople />
            <span className="nav-text">Students</span>
          </Link>

          <Link to="/teachers" className={`nav-link ${location.pathname === "/teachers" ? "active" : ""}`}>
            <MdSchool />
            <span className="nav-text">Teachers</span>
          </Link>

          <Link to="/fees" className={`nav-link ${location.pathname === "/fees" ? "active" : ""}`}>
            <MdCurrencyRupee />
            <span className="nav-text">Fees</span>
          </Link>

          <Link to="/reports" className={`nav-link ${location.pathname === "/reports" ? "active" : ""}`}>
            <MdAnalytics />
            <span className="nav-text">Reports</span>
          </Link>
        </nav>
      </aside>

      {/* Main Workspace Frame */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;