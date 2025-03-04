import { useState } from "react";
import Loading from "./Loading";

const EditUserModal = ({ isOpen, onClose, onSave, editData, setEditData }) => {
  const [loading, setLoading] = useState(false); // Track loading state

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true); // Set loading to true when save operation starts
    await onSave();   // Wait for the save operation to complete
    setLoading(false); // Reset loading to false once the operation is done
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#0B0B0B] rounded-lg p-10 w-1/3 shadow-lg">
        <h2 className="text-white text-4xl mb-4 text-center">Edit User</h2>
        <div className="mb-4">
          <label className="block text-white text-lg m-2">User Name:</label>
          <input
            className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
            type="text"
            value={editData.userName}
            onChange={(e) => setEditData({ ...editData, userName: e.target.value })}
            style={{ borderColor: "#0F9BEE" }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-lg m-2">Email:</label>
          <input
            className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
            type="email"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            style={{ borderColor: "#0F9BEE" }}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-lg m-2">Role:</label>
          <select
            className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
            value={editData.role}
            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
            style={{ borderColor: "#0F9BEE" }}
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
            <option value="technical">Technician</option>
          </select>
        </div>
        <div className="flex justify-end mt-8">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded mr-2"
            onClick={onClose}
            disabled={loading} // Disable button while saving
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded"
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

export default EditUserModal;
