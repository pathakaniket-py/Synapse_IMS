import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

function Fees() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [formData, setFormData] = useState({
    student_id: "",
    student_name: "",
    class: "",
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    dues: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchPayments();
  }, []);

  async function fetchStudents() {
    const { data, error } = await supabase.from("students").select("*").order("name");
    if (!error) setStudents(data);
  }

  async function fetchPayments() {
    const { data, error } = await supabase.from("payments").select("*").order("id", { ascending: false });
    if (!error) setPayments(data);
  }

  const addPayment = async () => {
    if (!formData.student_id || !formData.payment_date || !formData.amount) {
      alert("Fill all required fields");
      return;
    }

    const receiptNo = `RCPT-${Date.now()}`;
    const { error } = await supabase.from("payments").insert([
      {
        student_id: formData.student_id,
        student_name: formData.student_name,
        class: formData.class,
        payment_date: formData.payment_date,
        amount: Number(formData.amount),
        dues: Number(formData.dues || 0),
        receipt_no: receiptNo,
        status: "Paid",
      },
    ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    await fetchPayments();
    setFormData({
      student_id: "",
      student_name: "",
      class: "",
      payment_date: new Date().toISOString().split("T")[0],
      amount: "",
      dues: "",
    });
    setShowModal(false);
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete payment statement?")) return;
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    fetchPayments();
  };

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const totalDues = payments.reduce(
    (sum, payment) => sum + Number(payment.dues || 0),
    0
  );

  const filteredPayments = payments.filter(
    (payment) =>
      payment.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      payment.receipt_no?.toLowerCase().includes(search.toLowerCase()) ||
      payment.payment_date?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-subtitle">Manage student payments and collections</p>
        </div>

        <button className="btn" onClick={() => setShowModal(true)}>
          + Receive Payment
        </button>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Total Collected</h3>
          <p style={{ color: "#4ade80" }}>₹{totalRevenue}</p>
        </div>

        <div className="card">
          <h3>Outstanding Dues</h3>
          <p style={{ color: "#f87171" }}>₹{totalDues}</p>
        </div>

        <div className="card">
          <h3>Transactions</h3>
          <p>{payments.length}</p>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search receipt number, student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Student</th>
              <th>Class</th>
              <th>Date</th>
              <th>Amount Paid</th>
              <th>Dues Left</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "var(--muted)", padding: "30px" }}>
                  No payment histories found.
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td style={{ color: "#a5b4fc", fontWeight: "600" }}>{payment.receipt_no}</td>
                  <td>{payment.student_name}</td>
                  <td>{payment.class}</td>
                  <td>{payment.payment_date}</td>
                  <td style={{ color: "#4ade80", fontWeight: "600" }}>₹{payment.amount}</td>
                  <td style={{ color: payment.dues > 0 ? "#f87171" : "var(--muted)" }}>₹{payment.dues}</td>
                  <td>
                    <button className="delete-btn" onClick={() => deletePayment(payment.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Receive Fee Payment</h2>

            <input
              type="text"
              placeholder="Type student name or search by code..."
              value={formData.student_name || studentSearch}
              onChange={(e) => {
                setFormData({ ...formData, student_name: "" });
                setStudentSearch(e.target.value);
              }}
            />

            {studentSearch.length > 0 && (
              <div className="student-dropdown">
                {students
                  .filter(
                    (student) =>
                      (student.name || "").toLowerCase().includes(studentSearch.toLowerCase()) ||
                      (student.student_id || "").toLowerCase().includes(studentSearch.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((student) => (
                    <div
                      key={student.id}
                      className="student-option"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          student_id: student.student_id,
                          student_name: student.name,
                          class: student.class,
                        });
                        setStudentSearch("");
                      }}
                    >
                      <div><strong>{student.name}</strong></div>
                      <div style={{ color: "var(--muted)" }}>{student.student_id}</div>
                    </div>
                  ))}
              </div>
            )}

            {formData.student_name && (
              <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", margin: "4px 0" }}>
                <h4 style={{ color: "#ffffff" }}>{formData.student_name}</h4>
                <p style={{ fontSize: "12px", color: "var(--muted)" }}>ID: {formData.student_id} | Class: {formData.class}</p>
              </div>
            )}

            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            />
            
            <input
              placeholder="Amount Paid (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />

            <input
              placeholder="Remaining Dues (₹)"
              value={formData.dues}
              onChange={(e) => setFormData({ ...formData, dues: e.target.value })}
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn" onClick={addPayment}>
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Fees;