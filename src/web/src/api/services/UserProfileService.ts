/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UserProfileService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any Success
     * @throws ApiError
     */
    public getApiUserProfile(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/UserProfile',
        });
    }

}
