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
  const [resumeFile, setResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [country, setCountry] = useState('');
  const [university, setUniversity] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [countries, setCountries] = useState([]);
  const fileRef = useRef(null);

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
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (role === 'candidate') {
          setSkills(data.skills || []);
          setExistingResume(data.resumeFilename || null);
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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

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
        formData.append('University', university);   // backend expects capital-U "University"
        if (linkedin) formData.append('linkedin', linkedin);
        if (resumeFile) formData.append('resume', resumeFile);
        else if (!existingResume) {
          setErrorMsg('Resume is required');
          setProfileLoading(false);
          return;
        } else {
          // Need a dummy file if not updating resume but spring requires MultipartFile. 
          // In a robust implementation, the backend would handle partial updates better.
          const blob = new Blob(['dummy'], { type: 'application/pdf' });
          formData.append('resume', blob, existingResume);
        }

        const res = await fetch('http://localhost:8080/api/candidates/me/profile', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (res.ok) setMessage('Profile updated successfully!');
        else setErrorMsg(await res.text() || 'Failed to update profile.');
      } else {
        const res = await fetch('http://localhost:8080/api/recruiters/me/profile', {
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
      const res = await fetch(`http://localhost:8080${endpoint}`, {
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

  return (
    <>
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

              <div className="input-group">
                <label>Resume Update</label>
                <div className="resume-upload-box" onClick={() => fileRef.current.click()}>
                  <input type="file" ref={fileRef} accept=".pdf,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                  {!resumeFile ? (
                    <>
                      <UploadCloud size={28} className="upload-icon-inline" />
                      <span>{existingResume ? `Current: ${existingResume} (Click to change)` : 'Upload new resume (.pdf / .docx)'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} style={{ color: '#48bb78' }} />
                      <span className="file-name">{resumeFile.name}</span>
                    </>
                  )}
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


        {/* --- PASSWORD FORM --- */}
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

      </div>
    </div>
    </>
  );
}

export default ManageProfile;
