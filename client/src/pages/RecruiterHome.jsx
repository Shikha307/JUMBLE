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
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [animatingDirection, setAnimatingDirection] = useState(null);

  // Fetch Unswiped Candidates for the selected job
  const fetchCandidates = async (silent = false) => {
    if (!selectedJob) return;
    if (!silent) setLoadingCandidates(true);
    try {
      const token = localStorage.getItem('token');
      let url = `https://swipe-match-70755451505.us-central1.run.app/api/v1/swipes/jobs/${selectedJob.id}/unswiped-candidates`;
      if (selectedCountry) {
        url += `?country=${encodeURIComponent(selectedCountry)}`;
      }

      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        let mappedData = data.map(c => {
          const candidateId = c.userId || c.id || '';
          const activeResumeId = c.activeResumeId || '';
          const resumeUrl = candidateId
            ? `https://user-job-70755451505.us-central1.run.app/api/candidates/${candidateId}/resume${activeResumeId ? `?resumeId=${activeResumeId}` : ''}`
            : '';

          return {
            id: candidateId,
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Candidate',
            skills: Array.isArray(c.skills) ? c.skills : [],
            linkedin: c.linkedin || c.socialLinks?.linkedin || '',
            email: c.email || '',
            resumeUrl: resumeUrl
          };
        });

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
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      if (!silent) setLoadingCandidates(false);
    }
  };

  // Fetch candidates once when a job is selected or the country filter changes
  useEffect(() => {
    if (!selectedJob) return;
    setCurrentIndex(0);
    fetchCandidates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob?.id, selectedCountry]);

  // Fetch Countries on mount
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name')
      .then(res => res.json())
      .then(data => {
        const sorted = data.map(c => c.name.common).sort();
        setCountries(sorted);
      })
      .catch(err => console.error('Failed to fetch countries', err));
  }, []);

  // Fetch Jobs belonging to the recruiter
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const recruiterId = localStorage.getItem('id');
        if (!recruiterId || recruiterId === 'null') {
          console.warn("Recruiter ID missing, fetching all jobs as fallback.");
          const allJobsRes = await fetch(`https://user-job-70755451505.us-central1.run.app/api/jobs/all`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (allJobsRes.ok) {
            const allData = await allJobsRes.json();
            setJobs(allData);
            if (allData.length > 0) setSelectedJob(allData[0]);
          }
          setLoadingJobs(false);
          return;
        }

        const res = await fetch(`https://user-job-70755451505.us-central1.run.app/api/recruiters/${recruiterId}/jobs`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          setJobs(data);
          if (data.length > 0) {
            setSelectedJob(data[0]);
          } else {
            // If this recruiter has no specific jobs, fall back to showing all jobs
            const allRes = await fetch(`https://user-job-70755451505.us-central1.run.app/api/jobs/all`);
            if (allRes.ok) {
              const allData = await allRes.json();
              setJobs(allData);
              if (allData.length > 0) setSelectedJob(allData[0]);
            }
          }
        } else {
          console.error('Failed to fetch recruiter-specific jobs, status:', res.status);
          // General fallback
          const allRes = await fetch(`https://user-job-70755451505.us-central1.run.app/api/jobs/all`);
          if (allRes.ok) {
            const allData = await allRes.json();
            setJobs(allData);
            if (allData.length > 0) setSelectedJob(allData[0]);
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
    if (animatingDirection) return; // Prevent spam clicks
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
      const response = await fetch('https://swipe-match-70755451505.us-central1.run.app/api/v1/swipes', {
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

    // Start animation
    setAnimatingDirection(direction);

    setTimeout(() => {
      // Advance only after animation finishes
      setCurrentIndex(prevIndex => prevIndex + 1);
      setAnimatingDirection(null);
    }, 400); // 0.4s to match CSS animation duration
  };

  const currentCandidate = candidates[currentIndex];

  return (
    <div className="recruiter-page dashboard-layout recruiter-theme">
      <Navbar />

      <main className="recruiter-home-layout">

        {/* SIDEBAR FOR JOBS */}
        <aside className="jobs-sidebar">
          <div className="sidebar-header filters-header">
            <h3>Filters</h3>
          </div>

          <div className="sidebar-list">
            <div className="sidebar-filter-group">
              <label>Filter by Job Posting</label>
              {loadingJobs ? (
                <p style={{ padding: '0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>Loading jobs...</p>
              ) : jobs.length === 0 ? (
                <p style={{ padding: '0.5rem 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  No active jobs. <a href="/create-job" style={{ color: 'var(--primary)' }}>Create one first!</a>
                </p>
              ) : (
                <select
                  value={selectedJob?.id || ''}
                  onChange={(e) => {
                    const job = jobs.find(j => j.id.toString() === e.target.value);
                    setSelectedJob(job);
                    setCurrentIndex(0);
                  }}
                  className="sidebar-select"
                >
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.roleName}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="sidebar-filter-group">
              <label>Filter by Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setCurrentIndex(0);
                }}
                className="sidebar-select"
              >
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
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
            <div className="list-card-wrapper" style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="suggested-header">
                <h2>
                  <Briefcase size={24} style={{ color: 'var(--primary)' }} />
                  Suggested Candidates
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {lastRefreshed && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      Updated {lastRefreshed.toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={() => fetchCandidates()}
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    title="Refresh candidate list"
                  >
                    ↻ Refresh
                  </button>
                </div>
                <div className="accent-line"></div>
              </div>

              <div className="card-stack-container" style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                {/* INVISIBLE NEXT CARD */}
                {candidates[currentIndex + 1] && (
                  <div className="next-card-behind">
                    <CandidateCard
                      candidate={candidates[currentIndex + 1]}
                      onLike={() => { }}
                      onPass={() => { }}
                    />
                  </div>
                )}

                {/* ACTIVE CARD */}
                <div className={`active-card front-card ${animatingDirection === 'LEFT' ? 'swipe-out-left' : ''} ${animatingDirection === 'RIGHT' ? 'swipe-out-right' : ''}`}>
                  <CandidateCard
                    candidate={currentCandidate}
                    onLike={(id) => handleAction(id, 'LIKED')}
                    onPass={(id) => handleAction(id, 'PASSED')}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="no-more-profiles">
              <h2>No eligible candidates!</h2>
              <p>You have reviewed all available profiles for <strong>{selectedJob.roleName}</strong>.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
