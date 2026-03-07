import { useState, useRef } from 'react';
import Navbar from './Navbar';
import { UploadCloud, CheckCircle } from 'lucide-react';

function CandidateWelcome({ name }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        alert("Please upload a valid PDF or DOCX file.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      alert("Resume uploaded successfully! Profile generation will begin.");
      // In the future: API call to upload and parse resume
    }, 1500);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="dashboard-layout">
      <Navbar role="candidate" name={name || "Candidate"} />
      
      <main className="dashboard-content">
        <div className="welcome-card">
          <h1>Welcome {name}, let us create your profile.</h1>
          <p className="welcome-subtitle">Please upload your resume here to get started.</p>
          
          <div 
            className={`upload-zone ${file ? 'has-file' : ''}`}
            onClick={triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.docx" 
              style={{ display: 'none' }} 
            />
            
            {!file ? (
              <div className="upload-prompt">
                <UploadCloud size={48} className="upload-icon" />
                <h3>Click to Upload Resume</h3>
                <p>Accepts .PDF or .DOCX only</p>
              </div>
            ) : (
              <div className="upload-success">
                <CheckCircle size={48} className="success-icon" />
                <h3>Selected File:</h3>
                <p className="file-name">{file.name}</p>
                <button className="change-file-btn" onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}>Choose different file</button>
              </div>
            )}
          </div>

          <button 
            className={`login-btn submit-resume-btn ${!file || isUploading ? 'disabled' : ''}`}
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading & Parsing...' : 'Generate My Profile'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default CandidateWelcome;
