import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const useAuthToken = () => {
    const authToken = useSelector((state: RootState) => state.auth.token) || "";
    return useMemo(() => ({ authToken }), [authToken]);
};

export default useAuthToken;
