import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Search.module.scss";
import Pagination from "../../components/Pagination";
import ProductCard from "../../components/General/Card";

const cx = classNames.bind(styles);

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const keyword = searchParams.get("keyword") || "";
  const pageIndex = parseInt(searchParams.get("page")) || 0;
  const orderKey = searchParams.get("orderKey") || "createdAt";
  const orderType = searchParams.get("orderType") || "desc";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const fetchProducts = async () => {
    try {
      console.log("Fetching products with params:", {
        keyword,
        pageIndex,
        orderKey,
        orderType,
        minPrice,
        maxPrice,
      });

      setLoading(true);
      const response = await axios.get("http://localhost:3002/product/search", {
        params: {
          keyword,
          pageIndex,
          orderKey,
          orderType,
          minPrice,
          maxPrice,
          pageSize: 12,
        },
      });

      console.log("Search response:", response.data);
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Search params changed:", {
      keyword,
      pageIndex,
      orderKey,
      orderType,
      minPrice,
      maxPrice,
    });
    fetchProducts();
  }, [keyword, pageIndex, orderKey, orderType, minPrice, maxPrice]);

  return (
    <div className={cx("search-page")}>
      <div className={cx("search-header")}>
        <h2>Search Results</h2>
        {keyword && <p>Showing results for "{keyword}"</p>}
      </div>

      <div className={cx("filter-section")}>
        <div className={cx("filter-row")}>
          <div className={cx("filter-group")}>
            <label>Sort by:</label>
            <select
              value={orderKey}
              onChange={(e) =>
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  orderKey: e.target.value,
                  page: "0",
                })
              }
            >
              <option value="createdAt">Latest</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div className={cx("filter-group")}>
            <label>Order:</label>
            <select
              value={orderType}
              onChange={(e) =>
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  orderType: e.target.value,
                  page: "0",
                })
              }
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>

          <div className={cx("price-filter")}>
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) =>
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  minPrice: e.target.value,
                  page: "0",
                })
              }
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) =>
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  maxPrice: e.target.value,
                  page: "0",
                })
              }
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className={cx("loading")}>
          <img src="/loading.svg" alt="Loading..." />
        </div>
      ) : products.length > 0 ? (
        <>
          <div className={cx("products-grid")}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <Pagination
            pageIndex={pageIndex}
            setPageIndex={(newPage) =>
              setSearchParams({
                ...Object.fromEntries(searchParams),
                page: newPage.toString(),
              })
            }
            totalPages={totalPages}
          />
        </>
      ) : (
        <div className={cx("no-results")}>
          No products found matching your criteria
        </div>
      )}
    </div>
  );
};

export default Search;
