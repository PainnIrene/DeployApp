import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/userContext/userContext";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.scss";
import classNames from "classnames/bind";
import facebookIcon from "../../../assets/icons/facebook.svg";
import googleIcon from "../../../assets/icons/google.svg";
import redirectIcon from "../../../assets/icons/go.svg";
import loadingAnimation from "../../../assets/animation/loading.svg";

const cx = classNames.bind(styles);

function Login() {
  const { updateUser } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [inputUser, setInputUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/seller/auth/login",
        {
          username,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        console.log("Login successful");

        updateUser(response.data);
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      setError("Invalid Email or Password");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const emailRegex =
      /^(?!.*[.@]{2})(?!.*[ .]@)[a-zA-Z0-9]+(?:[ .][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:-?[a-zA-Z0-9]+)*(?:\.[a-zA-Z]{2,})+$/;
    const isEmail = emailRegex.test(inputUser);
    if (isEmail) {
      setEmail(inputUser);
      setUsername("");
    } else {
      setUsername(inputUser);
      setEmail("");
    }
  }, [inputUser]);
  console.log("email: ", email);
  console.log("uname: ", username);
  return (
    <div className={cx("container")}>
      <form className={cx("form")} onSubmit={handleSubmit}>
        {loading && (
          <div className={cx("loading-container")}>
            <img
              src={loadingAnimation}
              className={cx("loading")}
              alt="Loading..."
            />
          </div>
        )}
        <h2>Login</h2>

        <input
          className={cx("input")}
          type="text"
          id="inputUser"
          name="inputUser"
          placeholder="Email/Username"
          value={inputUser}
          onChange={(e) => setInputUser(e.target.value)}
          autoFocus
          required
        />
        <input
          className={cx("input")}
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className={cx("forgot-password")}>
          <Link to="/forgotpassword">
            <span>Forgot password?</span>
          </Link>
        </div>
        {error && <p className={cx("error")}>{error}</p>}
        <button className={cx("button")} type="submit">
          Login
        </button>
        <br />
        <br />
        <div>
          <h1 className={cx("login-with")}>Or login with</h1>
          <div className={cx("login-oauth-container")}>
            <button className={cx("facebook-button")}>
              <img src={facebookIcon} />
              <span>Facebook</span>
            </button>
            <button className={cx("google-button")}>
              <img src={googleIcon} />
              <span>Google</span>
            </button>
          </div>
        </div>
        <h3 className={cx("login-with")}>Do not have account?</h3>
        <br />
        <a className={cx("login-redirect-button")} href="/register">
          <span>Go to Register Page</span>
          <img src={redirectIcon} />
        </a>
      </form>
    </div>
  );
}

export default Login;
