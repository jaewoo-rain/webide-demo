
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    projects: [{
        username: "",
        projectName: "",
        key: "",
        vncUrl: "",
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
                vncUrl: p.vncUrl
            }));
        },
        clearProjects: (state) => {
            state.projects = [];
        },
    },
});

export const { setProjects, clearProjects } = listSlice.actions;
export default listSlice.reducer;