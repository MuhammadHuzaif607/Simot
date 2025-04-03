import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BillModal from './BillModal';
import { CircularProgress } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const SalesManagementPage = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    shipmentNumber: '',
    productName: '',
    productPrice: '',
    commission: '',
    shippingCost: '',
  });

  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [customTotalPrice, setCustomTotalPrice] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [billData, setBillData] = useState(null);
  const dropdownRef = useRef(null);
  const shipmentRef = useRef(null);

  // Fetch all customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/customers`
        );
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers');
      }
    };

    fetchCustomers();
  }, []);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredCustomers([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === 'customerName') {
      const suggestions = customers.filter((customer) =>
        customer.customerName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(suggestions);
    }

    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleCustomerSelect = (customer) => {
    setFormData((prevData) => ({
      ...prevData,
      customerName: customer.customerName,
      customerId: customer._id,
      commission: customer.commission,
    }));
    setFilteredCustomers([]);
  };

  const handleAddProduct = async () => {
    if (!formData.productName) {
      setErrorMessage('Please enter product barcode');
      return;
    }

    if (!formData.customerName || !formData.customerId) {
      setErrorMessage('Please select a customer first');
      return;
    }

    try {
      setErrorMessage('');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products/getproducts/${
          formData.productName
        }`
      );
      const product = response.data;

      const newSale = {
        customerName: formData.customerName,
        customerId: formData.customerId,
        productName: product.name,
        productId: product._id,
        deviceType: product.deviceType,
        condition: product.condition,
        grade: product.grade,
        model: product.deviceModel,
        brand: product.deviceBrand,
        color: product.deviceColor,
        memory: product.memory,
        imei: product.imei,
        info: product.info,
        productPrice: parseFloat(product.price),
        repairInfo: product.repairInfo,
        paymentStatus: product.paymentStatus,
        status: product.status,
        isRepaired: product.isRepaired,
        soldRepaired: product.soldRepaired,
      };

      setSales((prevSales) => [...prevSales, newSale]);
      setFormData((prev) => ({ ...prev, productName: '' })); // Clear product field
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        setErrorMessage('Product not found');
      } else {
        setErrorMessage('Error fetching product details');
      }
    }
  };

  const handleRemoveSale = (index) => {
    setSales((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotalPrice = () => {
    const basePrice = customTotalPrice
      ? parseFloat(customTotalPrice)
      : sales.reduce((acc, sale) => acc + sale.productPrice, 0);

    const shippingCost = parseFloat(formData.shippingCost || 0);
    return basePrice + shippingCost;
  };

  const handleSell = async () => {
    if (!formData.shipmentNumber) {
      setConfirmationMessage('Please enter shipment number');
      shipmentRef.current?.focus();
      return;
    }

    if (sales.length === 0) {
      setErrorMessage('Please add at least one product');
      return;
    }

    try {
      setLoading(true);

      const totalPrice = calculateTotalPrice();
      const commissionAmount = formData.commission
        ? (totalPrice * parseFloat(formData.commission)) / 100
        : 0;

      const billData = {
        customerName: formData.customerName,
        customerId: formData.customerId,
        shipmentNumber: formData.shipmentNumber,
        shippingCost: formData.shippingCost || 0,
        totalPrice: totalPrice.toFixed(2),
        commission: formData.commission,
        commissionAmount: commissionAmount.toFixed(2),
        finalAmount: (totalPrice - commissionAmount).toFixed(2),
        products: sales,
        time: new Date(),
      };

      // Save the sale
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sales`,
        billData
      );

      if (response.status === 201) {
        // Delete or update products
        await Promise.all(
          sales.map(async (sale) => {
            if (!sale.isRepaired) {
              await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/products/deleteproducts/${
                  sale.productId
                }`
              );
            } else {
              await axios.patch(
                `${
                  import.meta.env.VITE_API_URL
                }/api/products/update-sold-flag/${sale.productId}`
              );
            }
          })
        );

        // Reset form
        setFormData({
          customerName: '',
          customerId: '',
          shipmentNumber: '',
          productName: '',
          productPrice: '',
          commission: '',
          shippingCost: '',
        });
        setCustomTotalPrice('');
        setSales([]);
        setBillData(billData);

        toast.success('Sale completed successfully!', {
          autoClose: 3000,
          hideProgressBar: true,
        });

        // Show the bill modal
        // setShowModal(true);
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      toast.error('Failed to complete sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = () => {
    if (sales.length === 0) {
      setErrorMessage('No products added to generate bill');
      return;
    }

    const totalPrice = calculateTotalPrice();
    const commissionAmount = formData.commission
      ? (totalPrice * parseFloat(formData.commission)) / 100
      : 0;

    setBillData({
      customerName: formData.customerName,
      customerId: formData.customerId,
      shipmentNumber: formData.shipmentNumber,
      totalPrice: totalPrice.toFixed(2),
      commission: formData.commission,
      commissionAmount: commissionAmount.toFixed(2),
      finalAmount: (totalPrice - commissionAmount).toFixed(2),
      products: sales,
      time: new Date().toLocaleString(),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="w-full text-white">
      <ToastContainer />
      {confirmationMessage && (
        <p className="text-green-500">{confirmationMessage}</p>
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between px-4 mb-4">
        <h1 className="2xl:text-3xl xl:text-xl lg:text-lg font-bold">
          Sales Data Entry
        </h1>
      </div>

      <div className="w-full">
        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap mb-2 relative">
          <input
            className="w-full lg:w-1/5 p-2 rounded bg-[#26282B] border border-gray-600"
            id="customerName"
            type="text"
            placeholder="Customer Name"
            value={formData.customerName}
            onChange={handleInputChange}
            autoComplete="off"
          />

          {filteredCustomers.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute bg-white text-black w-full lg:w-1/4 mt-12 rounded shadow-lg z-10"
            >
              {filteredCustomers.map((customer) => (
                <div
                  key={customer._id}
                  className="cursor-pointer p-2 hover:bg-gray-200"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  {customer.customerName}
                </div>
              ))}
            </div>
          )}

          <input
            className="w-full lg:w-1/5 p-2 rounded bg-[#26282B] border border-gray-600"
            id="customerId"
            type="text"
            placeholder="Customer ID"
            value={formData.customerId}
            readOnly
          />

          <input
            className="w-full lg:w-1/5 p-2 rounded bg-[#26282B] border border-gray-600"
            ref={shipmentRef}
            id="shipmentNumber"
            type="text"
            placeholder="Shipment Number"
            value={formData.shipmentNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2 lg:flex-row mb-2">
          <input
            className="w-full lg:w-1/5 p-2 rounded bg-[#26282B] border border-gray-600"
            id="productName"
            type="text"
            placeholder="Product Barcode No"
            value={formData.productName}
            onChange={handleInputChange}
          />

          <input
            type="number"
            value={customTotalPrice}
            onChange={(e) => {
              setErrorMessage('');
              setCustomTotalPrice(e.target.value);
            }}
            className="w-full lg:w-1/5 p-2 rounded bg-[#26282B] border border-gray-600"
            placeholder="Custom total price (optional)"
          />

          <input
            type="number"
            value={formData.shippingCost}
            onChange={handleInputChange}
            className="w-full lg:w-1/5 p-2 rounded bg-[#26282B] border border-gray-600"
            placeholder="Shipping cost"
            id="shippingCost"
          />
        </div>

        <div className="flex gap-2 mb-2">
          <button
            className="w-full lg:w-1/4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={handleAddProduct}
          >
            Fetch Product To make sale
          </button>
        </div>

        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

        {sales.length > 0 && (
          <>
            <div className="w-full overflow-auto mt-2 min-h-[200px]">
              <div className="overflow-x-auto">
                <table className="w-full text-center min-w-[800px]">
                  <thead className="bg-[#393b63]">
                    <tr>
                      <th className="py-2 text-white">Device Type</th>
                      <th className="py-2 text-white">Condition</th>
                      <th className="py-2 text-white">Grade</th>
                      <th className="py-2 text-white">Model</th>
                      <th className="py-2 text-white">Brand</th>
                      <th className="py-2 text-white">Color</th>
                      <th className="py-2 text-white">Memory</th>
                      <th className="py-2 text-white">IMEI</th>
                      <th className="py-2 text-white">Price</th>
                      <th className="py-2 text-white">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, index) => (
                      <tr className="bg-[#0f9bee]" key={index}>
                        <td className="py-2 px-4">{sale.deviceType}</td>
                        <td className="py-2 px-4">{sale.condition}</td>
                        <td className="py-2 px-4">{sale.grade}</td>
                        <td className="py-2 px-4">{sale.model}</td>
                        <td className="py-2 px-4">{sale.brand}</td>
                        <td className="py-2 px-4">{sale.color}</td>
                        <td className="py-2 px-4">{sale.memory}</td>
                        <td className="py-2 px-4">{sale.imei || 'N/A'}</td>
                        <td className="py-2 px-4">
                          €{sale.productPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-4">
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                            onClick={() => handleRemoveSale(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="w-full mt-4 gap-2 flex">
              <button
                className="w-full lg:w-1/4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
                onClick={handleSell}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : (
                  'COMPLETE SALE'
                )}
              </button>

              <button
                className="w-full lg:w-1/4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={handleGenerateBill}
                disabled={sales.length === 0}
              >
                PREVIEW BILL
              </button>
            </div>
          </>
        )}
      </div>

      {billData && (
        <BillModal
          isOpen={showModal}
          onRequestClose={closeModal}
          sales={sales}
          formData={formData}
          billData={billData}
        />
      )}
    </div>
  );
};

export default SalesManagementPage;
