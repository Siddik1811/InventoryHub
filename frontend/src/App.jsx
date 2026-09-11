import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw
} from "lucide-react";

const API_URL = "http://localhost:5000/api/products";

const emptyForm = {
  name: "",
  category: "Electronics",
  price: "",
  quantity: "",
  supplier: ""
};

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch products");
      }

      setProducts(result.data);
    } catch (err) {
      setError(
        "Unable to connect to the backend. Make sure the server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((product) => product.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.supplier.toLowerCase().includes(searchTerm);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const stats = useMemo(() => {
    const totalQuantity = products.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    const inventoryValue = products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    const lowStock = products.filter(
      (product) =>
        product.quantity > 0 && product.quantity <= 10
    ).length;

    const outOfStock = products.filter(
      (product) => product.quantity === 0
    ).length;

    return {
      totalProducts: products.length,
      totalQuantity,
      inventoryValue,
      lowStock,
      outOfStock
    };
  }, [products]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      supplier: product.supplier
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.category) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: Number(form.price),
          quantity: Number(form.quantity),
          supplier: form.supplier
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Operation failed");
      }

      await fetchProducts();
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Delete failed");
      }

      setProducts((previous) =>
        previous.filter((product) => product.id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Boxes size={25} />
          </div>

          <div>
            <h1>InventoryHub</h1>
            <p>Smart Inventory Management</p>
          </div>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchProducts}
          title="Refresh inventory"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <span className="eyebrow">INVENTORY DASHBOARD</span>
            <h2>Manage your inventory effortlessly.</h2>
            <p>
              Track products, stock levels and inventory value
              from one simple dashboard.
            </p>
          </div>

          <button className="primary-btn" onClick={openAddModal}>
            <Plus size={19} />
            Add Product
          </button>
        </section>

        {error && (
          <div className="error-box">
            <AlertTriangle size={19} />
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Package size={22} />
            </div>
            <div>
              <span>Total Products</span>
              <strong>{stats.totalProducts}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Boxes size={22} />
            </div>
            <div>
              <span>Total Units</span>
              <strong>{stats.totalQuantity}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <DollarSign size={22} />
            </div>
            <div>
              <span>Inventory Value</span>
              <strong>{formatCurrency(stats.inventoryValue)}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <AlertTriangle size={22} />
            </div>
            <div>
              <span>Low Stock</span>
              <strong>{stats.lowStock}</strong>
            </div>
          </div>
        </section>

        <section className="inventory-card">
          <div className="section-header">
            <div>
              <h3>Products</h3>
              <p>
                {filteredProducts.length} products displayed
              </p>
            </div>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search products, category or supplier..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading">
              <RefreshCw className="spin" size={25} />
              Loading inventory...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty">
              <Package size={40} />
              <h3>No products found</h3>
              <p>Try changing your search or category filter.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-name">
                          <div className="product-avatar">
                            {product.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{product.name}</strong>
                            <small>#{product.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>{product.category}</td>

                      <td>
                        <strong>
                          {formatCurrency(product.price)}
                        </strong>
                      </td>

                      <td>{product.quantity}</td>

                      <td>{product.supplier}</td>

                      <td>
                        <span
                          className={`status ${product.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {product.status}
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="icon-btn edit"
                            onClick={() =>
                              openEditModal(product)
                            }
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className="icon-btn delete"
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {showModal && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <div
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>
                  {editingId ? "Edit Product" : "Add Product"}
                </h3>
                <p>
                  {editingId
                    ? "Update product information."
                    : "Add a new item to your inventory."}
                </p>
              </div>

              <button className="close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Product Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Laptop"
                    required
                  />
                </label>

                <label>
                  Category
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                  >
                    <option>Electronics</option>
                    <option>Accessories</option>
                    <option>Furniture</option>
                    <option>Office Supplies</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Price (₹)
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="5000"
                    required
                  />
                </label>

                <label>
                  Quantity
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={form.quantity}
                    onChange={handleInputChange}
                    placeholder="10"
                    required
                  />
                </label>

                <label className="full">
                  Supplier
                  <input
                    name="supplier"
                    value={form.supplier}
                    onChange={handleInputChange}
                    placeholder="Supplier name"
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;