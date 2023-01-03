import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { ApiClient } from "./ApiClient";

type OnUsersDeleteProgressCallback = (progress: number) => void;

export class AdminHubService {
    private readonly hub: HubConnection;

    constructor() {
        const hubUrl = new ApiClient().request.config.BASE + "/api/hub/admin";
        this.hub = new HubConnectionBuilder()
            .withAutomaticReconnect()
            .withUrl(hubUrl, {
                withCredentials: false,
                accessTokenFactory: async () => {
                    const api = new ApiClient();
                    await api.chat.getApiChatPing(); // make dummy API call to refresh and store new token in local storage if needed
                    const token = localStorage.getItem("token") || "";
                    return token;
                },
            })
            .build();
    }

    async connect(): Promise<string> {
        try {
            await this.hub.start();
            console.log("Connected to HUB. Connection ID: ", this.hub.connectionId);
            return this.hub.connectionId || "";
        } catch (err) {
            console.error("Could not connect to chat hub", err);
            return "";
        }
    }

    disconnect() {
        this.hub
            .stop()
            .catch((err) => console.error("Error while disconnecting", err))
            .then(() => {
                console.log("Disconnected");
            });
    }

    onUsersDeleteProgress(callback: OnUsersDeleteProgressCallback) {
        this.hub.on("onUsersDeleteProgress", (message) => {
            if (callback) {
                callback(message);
            }
        });
    }
}
