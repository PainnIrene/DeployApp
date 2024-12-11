import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Restock.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

function Restock({ product, setShowRestock, setIsReload }) {
  const [updatedProduct, setUpdatedProduct] = useState(() =>
    JSON.parse(JSON.stringify(product))
  );
  const [globalInputs, setGlobalInputs] = useState({
    inStock: "",
    price: "",
    SKU: "",
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const handleInputChange = (index, field, value) => {
    const newOptions = [...updatedProduct.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]:
        field === "price"
          ? parseFloat(value)
          : field === "inStock"
          ? parseInt(value, 10)
          : value,
    };
    setUpdatedProduct({ ...updatedProduct, options: newOptions });
  };
  // console.log(product);
  // console.log("Update Product", updatedProduct);
  const handleGlobalInputChange = (field, value) => {
    setGlobalInputs({ ...globalInputs, [field]: value });
  };

  const applyToAll = () => {
    if (
      globalInputs.inStock === "" &&
      globalInputs.price === "" &&
      globalInputs.SKU === ""
    ) {
      alert("Please enter at least one value to apply.");
      return;
    }

    const newOptions = updatedProduct.options.map((option) => ({
      ...option,
      inStock:
        globalInputs.inStock !== ""
          ? parseInt(globalInputs.inStock, 10)
          : option.inStock,
      price:
        globalInputs.price !== ""
          ? parseFloat(globalInputs.price)
          : option.price,
      SKU: globalInputs.SKU !== "" ? globalInputs.SKU : option.SKU,
    }));

    setUpdatedProduct({ ...updatedProduct, options: newOptions });
  };

  const handleSubmit = async () => {
    const hasChanges =
      JSON.stringify(product.options) !==
      JSON.stringify(updatedProduct.options);

    if (!hasChanges) {
      alert("No changes detected. Please make changes before restocking.");
      return;
    }

    console.log(updatedProduct);

    try {
      await axios.patch(
        `http://localhost:3002/product/${updatedProduct._id}/restock`,
        {
          options: updatedProduct.options,
        },
        {
          withCredentials: true,
        }
      );
      alert("Product restocked successfully");
      setIsReload((prev) => !prev);
      setShowRestock(false);
    } catch (error) {
      console.error("Error restocking product:", error);
      alert("Failed to restock product");
    }
  };

  return (
    <div className={cx("container-mask")}>
      <div className={cx("container")}>
        <div className={cx("heading-container")}>
          <h1 className={cx("title")}>Restock Product</h1>
          <button
            className={cx("exitButton")}
            onClick={() => setShowRestock(false)}
          >
            X
          </button>
        </div>
        <div className={cx("main-contents")}>
          <table className={cx("table-restock")}>
            <thead>
              <tr>
                <th>Promotion Image</th>
                <th>Product Name</th>
                <th>Options</th>
                <th>In Stock</th>
                <th>Price</th>
                <th>SKU</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className={cx("button-container")}>
                    <button
                      className={cx("apply-to-all-button")}
                      onClick={applyToAll}
                    >
                      Apply to All
                    </button>
                  </div>
                </td>
                <td></td>
                <td></td>
                <td>
                  <div className={cx("row-container")}>
                    <input
                      type="number"
                      value={globalInputs.inStock}
                      onChange={(e) =>
                        handleGlobalInputChange("inStock", e.target.value)
                      }
                      placeholder="In Stock"
                    />
                  </div>
                </td>
                <td>
                  <div className={cx("row-container")}>
                    <input
                      type="number"
                      value={globalInputs.price}
                      onChange={(e) =>
                        handleGlobalInputChange("price", e.target.value)
                      }
                      placeholder="Price"
                    />
                  </div>
                </td>
                <td>
                  <div className={cx("row-container")}>
                    <input
                      type="text"
                      value={globalInputs.SKU}
                      onChange={(e) =>
                        handleGlobalInputChange("SKU", e.target.value)
                      }
                      placeholder="SKU"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    className={cx({
                      "promotion-container-3-4": updatedProduct.ratio === "3:4",
                      "promotion-container-1-1": updatedProduct.ratio !== "3:4",
                    })}
                  >
                    {updatedProduct.promotionImage !== "" && (
                      <img
                        src={`https://${updatedProduct.promotionImage}`}
                        alt={updatedProduct.name}
                      />
                    )}
                  </div>
                </td>
                <td>{updatedProduct.name}</td>
                <td>
                  {updatedProduct.options.length > 1 ? (
                    updatedProduct.options.map((option, index) => (
                      <div key={index} className={cx("row-container")}>
                        <h3>{option.value1 + " | " + option.value2}</h3>
                      </div>
                    ))
                  ) : (
                    <div>No options</div>
                  )}
                </td>
                <td>
                  {updatedProduct.options.map((option, index) => (
                    <div key={index} className={cx("row-container")}>
                      <input
                        type="number"
                        value={option.inStock}
                        onChange={(e) =>
                          handleInputChange(index, "inStock", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </td>
                <td>
                  {updatedProduct.options.map((option, index) => (
                    <div key={index} className={cx("row-container")}>
                      <input
                        type="number"
                        value={option.price}
                        onChange={(e) =>
                          handleInputChange(index, "price", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </td>
                <td>
                  {updatedProduct.options.map((option, index) => (
                    <div key={index} className={cx("row-container")}>
                      <input
                        type="text"
                        value={option.SKU}
                        onChange={(e) =>
                          handleInputChange(index, "SKU", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
          <button className={cx("updateButton")} onClick={handleSubmit}>
            Restock
          </button>
        </div>
      </div>
    </div>
  );
}

export default Restock;
