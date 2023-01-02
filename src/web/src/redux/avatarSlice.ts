import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AvatarState {
    avatar: string;
}

const initialState: AvatarState = {
    avatar: "",
};

export const avatarSlice = createSlice({
    name: "avatar",
    initialState,
    reducers: {
        setAvatar: (state, action: PayloadAction<string>) => {
            state.avatar = action.payload;
        },
    },
});

export const { setAvatar } = avatarSlice.actions;

export default avatarSlice.reducer;
