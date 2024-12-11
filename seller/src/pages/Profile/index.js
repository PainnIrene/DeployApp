import styles from "./Profile.module.scss";
import classNames from "classnames/bind";
import { useState, useEffect } from "react";
import defaultAvt from "../../assets/images/defaultavt.png";
import ShopImage from "../../components/Shop/ShopImage";
import ShopInfo from "../../components/Shop/ShopInformation";
import axios from "axios";
const cx = classNames.bind(styles);
const Profile = () => {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [taxNumbers, setTaxNumbers] = useState("");
  const [address, setAddress] = useState("");
  const [imgPrev, setImgPrev] = useState("");
  const [avtUrl, setAvtUrl] = useState("");
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImgPrev(previewURL);
    }
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          "http://localhost:3001/seller/profile/",
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          const { name, email, taxNumbers } = response.data;
          console.log(response.data);
          setEmail(email);
          setShopName(name);
          setTaxNumbers(taxNumbers);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);
  return (
    <div className={cx("container")}>
      <div className={cx("preview-shop-container")}>
        <div className={cx("box-title-preview")}>
          <h4>Preview Shop</h4>
        </div>
        <div className={cx("shop-preview-image")}>
          <ShopImage width={"390px"} height={"130px"} />
        </div>
        <div className={cx("shop-preview-information")}>
          <ShopInfo />
        </div>
      </div>
      <div className={cx("main-contents")}>
        <div className={cx("flex-box-row")}>
          <div className={cx("box-title-edit")}>
            <h4>Edit Profile</h4>
          </div>
          <div className={cx("left")}>
            <tbody>
              <tr>
                <td className={cx("label")}>
                  <label>ShopName</label>
                </td>
                <td className={cx("input")}>
                  <input
                    type="text"
                    id="shopName"
                    name="shopName"
                    className={cx("shopNameInput")}
                    placeholder=""
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
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
                    className={cx("shopNameInput")}
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className={cx("label")}>
                  <label>Address Business</label>
                </td>
                <td className={cx("input")}>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className={cx("shopNameInput")}
                    placeholder=""
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className={cx("label")}>
                  <label>Tax Number</label>
                </td>
                <td className={cx("input")}>
                  <input
                    type="text"
                    id="taxNumbers"
                    name="taxNumbers"
                    className={cx("shopNameInput")}
                    placeholder=""
                    value={taxNumbers}
                    onChange={(e) => setTaxNumbers(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </div>
          <hr />
          <div className={cx("right")}>
            <div className={cx("user-image-container")}>
              <div className={cx("profile-image-container")}>
                <img src={imgPrev || avtUrl || defaultAvt} alt="avatar" />
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
          <button
            onClick={() => console.log("")}
            className={cx("submitButton")}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};
export default Profile;
