import Navbar from './Navbar';
import { HeartCrack } from 'lucide-react';

function Matches({ userRole, userName }) {
  return (
    <div className="dashboard-layout">
      <Navbar role={userRole} name={userName} />
      
      <main className="dashboard-content">
        <div className="welcome-card">
          <HeartCrack size={64} className="upload-icon" style={{ marginBottom: '1rem', color: 'var(--text-light)' }} />
          <h1>No matches yet.</h1>
          <p className="welcome-subtitle">
            {userRole === 'candidate' 
              ? "Start swiping on job postings to find your next opportunity!" 
              : "Start swiping on candidates to find your next perfect hire!"}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Matches;
