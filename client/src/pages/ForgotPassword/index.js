import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./ForgotPassword.module.scss";
import classNames from "classnames/bind";
import loadingAnimation from "../../assets/animation/loading.svg";
import CodeInput from "../../components/CodeInput";
import Countdown from "react-countdown";
import Swal from "sweetalert2";
import axios from "axios";
import sendCodeIcon from "../../assets/icons/send.svg";

const cx = classNames.bind(styles);

const ForgotPassword = () => {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [userID, setUserID] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("email");
  const [countdown, setCountdown] = useState(0); // Initialize countdown to 0
  const [resetPasswordCode, setResetPasswordCode] = useState("");

  const handleSelection = (method) => {
    setSelectedMethod(method);
  };

  const handleComplete = (code) => {
    console.log("Mã xác thực:", code);
    setResetPasswordCode(code);
  };

  const handleFindAccount = async () => {
    if (!account) {
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3001/auth/findAccount",
        { account: account }
      );
      if (response.status === 200) {
        const { userID, email, phoneNumber } = response.data;
        setUserID(userID);
        setPhoneNumber(phoneNumber);
        setEmail(email);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Account Not Found",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while searching for the account",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const countdownDate = useMemo(
    () => Date.now() + countdown * 1000,
    [countdown]
  );

  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      setCountdown(0);
      return null;
    }
    return (
      <span>
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </span>
    );
  };
  // useEffect(() => {
  //   if (countdown === 0) {
  //     setIsButtonDisable(false);
  //   } else {
  //     // setIsButtonDisable(true);
  //     // setIsEmailSent(true);
  //   }
  // }, [countdown]);

  useEffect(() => {
    // Handle reset countdown when component is re-opened
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  const checkTimeLimitResetPassword = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3001/auth/resetPassword",
        { userID: userID }
      );
      if (response.status === 200) {
        const { expireTime } = response.data;
        const currentTime = Math.floor(Date.now() / 1000);
        const countdownRemaining = expireTime - currentTime;
        if (countdownRemaining > 0) {
          setCountdown(countdownRemaining);
          return false;
        } else {
          setCountdown(0);
          return true;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCodeButton = async () => {
    if (countdown > 0) {
      return;
    }
    try {
      const timeLimit = await checkTimeLimitResetPassword();
      if (timeLimit) {
        const response = await axios.post(
          "http://localhost:3001/auth/sendResetPasswordCode",
          { userID }
        );
        if (response.status === 200) {
          checkTimeLimitResetPassword();
        } else {
          console.log(response.message);
        }
      }
    } catch (error) {
      console.error("Error sending code:", error);
    }
  };
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (resetPasswordCode) {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3001/auth/verifyResetPasswordCode",
          { code: resetPasswordCode, userID }
        );
        if (response.status === 200) {
          const redirectURL = response.data.redirectURL;
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: "Verify Code successfully",
          }).then(() => {
            window.location.href = redirectURL;
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Verify Fail",
            text: "Wrong Code",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Verify Fail",
          text: "Wrong Code",
        });
        console.error("Error sending code:", error);
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Verify Fail",
        text: "Please input 6 digits numbers to verify",
      });
    }
  };
  return (
    <div className={cx("container")}>
      <div className={cx("main-contents")}>
        {loading && (
          <div className={cx("loading-container")}>
            <img
              src={loadingAnimation}
              className={cx("loading")}
              alt="Loading..."
            />
          </div>
        )}
        <h1>Forgot Password</h1>
        <label htmlFor="forgot-password-input">
          Enter Username/Email/PhoneNumber
        </label>
        <div className={cx("input-user-container")}>
          <input
            id="forgot-password-input"
            onChange={(e) => setAccount(e.target.value)}
            value={account}
          />
          <button onClick={handleFindAccount}>Find Account</button>
        </div>
        {userID && countdown === 0 && (
          <div className={cx("select-methods")}>
            <h4>
              Please select either phone or email to send the verification code.
            </h4>
            {email && (
              <div
                className={cx("card", {
                  selected: selectedMethod === "email",
                })}
                onClick={() => handleSelection("email")}
              >
                <input
                  type="radio"
                  id="email"
                  name="contactMethod"
                  value="email"
                  checked={selectedMethod === "email"}
                  onChange={() => handleSelection("email")}
                />
                <label htmlFor="email">{email}</label>
              </div>
            )}
            {phoneNumber && (
              <div
                className={cx("card", {
                  selected: selectedMethod === "phone",
                })}
                onClick={() => handleSelection("phone")}
              >
                <input
                  type="radio"
                  id="phone"
                  name="contactMethod"
                  value="phone"
                  checked={selectedMethod === "phone"}
                  onChange={() => handleSelection("phone")}
                />
                <label htmlFor="phone">{phoneNumber}</label>
              </div>
            )}
            <button
              className={cx("send-code-button")}
              onClick={handleSendCodeButton}
            >
              <span>Send Code</span>
              <img src={sendCodeIcon} alt="Send Code" />
            </button>
          </div>
        )}
        {userID && countdown > 0 && (
          <>
            <div className={cx("email-notification-check")}>
              <h3>
                An email with a verification code was just sent to {email}
              </h3>
            </div>
            <div className={cx("code-input-container")}>
              <CodeInput length={6} onComplete={handleComplete} />
              <div className={cx("timer-limit")}>
                <h4>Didn't receive code?</h4>
                {countdown > 0 ? (
                  <div>
                    <h4>Resend in</h4>
                    <Countdown date={countdownDate} renderer={renderer} />
                  </div>
                ) : (
                  <button onClick={handleSendCodeButton}>
                    Resend Code &rarr;
                  </button>
                )}
              </div>
            </div>
            <div className={cx("submit-button")}>
              <button onClick={handleVerifyCode}>Verify Code</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
