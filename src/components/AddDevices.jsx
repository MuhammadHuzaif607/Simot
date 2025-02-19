import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import { ToastContainer, toast } from "react-toastify"; // Import Toast components
import "react-toastify/dist/ReactToastify.css"; // Import CSS for Toast

const AddDevices = () => {
  const [formData, setFormData] = useState({
    deviceType: "", // Dropdown field for device type
    brand: "", // Input field for device brand
    model: "", // Input field for device model
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate();

  const [errors, setErrors] = useState({
    deviceType: "",
    brand: "",
    model: "",
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
    if (!formData.deviceType) newErrors.deviceType = "Device type is required.";
    if (!formData.brand) newErrors.brand = "Device brand is required.";
    if (!formData.model) newErrors.model = "Device model is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true); // Start loading when form is submitted
    console.log("Form data:", formData);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/devices`, formData);
      toast.success("Device added successfully!", {
        autoClose: 3000,
        hideProgressBar: true
      })
      setError(null);
      setSuccess(true);
      navigate("/devicesdata");
    } catch (err) {
      toast.error("Error adding device!", {
        autoClose: 3000,
        hideProgressBar: true
      })
      console.error("Error adding product:", err);
      setError("An error occurred while adding the product.");
      setSuccess(false);
    } finally {
      setLoading(false); // Stop loading after the request completes
    }
  };

  return (
    <div>
      <div className="w-full text-white text-lg mb-4 flex flex-row px-20 justify-between items-center">
        <h1 className="font-bold text-2xl">Device Management</h1>
        <div>
          <Link to="/devicesdata" className="button-color px-6 py-3 rounded-md">
            Go Back
          </Link>
        </div>
      </div>
      <div className="w-[90%] mx-auto mt-10 flex-col justify-center items-center">
        <form
          className="bg-[#0B0B0B] rounded-lg display flex flex-col gap-10 p-10 "
          onSubmit={handleSubmit}
        >
          <div className="flex justify-around">
            <div className="flex flex-col gap-10 w-full md:w-[70%]">
              <div className="text-white text-4xl text-center">
                <h1>Add Device</h1>
              </div>

              {/* Dropdown for Device Type */}
              <select
                className="shadow w-full appearance-none border rounded-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="deviceType"
                value={formData.deviceType}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              >
                <option value="">Select device type ↓</option>
                <option value="Mobile">Mobile</option>
                <option value="Laptop">Laptop</option>
                <option value="Tablet">Tablet</option>
              </select>
              {errors.deviceType && <p className="text-red-500">{errors.deviceType}</p>}

              {/* Input for Device Brand */}
              <input
                className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="brand"
                type="text"
                placeholder="Device Brand"
                value={formData.brand}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.brand && <p className="text-red-500">{errors.brand}</p>}

              {/* Input for Device Model */}
              <input
                className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="model"
                type="text"
                placeholder="Device Model"
                value={formData.model}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />

              {errors.model && <p className="text-red-500">{errors.model}</p>}

            </div>
          </div>

          {/* Error and Success Messages */}
          {/* {error && <p className="text-red-500 text-center">{error}</p>} */}
          {success && (
            <p className="text-green-500 text-center">
              Device added successfully!
            </p>
          )}

          {/* Submit Button with Loading Spinner */}
          <div className="flex items-center justify-center">
            <button
              className="w-[300px] hover:bg-gray-900 text-white font-bold py-4 px-4 rounded-full focus:outline-none focus:shadow-outline"
              type="submit"
              style={{ backgroundColor: "#0F9BEE" }}
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <Loading />
                  Subm...
                </div>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDevices;
