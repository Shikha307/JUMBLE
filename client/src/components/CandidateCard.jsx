import React from 'react';
import { Linkedin, Mail, FileText, UserCircle2, X, Heart } from 'lucide-react';

export default function CandidateCard({ candidate, onLike, onPass }) {
  const [isCoverLetterOpen, setIsCoverLetterOpen] = React.useState(false);
  const hasCoverLetter = typeof candidate.coverLetterText === 'string' && candidate.coverLetterText.trim().length > 0;

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
        window.open(url, '_blank');
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

        {hasCoverLetter && (
          <button
            onClick={() => setIsCoverLetterOpen(true)}
            className="resume-btn"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0f766e',
              fontWeight: 600,
              padding: 0,
              marginTop: '0.6rem'
            }}
          >
            <FileText size={20} />
            View Cover Letter
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

      {isCoverLetterOpen && (
        <div
          onClick={() => setIsCoverLetterOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '680px',
              maxHeight: '80vh',
              overflowY: 'auto',
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setIsCoverLetterOpen(false)}
              style={{
                position: 'absolute',
                top: '0.9rem',
                right: '0.9rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '999px',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '0.8rem', color: '#0f172a' }}>Cover Letter</h3>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#334155', fontSize: '0.95rem' }}>
              {candidate.coverLetterText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
