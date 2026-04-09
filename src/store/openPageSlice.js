import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    current: "main.py",
    open: ["main.py"],
};

const openPageSlice = createSlice({
    name: "openPage",
    initialState,
    reducers: {
        openFile(state, action) {
            const fileName = action.payload;

            if (!state.open.includes(fileName)) {
                state.open.push(fileName);
            }
            state.current = fileName;
        },

        setCurrentPage(state, action) {
            state.current = action.payload;
        },

        closePage(state, action) {
            const fileName = action.payload;
            state.open = state.open.filter((f) => f !== fileName);

            if (state.current === fileName) {
                state.current = state.open.length > 0 ? state.open[state.open.length - 1] : null;
            }
        },
    },
});

export const { openFile, setCurrentPage, closePage } = openPageSlice.actions;
export default openPageSlice.reducer;