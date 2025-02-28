import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCostTechnical,
  fetchCostTechnical,
  updateCostTechnical,
  deleteCostTechnical,
} from "../redux/slices/costTechnicalSlice";
import { toast, ToastContainer } from "react-toastify";

const TechnicalCostPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { items, status } = useSelector((state) => state.costTechnical);
  const [models, setModels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const dispatch = useDispatch();

  const {user} = JSON.parse(localStorage.getItem("user")); // Change dynamically

  const userRole=user.role

  const [formData, setFormData] = useState({
    model: "",
    lcd: "",
    batt: "",
    scocca: "",
    lcdBatt: "",
    scBattLcd: "",
    cam: "",
    fId: "",
    scocLcd: "",
    scocBatt: "",
    washing: "",
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/models`
        );
        const data = await response.json();
        setModels(data.models);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
    dispatch(fetchCostTechnical()).finally(() => setLoading(false));
  }, [dispatch]);

  const handleModelChange = (e) => {
    const selectedModel = e.target.value;
    setFormData((prev) => ({ ...prev, model: selectedModel }));

    const existingData = items.find((item) => item.model === selectedModel);
    if (existingData) {
      setFormData(existingData);
      setIsEditing(true);
      setSelectedId(existingData._id);
    } else {
      setIsEditing(false);
      setSelectedId(null);
      setFormData({
        model: selectedModel,
        lcd: "",
        batt: "",
        scocca: "",
        lcdBatt: "",
        scBattLcd: "",
        cam: "",
        fId: "",
        scocLcd: "",
        scocBatt: "",
        washing: "",
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await dispatch(
          updateCostTechnical({ id: selectedId, updatedEntry: formData })
        );
        toast.success("Cost updated successfully");
      } else {
        await dispatch(addCostTechnical(formData));
        toast.success("New cost added successfully");
      }
      dispatch(fetchCostTechnical());
    } catch (error) {
      toast.error("Operation failed");
    }

    setIsModalOpen(false);
    setFormData({
      model: "",
      lcd: "",
      batt: "",
      scocca: "",
      lcdBatt: "",
      scBattLcd: "",
      cam: "",
      fId: "",
      scocLcd: "",
      scocBatt: "",
      washing: "",
    });
  };

  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = async () => {
    await dispatch(deleteCostTechnical(deleteId));
    toast.success("Deleted successfully");
    dispatch(fetchCostTechnical());
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h2 className="text-white underline text-xl font-bold">
        COST TABLE (TECHNICAL)
      </h2>

      {status === "loading" || loading ? (
        <p className="text-center text-gray-600">Loading data...</p>
      ) : (
        <>
          {userRole === "superadmin" && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded my-4"
              onClick={() => setIsModalOpen(true)}
            >
              Add New Entry
            </button>
          )}

          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-yellow-400">
                <th>Model</th>
                <th>LCD</th>
                <th>Battery</th>
                <th>Scocca</th>
                <th>LCD + Battery</th>
                <th>Scocca + Battery + LCD</th>
                <th>Camera</th>
                <th>F, ID</th>
                <th>Scocca + LCD</th>
                <th>Scocca + Battery</th>
                <th className="">Washing</th>
                {userRole === "superadmin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items?.map((item, index) => (
                <tr
                  key={index}
                  className="border text-center bg-white border-gray-300"
                >
                  <td>{item.model}</td>
                  <td>{item.lcd}</td>
                  <td>{item.batt}</td>
                  <td>{item.scocca}</td>
                  <td>{item.lcdBatt}</td>
                  <td>{item.scBattLcd}</td>
                  <td>{item.cam}</td>
                  <td>{item.fId}</td>
                  <td>{item.scocLcd}</td>
                  <td>{item.scocBatt}</td>
                  <td className="">{item.washing}</td>
                  {userRole === "superadmin" && (
                    <td>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => {
                          setFormData(item);
                          setIsEditing(true);
                          setSelectedId(item._id);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => {
                          setDeleteId(item._id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-3/4">
            <h3 className="text-lg font-bold mb-4">
              {isEditing ? "Edit Entry" : "Add New Entry"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="mb-2">
                <label className="block text-gray-700">Model:</label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleModelChange}
                  className="border rounded p-2 w-full"
                  required
                >
                  <option value="">Select a Model</option>
                  {models.map((model, index) => (
                    <option key={index} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              {Object.keys(formData)
                .filter((key) => !["model", "_id", "__v"].includes(key)) // Hide model, _id, __v
                .map((key) => (
                  <div key={key} className="mb-2">
                    <label className="block text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1")}:
                    </label>
                    <input
                      name={key}
                      value={formData[key]}
                      onChange={handleInputChange}
                      className="border rounded p-2 w-full"
                      required
                    />
                  </div>
                ))}
              <div className="flex gap-2 justify-end items-end">
                <button
                  className="bg-green-500 h-fit w-fit p-2 rounded-md "
                  type="submit"
                >
                  {isEditing ? "Update" : "Submit"}
                </button>
                <button
                  className="bg-red-500 h-fit w-fit p-2 rounded-md "
                  onClick={() => {
                    setIsModalOpen(false); // Close Modal
                    setIsEditing(false); // Reset editing mode
                    setFormData({
                      // Reset form
                      model: "",
                      lcd: "",
                      batt: "",
                      scocca: "",
                      lcdBatt: "",
                      scBattLcd: "",
                      cam: "",
                      fId: "",
                      scocLcd: "",
                      scocBatt: "",
                      washing: "",
                    });
                  }}
                >
                  Cancle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">
              Are you sure you want to delete this entry?
            </h3>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleDelete}
            >
              Yes, Delete
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded ml-4"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalCostPage;
