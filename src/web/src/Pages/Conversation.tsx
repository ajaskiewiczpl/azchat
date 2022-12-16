import { Box, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, Typography } from "@mui/material";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";

const messageIncoming = "incoming";
const messageSent = "sent";

type Message = {
    id: number;
    text: string;
    direction: string;
};

const generatedMessages = Array.from(Array(80).keys()).map(
    (key) =>
        ({
            id: key,
            text: `Message ${key}`,
            direction: key % 2 == 0 ? messageIncoming : messageSent,
        } as Message)
);

const InnerConversation = () => {
    const [messages, setMessages] = useState<Message[]>(generatedMessages);
    const [messageText, setMessageText] = useState("");
    const lastMessageRef = useRef<HTMLLIElement | null>(null);

    const handleMessageSend = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key != "Enter" || messageText.length == 0) {
            return;
        }

        setMessages([
            ...messages,
            {
                id: messages.length + 1,
                text: messageText,
                direction: messageSent,
            },
        ]);
        setMessageText("");
    };

    useEffect(() => {
        console.log("unmount");
    }, []);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({
            behavior: "auto",
        });
    }, [messages]);

    return (
        <Box sx={{ m: 2, height: "92vh", display: "flex", flexDirection: "column" }}>
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
                sx={{ m: 1 }}
                onKeyDown={handleMessageSend}
                value={messageText}
                onChange={(event) => {
                    setMessageText(event.target.value);
                }}
            />
        </Box>
    );
};

export type ConversationProps = {};

const Conversation = (props: ConversationProps) => {
    const { userId } = useParams();
    return <InnerConversation key={userId} />;
};

export default Conversation;
