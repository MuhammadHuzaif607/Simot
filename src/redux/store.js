import { configureStore } from '@reduxjs/toolkit';
import testDevicesReducer from './slices/testDevicesSlice';
import costTechnicalReducer from './slices/costTechnicalSlice';
import costMaterialReducer from './slices/costMaterialSlice';
import repairReducer from './slices/repairSlice';
import productsReducer from './slices/productSlice';
import paymentReducer from './slices/paymentSlice';
import commissionReducer from './slices/commissionSlice'; // Import the commission slice

const store = configureStore({
  reducer: {
    testDevices: testDevicesReducer,
    costTechnical: costTechnicalReducer,
    costMaterial: costMaterialReducer,
    repair: repairReducer,
    products: productsReducer,
    payments: paymentReducer,
    commission: commissionReducer,
  },
});

export default store;
