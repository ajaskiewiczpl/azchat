import { Navigate, Outlet } from "react-router";
import useAuth from "../hooks/useAuth";

const RequireNoAuth = () => {
    const { user } = useAuth();

    return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default RequireNoAuth;
