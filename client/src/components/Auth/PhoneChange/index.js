import classNames from "classnames/bind";
import styles from "./PhoneChange.module.scss";
import loadingAnimation from "../../../assets/animation/loading.svg";
import phoneIcon from "../../../assets/icons/phoneIcon.png";
import CodeInput from "../../../components/CodeInput/index";
import Countdown from "react-countdown";
import PhoneNumberInput from "../../General/PhoneInput/PhoneNumberInput";
import Swal from "sweetalert2";
import axios from "axios";

import { useState, useCallback, useEffect, useMemo } from "react";
const cx = classNames.bind(styles);

const PhoneChange = ({ setIsPhoneChangeDisplay }) => {
  const [loading, setLoading] = useState(false);
  const [currentPhone, setCurrentPhone] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isSentCode, setIsSentCode] = useState(false);
  const [changePhoneCode, setChangePhoneCode] = useState("");
  const [isCountdownCompleted, setIsCountdownCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneSent, setPhoneSent] = useState("");
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

  const checkPhoneValid = () => {
    const isCurrentPhoneValid = phoneRegex.test(currentPhone);
    const isNewPhoneValid = phoneRegex.test(newPhone);
    return isCurrentPhoneValid && isNewPhoneValid;
  };
  console.log("Current Phone", currentPhone);
  console.log("New Phone", newPhone);
  const handleComplete = (code) => {
    console.log("Mã xác thực:", code);
    setChangePhoneCode(() => code);
  };
  useEffect(() => {
    fetchUserData();
  }, []);
  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/user/changePhone",
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const { expireTime, phoneSent } = response.data;
        if (expireTime > 0) {
          setIsSentCode(true);
          const currentTime = Math.floor(Date.now() / 1000);
          const countdownRemaining = expireTime - currentTime;
          setCountdown(countdownRemaining);
          setPhoneSent(phoneSent);
        } else if (expireTime === 0) {
          setCountdown(0);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (changePhoneCode) {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3001/user/verifyPhoneChangeCode",
          { code: changePhoneCode },
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: response.data.msg,
          }).then((result) => {
            if (result.isConfirmed) {
              setIsPhoneChangeDisplay((prev) => !prev);
              window.location.reload();
            }
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
    }
  };

  const handleSendCodeButton = async (e) => {
    e.preventDefault();

    if (!checkPhoneValid()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Current Email or New Email is not valid",
      });
      return;
    }

    if (countdown > 0) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/user/sendPhoneChangeCode",
        { currentPhone, newPhone },
        { withCredentials: true }
      );

      const { status, data } = response;
      const { message } = data;

      if (status === 200 || status === 401) {
        setIsSentCode(true);
        fetchUserData();
      } else if (status === 403) {
        setIsSentCode(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message || "Email has already been used by another account",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message || "An unexpected error occurred",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "An error occurred while processing your request",
      });
      console.error("Error sending code:", error);
    }
  };
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

  const handleCountdownComplete = useCallback(() => {
    setIsCountdownCompleted(true);
  }, []);

  useEffect(() => {
    if (isCountdownCompleted) {
      setCountdown(0);
      setIsCountdownCompleted(false);
    }
  }, [isCountdownCompleted]);
  return (
    <div className={cx("phone-change-container")}>
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
        <h1 className={cx("title")}>Phone Change</h1>
        <button
          className={cx("exitButton")}
          onClick={() => setIsPhoneChangeDisplay(false)}
        >
          X
        </button>
      </div>
      <div className={cx("phone-icon-container")}>
        <img alt="Phone Change Icon " src={phoneIcon} />
      </div>
      <div className={cx("body")}>
        {!isSentCode ? (
          <form className={cx("change-phone-form")}>
            <label htmlFor="phone-change-current-phone">
              Current Phone Numbers
            </label>
            {/* <input
              id="phone-change-current-phone"
              value={currentPhone}
              onChange={(e) => setCurrentPhone(e.target.value)}
            /> */}
            <PhoneNumberInput handlePhoneNumberChange={setCurrentPhone} />
            <label htmlFor="phone-change-new-phone">New Phone Numbers</label>
            <div className={cx("new-phone-input-container")}>
              {/* <input
                id="phone-change-new-phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              /> */}
              <PhoneNumberInput handlePhoneNumberChange={setNewPhone} />
              <button onClick={handleSendCodeButton}>Send OTP</button>
            </div>
          </form>
        ) : (
          <>
            <div className={cx("phone-sent-container")}>
              <div className={cx("phone-notification-check")}>
                <h3>
                  An phone with a verification code was just sent to {phoneSent}
                </h3>
              </div>
              <CodeInput length={6} onComplete={handleComplete} />

              <div className={cx("timer-limit")}>
                <h4>Didn't receive code?</h4>
                {countdown > 0 ? (
                  <div>
                    <h4>Resend in</h4>

                    <Countdown date={countdownDate} renderer={renderer} />
                  </div>
                ) : (
                  <button onClick={() => setIsSentCode(false)}>
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
    </div>
  );
};
export default PhoneChange;
