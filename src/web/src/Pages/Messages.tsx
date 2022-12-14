import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonIcon from "@mui/icons-material/Person";
import React from "react";
import ListItemText from "@mui/material/ListItemText";

type Props = {};

const users = Array.from(Array(5).keys());

const Messages = (props: Props) => {
    return (
        <Box sx={{ maxWidth: 300 }}>
            <List>
                {users.map((user) => {
                    return (
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <PersonIcon />
                                </ListItemIcon>
                                <ListItemText>User {user}</ListItemText>
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default Messages;
