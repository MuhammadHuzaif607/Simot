import React, { useState } from "react";
import Loading from "./Loading";

const EditStockModal = ({
  isOpen,
  onClose,
  onSave,
  editData,
  setEditData
}) => {
  const [loading, setLoading] = useState(false); // Track loading state

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true); // Set loading to true when save operation starts
    await onSave();   // Wait for the save operation to complete
    setLoading(false); // Reset loading to false once the operation is done
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-[#0B0B0B] rounded-lg p-6 w-2/5 shadow-lg">
        <h2 className="text-white text-3xl mb-4 text-center m-2">Edit Stock</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* First column with 5 input fields */}
          <div>
            <div className="mb-3">
              <label className="block text-white text-lg m-2">Device Type:</label>
              <select
                className="shadow w-full appearance-none border rounded-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                value={editData.deviceType}
                onChange={(e) => setEditData({ ...editData, deviceType: e.target.value })}
                style={{ borderColor: "#0F9BEE" }}
              >
                <option value="">Select device type ↓</option>
                <option value="Mobile">Mobile</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-white text-lg m-2">Device Model:</label>
              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                type="text"
                value={editData.deviceModel}
                onChange={(e) => setEditData({ ...editData, deviceModel: e.target.value })}
                style={{ borderColor: "#0F9BEE" }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-white text-lg m-2">Condition:</label>
              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                type="text"
                value={editData.condition}
                onChange={(e) => setEditData({ ...editData, condition: e.target.value })}
                style={{ borderColor: "#0F9BEE" }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-white text-lg m-2">Price:</label>
              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                type="number"
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                style={{ borderColor: "#0F9BEE" }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-white text-lg m-2">Grade:</label>
              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                type="text"
                value={editData.grade}
                onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                style={{ borderColor: "#0F9BEE" }}
              />
            </div>
          </div>
          
          {/* Second column with 5 input fields */}
          <div>
            <div className="mb-3">
              <label className="block text-white text-lg m-2">Device Brand:</label>
              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                type="text"
                value={editData.deviceBrand}
                onChange={(e) => setEditData({ ...editData, deviceBrand: e.target.value })}
                style={{ borderColor: "#0F9BEE" }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-white text-lg m-2">Device Color:</label>
              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                type="text"
                value={editData.deviceColor}
                onChange={(e) => setEditData({ ...editData, deviceColor: e.target.value })}
                style={{ borderColor: "#0F9BEE" }}
              />
            </div>
            <div className="mb-3">
              <label className="block text-white text-lg m-2">Memory:</label>
              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                type="text"
                value={editData.memory}
                onChange={(e) => setEditData({ ...editData, memory: e.target.value })}
                style={{ borderColor: "#0F9BEE" }}
              />
            </div>
            {/* Conditionally render IMEI field */}
            {(
              <div className="mb-3">
                <label className="block text-white text-lg m-2">IMEI:</label>
                <input
                  className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                  type="text"
                  value={editData.imei}
                  onChange={(e) => setEditData({ ...editData, imei: e.target.value })}
                  style={{ borderColor: "#0F9BEE" }}
                />
              </div>
            )}
            {(
              <div className="mb-3">
                <label className="block text-white text-lg m-2">INFO:</label>
                <input
                  className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                  type="text"
                  value={editData.info}
                  onChange={(e) => setEditData({ ...editData, info: e.target.value })}
                  style={{ borderColor: "#0F9BEE" }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-5 rounded mr-2"
            onClick={onClose}
            disabled={loading} // Disable button while saving
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded"
            onClick={handleSave}
            disabled={loading} // Disable button while saving
          >
            {loading ? (
              <div className="flex justify-center items-center">
               <Loading/>
                Saving...
              </div>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStockModal;
