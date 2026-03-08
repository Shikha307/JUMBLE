import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { User, Briefcase, Users, Mail, FileText, Linkedin, X, Phone, MapPin } from 'lucide-react';

// ─── Candidate Detail Modal ────────────────────────────────────────────────────
function CandidateModal({ match, onClose }) {
  const c = match.candidateDetails;
  if (!c) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px', padding: '2.5rem',
          width: '100%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.2rem', right: '1.2rem',
            background: '#f5f5f5', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), #ff8fab)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <User size={28} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-dark)', fontWeight: 700 }}>
              {c.name}
            </h2>
            <span style={{
              display: 'inline-block', marginTop: '0.3rem', fontSize: '0.75rem',
              background: 'rgba(249,78,112,0.1)', color: 'var(--primary)',
              padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 600
            }}>
              Matched Candidate 🎉
            </span>
          </div>
        </div>

        {/* Contact details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {c.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <Mail size={15} color="var(--primary)" />
              <span>{c.email}</span>
            </div>
          )}
          {c.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <Phone size={15} color="var(--primary)" />
              <span>{c.phone}</span>
            </div>
          )}
          {c.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <MapPin size={15} color="var(--primary)" />
              <span>{c.location}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {c.skills && c.skills.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)', fontWeight: 700 }}>Skills</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {c.skills.map(skill => (
                <span key={skill} className="skill-pill" style={{ padding: '0.25rem 0.7rem', fontSize: '0.82rem' }}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Matched job */}
        {match.jobDetails && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fafafa', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
            <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)', fontWeight: 700 }}>Matched For</h4>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-dark)' }}>{match.jobDetails.roleName}</p>
            {match.jobDetails.description && (
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                {match.jobDetails.description.substring(0, 120)}...
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {c.resumeFilename && (
            <a
              href={`http://localhost:8081/api/candidates/${match.candidateId}/resume`}
              target="_blank" rel="noreferrer"
              className="nav-action-btn subtle"
              style={{ padding: '0.5rem 1rem', fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={15} /> View Resume
            </a>
          )}
          {c.socialLinks?.linkedin && (
            <a
              href={c.socialLinks.linkedin.startsWith('http') ? c.socialLinks.linkedin : `https://${c.socialLinks.linkedin}`}
              target="_blank" rel="noreferrer"
              className="nav-action-btn subtle"
              style={{ padding: '0.5rem 1rem', fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0a66c2', background: 'rgba(10,102,194,0.08)' }}
            >
              <Linkedin size={15} /> LinkedIn
            </a>
          )}
          {c.email && (
            <a
              href={`mailto:${c.email}`}
              className="btn-primary"
              style={{ padding: '0.5rem 1.2rem', fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
            >
              <Mail size={15} /> Contact
            </a>
          )}
        </div>
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
        const role = userRole || localStorage.getItem('role') || 'candidate';

        let endpoint = '';
        if (role === 'recruiter') {
          endpoint = `http://localhost:8082/api/v1/matches/recruiter/${id}`;
        } else {
          endpoint = `http://localhost:8082/api/v1/matches/candidate/${id}`;
        }

        const response = await fetch(endpoint);
        if (response.ok) {
          const rawMatches = await response.json();
          const token = localStorage.getItem('token');

          const hydratedMatches = await Promise.all(
            rawMatches.map(async (match) => {
              let candidateDetails = null;
              let jobDetails = null;
              const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

              if (role === 'recruiter') {
                try {
                  const candRes = await fetch(`http://localhost:8081/api/candidates/${match.candidateId}`, { headers });
                  if (candRes.ok) candidateDetails = await candRes.json();
                } catch (e) {
                  console.error('Error fetching candidate details', e);
                }
              }

              try {
                const jobRes = await fetch(`http://localhost:8081/api/jobs/${match.jobId}`, { headers });
                if (jobRes.ok) jobDetails = await jobRes.json();
              } catch (e) {
                console.error('Error fetching job details', e);
              }

              return { ...match, candidateDetails, jobDetails };
            })
          );

          setMatches(hydratedMatches);
        } else {
          console.error('Failed to fetch matches');
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, [userRole]);

  const role = userRole || localStorage.getItem('role') || 'candidate';

  return (
    <div className="dashboard-layout bg-dots">
      <Navbar role={role} name={userName} />

      {/* Candidate detail modal (recruiter only) */}
      {selectedMatch && role === 'recruiter' && (
        <CandidateModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

      <main className="dashboard-content" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ padding: '0 1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--input-border)', paddingBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', marginBottom: '0.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Your Matches</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            {role === 'recruiter'
              ? 'Click a candidate card to view their full profile.'
              : 'Jobs where the recruiter specifically wants to advance with you.'}
          </p>
        </div>

        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', padding: '0 1rem' }}>
          {isLoading ? (
            <div className="welcome-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <p>Loading your matches...</p>
            </div>
          ) : matches.length > 0 ? (
            matches.map((match) => (
              <div
                key={match.id || Math.random()}
                className="job-card"
                onClick={role === 'recruiter' && match.candidateDetails ? () => setSelectedMatch(match) : undefined}
                style={{
                  padding: '1.8rem', background: 'white', borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column',
                  cursor: role === 'recruiter' && match.candidateDetails ? 'pointer' : 'default',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  if (role === 'recruiter') {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--primary)', margin: 0 }}>Match Confirmed! 🎉</h3>
                  {role === 'recruiter' && match.candidateDetails && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Click to view</span>
                  )}
                </div>

                {role === 'recruiter' && match.candidateDetails ? (
                  <div style={{ marginBottom: '1.2rem', flex: 1 }}>
                    <h4 style={{ fontSize: '1.3rem', marginBottom: '0.3rem', color: 'var(--text-dark)' }}>{match.candidateDetails.name}</h4>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                      <Mail size={14} /> {match.candidateDetails.email}
                    </p>
                    {match.candidateDetails.skills && match.candidateDetails.skills.length > 0 && (
                      <div className="skills-container" style={{ marginTop: '1rem' }}>
                        {match.candidateDetails.skills.slice(0, 4).map(skill => (
                          <span key={skill} className="skill-pill" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>{skill}</span>
                        ))}
                        {match.candidateDetails.skills.length > 4 && (
                          <span className="skill-pill" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', opacity: 0.6 }}>+{match.candidateDetails.skills.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : role === 'candidate' && match.jobDetails ? (
                  <div style={{ marginBottom: '1.2rem', flex: 1 }}>
                    <h4 style={{ fontSize: '1.3rem', marginBottom: '0.3rem', color: 'var(--text-dark)' }}>{match.jobDetails.roleName || match.jobId}</h4>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                      <Briefcase size={14} /> Full-time Role
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginTop: '0.5rem' }}>
                      {match.jobDetails.description ? `${match.jobDetails.description.substring(0, 100)}...` : 'No description available.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginBottom: '1rem', flex: 1 }}>
                    <div className="match-detail" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <User size={18} />
                      <span><strong>Candidate ID:</strong> {match.candidateId}</span>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                  <div className="match-detail" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <div style={{ background: 'rgba(249, 78, 112, 0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)', fontWeight: 700 }}>MATCHED ROLE</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                        {match.jobDetails ? match.jobDetails.roleName : match.jobId}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="welcome-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <Users size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
              <p>No mutual matches found yet. Keep swiping!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
