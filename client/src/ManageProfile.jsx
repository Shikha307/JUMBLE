import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, UploadCloud, CheckCircle } from 'lucide-react';
import Navbar from './Navbar';

function ManageProfile() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Candidate state
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [existingResume, setExistingResume] = useState(null);
  const [country, setCountry] = useState('');
  const [university, setUniversity] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [countries, setCountries] = useState([]);
  const fileRef = useRef(null);

  // Multiple Resumes state
  const [resumes, setResumes] = useState([]);
  const [newResumeField, setNewResumeField] = useState('');
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [activeResumeId, setActiveResumeId] = useState('');
  const [activeResumeLoading, setActiveResumeLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recruiter state
  const [companyName, setCompanyName] = useState('');

  // Password state
  const [passParams, setPassParams] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // UI state
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();

    // Fetch countries
    fetch('https://restcountries.com/v3.1/all?fields=name')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        const sorted = data.map(c => c.name.common).sort();
        console.log(`Loaded ${sorted.length} countries`);
        setCountries(sorted);
      })
      .catch(err => console.error('Failed to fetch countries', err));
  }, [token]);

  const fetchProfile = async () => {
    try {
      const endpoint = role === 'candidate' ? '/api/candidates/me' : '/api/recruiters/me';
      const res = await fetch(`http://localhost:8081${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (role === 'candidate') {
          setSkills(data.skills || []);
          setExistingResume(data.resumeFilename || null);
          setResumes(data.resumes || []);
          setActiveResumeId(data.activeResumeId || '');
          setCountry(data.country || '');
          setUniversity(data.university || '');
          setLinkedin(data.linkedin || '');
        } else {
          setCompanyName(data.company || '');
        }
      } else {
        setErrorMsg('Failed to load profile data.');
      }
    } catch (e) {
      setErrorMsg('Cannot connect to server.');
    }
  };

  /* --- Candidate Profile Helpers --- */
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills(prev => [...prev, trimmed]);
    setSkillInput('');
  };
  const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill));

  /* --- Password Validation --- */
  const validatePassword = (value) => {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter.';
    if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter.';
    if (!/[0-9]/.test(value)) return 'Must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(value)) return 'Must contain at least one special character.';
    for (let i = 0; i < value.length - 1; i++) {
      if (value[i] === value[i + 1]) return 'No two consecutive identical characters allowed.';
    }
    return '';
  };

  /* --- Profile Submit --- */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setErrorMsg(''); setProfileLoading(true);

    try {
      if (role === 'candidate') {
        if (!country) {
          setErrorMsg('Country is required');
          setProfileLoading(false);
          return;
        }

        const formData = new FormData();
        skills.forEach(s => formData.append('skills', s));
        formData.append('country', country);
        formData.append('University', university);
        if (linkedin) formData.append('linkedin', linkedin);
        if (!existingResume) {
          setErrorMsg('Please upload at least one resume first.');
          setProfileLoading(false);
          return;
        }
        // Keep existing resume unchanged
        const blob = new Blob(['dummy'], { type: 'application/pdf' });
        formData.append('resume', blob, existingResume);

        const res = await fetch('http://localhost:8081/api/candidates/me/profile', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (res.ok) setMessage('Profile updated successfully!');
        else setErrorMsg(await res.text() || 'Failed to update profile.');
      } else {
        const res = await fetch('http://localhost:8081/api/recruiters/me/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ company: companyName })
        });
        if (res.ok) setMessage('Profile updated successfully!');
        else setErrorMsg(await res.text() || 'Failed to update profile.');
      }
    } catch (e) {
      setErrorMsg('Error updating profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  /* --- Password Submit --- */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setErrorMsg('');

    if (passParams.newPassword !== passParams.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }
    const passErr = validatePassword(passParams.newPassword);
    if (passErr) {
      setErrorMsg(passErr);
      return;
    }

    setPasswordLoading(true);
    try {
      const endpoint = role === 'candidate' ? '/api/candidates/me/password' : '/api/recruiters/me/password';
      const res = await fetch(`http://localhost:8081${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword: passParams.oldPassword,
          newPassword: passParams.newPassword
        })
      });

      if (res.ok) {
        alert('Password updated successfully. Please log back in.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        window.location.href = '/login';
      } else {
        setErrorMsg(await res.text() || 'Failed to update password.');
      }
    } catch (e) {
      setErrorMsg('Error updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  /* --- Multiple Resumes Operations --- */
  const handleUploadNewResume = async () => {
    if (!newResumeFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    if (!newResumeField.trim()) {
      setErrorMsg('Please enter a field or title for this resume.');
      return;
    }
    setResumeLoading(true);
    setMessage(''); setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('fieldName', newResumeField);
      formData.append('resume', newResumeFile);

      const res = await fetch('http://localhost:8081/api/candidates/me/resumes', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setMessage('Resume added successfully!');
        setNewResumeFile(null);
        setNewResumeField('');
        fetchProfile();
      } else {
        setErrorMsg(await res.text() || 'Failed to add resume.');
      }
    } catch (e) {
      setErrorMsg('Error adding resume.');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    setResumeLoading(true);
    setMessage(''); setErrorMsg('');
    try {
      const res = await fetch(`http://localhost:8081/api/candidates/me/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage('Resume deleted successfully!');
        fetchProfile();
      } else {
        setErrorMsg(await res.text() || 'Failed to delete resume.');
      }
    } catch (e) {
      setErrorMsg('Error deleting resume.');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleActiveResumeChange = async (e) => {
    const newActiveId = e.target.value;
    setActiveResumeLoading(true);
    setMessage(''); setErrorMsg('');
    try {
      const res = await fetch('http://localhost:8081/api/candidates/me/active-resume', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activeResumeId: newActiveId })
      });
      if (res.ok) {
        setActiveResumeId(newActiveId);
        setMessage('Active resume updated successfully!');
      } else {
        setErrorMsg('Failed to update active resume.');
      }
    } catch (err) {
      setErrorMsg('Error updating active resume.');
    } finally {
      setActiveResumeLoading(false);
    }
  };

  return (
    <div className={role === 'recruiter' ? 'recruiter-theme' : ''} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar role={role} name={localStorage.getItem('name') || ''} />
      <div className="login-container" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
        <div className="login-card register-card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="login-header">
            <h1>Manage Profile</h1>
            <p>Update your details or change your password</p>
          </div>

          {message && <div style={{ color: '#48bb78', textAlign: 'center', marginBottom: '1rem', background: '#f0fff4', padding: '0.5rem', borderRadius: 4 }}>{message}</div>}
          {errorMsg && <div style={{ color: '#e53e3e', textAlign: 'center', marginBottom: '1rem', background: '#fff5f5', padding: '0.5rem', borderRadius: 4 }}>{errorMsg}</div>}

          {/* --- PROFILE FORM --- */}
          <form className="login-form" onSubmit={handleProfileSubmit} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d3748' }}>
              {role === 'candidate' ? 'Update Skills & Resume' : 'Update Company Info'}
            </h2>

            {role === 'candidate' && (
              <>
                <div className="input-group">
                  <label>Skills</label>
                  <div className="skill-input-row">
                    <input
                      type="text"
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      className="skill-textbox"
                    />
                    <button type="button" className="skill-add-btn" onClick={addSkill}><Plus size={18} /> Add</button>
                  </div>
                  {skills.length > 0 && (
                    <div className="skills-container tag-area">
                      {skills.map((s, i) => (
                        <span key={i} className="skill-pill editable-pill">
                          {s} <button type="button" className="remove-pill" onClick={() => removeSkill(s)}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label>Country <span className="required-mark">*</span></label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="skill-textbox"
                    style={{ width: '100%', padding: '0.75rem' }}
                    required
                  >
                    <option value="">Select your country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label>University (Optional)</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Enter your university name"
                  />
                </div>

                <div className="input-group">
                  <label>LinkedIn Profile (Optional)</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="input-group" style={{ background: '#f7fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>

                  {resumes.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#ebf8ff', borderRadius: '8px', border: '1px solid #bee3f8' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#2b6cb0' }}>Select Default Resume</label>
                      <p style={{ fontSize: '0.875rem', color: '#4a5568', marginBottom: '0.75rem' }}>The selected resume will be sent to recruiters when you apply for jobs.</p>

                      <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
                        <div
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="skill-textbox"
                          style={{ width: '100%', padding: '0.75rem', borderColor: '#90cdf4', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '4px' }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {!activeResumeId ? (existingResume ? `(${existingResume})` : 'Default Resume') :
                              resumes.find(r => r.id === activeResumeId) ? `${resumes.find(r => r.id === activeResumeId).fieldName} (${resumes.find(r => r.id === activeResumeId).filename})` : 'Select a resume'
                            }
                          </span>
                          <span style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '0.5rem' }}>▼</span>
                        </div>

                        {isDropdownOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e0', borderRadius: '0 0 4px 4px', zIndex: 10, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>

                            {/* Primary Option */}
                            <div
                              onClick={() => { handleActiveResumeChange({ target: { value: '' } }); setIsDropdownOpen(false); }}
                              style={{ padding: '0.75rem', borderBottom: '1px solid #edf2f7', cursor: 'pointer', background: !activeResumeId ? '#ebf8ff' : 'white', display: 'flex', alignItems: 'center' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.background = !activeResumeId ? '#ebf8ff' : 'white'}
                            >
                              <span style={{ flex: 1, fontWeight: !activeResumeId ? 'bold' : 'normal', color: '#2d3748' }}>{existingResume ? `(${existingResume})` : 'Default Resume'}</span>
                              {!activeResumeId && <CheckCircle size={16} color="#4299e1" />}
                            </div>

                            {/* Uploaded Resumes */}
                            {resumes.map(r => (
                              <div
                                key={r.id}
                                style={{ padding: '0.75rem', borderBottom: '1px solid #edf2f7', cursor: 'pointer', background: activeResumeId === r.id ? '#ebf8ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = activeResumeId === r.id ? '#ebf8ff' : 'white'}
                              >
                                <div
                                  onClick={() => { handleActiveResumeChange({ target: { value: r.id } }); setIsDropdownOpen(false); }}
                                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                  <span style={{ fontWeight: activeResumeId === r.id ? 'bold' : 'normal', color: '#2d3748' }}>
                                    {r.fieldName} <span style={{ color: '#718096', fontSize: '0.85rem', fontWeight: 'normal' }}>({r.filename})</span>
                                  </span>
                                  {activeResumeId === r.id && <CheckCircle size={16} color="#4299e1" />}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteResume(r.id); }}
                                  style={{ background: '#fff5f5', border: '1px solid #feb2b2', color: '#e53e3e', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, flexShrink: 0, transition: '0.2s', marginLeft: '1rem' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fed7d7'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff5f5'; }}
                                  title="Delete resume"
                                >
                                  <X size={14} strokeWidth={2.5} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <strong>Add New Resume:</strong>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Resume"
                        value={newResumeField}
                        onChange={(e) => setNewResumeField(e.target.value)}
                        className="skill-textbox"
                      />

                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => setNewResumeFile(e.target.files[0])}
                        style={{ flex: 1, padding: '0.5rem', background: 'white', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUploadNewResume}
                      disabled={resumeLoading || !newResumeFile || !newResumeField.trim()}
                      className="login-btn"
                      style={{ padding: '0.5rem', background: '#4a5568', marginTop: '0.5rem' }}
                    >
                      {resumeLoading ? 'Uploading...' : 'Upload Resume'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {role === 'recruiter' && (
              <div className="input-group">
                <label>Company Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              </div>
            )}

            <button type="submit" className="login-btn" disabled={profileLoading}>
              {profileLoading ? 'Updating Profile...' : 'Update Profile'}
            </button>
          </form>


          {/* --- PASSWORD FORM ---
          <form className="login-form" onSubmit={handlePasswordSubmit}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#2d3748' }}>Change Password</h2>

            <div className="input-group">
              <label>Current Password</label>
              <input type="password" value={passParams.oldPassword} onChange={e => setPassParams(p => ({ ...p, oldPassword: e.target.value }))} required />
            </div>

            <div className="input-group">
              <label>New Password</label>
              <input type="password" placeholder="Min 8 chars, 1 uppercase, 1 special..." value={passParams.newPassword} onChange={e => setPassParams(p => ({ ...p, newPassword: e.target.value }))} required />
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <input type="password" value={passParams.confirmPassword} onChange={e => setPassParams(p => ({ ...p, confirmPassword: e.target.value }))} required />
            </div>

            <button type="submit" className="login-btn" disabled={passwordLoading} style={{ background: '#e53e3e' }}>
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
          */}

        </div>
      </div>
    </div>
  );
}

export default ManageProfile;
