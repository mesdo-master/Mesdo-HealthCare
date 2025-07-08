import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, authChecked,mode ,currentUser} = useSelector(state => state.auth);
  const location = useLocation();

  if (!authChecked ||  currentUser === null) {
    // Show a loading indicator while the auth status is being verified
    return (
      <div className="flex flex-row gap-2 h-screen w-full justify-center items-center">
        <div className="w-4 h-4 rounded-full bg-[#198FFF] animate-bounce [animation-delay:.7s]" />
        <div className="w-4 h-4 rounded-full bg-[#198FFF] animate-bounce [animation-delay:.3s]" />
        <div className="w-4 h-4 rounded-full bg-[#198FFF] animate-bounce [animation-delay:.7s]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based restriction: if a role is provided and user doesn't match it
const allowed = Array.isArray(role) ? role.includes(mode) : mode === role;

if (!allowed) {
  return <Navigate to="/" replace />;
}


  // All checks passed
  return children;
}

export default ProtectedRoute;
