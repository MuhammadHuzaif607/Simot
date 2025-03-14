import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BarcodeScanner } from 'react-barcode-scanner'; // Import the BarcodeScanner
import BillModal from './BillModal'; // Import the BillModal component
import { CircularProgress } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for Toast
import { ToastContainer, toast } from 'react-toastify'; // Import Toast components

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
  const [showModal, setShowModal] = useState(false); // For controlling Bill Modal
  const [bill, setBill] = useState(false); // For controlling Bill Modal
  const [loading, setLoading] = useState(false); // For controlling Bill Modal
  const [errorMessage, setErrorMessage] = useState(''); // Error message state
  const [isScanning, setIsScanning] = useState(false); // Scanner state
  const [customTotalPrice, setCustomTotalPrice] = useState(''); // To track custom price
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [billData, setBillData] = useState({});
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
      }
    };

    fetchCustomers();
  }, []);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredCustomers([]); // Close dropdown if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

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
    setFilteredCustomers([]); // Clear suggestions after selecting
  };

  const handleAddProduct = async () => {
    if (formData.productName && formData.customerName && formData.customerId) {
      try {
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
          // parseFloat(product.price) * (parseFloat(formData.commission) / 100),
        };


        setSales((prevSales) => [...prevSales, newSale]);

        // Clear product fields only after the sale is added

        setErrorMessage(''); // Clear any previous error message

        // setCustomTotalPrice(product.price);
      } catch (error) {
        console.error('Error fetching product:', error);

        if (error.response && error.response.status === 404) {
          setErrorMessage('Product not Available');
        } else {
          // General error handling
          setErrorMessage('An error occurred while fetching the product.');
        }
      }
    } else {
      // Set an error message if fields are not filled
      setErrorMessage('Please enter product name and select customer.');
    }
  };

  // Function to handle removing a sale from the sales array
  const handleRemoveSale = (index) => {
    const updatedSales = sales.filter((_, i) => i !== index); // Filter out the sale at the specified index
    setSales(updatedSales); // Update the state with the filtered sales
  };

  const totalPrice = sales.reduce((acc, sale) => acc + sale.productPrice, 0);

  const closeModal = () => {
    setShowModal(false);
  };

  const handleBarcodeScan = (data) => {
    setFormData((prevData) => ({
      ...prevData,
      productName: data.text,
    }));
    setIsScanning(false);
  };

  const handleBarcodeError = (error) => {
    console.error('Barcode scan error:', error);
  };

  const handleSell = async () => {
    // Final total price to send to the backend (adding shipping cost but not changing UI)
    const finalTotalPrice = totalPrice + parseFloat(formData.shippingCost || 0); // ✅ Adding shipping cost

    // Prepare bill data with commission
    const billData = {
      customerName: formData.customerName,
      customerId: formData.customerId,
      shipmentNumber: formData.shipmentNumber,
      shippingCost: formData.shippingCost, // ✅ Send shipping cost
      totalPrice: finalTotalPrice.toFixed(2), // ✅ Send updated total price
      commission: formData.commission, // ✅ Include commission
      customTotalPrice: customTotalPrice,
      products: sales,
      time: new Date(),
    };

    setBillData(billData); // ✅ Update bill data

    try {
      setLoading(true); // ✅ Show loading state

      // Make API call to save the bill
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sales`,
        billData
      );

      if (response.status === 201) {
        // ✅ After successfully generating the bill, delete each product
        for (let sale of sales) {
          try {
            if (!sale.isRepaired) {
              await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/products/deleteproducts/${
                  sale.productId
                }`
              );
              console.log(`Deleted product with ID: ${sale.productId}`);
            } else {
              const response = await axios.patch(
                `${
                  import.meta.env.VITE_API_URL
                }/api/products/update-sold-flag/${sale.productId}`
              );
              console.log('Product Updated');
              console.log('Response', response);
            }
          } catch (deleteError) {
            console.error(
              `Error deleting product with ID: ${sale.productId}`,
              deleteError
            );
          }
        }

        // ✅ Reset form fields
        setFormData((prevData) => ({
          ...prevData,
          customerName: '',
          customerId: '',
          shipmentNumber: '',
          productName: '',
          shippingCost: '', // ✅ Reset shipping cost
        }));

        setCustomTotalPrice(''); // ✅ Reset custom price
        setBill(true);
        toast.success('Item loaded successfully!', {
          autoClose: 3000,
          hideProgressBar: true,
        });
        setSales([]);
        setLoading(false);
      } else {
        setLoading(false);
        alert('Failed to generate bill. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred while adding the product.', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      console.error('Error generating bill:', error);
      alert('Failed to generate bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Generate Bill button click
  const handleGenerateBill = async () => {
    if (!customTotalPrice) {
      setErrorMessage('Product price is required.');
      return;
    }

    if (!formData.shipmentNumber) {
      setConfirmationMessage('Device has been inserted correctly.');
      setTimeout(() => setConfirmationMessage(''), 1000);
      shipmentRef.current?.focus();
    } else {
      handleSell();
    }
  };

  const generateBill = () => {
    const finalTotalPrice = customTotalPrice
      ? parseFloat(customTotalPrice) -
        parseFloat(formData.commission / 100) * parseFloat(customTotalPrice)
      : totalPrice;
    // Prepare bill data
    const billData = {
      customerName: formData.customerName,
      customerId: formData.customerId,
      shipmentNumber: formData.shipmentNumber,
      totalPrice: finalTotalPrice.toFixed(2),
      products: sales,
      time: new Date().toLocaleString(),
    };
    // setBillData(billData);
    setShowModal(true);
    // setShowModal(true);
  };

  return (
    <div className="w-full text-white">
      <ToastContainer />{' '}
      {confirmationMessage && (
        <p className="text-green-500">{confirmationMessage}</p>
      )}
      <div className="flex flex-col lg:flex-row lg:justify-between px-4 mb-4">
        <h1 className="2xl:text-3xl xl:text-xl lg:text-lg font-bold">
          Sales Data Entry
        </h1>
        {/* <div className="flex items-center">
          <span className="mr-2">Total:</span>
          <input
            type="number"
            value={customTotalPrice} // Display custom price or default total
            onChange={(e) => setCustomTotalPrice(e.target.value)} // Update the custom total price
            className="w-28 p-1 text-black"
            placeholder="Enter total price"
          />
        </div> */}
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
              className="absolute bg-white text-black w-full lg:w-1/4 mt-12 rounded shadow-lg"
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
            placeholder="Enter total price"
          />
          <input
            type="number"
            value={formData.customTotalPrice}
            name="shippingCost"
            id="shippingCost"
            onChange={handleInputChange}
            className="w-full lg:w-1/5 p-2 rounded bg-[#26282B] border border-gray-600"
            placeholder="Enter shipping price"
          />
        </div>

        {/* <div className="fflex flex-col gap-2 lg:flex-row mb-2">
          <span className="mr-2">Total:</span>
        </div> */}

        {/* Barcode Scanner */}
        {isScanning && (
          <div className="w-full lg:w-1/5 h-64 bg-black">
            <BarcodeScanner
              onScan={handleBarcodeScan}
              onError={handleBarcodeError}
            />
          </div>
        )}
        <div className="flex gap-2 mb-2">
          <button
            className="w-full lg:w-1/4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={handleAddProduct}
          >
            Fetch Product To make sale
          </button>
        </div>

        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

        {/* Conditional rendering for table and button */}
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
                      <th className="py-2 text-white">Product Price</th>
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
                          €
                          {sale.productPrice
                            // +  (sale.productPrice * formData.commission) / 100
                            .toFixed(2)}
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
                className="w-full lg:w-1/4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50 "
                onClick={handleGenerateBill}
                disabled={bill}
              >
                {loading && <CircularProgress color="success" size={20} />}

                {bill ? 'SOLD' : 'SELL'}
              </button>
              <button
                className="w-full lg:w-1/4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                onClick={generateBill}
                // disabled={!bill}
              >
                Generated Bill
              </button>
            </div>
          </>
        )}
      </div>
      <BillModal
        isOpen={showModal}
        onRequestClose={closeModal}
        sales={sales}
        formData={formData}
        customTotalPrice={customTotalPrice}
        totalPrice={
          parseFloat(customTotalPrice) ||
          // +  (formData.commission / 100) * parseFloat(customTotalPrice)
          totalPrice
        } // Pass custom or calculated total price
      />
    </div>
  );
};

export default SalesManagementPage;
