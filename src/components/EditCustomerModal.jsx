import React, { useState } from "react";

const EditCustomerModal = ({
  isOpen,
  onClose,
  onSave,
  editData,
  setEditData,
}) => {
  const [loading, setLoading] = useState(false); // Track loading state for the save action

  const handleSaveClick = async () => {
    setLoading(true); // Start loading when the save button is clicked
    await onSave(); // Call the onSave function (passed as prop)
    setLoading(false); // End loading after save action completes
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-[#0B0B0B] rounded-lg p-10 w-1/3 shadow-lg">
        <h2 className="text-white text-4xl mb-4 text-center">Edit Customer</h2>
        <div className="mb-4">
          <label className="block text-white text-lg m-2">Customer Name:</label>
          <input
            className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
            type="text"
            value={editData.customerName}
            onChange={(e) =>
              setEditData({ ...editData, customerName: e.target.value })
            }
            style={{ borderColor: "#0F9BEE" }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-lg m-2">Email:</label>
          <input
            className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
            type="email"
            value={editData.customerEmail}
            onChange={(e) =>
              setEditData({ ...editData, customerEmail: e.target.value })
            }
            style={{ borderColor: "#0F9BEE" }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-lg m-2">Commission</label>
          <input
            className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
            type="number"
            value={editData.commission}
            onChange={(e) =>
              setEditData({ ...editData, commission: e.target.value })
            }
            style={{ borderColor: "#0F9BEE" }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-lg m-2">Phone:</label>
          <input
            className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
            type="number"
            value={editData.customerPhone}
            onChange={(e) =>
              setEditData({ ...editData, customerPhone: e.target.value })
            }
            style={{ borderColor: "#0F9BEE" }}
          />
        </div>
        <div className="flex justify-end mt-8">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded"
            onClick={handleSaveClick}
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <loading />
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

export default EditCustomerModal;
