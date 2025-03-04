import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUnpaidDevices,
  fetchPaidDevices,
  fetchGroupedByPayment,
  payMultipleDevices,
  deleteUnpaidDevice,
  editDevice,
  fetchSoldRepairedProducts,
} from '../redux/slices/paymentSlice';

export default function DeviceHistory() {
  const dispatch = useDispatch();
  const {
    soldRepairedProducts,
    unpaidDevices,
    paidDevices,
    groupedPayments,
    status,
    error,
  } = useSelector((state) => state.payments);

  const [activeTab, setActiveTab] = useState('toPay');

  useEffect(() => {
    dispatch(fetchUnpaidDevices());
    dispatch(fetchPaidDevices());
    dispatch(fetchGroupedByPayment());
    dispatch(fetchSoldRepairedProducts());
  }, [dispatch]);

  if (status === 'loading') return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="w-full p-4">
      <div className="flex justify-around bg-gray-800 text-white p-2 rounded-lg">
        <button
          onClick={() => setActiveTab('toPay')}
          className={`${activeTab === 'toPay' ? 'bg-blue-400' : ''} p-2`}
        >
          TO PAY
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`${activeTab === 'paid' ? 'bg-blue-400' : ''} p-2`}
        >
          PAID
        </button>
        <button
          onClick={() => setActiveTab('fullStory')}
          className={`${activeTab === 'fullStory' ? 'bg-blue-400' : ''} p-2`}
        >
          FULL STORY
        </button>
      </div>

      {activeTab === 'toPay' && (
        <TechnicianGroupedTable
          unpaidDevices={unpaidDevices}
          soldRepairedProducts={soldRepairedProducts}
          dispatch={dispatch}
        />
      )}

      {activeTab === 'paid' && (
        <PaidTechnicianGroupedTable paidDevices={paidDevices} />
      )}

      {activeTab === 'fullStory' && (
        <FullStoryTable groupedPayments={groupedPayments} />
      )}
    </div>
  );
}

