import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

// 1️⃣ Update product status & grade by ID
export const updateProductStatusNGrade = createAsyncThunk(
  "products/updateStatusGrade",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/products/updatestatus-grade/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update product status & grade");
      }

      return responseData.updatedProduct;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2️⃣ Update only the product status (e.g., Repair Status)
export const updateProductStatus = createAsyncThunk(
  "products/updateStatus",
  async ({ id, status, reason }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/products/updatestatus-with-reason/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }), // Fix: Sending correct JSON structure
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update product status");
      }

      return responseData.updatedProduct;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3️⃣ Initial State
const initialState = {
  products: [], // Stores all products
  loading: false,
  error: null,
};

// 4️⃣ Products Slice
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔄 Updating product status & grade
      .addCase(updateProductStatusNGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStatusNGrade.fulfilled, (state, action) => {
        state.loading = false;

        // Find & update the product in state
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProductStatusNGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔄 Updating only the product status (e.g., Repair Status)
      .addCase(updateProductStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        state.loading = false;

        // Find & update the product in state
        const index = state.products.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index].status = action.payload.status;
        }
      })
      .addCase(updateProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 5️⃣ Export Reducer
export default productsSlice.reducer;
