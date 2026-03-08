import React, { useState, useEffect } from 'react';
import CandidateCard from '../components/CandidateCard';
import Navbar from '../components/Navbar';
import { Briefcase } from 'lucide-react';

export default function RecruiterHome() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Fetch Unswiped Candidates for the selected job
  useEffect(() => {
    if (!selectedJob) return;

    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8082/api/v1/swipes/jobs/${selectedJob.id}/unswiped-candidates`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          let mappedData = data.map(c => ({
            id: c.userId || c.id,
            name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name,
            skills: c.skills || [],
            linkedin: c.socialLinks?.linkedin || c.linkedin || '',
            email: c.email || '',
            resumeUrl: c.resumeUrl || ''
          }));

          // Try to fetch ML priorities
          try {
            const mlRes = await fetch(`/ml_outputs/candidates_prioritized/${selectedJob.id}.json`);
            if (mlRes.ok) {
              const mlCandidates = await mlRes.json();
              const scoreMap = {};
              mlCandidates.forEach(c => {
                if (c.id) scoreMap[c.id] = c.matchScore || 0;
              });

              mappedData = mappedData.map(c => ({
                ...c,
                matchScore: scoreMap[c.id] || 0
              })).sort((a, b) => b.matchScore - a.matchScore);
            }
          } catch (mlErr) {
            console.warn("Could not load ML priorities for job, falling back to default sort.", mlErr);
          }

          setCandidates(mappedData);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
      } finally {
        setLoadingCandidates(false);
      }
    };
    fetchCandidates();
  }, [selectedJob]);

  // Fetch Jobs belonging to the recruiter
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const recruiterId = localStorage.getItem('id');
        
        const res = await fetch(`http://localhost:8081/api/recruiters/${recruiterId}/jobs`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
          if (data.length > 0) {
            setSelectedJob(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const handleAction = async (candidateId, actionType) => {
    if (!selectedJob) {
      alert("Please select a job first before swiping.");
      return;
    }

    const direction = actionType === 'LIKED' ? 'RIGHT' : 'LEFT';
    const payload = {
      candidateId: candidateId.toString(),
      jobId: selectedJob.id.toString(), // Use the selected job dynamically!
      recruiterId: localStorage.getItem('id') || "R1",
      swiperRole: "RECRUITER",
      direction: direction
    };

    try {
      const response = await fetch('http://localhost:8082/api/v1/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        console.error("Failed to record swipe in backend");
      }
    } catch (error) {
      console.error("Error recording swipe:", error);
    }
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const currentCandidate = candidates[currentIndex];

  return (
    <div className="recruiter-page dashboard-layout">
      <Navbar />

      <main className="recruiter-home-layout">
        
        {/* SIDEBAR FOR JOBS */}
        <aside className="jobs-sidebar">
          <div className="sidebar-header">
            <h3>Your Job Postings</h3>
          </div>
          <div className="sidebar-list">
            {loadingJobs ? (
              <p style={{ padding: '1rem', color: 'var(--text-light)' }}>Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p style={{ padding: '1rem', color: 'var(--text-light)' }}>
                No active jobs. <a href="/create-job" style={{color: 'var(--primary)'}}>Create one first!</a>
              </p>
            ) : (
              jobs.map(job => (
                <div 
                  key={job.id} 
                  className={`sidebar-job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedJob(job);
                    setCurrentIndex(0); // Reset candidate list!
                  }}
                >
                  <Briefcase size={16} />
                  <span>{job.roleName}</span>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* SWIPER CONTAINER */}
        <div className="candidates-list-container">
          {!selectedJob ? (
            <div className="welcome-card active-card" style={{ maxWidth: 500, margin: '2rem auto' }}>
              <h2>No Job Selected</h2>
              <p>Please click on a job from the sidebar to start swiping on candidates.</p>
            </div>
          ) : loadingCandidates ? (
            <div className="loading-state">
              <h2>Loading candidates...</h2>
            </div>
          ) : currentCandidate ? (
            <div className="list-card-wrapper active-card">
              <CandidateCard 
                candidate={currentCandidate} 
                onLike={(id) => handleAction(id, 'LIKED')}
                onPass={(id) => handleAction(id, 'PASSED')}
              />
            </div>
          ) : (
            <div className="no-more-profiles">
              <h2>No more candidates!</h2>
              <p>You have reviewed all available profiles for <strong>{selectedJob.roleName}</strong>.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
