import styles from "./Cart.module.scss";
import classNames from "classnames/bind";
import dropdownIcon from "../../assets/icons/cart/dropdown.svg";
import CurrencyFormat from "../../components/General/CurrencyFormat/index";
import { useEffect, useState } from "react";
import axios from "axios";
import chatIcon from "../../assets/icons/cart/chat.svg";
import deleteIcon from "../../assets/icons/address/trash.svg";
import plusIcon from "../../assets/icons/product/plus.svg";
import minusIcon from "../../assets/icons/product/minus.svg";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function Cart() {
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState({
    id: "",
    quantity: "",
  });
  const [listSelectedItems, setListSelectedItems] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const subtotal = listSelectedItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  console.log(listSelectedItems);
  const shippingFee = 20000;
  const navigate = useNavigate();
  useEffect(() => {
    getUserCart();
  }, []);
  const handleSelectAll = () => {
    if (isSelectAll) {
      setListSelectedItems([]);
    } else {
      const allItems = cart.flatMap((shop) =>
        shop.items.map((item) => ({
          productId: item.productId,
          optionId: item.optionId,
          name: item.productName,
          price: item.price,
          value1: item.value1,
          value2: item.value2,
          promotionImage: item.promotionImage,
          quantity: item.quantity,
        }))
      );
      setListSelectedItems(allItems);
    }
    setIsSelectAll(!isSelectAll);
  };
  const handleShopSelect = (shop) => {
    const shopItems = shop.items.map((item) => ({
      productId: item.productId,
      optionId: item.optionId,
      name: item.productName,
      price: item.price,
      value1: item.value1,
      value2: item.value2,
      promotionImage: item.promotionImage,
      quantity: item.quantity,
    }));

    const allShopItemsSelected = shopItems.every((item) =>
      listSelectedItems.some(
        (selectedItem) =>
          selectedItem.productId === item.productId &&
          selectedItem.optionId === item.optionId
      )
    );

    if (allShopItemsSelected) {
      setListSelectedItems(
        listSelectedItems.filter(
          (selectedItem) =>
            !shopItems.some(
              (item) =>
                selectedItem.productId === item.productId &&
                selectedItem.optionId === item.optionId
            )
        )
      );
    } else {
      const newItems = shopItems.filter(
        (item) =>
          !listSelectedItems.some(
            (selectedItem) =>
              selectedItem.productId === item.productId &&
              selectedItem.optionId === item.optionId
          )
      );
      setListSelectedItems([...listSelectedItems, ...newItems]);
    }
  };
  const handleItemSelect = (item) => {
    const itemData = {
      productId: item.productId,
      optionId: item.optionId,
      name: item.productName,
      price: item.price,
      value1: item.value1,
      value2: item.value2,
      promotionImage: item.promotionImage,
      quantity: item.quantity,
      sellerId: item.sellerId._id,
    };

    const isSelected = listSelectedItems.some(
      (selectedItem) =>
        selectedItem.productId === itemData.productId &&
        selectedItem.optionId === itemData.optionId
    );

    if (isSelected) {
      // Bỏ chọn item
      setListSelectedItems(
        listSelectedItems.filter(
          (selectedItem) =>
            selectedItem.productId !== itemData.productId ||
            selectedItem.optionId !== itemData.optionId
        )
      );
    } else {
      setListSelectedItems([...listSelectedItems, itemData]);
    }
  };
  const getUserCart = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cart/all", {
        withCredentials: true,
      });
      setCart(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (productId, value1, value2, updateQuantity) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/cart/updatequantity",
        { productId, value1, value2, updateQuantity },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        getUserCart();
        setListSelectedItems((prevItems) =>
          prevItems.map((item) =>
            item.productId === productId &&
            item.value1 === value1 &&
            item.value2 === value2
              ? { ...item, quantity: updateQuantity }
              : item
          )
        );
        Swal.fire("Success", "Update Successfully", "success");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message || "Unknown error";

        if (status === 400) {
          Swal.fire("Error", message, "error");
        } else if (status === 404) {
          Swal.fire("Error", message, "error");
        } else if (status === 500) {
          Swal.fire("Error", "Server Error please try again later", "error");
        } else {
          Swal.fire("Error", "Error Please Try Again", "error");
        }
      } else {
        Swal.fire(
          "Lỗi",
          "Network Error please check internet connection and try again",
          "error"
        );
      }
      console.error(error);
    }
  };

  const confirmDeleteItem = (productId, value1, value2) => {
    Swal.fire({
      title: "Confirm",
      text: "Do you want to delete product item from cart ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        updateQuantity(productId, value1, value2, 0);
      }
    });
  };

  const handleCheckout = () => {
    if (listSelectedItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Please select items to checkout",
      });
      return;
    }

    navigate("/checkout", {
      state: {
        selectedItems: listSelectedItems,
      },
    });
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("main")}>
        <div className={cx("heading-cols")}>
          <div className={cx("check-box-container")}>
            <input
              type="checkBox"
              checked={isSelectAll}
              onChange={handleSelectAll}
              className={cx("checkBox")}
            />
          </div>
          <div className={cx("product-details-container")}>Product Details</div>
          <div className={cx("unit-price-container")}>Unit Price</div>
          <div className={cx("quantity-container")}>Quantity</div>
          <div className={cx("total-price-container")}>Total Price</div>
          <div className={cx("actions-container")}>Actions</div>
        </div>
        {cart &&
          cart.length > 0 &&
          cart.map((shop) => (
            <div
              key={shop.sellerId._id}
              className={cx("items-by-shop-container")}
            >
              <div className={cx("shop-information-container")}>
                <div className={cx("check-box-shop")}>
                  <input
                    type="checkBox"
                    checked={shop.items.every((item) =>
                      listSelectedItems.some(
                        (selectedItem) =>
                          selectedItem.productId === item.productId &&
                          selectedItem.optionId === item.optionId
                      )
                    )}
                    className={cx("checkBox")}
                    onChange={() => handleShopSelect(shop)}
                  />
                </div>
                <div className={cx("shop-details")}>
                  <h1>{shop.sellerId.shopName}</h1>
                  <button>
                    <img src={chatIcon} alt="chat to shop" />
                  </button>
                </div>
              </div>
              <div className={cx("items-list-container")}>
                {shop.items.map((item) => (
                  <div key={item._id} className={cx("item-container")}>
                    <div className={cx("check-box-item")}>
                      <input
                        type="checkBox"
                        checked={listSelectedItems.some(
                          (selectedItem) =>
                            selectedItem.productId === item.productId &&
                            selectedItem.optionId === item.optionId
                        )}
                        className={cx("checkBox")}
                        onChange={() => handleItemSelect(item)}
                      />
                    </div>
                    <div className={cx("item-details-container")}>
                      <div className={cx("item-image-container")}>
                        <img
                          src={`https://${item.promotionImage}`}
                          alt="product"
                        />
                      </div>
                      <div className={cx("item-name")}>
                        <h3>{item.productName}</h3>
                      </div>
                      <div className={cx("item-variations")}>
                        {item.type1 && item.type1 !== "undefined" && (
                          <button>
                            <div>
                              {item.type1 &&
                                item.value1 &&
                                item.value1 !== "undefined" && (
                                  <h3>{`${item.type1}: ${item.value1}`}</h3>
                                )}
                              {item.type2 &&
                                item.value2 &&
                                item.value2 !== "undefined" && (
                                  <h3>{`${item.type2}: ${item.value2}`}</h3>
                                )}
                              {!item.type1 && <h3>No variations</h3>}
                            </div>
                            <img
                              src={dropdownIcon}
                              alt="change option button"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={cx("unit-price-container")}>
                      <h3>
                        <CurrencyFormat number={item.price} />
                      </h3>
                    </div>
                    <div className={cx("quantity-container")}>
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(
                              item.productId,
                              item.value1,
                              item.value2,
                              item.quantity - 1
                            );
                          } else {
                            // Hiển thị thông báo xác nhận xóa nếu người dùng cập nhật từ 1 -> 0
                            confirmDeleteItem(
                              item.productId,
                              item.value1,
                              item.value2
                            );
                          }
                        }}
                      >
                        <img src={minusIcon} alt="minus quantity" />
                      </button>
                      <input
                        type="number"
                        value={
                          item.optionId === selectedItem.id
                            ? selectedItem.quantity
                            : item.quantity
                        }
                        onFocus={() =>
                          setSelectedItem({
                            id: item.optionId,
                            quantity: item.quantity,
                          })
                        }
                        onChange={(e) =>
                          setSelectedItem({
                            id: item.optionId,
                            quantity: e.target.value,
                          })
                        }
                        onBlur={() => {
                          if (item.quantity !== selectedItem.quantity) {
                            if (selectedItem.quantity >= 1) {
                              updateQuantity(
                                item.productId,
                                item.value1,
                                item.value2,
                                selectedItem.quantity
                              );
                            } else {
                              confirmDeleteItem(
                                item.productId,
                                item.value1,
                                item.value2
                              );
                            }
                          }
                          setSelectedItem({ id: "", quantity: 0 });
                        }}
                        min={1}
                      />

                      <span
                        className={cx({ "only-ten-left": item.inStock <= 10 })}
                      >
                        Available: {item.inStock || 0}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.value1,
                            item.value2,
                            item.quantity + 1
                          )
                        }
                      >
                        <img src={plusIcon} alt="plus quantity" />
                      </button>
                    </div>
                    <div className={cx("total-price-container")}>
                      <h3>
                        <CurrencyFormat number={item.price * item.quantity} />
                      </h3>
                    </div>
                    <div className={cx("actions-container")}>
                      <button
                        onClick={() =>
                          confirmDeleteItem(
                            item.productId,
                            item.value1,
                            item.value2
                          )
                        }
                      >
                        <img src={deleteIcon} alt="delete icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
      {listSelectedItems.length > 0 && (
        <div className={cx("selected-items-container")}>
          <div className={cx("selected-items")}>
            <div>
              <h3>Selected Product</h3>
              <span>{listSelectedItems.length + " items"}</span>
            </div>
            <div className={cx("list-selected-item-container")}>
              {listSelectedItems.map((item) => (
                <div className={cx("item-information")} key={item.optionId}>
                  <img src={"https://" + item.promotionImage} alt={item.name} />
                  <div className={cx("price-selected-item")}>
                    <div>
                      <h3 className={cx("product-name")}>{item.name}</h3>
                      {(item.value1 || item.value2) && (
                        <h4 className={cx("product-options")}>
                          {item.value1 && item.value2
                            ? `${item.value1} | ${item.value2}`
                            : item.value1 || item.value2}
                        </h4>
                      )}
                      <h4 className={cx("product-price")}>
                        <CurrencyFormat number={item.price} />
                        <span>&nbsp;&nbsp;x&nbsp;&nbsp;</span>
                        <span>{item.quantity}</span>
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={cx("subtotal-selected-items")}>
              <span>Subtotal</span>
              <CurrencyFormat number={subtotal} />
            </div>
            <div className={cx("subtotal-selected-items")}>
              <span>Shipping Fee</span>
              <CurrencyFormat number={shippingFee} />
            </div>
            <div className={cx("total-selected-items")}>
              <h3>Total</h3>
              <CurrencyFormat number={subtotal + shippingFee} />
            </div>
            <button className={cx("checkout-button")} onClick={handleCheckout}>
              Check Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
