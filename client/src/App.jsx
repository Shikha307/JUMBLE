import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import CandidateWelcome from './CandidateWelcome';
import RecruiterWelcome from './RecruiterWelcome';
import Navbar from './Navbar';
import './index.css';

function App() {
  // In the future, this will be driven by real auth state from Redux/Context & your Backend API
  const isAuthenticated = true; // Simulating a signed in user for now
  const userRole = 'candidate'; // Change this to 'recruiter' to test the other flow!
  const hasCompletedOnboarding = false; // Set to true to bypass welcome screens
  const userName = "Alex";

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              userRole === 'candidate' ? (
                hasCompletedOnboarding ? (
                  <div className="dashboard-layout"><Navbar role="candidate" name={userName} /><main className="dashboard-content"><h1>Candidate Swiping Area Coming Soon</h1></main></div>
                ) : (
                  <CandidateWelcome name={userName} />
                )
              ) : (
                hasCompletedOnboarding ? (
                  <div className="dashboard-layout"><Navbar role="recruiter" name={userName} /><main className="dashboard-content"><h1>Recruiter Swiping Area Coming Soon</h1></main></div>
                ) : (
                  <RecruiterWelcome name={userName} />
                )
              )
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        
        {/* Default redirect based on auth */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
