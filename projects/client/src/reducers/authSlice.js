import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

export const userLogin = createAsyncThunk(
  "auth/userLogin",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user/login`,
        { email, password }
      );
      localStorage.setItem("token", response.data.data.token);
      //return response data to redux extra reducers
      return response?.data;
    } catch (error) {
      if (error.response && error.response?.data?.message) {
        return thunkAPI.rejectWithValue(error.response?.data?.message);
      } else {
        return thunkAPI.rejectWithValue(error.message);
      }
    }
  }
);

const token = localStorage.getItem("token") || null;

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  token,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLogout: (state) => {
      state.user = null;
      state.token = null;
      state.message = null;
      state.isSuccess = false;
      state.isLoading = false;
      state.isError = false;
      localStorage.clear();
      setTimeout(() => {
        toast.success("Account logged out.");
      }, 500);
    },
    clearState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = null;
    },
  },
  extraReducers: {
    [userLogin.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.token = action.payload.data.token;
      state.user = action.payload.data.user;
      state.message = action.payload.message;
      toast.success(state.message);
    },
    [userLogin.rejected]: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
      toast.error(state.message);
    },
    [userLogin.pending]: (state) => {
      state.isLoading = true;
    },
  },
});

export const { userLogout, clearState } = authSlice.actions;
export default authSlice.reducer;