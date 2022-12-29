import {
    Box,
    Button,
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
import RefreshIcon from "@mui/icons-material/Refresh";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiClient } from "../api/ApiClient";
import { ChatHubService } from "../api/ChatHubService";
import useAuth from "../hooks/useAuth";
import { MessageDto, MessageStatus } from "../api/generated";
import LoadingButton from "@mui/lab/LoadingButton";
import Message from "./Message";

type InnerConversationProps = {
    otherUserId: string;
};

const InnerConversation = (props: InnerConversationProps) => {
    const { userId } = useAuth();
    const [connection, setConnection] = useState<ChatHubService | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [messages, setMessages] = useState<MessageDto[]>([]);
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
        fetchMessages();
    }, []);

    useEffect(() => {
        connection?.onMessage((message) => {
            if (message.fromUserId != props.otherUserId) {
                return;
            }

            setMessages((oldMessages) => [...oldMessages, message]);
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

    const fetchMessages = async () => {
        try {
            setIsLoadingMessages(true);
            const api = new ApiClient();
            const response = await api.chat.getApiChatMessages(props.otherUserId, continuationToken || "");
            setContinuationToken(response.continuationToken);
            setHasMoreMessages(response.hasMoreMessages);
            setMessages((currentMessages) => [...response.messages, ...currentMessages]);
        } catch (err) {
            alert("Could not fetch messages: " + err); // TODO
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleTextFieldKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
        const messageText = messageTextRef.current?.value;
        if (event.key != "Enter" || messageText == undefined || messageText?.length == 0) {
            return;
        }

        const newMessage = {
            id: crypto.randomUUID(),
            fromUserId: userId,
            toUserId: props.otherUserId,
            body: messageText,
            status: MessageStatus.NEW,
        } as MessageDto;

        messageTextRef.current!.value = "";
        setMessages((oldMessages) => [...oldMessages, newMessage]);
    };

    const updateMessage = (id: string, message: MessageDto) => {
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
                    };
                } else {
                    return oldMessage;
                }
            })
        );
    };

    return (
        <Box sx={{ m: 1, height: "90vh", display: "flex", flexDirection: "column" }}>
            <LoadingButton
                onClick={fetchMessages}
                endIcon={<RefreshIcon />}
                loadingPosition="center"
                loading={isLoadingMessages}
                sx={{ display: hasMoreMessages || isLoadingMessages ? "flex" : "none" }}
            >
                Load more
            </LoadingButton>
            <List sx={{ overflow: "auto" }}>
                {messages.map((message) => (
                    <Message
                        userId={userId}
                        otherUserId={props.otherUserId}
                        message={message}
                        updateMessage={updateMessage}
                    />
                ))}
                <ListItem key="last" ref={lastMessageRef} />
            </List>

            <TextField
                placeholder="Type message"
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
