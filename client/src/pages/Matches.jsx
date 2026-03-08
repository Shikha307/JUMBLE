import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { User, Briefcase, Users, Mail, FileText, Linkedin } from 'lucide-react';

export default function Matches({ userRole }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userName = localStorage.getItem('name') || '';

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const id = localStorage.getItem('id');
        const role = userRole || localStorage.getItem('role') || 'candidate';
        
        let endpoint = '';
        if (role === 'recruiter') {
          endpoint = `http://localhost:8080/api/v1/matches/recruiter/${id}`;
        } else {
          endpoint = `http://localhost:8080/api/v1/matches/candidate/${id}`;
        }
        
        const response = await fetch(endpoint);
        if (response.ok) {
          const rawMatches = await response.json();
          const token = localStorage.getItem('token');
          
          // Hydrate Matches with full details
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
                  console.error("Error fetching candidate details", e);
                }
              }

              try {
                const jobRes = await fetch(`http://localhost:8081/api/jobs/${match.jobId}`, { headers });
                if (jobRes.ok) jobDetails = await jobRes.json();
              } catch (e) {
                console.error("Error fetching job details", e);
              }

              return { ...match, candidateDetails, jobDetails };
            })
          );
          
          setMatches(hydratedMatches);
        } else {
          console.error("Failed to fetch matches");
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
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
      
      <main className="dashboard-content" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ padding: '0 1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--input-border)', paddingBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', marginBottom: '0.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Your Matches</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            {role === 'recruiter' 
              ? "Candidates who have mutually swiped right on your jobs." 
              : "Jobs where the recruiter specifically wants to advance with you."}
          </p>
        </div>

        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', padding: '0 1rem' }}>
          {isLoading ? (
            <div className="welcome-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <p>Loading your matches...</p>
            </div>
          ) : matches.length > 0 ? (
            matches.map((match) => (
              <div className="job-card" key={match.id || Math.random()} style={{ padding: '1.8rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--primary)', margin: 0 }}>Match Confirmed! 🎉</h3>
                </div>
                
                {/* CONDITIONAL RENDERING BASED ON ROLE */}
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
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      {match.candidateDetails.resumeFilename && (
                        <a href={`http://localhost:8081/api/candidates/${match.candidateId}/resume`} target="_blank" rel="noreferrer" className="nav-action-btn subtle" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          <FileText size={14} /> View Resume
                        </a>
                      )}
                      
                      {match.candidateDetails.socialLinks?.linkedin && (
                        <a href={match.candidateDetails.socialLinks.linkedin.startsWith('http') ? match.candidateDetails.socialLinks.linkedin : `https://${match.candidateDetails.socialLinks.linkedin}`} target="_blank" rel="noreferrer" className="nav-action-btn subtle" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#0a66c2', backgroundColor: 'rgba(10, 102, 194, 0.1)' }}>
                          <Linkedin size={14} /> LinkedIn
                        </a>
                      )}
                    </div>
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
                  // Fallbacks in case APIs fail
                  <div style={{ marginBottom: '1rem', flex: 1 }}>
                    <div className="match-detail" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <User size={18} /> 
                      <span><strong>Candidate ID:</strong> {match.candidateId}</span>
                    </div>
                  </div>
                )}
                
                {/* FOOTER - ALWAYS SHOW RELEVANT JOB */}
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
