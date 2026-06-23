import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import {
  MdPeople,
  MdSchool,
  MdCurrencyRupee,
  MdReceiptLong,
  MdPersonAdd,
  MdAddCard,
  MdAnalytics,
} from "react-icons/md";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCollected: 0,
    totalOutstanding: 0,
  });

  const [recentStudents, setRecentStudents] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  async function fetchDashboardMetrics() {
    try {
      setLoading(false);
      const { data: studentsData } = await supabase
        .from("students")
        .select("*")
        .order("id", { ascending: false });
      const { data: teachersData } = await supabase
        .from("teachers")
        .select("id");
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .order("id", { ascending: false });

      const totalStuds = studentsData ? studentsData.length : 0;
      const totalTechs = teachersData ? teachersData.length : 0;
      const revenue = paymentsData
        ? paymentsData.reduce((sum, p) => sum + Number(p.amount || 0), 0)
        : 0;
      const dues = paymentsData
        ? paymentsData.reduce((sum, p) => sum + Number(p.dues || 0), 0)
        : 0;

      setStats({
        totalStudents: totalStuds,
        totalTeachers: totalTechs,
        totalCollected: revenue,
        totalOutstanding: dues,
      });
      setRecentStudents(studentsData ? studentsData.slice(0, 5) : []);
      setRecentPayments(paymentsData ? paymentsData.slice(0, 5) : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(true);
    }
  }

  if (!loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <h2 style={{ color: "var(--muted)" }}>Loading Hang tight...</h2>
      </div>
    );
  }

  return (
    <>
      {/* BRAND NAME & DESCRIPTION  */}
      <div className="page-header" style={{ marginBottom: "40px" }}>
        <div>
          <h1
            className="page-title"
            style={{
              fontSize: "32px",
              fontWeight: "900",
              letterSpacing: "-0.5px",
            }}
          >
            Synapse IMS{" "}
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                padding: "4px 8px",
                background: "rgba(99, 102, 241, 0.15)",
                color: "#a5b4fc",
                borderRadius: "6px",
                marginLeft: "8px",
                verticalAlign: "middle",
              }}
            >
              v1.0.3
            </span>
          </h1>
          <p
            className="page-subtitle"
            style={{
              fontSize: "15px",
              marginTop: "6px",
              color: "var(--muted)",
            }}
          >
            Automated Working System — Real-time oversight, automated revenue,
            and registry auditing.
          </p>
        </div>
      </div>

      {/* METRIC SUMMARIES */}
      <div className="cards" style={{ marginBottom: "35px" }}>
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3>Total Enrolled</h3>
            <MdPeople style={{ fontSize: "24px", color: "#818cf8" }} />
          </div>
          <p>
            {stats.totalStudents}{" "}
            <span
              style={{
                fontSize: "14px",
                fontWeight: "400",
                color: "var(--muted)",
              }}
            >
              Students
            </span>
          </p>
        </div>

        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3>Active Faculty</h3>
            <MdSchool style={{ fontSize: "24px", color: "#c084fc" }} />
          </div>
          <p>
            {stats.totalTeachers}{" "}
            <span
              style={{
                fontSize: "14px",
                fontWeight: "400",
                color: "var(--muted)",
              }}
            >
              Teachers
            </span>
          </p>
        </div>

        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3>Revenue Collected</h3>
            <MdCurrencyRupee style={{ fontSize: "24px", color: "#4ade80" }} />
          </div>
          <p style={{ color: "#4ade80" }}>₹{stats.totalCollected}</p>
        </div>

        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3>Pending Balances</h3>
            <MdReceiptLong style={{ fontSize: "24px", color: "#f87171" }} />
          </div>
          <p style={{ color: "#f87171" }}>₹{stats.totalOutstanding}</p>
        </div>
      </div>

      {/* SYSTEM CONTROLS SHORTCUTS */}
      <h3
        style={{
          color: "#ffffff",
          fontSize: "16px",
          marginBottom: "16px",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        System Command Shortcuts
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        <button
          className="theme-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "16px",
            marginTop: 0,
          }}
          onClick={() => navigate("/admission")}
        >
          <MdPersonAdd style={{ fontSize: "18px" }} /> Start New Admission
        </button>
        <button
          className="theme-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "16px",
            marginTop: 0,
          }}
          onClick={() => navigate("/fees")}
        >
          <MdAddCard style={{ fontSize: "18px" }} /> Receive Fee Payment
        </button>
        <button
          className="theme-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "16px",
            marginTop: 0,
          }}
          onClick={() => navigate("/reports")}
        >
          <MdAnalytics style={{ fontSize: "18px" }} /> Generate Bill / Invoice
        </button>
      </div>

      {/* DATA GRIDS RECENT ENTRIES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <div>
          <h4
            style={{
              color: "#ffffff",
              fontSize: "15px",
              marginBottom: "12px",
              fontWeight: "600",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Recently Enrolled Candidates</span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--accent)",
                cursor: "pointer",
              }}
              onClick={() => navigate("/students")}
            >
              View Database →
            </span>
          </h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Code ID</th>
                  <th>Student Name</th>
                  <th>Class / Course</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        color: "var(--muted)",
                        padding: "20px",
                      }}
                    >
                      No recent entries found.
                    </td>
                  </tr>
                ) : (
                  recentStudents.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <td style={{ color: "#a5b4fc", fontWeight: "600" }}>
                        {student.student_id}
                      </td>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>
                        <span
                          className={
                            student.fee_status === "Paid"
                              ? "status-paid"
                              : "status-due"
                          }
                        >
                          {student.fee_status || "Due"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4
            style={{
              color: "#ffffff",
              fontSize: "15px",
              marginBottom: "12px",
              fontWeight: "600",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Recent Payment Receipts</span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--accent)",
                cursor: "pointer",
              }}
              onClick={() => navigate("/fees")}
            >
              View Ledger →
            </span>
          </h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Payer Name</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        color: "var(--muted)",
                        padding: "20px",
                      }}
                    >
                      No recent payments.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td style={{ color: "var(--muted)" }}>
                        {payment.receipt_no}
                      </td>
                      <td style={{ fontWeight: "500" }}>
                        {payment.student_name}
                      </td>
                      <td>{payment.payment_date}</td>
                      <td style={{ color: "#4ade80", fontWeight: "600" }}>
                        ₹{payment.amount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
