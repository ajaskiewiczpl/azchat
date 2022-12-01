/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RegisterUserResponseDto } from '../models/RegisterUserResponseDto';
import type { UserBaseRequestDto } from '../models/UserBaseRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class IdentityService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param requestBody 
     * @returns RegisterUserResponseDto Success
     * @throws ApiError
     */
    public postApiIdentitySignup(
requestBody?: UserBaseRequestDto,
): CancelablePromise<RegisterUserResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Identity/signup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody 
     * @returns any Success
     * @throws ApiError
     */
    public postApiIdentitySignin(
requestBody?: UserBaseRequestDto,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Identity/signin',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
