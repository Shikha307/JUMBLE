import { Link } from 'react-router-dom';

function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for login to be implemented later
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>JUMBLE</h1>
          <p>Find your dream job!</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/register">Create one.</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
