import {configureStore} from '@reduxjs/toolkit'
import project from "./projectSlice.jsx"
export default configureStore({
  reducer: {
    // user: user.reducer,
    // project: project.reducer,
    // openPage: openPageSlice.reducer,
    // container: containerReducer,
    // files: fileReducer, // 👈 추가
    project: project.reducer
  }
}) 