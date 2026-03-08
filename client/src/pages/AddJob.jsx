import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AddJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    skillsNeeded: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      roleName: formData.roleName,
      description: formData.description,
      skillsNeeded: formData.skillsNeeded.split(',').map(s => s.trim()).filter(s => s),
      recruiterId: localStorage.getItem('id') // Retrieved from login/registration
    };
    
    try {
      const response = await fetch('http://localhost:8081/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        alert("Job added successfully!");
        navigate('/recruiter'); // Redirect back to home after adding
      } else {
        alert("Failed to add job.");
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      alert("Error submitting job.");
    }
  };

  return (
    <div className="add-job-page">
      <Navbar />
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <h2>Post a New Job</h2>
            <p>Find the perfect match for your team.</p>
          </div>
          
          <form className="job-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="roleName">Role Name</label>
              <input
                type="text"
                id="roleName"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                placeholder="e.g. Senior Java Developer"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Looking for an expert Spring Boot developer to build skynet APIs."
                rows="5"
                required
              ></textarea>
            </div>

            <div className="input-group">
              <label htmlFor="skillsNeeded">Skills Needed (comma-separated)</label>
              <input
                type="text"
                id="skillsNeeded"
                name="skillsNeeded"
                value={formData.skillsNeeded}
                onChange={handleChange}
                placeholder="e.g. Java, Spring Boot, MySQL"
                required
              />
            </div>

            <button type="submit" className="submit-btn">Add Job</button>
          </form>
        </div>
      </div>
    </div>
  );
}
