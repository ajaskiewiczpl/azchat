/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FriendDto } from '../models/FriendDto';
import type { MessageDto } from '../models/MessageDto';
import type { SendMessageRequestDto } from '../models/SendMessageRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ChatService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns FriendDto Success
     * @throws ApiError
     */
    public getApiChatFriends(): CancelablePromise<Array<FriendDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/Chat/friends',
        });
    }

    /**
     * @param requestBody 
     * @returns any Success
     * @throws ApiError
     */
    public postApiChatMessagesSend(
requestBody?: SendMessageRequestDto,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Chat/messages/send',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns MessageDto Success
     * @throws ApiError
     */
    public getApiChatMessagesLatest(): CancelablePromise<Array<MessageDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/Chat/messages/latest',
        });
    }

}
