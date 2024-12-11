import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./OrderDetails.module.scss";
import Swal from "sweetalert2";
import CurrencyFormat from "../../components/General/CurrencyFormat/index.js";
import backIcon from "../../assets/icons/back.svg";
import Rating from "../../components/Rating/index.js";
import { useUser } from "../../contexts/userContext/userContext.js";

const cx = classNames.bind(styles);

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRatings, setProductRatings] = useState({});

  const checkRatingStatus = async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:3002/rating/check/${orderId}/${productId}`,
        { withCredentials: true }
      );
      setProductRatings((prev) => ({
        ...prev,
        [productId]: response.data.hasRated,
      }));
    } catch (error) {
      console.error("Error checking rating status:", error);
    }
  };

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3003/order/${orderId}`,
        { withCredentials: true }
      );

      if (response.data && response.data._id) {
        setOrder(response.data);
      } else {
        setError("Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while fetching order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: "Cancel Order",
      text: "Are you sure you want to cancel this order? The refund will be processed within 24 hours.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4d4f",
      cancelButtonColor: "#666",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(
          `http://localhost:3003/order/${orderId}/cancel`,
          {},
          {
            withCredentials: true,
          }
        );

        Swal.fire(
          "Cancelled!",
          "Your order has been cancelled. The refund will be processed soon.",
          "success"
        );

        // Refresh order details
        fetchOrderDetails();
      } catch (error) {
        Swal.fire(
          "Error",
          "Failed to cancel the order. Please try again.",
          "error"
        );
      }
    }
  };

  const handleCompleteOrder = async () => {
    const result = await Swal.fire({
      title: "Confirm Receipt",
      text: "Have you received your order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#52c41a",
      cancelButtonColor: "#666",
      confirmButtonText: "Yes, I received it",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(
          `http://localhost:3003/order/${orderId}/complete`,
          {},
          {
            withCredentials: true,
          }
        );

        Swal.fire(
          "Completed!",
          "Thank you for confirming your order receipt.",
          "success"
        );

        // Refresh order details
        fetchOrderDetails();
      } catch (error) {
        Swal.fire(
          "Error",
          "Failed to complete the order. Please try again.",
          "error"
        );
      }
    }
  };

  const handleRateProduct = (item) => {
    if (!user) {
      Swal.fire("Error", "Please login to rate products", "error");
      return;
    }

    console.log("Selected item for rating:", item);
    setSelectedProduct({
      _id: item.productId,
      ...item.productSnapshot,
    });
    setIsRatingModalOpen(true);
  };

  if (loading) {
    return <div className={cx("loading-container")}></div>;
  }

  if (error) {
    return (
      <div className={cx("error-container")}>
        <div className={cx("error-message")}>{error}</div>
        <button
          className={cx("back-button")}
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={cx("not-found-container")}>
        <div className={cx("not-found")}>Order not found</div>
        <button
          className={cx("back-button")}
          onClick={() => navigate("/orders")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className={cx("order-details")}>
      <button className={cx("back-button")} onClick={() => navigate("/orders")}>
        <img src={backIcon} alt="back" /> Back to Orders
      </button>

      <div className={cx("order-header")}>
        <h2>Order Details</h2>
        <div className={cx("order-meta")}>
          <div className={cx("order-id")}>Order ID: {order._id}</div>
          <div
            className={cx("order-status")}
            style={{
              backgroundColor: getStatusColor(order.status),
              color: "white",
              padding: "4px 12px",
              borderRadius: "4px",
            }}
          >
            {order.status}
          </div>
        </div>
      </div>

      <div className={cx("section", "shipping-info")}>
        <h3>Shipping Information</h3>
        <div className={cx("info-grid")}>
          <div className={cx("info-item")}>
            <span>Full Name:</span>
            <p>{order.shippingAddress.fullName}</p>
          </div>
          <div className={cx("info-item")}>
            <span>Phone:</span>
            <p>{order.shippingAddress.phone}</p>
          </div>
          <div className={cx("info-item", "full-width")}>
            <span>Address:</span>
            <p>
              {`${order.shippingAddress.address}, ${order.shippingAddress.ward}, 
              ${order.shippingAddress.district}, ${order.shippingAddress.province}`}
            </p>
          </div>
        </div>
      </div>

      <div className={cx("section", "items-list")}>
        <h3>Order Items</h3>
        {order.items.map((item, index) => (
          <div key={index} className={cx("order-item")}>
            <div className={cx("item-image")}>
              <img
                src={"https://" + item.productSnapshot.image}
                alt={item.productSnapshot.name}
              />
            </div>
            <div className={cx("item-details")}>
              <h4>{item.productSnapshot.name}</h4>
              <div className={cx("item-variations")}>
                {item.productSnapshot.value1 && (
                  <span>
                    {item.productSnapshot.type1}: {item.productSnapshot.value1}
                  </span>
                )}
                {item.productSnapshot.value2 && (
                  <span>
                    {item.productSnapshot.type2}: {item.productSnapshot.value2}
                  </span>
                )}
              </div>
              <div className={cx("item-price")}>
                <CurrencyFormat number={item.price} /> x {item.quantity}
              </div>
              <div className={cx("item-total")}>
                <span>Total:</span>
                <CurrencyFormat number={item.price * item.quantity} />
              </div>
            </div>
            {order.status === "COMPLETED" &&
              !productRatings[item.productSnapshot._id] && (
                <button
                  className={cx("rate-button")}
                  onClick={() => handleRateProduct(item)}
                >
                  Rate Now
                </button>
              )}
          </div>
        ))}
      </div>

      <div className={cx("section", "payment-info")}>
        <h3>Payment Information</h3>
        <div className={cx("payment-details")}>
          <div className={cx("payment-row")}>
            <span>Payment Method:</span>
            <p>{order.paymentDetails?.method || "Not specified"}</p>
          </div>
          <div className={cx("payment-row")}>
            <span>Payment Status:</span>
            <p className={cx("payment-status", order.paymentStatus)}>
              {order.paymentStatus}
            </p>
          </div>
          <div className={cx("payment-row", "total")}>
            <span>Total Amount:</span>
            <CurrencyFormat number={order.totalAmount} />
          </div>
        </div>
      </div>

      <div className={cx("section", "order-timeline")}>
        <h3>Order Timeline</h3>
        <div className={cx("timeline")}>
          <div className={cx("timeline-item", { active: true })}>
            <div className={cx("timeline-point")} />
            <div className={cx("timeline-content")}>
              <h4>Order Placed</h4>
              <p>{new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {order.shippingDate && (
            <div className={cx("timeline-item", { active: true })}>
              <div className={cx("timeline-point")} />
              <div className={cx("timeline-content")}>
                <h4>Order Shipping</h4>
                <p>{new Date(order.shippingDate).toLocaleString()}</p>
              </div>
            </div>
          )}

          {order.completedDate && (
            <div className={cx("timeline-item", { active: true })}>
              <div className={cx("timeline-point")} />
              <div className={cx("timeline-content")}>
                <h4>Order Shipped</h4>
                <p>{new Date(order.completedDate).toLocaleString()}</p>
              </div>
            </div>
          )}

          {order.cancelledDate && (
            <div className={cx("timeline-item", { active: true })}>
              <div className={cx("timeline-point")} />
              <div className={cx("timeline-content")}>
                <h4>Order Cancelled</h4>
                <p>{new Date(order.cancelledDate).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={cx("action-buttons")}>
        {order.status === "PENDING" && (
          <button
            className={cx("action-button", "cancel")}
            onClick={handleCancelOrder}
          >
            Cancel Order
          </button>
        )}
        {order.status === "SHIPPING" && (
          <button
            className={cx("action-button", "complete")}
            onClick={handleCompleteOrder}
          >
            Confirm Receipt
          </button>
        )}
      </div>

      {isRatingModalOpen && selectedProduct && user && (
        <Rating
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct._id}
          orderId={order._id}
          userData={{
            name: user.name,
            avtUrl: user.avtUrl,
          }}
          onRatingSubmit={() => {
            checkRatingStatus(selectedProduct._id);
          }}
        />
      )}
    </div>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "#ff9800";
    case "CONFIRMED":
      return "#2196f3";
    case "SHIPPING":
      return "#8c52ff";
    case "COMPLETED":
      return "#4caf50";
    case "CANCELLED":
      return "#f44336";
    default:
      return "#000";
  }
};

export default OrderDetails;
