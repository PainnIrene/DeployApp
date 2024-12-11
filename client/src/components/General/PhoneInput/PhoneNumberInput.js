import { useState } from "react";
import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
import styles from "./PhoneNumberInput.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);
function PhoneNumberInput({ handlePhoneNumberChange }) {
  const [phone, setPhone] = useState("");
  const handlePhoneChange = (value) => {
    if (value.startsWith("84") && value.length > 11) {
      value = value.slice(0, 11);
      setPhone(value);
      handlePhoneNumberChange(value);
    } else {
      setPhone(value);
      handlePhoneNumberChange(value);
    }
  };
  return (
    <PhoneInput
      country={"vn"}
      value={phone}
      onChange={handlePhoneChange}
      enableSearch
      inputProps={{
        name: "phone",
        required: true,
        ...(phone.startsWith("84") ? { maxLength: 15 } : {}),
      }}
    />
  );
}
export default PhoneNumberInput;
