import React from "react";
import classNames from "classnames/bind";
import defaultAvt from "../../../assets/images/defaultavt.png";
import followIcon from "../../../assets//icons/shop/follow.svg";
import chatIcon from "../../../assets/icons/shop/chat.svg";
import styles from "./ShopImage.module.scss";
const cx = classNames.bind(styles);
function ShopImage({ width, height }) {
  const containerStyle = {
    width: width,
    height: height,
  };

  return (
    <div className={cx("container")} style={containerStyle}>
      <div className={cx("top-container")}>
        <div className={cx("image-container")}>
          <img src={defaultAvt} alt="shop avt" />
        </div>
        <div className={cx("shop-basic-information")}>
          <h4>SHOP NAME</h4>
          <h4>Active 5 mins ago</h4>
        </div>
      </div>
      <button className={cx("button-groups", "follow-button")}>
        <img src={followIcon} alt="follow Icon" />
        <span>Follow</span>
      </button>
      <button className={cx("button-groups", "chat-button")}>
        <img src={chatIcon} alt="chat Icon" />
        <span>Chat</span>
      </button>
    </div>
  );
}

export default ShopImage;
