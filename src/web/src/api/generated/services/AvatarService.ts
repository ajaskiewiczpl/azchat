/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AvatarService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param userId 
     * @returns string Success
     * @throws ApiError
     */
    public getApiAvatar(
userId: string,
): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/Avatar/{userId}',
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
    public postApiAvatar(
formData?: {
file?: Blob;
},
): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/Avatar',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public deleteApiAvatar(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/Avatar',
        });
    }

}
