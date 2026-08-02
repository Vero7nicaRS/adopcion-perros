import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

/*
    Component for protecting routes that require admin privileges.
    - No: User is not authenticated --> Redirect to login page
    - Yes: User is authenticated but not an admin --> Redirect to home page
    - Yes: User is authenticated and an admin --> Render the children components
 */
function AdminRoute({ children }) {
    const { isAuthenticated, user, authLoading } = useAuth();

    if (authLoading) {
        return <p className="hd-info">Cargando sesión...</p>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user?.is_staff) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;