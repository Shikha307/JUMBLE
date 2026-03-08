import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, UploadCloud, CheckCircle } from 'lucide-react';

function CandidateRegister() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const fileRef = useRef(null);

  /* --- Validation Helpers --- */
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() === '' ? 'Name is required.' : '';
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!value) return 'Email is required.';
        if (!emailRegex.test(value)) return 'Please enter a valid email address.';
        return '';
      }
      case 'password': {
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
      }
      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== form.password) return 'Passwords do not match.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    // Re-validate confirm password if password changed
    if (name === 'password' && form.confirmPassword) {
      const cpError = value !== form.confirmPassword ? 'Passwords do not match.' : '';
      setErrors(prev => ({ ...prev, confirmPassword: cpError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  /* --- Skills --- */
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setSkillError('Skill already added.');
      return;
    }
    setSkills(prev => [...prev, trimmed]);
    setSkillInput('');
    setSkillError('');
  };

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  /* --- Resume --- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const valid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!valid.includes(file.type)) {
      setResumeError('Only .pdf or .docx files are accepted.');
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
    setResumeError('');
  };

  /* --- Submit --- */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate all fields
    const newErrors = {};
    Object.keys(form).forEach(key => {
      newErrors[key] = validateField(key, form[key]);
    });
    if (skills.length === 0) setSkillError('Please add at least one skill.');
    if (!resumeFile) setResumeError('Please upload your resume.');
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean) || skills.length === 0 || !resumeFile;
    if (hasErrors) return;

    alert('Candidate registration data ready! (Backend integration pending)');
    console.log({ ...form, skills, resume: resumeFile.name });
  };

  return (
    <div className="login-container">
      <div className="login-card register-card">
        <div className="login-header">
          <h1>JUMBLE</h1>
          <p>Candidate Sign Up</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className="input-group">
            <label htmlFor="name">Name <span className="required-mark">*</span></label>
            <input id="name" name="name" type="text" placeholder="Enter your full name"
              value={form.name} onChange={handleChange} onBlur={handleBlur} />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="email">Email <span className="required-mark">*</span></label>
            <input id="email" name="email" type="email" placeholder="Enter your email"
              value={form.email} onChange={handleChange} onBlur={handleBlur} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password">Password <span className="required-mark">*</span></label>
            <input id="password" name="password" type="password" placeholder="Create a strong password"
              value={form.password} onChange={handleChange} onBlur={handleBlur} />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password <span className="required-mark">*</span></label>
            <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat your password"
              value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>

          {/* Skills */}
          <div className="input-group">
            <label>Skills <span className="required-mark">*</span></label>
            <div className="skill-input-row">
              <input
                type="text"
                placeholder="e.g. Python, React..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className="skill-textbox"
              />
              <button type="button" className="skill-add-btn" onClick={addSkill}>
                <Plus size={18} /> Add
              </button>
            </div>
            {skillError && <p className="error-message">{skillError}</p>}
            {skills.length > 0 && (
              <div className="skills-container tag-area">
                {skills.map((s, i) => (
                  <span key={i} className="skill-pill editable-pill">
                    {s}
                    <button type="button" className="remove-pill" onClick={() => removeSkill(s)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {skills.length === 0 && !skillError && (
              <p className="field-hint">Add at least one skill.</p>
            )}
          </div>

          {/* Resume Upload */}
          <div className="input-group">
            <label>Upload Resume <span className="required-mark">*</span></label>
            <div className="resume-upload-box" onClick={() => fileRef.current.click()}>
              <input type="file" ref={fileRef} accept=".pdf,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
              {!resumeFile ? (
                <>
                  <UploadCloud size={28} className="upload-icon-inline" />
                  <span>Click to upload (.pdf or .docx)</span>
                </>
              ) : (
                <>
                  <CheckCircle size={24} style={{ color: '#48bb78' }} />
                  <span className="file-name">{resumeFile.name}</span>
                  <button type="button" className="change-file-btn" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}>
                    Change file
                  </button>
                </>
              )}
            </div>
            {resumeError && <p className="error-message">{resumeError}</p>}
          </div>

          <button type="submit" className="login-btn" style={{ marginTop: '0.5rem' }}>Sign Up</button>
        </form>

        <div className="signup-link" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login">Sign in.</Link>
        </div>
        <div className="signup-link" style={{ marginTop: '0.5rem' }}>
          Not a candidate? <Link to="/register/recruiter">Register as Recruiter.</Link>
        </div>
      </div>
    </div>
  );
}

export default CandidateRegister;
