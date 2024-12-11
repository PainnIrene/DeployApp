import { NavLink } from "react-router-dom";
import Header from "../../components/Layout/Header";
import classNames from "classnames/bind";
import styles from "./DefaultLayout.module.scss";

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
  const menuItems = [
    { path: "/", label: "Dashboard" },
    { path: "/users", label: "Users" },
    { path: "/products", label: "Products" },
    { path: "/orders", label: "Orders" },
    { path: "/approve", label: "Approve" },
  ];

  return (
    <div className={cx("wrapper")}>
      <div className={cx("sidebar")}>
        <div className={cx("logo")}>
          <span className={cx("logo-text")}>Admin Panel</span>
        </div>
        <nav className={cx("menu")}>
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                cx("menu-item", { active: isActive })
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={cx("main")}>
        <Header />
        <div className={cx("content")}>{children}</div>
      </div>
    </div>
  );
}

export default DefaultLayout;
