import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Login';
import RoleSelect from './RoleSelect';
import CandidateRegister from './CandidateRegister';
import RecruiterRegister from './RecruiterRegister';
import CandidateDashboard from './CandidateDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import Matches from './pages/Matches';
import ManageProfile from './ManageProfile';
import RecruiterHome from './pages/RecruiterHome';
import AddJob from './pages/AddJob';
import MyJobs from './pages/MyJobs';
import './index.css';

function App() {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const userRole = localStorage.getItem('role') || 'candidate';
  const userName = localStorage.getItem('name') || '';

  // ─── Recruiter gate ─────────────────────────────────────────────────
  // Set to true once the recruiter has created at least one job posting.
  // In production this will come from an API call (e.g. GET /jobs?mine=true).
  const hasJobPostings = false; // ← toggle to true to see candidate swipe view

  return (
    <Router>
      <Routes>
        {/* Public routes */}
		<Route path="/" element={
          <div className="login-container">
            <div className="login-card">
              <h1>JUMBLE</h1>
              <p>A new way to match candidates and jobs.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <Link to="/login" className="login-btn" style={{ textDecoration: 'none' }}>Login</Link>
                <Link to="/recruiter" className="login-btn" style={{ textDecoration: 'none', background: '#10b981' }}>Recruiter Viewer</Link>
              </div>
            </div>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RoleSelect />} />
        <Route path="/register/candidate" element={<CandidateRegister />} />
        <Route path="/register/recruiter" element={<RecruiterRegister />} />
        <Route path="/recruiter" element={<RecruiterHome />} />
        <Route path="/add-job" element={<AddJob />} />
        <Route path="/my-jobs" element={<MyJobs />} />
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

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            isAuthenticated ? <ManageProfile /> : <Navigate to="/login" />
          }
        />

        {/* Shared feature routes */}
        <Route
          path="/matches"
          element={isAuthenticated
            ? <Matches userRole={userRole} userName={userName} />
            : <Navigate to="/login" />}
        />
        {/* Default redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
