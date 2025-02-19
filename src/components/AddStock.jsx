import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import Toast components
import "react-toastify/dist/ReactToastify.css"; // Import CSS for Toast


const AddStock = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [errors, setErrors] = useState({
    deviceType: "",
    deviceBrand: "",
    deviceModel: "",
    condition: "",
    grade: "",
    price: "",
    deviceColor: "",
    memory: "",
    info: "",
    imei: "",
    status: "",
  });
  const navigate = useNavigate();

  const conditions = ["R", "USATO", "NUOVO", "NO POWER"];
  const grades = [" A+", " A", " B", " C", " D", " E"];
  const storageOptions = [
    "32 GB",
    "64 GB",
    "128 GB",
    "256 GB",
    "512 GB",
    "1 TB",
  ];
  const colors = [
    "NERO",
    "BIANCO",
    "ROSSO",
    "VIOLA",
    "GRIGGIO / ARGENTO",
    "ORO",
    "VERDE",
    "GIALLO",
  ];

  const [formData, setFormData] = useState({
    deviceType: "",
    deviceModel: "",
    condition: "",
    grade: "",
    price: "",
    deviceBrand: "",
    deviceColor: "",
    memory: "",
    info: "",
    imei: "",
    status: "",
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/devices`
        );
        setDevices(response.data);
      } catch (error) {
        setError("Failed to fetch devices");
      }
    };

    fetchDevices();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Validate each field
    if (!formData.deviceType) newErrors.deviceType = "Device type is required.";
    if (!formData.deviceBrand) newErrors.deviceBrand = "Device brand is required.";
    if (!formData.deviceModel) newErrors.deviceModel = "Device model is required.";
    if (!formData.condition) newErrors.condition = "Condition is required.";
    if (!formData.grade) newErrors.grade = "Grade is required.";
    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be a positive number.";
    if (!formData.deviceColor) newErrors.deviceColor = "Device color is required.";
    if (!formData.memory) newErrors.memory = "Memory size is required.";
    // if (!formData.info) newErrors.info = "Additional information is required.";
    if (!formData.imei) newErrors.imei = "imei is required.";
    // if (formData.deviceType !== "Laptop" && formData.imei && !/^\d{15}$/.test(formData.imei)) {
    //   newErrors.imei = "IMEI must be exactly 15 digits.";
    // }
    if (!formData.status) newErrors.status = "Device status is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };




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



    if (id === "deviceType") {
      const selectedDeviceType = value;
      const filteredBrands = devices
        .filter((device) => device.name === selectedDeviceType)
        .flatMap((device) => device.brands.map((brand) => brand.name));
      setBrands(filteredBrands);
      setModels([]);
      setFormData((prevData) => ({
        ...prevData,
        deviceBrand: "",
        deviceModel: "",
      }));
    }

    if (id === "deviceBrand") {
      const selectedBrand = value;
      const selectedDeviceType = formData.deviceType;
      const filteredModels = devices
        .filter((device) => device.name === selectedDeviceType)
        .flatMap((device) => device.brands)
        .filter((brand) => brand.name === selectedBrand)
        .flatMap((brand) => brand.models);

      setModels(filteredModels);
      setFormData((prevData) => ({ ...prevData, deviceModel: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.", { autoClose: 3000, hideProgressBar: true });
      return;
    }
    // if (
    //   formData.deviceType !== "Laptop" &&
    //   formData.imei &&
    //   !/^\d{15}$/.test(formData.imei)
    // ) {
    //   setError("IMEI must be exactly 15 digits.");
    //   return;
    // }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/products/createproducts`,
        formData
      );
      console.log("Response:", response.data);
      setError(null);
      setLoading(false);
      toast.success("Item loaded successfully!", { autoClose: 3000, hideProgressBar: true });
      setFormData({
        deviceType: "",
        deviceModel: "",
        condition: "",
        grade: "",
        price: "",
        deviceBrand: "",
        deviceColor: "",
        memory: "",
        info: "",
        imei: "",
        status: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.msg        , { autoClose: 3000, hideProgressBar: true });
      console.error("Error adding product:", err);
      setError("An error occurred while adding the product.");
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="w-full text-white text-lg mb-4 flex flex-row px-20 justify-between items-center">
        <h1 className="font-bold text-4xl">Add Stock</h1>
        <div>
          <Link to="/stockpage" className="button-color px-6 py-3 rounded-md">
            Go Back
          </Link>
        </div>
      </div>
      <div className="w-[90%] mx-auto mt-10 flex-col justify-center items-center">
        <form
          className="bg-[#0B0B0B] text-[18px] rounded-lg display flex flex-col gap-10 p-10"
          onSubmit={handleSubmit}
        >
          <div className="flex md:flex-row flex-col justify-around items-center">
            <div className="flex flex-col gap-6 md:w-[40%] w-full justify-center">
              <select
                className="shadow w-full appearance-none border rounded-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
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

              <select
                className="shadow appearance-none border rounded-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="deviceBrand"
                value={formData.deviceBrand}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
                disabled={brands.length === 0}
              >
                <option value="">Select device brand ↓</option>
                {brands.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              {errors.deviceBrand && <p className="text-red-500">{errors.deviceBrand}</p>}

              <select
                className="shadow appearance-none border rounded-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="deviceModel"
                autoComplete="off"
                value={formData.deviceModel}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
                disabled={models.length === 0}
              >
                <option value="">Select device model ↓</option>
                {models.map((model, index) => (
                  <option key={index} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              {errors.deviceModel && <p className="text-red-500">{errors.deviceModel}</p>}

              <input
                list="gradeList"
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="grade"
                placeholder="Enter grade"
                autoComplete="off"
                value={formData.grade}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.grade && <p className="text-red-500">{errors.grade}</p>}

              <datalist id="gradeList">
                {grades.map((grade, index) => (
                  <option key={index} value={grade} />
                ))}
              </datalist>

              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="price"
                type="number"
                placeholder="Enter device price"
                autoComplete="off"
                value={formData.price}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.price && <p className="text-red-500">{errors.price}</p>}

            </div>

            <div className="flex flex-col gap-6 md:w-[40%] w-full mt-4 md:mt-0">
              <input
                list="colorList"
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="deviceColor"
                placeholder="Enter device color"
                autoComplete="off"
                value={formData.deviceColor}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.deviceColor && <p className="text-red-500">{errors.deviceColor}</p>}

              <datalist id="colorList">
                {colors.map((color, index) => (
                  <option key={index} value={color} />
                ))}
              </datalist>
              <input
                list="conditionList"
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="condition"
                autoComplete="off"
                placeholder="Enter condition"
                value={formData.condition}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.condition && <p className="text-red-500">{errors.condition}</p>}

              <datalist id="conditionList">
                {conditions.map((condition, index) => (
                  <option key={index} value={condition} />
                ))}
              </datalist>
              <input
                list="memoryList"
                className="shadow appearance-none border rounded-full w-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B]"
                id="memory"
                placeholder="Enter memory"
                autoComplete="off"
                value={formData.memory}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.memory && <p className="text-red-500">{errors.memory}</p>}

              <datalist id="memoryList">
                {storageOptions.map((memory, index) => (
                  <option key={index} value={memory} />
                ))}
              </datalist>
              <input
                className="shadow appearance-none border rounded-full w-full py-3 px-4 bg-[#26282B] text-white mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="info"
                type="text"
                placeholder="Enter additional information"
                autoComplete="off"
                value={formData.info}
                onChange={handleInputChange}
                style={{ borderColor: "#0F9BEE" }}
              />
              {errors.info && <p className="text-red-500">{errors.info}</p>}

              {/* {formData.deviceType !== "Laptop" && ( */}
              <>
                <input
                  className="shadow appearance-none border rounded-full w-full py-3 px-4 bg-[#26282B] text-white mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="imei"
                  type="text"
                  placeholder="Enter IMEI / Serial number "
                  autoComplete="off"
                  value={formData.imei}
                  onChange={handleInputChange}
                  style={{ borderColor: "#0F9BEE" }}
                />
                {errors.imei && <p className="text-red-500">{errors.imei}</p>}

              </>
              {/* )} */}
            </div>
          </div>
          <div>
            <select
              className="shadow appearance-none border rounded-full py-3 px-4 text-white leading-tight focus:outline-none focus:shadow-outline bg-[#26282B] block mx-auto md:w-[40%] w-full"
              id="status"
              autoComplete="off"
              value={formData.status}
              onChange={handleInputChange}
              style={{ borderColor: "#0F9BEE" }}
              disabled={models.length === 0}
            >
              <option value="">Select device status ↓</option>
              <option value="To Be Repaired">To Be Repaired</option>
              <option value="Ready for Sale">Ready for Sale</option>
              <option value="In Progress">In Progress</option>
            </select>
            {errors.status && <p className="text-red-500 text-center">{errors.status}</p>}
          </div>
          <div className="flex items-center justify-center">
            <button
              className="w-[300px] hover:bg-gray-900 text-white py-3 px-4 rounded-full focus:outline-none focus:shadow-outline"
              type="submit"
              style={{ backgroundColor: "#0F9BEE" }}
              disabled={loading}
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

          {/* {error && <p className="text-red-500 text-center mt-4">{error}</p>} */}
        </form>
      </div>
    </div>
  );
};

export default AddStock;
