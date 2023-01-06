import React, { useEffect, useState } from "react";
import ErrorIcon from "@mui/icons-material/Error";
import AccountCircle from "@mui/icons-material/AccountCircle";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { api, MessageDto } from "../../redux/api";

export type MessageProps = {
    userId: string;
    otherUserId: string;
    message: MessageDto;
    updateMessage: (id: string, message: MessageDto) => void;
};

const Message = (props: MessageProps) => {
    const [isMouseOver, setIsMouseOver] = useState(false);
    const isReceived = props.message.fromUserId != props.userId; // true if received, false if sent

    const [
        sendMessageAsync,
        { isLoading: isSendingMessage, isSuccess: isSendMessageSuccess, isError: isSendMessageError },
    ] = api.usePostApiChatSendMutation();

    useEffect(() => {
        if (props.message.status == "New") {
            props.updateMessage(props.message.id, {
                ...props.message,
                status: "Sending",
            });
            sendMessage();
        }
    }, []);

    const sendMessage = async () => {
        const responseMessage = await sendMessageAsync({
            recipientUserId: props.otherUserId,
            body: props.message.body,
        }).unwrap();

        props.updateMessage(props.message.id, responseMessage);
    };

    const handleMouseOver = () => {
        setIsMouseOver(true);
    };

    const handleMouseOut = () => {
        setIsMouseOver(false);
    };

    const renderSendProgress = () => {
        return <CircularProgress size={15} />;
    };

    const renderError = () => {
        return (
            <Tooltip title="Click to retry">
                <IconButton edge="end" color="error" onClick={() => sendMessage()}>
                    <ErrorIcon />
                </IconButton>
            </Tooltip>
        );
    };

    return (
        <ListItem
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            key={props.message.id}
            secondaryAction={isSendMessageError ? renderError() : isSendingMessage ? renderSendProgress() : null}
        >
            {isReceived ? (
                <ListItemIcon sx={{ minWidth: 30 }}>
                    <AccountCircle />
                </ListItemIcon>
            ) : null}
            <ListItemText primary={props.message.body} sx={{ textAlign: isReceived ? "left" : "right" }} />
        </ListItem>
    );
};

export default Message;
