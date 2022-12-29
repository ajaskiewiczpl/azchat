/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MessageDto } from './MessageDto';

export type GetMessagesResponse = {
    messages: Array<MessageDto>;
    continuationToken: string;
    hasMoreMessages: boolean;
};
