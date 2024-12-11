import styles from "./Payment.module.scss";
import CreditCardForm from "../../components/Form/CreditCardForm/index";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);
const Payment = () => {
  return (
    <>
      <h1>Payment</h1>
      <div>
        <CreditCardForm />
      </div>
      <div className={cx("main-contents")}></div>
    </>
  );
};
export default Payment;
