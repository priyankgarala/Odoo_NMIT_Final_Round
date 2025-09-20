import { useState, useEffect } from "react";
import { Calculator, Package, DollarSign } from "lucide-react";
import { calculateProductTaxes, formatPrice } from "../utils/taxCalculator";

export default function TaxCalculationDemo() {
  const [demoProduct, setDemoProduct] = useState({
    name: "Sample Product",
    sales_price: 1000,
    purchase_price: 800,
    taxes: [
      {
        tax_id: 1,
        tax_name: "GST 18%",
        tax_value: 18,
        computation_method: "percentage",
        applicable_on: "both"
      },
      {
        tax_id: 2,
        tax_name: "Service Tax 5%",
        tax_value: 5,
        computation_method: "percentage",
        applicable_on: "sales"
      }
    ]
  });

  const [customPrice, setCustomPrice] = useState(1000);
  const [customTaxes, setCustomTaxes] = useState([
    { name: "GST 18%", value: 18, method: "percentage", applicable: "both" },
    { name: "Fixed Tax", value: 50, method: "fixed", applicable: "sales" }
  ]);

  const taxCalculation = calculateProductTaxes(demoProduct);

  const calculateCustomTax = () => {
    const customProduct = {
      sales_price: customPrice,
      purchase_price: customPrice * 0.8,
      taxes: customTaxes.map((tax, index) => ({
        tax_id: index + 1,
        tax_name: tax.name,
        tax_value: tax.value,
        computation_method: tax.method,
        applicable_on: tax.applicable
      }))
    };
    return calculateProductTaxes(customProduct);
  };

  const customCalculation = calculateCustomTax();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Calculator className="w-8 h-8 mr-3 text-blue-600" />
          Tax Calculation Demo
        </h1>
        <p className="text-gray-600">See how taxes are calculated on products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demo Product */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-green-600" />
            Sample Product
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{demoProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sales Price:</span>
                  <span className="font-medium">{formatPrice(demoProduct.sales_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Price:</span>
                  <span className="font-medium">{formatPrice(demoProduct.purchase_price)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tax Calculation</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-600">Sales Price</span>
                    <span className="text-sm font-bold text-green-700">
                      {formatPrice(taxCalculation.sales_price_with_tax)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>{formatPrice(demoProduct.sales_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax:</span>
                      <span className="text-green-600">+{formatPrice(taxCalculation.total_sales_tax)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-600">Purchase Price</span>
                    <span className="text-sm font-bold text-blue-700">
                      {formatPrice(taxCalculation.purchase_price_with_tax)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>{formatPrice(demoProduct.purchase_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax:</span>
                      <span className="text-blue-600">+{formatPrice(taxCalculation.total_purchase_tax)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tax Breakdown</h3>
              <div className="space-y-2">
                {taxCalculation.tax_breakdown.sales.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">Sales Taxes:</p>
                    {taxCalculation.tax_breakdown.sales.map((tax, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-600">{tax.tax_name}</span>
                        <span className="text-green-600">{formatPrice(tax.tax_amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {taxCalculation.tax_breakdown.purchase.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-blue-600 mb-1">Purchase Taxes:</p>
                    {taxCalculation.tax_breakdown.purchase.map((tax, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-600">{tax.tax_name}</span>
                        <span className="text-blue-600">{formatPrice(tax.tax_amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Calculator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
            Custom Calculator
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price
              </label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter price"
              />
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tax Configuration</h3>
              <div className="space-y-2">
                {customTaxes.map((tax, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={tax.name}
                      onChange={(e) => {
                        const newTaxes = [...customTaxes];
                        newTaxes[index].name = e.target.value;
                        setCustomTaxes(newTaxes);
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="Tax name"
                    />
                    <input
                      type="number"
                      value={tax.value}
                      onChange={(e) => {
                        const newTaxes = [...customTaxes];
                        newTaxes[index].value = parseFloat(e.target.value) || 0;
                        setCustomTaxes(newTaxes);
                      }}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="Value"
                    />
                    <select
                      value={tax.method}
                      onChange={(e) => {
                        const newTaxes = [...customTaxes];
                        newTaxes[index].method = e.target.value;
                        setCustomTaxes(newTaxes);
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                    <select
                      value={tax.applicable}
                      onChange={(e) => {
                        const newTaxes = [...customTaxes];
                        newTaxes[index].applicable = e.target.value;
                        setCustomTaxes(newTaxes);
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      <option value="sales">Sales</option>
                      <option value="purchase">Purchase</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Calculation Result</h3>
              <div className="bg-gray-50 p-3 rounded">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">{formatPrice(customPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tax:</span>
                    <span className="font-medium text-green-600">
                      +{formatPrice(customCalculation.total_sales_tax)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Final Price:</span>
                    <span className="text-green-700">
                      {formatPrice(customCalculation.sales_price_with_tax)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
