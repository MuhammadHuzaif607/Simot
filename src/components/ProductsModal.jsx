const ProductsModal = ({ products, totalPrice, onClose, commission }) => {
  const calculateNetProfit = (product) => {
    const actualPrice = product?.productPrice || 0;
    const soldPrice = products.customTotalPrice || 0;
    let totalTechnicianCost = products?.products[0]?.repairInfo?.totalCost || 0;

    let commissionAmount = soldPrice * (commission / 100);
    const afterCommission = soldPrice - commissionAmount;
    const afterShippingCost = afterCommission - products.shippingCost;

    if (product?.repairInfo) {
      const costOfComponents = Object.values(
        product.repairInfo.repairComponents || {}
      ).reduce((sum, val) => sum + parseFloat(val || 0), 0);

      const technicianCost = Object.values(
        product.repairInfo.technicainCostByEachComp || {}
      ).reduce((sum, val) => sum + parseFloat(val || 0), 0);

      const totalCost =
        actualPrice + costOfComponents + technicianCost + products.shippingCost;
      const netProfit = afterShippingCost - actualPrice - totalTechnicianCost;

      return {
        totalCost,
        netProfit,
        costOfComponents,
        technicianCost,
      };
    } else {
      // No repair info, only consider arrival cost and shipping
      const totalCost = actualPrice + products.shippingCost;
      const netProfit = afterShippingCost - actualPrice;

      return {
        totalCost,
        netProfit,
        costOfComponents: 0,
        technicianCost: 0,
      };
    }
  };

  const productDetails = products?.products[0] || {};
  const {
    deviceType,
    condition,
    brand,
    model,
    grade,
    color,
    memory,
    imei,
    info,
    productPrice: originalPrice,
  } = productDetails;

  const { totalCost, netProfit, costOfComponents, technicianCost } =
    calculateNetProfit(productDetails);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      <div className="bg-white text-black p-6 rounded-lg w-11/12 max-w-6xl overflow-y-auto">
        <h2 className="text-2xl mb-4">Sales Details</h2>
        <div className="mb-6 border p-4 rounded-lg">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200 text-black">
                <th className="text-left py-2 px-4 border">Device Type</th>
                <th className="text-left py-2 px-4 border">Condition</th>
                <th className="text-left py-2 px-4 border">Brand</th>
                <th className="text-left py-2 px-4 border">Model</th>
                <th className="text-left py-2 px-4 border">Grade</th>
                <th className="text-left py-2 px-4 border">Color</th>
                <th className="text-left py-2 px-4 border">Memory</th>
                <th className="text-left py-2 px-4 border">IMEI</th>
                <th className="text-left py-2 px-4 border">Info</th>
                <th className="text-left py-2 px-4 border">Original Price</th>
                <th className="text-left py-2 px-4 border">Sold Price</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2 px-4 border">{deviceType}</td>
                <td className="py-2 px-4 border">{condition}</td>
                <td className="py-2 px-4 border">{brand}</td>
                <td className="py-2 px-4 border">{model}</td>
                <td className="py-2 px-4 border">{grade}</td>
                <td className="py-2 px-4 border">{color}</td>
                <td className="py-2 px-4 border">{memory}</td>
                <td className="py-2 px-4 border">{imei}</td>
                <td className="py-2 px-4 border">{info}</td>
                <td className="py-2 px-4 border">€{originalPrice}</td>
                <td className="py-2 px-4 border">
                  €{products.customTotalPrice}
                </td>
              </tr>
            </tbody>
          </table>

          {productDetails.repairInfo && (
            <div className="mt-4">
              <h3 className="text-xl font-bold mb-2">Repair Info:</h3>
              <p>
                <strong>Technician Name:</strong>{' '}
                {productDetails.repairInfo.technician?.name || 'N/A'}
              </p>
              <p>
                <strong>Replaced Components:</strong>{' '}
                {Object.keys(
                  productDetails.repairInfo.repairComponents || {}
                ).join(', ') || 'N/A'}
              </p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">All Costs:</h3>
            <p>
              <strong>Arrival Cost:</strong> €{originalPrice || 0}
            </p>
            {productDetails.repairInfo && (
              <>
                <p>
                  <strong>Cost of Components:</strong> €{costOfComponents}
                </p>
                <p>
                  <strong>Technician Costs:</strong> €{technicianCost}
                </p>
              </>
            )}
            <p>
              <strong>Shipping Cost:</strong> €{products.shippingCost || 0}
            </p>
            <p>
              <strong>Total Cost:</strong> €{totalCost.toFixed(2)}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-bold text-green-600">
              Net Profit: €{netProfit.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsModal;
