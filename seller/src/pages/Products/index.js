import { NavLink, Outlet } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Product.module.scss";
import addProductIcon from "../../assets/icons/product/addProduct.svg";
import { useState } from "react";
import AddNewProduct from "../../components/Product/AddNewProduct";
import allProductsIcon from "../../assets/icons/sidebar/product.svg";
import publishedProductsIcon from "../../assets/icons/product/eye.svg";
import unpublishedProductsIcon from "../../assets/icons/product/loader.svg";
import hiddenProductsIcon from "../../assets/icons/product/hide.svg";
import violationProductsIcon from "../../assets/icons/product/x.svg";

const cx = classNames.bind(styles);

function Product() {
  const [showAddNewProduct, setShowAddNewProduct] = useState(false);

  return (
    <div className={cx("container")}>
      {showAddNewProduct && (
        <AddNewProduct setShowAddNewProduct={setShowAddNewProduct} />
      )}
      <div className={cx("heading")}>
        <h1>Product Management</h1>
        <button onClick={() => setShowAddNewProduct(!showAddNewProduct)}>
          <img src={addProductIcon} alt="add new product icon" />
          <span>Add new Product</span>
        </button>
      </div>
      <div className={cx("nav-links")}>
        <NavLink
          to="all"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={allProductsIcon} alt="all product icon" />
          <h3>All Products</h3>
        </NavLink>
        <NavLink
          to="published"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={publishedProductsIcon} alt="published product icon" />
          <h3>Published</h3>
        </NavLink>
        <NavLink
          to="unpublished"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={unpublishedProductsIcon} alt="published product icon" />
          <h3>UnPublished</h3>
        </NavLink>
        <NavLink
          to="hidden"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={hiddenProductsIcon} alt="published product icon" />
          <h3>Hidden</h3>
        </NavLink>
        <NavLink
          to="violation"
          className={({ isActive }) => cx("nav-link", { active: isActive })}
        >
          <img src={violationProductsIcon} alt="published product icon" />
          <h3>Violation</h3>
        </NavLink>
      </div>
      <div className={cx("content")}>
        <Outlet />
      </div>
    </div>
  );
}

export default Product;
