import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationIcon from "@mui/icons-material/Notifications";
import { useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";
import { OpenAPI } from "../api/generated";
import useLogout from "../hooks/useLogout";
import Menu from "@mui/material/Menu";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Outlet } from "react-router";
import Badge from "@mui/material/Badge";
import { Link } from "react-router-dom";
import Profile from "./Profile";

type Props = {};

const HomePage = (props: Props) => {
    const logout = useLogout();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userName, setUserName] = useState("");
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleGetUserInfo = async () => {
        try {
            const api = new ApiClient();
            const response = await api.userProfile.getApiUserProfile();
            setUserName(response);
        } catch (err) {}
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const closeUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleUserProfileClick = () => {
        closeUserMenu();
    };

    const handleLogoutClick = async () => {
        try {
            setIsLoggingOut(true);
            closeUserMenu();
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
                            <AccountCircle />
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
                            <MenuItem
                                component={Link}
                                to="/profile"
                                key="profile"
                                onClick={handleUserProfileClick}
                                disabled={isLoggingOut}
                            >
                                Profile
                            </MenuItem>
                            <MenuItem key="signout" onClick={handleLogoutClick} disabled={isLoggingOut}>
                                Sign Out
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
