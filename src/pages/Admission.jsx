import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

function Admission() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    student_name: "",
    father_name: "",
    mother_name: "",
    dob: "",
    gender: "",
    category: "",
    aadhaar_no: "",
    mobile_no: "",
    father_mobile_no: "",
    address: "",
    course: "",
    roll_no: "",
    admission_date: new Date().toISOString().split("T")[0],
    total_fee: "",
    other_fee: "",
    discount_fee: "",
    photo_url: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_name || !formData.course) {
      alert("Student Name and Course/Class are strictly required fields.");
      return;
    }

    setLoading(true);
    const studentCode = `ST${Date.now()}`;

    const { error } = await supabase.from("students").insert([
      {
        student_id: studentCode,
        name: formData.student_name, // maps to table column schema
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        dob: formData.dob,
        gender: formData.gender,
        category: formData.category,
        phone: formData.mobile_no, // maps to phone column track
        address: formData.address,
        class: formData.course, // maps to class column track
        roll_no: formData.roll_no,
        admission_date: formData.admission_date,
        total_fee: Number(formData.total_fee || 0),
        other_fee: Number(formData.other_fee || 0),
        discount_fee: Number(formData.discount_fee || 0),
        fee_status: "Due"
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert(`Database insertion fault: ${error.message}`);
      return;
    }

    alert("Student Profile Registered Successfully!");
    navigate("/students");
  };

  return (
    <>
      <div className="page-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="back-btn" onClick={() => navigate("/students")}>
          ← Back to Student Records
        </button>
        <div>
          <h1 className="page-title" style={{ fontSize: "26px", margin: 0 }}>New Admission Registration</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* SECTION 1: PHOTO */}
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="profile-avatar" style={{ fontSize: "32px", borderRadius: "16px", width: "80px", height: "80px" }}>
            📸
          </div>
          <div>
            <h3 style={{ marginBottom: "6px" }}>Student Profile Image</h3>
            <input 
              type="file" 
              accept="image/*" 
              style={{ background: "transparent", border: "none", padding: 0 }} 
            />
          </div>
        </div>

        {/* SECTION 2: PERSONAL IDENTITY */}
        <div className="card">
          <h3>Personal Details</h3>
          <div className="profile-grid">
            <div>
              <strong>Full Name *</strong>
              <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div>
              <strong>Father's Name</strong>
              <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} placeholder="Alex Doe" />
            </div>
            <div>
              <strong>Mother's Name</strong>
              <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} placeholder="Mary Doe" />
            </div>
            <div>
              <strong>Date of Birth</strong>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div>
              <strong>Gender</strong>
              <input type="text" name="gender" value={formData.gender} onChange={handleChange} placeholder="Male / Female / Other" />
            </div>
            <div>
              <strong>Category</strong>
              <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="General / OBC / SC / ST" />
            </div>
          </div>
        </div>

        {/* SECTION 3: COMMUNICATIONS */}
        <div className="card">
          <h3>Contact</h3>
          <div className="profile-grid">
            <div>
              <strong>Primary Mobile Number</strong>
              <input type="tel" name="mobile_no" value={formData.mobile_no} onChange={handleChange} placeholder="9999999999" />
            </div>
            <div>
              <strong>Guardian Mobile Number</strong>
              <input type="tel" name="father_mobile_no" value={formData.father_mobile_no} onChange={handleChange} placeholder="8888888888" />
            </div>
             <div className="full-width">
              <strong>Permanent Residential Address</strong>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street, City, Postal State Code" />
            </div>
          </div>
        </div>

        {/* SECTION 4: ACADEMIC PROFILE */}
        <div className="card">
          <h3>Academic Information</h3>
          <div className="profile-grid">
            <div>
              <strong>Course / Class Assigned *</strong>
              <input type="text" name="course" value={formData.course} onChange={handleChange} required placeholder="Computer Science 101" />
            </div>
            <div>
              <strong>Class Roll Number</strong>
              <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} placeholder="BTech-04" />
            </div>
            <div>
              <strong>Date of Admission</strong>
              <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SECTION 5: FINANCIAL BALANCE FEES */}
        <div className="card">
          <h3>Fee Structures</h3>
          <div className="profile-grid">
            <div>
              <strong>Standard Course Fee (₹)</strong>
              <input type="number" name="total_fee" value={formData.total_fee} onChange={handleChange} placeholder="50000" />
            </div>
            <div>
              <strong>Other External Charges (₹)</strong>
              <input type="number" name="other_fee" value={formData.other_fee} onChange={handleChange} placeholder="2500" />
            </div>
            <div>
              <strong>Granted Concession / Discount (₹)</strong>
              <input type="number" name="discount_fee" value={formData.discount_fee} onChange={handleChange} placeholder="5000" />
            </div>
          </div>
        </div>

        {/* FORM CONTROLS EXECUTION ACTIONS */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginBottom: "40px" }}>
          <button type="button" className="btn-secondary" style={{ padding: "12px 24px" }} onClick={() => navigate("/students")}>
            Cancel Registration
          </button>
          <button type="submit" className="btn" style={{ padding: "12px 32px" }} disabled={loading}>
            {loading ? "Processing..." : "Finalize Admission"}
          </button>
        </div>
      </form>
    </>
  );
}

export default Admission;