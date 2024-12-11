import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Register.module.scss";
import classNames from "classnames/bind";
import background from "../../../assets/images/background.jpg";
import googleIcon from "../../../assets/icons/google.svg";
import facebookIcon from "../../../assets/icons/facebook.svg";
import redirectIcon from "../../../assets/icons/go.svg";
import loadingAnimation from "../../../assets/animation/loading.svg";
import Swal from "sweetalert2";
import PhoneNumberInput from "../../General/PhoneInput/PhoneNumberInput";

const cx = classNames.bind(styles);

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmPasswordValid, SetIsConfirmPasswordValid] = useState(false);
  const [passRule1, setPassRule1] = useState(false); //length >=8
  const [passRule2, setPassRule2] = useState(false); //1 lowerCase
  const [passRule3, setPassRule3] = useState(false); //1 uppercase
  const [passRule4, setPassRule4] = useState(false); //Number(0-9)
  const [passRule5, setPassRule5] = useState(false); //1 special Character
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneNumberChange = (value) => {
    setPhoneNumbers(value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checked !== true) {
      Swal.fire({
        icon: "question",
        text: "You do not agree with our terms and policies?",
      });
    } else {
      if (
        isEmailValid &&
        isPhoneNumberValid &&
        isPasswordValid &&
        isConfirmPasswordValid &&
        isUsernameValid
      ) {
        try {
          setLoading(true);
          const response = await axios.post(
            "http://localhost:3001/auth/register",
            {
              email,
              password,
              username,
              phoneNumbers,
            }
          );
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Successful",
              text: "Register Successful",
            });
            navigate("/login");
          } else if (response.status === 201) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: response.data.msg,
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Server err white creating account",
            });
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "You must complete the form to register new account",
        });
      }
    }
  };

  useEffect(() => {
    const emailRegex =
      /^(?!.*[.@]{2})(?!.*[ .]@)[a-zA-Z0-9]+(?:[ .][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:-?[a-zA-Z0-9]+)*(?:\.[a-zA-Z]{2,})+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  useEffect(() => {
    const validatePhoneNumber = () => {
      if (phoneNumbers.length !== 11) {
        return false;
      }
      if (!phoneNumbers.startsWith("84")) {
        return false;
      }
      const prefix = phoneNumbers.substring(2, 4);
      const viettel = [
        "86",
        "96",
        "97",
        "98",
        "32",
        "34",
        "35",
        "36",
        "37",
        "38",
        "39",
      ];
      const vinaphone = ["88", "91", "94", "83", "84", "85", "81", "82"];
      const mobiphone = ["89", "90", "93", "70", "79", "76", "77", "78"];
      const vietnammobile = ["92", "56", "58"];
      const gmobile = ["99", "59"];
      const itelecom = ["87"];

      if (
        viettel.includes(prefix) ||
        vinaphone.includes(prefix) ||
        mobiphone.includes(prefix) ||
        vietnammobile.includes(prefix) ||
        gmobile.includes(prefix) ||
        itelecom.includes(prefix)
      ) {
        return true;
      }

      return false;
    };
    setIsPhoneNumberValid(validatePhoneNumber());
  }, [phoneNumbers]);
  useEffect(() => {
    if (username.includes("@") || username === "") setIsUsernameValid(false);
    else setIsUsernameValid(true);
  }, [username]);
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
  }, [password]);
  useEffect(() => {
    if (password === confirmPassword && confirmPassword !== "") {
      SetIsConfirmPasswordValid(true);
    } else {
      SetIsConfirmPasswordValid(false);
    }
  }, [confirmPassword]);

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
      <form className={cx("form", "form-register")}>
        <h2>Register</h2>
        <input
          className={cx("input")}
          type="text"
          id="username"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />
        <input
          className={cx("input")}
          type="text"
          id="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PhoneNumberInput handlePhoneNumberChange={handlePhoneNumberChange} />
        <input
          className={cx("input", "password")}
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className={cx("input", "password")}
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <div className={cx("checkBox")}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              checked ? setChecked(false) : setChecked(true);
            }}
          />
          <h4>I agree with Term and Policies</h4>
        </div>
        <br />
        <hr />
        <br />
        <p className={cx(isUsernameValid ? "valid" : "notValid")}>
          Username must not empty and include "@"
        </p>
        <p className={cx(isEmailValid ? "valid" : "notValid")}>
          Email Correct Format (ex:ipain@greenwich-edu.com)
        </p>
        <p className={cx(isPhoneNumberValid ? "valid" : "notValid")}>
          Phone Number Valid
        </p>
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
          Register
        </button>
      </form>
      <form className={cx("form", "form-oauth")}>
        <div className={cx("background-container")}>
          <img src={background} className={cx("background-image")} />
        </div>
        <br />
        <div className={cx("hr-with-text")}>
          <hr />
          <span>OR</span>
        </div>
        <div className={cx("button-container")}>
          <button className={cx("google-button")}>
            <img src={googleIcon} />
            <p>Continue with Google</p>
          </button>
          <button className={cx("facebook-button")}>
            <img src={facebookIcon} />
            <p>Continue with Facebook</p>
          </button>
        </div>
        <h3>Already have account?</h3>
        <br />

        <a className={cx("login-redirect-button")} href="/login">
          <span>Go to Login Page</span>
          <img src={redirectIcon} />
        </a>
      </form>
    </div>
  );
}

export default Register;
