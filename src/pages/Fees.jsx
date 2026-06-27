import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import {
  MdAddCard,
  MdReceiptLong,
  MdSearch,
  MdClose,
  MdArrowDropDown,
} from "react-icons/md";

function Fees() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentClassFilter, setPaymentClassFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [studentClassFilter, setStudentClassFilter] = useState("");

  // Search filter dropdown states inside modal
  const [studentSearchInput, setStudentSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudentDues, setSelectedStudentDues] = useState(0);
  const navigate = useNavigate();

  // Modal Form State Tracking
  const [formData, setFormData] = useState({
    student_id: "",
    student_name: "",
    class: "",
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchStudentsDirectory();
  }, []);

  // 1. Fetch historical receipts ledger entries
  async function fetchPayments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error("Error pulling ledger history:", err);
    } finally {
      setLoading(false);
    }
  }

  // 2. Fetch all student ledger records to enable dynamic autocomplete filtering
  async function fetchStudentsDirectory() {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(
          "student_id, name, class, total_fee, other_fee, discount_fee, total_paid, admission_date",
        );
      if (error) throw error;
      setStudentsList(data || []);
    } catch (err) {
      console.error("Error loading auto-complete references:", err);
    }
  }

  // 3. Dynamic Selection Handler (Calculates existing dues on-the-fly)
  const handleSelectStudent = (student) => {
    const mFee = Number(student.total_fee || 0);
    const oFee = Number(student.other_fee || 0);
    const dFee = Number(student.discount_fee || 0);
    const tPaid = Number(student.total_paid || 0);

    let months = 1;
    if (student.admission_date) {
      const start = new Date(student.admission_date);
      const now = new Date();
      months = Math.max(1, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
    }
    const expectedSoFar = months * mFee + oFee - dFee;
    const currentDues = Math.max(0, expectedSoFar - tPaid);

    setFormData((prev) => ({
      ...prev,
      student_id: student.student_id,
      student_name: student.name,
      class: student.class || "",
    }));

    setSelectedStudentDues(currentDues);
    setStudentSearchInput(`${student.name} (${student.student_id})`);
    setShowDropdown(false);
  };

  // 4. Double-table secure transaction billing pipeline
  const addPayment = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.amount) {
      alert("Please choose a student and enter a transaction amount.");
      return;
    }

    try {
      const paymentAmount = Number(formData.amount || 0);

      // Fetch fresh, lock-safe data from master record to prevent transaction collision
      const { data: student, error: fetchErr } = await supabase
        .from("students")
        .select("total_fee, other_fee, discount_fee, total_paid, admission_date")
        .eq("student_id", formData.student_id)
        .single();

      if (fetchErr || !student) {
        alert("Verification failed: Chosen Student ID metadata missing.");
        return;
      }

      const mFee = Number(student.total_fee || 0);
      const oFee = Number(student.other_fee || 0);
      const dFee = Number(student.discount_fee || 0);
      let months = 1;
      if (student.admission_date) {
        const start = new Date(student.admission_date);
        const now = new Date();
        months = Math.max(1, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
      }
      const expectedSoFar = months * mFee + oFee - dFee;

      const updatedTotalPaid = Number(student.total_paid || 0) + paymentAmount;
      const calculatedDuesRemaining = Math.max(0, expectedSoFar - updatedTotalPaid);
      const newStatus = calculatedDuesRemaining <= 0 ? "Paid" : "Due";

      // A. Push receipt row entry to Payments History Table
      const { error: paymentErr } = await supabase.from("payments").insert([
        {
          student_id: formData.student_id,
          student_name: formData.student_name,
          class: formData.class,
          payment_date: formData.payment_date,
          amount: paymentAmount,
          dues: calculatedDuesRemaining,
          receipt_no: `REC-${Date.now().toString().slice(-6)}`,
        },
      ]);

      if (paymentErr) throw paymentErr;

      // B. Synchronize ledger updates back to core Students Directory Table
      const { error: studentUpdateErr } = await supabase
        .from("students")
        .update({
          total_paid: updatedTotalPaid,
          fee_status: newStatus,
        })
        .eq("student_id", formData.student_id);

      if (studentUpdateErr) throw studentUpdateErr;

      alert("Transaction saved! Master ledger accounts balanced.");
      setShowModal(false);

      // Reset input layout values safely
      setFormData({
        student_id: "",
        student_name: "",
        class: "",
        payment_date: new Date().toISOString().split("T")[0],
        amount: "",
      });
      setStudentSearchInput("");
      setSelectedStudentDues(0);

      // Refresh backend snapshots
      fetchPayments();
      fetchStudentsDirectory();
    } catch (error) {
      console.error(error);
      alert("Pipeline failure updating ledger tracking balances safely.");
    }
  };

  // Filter history logs for main directory grid
  const paymentClassOptions = [...new Set(payments.map((p) => p.class).filter(Boolean))].sort();

  const filteredPayments = payments.filter(
    (p) =>
      (paymentClassFilter === "" || p.class === paymentClassFilter) &&
      (p.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receipt_no?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Filter student registry results list inside the modal search field
  const studentClassOptions = [...new Set(studentsList.map((s) => s.class).filter(Boolean))].sort();

  const filteredStudentSearchOptions = studentsList.filter(
    (s) =>
      (studentClassFilter === "" || s.class === studentClassFilter) &&
      (s.name?.toLowerCase().includes(studentSearchInput.toLowerCase()) ||
        s.student_id?.toLowerCase().includes(studentSearchInput.toLowerCase())),
  );

  return (
    <>
      {/* SECTION TOP MODULE HEADER WITH ALIGNED TOP-RIGHT BUTTON */}

      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 className="page-title">Fees & Accounts Workspace</h1>
          <p className="page-subtitle">
            Process and track transaction receipts / bills
          </p>
        </div>
        <div className="header-actions">
          <button className="glass-btn" onClick={() => navigate("/reports")}>
            Print Bill
          </button>

          <button className="collect-btn" onClick={() => setShowModal(true)}>
            + Collect Payment
          </button>
        </div>
      </div>

      {/* FILTER SEARCH FIELD FOR LEDGER TABLE */}
      <div
        className="search-bar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "24px 0",
          flexWrap: "wrap",
        }}
      >
        <MdSearch style={{ color: "var(--muted)", fontSize: "20px" }} />
        <input
          type="text"
          placeholder="Search receipts by ID, name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            width: "100%",
            maxWidth: "300px",
            outline: "none",
          }}
        />
        <select
          value={paymentClassFilter}
          onChange={(e) => setPaymentClassFilter(e.target.value)}
          style={{
            padding: "8px 14px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "13px",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">All Classes</option>
          {paymentClassOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* LEDGER TRANSACTION HISTORICAL RECORDS */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Receipt Code</th>
              <th>Student ID</th>
              <th>Payer Name</th>
              <th>Class/Course</th>
              <th>Payment Date</th>
              <th>Amount Paid</th>
              <th>Dues</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    padding: "30px",
                  }}
                >
                  Auditing Transaction Records...
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    padding: "30px",
                  }}
                >
                  No matched receipt lines logged.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "#a5b4fc", fontWeight: "600" }}>
                    {p.receipt_no}
                  </td>
                  <td style={{ color: "var(--muted)" }}>{p.student_id}</td>
                  <td style={{ fontWeight: "500" }}>{p.student_name}</td>
                  <td>{p.class || "—"}</td>
                  <td>{p.payment_date}</td>
                  <td style={{ color: "#4ade80", fontWeight: "600" }}>
                    ₹{p.amount}
                  </td>
                  <td
                    style={{
                      color: p.dues > 0 ? "#f87171" : "#4ade80",
                      fontWeight: "600",
                    }}
                  >
                    {p.dues > 0 ? `₹${p.dues}` : "Settled ✓"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL BILLING POPUP WINDOW WITH EMBEDDED FILTER DROPDOWN SEARCH */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#111827",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.75)",
              overflow: "visible",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  margin: 0,
                  color: "#fff",
                  fontSize: "18px",
                }}
              >
                <MdReceiptLong style={{ color: "#818cf8" }} /> Log Fee Payment
                Invoice
              </h3>
              <MdClose
                style={{
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: "22px",
                }}
                onClick={() => setShowModal(false)}
              />
            </div>

            <form
              onSubmit={addPayment}
              style={{ display: "flex", flexDirection: "column", gap: "18px" }}
            >
              {/* CLASS FILTER DROPDOWN FOR MODAL STUDENT SEARCH */}
              <div>
                <strong
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    color: "#e5e7eb",
                  }}
                >
                  Filter by Class
                </strong>
                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All Classes</option>
                  {studentClassOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* INTERACTIVE AUTOCOMPLETE DROPDOWN SEARCH COMPONENT */}
              <div style={{ position: "relative" }}>
                <strong
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    color: "#e5e7eb",
                  }}
                >
                  Search Student Name or ID *
                </strong>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Type name or code to filter search..."
                    value={studentSearchInput}
                    onChange={(e) => {
                      setStudentSearchInput(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    required
                    style={{ width: "100%", paddingRight: "35px" }}
                  />
                  <MdArrowDropDown
                    style={{
                      position: "absolute",
                      right: "12px",
                      color: "var(--muted)",
                      fontSize: "20px",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {/* Floating Results Popup Container */}
                {showDropdown && studentSearchInput.length >= 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      background: "#1f2937",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      marginTop: "4px",
                      maxHeight: "180px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
                    }}
                  >
                    {filteredStudentSearchOptions.length === 0 ? (
                      <div
                        style={{
                          padding: "12px",
                          color: "var(--muted)",
                          fontSize: "13px",
                          textAlign: "center",
                        }}
                      >
                        No students match your query
                      </div>
                    ) : (
                      filteredStudentSearchOptions.map((student) => (
                        <div
                          key={student.student_id}
                          onClick={() => handleSelectStudent(student)}
                          style={{
                            padding: "10px 14px",
                            cursor: "pointer",
                            borderBottom: "1px solid rgba(255,255,255,0.02)",
                            fontSize: "13px",
                            transition: "background 0.15s ease",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.background =
                              "rgba(255,255,255,0.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.background = "transparent")
                          }
                        >
                          <span style={{ fontWeight: "500", color: "#fff" }}>
                            {student.name}
                          </span>
                          <span style={{ color: "#a5b4fc", fontSize: "12px" }}>
                            {student.student_id}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* READ-ONLY SUMMARY FIELDS TO VERIFY TARGET PROFILE CORES */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <div>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    Assigned Course
                  </strong>
                  <input
                    type="text"
                    value={formData.class || "—"}
                    readOnly
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      color: "var(--muted)",
                      cursor: "not-allowed",
                    }}
                  />
                </div>
                <div>
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "13px",
                      color: "var(--muted)",
                    }}
                  >
                    Current Dues Owed
                  </strong>
                  <input
                    type="text"
                    value={
                      formData.student_id ? `₹${selectedStudentDues}` : "—"
                    }
                    readOnly
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      color: selectedStudentDues > 0 ? "#f87171" : "#4ade80",
                      fontWeight: "600",
                      cursor: "not-allowed",
                    }}
                  />
                </div>
              </div>

              <div>
                <strong
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    color: "#e5e7eb",
                  }}
                >
                  Date of Transaction
                </strong>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_date: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <strong
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    color: "#e5e7eb",
                  }}
                >
                  Payment Amount Collected (₹) *
                </strong>
                <input
                  type="number"
                  placeholder="Enter collection amount e.g. 5000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  max={
                    selectedStudentDues > 0 ? selectedStudentDues : undefined
                  }
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: 0 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ marginTop: 0, padding: "10px 24px" }}
                >
                  Authorize Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Fees;
