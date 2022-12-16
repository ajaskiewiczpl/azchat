import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { ApiClient } from "./ApiClient";
import { MessageDto } from "./generated/models/MessageDto";

type OnMessageCallback = (message: MessageDto) => void;

export class ChatHubService {
    private readonly hub: HubConnection;

    constructor() {
        const hubUrl = new ApiClient().request.config.BASE + "/api/hub/chat";
        this.hub = new HubConnectionBuilder()
            .withAutomaticReconnect()
            .withUrl(hubUrl, { withCredentials: false })
            .build();
    }

    async connect(userId: string): Promise<void> {
        console.log("Connecting to hub");
        await this.hub.start();
        await this.hub.invoke("connect", userId);
        console.log("Connected to hub successfully", userId);
    }

    async disconnect() {
        console.log("Disconnecting from hub");
        await this.hub.stop();
        console.log("Disconnected from hub");
    }

    onMessage(callback: OnMessageCallback) {
        this.hub.on("onMessage", (message) => {
            if (callback) {
                console.log("onMessage", message);
                callback(message);
            }
        });
    }
}
