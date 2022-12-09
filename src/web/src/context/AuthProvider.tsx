import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";
import customHistory from "./customHistory";

export type Auth = {
    userName: string;
    setUserName: (u: string) => void;
    token: string;
    setToken: (t: string) => void;
    persistToken: (t: string) => void;
};

const AuthContext = createContext<Auth>({
    userName: "",
    setUserName: () => {},
    token: "",
    setToken: (t: string) => {},
    persistToken: (t: string) => {},
});

type Props = {
    children: any;
};

export const AuthProvider = (props: Props) => {
    const [userName, setUserName] = useState<string>("");
    const [token, setToken] = useState<string>(localStorage.getItem("token") || "");

    const persistToken = (token: string) => {
        localStorage.setItem("token", token);
        setToken(token);
    };

    const signOut = () => {
        setToken("");
        localStorage.removeItem("token");
        customHistory.replace("/signin");
    };

    useEffect(() => {
        const requestIntercept = axios.interceptors.request.use(
            (config) => {
                if (config.url?.includes("api/Identity/")) {
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
                    !prevRequest.url?.includes("api/Identity/") &&
                    error?.response?.status === 401 &&
                    !prevRequest?.sent
                ) {
                    prevRequest.sent = true;
                    try {
                        const api = new ApiClient();
                        api.request.config.WITH_CREDENTIALS = true;
                        const currentToken = localStorage.getItem("token") || "";
                        const refreshTokenResponse = await api.identity.postApiIdentityRefreshtoken({
                            token: currentToken,
                        });
                        const refreshedToken = refreshTokenResponse.token ?? "";
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
    });

    return (
        <AuthContext.Provider value={{ userName, setUserName, token, setToken, persistToken }}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
