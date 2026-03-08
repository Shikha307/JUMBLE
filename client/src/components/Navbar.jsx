import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, User, Users, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = () => {
    navigate('/login');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile'); 
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/recruiter" className="brand-name" style={{ textDecoration: 'none' }}>
          JUMBLE
        </Link>
      </div>
        
      <div className="navbar-right">
        <Link to="/matches" className="nav-action-btn subtle">
          <Users size={20} />
          <span className="hide-on-mobile">Matches</span>
        </Link>
        <Link to="/my-jobs" className="nav-action-btn subtle">
          <Briefcase size={20} />
          <span className="hide-on-mobile">My Jobs</span>
        </Link>

        <Link to="/add-job" className="nav-action-btn subtle">
          <PlusCircle size={20} />
          <span>Add Job</span>
        </Link>
          
          <div className="profile-dropdown-container" ref={dropdownRef}>
            <button 
              className="icon-btn profile-trigger" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="Profile Menu"
            >
              <div className="avatar-circle">
                <User size={20} />
              </div>
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <User size={18} /> Manage Profile
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={handleSignOut}>
                  <LogOut size={18} /> Sign out
                </button>
              </div>
            )}
          </div>
      </div>
    </nav>
  );
}
