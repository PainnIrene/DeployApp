import classNames from "classnames/bind";
import styles from "./HiddenProducts.module.scss";
import axios from "axios";
import { useEffect, useState } from "react";
import defaultSortIcon from "../../../assets/icons/SortAndFilter/defaultSort.svg";
import sortAZIcon from "../../../assets/icons/SortAndFilter/sort-a-z.svg";
import sortZAIcon from "../../../assets/icons/SortAndFilter/sort-z-a.svg";
import sort01Icon from "../../../assets/icons/SortAndFilter/sort-0-1.svg";
import sort10Icon from "../../../assets/icons/SortAndFilter/sort-1-0.svg";
import editIcon from "../../../assets/icons/product/edit.svg";
import hideIcon from "../../../assets/icons/product/hide.svg";
import publishedIcon from "../../../assets/icons/product/eye.svg";
import violationIcon from "../../../assets/icons/product/x.svg";
import unpublishedIcon from "../../../assets/icons/product/loader.svg";
import reconsideration from "../../../assets/icons/product/reconsideration.svg";

import Pagination from "../../Pagination/index";
const cx = classNames.bind(styles);

function ViolationProducts() {
  const [sortState, setSortState] = useState({
    orderKey: null,
    orderType: null,
  });

  const [products, setProducts] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [tab, setTab] = useState("Violation");
  const fetchProducts = async (orderKey, orderType) => {
    try {
      const response = await axios.get("http://localhost:3002/product/all", {
        params: {
          orderKey: orderKey,
          orderType: orderType,
          pageIndex: pageIndex,
          pageSize: pageSize,
          tab: tab,
        },
        withCredentials: true,
      });
      if (response.status === 200) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      } else {
        console.error("Unexpected status code:", response.status);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts(sortState.orderKey, sortState.orderType);
  }, [sortState, pageIndex, pageSize]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (sortState.orderKey) {
      params.set("orderKey", sortState.orderKey);
      params.set("orderType", sortState.orderType);
    } else {
      params.delete("orderKey");
      params.delete("orderType");
    }
    window.history.replaceState(null, "", "?" + params.toString());
  }, [sortState]);

  const handleSortClick = (key) => {
    setSortState((prevState) => {
      let newOrderType = null;
      if (prevState.orderKey === key) {
        if (prevState.orderType === null) newOrderType = "asc";
        else if (prevState.orderType === "asc") newOrderType = "dsc";
        else newOrderType = null;
      } else {
        newOrderType = "asc";
      }

      return {
        orderKey: newOrderType ? key : null,
        orderType: newOrderType,
      };
    });
  };

  const handleReconsideration = async (productId) => {
    try {
      const response = await axios.post(
        "http://localhost:3002/product/reconsideration",
        {
          _id: productId,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        fetchProducts(sortState.orderKey, sortState.orderType);
      }
    } catch (error) {
      console.error("Error requesting reconsideration:", error);
    }
  };

  return (
    <div>
      <table className={cx("table")}>
        <thead>
          <tr>
            <td>
              <span className={cx("table-head")}>Status</span>
            </td>
            <td>
              <span className={cx("table-head")}>Promotion Image</span>
            </td>
            <td>
              <button onClick={() => handleSortClick("name")}>
                <span className={cx("table-head")}>Product Name</span>
                <img
                  src={
                    sortState.orderKey === "name" &&
                    sortState.orderType === "asc"
                      ? sortAZIcon
                      : sortState.orderKey === "name" &&
                        sortState.orderType === "dsc"
                      ? sortZAIcon
                      : defaultSortIcon
                  }
                  alt="sort icon"
                />
              </button>
            </td>
            <td>
              <button onClick={() => handleSortClick("sale")}>
                <span className={cx("table-head")}>Sales</span>
                <img
                  src={
                    sortState.orderKey === "sale" &&
                    sortState.orderType === "asc"
                      ? sort01Icon
                      : sortState.orderKey === "sale" &&
                        sortState.orderType === "dsc"
                      ? sort10Icon
                      : defaultSortIcon
                  }
                  alt="sort icon"
                />
              </button>
            </td>
            {products.some((product) => product.options.length > 1) && (
              <td>
                <span className={cx("table-head")}>Options</span>
              </td>
            )}
            <td>
              <button onClick={() => handleSortClick("stock")}>
                <span className={cx("table-head")}>In Stock</span>
                <img
                  src={
                    sortState.orderKey === "stock" &&
                    sortState.orderType === "asc"
                      ? sort01Icon
                      : sortState.orderKey === "stock" &&
                        sortState.orderType === "dsc"
                      ? sort10Icon
                      : defaultSortIcon
                  }
                  alt="sort icon"
                />
              </button>
            </td>
            <td>
              <button onClick={() => handleSortClick("price")}>
                <span className={cx("table-head")}>Price</span>
                <img
                  src={
                    sortState.orderKey === "price" &&
                    sortState.orderType === "asc"
                      ? sort01Icon
                      : sortState.orderKey === "price" &&
                        sortState.orderType === "dsc"
                      ? sort10Icon
                      : defaultSortIcon
                  }
                  alt="sort icon"
                />
              </button>
            </td>

            <td>
              <span className={cx("table-head")}>SKU</span>
            </td>
            <td>
              <span className={cx("table-head")}>Actions</span>
            </td>
          </tr>
        </thead>
        <tbody>
          {products &&
            products.map((product) => (
              <tr key={product._id}>
                <td>
                  <div
                    className={cx({
                      "status-unpublished": product.status === "Unpublished",
                      "status-violation": product.status === "Violation",
                      "status-published": product.status === "Published",
                      "status-hidden": product.status === "Hidden",
                    })}
                  >
                    {product.status === "Unpublished" && (
                      <img src={unpublishedIcon} alt="unpublished icon" />
                    )}
                    {product.status === "Violation" && (
                      <img src={violationIcon} alt="Violation icon" />
                    )}
                    {product.status === "Published" && (
                      <img src={publishedIcon} alt="published icon" />
                    )}
                    {product.status === "Hidden" && (
                      <img src={hideIcon} alt="hidden icon" />
                    )}
                    <span>{product.status}</span>
                  </div>
                </td>
                <td>
                  <div
                    className={cx({
                      "promotion-container-3-4": product.ratio === "3:4",
                      "promotion-container-1-1": product.ratio !== "3:4",
                    })}
                  >
                    {product.promotionImage !== "" && (
                      <img
                        src={`https://${product.promotionImage}`}
                        alt={product.name}
                      />
                    )}
                  </div>
                </td>
                <td>{product.name}</td>
                {product.options.length === 1 &&
                  product.options[0].type2 === "undefined" && (
                    <>
                      <td>SALE</td>
                      {products.some(
                        (product) => product.options.length > 1
                      ) && <td></td>}
                      <td>{product.options[0].inStock}</td>
                      <td>{product.options[0].price}</td>
                      <td>{product.options[0].SKU}</td>
                      <td>
                        <div className={cx("action-buttons")}>
                          <button
                            onClick={() => handleReconsideration(product._id)}
                          >
                            <img
                              src={reconsideration}
                              alt="Reconsideration Icon"
                            />
                            <span>Reconsider</span>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                {product.options.length > 1 && (
                  <>
                    <td>SALE</td>
                    <td>
                      {product.options.map((option) => (
                        <div className={cx("div-row")}>
                          {option.value1 + " | " + option.value2}
                        </div>
                      ))}
                    </td>
                    <td>
                      {product.options.map((option) => (
                        <div className={cx("div-row")}>{option.inStock}</div>
                      ))}
                    </td>
                    <td>
                      {product.options.map((option) => (
                        <div className={cx("div-row")}>{option.price}</div>
                      ))}
                    </td>
                    <td>
                      {product.options.map((option) => (
                        <div className={cx("div-row")}>{option.SKU}</div>
                      ))}
                    </td>
                  </>
                )}
              </tr>
            ))}
        </tbody>
      </table>
      <div className={cx("page-size-container")}>
        <label htmlFor="pageSize">Product Display</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <Pagination
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        totalPages={totalPages}
      />
    </div>
  );
}

export default ViolationProducts;
