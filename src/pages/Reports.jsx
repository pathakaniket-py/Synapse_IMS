import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  MdSearch,
  MdArrowDropDown,
  MdPrint,
  MdAssessment,
} from "react-icons/md";

function Reports() {
  const [studentsList, setStudentsList] = useState([]);
  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // Default ko empty rakha hai taaki auto-select na ho
  const [paidTillMonth, setPaidTillMonth] = useState("");
  const [generatedPaymentId, setGeneratedPaymentId] = useState("");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetchStudentsDirectory();
  }, []);

  async function fetchStudentsDirectory() {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(
          "student_id, roll_no, name, class, total_fee, other_fee, discount_fee, total_paid, father_name, phone",
        );
      if (error) throw error;
      setStudentsList(data || []);
    } catch (err) {
      console.error("Error loading student references:", err);
    }
  }

  const filteredStudentSearchOptions = studentsList.filter(
    (s) =>
      s.name?.toLowerCase().includes(studentSearchInput.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(studentSearchInput.toLowerCase()),
  );

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearchInput(`${student.name} (${student.student_id})`);
    setShowDropdown(false);
    setPaidTillMonth(""); // Naye student par wapas reset ho jayega select karne ke liye

    // Unique Payment ID Generator
    const currentYear = new Date().getFullYear();
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const newPaymentId = `SWC-${currentYear}-${randomDigits}`;
    setGeneratedPaymentId(newPaymentId);
  };

  const handlePrintReceipt = () => {
    const printContents = document.getElementById(
      "printable-receipt-canvas",
    ).innerHTML;

    let printFrame = document.getElementById("mobile-print-frame");
    if (!printFrame) {
      printFrame = document.createElement("iframe");
      printFrame.id = "mobile-print-frame";
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "none";
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
    const doc = frameDoc.document || frameDoc;

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Payment Slip</title>
          <style>
            @page { size: portrait; margin: 12mm 10mm; }
            body { font-family: Arial, sans-serif; color: #000000; background: #ffffff; padding: 5px; margin: 0; font-size: 14px; }
            table { width: 100%; max-width: 440px; margin: 12px auto; border-collapse: collapse; }
            th { background: #ffffff !important; color: #000000 !important; padding: 7px 12px; text-align: left; font-weight: normal; width: 45%; border: 1px solid #000000 !important; }
            td { padding: 7px 12px; text-align: left; font-weight: bold; border: 1px solid #000000 !important; }
            .assistance-bar { background-color: #a4bdf2 !important; text-align: center; padding: 7px; font-weight: normal; font-size: 11.5px; border: 1px solid #7395e3; max-width: 416px; margin: 15px auto; }
            .footer-signatures { display: flex; justify-content: space-between; max-width: 440px; margin: 45px auto 10px auto; padding: 0 5px; }
            .sig-block { font-size: 12px; color: #000000; width: 100px; text-align: center; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          <div>${printContents}</div>
          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 300); };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  // Calculations
  const totalFee = Number(selectedStudent?.total_fee || 0);
  const otherFee = Number(selectedStudent?.other_fee || 0);
  const discountFee = Number(selectedStudent?.discount_fee || 0);
  const totalPaid = Number(selectedStudent?.total_paid || 0);

  const calculatedFeePayable = totalFee + otherFee - discountFee;
  const remainingBalance = calculatedFeePayable - totalPaid;

  const currentFormattedDate = new Date().toLocaleDateString("en-IN");

  return (
    <>
      {/* CSS For Immersive Hover States */}
      <style>{`
        .immersive-item {
          transition: all 0.2s ease-in-out;
        }
        .immersive-item:hover {
          background-color: rgba(99, 102, 241, 0.15) !important;
          color: #fff !important;
          padding-left: 20px !important;
        }
      `}</style>

      {/* WEB DASHBOARD WORKSPACE */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 0" }}>
        <div className="page-header" style={{ marginBottom: "30px" }}>
          <h1
            className="page-title"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <MdAssessment style={{ color: "#818cf8" }} /> Student Billing &
            Reports
          </h1>
        </div>

        {/* SEARCH BAR CONTAINER */}
        <div
          className="card"
          style={{
            position: "relative",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <strong
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              color: "#e5e7eb",
            }}
          >
            Search Student Profile (Type Name or Student ID)
          </strong>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <MdSearch
              style={{
                position: "absolute",
                left: "14px",
                color: "var(--muted)",
                fontSize: "22px",
              }}
            />
            <input
              type="text"
              placeholder="Search by ID or student name..."
              value={studentSearchInput}
              onChange={(e) => {
                setStudentSearchInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowDropdown(false);
                }, 250);
              }}
              style={{
                width: "100%",
                padding: "14px 40px 14px 45px",
                fontSize: "15px",
                borderRadius: "10px",
              }}
            />
            <MdArrowDropDown
              style={{
                position: "absolute",
                right: "14px",
                color: "var(--muted)",
                fontSize: "24px",
                pointerEvents: "none",
              }}
            />
          </div>

          {/*  IMMERSIVE & HIGHLY CURVED SUGGESTION DROPDOWN */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "24px",
                right: "24px",
                background: "linear-gradient(145deg, #1f2937, #111827)",
                border: "1px solid rgba(129, 140, 248, 0.25)",
                borderRadius: "16px", // Highly Curved
                marginTop: "10px",
                maxHeight: "240px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow:
                  "0 12px 30px rgba(0, 0, 0, 0.4), 0 4px 10px rgba(0,0,0,0.3)",
                padding: "6px",
              }}
            >
              {filteredStudentSearchOptions.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    color: "var(--muted)",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  🔍 No student entries matched that search text
                </div>
              ) : (
                filteredStudentSearchOptions.map((student) => (
                  <div
                    key={student.student_id}
                    onClick={() => handleSelectStudent(student)}
                    className="immersive-item"
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderRadius: "10px", // Curved corners for items
                      color: "#e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "2px",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>{student.name}</span>
                    <span
                      style={{
                        color: "#818cf8",
                        fontSize: "13px",
                        background: "rgba(129, 140, 248, 0.1)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {student.student_id}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ACCOUNT MANAGEMENT PANEL */}
        {selectedStudent ? (
          <div className="card" style={{ padding: "28px" }}>
            {/* CLEAN STUDENT PROFILE SUMMARY */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "16px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: "#fff", fontSize: "20px" }}>
                  {selectedStudent.name}
                </h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    color: "var(--muted)",
                    fontSize: "13px",
                  }}
                >
                  Student ID: {selectedStudent.student_id} |{" "}
                  <span style={{ color: "#fcd34d" }}>
                    Payment ID: {generatedPaymentId}
                  </span>
                </p>
              </div>
            </div>

            {/* SINGLE CONTROLS BUBBLE */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(17, 24, 39, 0.9))",
                border: "1px solid rgba(129, 140, 248, 0.15)",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* Header inside bubble */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#818cf8",
                  }}
                ></div>
                <label
                  style={{
                    color: "#94a3b8",
                    fontWeight: "600",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Fee Paid Till Month Of:
                </label>
              </div>

              {/* Flex Row Container */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                {/* Month Dropdown Selector (Not Auto-Selected) */}
                <div style={{ position: "relative", width: "240px" }}>
                  <select
                    value={paidTillMonth}
                    onChange={(e) => setPaidTillMonth(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 40px 11px 14px",
                      background: "#1e293b",
                      color: paidTillMonth ? "#f8fafc" : "#94a3b8",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      appearance: "none",
                      outline: "none",
                    }}
                  >
                    {/* Placeholder option so nothing is pre-selected */}
                    <option
                      value=""
                      disabled
                      style={{ background: "#1e293b", color: "#94a3b8" }}
                    >
                      Select Month
                    </option>
                    {monthNames.map((m) => (
                      <option
                        key={m}
                        value={m}
                        style={{ background: "#1e293b", color: "#fff" }}
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                  <div
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#818cf8",
                      pointerEvents: "none",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <MdArrowDropDown style={{ fontSize: "22px" }} />
                  </div>
                </div>

                {/* Print Action Button */}
                <button
                  onClick={handlePrintReceipt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 22px",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <MdPrint style={{ fontSize: "18px" }} /> Print Invoice Bill
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              border: "2px dashed var(--border)",
              borderRadius: "12px",
            }}
          >
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Select a student above to review accounting layouts.
            </p>
          </div>
        )}
      </div>

      {/* HIDDEN PRINT CANVAS LAYOUT */}
      <div style={{ display: "none" }}>
        <div
          id="printable-receipt-canvas"
          style={{ width: "100%", maxWidth: "800px", padding: "20px", margin: "0 auto" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "15px",
            }}
          >
            <img
              src="/logo.jpeg"
              alt="Institute Logo"
              style={{
                width: "100px",
                height:"100px",
                objectFit: "contain",
              }}
            />

            <div style={{ textAlign: "left" }}>
              <h2
                style={{
                  margin: "0 0 2px 0",
                  fontSize: "28px",
                  fontWeight: "800",
                }}
              >
                SUCCESS WITH CLASS
              </h2>

              <p
                style={{
                  margin: "0",
                  fontSize: "15px",
                  color: "#333",
                }}
              >
                Patut, Bikram, Patna
              </p>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              letterSpacing: "1px",
              fontWeight: "bold",
              borderBottom: "2px solid #000",
              display: "block",
              paddingBottom: "4px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Payment Slip
          </div>

          <table>
            <tbody>
              <tr>
                <th>Payment ID</th>
                <td>{generatedPaymentId || "—"}</td>
              </tr>
              <tr>
                <th>Roll No</th>
                <td>{selectedStudent?.roll_no || "—"}</td>
              </tr>
              <tr>
                <th>Course</th>
                <td>{selectedStudent?.class || "—"}</td>
              </tr>
              <tr>
                <th>Student Name</th>
                <td>{selectedStudent?.name || "—"}</td>
              </tr>
              <tr>
                <th>Father's Name</th>
                <td>{selectedStudent?.father_name || "—"}</td>
              </tr>
              <tr>
                <th>Payment Date</th>
                <td>{currentFormattedDate}</td>
              </tr>
              <tr>
                <th>Paid Till</th>
                <td>{paidTillMonth || "Not Selected"}</td>
              </tr>
              <tr>
                <th>Received Amount</th>
                <td>₹ {totalPaid ? Number(totalPaid).toFixed(2) : "0.00"}</td>
              </tr>

              <tr>
                <th>Fee Payable</th>
                <td>₹ {calculatedFeePayable}</td>
              </tr>
              <tr>
                <th>Total Paid Amount</th>
                <td>₹ {totalPaid}</td>
              </tr>
              <tr>
                <th>Remaining Amount</th>
                <td>₹ {remainingBalance}</td>
              </tr>
            </tbody>
          </table>

          <div className="assistance-bar">
            For any assistance call us :- 7277543702 (Office Hrs.)
          </div>

          <div className="footer-signatures">
            <div
              className="sig-block"
              style={{ borderTop: "1px dashed #000", paddingTop: "15px" }}
            >
              Signature
            </div>
            <div
              className="sig-block"
              style={{ borderTop: "1px dashed #000", paddingTop: "15px" }}
            >
              Stamp
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reports;
