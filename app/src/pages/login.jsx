import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle Email / Password
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = isRegistering
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate('/'); // Send them back to the home page or store after success
    }
  };

  // Handle Google / Facebook Login
  const handleOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>{isRegistering ? 'Create Member Account' : 'Member Login'}</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Email address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">
          {isRegistering ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button type="button" onClick={() => handleOAuth('google')}>Continue with Google</button>
        <button type="button" onClick={() => handleOAuth('facebook')}>Continue with Facebook</button>
      </div>

      <p style={{ marginTop: '20px', cursor: 'pointer', color: 'blue' }} 
         onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already a member? Login here.' : 'Need an account? Register here.'}
      </p>
    </div>
  );
}