import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    LinearProgress,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { Container } from "@mui/system";
import { DataGrid, GridCallbackDetails, GridColDef, GridRenderCellParams, GridSelectionModel } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { ApiClient } from "../../api/ApiClient";
import { UserDto } from "../../api/generated";
import KeyIcon from "@mui/icons-material/Key";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import { LoadingButton } from "@mui/lab";
import { AdminHubService } from "../../api/AdminHubService";

type Props = {};

const Users = (props: Props) => {
    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 300 },
        {
            field: "userName",
            headerName: "User Name",
            flex: 1,
        },
        {
            field: " ",
            headerName: " ",
            width: 60,
            align: "center",
            disableColumnMenu: true,
            disableReorder: true,
            renderCell: (params: GridRenderCellParams<string>) => (
                <>
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Set Password">
                            <IconButton
                                onClick={() => {
                                    setChangePasswordForUser(params.row as UserDto);
                                }}
                            >
                                <KeyIcon color="secondary" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </>
            ),
        },
    ];

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState<UserDto[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const [userPassword, setUserPassword] = useState("");
    const [changePasswordForUser, setChangePasswordForUser] = useState<UserDto | null>(null);
    const [usersDeleteDialogVisible, setUsersDeleteDialogVisible] = useState(false);

    const [changePasswordForUserInProgress, setChangePasswordForUserInProgress] = useState(false);
    const [usersDeleteInProgress, setUsersDeleteInProgress] = useState(false);
    const [usersDeleteProgressValue, setUsersDeleteProgressValue] = useState(0);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            const api = new ApiClient();
            const response = await api.admin.getApiAdminUsers();
            setUsers(response);
        } catch (err) {
            enqueueSnackbar("Failed to fetch users", { variant: "error" });
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUserSelected = (selectionModel: GridSelectionModel, details: GridCallbackDetails<any>) => {
        setSelectedUserIds(selectionModel.map((userId) => userId.toString()));
    };

    const handleChangeUserPassword = async () => {
        setChangePasswordForUserInProgress(true);

        try {
            const api = new ApiClient();
            await api.admin.postApiAdminUsersPassword({
                userID: changePasswordForUser!.id,
                newPassword: userPassword,
            });
            enqueueSnackbar("User password has been successfully changed", { variant: "success" });
        } catch (err) {
            enqueueSnackbar("Failed to change user password", { variant: "error" });
        } finally {
            setChangePasswordForUser(null);
            setChangePasswordForUserInProgress(false);
        }
    };

    const handleUsersDelete = async () => {
        let hubService: AdminHubService | null = null;

        try {
            setUsersDeleteInProgress(true);

            hubService = new AdminHubService();
            const hubConnectionId = await hubService.connect();
            hubService?.onUsersDeleteProgress((progress) => {
                setUsersDeleteProgressValue(progress);
            });

            const api = new ApiClient();
            await api.admin.deleteApiAdminUsers({
                userIDs: selectedUserIds,
                signalRConnectionID: hubConnectionId,
            });

            setUsers((users) => users.filter((user) => !selectedUserIds.includes(user.id)));
            setSelectedUserIds([]);

            enqueueSnackbar("Successfully deleted selected users", { variant: "success" });
        } catch (err) {
            enqueueSnackbar("Failed to delete some or all of the selected users", { variant: "error" });
            loadUsers();
        } finally {
            setUsersDeleteInProgress(false);
            setUsersDeleteDialogVisible(false);
            setUsersDeleteProgressValue(0);
            hubService?.disconnect();
        }
    };

    return (
        <Container sx={{ height: 700, mt: 3 }}>
            <DataGrid
                autoPageSize
                onSelectionModelChange={handleUserSelected}
                loading={loadingUsers}
                rows={users}
                columns={columns}
                checkboxSelection
                disableSelectionOnClick
            />
            <Button
                onClick={() => setUsersDeleteDialogVisible(true)}
                disabled={selectedUserIds.length == 0}
                variant="outlined"
                startIcon={<DeleteIcon />}
                color="error"
                sx={{ mt: 3 }}
            >
                Delete Selected ({selectedUserIds.length})
            </Button>
            <Button
                onClick={loadUsers}
                disabled={loadingUsers}
                variant="outlined"
                startIcon={<RefreshIcon />}
                color="primary"
                sx={{ mt: 3, ml: 1 }}
            >
                Refresh
            </Button>

            <Dialog open={changePasswordForUser != null}>
                <DialogTitle>
                    <Stack direction="row" spacing={2}>
                        <KeyIcon />
                        <Typography>Set password for user: {changePasswordForUser?.userName}</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        disabled={changePasswordForUserInProgress}
                        onChange={(event) => {
                            setUserPassword(event.target.value);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        onClick={handleChangeUserPassword}
                        color="secondary"
                        endIcon={<KeyIcon />}
                        loading={changePasswordForUserInProgress}
                        loadingPosition="end"
                    >
                        Change Password
                    </LoadingButton>
                    <Button onClick={() => setChangePasswordForUser(null)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={usersDeleteDialogVisible}>
                <DialogTitle>
                    <Stack direction="row" spacing={2}>
                        <WarningIcon />
                        <Typography>Delete Users</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ m: 2 }}>
                        Attention: all messages, attachments and other information associated with selected users will
                        be removed
                    </Alert>
                    <DialogContentText>Are you sure you want to delete selected users?</DialogContentText>
                    <LinearProgress
                        variant="determinate"
                        value={usersDeleteProgressValue}
                        sx={{ m: 2, display: usersDeleteInProgress ? "block" : "none" }}
                    />
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        onClick={handleUsersDelete}
                        color="error"
                        endIcon={<DeleteIcon />}
                        loading={usersDeleteInProgress}
                        loadingPosition="end"
                    >
                        Delete
                    </LoadingButton>
                    <Button onClick={() => setUsersDeleteDialogVisible(false)} disabled={usersDeleteInProgress}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Users;
