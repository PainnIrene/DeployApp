import classNames from "classnames/bind";
import styles from "./EmailChange.module.scss";
import loadingAnimation from "../../../assets/animation/loading.svg";
import emailChangeIcon from "../../../assets/icons/emailChangeIcon.webp";
import CodeInput from "../../../components/CodeInput/index";
import Countdown from "react-countdown";
import Swal from "sweetalert2";
import axios from "axios";

import { useState, useCallback, useEffect, useMemo } from "react";
const cx = classNames.bind(styles);

const EmailChange = ({ setIsEmailChangeDisplay }) => {
  const [loading, setLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isSentCode, setIsSentCode] = useState(false);
  const [changeEmailCode, setChangeEmailCode] = useState("");
  const [isCountdownCompleted, setIsCountdownCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState("");
  const emailRegex =
    /^(?!.*[.@]{2})(?!.*[ .]@)[a-zA-Z0-9]+(?:[ .][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:-?[a-zA-Z0-9]+)*(?:\.[a-zA-Z]{2,})+$/;

  const checkEmailValid = () => {
    const isCurrentEmailValid = emailRegex.test(currentEmail);
    const isNewEmailValid = emailRegex.test(newEmail);
    return isCurrentEmailValid && isNewEmailValid;
  };

  const handleComplete = (code) => {
    console.log("Mã xác thực:", code);
    setChangeEmailCode(() => code);
  };
  useEffect(() => {
    fetchUserData();
  }, []);
  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/user/changeEmail",
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const { expireTime, emailSent } = response.data;
        if (expireTime > 0) {
          setIsSentCode(true);
          const currentTime = Math.floor(Date.now() / 1000);
          const countdownRemaining = expireTime - currentTime;
          setCountdown(countdownRemaining);
          setEmailSent(emailSent);
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
    if (changeEmailCode) {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3001/user/verifyEmailChangeCode",
          { code: changeEmailCode },
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
              setIsEmailChangeDisplay((prev) => !prev);
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

    if (!checkEmailValid()) {
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
        "http://localhost:3001/user/sendEmailChangeCode",
        { currentEmail, newEmail },
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
    <div className={cx("email-change-container")}>
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
        <h1 className={cx("title")}>Email Change</h1>
        <button
          className={cx("exitButton")}
          onClick={() => setIsEmailChangeDisplay(false)}
        >
          X
        </button>
      </div>
      <div className={cx("email-icon-container")}>
        <img alt="Email Change Icon " src={emailChangeIcon} />
      </div>
      <div className={cx("body")}>
        {!isSentCode ? (
          <form className={cx("change-email-form")}>
            <label htmlFor="email-change-current-email">Current Email</label>
            <input
              id="email-change-current-email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
            />
            <label htmlFor="email-change-new-email">New Email</label>
            <div className={cx("new-email-input-container")}>
              <input
                id="email-change-new-email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button onClick={handleSendCodeButton}>Send Code</button>
            </div>
          </form>
        ) : (
          <>
            <div className={cx("email-sent-container")}>
              <div className={cx("email-notification-check")}>
                <h3>
                  An email with a verification code was just sent to {emailSent}
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
export default EmailChange;
