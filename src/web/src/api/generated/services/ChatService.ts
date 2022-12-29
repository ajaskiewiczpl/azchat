/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FriendDto } from '../models/FriendDto';
import type { GetMessagesResponse } from '../models/GetMessagesResponse';
import type { MessageDto } from '../models/MessageDto';
import type { SendMessageRequestDto } from '../models/SendMessageRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ChatService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any Success
     * @throws ApiError
     */
    public getApiChatPing(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/Chat/ping',
        });
    }

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
     * @returns MessageDto Success
     * @throws ApiError
     */
    public postApiChatSend(
requestBody?: SendMessageRequestDto,
): CancelablePromise<MessageDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Chat/send',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param otherUserId 
     * @param continuationToken 
     * @returns GetMessagesResponse Success
     * @throws ApiError
     */
    public getApiChatMessages(
otherUserId?: string,
continuationToken?: string,
): CancelablePromise<GetMessagesResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/Chat/messages',
            query: {
                'otherUserId': otherUserId,
                'continuationToken': continuationToken,
            },
        });
    }

}
