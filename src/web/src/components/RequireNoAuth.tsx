import { Navigate, Outlet } from "react-router";
import useAuth from "../hooks/useAuth";

const RequireNoAuth = () => {
    const { token } = useAuth();

    return token.length == 0 ? <Outlet /> : <Navigate to="/" replace />;
};

export default RequireNoAuth;
