import classNames from "classnames/bind";
import styles from "./OrderDetail.module.scss";
import closeIcon from "../../../assets/icons/product/x.svg";
import shippingIcon from "../../../assets/icons/order/shipping.svg";

const cx = classNames.bind(styles);

function OrderDetail({ order, onClose, onCompleteShipping }) {
  if (!order) return null;

  return (
    <div className={cx("overlay")}>
      <div className={cx("modal")}>
        <button className={cx("close-button")} onClick={onClose}>
          <img src={closeIcon} alt="close" />
        </button>

        <div className={cx("header")}>
          <h2>Order Details</h2>
        </div>

        <div className={cx("detail-section")}>
          <h3>Order Information</h3>
          <div className={cx("info-grid")}>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Order ID:</span>
              <span className={cx("value")}>{order._id}</span>
            </div>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Created Date:</span>
              <span className={cx("value")}>
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Status:</span>
              <span className={cx(`status-${order.status?.toLowerCase()}`)}>
                {order.status}
              </span>
            </div>
            {order.shippingDate && (
              <div className={cx("info-item")}>
                <span className={cx("label")}>Shipping Date:</span>
                <span className={cx("value")}>
                  {new Date(order.shippingDate).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={cx("detail-section")}>
          <h3>Shipping Address</h3>
          <div className={cx("info-grid")}>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Full Name:</span>
              <span className={cx("value")}>
                {order.shippingAddress?.fullName || "N/A"}
              </span>
            </div>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Phone:</span>
              <span className={cx("value")}>
                {order.shippingAddress?.phone || "N/A"}
              </span>
            </div>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Address:</span>
              <span className={cx("value")}>
                {order.shippingAddress?.address || "N/A"}
              </span>
            </div>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Province:</span>
              <span className={cx("value")}>
                {order.shippingAddress?.province || "N/A"}
              </span>
            </div>
            <div className={cx("info-item")}>
              <span className={cx("label")}>District:</span>
              <span className={cx("value")}>
                {order.shippingAddress?.district || "N/A"}
              </span>
            </div>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Ward:</span>
              <span className={cx("value")}>
                {order.shippingAddress?.ward || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className={cx("detail-section")}>
          <h3>Payment Information</h3>
          <div className={cx("info-grid")}>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Payment Status:</span>
              <span className={cx(`payment-status-${order.paymentStatus}`)}>
                {order.paymentStatus}
              </span>
            </div>
            <div className={cx("info-item")}>
              <span className={cx("label")}>Payment Method:</span>
              <span className={cx("value")}>
                {order.paymentDetails?.method || "N/A"}
              </span>
            </div>
            {order.paymentDetails?.paidAt && (
              <div className={cx("info-item")}>
                <span className={cx("label")}>Payment Date:</span>
                <span className={cx("value")}>
                  {new Date(order.paymentDetails.paidAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={cx("detail-section")}>
          <h3>Products</h3>
          {order.items?.map((item, index) => (
            <div key={index} className={cx("product-item")}>
              {item.productSnapshot?.image && (
                <img
                  src={`https://${item.productSnapshot.image}`}
                  alt={item.productSnapshot?.name || "Product"}
                />
              )}
              <div className={cx("product-info")}>
                <p className={cx("product-name")}>
                  {item.productSnapshot?.name || "N/A"}
                </p>
                {item.productSnapshot?.value1 && (
                  <p className={cx("product-variant")}>
                    {item.productSnapshot.type1}: {item.productSnapshot.value1}
                    {item.productSnapshot.value2 &&
                      ` | ${item.productSnapshot.type2}: ${item.productSnapshot.value2}`}
                  </p>
                )}
                <p className={cx("product-price")}>
                  Price: {(item.price || 0).toLocaleString()} VND x{" "}
                  {item.quantity || 0}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={cx("detail-section", "total")}>
          <div className={cx("amount-info")}>
            <p>Shipping Fee: {(order.shippingFee || 0).toLocaleString()} VND</p>
            <p className={cx("total-amount")}>
              Total Amount: {(order.totalAmount || 0).toLocaleString()} VND
            </p>
          </div>
          <button
            className={cx("shipping-button")}
            onClick={() => onCompleteShipping(order._id)}
            disabled={order.status !== "PENDING"}
          >
            <img src={shippingIcon} alt="shipping icon" />
            Complete Shipping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
