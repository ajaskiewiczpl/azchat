import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import useRefreshToken from "../hooks/useRefreshToken";
import { ApiClient } from "./ApiClient";
import { MessageDto } from "./generated/models/MessageDto";

type OnMessageCallback = (message: MessageDto) => void;

export class ChatHubService {
    private readonly hub: HubConnection;

    constructor() {
        const hubUrl = new ApiClient().request.config.BASE + "/api/hub/chat";
        this.hub = new HubConnectionBuilder()
            .withAutomaticReconnect()
            .withUrl(hubUrl, {
                withCredentials: false,
                accessTokenFactory: async () => {
                    const api = new ApiClient();
                    await api.chat.getApiChatPing(); // make dummy API call to refresh and store new token in local storage if needed
                    return localStorage.getItem("token") || "";
                },
            })
            .build();
    }

    async connect(): Promise<void> {
        try {
            await this.hub.start();
        } catch (err) {
            console.error("Could not connect to chat hub", err);
        }
    }

    disconnect() {
        this.hub
            .stop()
            .catch((err) => console.error("Error while disconnecting", err))
            .then(() => {});
    }

    onMessage(callback: OnMessageCallback) {
        this.hub.on("onMessage", (message) => {
            if (callback) {
                callback(message);
            }
        });
    }
}
