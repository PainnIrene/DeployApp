import classNames from "classnames/bind";
import styles from "./DefaultLayout.module.scss";
import Header from "../../components/Header/index";
const cx = classNames.bind(styles);
const DefaultLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className={cx("content")}> {children}</div>
    </>
  );
};
export default DefaultLayout;
