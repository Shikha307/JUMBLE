import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Heart, Briefcase, PlusCircle, Settings, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function Navbar({ role, name }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [matchCount, setMatchCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = '/login';
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch match count for badge (both candidate and recruiter)
  useEffect(() => {
    const id = localStorage.getItem('id');
    const token = localStorage.getItem('token');
    if (!id || !role) return;
    const endpoint = role === 'recruiter'
      ? `http://localhost:8080/api/v1/matches/recruiter/${id}`
      : `http://localhost:8080/api/v1/matches/candidate/${id}`;
    fetch(endpoint, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (!Array.isArray(data)) { setMatchCount(0); return; }
        if (role === 'recruiter') {
          // Deduplicate by candidateId, same as Matches.jsx does
          const uniqueCandidates = new Set(data.map(m => m.candidateId));
          setMatchCount(uniqueCandidates.size);
        } else {
          setMatchCount(data.length);
        }
      })
      .catch(() => { });
  }, [role]);

  return (
    <nav className="navbar" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
      {/* Left: Home button */}
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          to={role === 'recruiter' ? '/recruiter' : '/dashboard'}
          reloadDocument
          className="nav-action-btn subtle"
          title="Home"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
        >
          <Home size={18} />
          <span style={{ fontSize: '0.85rem' }}>Home</span>
        </Link>
      </div>

      {/* Center: JUMBLE logo */}
      <div style={{ textAlign: 'center' }}>
        <Link
          to={role === 'recruiter' ? '/recruiter' : '/dashboard'}
          reloadDocument
          className="brand-name"
          style={{ textDecoration: 'none', fontSize: '1.8rem', letterSpacing: '0.05em' }}
        >
          JUMBLE
        </Link>
      </div>

      <div className="navbar-right" style={{ justifyContent: 'flex-end' }}>

        {/* Candidate Nav Links */}
        {role === 'candidate' && (
          <Link to="/matches" className="nav-action-btn subtle" style={{ position: 'relative' }}>
            <Heart size={20} />
            {matchCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: 'var(--primary)',
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
            <span>Matches</span>
          </Link>
        )}

        {/* Recruiter Nav Links */}
        {role === 'recruiter' && (
          <>
            <Link to="/matches" className="nav-action-btn subtle" style={{ position: 'relative' }}>
              <Heart size={20} />
              {matchCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'var(--primary)',
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
              <span>Matches</span>
            </Link>
            <Link to="/my-jobs" className="nav-action-btn subtle">
              <Briefcase size={20} />
              <span>My Jobs</span>
            </Link>
            <Link to="/add-job" className="nav-action-btn subtle">
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
