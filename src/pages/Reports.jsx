import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  MdSearch,
  MdArrowDropDown,
  MdPrint,
  MdAssessment,
} from "react-icons/md";
import { RiShieldFlashLine } from "react-icons/ri";

function Reports() {
  const [studentsList, setStudentsList] = useState([]);
  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudentsDirectory();
  }, []);

  async function fetchStudentsDirectory() {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(
          "student_id, name, class, total_fee, other_fee, discount_fee, total_paid, father_name, phone",
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
  };

  // PURE BILL PRINT CONTROLLER ENGINE by Ai 

  const handlePrintReceipt = () => {
    // 1. Target the DOM container block of our printable receipt element
    const printContents = document.getElementById(
      "printable-receipt-canvas",
    ).innerHTML;

    // 2. Opens a completely empty, temporary browser shell window
    const printWindow = window.open("", "_blank", "width=800,height=900");

    // 3. Document writes the core structure, styles, and data rows directly into the frame
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt Invoice — ${selectedStudent.student_id}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #000000;
              background: #ffffff;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .invoice-wrapper {
              padding: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 25px;
            }
            th {
              background: #111827 !important;
              color: #ffffff !important;
              padding: 12px;
              text-align: left;
              font-size: 13px;
              font-weight: 600;
              border: 1px solid #111827;
            }
            td {
              padding: 12px;
              font-size: 13px;
              border-bottom: 1px solid #e5e7eb;
            }
            .row-highlight-payable {
              background: #f3f4f6 !important;
              font-weight: bold;
            }
            .row-highlight-paid {
              background: #ecfdf5 !important;
              color: #047857 !important;
              font-weight: bold;
              border-top: 2px solid #047857;
            }
            .row-highlight-dues {
              background: #fef2f2 !important;
              color: #b91c1c !important;
              font-weight: bold;
              border-top: 1px dashed #6b7280;
            }
            .settled-text {
              color: #15803d !important;
              background: #f0fdf4 !important;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            ${printContents}
          </div>
          <script>
            // Automatically prompt the print manager, then close the hidden shell frame
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const totalFee = Number(selectedStudent?.total_fee || 0);
  const otherFee = Number(selectedStudent?.other_fee || 0);
  const discountFee = Number(selectedStudent?.discount_fee || 0);
  const totalPaid = Number(selectedStudent?.total_paid || 0);
  const calculatedFeePayable = totalFee + otherFee - discountFee;
  const remainingBalance = calculatedFeePayable - totalPaid;

  const dynamicReceiptCode = `RCPT-${Date.now().toString().slice(-6)}`;
  const currentFormattedDate = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* WEB DESKTOP DASHBOARD LAYER (Untouched, Safe from Page Deformations) */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 0" }}>
        <div className="page-header" style={{ marginBottom: "30px" }}>
          <h1
            className="page-title"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <MdAssessment style={{ color: "#818cf8" }} /> Student Billing
            Reports
          </h1>
          <p className="page-subtitle">
            Search a student profile to audit their bill or
            issue a printable statement
          </p>
        </div>

        {/* SEARCH BAR INPUT BOX */}
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

          {/* AUTOCOMPLETE FLOATING SEARCH BOX */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "24px",
                right: "24px",
                background: "#1f2937",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                marginTop: "6px",
                maxHeight: "220px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
            >
              {filteredStudentSearchOptions.length === 0 ? (
                <div
                  style={{
                    padding: "14px",
                    color: "var(--muted)",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  No student entries matched that search text
                </div>
              ) : (
                filteredStudentSearchOptions.map((student) => (
                  <div
                    key={student.student_id}
                    onClick={() => handleSelectStudent(student)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.02)",
                      fontSize: "14px",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>{student.name}</span>
                    <span style={{ color: "#a5b4fc", fontSize: "13px" }}>
                      {student.student_id}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ACCOUNT PREVIEW STATS */}
        {selectedStudent ? (
          <div className="card" style={{ padding: "28px" }}>
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
                  ID reference number: {selectedStudent.student_id}
                </p>
              </div>
              <button
                className="theme-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: 0,
                  padding: "10px 20px",
                }}
                onClick={handlePrintReceipt}
              >
                <MdPrint style={{ fontSize: "18px" }} /> Print Official
                Statement
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "30px",
                fontSize: "14px",
              }}
            >
              <p style={{ margin: 0 }}>
                <strong style={{ color: "var(--muted)" }}>Course:</strong>{" "}
                {selectedStudent.class || "—"}
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: "var(--muted)" }}>Father Name:</strong>{" "}
                {selectedStudent.father_name || "—"}
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: "var(--muted)" }}>
                  Mobile Contact:
                </strong>{" "}
                {selectedStudent.phone || "—"}
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: "var(--muted)" }}>
                  Account State:
                </strong>{" "}
                <span
                  style={{
                    color: remainingBalance > 0 ? "#f87171" : "#4ade80",
                    fontWeight: "600",
                  }}
                >
                  {remainingBalance > 0
                    ? "Dues Outstanding"
                    : "Account Cleared ✓"}
                </span>
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 6px 0",
                    color: "var(--muted)",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Net Fee Payable
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  ₹{calculatedFeePayable}
                </p>
              </div>
              <div
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 6px 0",
                    color: "var(--muted)",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Total Fees Collected
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#4ade80",
                  }}
                >
                  ₹{totalPaid}
                </p>
              </div>
              <div
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 6px 0",
                    color: "var(--muted)",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                >
                  Remaining Balance
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: remainingBalance > 0 ? "#f87171" : "#4ade80",
                  }}
                >
                  ₹{remainingBalance}
                </p>
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
              No profiles queried yet. Select a student above to review
              accounting layouts or print vouchers.
            </p>
          </div>
        )}
      </div>

      {/*
         This block stays completely hidden from the web UI screen layout
         */}
      <div style={{ display: "none" }}>
        <div id="printable-receipt-canvas">
          {/* Header Branding Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #000",
              paddingBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  background: "#111827",
                  padding: "10px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <RiShieldFlashLine size={32} color="#818cf8" />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "800",
                    letterSpacing: "-0.5px",
                    color: "#111827",
                  }}
                >
                  Synapse AWS
                </h1>
                <p
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "12px",
                    color: "#4b5563",
                  }}
                >
                  Patna, Bihar, India • Contact: support@synapse.aws
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Invoice
              </h2>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "13px",
                  color: "#1f2937",
                }}
              >
                <strong>Doc Code Reference:</strong> {dynamicReceiptCode}
              </p>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "12px",
                  color: "#4b5563",
                }}
              >
                <strong>Date of Generation:</strong> {currentFormattedDate}
              </p>
            </div>
          </div>

          {/* Profile Identity Details Lines */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              margin: "30px 0",
              padding: "18px",
              background: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
                <strong>Student ID:</strong> {selectedStudent?.student_id}
              </p>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
                <strong>Student Name:</strong> {selectedStudent?.name}
              </p>
              <p style={{ margin: "0", fontSize: "13px" }}>
                <strong>Assigned Class/Course:</strong>{" "}
                {selectedStudent?.class || "—"}
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
                <strong>Father / Guardian Name:</strong>{" "}
                {selectedStudent?.father_name || "—"}
              </p>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
                <strong>Registered Mobile No:</strong>{" "}
                {selectedStudent?.phone || "—"}
              </p>
              <p style={{ margin: "0", fontSize: "13px" }}>
                <strong>Ledger Status Tag:</strong>{" "}
                {remainingBalance <= 0
                  ? "Account Satisfied ✓"
                  : "Dues Unresolved"}
              </p>
            </div>
          </div>

          {/* Financial Breakdown Table Layout */}
          <table>
            <thead>
              <tr>
                <th>Bill Summary</th>
                <th style={{ textAlign: "right", width: "150px" }}>
                  Amount Balance (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Standard Course Fee</td>
                <td style={{ textAlign: "right" }}>₹{totalFee}</td>
              </tr>
              <tr>
                <td>Other / External Fee</td>
                <td style={{ textAlign: "right" }}>₹{otherFee}</td>
              </tr>
              <tr>
                <td style={{ color: "#b91c1c", fontStyle: "italic" }}>
                  Less: Granted Waivers / Concessions (-)
                </td>
                <td style={{ textAlign: "right", color: "#b91c1c" }}>
                  -₹{discountFee}
                </td>
              </tr>
              <tr class="row-highlight-payable">
                <td>Net Calculated Fees</td>
                <td style={{ textAlign: "right" }}>₹{calculatedFeePayable}</td>
              </tr>
              <tr class="row-highlight-paid">
                <td>TOTAL PAYMENTS RECEIVED (CREDIT)</td>
                <td style={{ textAlign: "right" }}>-₹{totalPaid}</td>
              </tr>
              <tr class="row-highlight-dues ${remainingBalance <= 0 ? 'settled-text' : ''}">
                <td>REMAINING BALANCE/DUES</td>
                <td style={{ textAlign: "right" }}>
                  {remainingBalance > 0
                    ? `₹${remainingBalance}`
                    : "Fully Settled ✓"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Voucher Authority Block */}
          <div
            style={{
              marginTop: "100px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <p style={{ margin: "0", fontSize: "11px", color: "#6b7280" }}>
                * Certified institutional financial database account extract
                statement.
              </p>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "11px",
                  color: "#6b7280",
                }}
              >
                Authorized audit document generated from cloud records engine.
              </p>
            </div>
            <div style={{ textAlign: "center", width: "200px" }}>
              <div
                style={{
                  borderBottom: "1px solid #000",
                  width: "100%",
                  marginBottom: "8px",
                }}
              ></div>
              <p
                style={{
                  margin: "0",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Auditor Stamp
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reports;
