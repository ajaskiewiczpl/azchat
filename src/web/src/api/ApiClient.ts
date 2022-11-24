import { GeneratedApiClient } from "./GeneratedApiClient";

export class ApiClient extends GeneratedApiClient {
    
    static GetBaseUrl() {
        return process.env.REACT_APP_API_ENDPOINT || window.location.origin;
    }

    constructor() {
        super({
            BASE: process.env.REACT_APP_API_ENDPOINT || window.location.origin
        });
    }
}
