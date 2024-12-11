import styles from "./UpdateAddress.module.scss";
import classNames from "classnames/bind";
import MapCoordinates from "../../Maps/MapCoordinates/MapCoordinates";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import loadingAnimation from "../../../assets/animation/loading.svg";
import lodash from "lodash";
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "vn-local-plus";

const cx = classNames.bind(styles);

const UpdateAddress = ({ setShowUpdateForm, setReload, address }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(address);
  const [initData, setInitData] = useState(address);
  const [defaultAddress, setDefaultAddress] = useState(address.default);
  const [fullAddress, setFullAddress] = useState("");
  useEffect(() => {
    setInitData(address);
    setFormData(address);
  }, [address]);
  useEffect(() => {
    setProvinces(getProvinces());
  }, []);
  useEffect(() => {
    if (formData.province && formData.province.code) {
      setDistricts(getDistrictsByProvinceCode(formData.province.code));
    } else {
      setDistricts([]);
    }
  }, [formData.province]);

  useEffect(() => {
    if (formData.district && formData.district.code) {
      setWards(getWardsByDistrictCode(formData.district.code));
    } else {
      setWards([]);
    }
  }, [formData.district]);

  useEffect(() => {
    const { province, district, ward, street } = formData;
    const selectedProvince =
      (provinces &&
        provinces.find((p) => p.code === (province && province.code))?.name) ||
      "";
    const selectedDistrict =
      (districts &&
        districts.find((d) => d.code === (district && district.code))?.name) ||
      "";
    const selectedWard =
      (wards && wards.find((w) => w.code === (ward && ward.code))?.name) || "";

    const newFullAddress = `${street}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`;
    setFullAddress(newFullAddress);
  }, [formData, provinces, districts, wards]);

  const getCoordinatesFromAddress = async (address) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
      );
      if (response.data && response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
        };
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
    return null;
  };

  const updateMapCoordinates = async (updatedFormData) => {
    let addressToSearch = "";
    if (updatedFormData.province && updatedFormData.province.name) {
      addressToSearch += updatedFormData.province.name;
    }
    if (updatedFormData.district && updatedFormData.district.name) {
      addressToSearch += ", " + updatedFormData.district.name;
    }
    if (updatedFormData.ward && updatedFormData.ward.name) {
      addressToSearch += ", " + updatedFormData.ward.name;
    }
    if (updatedFormData.street) {
      addressToSearch += ", " + updatedFormData.street;
    }

    if (addressToSearch) {
      const coordinates = await getCoordinatesFromAddress(addressToSearch);
      if (coordinates) {
        setFormData((prev) => ({
          ...prev,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }));
      }
    }
  };

  const handleInputChange = async (e) => {
    const { id, value } = e.target;

    let updatedFormData = { ...formData };

    if (id === "province") {
      const selectedProvince = provinces.find((p) => p.code === value);
      updatedFormData = {
        ...updatedFormData,
        province: selectedProvince || {},
        district: {},
        ward: {},
        street: "",
        note: "",
      };
      setDistricts(getDistrictsByProvinceCode(value));
      setWards([]);
    } else if (id === "district") {
      const selectedDistrict = districts.find((d) => d.code === value);
      updatedFormData = {
        ...updatedFormData,
        district: selectedDistrict || {},
        ward: {},
        street: "",
        note: "",
      };
      setWards(getWardsByDistrictCode(value));
    } else if (id === "ward") {
      const selectedWard = wards.find((w) => w.code === value);
      updatedFormData = {
        ...updatedFormData,
        ward: selectedWard || {},
        street: "",
        note: "",
      };
    } else {
      updatedFormData = { ...updatedFormData, [id]: value };
    }

    setFormData(updatedFormData);

    // Update map coordinates
    await updateMapCoordinates(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const areEqual = lodash.isEqual(formData, initData);
    if (areEqual && initData.default === defaultAddress) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "No Data Change!",
      });
    } else if (initData.default && !defaultAddress) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "You need set at least 1 default address",
      });
    } else {
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

      const updatedAddress = {
        name,
        phone,
        province: {
          code: province.code,
          name: province.name,
        },
        district: {
          code: district.code,
          name: district.name,
        },
        ward: {
          code: ward.code,
          name: ward.name,
        },
        street,
        latitude,
        longitude,
        default: defaultAddress,
        note,
      };

      try {
        setLoading(true);
        const response = await axios.patch(
          `http://localhost:3001/user/address/${address._id}`,
          updatedAddress,
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: "Update address successful",
          });
          setReload((prev) => !prev);
          setShowUpdateForm(false);
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
          text: err.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };
  console.log(formData);
  const renderSelect = (id, value, options, placeholder) => (
    <div className={cx("form-group")}>
      <select
        id={id}
        value={value && value.code ? value.code : ""}
        onChange={handleInputChange}
        required
        className={cx("form-control")}
      >
        <option value="">{placeholder}</option>
        {options &&
          options.length > 0 &&
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
        <h1 className={cx("title")}>Update Address</h1>
        <button
          className={cx("exitButton")}
          onClick={() => setShowUpdateForm(false)}
        >
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
                placeholder="=Name"
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
          <MapCoordinates
            fullAddress={fullAddress}
            setFormData={setFormData}
            latitude={formData.latitude}
            longitude={formData.longitude}
            initData={initData}
          />
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAddress;
