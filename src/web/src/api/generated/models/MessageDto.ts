/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MessageStatus } from './MessageStatus';

export type MessageDto = {
    id: string;
    status: MessageStatus;
    timestamp: string;
    fromUserId: string;
    toUserId: string;
    body: string;
};
