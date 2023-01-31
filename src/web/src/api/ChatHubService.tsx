import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import { baseUrl } from "../app-config";
import { MessageDto } from "../redux/api";

type OnMessageCallback = (message: MessageDto) => void;

export class ChatHubService {
    private readonly hub: HubConnection;

    private authToken: string;

    constructor(initialToken: string) {
        const hubUrl = baseUrl + "/api/hub/chat";
        this.authToken = initialToken;
        this.hub = new HubConnectionBuilder()
            .withAutomaticReconnect()
            .withUrl(hubUrl, {
                withCredentials: false,
                accessTokenFactory: async () => {
                    const response = await axios.post(
                        `/api/identity/refreshtoken`,
                        {
                            token: this.authToken,
                        },
                        {
                            baseURL: baseUrl,
                            withCredentials: true,
                        }
                    );
                    this.authToken = response.data.token;
                    return this.authToken;
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
