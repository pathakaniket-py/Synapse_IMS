import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

function Students() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_name: "",
    father_name: "",
    mother_name: "",
    roll_no: "",
    course: "",
    admission_date: "",
    aadhaar_no: "",
    dob: "",
    gender: "",
    category: "",
    mobile_no: "",
    father_mobile_no: "",
    address: "",
    total_fee: "",
    other_fee: "",
    discount_fee: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("id");

    if (error) {
      console.error(error);
      return;
    }
    setStudents(data);
  }

  const updateStudent = async () => {
    const { error } = await supabase
      .from("students")
      .update({
        name: formData.name,
        father_name: formData.father_name,
        class: formData.class,
        phone: formData.phone,
      })
      .eq("id", editingStudent.id);

    if (error) {
      console.error(error);
      return;
    }

    setEditingStudent(null);
    setShowModal(false);
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    const confirmDelete = window.confirm("Delete this student?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    fetchStudents();
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      father_name: student.father_name || "",
      class: student.class || "",
      phone: student.phone || "",
    });
    setShowModal(true);
  };

  const addStudent = async () => {
    if (!formData.name || !formData.class) return;
    const studentCode = `ST${Date.now()}`;

    const { error } = await supabase.from("students").insert([
      {
        student_id: studentCode,
        student_name: formData.student_name,
        roll_no: formData.roll_no,
        course: formData.course,
        admission_date: formData.admission_date,
        father_name: formData.father_name,
        mother_name: formData.mother_name,
        aadhaar_no: formData.aadhaar_no,
        dob: formData.dob,
        gender: formData.gender,
        category: formData.category,
        mobile_no: formData.mobile_no,
        father_mobile_no: formData.father_mobile_no,
        address: formData.address,
      },
    ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    await fetchStudents();
    setFormData({ name: "", father_name: "", class: "", phone: "" });
    setShowModal(false);
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (student.student_id || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage student records</p>
        </div>

        <button className="btn" onClick={() => navigate("/admission")}>
          + New Admission
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search student by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Guardian</th>
              <th>Class</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "var(--muted)", padding: "30px" }}>
                  No student records found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: "600", color: "#ffffff" }}>{student.student_id}</td>
                  <td>{student.name}</td>
                  <td>{student.father_name}</td>
                  <td>{student.class}</td>
                  <td>{student.phone}</td>
                  <td>
                    <span className={student.fee_status === "Paid" ? "status-paid" : "status-due"}>
                      {student.fee_status || "Due"}
                    </span>
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => navigate(`/students/${student.id}`)}>
                      View
                    </button>
                    <button className="edit-btn" onClick={() => openEditModal(student)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => deleteStudent(student.id)}>
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
            <h2>{editingStudent ? "Edit Student Details" : "Add New Student"}</h2>

            <input
              type="text"
              placeholder="Student Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <input
              placeholder="Roll Number"
              value={formData.roll_no}
              onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
            />

            <input
              placeholder="Course / Class"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            />
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button className="btn" onClick={editingStudent ? updateStudent : addStudent}>
                {editingStudent ? "Update Records" : "Save Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Students;