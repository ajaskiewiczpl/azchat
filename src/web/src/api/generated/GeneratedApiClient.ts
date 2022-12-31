/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';

import { ChatService } from './services/ChatService';
import { IdentityService } from './services/IdentityService';
import { ProfileService } from './services/ProfileService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class GeneratedApiClient {

    public readonly chat: ChatService;
    public readonly identity: IdentityService;
    public readonly profile: ProfileService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '1.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.chat = new ChatService(this.request);
        this.identity = new IdentityService(this.request);
        this.profile = new ProfileService(this.request);
    }
}
