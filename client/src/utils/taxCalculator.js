// Tax calculation utilities

export const calculateTaxAmount = (price, taxValue, computationMethod) => {
  if (!price || !taxValue) return 0;
  
  if (computationMethod === 'percentage') {
    return (price * taxValue) / 100;
  } else if (computationMethod === 'fixed') {
    return taxValue;
  }
  
  return 0;
};

export const calculateProductTaxes = (product) => {
  if (!product || !product.taxes || product.taxes.length === 0) {
    return {
      sales_price_with_tax: product?.sales_price || 0,
      purchase_price_with_tax: product?.purchase_price || 0,
      total_sales_tax: 0,
      total_purchase_tax: 0,
      tax_breakdown: {
        sales: [],
        purchase: []
      }
    };
  }

  const salesPrice = parseFloat(product.sales_price) || 0;
  const purchasePrice = parseFloat(product.purchase_price) || 0;
  
  let totalSalesTax = 0;
  let totalPurchaseTax = 0;
  const taxBreakdown = {
    sales: [],
    purchase: []
  };

  // Calculate taxes for each applicable type
  product.taxes.forEach(tax => {
    const taxAmount = calculateTaxAmount(
      tax.applicable_on === 'sales' ? salesPrice : purchasePrice,
      tax.tax_value,
      tax.computation_method
    );

    const taxInfo = {
      tax_id: tax.tax_id,
      tax_name: tax.tax_name,
      tax_value: tax.tax_value,
      computation_method: tax.computation_method,
      applicable_on: tax.applicable_on,
      tax_amount: taxAmount
    };

    if (tax.applicable_on === 'sales' || tax.applicable_on === 'both') {
      totalSalesTax += taxAmount;
      taxBreakdown.sales.push(taxInfo);
    }

    if (tax.applicable_on === 'purchase' || tax.applicable_on === 'both') {
      totalPurchaseTax += taxAmount;
      taxBreakdown.purchase.push(taxInfo);
    }
  });

  return {
    sales_price_with_tax: salesPrice + totalSalesTax,
    purchase_price_with_tax: purchasePrice + totalPurchaseTax,
    total_sales_tax: totalSalesTax,
    total_purchase_tax: totalPurchaseTax,
    tax_breakdown: taxBreakdown
  };
};

export const formatPrice = (price, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(price || 0);
};

export const getTaxDisplayText = (tax) => {
  const value = tax.tax_value;
  const method = tax.computation_method;
  const applicable = tax.applicable_on;
  
  let displayText = `${tax.tax_name} (${value}${method === 'percentage' ? '%' : '₹'})`;
  
  if (applicable === 'sales') {
    displayText += ' - Sales';
  } else if (applicable === 'purchase') {
    displayText += ' - Purchase';
  } else if (applicable === 'both') {
    displayText += ' - Both';
  }
  
  return displayText;
};
