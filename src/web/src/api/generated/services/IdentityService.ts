/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthenticationResponseDto } from '../models/AuthenticationResponseDto';
import type { RefreshTokenRequestDto } from '../models/RefreshTokenRequestDto';
import type { RegistrationResponseDto } from '../models/RegistrationResponseDto';
import type { UserBaseRequestDto } from '../models/UserBaseRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class IdentityService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param requestBody 
     * @returns RegistrationResponseDto Success
     * @throws ApiError
     */
    public postApiIdentitySignup(
requestBody?: UserBaseRequestDto,
): CancelablePromise<RegistrationResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Identity/signup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns AuthenticationResponseDto Success
     * @throws ApiError
     */
    public postApiIdentitySignin(
requestBody?: UserBaseRequestDto,
): CancelablePromise<AuthenticationResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Identity/signin',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns AuthenticationResponseDto Success
     * @throws ApiError
     */
    public postApiIdentityRefreshtoken(
requestBody?: RefreshTokenRequestDto,
): CancelablePromise<AuthenticationResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Identity/refreshtoken',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public postApiIdentitySignout(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Identity/signout',
        });
    }

}
