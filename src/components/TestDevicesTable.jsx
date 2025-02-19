import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { fetchProducts } from "../redux/slices/testDevicesSlice";
import { updateProductStatus, updateProductStatusNGrade } from "../redux/slices/productSlice";

const TestDevicesTable = () => {
  const dispatch = useDispatch();
  const { devices, status, error } = useSelector((state) => state.testDevices);
  const [filterText, setFilterText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [info, setInfo]= useState("")
  const [color, setColor]= useState("")

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = devices.filter((product) =>
    Object.values(product).some((value) =>
      value?.toString().toLowerCase().includes(filterText.toLowerCase())
    )
  );

  // Open Confirm Grade Modal
  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    console.log(product)
  };

  // Close Confirm Grade Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGrade("");
    setSelectedProduct(null);
  };

  // Open Reason Modal for "Send Back"
  const openReasonModal = (product) => {
    setSelectedProduct(product);
    setIsReasonModalOpen(true);
  };

  // Close Reason Modal
  const closeReasonModal = () => {
    setIsReasonModalOpen(false);
    setSelectedReason("");
    setCustomReason("");
    setSelectedProduct(null);
  };

  // Confirm Grade Selection
  const confirmGrade = async () => {
    if (!selectedGrade) {
      toast.error("Please select a grade before confirming!");
      return;
    }

    setLoadingAction(true);
    try {
      await dispatch(
        updateProductStatusNGrade({
          id: selectedProduct._id,
          data: { status: "Ready for Sale", grade: selectedGrade ,color: color || null,
            info: info || null, },
        })
      ).unwrap();

      dispatch(fetchProducts());
      toast.success(`Confirmed Grade: ${selectedGrade} for ${selectedProduct.deviceModel}`);
      closeModal();
    } catch (err) {
      toast.error("Failed to confirm grade");
    } finally {
      setLoadingAction(false);
    }
  };

  // Send Back for Repair
  const handleBack = async () => {
    if (!selectedReason && !customReason) {
      toast.error("Please select or enter a reason before confirming!");
      return;
    }

    setLoadingAction(true);
    try {
      await dispatch(
        updateProductStatus({
          id: selectedProduct._id,
          status: "To Be Repaired",
          reason: customReason || selectedReason,
        })
      ).unwrap();

      dispatch(fetchProducts());
      toast.success("Product sent back for repair");
      closeReasonModal();
    } catch (err) {
      toast.error("Failed to send back product");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="py-2">
      <ToastContainer />

      {/* Search Input */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search Products..."
          className="p-2 rounded bg-gray-700 text-white"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <table className="w-full text-center text-white mt-4">
        <thead className="bg-[#393b63]">
          <tr>
            <th>Brand</th>
            <th>Model</th>
            <th>Color</th>
            <th>Memory</th>
            <th>IMEI</th>
            <th>Price</th>
            <th>After Repair Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product._id} className="bg-[#0f9bee]">
                <td>{product.deviceBrand}</td>
                <td>{product.deviceModel}</td>
                <td>{product.deviceColor}</td>
                <td>{product.memory}</td>
                <td>{product.imei}</td>
                <td>€{product.price}</td>
                <td>€{product.price + product?.repairInfo?.totalCost}</td>
                <td>{product.status}</td>
                <td className="flex gap-3 justify-center p-1">
                  <button
                    className="bg-green-500 p-1 rounded-md"
                    onClick={() => openModal(product)}
                  >
                    {loadingAction ? "Processing..." : "Confirm"}
                  </button>
                  <button
                    className="bg-red-500 p-1 rounded-md"
                    onClick={() => openReasonModal(product)}
                    disabled={loadingAction}
                  >
                    {loadingAction ? "Processing..." : "Send Back"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="py-4 text-center">
                No devices found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Reason Modal */}
      {isReasonModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-3 text-black">
              Select a reason for sending {selectedProduct?.deviceModel} back
            </h2>

            {/* Dropdown for Predefined Reasons */}
            <select
              className="w-full p-2 border rounded-md mb-4"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              <option value="">Select a Reason</option>
              <option value="Defective Part">Defective Part</option>
              <option value="Not Repairable">Not Repairable</option>
              <option value="Incorrect Diagnosis">Incorrect Diagnosis</option>
              <option value="Other">Other (Specify Below)</option>
            </select>

            {/* Custom Reason Input */}
            {selectedReason === "Other" && (
              <input
                type="text"
                className="w-full p-2 border rounded-md mb-4"
                placeholder="Enter custom reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white p-2 rounded-md"
                onClick={closeReasonModal}
                disabled={loadingAction}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white p-2 rounded-md"
                onClick={handleBack}
                disabled={loadingAction}
              >
                {loadingAction ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-3 text-black">
              Confirmation Info for {selectedProduct?.deviceModel}
            </h2>

            {/* Grade Dropdown (Required) */}
            <label className="block text-black mb-1">GRADE</label>
            <select
              className="w-full p-2 border rounded-md mb-4"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              required
            >
              <option value="">Select Grade</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>

            {/* Color Input (Optional) */}
            <label className="block text-black mb-1">COLOR</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Enter Color (Optional)..."
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />

            {/* Info Input (Optional) */}
            <label className="block text-black mb-1">INFO</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Enter Info (Optional)..."
              value={info}
              onChange={(e) => setInfo(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white p-2 rounded-md"
                onClick={closeModal}
                disabled={loadingAction}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white p-2 rounded-md"
                onClick={confirmGrade}
                disabled={loadingAction}
              >
                {loadingAction ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TestDevicesTable;
