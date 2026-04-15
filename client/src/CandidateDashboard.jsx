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
  const [generatedCoverLetters, setGeneratedCoverLetters] = useState({});
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState(null);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);

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
          resumeId: selectedResumeId,
          coverLetterText: direction === 'RIGHT' ? (generatedCoverLetters[currentJob.id] || null) : null
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

  const handleGenerateCoverLetter = async () => {
    const currentJob = jobs[currentIndex];
    if (!currentJob) return;

    setIsGeneratingCoverLetter(true);
    setCoverLetterError(null);

    try {
      const token = localStorage.getItem('token');
      const resumeId = selectedResumeId || 'default';
      const url = `${USER_JOB_API}/api/ai/cover-letter/${currentJob.id}?resumeId=${encodeURIComponent(resumeId)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to generate cover letter.');
      }

      const data = await res.json();

      const extractCoverLetterText = (payload) => {
        if (!payload) return '';

        if (typeof payload === 'string') {
          return payload.trim();
        }

        const direct = [
          payload.coverLetter,
          payload.cover_letter,
          payload.coverletter,
          payload.letter,
          payload.content,
          payload.text
        ];

        for (const value of direct) {
          if (typeof value === 'string' && value.trim()) {
            return value.trim();
          }
        }

        const nested = [payload.data, payload.result, payload.response, payload.body];
        for (const value of nested) {
          if (value && typeof value === 'object') {
            const nestedText = extractCoverLetterText(value);
            if (nestedText) return nestedText;
          }
        }

        // Some backends return a JSON string in "detail".
        if (typeof payload.detail === 'string' && payload.detail.trim()) {
          try {
            const parsedDetail = JSON.parse(payload.detail);
            const detailText = extractCoverLetterText(parsedDetail);
            if (detailText) return detailText;
          } catch {
            return payload.detail.trim();
          }
        }

        return '';
      };

      const letterText = extractCoverLetterText(data);

      if (!letterText) {
        throw new Error(`Cover letter was empty. Response keys: ${Object.keys(data || {}).join(', ')}`);
      }

      setGeneratedCoverLetters(prev => ({
        ...prev,
        [currentJob.id]: letterText
      }));
    } catch (err) {
      setCoverLetterError(err.message || 'Failed to generate cover letter.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const currentJob = jobs[currentIndex];
  const currentCoverLetter = currentJob ? (generatedCoverLetters[currentJob.id] || '').trim() : '';
  const isFinished = !loading && currentIndex >= jobs.length;

  useEffect(() => {
    setIsCoverLetterModalOpen(false);
  }, [currentIndex]);

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

                <div className="resume-select-section" style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(20, 184, 166, 0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(20, 184, 166, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: '#0f766e'
                    }}>
                      <FileText size={16} />
                      Optional: Generate cover letter
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCoverLetter}
                      disabled={isGeneratingCoverLetter}
                      style={{
                        padding: '0.5rem 0.9rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: isGeneratingCoverLetter ? '#94a3b8' : '#0d9488',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: isGeneratingCoverLetter ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isGeneratingCoverLetter ? 'Generating...' : 'Generate'}
                    </button>
                  </div>

                  {coverLetterError && (
                    <div style={{ marginTop: '0.6rem', color: '#dc2626', fontSize: '0.85rem' }}>
                      {coverLetterError}
                    </div>
                  )}

                  {currentCoverLetter && (
                    <div style={{ marginTop: '0.8rem', background: 'white', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.6rem' }}>
                        Cover Letter Ready
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setIsCoverLetterModalOpen(true)}
                          style={{
                            padding: '0.45rem 0.8rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#ecfeff',
                            color: '#0f766e',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          View Cover Letter
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateCoverLetter}
                          disabled={isGeneratingCoverLetter}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: isGeneratingCoverLetter ? '#94a3b8' : '#0d9488',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            textDecoration: 'underline',
                            cursor: isGeneratingCoverLetter ? 'not-allowed' : 'pointer',
                            padding: 0
                          }}
                        >
                          {isGeneratingCoverLetter ? 'Re-generating...' : 'Re-generate cover letter'}
                        </button>
                      </div>
                    </div>
                  )}
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
          </div>
        )}

      </main>

      {isCoverLetterModalOpen && currentCoverLetter && (
        <div
          onClick={() => setIsCoverLetterModalOpen(false)}
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
              onClick={() => setIsCoverLetterModalOpen(false)}
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
              {currentCoverLetter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateDashboard;
