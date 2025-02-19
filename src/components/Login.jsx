import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import img from "../assets/unnamed-removebg-preview.png";
import Loading from "./Loading";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Check if user data exists in localStorage
    const user = localStorage.getItem("user");

    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.user.role === "admin") {
        navigate("/stockpage");
      } else if (parsedUser.user.role === "superadmin") {
        navigate("/dashboard");
      }else if (parsedUser.user.role === "technical") {
        navigate("/technical");
      }
    }
  }, [navigate]);
  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    setError(""); // Reset the error when input changes
  };

  // Handle form submission with validation and loader
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if both email and password are provided
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true); // Set loading state to true when the form is submitted

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          // const response = await fetch('https://back-dash-4nnkfjlg1-waleeds-projects-22c8b015.vercel.app/api/auth/login', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Capture backend error messages
        setError(
          data.message || "Login failed. Please check your credentials."
        );
        setLoading(false);
        return;
      }

      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(data));

      if (data.user.role === "admin") {
        navigate("/stockpage");
      } else if (data.user.role === "superadmin") navigate("/dashboard");
      else if (data.user.role === "technical"){
        navigate("/technical");
      } else {navigate("/")};
    } catch (error) {
      console.error("Error:", error);
      setError(
        "An error occurred while trying to log in. Please try again later."
      );
    } finally {
      setLoading(false); // Reset loading state after request completes
    }
  };

  return (
    <div className="flex p-8 items-center dark-gray h-[100vh]">
      <div className="w-[70%] h-[100%] bg-black flex items-center justify-center overflow-auto">
        <img src={img} alt="Avatar" />
      </div>
      <div className="w-[30%] flex flex-col justify-center items-center h-[100vh]">
        <form className="w-full max-w-xs" onSubmit={handleSubmit}>
          <h1 className="mb-2 text-lg text-white">Welcome to SIMOTECH_iT</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label
              className="block text-white text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-transparent"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-white text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-transparent text-white mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-black w-full hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <Loading />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
