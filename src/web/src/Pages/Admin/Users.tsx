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
    Tooltip,
    Typography,
} from "@mui/material";
import { Container } from "@mui/system";
import { DataGrid, GridCallbackDetails, GridColDef, GridRenderCellParams, GridSelectionModel } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { ApiClient } from "../../api/ApiClient";
import { UserDto } from "../../api/generated";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/Key";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/Warning";
import { LoadingButton } from "@mui/lab";
import { AdminHubService } from "../../api/AdminHubService";

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 300 },
    {
        field: "userName",
        headerName: "User Name",
        flex: 1,
    },
    {
        field: "Actions",
        headerName: "Actions",
        width: 120,
        align: "center",
        disableColumnMenu: true,
        disableReorder: true,
        renderCell: (params: GridRenderCellParams<string>) => (
            <>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit">
                        <IconButton>
                            <EditIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Set Password">
                        <IconButton>
                            <KeyIcon color="secondary" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </>
        ),
    },
];

type Props = {};

const Users = (props: Props) => {
    const [usersDeleteInProgress, setUsersDeleteInProgress] = useState(false);
    const [usersDeleteProgressValue, setUsersDeleteProgressValue] = useState(0);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState<UserDto[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [confirmUsersDeleteDialogVisible, setConfirmUsersDeleteDialogVisible] = useState(false);
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
            setConfirmUsersDeleteDialogVisible(false);
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
                onClick={() => setConfirmUsersDeleteDialogVisible(true)}
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

            <Dialog open={confirmUsersDeleteDialogVisible}>
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
                    <Button onClick={() => setConfirmUsersDeleteDialogVisible(false)} disabled={usersDeleteInProgress}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Users;
