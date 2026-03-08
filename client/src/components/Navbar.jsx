import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, UserCircle2, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = () => {
    navigate('/login');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    // placeholder for future profile route
    // navigate('/profile'); 
    alert('Profile page coming soon!');
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
      <div className="nav-container">
        <Link to="/recruiter" className="nav-brand">
          JUMBLE
        </Link>
        
        <div className="nav-links">
          <Link to="/my-jobs" className="nav-btn my-jobs-btn">
            <Briefcase size={18} />
            <span className="hide-on-mobile">My Jobs</span>
          </Link>

          <Link to="/add-job" className="nav-btn add-job-btn">
            <Briefcase size={18} />
            <span className="hide-on-mobile">Add Job</span>
          </Link>
          
          <div className="profile-menu-container" ref={dropdownRef}>
            <button 
              className="nav-btn profile-avatar-btn" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <UserCircle2 size={24} />
            </button>

            {isDropdownOpen && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className="dropdown-item signout-item" onClick={handleSignOut}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
