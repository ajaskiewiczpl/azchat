import { ChangeEvent, useEffect, useState } from "react";
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import { ApiClient } from "../api/ApiClient";
import useAuth from "../hooks/useAuth";
import UserAvatar from "../components/UserAvatar";
import IconButton from "@mui/material/IconButton";
import { useSnackbar } from "notistack";

type Props = {};

const Profile = (props: Props) => {
    const { userId, userName } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [avatar, setAvatar] = useState("");
    const [uploadInProgress, setUploadInProgress] = useState(false);
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    useEffect(() => {
        const loadAvatar = async () => {
            try {
                const api = new ApiClient();
                const response = await api.avatar.getApiAvatar(userId);
                setAvatar(response);
            } catch (err) {
                enqueueSnackbar("Could not load avatar", { variant: "error" });
            }
        };

        loadAvatar();
    }, []);

    const handleDeleteClick = () => {
        setDeleteDialogVisible(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogVisible(false);
    };

    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadInProgress(true);
            const file = e.target.files?.[0];
            const api = new ApiClient();
            const response = await api.avatar.postApiAvatar({
                file: file,
            });
            setAvatar(response);
            enqueueSnackbar("Avatar has been successfully changed", { variant: "success" });
        } catch (err) {
            enqueueSnackbar("Could not upload avatar", { variant: "error" });
        } finally {
            setUploadInProgress(false);
        }
    };

    const handleAvatarDelete = async () => {
        try {
            setDeleteInProgress(true);
            const api = new ApiClient();
            await api.avatar.deleteApiAvatar();
            setAvatar("");
            enqueueSnackbar("Avatar has been successfully deleted", { variant: "success" });
        } catch (err) {
            enqueueSnackbar("Could not delete avatar", { variant: "error" });
        } finally {
            setDeleteInProgress(false);
            handleDeleteDialogClose();
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={4} sx={{ m: 2, p: 2 }}>
                <Typography variant="h6">Change Your Avatar</Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <UserAvatar avatar={avatar} userId={userId} userName={userName} width={48} height={48} />

                    <IconButton disabled={uploadInProgress} color="primary" component="label">
                        <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
                        {uploadInProgress ? <CircularProgress size={24} /> : <CloudUploadIcon />}
                    </IconButton>
                    <IconButton
                        disabled={uploadInProgress || avatar.length == 0}
                        color="error"
                        onClick={handleDeleteClick}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            </Paper>
            <Dialog open={deleteDialogVisible}>
                <DialogTitle>Delete Avatar</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete your avatar?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        onClick={handleAvatarDelete}
                        color="error"
                        endIcon={<DeleteIcon />}
                        loading={deleteInProgress}
                        loadingPosition="end"
                    >
                        Delete
                    </LoadingButton>
                    <Button onClick={handleDeleteDialogClose} disabled={deleteInProgress}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile;
