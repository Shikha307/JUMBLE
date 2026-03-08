import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { PlusCircle } from 'lucide-react';

function RecruiterDashboard({ userName }) {
  return (
    <div className="dashboard-layout">
      <Navbar role="recruiter" name={userName} />

      <main className="dashboard-content">
        <div className="welcome-card recruiter-card">
          <h1>Welcome {userName}, create a new job posting.</h1>
          <p className="welcome-subtitle">
            Start by adding a job posting to attract top candidates.
          </p>

          <div className="create-job-action">
            <Link to="/create-job" className="create-job-btn">
              <PlusCircle size={28} className="create-icon" />
              <span>Add Job</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RecruiterDashboard;
