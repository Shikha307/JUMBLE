import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { User, Briefcase, Users, Mail, FileText, Linkedin, X, Phone, MapPin } from 'lucide-react';

// ─── Candidate Detail Modal ────────────────────────────────────────────────────
function CandidateModal({ match, onClose }) {
  const [details, setDetails] = useState(match.candidateDetails);
  const [loading, setLoading] = useState(!match.candidateDetails);
  const [error, setError] = useState(null);
  const [resumePdfUrl, setResumePdfUrl] = useState(null);

  useEffect(() => {
    if (!details) {
      const fetchDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch(`http://localhost:8081/api/candidates/${match.candidateId}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setDetails(data);
          } else {
            setError('Failed to load candidate details');
          }
        } catch (err) {
          setError('Error connecting to candidate service');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [match.candidateId, details]);

  const handleViewResume = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8081/api/candidates/${match.candidateId}/resume`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setResumePdfUrl(url);
      } else {
        alert("Failed to load resume securely.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching resume.");
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '24px', padding: '2.5rem',
          width: '90%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: '#f8fafc', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
        >
          <X size={20} color="#64748b" />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: '#64748b' }}>Loading candidate profile...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#ef4444' }}>{error}</p>
            <button className="btn-primary" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        ) : details ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '22px',
                background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 10px 15px -3px rgba(244, 63, 94, 0.3)'
              }}>
                <User size={36} color="white" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b', fontWeight: 800 }}>
                  {details.name}
                </h2>
                <span style={{
                  display: 'inline-block', marginTop: '0.4rem', fontSize: '0.8rem',
                  background: '#fff1f2', color: '#e11d48',
                  padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 700
                }}>
                  Mutual Match 🎉
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '2rem' }}>
              {details.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.95rem' }}>
                  <Mail size={18} color="#f43f5e" />
                  <span>{details.email}</span>
                </div>
              )}
              {details.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.95rem' }}>
                  <Phone size={18} color="#f43f5e" />
                  <span>{details.phone}</span>
                </div>
              )}
              {(details.country || details.university) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.95rem' }}>
                  <MapPin size={18} color="#f43f5e" />
                  <span>{[details.university, details.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>

            {details.skills && details.skills.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>Candidate Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {details.skills.map(skill => (
                    <span key={skill} className="skill-pill" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', background: '#f1f5f9', color: '#334155', borderRadius: '10px', fontWeight: 600 }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {match.allMatchedJobs && match.allMatchedJobs.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>Matched For Positions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {match.allMatchedJobs.map((job, idx) => (
                    <div key={idx} style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>{job.roleName}</p>
                      {job.description && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                          {job.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
              {details.resumeFilename && (
                <button
                  onClick={handleViewResume}
                  className="nav-action-btn subtle"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', cursor: 'pointer', border: 'none', background: '#fff1f2', color: '#f43f5e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
                >
                  <FileText size={18} /> Resume
                </button>
              )}
              {details.email && (
                <a
                  href={`mailto:${details.email}`}
                  className="nav-action-btn subtle"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', color: '#64748b' }}
                >
                  <Mail size={18} /> Email
                </a>
              )}
              {details.linkedin ? (
                <a
                  href={details.linkedin.startsWith('http') ? details.linkedin : `https://${details.linkedin}`}
                  target="_blank" rel="noreferrer"
                  className="btn-primary"
                  style={{
                    padding: '0.6rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: 'white', background: '#0077b5', borderRadius: '12px',
                    fontWeight: 700, boxShadow: '0 4px 6px -1px rgba(0, 119, 181, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#006194';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#0077b5';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Linkedin size={20} strokeWidth={2.5} /> LinkedIn Profile
                </a>
              ) : (
                <div
                  className="nav-action-btn subtle"
                  style={{
                    padding: '0.6rem 1.25rem', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    borderRadius: '12px', color: '#94a3b8', background: '#f8fafc',
                    cursor: 'default', border: '1px solid #e2e8f0'
                  }}
                >
                  <Linkedin size={20} strokeWidth={1.5} style={{ opacity: 0.5 }} /> LinkedIn: Not Provided
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* FULL SCREEN PDF VIEWER */}
      {resumePdfUrl && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'flex-end', background: '#1e293b' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setResumePdfUrl(null); }}
              style={{ padding: '0.6rem 1.25rem', background: '#f43f5e', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <X size={18} /> Close PDF Viewer
            </button>
          </div>
          <iframe src={resumePdfUrl} style={{ width: '100%', height: '100%', flex: 1, border: 'none', background: 'white' }} title="Resume PDF Viewer" />
        </div>
      )}
    </div>
  );
}

function JobModal({ match, onClose }) {
  const [details, setDetails] = useState(match.jobDetails);
  const [loading, setLoading] = useState(!match.jobDetails);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    if (!details) {
      const fetchDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          const res = await fetch(`http://localhost:8081/api/jobs/${match.jobId}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setDetails(data);
          } else {
            setError('Failed to load job details');
          }
        } catch (err) {
          setError('Error connecting to job service');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [match.jobId, details]);

  // Once we have job details with a recruiterId, fetch company name
  useEffect(() => {
    if (details && details.recruiterId) {
      const token = localStorage.getItem('token');
      fetch(`http://localhost:8081/api/recruiters/${details.recruiterId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setCompanyName(data.company || `${data.firstName || ''} ${data.lastName || ''}`.trim());
        })
        .catch(() => {});
    }
  }, [details]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '24px', padding: '2.5rem',
          width: '90%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: '#f8fafc', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
        >
          <X size={20} color="#64748b" />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: '#64748b' }}>Loading job details...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#ef4444' }}>{error}</p>
            <button className="btn-primary" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        ) : details ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '22px',
                background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 10px 15px -3px rgba(244, 63, 94, 0.3)'
              }}>
                <Briefcase size={36} color="white" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b', fontWeight: 800 }}>
                  {details.roleName}
                </h2>
                {companyName && (
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>
                    {companyName}
                  </p>
                )}
                <span style={{
                  display: 'inline-block', marginTop: '0.4rem', fontSize: '0.8rem',
                  background: '#fff1f2', color: '#e11d48',
                  padding: '0.25rem 0.75rem', borderRadius: '99px', fontWeight: 700
                }}>
                  You've Matched!
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>Job Description</h4>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {details.description || "No description provided."}
              </p>
            </div>

            {details.requirements && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>Requirements</h4>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {details.requirements}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>Skills Required</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {details.skillsNeeded && details.skillsNeeded.length > 0 ? (
                    details.skillsNeeded.map(skill => (
                      <span key={skill} style={{
                        padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'white',
                        border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: 600
                      }}>{skill}</span>
                    ))
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No specific skills listed</span>
                  )}
                </div>
              </div>
              {details.location && (
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>Location</h4>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{details.location}</p>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', textAlign: 'center' }}>
              <button
                onClick={onClose}
                className="btn-primary"
                style={{ padding: '0.8rem 2rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer', border: 'none' }}
              >
                Close Details
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main Matches Page ─────────────────────────────────────────────────────────
export default function Matches({ userRole }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const userName = localStorage.getItem('name') || '';

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const id = localStorage.getItem('id');
        const roleFromStorage = localStorage.getItem('role') || 'candidate';
        const role = (userRole || roleFromStorage).toLowerCase();
        const token = localStorage.getItem('token');

        const authenticatedHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

        let endpoint = '';
        if (role === 'recruiter') {
          endpoint = `http://localhost:8080/api/v1/matches/recruiter/${id}`;
        } else {
          endpoint = `http://localhost:8080/api/v1/matches/candidate/${id}`;
        }

        const response = await fetch(endpoint, { headers: authenticatedHeaders });
        if (response.ok) {
          const rawMatches = await response.json();

          const hydratedMatches = await Promise.all(
            rawMatches.map(async (match) => {
              let candidateDetails = null;
              let jobDetails = null;

              if (role === 'recruiter') {
                try {
                  const candRes = await fetch(`http://localhost:8081/api/candidates/${match.candidateId}`, { headers: authenticatedHeaders });
                  if (candRes.ok) candidateDetails = await candRes.json();
                } catch (e) {
                  console.error('Error fetching candidate details', e);
                }
              }

              try {
                const jobRes = await fetch(`http://localhost:8081/api/jobs/${match.jobId}`, { headers: authenticatedHeaders });
                if (jobRes.ok) jobDetails = await jobRes.json();
              } catch (e) {
                console.error('Error fetching job details', e);
              }

              return { ...match, candidateDetails, jobDetails };
            })
          );

          if (role === 'recruiter') {
            const grouped = hydratedMatches.reduce((acc, current) => {
              const key = current.candidateId;
              if (!acc[key]) {
                acc[key] = {
                  ...current,
                  allMatchedJobs: current.jobDetails ? [current.jobDetails] : []
                };
              } else if (current.jobDetails) {
                acc[key].allMatchedJobs.push(current.jobDetails);
              }
              return acc;
            }, {});
            setMatches(Object.values(grouped));
          } else {
            setMatches(hydratedMatches);
          }
        } else {
          console.error('Failed to fetch matches', response.status);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, [userRole]);

  const role = (userRole || localStorage.getItem('role') || 'candidate').toLowerCase();

  return (
    <div className={`dashboard-layout bg-dots ${role === 'recruiter' ? 'recruiter-theme' : ''}`}>
      <Navbar role={role} name={userName} />

      {/* MODAL PORTAL (Recruiter Only) */}
      {selectedMatch && role === 'recruiter' && (
        <CandidateModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
      {selectedMatch && role === 'candidate' && (
        <JobModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

      <main className="dashboard-content" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ padding: '0 1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--input-border)', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', marginBottom: '0.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Your Matches</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
              {role === 'recruiter'
                ? 'Review confirmed matches for your open positions.'
                : 'Jobs where the recruiter specifically wants to advance with you.'}
            </p>
          </div>
          {role === 'recruiter' && matches.length > 0 && (
            <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
              {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
            </span>
          )}
        </div>

        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', padding: '0 1rem' }}>
          {isLoading ? (
            <div className="welcome-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p>Fetching your latest matches...</p>
            </div>
          ) : matches.length > 0 ? (
            matches.map((match) => (
              <div
                key={match.id || Math.random()}
                className="job-card"
                onClick={() => setSelectedMatch(match)}
                style={{
                  padding: '1.8rem', background: 'white', borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid #f1f5f9',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = 'var(--primary-light-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                  {role === 'recruiter' ? (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Click to view profile</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Click to view job</span>
                  )}
                </div>

                {role === 'recruiter' && match.candidateDetails ? (
                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <h4 style={{ fontSize: '1.4rem', marginBottom: '0.35rem', color: '#1e293b', fontWeight: 700 }}>{match.candidateDetails.name}</h4>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                      <Mail size={16} /> {match.candidateDetails.email}
                    </p>
                    {match.candidateDetails.skills && match.candidateDetails.skills.length > 0 && (
                      <div className="skills-container" style={{ marginTop: '0.5rem', gap: '0.4rem' }}>
                        {match.candidateDetails.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="skill-pill" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>{skill}</span>
                        ))}
                        {match.candidateDetails.skills.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.2rem' }}>+{match.candidateDetails.skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : role === 'candidate' && match.jobDetails ? (
                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <h4 style={{ fontSize: '1.4rem', marginBottom: '0.35rem', color: '#1e293b', fontWeight: 700 }}>{match.jobDetails.roleName}</h4>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#f43f5e', fontWeight: 700, marginBottom: '0.75rem' }}>
                      <Briefcase size={16} /> Full-time Role
                    </p>
                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>
                      {match.jobDetails.description ? `${match.jobDetails.description.substring(0, 85)}...` : 'No description provided.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                      <User size={24} color="#94a3b8" />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>CANDIDATE ID</span>
                        <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>{match.candidateId.substring(0, 12)}...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '10px', color: 'var(--primary)', flexShrink: 0 }}>
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Matched For</span>
                      {role === 'recruiter' && match.allMatchedJobs ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {match.allMatchedJobs.map((job, idx) => (
                            <span key={idx} style={{ 
                              fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', 
                              background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' 
                            }}>
                              {job.roleName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                          {match.jobDetails ? match.jobDetails.roleName : 'Position ' + match.jobId.substring(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="welcome-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', background: 'transparent', border: '2px dashed #e2e8f0' }}>
              <Users size={64} color="#cbd5e1" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ color: '#64748b', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No matches yet</h3>
              <p style={{ color: '#94a3b8' }}>Keep swiping to find potential matches!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
