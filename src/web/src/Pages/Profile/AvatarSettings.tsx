import { ChangeEvent, useEffect, useState } from "react";
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import Typography from "@mui/material/Typography";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import IconButton from "@mui/material/IconButton";
import { useSnackbar } from "notistack";
import CurrentUserAvatar from "../../components/CurrentUserAvatar";
import { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setAvatar } from "../../redux/avatarSlice";
import { api } from "../../redux/api";

type Props = {};

const AvatarSettings = (props: Props) => {
    const { avatar } = useSelector((state: RootState) => state.avatar);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    const [
        uploadAvatarAsync,
        {
            isLoading: isAvatarUploading,
            isSuccess: isAvatarUploadSuccess,
            isError: isAvatarUploadError,
            data: uploadAvatarResponse,
        },
    ] = api.usePostApiAvatarMutation();

    const [
        deleteAvatarAsync,
        { isLoading: isDeletingAvatar, isSuccess: isDeleteAvatarSuccess, isError: isDeleteAvatarError },
    ] = api.useDeleteApiAvatarMutation();

    const handleDeleteClick = () => {
        setDeleteDialogVisible(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogVisible(false);
    };

    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            const response = await uploadAvatarAsync({
                file,
            }).unwrap();

            dispatch(setAvatar(response));
            enqueueSnackbar("Avatar has been successfully changed", { variant: "success" });
        } catch (err) {
            enqueueSnackbar("Could not upload avatar", { variant: "error" });
        }
    };

    const handleAvatarDelete = async () => {
        try {
            await deleteAvatarAsync();
            dispatch(setAvatar(""));
            enqueueSnackbar("Avatar has been successfully deleted", { variant: "success" });
        } catch (err) {
            enqueueSnackbar("Could not delete avatar", { variant: "error" });
        } finally {
            handleDeleteDialogClose();
        }
    };

    return (
        <section>
            <Typography variant="h6">Change Your Avatar</Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
                <CurrentUserAvatar width={48} height={48} />

                <IconButton disabled={isAvatarUploading} color="primary" component="label">
                    <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
                    {isAvatarUploading ? <CircularProgress size={24} /> : <CloudUploadIcon />}
                </IconButton>
                <IconButton
                    disabled={isAvatarUploading || avatar == undefined || avatar?.length == 0}
                    color="error"
                    onClick={handleDeleteClick}
                >
                    <DeleteIcon />
                </IconButton>
            </Stack>
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
                        loading={isDeletingAvatar}
                        loadingPosition="end"
                    >
                        Delete
                    </LoadingButton>
                    <Button onClick={handleDeleteDialogClose} disabled={isDeletingAvatar}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    );
};

export default AvatarSettings;
