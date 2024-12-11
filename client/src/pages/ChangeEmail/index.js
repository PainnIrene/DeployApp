import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "./ChangeEmail.module.scss";
import classNames from "classnames/bind";
import loadingAnimation from "../../assets/animation/loading.svg";
import { useLocation } from "react-router-dom";
const cx = classNames.bind(styles);
const ChangeEmail = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("code");
  const userID = queryParams.get("userID");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3001/user/verifyEmailChangeCodeByURL",
          {},
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
            text: "Verify Email Successful",
            showConfirmButton: true,
            timerProgressBar: true,
            confirmButtonText: "Go to Home",
            timer: 5000, // 5 seconds
            willClose: () => {
              window.location.href = "/";
            },
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "/";
            }
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
            title: "Server error while creating account",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while verifying the email.",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [code, userID]);
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
    </div>
  );
};

export default ChangeEmail;
