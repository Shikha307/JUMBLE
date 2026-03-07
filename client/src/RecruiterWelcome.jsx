import Navbar from './Navbar';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function RecruiterWelcome({ name }) {
  return (
    <div className="dashboard-layout recruiter">
      <Navbar role="recruiter" name={name || "Recruiter"} />
      
      <main className="dashboard-content">
        <div className="welcome-card recruiter-card">
          <h1>Welcome {name}, let us add your job posting.</h1>
          <p className="welcome-subtitle">Find your next perfect candidate by creating a posting.</p>
          
          <div className="create-job-action">
            <Link to="/create-job" className="create-job-btn">
              <PlusCircle size={28} className="create-icon"/>
              <span>Create a new Job Posting</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RecruiterWelcome;
