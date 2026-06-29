import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  async function fetchStudent() {
    if (!id || id === "undefined") {
      console.warn("Aborted profile fetch: ID is undefined.");
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching student profile:", error);
      return;
    }
    setStudent(data);
  }

  if (!student) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <h2 style={{ color: "var(--muted)" }}>Loading Student Records...</h2>
      </div>
    );
  }

  // --- DYNAMIC DATA CALCULATIONS ---
  const monthlyFee = Number(student.total_fee || 0);
  const otherFee = Number(student.other_fee || 0);
  const discountFee = Number(student.discount_fee || 0);
  const paidFee = Number(student.total_paid || 0);

  // Total balance computation logic
  const totalPayable = monthlyFee + otherFee - discountFee;
  const dueFee = totalPayable - paidFee;

  // Real-time calculation of Current Month Name
  const currentMonthName = new Date().toLocaleString("default", { month: "long" });

  // Fallback engine to dynamically switch color tokens
  let statusText = "Unpaid";
  let statusClass = "unpaid";

  if (dueFee <= 0 && totalPayable > 0) {
    statusText = "Paid";
    statusClass = "paid";
  } else if (paidFee > 0 && dueFee > 0) {
    statusText = "Partial";
    statusClass = "partial";
  }

  const initials = student.name
    ? student.name
        .split(" ")
        .map((word) => word)
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "NA";

  return (
    <>
      <div className="page-top" style={{ marginBottom: "20px" }}>
        <button className="back-btn" onClick={() => navigate("/students")}>
          Back to Directory
        </button>
      </div>

      {/* TOP DASHBOARD GRID CONTAINER */}
      <div 
        className="student-dashboard" 
        style={{ 
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
          alignItems: "stretch" 
        }}
      >
        {/* LEFT CARD: STUDENT PROFILE */}
        <div 
          className="student-card" 
          style={{ 
            display: "flex", 
            gap: "24px", 
            alignItems: "center", 
            padding: "24px",
            height: "100%",
            boxSizing: "border-box",
            margin: 0
          }}
        >
          <div 
            className="student-photo" 
            style={{ 
              width: "120px", 
              height: "140px", 
              minWidth: "120px",
              borderRadius: "8px", 
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            {student.photo_url ? (
              <img src={student.photo_url} alt={student.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{initials}</span>
            )}
          </div>

          <div className="student-basic" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "1.6rem" }}>{student.name}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <p style={{ margin: 0 }}>
                <strong style={{ fontSize: "11px", color: "#8a94a6" }}>Student ID</strong>
                <br />
                {student.student_id}
              </p>

              <p style={{ margin: 0 }}>
                <strong style={{ fontSize: "11px", color: "#8a94a6" }}>Admission No.</strong>
                <br />
                {student.roll_no || "--"}
              </p>

              <p style={{ margin: 0, gridColumn: "span 2" }}>
                <strong style={{ fontSize: "11px", color: "#8a94a6" }}>Class</strong>
                <br />
                {student.class || "--"}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: CURRENT MONTH DYNAMIC FEES */}
        <div 
          className="current-fee-card"
          style={{
            padding: "24px",
            height: "100%",
            boxSizing: "border-box",
            margin: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <h3 className="section-title" style={{ marginTop: 0, marginBottom: "16px" }}>Current Month</h3>

          <div className="fee-info" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="fee-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Monthly Fee</span>
              <strong>₹{monthlyFee}</strong>
            </div>

            <div className="fee-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Paid</span>
              <strong>₹{paidFee}</strong>
            </div>

            <div className="fee-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Due</span>
              <strong className="due-text" style={{ color: dueFee > 0 ? "#ff4d4f" : "inherit" }}>₹{dueFee}</strong>
            </div>

            <div className="fee-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Status</span>
              <span className={`status-badge ${statusClass}`}>{statusText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH STUDENT DETAILS ROW */}
      <div className="ledger-card" style={{ marginBottom: "20px", width: "100%", boxSizing: "border-box" }}>
        <div className="ledger-title" style={{ marginBottom: "20px" }}>Student Details</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", width: "100%" }}>
          {[
            { label: "ADMISSION DATE", value: formatDate(student.admission_date) },
            { label: "FATHER NAME", value: student.father_name },
            { label: "MOTHER NAME", value: student.mother_name },
            { label: "GENDER", value: student.gender },
            { label: "DATE OF BIRTH", value: formatDate(student.dob) },
            { label: "CATEGORY", value: student.category },
            { label: "AADHAAR", value: student.aadhaar_no },
            { label: "MOBILE", value: student.phone },
            { label: "FATHER MOBILE", value: student.father_mobile_no },
            { label: "ADDRESS", value: student.address, isAddress: true }
          ].map((item, index) => (
            <div 
              key={index} 
              style={{ 
                flex: item.isAddress ? "0 1 auto" : "1 1 calc(20% - 16px)",
                minWidth: item.isAddress ? "200px" : "160px",
                backgroundColor: "rgba(255, 255, 255, 0.03)", 
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "8px", 
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                boxSizing: "border-box"
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#8a94a6", letterSpacing: "0.5px" }}>
                {item.label}
              </span>
              <span style={{ fontSize: "14px", color: "#ffffff", wordBreak: "break-word" }}>
                {item.value || "--"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MONTHLY FEE LEDGER WITH INTEGRATED LIVE BACKEND DATA */}
      <div className="ledger-card">
        <div className="ledger-title">Monthly Fee Ledger</div>

        <table className="ledger-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Monthly Fee</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>{currentMonthName}</td>
              <td>₹{monthlyFee}</td>
              <td>₹{paidFee}</td>
              <td style={{ color: dueFee > 0 ? "#ff4d4f" : "inherit" }}>₹{dueFee}</td>
              <td>
                <span className={`status ${statusClass}`}>{statusText}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default StudentProfile;
