import { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    role: '', // default empty field
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    // Basic email regex that ensures a valid domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 10;
    const hasNumber = /[0-9]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    
    // Check for no 2 adjacent characters being the same
    let noAdjacentSame = true;
    for (let i = 0; i < password.length - 1; i++) {
        if (password[i] === password[i+1]) {
            noAdjacentSame = false;
            break;
        }
    }

    if (!minLength) return "Password must be at least 10 characters long.";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter.";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter.";
    if (!hasNumber) return "Password must contain at least one number.";
    if (!hasSpecialChar) return "Password must contain at least one special character.";
    if (!noAdjacentSame) return "Password cannot contain two adjacent identical characters.";
    
    return null;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Perform immediate validation on the field being changed
    let newErrors = { ...errors };

    switch (id) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else {
          delete newErrors.name;
        }
        break;

      case 'role':
        if (!value) {
          newErrors.role = "Role selection is required";
        } else {
          delete newErrors.role;
        }
        break;
        
      case 'email':
        if (!validateEmail(value)) {
          newErrors.email = "Please enter a valid email address with a valid domain";
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = "Password is required";
        } else {
          const passwordError = validatePassword(value);
          if (passwordError) {
            newErrors.password = passwordError;
          } else {
            delete newErrors.password;
          }
        }
        
        // Also re-validate confirm password if password changes
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (formData.confirmPassword) {
            delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value.trim()) {
          newErrors.confirmPassword = "Confirm password is required";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trigger validation on all fields recursively just in case they clicked submit while empty
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.role) newErrors.role = "Role selection is required";
    if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address with a valid domain";
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Logic for registration to be implemented later
    console.log("Form is valid! Registering user...", formData);
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <div className="login-header">
          <h1>JUMBLE</h1>
          <p>Create your account & get matched!</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          
          <div className="input-group">
            <label htmlFor="name">Full Name<span className="required-mark">*</span></label>
            <input 
              type="text" 
              id="name" 
              placeholder="Enter your full name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="role">I am a...<span className="required-mark">*</span></label>
            <select 
              id="role" 
              value={formData.role} 
              onChange={handleChange}
              required
              style={{
                padding: '0.8rem 1rem',
                border: '1px solid var(--input-border)',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                color: formData.role ? 'var(--text-dark)' : 'var(--text-light)'
              }}
            >
              <option value="" disabled>Please select</option>
              <option value="candidate">Candidate (Looking for a Job)</option>
              <option value="recruiter">Recruiter (Hiring)</option>
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email<span className="required-mark">*</span></label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password<span className="required-mark">*</span></label>
            <input 
              type="password" 
              id="password" 
              placeholder="Create a strong password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password<span className="required-mark">*</span></label>
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="Confirm your password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="login-btn">
            Sign Up
          </button>
        </form>

        <div className="signup-link">
          Already have an account? <Link to="/login">Login here.</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
