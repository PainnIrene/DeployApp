import { NavLink, Outlet } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Order.module.scss";
import orderIcon from "../../assets/icons/order/order.svg";
import completedIcon from "../../assets/icons/order/completed.svg";
import shippingIcon from "../../assets/icons/order/shipping.svg";
import cancelledIcon from "../../assets/icons/order/cancelled.svg";

const cx = classNames.bind(styles);

function Order() {
  return (
    <div className={cx("container")}>
      <div className={cx("heading")}>
        <h1>Order Management</h1>
      </div>
      <div className={cx("nav-links")}>
        <NavLink
          to="all"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={orderIcon} alt="all order icon" />
          <h3>All Orders</h3>
        </NavLink>
        <NavLink
          to="completed"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={completedIcon} alt="completed order icon" />
          <h3>Completed</h3>
        </NavLink>
        <NavLink
          to="shipping"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={shippingIcon} alt="shipping order icon" />
          <h3>Shipping</h3>
        </NavLink>
        <NavLink
          to="cancelled"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={cancelledIcon} alt="cancelled order icon" />
          <h3>Cancelled</h3>
        </NavLink>
      </div>
      <div className={cx("content")}>
        <Outlet />
      </div>
    </div>
  );
}

export default Order;
