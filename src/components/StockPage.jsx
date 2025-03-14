import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import axios from 'axios';
import ProductTable from './ProductTable';
import EditStockModal from './EditStockModal';
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

function StockPage() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  // console.log(products);
  // Function to fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products/getallproducts`
      );
      setProducts(response.data);
    } catch (err) {
      setError('Error fetching products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to get user role from localStorage
  const getUserRole = () => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const role = userData.user.role;
        setUserRole(role);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    } else {
      console.error('No user data found in localStorage');
    }
  };

  useEffect(() => {
    fetchProducts();
    getUserRole();
  }, [fetchProducts]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Filter products by type
  const filterProductsByType = (type) => {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    return products.filter(
      (product) => product.deviceType.toLowerCase() === type
    );
  };

  // Handle status change (PATCH request)
  const handleStatusChange = async (productId, newStatus) => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/products/updatestatus/${productId}`,
        {
          status: newStatus,
        }
      );
      // Update the product's status in the local state
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEditClick = (product) => {
    setEditData(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/products/deleteproducts/${productId}`
      );
      setProducts(products.filter((product) => product._id !== productId));
    } catch (err) {
      setError('Error deleting product');
      console.error('Error deleting product:', err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/products/editproducts/${
          editData._id
        }`,
        editData
      );
      setProducts(
        products.map((product) =>
          product._id === editData._id ? editData : product
        )
      );
      setIsModalOpen(false);
    } catch (err) {
      setError('Error updating product');
      console.error('Error updating product:', err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static" className="custom-appbar">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          aria-label="full width tabs example"
          className="custom-tabs"
        >
          <Tab label="Mobile Stock" {...a11yProps(0)} className="custom-tab" />
          <Tab label="Laptop Stock" {...a11yProps(1)} className="custom-tab" />
          <Tab label="Tablet Stock" {...a11yProps(2)} className="custom-tab" />
        </Tabs>
      </AppBar>

      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loading />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <TabPanel value={value} index={0} dir={theme.direction}>
            <ProductTable
              products={filterProductsByType('mobile')}
              handleEditClick={handleEditClick}
              handleDelete={handleDelete}
              handleStatusChange={handleStatusChange} // Pass handleStatusChange to ProductTable
              userRole={userRole}
            />
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            <ProductTable
              products={filterProductsByType('laptop')}
              handleEditClick={handleEditClick}
              handleDelete={handleDelete}
              handleStatusChange={handleStatusChange}
              userRole={userRole}
            />
          </TabPanel>
          <TabPanel value={value} index={2} dir={theme.direction}>
            <ProductTable
              products={filterProductsByType('tablet')}
              handleEditClick={handleEditClick}
              handleDelete={handleDelete}
              handleStatusChange={handleStatusChange}
              userRole={userRole}
            />
          </TabPanel>
        </>
      )}

      {isModalOpen && (
        <EditStockModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSaveChanges}
          editData={editData}
          setEditData={setEditData}
        />
      )}
    </Box>
  );
}

export default StockPage;
