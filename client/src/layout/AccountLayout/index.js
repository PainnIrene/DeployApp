import className from "classnames/bind";
import styles from "./AccountLayout.module.scss";
import SideBarProfile from "../../components/SideBarProfile/index";
import Header from "../../components/Header/index";
const cx = className.bind(styles);

const AccountLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className={cx("wrapper")}>
        <SideBarProfile />
        <div className={cx("container")}> {children}</div>
      </div>
    </>
  );
};
export default AccountLayout;
