import styles from "./Address.module.scss";
import classNames from "classnames/bind";
import React, { useState, useEffect } from "react";
import AddressForm from "../../components/Form/Address/index";
import UpdateAddressForm from "../../components/Form/UpdateAddress/index";
import addnewaddressIcon from "../../assets/icons/address/addnewaddress.svg";
import AddressCard from "../../components/Cards/AddressCard/index";
import axios from "axios";
import loadingAnimation from "../../assets/animation/loading.svg";
const cx = classNames.bind(styles);

const Address = () => {
  const [showForm, setShowForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/user/addresses/",
          {
            withCredentials: true,
          }
        );
        const data = response.data;
        setAddresses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [reload]);
  const handleShowUpdateForm = (data) => {
    if (data !== null && typeof data === "object" && !Array.isArray(data)) {
      setAddress(data);
      setShowUpdateForm(!showUpdateForm);
    }
  };
  return (
    <div className={cx("wrapper")}>
      {loading && (
        <div className={cx("loading-container")}>
          <img
            src={loadingAnimation}
            className={cx("loading")}
            alt="Loading..."
          />
        </div>
      )}
      {showForm && (
        <AddressForm setShowForm={setShowForm} setReload={setReload} />
      )}
      {showUpdateForm && (
        <UpdateAddressForm
          setShowUpdateForm={setShowUpdateForm}
          setReload={setReload}
          address={address}
        />
      )}
      <div className={cx("address-heading-title")}>
        <h1>Address</h1>
        <button onClick={() => setShowForm(!showForm)}>
          <img src={addnewaddressIcon} alt="add new address icon" />
          <span>Add new address</span>
        </button>
      </div>
      <div className={cx("main-contents")}>
        <div className={cx("two-blocks")}>
          {addresses &&
            addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                addressId={address._id}
                setLoading={setLoading}
                setReload={setReload}
                handleShowUpdateForm={handleShowUpdateForm}
              />
            ))}
        </div>
        {!addresses ? <h1>No Address Added</h1> : ""}
      </div>
    </div>
  );
};

export default Address;
