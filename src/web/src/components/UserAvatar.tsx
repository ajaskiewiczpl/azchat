import Avatar from "@mui/material/Avatar";
import deepOrange from "@mui/material/colors/deepOrange";
import React, { useEffect, useState } from "react";
import { ApiClient } from "../api/ApiClient";

export type UserAvatarProps = {
    userId: string;
    userName: string;
    width: number;
    height: number;
    avatar?: string; // when undefined, avatar will be loaded from the API backend
};

const UserAvatar = (props: UserAvatarProps) => {
    const [avatarData, setAvatarData] = useState("");

    useEffect(() => {
        const loadAvatar = async () => {
            const api = new ApiClient();
            const avatarBase64 = await api.profile.getApiProfileAvatar(props.userId);
            setAvatarData(avatarBase64);
        };

        if (props.avatar == undefined) {
            loadAvatar();
        }
    }, []);

    return (
        <Avatar
            sx={{ width: props.width, height: props.height, bgcolor: deepOrange[500] }}
            alt={props.userName}
            src={avatarData || props.avatar}
        >
            {props.userName.substring(0, 1).toUpperCase()}
        </Avatar>
    );
};

export default UserAvatar;
