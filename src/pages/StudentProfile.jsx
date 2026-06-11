import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function StudentProfile() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetchStudent();
  }, []);

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

    setStudent(data);
  }

  if (!student) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <div className="profile-header">
        <div className="profile-avatar">
          {student.photo_url ? (
            <img src={student.photo_url} alt={student.student_name} />
          ) : (
            "👨‍🎓"
          )}
          
        </div>

        <div className="profile-details">
          <h1>{student.name}</h1>

          <div className="profile-grid">
            <p>
              <strong>Student ID:</strong> {student.student_id}
            </p>
            <p>
              <strong>Roll No:</strong> {student.roll_no}
            </p>

            <p>
              <strong>Course:</strong> {student.course}
            </p>
            <p>
              <strong>Admission Date:</strong> {student.admission_date}
            </p>

            <p>
              <strong>Father Name:</strong> {student.father_name}
            </p>
            <p>
              <strong>Mother Name:</strong> {student.mother_name}
            </p>

            <p>
              <strong>Gender:</strong> {student.gender}
            </p>
            <p>
              <strong>DOB:</strong> {student.dob}
            </p>

            <p>
              <strong>Category:</strong> {student.category}
            </p>
            <p>
              <strong>Aadhaar:</strong> {student.aadhaar_no}
            </p>

            <p>
              <strong>Mobile:</strong> {student.mobile_no}
            </p>
            <p>
              <strong>Father Mobile:</strong> {student.father_mobile_no}
            </p>

            <p className="full-width">
              <strong>Address:</strong> {student.address}
            </p>
          </div>
        </div>
      </div>
      <h2 className="section-title">Fee Summary</h2>

      <div className="cards">
        <div className="card">
          <h3>Total Fee</h3>
          <p>₹{student.total_fee}</p>
        </div>

        <div className="card">
          <h3>Other Fee</h3>
          <p>₹{student.other_fee}</p>
        </div>

        <div className="card">
          <h3>Discount</h3>
          <p>₹{student.discount_fee}</p>
        </div>

        <div className="card">
          <h3>Fee Payable</h3>
          <p>₹{student.fee_payable}</p>
        </div>

        <div className="card">
          <h3>Total Paid</h3>
          <p>₹{student.total_paid}</p>
        </div>

        <div className="card">
          <h3>Remaining</h3>
          <p>₹{student.remaining_amount}</p>
        </div>
      </div>
    </>
  );
}

export default StudentProfile;
