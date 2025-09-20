import React, { useState, useEffect } from "react";

// Dummy API endpoints (replace with real API calls)
const API = {
    getVendors: async () => [
        { id: 1, name: "Vendor A" },
        { id: 2, name: "Vendor B" },
    ],
    getProducts: async () => [
        { id: 1, name: "Product X", price: 100 },
        { id: 2, name: "Product Y", price: 200 },
    ],
    createPurchaseOrder: async (data) => {
        // Simulate API call
        return { success: true, id: Math.floor(Math.random() * 1000), ...data };
    },
};

const STATUS_OPTIONS = [
    "DRAFT",
    "CONFIRMED",
    "BILLED",
    "CANCELLED",
];

function PurchaseOrder() {
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [order, setOrder] = useState({
        vendor_id: "",
        order_date: new Date().toISOString().slice(0, 10),
        status: "DRAFT",
        items: [],
    });
    const [item, setItem] = useState({
        product_id: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 0,
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        API.getVendors().then(setVendors);
        API.getProducts().then(setProducts);
    }, []);

    const handleOrderChange = (e) => {
        setOrder({ ...order, [e.target.name]: e.target.value });
    };

    const handleItemChange = (e) => {
        setItem({ ...item, [e.target.name]: e.target.value });
    };

    const addItem = () => {
        const product = products.find((p) => p.id === Number(item.product_id));
        if (!product) return;
        const quantity = parseFloat(item.quantity);
        const unit_price = parseFloat(item.unit_price || product.price);
        const tax_rate = parseFloat(item.tax_rate);
        const line_total = quantity * unit_price;
        const tax_amount = (line_total * tax_rate) / 100;
        setOrder( {
            ...order,
            items: [
                ...order.items,
                {
                    ...item,
                    product_id: product.id,
                    product_name: product.name,
                    quantity,
                    unit_price,
                    tax_rate,
                    tax_amount,
                    line_total,
                },
            ],
        });
        setItem({ product_id: "", quantity: 1, unit_price: 0, tax_rate: 0 });
    };

    const removeItem = (idx) => {
        setOrder({
            ...order,
            items: order.items.filter((_, i) => i !== idx),
        });
    };

    const calculateTotals = () => {
        let total_amount = 0;
        let tax_amount = 0;
        order.items.forEach((it) => {
            total_amount += it.line_total;
            tax_amount += it.tax_amount;
        });
        return {
            total_amount: total_amount.toFixed(2),
            tax_amount: tax_amount.toFixed(2),
            grand_total: (total_amount + tax_amount).toFixed(2),
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totals = calculateTotals();
        const payload = {
            ...order,
            total_amount: totals.total_amount,
            tax_amount: totals.tax_amount,
            grand_total: totals.grand_total,
        };
        const res = await API.createPurchaseOrder(payload);
        if (res.success) {
            setMessage("Purchase Order Created! ID: " + res.id);
            setOrder({
                vendor_id: "",
                order_date: new Date().toISOString().slice(0, 10),
                status: "DRAFT",
                items: [],
            });
        } else {
            setMessage("Failed to create Purchase Order.");
        }
    };

    const totals = calculateTotals();

    return (
        <div style={{ maxWidth: 800, margin: "auto" }}>
            <h2>Create Purchase Order</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Vendor:</label>
                    <select
                        name="vendor_id"
                        value={order.vendor_id}
                        onChange={handleOrderChange}
                        required
                    >
                        <option value="">Select Vendor</option>
                        {vendors.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Order Date:</label>
                    <input
                        type="date"
                        name="order_date"
                        value={order.order_date}
                        onChange={handleOrderChange}
                        required
                    />
                </div>
                <div>
                    <label>Status:</label>
                    <select
                        name="status"
                        value={order.status}
                        onChange={handleOrderChange}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
                <hr />
                <h4>Add Item</h4>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                        name="product_id"
                        value={item.product_id}
                        onChange={handleItemChange}
                    >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="0.01"
                        value={item.quantity}
                        onChange={handleItemChange}
                        placeholder="Quantity"
                    />
                    <input
                        type="number"
                        name="unit_price"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={handleItemChange}
                        placeholder="Unit Price"
                    />
                    <input
                        type="number"
                        name="tax_rate"
                        min="0"
                        step="0.01"
                        value={item.tax_rate}
                        onChange={handleItemChange}
                        placeholder="Tax Rate (%)"
                    />
                    <button type="button" onClick={addItem}>
                        Add
                    </button>
                </div>
                <table border="1" cellPadding="4" style={{ marginTop: 16, width: "100%" }}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Tax Rate (%)</th>
                            <th>Tax Amt</th>
                            <th>Line Total</th>
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((it, idx) => (
                            <tr key={idx}>
                                <td>{it.product_name}</td>
                                <td>{it.quantity}</td>
                                <td>{it.unit_price}</td>
                                <td>{it.tax_rate}</td>
                                <td>{it.tax_amount.toFixed(2)}</td>
                                <td>{it.line_total.toFixed(2)}</td>
                                <td>
                                    <button type="button" onClick={() => removeItem(idx)}>
                                        X
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {order.items.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center" }}>
                                    No items added.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div style={{ marginTop: 16 }}>
                    <strong>Total Amount:</strong> ₹{totals.total_amount} <br />
                    <strong>Tax Amount:</strong> ₹{totals.tax_amount} <br />
                    <strong>Grand Total:</strong> ₹{totals.grand_total}
                </div>
                <button type="submit" style={{ marginTop: 16 }}>
                    Submit Purchase Order
                </button>
            </form>
            {message && <div style={{ marginTop: 16, color: "green" }}>{message}</div>}
        </div>
    );
}

export default PurchaseOrder;