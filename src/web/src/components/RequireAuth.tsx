import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";

export type RequireAuthProps = {
    allowedRoles?: string[];
};

const RequireAuth = (props: RequireAuthProps) => {
    const { token, role } = useAuth();
    const location = useLocation();

    if (token.length > 0) {
        if ((props.allowedRoles || []).length > 0) {
            if (props.allowedRoles!.includes(role)) {
                return <Outlet />;
            } else {
                return <Navigate to="/forbidden" state={{ from: location }} replace />;
            }
        } else {
            return <Outlet />;
        }
    } else {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }
};

export default RequireAuth;
