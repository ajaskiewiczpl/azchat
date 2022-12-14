import { useEffect, useState } from "react";
import { Alert, Button, Grid, TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SendIcon from "@mui/icons-material/Send";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { ApiClient } from "../api/ApiClient";
import { ApiError, RegistrationResponseDto } from "../api/generated";

export default function SignUpPage() {
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [canSignUp, setCanSignUp] = useState(false);

    useEffect(() => {
        const isPasswordValid = password == passwordRepeat;
        setPasswordMatch(isPasswordValid);
        setCanSignUp(userName.length > 0 && password.length > 0 && isPasswordValid);
    }, [userName, password, passwordRepeat]);

    const error = errors.length > 0;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            const api = new ApiClient();
            let response: RegistrationResponseDto = await api.identity.postApiIdentitySignup({
                userName: userName,
                password: password,
            });
            if (response.success) {
                navigate("/signin", { state: { registrationSuccess: true } });
            } else {
                setErrors(["Unknown error"]);
            }
        } catch (err: any) {
            let exception = err as ApiError;
            setErrors([exception.message]);
        } finally {
            setLoading(false);
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
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1">Sign Up</Typography>
                <Alert severity="error" sx={{ mt: 2, display: error ? "flex" : "none" }}>
                    {errors}
                </Alert>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="User Name"
                        name="userName"
                        autoComplete="off"
                        disabled={loading}
                        onChange={(event) => {
                            setUserName(event.target.value);
                        }}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        disabled={loading}
                        onChange={(event) => {
                            setPassword(event.target.value);
                        }}
                    />
                    <TextField
                        margin="normal"
                        required
                        error={!passwordMatch}
                        helperText={passwordMatch ? "" : "Passwords are different"}
                        fullWidth
                        name="password"
                        label="Repeat password"
                        type="password"
                        disabled={loading}
                        onChange={(event) => {
                            setPasswordRepeat(event.target.value);
                        }}
                    />
                    <LoadingButton
                        type="submit"
                        fullWidth
                        endIcon={<SendIcon />}
                        loadingPosition="end"
                        loading={loading}
                        variant="contained"
                        disabled={!canSignUp}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </LoadingButton>
                    <Grid container>
                        <Grid item xs>
                            <Button component={Link} to={"/signin"} disabled={loading}>
                                Already have account? Sign In
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}
