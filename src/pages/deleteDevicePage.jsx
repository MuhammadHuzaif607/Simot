import axios from "axios";


const DeleteDevicePage = () => {
  const resetDevices = () => {
    try {
      const response = axios.delete("");
      console.log(response);
    } catch (err) {
      console.log("Error deleting devices: ", err);
    }
  };

  return (
    <div>
      <button>Reset all devices</button>
    </div>
  );
};

export default DeleteDevicePage;
