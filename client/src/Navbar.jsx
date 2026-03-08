import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Heart, Briefcase, PlusCircle, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function Navbar({ role, name }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link 
          to={role === 'recruiter' ? '/recruiter' : '/dashboard'} 
          reloadDocument 
          className="brand-name" 
          style={{ textDecoration: 'none' }}
        >
          JUMBLE
        </Link>
      </div>

      <div className="navbar-right">

        {/* Candidate Nav Links */}
        {role === 'candidate' && (
          <Link to="/matches" className="nav-action-btn subtle">
            <Heart size={20} />
            <span>Matches</span>
          </Link>
        )}

        {/* Recruiter Nav Links */}
        {role === 'recruiter' && (
          <>
            <Link to="/matches" className="nav-action-btn subtle">
              <Heart size={20} />
              <span>Matches</span>
            </Link>
            <Link to="/my-jobs" className="nav-action-btn subtle">
              <Briefcase size={20} />
              <span>My Jobs</span>
            </Link>
            <Link to="/create-job" className="nav-action-btn subtle">
              <PlusCircle size={20} />
              <span>Add Job</span>
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
              <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/profile'); }}>
                <Settings size={18} /> Manage Profile
              </button>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <LogOut size={18} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
