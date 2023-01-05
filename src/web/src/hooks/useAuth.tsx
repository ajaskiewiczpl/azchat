import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const useAuth = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    return useMemo(() => ({ user }), [user]);
};

export default useAuth;
