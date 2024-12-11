import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./SideBar.module.scss";
import classNames from "classnames/bind";
import dropdownIcon from "../../assets/icons/sidebar/dropdown.svg";
import orderIcon from "../../assets/icons/sidebar/order.svg";
import productIcon from "../../assets/icons/sidebar/product.svg";
import marketingIcon from "../../assets/icons/sidebar/tag.svg";
import supportIcon from "../../assets/icons/sidebar/support.svg";
import walletIcon from "../../assets/icons/sidebar/wallet.svg";
import dataIcon from "../../assets/icons/sidebar/chart.svg";
import shopIcon from "../../assets/icons/sidebar/store.svg";
const cx = classNames.bind(styles);

const SideBar = () => {
  const [dropdownStates, setDropdownStates] = useState({});

  const toggleDropdown = (dropdownName) => {
    setDropdownStates((prevStates) => ({
      ...prevStates,
      [dropdownName]: !prevStates[dropdownName],
    }));
  };

  const isDropdownOpen = (dropdownName) => {
    return !!dropdownStates[dropdownName];
  };

  return (
    <div className={cx("container")}>
      <div className={cx("dropdown", { active: isDropdownOpen("order") })}>
        <button
          className={cx("dropdown-btn")}
          onClick={() => toggleDropdown("order")}
        >
          <img src={orderIcon} alt="order Icon" className={cx("1st-icon")} />
          <span>Order</span>
          <img
            src={dropdownIcon}
            className={cx("2nd-icon")}
            alt="dropdown Icon"
          />
        </button>
        <div className={cx("dropdown-content")}>
          <Link to="/orders/all">All Orders</Link>
          <Link to="/orders/completed">Completed</Link>
          <Link to="/orders/shipping">Shipping</Link>
          <Link to="/orders/cancelled">Cancelled</Link>
        </div>
      </div>
      <div className={cx("dropdown", { active: isDropdownOpen("product") })}>
        <button
          className={cx("dropdown-btn")}
          onClick={() => toggleDropdown("product")}
        >
          <img
            src={productIcon}
            alt="product Icon"
            className={cx("1st-icon")}
          />
          <span>Product</span>
          <img
            src={dropdownIcon}
            className={cx("2nd-icon")}
            alt="dropdown Icon"
          />
        </button>
        <div className={cx("dropdown-content")}>
          <Link to="/products/all">All Products</Link>
          <Link to="/products/published">Published</Link>
          <Link to="/products/unpublished">Unpublished</Link>
          <Link to="/products/hidden">Hidden</Link>
          <Link to="/products/violation">Violations</Link>
        </div>
      </div>
      <div className={cx("dropdown", { active: isDropdownOpen("marketing") })}>
        <button
          className={cx("dropdown-btn")}
          onClick={() => toggleDropdown("marketing")}
        >
          <img
            src={marketingIcon}
            alt="marketing Icon"
            className={cx("1st-icon")}
          />
          <span>Marketing</span>
          <img
            src={dropdownIcon}
            className={cx("2nd-icon")}
            alt="dropdown Icon"
          />
        </button>
        <div className={cx("dropdown-content")}>
          <a href="#">IPAIN SHOP Ads</a>
          <a href="#">Discount</a>
          <a href="#">Vouchers</a>
        </div>
      </div>
      <div className={cx("dropdown", { active: isDropdownOpen("support") })}>
        <button
          className={cx("dropdown-btn")}
          onClick={() => toggleDropdown("support")}
        >
          <img
            src={supportIcon}
            alt="support Icon"
            className={cx("1st-icon")}
          />
          <span>Customer Services</span>
          <img
            src={dropdownIcon}
            className={cx("2nd-icon")}
            alt="dropdown Icon"
          />
        </button>
        <div className={cx("dropdown-content")}>
          <a href="#">Chat Management</a>
          <a href="#">Review Management</a>
        </div>
      </div>
      <div className={cx("dropdown", { active: isDropdownOpen("finance") })}>
        <button
          className={cx("dropdown-btn")}
          onClick={() => toggleDropdown("finance")}
        >
          <img src={walletIcon} alt="finance Icon" className={cx("1st-icon")} />
          <span>Finance</span>
          <img
            src={dropdownIcon}
            className={cx("2nd-icon")}
            alt="dropdown Icon"
          />
        </button>
        <div className={cx("dropdown-content")}>
          <a href="#">Balance</a>
          <a href="#">Bank Account</a>
        </div>
      </div>
      <div className={cx("dropdown", { active: isDropdownOpen("data") })}>
        <button
          className={cx("dropdown-btn")}
          onClick={() => toggleDropdown("data")}
        >
          <img src={dataIcon} alt="data Icon" className={cx("1st-icon")} />
          <span>Data</span>
          <img
            src={dropdownIcon}
            className={cx("2nd-icon")}
            alt="dropdown Icon"
          />
        </button>
        <div className={cx("dropdown-content")}>
          <a href="#">My Order</a>
          <a href="#">Canceller</a>
        </div>
      </div>
      <div className={cx("dropdown", { active: isDropdownOpen("shop") })}>
        <button
          className={cx("dropdown-btn")}
          onClick={() => toggleDropdown("shop")}
        >
          <img src={shopIcon} alt="shop Icon" className={cx("1st-icon")} />
          <span>Shop</span>
          <img
            src={dropdownIcon}
            className={cx("2nd-icon")}
            alt="dropdown Icon"
          />
        </button>
        <div className={cx("dropdown-content")}>
          <a href="#">Shop Information</a>
          <a href="#">Shop Decoration</a>
          <a href="#">Shop Settings</a>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
