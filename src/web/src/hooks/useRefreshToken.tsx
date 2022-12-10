import React from "react";
import { ApiClient } from "../api/ApiClient";

const useRefreshToken = () => {
    const refresh = async () => {
        const api = new ApiClient();
        api.request.config.WITH_CREDENTIALS = true;
        const currentToken = localStorage.getItem("token") || "";
        const refreshTokenResponse = await api.identity.postApiIdentityRefreshtoken({
            token: currentToken,
        });
        return refreshTokenResponse?.token || "";
    };

    return refresh;
};

export default useRefreshToken;
