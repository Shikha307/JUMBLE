import { Link } from 'react-router-dom';
import { UserRound, Briefcase } from 'lucide-react';

function RoleSelect() {
  return (
    <div className="login-container">
      <div className="login-card role-select-card">
        <div className="login-header">
          <h1>JUMBLE</h1>
          <p>How would you like to sign up?</p>
        </div>

        <div className="role-options">
          <Link to="/register/candidate" className="role-option-btn candidate-role-btn">
            <UserRound size={40} />
            <span className="role-title">I'm a Candidate</span>
            <span className="role-desc">Looking for my next opportunity</span>
          </Link>

          <Link to="/register/recruiter" className="role-option-btn recruiter-role-btn">
            <Briefcase size={40} />
            <span className="role-title">I'm a Recruiter</span>
            <span className="role-desc">Looking to hire great talent</span>
          </Link>
        </div>

        <div className="signup-link" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login">Sign in.</Link>
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;