// 📌 Technician Grouped Table Component
function TechnicianGroupedTable({
  unpaidDevices,
  soldRepairedProducts,
  dispatch,
}) {
  // Group devices by technician
  const groupedByTechnician = unpaidDevices.reduce((acc, device) => {
    const technician = device.repairInfo.technician.email;
    if (!acc[technician]) {
      acc[technician] = {
        technicianName: device.repairInfo.technician.name,
        technicianEmail: device.repairInfo.technician.email,
        devices: [],
      };
    }
    acc[technician].devices.push(device);
    return acc;
  }, {});

  const handlePayment = (devices) => {
    const deviceIds = devices.map((device) => device._id);
    dispatch(payMultipleDevices(deviceIds));
  };

  const handlePrintPDF = (group) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text('Customer Invoice', 14, 20);

    // Customer Details
    doc.setFontSize(12);
    doc.text(`Technician Name: ${group.technicianName}`, 14, 30);
    doc.text(`Technician Email: ${group.technicianEmail}`, 14, 37);
    doc.text(
      `Total Amount Due: €${group.devices
        .reduce((sum, device) => sum + device.repairInfo.totalTechnicianCost, 0)
        .toFixed(2)}`,
      14,
      44
    );

    // Device Table
    const tableData = group.devices.map((device) => [
      device.deviceType,
      device.condition,
      device.grade,
      device.deviceModel,
      device.deviceBrand,
      device.deviceColor,
      device.memory,
      device.imei,
      `€${device.repairInfo.totalTechnicianCost}`,
    ]);

    autoTable(doc, {
      startY: 60,
      head: [
        [
          'Device Type',
          'Condition',
          'Grade',
          'Model',
          'Brand',
          'Color',
          'Memory',
          'IMEI',
          'Technician Cost (€)',
        ],
      ],
      body: tableData,
    });

    // Save the PDF
    doc.save(`Invoice_${group.technicianName}.pdf`);
  };

  const handleSoldProductPDF = (product) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text('Customer Invoice', 14, 20);

    // Customer Details
    doc.setFontSize(12);
    doc.text(`Technician Name: ${group.technicianName}`, 14, 30);
    doc.text(`Technician Email: ${group.technicianEmail}`, 14, 37);
    doc.text(
      `Total Amount Due: €${group.devices
        .reduce((sum, device) => sum + device.repairInfo.totalTechnicianCost, 0)
        .toFixed(2)}`,
      14,
      44
    );

    // Device Table
    const tableData = group.devices.map((device) => [
      device.deviceType,
      device.condition,
      device.grade,
      device.deviceModel,
      device.deviceBrand,
      device.deviceColor,
      device.memory,
      device.imei,
      `€${device.repairInfo.totalTechnicianCost}`,
    ]);

    autoTable(doc, {
      startY: 60,
      head: [
        [
          'Device Type',
          'Condition',
          'Grade',
          'Model',
          'Brand',
          'Color',
          'Memory',
          'IMEI',
          'Technician Cost (€)',
        ],
      ],
      body: tableData,
    });

    // Save the PDF
    doc.save(`Invoice_${group.technicianName}.pdf`);
  };

  return (
    <div className="mt-4">
      {Object.keys(groupedByTechnician).length !== 0 ? (
        Object.values(groupedByTechnician).map((group, index) => (
          <div key={index} className="mb-6 border rounded-lg p-4 text-white">
            <h3 className="text-lg font-bold ">
              Technician: {group.technicianName}
            </h3>
            <p>Email: {group.technicianEmail}</p>
            <DeviceTable devices={group.devices} isSuperAdmin={true} />
            <div className="flex justify-between items-center mt-4">
              <p className="text-lg font-semibold">
                Technician Total Cost: €
                {group.devices
                  .reduce(
                    (sum, device) =>
                      sum + device.repairInfo.totalTechnicianCost,
                    0
                  )
                  .toFixed(2)}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePrintPDF(group)}
                  className="p-2 bg-blue-500 text-white rounded-lg"
                >
                  Generate Invoice
                </button>
                <button
                  onClick={() => handlePayment(group.devices)}
                  className="p-2 bg-green-500 text-white rounded-lg"
                >
                  Pay
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <>
          <p className="text-white text-center p-4">
            No unpaid devices available
          </p>
        </>
      )}

      {soldRepairedProducts && soldRepairedProducts.length > 0 && (
        <div className="mb-6 border rounded-lg p-4">
          <h2 className="text-lg mb-5 text-white">Sold Repaired Products</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Model</th>
                <th className="border border-gray-300 p-2">IMEI</th>
                <th className="border border-gray-300 p-2">
                  Replaced Components
                </th>
                <th className="border border-gray-300 p-2">Status</th>
                <th className="border border-gray-300 p-2">Technician Cost</th>
              </tr>
            </thead>
            <tbody>
              {soldRepairedProducts.map((product, index) => {
                const combinedComponents = Object.keys(
                  product.repairInfo.repairComponents
                )
                  .map((component) => component)
                  .join(', ');
                return (
                  <tr key={index} className="border text-white border-gray-300">
                    <th className="border border-gray-300 p-2">
                      {product.model}
                    </th>
                    <td className="border border-gray-300 p-2">
                      {product.imei}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {combinedComponents}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {product.status}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {' '}
                      € {product.repairInfo.totalTechnicianCost.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          
        </div>
      )}
    </div>
  );
}

// 📌 Paid Technician Grouped Table Component
function PaidTechnicianGroupedTable({ paidDevices }) {
  if (!paidDevices || paidDevices.length === 0) {
    return <p className="text-center p-4">No paid devices available</p>;
  }

  // Group devices by technician
  const groupedByTechnician = paidDevices.reduce((acc, device) => {
    const technician = device.repairInfo.technician.email;
    if (!acc[technician]) {
      acc[technician] = {
        technicianName: device.repairInfo.technician.name,
        technicianEmail: device.repairInfo.technician.email,
        devices: [],
      };
    }
    acc[technician].devices.push(device);
    return acc;
  }, {});

  return (
    <div className="mt-4">
      {Object.values(groupedByTechnician).map((group, index) => (
        <div key={index} className="mb-6 border rounded-lg p-4 text-white">
          <h3 className="text-lg font-bold">
            Technician: {group.technicianName}
          </h3>
          <p>Email: {group.technicianEmail}</p>
          <DeviceTable devices={group.devices} />
          <div className="flex justify-between items-center mt-4">
            <p className="text-lg font-semibold">
              Total Paid Amount: €
              {group.devices
                .reduce(
                  (sum, device) => sum + device.repairInfo.totalTechnicianCost,
                  0
                )
                .toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeviceTable({ devices, isSuperAdmin = false }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null); // To hold the device being edited
  const [formData, setFormData] = useState({
    deviceModel: '',
    imei: '',
    status: '',
    technicianCost: 0,
  });

  const openEditModal = (device) => {
    setCurrentDevice(device); // Store the current device
    setFormData({
      deviceModel: device.deviceModel,
      imei: device.imei,
      status: device.status,
      technicianCost: device.repairInfo.totalTechnicianCost,
    });
    setShowModal(true); // Open the modal
  };

  const handleDelete = (productId) => {
    dispatch(deleteUnpaidDevice(productId));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault(); // Prevent form reload

    // Dispatch the editDevice thunk to update the device
    dispatch(
      editDevice({
        deviceId: currentDevice._id,
        updatedData: {
          ...currentDevice, // Keep unchanged properties
          deviceModel: formData.deviceModel,
          imei: formData.imei,
          status: formData.status,
          repairInfo: {
            ...currentDevice.repairInfo,
            totalTechnicianCost: formData.technicianCost,
          },
        },
      })
    );

    setShowModal(false); // Close the modal after editing
    setFormData({
      deviceModel: '',
      imei: '',
      status: '',
      technicianCost: 0,
    }); // Reset form data
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border-collapse border border-gray-300 text-black">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Model</th>
            <th className="border border-gray-300 p-2">IMEI</th>
            <th className="border border-gray-300 p-2">Replaced Components</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Technician Cost</th>
            {isSuperAdmin && (
              <th className="border border-gray-300 p-2">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device._id} className="border text-white border-gray-300">
              <td className="border border-gray-300 p-2">
                {device.deviceModel}
              </td>
              <td className="border border-gray-300 p-2">{device.imei}</td>
              <td className="border border-gray-300 p-2">
                {Object.keys(device.repairInfo.repairComponents).join(', ')}
              </td>
              <td className="border border-gray-300 p-2">{device.status}</td>
              <td className="border border-gray-300 p-2 flex justify-between">
                {/* €{device.repairInfo.totalTechnicianCost.toFixed(2)} */}
                {device.paymentStatus === 'Paid'
                  ? device.paymentStatus
                  : `€ ${device.repairInfo.totalTechnicianCost.toFixed(2)}`}
              </td>
              <td>
                <div className=" flex flex-col gap-y-2">
                  <button
                    className="bg-red-600 p-2 rounded-lg leading-none"
                    onClick={() => handleDelete(device._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-green-600 p-2 rounded-lg leading-none"
                    onClick={() => openEditModal(device)} // Open modal on edit click
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4">Edit Device</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Device Model</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    value={formData.deviceModel}
                    onChange={(e) =>
                      setFormData({ ...formData, deviceModel: e.target.value })
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">IMEI</label>
                  <input
                    type="text"
                    className="border rounded w-full py-2 px-3"
                    value={formData.imei}
                    onChange={(e) =>
                      setFormData({ ...formData, imei: e.target.value })
                    }
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">Status</label>
                  <select
                    className="border rounded w-full py-2 px-3"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Ready for Sale">Ready for Sale</option>
                    <option value="To Be Repaired">To Be Repaired</option>
                    <option value="In Confirmation">In Confirmation</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">
                    Technician Cost (€)
                  </label>
                  <input
                    type="number"
                    className="border rounded w-full py-2 px-3"
                    value={formData.technicianCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        technicianCost: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => setShowModal(false)} // Close modal on cancel
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 📌 Full Story Table Component
function FullStoryTable({ groupedPayments }) {
  const handlePrintPDF = (group) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text('Customer Invoice', 14, 20);

    // Customer Details
    doc.setFontSize(12);
    doc.text(`Technician Name: ${group.technicianName}`, 14, 30);
    doc.text(`Technician Email: ${group._id.technicianEmail}`, 14, 37);
    doc.text(
      `Payment Date: ${new Date(group._id.paymentDate).toLocaleDateString()}`,
      14,
      44
    );
    doc.text(`Total Paid: €${group.totalAmount}`, 14, 51);

    // Device Table
    const tableData = group.devices.map((device) => [
      device.deviceType,
      device.condition,
      device.grade,
      device.deviceModel,
      device.deviceBrand,
      device.deviceColor,
      device.memory,
      device.imei,
      `€${device.price}`,
    ]);

    autoTable(doc, {
      startY: 60,
      head: [
        [
          'Device Type',
          'Condition',
          'Grade',
          'Model',
          'Brand',
          'Color',
          'Memory',
          'IMEI',
          'Price (€)',
        ],
      ],
      body: tableData,
    });

    // Save the PDF
    doc.save(`Invoice_${group.technicianName}.pdf`);
  };

  if (!groupedPayments || groupedPayments.length === 0) {
    return <p className="text-center p-4">No payment history available</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-center text-lg font-bold text-white">Last 90 Days Timeline</h3>
      <table className="w-full border-collapse border border-gray-300 mt-4 ">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">GROUP</th>
            <th className="border border-gray-300 p-2">DATE: FROM - TO</th>
            <th className="border border-gray-300 p-2">DATE: PAYMENT</th>
            <th className="border border-gray-300 p-2">COST (€)</th>
            <th className="border border-gray-300 p-2">INVOICE</th>
          </tr>
        </thead>
        <tbody className='text-white'>
          {groupedPayments.map((group, index) => (
            <tr key={index} className="border border-gray-300">
              <td className="border border-gray-300 p-2">GROUP {index + 1}</td>
              <td className="border border-gray-300 p-2">
                {group.devices.length > 0
                  ? `${new Date(
                      group.devices[0].paymentDate
                    ).toLocaleDateString()} - ${new Date(
                      group.devices[group.devices.length - 1].paymentDate
                    ).toLocaleDateString()}`
                  : 'N/A'}
              </td>
              <td className="border border-gray-300 p-2">
                {new Date(group._id.paymentDate).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 p-2">
                €{group.totalAmount}
              </td>
              <td className="border border-gray-300 p-2">
                <button
                  className="bg-green-500 text-white px-4 py-1 rounded-lg"
                  onClick={() => handlePrintPDF(group)}
                >
                  Print
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className='text-white'>
          <tr>
            <td
              colSpan="3"
              className="text-right font-bold border border-gray-300 p-2"
            >
              Total:
            </td>
            <td className="font-bold border border-gray-300 p-2">
              €
              {groupedPayments.reduce(
                (sum, group) => sum + group.totalAmount,
                0
              )}
            </td>
            <td className="border border-gray-300"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// 📌 Print Invoice Function
const printInvoice = (group) => {
  const invoiceData = `
    Technician: ${group.technicianName} (${group._id.technicianEmail})
    Payment Date: ${new Date(group._id.paymentDate).toLocaleDateString()}
    Total Paid: €${group.totalAmount}
    Devices: ${group.devices.map((d) => d.deviceModel).join(', ')}
  `;

  console.log('Printing Invoice:', invoiceData);
  alert('Invoice sent to printer!'); // Replace with actual print logic
};
