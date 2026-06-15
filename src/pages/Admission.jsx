import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";

function Admission() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
  });
  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  async function fetchStudent() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setFormData({
      student_name: data.name || "",

      father_name: data.father_name || "",

      mother_name: data.mother_name || "",

      dob: data.dob || "",

      gender: data.gender || "",

      category: data.category || "",

      aadhaar_no: data.aadhaar_no || "",

      mobile_no: data.phone || "",

      father_mobile_no: data.father_mobile_no || "",

      address: data.address || "",

      course: data.class || "",

      roll_no: data.roll_no || "",

      admission_date: data.admission_date || "",

      total_fee: data.total_fee || "",

      other_fee: data.other_fee || "",

      discount_fee: data.discount_fee || "",
    });

    if (data.photo_url) {
      setPreviewUrl(data.photo_url);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_name || !formData.course) {
      alert("Student Name and Course/Class are required!");
      return;
    }

    setLoading(true);
    let publicPhotoUrl = "";

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `student-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        publicPhotoUrl = data.publicUrl;
      }

      const payload = {
        name: formData.student_name,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        dob: formData.dob,
        gender: formData.gender,
        category: formData.category,
        aadhaar_no: formData.aadhaar_no,
        phone: formData.mobile_no,
        father_mobile_no: formData.father_mobile_no,
        address: formData.address,
        class: formData.course,
        roll_no: formData.roll_no,
        admission_date: formData.admission_date,
        total_fee: Number(formData.total_fee || 0),
        other_fee: Number(formData.other_fee || 0),
        discount_fee: Number(formData.discount_fee || 0),
        photo_url: publicPhotoUrl || previewUrl,
      };

      let dbError;

      if (id) {
        const { error } = await supabase
          .from("students")
          .update(payload)
          .eq("id", id);

        dbError = error;
      } else {
        const studentCode = `ST${Date.now()}`;

        const { error } = await supabase.from("students").insert([
          {
            student_id: studentCode,
            ...payload,
            fee_status: "Due",
          },
        ]);

        dbError = error;
      }

      if (dbError) throw dbError;
      

      alert("Student Profile Registered Successfully!");
      navigate("/students");
    } catch (error) {
      console.error(error);
      alert(`Operation Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="page-top"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button className="back-btn" onClick={() => navigate("/students")}>
          ← Back to Directory
        </button>
        <h1 className="page-title" style={{ fontSize: "24px", margin: 0 }}>
          {id ? "Edit Student Profile" : "New Admission Registration"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* PHOTO UPLOAD  */}
        <div
          className="card"
          style={{ display: "flex", alignItems: "center", gap: "20px" }}
        >
          <div
            className="profile-avatar"
            style={{
              borderRadius: "16px",
              width: "80px",
              height: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(255,255,255,0.03)",
              overflow: "hidden",
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              "📸"
            )}
          </div>
          <div>
            <h3 style={{ marginBottom: "6px" }}>Student Profile Image</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ background: "transparent", border: "none", padding: 0 }}
            />
          </div>
        </div>

        {/* PERSONAL DETAILS */}
        <div className="card">
          <h3>Personal Details</h3>
          <div className="profile-grid">
            <div>
              <strong>Full Name *</strong>
              <input
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <strong>Father's Name</strong>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <strong>Mother's Name</strong>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <strong>Date of Birth</strong>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <strong>Gender</strong>
              <input
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                placeholder="Male / Female / Others"
              />
            </div>
            <div>
              <strong>Category</strong>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="General / OBC / SC / ST"
              />
            </div>
          </div>
        </div>

        {/* COMMUNICATIONS */}
        <div className="card">
          <h3>Contact & Identity Credentials</h3>
          <div className="profile-grid">
            <div>
              <strong>Primary Mobile Number</strong>
              <input
                type="tel"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <strong>Guardian Mobile Number</strong>
              <input
                type="tel"
                name="father_mobile_no"
                value={formData.father_mobile_no}
                onChange={handleChange}
              />
            </div>
            <div>
              <strong>Aadhaar Card Number</strong>
              <input
                type="text"
                name="aadhaar_no"
                value={formData.aadhaar_no}
                onChange={handleChange}
                placeholder="0000-0000-0000"
              />
            </div>
            <div className="full-width">
              <strong>Permanent Residential Address</strong>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, City, State"
              />
            </div>
          </div>
        </div>

        {/* ACADEMIC PROFILE */}
        <div className="card">
          <h3>Academic Information</h3>
          <div className="profile-grid">
            <div>
              <strong>Course / Class Assigned *</strong>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <strong>Class Roll Number</strong>
              <input
                type="text"
                name="roll_no"
                value={formData.roll_no}
                onChange={handleChange}
              />
            </div>
            <div>
              <strong>Date of Admission</strong>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* FINANCIAL BALANCE FEES */}
        <div className="card">
          <h3>Fee Structures</h3>
          <div className="profile-grid">
            <div>
              <strong>Standard Course Fee (₹)</strong>
              <input
                type="number"
                name="total_fee"
                value={formData.total_fee}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <strong>Other External Charges (₹)</strong>
              <input
                type="number"
                name="other_fee"
                value={formData.other_fee}
                onChange={handleChange}
              />
            </div>
            <div>
              <strong>Granted Concession / Discount (₹)</strong>
              <input
                type="number"
                name="discount_fee"
                value={formData.discount_fee}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* EXECUTION ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: "12px 24px" }}
            onClick={() => navigate("/students")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            style={{ padding: "12px 32px" }}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : id
                ? "Update Student"
                : "Finalize Admission"}
          </button>
        </div>
      </form>
    </>
  );
}

export default Admission;
