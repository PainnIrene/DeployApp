import { useState, useEffect } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Profile.module.scss";
import defaultAvt from "../../assets/images/defaultavt.png";
import loadingAnimation from "../../assets/animation/loading.svg";
import Swal from "sweetalert2";
// import SideBarProfile from "../../components/SideBarProfile/index.js";
import EmailVerifyComponent from "../../components/Auth/EmailVerify/index";
import PhoneVerifyComponent from "../../components/Auth/PhoneVerify/index";
import EmailChangeComponent from "../../components/Auth/EmailChange/index";
import PhoneChangeComponent from "../../components/Auth/PhoneChange/index";
import { useUser } from "../../contexts/userContext/userContext";

const cx = classNames.bind(styles);

function Profile() {
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phoneNumbers: "",
    gender: "",
    dateOfBirth: "",
    avtUrl: "",
  });
  const [originValue, setOriginValue] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    avtUrl: "",
  });
  const [file, setFile] = useState();
  const [imgPrev, setImgPrev] = useState();
  const [loading, setLoading] = useState(false);
  const [renewForm, setRenewForm] = useState(false);
  const [isEmailVerify, setIsEmailVerify] = useState(false);
  const [isPhoneNumberVerify, setIsPhoneNumberVerify] = useState(false);
  const [isEmailVerifyDisplay, setIsEmailVerifyDisplay] = useState(false);
  const [isPhoneVerifyDisplay, setIsPhoneVerifyDisplay] = useState(false);
  const [isEmailChangeDisplay, setIsEmailChangeDisplay] = useState(false);
  const [isPhoneChangeDisplay, setIsPhoneChangeDisplay] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        //ignore
        // setIsEmailVerify(true);
        // setIsPhoneNumberVerify(true);
        const response = await axios.get(
          "http://localhost:3001/user/profile/",
          {
            withCredentials: true,
          }
        );
        const userData = response.data;
        setFormData({
          username: userData.username || "",
          name: userData.name || "",
          email: userData.email || "",
          phoneNumbers: userData.phoneNumbers || "",
          gender: userData.gender || "",
          dateOfBirth: userData.dateOfBirth || "",
          avtUrl: userData.avtUrl || "",
        });
        setIsEmailVerify(userData.isEmailVerify || false);
        setIsPhoneNumberVerify(userData.isPhoneNumberVerify || false);
        setOriginValue({
          name: userData.name || "",
          gender: userData.gender || "",
          dateOfBirth: userData.dateOfBirth || "",
          avtUrl: userData.avtUrl || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [renewForm, isEmailVerifyDisplay, isPhoneVerifyDisplay]);

  const handleSubmit = async (e) => {
    if (
      formData.name !== originValue.name ||
      formData.gender !== originValue.gender ||
      formData.dateOfBirth !== originValue.dateOfBirth ||
      (imgPrev && file)
    ) {
      try {
        setLoading(true);
        const formDataSubmit = new FormData();
        formDataSubmit.append("name", formData.name);
        formDataSubmit.append("gender", formData.gender);
        formDataSubmit.append("dateOfBirth", formData.dateOfBirth);
        if (file) {
          formDataSubmit.append("file", file);
        }
        const response = await axios.patch(
          "http://localhost:3001/user/profile",
          formDataSubmit,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: response.data.msg,
          });
          updateUser({
            username: response.data.data.username,
            name: response.data.data.name,
            avtUrl: response.data.data.avtUrl || "",
          });
          setRenewForm(!renewForm);
        }
      } catch (err) {
        // setError("Invalid Email or Password");
        console.error("Login error:", err);
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "No Data Change",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { username, name, email, phoneNumbers, gender, dateOfBirth } = formData;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const previewURL = URL.createObjectURL(file);
      setImgPrev(previewURL);
    }
  };
  useEffect(() => {
    if (imgPrev) {
      return () => {
        URL.revokeObjectURL(imgPrev);
      };
    }
  }, [imgPrev]);
  // console.log(formData);
  // console.log(file);
  console.log(imgPrev);
  return (
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
      <h1>My Profile</h1>
      <span>Manage profile information for account security</span>
      {isEmailVerifyDisplay && (
        <EmailVerifyComponent
          setIsEmailVerifyDisplay={setIsEmailVerifyDisplay}
        />
      )}
      {isEmailChangeDisplay && (
        <EmailChangeComponent
          setIsEmailChangeDisplay={setIsEmailChangeDisplay}
        />
      )}
      {isPhoneVerifyDisplay && (
        <PhoneVerifyComponent
          setIsPhoneVerifyDisplay={setIsPhoneVerifyDisplay}
        />
      )}
      {isPhoneChangeDisplay && (
        <PhoneChangeComponent
          setIsPhoneChangeDisplay={setIsPhoneChangeDisplay}
        />
      )}
      <form className={cx("form-profile-edit")}>
        <table className={cx("profile-details-table")}>
          <tbody>
            <tr>
              <td className={cx("label")}>
                <label>Username</label>
              </td>
              <td className={cx("input")}>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={cx("usernameInput")}
                  placeholder=""
                  value={username}
                  disabled
                />
              </td>
            </tr>
            <tr>
              <td className={cx("label")}>
                <label>Name</label>
              </td>
              <td className={cx("input")}>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  className={cx("nameInput")}
                  placeholder="Name"
                  // required
                />
              </td>
            </tr>
            <tr>
              <td className={cx("label")}>
                <label>Email</label>
              </td>
              <td className={cx("input")}>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={email}
                  // onChange={handleChange}
                  className={cx("emailInput")}
                  placeholder="Email"
                  disabled
                />
                <div className={cx("edit-user-container")}>
                  {isEmailVerify ? (
                    <button
                      className={cx("verify")}
                      onClick={(e) => e.preventDefault()}
                    ></button>
                  ) : (
                    <button
                      className={cx("notVerify")}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEmailVerifyDisplay((prev) => !prev);
                      }}
                    >
                      Verify
                    </button>
                  )}

                  <button
                    className={cx("change-user-verify")}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEmailChangeDisplay((prev) => !prev);
                    }}
                  >
                    Change
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td className={cx("label")}>
                <label>Phone Number</label>
              </td>
              <td className={cx("input")}>
                <input
                  type="text"
                  id="phoneNumbers"
                  name="phoneNumbers"
                  value={phoneNumbers ? "+" + phoneNumbers : ""}
                  // onChange={handleChange}
                  placeholder="Phone number"
                  disabled
                />
                <div className={cx("edit-user-container")}>
                  {isPhoneNumberVerify ? (
                    <button
                      className={cx("verify")}
                      onClick={(e) => e.preventDefault()}
                    ></button>
                  ) : (
                    <button
                      className={cx("notVerify")}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsPhoneVerifyDisplay((prev) => !prev);
                      }}
                    >
                      Verify
                    </button>
                  )}
                  <button
                    className={cx("change-user-verify")}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPhoneChangeDisplay((prev) => !prev);
                    }}
                  >
                    Change
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td className={cx("label")}>
                <label>Gender</label>
              </td>
              <td className={cx("genderInput")}>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={handleChange}
                  />
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={handleChange}
                  />
                  Female
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={gender === "other"}
                    onChange={handleChange}
                  />
                  Other
                </label>
              </td>
            </tr>
            <tr>
              <td className={cx("label")}>
                <label>Date Of Birth</label>
              </td>
              <td className={cx("input")}>
                <input
                  placeholder="Date Of Birth"
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={handleChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <hr />
        <div className={cx("profile-image-edit")}>
          <div className={cx("user-image-container")}>
            <div className={cx("profile-image-container")}>
              <img
                src={imgPrev || formData.avtUrl || defaultAvt}
                alt="avatar"
              />
            </div>
            <div className={cx("input-avt-container")}>
              <label htmlFor="file-input">Upload Image</label>
              <input
                id="file-input"
                type="file"
                name="file"
                className={cx("input-avt-upload")}
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
          </div>
        </div>
      </form>
      <button onClick={handleSubmit} className={cx("submitButton")}>
        Update
      </button>
    </div>
  );
}
export default Profile;
