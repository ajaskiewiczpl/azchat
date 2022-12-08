import React, { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';

type Props = {

}

const RequireAuth = (props: Props) => {

    const { userName, token } = useAuth();
    const location = useLocation();

    return (
        (token.length > 0)
            ? <Outlet />
            : <Navigate to="/signin" state={{ from: location }} replace />
    )
}

export default RequireAuth