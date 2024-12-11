import classNames from "classnames/bind";
import styles from "./ProductDetails.module.scss";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Rating from "../../components/General/Rating/index";
import ShopInformation from "../../components/Shop/ShopInformation/index";
import ShopImage from "../../components/Shop/ShopImage/index";
import axios from "axios";
import plusIcon from "../../assets/icons/product/plus.svg";
import minusIcon from "../../assets/icons/product/minus.svg";
import CurrencyFormat from "../../components/General/CurrencyFormat/index";
import Swal from "sweetalert2";
const cx = classNames.bind(styles);

function ProductDetails() {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState("");
  const [selectedProductImage, setSelectedProductImage] = useState(null);
  const [product, setProduct] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [selectedValue1, setSelectedValue1] = useState("");
  const [selectedValue2, setSelectedValue2] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [typeOfProduct, setTypeOfProduct] = useState(null); //0 variation 1 variation 2 variations
  const [selectedOption, setSelectedOption] = useState(null);
  const [productRating, setProductRating] = useState({
    averageRating: 0,
    totalRatings: 0,
    distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });
  const [productRatings, setProductRatings] = useState([]);

  const visibleThumbnails = 5;
  useEffect(() => {
    if (!product || !product.options) return;
    let option = null;

    if (typeOfProduct === 0 && product.options.length === 1) {
      option = product.options[0];
    } else if (typeOfProduct === 1 && selectedValue1) {
      option =
        product.options.find((opt) => opt.value1 === selectedValue1) || null;
    } else if (typeOfProduct === 2 && selectedValue1 && selectedValue2) {
      option =
        product.options.find(
          (opt) =>
            opt.value1 === selectedValue1 && opt.value2 === selectedValue2
        ) || null;
    }

    setSelectedOption(option);
  }, [typeOfProduct, selectedValue1, selectedValue2, product]);

  const handleNext = useCallback(() => {
    if (
      product &&
      product.images &&
      startIndex + visibleThumbnails < product.images.length
    ) {
      setStartIndex((prevIndex) => prevIndex + 1);
    }
  }, [product, startIndex, visibleThumbnails]);

  const handlePrev = useCallback(() => {
    if (startIndex > 0) {
      setStartIndex((prevIndex) => prevIndex - 1);
    }
  }, [startIndex]);

  useEffect(() => {
    getProductInformation();
  }, [id]);

  useEffect(() => {
    if (!product || !product.options) return;

    const { options, promotionImage } = product;
    if (options.length === 1) {
      setTypeOfProduct(0);
      setSelectedProductImage(product.promotionImage);
    } else if (!options[0].type2) {
      setTypeOfProduct(1);
    } else if (options[0].type1 && options[0].type2) {
      setTypeOfProduct(2);
    }
    if (promotionImage) {
      setCurrentImage(promotionImage);
    }
  }, [product]);

  const getProductInformation = async () => {
    try {
      // setLoading(true);
      const response = await axios.get(`http://localhost:3002/product/${id}`);
      setProduct(response.data);
      // setLoading(false);
    } catch (err) {
      // setError('Có lỗi xảy ra khi lấy thông tin sản phẩm');
      // setLoading(false);
      console.error("Lỗi khi lấy thông tin sản phẩm:", err);
    }
  };
  const handleAddToCartButton = async () => {
    if (selectedOption === null) {
      Swal.fire({
        icon: "warning",
        text: "Please choose product option to add to cart",
      });
    } else if (selectedOption && quantity >= 1 && product._id) {
      try {
        const response = await axios.post(
          "http://localhost:3001/cart/add",
          {
            productId: product._id,
            quantity,
            value1: selectedOption.value1,
            value2: selectedOption.value2,
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            text: "Add Product Successful",
            timer: 1000,
          });
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || "Failed to add product to cart";
        Swal.fire({
          icon: "error",
          text: errorMessage,
        });
        console.error("Error adding product to cart:", error);
      }
    }
  };

  const getProductRatings = async () => {
    try {
      // Lấy thông tin tổng quan về rating
      const summaryResponse = await axios.get(
        `http://localhost:3002/rating/product/${id}`
      );
      setProductRating(summaryResponse.data);

      // Lấy chi tiết các rating
      const detailsResponse = await axios.get(
        `http://localhost:3002/rating/details/${id}`
      );
      setProductRatings(detailsResponse.data.ratings);
    } catch (error) {
      console.error("Error fetching product ratings:", error);
    }
  };

  useEffect(() => {
    if (id) {
      getProductRatings();
    }
  }, [id]);

  return (
    <div className={cx("main-container")}>
      <div className={cx("product-details-container")}>
        <div className={cx("product-information")}>
          <div className={cx("product-image-container")}>
            <div className={cx("current-display-image-container")}>
              {currentImage && (
                <img src={"https://" + currentImage} alt="product" />
              )}
            </div>
            <div className={cx("thumbnails-container")}>
              <button
                className={cx("thumbnail-prev-button", "thumbnail-buttons", {
                  "hidden-button": startIndex === 0,
                })}
                onClick={handlePrev}
                disabled={startIndex === 0}
              >
                &#9664;
              </button>
              <div className={cx("thumbnail-actions")}>
                {product &&
                  product.images &&
                  product.images.length > 0 &&
                  product.images
                    .slice(startIndex, startIndex + visibleThumbnails)
                    .map((image, index) => (
                      <img
                        key={index}
                        src={"https://" + image}
                        alt={`Thumbnail ${index}`}
                        className={cx({
                          "selected-thumbnail": currentImage === image,
                        })}
                        onMouseEnter={() => setCurrentImage(image)}
                      />
                    ))}
              </div>
              <button
                className={cx("thumbnail-next-button", "thumbnail-buttons", {
                  "hidden-button":
                    product &&
                    product.images &&
                    startIndex + visibleThumbnails >= product.images.length,
                })}
                onClick={handleNext}
                disabled={
                  product &&
                  product.images &&
                  startIndex + visibleThumbnails >= product.images.length
                }
              >
                &#9654;
              </button>
            </div>
          </div>
          <div className={cx("middle-container")}>
            <div className={cx("product-details-information")}>
              <div className={cx("details-name-container")}>
                {/* <h1>{product.name}</h1> */}
                {product && product.name && <h1>{product.name}</h1>}
              </div>
              <div className={cx("details-statistics-container")}>
                <div className={cx("rating-wrapper")}>
                  <Rating stars={productRating.averageRating} size={"24px"} />
                  <h3>{Number(productRating.averageRating).toFixed(1)}</h3>
                </div>

                <div className={cx("ratings-count")}>
                  <h3>
                    <strong>{productRating.totalRatings}</strong> Ratings
                  </h3>
                </div>
              </div>
              <div className={cx("details-price-container")}>
                {product &&
                product.minPrice &&
                product.maxPrice &&
                selectedOption &&
                selectedOption.price ? (
                  <h3>
                    <CurrencyFormat number={selectedOption.price} />
                  </h3>
                ) : (
                  <h3>
                    {product && product.minPrice && product.maxPrice && (
                      <>
                        <CurrencyFormat number={product.minPrice} />
                        <span>-</span>
                        <CurrencyFormat number={product.maxPrice} />
                      </>
                    )}
                  </h3>
                )}
              </div>
              <div className={cx("details-options-container")}>
                {/* Kiểm tra product có tồn tại và có thuộc tính options */}
                {product && product.options && (
                  <>
                    {/* have options */}
                    {product.options.length > 1 && (
                      <>
                        {product.options[0].type1 && (
                          <>
                            <section className={cx("options-section")}>
                              <h3 className={cx("title-options")}>
                                {product.options[0].type1}
                              </h3>
                              <div>
                                {Array.from(
                                  new Map(
                                    product.options.map((option) => [
                                      option.value1,
                                      option,
                                    ])
                                  ).values()
                                ).map((option, index) => (
                                  <button
                                    key={index}
                                    onMouseEnter={() =>
                                      setCurrentImage(option.image)
                                    }
                                    className={cx("options-button", {
                                      "selected-options":
                                        option.value1 === selectedValue1,
                                    })}
                                    onClick={() => {
                                      if (selectedValue1 === option.value1) {
                                        setSelectedValue1(null);
                                        setSelectedProductImage(null);
                                      } else {
                                        setSelectedValue1(option.value1);
                                        setSelectedProductImage(option.image);
                                      }
                                    }}
                                  >
                                    <img
                                      src={"https://" + option.image}
                                      alt={option.value1}
                                    />
                                    {option.value1}
                                  </button>
                                ))}
                              </div>
                            </section>
                          </>
                        )}
                        {product.options[0].type2 && (
                          <>
                            <section className={cx("options-section")}>
                              <h3 className={cx("title-options")}>
                                {product.options[0].type2}
                              </h3>
                              <div>
                                {[
                                  ...new Set(
                                    product.options.map(
                                      (option) => option.value2
                                    )
                                  ),
                                ].map((uniqueValue2, index) => (
                                  <button
                                    className={cx("options-button", {
                                      "selected-options":
                                        uniqueValue2 === selectedValue2,
                                    })}
                                    key={index}
                                    onClick={() => {
                                      if (selectedValue2 === uniqueValue2) {
                                        setSelectedValue2(null);
                                      } else {
                                        setSelectedValue2(uniqueValue2);
                                      }
                                    }}
                                  >
                                    {uniqueValue2}
                                  </button>
                                ))}
                              </div>
                            </section>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              <div className={cx("details-description-container")}>
                <div className={cx("description-header")}>
                  <h2>Product Description</h2>
                </div>
                <div className={cx("description-content")}>
                  {product && product.description ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    <p>No description available</p>
                  )}
                </div>
              </div>

              <div className={cx("details-ratings-container")}>
                <div className={cx("ratings-header")}>
                  <h2>Product Ratings</h2>
                  <div className={cx("ratings-summary")}>
                    <div className={cx("rating-average")}>
                      <span className={cx("rating-score")}>
                        {productRating.averageRating}
                      </span>
                      <Rating
                        stars={productRating.averageRating}
                        size={"24px"}
                      />
                      <span className={cx("total-ratings")}>
                        ({productRating.totalRatings} ratings)
                      </span>
                    </div>
                    <div className={cx("rating-bars")}>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className={cx("rating-bar-item")}>
                          <span>{star} stars</span>
                          <div className={cx("progress-bar")}>
                            <div
                              className={cx("progress")}
                              style={{
                                width: `${
                                  ((productRating.distribution[star] || 0) /
                                    (productRating.totalRatings || 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className={cx("rating-count")}>
                            {productRating.distribution[star] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={cx("ratings-list")}>
                  {productRatings.map((rating) => (
                    <div key={rating._id} className={cx("rating-item")}>
                      <div className={cx("user-info")}>
                        <img
                          src={"https://" + rating.user.avtUrl}
                          alt={rating.user.name}
                          className={cx("user-avatar")}
                        />
                        <div className={cx("user-details")}>
                          <h4>{rating.user.name}</h4>
                          <div className={cx("rating-info")}>
                            <Rating stars={rating.rating} size={"16px"} />
                            <span className={cx("rating-date")}>
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={cx("rating-content")}>
                        <p>{rating.comment}</p>
                      </div>

                      <div className={cx("rating-order-info")}>
                        <span>Order ID: {rating.orderId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={cx("right-sidebar-container")}>
          <div className={cx("right-sidebar")}>
            <div className={cx("about-shop")}>
              <ShopImage width={"100%"} height={"130px"} />
            </div>
            <div className={cx("product-actions")}>
              <h3 className={cx("selected-product-title")}>Selected Product</h3>
              <div className={cx("subtotal-product-image")}>
                {selectedProductImage && (
                  <img
                    src={"https://" + selectedProductImage}
                    alt="selected product option"
                  />
                )}

                <div className={cx("subtotal-product-options")}>
                  {selectedOption && selectedOption.price ? (
                    <>
                      <div className={cx("selected-product-info")}>
                        <h3 className={cx("product-name")}>{product.name}</h3>
                        {(selectedValue1 || selectedValue2) && (
                          <div className={cx("selected-variants")}>
                            {selectedValue1 && (
                              <span className={cx("variant")}>
                                {selectedValue1}
                              </span>
                            )}
                            {selectedValue2 && (
                              <>
                                <span className={cx("separator")}>|</span>
                                <span className={cx("variant")}>
                                  {selectedValue2}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        <div className={cx("price-quantity")}>
                          <CurrencyFormat number={selectedOption.price} />
                          <span className={cx("quantity-indicator")}>×</span>
                          <span>{quantity}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <h3 className={cx("no-selection")}>
                      No Product or Options Selected
                    </h3>
                  )}
                </div>
              </div>
              <h3 className={cx("quantity-title")}>Quantity</h3>
              <div className={cx("subtotal-product-quantity")}>
                <button
                  disabled={quantity === 1}
                  onClick={() => setQuantity((prev) => prev - 1)}
                >
                  <img src={minusIcon} alt="minus quantity" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = Math.max(Number(e.target.value), 1);
                    setQuantity(value);
                  }}
                  min={1}
                />
                <button onClick={() => setQuantity((prev) => prev + 1)}>
                  <img src={plusIcon} alt="plus quantity" />
                </button>
              </div>
              <h3 className={cx("subtotal-title")}>Sub Total</h3>
              {selectedOption && selectedOption.price ? (
                <h3 className={cx("subtotal-price")}>
                  <CurrencyFormat number={selectedOption.price * quantity} />
                </h3>
              ) : (
                <></>
              )}
              {/* <button className={cx("buy-now-button")}>Buy Now!</button> */}
              <button
                className={cx("add-to-cart-button")}
                onClick={handleAddToCartButton}
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
