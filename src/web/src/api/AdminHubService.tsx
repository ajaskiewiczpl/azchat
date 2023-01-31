import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import { baseUrl } from "../app-config";

type OnUsersDeleteProgressCallback = (progress: number) => void;

export class AdminHubService {
    private readonly hub: HubConnection;

    private authToken: string;

    constructor(initialToken: string) {
        const hubUrl = baseUrl + "/api/hub/admin";
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

    async connect(): Promise<string> {
        try {
            await this.hub.start();
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
            .then(() => {});
    }

    onUsersDeleteProgress(callback: OnUsersDeleteProgressCallback) {
        this.hub.on("onUsersDeleteProgress", (message) => {
            if (callback) {
                callback(message);
            }
        });
    }
}
