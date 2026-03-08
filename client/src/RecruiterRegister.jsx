import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RecruiterRegister() {
  const [form, setForm] = useState({
    name: '', email: '', companyName: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      case 'companyName':
        return value.trim() === '' ? 'Company name is required.' : '';
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
    if (name === 'password' && form.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value !== form.confirmPassword ? 'Passwords do not match.' : ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const newErrors = {};
    Object.keys(form).forEach(key => {
      newErrors[key] = validateField(key, form[key]);
    });
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register/recruiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          companyName: form.companyName,
          password: form.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);
        window.location.href = '/dashboard';
      } else {
        const text = await response.text();
        setApiError(text || 'Registration failed');
      }
    } catch (err) {
      setApiError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card register-card">
        <div className="login-header">
          <h1>JUMBLE</h1>
          <p>Recruiter Sign Up</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {apiError && <p className="error-message" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1rem' }}>{apiError}</p>}


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
            <input id="email" name="email" type="email" placeholder="Work email address"
              value={form.email} onChange={handleChange} onBlur={handleBlur} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          {/* Company Name */}
          <div className="input-group">
            <label htmlFor="companyName">Company Name <span className="required-mark">*</span></label>
            <input id="companyName" name="companyName" type="text" placeholder="Your company's name"
              value={form.companyName} onChange={handleChange} onBlur={handleBlur} />
            {errors.companyName && <p className="error-message">{errors.companyName}</p>}
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

          <button type="submit" className="login-btn" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div className="signup-link" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login">Sign in.</Link>
        </div>
        <div className="signup-link" style={{ marginTop: '0.5rem' }}>
          Not a recruiter? <Link to="/register/candidate">Register as Candidate.</Link>
        </div>
      </div>
    </div>
  );
}

export default RecruiterRegister;
