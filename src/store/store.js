import { configureStore } from '@reduxjs/toolkit'
import projectReducer from "./projectSlice.js"
import authReducer from "./authSlice.js"

export default configureStore({
  reducer: {
    project: projectReducer,
    auth: authReducer,
  }
}) 