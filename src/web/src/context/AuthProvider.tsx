import axios from "axios";
import jwtDecode from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ApiClient } from "../api/ApiClient";
import useRefreshToken from "../hooks/useRefreshToken";
import customHistory from "./customHistory";

export type Auth = {
    userId: string;
    userName: string;
    token: string;
    setToken: (t: string) => void;
    persistToken: (t: string) => void;
    signOut: () => void;
};

const AuthContext = createContext<Auth>({
    userId: "",
    userName: "",
    token: "",
    setToken: (t: string) => {},
    persistToken: (t: string) => {},
    signOut: () => {},
});

type Jwt = {
    userId: string;
    name: string;
};

type Props = {
    children: any;
};

export const AuthProvider = (props: Props) => {
    const refresh = useRefreshToken();
    const location = useLocation();

    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [token, setToken] = useState<string>(localStorage.getItem("token") || "");

    const persistToken = (token: string) => {
        localStorage.setItem("token", token);
        setToken(token);
    };

    const signOut = () => {
        setToken("");
        localStorage.removeItem("token");
        customHistory.replace("/signin", { from: location });
    };

    useEffect(() => {
        if (token) {
            const { userId, name } = jwtDecode<Jwt>(token);
            setUserId(userId);
            setUserName(name);
        }
    }, [token]);

    useEffect(() => {
        const requestIntercept = axios.interceptors.request.use(
            (config) => {
                if (config.url?.includes("api/Identity/signin" || config.url?.includes("api/Identity/signup"))) {
                    return config;
                }

                const tokenToUse = localStorage.getItem("token") || "";
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
        <AuthContext.Provider value={{ userId, userName, token, setToken, persistToken, signOut }}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
