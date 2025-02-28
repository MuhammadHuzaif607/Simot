import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCostMaterial,
  fetchCostMaterial,
  updateCostMaterial,
  deleteCostMaterial,
} from "../redux/slices/costMaterialSlice";
import { toast } from "react-toastify";

const MaterialCostPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { items, status } = useSelector((state) => state.costMaterial);
  const [models, setModels] = useState([]);
  const dispatch = useDispatch();

  const userRole = "superadmin"; // Change dynamically

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
    dispatch(fetchCostMaterial()).finally(() => setLoading(false));
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
          updateCostMaterial({ id: selectedId, updatedEntry: formData })
        );
        toast.success("Material cost updated successfully");
      } else {
        await dispatch(addCostMaterial(formData));
        toast.success("Material cost added successfully");
      }
      dispatch(fetchCostMaterial());
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
    await dispatch(deleteCostMaterial(deleteId));
    toast.success("Deleted successfully");
    dispatch(fetchCostMaterial());
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-white underline text-xl font-bold">
        COST TABLE (MATERIAL)
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
              ADD TEMPLATE WITH PRICES
            </button>
          )}

          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-yellow-400">
                <th>MODEL</th>
                <th>LCD</th>
                <th>BATT</th>
                <th>SCOCCA</th>
                <th>LCD+BA</th>
                <th>SC+BAT+LCD</th>
                <th>CAM</th>
                <th>F.ID</th>
                <th className="">SCOC+LCD</th>
                <th className="">SCOC+BATT</th>
                <th className="">WASHING</th>
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
                .filter((key) => !["model", "_id", "__v"].includes(key))
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
              <div className="flex gap-2 justify-end col-span-2">
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
    </div>
  );
};

export default MaterialCostPage;
