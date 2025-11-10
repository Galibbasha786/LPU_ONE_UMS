// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import AllotSection from './pages/AllotSection';
import Fees from './pages/Fees';
import StudentFees from './pages/StudentFees';
import StudentAttendance from './pages/StudentAttendance'; // Keep this name to match file
import StudentMarks from './pages/StudentMarks';
import Notifications from './pages/Notifications';
import StudentNotifications from './pages/StudentNotifications';
import Chat from './pages/Chat';
import ClassTimetable from './pages/ClassTimetable';
import ExamTimetable from './pages/ExamTimetable';
import Profile from './pages/Profile';
import AdminCreateStudent from './pages/AdminCreateStudent';
import AIChatbot from './pages/LPUChatbot'
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/allot-section" element={<AllotSection />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/student-fees" element={<StudentFees />} />
          <Route path="/student-attendance" element={<StudentAttendance />} />
          <Route path="/student-marks" element={<StudentMarks />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/student-notifications" element={<StudentNotifications />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/class-timetable" element={<ClassTimetable />} />
          <Route path="/exam-timetable" element={<ExamTimetable />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-student" element={<AdminCreateStudent />} />
          <Route path="/ai-chatbot" element={<AIChatbot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;