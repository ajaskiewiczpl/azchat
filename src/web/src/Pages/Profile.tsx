import Container from "@mui/material/Container";
import React, { ChangeEvent, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
import useAuth from "../hooks/useAuth";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import deepOrange from "@mui/material/colors/deepOrange";
import UserAvatar from "../components/UserAvatar";
import IconButton from "@mui/material/IconButton";

type Props = {};

const Profile = (props: Props) => {
    const { userId, userName } = useAuth();
    const [uploading, setUploading] = useState(false);

    const onAvatarSelected = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            const api = new ApiClient();
            const response = await api.profile.postApiProfileAvatar({
                file: file,
            });
        } catch (err) {
            console.error(err); // TODO
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={4} sx={{ m: 2, p: 2 }}>
                <Typography variant="h6">Your Avatar</Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <UserAvatar userId={userId} userName={userName} width={48} height={48} />

                    <IconButton color="primary" component="label">
                        <input hidden disabled={uploading} accept="image/*" type="file" onChange={onAvatarSelected} />
                        <CloudUploadIcon />
                    </IconButton>
                </Stack>
            </Paper>
        </Container>
    );
};

export default Profile;
