import { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Orders.module.scss";
import OrderCard from "../../components/Cards/OrderCard";

const cx = classNames.bind(styles);

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:3003/order/all", {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx("orders-container")}>
      <h2>My Orders</h2>
      <div className={cx("orders-list")}>
        {orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order._id} order={order} />)
        ) : (
          <div className={cx("no-orders")}>
            <p>You haven't placed any orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
