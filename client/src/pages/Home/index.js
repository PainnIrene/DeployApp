import { useEffect, useState } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";
import Card from "../../components/General/Card";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Pagination from "../../components/Pagination";

const cx = classNames.bind(styles);

function Home() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsPerPage = 10;
  const [currentBanner, setCurrentBanner] = useState(0);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    adaptiveHeight: true,
  };

  const fetchProducts = async (page) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:3002/product/offer?page=${page}&limit=${productsPerPage}`,
        { withCredentials: true }
      );
      // Sửa lại phần này để lấy đúng dữ liệu từ response
      setProducts(response.data || []); // Vì server trả về trực tiếp mảng publishedProducts
      setTotalPages(Math.ceil(response.data.length / productsPerPage));
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const banners = [
    "/images/banners/banner1.png",
    "/images/banners/banner2.png",
    "/images/banners/banner3.png",
  ];
  const categories = [
    "/images/categories/book.png",
    "/images/categories/ipad.jpeg",
    "/images/categories/iphone.webp",
    "/images/categories/pan.jpg",
    "/images/categories/shirt.jpg",
    "/images/categories/sneaker.jpeg",
    "/images/categories/toys.webp",
  ];
  // Auto change banner every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className={cx("home-container")}>
      <div className={cx("banner-section")}>
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner}
            alt={`Promotion banner ${index + 1}`}
            className={cx("banner-image", { active: currentBanner === index })}
          />
        ))}

        <button className={cx("banner-btn", "prev")} onClick={prevBanner}>
          ‹
        </button>
        <button className={cx("banner-btn", "next")} onClick={nextBanner}>
          ›
        </button>

        <div className={cx("banner-dots")}>
          {banners.map((_, index) => (
            <span
              key={index}
              className={cx("dot", { active: currentBanner === index })}
              onClick={() => setCurrentBanner(index)}
            />
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className={cx("categories-section")}>
        <h2>Shop by Category</h2>
        <div className={cx("categories-grid")}>
          <div className={cx("category-item")}>
            <img src="/images/categories/book.png" alt="Category 1" />
            <span>Books</span>
          </div>

          <div className={cx("category-item")}>
            <img src="/images/categories/ipad.jpeg" alt="Category 1" />
            <span>Tablets</span>
          </div>

          <div className={cx("category-item")}>
            <img src="/images/categories/iphone.webp" alt="Category 1" />
            <span>Phones</span>
          </div>

          <div className={cx("category-item")}>
            <img src="/images/categories/pan.jpg" alt="Category 1" />
            <span>Pans</span>
          </div>

          <div className={cx("category-item")}>
            <img src="/images/categories/shirt.jpg" alt="Category 1" />
            <span>Shirts</span>
          </div>

          <div className={cx("category-item")}>
            <img src="/images/categories/sneaker.jpeg" alt="Category 1" />
            <span>Sneakers</span>
          </div>

          <div className={cx("category-item")}>
            <img src="/images/categories/toys.webp" alt="Category 1" />
            <span>Toys</span>
          </div>
        </div>
      </div>

      {/* Best Offers Section */}
      <div className={cx("best-offers-section")}>
        <h1 className={cx("best-offer-title")}>Best Offers Today</h1>
        <div className={cx("best-offer-product")}>
          {products.length > 0 &&
            products.map((product) => (
              <Card key={product._id} product={product} />
            ))}
        </div>
      </div>

      {/* Pagination */}
      <div className={cx("pagination-container")}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default Home;
