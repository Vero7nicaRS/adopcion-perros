import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

/* Component for protecting routes that require authentication.
    - No: User is not authenticated --> Redirect to login page
    - Yes: User is authenticated --> Redirect to AdoptionApplicationForm page*/
function ProtectedRoute({ children }) {
    const { isAuthenticated, authLoading } = useAuth();

    if(authLoading){
        return <p className="hd-info">Cargando sesión...</p>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;