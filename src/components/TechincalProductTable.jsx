import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import DeviceModal from './DeviceModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMaterialCost,
  fetchRepairProduct,
  fetchTechnicianCost,
  selectDeivce,
} from '../redux/slices/repairSlice';

const TechnicalProductTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchImei, setSearchImei] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const dispatch = useDispatch();
  const {
    repairProduct,
  } = useSelector((state) => state.repair);

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchRepairProduct());
  }, []);

  // Filter products based on IMEI search
  useEffect(() => {
    if (repairProduct) {
      const filtered = repairProduct.filter((product) =>
        searchImei
          ? product.imei.toLowerCase().includes(searchImei.toLowerCase())
          : true
      );
      setFilteredProducts(filtered);
    }
  }, [searchImei, repairProduct]);

  const searchMaterialCost = async (model) => {
    try {
      dispatch(fetchMaterialCost(model));
      dispatch(fetchTechnicianCost(model));
      setIsModalOpen(true);
    } catch (error) {}
  };

  return (
    <div>
      <ToastContainer />
      {/* Modal for selecting replaced components */}
      {selectedDevice && (
        <DeviceModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDevice={selectedDevice}
        />
      )}
      {/* <div className="flex items-center justify-end ">
        <button className="bg-green-500 text-white p-2 px-4 mb-2 rounded-lg ">
          Export Stock
        </button>
      </div> */}
      <div className="flex justify-between items-center md:flex-row flex-col ">
        <div className="flex justify-left mb-4 gap-3">
          <input
            type="text"
            placeholder="Search IMEI..."
            onChange={(e) => setSearchImei(e.target.value)}
            value={searchImei}
            className="p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div className="p-2 bg-gray-700 text-white rounded-lg">
          Total unit = {filteredProducts.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2">Device Type</th>
              <th className="px-4 py-2">Condition</th>
              <th className="px-4 py-2">Grade</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Model</th>
              <th className="px-4 py-2">Color</th>
              <th className="px-4 py-2">Memory</th>
              <th className="px-4 py-2">Info</th>
              <th className="px-4 py-2">IMEI</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">ReRepair Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-4 text-white">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  onClick={() => {
                    dispatch(selectDeivce(product.imei));
                    searchMaterialCost(product.deviceModel);
                  }}
                  className="bg-blue-500 text-white border-b border-gray-300 hover:bg-blue-600 cursor-pointer"
                >
                  <td className="px-4 py-2">{product.deviceType}</td>
                  <td className="px-4 py-2">{product.condition}</td>
                  <td className="px-4 py-2">{product.grade}</td>
                  <td className="px-4 py-2">{product.deviceBrand}</td>
                  <td className="px-4 py-2">{product.deviceModel}</td>
                  <td className="px-4 py-2">{product.deviceColor}</td>
                  <td className="px-4 py-2">{product.memory}</td>
                  <td className="px-4 py-2">{product.info || 'No Info'}</td>
                  <td className="px-4 py-2">{product.imei}</td>
                  <td className="px-4 py-2">
                    {new Date(product.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {product?.repairInfo?.reRepairInfo || 'No ReRepair'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnicalProductTable;
