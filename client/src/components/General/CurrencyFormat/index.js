import classNames from "classnames/bind";
import styles from "./CurrencyFormat.module.scss";
const cx = classNames.bind(styles);
const formatNumberWithDots = (number) => {
  if (isNaN(number)) return number;

  const [integerPart, decimalPart] = number.toString().split(".");

  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  return decimalPart
    ? `${formattedIntegerPart},${decimalPart}`
    : formattedIntegerPart;
};

const NumberSpan = ({ number }) => {
  return (
    <span className={cx("currency-format")}>
      {formatNumberWithDots(number)}
      <sup>₫</sup>
    </span>
  );
};

export default NumberSpan;
