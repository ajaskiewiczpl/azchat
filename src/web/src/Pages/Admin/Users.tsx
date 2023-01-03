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
    const [adminHubConnection, setAdminHubConnection] = useState<AdminHubService | null>(null);
    const [adminHubConnectionId, setAdminHubConnectionId] = useState("");
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

    useEffect(() => {
        adminHubConnection?.onUsersDeleteProgress(onUsersDeleteProgress);

        return () => {
            adminHubConnection ? adminHubConnection.disconnect() : null;
        };
    }, [adminHubConnection]);

    const connectToHub = async () => {
        try {
            const adminHubService = new AdminHubService();
            const connectionId = await adminHubService.connect();
            setAdminHubConnection(adminHubService);
            setAdminHubConnectionId(connectionId);
        } catch (err) {
            enqueueSnackbar("Could not connect to server", { variant: "error" });
        }
    };

    const onUsersDeleteProgress = (progress: number) => {
        setUsersDeleteProgressValue(progress);
    };

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            const api = new ApiClient();
            const response = await api.admin.getApiAdminUsers();
            setUsers(response);
            connectToHub();
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
        try {
            setUsersDeleteInProgress(true);
            const api = new ApiClient();
            await api.admin.deleteApiAdminUsers({
                userIDs: selectedUserIds,
                signalRConnectionID: adminHubConnectionId,
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
        }
    };

    const renderLoading = () => {
        return (
            <Container maxWidth="sm">
                <Box alignItems="center" justifyContent="center" sx={{ display: "flex", m: 5 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    };

    const renderPage = () => {
        return (
            <>
                <DataGrid
                    onSelectionModelChange={handleUserSelected}
                    rows={users}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    checkboxSelection
                    disableSelectionOnClick
                />
                <Button
                    onClick={() => setConfirmUsersDeleteDialogVisible(true)}
                    disabled={selectedUserIds.length == 0}
                    variant="outlined"
                    color="error"
                    sx={{ mt: 3 }}
                >
                    Delete Selected ({selectedUserIds.length})
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
                            Attention: all messages, attachments and other information associated with selected users
                            will be removed
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
                        <Button
                            onClick={() => setConfirmUsersDeleteDialogVisible(false)}
                            disabled={usersDeleteInProgress}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

    return <Container sx={{ height: 500, mt: 3 }}>{loadingUsers ? renderLoading() : renderPage()}</Container>;
};

export default Users;
