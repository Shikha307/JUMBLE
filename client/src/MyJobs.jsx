import Navbar from './Navbar';
import { Briefcase } from 'lucide-react';

function MyJobs({ userName }) {
  return (
    <div className="dashboard-layout">
      <Navbar role="recruiter" name={userName} />
      
      <main className="dashboard-content">
        <div className="welcome-card">
          <Briefcase size={64} className="upload-icon" style={{ marginBottom: '1rem', color: 'var(--text-light)' }} />
          <h1>No jobs posted yet.</h1>
          <p className="welcome-subtitle">
            Create a job posting to start finding candidates.
          </p>
        </div>
      </main>
    </div>
  );
}

export default MyJobs;
