import { configureStore } from "@reduxjs/toolkit";
import avatarReducer from "./avatarSlice";
import authReducer from "./authSlice";
import { api } from "./api";

const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        avatar: avatarReducer,
        auth: authReducer,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
