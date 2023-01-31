import Container from "@mui/material/Container";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import KeyIcon from "@mui/icons-material/Key";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { api } from "../../redux/api";

type Props = {};

const Settings = (props: Props) => {
    const [changePassword, { isLoading, isError, isSuccess, error }] = api.usePostApiIdentityChangepasswordMutation();

    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [canChangePassword, setCanChangePassword] = useState(false);

    useEffect(() => {
        if (newPassword.length > 0) {
            setPasswordMatch(newPassword == newPasswordRepeat);
        }

        const result = currentPassword.length > 0 && newPassword.length > 0 && newPassword == newPasswordRepeat;
        setCanChangePassword(result);
    }, [currentPassword, newPassword, newPasswordRepeat]);

    useEffect(() => {
        if (isError) {
            console.error(error);
        }
    }, [isError]);

    const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrors([]);
        try {
            await changePassword({
                currentPassword: currentPassword,
                newPassword: newPassword,
            });
            setSuccessMessage("Password successfully changed");
        } catch (err) {
        } finally {
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordRepeat("");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={4} sx={{ m: 2, p: 2 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">Change Password</Typography>
                    <Box component="form" onSubmit={handleChangePassword}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            disabled={isLoading}
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                            onChange={(event) => {
                                setNewPasswordRepeat(event.target.value);
                            }}
                            value={newPasswordRepeat}
                        />
                        <Alert severity="error" sx={{ mt: 2, display: isError ? "flex" : "none" }}>
                            {errors}
                        </Alert>
                        <Alert severity="success" sx={{ mt: 2, display: isSuccess ? "flex" : "none" }}>
                            {successMessage}
                        </Alert>
                        <LoadingButton
                            type="submit"
                            fullWidth
                            endIcon={<KeyIcon />}
                            loadingPosition="end"
                            loading={isLoading}
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

export default Settings;
