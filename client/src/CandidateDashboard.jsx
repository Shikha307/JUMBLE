import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { X, Heart, Briefcase } from 'lucide-react';

function CandidateDashboard({ userName }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8081/api/jobs/all', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        } else {
          console.error("Failed to fetch jobs");
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSwipe = async (direction) => {
    const currentJob = jobs[currentIndex];
    
    const candidateId = localStorage.getItem('id');
    const swipeDir = direction === 'Liked' ? 'RIGHT' : 'LEFT';
    
    // In actual app, an API call would record the "Like" or "Pass"
    const payload = {
      candidateId: candidateId || "C1",
      jobId: currentJob.id,
      recruiterId: currentJob.recruiterId || "R1", 
      swiperRole: "CANDIDATE",
      direction: swipeDir
    };

    try {
      const response = await fetch('http://localhost:8080/api/v1/swipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        console.error("Failed to record swipe in backend");
      }
    } catch (error) {
      console.error("Error recording swipe:", error);
    }
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);
  };

  const currentJob = jobs[currentIndex];
  const isFinished = currentIndex >= jobs.length;

  return (
    <div className="dashboard-layout bg-dots">
      <Navbar role="candidate" name={userName} />
      
      <main className="dashboard-content card-stack-container">
        
        {loading ? (
          <div className="loading-state">
            <h2>Loading jobs...</h2>
          </div>
        ) : isFinished ? (
          <div className="empty-state-card">
            <Briefcase size={64} className="empty-icon" />
            <h2>You're all caught up!</h2>
            <p>You have reviewed all available job postings. Check back later for more opportunities.</p>
          </div>
        ) : (
          <div className="swipe-card fade-in">
            <div className="card-header">
              <h2 className="job-title">{currentJob.roleName || 'Unknown Role'}</h2>
              <p className="company-name">{currentJob.companyName || 'Looking to hire'}</p>
            </div>
            
            <div className="card-body">
              <h3 className="section-title">Job Description</h3>
              <p className="job-description">{currentJob.description}</p>
              
              <h3 className="section-title mt-4">Required Skills</h3>
              <div className="skills-container">
                {(currentJob.skillsNeeded || []).map((skill, idx) => (
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
