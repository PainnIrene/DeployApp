import React from "react";
import styles from "./Rating.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

const Rating = ({ stars, size = "20px" }) => {
  return (
    <div
      className={cx("Stars")}
      style={{ "--rating": stars, "--size": size }}
    />
  );
};

export default Rating;
