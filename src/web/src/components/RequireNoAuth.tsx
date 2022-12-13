import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";

const RequireNoAuth = () => {
    const { token } = useAuth();
    const location = useLocation();

    return token.length == 0 ? <Outlet /> : <Navigate to="/" replace />;
};

export default RequireNoAuth;
