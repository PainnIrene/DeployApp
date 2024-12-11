import logo from "../../assets/images/logo.png";
// import userImage from "../../assets/images/image.jpg";
import profileIcon from "../../assets/icons/user.svg";
import orderIcon from "../../assets/icons/order.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import defaultAvt from "../../assets/images/defaultavt.png";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext/authContext";
import { useUser } from "../../contexts/userContext/userContext";
import classNames from "classnames/bind";
import styles from "./Header.module.scss";
import axios from "axios";
import Cookies from "js-cookie";
const cx = classNames.bind(styles);

const Header = () => {
  const { refreshToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get("http://localhost:3001/seller/auth/logout");
      if (res.status === 200) {
        Cookies.remove("SAT");
        Cookies.remove("SRT");
        clearUser();
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className={cx("header-container")}>
      <div className={cx("logo-brand")}>
        <a href="/">
          <img alt="logo brand" src={logo} height="50px" />
        </a>
      </div>
      <div className={cx("search-bar")}>
        <h1>Welcome to Seller Dashboard</h1>
      </div>
      <div className={cx("profile-container")}>
        {refreshToken ? (
          <>
            <div className={cx("profile")}>
              {user && user.avtUrl ? (
                <img
                  alt="profile"
                  src={user.avtUrl}
                  className={cx("profile-image")}
                />
              ) : (
                <img
                  alt="default avt"
                  src={defaultAvt}
                  className={cx("profile-image")}
                />
              )}
            </div>
            <div className={cx("profile-dropdown")} id="profile-dropdown">
              <div className={cx("black-background")}>
                <div className={cx("avatar-container")}>
                  {user && user.avtUrl ? (
                    <img alt="user avatar" src={user.avtUrl} />
                  ) : (
                    <img alt="default user avatar" src={defaultAvt} />
                  )}
                </div>
              </div>
              <div className={cx("profile-details")}>
                {user && user.name ? (
                  <h1>{user.name}</h1>
                ) : (
                  <h1>Unknown Name</h1>
                )}
                {user && user.username ? (
                  <h1>{user.username}</h1>
                ) : (
                  <h1>Unknown Username</h1>
                )}
              </div>
              <a href="/profile">
                <img alt="profile Icon" src={profileIcon} />
                <h1>Profile</h1>
              </a>
              <a href="/orders/all">
                <img alt="order Icon" src={orderIcon} />
                <h1>Order</h1>
              </a>
              <a href="/" onClick={(e) => handleLogout(e)}>
                <img alt="logout Icon" src={logoutIcon} />
                <h1>Logout</h1>
              </a>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
