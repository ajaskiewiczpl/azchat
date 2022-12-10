import React, { useContext, useDebugValue } from "react";
import AuthContext from "../context/AuthProvider";

const useAuth = () => {
    const { userName } = useContext(AuthContext);
    useDebugValue(userName, (userName) => (userName ? "Logged In" : "Logged Out"));
    return useContext(AuthContext);
};

export default useAuth;
