import { Menu, User, LogOut, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar({ role, name }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In the future, this will clear tokens/session
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="icon-btn hamburger-btn" aria-label="Menu">
          <Menu size={24} />
        </button>
        <span className="brand-name">JUMBLE</span>
      </div>

      <div className="navbar-right">
        {role === 'recruiter' && (
          <button className="nav-action-btn">
            <Briefcase size={20} />
            <span>Job Postings</span>
          </button>
        )}
        
        <div className="user-profile">
          <User size={20} />
          <span className="user-name">{name}</span>
        </div>
        
        <button className="icon-btn logout-btn" onClick={handleLogout} aria-label="Logout" title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
