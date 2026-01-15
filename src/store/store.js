import { configureStore } from '@reduxjs/toolkit'
import projectReducer from "./projectSlice.js"
export default configureStore({
  reducer: {
    project: projectReducer
  }
}) 