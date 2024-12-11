import { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Products.module.scss";

const cx = classNames.bind(styles);

const STATUS = {
  PUBLISHED: "PUBLISHED",
  HIDDEN: "HIDDEN",
  VIOLATION: "VIOLATION",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3002/admin/products", {
        withCredentials: true,
      });
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch products");
      setLoading(false);
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3002/admin/products/${productId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchProducts(); // Refresh list after status change
    } catch (error) {
      setError("Failed to update product status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case STATUS.PUBLISHED:
        return "success";
      case STATUS.HIDDEN:
        return "warning";
      case STATUS.VIOLATION:
        return "error";
      default:
        return "";
    }
  };

  if (loading) return <div className={cx("loading")}>Loading...</div>;
  if (error) return <div className={cx("error")}>{error}</div>;

  return (
    <div className={cx("wrapper")}>
      <div className={cx("inner")}>
        <div className={cx("header")}>
          <h2>Products Management</h2>
          <div className={cx("stats")}>
            <div className={cx("stat-item")}>
              <div className={cx("stat-icon")}>📦</div>
              <div className={cx("stat-content")}>
                <span>Total Products</span>
                <strong>{products.length}</strong>
              </div>
            </div>
            <div className={cx("stat-item", "published")}>
              <div className={cx("stat-icon")}>✅</div>
              <div className={cx("stat-content")}>
                <span>Published</span>
                <strong>
                  {
                    products.filter(
                      (product) => product.status === STATUS.PUBLISHED
                    ).length
                  }
                </strong>
              </div>
            </div>
            <div className={cx("stat-item", "hidden")}>
              <div className={cx("stat-icon")}>👁️</div>
              <div className={cx("stat-content")}>
                <span>Hidden</span>
                <strong>
                  {
                    products.filter(
                      (product) => product.status === STATUS.HIDDEN
                    ).length
                  }
                </strong>
              </div>
            </div>
            <div className={cx("stat-item", "violation")}>
              <div className={cx("stat-icon")}>⚠️</div>
              <div className={cx("stat-content")}>
                <span>Violations</span>
                <strong>
                  {
                    products.filter(
                      (product) => product.status === STATUS.VIOLATION
                    ).length
                  }
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className={cx("table-container")}>
          <table className={cx("products-table")}>
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Shop</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className={cx("product-info")}>
                      <img
                        src={"https://" + product.promotionImage}
                        alt={product.name}
                        className={cx("product-image")}
                      />
                      <div className={cx("product-details")}>
                        <span className={cx("product-name")}>
                          {product.name}
                        </span>
                        <span className={cx("product-id")}>
                          ID: {product._id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{product.shop}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span
                      className={cx(
                        "status-badge",
                        getStatusColor(product.status)
                      )}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className={cx("action-buttons")}>
                      <button
                        className={cx("action-btn", "publish")}
                        onClick={() =>
                          handleStatusChange(product._id, STATUS.PUBLISHED)
                        }
                      >
                        Publish
                      </button>
                      <button
                        className={cx("action-btn", "hide")}
                        onClick={() =>
                          handleStatusChange(product._id, STATUS.HIDDEN)
                        }
                      >
                        Hide
                      </button>
                      <button
                        className={cx("action-btn", "violate")}
                        onClick={() =>
                          handleStatusChange(product._id, STATUS.VIOLATION)
                        }
                      >
                        Violate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;
