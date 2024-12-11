import logo from "../../assets/images/logo.png";
// import userImage from "../../assets/images/image.jpg";
import profileIcon from "../../assets/icons/user.svg";
import orderIcon from "../../assets/icons/order.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import defaultAvt from "../../assets/images/defaultavt.png";
import cartIcon from "../../assets/icons/actionsbar/cart.svg";
import chatIcon from "../../assets/icons/actionsbar/chat.svg";
import notificationIcon from "../../assets/icons/actionsbar/bell.svg";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext/authContext";
import { useUser } from "../../contexts/userContext/userContext";
import classNames from "classnames/bind";
import styles from "./Header.module.scss";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import CurrencyFormat from "../General/CurrencyFormat/index";
import { Link } from "react-router-dom";
import { ReactComponent as SearchIcon } from "../../assets/icons/search.svg";

const cx = classNames.bind(styles);

const Header = () => {
  const { refreshToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const [cartProducts, setCartProducts] = useState([]);
  const [cartCount, setCartCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get("http://localhost:3001/auth/logout");
      if (res.status === 200) {
        Cookies.remove("AT");
        Cookies.remove("RT");
        clearUser();
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchCartProducts();
  }, []);
  const fetchCartProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/cart/recentAdded", {
        withCredentials: true,
      });

      if (res.data && typeof res.data === "object") {
        setCartProducts(res.data.recentItems || []);
        setCartCount(res.data.numberOfItems || 0);
      } else {
        setCartProducts([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart products:", error);
      setCartProducts([]);
      setCartCount(0);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <div className={cx("header-container")}>
      <div className={cx("logo-brand")}>
        <a href="/">
          <img alt="logo brand" src={logo} height="50px" />
        </a>
      </div>
      <form onSubmit={handleSearch} className={cx("search-form")}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className={cx("search-input")}
        />
        <button type="submit" className={cx("search-button")}>
          <SearchIcon />
        </button>
      </form>
      <div className={cx("profile-container")}>
        {refreshToken ? (
          <>
            <div className={cx("action-bar")}>
              <div>
                <button>
                  <img src={notificationIcon} alt="notification button" />
                </button>
              </div>
              <div>
                <button>
                  <img src={chatIcon} alt="chat button" />
                </button>
              </div>
              <div>
                <button className={cx("cart-button")}>
                  <img src={cartIcon} alt="cart button" />
                  <span className={cx("cart-badge")}>{cartCount || 0}</span>
                  <div className={cx("cart-drop-down-list")}>
                    <div className={cx("transparent-background")}></div>
                    <div className={cx("cart-main-table")}>
                      <div className={cx("cart-table-heading")}>
                        <h3>Products added recently</h3>
                      </div>
                      <div className={cx("cart-table-products")}>
                        {!cartCount || cartCount === 0 ? (
                          <>
                            <h1>Empty</h1>
                          </>
                        ) : (
                          <>
                            {cartProducts.map((cartItem) => (
                              <Link
                                to={`/product/${cartItem.productId}`}
                                className={cx("link-product")}
                              >
                                <div className={cx("cart-product-details")}>
                                  <div
                                    className={cx(
                                      "cart-product-details-image-container"
                                    )}
                                  >
                                    <img
                                      src={"https://" + cartItem.promotionImage}
                                      alt="promotion"
                                    />
                                  </div>
                                  <div
                                    className={cx(
                                      "cart-product-details-name-container"
                                    )}
                                  >
                                    <h2>{cartItem.productName}</h2>
                                    <h3>
                                      {cartItem.value1
                                        ? cartItem.value2
                                          ? cartItem.value1 +
                                            " | " +
                                            cartItem.value2
                                          : cartItem.value1
                                        : ""}
                                    </h3>
                                  </div>
                                  <div
                                    className={cx(
                                      "cart-product-details-price-container"
                                    )}
                                  >
                                    <h3>
                                      <CurrencyFormat number={cartItem.price} />
                                    </h3>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                      <Link to="/cart" className={cx("cart-view-more-link")}>
                        View More
                        {cartCount > 5 ? (
                          <span>{`(${cartCount - 5})`}</span>
                        ) : (
                          <span>(0)</span>
                        )}
                      </Link>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className={cx("profile")}>
              {user && user.avtUrl ? (
                <div className={cx("profile-image-container")}>
                  <img
                    alt="profile"
                    src={user.avtUrl}
                    className={cx("profile-image")}
                  />
                </div>
              ) : (
                <div className={cx("profile-image-container")}>
                  <img
                    alt="default avt"
                    src={defaultAvt}
                    className={cx("profile-image")}
                  />
                </div>
              )}
              <div className={cx("profile-dropdown")} id="profile-dropdown">
                <div className={cx("transparent-background")}></div>
                <div className={cx("black-background")}>
                  <div className={cx("avatar-container")}>
                    {user && user.avtUrl ? (
                      <img alt="user avatar" src={user.avtUrl} />
                    ) : (
                      <img alt="default user avatar" src={defaultAvt} />
                    )}
                  </div>
                </div>
                <div className={cx("profile-details")}>
                  {user && user.name ? (
                    <h1>{user.name}</h1>
                  ) : (
                    <h1>Unknown Name</h1>
                  )}
                  {user && user.username ? (
                    <h1>{user.username}</h1>
                  ) : (
                    <h1>Unknown Username</h1>
                  )}
                </div>
                <a href="/profile">
                  <img alt="profile Icon" src={profileIcon} />
                  <h1>Profile</h1>
                </a>
                <a href="/orders">
                  <img alt="order Icon" src={orderIcon} />
                  <h1>Order</h1>
                </a>
                <a href="/" onClick={(e) => handleLogout(e)}>
                  <img alt="logout Icon" src={logoutIcon} />
                  <h1>Logout</h1>
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
