import styles from "./AddressForm.module.scss";
import classNames from "classnames/bind";
import Maps from "../../Maps/Maps";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import loadingAnimation from "../../../assets/animation/loading.svg";
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "vn-local-plus";

const cx = classNames.bind(styles);

const AddressForm = ({ setShowForm, setReload }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    note: "",
    latitude: null,
    longitude: null,
  });
  const [defaultAddress, setDefaultAddress] = useState(false);
  const [fullAddress, setFullAddress] = useState("");

  useEffect(() => {
    setProvinces(getProvinces());
  }, []);

  useEffect(() => {
    const { province, district, ward, street } = formData;
    const selectedProvince =
      (provinces && provinces.find((p) => p.code === province)?.name) || "";
    const selectedDistrict =
      (districts && districts.find((d) => d.code === district)?.name) || "";
    const selectedWard =
      (wards && wards.find((w) => w.code === ward)?.name) || "";

    const newFullAddress = `${street}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`;
    setFullAddress(newFullAddress);
  }, [formData, provinces, districts, wards]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "province") {
      setDistricts(getDistrictsByProvinceCode(value));
      setFormData((prev) => ({ ...prev, district: "", ward: "" }));
      setWards([]);
    }

    if (id === "district") {
      setWards(getWardsByDistrictCode(value));
      setFormData((prev) => ({ ...prev, ward: "", street: "", note: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      province,
      district,
      ward,
      name,
      phone,
      street,
      latitude,
      longitude,
      note,
    } = formData;

    const selectedProvinceData = provinces.find((p) => p.code === province);
    const selectedDistrictData = districts.find((d) => d.code === district);
    const selectedWardData = wards.find((w) => w.code === ward);

    const address = {
      name,
      phone,
      province: {
        code: selectedProvinceData?.code,
        name: selectedProvinceData?.name,
      },
      district: {
        code: selectedDistrictData?.code,
        name: selectedDistrictData?.name,
      },
      ward: {
        code: selectedWardData?.code,
        name: selectedWardData?.name,
      },
      street,
      latitude,
      longitude,
      defaultAddress,
      note,
    };
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3001/user/address",
        address,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Successful",
          text: "Add new address successful",
        });
        setReload((prev) => !prev);
        setShowForm(false);
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

  const renderSelect = (id, value, options, placeholder) => (
    <div className={cx("form-group")}>
      <select
        id={id}
        value={value}
        onChange={handleInputChange}
        required
        className={cx("form-control")}
      >
        <option value="">{placeholder}</option>
        {options &&
          options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
      </select>
    </div>
  );
  const handleCheckboxChange = (event) => {
    setDefaultAddress(event.target.checked);
  };
  return (
    <div className={cx("address-container")}>
      {loading && (
        <div className={cx("loading-container")}>
          <img
            src={loadingAnimation}
            className={cx("loading")}
            alt="Loading..."
          />
        </div>
      )}
      <div className={cx("address-heading")}>
        <h1 className={cx("title")}>New Address</h1>
        <button className={cx("exitButton")} onClick={() => setShowForm(false)}>
          X
        </button>
      </div>
      <div className={cx("add-new-address")}>
        <form onSubmit={handleSubmit} className={cx("address-form")}>
          <div className={cx("form-row")}>
            <div className={cx("form-group")}>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                required
                className={cx("input-name")}
              />
            </div>
            <div className={cx("form-group")}>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                required
                className={cx("input-phone")}
              />
            </div>
          </div>
          <div className={cx("form-row")}>
            {renderSelect(
              "province",
              formData.province,
              provinces,
              "Select Province/City"
            )}
            {renderSelect(
              "district",
              formData.district,
              districts,
              "Select District"
            )}
            {renderSelect("ward", formData.ward, wards, "Select Ward")}
          </div>
          <div className={cx("form-group")}>
            <input
              type="text"
              id="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="Enter House Number, Street Name"
              required
              className={cx("input-street")}
            />
            <input
              type="text"
              id="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Note (e.g., hotel lobby, building, etc.)"
            />
          </div>
          <Maps fullAddress={fullAddress} setFormData={setFormData} />
          <span className={cx("warning")}>
            *Please move marker to specify exactly your location
          </span>
          <div className={cx("checkbox-default-address")}>
            <label className={cx("checkBox")}>
              <input
                type="checkbox"
                checked={defaultAddress}
                onChange={handleCheckboxChange}
              />
              <span>Set this as default address</span>
            </label>
          </div>
          <div className={cx("submit-container")}>
            <button type="submit" className={cx("submitButton")}>
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
