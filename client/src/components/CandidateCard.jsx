import React, { useState } from 'react';
import { Linkedin, Mail, FileText, UserCircle2, X, Heart } from 'lucide-react';

export default function CandidateCard({ candidate, onLike, onPass }) {
  const [resumePdfUrl, setResumePdfUrl] = useState(null);

  const handleViewResume = async (e) => {
    e.preventDefault();
    if (!candidate.resumeUrl) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(candidate.resumeUrl, {
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
      alert("Error loading resume.");
    }
  };

  return (
    <div className="candidate-card single-presentation-card" style={{ position: 'relative' }}>
      <div className="candidate-header">
        <UserCircle2 size={64} className="avatar-icon"/>
        <h2>{candidate.name}</h2>
      </div>
      
      <div className="candidate-body">
        <div className="skills-section">
          <h3>Top Skills</h3>
          <div className="skills-container">
            {candidate.skills.map((skill, index) => (
              <span key={index} className="skill-chip">{skill}</span>
            ))}
          </div>
        </div>
        
        <div className="actions-section">
          {candidate.linkedin && (
            <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="action-btn linkedin">
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </a>
          )}
          <a href={`mailto:${candidate.email}`} className="action-btn email">
            <Mail size={20} />
            <span>Email</span>
          </a>
        </div>
      </div>
      
      <div className="candidate-footer">
        {candidate.resumeUrl && (
          <button onClick={handleViewResume} className="resume-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f43f5e', fontWeight: 600, padding: 0 }}>
            <FileText size={20} />
            View Resume
          </button>
        )}
      </div>

      <div className="card-actions">
        <button 
          className="action-btn pass-btn" 
          onClick={() => onPass(candidate.id)}
          aria-label="Pass Candidate"
        >
          <X size={32} />
        </button>
        <button 
          className="action-btn like-btn" 
          onClick={() => onLike(candidate.id)}
          aria-label="Like Candidate"
        >
          <Heart size={32} />
        </button>
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
