import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";
import useLogout from "../hooks/useLogout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import useAuth from "../hooks/useAuth";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { setAvatar } from "../redux/avatarSlice";
import CurrentUserAvatar from "../components/CurrentUserAvatar";

type Props = {};

const HomePage = (props: Props) => {
    const { userId, userName } = useAuth();
    const logout = useLogout();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const loadAvatar = async () => {
            try {
                const api = new ApiClient();
                const response = await api.avatar.getApiAvatar(userId);
                dispatch(setAvatar(response));
            } catch (err) {
                enqueueSnackbar("Could not load user avatar", { variant: "error" });
            }
        };

        loadAvatar();
    }, []);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const closeUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogoutClick = async () => {
        try {
            setIsLoggingOut(true);
            const api = new ApiClient();
            api.request.config.WITH_CREDENTIALS = true;
            await api.identity.postApiIdentitySignout();
        } catch (err) {
        } finally {
            logout();
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Button component={Link} to={"/"} color="inherit" size="large">
                        AZ Chat
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
                            <ListSubheader>{userName}</ListSubheader>
                            <MenuItem
                                component={Link}
                                to="/profile"
                                key="profile"
                                onClick={closeUserMenu}
                                disabled={isLoggingOut}
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
                                disabled={isLoggingOut}
                            >
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText>Settings</ListItemText>
                            </MenuItem>
                            <MenuItem key="signout" onClick={handleLogoutClick} disabled={isLoggingOut}>
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
