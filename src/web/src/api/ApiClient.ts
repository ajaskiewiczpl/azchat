import { GeneratedApiClient } from "./GeneratedApiClient";

export class ApiClient extends GeneratedApiClient {
    
    static GetBaseUrl() {
        return import.meta.env.REACT_APP_API_ENDPOINT || window.location.origin;
    }

    constructor() {
        super({
            BASE: import.meta.env.REACT_APP_API_ENDPOINT || window.location.origin
        });
    }
}
