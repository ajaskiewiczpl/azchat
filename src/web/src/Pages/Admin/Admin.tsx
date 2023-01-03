import { Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import { NavLink, Route, Routes } from "react-router-dom";
import Users from "./Users";
import System from "./System";

type Props = {};

const Admin = (props: Props) => {
    const renderItem = (name: string, path: string, icon: any) => {
        return (
            <ListItem disablePadding key={name}>
                <ListItemButton
                    component={NavLink}
                    to={path}
                    sx={{
                        "&.active": {
                            bgcolor: "lightgray",
                        },
                    }}
                >
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={name}></ListItemText>
                </ListItemButton>
            </ListItem>
        );
    };

    return (
        <Grid container>
            <Grid container item xs={2} direction="column">
                <List>
                    {renderItem("Users", "/admin/users", <PeopleIcon />)}
                    {renderItem("System", "/admin/system", <SettingsIcon />)}
                </List>
            </Grid>
            <Grid container item xs={10} direction="column">
                <Routes>
                    <Route path="/users" element={<Users />} />
                    <Route path="/system" element={<System />} />
                </Routes>
            </Grid>
        </Grid>
    );
};

export default Admin;
