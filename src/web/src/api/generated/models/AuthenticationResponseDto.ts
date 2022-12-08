/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IdentityError } from './IdentityError';

export type AuthenticationResponseDto = {
    token?: string | null;
    errors?: Array<IdentityError> | null;
    readonly success?: boolean;
};
