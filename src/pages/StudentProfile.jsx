import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  async function fetchStudent() {
    // Safety check:thsi wiil not run the query if id is missing or undefined
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <h2 style={{ color: "var(--muted)" }}>Loading Student Records...</h2>
      </div>
    );
  }

  const totalFee = Number(student.total_fee || 0);
  const otherFee = Number(student.other_fee || 0);
  const discountFee = Number(student.discount_fee || 0);
  const totalPaid = Number(student.total_paid || 0);
  
  const calculatedFeePayable = (totalFee + otherFee) - discountFee;
  const remainingBalance = calculatedFeePayable - totalPaid;

  return (
    <>
      <div className="page-top" style={{ marginBottom: "20px" }}>
        <button className="back-btn" onClick={() => navigate("/students")}>
          ← Back to Directory
        </button>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {student.photo_url ? (
            <img 
              src={student.photo_url} 
              alt={student.name} 
              style={{ width: "100%", height: "100%", borderRadius: "14px", objectFit: "cover" }} 
            />
          ) : (
            "👨‍🎓"
          )}
        </div>

        <div className="profile-details">
          <h1>{student.name}</h1>

          <div className="profile-grid">
            <p><strong>Student ID:</strong> {student.student_id}</p>
            {student.roll_no && <p><strong>Roll No:</strong> {student.roll_no}</p>}
            {student.class && <p><strong>Course:</strong> {student.class}</p>}
            {student.admission_date && <p><strong>Admission Date:</strong> {student.admission_date}</p>}
            {student.father_name && <p><strong>Father Name:</strong> {student.father_name}</p>}
            {student.mother_name && <p><strong>Mother Name:</strong> {student.mother_name}</p>}
            {student.gender && <p><strong>Gender:</strong> {student.gender}</p>}
            {student.dob && <p><strong>DOB:</strong> {student.dob}</p>}
            {student.category && <p><strong>Category:</strong> {student.category}</p>}
            
            {student.aadhaar_no && <p><strong>Aadhaar:</strong> {student.aadhaar_no}</p>}
            {student.phone && <p><strong>Mobile:</strong> {student.phone}</p>}
            {student.father_mobile_no && <p><strong>Father Mobile:</strong> {student.father_mobile_no}</p>}

            {student.address && <p className="full-width"><strong>Address:</strong> {student.address}</p>}
          </div>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: "40px" }}>Fee Summary</h2>
      <div className="cards">
        <div className="card">
          <h3>Total Fee</h3>
          <p>₹{totalFee}</p>
        </div>
        <div className="card">
          <h3>Other Fee</h3>
          <p>₹{otherFee}</p>
        </div>
        <div className="card">
          <h3>Discount</h3>
          <p>₹{discountFee}</p>
        </div>
        <div className="card">
          <h3>Fee Payable</h3>
          <p style={{ fontWeight: "700", color: "#ffffff" }}>₹{calculatedFeePayable}</p>
        </div>
        <div className="card">
          <h3>Total Paid</h3>
          <p>₹{totalPaid}</p>
        </div>
        <div className="card">
          <h3>Remaining</h3>
          <p style={{ color: remainingBalance > 0 ? "#f87171" : "#4ade80", fontWeight: "700" }}>
            ₹{remainingBalance}
          </p>
        </div>
      </div>
    </>
  );
}

export default StudentProfile;