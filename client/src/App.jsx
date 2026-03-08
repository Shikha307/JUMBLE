import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import RoleSelect from './RoleSelect';
import CandidateRegister from './CandidateRegister';
import RecruiterRegister from './RecruiterRegister';
import CandidateDashboard from './CandidateDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import Matches from './Matches';
import MyJobs from './MyJobs';
import './index.css';

function App() {
  // ─── Simulated Auth State ───────────────────────────────────────────
  // In production these come from JWT / AuthContext
  const isAuthenticated = true;
  const userRole = 'recruiter'; // toggle to 'candidate' to test that flow
  const userName = 'Alex';

  // ─── Recruiter gate ─────────────────────────────────────────────────
  // Set to true once the recruiter has created at least one job posting.
  // In production this will come from an API call (e.g. GET /jobs?mine=true).
  const hasJobPostings = false; // ← toggle to true to see candidate swipe view
  // ────────────────────────────────────────────────────────────────────

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RoleSelect />} />
        <Route path="/register/candidate" element={<CandidateRegister />} />
        <Route path="/register/recruiter" element={<RecruiterRegister />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? userRole === 'candidate'
                ? <CandidateDashboard userName={userName} />
                : hasJobPostings
                  ? <Navigate to="/recruiter-candidates" />
                  : <RecruiterDashboard userName={userName} />
              : <Navigate to="/login" />
          }
        />

        {/* Shared feature routes */}
        <Route
          path="/matches"
          element={isAuthenticated
            ? <Matches userRole={userRole} userName={userName} />
            : <Navigate to="/login" />}
        />
        <Route
          path="/my-jobs"
          element={isAuthenticated && userRole === 'recruiter'
            ? <MyJobs userName={userName} />
            : <Navigate to="/dashboard" />}
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
