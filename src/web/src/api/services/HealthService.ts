/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class HealthService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns boolean Success
     * @throws ApiError
     */
    public getApiHealthCheck(): CancelablePromise<boolean> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/Health/check',
        });
    }

}
