import { Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import StudentDashboard from "./Components/StudentDashboard";
import MentorDashboard from "./Components/MentorDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ✅ Student */}
      <Route path="/student" element={<StudentDashboard />} />

      {/* ✅ Teacher */}
      <Route path="/mentor" element={<MentorDashboard />} />
    </Routes>
  );
}
