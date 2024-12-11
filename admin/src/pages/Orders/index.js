import { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Orders.module.scss";

const cx = classNames.bind(styles);

const ORDER_STATUS = {
  PENDING: "PENDING",
  SHIPPING: "SHIPPING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:3003/admin/orders", {
        withCredentials: true,
      });
      console.log("Orders data:", response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return "warning";
      case ORDER_STATUS.SHIPPING:
        return "primary";
      case ORDER_STATUS.COMPLETED:
        return "success";
      case ORDER_STATUS.CANCELLED:
        return "error";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "";
    }
  };

  if (loading) return <div className={cx("loading")}>Loading...</div>;
  if (error) return <div className={cx("error")}>{error}</div>;
  if (!orders || orders.length === 0)
    return <div className={cx("no-data")}>No orders found</div>;

  return (
    <div className={cx("wrapper")}>
      <div className={cx("inner")}>
        <div className={cx("header")}>
          <h2>Orders Management</h2>
          <div className={cx("stats")}>
            <div className={cx("stat-item")}>
              <div className={cx("stat-icon")}>🛍️</div>
              <div className={cx("stat-content")}>
                <span>Total Orders</span>
                <strong>{orders.length}</strong>
              </div>
            </div>
            {Object.values(ORDER_STATUS).map((status) => (
              <div
                key={status}
                className={cx("stat-item", status.toLowerCase())}
              >
                <div className={cx("stat-icon")}>
                  {status === ORDER_STATUS.PENDING && "⏳"}
                  {status === ORDER_STATUS.CONFIRMED && "✅"}
                  {status === ORDER_STATUS.SHIPPING && "🚚"}
                  {status === ORDER_STATUS.DELIVERED && "📦"}
                  {status === ORDER_STATUS.CANCELLED && "❌"}
                </div>
                <div className={cx("stat-content")}>
                  <span>{status}</span>
                  <strong>
                    {orders.filter((order) => order.status === status).length}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cx("table-container")}>
          <table className={cx("orders-table")}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Info</th>
                <th>Products</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>
                    <div className={cx("customer-info")}>
                      <div>{order.shippingAddress.fullName}</div>
                      <div>{order.shippingAddress.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div className={cx("products-info")}>
                      {order.items.map((item, index) => (
                        <div key={index} className={cx("product-item")}>
                          <span>{item.name}</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{formatPrice(order.totalAmount)}</td>
                  <td>
                    <span
                      className={cx(
                        "status-badge",
                        getStatusColor(order.status)
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={cx(
                        "status-badge",
                        getPaymentStatusColor(order.paymentStatus)
                      )}
                    >
                      {order.paymentStatus}
                    </span>
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

export default Orders;
