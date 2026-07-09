import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If there is no user logged in, instantly redirect them to /login
  if (!user) {
    return ;
  }

  // If they are logged in, let them see the page they requested
  return children;
}