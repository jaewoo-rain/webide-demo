// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     current: "main.py",
//     open: ["main.py"],
// };

// const openPageSlice = createSlice({
//     name: "openPage",
//     initialState,
//     reducers: {
//         openFile(state, action) {
//             const fileName = action.payload;

//             if (!state.open.includes(fileName)) {
//                 state.open.push(fileName);
//             }
//             state.current = fileName;
//         },

//         setCurrentPage(state, action) {
//             state.current = action.payload;
//         },

//         closePage(state, action) {
//             const fileName = action.payload;
//             state.open = state.open.filter((f) => f !== fileName);

//             if (state.current === fileName) {
//                 state.current = state.open.length > 0 ? state.open[state.open.length - 1] : null;
//             }
//         },
//     },
// });

// export const { openFile, setCurrentPage, closePage } = openPageSlice.actions;
// export default openPageSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    current: null,
    open: [],
};

const openPageSlice = createSlice({
    name: "openPage",
    initialState,
    reducers: {
        openFile(state, action) {
            const fileId = action.payload;

            if (!state.open.includes(fileId)) {
                state.open.push(fileId);
            }
            state.current = fileId;
        },

        setCurrentPage(state, action) {
            state.current = action.payload;
        },

        closePage(state, action) {
            const fileId = action.payload;
            state.open = state.open.filter((id) => id !== fileId);

            if (state.current === fileId) {
                state.current = state.open.length > 0 ? state.open[state.open.length - 1] : null;
            }
        },

        resetOpenPages(state) {
            state.current = null;
            state.open = [];
        },
    },
});

export const { openFile, setCurrentPage, closePage, resetOpenPages } = openPageSlice.actions;
export default openPageSlice.reducer;