import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = isRegistering
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    else navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-2xl shadow-sm">
      <h2 className="text-2xl font-serif mb-6">{isRegistering ? 'Create Member Account' : 'Member Login'}</h2>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border p-3 rounded-lg" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border p-3 rounded-lg" />
        <button type="submit" className="w-full bg-black text-white p-3 rounded-lg">{isRegistering ? 'Sign Up' : 'Login'}</button>
      </form>
      <p onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-center text-blue-600 mt-6 cursor-pointer">
        {isRegistering ? 'Already a member? Login' : 'Need an account? Register'}
      </p>
    </div>
  );
}