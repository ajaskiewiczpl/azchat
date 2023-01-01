/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ProfileService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param userId 
     * @returns string Success
     * @throws ApiError
     */
    public getApiProfileAvatar(
userId: string,
): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/Profile/avatar/{userId}',
            path: {
                'userId': userId,
            },
        });
    }

    /**
     * @param formData 
     * @returns string Success
     * @throws ApiError
     */
    public postApiProfileAvatar(
formData?: {
file?: Blob;
},
): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Profile/avatar',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public deleteApiProfileAvatar(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/Profile/avatar',
        });
    }

}
