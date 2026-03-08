import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { X, Heart, Briefcase } from 'lucide-react';

const JOBS_API = 'http://localhost:8081/api/jobs/all';
const SWIPE_API = 'http://localhost:8080/api/v1/swipes';

function CandidateDashboard({ userName }) {
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipeStatus, setSwipeStatus] = useState(null); // feedback message
  const [currentCompany, setCurrentCompany] = useState("Loading company...");

  // Fetch only jobs the candidate hasn't swiped on yet
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const candidateId = localStorage.getItem('id');
        const res = await fetch(`http://localhost:8080/api/v1/swipes/candidates/${candidateId}/unswiped-jobs`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          let jobsData = await res.json();

          // Try to fetch ML priorities
          try {
            if (candidateId) {
              const mlRes = await fetch(`/ml_outputs/jobs_prioritized/${candidateId}.json`);
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
        console.error("Error fetching jobs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSwipe = async (direction) => {
    const currentJob = jobs[currentIndex];

    const candidateId = localStorage.getItem('id') || "dummy_candidate_id";

    // Optimistically advance the card
    setCurrentIndex(prev => prev + 1);
    setSwipeStatus(null);

    try {
      const res = await fetch(SWIPE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidateId,
          jobId: currentJob.id,
          recruiterId: currentJob.recruiterId,
          swiperRole: "CANDIDATE",
          direction: direction   // 'RIGHT' or 'LEFT'
        })
      });

      if (!res.ok) throw new Error(`Swipe failed (${res.status})`);
      const data = await res.json();
      console.log('Swipe recorded:', data);
      setSwipeStatus({ type: direction === 'RIGHT' ? 'liked' : 'passed', jobTitle: currentJob.roleName || currentJob.title });
    } catch (err) {
      console.error('Swipe error:', err);
      // setSwipeStatus({ type: 'error', message: err.message }); // Optional error UI
    }
  };

  const currentJob = jobs[currentIndex];
  const isFinished = !loading && currentIndex >= jobs.length;

  // Fetch company whenever currentJob changes
  useEffect(() => {
    if (currentJob && currentJob.recruiterId) {
      setCurrentCompany("Loading company...");
      const token = localStorage.getItem('token');
      fetch(`http://localhost:8081/api/recruiters/${currentJob.recruiterId}`, {
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

        {swipeStatus && swipeStatus.type !== 'error' && (
          <div className={`swipe-feedback ${swipeStatus.type}`}>
            {swipeStatus.type === 'liked' ? '❤️ Liked' : '✖ Passed'}: {swipeStatus.jobTitle}
          </div>
        )}

        {isFinished ? (
          <div className="empty-state-card">
            <Briefcase size={64} className="empty-icon" />
            <h2>You're all caught up!</h2>
            <p>You have reviewed all available job postings. Check back later for more opportunities.</p>
          </div>
        ) : (
          <div className="swipe-card fade-in">
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
        )}

      </main>
    </div>
  );
}

export default CandidateDashboard;
