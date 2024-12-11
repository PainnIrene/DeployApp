import React, { useState, useEffect } from "react";
import styles from "./ChangePassword.module.scss";
import classNames from "classnames/bind";
import loadingAnimation from "../../assets/animation/loading.svg";
import eyeIcon from "../../assets/icons/password/eye.svg";
import eyeOffIcon from "../../assets/icons/password/eye-off.svg";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState([false, false, false]);
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLogoutOtherDevices, setIsLogoutOtherDevices] = useState(false);
  const [isConfirmPasswordValid, SetIsConfirmPasswordValid] = useState(false);
  const [passRule1, setPassRule1] = useState(false); // length >= 8
  const [passRule2, setPassRule2] = useState(false); // 1 lowerCase
  const [passRule3, setPassRule3] = useState(false); // 1 uppercase
  const [passRule4, setPassRule4] = useState(false); // Number (0-9)
  const [passRule5, setPassRule5] = useState(false); // 1 special Character

  const togglePasswordVisibility = (index) => {
    setShowPassword((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  useEffect(() => {
    newPassword.length < 8 ? setPassRule1(false) : setPassRule1(true);

    !/[a-z]/.test(newPassword) ? setPassRule2(false) : setPassRule2(true);

    !/[A-Z]/.test(newPassword) ? setPassRule3(false) : setPassRule3(true);

    !/[0-9]/.test(newPassword) ? setPassRule4(false) : setPassRule4(true);

    /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
      ? setPassRule5(true)
      : setPassRule5(false);

    if (passRule1 && passRule2 && passRule3 && passRule4 && passRule5) {
      setIsPasswordValid(true);
    } else {
      setIsPasswordValid(false);
    }
  }, [newPassword, passRule1, passRule2, passRule3, passRule4, passRule5]);

  useEffect(() => {
    if (newPassword === confirmNewPassword && confirmNewPassword !== "") {
      SetIsConfirmPasswordValid(true);
    } else {
      SetIsConfirmPasswordValid(false);
    }
  }, [confirmNewPassword, newPassword]);

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handleSubmit = async () => {
    if (!currentPassword) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please enter your current password",
      });
      return;
    }

    if (!isPasswordValid || !isConfirmPasswordValid) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "New password is not valid or doesn't match the confirmation",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/user/changePassword/",
        {
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Successful",
          text: "Password changed successfully",
        });
        navigate("/profile");
      }
    } catch (error) {
      if (error.response) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.response.data.message ||
            "An error occurred while changing password",
        });
      } else if (error.request) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No response from server. Please try again later.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx("wrapper")}>
      {loading && (
        <div className={cx("loading-container")}>
          <img
            src={loadingAnimation}
            className={cx("loading")}
            alt="Loading..."
          />
        </div>
      )}
      <div className={cx("changePass-heading-title")}>
        <h1>Change Password</h1>
      </div>
      <div className={cx("main-contents")}>
        <h1>Change New Password</h1>
        <div className={cx("left-side")}>
          {[
            {
              label: "Current Password",
              value: currentPassword,
              setter: setCurrentPassword,
            },
            {
              label: "New Password",
              value: newPassword,
              setter: setNewPassword,
            },
            {
              label: "Confirm New Password",
              value: confirmNewPassword,
              setter: setConfirmNewPassword,
            },
          ].map((input, index) => (
            <div key={index} className={cx("input-container")}>
              <label>{input.label}</label>
              <input
                type={showPassword[index] ? "text" : "password"}
                value={input.value}
                onChange={handleInputChange(input.setter)}
              />
              <span onClick={() => togglePasswordVisibility(index)}>
                <img
                  src={showPassword[index] ? eyeOffIcon : eyeIcon}
                  alt={showPassword[index] ? "Hide password" : "Show password"}
                />
              </span>
            </div>
          ))}
          <div className={cx("checkBox-container")}>
            <input
              type="checkbox"
              id="changePass-logout-label"
              className={cx("checkBox")}
              checked={isLogoutOtherDevices}
              onChange={({ target: { checked } }) =>
                setIsLogoutOtherDevices(checked)
              }
            />
            <label
              htmlFor="changePass-logout-label"
              className={cx("checkBox-label")}
            >
              Log out from all other devices
            </label>
          </div>
        </div>
        <hr />
        <div className={cx("right-side")}>
          <h4 className={cx("passwordContains")}>New password must: </h4>
          <p className={cx(passRule1 ? "valid" : "notValid")}>
            At least 8 characters
          </p>
          <p className={cx(passRule2 ? "valid" : "notValid")}>
            Lower Case letters (a-z)
          </p>
          <p className={cx(passRule3 ? "valid" : "notValid")}>
            Upper Case letters (A-Z)
          </p>
          <p className={cx(passRule4 ? "valid" : "notValid")}>Numbers (0-9)</p>
          <p className={cx(passRule5 ? "valid" : "notValid")}>
            Special Character: !@#$%^&
          </p>
          <p className={cx(isConfirmPasswordValid ? "valid" : "notValid")}>
            Match with confirm password
          </p>
        </div>
      </div>
      <button onClick={handleSubmit} className={cx("submit-button")}>
        Submit
      </button>
    </div>
  );
};

export default ChangePassword;
