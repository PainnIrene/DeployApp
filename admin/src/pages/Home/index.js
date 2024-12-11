import React from "react";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";

const cx = classNames.bind(styles);

function Home() {
  return (
    <div className={cx("home")}>
      <h1>Welcome to Admin Dashboard</h1>
      <p>Manage your e-commerce platform with ease</p>
    </div>
  );
}

export default Home;
