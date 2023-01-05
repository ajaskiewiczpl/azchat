import axios from "axios";
import jwtDecode from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";

const tokenKeyName = "token";

function getTokenOrEmptyString(): string {
    return localStorage.getItem(tokenKeyName) || "";
}

function writeTokenToLocalStorage(token: string) {
    localStorage.setItem(tokenKeyName, token);
}

function removeTokenFromLocalStorage() {
    localStorage.removeItem(tokenKeyName);
}

type Jwt = {
    userId: string;
    name: string;
    role: string;
};

export type Auth = {
    userId: string;
    userName: string;
    role: string;
    token: string;
    setToken: (t: string) => void;
    persistToken: (t: string) => void;
    signOut: () => void;
};

const AuthContext = createContext<Auth>({
    userId: "",
    userName: "",
    role: "",
    token: "",
    setToken: (t: string) => {},
    persistToken: (t: string) => {},
    signOut: () => {},
});

type Props = {
    children: any;
};

export const AuthProvider = (props: Props) => {
    const refresh = useRefreshToken();
    const location = useLocation();

    const getUserIdFromToken = () => {
        const jwt = getTokenOrEmptyString();
        if (jwt.length > 0) {
            const { userId } = jwtDecode<Jwt>(jwt);
            return userId;
        } else {
            return "";
        }
    };

    const getUserNameFromToken = () => {
        const jwt = getTokenOrEmptyString();
        if (jwt.length > 0) {
            const { name } = jwtDecode<Jwt>(jwt);
            return name;
        } else {
            return "";
        }
    };

    const getUserRoleFromToken = () => {
        const jwt = getTokenOrEmptyString();
        if (jwt.length > 0) {
            const { role } = jwtDecode<Jwt>(jwt);
            return role;
        } else {
            return "";
        }
    };

    const [userId, setUserId] = useState<string>(getUserIdFromToken());
    const [userName, setUserName] = useState<string>(getUserNameFromToken());
    const [role, setRole] = useState<string>(getUserRoleFromToken());
    const [token, setToken] = useState<string>(getTokenOrEmptyString());

    useEffect(() => {
        if (token) {
            const { userId, name, role } = jwtDecode<Jwt>(token);
            setUserId(userId);
            setUserName(name);
            setRole(role);
        }
    }, [token]);

    const persistToken = (token: string) => {
        writeTokenToLocalStorage(token);
        setToken(token);
    };

    const signOut = () => {
        setToken("");
        removeTokenFromLocalStorage();
    };

    useEffect(() => {
        const requestIntercept = axios.interceptors.request.use(
            (config) => {
                if (config.url?.includes("api/Identity/signin" || config.url?.includes("api/Identity/signup"))) {
                    return config;
                }

                const tokenToUse = getTokenOrEmptyString();
                if (!config.headers) {
                    config.headers = {};
                }
                config.headers["Authorization"] = `Bearer ${tokenToUse}`;
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseIntercept = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config;

                if (
                    !prevRequest.url?.includes("api/Identity/signin") &&
                    !prevRequest.url?.includes("api/Identity/signup") &&
                    error?.response?.status === 401 &&
                    !prevRequest?.sent
                ) {
                    prevRequest.sent = true;
                    try {
                        const refreshedToken = await refresh();
                        persistToken(refreshedToken);
                        prevRequest.headers["Authorization"] = `Bearer ${refreshedToken}`;
                        return axios(prevRequest);
                    } catch (error) {
                        console.error(error);
                        signOut();
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestIntercept);
            axios.interceptors.response.eject(responseIntercept);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ userId, userName, role, token, setToken, persistToken, signOut }}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
