
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    projects: [],
};

const listSlice = createSlice({
    name: "list",
    initialState,
    reducers: {
        setProjects: (state, action) => {
            state.projects = action.payload;
        },
        clearProjects: (state) => {
            state.projects = [];
        },
    },
});

export const { setProjects, clearProjects } = listSlice.actions;
export default listSlice.reducer;