import { Box, List, ListItem, TextField } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ChatHubService } from "../../api/ChatHubService";
import useAuth from "../../hooks/useAuth";
import LoadingButton from "@mui/lab/LoadingButton";
import Message from "./Message";
import { useSnackbar } from "notistack";
import { api, MessageDto } from "../../redux/api";

type InnerConversationProps = {
    otherUserId: string;
};

const InnerConversation = (props: InnerConversationProps) => {
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [connection, setConnection] = useState<ChatHubService | null>(null);
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const lastMessageRef = useRef<HTMLLIElement | null>(null);
    const messageTextRef = useRef<HTMLInputElement | null>(null);

    const [
        fetchMessagesAsync,
        {
            isFetching: isFetchingMessages,
            isLoading: isLoadingMessages,
            isSuccess: isSuccessMessages,
            isError: isErrorMessages,
            data: messagesResponse,
        },
    ] = api.useLazyGetApiChatMessagesQuery({});

    const loadMessagesInProgress = isFetchingMessages || isLoadingMessages;

    useEffect(() => {
        if (isErrorMessages) {
            enqueueSnackbar("Could not fetch messages", { variant: "error" });
        }
    }, [isErrorMessages]);

    useEffect(() => {
        // TODO instead of creating multiple hub connections, receive message from the parent Messages.tsx component

        if (props.otherUserId == user!.userId) {
            return; // conversation with self - don't subscribe to incoming messages
        }

        const connect = async () => {
            try {
                const chatHubService = new ChatHubService();
                await chatHubService.connect();
                setConnection(chatHubService);
            } catch (err) {
                enqueueSnackbar("Could not connect to server", { variant: "error" });
            }
        };

        connect();
    }, [isSuccessMessages]);

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
        const response = await fetchMessagesAsync({
            otherUserId: props.otherUserId,
            continuationToken: messagesResponse?.continuationToken,
        }).unwrap();

        setMessages((currentMessages) => [...response.messages, ...currentMessages]);
    };

    const handleTextFieldKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
        const messageText = messageTextRef.current?.value;
        if (event.key != "Enter" || messageText == undefined || messageText?.length == 0) {
            return;
        }

        const newMessage = {
            id: crypto.randomUUID(),
            fromUserId: user!.userId,
            toUserId: props.otherUserId,
            body: messageText,
            status: "New",
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
                loading={loadMessagesInProgress}
                sx={{ display: messagesResponse?.hasMoreMessages || loadMessagesInProgress ? "flex" : "none" }}
            >
                Load more
            </LoadingButton>
            <List sx={{ overflow: "auto" }}>
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        userId={user!.userId}
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
