import React, { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import styles from "./EmailVerify.module.scss";
import classNames from "classnames/bind";
import Countdown from "react-countdown";
import axios from "axios";
import emailIcon from "../../../assets/icons/emailIcon.png";
import CodeInput from "../../../components/CodeInput/index";
import loadingAnimation from "../../../assets/animation/loading.svg";

const cx = classNames.bind(styles);

const EmailVerify = ({ setIsEmailVerifyDisplay }) => {
  const [email, setEmail] = useState("");
  const [isEmailVerify, setIsEmailVerify] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isButtonDisable, setIsButtonDisable] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isCountdownCompleted, setIsCountdownCompleted] = useState(false);
  const [verifyEmailCode, setVerifyEmailCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = (code) => {
    console.log("Mã xác thực:", code);
    setVerifyEmailCode(code);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      setIsButtonDisable(false);
    } else {
      setIsButtonDisable(true);
      setIsEmailSent(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (isCountdownCompleted) {
      setCountdown(0);
      setIsCountdownCompleted(false);
    }
  }, [isCountdownCompleted]);

  useEffect(() => {
    // Handle reset countdown when component is re-opened
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/user/verifyEmail",
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const { emailSent, expireTime, isEmailVerify } = response.data;
        if (emailSent) {
          setEmail(emailSent);
          setIsEmailVerify(isEmailVerify);
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const countdownRemaining = expireTime - currentTime; // 300 seconds = 5 minutes
        if (countdownRemaining > 0) {
          setCountdown(countdownRemaining);
        } else {
          setCountdown(0);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleCountdownComplete = useCallback(() => {
    setIsCountdownCompleted(true);
  }, []);
  const countdownDate = useMemo(
    () => Date.now() + countdown * 1000,
    [countdown]
  );
  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      handleCountdownComplete();
      return null;
    } else {
      return (
        <span>
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </span>
      );
    }
  };

  const handleSendCode = async () => {
    if (countdown > 0) {
      return;
    } else {
      setIsEmailSent(true);
      try {
        const response = await axios.post(
          "http://localhost:3001/user/sendEmailVerifyCode",
          {},
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          fetchUserData();
        } else if (response.status === 401) {
          const expireTime = response.data.expireTime;
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
          if (expireTime) {
            setCountdown(expireTime - currentTime);
          }
        }
      } catch (error) {
        console.error("Error sending code:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (verifyEmailCode) {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3001/user/verifyEmailVerifyCode",
          { code: verifyEmailCode },
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: response.data.msg,
          });
          setIsEmailVerifyDisplay((prev) => !prev);
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
    }
  };
  return (
    <div className={cx("email-verify-container")}>
      {loading && (
        <div className={cx("loading-container")}>
          <img
            src={loadingAnimation}
            className={cx("loading")}
            alt="Loading..."
          />
        </div>
      )}
      <div className={cx("heading")}>
        <h1 className={cx("title")}>Email Verify</h1>
        <button
          className={cx("exitButton")}
          onClick={() => setIsEmailVerifyDisplay(false)}
        >
          X
        </button>
      </div>
      <div className={cx("email-icon-container")}>
        <img alt="Email Icon" src={emailIcon} />
      </div>
      <div className={cx("body")}>
        <input
          value={email || ""}
          disabled={true}
          className={cx("email-input")}
        />
        <button
          onClick={handleSendCode}
          disabled={isButtonDisable}
          className={cx(
            isEmailVerify || isEmailSent ? "button-hide" : "button-display"
          )}
        >
          Send Code
        </button>
      </div>
      {isEmailSent && (
        <>
          <div className={cx("email-sent-container")}>
            <div className={cx("email-notification-check")}>
              <h3>
                An email with a verification code was just sent to {email}
              </h3>
            </div>
            <CodeInput length={6} onComplete={handleComplete} />

            <div
              className={cx(isEmailVerify ? "timer-limit-hide" : "timer-limit")}
            >
              <h4>Didn't receive code?</h4>
              {countdown > 0 ? (
                <div>
                  <h4>Resend in</h4>
                  <Countdown date={countdownDate} renderer={renderer} />
                </div>
              ) : (
                <button onClick={handleSendCode} disabled={isButtonDisable}>
                  Resend Code &rarr;
                </button>
              )}
            </div>
            <div className={cx("submit-button")}>
              <button onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmailVerify;
