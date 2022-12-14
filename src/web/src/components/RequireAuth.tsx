import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../Hooks/useAuth";

const RequireAuth = () => {
    const { token } = useAuth();
    const location = useLocation();

    return token.length > 0 ? <Outlet /> : <Navigate to="/signin" state={{ from: location }} replace />;
};

export default RequireAuth;
