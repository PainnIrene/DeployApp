import classNames from "classnames/bind";
import styles from "./DefaultLayout.module.scss";
import Header from "../../components/Header/index";
import SideBar from "../../components/SideBar/index";
const cx = classNames.bind(styles);
const DefaultLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className={cx("wrapper")}>
        <SideBar />
        <div className={cx("container")}> {children}</div>
      </div>
    </>
  );
};
export default DefaultLayout;
