import {
    Box,
    CircularProgress,
    Container,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { ApiClient } from "../api/ApiClient";
import { ChatHubService } from "../api/ChatHubService";
import useAuth from "../hooks/useAuth";
import { MessageDto, MessageStatus } from "../api/generated";

type InnerConversationProps = {
    otherUserId: string;
};

type Message = {
    id: string;
    status: MessageStatus;
    timestamp: string;
    fromUserId: string;
    toUserId: string;
    body: string;

    error: boolean;
};

const toMessage = (message: MessageDto): Message => {
    return {
        id: message.id,
        timestamp: message.timestamp,
        status: message.status,
        fromUserId: message.fromUserId,
        toUserId: message.toUserId,
        body: message.body,
    } as Message;
};

const InnerConversation = (props: InnerConversationProps) => {
    const { userId } = useAuth();
    const [connection, setConnection] = useState<ChatHubService | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const lastMessageRef = useRef<HTMLLIElement | null>(null);
    const messageTextRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // TODO instead of creating multiple hub connections, receive message from the parent Messages.tsx component

        if (props.otherUserId == userId) {
            return; // conversation with self - don't subscribe to incoming messages
        }

        const connect = async () => {
            try {
                const chatHubService = new ChatHubService();
                await chatHubService.connect();
                setConnection(chatHubService);
            } catch (err) {
                alert("Error connecting to hub: " + err); // TODO show error
            }
        };

        connect();
    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const api = new ApiClient();
                const response = await api.chat.getApiChatMessagesLatest(props.otherUserId);
                const receivedMessages = response.map((message) => {
                    return toMessage(message);
                });
                setMessages(receivedMessages);
            } catch (err) {
                alert("Could not fetch messages: " + err); // TODO
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        connection?.onMessage((message) => {
            if (message.fromUserId != props.otherUserId) {
                return;
            }

            setMessages((oldMessages) => [...oldMessages, toMessage(message)]);
        });

        return () => {
            connection ? connection.disconnect() : null;
        };
    }, [connection]);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({
            behavior: "auto",
        });
    }, [messages]);

    const handleTextFieldKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
        const messageText = messageTextRef.current?.value;
        if (event.key != "Enter" || messageText == undefined || messageText?.length == 0) {
            return;
        }

        const newMessage = {
            id: messages.length.toString(),
            fromUserId: userId,
            toUserId: props.otherUserId,
            body: messageText,
            status: MessageStatus.SENDING,
        } as Message;

        messageTextRef.current!.value = "";
        setMessages((oldMessages) => [...oldMessages, newMessage]);

        await sendMessage(newMessage);
    };

    const sendMessage = async (message: Message) => {
        const api = new ApiClient();
        try {
            console.log("Sending message ID: ", message.id);
            const responseMessage = await api.chat.postApiChatMessagesSend({
                recipientUserId: props.otherUserId,
                body: message.body,
            });
            updateMessage(message.id, toMessage(responseMessage), false);
        } catch (err) {
            updateMessage(message.id, message, true);
        }
    };

    const updateMessage = (id: string, message: Message, error: boolean) => {
        console.log("Updating message ID: " + id + " Error: " + error);
        setMessages((oldMessages) =>
            oldMessages.map((oldMessage) => {
                if (oldMessage.id == id) {
                    return {
                        id: message.id,
                        fromUserId: message.fromUserId,
                        toUserId: message.toUserId,
                        body: message.body,
                        status: message.status,
                        timestamp: message.timestamp,
                        error: error,
                    };
                } else {
                    return oldMessage;
                }
            })
        );
    };

    const renderMessage = (message: Message) => {
        const isReceived = message.fromUserId != userId;

        const renderSending = () => {
            return <CircularProgress size={15} />;
        };

        const renderError = () => {
            return (
                <Tooltip title="Click to retry">
                    <IconButton
                        edge="end"
                        color="error"
                        onClick={() => {
                            updateMessage(message.id, message, false);
                            sendMessage(message);
                        }}
                    >
                        <ErrorIcon />
                    </IconButton>
                </Tooltip>
            );
        };

        return (
            <ListItem
                key={message.id}
                secondaryAction={
                    message.error ? renderError() : message.status == MessageStatus.SENDING ? renderSending() : null
                }
            >
                {isReceived ? (
                    <ListItemIcon sx={{ minWidth: 30 }}>
                        <AccountCircle />
                    </ListItemIcon>
                ) : null}

                <ListItemText primary={message.body} sx={{ textAlign: isReceived ? "left" : "right" }} />
            </ListItem>
        );
    };

    return (
        <Box sx={{ m: 1, height: "90vh", display: "flex", flexDirection: "column" }}>
            <List sx={{ overflow: "auto" }}>
                {messages.map((message, index) => renderMessage(message))}
                <ListItem key="last" ref={lastMessageRef} />
            </List>

            <TextField
                placeholder="..."
                inputRef={messageTextRef}
                fullWidth={true}
                sx={{ mt: 2 }}
                autoComplete="off"
                onKeyDown={handleTextFieldKeyDown}
            />
        </Box>
    );
};

export type ConversationProps = {
    selectUserId: (userId: string) => void;
};

const Conversation = (props: ConversationProps) => {
    const { userId } = useParams<string>();

    useEffect(() => {
        props.selectUserId(userId || "");
    }, [userId]);

    return <InnerConversation key={userId} otherUserId={userId || ""} />;
};

export default Conversation;
