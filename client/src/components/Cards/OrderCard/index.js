import classNames from "classnames/bind";
import styles from "./OrderCard.module.scss";
import CurrencyFormat from "../../General/CurrencyFormat/index.js";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/order/${order._id}`);
  };

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

  return (
    <div className={cx("order-card")} onClick={handleCardClick}>
      <div className={cx("order-header")}>
        <div className={cx("order-id")}>
          <span>Order ID: {order._id}</span>
        </div>
        <div
          className={cx("order-status")}
          style={{ color: getStatusColor(order.status) }}
        >
          {order.status}
        </div>
      </div>

      <div className={cx("order-items")}>
        {order.items.map((item, index) => (
          <div key={index} className={cx("order-item")}>
            <div className={cx("item-image")}>
              <img
                src={"https://" + item.productSnapshot.image}
                alt={item.productSnapshot.name}
              />
            </div>
            <div className={cx("item-details")}>
              <h3>{item.productSnapshot.name}</h3>
              <div className={cx("item-variations")}>
                {item.productSnapshot.value1 && (
                  <span>{item.productSnapshot.value1}</span>
                )}
                {item.productSnapshot.value2 && (
                  <span>{item.productSnapshot.value2}</span>
                )}
                <span>x{item.quantity}</span>
              </div>
            </div>
            <div className={cx("item-price")}>
              <CurrencyFormat number={item.productSnapshot.price} />
            </div>
          </div>
        ))}
      </div>

      <div className={cx("order-summary")}>
        <div className={cx("summary-row")}>
          <span>Shipping Fee:</span>
          <CurrencyFormat number={order.shippingFee} />
        </div>
        <div className={cx("summary-row", "total")}>
          <span>Total Amount:</span>
          <CurrencyFormat number={order.totalAmount} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
