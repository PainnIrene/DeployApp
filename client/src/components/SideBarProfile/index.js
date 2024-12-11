import { useUser } from "../../contexts/userContext/userContext.js";
import { NavLink } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./SideBarProfile.module.scss";
import defaultAvt from "../../assets/images/defaultavt.png";
import edituserIcon from "../../assets/icons/sidebar/edituser.svg";
import creditcardIcon from "../../assets/icons/sidebar/creditcard.svg";
import addressIcon from "../../assets/icons/sidebar/address.svg";
import changePassIcon from "../../assets/icons/sidebar/changepass.svg";
import notificationIcon from "../../assets/icons/sidebar/notification.svg";
import settingsUserIcon from "../../assets/icons/sidebar/settingsuser.svg";
import editIcon from "../../assets/icons/sidebar/edit.svg";
const cx = classNames.bind(styles);
const SideBarProfile = () => {
  const { user } = useUser();
  return (
    <div className={cx("side-bar")}>
      <div className={cx("user-profile-sub-container")}>
        <div className={cx("sub-avt")}>
          {user && user.avtUrl ? (
            <img
              alt="user avatar"
              src={user.avtUrl}
              className={cx("profile-image")}
            />
          ) : (
            <img
              alt="default avatar"
              src={defaultAvt}
              className={cx("profile-image")}
            />
          )}
        </div>
        <div className={cx("sub-content")}>
          <h1>Edit</h1>
          <img alt="edit Icon" src={editIcon} />
        </div>
      </div>
      <div className={cx("sidebar-heading-profile")}>
        <h1>My Profile</h1>
        <span>Support and Control Tools</span>
      </div>
      <div className={cx("link-items")}>
        <NavLink
          to="/profile"
          className={({ isActive }) => cx("link", { activated: isActive })}
        >
          <img alt="edit User Icon" src={edituserIcon} />
          <span>Profile</span>
        </NavLink>
        {/* <NavLink
          to="/payment"
          className={({ isActive }) => cx("link", { activated: isActive })}
        >
          <img alt="Credit Card Icon" src={creditcardIcon} />
          <span> Payment</span>
        </NavLink> */}
        <NavLink
          to="/address"
          className={({ isActive }) => cx("link", { activated: isActive })}
        >
          <img alt="Add New Address Icon" src={addressIcon} />
          <span>Address</span>
        </NavLink>
        <NavLink
          to="/changepass"
          className={({ isActive }) => cx("link", { activated: isActive })}
        >
          <img alt="Change PassWord Icon" src={changePassIcon} />
          <span>Change Password</span>
        </NavLink>
        <NavLink
          to="/notisettings"
          className={({ isActive }) => cx("link", { activated: isActive })}
        >
          <img alt="Notification Link icon" src={notificationIcon} />
          <span>Notification Settings</span>
        </NavLink>
        <NavLink
          to="/usersettings"
          className={({ isActive }) => cx("link", { activated: isActive })}
        >
          <img alt="Setting User Icon" src={settingsUserIcon} />
          <span>Account Settings</span>
        </NavLink>
      </div>
    </div>
  );
};
export default SideBarProfile;
