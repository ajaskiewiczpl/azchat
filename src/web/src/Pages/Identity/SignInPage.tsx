import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Alert, Avatar, Button, Card, Grid, Snackbar, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SendIcon from "@mui/icons-material/Send";
import { Box, Container } from "@mui/system";
import { usePostApiIdentitySigninMutation } from "../../redux/azchatApi";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/authSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";

const SignInPage = () => {
    const [signIn, { isLoading, isError }] = usePostApiIdentitySigninMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    let defaultUserName = "",
        defaultPassword = "";

    if (import.meta.env.MODE == "development") {
        defaultUserName = import.meta.env.VITE_APP_DEFAULT_USERNAME;
        defaultPassword = import.meta.env.VITE_APP_DEFAULT_PASSWORD;
    }

    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const userName = data.get("userName")?.toString() || "";
        const password = data.get("password")?.toString() || "";

        try {
            const response = await signIn({
                userBaseRequestDto: {
                    userName: userName,
                    password: password,
                },
            }).unwrap();

            dispatch(
                setToken({
                    token: response.token || "",
                })
            );

            navigate(from, { replace: true });
        } catch (err) {
            const ex = err as FetchBaseQueryError;
            let msg;
            switch (ex.status) {
                case 401:
                    msg = "Incorrect user name or password";
                    break;
                case 500:
                    msg = "Server error, please try again";
                    break;
                default:
                    msg = "Unknown error, please try again";
                    break;
            }
            setErrorMessage(msg);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1">Sign In</Typography>
                <Alert severity="error" sx={{ mt: 2, display: isError ? "flex" : "none" }}>
                    {errorMessage}
                </Alert>
                {location.state?.registrationSuccess ? (
                    <Alert sx={{ mt: 2, mb: 2 }}>
                        Registration successful, you can now sign in using your credentials.
                    </Alert>
                ) : (
                    <></>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="User Name"
                        name="userName"
                        autoComplete="off"
                        disabled={isLoading}
                        defaultValue={defaultUserName}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        disabled={isLoading}
                        defaultValue={defaultPassword}
                        autoComplete="current-password"
                    />
                    <LoadingButton
                        type="submit"
                        fullWidth
                        endIcon={<SendIcon />}
                        loadingPosition="end"
                        loading={isLoading}
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </LoadingButton>
                    <Grid container>
                        <Grid item xs>
                            <Button component={Link} to={"/signup"} disabled={isLoading}>
                                Don't have an account? Sign Up
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default SignInPage;
