import React from "react";
import styles from "./Pagination.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

function Pagination({ pageIndex, setPageIndex, totalPages }) {
  const handlePrevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (pageIndex < totalPages - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePageClick = (index) => {
    setPageIndex(index);
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const goToPage = parseInt(e.target.pageNumber.value, 10);
    if (goToPage > 0 && goToPage <= totalPages) {
      setPageIndex(goToPage - 1);
    }
  };

  const range = 2;
  const startPage = Math.max(1, pageIndex + 1 - range);
  const endPage = Math.min(totalPages, pageIndex + 1 + range);
  const pageNumbers = [];
  if (startPage > 1) {
    pageNumbers.push(1);
    if (startPage > 2) pageNumbers.push("...");
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  return (
    <div className={cx("pagination")}>
      <button
        onClick={handlePrevPage}
        disabled={pageIndex === 0}
        className={cx("prev-button", {
          "pagination-button-disabled": pageIndex === 0,
        })}
      >
        &lt; Prev
      </button>

      {pageNumbers.map((number, index) => (
        <button
          key={index}
          onClick={() => {
            if (number !== "...") handlePageClick(number - 1);
          }}
          className={cx("pagination-button", {
            "pagination-button-active": pageIndex === number - 1,
            "pagination-ellipsis": number === "...",
          })}
          disabled={number === "..."}
        >
          {number}
        </button>
      ))}

      <button
        onClick={handleNextPage}
        disabled={pageIndex === totalPages - 1}
        className={cx("next-button", {
          "pagination-button-disabled": pageIndex === totalPages - 1,
        })}
      >
        Next &gt;
      </button>

      <form onSubmit={handleGoToPage} className={cx("pagination-go-to")}>
        <input
          type="number"
          name="pageNumber"
          min="1"
          max={totalPages}
          defaultValue={pageIndex + 1}
          className={cx("pagination-input")}
        />
        <button type="submit" className={cx("pagination-button")}>
          Go
        </button>
      </form>
    </div>
  );
}

export default Pagination;
