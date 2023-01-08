import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { baseUrl } from "../app-config";
import { MessageDto } from "../redux/api";

type OnMessageCallback = (message: MessageDto) => void;

export class ChatHubService {
    private readonly hub: HubConnection;

    constructor() {
        const hubUrl = baseUrl + "/api/hub/chat";
        this.hub = new HubConnectionBuilder()
            .withAutomaticReconnect()
            .withUrl(hubUrl, {
                withCredentials: false,
                accessTokenFactory: async () => {
                    // TODO
                    // const api = new ApiClient();
                    // await api.chat.getApiChatPing(); // make dummy API call to refresh and store new token in local storage if needed
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
        this.hub.off("onMessage");
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
