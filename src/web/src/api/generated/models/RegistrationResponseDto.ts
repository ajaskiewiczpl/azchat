/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { IdentityError } from './IdentityError';

export type RegistrationResponseDto = {
    errors?: Array<IdentityError> | null;
    readonly success?: boolean;
};
