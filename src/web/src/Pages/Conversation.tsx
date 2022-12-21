import {
    Box,
    CircularProgress,
    Container,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { ApiClient } from "../api/ApiClient";
import { ChatHubService } from "../api/ChatHubService";
import useAuth from "../hooks/useAuth";

const messageIncoming = "incoming";
const messageSent = "sent";

const messageStatusSent = "sent";
const messageStatusSending = "sending";
const messageStatusError = "error";

type Message = {
    id: string;
    text: string;
    direction: string;
    status: string;
};

type InnerConversationProps = {
    otherUserId: string;
};

const InnerConversation = (props: InnerConversationProps) => {
    const { userId } = useAuth();
    const [connection, setConnection] = useState<ChatHubService | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState("");
    const lastMessageRef = useRef<HTMLLIElement | null>(null);

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
                const messagesToAdd = response.map(
                    (msg) =>
                        ({
                            id: msg.id,
                            text: msg.body,
                            direction: msg.fromUserId == userId ? messageSent : messageIncoming,
                        } as Message)
                );
                setMessages(messagesToAdd);
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

            setMessages((oldMessages) => [
                ...oldMessages,
                {
                    id: message.id || "",
                    text: message.body || "",
                    direction: messageIncoming,
                    status: messageStatusSent,
                },
            ]);
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

    const handleMessageSend = async (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key != "Enter" || messageText.length == 0) {
            return;
        }

        setMessages((oldMessages) => [
            ...oldMessages,
            {
                id: (oldMessages.length + 1).toString(),
                text: messageText,
                direction: messageSent,
                status: messageStatusSending,
            },
        ]);

        const messageTextLocal = messageText;
        setMessageText("");

        const api = new ApiClient();
        try {
            await api.chat.postApiChatMessagesSend({
                recipientUserId: props.otherUserId,
                body: messageTextLocal,
            });
        } catch (err) {
            alert("Error while sending message: " + err);
        }
    };

    return (
        <>
            <Box sx={{ m: 1, height: "90vh", display: "flex", flexDirection: "column" }}>
                <List sx={{ overflow: "auto" }}>
                    {messages.map((message, index) => {
                        return (
                            <ListItem key={message.id}>
                                {message.direction == messageIncoming ? (
                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                        <AccountCircle />
                                    </ListItemIcon>
                                ) : null}
                                <ListItemText
                                    primary={message.text}
                                    sx={{ textAlign: message.direction == messageSent ? "right" : "left" }}
                                />
                            </ListItem>
                        );
                    })}
                    <ListItem key="last" ref={lastMessageRef} />
                </List>

                <TextField
                    placeholder="..."
                    fullWidth={true}
                    sx={{ mt: 2 }}
                    autoComplete="off"
                    onKeyDown={handleMessageSend}
                    value={messageText}
                    onChange={(event) => {
                        setMessageText(event.target.value);
                    }}
                />
            </Box>
        </>
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
