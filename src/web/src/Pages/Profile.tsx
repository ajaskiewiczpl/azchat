import Container from "@mui/material/Container";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

type Props = {};

const Profile = (props: Props) => {
    const [tab, setTab] = useState("0");

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTab(newValue);
    };

    return (
        <Container maxWidth="sm">
            <Paper sx={{ mt: 1, p: 2 }}>
                <Stack spacing={2}>
                    <Typography variant="h4">Profile Settings</Typography>
                    <Typography variant="h6">Change Password</Typography>
                    <Typography>Current Password:</Typography>
                    <Typography>New Password:</Typography>
                    <Typography>Repeat Password:</Typography>
                    <Button>Change password</Button>
                </Stack>
            </Paper>
        </Container>
    );
};

export default Profile;
