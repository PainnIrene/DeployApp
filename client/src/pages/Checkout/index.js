import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import classNames from "classnames/bind";
import styles from "./Checkout.module.scss";
import Payment from "../../components/Payment/Payment";
import CurrencyFormat from "../../components/General/CurrencyFormat";
import PaypalImage from "../../assets/paypal.jpg";
const cx = classNames.bind(styles);

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const SHIPPING_FEE = 20000;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get("http://localhost:3001/user/addresses", {
        withCredentials: true,
      });
      setAddresses(response.data);
      // Set default address as selected
      const defaultAddress = response.data.find((addr) => addr.default);
      setSelectedAddress(defaultAddress || response.data[0]);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      Swal.fire({
        icon: "error",
        title: "Please select shipping address",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axios.post(
        "http://localhost:3003/order/create",
        {
          items: selectedItems.map((item) => ({
            productId: item.productId,
            optionId: item.optionId,
            quantity: item.quantity,
            price: item.price,
            sellerId: item.sellerId,
            productSnapshot: {
              name: item.name,
              image: item.promotionImage,
              value1: item.value1,
              value2: item.value2,
              type1: item.type1,
              type2: item.type2,
              price: item.price,
            },
          })),
          shippingAddress: {
            fullName: selectedAddress.name,
            phone: selectedAddress.phone,
            address: selectedAddress.street,
            province: selectedAddress.province.name,
            district: selectedAddress.district.name,
            ward: selectedAddress.ward.name,
          },
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setOrderId(response.data.orderId);
        setCurrentStep(2); // Move to payment step
      }
    } catch (error) {
      let errorMessage = "Error creating order";

      if (error.response?.data?.outOfStockItems) {
        const items = error.response.data.outOfStockItems;
        errorMessage = `Some items are out of stock:\n${items
          .map(
            (item) =>
              `${
                selectedItems.find((i) => i.optionId === item.optionId)?.name
              }: ${item.availableQuantity} left`
          )
          .join("\n")}`;
      }

      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (paymentDetails) => {
    try {
      const response = await axios.post(
        "http://localhost:3003/order/payment",
        {
          orderId,
          ...paymentDetails,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        navigate("/order-success");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: error.response?.data?.message || "Error processing payment",
      });
    }
  };

  const steps = [
    { title: "Shipping", number: 1 },
    { title: "Payment", number: 2 },
  ];

  return (
    <div className={cx("checkout-container")}>
      {/* Progress Bar */}
      <div className={cx("progress-bar")}>
        {steps.map((step, index) => (
          <div key={index} className={cx("step-container")}>
            <div
              className={cx("step", {
                active: currentStep >= step.number,
                completed: currentStep > step.number,
              })}
            >
              {currentStep > step.number ? "✓" : step.number}
            </div>
            <div className={cx("step-title")}>{step.title}</div>
            {index < steps.length - 1 && (
              <div
                className={cx("connector", {
                  active: currentStep > step.number,
                })}
              />
            )}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <div className={cx("step-1")}>
          <h1 className={cx("title")}>Checkout</h1>

          <div className={cx("checkout-content")}>
            <div className={cx("main-content")}>
              {/* Shipping Address Section */}
              <div className={cx("section", "address-section")}>
                <div className={cx("section-header")}>
                  <h2>Shipping Address</h2>
                  <button
                    className={cx("change-btn")}
                    onClick={() => setShowAddressModal(true)}
                  >
                    Change
                  </button>
                </div>

                {selectedAddress && (
                  <div className={cx("address-card")}>
                    <div className={cx("address-info")}>
                      <div className={cx("user-info")}>
                        <h4>{selectedAddress.name}</h4>
                        <span>|</span>
                        <h4>{selectedAddress.phone}</h4>
                      </div>
                      <p>{selectedAddress.street}</p>
                      <p>
                        {`${selectedAddress.ward.name}, ${selectedAddress.district.name}, ${selectedAddress.province.name}`}
                      </p>
                      {selectedAddress.note && (
                        <p className={cx("address-note")}>
                          {selectedAddress.note}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items Section */}
              <div className={cx("section", "items-section")}>
                <h2 className={cx("section-title")}>Order Items</h2>
                {selectedItems.map((item, index) => (
                  <div key={index} className={cx("order-item")}>
                    <img
                      src={"https://" + item.promotionImage}
                      alt={item.name}
                      className={cx("item-image")}
                    />
                    <div className={cx("item-details")}>
                      <h3 className={cx("item-name")}>{item.name}</h3>
                      <div className={cx("item-variants")}>
                        {item.value1 && (
                          <span className={cx("variant-tag")}>
                            {item.value1}
                          </span>
                        )}
                        {item.value2 && (
                          <span className={cx("variant-tag")}>
                            {item.value2}
                          </span>
                        )}
                      </div>
                      <div className={cx("item-price-qty")}>
                        <span className={cx("item-price")}>
                          <CurrencyFormat number={item.price} />
                        </span>
                        <span className={cx("item-quantity")}>
                          × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className={cx("item-total")}>
                      <CurrencyFormat number={item.price * item.quantity} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className={cx("order-summary")}>
              <div className={cx("summary-section")}>
                <h2>Order Summary</h2>
                <div className={cx("summary-row")}>
                  <span>Subtotal</span>
                  <span>
                    <CurrencyFormat
                      number={selectedItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )}
                    />
                  </span>
                </div>
                <div className={cx("summary-row")}>
                  <span>Shipping Fee</span>
                  <span>
                    <CurrencyFormat number={SHIPPING_FEE} />
                  </span>
                </div>
                <div className={cx("summary-total")}>
                  <span>Total</span>
                  <span>
                    <CurrencyFormat
                      number={
                        selectedItems.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        ) + SHIPPING_FEE
                      }
                    />
                  </span>
                </div>
                <button
                  className={cx("checkout-btn")}
                  disabled={isProcessing}
                  onClick={handleCreateOrder}
                >
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className={cx("step-2")}>
          <Payment
            orderId={orderId}
            onSuccess={() => {
              navigate("/order-success");
            }}
          />
        </div>
      )}

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className={cx("modal")}>
          <div className={cx("modal-content")}>
            <h2>Select Address</h2>
            {addresses.map((address) => (
              <div
                key={address._id}
                className={cx("address-option", {
                  selected: selectedAddress?._id === address._id,
                })}
                onClick={() => {
                  setSelectedAddress(address);
                  setShowAddressModal(false);
                }}
              >
                <div className={cx("user-info")}>
                  <h4>{address.name}</h4>
                  <span>|</span>
                  <h4>{address.phone}</h4>
                </div>
                <div className={cx("address-info")}>
                  <h4>{address.street}</h4>
                  <h4>
                    {address.ward.name +
                      ", " +
                      address.district.name +
                      ", " +
                      address.province.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
