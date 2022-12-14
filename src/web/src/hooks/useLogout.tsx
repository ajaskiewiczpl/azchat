import React, { useContext } from "react";
import AuthContext from "../Context/AuthProvider";

const useLogout = () => {
    const { signOut } = useContext(AuthContext);

    const logout = () => {
        signOut();
    };

    return logout;
};

export default useLogout;
