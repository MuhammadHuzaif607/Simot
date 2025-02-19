import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "./Loading";
import ProductsModal from "./ProductsModal";

const SalesStatusData = () => {
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedTotalPrice, setSelectedTotalPrice] = useState(0);
  const [userRole, setUserRole] = useState("");
  const [returnDetails, setReturnDetails] = useState({
    platform: "",
    reason: "",
  });
  const [showReturnModal, setShowReturnModal] = useState({
    show: false,
    saleId: null,
    index: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReturnDetails((prev) => ({ ...prev, [name]: value }));
  };
  // Retrieve user role from local storage
  const getUserRole = () => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const role = userData.user.role;
        setUserRole(role);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    } else {
      console.error("No user data found in localStorage");
    }
  };
  const fetchSalesHistory = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/sales`
      );
      console.log(data);
      
      setSalesHistory(data || []);
    } catch (error) {
      setError("Failed to fetch sales history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserRole();
    fetchSalesHistory();
  }, []);

  const handleStatusChange = async (saleId, index, newStatus) => {
    if (newStatus === "returned") {
      // Open a modal to collect return details
      setReturnDetails({ platform: "", reason: "" }); // Reset return details
      setShowReturnModal({ show: true, saleId, index }); // Save current saleId and index
      return;
    }
    // Show a confirmation dialog before changing the status
    const confirmChange = window.confirm(
      `Are you sure you want to change the status to "${newStatus}"?`
    );
    if (!confirmChange) return; // Exit if the user cancels the action

    try {
      setStatusLoading(saleId);

      const { status } = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/sales/${saleId}`,
        { status: newStatus }
      );

      if (status === 200) {
        const updatedHistory = [...salesHistory];
        updatedHistory[index].status = newStatus;
        setSalesHistory(updatedHistory);
      } else {
        setError("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Error updating status");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = async (saleId, index) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        setDeleteLoading(saleId);

        const { status } = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/sales/delete`,
          {
            data: { ids: [saleId] },
          }
        );

        if (status === 200) {
          const updatedHistory = salesHistory.filter((_, i) => i !== index);
          setSalesHistory(updatedHistory);
        } else {
          setError("Failed to delete the sale");
        }
      } catch (error) {
        console.error("Error deleting sale:", error);
        setError("Error deleting sale");
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleReturnSubmit = async () => {
    const { saleId, index } = showReturnModal;

    if (!returnDetails.platform || !returnDetails.reason) {
      alert("Please fill in all return details.");
      return;
    }

    try {
      setStatusLoading(saleId);

      const { status } = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/sales/${saleId}`,
        {
          status: "returned",
          returnDetails,
        }
      );

      if (status === 200) {
        const updatedHistory = [...salesHistory];
        updatedHistory[index].status = "returned";
        setSalesHistory(updatedHistory);
        setShowReturnModal({ show: false, saleId: null, index: null }); // Close modal
      } else {
        setError("Failed to update status");
      }
    } catch (error) {
      console.error("Error submitting return details:", error);
      setError("Error submitting return details");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleViewProducts = (products, totalPrice) => {
    setSelectedProducts(products);
    setSelectedTotalPrice(totalPrice);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const filteredSalesHistory = salesHistory.filter((sale) => {
    const imeiList = sale.products.map((product) => product.imei).join(" ");
    return (
      sale.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
      sale.shipmentNumber.toLowerCase().includes(filterText.toLowerCase()) ||
      sale.time.toLowerCase().includes(filterText.toLowerCase()) ||
      imeiList.toLowerCase().includes(filterText.toLowerCase()) ||
      sale.status.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  if (loading) return <Loading />;

  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="w-full p-4 text-white">
      <div className="flex justify-center p-4">
        <h1 className="text-4xl text-center">Sales Status</h1>
      </div>

      <div className="flex justify-left mb-4">
        <input
          type="text"
          placeholder="Search"
          className="p-2 rounded bg-gray-700 text-white"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <div className="w-full h-[600px] overflow-x-auto overflow-y-auto">
        <table className="w-full text-center table-fixed min-w-[600px]">
          <thead className="bg-[#393b63]">
            <tr>
              <th className="w-1/5 py-2 px-2 text-white">Customer Name</th>
              <th className="w-1/5 py-2 px-2 text-white">Shipment No</th>
              <th className="w-1/5 py-2 px-2 text-white">Date & Time</th>
              <th className="w-1/5 py-2 px-2 text-white">IMEI</th>
              <th className="w-1/5 py-2 px-2 text-white">Status</th>
              <th className="w-1/5 py-2 px-2 text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalesHistory.length > 0 ? (
              filteredSalesHistory.map((sale, index) => (
                <tr className="bg-[#0f9bee]" key={sale._id}>
                  <td className="py-2 px-2">{sale.customerName}</td>
                  <td className="py-2 px-2">{sale.shipmentNumber}</td>
                  <td className="py-2 px-2">{new Date(sale.time).toLocaleDateString()}</td>
                  <td className="py-2 px-2">
                    {sale.products &&
                      sale.products.map((product, i) => (
                        <div key={i} className="py-2 px-2">
                          {product.imei}
                        </div>
                      ))}
                  </td>
                  <td className="py-2 px-2">
                    <select
                      className="bg-black border border-gray-600 rounded text-white p-1"
                      value={sale.status}
                      onChange={(e) =>
                        handleStatusChange(sale._id, index, e.target.value)
                      }
                      disabled={statusLoading === sale._id}
                    >
                      {/* <option value="pending">Pending</option> */}
                      {/* <option value="shipped">Shipped</option> */}
                      <option value="delivered">Delivered</option>
                      <option value="returned">Returned</option>
                    </select>

                    {statusLoading === sale._id && <span>Updating...</span>}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                        onClick={() =>
                          handleViewProducts(sale, sale.totalPrice)
                        }
                      >
                        View
                      </button>
                      {userRole === "superadmin" && (
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
                          onClick={() => handleDelete(sale._id, index)}
                          disabled={deleteLoading === sale._id}
                        >
                          {deleteLoading === sale._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-white">
                  No Sales Status Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductsModal
          products={selectedProducts}
          totalPrice={selectedTotalPrice}
          onClose={handleCloseModal}
        />
      )}

      {showReturnModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4 text-black">Return Details</h2>
            <input
              type="text"
              name="platform"
              placeholder="Platform"
              value={returnDetails.platform}
              onChange={handleInputChange}
              className="w-full mb-3 p-2 border rounded text-black"
            />
            <input
              type="text"
              name="reason"
              placeholder="Reason"
              value={returnDetails.reason}
              onChange={handleInputChange}
              className="w-full mb-3 p-2 border rounded text-black"
            />
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={() =>
                  setShowReturnModal({ show: false, saleId: null, index: null })
                }
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded"
                onClick={handleReturnSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesStatusData;
