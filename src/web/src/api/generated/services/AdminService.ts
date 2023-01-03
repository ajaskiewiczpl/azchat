/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeleteUsersRequestDto } from '../models/DeleteUsersRequestDto';
import type { UserDto } from '../models/UserDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AdminService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns UserDto Success
     * @throws ApiError
     */
    public getApiAdminUsers(): CancelablePromise<Array<UserDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/Admin/users',
        });
    }

    /**
     * @param requestBody 
     * @returns any Success
     * @throws ApiError
     */
    public deleteApiAdminUsers(
requestBody?: DeleteUsersRequestDto,
): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/Admin/users',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
