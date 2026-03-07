import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Briefcase, Heart, PlusCircle, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function Navbar({ role, name }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    // In the future, this will clear tokens/session
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className="brand-name" style={{ textDecoration: 'none' }}>JUMBLE</Link>
      </div>

      <div className="navbar-right">
        {/* Candidate Links */}
        {role === 'candidate' && (
          <Link to="/matches" className="nav-action-btn subtle">
            <Heart size={20} />
            <span>Matches</span>
          </Link>
        )}

        {/* Recruiter Links */}
        {role === 'recruiter' && (
          <>
            <Link to="/matches" className="nav-action-btn subtle">
              <Heart size={20} />
              <span>Matches</span>
            </Link>
            <Link to="/create-job" className="nav-action-btn subtle">
              <PlusCircle size={20} />
              <span>Add a Job</span>
            </Link>
            <Link to="/my-jobs" className="nav-action-btn subtle">
              <Briefcase size={20} />
              <span>My Jobs</span>
            </Link>
          </>
        )}
        
        {/* Profile Dropdown */}
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <button 
            className="icon-btn profile-trigger" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Profile Menu"
          >
            <div className="avatar-circle">
              <User size={20} />
            </div>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span className="dropdown-name">{name}</span>
                <span className="dropdown-role">{role === 'recruiter' ? 'Recruiter' : 'Candidate'}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => { setDropdownOpen(false); alert("Manage Profile coming soon!"); }}>
                <Settings size={18} />
                Manage Profile
              </button>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
