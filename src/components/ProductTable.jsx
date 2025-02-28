import React, { useState, useEffect } from 'react';
import image from '../assets/barcode.png';
import BarCodeModal from './BarCodeModal';
import Loading from './Loading';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import { formatMoney } from '../helper/FormMoney';

const ProductTable = ({
  products,
  handleEditClick,
  handleDelete,
  handleStatusChange,
  userRole,
  repaired = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [loadingStatusId, setLoadingStatusId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    condition: '',
    deviceBrand: '',
    deviceModel: '',
    deviceColor: '',
    grade: '',
    priceFrom: '',
    priceTo: '',
    memory: '',
  });
  const [searchImei, setSearchImei] = useState('');
  const [totalUnits, setTotalUnits] = useState(0);

  const statusOptions = [
    'To Be Repaired',
    'Ready for Sale',
    'In Progress',
    'In Confirmation',
    'Reserved'
  ];

  const shouldShowColumn = (columnKey) => {
    return products.some(
      (product) => product[columnKey] && product[columnKey] !== ''
    );
  };

  // Extract unique dropdown options from product data
  const getDropdownOptions = (key) =>
    [...new Set(products.map((product) => product[key]))].map((value) => ({
      label: value || 'N/A',
      value,
    }));

  const conditionOptions = getDropdownOptions('condition');
  const brandOptions = getDropdownOptions('deviceBrand');
  const modelOptions = getDropdownOptions('deviceModel');
  const colorOptions = getDropdownOptions('deviceColor');
  const gradeOptions = getDropdownOptions('grade');
  const memoryOptions = getDropdownOptions('memory');

  const handleStatusDropdownChange = async (productId, newStatus) => {
    setLoadingStatusId(productId);
    await handleStatusChange(productId, newStatus); // Call the passed function from StockPage
    setLoadingStatusId(null);
  };

  // Function to filter and sort products
  const sortedProducts = [...products]
    .filter((product) => {
      const conditionMatch =
        !searchFilters.condition ||
        product.condition === searchFilters.condition;
      const brandMatch =
        !searchFilters.deviceBrand ||
        product.deviceBrand === searchFilters.deviceBrand;
      const modelMatch =
        !searchFilters.deviceModel ||
        product.deviceModel === searchFilters.deviceModel;
      const colorMatch =
        !searchFilters.deviceColor ||
        product.deviceColor === searchFilters.deviceColor;
      const gradeMatch =
        !searchFilters.grade || product.grade === searchFilters.grade;
      const memoryMatch =
        !searchFilters.memory || product.memory === searchFilters.memory;

      const priceMatch =
        (!searchFilters.priceFrom ||
          product.price >= parseFloat(searchFilters.priceFrom)) &&
        (!searchFilters.priceTo ||
          product.price <= parseFloat(searchFilters.priceTo));

      const statusMatch = !statusFilter || product.status === statusFilter;

      return (
        conditionMatch &&
        brandMatch &&
        modelMatch &&
        colorMatch &&
        gradeMatch &&
        memoryMatch &&
        priceMatch &&
        statusMatch
      );
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      let valueA = a[sortConfig.key] || '';
      let valueB = b[sortConfig.key] || '';

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'ascending'
          ? valueA - valueB
          : valueB - valueA;
      } else {
        return sortConfig.direction === 'ascending'
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      }
    });

  

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDropdownChange = (key, value) => {
    setSearchFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const handleBarcodeClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Function to export products to Excel
  const exportToExcel = () => {
    if (!products.length) {
      toast.error('No products available to export.');
      return;
    }

    const data = sortedProducts.map((product) => ({
      DeviceType: product.deviceType,
      Condition: product.condition,
      Price: product.price,
      Brand: product.deviceBrand,
      Model: product.deviceModel,
      Color: product.deviceColor,
      Grade: product.grade,
      Memory: product.memory,
      IMEI: product.imei,
      Date: new Date(product.date).toLocaleDateString(),
      Status: product.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    XLSX.writeFile(workbook, 'Product_Stock_Data.xlsx');
  };

  useEffect(() => {
    // Calculate total units
    setTotalUnits(products.length);
  }, [products]);

  return (
    <div>
      <ToastContainer />
      <div className="flex flex-col items-center justify-between mb-4">
        {/* Add Total Units Display */}

        <div className="w-full flex justify-between items-center mb-2">
          <input
            type="text"
            placeholder="Search IMEI..."
            className="p-2 rounded bg-gray-700 text-white w-64"
            value={searchImei}
            onChange={(e) => setSearchImei(e.target.value)}
          />
          <div className="bg-gray-700 text-white p-2 rounded">
            Total unit = {totalUnits}
          </div>
        </div>

        {/* Export Button */}
        <button
          className="bg-green-500 ml-auto m-1 text-white p-2 px-4 rounded-lg"
          onClick={exportToExcel}
        >
          Export to Excel
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Condition Filter */}
          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={searchFilters.condition}
            onChange={(e) => handleDropdownChange('condition', e.target.value)}
          >
            <option value="">All Conditions</option>
            {conditionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={searchFilters.deviceBrand}
            onChange={(e) =>
              handleDropdownChange('deviceBrand', e.target.value)
            }
          >
            <option value="">All Brands</option>
            {brandOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Model Filter */}
          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={searchFilters.deviceModel}
            onChange={(e) =>
              handleDropdownChange('deviceModel', e.target.value)
            }
          >
            <option value="">All Models</option>
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Color Filter */}
          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={searchFilters.deviceColor}
            onChange={(e) =>
              handleDropdownChange('deviceColor', e.target.value)
            }
          >
            <option value="">All Colors</option>
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={searchFilters.grade}
            onChange={(e) => handleDropdownChange('grade', e.target.value)}
          >
            <option value="">All Grades</option>
            {gradeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Memory Filter */}
          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={searchFilters.memory}
            onChange={(e) => handleDropdownChange('memory', e.target.value)}
          >
            <option value="">All Memory</option>
            {memoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Price Range Filter */}
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Price From"
              className="p-2 rounded bg-gray-700 text-white w-full"
              value={searchFilters.priceFrom}
              onChange={(e) =>
                handleDropdownChange('priceFrom', e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Price To"
              className="p-2 rounded bg-gray-700 text-white w-full"
              value={searchFilters.priceTo}
              onChange={(e) => handleDropdownChange('priceTo', e.target.value)}
            />
          </div>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-center text-white text-sm">
            <thead className="bg-[#393b63] sticky top-0 text-sm">
              <tr>
                {shouldShowColumn('deviceType') && (
                  <th className="py-2 px-2">Device Type </th>
                )}
                {shouldShowColumn('condition ') && (
                  <th className="py-2">Condition</th>
                )}
                {shouldShowColumn('price') && <th className="py-2">Price</th>}
                {shouldShowColumn('grade') && <th className="py-2">Grade</th>}
                {shouldShowColumn('deviceBrand') && (
                  <th className="py-2">Brand</th>
                )}
                {shouldShowColumn('deviceModel') && (
                  <th className="py-2">Model</th>
                )}
                {shouldShowColumn('deviceColor') && (
                  <th className="py-2">Color</th>
                )}
                {shouldShowColumn('memory') && (
                  <th className="py-2">Memory GB</th>
                )}
                <th className="py-2">INFO</th>
                {shouldShowColumn('imei') && <th className="py-2">IMEI</th>}
                {shouldShowColumn('date') && <th className="py-2">Date </th>}
                <th className="py-2">
                  <select
                    className="p-2 rounded bg-gray-700 text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Ready for Sale">🟢 Ready for Sale</option>
                    <option value="To Be Repaired">🟡 To Be Repaired</option>
                    <option value="In Progress">🔴 In Progress</option>
                    <option value="In Confirmation">⚫ In Confirmation</option>
                    <option value="Reserved">⚪ Reserved</option>
                  </select>
                </th>
                {userRole === 'superadmin' && <th className="py-2">Action</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="13" className="py-4">
                  No products found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-center text-white text-sm">
            <thead className="bg-[#393b63] sticky top-0 text-sm">
              <tr>
                {shouldShowColumn('deviceType') && (
                  <th
                    className="py-2 px-2 cursor-pointer"
                    onClick={() => handleSort('deviceType')}
                  >
                    Device Type
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'deviceType'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                {shouldShowColumn('condition') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('condition')}
                  >
                    Condition
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'condition'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                {shouldShowColumn('price') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'price'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                {shouldShowColumn('grade') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('grade')}
                  >
                    Grade
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'grade'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                {shouldShowColumn('deviceBrand') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('deviceBrand')}
                  >
                    Brand
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'deviceBrand'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                {shouldShowColumn('deviceModel') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('deviceModel')}
                  >
                    Model
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'deviceModel'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                {shouldShowColumn('deviceColor') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('deviceColor')}
                  >
                    Color
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'deviceColor'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                {shouldShowColumn('memory') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('memory')}
                  >
                    Memory GB
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'memory'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}

                <th
                  className="py-2 cursor-pointer"
                  onClick={() => handleSort('info')}
                >
                  INFO
                  <span style={{ marginLeft: '5px' }}>
                    {sortConfig.key === 'info'
                      ? sortConfig.direction === 'ascending'
                        ? '↑'
                        : '↓'
                      : '↕'}
                  </span>
                </th>

                {shouldShowColumn('imei') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('imei')}
                  >
                    IMEI
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'imei'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                {shouldShowColumn('date') && (
                  <th
                    className="py-2 cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    Date
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.key === 'date'
                        ? sortConfig.direction === 'ascending'
                          ? '↑'
                          : '↓'
                        : '↕'}
                    </span>
                  </th>
                )}
                <th className="py-2">
                  <select
                    className="p-2 rounded bg-gray-700 text-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Ready for Sale">🟢 Ready for Sale</option>
                    <option value="To Be Repaired">🟡 To Be Repaired</option>
                    <option value="In Progress">🔴 In Progress</option>
                    <option value="In Confirmation">⚫ In Confirmation</option>
                    <option value="Reserved">⚪ Reserved</option>
                  </select>
                </th>
                {userRole === 'superadmin' && <th className="py-2">Action</th>}
              </tr>
            </thead>
            <tbody>
              {sortedProducts
                .filter((product) =>
                  searchImei ? product.imei.includes(searchImei) : true
                )
                .map((product) => (
                  <tr key={product._id} className="bg-blue-500">
                    <td>{product.deviceType}</td>
                    <td>{product.condition}</td>
                    <td>{formatMoney(product.price)}</td>
                    <td>{product.grade}</td>
                    <td>{product.deviceBrand}</td>
                    <td>{product.deviceModel}</td>
                    <td>{product.deviceColor}</td>
                    <td>{product.memory}</td>
                    <td>{product.info || 'None'}</td>
                    <td>{product.imei}</td>
                    <td
                      className={`py-1 px-2 text-ellipsis overflow-hidden ${
                        new Date(product.date) <
                        new Date(new Date().setMonth(new Date().getMonth() - 1))
                          ? 'text-red-500'
                          : ''
                      }`}
                    >
                      {new Date(product.date).toLocaleDateString()}
                    </td>
                    <td className="py-1 px-2 ">
                      <div className="flex items-center justify-center">
                        <span
                          className={`status-dot ${
                            product.status === 'Ready for Sale'
                              ? 'status-ready'
                              : product.status === 'To Be Repaired'
                              ? 'status-repair'
                              : product.status === 'In Confirmation'
                              ? 'status-confirmation'
                              : product.status === 'Reserved'
                              ? 'status-reserved'
                              : 'status-scheduled'
                          }`}
                        ></span>

                        <select
                          className="bg-black text-white rounded p-1"
                          value={product.status}
                          onChange={(e) =>
                            handleStatusDropdownChange(
                              product._id,
                              e.target.value
                            )
                          }
                          disabled={loadingStatusId === product._id}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    {userRole === 'superadmin' && (
                      <td className="py-1 px-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded"
                          onClick={() => handleEditClick(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded mt-1"
                          onClick={() => handleDelete(product._id)}
                          disabled={loadingDeleteId === product._id}
                        >
                          {loadingDeleteId === product._id ? (
                            <Loading />
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProduct && (
        <BarCodeModal
          open={isModalOpen}
          handleClose={handleCloseModal}
          condition={selectedProduct.condition}
          deviceModal={selectedProduct.deviceModel}
          grade={selectedProduct.grade}
          productId={selectedProduct._id}
          imei={selectedProduct.imei}
        />
      )}
    </div>
  );
};

export default ProductTable;
