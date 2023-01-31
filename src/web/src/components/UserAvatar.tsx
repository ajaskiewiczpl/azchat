import Avatar from "@mui/material/Avatar";
import deepOrange from "@mui/material/colors/deepOrange";
import React, { useEffect, useState } from "react";
import { api } from "../redux/api";

export type UserAvatarProps = {
    userId: string;
    userName: string;
    width: number;
    height: number;
    avatar?: string; // when undefined, avatar will be loaded from the API backend using provided userId
};

const UserAvatar = (props: UserAvatarProps) => {
    const [fetchAvatar, setFetchAvatar] = useState(true);
    const { data } = api.useGetApiAvatarByUserIdQuery(props.userId, {
        skip: !fetchAvatar,
    });

    useEffect(() => {
        if (props.avatar == undefined) {
            setFetchAvatar(true);
        }
    }, []);

    return (
        <Avatar
            sx={{ width: props.width, height: props.height, bgcolor: deepOrange[500] }}
            alt={props.userName}
            src={data?.avatarData || props.avatar}
        >
            {props.userName.substring(0, 1).toUpperCase()}
        </Avatar>
    );
};

export default UserAvatar;
