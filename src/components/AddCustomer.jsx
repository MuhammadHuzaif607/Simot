import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import Toast components
import "react-toastify/dist/ReactToastify.css"; // Import CSS for Toast

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    commission: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate();



  const [errors, setErrors] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    commission: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));


    // Reset error for the current field when user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [id]: "",
    }));
  };



  const validateForm = () => {
    const newErrors = {};

    // Validate each field
    if (!formData.customerName) newErrors.customerName = "Customer name is required.";
    if (!formData.customerEmail) newErrors.customerEmail = "Customer email is required.";
    if (!formData.customerPhone) newErrors.customerPhone = "Customer Phone Number is required.";
    if (!formData.commission) newErrors.commission = "Customer commission is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true); // Start loading when form is submitted

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/customers`,
        formData
      );
      console.log(formData);

      console.log("Response:", response.data);
      toast.success("Customer added successfully!", {
        autoClose: 3000,
        hideProgressBar: true
      }
      )
      setSuccess(true);
      setError(null);
      // Optionally navigate to another page
      navigate("/customerdata");
    } catch (err) {
      toast.error("Error adding customer!", {
        autoClose: 3000,
        hideProgressBar: true
      })
      console.error("Error adding customer:", err);
      setError("An error occurred while adding the customer.");
      setSuccess(false);
    } finally {
      setLoading(false); // Stop loading after request completes
    }
  };

  return (
    <div>
      <div className="w-full text-white text-lg mb-4 flex flex-row px-20 justify-between items-center">
        <h1 className="font-bold text-2xl">Customer Management</h1>
        <div>
          <Link
            to="/customerdata"
            className="button-color px-6 py-3 rounded-md"
          >
            Go Back
          </Link>
        </div>
      </div>
      <div className="w-[90%] ml-16 mt-10 flex-col justify-center items-center">
        <form
          className="bg-[#0B0B0B] rounded-lg display flex flex-col gap-10 p-10"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-around">
            <div className="flex flex-col gap-10 w-full md:w-[70%]">
              <div className="text-white text-4xl text-center">
                <h1>Add Customer</h1>
              </div>
              <input
                className="shadow w-full appearance-none border rounded-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="customerName"
                type="text"
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.customerName && <p className="text-red-500">{errors.customerName}</p>}

              <input
                className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="customerEmail"
                type="email"
                placeholder="Customer Email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.customerEmail && <p className="text-red-500">{errors.customerEmail}</p>}

              <input
                className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="commission"
                type="number"
                placeholder="Customer Commission %"
                value={formData.commission}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.commission && <p className="text-red-500">{errors.commission}</p>}

              <input
                className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="customerPhone"
                type="number"
                placeholder="Customer Phone No"
                value={formData.customerPhone}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.customerPhone && <p className="text-red-500">{errors.customerPhone}</p>}

            </div>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-center">
              Customer added successfully!
            </p>
          )}

          <div className="flex items-center justify-center">
            <button
              className="w-[300px] hover:bg-gray-900 text-white font-bold py-4 px-4 rounded-full focus:outline-none focus:shadow-outline"
              type="submit"
              style={{ backgroundColor: "#0F9BEE" }}
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <loading />
                  Submitting...
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
