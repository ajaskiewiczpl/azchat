import { azchatApi as api } from "./baseApi";
const injectedRtkApi = api.injectEndpoints({
    endpoints: (build) => ({
        getApiAdminUsers: build.query<GetApiAdminUsersApiResponse, GetApiAdminUsersApiArg>({
            query: () => ({ url: `/api/Admin/users` }),
        }),
        deleteApiAdminUsers: build.mutation<DeleteApiAdminUsersApiResponse, DeleteApiAdminUsersApiArg>({
            query: (queryArg) => ({ url: `/api/Admin/users`, method: "DELETE", body: queryArg.deleteUsersRequestDto }),
        }),
        postApiAdminUsersPassword: build.mutation<
            PostApiAdminUsersPasswordApiResponse,
            PostApiAdminUsersPasswordApiArg
        >({
            query: (queryArg) => ({
                url: `/api/Admin/users/password`,
                method: "POST",
                body: queryArg.changeUserPasswordRequest,
            }),
        }),
        getApiAvatarByUserId: build.query<GetApiAvatarByUserIdApiResponse, GetApiAvatarByUserIdApiArg>({
            query: (queryArg) => ({ url: `/api/Avatar/${queryArg.userId}` }),
        }),
        postApiAvatar: build.mutation<PostApiAvatarApiResponse, PostApiAvatarApiArg>({
            query: (queryArg) => ({ url: `/api/Avatar`, method: "POST", body: queryArg.body }),
        }),
        deleteApiAvatar: build.mutation<DeleteApiAvatarApiResponse, DeleteApiAvatarApiArg>({
            query: () => ({ url: `/api/Avatar`, method: "DELETE" }),
        }),
        getApiChatPing: build.query<GetApiChatPingApiResponse, GetApiChatPingApiArg>({
            query: () => ({ url: `/api/Chat/ping` }),
        }),
        getApiChatFriends: build.query<GetApiChatFriendsApiResponse, GetApiChatFriendsApiArg>({
            query: () => ({ url: `/api/Chat/friends` }),
        }),
        postApiChatSend: build.mutation<PostApiChatSendApiResponse, PostApiChatSendApiArg>({
            query: (queryArg) => ({ url: `/api/Chat/send`, method: "POST", body: queryArg.sendMessageRequestDto }),
        }),
        getApiChatMessages: build.query<GetApiChatMessagesApiResponse, GetApiChatMessagesApiArg>({
            query: (queryArg) => ({
                url: `/api/Chat/messages`,
                params: { otherUserId: queryArg.otherUserId, continuationToken: queryArg.continuationToken },
            }),
        }),
        postApiIdentitySignup: build.mutation<PostApiIdentitySignupApiResponse, PostApiIdentitySignupApiArg>({
            query: (queryArg) => ({ url: `/api/Identity/signup`, method: "POST", body: queryArg.userBaseRequestDto }),
        }),
        postApiIdentitySignin: build.mutation<PostApiIdentitySigninApiResponse, PostApiIdentitySigninApiArg>({
            query: (queryArg) => ({ url: `/api/Identity/signin`, method: "POST", body: queryArg.userBaseRequestDto }),
        }),
        postApiIdentityChangepassword: build.mutation<
            PostApiIdentityChangepasswordApiResponse,
            PostApiIdentityChangepasswordApiArg
        >({
            query: (queryArg) => ({
                url: `/api/Identity/changepassword`,
                method: "POST",
                body: queryArg.changePasswordRequestDto,
            }),
        }),
        postApiIdentityRefreshtoken: build.mutation<
            PostApiIdentityRefreshtokenApiResponse,
            PostApiIdentityRefreshtokenApiArg
        >({
            query: (queryArg) => ({
                url: `/api/Identity/refreshtoken`,
                method: "POST",
                body: queryArg.refreshTokenRequestDto,
            }),
        }),
        postApiIdentitySignout: build.mutation<PostApiIdentitySignoutApiResponse, PostApiIdentitySignoutApiArg>({
            query: () => ({ url: `/api/Identity/signout`, method: "POST" }),
        }),
    }),
    overrideExisting: false,
});
export { injectedRtkApi as azchatApi };
export type GetApiAdminUsersApiResponse = /** status 200 Success */ UserDto[];
export type GetApiAdminUsersApiArg = void;
export type DeleteApiAdminUsersApiResponse = unknown;
export type DeleteApiAdminUsersApiArg = {
    deleteUsersRequestDto: DeleteUsersRequestDto;
};
export type PostApiAdminUsersPasswordApiResponse = unknown;
export type PostApiAdminUsersPasswordApiArg = {
    changeUserPasswordRequest: ChangeUserPasswordRequest;
};
export type GetApiAvatarByUserIdApiResponse = /** status 200 Success */ AvatarResponse;
export type GetApiAvatarByUserIdApiArg = {
    userId: string;
};
export type PostApiAvatarApiResponse = /** status 200 Success */ string;
export type PostApiAvatarApiArg = {
    body: {
        file?: Blob;
    };
};
export type DeleteApiAvatarApiResponse = unknown;
export type DeleteApiAvatarApiArg = void;
export type GetApiChatPingApiResponse = unknown;
export type GetApiChatPingApiArg = void;
export type GetApiChatFriendsApiResponse = /** status 200 Success */ FriendDto[];
export type GetApiChatFriendsApiArg = void;
export type PostApiChatSendApiResponse = /** status 200 Success */ MessageDto;
export type PostApiChatSendApiArg = {
    sendMessageRequestDto: SendMessageRequestDto;
};
export type GetApiChatMessagesApiResponse = /** status 200 Success */ GetMessagesResponse;
export type GetApiChatMessagesApiArg = {
    otherUserId?: string;
    continuationToken?: string;
};
export type PostApiIdentitySignupApiResponse = /** status 200 Success */ RegistrationResponseDto;
export type PostApiIdentitySignupApiArg = {
    userBaseRequestDto: UserBaseRequestDto;
};
export type PostApiIdentitySigninApiResponse = /** status 200 Success */ AuthenticationResponseDto;
export type PostApiIdentitySigninApiArg = {
    userBaseRequestDto: UserBaseRequestDto;
};
export type PostApiIdentityChangepasswordApiResponse = /** status 200 Success */ ChangePasswordResponseDto;
export type PostApiIdentityChangepasswordApiArg = {
    changePasswordRequestDto: ChangePasswordRequestDto;
};
export type PostApiIdentityRefreshtokenApiResponse = /** status 200 Success */ AuthenticationResponseDto;
export type PostApiIdentityRefreshtokenApiArg = {
    refreshTokenRequestDto: RefreshTokenRequestDto;
};
export type PostApiIdentitySignoutApiResponse = unknown;
export type PostApiIdentitySignoutApiArg = void;
export type UserDto = {
    id: string;
    userName: string;
};
export type DeleteUsersRequestDto = {
    userIDs: string[];
    signalRConnectionID?: string | null;
};
export type ChangeUserPasswordRequest = {
    userID: string;
    newPassword: string;
};
export type AvatarResponse = {
    avatarData: string;
};
export type FriendDto = {
    id: string;
    userName: string;
    unreadMessagesCount: number;
};
export type MessageStatus = "New" | "Sending" | "Sent" | "Received";
export type MessageDto = {
    id: string;
    status: MessageStatus;
    timestamp: string;
    fromUserId: string;
    toUserId: string;
    body: string;
};
export type SendMessageRequestDto = {
    recipientUserId: string;
    body: string;
};
export type GetMessagesResponse = {
    messages: MessageDto[];
    continuationToken: string;
    hasMoreMessages: boolean;
};
export type IdentityError = {
    code?: string | null;
    description?: string | null;
};
export type RegistrationResponseDto = {
    errors?: IdentityError[] | null;
    success?: boolean;
};
export type UserBaseRequestDto = {
    userName: string;
    password: string;
};
export type AuthenticationResponseDto = {
    token?: string | null;
    errors?: IdentityError[] | null;
    success?: boolean;
};
export type ChangePasswordResponseDto = {
    errors?: IdentityError[] | null;
    success?: boolean;
};
export type ChangePasswordRequestDto = {
    currentPassword: string;
    newPassword: string;
};
export type RefreshTokenRequestDto = {
    token: string;
};
export const {
    useGetApiAdminUsersQuery,
    useDeleteApiAdminUsersMutation,
    usePostApiAdminUsersPasswordMutation,
    useGetApiAvatarByUserIdQuery,
    usePostApiAvatarMutation,
    useDeleteApiAvatarMutation,
    useGetApiChatPingQuery,
    useGetApiChatFriendsQuery,
    usePostApiChatSendMutation,
    useGetApiChatMessagesQuery,
    usePostApiIdentitySignupMutation,
    usePostApiIdentitySigninMutation,
    usePostApiIdentityChangepasswordMutation,
    usePostApiIdentityRefreshtokenMutation,
    usePostApiIdentitySignoutMutation,
} = injectedRtkApi;
