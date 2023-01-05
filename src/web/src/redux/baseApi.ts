import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { clearToken, setToken } from "./authSlice";
import { RootState } from "./store";

const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

const baseQuery = fetchBaseQuery({
    baseUrl: baseUrl,
    credentials: "include", // TODO include only in signin/refresh endpoints
    prepareHeaders: (headers, { getState }) => {
        const {
            auth: { token },
        } = getState() as RootState;

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const {
            auth: { token },
        } = api.getState() as RootState;

        const refreshResponse = await baseQuery(
            {
                url: "/api/identity/refreshtoken",
                method: "POST",
                body: {
                    token: token,
                },
            },
            api,
            extraOptions
        );

        if (refreshResponse.data) {
            const { token } = refreshResponse.data as { token: string };
            api.dispatch(setToken({ token: token as string }));

            // retry the initial query
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(clearToken());
        }
    }
    return result;
};

export const baseApi = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
});
