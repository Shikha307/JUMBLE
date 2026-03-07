import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<div className="login-container"><div className="login-card"><h1>Register</h1><p>Coming Soon</p></div></div>} />
      </Routes>
    </Router>
  );
}

export default App;
