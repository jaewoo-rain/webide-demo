import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  username: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.username = action.payload.username; // { id, name, email }
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.username = null;
    },

  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
