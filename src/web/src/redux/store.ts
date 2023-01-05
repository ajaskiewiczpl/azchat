import { configureStore } from "@reduxjs/toolkit";
import avatarReducer from "./avatarSlice";
import { azchatApi } from "./azchatApi";

const store = configureStore({
    reducer: {
        avatar: avatarReducer,
        [azchatApi.reducerPath]: azchatApi.reducer,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(azchatApi.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
