import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Async Thunks for Cost Material
export const fetchCostMaterial = createAsyncThunk(
  "costMaterial/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cost-material`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch data");
    }
  }
);

export const addCostMaterial = createAsyncThunk(
  "costMaterial/add",
  async (newEntry, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/cost-material`, newEntry);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add data");
    }
  }
);

export const updateCostMaterial = createAsyncThunk(
  "costMaterial/update",
  async ({ id, updatedEntry }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/cost-material/${id}`, updatedEntry);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update data");
    }
  }
);

export const deleteCostMaterial = createAsyncThunk(
  "costMaterial/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/cost-material/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete data");
    }
  }
);

const costMaterialSlice = createSlice({
  name: "costMaterial",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCostMaterial.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCostMaterial.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchCostMaterial.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addCostMaterial.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addCostMaterial.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(addCostMaterial.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateCostMaterial.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCostMaterial.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = "succeeded";
      })
      .addCase(updateCostMaterial.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteCostMaterial.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteCostMaterial.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.status = "succeeded";
      })
      .addCase(deleteCostMaterial.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default costMaterialSlice.reducer;
