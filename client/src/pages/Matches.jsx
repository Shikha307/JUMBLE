import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { User, Briefcase, Users } from 'lucide-react';

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
          const data = await response.json();
          setMatches(data);
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

  return (
    <div className="dashboard-layout bg-dots">
      <Navbar role={userRole || localStorage.getItem('role') || 'candidate'} name={userName} />
      
      <main className="dashboard-content">
        <div className="welcome-card recruiter-card" style={{ marginBottom: '2rem' }}>
          <h1>Your Matches</h1>
          <p className="welcome-subtitle">
            Candidates who have mutually swiped right on your jobs.
          </p>
        </div>

        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {isLoading ? (
            <div className="welcome-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <p>Loading your matches...</p>
            </div>
          ) : matches.length > 0 ? (
            matches.map((match) => (
              <div className="job-card" key={match.id || Math.random()} style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Match Confirmed! 🎉</h3>
                <div className="match-detail" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={18} /> 
                  <span><strong>Candidate ID:</strong> {match.candidateId}</span>
                </div>
                <div className="match-detail" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={18} /> 
                  <span><strong>Job ID:</strong> {match.jobId}</span>
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
