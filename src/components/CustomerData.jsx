import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import EditCustomerModal from "./EditCustomerModal";
import Loading from "./Loading";

const CustomerData = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null); // Track which customer is being deleted
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    _id: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    commission: "",
  });
  const [filterText, setFilterText] = useState(""); // State for filter input

  // Fetch all customers from the API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/customers`
        ); // Replace with your API endpoint
        setCustomers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleDelete = async (customerId) => {
    setLoadingDeleteId(customerId); // Set loading state for the delete action
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/customers/${customerId}`
      ); // Replace with your API endpoint
      setCustomers(customers.filter((customer) => customer._id !== customerId));
      setLoadingDeleteId(null); // Reset loading state after successful deletion
    } catch (error) {
      console.error("Error deleting customer:", error);
      setLoadingDeleteId(null); // Reset loading state in case of error
    }
  };

  const handleEditClick = (customer) => {
    setEditData({
      _id: customer._id,
      customerName: customer.customerName,
      customerEmail: customer.customerEmail,
      customerPhone: customer.customerPhone,
      commission: customer.commission,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditData({
      _id: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      commission: "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/customers/${editData._id}`,
        {
          customerName: editData.customerName,
          customerEmail: editData.customerEmail,
          customerPhone: editData.customerPhone,
          commission: editData.commission,
        }
      ); // Update customer API

      setCustomers(
        customers.map((customer) =>
          customer._id === editData._id
            ? { ...customer, ...editData }
            : customer
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  // Filter customers based on filterText
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
      customer.customerEmail.toLowerCase().includes(filterText.toLowerCase()) ||
      customer.customerPhone.toLowerCase().includes(filterText.toLowerCase()) ||
      customer.commission.toString().includes(filterText.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between p-4 text-white">
        <h1 className="text-3xl">Customers Page</h1>
        <Link to="/addcustomer" className="button-color px-4 py-2 rounded-md">
          Add Customer
        </Link>
      </div>

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

      <div className="w-full h-[600px] overflow-y-auto">
        <table className="w-full h-90 text-center overflow-auto table-fixed   min-w-[600px]">
          <thead className="bg-[#393b63]">
            <tr>
              <th className="w-1/4 py-2 px-2 text-white">Name</th>
              <th className="w-1/4 py-2 text-white">Email</th>
              <th className="w-1/4 py-2 text-white">Phone</th>
              <th className="w-1/4 py-2 text-white">Commission %</th>
              <th className="w-1/6 py-2 text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr className="bg-[#0f9bee]" key={customer._id}>
                  <td className="py-2 px-2">{customer.customerName}</td>
                  <td className="py-2 px-2">{customer.customerEmail}</td>
                  <td className="py-2 px-2">{customer.customerPhone}</td>
                  <td className="py-2 px-2">{customer.commission || 10}</td>
                  <td className="flex-row justify-between space-y-1 sm:flex-col">
                    <button
                      className="w-20 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded"
                      onClick={() => handleEditClick(customer)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
                      className="w-20 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                      disabled={loadingDeleteId === customer._id} // Disable button during delete action
                    >
                      {loadingDeleteId === customer._id ? (
                        <div className="flex justify-center items-center">
                          <Loading />
                          Del...
                        </div>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4">
                  No Customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditCustomerModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveChanges}
        editData={editData}
        setEditData={setEditData}
      />
    </div>
  );
};

export default CustomerData;
