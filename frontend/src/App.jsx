// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import AllotSection from './pages/AllotSection';
import Fees from './pages/Fees';
import StudentFees from './pages/StudentFees';
import StudentAttendance from './pages/StudentAttendance';
import StudentMarks from './pages/StudentMarks';
import Notifications from './pages/Notifications';
import StudentNotifications from './pages/StudentNotifications';
import Chat from './pages/Chat';
import ClassTimetable from './pages/ClassTimetable';
import ExamTimetable from './pages/ExamTimetable';
import Profile from './pages/Profile';
import AdminCreateStudent from './pages/AdminCreateStudent';
import AdminCreateTeacher from './pages/AdminCreateTeacher';
import StaffManagement from './pages/StaffManagement';
import AIChatbot from './pages/LPUChatbot';
import HomePage from './pages/HomePage';
import StudentBulkUpload from './pages/StudentBulkUpload';
import Scholarships from './pages/Scholarships';
import FinancialReports from './pages/FinancialReports';
import Placement from './pages/Placement';
import Internships from './pages/Internships';
import Courses from './pages/Courses';
import SystemSettings from './pages/SystemSettings';
import MyCourses from './pages/MyCourses';
import AttendanceSummary from './pages/AttendanceSummary';
import MySubjects from './pages/MySubjects';
import PaymentHistory from './pages/PaymentHistory';
import ChangePassword from './pages/ChangePassword';
import Schedule from './pages/Schedule';
import CampusClubs from './pages/CampusClubs';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomePage />} /> 
          
          {/* Dashboards */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          
          {/* Academic Routes */}
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/allot-section" element={<AllotSection />} />
          <Route path="/courses" element={<Courses />} />
          
          {/* Fee Routes */}
          <Route path="/fees" element={<Fees />} />
          <Route path="/student-fees" element={<StudentFees />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/financial-reports" element={<FinancialReports />} />
          
          {/* Scholarship Routes */}
          <Route path="/scholarships" element={<Scholarships />} />
          
          {/* Placement Routes */}
          <Route path="/placement" element={<Placement />} />
          <Route path="/internships" element={<Internships />} />
          
          {/* Student Specific Routes */}
          <Route path="/student-attendance" element={<StudentAttendance />} />
          <Route path="/student-marks" element={<StudentMarks />} />
          <Route path="/my-subjects" element={<MySubjects />} />
          
          {/* Teacher Specific Routes */}
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/attendance-summary" element={<AttendanceSummary />} />
          
          {/* Communication Routes */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/student-notifications" element={<StudentNotifications />} />
          <Route path="/chat" element={<Chat />} />
          
          {/* Schedule Routes */}
          <Route path="/class-timetable" element={<ClassTimetable />} />
          <Route path="/exam-timetable" element={<ExamTimetable />} />
          <Route path="/schedule" element={<Schedule />} />
          
          {/* Campus Life Routes */}
          <Route path="/campus-clubs" element={<CampusClubs />} />
          
          {/* Profile & Settings */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/system-settings" element={<SystemSettings />} />
          
          {/* Admin Management Routes */}
          <Route path="/create-student" element={<AdminCreateStudent />} />
          <Route path="/create-staff" element={<AdminCreateTeacher />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/student-bulk-upload" element={<StudentBulkUpload />} />
          
          {/* Reports */}
          <Route path="/reports" element={<FinancialReports />} />
          <Route path="/export-data" element={<FinancialReports />} />
          
          {/* AI Chatbot */}
          <Route path="/ai-chatbot" element={<AIChatbot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;