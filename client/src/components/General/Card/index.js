import React, { useRef } from "react";
import styles from "./Card.module.scss";
import classNames from "classnames/bind";
import Rating from "../Rating/index";
import addToCartIcon from "../../../assets/icons/addtocart.svg";
import buyNowIcon from "../../../assets/icons/buynow.svg";
import Swal from "sweetalert2";
import CurrencyFormat from "../CurrencyFormat/index";
import axios from "axios";
import { Link } from "react-router-dom";

const cx = classNames.bind(styles);

function Card({ product }) {
  const linkRef = useRef();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (product.numberOfOptions === 1) {
      try {
        const response = await axios.post(
          "http://localhost:3001/cart/add",
          {
            productId: product._id,
            quantity: 1,
            value1: "undefined",
            value2: "undefined",
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            text: "Add Product Successful",
            timer: 1000,
          });
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || "Failed to add product to cart";
        Swal.fire({
          icon: "error",
          text: errorMessage,
        });
        console.error("Error adding product to cart:", error);
      }
    } else {
      linkRef.current.click();
    }
  };

  const handleBuyNow = () => {};

  const renderColorOptions = () => {
    if (!product.options || product.options.length <= 1) return null;

    const uniqueColors = [
      ...new Set(
        product.options
          .map((opt) => opt.value2)
          .filter((color) => color && color !== "undefined")
      ),
    ].slice(0, 3); // Chỉ lấy 3 màu đầu tiên

    if (uniqueColors.length === 0) return null;

    return (
      <div className={cx("color-options")}>
        {uniqueColors.map((color, idx) => (
          <span key={idx} className={cx("color-tag")}>
            {color}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Link
      to={`/product/${product._id}`}
      ref={linkRef}
      className={cx("card-picker")}
    >
      <div className={cx("wrapper")}>
        <div className={cx("card-container")}>
          <div className={cx("product-image-container")}>
            <img src={"https://" + product.promotionImage} alt={product.name} />
            {product.numberOfOptions > 1 && (
              <div className={cx("options-badge")}>
                {product.numberOfOptions} options
              </div>
            )}
            {product.totalStock <= 5 && product.totalStock > 0 && (
              <div className={cx("stock-warning")}>
                Only {product.totalStock} left
              </div>
            )}
            {product.totalStock === 0 && (
              <div className={cx("out-of-stock")}>Out of Stock</div>
            )}
          </div>

          <div className={cx("product-info")}>
            {product.brand && (
              <div className={cx("brand-name")}>{product.brand}</div>
            )}

            <div className={cx("product-name-container")}>
              <h3>{product.name}</h3>
            </div>

            {renderColorOptions()}

            <div className={cx("product-price-container")}>
              {product.price.min && product.price.max ? (
                <h3 className={cx("product-price")}>
                  <CurrencyFormat number={product.price.min} />
                  <span> - </span>
                  <CurrencyFormat number={product.price.max} />
                </h3>
              ) : (
                <h3 className={cx("product-price")}>
                  <CurrencyFormat number={product.price} />
                </h3>
              )}
            </div>

            <div className={cx("product-meta")}>
              {product.category && (
                <span className={cx("category-tag")}>{product.category}</span>
              )}
              {product.condition && (
                <span className={cx("condition-tag")}>{product.condition}</span>
              )}
            </div>

            <div className={cx("button-shop-container")}>
              <button
                className={cx("button-add-product")}
                onClick={handleAddToCart}
              >
                <img src={addToCartIcon} alt="Add to Cart" />
                <h3>Add to Cart</h3>
              </button>
              <button className={cx("button-buy-now")}>
                <h3>Buy Now!</h3>
                <img src={buyNowIcon} alt="Buy Now" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;
