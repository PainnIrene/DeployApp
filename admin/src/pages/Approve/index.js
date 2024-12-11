import { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Approve.module.scss";

const cx = classNames.bind(styles);

function Approve() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3002/admin/products/refer",
        {
          withCredentials: true,
        }
      );
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (productId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3002/admin/products/${productId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      // Remove the product from the list after successful update
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Failed to update product status");
    }
  };

  if (loading) return <div className={cx("loading")}>Loading...</div>;
  if (error) return <div className={cx("error")}>{error}</div>;
  if (!products || products.length === 0)
    return <div className={cx("no-data")}>No products pending approval</div>;

  return (
    <div className={cx("wrapper")}>
      <div className={cx("inner")}>
        <div className={cx("header")}>
          <h2>Products Pending Approval</h2>
          <span className={cx("count")}>{products.length} items</span>
        </div>

        <div className={cx("products-grid")}>
          {products.map((product) => (
            <div key={product._id} className={cx("product-card")}>
              <div className={cx("product-images")}>
                {/* Main promotion image */}
                {product.promotionImage && (
                  <img
                    src={"https://" + product.promotionImage}
                    alt={product.name}
                    className={cx("main-image")}
                  />
                )}
                {/* Additional images gallery */}
                <div className={cx("image-gallery")}>
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={"https://" + image}
                      alt={`${product.name} - ${index + 1}`}
                      className={cx("gallery-image")}
                    />
                  ))}
                </div>
              </div>

              <div className={cx("product-info")}>
                <h3 className={cx("product-name")}>{product.name}</h3>
                <p className={cx("product-description")}>
                  {product.description}
                </p>
              </div>

              <div className={cx("action-buttons")}>
                <button
                  className={cx("btn", "accept")}
                  onClick={() => handleStatusUpdate(product._id, "PUBLISHED")}
                >
                  Accept
                </button>
                <button
                  className={cx("btn", "decline")}
                  onClick={() => handleStatusUpdate(product._id, "VIOLATION")}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Approve;
