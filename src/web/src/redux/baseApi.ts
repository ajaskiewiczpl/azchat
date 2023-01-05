import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const azchatApi = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || window.location.origin,
        credentials: "include", // TODO include only in signin/refresh endpoints
    }),
    endpoints: () => ({}),
});
