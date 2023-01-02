import React, { useEffect, useState } from "react";
import { MessageDto, MessageStatus } from "../../api/generated";
import ErrorIcon from "@mui/icons-material/Error";
import AccountCircle from "@mui/icons-material/AccountCircle";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { ApiClient } from "../../api/ApiClient";

export type MessageProps = {
    userId: string;
    otherUserId: string;
    message: MessageDto;
    updateMessage: (id: string, message: MessageDto) => void;
};

const Message = (props: MessageProps) => {
    const [isSending, setIsSending] = useState(props.message.status == MessageStatus.SENDING);
    const [error, setError] = useState(false);
    const [isMouseOver, setIsMouseOver] = useState(false);
    const isReceived = props.message.fromUserId != props.userId; // true if received, false if sent

    useEffect(() => {
        if (props.message.status == MessageStatus.NEW) {
            props.updateMessage(props.message.id, {
                ...props.message,
                status: MessageStatus.SENDING,
            });
            sendMessage();
        }
    }, []);

    const sendMessage = async () => {
        const api = new ApiClient();
        try {
            setIsSending(true);
            setError(false);
            const responseMessage = await api.chat.postApiChatSend({
                recipientUserId: props.otherUserId,
                body: props.message.body,
            });
            props.updateMessage(props.message.id, responseMessage);
        } catch (err) {
            setError(true);
        } finally {
            setIsSending(false);
        }
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
            secondaryAction={error ? renderError() : isSending ? renderSendProgress() : null}
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
