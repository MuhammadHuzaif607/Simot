import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from './Loading';
import ProductsModal from './ProductsModal';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';

const SalesHistory = () => {
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedTotalPrice, setSelectedTotalPrice] = useState(null);
  const [selectedShipppingCost, setSelectedShipppingCost] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [exportDate, setExportDate] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [commission, setCommission] = useState('');
  const [customTotalPrice, setCustomTotalPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSalesHistory = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/sales`
      );
      setSalesHistory(response.data);
      setLoading(false);
      console.log('Sales ====>', response.data);
    } catch (error) {
      setError('Failed to fetch sales history');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesHistory();
    getUserRole();
  }, []);

  const handleViewClick = (
    products,
    totalPrice,
    shipppingCost,
    commission,
    customTotalPrice
  ) => {
    setSelectedSale(products);
    setSelectedTotalPrice(totalPrice);
    setSelectedShipppingCost(shipppingCost);
    setCommission(commission);
    setCustomTotalPrice(customTotalPrice);
    setIsModalOpen(true);
   
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
    setSelectedTotalPrice(null);
  };

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const filteredSalesHistory = salesHistory
    .filter((sale) => sale.status.toLowerCase() === 'delivered')
    .filter((sale) => {
      return (
        sale.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
        sale.shipmentNumber.toLowerCase().includes(filterText.toLowerCase()) ||
        sale.time.toLowerCase().includes(filterText.toLowerCase()) ||
        sale.totalPrice
          .toString()
          .toLowerCase()
          .includes(filterText.toLowerCase()) ||
        sale.status.toLowerCase().includes(filterText.toLowerCase())
      );
    });

  const handleExport = async () => {
    // console.log("first")
    if (!startDate || !endDate) {
      toast.error('Please select a start and end date to export data.');
      return;
    }

    try {
      setExportLoading(true);

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start) || isNaN(end)) {
        alert('Invalid date range selected.');
        return;
      }

      // Remove time from start and end dates
      const startDateOnly = start.toISOString().split('T')[0];
      const endDateOnly = end.toISOString().split('T')[0];

      const dataToExport = salesHistory.filter((sale) => {
        // Convert sale time to date format
        const saleDate = new Date(sale.time);
        const saleDateOnly = saleDate.toISOString().split('T')[0];

        return (
          sale.status.toLowerCase() === 'delivered' &&
          saleDateOnly >= startDateOnly &&
          saleDateOnly <= endDateOnly
        );
      });

      if (dataToExport.length === 0) {
        alert(
          'No sales data found before the selected date with status "delivered".'
        );
        return;
      }

      exportDataToExcel(
        dataToExport,
        `sales_history_${startDate}_to_${endDate}.xlsx`
      );
      const idsToDelete = dataToExport.map((sale) => sale._id);
      // await deleteSalesData(idsToDelete);
      await fetchSalesHistory();
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Error exporting data');
    } finally {
      setExportLoading(false);
    }
  };

  const exportDataToExcel = (data, filename) => {
    // Map the sales data to separate each product detail into individual columns
    const formattedData = data
      .map((sale) => {
        // Expand each product's details into separate columns
        return sale.products.map((product) => ({
          'Date & Time': `${new Date(
            sale.time
          ).toLocaleDateString()} ${new Date(sale.time).toLocaleTimeString()}`,
          'Customer Name': sale.customerName,
          'Shipment Number': sale.shipmentNumber,
          Brand: product.brand,
          'Device Type': product.deviceType,
          Model: product.model,
          IMEI: product.imei,
          Condition: product.condition,
          Grade: product.grade,
          Color: product.color,
          Memory: product.memory,
          Information: product.info,
          'Total Price': sale.totalPrice,
        }));
      })
      .flat(); // Flatten the array to ensure each row is represented correctly
    // Create a new worksheet and add the formatted data
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales History');

    // Write the Excel file
    XLSX.writeFile(wb, filename);
  };

  const exportDataToCSV = (data, filename) => {
    const csvData = data.map((sale) => ({
      time: `${new Date(sale.time).toLocaleDateString()} ${new Date(
        sale.time
      ).toLocaleTimeString()}`,
      customerName: sale.customerName,
      shipmentNumber: sale.shipmentNumber,
      products: sale.products
        .map(
          (product) =>
            `${product.brand}, ${product.deviceType}, ${product.model},${product.imei}, ${product.condition}, ${product.grade}, ${product.color}, ${product.memory}, ${product.info}`
        )
        .join(' | '),
      totalPrice: sale.totalPrice,
    }));

    const headers = [
      'Date & Time',
      'Customer Name',
      'Shipment Number',
      'Brand',
      'Device Type',
      'Model',
      'IMEI',
      'Condition',
      'Grade',
      'Color',
      'Memory',
      'Information',
      'Total Price',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...csvData.map((row) => Object.values(row).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSalesData = async (ids) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/sales/delete`,
        { data: { ids } }
      );
      if (response.status !== 200)
        throw new Error('Failed to delete sales data.');
    } catch (error) {
      console.error('Error deleting sales data:', error);
      throw error;
    }
  };

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

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full p-4 text-white">
      <div className="flex justify-center p-4">
        <h1 className="text-4xl text-center">Delivered Sales</h1>
      </div>
      <ToastContainer />
      {userRole == 'superadmin' && (
        <div className="flex justify-end mb-4">
          {/*    <input
            type="date"
            className="p-2 rounded bg-gray-700 text-white mr-2"
            value={exportDate}
            onChange={(e) => setExportDate(e.target.value)}
          /> */}
          <input
            type="date"
            className="p-2 rounded bg-gray-700 text-white mr-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="p-2 rounded bg-gray-700 text-white mr-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleExport}
          >
            {exportLoading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      )}

      <div className="flex justify-left mb-4">
        <input
          type="text"
          placeholder="Search"
          className="p-2 rounded bg-gray-700 text-white"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <div className="w-full h-[600px] overflow-x-auto overflow-y-auto">
        <table className="w-full text-center table-fixed min-w-[600px]">
          <thead className="bg-[#393b63]">
            <tr>
              <th className="w-1/5 py-2 px-2 text-white">Customer Name</th>
              <th className="w-1/5 py-2 px-2 text-white">Shipment No</th>
              <th className="w-1/5 py-2 px-2 text-white">Date & Time</th>
              <th className="w-1/5 py-2 px-2 text-white">Total Bill</th>
              <th className="w-1/5 py-2 px-2 text-white">Status</th>
              <th className="w-1/5 py-2 px-2 text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalesHistory.length > 0 ? (
              filteredSalesHistory.map((sale, index) => (
                <tr className="bg-[#0f9bee]" key={index}>
                  <td className="py-2 px-2">{sale.customerName}</td>
                  <td className="py-2 px-2">{sale.shipmentNumber}</td>
                  <td className="py-2 px-2">
                    {new Date(sale.time).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-2">€{sale.totalPrice}</td>
                  <td className="py-2 px-2">{capitalize(sale.status)}</td>
                  <td className="py-2 px-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
                      onClick={() =>
                        handleViewClick(
                          sale,
                          sale.totalPrice,
                          sale.shippingCost,
                          sale.commission,
                          sale.customTotalPrice
                        )
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-white">
                  No Delivered Sales Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedSale && (
        <ProductsModal
          products={selectedSale}
          totalPrice={selectedTotalPrice}
          shippingCost={selectedShipppingCost}
          commission={commission}
          customTotalPrice={customTotalPrice}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SalesHistory;
