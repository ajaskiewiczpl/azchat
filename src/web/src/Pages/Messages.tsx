import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonIcon from "@mui/icons-material/Person";
import ListItemText from "@mui/material/ListItemText";
import { Alert, Container, Grid, makeStyles, TextField, Typography } from "@mui/material";
import Conversation from "./Conversation";
import { useEffect, useState } from "react";
import { ApiError, FriendDto } from "../api/generated";
import { ApiClient } from "../api/ApiClient";

type Props = {};

const Messages = (props: Props) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [friends, setFriends] = useState<FriendDto[]>([]);

    const loadFriends = async () => {
        const api = new ApiClient();
        try {
            const response = await api.chat.getApiChatFriends();
            setFriends(response);
            if (response.length > 0) {
                navigate(`/messages/${response[0].id}`);
            }
        } catch (err) {
            const ex = err as ApiError;
            if (ex) {
                setErrorMessage(ex.message);
            } else {
                setErrorMessage("Unknown error, please try again");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFriends();
    }, []);

    const renderLoading = () => {
        return (
            <Container maxWidth="sm">
                <Box alignItems="center" justifyContent="center" sx={{ display: "flex", m: 5 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    };

    const renderError = () => {
        return (
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Alert severity="error">{errorMessage}</Alert>
            </Container>
        );
    };

    const renderUserList = () => {
        return (
            <Box>
                {friends.length > 0 ? (
                    <Grid container>
                        <Grid container item xs={3} direction="column">
                            <List>
                                {friends.map((friend) => {
                                    return (
                                        <ListItem disablePadding key={friend.id}>
                                            <ListItemButton
                                                component={NavLink}
                                                to={`/messages/${friend.id}`}
                                                sx={{
                                                    "&.active": {
                                                        bgcolor: "lightgray",
                                                    },
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <PersonIcon />
                                                </ListItemIcon>
                                                <ListItemText primary={friend.userName}></ListItemText>
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Grid>
                        <Grid container item xs={9} direction="column">
                            <Routes>
                                <Route path="/:userId" element={<Conversation />} />
                            </Routes>
                        </Grid>
                    </Grid>
                ) : (
                    <Typography variant="h5" sx={{ m: 5 }}>
                        No users
                    </Typography>
                )}
            </Box>
        );
    };

    return <>{isLoading ? renderLoading() : errorMessage.length > 0 ? renderError() : renderUserList()}</>;
};

export default Messages;
