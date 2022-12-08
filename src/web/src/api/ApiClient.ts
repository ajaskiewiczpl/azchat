import { OpenAPI } from "./generated";
import { GeneratedApiClient } from "./generated/GeneratedApiClient";

export class ApiClient extends GeneratedApiClient {

    constructor() {
        let apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        super({
            BASE: apiUrl,
            TOKEN: OpenAPI.TOKEN,
            WITH_CREDENTIALS: OpenAPI.WITH_CREDENTIALS
        });
    }
}
