import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./ResetPassword.module.scss";
import loadingAnimation from "../../assets/animation/loading.svg";
import axios from "axios";
import Swal from "sweetalert2";

const cx = classNames.bind(styles);

const ResetPassword = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("code");
  const userID = queryParams.get("userID");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmPasswordValid, SetIsConfirmPasswordValid] = useState(false);
  const [passRule1, setPassRule1] = useState(false); //length >=8
  const [passRule2, setPassRule2] = useState(false); //1 lowerCase
  const [passRule3, setPassRule3] = useState(false); //1 uppercase
  const [passRule4, setPassRule4] = useState(false); //Number(0-9)
  const [passRule5, setPassRule5] = useState(false); //1 special Character
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isPasswordValid && isConfirmPasswordValid) {
      try {
        setLoading(true);
        const response = await axios.post(
          `http://localhost:3001/auth/resetPasswordAccount`,
          {
            password,
          },
          {
            params: {
              code,
              userID,
            },
          }
        );
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: "Password changed successfully",
          }).then(() => {
            window.location.href = "/login";
          });
        } else if (response.status === 201) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: response.data.msg,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Server error while changing password",
          });
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Code or URL is not correct or Expired! Please Try Again",
        });
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "You must complete the form to reset password",
      });
    }
  };

  useEffect(() => {
    password.length < 8 ? setPassRule1(false) : setPassRule1(true);

    !/[a-z]/.test(password) ? setPassRule2(false) : setPassRule2(true);

    !/[A-Z]/.test(password) ? setPassRule3(false) : setPassRule3(true);

    !/[0-9]/.test(password) ? setPassRule4(false) : setPassRule4(true);

    /[!@#$%^&*(),.?":{}|<>]/.test(password)
      ? setPassRule5(true)
      : setPassRule5(false);

    if (passRule1 && passRule2 && passRule3 && passRule4 && passRule5) {
      setIsPasswordValid(true);
    } else {
      setIsPasswordValid(false);
    }
  }, [password, passRule1, passRule2, passRule3, passRule4, passRule5]);
  useEffect(() => {
    if (password === confirmPassword && confirmPassword !== "") {
      SetIsConfirmPasswordValid(true);
    } else {
      SetIsConfirmPasswordValid(false);
    }
  }, [confirmPassword, password]);

  return (
    <div className={cx("container")}>
      {loading && (
        <div className={cx("loading-container")}>
          <img
            src={loadingAnimation}
            className={cx("loading")}
            alt="Loading..."
          />
        </div>
      )}
      <form className={cx("form")}>
        <h2>Reset Password</h2>
        <br />
        <input
          className={cx("input")}
          type="password"
          id="password"
          name="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className={cx("input")}
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <p className={cx(isConfirmPasswordValid ? "valid" : "notValid")}>
          Confirm Password match
        </p>
        <h4 className={cx("passwordContains")}>Password must contains: </h4>
        <p className={cx(passRule1 ? "valid" : "notValid")}>
          At least 8 characters
        </p>
        <p className={cx(passRule2 ? "valid" : "notValid")}>
          Lower Case letters(a-z)
        </p>
        <p className={cx(passRule3 ? "valid" : "notValid")}>
          Upper Case letters(A-Z)
        </p>
        <p className={cx(passRule4 ? "valid" : "notValid")}>Numbers(0-9)</p>
        <p className={cx((passRule5 && "valid") || "notValid")}>
          Special Character: !@#$%^&
        </p>
        <br />
        <button className={cx("button")} onClick={handleSubmit}>
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
