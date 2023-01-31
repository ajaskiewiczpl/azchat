import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Alert, Badge, Container, Grid, Typography } from "@mui/material";
import Conversation from "./Conversation";
import { useEffect, useRef, useState } from "react";
import { ChatHubService } from "../../api/ChatHubService";
import UserAvatar from "../../components/UserAvatar";
import { api, FriendDto, MessageDto } from "../../redux/api";
import useAuthToken from "../../hooks/useAuthToken";

type Props = {};

const Messages = (props: Props) => {
    const { isLoading, isFetching, isSuccess, data, isError, error } = api.useGetApiChatFriendsQuery();

    const { authToken } = useAuthToken();

    const [hubConnection, setHubConnection] = useState<ChatHubService | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [friends, setFriends] = useState<FriendDto[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const selectedUserIdRef = useRef(selectedUserId); // this is to avoid capturing of "selectedUserId" value in "onMessage" function closure

    const isLoadingFriends = isLoading || isFetching;

    useEffect(() => {
        if (isSuccess) {
            setFriends(data);
            connectToHub();
        } else if (isError) {
            setErrorMessage(`Could not load users`);
        }
    }, [isSuccess, isError]);

    useEffect(() => {
        hubConnection?.onMessage(onMessage);

        return () => {
            hubConnection ? hubConnection.disconnect() : null;
        };
    }, [hubConnection]);

    const onMessage = (message: MessageDto) => {
        const updateFriend = (friend: FriendDto, message: MessageDto): FriendDto => {
            if (friend.id == message.fromUserId) {
                return {
                    ...friend,
                    unreadMessagesCount: (friend?.unreadMessagesCount || 0) + 1,
                };
            } else {
                return friend;
            }
        };
        if (selectedUserIdRef.current == message.fromUserId) {
            return;
        }
        setFriends((oldFriends) => oldFriends.map((oldFriend) => updateFriend(oldFriend, message)));
    };

    const onSelectedUserChanged = (userId: string) => {
        const updateFriend = (friend: FriendDto): FriendDto => {
            if (friend.id == userId) {
                return {
                    ...friend,
                    unreadMessagesCount: 0,
                };
            } else {
                return friend;
            }
        };
        setFriends((oldFriends) => oldFriends.map((oldFriend) => updateFriend(oldFriend)));
        setSelectedUserId(userId);
        selectedUserIdRef.current = userId;
    };

    const connectToHub = async () => {
        try {
            const chatHubService = new ChatHubService(authToken);
            await chatHubService.connect();
            setHubConnection(chatHubService);
        } catch (err) {
            setErrorMessage("Could not connect to server");
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
                                                    <Badge badgeContent={friend.unreadMessagesCount} color="primary">
                                                        <UserAvatar
                                                            userId={friend.id}
                                                            userName={friend.userName}
                                                            width={32}
                                                            height={32}
                                                        />
                                                    </Badge>
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
                                <Route
                                    path="/:userId"
                                    element={<Conversation selectUserId={onSelectedUserChanged} />}
                                />
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

    return <>{isLoadingFriends ? renderLoading() : errorMessage.length > 0 ? renderError() : renderUserList()}</>;
};

export default Messages;
