import React from "react";
import styles from "./ShopInfo.module.scss";
import classNames from "classnames/bind";
import productIcon from "../../../assets/icons/shop/product.svg";
import ratingIcon from "../../../assets/icons/shop/rating.svg";
import chatIcon from "../../../assets/icons/shop/chatmore.svg";
import followersIcon from "../../../assets/icons/shop/followers.svg";
import soldIcon from "../../../assets/icons/shop/sold.svg";
import joinIcon from "../../../assets/icons/shop/join.svg";
const cx = classNames.bind(styles);
function ShopInfo() {
  return (
    <div className={cx("shop-info-container")}>
      <div className={cx("left")}>
        <div className={cx("details-info-container")}>
          <div className={cx("icon-container")}>
            <img src={productIcon} alt="product icon" />
          </div>
          <h4>Product:</h4>
          <span>177</span>
        </div>
        <div className={cx("details-info-container")}>
          <div className={cx("icon-container")}>
            <img src={ratingIcon} alt="rating icon" />
          </div>
          <h4>Rating:</h4>
          <span>4.5</span>
        </div>
        <div className={cx("details-info-container")}>
          <div className={cx("icon-container")}>
            <img src={chatIcon} alt="chat icon" />
          </div>
          <h4>Chat Performance:</h4>
          <span>97%</span>
        </div>
      </div>
      <div className={cx("right")}>
        <div className={cx("details-info-container")}>
          <div className={cx("icon-container")}>
            <img src={followersIcon} alt="followers icon" />
          </div>
          <h4>Followers:</h4>
          <span>177</span>
        </div>
        <div className={cx("details-info-container")}>
          <div className={cx("icon-container")}>
            <img src={soldIcon} alt="sold icon" />
          </div>
          <h4>Sold:</h4>
          <span>100k</span>
        </div>
        <div className={cx("details-info-container")}>
          <div className={cx("icon-container")}>
            <img src={joinIcon} alt="join icon" />
          </div>
          <h4>Join:</h4>
          <span>3 years</span>
        </div>
      </div>
    </div>
  );
}

export default ShopInfo;
