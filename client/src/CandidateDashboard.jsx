import { useState } from 'react';
import Navbar from './Navbar';
import { X, Heart, Briefcase } from 'lucide-react';

// Simulated database of job postings
const DUMMY_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "TechNova Solutions",
    description: "We are looking for an experienced React developer to lead our frontend architecture. You will be building highly interactive user interfaces and mentoring junior developers.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Redux"]
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "CloudSync Inc.",
    description: "Join our dynamic team to work on scalable cloud applications. You'll be involved in the full development lifecycle, from database design to frontend implementation.",
    skills: ["Node.js", "Express", "MongoDB", "React"]
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Creative Pulse Studio",
    description: "Seeking a creative mind with a strong portfolio. You will design web and mobile applications focused on intuitive user journeys and stunning visual aesthetics.",
    skills: ["Figma", "Prototyping", "User Research", "Wireframing"]
  }
];

function CandidateDashboard({ userName }) {
  const [jobs, setJobs] = useState(DUMMY_JOBS);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction) => {
    // In actual app, an API call would record the "Like" or "Pass"
    const currentJob = jobs[currentIndex];
    console.log(`Candidate ${direction} job:`, currentJob.title);
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);
  };

  const currentJob = jobs[currentIndex];
  const isFinished = currentIndex >= jobs.length;

  return (
    <div className="dashboard-layout bg-dots">
      <Navbar role="candidate" name={userName} />
      
      <main className="dashboard-content card-stack-container">
        
        {isFinished ? (
          <div className="empty-state-card">
            <Briefcase size={64} className="empty-icon" />
            <h2>You're all caught up!</h2>
            <p>You have reviewed all available job postings. Check back later for more opportunities.</p>
          </div>
        ) : (
          <div className="swipe-card fade-in">
            <div className="card-header">
              <h2 className="job-title">{currentJob.title}</h2>
              <p className="company-name">{currentJob.company}</p>
            </div>
            
            <div className="card-body">
              <h3 className="section-title">Job Description</h3>
              <p className="job-description">{currentJob.description}</p>
              
              <h3 className="section-title mt-4">Required Skills</h3>
              <div className="skills-container">
                {currentJob.skills.map((skill, idx) => (
                  <span key={idx} className="skill-pill">{skill}</span>
                ))}
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="action-btn pass-btn" 
                onClick={() => handleSwipe('Passed')}
                aria-label="Pass Job"
              >
                <X size={32} />
              </button>
              
              <button 
                className="action-btn like-btn" 
                onClick={() => handleSwipe('Liked')}
                aria-label="Like Job"
              >
                <Heart size={32} />
              </button>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}

export default CandidateDashboard;
