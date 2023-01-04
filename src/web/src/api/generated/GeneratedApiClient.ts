/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';

import { AdminService } from './services/AdminService';
import { AvatarService } from './services/AvatarService';
import { ChatService } from './services/ChatService';
import { IdentityService } from './services/IdentityService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class GeneratedApiClient {

    public readonly admin: AdminService;
    public readonly avatar: AvatarService;
    public readonly chat: ChatService;
    public readonly identity: IdentityService;

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

        this.admin = new AdminService(this.request);
        this.avatar = new AvatarService(this.request);
        this.chat = new ChatService(this.request);
        this.identity = new IdentityService(this.request);
    }
}
