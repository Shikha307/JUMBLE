import React from 'react';
import { Linkedin, Mail, FileText, UserCircle2, X, Heart } from 'lucide-react';

export default function CandidateCard({ candidate, onLike, onPass }) {
  return (
    <div className="candidate-card single-presentation-card">
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
          <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="action-btn linkedin">
            <Linkedin size={20} />
            <span>LinkedIn</span>
          </a>
          <a href={`mailto:${candidate.email}`} className="action-btn email">
            <Mail size={20} />
            <span>Email</span>
          </a>
        </div>
      </div>
      
      <div className="candidate-footer">
        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="resume-btn">
          <FileText size={20} />
          View Resume
        </a>
      </div>

      <div className="decision-section">
        <button className="decision-btn pass-btn" onClick={() => onPass(candidate.id)}>
          <X size={28} />
          <span>Pass</span>
        </button>
        <button className="decision-btn like-btn" onClick={() => onLike(candidate.id)}>
          <Heart size={28} />
          <span>Like</span>
        </button>
      </div>
    </div>
  );
}
