import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import ChatIcon from "@mui/icons-material/Chat";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState } from "react";
import useLogout from "../hooks/useLogout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Outlet, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { setAvatar } from "../redux/avatarSlice";
import CurrentUserAvatar from "../components/CurrentUserAvatar";
import { Roles } from "../misc/roles";
import { Divider } from "@mui/material";
import { useGetApiAvatarByUserIdQuery, usePostApiIdentitySignoutMutation } from "../redux/api";

type Props = {};

const HomePage = (props: Props) => {
    const { user } = useAuth();
    const logout = useLogout();
    const [signOut, { isError: signOutError, isLoading: isSigningOut }] = usePostApiIdentitySignoutMutation();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const {
        isError: avatarError,
        isSuccess: avatarSuccess,
        data: avatarData,
    } = useGetApiAvatarByUserIdQuery(user!.userId);

    useEffect(() => {
        if (avatarError) {
            enqueueSnackbar("Could not load user avatar", { variant: "error" });
        }
    }, [avatarError]);

    useEffect(() => {
        if (avatarSuccess) {
            dispatch(setAvatar(avatarData.avatarData));
        }
    }, [avatarSuccess, avatarData]);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const closeUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogoutClick = async () => {
        try {
            await signOut();
        } catch (err) {
            enqueueSnackbar("Error occurred when logging out", { variant: "error" });
        } finally {
            logout();
        }
    };

    const renderAdminMenu = () => {
        if (user!.role == Roles.ADMIN) {
            return (
                <div>
                    <MenuItem
                        component={Link}
                        to="/admin"
                        key="admin"
                        onClick={closeUserMenu}
                        disabled={isSigningOut}
                        sx={{ mt: 1 }}
                    >
                        <ListItemIcon>
                            <AdminPanelSettingsIcon />
                        </ListItemIcon>
                        <ListItemText>Administration</ListItemText>
                    </MenuItem>
                    <Divider />
                </div>
            );
        } else {
            return null;
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Button component={Link} to={"/"} color="inherit" size="large" startIcon={<ChatIcon />}>
                        az-chat
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box>
                        {/* <IconButton size="large" aria-label="show 17 new notifications" color="inherit">
                                <Badge badgeContent={17} color="error">
                                    <NotificationIcon />
                                </Badge>
                            </IconButton> */}
                        <IconButton color="inherit" onClick={handleOpenUserMenu}>
                            <CurrentUserAvatar width={32} height={32} />
                        </IconButton>
                        <Menu
                            sx={{ mt: "45px" }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={closeUserMenu}
                        >
                            <ListSubheader>{user!.userName}</ListSubheader>
                            <Divider />
                            {renderAdminMenu()}
                            <MenuItem
                                component={Link}
                                to="/profile"
                                key="profile"
                                onClick={closeUserMenu}
                                disabled={isSigningOut}
                            >
                                <ListItemIcon>
                                    <AccountCircle />
                                </ListItemIcon>
                                <ListItemText>Profile</ListItemText>
                            </MenuItem>
                            <MenuItem
                                component={Link}
                                to="/settings"
                                key="settings"
                                onClick={closeUserMenu}
                                disabled={isSigningOut}
                            >
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText>Settings</ListItemText>
                            </MenuItem>
                            <MenuItem key="signout" onClick={handleLogoutClick} disabled={isSigningOut}>
                                <ListItemIcon>
                                    <LogoutIcon />
                                </ListItemIcon>
                                <ListItemText>Sign Out</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Outlet />
        </Box>
    );
};

export default HomePage;
