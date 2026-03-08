import React, { useState, useEffect } from 'react';
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
  const [hasJobPostings, setHasJobPostings] = useState(false);
  const [checkingJobs, setCheckingJobs] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userRole === 'recruiter') {
      const fetchJobs = async () => {
        setCheckingJobs(true);
        try {
          const recruiterId = localStorage.getItem('id');
          const res = await fetch(`http://localhost:8081/api/recruiters/${recruiterId}/jobs`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setHasJobPostings(data.length > 0);
          }
        } catch (err) {
          console.error('Error fetching jobs for recruiter:', err);
        } finally {
          setCheckingJobs(false);
        }
      };
      
      fetchJobs();
    }
  }, [isAuthenticated, userRole, token]);

  if (checkingJobs) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}><h2>Loading Dashboard...</h2></div>;
  }

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
                  ? <Navigate to="/recruiter" />
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
