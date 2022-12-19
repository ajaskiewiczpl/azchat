import Container from "@mui/material/Container";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import { ApiClient } from "../api/ApiClient";
import Box from "@mui/material/Box";
import KeyIcon from "@mui/icons-material/Key";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { ApiError } from "../api/generated";

type Props = {};

const Profile = (props: Props) => {
    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [canChangePassword, setCanChangePassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const success = successMessage.length > 0;
    const error = errors.length > 0;

    useEffect(() => {
        if (newPassword.length > 0) {
            setPasswordMatch(newPassword == newPasswordRepeat);
        }

        const result = currentPassword.length > 0 && newPassword.length > 0 && newPassword == newPasswordRepeat;
        setCanChangePassword(result);
    }, [currentPassword, newPassword, newPasswordRepeat]);

    const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsChangingPassword(true);
        setSuccessMessage("");
        setErrors([]);
        try {
            const api = new ApiClient();
            await api.identity.postApiIdentityChangepassword({
                currentPassword: currentPassword,
                newPassword: newPassword,
            });
            setSuccessMessage("Password successfully changed");
        } catch (err) {
            let exception = err as ApiError;
            switch (exception.status) {
                case 400:
                    setErrors(exception?.body?.errors?.map((err: any) => err.description));
                    break;
                default:
                    setErrors([exception.message]);
            }
        } finally {
            setIsChangingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordRepeat("");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ mt: 1, p: 2 }}>
                <Stack spacing={2}>
                    <Typography variant="h4">Profile Settings</Typography>
                    <Typography variant="h6">Change Password</Typography>
                    <Box component="form" onSubmit={handleChangePassword}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            disabled={isChangingPassword}
                            onChange={(event) => {
                                setCurrentPassword(event.target.value);
                            }}
                            value={currentPassword}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="newPassword"
                            label="New Password"
                            type="password"
                            disabled={isChangingPassword}
                            onChange={(event) => {
                                setNewPassword(event.target.value);
                            }}
                            value={newPassword}
                        />
                        <TextField
                            margin="normal"
                            required
                            error={!passwordMatch}
                            helperText={passwordMatch ? "" : "Passwords are different"}
                            fullWidth
                            name="newPasswordRepeat"
                            label="Repeat New Password"
                            type="password"
                            disabled={isChangingPassword}
                            onChange={(event) => {
                                setNewPasswordRepeat(event.target.value);
                            }}
                            value={newPasswordRepeat}
                        />
                        <Alert severity="error" sx={{ mt: 2, display: error ? "flex" : "none" }}>
                            {errors}
                        </Alert>
                        <Alert severity="success" sx={{ mt: 2, display: success ? "flex" : "none" }}>
                            {successMessage}
                        </Alert>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            endIcon={<KeyIcon />}
                            loadingPosition="end"
                            loading={isChangingPassword}
                            variant="contained"
                            disabled={!canChangePassword}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Change Password
                        </LoadingButton>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
};

export default Profile;
