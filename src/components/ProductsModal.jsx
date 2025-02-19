import React from 'react';

const ProductsModal = ({ products, totalPrice, onClose }) => {
  console.log(products, '======> products');
  console.log(totalPrice, '======> totalPrice');
  console.log(onClose, '======> onClose');

  const calculateNetProfit = (product) => {
    const actualPrice = products?.products[0].productPrice || 0;
    const soldPrice = products.totalPrice;
    console.log(actualPrice);

    // Only include repair costs if repairInfo exists
    if (product?.repairInfo) {
      const costOfComponents = Object.values(
        product.repairInfo.repairComponents || {}
      ).reduce((sum, val) => sum + parseFloat(val || 0), 0);

      const technicianCost = Object.values(
        product.repairInfo.technicainCostByEachComp || {}
      ).reduce((sum, val) => sum + parseFloat(val || 0), 0);

     
      let commission = soldPrice * (15 / 100);
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
      let commission = soldPrice * (15 / 100);
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      <div className="bg-white text-black p-6 rounded-lg w-11/12 max-w-6xl overflow-y-auto">
        <h2 className="text-2xl mb-4">Sales Details</h2>
        {products.products.length > 0 ? (
          products.products.map((product, productIndex) => {
            const { totalCost, netProfit, costOfComponents, technicianCost } =
              calculateNetProfit(product);

            return (
              <div key={productIndex} className="mb-6 border p-4 rounded-lg">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-200 text-black">
                      <th className="text-left py-2 px-4 border">
                        Device Type
                      </th>
                      <th className="text-left py-2 px-4 border">Condition</th>
                      <th className="text-left py-2 px-4 border">Brand</th>
                      <th className="text-left py-2 px-4 border">Model</th>
                      <th className="text-left py-2 px-4 border">Grade</th>
                      <th className="text-left py-2 px-4 border">Color</th>
                      <th className="text-left py-2 px-4 border">Memory</th>
                      <th className="text-left py-2 px-4 border">IMEI</th>
                      <th className="text-left py-2 px-4 border">Info</th>
                      <th className="text-left py-2 px-4 border">
                        Original Price
                      </th>
                      <th className="text-left py-2 px-4 border">Sold Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="py-2 px-4 border">{product.deviceType}</td>
                      <td className="py-2 px-4 border">{product.condition}</td>
                      <td className="py-2 px-4 border">{product.brand}</td>
                      <td className="py-2 px-4 border">{product.model}</td>
                      <td className="py-2 px-4 border">{product.grade}</td>
                      <td className="py-2 px-4 border">{product.color}</td>
                      <td className="py-2 px-4 border">{product.memory}</td>
                      <td className="py-2 px-4 border">{product.imei}</td>
                      <td className="py-2 px-4 border">{product.info}</td>
                      <td className="py-2 px-4 border">
                        €{product.productPrice}
                      </td>
                      <td className="py-2 px-4 border">€{totalPrice}</td>
                    </tr>
                  </tbody>
                </table>
                {product?.repairInfo ? (
                  <div className="mt-4">
                    <h3 className="text-xl font-bold mb-2">Repair Info:</h3>
                    <p>
                      <strong>Technician Name:</strong>{' '}
                      {product.repairInfo.technician?.name || 'N/A'}
                    </p>
                    <p>
                      <strong>Replaced Components:</strong>{' '}
                      {Object.keys(
                        product.repairInfo.repairComponents || {}
                      ).join(', ')}
                    </p>
                  </div>
                ) : null}
                <div className="mt-4">
                  <h3 className="text-xl font-bold mb-2">All Costs:</h3>
                  <p>
                    <strong>Arrival Cost:</strong> €{product?.productPrice || 0}
                  </p>
                  {product?.repairInfo && (
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
            );
          })
        ) : (
          <p>No sales available.</p>
        )}
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
