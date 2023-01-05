import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import jwtDecode from "jwt-decode";

export type User = {
    userId: string;
    userName: string;
    role: string;
};

type AuthState = {
    user: User | null;
    token: string | null;
};

type Jwt = {
    userId: string;
    name: string;
    role: string;
};

const tokenKeyName = "token";

function getTokenFromLocalStorage(): string {
    return localStorage.getItem(tokenKeyName) || "";
}

function getUserFromToken(token: string) {
    if (token && token.length > 1) {
        const { userId, name, role } = jwtDecode<Jwt>(token);
        return {
            userId: userId,
            userName: name,
            role: role,
        } as User;
    } else {
        return null;
    }
}

const slice = createSlice({
    name: "auth",
    initialState: {
        user: getUserFromToken(getTokenFromLocalStorage()),
        token: getTokenFromLocalStorage(),
    } as AuthState,
    reducers: {
        setToken: (state, { payload: { token } }: PayloadAction<{ token: string }>) => {
            localStorage.setItem(tokenKeyName, token);
            state.token = token;
            state.user = getUserFromToken(token);
        },
        clearToken: (state): void => {
            localStorage.removeItem(tokenKeyName);
            state.token = null;
            state.user = null;
        },
    },
});

export const { setToken, clearToken } = slice.actions;

export default slice.reducer;
