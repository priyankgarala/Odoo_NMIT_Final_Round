import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { getAllTaxes } from "../api/tax";

export default function TaxSelector({ 
  selectedTaxes = [], 
  onChange, 
  applicableOn = "both",
  disabled = false 
}) {
  const [availableTaxes, setAvailableTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTaxes();
  }, [applicableOn]);

  const fetchTaxes = async () => {
    setLoading(true);
    setError("");
    try {
      const taxes = await getAllTaxes(axiosInstance, applicableOn);
      console.log("Fetched taxes:", taxes); // Debug log
      setAvailableTaxes(taxes.filter(tax => tax.is_active));
    } catch (err) {
      console.error("Error fetching taxes:", err); // Debug log
      setError("Failed to load taxes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTax = (tax) => {
    const isAlreadySelected = selectedTaxes.some(selected => 
      selected.tax_id === tax.id && selected.applicable_on === applicableOn
    );
    
    if (!isAlreadySelected) {
      const newTax = {
        tax_id: tax.id,
        applicable_on: applicableOn,
        tax_name: tax.name,
        tax_value: tax.value,
        computation_method: tax.computation_method
      };
      onChange([...selectedTaxes, newTax]);
    }
  };

  const handleRemoveTax = (taxId) => {
    const updatedTaxes = selectedTaxes.filter(tax => 
      !(tax.tax_id === taxId && tax.applicable_on === applicableOn)
    );
    onChange(updatedTaxes);
  };

  const getTaxDisplayName = (tax) => {
    return `${tax.tax_name} (${tax.tax_value}${tax.computation_method === 'percentage' ? '%' : '₹'})`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Taxes for {applicableOn === "both" ? "Sales & Purchase" : applicableOn}
      </label>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {/* Selected Taxes */}
      {selectedTaxes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Selected taxes:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTaxes
              .filter(tax => tax.applicable_on === applicableOn)
              .map((tax) => (
                <span
                  key={`${tax.tax_id}-${tax.applicable_on}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {getTaxDisplayName(tax)}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTax(tax.tax_id)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Available Taxes Dropdown */}
      {!disabled && (
        <div className="relative">
          <select
            onChange={(e) => {
              if (e.target.value) {
                const tax = availableTaxes.find(t => t.id === parseInt(e.target.value));
                if (tax) handleAddTax(tax);
                e.target.value = "";
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="">Add a tax...</option>
            {availableTaxes
              .filter(tax => 
                !selectedTaxes.some(selected => 
                  selected.tax_id === tax.id && selected.applicable_on === applicableOn
                )
              )
              .map((tax) => (
                <option key={tax.id} value={tax.id}>
                  {tax.name} ({tax.value}{tax.computation_method === 'percentage' ? '%' : '₹'}) - {tax.applicable_on}
                </option>
              ))}
          </select>
        </div>
      )}

      {availableTaxes.length === 0 && !loading && (
        <div className="text-sm text-gray-500 text-center py-2">
          No taxes available for {applicableOn === "both" ? "sales & purchase" : applicableOn}
        </div>
      )}
    </div>
  );
}
