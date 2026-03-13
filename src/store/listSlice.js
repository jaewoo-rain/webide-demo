
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    projects: [{
        username: "",
        projectName: "",
        key: "",
    }],
};

const listSlice = createSlice({
    name: "list",
    initialState,
    reducers: {
        setProjects: (state, action) => {
            state.projects = action.payload.map((p) => ({
                username: p.owner_slug,
                projectName: p.project_name_raw,
                key: p.key,
            }));
        },
        clearProjects: (state) => {
            state.projects = [];
        },
    },
});

export const { setProjects, clearProjects } = listSlice.actions;
export default listSlice.reducer;