import { configureStore } from '@reduxjs/toolkit'
import projectReducer from "./projectSlice.js"
import authReducer from "./authSlice.js"
import listReducer from "./listSlice.js"
import openPageReducer from "./openPageSlice.js"


export default configureStore({
  reducer: {
    project: projectReducer,
    auth: authReducer,
    list: listReducer,
    openPage: openPageReducer
  }
}) 