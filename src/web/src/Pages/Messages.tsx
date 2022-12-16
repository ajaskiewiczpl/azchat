import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonIcon from "@mui/icons-material/Person";
import ListItemText from "@mui/material/ListItemText";
import { Container, Grid, makeStyles, TextField, Typography } from "@mui/material";
import Conversation from "./Conversation";
import { useEffect, useState } from "react";

type Props = {};

const Messages = (props: Props) => {
    const navigate = useNavigate();

    const users = Array.from(Array(8).keys()).map((key) => ({
        id: key,
        name: `User ${key}`,
    }));

    return (
        <Box>
            {users.length > 0 ? (
                <Grid container>
                    <Grid container item xs={3} direction="column">
                        <List>
                            {users.map((user) => {
                                return (
                                    <ListItem disablePadding key={user.id}>
                                        <ListItemButton
                                            component={NavLink}
                                            to={`/messages/${user.id}`}
                                            sx={{
                                                "&.active": {
                                                    bgcolor: "lightgray",
                                                },
                                            }}
                                        >
                                            <ListItemIcon>
                                                <PersonIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={user.name}></ListItemText>
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

export default Messages;
