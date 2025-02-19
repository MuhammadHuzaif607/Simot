import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

// 1️⃣ Fetch repairable product by IMEI
export const fetchRepairProduct = createAsyncThunk(
  "repair/fetchRepairProduct",
  async (imei, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/technical/repair`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch repair product");
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2️⃣ Fetch material cost by model
export const fetchMaterialCost = createAsyncThunk(
  "repair/fetchMaterialCost",
  async (model, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/technical/get-material-cost/${encodeURIComponent(model)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch material cost");
      return data.costMaterial;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3️⃣ Fetch technician cost by model
export const fetchTechnicianCost = createAsyncThunk(
  "repair/fetchTechnicianCost",
  async (model, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/technical/get-technician-cost/${encodeURIComponent(model)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch technician cost");
      return data.costMaterial;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4️⃣ Update repair details
export const updateRepairDetails = createAsyncThunk(
  "repair/updateRepairDetails",
  async ({ imei, repairData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/technical/repair/${imei}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repairData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update repair details");
      return data.updatedProduct;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🛠 Create repair slice
const repairSlice = createSlice({
  name: "repair",
  initialState: {
    repairProduct: [],
    materialCost: null,
    technicianCost: null,
    updatedRepair: null,
    selectedDevice : null,
    loading: false,
    error: null,
  },
  reducers: {
    clearRepairState: (state) => {
      state.repairProduct = null;
      state.materialCost = null;
      state.technicianCost = null;
      state.updatedRepair = null;
      state.selectedDevice = null;
      state.error = null;
    },
    selectDeivce : (state, action) => {
      state.selectedDevice = action.payload;
      console.log(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch repairable product
      .addCase(fetchRepairProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepairProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.repairProduct = action.payload;
      })
      .addCase(fetchRepairProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch material cost
      .addCase(fetchMaterialCost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterialCost.fulfilled, (state, action) => {
        state.loading = false;
        state.materialCost = action.payload;
      })
      .addCase(fetchMaterialCost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch technician cost
      .addCase(fetchTechnicianCost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianCost.fulfilled, (state, action) => {
        state.loading = false;
        state.technicianCost = action.payload;
      })
      .addCase(fetchTechnicianCost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update repair details
      .addCase(updateRepairDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRepairDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.updatedRepair = action.payload;
      })
      .addCase(updateRepairDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRepairState, selectDeivce } = repairSlice.actions;
export default repairSlice.reducer;
