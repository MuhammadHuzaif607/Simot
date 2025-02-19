import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loading from './Loading';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const DeviceData = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [devices, setDevices] = useState([]);
  const [filterText, setFilterText] = useState(''); // Filter text state
  const [error, setError] = useState(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null); // Track the device being deleted

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/devices`);
        setDevices(response.data);
      } catch (error) {
        setError('Failed to fetch devices');
      }
    };

    fetchDevices();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Handle Delete API call with brand and model
  const handleDelete = async (id, brand, model) => {
    setLoadingDeleteId(`${id}-${brand}-${model}`); // Set the loading state for the specific delete button
    try {
      // Send both brand and model in the delete request
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/devices/${id}`, {
        data: { brand, model }, // Send brand and model in the request body
      });

      // Update UI by removing the deleted model
      setDevices((prevDevices) =>
        prevDevices.map((device) => {
          if (device._id === id) {
            return {
              ...device,
              brands: device.brands.map((brandObj) => ({
                ...brandObj,
                models: brandObj.models.filter((m) => m !== model), // Remove the deleted model
              })),
            };
          }
          return device;
        })
      );
    } catch (error) {
      console.error('Error deleting device:', error);
      setError('Error deleting the device model');
    } finally {
      setLoadingDeleteId(null); // Reset loading state
    }
  };

  // Filter devices based on filterText
  const filteredDevices = devices.map((device) => ({
    ...device,
    brands: device.brands.map((brandObj) => ({
      ...brandObj,
      models: brandObj.models.filter((model) =>
        brandObj.name.toLowerCase().includes(filterText.toLowerCase()) ||
        model.toLowerCase().includes(filterText.toLowerCase())
      ),
    })).filter((brandObj) => brandObj.models.length > 0), // Remove brands without any models after filtering
  })).filter((device) => device.brands.length > 0); // Remove devices without any brands after filtering

  return (
    <Box sx={{ width: '100%' }}>
      <div className='flex justify-between p-4 text-white'>
        <h1 className='md:text-3xl text-2xl'>Devices Page</h1>
        <Link to="/adddevices" className='button-color px-4 py-2 rounded-md'>
          Add Device
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

      {error && <div className="text-red-500">{error}</div>}

      <AppBar position="static" className="custom-appbar">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          aria-label="device management tabs"
          className="custom-tabs"
        >
          <Tab label="Mobile Devices" {...a11yProps(0)} className="custom-tab" />
          <Tab label="Laptop Devices" {...a11yProps(1)} className="custom-tab" />
          <Tab label="Tablet Devices" {...a11yProps(2)} className="custom-tab" />
        </Tabs>
      </AppBar>

      <>
        <TabPanel value={value} index={0} dir={theme.direction}>
          <DeviceTable devices={filteredDevices.filter((device) => device.name === 'Mobile')} handleDelete={handleDelete} loadingDeleteId={loadingDeleteId} />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <DeviceTable devices={filteredDevices.filter((device) => device.name === 'Laptop')} handleDelete={handleDelete} loadingDeleteId={loadingDeleteId} />
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <DeviceTable devices={filteredDevices.filter((device) => device.name === 'Tablet')} handleDelete={handleDelete} loadingDeleteId={loadingDeleteId} />
        </TabPanel>
      </>
    </Box>
  );
};

const DeviceTable = ({ devices, handleDelete, loadingDeleteId }) => {
  // Check if there's any data to show
  const hasData = devices.length > 0 && devices.some((device) => device.brands.some((brand) => brand.models.length > 0));

  return (
    <>
      {hasData ? (
        <div className="overflow-auto h-[550px]"> {/* Set scroll only on the table container */}
          <table className="w-full text-center table-fixed min-w-[600px]">
            <thead className="bg-[#393b63]">
              <tr>
                <th className="w-1/4 py-2 px-2">Brand</th>
                <th className="w-1/4 py-2 px-2">Model</th>
                <th className="w-1/4 py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) =>
                device.brands.map((brandObj) =>
                  brandObj.models.map((model, index) => (
                    <tr key={`${device._id}-${brandObj.name}-${model}-${index}`} className="bg-[#0f9bee]">
                      <td className="py-2 px-2">{brandObj.name}</td>
                      <td className="py-2 px-2">{model}</td>
                      <td className="py-2 px-2">
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                          onClick={() => handleDelete(device._id, brandObj.name, model)}
                          disabled={loadingDeleteId === `${device._id}-${brandObj.name}-${model}`} // Disable the button while deleting
                        >
                          {loadingDeleteId === `${device._id}-${brandObj.name}-${model}` ? (
                            <div className="flex justify-center items-center">
                              <Loading />
                              Del...
                            </div>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4">No devices found</div>
      )}
    </>
  );
};

DeviceTable.propTypes = {
  devices: PropTypes.array.isRequired,
  handleDelete: PropTypes.func.isRequired,
  loadingDeleteId: PropTypes.string, // Prop for the loading state
};

export default DeviceData;
