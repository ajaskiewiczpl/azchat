import { Alert, Avatar, Button, Card, Grid, Snackbar, TextField, Typography } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SendIcon from '@mui/icons-material/Send';
import { Box, Container } from "@mui/system";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SignUpPage from "./SignUpPage";
import { ApiClient } from "../api/ApiClient";
import { ApiError } from "../api";

export default function SignInPage() {

    const api = new ApiClient();

    let [errorMessage, setError] = useState('');
    let [loading, setLoading] = useState(false);

    const isErrorVisible = errorMessage.length > 0;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const userName = data.get('userName')?.toString() || "";
        const password = data.get('password')?.toString() || "";
        try {
            setLoading(true);
            setError('');
            let jwtToken = await api.identity.postApiIdentitySignin({
                userName: userName,
                password: password
            });
        }
        catch (error: any) {
            let exception = error as ApiError;
            let msg;
            switch (exception.status) {
                case 401:
                    msg = "Incorrect user name or password";
                    break;
                case 500:
                    msg = "Server error, please try again"
                    break;
                default:
                    msg = "Unknown error, please try again"
                    break;
            }
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1">
                    Sign In
                </Typography>
                <Alert severity="error" sx={{ mt: 2, display: isErrorVisible ? "flex" : "none" }}>{errorMessage}</Alert>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="User Name"
                        name="userName"
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                    />
                    <LoadingButton
                        type="submit"
                        fullWidth
                        endIcon={<SendIcon />}
                        loadingPosition="end"
                        loading={loading}
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </LoadingButton>
                    <Grid container>
                        <Grid item xs>
                            <Button component={Link} to={"/signup"}>Don't have an account? Sign Up</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}