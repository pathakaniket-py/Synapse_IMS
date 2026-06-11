function Reports() {
  return (
    <>
      <h1 className="page-title">Reports</h1>

      <p className="page-subtitle">
        Generate school reports
      </p>

      <div className="page-top">
        <button
          className="back-btn"
          onClick={() => navigate("-1")}
        >
          ← Back
        </button>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Student Report</h3>
          <button className="btn">
            Generate PDF
          </button>
        </div>

        <div className="card">
          <h3>Fee Collection Report</h3>
          <button className="btn">
            Generate PDF
          </button>
        </div>

        <div className="card">
          <h3>Teacher Salary Report</h3>
          <button className="btn">
            Generate PDF
          </button>
        </div>
      </div>
    </>
  );
}

export default Reports;