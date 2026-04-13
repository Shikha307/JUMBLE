import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { X, Heart, Briefcase, FileText } from 'lucide-react';
import { SWIPE_API, USER_JOB_API, ML_OUTPUTS } from './config/api';

function CandidateDashboard({ userName }) {
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCompany, setCurrentCompany] = useState("Loading company...");
  const [animatingDirection, setAnimatingDirection] = useState(null);

  // Resume selection state
  const [resumes, setResumes] = useState([]);
  const [defaultResumeName, setDefaultResumeName] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Fetch jobs and candidate profile (resumes)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const candidateId = localStorage.getItem('id');

        // Fetch candidate profile to get resumes list
        try {
          const profileRes = await fetch(`${USER_JOB_API}/api/candidates/me`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setResumes(profileData.resumes || []);
            setDefaultResumeName(profileData.resumeFilename || null);
            // Pre-select the active resume or default to 'default' (primary)
            setSelectedResumeId(profileData.activeResumeId || 'default');
          }
        } catch (e) {
          console.error("Error fetching profile:", e);
        }

        // Fetch unswiped jobs
        const res = await fetch(`${SWIPE_API}/api/v1/swipes/candidates/${candidateId}/unswiped-jobs`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          let jobsData = await res.json();

          // Try to fetch ML priorities
          try {
            if (candidateId) {
              const mlRes = await fetch(`${ML_OUTPUTS}/jobs_prioritized/${candidateId}.json`);
              if (mlRes.ok) {
                const mlJobs = await mlRes.json();
                const scoreMap = {};
                mlJobs.forEach(job => {
                  if (job.id) scoreMap[job.id] = job.matchScore || 0;
                });
                jobsData = jobsData.map(job => ({
                  ...job,
                  matchScore: scoreMap[job.id] || 0
                })).sort((a, b) => b.matchScore - a.matchScore);
              }
            }
          } catch (mlErr) {
            console.warn("Could not load ML priorities for candidate, falling back to default sort.", mlErr);
          }

          setJobs(jobsData);
        } else {
          console.error("Failed to fetch jobs");
          setError(`Failed to load jobs (${res.status})`);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSwipe = async (direction) => {
    if (animatingDirection) return; // Prevent spam clicks
    const currentJob = jobs[currentIndex];
    const candidateId = localStorage.getItem('id') || "dummy_candidate_id";
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${SWIPE_API}/api/v1/swipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          candidateId: candidateId,
          jobId: currentJob.id,
          recruiterId: currentJob.recruiterId,
          swiperRole: "CANDIDATE",
          direction: direction,
          resumeId: selectedResumeId
        })
      });

      if (!res.ok) throw new Error(`Swipe failed (${res.status})`);
      await res.text(); // Backend returns plain string

      // Start animation
      setAnimatingDirection(direction);

      setTimeout(() => {
        // Advance only after animation finishes
        setCurrentIndex(prev => prev + 1);
        setAnimatingDirection(null);
      }, 400); // Wait for CSS animation width (0.4s)
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  const currentJob = jobs[currentIndex];
  const isFinished = !loading && currentIndex >= jobs.length;

  // Fetch company whenever currentJob changes
  useEffect(() => {
    if (currentJob && currentJob.recruiterId) {
      setCurrentCompany("Loading company...");
      const token = localStorage.getItem('token');
      fetch(`${USER_JOB_API}/api/recruiters/${currentJob.recruiterId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => {
          if (!res.ok) throw new Error("Recruiter not found");
          return res.json();
        })
        .then(data => {
          setCurrentCompany(data.company || `Recruiter: ${data.firstName || currentJob.recruiterId}`);
        })
        .catch(err => {
          setCurrentCompany(`Recruiter ID: ${currentJob.recruiterId}`);
        });
    }
  }, [currentJob]);

  if (loading) {
    return (
      <div className="dashboard-layout bg-dots">
        <Navbar role="candidate" name={userName} />
        <main className="dashboard-content card-stack-container">
          <div className="empty-state-card">
            <p>Loading jobs...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout bg-dots">
        <Navbar role="candidate" name={userName} />
        <main className="dashboard-content card-stack-container">
          <div className="empty-state-card">
            <p style={{ color: 'red' }}>Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

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
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'center' }}>
            {/* INVISIBLE NEXT CARD */}
            {jobs[currentIndex + 1] && (
              <div className="swipe-card next-card-behind">
                <div className="card-header">
                  <h2 className="job-title">{jobs[currentIndex + 1].roleName || jobs[currentIndex + 1].title}</h2>
                  <p className="company-name">Loading company...</p>
                </div>
                <div className="card-body">
                  <h3 className="section-title">Job Description</h3>
                  <p className="job-description">{jobs[currentIndex + 1].description}</p>
                </div>
              </div>
            )}

            {/* ACTIVE CARD */}
            <div className={`swipe-card fade-in front-card ${animatingDirection === 'LEFT' ? 'swipe-out-left' : ''} ${animatingDirection === 'RIGHT' ? 'swipe-out-right' : ''}`}>
              <div className="card-header">
                <h2 className="job-title">{currentJob.roleName || currentJob.title}</h2>
                <p className="company-name">{currentCompany}</p>
              </div>

              <div className="card-body">
                <h3 className="section-title">Job Description</h3>
                <p className="job-description">{currentJob.description}</p>

                <h3 className="section-title mt-4">Required Skills</h3>
                <div className="skills-container">
                  {(currentJob.skillsNeeded || currentJob.skills || []).map((skill, idx) => (
                    <span key={idx} className="skill-pill">{skill}</span>
                  ))}
                </div>

                {/* Resume Selection Dropdown */}
                {(resumes.length > 0 || defaultResumeName) && (
                  <div className="resume-select-section" style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(244, 63, 94, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(244, 63, 94, 0.15)'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: '#f43f5e',
                      marginBottom: '0.5rem'
                    }}>
                      <FileText size={16} />
                      Resume to share with recruiter
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        fontSize: '0.9rem',
                        color: '#2d3748',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="default">
                        {defaultResumeName ? `Default (${defaultResumeName})` : 'Default Resume'}
                      </option>
                      {resumes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.fieldName} ({r.filename})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="action-btn pass-btn"
                  onClick={() => handleSwipe('LEFT')}
                  aria-label="Pass Job"
                >
                  <X size={32} />
                </button>

                <button
                  className="action-btn like-btn"
                  onClick={() => handleSwipe('RIGHT')}
                  aria-label="Like Job"
                >
                  <Heart size={32} />
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default CandidateDashboard;
