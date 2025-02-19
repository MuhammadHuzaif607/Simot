import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/payments`; // Ensure this matches your backend

// 🔹 1. Fetch unpaid devices ("To Pay")
export const fetchUnpaidDevices = createAsyncThunk(
  "payments/fetchUnpaidDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/to-pay`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching unpaid devices");
    }
  }
);

// 🔹 2. Fetch paid devices (last 14 days)
export const fetchPaidDevices = createAsyncThunk(
  "payments/fetchPaidDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/paid`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching paid devices");
    }
  }
);

// 🔹 3. Fetch full story (history of payments for 90 days)
export const fetchFullStory = createAsyncThunk(
  "payments/fetchFullStory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/full-story`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching full story");
    }
  }
);

// 🔹 4. Generate invoice for a technician
export const generateInvoice = createAsyncThunk(
  "payments/generateInvoice",
  async (technicianEmail, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/invoice/${technicianEmail}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error generating invoice");
    }
  }
);

// 🔹 5. Mark multiple devices as "Paid"
export const payMultipleDevices = createAsyncThunk(
  "payments/payMultipleDevices",
  async (deviceIds, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/pay-multiple`, { deviceIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error processing payment");
    }
  }
);

// 🔹 6. Fetch devices grouped by technician
export const fetchGroupedByTechnician = createAsyncThunk(
  "payments/fetchGroupedByTechnician",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/group-by-technician`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching grouped devices");
    }
  }
);

// 🔹 7. Fetch Payments Grouped by Technician & Date
export const fetchGroupedByPayment = createAsyncThunk(
  "payments/fetchGroupedByPayment",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/group-by-payment`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching grouped payments");
    }
  }
);

// 🔹 8. Delete old paid devices (Auto-delete after 14 days)
export const deleteOldPaidDevices = createAsyncThunk(
  "payments/deleteOldPaidDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-old-paid`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting old paid devices");
    }
  }
);

// 🔹 9. Delete old full-story records (Auto-delete after 90 days)
export const deleteOldFullStory = createAsyncThunk(
  "payments/deleteOldFullStory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/delete-old-fullstory`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting old full story records");
    }
  }
);

const paymentSlice = createSlice({
  name: "payments",
  initialState: {
    unpaidDevices: [],
    paidDevices: [],
    fullStory: [],
    groupedDevices: [],
    groupedPayments: [], // New state for grouped payments by technician & date
    invoice: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch unpaid devices
      .addCase(fetchUnpaidDevices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUnpaidDevices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.unpaidDevices = action.payload;
      })
      .addCase(fetchUnpaidDevices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch paid devices
      .addCase(fetchPaidDevices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPaidDevices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.paidDevices = action.payload;
      })
      .addCase(fetchPaidDevices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch full story (history)
      .addCase(fetchFullStory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFullStory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.fullStory = action.payload;
      })
      .addCase(fetchFullStory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Generate invoice
      .addCase(generateInvoice.pending, (state) => {
        state.status = "loading";
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.invoice = action.payload;
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.msg;
      })

      // Pay multiple devices
      .addCase(payMultipleDevices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(payMultipleDevices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.unpaidDevices = state.unpaidDevices.filter(
          (device) => !action.payload.deviceIds.includes(device._id)
        );
      })
      .addCase(payMultipleDevices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch grouped devices by technician
      .addCase(fetchGroupedByTechnician.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGroupedByTechnician.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.groupedDevices = action.payload;
      })
      .addCase(fetchGroupedByTechnician.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch payments grouped by technician & date
      .addCase(fetchGroupedByPayment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGroupedByPayment.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.groupedPayments = action.payload;
      })
      .addCase(fetchGroupedByPayment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default paymentSlice.reducer;
