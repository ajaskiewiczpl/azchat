import { createContext, useContext, useState } from "react";
import { OpenAPI } from "../api/generated/core/OpenAPI";

export type Auth = {
    userName: string
    setUserName: (u: string) => void
    token: string
    setToken: (t: string) => void
    persistToken: (t: string) => void
}

const AuthContext = createContext<Auth>({
    userName: "",
    setUserName: () => { },
    token: "",
    setToken: (t: string) => { },
    persistToken: (t: string) => { }
});

type Props = {
    children: any
}

export const AuthProvider = (props: Props) => {

    const [userName, setUserName] = useState<string>("");
    const [token, setToken] = useState<string>(localStorage.getItem("token") || "");

    const setOpenApiToken = (token: string) => {
        OpenAPI.TOKEN = token;
    }

    setOpenApiToken(token);

    const persistToken = (token: string) => {
        setOpenApiToken(token);
        localStorage.setItem("token", token);
        setToken(token);
    }

    return (
        <AuthContext.Provider value={{ userName, setUserName, token, setToken, persistToken }}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthContext;