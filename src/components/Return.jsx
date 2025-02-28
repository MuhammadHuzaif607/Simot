import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "./Loading";
import ProductsModal from "./ProductsModal";

const Return = () => {
  const [returnData, setReturnData] = useState([]);
  const [returnDataHistory, setReturnDataHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [selectedTotalPrice, setSelectedTotalPrice] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [checkHistory, setCheckHistory] = useState("return");
  const [userRole, setUserRole] = useState("");

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

  const fetchReturnData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/sales`
      );
      const filteredData = data.filter((item) => (item.status === "returned"));
      setReturnData(filteredData || []); // Set to an empty array if no data is returned
    } catch (error) {
      setError("Failed to fetch return data. Please try again.");
    } finally {
      setLoading(false); // Loading completed, regardless of success or failure
    }
  };
  const fetchReturnHistory = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products/return`
      );
      const filteredData = data.filter((item) => (item.status === "returned"));
      setReturnDataHistory(filteredData || []); // Set to an empty array if no data is returned
    } catch (error) {
      setError("Failed to fetch return data. Please try again.");
    } finally {
      setLoading(false); // Loading completed, regardless of success or failure
    }
  };
  // Fetch returned data from the API
  useEffect(() => {
    getUserRole();
    fetchReturnData();
    fetchReturnHistory();
  }, [checkHistory]);

  // Handle deletion of a return item
  const handleDelete = async (saleId, index) => {
    try {

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/products/create-return`, {
        id : saleId
      })

      // return

      const { status } = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/sales/delete`,
        {
          data: { ids: [saleId] },
        }
      );

      if (status === 200) {
        // Remove the deleted item from the local state
        const updatedReturnData = returnData.filter((_, i) => i !== index);
        setReturnData(updatedReturnData);
      } else {
        setError("Failed to delete the item.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Error deleting item.");
    }
  };

  // Open the modal with selected return item details
  const handleViewClick = (products, totalPrice) => {
    setSelectedReturnItem(products);
    setSelectedTotalPrice(totalPrice);
    setIsModalOpen(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReturnItem(null);
    setSelectedTotalPrice(null);
  };

  // Capitalize the first letter of a string
  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  // Filter returned data based on the filter text and include only 'returned' status
  const filteredReturnDataHistory = returnDataHistory
    .filter((item) => item.status.toLowerCase() === "returned")
    .filter((item) => {
      const lowerCaseFilter = filterText.toLowerCase();
      const hasIMEIMatch = item.products.some((product) =>
        product.imei.toLowerCase().includes(lowerCaseFilter)
      );
      return (
        item.customerName.toLowerCase().includes(lowerCaseFilter) ||
        item.shipmentNumber.toLowerCase().includes(lowerCaseFilter) ||
        item.time.toLowerCase().includes(lowerCaseFilter) ||
        item.totalPrice.toString().includes(lowerCaseFilter) ||
        item.status.toLowerCase().includes(lowerCaseFilter) ||
        hasIMEIMatch
      );
    });
  const filteredReturnData = returnData
    .filter((item) => item.status.toLowerCase() === "returned")
    .filter((item) => {
      const lowerCaseFilter = filterText.toLowerCase();
      const hasIMEIMatch = item.products.some((product) =>
        product.imei.toLowerCase().includes(lowerCaseFilter)
      );
      return (
        item.customerName.toLowerCase().includes(lowerCaseFilter) ||
        item.shipmentNumber.toLowerCase().includes(lowerCaseFilter) ||
        item.time.toLowerCase().includes(lowerCaseFilter) ||
        item.totalPrice.toString().includes(lowerCaseFilter) ||
        item.status.toLowerCase().includes(lowerCaseFilter) ||
        hasIMEIMatch
      );
    });

  const handleReturn = async (saleId, index) => {
    try {
      setDeleteLoading(saleId);
      const products = returnData[index].products;
      for (let product of products) {
        product["deviceBrand"] = product["brand"];
        product["deviceColor"] = product["color"];
        product["deviceModel"] = product["model"];
        product["price"] = product["productPrice"];
        product["status"] = "Ready for Sale";
        console.log(product);
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/products/createproducts`,
          product
        );
      }
      await handleDelete(saleId, index);
      setError(null);
      setDeleteLoading(null);
    } catch (error) {
      console.error("Error returning item:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full p-4 text-white">
      <div className="flex justify-center p-4">
        <h1 className="text-4xl text-center">Returned Items</h1>
      </div>

      <div className="flex  items-center justify-between gap-2">


      {/* Filter input */}
      <div className="flex justify-left mb-4">
        <input
          type="text"
          placeholder="Search"
          className="p-2 rounded bg-gray-700 text-white"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <div>
        <select onChange={(e)=>setCheckHistory(e.target.value)} className="bg-gray-800 p-2 rounded-md" name="" id="">
          <option value="return">Return</option>
          <option value="return-history">Return Histroy</option>
        </select>
      </div>

      </div>


      {/* Display error message if there's an error */}
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

     {checkHistory === "return" && <div className="w-full overflow-x-auto">
        <table className="w-full text-center table-fixed min-w-[1200px]">
          <thead className="bg-[#393b63]">
            <tr>
              <th className="w-2/12 py-2 px-4 text-white">Customer Name</th>
              <th className="w-2/12 py-2 px-4 text-white">Shipment No</th>
              <th className="w-3/12 py-2 px-4 text-white">IMEI</th>
              <th className="w-2/12 py-2 px-4 text-white">Date & Time</th>
              <th className="w-2/12 py-2 px-4 text-white">Total Bill</th>
              <th className="w-2/12 py-2 px-4 text-white">Plateform</th>
              <th className="w-2/12 py-2 px-4 text-white">Reason</th>
              <th className="w-2/12 py-2 px-4 text-white">Status</th>
              <th className="w-2/12 py-2 px-4 text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturnData.length > 0 ? (
              filteredReturnData.map((item, index) => (
                <tr className="bg-[#0f9bee]" key={item._id || index}>
                  <td className="py-2 px-4 break-words">{item.customerName}</td>
                  <td className="py-2 px-4 break-words">
                    {item.shipmentNumber}
                  </td>
                  <td className="py-2 px-4">
                    {item.products.length === 1 ? (
                      <span>{item.products[0].imei}</span>
                    ) : (
                      <select className="bg-gray-700 text-white">
                        {item.products.map((product, i) => (
                          <option key={i} value={product.imei}>
                            {product.imei}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(item.time).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">€{item.totalPrice}</td>
                  <td className="py-2 px-4">{item.returnDetails.platform}</td>
                  <td className="py-2 px-4">{item.returnDetails.reason}</td>
                  <td className="py-2 px-4">{capitalize(item.status)}</td>
                  <td className="py-2 px-4">
                    <div className="flex justify-center gap-2 wrap">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
                        onClick={() =>
                          handleViewClick(item.products, item.totalPrice)
                        }
                      >
                        View
                      </button>
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded me-3"
                        onClick={() => handleReturn(item._id, index)}
                        disabled={deleteLoading === item._id}
                      >
                        {deleteLoading === item._id ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-4 text-white">
                  No Returned Items Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}

      {checkHistory === "return-history" &&
        <div className="w-full overflow-x-auto">
        <table className="w-full text-center table-fixed min-w-[1200px]">
          <thead className="bg-[#393b63]">
            <tr>
              <th className="w-2/12 py-2 px-4 text-white">Customer Name</th>
              <th className="w-2/12 py-2 px-4 text-white">Shipment No</th>
              <th className="w-3/12 py-2 px-4 text-white">IMEI</th>
              <th className="w-2/12 py-2 px-4 text-white">Date & Time</th>
              <th className="w-2/12 py-2 px-4 text-white">Total Bill</th>
              <th className="w-2/12 py-2 px-4 text-white">Plateform</th>
              <th className="w-2/12 py-2 px-4 text-white">Reason</th>
              {/* <th className="w-2/12 py-2 px-4 text-white">Status</th> */}
              {/* <th className="w-2/12 py-2 px-4 text-white">Action</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredReturnDataHistory.length > 0 ? (
              filteredReturnDataHistory.map((item, index) => (
                <tr className="bg-[#0f9bee]" key={item._id || index}>
                  <td className="py-2 px-4 break-words">{item.customerName}</td>
                  <td className="py-2 px-4 break-words">
                    {item.shipmentNumber}
                  </td>
                  <td className="py-2 px-4">
                    {item.products.length === 1 ? (
                      <span>{item.products[0].imei}</span>
                    ) : (
                      <select className="bg-gray-700 text-white">
                        {item.products.map((product, i) => (
                          <option key={i} value={product.imei}>
                            {product.imei}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(item.time).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">€{item.totalPrice}</td>
                  <td className="py-2 px-4">{item.returnDetails.platform}</td>
                  <td className="py-2 px-4">{item.returnDetails.reason}</td>
                  {/* <td className="py-2 px-4">{capitalize(item.status)}</td>
                  <td className="py-2 px-4">
                    <div className="flex justify-center gap-2 wrap">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
                        onClick={() =>
                          handleViewClick(item.products, item.totalPrice)
                        }
                      >
                        View
                      </button>
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded me-3"
                        onClick={() => handleReturn(item._id, index)}
                        disabled={deleteLoading === item._id}
                      >
                        {deleteLoading === item._id ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-4 text-white">
                  No Returned Items Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      }

      {/* Modal for viewing return item details */}
      {isModalOpen && selectedReturnItem && (
        <ProductsModal
          products={selectedReturnItem}
          totalPrice={selectedTotalPrice}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Return;
