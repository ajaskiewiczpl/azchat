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
import { api, RegistrationResponseDto } from "../../redux/api";
import { isErrorWithMessage, isFetchBaseQueryError } from "../../misc/errorHelpers";

export default function SignUpPage() {
    const [errors, setErrors] = useState<string[]>([]);
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [canSignUp, setCanSignUp] = useState(false);

    const [signUpAsync, { isLoading, isError, isSuccess, error }] = api.usePostApiIdentitySignupMutation();

    useEffect(() => {
        const isPasswordValid = password == passwordRepeat;
        setPasswordMatch(isPasswordValid);
        setCanSignUp(userName.length > 0 && password.length > 0 && isPasswordValid);
    }, [userName, password, passwordRepeat]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const response = await signUpAsync({
                userName: userName,
                password: password,
            }).unwrap();

            navigate("/signin", { state: { registrationSuccess: true } });
        } catch (err) {
            if (isFetchBaseQueryError(err)) {
                const responseError = err.data as RegistrationResponseDto;
                if (responseError) {
                    setErrors(responseError.errors?.map((err) => err.description || "") || []);
                } else {
                    setErrors(["Unknown error, please try again"]);
                }
            } else if (isErrorWithMessage(err)) {
                setErrors([err.message]);
            }
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                        onChange={(event) => {
                            setPasswordRepeat(event.target.value);
                        }}
                    />
                    <LoadingButton
                        type="submit"
                        fullWidth
                        endIcon={<SendIcon />}
                        loadingPosition="end"
                        loading={isLoading}
                        variant="contained"
                        disabled={!canSignUp}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </LoadingButton>
                    <Grid container>
                        <Grid item xs>
                            <Button component={Link} to={"/signin"} disabled={isLoading}>
                                Already have account? Sign In
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}
