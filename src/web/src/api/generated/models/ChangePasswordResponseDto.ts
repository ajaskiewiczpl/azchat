/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IdentityError } from './IdentityError';

export type ChangePasswordResponseDto = {
    errors?: Array<IdentityError> | null;
    readonly success?: boolean;
};
