import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { ApiClient } from "../api/ApiClient";
import { OpenAPI } from "../api/generated";

type Props = {};

const HomePage = (props: Props) => {
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    const handleGetUserInfo = async () => {
        try {
            const api = new ApiClient();
            const response = await api.userProfile.getApiUserProfile();
            setUserName(response);
        } catch (err) {}
    };

    const handleSignOut = async () => {
        try {
            const api = new ApiClient();
            api.request.config.WITH_CREDENTIALS = true;
            await api.identity.postApiIdentitySignout();
        } catch (err) {
        } finally {
            localStorage.removeItem("token");
            navigate("/signin");
        }
    };

    return (
        <div>
            <Typography>User name: {userName}</Typography>
            <br />
            <Button variant="contained" onClick={handleGetUserInfo}>
                Get user info
            </Button>
            <Button variant="contained" onClick={handleSignOut}>
                Sign Out
            </Button>
        </div>
    );
};

export default HomePage;
