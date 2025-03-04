
import { useSelector } from 'react-redux';

const ProductsModal = ({ products, totalPrice, onClose }) => {
  const commissionRate = useSelector((state) => state.commission.value);

  const calculateNetProfit = (product) => {
    const actualPrice = products?.products[0].productPrice || 0;
    const soldPrice = products.customTotalPrice;

    // Only include repair costs if repairInfo exists
    if (product?.repairInfo) {
      const costOfComponents = Object.values(
        product.repairInfo.repairComponents || {}
      ).reduce((sum, val) => sum + parseFloat(val || 0), 0);

      const technicianCost = Object.values(
        product.repairInfo.technicainCostByEachComp || {}
      ).reduce((sum, val) => sum + parseFloat(val || 0), 0);

      // Fetch commission from store
      let commission = soldPrice * (commissionRate / 100);
      commission = soldPrice - commission;
      const afterShippingCost = commission - products.shippingCost;
      const netProfit = afterShippingCost - actualPrice;

      const totalCost =
        actualPrice + costOfComponents + technicianCost + products.shippingCost;

      return {
        totalCost,
        netProfit,
        costOfComponents,
        technicianCost,
      };
    } else {
      // If no repair info, only consider arrival cost and shipping
      const totalCost = soldPrice + products.shippingCost;
      let commission = soldPrice * (commissionRate / 100);
      commission = soldPrice - commission;
      const afterShippingCost = commission - products.shippingCost;
      const netProfit = afterShippingCost - actualPrice;

      return {
        totalCost,
        netProfit,
        costOfComponents: 0,
        technicianCost: 0,
      };
    }
  };

  const deviceType = products.products[0].deviceType;
  const condition = products.products[0].condition;
  const brand = products.products[0].brand;
  const model = products.products[0].model;
  const grade = products.products[0].grade;
  const color = products.products[0].color;
  const memory = products.products[0].memory;
  const imei = products.products[0].imei;
  const info = products.products[0].info;
  const originalPrice = products.products[0].productPrice;
  const soldPrice = products.customTotalPrice;
  const { totalCost, netProfit, costOfComponents, technicianCost } =
    calculateNetProfit(products);

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
                <td className="py-2 px-4 border">€{soldPrice}</td>
              </tr>
            </tbody>
          </table>

          {products?.products[0]?.repairInfo ? (
            <div className="mt-4">
              <h3 className="text-xl font-bold mb-2">Repair Info:</h3>
              <p>
                <strong>Technician Name:</strong>{' '}
                {products.products[0].repairInfo.technician?.name || 'N/A'}
              </p>
              <p>
                <strong>Replaced Components:</strong>{' '}
                {Object.keys(
                  products.products[0].repairInfo.repairComponents || {}
                ).join(', ')}
              </p>
            </div>
          ) : null}

          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">All Costs:</h3>
            <p>
              <strong>Arrival Cost:</strong> €
              {products?.products[0]?.productPrice || 0}
            </p>
            {products?.products[0]?.repairInfo && (
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
              <strong>Shipping Cost:</strong> €{products.shippingCost}
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
