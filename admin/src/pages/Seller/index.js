import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Seller.module.scss";

const cx = classNames.bind(styles);

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users
  }, []);

  return (
    <div className={cx("users")}>
      <h1>Seller Management</h1>
      <div className={cx("users-list")}>{/* Users table */}</div>
    </div>
  );
}

export default Users;
