import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Async Thunks for Cost Technical
export const fetchCostTechnical = createAsyncThunk(
    'costTechnical/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/cost-technical`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch data');
        }
    }
);

export const addCostTechnical = createAsyncThunk(
    'costTechnical/add',
    async (newEntry, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/cost-technical`, newEntry);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to add data');
        }
    }
);

export const updateCostTechnical = createAsyncThunk(
    'costTechnical/update',
    async ({ id, updatedEntry }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/api/cost-technical/${id}`, updatedEntry);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update data');
        }
    }
);

export const deleteCostTechnical = createAsyncThunk(
    'costTechnical/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/api/cost-technical/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete data');
        }
    }
);

const costTechnicalSlice = createSlice({
    name: 'costTechnical',
    initialState: { items: [], status: 'idle', error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCostTechnical.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCostTechnical.fulfilled, (state, action) => {
                state.items = action.payload;
                state.status = 'succeeded';
            })
            .addCase(fetchCostTechnical.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Add
            .addCase(addCostTechnical.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addCostTechnical.fulfilled, (state, action) => {
                state.items.push(action.payload);
                state.status = 'succeeded';
            })
            .addCase(addCostTechnical.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update
            .addCase(updateCostTechnical.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateCostTechnical.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.status = 'succeeded';
            })
            .addCase(updateCostTechnical.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteCostTechnical.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteCostTechnical.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item._id !== action.payload);
                state.status = 'succeeded';
            })
            .addCase(deleteCostTechnical.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default costTechnicalSlice.reducer;
