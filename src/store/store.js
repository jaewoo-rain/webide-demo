import { configureStore } from '@reduxjs/toolkit'
import projectReducer from "./projectSlice.js"
import authReducer from "./authSlice.js"
import listReducer from "./listSlice.js"

export default configureStore({
  reducer: {
    project: projectReducer,
    auth: authReducer,
    list: listReducer,
  }
}) 