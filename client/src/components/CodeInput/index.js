import classNames from "classnames/bind";
import styles from "./CodeInput.module.scss";
import { useState } from "react";
const cx = classNames.bind(styles);

const CodeInput = ({ length = 6, onComplete }) => {
  const [values, setValues] = useState(Array(length).fill(""));

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") {
      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);

      if (value !== "" && index < length - 1) {
        document.getElementById(`code-input-${index + 1}`).focus();
      }

      if (newValues.every((val) => val !== "")) {
        onComplete(newValues.join(""));
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`).focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`code-input-${index - 1}`).focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  return (
    <div className={cx("code-input-container")}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <input
            key={index}
            id={`code-input-${index}`}
            type="text"
            maxLength="1"
            value={values[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cx("code-input")}
            autoComplete="off"
          />
        ))}
    </div>
  );
};

export default CodeInput;
