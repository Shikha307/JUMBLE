import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Pencil, Save, X } from 'lucide-react';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [countries, setCountries] = useState([]);

  // Fetch countries on mount
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name')
      .then(res => res.json())
      .then(data => {
        const sorted = data.map(c => c.name.common).sort();
        setCountries(sorted);
      })
      .catch(err => console.error('Failed to fetch countries', err));
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const recruiterId = localStorage.getItem('id');
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8081/api/recruiters/${recruiterId}/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        } else {
          console.error("Failed to fetch jobs");
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  const handleEditClick = (job) => {
    setEditingId(job.id);
    setEditFormData({
      ...job,
      skillsNeeded: job.skillsNeeded ? job.skillsNeeded.join(', ') : ''
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async (id) => {
    const finalData = {
      ...editFormData,
      skillsNeeded: typeof editFormData.skillsNeeded === 'string' 
        ? editFormData.skillsNeeded.split(',').map(s => s.trim()).filter(s => s) 
        : editFormData.skillsNeeded
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        const updatedJob = await response.json();
        const updatedJobs = jobs.map(job => (job.id === id ? updatedJob : job));
        setJobs(updatedJobs);
        setEditingId(null);
        alert("Job updated successfully!");
      } else {
        alert("Failed to update job.");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Error updating job.");
    }
  };

  return (
    <div className="add-job-page my-jobs-page recruiter-theme">
      <Navbar />
      <div className="form-container my-jobs-container">
        <div className="form-header my-jobs-header">
          <h2>My Posted Jobs</h2>
          <p>Manage and update your active job descriptions.</p>
        </div>

        <div className="jobs-list">
          {jobs.map((job) => (
            <div className="job-card" key={job.id}>
              {editingId === job.id ? (
                <div className="job-form edit-job-form">
                  <div className="input-group">
                    <label>Role Name</label>
                    <input type="text" name="roleName" value={editFormData.roleName || ''} onChange={handleEditChange} />
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <textarea name="description" value={editFormData.description || ''} onChange={handleEditChange} rows="4"></textarea>
                  </div>
                  <div className="input-group">
                    <label>Country</label>
                    <select name="country" value={editFormData.country || ''} onChange={handleEditChange} className="form-select">
                      <option value="">Select a country</option>
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Skills Needed (comma-separated)</label>
                    <input type="text" name="skillsNeeded" value={editFormData.skillsNeeded || ''} onChange={handleEditChange} />
                  </div>
                  <div className="edit-actions">
                    <button className="submit-btn save-btn" onClick={() => handleSaveClick(job.id)}>
                      <Save size={18} /> Save
                    </button>
                    <button className="submit-btn cancel-btn" onClick={handleCancelClick}>
                      <X size={18} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="job-details">
                  <div className="job-card-header">
                    <h3>{job.roleName}</h3>
                    <button className="icon-btn edit-icon" onClick={() => handleEditClick(job)} title="Edit Job">
                      <Pencil size={20} />
                    </button>
                  </div>
                  <div className="job-meta">
                    <div className="job-tags" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                      {job.country && (
                        <span className="job-location-tag" style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--primary)', 
                          background: 'var(--primary-light)', 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          📍 {job.country}
                        </span>
                      )}
                      <div className="skills-container" style={{ margin: 0 }}>
                        {job.skillsNeeded && job.skillsNeeded.map((skill, index) => (
                          <span key={index} className="skill-chip">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="job-desc-text">{job.description}</p>
                </div>
              )}
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="no-jobs-empty">
              <p>You haven't posted any jobs yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
