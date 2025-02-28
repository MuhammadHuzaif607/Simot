import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = "http://localhost:5005/api/products/devices-test";

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/devices-test`);
  return response.data.testDevices; // Accessing the array inside response
});

const testDevicesSlice = createSlice({
  name: "products",
  initialState: {
    devices: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.devices = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default testDevicesSlice.reducer;
