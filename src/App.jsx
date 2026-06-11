import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import StudentProfile from "./pages/StudentProfile";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Admission from "./pages/Admission";
import Teachers from "./pages/Teachers";
import Fees from "./pages/Fees";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/admission" element={<Admission />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
