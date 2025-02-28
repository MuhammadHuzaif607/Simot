import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import { ToastContainer, toast } from "react-toastify"; // Import Toast components
import "react-toastify/dist/ReactToastify.css"; // Import CSS for Toast

const AddUser = () => {
  const [formData, setFormData] = useState({
    employeename: "",
    employeeemail: "",
    employeepassword: "",
    role : ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const navigate = useNavigate();

  const [errors, setErrors] = useState({
    employeename: "",
    employeeemail: "",
    employeepassword: "",
    role : "",
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
    if (!formData.employeename) newErrors.employeename = "Employee name is required.";
    if (!formData.employeeemail) newErrors.employeeemail = "Employee email is required.";
    if (!formData.employeepassword) newErrors.employeepassword = "Employee password is required.";
    if (!formData.role) newErrors.role = "Employee role is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true); // Set loading to true when the form is submitted

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/addemploye`, {
        name: formData.employeename,
        email: formData.employeeemail,
        password: formData.employeepassword,
        role: formData?.role, // or any other role you want to assign
      });

      console.log("Response:", response.data);

      toast.success("Employee added successfully!", {
        autoClose: 3000,
        hideProgressBar: true
      })
      setSuccess(true);
      setError(null);
      setLoading(false); // Set loading to false after successful submission
      navigate("/user");
    } catch (err) {
      toast.error("Error adding employee!", {
        autoClose: 3000,
        hideProgressBar: true
      })
      console.error("Error adding employee:", err);
      setError("An error occurred while adding the employee.");
      setSuccess(false);
      setLoading(false); // Set loading to false if there is an error
    }
  };

  return (
    <div>
      <div className="w-full text-white text-lg mb-4 flex flex-row px-20 justify-between items-center">
        <h1 className="font-bold text-2xl">Team Management</h1>
        <div>
          <Link to="/user" className="button-color px-6 py-3 rounded-md">
            Go Back
          </Link>
        </div>
      </div>
      <div className="w-[90%] 2xl:min-h-[600px] xl:min-h-[500px] mx-auto mt-10 mb-10  flex-col justify-center items-center">
        <form
          className="bg-[#0B0B0B] rounded-lg display flex flex-col  gap-10 p-10"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-around">
            <div className="flex flex-col gap-10 w-full md:w-[70%]">
              <div className="text-white text-4xl text-center">
                <h1> Employee Management </h1>
              </div>
              <input
                className="shadow w-full appearance-none border rounded-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="employeename"
                type="text"
                placeholder="Employee Name"
                value={formData.employeename}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.employeename && <p className="text-red-500">{errors.employeename}</p>}
              <input
                className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="employeeemail"
                type="email"
                placeholder="Employee Email"
                value={formData.employeeemail}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.employeeemail && <p className="text-red-500">{errors.employeeemail}</p>}

              <input
                className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="employeepassword"
                type="password"
                placeholder="Employee Password"
                value={formData.employeepassword}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.employeepassword && <p className="text-red-500">{errors.employeepassword}</p>}
             


             <select className="shadow appearance-none border rounded-full w-full py-4 px-6 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]" onChange={handleInputChange} name="" id="role">
              <option value="admin">Admin</option>
              <option value="technical">Technical</option>
             </select>
              {errors.role && <p className="text-red-500">{errors.role}</p>}

            </div>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-center">
              Employee added successfully!
            </p>
          )}

          <div className="flex items-center justify-center">
            <button
              className="w-[300px] hover:bg-gray-900 text-white font-bold py-4 px-4 rounded-full focus:outline-none focus:shadow-outline"
              type="submit"
              style={{ backgroundColor: "#0F9BEE" }}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <Loading />
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

export default AddUser;
