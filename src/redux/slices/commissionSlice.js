// src/slices/commissionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch the commission from the API
export const fetchCommission = createAsyncThunk(
  'commission/fetchCommission',
  async () => {
    const response = await axios.get('http://localhost:5050/api/commission');
    return response.data.commission.platformCommission; // Return the platformCommission value
  }
);

// Async thunk to update the commission
export const updateCommission = createAsyncThunk(
  'commission/updateCommission',
  async (commissionValue) => {
    const response = await axios.put('http://localhost:5050/api/commission', {
      commissionValue,
    });
    return response.data.commission.platformCommission; // Return the updated platformCommission value
  }
);

const commissionSlice = createSlice({
  name: 'commission',
  initialState: {
    value: null,
    status: 'idle', // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch commission
      .addCase(fetchCommission.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCommission.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload;
      })
      .addCase(fetchCommission.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Update commission
      .addCase(updateCommission.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCommission.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.value = action.payload;
      })
      .addCase(updateCommission.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default commissionSlice.reducer;
