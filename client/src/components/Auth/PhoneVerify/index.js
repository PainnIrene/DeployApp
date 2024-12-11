import React, { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import styles from "./PhoneVerify.module.scss";
import classNames from "classnames/bind";
import Countdown from "react-countdown";
import axios from "axios";
import phoneIcon from "../../../assets/icons/phoneIcon.png";
import CodeInput from "../../../components/CodeInput/index";
import loadingAnimation from "../../../assets/animation/loading.svg";

const cx = classNames.bind(styles);

const PhoneVerify = ({ setIsPhoneVerifyDisplay }) => {
  const [phone, setPhone] = useState("");
  const [isPhoneNumberVerify, setIsPhoneNumberVerify] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isButtonDisable, setIsButtonDisable] = useState(false);
  const [isSMSSent, setIsSMSSent] = useState(false);
  const [isCountdownCompleted, setIsCountdownCompleted] = useState(false);
  const [OTP, setOTP] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = (code) => {
    console.log("Mã xác thực:", code);
    setOTP(code);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      setIsButtonDisable(false);
    } else {
      setIsButtonDisable(true);
      setIsSMSSent(true);
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
        "http://localhost:3001/user/verifyPhone",
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const { phoneSent, expireTime, isPhoneNumberVerify } = response.data;
        if (phoneSent) {
          setPhone(phoneSent);
          setIsPhoneNumberVerify(isPhoneNumberVerify);
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
      setIsSMSSent(true);
      try {
        const response = await axios.post(
          "http://localhost:3001/user/sendPhoneVerifyCode",
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
    if (OTP) {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3001/user/verifyPhoneVerifyCode",
          { code: OTP },
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
          setIsPhoneVerifyDisplay((prev) => !prev);
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
    <div className={cx("phone-verify-container")}>
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
        <h1 className={cx("title")}>Phone Numbers Verify</h1>
        <button
          className={cx("exitButton")}
          onClick={() => setIsPhoneVerifyDisplay(false)}
        >
          X
        </button>
      </div>
      <div className={cx("phone-icon-container")}>
        <img alt="Phone Icon" src={phoneIcon} />
      </div>
      <div className={cx("body")}>
        <input
          value={phone || ""}
          disabled={true}
          className={cx("phone-input")}
        />
        <button
          onClick={handleSendCode}
          disabled={isButtonDisable}
          className={cx(
            isPhoneNumberVerify || isSMSSent ? "button-hide" : "button-display"
          )}
        >
          Send Code
        </button>
      </div>
      {isSMSSent && (
        <>
          <div className={cx("phone-sent-container")}>
            <div className={cx("phone-notification-check")}>
              <h3>
                An phone with a verification code was just sent to {phone}
              </h3>
            </div>
            <CodeInput length={6} onComplete={handleComplete} />

            <div
              className={cx(
                isPhoneNumberVerify ? "timer-limit-hide" : "timer-limit"
              )}
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

export default PhoneVerify;
