import classNames from "classnames/bind";
import styles from "./COMPLETED.module.scss";
import axios from "axios";
import { useEffect, useState } from "react";
import defaultSortIcon from "../../../assets/icons/SortAndFilter/defaultSort.svg";
import sort01Icon from "../../../assets/icons/SortAndFilter/sort-0-1.svg";
import sort10Icon from "../../../assets/icons/SortAndFilter/sort-1-0.svg";
import Pagination from "../../Pagination/index";
import eyeIcon from "../../../assets/icons/product/eye.svg";
import OrderDetail from "../OrderDetail";

const cx = classNames.bind(styles);

function Completed() {
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
        "http://localhost:3003/orderSeller/completed",
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
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders(sortState.orderKey, sortState.orderType);
  }, [sortState, pageIndex, pageSize]);

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

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className={cx("table-container")}>
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          viewOnly={true}
        />
      )}

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

export default Completed;
