import classNames from "classnames/bind";
import styles from "./AddressCard.module.scss";
import locationIcon from "../../../assets/icons/address/location.svg";
import { ReactComponent as StarIcon } from "../../../assets/icons/address/star.svg";
import trashIcon from "../../../assets/icons/address/trash.svg";
import axios from "axios";
import Swal from "sweetalert2";
const cx = classNames.bind(styles);
const AddressCard = ({
  address,
  addressId,
  setLoading,
  setReload,
  handleShowUpdateForm,
}) => {
  const {
    name,
    phone,
    street,
    district,
    province,
    ward,
    note,
    default: isDefault,
  } = address;
  const handleMarkDefaultButton = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (!isDefault) {
        const response = await axios.patch(
          "http://localhost:3001/user/address/default",
          { addressId },
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: "Update Successful",
          });
          setReload((prev) => !prev);
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: response.data.msg,
          });
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleShowDetails = (e) => {
    handleShowUpdateForm(address);
  };
  const handleDeleteAddress = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:3001/user/address/${addressId}`, // Sử dụng params để truyền addressId
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Successful",
          text: "Delete Successful",
        });
        setReload((prev) => !prev);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: response.data.msg,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <button className={cx("card-button")} onClick={handleShowDetails}>
        {isDefault ? (
          <span className={cx("address-label")}>Default Address</span>
        ) : (
          <span></span>
        )}

        <div className={cx("wrapper")}>
          <div className={cx("button-group-container")}>
            <a
              className={cx("mark-default-button")}
              onClick={handleMarkDefaultButton}
            >
              <StarIcon
                className={cx(isDefault ? "star-icon-default" : "star-icon")}
              />
            </a>
            <a className={cx("delete-button")} onClick={handleDeleteAddress}>
              <img src={trashIcon} alt="delete address icon" />
            </a>
          </div>
          <div className={cx("icon-container")}>
            <img src={locationIcon} alt="location icon" />
          </div>
          <div className={cx("address-container")}>
            <div className={cx("user-info")}>
              <h4>{name}</h4>
              <span>|</span>
              <h4>{phone}</h4>
            </div>
            <div className={cx("address-info")}>
              <h4>{note}</h4>
              <h4>{street}</h4>
              <h4>{ward.name + ", " + district.name + ", " + province.name}</h4>
            </div>
          </div>
        </div>
      </button>
    </>
  );
};
export default AddressCard;
