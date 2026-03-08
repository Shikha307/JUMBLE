import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, User, PlusCircle, Heart, Home, Settings } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [matchCount, setMatchCount] = useState(0);

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

  // Fetch match count for recruiter badge
  useEffect(() => {
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('token');
    if (!id) return;
    fetch(`http://localhost:8080/api/v1/matches/recruiter/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMatchCount(Array.isArray(data) ? data.length : 0))
      .catch(() => { });
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('id');
    navigate('/login');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const name = localStorage.getItem('name');

  return (
    <nav className="navbar" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>

      {/* Left: Home button */}
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/recruiter" reloadDocument className="nav-action-btn subtle" title="Home"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
          <Home size={18} />
          <span style={{ fontSize: '0.85rem' }}>Home</span>
        </Link>
      </div>

      {/* Center: JUMBLE logo */}
      <div style={{ textAlign: 'center' }}>
        <Link to="/recruiter" reloadDocument className="brand-name"
          style={{ textDecoration: 'none', fontSize: '1.8rem', letterSpacing: '0.05em' }}>
          JUMBLE
        </Link>
      </div>

      {/* Right: Nav actions */}
      <div className="navbar-right" style={{ justifyContent: 'flex-end' }}>
        <Link to="/matches" className="nav-action-btn subtle" style={{ position: 'relative' }}>
          <Heart size={20} />
          {matchCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#e0245e',
              color: '#fff',
              borderRadius: '50%',
              fontSize: '0.65rem',
              fontWeight: '700',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              lineHeight: 1,
              pointerEvents: 'none'
            }}>
              {matchCount}
            </span>
          )}
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
              {name && (
                <>
                  <div className="dropdown-header">
                    <span className="dropdown-name">{name}</span>
                    <span className="dropdown-role">Recruiter</span>
                  </div>
                  <div className="dropdown-divider"></div>
                </>
              )}
              <button className="dropdown-item" onClick={handleProfileClick}>
                <Settings size={18} /> Manage Profile
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
