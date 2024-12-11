import classNames from "classnames/bind";
import styles from "./AllOrders.module.scss";
import axios from "axios";
import { useEffect, useState } from "react";
import defaultSortIcon from "../../../assets/icons/SortAndFilter/defaultSort.svg";
import sortAZIcon from "../../../assets/icons/SortAndFilter/sort-a-z.svg";
import sortZAIcon from "../../../assets/icons/SortAndFilter/sort-z-a.svg";
import sort01Icon from "../../../assets/icons/SortAndFilter/sort-0-1.svg";
import sort10Icon from "../../../assets/icons/SortAndFilter/sort-1-0.svg";
import Pagination from "../../Pagination/index";
import shippingIcon from "../../../assets/icons/order/shipping.svg";
import eyeIcon from "../../../assets/icons/product/eye.svg";
import OrderDetail from "../OrderDetail";
import Swal from "sweetalert2";
import pendingIcon from "../../../assets/icons/order/pending.svg";
import completedIcon from "../../../assets/icons/order/completed.svg";
import cancelledIcon from "../../../assets/icons/order/cancelled.svg";

const cx = classNames.bind(styles);

function All() {
  const [sortState, setSortState] = useState({
    orderKey: null,
    orderType: null,
  });

  const [orders, setOrders] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (orderKey, orderType) => {
    try {
      const response = await axios.get(
        "http://localhost:3003/orderSeller/all",
        {
          params: {
            orderKey: orderKey,
            orderType: orderType,
            pageIndex: pageIndex,
            pageSize: pageSize,
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
      } else {
        console.error("Unexpected status code:", response.status);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders(sortState.orderKey, sortState.orderType);
  }, [sortState, pageIndex, pageSize]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (sortState.orderKey) {
      params.set("orderKey", sortState.orderKey);
      params.set("orderType", sortState.orderType);
    } else {
      params.delete("orderKey");
      params.delete("orderType");
    }
    window.history.replaceState(null, "", "?" + params.toString());
  }, [sortState]);

  const handleSortClick = (key) => {
    setSortState((prevState) => {
      let newOrderType = null;
      if (prevState.orderKey === key) {
        if (prevState.orderType === null) newOrderType = "asc";
        else if (prevState.orderType === "asc") newOrderType = "dsc";
        else newOrderType = null;
      } else {
        newOrderType = "asc";
      }

      return {
        orderKey: newOrderType ? key : null,
        orderType: newOrderType,
      };
    });
  };

  const handleCompleteShipping = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Shipping",
        text: "Are you sure you want to complete this shipping?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#8c52ff",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, complete it!",
      });

      if (result.isConfirmed) {
        const response = await axios.patch(
          `http://localhost:3003/orderSeller/${orderId}/shipping`,
          {
            shippingDate: new Date(),
          },
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          await Swal.fire({
            title: "Success!",
            text: "Order has been updated to shipping status",
            icon: "success",
            confirmButtonColor: "#8c52ff",
          });
          setSelectedOrder(null); // Close the detail modal
          fetchOrders(sortState.orderKey, sortState.orderType);
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      await Swal.fire({
        title: "Error!",
        text: "Failed to update order status",
        icon: "error",
        confirmButtonColor: "#8c52ff",
      });
    }
  };

  const handleCompleteAllOrders = async () => {
    try {
      const result = await Swal.fire({
        title: "Complete All Orders",
        text: "Are you sure you want to complete all pending orders?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#8c52ff",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, complete all!",
      });

      if (result.isConfirmed) {
        const response = await axios.patch(
          "http://localhost:3003/orderSeller/complete-all",
          {
            shippingDate: new Date(),
          },
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          await Swal.fire({
            title: "Success!",
            text: `${response.data.modifiedCount} orders have been updated to shipping status`,
            icon: "success",
            confirmButtonColor: "#8c52ff",
          });
          fetchOrders(sortState.orderKey, sortState.orderType);
        }
      }
    } catch (error) {
      console.error("Error updating orders:", error);
      await Swal.fire({
        title: "Error!",
        text: "Failed to update orders",
        icon: "error",
        confirmButtonColor: "#8c52ff",
      });
    }
  };

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrder(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return pendingIcon;
      case "SHIPPING":
        return shippingIcon;
      case "COMPLETED":
        return completedIcon;
      case "CANCELLED":
        return cancelledIcon;
      default:
        return pendingIcon;
    }
  };

  return (
    <div className={cx("table-container")}>
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCompleteShipping={handleCompleteShipping}
        />
      )}

      <button
        className={cx("complete-all-button")}
        onClick={handleCompleteAllOrders}
      >
        Complete All Orders
      </button>
      <table className={cx("table")}>
        <thead>
          <tr>
            <td>
              <span className={cx("table-head")}>Order ID</span>
            </td>
            <td>
              <button onClick={() => handleSortClick("createdAt")}>
                <span className={cx("table-head")}>Order Date</span>
                <img
                  src={
                    sortState.orderKey === "createdAt" &&
                    sortState.orderType === "asc"
                      ? sort01Icon
                      : sortState.orderKey === "createdAt" &&
                        sortState.orderType === "dsc"
                      ? sort10Icon
                      : defaultSortIcon
                  }
                  alt="sort icon"
                />
              </button>
            </td>
            <td>
              <span className={cx("table-head")}>Customer Info</span>
            </td>
            <td>
              <button onClick={() => handleSortClick("status")}>
                <span className={cx("table-head")}>Status</span>
                <img
                  src={
                    sortState.orderKey === "status" &&
                    sortState.orderType === "asc"
                      ? sortAZIcon
                      : sortState.orderKey === "status" &&
                        sortState.orderType === "dsc"
                      ? sortZAIcon
                      : defaultSortIcon
                  }
                  alt="sort icon"
                />
              </button>
            </td>
            <td>
              <span className={cx("table-head")}>Products</span>
            </td>
            <td>
              <button onClick={() => handleSortClick("totalAmount")}>
                <span className={cx("table-head")}>Total Amount</span>
                <img
                  src={
                    sortState.orderKey === "totalAmount" &&
                    sortState.orderType === "asc"
                      ? sort01Icon
                      : sortState.orderKey === "totalAmount" &&
                        sortState.orderType === "dsc"
                      ? sort10Icon
                      : defaultSortIcon
                  }
                  alt="sort icon"
                />
              </button>
            </td>
            <td>
              <span className={cx("table-head")}>Actions</span>
            </td>
          </tr>
        </thead>
        <tbody>
          {orders &&
            orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <div
                    className={cx("order-id-container")}
                    onClick={() => handleViewOrderDetail(order)}
                  >
                    <button className={cx("eye-button")}>
                      <img src={eyeIcon} alt="view detail" />
                    </button>
                    <span className={cx("order-id")}>{order._id}</span>
                  </div>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={cx("customer-info")}>
                    <span>{order.shippingAddress?.fullName}</span>
                    <span>{order.shippingAddress?.phone}</span>
                  </div>
                </td>
                <td>
                  <div className={cx(`status-${order.status.toLowerCase()}`)}>
                    <img
                      src={getStatusIcon(order.status)}
                      alt={order.status}
                      className={cx("status-icon")}
                    />
                    <span>{order.status}</span>
                  </div>
                </td>
                <td>
                  <div className={cx("products-container")}>
                    {order.items.map((item, index) => (
                      <div key={index} className={cx("product-row")}>
                        <div className={cx("product-info")}>
                          <span className={cx("product-name")}>
                            {item.productSnapshot.name}
                          </span>
                          {item.productSnapshot.value1 && (
                            <span className={cx("product-options")}>
                              {item.productSnapshot.type1}:{" "}
                              {item.productSnapshot.value1}
                              {item.productSnapshot.value2 &&
                                ` | ${item.productSnapshot.type2}: ${item.productSnapshot.value2}`}
                            </span>
                          )}
                        </div>
                        <span className={cx("product-quantity")}>
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td>{order.totalAmount.toLocaleString()} VND</td>
                <td>
                  <button
                    className={cx("action-button")}
                    onClick={() => handleCompleteShipping(order._id)}
                    disabled={order.status !== "PENDING"}
                  >
                    <img src={shippingIcon} alt="shipping icon" />
                    Complete Shipping
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className={cx("page-size-container")}>
        <label htmlFor="pageSize">Orders Display</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <Pagination
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        totalPages={totalPages}
      />
    </div>
  );
}

export default All;
